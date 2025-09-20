#!/usr/bin/env node

/**
 * MongoDB Index Optimization for Efficient Question Selection
 * Creates compound indexes optimized for adaptive assessment queries
 */

require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function optimizeMongoDBIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn');
    logger.info('Connected to MongoDB for index optimization');

    const db = mongoose.connection.db;
    const collection = db.collection('questionbanks');

    // Drop existing indexes (except _id)
    logger.info('Dropping existing indexes...');
    try {
      await collection.dropIndexes();
    } catch (e) {
      logger.warn('Some indexes could not be dropped:', e.message);
    }

    // Create optimized compound indexes for adaptive assessment queries

    // 1. Primary adaptive selection index: trait + tier + active
    logger.info('Creating trait-tier-active index...');
    await collection.createIndex(
      { trait: 1, tier: 1, active: 1 },
      {
        name: 'trait_tier_active_idx',
        background: true,
        partialFilterExpression: { active: true }
      }
    );

    // 2. Category-based selection: category + tier + active
    logger.info('Creating category-tier-active index...');
    await collection.createIndex(
      { category: 1, tier: 1, active: 1 },
      {
        name: 'category_tier_active_idx',
        background: true,
        partialFilterExpression: { active: true }
      }
    );

    // 3. Subcategory refinement: trait + subcategory + tier
    logger.info('Creating trait-subcategory-tier index...');
    await collection.createIndex(
      { trait: 1, subcategory: 1, tier: 1 },
      {
        name: 'trait_subcategory_tier_idx',
        background: true,
        sparse: true
      }
    );

    // 4. Question ID lookup (for avoiding duplicates)
    logger.info('Creating questionId index...');
    await collection.createIndex(
      { questionId: 1 },
      {
        name: 'questionId_idx',
        unique: true,
        background: true
      }
    );

    // 5. Instrument-based queries
    logger.info('Creating instrument-tier index...');
    await collection.createIndex(
      { instrument: 1, tier: 1, active: 1 },
      {
        name: 'instrument_tier_active_idx',
        background: true,
        partialFilterExpression: { active: true }
      }
    );

    // 6. Weight-based optimization for scoring
    logger.info('Creating weight-trait index...');
    await collection.createIndex(
      { weight: -1, trait: 1, active: 1 },
      {
        name: 'weight_trait_active_idx',
        background: true,
        partialFilterExpression: { active: true }
      }
    );

    // 7. Specialized neurodiversity queries
    logger.info('Creating category-subcategory index...');
    await collection.createIndex(
      { category: 1, subcategory: 1, tier: 1 },
      {
        name: 'category_subcategory_tier_idx',
        background: true,
        sparse: true
      }
    );

    // Verify indexes were created
    logger.info('Verifying created indexes...');
    const indexes = await collection.listIndexes().toArray();
    logger.info('Current indexes:');
    indexes.forEach(index => {
      logger.info(`  ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Test query performance
    logger.info('Testing query performance...');

    const testQueries = [
      {
        name: 'Big 5 trait selection',
        query: { trait: 'openness', tier: { $in: ['free', 'core'] }, active: true }
      },
      {
        name: 'Category-based selection',
        query: { category: 'personality', tier: 'free', active: true }
      },
      {
        name: 'Neurodiversity questions',
        query: { category: 'neurodiversity', tier: { $in: ['free', 'core'] }, active: true }
      },
      {
        name: 'High-weight questions',
        query: {
          weight: { $gte: 1 },
          trait: { $in: ['openness', 'conscientiousness'] },
          active: true
        }
      }
    ];

    for (const test of testQueries) {
      const start = Date.now();
      const results = await collection.find(test.query).limit(10).toArray();
      const duration = Date.now() - start;
      logger.info(`${test.name}: ${results.length} results in ${duration}ms`);
    }

    // Generate query optimization report
    await generateOptimizationReport(collection);

    logger.info('✅ MongoDB index optimization completed successfully');
  } catch (error) {
    logger.error('❌ Index optimization failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

async function generateOptimizationReport(collection) {
  logger.info('\n=== OPTIMIZATION REPORT ===');

  // Total questions count
  const totalQuestions = await collection.countDocuments({ active: true });
  logger.info(`Total active questions: ${totalQuestions}`);

  // Big 5 distribution
  const big5Counts = await collection
    .aggregate([
      {
        $match: {
          trait: {
            $in: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
          },
          active: true
        }
      },
      { $group: { _id: '$trait', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
    .toArray();

  logger.info('Big 5 trait distribution:');
  big5Counts.forEach(trait => {
    logger.info(`  ${trait._id}: ${trait.count} questions`);
  });

  // Tier distribution
  const tierCounts = await collection
    .aggregate([
      { $match: { active: true } },
      { $group: { _id: '$tier', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
    .toArray();

  logger.info('Tier distribution:');
  tierCounts.forEach(tier => {
    logger.info(`  ${tier._id}: ${tier.count} questions`);
  });

  // Category distribution
  const categoryCounts = await collection
    .aggregate([
      { $match: { active: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
    .toArray();

  logger.info('Category distribution:');
  categoryCounts.forEach(cat => {
    logger.info(`  ${cat._id}: ${cat.count} questions`);
  });

  // Quality metrics
  const scientificSourceCount = await collection.countDocuments({
    'metadata.scientificSource': { $exists: true, $ne: null },
    active: true
  });
  const validationStudyCount = await collection.countDocuments({
    'metadata.validationStudy': { $exists: true, $ne: null },
    active: true
  });

  logger.info(
    `Questions with scientific source: ${scientificSourceCount}/${totalQuestions} (${Math.round((scientificSourceCount / totalQuestions) * 100)}%)`
  );
  logger.info(
    `Questions with validation studies: ${validationStudyCount}/${totalQuestions} (${Math.round((validationStudyCount / totalQuestions) * 100)}%)`
  );

  logger.info('=== END REPORT ===\n');
}

// Run optimization if called directly
if (require.main === module) {
  optimizeMongoDBIndexes()
    .then(() => {
      logger.info('Index optimization completed');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Index optimization failed:', error);
      process.exit(1);
    });
}

module.exports = optimizeMongoDBIndexes;
