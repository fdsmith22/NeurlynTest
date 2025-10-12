/**
 * Tag Questions with Sensitivity Levels and Trigger Conditions
 * Part of Tactful Assessment Implementation
 *
 * This script adds sensitivity metadata to clinical questions to ensure
 * they are only asked when appropriate (not too early, and only when signals indicate relevance)
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
    // EXTREME SENSITIVITY - Trauma & Suicidality
    // ============================================

    // ACEs Questions (Childhood Trauma)
    const acesResult = await QuestionBank.updateMany(
      { instrument: 'ACEs', active: true },
      {
        $set: {
          sensitivity: 'EXTREME',
          clinicalDomain: 'trauma',
          'requiredSignals.minQuestionCount': 40,
          'requiredSignals.requiredPhase': 'deepening',
          'requiredSignals.anyOf': true,
          'requiredSignals.triggerConditions': [
            { dimension: 'emotionalDysregulation', minScore: 60 },
            { dimension: 'ptsdSymptoms', minScore: 50 },
            { dimension: 'depressionSeverity', minLevel: 'moderate' },
            { dimension: 'dissociation', minScore: 50 }
          ],
          contextMessage: 'Some people have experienced difficult situations earlier in life. Research shows that understanding these experiences can be helpful for personal growth. You can skip any questions that feel too personal.'
        }
      }
    );
    updatedCount += acesResult.modifiedCount;
    console.log(`✅ Tagged ${acesResult.modifiedCount} ACEs questions as EXTREME sensitivity`);

    // PHQ-9 Suicidality Question (Question 9)
    const suicidalityResult = await QuestionBank.updateMany(
      {
        instrument: 'PHQ-9',
        text: /thoughts.*better off dead|hurt.*yourself/i,
        active: true
      },
      {
        $set: {
          sensitivity: 'EXTREME',
          clinicalDomain: 'suicidality',
          'requiredSignals.minQuestionCount': 35,
          'requiredSignals.requiredPhase': 'deepening',
          'requiredSignals.anyOf': false, // ALL conditions must be met
          'requiredSignals.triggerConditions': [
            { dimension: 'depressionSeverity', minLevel: 'moderate' },
            { dimension: 'hopelessness', minScore: 60 }
          ],
          contextMessage: 'The next question is sensitive but important for understanding your wellbeing. Please answer honestly - all responses are confidential.'
        }
      }
    );
    updatedCount += suicidalityResult.modifiedCount;
    console.log(`✅ Tagged ${suicidalityResult.modifiedCount} suicidality questions as EXTREME sensitivity`);

    // PTSD Trauma Event Questions
    const ptsdTraumaResult = await QuestionBank.updateMany(
      {
        $or: [
          { instrument: 'PCL-5', text: /traumatic event|witnessed/i },
          { subcategory: 'trauma', text: /abuse|assault|violence/i }
        ],
        active: true
      },
      {
        $set: {
          sensitivity: 'EXTREME',
          clinicalDomain: 'ptsd',
          'requiredSignals.minQuestionCount': 35,
          'requiredSignals.requiredPhase': 'deepening',
          'requiredSignals.anyOf': true,
          'requiredSignals.triggerConditions': [
            { dimension: 'ptsdSymptoms', minScore: 50 },
            { dimension: 'hypervigilance', minScore: 60 },
            { dimension: 'dissociation', minScore: 55 }
          ],
          contextMessage: 'Some people have experienced difficult or frightening events. The next questions help us understand if past experiences may be affecting you now.'
        }
      }
    );
    updatedCount += ptsdTraumaResult.modifiedCount;
    console.log(`✅ Tagged ${ptsdTraumaResult.modifiedCount} PTSD trauma questions as EXTREME sensitivity`);

    // ============================================
    // HIGH SENSITIVITY - Psychosis & Mania
    // ============================================

    // Psychosis Screening (PQ-B)
    const psychosisResult = await QuestionBank.updateMany(
      { instrument: 'PQ-B', active: true },
      {
        $set: {
          sensitivity: 'HIGH',
          clinicalDomain: 'psychosis',
          'requiredSignals.minQuestionCount': 30,
          'requiredSignals.requiredPhase': 'clinical_validation',
          'requiredSignals.anyOf': true,
          'requiredSignals.triggerConditions': [
            { dimension: 'maniaSymptoms', minScore: 60 },
            { dimension: 'dissociation', minScore: 65 },
            { dimension: 'perceptualAnomalies', minScore: 50 }
          ],
          contextMessage: 'Everyone perceives the world differently. Some people have unique sensory or perceptual experiences. These questions explore the full range of human perception - there are no "wrong" answers.'
        }
      }
    );
    updatedCount += psychosisResult.modifiedCount;
    console.log(`✅ Tagged ${psychosisResult.modifiedCount} psychosis questions as HIGH sensitivity`);

    // Mania Screening (MDQ)
    const maniaResult = await QuestionBank.updateMany(
      { instrument: 'MDQ', active: true },
      {
        $set: {
          sensitivity: 'HIGH',
          clinicalDomain: 'mania',
          'requiredSignals.minQuestionCount': 28,
          'requiredSignals.requiredPhase': 'clinical_validation',
          'requiredSignals.anyOf': true,
          'requiredSignals.triggerConditions': [
            { dimension: 'energyLevel', minScore: 75 },
            { dimension: 'impulsivity', minScore: 65 },
            { dimension: 'sleepDisturbance', minScore: 60 }
          ],
          contextMessage: 'Some people experience periods of unusually high energy or activity. The next questions help us understand your energy patterns.'
        }
      }
    );
    updatedCount += maniaResult.modifiedCount;
    console.log(`✅ Tagged ${maniaResult.modifiedCount} mania questions as HIGH sensitivity`);

    // Substance Use (AUDIT, DAST)
    const substanceResult = await QuestionBank.updateMany(
      {
        instrument: { $in: ['AUDIT', 'DAST'] },
        active: true
      },
      {
        $set: {
          sensitivity: 'HIGH',
          clinicalDomain: 'substance_use',
          'requiredSignals.minQuestionCount': 30,
          'requiredSignals.requiredPhase': 'clinical_validation',
          'requiredSignals.anyOf': true,
          'requiredSignals.triggerConditions': [
            { dimension: 'impulsivity', minScore: 60 },
            { dimension: 'stressCoping', maxScore: 40 },
            { dimension: 'conscientiousness', maxScore: 35 }
          ],
          contextMessage: 'The next questions are about how you manage stress and social situations. Please answer honestly - this information helps us provide better insights.'
        }
      }
    );
    updatedCount += substanceResult.modifiedCount;
    console.log(`✅ Tagged ${substanceResult.modifiedCount} substance use questions as HIGH sensitivity`);

    // ============================================
    // MODERATE SENSITIVITY - Depression & Anxiety
    // ============================================

    // PHQ-9 Depression (excluding suicidality question)
    const depressionResult = await QuestionBank.updateMany(
      {
        instrument: 'PHQ-9',
        text: { $not: /thoughts.*better off dead|hurt.*yourself/i },
        active: true
      },
      {
        $set: {
          sensitivity: 'MODERATE',
          clinicalDomain: 'depression',
          'requiredSignals.minQuestionCount': 20,
          'requiredSignals.requiredPhase': 'trait_building',
          'requiredSignals.anyOf': true,
          'requiredSignals.triggerConditions': [
            { dimension: 'energyLevel', maxScore: 40 },
            { dimension: 'lifeSatisfaction', maxScore: 35 },
            { dimension: 'sleepQuality', maxScore: 40 },
            { dimension: 'neuroticism', minScore: 60 }
          ],
          contextMessage: 'Everyone experiences emotional ups and downs. The next few questions help us understand your mood patterns over the past couple weeks.'
        }
      }
    );
    updatedCount += depressionResult.modifiedCount;
    console.log(`✅ Tagged ${depressionResult.modifiedCount} depression questions as MODERATE sensitivity`);

    // GAD-7 Anxiety
    const anxietyResult = await QuestionBank.updateMany(
      { instrument: 'GAD-7', active: true },
      {
        $set: {
          sensitivity: 'MODERATE',
          clinicalDomain: 'anxiety',
          'requiredSignals.minQuestionCount': 18,
          'requiredSignals.requiredPhase': 'trait_building',
          'requiredSignals.anyOf': true,
          'requiredSignals.triggerConditions': [
            { dimension: 'worryFrequency', minScore: 55 },
            { dimension: 'stressResponse', maxScore: 40 },
            { dimension: 'sleepQuality', maxScore: 45 },
            { dimension: 'neuroticism', minScore: 60 }
          ],
          contextMessage: 'Many people experience worry or tension at times. Let\'s explore how you typically respond to stressful situations.'
        }
      }
    );
    updatedCount += anxietyResult.modifiedCount;
    console.log(`✅ Tagged ${anxietyResult.modifiedCount} anxiety questions as MODERATE sensitivity`);

    // OCD Screening
    const ocdResult = await QuestionBank.updateMany(
      {
        $or: [
          { instrument: 'OCI-R' },
          { subcategory: 'obsessive_compulsive' }
        ],
        active: true
      },
      {
        $set: {
          sensitivity: 'MODERATE',
          clinicalDomain: 'ocd',
          'requiredSignals.minQuestionCount': 25,
          'requiredSignals.requiredPhase': 'clinical_validation',
          'requiredSignals.anyOf': true,
          'requiredSignals.triggerConditions': [
            { dimension: 'conscientiousness', minScore: 75 },
            { dimension: 'anxietySymptoms', minScore: 60 },
            { dimension: 'ritualizedBehavior', minScore: 55 }
          ],
          contextMessage: 'Some people have specific routines or habits that help them feel comfortable. These questions explore different patterns of thinking and behavior.'
        }
      }
    );
    updatedCount += ocdResult.modifiedCount;
    console.log(`✅ Tagged ${ocdResult.modifiedCount} OCD questions as MODERATE sensitivity`);

    // ============================================
    // LOW SENSITIVITY - ADHD & Autism (Non-Stigmatizing)
    // ============================================

    // ADHD Screening (ASRS)
    const adhdResult = await QuestionBank.updateMany(
      {
        instrument: { $in: ['ASRS-5', 'ASRS-6'] },
        active: true
      },
      {
        $set: {
          sensitivity: 'LOW',
          clinicalDomain: null, // Not clinical - neurodiversity
          'requiredSignals.minQuestionCount': 15,
          'requiredSignals.anyOf': true,
          'requiredSignals.triggerConditions': [
            { dimension: 'conscientiousness', maxScore: 40 },
            { dimension: 'executiveFunction', maxScore: 45 },
            { dimension: 'taskCompletion', maxScore: 40 }
          ],
          contextMessage: 'Everyone has different ways of staying organized and focused. These questions help us understand your natural attention and planning style.'
        }
      }
    );
    updatedCount += adhdResult.modifiedCount;
    console.log(`✅ Tagged ${adhdResult.modifiedCount} ADHD questions as LOW sensitivity`);

    // Autism Screening (AQ-10)
    const autismResult = await QuestionBank.updateMany(
      { instrument: 'AQ-10', active: true },
      {
        $set: {
          sensitivity: 'LOW',
          clinicalDomain: null, // Not clinical - neurodiversity
          'requiredSignals.minQuestionCount': 12,
          'requiredSignals.anyOf': true,
          'requiredSignals.triggerConditions': [
            { dimension: 'socialComfort', maxScore: 40 },
            { dimension: 'sensoryProcessing', minScore: 55 },
            { dimension: 'routinePreference', minScore: 60 }
          ],
          contextMessage: 'People experience the world in wonderfully diverse ways. These questions explore your unique patterns of thinking and interaction.'
        }
      }
    );
    updatedCount += autismResult.modifiedCount;
    console.log(`✅ Tagged ${autismResult.modifiedCount} autism questions as LOW sensitivity`);

    // ============================================
    // BASELINE QUESTIONS - Indirect Probing
    // ============================================

    // Tag current baseline questions as NONE sensitivity (these are already gentle)
    const baselineResult = await QuestionBank.updateMany(
      {
        'adaptive.isBaseline': true,
        category: 'personality',
        active: true
      },
      {
        $set: {
          sensitivity: 'NONE',
          clinicalDomain: null
        }
      }
    );
    updatedCount += baselineResult.modifiedCount;
    console.log(`✅ Tagged ${baselineResult.modifiedCount} baseline personality questions as NONE sensitivity`);

    // ============================================
    // Summary
    // ============================================

    console.log('\n' + '='.repeat(60));
    console.log(`✅ COMPLETE: Tagged ${updatedCount} questions with sensitivity levels`);
    console.log('='.repeat(60));

    console.log('\nSensitivity Distribution:');
    const counts = await QuestionBank.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$sensitivity', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    counts.forEach(({ _id, count }) => {
      console.log(`  ${(_id || 'NONE').padEnd(15)} ${count} questions`);
    });

    console.log('\nClinical Domain Distribution:');
    const domains = await QuestionBank.aggregate([
      { $match: { active: true, clinicalDomain: { $ne: null } } },
      { $group: { _id: '$clinicalDomain', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    domains.forEach(({ _id, count }) => {
      console.log(`  ${_id.padEnd(20)} ${count} questions`);
    });

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
