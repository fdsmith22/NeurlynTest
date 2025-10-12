/**
 * Facet Intelligence Module
 *
 * Provides intelligent facet-level prioritization based on:
 * - Cross-trait correlations
 * - Neurodiversity indicators
 * - Baseline response patterns
 */

/**
 * NEO-PI-R Facet Definitions
 * Maps each trait to its 6 facets with descriptions
 */
const NEO_FACETS = {
  openness: [
    { name: 'fantasy', description: 'Imagination and daydreaming' },
    { name: 'aesthetics', description: 'Appreciation for art and beauty' },
    { name: 'feelings', description: 'Emotional depth and sensitivity' },
    { name: 'actions', description: 'Preference for variety and novelty' },
    { name: 'ideas', description: 'Intellectual curiosity' },
    { name: 'values', description: 'Willingness to re-examine social/political values' }
  ],
  conscientiousness: [
    { name: 'competence', description: 'Sense of capability and effectiveness' },
    { name: 'order', description: 'Preference for organization and structure' },
    { name: 'dutifulness', description: 'Adherence to principles and obligations' },
    { name: 'achievement_striving', description: 'Ambition and drive for success' },
    { name: 'self_discipline', description: 'Ability to persist despite difficulty' },
    { name: 'deliberation', description: 'Tendency to think before acting' }
  ],
  extraversion: [
    { name: 'warmth', description: 'Friendliness and affection' },
    { name: 'gregariousness', description: 'Preference for company of others' },
    { name: 'assertiveness', description: 'Forcefulness and social dominance' },
    { name: 'activity', description: 'Energy level and pace of living' },
    { name: 'excitement_seeking', description: 'Need for stimulation' },
    { name: 'positive_emotions', description: 'Tendency to experience joy' }
  ],
  agreeableness: [
    { name: 'trust', description: 'Belief in others\' good intentions' },
    { name: 'straightforwardness', description: 'Frankness and sincerity' },
    { name: 'altruism', description: 'Active concern for others\' welfare' },
    { name: 'compliance', description: 'Tendency to defer in conflict' },
    { name: 'modesty', description: 'Humility vs arrogance' },
    { name: 'tender_mindedness', description: 'Sympathy and compassion' }
  ],
  neuroticism: [
    { name: 'anxiety', description: 'Worry, nervousness, and apprehension' },
    { name: 'angry_hostility', description: 'Tendency to experience anger' },
    { name: 'depression', description: 'Tendency toward guilt, sadness, hopelessness' },
    { name: 'self_consciousness', description: 'Shyness and social anxiety' },
    { name: 'impulsiveness', description: 'Inability to control cravings/urges' },
    { name: 'vulnerability', description: 'Feeling unable to cope with stress' }
  ]
};

/**
 * Cross-Trait Correlation Matrix
 * Maps personality trait patterns to specific facet priorities
 */
const CROSS_TRAIT_CORRELATIONS = {
  // Neuroticism facets
  neuroticism: {
    anxiety: {
      boostIf: [
        { trait: 'conscientiousness', operator: '<', value: 3.5, boost: 3 }, // Low C → procrastination anxiety
        { trait: 'neuroticism', subIndicator: 'emotional_regulation', operator: '>', value: 3.5, boost: 6 }, // Emotional dysreg → anxiety (increased from 4)
        { trait: 'extraversion', operator: '<', value: 2.5, boost: 3 } // Introversion → social anxiety (increased from 2)
      ]
    },
    angry_hostility: {
      boostIf: [
        { trait: 'agreeableness', operator: '<', value: 2.5, boost: 4 } // Low A → anger (increased from 3)
      ],
      suppressIf: [
        { trait: 'agreeableness', operator: '>=', value: 3.0, suppress: 4 }, // Medium-High A → less anger (lowered threshold from 3.5, increased from 3)
        { trait: 'neuroticism', subIndicator: 'emotional_regulation', operator: '>', value: 3.5, suppress: 3 } // Emotional dysreg is anxiety, not anger
      ]
    },
    depression: {
      boostIf: [
        { trait: 'extraversion', operator: '<', value: 2.5, boost: 3 }, // Low E → depression
        { trait: 'conscientiousness', operator: '<', value: 2.5, boost: 2 } // Low C → hopelessness
      ]
    },
    vulnerability: {
      boostIf: [
        { trait: 'neuroticism', subIndicator: 'emotional_regulation', operator: '>', value: 3.5, boost: 4 },
        { trait: 'conscientiousness', operator: '<', value: 2.5, boost: 2 }
      ]
    },
    impulsiveness: {
      boostIf: [
        { trait: 'conscientiousness', operator: '<', value: 2.5, boost: 3 },
        { trait: 'neuroticism', subIndicator: 'executive', operator: '>', value: 3.5, boost: 3 } // ADHD → impulsivity
      ]
    }
  },

  // Conscientiousness facets
  conscientiousness: {
    order: {
      boostIf: [
        { trait: 'neuroticism', operator: '>', value: 3.5, boost: 2 }, // High N → compensatory organization
        { trait: 'neuroticism', subIndicator: 'executive', operator: '>', value: 3.5, boost: 3 } // EF issues → organization struggles
      ]
    },
    self_discipline: {
      boostIf: [
        { trait: 'neuroticism', subIndicator: 'executive', operator: '>', value: 3.5, boost: 4 } // ADHD → self-discipline issues
      ]
    },
    achievement_striving: {
      boostIf: [
        { trait: 'openness', operator: '>', value: 3.5, boost: 2 }, // High O → ambitious
        { trait: 'neuroticism', operator: '<', value: 3.0, boost: 2 } // Low N → confident achievement
      ]
    },
    competence: {
      boostIf: [
        { trait: 'neuroticism', operator: '>', value: 3.5, boost: 2 } // High N → self-doubt
      ]
    },
    deliberation: {
      boostIf: [
        { trait: 'neuroticism', subIndicator: 'executive', operator: '>', value: 3.5, boost: 3 } // ADHD → impulsivity
      ]
    }
  },

  // Extraversion facets
  extraversion: {
    warmth: {
      boostIf: [
        { trait: 'agreeableness', operator: '>', value: 3.5, boost: 2 }
      ]
    },
    assertiveness: {
      boostIf: [
        { trait: 'neuroticism', operator: '<', value: 3.0, boost: 2 }, // Low N → confident
        { trait: 'agreeableness', operator: '<', value: 3.0, boost: 2 } // Low A → assertive
      ]
    },
    excitement_seeking: {
      boostIf: [
        { trait: 'openness', operator: '>', value: 3.5, boost: 2 },
        { trait: 'neuroticism', subIndicator: 'executive', operator: '>', value: 3.5, boost: 2 } // ADHD → sensation seeking
      ]
    }
  },

  // Agreeableness facets
  agreeableness: {
    compliance: {
      boostIf: [
        { trait: 'neuroticism', operator: '>', value: 3.5, boost: 2 }, // High N → conflict avoidance
        { trait: 'neuroticism', subIndicator: 'social', operator: '>', value: 3.5, boost: 3 } // Social difficulty → people-pleasing
      ]
    },
    straightforwardness: {
      suppressIf: [
        { trait: 'neuroticism', subIndicator: 'social', operator: '>', value: 3.5, suppress: 2 } // Autism → masking
      ]
    }
  },

  // Openness facets
  openness: {
    fantasy: {
      boostIf: [
        { trait: 'neuroticism', operator: '>', value: 3.5, boost: 2 }, // Escapism
        { trait: 'neuroticism', subIndicator: 'executive', operator: '>', value: 3.5, boost: 2 } // ADHD → daydreaming
      ]
    },
    feelings: {
      boostIf: [
        { trait: 'neuroticism', operator: '>', value: 3.5, boost: 3 }, // Emotional intensity
        { trait: 'neuroticism', subIndicator: 'sensory', operator: '>', value: 3.5, boost: 2 } // Sensory sensitivity → emotional sensitivity
      ]
    }
  }
};

/**
 * Calculate facet-specific priorities based on profile
 * @param {Object} profile - Baseline profile with bigFive and neurodiversity scores
 * @param {String} trait - The Big Five trait
 * @returns {Array} - Array of {facet, priority} objects, sorted by priority
 */
function calculateFacetPriorities(profile, trait) {
  const facets = NEO_FACETS[trait];
  if (!facets) return [];

  const facetPriorities = facets.map(facetDef => {
    let priority = 5; // Base priority

    // Check if this trait has correlation rules
    const traitRules = CROSS_TRAIT_CORRELATIONS[trait];
    if (traitRules && traitRules[facetDef.name]) {
      const facetRules = traitRules[facetDef.name];

      // Apply boost rules
      if (facetRules.boostIf) {
        facetRules.boostIf.forEach(rule => {
          if (checkRule(profile, rule)) {
            priority += rule.boost;
          }
        });
      }

      // Apply suppress rules
      if (facetRules.suppressIf) {
        facetRules.suppressIf.forEach(rule => {
          if (checkRule(profile, rule)) {
            priority -= rule.suppress;
          }
        });
      }
    }

    return {
      facet: facetDef.name,
      priority,
      description: facetDef.description
    };
  });

  // Sort by priority (highest first)
  return facetPriorities.sort((a, b) => b.priority - a.priority);
}

/**
 * Check if a correlation rule applies
 */
function checkRule(profile, rule) {
  let value;

  // Get the value to check
  if (rule.subIndicator) {
    // Check neurodiversity sub-indicator
    value = profile.neurodiversity?.[rule.subIndicator] || 3;
  } else {
    // Check Big Five trait
    value = profile.bigFive?.[rule.trait] || 3;
  }

  // Apply operator
  switch (rule.operator) {
    case '>': return value > rule.value;
    case '<': return value < rule.value;
    case '>=': return value >= rule.value;
    case '<=': return value <= rule.value;
    case '==': return Math.abs(value - rule.value) < 0.1;
    default: return false;
  }
}

/**
 * Get recommended facet count for a trait based on score extremity
 * @param {Number} traitScore - Big Five trait score (1-5)
 * @param {Number} totalAllocation - Total facet questions available
 * @returns {Number} - Recommended number of facets to assess
 */
function getRecommendedFacetCount(traitScore, totalAllocation) {
  const extremity = Math.abs(traitScore - 3); // Distance from neutral

  if (extremity >= 1.5) return Math.min(6, Math.ceil(totalAllocation * 0.35)); // Very extreme: 35% of allocation
  if (extremity >= 1.0) return Math.min(5, Math.ceil(totalAllocation * 0.25)); // Extreme: 25% of allocation
  if (extremity >= 0.5) return Math.min(4, Math.ceil(totalAllocation * 0.20)); // Moderate: 20% of allocation
  return Math.min(3, Math.ceil(totalAllocation * 0.15)); // Near neutral: 15% of allocation
}

module.exports = {
  NEO_FACETS,
  CROSS_TRAIT_CORRELATIONS,
  calculateFacetPriorities,
  getRecommendedFacetCount
};
