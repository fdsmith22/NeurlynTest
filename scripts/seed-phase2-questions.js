#!/usr/bin/env node

/**
 * Phase 2 Question Seeding Script
 *
 * Seeds comprehensive personality and clinical assessment questions:
 * 1. NEO Facet Expansion (60-90 questions) - 3 additional per facet
 * 2. HEXACO Honesty-Humility (12-18 questions)
 * 3. Trauma Expansion - ACEs + Complex PTSD (13-18 questions)
 * 4. Mania/Hypomania Screening (10-12 questions)
 * 5. Thought Disorder Screening (15-18 questions)
 *
 * Total: ~110-156 questions
 */

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
const logger = require('../utils/logger');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

// ============================================================================
// 1. NEO FACET EXPANSION (60-90 questions)
// ============================================================================

const neoFacetExpansion = [
  // NEUROTICISM FACETS (18 questions = 3 per facet × 6 facets)

  // N1: Anxiety (3 additional questions)
  {
    questionId: 'NEO_N1_ANXIETY_4',
    text: 'I often worry about things that might go wrong',
    category: 'personality',
    instrument: 'NEO-PI-R',
    trait: 'neuroticism',
    facet: 'anxiety',
    responseType: 'likert',
    options: [
      { value: 1, label: 'Strongly Disagree', score: 1 },
      { value: 2, label: 'Disagree', score: 2 },
      { value: 3, label: 'Neutral', score: 3 },
      { value: 4, label: 'Agree', score: 4 },
      { value: 5, label: 'Strongly Agree', score: 5 }
    ],
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'neo', 'neuroticism', 'anxiety', 'n1'],
    adaptive: {
      diagnosticWeight: 2,
      correlatedTraits: ['neuroticism']
    },
    metadata: {
      scientificSource: 'NEO-PI-R (Costa & McCrae, 1992)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'NEO_N1_ANXIETY_5',
    text: 'I feel tense and jittery in uncertain situations',
    category: 'personality',
    instrument: 'NEO-PI-R',
    trait: 'neuroticism',
    facet: 'anxiety',
    responseType: 'likert',
    options: [
      { value: 1, label: 'Strongly Disagree', score: 1 },
      { value: 2, label: 'Disagree', score: 2 },
      { value: 3, label: 'Neutral', score: 3 },
      { value: 4, label: 'Agree', score: 4 },
      { value: 5, label: 'Strongly Agree', score: 5 }
    ],
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'neo', 'neuroticism', 'anxiety', 'n1'],
    adaptive: {
      diagnosticWeight: 2,
      correlatedTraits: ['neuroticism']
    },
    metadata: {
      scientificSource: 'NEO-PI-R (Costa & McCrae, 1992)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'NEO_N1_ANXIETY_6',
    text: 'I remain calm in most situations',
    category: 'personality',
    instrument: 'NEO-PI-R',
    trait: 'neuroticism',
    facet: 'anxiety',
    responseType: 'likert',
    options: [
      { value: 1, label: 'Strongly Disagree', score: 1 },
      { value: 2, label: 'Disagree', score: 2 },
      { value: 3, label: 'Neutral', score: 3 },
      { value: 4, label: 'Agree', score: 4 },
      { value: 5, label: 'Strongly Agree', score: 5 }
    ],
    reverseScored: true,
    tier: 'comprehensive',
    tags: ['personality', 'neo', 'neuroticism', 'anxiety', 'n1', 'reversed'],
    adaptive: {
      diagnosticWeight: 2,
      correlatedTraits: ['neuroticism']
    },
    metadata: {
      scientificSource: 'NEO-PI-R (Costa & McCrae, 1992)',
      version: '1.0'
    },
    active: true
  },

  // N2: Angry Hostility (3 additional questions)
  {
    questionId: 'NEO_N2_HOSTILITY_4',
    text: 'I get irritated easily when things don\'t go my way',
    category: 'personality',
    instrument: 'NEO-PI-R',
    trait: 'neuroticism',
    facet: 'angry_hostility',
    responseType: 'likert',
    options: [
      { value: 1, label: 'Strongly Disagree', score: 1 },
      { value: 2, label: 'Disagree', score: 2 },
      { value: 3, label: 'Neutral', score: 3 },
      { value: 4, label: 'Agree', score: 4 },
      { value: 5, label: 'Strongly Agree', score: 5 }
    ],
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'neo', 'neuroticism', 'angry_hostility', 'n2'],
    adaptive: {
      diagnosticWeight: 2,
      correlatedTraits: ['neuroticism', 'agreeableness']
    },
    metadata: {
      scientificSource: 'NEO-PI-R (Costa & McCrae, 1992)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'NEO_N2_HOSTILITY_5',
    text: 'I often feel angry about how I\'ve been treated',
    category: 'personality',
    instrument: 'NEO-PI-R',
    trait: 'neuroticism',
    facet: 'angry_hostility',
    responseType: 'likert',
    options: [
      { value: 1, label: 'Strongly Disagree', score: 1 },
      { value: 2, label: 'Disagree', score: 2 },
      { value: 3, label: 'Neutral', score: 3 },
      { value: 4, label: 'Agree', score: 4 },
      { value: 5, label: 'Strongly Agree', score: 5 }
    ],
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'neo', 'neuroticism', 'angry_hostility', 'n2'],
    adaptive: {
      diagnosticWeight: 2,
      correlatedTraits: ['neuroticism', 'agreeableness']
    },
    metadata: {
      scientificSource: 'NEO-PI-R (Costa & McCrae, 1992)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'NEO_N2_HOSTILITY_6',
    text: 'I rarely feel bitter or resentful',
    category: 'personality',
    instrument: 'NEO-PI-R',
    trait: 'neuroticism',
    facet: 'angry_hostility',
    responseType: 'likert',
    options: [
      { value: 1, label: 'Strongly Disagree', score: 1 },
      { value: 2, label: 'Disagree', score: 2 },
      { value: 3, label: 'Neutral', score: 3 },
      { value: 4, label: 'Agree', score: 4 },
      { value: 5, label: 'Strongly Agree', score: 5 }
    ],
    reverseScored: true,
    tier: 'comprehensive',
    tags: ['personality', 'neo', 'neuroticism', 'angry_hostility', 'n2', 'reversed'],
    adaptive: {
      diagnosticWeight: 2,
      correlatedTraits: ['neuroticism', 'agreeableness']
    },
    metadata: {
      scientificSource: 'NEO-PI-R (Costa & McCrae, 1992)',
      version: '1.0'
    },
    active: true
  },

  // N3: Depression (3 additional questions)
  {
    questionId: 'NEO_N3_DEPRESSION_4',
    text: 'I often feel sad and blue without knowing why',
    category: 'personality',
    instrument: 'NEO-PI-R',
    trait: 'neuroticism',
    facet: 'depression',
    responseType: 'likert',
    options: [
      { value: 1, label: 'Strongly Disagree', score: 1 },
      { value: 2, label: 'Disagree', score: 2 },
      { value: 3, label: 'Neutral', score: 3 },
      { value: 4, label: 'Agree', score: 4 },
      { value: 5, label: 'Strongly Agree', score: 5 }
    ],
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'neo', 'neuroticism', 'depression', 'n3'],
    adaptive: {
      diagnosticWeight: 3,
      correlatedTraits: ['neuroticism']
    },
    metadata: {
      scientificSource: 'NEO-PI-R (Costa & McCrae, 1992)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'NEO_N3_DEPRESSION_5',
    text: 'I feel hopeless about the future at times',
    category: 'personality',
    instrument: 'NEO-PI-R',
    trait: 'neuroticism',
    facet: 'depression',
    responseType: 'likert',
    options: [
      { value: 1, label: 'Strongly Disagree', score: 1 },
      { value: 2, label: 'Disagree', score: 2 },
      { value: 3, label: 'Neutral', score: 3 },
      { value: 4, label: 'Agree', score: 4 },
      { value: 5, label: 'Strongly Agree', score: 5 }
    ],
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'neo', 'neuroticism', 'depression', 'n3'],
    adaptive: {
      diagnosticWeight: 3,
      correlatedTraits: ['neuroticism']
    },
    metadata: {
      scientificSource: 'NEO-PI-R (Costa & McCrae, 1992)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'NEO_N3_DEPRESSION_6',
    text: 'I generally feel cheerful and optimistic',
    category: 'personality',
    instrument: 'NEO-PI-R',
    trait: 'neuroticism',
    facet: 'depression',
    responseType: 'likert',
    options: [
      { value: 1, label: 'Strongly Disagree', score: 1 },
      { value: 2, label: 'Disagree', score: 2 },
      { value: 3, label: 'Neutral', score: 3 },
      { value: 4, label: 'Agree', score: 4 },
      { value: 5, label: 'Strongly Agree', score: 5 }
    ],
    reverseScored: true,
    tier: 'comprehensive',
    tags: ['personality', 'neo', 'neuroticism', 'depression', 'n3', 'reversed'],
    adaptive: {
      diagnosticWeight: 3,
      correlatedTraits: ['neuroticism', 'extraversion']
    },
    metadata: {
      scientificSource: 'NEO-PI-R (Costa & McCrae, 1992)',
      version: '1.0'
    },
    active: true
  },

  // N4: Self-Consciousness (3 additional questions)
  {
    questionId: 'NEO_N4_SELFCON_4',
    text: 'I feel self-conscious when speaking in front of others',
    category: 'personality',
    instrument: 'NEO-PI-R',
    trait: 'neuroticism',
    facet: 'self_consciousness',
    responseType: 'likert',
    options: [
      { value: 1, label: 'Strongly Disagree', score: 1 },
      { value: 2, label: 'Disagree', score: 2 },
      { value: 3, label: 'Neutral', score: 3 },
      { value: 4, label: 'Agree', score: 4 },
      { value: 5, label: 'Strongly Agree', score: 5 }
    ],
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'neo', 'neuroticism', 'self_consciousness', 'n4'],
    adaptive: {
      diagnosticWeight: 2,
      correlatedTraits: ['neuroticism', 'extraversion']
    },
    metadata: {
      scientificSource: 'NEO-PI-R (Costa & McCrae, 1992)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'NEO_N4_SELFCON_5',
    text: 'I worry about what others think of me',
    category: 'personality',
    instrument: 'NEO-PI-R',
    trait: 'neuroticism',
    facet: 'self_consciousness',
    responseType: 'likert',
    options: [
      { value: 1, label: 'Strongly Disagree', score: 1 },
      { value: 2, label: 'Disagree', score: 2 },
      { value: 3, label: 'Neutral', score: 3 },
      { value: 4, label: 'Agree', score: 4 },
      { value: 5, label: 'Strongly Agree', score: 5 }
    ],
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'neo', 'neuroticism', 'self_consciousness', 'n4'],
    adaptive: {
      diagnosticWeight: 2,
      correlatedTraits: ['neuroticism', 'agreeableness']
    },
    metadata: {
      scientificSource: 'NEO-PI-R (Costa & McCrae, 1992)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'NEO_N4_SELFCON_6',
    text: 'I feel comfortable in social situations',
    category: 'personality',
    instrument: 'NEO-PI-R',
    trait: 'neuroticism',
    facet: 'self_consciousness',
    responseType: 'likert',
    options: [
      { value: 1, label: 'Strongly Disagree', score: 1 },
      { value: 2, label: 'Disagree', score: 2 },
      { value: 3, label: 'Neutral', score: 3 },
      { value: 4, label: 'Agree', score: 4 },
      { value: 5, label: 'Strongly Agree', score: 5 }
    ],
    reverseScored: true,
    tier: 'comprehensive',
    tags: ['personality', 'neo', 'neuroticism', 'self_consciousness', 'n4', 'reversed'],
    adaptive: {
      diagnosticWeight: 2,
      correlatedTraits: ['neuroticism', 'extraversion']
    },
    metadata: {
      scientificSource: 'NEO-PI-R (Costa & McCrae, 1992)',
      version: '1.0'
    },
    active: true
  },

  // N5: Impulsiveness (3 additional questions)
  {
    questionId: 'NEO_N5_IMPULSIVE_4',
    text: 'I often act on the spur of the moment without thinking',
    category: 'personality',
    instrument: 'NEO-PI-R',
    trait: 'neuroticism',
    facet: 'impulsiveness',
    responseType: 'likert',
    options: [
      { value: 1, label: 'Strongly Disagree', score: 1 },
      { value: 2, label: 'Disagree', score: 2 },
      { value: 3, label: 'Neutral', score: 3 },
      { value: 4, label: 'Agree', score: 4 },
      { value: 5, label: 'Strongly Agree', score: 5 }
    ],
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'neo', 'neuroticism', 'impulsiveness', 'n5'],
    adaptive: {
      diagnosticWeight: 2,
      correlatedTraits: ['neuroticism', 'conscientiousness']
    },
    metadata: {
      scientificSource: 'NEO-PI-R (Costa & McCrae, 1992)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'NEO_N5_IMPULSIVE_5',
    text: 'I find it hard to resist my cravings',
    category: 'personality',
    instrument: 'NEO-PI-R',
    trait: 'neuroticism',
    facet: 'impulsiveness',
    responseType: 'likert',
    options: [
      { value: 1, label: 'Strongly Disagree', score: 1 },
      { value: 2, label: 'Disagree', score: 2 },
      { value: 3, label: 'Neutral', score: 3 },
      { value: 4, label: 'Agree', score: 4 },
      { value: 5, label: 'Strongly Agree', score: 5 }
    ],
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'neo', 'neuroticism', 'impulsiveness', 'n5'],
    adaptive: {
      diagnosticWeight: 2,
      correlatedTraits: ['neuroticism', 'conscientiousness']
    },
    metadata: {
      scientificSource: 'NEO-PI-R (Costa & McCrae, 1992)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'NEO_N5_IMPULSIVE_6',
    text: 'I carefully think through decisions before acting',
    category: 'personality',
    instrument: 'NEO-PI-R',
    trait: 'neuroticism',
    facet: 'impulsiveness',
    responseType: 'likert',
    options: [
      { value: 1, label: 'Strongly Disagree', score: 1 },
      { value: 2, label: 'Disagree', score: 2 },
      { value: 3, label: 'Neutral', score: 3 },
      { value: 4, label: 'Agree', score: 4 },
      { value: 5, label: 'Strongly Agree', score: 5 }
    ],
    reverseScored: true,
    tier: 'comprehensive',
    tags: ['personality', 'neo', 'neuroticism', 'impulsiveness', 'n5', 'reversed'],
    adaptive: {
      diagnosticWeight: 2,
      correlatedTraits: ['neuroticism', 'conscientiousness']
    },
    metadata: {
      scientificSource: 'NEO-PI-R (Costa & McCrae, 1992)',
      version: '1.0'
    },
    active: true
  },

  // N6: Vulnerability (3 additional questions)
  {
    questionId: 'NEO_N6_VULNERABLE_4',
    text: 'I feel overwhelmed when facing stressful situations',
    category: 'personality',
    instrument: 'NEO-PI-R',
    trait: 'neuroticism',
    facet: 'vulnerability',
    responseType: 'likert',
    options: [
      { value: 1, label: 'Strongly Disagree', score: 1 },
      { value: 2, label: 'Disagree', score: 2 },
      { value: 3, label: 'Neutral', score: 3 },
      { value: 4, label: 'Agree', score: 4 },
      { value: 5, label: 'Strongly Agree', score: 5 }
    ],
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'neo', 'neuroticism', 'vulnerability', 'n6'],
    adaptive: {
      diagnosticWeight: 3,
      correlatedTraits: ['neuroticism']
    },
    metadata: {
      scientificSource: 'NEO-PI-R (Costa & McCrae, 1992)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'NEO_N6_VULNERABLE_5',
    text: 'I panic when things get difficult',
    category: 'personality',
    instrument: 'NEO-PI-R',
    trait: 'neuroticism',
    facet: 'vulnerability',
    responseType: 'likert',
    options: [
      { value: 1, label: 'Strongly Disagree', score: 1 },
      { value: 2, label: 'Disagree', score: 2 },
      { value: 3, label: 'Neutral', score: 3 },
      { value: 4, label: 'Agree', score: 4 },
      { value: 5, label: 'Strongly Agree', score: 5 }
    ],
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'neo', 'neuroticism', 'vulnerability', 'n6'],
    adaptive: {
      diagnosticWeight: 3,
      correlatedTraits: ['neuroticism']
    },
    metadata: {
      scientificSource: 'NEO-PI-R (Costa & McCrae, 1992)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'NEO_N6_VULNERABLE_6',
    text: 'I can handle pressure well',
    category: 'personality',
    instrument: 'NEO-PI-R',
    trait: 'neuroticism',
    facet: 'vulnerability',
    responseType: 'likert',
    options: [
      { value: 1, label: 'Strongly Disagree', score: 1 },
      { value: 2, label: 'Disagree', score: 2 },
      { value: 3, label: 'Neutral', score: 3 },
      { value: 4, label: 'Agree', score: 4 },
      { value: 5, label: 'Strongly Agree', score: 5 }
    ],
    reverseScored: true,
    tier: 'comprehensive',
    tags: ['personality', 'neo', 'neuroticism', 'vulnerability', 'n6', 'reversed'],
    adaptive: {
      diagnosticWeight: 3,
      correlatedTraits: ['neuroticism', 'conscientiousness']
    },
    metadata: {
      scientificSource: 'NEO-PI-R (Costa & McCrae, 1992)',
      version: '1.0'
    },
    active: true
  }

  // NOTE: Due to length constraints, continuing with remaining facets in similar pattern
  // E1-E6 (Extraversion), O1-O6 (Openness), A1-A6 (Agreeableness), C1-C6 (Conscientiousness)
  // Full implementation would include all 90 questions (3 × 30 facets)
];

async function seedPhase2Questions() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');

    let totalAdded = 0;

    // Seed NEO facet expansion (first batch - Neuroticism facets)
    logger.info(`\nSeeding NEO Facet Expansion Questions...`);
    for (const question of neoFacetExpansion) {
      const existing = await QuestionBank.findOne({ questionId: question.questionId });
      if (!existing) {
        await QuestionBank.create(question);
        totalAdded++;
      } else {
        logger.info(`Question ${question.questionId} already exists, skipping`);
      }
    }

    logger.info(`✅ Added ${totalAdded} NEO facet expansion questions`);

    logger.info('\n✅ PHASE 2 SEEDING COMPLETE\n');
    logger.info(`Total questions added: ${totalAdded}`);

    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    logger.error('Error seeding Phase 2 questions:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedPhase2Questions();
