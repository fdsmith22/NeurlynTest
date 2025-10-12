const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/neurlyn-test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const QuestionBank = require('../models/QuestionBank');

async function fixAUDITQuestions() {
  try {
    console.log('Fixing AUDIT question response types...\n');

    // Official AUDIT frequency response options
    const auditFrequencyOptions = [
      { label: 'Never', value: 0, score: 0 },
      { label: 'Monthly or less', value: 1, score: 1 },
      { label: '2-4 times a month', value: 2, score: 2 },
      { label: '2-3 times a week', value: 3, score: 3 },
      { label: '4 or more times a week', value: 4, score: 4 }
    ];

    // Find all AUDIT questions with "how often" in text
    const auditQuestions = await QuestionBank.find({
      instrument: 'AUDIT',
      text: /how often/i
    });

    console.log(`Found ${auditQuestions.length} AUDIT frequency questions\n`);

    for (const question of auditQuestions) {
      console.log(`Updating ${question.questionId}: ${question.text.substring(0, 60)}...`);

      // Update to multiple-choice with AUDIT frequency options
      question.responseType = 'multiple-choice';
      question.options = auditFrequencyOptions;

      await question.save();
      console.log(`✓ Updated ${question.questionId}\n`);
    }

    console.log('\n✅ All AUDIT frequency questions updated successfully!');
    console.log(`\nUpdated questions now use:`);
    console.log(`  Response Type: multiple-choice`);
    console.log(`  Options:`);
    auditFrequencyOptions.forEach(opt => {
      console.log(`    - ${opt.label} (score: ${opt.score})`);
    });

  } catch (error) {
    console.error('Error fixing AUDIT questions:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

fixAUDITQuestions();
