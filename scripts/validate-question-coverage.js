#!/usr/bin/env node

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

// Expected coverage based on report requirements
const EXPECTED_COVERAGE = {
  // Big Five Personality Traits
  personality: {
    traits: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'],
    requiredCount: 50
  },

  // NEO-PI-R Facets (6 per trait = 30 total)
  facets: {
    openness: ['fantasy', 'aesthetics', 'feelings', 'actions', 'ideas', 'values'],
    conscientiousness: ['competence', 'order', 'dutifulness', 'achievement_striving', 'self_discipline', 'deliberation'],
    extraversion: ['warmth', 'gregariousness', 'assertiveness', 'activity', 'excitement_seeking', 'positive_emotions'],
    agreeableness: ['trust', 'straightforwardness', 'altruism', 'compliance', 'modesty', 'tender_mindedness'],
    neuroticism: ['anxiety', 'angry_hostility', 'depression', 'self_consciousness', 'impulsiveness', 'vulnerability'],
    requiredPerFacet: 3
  },

  // Neurodiversity Screening
  neurodiversity: {
    subcategories: ['executive_function', 'sensory_processing', 'social_interaction', 'masking', 'emotional_regulation'],
    instruments: ['ASRS-5', 'AQ-10', 'NEURLYN_EXECUTIVE', 'NEURLYN_SENSORY', 'NEURLYN_MASKING'],
    requiredCount: 30
  },

  // Communication Styles
  communication: {
    subcategories: ['directness', 'formality', 'expressiveness', 'detail_orientation', 'listening', 'conflict', 'medium_preference'],
    requiredCount: 15
  },

  // Processing/Cognitive Styles
  cognitive: {
    subcategories: ['sequential_processing', 'concrete_thinking', 'visual_processing', 'analytical_thinking', 'processing_speed', 'global_processing'],
    requiredCount: 15
  },

  // Decision-Making
  decision_making: {
    subcategories: ['decision_speed', 'decision_confidence', 'decision_consideration', 'decision_independence', 'decision_basis'],
    requiredCount: 5
  },

  // Stress Management
  stress_management: {
    subcategories: ['stress_coping', 'stress_response', 'stress_awareness', 'stress_support', 'stress_resilience'],
    requiredCount: 5
  },

  // Attachment Styles
  attachment: {
    subcategories: ['secure_attachment', 'anxious_attachment', 'avoidant_attachment'],
    requiredCount: 5
  }
};

async function validateQuestionCoverage() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    console.log('=' . repeat(80));
    console.log('QUESTION COVERAGE VALIDATION REPORT');
    console.log('=' . repeat(80));

    let totalIssues = 0;
    const results = {};

    // 1. Check Big Five Personality Coverage
    console.log('\n1. BIG FIVE PERSONALITY TRAITS');
    console.log('-' . repeat(40));

    for (const trait of EXPECTED_COVERAGE.personality.traits) {
      const count = await QuestionBank.countDocuments({
        category: 'personality',
        trait: trait,
        facet: { $exists: false } // Exclude facet questions
      });

      const status = count >= 10 ? '✅' : '⚠️';
      console.log(`  ${status} ${trait.padEnd(20)} ${count} questions`);

      if (count < 10) {
        totalIssues++;
      }
    }

    // 2. Check NEO-PI-R Facet Coverage
    console.log('\n2. NEO-PI-R FACETS (30 facets)');
    console.log('-' . repeat(40));

    let totalFacets = 0;
    let coveredFacets = 0;

    for (const [trait, facets] of Object.entries(EXPECTED_COVERAGE.facets)) {
      if (trait === 'requiredPerFacet') continue;

      console.log(`\n  ${trait.toUpperCase()}:`);

      for (const facet of facets) {
        totalFacets++;
        const count = await QuestionBank.countDocuments({
          trait: trait,
          facet: facet
        });

        const status = count >= EXPECTED_COVERAGE.facets.requiredPerFacet ? '✅' : '❌';
        if (count > 0) coveredFacets++;

        console.log(`    ${status} ${facet.padEnd(25)} ${count} questions`);

        if (count < EXPECTED_COVERAGE.facets.requiredPerFacet) {
          totalIssues++;
        }
      }
    }

    console.log(`\n  Summary: ${coveredFacets}/${totalFacets} facets have questions`);

    // 3. Check Neurodiversity Coverage
    console.log('\n3. NEURODIVERSITY SCREENING');
    console.log('-' . repeat(40));

    const neuroCount = await QuestionBank.countDocuments({
      category: 'neurodiversity'
    });
    console.log(`  Total neurodiversity questions: ${neuroCount}`);

    console.log('\n  By subcategory:');
    for (const subcategory of EXPECTED_COVERAGE.neurodiversity.subcategories) {
      const count = await QuestionBank.countDocuments({
        category: 'neurodiversity',
        subcategory: subcategory
      });
      const status = count > 0 ? '✅' : '❌';
      console.log(`    ${status} ${subcategory.padEnd(25)} ${count} questions`);
    }

    // 4. Check Communication Styles
    console.log('\n4. COMMUNICATION STYLES');
    console.log('-' . repeat(40));

    const commCount = await QuestionBank.countDocuments({
      instrument: 'NEURLYN_COMMUNICATION'
    });
    console.log(`  Total communication questions: ${commCount}`);

    const commStatus = commCount >= EXPECTED_COVERAGE.communication.requiredCount ? '✅' : '⚠️';
    console.log(`  ${commStatus} Target: ${EXPECTED_COVERAGE.communication.requiredCount}, Actual: ${commCount}`);

    // 5. Check Processing/Cognitive Styles
    console.log('\n5. PROCESSING/COGNITIVE STYLES');
    console.log('-' . repeat(40));

    const cogCount = await QuestionBank.countDocuments({
      instrument: 'NEURLYN_PROCESSING'
    });
    console.log(`  Total processing questions: ${cogCount}`);

    const cogStatus = cogCount >= EXPECTED_COVERAGE.cognitive.requiredCount ? '✅' : '⚠️';
    console.log(`  ${cogStatus} Target: ${EXPECTED_COVERAGE.cognitive.requiredCount}, Actual: ${cogCount}`);

    // 6. Check Decision-Making
    console.log('\n6. DECISION-MAKING');
    console.log('-' . repeat(40));

    const decCount = await QuestionBank.countDocuments({
      instrument: 'NEURLYN_DECISION'
    });
    console.log(`  Total decision-making questions: ${decCount}`);

    const decStatus = decCount >= EXPECTED_COVERAGE.decision_making.requiredCount ? '✅' : '⚠️';
    console.log(`  ${decStatus} Target: ${EXPECTED_COVERAGE.decision_making.requiredCount}, Actual: ${decCount}`);

    // 7. Check Stress Management
    console.log('\n7. STRESS MANAGEMENT');
    console.log('-' . repeat(40));

    const stressCount = await QuestionBank.countDocuments({
      instrument: 'NEURLYN_STRESS'
    });
    console.log(`  Total stress management questions: ${stressCount}`);

    const stressStatus = stressCount >= EXPECTED_COVERAGE.stress_management.requiredCount ? '✅' : '⚠️';
    console.log(`  ${stressStatus} Target: ${EXPECTED_COVERAGE.stress_management.requiredCount}, Actual: ${stressCount}`);

    // 8. Check Attachment Styles
    console.log('\n8. ATTACHMENT STYLES');
    console.log('-' . repeat(40));

    const attachCount = await QuestionBank.countDocuments({
      category: 'attachment'
    });
    console.log(`  Total attachment questions: ${attachCount}`);

    const attachStatus = attachCount >= EXPECTED_COVERAGE.attachment.requiredCount ? '✅' : '⚠️';
    console.log(`  ${attachStatus} Target: ${EXPECTED_COVERAGE.attachment.requiredCount}, Actual: ${attachCount}`);

    // Overall Statistics
    console.log('\n' + '=' . repeat(80));
    console.log('OVERALL STATISTICS');
    console.log('=' . repeat(80));

    const totalQuestions = await QuestionBank.countDocuments();
    const activeQuestions = await QuestionBank.countDocuments({ active: true });
    const baselineQuestions = await QuestionBank.countDocuments({ 'adaptive.isBaseline': true });

    console.log(`  Total questions in database: ${totalQuestions}`);
    console.log(`  Active questions: ${activeQuestions}`);
    console.log(`  Baseline questions: ${baselineQuestions}`);

    // By tier
    console.log('\n  Questions by tier:');
    for (const tier of ['free', 'core', 'comprehensive', 'specialized']) {
      const count = await QuestionBank.countDocuments({ tier: tier });
      console.log(`    ${tier.padEnd(15)} ${count} questions`);
    }

    // By category
    console.log('\n  Questions by category:');
    const categories = await QuestionBank.distinct('category');
    for (const category of categories.sort()) {
      const count = await QuestionBank.countDocuments({ category: category });
      console.log(`    ${category.padEnd(15)} ${count} questions`);
    }

    // Summary
    console.log('\n' + '=' . repeat(80));
    if (totalIssues === 0) {
      console.log('✅ ALL COVERAGE REQUIREMENTS MET!');
    } else {
      console.log(`⚠️  ${totalIssues} coverage issues found`);
      console.log('   Run the seed scripts to add missing questions:');
      console.log('   - node scripts/seed-neo-facet-questions.js');
      console.log('   - node scripts/seed-communication-processing-questions.js');
    }
    console.log('=' . repeat(80));

  } catch (error) {
    console.error('Error validating question coverage:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the validation
if (require.main === module) {
  validateQuestionCoverage();
}

module.exports = validateQuestionCoverage;
