#!/usr/bin/env node
/**
 * Test Adaptive Selection with Varied Baseline Responses
 * Verifies that different baseline patterns create different adaptive question allocations
 */

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
const ComprehensiveAdaptiveSelector = require('../services/comprehensive-adaptive-selector');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

// Test scenarios with different baseline patterns
const testScenarios = [
  {
    name: 'High ADHD Indicators',
    description: 'High executive dysfunction + attention issues',
    baselineResponses: [
      // Personality responses (moderate)
      { questionId: 'P1', category: 'personality', trait: 'openness', score: 3 },
      { questionId: 'P2', category: 'personality', trait: 'conscientiousness', score: 2.5 },
      { questionId: 'P3', category: 'personality', trait: 'extraversion', score: 3.5 },
      { questionId: 'P4', category: 'personality', trait: 'agreeableness', score: 3 },
      { questionId: 'P5', category: 'personality', trait: 'neuroticism', score: 3.5 },
      // Neurodiversity responses (HIGH executive dysfunction)
      { questionId: 'N1', category: 'neurodiversity', subcategory: 'executive_function', score: 4.5 },
      { questionId: 'N2', category: 'neurodiversity', subcategory: 'executive_function', score: 4.2 },
      { questionId: 'N3', category: 'neurodiversity', subcategory: 'attention', score: 4.3 },
      { questionId: 'N4', category: 'neurodiversity', subcategory: 'attention', score: 4.0 },
      { questionId: 'N5', category: 'neurodiversity', subcategory: 'sensory', score: 2.5 },
      // More balanced responses
      ...Array(10).fill(null).map((_, i) => ({
        questionId: `FILL_${i}`,
        category: 'personality',
        trait: ['openness', 'conscientiousness', 'extraversion'][i % 3],
        score: 3
      }))
    ],
    expectedTriggers: ['executive_dysfunction', 'adhd_pathway'],
    expectedHighPriority: ['executive_function', 'adhd_deep']
  },
  {
    name: 'High Autism Indicators',
    description: 'High sensory sensitivity + social difficulties',
    baselineResponses: [
      // Personality responses (moderate)
      { questionId: 'P1', category: 'personality', trait: 'openness', score: 4 },
      { questionId: 'P2', category: 'personality', trait: 'conscientiousness', score: 4.5 },
      { questionId: 'P3', category: 'personality', trait: 'extraversion', score: 2 },
      { questionId: 'P4', category: 'personality', trait: 'agreeableness', score: 3 },
      { questionId: 'P5', category: 'personality', trait: 'neuroticism', score: 3 },
      // Neurodiversity responses (HIGH sensory + social)
      { questionId: 'N1', category: 'neurodiversity', subcategory: 'sensory_processing', score: 4.5 },
      { questionId: 'N2', category: 'neurodiversity', subcategory: 'sensory_sensitivity', score: 4.2 },
      { questionId: 'N3', category: 'neurodiversity', subcategory: 'sensory', score: 4.0 },
      { questionId: 'N4', category: 'neurodiversity', subcategory: 'social', score: 4.3 },
      { questionId: 'N5', category: 'neurodiversity', subcategory: 'executive_function', score: 2.5 },
      // More balanced responses
      ...Array(10).fill(null).map((_, i) => ({
        questionId: `FILL_${i}`,
        category: 'personality',
        trait: ['openness', 'conscientiousness', 'extraversion'][i % 3],
        score: 3
      }))
    ],
    expectedTriggers: ['sensory_sensitivity', 'autism_pathway', 'social_difficulty', 'masking_indicators'],
    expectedHighPriority: ['sensory_processing', 'autism_deep', 'masking']
  },
  {
    name: 'Balanced Neurotypical Profile',
    description: 'No strong neurodiversity indicators',
    baselineResponses: [
      // Personality responses (balanced)
      { questionId: 'P1', category: 'personality', trait: 'openness', score: 3.5 },
      { questionId: 'P2', category: 'personality', trait: 'conscientiousness', score: 3.2 },
      { questionId: 'P3', category: 'personality', trait: 'extraversion', score: 3.8 },
      { questionId: 'P4', category: 'personality', trait: 'agreeableness', score: 3.5 },
      { questionId: 'P5', category: 'personality', trait: 'neuroticism', score: 2.8 },
      // Neurodiversity responses (LOW - all moderate)
      { questionId: 'N1', category: 'neurodiversity', subcategory: 'executive_function', score: 2.5 },
      { questionId: 'N2', category: 'neurodiversity', subcategory: 'sensory', score: 2.8 },
      { questionId: 'N3', category: 'neurodiversity', subcategory: 'attention', score: 2.5 },
      { questionId: 'N4', category: 'neurodiversity', subcategory: 'social', score: 2.8 },
      { questionId: 'N5', category: 'neurodiversity', subcategory: 'executive_function', score: 2.3 },
      // More balanced responses
      ...Array(10).fill(null).map((_, i) => ({
        questionId: `FILL_${i}`,
        category: 'personality',
        trait: ['openness', 'conscientiousness', 'extraversion'][i % 3],
        score: 3
      }))
    ],
    expectedTriggers: [],
    expectedHighPriority: ['personality_facets', 'attachment', 'cognitive_functions']
  },
  {
    name: 'AuDHD Profile',
    description: 'Combined ADHD + Autism indicators',
    baselineResponses: [
      // Personality responses
      { questionId: 'P1', category: 'personality', trait: 'openness', score: 4.2 },
      { questionId: 'P2', category: 'personality', trait: 'conscientiousness', score: 2.5 },
      { questionId: 'P3', category: 'personality', trait: 'extraversion', score: 3 },
      { questionId: 'P4', category: 'personality', trait: 'agreeableness', score: 3.5 },
      { questionId: 'P5', category: 'personality', trait: 'neuroticism', score: 4 },
      // Neurodiversity responses (HIGH both executive AND sensory)
      { questionId: 'N1', category: 'neurodiversity', subcategory: 'executive_function', score: 4.5 },
      { questionId: 'N2', category: 'neurodiversity', subcategory: 'sensory_processing', score: 4.3 },
      { questionId: 'N3', category: 'neurodiversity', subcategory: 'attention', score: 4.2 },
      { questionId: 'N4', category: 'neurodiversity', subcategory: 'sensory', score: 4.5 },
      { questionId: 'N5', category: 'neurodiversity', subcategory: 'social', score: 4.0 },
      // More balanced responses
      ...Array(10).fill(null).map((_, i) => ({
        questionId: `FILL_${i}`,
        category: 'personality',
        trait: ['openness', 'conscientiousness', 'extraversion'][i % 3],
        score: 3.5
      }))
    ],
    expectedTriggers: ['executive_dysfunction', 'adhd_pathway', 'sensory_sensitivity', 'autism_pathway', 'audhd_pathway'],
    expectedHighPriority: ['executive_function', 'sensory_processing', 'adhd_deep', 'autism_deep']
  }
];

async function runTests() {
  try {
    console.log('🔬 Testing Adaptive Selection with Varied Baseline Responses\n');
    console.log('=' .repeat(80));

    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const selector = new ComprehensiveAdaptiveSelector();
    const results = [];

    for (const scenario of testScenarios) {
      console.log(`\n📊 Test Scenario: ${scenario.name}`);
      console.log(`Description: ${scenario.description}`);
      console.log('-'.repeat(80));

      const result = await selector.selectAdaptiveQuestions(
        QuestionBank,
        scenario.baselineResponses,
        'comprehensive'
      );

      console.log(`\n✓ Profile Analysis:`);
      console.log(`  Big Five:`, result.profile.bigFive);
      console.log(`  Neurodiversity:`, result.profile.neurodiversity);
      console.log(`  Triggers:`, Array.from(result.profile.triggers));
      console.log(`  Patterns:`, result.profile.patterns);

      console.log(`\n✓ Priorities:`);
      const sortedPriorities = Object.entries(result.priorities)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
      sortedPriorities.forEach(([pathway, priority]) => {
        console.log(`  ${pathway}: ${priority}`);
      });

      console.log(`\n✓ Allocation (Total: ${Object.values(result.allocation).reduce((a,b) => a+b, 0)}):`);
      Object.entries(result.allocation)
        .filter(([,count]) => count > 0)
        .sort(([,a], [,b]) => b - a)
        .forEach(([pathway, count]) => {
          console.log(`  ${pathway}: ${count} questions`);
        });

      console.log(`\n✓ Questions Selected: ${result.questions.length}`);

      // Verification
      const triggersMatch = scenario.expectedTriggers.every(t =>
        result.profile.triggers.has(t)
      );
      const prioritiesMatch = scenario.expectedHighPriority.some(p =>
        result.priorities[p] >= 7
      );

      console.log(`\n${triggersMatch && prioritiesMatch ? '✅' : '⚠️'} Test Result:`,
        triggersMatch && prioritiesMatch ? 'PASS' : 'REVIEW');

      if (!triggersMatch) {
        console.log(`  ⚠️ Expected triggers not all present:`, scenario.expectedTriggers);
      }
      if (!prioritiesMatch) {
        console.log(`  ⚠️ Expected high priority pathways missing:`, scenario.expectedHighPriority);
      }

      results.push({
        scenario: scenario.name,
        passed: triggersMatch && prioritiesMatch,
        allocation: result.allocation,
        questionCount: result.questions.length
      });

      console.log('=' .repeat(80));
    }

    // Summary
    console.log(`\n\n📈 TEST SUMMARY`);
    console.log('=' .repeat(80));
    const passed = results.filter(r => r.passed).length;
    console.log(`Tests Passed: ${passed}/${results.length}`);

    // Check for allocation variety
    console.log(`\n🔍 Allocation Variety Check:`);
    const allocations = results.map(r => JSON.stringify(r.allocation));
    const uniqueAllocations = new Set(allocations);
    console.log(`  Unique allocation patterns: ${uniqueAllocations.size}/${results.length}`);

    if (uniqueAllocations.size === 1) {
      console.log(`  ⚠️ WARNING: All scenarios produced the same allocation!`);
      console.log(`  This suggests adaptive selection may not be working properly.`);
    } else {
      console.log(`  ✅ SUCCESS: Different baselines produce different allocations!`);
    }

    console.log('\n' + '=' .repeat(80));

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

runTests();
