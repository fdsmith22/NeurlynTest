/**
 * Complete Psychological Research Database for Neurlyn
 *
 * This file combines all validated psychological assessment standards,
 * scoring criteria, and research-based thresholds from both basic and
 * extended research databases. Data is based on peer-reviewed meta-analyses,
 * large-scale studies, and the most current research (2020-2025).
 *
 * Last Updated: 2024
 */

const CompletePsychologicalResearchDatabase = {
  /**
   * Big Five Personality Assessment - Complete
   * Sources: Costa & McCrae (1992, 2020), Soto & John (2017),
   * Meta-analysis by Kajonius & Johnson (2019, N=320,128)
   */
  bigFive: {
    description: 'The Five-Factor Model of personality, validated across cultures',

    // Basic heritability data
    heritability: {
      openness: { min: 48, max: 61, average: 54.5 },
      conscientiousness: { min: 44, max: 49, average: 46.5 },
      extraversion: { min: 50, max: 53, average: 51.5 },
      agreeableness: { min: 41, max: 48, average: 44.5 },
      neuroticism: { min: 41, max: 49, average: 45 }
    },

    // Standard percentile ranges
    percentileRanges: {
      veryLow: { min: 0, max: 10, description: 'Well below average (bottom 10%)' },
      low: { min: 10, max: 30, description: 'Below average (10-30th percentile)' },
      average: { min: 30, max: 70, description: 'Average range (30-70th percentile)' },
      high: { min: 70, max: 90, description: 'Above average (70-90th percentile)' },
      veryHigh: { min: 90, max: 100, description: 'Well above average (top 10%)' }
    },

    // T-score interpretation guidelines
    interpretationGuidelines: {
      tScoreRanges: {
        veryLow: { min: 20, max: 35 },
        low: { min: 35, max: 45 },
        average: { min: 45, max: 55 },
        high: { min: 55, max: 65 },
        veryHigh: { min: 65, max: 80 }
      }
    },

    // Comprehensive facet structure from NEO-PI-3
    facets: {
      openness: {
        fantasy: {
          description: 'Vivid imagination, daydreaming',
          highScoreImplications: ['Creative thinking', 'Abstract reasoning'],
          lowScoreImplications: ['Practical focus', 'Concrete thinking'],
          itemCount: 8,
          reliability: 0.76
        },
        aesthetics: {
          description: 'Appreciation for art and beauty',
          highScoreImplications: ['Artistic interests', 'Emotional depth'],
          lowScoreImplications: ['Utilitarian focus', 'Less moved by art'],
          itemCount: 8,
          reliability: 0.78
        },
        feelings: {
          description: 'Receptivity to inner feelings',
          highScoreImplications: ['Emotional awareness', 'Empathy'],
          lowScoreImplications: ['Emotional stability', 'Less reactive'],
          itemCount: 8,
          reliability: 0.74
        },
        actions: {
          description: 'Preference for variety and novelty',
          highScoreImplications: ['Adaptability', 'Risk-taking'],
          lowScoreImplications: ['Routine preference', 'Predictability'],
          itemCount: 8,
          reliability: 0.65
        },
        ideas: {
          description: 'Intellectual curiosity',
          highScoreImplications: ['Love of learning', 'Philosophical'],
          lowScoreImplications: ['Practical minded', 'Focused thinking'],
          itemCount: 8,
          reliability: 0.81
        },
        values: {
          description: 'Readiness to re-examine values',
          highScoreImplications: ['Liberal thinking', 'Tolerance'],
          lowScoreImplications: ['Traditional values', 'Conservative'],
          itemCount: 8,
          reliability: 0.69
        },
        correlations: {
          intelligence: 0.33,
          creativity: 0.51,
          politicalLiberalism: 0.34,
          jobPerformanceCreative: 0.24
        }
      },

      conscientiousness: {
        competence: {
          description: 'Sense of personal effectiveness',
          reliability: 0.69,
          adhdCorrelation: -0.45
        },
        order: {
          description: 'Organization and methodicalness',
          reliability: 0.71,
          adhdCorrelation: -0.52
        },
        dutifulness: {
          description: 'Adherence to ethical principles',
          reliability: 0.66
        },
        achievementStriving: {
          description: 'Aspiration for excellence',
          reliability: 0.74,
          academicSuccess: 0.38
        },
        selfDiscipline: {
          description: 'Ability to complete tasks',
          reliability: 0.8,
          adhdCorrelation: -0.58
        },
        deliberation: {
          description: 'Thinking before acting',
          reliability: 0.75,
          adhdCorrelation: -0.41
        },
        lifeOutcomes: {
          longevity: 0.21,
          divorce: -0.19,
          jobPerformance: 0.31,
          income: 0.23,
          healthBehaviors: 0.28
        }
      },

      extraversion: {
        warmth: { reliability: 0.76, socialAnxietyCorrelation: -0.42 },
        gregariousness: { reliability: 0.73, socialAnxietyCorrelation: -0.51 },
        assertiveness: { reliability: 0.78, leadershipCorrelation: 0.44 },
        activity: { reliability: 0.66, adhdCorrelation: 0.31 },
        excitementSeeking: { reliability: 0.68, adhdCorrelation: 0.38 },
        positiveEmotions: { reliability: 0.79, depressionCorrelation: -0.46 },
        socialOutcomes: {
          numberOfFriends: 0.34,
          socialSupport: 0.29,
          leadershipPositions: 0.31,
          publicSpeaking: 0.42
        }
      },

      agreeableness: {
        trust: { reliability: 0.71 },
        straightforwardness: { reliability: 0.68 },
        altruism: { reliability: 0.74, prosocialBehavior: 0.41 },
        compliance: { reliability: 0.65 },
        modesty: { reliability: 0.72 },
        tenderMindedness: { reliability: 0.61 },
        interpersonalOutcomes: {
          relationshipSatisfaction: 0.28,
          conflictResolution: 0.33,
          teamworkEffectiveness: 0.36,
          peerRatings: 0.42
        }
      },

      neuroticism: {
        anxiety: {
          reliability: 0.82,
          gadCorrelation: 0.68,
          cortisol: 0.31
        },
        angryHostility: { reliability: 0.79 },
        depression: {
          reliability: 0.84,
          phq9Correlation: 0.71
        },
        selfConsciousness: { reliability: 0.73, socialAnxiety: 0.54 },
        impulsiveness: { reliability: 0.67, adhdCorrelation: 0.38 },
        vulnerability: { reliability: 0.75, stressVulnerability: 0.62 },
        clinicalCorrelations: {
          anxietyDisorders: 0.64,
          moodDisorders: 0.58,
          substanceUse: 0.23,
          somaticComplaints: 0.41,
          sleepProblems: 0.46
        }
      }
    },

    // Age and gender norms
    ageNorms: {
      '18-25': {
        openness: { mean: 52, sd: 10 },
        conscientiousness: { mean: 48, sd: 10 },
        extraversion: { mean: 53, sd: 10 },
        agreeableness: { mean: 49, sd: 10 },
        neuroticism: { mean: 51, sd: 10 }
      },
      '26-35': {
        openness: { mean: 51, sd: 10 },
        conscientiousness: { mean: 50, sd: 10 },
        extraversion: { mean: 51, sd: 10 },
        agreeableness: { mean: 50, sd: 10 },
        neuroticism: { mean: 50, sd: 10 }
      },
      '36-50': {
        openness: { mean: 50, sd: 10 },
        conscientiousness: { mean: 52, sd: 10 },
        extraversion: { mean: 49, sd: 10 },
        agreeableness: { mean: 52, sd: 10 },
        neuroticism: { mean: 48, sd: 10 }
      },
      '51+': {
        openness: { mean: 48, sd: 10 },
        conscientiousness: { mean: 54, sd: 10 },
        extraversion: { mean: 48, sd: 10 },
        agreeableness: { mean: 54, sd: 10 },
        neuroticism: { mean: 46, sd: 10 }
      }
    },

    genderDifferences: {
      openness: { d: -0.05, direction: 'F>M', significant: false },
      conscientiousness: { d: -0.14, direction: 'F>M', significant: true },
      extraversion: { d: -0.1, direction: 'F>M', significant: true },
      agreeableness: { d: -0.32, direction: 'F>M', significant: true },
      neuroticism: { d: -0.4, direction: 'F>M', significant: true }
    }
  },

  /**
   * ADHD Assessment - Complete
   * Sources: Ustun et al. (2017), Silverstein et al. (2018),
   * Meta-analysis by Faraone et al. (2021, 65 studies)
   */
  adhd: {
    // ASRS-5 Basic
    asrs5: {
      description: 'Adult ADHD Self-Report Scale for DSM-5',
      items: 6,
      scoringRange: { min: 0, max: 24 },
      cutoffs: {
        screening: {
          threshold: 14,
          sensitivity: 91.4,
          specificity: 96.0,
          ppv: 67.3,
          npv: 99.0,
          auc: 0.94
        }
      },
      interpretation: {
        minimal: { min: 0, max: 9, likelihood: 'Low' },
        mild: { min: 10, max: 13, likelihood: 'Possible' },
        moderate: { min: 14, max: 18, likelihood: 'Probable' },
        severe: { min: 19, max: 24, likelihood: 'High' }
      }
    },

    // DSM-5-TR Criteria
    dsm5trCriteria: {
      inattention: {
        requiredSymptoms: { children: 6, adults: 5 },
        duration: '6 months',
        symptoms: [
          { id: 'IA1', text: 'Fails to give close attention to details', severity: [1, 2, 3, 4] },
          { id: 'IA2', text: 'Difficulty sustaining attention', severity: [1, 2, 3, 4] },
          { id: 'IA3', text: 'Does not seem to listen', severity: [1, 2, 3, 4] },
          { id: 'IA4', text: 'Does not follow through', severity: [1, 2, 3, 4] },
          { id: 'IA5', text: 'Difficulty organizing', severity: [1, 2, 3, 4] },
          { id: 'IA6', text: 'Avoids sustained mental effort', severity: [1, 2, 3, 4] },
          { id: 'IA7', text: 'Loses things', severity: [1, 2, 3, 4] },
          { id: 'IA8', text: 'Easily distracted', severity: [1, 2, 3, 4] },
          { id: 'IA9', text: 'Forgetful in daily activities', severity: [1, 2, 3, 4] }
        ]
      },
      hyperactivityImpulsivity: {
        requiredSymptoms: { children: 6, adults: 5 },
        symptoms: [
          { id: 'HI1', text: 'Fidgets or squirms', severity: [1, 2, 3, 4] },
          { id: 'HI2', text: 'Leaves seat', severity: [1, 2, 3, 4] },
          { id: 'HI3', text: 'Runs or climbs excessively', severity: [1, 2, 3, 4] },
          { id: 'HI4', text: 'Unable to play quietly', severity: [1, 2, 3, 4] },
          { id: 'HI5', text: 'On the go', severity: [1, 2, 3, 4] },
          { id: 'HI6', text: 'Talks excessively', severity: [1, 2, 3, 4] },
          { id: 'HI7', text: 'Blurts out answers', severity: [1, 2, 3, 4] },
          { id: 'HI8', text: 'Difficulty waiting turn', severity: [1, 2, 3, 4] },
          { id: 'HI9', text: 'Interrupts or intrudes', severity: [1, 2, 3, 4] }
        ]
      }
    },

    // Symptom domains for tracking
    symptomDomains: {
      inattention: {
        dsmCriteria: 5,
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
        dsmCriteria: 5,
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

    // Prevalence and demographics
    prevalence: {
      adults: 4.4,
      maleToFemaleRatio: 1.6,
      persistenceFromChildhood: 0.65,
      lateOnsetADHD: 0.12
    },

    // Gender differences
    genderDifferences: {
      prevalenceRatio: { male: 2.28, female: 1.0 },
      presentationDifferences: {
        females: {
          inattentivePredominance: 0.73,
          laterDiagnosis: 4.3,
          internalizedSymptoms: 0.68,
          anxietyComorbidity: 0.52,
          missedDiagnosisRate: 0.4
        },
        males: {
          hyperactivePredominance: 0.61,
          externalizedSymptoms: 0.72,
          conductDisorderComorbidity: 0.34,
          earlierIdentification: true
        }
      }
    },

    // Executive function impact (based on Barkley's model)
    executiveFunctionImpact: {
      domains: {
        workingMemory: {
          impairmentRange: [30, 60],
          meanImpairment: -0.94,
          sd: 0.52,
          effectSize: 'large'
        },
        cognitiveFlexibility: {
          impairmentRange: [25, 55],
          meanImpairment: -0.75,
          sd: 0.48,
          effectSize: 'large'
        },
        inhibition: {
          impairmentRange: [20, 50],
          meanImpairment: -1.11,
          sd: 0.58,
          effectSize: 'large'
        },
        planning: {
          impairmentRange: [25, 55],
          meanImpairment: -0.78,
          sd: 0.5,
          effectSize: 'large'
        },
        emotionalRegulation: {
          impairmentRange: [30, 60],
          meanImpairment: -0.82,
          sd: 0.54,
          effectSize: 'large'
        },
        processingSpeed: {
          meanImpairment: -0.6,
          sd: 0.44,
          effectSize: 'medium'
        },
        sustainedAttention: {
          meanImpairment: -1.04,
          sd: 0.55,
          effectSize: 'large'
        }
      }
    },

    // Functional impairment in adults
    functionalImpairment: {
      work: { odds: 2.4, description: 'Job loss/unemployment' },
      education: { odds: 2.8, description: 'Lower educational attainment' },
      relationships: { odds: 1.9, description: 'Relationship difficulties' },
      driving: { odds: 1.5, description: 'Traffic violations/accidents' },
      substance: { odds: 2.1, description: 'Substance use disorders' }
    },

    // Comprehensive comorbidity data
    comorbidity: {
      autism: { rate: 0.3, bidirectional: 0.5 },
      anxiety: {
        rate: 0.47,
        gad: 0.25,
        socialAnxiety: 0.29,
        panic: 0.08
      },
      depression: {
        rate: 0.38,
        mdd: 0.186,
        dysthymia: 0.125,
        lifetime: 0.53
      },
      bipolar: {
        rate: 0.2,
        type1: 0.08,
        type2: 0.12
      },
      learningDisorders: {
        rate: 0.45,
        dyslexia: 0.3,
        dyscalculia: 0.15,
        dysgraphia: 0.2
      },
      opposionalDefiant: {
        rate: 0.4,
        childhood: 0.5,
        adult: 0.25
      },
      conductDisorder: {
        rate: 0.25,
        childhood: 0.35,
        adult: 0.15
      },
      substanceUse: {
        rate: 0.36,
        alcohol: 0.25,
        cannabis: 0.18,
        nicotine: 0.43
      },
      sleepDisorders: {
        rate: 0.73,
        delayedSleep: 0.45,
        insomnia: 0.43,
        restlessLegs: 0.44
      },
      obesity: {
        rate: 0.4,
        bmi30Plus: 0.29,
        bmi35Plus: 0.15
      }
    }
  },

  /**
   * Autism Spectrum Assessment - Complete
   * Sources: Baron-Cohen et al. (2001), Allison et al. (2012),
   * Hull et al. (2020), Lai et al. (2024)
   */
  autism: {
    // AQ-10 Basic
    aq10: {
      description: 'Autism Spectrum Quotient - 10 item version',
      items: 10,
      scoringRange: { min: 0, max: 10 },
      cutoffs: {
        screening: {
          optimalThreshold: 6, // 2024 research recommendation
          niceThreshold: 7, // NICE guidelines
          highSpecificity: 8,
          sensitivity: [0.88, 0.77, 0.66],
          specificity: [0.91, 0.95, 0.98],
          cronbachAlpha: 0.85
        }
      },
      interpretation: {
        minimal: { min: 0, max: 3, likelihood: 'Low' },
        belowThreshold: { min: 4, max: 5, likelihood: 'Below clinical threshold' },
        threshold: { min: 6, max: 7, likelihood: 'Warrants assessment' },
        significant: { min: 8, max: 10, likelihood: 'High likelihood' }
      }
    },

    // AQ-50 Full version
    aq50: {
      description: 'Full Autism Spectrum Quotient',
      items: 50,
      scoringRange: { min: 0, max: 50 },
      cutoffs: {
        general: {
          threshold: 26,
          pronounced: 36,
          highlySignificant: 32, // 79.3% of autistic people score here
          autisticMean: 35.8
        },
        genderSpecific: {
          male: { threshold: 26, pronounced: 37 },
          female: { threshold: 27, pronounced: 39 } // 92.3% of autistic females score 32+
        }
      },
      domains: {
        socialSkills: {
          items: 10,
          autisticMean: 6.8,
          neurotypicalMean: 3.2
        },
        attentionSwitching: {
          items: 10,
          autisticMean: 7.3,
          neurotypicalMean: 4.5
        },
        attentionToDetail: {
          items: 10,
          autisticMean: 5.9,
          neurotypicalMean: 5.1
        },
        communication: {
          items: 10,
          autisticMean: 6.1,
          neurotypicalMean: 2.8
        },
        imagination: {
          items: 10,
          autisticMean: 5.7,
          neurotypicalMean: 3.2
        }
      }
    },

    // RAADS-R
    raadsR: {
      items: 80,
      cutoff: 65,
      domains: {
        socialRelatedness: { cutoff: 31, maxScore: 39 },
        circumscribedInterests: { cutoff: 15, maxScore: 42 },
        sensoryMotor: { cutoff: 16, maxScore: 49 },
        socialAnxiety: { cutoff: 13, maxScore: 29 }
      },
      psychometrics: {
        sensitivity: 0.97,
        specificity: 0.1,
        testRetest: 0.987
      }
    },

    // CAT-Q (Camouflaging)
    catQ: {
      items: 25,
      domains: {
        compensation: { description: 'Strategies to compensate', femaleHigher: true },
        masking: { description: 'Hide autistic characteristics', genderDiff: 0.43 },
        assimilation: { description: 'Fit in with others', femaleHigher: true }
      },
      genderDifferences: {
        femaleMean: 109,
        maleMean: 91,
        cohenD: 0.62,
        clinical: 'Higher scores associated with mental health issues'
      }
    },

    // Female presentation
    femalePresentation: {
      prevalenceRatio: { diagnosed: '1:3', actual: '1:1.8' },
      diagnosticAge: {
        meanDelayYears: 4.8,
        adultDiagnosis: 0.42
      },
      phenotypicDifferences: {
        socialMimicry: { prevalence: 0.73, description: 'Copying social behaviors' },
        camouflagingScore: { mean: 109, sd: 24 },
        specialInterests: {
          socially_acceptable: 0.81,
          examples: ['Animals', 'Literature', 'Psychology', 'Art']
        },
        internalizing: {
          anxiety: 0.64,
          depression: 0.46,
          eatingDisorders: 0.23
        },
        sensoryDifferences: {
          hypersensitivity: 0.78,
          seekingBehaviors: 0.34
        }
      }
    },

    // Prevalence data
    prevalence: {
      general: 1.0, // Approximately 1% of population
      maleToFemaleRatio: 3.0, // Though likely underdiagnosed in females
      diagnosticDisparity: {
        white: { referenceRate: 1.0 },
        black: { rate: 0.76, delay: '+1.5 years' },
        hispanic: { rate: 0.7, delay: '+2.5 years' },
        asian: { rate: 0.89, delay: '+0.5 years' }
      }
    },

    // Co-occurring conditions
    coOccurring: {
      adhd: { rate: 0.5, executiveDysfunction: 0.78 },
      anxiety: { rate: 0.42, socialAnxiety: 0.35, gad: 0.29 },
      depression: { rate: 0.37, lifetime: 0.66 },
      alexithymia: { rate: 0.5, severeAlexithymia: 0.33 },
      epilepsy: { rate: 0.21, febrileSeizures: 0.12 },
      gi: { rate: 0.47, ibs: 0.33, foodSensitivities: 0.52 },
      sleepDisorders: { rate: 0.8, insomnia: 0.53, delayedPhase: 0.41 },
      eatingDisorders: { rate: 0.26, arfid: 0.21, anorexia: 0.08 },
      genderDysphoria: { rate: 0.11, nonBinary: 0.24 },
      intellectualDisability: { rate: 0.3, borderline: 0.23, mild: 0.15 },
      specificLearning: { rate: 0.34, dyslexia: 0.2, dyscalculia: 0.22 }
    },

    // Sensory profile specific to autism
    sensoryProfile: {
      hyperResponsiveness: {
        prevalence: 0.69,
        domains: {
          auditory: 0.78,
          tactile: 0.65,
          visual: 0.52,
          gustatory: 0.43,
          olfactory: 0.58,
          vestibular: 0.37
        }
      },
      hypoResponsiveness: {
        prevalence: 0.51,
        domains: {
          pain: 0.42,
          temperature: 0.38,
          proprioception: 0.55,
          vestibular: 0.41
        }
      },
      sensorySeekingBehaviors: {
        prevalence: 0.35,
        examples: ['Repetitive movements', 'Deep pressure', 'Visual stimuli', 'Spinning']
      }
    }
  },

  /**
   * Sensory Processing - Complete (Dunn's Model + Extended)
   * Sources: Dunn (1997, 2014), Brown et al. (2001, 2019)
   */
  sensoryProcessing: {
    // Basic quadrants
    quadrants: {
      lowRegistration: {
        description: 'High neurological threshold, passive behavioral response',
        characteristics: [
          'Misses input',
          'Appears uninterested',
          'Slow to respond',
          'Misses social cues',
          "Doesn't notice mess"
        ],
        prevalenceInAutism: 65,
        prevalenceInADHD: 45,
        prevalenceInDepression: 52,
        prevalenceTypical: 15,
        interventions: [
          'Increase sensory intensity',
          'Use alerting activities',
          'Provide cues and reminders'
        ]
      },
      sensationSeeking: {
        description: 'High neurological threshold, active behavioral response',
        characteristics: [
          'Craves intense input',
          'Creates sensation',
          'Fidgety',
          'Risk-taking',
          'Touching everything',
          'Loves spicy foods'
        ],
        prevalenceInAutism: 35,
        prevalenceInADHD: 70,
        prevalenceInBipolar: 58,
        prevalenceTypical: 20,
        interventions: ['Provide sensory breaks', 'Fidget tools', 'Movement opportunities']
      },
      sensorySensitivity: {
        description: 'Low neurological threshold, passive behavioral response',
        characteristics: [
          'Notices everything',
          'Easily distracted',
          'Uncomfortable with change',
          'Distracted by sounds',
          'Bothered by tags',
          'Overwhelmed in crowds'
        ],
        prevalenceInAutism: 75,
        prevalenceInADHD: 55,
        prevalenceInAnxiety: 68,
        prevalenceTypical: 15,
        interventions: [
          'Reduce environmental stimuli',
          'Predictable routines',
          'Calming strategies'
        ]
      },
      sensationAvoiding: {
        description: 'Low neurological threshold, active behavioral response',
        characteristics: [
          'Withdraws from stimuli',
          'Creates rituals',
          'Limits exposure',
          'Covers ears',
          'Avoids crowds',
          'Rigid routines',
          'Limited food preferences'
        ],
        prevalenceInAutism: 80,
        prevalenceInADHD: 40,
        prevalenceInAnxiety: 72,
        prevalenceInPTSD: 65,
        prevalenceTypical: 12,
        interventions: ['Gradual exposure', 'Coping strategies', 'Environmental controls']
      }
    },

    // Scoring interpretation
    scoringInterpretation: {
      muchLessThan: { percentile: [0, 16], description: 'Much less than most people' },
      lessThan: { percentile: [16, 30], description: 'Less than most people' },
      similar: { percentile: [30, 70], description: 'Similar to most people' },
      moreThan: { percentile: [70, 84], description: 'More than most people' },
      muchMoreThan: { percentile: [84, 100], description: 'Much more than most people' }
    },

    // Detailed sensory modalities
    modalitiesDetailed: {
      auditory: {
        hyperResponsive: {
          prevalence: { autism: 0.78, adhd: 0.45, anxiety: 0.52 },
          triggers: ['Sudden sounds', 'High pitch', 'Multiple conversations'],
          accommodations: ['Noise-cancelling headphones', 'Sound masking', 'Quiet spaces']
        },
        hypoResponsive: {
          prevalence: { autism: 0.32, adhd: 0.28 },
          signs: ["Doesn't respond to name", 'Needs loud music', 'Misses verbal cues']
        }
      },
      visual: {
        hyperResponsive: {
          prevalence: { autism: 0.52, migraine: 0.71 },
          triggers: ['Fluorescent lights', 'Patterns', 'Bright colors'],
          accommodations: ['Dimmer lighting', 'Reduced clutter', 'Sunglasses']
        },
        seeking: {
          behaviors: ['Staring at lights', 'Visual stimming', 'Fascination with spinning']
        }
      },
      tactile: {
        defensive: {
          prevalence: { autism: 0.65, spd: 0.82 },
          triggers: ['Light touch', 'Certain textures', 'Clothing tags'],
          impact: 'Social interaction difficulties'
        },
        seeking: {
          behaviors: ['Deep pressure', 'Touching textures', 'Tight clothing preference']
        }
      },
      vestibular: {
        overResponsive: {
          signs: ['Motion sickness', 'Fear of heights', 'Avoids playground equipment'],
          prevalence: { anxiety: 0.42, autism: 0.37 }
        },
        underResponsive: {
          signs: ['Seeks spinning', 'Never dizzy', 'Risk-taking behaviors'],
          prevalence: { adhd: 0.51, autism: 0.28 }
        }
      },
      proprioceptive: {
        difficulties: {
          signs: ['Clumsy', 'Heavy-handed', 'Poor body awareness'],
          prevalence: { autism: 0.55, adhd: 0.48, dyspraxia: 0.89 }
        },
        seeking: {
          behaviors: ['Crashing', 'Bear hugs', 'Joint compression activities']
        }
      },
      interoceptive: {
        difficulties: {
          signs: ['Poor hunger/thirst awareness', 'Toileting issues', 'Temperature regulation'],
          prevalence: { autism: 0.71, alexithymia: 0.83, eatingDisorders: 0.62 }
        }
      }
    },

    // SPD subtypes
    spdSubtypes: {
      modulation: {
        overResponsivity: { prevalence: 0.16, comorbidAnxiety: 0.73 },
        underResponsivity: { prevalence: 0.12, comorbidDepression: 0.58 },
        sensoryCreaving: { prevalence: 0.11, comorbidADHD: 0.65 }
      },
      discrimination: {
        prevalence: 0.08,
        affects: ['Academic performance', 'Motor skills', 'Social interaction']
      },
      motorBased: {
        postural: { prevalence: 0.05, comorbidDCD: 0.72 },
        dyspraxia: { prevalence: 0.06, comorbidADHD: 0.54 }
      }
    }
  },

  /**
   * Executive Function - Complete
   * Sources: Diamond (2013), Zelazo et al. (2003),
   * Friedman & Miyake (2017), Barkley (2012), BRIEF-2 norms
   */
  executiveFunction: {
    // Core domains with research-based data
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
        autismImpact: { meanReduction: 15, sd: 20 },
        subcomponents: {
          verbal: { taskExample: 'Digit span backward', meanSpan: 5.2, sd: 1.3 },
          spatial: { taskExample: 'Corsi blocks', meanSpan: 4.8, sd: 1.1 },
          central: { taskExample: 'N-back', accuracy: 0.78, sd: 0.15 }
        }
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
        autismImpact: { meanReduction: 45, sd: 15 },
        subcomponents: {
          taskSwitching: { switchCost: 250, sd: 80 },
          mentalFlexibility: { perseverativeErrors: 12.3, sd: 5.2 },
          conceptualShifting: { wcstCategories: 5.1, sd: 1.4 }
        }
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
        autismImpact: { meanReduction: 25, sd: 15 },
        types: {
          response: { taskExample: 'Go/No-Go', falseAlarms: 14.2, sd: 6.3 },
          interference: { taskExample: 'Stroop', effect: 98, sd: 35 },
          cognitive: { taskExample: 'Flanker', effect: 71, sd: 28 }
        }
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
        autismImpact: { meanReduction: 30, sd: 25 }
      }
    },

    // Hot vs Cold EF distinction
    hotVsCold: {
      cold: {
        definition: 'Emotionally neutral, abstract',
        domains: ['Planning', 'Working memory', 'Cognitive flexibility'],
        neuralBasis: ['Dorsolateral PFC', 'Parietal cortex'],
        assessments: ['Tower of London', 'Wisconsin Card Sort', 'N-back']
      },
      hot: {
        definition: 'Emotionally/motivationally significant',
        domains: ['Delay discounting', 'Risk taking', 'Reversal learning'],
        neuralBasis: ['Orbitofrontal cortex', 'Ventromedial PFC', 'Amygdala'],
        assessments: ['Iowa Gambling Task', 'Delay discounting', 'Balloon Task']
      }
    },

    // BRIEF-2 Normative Data
    brief2Norms: {
      indices: {
        behaviorRegulation: {
          subscales: ['Inhibit', 'Self-Monitor'],
          tScoreCutoff: 65,
          clinicalRange: [65, 80],
          mean: 50,
          sd: 10
        },
        emotionRegulation: {
          subscales: ['Shift', 'Emotional Control'],
          tScoreCutoff: 65,
          anxietyCorrelation: 0.58,
          depressionCorrelation: 0.52
        },
        cognitionRegulation: {
          subscales: [
            'Initiate',
            'Working Memory',
            'Plan/Organize',
            'Task Monitor',
            'Organization'
          ],
          tScoreCutoff: 65,
          adhdCorrelation: 0.73
        }
      },
      globalExecutiveComposite: {
        mean: 50,
        sd: 10,
        clinicalCutoff: 65,
        reliability: 0.96
      }
    },

    // Developmental trajectory
    developmentalTrajectory: {
      peak: { age: 25, description: 'Executive functions peak in mid-20s' },
      decline: {
        startAge: 60,
        rate: 2,
        domains: {
          workingMemory: { declineRate: 0.02, mostAffected: true },
          processingSpeed: { declineRate: 0.025, earlyDecline: true },
          inhibition: { declineRate: 0.015, preserved: 'relatively' },
          switching: { declineRate: 0.018, variableDecline: true }
        }
      },
      emergence: {
        basic: { age: 1, skills: ['Object permanence', 'Simple inhibition'] },
        preschool: { age: 3.5, skills: ['Rule use', 'Simple planning'] },
        schoolAge: { age: 7, skills: ['Strategy use', 'Complex planning'] },
        adolescence: { age: 15, skills: ['Abstract reasoning', 'Metacognition'] },
        peak: { age: 25, skills: ['Full maturation'] }
      }
    }
  },

  /**
   * Comorbidity and Co-occurrence Patterns
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
   * Emotional Regulation and Related Assessments
   * Sources: Gross (2015), Aldao et al. (2016), DERS-2 norms
   */
  emotionalRegulation: {
    // DERS-2 (Difficulties in Emotion Regulation Scale)
    ders2: {
      dimensions: {
        nonacceptance: {
          description: 'Non-acceptance of emotional responses',
          items: 6,
          clinicalCutoff: 18,
          anxietyCorrelation: 0.52
        },
        goals: {
          description: 'Difficulty engaging in goal-directed behavior',
          items: 5,
          clinicalCutoff: 20,
          adhdCorrelation: 0.61
        },
        impulse: {
          description: 'Impulse control difficulties',
          items: 6,
          clinicalCutoff: 18,
          bpdCorrelation: 0.68
        },
        awareness: {
          description: 'Lack of emotional awareness',
          items: 6,
          clinicalCutoff: 18,
          alexithymiaCorrelation: 0.73
        },
        strategies: {
          description: 'Limited access to regulation strategies',
          items: 8,
          clinicalCutoff: 32,
          depressionCorrelation: 0.64
        },
        clarity: {
          description: 'Lack of emotional clarity',
          items: 5,
          clinicalCutoff: 15,
          alexithymiaCorrelation: 0.69
        }
      },
      totalScore: {
        mean: 78,
        sd: 20,
        clinicalCutoff: 98,
        reliability: 0.93
      }
    },

    // Alexithymia (TAS-20)
    alexithymia: {
      prevalence: {
        general: 0.1,
        autism: 0.5,
        depression: 0.32,
        eatingDisorders: 0.48,
        substanceUse: 0.45
      },
      tas20: {
        factors: {
          identifyingFeelings: { items: 7, cutoff: 19, autismMean: 22.3 },
          describingFeelings: { items: 5, cutoff: 14, autismMean: 16.8 },
          externalThinking: { items: 8, cutoff: 21, autismMean: 23.1 }
        },
        totalCutoffs: {
          noAlexithymia: [20, 51],
          borderline: [52, 60],
          alexithymia: [61, 100]
        }
      },
      clinicalImpact: {
        therapyOutcome: -0.42,
        suicideRisk: 1.89,
        somaticComplaints: 0.56
      }
    },

    // Interoception
    interoception: {
      definition: 'Awareness of internal bodily signals',
      dimensions: {
        accuracy: {
          heartbeatDetection: { mean: 0.68, sd: 0.21 },
          breathingAwareness: { mean: 0.72, sd: 0.18 }
        },
        sensibility: {
          questionnaireMeasure: 'MAIA-2',
          subscales: 8,
          autismDifference: -0.62
        }
      },
      clinicalRelevance: {
        anxietyCorrelation: 0.48,
        eatingDisorderCorrelation: -0.54,
        autismCorrelation: -0.51
      }
    },

    // Emotion regulation strategies
    strategies: {
      adaptive: {
        reappraisal: {
          effectiveness: 0.68,
          prevalence: 0.42,
          trainable: true,
          anxietyReduction: -0.51
        },
        problemSolving: {
          effectiveness: 0.72,
          prevalence: 0.38,
          depressionReduction: -0.48
        },
        acceptance: {
          effectiveness: 0.61,
          prevalence: 0.31,
          stressReduction: -0.44
        },
        mindfulness: {
          effectiveness: 0.58,
          prevalence: 0.22,
          overallWellbeing: 0.52
        }
      },
      maladaptive: {
        rumination: {
          prevalence: 0.48,
          depressionRisk: 2.31,
          anxietyRisk: 2.14
        },
        avoidance: {
          prevalence: 0.52,
          ptsdRisk: 2.68,
          anxietyMaintenance: 0.61
        },
        suppression: {
          prevalence: 0.44,
          physiologicalCost: 0.38,
          socialCost: -0.42
        }
      }
    }
  },

  /**
   * Anxiety Assessment Instruments
   * Sources: Spitzer et al. (2006), Connor et al. (2000),
   * Meta-analysis by Bandelow et al. (2017, N=48,000)
   */
  anxietyAssessment: {
    // GAD-7
    gad7: {
      items: 7,
      scoring: [0, 1, 2, 3],
      cutoffs: {
        minimal: [0, 4],
        mild: [5, 9],
        moderate: [10, 14],
        severe: [15, 21]
      },
      psychometrics: {
        sensitivity: 0.89,
        specificity: 0.82,
        cronbachAlpha: 0.92,
        testRetest: 0.83
      },
      diagnosticThreshold: {
        gad: 10,
        panicDisorder: 7,
        socialAnxiety: 7,
        ptsd: 9
      }
    },

    // SPIN (Social Phobia Inventory)
    spin: {
      items: 17,
      cutoffs: {
        none: [0, 19],
        mild: [20, 30],
        moderate: [31, 40],
        severe: [41, 50],
        verySevere: [51, 68]
      },
      miniSpin: {
        items: 3,
        cutoff: 6,
        sensitivity: 0.889,
        specificity: 0.9
      }
    },

    // Anxiety subtypes prevalence
    subtypes: {
      specificPhobia: { lifetime: 0.129, female: 0.159, male: 0.098 },
      socialAnxiety: { lifetime: 0.131, onset: 13, female: 0.152, male: 0.109 },
      panicDisorder: { lifetime: 0.048, onset: 24, female: 0.061, male: 0.035 },
      agoraphobia: { lifetime: 0.026, female: 0.038, male: 0.014 },
      gad: { lifetime: 0.059, onset: 31, female: 0.075, male: 0.043 },
      separationAnxiety: { adult: 0.014, childhood: 0.041 }
    }
  },

  /**
   * Depression Assessment
   * Sources: Kroenke et al. (2001), Rush et al. (2003),
   * Meta-analysis by Levis et al. (2019, N=100,000)
   */
  depressionAssessment: {
    // PHQ-9
    phq9: {
      items: 9,
      scoring: [0, 1, 2, 3],
      cutoffs: {
        minimal: [0, 4],
        mild: [5, 9],
        moderate: [10, 14],
        moderatelySevere: [15, 19],
        severe: [20, 27]
      },
      diagnosticAccuracy: {
        cutoff10: { sensitivity: 0.88, specificity: 0.88 },
        cutoff12: { sensitivity: 0.83, specificity: 0.9 },
        cutoff15: { sensitivity: 0.75, specificity: 0.93 }
      },
      suicideItem: {
        item9: 'Thoughts of death or self-harm',
        clinicalAction: 'Immediate assessment required if >0'
      }
    },

    // Anhedonia
    anhedonia: {
      snaith_hamilton: {
        items: 14,
        cutoff: 7,
        domains: {
          social: { items: 7, depressionCorrelation: 0.58 },
          physical: { items: 7, depressionCorrelation: 0.52 }
        }
      },
      prevalenceInDepression: 0.78,
      treatmentResistance: 1.83
    },

    // Depression subtypes
    subtypes: {
      melancholic: {
        features: ['Anhedonia', 'Worse in morning', 'Early waking', 'Psychomotor changes'],
        prevalence: 0.25,
        biologicalMarkers: true
      },
      atypical: {
        features: ['Mood reactivity', 'Hypersomnia', 'Increased appetite', 'Rejection sensitivity'],
        prevalence: 0.36,
        femalePrevalence: 0.42
      },
      seasonal: {
        prevalence: 0.05,
        latitudeEffect: true,
        femaleRatio: 4.1
      }
    }
  },

  /**
   * Trauma and Stress Assessment
   * Sources: Felitti et al. (1998), Weathers et al. (2013),
   * Meta-analysis by Hughes et al. (2017, N=250,000)
   */
  traumaAssessment: {
    // ACEs (Adverse Childhood Experiences)
    aces: {
      categories: {
        abuse: ['Physical', 'Emotional', 'Sexual'],
        neglect: ['Physical', 'Emotional'],
        householdDysfunction: [
          'Substance abuse',
          'Mental illness',
          'Domestic violence',
          'Incarceration',
          'Divorce/separation'
        ]
      },
      prevalence: {
        ace0: 0.364,
        ace1: 0.225,
        ace2: 0.124,
        ace3: 0.097,
        ace4Plus: 0.19
      },
      healthOutcomes: {
        ace4Plus: {
          depression: { or: 4.6 },
          suicide: { or: 12.2 },
          substanceUse: { or: 7.4 },
          heartDisease: { or: 2.2 },
          cancer: { or: 1.9 },
          copd: { or: 3.9 }
        }
      }
    },

    // PCL-5 (PTSD Checklist)
    pcl5: {
      items: 20,
      clusters: {
        reexperiencing: { items: 5, threshold: 1 },
        avoidance: { items: 2, threshold: 1 },
        cognitionMood: { items: 7, threshold: 2 },
        arousal: { items: 6, threshold: 2 }
      },
      cutoffs: {
        provisional: 31,
        probable: 33,
        stringent: 37
      },
      psychometrics: {
        sensitivity: [0.95, 0.94, 0.88],
        specificity: [0.79, 0.82, 0.89],
        cronbachAlpha: 0.94
      }
    }
  },

  /**
   * Scoring Algorithms and Statistical Methods
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
    },

    /**
     * Standard score conversions
     */
    standardScores: {
      zToT: z => 50 + z * 10,

      tToPercentile: function (t) {
        const z = (t - 50) / 10;
        return CompletePsychologicalResearchDatabase.scoringAlgorithms.rawToPercentile(
          50 + z * 15,
          50,
          15
        );
      },

      percentileToZ: p => {
        // Inverse normal approximation
        const a0 = 2.50662823884;
        const a1 = -18.61500062529;
        const a2 = 41.39119773534;
        const a3 = -25.44106049637;

        const b0 = -8.4735109309;
        const b1 = 23.08336743743;
        const b2 = -21.06224101826;
        const b3 = 3.13082909833;

        const c0 = 0.3374754822726147;
        const c1 = 0.9761690190917186;
        const c2 = 0.1607979714918209;
        const c3 = 0.0276438810333863;
        const c4 = 0.0038405729373609;
        const c5 = 0.0003951896511919;
        const c6 = 0.0000321767881768;
        const c7 = 0.0000002888167364;
        const c8 = 0.0000003960315187;

        const y = p / 100 - 0.5;

        if (Math.abs(y) < 0.42) {
          const r = y * y;
          return (
            (y * (((a3 * r + a2) * r + a1) * r + a0)) /
            ((((b3 * r + b2) * r + b1) * r + b0) * r + 1)
          );
        } else {
          let r = p / 100;
          if (y > 0) r = 1 - p / 100;
          r = Math.log(-Math.log(r));
          let z =
            c0 +
            r * (c1 + r * (c2 + r * (c3 + r * (c4 + r * (c5 + r * (c6 + r * (c7 + r * c8)))))));
          if (y < 0) z = -z;
          return z;
        }
      }
    },

    /**
     * Effect size calculations
     */
    effectSizes: {
      cohensD: (mean1, mean2, pooledSD) => (mean1 - mean2) / pooledSD,

      hedgesG: (mean1, mean2, pooledSD, n1, n2) => {
        const d = (mean1 - mean2) / pooledSD;
        const df = n1 + n2 - 2;
        const correction = 1 - 3 / (4 * df - 1);
        return d * correction;
      },

      interpretation: d => {
        const abs = Math.abs(d);
        if (abs < 0.2) return 'negligible';
        if (abs < 0.5) return 'small';
        if (abs < 0.8) return 'medium';
        return 'large';
      }
    },

    /**
     * Reliability calculations
     */
    reliability: {
      cronbachAlpha: (itemCovariances, itemVariances) => {
        const k = itemVariances.length;
        const sumVariances = itemVariances.reduce((a, b) => a + b, 0);
        const sumCovariances = itemCovariances.reduce((a, b) => a + b, 0);
        const totalVariance = sumVariances + sumCovariances;

        return (k / (k - 1)) * (1 - sumVariances / totalVariance);
      },

      sem: (sd, reliability) => sd * Math.sqrt(1 - reliability),

      confidenceInterval: (score, sem, confidence = 0.95) => {
        const zScores = { 0.9: 1.645, 0.95: 1.96, 0.99: 2.576 };
        const z = zScores[confidence] || 1.96;
        return {
          lower: score - z * sem,
          upper: score + z * sem,
          confidence: confidence * 100
        };
      }
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
      const ranges = this.executiveFunction.domains[domain]?.percentileRanges;

      if (ranges) {
        for (const [range, values] of Object.entries(ranges)) {
          if (percentile >= values[0] && percentile <= values[1]) {
            return `Performance in ${domain} falls in the ${range} range (${percentile}th percentile)`;
          }
        }
      }
      return `${domain}: ${percentile}th percentile`;
    },

    /**
     * Reliable change index
     */
    reliableChangeIndex: (pre, post, sem) => {
      const diff = post - pre;
      const sediff = sem * Math.sqrt(2);
      return diff / sediff;
    },

    /**
     * Jacobson cutoff for clinical significance
     */
    jacobsonCutoff: (meanClinical, meanNormal, sdClinical, sdNormal) => {
      return (sdNormal * meanClinical + sdClinical * meanNormal) / (sdNormal + sdClinical);
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
    },
    anxiety: {
      mild: [
        'Relaxation techniques',
        'Regular sleep schedule',
        'Limiting caffeine',
        'Exercise routine'
      ],
      moderate: [
        'Cognitive behavioral therapy',
        'Exposure therapy for specific phobias',
        'Mindfulness-based stress reduction',
        'Support groups'
      ],
      severe: [
        'Intensive therapy',
        'Medication evaluation',
        'Comprehensive treatment plan',
        'Crisis resources'
      ]
    },
    depression: {
      mild: ['Behavioral activation', 'Social connection', 'Regular exercise', 'Sleep hygiene'],
      moderate: [
        'Psychotherapy (CBT, IPT)',
        'Antidepressant consideration',
        'Lifestyle modifications',
        'Support system activation'
      ],
      severe: [
        'Immediate professional help',
        'Safety planning',
        'Intensive treatment',
        'Possible hospitalization'
      ]
    }
  },

  /**
   * Cultural and Demographic Considerations
   */
  culturalConsiderations: {
    crossCultural: {
      bigFive: {
        universality: 'Replicated in 50+ cultures',
        variations: {
          collectivist: { agreeableness: '+0.3 SD', extraversion: '-0.2 SD' },
          individualist: { openness: '+0.2 SD', assertiveness: '+0.4 SD' }
        }
      },
      adhd: {
        prevalenceVariation: {
          range: [0.01, 0.12],
          factors: ['Diagnostic practices', 'Awareness']
        },
        presentationDifferences: {
          asian: { hyperactivity: 'Less emphasized', academic: 'More emphasized' },
          latinx: { familyInvolvement: 'Higher', stigma: 'Greater' }
        }
      },
      autism: {
        diagnosticDisparity: {
          white: { referenceRate: 1.0 },
          black: { rate: 0.76, delay: '+1.5 years' },
          hispanic: { rate: 0.7, delay: '+2.5 years' },
          asian: { rate: 0.89, delay: '+0.5 years' }
        }
      }
    },
    ses: {
      assessmentBias: {
        iq: { sesCorrelation: 0.33, varianceExplained: 0.11 },
        academicAchievement: { sesCorrelation: 0.42 },
        executiveFunction: { sesCorrelation: 0.28 }
      },
      accessToServices: {
        highSES: { assessmentRate: 0.73, interventionAccess: 0.81 },
        lowSES: { assessmentRate: 0.31, interventionAccess: 0.42 }
      }
    },
    language: {
      bilingual: {
        advantages: { executiveFunction: '+0.3 SD', cognitiveFlexibility: '+0.4 SD' },
        considerations: ['Language dominance', 'Code-switching', 'Cultural loading']
      },
      translation: {
        issues: ['Idiomatic expressions', 'Cultural concepts', 'Norm differences'],
        bestPractices: ['Back-translation', 'Cultural adaptation', 'Local norming']
      }
    }
  },

  /**
   * Treatment Response and Prognosis
   */
  treatmentResponse: {
    psychotherapy: {
      cbt: {
        depression: { effectSize: 0.73, responseRate: 0.58, remissionRate: 0.43 },
        anxiety: { effectSize: 0.81, responseRate: 0.62, remissionRate: 0.51 },
        adhd: { effectSize: 0.42, behavioral: 0.51, combined: 0.68 }
      },
      dbt: {
        bpd: { effectSize: 0.6, selfHarm: -0.71, dropout: 0.25 },
        emotionDysregulation: { effectSize: 0.55 }
      },
      emdr: {
        ptsd: { effectSize: 0.89, sessions: '6-12', maintenance: 0.92 }
      }
    },
    medication: {
      ssri: {
        depression: { responseRate: 0.54, remissionRate: 0.37, nnt: 7 },
        anxiety: { responseRate: 0.6, remissionRate: 0.42, nnt: 5 }
      },
      stimulants: {
        adhd: { effectSize: 0.8, responseRate: 0.7, nnt: 2 },
        sideEffects: { appetite: 0.3, sleep: 0.25, anxiety: 0.15 }
      }
    },
    prognosis: {
      positive: [
        'Early intervention',
        'Social support',
        'Treatment adherence',
        'Absence of comorbidity',
        'Higher baseline functioning'
      ],
      negative: [
        'Chronic course',
        'Multiple comorbidities',
        'Substance use',
        'Trauma history',
        'Low SES'
      ]
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CompletePsychologicalResearchDatabase;
}

// Also make available as global for browser environments
if (typeof window !== 'undefined') {
  window.CompletePsychologicalResearchDatabase = CompletePsychologicalResearchDatabase;
  window.PsychologicalResearchDatabase = CompletePsychologicalResearchDatabase; // Alias for compatibility
}
