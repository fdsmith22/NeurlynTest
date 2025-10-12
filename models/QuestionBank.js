const mongoose = require('mongoose');

/**
 * Question Bank Schema - Stores all assessment questions
 * No user data is stored here
 */
const questionBankSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    text: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: [
        'personality',
        'neurodiversity',
        'cognitive',
        'lateral',
        'interactive',
        'psychoanalytic',
        'cognitive_functions',
        'enneagram',
        'attachment',
        'defense_mechanisms',
        'learning_style',
        'trauma_screening',
        'clinical_psychopathology',
        'validity_scales'
      ],
      index: true
    },
    instrument: {
      type: String,
      required: true
      // BFI-2, HEXACO-60, ASRS-5, AQ-10, PHQ-2, GAD-2, etc.
    },
    subcategory: {
      type: String
      // executive_function, sensory_processing, masking, jungian, etc.
    },
    efDomain: {
      type: String,
      enum: ['planning', 'organization', 'timeManagement', 'workingMemory',
             'emotionalRegulation', 'taskInitiation', 'sustainedAttention', 'flexibility', null]
      // Executive function domain for neurodiversity scoring
    },
    sensoryDomain: {
      type: String,
      enum: ['visual', 'auditory', 'tactile', 'vestibular', 'oral', 'olfactory', null]
      // Sensory processing domain for neurodiversity scoring
    },
    trait: {
      type: String
      // openness, conscientiousness, extraversion, agreeableness, neuroticism, etc.
    },
    facet: {
      type: String
      // NEO-PI-R facets: fantasy, aesthetics, feelings, actions, ideas, values (openness)
      // competence, order, dutifulness, achievement_striving, self_discipline, deliberation (conscientiousness)
      // warmth, gregariousness, assertiveness, activity, excitement_seeking, positive_emotions (extraversion)
      // trust, straightforwardness, altruism, compliance, modesty, tender_mindedness (agreeableness)
      // anxiety, angry_hostility, depression, self_consciousness, impulsiveness, vulnerability (neuroticism)
    },
    responseType: {
      type: String,
      required: true,
      enum: ['likert', 'multiple-choice', 'binary', 'slider', 'ranking', 'word-association']
    },
    options: [
      {
        value: mongoose.Schema.Types.Mixed,
        label: String,
        score: Number
      }
    ],
    reverseScored: {
      type: Boolean,
      default: false
    },
    weight: {
      type: Number,
      default: 1
    },
    tier: {
      type: String,
      enum: [
        'free',
        'core',
        'comprehensive',
        'specialized',
        'quick',
        'standard',
        'deep',
        'screening'
      ],
      default: 'core'
    },
    // NEW: Assessment tier system (replaces singular tier for multi-tier support)
    assessmentTiers: {
      type: [String],
      enum: ['CORE', 'COMPREHENSIVE', 'CLINICAL_ADDON'],
      default: [],
      description: 'Which assessment tiers this question belongs to. CORE = free 30Q, COMPREHENSIVE = paid 70Q, CLINICAL_ADDON = optional clinical screening'
    },
    variations: [
      {
        language: String,
        text: String,
        culturalAdaptation: String
      }
    ],
    interactiveElements: {
      hasTimer: Boolean,
      timeLimit: Number, // in seconds
      hasVisual: Boolean,
      visualType: String, // image, animation, etc.
      requiresAudio: Boolean,
      requiresVideo: Boolean,
      gamificationPoints: Number
    },
    // Adaptive assessment fields
    adaptive: {
      isBaseline: {
        type: Boolean,
        default: false,
        description: 'Is this a baseline question for initial profiling?'
      },
      baselinePriority: {
        type: Number,
        min: 1,
        max: 10,
        description: 'Priority order for baseline questions (1 = highest)'
      },
      adaptiveCriteria: {
        triggerTraits: [
          {
            trait: String,
            minScore: Number,
            maxScore: Number
          }
        ],
        triggerPatterns: [String],
        followUpTo: [String], // Question IDs this can follow
        incompatibleWith: [String], // Question IDs that make this redundant
        requiredPrior: [String] // Question IDs that must be answered first
      },
      correlatedTraits: [
        {
          type: String,
          enum: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
        }
      ],
      diagnosticWeight: {
        type: Number,
        default: 1,
        min: 0,
        max: 5,
        description: 'Weight for clinical/diagnostic indicators'
      },
      difficultyLevel: {
        type: Number,
        min: 1,
        max: 5,
        default: 3,
        description: 'Question difficulty/depth level'
      },
      discriminationIndex: {
        type: Number,
        min: 0,
        max: 1,
        description: 'How well this question differentiates between trait levels'
      }
    },
    tags: [
      {
        type: String,
        description: 'Tags for categorization and filtering (baseline, adaptive, sensory, adhd, autism, etc.)'
      }
    ],
    // Tactful assessment fields - sensitivity and conditional triggering
    sensitivity: {
      type: String,
      enum: ['NONE', 'LOW', 'MODERATE', 'HIGH', 'EXTREME'],
      default: 'NONE',
      description: 'How sensitive/invasive this question is. EXTREME questions require strong clinical signals before asking.'
    },
    clinicalDomain: {
      type: String,
      enum: ['trauma', 'depression', 'anxiety', 'psychosis', 'mania', 'suicidality', 'substance_use', 'eating_disorders', 'personality_disorders', 'ptsd', 'ocd', null],
      description: 'Clinical domain for conditional screening questions'
    },
    requiredSignals: {
      minQuestionCount: {
        type: Number,
        description: 'Minimum number of questions answered before this can be asked'
      },
      requiredPhase: {
        type: String,
        enum: ['broad_screening', 'trait_building', 'clinical_validation', 'deepening', 'precision', 'completion', null],
        description: 'Assessment phase required before asking this question'
      },
      triggerConditions: [
        {
          dimension: {
            type: String,
            description: 'Dimension to check (e.g., emotionalDysregulation, ptsdSymptoms, depressionSeverity)'
          },
          minScore: {
            type: Number,
            description: 'Minimum score on this dimension to trigger this question'
          },
          maxScore: {
            type: Number,
            description: 'Maximum score on this dimension to trigger this question'
          },
          minLevel: {
            type: String,
            enum: ['minimal', 'mild', 'moderate', 'severe', 'extreme'],
            description: 'Minimum severity level to trigger this question'
          }
        }
      ],
      anyOf: {
        type: Boolean,
        default: false,
        description: 'If true, ANY trigger condition can be met. If false, ALL must be met.'
      }
    },
    contextMessage: {
      type: String,
      description: 'Contextual framing message to display before this question (for sensitive topics)'
    },
    gentleIntroQuestions: [
      {
        type: String,
        description: 'Question IDs to ask before this one (for nested conditional probing)'
      }
    ],
    metadata: {
      addedDate: {
        type: Date,
        default: Date.now
      },
      lastModified: Date,
      version: String,
      scientificSource: String,
      validationStudy: String
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Indexes for efficient querying
questionBankSchema.index({ category: 1, tier: 1 });
questionBankSchema.index({ instrument: 1, trait: 1 });
questionBankSchema.index({ active: 1, category: 1 });
questionBankSchema.index({ trait: 1, facet: 1 }); // Index for facet-based queries

// Static method to get questions by category and tier
questionBankSchema.statics.getQuestionsByTier = async function (category, tier) {
  return this.find({
    category,
    tier: { $in: ['free', tier] },
    active: true
  }).sort('weight');
};

// Static method to get randomized questions
questionBankSchema.statics.getRandomizedSet = async function (category, count = 50) {
  return this.aggregate([{ $match: { category, active: true } }, { $sample: { size: count } }]);
};

// Static method to get baseline questions for initial profiling
questionBankSchema.statics.getBaselineQuestions = async function (tier = 'standard') {
  const baselineCount = tier === 'comprehensive' ? 20 : (tier === 'deep' ? 25 : 10);

  // Map tier to actual database tier values
  const tierMapping = {
    standard: ['core', 'comprehensive'],
    comprehensive: ['core', 'comprehensive', 'specialized'],
    quick: ['core'],
    deep: ['core', 'comprehensive', 'specialized']
  };

  const allowedTiers = tierMapping[tier] || ['core'];

  // For comprehensive tier, ensure balanced Big Five coverage
  if (tier === 'comprehensive') {
    const bigFiveTraits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    const questionsPerTrait = 2; // 2 questions per trait = 10 total
    const neurodiversityCount = 10; // Remaining 10 for neurodiversity screening

    const selectedQuestions = [];

    // Get 2 baseline questions for each Big Five trait
    for (const trait of bigFiveTraits) {
      const traitQuestions = await this.find({
        'adaptive.isBaseline': true,
        trait: trait,
        category: 'personality',
        tier: { $in: allowedTiers },
        $or: [
          { active: true },
          { active: { $exists: false } }
        ]
      })
        .sort({ 'adaptive.baselinePriority': 1 })
        .limit(questionsPerTrait);

      selectedQuestions.push(...traitQuestions);
    }

    // Get neurodiversity screening questions
    const neuroQuestions = await this.find({
      'adaptive.isBaseline': true,
      category: 'neurodiversity',
      tier: { $in: allowedTiers },
      $or: [
        { active: true },
        { active: { $exists: false } }
      ]
    })
      .sort({ 'adaptive.baselinePriority': 1 })
      .limit(neurodiversityCount);

    selectedQuestions.push(...neuroQuestions);

    // Shuffle to mix personality and neurodiversity questions
    for (let i = selectedQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selectedQuestions[i], selectedQuestions[j]] = [selectedQuestions[j], selectedQuestions[i]];
    }

    return selectedQuestions.slice(0, baselineCount);
  }

  // For other tiers, use original logic
  return this.find({
    'adaptive.isBaseline': true,
    tier: { $in: allowedTiers },
    $or: [
      { active: true },
      { active: { $exists: false } }
    ]
  })
    .sort({ 'adaptive.baselinePriority': 1 })
    .limit(baselineCount);
};

// Enhanced method for comprehensive tier with neurodiversity screening
questionBankSchema.statics.getComprehensiveAdaptiveQuestions = async function (
  profile,
  excludeIds,
  count = 50,
  tier = 'comprehensive'
) {
  const { traits, patterns } = profile;

  // For comprehensive tier, include neurodiversity screening
  const includeNeurodiversity = tier === 'comprehensive';
  const neurodiversityCount = includeNeurodiversity ? Math.floor(count * 0.3) : 0; // 30% for neurodiversity
  const personalityCount = count - neurodiversityCount;

  // Get personality questions using existing logic
  const personalityQuestions = await this.getAdaptiveQuestions(
    profile,
    excludeIds,
    personalityCount
  );

  // Add neurodiversity screening questions for comprehensive tier
  let neurodiversityQuestions = [];
  if (includeNeurodiversity) {
    // Check for neurodiversity indicators based on personality profile
    const showADHDScreening = traits.conscientiousness < 40 || traits.neuroticism > 60;
    const showAutismScreening = traits.extraversion < 35 || patterns?.social_difficulty;

    const neuroQueries = [];

    // ADHD screening questions
    if (showADHDScreening) {
      neuroQueries.push({
        category: 'neurodiversity',
        $or: [
          { instrument: { $in: ['ASRS-5', 'NEURLYN_EXECUTIVE'] } },
          { subcategory: 'executive_function' },
          { text: /attention|focus|concentrate|hyperactive|impulsive/i }
        ]
      });
    }

    // Autism screening questions
    if (showAutismScreening) {
      neuroQueries.push({
        category: 'neurodiversity',
        $or: [
          { instrument: { $in: ['AQ-10', 'NEURLYN_SENSORY', 'NEURLYN_MASKING'] } },
          { subcategory: { $in: ['sensory_processing', 'social_interaction'] } },
          { text: /routine|pattern|social|sensory|literal/i }
        ]
      });
    }

    // General neurodiversity questions if no specific flags
    if (neuroQueries.length === 0) {
      neuroQueries.push({
        category: 'neurodiversity',
        instrument: { $in: ['NEURLYN_EMOTIONAL', 'NEURLYN_INTERESTS'] }
      });
    }

    const neuroQuery = {
      questionId: { $nin: [...excludeIds, ...personalityQuestions.map(q => q.questionId)] },
      active: true,
      $or: neuroQueries
    };

    neurodiversityQuestions = await this.find(neuroQuery)
      .sort({ 'adaptive.diagnosticWeight': -1 })
      .limit(neurodiversityCount);
  }

  // Combine and shuffle the questions
  const allQuestions = [...personalityQuestions, ...neurodiversityQuestions];

  // Shuffle to mix personality and neurodiversity questions
  for (let i = allQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
  }

  return allQuestions.slice(0, count);
};

// Helper method to calculate neurodiversity indicators from responses
questionBankSchema.statics.calculateNeurodiversityIndicators = function(profile) {
  const { traits, responses = [] } = profile;
  let indicatorScore = 0;

  // Check trait patterns that correlate with neurodiversity
  if (traits.neuroticism > 65 && traits.conscientiousness < 40) {
    indicatorScore += 0.2; // Executive function challenges pattern
  }

  if (traits.openness > 75 && Math.abs(traits.extraversion - 50) > 30) {
    indicatorScore += 0.15; // Intense interests + social extremes
  }

  // Check response patterns
  if (responses && responses.length > 0) {
    // High variability in response times can indicate attention regulation
    const responseTimes = responses.map(r => r.responseTime || 3000);
    const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const variance = responseTimes.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / responseTimes.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev / avgTime > 0.5) {
      indicatorScore += 0.15; // High response time variability
    }

    // Check for extreme responses pattern (all or nothing thinking)
    const extremeResponses = responses.filter(r => r.value === 1 || r.value === 5).length;
    if (extremeResponses / responses.length > 0.6) {
      indicatorScore += 0.1;
    }
  }

  return Math.min(indicatorScore, 1.0); // Cap at 1.0
};

// Helper method to calculate sensory indicators
questionBankSchema.statics.calculateSensoryIndicators = function(profile) {
  const { traits, responses = [] } = profile;
  let indicatorScore = 0;

  // High neuroticism often correlates with sensory sensitivity
  if (traits.neuroticism > 60) {
    indicatorScore += 0.2;
  }

  // Check if any gateway sensory questions were answered positively
  const sensoryKeywords = ['noise', 'light', 'texture', 'crowd', 'sensitive', 'overwhelm'];
  const sensoryResponses = responses.filter(r =>
    r.questionText && sensoryKeywords.some(keyword =>
      r.questionText.toLowerCase().includes(keyword)
    )
  );

  sensoryResponses.forEach(r => {
    if (r.value >= 4) indicatorScore += 0.15;
  });

  return Math.min(indicatorScore, 1.0);
};

// Helper method to dynamically adjust diversity targets based on indicators
questionBankSchema.statics.adjustDiversityTargets = function(count, indicators) {
  const { neurodiversity, sensory, communication } = indicators;

  // Start with base ranges
  const targets = {
    personality: Math.floor(count * 0.4),     // Base 40%
    facets: Math.floor(count * 0.25),         // Base 25%
    communication: Math.ceil(count * 0.1),     // Always at least 10%
    processing: Math.ceil(count * 0.05),       // Base 5%
    neurodiversity: 0,                         // Start at 0
    sensory: 0,                                // Start at 0
    other: Math.ceil(count * 0.05)            // Base 5%
  };

  // Adjust based on indicators
  if (neurodiversity > 0.3) {
    // Progressive scaling: more indicators = more questions
    targets.neurodiversity = Math.ceil(count * Math.min(0.25, neurodiversity * 0.3));
    targets.personality = Math.max(Math.floor(count * 0.3), targets.personality - targets.neurodiversity/2);
  }

  if (sensory > 0.3) {
    targets.sensory = Math.ceil(count * Math.min(0.15, sensory * 0.2));
    targets.facets = Math.max(Math.floor(count * 0.15), targets.facets - targets.sensory/2);
  }

  // Communication questions scale with extraversion variance from midpoint
  if (communication > 0) {
    targets.communication = Math.ceil(count * Math.min(0.2, 0.1 + communication * 0.1));
  }

  // Ensure we don't exceed total count
  const total = Object.values(targets).reduce((a, b) => a + b, 0);
  if (total > count) {
    // Scale down proportionally
    const scale = count / total;
    Object.keys(targets).forEach(key => {
      targets[key] = Math.floor(targets[key] * scale);
    });
  }

  return targets;
};

// Static method to get adaptive questions based on user profile with diversity
questionBankSchema.statics.getAdaptiveQuestions = async function (profile, excludeIds, count = 20) {
  const { traits, patterns, responses } = profile;

  // Identify traits that need more exploration (extreme or uncertain scores)
  const traitsToExplore = [];
  const extremeTraits = [];

  for (const [trait, score] of Object.entries(traits)) {
    // Focus on extreme scores (very high or very low)
    if (score > 70) {
      extremeTraits.push({ trait, direction: 'high', score });
    } else if (score < 30) {
      extremeTraits.push({ trait, direction: 'low', score });
    } else if (score >= 45 && score <= 55) {
      // Also explore uncertain/middle scores that need clarification
      traitsToExplore.push({ trait, direction: 'uncertain', score });
    }
  }

  // Calculate indicators for specialized question selection
  const indicators = {
    neurodiversity: this.calculateNeurodiversityIndicators(profile),
    sensory: this.calculateSensoryIndicators(profile),
    communication: Math.abs(traits.extraversion - 50) / 50  // 0-1 scale based on deviation from midpoint
  };

  console.log('[Adaptive Selection] Calculated indicators:', indicators);

  // Dynamically adjust diversity targets based on indicators
  const diversityTargets = this.adjustDiversityTargets(count, indicators);

  // Track selected questions by category
  const selectedQuestions = [];
  const categoryCount = {
    personality: 0,
    facets: 0,
    communication: 0,
    processing: 0,
    neurodiversity: 0,
    other: 0
  };

  // Priority 1: Get NEO-PI-R facet questions for extreme traits
  if (extremeTraits.length > 0) {
    const facetConditions = [];
    extremeTraits.forEach(({ trait }) => {
      facetConditions.push({
        trait: trait,
        facet: { $exists: true, $ne: null },
        instrument: 'NEO-PI-R'
      });
    });

    const facetQuestions = await this.find({
      questionId: { $nin: excludeIds },
      active: true,
      $or: facetConditions
    })
    .sort({ 'adaptive.diagnosticWeight': -1 })
    .limit(diversityTargets.facets);

    facetQuestions.forEach(q => {
      if (categoryCount.facets < diversityTargets.facets) {
        selectedQuestions.push(q);
        categoryCount.facets++;
        categoryCount.personality++;
      }
    });
  }

  // Priority 2: Get communication questions for extraverts/introverts
  if (traits.extraversion !== undefined) {
    const commQuery = {
      questionId: { $nin: [...excludeIds, ...selectedQuestions.map(q => q.questionId)] },
      active: true,
      $or: [
        { instrument: 'NEURLYN_COMMUNICATION' },
        { 'adaptive.correlatedTraits': 'extraversion' }
      ]
    };

    const commQuestions = await this.find(commQuery)
      .sort({ 'adaptive.diagnosticWeight': -1 })
      .limit(diversityTargets.communication);

    commQuestions.forEach(q => {
      if (categoryCount.communication < diversityTargets.communication) {
        selectedQuestions.push(q);
        categoryCount.communication++;
      }
    });
  }

  // Priority 3: Get processing questions for high openness or low conscientiousness
  if (traits.openness > 65 || traits.conscientiousness < 35) {
    const procQuery = {
      questionId: { $nin: [...excludeIds, ...selectedQuestions.map(q => q.questionId)] },
      active: true,
      $or: [
        { instrument: 'NEURLYN_PROCESSING' },
        { 'adaptive.correlatedTraits': { $in: ['openness', 'conscientiousness'] } }
      ]
    };

    const procQuestions = await this.find(procQuery)
      .sort({ 'adaptive.diagnosticWeight': -1 })
      .limit(diversityTargets.processing);

    procQuestions.forEach(q => {
      if (categoryCount.processing < diversityTargets.processing) {
        selectedQuestions.push(q);
        categoryCount.processing++;
      }
    });
  }

  // Build smart conditions for remaining personality questions
  const smartConditions = [];

  // Questions for extreme traits not covered by facets
  if (extremeTraits.length > 0) {
    extremeTraits.forEach(({ trait, score }) => {
      smartConditions.push({
        trait: trait,
        'adaptive.diagnosticWeight': { $gte: 3 }
      });
    });
  }

  // Questions for traits needing clarification
  if (traitsToExplore.length > 0) {
    traitsToExplore.forEach(({ trait }) => {
      smartConditions.push({
        trait: trait,
        'adaptive.discriminationIndex': { $gte: 0.5 }
      });
    });
  }

  // Include correlated trait questions
  smartConditions.push(
    { 'adaptive.correlatedTraits': { $in: Object.keys(traits) } }
  );

  // Include subcategory questions based on strongest/weakest traits
  const strongestTrait = Object.entries(traits).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  const weakestTrait = Object.entries(traits).reduce((a, b) => (a[1] < b[1] ? a : b))[0];

  smartConditions.push(
    { trait: strongestTrait, subcategory: { $exists: true } },
    { trait: weakestTrait, subcategory: { $exists: true } }
  );

  // Get remaining personality questions to fill quota
  const remainingNeeded = count - selectedQuestions.length;

  if (remainingNeeded > 0 && smartConditions.length > 0) {
    const personalityQuery = {
      questionId: { $nin: [...excludeIds, ...selectedQuestions.map(q => q.questionId)] },
      active: true,
      'adaptive.isBaseline': { $ne: true },
      $or: smartConditions
    };

    const personalityQuestions = await this.find(personalityQuery)
      .sort({
        'adaptive.diagnosticWeight': -1,
        'adaptive.discriminationIndex': -1
      })
      .limit(remainingNeeded * 2);

    personalityQuestions.forEach(q => {
      if (selectedQuestions.length < count) {
        selectedQuestions.push(q);
        if (q.category === 'personality') categoryCount.personality++;
      }
    });
  }

  // Priority 4: Add neurodiversity screening questions ONLY if indicators suggest
  if (selectedQuestions.length < count && diversityTargets.neurodiversity > 0) {
    console.log('[Adaptive Selection] Including neurodiversity questions based on indicators:', indicators.neurodiversity);

    const neuroQuery = {
      questionId: { $nin: [...excludeIds, ...selectedQuestions.map(q => q.questionId)] },
      active: true,
      category: 'neurodiversity'
    };

    const neuroQuestions = await this.find(neuroQuery)
      .sort({ 'adaptive.diagnosticWeight': -1 })
      .limit(diversityTargets.neurodiversity);

    neuroQuestions.forEach(q => {
      if (selectedQuestions.length < count && categoryCount.neurodiversity < diversityTargets.neurodiversity) {
        selectedQuestions.push(q);
        categoryCount.neurodiversity++;
      }
    });
  }

  // Priority 4b: Add sensory questions ONLY if indicators suggest
  if (selectedQuestions.length < count && diversityTargets.sensory > 0) {
    console.log('[Adaptive Selection] Including sensory questions based on indicators:', indicators.sensory);

    const sensoryQuery = {
      questionId: { $nin: [...excludeIds, ...selectedQuestions.map(q => q.questionId)] },
      active: true,
      $or: [
        { instrument: { $in: ['NEURLYN_SENSORY', 'SPQ', 'SENSORY'] } },
        { text: /sensory|light|sound|touch|texture|smell|taste/i }
      ]
    };

    const sensoryQuestions = await this.find(sensoryQuery)
      .sort({ 'adaptive.diagnosticWeight': -1 })
      .limit(diversityTargets.sensory);

    sensoryQuestions.forEach(q => {
      if (selectedQuestions.length < count && categoryCount.sensory < diversityTargets.sensory) {
        selectedQuestions.push(q);
        categoryCount.sensory = (categoryCount.sensory || 0) + 1;
      }
    });
  }

  // Priority 5: Add other specialized questions (stress, attachment, decision-making)
  if (selectedQuestions.length < count) {
    const otherQuery = {
      questionId: { $nin: [...excludeIds, ...selectedQuestions.map(q => q.questionId)] },
      active: true,
      $or: [
        { instrument: 'NEURLYN_STRESS' },
        { instrument: 'NEURLYN_DECISION' },
        { instrument: 'NEURLYN_ATTACHMENT' },
        { category: 'attachment' }
      ]
    };

    const otherQuestions = await this.find(otherQuery)
      .sort({ 'adaptive.diagnosticWeight': -1 })
      .limit(diversityTargets.other);

    otherQuestions.forEach(q => {
      if (selectedQuestions.length < count && categoryCount.other < diversityTargets.other) {
        selectedQuestions.push(q);
        categoryCount.other++;
      }
    });
  }

  // Fill any remaining slots with high-quality questions
  if (selectedQuestions.length < count) {
    const fallbackQuery = {
      questionId: { $nin: [...excludeIds, ...selectedQuestions.map(q => q.questionId)] },
      active: true,
      'adaptive.isBaseline': { $ne: true },
      'adaptive.diagnosticWeight': { $gte: 2 }
    };

    const fallbackQuestions = await this.find(fallbackQuery)
      .sort({ 'adaptive.diagnosticWeight': -1 })
      .limit(count - selectedQuestions.length);

    fallbackQuestions.forEach(q => {
      if (selectedQuestions.length < count) {
        selectedQuestions.push(q);
      }
    });
  }

  // Log adaptive selection for debugging
  console.log('[Adaptive Selection] Profile traits:', traits);
  console.log('[Adaptive Selection] Extreme traits:', extremeTraits);
  console.log('[Adaptive Selection] Category distribution:', categoryCount);
  console.log('[Adaptive Selection] Total questions selected:', selectedQuestions.length);

  // Log instrument diversity
  const instruments = {};
  selectedQuestions.forEach(q => {
    if (q.instrument) {
      instruments[q.instrument] = (instruments[q.instrument] || 0) + 1;
    }
  });
  console.log('[Adaptive Selection] Instrument diversity:', instruments);

  // Shuffle to add variety while maintaining diversity
  const shuffled = selectedQuestions.sort(() => Math.random() - 0.5);

  // Return requested count
  return shuffled.slice(0, count);
};

const QuestionBank = mongoose.model('QuestionBank', questionBankSchema);

module.exports = QuestionBank;
