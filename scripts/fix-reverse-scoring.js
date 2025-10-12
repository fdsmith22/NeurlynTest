#!/usr/bin/env node

/**
 * Fix for Reverse Scoring in Baseline Analysis
 *
 * This script demonstrates the fix needed in comprehensive-adaptive-selector.js
 * The analyzeBaselineProfile method needs to:
 * 1. Look up the actual baseline questions from the database
 * 2. Apply reverse scoring where needed (score = 6 - score)
 * 3. Then calculate averages
 */

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

const MONGODB_URI = 'mongodb://localhost:27017/neurlyn-test';

/**
 * FIXED VERSION of analyzeBaselineProfile
 * This shows what the method should do
 */
async function analyzeBaselineProfileFixed(responses) {
  const profile = {
    bigFive: { openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 },
    neurodiversity: { executive: 0, sensory: 0, social: 0, attention: 0 },
    patterns: [],
    triggers: new Set(),
    variance: {},
    domainScores: {}
  };

  // Step 1: Look up all baseline questions to get reverseScored flags
  const questionIds = responses.map(r => r.questionId);
  const questions = await QuestionBank.find(
    { questionId: { $in: questionIds } },
    { questionId: 1, trait: 1, subcategory: 1, reverseScored: 1, category: 1 }
  );

  // Create a map for quick lookup
  const questionMap = {};
  questions.forEach(q => {
    questionMap[q.questionId] = q;
  });

  // Step 2: Apply reverse scoring to responses
  const scoredResponses = responses.map(resp => {
    const question = questionMap[resp.questionId];
    let score = resp.score || 3;

    // Apply reverse scoring if needed
    if (question && question.reverseScored) {
      score = 6 - score;
      console.log(`  Reversed ${resp.questionId}: ${resp.score} → ${score}`);
    }

    return {
      ...resp,
      actualScore: score,
      trait: resp.trait || question?.trait,
      category: resp.category || question?.category,
      subcategory: resp.subcategory || question?.subcategory
    };
  });

  // Step 3: Group responses by domain
  const domains = {};
  scoredResponses.forEach(resp => {
    const domain = resp.category || 'general';
    if (!domains[domain]) domains[domain] = [];
    domains[domain].push(resp.actualScore);
  });

  // Calculate domain averages and variance
  Object.entries(domains).forEach(([domain, scores]) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = calculateVariance(scores);

    profile.domainScores[domain] = avg;
    profile.variance[domain] = variance;

    // Map domains to Big Five
    if (domain === 'personality') {
      scoredResponses.forEach(resp => {
        if (resp.trait && profile.bigFive.hasOwnProperty(resp.trait)) {
          if (!Array.isArray(profile.bigFive[resp.trait])) {
            profile.bigFive[resp.trait] = [];
          }
          profile.bigFive[resp.trait].push(resp.actualScore);
        }
      });
    }

    // Calculate neurodiversity indicators
    if (domain === 'neurodiversity') {
      scoredResponses.forEach(resp => {
        const subcat = resp.subcategory || '';
        if (subcat.includes('executive')) {
          profile.neurodiversity.executive = Math.max(profile.neurodiversity.executive, resp.actualScore);
        } else if (subcat.includes('sensory')) {
          profile.neurodiversity.sensory = Math.max(profile.neurodiversity.sensory, resp.actualScore);
        } else if (subcat.includes('social')) {
          profile.neurodiversity.social = Math.max(profile.neurodiversity.social, resp.actualScore);
        } else if (subcat.includes('attention')) {
          profile.neurodiversity.attention = Math.max(profile.neurodiversity.attention, resp.actualScore);
        }
      });
    }
  });

  // Average Big Five scores
  Object.keys(profile.bigFive).forEach(trait => {
    if (Array.isArray(profile.bigFive[trait]) && profile.bigFive[trait].length > 0) {
      const scores = profile.bigFive[trait];
      profile.bigFive[trait] = scores.reduce((a, b) => a + b, 0) / scores.length;
    } else {
      profile.bigFive[trait] = 3; // neutral if no data
    }
  });

  return profile;
}

function calculateVariance(scores) {
  if (scores.length < 2) return 0;
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const squaredDiffs = scores.map(score => Math.pow(score - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / scores.length;
}

async function testReverseScoringFix() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    console.log('='.repeat(80));
    console.log('REVERSE SCORING FIX TEST');
    console.log('='.repeat(80));

    // Test profile with reverse-scored questions
    const testResponses = [
      { questionId: 'BASELINE_NEUROTICISM_1', category: 'personality', trait: 'neuroticism', score: 5 },
      { questionId: 'BASELINE_NEUROTICISM_2', category: 'personality', trait: 'neuroticism', score: 1 }, // REVERSED
    ];

    console.log('\nTest Responses:');
    console.log('  BASELINE_NEUROTICISM_1: score 5 (normal)');
    console.log('  BASELINE_NEUROTICISM_2: score 1 (reversed)');

    console.log('\nExpected:');
    console.log('  BASELINE_NEUROTICISM_2 should be reversed: 6 - 1 = 5');
    console.log('  Average: (5 + 5) / 2 = 5.0');

    console.log('\nApplying reverse scoring...');
    const profile = await analyzeBaselineProfileFixed(testResponses);

    console.log('\n✅ Result:');
    console.log(`  Neuroticism score: ${profile.bigFive.neuroticism.toFixed(2)}`);

    if (Math.abs(profile.bigFive.neuroticism - 5.0) < 0.01) {
      console.log('\n🎉 SUCCESS: Reverse scoring working correctly!');
    } else {
      console.log('\n❌ FAILURE: Reverse scoring not working');
    }

    console.log('\n' + '='.repeat(80));
    console.log('CODE FIX NEEDED IN: services/comprehensive-adaptive-selector.js');
    console.log('METHOD: analyzeBaselineProfile');
    console.log('='.repeat(80));
    console.log('\nThe method needs to:');
    console.log('1. Look up baseline questions from database');
    console.log('2. Check reverseScored flag for each question');
    console.log('3. Apply reverse scoring: score = 6 - score');
    console.log('4. Then calculate averages');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

testReverseScoringFix();
