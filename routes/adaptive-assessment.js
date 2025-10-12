const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const AdaptiveAssessmentEngine = require('../services/adaptive-assessment-engine');
const ConfidenceTracker = require('../services/confidence-tracker');
const DimensionMapper = require('../services/dimension-mapper');
const MultiStageCoordinator = require('../services/adaptive-selectors/multi-stage-coordinator');
const IntelligentQuestionSelector = require('../services/intelligent-question-selector');

// Question pool cache for performance optimization
const questionPoolCache = require('../services/question-pool-cache');
// NOTE: Cache is currently infrastructure-only. Future optimization would involve:
// 1. Refactoring stage selectors to accept pre-filtered arrays instead of Mongoose model
// 2. Using questionPoolCache.getQuestions() to pre-fetch all active questions
// 3. Filtering in-memory rather than via Mongoose queries
// This would reduce database load during adaptive selection significantly.

// Initialize adaptive engine (legacy - keep for backward compatibility)
const adaptiveEngine = new AdaptiveAssessmentEngine();

// Initialize comprehensive adaptive selector
const ComprehensiveAdaptiveSelector = require('../services/comprehensive-adaptive-selector');
const comprehensiveSelector = new ComprehensiveAdaptiveSelector();

// Initialize multi-stage coordinator
const multiStageCoordinator = new MultiStageCoordinator();

// Initialize intelligent question selector
const intelligentSelector = new IntelligentQuestionSelector();

// Get models
const Assessment = mongoose.model('AssessmentSession'); // Use AssessmentSession model with all new methods
const QuestionBank = mongoose.model('QuestionBank');

/**
 * Start adaptive assessment - Multi-Stage Version
 * POST /api/adaptive/start
 */
router.post('/start', async (req, res) => {
  try {
    const {
      tier = 'comprehensive',
      assessmentTier = 'COMPREHENSIVE', // NEW: CORE or COMPREHENSIVE
      demographics,
      concerns,
      userId,
      useMultiStage = true,
      useIntelligentSelector = true // CHANGED: Enable intelligent selector by default
    } = req.body;

    // Validate tier
    if (!['quick', 'standard', 'comprehensive', 'deep'].includes(tier)) {
      return res.status(400).json({
        error: 'Invalid tier. Must be quick, standard, comprehensive, or deep'
      });
    }

    // Validate assessmentTier
    if (!['CORE', 'COMPREHENSIVE'].includes(assessmentTier)) {
      return res.status(400).json({
        error: 'Invalid assessmentTier. Must be CORE or COMPREHENSIVE'
      });
    }

    // Create assessment session
    const sessionId = generateSessionId();
    const assessment = new Assessment({
      sessionId,
      userId: userId || 'anonymous',
      tier,
      assessmentTier, // NEW: Store assessment tier
      clinicalAddonConsent: false, // NEW: Default to no consent
      clinicalAddonPromptShown: false, // NEW: Haven't shown prompt yet
      mode: useIntelligentSelector ? 'adaptive-intelligent' : (useMultiStage ? 'adaptive-multistage' : 'adaptive'),
      startTime: new Date(),
      demographics,
      currentStage: 1, // Start at Stage 1
      confidenceState: new Map(),
      stageHistory: [],
      adaptiveMetadata: {
        tier,
        assessmentTier, // NEW: Store in metadata too
        totalQuestionLimit: assessmentTier === 'CORE' ? 30 : 70, // NEW: 30Q for CORE, 70Q for COMPREHENSIVE
        questionsAsked: 0,
        pathwaysActivated: [],
        branchingDecisions: [],
        currentPhase: useIntelligentSelector ? 'warmup' : 'stage1',
        concerns,
        useMultiStage,
        useIntelligentSelector,
        skipCount: 0,
        clinicalDepthTriggered: [],
        divergentFacets: []
      },
      responses: [],
      presentedQuestions: []
    });

    // Initialize Stage 1
    assessment.startStage(1);

    await assessment.save();

    // Get initial question(s) - use intelligent selector if enabled
    let result;
    let initialQuestions;

    if (useIntelligentSelector) {
      // Initialize confidence tracker for intelligent selection
      const tracker = new ConfidenceTracker();

      // Get first question using intelligent selector with tier filtering
      const firstQuestion = await intelligentSelector.selectNextQuestion(
        QuestionBank,
        [], // No responses yet
        [], // No asked questions yet
        tracker,
        assessmentTier, // NEW: Pass assessment tier for filtering
        false // NEW: No clinical consent yet (first question)
      );

      // Get phase info
      const currentPhase = intelligentSelector.determinePhase(0);
      const progressMessage = intelligentSelector.getProgressMessage(0, currentPhase, tracker);

      result = {
        question: firstQuestion,
        questions: [firstQuestion],
        phase: currentPhase.name,
        phaseMessage: progressMessage,
        confidenceSummary: tracker.getSummary()
      };

      initialQuestions = [{
        ...firstQuestion.toObject(),
        id: firstQuestion.questionId,
        category: firstQuestion.category,
        trait: firstQuestion.trait,
        facet: firstQuestion.facet,
        tags: firstQuestion.tags,
        instrument: firstQuestion.instrument,
        reverseScored: firstQuestion.reverseScored
      }];

      logger.info('Started intelligent adaptive assessment', {
        sessionId,
        tier,
        mode: 'intelligent',
        firstQuestion: firstQuestion.questionId,
        phase: currentPhase.name
      });
    } else {
      // Get Stage 1 questions using MultiStageCoordinator
      result = await multiStageCoordinator.getNextQuestions(assessment, QuestionBank);

      // Transform questions for frontend
      initialQuestions = result.questions.map(q => ({
        ...q.toObject(),
        id: q.questionId,
        category: q.category,
        trait: q.trait,
        facet: q.facet,
        tags: q.tags,
        instrument: q.instrument,
        reverseScored: q.reverseScored
      }));

      logger.info('Started multi-stage adaptive assessment', {
        sessionId,
        tier,
        stage: 1,
        initialQuestions: initialQuestions.length,
        totalTarget: 70
      });
    }

    // Send response with appropriate mode information
    const responseData = {
      success: true,
      sessionId,
      tier,
      mode: useIntelligentSelector ? 'intelligent' : 'multi-stage',
      totalQuestions: 70,
      currentBatch: initialQuestions,
      progress: {
        current: 0,
        total: 70,
        percentage: 0
      },
      confidence: result.confidenceSummary
    };

    // Add mode-specific fields
    if (useIntelligentSelector) {
      responseData.phase = result.phase;
      responseData.phaseMessage = result.phaseMessage;
      responseData.singleQuestionMode = true;
    } else {
      responseData.currentStage = 1;
      responseData.stageMessage = result.stageMessage;
      responseData.progressMessage = result.progressMessage;
      responseData.progress.stage = 1;
    }

    res.json(responseData);
  } catch (error) {
    logger.error('Failed to start adaptive assessment:', error);
    res.status(500).json({
      error: 'Failed to start assessment',
      message: error.message
    });
  }
});

/**
 * Update Clinical Add-On consent
 * POST /api/adaptive/clinical-consent
 *
 * Allows user to opt-in to clinical screening during assessment
 */
router.post('/clinical-consent', async (req, res) => {
  try {
    const { sessionId, consent } = req.body;

    // Validate input
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    if (typeof consent !== 'boolean') {
      return res.status(400).json({ error: 'consent must be a boolean value' });
    }

    // Find assessment
    const assessment = await Assessment.findOne({ sessionId });
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Check if assessment is COMPREHENSIVE tier
    if (assessment.assessmentTier !== 'COMPREHENSIVE') {
      return res.status(400).json({
        error: 'Clinical Add-On is only available for COMPREHENSIVE tier assessments'
      });
    }

    // Update consent status
    assessment.clinicalAddonConsent = consent;
    assessment.clinicalAddonPromptShown = true;

    if (consent) {
      assessment.clinicalAddonConsentTimestamp = new Date();
      logger.info('Clinical Add-On consent granted', {
        sessionId,
        timestamp: assessment.clinicalAddonConsentTimestamp
      });
    } else {
      logger.info('Clinical Add-On consent declined', { sessionId });
    }

    await assessment.save();

    res.json({
      success: true,
      sessionId,
      clinicalAddonConsent: consent,
      message: consent
        ? 'Clinical Add-On enabled. Full mental health screening questions will now be included.'
        : 'Clinical Add-On declined. Assessment will continue with personality and brief screeners only.'
    });
  } catch (error) {
    logger.error('Failed to update clinical consent:', error);
    res.status(500).json({
      error: 'Failed to update consent',
      message: error.message
    });
  }
});

/**
 * Get next question based on responses - Multi-Stage Version
 * POST /api/adaptive/next
 */
router.post('/next', async (req, res) => {
  try {
    const { sessionId, response, responses } = req.body;

    // Find assessment
    const assessment = await Assessment.findOne({ sessionId });
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Check if using multi-stage system or intelligent selector
    const useMultiStage = assessment.mode === 'adaptive-multistage' || assessment.adaptiveMetadata?.useMultiStage;
    const useIntelligentSelector = assessment.mode === 'adaptive-intelligent' || assessment.adaptiveMetadata?.useIntelligentSelector;

    // Initialize or restore confidence tracker
    // Convert Mongoose Map to plain object to avoid $ prefixed internal properties
    const confidencePlain = assessment.confidenceState
      ? Object.fromEntries(assessment.confidenceState)
      : {};
    const tracker = ConfidenceTracker.fromJSON({
      dimensions: confidencePlain
    });

    // Save responses - handle both single response and batch responses
    if (responses && Array.isArray(responses)) {
      // Batch submission - OPTIMIZE: Fetch all questions in one query to avoid N+1
      const questionIds = responses.map(r => r.questionId);
      const fullQuestions = await QuestionBank.find({ questionId: { $in: questionIds } });
      const questionMap = new Map(fullQuestions.map(q => [q.questionId, q]));

      for (const resp of responses) {
        // CRITICAL FIX: Attach full question data from DB to response object
        resp.question = questionMap.get(resp.questionId);

        // Frontend sends 'score' (already calculated) and 'answer' (label)
        // Use the pre-calculated score if available, otherwise convert answer to score
        let scoreValue;
        if (resp.score !== undefined && resp.score !== null) {
          scoreValue = resp.score;
        } else {
          const reverseScored = resp.question?.reverseScored || false;
          scoreValue = convertResponseToScore(resp.answer || resp.value, reverseScored);
        }

        assessment.responses.push({
          questionId: resp.questionId,
          value: resp.answer || resp.value,
          responseTime: resp.responseTime,
          category: resp.question?.category || resp.category,
          subcategory: resp.question?.subcategory || resp.subcategory,
          trait: resp.question?.trait || resp.trait,
          facet: resp.question?.facet || resp.facet,
          instrument: resp.question?.instrument || resp.instrument,
          tags: resp.question?.tags || resp.tags,
          score: scoreValue
        });

        // Track presented questions
        if (!assessment.presentedQuestions) assessment.presentedQuestions = [];
        assessment.presentedQuestions.push(resp.questionId);
        assessment.adaptiveMetadata.questionsAsked++;

        // Update confidence for this response
        // Use pre-fetched question from batch query (N+1 optimization)
        const fullQuestion = questionMap.get(resp.questionId);
        if (fullQuestion) {
          // Also add question text to stored response for later EF/sensory scoring
          const lastResponse = assessment.responses[assessment.responses.length - 1];
          if (lastResponse && !lastResponse.text) {
            lastResponse.text = fullQuestion.text;
            lastResponse.questionText = fullQuestion.questionText;
          }

          const dimensions = DimensionMapper.getDimensions(fullQuestion);
          for (const dim of dimensions) {
            tracker.updateConfidence(dim, {
              questionId: resp.questionId,
              score: scoreValue,
              timestamp: new Date()
            });
          }
        }
      }
      // Update questionsAnswered after batch processing
      assessment.questionsAnswered = assessment.responses.length;
    } else if (response) {
      // Single response submission
      // CRITICAL FIX: Fetch question metadata from DB to include facet data
      const fullQuestionForResponse = await QuestionBank.findOne({ questionId: response.questionId });

      // Use pre-calculated score if available, otherwise convert answer to score
      let scoreValue;
      if (response.score !== undefined && response.score !== null) {
        scoreValue = response.score;
      } else {
        const reverseScored = fullQuestionForResponse?.reverseScored || response.question?.reverseScored || false;
        scoreValue = convertResponseToScore(response.answer || response.value, reverseScored);
      }

      assessment.responses.push({
        questionId: response.questionId,
        value: response.answer || response.value,
        responseTime: response.responseTime,
        category: fullQuestionForResponse?.category || response.category,
        subcategory: fullQuestionForResponse?.subcategory || response.subcategory,
        traits: response.traits,
        trait: fullQuestionForResponse?.trait || response.trait,
        facet: fullQuestionForResponse?.facet || response.facet,
        tags: fullQuestionForResponse?.tags || response.tags,
        instrument: fullQuestionForResponse?.instrument || response.instrument,
        personalizationMarkers: response.markers,
        score: scoreValue
      });

      // Track presented questions
      if (!assessment.presentedQuestions) assessment.presentedQuestions = [];
      assessment.presentedQuestions.push(response.questionId);
      assessment.adaptiveMetadata.questionsAsked++;
      assessment.questionsAnswered = assessment.responses.length; // Update count

      // Update confidence for this response
      // IMPORTANT: Fetch full question from DB to get all metadata (tags, facet, etc.)
      const fullQuestion = await QuestionBank.findOne({ questionId: response.questionId });
      if (fullQuestion) {
        // Also add question text to stored response for later EF/sensory scoring
        const lastResponse = assessment.responses[assessment.responses.length - 1];
        if (lastResponse && !lastResponse.text) {
          lastResponse.text = fullQuestion.text;
          lastResponse.questionText = fullQuestion.questionText;
        }

        const dimensions = DimensionMapper.getDimensions(fullQuestion);
        for (const dim of dimensions) {
          tracker.updateConfidence(dim, {
            questionId: response.questionId,
            score: scoreValue,
            timestamp: new Date()
          });
        }
      }
    }

    // Save updated confidence state to assessment
    assessment.updateConfidenceState(tracker.toJSON().dimensions);

    // ENHANCED INTELLIGENCE: Process response through all intelligence systems
    if (useIntelligentSelector && assessment.responses.length > 0) {
      try {
        const lastResponse = assessment.responses[assessment.responses.length - 1];
        const responseTime = lastResponse.responseTime || 3000; // Default if not provided

        // Fetch full question for complete metadata
        const fullQuestion = await QuestionBank.findOne({ questionId: lastResponse.questionId });

        // Prepare response object with all necessary fields
        const responseForIntelligence = {
          questionId: lastResponse.questionId,
          value: lastResponse.value,
          response: lastResponse.value, // Alias
          score: lastResponse.score,
          responseTime: responseTime,
          text: fullQuestion?.text || lastResponse.text,
          category: lastResponse.category || fullQuestion?.category,
          subcategory: lastResponse.subcategory || fullQuestion?.subcategory,
          trait: lastResponse.trait || fullQuestion?.trait,
          facet: lastResponse.facet || fullQuestion?.facet,
          instrument: lastResponse.instrument || fullQuestion?.instrument,
          tags: lastResponse.tags || fullQuestion?.tags,
          reverseScored: fullQuestion?.reverseScored || false
        };

        // Calculate current scores for pattern analysis
        const currentScores = {};
        const trackerSummary = tracker.getSummary();
        for (const [dim, data] of Object.entries(trackerSummary)) {
          if (data && data.confidence !== undefined) {
            currentScores[dim] = data.currentEstimate || data.score || 50;
          }
        }

        // Process through intelligence systems
        const intelligenceInsights = intelligentSelector.processResponseIntelligence(
          responseForIntelligence,
          assessment.responses.map(r => ({
            ...r,
            response: r.value,
            responseTime: r.responseTime || 3000
          })),
          responseTime,
          currentScores
        );

        // Store any critical interventions for later use
        if (intelligenceInsights && intelligenceInsights.interventions && intelligenceInsights.interventions.length > 0) {
          if (!assessment.adaptiveMetadata) assessment.adaptiveMetadata = {};
          if (!assessment.adaptiveMetadata.intelligenceFlags) assessment.adaptiveMetadata.intelligenceFlags = [];

          assessment.adaptiveMetadata.intelligenceFlags.push({
            questionNumber: assessment.responses.length,
            timestamp: new Date(),
            interventions: intelligenceInsights.interventions
          });
        }

        console.log(`[Intelligence] Processed Q${assessment.responses.length} - Flags: ${intelligenceInsights.flags?.length || 0}, Interventions: ${intelligenceInsights.interventions?.length || 0}`);
      } catch (error) {
        console.error('[Intelligence Processing Error]:', error.message);
        // Don't fail assessment if intelligence processing fails
      }
    }

    // Check if assessment is complete (70 questions for multi-stage)
    const targetTotal = useMultiStage ? 70 : (adaptiveEngine.assessmentLimits[assessment.tier] || 70);

    if (assessment.responses.length >= targetTotal) {
      // Get comprehensive intelligence insights before completing
      let intelligenceInsights = null;
      if (useIntelligentSelector) {
        try {
          intelligenceInsights = intelligentSelector.getIntelligenceInsights();
          console.log('[Intelligence] Final insights generated');
          console.log('  - Overall Validity:', intelligenceInsights.validity?.overallValidity);
          console.log('  - Total Flags:', intelligenceInsights.summary?.totalFlags);
          console.log('  - Contradictions:', intelligenceInsights.summary?.totalContradictions);

          // Store intelligence insights in assessment metadata
          if (!assessment.adaptiveMetadata) assessment.adaptiveMetadata = {};
          assessment.adaptiveMetadata.intelligenceInsights = intelligenceInsights;
        } catch (error) {
          console.error('[Intelligence Insights Error]:', error.message);
        }
      }

      // Mark assessment as completed
      assessment.phase = 'completed';
      assessment.completedAt = new Date();
      assessment.questionsAnswered = assessment.responses.length;

      await assessment.save();

      logger.info('Assessment complete', {
        sessionId,
        totalQuestions: assessment.responses.length,
        finalStage: assessment.currentStage,
        avgConfidence: Math.round(tracker.getAverageConfidence()),
        validity: intelligenceInsights?.validity?.overallValidity || 'N/A'
      });

      return res.json({
        success: true,
        complete: true,
        message: 'Assessment complete',
        totalQuestions: assessment.responses.length,
        currentBatch: [],
        progress: {
          current: assessment.responses.length,
          total: targetTotal,
          percentage: 100,
          stage: assessment.currentStage
        },
        confidence: tracker.getSummary(),
        stageHistory: assessment.stageHistory,
        intelligenceInsights: intelligenceInsights ? {
          validity: intelligenceInsights.validity?.overallValidity,
          totalFlags: intelligenceInsights.summary?.totalFlags,
          hasPatterns: !!intelligenceInsights.patterns
        } : null
      });
    }

    // USE INTELLIGENT SELECTOR if enabled
    if (useIntelligentSelector) {
      // Get all responses with full question data for intelligent selection
      const allResponses = assessment.responses.map(r => ({
        questionId: r.questionId,
        score: r.score,
        category: r.category,
        subcategory: r.subcategory,
        trait: r.trait,
        facet: r.facet,
        instrument: r.instrument,
        tags: r.tags
      }));

      const askedQuestionIds = assessment.presentedQuestions || [];

      // NEW: Get tier parameters for tier-based filtering
      const assessmentTier = assessment.assessmentTier || 'COMPREHENSIVE';
      const clinicalAddonConsent = assessment.clinicalAddonConsent || false;

      // Get next question using intelligent selector with tier filtering
      const nextQuestion = await intelligentSelector.selectNextQuestion(
        QuestionBank,
        allResponses,
        askedQuestionIds,
        tracker,
        assessmentTier, // NEW: Pass assessment tier
        clinicalAddonConsent // NEW: Pass clinical consent status
      );

      // Track the new question
      assessment.presentedQuestions.push(nextQuestion.questionId);

      // Save assessment
      await assessment.save();

      // Get phase info
      const currentPhase = intelligentSelector.determinePhase(assessment.responses.length);
      const progressMessage = intelligentSelector.getProgressMessage(
        assessment.responses.length,
        currentPhase,
        tracker
      );

      // Transform question for frontend
      const transformedQuestion = {
        ...nextQuestion.toObject(),
        id: nextQuestion.questionId,
        category: nextQuestion.category,
        trait: nextQuestion.trait,
        facet: nextQuestion.facet,
        tags: nextQuestion.tags,
        instrument: nextQuestion.instrument,
        reverseScored: nextQuestion.reverseScored
      };

      logger.info('Intelligent selector next question', {
        sessionId,
        questionNumber: assessment.responses.length + 1,
        questionId: nextQuestion.questionId,
        phase: currentPhase.name,
        avgConfidence: Math.round(tracker.getAverageConfidence())
      });

      return res.json({
        success: true,
        complete: false,
        currentBatch: [transformedQuestion],
        mode: 'intelligent',
        phase: currentPhase.name,
        phaseMessage: progressMessage,
        singleQuestionMode: true,
        progress: {
          current: assessment.responses.length,
          total: 70,
          percentage: Math.round((assessment.responses.length / 70) * 100)
        },
        confidence: tracker.getSummary()
      });
    }

    // USE MULTI-STAGE COORDINATOR if enabled
    if (useMultiStage) {
      // Get next questions using MultiStageCoordinator
      const result = await multiStageCoordinator.getNextQuestions(assessment, QuestionBank);

      // Save assessment (stage may have changed)
      await assessment.save();

      // Transform questions for frontend
      const nextQuestions = result.questions.map(q => ({
        ...q.toObject(),
        id: q.questionId,
        category: q.category,
        trait: q.trait,
        facet: q.facet,
        tags: q.tags,
        instrument: q.instrument,
        reverseScored: q.reverseScored
      }));

      // Get progress info
      const progress = multiStageCoordinator.getProgress(assessment);

      logger.info('Multi-stage next questions', {
        sessionId,
        currentStage: result.stage,
        stageChanged: result.stageChanged,
        nextQuestions: nextQuestions.length,
        avgConfidence: Math.round(tracker.getAverageConfidence())
      });

      return res.json({
        success: true,
        complete: false,
        currentBatch: nextQuestions,
        currentStage: result.stage,
        stageChanged: result.stageChanged,
        stageMessage: result.stageMessage,
        progressMessage: result.progressMessage,
        skipNotifications: result.skipNotifications,
        progress,
        confidence: result.confidenceSummary,
        mode: 'multi-stage'
      });
    }

    // Analyze response patterns
    const patterns = adaptiveEngine.analyzeResponsePatterns(assessment.responses);

    // Check branching rules
    const activatedPathways = adaptiveEngine.checkBranchingRules(patterns);

    // Update pathways if new ones activated
    activatedPathways.forEach(pathway => {
      if (!assessment.adaptiveMetadata.pathwaysActivated.includes(pathway.id)) {
        assessment.adaptiveMetadata.pathwaysActivated.push(pathway.id);
        assessment.adaptiveMetadata.branchingDecisions.push({
          timestamp: new Date(),
          pathway: pathway.id,
          trigger: pathway.triggers,
          questionNumber: assessment.responses.length
        });
      }
    });

    // Calculate how many questions we can still ask
    const remainingQuestions = targetTotal - assessment.responses.length;

    // Determine next questions to ask
    let nextQuestions;

    // For comprehensive tier: Use intelligent batch selection after baseline
    const baselineLimit = adaptiveEngine.baselineLimits[assessment.tier];
    if (assessment.tier === 'comprehensive' && assessment.responses.length === baselineLimit) {
      // Baseline just completed - select ALL 50 adaptive questions at once
      logger.info('Baseline complete, selecting all adaptive questions', {
        sessionId: assessment.sessionId,
        baselineCount: assessment.responses.length
      });

      const adaptiveResult = await comprehensiveSelector.selectAdaptiveQuestions(
        QuestionBank,
        assessment.responses,
        assessment.tier
      );

      nextQuestions = adaptiveResult.questions;

      // Store the profile and allocation for later analysis
      assessment.adaptiveMetadata.comprehensiveProfile = adaptiveResult.profile;
      assessment.adaptiveMetadata.questionAllocation = adaptiveResult.allocation;
      assessment.adaptiveMetadata.adaptiveSelectionComplete = true;

      logger.info('Comprehensive adaptive selection complete', {
        sessionId: assessment.sessionId,
        adaptiveCount: nextQuestions.length,
        allocation: adaptiveResult.allocation
      });
    } else {
      // Use traditional incremental selection
      nextQuestions = await selectNextQuestions(assessment, patterns, activatedPathways);

      // Limit next questions to not exceed the assessment limit
      if (nextQuestions.length > remainingQuestions) {
        nextQuestions = nextQuestions.slice(0, remainingQuestions);
      }
    }

    // Update phase
    if (assessment.responses.length < targetTotal * 0.4) {
      assessment.adaptiveMetadata.currentPhase = 'core';
    } else if (assessment.responses.length < targetTotal * 0.7) {
      assessment.adaptiveMetadata.currentPhase = 'branching';
    } else {
      assessment.adaptiveMetadata.currentPhase = 'refinement';
    }

    await assessment.save();

    // Check if this will be the last batch
    const isComplete = assessment.responses.length + nextQuestions.length >= targetTotal;

    console.log(`[NEXT] Current: ${assessment.responses.length}, NextQ: ${nextQuestions.length}, Complete: ${isComplete}, Limit: ${targetTotal}`);

    res.json({
      success: true,
      nextQuestions,
      currentBatch: nextQuestions, // Also provide as currentBatch for compatibility
      progress: {
        current: assessment.responses.length,
        total: targetTotal,
        percentage: Math.round((assessment.responses.length / targetTotal) * 100)
      },
      pathways: assessment.adaptiveMetadata.pathwaysActivated,
      phase: assessment.adaptiveMetadata.currentPhase,
      complete: isComplete
    });
  } catch (error) {
    logger.error('Failed to get next question:', error);
    res.status(500).json({
      error: 'Failed to get next question',
      message: error.message
    });
  }
});

/**
 * Complete adaptive assessment
 * POST /api/adaptive/complete
 */
router.post('/complete', async (req, res) => {
  try {
    const { sessionId, finalResponses } = req.body;

    const assessment = await Assessment.findOne({ sessionId });
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Save any final responses that haven't been saved yet
    if (finalResponses && finalResponses.length > 0) {
      const existingQuestionIds = new Set(assessment.responses.map(r => r.questionId));
      const newResponses = finalResponses.filter(r => !existingQuestionIds.has(r.questionId));

      // CRITICAL FIX: Fetch question data to include facet fields
      if (newResponses.length > 0) {
        const finalQuestionIds = newResponses.map(r => r.questionId);
        const finalQuestions = await QuestionBank.find({ questionId: { $in: finalQuestionIds } });
        const finalQuestionMap = new Map(finalQuestions.map(q => [q.questionId, q]));

        newResponses.forEach(response => {
          const question = finalQuestionMap.get(response.questionId);
          assessment.responses.push({
            questionId: response.questionId,
            value: response.value,
            responseTime: response.responseTime,
            category: question?.category || response.category,
            subcategory: question?.subcategory || response.subcategory,
            trait: question?.trait || response.trait,
            facet: question?.facet || response.facet,
            instrument: question?.instrument || response.instrument,
            traits: response.traits,
            score: convertResponseToScore(response.value)
          });
        });
      }

      if (newResponses.length > 0) {
        logger.info('Added new final responses', {
          sessionId,
          newCount: newResponses.length,
          totalCount: assessment.responses.length
        });
      }
    }

    // Mark as complete
    assessment.completionTime = new Date();

    // Generate adaptive summary
    const summary = await adaptiveEngine.generateAdaptiveSummary(assessment);

    // Calculate results based on adaptive pathways
    const results = calculateAdaptiveResults(assessment, summary);
    assessment.results = results;
    assessment.adaptiveMetadata.summary = summary;

    await assessment.save();

    logger.info('Completed adaptive assessment', {
      sessionId,
      totalQuestions: assessment.responses.length,
      pathways: summary.pathwaysActivated,
      confidence: summary.confidenceLevel
    });

    res.json({
      success: true,
      sessionId,
      summary,
      results: {
        primaryProfile: summary.primaryProfile,
        confidence: `${Math.round(summary.confidenceLevel * 100)}%`,
        recommendations: summary.recommendations
      },
      reportUrl: `/api/reports/generate`
    });
  } catch (error) {
    logger.error('Failed to complete assessment:', error);
    res.status(500).json({
      error: 'Failed to complete assessment',
      message: error.message
    });
  }
});

/**
 * Get assessment progress
 * GET /api/adaptive/progress/:sessionId
 */
router.get('/progress/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const assessment = await Assessment.findOne({ sessionId });
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const limit = adaptiveEngine.assessmentLimits[assessment.tier];

    res.json({
      sessionId,
      tier: assessment.tier,
      progress: {
        current: assessment.responses.length,
        total: limit,
        percentage: Math.round((assessment.responses.length / limit) * 100)
      },
      phase: assessment.adaptiveMetadata.currentPhase,
      pathwaysActivated: assessment.adaptiveMetadata.pathwaysActivated,
      timeElapsed: Math.round((Date.now() - assessment.startTime) / 1000),
      isComplete: assessment.responses.length >= limit
    });
  } catch (error) {
    logger.error('Failed to get progress:', error);
    res.status(500).json({
      error: 'Failed to get progress',
      message: error.message
    });
  }
});

// Helper functions

/**
 * Select next questions based on adaptive logic
 */
async function selectNextQuestions(assessment, patterns, activatedPathways) {
  const limit = adaptiveEngine.assessmentLimits[assessment.tier];
  const remaining = limit - assessment.responses.length;

  // Don't return more than 3 questions at a time
  const batchSize = Math.min(3, remaining);

  console.log(`[SELECT-NEXT] Current: ${assessment.responses.length}, Limit: ${limit}, Remaining: ${remaining}, BatchSize: ${batchSize}`);

  // Get all asked question IDs
  const askedQuestionIds = assessment.responses.map(r => r.questionId);

  // Build query based on activated pathways
  const query = {
    questionId: { $nin: askedQuestionIds }, // Exclude already asked questions
    active: true
  };

  // Add pathway-specific filters
  if (activatedPathways.length > 0) {
    const subcategories = [];
    activatedPathways.forEach(pathway => {
      if (pathway.actions.add) {
        subcategories.push(...pathway.actions.add);
      }
    });

    if (subcategories.length > 0) {
      query.subcategory = { $in: subcategories };
    }
  }

  // Phase-specific selection - use less restrictive filters
  if (assessment.adaptiveMetadata.currentPhase === 'core') {
    // Get a good mix of personality and neurodiversity questions
    // Don't filter by importance since most questions don't have it
  } else if (assessment.adaptiveMetadata.currentPhase === 'branching') {
    // Focus on pathway-specific questions
    if (patterns.traits && patterns.traits.adhd_indicators > 3.5) {
      query.category = 'neurodiversity';
      query.subcategory = { $in: ['executive_function', 'adhd', 'rejection_sensitivity'] };
    } else if (patterns.traits && patterns.traits.autism_indicators > 3.5) {
      query.category = 'neurodiversity';
      query.subcategory = { $in: ['sensory_processing', 'masking', 'autism'] };
    }
  } else if (assessment.adaptiveMetadata.currentPhase === 'refinement') {
    // Focus on clarifying ambiguous areas
    // Don't filter by type as questions may not have this field
  }

  // Don't filter by tier field as it's not consistently set on questions
  // The baseline selection already handles tier filtering

  // Fetch candidate questions with enough buffer
  let questions = await QuestionBank.find(query).limit(Math.max(batchSize * 5, 20));

  // If we don't have enough questions, remove restrictive filters
  if (questions.length < batchSize && (query.subcategory || query.category)) {
    delete query.subcategory;
    delete query.category;
    questions = await QuestionBank.find(query).limit(Math.max(batchSize * 5, 20));
  }

  // Calculate priorities and select top questions
  const priorityScores = await adaptiveEngine.calculateQuestionPriorities(
    patterns,
    activatedPathways,
    questions
  );

  // Sort by priority and select top N
  const sortedQuestions = questions
    .sort((a, b) => (priorityScores[b._id] || 0) - (priorityScores[a._id] || 0))
    .slice(0, batchSize)
    .map(q => ({
      ...q.toObject(),
      id: q.questionId // Add id field for frontend compatibility
    }));

  console.log(`[SELECT-NEXT] Found: ${questions.length}, Returning: ${sortedQuestions.length}`);

  return sortedQuestions;
}

/**
 * Convert response value to numerical score
 */
function convertResponseToScore(value, reverseScored = false) {
  // If value is already a number, use it directly
  if (typeof value === 'number') {
    return reverseScored ? 6 - value : value;
  }

  // If value is a numeric string, parse it
  const numValue = parseInt(value);
  if (!isNaN(numValue)) {
    return reverseScored ? 6 - numValue : numValue;
  }

  // Otherwise, map label to score
  const scoreMap = {
    'Strongly Disagree': 1,
    Disagree: 2,
    Neutral: 3,
    Agree: 4,
    'Strongly Agree': 5,
    Never: 1,
    Rarely: 2,
    Sometimes: 3,
    Often: 4,
    Always: 5,
    'No': 0,
    'Yes': 1
  };

  let score = scoreMap[value] !== undefined ? scoreMap[value] : 3;

  // Apply reverse scoring if needed (for reversed questions)
  if (reverseScored) {
    score = 6 - score;
  }

  return score;
}

/**
 * Calculate results based on adaptive assessment
 */
function calculateAdaptiveResults(assessment, summary) {
  const results = {
    profile: {},
    scores: {},
    adaptiveInsights: {},
    confidence: summary.confidenceLevel
  };

  // Aggregate trait scores
  assessment.responses.forEach(r => {
    if (r.traits) {
      Object.entries(r.traits).forEach(([trait, weight]) => {
        if (!results.scores[trait]) {
          results.scores[trait] = { sum: 0, count: 0 };
        }
        results.scores[trait].sum += r.score * weight;
        results.scores[trait].count++;
      });
    }
  });

  // Calculate averages
  Object.entries(results.scores).forEach(([trait, data]) => {
    results.profile[trait] = data.count > 0 ? data.sum / data.count : 0;
  });

  // Add pathway-specific insights
  results.adaptiveInsights.pathways = summary.pathwaysActivated;
  results.adaptiveInsights.primaryProfile = summary.primaryProfile;
  results.adaptiveInsights.recommendations = summary.recommendations;

  // Add quality metrics
  results.qualityMetrics = {
    completionRate: assessment.responses.length / adaptiveEngine.assessmentLimits[assessment.tier],
    responseConsistency: calculateConsistency(assessment.responses),
    adaptiveBranching: assessment.adaptiveMetadata.branchingDecisions.length
  };

  return results;
}

/**
 * Calculate response consistency
 */
function calculateConsistency(responses) {
  if (responses.length < 2) return 1;

  const scores = responses.map(r => r.score || 3);
  const variance = calculateVariance(scores);

  // High variance = less consistent
  return Math.max(0, 1 - variance / 2);
}

/**
 * Calculate variance
 */
function calculateVariance(scores) {
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const squaredDiffs = scores.map(s => Math.pow(s - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / scores.length);
}

/**
 * Generate session ID
 */
function generateSessionId() {
  return `ADAPTIVE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all questions (for testing purposes)
 * GET /api/assessments/questions/all
 */
router.get('/questions/all', async (req, res) => {
  try {
    const questions = await QuestionBank.find({
      active: true
    }).select('questionId text category instrument subcategory trait tier active correlatedTraits');

    logger.info('Fetched all questions for testing', {
      count: questions.length,
      sensory: questions.filter(q => q.instrument && q.instrument.toLowerCase().includes('sensory')).length,
      adhd: questions.filter(q => q.instrument === 'ASRS-5').length,
      autism: questions.filter(q => q.instrument === 'AQ-10').length
    });

    res.json({
      success: true,
      questions: questions
    });
  } catch (error) {
    logger.error('Failed to fetch questions:', error);
    res.status(500).json({
      error: 'Failed to fetch questions',
      message: error.message
    });
  }
});

/**
 * Get confidence summary for a session
 * GET /api/adaptive/:sessionId/confidence
 */
router.get('/:sessionId/confidence', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Find assessment
    const assessment = await Assessment.findOne({ sessionId });
    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Assessment session not found'
      });
    }

    // Restore confidence tracker from stored state
    // Convert Mongoose Map to plain object to avoid $ prefixed internal properties
    const confidencePlain = assessment.confidenceState
      ? Object.fromEntries(assessment.confidenceState)
      : {};
    const tracker = ConfidenceTracker.fromJSON({
      dimensions: confidencePlain
    });

    // Get confidence summary
    const summary = tracker.getSummary();
    const isReady = tracker.isReadyForReport();
    const avgConfidence = tracker.getAverageConfidence();

    // Get skippable dimensions
    const skippable = tracker.getSkippableDimensions(85, 2);

    logger.info('Retrieved confidence summary', {
      sessionId,
      avgConfidence: Math.round(avgConfidence),
      readyForReport: isReady,
      dimensionCount: Object.keys(summary).length
    });

    res.json({
      success: true,
      sessionId,
      currentStage: assessment.currentStage || 1,
      confidence: summary,
      averageConfidence: Math.round(avgConfidence),
      readyForReport: isReady,
      questionsAnswered: assessment.responses?.length || 0,
      skippableDimensions: skippable,
      stageHistory: assessment.stageHistory || []
    });
  } catch (error) {
    logger.error('Error getting confidence summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get confidence summary',
      message: error.message
    });
  }
});

/**
 * Get detailed dimension statistics
 * GET /api/adaptive/:sessionId/dimension/:dimensionName
 */
router.get('/:sessionId/dimension/:dimensionName', async (req, res) => {
  try {
    const { sessionId, dimensionName } = req.params;

    // Find assessment
    const assessment = await Assessment.findOne({ sessionId });
    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Assessment session not found'
      });
    }

    // Restore confidence tracker
    // Convert Mongoose Map to plain object to avoid $ prefixed internal properties
    const confidencePlain = assessment.confidenceState
      ? Object.fromEntries(assessment.confidenceState)
      : {};
    const tracker = ConfidenceTracker.fromJSON({
      dimensions: confidencePlain
    });

    // Get detailed stats for dimension
    const stats = tracker.getDimensionStats(dimensionName);

    if (!stats.exists) {
      return res.status(404).json({
        success: false,
        error: `No data for dimension: ${dimensionName}`
      });
    }

    res.json({
      success: true,
      sessionId,
      dimension: stats
    });
  } catch (error) {
    logger.error('Error getting dimension stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dimension statistics',
      message: error.message
    });
  }
});

module.exports = router;
