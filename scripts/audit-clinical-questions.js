/**
 * Clinical Questions Audit
 * Comprehensive check of all clinical instrument availability
 */

const mongoose = require('mongoose');
require('dotenv').config();

const QuestionBank = require('../models/QuestionBank');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/neurlyn';

// Define all clinical instruments that scorers expect
const CLINICAL_INSTRUMENTS = {
  // Phase 2 Scorers
  mania: {
    name: 'Mania/Hypomania (MDQ)',
    questionIds: Array.from({ length: 12 }, (_, i) => `MANIA_MDQ_${i + 1}`),
    minRequired: 10,
    scorer: 'services/mania-scorer.js'
  },
  psychosis: {
    name: 'Psychosis Risk (PQ-B)',
    questionIds: [
      'PSYCHOSIS_PQB_1', 'PSYCHOSIS_PQB_2', 'PSYCHOSIS_PQB_3', 'PSYCHOSIS_PQB_4',
      'PSYCHOSIS_PQB_5', 'PSYCHOSIS_PQB_6', 'PSYCHOSIS_PQB_7', 'PSYCHOSIS_PQB_8',
      'PSYCHOSIS_PQB_9', 'PSYCHOSIS_PQB_10', 'PSYCHOSIS_PQB_11', 'PSYCHOSIS_PQB_12',
      'PSYCHOSIS_PQB_13', 'PSYCHOSIS_PQB_14', 'PSYCHOSIS_PQB_15', 'PSYCHOSIS_PQB_16',
      'PSYCHOSIS_PQB_17', 'PSYCHOSIS_PQB_18', 'PSYCHOSIS_PQB_19', 'PSYCHOSIS_PQB_20', 'PSYCHOSIS_PQB_21'
    ],
    minRequired: 15,
    scorer: 'services/psychosis-scorer.js'
  },
  aces: {
    name: 'Adverse Childhood Experiences (ACEs)',
    questionIds: [
      'ACES_ABUSE_EMOTIONAL', 'ACES_ABUSE_PHYSICAL', 'ACES_ABUSE_SEXUAL',
      'ACES_NEGLECT_EMOTIONAL', 'ACES_NEGLECT_PHYSICAL',
      'ACES_HOUSEHOLD_MENTAL', 'ACES_HOUSEHOLD_VIOLENCE', 'ACES_HOUSEHOLD_DIVORCE',
      'ACES_HOUSEHOLD_SUBSTANCE', 'ACES_HOUSEHOLD_INCARCERATION'
    ],
    minRequired: 8,
    scorer: 'services/aces-calculator.js',
    alternatePattern: /TRAUMA_|ACE_/i
  },
  hexaco: {
    name: 'HEXACO Honesty-Humility',
    questionIds: Array.from({ length: 10 }, (_, i) => `HEXACO_H${Math.floor(i / 4) + 1}_${(i % 4) + 1}`),
    minRequired: 6,
    scorer: 'services/hexaco-scorer.js',
    alternatePattern: /HEXACO_H/i
  },

  // Phase 3 Scorers
  depression: {
    name: 'Depression (PHQ-9)',
    questionIds: Array.from({ length: 9 }, (_, i) => `DEPRESSION_PHQ9_${i + 1}`),
    minRequired: 7,
    scorer: 'services/depression-scorer.js',
    alternatePattern: /DEPRESSION_|PHQ9/i
  },
  anxiety: {
    name: 'Anxiety (GAD-7)',
    questionIds: Array.from({ length: 7 }, (_, i) => `ANXIETY_GAD7_${i + 1}`),
    minRequired: 5,
    scorer: 'services/anxiety-scorer.js',
    alternatePattern: /ANXIETY_|GAD7/i
  },
  resilience: {
    name: 'Resilience (CD-RISC)',
    questionIds: Array.from({ length: 10 }, (_, i) => `RESILIENCE_${i + 1}`),
    minRequired: 6,
    scorer: 'services/resilience-scorer.js',
    alternatePattern: /RESILIENCE_/i
  },
  interpersonal: {
    name: 'Interpersonal Problems (IIP-32)',
    questionIds: [
      'IIP_DOMINEERING_1', 'IIP_VINDICTIVE_1', 'IIP_COLD_1', 'IIP_SOCIALLY_INHIBITED_1',
      'IIP_NONASSERTIVE_1', 'IIP_EXPLOITABLE_1', 'IIP_OVERLY_NURTURANT_1', 'IIP_INTRUSIVE_1'
    ],
    minRequired: 4,
    scorer: 'services/interpersonal-scorer.js',
    alternatePattern: /IIP_|ATTACHMENT_/i
  },
  borderline: {
    name: 'Borderline Traits (MSI-BPD)',
    questionIds: Array.from({ length: 10 }, (_, i) => `BORDERLINE_${i + 1}`),
    minRequired: 7,
    scorer: 'services/borderline-scorer.js',
    alternatePattern: /BORDERLINE_/i
  },
  somatic: {
    name: 'Somatic Symptoms (PHQ-15)',
    questionIds: Array.from({ length: 15 }, (_, i) => `SOMATIC_PHQ15_${i + 1}`),
    minRequired: 10,
    scorer: 'services/somatic-scorer.js',
    alternatePattern: /SOMATIC_|PHQ15/i
  },
  treatment: {
    name: 'Treatment Indicators',
    questionIds: [
      'TREATMENT_MOTIVATION_1', 'TREATMENT_BARRIERS_1', 'TREATMENT_AGGRESSION_1',
      'TREATMENT_STRESSORS_1', 'TREATMENT_READINESS_1'
    ],
    minRequired: 3,
    scorer: 'services/treatment-indicators-scorer.js',
    alternatePattern: /TREATMENT_|SUBSTANCE_/i
  }
};

async function auditClinicalQuestions() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('         CLINICAL QUESTIONS AVAILABILITY AUDIT');
    console.log('═══════════════════════════════════════════════════════════\n');

    const results = {
      available: [],
      partial: [],
      missing: [],
      estimatable: []
    };

    for (const [key, instrument] of Object.entries(CLINICAL_INSTRUMENTS)) {
      console.log(`\n🔍 ${instrument.name}`);
      console.log('─'.repeat(60));

      // Check for exact question IDs
      const exactMatches = await QuestionBank.find({
        questionId: { $in: instrument.questionIds },
        active: true
      });

      console.log(`  Expected question IDs: ${instrument.questionIds.length}`);
      console.log(`  Exact matches found: ${exactMatches.length}`);

      if (exactMatches.length > 0) {
        console.log(`  Matched IDs: ${exactMatches.map(q => q.questionId).join(', ')}`);
      }

      // Check for alternate patterns
      let alternateMatches = [];
      if (instrument.alternatePattern) {
        alternateMatches = await QuestionBank.find({
          questionId: instrument.alternatePattern,
          active: true
        });

        if (alternateMatches.length > 0) {
          console.log(`  Alternate pattern matches: ${alternateMatches.length}`);
          console.log(`  Alternate IDs: ${alternateMatches.slice(0, 5).map(q => q.questionId).join(', ')}${alternateMatches.length > 5 ? '...' : ''}`);
        }
      }

      const totalMatches = exactMatches.length + alternateMatches.length;
      const coverage = (totalMatches / instrument.questionIds.length * 100).toFixed(0);

      // Categorize
      if (totalMatches >= instrument.minRequired) {
        results.available.push(key);
        console.log(`  ✅ STATUS: AVAILABLE (${coverage}% coverage, ${totalMatches}/${instrument.questionIds.length})`);
      } else if (totalMatches > 0) {
        results.partial.push(key);
        console.log(`  ⚠️  STATUS: PARTIAL (${coverage}% coverage, ${totalMatches}/${instrument.questionIds.length})`);
        console.log(`     Need ${instrument.minRequired - totalMatches} more questions`);
      } else {
        results.missing.push(key);
        console.log(`  ❌ STATUS: MISSING (0% coverage)`);

        // Check if can be estimated from personality
        if (['depression', 'anxiety', 'mania'].includes(key)) {
          results.estimatable.push(key);
          console.log(`     💡 CAN BE ESTIMATED from Big Five traits`);
        }
      }

      console.log(`  Scorer: ${instrument.scorer}`);
    }

    // Summary
    console.log('\n\n═══════════════════════════════════════════════════════════');
    console.log('         AUDIT SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log(`✅ AVAILABLE (${results.available.length}/${Object.keys(CLINICAL_INSTRUMENTS).length}):`);
    results.available.forEach(key => {
      console.log(`   - ${CLINICAL_INSTRUMENTS[key].name}`);
    });

    console.log(`\n⚠️  PARTIAL DATA (${results.partial.length}):`);
    results.partial.forEach(key => {
      console.log(`   - ${CLINICAL_INSTRUMENTS[key].name}`);
    });

    console.log(`\n❌ MISSING (${results.missing.length}):`);
    results.missing.forEach(key => {
      console.log(`   - ${CLINICAL_INSTRUMENTS[key].name}`);
    });

    console.log(`\n💡 ESTIMATABLE FROM PERSONALITY (${results.estimatable.length}):`);
    results.estimatable.forEach(key => {
      console.log(`   - ${CLINICAL_INSTRUMENTS[key].name}`);
    });

    // Recommendations
    console.log('\n\n📋 RECOMMENDATIONS');
    console.log('─'.repeat(60));

    if (results.missing.length > 0) {
      console.log('\nOption 1: Add Missing Questions');
      console.log('  Create questions for:');
      results.missing.forEach(key => {
        if (!results.estimatable.includes(key)) {
          console.log(`    - ${CLINICAL_INSTRUMENTS[key].name} (${CLINICAL_INSTRUMENTS[key].minRequired} questions)`);
        }
      });

      console.log('\nOption 2: Implement Estimation for Clinical Scorers');
      console.log('  Estimate from Big Five for:');
      results.estimatable.forEach(key => {
        console.log(`    - ${CLINICAL_INSTRUMENTS[key].name}`);
      });
      console.log('  Estimation formulas:');
      console.log('    Depression Risk = f(high N, low E, low C, low A)');
      console.log('    Anxiety Risk = f(high N, low C)');
      console.log('    Mania Risk = f(high E, low C, high impulsivity from responses)');
    }

    if (results.partial.length > 0) {
      console.log('\nOption 3: Complete Partial Instruments');
      results.partial.forEach(key => {
        const instrument = CLINICAL_INSTRUMENTS[key];
        console.log(`  - Add ${instrument.minRequired} more questions for ${instrument.name}`);
      });
    }

    console.log('\n');

    await mongoose.connection.close();
    console.log('✅ Audit complete\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run audit
if (require.main === module) {
  auditClinicalQuestions();
}

module.exports = auditClinicalQuestions;
