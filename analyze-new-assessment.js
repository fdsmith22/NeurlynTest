#!/usr/bin/env node

const mongoose = require('mongoose');
const AssessmentSession = require('./models/AssessmentSession');
const QuestionBank = require('./models/QuestionBank');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';
const SESSION_ID = 'ADAPTIVE_1760039913646_vly5jsxqp';

async function analyzeAssessment() {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log('\n========================================');
    console.log('COMPREHENSIVE ASSESSMENT DATA ANALYSIS');
    console.log('========================================\n');

    const session = await AssessmentSession.findOne({ sessionId: SESSION_ID });

    if (!session) {
      console.log('❌ Session not found:', SESSION_ID);
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('✓ Session found:', SESSION_ID);
    console.log('  Total responses:', session.responses.length);
    console.log('  Created:', session.createdAt);

    // ========================================
    // 1. FACET DATA CAPTURE VERIFICATION
    // ========================================
    console.log('\n--- 1. FACET DATA CAPTURE (Post-Fix) ---\n');

    const responsesWithFacet = session.responses.filter(r => r.facet);
    const responsesWithTrait = session.responses.filter(r => r.trait);
    const responsesWithCategory = session.responses.filter(r => r.category);

    console.log(`Facet field populated: ${responsesWithFacet.length}/${session.responses.length}`);
    console.log(`Trait field populated: ${responsesWithTrait.length}/${session.responses.length}`);
    console.log(`Category field populated: ${responsesWithCategory.length}/${session.responses.length}`);

    if (responsesWithFacet.length > 0) {
      console.log('\n✓ FACET FIX WORKING! Sample facets captured:');
      responsesWithFacet.slice(0, 5).forEach(r => {
        console.log(`  ${r.questionId}: facet="${r.facet}", trait="${r.trait}"`);
      });

      // Group by facet
      const facetGroups = {};
      responsesWithFacet.forEach(r => {
        if (!facetGroups[r.facet]) facetGroups[r.facet] = [];
        facetGroups[r.facet].push(r);
      });

      console.log(`\nUnique facets captured: ${Object.keys(facetGroups).length}`);
      console.log('Facet distribution:');
      Object.entries(facetGroups).forEach(([facet, responses]) => {
        console.log(`  ${facet}: ${responses.length} responses`);
      });
    } else {
      console.log('\n❌ NO FACET DATA CAPTURED - Fix may not be working!');
    }

    // ========================================
    // 2. BIG FIVE SCORE CALCULATION
    // ========================================
    console.log('\n--- 2. BIG FIVE SCORE VALIDATION ---\n');

    const traits = {
      openness: [],
      conscientiousness: [],
      extraversion: [],
      agreeableness: [],
      neuroticism: []
    };

    session.responses.forEach(r => {
      const trait = (r.trait || r.category || '').toLowerCase();
      if (traits[trait]) {
        const score = r.score || r.value || 3;
        const normalized = ((score - 1) / 4) * 100;
        traits[trait].push({ questionId: r.questionId, score, normalized });
      }
    });

    console.log('Trait response counts and calculated scores:\n');
    const calculatedScores = {};
    Object.entries(traits).forEach(([trait, responses]) => {
      if (responses.length > 0) {
        const avg = responses.reduce((sum, r) => sum + r.normalized, 0) / responses.length;
        calculatedScores[trait] = Math.round(avg);
        console.log(`${trait.toUpperCase()}:`);
        console.log(`  Responses: ${responses.length}`);
        console.log(`  Calculated score: ${Math.round(avg)}`);
        console.log(`  Sample questions: ${responses.slice(0, 3).map(r => r.questionId).join(', ')}`);
        console.log('');
      }
    });

    // Report shows: O=60, C=66, E=60, A=65, N=71
    const reportedScores = {
      openness: 60,
      conscientiousness: 66,
      extraversion: 60,
      agreeableness: 65,
      neuroticism: 71
    };

    console.log('SCORE COMPARISON:');
    let scoresMatch = true;
    Object.entries(reportedScores).forEach(([trait, reportedScore]) => {
      const calculated = calculatedScores[trait] || 0;
      const match = Math.abs(calculated - reportedScore) <= 1; // Allow 1 point rounding diff
      console.log(`  ${trait}: Calculated=${calculated}, Reported=${reportedScore} ${match ? '✓' : '❌'}`);
      if (!match) scoresMatch = false;
    });

    console.log(`\n${scoresMatch ? '✓ SCORES MATCH' : '❌ SCORE MISMATCH DETECTED'}`);

    // ========================================
    // 3. NEURODIVERSITY DATA ANALYSIS
    // ========================================
    console.log('\n--- 3. NEURODIVERSITY DATA ANALYSIS ---\n');

    const ndResponses = session.responses.filter(r => {
      const cat = (r.category || '').toLowerCase();
      const subcat = (r.subcategory || '').toLowerCase();
      return cat === 'neurodiversity' ||
             cat.includes('executive') ||
             cat.includes('sensory') ||
             subcat.includes('executive') ||
             subcat.includes('sensory') ||
             subcat.includes('adhd') ||
             subcat.includes('autism');
    });

    console.log(`Neurodiversity responses: ${ndResponses.length}`);

    if (ndResponses.length > 0) {
      console.log('\nNeurodiversity questions answered:');
      ndResponses.forEach(r => {
        console.log(`  ${r.questionId}: ${r.value} (${r.category}/${r.subcategory})`);
      });

      // Check EF responses
      const efResponses = ndResponses.filter(r =>
        (r.category || '').toLowerCase().includes('executive') ||
        (r.subcategory || '').toLowerCase().includes('executive') ||
        (r.questionId || '').includes('_EF_')
      );

      console.log(`\nExecutive Function responses: ${efResponses.length}`);
      if (efResponses.length > 0) {
        console.log('EF questions:');
        efResponses.forEach(r => {
          console.log(`  ${r.questionId}: ${r.value}`);
        });
      }

      console.log(`\n${ndResponses.length >= 5 ? '✓' : '⚠️'} ${ndResponses.length >= 5 ? 'Sufficient' : 'Insufficient'} ND data (threshold: 5)`);
    } else {
      console.log('❌ No neurodiversity responses found');
    }

    // ========================================
    // 4. QUESTION BANK CROSS-REFERENCE
    // ========================================
    console.log('\n--- 4. QUESTION BANK METADATA VERIFICATION ---\n');

    const questionIds = session.responses.map(r => r.questionId);
    const dbQuestions = await QuestionBank.find({ questionId: { $in: questionIds } });
    const dbQuestionMap = new Map(dbQuestions.map(q => [q.questionId, q]));

    console.log(`Questions in DB: ${dbQuestions.length}/${questionIds.length}`);

    // Check if response metadata matches DB metadata
    let metadataMismatches = 0;
    const sampleMismatches = [];

    session.responses.forEach(r => {
      const dbQ = dbQuestionMap.get(r.questionId);
      if (dbQ) {
        if (dbQ.facet && !r.facet) {
          metadataMismatches++;
          if (sampleMismatches.length < 3) {
            sampleMismatches.push({
              questionId: r.questionId,
              dbFacet: dbQ.facet,
              responseFacet: r.facet || 'undefined'
            });
          }
        }
      }
    });

    if (metadataMismatches > 0) {
      console.log(`\n⚠️ Found ${metadataMismatches} metadata mismatches`);
      console.log('Sample mismatches:');
      sampleMismatches.forEach(m => {
        console.log(`  ${m.questionId}: DB has "${m.dbFacet}", Response has "${m.responseFacet}"`);
      });
    } else {
      console.log('\n✓ All metadata properly transferred from DB to responses');
    }

    // ========================================
    // 5. DATA SUFFICIENCY FOR REPORT
    // ========================================
    console.log('\n--- 5. REPORT SECTION ELIGIBILITY ---\n');

    const hasFacetData = responsesWithFacet.length >= 15;
    const hasNDData = ndResponses.length >= 5;

    console.log(`Facet Analysis: ${hasFacetData ? '✓ ENABLED' : '❌ DISABLED'} (${responsesWithFacet.length}/15 threshold)`);
    console.log(`Neurodiversity: ${hasNDData ? '✓ ENABLED' : '❌ DISABLED'} (${ndResponses.length}/5 threshold)`);

    // ========================================
    // 6. SYNTHETIC DATA CHECK
    // ========================================
    console.log('\n--- 6. SYNTHETIC DATA DETECTION ---\n');

    const issues = [];

    // Check for identical facet scores (sign of synthetic data)
    if (responsesWithFacet.length > 0) {
      const traitFacetGroups = {};
      responsesWithFacet.forEach(r => {
        const key = r.trait;
        if (!traitFacetGroups[key]) traitFacetGroups[key] = {};
        if (!traitFacetGroups[key][r.facet]) traitFacetGroups[key][r.facet] = [];
        traitFacetGroups[key][r.facet].push(r);
      });

      console.log('Facet response distribution by trait:');
      Object.entries(traitFacetGroups).forEach(([trait, facets]) => {
        console.log(`  ${trait}:`);
        Object.entries(facets).forEach(([facet, responses]) => {
          console.log(`    ${facet}: ${responses.length} responses`);
        });
      });
    }

    // Check for default scores (all 3's would indicate defaults)
    const allThrees = session.responses.every(r => (r.score || r.value) === 3);
    if (allThrees) {
      issues.push('All responses have value=3 (possible default data)');
    }

    // Check for missing response times (could indicate synthetic)
    const withoutResponseTime = session.responses.filter(r => !r.responseTime).length;
    if (withoutResponseTime > 0) {
      console.log(`⚠️ ${withoutResponseTime} responses missing responseTime`);
    }

    console.log(`\n${issues.length === 0 ? '✓ NO SYNTHETIC DATA DETECTED' : '❌ POTENTIAL ISSUES FOUND:'}`);
    issues.forEach(issue => console.log(`  - ${issue}`));

    // ========================================
    // SUMMARY
    // ========================================
    console.log('\n========================================');
    console.log('ANALYSIS SUMMARY');
    console.log('========================================\n');

    console.log('Data Capture:');
    console.log(`  ✓ Total responses: ${session.responses.length}`);
    console.log(`  ${responsesWithFacet.length > 0 ? '✓' : '❌'} Facet metadata: ${responsesWithFacet.length} questions`);
    console.log(`  ${responsesWithTrait.length > 0 ? '✓' : '❌'} Trait metadata: ${responsesWithTrait.length} questions`);

    console.log('\nScore Accuracy:');
    console.log(`  ${scoresMatch ? '✓' : '❌'} Big Five scores match calculated values`);

    console.log('\nReport Sections:');
    console.log(`  ${hasFacetData ? '✓' : '❌'} Facet analysis ${hasFacetData ? 'enabled' : 'disabled (insufficient data)'}`);
    console.log(`  ${hasNDData ? '✓' : '⚠️'} Neurodiversity ${hasNDData ? 'enabled' : 'limited data'}`);

    console.log('\nData Integrity:');
    console.log(`  ${metadataMismatches === 0 ? '✓' : '⚠️'} Metadata transfer ${metadataMismatches === 0 ? 'complete' : `${metadataMismatches} mismatches`}`);
    console.log(`  ${issues.length === 0 ? '✓' : '⚠️'} No synthetic data ${issues.length === 0 ? 'detected' : `(${issues.length} issues)`}`);

    console.log('\n========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

analyzeAssessment();
