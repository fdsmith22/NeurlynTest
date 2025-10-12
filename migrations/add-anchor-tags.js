/**
 * Migration: Add 'anchor' and 'high_loading' tags
 * Tags the highest-quality questions per trait for Stage 1 selection
 */

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

async function addAnchorTags() {
  try {
    await mongoose.connect('mongodb://localhost:27017/neurlyn-test');
    console.log('Connected to neurlyn-test database\n');

    const bigFiveTraits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    let totalTagged = 0;

    console.log('=== ADDING ANCHOR TAGS TO HIGHEST-QUALITY QUESTIONS ===\n');

    for (const trait of bigFiveTraits) {
      // Find top 3 questions with highest discriminationIndex for this trait
      const topQuestions = await QuestionBank.find({
        category: 'personality',
        trait: trait,
        'adaptive.discriminationIndex': { $exists: true }
      })
      .sort({ 'adaptive.discriminationIndex': -1 })
      .limit(3);

      console.log(`${trait.toUpperCase()}:`);

      for (const question of topQuestions) {
        // Add 'anchor' and 'high_loading' tags if not already present
        const currentTags = question.tags || [];
        const newTags = [...new Set([...currentTags, 'anchor', 'high_loading'])];

        await QuestionBank.updateOne(
          { _id: question._id },
          { $set: { tags: newTags } }
        );

        console.log(`  ✓ ${question.questionId} (discrimination: ${question.adaptive.discriminationIndex})`);
        totalTagged++;
      }
      console.log('');
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total questions tagged: ${totalTagged} (3 per trait × 5 traits)`);

    // Verification
    const anchorCount = await QuestionBank.countDocuments({ tags: 'anchor' });
    const highLoadingCount = await QuestionBank.countDocuments({ tags: 'high_loading' });

    console.log(`\n=== VERIFICATION ===`);
    console.log(`Questions with 'anchor' tag: ${anchorCount}`);
    console.log(`Questions with 'high_loading' tag: ${highLoadingCount}`);

    console.log(`\n✅ MIGRATION COMPLETE`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

addAnchorTags();
