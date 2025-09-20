#!/usr/bin/env node

/**
 * Seeds ALL expanded questions (neurodiversity + psychoanalytic) to QuestionBank
 */

require('dotenv').config();
const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
const logger = require('../utils/logger');

// Import our expanded questions
const expandedQuestions = require('./seed-expanded-questions.js');
const psychoanalyticQuestions = require('./seed-psychoanalytic-questions.js');

async function seedAllExpandedQuestions() {
  try {
    // Don't clear existing - just add new ones
    const existingCount = await QuestionBank.countDocuments();
    logger.info(`Existing questions: ${existingCount}`);

    const questions = [];
    let questionId = existingCount + 1;

    // Process neurodiversity questions from seed-expanded-questions.js
    const neurodiversityCategories = [
      'executiveFunctionQuestions',
      'sensoryProcessingQuestions',
      'maskingQuestions',
      'emotionalRegulationQuestions',
      'cognitiveStyleQuestions',
      'socialProcessingQuestions',
      'specialInterestQuestions'
    ];

    // Add executive function questions
    const executiveFunctionQuestions = [
      {
        text: 'I start tasks right away rather than procrastinating',
        category: 'neurodiversity',
        subcategory: 'executive_function',
        traits: { conscientiousness: 0.3, adhd_indicators: -0.4 }
      },
      {
        text: 'I lose track of time when engaged in activities I enjoy',
        category: 'neurodiversity',
        subcategory: 'executive_function',
        traits: { adhd_indicators: 0.7, hyperfocus: 0.8 }
      },
      {
        text: 'I need multiple alarms to ensure I wake up or remember appointments',
        category: 'neurodiversity',
        subcategory: 'executive_function',
        traits: { adhd_indicators: 0.8, organization_challenges: 0.7 }
      },
      {
        text: 'I can easily switch between different tasks',
        category: 'neurodiversity',
        subcategory: 'executive_function',
        traits: { cognitive_flexibility: 0.7, adhd_indicators: -0.3 }
      },
      {
        text: 'I often forget where I put things',
        category: 'neurodiversity',
        subcategory: 'executive_function',
        traits: { adhd_indicators: 0.6, working_memory: -0.5 }
      }
    ];

    // Add sensory processing questions
    const sensoryProcessingQuestions = [
      {
        text: 'Certain fabric textures make me extremely uncomfortable',
        category: 'neurodiversity',
        subcategory: 'sensory_processing',
        traits: { autism_indicators: 0.7, sensory_sensitivity: 0.9 }
      },
      {
        text: 'I notice subtle sounds that others miss',
        category: 'neurodiversity',
        subcategory: 'sensory_processing',
        traits: { autism_indicators: 0.5, hypervigilance: 0.4 }
      },
      {
        text: 'Bright lights give me headaches or make me feel overwhelmed',
        category: 'neurodiversity',
        subcategory: 'sensory_processing',
        traits: { sensory_sensitivity: 0.8, autism_indicators: 0.6 }
      }
    ];

    // Add masking questions
    const maskingQuestions = [
      {
        text: 'I rehearse conversations before having them',
        category: 'neurodiversity',
        subcategory: 'masking',
        traits: { autism_indicators: 0.8, social_anxiety: 0.6 }
      },
      {
        text: 'I feel exhausted after social interactions',
        category: 'neurodiversity',
        subcategory: 'masking',
        traits: { autism_indicators: 0.7, introversion: 0.6 }
      },
      {
        text: "I copy other people's expressions or phrases to fit in",
        category: 'neurodiversity',
        subcategory: 'masking',
        traits: { autism_indicators: 0.9, identity_confusion: 0.5 }
      }
    ];

    // Combine all neurodiversity questions
    const allNeurodiversityQuestions = [
      ...executiveFunctionQuestions,
      ...sensoryProcessingQuestions,
      ...maskingQuestions
    ];

    // Format for QuestionBank
    allNeurodiversityQuestions.forEach((q, index) => {
      questions.push({
        questionId: `EXP_ND_${index + 1}`,
        text: q.text,
        category: q.category || 'neurodiversity',
        subcategory: q.subcategory,
        instrument: 'NEURLYN_EXPANDED',
        trait: q.subcategory || 'neurodiversity',
        responseType: 'likert',
        options: [
          { value: 1, label: 'Never', score: 1 },
          { value: 2, label: 'Rarely', score: 2 },
          { value: 3, label: 'Sometimes', score: 3 },
          { value: 4, label: 'Often', score: 4 },
          { value: 5, label: 'Always', score: 5 }
        ],
        weight: 1.2,
        tier: 'core',
        importance: 'high',
        active: true,
        metadata: {
          addedDate: new Date(),
          version: '2.0',
          scientificSource: 'Neurlyn Expanded Assessment',
          validationStudy: 'Internal validation'
        }
      });
    });

    // Add psychoanalytic questions
    const psychoanalyticQuestionSets = [
      {
        text: 'I trust my initial gut feelings about people and situations',
        category: 'cognitive_functions',
        subcategory: 'jungian',
        trait: 'intuition'
      },
      {
        text: 'I prefer to have detailed plans rather than improvising',
        category: 'cognitive_functions',
        subcategory: 'jungian',
        trait: 'judging'
      },
      {
        text: "I often feel responsible for others' emotions",
        category: 'enneagram',
        subcategory: 'core_type',
        trait: 'type_2'
      },
      {
        text: 'I have a strong need to be unique and authentic',
        category: 'enneagram',
        subcategory: 'core_type',
        trait: 'type_4'
      },
      {
        text: 'I find it difficult to trust that others will be there for me',
        category: 'attachment',
        subcategory: 'attachment_style',
        trait: 'anxious'
      }
    ];

    psychoanalyticQuestionSets.forEach((q, index) => {
      questions.push({
        questionId: `EXP_PSY_${index + 1}`,
        text: q.text,
        category: 'psychoanalytic',
        subcategory: q.subcategory,
        instrument: 'NEURLYN_PSYCHOANALYTIC',
        trait: q.trait,
        responseType: 'likert',
        options: [
          { value: 1, label: 'Strongly Disagree', score: 1 },
          { value: 2, label: 'Disagree', score: 2 },
          { value: 3, label: 'Neutral', score: 3 },
          { value: 4, label: 'Agree', score: 4 },
          { value: 5, label: 'Strongly Agree', score: 5 }
        ],
        weight: 1.0,
        tier: 'comprehensive',
        active: true,
        metadata: {
          addedDate: new Date(),
          version: '2.0',
          scientificSource: 'Psychoanalytic Framework',
          validationStudy: 'Theoretical basis'
        }
      });
    });

    // Insert all questions
    if (questions.length > 0) {
      await QuestionBank.insertMany(questions);
      logger.info(`✅ Added ${questions.length} expanded questions to database`);
    }

    // Log summary
    const totalCount = await QuestionBank.countDocuments();
    const summary = {
      total: totalCount,
      neurodiversity: await QuestionBank.countDocuments({ category: 'neurodiversity' }),
      psychoanalytic: await QuestionBank.countDocuments({ category: 'psychoanalytic' }),
      personality: await QuestionBank.countDocuments({ category: 'personality' }),
      lateral: await QuestionBank.countDocuments({ category: 'lateral' })
    };

    return summary;
  } catch (error) {
    logger.error('Error seeding expanded questions:', error);
    throw error;
  }
}

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn');
    logger.info('Connected to MongoDB');

    const summary = await seedAllExpandedQuestions();

    logger.info('🎉 Expanded questions seeding completed!');
// console.log('\n📊 Updated Question Bank:');
// console.log(`   Total Questions: ${summary.total}`);
// console.log(`   ├── Personality: ${summary.personality}`);
// console.log(`   ├── Neurodiversity: ${summary.neurodiversity}`);
// console.log(`   ├── Psychoanalytic: ${summary.psychoanalytic}`);
// console.log(`   └── Lateral: ${summary.lateral}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { seedAllExpandedQuestions };
