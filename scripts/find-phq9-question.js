#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

async function findQuestion() {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected\n');

    const QuestionBank = mongoose.model(
      'QuestionBank',
      new mongoose.Schema({}, { strict: false }),
      'questionbank'
    );

    // Count all questions
    const total = await QuestionBank.countDocuments();
    console.log(`Total questions in DB: ${total}\n`);

    // Get a sample
    const sample = await QuestionBank.find().limit(5);
    console.log('Sample questions:');
    sample.forEach(q => {
      console.log(`  - ${q.questionId} (${q.instrument})`);
    });

    // Search for all questions with PHQ or depression in questionId
    const questions = await QuestionBank.find({
      $or: [
        { instrument: 'PHQ-9' },
        { questionId: /PHQ/i },
        { questionId: /DEPRESSION/i }
      ]
    }).sort({ questionId: 1 });

    console.log(`Found ${questions.length} questions:`);
    questions.forEach(q => {
      console.log(`\nID: ${q.questionId}`);
      console.log(`Text: ${q.text}`);
      console.log(`Instrument: ${q.instrument}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

findQuestion();
