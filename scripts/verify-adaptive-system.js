const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

async function verifyAdaptiveSystem() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Check total question count
    const totalQuestions = await QuestionBank.countDocuments({});
    console.log(`\n📊 Total questions in database: ${totalQuestions}`);

    // 2. Check for duplicates
    const allQuestions = await QuestionBank.find({});
    const textMap = new Map();
    allQuestions.forEach(q => {
      if (!textMap.has(q.text)) {
        textMap.set(q.text, []);
      }
      textMap.get(q.text).push(q.questionId);
    });

    const duplicates = Array.from(textMap.entries()).filter(([text, ids]) => ids.length > 1);
    console.log(`\n🔍 Duplicate check:`);
    console.log(`   - Unique question texts: ${textMap.size}`);
    console.log(`   - Duplicate texts found: ${duplicates.length}`);

    // 3. Check baseline questions
    const baselineQuestions = await QuestionBank.find({ 'adaptive.isBaseline': true });
    console.log(`\n🎯 Baseline questions: ${baselineQuestions.length}`);
    if (baselineQuestions.length === 10) {
      console.log('   ✅ Exactly 10 baseline questions as expected');
    } else {
      console.log(`   ⚠️ Expected 10 baseline questions, found ${baselineQuestions.length}`);
    }

    // Show baseline question details
    console.log('\n   Baseline questions by priority:');
    baselineQuestions
      .sort((a, b) => (a.adaptive?.baselinePriority || 999) - (b.adaptive?.baselinePriority || 999))
      .forEach(q => {
        console.log(
          `   ${q.adaptive?.baselinePriority || '?'}. ${q.questionId}: ${q.text.substring(0, 50)}...`
        );
      });

    // 4. Check adaptive questions with triggers
    const questionsWithTriggers = await QuestionBank.find({
      'adaptive.adaptiveCriteria.triggerTraits': { $exists: true, $ne: [] }
    });
    console.log(`\n🧠 Adaptive questions with trigger criteria: ${questionsWithTriggers.length}`);

    // 5. Verify trigger criteria structure
    const sampleTriggers = questionsWithTriggers.slice(0, 3);
    console.log('\n   Sample trigger criteria:');
    sampleTriggers.forEach(q => {
      console.log(`\n   ${q.questionId}:`);
      q.adaptive?.adaptiveCriteria?.triggerTraits?.forEach(trigger => {
        console.log(`     - ${trigger.trait}: ${trigger.minScore}-${trigger.maxScore}`);
      });
    });

    // 6. Test adaptive selection with sample profile
    console.log('\n🧪 Testing adaptive selection with sample profile:');
    const sampleProfile = {
      traits: {
        openness: 0.7,
        conscientiousness: 0.6,
        extraversion: 0.4,
        agreeableness: 0.8,
        neuroticism: 0.5
      },
      patterns: ['high_masking', 'sensory_sensitivity']
    };

    console.log('   Sample profile traits:', sampleProfile.traits);

    // Get baseline question IDs to exclude
    const baselineIds = baselineQuestions.map(q => q.questionId);

    // Call the adaptive selection method
    const adaptiveQuestions = await QuestionBank.getAdaptiveQuestions(
      sampleProfile,
      baselineIds,
      20
    );

    console.log(`\n   Adaptive questions selected: ${adaptiveQuestions.length}`);
    if (adaptiveQuestions.length > 0) {
      console.log('   ✅ Adaptive selection is working!');
      console.log('\n   First 5 selected questions:');
      adaptiveQuestions.slice(0, 5).forEach((q, i) => {
        console.log(`   ${i + 1}. ${q.questionId}: ${q.text.substring(0, 50)}...`);
        if (q.adaptive?.adaptiveCriteria?.triggerTraits?.length > 0) {
          const triggers = q.adaptive.adaptiveCriteria.triggerTraits
            .map(t => `${t.trait}: ${t.minScore}-${t.maxScore}`)
            .join(', ');
          console.log(`      Triggers: ${triggers}`);
        }
      });
    } else {
      console.log('   ⚠️ No adaptive questions selected - check trigger criteria');
    }

    // 7. Check tier distribution
    const tierCounts = {};
    allQuestions.forEach(q => {
      tierCounts[q.tier || 'unknown'] = (tierCounts[q.tier || 'unknown'] || 0) + 1;
    });
    console.log('\n📈 Question distribution by tier:');
    Object.entries(tierCounts).forEach(([tier, count]) => {
      console.log(`   ${tier}: ${count}`);
    });

    console.log('\n✅ Verification complete!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

verifyAdaptiveSystem();
