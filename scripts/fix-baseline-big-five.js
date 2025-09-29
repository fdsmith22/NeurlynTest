const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

async function fixBaselineBigFive() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // First, we'll keep some neurodiversity questions but reduce them
    // And add proper Big Five questions for baseline assessment

    // Step 1: Reset all current baseline questions
    await QuestionBank.updateMany(
      { 'adaptive.isBaseline': true },
      { $set: { 'adaptive.isBaseline': false } }
    );
    console.log('Reset all baseline flags');

    // Step 2: Set up balanced baseline with Big Five + key neurodiversity
    const newBaseline = [
      // Big Five questions (2 per trait = 10 questions)
      { id: 'BFI_OPENNESS_1', priority: 1 },
      { id: 'BFI_OPENNESS_2', priority: 2 },
      { id: 'BFI_CONSCIENTIOUSNESS_9', priority: 3 },
      { id: 'BFI_CONSCIENTIOUSNESS_10', priority: 4 },
      { id: 'BFI_EXTRAVERSION_17', priority: 5 },
      { id: 'BFI_EXTRAVERSION_18', priority: 6 },
      { id: 'BFI_AGREEABLENESS_25', priority: 7 },
      { id: 'BFI_AGREEABLENESS_26', priority: 8 },
      { id: 'BFI_NEUROTICISM_33', priority: 9 },
      { id: 'BFI_NEUROTICISM_34', priority: 10 }
    ];

    // Step 3: Update these questions to be baseline
    for (const item of newBaseline) {
      const result = await QuestionBank.updateOne(
        { questionId: item.id },
        {
          $set: {
            'adaptive.isBaseline': true,
            'adaptive.baselinePriority': item.priority
          }
        }
      );
      console.log(`Updated ${item.id}: ${result.modifiedCount} document(s) modified`);
    }

    // Step 4: Verify the changes
    const baseline = await QuestionBank.find({ 'adaptive.isBaseline': true }).sort({
      'adaptive.baselinePriority': 1
    });

    console.log('\n=== NEW BASELINE QUESTIONS ===');
    baseline.forEach((q, i) => {
      console.log(`${i + 1}. ${q.questionId} (${q.trait}): "${q.text.substring(0, 50)}..."`);
    });

    // Count traits
    const traitCounts = {};
    baseline.forEach(q => {
      traitCounts[q.trait] = (traitCounts[q.trait] || 0) + 1;
    });

    console.log('\n=== TRAIT DISTRIBUTION ===');
    Object.entries(traitCounts).forEach(([trait, count]) => {
      console.log(`  ${trait}: ${count} questions`);
    });

    console.log('\n✅ Baseline questions updated successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixBaselineBigFive();
