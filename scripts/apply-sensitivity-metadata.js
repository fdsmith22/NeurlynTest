/**
 * Apply Sensitivity Metadata to All Questions
 * Implements tactful assessment system with graduated question escalation
 *
 * Run: node scripts/apply-sensitivity-metadata.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

async function applySensitivityMetadata() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test');
    console.log('✅ Connected to MongoDB\n');

    console.log('='.repeat(70));
    console.log('  APPLYING SENSITIVITY METADATA TO ALL QUESTIONS');
    console.log('='.repeat(70));
    console.log('\nStrategy: Tactful 3-Tier System');
    console.log('  - LOW: Asked early (Q1-19), builds rapport');
    console.log('  - MODERATE: Asked mid-assessment (Q20-29), requires some indicators');
    console.log('  - HIGH: Asked late (Q30-39), requires strong indicators');
    console.log('  - EXTREME: Asked very late (Q40+), requires multiple red flags\n');

    let totalUpdated = 0;

    // =================================================================
    // TIER 1: LOW SENSITIVITY - Safe for Early Assessment (Q1-19)
    // =================================================================
    console.log('\n📘 TIER 1: LOW SENSITIVITY (Safe for Q1-19)');
    console.log('-'.repeat(70));

    // Personality/Trait questions - always safe
    const personalityResult = await QuestionBank.updateMany(
      {
        active: true,
        category: { $in: ['personality', 'cognitive_functions', 'learning_style'] }
      },
      {
        $set: {
          sensitivity: 'NONE',
          'requiredSignals.minQuestionCount': 0
        }
      }
    );
    totalUpdated += personalityResult.modifiedCount;
    console.log(`✅ ${personalityResult.modifiedCount} personality/cognitive questions → NONE sensitivity`);

    // Baseline questions - designed for early assessment
    const baselineResult = await QuestionBank.updateMany(
      {
        active: true,
        tags: { $in: ['baseline', 'gateway'] }
      },
      {
        $set: {
          sensitivity: 'NONE',
          'requiredSignals.minQuestionCount': 0
        }
      }
    );
    totalUpdated += baselineResult.modifiedCount;
    console.log(`✅ ${baselineResult.modifiedCount} baseline/gateway questions → NONE sensitivity`);

    // Attachment questions - developmental, not clinical
    const attachmentResult = await QuestionBank.updateMany(
      {
        active: true,
        $or: [
          { category: 'attachment' },
          { instrument: { $regex: /ATTACHMENT|IIP/i } }
        ]
      },
      {
        $set: {
          sensitivity: 'LOW',
          'requiredSignals.minQuestionCount': 15,
          'requiredSignals.anyOf': true,
          'requiredSignals.triggerConditions': [
            { dimension: 'agreeableness', maxScore: 40 }, // Low agreeableness
            { dimension: 'neuroticism', minScore: 60 }     // High neuroticism
          ],
          contextMessage: 'Everyone forms relationships in unique ways. These questions explore your relationship patterns.'
        }
      }
    );
    totalUpdated += attachmentResult.modifiedCount;
    console.log(`✅ ${attachmentResult.modifiedCount} attachment questions → LOW sensitivity (Q15+)`);

    // =================================================================
    // TIER 2: MODERATE SENSITIVITY - Mid-Assessment (Q20-29)
    // =================================================================
    console.log('\n📙 TIER 2: MODERATE SENSITIVITY (Q20-29, with indicators)');
    console.log('-'.repeat(70));

    // Depression screening (PHQ-9) - common, but needs soft probing first
    const depressionResult = await QuestionBank.updateMany(
      {
        active: true,
        $or: [
          { instrument: 'PHQ-9' },
          { questionId: { $regex: /DEPRESSION_PHQ9/i } },
          { subcategory: 'depression' }
        ]
      },
      {
        $set: {
          sensitivity: 'MODERATE',
          'requiredSignals.minQuestionCount': 20,
          'requiredSignals.anyOf': true, // Any ONE of these triggers PHQ-9
          'requiredSignals.triggerConditions': [
            { dimension: 'neuroticism', minScore: 60 },
            { dimension: 'energyLevel', maxScore: 40 },
            { dimension: 'moodSatisfaction', maxScore: 40 },
            { dimension: 'anhedonia', minScore: 55 }
          ],
          contextMessage: 'Everyone experiences emotional ups and downs. These questions explore mood patterns over the past couple weeks.'
        }
      }
    );
    totalUpdated += depressionResult.modifiedCount;
    console.log(`✅ ${depressionResult.modifiedCount} depression questions → MODERATE sensitivity (Q20+, with mood indicators)`);

    // Anxiety screening (GAD-7) - common, needs soft probing
    const anxietyResult = await QuestionBank.updateMany(
      {
        active: true,
        $or: [
          { instrument: 'GAD-7' },
          { questionId: { $regex: /ANXIETY_GAD7/i } },
          { subcategory: 'gad' }
        ]
      },
      {
        $set: {
          sensitivity: 'MODERATE',
          'requiredSignals.minQuestionCount': 20,
          'requiredSignals.anyOf': true,
          'requiredSignals.triggerConditions': [
            { dimension: 'neuroticism', minScore: 60 },
            { dimension: 'worry', minScore: 55 },
            { dimension: 'stressResponse', maxScore: 40 },
            { dimension: 'sleepQuality', maxScore: 40 }
          ],
          contextMessage: 'Many people experience worry or tension at times. These questions help us understand your stress responses.'
        }
      }
    );
    totalUpdated += anxietyResult.modifiedCount;
    console.log(`✅ ${anxietyResult.modifiedCount} anxiety questions → MODERATE sensitivity (Q20+, with anxiety indicators)`);

    // ADHD screening - neurodevelopmental, less stigmatized
    const adhdResult = await QuestionBank.updateMany(
      {
        active: true,
        $or: [
          { instrument: { $regex: /ASRS|ADHD/i } },
          { subcategory: 'adhd' },
          { tags: 'adhd' }
        ]
      },
      {
        $set: {
          sensitivity: 'LOW',
          'requiredSignals.minQuestionCount': 15,
          'requiredSignals.anyOf': true,
          'requiredSignals.triggerConditions': [
            { dimension: 'conscientiousness', maxScore: 40 },
            { dimension: 'organization', maxScore: 40 },
            { dimension: 'taskInitiation', maxScore: 45 },
            { dimension: 'attention', maxScore: 45 }
          ],
          contextMessage: 'Everyone has different ways of staying organized and focused. These questions explore your natural attention style.'
        }
      }
    );
    totalUpdated += adhdResult.modifiedCount;
    console.log(`✅ ${adhdResult.modifiedCount} ADHD questions → LOW sensitivity (Q15+, with executive function indicators)`);

    // Autism screening - neurodevelopmental, less stigmatized
    const autismResult = await QuestionBank.updateMany(
      {
        active: true,
        $or: [
          { instrument: { $regex: /AQ|AUTISM/i } },
          { subcategory: { $in: ['autism', 'sensory_processing', 'social_cognition'] } },
          { tags: 'autism' }
        ]
      },
      {
        $set: {
          sensitivity: 'LOW',
          'requiredSignals.minQuestionCount': 12,
          'requiredSignals.anyOf': true,
          'requiredSignals.triggerConditions': [
            { dimension: 'socialComfort', maxScore: 45 },
            { dimension: 'sensoryOverload', minScore: 55 },
            { dimension: 'communication', maxScore: 45 }
          ],
          contextMessage: 'People experience and process social information in many different ways. These questions explore your natural social style.'
        }
      }
    );
    totalUpdated += autismResult.modifiedCount;
    console.log(`✅ ${autismResult.modifiedCount} autism questions → LOW sensitivity (Q12+, with social/sensory indicators)`);

    // Somatic symptoms (PHQ-15)
    const somaticResult = await QuestionBank.updateMany(
      {
        active: true,
        $or: [
          { instrument: 'PHQ-15' },
          { questionId: { $regex: /SOMATIC_PHQ15/i } },
          { subcategory: 'somatic' }
        ]
      },
      {
        $set: {
          sensitivity: 'MODERATE',
          'requiredSignals.minQuestionCount': 25,
          'requiredSignals.anyOf': true,
          'requiredSignals.triggerConditions': [
            { dimension: 'neuroticism', minScore: 60 },
            { dimension: 'healthAnxiety', minScore: 55 },
            { dimension: 'physicalSymptoms', minScore: 50 }
          ],
          contextMessage: 'Physical health and emotional wellbeing are connected. These questions explore common physical experiences.'
        }
      }
    );
    totalUpdated += somaticResult.modifiedCount;
    console.log(`✅ ${somaticResult.modifiedCount} somatic questions → MODERATE sensitivity (Q25+, with health anxiety indicators)`);

    // =================================================================
    // TIER 3: HIGH SENSITIVITY - Late Assessment (Q30-39)
    // =================================================================
    console.log('\n📕 TIER 3: HIGH SENSITIVITY (Q30-39, strong indicators required)');
    console.log('-'.repeat(70));

    // Mania screening (MDQ) - less common, more stigmatized
    const maniaResult = await QuestionBank.updateMany(
      {
        active: true,
        $or: [
          { instrument: 'MDQ' },
          { questionId: { $regex: /MANIA_MDQ/i } },
          { subcategory: 'mania' }
        ]
      },
      {
        $set: {
          sensitivity: 'HIGH',
          'requiredSignals.minQuestionCount': 30,
          'requiredSignals.anyOf': true,
          'requiredSignals.triggerConditions': [
            { dimension: 'extraversion', minScore: 75 },      // Very high extraversion
            { dimension: 'impulsivity', minScore: 70 },       // High impulsivity
            { dimension: 'conscientiousness', maxScore: 30 }, // Very low conscientiousness
            { dimension: 'sleepProblems', minScore: 60 }      // Significant sleep issues
          ],
          contextMessage: 'Energy levels and mood vary naturally. These questions explore patterns in your energy and activity levels.'
        }
      }
    );
    totalUpdated += maniaResult.modifiedCount;
    console.log(`✅ ${maniaResult.modifiedCount} mania questions → HIGH sensitivity (Q30+, with energy/impulsivity indicators)`);

    // Psychosis screening (PQ-B) - rare, highly stigmatized
    const psychosisResult = await QuestionBank.updateMany(
      {
        active: true,
        $or: [
          { instrument: 'PQ-B' },
          { questionId: { $regex: /PSYCHOSIS_PQB/i } },
          { subcategory: 'psychosis' }
        ]
      },
      {
        $set: {
          sensitivity: 'EXTREME',
          'requiredSignals.minQuestionCount': 40,
          'requiredSignals.anyOf': true,
          'requiredSignals.triggerConditions': [
            { dimension: 'openness', minScore: 80 },          // Very high openness (fantasy-prone)
            { dimension: 'perceptualAnomalies', minScore: 65 },
            { dimension: 'dissociation', minScore: 65 },
            { dimension: 'paranoia', minScore: 60 }
          ],
          contextMessage: 'People experience thoughts and perceptions in diverse ways. These questions explore unusual experiences that some people have.'
        }
      }
    );
    totalUpdated += psychosisResult.modifiedCount;
    console.log(`✅ ${psychosisResult.modifiedCount} psychosis questions → EXTREME sensitivity (Q40+, with perceptual anomaly indicators)`);

    // Borderline traits (MSI-BPD)
    const borderlineResult = await QuestionBank.updateMany(
      {
        active: true,
        $or: [
          { instrument: { $regex: /BPD|MSI-BPD/i } },
          { questionId: { $regex: /BORDERLINE/i } },
          { subcategory: 'borderline' }
        ]
      },
      {
        $set: {
          sensitivity: 'HIGH',
          'requiredSignals.minQuestionCount': 35,
          'requiredSignals.anyOf': true,
          'requiredSignals.triggerConditions': [
            { dimension: 'neuroticism', minScore: 70 },
            { dimension: 'emotionalDysregulation', minScore: 65 },
            { dimension: 'impulsivity', minScore: 65 },
            { dimension: 'relationshipInstability', minScore: 60 }
          ],
          contextMessage: 'Emotional experiences vary widely. These questions explore patterns in emotional intensity and relationships.'
        }
      }
    );
    totalUpdated += borderlineResult.modifiedCount;
    console.log(`✅ ${borderlineResult.modifiedCount} borderline questions → HIGH sensitivity (Q35+, with emotional dysregulation indicators)`);

    // Trauma screening (PTSD, dissociation)
    const traumaResult = await QuestionBank.updateMany(
      {
        active: true,
        $or: [
          { instrument: { $regex: /PTSD|TRAUMA/i } },
          { category: 'trauma_screening' },
          { subcategory: { $in: ['trauma', 'ptsd', 'dissociation'] } }
        ]
      },
      {
        $set: {
          sensitivity: 'HIGH',
          'requiredSignals.minQuestionCount': 30,
          'requiredSignals.anyOf': true,
          'requiredSignals.triggerConditions': [
            { dimension: 'neuroticism', minScore: 65 },
            { dimension: 'anxietySymptoms', minScore: 60 },
            { dimension: 'emotionalDysregulation', minScore: 60 },
            { dimension: 'dissociation', minScore: 55 }
          ],
          contextMessage: 'Everyone responds to stress differently. These questions explore how you experience and process stressful situations.'
        }
      }
    );
    totalUpdated += traumaResult.modifiedCount;
    console.log(`✅ ${traumaResult.modifiedCount} trauma questions → HIGH sensitivity (Q30+, with stress/anxiety indicators)`);

    // ACEs (Adverse Childhood Experiences) - most sensitive
    const acesResult = await QuestionBank.updateMany(
      {
        active: true,
        $or: [
          { instrument: { $regex: /ACES|ACE/i } },
          { questionId: { $regex: /ACES_/i } },
          { tags: 'aces' }
        ]
      },
      {
        $set: {
          sensitivity: 'EXTREME',
          'requiredSignals.minQuestionCount': 45,
          'requiredSignals.anyOf': true,
          'requiredSignals.triggerConditions': [
            { dimension: 'traumaSymptoms', minScore: 60 },
            { dimension: 'attachmentIssues', minScore: 60 },
            { dimension: 'emotionalDysregulation', minScore: 65 },
            { dimension: 'dissociation', minScore: 60 }
          ],
          contextMessage: 'Childhood experiences shape who we become. These questions explore early life experiences. You can skip any question that feels uncomfortable.'
        }
      }
    );
    totalUpdated += acesResult.modifiedCount;
    console.log(`✅ ${acesResult.modifiedCount} ACEs questions → EXTREME sensitivity (Q45+, with trauma indicators)`);

    // Substance use questions
    const substanceResult = await QuestionBank.updateMany(
      {
        active: true,
        $or: [
          { instrument: { $in: ['AUDIT', 'DAST'] } },
          { category: { $regex: /substance/i } }
        ]
      },
      {
        $set: {
          sensitivity: 'MODERATE',
          'requiredSignals.minQuestionCount': 25,
          contextMessage: 'These questions explore lifestyle patterns. Please answer honestly - your responses are confidential.'
        }
      }
    );
    totalUpdated += substanceResult.modifiedCount;
    console.log(`✅ ${substanceResult.modifiedCount} substance use questions → MODERATE sensitivity (Q25+)`);

    // Validity scales - always safe
    const validityResult = await QuestionBank.updateMany(
      {
        active: true,
        category: 'validity_scales'
      },
      {
        $set: {
          sensitivity: 'NONE',
          'requiredSignals.minQuestionCount': 0
        }
      }
    );
    totalUpdated += validityResult.modifiedCount;
    console.log(`✅ ${validityResult.modifiedCount} validity questions → NONE sensitivity`);

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('  SENSITIVITY METADATA APPLICATION COMPLETE');
    console.log('='.repeat(70));
    console.log(`\n✅ Total questions updated: ${totalUpdated}/607`);

    // Verify distribution
    console.log('\n📊 Sensitivity Distribution:');
    const distribution = await QuestionBank.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$sensitivity', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    distribution.forEach(({ _id, count }) => {
      const pct = ((count / 607) * 100).toFixed(1);
      console.log(`   ${(_id || 'NONE').padEnd(10)} ${count.toString().padStart(3)} questions (${pct}%)`);
    });

    console.log('\n✅ Sensitivity metadata successfully applied to all questions!');
    console.log('   Now the intelligent selector will use graduated escalation.\n');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  applySensitivityMetadata();
}

module.exports = applySensitivityMetadata;
