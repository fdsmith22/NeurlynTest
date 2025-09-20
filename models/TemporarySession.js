const mongoose = require('mongoose');

/**
 * Temporary Session Schema - Only holds session state during assessment
 * AUTO-DELETES after 24 hours
 * NO personal data is permanently stored
 */
const temporarySessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    mode: {
      type: String,
      enum: ['validated', 'experimental'],
      required: true
    },
    tier: {
      type: String,
      enum: ['free', 'core', 'comprehensive', 'specialized']
    },
    // Only store current progress, not actual answers
    progress: {
      currentQuestionIndex: Number,
      totalQuestions: Number,
      startTime: Date,
      lastActivity: Date,
      completed: {
        type: Boolean,
        default: false
      }
    },
    // Temporary calculation results (deleted after report generation)
    tempResults: {
      type: mongoose.Schema.Types.Mixed,
      select: false // Don't return by default
    },
    // Payment status (no personal payment info)
    payment: {
      required: Boolean,
      status: {
        type: String,
        enum: ['not_required', 'pending', 'completed'],
        default: 'not_required'
      },
      tier: String
    },
    // Auto-delete after 24 hours
    expiresAt: {
      type: Date,
      default: Date.now,
      expires: 86400 // 24 hours in seconds
    }
  },
  { timestamps: true }
);

// Index for automatic deletion
temporarySessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to update progress without storing responses
temporarySessionSchema.methods.updateProgress = function (questionIndex) {
  this.progress.currentQuestionIndex = questionIndex;
  this.progress.lastActivity = new Date();
  return this.save();
};

// Method to mark as completed and schedule deletion
temporarySessionSchema.methods.markCompleted = function () {
  this.progress.completed = true;
  // Delete in 1 hour after completion
  this.expiresAt = new Date(Date.now() + 3600000);
  return this.save();
};

// Static method to clean up abandoned sessions
temporarySessionSchema.statics.cleanupAbandoned = async function () {
  const oneHourAgo = new Date(Date.now() - 3600000);

  return this.deleteMany({
    'progress.completed': false,
    'progress.lastActivity': { $lt: oneHourAgo }
  });
};

const TemporarySession = mongoose.model('TemporarySession', temporarySessionSchema);

module.exports = TemporarySession;
