#!/usr/bin/env node

/**
 * Phase 2 Comprehensive Question Seeding Script
 *
 * Seeds all Phase 2 components:
 * 1. NEO Facet Expansion (90 questions) - 3 additional per facet × 30 facets
 * 2. HEXACO Honesty-Humility (18 questions) - 4-5 per facet × 4 facets
 * 3. ACEs - Adverse Childhood Experiences (10 questions)
 * 4. Complex PTSD (8 questions)
 * 5. Mania/Hypomania Screening - MDQ (12 questions)
 * 6. Thought Disorder Screening - PQ-B (18 questions)
 *
 * Total: 156 questions
 */

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
const logger = require('../utils/logger');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

// Standard likert options
const LIKERT_OPTIONS = [
  { value: 1, label: 'Strongly Disagree', score: 1 },
  { value: 2, label: 'Disagree', score: 2 },
  { value: 3, label: 'Neutral', score: 3 },
  { value: 4, label: 'Agree', score: 4 },
  { value: 5, label: 'Strongly Agree', score: 5 }
];

const BINARY_OPTIONS = [
  { value: 0, label: 'No', score: 0 },
  { value: 1, label: 'Yes', score: 1 }
];

// Helper function to create NEO question
function createNEOQuestion(id, text, trait, facet, reversed = false, weight = 2) {
  return {
    questionId: id,
    text,
    category: 'personality',
    instrument: 'NEO-PI-R',
    trait,
    facet,
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: reversed,
    tier: 'comprehensive',
    tags: ['personality', 'neo', trait, facet, reversed ? 'reversed' : ''].filter(Boolean),
    adaptive: {
      diagnosticWeight: weight,
      correlatedTraits: [trait]
    },
    metadata: {
      scientificSource: 'NEO-PI-R (Costa & McCrae, 1992)',
      version: '2.0'
    },
    active: true
  };
}

// ============================================================================
// 1. NEO FACET EXPANSION (90 questions total)
// ============================================================================

const neoExpansion = [
  // NEUROTICISM (18 questions = 6 facets × 3)

  // N1: Anxiety
  createNEOQuestion('NEO_N1_4', 'I often worry about things that might go wrong', 'neuroticism', 'anxiety', false, 2),
  createNEOQuestion('NEO_N1_5', 'I feel tense and jittery in uncertain situations', 'neuroticism', 'anxiety', false, 2),
  createNEOQuestion('NEO_N1_6', 'I remain calm in most situations', 'neuroticism', 'anxiety', true, 2),

  // N2: Angry Hostility
  createNEOQuestion('NEO_N2_4', 'I get irritated easily when things don\'t go my way', 'neuroticism', 'angry_hostility', false, 2),
  createNEOQuestion('NEO_N2_5', 'I often feel angry about how I\'ve been treated', 'neuroticism', 'angry_hostility', false, 2),
  createNEOQuestion('NEO_N2_6', 'I rarely feel bitter or resentful', 'neuroticism', 'angry_hostility', true, 2),

  // N3: Depression
  createNEOQuestion('NEO_N3_4', 'I often feel sad and blue without knowing why', 'neuroticism', 'depression', false, 3),
  createNEOQuestion('NEO_N3_5', 'I feel hopeless about the future at times', 'neuroticism', 'depression', false, 3),
  createNEOQuestion('NEO_N3_6', 'I generally feel cheerful and optimistic', 'neuroticism', 'depression', true, 3),

  // N4: Self-Consciousness
  createNEOQuestion('NEO_N4_4', 'I feel self-conscious when speaking in front of others', 'neuroticism', 'self_consciousness', false, 2),
  createNEOQuestion('NEO_N4_5', 'I worry about what others think of me', 'neuroticism', 'self_consciousness', false, 2),
  createNEOQuestion('NEO_N4_6', 'I feel comfortable in social situations', 'neuroticism', 'self_consciousness', true, 2),

  // N5: Impulsiveness
  createNEOQuestion('NEO_N5_4', 'I often act on the spur of the moment without thinking', 'neuroticism', 'impulsiveness', false, 2),
  createNEOQuestion('NEO_N5_5', 'I find it hard to resist my cravings', 'neuroticism', 'impulsiveness', false, 2),
  createNEOQuestion('NEO_N5_6', 'I carefully think through decisions before acting', 'neuroticism', 'impulsiveness', true, 2),

  // N6: Vulnerability
  createNEOQuestion('NEO_N6_4', 'I feel overwhelmed when facing stressful situations', 'neuroticism', 'vulnerability', false, 3),
  createNEOQuestion('NEO_N6_5', 'I panic when things get difficult', 'neuroticism', 'vulnerability', false, 3),
  createNEOQuestion('NEO_N6_6', 'I can handle pressure well', 'neuroticism', 'vulnerability', true, 3),

  // EXTRAVERSION (18 questions = 6 facets × 3)

  // E1: Warmth
  createNEOQuestion('NEO_E1_4', 'I form close bonds with people easily', 'extraversion', 'warmth', false, 2),
  createNEOQuestion('NEO_E1_5', 'I enjoy showing affection to others', 'extraversion', 'warmth', false, 2),
  createNEOQuestion('NEO_E1_6', 'I keep people at an emotional distance', 'extraversion', 'warmth', true, 2),

  // E2: Gregariousness
  createNEOQuestion('NEO_E2_4', 'I actively seek out social gatherings', 'extraversion', 'gregariousness', false, 2),
  createNEOQuestion('NEO_E2_5', 'I thrive in group settings', 'extraversion', 'gregariousness', false, 2),
  createNEOQuestion('NEO_E2_6', 'I prefer solitary activities to group activities', 'extraversion', 'gregariousness', true, 2),

  // E3: Assertiveness
  createNEOQuestion('NEO_E3_4', 'I speak up confidently in meetings', 'extraversion', 'assertiveness', false, 2),
  createNEOQuestion('NEO_E3_5', 'I naturally take charge in group situations', 'extraversion', 'assertiveness', false, 2),
  createNEOQuestion('NEO_E3_6', 'I let others take the lead', 'extraversion', 'assertiveness', true, 2),

  // E4: Activity
  createNEOQuestion('NEO_E4_4', 'I maintain a fast-paced lifestyle', 'extraversion', 'activity', false, 2),
  createNEOQuestion('NEO_E4_5', 'I like to stay constantly busy', 'extraversion', 'activity', false, 2),
  createNEOQuestion('NEO_E4_6', 'I prefer a slow and steady pace', 'extraversion', 'activity', true, 2),

  // E5: Excitement-Seeking
  createNEOQuestion('NEO_E5_4', 'I crave excitement and stimulation', 'extraversion', 'excitement_seeking', false, 2),
  createNEOQuestion('NEO_E5_5', 'I enjoy taking risks for the thrill', 'extraversion', 'excitement_seeking', false, 2),
  createNEOQuestion('NEO_E5_6', 'I avoid risky or dangerous activities', 'extraversion', 'excitement_seeking', true, 2),

  // E6: Positive Emotions
  createNEOQuestion('NEO_E6_4', 'I frequently experience joy and enthusiasm', 'extraversion', 'positive_emotions', false, 2),
  createNEOQuestion('NEO_E6_5', 'I laugh easily and often', 'extraversion', 'positive_emotions', false, 2),
  createNEOQuestion('NEO_E6_6', 'I rarely feel excited or energized', 'extraversion', 'positive_emotions', true, 2),

  // OPENNESS (18 questions = 6 facets × 3)

  // O1: Fantasy
  createNEOQuestion('NEO_O1_4', 'I have a vivid and active imagination', 'openness', 'fantasy', false, 2),
  createNEOQuestion('NEO_O1_5', 'I often daydream and get lost in thought', 'openness', 'fantasy', false, 2),
  createNEOQuestion('NEO_O1_6', 'I focus on practical reality rather than imagination', 'openness', 'fantasy', true, 2),

  // O2: Aesthetics
  createNEOQuestion('NEO_O2_4', 'I am deeply moved by art and music', 'openness', 'aesthetics', false, 2),
  createNEOQuestion('NEO_O2_5', 'I seek out beautiful experiences', 'openness', 'aesthetics', false, 2),
  createNEOQuestion('NEO_O2_6', 'I have little interest in art or aesthetics', 'openness', 'aesthetics', true, 2),

  // O3: Feelings
  createNEOQuestion('NEO_O3_4', 'I experience my emotions intensely', 'openness', 'feelings', false, 2),
  createNEOQuestion('NEO_O3_5', 'I am very aware of my inner emotional states', 'openness', 'feelings', false, 2),
  createNEOQuestion('NEO_O3_6', 'I rarely pay attention to my feelings', 'openness', 'feelings', true, 2),

  // O4: Actions
  createNEOQuestion('NEO_O4_4', 'I love trying new and different activities', 'openness', 'actions', false, 2),
  createNEOQuestion('NEO_O4_5', 'I seek variety in my daily routine', 'openness', 'actions', false, 2),
  createNEOQuestion('NEO_O4_6', 'I prefer familiar routines to new experiences', 'openness', 'actions', true, 2),

  // O5: Ideas
  createNEOQuestion('NEO_O5_4', 'I enjoy exploring complex philosophical ideas', 'openness', 'ideas', false, 2),
  createNEOQuestion('NEO_O5_5', 'I love intellectual challenges', 'openness', 'ideas', false, 2),
  createNEOQuestion('NEO_O5_6', 'I prefer not to think about abstract theories', 'openness', 'ideas', true, 2),

  // O6: Values
  createNEOQuestion('NEO_O6_4', 'I question traditional values and customs', 'openness', 'values', false, 2),
  createNEOQuestion('NEO_O6_5', 'I am open to reconsidering my beliefs', 'openness', 'values', false, 2),
  createNEOQuestion('NEO_O6_6', 'I believe in following established traditions', 'openness', 'values', true, 2),

  // AGREEABLENESS (18 questions = 6 facets × 3)

  // A1: Trust
  createNEOQuestion('NEO_A1_4', 'I believe most people are fundamentally good', 'agreeableness', 'trust', false, 2),
  createNEOQuestion('NEO_A1_5', 'I give people the benefit of the doubt', 'agreeableness', 'trust', false, 2),
  createNEOQuestion('NEO_A1_6', 'I am suspicious of others\' intentions', 'agreeableness', 'trust', true, 2),

  // A2: Straightforwardness
  createNEOQuestion('NEO_A2_4', 'I am honest and straightforward with people', 'agreeableness', 'straightforwardness', false, 2),
  createNEOQuestion('NEO_A2_5', 'I say what I truly think', 'agreeableness', 'straightforwardness', false, 2),
  createNEOQuestion('NEO_A2_6', 'I sometimes manipulate situations to get what I want', 'agreeableness', 'straightforwardness', true, 2),

  // A3: Altruism
  createNEOQuestion('NEO_A3_4', 'I go out of my way to help others', 'agreeableness', 'altruism', false, 2),
  createNEOQuestion('NEO_A3_5', 'I enjoy doing favors for people', 'agreeableness', 'altruism', false, 2),
  createNEOQuestion('NEO_A3_6', 'I put my own needs before helping others', 'agreeableness', 'altruism', true, 2),

  // A4: Compliance
  createNEOQuestion('NEO_A4_4', 'I avoid arguments and conflicts', 'agreeableness', 'compliance', false, 2),
  createNEOQuestion('NEO_A4_5', 'I prefer to cooperate rather than compete', 'agreeableness', 'compliance', false, 2),
  createNEOQuestion('NEO_A4_6', 'I enjoy debating and challenging others', 'agreeableness', 'compliance', true, 2),

  // A5: Modesty
  createNEOQuestion('NEO_A5_4', 'I am humble about my accomplishments', 'agreeableness', 'modesty', false, 2),
  createNEOQuestion('NEO_A5_5', 'I don\'t like to brag or show off', 'agreeableness', 'modesty', false, 2),
  createNEOQuestion('NEO_A5_6', 'I believe I am better than average', 'agreeableness', 'modesty', true, 2),

  // A6: Tender-Mindedness
  createNEOQuestion('NEO_A6_4', 'I am deeply affected by others\' suffering', 'agreeableness', 'tender_mindedness', false, 2),
  createNEOQuestion('NEO_A6_5', 'I feel compassion for people in need', 'agreeableness', 'tender_mindedness', false, 2),
  createNEOQuestion('NEO_A6_6', 'I make decisions based on logic, not emotions', 'agreeableness', 'tender_mindedness', true, 2),

  // CONSCIENTIOUSNESS (18 questions = 6 facets × 3)

  // C1: Competence
  createNEOQuestion('NEO_C1_4', 'I feel capable of handling most challenges', 'conscientiousness', 'competence', false, 2),
  createNEOQuestion('NEO_C1_5', 'I am confident in my abilities', 'conscientiousness', 'competence', false, 2),
  createNEOQuestion('NEO_C1_6', 'I often doubt my ability to succeed', 'conscientiousness', 'competence', true, 2),

  // C2: Order
  createNEOQuestion('NEO_C2_4', 'I keep my belongings organized and tidy', 'conscientiousness', 'order', false, 2),
  createNEOQuestion('NEO_C2_5', 'I like everything to be in its proper place', 'conscientiousness', 'order', false, 2),
  createNEOQuestion('NEO_C2_6', 'I am comfortable with clutter and messiness', 'conscientiousness', 'order', true, 2),

  // C3: Dutifulness
  createNEOQuestion('NEO_C3_4', 'I always fulfill my obligations', 'conscientiousness', 'dutifulness', false, 2),
  createNEOQuestion('NEO_C3_5', 'I take my responsibilities very seriously', 'conscientiousness', 'dutifulness', false, 2),
  createNEOQuestion('NEO_C3_6', 'I sometimes neglect my duties', 'conscientiousness', 'dutifulness', true, 2),

  // C4: Achievement Striving
  createNEOQuestion('NEO_C4_4', 'I set high standards for myself', 'conscientiousness', 'achievement_striving', false, 2),
  createNEOQuestion('NEO_C4_5', 'I am driven to succeed', 'conscientiousness', 'achievement_striving', false, 2),
  createNEOQuestion('NEO_C4_6', 'I am content with doing just enough to get by', 'conscientiousness', 'achievement_striving', true, 2),

  // C5: Self-Discipline
  createNEOQuestion('NEO_C5_4', 'I can make myself do what needs to be done', 'conscientiousness', 'self_discipline', false, 2),
  createNEOQuestion('NEO_C5_5', 'I follow through on my commitments', 'conscientiousness', 'self_discipline', false, 2),
  createNEOQuestion('NEO_C5_6', 'I have trouble motivating myself', 'conscientiousness', 'self_discipline', true, 2),

  // C6: Deliberation
  createNEOQuestion('NEO_C6_4', 'I think carefully before making decisions', 'conscientiousness', 'deliberation', false, 2),
  createNEOQuestion('NEO_C6_5', 'I weigh all options before acting', 'conscientiousness', 'deliberation', false, 2),
  createNEOQuestion('NEO_C6_6', 'I tend to make hasty decisions', 'conscientiousness', 'deliberation', true, 2)
];

// ============================================================================
// 2. HEXACO HONESTY-HUMILITY (18 questions)
// ============================================================================

const hexacoQuestions = [
  // H1: Sincerity (5 questions)
  {
    questionId: 'HEXACO_H1_1',
    text: 'I wouldn\'t use flattery to get a raise or promotion',
    category: 'personality',
    instrument: 'HEXACO-60',
    trait: 'honesty_humility',
    facet: 'sincerity',
    subcategory: 'hexaco_honesty_humility',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'hexaco', 'honesty_humility', 'sincerity', 'h1'],
    adaptive: {
      diagnosticWeight: 3,
      correlatedTraits: ['agreeableness']
    },
    metadata: {
      scientificSource: 'HEXACO-PI-R (Lee & Ashton, 2018)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'HEXACO_H1_2',
    text: 'I am genuinely interested in others when I ask how they are',
    category: 'personality',
    instrument: 'HEXACO-60',
    trait: 'honesty_humility',
    facet: 'sincerity',
    subcategory: 'hexaco_honesty_humility',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'hexaco', 'honesty_humility', 'sincerity', 'h1'],
    adaptive: {
      diagnosticWeight: 3,
      correlatedTraits: ['agreeableness']
    },
    metadata: {
      scientificSource: 'HEXACO-PI-R (Lee & Ashton, 2018)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'HEXACO_H1_3',
    text: 'I rarely present myself in a way that makes me look better than I am',
    category: 'personality',
    instrument: 'HEXACO-60',
    trait: 'honesty_humility',
    facet: 'sincerity',
    subcategory: 'hexaco_honesty_humility',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'hexaco', 'honesty_humility', 'sincerity', 'h1'],
    adaptive: {
      diagnosticWeight: 3,
      correlatedTraits: ['agreeableness']
    },
    metadata: {
      scientificSource: 'HEXACO-PI-R (Lee & Ashton, 2018)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'HEXACO_H1_4',
    text: 'I avoid manipulating people to get what I want',
    category: 'personality',
    instrument: 'HEXACO-60',
    trait: 'honesty_humility',
    facet: 'sincerity',
    subcategory: 'hexaco_honesty_humility',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'hexaco', 'honesty_humility', 'sincerity', 'h1'],
    adaptive: {
      diagnosticWeight: 3,
      correlatedTraits: ['agreeableness']
    },
    metadata: {
      scientificSource: 'HEXACO-PI-R (Lee & Ashton, 2018)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'HEXACO_H1_5',
    text: 'I am honest in my dealings with others',
    category: 'personality',
    instrument: 'HEXACO-60',
    trait: 'honesty_humility',
    facet: 'sincerity',
    subcategory: 'hexaco_honesty_humility',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'hexaco', 'honesty_humility', 'sincerity', 'h1'],
    adaptive: {
      diagnosticWeight: 3,
      correlatedTraits: ['agreeableness']
    },
    metadata: {
      scientificSource: 'HEXACO-PI-R (Lee & Ashton, 2018)',
      version: '1.0'
    },
    active: true
  },

  // H2: Fairness (5 questions)
  {
    questionId: 'HEXACO_H2_1',
    text: 'I would never accept a bribe, even if it were very large',
    category: 'personality',
    instrument: 'HEXACO-60',
    trait: 'honesty_humility',
    facet: 'fairness',
    subcategory: 'hexaco_honesty_humility',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'hexaco', 'honesty_humility', 'fairness', 'h2'],
    adaptive: {
      diagnosticWeight: 3,
      correlatedTraits: ['agreeableness', 'conscientiousness']
    },
    metadata: {
      scientificSource: 'HEXACO-PI-R (Lee & Ashton, 2018)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'HEXACO_H2_2',
    text: 'I would feel terrible if I broke rules to get ahead',
    category: 'personality',
    instrument: 'HEXACO-60',
    trait: 'honesty_humility',
    facet: 'fairness',
    subcategory: 'hexaco_honesty_humility',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'hexaco', 'honesty_humility', 'fairness', 'h2'],
    adaptive: {
      diagnosticWeight: 3,
      correlatedTraits: ['conscientiousness']
    },
    metadata: {
      scientificSource: 'HEXACO-PI-R (Lee & Ashton, 2018)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'HEXACO_H2_3',
    text: 'I believe everyone should follow the rules, including myself',
    category: 'personality',
    instrument: 'HEXACO-60',
    trait: 'honesty_humility',
    facet: 'fairness',
    subcategory: 'hexaco_honesty_humility',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'hexaco', 'honesty_humility', 'fairness', 'h2'],
    adaptive: {
      diagnosticWeight: 3,
      correlatedTraits: ['conscientiousness']
    },
    metadata: {
      scientificSource: 'HEXACO-PI-R (Lee & Ashton, 2018)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'HEXACO_H2_4',
    text: 'I would never cheat on my taxes',
    category: 'personality',
    instrument: 'HEXACO-60',
    trait: 'honesty_humility',
    facet: 'fairness',
    subcategory: 'hexaco_honesty_humility',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'hexaco', 'honesty_humility', 'fairness', 'h2'],
    adaptive: {
      diagnosticWeight: 3,
      correlatedTraits: ['conscientiousness']
    },
    metadata: {
      scientificSource: 'HEXACO-PI-R (Lee & Ashton, 2018)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'HEXACO_H2_5',
    text: 'I believe in playing by the rules',
    category: 'personality',
    instrument: 'HEXACO-60',
    trait: 'honesty_humility',
    facet: 'fairness',
    subcategory: 'hexaco_honesty_humility',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'hexaco', 'honesty_humility', 'fairness', 'h2'],
    adaptive: {
      diagnosticWeight: 3,
      correlatedTraits: ['conscientiousness', 'agreeableness']
    },
    metadata: {
      scientificSource: 'HEXACO-PI-R (Lee & Ashton, 2018)',
      version: '1.0'
    },
    active: true
  },

  // H3: Greed Avoidance (4 questions)
  {
    questionId: 'HEXACO_H3_1',
    text: 'I am not interested in having expensive luxuries',
    category: 'personality',
    instrument: 'HEXACO-60',
    trait: 'honesty_humility',
    facet: 'greed_avoidance',
    subcategory: 'hexaco_honesty_humility',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'hexaco', 'honesty_humility', 'greed_avoidance', 'h3'],
    adaptive: {
      diagnosticWeight: 3,
      correlatedTraits: ['openness']
    },
    metadata: {
      scientificSource: 'HEXACO-PI-R (Lee & Ashton, 2018)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'HEXACO_H3_2',
    text: 'I don\'t care much about having high social status',
    category: 'personality',
    instrument: 'HEXACO-60',
    trait: 'honesty_humility',
    facet: 'greed_avoidance',
    subcategory: 'hexaco_honesty_humility',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'hexaco', 'honesty_humility', 'greed_avoidance', 'h3'],
    adaptive: {
      diagnosticWeight: 3,
      correlatedTraits: ['extraversion']
    },
    metadata: {
      scientificSource: 'HEXACO-PI-R (Lee & Ashton, 2018)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'HEXACO_H3_3',
    text: 'I am satisfied with what I have and don\'t crave wealth',
    category: 'personality',
    instrument: 'HEXACO-60',
    trait: 'honesty_humility',
    facet: 'greed_avoidance',
    subcategory: 'hexaco_honesty_humility',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'hexaco', 'honesty_humility', 'greed_avoidance', 'h3'],
    adaptive: {
      diagnosticWeight: 3,
      correlatedTraits: ['neuroticism']
    },
    metadata: {
      scientificSource: 'HEXACO-PI-R (Lee & Ashton, 2018)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'HEXACO_H3_4',
    text: 'Having a lot of money is not particularly important to me',
    category: 'personality',
    instrument: 'HEXACO-60',
    trait: 'honesty_humility',
    facet: 'greed_avoidance',
    subcategory: 'hexaco_honesty_humility',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'hexaco', 'honesty_humility', 'greed_avoidance', 'h3'],
    adaptive: {
      diagnosticWeight: 3,
      correlatedTraits: ['conscientiousness']
    },
    metadata: {
      scientificSource: 'HEXACO-PI-R (Lee & Ashton, 2018)',
      version: '1.0'
    },
    active: true
  },

  // H4: Modesty (4 questions)
  {
    questionId: 'HEXACO_H4_1',
    text: 'I don\'t think I deserve special treatment',
    category: 'personality',
    instrument: 'HEXACO-60',
    trait: 'honesty_humility',
    facet: 'modesty',
    subcategory: 'hexaco_honesty_humility',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'hexaco', 'honesty_humility', 'modesty', 'h4'],
    adaptive: {
      diagnosticWeight: 3,
      correlatedTraits: ['agreeableness']
    },
    metadata: {
      scientificSource: 'HEXACO-PI-R (Lee & Ashton, 2018)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'HEXACO_H4_2',
    text: 'I believe I am an ordinary person, not superior to others',
    category: 'personality',
    instrument: 'HEXACO-60',
    trait: 'honesty_humility',
    facet: 'modesty',
    subcategory: 'hexaco_honesty_humility',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'hexaco', 'honesty_humility', 'modesty', 'h4'],
    adaptive: {
      diagnosticWeight: 3,
      correlatedTraits: ['agreeableness']
    },
    metadata: {
      scientificSource: 'HEXACO-PI-R (Lee & Ashton, 2018)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'HEXACO_H4_3',
    text: 'I don\'t want people to think of me as important or high-status',
    category: 'personality',
    instrument: 'HEXACO-60',
    trait: 'honesty_humility',
    facet: 'modesty',
    subcategory: 'hexaco_honesty_humility',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'hexaco', 'honesty_humility', 'modesty', 'h4'],
    adaptive: {
      diagnosticWeight: 3,
      correlatedTraits: ['extraversion']
    },
    metadata: {
      scientificSource: 'HEXACO-PI-R (Lee & Ashton, 2018)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'HEXACO_H4_4',
    text: 'I view myself realistically, without exaggeration',
    category: 'personality',
    instrument: 'HEXACO-60',
    trait: 'honesty_humility',
    facet: 'modesty',
    subcategory: 'hexaco_honesty_humility',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['personality', 'hexaco', 'honesty_humility', 'modesty', 'h4'],
    adaptive: {
      diagnosticWeight: 3,
      correlatedTraits: ['neuroticism']
    },
    metadata: {
      scientificSource: 'HEXACO-PI-R (Lee & Ashton, 2018)',
      version: '1.0'
    },
    active: true
  }
];

// ============================================================================
// 3. ACES - ADVERSE CHILDHOOD EXPERIENCES (10 questions)
// ============================================================================

const acesQuestions = [
  {
    questionId: 'ACES_ABUSE_PHYSICAL',
    text: 'Before age 18, did a parent or adult in your home ever hit, beat, kick, or physically hurt you in any way?',
    category: 'trauma_screening',
    instrument: 'ACEs',
    subcategory: 'aces',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['trauma', 'childhood_adversity', 'aces', 'physical_abuse'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'ACEs Study (Felitti et al., 1998)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'ACES_ABUSE_EMOTIONAL',
    text: 'Before age 18, did a parent or adult in your home ever swear at you, insult you, or put you down repeatedly?',
    category: 'trauma_screening',
    instrument: 'ACEs',
    subcategory: 'aces',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['trauma', 'childhood_adversity', 'aces', 'emotional_abuse'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'ACEs Study (Felitti et al., 1998)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'ACES_ABUSE_SEXUAL',
    text: 'Before age 18, did an adult or person at least 5 years older ever touch you sexually or have you touch them sexually?',
    category: 'trauma_screening',
    instrument: 'ACEs',
    subcategory: 'aces',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['trauma', 'childhood_adversity', 'aces', 'sexual_abuse', 'critical'],
    adaptive: {
      diagnosticWeight: 5
    },
    metadata: {
      scientificSource: 'ACEs Study (Felitti et al., 1998)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'ACES_NEGLECT_PHYSICAL',
    text: 'Before age 18, did you often feel that you didn\'t have enough to eat, had to wear dirty clothes, or had no one to protect you?',
    category: 'trauma_screening',
    instrument: 'ACEs',
    subcategory: 'aces',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['trauma', 'childhood_adversity', 'aces', 'physical_neglect'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'ACEs Study (Felitti et al., 1998)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'ACES_NEGLECT_EMOTIONAL',
    text: 'Before age 18, did you often feel that no one in your family loved you or thought you were important or special?',
    category: 'trauma_screening',
    instrument: 'ACEs',
    subcategory: 'aces',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['trauma', 'childhood_adversity', 'aces', 'emotional_neglect'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'ACEs Study (Felitti et al., 1998)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'ACES_HOUSEHOLD_SUBSTANCE',
    text: 'Before age 18, did you live with anyone who was a problem drinker or alcoholic, or used street drugs?',
    category: 'trauma_screening',
    instrument: 'ACEs',
    subcategory: 'aces',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['trauma', 'childhood_adversity', 'aces', 'household_dysfunction', 'substance'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'ACEs Study (Felitti et al., 1998)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'ACES_HOUSEHOLD_MENTAL',
    text: 'Before age 18, was a household member depressed or mentally ill, or did a household member attempt suicide?',
    category: 'trauma_screening',
    instrument: 'ACEs',
    subcategory: 'aces',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['trauma', 'childhood_adversity', 'aces', 'household_dysfunction', 'mental_illness'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'ACEs Study (Felitti et al., 1998)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'ACES_HOUSEHOLD_INCARCERATED',
    text: 'Before age 18, did a household member go to prison?',
    category: 'trauma_screening',
    instrument: 'ACEs',
    subcategory: 'aces',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['trauma', 'childhood_adversity', 'aces', 'household_dysfunction'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'ACEs Study (Felitti et al., 1998)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'ACES_HOUSEHOLD_VIOLENCE',
    text: 'Before age 18, was your mother or stepmother often pushed, grabbed, slapped, or had something thrown at her?',
    category: 'trauma_screening',
    instrument: 'ACEs',
    subcategory: 'aces',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['trauma', 'childhood_adversity', 'aces', 'household_dysfunction', 'domestic_violence'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'ACEs Study (Felitti et al., 1998)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'ACES_HOUSEHOLD_DIVORCE',
    text: 'Before age 18, were your parents ever separated or divorced?',
    category: 'trauma_screening',
    instrument: 'ACEs',
    subcategory: 'aces',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['trauma', 'childhood_adversity', 'aces', 'household_dysfunction'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'ACEs Study (Felitti et al., 1998)',
      version: '1.0'
    },
    active: true
  }
];

// ============================================================================
// 4. COMPLEX PTSD (8 questions)
// ============================================================================

const complexPTSDQuestions = [
  // Emotion Dysregulation (3 questions)
  {
    questionId: 'CPTSD_DYSREG_1',
    text: 'I have difficulty controlling my emotions, especially anger or sadness',
    category: 'trauma_screening',
    instrument: 'ITQ',
    subcategory: 'complex_ptsd',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['trauma', 'complex_ptsd', 'emotion_dysregulation'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'International Trauma Questionnaire (Cloitre et al., 2018)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'CPTSD_DYSREG_2',
    text: 'I often feel emotionally numb or shut down',
    category: 'trauma_screening',
    instrument: 'ITQ',
    subcategory: 'complex_ptsd',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['trauma', 'complex_ptsd', 'emotion_dysregulation', 'numbing'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'International Trauma Questionnaire (Cloitre et al., 2018)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'CPTSD_DYSREG_3',
    text: 'I sometimes feel disconnected from my body or surroundings (dissociation)',
    category: 'trauma_screening',
    instrument: 'ITQ',
    subcategory: 'complex_ptsd',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['trauma', 'complex_ptsd', 'dissociation'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'International Trauma Questionnaire (Cloitre et al., 2018)',
      version: '1.0'
    },
    active: true
  },

  // Negative Self-Concept (3 questions)
  {
    questionId: 'CPTSD_NEGSELF_1',
    text: 'I feel worthless or like a failure',
    category: 'trauma_screening',
    instrument: 'ITQ',
    subcategory: 'complex_ptsd',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['trauma', 'complex_ptsd', 'negative_self_concept'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'International Trauma Questionnaire (Cloitre et al., 2018)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'CPTSD_NEGSELF_2',
    text: 'I experience persistent feelings of shame or guilt',
    category: 'trauma_screening',
    instrument: 'ITQ',
    subcategory: 'complex_ptsd',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['trauma', 'complex_ptsd', 'negative_self_concept', 'shame'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'International Trauma Questionnaire (Cloitre et al., 2018)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'CPTSD_NEGSELF_3',
    text: 'I feel permanently damaged by past experiences',
    category: 'trauma_screening',
    instrument: 'ITQ',
    subcategory: 'complex_ptsd',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['trauma', 'complex_ptsd', 'negative_self_concept'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'International Trauma Questionnaire (Cloitre et al., 2018)',
      version: '1.0'
    },
    active: true
  },

  // Interpersonal Difficulties (2 questions)
  {
    questionId: 'CPTSD_INTERPER_1',
    text: 'I have difficulty trusting others or forming close relationships',
    category: 'trauma_screening',
    instrument: 'ITQ',
    subcategory: 'complex_ptsd',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['trauma', 'complex_ptsd', 'interpersonal_difficulties'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'International Trauma Questionnaire (Cloitre et al., 2018)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'CPTSD_INTERPER_2',
    text: 'I often feel fundamentally different from other people',
    category: 'trauma_screening',
    instrument: 'ITQ',
    subcategory: 'complex_ptsd',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['trauma', 'complex_ptsd', 'interpersonal_difficulties', 'alienation'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'International Trauma Questionnaire (Cloitre et al., 2018)',
      version: '1.0'
    },
    active: true
  }
];

// ============================================================================
// 5. MANIA/HYPOMANIA SCREENING - MDQ (12 questions)
// ============================================================================

const maniaQuestions = [
  {
    questionId: 'MANIA_MDQ_1',
    text: 'Has there ever been a period of time when you felt so good or hyper that other people thought you were not your normal self?',
    category: 'clinical_psychopathology',
    instrument: 'MDQ',
    subcategory: 'mania',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['mania', 'hypomania', 'bipolar', 'mdq', 'mood_elevation'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'Mood Disorder Questionnaire (Hirschfeld et al., 2000)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'MANIA_MDQ_2',
    text: 'You felt so irritable that you shouted at people or started fights or arguments?',
    category: 'clinical_psychopathology',
    instrument: 'MDQ',
    subcategory: 'mania',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['mania', 'hypomania', 'bipolar', 'mdq', 'irritability'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'Mood Disorder Questionnaire (Hirschfeld et al., 2000)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'MANIA_MDQ_3',
    text: 'You felt much more self-confident than usual?',
    category: 'clinical_psychopathology',
    instrument: 'MDQ',
    subcategory: 'mania',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['mania', 'hypomania', 'bipolar', 'mdq', 'confidence'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'Mood Disorder Questionnaire (Hirschfeld et al., 2000)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'MANIA_MDQ_4',
    text: 'You got much less sleep than usual and found you didn\'t really miss it?',
    category: 'clinical_psychopathology',
    instrument: 'MDQ',
    subcategory: 'mania',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['mania', 'hypomania', 'bipolar', 'mdq', 'sleep'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'Mood Disorder Questionnaire (Hirschfeld et al., 2000)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'MANIA_MDQ_5',
    text: 'You were much more talkative or spoke much faster than usual?',
    category: 'clinical_psychopathology',
    instrument: 'MDQ',
    subcategory: 'mania',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['mania', 'hypomania', 'bipolar', 'mdq', 'pressured_speech'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'Mood Disorder Questionnaire (Hirschfeld et al., 2000)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'MANIA_MDQ_6',
    text: 'Thoughts raced through your head or you couldn\'t slow your mind down?',
    category: 'clinical_psychopathology',
    instrument: 'MDQ',
    subcategory: 'mania',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['mania', 'hypomania', 'bipolar', 'mdq', 'racing_thoughts'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'Mood Disorder Questionnaire (Hirschfeld et al., 2000)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'MANIA_MDQ_7',
    text: 'You were so easily distracted that the slightest thing could pull your attention away?',
    category: 'clinical_psychopathology',
    instrument: 'MDQ',
    subcategory: 'mania',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['mania', 'hypomania', 'bipolar', 'mdq', 'distractibility'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'Mood Disorder Questionnaire (Hirschfeld et al., 2000)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'MANIA_MDQ_8',
    text: 'You had much more energy than usual?',
    category: 'clinical_psychopathology',
    instrument: 'MDQ',
    subcategory: 'mania',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['mania', 'hypomania', 'bipolar', 'mdq', 'energy'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'Mood Disorder Questionnaire (Hirschfeld et al., 2000)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'MANIA_MDQ_9',
    text: 'You were much more active or did many more things than usual?',
    category: 'clinical_psychopathology',
    instrument: 'MDQ',
    subcategory: 'mania',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['mania', 'hypomania', 'bipolar', 'mdq', 'activity'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'Mood Disorder Questionnaire (Hirschfeld et al., 2000)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'MANIA_MDQ_10',
    text: 'You were much more social or outgoing than usual?',
    category: 'clinical_psychopathology',
    instrument: 'MDQ',
    subcategory: 'mania',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['mania', 'hypomania', 'bipolar', 'mdq', 'social'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'Mood Disorder Questionnaire (Hirschfeld et al., 2000)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'MANIA_MDQ_11',
    text: 'You were much more interested in sex than usual?',
    category: 'clinical_psychopathology',
    instrument: 'MDQ',
    subcategory: 'mania',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['mania', 'hypomania', 'bipolar', 'mdq', 'sexuality'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'Mood Disorder Questionnaire (Hirschfeld et al., 2000)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'MANIA_MDQ_12',
    text: 'You did things that were unusual for you or that other people might have thought were excessive, foolish, or risky?',
    category: 'clinical_psychopathology',
    instrument: 'MDQ',
    subcategory: 'mania',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['mania', 'hypomania', 'bipolar', 'mdq', 'risky_behavior'],
    adaptive: {
      diagnosticWeight: 5
    },
    metadata: {
      scientificSource: 'Mood Disorder Questionnaire (Hirschfeld et al., 2000)',
      version: '1.0'
    },
    active: true
  }
];

// ============================================================================
// 6. THOUGHT DISORDER/PSYCHOSIS SCREENING - PQ-B (18 questions)
// ============================================================================

const psychosisQuestions = [
  // Positive Symptoms (7 questions)
  {
    questionId: 'PSYCHOSIS_PQB_1',
    text: 'I have heard sounds or voices that other people can\'t hear',
    category: 'clinical_psychopathology',
    instrument: 'PQ-B',
    subcategory: 'psychotic_spectrum',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['psychosis', 'thought_disorder', 'pq_b', 'positive_symptoms', 'hallucinations', 'critical'],
    adaptive: {
      diagnosticWeight: 5
    },
    metadata: {
      scientificSource: 'Prodromal Questionnaire-Brief (Loewy et al., 2011)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'PSYCHOSIS_PQB_2',
    text: 'I have seen things that other people apparently can\'t see',
    category: 'clinical_psychopathology',
    instrument: 'PQ-B',
    subcategory: 'psychotic_spectrum',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['psychosis', 'thought_disorder', 'pq_b', 'positive_symptoms', 'hallucinations', 'critical'],
    adaptive: {
      diagnosticWeight: 5
    },
    metadata: {
      scientificSource: 'Prodromal Questionnaire-Brief (Loewy et al., 2011)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'PSYCHOSIS_PQB_3',
    text: 'I feel that people are watching me or talking about me',
    category: 'clinical_psychopathology',
    instrument: 'PQ-B',
    subcategory: 'psychotic_spectrum',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['psychosis', 'thought_disorder', 'pq_b', 'positive_symptoms', 'paranoia'],
    adaptive: {
      diagnosticWeight: 5
    },
    metadata: {
      scientificSource: 'Prodromal Questionnaire-Brief (Loewy et al., 2011)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'PSYCHOSIS_PQB_4',
    text: 'I feel that I am destined to be someone very important',
    category: 'clinical_psychopathology',
    instrument: 'PQ-B',
    subcategory: 'psychotic_spectrum',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['psychosis', 'thought_disorder', 'pq_b', 'positive_symptoms', 'grandiosity'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'Prodromal Questionnaire-Brief (Loewy et al., 2011)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'PSYCHOSIS_PQB_5',
    text: 'I believe that I have special abilities or powers',
    category: 'clinical_psychopathology',
    instrument: 'PQ-B',
    subcategory: 'psychotic_spectrum',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['psychosis', 'thought_disorder', 'pq_b', 'positive_symptoms', 'magical_thinking'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'Prodromal Questionnaire-Brief (Loewy et al., 2011)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'PSYCHOSIS_PQB_6',
    text: 'I feel that my thoughts are being controlled by outside forces',
    category: 'clinical_psychopathology',
    instrument: 'PQ-B',
    subcategory: 'psychotic_spectrum',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['psychosis', 'thought_disorder', 'pq_b', 'positive_symptoms', 'thought_control', 'critical'],
    adaptive: {
      diagnosticWeight: 5
    },
    metadata: {
      scientificSource: 'Prodromal Questionnaire-Brief (Loewy et al., 2011)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'PSYCHOSIS_PQB_7',
    text: 'I believe others can hear my thoughts',
    category: 'clinical_psychopathology',
    instrument: 'PQ-B',
    subcategory: 'psychotic_spectrum',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['psychosis', 'thought_disorder', 'pq_b', 'positive_symptoms', 'thought_broadcasting', 'critical'],
    adaptive: {
      diagnosticWeight: 5
    },
    metadata: {
      scientificSource: 'Prodromal Questionnaire-Brief (Loewy et al., 2011)',
      version: '1.0'
    },
    active: true
  },

  // Negative Symptoms (5 questions)
  {
    questionId: 'PSYCHOSIS_PQB_8',
    text: 'I have lost interest in things I used to enjoy',
    category: 'clinical_psychopathology',
    instrument: 'PQ-B',
    subcategory: 'psychotic_spectrum',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['psychosis', 'thought_disorder', 'pq_b', 'negative_symptoms', 'anhedonia'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Prodromal Questionnaire-Brief (Loewy et al., 2011)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'PSYCHOSIS_PQB_9',
    text: 'I have trouble feeling emotions or feeling close to people',
    category: 'clinical_psychopathology',
    instrument: 'PQ-B',
    subcategory: 'psychotic_spectrum',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['psychosis', 'thought_disorder', 'pq_b', 'negative_symptoms', 'flat_affect'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Prodromal Questionnaire-Brief (Loewy et al., 2011)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'PSYCHOSIS_PQB_10',
    text: 'I have difficulty speaking or expressing my thoughts',
    category: 'clinical_psychopathology',
    instrument: 'PQ-B',
    subcategory: 'psychotic_spectrum',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['psychosis', 'thought_disorder', 'pq_b', 'negative_symptoms', 'alogia'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'Prodromal Questionnaire-Brief (Loewy et al., 2011)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'PSYCHOSIS_PQB_11',
    text: 'I lack motivation and find it hard to get started on tasks',
    category: 'clinical_psychopathology',
    instrument: 'PQ-B',
    subcategory: 'psychotic_spectrum',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['psychosis', 'thought_disorder', 'pq_b', 'negative_symptoms', 'avolition'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Prodromal Questionnaire-Brief (Loewy et al., 2011)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'PSYCHOSIS_PQB_12',
    text: 'I have withdrawn from friends and social activities',
    category: 'clinical_psychopathology',
    instrument: 'PQ-B',
    subcategory: 'psychotic_spectrum',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['psychosis', 'thought_disorder', 'pq_b', 'negative_symptoms', 'social_withdrawal'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Prodromal Questionnaire-Brief (Loewy et al., 2011)',
      version: '1.0'
    },
    active: true
  },

  // Disorganization (5 questions)
  {
    questionId: 'PSYCHOSIS_PQB_13',
    text: 'My thoughts jump from topic to topic in confusing ways',
    category: 'clinical_psychopathology',
    instrument: 'PQ-B',
    subcategory: 'psychotic_spectrum',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['psychosis', 'thought_disorder', 'pq_b', 'disorganization', 'tangential_thinking'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'Prodromal Questionnaire-Brief (Loewy et al., 2011)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'PSYCHOSIS_PQB_14',
    text: 'I have trouble organizing my thoughts or speech',
    category: 'clinical_psychopathology',
    instrument: 'PQ-B',
    subcategory: 'psychotic_spectrum',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['psychosis', 'thought_disorder', 'pq_b', 'disorganization'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'Prodromal Questionnaire-Brief (Loewy et al., 2011)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'PSYCHOSIS_PQB_15',
    text: 'People have difficulty understanding what I\'m trying to say',
    category: 'clinical_psychopathology',
    instrument: 'PQ-B',
    subcategory: 'psychotic_spectrum',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['psychosis', 'thought_disorder', 'pq_b', 'disorganization', 'communication'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'Prodromal Questionnaire-Brief (Loewy et al., 2011)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'PSYCHOSIS_PQB_16',
    text: 'My behavior seems strange or bizarre to others',
    category: 'clinical_psychopathology',
    instrument: 'PQ-B',
    subcategory: 'psychotic_spectrum',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['psychosis', 'thought_disorder', 'pq_b', 'disorganization', 'bizarre_behavior'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'Prodromal Questionnaire-Brief (Loewy et al., 2011)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'PSYCHOSIS_PQB_17',
    text: 'I feel confused or disoriented frequently',
    category: 'clinical_psychopathology',
    instrument: 'PQ-B',
    subcategory: 'psychotic_spectrum',
    responseType: 'binary',
    options: BINARY_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['psychosis', 'thought_disorder', 'pq_b', 'disorganization', 'confusion'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'Prodromal Questionnaire-Brief (Loewy et al., 2011)',
      version: '1.0'
    },
    active: true
  },

  // Distress Question (1 question)
  {
    questionId: 'PSYCHOSIS_PQB_DISTRESS',
    text: 'Overall, how much distress do unusual experiences (like those described above) cause you?',
    category: 'clinical_psychopathology',
    instrument: 'PQ-B',
    subcategory: 'psychotic_spectrum',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['psychosis', 'thought_disorder', 'pq_b', 'distress'],
    adaptive: {
      diagnosticWeight: 5
    },
    metadata: {
      scientificSource: 'Prodromal Questionnaire-Brief (Loewy et al., 2011)',
      version: '1.0'
    },
    active: true
  }
];

// ============================================================================
// MAIN SEEDING FUNCTION
// ============================================================================

async function seedPhase2Questions() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');

    const counts = {
      neoExpansion: 0,
      hexaco: 0,
      aces: 0,
      complexPTSD: 0,
      mania: 0,
      psychosis: 0
    };

    // Seed NEO Expansion
    logger.info('\n1. Seeding NEO Facet Expansion (90 questions)...');
    for (const question of neoExpansion) {
      const existing = await QuestionBank.findOne({ questionId: question.questionId });
      if (!existing) {
        await QuestionBank.create(question);
        counts.neoExpansion++;
      }
    }
    logger.info(`✅ Added ${counts.neoExpansion} NEO expansion questions`);

    // Seed HEXACO
    logger.info('\n2. Seeding HEXACO Honesty-Humility (18 questions)...');
    for (const question of hexacoQuestions) {
      const existing = await QuestionBank.findOne({ questionId: question.questionId });
      if (!existing) {
        await QuestionBank.create(question);
        counts.hexaco++;
      }
    }
    logger.info(`✅ Added ${counts.hexaco} HEXACO questions`);

    // Seed ACEs
    logger.info('\n3. Seeding ACEs (10 questions)...');
    for (const question of acesQuestions) {
      const existing = await QuestionBank.findOne({ questionId: question.questionId });
      if (!existing) {
        await QuestionBank.create(question);
        counts.aces++;
      }
    }
    logger.info(`✅ Added ${counts.aces} ACEs questions`);

    // Seed Complex PTSD
    logger.info('\n4. Seeding Complex PTSD (8 questions)...');
    for (const question of complexPTSDQuestions) {
      const existing = await QuestionBank.findOne({ questionId: question.questionId });
      if (!existing) {
        await QuestionBank.create(question);
        counts.complexPTSD++;
      }
    }
    logger.info(`✅ Added ${counts.complexPTSD} Complex PTSD questions`);

    // Seed Mania
    logger.info('\n5. Seeding Mania/Hypomania - MDQ (12 questions)...');
    for (const question of maniaQuestions) {
      const existing = await QuestionBank.findOne({ questionId: question.questionId });
      if (!existing) {
        await QuestionBank.create(question);
        counts.mania++;
      }
    }
    logger.info(`✅ Added ${counts.mania} Mania screening questions`);

    // Seed Psychosis
    logger.info('\n6. Seeding Thought Disorder - PQ-B (18 questions)...');
    for (const question of psychosisQuestions) {
      const existing = await QuestionBank.findOne({ questionId: question.questionId });
      if (!existing) {
        await QuestionBank.create(question);
        counts.psychosis++;
      }
    }
    logger.info(`✅ Added ${counts.psychosis} Psychosis screening questions`);

    // Summary
    const totalAdded = Object.values(counts).reduce((a, b) => a + b, 0);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ PHASE 2 SEEDING COMPLETE');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`NEO Facet Expansion:        ${counts.neoExpansion} questions`);
    console.log(`HEXACO Honesty-Humility:    ${counts.hexaco} questions`);
    console.log(`ACEs:                       ${counts.aces} questions`);
    console.log(`Complex PTSD:               ${counts.complexPTSD} questions`);
    console.log(`Mania/Hypomania (MDQ):      ${counts.mania} questions`);
    console.log(`Thought Disorder (PQ-B):    ${counts.psychosis} questions`);
    console.log('───────────────────────────────────────────────────────────────');
    console.log(`TOTAL QUESTIONS ADDED:      ${totalAdded}`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Get new total count
    const totalQuestions = await QuestionBank.countDocuments({ active: true });
    console.log(`Database total active questions: ${totalQuestions}\n`);

    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    logger.error('Error seeding Phase 2 questions:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedPhase2Questions();
