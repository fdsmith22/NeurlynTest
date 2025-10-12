const mongoose = require('mongoose');
require('./models/QuestionBank');
const QuestionBank = mongoose.model('QuestionBank');

mongoose.connect('mongodb://localhost:27017/neurlyn-test').then(async () => {
  const baselineQuestions = await QuestionBank.find({ isBaseline: true, active: true }).sort({ questionId: 1 });
  console.log('=== BASELINE QUESTIONS (' + baselineQuestions.length + ' total) ===\n');

  const byCategory = {};
  baselineQuestions.forEach(q => {
    const cat = q.category || 'unknown';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push({
      id: q.questionId,
      trait: q.trait,
      subcategory: q.subcategory,
      text: (q.text || q.questionText || '').substring(0, 70)
    });
  });

  Object.entries(byCategory).forEach(([cat, questions]) => {
    console.log('\n' + cat.toUpperCase() + ' (' + questions.length + '):');
    questions.forEach(q => {
      console.log('  - ' + q.id + ' | ' + q.trait + ' | ' + q.text);
    });
  });

  console.log('\n\n=== SUMMARY ===');
  console.log('Total baseline questions:', baselineQuestions.length);
  console.log('By category:', Object.entries(byCategory).map(([cat, q]) => cat + ': ' + q.length).join(', '));

  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
