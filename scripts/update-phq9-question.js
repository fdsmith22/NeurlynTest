#!/usr/bin/env node
/**
 * Update PHQ-9 Question 9 wording to be less clinical
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Database configuration
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

async function updatePHQ9Question() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(DB_URI);
    console.log('Connected successfully\n');

    const QuestionBank = mongoose.model(
      'QuestionBank',
      new mongoose.Schema({}, { strict: false }),
      'questionbank'
    );

    // Find the question
    const question = await QuestionBank.findOne({ questionId: 'DEPRESSION_PHQ9_9' });

    if (!question) {
      console.log('Question DEPRESSION_PHQ9_9 not found');
      return;
    }

    console.log('Current text:', question.text);

    // Update with more accessible wording
    question.text = 'Over the past two weeks, how often have you had thoughts of harming yourself or felt that life wasn\'t worth living?';

    await question.save();

    console.log('\nUpdated text:', question.text);
    console.log('\n✅ Question updated successfully');

  } catch (error) {
    console.error('Error updating question:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDatabase disconnected');
  }
}

updatePHQ9Question();
