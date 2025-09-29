#!/usr/bin/env node

/**
 * Analyze Question ID Patterns
 * Shows exactly what ID patterns exist in the database
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
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

async function analyzeIdPatterns() {
  console.log(
    `\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(`${colors.cyan}           QUESTION ID PATTERN ANALYSIS${colors.reset}`);
  console.log(
    `${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`
  );

  try {
    const allQuestions = await QuestionBank.find(
      {},
      'questionId category subcategory trait'
    ).lean();

    // Group IDs by pattern
    const patternGroups = new Map();
    const categoryPatterns = {};

    allQuestions.forEach(q => {
      // Create pattern by replacing numbers with #
      const pattern = q.questionId.replace(/\d+/g, '#');

      if (!patternGroups.has(pattern)) {
        patternGroups.set(pattern, []);
      }
      patternGroups.get(pattern).push({
        id: q.questionId,
        category: q.category,
        subcategory: q.subcategory,
        trait: q.trait
      });

      // Track patterns per category
      if (!categoryPatterns[q.category]) {
        categoryPatterns[q.category] = new Set();
      }
      categoryPatterns[q.category].add(pattern);
    });

    // Sort patterns by frequency
    const sortedPatterns = Array.from(patternGroups.entries()).sort(
      (a, b) => b[1].length - a[1].length
    );

    console.log(
      `${colors.yellow}Total Unique Patterns Found: ${patternGroups.size}${colors.reset}\n`
    );

    // Show top patterns
    console.log(`${colors.blue}Top 20 Most Common Patterns:${colors.reset}`);
    sortedPatterns.slice(0, 20).forEach(([pattern, questions], index) => {
      const categories = [...new Set(questions.map(q => q.category))];
      console.log(
        `${index + 1}. ${colors.white}${pattern}${colors.reset} (${questions.length} questions)`
      );
      console.log(`   Categories: ${categories.join(', ')}`);
      console.log(
        `   Examples: ${questions
          .slice(0, 3)
          .map(q => q.id)
          .join(', ')}`
      );
      console.log();
    });

    // Analyze patterns by category
    console.log(`${colors.blue}Patterns by Category:${colors.reset}`);
    Object.entries(categoryPatterns).forEach(([category, patterns]) => {
      console.log(`\n${colors.yellow}${category}:${colors.reset} ${patterns.size} unique patterns`);
      const catQuestions = allQuestions.filter(q => q.category === category);

      // Show the patterns for this category
      const catPatternFreq = {};
      catQuestions.forEach(q => {
        const pattern = q.questionId.replace(/\d+/g, '#');
        catPatternFreq[pattern] = (catPatternFreq[pattern] || 0) + 1;
      });

      Object.entries(catPatternFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([pattern, count]) => {
          console.log(`  - ${pattern} (${count} questions)`);
        });
    });

    // Identify problematic patterns
    console.log(`\n${colors.red}Problematic Patterns (single use):${colors.reset}`);
    const singleUsePatterns = sortedPatterns.filter(([_, questions]) => questions.length === 1);
    console.log(`Found ${singleUsePatterns.length} patterns used only once`);

    if (singleUsePatterns.length > 0) {
      console.log(`\nExamples of single-use patterns:`);
      singleUsePatterns.slice(0, 10).forEach(([pattern, questions]) => {
        console.log(`  - ${pattern}: ${questions[0].id} (${questions[0].category})`);
      });
    }

    // Recommended standardization
    console.log(
      `\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`
    );
    console.log(`${colors.cyan}              STANDARDIZATION RECOMMENDATIONS${colors.reset}`);
    console.log(
      `${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`
    );

    console.log(`${colors.green}Recommended ID Format:${colors.reset}`);
    console.log(`  CATEGORY_SUBCATEGORY_###\n`);

    console.log(`${colors.green}Suggested Prefixes:${colors.reset}`);
    console.log(`  personality     → BFI_TRAIT_###`);
    console.log(`  neurodiversity  → NEURO_SUBCAT_###`);
    console.log(`  cognitive       → COG_DOMAIN_###`);
    console.log(`  cognitive_functions → JUNG_FUNC_###`);
    console.log(`  enneagram       → ENNEA_TYPE_###`);
    console.log(`  attachment      → ATTACH_STYLE_###`);
    console.log(`  trauma_screening → TRAUMA_AREA_###`);
    console.log(`  learning_style  → LEARN_STYLE_###`);

    // Check current compliance
    const recommendedPatterns = [
      /^BFI_[A-Z]+_\d+$/,
      /^NEURO_[A-Z]+_\d+$/,
      /^COG_[A-Z]+_\d+$/,
      /^JUNG_[A-Z]+_\d+$/,
      /^ENNEA_[A-Z]+_\d+$/,
      /^ATTACH_[A-Z]+_\d+$/,
      /^TRAUMA_[A-Z]+_\d+$/,
      /^LEARN_[A-Z]+_\d+$/
    ];

    let compliantCount = 0;
    allQuestions.forEach(q => {
      if (recommendedPatterns.some(pattern => pattern.test(q.questionId))) {
        compliantCount++;
      }
    });

    const compliancePercent = Math.round((compliantCount / allQuestions.length) * 100);

    console.log(`\n${colors.yellow}Current Compliance:${colors.reset}`);
    console.log(
      `  ${compliantCount}/${allQuestions.length} questions (${compliancePercent}%) follow recommended format`
    );

    if (compliancePercent < 50) {
      console.log(`\n${colors.red}⚠ Low compliance with recommended format${colors.reset}`);
      console.log(`  Consider running a standardization script to update all IDs`);
    }

    // Save detailed analysis
    const analysis = {
      totalQuestions: allQuestions.length,
      uniquePatterns: patternGroups.size,
      patternsPerCategory: Object.entries(categoryPatterns).map(([cat, patterns]) => ({
        category: cat,
        patternCount: patterns.size,
        patterns: Array.from(patterns)
      })),
      mostCommonPatterns: sortedPatterns.slice(0, 20).map(([pattern, questions]) => ({
        pattern,
        count: questions.length,
        examples: questions.slice(0, 5).map(q => q.id)
      })),
      singleUsePatterns: singleUsePatterns.length,
      compliance: {
        count: compliantCount,
        percent: compliancePercent
      }
    };

    const reportPath = './scripts/id-pattern-analysis.json';
    require('fs').writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
    console.log(`\n${colors.green}✓ Detailed analysis saved to: ${reportPath}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Analysis error:${colors.reset}`, error);
  }
}

async function main() {
  await connectDB();
  await analyzeIdPatterns();
  await mongoose.connection.close();
  console.log(`\n${colors.green}✓ Analysis complete${colors.reset}`);
}

main().catch(console.error);
