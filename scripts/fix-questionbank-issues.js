#!/usr/bin/env node

/**
 * QuestionBank Fix Script
 * Fixes all identified issues:
 * - Adds baseline questions and priorities
 * - Defines adaptive criteria for all questions
 * - Standardizes question IDs
 * - Adds missing metadata fields
 * - Ensures proper tagging for all indicators
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
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test');
    console.log(`${colors.green}✓ Connected to MongoDB${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ MongoDB connection error:${colors.reset}`, error);
    process.exit(1);
  }
}

async function fixQuestionBank() {
  console.log(
    `\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(`${colors.cyan}     QUESTIONBANK FIX SCRIPT${colors.reset}`);
  console.log(
    `${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`
  );

  try {
    // Fetch all questions
    const allQuestions = await QuestionBank.find({});
    console.log(`${colors.blue}Found ${allQuestions.length} questions to fix${colors.reset}\n`);

    // Track changes
    let fixedCount = 0;
    let baselineCount = 0;
    let idStandardized = 0;
    let adaptiveCriteriaAdded = 0;
    let metadataFixed = 0;

    // Group questions by category for baseline selection
    const questionsByCategory = {};
    allQuestions.forEach(q => {
      if (!questionsByCategory[q.category]) {
        questionsByCategory[q.category] = [];
      }
      questionsByCategory[q.category].push(q);
    });

    // 1. Fix Question IDs - Standardize format
    console.log(`${colors.yellow}1. Standardizing Question IDs...${colors.reset}`);

    for (const [category, questions] of Object.entries(questionsByCategory)) {
      questions.forEach((q, index) => {
        const oldId = q.questionId;
        let newId;

        // Standardized format: CATEGORY_SUBCATEGORY_NUMBER
        switch (category) {
          case 'personality':
            const trait = (q.trait || 'general').toUpperCase();
            newId = `BFI_${trait}_${index + 1}`;
            break;
          case 'neurodiversity':
            const subcategory = (q.subcategory || 'general').toUpperCase();
            newId = `NEURO_${subcategory}_${index + 1}`;
            break;
          case 'cognitive':
            newId = `COG_${(q.domain || 'general').toUpperCase()}_${index + 1}`;
            break;
          case 'cognitive_functions':
            newId = `JUNG_${(q.domain || 'general').toUpperCase()}_${index + 1}`;
            break;
          case 'enneagram':
            newId = `ENNEA_TYPE${q.domain || index + 1}`;
            break;
          case 'attachment':
            newId = `ATTACH_${(q.domain || 'general').toUpperCase()}_${index + 1}`;
            break;
          case 'trauma_screening':
            newId = `TRAUMA_${(q.domain || 'general').toUpperCase()}_${index + 1}`;
            break;
          case 'learning_style':
            newId = `LEARN_${(q.domain || 'general').toUpperCase()}_${index + 1}`;
            break;
          default:
            newId = `${category.toUpperCase()}_${index + 1}`;
        }

        if (oldId !== newId) {
          q.questionId = newId;
          idStandardized++;
        }
      });
    }

    console.log(`  ${colors.green}✓ Standardized ${idStandardized} question IDs${colors.reset}`);

    // 2. Set baseline questions
    console.log(`\n${colors.yellow}2. Setting Baseline Questions...${colors.reset}`);

    // Define baseline priorities per category
    const baselineCriteria = {
      personality: {
        count: 10, // First 2 of each Big Five trait
        priority: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
      },
      neurodiversity: {
        count: 5, // Key screening questions
        priority: ['executive_function', 'sensory_processing', 'social_communication']
      },
      cognitive: {
        count: 2,
        priority: ['processing_speed', 'working_memory']
      }
    };

    // Set baseline questions for each category
    for (const [category, criteria] of Object.entries(baselineCriteria)) {
      const questions = questionsByCategory[category] || [];
      let baselineSet = 0;

      // For personality, get 2 from each trait
      if (category === 'personality') {
        for (const trait of criteria.priority) {
          const traitQuestions = questions.filter(q => q.trait === trait);
          traitQuestions.slice(0, 2).forEach((q, i) => {
            q.isBaseline = true;
            q.baselinePriority = baselineSet + 1;
            baselineSet++;
            baselineCount++;
          });
        }
      } else {
        // For other categories, take first N questions
        questions.slice(0, criteria.count).forEach((q, i) => {
          q.isBaseline = true;
          q.baselinePriority = i + 1;
          baselineCount++;
        });
      }
    }

    console.log(`  ${colors.green}✓ Set ${baselineCount} baseline questions${colors.reset}`);

    // 3. Add adaptive criteria
    console.log(`\n${colors.yellow}3. Adding Adaptive Criteria...${colors.reset}`);

    for (const q of allQuestions) {
      if (!q.isBaseline) {
        // Initialize adaptive criteria if missing
        if (!q.adaptiveCriteria || !q.adaptiveCriteria.triggerTraits) {
          q.adaptiveCriteria = {
            triggerTraits: [],
            triggerPatterns: [],
            followUpTo: []
          };
          adaptiveCriteriaAdded++;
        }

        // Add appropriate criteria based on category
        switch (q.category) {
          case 'personality':
            if (q.trait && q.adaptiveCriteria.triggerTraits.length === 0) {
              q.adaptiveCriteria.triggerTraits = [
                { trait: q.trait, threshold: 3.5, direction: 'high' },
                { trait: q.trait, threshold: 2.5, direction: 'low' }
              ];
              q.adaptiveCriteria.triggerPatterns.push(`${q.trait}_exploration`);
            }
            break;

          case 'neurodiversity':
            if (q.subcategory && q.adaptiveCriteria.triggerTraits.length === 0) {
              q.adaptiveCriteria.triggerTraits = [
                { trait: 'neurodiversity_indicators', threshold: 3.0 }
              ];
              q.adaptiveCriteria.triggerPatterns.push(`${q.subcategory}_assessment`);

              // Link to related executive function questions
              if (q.subcategory === 'executive_function') {
                q.adaptiveCriteria.triggerTraits.push({
                  trait: 'conscientiousness',
                  threshold: 2.5,
                  direction: 'low'
                });
              }
            }
            break;

          case 'cognitive':
            if (q.adaptiveCriteria.triggerTraits.length === 0) {
              q.adaptiveCriteria.triggerTraits = [
                { trait: 'openness', threshold: 4.0 },
                { trait: 'cognitive_flexibility', threshold: 3.5 }
              ];
              q.adaptiveCriteria.triggerPatterns.push('cognitive_assessment');
            }
            break;

          case 'attachment':
            if (q.adaptiveCriteria.triggerTraits.length === 0) {
              q.adaptiveCriteria.triggerTraits = [
                { trait: 'agreeableness', threshold: 2.5, direction: 'low' },
                { trait: 'neuroticism', threshold: 3.5, direction: 'high' }
              ];
              q.adaptiveCriteria.triggerPatterns.push('attachment_exploration');
            }
            break;

          case 'trauma_screening':
            if (q.adaptiveCriteria.triggerTraits.length === 0) {
              q.adaptiveCriteria.triggerTraits = [
                { trait: 'neuroticism', threshold: 4.0 },
                { trait: 'emotional_dysregulation', threshold: 3.5 }
              ];
              q.adaptiveCriteria.triggerPatterns.push('trauma_assessment');
            }
            break;
        }
      }
    }

    console.log(
      `  ${colors.green}✓ Added adaptive criteria to ${adaptiveCriteriaAdded} questions${colors.reset}`
    );

    // 4. Add missing metadata fields
    console.log(`\n${colors.yellow}4. Adding Missing Metadata...${colors.reset}`);

    for (const q of allQuestions) {
      let updated = false;

      // Add tier information
      if (!q.tier) {
        q.tier = q.isBaseline ? 'all' : 'comprehensive';
        updated = true;
      }

      // Add response type if missing
      if (!q.responseType) {
        q.responseType = 'likert'; // Default for most questions
        updated = true;
      }

      // Add scoring direction if missing
      if (!q.scoringDirection) {
        // Determine based on question text patterns
        const negativeIndicators = [
          'struggle',
          'difficult',
          'hard',
          'rarely',
          'never',
          'avoid',
          'uncomfortable'
        ];
        const hasNegative = negativeIndicators.some(word => q.text.toLowerCase().includes(word));
        q.scoringDirection = hasNegative ? 'reverse' : 'normal';
        updated = true;
      }

      // Add domain if missing for certain categories
      if (!q.domain && q.subcategory) {
        q.domain = q.subcategory;
        updated = true;
      }

      // Add validation rules
      if (!q.validationRules) {
        q.validationRules = {
          minResponseTime: 1000, // 1 second minimum
          maxResponseTime: 60000, // 60 seconds maximum
          requiredConfidence: 0.7
        };
        updated = true;
      }

      // Add clinical relevance for neurodiversity and trauma questions
      if (
        (q.category === 'neurodiversity' || q.category === 'trauma_screening') &&
        !q.clinicalRelevance
      ) {
        q.clinicalRelevance = {
          diagnostic: false, // Not for diagnosis
          screening: true,
          severity: q.category === 'trauma_screening' ? 'moderate' : 'low'
        };
        updated = true;
      }

      if (updated) metadataFixed++;
    }

    console.log(`  ${colors.green}✓ Fixed metadata for ${metadataFixed} questions${colors.reset}`);

    // 5. Save all changes
    console.log(`\n${colors.yellow}5. Saving Changes to Database...${colors.reset}`);

    let savedCount = 0;
    let errorCount = 0;

    for (const q of allQuestions) {
      try {
        await q.save();
        savedCount++;
      } catch (error) {
        console.error(
          `  ${colors.red}✗ Error saving question ${q.questionId}:${colors.reset}`,
          error.message
        );
        errorCount++;
      }
    }

    console.log(`  ${colors.green}✓ Successfully saved ${savedCount} questions${colors.reset}`);
    if (errorCount > 0) {
      console.log(`  ${colors.red}✗ Failed to save ${errorCount} questions${colors.reset}`);
    }

    // 6. Verify the fixes
    console.log(
      `\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`
    );
    console.log(`${colors.cyan}                    FIX SUMMARY${colors.reset}`);
    console.log(
      `${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`
    );

    const verifyQuestions = await QuestionBank.find({});
    const baselineVerify = verifyQuestions.filter(q => q.isBaseline);
    const adaptiveVerify = verifyQuestions.filter(q => !q.isBaseline);
    const withCriteria = adaptiveVerify.filter(
      q =>
        q.adaptiveCriteria &&
        q.adaptiveCriteria.triggerTraits &&
        q.adaptiveCriteria.triggerTraits.length > 0
    );

    console.log(`Total Questions: ${verifyQuestions.length}`);
    console.log(`Baseline Questions: ${baselineVerify.length}`);
    console.log(`Adaptive Questions: ${adaptiveVerify.length}`);
    console.log(`Questions with Adaptive Criteria: ${withCriteria.length}`);
    console.log(`\nChanges Made:`);
    console.log(`  - Standardized IDs: ${idStandardized}`);
    console.log(`  - Baseline Questions Set: ${baselineCount}`);
    console.log(`  - Adaptive Criteria Added: ${adaptiveCriteriaAdded}`);
    console.log(`  - Metadata Fixed: ${metadataFixed}`);

    // Check for remaining issues
    const remainingIssues = [];
    if (baselineVerify.length < 10) {
      remainingIssues.push('Not enough baseline questions (recommend at least 10)');
    }
    if (withCriteria.length < adaptiveVerify.length) {
      remainingIssues.push(
        `${adaptiveVerify.length - withCriteria.length} adaptive questions still missing criteria`
      );
    }

    if (remainingIssues.length > 0) {
      console.log(`\n${colors.yellow}⚠ Remaining Issues:${colors.reset}`);
      remainingIssues.forEach(issue => console.log(`  - ${issue}`));
    } else {
      console.log(`\n${colors.green}✓ All issues resolved!${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}✗ Fix script error:${colors.reset}`, error);
  }
}

async function main() {
  await connectDB();
  await fixQuestionBank();
  await mongoose.connection.close();
  console.log(`\n${colors.green}✓ Fix script complete${colors.reset}`);
}

// Run the fix
main().catch(console.error);
