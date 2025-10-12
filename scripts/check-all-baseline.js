const mongoose = require('mongoose');
require('../models/QuestionBank');
const QuestionBank = mongoose.model('QuestionBank');

async function checkAllBaseline() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test');

    // Get ALL baseline questions with priority 2
    const baseline = await QuestionBank.find({
      'adaptive.isBaseline': true,
      'adaptive.baselinePriority': 2,
      tier: { $in: ['core', 'comprehensive', 'specialized'] },
      $or: [
        { active: true },
        { active: { $exists: false } }
      ]
    }).select('questionId category efDomain sensoryDomain adaptive.baselinePriority tier').sort({ 'adaptive.baselinePriority': 1 });

    console.log(`Total baseline questions with priority 2: ${baseline.length}\n`);

    // Group by category
    const byCategory = {};
    baseline.forEach(q => {
      const cat = q.category || 'unknown';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(q);
    });

    Object.entries(byCategory).forEach(([cat, questions]) => {
      console.log(`\n${cat.toUpperCase()}: ${questions.length} questions`);
      questions.forEach(q => {
        const domain = q.efDomain || q.sensoryDomain || 'none';
        console.log(`  ${q.questionId} | ${domain} | tier: ${q.tier}`);
      });
    });

    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`Total baseline questions (priority 2): ${baseline.length}`);
    console.log(`Limit for 'deep' tier: 15`);
    console.log(`\n⚠️  ${baseline.length - 15} questions will be excluded!\n`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAllBaseline();
