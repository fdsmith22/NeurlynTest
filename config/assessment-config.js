/**
 * Assessment Configuration
 * Defines settings for free and paid assessment tiers
 */

const ASSESSMENT_CONFIG = {
  FREE: {
    name: 'Free Assessment',
    baselineQuestions: 10,
    adaptiveQuestions: 20,
    totalQuestions: 30,
    reportDepth: 'standard',
    features: ['basic_traits', 'personality_archetype', 'key_insights', 'basic_recommendations'],
    apiEndpoints: {
      start: '/api/assessments/free/start',
      baseline: '/api/assessments/free/baseline-complete',
      complete: '/api/assessments/free/complete',
      nextQuestion: '/api/assessments/free/next-question'
    },
    reportModules: {
      generator: 'free-report-generator',
      displayComponent: 'free-report-display'
    }
  },

  PAID: {
    name: 'Comprehensive Assessment',
    baselineQuestions: 20,
    adaptiveQuestions: 50,
    totalQuestions: 70,
    reportDepth: 'comprehensive',
    features: [
      'detailed_traits',
      'sub_dimensions',
      'personality_archetype',
      'cognitive_profile',
      'emotional_profile',
      'social_profile',
      'career_insights',
      'relationship_insights',
      'growth_plan',
      'neurodiversity_screening',
      'population_percentiles',
      'behavioral_fingerprint'
    ],
    apiEndpoints: {
      start: '/api/assessments/paid/start',
      baseline: '/api/assessments/paid/baseline-complete',
      complete: '/api/assessments/paid/complete',
      nextQuestion: '/api/assessments/paid/next-question'
    },
    reportModules: {
      generator: 'paid-report-generator',
      displayComponent: 'paid-report-display'
    },
    pricing: {
      amount: 2999, // in cents ($29.99)
      currency: 'usd',
      description: 'Comprehensive Personality Assessment'
    }
  },

  SHARED: {
    questionTimeouts: {
      baseline: 60000, // 60 seconds per question
      adaptive: 45000 // 45 seconds per question
    },
    validationRules: {
      minResponseTime: 500, // milliseconds
      maxResponseTime: 300000, // 5 minutes
      requiredCompletionRate: 0.8 // 80% of questions must be answered
    },
    localStorage: {
      sessionKey: 'neurlyn_assessment_session',
      recoveryKey: 'neurlyn_assessment_recovery',
      expirationHours: 24
    }
  }
};

// Export for use in both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ASSESSMENT_CONFIG;
} else if (typeof window !== 'undefined') {
  window.ASSESSMENT_CONFIG = ASSESSMENT_CONFIG;
}
