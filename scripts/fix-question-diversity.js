#!/usr/bin/env node

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

async function fixQuestionDiversity() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    console.log('=' . repeat(80));
    console.log('FIXING QUESTION DIVERSITY AND TRAIT MAPPINGS');
    console.log('=' . repeat(80));

    // Fix 1: Update communication questions to have correlated traits
    console.log('\n1. UPDATING COMMUNICATION QUESTIONS');
    console.log('-' . repeat(40));

    const commQuestions = await QuestionBank.find({ instrument: 'NEURLYN_COMMUNICATION' });
    console.log(`Found ${commQuestions.length} communication questions`);

    let commUpdated = 0;
    for (const q of commQuestions) {
      // Communication questions should correlate with extraversion and agreeableness
      const updates = {
        'adaptive.correlatedTraits': ['extraversion', 'agreeableness'],
        'adaptive.diagnosticWeight': 3,
        'adaptive.discriminationIndex': 0.65
      };

      // Update adaptive criteria to trigger on extraversion levels
      if (!q.adaptive?.adaptiveCriteria?.triggerTraits) {
        updates['adaptive.adaptiveCriteria.triggerTraits'] = [
          {
            trait: 'extraversion',
            minScore: 20,
            maxScore: 80
          }
        ];
      }

      await QuestionBank.updateOne(
        { _id: q._id },
        { $set: updates }
      );
      commUpdated++;
    }

    console.log(`Updated ${commUpdated} communication questions with correlated traits`);

    // Fix 2: Update processing questions to have correlated traits
    console.log('\n2. UPDATING PROCESSING QUESTIONS');
    console.log('-' . repeat(40));

    const procQuestions = await QuestionBank.find({ instrument: 'NEURLYN_PROCESSING' });
    console.log(`Found ${procQuestions.length} processing questions`);

    let procUpdated = 0;
    for (const q of procQuestions) {
      // Processing questions should correlate with openness and conscientiousness
      const updates = {
        'adaptive.correlatedTraits': ['openness', 'conscientiousness'],
        'adaptive.diagnosticWeight': 3,
        'adaptive.discriminationIndex': 0.7
      };

      // Update adaptive criteria to trigger on openness/conscientiousness levels
      if (!q.adaptive?.adaptiveCriteria?.triggerTraits) {
        updates['adaptive.adaptiveCriteria.triggerTraits'] = [
          {
            trait: 'openness',
            minScore: 30,
            maxScore: 90
          },
          {
            trait: 'conscientiousness',
            minScore: 20,
            maxScore: 80
          }
        ];
      }

      await QuestionBank.updateOne(
        { _id: q._id },
        { $set: updates }
      );
      procUpdated++;
    }

    console.log(`Updated ${procUpdated} processing questions with correlated traits`);

    // Fix 3: Update stress management questions
    console.log('\n3. UPDATING STRESS MANAGEMENT QUESTIONS');
    console.log('-' . repeat(40));

    const stressQuestions = await QuestionBank.find({ instrument: 'NEURLYN_STRESS' });
    console.log(`Found ${stressQuestions.length} stress management questions`);

    let stressUpdated = 0;
    for (const q of stressQuestions) {
      const updates = {
        'adaptive.correlatedTraits': ['neuroticism', 'conscientiousness'],
        'adaptive.diagnosticWeight': 3.5,
        'adaptive.discriminationIndex': 0.75
      };

      if (!q.adaptive?.adaptiveCriteria?.triggerTraits) {
        updates['adaptive.adaptiveCriteria.triggerTraits'] = [
          {
            trait: 'neuroticism',
            minScore: 40,
            maxScore: 100
          }
        ];
      }

      await QuestionBank.updateOne(
        { _id: q._id },
        { $set: updates }
      );
      stressUpdated++;
    }

    console.log(`Updated ${stressUpdated} stress management questions`);

    // Fix 4: Update decision-making questions
    console.log('\n4. UPDATING DECISION-MAKING QUESTIONS');
    console.log('-' . repeat(40));

    const decisionQuestions = await QuestionBank.find({ instrument: 'NEURLYN_DECISION' });
    console.log(`Found ${decisionQuestions.length} decision-making questions`);

    let decisionUpdated = 0;
    for (const q of decisionQuestions) {
      const updates = {
        'adaptive.correlatedTraits': ['conscientiousness', 'neuroticism'],
        'adaptive.diagnosticWeight': 2.5,
        'adaptive.discriminationIndex': 0.6
      };

      await QuestionBank.updateOne(
        { _id: q._id },
        { $set: updates }
      );
      decisionUpdated++;
    }

    console.log(`Updated ${decisionUpdated} decision-making questions`);

    // Fix 5: Boost NEO-PI-R facet questions for better selection
    console.log('\n5. BOOSTING NEO-PI-R FACET QUESTIONS');
    console.log('-' . repeat(40));

    const facetQuestions = await QuestionBank.find({
      instrument: 'NEO-PI-R',
      facet: { $exists: true, $ne: null }
    });
    console.log(`Found ${facetQuestions.length} NEO-PI-R facet questions`);

    let facetUpdated = 0;
    for (const q of facetQuestions) {
      // Increase diagnostic weight for facet questions
      const updates = {
        'adaptive.diagnosticWeight': 4, // Higher weight for facets
        'adaptive.discriminationIndex': 0.75
      };

      // Ensure facet questions have proper trigger traits
      if (!q.adaptive?.adaptiveCriteria?.triggerTraits && q.trait) {
        updates['adaptive.adaptiveCriteria.triggerTraits'] = [
          {
            trait: q.trait,
            minScore: 10, // Wide range to ensure selection
            maxScore: 90
          }
        ];
      }

      await QuestionBank.updateOne(
        { _id: q._id },
        { $set: updates }
      );
      facetUpdated++;
    }

    console.log(`Updated ${facetUpdated} NEO-PI-R facet questions with higher weights`);

    // Fix 6: Add secondary trait to attachment questions
    console.log('\n6. UPDATING ATTACHMENT QUESTIONS');
    console.log('-' . repeat(40));

    const attachQuestions = await QuestionBank.find({ category: 'attachment' });
    console.log(`Found ${attachQuestions.length} attachment questions`);

    let attachUpdated = 0;
    for (const q of attachQuestions) {
      const updates = {
        'adaptive.correlatedTraits': ['agreeableness', 'neuroticism'],
        'adaptive.diagnosticWeight': 3,
        'adaptive.discriminationIndex': 0.7
      };

      await QuestionBank.updateOne(
        { _id: q._id },
        { $set: updates }
      );
      attachUpdated++;
    }

    console.log(`Updated ${attachUpdated} attachment questions`);

    // Summary
    console.log('\n' + '=' . repeat(80));
    console.log('SUMMARY');
    console.log('=' . repeat(80));

    const totalUpdated = commUpdated + procUpdated + stressUpdated +
                        decisionUpdated + facetUpdated + attachUpdated;

    console.log(`\nTotal questions updated: ${totalUpdated}`);
    console.log('  Communication: ' + commUpdated);
    console.log('  Processing: ' + procUpdated);
    console.log('  Stress Management: ' + stressUpdated);
    console.log('  Decision-Making: ' + decisionUpdated);
    console.log('  NEO-PI-R Facets: ' + facetUpdated);
    console.log('  Attachment: ' + attachUpdated);

    // Verification
    console.log('\nVERIFYING UPDATES:');

    const withCorrelated = await QuestionBank.countDocuments({
      'adaptive.correlatedTraits': { $exists: true, $ne: [] }
    });
    console.log(`Questions with correlated traits: ${withCorrelated}`);

    const highWeight = await QuestionBank.countDocuments({
      'adaptive.diagnosticWeight': { $gte: 3 }
    });
    console.log(`Questions with high diagnostic weight (≥3): ${highWeight}`);

    console.log('\n✅ Question diversity fixes applied successfully!');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the fix
if (require.main === module) {
  fixQuestionDiversity();
}

module.exports = fixQuestionDiversity;
