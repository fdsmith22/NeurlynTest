#!/usr/bin/env node

/**
 * Comprehensive Database Seeder - Imports ALL existing questions
 * Run: node scripts/seed-all-questions.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
const ReportTemplate = require('../models/ReportTemplate');
const logger = require('../utils/logger');

// Import question data from existing files
const { improvedQuestions } = require('../js/questions/improved-questions');
const { lateralQuestions } = require('../js/questions/lateral-questions');

async function seedAllQuestions() {
  try {
    await QuestionBank.deleteMany({});
    logger.info('Cleared existing questions');

    const questions = [];
    let questionId = 1;

    // Process improved questions (standard personality questions)
    const improvedCategories = [
      'openness',
      'conscientiousness',
      'extraversion',
      'agreeableness',
      'neuroticism',
      'behavioral',
      'situational',
      'preferences'
    ];

    improvedCategories.forEach(category => {
      if (improvedQuestions[category]) {
        improvedQuestions[category].forEach((q, index) => {
          // Determine the trait from category name
          let trait = q.category.toLowerCase();
          if (
            category === 'behavioral' ||
            category === 'situational' ||
            category === 'preferences'
          ) {
            // These are mixed categories, use the question's category field
            trait = q.category.toLowerCase();
          }

          questions.push({
            questionId: `STD_${category.toUpperCase()}_${index + 1}`,
            text: q.text,
            category: 'personality',
            instrument: 'BFI-2-Extended',
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
            weight: 1,
            tier: 'free',
            variations: [
              {
                language: 'en-US',
                text: q.text,
                culturalAdaptation: 'original'
              }
            ],
            metadata: {
              addedDate: new Date(),
              version: '2.0',
              scientificSource: 'Big Five Inventory',
              validationStudy: 'Internal validation pending'
            },
            active: true
          });
        });
      }
    });

    // Process lateral thinking questions
    const lateralCategories = [
      'openness',
      'conscientiousness',
      'extraversion',
      'agreeableness',
      'neuroticism',
      'mixed',
      'projective'
    ];

    lateralCategories.forEach(category => {
      if (lateralQuestions[category]) {
        lateralQuestions[category].forEach(q => {
          questions.push({
            questionId: q.id.toUpperCase(),
            text: q.text,
            category: 'lateral',
            instrument: 'LATERAL_THINKING',
            trait: category === 'mixed' || category === 'projective' ? 'mixed' : category,
            responseType: q.type === 'choice' ? 'multiple-choice' : 'open-ended',
            options: q.options
              ? q.options.map((opt, idx) => ({
                  value: idx,
                  label: opt,
                  score: idx // Scoring will be handled by measures
                }))
              : [],
            measures: q.measures || [],
            weight: 1.2, // Lateral questions weighted slightly higher
            tier: 'comprehensive',
            interactiveElements: {
              hasTimer: false,
              hasVisual: false,
              gamificationPoints: 15
            },
            variations: [
              {
                language: 'en-US',
                text: q.text,
                culturalAdaptation: 'original'
              }
            ],
            metadata: {
              addedDate: new Date(),
              version: '1.0',
              scientificSource: 'Lateral Thinking Assessment',
              validationStudy: 'Experimental'
            },
            active: true
          });
        });
      }
    });

    // Add clinical screening questions
    const clinicalQuestions = [
      // ADHD (ASRS-5)
      {
        questionId: 'ASRS_1',
        text: 'How often do you have difficulty concentrating on what people say to you, even when they are speaking to you directly?',
        instrument: 'ASRS-5',
        trait: 'adhd',
        category: 'neurodiversity'
      },
      {
        questionId: 'ASRS_2',
        text: 'How often do you leave your seat in meetings or other situations in which you are expected to remain seated?',
        instrument: 'ASRS-5',
        trait: 'adhd',
        category: 'neurodiversity'
      },
      {
        questionId: 'ASRS_3',
        text: 'How often do you have difficulty unwinding and relaxing when you have time to yourself?',
        instrument: 'ASRS-5',
        trait: 'adhd',
        category: 'neurodiversity'
      },
      {
        questionId: 'ASRS_4',
        text: 'How often do you find yourself talking too much when you are in social situations?',
        instrument: 'ASRS-5',
        trait: 'adhd',
        category: 'neurodiversity'
      },
      {
        questionId: 'ASRS_5',
        text: 'How often do you find yourself finishing the sentences of the people you are talking to, before they can finish them themselves?',
        instrument: 'ASRS-5',
        trait: 'adhd',
        category: 'neurodiversity'
      },

      // Autism (AQ-10)
      {
        questionId: 'AQ_1',
        text: 'I often notice small sounds when others do not',
        instrument: 'AQ-10',
        trait: 'autism',
        category: 'neurodiversity',
        reverseScored: false
      },
      {
        questionId: 'AQ_2',
        text: 'I usually concentrate more on the whole picture, rather than the small details',
        instrument: 'AQ-10',
        trait: 'autism',
        category: 'neurodiversity',
        reverseScored: true
      },
      {
        questionId: 'AQ_3',
        text: 'I find it easy to do more than one thing at once',
        instrument: 'AQ-10',
        trait: 'autism',
        category: 'neurodiversity',
        reverseScored: true
      },
      {
        questionId: 'AQ_4',
        text: 'If there is an interruption, I can switch back to what I was doing very quickly',
        instrument: 'AQ-10',
        trait: 'autism',
        category: 'neurodiversity',
        reverseScored: true
      },
      {
        questionId: 'AQ_5',
        text: 'I find it easy to "read between the lines" when someone is talking to me',
        instrument: 'AQ-10',
        trait: 'autism',
        category: 'neurodiversity',
        reverseScored: true
      },
      {
        questionId: 'AQ_6',
        text: 'I know how to tell if someone listening to me is getting bored',
        instrument: 'AQ-10',
        trait: 'autism',
        category: 'neurodiversity',
        reverseScored: true
      },
      {
        questionId: 'AQ_7',
        text: "When I'm reading a story, I find it difficult to work out the characters' intentions",
        instrument: 'AQ-10',
        trait: 'autism',
        category: 'neurodiversity',
        reverseScored: false
      },
      {
        questionId: 'AQ_8',
        text: 'I like to collect information about categories of things',
        instrument: 'AQ-10',
        trait: 'autism',
        category: 'neurodiversity',
        reverseScored: false
      },
      {
        questionId: 'AQ_9',
        text: 'I find it easy to work out what someone is thinking or feeling just by looking at their face',
        instrument: 'AQ-10',
        trait: 'autism',
        category: 'neurodiversity',
        reverseScored: true
      },
      {
        questionId: 'AQ_10',
        text: "I find it difficult to work out people's intentions",
        instrument: 'AQ-10',
        trait: 'autism',
        category: 'neurodiversity',
        reverseScored: false
      },

      // Depression (PHQ-2)
      {
        questionId: 'PHQ_1',
        text: 'Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?',
        instrument: 'PHQ-2',
        trait: 'depression',
        category: 'neurodiversity'
      },
      {
        questionId: 'PHQ_2',
        text: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
        instrument: 'PHQ-2',
        trait: 'depression',
        category: 'neurodiversity'
      },

      // Anxiety (GAD-2)
      {
        questionId: 'GAD_1',
        text: 'Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?',
        instrument: 'GAD-2',
        trait: 'anxiety',
        category: 'neurodiversity'
      },
      {
        questionId: 'GAD_2',
        text: 'Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?',
        instrument: 'GAD-2',
        trait: 'anxiety',
        category: 'neurodiversity'
      }
    ];

    // Add clinical questions with proper formatting
    clinicalQuestions.forEach(q => {
      const baseQuestion = {
        questionId: q.questionId,
        text: q.text,
        category: q.category,
        instrument: q.instrument,
        trait: q.trait,
        responseType: 'likert',
        weight: 1.5, // Clinical questions weighted higher
        tier: 'core',
        reverseScored: q.reverseScored || false,
        active: true,
        metadata: {
          addedDate: new Date(),
          version: '1.0',
          scientificSource: q.instrument,
          validationStudy: 'Clinically validated instrument'
        }
      };

      // Different response scales for different instruments
      if (q.instrument === 'ASRS-5' || q.instrument === 'PHQ-2' || q.instrument === 'GAD-2') {
        baseQuestion.options = [
          { value: 0, label: 'Never', score: 0 },
          { value: 1, label: 'Rarely', score: 1 },
          { value: 2, label: 'Sometimes', score: 2 },
          { value: 3, label: 'Often', score: 3 },
          { value: 4, label: 'Very Often', score: 4 }
        ];
      } else if (q.instrument === 'AQ-10') {
        baseQuestion.options = [
          { value: 1, label: 'Definitely Disagree', score: q.reverseScored ? 0 : 1 },
          { value: 2, label: 'Slightly Disagree', score: q.reverseScored ? 0 : 1 },
          { value: 3, label: 'Slightly Agree', score: q.reverseScored ? 1 : 0 },
          { value: 4, label: 'Definitely Agree', score: q.reverseScored ? 1 : 0 }
        ];
      }

      questions.push(baseQuestion);
    });

    // Add some gamified/interactive questions
    const interactiveQuestions = [
      {
        questionId: 'GAME_1',
        text: 'Complete the pattern: 🔵 🔴 🔵 🔴 ?',
        category: 'cognitive',
        instrument: 'PATTERN_RECOGNITION',
        responseType: 'multiple-choice',
        options: [
          { value: 'blue', label: '🔵', score: 1 },
          { value: 'red', label: '🔴', score: 0 },
          { value: 'green', label: '🟢', score: 0 },
          { value: 'yellow', label: '🟡', score: 0 }
        ],
        tier: 'comprehensive',
        interactiveElements: {
          hasTimer: true,
          timeLimit: 10,
          hasVisual: true,
          visualType: 'emoji',
          gamificationPoints: 20
        },
        active: true
      },
      {
        questionId: 'GAME_2',
        text: 'Quick! Type the first word that comes to mind when you see: OCEAN',
        category: 'cognitive',
        instrument: 'WORD_ASSOCIATION',
        responseType: 'word-association',
        tier: 'comprehensive',
        interactiveElements: {
          hasTimer: true,
          timeLimit: 5,
          gamificationPoints: 10
        },
        active: true
      }
    ];

    questions.push(...interactiveQuestions);

    // Insert all questions
    await QuestionBank.insertMany(questions);
    logger.info(`✅ Seeded ${questions.length} questions to database`);

    // Log summary
    const summary = {
      total: questions.length,
      personality: questions.filter(q => q.category === 'personality').length,
      lateral: questions.filter(q => q.category === 'lateral').length,
      neurodiversity: questions.filter(q => q.category === 'neurodiversity').length,
      cognitive: questions.filter(q => q.category === 'cognitive').length,
      interactive: questions.filter(q => q.interactiveElements?.hasTimer).length
    };

    logger.info('Question summary:', summary);
    return summary;
  } catch (error) {
    logger.error('Error seeding questions:', error);
    throw error;
  }
}

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn');
    logger.info('Connected to MongoDB');

    const summary = await seedAllQuestions();

    logger.info('🎉 Database seeding completed successfully!');
    // console.log('\n📊 Question Bank Summary:');
    // console.log(`   Total Questions: ${summary.total}`);
    // console.log(`   ├── Personality: ${summary.personality}`);
    // console.log(`   ├── Lateral Thinking: ${summary.lateral}`);
    // console.log(`   ├── Neurodiversity: ${summary.neurodiversity}`);
    // console.log(`   ├── Cognitive: ${summary.cognitive}`);
    // console.log(`   └── Interactive: ${summary.interactive}`);

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

module.exports = { seedAllQuestions };
