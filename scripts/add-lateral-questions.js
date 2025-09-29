const mongoose = require('mongoose');
require('dotenv').config();

const QuestionBank = require('../models/QuestionBank');

const lateralQuestions = [
  {
    questionId: 'LATERAL_001',
    text: 'A man lives on the 20th floor of an apartment building. Every morning he takes the elevator down to the ground floor. When he comes home, he takes the elevator to the 10th floor and walks the rest of the way... except on rainy days, when he takes the elevator all the way to the 20th floor. Why?',
    category: 'lateral',
    subcategory: 'logical_reasoning',
    responseType: 'multiple-choice',
    options: [
      {
        value: 'A',
        label: 'He is too short to reach the button for the 20th floor unless he has an umbrella'
      },
      { value: 'B', label: 'He enjoys the exercise of walking up 10 floors' },
      { value: 'C', label: 'The elevator is broken above the 10th floor except when it rains' },
      { value: 'D', label: 'He meets his neighbor on the 10th floor' }
    ],
    correctAnswer: 'A',
    instrument: 'LATERAL_THINKING',
    tier: 'core',
    measures: ['logical_reasoning', 'creative_thinking'],
    validatedInstrument: false,
    researchBased: true,
    tags: ['puzzle', 'lateral_thinking', 'logic']
  },
  {
    questionId: 'LATERAL_002',
    text: 'A woman enters a room and screams. She sees something that makes her immediately call the police. There is no crime in progress. What did she see?',
    category: 'lateral',
    subcategory: 'situational_reasoning',
    responseType: 'multiple-choice',
    options: [
      { value: 'A', label: 'A dead body' },
      { value: 'B', label: 'Her own reflection in an unexpected place' },
      { value: 'C', label: 'A broken window' },
      { value: 'D', label: 'Someone she thought was dead' }
    ],
    correctAnswer: 'A',
    instrument: 'LATERAL_THINKING',
    tier: 'core',
    measures: ['situational_reasoning', 'inference'],
    validatedInstrument: false,
    researchBased: true,
    tags: ['puzzle', 'inference', 'situation']
  },
  {
    questionId: 'LATERAL_003',
    text: 'A man is pushing his car. He stops in front of a hotel and immediately knows he is bankrupt. How?',
    category: 'lateral',
    subcategory: 'pattern_recognition',
    responseType: 'multiple-choice',
    options: [
      { value: 'A', label: 'He is playing Monopoly and landed on a hotel property' },
      { value: 'B', label: 'The hotel bill was too expensive' },
      { value: 'C', label: 'His car broke down and repairs cost more than he has' },
      { value: 'D', label: 'The hotel owner demanded immediate payment' }
    ],
    correctAnswer: 'A',
    instrument: 'LATERAL_THINKING',
    tier: 'core',
    measures: ['pattern_recognition', 'context_switching'],
    validatedInstrument: false,
    researchBased: true,
    tags: ['puzzle', 'context', 'games']
  },
  {
    questionId: 'LATERAL_004',
    text: 'Romeo and Juliet are found dead on the floor surrounded by water and glass. How did they die?',
    category: 'lateral',
    subcategory: 'assumption_breaking',
    responseType: 'multiple-choice',
    options: [
      { value: 'A', label: 'They were poisoned by contaminated water' },
      { value: 'B', label: 'They were fish and their bowl was broken' },
      { value: 'C', label: 'They drowned in a flood' },
      { value: 'D', label: 'They were killed in a domestic dispute' }
    ],
    correctAnswer: 'B',
    instrument: 'LATERAL_THINKING',
    tier: 'core',
    measures: ['assumption_breaking', 'perspective_shift'],
    validatedInstrument: false,
    researchBased: true,
    tags: ['puzzle', 'assumptions', 'perspective']
  },
  {
    questionId: 'LATERAL_005',
    text: 'A man is found hanging in a locked room with no furniture. There is a puddle of water beneath him. How did he die?',
    category: 'lateral',
    subcategory: 'process_reasoning',
    responseType: 'multiple-choice',
    options: [
      { value: 'A', label: 'He stood on a block of ice that melted' },
      { value: 'B', label: 'He was murdered and the scene was staged' },
      { value: 'C', label: 'He climbed up wet walls and slipped' },
      { value: 'D', label: 'The water leaked from above and he drowned' }
    ],
    correctAnswer: 'A',
    instrument: 'LATERAL_THINKING',
    tier: 'core',
    measures: ['process_reasoning', 'temporal_thinking'],
    validatedInstrument: false,
    researchBased: true,
    tags: ['puzzle', 'process', 'time']
  },
  {
    questionId: 'LATERAL_006',
    text: 'A man calls his dog from the opposite side of a river. The dog crosses the river without getting wet, without using a bridge or boat. How?',
    category: 'lateral',
    subcategory: 'environmental_reasoning',
    responseType: 'multiple-choice',
    options: [
      { value: 'A', label: 'The river was frozen' },
      { value: 'B', label: 'The dog flew across' },
      { value: 'C', label: 'There was a hidden bridge underwater' },
      { value: 'D', label: 'The dog tunneled under the river' }
    ],
    correctAnswer: 'A',
    instrument: 'LATERAL_THINKING',
    tier: 'core',
    measures: ['environmental_reasoning', 'state_changes'],
    validatedInstrument: false,
    researchBased: true,
    tags: ['puzzle', 'environment', 'states']
  },
  {
    questionId: 'LATERAL_007',
    text: 'What gets wetter as it dries?',
    category: 'lateral',
    subcategory: 'wordplay_logic',
    responseType: 'multiple-choice',
    options: [
      { value: 'A', label: 'A towel' },
      { value: 'B', label: 'A sponge' },
      { value: 'C', label: 'Hair' },
      { value: 'D', label: 'Paint' }
    ],
    correctAnswer: 'A',
    instrument: 'LATERAL_THINKING',
    tier: 'free',
    measures: ['wordplay_logic', 'conceptual_flexibility'],
    validatedInstrument: false,
    researchBased: true,
    tags: ['riddle', 'wordplay', 'concepts']
  },
  {
    questionId: 'LATERAL_008',
    text: 'The more you take, the more you leave behind. What am I?',
    category: 'lateral',
    subcategory: 'abstract_thinking',
    responseType: 'multiple-choice',
    options: [
      { value: 'A', label: 'Footsteps' },
      { value: 'B', label: 'Time' },
      { value: 'C', label: 'Memories' },
      { value: 'D', label: 'Breath' }
    ],
    correctAnswer: 'A',
    instrument: 'LATERAL_THINKING',
    tier: 'free',
    measures: ['abstract_thinking', 'metaphorical_reasoning'],
    validatedInstrument: false,
    researchBased: true,
    tags: ['riddle', 'abstract', 'metaphor']
  },
  {
    questionId: 'LATERAL_009',
    text: 'A woman has seven daughters. Each daughter has one brother. How many children does the woman have?',
    category: 'lateral',
    subcategory: 'mathematical_reasoning',
    responseType: 'multiple-choice',
    options: [
      { value: 'A', label: '8 children (7 daughters + 1 son)' },
      { value: 'B', label: '14 children (7 daughters + 7 sons)' },
      { value: 'C', label: '7 children (only daughters)' },
      { value: 'D', label: '15 children (7 daughters + 7 sons + 1 extra)' }
    ],
    correctAnswer: 'A',
    instrument: 'LATERAL_THINKING',
    tier: 'free',
    measures: ['mathematical_reasoning', 'logical_deduction'],
    validatedInstrument: false,
    researchBased: true,
    tags: ['math', 'logic', 'deduction']
  },
  {
    questionId: 'LATERAL_010',
    text: 'Forward I am heavy, but backward I am not. What am I?',
    category: 'lateral',
    subcategory: 'linguistic_reasoning',
    responseType: 'multiple-choice',
    options: [
      { value: 'A', label: 'The word "ton" (spelled backward is "not")' },
      { value: 'B', label: 'A truck' },
      { value: 'C', label: 'A scale' },
      { value: 'D', label: 'A weight' }
    ],
    correctAnswer: 'A',
    instrument: 'LATERAL_THINKING',
    tier: 'free',
    measures: ['linguistic_reasoning', 'word_manipulation'],
    validatedInstrument: false,
    researchBased: true,
    tags: ['wordplay', 'language', 'reversal']
  },
  {
    questionId: 'LATERAL_011',
    text: 'A man builds a rectangular house with four walls. Each wall has a southern exposure. A bear walks by the house. What color is the bear?',
    category: 'lateral',
    subcategory: 'spatial_reasoning',
    responseType: 'multiple-choice',
    options: [
      { value: 'A', label: 'White (polar bear at the North Pole)' },
      { value: 'B', label: 'Brown' },
      { value: 'C', label: 'Black' },
      { value: 'D', label: 'The color is unknown' }
    ],
    correctAnswer: 'A',
    instrument: 'LATERAL_THINKING',
    tier: 'core',
    measures: ['spatial_reasoning', 'geographical_knowledge'],
    validatedInstrument: false,
    researchBased: true,
    tags: ['spatial', 'geography', 'logic']
  },
  {
    questionId: 'LATERAL_012',
    text: 'You are in a dark room with a match. There is a candle, an oil lamp, and a gas stove. What do you light first?',
    category: 'lateral',
    subcategory: 'sequence_reasoning',
    responseType: 'multiple-choice',
    options: [
      { value: 'A', label: 'The match' },
      { value: 'B', label: 'The candle' },
      { value: 'C', label: 'The oil lamp' },
      { value: 'D', label: 'The gas stove' }
    ],
    correctAnswer: 'A',
    instrument: 'LATERAL_THINKING',
    tier: 'free',
    measures: ['sequence_reasoning', 'prerequisite_thinking'],
    validatedInstrument: false,
    researchBased: true,
    tags: ['sequence', 'prerequisites', 'obvious']
  }
];

async function addLateralQuestions() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Add questions to the database
    const insertedQuestions = [];

    for (const question of lateralQuestions) {
      try {
        // Check if question already exists
        const existingQuestion = await QuestionBank.findOne({ questionId: question.questionId });

        if (existingQuestion) {
          console.log(`⚠️ Question ${question.questionId} already exists, skipping...`);
          continue;
        }

        // Add the question
        const newQuestion = new QuestionBank(question);
        await newQuestion.save();
        insertedQuestions.push(newQuestion);
        console.log(
          `✅ Added question: ${question.questionId} - "${question.text.substring(0, 50)}..."`
        );
      } catch (error) {
        console.error(`❌ Error adding question ${question.questionId}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully added ${insertedQuestions.length} lateral thinking questions!`);

    // Show final stats
    const totalQuestions = await QuestionBank.countDocuments();
    const lateralCount = await QuestionBank.countDocuments({ category: 'lateral' });

    console.log(`📊 Database now contains:`);
    console.log(`   Total questions: ${totalQuestions}`);
    console.log(`   Lateral thinking questions: ${lateralCount}`);

    await mongoose.disconnect();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error adding lateral questions:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  addLateralQuestions();
}

module.exports = { addLateralQuestions, lateralQuestions };
