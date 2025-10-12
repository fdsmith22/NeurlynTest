#!/usr/bin/env node

/**
 * Diagnose Archetype Repetition Issue
 * Analyze recent assessments to identify why the same archetype appears repeatedly
 */

const mongoose = require('mongoose');
const AssessmentSession = require('../models/AssessmentSession');
const RUOClassifier = require('../services/ruo-classifier');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

async function diagnoseArchetypeRepetition() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('  ARCHETYPE REPETITION DIAGNOSTIC');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Get the last 10 completed assessments
    const assessments = await AssessmentSession.find({
      phase: 'completed',
      'finalReport.generated': true
    })
      .sort({ completedAt: -1 })
      .limit(10)
      .select('sessionId completedAt finalReport.neurodivergentScreening questionsAnswered');

    if (assessments.length === 0) {
      console.log('❌ No completed assessments found');
      await mongoose.disconnect();
      return;
    }

    console.log(`Found ${assessments.length} recent completed assessments\n`);

    const ruoClassifier = new RUOClassifier();
    const archetypeDistribution = {};
    const scoreVariations = [];

    console.log('Assessment Analysis:\n');
    console.log('ID'.padEnd(35) + '| O  | C  | E  | A  | N  | Archetype       | Conf');
    console.log('─'.repeat(95));

    for (const assessment of assessments) {
      const sessionId = assessment.sessionId;

      // Extract Big Five scores from neurodivergent screening (contains all trait scores)
      const scores = assessment.finalReport?.neurodivergentScreening;

      if (!scores) {
        console.log(`${sessionId.padEnd(35)}| No scores found`);
        continue;
      }

      // The scores might be nested, let me check the structure
      const bigFive = {
        openness: scores.openness || scores.O || 50,
        conscientiousness: scores.conscientiousness || scores.C || 50,
        extraversion: scores.extraversion || scores.E || 50,
        agreeableness: scores.agreeableness || scores.A || 50,
        neuroticism: scores.neuroticism || scores.N || 50
      };

      // Classify using RUO classifier
      const classification = ruoClassifier.classify(bigFive);
      const archetype = classification.primaryType;
      const confidence = classification.confidence.toFixed(2);

      // Track distribution
      if (!archetypeDistribution[archetype]) {
        archetypeDistribution[archetype] = 0;
      }
      archetypeDistribution[archetype]++;

      // Store score variations
      scoreVariations.push({
        sessionId,
        scores: bigFive,
        archetype,
        confidence: parseFloat(confidence),
        fits: classification.profile
      });

      // Display row
      const o = bigFive.openness.toString().padStart(2);
      const c = bigFive.conscientiousness.toString().padStart(2);
      const e = bigFive.extraversion.toString().padStart(2);
      const a = bigFive.agreeableness.toString().padStart(2);
      const n = bigFive.neuroticism.toString().padStart(2);

      console.log(
        `${sessionId.slice(0, 33).padEnd(35)}| ${o} | ${c} | ${e} | ${a} | ${n} | ${archetype.padEnd(15)} | ${confidence}`
      );
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  ARCHETYPE DISTRIBUTION');
    console.log('═══════════════════════════════════════════════════════════\n');

    Object.entries(archetypeDistribution).forEach(([archetype, count]) => {
      const percentage = ((count / assessments.length) * 100).toFixed(1);
      console.log(`${archetype.padEnd(20)} ${count} / ${assessments.length} (${percentage}%)`);
    });

    // Calculate score variation (standard deviation)
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  SCORE VARIATION ANALYSIS');
    console.log('═══════════════════════════════════════════════════════════\n');

    if (scoreVariations.length > 1) {
      const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];

      traits.forEach(trait => {
        const values = scoreVariations.map(s => s.scores[trait]);
        const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;

        console.log(`${trait.padEnd(20)} Mean: ${mean.toFixed(1)} | SD: ${stdDev.toFixed(1)} | Range: ${min}-${max} (${range})`);
      });

      const avgStdDev = traits
        .map(trait => {
          const values = scoreVariations.map(s => s.scores[trait]);
          const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
          const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
          return Math.sqrt(variance);
        })
        .reduce((sum, sd) => sum + sd, 0) / traits.length;

      console.log(`\nAverage Standard Deviation: ${avgStdDev.toFixed(1)}`);

      if (avgStdDev < 5) {
        console.log('⚠️  WARNING: Very low score variation - scores are too similar across assessments');
        console.log('   This suggests either:');
        console.log('   1. Test responses are not varying enough');
        console.log('   2. Scoring algorithm is not sensitive to differences');
      } else if (avgStdDev < 10) {
        console.log('⚠️  CAUTION: Low to moderate score variation - limited diversity in assessments');
      } else {
        console.log('✅ Healthy score variation across assessments');
      }
    }

    // Analyze RUO thresholds
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  RUO THRESHOLD ANALYSIS');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('Current RUO Classification Criteria:\n');

    console.log('RESILIENT:');
    console.log('  - Neuroticism ≤ 40 (gives +40 points)');
    console.log('  - Openness ≥ 45 (gives +15 points)');
    console.log('  - Conscientiousness ≥ 45 (gives +15 points)');
    console.log('  - Extraversion ≥ 45 (gives +15 points)');
    console.log('  - Agreeableness ≥ 45 (gives +15 points)');
    console.log('  Maximum score: 100 | Need: ~40+ to classify as resilient\n');

    console.log('OVERCONTROLLED:');
    console.log('  - Neuroticism ≥ 60 (gives +45 points)');
    console.log('  - Extraversion ≤ 45 (gives +35 points)');
    console.log('  - Conscientiousness ≥ 50 (gives +20 points)');
    console.log('  Maximum score: 100 | Need: ~50+ to classify as overcontrolled\n');

    console.log('UNDERCONTROLLED:');
    console.log('  - Conscientiousness ≤ 40 (gives +50 points)');
    console.log('  - Neuroticism ≥ 50 (gives +30 points)');
    console.log('  - Agreeableness ≤ 45 (gives +20 points)');
    console.log('  Maximum score: 100 | Need: ~50+ to classify as undercontrolled\n');

    // Analyze why assessments are getting same archetype
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  DETAILED FIT SCORE ANALYSIS');
    console.log('═══════════════════════════════════════════════════════════\n');

    if (scoreVariations.length > 0) {
      console.log('Most Recent Assessment Fit Scores:\n');
      const latest = scoreVariations[0];
      console.log(`Session: ${latest.sessionId}`);
      console.log(`Big Five: O=${latest.scores.openness}, C=${latest.scores.conscientiousness}, E=${latest.scores.extraversion}, A=${latest.scores.agreeableness}, N=${latest.scores.neuroticism}`);
      console.log(`\nFit Scores:`);
      console.log(`  Resilient:        ${latest.fits.resilientFit.toFixed(1)}`);
      console.log(`  Overcontrolled:   ${latest.fits.overcontrolledFit.toFixed(1)}`);
      console.log(`  Undercontrolled:  ${latest.fits.undercontrolledFit.toFixed(1)}`);
      console.log(`\nResult: ${latest.archetype} (confidence: ${latest.confidence})`);

      // Calculate average fit scores
      const avgFits = {
        resilient: scoreVariations.reduce((sum, s) => sum + s.fits.resilientFit, 0) / scoreVariations.length,
        overcontrolled: scoreVariations.reduce((sum, s) => sum + s.fits.overcontrolledFit, 0) / scoreVariations.length,
        undercontrolled: scoreVariations.reduce((sum, s) => sum + s.fits.undercontrolledFit, 0) / scoreVariations.length
      };

      console.log(`\nAverage Fit Scores Across All Assessments:`);
      console.log(`  Resilient:        ${avgFits.resilient.toFixed(1)}`);
      console.log(`  Overcontrolled:   ${avgFits.overcontrolled.toFixed(1)}`);
      console.log(`  Undercontrolled:  ${avgFits.undercontrolled.toFixed(1)}`);
    }

    // Diagnosis and recommendations
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  DIAGNOSIS & RECOMMENDATIONS');
    console.log('═══════════════════════════════════════════════════════════\n');

    const allSame = Object.keys(archetypeDistribution).length === 1;
    const majorityResilient = (archetypeDistribution['resilient'] || 0) / assessments.length > 0.7;

    if (allSame) {
      console.log('🔴 CRITICAL ISSUE: All assessments classify as the same archetype');
      console.log('\nLikely causes:');
      console.log('  1. Resilient thresholds are too easy to meet (N ≤ 40 gives 40 points immediately)');
      console.log('  2. Most moderate scores (40-50 range) automatically classify as resilient');
      console.log('  3. The scoring algorithm heavily favors resilient classification');
      console.log('\nRecommended fixes:');
      console.log('  ✓ Tighten resilient criteria (require N < 35 instead of 40)');
      console.log('  ✓ Require more traits to be above average (3+ instead of 1+)');
      console.log('  ✓ Adjust point weights to balance classification rates');
      console.log('  ✓ Consider using normalized scores or z-scores relative to population');
    } else if (majorityResilient) {
      console.log('⚠️  ISSUE: Majority of assessments classify as resilient (> 70%)');
      console.log('\nExpected distribution (from research):');
      console.log('  - Resilient: 35%');
      console.log('  - Overcontrolled: 25%');
      console.log('  - Undercontrolled: 20%');
      console.log('  - Reserved/Unclassified: 20%');
      console.log('\nCurrent distribution is skewed towards resilient.');
      console.log('Consider adjusting thresholds to match population prevalence.');
    } else {
      console.log('✅ Healthy archetype distribution - multiple types represented');
    }

    console.log('\n✅ Diagnostic analysis complete!\n');

    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB\n');

  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

diagnoseArchetypeRepetition();
