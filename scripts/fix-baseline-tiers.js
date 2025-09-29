const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

async function fixBaselineTiers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update BFI_OPENNESS_1 and ND_ADHD_1 to have tier='core'
    const questionsToUpdate = ['BFI_OPENNESS_1', 'ND_ADHD_1'];

    for (const questionId of questionsToUpdate) {
      const result = await QuestionBank.updateOne({ questionId }, { $set: { tier: 'core' } });
      console.log(`Updated ${questionId}: ${result.modifiedCount} document(s) modified`);
    }

    // Verify the fix
    console.log('\n--- Verifying fix ---');
    const standardBaseline = await QuestionBank.getBaselineQuestions('standard');
    console.log(
      `getBaselineQuestions("standard") now returns ${standardBaseline.length} questions`
    );

    // Show all baseline questions with their tiers
    console.log('\nAll baseline questions:');
    const allBaseline = await QuestionBank.find({ 'adaptive.isBaseline': true }).sort({
      'adaptive.baselinePriority': 1
    });
    allBaseline.forEach((q, i) => {
      console.log(
        `  ${i + 1}. ${q.questionId} (tier: ${q.tier}, priority: ${q.adaptive?.baselinePriority})`
      );
    });

    console.log('\n✅ Baseline tiers fixed successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixBaselineTiers();
