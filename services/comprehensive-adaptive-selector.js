const logger = require('../utils/logger');
const { calculateFacetPriorities, getRecommendedFacetCount } = require('./facet-intelligence');

/**
 * Comprehensive Adaptive Question Selector
 * Analyzes baseline responses and selects all 50 adaptive questions at once
 * Uses rich metadata for intelligent, personalized selection
 */
class ComprehensiveAdaptiveSelector {
  constructor() {
    // Question allocation strategy for comprehensive tier
    this.allocationStrategy = {
      // Personality deep-dive (if high variance or interesting patterns)
      personality_facets: { min: 10, max: 20 },

      // Clinical psychopathology pathways (Phase 1)
      depression_clinical: { min: 0, max: 15, triggerScore: 3.5 },
      anxiety_gad: { min: 0, max: 10, triggerScore: 3.5 },
      anxiety_panic: { min: 0, max: 6, triggerScore: 3.5 },
      anxiety_social: { min: 0, max: 6, triggerScore: 3.5 },
      anxiety_ocd: { min: 0, max: 5, triggerScore: 3.5 },
      anxiety_ptsd: { min: 0, max: 5, triggerScore: 3.5 },
      substance_screening: { min: 0, max: 10, triggerScore: 2.5 },
      suicidal_ideation: { min: 0, max: 7, triggerScore: 4.0 },

      // Phase 2: Bipolar and Psychosis screening
      mania_screening: { min: 0, max: 12, triggerScore: 3.0 },
      psychosis_screening: { min: 0, max: 18, triggerScore: 3.0 },

      // Phase 2: Trauma expansion
      trauma_deep: { min: 0, max: 18, triggerScore: 2.5 }, // ACEs + Complex PTSD

      // Phase 2: HEXACO Honesty-Humility
      hexaco_honesty: { min: 0, max: 18 }, // Always allocate some if space

      // Phase 3: Resilience & Coping
      resilience_coping: { min: 3, max: 17 }, // Always allocate (protective factors)

      // Phase 3: Interpersonal Functioning (expanded attachment + circumplex)
      interpersonal_deep: { min: 0, max: 17, triggerScore: 3.0 },

      // Phase 3: Borderline Personality Features
      borderline_screening: { min: 0, max: 13, triggerScore: 3.5 },

      // Phase 3: Somatic Symptoms (PHQ-15)
      somatic_symptoms: { min: 0, max: 12, triggerScore: 3.5 },

      // Phase 3: Treatment Indicators
      treatment_planning: { min: 3, max: 14 }, // Always allocate (treatment planning)

      // Neurodiversity pathways (adaptive based on screening)
      executive_function: { min: 0, max: 10, triggerScore: 3.5 },
      sensory_processing: { min: 0, max: 8, triggerScore: 3.5 },
      adhd_deep: { min: 0, max: 8, triggerScore: 3.5 },
      autism_deep: { min: 0, max: 8, triggerScore: 3.5 },
      masking: { min: 0, max: 6, triggerScore: 3.0 },

      // Mental health and attachment
      attachment: { min: 3, max: 8 },
      trauma_screening: { min: 0, max: 6, triggerScore: 3.0 },

      // Cognitive style and processing
      cognitive_functions: { min: 4, max: 8 },
      learning_style: { min: 3, max: 6 },

      // Advanced personality models
      enneagram: { min: 0, max: 6 },

      // Fill remaining slots with high-priority discoveries
      flexible: { min: 0, max: 10 }
    };
  }

  /**
   * Main method: Analyze baseline and select all 50 adaptive questions
   */
  async selectAdaptiveQuestions(QuestionBank, baselineResponses, tier = 'comprehensive') {
    try {
      logger.info('Starting comprehensive adaptive selection', {
        baselineCount: baselineResponses.length,
        tier
      });

      // Step 1: Analyze baseline responses deeply
      const profile = this.analyzeBaselineProfile(baselineResponses);

      logger.info('[ADAPTIVE-SELECT] Baseline profile analyzed', {
        bigFive: profile.bigFive,
        neurodiversity: profile.neurodiversity,
        triggers: Array.from(profile.triggers),
        patterns: profile.patterns,
        domainScores: profile.domainScores,
        variance: profile.variance
      });

      // Step 2: Calculate question priorities based on profile
      const priorities = this.calculatePathwayPriorities(profile);

      logger.info('[ADAPTIVE-SELECT] Pathway priorities calculated', {
        priorities,
        highPriorityPathways: Object.entries(priorities)
          .filter(([, p]) => p >= 7)
          .map(([pathway]) => pathway)
      });

      // Step 3: Build allocation plan
      const allocation = this.buildAllocationPlan(priorities, 50);

      logger.info('[ADAPTIVE-SELECT] Allocation plan built', {
        allocation,
        totalAllocated: Object.values(allocation).reduce((sum, count) => sum + count, 0)
      });

      // Step 4: Select questions for each category
      const selectedQuestions = await this.selectQuestionsByAllocation(
        QuestionBank,
        allocation,
        profile,
        baselineResponses
      );

      logger.info('Adaptive selection complete', {
        totalSelected: selectedQuestions.length,
        allocation
      });

      return {
        questions: selectedQuestions,
        profile,
        allocation,
        priorities
      };
    } catch (error) {
      logger.error('Comprehensive adaptive selection failed:', error);
      throw error;
    }
  }

  /**
   * Analyze baseline responses to build comprehensive profile
   * NOTE: This is a synchronous method, but response scores should already have
   * reverse scoring applied when passed in from routes/adaptive-assessment.js
   */
  analyzeBaselineProfile(responses) {
    const profile = {
      bigFive: { openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 },
      neurodiversity: { executive: 0, sensory: 0, social: 0, attention: 0 },
      patterns: [],
      triggers: new Set(),
      variance: {},
      domainScores: {},
      rawResponses: responses // Store for later analysis
    };

    logger.info('[BASELINE-ANALYSIS] Starting analysis', {
      responseCount: responses.length,
      sampleResponse: responses[0] ? {
        questionId: responses[0].questionId,
        category: responses[0].category,
        trait: responses[0].trait,
        subcategory: responses[0].subcategory,
        score: responses[0].score
      } : 'No responses'
    });

    // Group responses by domain
    const domains = {};
    responses.forEach(resp => {
      const domain = resp.category || 'general';
      if (!domains[domain]) domains[domain] = [];
      domains[domain].push(resp.score || 3);
    });

    // Calculate domain averages and variance
    Object.entries(domains).forEach(([domain, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance = this.calculateVariance(scores);

      profile.domainScores[domain] = avg;
      profile.variance[domain] = variance;

      // Map domains to Big Five
      if (domain === 'personality') {
        responses.forEach(resp => {
          if (resp.trait && profile.bigFive.hasOwnProperty(resp.trait)) {
            if (!profile.bigFive[resp.trait]) profile.bigFive[resp.trait] = [];
            profile.bigFive[resp.trait].push(resp.score);
          }
        });
      }

      // Calculate neurodiversity indicators
      if (domain === 'neurodiversity') {
        responses.forEach(resp => {
          const subcat = resp.subcategory || '';
          if (subcat.includes('executive')) {
            profile.neurodiversity.executive = Math.max(profile.neurodiversity.executive, resp.score);
          } else if (subcat.includes('sensory')) {
            profile.neurodiversity.sensory = Math.max(profile.neurodiversity.sensory, resp.score);
          } else if (subcat.includes('social')) {
            profile.neurodiversity.social = Math.max(profile.neurodiversity.social, resp.score);
          } else if (subcat.includes('attention')) {
            profile.neurodiversity.attention = Math.max(profile.neurodiversity.attention, resp.score);
          }
        });
      }
    });

    // Average Big Five scores
    Object.keys(profile.bigFive).forEach(trait => {
      if (Array.isArray(profile.bigFive[trait]) && profile.bigFive[trait].length > 0) {
        const scores = profile.bigFive[trait];
        profile.bigFive[trait] = scores.reduce((a, b) => a + b, 0) / scores.length;
      } else {
        profile.bigFive[trait] = 3; // neutral if no data
      }
    });

    // Identify triggers and patterns
    this.identifyTriggers(profile);
    this.identifyPatterns(profile);

    return profile;
  }

  /**
   * Calculate variance of scores
   */
  calculateVariance(scores) {
    if (scores.length < 2) return 0;
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const squaredDiffs = scores.map(score => Math.pow(score - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / scores.length;
  }

  /**
   * Identify triggers from profile scores
   */
  identifyTriggers(profile) {
    // Clinical psychopathology triggers (Phase 1)
    // Check baseline clinical screening responses
    const depressionScreen = profile.baselineResponses?.find(r => r.questionId === 'BASELINE_CLINICAL_DEPRESSION');
    const anxietyScreen = profile.baselineResponses?.find(r => r.questionId === 'BASELINE_CLINICAL_ANXIETY');
    const maniaScreen = profile.baselineResponses?.find(r => r.questionId === 'BASELINE_CLINICAL_MANIA');
    const substanceScreen = profile.baselineResponses?.find(r => r.questionId === 'BASELINE_CLINICAL_SUBSTANCE');

    // Depression pathway triggers
    if (profile.bigFive.neuroticism >= 3.5 || (depressionScreen && depressionScreen.score >= 4)) {
      profile.triggers.add('depression_indicators');
      profile.triggers.add('internalizing_pathway');
    }

    // Suicidal ideation trigger (very high neuroticism)
    if (profile.bigFive.neuroticism >= 4.5) {
      profile.triggers.add('suicidal_risk');
    }

    // Anxiety pathway triggers
    if (profile.bigFive.neuroticism >= 3.5 || profile.neurodiversity.emotional_regulation >= 3.5 || (anxietyScreen && anxietyScreen.score >= 4)) {
      profile.triggers.add('anxiety_indicators');
      profile.triggers.add('internalizing_pathway');

      // Determine anxiety subtypes based on profile
      // Panic if very high neuroticism + somatic focus
      if (profile.bigFive.neuroticism >= 4.0) {
        profile.triggers.add('panic_indicators');
      }

      // Social anxiety if high neuroticism + low extraversion
      if (profile.bigFive.extraversion <= 2.5) {
        profile.triggers.add('social_anxiety_indicators');
      }

      // OCD if high conscientiousness + high neuroticism
      if (profile.bigFive.conscientiousness >= 3.8 && profile.bigFive.neuroticism >= 4.0) {
        profile.triggers.add('ocd_indicators');
      }
    }

    // PTSD trigger (trauma screening or high emotional dysregulation)
    if (profile.neurodiversity.emotional_regulation >= 4.0 || profile.bigFive.neuroticism >= 4.5) {
      profile.triggers.add('ptsd_indicators');
    }

    // Substance use triggers
    if (profile.bigFive.conscientiousness <= 2.5 || (substanceScreen && substanceScreen.score >= 3)) {
      profile.triggers.add('substance_risk');
      profile.triggers.add('externalizing_pathway');
    }

    // Executive function triggers
    if (profile.neurodiversity.executive >= 3.5) {
      profile.triggers.add('executive_dysfunction');
      profile.triggers.add('adhd_pathway');
    }

    // Sensory processing triggers
    if (profile.neurodiversity.sensory >= 3.5) {
      profile.triggers.add('sensory_sensitivity');
      profile.triggers.add('autism_pathway');
    }

    // Social communication triggers
    if (profile.neurodiversity.social >= 3.5) {
      profile.triggers.add('social_difficulty');
      profile.triggers.add('masking_indicators');
    }

    // AUDHD pathway
    if (profile.triggers.has('adhd_pathway') && profile.triggers.has('autism_pathway')) {
      profile.triggers.add('audhd_pathway');
    }

    // High neuroticism → trauma screening
    if (profile.bigFive.neuroticism >= 4.0) {
      profile.triggers.add('trauma_indicators');
    }

    // Phase 2: Mania/hypomania triggers
    // High extraversion + high neuroticism + low conscientiousness pattern
    if (profile.bigFive.extraversion >= 3.8 && profile.bigFive.neuroticism >= 3.5 && profile.bigFive.conscientiousness <= 2.5) {
      profile.triggers.add('mania_risk');
    }
    // Or baseline mania screening positive
    if (maniaScreen && maniaScreen.score >= 4) {
      profile.triggers.add('mania_risk');
    }

    // Phase 2: Psychosis risk triggers
    // Very high openness (unusual experiences) + other indicators
    if (profile.bigFive.openness >= 4.5 || (profile.bigFive.neuroticism >= 4.5 && profile.neurodiversity.social >= 4.0)) {
      profile.triggers.add('psychosis_risk');
    }
    // Or baseline psychosis screening
    const psychosisScreen = profile.baselineResponses?.find(r => r.questionId === 'BASELINE_CLINICAL_PSYCHOSIS');
    if (psychosisScreen && psychosisScreen.score >= 4) {
      profile.triggers.add('psychosis_risk');
    }

    // Phase 2: Trauma deep-dive triggers
    // Initial trauma screening positive OR existing trauma_indicators
    if (profile.triggers.has('trauma_indicators')) {
      profile.triggers.add('trauma_deep');
    }
    // Or high neurodiversity emotional dysregulation (possible Complex PTSD)
    if (profile.neurodiversity.emotional_regulation >= 4.0) {
      profile.triggers.add('trauma_deep');
    }

    // Phase 3: Borderline personality features triggers
    // High emotional dysregulation + high neuroticism + low agreeableness pattern
    if (profile.bigFive.neuroticism >= 4.0 && profile.bigFive.agreeableness <= 2.5) {
      profile.triggers.add('borderline_risk');
    }
    // Or very high emotional dysregulation + relationship instability indicators
    if (profile.neurodiversity.emotional_regulation >= 4.5 ||
        (profile.bigFive.neuroticism >= 4.5 && profile.neurodiversity.social >= 3.5)) {
      profile.triggers.add('borderline_risk');
    }

    // Phase 3: Somatic symptoms triggers
    // High neuroticism (somatization common)
    if (profile.bigFive.neuroticism >= 4.0) {
      profile.triggers.add('somatic_concerns');
    }
    // Or health-related anxiety indicators
    if (profile.triggers.has('anxiety_indicators') && profile.bigFive.neuroticism >= 3.8) {
      profile.triggers.add('somatic_concerns');
    }

    // Phase 3: Interpersonal deep-dive triggers
    // Relationship or attachment concerns
    if (profile.bigFive.agreeableness <= 2.5 || profile.neurodiversity.social >= 3.5) {
      profile.triggers.add('interpersonal_concerns');
    }
    // Or existing attachment indicators
    if (profile.triggers.has('borderline_risk')) {
      profile.triggers.add('interpersonal_concerns');
    }

    // Personality extremes
    Object.entries(profile.bigFive).forEach(([trait, score]) => {
      if (score >= 4.2) profile.triggers.add(`high_${trait}`);
      if (score <= 1.8) profile.triggers.add(`low_${trait}`);
    });
  }

  /**
   * Identify patterns in responses
   */
  identifyPatterns(profile) {
    // High variance in neurodiversity domain suggests complex presentation
    if (profile.variance.neurodiversity > 1.5) {
      profile.patterns.push('complex_neurodivergent_presentation');
    }

    // Consistent high executive dysfunction
    if (profile.neurodiversity.executive >= 4.0) {
      profile.patterns.push('significant_executive_challenges');
    }

    // Sensory seeking vs avoiding
    if (profile.neurodiversity.sensory >= 4.0) {
      profile.patterns.push('sensory_processing_differences');
    }

    // Personality coherence
    const bigFiveVariance = this.calculateVariance(Object.values(profile.bigFive));
    if (bigFiveVariance < 0.5) {
      profile.patterns.push('stable_personality_profile');
    } else if (bigFiveVariance > 1.5) {
      profile.patterns.push('complex_personality_dynamics');
    }
  }

  /**
   * Calculate priorities for each pathway based on profile
   */
  calculatePathwayPriorities(profile) {
    const priorities = {};

    // Clinical psychopathology pathways (Phase 1) - HIGH PRIORITY if triggered
    priorities.depression_clinical = profile.triggers.has('depression_indicators') ? 9 : 1;
    priorities.suicidal_ideation = profile.triggers.has('suicidal_risk') ? 10 : 0;  // Highest priority if triggered
    priorities.anxiety_gad = profile.triggers.has('anxiety_indicators') ? 8 : 1;
    priorities.anxiety_panic = profile.triggers.has('panic_indicators') ? 7 : 0;
    priorities.anxiety_social = profile.triggers.has('social_anxiety_indicators') ? 7 : 0;
    priorities.anxiety_ocd = profile.triggers.has('ocd_indicators') ? 7 : 0;
    priorities.anxiety_ptsd = profile.triggers.has('ptsd_indicators') ? 8 : 0;
    priorities.substance_screening = profile.triggers.has('substance_risk') ? 7 : 1;

    // Phase 2: Bipolar and Psychosis screening - HIGH PRIORITY if triggered
    priorities.mania_screening = profile.triggers.has('mania_risk') ? 9 : 0;
    priorities.psychosis_screening = profile.triggers.has('psychosis_risk') ? 10 : 0;  // Critical priority

    // Phase 2: Trauma deep-dive - HIGH PRIORITY if trauma history
    priorities.trauma_deep = profile.triggers.has('trauma_deep') ? 8 : 0;

    // Phase 2: HEXACO Honesty-Humility - Always moderate priority
    priorities.hexaco_honesty = 4;  // Adds unique value beyond Big Five

    // Phase 3: Resilience & Coping - Always moderate-high priority (protective factors)
    priorities.resilience_coping = 6;  // Important for treatment planning

    // Phase 3: Interpersonal Functioning - HIGH PRIORITY if triggered
    priorities.interpersonal_deep = profile.triggers.has('interpersonal_concerns') ? 7 : 3;

    // Phase 3: Borderline Screening - HIGH PRIORITY if triggered
    priorities.borderline_screening = profile.triggers.has('borderline_risk') ? 9 : 0;

    // Phase 3: Somatic Symptoms - HIGH PRIORITY if triggered
    priorities.somatic_symptoms = profile.triggers.has('somatic_concerns') ? 8 : 1;

    // Phase 3: Treatment Planning - Always moderate priority
    priorities.treatment_planning = 5;  // Important for treatment planning

    // Reduce personality facets if clinical pathways are high priority
    const hasHighClinicalPriority = profile.triggers.has('internalizing_pathway') || profile.triggers.has('externalizing_pathway') ||
                                     profile.triggers.has('mania_risk') || profile.triggers.has('psychosis_risk') ||
                                     profile.triggers.has('borderline_risk');
    priorities.personality_facets = hasHighClinicalPriority ? 5 : 7;

    // Neurodiversity pathways (adaptive)
    priorities.executive_function = profile.triggers.has('executive_dysfunction') ? 9 : 2;
    priorities.sensory_processing = profile.triggers.has('sensory_sensitivity') ? 9 : 2;
    priorities.adhd_deep = profile.triggers.has('adhd_pathway') ? 8 : 1;
    priorities.autism_deep = profile.triggers.has('autism_pathway') ? 8 : 1;
    priorities.masking = profile.triggers.has('masking_indicators') ? 7 : 1;

    // Mental health
    priorities.attachment = 5; // Always relevant
    priorities.trauma_screening = profile.triggers.has('trauma_indicators') ? 7 : 2;

    // Cognitive and learning
    priorities.cognitive_functions = 5;
    priorities.learning_style = 4;

    // Advanced models (lower priority)
    priorities.enneagram = 3;

    return priorities;
  }

  /**
   * Build allocation plan for 50 questions
   */
  buildAllocationPlan(priorities, totalQuestions) {
    const allocation = {};
    let allocated = 0;

    // Sort pathways by priority
    const sortedPathways = Object.entries(priorities)
      .sort(([, a], [, b]) => b - a);

    // First pass: allocate minimum required questions
    sortedPathways.forEach(([pathway, priority]) => {
      const config = this.allocationStrategy[pathway];
      if (config && priority >= 5) {
        const min = config.min || 0;
        allocation[pathway] = min;
        allocated += min;
      }
    });

    // Second pass: allocate based on priority until we reach 50
    const remaining = totalQuestions - allocated;
    let distributed = 0;

    sortedPathways.forEach(([pathway, priority]) => {
      if (distributed >= remaining) return;

      const config = this.allocationStrategy[pathway];
      if (!config) return;

      const currentAlloc = allocation[pathway] || 0;
      const max = config.max || 10;
      const canAdd = max - currentAlloc;

      if (canAdd > 0 && priority >= 3) {
        // Allocate proportionally based on priority
        const proportion = priority / 10;
        const toAdd = Math.min(
          Math.ceil(canAdd * proportion),
          remaining - distributed,
          canAdd
        );

        allocation[pathway] = (allocation[pathway] || 0) + toAdd;
        distributed += toAdd;
      }
    });

    // Third pass: fill any remaining slots with flexible high-value questions
    if (distributed < remaining) {
      allocation.flexible = remaining - distributed;
    }

    return allocation;
  }

  /**
   * Select actual questions based on allocation plan
   */
  async selectQuestionsByAllocation(QuestionBank, allocation, profile, baselineResponses) {
    const selectedQuestions = [];
    const askedQuestionIds = baselineResponses.map(r => r.questionId);

    for (const [pathway, count] of Object.entries(allocation)) {
      if (count === 0) continue;

      const pathwayQuestions = await this.selectForPathway(
        QuestionBank,
        pathway,
        count,
        profile,
        askedQuestionIds
      );

      selectedQuestions.push(...pathwayQuestions);
      askedQuestionIds.push(...pathwayQuestions.map(q => q.questionId));
    }

    // Shuffle to avoid pathway clustering
    return this.shuffleArray(selectedQuestions);
  }

  /**
   * Select questions for a specific pathway
   */
  async selectForPathway(QuestionBank, pathway, count, profile, excludeIds) {
    const query = {
      questionId: { $nin: excludeIds },
      active: true
    };

    // Special handling for personality_facets: distribute across Big Five traits
    if (pathway === 'personality_facets') {
      return this.selectPersonalityFacets(QuestionBank, count, profile, excludeIds);
    }

    // Map pathway to query criteria
    const pathwayMapping = {
      // Clinical psychopathology pathways (Phase 1)
      depression_clinical: {
        category: 'clinical_psychopathology',
        subcategory: 'depression'
      },
      suicidal_ideation: {
        category: 'clinical_psychopathology',
        subcategory: { $in: ['suicidal_ideation', 'self_harm', 'suicide_attempt', 'protective_factors'] }
      },
      anxiety_gad: {
        category: 'clinical_psychopathology',
        subcategory: 'gad'
      },
      anxiety_panic: {
        category: 'clinical_psychopathology',
        subcategory: 'panic'
      },
      anxiety_social: {
        category: 'clinical_psychopathology',
        subcategory: 'social_anxiety'
      },
      anxiety_ocd: {
        category: 'clinical_psychopathology',
        subcategory: 'ocd'
      },
      anxiety_ptsd: {
        category: 'clinical_psychopathology',
        subcategory: 'ptsd'
      },
      substance_screening: {
        category: 'clinical_psychopathology',
        subcategory: { $in: ['substance_alcohol', 'substance_drugs'] }
      },

      // Phase 2: Bipolar and Psychosis screening
      mania_screening: {
        category: 'clinical_psychopathology',
        subcategory: 'mania',
        instrument: 'MDQ'
      },
      psychosis_screening: {
        category: 'clinical_psychopathology',
        subcategory: 'psychotic_spectrum',
        instrument: 'PQ-B'
      },

      // Phase 2: Trauma deep-dive (ACEs + Complex PTSD)
      trauma_deep: {
        category: 'trauma_screening',
        subcategory: { $in: ['aces', 'complex_ptsd'] }
      },

      // Phase 2: HEXACO Honesty-Humility
      hexaco_honesty: {
        category: 'personality',
        subcategory: 'hexaco_honesty_humility',
        instrument: 'HEXACO-60'
      },

      // Phase 3: Resilience & Coping
      resilience_coping: {
        category: 'personality',
        subcategory: 'resilience_coping'
      },

      // Phase 3: Interpersonal Functioning (expanded attachment + circumplex)
      interpersonal_deep: {
        $or: [
          { category: 'attachment', subcategory: { $in: ['anxious_attachment', 'avoidant_attachment'] } },
          { category: 'personality', subcategory: 'interpersonal_circumplex' }
        ]
      },

      // Phase 3: Borderline Personality Features
      borderline_screening: {
        category: 'clinical_psychopathology',
        subcategory: 'borderline_features',
        instrument: 'MSI-BPD'
      },

      // Phase 3: Somatic Symptoms (PHQ-15)
      somatic_symptoms: {
        category: 'clinical_psychopathology',
        subcategory: 'somatic_symptoms',
        instrument: 'PHQ-15'
      },

      // Phase 3: Treatment Indicators
      treatment_planning: {
        category: 'clinical_psychopathology',
        subcategory: 'treatment_indicators'
      },

      // Neurodiversity pathways
      executive_function: {
        subcategory: 'executive_function'
      },
      sensory_processing: {
        subcategory: { $in: ['sensory_processing', 'sensory_sensitivity'] }
      },
      adhd_deep: {
        tags: { $in: ['adhd'] },
        subcategory: { $nin: ['executive_function'] } // Exclude EF questions (selected separately)
      },
      autism_deep: {
        tags: { $in: ['autism'] },
        subcategory: { $nin: ['sensory_processing', 'sensory_sensitivity', 'masking'] } // Exclude sensory/masking (selected separately)
      },
      masking: {
        subcategory: 'masking'
      },
      attachment: {
        category: 'attachment'
      },
      trauma_screening: {
        category: 'trauma_screening'
      },
      cognitive_functions: {
        category: 'cognitive_functions'
      },
      learning_style: {
        category: 'learning_style'
      },
      enneagram: {
        category: 'enneagram'
      },
      flexible: {} // No specific filter, just exclude asked
    };

    const pathwayQuery = pathwayMapping[pathway];
    if (pathwayQuery) {
      Object.assign(query, pathwayQuery);
    }

    // Fetch questions
    const questions = await QuestionBank.find(query).limit(count * 3); // Get extras for prioritization

    logger.info(`[ADAPTIVE-SELECT] Questions fetched for pathway "${pathway}"`, {
      pathway,
      requested: count,
      found: questions.length,
      query: pathwayQuery
    });

    // Prioritize and select top N
    const prioritized = this.prioritizeQuestions(questions, profile, pathway);

    const selected = prioritized.slice(0, count).map(q => ({
      ...q.toObject(),
      id: q.questionId
    }));

    logger.info(`[ADAPTIVE-SELECT] Selected ${selected.length} questions for pathway "${pathway}"`, {
      questionIds: selected.map(q => q.questionId).slice(0, 5)
    });

    return selected;
  }

  /**
   * Select personality facet questions distributed across Big Five traits
   * ENHANCED: Uses facet-level intelligence for nuanced assessment
   */
  async selectPersonalityFacets(QuestionBank, count, profile, excludeIds) {
    const bigFiveTraits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    const selectedQuestions = [];

    // Calculate trait priorities with enhanced allocation for extreme scores
    const traitPriorities = bigFiveTraits.map(trait => {
      const score = profile.bigFive[trait];
      let priority = 5; // base
      let allocation = 0;

      // Allocate based on extremity (more extreme = more questions)
      const extremity = Math.abs(score - 3);
      if (extremity >= 1.5) {
        priority += 10;
        allocation = Math.ceil(count * 0.30); // 30% for very extreme traits
      } else if (extremity >= 1.0) {
        priority += 7;
        allocation = Math.ceil(count * 0.25); // 25% for extreme traits
      } else if (extremity >= 0.5) {
        priority += 4;
        allocation = Math.ceil(count * 0.20); // 20% for moderate traits
      } else {
        priority += 2;
        allocation = Math.ceil(count * 0.15); // 15% for neutral traits
      }

      return { trait, priority, score, allocation };
    });

    // Sort by priority
    traitPriorities.sort((a, b) => b.priority - a.priority);

    // Normalize allocations to match total count
    let totalAllocated = traitPriorities.reduce((sum, t) => sum + t.allocation, 0);
    if (totalAllocated > count) {
      // Scale down proportionally
      const scale = count / totalAllocated;
      traitPriorities.forEach(t => {
        t.allocation = Math.max(1, Math.floor(t.allocation * scale));
      });
      totalAllocated = traitPriorities.reduce((sum, t) => sum + t.allocation, 0);
    }

    // Distribute remaining questions to top priority traits
    const remaining = count - totalAllocated;
    for (let i = 0; i < remaining && i < traitPriorities.length; i++) {
      traitPriorities[i].allocation++;
    }

    // Select questions for each trait using facet intelligence
    for (const { trait, allocation } of traitPriorities) {
      if (allocation === 0) continue;

      // Get facet priorities for this trait using intelligent analysis
      const facetPriorities = calculateFacetPriorities(profile, trait);

      // Fetch questions prioritized by facet intelligence
      // Strategy: Distribute across multiple facets for diversity
      const selectedForTrait = [];
      const maxQuestionsPerFacet = Math.max(1, Math.floor(allocation / 3)); // Limit per facet for diversity

      for (const { facet, priority: facetPriority } of facetPriorities) {
        if (selectedForTrait.length >= allocation) break;

        const facetQuestions = await QuestionBank.find({
          questionId: { $nin: [...excludeIds, ...selectedQuestions.map(q => q.questionId)] },
          active: true,
          category: 'personality',
          trait: trait,
          facet: facet,
          instrument: { $in: ['NEO-PI-R', 'BFI-2-Improved'] }
        }).limit(3);

        // Limit questions per facet to ensure diversity
        const questionsToAdd = Math.min(
          facetQuestions.length,
          maxQuestionsPerFacet,
          allocation - selectedForTrait.length
        );

        if (questionsToAdd > 0) {
          selectedForTrait.push(...facetQuestions.slice(0, questionsToAdd));
        }
      }

      selectedQuestions.push(...selectedForTrait);

      logger.info(`[FACET-SELECT] Selected ${selectedForTrait.length} facet questions for ${trait}`, {
        allocation,
        facetsUsed: [...new Set(selectedForTrait.map(q => q.facet))].length,
        facets: [...new Set(selectedForTrait.map(q => q.facet))]
      });
    }

    return selectedQuestions.map(q => ({
      ...q.toObject(),
      id: q.questionId
    }));
  }

  /**
   * Prioritize questions within a pathway
   */
  prioritizeQuestions(questions, profile, pathway) {
    return questions.sort((a, b) => {
      let scoreA = 5; // base score
      let scoreB = 5;

      // Boost based on trait alignment
      if (a.trait && profile.bigFive[a.trait]) {
        scoreA += Math.abs(profile.bigFive[a.trait] - 3); // Extremes get higher priority
      }
      if (b.trait && profile.bigFive[b.trait]) {
        scoreB += Math.abs(profile.bigFive[b.trait] - 3);
      }

      // Boost validated instruments
      if (a.tags?.includes('validated')) scoreA += 2;
      if (b.tags?.includes('validated')) scoreB += 2;

      // Boost if matches patterns
      if (a.subcategory && profile.patterns.some(p => p.includes(a.subcategory))) scoreA += 3;
      if (b.subcategory && profile.patterns.some(p => p.includes(b.subcategory))) scoreB += 3;

      return scoreB - scoreA;
    });
  }

  /**
   * Shuffle array to avoid clustering
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

module.exports = ComprehensiveAdaptiveSelector;
