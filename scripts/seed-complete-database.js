#!/usr/bin/env node
/**
 * Comprehensive Database Seeding Script
 *
 * Seeds the complete Neurlyn question bank with all 617 questions
 * including personality, clinical, neurodiversity, and validity scales.
 *
 * Usage: npm run seed:full
 *
 * This script:
 * - Clears existing questions
 * - Imports all 617 validated questions
 * - Verifies data integrity
 * - Reports detailed statistics
 */

require('dotenv').config();
const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

// Load all questions from exported data
const questionsData = require('./data/complete-question-bank.json');

async function clearDatabase() {
  try {
    const deleteResult = await QuestionBank.deleteMany({});
    logger.info(`Cleared ${deleteResult.deletedCount} existing questions`);
    return deleteResult.deletedCount;
  } catch (error) {
    logger.error('Error clearing database:', error);
    throw error;
  }
}

async function seedQuestions() {
  try {
    logger.info(`Seeding ${questionsData.length} questions...`);

    // Insert all questions in bulk
    const result = await QuestionBank.insertMany(questionsData, { ordered: false });
    logger.info(`✓ Successfully inserted ${result.length} questions`);

    return result.length;
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key errors - some questions already exist
      logger.warn('Some questions already existed (duplicate keys)');
      const insertedCount = error.insertedDocs?.length || 0;
      logger.info(`✓ Inserted ${insertedCount} new questions`);
      return insertedCount;
    }
    logger.error('Error seeding questions:', error);
    throw error;
  }
}

async function verifyDatabase() {
  try {
    logger.info('\nVerifying database integrity...');

    // Total count
    const totalCount = await QuestionBank.countDocuments();
    logger.info(`Total questions: ${totalCount}`);

    // By category
    const byCategory = await QuestionBank.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    logger.info('\nQuestions by category:');
    byCategory.forEach(cat => {
      logger.info(`  ${cat._id || 'unknown'}: ${cat.count}`);
    });

    // By tier
    const byTier = await QuestionBank.aggregate([
      { $group: { _id: '$tier', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    logger.info('\nQuestions by tier:');
    byTier.forEach(tier => {
      logger.info(`  ${tier._id || 'unknown'}: ${tier.count}`);
    });

    // Baseline questions
    const baselineCount = await QuestionBank.countDocuments({
      'adaptive.isBaseline': true
    });
    logger.info(`\nBaseline questions: ${baselineCount}`);

    // Clinical instruments
    const clinicalInstruments = await QuestionBank.aggregate([
      {
        $match: {
          category: 'clinical_psychopathology',
          instrument: { $exists: true, $ne: null }
        }
      },
      { $group: { _id: '$instrument', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    logger.info('\nClinical instruments:');
    clinicalInstruments.forEach(inst => {
      logger.info(`  ${inst._id}: ${inst.count}`);
    });

    // Neurodiversity assessments
    const neuroInstruments = await QuestionBank.aggregate([
      {
        $match: {
          category: 'neurodiversity',
          instrument: { $exists: true, $ne: null }
        }
      },
      { $group: { _id: '$instrument', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    logger.info('\nNeurodiversity assessments:');
    neuroInstruments.forEach(inst => {
      logger.info(`  ${inst._id}: ${inst.count}`);
    });

    // Validity checks
    const withoutTrait = await QuestionBank.countDocuments({
      trait: { $exists: false },
      category: 'personality'
    });

    const withoutResponseType = await QuestionBank.countDocuments({
      responseType: { $exists: false }
    });

    logger.info('\nData quality checks:');
    logger.info(`  Personality questions without trait: ${withoutTrait}`);
    logger.info(`  Questions without responseType: ${withoutResponseType}`);

    if (withoutTrait > 0 || withoutResponseType > 0) {
      logger.warn('⚠ Some data quality issues detected');
    } else {
      logger.info('✓ All data quality checks passed');
    }

    return {
      totalCount,
      baselineCount,
      categoryCount: byCategory.length,
      tierCount: byTier.length
    };

  } catch (error) {
    logger.error('Error verifying database:', error);
    throw error;
  }
}

async function main() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn';
    await mongoose.connect(mongoUri);
    logger.info(`Connected to MongoDB: ${mongoUri}`);

    logger.info('\n' + '='.repeat(60));
    logger.info('NEURLYN COMPLETE DATABASE SEEDING');
    logger.info('='.repeat(60));

    // Clear existing data
    logger.info('\n1. Clearing existing questions...');
    const deletedCount = await clearDatabase();

    // Seed questions
    logger.info('\n2. Seeding complete question bank...');
    const insertedCount = await seedQuestions();

    // Verify
    logger.info('\n3. Verifying database...');
    const stats = await verifyDatabase();

    // Summary
    logger.info('\n' + '='.repeat(60));
    logger.info('SEEDING COMPLETE');
    logger.info('='.repeat(60));
    logger.info(`Deleted: ${deletedCount} questions`);
    logger.info(`Inserted: ${insertedCount} questions`);
    logger.info(`Final count: ${stats.totalCount} questions`);
    logger.info(`Categories: ${stats.categoryCount}`);
    logger.info(`Tiers: ${stats.tierCount}`);
    logger.info(`Baseline questions: ${stats.baselineCount}`);
    logger.info('='.repeat(60));

    if (stats.totalCount >= 600) {
      logger.info('\n✅ Database successfully seeded with complete question bank!');
    } else {
      logger.warn('\n⚠️ Warning: Question count lower than expected (expected ~617)');
    }

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    logger.error('Fatal error during seeding:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { seedQuestions, verifyDatabase };
