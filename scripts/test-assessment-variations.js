#!/usr/bin/env node

/**
 * Test Script - Verify all assessment variations populate correctly
 * Run: node scripts/test-assessment-variations.js
 */

const axios = require('axios');
const logger = require('../utils/logger');

const API_BASE = 'http://localhost:3000/api';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

async function testEndpoint(name, endpoint, expectedFields = []) {
  try {
    // console.log(`\n${colors.cyan}Testing: ${name}${colors.reset}`);
    // console.log(`Endpoint: ${endpoint}`);

    const response = await axios.get(`${API_BASE}${endpoint}`);
    const { data } = response;

    // Check response structure
    if (!data.success) {
      throw new Error('Response success flag is false');
    }

    // Check expected fields
    const missingFields = expectedFields.filter(field => !(field in data));
    if (missingFields.length > 0) {
      throw new Error(`Missing fields: ${missingFields.join(', ')}`);
    }

    // Display results
    // console.log(`${colors.green}✓ Success${colors.reset}`);
    // console.log(`  Total Questions: ${data.totalQuestions}`);
    // console.log(`  Assessment Type: ${data.assessmentType || 'N/A'}`);
    // console.log(`  Tier: ${data.tier || 'N/A'}`);

    // Show breakdown if available
    if (data.breakdown) {
      // console.log('  Breakdown:');
      Object.entries(data.breakdown).forEach(([key, value]) => {
        // console.log(`    - ${key}: ${value}`);
      });
    }

    if (data.traitBreakdown) {
      // console.log('  Trait Breakdown:');
      Object.entries(data.traitBreakdown).forEach(([trait, count]) => {
        // console.log(`    - ${trait}: ${count} questions`);
      });
    }

    // Validate questions structure
    if (data.questions && data.questions.length > 0) {
      const sampleQuestion = data.questions[0];
      // console.log(`\n  ${colors.magenta}Sample Question:${colors.reset}`);
      // console.log(`    ID: ${sampleQuestion.questionId}`);
      // console.log(`    Text: ${sampleQuestion.text.substring(0, 60)}...`);
      // console.log(`    Category: ${sampleQuestion.category}`);
      // console.log(`    Instrument: ${sampleQuestion.instrument}`);
      // console.log(`    Response Type: ${sampleQuestion.responseType}`);
      // console.log(`    Tier: ${sampleQuestion.tier}`);

      if (sampleQuestion.options && sampleQuestion.options.length > 0) {
        // console.log(`    Options: ${sampleQuestion.options.length} choices`);
      }
    }

    return { success: true, data };
  } catch (error) {
    // console.log(`${colors.red}✗ Failed${colors.reset}`);
    // console.log(`  Error: ${error.message}`);
    if (error.response) {
      // console.log(`  Status: ${error.response.status}`);
      // console.log(`  Response: ${JSON.stringify(error.response.data)}`);
    }
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  // console.log(`${colors.bright}${colors.yellow}===========================================`);
  // console.log(`   NEURLYN ASSESSMENT VARIATION TESTS`);
  // console.log(`===========================================${colors.reset}\n`);

  const results = [];

  // Test 1: Personality Assessment (Free Tier)
  results.push(
    await testEndpoint(
      'Personality Assessment - Free Tier',
      '/questions/assessment/personality?tier=free',
      ['success', 'assessmentType', 'tier', 'totalQuestions', 'questions', 'traitBreakdown']
    )
  );

  // Test 2: Personality Assessment (Core Tier)
  results.push(
    await testEndpoint(
      'Personality Assessment - Core Tier',
      '/questions/assessment/personality?tier=core',
      ['success', 'assessmentType', 'tier', 'totalQuestions', 'questions', 'traitBreakdown']
    )
  );

  // Test 3: Neurodiversity Assessment (Core Tier)
  results.push(
    await testEndpoint(
      'Neurodiversity Assessment - Core Tier',
      '/questions/assessment/neurodiversity?tier=core',
      ['success', 'assessmentType', 'tier', 'totalQuestions', 'questions']
    )
  );

  // Test 4: Lateral Thinking Assessment (Comprehensive Tier)
  results.push(
    await testEndpoint(
      'Lateral Thinking Assessment - Comprehensive Tier',
      '/questions/assessment/lateral?tier=comprehensive',
      ['success', 'assessmentType', 'tier', 'totalQuestions', 'questions']
    )
  );

  // Test 5: Cognitive Assessment
  results.push(
    await testEndpoint('Cognitive Assessment', '/questions/assessment/cognitive', [
      'success',
      'assessmentType',
      'tier',
      'totalQuestions',
      'questions'
    ])
  );

  // Test 6: Comprehensive Assessment (All Categories)
  results.push(
    await testEndpoint(
      'Comprehensive Assessment - All Categories',
      '/questions/assessment/comprehensive?tier=comprehensive',
      [
        'success',
        'assessmentType',
        'tier',
        'totalQuestions',
        'questions',
        'groupedQuestions',
        'breakdown'
      ]
    )
  );

  // Test 7: Limited Questions
  results.push(
    await testEndpoint('Limited Questions (5 max)', '/questions/assessment/personality?limit=5', [
      'success',
      'assessmentType',
      'tier',
      'totalQuestions',
      'questions'
    ])
  );

  // Test 8: Non-randomized Questions
  results.push(
    await testEndpoint(
      'Non-randomized Questions',
      '/questions/assessment/personality?randomize=false',
      ['success', 'assessmentType', 'tier', 'totalQuestions', 'questions']
    )
  );

  // Test 9: Specific Instrument (BFI-2-Extended)
  results.push(
    await testEndpoint('BFI-2-Extended Instrument', '/questions/by-instrument/BFI-2-Extended', [
      'success',
      'instrument',
      'totalQuestions',
      'questions'
    ])
  );

  // Test 10: Specific Instrument (LATERAL_THINKING)
  results.push(
    await testEndpoint('Lateral Thinking Instrument', '/questions/by-instrument/LATERAL_THINKING', [
      'success',
      'instrument',
      'totalQuestions',
      'questions'
    ])
  );

  // Test 11: ADHD Screening (ASRS-5)
  results.push(
    await testEndpoint('ADHD Screening - ASRS-5', '/questions/by-instrument/ASRS-5', [
      'success',
      'instrument',
      'totalQuestions',
      'questions'
    ])
  );

  // Test 12: Autism Screening (AQ-10)
  results.push(
    await testEndpoint('Autism Screening - AQ-10', '/questions/by-instrument/AQ-10', [
      'success',
      'instrument',
      'totalQuestions',
      'questions'
    ])
  );

  // Test 13: Question Statistics
  results.push(
    await testEndpoint('Question Statistics', '/questions/stats', [
      'success',
      'totalQuestions',
      'categoryBreakdown',
      'instrumentBreakdown'
    ])
  );

  // Summary
  // console.log(`\n${colors.bright}${colors.yellow}===========================================`);
  // console.log(`                TEST SUMMARY`);
  // console.log(`===========================================${colors.reset}\n`);

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  // console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  // console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  // console.log(`Total: ${results.length}`);

  // Detailed breakdown
  // console.log(`\n${colors.bright}Question Distribution Summary:${colors.reset}`);

  // Get comprehensive assessment data for overall summary
  const comprehensiveData = results.find(r => r.data && r.data.assessmentType === 'comprehensive');

  if (comprehensiveData && comprehensiveData.data.breakdown) {
    // console.log('\nTotal Questions by Category:');
    Object.entries(comprehensiveData.data.breakdown).forEach(([category, count]) => {
      // console.log(`  ${category}: ${count} questions`);
    });
  }

  // Tier distribution
  // console.log('\nQuestions by Tier:');
  const tierTests = ['free', 'core', 'comprehensive'].map(tier => {
    const test = results.find(
      r => r.data && r.data.tier === tier && r.data.assessmentType === 'personality'
    );
    if (test && test.data) {
      // console.log(`  ${tier}: ${test.data.totalQuestions} questions`);
    }
  });

  if (failed > 0) {
    // console.log(`\n${colors.red}Some tests failed. Please check the errors above.${colors.reset}`);
    process.exit(1);
  } else {
    // console.log(`\n${colors.green}All tests passed successfully! ✨${colors.reset}`);
    process.exit(0);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
