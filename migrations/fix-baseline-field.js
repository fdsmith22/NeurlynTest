/**
 * Migration: Fix baseline field
 * Sets adaptive.isBaseline = true for questions with 'baseline' tag
 */

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

async function fixBaselineField() {
  try {
    await mongoose.connect('mongodb://localhost:27017/neurlyn-test');
    console.log('Connected to neurlyn-test database\n');

    // Find questions with 'baseline' tag
    const baselineTagged = await QuestionBank.find({ tags: 'baseline' });
    console.log(`Found ${baselineTagged.length} questions with 'baseline' tag\n`);

    // Update adaptive.isBaseline = true for these questions
    const result = await QuestionBank.updateMany(
      { tags: 'baseline' },
      { $set: { 'adaptive.isBaseline': true } }
    );

    console.log(`✓ Updated ${result.modifiedCount} questions to set adaptive.isBaseline = true\n`);

    // Verification
    const verifyCount = await QuestionBank.countDocuments({ 'adaptive.isBaseline': true });
    console.log(`=== VERIFICATION ===`);
    console.log(`Questions with adaptive.isBaseline=true: ${verifyCount}`);

    // Show sample baseline questions
    const samples = await QuestionBank.find({ 'adaptive.isBaseline': true }).limit(10);
    console.log(`\nSample baseline questions:`);
    samples.forEach(q => {
      console.log(`  - ${q.questionId} (${q.category}, ${q.trait || q.subcategory || 'N/A'})`);
    });

    console.log(`\n✅ MIGRATION COMPLETE`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixBaselineField();
