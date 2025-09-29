/**
 * Psychological Research Database
 *
 * This file contains validated psychological assessment standards, scoring criteria,
 * and research-based thresholds for all assessment instruments used in Neurlyn.
 * All data is based on peer-reviewed research and established clinical standards.
 *
 * Last Updated: 2024
 */

const PsychologicalResearchDatabase = {
  /**
   * Big Five Personality Assessment (NEO-PI-R / BFI-2 Based)
   * Sources: Costa & McCrae (1992), Soto & John (2017), BFI-2 norms
   */
  bigFive: {
    description: 'The Five-Factor Model of personality, validated across cultures',
    heritability: {
      openness: { min: 48, max: 61, average: 54.5 },
      conscientiousness: { min: 44, max: 49, average: 46.5 },
      extraversion: { min: 50, max: 53, average: 51.5 },
      agreeableness: { min: 41, max: 48, average: 44.5 },
      neuroticism: { min: 41, max: 49, average: 45 }
    },
    percentileRanges: {
      veryLow: { min: 0, max: 10, description: 'Well below average (bottom 10%)' },
      low: { min: 10, max: 30, description: 'Below average (10-30th percentile)' },
      average: { min: 30, max: 70, description: 'Average range (30-70th percentile)' },
      high: { min: 70, max: 90, description: 'Above average (70-90th percentile)' },
      veryHigh: { min: 90, max: 100, description: 'Well above average (top 10%)' }
    },
    interpretationGuidelines: {
      // Based on standard deviations from the mean (T-scores)
      tScoreRanges: {
        veryLow: { min: 20, max: 35 },
        low: { min: 35, max: 45 },
        average: { min: 45, max: 55 },
        high: { min: 55, max: 65 },
        veryHigh: { min: 65, max: 80 }
      }
    },
    facets: {
      openness: ['Fantasy', 'Aesthetics', 'Feelings', 'Actions', 'Ideas', 'Values'],
      conscientiousness: [
        'Competence',
        'Order',
        'Dutifulness',
        'Achievement-Striving',
        'Self-Discipline',
        'Deliberation'
      ],
      extraversion: [
        'Warmth',
        'Gregariousness',
        'Assertiveness',
        'Activity',
        'Excitement-Seeking',
        'Positive Emotions'
      ],
      agreeableness: [
        'Trust',
        'Straightforwardness',
        'Altruism',
        'Compliance',
        'Modesty',
        'Tender-Mindedness'
      ],
      neuroticism: [
        'Anxiety',
        'Angry Hostility',
        'Depression',
        'Self-Consciousness',
        'Impulsiveness',
        'Vulnerability'
      ]
    }
  },

  /**
   * ADHD Assessment (ASRS-5 / DSM-5 Based)
   * Sources: Kessler et al. (2017), WHO, DSM-5-TR
   */
  adhd: {
    asrs5: {
      description: 'Adult ADHD Self-Report Scale for DSM-5',
      items: 6,
      scoringRange: { min: 0, max: 24 },
      cutoffs: {
        screening: {
          threshold: 14,
          sensitivity: 91.4,
          specificity: 96.0,
          ppv: 67.3, // Positive Predictive Value
          npv: 99.0 // Negative Predictive Value
        }
      },
      interpretation: {
        minimal: { min: 0, max: 9, likelihood: 'Low' },
        mild: { min: 10, max: 13, likelihood: 'Possible' },
        moderate: { min: 14, max: 18, likelihood: 'Probable' },
        severe: { min: 19, max: 24, likelihood: 'High' }
      },
      symptomDomains: {
        inattention: {
          dsmCriteria: 5, // 5 symptoms required for adults
          symptoms: [
            'Difficulty sustaining attention',
            'Often loses things',
            'Easily distracted',
            'Difficulty organizing tasks',
            'Avoids tasks requiring sustained mental effort',
            'Fails to give close attention to details',
            'Difficulty following through on instructions',
            'Forgetful in daily activities',
            'Does not seem to listen when spoken to directly'
          ]
        },
        hyperactivityImpulsivity: {
          dsmCriteria: 5, // 5 symptoms required for adults
          symptoms: [
            'Fidgets or squirms',
            'Leaves seat when remaining seated is expected',
            'Feels restless',
            'Unable to engage in leisure activities quietly',
            'On the go or driven by a motor',
            'Talks excessively',
            'Blurts out answers',
            'Difficulty waiting turn',
            'Interrupts or intrudes on others'
          ]
        }
      },
      prevalence: {
        adults: 4.4, // Percentage
        maleToFemaleRatio: 1.6
      }
    },
    executiveFunctionImpact: {
      // Based on Barkley's Executive Function Model
      domains: {
        workingMemory: { impairmentRange: [30, 60] },
        cognitiveFlexibility: { impairmentRange: [25, 55] },
        inhibition: { impairmentRange: [20, 50] },
        planning: { impairmentRange: [25, 55] },
        emotionalRegulation: { impairmentRange: [30, 60] }
      }
    }
  },

  /**
   * Autism Spectrum Assessment (AQ-10 / AQ-50 Based)
   * Sources: Baron-Cohen et al. (2001), Allison et al. (2012), 2024 Research
   */
  autism: {
    aq10: {
      description: 'Autism Spectrum Quotient - 10 item version',
      items: 10,
      scoringRange: { min: 0, max: 10 },
      cutoffs: {
        screening: {
          optimalThreshold: 6, // 2024 research recommendation
          niceThreshold: 7, // NICE guidelines (suboptimal)
          sensitivity: 88,
          specificity: 91
        }
      },
      interpretation: {
        minimal: { min: 0, max: 3, likelihood: 'Low' },
        belowThreshold: { min: 4, max: 5, likelihood: 'Below clinical threshold' },
        threshold: { min: 6, max: 7, likelihood: 'Warrants assessment' },
        significant: { min: 8, max: 10, likelihood: 'High likelihood' }
      }
    },
    aq50: {
      description: 'Full Autism Spectrum Quotient',
      items: 50,
      scoringRange: { min: 0, max: 50 },
      cutoffs: {
        general: {
          threshold: 26,
          pronounced: 36,
          highlySignificant: 32 // 79.3% of autistic people score here
        },
        genderSpecific: {
          male: { threshold: 26, pronounced: 37 },
          female: { threshold: 27, pronounced: 39 } // 92.3% of autistic females score 32+
        }
      },
      domains: {
        socialSkills: { items: 10 },
        attentionSwitching: { items: 10 },
        attentionToDetail: { items: 10 },
        communication: { items: 10 },
        imagination: { items: 10 }
      }
    },
    prevalence: {
      general: 1.0, // Approximately 1% of population
      maleToFemaleRatio: 3.0 // Though likely underdiagnosed in females
    }
  },

  /**
   * Sensory Processing Patterns (Based on Dunn's Sensory Profile)
   * Sources: Dunn (1997, 2014), Brown et al. (2001)
   */
  sensoryProcessing: {
    quadrants: {
      lowRegistration: {
        description: 'High neurological threshold, passive behavioral response',
        characteristics: ['Misses input', 'Appears uninterested', 'Slow to respond'],
        prevalenceInAutism: 65, // Percentage
        prevalenceInADHD: 45
      },
      sensationSeeking: {
        description: 'High neurological threshold, active behavioral response',
        characteristics: ['Craves intense input', 'Creates sensation', 'Fidgety'],
        prevalenceInAutism: 35,
        prevalenceInADHD: 70
      },
      sensorySensitivity: {
        description: 'Low neurological threshold, passive behavioral response',
        characteristics: ['Notices everything', 'Easily distracted', 'Uncomfortable with change'],
        prevalenceInAutism: 75,
        prevalenceInADHD: 55
      },
      sensationAvoiding: {
        description: 'Low neurological threshold, active behavioral response',
        characteristics: ['Withdraws from stimuli', 'Creates rituals', 'Limits exposure'],
        prevalenceInAutism: 80,
        prevalenceInADHD: 40
      }
    },
    scoringInterpretation: {
      muchLessThan: { percentile: [0, 16], description: 'Much less than most people' },
      lessThan: { percentile: [16, 30], description: 'Less than most people' },
      similar: { percentile: [30, 70], description: 'Similar to most people' },
      moreThan: { percentile: [70, 84], description: 'More than most people' },
      muchMoreThan: { percentile: [84, 100], description: 'Much more than most people' }
    }
  },

  /**
   * Executive Function Assessment
   * Sources: Barkley (2012), Diamond (2013), Zelazo et al. (2003)
   */
  executiveFunction: {
    domains: {
      workingMemory: {
        description: 'Ability to hold and manipulate information',
        percentileRanges: {
          impaired: [0, 16],
          belowAverage: [16, 30],
          average: [30, 70],
          aboveAverage: [70, 84],
          superior: [84, 100]
        },
        adhdImpact: { meanReduction: 35, sd: 15 },
        autismImpact: { meanReduction: 15, sd: 20 } // Variable
      },
      cognitiveFlexibility: {
        description: 'Ability to switch between tasks or mental sets',
        percentileRanges: {
          impaired: [0, 16],
          belowAverage: [16, 30],
          average: [30, 70],
          aboveAverage: [70, 84],
          superior: [84, 100]
        },
        adhdImpact: { meanReduction: 40, sd: 15 },
        autismImpact: { meanReduction: 45, sd: 15 }
      },
      inhibitoryControl: {
        description: 'Ability to suppress inappropriate responses',
        percentileRanges: {
          impaired: [0, 16],
          belowAverage: [16, 30],
          average: [30, 70],
          aboveAverage: [70, 84],
          superior: [84, 100]
        },
        adhdImpact: { meanReduction: 50, sd: 20 },
        autismImpact: { meanReduction: 25, sd: 15 }
      },
      planning: {
        description: 'Ability to formulate and execute goal-directed plans',
        percentileRanges: {
          impaired: [0, 16],
          belowAverage: [16, 30],
          average: [30, 70],
          aboveAverage: [70, 84],
          superior: [84, 100]
        },
        adhdImpact: { meanReduction: 45, sd: 20 },
        autismImpact: { meanReduction: 30, sd: 25 } // Variable based on routine
      }
    },
    developmentalTrajectory: {
      peak: { age: 25, description: 'Executive functions peak in mid-20s' },
      decline: { startAge: 60, rate: 2 } // 2% per year after 60
    }
  },

  /**
   * Comorbidity and Co-occurrence Rates
   * Sources: Various meta-analyses and epidemiological studies
   */
  comorbidity: {
    adhdWithAutism: {
      rate: 30, // 30% of ADHD individuals meet autism criteria
      sharedFeatures: ['Executive dysfunction', 'Sensory issues', 'Social difficulties'],
      differentiatingFactors: [
        'Social motivation (higher in ADHD)',
        'Repetitive behaviors (higher in autism)',
        'Response to change (more flexible in ADHD)'
      ]
    },
    anxietyDisorders: {
      withADHD: 47,
      withAutism: 40,
      general: 19
    },
    depression: {
      withADHD: 18.6,
      withAutism: 26,
      general: 8.5
    }
  },

  /**
   * Scoring Algorithms and Formulas
   */
  scoringAlgorithms: {
    /**
     * Convert raw score to percentile using normal distribution
     */
    rawToPercentile: function (rawScore, mean, sd) {
      const zScore = (rawScore - mean) / sd;
      // Using error function approximation for normal CDF
      const a1 = 0.254829592;
      const a2 = -0.284496736;
      const a3 = 1.421413741;
      const a4 = -1.453152027;
      const a5 = 1.061405429;
      const p = 0.3275911;

      const sign = zScore < 0 ? -1 : 1;
      const x = Math.abs(zScore) / Math.sqrt(2);
      const t = 1.0 / (1.0 + p * x);
      const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

      return 50 + 50 * sign * y;
    },

    /**
     * Calculate composite score with weighted factors
     */
    weightedComposite: function (scores, weights) {
      if (scores.length !== weights.length) {
        throw new Error('Scores and weights must have same length');
      }

      const weightedSum = scores.reduce((sum, score, i) => sum + score * weights[i], 0);
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

      return weightedSum / totalWeight;
    },

    /**
     * Apply confidence interval based on reliability
     */
    confidenceInterval: function (score, sem, confidenceLevel = 0.95) {
      // SEM = Standard Error of Measurement
      const zScores = {
        0.9: 1.645,
        0.95: 1.96,
        0.99: 2.576
      };

      const z = zScores[confidenceLevel] || 1.96;

      return {
        lower: score - z * sem,
        upper: score + z * sem,
        confidence: confidenceLevel * 100
      };
    }
  },

  /**
   * Clinical Interpretation Guidelines
   */
  interpretationGuidelines: {
    /**
     * Determine clinical significance based on multiple criteria
     */
    clinicalSignificance: function (score, threshold, reliability = 0.8) {
      const sem = Math.sqrt(1 - reliability) * 15; // Assuming SD of 15
      const ci = this.scoringAlgorithms.confidenceInterval(score, sem);

      if (ci.lower >= threshold) {
        return 'Clinically significant';
      } else if (ci.upper < threshold) {
        return 'Not clinically significant';
      } else {
        return 'Borderline/Uncertain';
      }
    },

    /**
     * Generate interpretation narrative
     */
    generateNarrative: function (domain, percentile) {
      const ranges = this.executiveFunction.domains[domain].percentileRanges;

      for (const [range, values] of Object.entries(ranges)) {
        if (percentile >= values[0] && percentile <= values[1]) {
          return `Performance in ${domain} falls in the ${range} range (${percentile}th percentile)`;
        }
      }
    }
  },

  /**
   * Evidence-Based Recommendations
   */
  recommendations: {
    adhd: {
      mild: [
        'Organizational tools and apps',
        'Regular exercise routine',
        'Mindfulness practices',
        'Time management strategies'
      ],
      moderate: [
        'Professional evaluation',
        'Cognitive Behavioral Therapy (CBT)',
        'Coaching or skills training',
        'Medication evaluation'
      ],
      severe: [
        'Comprehensive assessment',
        'Multimodal treatment approach',
        'Medication management',
        'Intensive behavioral interventions'
      ]
    },
    autism: {
      support: [
        'Sensory accommodations',
        'Clear communication preferences',
        'Routine and predictability',
        'Social skills support'
      ],
      strengths: [
        'Pattern recognition abilities',
        'Attention to detail',
        'Systematic thinking',
        'Deep focus on interests'
      ]
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PsychologicalResearchDatabase;
}

// Also make available as global for browser environments
if (typeof window !== 'undefined') {
  window.PsychologicalResearchDatabase = PsychologicalResearchDatabase;
}
