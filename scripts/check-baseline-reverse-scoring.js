#!/usr/bin/env node

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

const MONGODB_URI = 'mongodb://localhost:27017/neurlyn-test';

async function checkReverseScoring() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const baselineQuestions = await QuestionBank.find(
      { 'adaptive.isBaseline': true },
      { questionId: 1, text: 1, trait: 1, subcategory: 1, reverseScored: 1 }
    ).sort({ questionId: 1 });

    console.log('='.repeat(80));
    console.log('BASELINE QUESTIONS - REVERSE SCORING CHECK');
    console.log('='.repeat(80));

    baselineQuestions.forEach(q => {
      const rs = q.reverseScored ? '✓ REVERSED' : '  normal';
      console.log(`\n${q.questionId}`);
      console.log(`  ${rs}`);
      console.log(`  ${q.trait || q.subcategory}`);
      console.log(`  "${q.text.substring(0, 70)}..."`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));

    const reversed = baselineQuestions.filter(q => q.reverseScored);
    const normal = baselineQuestions.filter(q => !q.reverseScored);

    console.log(`Total baseline questions: ${baselineQuestions.length}`);
    console.log(`Reverse scored: ${reversed.length}`);
    console.log(`Normal scored: ${normal.length}`);

    console.log('\nReverse scored questions:');
    reversed.forEach(q => {
      console.log(`  - ${q.questionId} (${q.trait || q.subcategory})`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkReverseScoring();
