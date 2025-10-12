#!/usr/bin/env node

/**
 * Add Diagnostic Weights to Existing Questions
 *
 * Assigns appropriate diagnostic weight values (0-5) to all existing questions
 * based on their category, subcategory, and purpose
 */

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
const logger = require('../utils/logger');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

async function addDiagnosticWeights() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Get all active questions
    const allQuestions = await QuestionBank.find({ active: true });
    logger.info(`Found ${allQuestions.length} active questions to update`);

    let updated = 0;

    for (const question of allQuestions) {
      // Skip if already has diagnostic weight
      if (question.adaptive?.diagnosticWeight && question.adaptive.diagnosticWeight > 0) {
        continue;
      }

      let weight = 1; // Default weight

      // Determine weight based on category and subcategory
      switch (question.category) {
        case 'personality':
          // NEO facets are moderately diagnostic
          if (question.facet) {
            weight = 3;
          } else if (question.adaptive?.isBaseline) {
            weight = 3; // Baseline personality questions
          } else {
            weight = 2;
          }
          break;

        case 'neurodiversity':
          // Neurodiversity questions are highly diagnostic
          if (question.subcategory === 'executive_function') {
            weight = 4;
          } else if (question.subcategory === 'sensory_processing' || question.subcategory === 'sensory_sensitivity') {
            weight = 4;
          } else if (question.subcategory === 'masking') {
            weight = 4;
          } else if (question.subcategory === 'emotional_regulation') {
            weight = 4;
          } else if (question.tags?.includes('adhd')) {
            weight = 4;
          } else if (question.tags?.includes('autism')) {
            weight = 4;
          } else {
            weight = 3;
          }
          break;

        case 'clinical_psychopathology':
          // Clinical questions are very highly diagnostic
          if (question.tags?.includes('phq9') || question.tags?.includes('gad7')) {
            weight = 5; // Validated instruments get highest weight
          } else if (question.tags?.includes('critical') || question.tags?.includes('suicidal_ideation')) {
            weight = 5; // Critical items
          } else if (question.subcategory === 'depression' || question.subcategory === 'gad') {
            weight = 4;
          } else if (question.subcategory?.includes('anxiety') || question.subcategory?.includes('substance')) {
            weight = 4;
          } else {
            weight = 4; // Default for clinical
          }
          break;

        case 'validity_scales':
          // Validity scales have moderate weight (different purpose)
          weight = 2;
          break;

        case 'attachment':
          weight = 3;
          break;

        case 'trauma_screening':
          weight = 4;
          break;

        case 'cognitive_functions':
          weight = 2;
          break;

        case 'enneagram':
          weight = 2;
          break;

        case 'learning_style':
          weight = 2;
          break;

        case 'cognitive':
          weight = 2;
          break;

        default:
          weight = 1;
      }

      // Update the question
      await QuestionBank.updateOne(
        { _id: question._id },
        {
          $set: {
            'adaptive.diagnosticWeight': weight
          }
        }
      );

      updated++;
    }

    logger.info(`Updated ${updated} questions with diagnostic weights`);

    // Summary by category
    console.log('\n✅ DIAGNOSTIC WEIGHTS ASSIGNED\n');
    console.log('═══════════════════════════════════════════════════════════════');

    const categories = await QuestionBank.aggregate([
      { $match: { active: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgWeight: { $avg: '$adaptive.diagnosticWeight' },
          minWeight: { $min: '$adaptive.diagnosticWeight' },
          maxWeight: { $max: '$adaptive.diagnosticWeight' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    categories.forEach(cat => {
      console.log(`${cat._id.padEnd(30)} ${cat.count} questions (weight: ${cat.minWeight}-${cat.maxWeight}, avg: ${cat.avgWeight.toFixed(2)})`);
    });

    console.log('═══════════════════════════════════════════════════════════════\n');

    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    logger.error('Error adding diagnostic weights:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

addDiagnosticWeights();
