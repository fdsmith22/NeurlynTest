const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const AdaptiveAssessmentEngine = require('../services/adaptive-assessment-engine');

// Initialize adaptive engine
const adaptiveEngine = new AdaptiveAssessmentEngine();

// Get models
const Assessment = mongoose.model('Assessment');
const QuestionBank = mongoose.model('QuestionBank');

/**
 * Start adaptive assessment
 * POST /api/adaptive/start
 */
router.post('/start', async (req, res) => {
  try {
    const { tier = 'standard', demographics, concerns, userId } = req.body;

    // Validate tier
    if (!['quick', 'standard', 'deep'].includes(tier)) {
      return res.status(400).json({
        error: 'Invalid tier. Must be quick, standard, or deep'
      });
    }

    // Generate adaptive assessment structure
    const adaptiveAssessment = await adaptiveEngine.generateAdaptiveAssessment(tier, {
      demographics,
      concerns
    });

    // Create assessment session
    const sessionId = generateSessionId();
    const assessment = new Assessment({
      sessionId,
      userId: userId || 'anonymous',
      tier,
      mode: 'adaptive',
      startTime: new Date(),
      demographics,
      adaptiveMetadata: {
        tier,
        totalQuestionLimit: adaptiveEngine.assessmentLimits[tier],
        questionsAsked: 0,
        pathwaysActivated: [],
        branchingDecisions: [],
        currentPhase: 'core',
        concerns
      },
      responses: []
    });

    await assessment.save();

    // Get first batch of questions (baseline questions first)
    const initialQuestions = adaptiveAssessment.baselineQuestions || [];

    logger.info('Started adaptive assessment', {
      sessionId,
      tier,
      totalLimit: adaptiveEngine.assessmentLimits[tier]
    });

    res.json({
      success: true,
      sessionId,
      tier,
      totalQuestions: adaptiveEngine.assessmentLimits[tier],
      currentBatch: initialQuestions,
      progress: {
        current: 0,
        total: adaptiveEngine.assessmentLimits[tier]
      }
    });
  } catch (error) {
    logger.error('Failed to start adaptive assessment:', error);
    res.status(500).json({
      error: 'Failed to start assessment',
      message: error.message
    });
  }
});

/**
 * Get next question based on responses
 * POST /api/adaptive/next
 */
router.post('/next', async (req, res) => {
  try {
    const { sessionId, response } = req.body;

    // Find assessment
    const assessment = await Assessment.findOne({ sessionId });
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Check if assessment is complete
    const limit = adaptiveEngine.assessmentLimits[assessment.tier];
    if (assessment.responses.length >= limit) {
      return res.json({
        complete: true,
        message: 'Assessment complete',
        totalQuestions: assessment.responses.length
      });
    }

    // Save current response if provided
    if (response) {
      assessment.responses.push({
        questionId: response.questionId,
        value: response.value,
        responseTime: response.responseTime,
        category: response.category,
        subcategory: response.subcategory,
        traits: response.traits,
        personalizationMarkers: response.markers,
        score: convertResponseToScore(response.value)
      });
      assessment.adaptiveMetadata.questionsAsked++;
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

    // Determine next questions to ask
    const nextQuestions = await selectNextQuestions(assessment, patterns, activatedPathways);

    // Update phase
    if (assessment.responses.length < limit * 0.4) {
      assessment.adaptiveMetadata.currentPhase = 'core';
    } else if (assessment.responses.length < limit * 0.7) {
      assessment.adaptiveMetadata.currentPhase = 'branching';
    } else {
      assessment.adaptiveMetadata.currentPhase = 'refinement';
    }

    await assessment.save();

    // Check if this was the last question
    const isComplete = assessment.responses.length + nextQuestions.length >= limit;

    res.json({
      success: true,
      nextQuestions,
      progress: {
        current: assessment.responses.length,
        total: limit,
        percentage: Math.round((assessment.responses.length / limit) * 100)
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

    // Save any final responses
    if (finalResponses && finalResponses.length > 0) {
      finalResponses.forEach(response => {
        assessment.responses.push({
          questionId: response.questionId,
          value: response.value,
          responseTime: response.responseTime,
          category: response.category,
          subcategory: response.subcategory,
          traits: response.traits,
          score: convertResponseToScore(response.value)
        });
      });
    }

    // Mark as complete
    assessment.completionTime = new Date();

    // Generate adaptive summary
    const summary = adaptiveEngine.generateAdaptiveSummary(assessment);

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

  // Get all asked question IDs
  const askedQuestionIds = assessment.responses.map(r => r.questionId);

  // Build query based on activated pathways
  const query = {
    _id: { $nin: askedQuestionIds } // Exclude already asked questions
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

  // Phase-specific selection
  if (assessment.adaptiveMetadata.currentPhase === 'core') {
    query.importance = { $in: ['core', 'high'] };
  } else if (assessment.adaptiveMetadata.currentPhase === 'branching') {
    // Focus on pathway-specific questions
    if (patterns.traits.adhd_indicators > 3.5) {
      query.category = 'neurodiversity';
      query.subcategory = { $in: ['executive_function', 'adhd', 'rejection_sensitivity'] };
    }
    if (patterns.traits.autism_indicators > 3.5) {
      query.category = 'neurodiversity';
      query.subcategory = { $in: ['sensory_processing', 'masking', 'autism'] };
    }
  } else if (assessment.adaptiveMetadata.currentPhase === 'refinement') {
    // Focus on clarifying ambiguous areas
    query.type = { $in: ['forced_choice', 'slider'] };
  }

  // Add tier-specific filters
  if (assessment.tier === 'quick') {
    query.tier = { $in: ['screening', 'quick'] };
  } else if (assessment.tier === 'standard') {
    query.tier = { $in: ['screening', 'standard'] };
  } else if (assessment.tier === 'deep') {
    // Include all tiers for deep assessment
    query.tier = { $exists: true };
  }

  // Fetch candidate questions
  let questions = await QuestionBank.find(query).limit(batchSize * 3);

  // If not enough questions, broaden the search
  if (questions.length < batchSize) {
    delete query.subcategory;
    delete query.importance;
    questions = await QuestionBank.find(query).limit(batchSize * 2);
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
    .slice(0, batchSize);

  return sortedQuestions;
}

/**
 * Convert response value to numerical score
 */
function convertResponseToScore(value) {
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
    Always: 5
  };

  return scoreMap[value] || 3;
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

module.exports = router;
