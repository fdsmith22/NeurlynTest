const mongoose = require('mongoose');
require('./models/QuestionBank');
const QuestionBank = mongoose.model('QuestionBank');

mongoose.connect('mongodb://localhost:27017/neurlyn-test').then(async () => {
  console.log('=== COMPREHENSIVE TIER BASELINE QUESTIONS ===\n');

  // Get baseline questions using the same logic as the model
  const bigFiveTraits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];

  console.log('BIG FIVE BASELINE QUESTIONS (2 per trait):');
  for (const trait of bigFiveTraits) {
    const questions = await QuestionBank.find({
      'adaptive.isBaseline': true,
      trait: trait,
      category: 'personality',
      $or: [{ active: true }, { active: { $exists: false } }]
    }).sort({ 'adaptive.baselinePriority': 1 }).limit(2);

    console.log(`\n${trait.toUpperCase()} (${questions.length}):`);
    questions.forEach(q => {
      console.log(`  ${q.questionId} | ${(q.text || q.questionText || '').substring(0, 70)}`);
    });
  }

  console.log('\n\nNEURODIVERSITY BASELINE QUESTIONS (10):');
  const neuroQuestions = await QuestionBank.find({
    'adaptive.isBaseline': true,
    category: 'neurodiversity',
    $or: [{ active: true }, { active: { $exists: false } }]
  }).sort({ 'adaptive.baselinePriority': 1 }).limit(10);

  neuroQuestions.forEach(q => {
    console.log(`  ${q.questionId} | ${q.trait} | ${q.subcategory} | ${(q.text || q.questionText || '').substring(0, 60)}`);
  });

  console.log('\n\n=== TOTAL BASELINE COUNT ===');
  const allBaseline = await QuestionBank.find({
    'adaptive.isBaseline': true,
    $or: [{ active: true }, { active: { $exists: false } }]
  });
  console.log('Total baseline questions in database:', allBaseline.length);
  console.log('Expected for comprehensive tier: 20 (10 personality + 10 neurodiversity)');

  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
