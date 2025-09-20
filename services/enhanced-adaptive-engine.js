/**
 * Enhanced Adaptive Assessment Engine
 * Deep personalization through behavioral analysis and response patterns
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

class EnhancedAdaptiveEngine {
  constructor() {
    // Enhanced branching pathways with deeper triggers
    this.branchingPathways = {
      adhd: {
        triggers: {
          executive: ['procrastination', 'time_blindness', 'forgetfulness', 'impulsivity'],
          attention: ['distractibility', 'hyperfocus', 'task_switching_difficulty'],
          hyperactivity: ['restlessness', 'fidgeting', 'mental_hyperactivity']
        },
        weight: 0,
        confidence: 0
      },
      autism: {
        triggers: {
          social: ['social_exhaustion', 'scripting', 'eye_contact_difficulty'],
          sensory: ['texture_sensitivity', 'sound_sensitivity', 'light_sensitivity'],
          patterns: ['routine_need', 'pattern_recognition', 'detail_focus']
        },
        weight: 0,
        confidence: 0
      },
      audhd: {
        triggers: {
          combined: ['executive_dysfunction', 'sensory_issues', 'social_masking'],
          unique: ['contradictory_traits', 'compensation_strategies']
        },
        weight: 0,
        confidence: 0
      },
      trauma: {
        triggers: {
          emotional: ['hypervigilance', 'emotional_dysregulation', 'dissociation'],
          behavioral: ['avoidance', 'people_pleasing', 'boundary_issues']
        },
        weight: 0,
        confidence: 0
      },
      giftedness: {
        triggers: {
          cognitive: ['abstract_thinking', 'quick_learning', 'complex_problem_solving'],
          emotional: ['intensity', 'perfectionism', 'existential_concerns']
        },
        weight: 0,
        confidence: 0
      }
    };

    // Response behavior patterns
    this.behaviorPatterns = {
      responseTime: [],
      changePatterns: [], // How often they change answers
      skipPatterns: [], // Which questions they skip
      engagementLevel: 'normal',
      confidenceLevel: 'moderate'
    };

    // Deep personality indicators
    this.personalityDepth = {
      cognitiveStyle: null,
      emotionalProfile: null,
      socialOrientation: null,
      stressResponse: null,
      motivationalDrivers: [],
      valueSystem: [],
      conflictStyle: null,
      leadershipStyle: null
    };
  }

  /**
   * Generate deeply personalized adaptive assessment
   */
  async generatePersonalizedAssessment(tier = 'standard', userData = {}) {
    const { concerns = [], demographics = {}, previousAssessments = [] } = userData;

    // Initialize user profile with demographic insights
    const userProfile = this.initializeUserProfile(demographics, concerns, previousAssessments);

    // Get tier limits
    const limits = {
      quick: 20,
      standard: 45,
      deep: 75
    };
    const totalQuestions = limits[tier] || 45;

    // Select initial question set based on profile
    const questions = await this.selectAdaptiveQuestions(userProfile, totalQuestions);

    // Add metadata for tracking
    questions.forEach((q, index) => {
      q.metadata = {
        order: index + 1,
        pathway: q.pathway || 'general',
        priority: q.priority || 50,
        triggers: q.triggers || [],
        responseTracking: {
          expectedTime: this.calculateExpectedResponseTime(q),
          behaviorMarkers: this.identifyBehaviorMarkers(q)
        }
      };
    });

    return {
      tier,
      totalQuestions,
      questions,
      userProfile,
      adaptiveMetadata: {
        pathways: Object.keys(this.branchingPathways).filter(
          p => this.branchingPathways[p].weight > 0
        ),
        primaryConcerns: concerns,
        adaptationStrategy: this.determineStrategy(userProfile)
      }
    };
  }

  /**
   * Initialize comprehensive user profile
   */
  initializeUserProfile(demographics, concerns, previousAssessments) {
    const profile = {
      age: demographics.age,
      gender: demographics.gender,
      culture: demographics.culture || 'general',
      education: demographics.education,
      concerns: concerns,
      riskFactors: [],
      protectiveFactors: [],
      lifeStage: this.determineLifeStage(demographics.age),
      previousPatterns: this.analyzePreviousAssessments(previousAssessments)
    };

    // Age-based pathway adjustments
    if (profile.age) {
      if (profile.age < 25) {
        profile.riskFactors.push('identity_formation');
        this.branchingPathways.adhd.weight += 10;
      } else if (profile.age > 40) {
        profile.riskFactors.push('late_diagnosis_possibility');
        this.branchingPathways.autism.weight += 5;
      }
    }

    // Gender-based adjustments (for masking detection)
    if (profile.gender === 'female' || profile.gender === 'non-binary') {
      profile.riskFactors.push('higher_masking_likelihood');
      this.branchingPathways.autism.weight += 10;
      this.branchingPathways.adhd.weight += 5;
    }

    // Concern-based initialization
    concerns.forEach(concern => {
      switch (concern.toLowerCase()) {
        case 'adhd':
          this.branchingPathways.adhd.weight += 25;
          break;
        case 'autism':
        case 'asd':
          this.branchingPathways.autism.weight += 25;
          break;
        case 'trauma':
        case 'ptsd':
          this.branchingPathways.trauma.weight += 25;
          break;
        case 'anxiety':
          profile.riskFactors.push('anxiety');
          this.branchingPathways.trauma.weight += 10;
          break;
        case 'depression':
          profile.riskFactors.push('depression');
          break;
        case 'gifted':
        case 'twice-exceptional':
          this.branchingPathways.giftedness.weight += 20;
          this.branchingPathways.adhd.weight += 10;
          this.branchingPathways.autism.weight += 10;
          break;
      }
    });

    return profile;
  }

  /**
   * Select questions with advanced adaptation
   */
  async selectAdaptiveQuestions(userProfile, totalQuestions) {
    const Question = mongoose.model('QuestionBank');
    const selectedQuestions = [];
    const usedIds = new Set();

    // Core personality questions (20% of total)
    const personalityCount = Math.floor(totalQuestions * 0.2);
    const personalityQuestions = await Question.find({
      category: 'personality',
      active: true
    }).limit(personalityCount);

    personalityQuestions.forEach(q => {
      selectedQuestions.push(q);
      usedIds.add(q._id.toString());
    });

    // Primary concern questions (40% of total)
    const concernCount = Math.floor(totalQuestions * 0.4);
    for (const [pathway, data] of Object.entries(this.branchingPathways)) {
      if (data.weight > 20) {
        const pathwayQuestions = await this.getPathwayQuestions(
          pathway,
          Math.ceil(concernCount * (data.weight / 100)),
          usedIds
        );

        pathwayQuestions.forEach(q => {
          q.pathway = pathway;
          q.priority = data.weight;
          selectedQuestions.push(q);
          usedIds.add(q._id.toString());
        });
      }
    }

    // Exploratory questions (20% of total)
    const exploratoryCount = Math.floor(totalQuestions * 0.2);
    const exploratoryQuestions = await this.getExploratoryQuestions(
      userProfile,
      exploratoryCount,
      usedIds
    );

    exploratoryQuestions.forEach(q => {
      selectedQuestions.push(q);
      usedIds.add(q._id.toString());
    });

    // Fill remaining with adaptive selections
    while (selectedQuestions.length < totalQuestions) {
      const nextQuestion = await this.selectNextAdaptiveQuestion(
        userProfile,
        selectedQuestions,
        usedIds
      );
      if (nextQuestion) {
        selectedQuestions.push(nextQuestion);
        usedIds.add(nextQuestion._id.toString());
      } else {
        break;
      }
    }

    return this.optimizeQuestionOrder(selectedQuestions);
  }

  /**
   * Get pathway-specific questions
   */
  async getPathwayQuestions(pathway, count, usedIds) {
    const Question = mongoose.model('QuestionBank');
    const queries = [];

    switch (pathway) {
      case 'adhd':
        queries.push(
          { category: 'neurodiversity', subcategory: 'executive_function' },
          { category: 'neurodiversity', subcategory: 'emotional_regulation' }
        );
        break;
      case 'autism':
        queries.push(
          { category: 'neurodiversity', subcategory: 'sensory_processing' },
          { category: 'neurodiversity', subcategory: 'masking' },
          { category: 'neurodiversity', subcategory: 'special_interests' }
        );
        break;
      case 'trauma':
        queries.push(
          { category: 'trauma_screening' },
          { category: 'attachment', subcategory: 'attachment_style' }
        );
        break;
      case 'giftedness':
        queries.push({ category: 'cognitive_functions' }, { category: 'learning_style' });
        break;
      case 'audhd':
        queries.push(
          { category: 'neurodiversity', subcategory: 'executive_function' },
          { category: 'neurodiversity', subcategory: 'sensory_processing' }
        );
        break;
    }

    const questions = [];
    for (const query of queries) {
      const found = await Question.find({
        ...query,
        _id: { $nin: Array.from(usedIds) },
        active: true
      }).limit(Math.ceil(count / queries.length));

      questions.push(...found);
    }

    return questions.slice(0, count);
  }

  /**
   * Get exploratory questions based on profile
   */
  async getExploratoryQuestions(userProfile, count, usedIds) {
    const Question = mongoose.model('QuestionBank');

    // Select diverse questions to explore unidentified patterns
    const categories = [
      'cognitive_functions',
      'enneagram',
      'attachment',
      'learning_style',
      'lateral'
    ];

    const questions = [];
    for (const category of categories) {
      const found = await Question.find({
        category,
        _id: { $nin: Array.from(usedIds) },
        active: true
      }).limit(Math.ceil(count / categories.length));

      questions.push(...found);
    }

    return questions.slice(0, count);
  }

  /**
   * Select next question based on current responses
   */
  async selectNextAdaptiveQuestion(userProfile, currentQuestions, usedIds) {
    const Question = mongoose.model('QuestionBank');

    // Analyze patterns in current questions
    const patterns = this.analyzeQuestionPatterns(currentQuestions);

    // Find complementary question
    const query = this.buildAdaptiveQuery(patterns, usedIds);
    const nextQuestion = await Question.findOne(query);

    return nextQuestion;
  }

  /**
   * Optimize question order for better flow and engagement
   */
  optimizeQuestionOrder(questions) {
    // Start with engaging, easy questions
    const easyStarters = questions
      .filter(q => q.category === 'personality' && !q.reverseScored)
      .slice(0, 3);

    // Group by category for better flow
    const grouped = {};
    questions.forEach(q => {
      const key = `${q.category}_${q.subcategory || 'general'}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(q);
    });

    // Interleave categories to maintain engagement
    const optimized = [...easyStarters];
    const remaining = questions.filter(q => !easyStarters.includes(q));

    // Add questions in waves
    const waves = 5;
    const waveSize = Math.ceil(remaining.length / waves);

    for (let wave = 0; wave < waves; wave++) {
      // Each wave has different category mix
      const waveQuestions = remaining.slice(wave * waveSize, (wave + 1) * waveSize);

      // Shuffle within wave for variety
      waveQuestions.sort(() => Math.random() - 0.5);
      optimized.push(...waveQuestions);
    }

    return optimized;
  }

  /**
   * Analyze response patterns for deep insights
   */
  analyzeResponsePatterns(responses, timings = []) {
    const analysis = {
      traits: {},
      indicators: new Set(),
      patterns: {
        consistency: 1,
        engagement: 'normal',
        responseStyle: 'balanced',
        confidence: 'moderate'
      },
      behavioralMarkers: [],
      pathwayActivations: {}
    };

    // Analyze response values
    const scores = responses.map(r => r.score || r.value);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Detect response patterns
    const extremeResponses = scores.filter(s => s === 1 || s === 5).length;
    const neutralResponses = scores.filter(s => s === 3).length;
    const variance = this.calculateVariance(scores);

    // Response style analysis
    if (extremeResponses / scores.length > 0.6) {
      analysis.patterns.responseStyle = 'extreme';
      analysis.behavioralMarkers.push('strong_opinions');
    } else if (neutralResponses / scores.length > 0.5) {
      analysis.patterns.responseStyle = 'central';
      analysis.behavioralMarkers.push('uncertainty', 'indecisiveness');
    } else if (variance < 0.5) {
      analysis.patterns.responseStyle = 'consistent';
      analysis.behavioralMarkers.push('stable_perspective');
    }

    // Timing analysis (if provided)
    if (timings.length > 0) {
      const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;
      const quickResponses = timings.filter(t => t < 2000).length; // Under 2 seconds
      const slowResponses = timings.filter(t => t > 10000).length; // Over 10 seconds

      if (quickResponses / timings.length > 0.7) {
        analysis.patterns.engagement = 'impulsive';
        analysis.behavioralMarkers.push('quick_decision_making', 'possible_adhd');
        this.branchingPathways.adhd.weight += 5;
      } else if (slowResponses / timings.length > 0.5) {
        analysis.patterns.engagement = 'deliberate';
        analysis.behavioralMarkers.push('careful_consideration', 'possible_anxiety');
      }
    }

    // Trait extraction from responses
    responses.forEach(r => {
      // Check for specific indicator patterns
      if (r.question?.subcategory === 'executive_function' && r.score >= 4) {
        analysis.indicators.add('executive_dysfunction');
        this.branchingPathways.adhd.weight += 2;
      }
      if (r.question?.subcategory === 'sensory_processing' && r.score >= 4) {
        analysis.indicators.add('sensory_sensitivity');
        this.branchingPathways.autism.weight += 2;
      }
      if (r.question?.subcategory === 'masking' && r.score >= 4) {
        analysis.indicators.add('masking_behaviors');
        this.branchingPathways.autism.weight += 3;
      }
      if (r.question?.subcategory === 'attachment_style') {
        if (r.score >= 4) {
          analysis.indicators.add('attachment_concerns');
          this.branchingPathways.trauma.weight += 2;
        }
      }
    });

    // Check for pathway activations
    for (const [pathway, data] of Object.entries(this.branchingPathways)) {
      if (data.weight > 30) {
        analysis.pathwayActivations[pathway] = {
          strength: data.weight,
          confidence: data.confidence || data.weight / 100
        };
      }
    }

    return analysis;
  }

  /**
   * Generate deep personalization insights
   */
  generatePersonalizationProfile(responses, analysis) {
    const profile = {
      primaryTraits: [],
      secondaryTraits: [],
      cognitiveProfile: {},
      emotionalProfile: {},
      behavioralPatterns: [],
      strengthsProfile: [],
      challengesProfile: [],
      recommendations: [],
      hiddenPatterns: []
    };

    // Extract cognitive profile
    profile.cognitiveProfile = {
      processingStyle: this.determineProcessingStyle(responses),
      learningStyle: this.determineLearningStyle(responses),
      decisionMaking: this.determineDecisionStyle(responses),
      problemSolving: analysis.patterns.responseStyle === 'extreme' ? 'decisive' : 'analytical'
    };

    // Extract emotional profile
    profile.emotionalProfile = {
      emotionalAwareness: this.calculateEmotionalAwareness(responses),
      regulationCapacity: this.calculateRegulationCapacity(responses),
      stressResponse: this.determineStressResponse(responses),
      resilienceFactors: this.identifyResilienceFactors(responses)
    };

    // Identify hidden patterns (unexpected correlations)
    profile.hiddenPatterns = this.detectHiddenPatterns(responses, analysis);

    // Generate personalized recommendations
    profile.recommendations = this.generateRecommendations(profile, analysis);

    return profile;
  }

  /**
   * Detect hidden patterns and unexpected correlations
   */
  detectHiddenPatterns(responses, analysis) {
    const patterns = [];

    // Check for twice-exceptional indicators
    const highCognitive = responses.filter(
      r => r.question?.category === 'cognitive_functions' && r.score >= 4
    ).length;
    const neurodivergent =
      analysis.indicators.has('executive_dysfunction') ||
      analysis.indicators.has('sensory_sensitivity');

    if (highCognitive > 3 && neurodivergent) {
      patterns.push({
        type: 'twice_exceptional',
        confidence: 0.7,
        description: 'Shows signs of both giftedness and neurodivergent traits'
      });
    }

    // Check for compensation strategies
    if (
      analysis.indicators.has('masking_behaviors') &&
      analysis.patterns.responseStyle === 'central'
    ) {
      patterns.push({
        type: 'compensation',
        confidence: 0.6,
        description: 'May be using compensation strategies to manage challenges'
      });
    }

    // Check for internalized struggles
    if (
      analysis.behavioralMarkers.includes('careful_consideration') &&
      analysis.indicators.has('attachment_concerns')
    ) {
      patterns.push({
        type: 'internalized_struggle',
        confidence: 0.65,
        description: 'May be dealing with internalized emotional challenges'
      });
    }

    return patterns;
  }

  /**
   * Helper methods for detailed analysis
   */
  calculateVariance(scores) {
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    return variance;
  }

  determineLifeStage(age) {
    if (age < 18) return 'adolescent';
    if (age < 25) return 'emerging_adult';
    if (age < 35) return 'young_adult';
    if (age < 50) return 'middle_adult';
    if (age < 65) return 'mature_adult';
    return 'older_adult';
  }

  determineProcessingStyle(responses) {
    // Analyze response patterns to determine cognitive processing style
    const quickResponses = responses.filter(r => r.responseTime < 3000).length;
    const ratio = quickResponses / responses.length;

    if (ratio > 0.7) return 'intuitive';
    if (ratio < 0.3) return 'analytical';
    return 'balanced';
  }

  determineLearningStyle(responses) {
    const learningQuestions = responses.filter(r => r.question?.category === 'learning_style');

    if (learningQuestions.length === 0) return 'undetermined';

    // Analyze learning style responses
    const visual = learningQuestions.filter(
      r => r.question?.trait === 'visual' && r.score >= 4
    ).length;
    const auditory = learningQuestions.filter(
      r => r.question?.trait === 'auditory' && r.score >= 4
    ).length;
    const kinesthetic = learningQuestions.filter(
      r => r.question?.trait === 'kinesthetic' && r.score >= 4
    ).length;

    const max = Math.max(visual, auditory, kinesthetic);
    if (visual === max) return 'visual';
    if (auditory === max) return 'auditory';
    if (kinesthetic === max) return 'kinesthetic';
    return 'multimodal';
  }

  determineDecisionStyle(responses) {
    const decisionPattern = responses.filter(
      r =>
        r.question?.text?.toLowerCase().includes('decision') ||
        r.question?.text?.toLowerCase().includes('choose')
    );

    if (decisionPattern.length === 0) return 'balanced';

    const avgScore = decisionPattern.reduce((sum, r) => sum + r.score, 0) / decisionPattern.length;

    if (avgScore > 3.5) return 'intuitive';
    if (avgScore < 2.5) return 'analytical';
    return 'balanced';
  }

  calculateEmotionalAwareness(responses) {
    const emotionalQuestions = responses.filter(
      r => r.question?.subcategory === 'emotional_regulation' || r.question?.trait === 'neuroticism'
    );

    if (emotionalQuestions.length === 0) return 'moderate';

    const avgScore =
      emotionalQuestions.reduce((sum, r) => sum + r.score, 0) / emotionalQuestions.length;

    if (avgScore > 3.5) return 'high';
    if (avgScore < 2.5) return 'low';
    return 'moderate';
  }

  calculateRegulationCapacity(responses) {
    const regulationQuestions = responses.filter(
      r => r.question?.subcategory === 'emotional_regulation'
    );

    if (regulationQuestions.length === 0) return 'undetermined';

    const avgScore =
      regulationQuestions.reduce((sum, r) => sum + r.score, 0) / regulationQuestions.length;

    if (avgScore > 3.5) return 'challenged';
    if (avgScore < 2.5) return 'strong';
    return 'moderate';
  }

  determineStressResponse(responses) {
    const stressIndicators = responses.filter(
      r =>
        r.question?.text?.toLowerCase().includes('stress') ||
        r.question?.text?.toLowerCase().includes('pressure') ||
        r.question?.text?.toLowerCase().includes('overwhelm')
    );

    if (stressIndicators.length === 0) return 'adaptive';

    const avgScore =
      stressIndicators.reduce((sum, r) => sum + r.score, 0) / stressIndicators.length;

    if (avgScore > 3.5) return 'reactive';
    if (avgScore < 2.5) return 'resilient';
    return 'adaptive';
  }

  identifyResilienceFactors(responses) {
    const factors = [];

    // Check for various resilience indicators
    const socialSupport = responses.find(
      r => r.question?.text?.toLowerCase().includes('support') && r.score >= 4
    );
    if (socialSupport) factors.push('social_support');

    const selfCompassion = responses.find(
      r =>
        r.question?.text?.toLowerCase().includes('self') &&
        r.question?.text?.toLowerCase().includes('kind') &&
        r.score >= 4
    );
    if (selfCompassion) factors.push('self_compassion');

    const adaptability = responses.find(
      r => r.question?.text?.toLowerCase().includes('adapt') && r.score >= 4
    );
    if (adaptability) factors.push('adaptability');

    return factors;
  }

  generateRecommendations(profile, analysis) {
    const recommendations = [];

    // Based on pathway activations
    if (analysis.pathwayActivations.adhd) {
      recommendations.push({
        category: 'adhd_support',
        priority: 'high',
        suggestions: [
          'Consider time-blocking techniques for better task management',
          'Use visual reminders and external cues',
          'Break large tasks into smaller, manageable chunks',
          'Explore body-doubling or accountability partners'
        ]
      });
    }

    if (analysis.pathwayActivations.autism) {
      recommendations.push({
        category: 'autism_support',
        priority: 'high',
        suggestions: [
          'Create predictable routines and structures',
          'Identify and respect sensory needs',
          'Practice energy management and scheduled downtime',
          'Consider communication preferences and boundaries'
        ]
      });
    }

    if (analysis.pathwayActivations.trauma) {
      recommendations.push({
        category: 'trauma_support',
        priority: 'high',
        suggestions: [
          'Explore grounding techniques for emotional regulation',
          'Consider trauma-informed therapy approaches',
          'Build a safety plan for difficult moments',
          'Practice self-compassion and patience with healing'
        ]
      });
    }

    // Based on cognitive profile
    if (profile.cognitiveProfile.processingStyle === 'intuitive') {
      recommendations.push({
        category: 'cognitive_optimization',
        priority: 'medium',
        suggestions: [
          'Trust your intuition while verifying with data',
          'Use mind-mapping for complex problems',
          'Allow time for reflection after quick decisions'
        ]
      });
    }

    // Based on emotional profile
    if (profile.emotionalProfile.regulationCapacity === 'challenged') {
      recommendations.push({
        category: 'emotional_regulation',
        priority: 'high',
        suggestions: [
          'Practice mindfulness and present-moment awareness',
          'Develop a emotions wheel for better identification',
          'Create a regulation toolkit with various strategies',
          'Consider DBT skills for emotional regulation'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Additional helper methods
   */
  calculateExpectedResponseTime(question) {
    // Estimate based on question complexity
    const baseTime = 3000; // 3 seconds base
    const complexityFactors = {
      likert: 0,
      'multiple-choice': 500,
      ranking: 2000,
      slider: 1000
    };

    const textLength = question.text.length;
    const readingTime = textLength * 30; // 30ms per character

    return baseTime + readingTime + (complexityFactors[question.responseType] || 0);
  }

  identifyBehaviorMarkers(question) {
    const markers = [];

    // Identify what behaviors this question might reveal
    if (question.subcategory === 'executive_function') {
      markers.push('organization', 'planning', 'time_management');
    }
    if (question.subcategory === 'sensory_processing') {
      markers.push('sensory_sensitivity', 'environmental_awareness');
    }
    if (question.subcategory === 'masking') {
      markers.push('social_adaptation', 'authenticity', 'energy_management');
    }
    if (question.category === 'trauma_screening') {
      markers.push('safety', 'trust', 'emotional_regulation');
    }

    return markers;
  }

  analyzeQuestionPatterns(questions) {
    const patterns = {
      categories: {},
      subcategories: {},
      traits: {}
    };

    questions.forEach(q => {
      patterns.categories[q.category] = (patterns.categories[q.category] || 0) + 1;
      if (q.subcategory) {
        patterns.subcategories[q.subcategory] = (patterns.subcategories[q.subcategory] || 0) + 1;
      }
      if (q.trait) {
        patterns.traits[q.trait] = (patterns.traits[q.trait] || 0) + 1;
      }
    });

    return patterns;
  }

  buildAdaptiveQuery(patterns, usedIds) {
    // Build query to find complementary questions
    const query = {
      _id: { $nin: Array.from(usedIds) },
      active: true
    };

    // Find underrepresented categories
    const totalQuestions = Object.values(patterns.categories).reduce((a, b) => a + b, 0);
    const avgPerCategory = totalQuestions / Object.keys(patterns.categories).length;

    const underrepresented = Object.entries(patterns.categories)
      .filter(([cat, count]) => count < avgPerCategory * 0.8)
      .map(([cat]) => cat);

    if (underrepresented.length > 0) {
      query.category = { $in: underrepresented };
    }

    return query;
  }

  analyzePreviousAssessments(previousAssessments) {
    if (!previousAssessments || previousAssessments.length === 0) {
      return null;
    }

    // Analyze patterns from previous assessments
    const patterns = {
      consistentTraits: [],
      changingTraits: [],
      trends: []
    };

    // This would analyze historical data if available
    return patterns;
  }

  determineStrategy(userProfile) {
    // Determine the best adaptation strategy
    if (userProfile.concerns.includes('adhd') && userProfile.concerns.includes('autism')) {
      return 'comprehensive_neurodivergent';
    }
    if (userProfile.riskFactors.includes('higher_masking_likelihood')) {
      return 'unmasking_focused';
    }
    if (userProfile.age < 25) {
      return 'developmental_sensitive';
    }
    if (userProfile.concerns.includes('trauma')) {
      return 'trauma_informed';
    }
    return 'standard_adaptive';
  }
}

module.exports = EnhancedAdaptiveEngine;
