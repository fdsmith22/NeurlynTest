#!/usr/bin/env node

/**
 * Enhance Neurodiversity Question Metadata
 *
 * Adds missing efDomain, sensoryDomain, and correlatedTraits to neurodiversity questions
 */

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

// EF Domain mappings based on question traits
const efDomainMappings = {
  'task_initiation': 'taskInitiation',
  'task_resumption': 'sustainedAttention',
  'cognitive_flexibility': 'flexibility',
  'motivation': 'taskInitiation',
  'perseveration': 'flexibility',
  'procrastination': 'taskInitiation',
  'punctuality': 'timeManagement',
  'time_blindness': 'timeManagement',
  'time_estimation': 'timeManagement',
  'time_management': 'timeManagement',
  'working_memory': 'workingMemory',
  'adhd': 'planning', // general ADHD
  'attention': 'sustainedAttention',
  'hyperactivity': 'emotionalRegulation',
  'impulsivity': 'emotionalRegulation'
};

// Sensory Domain mappings
const sensoryDomainMappings = {
  'sensory_sensitivity': 'tactile',
  'sensory_seeking': 'vestibular',
  'sensory_avoiding': 'auditory',
  'sound_sensitivity': 'auditory',
  'light_sensitivity': 'visual',
  'touch_sensitivity': 'tactile',
  'taste_sensitivity': 'oral',
  'smell_sensitivity': 'olfactory'
};

// Correlated traits for neurodiversity categories
const correlatedTraitsMappings = {
  'executive_function': ['conscientiousness', 'neuroticism'],
  'sensory_processing': ['neuroticism', 'openness'],
  'emotional_regulation': ['neuroticism', 'agreeableness'],
  'social_interaction': ['extraversion', 'agreeableness'],
  'attention': ['conscientiousness'],
  'hyperactivity': ['extraversion', 'neuroticism'],
  'impulsivity': ['conscientiousness', 'neuroticism'],
  'organization': ['conscientiousness']
};

async function enhanceMetadata() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    console.log('='.repeat(80));
    console.log('ENHANCING NEURODIVERSITY QUESTION METADATA');
    console.log('='.repeat(80));

    // Get all neurodiversity questions
    const ndQuestions = await QuestionBank.find({
      category: 'neurodiversity',
      'adaptive.isBaseline': { $ne: true }
    });

    console.log(`\nFound ${ndQuestions.length} neurodiversity questions to enhance\n`);

    let efUpdated = 0;
    let sensoryUpdated = 0;
    let correlatedUpdated = 0;

    for (const question of ndQuestions) {
      let updated = false;

      // Add efDomain for executive function questions
      if (question.subcategory === 'executive_function' && !question.efDomain) {
        const domain = efDomainMappings[question.trait] || 'planning';
        question.efDomain = domain;
        updated = true;
        efUpdated++;
        console.log(`✓ Added efDomain "${domain}" to ${question.questionId}`);
      }

      // Add sensoryDomain for sensory processing questions
      if (question.subcategory === 'sensory_processing' && !question.sensoryDomain) {
        const domain = sensoryDomainMappings[question.trait] || 'tactile';
        question.sensoryDomain = domain;
        updated = true;
        sensoryUpdated++;
        console.log(`✓ Added sensoryDomain "${domain}" to ${question.questionId}`);
      }

      // Add correlatedTraits if missing
      if (!question.adaptive.correlatedTraits || question.adaptive.correlatedTraits.length === 0) {
        // Get from subcategory or trait
        let traits = correlatedTraitsMappings[question.subcategory] ||
                     correlatedTraitsMappings[question.trait] ||
                     ['conscientiousness'];

        if (!question.adaptive) question.adaptive = {};
        question.adaptive.correlatedTraits = traits;
        updated = true;
        correlatedUpdated++;
        console.log(`✓ Added correlatedTraits ${JSON.stringify(traits)} to ${question.questionId}`);
      }

      if (updated) {
        await question.save();
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('ENHANCEMENT SUMMARY');
    console.log('='.repeat(80));
    console.log(`✓ EF Domains added: ${efUpdated}`);
    console.log(`✓ Sensory Domains added: ${sensoryUpdated}`);
    console.log(`✓ Correlated Traits added: ${correlatedUpdated}`);
    console.log(`✓ Total questions enhanced: ${Math.max(efUpdated, sensoryUpdated, correlatedUpdated)}`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

enhanceMetadata();
