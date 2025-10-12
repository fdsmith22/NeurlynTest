#!/usr/bin/env node

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

const MONGODB_URI = 'mongodb://localhost:27017/neurlyn-test';

async function analyzeFacetDistribution() {
  try {
    await mongoose.connect(MONGODB_URI);

    const facetQuestions = await QuestionBank.find({
      facet: { $exists: true, $ne: null }
    }, {
      questionId: 1,
      trait: 1,
      facet: 1
    });

    const distribution = {};
    facetQuestions.forEach(q => {
      if (!distribution[q.trait]) distribution[q.trait] = {};
      if (!distribution[q.trait][q.facet]) distribution[q.trait][q.facet] = 0;
      distribution[q.trait][q.facet]++;
    });

    console.log('FACET QUESTION DISTRIBUTION\n');
    Object.entries(distribution).sort().forEach(([trait, facets]) => {
      const total = Object.values(facets).reduce((a, b) => a + b, 0);
      console.log(`${trait.toUpperCase()} (${total} questions):`);
      Object.entries(facets).sort().forEach(([facet, count]) => {
        console.log(`  ${facet.padEnd(25)} ${count} questions`);
      });
      console.log();
    });

    console.log(`\nTotal facet questions: ${facetQuestions.length}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

analyzeFacetDistribution();
