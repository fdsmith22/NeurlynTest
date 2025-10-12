/**
 * Tag Questions with Sensitivity Levels - V2
 * Works with actual Neurlyn database structure
 *
 * The Neurlyn system doesn't directly ask PHQ-9/GAD-7/etc. questions.
 * Instead, it estimates clinical scores from personality responses.
 * This script tags existing questions based on their content sensitivity.
 */

const mongoose = require('mongoose');
require('dotenv').config();

const QuestionBank = require('../models/QuestionBank');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/neurlyn';

async function tagQuestionSensitivity() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    let updatedCount = 0;

    // ============================================
    // MODERATE-HIGH SENSITIVITY - Trauma Symptoms
    // ============================================

    // NEURLYN_TRAUMA questions (indirect trauma screening)
    // These ask about symptoms (dissociation, hypervigilance) not direct trauma exposure
    const traumaResult = await QuestionBank.updateMany(
      { instrument: 'NEURLYN_TRAUMA', active: true },
      {
        $set: {
          sensitivity: 'MODERATE',
          clinicalDomain: 'trauma',
          'requiredSignals.minQuestionCount': 25,
          'requiredSignals.requiredPhase': 'clinical_validation',
          'requiredSignals.anyOf': true,
          'requiredSignals.triggerConditions': [
            { dimension: 'neuroticism', minScore: 60 },
            { dimension: 'anxietySymptoms', minScore: 55 },
            { dimension: 'emotionalDysregulation', minScore: 50 }
          ],
          contextMessage: 'The next questions explore how you experience stress and safety. Many people relate to these experiences in different ways.'
        }
      }
    );
    updatedCount += traumaResult.modifiedCount;
    console.log(`✅ Tagged ${traumaResult.modifiedCount} NEURLYN_TRAUMA questions as MODERATE sensitivity`);

    // Tag specific high-intensity trauma questions as HIGH sensitivity
    const highTraumaResult = await QuestionBank.updateMany(
      {
        instrument: 'NEURLYN_TRAUMA',
        $or: [
          { text: /disconnected from my body|dissociat/i },
          { text: /lose time|can't remember/i },
          { text: /unreal.*dreamlike/i }
        ],
        active: true
      },
      {
        $set: {
          sensitivity: 'HIGH',
          'requiredSignals.minQuestionCount': 30
        }
      }
    );
    updatedCount += highTraumaResult.modifiedCount;
    console.log(`✅ Upgraded ${highTraumaResult.modifiedCount} dissociation/memory questions to HIGH sensitivity`);

    // ============================================
    // MODERATE SENSITIVITY - Attachment & Emotion Regulation
    // ============================================

    // NEURLYN_ATTACHMENT questions
    const attachmentResult = await QuestionBank.updateMany(
      { instrument: 'NEURLYN_ATTACHMENT', active: true },
      {
        $set: {
          sensitivity: 'LOW',
          clinicalDomain: null, // Attachment is developmental, not clinical
          'requiredSignals.minQuestionCount': 20,
          'requiredSignals.anyOf': true,
          'requiredSignals.triggerConditions': [
            { dimension: 'interpersonalPatterns', minScore: 55 },
            { dimension: 'relationshipSatisfaction', maxScore: 40 }
          ],
          contextMessage: 'Everyone forms relationships in unique ways. These questions explore your relationship patterns and preferences.'
        }
      }
    );
    updatedCount += attachmentResult.modifiedCount;
    console.log(`✅ Tagged ${attachmentResult.modifiedCount} NEURLYN_ATTACHMENT questions as LOW sensitivity`);

    // NEURLYN_EMOTIONAL questions (likely emotion regulation)
    const emotionalResult = await QuestionBank.updateMany(
      { instrument: 'NEURLYN_EMOTIONAL', active: true },
      {
        $set: {
          sensitivity: 'LOW',
          clinicalDomain: null,
          'requiredSignals.minQuestionCount': 15,
          contextMessage: 'Everyone experiences and processes emotions differently. These questions help us understand your emotional patterns.'
        }
      }
    );
    updatedCount += emotionalResult.modifiedCount;
    console.log(`✅ Tagged ${emotionalResult.modifiedCount} NEURLYN_EMOTIONAL questions as LOW sensitivity`);

    // ============================================
    // LOW SENSITIVITY - Neurodiversity (Non-Stigmatizing)
    // ============================================

    // ADHD Screening (ASRS-5) - already done in previous script
    const adhdResult = await QuestionBank.updateMany(
      { instrument: 'ASRS-5', active: true, sensitivity: { $exists: false } },
      {
        $set: {
          sensitivity: 'LOW',
          clinicalDomain: null,
          'requiredSignals.minQuestionCount': 15,
          'requiredSignals.anyOf': true,
          'requiredSignals.triggerConditions': [
            { dimension: 'conscientiousness', maxScore: 40 },
            { dimension: 'executiveFunction', maxScore: 45 }
          ],
          contextMessage: 'Everyone has different ways of staying organized and focused. These questions help us understand your natural attention and planning style.'
        }
      }
    );
    updatedCount += adhdResult.modifiedCount;
    console.log(`✅ Tagged ${adhdResult.modifiedCount} ASRS-5 questions as LOW sensitivity`);

    // Autism Screening (AQ-10) - already done in previous script
    const autismResult = await QuestionBank.updateMany(
      { instrument: 'AQ-10', active: true, sensitivity: { $exists: false } },
      {
        $set: {
          sensitivity: 'LOW',
          clinicalDomain: null,
          'requiredSignals.minQuestionCount': 12,
          'requiredSignals.anyOf': true,
          'requiredSignals.triggerConditions': [
            { dimension: 'socialComfort', maxScore: 40 },
            { dimension: 'sensoryProcessing', minScore: 55 }
          ],
          contextMessage: 'People experience the world in wonderfully diverse ways. These questions explore your unique patterns of thinking and interaction.'
        }
      }
    );
    updatedCount += autismResult.modifiedCount;
    console.log(`✅ Tagged ${autismResult.modifiedCount} AQ-10 questions as LOW sensitivity`);

    // Executive Function (NEURLYN_EXECUTIVE)
    const efResult = await QuestionBank.updateMany(
      { instrument: 'NEURLYN_EXECUTIVE', active: true },
      {
        $set: {
          sensitivity: 'NONE',
          clinicalDomain: null,
          contextMessage: null // No context needed - these are neutral cognitive questions
        }
      }
    );
    updatedCount += efResult.modifiedCount;
    console.log(`✅ Tagged ${efResult.modifiedCount} NEURLYN_EXECUTIVE questions as NONE sensitivity`);

    // Sensory Processing (NEURLYN_SENSORY)
    const sensoryResult = await QuestionBank.updateMany(
      { instrument: 'NEURLYN_SENSORY', active: true },
      {
        $set: {
          sensitivity: 'NONE',
          clinicalDomain: null,
          contextMessage: null
        }
      }
    );
    updatedCount += sensoryResult.modifiedCount;
    console.log(`✅ Tagged ${sensoryResult.modifiedCount} NEURLYN_SENSORY questions as NONE sensitivity`);

    // Masking (NEURLYN_MASKING) - could be sensitive for autistic individuals
    const maskingResult = await QuestionBank.updateMany(
      { instrument: 'NEURLYN_MASKING', active: true },
      {
        $set: {
          sensitivity: 'LOW',
          clinicalDomain: null,
          'requiredSignals.minQuestionCount': 20,
          contextMessage: 'Many people adapt their behavior in social situations. These questions explore how you navigate different social contexts.'
        }
      }
    );
    updatedCount += maskingResult.modifiedCount;
    console.log(`✅ Tagged ${maskingResult.modifiedCount} NEURLYN_MASKING questions as LOW sensitivity`);

    // ============================================
    // NONE SENSITIVITY - Personality & Cognitive
    // ============================================

    // BFI-2 Personality questions (baseline)
    const bfiResult = await QuestionBank.updateMany(
      { instrument: 'BFI-2-Improved', active: true },
      {
        $set: {
          sensitivity: 'NONE',
          clinicalDomain: null
        }
      }
    );
    updatedCount += bfiResult.modifiedCount;
    console.log(`✅ Tagged ${bfiResult.modifiedCount} BFI-2 personality questions as NONE sensitivity`);

    // BUT tag neuroticism questions with anxiety/depression facets as LOW
    const neuroFacetResult = await QuestionBank.updateMany(
      {
        instrument: 'BFI-2-Improved',
        trait: 'neuroticism',
        $or: [
          { text: /depressed|sad|hopeless|worthless/i },
          { text: /anxious|worried|nervous|tense/i }
        ],
        active: true
      },
      {
        $set: {
          sensitivity: 'LOW'
        }
      }
    );
    updatedCount += neuroFacetResult.modifiedCount;
    console.log(`✅ Upgraded ${neuroFacetResult.modifiedCount} neuroticism questions to LOW sensitivity (clinical keywords)`);

    // Enneagram, Jungian, Learning Style - all NONE sensitivity
    const otherResult = await QuestionBank.updateMany(
      {
        instrument: { $in: ['NEURLYN_ENNEAGRAM', 'NEURLYN_JUNGIAN', 'NEURLYN_LEARNING', 'NEURLYN_INTERESTS', 'COGNITIVE_STYLE'] },
        active: true
      },
      {
        $set: {
          sensitivity: 'NONE',
          clinicalDomain: null
        }
      }
    );
    updatedCount += otherResult.modifiedCount;
    console.log(`✅ Tagged ${otherResult.modifiedCount} enneagram/jungian/learning questions as NONE sensitivity`);

    // ============================================
    // Summary
    // ============================================

    console.log('\n' + '='.repeat(60));
    console.log(`✅ COMPLETE: Tagged/updated ${updatedCount} questions`);
    console.log('='.repeat(60));

    console.log('\nSensitivity Distribution:');
    const counts = await QuestionBank.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$sensitivity', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    counts.forEach(({ _id, count }) => {
      const label = _id || 'NONE';
      console.log(`  ${label.padEnd(15)} ${count} questions`);
    });

    console.log('\nClinical Domain Distribution:');
    const domains = await QuestionBank.aggregate([
      { $match: { active: true, clinicalDomain: { $ne: null } } },
      { $group: { _id: '$clinicalDomain', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    if (domains.length > 0) {
      domains.forEach(({ _id, count }) => {
        console.log(`  ${_id.padEnd(20)} ${count} questions`);
      });
    } else {
      console.log('  (No questions have clinical domains - expected for this database)');
    }

    console.log('\nQuestions with trigger conditions:');
    const triggered = await QuestionBank.countDocuments({
      active: true,
      'requiredSignals.triggerConditions': { $exists: true, $ne: [] }
    });
    console.log(`  ${triggered} questions have conditional triggering`);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error tagging questions:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  tagQuestionSensitivity();
}

module.exports = tagQuestionSensitivity;
