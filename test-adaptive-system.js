#!/usr/bin/env node

/**
 * Test the new adaptive assessment system directly
 */

require('dotenv').config();
const mongoose = require('mongoose');
const adaptiveHandler = require('./api/assessments/adaptive-optimized');

async function testAdaptiveSystem() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn');
    console.log('✅ Connected to MongoDB');

    // Test 1: Free tier personality assessment
    console.log('\n=== TEST 1: Free Tier Personality Assessment ===');
    const req1 = {
      method: 'POST',
      body: {
        tier: 'free',
        assessmentType: 'personality',
        targetTraits: [
          'openness',
          'conscientiousness',
          'extraversion',
          'agreeableness',
          'neuroticism'
        ],
        previousResponses: [],
        userProfile: {}
      }
    };

    const res1 = mockResponse();
    await adaptiveHandler(req1, res1);
    const result1 = res1.getResponse();

    if (result1.success) {
      console.log(`✅ Generated ${result1.questions.length} questions for free tier`);
      console.log('Trait coverage:', result1.adaptiveMetadata.traitCoverage);
      console.log('First 3 questions:');
      result1.questions.slice(0, 3).forEach((q, i) => {
        console.log(`  ${i + 1}. [${q.trait}] ${q.text.substring(0, 60)}...`);
      });
    } else {
      console.log('❌ Test 1 failed:', result1.error);
    }

    // Test 2: Core tier with previous responses
    console.log('\n=== TEST 2: Core Tier with Previous Responses ===');
    const req2 = {
      method: 'POST',
      body: {
        tier: 'core',
        assessmentType: 'personality',
        targetTraits: ['openness', 'conscientiousness'],
        previousResponses: [
          { questionId: 'test1', trait: 'openness', value: 5 },
          { questionId: 'test2', trait: 'openness', value: 4 },
          { questionId: 'test3', trait: 'conscientiousness', value: 1 }
        ],
        userProfile: { age: 25, interests: ['technology'] }
      }
    };

    const res2 = mockResponse();
    await adaptiveHandler(req2, res2);
    const result2 = res2.getResponse();

    if (result2.success) {
      console.log(`✅ Generated ${result2.questions.length} questions for core tier`);
      console.log('Trait coverage:', result2.adaptiveMetadata.traitCoverage);
      console.log('Algorithm version:', result2.adaptiveMetadata.algorithm);
    } else {
      console.log('❌ Test 2 failed:', result2.error);
    }

    // Test 3: Comprehensive assessment
    console.log('\n=== TEST 3: Comprehensive Assessment ===');
    const req3 = {
      method: 'POST',
      body: {
        tier: 'comprehensive',
        assessmentType: 'personality',
        targetTraits: [
          'openness',
          'conscientiousness',
          'extraversion',
          'agreeableness',
          'neuroticism'
        ],
        previousResponses: [],
        userProfile: {}
      }
    };

    const res3 = mockResponse();
    await adaptiveHandler(req3, res3);
    const result3 = res3.getResponse();

    if (result3.success) {
      console.log(`✅ Generated ${result3.questions.length} questions for comprehensive tier`);
      console.log('Estimated time:', result3.adaptiveMetadata.estimatedTime, 'minutes');

      // Check question diversity
      const categories = new Set(result3.questions.map(q => q.category));
      const instruments = new Set(result3.questions.map(q => q.metadata.instrument));
      console.log('Categories covered:', Array.from(categories));
      console.log('Instruments used:', Array.from(instruments).slice(0, 5));
    } else {
      console.log('❌ Test 3 failed:', result3.error);
    }

    // Test 4: Neurodiversity detection scenario
    console.log('\n=== TEST 4: Neurodiversity Detection ===');
    const req4 = {
      method: 'POST',
      body: {
        tier: 'core',
        assessmentType: 'personality',
        targetTraits: ['openness', 'conscientiousness'],
        previousResponses: [
          { questionId: 'q1', trait: 'conscientiousness', value: 1 },
          { questionId: 'q2', trait: 'conscientiousness', value: 5 },
          { questionId: 'q3', trait: 'openness', value: 1 },
          { questionId: 'q4', trait: 'openness', value: 5 },
          { questionId: 'q5', trait: 'extraversion', value: 1 }
        ],
        userProfile: {}
      }
    };

    const res4 = mockResponse();
    await adaptiveHandler(req4, res4);
    const result4 = res4.getResponse();

    if (result4.success) {
      console.log(`✅ Generated ${result4.questions.length} questions (neurodiversity scenario)`);
      const neurodiversityQuestions = result4.questions.filter(
        q => q.category === 'neurodiversity'
      );
      console.log(`Neurodiversity questions included: ${neurodiversityQuestions.length}`);
    } else {
      console.log('❌ Test 4 failed:', result4.error);
    }

    console.log('\n🎉 All adaptive system tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Mock response object for testing
function mockResponse() {
  let response = null;
  let statusCode = 200;
  const headers = {};

  return {
    status: code => {
      statusCode = code;
      return mockResponse();
    },
    json: data => {
      response = data;
    },
    setHeader: (key, value) => {
      headers[key] = value;
    },
    end: () => {},
    getResponse: () => response,
    getStatus: () => statusCode,
    getHeaders: () => headers
  };
}

// Run tests if called directly
if (require.main === module) {
  testAdaptiveSystem();
}

module.exports = testAdaptiveSystem;
