const mongoose = require('mongoose');
const QuestionBank = require('./models/QuestionBank');

async function scanNegativeFrequencyQuestions() {
  try {
    await mongoose.connect('mongodb://localhost:27017/neurlyn-test');

    console.log('Scanning for negative statements with frequency scales...\n');

    // Find all questions with frequency-based Likert scales
    const frequencyQuestions = await QuestionBank.find({
      responseType: 'likert',
      'options.label': { $in: ['Never', 'Always', 'Rarely', 'Often', 'Sometimes'] }
    });

    console.log(`Found ${frequencyQuestions.length} questions with frequency scales\n`);

    // Common negative words/phrases that create double negatives
    const negativePatterns = [
      /\bdon't\b/i,
      /\bdo not\b/i,
      /\bcan't\b/i,
      /\bcannot\b/i,
      /\bwon't\b/i,
      /\bwill not\b/i,
      /\bnever\b/i,
      /\bno\b/i,
      /\bnot\b/i,
      /\bunable\b/i,
      /\bfail\b/i,
      /\black\b/i,
      /\bwithout\b/i,
      /\bdifficulty\b/i,
      /\bstruggle\b/i
    ];

    const problematic = [];

    frequencyQuestions.forEach(q => {
      for (const pattern of negativePatterns) {
        if (pattern.test(q.text)) {
          problematic.push({
            id: q.questionId,
            text: q.text,
            category: q.category,
            subcategory: q.subcategory,
            reversed: q.reversed || false
          });
          break;
        }
      }
    });

    if (problematic.length === 0) {
      console.log('✅ No problematic double-negative questions found!');
    } else {
      console.log(`⚠️  Found ${problematic.length} potentially problematic questions:\n`);

      problematic.forEach((q, index) => {
        console.log(`${index + 1}. ${q.id}`);
        console.log(`   Category: ${q.category} / ${q.subcategory}`);
        console.log(`   Text: "${q.text}"`);
        console.log(`   Reversed: ${q.reversed}`);
        console.log();
      });

      console.log('\nRECOMMENDATION: Review these questions and either:');
      console.log('1. Rephrase positively for frequency scales');
      console.log('2. Change to agreement scale (Strongly Disagree → Strongly Agree)');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

scanNegativeFrequencyQuestions();
