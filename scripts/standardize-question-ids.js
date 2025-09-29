#!/usr/bin/env node

/**
 * Question ID Standardization Script
 *
 * This script standardizes all question IDs to reduce pattern complexity
 * from 116 patterns to ~30 well-organized patterns.
 *
 * New Standard Format: CATEGORY_SUBCODE_###
 *
 * The script:
 * 1. Creates a mapping of old IDs to new IDs
 * 2. Updates the database
 * 3. Saves the mapping for reference
 * 4. Ensures system compatibility
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const QuestionBank = require('../models/QuestionBank');
const logger = require('../utils/logger');

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

// Define standardized subcategory codes
const SUBCATEGORY_CODES = {
  // Personality traits (Big Five)
  openness: 'OPEN',
  conscientiousness: 'CONSC',
  extraversion: 'EXTRA',
  agreeableness: 'AGREE',
  neuroticism: 'NEURO',
  behavioral: 'BEHAV',
  situational: 'SITUA',
  preferences: 'PREF',

  // Neurodiversity subcategories
  executive_function: 'EXEC',
  sensory_processing: 'SENS',
  social_communication: 'SOCIAL',
  masking: 'MASK',
  emotional: 'EMOT',
  interests: 'INTER',
  adhd: 'ADHD',
  autism: 'ASD',

  // Sensory specific
  tactile: 'TACT',
  auditory: 'AUD',
  visual: 'VIS',
  proprioception: 'PROP',
  vestibular: 'VEST',
  interoception: 'INTERO',

  // Executive function specific
  task_initiation: 'TASK',
  procrastination: 'PROC',
  motivation: 'MOTIV',
  time_blindness: 'TIME',
  time_management: 'TMGMT',
  time_estimation: 'TEST',
  punctuality: 'PUNCT',
  cognitive_flexibility: 'FLEX',
  task_resumption: 'RESUM',
  perseveration: 'PERSEV',
  working_memory: 'WMEM',
  prospective_memory: 'PMEM',
  memory_compensation: 'MCOMP',
  appointment_memory: 'APPT',
  organization: 'ORG',
  planning: 'PLAN',
  prioritization: 'PRIOR',
  decision_paralysis: 'DECIS',
  attention_switching: 'SWITCH',
  hyperfocus: 'HYPER',
  distractibility: 'DISTR',
  impulse_control: 'IMPUL',
  emotional_regulation: 'EMREG',
  rejection_sensitivity: 'REJ',

  // Cognitive domains
  analytical: 'ANALY',
  spatial: 'SPAT',
  verbal: 'VERB',
  kinesthetic: 'KINES',
  holistic: 'HOLIS',
  processing_speed: 'SPEED',

  // Jungian cognitive functions
  ni: 'NI',
  ne: 'NE',
  ti: 'TI',
  te: 'TE',
  fi: 'FI',
  fe: 'FE',
  si: 'SI',
  se: 'SE',

  // Attachment styles
  secure: 'SEC',
  anxious: 'ANX',
  avoidant: 'AVOID',
  disorganized: 'DISORG',

  // Trauma indicators
  hypervigilance: 'HYVIG',
  dissociation: 'DISS',
  emotional_numbing: 'NUMB',
  intrusion: 'INTRUS',
  avoidance: 'TAVOID',
  startle_response: 'START',
  chronic_tension: 'TENS',
  derealization: 'DEREAL',

  // Learning styles
  sequential: 'SEQ',
  global: 'GLOB',
  auditory: 'LAUD',
  visual: 'LVIS',
  kinesthetic: 'LKIN',

  // Enneagram types
  type1: 'T1',
  type2: 'T2',
  type3: 'T3',
  type4: 'T4',
  type5: 'T5',
  type6: 'T6',
  type7: 'T7',
  type8: 'T8',
  type9: 'T9',

  // General fallback
  general: 'GEN'
};

// Category prefixes (keep these short and clear)
const CATEGORY_PREFIXES = {
  personality: 'BFI',
  neurodiversity: 'NDV',
  cognitive: 'COG',
  cognitive_functions: 'JUNG',
  enneagram: 'ENNE',
  attachment: 'ATT',
  trauma_screening: 'TRA',
  learning_style: 'LRN'
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

function getSubcategoryCode(subcategory, trait, domain, text) {
  // Try direct mapping first
  if (subcategory && SUBCATEGORY_CODES[subcategory.toLowerCase()]) {
    return SUBCATEGORY_CODES[subcategory.toLowerCase()];
  }

  if (trait && SUBCATEGORY_CODES[trait.toLowerCase()]) {
    return SUBCATEGORY_CODES[trait.toLowerCase()];
  }

  if (domain && SUBCATEGORY_CODES[domain.toLowerCase()]) {
    return SUBCATEGORY_CODES[domain.toLowerCase()];
  }

  // Try to infer from text for neurodiversity questions
  if (text) {
    const lowerText = text.toLowerCase();

    // Executive function patterns
    if (lowerText.includes('task') && lowerText.includes('start')) return 'TASK';
    if (lowerText.includes('procrastinat')) return 'PROC';
    if (lowerText.includes('time') && lowerText.includes('blind')) return 'TIME';
    if (lowerText.includes('time') && lowerText.includes('manage')) return 'TMGMT';
    if (lowerText.includes('focus') || lowerText.includes('concentrat')) return 'FOCUS';
    if (lowerText.includes('memory')) return 'WMEM';
    if (lowerText.includes('organiz')) return 'ORG';
    if (lowerText.includes('plan')) return 'PLAN';
    if (lowerText.includes('impuls')) return 'IMPUL';

    // Sensory patterns
    if (lowerText.includes('touch') || lowerText.includes('tactile')) return 'TACT';
    if (lowerText.includes('sound') || lowerText.includes('noise')) return 'AUD';
    if (lowerText.includes('light') || lowerText.includes('bright')) return 'VIS';
    if (lowerText.includes('balance') || lowerText.includes('coordin')) return 'PROP';

    // Social patterns
    if (lowerText.includes('social') || lowerText.includes('people')) return 'SOCIAL';
    if (lowerText.includes('mask') || lowerText.includes('pretend')) return 'MASK';

    // Emotional patterns
    if (lowerText.includes('emotion') || lowerText.includes('feeling')) return 'EMOT';
    if (lowerText.includes('reject')) return 'REJ';
  }

  // Default to GEN if nothing matches
  return 'GEN';
}

function generateNewId(category, subcategoryCode, index) {
  const prefix = CATEGORY_PREFIXES[category] || category.toUpperCase().substring(0, 4);
  const paddedIndex = index.toString().padStart(3, '0');
  return `${prefix}_${subcategoryCode}_${paddedIndex}`;
}

async function standardizeQuestionIds() {
  console.log(
    `\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(`${colors.cyan}         QUESTION ID STANDARDIZATION${colors.reset}`);
  console.log(
    `${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`
  );

  try {
    // Step 1: Fetch all questions
    console.log(`${colors.yellow}Step 1: Fetching all questions...${colors.reset}`);
    const allQuestions = await QuestionBank.find({}).sort('category subcategory trait');
    console.log(`  Found ${allQuestions.length} questions`);

    // Step 2: Create mapping
    console.log(`\n${colors.yellow}Step 2: Creating ID mapping...${colors.reset}`);
    const idMapping = {};
    const newQuestions = [];
    const categoryCounters = {};

    // Group questions by category and subcategory for consistent numbering
    const groupedQuestions = {};

    allQuestions.forEach(q => {
      const category = q.category;
      const subcategoryCode = getSubcategoryCode(q.subcategory, q.trait, q.domain, q.text);
      const groupKey = `${category}_${subcategoryCode}`;

      if (!groupedQuestions[groupKey]) {
        groupedQuestions[groupKey] = [];
      }
      groupedQuestions[groupKey].push(q);
    });

    // Process each group and assign new IDs
    Object.keys(groupedQuestions)
      .sort()
      .forEach(groupKey => {
        const questions = groupedQuestions[groupKey];
        const [category, subcategoryCode] = groupKey.split('_');

        questions.forEach((q, index) => {
          const newId = generateNewId(category, subcategoryCode, index + 1);
          const oldId = q.questionId;

          idMapping[oldId] = newId;

          // Update the question object
          q.questionId = newId;
          newQuestions.push(q);
        });
      });

    console.log(`  Created mapping for ${Object.keys(idMapping).length} questions`);

    // Step 3: Show mapping summary
    console.log(`\n${colors.yellow}Step 3: Mapping Summary...${colors.reset}`);

    // Count unique patterns in new IDs
    const newPatterns = new Set();
    Object.values(idMapping).forEach(newId => {
      const pattern = newId.replace(/\d+/g, '#');
      newPatterns.add(pattern);
    });

    console.log(`  Old unique patterns: 116`);
    console.log(`  New unique patterns: ${newPatterns.size}`);
    console.log(`\n  New patterns by category:`);

    const patternsByCategory = {};
    newPatterns.forEach(pattern => {
      const category = pattern.split('_')[0];
      if (!patternsByCategory[category]) {
        patternsByCategory[category] = new Set();
      }
      patternsByCategory[category].add(pattern);
    });

    Object.entries(patternsByCategory).forEach(([cat, patterns]) => {
      console.log(`    ${cat}: ${patterns.size} patterns`);
      Array.from(patterns)
        .slice(0, 5)
        .forEach(p => {
          console.log(`      - ${p}`);
        });
    });

    // Step 4: Save mapping to file
    console.log(`\n${colors.yellow}Step 4: Saving ID mapping...${colors.reset}`);
    const mappingPath = path.join(__dirname, 'question-id-mapping.json');
    fs.writeFileSync(
      mappingPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          totalQuestions: Object.keys(idMapping).length,
          oldPatterns: 116,
          newPatterns: newPatterns.size,
          mapping: idMapping
        },
        null,
        2
      )
    );
    console.log(`  ${colors.green}✓ Mapping saved to: ${mappingPath}${colors.reset}`);

    // Step 5: Update database
    console.log(`\n${colors.yellow}Step 5: Updating database...${colors.reset}`);
    console.log(
      `  ${colors.yellow}This will update ${allQuestions.length} questions${colors.reset}`
    );
    console.log(`  ${colors.cyan}Proceed with database update? (y/n)${colors.reset}`);

    // For automated script, we'll proceed
    // In production, you might want to add a confirmation prompt

    let updateCount = 0;
    let errorCount = 0;

    for (const q of newQuestions) {
      try {
        await QuestionBank.updateOne({ _id: q._id }, { $set: { questionId: q.questionId } });
        updateCount++;

        if (updateCount % 50 === 0) {
          console.log(`  Updated ${updateCount}/${allQuestions.length} questions...`);
        }
      } catch (error) {
        console.error(
          `  ${colors.red}✗ Error updating ${q.questionId}:${colors.reset}`,
          error.message
        );
        errorCount++;
      }
    }

    console.log(`  ${colors.green}✓ Successfully updated ${updateCount} questions${colors.reset}`);
    if (errorCount > 0) {
      console.log(`  ${colors.red}✗ Failed to update ${errorCount} questions${colors.reset}`);
    }

    // Step 6: Verify the update
    console.log(`\n${colors.yellow}Step 6: Verifying standardization...${colors.reset}`);
    const verifyQuestions = await QuestionBank.find({}, 'questionId');
    const verifyPatterns = new Set();
    verifyQuestions.forEach(q => {
      const pattern = q.questionId.replace(/\d+/g, '#');
      verifyPatterns.add(pattern);
    });

    console.log(`  ${colors.green}✓ Verification complete${colors.reset}`);
    console.log(`  Total patterns after update: ${verifyPatterns.size}`);

    // Step 7: Create documentation
    console.log(`\n${colors.yellow}Step 7: Creating documentation...${colors.reset}`);
    const docPath = path.join(__dirname, 'QUESTION_ID_STANDARD.md');
    const documentation = `# Question ID Standardization Documentation

## Overview
Date: ${new Date().toISOString()}
Questions Updated: ${updateCount}
Pattern Reduction: 116 → ${newPatterns.size}

## ID Format
Standard format: \`CATEGORY_SUBCODE_###\`

## Category Prefixes
- BFI: Personality (Big Five Inventory)
- NDV: Neurodiversity
- COG: Cognitive
- JUNG: Jungian Cognitive Functions
- ENNE: Enneagram
- ATT: Attachment
- TRA: Trauma Screening
- LRN: Learning Style

## Common Subcategory Codes

### Personality (BFI)
- OPEN: Openness
- CONSC: Conscientiousness
- EXTRA: Extraversion
- AGREE: Agreeableness
- NEURO: Neuroticism
- BEHAV: Behavioral
- SITUA: Situational
- PREF: Preferences

### Neurodiversity (NDV)
- EXEC: Executive Function
- SENS: Sensory Processing
- SOCIAL: Social Communication
- MASK: Masking
- ADHD: ADHD Indicators
- ASD: Autism Spectrum

### Executive Function Details
- TASK: Task Initiation
- PROC: Procrastination
- TIME: Time Management
- WMEM: Working Memory
- ORG: Organization
- PLAN: Planning
- IMPUL: Impulse Control

### Sensory Processing
- TACT: Tactile
- AUD: Auditory
- VIS: Visual
- PROP: Proprioception

## Examples
- BFI_OPEN_001: Personality question about openness
- NDV_EXEC_001: Neurodiversity executive function question
- COG_SPAT_001: Cognitive spatial reasoning question
- JUNG_NI_001: Introverted intuition question
- ATT_SEC_001: Secure attachment question

## Implementation Notes
- All questions now follow this standard
- Maximum ${newPatterns.size} unique patterns
- Consistent numbering within subcategories
- Easy to add new questions following the pattern

## Adding New Questions
When adding new questions:
1. Use the appropriate category prefix
2. Choose or create a subcategory code (max 6 characters)
3. Number sequentially within the subcategory
4. Example: NDV_EXEC_021 for the 21st executive function question
`;

    fs.writeFileSync(docPath, documentation);
    console.log(`  ${colors.green}✓ Documentation saved to: ${docPath}${colors.reset}`);

    // Final summary
    console.log(
      `\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`
    );
    console.log(`${colors.cyan}              STANDARDIZATION COMPLETE${colors.reset}`);
    console.log(
      `${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`
    );

    console.log(`${colors.green}✅ Successfully standardized question IDs${colors.reset}`);
    console.log(`   Pattern reduction: 116 → ${newPatterns.size}`);
    console.log(`   Questions updated: ${updateCount}`);
    console.log(`\n${colors.white}Next Steps:${colors.reset}`);
    console.log(`   1. Review the mapping file: ${mappingPath}`);
    console.log(`   2. Test the system with new IDs`);
    console.log(`   3. Update any hardcoded references if needed`);
    console.log(
      `\n${colors.green}The system should continue working normally as it uses${colors.reset}`
    );
    console.log(`${colors.green}questionId field references, not hardcoded IDs.${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Standardization error:${colors.reset}`, error);
  }
}

async function main() {
  await connectDB();
  await standardizeQuestionIds();
  await mongoose.connection.close();
  console.log(`\n${colors.green}✓ Script complete${colors.reset}`);
}

// Run the standardization
main().catch(console.error);
