/**
 * Comprehensive Question Database Enhancement
 *
 * Fixes ALL metadata issues:
 * 1. Adds correlatedTraits to all questions
 * 2. Adds appropriate tags
 * 3. Normalizes sensory domain traits
 * 4. Fixes trait mismatches
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';
const QuestionBank = require('../models/QuestionBank');

// Define correlatedTraits rules based on psychological research
const correlatedTraitsRules = {
  // Big Five personality traits
  openness: ['openness', 'neuroticism'],
  conscientiousness: ['conscientiousness', 'neuroticism'],
  extraversion: ['extraversion', 'agreeableness'],
  agreeableness: ['agreeableness', 'conscientiousness'],
  neuroticism: ['neuroticism', 'conscientiousness'],

  // Sensory traits (linked to neuroticism and openness)
  visual: ['neuroticism', 'openness'],
  auditory: ['neuroticism', 'openness'],
  tactile: ['neuroticism', 'openness'],
  vestibular: ['neuroticism', 'openness'],
  oral: ['neuroticism', 'conscientiousness'],
  olfactory: ['neuroticism', 'openness'],

  // Attachment traits
  anxious: ['neuroticism', 'agreeableness'],
  avoidant: ['extraversion', 'agreeableness'],
  secure: ['agreeableness', 'conscientiousness'],

  // Executive function (ADHD-related)
  'executive_function': ['conscientiousness', 'neuroticism'],
  'attention': ['conscientiousness', 'openness'],
  'organization': ['conscientiousness', 'neuroticism'],
  'time_management': ['conscientiousness', 'neuroticism'],

  // Autism-related
  'social_communication': ['extraversion', 'agreeableness'],
  'pattern_recognition': ['openness', 'conscientiousness'],
  'routine_preference': ['conscientiousness', 'neuroticism'],
  'special_interests': ['openness', 'conscientiousness']
};

// Tag rules based on category and instrument
const tagRules = {
  personality: ['baseline', 'personality', 'big_five'],
  neurodiversity: ['neurodiversity', 'adaptive'],
  attachment: ['attachment', 'relationships', 'adaptive'],
  cognitive: ['cognitive', 'processing', 'adaptive'],
  enneagram: ['enneagram', 'personality', 'adaptive'],
  trauma_screening: ['trauma', 'clinical', 'screening']
};

// Sensory trait normalization map
const sensoryTraitNormalization = {
  // Visual variants
  'visual_detail': 'visual',
  'visual_fluorescent': 'visual',
  'visual_preference': 'visual',
  'visual_sensitivity': 'visual',

  // Auditory variants
  'auditory_coping': 'auditory',
  'auditory_startle': 'auditory',
  'auditory_sensitivity': 'auditory',

  // Tactile variants
  'tactile_sensitivity': 'tactile',
  'touch_sensitivity': 'tactile',

  // Oral variants
  'gustatory': 'oral',
  'taste': 'oral',
  'oral_sensitivity': 'oral',

  // Olfactory variants
  'smell': 'olfactory',
  'olfactory_sensitivity': 'olfactory',

  // Vestibular variants
  'movement': 'vestibular',
  'balance': 'vestibular',

  // Proprioceptive (combine with tactile)
  'proprioceptive': 'tactile',
  'body_awareness': 'tactile'
};

async function enhanceAllQuestions() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');
    console.log('='.repeat(80));
    console.log('           COMPREHENSIVE QUESTION DATABASE ENHANCEMENT');
    console.log('='.repeat(80));

    const allQuestions = await QuestionBank.find({ active: true });
    console.log(`\nEnhancing ${allQuestions.length} questions...\n`);

    let stats = {
      correlatedTraitsAdded: 0,
      tagsAdded: 0,
      traitsNormalized: 0,
      subcategoriesAdded: 0,
      errors: []
    };

    // Process each question
    for (const question of allQuestions) {
      try {
        let updated = false;
        const updates = {};

        // 1. NORMALIZE SENSORY TRAITS
        if (question.instrument === 'NEURLYN_SENSORY') {
          const currentTrait = question.trait;
          const normalizedTrait = sensoryTraitNormalization[currentTrait] || currentTrait;

          if (normalizedTrait !== currentTrait) {
            updates.trait = normalizedTrait;
            stats.traitsNormalized++;
            updated = true;
          }

          // Ensure sensory questions have proper subcategory
          if (!question.subcategory || question.subcategory !== 'sensory_processing') {
            updates.subcategory = 'sensory_processing';
            stats.subcategoriesAdded++;
            updated = true;
          }
        }

        // 2. ADD CORRELATED TRAITS
        if (!question.adaptive?.correlatedTraits || question.adaptive.correlatedTraits.length === 0) {
          let correlatedTraits = [];

          // Check if trait has a direct mapping
          if (correlatedTraitsRules[question.trait]) {
            correlatedTraits = correlatedTraitsRules[question.trait];
          }
          // Check instrument-based rules
          else if (question.instrument === 'NEURLYN_SENSORY') {
            // All sensory questions
            correlatedTraits = ['neuroticism', 'openness'];
          }
          else if (question.instrument === 'ASRS-5' || question.instrument === 'NEURLYN_EXECUTIVE') {
            // ADHD/Executive function
            correlatedTraits = ['conscientiousness', 'neuroticism'];
          }
          else if (question.instrument === 'AQ-10') {
            // Autism spectrum
            correlatedTraits = ['openness', 'agreeableness', 'extraversion'];
          }
          else if (question.instrument === 'NEURLYN_MASKING') {
            // Masking behaviors
            correlatedTraits = ['neuroticism', 'conscientiousness'];
          }
          else if (question.instrument === 'NEURLYN_ATTACHMENT') {
            // Attachment
            correlatedTraits = correlatedTraitsRules[question.trait] || ['agreeableness', 'neuroticism'];
          }
          else if (question.instrument === 'NEURLYN_EMOTIONAL') {
            // Emotional regulation
            correlatedTraits = ['neuroticism', 'conscientiousness'];
          }
          else if (question.category === 'personality') {
            // Personality questions - use the trait itself plus a correlated one
            correlatedTraits = correlatedTraitsRules[question.trait] || [question.trait];
          }
          else if (question.category === 'cognitive') {
            // Cognitive questions
            correlatedTraits = ['openness', 'conscientiousness'];
          }
          else if (question.category === 'enneagram') {
            // Enneagram - map to Big Five approximations
            correlatedTraits = ['openness', 'neuroticism', 'extraversion'];
          }
          else {
            // Default fallback
            correlatedTraits = ['openness', 'conscientiousness'];
          }

          if (correlatedTraits.length > 0) {
            updates['adaptive.correlatedTraits'] = correlatedTraits;
            stats.correlatedTraitsAdded++;
            updated = true;
          }
        }

        // 3. ADD TAGS
        if (!question.tags || question.tags.length === 0) {
          let tags = [];

          // Add category-based tags
          if (tagRules[question.category]) {
            tags.push(...tagRules[question.category]);
          }

          // Add instrument-specific tags
          if (question.instrument === 'NEURLYN_SENSORY') {
            tags.push('sensory', 'neurodiversity', 'adaptive');
          }
          else if (question.instrument === 'ASRS-5') {
            tags.push('adhd', 'executive_function', 'neurodiversity', 'adaptive');
          }
          else if (question.instrument === 'AQ-10') {
            tags.push('autism', 'spectrum', 'neurodiversity', 'adaptive');
          }
          else if (question.instrument === 'NEURLYN_EXECUTIVE') {
            tags.push('executive_function', 'adhd', 'neurodiversity', 'adaptive');
          }
          else if (question.instrument === 'NEURLYN_MASKING') {
            tags.push('masking', 'camouflaging', 'neurodiversity', 'adaptive');
          }
          else if (question.instrument && question.instrument.includes('BFI')) {
            tags.push('big_five', 'personality', 'validated');
          }
          else if (question.instrument === 'NEO-PI-R') {
            tags.push('neo', 'facets', 'personality', 'validated');
          }
          else if (question.instrument === 'NEURLYN_ATTACHMENT') {
            tags.push('attachment', 'relationships', 'adaptive');
          }

          // Add trait-based tags
          if (question.trait) {
            tags.push(question.trait);
          }

          // Add tier tag
          if (question.tier) {
            tags.push(question.tier);
          }

          // Add baseline tag if applicable
          if (question.adaptive?.isBaseline) {
            tags.push('baseline');
          }

          // Add gateway tag if applicable
          if (question.instrument && question.instrument.includes('Gateway')) {
            tags.push('gateway', 'screening');
          }

          // Remove duplicates
          tags = [...new Set(tags)];

          if (tags.length > 0) {
            updates.tags = tags;
            stats.tagsAdded++;
            updated = true;
          }
        }

        // 4. APPLY UPDATES
        if (updated) {
          await QuestionBank.updateOne(
            { _id: question._id },
            { $set: updates }
          );
        }

      } catch (error) {
        stats.errors.push({
          questionId: question.questionId,
          error: error.message
        });
      }
    }

    // Display results
    console.log('\n' + '='.repeat(80));
    console.log('                          ENHANCEMENT RESULTS');
    console.log('='.repeat(80) + '\n');

    console.log(`✓ Questions processed: ${allQuestions.length}`);
    console.log(`✓ CorrelatedTraits added: ${stats.correlatedTraitsAdded}`);
    console.log(`✓ Tags added: ${stats.tagsAdded}`);
    console.log(`✓ Sensory traits normalized: ${stats.traitsNormalized}`);
    console.log(`✓ Subcategories added: ${stats.subcategoriesAdded}`);

    if (stats.errors.length > 0) {
      console.log(`\n⚠️  Errors encountered: ${stats.errors.length}`);
      stats.errors.slice(0, 5).forEach(err => {
        console.log(`   ${err.questionId}: ${err.error}`);
      });
    }

    // Verification
    console.log('\n' + '='.repeat(80));
    console.log('                              VERIFICATION');
    console.log('='.repeat(80) + '\n');

    const withCorrelatedTraits = await QuestionBank.countDocuments({
      active: true,
      'adaptive.correlatedTraits': { $exists: true, $ne: [] }
    });

    const withTags = await QuestionBank.countDocuments({
      active: true,
      tags: { $exists: true, $ne: [] }
    });

    const sensoryNormalized = await QuestionBank.countDocuments({
      active: true,
      instrument: 'NEURLYN_SENSORY',
      trait: { $in: ['visual', 'auditory', 'tactile', 'vestibular', 'oral', 'olfactory'] }
    });

    console.log(`Questions with correlatedTraits: ${withCorrelatedTraits}/${allQuestions.length}`);
    console.log(`Questions with tags: ${withTags}/${allQuestions.length}`);
    console.log(`Sensory questions with normalized traits: ${sensoryNormalized}/18`);

    if (withCorrelatedTraits === allQuestions.length && withTags === allQuestions.length) {
      console.log('\n✓✓✓ ALL QUESTIONS SUCCESSFULLY ENHANCED! ✓✓✓');
    } else {
      console.log('\n⚠️  Some questions may need manual review');
    }

    // Show sensory domain distribution after normalization
    console.log('\n' + '='.repeat(80));
    console.log('                    SENSORY DOMAIN DISTRIBUTION');
    console.log('='.repeat(80) + '\n');

    const sensoryByDomain = await QuestionBank.aggregate([
      { $match: { active: true, instrument: 'NEURLYN_SENSORY' } },
      { $group: { _id: '$trait', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    sensoryByDomain.forEach(domain => {
      const status = domain.count >= 3 ? '✓' : '⚠️';
      console.log(`${status} ${domain._id}: ${domain.count} questions`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('                        ENHANCEMENT COMPLETE');
    console.log('='.repeat(80) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

enhanceAllQuestions();
