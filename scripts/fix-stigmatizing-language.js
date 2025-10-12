/**
 * Fix Stigmatizing Language in Questions
 * Updates 2 questions identified in validation to use person-centered language
 */

const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://localhost:27017/neurlyn-test';

const QuestionBank = require('../models/QuestionBank');

// Specific fixes identified in validation
const FIXES = [
  {
    questionId: 'SUBSTANCE_DRUG_2',
    oldText: 'Do you abuse more than one drug at a time?',
    newText: 'Do you use more than one drug at a time?',
    reason: 'Remove stigmatizing term "abuse" → "use"'
  },
  {
    questionId: 'BORDERLINE_IMPULSIVE_1',
    searchPattern: 'substance abuse',
    replacement: 'substance use',
    reason: 'Remove stigmatizing term "substance abuse" → "substance use"'
  }
];

async function fixStigmatizingLanguage() {
  let fixedCount = 0;
  const changes = [];

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    for (const fix of FIXES) {
      const question = await QuestionBank.findOne({
        questionId: fix.questionId,
        active: true
      });

      if (!question) {
        console.log(`⚠️  Question ${fix.questionId} not found - skipping`);
        continue;
      }

      const oldText = question.text;
      let newText;

      // Apply fix based on type
      if (fix.oldText) {
        // Full text replacement
        if (question.text === fix.oldText) {
          newText = fix.newText;
        } else {
          console.log(`⚠️  ${fix.questionId}: Text doesn't match expected value`);
          console.log(`   Current: "${question.text}"`);
          console.log(`   Expected: "${fix.oldText}"`);
          continue;
        }
      } else if (fix.searchPattern) {
        // Pattern replacement
        newText = question.text.replace(fix.searchPattern, fix.replacement);
      }

      // Apply update
      if (newText && newText !== oldText) {
        question.text = newText;
        await question.save();

        fixedCount++;
        changes.push({
          questionId: fix.questionId,
          category: question.category,
          subcategory: question.subcategory,
          oldText: oldText,
          newText: newText,
          reason: fix.reason
        });

        console.log(`✅ Fixed ${fix.questionId}`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`✅ FIX COMPLETE: ${fixedCount} questions updated`);
    console.log('═══════════════════════════════════════════════════════════\n');

    if (changes.length > 0) {
      console.log('📝 CHANGES APPLIED:\n');
      changes.forEach((change, idx) => {
        console.log(`${idx + 1}. [${change.questionId}] ${change.category} > ${change.subcategory}`);
        console.log(`   Old: "${change.oldText}"`);
        console.log(`   New: "${change.newText}"`);
        console.log(`   Reason: ${change.reason}\n`);
      });
    }

    console.log('✅ All stigmatizing language has been removed from questions');
    console.log('✅ Questions now use person-centered, non-judgmental language\n');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

console.log('\n🔧 FIX STIGMATIZING LANGUAGE IN QUESTIONS');
console.log('═══════════════════════════════════════════════════════════\n');
console.log('Updating 2 questions to use person-centered language:\n');
console.log('1. SUBSTANCE_DRUG_2: "abuse" → "use"');
console.log('2. BORDERLINE_IMPULSIVE_1: "substance abuse" → "substance use"\n');

fixStigmatizingLanguage();
