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
        'trauma_screening'
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
    trait: {
      type: String
      // openness, conscientiousness, extraversion, agreeableness, neuroticism, etc.
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
  const baselineCount = tier === 'comprehensive' ? 15 : 10;

  // Map tier to actual database tier values
  const tierMapping = {
    standard: ['core', 'comprehensive'],
    comprehensive: ['core', 'comprehensive', 'specialized'],
    quick: ['core'],
    deep: ['core', 'comprehensive', 'specialized']
  };

  const allowedTiers = tierMapping[tier] || ['core'];

  return this.find({
    'adaptive.isBaseline': true,
    tier: { $in: allowedTiers },
    $or: [
      { active: true },
      { active: { $exists: false } } // Include questions without active field for backward compatibility
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

// Static method to get adaptive questions based on user profile
questionBankSchema.statics.getAdaptiveQuestions = async function (profile, excludeIds, count = 20) {
  const { traits, patterns } = profile;

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

  // Build a smart query that prioritizes relevant questions
  const smartConditions = [];

  // 1. Questions specifically targeting extreme traits
  if (extremeTraits.length > 0) {
    extremeTraits.forEach(({ trait, score }) => {
      smartConditions.push({
        trait: trait,
        'adaptive.diagnosticWeight': { $gte: 3 } // High diagnostic value for extreme traits
      });
    });
  }

  // 2. Questions for traits needing clarification
  if (traitsToExplore.length > 0) {
    traitsToExplore.forEach(({ trait }) => {
      smartConditions.push({
        trait: trait,
        'adaptive.discriminationIndex': { $gte: 0.5 } // Good discrimination for uncertain traits
      });
    });
  }

  // 3. Include subcategory questions based on strongest/weakest traits
  const strongestTrait = Object.entries(traits).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  const weakestTrait = Object.entries(traits).reduce((a, b) => (a[1] < b[1] ? a : b))[0];

  smartConditions.push(
    { trait: strongestTrait, subcategory: { $exists: true } },
    { trait: weakestTrait, subcategory: { $exists: true } }
  );

  // First try to get questions matching our smart criteria
  let query = {
    questionId: { $nin: excludeIds },
    active: true,
    'adaptive.isBaseline': { $ne: true },
    $or: smartConditions.length > 0 ? smartConditions : [{ trait: { $exists: true } }]
  };

  let questions = await this.find(query)
    .sort({
      'adaptive.diagnosticWeight': -1,
      'adaptive.discriminationIndex': -1
    })
    .limit(count * 3); // Get more for better selection

  // If we don't have enough, add questions for complementary traits
  if (questions.length < count) {
    const complementaryQuery = {
      questionId: { $nin: [...excludeIds, ...questions.map(q => q.questionId)] },
      active: true,
      'adaptive.isBaseline': { $ne: true },
      $or: [
        // Questions that explore trait interactions
        { subcategory: { $in: ['social_interaction', 'emotional_regulation', 'decision_making'] } },
        // Questions with high diagnostic weight
        { 'adaptive.diagnosticWeight': { $gte: 4 } }
      ]
    };

    const additionalQuestions = await this.find(complementaryQuery)
      .sort({ 'adaptive.discriminationIndex': -1 })
      .limit(count - questions.length);

    questions = [...questions, ...additionalQuestions];
  }

  // If still not enough, fall back to any non-baseline questions
  if (questions.length < count) {
    const fallbackQuery = {
      questionId: { $nin: [...excludeIds, ...questions.map(q => q.questionId)] },
      active: true,
      'adaptive.isBaseline': { $ne: true }
    };

    const fallbackQuestions = await this.find(fallbackQuery)
      .sort({ 'adaptive.diagnosticWeight': -1 })
      .limit(count - questions.length);

    questions = [...questions, ...fallbackQuestions];
  }

  // Filter out incompatible questions
  const compatible = questions.filter(q => {
    const incompatible = q.adaptive?.adaptiveCriteria?.incompatibleWith || [];
    return !incompatible.some(id => excludeIds.includes(id));
  });

  // Log adaptive selection for debugging
  console.log('[Adaptive Selection] Profile traits:', traits);
  console.log('[Adaptive Selection] Extreme traits:', extremeTraits);
  console.log('[Adaptive Selection] Traits to explore:', traitsToExplore);
  console.log('[Adaptive Selection] Questions found:', questions.length);
  console.log('[Adaptive Selection] Compatible questions:', compatible.length);

  // Shuffle to add variety when questions are similar
  const shuffled = compatible.sort(() => Math.random() - 0.5);

  // Return requested count
  return shuffled.slice(0, count);
};

const QuestionBank = mongoose.model('QuestionBank', questionBankSchema);

module.exports = QuestionBank;
