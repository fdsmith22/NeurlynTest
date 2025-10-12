#!/usr/bin/env node

/**
 * Phase 3 Comprehensive Question Seeding Script
 *
 * Seeds all Phase 3 components:
 * 1. Resilience & Coping (17 questions)
 * 2. Expanded Interpersonal Functioning (17 questions)
 * 3. Borderline Personality Features (13 questions)
 * 4. Somatic Symptoms - PHQ-15 (12 questions)
 * 5. Treatment Indicators (14 questions)
 *
 * Total: 73 questions
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

const FREQUENCY_OPTIONS = [
  { value: 0, label: 'Not at all', score: 0 },
  { value: 1, label: 'Several days', score: 1 },
  { value: 2, label: 'More than half the days', score: 2 },
  { value: 3, label: 'Nearly every day', score: 3 }
];

// ============================================================================
// 1. RESILIENCE & COPING (17 questions)
// ============================================================================

const resilienceCopingQuestions = [
  // RESILIENCE - Adaptability (3 questions)
  {
    questionId: 'RESILIENCE_ADAPT_1',
    text: 'I am able to adapt when changes occur in my life',
    category: 'personality',
    instrument: 'CD-RISC',
    subcategory: 'resilience_coping',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['resilience', 'adaptability', 'coping'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Connor-Davidson Resilience Scale (CD-RISC)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'RESILIENCE_ADAPT_2',
    text: 'I can bounce back after illness, injury, or other hardships',
    category: 'personality',
    instrument: 'CD-RISC',
    subcategory: 'resilience_coping',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['resilience', 'adaptability', 'recovery'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Connor-Davidson Resilience Scale (CD-RISC)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'RESILIENCE_ADAPT_3',
    text: 'I am able to handle unpleasant or painful feelings like sadness, fear, and anger',
    category: 'personality',
    instrument: 'CD-RISC',
    subcategory: 'resilience_coping',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['resilience', 'emotion_regulation', 'distress_tolerance'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Connor-Davidson Resilience Scale (CD-RISC)',
      version: '1.0'
    },
    active: true
  },

  // RESILIENCE - Sense of Control (3 questions)
  {
    questionId: 'RESILIENCE_CONTROL_1',
    text: 'I believe I can achieve my goals, even when there are obstacles',
    category: 'personality',
    instrument: 'CD-RISC',
    subcategory: 'resilience_coping',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['resilience', 'self_efficacy', 'control'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Connor-Davidson Resilience Scale (CD-RISC)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'RESILIENCE_CONTROL_2',
    text: 'I tend to focus on solving problems rather than feeling overwhelmed by them',
    category: 'personality',
    instrument: 'CD-RISC',
    subcategory: 'resilience_coping',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['resilience', 'problem_solving', 'active_coping'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Connor-Davidson Resilience Scale (CD-RISC)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'RESILIENCE_CONTROL_3',
    text: 'When things look hopeless, I don\'t give up',
    category: 'personality',
    instrument: 'CD-RISC',
    subcategory: 'resilience_coping',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['resilience', 'perseverance', 'hope'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Connor-Davidson Resilience Scale (CD-RISC)',
      version: '1.0'
    },
    active: true
  },

  // RESILIENCE - Social Support (2 questions)
  {
    questionId: 'RESILIENCE_SUPPORT_1',
    text: 'I have close and secure relationships that help me during times of stress',
    category: 'personality',
    instrument: 'CD-RISC',
    subcategory: 'resilience_coping',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['resilience', 'social_support', 'relationships'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Connor-Davidson Resilience Scale (CD-RISC)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'RESILIENCE_SUPPORT_2',
    text: 'I am comfortable asking for help when I need it',
    category: 'personality',
    instrument: 'CD-RISC',
    subcategory: 'resilience_coping',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['resilience', 'help_seeking', 'self_advocacy'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Connor-Davidson Resilience Scale (CD-RISC)',
      version: '1.0'
    },
    active: true
  },

  // COPING - Adaptive Strategies (5 questions)
  {
    questionId: 'COPING_ADAPTIVE_1',
    text: 'I take action to try to make difficult situations better',
    category: 'personality',
    instrument: 'Brief COPE',
    subcategory: 'resilience_coping',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['coping', 'active_coping', 'problem_focused'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Brief COPE (Carver, 1997)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'COPING_ADAPTIVE_2',
    text: 'I try to come up with a strategy about what to do when facing problems',
    category: 'personality',
    instrument: 'Brief COPE',
    subcategory: 'resilience_coping',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['coping', 'planning', 'problem_solving'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Brief COPE (Carver, 1997)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'COPING_ADAPTIVE_3',
    text: 'I try to see stressful situations in a different light, to make them seem more positive',
    category: 'personality',
    instrument: 'Brief COPE',
    subcategory: 'resilience_coping',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['coping', 'reframing', 'cognitive_restructuring'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Brief COPE (Carver, 1997)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'COPING_ADAPTIVE_4',
    text: 'I get emotional support from others when stressed',
    category: 'personality',
    instrument: 'Brief COPE',
    subcategory: 'resilience_coping',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['coping', 'social_support', 'emotional_support'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Brief COPE (Carver, 1997)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'COPING_ADAPTIVE_5',
    text: 'I learn to live with stressful situations',
    category: 'personality',
    instrument: 'Brief COPE',
    subcategory: 'resilience_coping',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['coping', 'acceptance', 'adaptation'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Brief COPE (Carver, 1997)',
      version: '1.0'
    },
    active: true
  },

  // COPING - Maladaptive Strategies (4 questions)
  {
    questionId: 'COPING_MALADAPT_1',
    text: 'I give up trying to deal with difficult situations',
    category: 'personality',
    instrument: 'Brief COPE',
    subcategory: 'resilience_coping',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['coping', 'avoidance', 'maladaptive', 'behavioral_disengagement'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Brief COPE (Carver, 1997)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'COPING_MALADAPT_2',
    text: 'I refuse to believe that stressful things have happened',
    category: 'personality',
    instrument: 'Brief COPE',
    subcategory: 'resilience_coping',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['coping', 'denial', 'maladaptive'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Brief COPE (Carver, 1997)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'COPING_MALADAPT_3',
    text: 'I use alcohol or drugs to make myself feel better',
    category: 'personality',
    instrument: 'Brief COPE',
    subcategory: 'resilience_coping',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['coping', 'substance_use', 'maladaptive', 'avoidance'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Brief COPE (Carver, 1997)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'COPING_MALADAPT_4',
    text: 'I criticize myself for problems or failures',
    category: 'personality',
    instrument: 'Brief COPE',
    subcategory: 'resilience_coping',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['coping', 'self_blame', 'maladaptive'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Brief COPE (Carver, 1997)',
      version: '1.0'
    },
    active: true
  }
];

// ============================================================================
// 2. EXPANDED INTERPERSONAL FUNCTIONING (17 questions)
// ============================================================================

const interpersonalQuestions = [
  // ATTACHMENT EXPANSION - Anxious (3 questions)
  {
    questionId: 'ATTACHMENT_ANXIOUS_1',
    text: 'I worry that people close to me will abandon me',
    category: 'attachment',
    instrument: 'ECR-R',
    subcategory: 'anxious_attachment',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['attachment', 'anxious', 'abandonment_fear'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Experiences in Close Relationships-Revised (ECR-R)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'ATTACHMENT_ANXIOUS_2',
    text: 'I need a lot of reassurance that people care about me',
    category: 'attachment',
    instrument: 'ECR-R',
    subcategory: 'anxious_attachment',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['attachment', 'anxious', 'reassurance_seeking'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Experiences in Close Relationships-Revised (ECR-R)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'ATTACHMENT_ANXIOUS_3',
    text: 'My relationships are frequently on my mind',
    category: 'attachment',
    instrument: 'ECR-R',
    subcategory: 'anxious_attachment',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['attachment', 'anxious', 'preoccupation'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Experiences in Close Relationships-Revised (ECR-R)',
      version: '1.0'
    },
    active: true
  },

  // ATTACHMENT EXPANSION - Avoidant (3 questions)
  {
    questionId: 'ATTACHMENT_AVOIDANT_1',
    text: 'I prefer not to show others how I feel deep down',
    category: 'attachment',
    instrument: 'ECR-R',
    subcategory: 'avoidant_attachment',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['attachment', 'avoidant', 'emotional_distance'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Experiences in Close Relationships-Revised (ECR-R)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'ATTACHMENT_AVOIDANT_2',
    text: 'I feel comfortable depending on myself rather than others',
    category: 'attachment',
    instrument: 'ECR-R',
    subcategory: 'avoidant_attachment',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['attachment', 'avoidant', 'self_reliance'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Experiences in Close Relationships-Revised (ECR-R)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'ATTACHMENT_AVOIDANT_3',
    text: 'I don\'t feel comfortable opening up to others',
    category: 'attachment',
    instrument: 'ECR-R',
    subcategory: 'avoidant_attachment',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['attachment', 'avoidant', 'intimacy_avoidance'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Experiences in Close Relationships-Revised (ECR-R)',
      version: '1.0'
    },
    active: true
  },

  // INTERPERSONAL CIRCUMPLEX (10 questions - 2 per octant, focusing on 5 most clinically relevant)
  {
    questionId: 'IIP_DOMINEERING_1',
    text: 'I am too controlling of other people',
    category: 'personality',
    instrument: 'IIP-32',
    subcategory: 'interpersonal_circumplex',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['interpersonal', 'circumplex', 'domineering', 'control'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Inventory of Interpersonal Problems-32 (IIP-32)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'IIP_DOMINEERING_2',
    text: 'I try to change other people too much',
    category: 'personality',
    instrument: 'IIP-32',
    subcategory: 'interpersonal_circumplex',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['interpersonal', 'circumplex', 'domineering'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Inventory of Interpersonal Problems-32 (IIP-32)',
      version: '1.0'
    },
    active: true
  },

  {
    questionId: 'IIP_VINDICTIVE_1',
    text: 'I hold grudges for too long',
    category: 'personality',
    instrument: 'IIP-32',
    subcategory: 'interpersonal_circumplex',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['interpersonal', 'circumplex', 'vindictive', 'hostility'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Inventory of Interpersonal Problems-32 (IIP-32)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'IIP_VINDICTIVE_2',
    text: 'I have difficulty trusting other people',
    category: 'personality',
    instrument: 'IIP-32',
    subcategory: 'interpersonal_circumplex',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['interpersonal', 'circumplex', 'vindictive', 'distrust'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Inventory of Interpersonal Problems-32 (IIP-32)',
      version: '1.0'
    },
    active: true
  },

  {
    questionId: 'IIP_COLD_1',
    text: 'It is hard for me to feel close to other people',
    category: 'personality',
    instrument: 'IIP-32',
    subcategory: 'interpersonal_circumplex',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['interpersonal', 'circumplex', 'cold', 'distant'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Inventory of Interpersonal Problems-32 (IIP-32)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'IIP_COLD_2',
    text: 'It is hard for me to show affection to people',
    category: 'personality',
    instrument: 'IIP-32',
    subcategory: 'interpersonal_circumplex',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['interpersonal', 'circumplex', 'cold', 'affection'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Inventory of Interpersonal Problems-32 (IIP-32)',
      version: '1.0'
    },
    active: true
  },

  {
    questionId: 'IIP_SUBMISSIVE_1',
    text: 'It is hard for me to be assertive with another person',
    category: 'personality',
    instrument: 'IIP-32',
    subcategory: 'interpersonal_circumplex',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['interpersonal', 'circumplex', 'submissive', 'nonassertive'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Inventory of Interpersonal Problems-32 (IIP-32)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'IIP_SUBMISSIVE_2',
    text: 'It is hard for me to say "no" to other people',
    category: 'personality',
    instrument: 'IIP-32',
    subcategory: 'interpersonal_circumplex',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['interpersonal', 'circumplex', 'submissive', 'boundaries'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Inventory of Interpersonal Problems-32 (IIP-32)',
      version: '1.0'
    },
    active: true
  },

  {
    questionId: 'IIP_NURTURANT_1',
    text: 'I put other people\'s needs before my own too much',
    category: 'personality',
    instrument: 'IIP-32',
    subcategory: 'interpersonal_circumplex',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['interpersonal', 'circumplex', 'overly_nurturant', 'self_sacrifice'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Inventory of Interpersonal Problems-32 (IIP-32)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'IIP_NURTURANT_2',
    text: 'I am overly generous to other people',
    category: 'personality',
    instrument: 'IIP-32',
    subcategory: 'interpersonal_circumplex',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['interpersonal', 'circumplex', 'overly_nurturant'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Inventory of Interpersonal Problems-32 (IIP-32)',
      version: '1.0'
    },
    active: true
  },

  // RELATIONSHIP QUALITY (1 question)
  {
    questionId: 'RELATIONSHIP_QUALITY_1',
    text: 'Overall, I am satisfied with the quality of my close relationships',
    category: 'attachment',
    instrument: 'NEURLYN',
    subcategory: 'relationship_quality',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['relationships', 'satisfaction', 'quality'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Neurlyn Custom',
      version: '1.0'
    },
    active: true
  }
];

// ============================================================================
// 3. BORDERLINE PERSONALITY FEATURES (13 questions)
// ============================================================================

const borderlineQuestions = [
  // Emotional Instability (3 questions)
  {
    questionId: 'BORDERLINE_EMOTIONAL_1',
    text: 'My emotions change very quickly and I often experience extreme sadness, anger, and anxiety',
    category: 'clinical_psychopathology',
    instrument: 'MSI-BPD',
    subcategory: 'borderline_features',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['borderline', 'emotional_instability', 'mood_shifts', 'bpd'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'McLean Screening Instrument for BPD (MSI-BPD)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'BORDERLINE_EMOTIONAL_2',
    text: 'I have a lot of trouble controlling my anger',
    category: 'clinical_psychopathology',
    instrument: 'MSI-BPD',
    subcategory: 'borderline_features',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['borderline', 'anger', 'impulse_control', 'bpd'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'McLean Screening Instrument for BPD (MSI-BPD)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'BORDERLINE_EMOTIONAL_3',
    text: 'I have difficulty regulating my emotions',
    category: 'clinical_psychopathology',
    instrument: 'MSI-BPD',
    subcategory: 'borderline_features',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['borderline', 'emotion_regulation', 'bpd'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'McLean Screening Instrument for BPD (MSI-BPD)',
      version: '1.0'
    },
    active: true
  },

  // Identity Disturbance (2 questions)
  {
    questionId: 'BORDERLINE_IDENTITY_1',
    text: 'I have an unclear or unstable sense of who I am',
    category: 'clinical_psychopathology',
    instrument: 'MSI-BPD',
    subcategory: 'borderline_features',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['borderline', 'identity_disturbance', 'self_image', 'bpd'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'McLean Screening Instrument for BPD (MSI-BPD)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'BORDERLINE_IDENTITY_2',
    text: 'My values, goals, or career plans change frequently',
    category: 'clinical_psychopathology',
    instrument: 'MSI-BPD',
    subcategory: 'borderline_features',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['borderline', 'identity_disturbance', 'instability', 'bpd'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'McLean Screening Instrument for BPD (MSI-BPD)',
      version: '1.0'
    },
    active: true
  },

  // Interpersonal Instability (3 questions)
  {
    questionId: 'BORDERLINE_INTERPERSONAL_1',
    text: 'My relationships are very intense, unstable, and alternate between extremes of over-involvement and withdrawal',
    category: 'clinical_psychopathology',
    instrument: 'MSI-BPD',
    subcategory: 'borderline_features',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['borderline', 'relationship_instability', 'bpd'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'McLean Screening Instrument for BPD (MSI-BPD)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'BORDERLINE_INTERPERSONAL_2',
    text: 'I will do anything to avoid being abandoned or left alone',
    category: 'clinical_psychopathology',
    instrument: 'MSI-BPD',
    subcategory: 'borderline_features',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['borderline', 'abandonment', 'fear', 'bpd'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'McLean Screening Instrument for BPD (MSI-BPD)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'BORDERLINE_INTERPERSONAL_3',
    text: 'I alternate between seeing people as all good or all bad',
    category: 'clinical_psychopathology',
    instrument: 'MSI-BPD',
    subcategory: 'borderline_features',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['borderline', 'splitting', 'black_white_thinking', 'bpd'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'McLean Screening Instrument for BPD (MSI-BPD)',
      version: '1.0'
    },
    active: true
  },

  // Impulsivity (2 questions)
  {
    questionId: 'BORDERLINE_IMPULSIVE_1',
    text: 'I engage in impulsive behaviors (such as spending sprees, risky sex, substance abuse, reckless driving, or binge eating)',
    category: 'clinical_psychopathology',
    instrument: 'MSI-BPD',
    subcategory: 'borderline_features',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['borderline', 'impulsivity', 'risky_behavior', 'bpd'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'McLean Screening Instrument for BPD (MSI-BPD)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'BORDERLINE_IMPULSIVE_2',
    text: 'I have made suicide attempts or engaged in self-harming behavior (such as cutting or burning)',
    category: 'clinical_psychopathology',
    instrument: 'MSI-BPD',
    subcategory: 'borderline_features',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['borderline', 'self_harm', 'suicide', 'critical', 'bpd'],
    adaptive: {
      diagnosticWeight: 5
    },
    metadata: {
      scientificSource: 'McLean Screening Instrument for BPD (MSI-BPD)',
      version: '1.0'
    },
    active: true
  },

  // Chronic Emptiness (1 question)
  {
    questionId: 'BORDERLINE_EMPTINESS_1',
    text: 'I often feel empty inside',
    category: 'clinical_psychopathology',
    instrument: 'MSI-BPD',
    subcategory: 'borderline_features',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['borderline', 'emptiness', 'bpd'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'McLean Screening Instrument for BPD (MSI-BPD)',
      version: '1.0'
    },
    active: true
  },

  // Dissociation/Paranoia (1 question)
  {
    questionId: 'BORDERLINE_DISSOCIATION_1',
    text: 'When under stress, I experience paranoid thoughts or feel disconnected from myself or my surroundings',
    category: 'clinical_psychopathology',
    instrument: 'MSI-BPD',
    subcategory: 'borderline_features',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['borderline', 'dissociation', 'paranoia', 'stress', 'bpd'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'McLean Screening Instrument for BPD (MSI-BPD)',
      version: '1.0'
    },
    active: true
  },

  // Chronic Anger (1 question already covered in emotional instability - adding overall criterion)
  {
    questionId: 'BORDERLINE_OVERALL_1',
    text: 'Patterns of intense emotions, unstable relationships, and impulsive behaviors cause significant problems in my life.',
    category: 'clinical_psychopathology',
    instrument: 'MSI-BPD',
    subcategory: 'borderline_features',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['borderline', 'impairment', 'distress', 'bpd'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'McLean Screening Instrument for BPD (MSI-BPD)',
      version: '1.0'
    },
    active: true
  }
];

// ============================================================================
// 4. SOMATIC SYMPTOMS - PHQ-15 (12 questions)
// ============================================================================

const somaticQuestions = [
  // PHQ-15 Physical Symptoms (10 questions)
  {
    questionId: 'SOMATIC_PHQ15_1',
    text: 'Over the past month, how much have you been bothered by stomach pain?',
    category: 'clinical_psychopathology',
    instrument: 'PHQ-15',
    subcategory: 'somatic_symptoms',
    responseType: 'likert',
    options: [
      { value: 0, label: 'Not bothered at all', score: 0 },
      { value: 1, label: 'Bothered a little', score: 1 },
      { value: 2, label: 'Bothered a lot', score: 2 }
    ],
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['somatic', 'pain', 'gastrointestinal', 'phq15'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Patient Health Questionnaire-15 (PHQ-15)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'SOMATIC_PHQ15_2',
    text: 'Over the past month, how much have you been bothered by back pain?',
    category: 'clinical_psychopathology',
    instrument: 'PHQ-15',
    subcategory: 'somatic_symptoms',
    responseType: 'likert',
    options: [
      { value: 0, label: 'Not bothered at all', score: 0 },
      { value: 1, label: 'Bothered a little', score: 1 },
      { value: 2, label: 'Bothered a lot', score: 2 }
    ],
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['somatic', 'pain', 'back_pain', 'phq15'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Patient Health Questionnaire-15 (PHQ-15)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'SOMATIC_PHQ15_3',
    text: 'Over the past month, how much have you been bothered by pain in your arms, legs, or joints?',
    category: 'clinical_psychopathology',
    instrument: 'PHQ-15',
    subcategory: 'somatic_symptoms',
    responseType: 'likert',
    options: [
      { value: 0, label: 'Not bothered at all', score: 0 },
      { value: 1, label: 'Bothered a little', score: 1 },
      { value: 2, label: 'Bothered a lot', score: 2 }
    ],
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['somatic', 'pain', 'joint_pain', 'phq15'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Patient Health Questionnaire-15 (PHQ-15)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'SOMATIC_PHQ15_4',
    text: 'Over the past month, how much have you been bothered by headaches?',
    category: 'clinical_psychopathology',
    instrument: 'PHQ-15',
    subcategory: 'somatic_symptoms',
    responseType: 'likert',
    options: [
      { value: 0, label: 'Not bothered at all', score: 0 },
      { value: 1, label: 'Bothered a little', score: 1 },
      { value: 2, label: 'Bothered a lot', score: 2 }
    ],
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['somatic', 'pain', 'headaches', 'phq15'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Patient Health Questionnaire-15 (PHQ-15)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'SOMATIC_PHQ15_5',
    text: 'Over the past month, how much have you been bothered by chest pain?',
    category: 'clinical_psychopathology',
    instrument: 'PHQ-15',
    subcategory: 'somatic_symptoms',
    responseType: 'likert',
    options: [
      { value: 0, label: 'Not bothered at all', score: 0 },
      { value: 1, label: 'Bothered a little', score: 1 },
      { value: 2, label: 'Bothered a lot', score: 2 }
    ],
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['somatic', 'pain', 'chest_pain', 'phq15'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Patient Health Questionnaire-15 (PHQ-15)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'SOMATIC_PHQ15_6',
    text: 'Over the past month, how much have you been bothered by feeling your heart pound or race?',
    category: 'clinical_psychopathology',
    instrument: 'PHQ-15',
    subcategory: 'somatic_symptoms',
    responseType: 'likert',
    options: [
      { value: 0, label: 'Not bothered at all', score: 0 },
      { value: 1, label: 'Bothered a little', score: 1 },
      { value: 2, label: 'Bothered a lot', score: 2 }
    ],
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['somatic', 'cardiopulmonary', 'heart_racing', 'phq15'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Patient Health Questionnaire-15 (PHQ-15)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'SOMATIC_PHQ15_7',
    text: 'Over the past month, how much have you been bothered by shortness of breath?',
    category: 'clinical_psychopathology',
    instrument: 'PHQ-15',
    subcategory: 'somatic_symptoms',
    responseType: 'likert',
    options: [
      { value: 0, label: 'Not bothered at all', score: 0 },
      { value: 1, label: 'Bothered a little', score: 1 },
      { value: 2, label: 'Bothered a lot', score: 2 }
    ],
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['somatic', 'cardiopulmonary', 'shortness_of_breath', 'phq15'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Patient Health Questionnaire-15 (PHQ-15)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'SOMATIC_PHQ15_8',
    text: 'Over the past month, how much have you been bothered by nausea, gas, or indigestion?',
    category: 'clinical_psychopathology',
    instrument: 'PHQ-15',
    subcategory: 'somatic_symptoms',
    responseType: 'likert',
    options: [
      { value: 0, label: 'Not bothered at all', score: 0 },
      { value: 1, label: 'Bothered a little', score: 1 },
      { value: 2, label: 'Bothered a lot', score: 2 }
    ],
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['somatic', 'gastrointestinal', 'nausea', 'phq15'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Patient Health Questionnaire-15 (PHQ-15)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'SOMATIC_PHQ15_9',
    text: 'Over the past month, how much have you been bothered by constipation, loose bowels, or diarrhea?',
    category: 'clinical_psychopathology',
    instrument: 'PHQ-15',
    subcategory: 'somatic_symptoms',
    responseType: 'likert',
    options: [
      { value: 0, label: 'Not bothered at all', score: 0 },
      { value: 1, label: 'Bothered a little', score: 1 },
      { value: 2, label: 'Bothered a lot', score: 2 }
    ],
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['somatic', 'gastrointestinal', 'bowel', 'phq15'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Patient Health Questionnaire-15 (PHQ-15)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'SOMATIC_PHQ15_10',
    text: 'Over the past month, how much have you been bothered by dizziness?',
    category: 'clinical_psychopathology',
    instrument: 'PHQ-15',
    subcategory: 'somatic_symptoms',
    responseType: 'likert',
    options: [
      { value: 0, label: 'Not bothered at all', score: 0 },
      { value: 1, label: 'Bothered a little', score: 1 },
      { value: 2, label: 'Bothered a lot', score: 2 }
    ],
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['somatic', 'dizziness', 'phq15'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Patient Health Questionnaire-15 (PHQ-15)',
      version: '1.0'
    },
    active: true
  },

  // Health Anxiety (2 questions)
  {
    questionId: 'SOMATIC_HEALTH_ANXIETY_1',
    text: 'I worry a lot about having a serious illness',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN',
    subcategory: 'somatic_symptoms',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['somatic', 'health_anxiety', 'illness_worry'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Neurlyn Custom (Health Anxiety)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'SOMATIC_HEALTH_ANXIETY_2',
    text: 'I am very sensitive to physical sensations in my body',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN',
    subcategory: 'somatic_symptoms',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['somatic', 'health_anxiety', 'body_awareness'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Neurlyn Custom (Health Anxiety)',
      version: '1.0'
    },
    active: true
  }
];

// ============================================================================
// 5. TREATMENT INDICATORS (14 questions)
// ============================================================================

const treatmentIndicatorsQuestions = [
  // Treatment Motivation (4 questions)
  {
    questionId: 'TREATMENT_MOTIVATION_1',
    text: 'I recognize that I have problems or difficulties that I need to work on',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN',
    subcategory: 'treatment_indicators',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['treatment', 'motivation', 'insight', 'readiness'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Stages of Change Model (Prochaska & DiClemente)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'TREATMENT_MOTIVATION_2',
    text: 'I am willing to work on changing problematic patterns in my life',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN',
    subcategory: 'treatment_indicators',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['treatment', 'motivation', 'commitment', 'change_readiness'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Stages of Change Model (Prochaska & DiClemente)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'TREATMENT_MOTIVATION_3',
    text: 'I am open to seeking professional help for my difficulties',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN',
    subcategory: 'treatment_indicators',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['treatment', 'motivation', 'help_seeking', 'openness'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Treatment Engagement Concepts',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'TREATMENT_MOTIVATION_4',
    text: 'I believe that my situation can improve with effort',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN',
    subcategory: 'treatment_indicators',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['treatment', 'motivation', 'hope', 'optimism'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Hope Theory (Snyder)',
      version: '1.0'
    },
    active: true
  },

  // Aggression Risk (4 questions)
  {
    questionId: 'TREATMENT_AGGRESSION_1',
    text: 'I have gotten into physical fights with other people',
    category: 'clinical_psychopathology',
    instrument: 'AQ-Brief',
    subcategory: 'treatment_indicators',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['treatment', 'aggression', 'violence', 'physical_aggression'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'Aggression Questionnaire (Buss & Perry, 1992)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'TREATMENT_AGGRESSION_2',
    text: 'I have urges to hurt others when angry',
    category: 'clinical_psychopathology',
    instrument: 'AQ-Brief',
    subcategory: 'treatment_indicators',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['treatment', 'aggression', 'violent_urges', 'anger'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'Aggression Questionnaire (Buss & Perry, 1992)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'TREATMENT_AGGRESSION_3',
    text: 'I often get into arguments with others',
    category: 'clinical_psychopathology',
    instrument: 'AQ-Brief',
    subcategory: 'treatment_indicators',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['treatment', 'aggression', 'verbal_aggression', 'conflict'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Aggression Questionnaire (Buss & Perry, 1992)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'TREATMENT_AGGRESSION_4',
    text: 'I have difficulty controlling my temper',
    category: 'clinical_psychopathology',
    instrument: 'AQ-Brief',
    subcategory: 'treatment_indicators',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['treatment', 'aggression', 'anger_control', 'impulse_control'],
    adaptive: {
      diagnosticWeight: 4
    },
    metadata: {
      scientificSource: 'Aggression Questionnaire (Buss & Perry, 1992)',
      version: '1.0'
    },
    active: true
  },

  // Social Support (4 questions)
  {
    questionId: 'TREATMENT_SUPPORT_1',
    text: 'There is a special person who is around when I am in need',
    category: 'personality',
    instrument: 'MSPSS',
    subcategory: 'treatment_indicators',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['treatment', 'social_support', 'significant_other'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Multidimensional Scale of Perceived Social Support (MSPSS)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'TREATMENT_SUPPORT_2',
    text: 'My family really tries to help me',
    category: 'personality',
    instrument: 'MSPSS',
    subcategory: 'treatment_indicators',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['treatment', 'social_support', 'family'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Multidimensional Scale of Perceived Social Support (MSPSS)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'TREATMENT_SUPPORT_3',
    text: 'I have friends with whom I can share my joys and sorrows',
    category: 'personality',
    instrument: 'MSPSS',
    subcategory: 'treatment_indicators',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['treatment', 'social_support', 'friends'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Multidimensional Scale of Perceived Social Support (MSPSS)',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'TREATMENT_SUPPORT_4',
    text: 'I can count on people to help me when I really need it',
    category: 'personality',
    instrument: 'MSPSS',
    subcategory: 'treatment_indicators',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['treatment', 'social_support', 'practical_support'],
    adaptive: {
      diagnosticWeight: 2
    },
    metadata: {
      scientificSource: 'Multidimensional Scale of Perceived Social Support (MSPSS)',
      version: '1.0'
    },
    active: true
  },

  // Environmental Stressors (2 questions)
  {
    questionId: 'TREATMENT_STRESSORS_1',
    text: 'I am currently experiencing significant financial stress',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN',
    subcategory: 'treatment_indicators',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['treatment', 'stressors', 'financial', 'environmental'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Life Stressors Assessment',
      version: '1.0'
    },
    active: true
  },
  {
    questionId: 'TREATMENT_STRESSORS_2',
    text: 'I am dealing with major life changes or stressful events (such as job loss, divorce, health problems, or loss of a loved one)',
    category: 'clinical_psychopathology',
    instrument: 'NEURLYN',
    subcategory: 'treatment_indicators',
    responseType: 'likert',
    options: LIKERT_OPTIONS,
    reverseScored: false,
    tier: 'comprehensive',
    tags: ['treatment', 'stressors', 'life_events', 'environmental'],
    adaptive: {
      diagnosticWeight: 3
    },
    metadata: {
      scientificSource: 'Life Stressors Assessment',
      version: '1.0'
    },
    active: true
  }
];

// ============================================================================
// MAIN SEEDING FUNCTION
// ============================================================================

async function seedPhase3Questions() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');

    const counts = {
      resilienceCoping: 0,
      interpersonal: 0,
      borderline: 0,
      somatic: 0,
      treatmentIndicators: 0
    };

    // Seed Resilience & Coping
    logger.info('\n1. Seeding Resilience & Coping (17 questions)...');
    for (const question of resilienceCopingQuestions) {
      const existing = await QuestionBank.findOne({ questionId: question.questionId });
      if (!existing) {
        await QuestionBank.create(question);
        counts.resilienceCoping++;
      }
    }
    logger.info(`✅ Added ${counts.resilienceCoping} Resilience & Coping questions`);

    // Seed Expanded Interpersonal Functioning
    logger.info('\n2. Seeding Expanded Interpersonal Functioning (17 questions)...');
    for (const question of interpersonalQuestions) {
      const existing = await QuestionBank.findOne({ questionId: question.questionId });
      if (!existing) {
        await QuestionBank.create(question);
        counts.interpersonal++;
      }
    }
    logger.info(`✅ Added ${counts.interpersonal} Interpersonal Functioning questions`);

    // Seed Borderline Features
    logger.info('\n3. Seeding Borderline Personality Features (13 questions)...');
    for (const question of borderlineQuestions) {
      const existing = await QuestionBank.findOne({ questionId: question.questionId });
      if (!existing) {
        await QuestionBank.create(question);
        counts.borderline++;
      }
    }
    logger.info(`✅ Added ${counts.borderline} Borderline Features questions`);

    // Seed Somatic Symptoms
    logger.info('\n4. Seeding Somatic Symptoms - PHQ-15 (12 questions)...');
    for (const question of somaticQuestions) {
      const existing = await QuestionBank.findOne({ questionId: question.questionId });
      if (!existing) {
        await QuestionBank.create(question);
        counts.somatic++;
      }
    }
    logger.info(`✅ Added ${counts.somatic} Somatic Symptoms questions`);

    // Seed Treatment Indicators
    logger.info('\n5. Seeding Treatment Indicators (14 questions)...');
    for (const question of treatmentIndicatorsQuestions) {
      const existing = await QuestionBank.findOne({ questionId: question.questionId });
      if (!existing) {
        await QuestionBank.create(question);
        counts.treatmentIndicators++;
      }
    }
    logger.info(`✅ Added ${counts.treatmentIndicators} Treatment Indicators questions`);

    // Summary
    const totalAdded = Object.values(counts).reduce((a, b) => a + b, 0);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ PHASE 3 SEEDING COMPLETE');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Resilience & Coping:             ${counts.resilienceCoping} questions`);
    console.log(`Interpersonal Functioning:       ${counts.interpersonal} questions`);
    console.log(`Borderline Features:             ${counts.borderline} questions`);
    console.log(`Somatic Symptoms (PHQ-15):       ${counts.somatic} questions`);
    console.log(`Treatment Indicators:            ${counts.treatmentIndicators} questions`);
    console.log('───────────────────────────────────────────────────────────────');
    console.log(`TOTAL QUESTIONS ADDED:           ${totalAdded}`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Get new total count
    const totalQuestions = await QuestionBank.countDocuments({ active: true });
    console.log(`Database total active questions: ${totalQuestions}\n`);

    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    logger.error('Error seeding Phase 3 questions:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedPhase3Questions();
