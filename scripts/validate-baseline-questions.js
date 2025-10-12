const mongoose = require('mongoose');
require('../models/QuestionBank');
const QuestionBank = mongoose.model('QuestionBank');

async function validateBaseline() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test');

    console.log('🔍 Validating Baseline Question Selection\n');

    // Get baseline questions for deep tier
    const baseline = await QuestionBank.getBaselineQuestions('deep');

    console.log(`Total baseline questions returned: ${baseline.length}\n`);

    // Count by EF domain
    const efDomains = {};
    baseline.forEach(q => {
      if (q.efDomain) {
        efDomains[q.efDomain] = (efDomains[q.efDomain] || 0) + 1;
      }
    });

    console.log('Executive Function domains in baseline:');
    if (Object.keys(efDomains).length === 0) {
      console.log('  ❌ NO EF QUESTIONS IN BASELINE');
    } else {
      Object.entries(efDomains).forEach(([domain, count]) => {
        console.log(`  ✓ ${domain}: ${count} questions`);
      });
    }

    // Count by sensory domain
    const sensoryDomains = {};
    baseline.forEach(q => {
      if (q.sensoryDomain) {
        sensoryDomains[q.sensoryDomain] = (sensoryDomains[q.sensoryDomain] || 0) + 1;
      }
    });

    console.log('\nSensory domains in baseline:');
    if (Object.keys(sensoryDomains).length === 0) {
      console.log('  ❌ NO SENSORY QUESTIONS IN BASELINE');
    } else {
      Object.entries(sensoryDomains).forEach(([domain, count]) => {
        console.log(`  ✓ ${domain}: ${count} questions`);
      });
    }

    // Count by category
    const categories = {};
    baseline.forEach(q => {
      categories[q.category] = (categories[q.category] || 0) + 1;
    });

    console.log('\nQuestions by category:');
    Object.entries(categories).sort((a,b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });

    // Expected counts
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('VALIDATION RESULTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const efCount = Object.keys(efDomains).length;
    const sensoryCount = Object.keys(sensoryDomains).length;
    const totalEFQuestions = Object.values(efDomains).reduce((a,b) => a+b, 0);
    const totalSensoryQuestions = Object.values(sensoryDomains).reduce((a,b) => a+b, 0);

    console.log(`EF domains covered: ${efCount}/8`);
    console.log(`  ${efCount === 8 ? '✅ PASS' : '❌ FAIL'} - Expected 8 domains`);
    console.log(`  Total EF questions: ${totalEFQuestions}`);

    console.log(`\nSensory domains covered: ${sensoryCount}/6`);
    console.log(`  ${sensoryCount === 6 ? '✅ PASS' : '❌ FAIL'} - Expected 6 domains`);
    console.log(`  Total sensory questions: ${totalSensoryQuestions}`);

    console.log(`\nTotal neurodiversity baseline: ${totalEFQuestions + totalSensoryQuestions}`);
    console.log(`  ${totalEFQuestions + totalSensoryQuestions >= 20 ? '✅ PASS' : '❌ FAIL'} - Expected >= 20 questions\n`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

validateBaseline();
