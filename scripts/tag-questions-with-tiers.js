#!/usr/bin/env node

/**
 * Tier Tagging Implementation
 *
 * Tags all 617 questions with appropriate assessment tier(s):
 * - CORE: Free 30Q personality + light ND screening (0% clinical)
 * - COMPREHENSIVE: Paid 70Q with brief screeners only (PHQ-2, GAD-2, AUDIT-C)
 * - CLINICAL_ADDON: Optional clinical add-on with full batteries + suicide screening
 *
 * Each question gets an `assessmentTiers` array field.
 */

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

// ============================================================================
// TIER ASSIGNMENT RULES
// ============================================================================

/**
 * Questions that go ONLY in CLINICAL_ADDON tier
 */
const CLINICAL_ADDON_ONLY = {
  // All suicide screening questions
  suicideQuestions: [
    'SUICIDE_SCREEN_1', 'SUICIDE_SCREEN_2', 'SUICIDE_SCREEN_3',
    'SUICIDE_SCREEN_4', 'SUICIDE_SCREEN_5', 'SUICIDE_SCREEN_6',
    'SUICIDE_SCREEN_7'
  ],

  // Full clinical batteries (excluding brief screeners)
  instruments: [
    'MDQ',           // Mania (12Q)
    'PQ-B',          // Psychosis (18Q)
    'MSI-BPD',       // Borderline (13Q)
    'PHQ-15',        // Somatic symptoms (10Q)
    'NEURLYN_PTSD',  // PTSD (3Q)
    'AUDIT',         // Full alcohol screening (6Q)
    'DAST',          // Drug screening (6Q)
    'ITQ',           // Complex trauma (8Q)
    'ACEs',          // Adverse childhood experiences (10Q)
    'NEURLYN_TRAUMA' // Trauma screening (12Q)
  ],

  // Full PHQ-9 questions (excluding PHQ-2 brief screener)
  phq9Full: [
    'DEPRESSION_PHQ9_3', 'DEPRESSION_PHQ9_4', 'DEPRESSION_PHQ9_5',
    'DEPRESSION_PHQ9_6', 'DEPRESSION_PHQ9_7', 'DEPRESSION_PHQ9_8',
    'DEPRESSION_PHQ9_9'
  ],

  // Full GAD-7 questions (excluding GAD-2 brief screener)
  gad7Full: [
    'ANXIETY_GAD7_3', 'ANXIETY_GAD7_4', 'ANXIETY_GAD7_5',
    'ANXIETY_GAD7_6', 'ANXIETY_GAD7_7'
  ],

  // Full AUDIT questions (excluding AUDIT-C brief screener)
  auditFull: [
    'SUBSTANCE_ALCOHOL_4', 'SUBSTANCE_ALCOHOL_5', 'SUBSTANCE_ALCOHOL_6'
  ],

  // Additional high-sensitivity clinical questions
  highSensitivityClinical: [
    // Depression clinical questions (NEURLYN_DEPRESSION)
    'DEPRESSION_CLINICAL_1', 'DEPRESSION_CLINICAL_2', 'DEPRESSION_CLINICAL_3',
    'DEPRESSION_CLINICAL_4', 'DEPRESSION_CLINICAL_5', 'DEPRESSION_CLINICAL_6',
    'DEPRESSION_CLINICAL_7', 'DEPRESSION_CLINICAL_8', 'DEPRESSION_CLINICAL_9',

    // Somatic symptoms
    'SOMATIC_PHQ15_1', 'SOMATIC_PHQ15_2', 'SOMATIC_PHQ15_3', 'SOMATIC_PHQ15_4',
    'SOMATIC_PHQ15_5', 'SOMATIC_PHQ15_6', 'SOMATIC_PHQ15_7', 'SOMATIC_PHQ15_8',
    'SOMATIC_PHQ15_9', 'SOMATIC_PHQ15_10', 'SOMATIC_HEALTH_ANXIETY_1',
    'SOMATIC_HEALTH_ANXIETY_2',

    // PTSD questions
    'ANXIETY_PTSD_1', 'ANXIETY_PTSD_2', 'ANXIETY_PTSD_3'
  ]
};

/**
 * Questions that go in COMPREHENSIVE tier (and possibly CORE)
 */
const COMPREHENSIVE_TIER = {
  // Brief screeners ONLY (not full batteries)
  briefScreeners: [
    'DEPRESSION_PHQ9_1',     // PHQ-2 item 1
    'DEPRESSION_PHQ9_2',     // PHQ-2 item 2
    'ANXIETY_GAD7_1',        // GAD-2 item 1
    'ANXIETY_GAD7_2',        // GAD-2 item 2
    'SUBSTANCE_ALCOHOL_1',   // AUDIT-C item 1
    'SUBSTANCE_ALCOHOL_2',   // AUDIT-C item 2
    'SUBSTANCE_ALCOHOL_3'    // AUDIT-C item 3
  ],

  // Personality instruments (all NEO-PI-R facets)
  instruments: [
    'NEO-PI-R',
    'HEXACO-60',
    'CD-RISC',        // Resilience
    'Brief COPE',     // Coping strategies
    'IIP-32',         // Interpersonal problems
    'MSPSS',          // Social support
    'NEURLYN_JUNGIAN',
    'NEURLYN_ENNEAGRAM'
  ],

  // Neurodiversity (comprehensive)
  neurodiversityInstruments: [
    'NEURLYN_EXECUTIVE',
    'NEURLYN_SENSORY',
    'NEURLYN_EMOTIONAL',
    'NEURLYN_MASKING',
    'NEURLYN_INTERESTS',
    'AQ-10',
    'ASRS-5',
    'RAADS-R'
  ],

  // Attachment (comprehensive)
  attachmentInstruments: [
    'NEURLYN_ATTACHMENT',
    'ECR-R'
  ],

  // Soft probes and treatment indicators (MEDIUM sensitivity or below)
  softProbes: [
    'NEURLYN_SOFT_PROBE',
    'NEURLYN_VALIDITY'
  ],

  // Treatment indicators (motivation, support - NOT aggression/stressors)
  treatmentNonClinical: [
    'TREATMENT_MOTIVATION_1', 'TREATMENT_MOTIVATION_2',
    'TREATMENT_MOTIVATION_3', 'TREATMENT_MOTIVATION_4',
    'TREATMENT_SUPPORT_1', 'TREATMENT_SUPPORT_2',
    'TREATMENT_SUPPORT_3', 'TREATMENT_SUPPORT_4'
  ]
};

/**
 * Questions that go in CORE tier (FREE, 30Q)
 */
const CORE_TIER = {
  // Big Five baseline questions
  baselinePersonality: [
    'BASELINE_OPENNESS_1', 'BASELINE_OPENNESS_2',
    'BASELINE_CONSCIENTIOUSNESS_1', 'BASELINE_CONSCIENTIOUSNESS_2',
    'BASELINE_EXTRAVERSION_1', 'BASELINE_EXTRAVERSION_2',
    'BASELINE_AGREEABLENESS_1', 'BASELINE_AGREEABLENESS_2',
    'BASELINE_NEUROTICISM_1', 'BASELINE_NEUROTICISM_2'
  ],

  // HEXACO honesty-humility (all 18 questions)
  hexaco: ['HEXACO-60'],

  // BFI-2 Improved (10 questions)
  bfi2: ['BFI-2-Improved'],

  // Light neurodiversity screening (strengths-based, LOW sensitivity)
  neurodiversityBaseline: [
    'BASELINE_EF_1', 'BASELINE_EF_2', 'BASELINE_EF_3',
    'BASELINE_SENSORY_1', 'BASELINE_SENSORY_2', 'BASELINE_SENSORY_3',
    'BASELINE_EMOTIONAL_REG_1', 'BASELINE_EMOTIONAL_REG_2',
    'BASELINE_SOCIAL_1', 'BASELINE_SOCIAL_2'
  ],

  // Selected light neurodiversity questions (non-clinical, strength-based)
  neurodiversityLight: [
    'NDV_GEN_003',        // Intense interests (strength)
    'NDV_HYPER_002',      // Can talk about interests for hours (strength)
    'NDV_SOCIAL_001',     // Social interaction preference (neutral)
    'NDV_AUD_001',        // Auditory processing (neutral)
    'NDV_GEN_001',        // Pattern recognition (strength)
    'NDV_EXEC_001'        // Executive function baseline (LOW sensitivity)
  ],

  // Cognitive functions (learning style - LOW sensitivity)
  cognitive: [
    'COGNITIVE_STYLE',
    'NEURLYN_LEARNING'
  ],

  // Basic attachment questions (LOW sensitivity only)
  attachmentBasic: [
    'ATTACHMENT_ANXIOUS_1',
    'ATTACHMENT_AVOIDANT_1'
  ],

  // Validity checks (inconsistency, NOT high sensitivity)
  validity: [
    'VALIDITY_INCONS_1A', 'VALIDITY_INCONS_1B',
    'VALIDITY_INCONS_2A', 'VALIDITY_INCONS_2B'
  ]
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isInClinicalAddonOnly(questionId, instrument, sensitivity, category, subcategory) {
  // Suicide questions - ALWAYS clinical addon only
  if (CLINICAL_ADDON_ONLY.suicideQuestions.includes(questionId)) {
    return true;
  }

  // Full clinical instruments
  if (CLINICAL_ADDON_ONLY.instruments.includes(instrument)) {
    return true;
  }

  // PHQ-9 items 3-9 (full battery, not brief screener)
  if (CLINICAL_ADDON_ONLY.phq9Full.includes(questionId)) {
    return true;
  }

  // GAD-7 items 3-7 (full battery, not brief screener)
  if (CLINICAL_ADDON_ONLY.gad7Full.includes(questionId)) {
    return true;
  }

  // AUDIT items 4-6 (full battery, not brief screener)
  if (CLINICAL_ADDON_ONLY.auditFull.includes(questionId)) {
    return true;
  }

  // High sensitivity clinical questions
  if (CLINICAL_ADDON_ONLY.highSensitivityClinical.includes(questionId)) {
    return true;
  }

  // Treatment aggression/stressors (high sensitivity)
  if (questionId.includes('TREATMENT_AGGRESSION') || questionId.includes('TREATMENT_STRESSORS')) {
    return true;
  }

  // Any EXTREME or HIGH sensitivity clinical questions
  if ((sensitivity === 'EXTREME' || sensitivity === 'HIGH') &&
      category === 'clinical_psychopathology') {
    return true;
  }

  // Trauma screening category (all questions)
  if (category === 'trauma_screening') {
    return true;
  }

  return false;
}

function isInComprehensiveTier(questionId, instrument, sensitivity, category) {
  // Brief screeners (PHQ-2, GAD-2, AUDIT-C)
  if (COMPREHENSIVE_TIER.briefScreeners.includes(questionId)) {
    return true;
  }

  // Personality instruments
  if (COMPREHENSIVE_TIER.instruments.includes(instrument)) {
    return true;
  }

  // Neurodiversity instruments
  if (COMPREHENSIVE_TIER.neurodiversityInstruments.includes(instrument)) {
    return true;
  }

  // Attachment instruments
  if (COMPREHENSIVE_TIER.attachmentInstruments.includes(instrument)) {
    return true;
  }

  // Soft probes (MEDIUM sensitivity or below)
  if (COMPREHENSIVE_TIER.softProbes.includes(instrument) &&
      sensitivity !== 'HIGH' && sensitivity !== 'EXTREME') {
    return true;
  }

  // Treatment non-clinical questions
  if (COMPREHENSIVE_TIER.treatmentNonClinical.includes(questionId)) {
    return true;
  }

  // Validity scales (MEDIUM sensitivity or below)
  if (category === 'validity_scales' &&
      sensitivity !== 'HIGH' && sensitivity !== 'EXTREME') {
    return true;
  }

  return false;
}

function isInCoreTier(questionId, instrument, sensitivity, category) {
  // Baseline personality questions
  if (CORE_TIER.baselinePersonality.includes(questionId)) {
    return true;
  }

  // HEXACO
  if (CORE_TIER.hexaco.includes(instrument)) {
    return true;
  }

  // BFI-2
  if (CORE_TIER.bfi2.includes(instrument)) {
    return true;
  }

  // Neurodiversity baseline
  if (CORE_TIER.neurodiversityBaseline.includes(questionId)) {
    return true;
  }

  // Light neurodiversity questions
  if (CORE_TIER.neurodiversityLight.includes(questionId)) {
    return true;
  }

  // Cognitive/learning style
  if (CORE_TIER.cognitive.includes(instrument)) {
    return true;
  }

  // Basic attachment
  if (CORE_TIER.attachmentBasic.includes(questionId)) {
    return true;
  }

  // Validity checks
  if (CORE_TIER.validity.includes(questionId)) {
    return true;
  }

  // ONLY questions with NONE or LOW sensitivity
  if (sensitivity !== 'NONE' && sensitivity !== 'LOW') {
    return false;
  }

  return false;
}

// ============================================================================
// MAIN TAGGING FUNCTION
// ============================================================================

async function tagQuestionsWithTiers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const allQuestions = await QuestionBank.find({ active: true });
    console.log(`═══════════════════════════════════════════════════════════`);
    console.log(`  TIER TAGGING: ${allQuestions.length} Questions`);
    console.log(`═══════════════════════════════════════════════════════════\n`);

    const stats = {
      coreTier: 0,
      comprehensiveTier: 0,
      clinicalAddonTier: 0,
      multiTier: 0,
      untagged: 0
    };

    const updates = [];

    for (const question of allQuestions) {
      const { questionId, instrument, sensitivity, category, subcategory } = question;

      const tiers = [];

      // Determine tier assignments
      const isClinicalOnly = isInClinicalAddonOnly(
        questionId, instrument, sensitivity, category, subcategory
      );

      if (isClinicalOnly) {
        // CLINICAL_ADDON ONLY - cannot appear in CORE or COMPREHENSIVE
        tiers.push('CLINICAL_ADDON');
        stats.clinicalAddonTier++;
      } else {
        // Check if question belongs in COMPREHENSIVE
        if (isInComprehensiveTier(questionId, instrument, sensitivity, category)) {
          tiers.push('COMPREHENSIVE');
          stats.comprehensiveTier++;
        }

        // Check if question belongs in CORE
        if (isInCoreTier(questionId, instrument, sensitivity, category)) {
          tiers.push('CORE');
          stats.coreTier++;

          // If in both CORE and COMPREHENSIVE, count as multi-tier
          if (tiers.includes('COMPREHENSIVE')) {
            stats.multiTier++;
          }
        }
      }

      // If no tiers assigned, default to COMPREHENSIVE (personality/ND questions)
      if (tiers.length === 0) {
        if (category === 'personality' || category === 'neurodiversity' || category === 'enneagram') {
          tiers.push('COMPREHENSIVE');
          stats.comprehensiveTier++;
        } else {
          stats.untagged++;
          console.log(`⚠️  UNTAGGED: ${questionId} (${instrument}, ${category}, ${sensitivity})`);
        }
      }

      updates.push({
        questionId,
        tiers
      });
    }

    // Display preview
    console.log('=== TIER ASSIGNMENT PREVIEW ===\n');
    console.log(`CORE Tier:              ${stats.coreTier} questions`);
    console.log(`COMPREHENSIVE Tier:     ${stats.comprehensiveTier} questions`);
    console.log(`CLINICAL_ADDON Tier:    ${stats.clinicalAddonTier} questions`);
    console.log(`Multi-Tier (CORE+COMP): ${stats.multiTier} questions`);
    console.log(`Untagged:               ${stats.untagged} questions`);
    console.log('');

    // Sample assignments
    console.log('=== SAMPLE ASSIGNMENTS ===\n');
    const sampleCore = updates.filter(u => u.tiers.includes('CORE')).slice(0, 5);
    console.log('CORE Tier Examples:');
    sampleCore.forEach(u => console.log(`  - ${u.questionId}: [${u.tiers.join(', ')}]`));

    const sampleComp = updates.filter(u => u.tiers.includes('COMPREHENSIVE') && !u.tiers.includes('CORE')).slice(0, 5);
    console.log('\nCOMPREHENSIVE Tier Examples:');
    sampleComp.forEach(u => console.log(`  - ${u.questionId}: [${u.tiers.join(', ')}]`));

    const sampleClinical = updates.filter(u => u.tiers.includes('CLINICAL_ADDON')).slice(0, 5);
    console.log('\nCLINICAL_ADDON Tier Examples:');
    sampleClinical.forEach(u => console.log(`  - ${u.questionId}: [${u.tiers.join(', ')}]`));

    // Prompt for confirmation
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('Ready to update database with tier assignments.');
    console.log('This will add an `assessmentTiers` field to all questions.');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Apply updates
    console.log('Applying updates...\n');
    let updated = 0;

    for (const { questionId, tiers } of updates) {
      await QuestionBank.updateOne(
        { questionId },
        { $set: { assessmentTiers: tiers } }
      );
      updated++;

      if (updated % 100 === 0) {
        console.log(`  Updated ${updated}/${updates.length} questions...`);
      }
    }

    console.log(`\n✓ Successfully tagged ${updated} questions with tier assignments\n`);

    // Generate tier breakdown report
    const tierBreakdown = {
      CORE: updates.filter(u => u.tiers.includes('CORE')).map(u => u.questionId),
      COMPREHENSIVE: updates.filter(u => u.tiers.includes('COMPREHENSIVE')).map(u => u.questionId),
      CLINICAL_ADDON: updates.filter(u => u.tiers.includes('CLINICAL_ADDON')).map(u => u.questionId),
      MULTI_TIER: updates.filter(u => u.tiers.length > 1).map(u => ({
        questionId: u.questionId,
        tiers: u.tiers
      }))
    };

    const fs = require('fs');
    fs.writeFileSync(
      '/home/freddy/Neurlyn/tier-assignments-report.json',
      JSON.stringify(tierBreakdown, null, 2)
    );
    console.log('✓ Tier breakdown saved to tier-assignments-report.json\n');

    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB\n');

  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run tagging
tagQuestionsWithTiers();
