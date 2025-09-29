#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

async function verifyAdaptiveCriteria() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test');
    console.log('Connected to MongoDB');

    // Database Statistics
    const totalQuestions = await QuestionBank.countDocuments();
    const baselineQuestions = await QuestionBank.countDocuments({ 'adaptive.isBaseline': true });
    const questionsWithTriggerTraits = await QuestionBank.countDocuments({
      'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
    });
    const questionsWithTriggerPatterns = await QuestionBank.countDocuments({
      'adaptive.adaptiveCriteria.triggerPatterns.0': { $exists: true }
    });

    console.log('\n=== Database Statistics ===');
    console.log(`Total questions: ${totalQuestions}`);
    console.log(`Questions with adaptive.isBaseline = true: ${baselineQuestions}`);
    console.log(`Questions with triggerTraits populated: ${questionsWithTriggerTraits}`);
    console.log(`Questions with triggerPatterns populated: ${questionsWithTriggerPatterns}`);

    // Baseline Questions
    const baselineQs = await QuestionBank.find(
      { 'adaptive.isBaseline': true },
      {
        questionId: 1,
        text: 1,
        category: 1,
        'adaptive.baselinePriority': 1
      }
    )
      .sort({ 'adaptive.baselinePriority': 1 })
      .lean();

    console.log('\n=== Baseline Questions ===');
    baselineQs.forEach(q => {
      console.log(
        `Priority ${q.adaptive.baselinePriority}: ${q.questionId} (${q.category}) ${q.text.substring(0, 50)}...`
      );
    });

    // Check trait distribution
    const traitDistribution = await QuestionBank.aggregate([
      { $match: { category: 'personality' } },
      { $group: { _id: '$trait', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n=== Personality Trait Distribution ===');
    traitDistribution.forEach(t => {
      console.log(`${t._id}: ${t.count} questions`);
    });

    // Check specific openness questions for debugging
    const opennessQuestions = await QuestionBank.find(
      { trait: 'openness' },
      {
        questionId: 1,
        text: 1,
        trait: 1,
        tier: 1,
        'adaptive.isBaseline': 1,
        'adaptive.baselinePriority': 1,
        'adaptive.adaptiveCriteria.triggerTraits': 1
      }
    )
      .sort({ questionId: 1 })
      .lean();

    console.log('\n=== Openness Questions Debug ===');
    opennessQuestions.forEach((q, index) => {
      console.log(
        `${q.questionId} (index: ${index}, tier: ${q.tier}): isBaseline: ${q.adaptive?.isBaseline}, triggerTraits: ${q.adaptive?.adaptiveCriteria?.triggerTraits?.length || 0}`
      );
      if (q.adaptive?.adaptiveCriteria?.triggerTraits) {
        q.adaptive.adaptiveCriteria.triggerTraits.forEach(t => {
          console.log(`  Trigger: ${t.trait} minScore: ${t.minScore} maxScore: ${t.maxScore}`);
        });
      }
    });

    // Sample Adaptive Questions
    const adaptiveQs = await QuestionBank.find(
      { 'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true } },
      {
        questionId: 1,
        text: 1,
        category: 1,
        trait: 1,
        tier: 1,
        'adaptive.adaptiveCriteria.triggerTraits': 1
      }
    )
      .limit(5)
      .lean();

    console.log('\n=== Sample Adaptive Questions ===');
    adaptiveQs.forEach(q => {
      console.log(
        `${q.questionId} (trait: ${q.trait}, tier: ${q.tier}): ${q.text.substring(0, 40)}...`
      );
      if (q.adaptive.adaptiveCriteria.triggerTraits) {
        q.adaptive.adaptiveCriteria.triggerTraits.forEach(t => {
          console.log(`  Trigger: ${t.trait} minScore: ${t.minScore} maxScore: ${t.maxScore}`);
        });
      }
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');

    process.exit(0);
  } catch (error) {
    console.error('Error verifying adaptive criteria:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  verifyAdaptiveCriteria();
}
