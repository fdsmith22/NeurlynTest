/**
 * Add Soft Probe Questions for Gentle Clinical Screening
 *
 * These indirect questions build rapport while identifying users who may need
 * deeper clinical assessment. They ask about general wellbeing, not symptoms.
 *
 * Run: node scripts/add-soft-probe-questions.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

const SOFT_PROBE_QUESTIONS = [
  // ===== DEPRESSION PROBES =====
  {
    questionId: 'PROBE_ENERGY_1',
    text: 'How would you rate your energy levels lately?',
    category: 'personality',
    subcategory: 'general_wellbeing',
    instrument: 'NEURLYN_SOFT_PROBE',
    responseType: 'likert',
    reverseScored: false,
    weight: 1,
    tier: 'core',
    tags: ['soft_probe', 'depression_screen', 'baseline', 'gateway'],
    active: true,
    sensitivity: 'NONE',
    probeTarget: 'depression',
    probeIndicators: { lowEnergy: { minScore: 4 } }, // Score 4-5 = low energy
    options: [
      { value: 1, label: 'Very Low - Constantly exhausted', score: 1 },
      { value: 2, label: 'Low - Often tired', score: 2 },
      { value: 3, label: 'Moderate - Sometimes tired', score: 3 },
      { value: 4, label: 'Good - Usually energized', score: 4 },
      { value: 5, label: 'Excellent - Consistently energetic', score: 5 }
    ],
    adaptive: {
      isBaseline: true,
      baselinePriority: 2,
      diagnosticWeight: 3,
      difficultyLevel: 1,
      discriminationIndex: 0.65,
      correlatedTraits: ['neuroticism'],
      adaptiveCriteria: {
        triggerTraits: [],
        triggerPatterns: [],
        followUpTo: [],
        incompatibleWith: [],
        requiredPrior: []
      }
    },
    requiredSignals: {
      minQuestionCount: 0,
      anyOf: false,
      triggerConditions: []
    }
  },

  {
    questionId: 'PROBE_MOOD_1',
    text: 'How satisfied are you with your overall mood lately?',
    category: 'personality',
    subcategory: 'general_wellbeing',
    instrument: 'NEURLYN_SOFT_PROBE',
    responseType: 'likert',
    reverseScored: false,
    weight: 1,
    tier: 'core',
    tags: ['soft_probe', 'depression_screen', 'baseline', 'gateway'],
    active: true,
    sensitivity: 'NONE',
    probeTarget: 'depression',
    probeIndicators: { lowMood: { minScore: 4 } },
    options: [
      { value: 1, label: 'Very dissatisfied', score: 1 },
      { value: 2, label: 'Somewhat dissatisfied', score: 2 },
      { value: 3, label: 'Neutral', score: 3 },
      { value: 4, label: 'Satisfied', score: 4 },
      { value: 5, label: 'Very satisfied', score: 5 }
    ],
    adaptive: {
      isBaseline: true,
      baselinePriority: 2,
      diagnosticWeight: 3,
      difficultyLevel: 1,
      discriminationIndex: 0.70,
      correlatedTraits: ['neuroticism'],
      adaptiveCriteria: {
        triggerTraits: [],
        triggerPatterns: [],
        followUpTo: [],
        incompatibleWith: [],
        requiredPrior: []
      }
    },
    requiredSignals: {
      minQuestionCount: 0,
      anyOf: false,
      triggerConditions: []
    }
  },

  {
    questionId: 'PROBE_SLEEP_1',
    text: 'How well have you been sleeping recently?',
    category: 'personality',
    subcategory: 'general_wellbeing',
    instrument: 'NEURLYN_SOFT_PROBE',
    responseType: 'likert',
    reverseScored: false,
    weight: 1,
    tier: 'core',
    tags: ['soft_probe', 'depression_screen', 'anxiety_screen', 'baseline', 'gateway'],
    active: true,
    sensitivity: 'NONE',
    probeTarget: ['depression', 'anxiety'],
    probeIndicators: { sleepProblems: { minScore: 4 } },
    options: [
      { value: 1, label: 'Very poorly - Major sleep problems', score: 1 },
      { value: 2, label: 'Poorly - Frequent sleep issues', score: 2 },
      { value: 3, label: 'Okay - Occasional sleep issues', score: 3 },
      { value: 4, label: 'Well - Generally sleep well', score: 4 },
      { value: 5, label: 'Excellently - Consistently restful sleep', score: 5 }
    ],
    adaptive: {
      isBaseline: true,
      baselinePriority: 2,
      diagnosticWeight: 3,
      difficultyLevel: 1,
      discriminationIndex: 0.68,
      correlatedTraits: ['neuroticism'],
      adaptiveCriteria: {
        triggerTraits: [],
        triggerPatterns: [],
        followUpTo: [],
        incompatibleWith: [],
        requiredPrior: []
      }
    },
    requiredSignals: {
      minQuestionCount: 0,
      anyOf: false,
      triggerConditions: []
    }
  },

  // ===== ANXIETY PROBES =====
  {
    questionId: 'PROBE_STRESS_1',
    text: 'When something stressful happens, how quickly do you usually bounce back?',
    category: 'personality',
    subcategory: 'resilience',
    instrument: 'NEURLYN_SOFT_PROBE',
    responseType: 'likert',
    reverseScored: false,
    weight: 1,
    tier: 'core',
    tags: ['soft_probe', 'anxiety_screen', 'resilience', 'baseline'],
    active: true,
    sensitivity: 'NONE',
    probeTarget: 'anxiety',
    probeIndicators: { lowResilience: { minScore: 4 } },
    options: [
      { value: 1, label: 'Very slowly - Stress lingers for days/weeks', score: 1 },
      { value: 2, label: 'Slowly - Takes several days', score: 2 },
      { value: 3, label: 'Moderately - Recovers within a day or two', score: 3 },
      { value: 4, label: 'Quickly - Recovers within hours', score: 4 },
      { value: 5, label: 'Very quickly - Bounces back almost immediately', score: 5 }
    ],
    adaptive: {
      isBaseline: true,
      baselinePriority: 2,
      diagnosticWeight: 3,
      difficultyLevel: 1,
      discriminationIndex: 0.72,
      correlatedTraits: ['neuroticism'],
      adaptiveCriteria: {
        triggerTraits: [],
        triggerPatterns: [],
        followUpTo: [],
        incompatibleWith: [],
        requiredPrior: []
      }
    },
    requiredSignals: {
      minQuestionCount: 0,
      anyOf: false,
      triggerConditions: []
    }
  },

  {
    questionId: 'PROBE_WORRY_1',
    text: 'How often do you find yourself worrying about things?',
    category: 'personality',
    subcategory: 'general_wellbeing',
    instrument: 'NEURLYN_SOFT_PROBE',
    responseType: 'likert',
    reverseScored: true,
    weight: 1,
    tier: 'core',
    tags: ['soft_probe', 'anxiety_screen', 'baseline'],
    active: true,
    sensitivity: 'NONE',
    probeTarget: 'anxiety',
    probeIndicators: { worry: { minScore: 4 } },
    options: [
      { value: 1, label: 'Rarely - Almost never worry', score: 1 },
      { value: 2, label: 'Occasionally - Sometimes worry', score: 2 },
      { value: 3, label: 'Moderately - Worry regularly', score: 3 },
      { value: 4, label: 'Frequently - Worry often', score: 4 },
      { value: 5, label: 'Constantly - Worry almost all the time', score: 5 }
    ],
    adaptive: {
      isBaseline: true,
      baselinePriority: 2,
      diagnosticWeight: 3,
      difficultyLevel: 1,
      discriminationIndex: 0.75,
      correlatedTraits: ['neuroticism'],
      adaptiveCriteria: {
        triggerTraits: [],
        triggerPatterns: [],
        followUpTo: [],
        incompatibleWith: [],
        requiredPrior: []
      }
    },
    requiredSignals: {
      minQuestionCount: 0,
      anyOf: false,
      triggerConditions: []
    }
  },

  // ===== SOCIAL ANXIETY PROBE =====
  {
    questionId: 'PROBE_SOCIAL_1',
    text: 'How comfortable are you making small talk with strangers or acquaintances?',
    category: 'personality',
    subcategory: 'social_comfort',
    instrument: 'NEURLYN_SOFT_PROBE',
    responseType: 'likert',
    reverseScored: false,
    weight: 1,
    tier: 'core',
    tags: ['soft_probe', 'social_anxiety_screen', 'baseline'],
    active: true,
    sensitivity: 'NONE',
    probeTarget: 'social_anxiety',
    probeIndicators: { socialDiscomfort: { minScore: 4 } },
    options: [
      { value: 1, label: 'Very uncomfortable - Actively avoid it', score: 1 },
      { value: 2, label: 'Uncomfortable - Find it difficult', score: 2 },
      { value: 3, label: 'Neutral - Can manage but don\'t enjoy it', score: 3 },
      { value: 4, label: 'Comfortable - Generally enjoy it', score: 4 },
      { value: 5, label: 'Very comfortable - Love meeting new people', score: 5 }
    ],
    adaptive: {
      isBaseline: true,
      baselinePriority: 2,
      diagnosticWeight: 2,
      difficultyLevel: 1,
      discriminationIndex: 0.65,
      correlatedTraits: ['extraversion'],
      adaptiveCriteria: {
        triggerTraits: [],
        triggerPatterns: [],
        followUpTo: [],
        incompatibleWith: [],
        requiredPrior: []
      }
    },
    requiredSignals: {
      minQuestionCount: 0,
      anyOf: false,
      triggerConditions: []
    }
  },

  // ===== GENERAL WELLBEING PROBES =====
  {
    questionId: 'PROBE_LIFE_SAT_1',
    text: 'How satisfied are you with your life overall right now?',
    category: 'personality',
    subcategory: 'general_wellbeing',
    instrument: 'NEURLYN_SOFT_PROBE',
    responseType: 'likert',
    reverseScored: false,
    weight: 1,
    tier: 'core',
    tags: ['soft_probe', 'depression_screen', 'general_wellbeing', 'baseline', 'gateway'],
    active: true,
    sensitivity: 'NONE',
    probeTarget: ['depression', 'anxiety'],
    probeIndicators: { lowLifeSatisfaction: { minScore: 4 } },
    options: [
      { value: 1, label: 'Very dissatisfied', score: 1 },
      { value: 2, label: 'Dissatisfied', score: 2 },
      { value: 3, label: 'Neutral', score: 3 },
      { value: 4, label: 'Satisfied', score: 4 },
      { value: 5, label: 'Very satisfied', score: 5 }
    ],
    adaptive: {
      isBaseline: true,
      baselinePriority: 1, // High priority - ask early
      diagnosticWeight: 3,
      difficultyLevel: 1,
      discriminationIndex: 0.70,
      correlatedTraits: ['neuroticism'],
      adaptiveCriteria: {
        triggerTraits: [],
        triggerPatterns: [],
        followUpTo: [],
        incompatibleWith: [],
        requiredPrior: []
      }
    },
    requiredSignals: {
      minQuestionCount: 0,
      anyOf: false,
      triggerConditions: []
    }
  },

  {
    questionId: 'PROBE_INTEREST_1',
    text: 'How interested and engaged do you feel in your daily activities?',
    category: 'personality',
    subcategory: 'engagement',
    instrument: 'NEURLYN_SOFT_PROBE',
    responseType: 'likert',
    reverseScored: false,
    weight: 1,
    tier: 'core',
    tags: ['soft_probe', 'depression_screen', 'baseline'],
    active: true,
    sensitivity: 'NONE',
    probeTarget: 'depression',
    probeIndicators: { anhedonia: { minScore: 4 } },
    options: [
      { value: 1, label: 'Not interested at all - Everything feels pointless', score: 1 },
      { value: 2, label: 'Minimally interested - Hard to engage', score: 2 },
      { value: 3, label: 'Moderately interested - Some activities engage me', score: 3 },
      { value: 4, label: 'Very interested - Most activities engage me', score: 4 },
      { value: 5, label: 'Extremely interested - Passionate about daily life', score: 5 }
    ],
    adaptive: {
      isBaseline: true,
      baselinePriority: 2,
      diagnosticWeight: 3,
      difficultyLevel: 1,
      discriminationIndex: 0.72,
      correlatedTraits: ['openness', 'extraversion'],
      adaptiveCriteria: {
        triggerTraits: [],
        triggerPatterns: [],
        followUpTo: [],
        incompatibleWith: [],
        requiredPrior: []
      }
    },
    requiredSignals: {
      minQuestionCount: 0,
      anyOf: false,
      triggerConditions: []
    }
  },

  {
    questionId: 'PROBE_PHYSICAL_1',
    text: 'How would you rate your overall physical health?',
    category: 'personality',
    subcategory: 'physical_health',
    instrument: 'NEURLYN_SOFT_PROBE',
    responseType: 'likert',
    reverseScored: false,
    weight: 1,
    tier: 'core',
    tags: ['soft_probe', 'somatic_screen', 'baseline'],
    active: true,
    sensitivity: 'NONE',
    probeTarget: 'somatic',
    probeIndicators: { poorHealth: { minScore: 4 } },
    options: [
      { value: 1, label: 'Poor - Frequent health problems', score: 1 },
      { value: 2, label: 'Fair - Some health concerns', score: 2 },
      { value: 3, label: 'Good - Generally healthy', score: 3 },
      { value: 4, label: 'Very good - Rarely have health issues', score: 4 },
      { value: 5, label: 'Excellent - Consistently great health', score: 5 }
    ],
    adaptive: {
      isBaseline: true,
      baselinePriority: 2,
      diagnosticWeight: 2,
      difficultyLevel: 1,
      discriminationIndex: 0.60,
      correlatedTraits: ['neuroticism'],
      adaptiveCriteria: {
        triggerTraits: [],
        triggerPatterns: [],
        followUpTo: [],
        incompatibleWith: [],
        requiredPrior: []
      }
    },
    requiredSignals: {
      minQuestionCount: 0,
      anyOf: false,
      triggerConditions: []
    }
  },

  {
    questionId: 'PROBE_CONCENTRATION_1',
    text: 'How easy is it for you to concentrate and stay focused when you need to?',
    category: 'personality',
    subcategory: 'cognitive_function',
    instrument: 'NEURLYN_SOFT_PROBE',
    responseType: 'likert',
    reverseScored: false,
    weight: 1,
    tier: 'core',
    tags: ['soft_probe', 'adhd_screen', 'depression_screen', 'baseline'],
    active: true,
    sensitivity: 'NONE',
    probeTarget: ['adhd', 'depression'],
    probeIndicators: { concentrationProblems: { minScore: 4 } },
    options: [
      { value: 1, label: 'Very difficult - Can\'t focus at all', score: 1 },
      { value: 2, label: 'Difficult - Struggle to concentrate', score: 2 },
      { value: 3, label: 'Moderate - Can focus with effort', score: 3 },
      { value: 4, label: 'Easy - Usually focus well', score: 4 },
      { value: 5, label: 'Very easy - Excellent focus', score: 5 }
    ],
    adaptive: {
      isBaseline: true,
      baselinePriority: 2,
      diagnosticWeight: 3,
      difficultyLevel: 1,
      discriminationIndex: 0.70,
      correlatedTraits: ['conscientiousness'],
      adaptiveCriteria: {
        triggerTraits: [],
        triggerPatterns: [],
        followUpTo: [],
        incompatibleWith: [],
        requiredPrior: []
      }
    },
    requiredSignals: {
      minQuestionCount: 0,
      anyOf: false,
      triggerConditions: []
    }
  }
];

async function addSoftProbeQuestions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test');
    console.log('✅ Connected to MongoDB\n');

    console.log('='.repeat(70));
    console.log('  ADDING SOFT PROBE QUESTIONS');
    console.log('='.repeat(70));
    console.log('\nThese gentle questions screen for clinical issues without being invasive.');
    console.log('They ask about wellbeing, not symptoms.\n');

    let addedCount = 0;
    let skippedCount = 0;

    for (const question of SOFT_PROBE_QUESTIONS) {
      // Check if question already exists
      const existing = await QuestionBank.findOne({ questionId: question.questionId });

      if (existing) {
        console.log(`⏭️  Skipping ${question.questionId} - already exists`);
        skippedCount++;
        continue;
      }

      // Add question
      await QuestionBank.create(question);
      console.log(`✅ Added ${question.questionId}: "${question.text.substring(0, 60)}..."`);
      addedCount++;
    }

    console.log('\n' + '='.repeat(70));
    console.log('  SOFT PROBE QUESTIONS ADDED');
    console.log('='.repeat(70));
    console.log(`\n✅ Added: ${addedCount} questions`);
    console.log(`⏭️  Skipped: ${skippedCount} questions (already exist)`);
    console.log(`📊 Total soft probes: ${addedCount + skippedCount}\n`);

    console.log('These questions will now appear early in assessments (Q1-10)');
    console.log('and help identify users who need deeper clinical assessment.\n');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  addSoftProbeQuestions();
}

module.exports = addSoftProbeQuestions;
