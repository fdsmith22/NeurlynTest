const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/neurlyn-test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const QuestionBank = require('../models/QuestionBank');

async function fixGAD7Questions() {
  try {
    console.log('Fixing GAD-7 question response types...\n');

    // Proper GAD-7 frequency response options
    const gad7Options = [
      { label: 'Not at all', value: 0, score: 0 },
      { label: 'Several days', value: 1, score: 1 },
      { label: 'More than half the days', value: 2, score: 2 },
      { label: 'Nearly every day', value: 3, score: 3 }
    ];

    // Find all GAD-7 questions
    const gad7Questions = await QuestionBank.find({
      instrument: 'GAD-7'
    });

    console.log(`Found ${gad7Questions.length} GAD-7 questions\n`);

    for (const question of gad7Questions) {
      console.log(`Updating ${question.questionId}: ${question.text.substring(0, 60)}...`);

      // Update to multiple-choice with frequency options
      question.responseType = 'multiple-choice';
      question.options = gad7Options;

      await question.save();
      console.log(`✓ Updated ${question.questionId}\n`);
    }

    console.log('\n✅ All GAD-7 questions updated successfully!');
    console.log(`\nUpdated questions now use:`);
    console.log(`  Response Type: multiple-choice`);
    console.log(`  Options:`);
    gad7Options.forEach(opt => {
      console.log(`    - ${opt.label} (score: ${opt.score})`);
    });

  } catch (error) {
    console.error('Error fixing GAD-7 questions:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

fixGAD7Questions();
