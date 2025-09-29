const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

async function debugBaselineQuestions() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check all baseline questions
    const allBaseline = await QuestionBank.find({ 'adaptive.isBaseline': true });
    console.log(`\nTotal baseline questions: ${allBaseline.length}`);

    // Check their tiers
    console.log('\nBaseline questions by tier:');
    allBaseline.forEach(q => {
      console.log(`  ${q.questionId}: tier=${q.tier}, priority=${q.adaptive?.baselinePriority}`);
    });

    // Test the getBaselineQuestions method for standard tier
    console.log('\n--- Testing getBaselineQuestions("standard") ---');
    const standardBaseline = await QuestionBank.getBaselineQuestions('standard');
    console.log(`Returned ${standardBaseline.length} questions`);

    // Show which questions were returned
    console.log('\nQuestions returned:');
    standardBaseline.forEach((q, i) => {
      console.log(
        `  ${i + 1}. ${q.questionId} (tier: ${q.tier}, priority: ${q.adaptive?.baselinePriority})`
      );
    });

    // Check if any baseline questions are being filtered out
    const tierMapping = ['core', 'comprehensive'];
    const filteredOut = allBaseline.filter(q => !tierMapping.includes(q.tier));
    if (filteredOut.length > 0) {
      console.log('\n⚠️ Baseline questions filtered out due to tier:');
      filteredOut.forEach(q => {
        console.log(`  ${q.questionId}: tier=${q.tier}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugBaselineQuestions();
