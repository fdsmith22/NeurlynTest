const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

async function fixBaselineAndThresholds() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Add a 10th baseline question
    const baselineCount = await QuestionBank.countDocuments({ 'adaptive.isBaseline': true });
    console.log(`Current baseline questions: ${baselineCount}`);

    if (baselineCount < 10) {
      // Find a good candidate from personality questions to make baseline
      const candidate = await QuestionBank.findOne({
        'adaptive.isBaseline': { $ne: true },
        category: 'personality',
        questionId: { $regex: /^BFI_/ } // Use a BFI question
      });

      if (candidate) {
        candidate.adaptive.isBaseline = true;
        candidate.adaptive.baselinePriority = 10; // Set as lowest priority baseline
        await candidate.save();
        console.log(`Added baseline question: ${candidate.questionId}`);
      }
    }

    // 2. Fix undefined thresholds
    const questionsWithUndefinedThresholds = await QuestionBank.find({
      'adaptive.adaptiveCriteria.triggerTraits': {
        $elemMatch: {
          $or: [
            { minScore: { $exists: false } },
            { maxScore: { $exists: false } },
            { minScore: undefined },
            { maxScore: undefined }
          ]
        }
      }
    });

    console.log(
      `\nFound ${questionsWithUndefinedThresholds.length} questions with undefined thresholds`
    );

    // Fix each question's thresholds
    for (const question of questionsWithUndefinedThresholds) {
      if (question.adaptive?.adaptiveCriteria?.triggerTraits) {
        question.adaptive.adaptiveCriteria.triggerTraits =
          question.adaptive.adaptiveCriteria.triggerTraits.map(trigger => {
            // Set default thresholds based on trait type
            if (trigger.minScore === undefined || trigger.maxScore === undefined) {
              // Default ranges for different traits
              const defaultRanges = {
                openness: { min: 0.6, max: 1.0 },
                conscientiousness: { min: 0.3, max: 0.7 },
                extraversion: { min: 0.4, max: 0.8 },
                agreeableness: { min: 0.5, max: 0.9 },
                neuroticism: { min: 0.4, max: 0.8 },
                creativity: { min: 0.6, max: 1.0 },
                analytical: { min: 0.5, max: 1.0 },
                empathy: { min: 0.6, max: 1.0 }
              };

              const range = defaultRanges[trigger.trait] || { min: 0.4, max: 0.8 };

              return {
                trait: trigger.trait,
                minScore: trigger.minScore !== undefined ? trigger.minScore : range.min,
                maxScore: trigger.maxScore !== undefined ? trigger.maxScore : range.max
              };
            }
            return trigger;
          });

        await question.save();
      }
    }

    console.log(`Fixed thresholds for ${questionsWithUndefinedThresholds.length} questions`);

    // 3. Verify the fixes
    const finalBaselineCount = await QuestionBank.countDocuments({ 'adaptive.isBaseline': true });
    const finalUndefinedCount = await QuestionBank.countDocuments({
      'adaptive.adaptiveCriteria.triggerTraits': {
        $elemMatch: {
          $or: [{ minScore: { $exists: false } }, { maxScore: { $exists: false } }]
        }
      }
    });

    console.log('\nFinal verification:');
    console.log(`✅ Baseline questions: ${finalBaselineCount}`);
    console.log(`✅ Questions with undefined thresholds: ${finalUndefinedCount}`);

    console.log('\nFixes applied successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixBaselineAndThresholds();
