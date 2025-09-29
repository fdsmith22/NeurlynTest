#!/usr/bin/env node

/**
 * Fix Schema-Compliant Thresholds Script
 * Properly populates minScore/maxScore values for adaptive criteria (not threshold)
 * Uses the correct schema fields as defined in QuestionBank.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

async function fixSchemaCompliantThresholds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test');
    console.log('Connected to MongoDB');

    // Fix personality questions with proper minScore/maxScore ranges
    const personalityUpdates = [
      {
        filter: {
          trait: 'openness',
          'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
        },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'openness', minScore: 3.5, maxScore: 5.0 },
              { trait: 'creativity', minScore: 3.0, maxScore: 5.0 }
            ]
          }
        }
      },
      {
        filter: {
          trait: 'conscientiousness',
          'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
        },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'conscientiousness', minScore: 3.5, maxScore: 5.0 },
              { trait: 'organization', minScore: 3.0, maxScore: 5.0 }
            ]
          }
        }
      },
      {
        filter: {
          trait: 'extraversion',
          'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
        },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'extraversion', minScore: 3.5, maxScore: 5.0 },
              { trait: 'sociability', minScore: 3.0, maxScore: 5.0 }
            ]
          }
        }
      },
      {
        filter: {
          trait: 'agreeableness',
          'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
        },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'agreeableness', minScore: 3.5, maxScore: 5.0 },
              { trait: 'empathy', minScore: 3.0, maxScore: 5.0 }
            ]
          }
        }
      },
      {
        filter: {
          trait: 'neuroticism',
          'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
        },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'neuroticism', minScore: 3.5, maxScore: 5.0 },
              { trait: 'emotional_sensitivity', minScore: 3.0, maxScore: 5.0 }
            ]
          }
        }
      }
    ];

    let totalUpdated = 0;
    for (const update of personalityUpdates) {
      const result = await QuestionBank.updateMany(update.filter, update.update);
      console.log(
        `Updated ${result.modifiedCount} personality questions for trait: ${update.filter.trait}`
      );
      totalUpdated += result.modifiedCount;
    }

    // Fix neurodiversity questions
    const neurodiversityUpdates = [
      {
        filter: { trait: 'adhd', 'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true } },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'adhd', minScore: 3.0, maxScore: 5.0 },
              { trait: 'executive_dysfunction', minScore: 2.5, maxScore: 5.0 }
            ]
          }
        }
      },
      {
        filter: { trait: 'autism', 'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true } },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'autism', minScore: 3.0, maxScore: 5.0 },
              { trait: 'social_difficulties', minScore: 2.5, maxScore: 5.0 }
            ]
          }
        }
      },
      {
        filter: {
          trait: 'sensory',
          'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
        },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'sensory_sensitivity', minScore: 3.0, maxScore: 5.0 },
              { trait: 'neuroticism', minScore: 3.5, maxScore: 5.0 }
            ]
          }
        }
      },
      {
        filter: {
          trait: 'executive_function',
          'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
        },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'executive_dysfunction', minScore: 3.0, maxScore: 5.0 },
              { trait: 'adhd', minScore: 2.5, maxScore: 5.0 }
            ]
          }
        }
      }
    ];

    for (const update of neurodiversityUpdates) {
      const result = await QuestionBank.updateMany(update.filter, update.update);
      console.log(
        `Updated ${result.modifiedCount} neurodiversity questions for trait: ${update.filter.trait}`
      );
      totalUpdated += result.modifiedCount;
    }

    // Fix cognitive questions
    const cognitiveUpdates = [
      {
        filter: {
          trait: 'analytical',
          'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
        },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'analytical_thinking', minScore: 3.5, maxScore: 5.0 },
              { trait: 'conscientiousness', minScore: 3.0, maxScore: 5.0 }
            ]
          }
        }
      },
      {
        filter: {
          trait: 'kinesthetic',
          'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
        },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'hands_on_learning', minScore: 3.0, maxScore: 5.0 },
              { trait: 'physical_engagement', minScore: 3.5, maxScore: 5.0 }
            ]
          }
        }
      },
      {
        filter: {
          trait: 'spatial',
          'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
        },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'spatial_intelligence', minScore: 3.5, maxScore: 5.0 },
              { trait: 'visual_processing', minScore: 3.0, maxScore: 5.0 }
            ]
          }
        }
      },
      {
        filter: { trait: 'visual', 'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true } },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'visual_learning', minScore: 3.5, maxScore: 5.0 },
              { trait: 'memory_visual', minScore: 3.0, maxScore: 5.0 }
            ]
          }
        }
      },
      {
        filter: {
          trait: 'holistic',
          'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
        },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'big_picture_thinking', minScore: 3.5, maxScore: 5.0 },
              { trait: 'intuitive_processing', minScore: 3.0, maxScore: 5.0 }
            ]
          }
        }
      }
    ];

    for (const update of cognitiveUpdates) {
      const result = await QuestionBank.updateMany(update.filter, update.update);
      console.log(
        `Updated ${result.modifiedCount} cognitive questions for trait: ${update.filter.trait}`
      );
      totalUpdated += result.modifiedCount;
    }

    // Fix expanded neurodiversity questions (from the second seeding script)
    const expandedUpdates = [
      {
        filter: {
          subcategory: 'executive_function',
          category: 'neurodiversity',
          'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
        },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'adhd', minScore: 3.5, maxScore: 5.0 },
              { trait: 'executive_dysfunction', minScore: 3.0, maxScore: 5.0 }
            ]
          }
        }
      },
      {
        filter: {
          subcategory: 'sensory_processing',
          category: 'neurodiversity',
          'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
        },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'autism', minScore: 3.5, maxScore: 5.0 },
              { trait: 'sensory_sensitivity', minScore: 3.0, maxScore: 5.0 }
            ]
          }
        }
      },
      {
        filter: {
          subcategory: 'masking',
          category: 'neurodiversity',
          'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
        },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'masking_behavior', minScore: 3.0, maxScore: 5.0 },
              { trait: 'social_anxiety', minScore: 3.5, maxScore: 5.0 }
            ]
          }
        }
      },
      {
        filter: {
          subcategory: 'emotional_regulation',
          category: 'neurodiversity',
          'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
        },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'neuroticism', minScore: 3.5, maxScore: 5.0 },
              { trait: 'emotional_intensity', minScore: 3.0, maxScore: 5.0 }
            ]
          }
        }
      },
      {
        filter: {
          subcategory: 'special_interests',
          category: 'neurodiversity',
          'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
        },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'autism', minScore: 3.0, maxScore: 5.0 },
              { trait: 'openness', minScore: 4.0, maxScore: 5.0 }
            ]
          }
        }
      },
      {
        filter: {
          category: 'trauma_screening',
          'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
        },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'trauma_indicators', minScore: 3.0, maxScore: 5.0 },
              { trait: 'neuroticism', minScore: 4.0, maxScore: 5.0 }
            ]
          }
        }
      },
      {
        filter: {
          category: 'attachment',
          domain: 'anxious',
          'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
        },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'neuroticism', minScore: 3.5, maxScore: 5.0 },
              { trait: 'attachment_anxiety', minScore: 3.0, maxScore: 5.0 }
            ]
          }
        }
      },
      {
        filter: {
          category: 'attachment',
          domain: 'avoidant',
          'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
        },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'introversion', minScore: 3.5, maxScore: 5.0 },
              { trait: 'independence', minScore: 4.0, maxScore: 5.0 }
            ]
          }
        }
      }
    ];

    for (const update of expandedUpdates) {
      const result = await QuestionBank.updateMany(update.filter, update.update);
      console.log(
        `Updated ${result.modifiedCount} expanded questions for filter:`,
        JSON.stringify(update.filter)
      );
      totalUpdated += result.modifiedCount;
    }

    // Fix other traits (behavioral, situational, preferences)
    const otherTraitQuestions = await QuestionBank.find({
      trait: { $in: ['behavioral', 'situational', 'preferences'] },
      'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
    });

    for (const question of otherTraitQuestions) {
      await QuestionBank.updateOne(
        { _id: question._id },
        {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: question.trait, minScore: 3.0, maxScore: 5.0 }
            ]
          }
        }
      );
      totalUpdated++;
      console.log(`Updated ${question.questionId} with trait: ${question.trait}`);
    }

    console.log(`\n✅ Total questions updated: ${totalUpdated}`);

    // Verify the fix
    const questionsWithMinMaxScores = await QuestionBank.countDocuments({
      'adaptive.adaptiveCriteria.triggerTraits.minScore': { $exists: true },
      'adaptive.adaptiveCriteria.triggerTraits.maxScore': { $exists: true }
    });

    console.log(`Questions now with minScore/maxScore values: ${questionsWithMinMaxScores}`);

    // Sample verification
    const sampleQuestion = await QuestionBank.findOne({
      trait: 'openness',
      'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
    }).lean();

    console.log('\nSample question triggerTraits structure:');
    console.log(JSON.stringify(sampleQuestion.adaptive.adaptiveCriteria.triggerTraits, null, 2));

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing schema-compliant thresholds:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  fixSchemaCompliantThresholds();
}
