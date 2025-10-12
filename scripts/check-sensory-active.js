const mongoose = require('mongoose');
require('../models/QuestionBank');
const QuestionBank = mongoose.model('QuestionBank');

async function checkSensoryActive() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test');

    // Check active field on sensory baseline questions
    const sensory = await QuestionBank.find({
      sensoryDomain: { $exists: true, $ne: null },
      'adaptive.isBaseline': true
    }).select('questionId sensoryDomain active adaptive.baselinePriority tier');

    console.log('Sensory baseline questions in database:');
    sensory.forEach(q => {
      console.log(`  ${q.questionId} | ${q.sensoryDomain} | active: ${q.active} | priority: ${q.adaptive.baselinePriority} | tier: ${q.tier}`);
    });

    console.log(`\nTotal: ${sensory.length}`);

    // Check which don't have active field or have active: false
    const noActive = sensory.filter(q => q.active !== true);
    if (noActive.length > 0) {
      console.log(`\n⚠️  ${noActive.length} questions missing active: true:`);
      noActive.forEach(q => {
        console.log(`  ${q.questionId} | active: ${q.active}`);
      });
    }

    // Also check EF baseline questions
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    const ef = await QuestionBank.find({
      efDomain: { $exists: true, $ne: null },
      'adaptive.isBaseline': true
    }).select('questionId efDomain active adaptive.baselinePriority tier');

    console.log('EF baseline questions in database:');
    ef.forEach(q => {
      console.log(`  ${q.questionId} | ${q.efDomain} | active: ${q.active} | priority: ${q.adaptive.baselinePriority} | tier: ${q.tier}`);
    });

    console.log(`\nTotal: ${ef.length}`);

    const noActiveEF = ef.filter(q => q.active !== true);
    if (noActiveEF.length > 0) {
      console.log(`\n⚠️  ${noActiveEF.length} questions missing active: true:`);
      noActiveEF.forEach(q => {
        console.log(`  ${q.questionId} | active: ${q.active}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSensoryActive();
