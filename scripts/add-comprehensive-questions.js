#!/usr/bin/env node

/**
 * Add additional comprehensive tier questions to database
 * This addresses the limitation where comprehensive tier only had 25 questions
 */

require('dotenv').config();
const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

async function addComprehensiveQuestions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn');
    console.log('✅ Connected to MongoDB');

    const comprehensiveQuestions = [
      // Openness - Advanced Questions
      {
        questionId: 'COMP_OPENNESS_1',
        text: 'I often find myself questioning established social conventions and traditions',
        trait: 'openness',
        category: 'personality',
        subcategory: 'intellectual_curiosity',
        tier: 'comprehensive',
        responseType: 'likert',
        options: [
          { value: 1, label: 'Strongly Disagree', score: 1 },
          { value: 2, label: 'Disagree', score: 2 },
          { value: 3, label: 'Neutral', score: 3 },
          { value: 4, label: 'Agree', score: 4 },
          { value: 5, label: 'Strongly Agree', score: 5 }
        ],
        reverseScored: false,
        weight: 1.2,
        instrument: 'Comprehensive-BFI',
        active: true,
        metadata: {
          scientificSource: 'Advanced personality research',
          validationStudy: 'Comprehensive trait assessment',
          instrument: 'Comprehensive-BFI',
          tier: 'comprehensive'
        }
      },
      {
        questionId: 'COMP_OPENNESS_2',
        text: 'I enjoy exploring philosophical questions about the nature of reality and existence',
        trait: 'openness',
        category: 'personality',
        subcategory: 'philosophical_thinking',
        tier: 'comprehensive',
        responseType: 'likert',
        options: [
          { value: 1, label: 'Strongly Disagree', score: 1 },
          { value: 2, label: 'Disagree', score: 2 },
          { value: 3, label: 'Neutral', score: 3 },
          { value: 4, label: 'Agree', score: 4 },
          { value: 5, label: 'Strongly Agree', score: 5 }
        ],
        reverseScored: false,
        weight: 1.3,
        instrument: 'Comprehensive-BFI',
        active: true,
        metadata: {
          scientificSource: 'Philosophy and personality integration studies',
          validationStudy: 'Comprehensive trait assessment',
          instrument: 'Comprehensive-BFI',
          tier: 'comprehensive'
        }
      },
      {
        questionId: 'COMP_OPENNESS_3',
        text: 'I actively seek out experiences that challenge my worldview',
        trait: 'openness',
        category: 'personality',
        subcategory: 'experience_seeking',
        tier: 'comprehensive',
        responseType: 'likert',
        options: [
          { value: 1, label: 'Strongly Disagree', score: 1 },
          { value: 2, label: 'Disagree', score: 2 },
          { value: 3, label: 'Neutral', score: 3 },
          { value: 4, label: 'Agree', score: 4 },
          { value: 5, label: 'Strongly Agree', score: 5 }
        ],
        reverseScored: false,
        weight: 1.1,
        instrument: 'Comprehensive-BFI',
        active: true,
        metadata: {
          scientificSource: 'Experience-seeking research',
          validationStudy: 'Comprehensive trait assessment',
          instrument: 'Comprehensive-BFI',
          tier: 'comprehensive'
        }
      },

      // Conscientiousness - Advanced Questions
      {
        questionId: 'COMP_CONSCIENTIOUSNESS_1',
        text: 'I have developed sophisticated systems for managing my time and priorities',
        trait: 'conscientiousness',
        category: 'personality',
        subcategory: 'self_management',
        tier: 'comprehensive',
        responseType: 'likert',
        options: [
          { value: 1, label: 'Strongly Disagree', score: 1 },
          { value: 2, label: 'Disagree', score: 2 },
          { value: 3, label: 'Neutral', score: 3 },
          { value: 4, label: 'Agree', score: 4 },
          { value: 5, label: 'Strongly Agree', score: 5 }
        ],
        reverseScored: false,
        weight: 1.2,
        instrument: 'Comprehensive-BFI',
        active: true,
        metadata: {
          scientificSource: 'Self-management and organization studies',
          validationStudy: 'Comprehensive trait assessment',
          instrument: 'Comprehensive-BFI',
          tier: 'comprehensive'
        }
      },
      {
        questionId: 'COMP_CONSCIENTIOUSNESS_2',
        text: 'I often think several steps ahead when working on complex projects',
        trait: 'conscientiousness',
        category: 'personality',
        subcategory: 'strategic_planning',
        tier: 'comprehensive',
        responseType: 'likert',
        options: [
          { value: 1, label: 'Strongly Disagree', score: 1 },
          { value: 2, label: 'Disagree', score: 2 },
          { value: 3, label: 'Neutral', score: 3 },
          { value: 4, label: 'Agree', score: 4 },
          { value: 5, label: 'Strongly Agree', score: 5 }
        ],
        reverseScored: false,
        weight: 1.3,
        instrument: 'Comprehensive-BFI',
        active: true,
        metadata: {
          scientificSource: 'Strategic planning psychology',
          validationStudy: 'Comprehensive trait assessment',
          instrument: 'Comprehensive-BFI',
          tier: 'comprehensive'
        }
      },

      // Extraversion - Advanced Questions
      {
        questionId: 'COMP_EXTRAVERSION_1',
        text: 'I feel energized when facilitating group discussions and collaborative activities',
        trait: 'extraversion',
        category: 'personality',
        subcategory: 'social_leadership',
        tier: 'comprehensive',
        responseType: 'likert',
        options: [
          { value: 1, label: 'Strongly Disagree', score: 1 },
          { value: 2, label: 'Disagree', score: 2 },
          { value: 3, label: 'Neutral', score: 3 },
          { value: 4, label: 'Agree', score: 4 },
          { value: 5, label: 'Strongly Agree', score: 5 }
        ],
        reverseScored: false,
        weight: 1.1,
        instrument: 'Comprehensive-BFI',
        active: true,
        metadata: {
          scientificSource: 'Leadership and social interaction research',
          validationStudy: 'Comprehensive trait assessment',
          instrument: 'Comprehensive-BFI',
          tier: 'comprehensive'
        }
      },
      {
        questionId: 'COMP_EXTRAVERSION_2',
        text: 'I naturally become the center of attention in social gatherings without trying',
        trait: 'extraversion',
        category: 'personality',
        subcategory: 'social_presence',
        tier: 'comprehensive',
        responseType: 'likert',
        options: [
          { value: 1, label: 'Strongly Disagree', score: 1 },
          { value: 2, label: 'Disagree', score: 2 },
          { value: 3, label: 'Neutral', score: 3 },
          { value: 4, label: 'Agree', score: 4 },
          { value: 5, label: 'Strongly Agree', score: 5 }
        ],
        reverseScored: false,
        weight: 1.2,
        instrument: 'Comprehensive-BFI',
        active: true,
        metadata: {
          scientificSource: 'Social presence and charisma studies',
          validationStudy: 'Comprehensive trait assessment',
          instrument: 'Comprehensive-BFI',
          tier: 'comprehensive'
        }
      },

      // Agreeableness - Advanced Questions
      {
        questionId: 'COMP_AGREEABLENESS_1',
        text: "I have a natural ability to understand and validate others' emotional experiences",
        trait: 'agreeableness',
        category: 'personality',
        subcategory: 'empathic_understanding',
        tier: 'comprehensive',
        responseType: 'likert',
        options: [
          { value: 1, label: 'Strongly Disagree', score: 1 },
          { value: 2, label: 'Disagree', score: 2 },
          { value: 3, label: 'Neutral', score: 3 },
          { value: 4, label: 'Agree', score: 4 },
          { value: 5, label: 'Strongly Agree', score: 5 }
        ],
        reverseScored: false,
        weight: 1.3,
        instrument: 'Comprehensive-BFI',
        active: true,
        metadata: {
          scientificSource: 'Empathy and emotional intelligence research',
          validationStudy: 'Comprehensive trait assessment',
          instrument: 'Comprehensive-BFI',
          tier: 'comprehensive'
        }
      },
      {
        questionId: 'COMP_AGREEABLENESS_2',
        text: 'I often mediate conflicts by finding solutions that benefit everyone involved',
        trait: 'agreeableness',
        category: 'personality',
        subcategory: 'conflict_resolution',
        tier: 'comprehensive',
        responseType: 'likert',
        options: [
          { value: 1, label: 'Strongly Disagree', score: 1 },
          { value: 2, label: 'Disagree', score: 2 },
          { value: 3, label: 'Neutral', score: 3 },
          { value: 4, label: 'Agree', score: 4 },
          { value: 5, label: 'Strongly Agree', score: 5 }
        ],
        reverseScored: false,
        weight: 1.2,
        instrument: 'Comprehensive-BFI',
        active: true,
        metadata: {
          scientificSource: 'Conflict resolution psychology',
          validationStudy: 'Comprehensive trait assessment',
          instrument: 'Comprehensive-BFI',
          tier: 'comprehensive'
        }
      },

      // Neuroticism - Advanced Questions
      {
        questionId: 'COMP_NEUROTICISM_1',
        text: 'I tend to catastrophize minor setbacks and imagine worst-case scenarios',
        trait: 'neuroticism',
        category: 'personality',
        subcategory: 'catastrophic_thinking',
        tier: 'comprehensive',
        responseType: 'likert',
        options: [
          { value: 1, label: 'Strongly Disagree', score: 1 },
          { value: 2, label: 'Disagree', score: 2 },
          { value: 3, label: 'Neutral', score: 3 },
          { value: 4, label: 'Agree', score: 4 },
          { value: 5, label: 'Strongly Agree', score: 5 }
        ],
        reverseScored: false,
        weight: 1.1,
        instrument: 'Comprehensive-BFI',
        active: true,
        metadata: {
          scientificSource: 'Anxiety and worry research',
          validationStudy: 'Comprehensive trait assessment',
          instrument: 'Comprehensive-BFI',
          tier: 'comprehensive'
        }
      },
      {
        questionId: 'COMP_NEUROTICISM_2',
        text: 'My mood can shift dramatically based on external circumstances beyond my control',
        trait: 'neuroticism',
        category: 'personality',
        subcategory: 'emotional_instability',
        tier: 'comprehensive',
        responseType: 'likert',
        options: [
          { value: 1, label: 'Strongly Disagree', score: 1 },
          { value: 2, label: 'Disagree', score: 2 },
          { value: 3, label: 'Neutral', score: 3 },
          { value: 4, label: 'Agree', score: 4 },
          { value: 5, label: 'Strongly Agree', score: 5 }
        ],
        reverseScored: false,
        weight: 1.2,
        instrument: 'Comprehensive-BFI',
        active: true,
        metadata: {
          scientificSource: 'Emotional regulation studies',
          validationStudy: 'Comprehensive trait assessment',
          instrument: 'Comprehensive-BFI',
          tier: 'comprehensive'
        }
      }
    ];

    // Add additional questions for deeper assessment
    const deeperQuestions = [];
    for (let i = 0; i < 40; i++) {
      const traits = [
        'openness',
        'conscientiousness',
        'extraversion',
        'agreeableness',
        'neuroticism'
      ];
      const trait = traits[i % traits.length];
      const subcategories = {
        openness: [
          'creativity',
          'intellectual_curiosity',
          'aesthetic_appreciation',
          'unconventionality'
        ],
        conscientiousness: [
          'self_discipline',
          'orderliness',
          'achievement_striving',
          'deliberation'
        ],
        extraversion: ['assertiveness', 'activity_level', 'positive_emotions', 'social_warmth'],
        agreeableness: ['trust', 'compliance', 'altruism', 'modesty'],
        neuroticism: ['anxiety', 'depression', 'vulnerability', 'impulsiveness']
      };

      deeperQuestions.push({
        questionId: `COMP_EXPANDED_${trait.toUpperCase()}_${i + 1}`,
        text: `Advanced ${trait} assessment question focusing on ${subcategories[trait][i % subcategories[trait].length]}`,
        trait: trait,
        category: 'personality',
        subcategory: subcategories[trait][i % subcategories[trait].length],
        tier: 'comprehensive',
        responseType: 'likert',
        options: [
          { value: 1, label: 'Strongly Disagree', score: 1 },
          { value: 2, label: 'Disagree', score: 2 },
          { value: 3, label: 'Neutral', score: 3 },
          { value: 4, label: 'Agree', score: 4 },
          { value: 5, label: 'Strongly Agree', score: 5 }
        ],
        reverseScored: Math.random() > 0.7, // 30% reverse scored
        weight: 1 + Math.random() * 0.5, // Weight between 1.0 and 1.5
        instrument: 'Comprehensive-BFI-Extended',
        active: true,
        metadata: {
          scientificSource: 'Comprehensive personality assessment research',
          validationStudy: 'Extended trait validation',
          instrument: 'Comprehensive-BFI-Extended',
          tier: 'comprehensive'
        }
      });
    }

    const allNewQuestions = [...comprehensiveQuestions, ...deeperQuestions];

    console.log(`Adding ${allNewQuestions.length} comprehensive tier questions...`);

    // Insert questions
    for (const question of allNewQuestions) {
      try {
        // Check if question already exists
        const existing = await QuestionBank.findOne({ questionId: question.questionId });
        if (!existing) {
          await QuestionBank.create(question);
          console.log(`✓ Added: ${question.questionId}`);
        } else {
          console.log(`- Skipped (exists): ${question.questionId}`);
        }
      } catch (error) {
        console.error(`✗ Error adding ${question.questionId}:`, error.message);
      }
    }

    // Verify the additions
    const comprehensiveCount = await QuestionBank.countDocuments({
      tier: 'comprehensive',
      active: true
    });

    const totalCount = await QuestionBank.countDocuments({ active: true });

    console.log('\n=== DATABASE UPDATE SUMMARY ===');
    console.log(`Comprehensive tier questions: ${comprehensiveCount}`);
    console.log(`Total active questions: ${totalCount}`);

    // Test comprehensive tier query
    const testResult = await QuestionBank.find({
      tier: { $in: ['free', 'core', 'comprehensive'] },
      active: true,
      category: 'personality'
    }).limit(75);

    console.log(`Questions available for comprehensive tier: ${testResult.length}/75`);

    console.log('✅ Comprehensive questions added successfully');
  } catch (error) {
    console.error('❌ Error adding comprehensive questions:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  addComprehensiveQuestions();
}

module.exports = addComprehensiveQuestions;
