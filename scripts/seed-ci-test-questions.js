#!/usr/bin/env node

/**
 * Simplified seed script for CI testing
 * Creates personality questions with Big Five traits that the API expects
 */

require('dotenv').config();
const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
const logger = require('../utils/logger');

// Big Five personality questions for CI testing
const personalityQuestions = {
  openness: [
    'I enjoy trying new things',
    'I have a vivid imagination',
    'I like abstract ideas',
    'I enjoy artistic experiences',
    'I am curious about many things'
  ],
  conscientiousness: [
    'I am always prepared',
    'I pay attention to details',
    'I follow a schedule',
    'I complete tasks on time',
    'I am organized'
  ],
  extraversion: [
    'I enjoy social gatherings',
    'I feel energized around others',
    'I like being the center of attention',
    'I start conversations easily',
    'I make friends easily'
  ],
  agreeableness: [
    'I trust others easily',
    'I believe people are basically good',
    'I help others when I can',
    'I cooperate with others',
    'I am considerate of others'
  ],
  neuroticism: [
    'I worry about things',
    'I get stressed easily',
    'My mood changes frequently',
    'I feel anxious often',
    'I get upset easily'
  ]
};

async function seedQuestions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test');
    logger.info('Connected to MongoDB');

    // Clear existing questions for clean CI testing
    await QuestionBank.deleteMany({});
    logger.info('Cleared existing questions');

    const questions = [];
    let questionId = 1;

    // Create questions for each Big Five trait
    for (const [trait, traitQuestions] of Object.entries(personalityQuestions)) {
      traitQuestions.forEach((text, index) => {
        // Create questions for different tiers
        ['free', 'core', 'comprehensive'].forEach(tier => {
          questions.push({
            questionId: `personality_${trait}_${tier}_${questionId++}`,
            text: text,
            category: 'personality', // API expects this
            trait: trait, // API expects Big Five trait
            instrument: 'BIG_FIVE', // Required field
            tier: tier,
            active: true,
            responseType: 'likert',
            options: [
              { value: 1, label: 'Strongly Disagree', score: 1 },
              { value: 2, label: 'Disagree', score: 2 },
              { value: 3, label: 'Neutral', score: 3 },
              { value: 4, label: 'Agree', score: 4 },
              { value: 5, label: 'Strongly Agree', score: 5 }
            ],
            weight: 1.0,
            metadata: {
              addedDate: new Date(),
              version: 'CI_TEST',
              scientificSource: 'BIG_FIVE'
            }
          });
        });
      });
    }

    // Insert all questions
    await QuestionBank.insertMany(questions);
    logger.info(`✅ Successfully added ${questions.length} personality test questions`);

    // Verify
    const count = await QuestionBank.countDocuments();
    const byTrait = await QuestionBank.aggregate([
      { $group: { _id: '$trait', count: { $sum: 1 } } }
    ]);

    logger.info(`Total questions: ${count}`);
    byTrait.forEach(t => {
      logger.info(`  ${t._id}: ${t.count} questions`);
    });

    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedQuestions();
