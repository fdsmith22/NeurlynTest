#!/usr/bin/env node

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

// Gateway questions that subtly screen for specialized traits
const gatewayQuestions = [
  // Sensory gateway
  {
    questionId: 'gateway_sensory_1',
    text: 'I find crowded or noisy environments overwhelming',
    trait: 'neuroticism',
    category: 'personality',
    instrument: 'BFI-2-Gateway',
    tier: 'core',
    responseType: 'likert',
    adaptive: {
      isBaseline: true,
      baselinePriority: 6,
      diagnosticWeight: 3,
      discriminationIndex: 0.7,
      gatewayFor: ['sensory', 'neurodiversity']
    },
    active: true
  },

  // Executive function gateway
  {
    questionId: 'gateway_executive_1',
    text: 'I struggle to stay organized even when I try hard',
    trait: 'conscientiousness',
    category: 'personality',
    instrument: 'BFI-2-Gateway',
    tier: 'core',
    responseType: 'likert',
    adaptive: {
      isBaseline: true,
      baselinePriority: 7,
      diagnosticWeight: 3,
      discriminationIndex: 0.7,
      gatewayFor: ['executive_function', 'adhd']
    },
    active: true
  },

  // Social communication gateway
  {
    questionId: 'gateway_social_1',
    text: 'I often misunderstand social cues or take things too literally',
    trait: 'agreeableness',
    category: 'personality',
    instrument: 'BFI-2-Gateway',
    tier: 'core',
    responseType: 'likert',
    adaptive: {
      isBaseline: true,
      baselinePriority: 8,
      diagnosticWeight: 3,
      discriminationIndex: 0.7,
      gatewayFor: ['communication', 'autism']
    },
    active: true
  },

  // Routine/flexibility gateway
  {
    questionId: 'gateway_routine_1',
    text: 'Unexpected changes in plans cause me significant distress',
    trait: 'openness',
    category: 'personality',
    instrument: 'BFI-2-Gateway',
    tier: 'core',
    responseType: 'likert',
    adaptive: {
      isBaseline: true,
      baselinePriority: 9,
      diagnosticWeight: 3,
      discriminationIndex: 0.7,
      gatewayFor: ['routine', 'autism', 'anxiety']
    },
    active: true
  },

  // Focus/attention gateway
  {
    questionId: 'gateway_attention_1',
    text: 'My mind frequently jumps between thoughts making it hard to focus',
    trait: 'conscientiousness',
    category: 'personality',
    instrument: 'BFI-2-Gateway',
    tier: 'core',
    responseType: 'likert',
    adaptive: {
      isBaseline: true,
      baselinePriority: 10,
      diagnosticWeight: 3,
      discriminationIndex: 0.7,
      gatewayFor: ['attention', 'adhd']
    },
    active: true
  }
];

async function addGatewayQuestions() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Remove existing gateway questions if any
    const deleted = await QuestionBank.deleteMany({
      instrument: 'BFI-2-Gateway'
    });
    console.log(`Removed ${deleted.deletedCount} existing gateway questions`);

    // Add new gateway questions
    const result = await QuestionBank.insertMany(gatewayQuestions);
    console.log(`Added ${result.length} gateway questions`);

    // Verify baseline questions include gateways
    const baselineQuestions = await QuestionBank.find({
      'adaptive.isBaseline': true,
      active: true
    }).sort({ 'adaptive.baselinePriority': 1 });

    console.log(`\nTotal baseline questions: ${baselineQuestions.length}`);
    console.log('Gateway questions in baseline:');
    baselineQuestions
      .filter(q => q.instrument === 'BFI-2-Gateway')
      .forEach(q => {
        console.log(`  - ${q.text.substring(0, 50)}... (Priority: ${q.adaptive.baselinePriority})`);
      });

    await mongoose.connection.close();
    console.log('\nGateway questions added successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addGatewayQuestions();
