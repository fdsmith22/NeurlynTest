#!/usr/bin/env node

/**
 * QuestionBank Health Verification Script
 * Provides a final comprehensive health check of the reorganized database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m'
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

async function verifyQuestionBankHealth() {
  console.log(
    `\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(`${colors.cyan}         QUESTIONBANK HEALTH VERIFICATION${colors.reset}`);
  console.log(
    `${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`
  );

  const healthReport = {
    passed: [],
    warnings: [],
    failures: [],
    metrics: {}
  };

  try {
    // Fetch all questions
    const allQuestions = await QuestionBank.find({});
    healthReport.metrics.total = allQuestions.length;

    // 1. Check baseline questions
    console.log(`${colors.yellow}1. Baseline Questions Check${colors.reset}`);
    const baselineQuestions = allQuestions.filter(q => q.adaptive?.isBaseline === true);
    healthReport.metrics.baseline = baselineQuestions.length;

    if (baselineQuestions.length >= 10) {
      healthReport.passed.push(`✓ ${baselineQuestions.length} baseline questions configured`);
      console.log(
        `  ${colors.green}✓ PASSED: ${baselineQuestions.length} baseline questions${colors.reset}`
      );
    } else {
      healthReport.failures.push(
        `✗ Only ${baselineQuestions.length} baseline questions (minimum 10 recommended)`
      );
      console.log(
        `  ${colors.red}✗ FAILED: Only ${baselineQuestions.length} baseline questions${colors.reset}`
      );
    }

    // 2. Check adaptive criteria
    console.log(`\n${colors.yellow}2. Adaptive Criteria Check${colors.reset}`);
    const adaptiveQuestions = allQuestions.filter(q => !q.adaptive?.isBaseline);
    const withCriteria = adaptiveQuestions.filter(q => {
      const criteria = q.adaptive?.adaptiveCriteria;
      return (
        criteria &&
        ((criteria.triggerTraits && criteria.triggerTraits.length > 0) ||
          (criteria.triggerPatterns && criteria.triggerPatterns.length > 0))
      );
    });

    healthReport.metrics.adaptive = adaptiveQuestions.length;
    healthReport.metrics.withCriteria = withCriteria.length;

    const criteriaPercent =
      adaptiveQuestions.length > 0
        ? Math.round((withCriteria.length / adaptiveQuestions.length) * 100)
        : 0;

    if (criteriaPercent >= 80) {
      healthReport.passed.push(`✓ ${criteriaPercent}% of adaptive questions have criteria`);
      console.log(`  ${colors.green}✓ PASSED: ${criteriaPercent}% have criteria${colors.reset}`);
    } else if (criteriaPercent >= 50) {
      healthReport.warnings.push(`⚠ Only ${criteriaPercent}% of adaptive questions have criteria`);
      console.log(
        `  ${colors.yellow}⚠ WARNING: Only ${criteriaPercent}% have criteria${colors.reset}`
      );
    } else {
      healthReport.failures.push(`✗ Only ${criteriaPercent}% of adaptive questions have criteria`);
      console.log(`  ${colors.red}✗ FAILED: Only ${criteriaPercent}% have criteria${colors.reset}`);
    }

    // 3. Check question IDs
    console.log(`\n${colors.yellow}3. Question ID Standardization${colors.reset}`);
    const idPatterns = new Set();
    const duplicateIds = new Map();

    allQuestions.forEach(q => {
      // Check for duplicate IDs
      if (duplicateIds.has(q.questionId)) {
        duplicateIds.get(q.questionId).push(q);
      } else {
        duplicateIds.set(q.questionId, [q]);
      }

      // Check ID format
      const pattern = q.questionId.replace(/\d+/g, '#');
      idPatterns.add(pattern);
    });

    const duplicates = Array.from(duplicateIds.entries()).filter(
      ([_, questions]) => questions.length > 1
    );
    healthReport.metrics.duplicateIds = duplicates.length;
    healthReport.metrics.idPatterns = idPatterns.size;

    if (duplicates.length === 0) {
      healthReport.passed.push(`✓ All question IDs are unique`);
      console.log(`  ${colors.green}✓ PASSED: All IDs unique${colors.reset}`);
    } else {
      healthReport.failures.push(`✗ ${duplicates.length} duplicate IDs found`);
      console.log(`  ${colors.red}✗ FAILED: ${duplicates.length} duplicate IDs${colors.reset}`);
    }

    if (idPatterns.size <= 10) {
      healthReport.passed.push(`✓ ID formats standardized (${idPatterns.size} patterns)`);
      console.log(`  ${colors.green}✓ PASSED: ${idPatterns.size} ID patterns${colors.reset}`);
    } else {
      healthReport.warnings.push(`⚠ ${idPatterns.size} different ID patterns found`);
      console.log(`  ${colors.yellow}⚠ WARNING: ${idPatterns.size} ID patterns${colors.reset}`);
    }

    // 4. Check required fields
    console.log(`\n${colors.yellow}4. Required Fields Check${colors.reset}`);
    const requiredFields = ['questionId', 'text', 'category', 'instrument', 'responseType'];
    const missingRequired = allQuestions.filter(q => requiredFields.some(field => !q[field]));

    healthReport.metrics.missingRequired = missingRequired.length;

    if (missingRequired.length === 0) {
      healthReport.passed.push(`✓ All questions have required fields`);
      console.log(`  ${colors.green}✓ PASSED: All required fields present${colors.reset}`);
    } else {
      healthReport.failures.push(`✗ ${missingRequired.length} questions missing required fields`);
      console.log(
        `  ${colors.red}✗ FAILED: ${missingRequired.length} missing fields${colors.reset}`
      );
    }

    // 5. Check category distribution
    console.log(`\n${colors.yellow}5. Category Distribution${colors.reset}`);
    const categoryCount = {};
    allQuestions.forEach(q => {
      categoryCount[q.category] = (categoryCount[q.category] || 0) + 1;
    });

    healthReport.metrics.categories = Object.keys(categoryCount).length;

    console.log(`  Categories found: ${Object.keys(categoryCount).length}`);
    Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        const percent = Math.round((count / allQuestions.length) * 100);
        console.log(`    - ${cat}: ${count} (${percent}%)`);
      });

    if (Object.keys(categoryCount).length >= 5) {
      healthReport.passed.push(
        `✓ Good category diversity (${Object.keys(categoryCount).length} categories)`
      );
    }

    // 6. Check trait balance for personality questions
    console.log(`\n${colors.yellow}6. Personality Trait Balance${colors.reset}`);
    const personalityQuestions = allQuestions.filter(q => q.category === 'personality');
    const traitCount = {};

    personalityQuestions.forEach(q => {
      if (q.trait) {
        traitCount[q.trait] = (traitCount[q.trait] || 0) + 1;
      }
    });

    const bigFiveTraits = [
      'openness',
      'conscientiousness',
      'extraversion',
      'agreeableness',
      'neuroticism'
    ];
    const bigFiveCoverage = bigFiveTraits.filter(trait => traitCount[trait] >= 5);

    if (bigFiveCoverage.length === 5) {
      healthReport.passed.push(`✓ All Big Five traits covered adequately`);
      console.log(`  ${colors.green}✓ PASSED: All Big Five traits covered${colors.reset}`);
    } else {
      const missing = bigFiveTraits.filter(t => !bigFiveCoverage.includes(t));
      healthReport.warnings.push(`⚠ Insufficient coverage for: ${missing.join(', ')}`);
      console.log(
        `  ${colors.yellow}⚠ WARNING: Low coverage for ${missing.join(', ')}${colors.reset}`
      );
    }

    // 7. Check metadata completeness
    console.log(`\n${colors.yellow}7. Metadata Completeness${colors.reset}`);
    const withMetadata = allQuestions.filter(q => q.metadata && q.metadata.addedDate);
    const metadataPercent = Math.round((withMetadata.length / allQuestions.length) * 100);

    healthReport.metrics.withMetadata = withMetadata.length;

    if (metadataPercent >= 90) {
      healthReport.passed.push(`✓ ${metadataPercent}% have metadata`);
      console.log(`  ${colors.green}✓ PASSED: ${metadataPercent}% have metadata${colors.reset}`);
    } else {
      healthReport.warnings.push(`⚠ Only ${metadataPercent}% have metadata`);
      console.log(`  ${colors.yellow}⚠ WARNING: ${metadataPercent}% have metadata${colors.reset}`);
    }

    // Calculate overall health score
    const totalChecks =
      healthReport.passed.length + healthReport.warnings.length + healthReport.failures.length;
    const healthScore = Math.round(
      (healthReport.passed.length * 100 +
        healthReport.warnings.length * 50 +
        healthReport.failures.length * 0) /
        totalChecks
    );

    healthReport.metrics.healthScore = healthScore;

    // Final Report
    console.log(
      `\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`
    );
    console.log(`${colors.cyan}                   HEALTH REPORT SUMMARY${colors.reset}`);
    console.log(
      `${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`
    );

    // Health Score with color
    let scoreColor = colors.green;
    let scoreLabel = 'EXCELLENT';
    if (healthScore < 50) {
      scoreColor = colors.red;
      scoreLabel = 'CRITICAL';
    } else if (healthScore < 70) {
      scoreColor = colors.yellow;
      scoreLabel = 'NEEDS IMPROVEMENT';
    } else if (healthScore < 90) {
      scoreColor = colors.blue;
      scoreLabel = 'GOOD';
    }

    console.log(`${scoreColor}╔═══════════════════════════════════════╗${colors.reset}`);
    console.log(
      `${scoreColor}║   HEALTH SCORE: ${healthScore}% - ${scoreLabel}${' '.repeat(Math.max(0, 20 - scoreLabel.length))}║${colors.reset}`
    );
    console.log(`${scoreColor}╚═══════════════════════════════════════╝${colors.reset}`);

    console.log(`\n${colors.white}Metrics Summary:${colors.reset}`);
    console.log(`  Total Questions: ${healthReport.metrics.total}`);
    console.log(`  Baseline Questions: ${healthReport.metrics.baseline}`);
    console.log(`  Adaptive Questions: ${healthReport.metrics.adaptive}`);
    console.log(`  With Adaptive Criteria: ${healthReport.metrics.withCriteria}`);
    console.log(`  Categories: ${healthReport.metrics.categories}`);
    console.log(`  Unique ID Patterns: ${healthReport.metrics.idPatterns}`);

    if (healthReport.passed.length > 0) {
      console.log(`\n${colors.green}Passed Checks (${healthReport.passed.length}):${colors.reset}`);
      healthReport.passed.forEach(item => console.log(`  ${item}`));
    }

    if (healthReport.warnings.length > 0) {
      console.log(`\n${colors.yellow}Warnings (${healthReport.warnings.length}):${colors.reset}`);
      healthReport.warnings.forEach(item => console.log(`  ${item}`));
    }

    if (healthReport.failures.length > 0) {
      console.log(`\n${colors.red}Failed Checks (${healthReport.failures.length}):${colors.reset}`);
      healthReport.failures.forEach(item => console.log(`  ${item}`));
    }

    // Recommendations
    console.log(`\n${colors.cyan}Recommendations:${colors.reset}`);
    if (healthReport.failures.length > 0) {
      console.log(`  1. Address critical failures first`);
    }
    if (healthReport.metrics.baseline < 20) {
      console.log(`  2. Consider adding more baseline questions for better initial profiling`);
    }
    if (healthReport.metrics.withCriteria < healthReport.metrics.adaptive * 0.8) {
      console.log(`  3. Add adaptive criteria to remaining questions`);
    }
    if (healthReport.metrics.idPatterns > 10) {
      console.log(`  4. Standardize question ID format further`);
    }

    // Save detailed report
    const reportPath = './scripts/questionbank-health-report.json';
    require('fs').writeFileSync(reportPath, JSON.stringify(healthReport, null, 2));
    console.log(`\n${colors.green}✓ Detailed report saved to: ${reportPath}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Health check error:${colors.reset}`, error);
  }
}

async function main() {
  await connectDB();
  await verifyQuestionBankHealth();
  await mongoose.connection.close();
  console.log(`\n${colors.green}✓ Health verification complete${colors.reset}`);
}

// Run the verification
main().catch(console.error);
