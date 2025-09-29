#!/usr/bin/env node

/**
 * Fix Adaptive Criteria Script
 * Ensures ALL adaptive questions have proper adaptive criteria
 * Target: 100% coverage for non-baseline questions
 */

require('dotenv').config();
const mongoose = require('mongoose');
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

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test');
    console.log(`${colors.green}✓ Connected to MongoDB${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ MongoDB connection error:${colors.reset}`, error);
    process.exit(1);
  }
}

/**
 * Generate comprehensive adaptive criteria based on question category and content
 */
function generateComprehensiveAdaptiveCriteria(question) {
  const criteria = {
    triggerTraits: [],
    triggerPatterns: [],
    followUpTo: [],
    incompatibleWith: [],
    requiredPrior: []
  };

  const { category, subcategory, trait, text, questionId } = question;

  // Parse question ID for better context
  const [prefix, subcode] = questionId.split('_').slice(0, 2);

  switch (category) {
    case 'personality':
      // Big Five personality questions
      if (trait) {
        // High and low trait exploration
        criteria.triggerTraits.push(
          { trait: trait, minScore: 3.8, maxScore: 5.0 }, // High trait
          { trait: trait, minScore: 1.0, maxScore: 2.2 } // Low trait
        );

        // Add cross-trait correlations
        const traitCorrelations = {
          openness: ['extraversion', 'neuroticism'],
          conscientiousness: ['agreeableness', 'neuroticism'],
          extraversion: ['openness', 'agreeableness'],
          agreeableness: ['conscientiousness', 'extraversion'],
          neuroticism: ['conscientiousness', 'agreeableness']
        };

        const correlatedTraits = traitCorrelations[trait] || [];
        correlatedTraits.forEach(corTrait => {
          criteria.triggerTraits.push({
            trait: corTrait,
            minScore: 3.5,
            maxScore: 5.0
          });
        });

        criteria.triggerPatterns.push(
          `${trait}_exploration`,
          `${trait}_depth`,
          'personality_profiling'
        );

        // Add behavioral/situational subcategory triggers
        if (subcode === 'BEHAV') {
          criteria.triggerPatterns.push('behavioral_assessment');
        } else if (subcode === 'SITUA') {
          criteria.triggerPatterns.push('situational_analysis');
        } else if (subcode === 'PREF') {
          criteria.triggerPatterns.push('preference_mapping');
        }
      }
      break;

    case 'neurodiversity':
      // Neurodiversity screening questions
      criteria.triggerPatterns.push('neurodiversity_screening');

      // Executive function indicators
      if (subcode === 'EXEC' || subcategory === 'executive_function') {
        criteria.triggerTraits.push(
          { trait: 'conscientiousness', minScore: 1.0, maxScore: 2.5 },
          { trait: 'attention_issues', minScore: 3.0, maxScore: 5.0 }
        );
        criteria.triggerPatterns.push('adhd_indicators', 'executive_dysfunction');
      }

      // Sensory processing
      else if (subcode === 'SENS' || subcategory === 'sensory_processing') {
        criteria.triggerTraits.push({ trait: 'sensory_sensitivity', minScore: 3.5, maxScore: 5.0 });
        criteria.triggerPatterns.push('autism_indicators', 'sensory_profile');
      }

      // Social communication
      else if (subcode === 'SOCIAL' || subcategory === 'social_communication') {
        criteria.triggerTraits.push(
          { trait: 'extraversion', minScore: 1.0, maxScore: 2.5 },
          { trait: 'social_anxiety', minScore: 3.0, maxScore: 5.0 }
        );
        criteria.triggerPatterns.push('autism_indicators', 'social_challenges');
      }

      // Masking behaviors
      else if (subcode === 'MASK' || subcategory === 'masking') {
        criteria.triggerTraits.push({ trait: 'masking_behaviors', minScore: 3.0, maxScore: 5.0 });
        criteria.triggerPatterns.push('neurodivergent_coping', 'masking_assessment');
      }

      // Emotional regulation
      else if (subcode === 'EMREG' || subcode === 'EMOT') {
        criteria.triggerTraits.push(
          { trait: 'neuroticism', minScore: 3.5, maxScore: 5.0 },
          { trait: 'emotional_dysregulation', minScore: 3.0, maxScore: 5.0 }
        );
        criteria.triggerPatterns.push('emotional_regulation_assessment');
      }

      // Time management/blindness
      else if (subcode === 'TIME' || text?.toLowerCase().includes('time')) {
        criteria.triggerTraits.push({
          trait: 'time_management_issues',
          minScore: 3.0,
          maxScore: 5.0
        });
        criteria.triggerPatterns.push('adhd_indicators', 'time_blindness');
      }

      // Memory issues
      else if (subcode === 'WMEM' || text?.toLowerCase().includes('memory')) {
        criteria.triggerTraits.push({
          trait: 'working_memory_issues',
          minScore: 3.0,
          maxScore: 5.0
        });
        criteria.triggerPatterns.push('adhd_indicators', 'cognitive_challenges');
      }

      // Hyperfocus
      else if (subcode === 'HYPER' || text?.toLowerCase().includes('hyperfocus')) {
        criteria.triggerTraits.push({ trait: 'hyperfocus_tendency', minScore: 3.5, maxScore: 5.0 });
        criteria.triggerPatterns.push('adhd_indicators', 'neurodivergent_strengths');
      }

      // General neurodiversity indicators from personality profile
      criteria.triggerTraits.push(
        { trait: 'openness', minScore: 4.0, maxScore: 5.0 }, // High openness often correlates
        { trait: 'conscientiousness', minScore: 1.0, maxScore: 2.0 } // Low conscientiousness indicator
      );
      break;

    case 'cognitive':
      // Cognitive assessment questions
      criteria.triggerTraits.push(
        { trait: 'openness', minScore: 3.5, maxScore: 5.0 },
        { trait: 'cognitive_flexibility', minScore: 3.0, maxScore: 5.0 }
      );

      if (subcode === 'SPAT') {
        criteria.triggerPatterns.push('spatial_reasoning', 'visual_processing');
      } else if (subcode === 'ANALY') {
        criteria.triggerPatterns.push('analytical_thinking', 'logical_reasoning');
      } else if (subcode === 'VERB') {
        criteria.triggerPatterns.push('verbal_processing', 'linguistic_ability');
      } else if (subcode === 'SPEED') {
        criteria.triggerPatterns.push('processing_speed_assessment');
      }

      criteria.triggerPatterns.push('cognitive_assessment', 'intellectual_profile');
      break;

    case 'cognitive_functions':
      // Jungian cognitive functions
      const functionMap = {
        NI: 'introverted_intuition',
        NE: 'extraverted_intuition',
        TI: 'introverted_thinking',
        TE: 'extraverted_thinking',
        FI: 'introverted_feeling',
        FE: 'extraverted_feeling',
        SI: 'introverted_sensing',
        SE: 'extraverted_sensing'
      };

      const functionName = functionMap[subcode] || 'cognitive_function';
      criteria.triggerPatterns.push(functionName, 'jungian_typology');

      // Map to Big Five
      if (subcode?.startsWith('N')) {
        // Intuition
        criteria.triggerTraits.push({ trait: 'openness', minScore: 3.5, maxScore: 5.0 });
      }
      if (subcode?.endsWith('I')) {
        // Introverted functions
        criteria.triggerTraits.push({ trait: 'extraversion', minScore: 1.0, maxScore: 3.0 });
      } else if (subcode?.endsWith('E')) {
        // Extraverted functions
        criteria.triggerTraits.push({ trait: 'extraversion', minScore: 3.0, maxScore: 5.0 });
      }
      break;

    case 'attachment':
      // Attachment style questions
      if (subcode === 'ANX' || subcategory === 'anxious') {
        criteria.triggerTraits.push(
          { trait: 'neuroticism', minScore: 3.5, maxScore: 5.0 },
          { trait: 'agreeableness', minScore: 3.5, maxScore: 5.0 }
        );
        criteria.triggerPatterns.push('anxious_attachment', 'relationship_anxiety');
      } else if (subcode === 'AVOID' || subcategory === 'avoidant') {
        criteria.triggerTraits.push(
          { trait: 'agreeableness', minScore: 1.0, maxScore: 2.5 },
          { trait: 'extraversion', minScore: 1.0, maxScore: 2.5 }
        );
        criteria.triggerPatterns.push('avoidant_attachment', 'emotional_distance');
      } else if (subcode === 'SEC' || subcategory === 'secure') {
        criteria.triggerTraits.push(
          { trait: 'neuroticism', minScore: 1.0, maxScore: 3.0 },
          { trait: 'agreeableness', minScore: 3.5, maxScore: 5.0 }
        );
        criteria.triggerPatterns.push('secure_attachment', 'healthy_relationships');
      } else if (subcode === 'DISORG' || subcategory === 'disorganized') {
        criteria.triggerTraits.push({ trait: 'neuroticism', minScore: 4.0, maxScore: 5.0 });
        criteria.triggerPatterns.push('disorganized_attachment', 'trauma_indicators');
      }

      criteria.triggerPatterns.push('attachment_assessment', 'relationship_patterns');
      break;

    case 'trauma_screening':
      // Trauma screening questions
      criteria.triggerTraits.push(
        { trait: 'neuroticism', minScore: 4.0, maxScore: 5.0 },
        { trait: 'emotional_dysregulation', minScore: 3.5, maxScore: 5.0 }
      );

      if (subcode === 'HYVIG' || text?.toLowerCase().includes('hypervigil')) {
        criteria.triggerPatterns.push('hypervigilance', 'ptsd_indicators');
      } else if (subcode === 'DISS' || text?.toLowerCase().includes('dissoc')) {
        criteria.triggerPatterns.push('dissociation', 'trauma_response');
      } else if (subcode === 'NUMB' || text?.toLowerCase().includes('numb')) {
        criteria.triggerPatterns.push('emotional_numbing', 'trauma_response');
      }

      criteria.triggerPatterns.push('trauma_assessment', 'clinical_screening');
      break;

    case 'enneagram':
      // Enneagram type questions
      criteria.triggerPatterns.push('enneagram_typing', 'personality_system');

      // Map to Big Five based on common correlations
      if (subcode === 'T1' || text?.toLowerCase().includes('perfect')) {
        criteria.triggerTraits.push({ trait: 'conscientiousness', minScore: 4.0, maxScore: 5.0 });
      } else if (subcode === 'T2' || text?.toLowerCase().includes('help')) {
        criteria.triggerTraits.push({ trait: 'agreeableness', minScore: 4.0, maxScore: 5.0 });
      } else if (subcode === 'T4' || text?.toLowerCase().includes('unique')) {
        criteria.triggerTraits.push({ trait: 'openness', minScore: 4.0, maxScore: 5.0 });
      } else if (subcode === 'T5' || text?.toLowerCase().includes('observ')) {
        criteria.triggerTraits.push({ trait: 'extraversion', minScore: 1.0, maxScore: 2.5 });
      }
      break;

    case 'learning_style':
      // Learning style questions
      criteria.triggerPatterns.push('learning_assessment', 'educational_profile');

      if (subcode === 'LVIS' || text?.toLowerCase().includes('visual')) {
        criteria.triggerPatterns.push('visual_learning');
      } else if (subcode === 'LAUD' || text?.toLowerCase().includes('auditory')) {
        criteria.triggerPatterns.push('auditory_learning');
      } else if (subcode === 'LKIN' || text?.toLowerCase().includes('kinesthetic')) {
        criteria.triggerPatterns.push('kinesthetic_learning');
      }

      criteria.triggerTraits.push({ trait: 'openness', minScore: 3.0, maxScore: 5.0 });
      break;

    default:
      // Default criteria for any uncategorized questions
      criteria.triggerPatterns.push('general_assessment');
      criteria.triggerTraits.push({ trait: 'openness', minScore: 2.5, maxScore: 5.0 });
  }

  // Remove empty arrays if no data was added
  if (criteria.triggerTraits.length === 0) delete criteria.triggerTraits;
  if (criteria.triggerPatterns.length === 0) delete criteria.triggerPatterns;
  if (criteria.followUpTo.length === 0) delete criteria.followUpTo;
  if (criteria.incompatibleWith.length === 0) delete criteria.incompatibleWith;
  if (criteria.requiredPrior.length === 0) delete criteria.requiredPrior;

  return criteria;
}

async function fixAdaptiveCriteria() {
  console.log(
    `\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(`${colors.cyan}         FIXING ADAPTIVE CRITERIA${colors.reset}`);
  console.log(
    `${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`
  );

  try {
    // Step 1: Fetch all questions
    console.log(`${colors.yellow}Step 1: Fetching all questions...${colors.reset}`);
    const allQuestions = await QuestionBank.find({});
    console.log(`  Found ${allQuestions.length} questions`);

    // Step 2: Identify questions needing criteria
    console.log(`\n${colors.yellow}Step 2: Analyzing adaptive criteria coverage...${colors.reset}`);

    const baselineQuestions = allQuestions.filter(q => q.adaptive?.isBaseline === true);
    const adaptiveQuestions = allQuestions.filter(q => !q.adaptive?.isBaseline);

    const missingCriteria = adaptiveQuestions.filter(q => {
      const criteria = q.adaptive?.adaptiveCriteria;
      return !criteria || (!criteria.triggerTraits?.length && !criteria.triggerPatterns?.length);
    });

    console.log(`  Baseline questions: ${baselineQuestions.length}`);
    console.log(`  Adaptive questions: ${adaptiveQuestions.length}`);
    console.log(`  Missing criteria: ${missingCriteria.length}`);

    if (missingCriteria.length === 0) {
      console.log(
        `\n${colors.green}✓ All adaptive questions already have criteria!${colors.reset}`
      );
      return;
    }

    // Step 3: Fix missing criteria
    console.log(
      `\n${colors.yellow}Step 3: Adding comprehensive criteria to ${missingCriteria.length} questions...${colors.reset}`
    );

    let fixedCount = 0;
    let errorCount = 0;

    for (const question of missingCriteria) {
      try {
        // Generate comprehensive criteria
        const newCriteria = generateComprehensiveAdaptiveCriteria(question);

        // Update the question
        await QuestionBank.updateOne(
          { _id: question._id },
          {
            $set: {
              'adaptive.adaptiveCriteria': newCriteria
            }
          }
        );

        fixedCount++;

        if (fixedCount % 10 === 0) {
          console.log(`  Fixed ${fixedCount}/${missingCriteria.length} questions...`);
        }
      } catch (error) {
        console.error(
          `  ${colors.red}✗ Error fixing ${question.questionId}:${colors.reset}`,
          error.message
        );
        errorCount++;
      }
    }

    console.log(`\n  ${colors.green}✓ Successfully fixed ${fixedCount} questions${colors.reset}`);
    if (errorCount > 0) {
      console.log(`  ${colors.red}✗ Failed to fix ${errorCount} questions${colors.reset}`);
    }

    // Step 4: Enhance existing criteria (optional improvement)
    console.log(`\n${colors.yellow}Step 4: Enhancing existing criteria...${colors.reset}`);

    const hasWeakCriteria = adaptiveQuestions.filter(q => {
      const criteria = q.adaptive?.adaptiveCriteria;
      return (
        criteria && (criteria.triggerTraits?.length === 1 || criteria.triggerPatterns?.length === 0)
      );
    });

    console.log(`  Found ${hasWeakCriteria.length} questions with weak criteria`);

    let enhancedCount = 0;
    for (const question of hasWeakCriteria) {
      try {
        const enhancedCriteria = generateComprehensiveAdaptiveCriteria(question);

        // Merge with existing criteria
        const existingCriteria = question.adaptive.adaptiveCriteria;
        const mergedCriteria = {
          triggerTraits: [
            ...(existingCriteria.triggerTraits || []),
            ...(enhancedCriteria.triggerTraits || [])
          ],
          triggerPatterns: [
            ...(existingCriteria.triggerPatterns || []),
            ...(enhancedCriteria.triggerPatterns || [])
          ],
          followUpTo: existingCriteria.followUpTo || [],
          incompatibleWith: existingCriteria.incompatibleWith || [],
          requiredPrior: existingCriteria.requiredPrior || []
        };

        // Remove duplicates
        mergedCriteria.triggerPatterns = [...new Set(mergedCriteria.triggerPatterns)];

        await QuestionBank.updateOne(
          { _id: question._id },
          {
            $set: {
              'adaptive.adaptiveCriteria': mergedCriteria
            }
          }
        );

        enhancedCount++;
      } catch (error) {
        console.error(
          `  ${colors.yellow}⚠ Could not enhance ${question.questionId}${colors.reset}`
        );
      }
    }

    console.log(`  ${colors.green}✓ Enhanced ${enhancedCount} questions${colors.reset}`);

    // Step 5: Verify the fix
    console.log(`\n${colors.yellow}Step 5: Verifying adaptive criteria coverage...${colors.reset}`);

    const verifyQuestions = await QuestionBank.find({});
    const verifyAdaptive = verifyQuestions.filter(q => !q.adaptive?.isBaseline);
    const withCriteria = verifyAdaptive.filter(q => {
      const criteria = q.adaptive?.adaptiveCriteria;
      return (
        criteria && (criteria.triggerTraits?.length > 0 || criteria.triggerPatterns?.length > 0)
      );
    });

    const coveragePercent = Math.round((withCriteria.length / verifyAdaptive.length) * 100);

    console.log(
      `\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`
    );
    console.log(`${colors.cyan}                    RESULTS${colors.reset}`);
    console.log(
      `${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`
    );

    console.log(`Total Adaptive Questions: ${verifyAdaptive.length}`);
    console.log(`With Criteria: ${withCriteria.length}`);
    console.log(`Coverage: ${coveragePercent}%`);

    if (coveragePercent === 100) {
      console.log(
        `\n${colors.green}✅ SUCCESS! All adaptive questions now have criteria!${colors.reset}`
      );
    } else if (coveragePercent >= 95) {
      console.log(
        `\n${colors.yellow}⚠ Nearly complete: ${coveragePercent}% coverage${colors.reset}`
      );
    } else {
      console.log(`\n${colors.red}⚠ Incomplete: Only ${coveragePercent}% coverage${colors.reset}`);
    }

    // Show sample of enhanced criteria
    console.log(`\n${colors.cyan}Sample Enhanced Criteria:${colors.reset}`);
    const samples = withCriteria.slice(0, 3);
    samples.forEach(q => {
      console.log(`\n  ${q.questionId}:`);
      const criteria = q.adaptive.adaptiveCriteria;
      if (criteria.triggerTraits?.length) {
        console.log(`    Trigger Traits: ${criteria.triggerTraits.length} conditions`);
      }
      if (criteria.triggerPatterns?.length) {
        console.log(`    Trigger Patterns: ${criteria.triggerPatterns.join(', ')}`);
      }
    });
  } catch (error) {
    console.error(`${colors.red}✗ Fix script error:${colors.reset}`, error);
  }
}

async function main() {
  await connectDB();
  await fixAdaptiveCriteria();
  await mongoose.connection.close();
  console.log(`\n${colors.green}✓ Script complete${colors.reset}`);
}

// Run the fix
main().catch(console.error);
