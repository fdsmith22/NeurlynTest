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
      unique: true
    },
    tier: {
      type: String,
      enum: ['standard', 'comprehensive', 'quick', 'deep'],
      required: true
    },
    // NEW TIER SYSTEM
    assessmentTier: {
      type: String,
      enum: ['CORE', 'COMPREHENSIVE'],
      default: 'COMPREHENSIVE',
      description: 'CORE = free 30Q, COMPREHENSIVE = paid 70Q'
    },
    clinicalAddonConsent: {
      type: Boolean,
      default: false,
      description: 'Whether user consented to optional clinical screening'
    },
    clinicalAddonConsentTimestamp: {
      type: Date,
      description: 'When user gave consent for clinical addon'
    },
    clinicalAddonPromptShown: {
      type: Boolean,
      default: false,
      description: 'Whether consent prompt has been shown'
    },
    phase: {
      type: String,
      enum: ['baseline', 'adaptive', 'completed'],
      default: 'baseline'
    },
    mode: {
      type: String,
      enum: ['adaptive', 'adaptive-multistage', 'adaptive-intelligent'],
      default: 'adaptive'
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

    // Multi-stage responses (unified storage for all stages)
    responses: [
      {
        questionId: String,
        value: mongoose.Schema.Types.Mixed,
        responseTime: Number,
        category: String,
        subcategory: String,
        trait: String,
        facet: String,
        instrument: String,
        tags: [String],
        score: Number,
        timestamp: {
          type: Date,
          default: Date.now
        }
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

    // Multi-stage adaptive system (4-stage confidence-based)
    currentStage: {
      type: Number,
      default: 1,
      min: 1,
      max: 4
    },

    // Confidence state for each dimension
    confidenceState: {
      type: Map,
      of: {
        score: Number,
        confidence: Number,
        questionCount: Number,
        responses: [
          {
            questionId: String,
            score: Number,
            timestamp: Date
          }
        ]
      },
      default: () => new Map()
    },

    // Stage transition history
    stageHistory: [
      {
        stage: Number,
        startedAt: {
          type: Date,
          default: Date.now
        },
        completedAt: Date,
        questionsAsked: Number,
        confidenceSummary: mongoose.Schema.Types.Mixed // Store as plain object, not Map
      }
    ],

    // Adaptive metadata
    adaptiveMetadata: {
      tier: String,
      totalQuestionLimit: Number,
      questionsAsked: {
        type: Number,
        default: 0
      },
      pathwaysActivated: [String],
      branchingDecisions: [mongoose.Schema.Types.Mixed],
      currentPhase: String,
      concerns: [String],
      useMultiStage: Boolean,
      useIntelligentSelector: Boolean,
      skipCount: {
        type: Number,
        default: 0
      },
      clinicalDepthTriggered: [String], // Which clinical scales got expanded
      divergentFacets: [String], // Facets significantly different from trait average
      predictedArchetype: String, // Predicted personality archetype
      skipNotifications: [
        {
          dimension: String,
          confidence: Number,
          timestamp: Date
        }
      ],
      comprehensiveProfile: mongoose.Schema.Types.Mixed,
      questionAllocation: mongoose.Schema.Types.Mixed,
      adaptiveSelectionComplete: Boolean
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
      default: Date.now
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

// Method to update confidence state for a dimension
assessmentSessionSchema.methods.updateConfidenceState = function (dimensionUpdates) {
  if (!this.confidenceState) {
    this.confidenceState = new Map();
  }

  // dimensionUpdates is an object from ConfidenceTracker.toJSON().dimensions
  Object.entries(dimensionUpdates).forEach(([dimension, data]) => {
    this.confidenceState.set(dimension, data);
  });

  this.lastActivity = new Date();
};

// Method to record stage transition
assessmentSessionSchema.methods.recordStageTransition = function (
  oldStage,
  confidenceSummary
) {
  if (!this.stageHistory) {
    this.stageHistory = [];
  }

  // Find existing stage entry or create new one
  const existingStage = this.stageHistory.find(s => s.stage === oldStage);

  if (existingStage) {
    existingStage.completedAt = new Date();
    existingStage.questionsAsked = this.questionsAnswered;
    // Mongoose automatically converts objects to Maps - don't create Map manually
    existingStage.confidenceSummary = confidenceSummary;
  } else {
    // Create new stage entry (shouldn't normally happen)
    this.stageHistory.push({
      stage: oldStage,
      startedAt: new Date(),
      completedAt: new Date(),
      questionsAsked: this.questionsAnswered,
      // Mongoose automatically converts objects to Maps - don't create Map manually
      confidenceSummary: confidenceSummary
    });
  }

  this.lastActivity = new Date();
};

// Method to start a new stage
assessmentSessionSchema.methods.startStage = function (stageNumber) {
  this.currentStage = stageNumber;

  if (!this.stageHistory) {
    this.stageHistory = [];
  }

  this.stageHistory.push({
    stage: stageNumber,
    startedAt: new Date(),
    questionsAsked: this.questionsAnswered
  });

  this.lastActivity = new Date();
};

// Method to record skip notification
assessmentSessionSchema.methods.recordSkipNotification = function (dimension, confidence) {
  if (!this.adaptiveMetadata) {
    this.adaptiveMetadata = {};
  }
  if (!this.adaptiveMetadata.skipNotifications) {
    this.adaptiveMetadata.skipNotifications = [];
  }

  this.adaptiveMetadata.skipNotifications.push({
    dimension,
    confidence,
    timestamp: new Date()
  });

  this.adaptiveMetadata.skipCount = (this.adaptiveMetadata.skipCount || 0) + 1;
  this.lastActivity = new Date();
};

// Virtual for unified responses array (baseline + adaptive)
assessmentSessionSchema.virtual('allResponses').get(function () {
  const baseline = this.baselineResponses.map(r => ({
    ...r.toObject ? r.toObject() : r,
    phase: 'baseline'
  }));

  const adaptive = this.adaptiveResponses.map(r => ({
    ...r.toObject ? r.toObject() : r,
    phase: 'adaptive'
  }));

  return [...baseline, ...adaptive];
});

const AssessmentSession = mongoose.model('AssessmentSession', assessmentSessionSchema);

module.exports = AssessmentSession;
