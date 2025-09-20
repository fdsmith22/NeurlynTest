const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true },
    sessionId: { type: String, unique: true, required: true },
    mode: { type: String, enum: ['validated', 'experimental', 'adaptive'], required: true },
    tier: {
      type: String,
      enum: ['core', 'comprehensive', 'specialized', 'experimental', 'quick', 'basic']
    },
    startTime: { type: Date, default: Date.now },
    completionTime: Date,
    responses: [
      {
        questionId: String,
        value: mongoose.Schema.Types.Mixed,
        responseTime: Number,
        category: String,
        instrument: String,
        biometrics: {
          keystrokeMetrics: Object,
          mouseMetrics: Object,
          latency: Number
        }
      }
    ],
    results: {
      profile: Object,
      scores: Object,
      rawScores: Object,
      clinicalIndicators: Object,
      experimentalScores: Object,
      qualityMetrics: Object,
      biasIndicators: Object,
      matchConfidence: Number
    },
    payment: {
      status: {
        type: String,
        enum: ['pending', 'paid', 'free_preview'],
        default: 'pending'
      },
      stripePaymentId: String,
      amount: Number,
      currency: String,
      paidAt: Date
    },
    demographics: {
      age: Number,
      gender: String,
      country: String,
      education: String,
      ethnicity: [String],
      language: String
    },
    consent: {
      research: Boolean,
      dataSharing: Boolean,
      timestamp: Date
    },
    metadata: {
      userAgent: String,
      ipCountry: String,
      referrer: String,
      abTestGroup: String
    }
  },
  { timestamps: true }
);

// Add indexes for performance
assessmentSchema.index({ 'payment.status': 1, createdAt: -1 });
assessmentSchema.index({ userId: 1, createdAt: -1 });
assessmentSchema.index({ mode: 1, 'results.matchConfidence': -1 });

const Assessment = mongoose.model('Assessment', assessmentSchema);

module.exports = Assessment;
