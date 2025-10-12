#!/usr/bin/env node

/**
 * Tier Restructuring: Analyze and Tag All Questions
 *
 * This script analyzes all 617 questions in the database and categorizes them
 * into appropriate tiers based on competitive analysis recommendations:
 *
 * TIER STRUCTURE:
 * - CORE (Free, 30Q): 0% clinical, personality + light ND screening
 * - COMPREHENSIVE (Paid, 70Q): Brief screeners only (PHQ-2, GAD-2)
 * - CLINICAL_ADDON (Optional): Full clinical screening with consent
 *
 * RULES:
 * 1. NO suicide questions in CORE or COMPREHENSIVE
 * 2. Replace full screeners (PHQ-9, GAD-7) with brief versions (PHQ-2, GAD-2)
 * 3. Heavy clinical content only in CLINICAL_ADDON
 * 4. Neurodiversity questions allowed in all tiers (reframed as strengths)
 */

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

// Tier assignment rules
const TIER_RULES = {
  // Questions ALLOWED in Core Tier (Free, 30Q)
  CORE_ALLOWED: {
    categories: ['personality', 'neurodiversity', 'attachment'],
    instruments: [
      'BFI-2-Improved',
      'NEO-PI-R',
      'HEXACO',
      'NEURLYN_NEURODIVERSITY',
      'NEURLYN_COGNITIVE',
      'NEURLYN_LEARNING',
      'NEURLYN_ATTACHMENT'
    ],
    excludeSubcategories: [
      'depression', 'anxiety', 'suicide', 'mania', 'psychosis',
      'borderline_features', 'ptsd', 'trauma', 'substance_use',
      'somatic_symptoms', 'panic', 'ocd'
    ],
    maxSensitivity: 'LOW' // Only NONE or LOW sensitivity in Core
  },

  // Questions ALLOWED in Comprehensive Tier (Paid, 70Q)
  COMPREHENSIVE_ALLOWED: {
    // All Core questions PLUS:
    additionalInstruments: [
      'Enneagram',
      'Jungian',
      'IIP-32',
      'ECR-R',
      'CD-RISC',
      'Brief COPE',
      'MSPSS'
    ],
    // Brief screeners only (not full batteries)
    briefScreenersOnly: [
      'PHQ-2', // Depression (2 questions) - NOT PHQ-9
      'GAD-2', // Anxiety (2 questions) - NOT GAD-7
      'AUDIT-C', // Alcohol (3 questions) - NOT full AUDIT
    ],
    excludeQuestions: [
      // No suicide questions
      /SUICIDE_SCREEN/,
      // No full depression battery (only PHQ-2)
      'PHQ_9_3', 'PHQ_9_4', 'PHQ_9_5', 'PHQ_9_6', 'PHQ_9_7', 'PHQ_9_8', 'PHQ_9_9',
      // No full anxiety battery (only GAD-2)
      'GAD_7_3', 'GAD_7_4', 'GAD_7_5', 'GAD_7_6', 'GAD_7_7',
      // No mania screening
      /MANIA_/,
      // No psychosis
      /PSYCHOSIS_/,
      // No borderline
      /BORDERLINE_/,
      // No PTSD
      /PTSD_/,
      // No trauma
      /TRAUMA_/,
      /ITQ_/,
      /ACES_/
    ],
    maxSensitivity: 'MEDIUM'
  },

  // Questions for Clinical Add-On ONLY
  CLINICAL_ADDON: {
    // All suicide questions
    questionPatterns: [
      /SUICIDE_SCREEN/,
      /MANIA_/,
      /PSYCHOSIS_/,
      /BORDERLINE_/,
      /PTSD_/,
      /TRAUMA_/,
      /ITQ_/,
      /ACES_/
    ],
    // Full screeners
    fullScreeners: [
      'PHQ-9', // Full depression (9Q)
      'GAD-7', // Full anxiety (7Q)
      'MDQ',   // Mania
      'MSI-BPD', // Borderline
      'PQ-B',  // Psychosis
      'PC-PTSD', // PTSD
      'ITQ',   // Complex trauma
      'AUDIT', // Full alcohol
      'DAST'   // Drug use
    ],
    sensitivity: 'HIGH' // All HIGH sensitivity questions
  }
};

async function analyzeDatabaseQuestions() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get all active questions
    const allQuestions = await QuestionBank.find({ active: true });
    console.log(`═══════════════════════════════════════════════════════════`);
    console.log(`  TIER RESTRUCTURING: DATABASE ANALYSIS`);
    console.log(`  Total Active Questions: ${allQuestions.length}`);
    console.log(`═══════════════════════════════════════════════════════════\n`);

    // Categorize by current attributes
    const analysis = {
      byCategory: {},
      byInstrument: {},
      bySensitivity: {},
      bySubcategory: {},
      suicideQuestions: [],
      clinicalQuestions: [],
      personalityQuestions: [],
      neurodiversityQuestions: [],
      totalQuestions: allQuestions.length
    };

    allQuestions.forEach(q => {
      // Category
      analysis.byCategory[q.category] = (analysis.byCategory[q.category] || 0) + 1;

      // Instrument
      analysis.byInstrument[q.instrument] = (analysis.byInstrument[q.instrument] || 0) + 1;

      // Sensitivity
      const sens = q.sensitivity || 'NONE';
      analysis.bySensitivity[sens] = (analysis.bySensitivity[sens] || 0) + 1;

      // Subcategory
      if (q.subcategory) {
        analysis.bySubcategory[q.subcategory] = (analysis.bySubcategory[q.subcategory] || 0) + 1;
      }

      // Special categorization
      if (q.questionId.includes('SUICIDE')) {
        analysis.suicideQuestions.push(q.questionId);
      }
      if (q.category === 'clinical_psychopathology') {
        analysis.clinicalQuestions.push(q.questionId);
      }
      if (q.category === 'personality') {
        analysis.personalityQuestions.push(q.questionId);
      }
      if (q.category === 'neurodiversity') {
        analysis.neurodiversityQuestions.push(q.questionId);
      }
    });

    // Display analysis
    console.log('=== BY CATEGORY ===');
    Object.entries(analysis.byCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        const pct = ((count / analysis.totalQuestions) * 100).toFixed(1);
        console.log(`  ${cat.padEnd(30)} ${count.toString().padStart(3)} (${pct}%)`);
      });

    console.log('\n=== BY SENSITIVITY ===');
    Object.entries(analysis.bySensitivity).forEach(([sens, count]) => {
      const pct = ((count / analysis.totalQuestions) * 100).toFixed(1);
      console.log(`  ${sens.padEnd(15)} ${count.toString().padStart(3)} (${pct}%)`);
    });

    console.log('\n=== CRITICAL FINDINGS ===');
    console.log(`Suicide Questions: ${analysis.suicideQuestions.length}`);
    analysis.suicideQuestions.forEach(id => console.log(`  - ${id}`));

    console.log(`\nClinical Questions: ${analysis.clinicalQuestions.length} (${((analysis.clinicalQuestions.length/analysis.totalQuestions)*100).toFixed(1)}%)`);
    console.log(`Personality Questions: ${analysis.personalityQuestions.length} (${((analysis.personalityQuestions.length/analysis.totalQuestions)*100).toFixed(1)}%)`);
    console.log(`Neurodiversity Questions: ${analysis.neurodiversityQuestions.length} (${((analysis.neurodiversityQuestions.length/analysis.totalQuestions)*100).toFixed(1)}%)`);

    // Save analysis to file
    const fs = require('fs');
    fs.writeFileSync(
      '/home/freddy/Neurlyn/database-question-analysis.json',
      JSON.stringify(analysis, null, 2)
    );
    console.log('\n✓ Analysis saved to database-question-analysis.json');

    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB\n');

  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run analysis
analyzeDatabaseQuestions();
