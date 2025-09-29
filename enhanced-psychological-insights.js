// Enhanced Psychological Insights Database
// Based on latest research in psychology, neuroscience, and behavioral science

const EnhancedPsychologicalInsights = {
  // Attachment Theory (Bowlby, Ainsworth, Main & Solomon)
  attachmentStyles: {
    secure: {
      prevalence: 0.6,
      characteristics: {
        selfView: 'positive',
        othersView: 'positive',
        emotionalRegulation: 'effective',
        relationshipSatisfaction: 'high'
      },
      indicators: {
        openness: { min: 50, ideal: 65 },
        agreeableness: { min: 55, ideal: 70 },
        neuroticism: { max: 45, ideal: 30 },
        conscientiousness: { min: 50, ideal: 65 }
      },
      developmentalOrigins: [
        'Consistent responsive caregiving',
        'Emotional attunement in childhood',
        'Safe exploration environment'
      ],
      relationshipPatterns: [
        'Comfortable with intimacy and independence',
        'Effective communication during conflict',
        'Trust and emotional availability'
      ],
      workplaceImpact: {
        leadership: 'Transformational style',
        teamwork: 'Collaborative and supportive',
        stressResponse: 'Adaptive problem-solving',
        performance: 'Consistent and reliable'
      }
    },
    anxious: {
      prevalence: 0.15,
      characteristics: {
        selfView: 'negative',
        othersView: 'positive',
        emotionalRegulation: 'hyperactivated',
        relationshipSatisfaction: 'variable'
      },
      indicators: {
        neuroticism: { min: 60, typical: 75 },
        agreeableness: { min: 60, typical: 70 },
        extraversion: { min: 55, typical: 65 }
      },
      copingStrategies: [
        'Mindfulness-based stress reduction',
        'Cognitive restructuring',
        'Self-compassion practices',
        'Secure base building'
      ]
    },
    avoidant: {
      prevalence: 0.2,
      characteristics: {
        selfView: 'positive',
        othersView: 'negative',
        emotionalRegulation: 'deactivated',
        relationshipSatisfaction: 'moderate'
      },
      indicators: {
        openness: { max: 50, typical: 40 },
        agreeableness: { max: 45, typical: 35 },
        extraversion: { max: 40, typical: 30 }
      },
      growthAreas: [
        'Emotional awareness development',
        'Vulnerability practice',
        'Trust building exercises',
        'Gradual intimacy exposure'
      ]
    },
    disorganized: {
      prevalence: 0.05,
      characteristics: {
        selfView: 'inconsistent',
        othersView: 'inconsistent',
        emotionalRegulation: 'chaotic',
        relationshipSatisfaction: 'low'
      },
      therapeuticApproaches: [
        'Trauma-informed therapy',
        'EMDR',
        'Somatic experiencing',
        'Attachment-based therapy'
      ]
    }
  },

  // Cognitive Processing Styles (Based on Dual-Process Theory)
  cognitiveStyles: {
    analytical: {
      characteristics: {
        processingSpeed: 'deliberate',
        decisionMaking: 'systematic',
        problemSolving: 'logical',
        informationPreference: 'detailed'
      },
      strengthAreas: [
        'Complex problem solving',
        'Strategic planning',
        'Data analysis',
        'Critical evaluation'
      ],
      optimalEnvironments: [
        'Structured settings',
        'Time for reflection',
        'Clear objectives',
        'Minimal interruptions'
      ],
      traitCorrelations: {
        conscientiousness: 0.65,
        openness: 0.45,
        neuroticism: -0.3
      }
    },
    intuitive: {
      characteristics: {
        processingSpeed: 'rapid',
        decisionMaking: 'heuristic',
        problemSolving: 'creative',
        informationPreference: 'patterns'
      },
      strengthAreas: [
        'Pattern recognition',
        'Creative solutions',
        'Quick decisions',
        'Holistic understanding'
      ],
      optimalEnvironments: [
        'Dynamic settings',
        'Collaborative spaces',
        'Flexible deadlines',
        'Creative freedom'
      ],
      traitCorrelations: {
        openness: 0.7,
        extraversion: 0.4,
        agreeableness: 0.35
      }
    },
    integrated: {
      characteristics: {
        processingSpeed: 'adaptive',
        decisionMaking: 'contextual',
        problemSolving: 'flexible',
        informationPreference: 'balanced'
      },
      developmentPath: [
        'Metacognitive awareness',
        'Deliberate practice',
        'Cognitive flexibility training',
        'Mindfulness meditation'
      ]
    }
  },

  // Emotional Intelligence Model (Mayer & Salovey, Goleman)
  emotionalIntelligence: {
    dimensions: {
      selfAwareness: {
        components: ['Emotional awareness', 'Accurate self-assessment', 'Self-confidence'],
        assessmentItems: {
          high: 'I can identify my emotions as they occur',
          medium: 'I sometimes understand why I feel certain ways',
          low: 'I often feel confused about my emotions'
        },
        developmentExercises: [
          'Emotion journaling',
          'Body scan meditation',
          'Feeling wheel practice',
          'Mindful check-ins'
        ]
      },
      selfManagement: {
        components: [
          'Emotional self-control',
          'Adaptability',
          'Achievement orientation',
          'Positive outlook'
        ],
        copingStrategies: {
          cognitive: ['Reframing', 'Problem-solving', 'Planning'],
          behavioral: ['Exercise', 'Progressive relaxation', 'Behavioral activation'],
          emotional: ['Acceptance', 'Self-compassion', 'Emotional expression'],
          social: ['Support seeking', 'Communication', 'Boundary setting']
        }
      },
      socialAwareness: {
        components: ['Empathy', 'Organizational awareness', 'Service orientation'],
        neurological: {
          mirrorNeurons: 'Activated during empathetic responses',
          prefrontalCortex: 'Theory of mind processing',
          insula: 'Interoceptive awareness'
        }
      },
      relationshipManagement: {
        components: ['Influence', 'Conflict management', 'Leadership', 'Teamwork'],
        skills: {
          communication: ['Active listening', 'Nonviolent communication', 'Assertiveness'],
          conflictResolution: ['Mediation', 'Negotiation', 'De-escalation'],
          collaboration: ['Team building', 'Consensus building', 'Facilitation']
        }
      }
    },
    correlations: {
      jobPerformance: 0.58,
      leadership: 0.67,
      wellbeing: 0.72,
      relationshipQuality: 0.65
    }
  },

  // Stress Response Patterns (Based on Lazarus & Folkman, Selye)
  stressResponsePatterns: {
    adaptive: {
      characteristics: {
        appraisal: 'Challenge-focused',
        copingStyle: 'Problem-focused',
        physiological: 'Quick recovery',
        psychological: 'Growth mindset'
      },
      biomarkers: {
        cortisol: 'Moderate peak, quick return to baseline',
        heartRateVariability: 'High',
        inflammation: 'Low chronic levels'
      },
      resilience: {
        factors: ['Cognitive flexibility', 'Social support', 'Self-efficacy', 'Meaning-making'],
        building: [
          'Stress inoculation training',
          'Cognitive behavioral therapy',
          'Mindfulness-based stress reduction',
          'Physical exercise'
        ]
      }
    },
    maladaptive: {
      characteristics: {
        appraisal: 'Threat-focused',
        copingStyle: 'Emotion-focused avoidance',
        physiological: 'Chronic activation',
        psychological: 'Fixed mindset'
      },
      healthRisks: {
        cardiovascular: 'Increased by 40%',
        immuneSuppression: '25% reduction in function',
        mentalHealth: '2.5x anxiety/depression risk',
        cognitiveDecline: 'Accelerated by 5-10 years'
      },
      interventions: [
        'Stress management training',
        'Biofeedback',
        'Progressive muscle relaxation',
        'Cognitive restructuring'
      ]
    }
  },

  // Decision-Making Styles (Based on Scott & Bruce, Driver et al.)
  decisionMakingStyles: {
    rational: {
      process: 'Systematic evaluation of alternatives',
      timeRequired: 'Extended',
      accuracy: 'High for complex decisions',
      satisfaction: 'High when time available',
      enhancementStrategies: [
        'Decision matrices',
        'Cost-benefit analysis',
        'Scenario planning',
        'Evidence gathering'
      ]
    },
    intuitive: {
      process: 'Gut feelings and hunches',
      timeRequired: 'Minimal',
      accuracy: 'High in familiar domains',
      satisfaction: 'Variable',
      enhancementStrategies: [
        'Pattern recognition training',
        'Experience accumulation',
        'Reflection on past decisions',
        'Intuition calibration'
      ]
    },
    dependent: {
      process: 'Seeking advice and direction',
      timeRequired: 'Variable',
      accuracy: 'Depends on advisor quality',
      satisfaction: 'Moderate',
      growthOpportunities: [
        'Confidence building',
        'Decision practice',
        'Self-trust exercises',
        'Gradual independence'
      ]
    },
    avoidant: {
      process: 'Postponing or avoiding',
      timeRequired: 'Indefinite',
      accuracy: 'Often poor by default',
      satisfaction: 'Low',
      interventions: [
        'Breaking down decisions',
        'Setting deadlines',
        'Reducing perfectionism',
        'Anxiety management'
      ]
    },
    spontaneous: {
      process: 'Immediate, impulsive',
      timeRequired: 'Instant',
      accuracy: 'Variable',
      satisfaction: 'Initial high, potential regret',
      balanceStrategies: [
        'Pause protocols',
        '10-10-10 rule',
        'Implementation intentions',
        'Pre-commitment strategies'
      ]
    }
  },

  // Motivation Profiles (SDT - Deci & Ryan)
  motivationProfiles: {
    intrinsic: {
      drivers: ['Autonomy', 'Mastery', 'Purpose'],
      characteristics: {
        persistence: 'High',
        creativity: 'Enhanced',
        wellbeing: 'Elevated',
        performance: 'Sustainable'
      },
      cultivationStrategies: [
        'Choice provision',
        'Skill-challenge balance',
        'Meaning connection',
        'Progress tracking'
      ]
    },
    extrinsic: {
      types: {
        external: 'Rewards and punishments',
        introjected: 'Ego involvement, shame avoidance',
        identified: 'Personal importance',
        integrated: 'Congruence with values'
      },
      effectiveness: {
        shortTerm: 'High',
        longTerm: 'Decreasing',
        creativity: 'Potentially reduced',
        wellbeing: 'Variable'
      }
    },
    amotivation: {
      characteristics: 'Lack of intention to act',
      causes: ['Learned helplessness', 'Lack of competence', 'Absence of value', 'Depression'],
      interventions: [
        'Competence building',
        'Small wins strategy',
        'Value clarification',
        'Behavioral activation'
      ]
    }
  },

  // Flow States (Csikszentmihalyi)
  flowStates: {
    conditions: {
      skillChallengeBalance: 'Critical',
      clearGoals: 'Essential',
      immediateFeedback: 'Required',
      deepConcentration: 'Necessary'
    },
    neurological: {
      transientHypofrontality: 'Reduced prefrontal activity',
      dopamine: 'Increased release',
      norepinephrine: 'Optimal levels',
      endorphins: 'Elevated',
      anandamide: 'Present'
    },
    triggers: {
      environmental: ['High consequences', 'Rich environments', 'Deep embodiment'],
      psychological: ['Intense focus', 'Clear goals', 'Immediate feedback'],
      social: ['Shared goals', 'Equal participation', 'Familiar communication'],
      creative: ['Creativity itself', 'Pattern recognition', 'Lateral connections']
    },
    personalityCorrelates: {
      openness: 0.65,
      conscientiousness: 0.45,
      neuroticism: -0.4,
      autotelic: 0.75
    }
  },

  // Values Systems (Schwartz Theory of Basic Values)
  valuesSystems: {
    dimensions: {
      selfTranscendence: {
        values: ['Universalism', 'Benevolence'],
        behaviors: ['Helping', 'Volunteering', 'Environmental action'],
        careerFit: ['Healthcare', 'Education', 'Non-profit', 'Social work']
      },
      selfEnhancement: {
        values: ['Power', 'Achievement'],
        behaviors: ['Competition', 'Status seeking', 'Resource accumulation'],
        careerFit: ['Business', 'Law', 'Politics', 'Sales']
      },
      openness: {
        values: ['Self-direction', 'Stimulation', 'Hedonism'],
        behaviors: ['Exploration', 'Risk-taking', 'Novelty seeking'],
        careerFit: ['Arts', 'Entrepreneurship', 'Research', 'Travel']
      },
      conservation: {
        values: ['Security', 'Conformity', 'Tradition'],
        behaviors: ['Rule following', 'Routine maintenance', 'Heritage preservation'],
        careerFit: ['Government', 'Military', 'Banking', 'Accounting']
      }
    },
    culturalVariation: {
      individualistic: 'Self-direction and stimulation emphasized',
      collectivistic: 'Conformity and tradition emphasized',
      hierarchical: 'Power and security emphasized',
      egalitarian: 'Universalism and benevolence emphasized'
    }
  },

  // Creativity Profiles (Based on Kaufman & Beghetto)
  creativityProfiles: {
    levels: {
      miniC: {
        description: 'Personal meaningful insights',
        examples: ['Personal problem solving', 'Daily innovations', 'Learning insights'],
        cultivation: ['Journaling', 'Reflection', 'Experimentation']
      },
      littleC: {
        description: 'Everyday creativity',
        examples: ['Hobbies', 'Amateur art', 'Local innovations'],
        cultivation: ['Practice', 'Skill development', 'Community engagement']
      },
      proC: {
        description: 'Professional expertise',
        examples: ['Professional art', 'Scientific research', 'Design work'],
        requirements: ['10,000 hours practice', 'Domain expertise', 'Peer recognition']
      },
      bigC: {
        description: 'Eminent creativity',
        examples: ['Nobel prizes', 'Paradigm shifts', 'Cultural impact'],
        factors: ['Exceptional ability', 'Opportunity', 'Historical timing']
      }
    },
    cognitiveStyles: {
      divergent: {
        strengths: ['Idea generation', 'Alternative thinking', 'Flexibility'],
        exercises: ['Brainstorming', 'SCAMPER', 'Random associations']
      },
      convergent: {
        strengths: ['Idea evaluation', 'Implementation', 'Refinement'],
        exercises: ['Criteria matrices', 'Prototyping', 'Testing']
      }
    },
    personalityFactors: {
      openness: 0.73,
      extraversion: 0.08,
      agreeableness: -0.12,
      conscientiousness: 0.11,
      neuroticism: 0.15
    }
  },

  // Social Intelligence (Gardner, Goleman, Albrecht)
  socialIntelligence: {
    components: {
      situationalAwareness: {
        skills: ['Context reading', 'Nonverbal decoding', 'Social radar'],
        development: ['People watching', 'Cultural immersion', 'Feedback seeking']
      },
      presence: {
        skills: ['Appearance', 'Nonverbal communication', 'Charisma'],
        development: ['Video practice', 'Body language training', 'Voice coaching']
      },
      authenticity: {
        skills: ['Genuine expression', 'Consistency', 'Transparency'],
        development: ['Values clarification', 'Self-awareness', 'Integrity practice']
      },
      clarity: {
        skills: ['Clear communication', 'Active listening', 'Empathetic responding'],
        development: ['Communication training', 'Listening exercises', 'Empathy building']
      },
      empathy: {
        cognitive: "Understanding others' thoughts",
        emotional: "Feeling others' emotions",
        compassionate: 'Motivated to help',
        development: ['Perspective taking', 'Emotional labeling', 'Compassion meditation']
      }
    },
    neuroscience: {
      socialBrain: [
        'Medial prefrontal cortex',
        'Temporal parietal junction',
        'Superior temporal sulcus'
      ],
      oxytocin: 'Trust and bonding',
      dopamine: 'Social reward processing'
    }
  }
};

// Export for use in system
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedPsychologicalInsights;
}
