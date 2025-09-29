#!/usr/bin/env node

/**
 * Add Missing Thresholds Script
 * Adds the missing threshold field to existing triggerTraits that don't have it
 */

require('dotenv').config();
const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

async function addMissingThresholds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test');
    console.log('Connected to MongoDB');

    // Define threshold mappings for different trait types
    const thresholdMap = {
      // Big Five personality traits
      openness: 3.5,
      conscientiousness: 3.5,
      extraversion: 3.5,
      agreeableness: 3.5,
      neuroticism: 3.5,
      creativity: 3.0,
      organization: 3.0,
      sociability: 3.0,
      empathy: 3.0,
      emotional_sensitivity: 3.0,

      // Other personality traits
      behavioral: 3.0,
      situational: 3.0,
      preferences: 3.0,

      // Neurodiversity traits
      adhd: 3.0,
      autism: 3.0,
      executive_dysfunction: 2.5,
      social_difficulties: 2.5,
      sensory_sensitivity: 3.0,
      masking_behavior: 3.0,
      social_anxiety: 3.5,
      emotional_intensity: 3.0,
      trauma_indicators: 3.0,
      attachment_anxiety: 3.0,
      introversion: 3.5,
      independence: 4.0,

      // Cognitive traits
      analytical_thinking: 3.5,
      hands_on_learning: 3.0,
      physical_engagement: 3.5,
      spatial_intelligence: 3.5,
      visual_processing: 3.0,
      visual_learning: 3.5,
      memory_visual: 3.0,
      big_picture_thinking: 3.5,
      intuitive_processing: 3.0
    };

    // Get all questions that have trigger traits without thresholds
    const questionsToUpdate = await QuestionBank.find({
      'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
    });

    console.log(`Found ${questionsToUpdate.length} questions with trigger traits to update`);

    let updatedCount = 0;
    for (const question of questionsToUpdate) {
      let hasChanges = false;
      const updatedTriggerTraits = question.adaptive.adaptiveCriteria.triggerTraits.map(
        triggerTrait => {
          if (!triggerTrait.threshold && triggerTrait.trait) {
            const threshold = thresholdMap[triggerTrait.trait] || 3.0; // Default threshold
            hasChanges = true;
            return {
              trait: triggerTrait.trait,
              threshold: threshold
            };
          }
          return triggerTrait;
        }
      );

      if (hasChanges) {
        await QuestionBank.updateOne(
          { _id: question._id },
          { $set: { 'adaptive.adaptiveCriteria.triggerTraits': updatedTriggerTraits } }
        );
        updatedCount++;
        console.log(
          `Updated ${question.questionId}: ${question.trait} - Added thresholds to ${updatedTriggerTraits.length} trigger traits`
        );
      }
    }

    console.log(`\n✅ Successfully updated ${updatedCount} questions with missing thresholds`);

    // Verify the fix
    const questionsWithThresholds = await QuestionBank.countDocuments({
      'adaptive.adaptiveCriteria.triggerTraits.threshold': { $exists: true }
    });

    console.log(`Questions now with threshold values: ${questionsWithThresholds}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error adding missing thresholds:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  addMissingThresholds();
}
