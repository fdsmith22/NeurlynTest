/**
 * Deep Question Bank Analysis Script
 * Analyzes question distribution, quality, coverage gaps
 */

const mongoose = require('mongoose');
const QuestionBank = require('./models/QuestionBank');

async function analyzeQuestionBank() {
  try {
    await mongoose.connect('mongodb://localhost:27017/neurlyn-test');
    console.log('Connected to neurlyn-test database\n');

    // 1. Overall Statistics
    console.log('=== OVERALL STATISTICS ===');
    const totalQuestions = await QuestionBank.countDocuments();
    const activeQuestions = await QuestionBank.countDocuments({ active: true });
    console.log(`Total Questions: ${totalQuestions}`);
    console.log(`Active Questions: ${activeQuestions}`);
    console.log(`Inactive Questions: ${totalQuestions - activeQuestions}\n`);

    // 2. Category Distribution
    console.log('=== CATEGORY DISTRIBUTION ===');
    const categoryStats = await QuestionBank.aggregate([
      { $group: { _id: '$category', total: { $sum: 1 }, active: { $sum: { $cond: ['$active', 1, 0] } } } },
      { $sort: { total: -1 } }
    ]);
    categoryStats.forEach(stat => {
      console.log(`${stat._id}: ${stat.active}/${stat.total} active (${((stat.active/stat.total)*100).toFixed(1)}%)`);
    });
    console.log('');

    // 3. Discrimination Index Analysis
    console.log('=== DISCRIMINATION INDEX QUALITY ===');
    const discStats = await QuestionBank.aggregate([
      { $match: { discriminationIndex: { $exists: true, $ne: null } } },
      { $group: {
        _id: null,
        avg: { $avg: '$discriminationIndex' },
        min: { $min: '$discriminationIndex' },
        max: { $max: '$discriminationIndex' },
        count: { $sum: 1 }
      }}
    ]);
    if (discStats.length > 0) {
      const d = discStats[0];
      console.log(`Average: ${d.avg.toFixed(3)} | Min: ${d.min} | Max: ${d.max} | Count: ${d.count}`);

      // Quality distribution
      const highQuality = await QuestionBank.countDocuments({ discriminationIndex: { $gte: 0.7 } });
      const mediumQuality = await QuestionBank.countDocuments({ discriminationIndex: { $gte: 0.5, $lt: 0.7 } });
      const lowQuality = await QuestionBank.countDocuments({ discriminationIndex: { $lt: 0.5 } });
      console.log(`High Quality (≥0.7): ${highQuality}`);
      console.log(`Medium Quality (0.5-0.7): ${mediumQuality}`);
      console.log(`Low Quality (<0.5): ${lowQuality}`);
    } else {
      console.log('No discriminationIndex data found');
    }
    console.log('');

    // 4. Personality Facet Coverage
    console.log('=== PERSONALITY FACET COVERAGE ===');
    const facetStats = await QuestionBank.aggregate([
      { $match: { category: 'personality', active: true } },
      { $group: { _id: { trait: '$trait', facet: '$facet' }, count: { $sum: 1 } } },
      { $sort: { '_id.trait': 1, '_id.facet': 1 } }
    ]);

    const facetMap = {};
    facetStats.forEach(stat => {
      if (stat._id.trait && stat._id.facet) {
        if (!facetMap[stat._id.trait]) facetMap[stat._id.trait] = {};
        facetMap[stat._id.trait][stat._id.facet] = stat.count;
      }
    });

    const expectedFacets = {
      openness: ['fantasy', 'aesthetics', 'feelings', 'actions', 'ideas', 'values'],
      conscientiousness: ['competence', 'order', 'dutifulness', 'achievement_striving', 'self_discipline', 'deliberation'],
      extraversion: ['warmth', 'gregariousness', 'assertiveness', 'activity', 'excitement_seeking', 'positive_emotions'],
      agreeableness: ['trust', 'straightforwardness', 'altruism', 'compliance', 'modesty', 'tender_mindedness'],
      neuroticism: ['anxiety', 'angry_hostility', 'depression', 'self_consciousness', 'impulsiveness', 'vulnerability']
    };

    for (const [trait, facets] of Object.entries(expectedFacets)) {
      console.log(`\n${trait.toUpperCase()}:`);
      facets.forEach(facet => {
        const count = facetMap[trait]?.[facet] || 0;
        const status = count === 0 ? '❌ MISSING' : count < 3 ? '⚠️  LOW' : '✓';
        console.log(`  ${status} ${facet}: ${count} questions`);
      });
    }
    console.log('');

    // 5. Clinical Instrument Coverage
    console.log('=== CLINICAL INSTRUMENT COVERAGE ===');
    const clinicalStats = await QuestionBank.aggregate([
      { $match: { category: 'clinical', active: true } },
      { $group: { _id: '$instrument', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    clinicalStats.forEach(stat => {
      console.log(`${stat._id || 'No instrument'}: ${stat.count} questions`);
    });
    console.log('');

    // 6. Neurodiversity Coverage
    console.log('=== NEURODIVERSITY COVERAGE ===');
    const neuroStats = await QuestionBank.aggregate([
      { $match: { category: 'neurodiversity', active: true } },
      { $group: { _id: '$subcategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    neuroStats.forEach(stat => {
      console.log(`${stat._id || 'No subcategory'}: ${stat.count} questions`);
    });
    console.log('');

    // 7. Response Type Distribution
    console.log('=== RESPONSE TYPE DISTRIBUTION ===');
    const responseTypeStats = await QuestionBank.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$responseType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    responseTypeStats.forEach(stat => {
      console.log(`${stat._id || 'No responseType'}: ${stat.count} questions`);
    });
    console.log('');

    // 8. Reverse Scoring Analysis
    console.log('=== REVERSE SCORING ANALYSIS ===');
    const reverseScored = await QuestionBank.countDocuments({ reverseScored: true, active: true });
    const notReverseScored = await QuestionBank.countDocuments({ reverseScored: false, active: true });
    console.log(`Reverse Scored: ${reverseScored}`);
    console.log(`Not Reverse Scored: ${notReverseScored}`);
    console.log(`Reverse Scored %: ${((reverseScored/(reverseScored+notReverseScored))*100).toFixed(1)}%\n`);

    // 9. Baseline Questions
    console.log('=== BASELINE QUESTIONS ===');
    const baselineCount = await QuestionBank.countDocuments({ baseline: true, active: true });
    console.log(`Total Baseline Questions: ${baselineCount}`);
    const baselineByTrait = await QuestionBank.aggregate([
      { $match: { baseline: true, active: true, category: 'personality' } },
      { $group: { _id: '$trait', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    baselineByTrait.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} baseline questions`);
    });
    console.log('');

    // 10. Gap Analysis
    console.log('=== COVERAGE GAPS IDENTIFIED ===');
    const gaps = [];

    // Check for missing facets
    for (const [trait, facets] of Object.entries(expectedFacets)) {
      facets.forEach(facet => {
        const count = facetMap[trait]?.[facet] || 0;
        if (count === 0) {
          gaps.push(`❌ CRITICAL: ${trait}.${facet} has 0 questions`);
        } else if (count < 3) {
          gaps.push(`⚠️  WARNING: ${trait}.${facet} has only ${count} question(s) (recommend 3+)`);
        }
      });
    }

    // Check discriminationIndex coverage
    const missingDiscIndex = await QuestionBank.countDocuments({
      discriminationIndex: { $exists: false },
      active: true
    });
    if (missingDiscIndex > 0) {
      gaps.push(`⚠️  ${missingDiscIndex} active questions missing discriminationIndex`);
    }

    if (gaps.length > 0) {
      gaps.forEach(gap => console.log(gap));
    } else {
      console.log('✓ No critical gaps found');
    }

    console.log('\n=== ANALYSIS COMPLETE ===\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

analyzeQuestionBank();
