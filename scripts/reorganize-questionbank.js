#!/usr/bin/env node

/**
 * Complete QuestionBank Reorganization Script
 * This script performs a comprehensive reorganization of the question database:
 * - Removes any duplicates
 * - Standardizes all question IDs
 * - Properly sets baseline questions
 * - Adds complete adaptive criteria
 * - Ensures all required fields are present
 * - Optimizes for easier addition of new questions
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

async function reorganizeQuestionBank() {
  console.log(
    `\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(`${colors.cyan}     COMPLETE QUESTIONBANK REORGANIZATION${colors.reset}`);
  console.log(
    `${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`
  );

  try {
    // Step 1: Fetch and analyze all questions
    console.log(`${colors.yellow}Step 1: Fetching all questions...${colors.reset}`);
    const allQuestions = await QuestionBank.find({}).lean();
    console.log(`  Found ${allQuestions.length} questions`);

    // Step 2: Remove duplicates
    console.log(`\n${colors.yellow}Step 2: Removing duplicates...${colors.reset}`);
    const uniqueQuestions = new Map();
    const duplicates = [];

    allQuestions.forEach(q => {
      const key = q.text.toLowerCase().trim();
      if (!uniqueQuestions.has(key)) {
        uniqueQuestions.set(key, q);
      } else {
        duplicates.push(q._id);
      }
    });

    if (duplicates.length > 0) {
      await QuestionBank.deleteMany({ _id: { $in: duplicates } });
      console.log(
        `  ${colors.green}✓ Removed ${duplicates.length} duplicate questions${colors.reset}`
      );
    } else {
      console.log(`  ${colors.green}✓ No duplicates found${colors.reset}`);
    }

    // Step 3: Clear and reorganize
    console.log(`\n${colors.yellow}Step 3: Clearing database for reorganization...${colors.reset}`);
    await QuestionBank.deleteMany({});
    console.log(`  ${colors.green}✓ Database cleared${colors.reset}`);

    // Step 4: Reorganize questions by category
    console.log(`\n${colors.yellow}Step 4: Reorganizing questions...${colors.reset}`);
    const reorganizedQuestions = [];
    const questionsByCategory = {};

    // Group unique questions by category
    uniqueQuestions.forEach(q => {
      if (!questionsByCategory[q.category]) {
        questionsByCategory[q.category] = [];
      }
      questionsByCategory[q.category].push(q);
    });

    // Process each category
    for (const [category, questions] of Object.entries(questionsByCategory)) {
      console.log(`  Processing ${category}: ${questions.length} questions`);

      // Group by trait/subcategory for better organization
      const subgroups = {};
      questions.forEach(q => {
        const key = q.trait || q.subcategory || 'general';
        if (!subgroups[key]) subgroups[key] = [];
        subgroups[key].push(q);
      });

      let categoryIndex = 0;
      let baselineCount = 0;
      const maxBaseline = getBaselineCountForCategory(category);

      // Process each subgroup
      for (const [subkey, subQuestions] of Object.entries(subgroups)) {
        subQuestions.forEach((q, idx) => {
          categoryIndex++;

          // Create standardized ID
          const newId = generateStandardId(category, subkey, categoryIndex);

          // Determine if this should be a baseline question
          const isBaseline = shouldBeBaseline(category, subkey, baselineCount, maxBaseline);
          if (isBaseline) baselineCount++;

          // Create reorganized question with proper structure
          const reorganized = {
            questionId: newId,
            text: q.text,
            category: q.category,
            instrument: q.instrument || generateInstrument(category),
            subcategory: q.subcategory,
            trait: q.trait,
            responseType: q.responseType || 'likert',
            options: q.options || generateLikertOptions(),
            reverseScored: q.reverseScored || determineReverseScoring(q.text),
            weight: q.weight || 1,
            tier: determineTier(category, isBaseline),
            adaptive: {
              isBaseline: isBaseline,
              baselinePriority: isBaseline ? baselineCount : null,
              adaptiveCriteria: generateAdaptiveCriteria(category, subkey, q.trait, isBaseline),
              correlatedTraits: generateCorrelatedTraits(category, q.trait),
              diagnosticWeight: calculateDiagnosticWeight(category, subkey),
              difficultyLevel: calculateDifficultyLevel(q.text),
              discriminationIndex: 0.7 // Default, would be calculated from real data
            },
            metadata: {
              addedDate: new Date(),
              version: '2.0',
              scientificSource:
                q.metadata?.scientificSource || generateSource(category, q.instrument)
            },
            active: true
          };

          reorganizedQuestions.push(reorganized);
        });
      }
    }

    // Step 5: Insert reorganized questions
    console.log(`\n${colors.yellow}Step 5: Inserting reorganized questions...${colors.reset}`);
    const insertResult = await QuestionBank.insertMany(reorganizedQuestions, { ordered: false });
    console.log(
      `  ${colors.green}✓ Inserted ${insertResult.length} reorganized questions${colors.reset}`
    );

    // Step 6: Verify the reorganization
    console.log(`\n${colors.yellow}Step 6: Verifying reorganization...${colors.reset}`);
    const verification = await verifyReorganization();

    // Step 7: Generate report
    console.log(
      `\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`
    );
    console.log(`${colors.cyan}                 REORGANIZATION COMPLETE${colors.reset}`);
    console.log(
      `${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`
    );

    console.log(`${colors.white}Summary:${colors.reset}`);
    console.log(`  Total Questions: ${verification.total}`);
    console.log(`  Baseline Questions: ${verification.baseline}`);
    console.log(`  Adaptive Questions: ${verification.adaptive}`);
    console.log(`  Duplicates Removed: ${duplicates.length}`);

    console.log(`\n${colors.white}Categories:${colors.reset}`);
    for (const [cat, count] of Object.entries(verification.byCategory)) {
      console.log(`  ${cat}: ${count} questions`);
    }

    console.log(`\n${colors.white}Quality Metrics:${colors.reset}`);
    console.log(`  Questions with Adaptive Criteria: ${verification.withCriteria}`);
    console.log(`  Questions with Metadata: ${verification.withMetadata}`);
    console.log(`  Active Questions: ${verification.active}`);

    console.log(`\n${colors.green}✅ Database reorganization complete!${colors.reset}`);
    console.log(
      `${colors.green}The QuestionBank is now fully organized and optimized.${colors.reset}`
    );
  } catch (error) {
    console.error(`${colors.red}✗ Reorganization error:${colors.reset}`, error);
  }
}

// Helper functions

function getBaselineCountForCategory(category) {
  const baselineCounts = {
    personality: 10, // 2 per Big Five trait
    neurodiversity: 5, // Key screening questions
    cognitive: 2, // Basic cognitive assessment
    cognitive_functions: 4, // Jungian functions
    enneagram: 3, // Core type identification
    attachment: 2, // Basic attachment style
    trauma_screening: 2, // Initial screening
    learning_style: 2 // Primary learning preference
  };
  return baselineCounts[category] || 2;
}

function shouldBeBaseline(category, subkey, currentCount, maxCount) {
  if (currentCount >= maxCount) return false;

  // Priority subkeys for baseline
  const prioritySubkeys = {
    personality: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'],
    neurodiversity: ['executive_function', 'sensory_processing', 'social_communication'],
    cognitive: ['processing_speed', 'working_memory']
  };

  const priorities = prioritySubkeys[category];
  if (priorities && priorities.includes(subkey)) {
    return true;
  }

  // For categories without specific priorities, take first N
  return currentCount < maxCount;
}

function generateStandardId(category, subkey, index) {
  const categoryPrefix = {
    personality: 'BFI',
    neurodiversity: 'NEURO',
    cognitive: 'COG',
    cognitive_functions: 'JUNG',
    enneagram: 'ENNEA',
    attachment: 'ATTACH',
    trauma_screening: 'TRAUMA',
    learning_style: 'LEARN'
  };

  const prefix = categoryPrefix[category] || category.toUpperCase().substring(0, 5);
  const sub = subkey
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 10);
  return `${prefix}_${sub}_${index.toString().padStart(3, '0')}`;
}

function generateInstrument(category) {
  const instruments = {
    personality: 'BFI-2',
    neurodiversity: 'NEURLYN_SCREEN',
    cognitive: 'NEURLYN_COG',
    cognitive_functions: 'NEURLYN_JUNGIAN',
    enneagram: 'NEURLYN_ENNEAGRAM',
    attachment: 'NEURLYN_ATTACHMENT',
    trauma_screening: 'NEURLYN_TRAUMA',
    learning_style: 'NEURLYN_LEARNING'
  };
  return instruments[category] || 'NEURLYN_GENERAL';
}

function generateLikertOptions() {
  return [
    { value: 1, label: 'Strongly Disagree', score: 1 },
    { value: 2, label: 'Disagree', score: 2 },
    { value: 3, label: 'Neutral', score: 3 },
    { value: 4, label: 'Agree', score: 4 },
    { value: 5, label: 'Strongly Agree', score: 5 }
  ];
}

function determineReverseScoring(text) {
  const negativeIndicators = [
    'rarely',
    'never',
    "don't",
    'not',
    'avoid',
    'difficult',
    'hard',
    'struggle',
    'uncomfortable',
    'dislike',
    'hate',
    'unable',
    "can't"
  ];

  const lowercaseText = text.toLowerCase();
  return negativeIndicators.some(indicator => lowercaseText.includes(indicator));
}

function determineTier(category, isBaseline) {
  if (isBaseline) return 'core';

  const tierMap = {
    personality: 'core',
    neurodiversity: 'comprehensive',
    cognitive: 'comprehensive',
    cognitive_functions: 'specialized',
    enneagram: 'specialized',
    attachment: 'comprehensive',
    trauma_screening: 'comprehensive',
    learning_style: 'standard'
  };

  return tierMap[category] || 'standard';
}

function generateAdaptiveCriteria(category, subkey, trait, isBaseline) {
  if (isBaseline) {
    return {
      triggerTraits: [],
      triggerPatterns: [],
      followUpTo: [],
      incompatibleWith: [],
      requiredPrior: []
    };
  }

  const criteria = {
    triggerTraits: [],
    triggerPatterns: [],
    followUpTo: [],
    incompatibleWith: [],
    requiredPrior: []
  };

  // Add category-specific adaptive criteria
  switch (category) {
    case 'personality':
      if (trait) {
        criteria.triggerTraits.push(
          { trait: trait, minScore: 3.5, maxScore: 5 },
          { trait: trait, minScore: 1, maxScore: 2.5 }
        );
        criteria.triggerPatterns.push(`${trait}_exploration`);
      }
      break;

    case 'neurodiversity':
      criteria.triggerTraits.push({ trait: 'conscientiousness', minScore: 1, maxScore: 2.5 });
      criteria.triggerPatterns.push('neurodiversity_screening');

      if (subkey === 'executive_function') {
        criteria.triggerTraits.push({ trait: 'attention_issues', minScore: 3 });
        criteria.triggerPatterns.push('adhd_indicators');
      } else if (subkey === 'sensory_processing') {
        criteria.triggerPatterns.push('autism_indicators');
      }
      break;

    case 'cognitive':
      criteria.triggerTraits.push({ trait: 'openness', minScore: 3.5 });
      criteria.triggerPatterns.push('cognitive_depth');
      break;

    case 'attachment':
      criteria.triggerTraits.push(
        { trait: 'neuroticism', minScore: 3.5 },
        { trait: 'agreeableness', minScore: 1, maxScore: 2.5 }
      );
      criteria.triggerPatterns.push('relationship_patterns');
      break;

    case 'trauma_screening':
      criteria.triggerTraits.push({ trait: 'neuroticism', minScore: 4 });
      criteria.triggerPatterns.push('trauma_indicators');
      break;
  }

  return criteria;
}

function generateCorrelatedTraits(category, trait) {
  if (category !== 'personality' || !trait) return [];

  const correlations = {
    openness: ['extraversion'],
    conscientiousness: ['neuroticism'],
    extraversion: ['openness', 'agreeableness'],
    agreeableness: ['extraversion'],
    neuroticism: ['conscientiousness']
  };

  return correlations[trait] || [];
}

function calculateDiagnosticWeight(category, subkey) {
  const weights = {
    neurodiversity: {
      executive_function: 4,
      sensory_processing: 4,
      social_communication: 3,
      masking: 3,
      default: 2
    },
    trauma_screening: {
      default: 4
    },
    personality: {
      default: 2
    },
    cognitive: {
      default: 3
    }
  };

  const categoryWeights = weights[category] || { default: 1 };
  return categoryWeights[subkey] || categoryWeights.default || 1;
}

function calculateDifficultyLevel(text) {
  // Simple heuristic based on text complexity
  const wordCount = text.split(' ').length;

  if (wordCount < 10) return 2;
  if (wordCount < 15) return 3;
  if (wordCount < 20) return 4;
  return 5;
}

function generateSource(category, instrument) {
  const sources = {
    'BFI-2': 'Soto & John (2017)',
    NEURLYN_SCREEN: 'Neurlyn Research Team (2024)',
    'AQ-10': 'Allison et al. (2012)',
    'ASRS-5': 'Ustun et al. (2017)'
  };

  return sources[instrument] || 'Neurlyn Validated Questions (2024)';
}

async function verifyReorganization() {
  const allQuestions = await QuestionBank.find({});
  const baseline = allQuestions.filter(q => q.adaptive?.isBaseline);
  const adaptive = allQuestions.filter(q => !q.adaptive?.isBaseline);
  const withCriteria = adaptive.filter(
    q =>
      q.adaptive?.adaptiveCriteria?.triggerTraits?.length > 0 ||
      q.adaptive?.adaptiveCriteria?.triggerPatterns?.length > 0
  );

  const byCategory = {};
  allQuestions.forEach(q => {
    byCategory[q.category] = (byCategory[q.category] || 0) + 1;
  });

  return {
    total: allQuestions.length,
    baseline: baseline.length,
    adaptive: adaptive.length,
    withCriteria: withCriteria.length,
    withMetadata: allQuestions.filter(q => q.metadata).length,
    active: allQuestions.filter(q => q.active).length,
    byCategory
  };
}

async function main() {
  await connectDB();
  await reorganizeQuestionBank();
  await mongoose.connection.close();
  console.log(`\n${colors.green}✓ Script execution complete${colors.reset}`);
}

// Run the reorganization
main().catch(console.error);
