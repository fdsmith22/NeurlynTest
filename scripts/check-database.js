#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

async function checkDatabase() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test');

  const stats = await QuestionBank.aggregate([
    {
      $group: {
        _id: { category: '$category', subcategory: '$subcategory' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.category': 1, '_id.subcategory': 1 } }
  ]);

  // console.log('\n📊 Complete Question Bank Analysis:');
  // console.log('====================================');

  let categoryTotals = {};
  stats.forEach(item => {
    const cat = item._id.category;
    const subcat = item._id.subcategory || 'general';
    if (!categoryTotals[cat]) categoryTotals[cat] = 0;
    categoryTotals[cat] += item.count;
    // console.log(`  ${cat}/${subcat}: ${item.count}`);
  });

  // console.log('\n📈 Category Totals:');
  // console.log('-------------------');
  Object.entries(categoryTotals).forEach(([cat, count]) => {
    // console.log(`  ${cat}: ${count}`);
  });

  const total = await QuestionBank.countDocuments();
  // console.log(`\n🎯 Total Questions: ${total}`);

  // Check specific subcategories
  // console.log('\n🔍 Detailed Breakdown:');
  // console.log('---------------------');

  const neurodiversityBreakdown = await QuestionBank.aggregate([
    { $match: { category: 'neurodiversity' } },
    { $group: { _id: '$subcategory', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // console.log('Neurodiversity:');
  neurodiversityBreakdown.forEach(item => {
    // console.log(`  - ${item._id || 'general'}: ${item.count}`);
  });

  await mongoose.disconnect();
}

checkDatabase().catch(console.error);
