const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/neurlyn-test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const QuestionBank = require('../models/QuestionBank');

async function fixPHQ9Questions() {
  try {
    console.log('Fixing PHQ-9 question response types...\n');

    // Proper PHQ-9 frequency response options (same as GAD-7)
    const phq9Options = [
      { label: 'Not at all', value: 0, score: 0 },
      { label: 'Several days', value: 1, score: 1 },
      { label: 'More than half the days', value: 2, score: 2 },
      { label: 'Nearly every day', value: 3, score: 3 }
    ];

    // Find all PHQ-9 questions
    const phq9Questions = await QuestionBank.find({
      instrument: 'PHQ-9'
    });

    console.log(`Found ${phq9Questions.length} PHQ-9 questions\n`);

    for (const question of phq9Questions) {
      console.log(`Updating ${question.questionId}: ${question.text.substring(0, 60)}...`);

      // Update to multiple-choice with frequency options
      question.responseType = 'multiple-choice';
      question.options = phq9Options;

      await question.save();
      console.log(`✓ Updated ${question.questionId}\n`);
    }

    console.log('\n✅ All PHQ-9 questions updated successfully!');
    console.log(`\nUpdated questions now use:`);
    console.log(`  Response Type: multiple-choice`);
    console.log(`  Options:`);
    phq9Options.forEach(opt => {
      console.log(`    - ${opt.label} (score: ${opt.score})`);
    });

  } catch (error) {
    console.error('Error fixing PHQ-9 questions:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

fixPHQ9Questions();
