/**
 * Synthetic Test Profiles
 *
 * Pre-defined personality profiles for testing adaptive assessment system.
 * Each profile represents a realistic personality archetype with specific
 * trait patterns, clinical features, and expected assessment paths.
 *
 * Used for:
 * - Integration testing (full 70-question flow)
 * - Stage advancement testing
 * - Confidence calculation validation
 * - Archetype prediction testing
 * - Report generation testing
 */

/**
 * Helper: Generate synthetic responses based on profile
 * @param {Object} profile - Profile with trait scores
 * @param {Array} questions - Questions to answer
 * @returns {Array} Synthetic responses
 */
function generateResponses(profile, questions) {
  return questions.map(q => {
    let targetScore = 50; // Default neutral

    // Personality trait questions
    if (q.category === 'personality' && q.trait) {
      const trait = q.trait.toLowerCase();
      if (profile[trait] !== undefined) {
        targetScore = profile[trait];
      }
    }

    // Clinical questions
    if (q.category === 'clinical_psychopathology') {
      if (q.tags?.includes('depression') && profile.depression) {
        targetScore = profile.depression === 'elevated' ? 70 : profile.depression === 'high' ? 85 : 30;
      }
      if (q.tags?.includes('anxiety') && profile.anxiety) {
        targetScore = profile.anxiety === 'elevated' ? 70 : profile.anxiety === 'high' ? 85 : 30;
      }
      if (q.tags?.includes('mania') && profile.mania) {
        targetScore = profile.mania === 'elevated' ? 70 : 30;
      }
    }

    // Neurodiversity questions
    if (q.category === 'neurodiversity') {
      if (q.tags?.includes('adhd') && profile.adhd) {
        targetScore = profile.adhd === 'positive' ? 75 : 30;
      }
      if (q.tags?.includes('autism') && profile.autism) {
        targetScore = profile.autism === 'positive' ? 75 : 30;
      }
    }

    // Add noise to make responses realistic (±10 points)
    const noise = (Math.random() - 0.5) * 20;
    const noisyScore = Math.max(0, Math.min(100, targetScore + noise));

    // Convert to Likert scale (assuming 5-point scale)
    let likertValue;
    if (noisyScore < 20) likertValue = 1;
    else if (noisyScore < 40) likertValue = 2;
    else if (noisyScore < 60) likertValue = 3;
    else if (noisyScore < 80) likertValue = 4;
    else likertValue = 5;

    // Handle reverse scoring
    if (q.reverseScored) {
      likertValue = 6 - likertValue;
    }

    return {
      questionId: q.questionId,
      value: likertValue,
      score: noisyScore,
      timestamp: new Date()
    };
  });
}

/**
 * Profile 1: Anxious-Undercontrolled
 * High neuroticism, low conscientiousness, elevated depression/anxiety
 *
 * Expected assessment path:
 * - Stage 1: Flags high neuroticism, low conscientiousness
 * - Stage 2: Expands PHQ-9, GAD-7 (positive screens)
 * - Stage 3: Refines impulsiveness facet (divergent from conscientiousness)
 * - Stage 4: Adds stress coping, resilience questions
 * - Predicted archetype: "undercontrolled"
 */
const anxiousUndercontrolled = {
  id: 'anxious_undercontrolled',
  name: 'Anxious-Undercontrolled',
  description: 'High neuroticism, low conscientiousness, emotional dysregulation',

  // Big Five traits (0-100 scale)
  openness: 45,
  conscientiousness: 30,
  extraversion: 35,
  agreeableness: 55,
  neuroticism: 75,

  // Big Five facets (notable divergences)
  facets: {
    neuroticism_impulsiveness: 85,      // Much higher than overall neuroticism
    conscientiousness_self_discipline: 20, // Much lower than overall conscientiousness
    neuroticism_vulnerability: 80,
    openness_ideas: 60                   // Higher than overall openness
  },

  // Clinical features
  depression: 'elevated',  // PHQ-9 ~15-19 (moderately severe)
  anxiety: 'elevated',     // GAD-7 ~10-14 (moderate)
  mania: 'low',
  psychosis: 'low',

  // Neurodiversity
  adhd: 'negative',
  autism: 'negative',

  // Treatment indicators
  resilience: 'low',
  socialSupport: 'moderate',
  treatmentMotivation: 'moderate',

  // Expected outcomes
  expectedArchetype: 'undercontrolled',
  expectedQuestionCount: 70,
  expectedStagesReached: 4,
  expectedSkips: ['openness', 'agreeableness'], // May skip if confident early

  // Clinical interpretation
  clinicalNotes: 'Presents with anxiety and emotional dysregulation. Low self-discipline and high impulsiveness suggest difficulty with behavioral control. Treatment focus: emotion regulation skills, behavioral activation, stress management.'
};

/**
 * Profile 2: Resilient
 * High across all Big Five, low neuroticism, no clinical concerns
 *
 * Expected assessment path:
 * - Stage 1: Identifies resilient pattern quickly
 * - Stage 2: Minimal clinical expansion (negative screens)
 * - Stage 3: May skip entirely if all confidence >85%
 * - Stage 4: Adds positive psychology questions (resilience, strengths)
 * - Predicted archetype: "resilient"
 */
const resilient = {
  id: 'resilient',
  name: 'Resilient',
  description: 'High functioning, emotionally stable, strong across all domains',

  // Big Five traits
  openness: 70,
  conscientiousness: 75,
  extraversion: 80,
  agreeableness: 70,
  neuroticism: 25,

  // Facets (all consistent with traits)
  facets: {
    extraversion_positive_emotions: 85,
    conscientiousness_achievement_striving: 80,
    agreeableness_trust: 75,
    openness_ideas: 75
  },

  // Clinical features
  depression: 'low',       // PHQ-9 ~0-4 (minimal)
  anxiety: 'low',          // GAD-7 ~0-4 (minimal)
  mania: 'low',
  psychosis: 'low',

  // Neurodiversity
  adhd: 'negative',
  autism: 'negative',

  // Treatment indicators
  resilience: 'high',
  socialSupport: 'high',
  treatmentMotivation: 'low', // Not seeking treatment

  // Expected outcomes
  expectedArchetype: 'resilient',
  expectedQuestionCount: 70,
  expectedStagesReached: 4,
  expectedSkips: ['extraversion', 'conscientiousness', 'agreeableness', 'openness'], // May skip all if confident

  clinicalNotes: 'Well-adjusted individual with strong psychological functioning. High resilience and social support. Minimal clinical concerns. Assessment useful for strengths-based feedback and personal growth.'
};

/**
 * Profile 3: Creative-Extrovert
 * Very high openness and extraversion, average other traits
 *
 * Expected assessment path:
 * - Stage 1: Identifies high openness, high extraversion
 * - Stage 2: Explores openness facets (ideas, aesthetics, fantasy)
 * - Stage 3: May refine excitement-seeking facet (divergent)
 * - Stage 4: Adds creativity, sensation-seeking questions
 * - Predicted archetype: "creative-extrovert"
 */
const creativeExtrovert = {
  id: 'creative_extrovert',
  name: 'Creative-Extrovert',
  description: 'Highly open, outgoing, energetic, creative',

  // Big Five traits
  openness: 85,
  conscientiousness: 50,
  extraversion: 80,
  agreeableness: 60,
  neuroticism: 40,

  // Facets
  facets: {
    openness_ideas: 90,
    openness_aesthetics: 85,
    openness_fantasy: 80,
    extraversion_excitement_seeking: 90,  // Very high
    extraversion_activity: 75,
    conscientiousness_order: 35          // Lower than average conscientiousness
  },

  // Clinical features
  depression: 'low',
  anxiety: 'low',
  mania: 'low',    // Important: NOT elevated (just high energy)
  psychosis: 'low',

  // Neurodiversity
  adhd: 'possible',  // High energy may flag ADHD screening
  autism: 'negative',

  // Treatment indicators
  resilience: 'high',
  socialSupport: 'high',
  treatmentMotivation: 'low',

  // Expected outcomes
  expectedArchetype: 'creative-extrovert',
  expectedQuestionCount: 70,
  expectedStagesReached: 4,
  expectedSkips: ['openness', 'extraversion'],

  clinicalNotes: 'Creative, energetic, socially engaged. Strong openness to experience and extraversion. May benefit from structure/organization support given lower conscientiousness. No significant clinical concerns.'
};

/**
 * Profile 4: Overcontrolled
 * High conscientiousness, low openness, high anxiety, inhibited
 *
 * Expected assessment path:
 * - Stage 1: Identifies high conscientiousness, anxiety
 * - Stage 2: Expands GAD-7, explores rigidity
 * - Stage 3: Refines anxiety facets, interpersonal coldness
 * - Stage 4: Adds perfectionism, cognitive flexibility questions
 * - Predicted archetype: "overcontrolled"
 */
const overcontrolled = {
  id: 'overcontrolled',
  name: 'Overcontrolled',
  description: 'Rigid, perfectionistic, anxious, emotionally inhibited',

  // Big Five traits
  openness: 35,
  conscientiousness: 80,
  extraversion: 35,
  agreeableness: 70,
  neuroticism: 65,

  // Facets
  facets: {
    conscientiousness_order: 90,         // Very high
    conscientiousness_deliberation: 85,
    neuroticism_anxiety: 75,
    neuroticism_self_consciousness: 70,
    openness_actions: 25,                // Very low - prefers routine
    extraversion_warmth: 50              // Higher than overall extraversion
  },

  // Clinical features
  depression: 'low',
  anxiety: 'elevated',    // GAD-7 ~8-11 (moderate)
  mania: 'low',
  psychosis: 'low',

  // Neurodiversity
  adhd: 'negative',
  autism: 'possible',     // Rigidity + social discomfort may flag

  // Treatment indicators
  resilience: 'moderate',
  socialSupport: 'moderate',
  treatmentMotivation: 'moderate',

  // Expected outcomes
  expectedArchetype: 'overcontrolled',
  expectedQuestionCount: 70,
  expectedStagesReached: 4,
  expectedSkips: ['conscientiousness'],

  clinicalNotes: 'Perfectionistic, rule-bound, anxious. High conscientiousness with rigidity. Difficulty with flexibility and spontaneity. Treatment focus: cognitive flexibility, anxiety management, self-compassion.'
};

/**
 * Profile 5: Intellectual-Achiever
 * High openness and conscientiousness, average extraversion
 *
 * Expected assessment path:
 * - Stage 1: Identifies high openness, high conscientiousness
 * - Stage 2: Explores ideas, competence facets
 * - Stage 3: May refine achievement-striving (very high)
 * - Stage 4: Adds intellectual engagement questions
 * - Predicted archetype: "intellectual-achiever"
 */
const intellectualAchiever = {
  id: 'intellectual_achiever',
  name: 'Intellectual-Achiever',
  description: 'Curious, driven, achievement-oriented, intellectually engaged',

  // Big Five traits
  openness: 85,
  conscientiousness: 85,
  extraversion: 50,
  agreeableness: 60,
  neuroticism: 35,

  // Facets
  facets: {
    openness_ideas: 95,
    openness_values: 80,
    conscientiousness_achievement_striving: 95,
    conscientiousness_competence: 90,
    neuroticism_anxiety: 45,             // Slightly higher due to achievement pressure
    extraversion_assertiveness: 65       // Higher than overall extraversion
  },

  // Clinical features
  depression: 'low',
  anxiety: 'low',
  mania: 'low',
  psychosis: 'low',

  // Neurodiversity
  adhd: 'negative',
  autism: 'negative',

  // Treatment indicators
  resilience: 'high',
  socialSupport: 'moderate',
  treatmentMotivation: 'low',

  // Expected outcomes
  expectedArchetype: 'intellectual-achiever',
  expectedQuestionCount: 70,
  expectedStagesReached: 4,
  expectedSkips: ['openness', 'conscientiousness'],

  clinicalNotes: 'Intellectually curious and achievement-oriented. Strong cognitive engagement. May experience stress from high standards. Generally well-functioning with minimal clinical concerns.'
};

/**
 * Profile 6: Average/Balanced
 * Average scores across all dimensions
 *
 * Expected assessment path:
 * - Stage 1: No clear patterns emerge
 * - Stage 2: Explores multiple facets to find distinctions
 * - Stage 3: Likely needed to refine subtle patterns
 * - Stage 4: Fills gaps, determines "balanced" archetype
 * - Predicted archetype: "balanced"
 */
const average = {
  id: 'average',
  name: 'Average/Balanced',
  description: 'Balanced personality, no extreme traits',

  // Big Five traits
  openness: 50,
  conscientiousness: 50,
  extraversion: 50,
  agreeableness: 50,
  neuroticism: 50,

  // Facets (all near trait level)
  facets: {
    openness_ideas: 52,
    conscientiousness_competence: 48,
    extraversion_warmth: 53,
    agreeableness_trust: 47,
    neuroticism_anxiety: 51
  },

  // Clinical features
  depression: 'low',
  anxiety: 'low',
  mania: 'low',
  psychosis: 'low',

  // Neurodiversity
  adhd: 'negative',
  autism: 'negative',

  // Treatment indicators
  resilience: 'moderate',
  socialSupport: 'moderate',
  treatmentMotivation: 'low',

  // Expected outcomes
  expectedArchetype: 'balanced',
  expectedQuestionCount: 70,
  expectedStagesReached: 4,
  expectedSkips: [],  // Unlikely to skip any traits

  clinicalNotes: 'Balanced personality profile without notable strengths or concerns. Adaptive functioning across domains. Assessment useful for nuanced self-understanding and personal development guidance.'
};

/**
 * Profile 7: Depressed-Withdrawn
 * High neuroticism, low extraversion, elevated depression
 *
 * Expected assessment path:
 * - Stage 1: Flags high neuroticism, low extraversion, depression
 * - Stage 2: Expands full PHQ-9, explores social withdrawal
 * - Stage 3: Refines depression and vulnerability facets
 * - Stage 4: Adds treatment motivation, social support questions
 * - Predicted archetype: May not fit standard archetype
 */
const depressedWithdrawn = {
  id: 'depressed_withdrawn',
  name: 'Depressed-Withdrawn',
  description: 'Depressed, socially withdrawn, low energy',

  // Big Five traits
  openness: 40,
  conscientiousness: 40,
  extraversion: 25,
  agreeableness: 60,
  neuroticism: 80,

  // Facets
  facets: {
    neuroticism_depression: 90,
    neuroticism_vulnerability: 85,
    extraversion_positive_emotions: 15,  // Very low
    extraversion_warmth: 30,
    conscientiousness_self_discipline: 25,
    openness_actions: 25                 // Low activity level
  },

  // Clinical features
  depression: 'high',      // PHQ-9 ~20+ (severe)
  anxiety: 'elevated',     // GAD-7 ~8-11 (moderate)
  mania: 'low',
  psychosis: 'low',

  // Neurodiversity
  adhd: 'negative',
  autism: 'possible',      // Social withdrawal may flag

  // Treatment indicators
  resilience: 'low',
  socialSupport: 'low',
  treatmentMotivation: 'high', // Seeking help due to distress

  // Expected outcomes
  expectedArchetype: 'undercontrolled', // May classify here due to high N, low C
  expectedQuestionCount: 70,
  expectedStagesReached: 4,
  expectedSkips: [],

  clinicalNotes: 'Significant depression with social withdrawal. Low energy and motivation. Limited social support. High treatment priority. Focus: behavioral activation, social engagement, depression treatment.'
};

/**
 * All profiles array for easy iteration
 */
const allProfiles = [
  anxiousUndercontrolled,
  resilient,
  creativeExtrovert,
  overcontrolled,
  intellectualAchiever,
  average,
  depressedWithdrawn
];

/**
 * Get profile by ID
 */
function getProfile(profileId) {
  return allProfiles.find(p => p.id === profileId);
}

/**
 * Get profiles by archetype
 */
function getProfilesByArchetype(archetype) {
  return allProfiles.filter(p => p.expectedArchetype === archetype);
}

module.exports = {
  // Individual profiles
  anxiousUndercontrolled,
  resilient,
  creativeExtrovert,
  overcontrolled,
  intellectualAchiever,
  average,
  depressedWithdrawn,

  // Collections
  allProfiles,

  // Utilities
  getProfile,
  getProfilesByArchetype,
  generateResponses
};
