#!/usr/bin/env node

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
const logger = require('../utils/logger');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn';

async function analyzeQuestions() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to database\n');

    // Total count
    const totalCount = await QuestionBank.countDocuments();
    console.log('='.repeat(60));
    console.log(`TOTAL QUESTIONS IN DATABASE: ${totalCount}`);
    console.log('='.repeat(60));

    // Count by category
    const categories = await QuestionBank.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          subcategories: { $addToSet: '$subcategory' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 QUESTIONS BY CATEGORY:');
    console.log('-'.repeat(40));

    categories.forEach(cat => {
      console.log(`\n${cat._id || 'uncategorized'}: ${cat.count} questions`);

      // Show subcategories if they exist
      const subs = cat.subcategories.filter(s => s);
      if (subs.length > 0) {
        console.log('  Subcategories:');
        subs.forEach(sub => {
          console.log(`    - ${sub}`);
        });
      }
    });

    // Count by tier
    const tiers = await QuestionBank.aggregate([
      { $group: { _id: '$tier', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n🎯 QUESTIONS BY TIER:');
    console.log('-'.repeat(40));
    tiers.forEach(tier => {
      console.log(`${tier._id || 'unspecified'}: ${tier.count} questions`);
    });

    // Count baseline questions
    const baselineCount = await QuestionBank.countDocuments({ isBaseline: true });
    console.log(`\n📍 Baseline questions: ${baselineCount}`);

    // Analyze neurodiversity coverage
    console.log('\n🧠 NEURODIVERSITY ANALYSIS:');
    console.log('-'.repeat(40));

    // Direct neurodiversity category
    const ndCategoryCount = await QuestionBank.countDocuments({
      category: 'neurodiversity'
    });
    console.log(`Direct neurodiversity category: ${ndCategoryCount}`);

    // By subcategory
    const ndSubcategories = await QuestionBank.aggregate([
      {
        $match: {
          category: 'neurodiversity'
        }
      },
      {
        $group: {
          _id: '$subcategory',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    if (ndSubcategories.length > 0) {
      console.log('\nNeurodiversity subcategories:');
      ndSubcategories.forEach(sub => {
        console.log(`  ${sub._id || 'general'}: ${sub.count}`);
      });
    }

    // By instrument
    const instruments = await QuestionBank.aggregate([
      {
        $match: {
          category: 'neurodiversity'
        }
      },
      {
        $group: {
          _id: '$instrument',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    if (instruments.length > 0) {
      console.log('\nNeurodiversity instruments used:');
      instruments.forEach(inst => {
        console.log(`  ${inst._id}: ${inst.count}`);
      });
    }

    // Personality questions breakdown
    const personalityBreakdown = await QuestionBank.aggregate([
      {
        $match: {
          category: 'personality'
        }
      },
      {
        $group: {
          _id: '$trait',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\n🎭 PERSONALITY QUESTIONS BREAKDOWN:');
    console.log('-'.repeat(40));

    personalityBreakdown.forEach(trait => {
      console.log(`${trait._id || 'unspecified'}: ${trait.count} questions`);
    });

    // Weight distribution
    const weightStats = await QuestionBank.aggregate([
      {
        $group: {
          _id: null,
          avgWeight: { $avg: '$weight' },
          minWeight: { $min: '$weight' },
          maxWeight: { $max: '$weight' }
        }
      }
    ]);

    if (weightStats.length > 0) {
      const stats = weightStats[0];
      console.log('\n⚖️ WEIGHT STATISTICS:');
      console.log('-'.repeat(40));
      console.log(`Average weight: ${stats.avgWeight?.toFixed(2) || 'N/A'}`);
      console.log(`Min weight: ${stats.minWeight || 'N/A'}`);
      console.log(`Max weight: ${stats.maxWeight || 'N/A'}`);
    }

    // Questions with tags
    const taggedQuestions = await QuestionBank.find({
      tags: { $exists: true, $ne: [] }
    }).select('tags');

    const tagCounts = {};
    taggedQuestions.forEach(q => {
      if (q.tags && Array.isArray(q.tags)) {
        q.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    if (Object.keys(tagCounts).length > 0) {
      console.log('\n🏷️ QUESTION TAGS:');
      console.log('-'.repeat(40));
      Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([tag, count]) => {
          console.log(`${tag}: ${count} questions`);
        });
    }

    // Sample questions from each category
    console.log('\n📝 SAMPLE QUESTIONS:');
    console.log('='.repeat(60));

    for (const cat of categories.slice(0, 3)) {
      console.log(`\n${cat._id}:`);
      const samples = await QuestionBank.find({ category: cat._id }).limit(2).select('text');

      samples.forEach((q, i) => {
        console.log(`  ${i + 1}. ${q.text.substring(0, 80)}${q.text.length > 80 ? '...' : ''}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Analysis complete!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('Error analyzing questions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from database');
  }
}

// Run the analysis
analyzeQuestions();
