/**
 * Add missing sensory questions to complete domain coverage
 * Adds: 2 vestibular, 2 oral/gustatory, 1 olfactory
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';
const QuestionBank = require('../models/QuestionBank');

const newSensoryQuestions = [
  // VESTIBULAR QUESTIONS (need 2 more)
  {
    questionId: 'NEURLYN_SENSORY_VESTIBULAR_2',
    text: 'I feel uncomfortable or anxious in elevators or on escalators',
    category: 'neurodiversity',
    subcategory: 'sensory_processing',
    trait: 'vestibular',
    facet: 'movement_sensitivity',
    instrument: 'NEURLYN_SENSORY',
    responseType: 'likert',
    tier: 'core',
    active: true,
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism', 'openness'],
      diagnosticWeight: 0.8,
      weight: 1.0
    },
    tags: ['sensory', 'vestibular', 'neurodiversity', 'adaptive', 'movement']
  },
  {
    questionId: 'NEURLYN_SENSORY_VESTIBULAR_3',
    text: 'I avoid activities that involve spinning, swinging, or rapid changes in position',
    category: 'neurodiversity',
    subcategory: 'sensory_processing',
    trait: 'vestibular',
    facet: 'movement_avoidance',
    instrument: 'NEURLYN_SENSORY',
    responseType: 'likert',
    tier: 'core',
    active: true,
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism', 'openness'],
      diagnosticWeight: 0.8,
      weight: 1.0
    },
    tags: ['sensory', 'vestibular', 'neurodiversity', 'adaptive', 'balance']
  },

  // ORAL/GUSTATORY QUESTIONS (need 2 more)
  {
    questionId: 'NEURLYN_SENSORY_ORAL_2',
    text: 'I am extremely sensitive to food temperatures - foods must be just right',
    category: 'neurodiversity',
    subcategory: 'sensory_processing',
    trait: 'oral',
    facet: 'temperature_sensitivity',
    instrument: 'NEURLYN_SENSORY',
    responseType: 'likert',
    tier: 'core',
    active: true,
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism', 'conscientiousness'],
      diagnosticWeight: 0.8,
      weight: 1.0
    },
    tags: ['sensory', 'oral', 'gustatory', 'neurodiversity', 'adaptive', 'food']
  },
  {
    questionId: 'NEURLYN_SENSORY_ORAL_3',
    text: 'I struggle with mixed textures in food (e.g., yogurt with fruit pieces)',
    category: 'neurodiversity',
    subcategory: 'sensory_processing',
    trait: 'oral',
    facet: 'texture_sensitivity',
    instrument: 'NEURLYN_SENSORY',
    responseType: 'likert',
    tier: 'core',
    active: true,
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism', 'conscientiousness'],
      diagnosticWeight: 0.8,
      weight: 1.0
    },
    tags: ['sensory', 'oral', 'gustatory', 'neurodiversity', 'adaptive', 'texture']
  },

  // OLFACTORY QUESTION (need 1 more)
  {
    questionId: 'NEURLYN_SENSORY_OLFACTORY_3',
    text: 'I can detect odors that others don\'t notice, and they often bother me',
    category: 'neurodiversity',
    subcategory: 'sensory_processing',
    trait: 'olfactory',
    facet: 'smell_sensitivity',
    instrument: 'NEURLYN_SENSORY',
    responseType: 'likert',
    tier: 'core',
    active: true,
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism', 'openness'],
      diagnosticWeight: 0.8,
      weight: 1.0
    },
    tags: ['sensory', 'olfactory', 'smell', 'neurodiversity', 'adaptive']
  }
];

async function addMissingSensoryQuestions() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');
    console.log('='.repeat(80));
    console.log('           ADDING MISSING SENSORY QUESTIONS');
    console.log('='.repeat(80));

    // Check current sensory domain counts
    const sensoryDomains = ['visual', 'auditory', 'tactile', 'vestibular', 'oral', 'olfactory'];

    console.log('\n📊 Current Sensory Domain Coverage:\n');
    for (const domain of sensoryDomains) {
      const count = await QuestionBank.countDocuments({
        active: true,
        trait: domain
      });
      const status = count >= 3 ? '✓' : '⚠️';
      console.log(`${status} ${domain}: ${count} questions`);
    }

    console.log('\n➕ Adding 5 New Sensory Questions:\n');

    let added = 0;
    for (const question of newSensoryQuestions) {
      // Check if question already exists
      const existing = await QuestionBank.findOne({ questionId: question.questionId });

      if (existing) {
        console.log(`  ⊘ ${question.questionId} already exists, skipping...`);
      } else {
        await QuestionBank.create(question);
        console.log(`  ✓ Added ${question.questionId}`);
        console.log(`    "${question.text}"`);
        console.log(`    Domain: ${question.trait}\n`);
        added++;
      }
    }

    console.log('='.repeat(80));
    console.log(`✓ Added ${added} new sensory questions`);
    console.log('='.repeat(80));

    // Verify new counts
    console.log('\n📊 Updated Sensory Domain Coverage:\n');
    let allComplete = true;
    for (const domain of sensoryDomains) {
      const count = await QuestionBank.countDocuments({
        active: true,
        trait: domain
      });
      const status = count >= 3 ? '✓' : '⚠️';
      console.log(`${status} ${domain}: ${count} questions`);
      if (count < 3) allComplete = false;
    }

    // Check total
    const totalSensory = await QuestionBank.countDocuments({
      active: true,
      instrument: 'NEURLYN_SENSORY'
    });

    console.log(`\n✓ Total sensory questions: ${totalSensory}`);

    if (allComplete) {
      console.log('\n🎉 ALL SENSORY DOMAINS NOW HAVE ADEQUATE COVERAGE! 🎉');
    } else {
      console.log('\n⚠️  Some domains still need more questions');
    }

    console.log('\n' + '='.repeat(80));
    console.log('                    TASK COMPLETE');
    console.log('='.repeat(80) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addMissingSensoryQuestions();
