#!/usr/bin/env node

/**
 * Fix Adaptive Thresholds Script
 * Properly populates threshold values for adaptive criteria that are currently undefined
 */

require('dotenv').config();
const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

async function fixAdaptiveThresholds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test');
    console.log('Connected to MongoDB');

    // Fix personality questions with proper thresholds
    const personalityUpdates = [
      {
        filter: {
          trait: 'openness',
          'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
        },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'openness', threshold: 3.5 },
              { trait: 'creativity', threshold: 3.0 }
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
              { trait: 'conscientiousness', threshold: 3.5 },
              { trait: 'organization', threshold: 3.0 }
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
              { trait: 'extraversion', threshold: 3.5 },
              { trait: 'sociability', threshold: 3.0 }
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
              { trait: 'agreeableness', threshold: 3.5 },
              { trait: 'empathy', threshold: 3.0 }
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
              { trait: 'neuroticism', threshold: 3.5 },
              { trait: 'emotional_sensitivity', threshold: 3.0 }
            ]
          }
        }
      },
      // Fix other traits (behavioral, situational, preferences)
      {
        filter: {
          trait: { $in: ['behavioral', 'situational', 'preferences'] },
          'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true }
        },
        update: [
          {
            $set: {
              'adaptive.adaptiveCriteria.triggerTraits': [{ trait: '$trait', threshold: 3.0 }]
            }
          }
        ]
      }
    ];

    let totalUpdated = 0;
    for (const update of personalityUpdates) {
      const result = await QuestionBank.updateMany(update.filter, update.update);
      console.log(
        `Updated ${result.modifiedCount} questions for filter:`,
        JSON.stringify(update.filter)
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
              { trait: 'adhd', threshold: 3.0 },
              { trait: 'executive_dysfunction', threshold: 2.5 }
            ]
          }
        }
      },
      {
        filter: { trait: 'autism', 'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true } },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'autism', threshold: 3.0 },
              { trait: 'social_difficulties', threshold: 2.5 }
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
              { trait: 'sensory_sensitivity', threshold: 3.0 },
              { trait: 'neuroticism', threshold: 3.5 }
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
              { trait: 'executive_dysfunction', threshold: 3.0 },
              { trait: 'adhd', threshold: 2.5 }
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
              { trait: 'analytical_thinking', threshold: 3.5 },
              { trait: 'conscientiousness', threshold: 3.0 }
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
              { trait: 'hands_on_learning', threshold: 3.0 },
              { trait: 'physical_engagement', threshold: 3.5 }
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
              { trait: 'spatial_intelligence', threshold: 3.5 },
              { trait: 'visual_processing', threshold: 3.0 }
            ]
          }
        }
      },
      {
        filter: { trait: 'visual', 'adaptive.adaptiveCriteria.triggerTraits.0': { $exists: true } },
        update: {
          $set: {
            'adaptive.adaptiveCriteria.triggerTraits': [
              { trait: 'visual_learning', threshold: 3.5 },
              { trait: 'memory_visual', threshold: 3.0 }
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
              { trait: 'big_picture_thinking', threshold: 3.5 },
              { trait: 'intuitive_processing', threshold: 3.0 }
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
              { trait: 'adhd', threshold: 3.5 },
              { trait: 'executive_dysfunction', threshold: 3.0 }
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
              { trait: 'autism', threshold: 3.5 },
              { trait: 'sensory_sensitivity', threshold: 3.0 }
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
              { trait: 'masking_behavior', threshold: 3.0 },
              { trait: 'social_anxiety', threshold: 3.5 }
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
              { trait: 'neuroticism', threshold: 3.5 },
              { trait: 'emotional_intensity', threshold: 3.0 }
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
              { trait: 'autism', threshold: 3.0 },
              { trait: 'openness', threshold: 4.0 }
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
              { trait: 'trauma_indicators', threshold: 3.0 },
              { trait: 'neuroticism', threshold: 4.0 }
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
              { trait: 'neuroticism', threshold: 3.5 },
              { trait: 'attachment_anxiety', threshold: 3.0 }
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
              { trait: 'introversion', threshold: 3.5 },
              { trait: 'independence', threshold: 4.0 }
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

    console.log(`\n✅ Total questions updated: ${totalUpdated}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing adaptive thresholds:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  fixAdaptiveThresholds();
}
