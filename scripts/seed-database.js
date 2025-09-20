#!/usr/bin/env node

/**
 * Database Seeder - Populates MongoDB with questions and report templates
 * Run: node scripts/seed-database.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
const ReportTemplate = require('../models/ReportTemplate');
const logger = require('../utils/logger');

// Sample Big Five questions
const bigFiveQuestions = [
  // Openness
  { trait: 'openness', text: 'I have a rich vocabulary', reverseScored: false },
  {
    trait: 'openness',
    text: 'I have difficulty understanding abstract ideas',
    reverseScored: true
  },
  { trait: 'openness', text: 'I enjoy thinking about complex problems', reverseScored: false },
  { trait: 'openness', text: 'I prefer routine over variety', reverseScored: true },

  // Conscientiousness
  { trait: 'conscientiousness', text: 'I am always prepared', reverseScored: false },
  {
    trait: 'conscientiousness',
    text: 'I often forget to put things back in their place',
    reverseScored: true
  },
  { trait: 'conscientiousness', text: 'I pay attention to details', reverseScored: false },
  { trait: 'conscientiousness', text: 'I make a mess of things', reverseScored: true },

  // Extraversion
  { trait: 'extraversion', text: 'I am the life of the party', reverseScored: false },
  { trait: 'extraversion', text: "I don't talk a lot", reverseScored: true },
  { trait: 'extraversion', text: 'I feel comfortable around people', reverseScored: false },
  { trait: 'extraversion', text: 'I keep in the background', reverseScored: true },

  // Agreeableness
  { trait: 'agreeableness', text: "I sympathize with others' feelings", reverseScored: false },
  {
    trait: 'agreeableness',
    text: "I am not interested in other people's problems",
    reverseScored: true
  },
  { trait: 'agreeableness', text: 'I have a soft heart', reverseScored: false },
  { trait: 'agreeableness', text: 'I am not really interested in others', reverseScored: true },

  // Neuroticism
  { trait: 'neuroticism', text: 'I get stressed out easily', reverseScored: false },
  { trait: 'neuroticism', text: 'I am relaxed most of the time', reverseScored: true },
  { trait: 'neuroticism', text: 'I worry about things', reverseScored: false },
  { trait: 'neuroticism', text: 'I seldom feel blue', reverseScored: true }
];

// ADHD screening questions (ASRS-5)
const adhdQuestions = [
  { text: 'How often do you have difficulty concentrating on what people say to you?' },
  {
    text: 'How often do you leave your seat in meetings or situations where remaining seated is expected?'
  },
  {
    text: 'How often do you have difficulty unwinding and relaxing when you have time to yourself?'
  },
  { text: 'How often do you find yourself talking too much in social situations?' },
  { text: 'How often do you find yourself finishing sentences of people you are talking to?' }
];

// Autism screening questions (AQ-10)
const autismQuestions = [
  { text: 'I often notice small sounds when others do not' },
  {
    text: 'I usually concentrate more on the whole picture, rather than the small details',
    reverseScored: true
  },
  { text: 'I find it easy to do more than one thing at once', reverseScored: true },
  {
    text: 'If there is an interruption, I can switch back to what I was doing very quickly',
    reverseScored: true
  },
  {
    text: 'I find it easy to "read between the lines" when someone is talking to me',
    reverseScored: true
  },
  { text: 'I know how to tell if someone listening to me is getting bored', reverseScored: true }
];

async function seedQuestions() {
  try {
    // Clear existing questions
    await QuestionBank.deleteMany({});
    logger.info('Cleared existing questions');

    const questions = [];

    // Add Big Five questions
    bigFiveQuestions.forEach((q, index) => {
      questions.push({
        questionId: `BFI2_${q.trait}_${index}`,
        text: q.text,
        category: 'personality',
        instrument: 'BFI-2',
        trait: q.trait,
        responseType: 'likert',
        options: [
          { value: 1, label: 'Strongly Disagree', score: q.reverseScored ? 5 : 1 },
          { value: 2, label: 'Disagree', score: q.reverseScored ? 4 : 2 },
          { value: 3, label: 'Neutral', score: 3 },
          { value: 4, label: 'Agree', score: q.reverseScored ? 2 : 4 },
          { value: 5, label: 'Strongly Agree', score: q.reverseScored ? 1 : 5 }
        ],
        reverseScored: q.reverseScored,
        tier: 'free',
        active: true
      });
    });

    // Add ADHD questions
    adhdQuestions.forEach((q, index) => {
      questions.push({
        questionId: `ASRS5_${index}`,
        text: q.text,
        category: 'neurodiversity',
        instrument: 'ASRS-5',
        trait: 'adhd',
        responseType: 'likert',
        options: [
          { value: 0, label: 'Never', score: 0 },
          { value: 1, label: 'Rarely', score: 1 },
          { value: 2, label: 'Sometimes', score: 2 },
          { value: 3, label: 'Often', score: 3 },
          { value: 4, label: 'Very Often', score: 4 }
        ],
        tier: 'core',
        active: true
      });
    });

    // Add Autism questions
    autismQuestions.forEach((q, index) => {
      questions.push({
        questionId: `AQ10_${index}`,
        text: q.text,
        category: 'neurodiversity',
        instrument: 'AQ-10',
        trait: 'autism',
        responseType: 'likert',
        options: [
          { value: 1, label: 'Definitely Disagree', score: q.reverseScored ? 1 : 0 },
          { value: 2, label: 'Slightly Disagree', score: q.reverseScored ? 1 : 0 },
          { value: 3, label: 'Slightly Agree', score: q.reverseScored ? 0 : 1 },
          { value: 4, label: 'Definitely Agree', score: q.reverseScored ? 0 : 1 }
        ],
        reverseScored: q.reverseScored || false,
        tier: 'core',
        active: true
      });
    });

    // Add some interactive/gamified questions
    questions.push(
      {
        questionId: 'LATERAL_1',
        text: 'Which pattern comes next in the sequence?',
        category: 'cognitive',
        instrument: 'LATERAL',
        responseType: 'multiple-choice',
        options: [
          { value: 'A', label: 'Pattern A', score: 0 },
          { value: 'B', label: 'Pattern B', score: 1 },
          { value: 'C', label: 'Pattern C', score: 0 },
          { value: 'D', label: 'Pattern D', score: 0 }
        ],
        interactiveElements: {
          hasVisual: true,
          visualType: 'image',
          hasTimer: true,
          timeLimit: 30,
          gamificationPoints: 10
        },
        tier: 'comprehensive',
        active: true
      },
      {
        questionId: 'WORD_ASSOC_1',
        text: 'What word comes to mind when you see: OCEAN',
        category: 'cognitive',
        instrument: 'WORD_ASSOCIATION',
        responseType: 'word-association',
        tier: 'comprehensive',
        interactiveElements: {
          hasTimer: true,
          timeLimit: 5,
          gamificationPoints: 5
        },
        active: true
      }
    );

    await QuestionBank.insertMany(questions);
    logger.info(`Seeded ${questions.length} questions`);

    return questions.length;
  } catch (error) {
    logger.error('Error seeding questions:', error);
    throw error;
  }
}

async function seedReportTemplates() {
  try {
    // Clear existing templates
    await ReportTemplate.deleteMany({});
    logger.info('Cleared existing report templates');

    const templates = [
      {
        templateId: 'PERSONALITY_BASIC',
        name: 'Basic Personality Report',
        category: 'personality',
        tier: 'free',
        sections: [
          {
            title: 'Your Personality Profile',
            order: 1,
            content: {
              introduction:
                'Based on the Big Five personality model, your assessment reveals the following traits:',
              methodology: 'This assessment uses the scientifically validated BFI-2 instrument.'
            }
          }
        ],
        interpretations: {
          ranges: [
            {
              trait: 'openness',
              low: {
                min: 0,
                max: 2.5,
                text: 'You prefer familiar routines and practical approaches.'
              },
              medium: { min: 2.5, max: 3.5, text: 'You balance creativity with practicality.' },
              high: {
                min: 3.5,
                max: 5,
                text: 'You are creative, curious, and open to new experiences.'
              }
            }
          ]
        },
        disclaimers: [
          'This assessment is for self-discovery purposes only.',
          'Not a substitute for professional psychological evaluation.'
        ],
        active: true
      },
      {
        templateId: 'NEURODIVERSITY_SCREEN',
        name: 'Neurodiversity Screening Report',
        category: 'neurodiversity',
        tier: 'premium',
        sections: [
          {
            title: 'Screening Results',
            order: 1,
            content: {
              introduction:
                'This screening assesses traits associated with neurodivergent conditions.',
              methodology: 'Uses validated screening instruments including ASRS-5 and AQ-10.'
            }
          }
        ],
        disclaimers: [
          'This is a screening tool, not a diagnostic assessment.',
          'Please consult a qualified healthcare professional for diagnosis.'
        ],
        active: true
      }
    ];

    await ReportTemplate.insertMany(templates);
    logger.info(`Seeded ${templates.length} report templates`);

    return templates.length;
  } catch (error) {
    logger.error('Error seeding report templates:', error);
    throw error;
  }
}

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn');
    logger.info('Connected to MongoDB for seeding');

    // Seed data
    const questionCount = await seedQuestions();
    const templateCount = await seedReportTemplates();

    logger.info(`✅ Database seeding completed!`);
    logger.info(`   - ${questionCount} questions added`);
    logger.info(`   - ${templateCount} report templates added`);

    // Disconnect
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { seedQuestions, seedReportTemplates };
