const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

async function testBaselineQuery() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Test the exact method that's failing
    const tier = 'standard';
    console.log(`Testing getBaselineQuestions('${tier}')...`);

    const result = await QuestionBank.getBaselineQuestions(tier);

    console.log('Result type:', typeof result);
    console.log('Result is array?:', Array.isArray(result));
    console.log('Result:', result);

    if (result) {
      console.log('Result length:', result.length);
      if (result.length > 0) {
        console.log('First item:', result[0]);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testBaselineQuery();
