#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

async function directDbCheck() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test');
    console.log('Connected to MongoDB');

    // Get a single openness question and dump its complete adaptive structure
    const opennessQuestion = await QuestionBank.findOne({
      trait: 'openness',
      'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
    }).lean();

    console.log('Complete adaptive structure for openness question:');
    console.log(JSON.stringify(opennessQuestion.adaptive, null, 2));

    // Check the actual threshold values in the database
    const questionsWithThresholds = await QuestionBank.find({
      'adaptive.adaptiveCriteria.triggerTraits.threshold': { $exists: true, $ne: null }
    }).countDocuments();

    console.log(`\nQuestions with non-null threshold values: ${questionsWithThresholds}`);

    // Check for undefined thresholds specifically
    const questionsWithUndefinedThresholds = await QuestionBank.find({
      'adaptive.adaptiveCriteria.triggerTraits.threshold': { $exists: false }
    }).countDocuments();

    console.log(`Questions with undefined threshold values: ${questionsWithUndefinedThresholds}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  directDbCheck();
}
