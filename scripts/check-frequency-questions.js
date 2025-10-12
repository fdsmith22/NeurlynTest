const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/neurlyn-test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const QuestionBank = require('../models/QuestionBank');

async function checkFrequencyQuestions() {
  try {
    console.log('Checking frequency-based questions...\n');

    // Find all questions with "how often" in text
    const frequencyQuestions = await QuestionBank.find({
      text: /how often/i
    }).select('questionId instrument text responseType options');

    console.log(`Found ${frequencyQuestions.length} questions with "how often"\n`);

    // Group by instrument
    const byInstrument = {};
    for (const q of frequencyQuestions) {
      if (!byInstrument[q.instrument]) {
        byInstrument[q.instrument] = [];
      }
      byInstrument[q.instrument].push(q);
    }

    // Display results
    for (const [instrument, questions] of Object.entries(byInstrument)) {
      console.log(`\n${instrument} (${questions.length} questions):`);
      console.log(`  Response type: ${questions[0].responseType}`);

      if (questions[0].responseType === 'likert') {
        console.log(`  ⚠️  WARNING: Using likert for frequency question!`);
      } else if (questions[0].responseType === 'multiple-choice' && questions[0].options) {
        console.log(`  ✓ Using multiple-choice with options:`);
        questions[0].options.forEach(opt => {
          console.log(`    - ${opt.label} (${opt.score})`);
        });
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkFrequencyQuestions();
