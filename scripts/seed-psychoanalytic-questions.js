const mongoose = require('mongoose');
require('dotenv').config();

// Jungian Cognitive Functions Assessment
const jungianQuestions = [
  // Extraverted Intuition (Ne)
  {
    text: 'I see connections and possibilities everywhere I look',
    category: 'cognitive_functions',
    subcategory: 'jungian',
    domain: 'Ne',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { Ne: 0.9, openness: 0.7 },
    personalizationMarkers: ['divergent_thinking', 'possibility_awareness']
  },
  {
    text: 'I get energized by brainstorming and exploring new ideas',
    category: 'cognitive_functions',
    subcategory: 'jungian',
    domain: 'Ne',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { Ne: 0.8, extraversion: 0.6 },
    personalizationMarkers: ['creative_energy', 'idea_generation']
  },

  // Introverted Intuition (Ni)
  {
    text: 'I have sudden insights that seem to come from nowhere',
    category: 'cognitive_functions',
    subcategory: 'jungian',
    domain: 'Ni',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { Ni: 0.9, intuition: 0.8 },
    personalizationMarkers: ['insight_generation', 'unconscious_processing']
  },
  {
    text: 'I need time alone to process complex information',
    category: 'cognitive_functions',
    subcategory: 'jungian',
    domain: 'Ni',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { Ni: 0.7, introversion: 0.8 },
    personalizationMarkers: ['deep_processing', 'solitary_thinking']
  },

  // Extraverted Sensing (Se)
  {
    text: "I'm highly aware of my physical surroundings and sensory details",
    category: 'cognitive_functions',
    subcategory: 'jungian',
    domain: 'Se',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { Se: 0.9, sensing: 0.8 },
    personalizationMarkers: ['sensory_awareness', 'present_focus']
  },
  {
    text: 'I prefer hands-on learning and physical activities',
    category: 'cognitive_functions',
    subcategory: 'jungian',
    domain: 'Se',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { Se: 0.8, kinesthetic_learning: 0.9 },
    personalizationMarkers: ['experiential_learning', 'physical_engagement']
  },

  // Introverted Sensing (Si)
  {
    text: 'I have vivid memories of past experiences and can recall details others forget',
    category: 'cognitive_functions',
    subcategory: 'jungian',
    domain: 'Si',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { Si: 0.9, memory: 0.8 },
    personalizationMarkers: ['detailed_memory', 'past_focus']
  },
  {
    text: 'I prefer familiar routines and established methods',
    category: 'cognitive_functions',
    subcategory: 'jungian',
    domain: 'Si',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { Si: 0.8, conscientiousness: 0.7 },
    personalizationMarkers: ['routine_preference', 'tradition_valuing']
  },

  // Extraverted Thinking (Te)
  {
    text: 'I naturally organize systems and processes for maximum efficiency',
    category: 'cognitive_functions',
    subcategory: 'jungian',
    domain: 'Te',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { Te: 0.9, thinking: 0.8 },
    personalizationMarkers: ['systematic_organization', 'efficiency_focus']
  },
  {
    text: 'I make decisions based on objective facts and measurable outcomes',
    category: 'cognitive_functions',
    subcategory: 'jungian',
    domain: 'Te',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { Te: 0.8, analytical: 0.9 },
    personalizationMarkers: ['objective_decision_making', 'results_orientation']
  },

  // Introverted Thinking (Ti)
  {
    text: 'I need to understand how things work at a fundamental level',
    category: 'cognitive_functions',
    subcategory: 'jungian',
    domain: 'Ti',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { Ti: 0.9, analytical_thinking: 0.9 },
    personalizationMarkers: ['deep_understanding', 'logical_analysis']
  },
  {
    text: 'I create my own mental models and frameworks to understand the world',
    category: 'cognitive_functions',
    subcategory: 'jungian',
    domain: 'Ti',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { Ti: 0.8, systems_thinking: 0.9 },
    personalizationMarkers: ['framework_creation', 'internal_logic']
  },

  // Extraverted Feeling (Fe)
  {
    text: "I'm highly attuned to group harmony and social dynamics",
    category: 'cognitive_functions',
    subcategory: 'jungian',
    domain: 'Fe',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { Fe: 0.9, agreeableness: 0.8 },
    personalizationMarkers: ['social_harmony', 'group_awareness']
  },
  {
    text: 'I naturally adapt my communication style to connect with different people',
    category: 'cognitive_functions',
    subcategory: 'jungian',
    domain: 'Fe',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { Fe: 0.8, social_intelligence: 0.9 },
    personalizationMarkers: ['social_adaptation', 'emotional_mirroring']
  },

  // Introverted Feeling (Fi)
  {
    text: 'My personal values guide all my important decisions',
    category: 'cognitive_functions',
    subcategory: 'jungian',
    domain: 'Fi',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { Fi: 0.9, authenticity: 0.9 },
    personalizationMarkers: ['value_driven', 'internal_compass']
  },
  {
    text: 'I have deep emotional experiences that I struggle to put into words',
    category: 'cognitive_functions',
    subcategory: 'jungian',
    domain: 'Fi',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { Fi: 0.8, emotional_depth: 0.9 },
    personalizationMarkers: ['emotional_intensity', 'internal_feeling']
  }
];

// Enneagram Type Assessment
const enneagramQuestions = [
  // Type 1 - The Reformer
  {
    text: 'I have a strong inner critic that pushes me toward perfection',
    category: 'enneagram',
    subcategory: 'core_type',
    domain: 'type_1',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { enneagram_1: 0.9, perfectionism: 0.8 },
    personalizationMarkers: ['inner_critic', 'perfectionist_drive']
  },
  {
    text: 'I feel responsible for improving everything around me',
    category: 'enneagram',
    subcategory: 'core_type',
    domain: 'type_1',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { enneagram_1: 0.8, responsibility: 0.9 },
    personalizationMarkers: ['improvement_focus', 'reformer_mindset']
  },

  // Type 2 - The Helper
  {
    text: 'I often know what others need before they ask',
    category: 'enneagram',
    subcategory: 'core_type',
    domain: 'type_2',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { enneagram_2: 0.9, empathy: 0.9 },
    personalizationMarkers: ['emotional_attunement', 'helping_instinct']
  },
  {
    text: 'I struggle to recognize and express my own needs',
    category: 'enneagram',
    subcategory: 'core_type',
    domain: 'type_2',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { enneagram_2: 0.8, self_neglect: 0.7 },
    personalizationMarkers: ['need_suppression', 'other_focus']
  },

  // Type 3 - The Achiever
  {
    text: 'My self-worth is tied to my achievements and success',
    category: 'enneagram',
    subcategory: 'core_type',
    domain: 'type_3',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { enneagram_3: 0.9, achievement_orientation: 0.9 },
    personalizationMarkers: ['success_drive', 'achievement_identity']
  },
  {
    text: 'I naturally adapt myself to succeed in different situations',
    category: 'enneagram',
    subcategory: 'core_type',
    domain: 'type_3',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { enneagram_3: 0.8, adaptability: 0.9 },
    personalizationMarkers: ['chameleon_tendency', 'success_adaptation']
  },

  // Type 4 - The Individualist
  {
    text: 'I feel fundamentally different from everyone else',
    category: 'enneagram',
    subcategory: 'core_type',
    domain: 'type_4',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { enneagram_4: 0.9, uniqueness: 0.9 },
    personalizationMarkers: ['identity_uniqueness', 'otherness_feeling']
  },
  {
    text: 'I experience emotions more intensely than most people',
    category: 'enneagram',
    subcategory: 'core_type',
    domain: 'type_4',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { enneagram_4: 0.8, emotional_intensity: 0.9 },
    personalizationMarkers: ['emotional_depth', 'intensity_experience']
  },

  // Type 5 - The Investigator
  {
    text: 'I need to understand everything before I engage with it',
    category: 'enneagram',
    subcategory: 'core_type',
    domain: 'type_5',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { enneagram_5: 0.9, knowledge_seeking: 0.9 },
    personalizationMarkers: ['competence_need', 'understanding_drive']
  },
  {
    text: 'I guard my time and energy carefully',
    category: 'enneagram',
    subcategory: 'core_type',
    domain: 'type_5',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { enneagram_5: 0.8, boundary_protection: 0.9 },
    personalizationMarkers: ['resource_conservation', 'withdrawal_tendency']
  },

  // Type 6 - The Loyalist
  {
    text: 'I constantly scan for potential problems or threats',
    category: 'enneagram',
    subcategory: 'core_type',
    domain: 'type_6',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { enneagram_6: 0.9, anxiety: 0.7, vigilance: 0.9 },
    personalizationMarkers: ['threat_scanning', 'safety_seeking']
  },
  {
    text: 'I seek guidance from trusted authorities or systems',
    category: 'enneagram',
    subcategory: 'core_type',
    domain: 'type_6',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { enneagram_6: 0.8, authority_orientation: 0.9 },
    personalizationMarkers: ['guidance_seeking', 'loyalty_tendency']
  },

  // Type 7 - The Enthusiast
  {
    text: 'I avoid negative emotions by staying busy and positive',
    category: 'enneagram',
    subcategory: 'core_type',
    domain: 'type_7',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { enneagram_7: 0.9, positivity: 0.8, avoidance: 0.7 },
    personalizationMarkers: ['pain_avoidance', 'positivity_maintenance']
  },
  {
    text: "I'm always planning my next adventure or experience",
    category: 'enneagram',
    subcategory: 'core_type',
    domain: 'type_7',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { enneagram_7: 0.8, future_orientation: 0.9 },
    personalizationMarkers: ['experience_seeking', 'adventure_planning']
  },

  // Type 8 - The Challenger
  {
    text: 'I naturally take charge in situations where leadership is needed',
    category: 'enneagram',
    subcategory: 'core_type',
    domain: 'type_8',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { enneagram_8: 0.9, leadership: 0.9, assertiveness: 0.8 },
    personalizationMarkers: ['control_taking', 'leadership_instinct']
  },
  {
    text: 'I protect vulnerable people and fight against injustice',
    category: 'enneagram',
    subcategory: 'core_type',
    domain: 'type_8',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { enneagram_8: 0.8, justice_orientation: 0.9 },
    personalizationMarkers: ['protective_instinct', 'justice_fighting']
  },

  // Type 9 - The Peacemaker
  {
    text: 'I avoid conflict even when something important is at stake',
    category: 'enneagram',
    subcategory: 'core_type',
    domain: 'type_9',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { enneagram_9: 0.9, conflict_avoidance: 0.9 },
    personalizationMarkers: ['peace_seeking', 'harmony_maintenance']
  },
  {
    text: 'I lose myself in comfortable routines and distractions',
    category: 'enneagram',
    subcategory: 'core_type',
    domain: 'type_9',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { enneagram_9: 0.8, self_forgetting: 0.9 },
    personalizationMarkers: ['narcotization', 'comfort_seeking']
  }
];

// Attachment Style Assessment
const attachmentQuestions = [
  // Secure Attachment
  {
    text: 'I find it easy to get close to others and trust them',
    category: 'attachment',
    subcategory: 'attachment_style',
    domain: 'secure',
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    scoring: { 'Strongly Disagree': 1, Disagree: 2, Neutral: 3, Agree: 4, 'Strongly Agree': 5 },
    traits: { secure_attachment: 0.9, trust: 0.8 },
    personalizationMarkers: ['relationship_comfort', 'trust_capacity']
  },
  {
    text: "I'm comfortable depending on others and having them depend on me",
    category: 'attachment',
    subcategory: 'attachment_style',
    domain: 'secure',
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    scoring: { 'Strongly Disagree': 1, Disagree: 2, Neutral: 3, Agree: 4, 'Strongly Agree': 5 },
    traits: { secure_attachment: 0.8, interdependence: 0.9 },
    personalizationMarkers: ['healthy_dependence', 'reciprocity']
  },

  // Anxious Attachment
  {
    text: "I worry that partners don't really love me or will leave me",
    category: 'attachment',
    subcategory: 'attachment_style',
    domain: 'anxious',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { anxious_attachment: 0.9, relationship_anxiety: 0.9 },
    personalizationMarkers: ['abandonment_fear', 'relationship_worry']
  },
  {
    text: 'I need constant reassurance from partners about their feelings',
    category: 'attachment',
    subcategory: 'attachment_style',
    domain: 'anxious',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { anxious_attachment: 0.8, reassurance_seeking: 0.9 },
    personalizationMarkers: ['validation_needs', 'insecurity']
  },

  // Avoidant Attachment
  {
    text: 'I prefer to keep emotional distance in relationships',
    category: 'attachment',
    subcategory: 'attachment_style',
    domain: 'avoidant',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { avoidant_attachment: 0.9, emotional_distance: 0.9 },
    personalizationMarkers: ['intimacy_avoidance', 'self_reliance']
  },
  {
    text: 'I get uncomfortable when people want to be too close emotionally',
    category: 'attachment',
    subcategory: 'attachment_style',
    domain: 'avoidant',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { avoidant_attachment: 0.8, intimacy_discomfort: 0.9 },
    personalizationMarkers: ['closeness_anxiety', 'independence_need']
  },

  // Disorganized Attachment
  {
    text: 'My feelings about closeness with others are confusing and contradictory',
    category: 'attachment',
    subcategory: 'attachment_style',
    domain: 'disorganized',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { disorganized_attachment: 0.9, confusion: 0.8 },
    personalizationMarkers: ['attachment_confusion', 'approach_avoidance']
  },
  {
    text: 'I simultaneously crave and fear emotional intimacy',
    category: 'attachment',
    subcategory: 'attachment_style',
    domain: 'disorganized',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { disorganized_attachment: 0.8, ambivalence: 0.9 },
    personalizationMarkers: ['intimacy_ambivalence', 'fear_desire_conflict']
  }
];

// Defense Mechanisms Assessment
const defenseMechanismQuestions = [
  // Projection
  {
    text: 'I often notice in others the qualities I dislike about myself',
    category: 'defense_mechanisms',
    subcategory: 'psychodynamic',
    domain: 'projection',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { projection: 0.9 },
    personalizationMarkers: ['projection_tendency', 'shadow_recognition']
  },

  // Intellectualization
  {
    text: 'I analyze emotional situations rather than feeling them',
    category: 'defense_mechanisms',
    subcategory: 'psychodynamic',
    domain: 'intellectualization',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { intellectualization: 0.9 },
    personalizationMarkers: ['emotional_avoidance', 'cognitive_defense']
  },

  // Denial
  {
    text: 'I tend to minimize problems until they become unavoidable',
    category: 'defense_mechanisms',
    subcategory: 'psychodynamic',
    domain: 'denial',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { denial: 0.9 },
    personalizationMarkers: ['reality_avoidance', 'problem_minimization']
  },

  // Sublimation
  {
    text: 'I channel difficult emotions into creative or productive activities',
    category: 'defense_mechanisms',
    subcategory: 'psychodynamic',
    domain: 'sublimation',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { sublimation: 0.9, healthy_coping: 0.8 },
    personalizationMarkers: ['productive_coping', 'emotion_transformation']
  },

  // Dissociation
  {
    text: "I mentally 'check out' during stressful situations",
    category: 'defense_mechanisms',
    subcategory: 'psychodynamic',
    domain: 'dissociation',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { dissociation: 0.9 },
    personalizationMarkers: ['mental_escape', 'stress_response']
  },

  // Rationalization
  {
    text: "I find logical reasons to justify behaviors I'm not proud of",
    category: 'defense_mechanisms',
    subcategory: 'psychodynamic',
    domain: 'rationalization',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { rationalization: 0.9 },
    personalizationMarkers: ['self_justification', 'cognitive_distortion']
  }
];

// Learning Style Deep Assessment
const learningStyleQuestions = [
  // Visual-Spatial
  {
    text: 'I think in images and can manipulate 3D objects in my mind',
    category: 'learning_style',
    subcategory: 'cognitive_preference',
    domain: 'visual_spatial',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { visual_spatial: 0.9 },
    personalizationMarkers: ['visual_thinking', 'spatial_intelligence']
  },
  {
    text: 'I need to see information visually to understand it fully',
    category: 'learning_style',
    subcategory: 'cognitive_preference',
    domain: 'visual_spatial',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { visual_learning: 0.9 },
    personalizationMarkers: ['visual_processing', 'diagram_preference']
  },

  // Auditory-Sequential
  {
    text: 'I learn best through verbal explanations and discussions',
    category: 'learning_style',
    subcategory: 'cognitive_preference',
    domain: 'auditory_sequential',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { auditory_learning: 0.9 },
    personalizationMarkers: ['verbal_processing', 'discussion_learning']
  },
  {
    text: 'I remember things better when I hear them rather than read them',
    category: 'learning_style',
    subcategory: 'cognitive_preference',
    domain: 'auditory_sequential',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { auditory_memory: 0.9 },
    personalizationMarkers: ['sound_memory', 'verbal_retention']
  },

  // Kinesthetic-Tactile
  {
    text: 'I need to physically do something to learn it properly',
    category: 'learning_style',
    subcategory: 'cognitive_preference',
    domain: 'kinesthetic_tactile',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { kinesthetic_learning: 0.9 },
    personalizationMarkers: ['hands_on_learning', 'experiential_preference']
  },
  {
    text: 'I fidget or move when trying to concentrate',
    category: 'learning_style',
    subcategory: 'cognitive_preference',
    domain: 'kinesthetic_tactile',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { movement_processing: 0.9 },
    personalizationMarkers: ['movement_need', 'fidgeting_focus']
  },

  // Reading-Writing
  {
    text: 'I prefer written instructions over verbal explanations',
    category: 'learning_style',
    subcategory: 'cognitive_preference',
    domain: 'reading_writing',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { reading_preference: 0.9 },
    personalizationMarkers: ['text_processing', 'written_learning']
  },
  {
    text: 'I take extensive notes to process and remember information',
    category: 'learning_style',
    subcategory: 'cognitive_preference',
    domain: 'reading_writing',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { writing_processing: 0.9 },
    personalizationMarkers: ['note_taking', 'written_synthesis']
  }
];

// Trauma-Informed Screening (Gentle approach)
const traumaInformedQuestions = [
  {
    text: 'I have a strong startle response to unexpected sounds or movements',
    category: 'trauma_screening',
    subcategory: 'hypervigilance',
    domain: 'nervous_system',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { hypervigilance: 0.9, trauma_indicators: 0.7 },
    personalizationMarkers: ['startle_response', 'nervous_system_activation']
  },
  {
    text: 'I sometimes feel disconnected from my body or surroundings',
    category: 'trauma_screening',
    subcategory: 'dissociation',
    domain: 'disconnection',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { dissociation: 0.8, grounding_needs: 0.9 },
    personalizationMarkers: ['dissociative_tendency', 'grounding_requirement']
  },
  {
    text: 'I have difficulty trusting my own perceptions and judgments',
    category: 'trauma_screening',
    subcategory: 'self_trust',
    domain: 'confidence',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { self_doubt: 0.8, trauma_indicators: 0.6 },
    personalizationMarkers: ['self_trust_issues', 'perception_doubt']
  },
  {
    text: 'I feel safest when I can control my environment',
    category: 'trauma_screening',
    subcategory: 'control',
    domain: 'safety_seeking',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { control_needs: 0.9, safety_seeking: 0.9 },
    personalizationMarkers: ['environmental_control', 'safety_requirements']
  },
  {
    text: 'I have unexplained physical symptoms during stress',
    category: 'trauma_screening',
    subcategory: 'somatic',
    domain: 'body_symptoms',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { somatic_symptoms: 0.9, stress_response: 0.8 },
    personalizationMarkers: ['somatic_expression', 'body_stress_response']
  },
  {
    text: 'I struggle with feeling present in the current moment',
    category: 'trauma_screening',
    subcategory: 'presence',
    domain: 'temporal_orientation',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { presence_difficulty: 0.8, mindfulness_needs: 0.9 },
    personalizationMarkers: ['present_moment_challenge', 'temporal_displacement']
  }
];

// Connect to MongoDB and seed questions
async function seedPsychoanalyticQuestions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    // console.log('Connected to MongoDB');

    const Question = mongoose.model(
      'Question',
      new mongoose.Schema({
        text: String,
        category: String,
        subcategory: String,
        domain: String,
        type: String,
        options: [String],
        scoring: mongoose.Schema.Types.Mixed,
        traits: mongoose.Schema.Types.Mixed,
        personalizationMarkers: [String],
        validatedInstrument: String,
        reverseScored: Boolean,
        tier: { type: String, default: 'standard' },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
      })
    );

    // Combine all psychoanalytic questions
    const allPsychoanalyticQuestions = [
      ...jungianQuestions.map(q => ({ ...q, tier: 'comprehensive' })),
      ...enneagramQuestions.map(q => ({ ...q, tier: 'comprehensive' })),
      ...attachmentQuestions.map(q => ({ ...q, tier: 'standard' })),
      ...defenseMechanismQuestions.map(q => ({ ...q, tier: 'comprehensive' })),
      ...learningStyleQuestions.map(q => ({ ...q, tier: 'standard' })),
      ...traumaInformedQuestions.map(q => ({ ...q, tier: 'screening' }))
    ];

    // console.log(
    //       `Seeding ${allPsychoanalyticQuestions.length} psychoanalytic assessment questions...`
    //     );

    // Insert questions
    for (const question of allPsychoanalyticQuestions) {
      await Question.findOneAndUpdate({ text: question.text }, question, {
        upsert: true,
        new: true
      });
    }

    // console.log('Successfully seeded psychoanalytic questions!');

    // Print statistics
    const categories = {};
    allPsychoanalyticQuestions.forEach(q => {
      const key = `${q.category}/${q.subcategory}`;
      categories[key] = (categories[key] || 0) + 1;
    });

    // console.log('\nQuestion distribution:');
    Object.entries(categories).forEach(([cat, count]) => {
      // console.log(`  ${cat}: ${count} questions`);
    });

    // Count by tier
    const tiers = {};
    allPsychoanalyticQuestions.forEach(q => {
      tiers[q.tier] = (tiers[q.tier] || 0) + 1;
    });

    // console.log('\nQuestions by tier:');
    Object.entries(tiers).forEach(([tier, count]) => {
      // console.log(`  ${tier}: ${count} questions`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding questions:', error);
    process.exit(1);
  }
}

// Run seeding
seedPsychoanalyticQuestions();
