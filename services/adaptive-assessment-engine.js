const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Adaptive Assessment Engine
 * Intelligently selects questions based on user responses
 * Limits: Quick (20), Standard (45), Deep (75)
 */
class AdaptiveAssessmentEngine {
  constructor() {
    this.assessmentLimits = {
      quick: 20,
      standard: 45,
      deep: 75
    };

    // Question categories with priorities and dependencies
    this.questionPriorities = {
      core: {
        personality: { priority: 10, minQuestions: 5, maxQuestions: 10 },
        neurodiversity_screening: { priority: 9, minQuestions: 3, maxQuestions: 8 },
        mental_health_screen: { priority: 8, minQuestions: 2, maxQuestions: 6 }
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
      const limit = this.assessmentLimits[tier];
      const assessment = {
        tier,
        totalQuestions: limit,
        questions: [],
        adaptiveMetadata: {
          pathways: [],
          branchingDecisions: [],
          priorityAdjustments: []
        }
      };

      // Phase 1: Core questions (always included)
      const coreQuestions = await this.selectCoreQuestions(tier, limit);
      assessment.questions.push(...coreQuestions);

      // Phase 2: Initial branching based on user profile (if provided)
      if (initialData.demographics || initialData.concerns) {
        const profileQuestions = await this.selectProfileBasedQuestions(
          initialData,
          limit - coreQuestions.length
        );
        assessment.questions.push(...profileQuestions);
      }

      // Phase 3: Reserve space for adaptive questions
      const reservedAdaptive = Math.floor(limit * 0.4);
      assessment.adaptiveSlots = reservedAdaptive;

      logger.info('Generated adaptive assessment structure', {
        tier,
        totalQuestions: assessment.questions.length,
        adaptiveSlots: reservedAdaptive
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
   * Dynamically select next question based on responses
   */
  async selectNextQuestion(sessionId, currentResponses, remainingQuestions) {
    try {
      // Analyze response patterns
      const patterns = this.analyzeResponsePatterns(currentResponses);

      // Check branching rules
      const activatedPathways = this.checkBranchingRules(patterns);

      // Calculate question priorities
      const priorityScores = await this.calculateQuestionPriorities(
        patterns,
        activatedPathways,
        remainingQuestions
      );

      // Select highest priority question
      const nextQuestion = this.selectHighestPriority(priorityScores, remainingQuestions);

      // Log decision
      logger.info('Selected next adaptive question', {
        sessionId,
        questionId: nextQuestion._id,
        pathway: activatedPathways[0]?.id,
        priority: priorityScores[nextQuestion._id]
      });

      return nextQuestion;
    } catch (error) {
      logger.error('Error selecting next question:', error);
      // Fallback to random selection from remaining
      return remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)];
    }
  }

  /**
   * Analyze patterns in responses
   */
  analyzeResponsePatterns(responses) {
    const patterns = {
      traits: {},
      indicators: [],
      averageScore: 0,
      consistency: 1,
      responseStyle: 'balanced'
    };

    // Calculate trait scores
    responses.forEach(r => {
      if (r.traits) {
        Object.entries(r.traits).forEach(([trait, weight]) => {
          patterns.traits[trait] = (patterns.traits[trait] || 0) + r.score * weight;
        });
      }

      // Collect indicators
      if (r.score >= 4 && r.personalizationMarkers) {
        patterns.indicators.push(...r.personalizationMarkers);
      }
    });

    // Calculate average response score
    const scores = responses.map(r => r.score);
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
          patterns.indicators.includes(trigger)
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
   * Calculate priority scores for remaining questions
   */
  async calculateQuestionPriorities(patterns, pathways, remainingQuestions) {
    const Question = mongoose.model('QuestionBank');
    const priorityScores = {};

    // Get question details
    const questionIds = remainingQuestions.map(q => q._id || q);
    const questions = await Question.find({ _id: { $in: questionIds } });

    for (const question of questions) {
      let priority = question.basePriority || 50;

      // Boost priority for activated pathways
      pathways.forEach(pathway => {
        if (pathway.actions.priority_boost?.includes(question.subcategory)) {
          priority += 30;
        }
        if (pathway.actions.add?.includes(question.subcategory)) {
          priority += 20;
        }
      });

      // Boost priority for high trait indicators
      Object.entries(patterns.traits).forEach(([trait, score]) => {
        if (question.traits?.[trait] && score > 3.5) {
          priority += 10 * question.traits[trait];
        }
      });

      // Reduce priority for redundant questions
      if (this.isRedundant(question, patterns)) {
        priority -= 20;
      }

      // Adjust for response style
      if (patterns.responseStyle === 'extreme' && question.type === 'forced_choice') {
        priority += 15;
      }
      if (patterns.responseStyle === 'central' && question.type === 'slider') {
        priority += 10;
      }

      // Store priority score
      priorityScores[question._id] = priority;
    }

    return priorityScores;
  }

  /**
   * Check if question is redundant
   */
  isRedundant(question, patterns) {
    // Check if we already have strong signal for this trait
    const primaryTrait = Object.keys(question.traits || {})[0];
    if (primaryTrait && patterns.traits[primaryTrait] > 4.5) {
      return true;
    }

    // Check if we have enough data for this category
    const categoryCount = patterns.categoryCounts?.[question.category] || 0;
    const categoryLimits = {
      personality: 10,
      neurodiversity: 15,
      mental_health: 8,
      cognitive_functions: 6
    };

    if (categoryCount >= (categoryLimits[question.category] || 10)) {
      return true;
    }

    return false;
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
  generateAdaptiveSummary(sessionData) {
    return {
      tier: sessionData.tier,
      totalQuestions: sessionData.responses.length,
      pathwaysActivated: sessionData.adaptiveMetadata.pathways,
      primaryProfile: this.determinePrimaryProfile(sessionData),
      confidenceLevel: this.calculateConfidence(sessionData),
      recommendations: this.generateRecommendations(sessionData)
    };
  }

  determinePrimaryProfile(sessionData) {
    const patterns = this.analyzeResponsePatterns(sessionData.responses);
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

  calculateConfidence(sessionData) {
    const responses = sessionData.responses;

    // Factors affecting confidence
    let confidence = 0.5; // Base confidence

    // More responses = higher confidence
    if (responses.length >= 75) confidence += 0.2;
    else if (responses.length >= 45) confidence += 0.15;
    else if (responses.length >= 20) confidence += 0.1;

    // Consistent responses = higher confidence
    const patterns = this.analyzeResponsePatterns(responses);
    confidence += patterns.consistency * 0.2;

    // Activated pathways = higher confidence
    const pathwayCount = sessionData.adaptiveMetadata.pathways.length;
    confidence += Math.min(pathwayCount * 0.05, 0.15);

    return Math.min(confidence, 0.95); // Cap at 95%
  }

  generateRecommendations(sessionData) {
    const recommendations = {
      immediate: [],
      assessment: [],
      resources: []
    };

    const pathways = sessionData.adaptiveMetadata.pathways;

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
}

module.exports = AdaptiveAssessmentEngine;
