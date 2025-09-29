#!/usr/bin/env node

/**
 * Deep QuestionBank Analysis Script
 * Performs comprehensive analysis of the question database to:
 * - Identify duplicate questions
 * - Check tagging completeness
 * - Verify question IDs
 * - Analyze adaptive criteria
 * - Check indicator coverage
 */

require('dotenv').config();
const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
const logger = require('../utils/logger');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`${colors.green}✓ Connected to MongoDB${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ MongoDB connection error:${colors.reset}`, error);
    process.exit(1);
  }
}

async function analyzeQuestionBank() {
  const report = {
    totalQuestions: 0,
    duplicates: [],
    missingTags: [],
    incompleteAdaptiveCriteria: [],
    questionsByCategory: {},
    questionsByInstrument: {},
    questionsByTrait: {},
    idIssues: [],
    recommendations: []
  };

  try {
    // Fetch all questions
    const allQuestions = await QuestionBank.find({}).lean();
    report.totalQuestions = allQuestions.length;

    console.log(
      `\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`
    );
    console.log(`${colors.cyan}     DEEP QUESTIONBANK ANALYSIS REPORT${colors.reset}`);
    console.log(
      `${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`
    );

    console.log(`${colors.blue}Total Questions Found:${colors.reset} ${report.totalQuestions}`);

    // 1. Check for duplicate questions by text
    console.log(`\n${colors.yellow}1. Checking for Duplicate Questions...${colors.reset}`);
    const questionTextMap = new Map();
    const duplicateGroups = new Map();

    allQuestions.forEach(q => {
      const normalizedText = q.text.toLowerCase().trim();
      if (questionTextMap.has(normalizedText)) {
        if (!duplicateGroups.has(normalizedText)) {
          duplicateGroups.set(normalizedText, [questionTextMap.get(normalizedText)]);
        }
        duplicateGroups.get(normalizedText).push(q);
      } else {
        questionTextMap.set(normalizedText, q);
      }
    });

    duplicateGroups.forEach((questions, text) => {
      report.duplicates.push({
        text: questions[0].text,
        count: questions.length,
        ids: questions.map(q => q.questionId),
        categories: [...new Set(questions.map(q => q.category))]
      });
    });

    if (report.duplicates.length > 0) {
      console.log(
        `${colors.red}✗ Found ${report.duplicates.length} duplicate question groups:${colors.reset}`
      );
      report.duplicates.forEach(dup => {
        console.log(`  - "${dup.text.substring(0, 50)}..." (${dup.count} copies)`);
        console.log(`    IDs: ${dup.ids.join(', ')}`);
      });
    } else {
      console.log(`${colors.green}✓ No duplicate questions found${colors.reset}`);
    }

    // 2. Check for missing or incomplete tags
    console.log(`\n${colors.yellow}2. Analyzing Question Tags and Metadata...${colors.reset}`);
    const requiredFields = ['questionId', 'text', 'category', 'instrument'];
    const optionalButImportant = [
      'trait',
      'subcategory',
      'domain',
      'responseType',
      'scoringDirection'
    ];

    allQuestions.forEach(q => {
      const missingRequired = requiredFields.filter(field => !q[field]);
      const missingOptional = optionalButImportant.filter(field => !q[field]);

      if (missingRequired.length > 0 || missingOptional.length > 0) {
        report.missingTags.push({
          questionId: q.questionId,
          text: q.text?.substring(0, 50) + '...',
          missingRequired,
          missingOptional
        });
      }
    });

    if (report.missingTags.length > 0) {
      console.log(
        `${colors.yellow}⚠ Found ${report.missingTags.length} questions with missing tags:${colors.reset}`
      );
      const criticalMissing = report.missingTags.filter(q => q.missingRequired.length > 0);
      if (criticalMissing.length > 0) {
        console.log(
          `${colors.red}  - ${criticalMissing.length} with REQUIRED fields missing${colors.reset}`
        );
      }
      console.log(
        `  - ${report.missingTags.filter(q => q.missingOptional.length > 0).length} with optional fields missing`
      );
    } else {
      console.log(`${colors.green}✓ All questions have complete tags${colors.reset}`);
    }

    // 3. Analyze question distribution
    console.log(`\n${colors.yellow}3. Question Distribution Analysis...${colors.reset}`);

    // By category
    allQuestions.forEach(q => {
      if (q.category) {
        report.questionsByCategory[q.category] = (report.questionsByCategory[q.category] || 0) + 1;
      }
    });

    console.log(`${colors.blue}By Category:${colors.reset}`);
    Object.entries(report.questionsByCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        const percentage = ((count / report.totalQuestions) * 100).toFixed(1);
        console.log(`  - ${cat}: ${count} (${percentage}%)`);
      });

    // By instrument
    allQuestions.forEach(q => {
      if (q.instrument) {
        report.questionsByInstrument[q.instrument] =
          (report.questionsByInstrument[q.instrument] || 0) + 1;
      }
    });

    console.log(`\n${colors.blue}By Instrument:${colors.reset}`);
    Object.entries(report.questionsByInstrument)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10) // Top 10 instruments
      .forEach(([inst, count]) => {
        console.log(`  - ${inst}: ${count}`);
      });

    // By trait (for personality questions)
    const personalityQuestions = allQuestions.filter(q => q.category === 'personality');
    personalityQuestions.forEach(q => {
      if (q.trait) {
        report.questionsByTrait[q.trait] = (report.questionsByTrait[q.trait] || 0) + 1;
      }
    });

    console.log(`\n${colors.blue}Personality Questions by Trait:${colors.reset}`);
    Object.entries(report.questionsByTrait)
      .sort((a, b) => b[1] - a[1])
      .forEach(([trait, count]) => {
        console.log(`  - ${trait}: ${count}`);
      });

    // 4. Check adaptive criteria
    console.log(`\n${colors.yellow}4. Adaptive Criteria Analysis...${colors.reset}`);

    const baselineQuestions = allQuestions.filter(q => q.isBaseline);
    const adaptiveQuestions = allQuestions.filter(q => !q.isBaseline);

    console.log(`  - Baseline questions: ${baselineQuestions.length}`);
    console.log(`  - Adaptive questions: ${adaptiveQuestions.length}`);

    // Check adaptive questions for proper criteria
    adaptiveQuestions.forEach(q => {
      if (
        !q.adaptiveCriteria ||
        (!q.adaptiveCriteria.triggerTraits?.length &&
          !q.adaptiveCriteria.triggerPatterns?.length &&
          !q.adaptiveCriteria.followUpTo?.length)
      ) {
        report.incompleteAdaptiveCriteria.push({
          questionId: q.questionId,
          text: q.text?.substring(0, 50) + '...',
          issue: 'No adaptive criteria defined'
        });
      }
    });

    if (report.incompleteAdaptiveCriteria.length > 0) {
      console.log(
        `${colors.yellow}⚠ Found ${report.incompleteAdaptiveCriteria.length} adaptive questions without proper criteria${colors.reset}`
      );
    } else {
      console.log(`${colors.green}✓ All adaptive questions have proper criteria${colors.reset}`);
    }

    // 5. Check question ID consistency
    console.log(`\n${colors.yellow}5. Question ID Analysis...${colors.reset}`);

    const idMap = new Map();
    allQuestions.forEach(q => {
      if (idMap.has(q.questionId)) {
        report.idIssues.push({
          id: q.questionId,
          issue: 'Duplicate ID',
          questions: [idMap.get(q.questionId), q]
        });
      } else {
        idMap.set(q.questionId, q);
      }
    });

    // Check for ID format consistency
    const idFormats = new Set();
    allQuestions.forEach(q => {
      const format = q.questionId.replace(/[0-9]/g, '#');
      idFormats.add(format);
    });

    console.log(`  - Unique ID formats found: ${idFormats.size}`);
    if (idFormats.size > 5) {
      console.log(
        `${colors.yellow}⚠ Multiple ID formats detected. Consider standardizing.${colors.reset}`
      );
      report.recommendations.push('Standardize question ID format for consistency');
    }

    if (report.idIssues.length > 0) {
      console.log(`${colors.red}✗ Found ${report.idIssues.length} ID issues${colors.reset}`);
    } else {
      console.log(`${colors.green}✓ All question IDs are unique${colors.reset}`);
    }

    // 6. Check for questions without scoring information
    console.log(`\n${colors.yellow}6. Scoring Information Analysis...${colors.reset}`);

    const missingScoringInfo = allQuestions.filter(
      q => !q.scoringDirection && !q.responseType && !q.responseOptions
    );

    if (missingScoringInfo.length > 0) {
      console.log(
        `${colors.yellow}⚠ ${missingScoringInfo.length} questions missing scoring information${colors.reset}`
      );
      report.recommendations.push(
        `Add scoring information to ${missingScoringInfo.length} questions`
      );
    } else {
      console.log(`${colors.green}✓ All questions have scoring information${colors.reset}`);
    }

    // 7. Generate recommendations
    console.log(
      `\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`
    );
    console.log(`${colors.cyan}                    RECOMMENDATIONS${colors.reset}`);
    console.log(
      `${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`
    );

    // Auto-generate recommendations based on findings
    if (report.duplicates.length > 0) {
      report.recommendations.push(
        `Remove ${report.duplicates.reduce((sum, d) => sum + d.count - 1, 0)} duplicate questions`
      );
    }

    if (report.missingTags.filter(q => q.missingRequired.length > 0).length > 0) {
      report.recommendations.push('Add missing required fields to incomplete questions');
    }

    if (report.incompleteAdaptiveCriteria.length > 0) {
      report.recommendations.push('Define adaptive criteria for all non-baseline questions');
    }

    // Check trait balance
    const traitCounts = Object.values(report.questionsByTrait);
    if (traitCounts.length > 0) {
      const avgTraitCount = traitCounts.reduce((a, b) => a + b, 0) / traitCounts.length;
      const unbalanced = traitCounts.filter(
        c => c < avgTraitCount * 0.7 || c > avgTraitCount * 1.3
      );
      if (unbalanced.length > 0) {
        report.recommendations.push('Balance personality trait questions for even coverage');
      }
    }

    if (report.recommendations.length === 0) {
      report.recommendations.push(
        'Database is well-organized! Consider adding more specialized questions.'
      );
    }

    report.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });

    // 8. Summary statistics
    console.log(
      `\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`
    );
    console.log(`${colors.cyan}                    SUMMARY STATISTICS${colors.reset}`);
    console.log(
      `${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`
    );

    const healthScore = calculateHealthScore(report);
    const healthColor =
      healthScore >= 90 ? colors.green : healthScore >= 70 ? colors.yellow : colors.red;

    console.log(`Database Health Score: ${healthColor}${healthScore}%${colors.reset}`);
    console.log(`\nKey Metrics:`);
    console.log(`  - Total Questions: ${report.totalQuestions}`);
    console.log(`  - Duplicate Groups: ${report.duplicates.length}`);
    console.log(`  - Questions with Missing Tags: ${report.missingTags.length}`);
    console.log(`  - Categories Covered: ${Object.keys(report.questionsByCategory).length}`);
    console.log(`  - Instruments Used: ${Object.keys(report.questionsByInstrument).length}`);
    console.log(
      `  - Baseline/Adaptive Ratio: ${baselineQuestions.length}:${adaptiveQuestions.length}`
    );

    // Save detailed report to file
    const reportPath = './scripts/questionbank-analysis-report.json';
    require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n${colors.green}✓ Detailed report saved to: ${reportPath}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Analysis error:${colors.reset}`, error);
  }
}

function calculateHealthScore(report) {
  let score = 100;

  // Deduct points for issues
  score -= report.duplicates.length * 2;
  score -= report.missingTags.filter(q => q.missingRequired.length > 0).length * 5;
  score -= report.missingTags.filter(q => q.missingOptional.length > 0).length * 1;
  score -= report.incompleteAdaptiveCriteria.length * 1;
  score -= report.idIssues.length * 10;

  // Bonus points for good coverage
  if (Object.keys(report.questionsByCategory).length >= 10) score += 5;
  if (Object.keys(report.questionsByInstrument).length >= 15) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

async function main() {
  await connectDB();
  await analyzeQuestionBank();
  await mongoose.connection.close();
  console.log(`\n${colors.green}✓ Analysis complete${colors.reset}`);
}

// Run the analysis
main().catch(console.error);
