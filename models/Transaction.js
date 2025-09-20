const mongoose = require('mongoose');

/**
 * Transaction Schema - Stores payment transactions only
 * NO personal identifiable information (PII) is stored
 * Only transaction IDs and amounts for accounting
 */
const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    // Session ID for linking to temporary assessment (deleted after completion)
    sessionId: {
      type: String,
      required: true,
      index: true
    },
    // Stripe payment intent ID (no customer data)
    stripePaymentId: {
      type: String,
      sparse: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'GBP'
    },
    tier: {
      type: String,
      enum: ['premium', 'professional'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    // Anonymized location for tax purposes
    country: {
      type: String,
      maxlength: 2 // ISO country code only
    },
    metadata: {
      assessmentType: String,
      questionCount: Number,
      completionTime: Number, // in seconds
      reportGenerated: Boolean
    },
    // Automatic cleanup flag
    expiresAt: {
      type: Date,
      default: Date.now,
      expires: 2592000 // Auto-delete after 30 days
    }
  },
  { timestamps: true }
);

// Index for automatic deletion
transactionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to anonymize old transactions
transactionSchema.statics.anonymizeOldTransactions = async function () {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  return this.updateMany(
    { createdAt: { $lt: thirtyDaysAgo } },
    {
      $unset: { sessionId: '', stripePaymentId: '' },
      $set: { anonymized: true }
    }
  );
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
