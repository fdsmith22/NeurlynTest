const mongoose = require('mongoose');

/**
 * Insight Pattern Schema - Stores trait interaction patterns and insights
 * Used for generating personalized psychological insights based on trait combinations
 */
const insightPatternSchema = new mongoose.Schema(
  {
    patternId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      description: 'Human-readable name for the pattern'
    },
    category: {
      type: String,
      required: true,
      enum: [
        'trait_interaction',
        'neurodivergent_indicator',
        'cognitive_style',
        'behavioral_pattern',
        'emotional_pattern',
        'social_pattern',
        'growth_opportunity',
        'strength_indicator'
      ],
      index: true
    },
    traits: [
      {
        trait: {
          type: String,
          required: true,
          enum: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
        },
        minScore: {
          type: Number,
          min: 0,
          max: 100
        },
        maxScore: {
          type: Number,
          min: 0,
          max: 100
        },
        weight: {
          type: Number,
          default: 1.0,
          description: 'Importance of this trait in the pattern'
        }
      }
    ],
    conditions: {
      minimumTraits: {
        type: Number,
        default: 2,
        description: 'Minimum number of trait conditions that must be met'
      },
      additionalFactors: [
        {
          factor: String,
          value: mongoose.Schema.Types.Mixed,
          operator: {
            type: String,
            enum: ['equals', 'greater_than', 'less_than', 'contains', 'not_contains']
          }
        }
      ],
      responsePatterns: [
        {
          questionCategory: String,
          expectedPattern: String,
          confidence: Number
        }
      ]
    },
    insights: {
      primaryInsight: {
        type: String,
        required: true,
        description: 'Main insight text with {variable} placeholders'
      },
      supportingInsights: [
        {
          type: String,
          description: 'Additional supporting insights'
        }
      ],
      metaphors: [
        {
          type: String,
          description: 'Metaphorical descriptions for better understanding'
        }
      ],
      examples: [
        {
          context: String,
          example: String
        }
      ],
      scientificBasis: {
        type: String,
        description: 'Research-backed explanation'
      }
    },
    recommendations: {
      immediate: [
        {
          action: String,
          rationale: String,
          difficulty: {
            type: String,
            enum: ['easy', 'moderate', 'challenging']
          }
        }
      ],
      longTerm: [
        {
          goal: String,
          steps: [String],
          timeframe: String
        }
      ],
      resources: [
        {
          type: {
            type: String,
            enum: ['book', 'app', 'course', 'practice', 'professional']
          },
          title: String,
          description: String,
          url: String
        }
      ]
    },
    neurodivergent: {
      indicators: [
        {
          condition: {
            type: String,
            enum: ['adhd', 'autism', 'audhd', 'hsp', 'dyslexia', 'dyspraxia', 'ocd']
          },
          confidence: {
            type: Number,
            min: 0,
            max: 1,
            description: 'Confidence score for this indicator'
          },
          markers: [String],
          explanation: String
        }
      ],
      screeningQuestions: [String],
      differentialFactors: [String]
    },
    validity: {
      confidenceScore: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.7,
        description: 'Statistical confidence in this pattern'
      },
      sampleSize: {
        type: Number,
        description: 'Number of assessments used to validate this pattern'
      },
      lastValidated: {
        type: Date,
        default: Date.now
      },
      citations: [
        {
          title: String,
          authors: [String],
          year: Number,
          doi: String
        }
      ]
    },
    tier: {
      type: String,
      enum: ['standard', 'comprehensive', 'clinical'],
      default: 'standard',
      description: 'Report tier where this insight appears'
    },
    priority: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
      description: 'Priority for inclusion in reports (higher = more important)'
    },
    active: {
      type: Boolean,
      default: true
    },
    tags: [
      {
        type: String,
        index: true
      }
    ],
    culturalConsiderations: [
      {
        culture: String,
        modification: String,
        alternative: String
      }
    ],
    ageGroups: [
      {
        type: String,
        enum: ['child', 'adolescent', 'young_adult', 'adult', 'senior']
      }
    ],
    variables: {
      type: Map,
      of: String,
      description: 'Dynamic variables that can be substituted in insights'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for efficient querying
insightPatternSchema.index({ category: 1, priority: -1, active: 1 });
insightPatternSchema.index({ 'traits.trait': 1, 'traits.minScore': 1, 'traits.maxScore': 1 });
insightPatternSchema.index({ tier: 1, active: 1, priority: -1 });
insightPatternSchema.index({ 'neurodivergent.indicators.condition': 1 });
insightPatternSchema.index({ tags: 1 });

// Virtual for pattern complexity
insightPatternSchema.virtual('complexity').get(function () {
  const traitCount = this.traits.length;
  const hasNeurodivergent = this.neurodivergent.indicators.length > 0;
  const hasConditions = this.conditions.additionalFactors.length > 0;

  if (traitCount >= 4 || (hasNeurodivergent && hasConditions)) return 'complex';
  if (traitCount >= 2 || hasNeurodivergent || hasConditions) return 'moderate';
  return 'simple';
});

// Method to check if a profile matches this pattern
insightPatternSchema.methods.matchesProfile = function (profile) {
  const { traits, responses } = profile;

  // Check trait conditions
  let matchedTraits = 0;
  for (const condition of this.traits) {
    const userScore = traits[condition.trait];
    if (userScore >= condition.minScore && userScore <= condition.maxScore) {
      matchedTraits++;
    }
  }

  // Check if minimum traits are met
  if (matchedTraits < this.conditions.minimumTraits) {
    return { matches: false, confidence: 0 };
  }

  // Calculate confidence score
  const traitConfidence = matchedTraits / this.traits.length;
  const baseConfidence = this.validity.confidenceScore;
  const finalConfidence = traitConfidence * baseConfidence;

  return {
    matches: true,
    confidence: finalConfidence,
    matchedTraits,
    totalTraits: this.traits.length
  };
};

// Static method to find best matching patterns for a profile
insightPatternSchema.statics.findMatchingPatterns = async function (profile, tier = 'standard') {
  const patterns = await this.find({
    active: true,
    tier: { $in: tier === 'comprehensive' ? ['standard', 'comprehensive'] : ['standard'] }
  }).sort({ priority: -1 });

  const matches = [];
  for (const pattern of patterns) {
    const matchResult = pattern.matchesProfile(profile);
    if (matchResult.matches) {
      matches.push({
        pattern,
        confidence: matchResult.confidence,
        matchedTraits: matchResult.matchedTraits
      });
    }
  }

  // Sort by confidence and priority
  matches.sort((a, b) => {
    const confidenceDiff = b.confidence - a.confidence;
    if (Math.abs(confidenceDiff) > 0.1) return confidenceDiff;
    return b.pattern.priority - a.pattern.priority;
  });

  return matches;
};

const InsightPattern = mongoose.model('InsightPattern', insightPatternSchema);

module.exports = InsightPattern;
