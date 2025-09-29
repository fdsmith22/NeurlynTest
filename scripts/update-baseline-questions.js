const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

const MONGODB_URI = 'mongodb://localhost:27017/neurlyn-test';

async function updateBaselineQuestions() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define which questions should be baseline questions for initial profiling
    const baselineUpdates = [
      // Core personality traits (Big Five) - highest priority baseline questions
      {
        filter: { category: 'personality', trait: 'openness', tier: { $in: ['free', 'core'] } },
        count: 2,
        priority: [1, 2]
      },
      {
        filter: {
          category: 'personality',
          trait: 'conscientiousness',
          tier: { $in: ['free', 'core'] }
        },
        count: 2,
        priority: [3, 4]
      },
      {
        filter: { category: 'personality', trait: 'extraversion', tier: { $in: ['free', 'core'] } },
        count: 2,
        priority: [5, 6]
      },
      {
        filter: {
          category: 'personality',
          trait: 'agreeableness',
          tier: { $in: ['free', 'core'] }
        },
        count: 1,
        priority: [7]
      },
      {
        filter: { category: 'personality', trait: 'neuroticism', tier: { $in: ['free', 'core'] } },
        count: 1,
        priority: [8]
      },
      // Neurodiversity screening questions for baseline profiling
      {
        filter: {
          category: 'neurodiversity',
          instrument: { $in: ['ASRS', 'AQ_10'] },
          tier: { $in: ['free', 'core'] }
        },
        count: 2,
        priority: [9, 10]
      }
    ];

    let totalUpdated = 0;

    for (const update of baselineUpdates) {
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
              'adaptive.diagnosticWeight': 2, // Higher weight for baseline questions
              tier: 'core', // Ensure baseline questions are accessible
              active: true // Add active field
            }
          }
        );

        if (result.modifiedCount > 0) {
          console.log(`  ✓ Updated ${question.questionId} (priority: ${priority})`);
          totalUpdated++;
        }
      }
    }

    // Also add active: true to all questions that don't have it
    const activeResult = await QuestionBank.updateMany(
      { active: { $exists: false } },
      { $set: { active: true } }
    );
    console.log(`\nAdded 'active: true' to ${activeResult.modifiedCount} questions`);

    // Update tier mapping to work with our system
    const tierUpdates = [
      // Map free tier questions to be accessible in standard assessments
      { from: 'free', to: 'core', condition: { 'adaptive.isBaseline': true } }
    ];

    for (const tierUpdate of tierUpdates) {
      const result = await QuestionBank.updateMany(
        { tier: tierUpdate.from, ...tierUpdate.condition },
        { $set: { tier: tierUpdate.to } }
      );
      console.log(
        `Updated ${result.modifiedCount} questions from ${tierUpdate.from} to ${tierUpdate.to}`
      );
    }

    // Verify the updates
    console.log('\n=== VERIFICATION ===');
    const baselineCount = await QuestionBank.countDocuments({
      'adaptive.isBaseline': true
    });
    console.log(`Total baseline questions: ${baselineCount}`);

    const baselineQuestions = await QuestionBank.find({
      'adaptive.isBaseline': true
    })
      .sort({ 'adaptive.baselinePriority': 1 })
      .select({
        questionId: 1,
        category: 1,
        trait: 1,
        instrument: 1,
        'adaptive.baselinePriority': 1,
        tier: 1
      });

    console.log('\nBaseline questions (sorted by priority):');
    baselineQuestions.forEach(q => {
      console.log(
        `  ${q.adaptive.baselinePriority}. ${q.questionId} (${q.category}/${q.trait || q.instrument}) [${q.tier}]`
      );
    });

    // Test the query that will be used by the adaptive engine
    const testQuery = {
      'adaptive.isBaseline': true,
      tier: { $in: ['core', 'comprehensive'] }, // Updated to match actual tiers
      active: true
    };
    const testResults = await QuestionBank.find(testQuery)
      .sort({ 'adaptive.baselinePriority': 1 })
      .limit(10);
    console.log(`\nTest query results: ${testResults.length} questions found`);

    console.log(`\n✅ Successfully updated ${totalUpdated} questions as baseline questions`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error updating baseline questions:', error);
    process.exit(1);
  }
}

updateBaselineQuestions();
