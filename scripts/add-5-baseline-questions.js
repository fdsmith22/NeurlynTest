/**
 * Add 5 strategic baseline questions to reach 20 total
 * Addresses gaps in: extraversion, attachment, emotional regulation, and neurodiversity screening
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

// Load QuestionBank model
const QuestionBank = require('../models/QuestionBank');

const newBaselineQuestions = [
  // 16. Extraversion - Social recharge (balances the 2 existing E questions)
  {
    questionId: 'BFI_EXTRAVERSION_BASELINE_3',
    text: 'I feel energized and motivated when I\'m around other people',
    category: 'personality',
    trait: 'extraversion',
    facet: 'sociability',
    instrument: 'BFI-2-Improved',
    responseType: 'likert',
    tier: 'core',
    active: true,
    adaptive: {
      isBaseline: true,
      baselinePriority: 6,
      weight: 1.0
    },
    tags: ['baseline', 'extraversion', 'social_energy']
  },

  // 17. Attachment - Anxious attachment screening
  {
    questionId: 'ATTACHMENT_ANXIOUS_BASELINE',
    text: 'I often worry whether people truly care about me',
    category: 'attachment',
    trait: 'anxious',
    facet: 'attachment_anxiety',
    instrument: 'NEURLYN_ATTACHMENT',
    responseType: 'likert',
    tier: 'core',
    active: true,
    adaptive: {
      isBaseline: true,
      baselinePriority: 7,
      weight: 1.0
    },
    tags: ['baseline', 'attachment', 'anxiety', 'relationships']
  },

  // 18. Attachment - Avoidant attachment screening
  {
    questionId: 'ATTACHMENT_AVOIDANT_BASELINE',
    text: 'I prefer to handle my problems independently rather than rely on others',
    category: 'attachment',
    trait: 'avoidant',
    facet: 'attachment_avoidance',
    instrument: 'NEURLYN_ATTACHMENT',
    responseType: 'likert',
    tier: 'core',
    active: true,
    adaptive: {
      isBaseline: true,
      baselinePriority: 8,
      weight: 1.0
    },
    tags: ['baseline', 'attachment', 'independence', 'relationships']
  },

  // 19. Emotional Regulation - Gateway for neuroticism + executive function
  {
    questionId: 'EMOTIONAL_REGULATION_BASELINE',
    text: 'Once I\'m upset, it takes me a long time to calm down',
    category: 'personality',
    trait: 'neuroticism',
    facet: 'emotional_regulation',
    instrument: 'BFI-2-Gateway',
    responseType: 'likert',
    tier: 'core',
    active: true,
    adaptive: {
      isBaseline: true,
      baselinePriority: 9,
      weight: 1.0
    },
    tags: ['baseline', 'neuroticism', 'emotional_regulation', 'executive_function', 'gateway']
  },

  // 20. Sensory/ADHD Gateway - Combines sensory sensitivity with focus
  {
    questionId: 'SENSORY_ADHD_GATEWAY_BASELINE',
    text: 'I find it difficult to focus when there are multiple things happening around me',
    category: 'personality',
    trait: 'neuroticism',
    facet: 'sensory_sensitivity',
    instrument: 'BFI-2-Gateway',
    responseType: 'likert',
    tier: 'core',
    active: true,
    adaptive: {
      isBaseline: true,
      baselinePriority: 10,
      weight: 1.0
    },
    tags: ['baseline', 'sensory', 'adhd', 'attention', 'neurodiversity', 'gateway'],
    correlatedTraits: ['neuroticism', 'conscientiousness']
  }
];

async function addBaselineQuestions() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('\n=== Adding 5 New Baseline Questions ===\n');

    for (const question of newBaselineQuestions) {
      // Check if question already exists
      const existing = await QuestionBank.findOne({ questionId: question.questionId });

      if (existing) {
        console.log(`✓ Question ${question.questionId} already exists, skipping...`);
      } else {
        await QuestionBank.create(question);
        console.log(`✓ Added: ${question.questionId}`);
        console.log(`  "${question.text}"`);
        console.log(`  Trait: ${question.trait}, Priority: ${question.adaptive.baselinePriority}`);
        console.log('');
      }
    }

    // Verify total baseline questions
    const totalBaseline = await QuestionBank.countDocuments({
      'adaptive.isBaseline': true,
      active: true
    });

    console.log('\n=== Baseline Questions Summary ===');
    console.log(`Total baseline questions: ${totalBaseline}`);

    // Check distribution
    const distribution = await QuestionBank.aggregate([
      { $match: { 'adaptive.isBaseline': true, active: true } },
      { $group: { _id: '$trait', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\nDistribution by trait:');
    distribution.forEach(d => {
      console.log(`  ${d._id}: ${d.count} questions`);
    });

    // Check gateway questions
    const gatewayCount = await QuestionBank.countDocuments({
      'adaptive.isBaseline': true,
      active: true,
      instrument: 'BFI-2-Gateway'
    });

    console.log(`\nGateway questions (neurodiversity screening): ${gatewayCount}`);

    console.log('\n✓ Baseline questions updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addBaselineQuestions();
