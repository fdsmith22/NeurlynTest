#!/usr/bin/env node

/**
 * Fix Untagged Questions
 *
 * Tags the 15 remaining untagged questions with appropriate tiers:
 * - ANXIETY_PANIC (5Q): CLINICAL_ADDON (full panic disorder screening)
 * - ANXIETY_SOCIAL (5Q): CLINICAL_ADDON (full social anxiety screening)
 * - ANXIETY_OCD (4Q): CLINICAL_ADDON (full OCD screening)
 * - RELATIONSHIP_QUALITY_1: COMPREHENSIVE (attachment context)
 */

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

const UNTAGGED_ASSIGNMENTS = {
  // Full panic disorder screening → CLINICAL_ADDON
  'ANXIETY_PANIC_1': ['CLINICAL_ADDON'],
  'ANXIETY_PANIC_2': ['CLINICAL_ADDON'],
  'ANXIETY_PANIC_3': ['CLINICAL_ADDON'],
  'ANXIETY_PANIC_4': ['CLINICAL_ADDON'],
  'ANXIETY_PANIC_5': ['CLINICAL_ADDON'],

  // Full social anxiety screening → CLINICAL_ADDON
  'ANXIETY_SOCIAL_1': ['CLINICAL_ADDON'],
  'ANXIETY_SOCIAL_2': ['CLINICAL_ADDON'],
  'ANXIETY_SOCIAL_3': ['CLINICAL_ADDON'],
  'ANXIETY_SOCIAL_4': ['CLINICAL_ADDON'],
  'ANXIETY_SOCIAL_5': ['CLINICAL_ADDON'],

  // Full OCD screening → CLINICAL_ADDON
  'ANXIETY_OCD_1': ['CLINICAL_ADDON'],
  'ANXIETY_OCD_2': ['CLINICAL_ADDON'],
  'ANXIETY_OCD_3': ['CLINICAL_ADDON'],
  'ANXIETY_OCD_4': ['CLINICAL_ADDON'],

  // Relationship quality → COMPREHENSIVE
  'RELATIONSHIP_QUALITY_1': ['COMPREHENSIVE']
};

async function fixUntaggedQuestions() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    console.log('Fixing 15 untagged questions...\n');

    for (const [questionId, tiers] of Object.entries(UNTAGGED_ASSIGNMENTS)) {
      await QuestionBank.updateOne(
        { questionId },
        { $set: { assessmentTiers: tiers } }
      );
      console.log(`✓ ${questionId}: [${tiers.join(', ')}]`);
    }

    console.log('\n✓ Successfully fixed all 15 untagged questions\n');

    // Verify final counts
    const coreCount = await QuestionBank.countDocuments({ assessmentTiers: 'CORE', active: true });
    const compCount = await QuestionBank.countDocuments({ assessmentTiers: 'COMPREHENSIVE', active: true });
    const clinicalCount = await QuestionBank.countDocuments({ assessmentTiers: 'CLINICAL_ADDON', active: true });

    console.log('=== FINAL TIER COUNTS ===');
    console.log(`CORE:              ${coreCount} questions`);
    console.log(`COMPREHENSIVE:     ${compCount} questions`);
    console.log(`CLINICAL_ADDON:    ${clinicalCount} questions`);
    console.log('');

    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB\n');

  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixUntaggedQuestions();
