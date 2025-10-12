#!/usr/bin/env node

/**
 * Analyze how responses are mapped to traits in report generation
 */

const mongoose = require('mongoose');
const AssessmentSession = require('../models/AssessmentSession');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

async function analyzeTraitMapping() {
  try {
    await mongoose.connect(MONGODB_URI);

    const session = await AssessmentSession.findOne({
      sessionId: 'ADAPTIVE_1759950799594_to5uj5v30'
    });

    if (!session) {
      console.log('Session not found');
      await mongoose.disconnect();
      return;
    }

    console.log('\n=== TRAIT MAPPING ANALYSIS ===\n');
    console.log(`Session: ${session.sessionId}`);
    console.log(`Total responses: ${session.responses.length}\n`);

    // Simulate report generator logic
    const traits = {
      openness: [],
      conscientiousness: [],
      extraversion: [],
      agreeableness: [],
      neuroticism: []
    };

    const traitList = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];

    session.responses.forEach((response, index) => {
      // Use trait from response object if available
      let trait = response.trait ? response.trait.toLowerCase() : null;

      // If no trait in response, try to get from category
      if (!trait && response.category) {
        const category = response.category.toLowerCase();
        if (traits[category]) {
          trait = category;
        }
      }

      // Fall back to index-based mapping if still no trait
      if (!trait) {
        trait = traitList[index % traitList.length];
      }

      // Get the score
      let score = response.score !== undefined ? response.score : response.value;
      if (score === undefined) score = 3; // default

      // Normalize score (1-5 scale to 0-100)
      const normalized = ((score - 1) / 4) * 100;

      if (traits[trait]) {
        traits[trait].push({
          questionId: response.questionId,
          rawScore: score,
          normalized: normalized,
          method: response.trait ? 'trait' : (response.category ? 'category' : 'index-fallback')
        });
      }
    });

    // Calculate averages
    console.log('=== TRAIT SCORES (with all mapping methods) ===\n');

    Object.entries(traits).forEach(([trait, scores]) => {
      if (scores.length === 0) return;

      const avg = scores.reduce((sum, s) => sum + s.normalized, 0) / scores.length;
      const traitMethod = scores.filter(s => s.method === 'trait').length;
      const categoryMethod = scores.filter(s => s.method === 'category').length;
      const fallbackMethod = scores.filter(s => s.method === 'index-fallback').length;

      console.log(`${trait.toUpperCase()}:`);
      console.log(`  Total responses: ${scores.length}`);
      console.log(`    - from trait tag: ${traitMethod}`);
      console.log(`    - from category: ${categoryMethod}`);
      console.log(`    - from index fallback: ${fallbackMethod}`);
      console.log(`  Average normalized score: ${avg.toFixed(1)} → ${Math.round(avg)}`);

      if (scores.length <= 10) {
        console.log('  Individual scores:');
        scores.forEach((s, i) => {
          console.log(`    ${i+1}. ${s.questionId} = ${s.rawScore} → ${s.normalized.toFixed(1)} (${s.method})`);
        });
      }
      console.log('');
    });

    await mongoose.disconnect();
    console.log('✓ Analysis complete\n');

  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

analyzeTraitMapping();
