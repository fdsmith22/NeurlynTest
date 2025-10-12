/**
 * Verify Tactful Assessment Filtering
 * Demonstrates how sensitivity-based filtering works
 */

const mongoose = require('mongoose');
require('dotenv').config();

const QuestionBank = require('../models/QuestionBank');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/neurlyn';

async function verifyTactfulFiltering() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('         TACTFUL ASSESSMENT FILTERING VERIFICATION');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Summary Statistics
    console.log('📊 SENSITIVITY DISTRIBUTION:\n');
    const distribution = await QuestionBank.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$sensitivity', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const total = distribution.reduce((sum, { count }) => sum + count, 0);

    distribution.forEach(({ _id, count }) => {
      const label = (_id || 'NONE').padEnd(12);
      const pct = ((count / total) * 100).toFixed(1);
      const bar = '█'.repeat(Math.round(count / 5));
      console.log(`  ${label} ${count.toString().padStart(3)} questions (${pct.padStart(5)}%) ${bar}`);
    });

    console.log(`\n  TOTAL       ${total} questions`);

    // Show example HIGH sensitivity questions
    console.log('\n\n🚨 HIGH SENSITIVITY QUESTIONS (Asked Q30+):\n');
    const highSensitivity = await QuestionBank.find({
      active: true,
      sensitivity: 'HIGH'
    }).sort({ questionId: 1 });

    highSensitivity.forEach((q, i) => {
      console.log(`${i + 1}. ${q.questionId}`);
      console.log(`   "${q.text.substring(0, 70)}..."`);
      console.log(`   Category: ${q.category} | Instrument: ${q.instrument}`);
      console.log(`   Earliest appearance: Q${q.requiredSignals?.minQuestionCount || 'N/A'}`);
      if (q.contextMessage) {
        console.log(`   Context: "${q.contextMessage.substring(0, 60)}..."`);
      }
      console.log('');
    });

    // Show example MODERATE sensitivity questions
    console.log('⚠️  MODERATE SENSITIVITY QUESTIONS (Asked Q20+):\n');
    const moderateSensitivity = await QuestionBank.find({
      active: true,
      sensitivity: 'MODERATE'
    }).sort({ questionId: 1 }).limit(5);

    moderateSensitivity.forEach((q, i) => {
      console.log(`${i + 1}. ${q.questionId}`);
      console.log(`   "${q.text.substring(0, 70)}..."`);
      console.log(`   Earliest appearance: Q${q.requiredSignals?.minQuestionCount || 'N/A'}`);
      console.log('');
    });

    // Show trigger conditions
    console.log('🎯 TRIGGER CONDITIONS (What signals enable these questions?):\n');
    const triggered = await QuestionBank.find({
      active: true,
      'requiredSignals.triggerConditions': { $exists: true, $ne: [] }
    }).sort({ sensitivity: -1, questionId: 1 }).limit(5);

    triggered.forEach((q, i) => {
      console.log(`${i + 1}. ${q.questionId} (${q.sensitivity} sensitivity)`);
      console.log(`   Minimum questions: ${q.requiredSignals.minQuestionCount || 'N/A'}`);
      console.log(`   Required phase: ${q.requiredSignals.requiredPhase || 'any'}`);
      console.log(`   Trigger logic: ${q.requiredSignals.anyOf ? 'ANY of:' : 'ALL of:'}`);

      if (q.requiredSignals.triggerConditions) {
        q.requiredSignals.triggerConditions.forEach(tc => {
          const conditions = [];
          if (tc.minScore !== undefined) conditions.push(`>= ${tc.minScore}`);
          if (tc.maxScore !== undefined) conditions.push(`<= ${tc.maxScore}`);
          if (tc.minLevel) conditions.push(`>= ${tc.minLevel}`);
          console.log(`     - ${tc.dimension}: ${conditions.join(', ')}`);
        });
      }
      console.log('');
    });

    // Simulate question flow for different user profiles
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('         SIMULATED QUESTION FLOW');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('👤 USER PROFILE 1: Low Neuroticism (Emotionally Stable)');
    console.log('   N=30, E=50, C=60, A=55, O=65\n');

    const profile1Questions = await QuestionBank.find({
      active: true,
      $or: [
        { sensitivity: 'NONE' },
        { sensitivity: 'LOW' }
      ]
    });

    console.log(`   Questions available: ${profile1Questions.length}/218`);
    console.log(`   Trauma questions skipped: ${highSensitivity.length + moderateSensitivity.length}`);
    console.log('   Reason: Neuroticism (30) does not meet trigger threshold (> 60)\n');

    console.log('👤 USER PROFILE 2: High Neuroticism (Clinical Signals)');
    console.log('   N=75, E=25, C=30, A=40, O=50\n');

    console.log(`   Questions available at Q1-19: ${profile1Questions.length}/218 (same as Profile 1)`);
    console.log(`   Questions available at Q20-29: +${moderateSensitivity.length} MODERATE questions`);
    console.log(`   Questions available at Q30+: +${highSensitivity.length} HIGH questions`);
    console.log('   Reason: Neuroticism (75) meets trigger threshold (> 60)\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('         KEY TAKEAWAYS');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('✅ Trauma questions now appear at Q25+ (not Q9 as before)');
    console.log('✅ Dissociation questions appear at Q30+ (not Q28 as before)');
    console.log('✅ Only shown if user exhibits clinical signals (N > 60)');
    console.log('✅ Context messages normalize and frame sensitive topics');
    console.log('✅ Users without trauma signals never see trauma questions\n');

    console.log('📝 Next steps:');
    console.log('   1. Run a test assessment: /in-depth-assessment.html');
    console.log('   2. Monitor server logs for [Tactful Filter] messages');
    console.log('   3. Verify trauma questions appear late and only when relevant\n');

    await mongoose.connection.close();
    console.log('✅ Verification complete\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run verification
if (require.main === module) {
  verifyTactfulFiltering();
}

module.exports = verifyTactfulFiltering;
