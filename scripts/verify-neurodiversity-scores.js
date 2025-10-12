#!/usr/bin/env node

const mongoose = require('mongoose');
const AssessmentSession = require('../models/AssessmentSession');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

async function verifyNeurodiversityScores() {
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

    console.log('\n=== NEURODIVERSITY SCORE VERIFICATION ===\n');
    console.log(`Session: ${session.sessionId}`);
    console.log(`Total responses: ${session.responses.length}\n`);

    // Check executive function responses
    const efResponses = session.responses.filter(r =>
      r.category?.toLowerCase().includes('executive') ||
      r.category?.toLowerCase().includes('organization') ||
      r.category?.toLowerCase().includes('working') ||
      r.questionId?.toLowerCase().includes('_ef_')
    );

    console.log('EXECUTIVE FUNCTION RESPONSES:');
    console.log(`  Found ${efResponses.length} responses`);
    efResponses.forEach(r => {
      console.log(`  - ${r.questionId}: ${r.value} (category: ${r.category})`);
    });

    // Check sensory responses
    const sensoryResponses = session.responses.filter(r =>
      r.category?.toLowerCase().includes('sensory') ||
      r.category?.toLowerCase().includes('auditory') ||
      r.category?.toLowerCase().includes('visual') ||
      r.category?.toLowerCase().includes('tactile')
    );

    console.log('\nSENSORY RESPONSES:');
    console.log(`  Found ${sensoryResponses.length} responses`);
    sensoryResponses.forEach(r => {
      console.log(`  - ${r.questionId}: ${r.value} (category: ${r.category})`);
    });

    // Check ADHD/autism responses
    const ndResponses = session.responses.filter(r =>
      r.category?.toLowerCase().includes('adhd') ||
      r.category?.toLowerCase().includes('autism') ||
      r.category?.toLowerCase().includes('asd')
    );

    console.log('\nADHD/AUTISM RESPONSES:');
    console.log(`  Found ${ndResponses.length} responses`);
    ndResponses.forEach(r => {
      console.log(`  - ${r.questionId}: ${r.value} (category: ${r.category})`);
    });

    // PDF Report shows:
    // - Working Memory: 50%
    // - Organization: 25%
    // - Task Initiation: 75%
    // - All sensory: TYPICAL (0)

    console.log('\n=== PDF REPORT CLAIMS ===');
    console.log('Executive Function:');
    console.log('  Working Memory: 50%');
    console.log('  Organization: 25%');
    console.log('  Task Initiation: 75%');
    console.log('\nSensory Processing:');
    console.log('  All domains: TYPICAL (Score: 0)');

    console.log('\n=== VERIFICATION ===');
    if (efResponses.length === 0 && sensoryResponses.length === 0) {
      console.log('⚠️  WARNING: No specific EF/sensory questions found in responses');
      console.log('These scores may be derived from personality traits or defaults');
    } else {
      console.log(`✓ Found ${efResponses.length} EF and ${sensoryResponses.length} sensory responses`);
    }

    await mongoose.disconnect();
    console.log('\n✓ Analysis complete\n');

  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

verifyNeurodiversityScores();
