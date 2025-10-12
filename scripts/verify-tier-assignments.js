#!/usr/bin/env node

/**
 * Verify Tier Assignments
 * Check that critical questions have correct tier tags
 */

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

async function verifyTierAssignments() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('  TIER ASSIGNMENT VERIFICATION');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Check critical questions
    const testQuestions = [
      'SUICIDE_SCREEN_1',       // Should be CLINICAL_ADDON only
      'SUICIDE_SCREEN_7',       // Should be CLINICAL_ADDON only
      'DEPRESSION_PHQ9_1',      // Should be COMPREHENSIVE (PHQ-2)
      'DEPRESSION_PHQ9_9',      // Should be CLINICAL_ADDON (full PHQ-9)
      'ANXIETY_GAD7_1',         // Should be COMPREHENSIVE (GAD-2)
      'ANXIETY_GAD7_7',         // Should be CLINICAL_ADDON (full GAD-7)
      'BASELINE_OPENNESS_1',    // Should be CORE + COMPREHENSIVE
      'HEXACO_H1_1',            // Should be CORE + COMPREHENSIVE
      'MANIA_MDQ_1',            // Should be CLINICAL_ADDON only
      'ANXIETY_PANIC_1',        // Should be CLINICAL_ADDON only
      'NEO_FACET_1001'          // Should be COMPREHENSIVE only
    ];

    console.log('Sample Questions:\n');
    for (const qid of testQuestions) {
      const q = await QuestionBank.findOne({ questionId: qid },
        { questionId: 1, assessmentTiers: 1, instrument: 1, sensitivity: 1 });

      if (q) {
        const tiers = q.assessmentTiers || ['NONE'];
        console.log(`${qid.padEnd(25)} → [${tiers.join(', ')}]`);
      } else {
        console.log(`${qid.padEnd(25)} → NOT FOUND`);
      }
    }

    // Count questions per tier
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  TIER STATISTICS');
    console.log('═══════════════════════════════════════════════════════════\n');

    const allQuestions = await QuestionBank.find({ active: true },
      { questionId: 1, assessmentTiers: 1 });

    const stats = {
      core: 0,
      comprehensive: 0,
      clinicalAddon: 0,
      multiTier: 0,
      untagged: 0
    };

    allQuestions.forEach(q => {
      const tiers = q.assessmentTiers || [];

      if (tiers.length === 0) {
        stats.untagged++;
      } else {
        if (tiers.includes('CORE')) stats.core++;
        if (tiers.includes('COMPREHENSIVE')) stats.comprehensive++;
        if (tiers.includes('CLINICAL_ADDON')) stats.clinicalAddon++;
        if (tiers.length > 1) stats.multiTier++;
      }
    });

    console.log(`CORE tier:              ${stats.core} questions`);
    console.log(`COMPREHENSIVE tier:     ${stats.comprehensive} questions`);
    console.log(`CLINICAL_ADDON tier:    ${stats.clinicalAddon} questions`);
    console.log(`Multi-tier questions:   ${stats.multiTier} questions`);
    console.log(`Untagged questions:     ${stats.untagged} questions`);
    console.log('');

    // Critical checks
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  CRITICAL VALIDATIONS');
    console.log('═══════════════════════════════════════════════════════════\n');

    // 1. All suicide questions must be CLINICAL_ADDON only
    const suicideQuestions = await QuestionBank.find(
      { questionId: /SUICIDE_SCREEN/ },
      { questionId: 1, assessmentTiers: 1 }
    );

    const suicideCheck = suicideQuestions.every(q =>
      q.assessmentTiers?.length === 1 && q.assessmentTiers[0] === 'CLINICAL_ADDON'
    );
    console.log(`✓ All suicide questions in CLINICAL_ADDON only: ${suicideCheck ? 'PASS' : 'FAIL'}`);

    if (!suicideCheck) {
      console.log('  Failed questions:');
      suicideQuestions.forEach(q => {
        if (!(q.assessmentTiers?.length === 1 && q.assessmentTiers[0] === 'CLINICAL_ADDON')) {
          console.log(`    - ${q.questionId}: [${q.assessmentTiers?.join(', ') || 'NONE'}]`);
        }
      });
    }

    // 2. PHQ-2 questions in COMPREHENSIVE
    const phq2 = await QuestionBank.find(
      { questionId: { $in: ['DEPRESSION_PHQ9_1', 'DEPRESSION_PHQ9_2'] } },
      { questionId: 1, assessmentTiers: 1 }
    );

    const phq2Check = phq2.every(q => q.assessmentTiers?.includes('COMPREHENSIVE'));
    console.log(`✓ PHQ-2 questions in COMPREHENSIVE: ${phq2Check ? 'PASS' : 'FAIL'}`);

    // 3. GAD-2 questions in COMPREHENSIVE
    const gad2 = await QuestionBank.find(
      { questionId: { $in: ['ANXIETY_GAD7_1', 'ANXIETY_GAD7_2'] } },
      { questionId: 1, assessmentTiers: 1 }
    );

    const gad2Check = gad2.every(q => q.assessmentTiers?.includes('COMPREHENSIVE'));
    console.log(`✓ GAD-2 questions in COMPREHENSIVE: ${gad2Check ? 'PASS' : 'FAIL'}`);

    // 4. Big Five baseline questions in CORE
    const baseline = await QuestionBank.find(
      { questionId: /BASELINE_(OPENNESS|CONSCIENTIOUSNESS|EXTRAVERSION|AGREEABLENESS|NEUROTICISM)/ },
      { questionId: 1, assessmentTiers: 1 }
    );

    const baselineCheck = baseline.every(q => q.assessmentTiers?.includes('CORE'));
    console.log(`✓ Big Five baseline questions in CORE: ${baselineCheck ? 'PASS' : 'FAIL'}`);

    // 5. No untagged questions
    console.log(`✓ All questions tagged: ${stats.untagged === 0 ? 'PASS' : 'FAIL'}`);

    console.log('\n✅ Tier assignment verification complete!\n');

    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB\n');

  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

verifyTierAssignments();
