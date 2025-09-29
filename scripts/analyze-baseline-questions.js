const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

async function analyzeBaselineQuestions() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get baseline questions
    const baseline = await QuestionBank.find({ 'adaptive.isBaseline': true }).sort({
      'adaptive.baselinePriority': 1
    });

    console.log('=== BASELINE QUESTIONS ANALYSIS ===\n');
    console.log(`Total baseline questions: ${baseline.length}\n`);

    // Analyze traits in baseline
    const traitCounts = {};
    baseline.forEach((q, i) => {
      console.log(`${i + 1}. ${q.questionId}`);
      console.log(`   Trait: ${q.trait}`);
      console.log(`   Category: ${q.category}`);
      console.log(`   Text: ${q.text.substring(0, 60)}...`);
      console.log(`   Priority: ${q.adaptive?.baselinePriority}`);
      console.log('');

      traitCounts[q.trait] = (traitCounts[q.trait] || 0) + 1;
    });

    console.log('\n=== TRAIT DISTRIBUTION IN BASELINE ===');
    Object.entries(traitCounts).forEach(([trait, count]) => {
      console.log(`  ${trait}: ${count} questions`);
    });

    // Check Big Five coverage
    const bigFive = [
      'openness',
      'conscientiousness',
      'extraversion',
      'agreeableness',
      'neuroticism'
    ];
    const missingBigFive = bigFive.filter(trait => !traitCounts[trait]);

    if (missingBigFive.length > 0) {
      console.log('\n⚠️ WARNING: Missing Big Five traits in baseline:', missingBigFive.join(', '));
    }

    // Get some Big Five questions to potentially add as baseline
    if (missingBigFive.length > 0) {
      console.log('\n=== SUGGESTED BIG FIVE QUESTIONS FOR BASELINE ===');
      for (const trait of bigFive) {
        const questions = await QuestionBank.find({
          trait: trait,
          'adaptive.isBaseline': { $ne: true }
        }).limit(2);

        if (questions.length > 0) {
          console.log(`\n${trait.toUpperCase()}:`);
          questions.forEach(q => {
            console.log(`  - ${q.questionId}: "${q.text.substring(0, 50)}..."`);
          });
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

analyzeBaselineQuestions();
