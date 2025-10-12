#!/usr/bin/env node

/**
 * Phase 1 Clinical Assessment Questions Seeder
 *
 * Seeds comprehensive clinical psychopathology and validity scale questions:
 * - Validity Scales (30-35 questions)
 * - Depression Assessment (15-20 questions) - PHQ-9 based
 * - Suicidal Ideation Screening (5-8 questions)
 * - Anxiety Disorders (20-25 questions) - GAD-7, panic, social, OCD, PTSD
 * - Substance Use Screening (10-15 questions)
 * - Clinical Baseline Screening (5 questions)
 *
 * Total: ~90-110 questions
 */

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
const logger = require('../utils/logger');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

// ============================================================================
// PART 1: VALIDITY SCALES (30-35 questions)
// ============================================================================

const validityScaleQuestions = [
  // INCONSISTENCY PAIRS (20 questions = 10 pairs)
  // Pair 1: Calmness
  {
    questionId: 'VALIDITY_INCONS_1A',
    text: 'I remain calm in stressful situations.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'inconsistency',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['validity', 'validity_inconsistency', 'pair_1'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 1,
      difficultyLevel: 2
    }
  },
  {
    questionId: 'VALIDITY_INCONS_1B',
    text: 'I often feel overwhelmed when things get stressful.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'inconsistency',
    responseType: 'likert',
    reverseScored: true,
    tier: 'comprehensive',
    tags: ['validity', 'validity_inconsistency', 'pair_1_opposite'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 1,
      difficultyLevel: 2
    }
  },

  // Pair 2: Social preference
  {
    questionId: 'VALIDITY_INCONS_2A',
    text: 'I enjoy spending time with large groups of people.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'inconsistency',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['validity', 'validity_inconsistency', 'pair_2'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 1
    }
  },
  {
    questionId: 'VALIDITY_INCONS_2B',
    text: 'I prefer to avoid social gatherings whenever possible.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'inconsistency',
    responseType: 'likert',
    reverseScored: true,
    tier: 'comprehensive',
    tags: ['validity', 'validity_inconsistency', 'pair_2_opposite'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 1
    }
  },

  // Pair 3: Energy level
  {
    questionId: 'VALIDITY_INCONS_3A',
    text: 'I have plenty of energy to get through the day.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'inconsistency',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['validity', 'validity_inconsistency', 'pair_3'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 1
    }
  },
  {
    questionId: 'VALIDITY_INCONS_3B',
    text: 'I frequently feel tired and lacking in energy.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'inconsistency',
    responseType: 'likert',
    reverseScored: true,
    tier: 'comprehensive',
    tags: ['validity', 'validity_inconsistency', 'pair_3_opposite'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 1
    }
  },

  // Pair 4: Worry tendency
  {
    questionId: 'VALIDITY_INCONS_4A',
    text: 'I rarely worry about things.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'inconsistency',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['validity', 'validity_inconsistency', 'pair_4'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 1
    }
  },
  {
    questionId: 'VALIDITY_INCONS_4B',
    text: 'I find myself worrying about many different things throughout the day.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'inconsistency',
    responseType: 'likert',
    reverseScored: true,
    tier: 'comprehensive',
    tags: ['validity', 'validity_inconsistency', 'pair_4_opposite'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 1
    }
  },

  // Pair 5: Mood stability
  {
    questionId: 'VALIDITY_INCONS_5A',
    text: 'My mood stays pretty stable from day to day.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'inconsistency',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['validity', 'validity_inconsistency', 'pair_5'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 1
    }
  },
  {
    questionId: 'VALIDITY_INCONS_5B',
    text: 'My mood changes frequently and unpredictably.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'inconsistency',
    responseType: 'likert',
    reverseScored: true,
    tier: 'comprehensive',
    tags: ['validity', 'validity_inconsistency', 'pair_5_opposite'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 1
    }
  },

  // Pair 6: Organization
  {
    questionId: 'VALIDITY_INCONS_6A',
    text: 'I am very organized in my daily life.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'inconsistency',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['validity', 'validity_inconsistency', 'pair_6'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 1
    }
  },
  {
    questionId: 'VALIDITY_INCONS_6B',
    text: 'I often lose track of things and feel disorganized.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'inconsistency',
    responseType: 'likert',
    reverseScored: true,
    tier: 'comprehensive',
    tags: ['validity', 'validity_inconsistency', 'pair_6_opposite'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 1
    }
  },

  // Pair 7: Confidence
  {
    questionId: 'VALIDITY_INCONS_7A',
    text: 'I feel confident in my abilities.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'inconsistency',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['validity', 'validity_inconsistency', 'pair_7'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 1
    }
  },
  {
    questionId: 'VALIDITY_INCONS_7B',
    text: 'I often doubt my capabilities and feel inadequate.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'inconsistency',
    responseType: 'likert',
    reverseScored: true,
    tier: 'comprehensive',
    tags: ['validity', 'validity_inconsistency', 'pair_7_opposite'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 1
    }
  },

  // Pair 8: Sleep quality
  {
    questionId: 'VALIDITY_INCONS_8A',
    text: 'I sleep well most nights.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'inconsistency',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['validity', 'validity_inconsistency', 'pair_8'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 1
    }
  },
  {
    questionId: 'VALIDITY_INCONS_8B',
    text: 'I have difficulty falling or staying asleep.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'inconsistency',
    responseType: 'likert',
    reverseScored: true,
    tier: 'comprehensive',
    tags: ['validity', 'validity_inconsistency', 'pair_8_opposite'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 1
    }
  },

  // Pair 9: Anger
  {
    questionId: 'VALIDITY_INCONS_9A',
    text: 'I rarely feel angry or irritated.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'inconsistency',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['validity', 'validity_inconsistency', 'pair_9'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 1
    }
  },
  {
    questionId: 'VALIDITY_INCONS_9B',
    text: 'I become easily annoyed or frustrated.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'inconsistency',
    responseType: 'likert',
    reverseScored: true,
    tier: 'comprehensive',
    tags: ['validity', 'validity_inconsistency', 'pair_9_opposite'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 1
    }
  },

  // Pair 10: Concentration
  {
    questionId: 'VALIDITY_INCONS_10A',
    text: 'I can concentrate well on tasks.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'inconsistency',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['validity', 'validity_inconsistency', 'pair_10'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 1
    }
  },
  {
    questionId: 'VALIDITY_INCONS_10B',
    text: 'I have trouble focusing and my mind wanders frequently.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'inconsistency',
    responseType: 'likert',
    reverseScored: true,
    tier: 'comprehensive',
    tags: ['validity', 'validity_inconsistency', 'pair_10_opposite'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 1
    }
  },

  // INFREQUENCY ITEMS (6 questions) - Rarely endorsed statements
  {
    questionId: 'VALIDITY_INFREQ_1',
    text: 'I have never felt sad or disappointed.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'infrequency',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['validity', 'validity_infrequency'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 2
    }
  },
  {
    questionId: 'VALIDITY_INFREQ_2',
    text: 'I can read other people\'s minds.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'infrequency',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['validity', 'validity_infrequency'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 2
    }
  },
  {
    questionId: 'VALIDITY_INFREQ_3',
    text: 'I have experienced severe hallucinations every single day of my life.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'infrequency',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['validity', 'validity_infrequency'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 2
    }
  },
  {
    questionId: 'VALIDITY_INFREQ_4',
    text: 'Everything I have ever done has been perfect.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'infrequency',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['validity', 'validity_infrequency'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 2
    }
  },
  {
    questionId: 'VALIDITY_INFREQ_5',
    text: 'I hear voices that other people cannot hear constantly throughout the day.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'infrequency',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['validity', 'validity_infrequency'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 2
    }
  },
  {
    questionId: 'VALIDITY_INFREQ_6',
    text: 'I have never made a single mistake in my entire life.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'infrequency',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['validity', 'validity_infrequency'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 2
    }
  },

  // POSITIVE IMPRESSION (8 questions) - "Faking good"
  {
    questionId: 'VALIDITY_POS_IMP_1',
    text: 'I never get angry, not even a little bit.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'positive_impression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['validity', 'validity_positive_impression'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 2
    }
  },
  {
    questionId: 'VALIDITY_POS_IMP_2',
    text: 'I have never said anything I later regretted.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'positive_impression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['validity', 'validity_positive_impression'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 2
    }
  },
  {
    questionId: 'VALIDITY_POS_IMP_3',
    text: 'I always tell the truth, no matter what.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'positive_impression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['validity', 'validity_positive_impression'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 2
    }
  },
  {
    questionId: 'VALIDITY_POS_IMP_4',
    text: 'I have never felt jealous or envious of anyone.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'positive_impression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['validity', 'validity_positive_impression'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 2
    }
  },
  {
    questionId: 'VALIDITY_POS_IMP_5',
    text: 'I am always patient, even in frustrating situations.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'positive_impression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['validity', 'validity_positive_impression'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 2
    }
  },
  {
    questionId: 'VALIDITY_POS_IMP_6',
    text: 'I have never disliked anyone.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'positive_impression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['validity', 'validity_positive_impression'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 2
    }
  },
  {
    questionId: 'VALIDITY_POS_IMP_7',
    text: 'I have never procrastinated or put off a task.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'positive_impression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['validity', 'validity_positive_impression'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 2
    }
  },
  {
    questionId: 'VALIDITY_POS_IMP_8',
    text: 'I never have any negative thoughts about myself or others.',
    category: 'validity_scales',
    instrument: 'NEURLYN_VALIDITY',
    subcategory: 'positive_impression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['validity', 'validity_positive_impression'],
    adaptive: {
      isBaseline: false,
      diagnosticWeight: 2
    }
  }
];

// ============================================================================
// PART 2: DEPRESSION ASSESSMENT (18 questions)
// PHQ-9 Core + Additional Clinical Items
// ============================================================================

const depressionQuestions = [
  // PHQ-9 CORE ITEMS (9 questions)
  {
    questionId: 'DEPRESSION_PHQ9_1',
    text: 'Over the past two weeks, how often have you had little interest or pleasure in doing things?',
    category: 'clinical_psychopathology',
    instrument: 'PHQ-9',
    subcategory: 'depression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['depression', 'phq9', 'validated', 'anhedonia'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 4,
      difficultyLevel: 3
    }
  },
  {
    questionId: 'DEPRESSION_PHQ9_2',
    text: 'Over the past two weeks, how often have you been feeling down, depressed, or hopeless?',
    category: 'clinical_psychopathology',
    instrument: 'PHQ-9',
    subcategory: 'depression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['depression', 'phq9', 'validated', 'mood'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 5,
      difficultyLevel: 3
    }
  },
  {
    questionId: 'DEPRESSION_PHQ9_3',
    text: 'Over the past two weeks, how often have you had trouble falling or staying asleep, or sleeping too much?',
    category: 'clinical_psychopathology',
    instrument: 'PHQ-9',
    subcategory: 'depression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['depression', 'phq9', 'validated', 'sleep'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 3,
      difficultyLevel: 2
    }
  },
  {
    questionId: 'DEPRESSION_PHQ9_4',
    text: 'Over the past two weeks, how often have you been feeling tired or having little energy?',
    category: 'clinical_psychopathology',
    instrument: 'PHQ-9',
    subcategory: 'depression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['depression', 'phq9', 'validated', 'energy'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism', 'extraversion'],
      diagnosticWeight: 3,
      difficultyLevel: 2
    }
  },
  {
    questionId: 'DEPRESSION_PHQ9_5',
    text: 'Over the past two weeks, how often have you had poor appetite or been overeating?',
    category: 'clinical_psychopathology',
    instrument: 'PHQ-9',
    subcategory: 'depression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['depression', 'phq9', 'validated', 'appetite'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 3,
      difficultyLevel: 2
    }
  },
  {
    questionId: 'DEPRESSION_PHQ9_6',
    text: 'Over the past two weeks, how often have you been feeling bad about yourself — or that you are a failure or have let yourself or your family down?',
    category: 'clinical_psychopathology',
    instrument: 'PHQ-9',
    subcategory: 'depression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['depression', 'phq9', 'validated', 'guilt', 'worthlessness'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 4,
      difficultyLevel: 3
    }
  },
  {
    questionId: 'DEPRESSION_PHQ9_7',
    text: 'Over the past two weeks, how often have you had trouble concentrating on things, such as reading or watching television?',
    category: 'clinical_psychopathology',
    instrument: 'PHQ-9',
    subcategory: 'depression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['depression', 'phq9', 'validated', 'concentration'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism', 'conscientiousness'],
      diagnosticWeight: 3,
      difficultyLevel: 2
    }
  },
  {
    questionId: 'DEPRESSION_PHQ9_8',
    text: 'Over the past two weeks, how often have you been moving or speaking so slowly that other people could have noticed? Or being so fidgety or restless that you have been moving around a lot more than usual?',
    category: 'clinical_psychopathology',
    instrument: 'PHQ-9',
    subcategory: 'depression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['depression', 'phq9', 'validated', 'psychomotor'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 3,
      difficultyLevel: 3
    }
  },
  {
    questionId: 'DEPRESSION_PHQ9_9',
    text: 'Over the past two weeks, how often have you had thoughts of harming yourself or felt that life wasn\'t worth living?',
    category: 'clinical_psychopathology',
    instrument: 'PHQ-9',
    subcategory: 'depression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['depression', 'phq9', 'validated', 'suicidal_ideation', 'critical'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 5,
      difficultyLevel: 5
    }
  },

  // ADDITIONAL DEPRESSION CLINICAL ITEMS (9 questions)
  {
    questionId: 'DEPRESSION_CLINICAL_1',
    text: 'I feel like nothing I do matters or makes a difference.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_DEPRESSION',
    subcategory: 'depression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['depression', 'worthlessness', 'meaning'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 4,
      difficultyLevel: 3
    }
  },
  {
    questionId: 'DEPRESSION_CLINICAL_2',
    text: 'I have lost interest in activities or hobbies that used to bring me joy.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_DEPRESSION',
    subcategory: 'depression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['depression', 'anhedonia'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism', 'openness'],
      diagnosticWeight: 4,
      difficultyLevel: 3
    }
  },
  {
    questionId: 'DEPRESSION_CLINICAL_3',
    text: 'I feel emotionally numb, like I can\'t feel happiness or sadness.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_DEPRESSION',
    subcategory: 'depression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['depression', 'emotional_numbing', 'anhedonia'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 4,
      difficultyLevel: 4
    }
  },
  {
    questionId: 'DEPRESSION_CLINICAL_4',
    text: 'Getting out of bed in the morning feels like an overwhelming task.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_DEPRESSION',
    subcategory: 'depression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['depression', 'energy', 'motivation'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism', 'conscientiousness'],
      diagnosticWeight: 3,
      difficultyLevel: 2
    }
  },
  {
    questionId: 'DEPRESSION_CLINICAL_5',
    text: 'I feel a persistent sense of emptiness or hollowness inside.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_DEPRESSION',
    subcategory: 'depression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['depression', 'emptiness'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 4,
      difficultyLevel: 3
    }
  },
  {
    questionId: 'DEPRESSION_CLINICAL_6',
    text: 'I have difficulty experiencing pleasure from things that others seem to enjoy.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_DEPRESSION',
    subcategory: 'depression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['depression', 'anhedonia'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism', 'extraversion'],
      diagnosticWeight: 4,
      difficultyLevel: 3
    }
  },
  {
    questionId: 'DEPRESSION_CLINICAL_7',
    text: 'I often cry without knowing exactly why.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_DEPRESSION',
    subcategory: 'depression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['depression', 'crying', 'emotional'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 3,
      difficultyLevel: 2
    }
  },
  {
    questionId: 'DEPRESSION_CLINICAL_8',
    text: 'I feel like I\'m just going through the motions without really living.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_DEPRESSION',
    subcategory: 'depression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['depression', 'disconnection', 'anhedonia'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 4,
      difficultyLevel: 3
    }
  },
  {
    questionId: 'DEPRESSION_CLINICAL_9',
    text: 'Simple tasks that used to be easy now feel impossibly difficult.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_DEPRESSION',
    subcategory: 'depression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['depression', 'functional_impairment', 'energy'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism', 'conscientiousness'],
      diagnosticWeight: 4,
      difficultyLevel: 3
    }
  }
];

// ============================================================================
// PART 3: SUICIDAL IDEATION SCREENING (7 questions)
// ============================================================================

const suicidalIdeationQuestions = [
  {
    questionId: 'SUICIDE_SCREEN_1',
    text: 'I have had thoughts about death or dying.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_SUICIDE_SCREEN',
    subcategory: 'suicidal_ideation',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['suicide', 'ideation', 'passive', 'critical'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 5,
      difficultyLevel: 4
    }
  },
  {
    questionId: 'SUICIDE_SCREEN_2',
    text: 'I have wished that I could fall asleep and not wake up.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_SUICIDE_SCREEN',
    subcategory: 'suicidal_ideation',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['suicide', 'ideation', 'passive', 'critical'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 5,
      difficultyLevel: 4
    }
  },
  {
    questionId: 'SUICIDE_SCREEN_3',
    text: 'I have had thoughts about ways I might hurt or kill myself.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_SUICIDE_SCREEN',
    subcategory: 'suicidal_ideation',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['suicide', 'ideation', 'active', 'critical'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 5,
      difficultyLevel: 5
    }
  },
  {
    questionId: 'SUICIDE_SCREEN_4',
    text: 'I have made a specific plan for how I would end my life.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_SUICIDE_SCREEN',
    subcategory: 'suicidal_ideation',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['suicide', 'plan', 'intent', 'critical'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 5,
      difficultyLevel: 5
    }
  },
  {
    questionId: 'SUICIDE_SCREEN_5',
    text: 'I have intentionally hurt myself without intending to die (such as cutting, burning, or hitting myself).',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_SUICIDE_SCREEN',
    subcategory: 'self_harm',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['suicide', 'self_harm', 'nssi', 'critical'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 5,
      difficultyLevel: 5
    }
  },
  {
    questionId: 'SUICIDE_SCREEN_6',
    text: 'I have attempted to end my life in the past.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_SUICIDE_SCREEN',
    subcategory: 'suicide_attempt',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['suicide', 'attempt', 'history', 'critical'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 5,
      difficultyLevel: 5
    }
  },
  {
    questionId: 'SUICIDE_SCREEN_7',
    text: 'I have important reasons for living (such as family, friends, pets, goals, beliefs).',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_SUICIDE_SCREEN',
    subcategory: 'protective_factors',
    responseType: 'likert',
    reverseScored: true,
    tier: 'comprehensive',
    tags: ['suicide', 'protective_factors', 'resilience'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 4,
      difficultyLevel: 3
    }
  }
];

// ============================================================================
// PART 4: ANXIETY DISORDERS (24 questions)
// GAD-7, Panic, Social Anxiety, OCD, PTSD
// ============================================================================

const anxietyQuestions = [
  // GAD-7 GENERALIZED ANXIETY (7 questions)
  {
    questionId: 'ANXIETY_GAD7_1',
    text: 'Over the past two weeks, how often have you been feeling nervous, anxious, or on edge?',
    category: 'clinical_psychopathology',
    instrument: 'GAD-7',
    subcategory: 'gad',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['anxiety', 'gad7', 'validated', 'nervousness'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 4,
      difficultyLevel: 2
    }
  },
  {
    questionId: 'ANXIETY_GAD7_2',
    text: 'Over the past two weeks, how often have you not been able to stop or control worrying?',
    category: 'clinical_psychopathology',
    instrument: 'GAD-7',
    subcategory: 'gad',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['anxiety', 'gad7', 'validated', 'worry'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 5,
      difficultyLevel: 3
    }
  },
  {
    questionId: 'ANXIETY_GAD7_3',
    text: 'Over the past two weeks, how often have you been worrying too much about different things?',
    category: 'clinical_psychopathology',
    instrument: 'GAD-7',
    subcategory: 'gad',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['anxiety', 'gad7', 'validated', 'worry'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 4,
      difficultyLevel: 2
    }
  },
  {
    questionId: 'ANXIETY_GAD7_4',
    text: 'Over the past two weeks, how often have you had trouble relaxing?',
    category: 'clinical_psychopathology',
    instrument: 'GAD-7',
    subcategory: 'gad',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['anxiety', 'gad7', 'validated', 'tension'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 3,
      difficultyLevel: 2
    }
  },
  {
    questionId: 'ANXIETY_GAD7_5',
    text: 'Over the past two weeks, how often have you been so restless that it\'s hard to sit still?',
    category: 'clinical_psychopathology',
    instrument: 'GAD-7',
    subcategory: 'gad',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['anxiety', 'gad7', 'validated', 'restlessness'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 3,
      difficultyLevel: 2
    }
  },
  {
    questionId: 'ANXIETY_GAD7_6',
    text: 'Over the past two weeks, how often have you become easily annoyed or irritable?',
    category: 'clinical_psychopathology',
    instrument: 'GAD-7',
    subcategory: 'gad',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['anxiety', 'gad7', 'validated', 'irritability'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism', 'agreeableness'],
      diagnosticWeight: 3,
      difficultyLevel: 2
    }
  },
  {
    questionId: 'ANXIETY_GAD7_7',
    text: 'Over the past two weeks, how often have you been feeling afraid, as if something awful might happen?',
    category: 'clinical_psychopathology',
    instrument: 'GAD-7',
    subcategory: 'gad',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['anxiety', 'gad7', 'validated', 'fear'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 4,
      difficultyLevel: 3
    }
  },

  // PANIC DISORDER (5 questions)
  {
    questionId: 'ANXIETY_PANIC_1',
    text: 'I experience sudden episodes of intense fear or discomfort that come on quickly and reach a peak within minutes.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_PANIC',
    subcategory: 'panic',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['anxiety', 'panic', 'panic_attacks'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 5,
      difficultyLevel: 4
    }
  },
  {
    questionId: 'ANXIETY_PANIC_2',
    text: 'During sudden panic episodes, I experience physical symptoms like rapid heartbeat, sweating, trembling, shortness of breath, or chest pain.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_PANIC',
    subcategory: 'panic',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['anxiety', 'panic', 'physical_symptoms'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 5,
      difficultyLevel: 3
    }
  },
  {
    questionId: 'ANXIETY_PANIC_3',
    text: 'I worry about having another panic attack or losing control.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_PANIC',
    subcategory: 'panic',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['anxiety', 'panic', 'anticipatory_anxiety'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 4,
      difficultyLevel: 3
    }
  },
  {
    questionId: 'ANXIETY_PANIC_4',
    text: 'I avoid certain places or situations because I\'m afraid I might have a panic attack there.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_PANIC',
    subcategory: 'panic',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['anxiety', 'panic', 'avoidance', 'agoraphobia'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism', 'extraversion'],
      diagnosticWeight: 4,
      difficultyLevel: 3
    }
  },
  {
    questionId: 'ANXIETY_PANIC_5',
    text: 'During panic episodes, I feel like I\'m going to die or that I\'m having a heart attack.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_PANIC',
    subcategory: 'panic',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['anxiety', 'panic', 'fear_of_dying'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 5,
      difficultyLevel: 4
    }
  },

  // SOCIAL ANXIETY (5 questions)
  {
    questionId: 'ANXIETY_SOCIAL_1',
    text: 'I feel very anxious or fearful in social situations where I might be judged or evaluated by others.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_SOCIAL_ANXIETY',
    subcategory: 'social_anxiety',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['anxiety', 'social_anxiety', 'fear_of_judgment'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism', 'extraversion'],
      diagnosticWeight: 4,
      difficultyLevel: 3
    }
  },
  {
    questionId: 'ANXIETY_SOCIAL_2',
    text: 'I worry for days or weeks before a social event that I have to attend.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_SOCIAL_ANXIETY',
    subcategory: 'social_anxiety',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['anxiety', 'social_anxiety', 'anticipatory_anxiety'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism', 'extraversion'],
      diagnosticWeight: 4,
      difficultyLevel: 3
    }
  },
  {
    questionId: 'ANXIETY_SOCIAL_3',
    text: 'I avoid speaking up in meetings, classes, or group settings because I\'m afraid of embarrassing myself.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_SOCIAL_ANXIETY',
    subcategory: 'social_anxiety',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['anxiety', 'social_anxiety', 'avoidance', 'performance'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism', 'extraversion'],
      diagnosticWeight: 4,
      difficultyLevel: 3
    }
  },
  {
    questionId: 'ANXIETY_SOCIAL_4',
    text: 'After social interactions, I replay them in my mind over and over, analyzing what I said or did wrong.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_SOCIAL_ANXIETY',
    subcategory: 'social_anxiety',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['anxiety', 'social_anxiety', 'rumination'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 4,
      difficultyLevel: 3
    }
  },
  {
    questionId: 'ANXIETY_SOCIAL_5',
    text: 'I am intensely afraid that others will notice my anxiety symptoms (like blushing, sweating, or trembling).',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_SOCIAL_ANXIETY',
    subcategory: 'social_anxiety',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['anxiety', 'social_anxiety', 'fear_of_symptoms'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 4,
      difficultyLevel: 3
    }
  },

  // OCD (4 questions)
  {
    questionId: 'ANXIETY_OCD_1',
    text: 'I have unwanted thoughts, images, or urges that repeatedly come into my mind and cause me distress.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_OCD',
    subcategory: 'ocd',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['anxiety', 'ocd', 'obsessions', 'intrusive_thoughts'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 5,
      difficultyLevel: 4
    }
  },
  {
    questionId: 'ANXIETY_OCD_2',
    text: 'I feel driven to perform certain behaviors or mental acts over and over to reduce my anxiety or prevent something bad from happening.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_OCD',
    subcategory: 'ocd',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['anxiety', 'ocd', 'compulsions', 'rituals'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism', 'conscientiousness'],
      diagnosticWeight: 5,
      difficultyLevel: 4
    }
  },
  {
    questionId: 'ANXIETY_OCD_3',
    text: 'I spend a lot of time each day performing repetitive behaviors or rituals, or trying to suppress unwanted thoughts.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_OCD',
    subcategory: 'ocd',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['anxiety', 'ocd', 'time_consuming', 'impairment'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism', 'conscientiousness'],
      diagnosticWeight: 5,
      difficultyLevel: 4
    }
  },
  {
    questionId: 'ANXIETY_OCD_4',
    text: 'Unwanted repetitive thoughts or behaviors significantly interfere with my daily life, work, or relationships.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_OCD',
    subcategory: 'ocd',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['anxiety', 'ocd', 'functional_impairment'],
    sensitivity: 'MEDIUM',
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 5,
      difficultyLevel: 4
    }
  },

  // PTSD (3 questions - brief screening)
  {
    questionId: 'ANXIETY_PTSD_1',
    text: 'I have experienced or witnessed a traumatic event that continues to affect me.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_PTSD',
    subcategory: 'ptsd',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['anxiety', 'ptsd', 'trauma', 'exposure'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 5,
      difficultyLevel: 5
    }
  },
  {
    questionId: 'ANXIETY_PTSD_2',
    text: 'I experience unwanted memories, flashbacks, or nightmares about the traumatic event.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_PTSD',
    subcategory: 'ptsd',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['anxiety', 'ptsd', 'intrusion', 'flashbacks'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 5,
      difficultyLevel: 5
    }
  },
  {
    questionId: 'ANXIETY_PTSD_3',
    text: 'I am constantly on guard, easily startled, or hyperaware of potential threats.',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN_PTSD',
    subcategory: 'ptsd',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['anxiety', 'ptsd', 'hypervigilance', 'hyperarousal'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 5,
      difficultyLevel: 4
    }
  }
];

// ============================================================================
// PART 5: SUBSTANCE USE SCREENING (12 questions)
// Alcohol + Drugs
// ============================================================================

const substanceUseQuestions = [
  // ALCOHOL USE (6 questions - AUDIT-based)
  {
    questionId: 'SUBSTANCE_ALCOHOL_1',
    text: 'How often do you have a drink containing alcohol?',
    category: 'clinical_psychopathology',
    instrument: 'AUDIT',
    subcategory: 'substance_alcohol',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['substance', 'alcohol', 'frequency'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['conscientiousness', 'neuroticism'],
      diagnosticWeight: 3,
      difficultyLevel: 2
    }
  },
  {
    questionId: 'SUBSTANCE_ALCOHOL_2',
    text: 'How many drinks containing alcohol do you have on a typical day when you are drinking?',
    category: 'clinical_psychopathology',
    instrument: 'AUDIT',
    subcategory: 'substance_alcohol',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['substance', 'alcohol', 'quantity'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['conscientiousness'],
      diagnosticWeight: 3,
      difficultyLevel: 2
    }
  },
  {
    questionId: 'SUBSTANCE_ALCOHOL_3',
    text: 'How often do you have six or more drinks on one occasion?',
    category: 'clinical_psychopathology',
    instrument: 'AUDIT',
    subcategory: 'substance_alcohol',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['substance', 'alcohol', 'binge_drinking'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['conscientiousness', 'neuroticism'],
      diagnosticWeight: 4,
      difficultyLevel: 3
    }
  },
  {
    questionId: 'SUBSTANCE_ALCOHOL_4',
    text: 'How often during the past year have you found that you were not able to stop drinking once you had started?',
    category: 'clinical_psychopathology',
    instrument: 'AUDIT',
    subcategory: 'substance_alcohol',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['substance', 'alcohol', 'loss_of_control'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['conscientiousness', 'neuroticism'],
      diagnosticWeight: 5,
      difficultyLevel: 4
    }
  },
  {
    questionId: 'SUBSTANCE_ALCOHOL_5',
    text: 'How often during the past year have you needed a first drink in the morning to get yourself going after a heavy drinking session?',
    category: 'clinical_psychopathology',
    instrument: 'AUDIT',
    subcategory: 'substance_alcohol',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['substance', 'alcohol', 'dependence', 'withdrawal'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['conscientiousness', 'neuroticism'],
      diagnosticWeight: 5,
      difficultyLevel: 5
    }
  },
  {
    questionId: 'SUBSTANCE_ALCOHOL_6',
    text: 'Has your drinking caused you problems with work, relationships, or other important areas of your life?',
    category: 'clinical_psychopathology',
    instrument: 'AUDIT',
    subcategory: 'substance_alcohol',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['substance', 'alcohol', 'consequences', 'impairment'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['conscientiousness'],
      diagnosticWeight: 5,
      difficultyLevel: 4
    }
  },

  // DRUG USE (6 questions - DAST-based)
  {
    questionId: 'SUBSTANCE_DRUG_1',
    text: 'Have you used drugs other than those required for medical reasons?',
    category: 'clinical_psychopathology',
    instrument: 'DAST',
    subcategory: 'substance_drugs',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['substance', 'drugs', 'use'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['conscientiousness', 'openness'],
      diagnosticWeight: 4,
      difficultyLevel: 3
    }
  },
  {
    questionId: 'SUBSTANCE_DRUG_2',
    text: 'Do you abuse more than one drug at a time?',
    category: 'clinical_psychopathology',
    instrument: 'DAST',
    subcategory: 'substance_drugs',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['substance', 'drugs', 'polysubstance'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['conscientiousness'],
      diagnosticWeight: 5,
      difficultyLevel: 4
    }
  },
  {
    questionId: 'SUBSTANCE_DRUG_3',
    text: 'Are you unable to stop using drugs when you want to?',
    category: 'clinical_psychopathology',
    instrument: 'DAST',
    subcategory: 'substance_drugs',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['substance', 'drugs', 'loss_of_control', 'dependence'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['conscientiousness', 'neuroticism'],
      diagnosticWeight: 5,
      difficultyLevel: 5
    }
  },
  {
    questionId: 'SUBSTANCE_DRUG_4',
    text: 'Have you had blackouts or flashbacks as a result of drug use?',
    category: 'clinical_psychopathology',
    instrument: 'DAST',
    subcategory: 'substance_drugs',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['substance', 'drugs', 'severe_effects'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['conscientiousness'],
      diagnosticWeight: 5,
      difficultyLevel: 4
    }
  },
  {
    questionId: 'SUBSTANCE_DRUG_5',
    text: 'Do you ever feel bad or guilty about your drug use?',
    category: 'clinical_psychopathology',
    instrument: 'DAST',
    subcategory: 'substance_drugs',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['substance', 'drugs', 'guilt', 'awareness'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['conscientiousness', 'neuroticism'],
      diagnosticWeight: 4,
      difficultyLevel: 3
    }
  },
  {
    questionId: 'SUBSTANCE_DRUG_6',
    text: 'Has drug use created problems between you and your family or friends?',
    category: 'clinical_psychopathology',
    instrument: 'DAST',
    subcategory: 'substance_drugs',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['substance', 'drugs', 'consequences', 'relationships'],
    adaptive: {
      isBaseline: false,
      correlatedTraits: ['conscientiousness', 'agreeableness'],
      diagnosticWeight: 5,
      difficultyLevel: 4
    }
  }
];

// ============================================================================
// PART 6: CLINICAL BASELINE SCREENING (5 questions)
// Added to baseline phase for early clinical pathway activation
// ============================================================================

const clinicalBaselineQuestions = [
  {
    questionId: 'BASELINE_CLINICAL_DEPRESSION',
    text: 'Over the past two weeks, I have felt down, depressed, or hopeless.',
    category: 'clinical_psychopathology',
    instrument: 'PHQ-2',
    subcategory: 'depression',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['baseline', 'depression', 'screening'],
    adaptive: {
      isBaseline: true,
      baselinePriority: 11,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 4,
      difficultyLevel: 2
    }
  },
  {
    questionId: 'BASELINE_CLINICAL_ANXIETY',
    text: 'Over the past two weeks, I have felt nervous, anxious, or unable to stop worrying.',
    category: 'clinical_psychopathology',
    instrument: 'GAD-2',
    subcategory: 'gad',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['baseline', 'anxiety', 'screening'],
    adaptive: {
      isBaseline: true,
      baselinePriority: 12,
      correlatedTraits: ['neuroticism'],
      diagnosticWeight: 4,
      difficultyLevel: 2
    }
  },
  {
    questionId: 'BASELINE_CLINICAL_MANIA',
    text: 'I have experienced periods where I felt unusually energetic, needed less sleep, or engaged in risky behavior.',
    category: 'clinical_psychopathology',
    instrument: 'MDQ',
    subcategory: 'mania',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['baseline', 'mania', 'screening', 'bipolar'],
    adaptive: {
      isBaseline: true,
      baselinePriority: 13,
      correlatedTraits: ['neuroticism', 'extraversion'],
      diagnosticWeight: 4,
      difficultyLevel: 3
    }
  },
  {
    questionId: 'BASELINE_CLINICAL_SUBSTANCE',
    text: 'In the past year, alcohol or drug use has caused problems in my life or I\'ve wanted to cut down.',
    category: 'clinical_psychopathology',
    instrument: 'CAGE',
    subcategory: 'substance_screening',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['baseline', 'substance', 'screening'],
    adaptive: {
      isBaseline: true,
      baselinePriority: 14,
      correlatedTraits: ['conscientiousness', 'neuroticism'],
      diagnosticWeight: 4,
      difficultyLevel: 3
    }
  },
  {
    questionId: 'BASELINE_CLINICAL_PSYCHOSIS',
    text: 'I have experienced unusual perceptual experiences or beliefs that others find strange or hard to believe.',
    category: 'clinical_psychopathology',
    instrument: 'PQ-B',
    subcategory: 'psychosis_risk',
    responseType: 'likert',
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['baseline', 'psychosis', 'screening'],
    adaptive: {
      isBaseline: true,
      baselinePriority: 15,
      correlatedTraits: ['openness', 'neuroticism'],
      diagnosticWeight: 5,
      difficultyLevel: 4
    }
  }
];

// ============================================================================
// SEEDING LOGIC
// ============================================================================

async function seedPhase1ClinicalQuestions() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Count totals
    const totalQuestions =
      validityScaleQuestions.length +
      depressionQuestions.length +
      suicidalIdeationQuestions.length +
      anxietyQuestions.length +
      substanceUseQuestions.length +
      clinicalBaselineQuestions.length;

    logger.info(`Preparing to seed ${totalQuestions} Phase 1 clinical questions`);

    // Combine all questions
    const allQuestions = [
      ...validityScaleQuestions,
      ...depressionQuestions,
      ...suicidalIdeationQuestions,
      ...anxietyQuestions,
      ...substanceUseQuestions,
      ...clinicalBaselineQuestions
    ];

    // Delete existing Phase 1 questions (if re-seeding)
    const existingIds = allQuestions.map(q => q.questionId);
    const deleteResult = await QuestionBank.deleteMany({
      questionId: { $in: existingIds }
    });
    logger.info(`Deleted ${deleteResult.deletedCount} existing Phase 1 questions`);

    // Insert all questions
    const insertResult = await QuestionBank.insertMany(allQuestions, { ordered: false });
    logger.info(`Inserted ${insertResult.length} Phase 1 questions successfully`);

    // Summary by category
    console.log('\n✅ PHASE 1 SEEDING COMPLETE\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Validity Scales:              ${validityScaleQuestions.length} questions`);
    console.log(`Depression (PHQ-9 + Clinical): ${depressionQuestions.length} questions`);
    console.log(`Suicidal Ideation Screening:  ${suicidalIdeationQuestions.length} questions`);
    console.log(`Anxiety Disorders:             ${anxietyQuestions.length} questions`);
    console.log(`  - GAD-7:                     7 questions`);
    console.log(`  - Panic:                     5 questions`);
    console.log(`  - Social Anxiety:            5 questions`);
    console.log(`  - OCD:                       4 questions`);
    console.log(`  - PTSD:                      3 questions`);
    console.log(`Substance Use Screening:       ${substanceUseQuestions.length} questions`);
    console.log(`  - Alcohol (AUDIT):           6 questions`);
    console.log(`  - Drugs (DAST):              6 questions`);
    console.log(`Clinical Baseline Screening:   ${clinicalBaselineQuestions.length} questions`);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`TOTAL QUESTIONS:               ${totalQuestions} questions`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');

    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run seeding
seedPhase1ClinicalQuestions();
