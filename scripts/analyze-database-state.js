/**
 * Comprehensive Database Analysis
 * Analyzes the current state of the question database and identifies issues
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';
const QuestionBank = require('../models/QuestionBank');

async function analyzeDatabaseState() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');
    console.log('='.repeat(80));
    console.log('                    DATABASE ANALYSIS REPORT');
    console.log('='.repeat(80));

    // 1. Overall Statistics
    console.log('\n📊 OVERALL STATISTICS\n');
    const totalQuestions = await QuestionBank.countDocuments({});
    const activeQuestions = await QuestionBank.countDocuments({ active: true });
    const inactiveQuestions = await QuestionBank.countDocuments({ active: false });

    console.log(`Total Questions: ${totalQuestions}`);
    console.log(`Active Questions: ${activeQuestions}`);
    console.log(`Inactive Questions: ${inactiveQuestions}`);

    // 2. Baseline Questions Analysis
    console.log('\n📋 BASELINE QUESTIONS (Critical for adaptive assessment)\n');
    const baselineQuestions = await QuestionBank.find({
      'adaptive.isBaseline': true,
      active: true
    }).sort({ 'adaptive.baselinePriority': 1 });

    console.log(`Total Baseline Questions: ${baselineQuestions.length}`);
    console.log(`Expected for comprehensive tier: 20`);

    if (baselineQuestions.length < 20) {
      console.log(`⚠️  WARNING: Only ${baselineQuestions.length} baseline questions (need 20)`);
    } else {
      console.log(`✓ Sufficient baseline questions`);
    }

    // Baseline distribution
    const baselineByTrait = {};
    const baselineByInstrument = {};
    baselineQuestions.forEach(q => {
      baselineByTrait[q.trait] = (baselineByTrait[q.trait] || 0) + 1;
      baselineByInstrument[q.instrument] = (baselineByInstrument[q.instrument] || 0) + 1;
    });

    console.log('\nBaseline Distribution by Trait:');
    Object.entries(baselineByTrait).sort().forEach(([trait, count]) => {
      console.log(`  ${trait}: ${count}`);
    });

    console.log('\nBaseline Distribution by Instrument:');
    Object.entries(baselineByInstrument).forEach(([inst, count]) => {
      const isGateway = inst.includes('Gateway');
      console.log(`  ${inst}: ${count}${isGateway ? ' (Gateway)' : ''}`);
    });

    // 3. Questions by Category
    console.log('\n📂 QUESTIONS BY CATEGORY\n');
    const byCategory = await QuestionBank.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    byCategory.forEach(cat => {
      console.log(`  ${cat._id || 'undefined'}: ${cat.count} questions`);
    });

    // 4. Questions by Instrument
    console.log('\n🔬 QUESTIONS BY INSTRUMENT\n');
    const byInstrument = await QuestionBank.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$instrument', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    byInstrument.forEach(inst => {
      console.log(`  ${inst._id || 'undefined'}: ${inst.count} questions`);
    });

    // 5. Neurodiversity Questions Analysis
    console.log('\n🧠 NEURODIVERSITY QUESTIONS\n');

    const sensoryQuestions = await QuestionBank.countDocuments({
      active: true,
      $or: [
        { instrument: { $regex: /sensory/i } },
        { category: 'sensory' },
        { subcategory: 'sensory_processing' }
      ]
    });

    const adhdQuestions = await QuestionBank.countDocuments({
      active: true,
      $or: [
        { instrument: 'ASRS-5' },
        { subcategory: 'executive_function' },
        { tags: 'adhd' }
      ]
    });

    const autismQuestions = await QuestionBank.countDocuments({
      active: true,
      $or: [
        { instrument: 'AQ-10' },
        { subcategory: { $in: ['social_communication', 'masking'] } },
        { tags: 'autism' }
      ]
    });

    const executiveFunctionQuestions = await QuestionBank.countDocuments({
      active: true,
      $or: [
        { instrument: { $regex: /executive/i } },
        { subcategory: 'executive_function' }
      ]
    });

    console.log(`Sensory Processing: ${sensoryQuestions} questions`);
    console.log(`ADHD/Executive Function: ${adhdQuestions} questions`);
    console.log(`Autism Spectrum: ${autismQuestions} questions`);
    console.log(`Executive Function (specific): ${executiveFunctionQuestions} questions`);

    // Check sensory domain coverage
    console.log('\n  Sensory Domain Coverage:');
    const sensoryDomains = ['visual', 'auditory', 'tactile', 'vestibular', 'oral', 'olfactory'];
    for (const domain of sensoryDomains) {
      const count = await QuestionBank.countDocuments({
        active: true,
        trait: domain
      });
      const status = count >= 3 ? '✓' : '⚠️';
      console.log(`  ${status} ${domain}: ${count} questions (minimum 3 recommended)`);
    }

    // 6. Questions by Tier
    console.log('\n🎯 QUESTIONS BY TIER\n');
    const byTier = await QuestionBank.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$tier', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    byTier.forEach(tier => {
      console.log(`  ${tier._id || 'undefined'}: ${tier.count} questions`);
    });

    // 7. Adaptive Question Availability
    console.log('\n⚙️  ADAPTIVE QUESTION POOL\n');
    const adaptiveAvailable = await QuestionBank.countDocuments({
      active: true,
      'adaptive.isBaseline': { $ne: true }
    });

    console.log(`Available for adaptive selection: ${adaptiveAvailable} questions`);
    console.log(`Required for comprehensive (70-20): 50 questions`);

    if (adaptiveAvailable < 50) {
      console.log(`⚠️  WARNING: Only ${adaptiveAvailable} adaptive questions (need 50+ for comprehensive)`);
    } else {
      console.log(`✓ Sufficient adaptive questions`);
    }

    // 8. Data Quality Issues
    console.log('\n🔍 DATA QUALITY CHECKS\n');

    // Missing required fields
    const missingText = await QuestionBank.countDocuments({
      active: true,
      $or: [{ text: null }, { text: '' }]
    });

    const missingCategory = await QuestionBank.countDocuments({
      active: true,
      $or: [{ category: null }, { category: '' }]
    });

    const missingTrait = await QuestionBank.countDocuments({
      active: true,
      $or: [{ trait: null }, { trait: '' }]
    });

    const missingInstrument = await QuestionBank.countDocuments({
      active: true,
      $or: [{ instrument: null }, { instrument: '' }]
    });

    console.log(`Questions missing text: ${missingText}`);
    console.log(`Questions missing category: ${missingCategory}`);
    console.log(`Questions missing trait: ${missingTrait}`);
    console.log(`Questions missing instrument: ${missingInstrument}`);

    // Check for duplicates
    const duplicates = await QuestionBank.aggregate([
      { $match: { active: true } },
      { $group: {
        _id: '$text',
        count: { $sum: 1 },
        ids: { $push: '$questionId' }
      }},
      { $match: { count: { $gt: 1 } } }
    ]);

    if (duplicates.length > 0) {
      console.log(`\n⚠️  Found ${duplicates.length} duplicate question texts:`);
      duplicates.forEach(dup => {
        console.log(`  "${dup._id.substring(0, 60)}..." (${dup.ids.join(', ')})`);
      });
    } else {
      console.log(`✓ No duplicate question texts found`);
    }

    // 9. Correlation and Tags Analysis
    console.log('\n🏷️  METADATA ANALYSIS\n');

    const withCorrelatedTraits = await QuestionBank.countDocuments({
      active: true,
      'adaptive.correlatedTraits': { $exists: true, $ne: [] }
    });

    const withTags = await QuestionBank.countDocuments({
      active: true,
      tags: { $exists: true, $ne: [] }
    });

    console.log(`Questions with correlatedTraits: ${withCorrelatedTraits}`);
    console.log(`Questions with tags: ${withTags}`);

    // Check sensory questions specifically
    const sensoryWithCorrelation = await QuestionBank.countDocuments({
      active: true,
      instrument: { $regex: /sensory/i },
      'adaptive.correlatedTraits': { $exists: true, $ne: [] }
    });

    console.log(`Sensory questions with correlatedTraits: ${sensoryWithCorrelation}/${sensoryQuestions}`);

    if (sensoryWithCorrelation < sensoryQuestions) {
      console.log(`⚠️  ${sensoryQuestions - sensoryWithCorrelation} sensory questions missing correlatedTraits`);
    }

    // 10. Assessment Capacity Analysis
    console.log('\n📈 ASSESSMENT CAPACITY\n');

    console.log('Can support:');
    console.log(`  Quick (20 questions): ${baselineQuestions.length >= 8 && adaptiveAvailable >= 12 ? '✓ Yes' : '✗ No'}`);
    console.log(`  Standard (30 questions): ${baselineQuestions.length >= 10 && adaptiveAvailable >= 20 ? '✓ Yes' : '✗ No'}`);
    console.log(`  Comprehensive (70 questions): ${baselineQuestions.length >= 20 && adaptiveAvailable >= 50 ? '✓ Yes' : '✗ No'}`);

    // 11. Recommendations
    console.log('\n💡 RECOMMENDATIONS\n');

    const recommendations = [];

    if (baselineQuestions.length < 20) {
      recommendations.push(`Add ${20 - baselineQuestions.length} more baseline questions`);
    }

    if (adaptiveAvailable < 50) {
      recommendations.push(`Add ${50 - adaptiveAvailable} more adaptive questions for comprehensive tier`);
    }

    if (sensoryQuestions < 18) {
      recommendations.push(`Add more sensory processing questions (current: ${sensoryQuestions}, recommended: 18+)`);
    }

    sensoryDomains.forEach(domain => {
      const count = baselineQuestions.filter(q => q.trait === domain).length;
      if (count < 3) {
        recommendations.push(`Add more ${domain} sensory questions (current: ${count}, minimum: 3)`);
      }
    });

    if (missingText > 0) {
      recommendations.push(`Fix ${missingText} questions with missing text`);
    }

    if (missingCategory > 0 || missingTrait > 0 || missingInstrument > 0) {
      recommendations.push('Add missing metadata fields to questions');
    }

    if (sensoryWithCorrelation < sensoryQuestions) {
      recommendations.push(`Add correlatedTraits to ${sensoryQuestions - sensoryWithCorrelation} sensory questions`);
    }

    if (recommendations.length === 0) {
      console.log('✓ Database is in good shape! No critical issues found.');
    } else {
      recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('                       ANALYSIS COMPLETE');
    console.log('='.repeat(80) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

analyzeDatabaseState();
