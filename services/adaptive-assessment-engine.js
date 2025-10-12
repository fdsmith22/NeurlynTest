const mongoose = require('mongoose');
const logger = require('../utils/logger');
const StatisticalAnalyzer = require('./statistical-analyzer');
const NeurodivergentScreener = require('./neurodivergent-screener');

/**
 * Adaptive Assessment Engine
 * Intelligently selects questions based on user responses
 * Limits: Quick (20), Standard (45), Deep (75)
 */
class AdaptiveAssessmentEngine {
  constructor() {
    this.assessmentLimits = {
      quick: 20,
      standard: 30, // 10 baseline + 20 adaptive
      comprehensive: 70, // 20 baseline + 50 adaptive (PAID tier)
      deep: 75
    };

    this.baselineLimits = {
      quick: 8,
      standard: 10,
      comprehensive: 20, // Enhanced baseline for paid tier
      deep: 25 // Increased to accommodate all neurodiversity baseline questions
    };

    this.statisticalAnalyzer = new StatisticalAnalyzer();
    this.neurodivergentScreener = new NeurodivergentScreener();

    // Enhanced question categories with better neurodiversity coverage
    this.questionPriorities = {
      core: {
        personality: { priority: 10, minQuestions: 5, maxQuestions: 15 },
        neurodiversity_screening: { priority: 10, minQuestions: 5, maxQuestions: 12 }, // Increased priority
        mental_health_screen: { priority: 8, minQuestions: 3, maxQuestions: 8 }
      },
      branching: {
        adhd_deep: { priority: 7, triggers: ['adhd_indicators'], minQuestions: 5 },
        autism_deep: { priority: 7, triggers: ['autism_indicators'], minQuestions: 5 },
        executive_function: { priority: 7, triggers: ['executive_dysfunction'], minQuestions: 4 },
        sensory_processing: { priority: 6, triggers: ['sensory_sensitivity'], minQuestions: 4 },
        masking: { priority: 6, triggers: ['masking_indicators'], minQuestions: 3 },
        trauma: { priority: 5, triggers: ['trauma_indicators'], minQuestions: 3 },
        attachment: { priority: 4, triggers: ['relationship_patterns'], minQuestions: 3 }
      },
      enhancement: {
        jungian: { priority: 3, tierRequired: 'deep', minQuestions: 4 },
        enneagram: { priority: 3, tierRequired: 'deep', minQuestions: 6 },
        learning_style: { priority: 2, tierRequired: 'standard', minQuestions: 3 },
        cognitive_functions: { priority: 2, tierRequired: 'standard', minQuestions: 4 }
      }
    };

    // Branching rules based on response patterns
    this.branchingRules = [
      {
        id: 'adhd_pathway',
        triggers: {
          responses: ['attention_difficulty', 'time_blindness', 'impulsivity'],
          threshold: 2,
          scoreThreshold: 3.5
        },
        actions: {
          add: ['executive_function', 'rejection_sensitivity', 'adhd_comprehensive'],
          remove: ['redundant_attention'],
          priority_boost: ['adhd_deep', 'executive_function']
        }
      },
      {
        id: 'autism_pathway',
        triggers: {
          responses: ['social_difficulty', 'sensory_sensitivity', 'routine_need'],
          threshold: 2,
          scoreThreshold: 3.5
        },
        actions: {
          add: ['masking_assessment', 'sensory_profile', 'monotropism'],
          remove: ['redundant_social'],
          priority_boost: ['autism_deep', 'sensory_processing']
        }
      },
      {
        id: 'audhd_pathway',
        triggers: {
          combined: ['adhd_pathway', 'autism_pathway'],
          threshold: 'both'
        },
        actions: {
          add: ['audhd_specific', 'competing_needs', 'dual_presentation'],
          priority_boost: ['executive_function', 'sensory_processing', 'masking']
        }
      },
      {
        id: 'trauma_pathway',
        triggers: {
          responses: ['hypervigilance', 'dissociation', 'somatic_symptoms'],
          threshold: 1,
          scoreThreshold: 3.0
        },
        actions: {
          add: ['trauma_informed', 'attachment_style', 'defense_mechanisms'],
          modify_tone: 'gentle',
          priority_boost: ['trauma', 'attachment']
        }
      },
      {
        id: 'high_masking',
        triggers: {
          responses: ['social_exhaustion', 'identity_suppression', 'performance_feeling'],
          threshold: 2,
          scoreThreshold: 4.0
        },
        actions: {
          add: ['masking_comprehensive', 'burnout_assessment', 'authenticity'],
          priority_boost: ['masking', 'self_identity']
        }
      },
      {
        id: 'gifted_pathway',
        triggers: {
          responses: ['pattern_recognition', 'deep_thinking', 'intensity'],
          threshold: 2,
          scoreThreshold: 4.5
        },
        actions: {
          add: ['giftedness_screen', 'overexcitabilities', 'asynchronous_development'],
          priority_boost: ['cognitive_functions', 'creative_thinking']
        }
      }
    ];

    // Response pattern detection
    this.patternDetectors = {
      inconsistency: {
        detect: responses => this.detectInconsistency(responses),
        action: 'add_validity_checks'
      },
      extreme_responding: {
        detect: responses => this.detectExtremeResponding(responses),
        action: 'add_nuanced_questions'
      },
      central_tendency: {
        detect: responses => this.detectCentralTendency(responses),
        action: 'add_forced_choice'
      },
      acquiescence: {
        detect: responses => this.detectAcquiescence(responses),
        action: 'add_reverse_scored'
      }
    };
  }

  /**
   * Generate adaptive assessment based on tier and responses
   */
  async generateAdaptiveAssessment(tier = 'standard', initialData = {}) {
    try {
      const QuestionBank = mongoose.model('QuestionBank');
      const limit = this.assessmentLimits[tier];
      const baselineLimit = this.baselineLimits[tier];

      const assessment = {
        tier,
        totalQuestions: limit,
        baselineQuestions: [],
        adaptiveQuestions: [],
        phase: 'baseline', // 'baseline' -> 'adaptive' -> 'complete'
        adaptiveMetadata: {
          pathways: [],
          branchingDecisions: [],
          priorityAdjustments: [],
          profile: null
        }
      };

      // Phase 1: Get baseline questions for initial profiling
      const baselineQuestions = await QuestionBank.getBaselineQuestions(tier);

      // Ensure we have baseline questions
      if (!baselineQuestions || !Array.isArray(baselineQuestions)) {
        logger.error('Failed to get baseline questions:', { tier, baselineQuestions });
        throw new Error('No baseline questions available');
      }

      assessment.baselineQuestions = baselineQuestions.slice(0, baselineLimit);

      // Phase 2: Reserve space for adaptive questions (will be selected after baseline)
      const adaptiveSlots = limit - assessment.baselineQuestions.length;
      assessment.adaptiveSlots = adaptiveSlots;

      // Phase 3: Initial profile-based questions if user provided concerns
      if (initialData.demographics || initialData.concerns) {
        const profileQuestions = await this.selectProfileBasedQuestions(
          initialData,
          Math.min(adaptiveSlots, 5) // Limit initial profile questions
        );
        assessment.adaptiveQuestions.push(...profileQuestions);
      }

      logger.info('Generated adaptive assessment structure', {
        tier,
        baselineQuestions: assessment.baselineQuestions.length,
        initialAdaptive: assessment.adaptiveQuestions.length,
        totalAdaptiveSlots: adaptiveSlots
      });

      return assessment;
    } catch (error) {
      logger.error('Adaptive assessment generation error:', error);
      throw error;
    }
  }

  /**
   * Select core questions that everyone should answer
   */
  async selectCoreQuestions(tier, totalLimit) {
    const Question = mongoose.model('QuestionBank');
    const coreQuestions = [];
    const coreLimit = Math.floor(totalLimit * 0.4); // 40% core questions

    // Essential personality traits (Big Five)
    const personalityQuestions = await Question.find({
      category: 'personality',
      tier: { $in: ['free', 'core', tier] }
    }).limit(5);
    coreQuestions.push(...personalityQuestions);

    // Basic neurodiversity screening
    if (tier !== 'quick') {
      const ndScreening = await Question.find({
        category: 'neurodiversity',
        subcategory: { $in: ['executive_function', 'sensory_processing', 'masking'] }
      }).limit(4);
      coreQuestions.push(...ndScreening);
    }

    // Additional neurodiversity questions if we have them
    const additionalND = await Question.find({
      category: 'neurodiversity',
      subcategory: { $exists: true }
    }).limit(3);
    coreQuestions.push(...additionalND);

    // If deep tier, add psychoanalytic questions
    if (tier === 'deep') {
      const deepCore = await Question.find({
        category: { $in: ['cognitive_functions', 'attachment', 'enneagram'] }
      }).limit(3);
      coreQuestions.push(...deepCore);
    }

    return coreQuestions.slice(0, coreLimit);
  }

  /**
   * Select questions based on user profile/concerns
   */
  async selectProfileBasedQuestions(profileData, availableSlots) {
    const Question = mongoose.model('QuestionBank');
    const profileQuestions = [];

    // If user indicated specific concerns
    if (profileData.concerns) {
      const concernMap = {
        attention: ['adhd', 'executive_function'],
        social: ['autism', 'social_anxiety', 'masking'],
        mood: ['depression', 'anxiety', 'emotional_regulation'],
        learning: ['dyslexia', 'learning_style', 'processing'],
        sensory: ['sensory_processing', 'sensory_sensitivity'],
        relationships: ['attachment', 'relationship_patterns']
      };

      for (const concern of profileData.concerns) {
        if (concernMap[concern] && profileQuestions.length < availableSlots) {
          const questions = await Question.find({
            subcategory: { $in: concernMap[concern] }
          }).limit(3);
          profileQuestions.push(...questions);
        }
      }
    }

    // Age-specific questions
    if (profileData.demographics?.age) {
      if (profileData.demographics.age > 30) {
        // Late diagnosis considerations
        const lateQuestions = await Question.find({
          tags: 'late_diagnosis'
        }).limit(2);
        profileQuestions.push(...lateQuestions);
      }
    }

    // Gender-specific (if relevant)
    if (
      profileData.demographics?.gender === 'female' ||
      profileData.demographics?.gender === 'non-binary'
    ) {
      // Add masking questions (higher in females/NB)
      const maskingQuestions = await Question.find({
        subcategory: 'masking',
        importance: 'high'
      }).limit(2);
      profileQuestions.push(...maskingQuestions);
    }

    return profileQuestions.slice(0, availableSlots);
  }

  /**
   * Process baseline responses and create user profile
   */
  async processBaselineResponses(baselineResponses, tier = 'standard') {
    try {
      const QuestionBank = mongoose.model('QuestionBank');

      // Analyze baseline responses to create initial profile
      const profile = await this.analyzeResponsePatterns(baselineResponses);

      // Use statistical analyzer for clustering and pattern detection
      const statisticalAnalysis = this.statisticalAnalyzer.analyzeResponses(baselineResponses, {
        traits: profile.traits,
        responses: baselineResponses,
        metadata: { phase: 'baseline' }
      });

      // Screen for neurodivergent indicators with enhanced detection
      const neurodivergentScreening = this.neurodivergentScreener.screenForNeurodivergence(
        baselineResponses,
        profile.traits,
        {
          responses: baselineResponses,
          traits: profile.traits,
          metadata: { responseCount: baselineResponses.length }
        }
      );

      // Detect activated pathways based on baseline patterns
      const activatedPathways = this.detectBaselinePathways(profile, neurodivergentScreening);

      // Enhanced profile with statistical insights and pathway activation
      const enhancedProfile = {
        traits: profile.traits,
        patterns: profile.indicators,
        archetype: statisticalAnalysis.archetype,
        neurodivergentIndicators: neurodivergentScreening.indicators,
        confidence: statisticalAnalysis.confidence,
        responseStyle: profile.responseStyle,
        activatedPathways: activatedPathways,
        tier: tier
      };

      // Get adaptive questions based on profile
      const excludeIds = baselineResponses.map(r => r.questionId);
      const adaptiveCount = this.assessmentLimits[tier] - baselineResponses.length;

      // Enhanced adaptive selection for comprehensive (paid) tier
      let adaptiveQuestions;
      if (tier === 'comprehensive') {
        // Allocate questions based on activated pathways and priorities
        const questionAllocation = this.calculateQuestionAllocation(
          enhancedProfile,
          activatedPathways,
          adaptiveCount
        );

        // Get comprehensive adaptive questions with pathway-based selection
        adaptiveQuestions = await this.selectPathwayBasedQuestions(
          QuestionBank,
          enhancedProfile,
          questionAllocation,
          excludeIds,
          tier
        );

        // Ensure continuous neurodiversity screening throughout
        const neurodiversityQuestions = await this.ensureNeurodiversityCoverage(
          QuestionBank,
          adaptiveQuestions,
          enhancedProfile,
          excludeIds
        );

        if (neurodiversityQuestions.length > 0) {
          // Replace some lower-priority questions with neurodiversity ones
          adaptiveQuestions = this.balanceQuestionSet(
            adaptiveQuestions,
            neurodiversityQuestions,
            adaptiveCount
          );
        }
      } else {
        // Standard adaptive selection for other tiers
        adaptiveQuestions = await QuestionBank.getAdaptiveQuestions(
          enhancedProfile,
          excludeIds,
          adaptiveCount
        );
      }

      logger.info('Processed baseline responses', {
        profileTraits: Object.keys(enhancedProfile.traits).length,
        archetype: enhancedProfile.archetype?.name,
        neurodivergentFlags: neurodivergentScreening?.indicators?.length || 0,
        adaptiveQuestionsSelected: adaptiveQuestions?.length || 0
      });

      return {
        profile: enhancedProfile,
        adaptiveQuestions,
        analysis: {
          statistical: statisticalAnalysis,
          neurodivergent: neurodivergentScreening
        }
      };
    } catch (error) {
      logger.error('Error processing baseline responses:', error);
      throw error;
    }
  }

  /**
   * Dynamically select next adaptive question based on responses
   */
  async selectNextAdaptiveQuestion(sessionId, allResponses, remainingQuestions, userProfile) {
    try {
      // Analyze current response patterns
      const currentPatterns = await this.analyzeResponsePatterns(allResponses);

      // Update profile with new responses
      const updatedProfile = this.updateProfile(userProfile, currentPatterns);

      // Check branching rules
      const activatedPathways = this.checkBranchingRules(currentPatterns);

      // Calculate question priorities with enhanced logic
      const priorityScores = await this.calculateAdaptivePriorities(
        updatedProfile,
        activatedPathways,
        remainingQuestions,
        allResponses.length
      );

      // Select highest priority question
      const nextQuestion = this.selectHighestPriority(priorityScores, remainingQuestions);

      logger.info('Selected next adaptive question', {
        sessionId,
        questionId: nextQuestion._id,
        pathway: activatedPathways[0]?.id,
        priority: priorityScores[nextQuestion._id],
        profileConfidence: updatedProfile.confidence
      });

      return {
        question: nextQuestion,
        updatedProfile,
        pathways: activatedPathways
      };
    } catch (error) {
      logger.error('Error selecting next adaptive question:', error);
      // Fallback to highest weight question from remaining
      const fallback = remainingQuestions.sort((a, b) => (b.weight || 1) - (a.weight || 1))[0];
      return { question: fallback, updatedProfile: userProfile, pathways: [] };
    }
  }

  /**
   * Analyze patterns in responses
   */
  async analyzeResponsePatterns(responses) {
    const patterns = {
      traits: {},
      indicators: [],
      averageScore: 0,
      consistency: 1,
      responseStyle: 'balanced'
    };

    const QuestionBank = mongoose.model('QuestionBank');

    // Collect all scores per trait for averaging
    const traitScores = {};

    // Calculate trait scores by looking up questions in database
    for (const r of responses) {
      const question = await QuestionBank.findOne({ questionId: r.questionId }).lean();
      if (question && question.trait) {
        const score = r.response || r.score || 3; // Use response value or default to 3

        // Initialize array for this trait if needed
        if (!traitScores[question.trait]) {
          traitScores[question.trait] = [];
        }

        // Add score to trait's array
        traitScores[question.trait].push(score);
        logger.info(
          `Added score ${score} for trait: ${question.trait} from question ${r.questionId}`
        );

        // Collect indicators for high scores
        if (score >= 4) {
          patterns.indicators.push(question.trait);
        }
      } else {
        logger.warn(`Question not found or no trait: ${r.questionId}`);
      }
    }

    // Calculate average score for each trait
    Object.keys(traitScores).forEach(trait => {
      const scores = traitScores[trait];
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      // Convert 1-5 scale to 0-1 for compatibility with adaptive selection
      patterns.traits[trait] = (average - 1) / 4; // This gives 0-1 range
      logger.info(
        `Trait ${trait}: ${scores.length} responses, average = ${average}, normalized = ${patterns.traits[trait]}`
      );
    });

    logger.info('Final traits extracted:', patterns.traits);

    // Calculate average response score
    const scores = responses.map(r => r.response || r.score || 3);
    patterns.averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Detect response style
    const extremeCount = scores.filter(s => s === 1 || s === 5).length;
    const neutralCount = scores.filter(s => s === 3).length;

    if (extremeCount / scores.length > 0.6) {
      patterns.responseStyle = 'extreme';
    } else if (neutralCount / scores.length > 0.5) {
      patterns.responseStyle = 'central';
    }

    // Check consistency (simplified)
    const variance = this.calculateVariance(scores);
    patterns.consistency = variance > 0.5 ? 1 : 0.7;

    return patterns;
  }

  /**
   * Check which branching rules are activated
   */
  checkBranchingRules(patterns) {
    const activatedPathways = [];

    for (const rule of this.branchingRules) {
      let activated = false;

      // Check response-based triggers
      if (rule.triggers.responses) {
        const matchCount = rule.triggers.responses.filter(trigger =>
          patterns.indicators && patterns.indicators.includes(trigger)
        ).length;

        if (matchCount >= rule.triggers.threshold) {
          // Check score threshold if specified
          if (
            !rule.triggers.scoreThreshold ||
            patterns.traits[rule.id.replace('_pathway', '')] >= rule.triggers.scoreThreshold
          ) {
            activated = true;
          }
        }
      }

      // Check combined pathway triggers
      if (rule.triggers.combined) {
        const requiredPathways = rule.triggers.combined;
        const hasAll = requiredPathways.every(p => activatedPathways.some(ap => ap.id === p));
        if (hasAll) activated = true;
      }

      if (activated) {
        activatedPathways.push(rule);
      }
    }

    return activatedPathways;
  }

  /**
   * Calculate priority scores for adaptive questions with enhanced logic
   */
  async calculateAdaptivePriorities(profile, pathways, remainingQuestions, responseCount) {
    const Question = mongoose.model('QuestionBank');
    const priorityScores = {};

    // Get question details
    const questionIds = remainingQuestions.map(q => q._id || q);
    const questions = await Question.find({ _id: { $in: questionIds } });

    for (const question of questions) {
      let priority = question.weight || 50;

      // Use adaptive diagnostic weight if available
      if (question.adaptive?.diagnosticWeight) {
        priority += question.adaptive.diagnosticWeight * 10;
      }

      // Use discrimination index for better differentiation
      if (question.adaptive?.discriminationIndex) {
        priority += question.adaptive.discriminationIndex * 20;
      }

      // Boost priority for activated pathways
      pathways.forEach(pathway => {
        if (pathway.actions.priority_boost?.includes(question.subcategory)) {
          priority += 30;
        }
        if (pathway.actions.add?.includes(question.subcategory)) {
          priority += 20;
        }
      });

      // Enhanced trait matching with profile confidence
      if (question.adaptive?.adaptiveCriteria?.triggerTraits) {
        for (const trigger of question.adaptive.adaptiveCriteria.triggerTraits) {
          const userScore = profile.traits[trigger.trait];
          if (userScore >= trigger.minScore && userScore <= trigger.maxScore) {
            priority += 25 * profile.confidence;
          }
        }
      }

      // Pattern-based priority boost
      if (question.adaptive?.adaptiveCriteria?.triggerPatterns) {
        const matchingPatterns = question.adaptive.adaptiveCriteria.triggerPatterns.filter(
          pattern => profile.patterns.includes(pattern)
        );
        priority += matchingPatterns.length * 15;
      }

      // Neurodivergent indicator boost
      if (profile.neurodivergentIndicators?.length > 0) {
        const ndCategories = ['neurodiversity', 'executive_function', 'sensory_processing'];
        if (ndCategories.includes(question.category)) {
          priority += 20;
        }
      }

      // Archetype-specific adjustments
      if (profile.archetype?.traits) {
        const archetypeMatch = this.calculateArchetypeMatch(question, profile.archetype);
        priority += archetypeMatch * 10;
      }

      // Progressive difficulty adjustment
      if (question.adaptive?.difficultyLevel) {
        const targetDifficulty = Math.min(3 + Math.floor(responseCount / 10), 5);
        const difficultyDiff = Math.abs(question.adaptive.difficultyLevel - targetDifficulty);
        priority -= difficultyDiff * 5;
      }

      // Reduce priority for redundant questions
      if (this.isAdaptiveRedundant(question, profile, responseCount)) {
        priority -= 25;
      }

      // Response style adjustments
      if (profile.responseStyle === 'extreme' && question.responseType === 'binary') {
        priority += 15;
      }
      if (profile.responseStyle === 'central' && question.responseType === 'slider') {
        priority += 10;
      }

      priorityScores[question._id] = Math.max(priority, 0);
    }

    return priorityScores;
  }

  /**
   * Check if adaptive question is redundant with enhanced logic
   */
  isAdaptiveRedundant(question, profile, responseCount) {
    // Check incompatible questions
    if (question.adaptive?.adaptiveCriteria?.incompatibleWith?.length > 0) {
      // Would need to check against already answered questions
      // This requires session context that we don't have here
    }

    // Check if we already have strong confidence for this trait area
    if (question.trait && profile.traits[question.trait]) {
      const traitScore = profile.traits[question.trait];
      const confidence = profile.confidence || 0.5;

      // If we have high confidence and extreme score, question might be redundant
      if (confidence > 0.8 && (traitScore < 1.5 || traitScore > 4.5)) {
        return true;
      }
    }

    // Category saturation check based on response count
    const categoryLimits = {
      personality: Math.min(8, Math.floor(responseCount * 0.4)),
      neurodiversity: Math.min(12, Math.floor(responseCount * 0.5)),
      cognitive: Math.min(6, Math.floor(responseCount * 0.3)),
      psychoanalytic: Math.min(8, Math.floor(responseCount * 0.3))
    };

    const categoryCount = profile.categoryCounts?.[question.category] || 0;
    if (categoryCount >= (categoryLimits[question.category] || 8)) {
      return true;
    }

    return false;
  }

  /**
   * Calculate how well question matches user's archetype
   */
  calculateArchetypeMatch(question, archetype) {
    if (!archetype?.traits || !question.trait) return 0;

    const archetypeTraitScore = archetype.traits[question.trait];
    if (archetypeTraitScore === undefined) return 0;

    // Higher match for questions that target archetype's key traits
    if (archetypeTraitScore > 3.5) return 2;
    if (archetypeTraitScore < 2.5) return 1;
    return 0;
  }

  /**
   * Update user profile with new response patterns
   */
  updateProfile(originalProfile, newPatterns) {
    const updatedProfile = { ...originalProfile };

    // Ensure traits object exists
    if (!updatedProfile.traits) {
      updatedProfile.traits = {};
    }

    // Merge traits with weighted average (new responses get slight boost)
    Object.entries(newPatterns.traits || {}).forEach(([trait, newScore]) => {
      const oldScore = updatedProfile.traits[trait] || newScore;
      updatedProfile.traits[trait] = oldScore * 0.7 + newScore * 0.3;
    });

    // Merge patterns
    updatedProfile.patterns = [
      ...new Set([...(updatedProfile.patterns || []), ...newPatterns.indicators])
    ];

    // Update response style if it changed significantly
    if (newPatterns.responseStyle !== updatedProfile.responseStyle) {
      updatedProfile.responseStyle = newPatterns.responseStyle;
    }

    // Adjust confidence based on consistency
    if (newPatterns.consistency < 0.8) {
      updatedProfile.confidence = Math.max(0.3, updatedProfile.confidence * 0.9);
    } else {
      updatedProfile.confidence = Math.min(0.95, updatedProfile.confidence * 1.05);
    }

    return updatedProfile;
  }

  /**
   * Select highest priority question
   */
  selectHighestPriority(priorityScores, remainingQuestions) {
    // Sort by priority
    const sorted = Object.entries(priorityScores).sort((a, b) => b[1] - a[1]);

    // Get top priority question
    const topQuestionId = sorted[0][0];
    return remainingQuestions.find(
      q => (q._id && q._id.toString() === topQuestionId) || q === topQuestionId
    );
  }

  /**
   * Pattern detection methods
   */
  detectInconsistency(responses) {
    // Check for contradictory responses
    const pairs = [
      ['extraversion', 'social_anxiety'],
      ['organization', 'executive_dysfunction'],
      ['emotional_stability', 'mood_swings']
    ];

    for (const [trait1, trait2] of pairs) {
      const score1 = responses.find(r => r.traits?.[trait1])?.score;
      const score2 = responses.find(r => r.traits?.[trait2])?.score;

      if (score1 && score2 && Math.abs(score1 - score2) < 1) {
        return true; // Inconsistent
      }
    }

    return false;
  }

  detectExtremeResponding(responses) {
    const scores = responses.map(r => r.score);
    const extremeCount = scores.filter(s => s === 1 || s === 5).length;
    return extremeCount / scores.length > 0.7;
  }

  detectCentralTendency(responses) {
    const scores = responses.map(r => r.score);
    const centralCount = scores.filter(s => s === 3).length;
    return centralCount / scores.length > 0.6;
  }

  detectAcquiescence(responses) {
    const scores = responses.map(r => r.score);
    const agreeCount = scores.filter(s => s >= 4).length;
    return agreeCount / scores.length > 0.8;
  }

  /**
   * Calculate priority scores for candidate questions based on patterns and pathways
   */
  async calculateQuestionPriorities(patterns, activatedPathways, questions) {
    const priorityScores = {};

    for (const question of questions) {
      let score = 1.0; // Base score

      // Boost questions related to activated pathways
      if (activatedPathways && activatedPathways.length > 0) {
        for (const pathway of activatedPathways) {
          if (pathway === 'adhd_pathway' && (question.subcategory === 'adhd' || question.instrument === 'ASRS-5')) {
            score += 2.0;
          }
          if (pathway === 'autism_pathway' && (question.subcategory === 'autism' || question.instrument === 'AQ-10')) {
            score += 2.0;
          }
          if (pathway === 'sensory_pathway' && question.instrument?.includes('SENSORY')) {
            score += 1.5;
          }
        }
      }

      // Boost questions for traits with high variance or extreme scores
      if (patterns && patterns.traits) {
        const questionTrait = question.trait;
        if (questionTrait && patterns.traits[questionTrait]) {
          const traitScore = patterns.traits[questionTrait];
          // Boost if trait score is extreme (high or low)
          if (traitScore > 0.7 || traitScore < 0.3) {
            score += 1.0;
          }
        }
      }

      // Boost questions with correlatedTraits that match current patterns
      if (question.adaptive?.correlatedTraits && patterns && patterns.traits) {
        for (const trait of question.adaptive.correlatedTraits) {
          if (patterns.traits[trait]) {
            score += 0.5;
          }
        }
      }

      // Apply diagnostic weight if present
      if (question.adaptive?.diagnosticWeight) {
        score *= question.adaptive.diagnosticWeight;
      }

      priorityScores[question._id] = score;
    }

    return priorityScores;
  }

  /**
   * Utility methods
   */
  calculateVariance(scores) {
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const squaredDiffs = scores.map(s => Math.pow(s - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / scores.length);
  }

  /**
   * Generate assessment summary
   */
  async generateAdaptiveSummary(sessionData) {
    return {
      tier: sessionData.tier,
      totalQuestions: sessionData.responses.length,
      pathwaysActivated: sessionData.adaptiveMetadata?.pathwaysActivated || [],
      primaryProfile: await this.determinePrimaryProfile(sessionData),
      confidenceLevel: await this.calculateConfidence(sessionData),
      recommendations: this.generateRecommendations(sessionData)
    };
  }

  async determinePrimaryProfile(sessionData) {
    const patterns = await this.analyzeResponsePatterns(sessionData.responses);
    const profiles = [];

    // Check for neurodivergent profiles
    if (patterns.traits.adhd_indicators > 3.5) {
      profiles.push('ADHD');
    }
    if (patterns.traits.autism_indicators > 3.5) {
      profiles.push('Autism');
    }
    if (patterns.traits.adhd_indicators > 3.5 && patterns.traits.autism_indicators > 3.5) {
      return 'AuDHD';
    }

    // Check for mental health
    if (patterns.traits.anxiety > 3.5) {
      profiles.push('Anxiety');
    }
    if (patterns.traits.depression > 3.5) {
      profiles.push('Depression');
    }

    return profiles.length > 0 ? profiles.join(' + ') : 'Neurotypical with variations';
  }

  async calculateConfidence(sessionData) {
    const responses = sessionData.responses;

    // Factors affecting confidence
    let confidence = 0.5; // Base confidence

    // More responses = higher confidence
    if (responses.length >= 75) confidence += 0.2;
    else if (responses.length >= 45) confidence += 0.15;
    else if (responses.length >= 20) confidence += 0.1;

    // Consistent responses = higher confidence
    const patterns = await this.analyzeResponsePatterns(responses);
    confidence += patterns.consistency * 0.2;

    // Activated pathways = higher confidence
    const pathwayCount = (sessionData.adaptiveMetadata?.pathwaysActivated || []).length;
    confidence += Math.min(pathwayCount * 0.05, 0.15);

    return Math.min(confidence, 0.95); // Cap at 95%
  }

  generateRecommendations(sessionData) {
    const recommendations = {
      immediate: [],
      assessment: [],
      resources: []
    };

    const pathways = sessionData.adaptiveMetadata?.pathwaysActivated || [];

    // Generate pathway-specific recommendations
    if (pathways.includes('adhd_pathway')) {
      recommendations.immediate.push('Consider ADHD-specific support strategies');
      recommendations.assessment.push('Professional ADHD evaluation recommended');
      recommendations.resources.push('ADHD support apps: Inflow, Forest, Due');
    }

    if (pathways.includes('autism_pathway')) {
      recommendations.immediate.push('Explore sensory accommodations');
      recommendations.assessment.push('Autism assessment with neurodivergent-affirming clinician');
      recommendations.resources.push('Autism resources: ASAN, Neuroclastic, Embrace Autism');
    }

    if (pathways.includes('trauma_pathway')) {
      recommendations.immediate.push('Grounding techniques and self-care practices');
      recommendations.assessment.push('Trauma-informed therapy consultation');
      recommendations.resources.push('Trauma support: NAMI, Crisis Text Line (741741)');
    }

    return recommendations;
  }

  /**
   * Detect baseline pathways for comprehensive assessment
   */
  detectBaselinePathways(profile, neurodivergentScreening) {
    const activatedPathways = [];
    const traits = profile.traits || {};
    const indicators = neurodivergentScreening?.indicators || {};

    // Check ADHD pathway activation
    if (traits.conscientiousness < 35 || indicators.adhd?.likelihood === 'High') {
      activatedPathways.push({
        id: 'adhd_pathway',
        strength: indicators.adhd?.score || (100 - traits.conscientiousness) / 2,
        priority: 9,
        categories: ['executive_function', 'adhd_comprehensive', 'rejection_sensitivity']
      });
    }

    // Check autism pathway activation
    if (traits.extraversion < 35 || indicators.autism?.likelihood === 'High') {
      activatedPathways.push({
        id: 'autism_pathway',
        strength: indicators.autism?.score || (100 - traits.extraversion) / 2,
        priority: 9,
        categories: ['sensory_processing', 'masking_assessment', 'monotropism']
      });
    }

    // Check combined AUDHD pathway
    const hasADHD = activatedPathways.some(p => p.id === 'adhd_pathway');
    const hasAutism = activatedPathways.some(p => p.id === 'autism_pathway');
    if (hasADHD && hasAutism) {
      activatedPathways.push({
        id: 'audhd_pathway',
        strength: 80,
        priority: 10,
        categories: ['audhd_specific', 'competing_needs', 'dual_presentation']
      });
    }

    // Check high neuroticism pathway
    if (traits.neuroticism > 65) {
      activatedPathways.push({
        id: 'anxiety_pathway',
        strength: traits.neuroticism,
        priority: 7,
        categories: ['anxiety_screen', 'emotional_regulation', 'stress_management']
      });
    }

    // Check giftedness pathway
    if (traits.openness > 75 && profile.consistency > 0.8) {
      activatedPathways.push({
        id: 'gifted_pathway',
        strength: traits.openness,
        priority: 6,
        categories: ['giftedness_screen', 'overexcitabilities', 'asynchronous_development']
      });
    }

    return activatedPathways;
  }

  /**
   * Calculate question allocation for comprehensive tier
   */
  calculateQuestionAllocation(profile, pathways, totalQuestions) {
    const allocation = {};
    const remainingQuestions = totalQuestions;

    // Always include core personality and neurodiversity questions (30% minimum)
    allocation.core = {
      personality: Math.ceil(totalQuestions * 0.15),
      neurodiversity: Math.ceil(totalQuestions * 0.15)
    };

    // Allocate based on activated pathways (50%)
    const pathwayAllocation = Math.floor(totalQuestions * 0.5);
    if (pathways.length > 0) {
      const questionsPerPathway = Math.floor(pathwayAllocation / pathways.length);
      pathways.forEach(pathway => {
        allocation[pathway.id] = {
          questions: questionsPerPathway,
          categories: pathway.categories,
          priority: pathway.priority
        };
      });
    }

    // Allocate remaining for exploration and validation (20%)
    allocation.exploration = {
      questions: Math.floor(totalQuestions * 0.2),
      categories: ['validation', 'exploration', 'depth_questions']
    };

    return allocation;
  }

  /**
   * Select pathway-based questions for comprehensive assessment
   */
  async selectPathwayBasedQuestions(QuestionBank, profile, allocation, excludeIds, tier) {
    const selectedQuestions = [];

    try {
      // Get core questions first
      if (allocation.core) {
        const coreQuestions = await QuestionBank.find({
          category: { $in: ['personality', 'neurodiversity'] },
          questionId: { $nin: excludeIds },
          tier: { $in: [tier, 'standard', 'core'] }
        }).limit(allocation.core.personality + allocation.core.neurodiversity);

        selectedQuestions.push(...coreQuestions);
      }

      // Get pathway-specific questions
      const usedQuestionIds = selectedQuestions.map(q => q.questionId);
      for (const [pathwayId, config] of Object.entries(allocation)) {
        if (pathwayId !== 'core' && pathwayId !== 'exploration' && config.categories) {
          const pathwayQuestions = await QuestionBank.find({
            $or: [
              { category: { $in: config.categories } },
              { subcategory: { $in: config.categories } },
              { tags: { $in: config.categories } }
            ],
            questionId: { $nin: [...excludeIds, ...usedQuestionIds] }
          }).limit(config.questions);

          selectedQuestions.push(...pathwayQuestions);
          usedQuestionIds.push(...pathwayQuestions.map(q => q.questionId));
        }
      }

      // Fill remaining with exploration questions
      if (allocation.exploration) {
        const remainingCount = allocation.exploration.questions;
        const explorationQuestions = await QuestionBank.find({
          questionId: { $nin: [...excludeIds, ...selectedQuestions.map(q => q.questionId)] },
          weight: { $gte: 0.6 }
        })
          .sort({ weight: -1 })
          .limit(remainingCount);

        selectedQuestions.push(...explorationQuestions);
      }
    } catch (error) {
      logger.error('Error selecting pathway-based questions:', error);
    }

    return selectedQuestions;
  }

  /**
   * Ensure comprehensive neurodiversity coverage
   */
  async ensureNeurodiversityCoverage(QuestionBank, currentQuestions, profile, excludeIds) {
    const neurodiversityQuestions = [];

    // Check if we have enough neurodiversity questions
    const ndCount = currentQuestions.filter(
      q =>
        q.category === 'neurodiversity' ||
        q.subcategory?.includes('adhd') ||
        q.subcategory?.includes('autism')
    ).length;

    // For comprehensive tier, ensure at least 20% are neurodiversity-focused
    const targetNdCount = Math.ceil(currentQuestions.length * 0.2);

    if (ndCount < targetNdCount) {
      const additionalNeeded = targetNdCount - ndCount;
      const additionalQuestions = await QuestionBank.find({
        $or: [
          { category: 'neurodiversity' },
          { subcategory: { $regex: /adhd|autism|executive|sensory/i } },
          { tags: { $in: ['neurodiversity', 'adhd', 'autism', 'executive_function'] } }
        ],
        questionId: { $nin: [...excludeIds, ...currentQuestions.map(q => q.questionId)] }
      }).limit(additionalNeeded);

      neurodiversityQuestions.push(...additionalQuestions);
    }

    return neurodiversityQuestions;
  }

  /**
   * Balance question set to ensure proper coverage
   */
  balanceQuestionSet(adaptiveQuestions, neurodiversityQuestions, targetCount) {
    // Combine and prioritize questions
    const allQuestions = [...adaptiveQuestions, ...neurodiversityQuestions];

    // Sort by weight/importance
    allQuestions.sort((a, b) => {
      // Prioritize neurodiversity questions
      const aIsND = a.category === 'neurodiversity' ? 1 : 0;
      const bIsND = b.category === 'neurodiversity' ? 1 : 0;

      if (aIsND !== bIsND) return bIsND - aIsND;

      // Then by weight
      return (b.weight || 0.5) - (a.weight || 0.5);
    });

    // Return target number of questions
    return allQuestions.slice(0, targetCount);
  }
}

module.exports = AdaptiveAssessmentEngine;
