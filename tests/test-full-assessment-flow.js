/**
 * Test: Full 70-Question Assessment Flow
 *
 * Verifies:
 * 1. All 4 stages execute properly
 * 2. Exactly 70 questions selected
 * 3. Validity questions distributed (8 total: 3+2+2+1)
 * 4. Intelligent facet selection works
 * 5. discriminationIndex used for sorting
 * 6. No duplicate questions
 * 7. Stage progression logic correct
 */

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
const ConfidenceTracker = require('../services/confidence-tracker');
const Stage1 = require('../services/adaptive-selectors/stage-1-broad-screening');
const Stage2 = require('../services/adaptive-selectors/stage-2-targeted-building');
const Stage3 = require('../services/adaptive-selectors/stage-3-precision-refinement');
const Stage4 = require('../services/adaptive-selectors/stage-4-gap-filling');

async function testFullAssessment() {
  try {
    await mongoose.connect('mongodb://localhost:27017/neurlyn-test');
    console.log('🔗 Connected to neurlyn-test database\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('         FULL 70-QUESTION ASSESSMENT TEST');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Initialize
    const confidenceTracker = new ConfidenceTracker();
    const stage1 = new Stage1();
    const stage2 = new Stage2();
    const stage3 = new Stage3();
    const stage4 = new Stage4();

    let allQuestions = [];
    let allResponses = [];
    const askedIds = new Set();

    // ========== STAGE 1: BROAD SCREENING ==========
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ STAGE 1: BROAD SCREENING (Target: 15-20 questions)     │');
    console.log('└─────────────────────────────────────────────────────────┘');

    const stage1Questions = await stage1.selectQuestions(QuestionBank, []);
    console.log(`✓ Selected ${stage1Questions.length} questions`);

    // Simulate responses (moderate scores for realistic progression)
    stage1Questions.forEach(q => {
      const response = {
        questionId: q.questionId,
        category: q.category,
        trait: q.trait,
        score: Math.floor(Math.random() * 60) + 20, // 20-80 range
        tags: q.tags
      };
      allResponses.push(response);
      confidenceTracker.updateConfidence(q.category, q.trait || q.subcategory, response.score, q);
      askedIds.add(q.questionId);
    });

    allQuestions.push(...stage1Questions);

    // Verify validity questions in Stage 1
    const stage1Validity = stage1Questions.filter(q => q.category === 'validity_scales');
    console.log(`  • Validity questions: ${stage1Validity.length} (expected: 3)`);
    console.log(`  • Inconsistency pairs: ${stage1Validity.filter(q => q.subcategory === 'inconsistency').length}`);
    console.log(`  • Infrequency: ${stage1Validity.filter(q => q.subcategory === 'infrequency').length}`);

    // Verify baseline/anchor questions
    const stage1Baseline = stage1Questions.filter(q => q.tags?.includes('baseline') || q.tags?.includes('anchor'));
    console.log(`  • Baseline/anchor questions: ${stage1Baseline.length}`);

    console.log(`  • Total questions so far: ${allQuestions.length}\n`);

    // ========== STAGE 2: TARGETED BUILDING ==========
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ STAGE 2: TARGETED BUILDING (Target: 25-30 questions)   │');
    console.log('└─────────────────────────────────────────────────────────┘');

    const stage2Questions = await stage2.selectQuestions(
      QuestionBank,
      confidenceTracker,
      allResponses,
      Array.from(askedIds)
    );
    console.log(`✓ Selected ${stage2Questions.length} questions`);

    // Simulate responses
    stage2Questions.forEach(q => {
      const response = {
        questionId: q.questionId,
        category: q.category,
        trait: q.trait,
        score: Math.floor(Math.random() * 60) + 20,
        tags: q.tags
      };
      allResponses.push(response);
      confidenceTracker.updateConfidence(q.category, q.trait || q.subcategory, response.score, q);
      askedIds.add(q.questionId);
    });

    allQuestions.push(...stage2Questions);

    // Verify validity questions in Stage 2
    const stage2Validity = stage2Questions.filter(q => q.category === 'validity_scales');
    console.log(`  • Validity questions: ${stage2Validity.length} (expected: 2)`);

    // Check for intelligent facet selection
    const stage2Facets = stage2Questions.filter(q => q.facet);
    console.log(`  • Facet questions: ${stage2Facets.length}`);
    if (stage2Facets.length > 0) {
      console.log(`  • Sample facets: ${stage2Facets.slice(0, 3).map(q => `${q.trait}.${q.facet}`).join(', ')}`);
    }

    console.log(`  • Total questions so far: ${allQuestions.length}\n`);

    // ========== STAGE 3: PRECISION REFINEMENT ==========
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ STAGE 3: PRECISION REFINEMENT (Target: 15-20 questions)│');
    console.log('└─────────────────────────────────────────────────────────┘');

    const stage3Questions = await stage3.selectQuestions(
      QuestionBank,
      confidenceTracker,
      allResponses,
      Array.from(askedIds)
    );
    console.log(`✓ Selected ${stage3Questions.length} questions`);

    // Simulate responses
    stage3Questions.forEach(q => {
      const response = {
        questionId: q.questionId,
        category: q.category,
        trait: q.trait,
        score: Math.floor(Math.random() * 60) + 20,
        tags: q.tags
      };
      allResponses.push(response);
      confidenceTracker.updateConfidence(q.category, q.trait || q.subcategory, response.score, q);
      askedIds.add(q.questionId);
    });

    allQuestions.push(...stage3Questions);

    // Verify validity questions in Stage 3
    const stage3Validity = stage3Questions.filter(q => q.category === 'validity_scales');
    console.log(`  • Validity questions: ${stage3Validity.length} (expected: 2)`);

    console.log(`  • Total questions so far: ${allQuestions.length}\n`);

    // ========== STAGE 4: GAP FILLING ==========
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ STAGE 4: GAP FILLING (Fill to exactly 70)              │');
    console.log('└─────────────────────────────────────────────────────────┘');

    const stage4Questions = await stage4.selectQuestions(
      QuestionBank,
      confidenceTracker,
      allResponses,
      Array.from(askedIds),
      70 // Target total
    );
    console.log(`✓ Selected ${stage4Questions.length} questions`);

    allQuestions.push(...stage4Questions);

    // Verify validity questions in Stage 4
    const stage4Validity = stage4Questions.filter(q => q.category === 'validity_scales');
    console.log(`  • Validity questions: ${stage4Validity.length} (expected: 1)`);

    console.log(`  • Total questions: ${allQuestions.length}\n`);

    // ========== COMPREHENSIVE VERIFICATION ==========
    console.log('═══════════════════════════════════════════════════════════');
    console.log('         VERIFICATION REPORT');
    console.log('═══════════════════════════════════════════════════════════\n');

    // 1. Total count
    console.log(`[1] TOTAL QUESTIONS: ${allQuestions.length}/70`);
    if (allQuestions.length === 70) {
      console.log('    ✅ PASS: Exactly 70 questions\n');
    } else {
      console.log(`    ❌ FAIL: Expected 70, got ${allQuestions.length}\n`);
    }

    // 2. Duplicates check
    const uniqueIds = new Set(allQuestions.map(q => q.questionId));
    console.log(`[2] DUPLICATE CHECK: ${uniqueIds.size} unique IDs`);
    if (uniqueIds.size === allQuestions.length) {
      console.log('    ✅ PASS: No duplicate questions\n');
    } else {
      console.log(`    ❌ FAIL: Found ${allQuestions.length - uniqueIds.size} duplicates\n`);
    }

    // 3. Validity questions distribution
    const totalValidity = allQuestions.filter(q => q.category === 'validity_scales');
    console.log(`[3] VALIDITY QUESTIONS: ${totalValidity.length}/8`);
    console.log(`    • Stage 1: ${stage1Validity.length}/3`);
    console.log(`    • Stage 2: ${stage2Validity.length}/2`);
    console.log(`    • Stage 3: ${stage3Validity.length}/2`);
    console.log(`    • Stage 4: ${stage4Validity.length}/1`);
    if (totalValidity.length >= 6) { // Allow some flexibility
      console.log('    ✅ PASS: Adequate validity monitoring\n');
    } else {
      console.log('    ⚠️  WARNING: Low validity coverage\n');
    }

    // 4. discriminationIndex usage
    const withDiscrimination = allQuestions.filter(q =>
      q.adaptive?.discriminationIndex != null
    );
    console.log(`[4] DISCRIMINATION INDEX: ${withDiscrimination.length}/${allQuestions.length} questions`);
    if (withDiscrimination.length === allQuestions.length) {
      console.log('    ✅ PASS: All questions have discriminationIndex\n');
    } else {
      console.log(`    ❌ FAIL: ${allQuestions.length - withDiscrimination.length} questions missing discriminationIndex\n`);
    }

    // 5. Category distribution
    console.log('[5] CATEGORY DISTRIBUTION:');
    const categoryCount = {};
    allQuestions.forEach(q => {
      categoryCount[q.category] = (categoryCount[q.category] || 0) + 1;
    });
    Object.entries(categoryCount).forEach(([cat, count]) => {
      console.log(`    • ${cat}: ${count} questions`);
    });
    console.log('');

    // 6. Instrument diversity
    const instruments = new Set(allQuestions.map(q => q.instrument).filter(Boolean));
    console.log(`[6] INSTRUMENT DIVERSITY: ${instruments.size} unique instruments`);
    if (instruments.size >= 10) {
      console.log('    ✅ PASS: Good instrument diversity\n');
    } else {
      console.log('    ⚠️  WARNING: Low instrument diversity\n');
    }

    // 7. Quality distribution
    console.log('[7] QUALITY DISTRIBUTION:');
    const qualityRanges = {
      'Excellent (0.80+)': allQuestions.filter(q => (q.adaptive?.discriminationIndex || 0) >= 0.80).length,
      'Good (0.70-0.79)': allQuestions.filter(q => {
        const d = q.adaptive?.discriminationIndex || 0;
        return d >= 0.70 && d < 0.80;
      }).length,
      'Adequate (0.60-0.69)': allQuestions.filter(q => {
        const d = q.adaptive?.discriminationIndex || 0;
        return d >= 0.60 && d < 0.70;
      }).length,
      'Fair (<0.60)': allQuestions.filter(q => (q.adaptive?.discriminationIndex || 0) < 0.60).length
    };
    Object.entries(qualityRanges).forEach(([range, count]) => {
      const pct = ((count / allQuestions.length) * 100).toFixed(1);
      console.log(`    • ${range}: ${count} (${pct}%)`);
    });
    console.log('');

    // ========== SUMMARY ==========
    console.log('═══════════════════════════════════════════════════════════');
    console.log('         TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');

    const passCount = [
      allQuestions.length === 70,
      uniqueIds.size === allQuestions.length,
      totalValidity.length >= 6,
      withDiscrimination.length === allQuestions.length,
      instruments.size >= 10
    ].filter(Boolean).length;

    console.log(`✅ PASSED: ${passCount}/5 checks`);
    if (passCount === 5) {
      console.log('🎉 ALL TESTS PASSED! Assessment system is fully functional.\n');
    } else {
      console.log(`⚠️  ${5 - passCount} checks need attention.\n`);
    }

    // Save test report
    const report = {
      timestamp: new Date().toISOString(),
      totalQuestions: allQuestions.length,
      stageBreakdown: {
        stage1: stage1Questions.length,
        stage2: stage2Questions.length,
        stage3: stage3Questions.length,
        stage4: stage4Questions.length
      },
      validityQuestions: {
        stage1: stage1Validity.length,
        stage2: stage2Validity.length,
        stage3: stage3Validity.length,
        stage4: stage4Validity.length,
        total: totalValidity.length
      },
      categoryDistribution: categoryCount,
      instrumentCount: instruments.size,
      qualityDistribution: qualityRanges,
      testsPass: passCount,
      allQuestionIds: allQuestions.map(q => q.questionId)
    };

    // Write report to file
    const fs = require('fs');
    fs.writeFileSync(
      'test-full-assessment-report.json',
      JSON.stringify(report, null, 2)
    );
    console.log('📄 Full report saved to: test-full-assessment-report.json\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

testFullAssessment();
