const mongoose = require('mongoose');
const QuestionBank = require('./models/QuestionBank');

async function fixAttachmentQuestion() {
  try {
    await mongoose.connect('mongodb://localhost:27017/neurlyn-test');

    console.log('Searching for problematic attachment question...\n');

    // Find the question with the problematic wording
    const question = await QuestionBank.findOne({
      text: /don't have a consistent way of connecting/i
    });

    if (!question) {
      console.log('Question not found in database.');
      await mongoose.disconnect();
      return;
    }

    console.log('Found question:');
    console.log(`  ID: ${question.questionId}`);
    console.log(`  Current text: "${question.text}"`);
    console.log(`  Response type: ${question.responseType}`);
    console.log(`  Options: ${question.options?.map(o => o.label).join(', ')}\n`);

    // Fix the question by rephrasing it positively
    const oldText = question.text;
    question.text = "I have a consistent way of connecting with others";

    // Since the question is now positive, we need to reverse the scoring
    // Mark it as reversed so the scoring knows to invert the response
    question.reversed = true;

    await question.save();

    console.log('✅ Fixed question:');
    console.log(`  Old: "${oldText}"`);
    console.log(`  New: "${question.text}"`);
    console.log(`  Reversed scoring: ${question.reversed} (so high frequency = secure attachment)\n`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAttachmentQuestion();
