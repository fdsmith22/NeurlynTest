#!/usr/bin/env node

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

const MONGODB_URI = 'mongodb://localhost:27017/neurlyn-test';

async function checkAutismQuestions() {
  try {
    await mongoose.connect(MONGODB_URI);

    // Check autism-tagged questions
    const autismQuestions = await QuestionBank.find({
      tags: 'autism',
      'adaptive.isBaseline': { $ne: true }
    });

    console.log(`Total autism-tagged questions: ${autismQuestions.length}`);

    // Group by subcategory
    const bySubcat = {};
    autismQuestions.forEach(q => {
      const subcat = q.subcategory || 'no_subcategory';
      if (!bySubcat[subcat]) bySubcat[subcat] = [];
      bySubcat[subcat].push(q.questionId);
    });

    console.log('\nAutism questions by subcategory:');
    Object.entries(bySubcat).forEach(([subcat, ids]) => {
      console.log(`  ${subcat}: ${ids.length}`);
      ids.slice(0, 3).forEach(id => console.log(`    - ${id}`));
    });

    // Check what makes a question "autism_deep" vs other autism pathways
    console.log('\nSample autism questions:');
    autismQuestions.slice(0, 5).forEach(q => {
      console.log(`\n  ${q.questionId}`);
      console.log(`    Category: ${q.category}`);
      console.log(`    Subcategory: ${q.subcategory}`);
      console.log(`    Tags: ${q.tags.join(', ')}`);
      console.log(`    Instrument: ${q.instrument}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkAutismQuestions();
