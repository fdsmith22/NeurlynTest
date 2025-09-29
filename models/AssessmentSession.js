const mongoose = require('mongoose');

/**
 * Assessment Session Schema - Stores user responses during assessment
 * Temporary storage for processing and generating reports
 */
const assessmentSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    tier: {
      type: String,
      enum: ['standard', 'comprehensive', 'quick', 'deep'],
      required: true
    },
    phase: {
      type: String,
      enum: ['baseline', 'adaptive', 'completed'],
      default: 'baseline'
    },

    // User context
    concerns: [String],
    demographics: {
      age: Number,
      gender: String,
      education: String,
      occupation: String,
      location: String
    },

    // Assessment progress
    totalQuestions: Number,
    baselineCount: Number,
    questionsAnswered: {
      type: Number,
      default: 0
    },
    questionsRemaining: Number,

    // Response storage
    baselineResponses: [
      {
        questionId: String,
        response: mongoose.Schema.Types.Mixed,
        timestamp: {
          type: Date,
          default: Date.now
        },
        responseTime: Number // milliseconds
      }
    ],

    adaptiveResponses: [
      {
        questionId: String,
        response: mongoose.Schema.Types.Mixed,
        timestamp: {
          type: Date,
          default: Date.now
        },
        responseTime: Number,
        branchingReason: String // Why this question was selected
      }
    ],

    // Questions presented (to avoid duplicates)
    presentedQuestions: [String],

    // Analysis results
    baselineProfile: {
      traits: {
        openness: Number,
        conscientiousness: Number,
        extraversion: Number,
        agreeableness: Number,
        neuroticism: Number
      },
      patterns: [String],
      indicators: [
        {
          type: String,
          confidence: Number,
          evidence: [String]
        }
      ],
      archetype: {
        name: String,
        similarity: Number
      }
    },

    // Adaptive branching state
    adaptiveState: {
      currentPathways: [String],
      priorityAdjustments: [
        {
          category: String,
          adjustment: Number,
          reason: String
        }
      ],
      branchingDecisions: [
        {
          trigger: String,
          pathway: String,
          confidence: Number,
          timestamp: Date
        }
      ],
      questionSelection: [
        {
          questionId: String,
          selectionReason: String,
          adaptiveCriteria: mongoose.Schema.Types.Mixed
        }
      ]
    },

    // Final results
    finalReport: {
      generated: {
        type: Boolean,
        default: false
      },
      reportId: String,
      completionTime: Date,
      insights: [String],
      recommendations: [String],
      neurodivergentScreening: {
        adhd: { score: Number, confidence: Number },
        autism: { score: Number, confidence: Number },
        audhd: { score: Number, confidence: Number },
        hsp: { score: Number, confidence: Number }
      }
    },

    // Metadata
    startTime: {
      type: Date,
      default: Date.now
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    completedAt: Date,
    userAgent: String,
    ipAddress: String,

    // Expiry for temporary storage
    expiresAt: {
      type: Date,
      default: Date.now,
      expires: 86400 // 24 hours
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
assessmentSessionSchema.index({ sessionId: 1 });
assessmentSessionSchema.index({ phase: 1, tier: 1 });
assessmentSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for completion percentage
assessmentSessionSchema.virtual('completionPercentage').get(function () {
  if (!this.totalQuestions) return 0;
  return Math.round((this.questionsAnswered / this.totalQuestions) * 100);
});

// Virtual for session duration
assessmentSessionSchema.virtual('sessionDuration').get(function () {
  const end = this.completedAt || this.lastActivity || new Date();
  return Math.round((end - this.startTime) / 1000); // seconds
});

// Method to add baseline response
assessmentSessionSchema.methods.addBaselineResponse = function (
  questionId,
  response,
  responseTime = null
) {
  this.baselineResponses.push({
    questionId,
    response,
    responseTime,
    timestamp: new Date()
  });

  this.questionsAnswered++;
  this.lastActivity = new Date();
  this.presentedQuestions.push(questionId);

  // Move to adaptive phase if baseline complete
  if (this.baselineResponses.length >= this.baselineCount) {
    this.phase = 'adaptive';
  }
};

// Method to add adaptive response
assessmentSessionSchema.methods.addAdaptiveResponse = function (
  questionId,
  response,
  responseTime = null,
  branchingReason = ''
) {
  this.adaptiveResponses.push({
    questionId,
    response,
    responseTime,
    branchingReason,
    timestamp: new Date()
  });

  this.questionsAnswered++;
  this.lastActivity = new Date();
  this.presentedQuestions.push(questionId);

  // Check if assessment complete
  if (this.questionsAnswered >= this.totalQuestions) {
    this.phase = 'completed';
    this.completedAt = new Date();
  }
};

// Method to update baseline profile
assessmentSessionSchema.methods.updateBaselineProfile = function (profile) {
  this.baselineProfile = {
    ...this.baselineProfile,
    ...profile
  };
  this.lastActivity = new Date();
};

// Method to record adaptive decision
assessmentSessionSchema.methods.recordAdaptiveDecision = function (
  trigger,
  pathway,
  confidence = 0.8
) {
  if (!this.adaptiveState.branchingDecisions) {
    this.adaptiveState.branchingDecisions = [];
  }

  this.adaptiveState.branchingDecisions.push({
    trigger,
    pathway,
    confidence,
    timestamp: new Date()
  });

  this.lastActivity = new Date();
};

// Static method to clean expired sessions
assessmentSessionSchema.statics.cleanExpired = async function () {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  return result.deletedCount;
};

// Static method to get active sessions
assessmentSessionSchema.statics.getActiveSessions = async function () {
  return this.find({
    phase: { $ne: 'completed' },
    expiresAt: { $gt: new Date() }
  });
};

const AssessmentSession = mongoose.model('AssessmentSession', assessmentSessionSchema);

module.exports = AssessmentSession;
