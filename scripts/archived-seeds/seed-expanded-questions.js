const mongoose = require('mongoose');
require('dotenv').config();

// Executive Function Assessment Questions
const executiveFunctionQuestions = [
  {
    text: 'I start tasks right away rather than procrastinating',
    category: 'neurodiversity',
    subcategory: 'executive_function',
    domain: 'task_initiation',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { conscientiousness: 0.3, adhd_indicators: -0.4 },
    personalizationMarkers: ['task_initiation', 'procrastination_tendency'],
    validatedInstrument: 'BRIEF-A'
  },
  {
    text: 'I lose track of time when engaged in activities I enjoy',
    category: 'neurodiversity',
    subcategory: 'executive_function',
    domain: 'time_blindness',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 5, Rarely: 4, Sometimes: 3, Often: 2, Always: 1 },
    traits: { adhd_indicators: 0.7, hyperfocus: 0.8 },
    personalizationMarkers: ['hyperfocus_tendency', 'time_awareness']
  },
  {
    text: 'I need multiple alarms to ensure I wake up or remember appointments',
    category: 'neurodiversity',
    subcategory: 'executive_function',
    domain: 'working_memory',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 5, Rarely: 4, Sometimes: 3, Often: 2, Always: 1 },
    traits: { adhd_indicators: 0.6, executive_dysfunction: 0.7 },
    personalizationMarkers: ['external_support_needs', 'memory_strategies']
  },
  {
    text: 'I can easily switch between different tasks without losing focus',
    category: 'neurodiversity',
    subcategory: 'executive_function',
    domain: 'cognitive_flexibility',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { cognitive_flexibility: 0.8, autism_indicators: -0.5 },
    reverseScored: true
  },
  {
    text: "My living space has 'organized chaos' - I know where everything is even if others don't",
    category: 'neurodiversity',
    subcategory: 'executive_function',
    domain: 'organization',
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    scoring: { 'Strongly Disagree': 1, Disagree: 2, Neutral: 3, Agree: 4, 'Strongly Agree': 5 },
    traits: { adhd_indicators: 0.5, visual_organization: 0.7 },
    personalizationMarkers: ['environmental_preferences', 'visual_organization']
  },
  {
    text: 'I use color-coding, lists, or apps extensively to manage daily life',
    category: 'neurodiversity',
    subcategory: 'executive_function',
    domain: 'compensatory_strategies',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { coping_strategies: 0.8, executive_support: 0.7 },
    personalizationMarkers: ['coping_mechanisms', 'tool_usage']
  },
  {
    text: "I forget important tasks unless they're right in front of me",
    category: 'neurodiversity',
    subcategory: 'executive_function',
    domain: 'object_permanence',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 5, Rarely: 4, Sometimes: 3, Often: 2, Always: 1 },
    traits: { adhd_indicators: 0.7, working_memory: -0.6 },
    personalizationMarkers: ['memory_challenges', 'visual_reminders']
  },
  {
    text: 'I struggle to estimate how long tasks will take',
    category: 'neurodiversity',
    subcategory: 'executive_function',
    domain: 'time_estimation',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 5, Rarely: 4, Sometimes: 3, Often: 2, Always: 1 },
    traits: { adhd_indicators: 0.6, time_blindness: 0.8 },
    personalizationMarkers: ['planning_difficulties', 'time_management']
  },
  {
    text: 'I work better under pressure of deadlines',
    category: 'neurodiversity',
    subcategory: 'executive_function',
    domain: 'urgency_motivation',
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    scoring: { 'Strongly Disagree': 1, Disagree: 2, Neutral: 3, Agree: 4, 'Strongly Agree': 5 },
    traits: { adhd_indicators: 0.7, urgency_driven: 0.9 },
    personalizationMarkers: ['motivation_style', 'pressure_response']
  },
  {
    text: "I have many unfinished projects that I've lost interest in",
    category: 'neurodiversity',
    subcategory: 'executive_function',
    domain: 'task_persistence',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 5, Rarely: 4, Sometimes: 3, Often: 2, Always: 1 },
    traits: { adhd_indicators: 0.7, project_completion: -0.8 },
    personalizationMarkers: ['interest_sustainability', 'project_patterns']
  },
  {
    text: 'I need complete silence to concentrate',
    category: 'neurodiversity',
    subcategory: 'executive_function',
    domain: 'attention_regulation',
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    scoring: { 'Strongly Disagree': 1, Disagree: 2, Neutral: 3, Agree: 4, 'Strongly Agree': 5 },
    traits: { attention_sensitivity: 0.8, environmental_needs: 0.7 },
    personalizationMarkers: ['focus_requirements', 'environmental_control']
  },
  {
    text: 'I can juggle multiple thoughts simultaneously',
    category: 'neurodiversity',
    subcategory: 'executive_function',
    domain: 'cognitive_load',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { cognitive_capacity: 0.7, mental_flexibility: 0.8 },
    personalizationMarkers: ['multitasking_ability', 'cognitive_style']
  }
];

// Sensory Processing Profile Questions
const sensoryProcessingQuestions = [
  {
    text: 'Clothing tags, seams, or certain fabrics cause me significant discomfort',
    category: 'neurodiversity',
    subcategory: 'sensory_processing',
    domain: 'tactile_sensitivity',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { autism_indicators: 0.8, sensory_sensitivity: 0.9 },
    personalizationMarkers: ['tactile_needs', 'clothing_preferences'],
    validatedInstrument: 'Adult_Sensory_Profile'
  },
  {
    text: "I notice fluorescent lights flickering when others don't",
    category: 'neurodiversity',
    subcategory: 'sensory_processing',
    domain: 'visual_sensitivity',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { autism_indicators: 0.7, visual_processing: 0.8 },
    personalizationMarkers: ['environmental_sensitivity', 'lighting_needs']
  },
  {
    text: "I can't concentrate when there's background noise others seem to ignore",
    category: 'neurodiversity',
    subcategory: 'sensory_processing',
    domain: 'auditory_filtering',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { adhd_indicators: 0.6, autism_indicators: 0.7, auditory_sensitivity: 0.9 },
    personalizationMarkers: ['noise_sensitivity', 'concentration_needs']
  },
  {
    text: 'I seek out intense physical sensations (deep pressure, strong flavors, loud music)',
    category: 'neurodiversity',
    subcategory: 'sensory_processing',
    domain: 'sensory_seeking',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { sensory_seeking: 0.9, adhd_indicators: 0.5 },
    personalizationMarkers: ['regulation_strategies', 'sensory_diet_needs']
  },
  {
    text: 'Unexpected light touches make me jump or feel irritated',
    category: 'neurodiversity',
    subcategory: 'sensory_processing',
    domain: 'tactile_defensiveness',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { autism_indicators: 0.7, tactile_defensiveness: 0.9 },
    personalizationMarkers: ['personal_space_needs', 'touch_preferences']
  },
  {
    text: 'Certain food textures make eating difficult for me',
    category: 'neurodiversity',
    subcategory: 'sensory_processing',
    domain: 'oral_sensitivity',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { autism_indicators: 0.7, sensory_sensitivity: 0.8 },
    personalizationMarkers: ['food_preferences', 'texture_sensitivity']
  },
  {
    text: 'I become overwhelmed in busy stores or crowded spaces',
    category: 'neurodiversity',
    subcategory: 'sensory_processing',
    domain: 'sensory_overload',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { autism_indicators: 0.8, sensory_overload: 0.9 },
    personalizationMarkers: ['environmental_tolerance', 'crowd_sensitivity']
  },
  {
    text: 'I need weighted blankets or tight clothing to feel calm',
    category: 'neurodiversity',
    subcategory: 'sensory_processing',
    domain: 'proprioceptive_seeking',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { sensory_seeking: 0.8, self_regulation: 0.7 },
    personalizationMarkers: ['calming_strategies', 'pressure_needs']
  },
  {
    text: "I can hear electrical humming that others don't notice",
    category: 'neurodiversity',
    subcategory: 'sensory_processing',
    domain: 'auditory_acuity',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { autism_indicators: 0.6, sensory_sensitivity: 0.8 },
    personalizationMarkers: ['sound_sensitivity', 'environmental_awareness']
  },
  {
    text: 'Strong smells (perfumes, cleaning products) give me headaches or nausea',
    category: 'neurodiversity',
    subcategory: 'sensory_processing',
    domain: 'olfactory_sensitivity',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { sensory_sensitivity: 0.9, chemical_sensitivity: 0.8 },
    personalizationMarkers: ['smell_sensitivity', 'environmental_triggers']
  }
];

// Masking and Camouflaging Assessment
const maskingQuestions = [
  {
    text: 'I rehearse conversations in my head before social interactions',
    category: 'neurodiversity',
    subcategory: 'masking',
    domain: 'social_preparation',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { autism_indicators: 0.7, social_anxiety: 0.6, masking: 0.9 },
    personalizationMarkers: ['social_preparation', 'anxiety_management'],
    validatedInstrument: 'CAT-Q'
  },
  {
    text: "I force myself to make eye contact even when it's uncomfortable",
    category: 'neurodiversity',
    subcategory: 'masking',
    domain: 'social_camouflaging',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { autism_indicators: 0.8, masking: 0.9 },
    personalizationMarkers: ['social_camouflaging', 'discomfort_tolerance']
  },
  {
    text: "I'm exhausted after social events, even enjoyable ones",
    category: 'neurodiversity',
    subcategory: 'masking',
    domain: 'social_battery',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { introversion: 0.7, autism_indicators: 0.6, social_exhaustion: 0.9 },
    personalizationMarkers: ['recovery_needs', 'social_capacity']
  },
  {
    text: "I mirror others' expressions and gestures to fit in",
    category: 'neurodiversity',
    subcategory: 'masking',
    domain: 'social_mimicry',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { autism_indicators: 0.7, masking: 0.9 },
    personalizationMarkers: ['social_strategies', 'identity_suppression']
  },
  {
    text: 'People are surprised when I tell them I struggle socially',
    category: 'neurodiversity',
    subcategory: 'masking',
    domain: 'masking_success',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { high_masking: 0.9, invisible_disability: 0.8 },
    personalizationMarkers: ['invisible_struggles', 'support_needs']
  },
  {
    text: 'I have different personas for different social situations',
    category: 'neurodiversity',
    subcategory: 'masking',
    domain: 'social_switching',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { masking: 0.8, identity_confusion: 0.6 },
    personalizationMarkers: ['code_switching', 'identity_management']
  },
  {
    text: "I suppress my natural reactions to appear 'normal'",
    category: 'neurodiversity',
    subcategory: 'masking',
    domain: 'self_suppression',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { masking: 0.9, authenticity_struggle: 0.8 },
    personalizationMarkers: ['suppression_behaviors', 'authenticity_needs']
  },
  {
    text: "I've learned social rules through observation rather than intuition",
    category: 'neurodiversity',
    subcategory: 'masking',
    domain: 'social_learning',
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    scoring: { 'Strongly Disagree': 1, Disagree: 2, Neutral: 3, Agree: 4, 'Strongly Agree': 5 },
    traits: { autism_indicators: 0.8, analytical_social: 0.9 },
    personalizationMarkers: ['social_learning_style', 'rule_based_social']
  },
  {
    text: "I feel like I'm performing rather than being myself in social situations",
    category: 'neurodiversity',
    subcategory: 'masking',
    domain: 'performance_feeling',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { masking: 0.9, authenticity_struggle: 0.9 },
    personalizationMarkers: ['social_performance', 'authenticity_cost']
  },
  {
    text: 'I need recovery time alone after masking in social situations',
    category: 'neurodiversity',
    subcategory: 'masking',
    domain: 'recovery_needs',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { masking_exhaustion: 0.9, recovery_needs: 0.9 },
    personalizationMarkers: ['burnout_risk', 'self_care_needs']
  }
];

// Emotional Regulation and Alexithymia
const emotionalRegulationQuestions = [
  {
    text: 'I can identify and name my emotions as I experience them',
    category: 'neurodiversity',
    subcategory: 'emotional_regulation',
    domain: 'emotional_awareness',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { emotional_intelligence: 0.8, alexithymia: -0.8 },
    reverseScored: true,
    validatedInstrument: 'TAS-20'
  },
  {
    text: "Physical sensations often confuse me - I can't tell if I'm hungry, tired, or emotional",
    category: 'neurodiversity',
    subcategory: 'emotional_regulation',
    domain: 'interoception',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 5, Rarely: 4, Sometimes: 3, Often: 2, Always: 1 },
    traits: { alexithymia: 0.8, autism_indicators: 0.6 },
    personalizationMarkers: ['body_awareness', 'need_recognition']
  },
  {
    text: 'My emotional reactions feel too big for the situation',
    category: 'neurodiversity',
    subcategory: 'emotional_regulation',
    domain: 'emotional_intensity',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 5, Rarely: 4, Sometimes: 3, Often: 2, Always: 1 },
    traits: { emotional_dysregulation: 0.8, adhd_indicators: 0.6 },
    personalizationMarkers: ['regulation_difficulty', 'dysregulation_risk']
  },
  {
    text: 'I need time alone to process emotional experiences',
    category: 'neurodiversity',
    subcategory: 'emotional_regulation',
    domain: 'processing_style',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { introversion: 0.7, processing_needs: 0.8 },
    personalizationMarkers: ['recovery_strategies', 'processing_needs']
  },
  {
    text: "Others say I'm hard to read emotionally",
    category: 'neurodiversity',
    subcategory: 'emotional_regulation',
    domain: 'emotional_expression',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { alexithymia: 0.7, flat_affect: 0.8 },
    personalizationMarkers: ['expression_differences', 'communication_style']
  },
  {
    text: 'I experience emotions as physical sensations in my body',
    category: 'neurodiversity',
    subcategory: 'emotional_regulation',
    domain: 'somatic_experience',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { somatic_awareness: 0.8, embodied_emotion: 0.7 },
    personalizationMarkers: ['somatic_processing', 'body_emotion_connection']
  },
  {
    text: 'I struggle to describe my feelings to others',
    category: 'neurodiversity',
    subcategory: 'emotional_regulation',
    domain: 'emotional_communication',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 5, Rarely: 4, Sometimes: 3, Often: 2, Always: 1 },
    traits: { alexithymia: 0.8, communication_difficulty: 0.7 },
    personalizationMarkers: ['emotional_vocabulary', 'expression_challenges']
  },
  {
    text: 'My mood can shift rapidly without clear triggers',
    category: 'neurodiversity',
    subcategory: 'emotional_regulation',
    domain: 'mood_stability',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 5, Rarely: 4, Sometimes: 3, Often: 2, Always: 1 },
    traits: { emotional_dysregulation: 0.8, mood_instability: 0.9 },
    personalizationMarkers: ['mood_patterns', 'stability_needs']
  },
  {
    text: 'I use logic to understand emotions rather than feeling them directly',
    category: 'neurodiversity',
    subcategory: 'emotional_regulation',
    domain: 'cognitive_processing',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { analytical_processing: 0.8, autism_indicators: 0.5 },
    personalizationMarkers: ['emotion_processing_style', 'analytical_approach']
  },
  {
    text: "I experience emotional 'hangovers' that last for days",
    category: 'neurodiversity',
    subcategory: 'emotional_regulation',
    domain: 'emotional_recovery',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 5, Rarely: 4, Sometimes: 3, Often: 2, Always: 1 },
    traits: { emotional_sensitivity: 0.8, recovery_time: 0.9 },
    personalizationMarkers: ['emotional_resilience', 'recovery_patterns']
  }
];

// Cognitive Flexibility and Learning Style
const cognitiveFlexibilityQuestions = [
  {
    text: 'I see patterns and connections others miss',
    category: 'cognitive',
    subcategory: 'pattern_recognition',
    domain: 'cognitive_strength',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { pattern_recognition: 0.9, analytical_thinking: 0.8 },
    personalizationMarkers: ['cognitive_strengths', 'thinking_style']
  },
  {
    text: 'I learn best through hands-on experimentation rather than instruction',
    category: 'cognitive',
    subcategory: 'learning_style',
    domain: 'kinesthetic_learning',
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    scoring: { 'Strongly Disagree': 1, Disagree: 2, Neutral: 3, Agree: 4, 'Strongly Agree': 5 },
    traits: { kinesthetic_learning: 0.9, experiential_learning: 0.8 },
    personalizationMarkers: ['educational_needs', 'skill_acquisition']
  },
  {
    text: 'I can hyperfocus for hours on topics that interest me',
    category: 'cognitive',
    subcategory: 'attention_regulation',
    domain: 'hyperfocus',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { adhd_indicators: 0.8, monotropism: 0.9 },
    personalizationMarkers: ['focus_patterns', 'interest_intensity']
  },
  {
    text: 'I think in pictures rather than words',
    category: 'cognitive',
    subcategory: 'thinking_style',
    domain: 'visual_thinking',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { visual_thinking: 0.9, dyslexia_indicators: 0.6 },
    personalizationMarkers: ['cognitive_style', 'information_processing']
  },
  {
    text: "Changes to my routine feel catastrophic even when they're minor",
    category: 'cognitive',
    subcategory: 'cognitive_flexibility',
    domain: 'rigidity',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 5, Rarely: 4, Sometimes: 3, Often: 2, Always: 1 },
    traits: { autism_indicators: 0.8, cognitive_rigidity: 0.9 },
    personalizationMarkers: ['flexibility_needs', 'routine_dependence']
  },
  {
    text: "I need to understand the 'why' before I can learn the 'how'",
    category: 'cognitive',
    subcategory: 'learning_style',
    domain: 'conceptual_learning',
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    scoring: { 'Strongly Disagree': 1, Disagree: 2, Neutral: 3, Agree: 4, 'Strongly Agree': 5 },
    traits: { deep_learning: 0.8, conceptual_thinking: 0.9 },
    personalizationMarkers: ['learning_approach', 'understanding_needs']
  },
  {
    text: 'I process information better when I can move or fidget',
    category: 'cognitive',
    subcategory: 'processing_style',
    domain: 'movement_processing',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { adhd_indicators: 0.7, kinesthetic_processing: 0.9 },
    personalizationMarkers: ['movement_needs', 'processing_aids']
  },
  {
    text: 'I remember conversations word-for-word but struggle with the overall meaning',
    category: 'cognitive',
    subcategory: 'memory_style',
    domain: 'detail_memory',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { autism_indicators: 0.6, detail_orientation: 0.9 },
    personalizationMarkers: ['memory_style', 'processing_differences']
  },
  {
    text: 'I think in systems and frameworks rather than isolated facts',
    category: 'cognitive',
    subcategory: 'thinking_style',
    domain: 'systems_thinking',
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    scoring: { 'Strongly Disagree': 1, Disagree: 2, Neutral: 3, Agree: 4, 'Strongly Agree': 5 },
    traits: { systems_thinking: 0.9, analytical_mind: 0.8 },
    personalizationMarkers: ['cognitive_approach', 'problem_solving_style']
  },
  {
    text: 'I need complete information before making decisions',
    category: 'cognitive',
    subcategory: 'decision_making',
    domain: 'information_processing',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { thoroughness: 0.8, anxiety_indicators: 0.5 },
    personalizationMarkers: ['decision_style', 'information_needs']
  },
  {
    text: 'My mind makes unusual connections between unrelated concepts',
    category: 'cognitive',
    subcategory: 'creative_thinking',
    domain: 'divergent_thinking',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { creativity: 0.9, lateral_thinking: 0.9 },
    personalizationMarkers: ['creative_style', 'innovation_potential']
  },
  {
    text: 'I struggle with open-ended tasks but excel with clear parameters',
    category: 'cognitive',
    subcategory: 'task_approach',
    domain: 'structure_needs',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { structure_needs: 0.9, autism_indicators: 0.5 },
    personalizationMarkers: ['task_preferences', 'structure_requirements']
  }
];

// Rejection Sensitivity and Social Processing
const socialProcessingQuestions = [
  {
    text: 'Criticism feels physically painful to me',
    category: 'neurodiversity',
    subcategory: 'social_processing',
    domain: 'rejection_sensitivity',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { rejection_sensitivity: 0.9, adhd_indicators: 0.8 },
    personalizationMarkers: ['emotional_vulnerability', 'feedback_sensitivity']
  },
  {
    text: 'I analyze social interactions for days afterward, looking for mistakes',
    category: 'neurodiversity',
    subcategory: 'social_processing',
    domain: 'social_rumination',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { social_anxiety: 0.8, rumination: 0.9 },
    personalizationMarkers: ['rumination_tendency', 'social_anxiety']
  },
  {
    text: "I can tell when someone's mood shifts even slightly",
    category: 'neurodiversity',
    subcategory: 'social_processing',
    domain: 'hypervigilance',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { hypervigilance: 0.8, emotional_sensitivity: 0.7 },
    personalizationMarkers: ['environmental_scanning', 'threat_detection']
  },
  {
    text: "Group conversations are exhausting because I'm tracking multiple social dynamics",
    category: 'neurodiversity',
    subcategory: 'social_processing',
    domain: 'social_load',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { autism_indicators: 0.7, social_processing_difficulty: 0.9 },
    personalizationMarkers: ['cognitive_load', 'social_capacity']
  },
  {
    text: 'I avoid situations where I might be rejected or embarrassed',
    category: 'neurodiversity',
    subcategory: 'social_processing',
    domain: 'avoidance',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { rejection_sensitivity: 0.8, avoidance_behaviors: 0.9 },
    personalizationMarkers: ['risk_aversion', 'safety_behaviors']
  },
  {
    text: 'I interpret neutral expressions as negative',
    category: 'neurodiversity',
    subcategory: 'social_processing',
    domain: 'interpretation_bias',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { negative_bias: 0.8, anxiety_indicators: 0.7 },
    personalizationMarkers: ['cognitive_bias', 'threat_perception']
  },
  {
    text: 'I need explicit confirmation that people like me',
    category: 'neurodiversity',
    subcategory: 'social_processing',
    domain: 'reassurance_seeking',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { rejection_sensitivity: 0.8, reassurance_needs: 0.9 },
    personalizationMarkers: ['validation_needs', 'relationship_anxiety']
  },
  {
    text: 'Small social mistakes feel catastrophic to me',
    category: 'neurodiversity',
    subcategory: 'social_processing',
    domain: 'catastrophizing',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { rejection_sensitivity: 0.9, catastrophic_thinking: 0.8 },
    personalizationMarkers: ['emotional_intensity', 'perspective_distortion']
  }
];

// Special Interests and Monotropism
const specialInterestsQuestions = [
  {
    text: 'I have topics I could discuss for hours without getting bored',
    category: 'neurodiversity',
    subcategory: 'special_interests',
    domain: 'interest_intensity',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { autism_indicators: 0.9, monotropism: 0.9 },
    personalizationMarkers: ['passion_areas', 'expertise_domains']
  },
  {
    text: 'When interested in something, I need to know EVERYTHING about it',
    category: 'neurodiversity',
    subcategory: 'special_interests',
    domain: 'information_seeking',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { autism_indicators: 0.8, completionism: 0.9 },
    personalizationMarkers: ['learning_depth', 'completionism']
  },
  {
    text: "I struggle to engage with topics that don't interest me, even when necessary",
    category: 'neurodiversity',
    subcategory: 'special_interests',
    domain: 'interest_flexibility',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { adhd_indicators: 0.7, interest_driven: 0.9 },
    personalizationMarkers: ['motivation_patterns', 'engagement_barriers']
  },
  {
    text: "My interests are more intense than most people's hobbies",
    category: 'neurodiversity',
    subcategory: 'special_interests',
    domain: 'intensity',
    type: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    scoring: { 'Strongly Disagree': 1, Disagree: 2, Neutral: 3, Agree: 4, 'Strongly Agree': 5 },
    traits: { autism_indicators: 0.8, passion_intensity: 0.9 },
    personalizationMarkers: ['interest_depth', 'engagement_level']
  },
  {
    text: 'I collect information about my interests compulsively',
    category: 'neurodiversity',
    subcategory: 'special_interests',
    domain: 'information_collecting',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { autism_indicators: 0.7, collecting_behavior: 0.9 },
    personalizationMarkers: ['information_gathering', 'systematic_learning']
  },
  {
    text: 'I lose track of basic needs when engaged in my interests',
    category: 'neurodiversity',
    subcategory: 'special_interests',
    domain: 'hyperfocus_cost',
    type: 'likert',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scoring: { Never: 1, Rarely: 2, Sometimes: 3, Often: 4, Always: 5 },
    traits: { adhd_indicators: 0.8, self_neglect_risk: 0.7 },
    personalizationMarkers: ['self_care_challenges', 'hyperfocus_management']
  }
];

// Connect to MongoDB
async function seedExpandedQuestions() {
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
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
      })
    );

    // Combine all new questions
    const allNewQuestions = [
      ...executiveFunctionQuestions,
      ...sensoryProcessingQuestions,
      ...maskingQuestions,
      ...emotionalRegulationQuestions,
      ...cognitiveFlexibilityQuestions,
      ...socialProcessingQuestions,
      ...specialInterestsQuestions
    ];

    // console.log(`Seeding ${allNewQuestions.length} expanded assessment questions...`);

    // Insert questions
    for (const question of allNewQuestions) {
      await Question.findOneAndUpdate({ text: question.text }, question, {
        upsert: true,
        new: true
      });
    }

    // console.log('Successfully seeded expanded questions!');

    // Print statistics
    const categories = {};
    allNewQuestions.forEach(q => {
      const key = `${q.category}/${q.subcategory}`;
      categories[key] = (categories[key] || 0) + 1;
    });

    // console.log('\nQuestion distribution:');
    Object.entries(categories).forEach(([cat, count]) => {
      // console.log(`  ${cat}: ${count} questions`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding questions:', error);
    process.exit(1);
  }
}

// Run seeding
seedExpandedQuestions();
