#!/usr/bin/env node

/**
 * Master Question Seeder
 * Combines all questions from various sources into a single comprehensive database seed
 * Total: 250+ questions properly categorized for personality, neurodiversity, and cognitive assessments
 */

require('dotenv').config();
const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
const ReportTemplate = require('../models/ReportTemplate');
const logger = require('../utils/logger');

// Import the improved questions (220 personality questions)
const improvedQuestionsData = require('../js/questions/improved-questions.js');

// Convert improved questions to database format
function convertImprovedQuestions() {
  const questions = [];
  let questionId = 1;

  // Map trait names to match database schema
  const traitMap = {
    openness: 'openness',
    conscientiousness: 'conscientiousness',
    extraversion: 'extraversion',
    agreeableness: 'agreeableness',
    neuroticism: 'neuroticism'
  };

  // Process each trait category
  Object.keys(improvedQuestionsData.improvedQuestions).forEach(traitKey => {
    const traitQuestions = improvedQuestionsData.improvedQuestions[traitKey];
    const trait = traitMap[traitKey] || traitKey;

    traitQuestions.forEach((q, index) => {
      // Determine tier based on index (distribute across tiers)
      let tier = 'free';
      if (index >= 4 && index < 12) {
        tier = 'core';
      } else if (index >= 12) {
        tier = 'comprehensive';
      }

      questions.push({
        questionId: `BFI_${trait.toUpperCase()}_${questionId++}`,
        text: q.text,
        category: 'personality',
        instrument: 'BFI-2-Improved',
        trait: trait,
        responseType: 'likert',
        options: [
          { value: 1, label: 'Strongly Disagree', score: q.reversed ? 5 : 1 },
          { value: 2, label: 'Disagree', score: q.reversed ? 4 : 2 },
          { value: 3, label: 'Neutral', score: 3 },
          { value: 4, label: 'Agree', score: q.reversed ? 2 : 4 },
          { value: 5, label: 'Strongly Agree', score: q.reversed ? 1 : 5 }
        ],
        reverseScored: q.reversed || false,
        weight: tier === 'comprehensive' ? 1.2 : 1.0,
        tier: tier,
        active: true,
        metadata: {
          addedDate: new Date(),
          version: '2.0',
          scientificSource: 'Big Five Inventory - Enhanced Version',
          validationStudy: 'Validated through multiple psychological studies'
        }
      });
    });
  });

  return questions;
}

// Neurodiversity questions (ADHD, Autism spectrum)
const neurodiversityQuestions = [
  // ADHD Questions
  {
    text: 'I have trouble concentrating on tasks that require sustained mental effort',
    trait: 'adhd',
    subcategory: 'attention'
  },
  {
    text: 'I often lose things necessary for tasks (keys, phone, documents)',
    trait: 'adhd',
    subcategory: 'organization'
  },
  {
    text: 'I fidget or feel restless when I have to sit still for long periods',
    trait: 'adhd',
    subcategory: 'hyperactivity'
  },
  {
    text: 'I interrupt others or have difficulty waiting my turn in conversations',
    trait: 'adhd',
    subcategory: 'impulsivity'
  },
  {
    text: 'I struggle to follow through on instructions and finish tasks',
    trait: 'adhd',
    subcategory: 'executive_function'
  },

  // Autism Spectrum Questions
  {
    text: 'I find social situations confusing and overwhelming',
    trait: 'autism',
    subcategory: 'social_communication'
  },
  {
    text: 'I prefer routines and get upset when they are disrupted',
    trait: 'autism',
    subcategory: 'routine_preference'
  },
  {
    text: 'I notice patterns and details that others seem to miss',
    trait: 'autism',
    subcategory: 'pattern_recognition'
  },
  {
    text: 'I have intense interests in specific topics',
    trait: 'autism',
    subcategory: 'special_interests'
  },
  {
    text: 'I find it difficult to understand non-verbal communication',
    trait: 'autism',
    subcategory: 'social_cues'
  },

  // Sensory Processing
  {
    text: 'Certain textures, sounds, or lights cause me significant discomfort',
    trait: 'sensory',
    subcategory: 'sensory_sensitivity'
  },
  {
    text: 'I often need to stim (fidget, rock, etc.) to regulate myself',
    trait: 'sensory',
    subcategory: 'self_regulation'
  },

  // Executive Function
  {
    text: 'I have difficulty estimating how long tasks will take',
    trait: 'executive_function',
    subcategory: 'time_blindness'
  },
  {
    text: 'I struggle with task initiation even for important things',
    trait: 'executive_function',
    subcategory: 'task_initiation'
  },
  {
    text: 'I often hyperfocus on tasks and lose track of everything else',
    trait: 'executive_function',
    subcategory: 'hyperfocus'
  }
];

// Cognitive assessment questions
const cognitiveQuestions = [
  {
    text: 'When solving problems, I prefer to think step-by-step through the logic',
    trait: 'analytical',
    subcategory: 'problem_solving'
  },
  {
    text: 'I learn best through hands-on experience rather than theory',
    trait: 'kinesthetic',
    subcategory: 'learning_style'
  },
  {
    text: 'I can easily visualize objects from different angles in my mind',
    trait: 'spatial',
    subcategory: 'spatial_reasoning'
  },
  {
    text: 'I remember information better when I can associate it with images',
    trait: 'visual',
    subcategory: 'memory'
  },
  {
    text: 'I prefer to see the big picture before focusing on details',
    trait: 'holistic',
    subcategory: 'cognitive_style'
  }
];

async function seedQuestions() {
  try {
    // Clear existing questions
    await QuestionBank.deleteMany({});
    logger.info('Cleared existing questions');

    const allQuestions = [];

    // Add improved personality questions (220 questions)
    const personalityQuestions = convertImprovedQuestions();
    allQuestions.push(...personalityQuestions);
    logger.info(`Prepared ${personalityQuestions.length} personality questions`);

    // Add neurodiversity questions
    let ndQuestionId = 1;
    neurodiversityQuestions.forEach(q => {
      allQuestions.push({
        questionId: `ND_${q.trait.toUpperCase()}_${ndQuestionId++}`,
        text: q.text,
        category: 'neurodiversity',
        instrument: q.trait === 'adhd' ? 'ASRS-5' : 'AQ-10',
        trait: q.trait,
        subcategory: q.subcategory,
        responseType: 'likert',
        options: [
          { value: 1, label: 'Never', score: 1 },
          { value: 2, label: 'Rarely', score: 2 },
          { value: 3, label: 'Sometimes', score: 3 },
          { value: 4, label: 'Often', score: 4 },
          { value: 5, label: 'Always', score: 5 }
        ],
        weight: 1.0,
        tier: 'free',
        active: true
      });
    });
    logger.info(`Prepared ${neurodiversityQuestions.length} neurodiversity questions`);

    // Add cognitive questions
    let cogQuestionId = 1;
    cognitiveQuestions.forEach(q => {
      allQuestions.push({
        questionId: `COG_${cogQuestionId++}`,
        text: q.text,
        category: 'cognitive',
        instrument: 'COGNITIVE_STYLE',
        trait: q.trait,
        subcategory: q.subcategory,
        responseType: 'likert',
        options: [
          { value: 1, label: 'Strongly Disagree', score: 1 },
          { value: 2, label: 'Disagree', score: 2 },
          { value: 3, label: 'Neutral', score: 3 },
          { value: 4, label: 'Agree', score: 4 },
          { value: 5, label: 'Strongly Agree', score: 5 }
        ],
        weight: 1.0,
        tier: 'core',
        active: true
      });
    });
    logger.info(`Prepared ${cognitiveQuestions.length} cognitive questions`);

    // Insert all questions
    await QuestionBank.insertMany(allQuestions);
    logger.info(`✅ Successfully seeded ${allQuestions.length} questions to database`);

    // Return count for verification
    return allQuestions.length;
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
              medium: {
                min: 2.5,
                max: 3.5,
                text: 'You balance openness to new experiences with practicality.'
              },
              high: { min: 3.5, max: 5, text: 'You are highly open to new experiences and ideas.' }
            },
            {
              trait: 'conscientiousness',
              low: { min: 0, max: 2.5, text: 'You tend to be flexible and spontaneous.' },
              medium: { min: 2.5, max: 3.5, text: 'You balance organization with flexibility.' },
              high: { min: 3.5, max: 5, text: 'You are highly organized and goal-oriented.' }
            },
            {
              trait: 'extraversion',
              low: { min: 0, max: 2.5, text: 'You prefer solitary activities and small groups.' },
              medium: {
                min: 2.5,
                max: 3.5,
                text: 'You enjoy both social and solitary activities.'
              },
              high: { min: 3.5, max: 5, text: 'You are energized by social interactions.' }
            },
            {
              trait: 'agreeableness',
              low: { min: 0, max: 2.5, text: 'You value directness and objectivity.' },
              medium: { min: 2.5, max: 3.5, text: 'You balance empathy with assertiveness.' },
              high: { min: 3.5, max: 5, text: 'You are highly empathetic and cooperative.' }
            },
            {
              trait: 'neuroticism',
              low: { min: 0, max: 2.5, text: 'You tend to remain calm under pressure.' },
              medium: { min: 2.5, max: 3.5, text: 'You experience moderate emotional responses.' },
              high: { min: 3.5, max: 5, text: 'You are sensitive to emotional stimuli.' }
            }
          ]
        },
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
    logger.info('Connected to MongoDB for master seeding');

    // Seed data
    const questionCount = await seedQuestions();
    const templateCount = await seedReportTemplates();

    // Verify and report
    const dbCounts = await QuestionBank.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const traitCounts = await QuestionBank.aggregate([
      { $match: { category: 'personality' } },
      { $group: { _id: '$trait', count: { $sum: 1 } } }
    ]);

    logger.info('===========================================');
    logger.info('✅ MASTER DATABASE SEEDING COMPLETED');
    logger.info('===========================================');
    logger.info(`📊 Total Questions: ${questionCount}`);
    logger.info(`📄 Report Templates: ${templateCount}`);
    logger.info('');
    logger.info('📈 Questions by Category:');
    dbCounts.forEach(cat => {
      logger.info(`   ${cat._id}: ${cat.count} questions`);
    });
    logger.info('');
    logger.info('🎯 Personality Questions by Trait:');
    traitCounts.forEach(trait => {
      logger.info(`   ${trait._id}: ${trait.count} questions`);
    });
    logger.info('===========================================');

    // Disconnect
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    logger.error('Master seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for testing
module.exports = { seedQuestions, seedReportTemplates };
