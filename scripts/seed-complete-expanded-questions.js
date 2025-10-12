#!/usr/bin/env node

/**
 * Complete Expanded Questions Seeder - Adds ALL 234+ questions
 * Includes neurodiversity, psychoanalytic, and trauma-informed questions
 */

require('dotenv').config();
const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
const logger = require('../utils/logger');

// Executive Function Questions (Enhanced)
const executiveFunctionQuestions = [
  // Task Initiation & Procrastination
  {
    text: 'I start tasks right away rather than procrastinating',
    subcategory: 'executive_function',
    domain: 'task_initiation'
  },
  {
    text: 'I put off important tasks until the last minute',
    subcategory: 'executive_function',
    domain: 'procrastination'
  },
  {
    text: 'I need external deadlines to get things done',
    subcategory: 'executive_function',
    domain: 'motivation'
  },

  // Time Blindness & Management
  {
    text: 'I lose track of time when engaged in activities I enjoy',
    subcategory: 'executive_function',
    domain: 'time_blindness'
  },
  {
    text: 'I need multiple alarms to ensure I wake up or remember appointments',
    subcategory: 'executive_function',
    domain: 'time_management'
  },
  {
    text: 'I underestimate how long tasks will take',
    subcategory: 'executive_function',
    domain: 'time_estimation'
  },
  {
    text: "I'm frequently late despite my best efforts",
    subcategory: 'executive_function',
    domain: 'punctuality'
  },

  // Task Switching & Flexibility
  {
    text: 'I can easily switch between different tasks',
    subcategory: 'executive_function',
    domain: 'cognitive_flexibility'
  },
  {
    text: 'I struggle to return to a task after being interrupted',
    subcategory: 'executive_function',
    domain: 'task_resumption'
  },
  {
    text: "I get stuck on one activity and can't move on",
    subcategory: 'executive_function',
    domain: 'perseveration'
  },

  // Working Memory
  {
    text: 'I often forget where I put things',
    subcategory: 'executive_function',
    domain: 'working_memory'
  },
  {
    text: 'I walk into rooms and forget why I went there',
    subcategory: 'executive_function',
    domain: 'prospective_memory'
  },
  {
    text: "I need to write everything down or I'll forget",
    subcategory: 'executive_function',
    domain: 'memory_compensation'
  },
  {
    text: "I forget appointments even when they're important to me",
    subcategory: 'executive_function',
    domain: 'appointment_memory'
  },

  // Organization & Planning
  {
    text: 'My living space is usually organized and tidy',
    subcategory: 'executive_function',
    domain: 'organization'
  },
  {
    text: 'I create detailed plans before starting projects',
    subcategory: 'executive_function',
    domain: 'planning'
  },
  {
    text: 'I use organizational tools effectively (calendars, to-do lists)',
    subcategory: 'executive_function',
    domain: 'tool_use'
  },
  {
    text: 'I feel overwhelmed when faced with multi-step tasks',
    subcategory: 'executive_function',
    domain: 'task_breakdown'
  },

  // Emotional Regulation
  {
    text: 'I can manage my emotions effectively under stress',
    subcategory: 'executive_function',
    domain: 'emotional_regulation'
  },
  {
    text: 'Small frustrations can derail my entire day',
    subcategory: 'executive_function',
    domain: 'frustration_tolerance'
  }
];

// Sensory Processing Questions (Comprehensive)
const sensoryProcessingQuestions = [
  // Tactile Sensitivity
  {
    text: 'Certain fabric textures make me extremely uncomfortable',
    subcategory: 'sensory_processing',
    domain: 'tactile'
  },
  {
    text: 'I cut tags out of clothing because they bother me',
    subcategory: 'sensory_processing',
    domain: 'tactile'
  },
  {
    text: 'Light touches feel painful or overwhelming',
    subcategory: 'sensory_processing',
    domain: 'tactile'
  },
  {
    text: 'I prefer deep pressure hugs over light touches',
    subcategory: 'sensory_processing',
    domain: 'proprioceptive'
  },

  // Auditory Processing
  {
    text: 'I notice subtle sounds that others miss',
    subcategory: 'sensory_processing',
    domain: 'auditory'
  },
  {
    text: 'Background noise makes it impossible for me to concentrate',
    subcategory: 'sensory_processing',
    domain: 'auditory'
  },
  {
    text: 'I use noise-canceling headphones or earplugs regularly',
    subcategory: 'sensory_processing',
    domain: 'auditory_coping'
  },
  {
    text: 'Sudden loud noises cause me physical pain or panic',
    subcategory: 'sensory_processing',
    domain: 'auditory_startle'
  },

  // Visual Sensitivity
  {
    text: 'Bright lights give me headaches or make me feel overwhelmed',
    subcategory: 'sensory_processing',
    domain: 'visual'
  },
  {
    text: 'I prefer dim lighting or natural light',
    subcategory: 'sensory_processing',
    domain: 'visual_preference'
  },
  {
    text: 'Fluorescent lights make me feel sick or anxious',
    subcategory: 'sensory_processing',
    domain: 'visual_fluorescent'
  },
  {
    text: 'I notice visual details that others overlook',
    subcategory: 'sensory_processing',
    domain: 'visual_detail'
  },

  // Smell & Taste
  {
    text: 'Strong smells make me feel nauseous or overwhelmed',
    subcategory: 'sensory_processing',
    domain: 'olfactory'
  },
  {
    text: 'I have a very limited diet due to texture or taste sensitivities',
    subcategory: 'sensory_processing',
    domain: 'gustatory'
  },
  {
    text: "I can smell things others don't notice",
    subcategory: 'sensory_processing',
    domain: 'olfactory_sensitivity'
  },

  // Vestibular & Proprioceptive
  {
    text: 'I feel dizzy or nauseous on swings or rides',
    subcategory: 'sensory_processing',
    domain: 'vestibular'
  },
  {
    text: 'I crave movement and physical activity',
    subcategory: 'sensory_processing',
    domain: 'sensory_seeking'
  },
  {
    text: 'I bump into things or misjudge distances frequently',
    subcategory: 'sensory_processing',
    domain: 'proprioceptive'
  }
];

// Masking & Camouflaging Questions
const maskingQuestions = [
  // Social Masking
  {
    text: 'I rehearse conversations before having them',
    subcategory: 'masking',
    domain: 'social_preparation'
  },
  {
    text: "I copy other people's expressions or phrases to fit in",
    subcategory: 'masking',
    domain: 'mimicry'
  },
  {
    text: 'I have different personas for different social situations',
    subcategory: 'masking',
    domain: 'persona_switching'
  },
  {
    text: "I force myself to make eye contact even when it's uncomfortable",
    subcategory: 'masking',
    domain: 'eye_contact'
  },
  {
    text: "I suppress my natural reactions to appear 'normal'",
    subcategory: 'masking',
    domain: 'suppression'
  },

  // Energy Cost
  {
    text: 'I feel exhausted after social interactions',
    subcategory: 'masking',
    domain: 'social_exhaustion'
  },
  {
    text: 'I need days to recover after social events',
    subcategory: 'masking',
    domain: 'recovery_time'
  },
  {
    text: "Maintaining my 'normal' appearance is exhausting",
    subcategory: 'masking',
    domain: 'effort'
  },

  // Identity Impact
  {
    text: "I don't know who I really am beneath the mask",
    subcategory: 'masking',
    domain: 'identity_confusion'
  },
  {
    text: "I feel like I'm performing rather than being myself",
    subcategory: 'masking',
    domain: 'performance'
  },
  {
    text: "I've lost touch with my authentic preferences",
    subcategory: 'masking',
    domain: 'authenticity_loss'
  },
  {
    text: 'People would reject the real me',
    subcategory: 'masking',
    domain: 'rejection_fear'
  },

  // Stimming Suppression
  {
    text: 'I hide my need to fidget or move repetitively',
    subcategory: 'masking',
    domain: 'stimming_suppression'
  },
  {
    text: "I've trained myself not to show excitement physically",
    subcategory: 'masking',
    domain: 'emotion_suppression'
  },
  {
    text: 'I suppress my natural body movements in public',
    subcategory: 'masking',
    domain: 'movement_suppression'
  }
];

// Emotional Regulation Questions
const emotionalRegulationQuestions = [
  // Emotional Intensity
  {
    text: "My emotions feel more intense than other people's",
    subcategory: 'emotional_regulation',
    domain: 'intensity'
  },
  {
    text: 'I experience emotions as physical sensations in my body',
    subcategory: 'emotional_regulation',
    domain: 'somatic'
  },
  {
    text: 'Happy moments feel euphoric and overwhelming',
    subcategory: 'emotional_regulation',
    domain: 'positive_intensity'
  },

  // Emotional Volatility
  {
    text: 'My mood can change rapidly throughout the day',
    subcategory: 'emotional_regulation',
    domain: 'mood_swings'
  },
  {
    text: 'Small triggers cause disproportionate emotional responses',
    subcategory: 'emotional_regulation',
    domain: 'reactivity'
  },
  {
    text: 'I struggle to return to baseline after emotional upset',
    subcategory: 'emotional_regulation',
    domain: 'recovery'
  },

  // Rejection Sensitive Dysphoria
  {
    text: 'Perceived criticism feels like physical pain',
    subcategory: 'emotional_regulation',
    domain: 'rejection_sensitivity'
  },
  {
    text: 'I assume people are mad at me without evidence',
    subcategory: 'emotional_regulation',
    domain: 'rejection_perception'
  },
  {
    text: 'I avoid situations where I might face rejection',
    subcategory: 'emotional_regulation',
    domain: 'rejection_avoidance'
  },

  // Emotional Awareness
  {
    text: "I struggle to identify what emotion I'm feeling",
    subcategory: 'emotional_regulation',
    domain: 'alexithymia'
  },
  {
    text: "I don't notice I'm stressed until I'm overwhelmed",
    subcategory: 'emotional_regulation',
    domain: 'awareness_delay'
  },
  {
    text: 'Others notice my emotions before I do',
    subcategory: 'emotional_regulation',
    domain: 'external_awareness'
  }
];

// Trauma-Informed Questions
const traumaInformedQuestions = [
  // Hypervigilance
  {
    text: "I'm constantly scanning for potential threats",
    subcategory: 'trauma_screening',
    domain: 'hypervigilance'
  },
  {
    text: 'I startle easily at unexpected sounds or movements',
    subcategory: 'trauma_screening',
    domain: 'startle_response'
  },
  {
    text: "I can't relax even in safe environments",
    subcategory: 'trauma_screening',
    domain: 'chronic_tension'
  },

  // Dissociation
  {
    text: 'I feel disconnected from my body',
    subcategory: 'trauma_screening',
    domain: 'dissociation'
  },
  {
    text: 'Reality sometimes feels unreal or dreamlike',
    subcategory: 'trauma_screening',
    domain: 'derealization'
  },
  {
    text: "I lose time or can't remember parts of my day",
    subcategory: 'trauma_screening',
    domain: 'time_loss'
  },

  // Trust & Safety
  {
    text: 'I have difficulty trusting others',
    subcategory: 'trauma_screening',
    domain: 'trust'
  },
  {
    text: 'I need to know all exits in a room',
    subcategory: 'trauma_screening',
    domain: 'escape_planning'
  },
  {
    text: 'I feel safer alone than with others',
    subcategory: 'trauma_screening',
    domain: 'isolation_safety'
  },

  // Somatic Symptoms
  {
    text: 'My body holds tension even when I try to relax',
    subcategory: 'trauma_screening',
    domain: 'somatic_tension'
  },
  {
    text: 'I experience unexplained physical pain',
    subcategory: 'trauma_screening',
    domain: 'somatic_pain'
  },
  {
    text: 'My body reacts before my mind processes danger',
    subcategory: 'trauma_screening',
    domain: 'somatic_response'
  }
];

// Attachment Style Questions
const attachmentQuestions = [
  // Anxious Attachment
  {
    text: 'I worry constantly about my relationships ending',
    subcategory: 'attachment_style',
    domain: 'anxious'
  },
  {
    text: 'I need constant reassurance from loved ones',
    subcategory: 'attachment_style',
    domain: 'anxious'
  },
  {
    text: "I panic when people don't respond to messages quickly",
    subcategory: 'attachment_style',
    domain: 'anxious'
  },

  // Avoidant Attachment
  {
    text: 'I prefer to handle problems alone',
    subcategory: 'attachment_style',
    domain: 'avoidant'
  },
  {
    text: 'I feel uncomfortable when people get too close emotionally',
    subcategory: 'attachment_style',
    domain: 'avoidant'
  },
  {
    text: 'I keep parts of myself hidden even from close friends',
    subcategory: 'attachment_style',
    domain: 'avoidant'
  },

  // Disorganized Attachment
  {
    text: 'I both crave and fear close relationships',
    subcategory: 'attachment_style',
    domain: 'disorganized'
  },
  {
    text: 'My relationship patterns are chaotic and unpredictable',
    subcategory: 'attachment_style',
    domain: 'disorganized'
  },
  {
    text: "I don't have a consistent way of connecting with others",
    subcategory: 'attachment_style',
    domain: 'disorganized'
  },

  // Secure Attachment
  {
    text: 'I feel comfortable depending on others and having them depend on me',
    subcategory: 'attachment_style',
    domain: 'secure'
  },
  {
    text: 'I can express my needs directly in relationships',
    subcategory: 'attachment_style',
    domain: 'secure'
  },
  {
    text: 'I trust that relationships can weather difficulties',
    subcategory: 'attachment_style',
    domain: 'secure'
  }
];

// Enneagram Questions
const enneagramQuestions = [
  // Type 1 - Perfectionist
  {
    text: 'I have a strong inner critic that never stops',
    subcategory: 'enneagram',
    domain: 'type_1'
  },
  {
    text: 'I notice mistakes and imperfections immediately',
    subcategory: 'enneagram',
    domain: 'type_1'
  },

  // Type 2 - Helper
  {
    text: 'I often know what others need before they do',
    subcategory: 'enneagram',
    domain: 'type_2'
  },
  {
    text: 'I feel guilty when I prioritize my own needs',
    subcategory: 'enneagram',
    domain: 'type_2'
  },

  // Type 3 - Achiever
  {
    text: 'My worth is tied to my achievements',
    subcategory: 'enneagram',
    domain: 'type_3'
  },
  {
    text: 'I adapt my personality to succeed in different situations',
    subcategory: 'enneagram',
    domain: 'type_3'
  },

  // Type 4 - Individualist
  {
    text: 'I feel fundamentally different from everyone else',
    subcategory: 'enneagram',
    domain: 'type_4'
  },
  {
    text: "I'm drawn to melancholy and deep emotions",
    subcategory: 'enneagram',
    domain: 'type_4'
  },

  // Type 5 - Investigator
  {
    text: 'I need to understand everything before I can act',
    subcategory: 'enneagram',
    domain: 'type_5'
  },
  {
    text: 'I hoard knowledge and resources for future needs',
    subcategory: 'enneagram',
    domain: 'type_5'
  },

  // Type 6 - Loyalist
  {
    text: 'I constantly plan for worst-case scenarios',
    subcategory: 'enneagram',
    domain: 'type_6'
  },
  {
    text: "I test people's loyalty before trusting them",
    subcategory: 'enneagram',
    domain: 'type_6'
  },

  // Type 7 - Enthusiast
  {
    text: 'I avoid negative emotions by staying busy',
    subcategory: 'enneagram',
    domain: 'type_7'
  },
  {
    text: 'I always have multiple backup plans for fun',
    subcategory: 'enneagram',
    domain: 'type_7'
  },

  // Type 8 - Challenger
  {
    text: 'I automatically take charge in group situations',
    subcategory: 'enneagram',
    domain: 'type_8'
  },
  {
    text: 'Showing vulnerability feels like weakness',
    subcategory: 'enneagram',
    domain: 'type_8'
  },

  // Type 9 - Peacemaker
  {
    text: "I merge with others' opinions to avoid conflict",
    subcategory: 'enneagram',
    domain: 'type_9'
  },
  {
    text: 'I struggle to identify my own wants and needs',
    subcategory: 'enneagram',
    domain: 'type_9'
  }
];

// Jungian Cognitive Functions
const jungianQuestions = [
  // Introverted Intuition (Ni)
  {
    text: 'I see patterns and connections others miss',
    subcategory: 'cognitive_functions',
    domain: 'Ni'
  },
  {
    text: 'I have sudden insights that prove to be accurate',
    subcategory: 'cognitive_functions',
    domain: 'Ni'
  },

  // Extroverted Intuition (Ne)
  {
    text: 'I see endless possibilities in every situation',
    subcategory: 'cognitive_functions',
    domain: 'Ne'
  },
  {
    text: 'I make unexpected connections between ideas',
    subcategory: 'cognitive_functions',
    domain: 'Ne'
  },

  // Introverted Thinking (Ti)
  {
    text: 'I need to understand how things work at a fundamental level',
    subcategory: 'cognitive_functions',
    domain: 'Ti'
  },
  {
    text: 'I create my own logical frameworks',
    subcategory: 'cognitive_functions',
    domain: 'Ti'
  },

  // Extroverted Thinking (Te)
  {
    text: 'I focus on efficiency and measurable results',
    subcategory: 'cognitive_functions',
    domain: 'Te'
  },
  {
    text: 'I organize the external world to achieve goals',
    subcategory: 'cognitive_functions',
    domain: 'Te'
  },

  // Introverted Feeling (Fi)
  {
    text: 'I have a strong internal sense of right and wrong',
    subcategory: 'cognitive_functions',
    domain: 'Fi'
  },
  {
    text: 'My values are deeply personal and non-negotiable',
    subcategory: 'cognitive_functions',
    domain: 'Fi'
  },

  // Extroverted Feeling (Fe)
  {
    text: 'I naturally harmonize with the emotional atmosphere',
    subcategory: 'cognitive_functions',
    domain: 'Fe'
  },
  {
    text: 'I prioritize group harmony over personal preferences',
    subcategory: 'cognitive_functions',
    domain: 'Fe'
  },

  // Introverted Sensing (Si)
  {
    text: 'I compare present experiences to past memories',
    subcategory: 'cognitive_functions',
    domain: 'Si'
  },
  {
    text: 'I value tradition and proven methods',
    subcategory: 'cognitive_functions',
    domain: 'Si'
  },

  // Extroverted Sensing (Se)
  {
    text: "I'm highly aware of my physical environment",
    subcategory: 'cognitive_functions',
    domain: 'Se'
  },
  {
    text: 'I live fully in the present moment',
    subcategory: 'cognitive_functions',
    domain: 'Se'
  }
];

// Learning Style Questions
const learningStyleQuestions = [
  {
    text: 'I learn best by doing rather than reading',
    subcategory: 'learning_style',
    domain: 'kinesthetic'
  },
  {
    text: 'I need visual aids to understand concepts',
    subcategory: 'learning_style',
    domain: 'visual'
  },
  {
    text: 'I remember things better when I hear them explained',
    subcategory: 'learning_style',
    domain: 'auditory'
  },
  {
    text: 'I need to understand the big picture before details',
    subcategory: 'learning_style',
    domain: 'global'
  },
  {
    text: 'I prefer step-by-step sequential instructions',
    subcategory: 'learning_style',
    domain: 'sequential'
  },
  {
    text: 'I learn through trial and error',
    subcategory: 'learning_style',
    domain: 'experimental'
  },
  {
    text: 'I need to teach others to truly understand something',
    subcategory: 'learning_style',
    domain: 'teaching'
  },
  {
    text: 'I learn best in complete silence',
    subcategory: 'learning_style',
    domain: 'environmental'
  }
];

// Special Interests & Monotropism
const specialInterestQuestions = [
  {
    text: 'I have intense interests that consume most of my thoughts',
    subcategory: 'special_interests',
    domain: 'intensity'
  },
  {
    text: 'I can talk about my interests for hours without noticing time',
    subcategory: 'special_interests',
    domain: 'hyperfocus'
  },
  {
    text: 'I collect detailed information about specific topics',
    subcategory: 'special_interests',
    domain: 'information_gathering'
  },
  {
    text: 'My interests bring me more joy than social activities',
    subcategory: 'special_interests',
    domain: 'priority'
  },
  {
    text: 'I struggle to engage with topics outside my interests',
    subcategory: 'special_interests',
    domain: 'narrow_focus'
  },
  {
    text: 'My interests have remained consistent for years',
    subcategory: 'special_interests',
    domain: 'persistence'
  }
];

async function seedCompleteExpandedQuestions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test');
    logger.info('Connected to MongoDB');

    // Don't delete existing - we're adding to them
    const existingCount = await QuestionBank.countDocuments();
    logger.info(`Found ${existingCount} existing questions`);

    const questions = [];
    let questionId = existingCount + 1;

    // Helper function to determine adaptive criteria based on question content
    const getAdaptiveCriteria = (category, subcategory, domain, text, index) => {
      const criteria = {
        isBaseline: false,
        baselinePriority: null,
        adaptiveCriteria: {
          triggerTraits: [],
          triggerPatterns: [],
          followUpTo: []
        }
      };

      // Mark key questions as baseline based on category and index
      if (category === 'neurodiversity') {
        // Select key neurodiversity baseline questions
        const baselineSubcategories = ['executive_function', 'sensory_processing', 'masking'];
        if (baselineSubcategories.includes(subcategory) && index < 2) {
          criteria.isBaseline = true;
          criteria.baselinePriority = index + 1;
        } else {
          // Add adaptive criteria for non-baseline questions
          if (subcategory === 'executive_function') {
            criteria.adaptiveCriteria.triggerTraits.push(
              { trait: 'adhd', threshold: 3.5 },
              { trait: 'executive_dysfunction', threshold: 3.0 }
            );
            criteria.adaptiveCriteria.triggerPatterns.push(
              'high_adhd_indicators',
              'executive_challenges'
            );
          } else if (subcategory === 'sensory_processing') {
            criteria.adaptiveCriteria.triggerTraits.push(
              { trait: 'autism', threshold: 3.5 },
              { trait: 'sensory_sensitivity', threshold: 3.0 }
            );
            criteria.adaptiveCriteria.triggerPatterns.push(
              'sensory_overwhelm',
              'autism_indicators'
            );
          } else if (subcategory === 'masking') {
            criteria.adaptiveCriteria.triggerTraits.push(
              { trait: 'masking_behavior', threshold: 3.0 },
              { trait: 'social_anxiety', threshold: 3.5 }
            );
            criteria.adaptiveCriteria.triggerPatterns.push(
              'masking_behaviors',
              'social_camouflaging'
            );
          } else if (subcategory === 'emotional_regulation') {
            criteria.adaptiveCriteria.triggerTraits.push(
              { trait: 'neuroticism', threshold: 3.5 },
              { trait: 'emotional_intensity', threshold: 3.0 }
            );
            criteria.adaptiveCriteria.triggerPatterns.push(
              'emotional_dysregulation',
              'high_sensitivity'
            );
          } else if (subcategory === 'special_interests') {
            criteria.adaptiveCriteria.triggerTraits.push(
              { trait: 'autism', threshold: 3.0 },
              { trait: 'openness', threshold: 4.0 }
            );
            criteria.adaptiveCriteria.triggerPatterns.push(
              'intense_interests',
              'autism_indicators'
            );
          }
        }
      } else if (category === 'trauma_screening') {
        // Select key trauma baseline questions
        if (index < 1 && subcategory === 'hypervigilance') {
          criteria.isBaseline = true;
          criteria.baselinePriority = 8;
        } else {
          // Add adaptive criteria for trauma-related questions
          criteria.adaptiveCriteria.triggerTraits.push(
            { trait: 'trauma_indicators', threshold: 3.0 },
            { trait: 'neuroticism', threshold: 4.0 }
          );
          criteria.adaptiveCriteria.triggerPatterns.push(
            'trauma_responses',
            'hypervigilance_indicators'
          );
        }
      } else if (category === 'attachment') {
        if (index < 1) {
          criteria.isBaseline = true;
          criteria.baselinePriority = 9;
        } else {
          // Add adaptive criteria based on attachment style
          if (domain === 'anxious') {
            criteria.adaptiveCriteria.triggerTraits.push(
              { trait: 'neuroticism', threshold: 3.5 },
              { trait: 'attachment_anxiety', threshold: 3.0 }
            );
            criteria.adaptiveCriteria.triggerPatterns.push(
              'anxious_attachment',
              'relationship_anxiety'
            );
          } else if (domain === 'avoidant') {
            criteria.adaptiveCriteria.triggerTraits.push(
              { trait: 'introversion', threshold: 3.5 },
              { trait: 'independence', threshold: 4.0 }
            );
            criteria.adaptiveCriteria.triggerPatterns.push(
              'avoidant_attachment',
              'emotional_distance'
            );
          }
        }
      } else if (category === 'enneagram') {
        // Enneagram questions are adaptive follow-ups to personality traits
        if (domain === 'type_1') {
          criteria.adaptiveCriteria.triggerTraits.push(
            { trait: 'conscientiousness', threshold: 4.0 },
            { trait: 'perfectionism', threshold: 3.5 }
          );
        } else if (domain === 'type_4') {
          criteria.adaptiveCriteria.triggerTraits.push(
            { trait: 'openness', threshold: 4.0 },
            { trait: 'neuroticism', threshold: 3.5 }
          );
        } else if (domain === 'type_5') {
          criteria.adaptiveCriteria.triggerTraits.push(
            { trait: 'introversion', threshold: 3.5 },
            { trait: 'openness', threshold: 4.0 }
          );
        } else if (domain === 'type_8') {
          criteria.adaptiveCriteria.triggerTraits.push(
            { trait: 'extraversion', threshold: 4.0 },
            { trait: 'dominance', threshold: 3.5 }
          );
        }
        criteria.adaptiveCriteria.triggerPatterns.push(`enneagram_${domain}`);
      } else if (category === 'cognitive_functions') {
        // MBTI cognitive functions adaptive questions
        criteria.adaptiveCriteria.triggerTraits.push({
          trait:
            domain === 'Ni' || domain === 'Ti' || domain === 'Fi' || domain === 'Si'
              ? 'introversion'
              : 'extraversion',
          threshold: 3.5
        });
        criteria.adaptiveCriteria.triggerPatterns.push(
          `cognitive_${domain.toLowerCase()}`,
          'mbti_indicators'
        );
      } else if (category === 'learning_style') {
        // Learning style questions are adaptive based on cognitive patterns
        criteria.adaptiveCriteria.triggerTraits.push(
          { trait: 'openness', threshold: 3.5 },
          { trait: 'learning_preference', threshold: 3.0 }
        );
        criteria.adaptiveCriteria.triggerPatterns.push(
          'learning_challenges',
          'cognitive_preferences'
        );
      }

      return criteria;
    };

    // Helper function to format questions
    const formatQuestions = (questionSet, category, instrument) => {
      return questionSet.map((q, index) => {
        const adaptiveCriteria = getAdaptiveCriteria(
          category,
          q.subcategory,
          q.domain,
          q.text,
          index
        );
        return {
          questionId: `${instrument}_${questionId++}`,
          text: q.text,
          category: category,
          subcategory: q.subcategory,
          domain: q.domain || q.subcategory,
          instrument: instrument,
          trait: q.domain || q.subcategory,
          responseType: 'likert',
          options: [
            { value: 1, label: 'Never', score: 1 },
            { value: 2, label: 'Rarely', score: 2 },
            { value: 3, label: 'Sometimes', score: 3 },
            { value: 4, label: 'Often', score: 4 },
            { value: 5, label: 'Always', score: 5 }
          ],
          weight: 1.0,
          tier: 'core',
          active: true,
          adaptive: adaptiveCriteria,
          metadata: {
            addedDate: new Date(),
            version: '2.0',
            scientificSource: instrument
          }
        };
      });
    };

    // Add all neurodiversity questions
    questions.push(
      ...formatQuestions(executiveFunctionQuestions, 'neurodiversity', 'NEURLYN_EXECUTIVE')
    );
    questions.push(
      ...formatQuestions(sensoryProcessingQuestions, 'neurodiversity', 'NEURLYN_SENSORY')
    );
    questions.push(...formatQuestions(maskingQuestions, 'neurodiversity', 'NEURLYN_MASKING'));
    questions.push(
      ...formatQuestions(emotionalRegulationQuestions, 'neurodiversity', 'NEURLYN_EMOTIONAL')
    );
    questions.push(
      ...formatQuestions(specialInterestQuestions, 'neurodiversity', 'NEURLYN_INTERESTS')
    );

    // Add trauma-informed questions
    questions.push(
      ...formatQuestions(traumaInformedQuestions, 'trauma_screening', 'NEURLYN_TRAUMA')
    );

    // Add attachment questions
    questions.push(...formatQuestions(attachmentQuestions, 'attachment', 'NEURLYN_ATTACHMENT'));

    // Add enneagram questions
    questions.push(...formatQuestions(enneagramQuestions, 'enneagram', 'NEURLYN_ENNEAGRAM'));

    // Add Jungian cognitive functions
    questions.push(...formatQuestions(jungianQuestions, 'cognitive_functions', 'NEURLYN_JUNGIAN'));

    // Add learning style questions
    questions.push(
      ...formatQuestions(learningStyleQuestions, 'learning_style', 'NEURLYN_LEARNING')
    );

    // Insert all questions
    if (questions.length > 0) {
      await QuestionBank.insertMany(questions);
      logger.info(`✅ Successfully added ${questions.length} expanded questions`);
    }

    // Final summary
    const totalCount = await QuestionBank.countDocuments();
    const summary = await QuestionBank.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // console.log('\n📊 Complete Question Bank Summary:');
    // console.log(`   Total Questions: ${totalCount}`);
    summary.forEach(cat => {
      // console.log(`   ├── ${cat._id}: ${cat.count}`);
    });

    // Detailed breakdown by subcategory
    const subcategorySummary = await QuestionBank.aggregate([
      { $match: { subcategory: { $exists: true } } },
      {
        $group: { _id: { category: '$category', subcategory: '$subcategory' }, count: { $sum: 1 } }
      },
      { $sort: { '_id.category': 1, '_id.subcategory': 1 } }
    ]);

    // console.log('\n📋 Detailed Breakdown:');
    let currentCategory = '';
    subcategorySummary.forEach(item => {
      if (item._id.category !== currentCategory) {
        currentCategory = item._id.category;
        // console.log(`\n${currentCategory}:`);
      }
      // console.log(`   - ${item._id.subcategory}: ${item.count} questions`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedCompleteExpandedQuestions();
}

module.exports = { seedCompleteExpandedQuestions };
