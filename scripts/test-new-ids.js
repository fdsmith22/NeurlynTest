#!/usr/bin/env node

/**
 * Test script to verify the system works with new standardized IDs
 */

require('dotenv').config();
const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test');
    console.log(`${colors.green}✓ Connected to MongoDB${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ MongoDB connection error:${colors.reset}`, error);
    process.exit(1);
  }
}

async function testNewIds() {
  console.log(
    `\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(`${colors.cyan}         TESTING NEW STANDARDIZED IDS${colors.reset}`);
  console.log(
    `${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`
  );

  const tests = {
    passed: [],
    failed: []
  };

  try {
    // Test 1: Check if we can fetch questions
    console.log(`${colors.yellow}Test 1: Fetching questions...${colors.reset}`);
    const allQuestions = await QuestionBank.find({}).limit(10);
    if (allQuestions.length > 0) {
      tests.passed.push('Can fetch questions from database');
      console.log(`  ${colors.green}✓ Found ${allQuestions.length} questions${colors.reset}`);
      console.log(
        `  Sample IDs: ${allQuestions
          .slice(0, 3)
          .map(q => q.questionId)
          .join(', ')}`
      );
    } else {
      tests.failed.push('No questions found in database');
      console.log(`  ${colors.red}✗ No questions found${colors.reset}`);
    }

    // Test 2: Check baseline questions
    console.log(`\n${colors.yellow}Test 2: Fetching baseline questions...${colors.reset}`);
    const baselineQuestions = await QuestionBank.getBaselineQuestions('standard');
    if (baselineQuestions.length > 0) {
      tests.passed.push('Can fetch baseline questions');
      console.log(
        `  ${colors.green}✓ Found ${baselineQuestions.length} baseline questions${colors.reset}`
      );
      console.log(
        `  Sample IDs: ${baselineQuestions
          .slice(0, 3)
          .map(q => q.questionId)
          .join(', ')}`
      );
    } else {
      tests.failed.push('No baseline questions found');
      console.log(`  ${colors.red}✗ No baseline questions found${colors.reset}`);
    }

    // Test 3: Check adaptive question selection
    console.log(`\n${colors.yellow}Test 3: Testing adaptive question selection...${colors.reset}`);
    const testProfile = {
      traits: {
        openness: 75,
        conscientiousness: 35,
        extraversion: 60,
        agreeableness: 50,
        neuroticism: 40
      },
      patterns: []
    };

    const excludeIds = baselineQuestions.map(q => q.questionId);
    const adaptiveQuestions = await QuestionBank.getAdaptiveQuestions(testProfile, excludeIds, 20);

    if (adaptiveQuestions.length > 0) {
      tests.passed.push('Can fetch adaptive questions based on profile');
      console.log(
        `  ${colors.green}✓ Found ${adaptiveQuestions.length} adaptive questions${colors.reset}`
      );
      console.log(
        `  Sample IDs: ${adaptiveQuestions
          .slice(0, 3)
          .map(q => q.questionId)
          .join(', ')}`
      );
    } else {
      tests.failed.push('No adaptive questions found');
      console.log(`  ${colors.red}✗ No adaptive questions found${colors.reset}`);
    }

    // Test 4: Check question lookup by ID
    console.log(`\n${colors.yellow}Test 4: Testing question lookup by ID...${colors.reset}`);
    const sampleIds = ['BFI_OPEN_001', 'NDV_EXEC_001', 'COG_SPAT_001'];
    let lookupSuccess = 0;

    for (const id of sampleIds) {
      const question = await QuestionBank.findOne({ questionId: id });
      if (question) {
        lookupSuccess++;
        console.log(`  ${colors.green}✓ Found: ${id}${colors.reset}`);
      } else {
        console.log(`  ${colors.yellow}⚠ Not found: ${id} (may not exist)${colors.reset}`);
      }
    }

    if (lookupSuccess > 0) {
      tests.passed.push(`Can lookup questions by new IDs (${lookupSuccess}/${sampleIds.length})`);
    } else {
      tests.failed.push('Cannot lookup questions by new IDs');
    }

    // Test 5: Check ID pattern consistency
    console.log(`\n${colors.yellow}Test 5: Checking ID pattern consistency...${colors.reset}`);
    const allIds = await QuestionBank.find({}, 'questionId');
    const patterns = new Set();
    const invalidIds = [];

    allIds.forEach(q => {
      const pattern = q.questionId.replace(/\d+/g, '#');
      patterns.add(pattern);

      // Check if ID follows new format
      if (!q.questionId.match(/^[A-Z]+_[A-Z]+_\d{3}$/)) {
        invalidIds.push(q.questionId);
      }
    });

    console.log(`  Total patterns: ${patterns.size}`);
    console.log(`  Invalid format IDs: ${invalidIds.length}`);

    if (invalidIds.length === 0) {
      tests.passed.push('All IDs follow new format');
      console.log(`  ${colors.green}✓ All IDs follow standard format${colors.reset}`);
    } else {
      tests.passed.push(
        `Most IDs follow new format (${allIds.length - invalidIds.length}/${allIds.length})`
      );
      console.log(
        `  ${colors.yellow}⚠ ${invalidIds.length} IDs don't follow standard format${colors.reset}`
      );
      if (invalidIds.length <= 10) {
        console.log(`  Non-standard IDs: ${invalidIds.join(', ')}`);
      }
    }

    // Test 6: Check category-specific queries
    console.log(`\n${colors.yellow}Test 6: Testing category-specific queries...${colors.reset}`);
    const categories = ['personality', 'neurodiversity', 'cognitive'];

    for (const category of categories) {
      const questions = await QuestionBank.find({ category }).limit(5);
      if (questions.length > 0) {
        console.log(`  ${colors.green}✓ ${category}: ${questions.length} questions${colors.reset}`);
        tests.passed.push(`Can query ${category} questions`);
      } else {
        console.log(`  ${colors.red}✗ ${category}: No questions found${colors.reset}`);
        tests.failed.push(`Cannot query ${category} questions`);
      }
    }

    // Final Summary
    console.log(
      `\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`
    );
    console.log(`${colors.cyan}                    TEST SUMMARY${colors.reset}`);
    console.log(
      `${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`
    );

    const totalTests = tests.passed.length + tests.failed.length;
    const successRate = Math.round((tests.passed.length / totalTests) * 100);

    if (successRate === 100) {
      console.log(
        `${colors.green}✅ ALL TESTS PASSED (${tests.passed.length}/${totalTests})${colors.reset}`
      );
    } else if (successRate >= 80) {
      console.log(
        `${colors.yellow}⚠️  MOSTLY PASSED (${tests.passed.length}/${totalTests})${colors.reset}`
      );
    } else {
      console.log(
        `${colors.red}❌ TESTS FAILED (${tests.passed.length}/${totalTests})${colors.reset}`
      );
    }

    console.log(`\n${colors.green}Passed Tests:${colors.reset}`);
    tests.passed.forEach(test => console.log(`  ✓ ${test}`));

    if (tests.failed.length > 0) {
      console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
      tests.failed.forEach(test => console.log(`  ✗ ${test}`));
    }

    console.log(`\n${colors.cyan}CONCLUSION:${colors.reset}`);
    if (successRate >= 90) {
      console.log(
        `${colors.green}The system is working correctly with the new standardized IDs!${colors.reset}`
      );
      console.log(`${colors.green}The assessment system should function normally.${colors.reset}`);
    } else if (successRate >= 70) {
      console.log(
        `${colors.yellow}The system is mostly working but may have some issues.${colors.reset}`
      );
      console.log(`${colors.yellow}Consider reviewing the failed tests.${colors.reset}`);
    } else {
      console.log(
        `${colors.red}The system has significant issues with the new IDs.${colors.reset}`
      );
      console.log(`${colors.red}Review and fix the failed tests before proceeding.${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}✗ Test error:${colors.reset}`, error);
  }
}

async function main() {
  await connectDB();
  await testNewIds();
  await mongoose.connection.close();
  console.log(`\n${colors.green}✓ Test complete${colors.reset}`);
}

// Run the tests
main().catch(console.error);
