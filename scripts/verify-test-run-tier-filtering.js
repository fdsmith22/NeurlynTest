#!/usr/bin/env node

/**
 * Verify Test Run Tier Filtering
 * Check that the latest test assessment only pulled questions from correct tiers
 */

const mongoose = require('mongoose');
const AssessmentSession = require('../models/AssessmentSession');
const QuestionBank = require('../models/QuestionBank');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

async function verifyTestRunTierFiltering() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get the most recent assessment session
    const latestAssessment = await AssessmentSession.findOne()
      .sort({ startTime: -1 })
      .limit(1);

    if (!latestAssessment) {
      console.log('❌ No assessment sessions found');
      return;
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('  TEST RUN TIER FILTERING VERIFICATION');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log(`Session ID: ${latestAssessment.sessionId}`);
    console.log(`Assessment Tier: ${latestAssessment.assessmentTier || 'COMPREHENSIVE'}`);
    console.log(`Clinical Addon Consent: ${latestAssessment.clinicalAddonConsent || false}`);
    console.log(`Questions Asked: ${latestAssessment.questionsAnswered || latestAssessment.presentedQuestions?.length || 0}`);
    console.log('');

    // Get all question IDs that were asked
    const askedQuestionIds = latestAssessment.presentedQuestions || [];

    if (askedQuestionIds.length === 0) {
      console.log('❌ No questions found in presentedQuestions array');
      return;
    }

    console.log(`Analyzing ${askedQuestionIds.length} questions...\n`);

    // Look up each question's tier assignments
    const questions = await QuestionBank.find({
      questionId: { $in: askedQuestionIds }
    }).select('questionId assessmentTiers instrument sensitivity category subcategory');

    // Create tier breakdown
    const tierBreakdown = {
      CORE: [],
      COMPREHENSIVE: [],
      CLINICAL_ADDON: [],
      UNTAGGED: [],
      MULTI_TIER: []
    };

    const categoryBreakdown = {};
    const instrumentBreakdown = {};

    questions.forEach(q => {
      const tiers = q.assessmentTiers || [];

      // Categorize by tier
      if (tiers.length === 0) {
        tierBreakdown.UNTAGGED.push(q.questionId);
      } else {
        if (tiers.includes('CLINICAL_ADDON')) {
          tierBreakdown.CLINICAL_ADDON.push(q.questionId);
        }
        if (tiers.includes('COMPREHENSIVE')) {
          tierBreakdown.COMPREHENSIVE.push(q.questionId);
        }
        if (tiers.includes('CORE')) {
          tierBreakdown.CORE.push(q.questionId);
        }
        if (tiers.length > 1) {
          tierBreakdown.MULTI_TIER.push(q.questionId);
        }
      }

      // Category breakdown
      const cat = q.category || 'unknown';
      if (!categoryBreakdown[cat]) categoryBreakdown[cat] = 0;
      categoryBreakdown[cat]++;

      // Instrument breakdown
      const inst = q.instrument || 'unknown';
      if (!instrumentBreakdown[inst]) instrumentBreakdown[inst] = 0;
      instrumentBreakdown[inst]++;
    });

    console.log('═══════════════════════════════════════════════════════════');
    console.log('  TIER DISTRIBUTION');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log(`CORE tier questions:            ${tierBreakdown.CORE.length}`);
    console.log(`COMPREHENSIVE tier questions:   ${tierBreakdown.COMPREHENSIVE.length}`);
    console.log(`CLINICAL_ADDON tier questions:  ${tierBreakdown.CLINICAL_ADDON.length}`);
    console.log(`Multi-tier questions:           ${tierBreakdown.MULTI_TIER.length}`);
    console.log(`Untagged questions:             ${tierBreakdown.UNTAGGED.length}`);
    console.log('');

    // Critical checks
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  CRITICAL VALIDATIONS');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Check 1: No CLINICAL_ADDON questions should appear (no consent given)
    const hasClinicalAddonQuestions = tierBreakdown.CLINICAL_ADDON.length > 0;
    const expectedClinicalAddon = latestAssessment.clinicalAddonConsent === true;

    if (!expectedClinicalAddon && hasClinicalAddonQuestions) {
      console.log(`❌ FAIL: Found ${tierBreakdown.CLINICAL_ADDON.length} CLINICAL_ADDON questions without consent`);
      console.log('   CLINICAL_ADDON questions found:');
      tierBreakdown.CLINICAL_ADDON.forEach(qid => {
        console.log(`   - ${qid}`);
      });
    } else if (expectedClinicalAddon && hasClinicalAddonQuestions) {
      console.log(`✅ PASS: CLINICAL_ADDON questions present (consent given)`);
    } else {
      console.log(`✅ PASS: No CLINICAL_ADDON questions (no consent given)`);
    }

    // Check 2: No suicide questions
    const suicideQuestions = questions.filter(q => q.questionId.includes('SUICIDE_SCREEN'));
    if (suicideQuestions.length > 0 && !latestAssessment.clinicalAddonConsent) {
      console.log(`❌ FAIL: Found ${suicideQuestions.length} suicide screening questions without consent`);
      suicideQuestions.forEach(q => {
        console.log(`   - ${q.questionId}`);
      });
    } else {
      console.log(`✅ PASS: No suicide questions appeared (as expected)`);
    }

    // Check 3: Check for full vs brief screeners
    const phq9Questions = questions.filter(q => q.questionId.includes('DEPRESSION_PHQ9'));
    const gad7Questions = questions.filter(q => q.questionId.includes('ANXIETY_GAD7'));

    console.log(`\n✓ PHQ questions found: ${phq9Questions.length}`);
    phq9Questions.forEach(q => {
      console.log(`  - ${q.questionId} [${q.assessmentTiers?.join(', ')}]`);
    });

    console.log(`✓ GAD questions found: ${gad7Questions.length}`);
    gad7Questions.forEach(q => {
      console.log(`  - ${q.questionId} [${q.assessmentTiers?.join(', ')}]`);
    });

    // Check if only brief screeners appeared
    const fullPHQ9Questions = phq9Questions.filter(q =>
      !['DEPRESSION_PHQ9_1', 'DEPRESSION_PHQ9_2'].includes(q.questionId)
    );
    const fullGAD7Questions = gad7Questions.filter(q =>
      !['ANXIETY_GAD7_1', 'ANXIETY_GAD7_2'].includes(q.questionId)
    );

    if (fullPHQ9Questions.length > 0 && !latestAssessment.clinicalAddonConsent) {
      console.log(`\n❌ FAIL: Found ${fullPHQ9Questions.length} full PHQ-9 questions (beyond PHQ-2) without consent`);
    } else {
      console.log(`\n✅ PASS: Only PHQ-2 brief screener used (or clinical consent given)`);
    }

    if (fullGAD7Questions.length > 0 && !latestAssessment.clinicalAddonConsent) {
      console.log(`❌ FAIL: Found ${fullGAD7Questions.length} full GAD-7 questions (beyond GAD-2) without consent`);
    } else {
      console.log(`✅ PASS: Only GAD-2 brief screener used (or clinical consent given)`);
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  CATEGORY BREAKDOWN');
    console.log('═══════════════════════════════════════════════════════════\n');

    Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        const percentage = ((count / questions.length) * 100).toFixed(1);
        console.log(`${category.padEnd(30)} ${count.toString().padStart(3)} (${percentage}%)`);
      });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  INSTRUMENT BREAKDOWN');
    console.log('═══════════════════════════════════════════════════════════\n');

    Object.entries(instrumentBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15) // Top 15
      .forEach(([instrument, count]) => {
        const percentage = ((count / questions.length) * 100).toFixed(1);
        console.log(`${instrument.padEnd(30)} ${count.toString().padStart(3)} (${percentage}%)`);
      });

    console.log('\n✅ Tier filtering verification complete!\n');

    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB\n');

  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

verifyTestRunTierFiltering();
