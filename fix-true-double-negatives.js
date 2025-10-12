const mongoose = require('mongoose');
const QuestionBank = require('./models/QuestionBank');

async function fixTrueDoubleNegatives() {
  try {
    await mongoose.connect('mongodb://localhost:27017/neurlyn-test');

    console.log('Fixing true double-negative questions...\n');

    // Define the specific fixes needed
    const fixes = [
      {
        id: 'NEURLYN_MASKING_128',
        oldText: "I don't know who I really am beneath the mask",
        newText: "I know who I really am beneath the mask",
        reversed: true,
        reason: 'Double negative with frequency scale'
      },
      {
        id: 'NEURLYN_MASKING_133',
        oldText: "I've trained myself not to show excitement physically",
        newText: "I show excitement physically when I feel it",
        reversed: true,
        reason: 'Double negative with frequency scale'
      },
      {
        id: 'NEURLYN_EMOTIONAL_145',
        oldText: "I don't notice I'm stressed until I'm overwhelmed",
        newText: "I notice when I'm becoming stressed before I'm overwhelmed",
        reversed: true,
        reason: 'Double negative with frequency scale'
      }
    ];

    let fixedCount = 0;

    for (const fix of fixes) {
      const question = await QuestionBank.findOne({ questionId: fix.id });

      if (!question) {
        console.log(`⚠️  Question ${fix.id} not found`);
        continue;
      }

      console.log(`Fixing ${fix.id}:`);
      console.log(`  Old: "${question.text}"`);

      question.text = fix.newText;
      question.reversed = fix.reversed;

      await question.save();

      console.log(`  New: "${question.text}"`);
      console.log(`  Reversed: ${question.reversed}`);
      console.log(`  Reason: ${fix.reason}\n`);

      fixedCount++;
    }

    console.log(`\n✅ Fixed ${fixedCount} questions with true double negatives`);
    console.log('\nNOTE: The other flagged questions are acceptable because phrases like');
    console.log('"I struggle to..." or "I have difficulty..." clearly describe the');
    console.log('frequency of experiencing that difficulty.');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixTrueDoubleNegatives();
