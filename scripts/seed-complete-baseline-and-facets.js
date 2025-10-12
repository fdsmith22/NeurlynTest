#!/usr/bin/env node

/**
 * Comprehensive Question Database Seeder
 *
 * Seeds the complete question database with:
 * - 20 properly balanced baseline questions
 * - 90 NEO-PI-R facet questions
 * - Complete metadata for adaptive assessment
 *
 * Based on comprehensive specification analysis
 */

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
const logger = require('../utils/logger');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

// ============================================================================
// PART 1: BASELINE QUESTIONS (20 total)
// ============================================================================

const baselineQuestions = {
  // 10 PERSONALITY - Big Five (2 per trait)
  personality: [
    // OPENNESS (2 questions)
    {
      questionId: 'BASELINE_OPENNESS_1',
      text: 'When I discover a hidden path while walking, I usually take it to see where it leads.',
      category: 'personality',
      instrument: 'BFI-2-Improved',
      trait: 'openness',
      responseType: 'likert',
      reverseScored: false,
      tier: 'core',
      tags: ['baseline', 'validated'],
      adaptive: {
        isBaseline: true,
        baselinePriority: 1,
        correlatedTraits: ['openness', 'extraversion'],
        diagnosticWeight: 3,
        difficultyLevel: 2,
        adaptiveCriteria: {
          triggerTraits: [],
          triggerPatterns: ['high_openness', 'creative_thinking'],
          followUpTo: [],
          incompatibleWith: [],
          requiredPrior: []
        }
      }
    },
    {
      questionId: 'BASELINE_OPENNESS_2',
      text: 'I get excited when someone recommends music from a genre I\'ve never explored.',
      category: 'personality',
      instrument: 'BFI-2-Improved',
      trait: 'openness',
      responseType: 'likert',
      reverseScored: false,
      tier: 'core',
      tags: ['baseline', 'validated'],
      adaptive: {
        isBaseline: true,
        baselinePriority: 2,
        correlatedTraits: ['openness'],
        diagnosticWeight: 3,
        difficultyLevel: 2,
        adaptiveCriteria: {
          triggerTraits: [],
          triggerPatterns: ['high_openness', 'aesthetic_sensitivity'],
          followUpTo: [],
          incompatibleWith: [],
          requiredPrior: []
        }
      }
    },

    // CONSCIENTIOUSNESS (2 questions)
    {
      questionId: 'BASELINE_CONSCIENTIOUSNESS_1',
      text: 'My workspace naturally stays organized without much effort on my part.',
      category: 'personality',
      instrument: 'BFI-2-Improved',
      trait: 'conscientiousness',
      responseType: 'likert',
      reverseScored: false,
      tier: 'core',
      tags: ['baseline', 'validated'],
      adaptive: {
        isBaseline: true,
        baselinePriority: 1,
        correlatedTraits: ['conscientiousness'],
        diagnosticWeight: 3,
        difficultyLevel: 2,
        adaptiveCriteria: {
          triggerTraits: [],
          triggerPatterns: ['high_conscientiousness', 'organized'],
          followUpTo: [],
          incompatibleWith: [],
          requiredPrior: []
        }
      }
    },
    {
      questionId: 'BASELINE_CONSCIENTIOUSNESS_2',
      text: 'I often start projects with enthusiasm but struggle to complete them.',
      category: 'personality',
      instrument: 'BFI-2-Improved',
      trait: 'conscientiousness',
      responseType: 'likert',
      reverseScored: true,
      tier: 'core',
      tags: ['baseline', 'validated'],
      adaptive: {
        isBaseline: true,
        baselinePriority: 2,
        correlatedTraits: ['conscientiousness'],
        diagnosticWeight: 3,
        difficultyLevel: 2,
        adaptiveCriteria: {
          triggerTraits: [],
          triggerPatterns: ['low_conscientiousness', 'completion_issues'],
          followUpTo: [],
          incompatibleWith: [],
          requiredPrior: []
        }
      }
    },

    // EXTRAVERSION (2 questions)
    {
      questionId: 'BASELINE_EXTRAVERSION_1',
      text: 'After a long week, a crowded party sounds perfect to me.',
      category: 'personality',
      instrument: 'BFI-2-Improved',
      trait: 'extraversion',
      responseType: 'likert',
      reverseScored: false,
      tier: 'core',
      tags: ['baseline', 'validated'],
      adaptive: {
        isBaseline: true,
        baselinePriority: 1,
        correlatedTraits: ['extraversion'],
        diagnosticWeight: 3,
        difficultyLevel: 2,
        adaptiveCriteria: {
          triggerTraits: [],
          triggerPatterns: ['high_extraversion', 'social_energy'],
          followUpTo: [],
          incompatibleWith: [],
          requiredPrior: []
        }
      }
    },
    {
      questionId: 'BASELINE_EXTRAVERSION_2',
      text: 'I need alone time to recharge after social events.',
      category: 'personality',
      instrument: 'BFI-2-Improved',
      trait: 'extraversion',
      responseType: 'likert',
      reverseScored: true,
      tier: 'core',
      tags: ['baseline', 'validated'],
      adaptive: {
        isBaseline: true,
        baselinePriority: 2,
        correlatedTraits: ['extraversion'],
        diagnosticWeight: 3,
        difficultyLevel: 2,
        adaptiveCriteria: {
          triggerTraits: [],
          triggerPatterns: ['low_extraversion', 'introversion'],
          followUpTo: [],
          incompatibleWith: [],
          requiredPrior: []
        }
      }
    },

    // AGREEABLENESS (2 questions)
    {
      questionId: 'BASELINE_AGREEABLENESS_1',
      text: 'I find it satisfying when someone who wronged me faces consequences.',
      category: 'personality',
      instrument: 'BFI-2-Improved',
      trait: 'agreeableness',
      responseType: 'likert',
      reverseScored: true,
      tier: 'core',
      tags: ['baseline', 'validated'],
      adaptive: {
        isBaseline: true,
        baselinePriority: 1,
        correlatedTraits: ['agreeableness'],
        diagnosticWeight: 3,
        difficultyLevel: 3,
        adaptiveCriteria: {
          triggerTraits: [],
          triggerPatterns: ['low_agreeableness', 'competitive'],
          followUpTo: [],
          incompatibleWith: [],
          requiredPrior: []
        }
      }
    },
    {
      questionId: 'BASELINE_AGREEABLENESS_2',
      text: 'I instinctively trust people until they prove otherwise.',
      category: 'personality',
      instrument: 'BFI-2-Improved',
      trait: 'agreeableness',
      responseType: 'likert',
      reverseScored: false,
      tier: 'core',
      tags: ['baseline', 'validated'],
      adaptive: {
        isBaseline: true,
        baselinePriority: 2,
        correlatedTraits: ['agreeableness'],
        diagnosticWeight: 3,
        difficultyLevel: 2,
        adaptiveCriteria: {
          triggerTraits: [],
          triggerPatterns: ['high_agreeableness', 'trusting'],
          followUpTo: [],
          incompatibleWith: [],
          requiredPrior: []
        }
      }
    },

    // NEUROTICISM (2 questions) - CRITICAL: Was missing from baseline
    {
      questionId: 'BASELINE_NEUROTICISM_1',
      text: 'Once I\'m upset, it takes me a long time to calm down.',
      category: 'personality',
      instrument: 'BFI-2-Improved',
      trait: 'neuroticism',
      responseType: 'likert',
      reverseScored: false,
      tier: 'core',
      tags: ['baseline', 'validated', 'emotional_regulation'],
      adaptive: {
        isBaseline: true,
        baselinePriority: 1,
        correlatedTraits: ['neuroticism'],
        diagnosticWeight: 3,
        difficultyLevel: 2,
        adaptiveCriteria: {
          triggerTraits: [],
          triggerPatterns: ['high_neuroticism', 'emotional_intensity'],
          followUpTo: [],
          incompatibleWith: [],
          requiredPrior: []
        }
      }
    },
    {
      questionId: 'BASELINE_NEUROTICISM_2',
      text: 'I rarely feel anxious even when facing important decisions.',
      category: 'personality',
      instrument: 'BFI-2-Improved',
      trait: 'neuroticism',
      responseType: 'likert',
      reverseScored: true,
      tier: 'core',
      tags: ['baseline', 'validated'],
      adaptive: {
        isBaseline: true,
        baselinePriority: 2,
        correlatedTraits: ['neuroticism'],
        diagnosticWeight: 3,
        difficultyLevel: 2,
        adaptiveCriteria: {
          triggerTraits: [],
          triggerPatterns: ['low_neuroticism', 'emotional_stability'],
          followUpTo: [],
          incompatibleWith: [],
          requiredPrior: []
        }
      }
    }
  ],

  // 10 NEURODIVERSITY SCREENING (balanced across domains)
  neurodiversity: [
    // EXECUTIVE FUNCTION (3 questions)
    {
      questionId: 'BASELINE_EF_1',
      text: 'I start tasks right away rather than procrastinating.',
      category: 'neurodiversity',
      instrument: 'NEURLYN_EXECUTIVE',
      subcategory: 'executive_function',
      efDomain: 'taskInitiation',
      responseType: 'likert',
      reverseScored: false,
      tier: 'core',
      tags: ['baseline', 'adhd', 'executive_function'],
      adaptive: {
        isBaseline: true,
        baselinePriority: 3,
        correlatedTraits: ['conscientiousness'],
        diagnosticWeight: 3,
        difficultyLevel: 2,
        adaptiveCriteria: {
          triggerTraits: [],
          triggerPatterns: ['adhd_indicators', 'executive_dysfunction'],
          followUpTo: [],
          incompatibleWith: [],
          requiredPrior: []
        }
      }
    },
    {
      questionId: 'BASELINE_EF_2',
      text: 'I underestimate how long tasks will take.',
      category: 'neurodiversity',
      instrument: 'NEURLYN_EXECUTIVE',
      subcategory: 'executive_function',
      efDomain: 'timeManagement',
      responseType: 'likert',
      reverseScored: false,
      tier: 'core',
      tags: ['baseline', 'adhd', 'executive_function'],
      adaptive: {
        isBaseline: true,
        baselinePriority: 4,
        correlatedTraits: ['conscientiousness'],
        diagnosticWeight: 3,
        difficultyLevel: 2,
        adaptiveCriteria: {
          triggerTraits: [],
          triggerPatterns: ['adhd_indicators', 'time_blindness'],
          followUpTo: [],
          incompatibleWith: [],
          requiredPrior: []
        }
      }
    },
    {
      questionId: 'BASELINE_EF_3',
      text: 'I can easily switch between different tasks without losing focus.',
      category: 'neurodiversity',
      instrument: 'NEURLYN_EXECUTIVE',
      subcategory: 'executive_function',
      efDomain: 'flexibility',
      responseType: 'likert',
      reverseScored: false,
      tier: 'core',
      tags: ['baseline', 'adhd', 'executive_function'],
      adaptive: {
        isBaseline: true,
        baselinePriority: 5,
        correlatedTraits: ['conscientiousness', 'neuroticism'],
        diagnosticWeight: 3,
        difficultyLevel: 2,
        adaptiveCriteria: {
          triggerTraits: [],
          triggerPatterns: ['adhd_indicators', 'flexibility_issues'],
          followUpTo: [],
          incompatibleWith: [],
          requiredPrior: []
        }
      }
    },

    // SENSORY PROCESSING (3 questions)
    {
      questionId: 'BASELINE_SENSORY_1',
      text: 'I find crowded or noisy environments overwhelming.',
      category: 'neurodiversity',
      instrument: 'NEURLYN_SENSORY',
      subcategory: 'sensory_processing',
      sensoryDomain: 'auditory',
      responseType: 'likert',
      reverseScored: false,
      tier: 'core',
      tags: ['baseline', 'autism', 'sensory', 'gateway'],
      adaptive: {
        isBaseline: true,
        baselinePriority: 3,
        correlatedTraits: ['neuroticism', 'extraversion'],
        diagnosticWeight: 3,
        difficultyLevel: 2,
        adaptiveCriteria: {
          triggerTraits: [],
          triggerPatterns: ['autism_indicators', 'sensory_sensitivity'],
          followUpTo: [],
          incompatibleWith: [],
          requiredPrior: []
        }
      }
    },
    {
      questionId: 'BASELINE_SENSORY_2',
      text: 'Certain textures or fabrics feel unbearable against my skin.',
      category: 'neurodiversity',
      instrument: 'NEURLYN_SENSORY',
      subcategory: 'sensory_processing',
      sensoryDomain: 'tactile',
      responseType: 'likert',
      reverseScored: false,
      tier: 'core',
      tags: ['baseline', 'autism', 'sensory'],
      adaptive: {
        isBaseline: true,
        baselinePriority: 4,
        correlatedTraits: ['neuroticism'],
        diagnosticWeight: 3,
        difficultyLevel: 2,
        adaptiveCriteria: {
          triggerTraits: [],
          triggerPatterns: ['autism_indicators', 'tactile_sensitivity'],
          followUpTo: [],
          incompatibleWith: [],
          requiredPrior: []
        }
      }
    },
    {
      questionId: 'BASELINE_SENSORY_3',
      text: 'I notice small details in my environment that others seem to miss.',
      category: 'neurodiversity',
      instrument: 'NEURLYN_SENSORY',
      subcategory: 'sensory_processing',
      sensoryDomain: 'visual',
      responseType: 'likert',
      reverseScored: false,
      tier: 'core',
      tags: ['baseline', 'autism', 'sensory'],
      adaptive: {
        isBaseline: true,
        baselinePriority: 5,
        correlatedTraits: ['openness'],
        diagnosticWeight: 2,
        difficultyLevel: 2,
        adaptiveCriteria: {
          triggerTraits: [],
          triggerPatterns: ['autism_indicators', 'attention_to_detail'],
          followUpTo: [],
          incompatibleWith: [],
          requiredPrior: []
        }
      }
    },

    // EMOTIONAL REGULATION (2 questions) - CRITICAL: Was underrepresented
    {
      questionId: 'BASELINE_EMOTIONAL_REG_1',
      text: 'My emotions can shift rapidly from one extreme to another.',
      category: 'neurodiversity',
      instrument: 'NEURLYN_EMOTIONAL',
      subcategory: 'emotional_regulation',
      efDomain: 'emotionalRegulation',
      responseType: 'likert',
      reverseScored: false,
      tier: 'core',
      tags: ['baseline', 'adhd', 'emotional_regulation'],
      adaptive: {
        isBaseline: true,
        baselinePriority: 6,
        correlatedTraits: ['neuroticism'],
        diagnosticWeight: 3,
        difficultyLevel: 2,
        adaptiveCriteria: {
          triggerTraits: [],
          triggerPatterns: ['adhd_indicators', 'emotional_dysregulation'],
          followUpTo: [],
          incompatibleWith: [],
          requiredPrior: []
        }
      }
    },
    {
      questionId: 'BASELINE_EMOTIONAL_REG_2',
      text: 'I can usually calm myself down when I start feeling overwhelmed.',
      category: 'neurodiversity',
      instrument: 'NEURLYN_EMOTIONAL',
      subcategory: 'emotional_regulation',
      efDomain: 'emotionalRegulation',
      responseType: 'likert',
      reverseScored: false,
      tier: 'core',
      tags: ['baseline', 'emotional_regulation'],
      adaptive: {
        isBaseline: true,
        baselinePriority: 7,
        correlatedTraits: ['neuroticism', 'conscientiousness'],
        diagnosticWeight: 2,
        difficultyLevel: 2,
        adaptiveCriteria: {
          triggerTraits: [],
          triggerPatterns: ['emotional_regulation_strength'],
          followUpTo: [],
          incompatibleWith: [],
          requiredPrior: []
        }
      }
    },

    // SOCIAL COMMUNICATION (2 questions)
    {
      questionId: 'BASELINE_SOCIAL_1',
      text: 'I find it difficult to understand unwritten social rules.',
      category: 'neurodiversity',
      instrument: 'AQ-10',
      subcategory: 'social_interaction',
      responseType: 'likert',
      reverseScored: false,
      tier: 'core',
      tags: ['baseline', 'autism', 'social'],
      adaptive: {
        isBaseline: true,
        baselinePriority: 6,
        correlatedTraits: ['extraversion', 'agreeableness'],
        diagnosticWeight: 3,
        difficultyLevel: 2,
        adaptiveCriteria: {
          triggerTraits: [],
          triggerPatterns: ['autism_indicators', 'social_difficulty'],
          followUpTo: [],
          incompatibleWith: [],
          requiredPrior: []
        }
      }
    },
    {
      questionId: 'BASELINE_SOCIAL_2',
      text: 'I prefer activities I can do alone rather than group activities.',
      category: 'neurodiversity',
      instrument: 'AQ-10',
      subcategory: 'social_interaction',
      responseType: 'likert',
      reverseScored: false,
      tier: 'core',
      tags: ['baseline', 'autism', 'social'],
      adaptive: {
        isBaseline: true,
        baselinePriority: 7,
        correlatedTraits: ['extraversion'],
        diagnosticWeight: 2,
        difficultyLevel: 2,
        adaptiveCriteria: {
          triggerTraits: [],
          triggerPatterns: ['autism_indicators', 'social_preference'],
          followUpTo: [],
          incompatibleWith: [],
          requiredPrior: []
        }
      }
    }
  ]
};

// ============================================================================
// PART 2: NEO-PI-R FACET QUESTIONS (90 total - 3 per facet)
// ============================================================================

const neoFacetQuestions = [];

// Helper to create facet question
function createFacetQuestion(idNum, trait, facet, text, reverseScored = false) {
  return {
    questionId: `NEO_FACET_${idNum}`,
    text,
    category: 'personality',
    instrument: 'NEO-PI-R',
    trait,
    facet,
    responseType: 'likert',
    reverseScored,
    tier: 'comprehensive',
    tags: ['facet', 'neo', 'validated'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: [trait],
      diagnosticWeight: 2,
      difficultyLevel: 3,
      adaptiveCriteria: {
        triggerTraits: [{
          trait,
          minScore: 30,
          maxScore: 70
        }],
        triggerPatterns: [`high_${facet}`, `low_${facet}`],
        followUpTo: [],
        incompatibleWith: [],
        requiredPrior: []
      }
    }
  };
}

// OPENNESS facets
neoFacetQuestions.push(
  // Fantasy (3)
  createFacetQuestion(1001, 'openness', 'fantasy', 'I often get lost in my own imaginary worlds and daydreams.'),
  createFacetQuestion(1002, 'openness', 'fantasy', 'I prefer to focus on reality rather than dwelling on fantasies.', true),
  createFacetQuestion(1003, 'openness', 'fantasy', 'My imagination often takes me to places far from the everyday world.'),

  // Aesthetics (3)
  createFacetQuestion(1004, 'openness', 'aesthetics', 'I am deeply moved by the beauty I find in art, nature, or poetry.'),
  createFacetQuestion(1005, 'openness', 'aesthetics', 'Art and beauty don\'t play a major role in my life.', true),
  createFacetQuestion(1006, 'openness', 'aesthetics', 'I often notice and appreciate subtle patterns, colors, or designs that others might miss.'),

  // Feelings (3)
  createFacetQuestion(1007, 'openness', 'feelings', 'I experience my emotions intensely and value emotional experiences.'),
  createFacetQuestion(1008, 'openness', 'feelings', 'I tend to keep my emotions under control and don\'t dwell on feelings.', true),
  createFacetQuestion(1009, 'openness', 'feelings', 'I believe it\'s important to fully experience both positive and negative emotions.'),

  // Actions (3)
  createFacetQuestion(1010, 'openness', 'actions', 'I enjoy trying new activities and experiencing different ways of doing things.'),
  createFacetQuestion(1011, 'openness', 'actions', 'I prefer familiar routines and am uncomfortable with too much change.', true),
  createFacetQuestion(1012, 'openness', 'actions', 'I actively seek out new experiences and adventures.'),

  // Ideas (3)
  createFacetQuestion(1013, 'openness', 'ideas', 'I enjoy philosophical discussions and exploring abstract concepts.'),
  createFacetQuestion(1014, 'openness', 'ideas', 'I prefer practical matters over theoretical or philosophical discussions.', true),
  createFacetQuestion(1015, 'openness', 'ideas', 'I\'m intellectually curious and enjoy learning for its own sake.'),

  // Values (3)
  createFacetQuestion(1016, 'openness', 'values', 'I often question traditional values and social conventions.'),
  createFacetQuestion(1017, 'openness', 'values', 'I believe strongly in maintaining traditional values and ways of doing things.', true),
  createFacetQuestion(1018, 'openness', 'values', 'I\'m open to reconsidering my beliefs when presented with new information.')
);

// CONSCIENTIOUSNESS facets
neoFacetQuestions.push(
  // Competence (3)
  createFacetQuestion(1019, 'conscientiousness', 'competence', 'I feel capable and effective in what I do.'),
  createFacetQuestion(1020, 'conscientiousness', 'competence', 'I often doubt my ability to achieve my goals.', true),
  createFacetQuestion(1021, 'conscientiousness', 'competence', 'I handle most situations competently and make good decisions.'),

  // Order (3)
  createFacetQuestion(1022, 'conscientiousness', 'order', 'I keep my living and working spaces neat and organized.'),
  createFacetQuestion(1023, 'conscientiousness', 'order', 'I don\'t mind clutter and often leave things where I last used them.', true),
  createFacetQuestion(1024, 'conscientiousness', 'order', 'I have systems and routines for keeping things organized.'),

  // Dutifulness (3)
  createFacetQuestion(1025, 'conscientiousness', 'dutifulness', 'I always follow through on my commitments, even when inconvenient.'),
  createFacetQuestion(1026, 'conscientiousness', 'dutifulness', 'I sometimes break rules or commitments if they seem unreasonable.', true),
  createFacetQuestion(1027, 'conscientiousness', 'dutifulness', 'I have a strong sense of moral obligation and duty.'),

  // Achievement Striving (3)
  createFacetQuestion(1028, 'conscientiousness', 'achievement_striving', 'I set high standards for myself and work hard to achieve them.'),
  createFacetQuestion(1029, 'conscientiousness', 'achievement_striving', 'I\'m content with moderate success and don\'t push myself too hard.', true),
  createFacetQuestion(1030, 'conscientiousness', 'achievement_striving', 'I\'m driven to excel and often go above and beyond what\'s expected.'),

  // Self-Discipline (3)
  createFacetQuestion(1031, 'conscientiousness', 'self_discipline', 'I can stick with difficult tasks until they\'re completed.'),
  createFacetQuestion(1032, 'conscientiousness', 'self_discipline', 'I often get distracted and have trouble finishing what I start.', true),
  createFacetQuestion(1033, 'conscientiousness', 'self_discipline', 'I have strong willpower and can resist temptations when necessary.'),

  // Deliberation (3)
  createFacetQuestion(1034, 'conscientiousness', 'deliberation', 'I carefully think through decisions before acting.'),
  createFacetQuestion(1035, 'conscientiousness', 'deliberation', 'I often act on impulse without considering consequences.', true),
  createFacetQuestion(1036, 'conscientiousness', 'deliberation', 'I consider all options and potential outcomes before making choices.')
);

// EXTRAVERSION facets
neoFacetQuestions.push(
  // Warmth (3)
  createFacetQuestion(1037, 'extraversion', 'warmth', 'I genuinely enjoy connecting with people and showing affection.'),
  createFacetQuestion(1038, 'extraversion', 'warmth', 'I prefer to maintain emotional distance in most relationships.', true),
  createFacetQuestion(1039, 'extraversion', 'warmth', 'I find it easy to express warmth and friendliness toward others.'),

  // Gregariousness (3)
  createFacetQuestion(1040, 'extraversion', 'gregariousness', 'I love being part of large groups and social gatherings.'),
  createFacetQuestion(1041, 'extraversion', 'gregariousness', 'I prefer one-on-one interactions over group settings.', true),
  createFacetQuestion(1042, 'extraversion', 'gregariousness', 'The more people at an event, the more fun I have.'),

  // Assertiveness (3)
  createFacetQuestion(1043, 'extraversion', 'assertiveness', 'I naturally take charge in group situations.'),
  createFacetQuestion(1044, 'extraversion', 'assertiveness', 'I\'m uncomfortable being the leader or making decisions for others.', true),
  createFacetQuestion(1045, 'extraversion', 'assertiveness', 'I speak up confidently to express my opinions.'),

  // Activity (3)
  createFacetQuestion(1046, 'extraversion', 'activity', 'I maintain a fast pace and stay busy throughout the day.'),
  createFacetQuestion(1047, 'extraversion', 'activity', 'I prefer a slow, relaxed pace of life.', true),
  createFacetQuestion(1048, 'extraversion', 'activity', 'I have high energy levels and am always on the go.'),

  // Excitement Seeking (3)
  createFacetQuestion(1049, 'extraversion', 'excitement_seeking', 'I love thrilling experiences and taking risks.'),
  createFacetQuestion(1050, 'extraversion', 'excitement_seeking', 'I avoid risky or overly stimulating activities.', true),
  createFacetQuestion(1051, 'extraversion', 'excitement_seeking', 'I actively seek out adventure and excitement.'),

  // Positive Emotions (3)
  createFacetQuestion(1052, 'extraversion', 'positive_emotions', 'I frequently experience joy and enthusiasm.'),
  createFacetQuestion(1053, 'extraversion', 'positive_emotions', 'I rarely feel excited or exuberant.', true),
  createFacetQuestion(1054, 'extraversion', 'positive_emotions', 'My mood tends to be upbeat and optimistic.')
);

// AGREEABLENESS facets
neoFacetQuestions.push(
  // Trust (3)
  createFacetQuestion(1055, 'agreeableness', 'trust', 'I believe most people are fundamentally good and well-intentioned.'),
  createFacetQuestion(1056, 'agreeableness', 'trust', 'I\'m skeptical of others\' motives until they prove trustworthy.', true),
  createFacetQuestion(1057, 'agreeableness', 'trust', 'I assume the best about people until proven otherwise.'),

  // Straightforwardness (3)
  createFacetQuestion(1058, 'agreeableness', 'straightforwardness', 'I am frank, sincere, and straightforward with others.'),
  createFacetQuestion(1059, 'agreeableness', 'straightforwardness', 'I sometimes manipulate situations to get what I want.', true),
  createFacetQuestion(1060, 'agreeableness', 'straightforwardness', 'I believe in being completely honest even when it\'s uncomfortable.'),

  // Altruism (3)
  createFacetQuestion(1061, 'agreeableness', 'altruism', 'I genuinely enjoy helping others and contributing to their welfare.'),
  createFacetQuestion(1062, 'agreeableness', 'altruism', 'I prefer to focus on my own needs rather than helping others.', true),
  createFacetQuestion(1063, 'agreeableness', 'altruism', 'I go out of my way to help people in need.'),

  // Compliance (3)
  createFacetQuestion(1064, 'agreeableness', 'compliance', 'I prefer to cooperate rather than compete with others.'),
  createFacetQuestion(1065, 'agreeableness', 'compliance', 'I can be aggressive and confrontational when challenged.', true),
  createFacetQuestion(1066, 'agreeableness', 'compliance', 'I try to avoid conflicts and find peaceful solutions.'),

  // Modesty (3)
  createFacetQuestion(1067, 'agreeableness', 'modesty', 'I\'m uncomfortable being the center of attention or boasting about achievements.'),
  createFacetQuestion(1068, 'agreeableness', 'modesty', 'I don\'t mind talking about my accomplishments and abilities.', true),
  createFacetQuestion(1069, 'agreeableness', 'modesty', 'I prefer to let my actions speak rather than promoting myself.'),

  // Tender-mindedness (3)
  createFacetQuestion(1070, 'agreeableness', 'tender_mindedness', 'I\'m easily moved by others\' needs and feel sympathy for those less fortunate.'),
  createFacetQuestion(1071, 'agreeableness', 'tender_mindedness', 'I make decisions based on logic rather than sympathy.', true),
  createFacetQuestion(1072, 'agreeableness', 'tender_mindedness', 'I have a soft heart and am affected by others\' emotions.')
);

// NEUROTICISM facets
neoFacetQuestions.push(
  // Anxiety (3)
  createFacetQuestion(1073, 'neuroticism', 'anxiety', 'I frequently worry about things that might go wrong.'),
  createFacetQuestion(1074, 'neuroticism', 'anxiety', 'I rarely feel anxious or worried about the future.', true),
  createFacetQuestion(1075, 'neuroticism', 'anxiety', 'I often feel tense and on edge.'),

  // Angry Hostility (3)
  createFacetQuestion(1076, 'neuroticism', 'angry_hostility', 'I get angry and frustrated easily when things don\'t go my way.'),
  createFacetQuestion(1077, 'neuroticism', 'angry_hostility', 'I rarely feel angry even in frustrating situations.', true),
  createFacetQuestion(1078, 'neuroticism', 'angry_hostility', 'I have a quick temper and can be irritable.'),

  // Depression (3)
  createFacetQuestion(1079, 'neuroticism', 'depression', 'I often feel sad, hopeless, or discouraged.'),
  createFacetQuestion(1080, 'neuroticism', 'depression', 'I rarely experience feelings of sadness or depression.', true),
  createFacetQuestion(1081, 'neuroticism', 'depression', 'I tend to see the negative side of situations.'),

  // Self-consciousness (3)
  createFacetQuestion(1082, 'neuroticism', 'self_consciousness', 'I feel uncomfortable and self-conscious in social situations.'),
  createFacetQuestion(1083, 'neuroticism', 'self_consciousness', 'I\'m comfortable being myself regardless of what others think.', true),
  createFacetQuestion(1084, 'neuroticism', 'self_consciousness', 'I worry about how others perceive me.'),

  // Impulsiveness (3)
  createFacetQuestion(1085, 'neuroticism', 'impulsiveness', 'I have trouble resisting cravings and urges.'),
  createFacetQuestion(1086, 'neuroticism', 'impulsiveness', 'I have strong self-control over my desires and impulses.', true),
  createFacetQuestion(1087, 'neuroticism', 'impulsiveness', 'I often do things I later regret in the heat of the moment.'),

  // Vulnerability (3)
  createFacetQuestion(1088, 'neuroticism', 'vulnerability', 'I feel overwhelmed and unable to cope when under pressure.'),
  createFacetQuestion(1089, 'neuroticism', 'vulnerability', 'I handle stress well and remain calm under pressure.', true),
  createFacetQuestion(1090, 'neuroticism', 'vulnerability', 'I panic easily when faced with stressful situations.')
);

// ============================================================================
// SEEDING FUNCTION
// ============================================================================

async function seedDatabase() {
  try {
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected successfully');

    // Clear existing questions
    logger.info('Clearing existing questions...');
    await QuestionBank.deleteMany({});

    // Combine all baseline questions
    const allBaseline = [
      ...baselineQuestions.personality,
      ...baselineQuestions.neurodiversity
    ];

    logger.info(`Inserting ${allBaseline.length} baseline questions...`);
    await QuestionBank.insertMany(allBaseline);
    logger.info(`✅ ${allBaseline.length} baseline questions inserted`);

    logger.info(`Inserting ${neoFacetQuestions.length} NEO facet questions...`);
    await QuestionBank.insertMany(neoFacetQuestions);
    logger.info(`✅ ${neoFacetQuestions.length} NEO facet questions inserted`);

    // Verification
    logger.info('\n=== VERIFICATION ===');

    const totalCount = await QuestionBank.countDocuments();
    logger.info(`Total questions in database: ${totalCount}`);

    const baselineCount = await QuestionBank.countDocuments({ 'adaptive.isBaseline': true });
    logger.info(`Baseline questions: ${baselineCount}`);

    const facetCount = await QuestionBank.countDocuments({ facet: { $exists: true, $ne: null } });
    logger.info(`NEO facet questions: ${facetCount}`);

    // Verify baseline distribution
    logger.info('\n=== BASELINE DISTRIBUTION ===');
    const baselineByTrait = await QuestionBank.aggregate([
      { $match: { 'adaptive.isBaseline': true, category: 'personality' } },
      { $group: { _id: '$trait', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    logger.info('Personality baseline by trait:');
    baselineByTrait.forEach(t => logger.info(`  ${t._id}: ${t.count}`));

    const baselineBySubcat = await QuestionBank.aggregate([
      { $match: { 'adaptive.isBaseline': true, category: 'neurodiversity' } },
      { $group: { _id: '$subcategory', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    logger.info('\nNeurodiversity baseline by subcategory:');
    baselineBySubcat.forEach(s => logger.info(`  ${s._id}: ${s.count}`));

    // Verify facet distribution
    logger.info('\n=== FACET DISTRIBUTION ===');
    const facetsByTrait = await QuestionBank.aggregate([
      { $match: { facet: { $exists: true, $ne: null } } },
      { $group: { _id: '$trait', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    facetsByTrait.forEach(t => logger.info(`  ${t._id}: ${t.count} facet questions`));

    logger.info('\n✅ DATABASE SEEDING COMPLETED SUCCESSFULLY');
    logger.info(`Total: ${totalCount} questions | Baseline: ${baselineCount} | Facets: ${facetCount}`);

  } catch (error) {
    logger.error('Seeding failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

// Run seeding
seedDatabase();
