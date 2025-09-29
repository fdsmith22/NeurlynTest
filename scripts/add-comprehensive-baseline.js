const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

const MONGODB_URI = 'mongodb://localhost:27017/neurlyn-test';

async function addComprehensiveBaseline() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Add more baseline questions for comprehensive tier (neurodiversity + additional personality)
    const additionalBaseline = [
      // Neurodiversity baseline questions
      {
        filter: { category: 'neurodiversity', tier: { $in: ['core', 'comprehensive'] } },
        count: 4,
        priority: [9, 10, 11, 12] // Continue from existing 8 questions
      },
      // Additional personality depth questions
      {
        filter: {
          category: 'personality',
          trait: 'openness',
          tier: 'core',
          'adaptive.isBaseline': { $ne: true }
        },
        count: 1,
        priority: [13]
      },
      {
        filter: {
          category: 'personality',
          trait: 'conscientiousness',
          tier: 'core',
          'adaptive.isBaseline': { $ne: true }
        },
        count: 1,
        priority: [14]
      },
      {
        filter: {
          category: 'personality',
          trait: 'extraversion',
          tier: 'core',
          'adaptive.isBaseline': { $ne: true }
        },
        count: 1,
        priority: [15]
      }
    ];

    let totalUpdated = 0;

    for (const update of additionalBaseline) {
      console.log(`\nProcessing: ${JSON.stringify(update.filter)}`);

      // Find questions matching the criteria
      const questions = await QuestionBank.find(update.filter).limit(update.count);
      console.log(`Found ${questions.length} questions for baseline`);

      // Update each question to be a baseline question
      for (let i = 0; i < questions.length && i < update.count; i++) {
        const question = questions[i];
        const priority = update.priority[i];

        const result = await QuestionBank.updateOne(
          { _id: question._id },
          {
            $set: {
              'adaptive.isBaseline': true,
              'adaptive.baselinePriority': priority,
              'adaptive.diagnosticWeight': 2,
              active: true
            }
          }
        );

        if (result.modifiedCount > 0) {
          console.log(`  ✓ Updated ${question.questionId} (priority: ${priority})`);
          totalUpdated++;
        }
      }
    }

    // Verify the updates
    console.log('\n=== VERIFICATION ===');
    const baselineCount = await QuestionBank.countDocuments({
      'adaptive.isBaseline': true
    });
    console.log(`Total baseline questions: ${baselineCount}`);

    // Test comprehensive tier query
    const compQuery = {
      'adaptive.isBaseline': true,
      tier: { $in: ['core', 'comprehensive', 'specialized'] },
      $or: [{ active: true }, { active: { $exists: false } }]
    };
    const compQuestions = await QuestionBank.find(compQuery)
      .sort({ 'adaptive.baselinePriority': 1 })
      .limit(15);
    console.log(`Comprehensive baseline questions available: ${compQuestions.length}`);

    console.log(`\n✅ Successfully updated ${totalUpdated} additional baseline questions`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error adding comprehensive baseline:', error);
    process.exit(1);
  }
}

addComprehensiveBaseline();
