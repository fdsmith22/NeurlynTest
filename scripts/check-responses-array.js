#!/usr/bin/env node

/**
 * Check Responses Array
 * Examine where responses are actually being stored
 */

const mongoose = require('mongoose');
const AssessmentSession = require('../models/AssessmentSession');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

async function checkResponsesArray() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get the most recent assessment
    const latest = await AssessmentSession.findOne()
      .sort({ startTime: -1 })
      .limit(1);

    if (!latest) {
      console.log('❌ No assessments found');
      await mongoose.disconnect();
      return;
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('  RESPONSES ANALYSIS');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log(`Session ID: ${latest.sessionId}\n`);

    console.log('Response Storage:');
    console.log(`  baselineResponses: ${latest.baselineResponses?.length || 0} items`);
    console.log(`  adaptiveResponses: ${latest.adaptiveResponses?.length || 0} items`);
    console.log(`  responses (unified): ${latest.responses?.length || 0} items`);
    console.log(`  presentedQuestions: ${latest.presentedQuestions?.length || 0} items`);
    console.log('');

    // Check which array has data
    const hasBaseline = latest.baselineResponses?.length > 0;
    const hasAdaptive = latest.adaptiveResponses?.length > 0;
    const hasUnified = latest.responses?.length > 0;
    const hasPresented = latest.presentedQuestions?.length > 0;

    if (hasPresented) {
      console.log(`✓ Found ${latest.presentedQuestions.length} questions in presentedQuestions array\n`);
      console.log('First 10 question IDs:');
      latest.presentedQuestions.slice(0, 10).forEach((qid, i) => {
        console.log(`  ${(i + 1).toString().padStart(2)}. ${qid}`);
      });
    }

    if (hasUnified) {
      console.log(`\n✓ Found ${latest.responses.length} responses in unified responses array\n`);
      console.log('Sample responses:');
      latest.responses.slice(0, 5).forEach((r, i) => {
        console.log(`  ${(i + 1).toString().padStart(2)}. ${r.questionId} → value: ${r.value}, score: ${r.score}`);
      });

      // Analyze if there are Big Five scores
      const bigFiveQuestions = latest.responses.filter(r =>
        r.questionId?.includes('BASELINE_') ||
        r.trait ||
        r.category === 'personality'
      );

      if (bigFiveQuestions.length > 0) {
        console.log(`\n  Big Five related responses: ${bigFiveQuestions.length}`);
      }
    }

    if (hasBaseline) {
      console.log(`\n✓ Found ${latest.baselineResponses.length} responses in baselineResponses array\n`);
    }

    if (hasAdaptive) {
      console.log(`\n✓ Found ${latest.adaptiveResponses.length} responses in adaptiveResponses array\n`);
    }

    // Check if we can calculate scores from responses
    if (hasUnified && latest.responses.length > 10) {
      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('  ATTEMPTING BIG FIVE SCORE CALCULATION');
      console.log('═══════════════════════════════════════════════════════════\n');

      // Group by trait
      const traitResponses = {};
      latest.responses.forEach(r => {
        if (r.trait) {
          if (!traitResponses[r.trait]) {
            traitResponses[r.trait] = [];
          }
          traitResponses[r.trait].push({
            questionId: r.questionId,
            score: r.score || r.value
          });
        }
      });

      console.log('Trait Response Counts:');
      Object.entries(traitResponses).forEach(([trait, responses]) => {
        const avgScore = responses.reduce((sum, r) => sum + (r.score || 0), 0) / responses.length;
        console.log(`  ${trait.padEnd(20)} ${responses.length} responses | avg: ${avgScore.toFixed(1)}`);
      });

      // Calculate simple averages for Big Five
      const bigFiveTraits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
      const calculatedScores = {};

      bigFiveTraits.forEach(trait => {
        const responses = traitResponses[trait] || [];
        if (responses.length > 0) {
          calculatedScores[trait] = responses.reduce((sum, r) => sum + (r.score || 0), 0) / responses.length;
        }
      });

      if (Object.keys(calculatedScores).length > 0) {
        console.log('\nCalculated Big Five Scores:');
        Object.entries(calculatedScores).forEach(([trait, score]) => {
          console.log(`  ${trait.padEnd(20)} ${score.toFixed(1)}`);
        });

        // Test RUO classification on these scores
        const RUOClassifier = require('../services/ruo-classifier');
        const classifier = new RUOClassifier();

        const bigFive = {
          openness: calculatedScores.openness || 50,
          conscientiousness: calculatedScores.conscientiousness || 50,
          extraversion: calculatedScores.extraversion || 50,
          agreeableness: calculatedScores.agreeableness || 50,
          neuroticism: calculatedScores.neuroticism || 50
        };

        const classification = classifier.classify(bigFive);

        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('  RUO CLASSIFICATION FROM RESPONSES');
        console.log('═══════════════════════════════════════════════════════════\n');

        console.log(`Archetype: ${classification.primaryType}`);
        console.log(`Confidence: ${classification.confidence.toFixed(2)}`);
        console.log(`Is Hybrid: ${classification.isHybrid}`);
        if (classification.secondaryType) {
          console.log(`Secondary Type: ${classification.secondaryType}`);
        }

        console.log('\nFit Scores:');
        console.log(`  Resilient:        ${classification.profile.resilientFit.toFixed(1)}`);
        console.log(`  Overcontrolled:   ${classification.profile.overcontrolledFit.toFixed(1)}`);
        console.log(`  Undercontrolled:  ${classification.profile.undercontrolledFit.toFixed(1)}`);
      }
    }

    // Check multiple recent assessments
    const recentAssessments = await AssessmentSession.find({})
      .sort({ startTime: -1 })
      .limit(5)
      .select('sessionId presentedQuestions responses');

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  RECENT ASSESSMENTS QUESTION COUNTS');
    console.log('═══════════════════════════════════════════════════════════\n');

    recentAssessments.forEach((a, i) => {
      const presented = a.presentedQuestions?.length || 0;
      const unified = a.responses?.length || 0;
      console.log(`${(i + 1)}. ${a.sessionId}`);
      console.log(`   presentedQuestions: ${presented}, responses: ${unified}`);
    });

    console.log('\n✅ Response analysis complete!\n');

    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB\n');

  } catch (error) {
    console.error('Error:', error);
    console.error(error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkResponsesArray();
