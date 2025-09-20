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

const QuestionBank = mongoose.model('QuestionBank', questionBankSchema);

module.exports = QuestionBank;
