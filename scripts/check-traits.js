const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

async function checkTraits() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get a sample of questions and their traits
    const questions = await QuestionBank.find({}).select('questionId trait category').limit(20);

    console.log('\nSample questions and their traits:');
    questions.forEach(q => {
      console.log(`  ${q.questionId}: trait='${q.trait || 'undefined'}', category='${q.category}'`);
    });

    // Count questions by trait
    const traitCounts = await QuestionBank.aggregate([
      { $group: { _id: '$trait', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\nQuestions by trait:');
    traitCounts.forEach(t => {
      console.log(`  ${t._id || 'undefined'}: ${t.count} questions`);
    });

    // Check for missing traits
    const missingTraits = await QuestionBank.countDocuments({
      $or: [{ trait: null }, { trait: '' }, { trait: { $exists: false } }]
    });

    console.log(`\nQuestions missing trait field: ${missingTraits}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkTraits();
