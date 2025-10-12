/**
 * Migration: Add discriminationIndex to all questions
 *
 * Estimates quality based on:
 * - Validated clinical instruments (highest)
 * - NEO-PI-R facets (high)
 * - Custom neurlyn instruments (medium)
 * - Category-based defaults (low-medium)
 *
 * Quality Scale:
 * 0.90+ = Exceptional (gold standard validated)
 * 0.80-0.89 = Excellent (well-validated clinical)
 * 0.70-0.79 = Good (NEO-PI-R, validated personality)
 * 0.60-0.69 = Adequate (custom instruments, neurodiversity)
 * 0.50-0.59 = Fair (supplemental/exploratory)
 */

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

async function addDiscriminationIndex() {
  try {
    await mongoose.connect('mongodb://localhost:27017/neurlyn-test');
    console.log('Connected to neurlyn-test database\n');

    // Tier 1: Gold Standard Validated Instruments (0.85-0.90)
    const tier1Instruments = {
      'PHQ-9': 0.88,          // Depression - extensively validated
      'GAD-7': 0.87,          // Anxiety - extensively validated
      'PHQ-15': 0.85,         // Somatic - well validated
      'MDQ': 0.86,            // Mania - well validated
      'PQ-B': 0.85,           // Psychosis screening
      'MSI-BPD': 0.84,        // Borderline - validated
      'AUDIT': 0.86,          // Alcohol - gold standard
      'DAST': 0.85,           // Drugs - well validated
      'ACEs': 0.83,           // Trauma - validated
      'ITQ': 0.84             // Complex PTSD - validated
    };

    console.log('=== TIER 1: Gold Standard Validated Instruments ===');
    for (const [instrument, discrimination] of Object.entries(tier1Instruments)) {
      const result = await QuestionBank.updateMany(
        { instrument: instrument },
        { $set: { 'adaptive.discriminationIndex': discrimination } }
      );
      console.log(`✓ ${instrument}: ${result.modifiedCount} questions updated (discrimination: ${discrimination})`);
    }

    // Tier 2: NEO-PI-R Facets (0.70-0.78)
    console.log('\n=== TIER 2: NEO-PI-R Personality Facets ===');
    const neoResult = await QuestionBank.updateMany(
      {
        instrument: 'NEO-PI-R',
        'adaptive.discriminationIndex': { $exists: false }
      },
      { $set: { 'adaptive.discriminationIndex': 0.75 } }
    );
    console.log(`✓ NEO-PI-R: ${neoResult.modifiedCount} questions updated (discrimination: 0.75)`);

    // Tier 3: Other Validated Personality Instruments (0.70-0.75)
    const tier3Instruments = {
      'HEXACO-60': 0.73,      // Honesty-Humility - validated
      'CD-RISC': 0.72,        // Resilience - validated
      'ECR-R': 0.74,          // Attachment - validated
      'IIP-32': 0.73,         // Interpersonal - validated
      'Brief COPE': 0.70,     // Coping - validated
      'MSPSS': 0.71,          // Social support - validated
      'BFI-2-Improved': 0.72  // Big Five - validated
    };

    console.log('\n=== TIER 3: Other Validated Instruments ===');
    for (const [instrument, discrimination] of Object.entries(tier3Instruments)) {
      const result = await QuestionBank.updateMany(
        {
          instrument: instrument,
          'adaptive.discriminationIndex': { $exists: false }
        },
        { $set: { 'adaptive.discriminationIndex': discrimination } }
      );
      console.log(`✓ ${instrument}: ${result.modifiedCount} questions updated (discrimination: ${discrimination})`);
    }

    // Tier 4: Neurlyn Custom Clinical Instruments (0.60-0.70)
    const tier4Instruments = {
      'NEURLYN_DEPRESSION': 0.68,
      'NEURLYN_PANIC': 0.67,
      'NEURLYN_SOCIAL_ANXIETY': 0.67,
      'NEURLYN_OCD': 0.66,
      'NEURLYN_PTSD': 0.66,
      'NEURLYN_SUICIDE_SCREEN': 0.70,  // Higher due to critical nature
      'AQ-10': 0.68,                    // Autism screening
      'AQ-Brief': 0.67,
      'ASRS-5': 0.68                    // ADHD screening
    };

    console.log('\n=== TIER 4: Neurlyn Custom Clinical Instruments ===');
    for (const [instrument, discrimination] of Object.entries(tier4Instruments)) {
      const result = await QuestionBank.updateMany(
        {
          instrument: instrument,
          'adaptive.discriminationIndex': { $exists: false }
        },
        { $set: { 'adaptive.discriminationIndex': discrimination } }
      );
      console.log(`✓ ${instrument}: ${result.modifiedCount} questions updated (discrimination: ${discrimination})`);
    }

    // Tier 5: Neurlyn Neurodiversity Instruments (0.60-0.65)
    const tier5Instruments = {
      'NEURLYN_EXECUTIVE': 0.64,
      'NEURLYN_SENSORY': 0.63,
      'NEURLYN_MASKING': 0.62,
      'NEURLYN_EMOTIONAL': 0.63,
      'NEURLYN_INTERESTS': 0.61
    };

    console.log('\n=== TIER 5: Neurlyn Neurodiversity Instruments ===');
    for (const [instrument, discrimination] of Object.entries(tier5Instruments)) {
      const result = await QuestionBank.updateMany(
        {
          instrument: instrument,
          'adaptive.discriminationIndex': { $exists: false }
        },
        { $set: { 'adaptive.discriminationIndex': discrimination } }
      );
      console.log(`✓ ${instrument}: ${result.modifiedCount} questions updated (discrimination: ${discrimination})`);
    }

    // Tier 6: Validity Scales (0.65-0.75)
    console.log('\n=== TIER 6: Validity Scales ===');
    const validityResult = await QuestionBank.updateMany(
      {
        instrument: 'NEURLYN_VALIDITY',
        'adaptive.discriminationIndex': { $exists: false }
      },
      { $set: { 'adaptive.discriminationIndex': 0.70 } }
    );
    console.log(`✓ NEURLYN_VALIDITY: ${validityResult.modifiedCount} questions updated (discrimination: 0.70)`);

    // Tier 7: Attachment & Trauma Screening (0.62-0.68)
    const tier7Instruments = {
      'NEURLYN_ATTACHMENT': 0.66,
      'NEURLYN_TRAUMA': 0.67
    };

    console.log('\n=== TIER 7: Attachment & Trauma Screening ===');
    for (const [instrument, discrimination] of Object.entries(tier7Instruments)) {
      const result = await QuestionBank.updateMany(
        {
          instrument: instrument,
          'adaptive.discriminationIndex': { $exists: false }
        },
        { $set: { 'adaptive.discriminationIndex': discrimination } }
      );
      console.log(`✓ ${instrument}: ${result.modifiedCount} questions updated (discrimination: ${discrimination})`);
    }

    // Tier 8: Exploratory/Supplemental (0.55-0.60)
    const tier8Instruments = {
      'NEURLYN_ENNEAGRAM': 0.58,
      'NEURLYN_JUNGIAN': 0.57,
      'NEURLYN_LEARNING': 0.56,
      'COGNITIVE_STYLE': 0.56,
      'NEURLYN': 0.60  // General neurlyn questions
    };

    console.log('\n=== TIER 8: Exploratory/Supplemental ===');
    for (const [instrument, discrimination] of Object.entries(tier8Instruments)) {
      const result = await QuestionBank.updateMany(
        {
          instrument: instrument,
          'adaptive.discriminationIndex': { $exists: false }
        },
        { $set: { 'adaptive.discriminationIndex': discrimination } }
      );
      console.log(`✓ ${instrument}: ${result.modifiedCount} questions updated (discrimination: ${discrimination})`);
    }

    // Default for any remaining questions (0.60)
    console.log('\n=== DEFAULT: Remaining Questions ===');
    const defaultResult = await QuestionBank.updateMany(
      { 'adaptive.discriminationIndex': { $exists: false } },
      { $set: { 'adaptive.discriminationIndex': 0.60 } }
    );
    console.log(`✓ Default: ${defaultResult.modifiedCount} questions updated (discrimination: 0.60)`);

    // Verification
    console.log('\n=== VERIFICATION ===');
    const totalQuestions = await QuestionBank.countDocuments();
    const withDiscrimination = await QuestionBank.countDocuments({
      'adaptive.discriminationIndex': { $exists: true, $ne: null }
    });

    console.log(`Total questions: ${totalQuestions}`);
    console.log(`Questions with discriminationIndex: ${withDiscrimination}`);
    console.log(`Coverage: ${((withDiscrimination/totalQuestions)*100).toFixed(1)}%`);

    if (withDiscrimination === totalQuestions) {
      console.log('\n✅ MIGRATION COMPLETE - All questions have discriminationIndex');
    } else {
      console.log(`\n⚠️  WARNING: ${totalQuestions - withDiscrimination} questions still missing discriminationIndex`);
    }

    // Show distribution
    console.log('\n=== DISCRIMINATION INDEX DISTRIBUTION ===');
    const distribution = await QuestionBank.aggregate([
      {
        $bucket: {
          groupBy: '$adaptive.discriminationIndex',
          boundaries: [0.50, 0.60, 0.70, 0.80, 0.90, 1.0],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            instruments: { $addToSet: '$instrument' }
          }
        }
      }
    ]);

    distribution.forEach(bucket => {
      const range = bucket._id === 'Other' ? 'Other' :
        `${bucket._id.toFixed(2)}-${(bucket._id + 0.10).toFixed(2)}`;
      console.log(`${range}: ${bucket.count} questions`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from database');
  }
}

// Run migration
addDiscriminationIndex();
