require('dotenv').config();
const logger = require('./utils/logger');
const { env, isProduction: _isProduction } = require('./config/env.validation');
const database = require('./config/database');
const healthRoutes = require('./routes/health');
const express = require('express'),
  cors = require('cors'),
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'),
  mongoose = require('mongoose'),
  _jwt = require('jsonwebtoken'),
  _bcrypt = require('bcryptjs'),
  rateLimit = require('express-rate-limit'),
  helmet = require('helmet'),
  app = express(),
  PORT = env.PORT;
(app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://cdn.jsdelivr.net',
          'https://unpkg.com',
          'https://cdnjs.cloudflare.com'
        ],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://cdn.jsdelivr.net',
          'https://fonts.googleapis.com'
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'http://localhost:*', 'https://api.stripe.com']
      }
    }
  })
),
  app.use(cors()),
  app.use(express.json({ limit: '10mb' })),
  app.use(express.static('.')));
const limiter = rateLimit({ windowMs: 9e5, max: 100 });
app.use('/api/', limiter);

// Health check routes (no rate limiting)
app.use('/health', healthRoutes);

// Routes will be added after models are defined
const assessmentSchema = new mongoose.Schema(
  {
    userId: { type: String, index: !0 },
    sessionId: { type: String, unique: !0, required: !0 },
    mode: { type: String, enum: ['validated', 'experimental', 'adaptive'], required: !0 },
    tier: {
      type: String,
      enum: ['core', 'comprehensive', 'specialized', 'experimental', 'quick', 'standard', 'deep']
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
        biometrics: { keystrokeMetrics: Object, mouseMetrics: Object, latency: Number }
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
      status: { type: String, enum: ['pending', 'paid', 'free_preview'], default: 'pending' },
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
    consent: { research: Boolean, dataSharing: Boolean, timestamp: Date },
    metadata: { userAgent: String, ipCountry: String, referrer: String, abTestGroup: String },
    adaptiveMetadata: {
      tier: String,
      totalQuestionLimit: Number,
      questionsAsked: Number,
      pathwaysActivated: [String],
      branchingDecisions: [Object],
      currentPhase: String,
      concerns: [String],
      summary: Object
    }
  },
  { timestamps: !0 }
);
(assessmentSchema.index({ 'payment.status': 1, createdAt: -1 }),
  assessmentSchema.index({ userId: 1, createdAt: -1 }),
  assessmentSchema.index({ mode: 1, 'results.matchConfidence': -1 }));
const Assessment = mongoose.model('Assessment', assessmentSchema),
  AssessmentSession = require('./models/AssessmentSession'),
  userSchema = new mongoose.Schema(
    {
      email: { type: String, unique: !0, sparse: !0 },
      hashedPassword: String,
      assessments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' }],
      subscription: { active: Boolean, plan: String, expiresAt: Date },
      preferences: { theme: String, emailUpdates: Boolean, researchParticipation: Boolean }
    },
    { timestamps: !0 }
  ),
  _User = mongoose.model('User', userSchema);

// Question routes
const questionsRouter = require('./routes/questions');
app.use('/api/questions', questionsRouter);

// Report routes
const reportsRouter = require('./routes/reports');
app.use('/api/reports', reportsRouter);

// Adaptive assessment routes
const adaptiveRouter = require('./routes/adaptive-assessment');
app.use('/api/adaptive', adaptiveRouter);

function generateSessionId() {
  return 'pat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
function getQuestionCount(e, t) {
  return 'experimental' === e
    ? 60
    : 'core' === t
      ? 80
      : 'comprehensive' === t
        ? 150
        : 'specialized' === t
          ? 200
          : 100;
}
function determinePaymentRequired(e) {
  return Assessment.countDocuments({ 'payment.status': { $ne: 'pending' } }) > 100;
}
function generatePreviewResults(e) {
  return {
    primaryProfile: e.profile.name,
    topTraits: Object.entries(e.scores)
      .sort((e, t) => t[1].percentile - e[1].percentile)
      .slice(0, 3)
      .map(([e, t]) => ({ trait: e, percentile: Math.round(t.percentile) })),
    teaser:
      'Unlock your complete personality analysis including detailed insights, growth recommendations, and career guidance.'
  };
}
function generateCertificate(e) {
  return {
    id: e._id,
    name: e.demographics?.name || 'Participant',
    mode: e.mode,
    completionDate: e.completionTime,
    verificationUrl: `/verify/${e._id}`
  };
}
function calculateValidatedResults(e) {
  const t = {},
    n = {},
    s = {},
    r = e.filter(e => 'BFI-2' === e.instrument);
  r.length > 0 &&
    ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'].forEach(e => {
      const s = r.filter(t => t.category === e);
      if (s.length > 0) {
        const r = s.reduce((e, t) => e + t.value, 0) / s.length;
        ((n[e] = r),
          (t[e] = {
            score: r,
            percentile: calculatePercentile(r, 3.5, 0.8),
            stanine: Math.min(9, Math.max(1, Math.round(2.25 * (r - 1)))),
            interpretation: interpretBigFive(e, r)
          }));
      }
    });
  const i = e.filter(e => 'HEXACO-60' === e.instrument);
  if (i.length > 0) {
    const e = i.filter(e => 'honesty-humility' === e.category);
    if (e.length > 0) {
      const n = e.reduce((e, t) => e + t.value, 0) / e.length;
      t['honesty-humility'] = {
        score: n,
        percentile: calculatePercentile(n, 3.3, 0.85),
        interpretation: n > 4 ? 'High integrity' : n > 2.5 ? 'Moderate' : 'Pragmatic'
      };
    }
  }
  const a = e.filter(e => 'ASRS-5' === e.instrument);
  if (a.length >= 4) {
    const e = a.reduce((e, t) => e + t.value, 0);
    s.adhd = {
      score: e,
      risk: e >= 14 ? 'High' : e >= 9 ? 'Moderate' : 'Low',
      recommendation: e >= 14 ? 'Consider professional evaluation' : 'Within normal range'
    };
  }
  const o = e.filter(e => 'AQ-10' === e.instrument);
  if (o.length >= 6) {
    const e = o.filter(e => e.value >= 3).length;
    s.autism = {
      score: e,
      risk: e >= 6 ? 'Elevated' : 'Low',
      recommendation: e >= 6 ? 'Consider comprehensive assessment' : 'No concerns indicated'
    };
  }
  const c = e.filter(e => 'PHQ-2' === e.instrument);
  if (2 === c.length) {
    const e = c.reduce((e, t) => e + t.value, 0);
    s.depression = {
      score: e,
      risk: e >= 3 ? 'Positive screen' : 'Negative',
      recommendation: e >= 3 ? 'Follow up with PHQ-9' : 'No current concerns'
    };
  }
  const l = e.filter(e => 'GAD-2' === e.instrument);
  if (2 === l.length) {
    const e = l.reduce((e, t) => e + t.value, 0);
    s.anxiety = {
      score: e,
      risk: e >= 3 ? 'Positive screen' : 'Negative',
      recommendation: e >= 3 ? 'Consider GAD-7 assessment' : 'No current concerns'
    };
  }
  const u = calculateQualityMetrics(e),
    p = determinePersonalityProfile(t, s),
    m = calculateMatchConfidence(e, t, u);
  return {
    profile: p,
    scores: t,
    rawScores: n,
    clinicalIndicators: s,
    qualityMetrics: u,
    matchConfidence: m,
    timestamp: new Date(),
    version: '3.0.0-validated'
  };
}
function interpretBigFive(e, t) {
  return (
    {
      openness: t > 4 ? 'Creative and curious' : t > 3 ? 'Balanced' : 'Practical and conventional',
      conscientiousness:
        t > 4
          ? 'Organized and dependable'
          : t > 3
            ? 'Moderately organized'
            : 'Flexible and spontaneous',
      extraversion:
        t > 4 ? 'Outgoing and energetic' : t > 3 ? 'Ambiverted' : 'Reserved and introspective',
      agreeableness:
        t > 4 ? 'Compassionate and cooperative' : t > 3 ? 'Balanced' : 'Competitive and skeptical',
      neuroticism:
        t > 4
          ? 'Emotionally reactive'
          : t > 3
            ? 'Moderate emotional stability'
            : 'Emotionally stable'
    }[e] || 'Average'
  );
}
function calculateQualityMetrics(e) {
  const t = e.map(e => e.responseTime).filter(Boolean),
    n = t.length > 0 ? t.reduce((e, t) => e + t, 0) / t.length : 0,
    s = e.map(e => e.value),
    r = [...new Set(s)].length / Math.min(s.length, 7);
  let i = 0,
    a = 1;
  for (let e = 1; e < s.length; e++) s[e] === s[e - 1] ? (a++, (i = Math.max(i, a))) : (a = 1);
  const o = i > 10,
    c = n < 1e3 || r < 0.3;
  return {
    completionRate: e.length / 100,
    avgResponseTime: n,
    responseVariability: r,
    straightLining: o,
    carelessResponding: c,
    dataQuality: r > 0.5 && !o ? 'Good' : 'Review needed'
  };
}
function determinePersonalityProfile(e, t) {
  const n = [];
  return (
    e.openness?.percentile > 75 && e.conscientiousness?.percentile > 75 && n.push('Achiever'),
    e.extraversion?.percentile > 75 && e.agreeableness?.percentile > 75 && n.push('Harmonizer'),
    e.openness?.percentile > 80 && n.push('Innovator'),
    e.conscientiousness?.percentile > 80 && n.push('Organizer'),
    e.neuroticism?.percentile < 25 && n.push('Resilient'),
    e['honesty-humility']?.percentile > 75 && n.push('Ethical Leader'),
    {
      primary: n[0] || 'Balanced',
      secondary: n.slice(1, 3),
      description: generateProfileDescription(n, e)
    }
  );
}
function generateProfileDescription(e, t) {
  let n = 'Your personality profile shows ';
  return (
    e.includes('Achiever') &&
      (n += 'a strong drive for excellence combined with creative thinking. '),
    e.includes('Harmonizer') && (n += 'exceptional interpersonal skills and social awareness. '),
    e.includes('Innovator') &&
      (n += 'high intellectual curiosity and openness to new experiences. '),
    (n +=
      'This assessment is based on validated psychological instruments with strong scientific backing.'),
    n
  );
}
function calculateMatchConfidence(e, t, n) {
  let s = 75;
  return (
    e.length > 80 && (s += 10),
    e.length > 150 && (s += 5),
    'Good' === n.dataQuality && (s += 10),
    n.carelessResponding && (s -= 15),
    n.straightLining && (s -= 10),
    t.neuroticism &&
      t.extraversion &&
      Math.abs(t.neuroticism.percentile + t.extraversion.percentile - 100) < 40 &&
      (s += 5),
    Math.min(95, Math.max(50, s))
  );
}
function calculateExperimentalResults(e) {
  const t = {},
    n = e.filter(e => 'nonattachment' === e.category);
  if (n.length > 0) {
    const e = n.reduce((e, t) => e + t.value, 0) / n.length;
    t.nonattachment = {
      score: e,
      percentile: calculatePercentile(e, 3.5, 0.8),
      interpretation: e > 4 ? 'High' : e > 2.5 ? 'Moderate' : 'Low'
    };
  }
  const s = e.filter(e => 'gunas' === e.category);
  if (s.length > 0) {
    const e = s.filter(e => 'sattva' === e.instrument).reduce((e, t) => e + t.value, 0) / 3,
      n = s.filter(e => 'rajas' === e.instrument).reduce((e, t) => e + t.value, 0) / 3,
      r = s.filter(e => 'tamas' === e.instrument).reduce((e, t) => e + t.value, 0) / 3;
    t.gunas = {
      sattva: { score: e, percentile: calculatePercentile(e, 3.5, 0.7) },
      rajas: { score: n, percentile: calculatePercentile(n, 3.2, 0.8) },
      tamas: { score: r, percentile: calculatePercentile(r, 2.8, 0.9) },
      dominant: e > n && e > r ? 'Sattva' : n > r ? 'Rajas' : 'Tamas'
    };
  }
  const r = e.filter(e => 'ubuntu' === e.category);
  if (r.length > 0) {
    const e = r.reduce((e, t) => e + t.value, 0) / r.length;
    t.ubuntu = {
      score: e,
      percentile: calculatePercentile(e, 4, 0.6),
      interpretation: e > 4.2 ? 'Strong communal orientation' : 'Moderate interconnectedness'
    };
  }
  const i = e.filter(e => 'beauty' === e.category);
  if (i.length > 0) {
    const e = i.reduce((e, t) => e + t.value, 0) / i.length;
    t.beauty = {
      score: e,
      percentile: calculatePercentile(e, 3.8, 0.9),
      domains: {
        natural: i.filter(e => 'natural' === e.instrument).reduce((e, t) => e + t.value, 0) / 2,
        artistic: i.filter(e => 'artistic' === e.instrument).reduce((e, t) => e + t.value, 0) / 2,
        moral: i.filter(e => 'moral' === e.instrument).reduce((e, t) => e + t.value, 0) / 2
      }
    };
  }
  const a = e.filter(e => 'antifragility' === e.category);
  if (a.length > 0) {
    const e = a.reduce((e, t) => e + t.value, 0) / a.length;
    t.antifragility = {
      score: e,
      percentile: calculatePercentile(e, 3.3, 0.85),
      level: e > 4 ? 'Antifragile' : e > 3 ? 'Resilient' : 'Fragile'
    };
  }
  const o = e.filter(e => 'flow' === e.category);
  if (o.length > 0) {
    const e = o.reduce((e, t) => e + t.value, 0) / o.length;
    t.flowProneness = {
      score: e,
      percentile: calculatePercentile(e, 3.6, 0.75),
      frequency: e > 4 ? 'Frequent' : e > 3 ? 'Occasional' : 'Rare'
    };
  }
  const c = e.filter(e => 'flexibility' === e.category);
  if (c.length > 0) {
    const e = c.reduce((e, t) => e + t.value, 0) / c.length;
    t.psychologicalFlexibility = {
      score: e,
      percentile: calculatePercentile(e, 3.4, 0.8),
      interpretation: e > 4 ? 'Highly flexible' : 'Moderately flexible'
    };
  }
  const l = e.filter(e => 'dark' === e.category);
  if (l.length > 0) {
    const e = l.reduce((e, t) => e + t.value, 0) / l.length;
    t.darkFactor = {
      score: e,
      percentile: calculatePercentile(e, 2.5, 1),
      level: e < 2 ? 'Low' : e < 3.5 ? 'Moderate' : 'High',
      warning: e > 3.5
    };
  }
  const u = e.filter(e => 'future' === e.category);
  if (u.length > 0) {
    const e = u.reduce((e, t) => e + t.value, 0) / u.length;
    t.futureSelfContinuity = {
      score: e,
      percentile: calculatePercentile(e, 3.7, 0.85),
      interpretation: e > 4 ? 'Strong future orientation' : 'Present-focused'
    };
  }
  const p = e.filter(e => e.biometrics).map(e => e.biometrics);
  if (p.length > 0) {
    const e = p.reduce((e, t) => e + (t.latency || 0), 0) / p.length,
      n = calculateVariability(p.map(e => e.keystrokeMetrics?.dwellTime).filter(Boolean));
    t.biometricAnalysis = {
      responseLatency: e,
      keystrokePattern: n > 100 ? 'Variable' : 'Consistent',
      confidenceLevel: n < 50 ? 'High' : n < 150 ? 'Moderate' : 'Low',
      authenticityScore: Math.max(0, Math.min(100, 100 - n / 3))
    };
  }
  const m = determineExperimentalProfile(t),
    d = calculateExperimentalConfidence(e, t);
  return {
    profile: m,
    scores: {},
    experimentalScores: t,
    biometricAnalysis: t.biometricAnalysis || {},
    matchConfidence: d,
    timestamp: new Date(),
    version: '3.0.0-experimental'
  };
}
function calculatePercentile(e, t, n) {
  const s = (e - t) / n,
    r = 1 / (1 + 0.2316419 * Math.abs(s)),
    i =
      0.3989423 *
      Math.exp((-s * s) / 2) *
      r *
      (0.3193815 + r * (r * (1.781478 + r * (1.330274 * r - 1.821256)) - 0.3565638)),
    a = s > 0 ? 100 * (1 - i) : 100 * i;
  return Math.round(a);
}
function calculateVariability(e) {
  if (!e || 0 === e.length) return 0;
  const t = e.reduce((e, t) => e + t, 0) / e.length,
    n = e.reduce((e, n) => e + Math.pow(n - t, 2), 0) / e.length;
  return Math.sqrt(n);
}
function determineExperimentalProfile(e) {
  const t = [];
  return (
    e.nonattachment?.score > 4 && t.push('Zen Master'),
    'Sattva' === e.gunas?.dominant && t.push('Harmonizer'),
    e.ubuntu?.score > 4.2 && t.push('Community Builder'),
    e.beauty?.score > 4 && t.push('Aesthetic Appreciator'),
    'Antifragile' === e.antifragility?.level && t.push('Chaos Navigator'),
    'Frequent' === e.flowProneness?.frequency && t.push('Flow Seeker'),
    e.psychologicalFlexibility?.score > 4 && t.push('Adaptive Mind'),
    'Low' === e.darkFactor?.level && t.push('Light Bearer'),
    e.futureSelfContinuity?.score > 4 && t.push('Visionary'),
    {
      primary: t[0] || 'Explorer',
      secondary: t.slice(1, 3),
      description: generateExperimentalDescription(t, e)
    }
  );
}
function generateExperimentalDescription(e, t) {
  let n = 'Your experimental psychological profile reveals ';
  return (
    e.includes('Zen Master') && (n += 'exceptional non-attachment and emotional equanimity. '),
    e.includes('Community Builder') &&
      (n += 'a deep sense of interconnectedness and communal responsibility. '),
    e.includes('Chaos Navigator') &&
      (n += 'remarkable ability to thrive in uncertainty and grow from challenges. '),
    (n +=
      'This cutting-edge assessment integrates Eastern philosophy, indigenous wisdom, and modern psychological research.'),
    n
  );
}
function calculateExperimentalConfidence(e, t) {
  let n = 70;
  const s = e.length;
  (s > 50 && (n += 10),
    s > 70 && (n += 5),
    t.biometricAnalysis?.authenticityScore > 80 && (n += 10));
  const r = e.map(e => e.responseTime).filter(Boolean);
  if (r.length > 0) {
    const e = r.reduce((e, t) => e + t, 0) / r.length;
    e > 2e3 && e < 1e4 && (n += 5);
  }
  return Math.min(95, n);
}
// Initialize database connection
database.connect().catch(err => {
  logger.error('Failed to connect to database:', err);
});
(app.post('/api/assessment/start', async (e, t) => {
  try {
    const { mode: n, tier: s, userId: r, demographics: i, consent: a } = e.body,
      o = generateSessionId(),
      c = new Assessment({
        sessionId: o,
        userId: r || 'anonymous',
        mode: n,
        tier: s,
        demographics: i,
        consent: a,
        metadata: {
          userAgent: e.headers['user-agent'],
          ipCountry: e.headers['cf-ipcountry'] || 'unknown',
          referrer: e.headers.referer
        }
      });
    (await c.save(),
      t.json({
        success: !0,
        sessionId: o,
        assessmentId: c._id,
        questionCount: getQuestionCount(n, s)
      }));
  } catch (e) {
    logger.error('Error starting assessment:', e);
    t.status(500).json({ error: 'Failed to start assessment' });
  }
}),
  app.post('/api/assessment/progress', async (e, t) => {
    try {
      const { sessionId: n, responses: s, currentIndex: r } = e.body,
        i = await Assessment.findOne({ sessionId: n });
      if (!i) return t.status(404).json({ error: 'Assessment not found' });
      const a = i.responses.map(e => e.questionId),
        o = s.filter(e => !a.includes(e.questionId));
      (i.responses.push(...o),
        await i.save(),
        t.json({ success: !0, saved: o.length, total: i.responses.length }));
    } catch (e) {
      logger.error('Error saving progress:', e);
      t.status(500).json({ error: 'Failed to save progress' });
    }
  }),
  // Enhanced completion endpoint for adaptive assessments
  app.post('/api/assessment/adaptive/complete', async (req, res) => {
    try {
      const { sessionId } = req.body;
      const assessment = await Assessment.findOne({ sessionId });

      if (!assessment) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      assessment.completionTime = new Date();

      // Use enhanced report generation with new services
      const StatisticalAnalyzer = require('./services/statistical-analyzer');
      const NarrativeGenerator = require('./services/narrative-generator');
      const NeurodivergentScreener = require('./services/neurodivergent-screener');

      const statisticalAnalyzer = new StatisticalAnalyzer();
      const narrativeGenerator = new NarrativeGenerator();
      const neurodivergentScreener = new NeurodivergentScreener();

      // Extract traits from responses
      const traits = calculateTraitsFromResponses(assessment.responses);

      // Run enhanced analysis
      const statisticalAnalysis = statisticalAnalyzer.analyzeProfile({
        traits,
        responses: assessment.responses,
        metadata: assessment.metadata
      });

      const neurodivergentScreening = neurodivergentScreener.screenProfile({
        responses: assessment.responses,
        traits,
        metadata: assessment.metadata
      });

      const narrativeContent = narrativeGenerator.generateNarrative({
        traits,
        analysis: statisticalAnalysis,
        neurodivergentScreening,
        tier: assessment.tier
      });

      // Combine results
      const enhancedResults = {
        profile: assessment.metadata.userProfile || {},
        traits,
        statisticalAnalysis,
        neurodivergentScreening,
        narrative: narrativeContent,
        mode: 'adaptive-enhanced',
        version: '2.0',
        timestamp: new Date()
      };

      assessment.results = enhancedResults;

      // Determine payment requirement
      const needsPayment = determinePaymentRequired(assessment);

      if (needsPayment) {
        assessment.payment.status = 'pending';
        await assessment.save();

        res.json({
          success: true,
          needsPayment: true,
          previewResults: generateEnhancedPreviewResults(enhancedResults),
          paymentUrl: `/payment/${sessionId}`,
          enhancedFeatures: true
        });
      } else {
        assessment.payment.status = 'free_preview';
        await assessment.save();

        res.json({
          success: true,
          results: enhancedResults,
          reportUrl: `/api/report/${sessionId}`,
          enhancedFeatures: true
        });
      }
    } catch (error) {
      logger.error('Error completing enhanced assessment:', error);
      res
        .status(500)
        .json({ error: 'Failed to complete enhanced assessment', message: error.message });
    }
  }),
  // Original completion endpoint (legacy support)
  app.post('/api/assessment/complete', async (e, t) => {
    try {
      const { sessionId: n, responses: s } = e.body,
        r = await Assessment.findOne({ sessionId: n });
      if (!r) return t.status(404).json({ error: 'Assessment not found' });
      ((r.responses = s), (r.completionTime = new Date()));
      const i =
        'experimental' === r.mode ? calculateExperimentalResults(s) : calculateValidatedResults(s);
      ((r.results = i),
        determinePaymentRequired(r)
          ? ((r.payment.status = 'pending'),
            await r.save(),
            t.json({
              success: !0,
              needsPayment: !0,
              previewResults: generatePreviewResults(i),
              paymentUrl: `/payment/${n}`
            }))
          : ((r.payment.status = 'free_preview'),
            await r.save(),
            t.json({ success: !0, results: i, reportUrl: `/api/report/${n}` })));
    } catch (e) {
      logger.error('Error completing assessment:', e);
      t.status(500).json({ error: 'Failed to complete assessment' });
    }
  }),
  app.post('/api/payment/create-checkout', async (e, t) => {
    try {
      const { sessionId: n } = e.body,
        s = await Assessment.findOne({ sessionId: n });
      if (!s) return t.status(404).json({ error: 'Assessment not found' });
      const r = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'gbp',
              product_data: {
                name: 'Neurlyn Complete Assessment Report',
                description: `Comprehensive ${s.mode} personality assessment results`,
                images: ['https://neurlyn.com/logo.png']
              },
              unit_amount: 100
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: `${process.env.BASE_URL}/results/${n}?payment=success`,
        cancel_url: `${process.env.BASE_URL}/payment/${n}?payment=cancelled`,
        metadata: { sessionId: n, assessmentId: s._id.toString() }
      });
      t.json({ checkoutUrl: r.url, sessionId: r.id });
    } catch (e) {
      logger.error('Error creating checkout session:', e);
      t.status(500).json({ error: 'Failed to create payment session' });
    }
  }),
  app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), async (e, t) => {
    const n = e.headers['stripe-signature'];
    let s;
    try {
      s = stripe.webhooks.constructEvent(e.body, n, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (e) {
      return t.status(400).send(`Webhook Error: ${e.message}`);
    }
    if ('checkout.session.completed' === s.type) {
      const e = s.data.object,
        { sessionId: t, assessmentId: n } = e.metadata;
      await Assessment.findByIdAndUpdate(n, {
        'payment.status': 'paid',
        'payment.stripePaymentId': e.payment_intent,
        'payment.amount': e.amount_total,
        'payment.currency': e.currency,
        'payment.paidAt': new Date()
      });
    }
    t.json({ received: !0 });
  }),
  // Adaptive Assessment Route
  // Enhanced Adaptive Assessment - Baseline Phase
  app.post('/api/assessments/adaptive/start', async (req, res) => {
    try {
      const AdaptiveAssessmentEngine = require('./services/adaptive-assessment-engine');
      const engine = new AdaptiveAssessmentEngine();

      const { tier = 'standard', concerns = [], demographics = {} } = req.body;
      const sessionId =
        req.body.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Generate initial adaptive assessment structure with baseline questions
      const assessment = await engine.generateAdaptiveAssessment(tier, { concerns, demographics });

      // Create assessment session record for temporary storage
      const assessmentSession = new AssessmentSession({
        sessionId,
        tier,
        phase: 'baseline',
        concerns,
        demographics,
        totalQuestions: assessment.totalQuestions,
        baselineCount: assessment.baselineQuestions.length,
        questionsRemaining: assessment.totalQuestions,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      });

      await assessmentSession.save();

      // Also create the main Assessment record for compatibility
      const newAssessment = new Assessment({
        sessionId,
        mode: 'adaptive',
        tier,
        responses: [],
        metadata: {
          userAgent: req.get('User-Agent'),
          abTestGroup: 'adaptive-v2',
          adaptivePhase: 'baseline'
        },
        demographics
      });

      await newAssessment.save();

      res.json({
        success: true,
        sessionId,
        phase: 'baseline',
        questions: assessment.baselineQuestions,
        totalQuestions: assessment.totalQuestions,
        baselineCount: assessment.baselineQuestions.length,
        adaptiveSlots: assessment.adaptiveSlots,
        tier,
        adaptiveMetadata: assessment.adaptiveMetadata
      });
    } catch (error) {
      logger.error('Adaptive assessment start error:', error);
      res
        .status(500)
        .json({ error: 'Failed to start adaptive assessment', message: error.message });
    }
  }),
  // Process Baseline Responses and Get Adaptive Questions
  app.post('/api/assessments/adaptive/baseline-complete', async (req, res) => {
    try {
      const AdaptiveAssessmentEngine = require('./services/adaptive-assessment-engine');
      const engine = new AdaptiveAssessmentEngine();

      const { sessionId, baselineResponses, tier = 'standard' } = req.body;

      if (!sessionId || !baselineResponses || baselineResponses.length === 0) {
        return res
          .status(400)
          .json({ error: 'Missing required fields: sessionId, baselineResponses' });
      }

      // Find the assessment session
      const assessmentSession = await AssessmentSession.findOne({ sessionId });
      if (!assessmentSession) {
        return res.status(404).json({ error: 'Assessment session not found' });
      }

      // Store baseline responses in the session
      for (const response of baselineResponses) {
        assessmentSession.addBaselineResponse(
          response.questionId,
          response.response,
          response.responseTime
        );
      }

      // Process baseline responses to create user profile
      const baselineAnalysis = await engine.processBaselineResponses(baselineResponses, tier);

      // Update session with baseline profile and move to adaptive phase
      assessmentSession.updateBaselineProfile({
        traits: baselineAnalysis.profile.traits,
        patterns: baselineAnalysis.profile.patterns,
        indicators: baselineAnalysis.profile.indicators,
        archetype: baselineAnalysis.profile.archetype
      });

      assessmentSession.phase = 'adaptive';
      assessmentSession.questionsRemaining =
        assessmentSession.totalQuestions - assessmentSession.questionsAnswered;

      await assessmentSession.save();

      // Also update main Assessment record for compatibility
      const assessment = await Assessment.findOne({ sessionId });
      if (assessment) {
        assessment.responses.push(
          ...baselineResponses.map(r => ({
            ...r,
            phase: 'baseline'
          }))
        );
        assessment.metadata.adaptivePhase = 'adaptive';
        assessment.metadata.userProfile = baselineAnalysis.profile;
        assessment.metadata.baselineAnalysis = baselineAnalysis.analysis;
        await assessment.save();
      }

      res.json({
        success: true,
        sessionId,
        phase: 'adaptive',
        profile: baselineAnalysis.profile,
        adaptiveQuestions: baselineAnalysis.adaptiveQuestions,
        questionsRemaining: baselineAnalysis.adaptiveQuestions.length,
        analysis: baselineAnalysis.analysis,
        confidence: baselineAnalysis.profile.confidence,
        completionPercentage: assessmentSession.completionPercentage
      });
    } catch (error) {
      logger.error('Baseline completion error:', error);
      res
        .status(500)
        .json({ error: 'Failed to process baseline responses', message: error.message });
    }
  }),
  // Complete Adaptive Assessment
  app.post('/api/assessments/adaptive/complete', async (req, res) => {
    try {
      const { sessionId, adaptiveResponses } = req.body;

      if (!sessionId || !adaptiveResponses) {
        return res
          .status(400)
          .json({ error: 'Missing required fields: sessionId, adaptiveResponses' });
      }

      // Find the assessment session
      let session = await AssessmentSession.findOne({ sessionId });
      if (!session) {
        return res.status(404).json({ error: 'Assessment session not found' });
      }

      // Add adaptive responses to session
      for (const response of adaptiveResponses) {
        session.adaptiveResponses.push({
          questionId: response.questionId,
          response: response.response,
          responseTime: response.responseTime || 5000,
          timestamp: new Date()
        });
      }

      session.phase = 'completed';
      session.completedAt = new Date();

      // Initialize services
      const AdaptiveAssessmentEngine = require('./services/adaptive-assessment-engine');
      const NarrativeGenerator = require('./services/narrative-generator');

      const engine = new AdaptiveAssessmentEngine();
      const narrativeGenerator = new NarrativeGenerator();

      // Combine all responses for final analysis
      const allResponses = [
        ...session.baselineResponses.map(r => ({ ...r, phase: 'baseline' })),
        ...session.adaptiveResponses.map(r => ({ ...r, phase: 'adaptive' }))
      ];

      // Generate final report
      const reportData = {
        sessionId,
        userProfile: session.userProfile,
        allResponses,
        baselineAnalysis: session.metadata?.baselineAnalysis,
        tier: session.tier
      };

      // Generate enhanced narrative
      const narrative = await narrativeGenerator.generateNarrative(
        reportData.userProfile,
        reportData.baselineAnalysis,
        reportData.tier
      );

      // Save to permanent Assessment record
      const assessment = new Assessment({
        sessionId,
        tier: session.tier,
        phase: 'completed',
        responses: allResponses,
        userProfile: session.userProfile,
        metadata: {
          baselineAnalysis: session.metadata?.baselineAnalysis,
          completionTime: new Date(),
          totalResponseTime: allResponses.reduce((sum, r) => sum + (r.responseTime || 0), 0)
        },
        narrative
      });

      await assessment.save();
      await session.save();

      logger.info('Adaptive assessment completed', {
        sessionId,
        totalResponses: allResponses.length,
        completionTime: new Date()
      });

      res.json({
        success: true,
        sessionId,
        assessment: {
          profile: session.userProfile,
          narrative,
          analysis: session.metadata?.baselineAnalysis,
          completionTime: new Date(),
          totalResponses: allResponses.length
        }
      });
    } catch (error) {
      logger.error('Adaptive assessment completion error:', error);
      res
        .status(500)
        .json({ error: 'Failed to complete adaptive assessment', message: error.message });
    }
  }),
  // Get Next Adaptive Question
  app.post('/api/assessments/adaptive/next-question', async (req, res) => {
    try {
      const AdaptiveAssessmentEngine = require('./services/adaptive-assessment-engine');
      const engine = new AdaptiveAssessmentEngine();

      const { sessionId, currentResponse } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: 'Missing sessionId' });
      }

      // Find assessment and update with current response if provided
      const assessment = await Assessment.findOne({ sessionId });
      if (!assessment) {
        return res.status(404).json({ error: 'Assessment session not found' });
      }

      if (currentResponse) {
        assessment.responses.push({
          ...currentResponse,
          phase: 'adaptive',
          timestamp: new Date()
        });
        await assessment.save();
      }

      // Get all responses for this session
      const allResponses = assessment.responses;
      const userProfile = assessment.metadata.userProfile;

      // Check if we have remaining questions to ask
      const totalQuestions = assessment.tier === 'comprehensive' ? 50 : 30;
      const questionsAnswered = allResponses.length;

      if (questionsAnswered >= totalQuestions) {
        return res.json({
          success: true,
          completed: true,
          message: 'Assessment completed',
          totalQuestions: questionsAnswered
        });
      }

      // Select next adaptive question based on responses and profile
      const remainingQuestions = []; // Would be populated from question bank
      const nextQuestionResult = await engine.selectNextAdaptiveQuestion(
        sessionId,
        allResponses,
        remainingQuestions,
        userProfile
      );

      res.json({
        success: true,
        question: nextQuestionResult.question,
        questionsRemaining: totalQuestions - questionsAnswered - 1,
        totalQuestions,
        progress: Math.round((questionsAnswered / totalQuestions) * 100),
        updatedProfile: nextQuestionResult.updatedProfile,
        pathways: nextQuestionResult.pathways
      });
    } catch (error) {
      logger.error('Next question selection error:', error);
      res.status(500).json({ error: 'Failed to get next question', message: error.message });
    }
  }),
  // FREE ASSESSMENT ENDPOINTS (replicate adaptive for free tier)
  app.post('/api/assessments/free/start', async (req, res) => {
    // Use the same logic as adaptive/start but clearly for free tier
    req.body.tier = 'standard'; // Ensure free assessments use standard tier
    return app._router.stack
      .find(r => r.route && r.route.path === '/api/assessments/adaptive/start')
      .route.stack[0].handle(req, res);
  }),
  app.post('/api/assessments/free/baseline-complete', async (req, res) => {
    req.body.tier = 'standard';
    return app._router.stack
      .find(r => r.route && r.route.path === '/api/assessments/adaptive/baseline-complete')
      .route.stack[0].handle(req, res);
  }),
  app.post('/api/assessments/free/complete', async (req, res) => {
    return app._router.stack
      .find(r => r.route && r.route.path === '/api/assessments/adaptive/complete')
      .route.stack[0].handle(req, res);
  }),
  app.post('/api/assessments/free/next-question', async (req, res) => {
    return app._router.stack
      .find(r => r.route && r.route.path === '/api/assessments/adaptive/next-question')
      .route.stack[0].handle(req, res);
  }),
  // PAID ASSESSMENT ENDPOINTS (replicate adaptive for paid tier)
  app.post('/api/assessments/paid/start', async (req, res) => {
    // Use the same logic as adaptive/start but for paid tier
    req.body.tier = 'comprehensive'; // Ensure paid assessments use comprehensive tier
    return app._router.stack
      .find(r => r.route && r.route.path === '/api/assessments/adaptive/start')
      .route.stack[0].handle(req, res);
  }),
  app.post('/api/assessments/paid/baseline-complete', async (req, res) => {
    req.body.tier = 'comprehensive';
    return app._router.stack
      .find(r => r.route && r.route.path === '/api/assessments/adaptive/baseline-complete')
      .route.stack[0].handle(req, res);
  }),
  app.post('/api/assessments/paid/complete', async (req, res) => {
    req.body.tier = 'comprehensive';
    return app._router.stack
      .find(r => r.route && r.route.path === '/api/assessments/adaptive/complete')
      .route.stack[0].handle(req, res);
  }),
  app.post('/api/assessments/paid/next-question', async (req, res) => {
    req.body.tier = 'comprehensive';
    return app._router.stack
      .find(r => r.route && r.route.path === '/api/assessments/adaptive/next-question')
      .route.stack[0].handle(req, res);
  }),
  // Legacy adaptive endpoint (maintained for backward compatibility)
  app.post('/api/assessments/adaptive', async (e, t) => {
    try {
      const EnhancedAdaptiveEngine = require('./services/enhanced-adaptive-engine');
      const engine = new EnhancedAdaptiveEngine();

      const { tier = 'standard', concerns = [], demographics = {} } = e.body;
      const result = await engine.generatePersonalizedAssessment(tier, { concerns, demographics });

      t.json({
        success: true,
        questions: result.questions,
        totalQuestions: result.totalQuestions,
        tier,
        concerns,
        adaptiveMetadata: result.adaptiveMetadata
      });
    } catch (error) {
      logger.error('Adaptive assessment error:', error);
      t.status(500).json({ error: 'Failed to generate adaptive assessment' });
    }
  }),
  // Optimized Adaptive Assessment Route
  app.post('/api/assessments/adaptive-optimized', async (req, res) => {
    try {
      const adaptiveHandler = require('./api/assessments/adaptive-optimized');
      await adaptiveHandler(req, res);
    } catch (error) {
      logger.error('Optimized adaptive assessment error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate optimized adaptive assessment',
        message: error.message
      });
    }
  }),
  app.get('/api/report/:sessionId', async (e, t) => {
    try {
      const { sessionId: n } = e.params,
        s = await Assessment.findOne({ sessionId: n });
      if (!s) return t.status(404).json({ error: 'Assessment not found' });
      if ('pending' === s.payment.status)
        return t.status(402).json({ error: 'Payment required', paymentUrl: `/payment/${n}` });
      t.json({
        success: !0,
        results: s.results,
        mode: s.mode,
        completionTime: s.completionTime,
        certificate: generateCertificate(s)
      });
    } catch (e) {
      logger.error('Error fetching report:', e);
      t.status(500).json({ error: 'Failed to fetch report' });
    }
  }),
  app.get('/api/analytics/population', async (e, t) => {
    try {
      const e = await Assessment.aggregate([
          { $match: { 'payment.status': { $in: ['paid', 'free_preview'] } } },
          {
            $group: {
              _id: '$mode',
              count: { $sum: 1 },
              avgConfidence: { $avg: '$results.matchConfidence' },
              avgCompletionTime: { $avg: { $subtract: ['$completionTime', '$startTime'] } }
            }
          }
        ]),
        n = await Assessment.aggregate([
          { $match: { 'payment.status': { $in: ['paid', 'free_preview'] } } },
          {
            $group: {
              _id: {
                ageGroup: {
                  $switch: {
                    branches: [
                      { case: { $lt: ['$demographics.age', 25] }, then: '18-24' },
                      { case: { $lt: ['$demographics.age', 35] }, then: '25-34' },
                      { case: { $lt: ['$demographics.age', 45] }, then: '35-44' },
                      { case: { $lt: ['$demographics.age', 55] }, then: '45-54' },
                      { case: { $gte: ['$demographics.age', 55] }, then: '55+' }
                    ],
                    default: 'Unknown'
                  }
                },
                gender: '$demographics.gender',
                country: '$demographics.country'
              },
              count: { $sum: 1 }
            }
          }
        ]);
      t.json({ totalAssessments: e.reduce((e, t) => e + t.count, 0), byMode: e, demographics: n });
    } catch (e) {
      logger.error('Error fetching analytics:', e);
      t.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }));

// === ENHANCED HELPER FUNCTIONS ===

/**
 * Calculate traits from responses for enhanced analysis
 */
function calculateTraitsFromResponses(responses) {
  const traitScores = {
    openness: { scores: [], weights: [] },
    conscientiousness: { scores: [], weights: [] },
    extraversion: { scores: [], weights: [] },
    agreeableness: { scores: [], weights: [] },
    neuroticism: { scores: [], weights: [] }
  };

  // Process responses with weighting
  responses.forEach(response => {
    const trait = (response.trait || response.category || '').toLowerCase();
    const score = parseInt(response.value) || parseInt(response.score) || 3;
    const weight = response.weight || 1;

    if (trait && traitScores[trait]) {
      // Reverse score if question is reverse-coded
      const adjustedScore = response.reverse ? 6 - score : score;
      traitScores[trait].scores.push(adjustedScore);
      traitScores[trait].weights.push(weight);
    }
  });

  // Calculate weighted averages and convert to percentiles
  const traits = {};
  Object.keys(traitScores).forEach(trait => {
    const data = traitScores[trait];
    if (data.scores.length > 0) {
      const weightedSum = data.scores.reduce((sum, score, i) => sum + score * data.weights[i], 0);
      const totalWeight = data.weights.reduce((sum, w) => sum + w, 0);
      const avg = weightedSum / totalWeight;
      // Convert 1-5 scale to 0-100 percentile
      traits[trait] = Math.round((avg - 1) * 25);
    } else {
      traits[trait] = 50; // Default neutral value
    }
  });

  return traits;
}

/**
 * Generate enhanced preview results for payment flow
 */
function generateEnhancedPreviewResults(results) {
  return {
    previewSummary:
      'Your enhanced personality assessment reveals unique insights about your cognitive patterns and potential neurodivergent traits.',
    topTraits: Object.entries(results.traits)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([trait, score]) => ({ trait, score, percentile: score })),
    archetype: results.statisticalAnalysis?.archetype?.name || 'Unique Individual',
    neurodivergentIndicators:
      results.neurodivergentScreening?.summary || 'Screening analysis available in full report',
    narrativePreview:
      results.narrative?.executiveSummary?.substring(0, 200) + '...' ||
      'Personalized narrative available in full report',
    confidence: results.statisticalAnalysis?.confidence || 0.8,
    enhancedFeatures: [
      'Advanced statistical analysis with personality archetypes',
      'Comprehensive neurodivergent screening (ADHD, Autism, HSP)',
      'AI-generated personalized narrative (2500+ words)',
      'Trait interaction patterns and insights',
      'Customized growth recommendations'
    ]
  };
}

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    logger.info(`Neurlyn Backend running on port ${PORT}`);
    logger.info('MongoDB connected');
    logger.info('Stripe integration active');
  });
  app.server = server;
} else {
  // In test mode, don't automatically start the server
  logger.info('Running in test mode - server not started automatically');
}

module.exports = app;
