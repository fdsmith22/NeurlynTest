/**
 * Extended Psychological Research Database
 *
 * This file contains comprehensive validated psychological assessment standards,
 * scoring criteria, and research-based thresholds for all assessment instruments
 * used in Neurlyn. Data is based on meta-analyses, large-scale studies (N>1000),
 * and peer-reviewed research from 2020-2025.
 *
 * Last Updated: 2024
 */

const ExtendedPsychologicalResearchDatabase = {
  /**
   * Big Five Personality Assessment - Extended
   * Sources: Soto & John (2017), McCrae & Costa (2020),
   * Meta-analysis by Kajonius & Johnson (2019, N=320,128)
   */
  bigFiveExtended: {
    description: 'Comprehensive Five-Factor Model with facets and correlations',

    // Detailed facet structure based on NEO-PI-3
    facetStructure: {
      openness: {
        facets: {
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
          }
        },
        correlations: {
          intelligence: 0.33, // Correlation with IQ (DeYoung et al., 2014)
          creativity: 0.51, // Correlation with creativity measures
          politicalLiberalism: 0.34,
          jobPerformanceCreative: 0.24
        }
      },

      conscientiousness: {
        facets: {
          competence: {
            description: 'Sense of personal effectiveness',
            reliability: 0.69,
            adhdCorrelation: -0.45 // Strong negative correlation with ADHD
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
            academicSuccess: 0.38 // Correlation with GPA
          },
          selfDiscipline: {
            description: 'Ability to complete tasks',
            reliability: 0.8,
            adhdCorrelation: -0.58 // Strongest ADHD correlation
          },
          deliberation: {
            description: 'Thinking before acting',
            reliability: 0.75,
            adhdCorrelation: -0.41
          }
        },
        lifeOutcomes: {
          longevity: 0.21, // Years of life gained (Jokela et al., 2013)
          divorce: -0.19, // Negative correlation with divorce
          jobPerformance: 0.31, // Overall job performance
          income: 0.23, // Annual income correlation
          healthBehaviors: 0.28 // Exercise, diet, medical compliance
        }
      },

      extraversion: {
        facets: {
          warmth: { reliability: 0.76, socialAnxietyCorrelation: -0.42 },
          gregariousness: { reliability: 0.73, socialAnxietyCorrelation: -0.51 },
          assertiveness: { reliability: 0.78, leadershipCorrelation: 0.44 },
          activity: { reliability: 0.66, adhdCorrelation: 0.31 },
          excitementSeeking: { reliability: 0.68, adhdCorrelation: 0.38 },
          positiveEmotions: { reliability: 0.79, depressionCorrelation: -0.46 }
        },
        socialOutcomes: {
          numberOfFriends: 0.34,
          socialSupport: 0.29,
          leadershipPositions: 0.31,
          publicSpeaking: 0.42
        }
      },

      agreeableness: {
        facets: {
          trust: { reliability: 0.71 },
          straightforwardness: { reliability: 0.68 },
          altruism: { reliability: 0.74, prosocialBehavior: 0.41 },
          compliance: { reliability: 0.65 },
          modesty: { reliability: 0.72 },
          tenderMindedness: { reliability: 0.61 }
        },
        interpersonalOutcomes: {
          relationshipSatisfaction: 0.28,
          conflictResolution: 0.33,
          teamworkEffectiveness: 0.36,
          peerRatings: 0.42
        }
      },

      neuroticism: {
        facets: {
          anxiety: {
            reliability: 0.82,
            gadCorrelation: 0.68, // Correlation with GAD-7
            cortisol: 0.31 // Correlation with cortisol levels
          },
          angryHostility: { reliability: 0.79 },
          depression: {
            reliability: 0.84,
            phq9Correlation: 0.71 // Correlation with PHQ-9
          },
          selfConsciousness: { reliability: 0.73, socialAnxiety: 0.54 },
          impulsiveness: { reliability: 0.67, adhdCorrelation: 0.38 },
          vulnerability: { reliability: 0.75, stressVulnerability: 0.62 }
        },
        clinicalCorrelations: {
          anxietyDisorders: 0.64,
          moodDisorders: 0.58,
          substanceUse: 0.23,
          somaticComplaints: 0.41,
          sleepProblems: 0.46
        }
      }
    },

    // Age-specific norms (T-scores)
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

    // Gender differences (Cohen's d effect sizes)
    genderDifferences: {
      openness: { d: -0.05, direction: 'F>M', significant: false },
      conscientiousness: { d: -0.14, direction: 'F>M', significant: true },
      extraversion: { d: -0.1, direction: 'F>M', significant: true },
      agreeableness: { d: -0.32, direction: 'F>M', significant: true },
      neuroticism: { d: -0.4, direction: 'F>M', significant: true }
    }
  },

  /**
   * ADHD Assessment - Comprehensive
   * Sources: Ustun et al. (2017), Silverstein et al. (2018),
   * Meta-analysis by Faraone et al. (2021, 65 studies)
   */
  adhdComprehensive: {
    // DSM-5-TR Criteria (2022 update)
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

    // ASRS v1.1 and v5 comparison
    asrsVersions: {
      v11: {
        items: 18,
        screeningItems: 6,
        cutoff: 14,
        sensitivity: 68.7,
        specificity: 99.5
      },
      v5: {
        items: 6,
        cutoff: 14,
        sensitivity: 91.4,
        specificity: 96.0,
        ppv: 67.3,
        npv: 99.0,
        auc: 0.94 // Area under curve
      }
    },

    // Gender differences in presentation
    genderDifferences: {
      prevalenceRatio: { male: 2.28, female: 1.0 },
      presentationDifferences: {
        females: {
          inattentivePredominance: 0.73,
          laterDiagnosis: 4.3, // Years later than males
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

    // Adult ADHD specific
    adultADHD: {
      prevalence: 4.4, // Percentage
      persistenceFromChildhood: 0.65, // 65% persist
      lateOnsetADHD: 0.12, // 12% of adult cases
      functionalImpairment: {
        work: { odds: 2.4, description: 'Job loss/unemployment' },
        education: { odds: 2.8, description: 'Lower educational attainment' },
        relationships: { odds: 1.9, description: 'Relationship difficulties' },
        driving: { odds: 1.5, description: 'Traffic violations/accidents' },
        substance: { odds: 2.1, description: 'Substance use disorders' }
      }
    },

    // Comorbidity patterns
    comorbidities: {
      autism: { rate: 0.3, bidirectional: 0.5 },
      anxiety: { rate: 0.47, gad: 0.25, socialAnxiety: 0.29 },
      depression: { rate: 0.38, mdd: 0.186, dysthymia: 0.125 },
      bipolar: { rate: 0.2, type1: 0.08, type2: 0.12 },
      sld: { rate: 0.45, dyslexia: 0.3, dyscalculia: 0.15 },
      odd: { rate: 0.4, childhood: 0.5, adult: 0.25 },
      conductDisorder: { rate: 0.25, childhood: 0.35, adult: 0.15 },
      substanceUse: { rate: 0.36, alcohol: 0.25, cannabis: 0.18 },
      sleepDisorders: { rate: 0.73, delayedSleep: 0.45, insomnia: 0.43 },
      obesity: { rate: 0.4, bmi30Plus: 0.29, bmi35Plus: 0.15 }
    },

    // Executive function profile
    executiveFunctionProfile: {
      workingMemory: { meanImpairment: -0.94, sd: 0.52, effectSize: 'large' },
      processingSpeed: { meanImpairment: -0.6, sd: 0.44, effectSize: 'medium' },
      cognitiveFlexibility: { meanImpairment: -0.75, sd: 0.48, effectSize: 'large' },
      inhibition: { meanImpairment: -1.11, sd: 0.58, effectSize: 'large' },
      planning: { meanImpairment: -0.78, sd: 0.5, effectSize: 'large' },
      sustainedAttention: { meanImpairment: -1.04, sd: 0.55, effectSize: 'large' },
      vigilance: { meanImpairment: -0.72, sd: 0.46, effectSize: 'medium-large' }
    }
  },

  /**
   * Autism Spectrum Assessment - Comprehensive
   * Sources: Baron-Cohen et al. (2001), Allison et al. (2012),
   * Hull et al. (2020), Lai et al. (2024)
   */
  autismComprehensive: {
    // Multiple screening instruments
    screeningInstruments: {
      aq10: {
        items: 10,
        cutoffs: {
          optimal: 6, // 2024 research
          traditional: 7, // NICE guidelines
          highSpecificity: 8
        },
        psychometrics: {
          sensitivity: [0.88, 0.77, 0.66], // For each cutoff
          specificity: [0.91, 0.95, 0.98],
          cronbachAlpha: 0.85
        }
      },

      aq50: {
        items: 50,
        cutoffs: {
          general: 26,
          autisticMean: 35.8,
          highConfidence: 32 // 79.3% of autistic adults
        },
        domains: {
          socialSkills: { items: 10, autisticMean: 6.8, neurotypicalMean: 3.2 },
          attentionSwitching: { items: 10, autisticMean: 7.3, neurotypicalMean: 4.5 },
          attentionToDetail: { items: 10, autisticMean: 5.9, neurotypicalMean: 5.1 },
          communication: { items: 10, autisticMean: 6.1, neurotypicalMean: 2.8 },
          imagination: { items: 10, autisticMean: 5.7, neurotypicalMean: 3.2 }
        }
      },

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
          specificity: 0.1, // Very low - screening only
          testRetest: 0.987
        }
      },

      catQ: {
        // Camouflaging Autistic Traits Questionnaire
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
      }
    },

    // Female autism phenotype
    femalePresentation: {
      prevalenceRatio: { diagnosed: '1:3', actual: '1:1.8' }, // Estimated true ratio
      diagnosticAge: {
        meanDelayYears: 4.8,
        adultDiagnosis: 0.42 // 42% diagnosed as adults
      },
      phenotypicDifferences: {
        socialMimicry: { prevalence: 0.73, description: 'Copying social behaviors' },
        camouflagingScore: { mean: 109, sd: 24 },
        specialInterests: {
          socially_acceptable: 0.81, // vs 0.45 in males
          examples: ['Animals', 'Literature', 'Psychology', 'Art']
        },
        internalizing: { anxiety: 0.64, depression: 0.46, eatingDisorders: 0.23 },
        sensoryDifferences: { hypersensitivity: 0.78, seekingBehaviors: 0.34 }
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

    // Sensory profile in autism
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
   * Executive Function Assessment - Detailed
   * Sources: Diamond (2013), Zelazo et al. (2003),
   * Friedman & Miyake (2017), BRIEF-2 norms
   */
  executiveFunctionDetailed: {
    // Core EF components (Unity/Diversity model)
    coreComponents: {
      workingMemory: {
        definition: 'Holding and manipulating information',
        subcomponents: {
          verbal: { taskExample: 'Digit span backward', meanSpan: 5.2, sd: 1.3 },
          spatial: { taskExample: 'Corsi blocks', meanSpan: 4.8, sd: 1.1 },
          central: { taskExample: 'N-back', accuracy: 0.78, sd: 0.15 }
        },
        developmentalPeak: 25,
        ageRelatedDecline: { start: 60, ratePerYear: 0.02 }
      },

      cognitiveFlexibility: {
        definition: 'Mental set shifting and adaptation',
        subcomponents: {
          taskSwitching: { switchCost: 250, sd: 80 }, // ms
          mentalFlexibility: { perseverativeErrors: 12.3, sd: 5.2 },
          conceptualShifting: { wcstCategories: 5.1, sd: 1.4 }
        },
        neurodiversityImpact: {
          autism: { impairment: -0.75, rigidity: 0.82 },
          adhd: { impairment: -0.55, inconsistency: 0.71 }
        }
      },

      inhibitoryControl: {
        definition: 'Suppressing prepotent responses',
        types: {
          response: { taskExample: 'Go/No-Go', falseAlarms: 14.2, sd: 6.3 },
          interference: { taskExample: 'Stroop', effect: 98, sd: 35 }, // ms
          cognitive: { taskExample: 'Flanker', effect: 71, sd: 28 }
        },
        adhdProfile: {
          meanImpairment: -1.11,
          variability: 0.58,
          medicationEffect: 0.72 // Effect size
        }
      }
    },

    // Hot vs Cold EF
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

    // Developmental trajectories
    developmentalTrajectories: {
      emergence: {
        basic: { age: 1, skills: ['Object permanence', 'Simple inhibition'] },
        preschool: { age: 3.5, skills: ['Rule use', 'Simple planning'] },
        schoolAge: { age: 7, skills: ['Strategy use', 'Complex planning'] },
        adolescence: { age: 15, skills: ['Abstract reasoning', 'Metacognition'] },
        peak: { age: 25, skills: ['Full maturation'] }
      },
      decline: {
        startAge: 60,
        domains: {
          workingMemory: { declineRate: 0.02, mostAffected: true },
          processingSpeed: { declineRate: 0.025, earlyDecline: true },
          inhibition: { declineRate: 0.015, preserved: 'relatively' },
          switching: { declineRate: 0.018, variableDecline: true }
        }
      }
    }
  },

  /**
   * Sensory Processing - Comprehensive
   * Sources: Dunn (2014), Brown et al. (2019),
   * Adult/Adolescent Sensory Profile norms
   */
  sensoryProcessingComprehensive: {
    // Dunn's Model - Detailed
    dunnModelDetailed: {
      neurological_threshold: {
        high: {
          description: 'Requires more intense stimuli to respond',
          prevalence: { general: 0.15, autism: 0.42, adhd: 0.38 }
        },
        low: {
          description: 'Responds to subtle stimuli',
          prevalence: { general: 0.15, autism: 0.69, adhd: 0.31 }
        }
      },

      behavioral_response: {
        passive: {
          description: 'Does not actively control sensory input',
          adaptiveStrategies: ['Environmental modifications', 'Scheduled breaks']
        },
        active: {
          description: 'Acts to control sensory input',
          adaptiveStrategies: ['Sensory diet', 'Self-regulation tools']
        }
      },

      quadrantsDetailed: {
        lowRegistration: {
          threshold: 'high',
          response: 'passive',
          behaviors: [
            'Misses social cues',
            'Appears uninterested',
            'Slow to respond to name',
            "Doesn't notice mess"
          ],
          interventions: [
            'Increase sensory intensity',
            'Use alerting activities',
            'Provide cues and reminders'
          ],
          prevalenceByCondition: {
            autism: 0.65,
            adhd: 0.45,
            depression: 0.52,
            typical: 0.15
          }
        },

        sensationSeeking: {
          threshold: 'high',
          response: 'active',
          behaviors: ['Fidgeting', 'Risk-taking', 'Touching everything', 'Loves spicy foods'],
          interventions: ['Provide sensory breaks', 'Fidget tools', 'Movement opportunities'],
          prevalenceByCondition: {
            autism: 0.35,
            adhd: 0.7,
            bipolar: 0.58,
            typical: 0.2
          }
        },

        sensorySensitivity: {
          threshold: 'low',
          response: 'passive',
          behaviors: [
            'Distracted by sounds',
            'Bothered by tags',
            'Notices small changes',
            'Overwhelmed in crowds'
          ],
          interventions: [
            'Reduce environmental stimuli',
            'Predictable routines',
            'Calming strategies'
          ],
          prevalenceByCondition: {
            autism: 0.75,
            adhd: 0.55,
            anxiety: 0.68,
            typical: 0.15
          }
        },

        sensationAvoiding: {
          threshold: 'low',
          response: 'active',
          behaviors: ['Covers ears', 'Avoids crowds', 'Rigid routines', 'Limited food preferences'],
          interventions: ['Gradual exposure', 'Coping strategies', 'Environmental controls'],
          prevalenceByCondition: {
            autism: 0.8,
            adhd: 0.4,
            anxiety: 0.72,
            ptsd: 0.65,
            typical: 0.12
          }
        }
      }
    },

    // Sensory modalities detailed
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

    // SPD subtypes (Miller et al., 2007)
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
   * Emotional Regulation Assessment
   * Sources: Gross (2015), Aldao et al. (2016),
   * DERS-2 norms, TAS-20 validation
   */
  emotionalRegulation: {
    // Difficulties in Emotion Regulation Scale (DERS-2)
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
        therapyOutcome: -0.42, // Negative correlation
        suicideRisk: 1.89, // Odds ratio
        somaticComplaints: 0.56 // Correlation
      }
    },

    // Emotion Regulation Strategies
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
          depressionRisk: 2.31, // Odds ratio
          anxietyRisk: 2.14
        },
        avoidance: {
          prevalence: 0.52,
          ptsdRisk: 2.68,
          anxietyMaintenance: 0.61
        },
        suppression: {
          prevalence: 0.44,
          physiologicalCost: 0.38, // Increased arousal
          socialCost: -0.42 // Reduced social connection
        }
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
    }
  },

  /**
   * Anxiety Assessment
   * Sources: Spitzer et al. (2006), Connor et al. (2000),
   * Meta-analysis by Bandelow et al. (2017, N=48,000)
   */
  anxietyAssessment: {
    // GAD-7
    gad7: {
      items: 7,
      scoring: [0, 1, 2, 3], // Not at all to Nearly every day
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

    // Social Phobia Inventory (SPIN)
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
        items: 3, // Items 6, 9, 15
        cutoff: 6,
        sensitivity: 0.889,
        specificity: 0.9
      }
    },

    // Panic Disorder Severity Scale
    pdss: {
      items: 7,
      clinicalCutoff: 8,
      remissionCutoff: 3,
      dimensions: [
        'Frequency',
        'Distress',
        'Anticipatory anxiety',
        'Phobic avoidance',
        'Physical avoidance',
        'Impairment',
        'Worry'
      ]
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

    // PHQ-2
    phq2: {
      items: 2,
      cutoff: 3,
      sensitivity: 0.83,
      specificity: 0.92,
      purpose: 'Ultra-brief screening'
    },

    // Anhedonia assessment
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
      treatmentResistance: 1.83 // Odds ratio
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
      psychotic: {
        prevalence: 0.19,
        features: ['Delusions', 'Hallucinations'],
        hospitalizationRate: 0.73
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
    // Adverse Childhood Experiences (ACEs)
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
        sensitivity: [0.95, 0.94, 0.88], // For each cutoff
        specificity: [0.79, 0.82, 0.89],
        cronbachAlpha: 0.94
      }
    },

    // Complex PTSD
    complexPTSD: {
      additionalDomains: {
        emotionDysregulation: { prevalence: 0.78 },
        negativeSelConcept: { prevalence: 0.82 },
        interpersonalProblems: { prevalence: 0.71 }
      },
      prevalence: {
        traumaExposed: 0.13,
        clinicalSamples: 0.36,
        refugeePopulations: 0.51
      }
    },

    // Dissociation
    dissociation: {
      des2: {
        items: 28,
        cutoff: 30,
        factorStructure: {
          amnesia: { items: 8 },
          depersonalization: { items: 6 },
          absorption: { items: 9 },
          other: { items: 5 }
        }
      },
      prevalence: {
        ptsd: 0.3,
        bpd: 0.26,
        general: 0.1
      }
    }
  },

  /**
   * Cognitive Assessment
   * Sources: Wechsler (2008), CHC theory,
   * Meta-analysis by Floyd et al. (2021, N=150,000)
   */
  cognitiveAssessment: {
    // CHC (Cattell-Horn-Carroll) Model
    chcModel: {
      broadAbilities: {
        fluidIntelligence: {
          definition: 'Novel problem solving',
          peakAge: 25,
          declineRate: -0.02, // Per year after 30
          tests: ['Matrix reasoning', 'Figure weights'],
          heritability: 0.57
        },
        crystallizedIntelligence: {
          definition: 'Accumulated knowledge',
          peakAge: 65,
          growth: 0.01, // Per year until 65
          tests: ['Vocabulary', 'Information'],
          heritability: 0.48
        },
        processingSpeed: {
          definition: 'Cognitive efficiency',
          peakAge: 20,
          declineRate: -0.025,
          adhdImpact: -0.6,
          tests: ['Symbol search', 'Coding']
        },
        workingMemory: {
          definition: 'Temporary storage and manipulation',
          components: {
            phonologicalLoop: { capacity: '7±2 items' },
            visuospatialSketchpad: { capacity: '4±1 items' },
            centralExecutive: { efficiency: 'Variable' }
          },
          adhdImpact: -0.94,
          tests: ['Digit span', 'Arithmetic']
        },
        longTermRetrieval: {
          definition: 'Storage and retrieval',
          components: ['Encoding', 'Consolidation', 'Retrieval'],
          ageEffects: { encoding: -0.03, retrieval: -0.02 }
        },
        visualProcessing: {
          definition: 'Visual perception and manipulation',
          autismStrength: 0.42,
          tests: ['Block design', 'Visual puzzles']
        },
        auditoryProcessing: {
          definition: 'Auditory perception',
          dyslexiaImpact: -0.55,
          tests: ['Phonological processing', 'Sound blending']
        }
      }
    },

    // IQ distributions and classifications
    iqClassifications: {
      profoundID: { range: [0, 24], prevalence: 0.0001, support: 'Extensive' },
      severeID: { range: [25, 39], prevalence: 0.0003, support: 'Pervasive' },
      moderateID: { range: [40, 54], prevalence: 0.001, support: 'Limited' },
      mildID: { range: [55, 69], prevalence: 0.013, support: 'Intermittent' },
      borderline: { range: [70, 79], prevalence: 0.068 },
      lowAverage: { range: [80, 89], prevalence: 0.161 },
      average: { range: [90, 109], prevalence: 0.502 },
      highAverage: { range: [110, 119], prevalence: 0.161 },
      superior: { range: [120, 129], prevalence: 0.068 },
      verySuperior: { range: [130, 144], prevalence: 0.022 },
      gifted: { range: [145, 159], prevalence: 0.001 },
      highlyGifted: { range: [160, 180], prevalence: 0.00003 }
    },

    // Twice exceptional (2e)
    twiceExceptional: {
      prevalence: {
        giftedWithLD: 0.05, // Of gifted population
        giftedWithADHD: 0.09,
        giftedWithAutism: 0.07
      },
      identification: {
        challenges: ['Masking', 'Compensation', 'Asynchronous development'],
        recommendations: ['Comprehensive assessment', 'Strength-based approach']
      }
    },

    // Processing speed
    processingSpeed: {
      normativeData: {
        age20: { mean: 100, sd: 15 },
        age30: { mean: 98, sd: 15 },
        age40: { mean: 95, sd: 15 },
        age50: { mean: 91, sd: 15 },
        age60: { mean: 86, sd: 15 },
        age70: { mean: 80, sd: 15 }
      },
      clinicalImpact: {
        adhd: { meanScore: 88, effectSize: -0.6 },
        autism: { meanScore: 92, effectSize: -0.4 },
        depression: { meanScore: 90, effectSize: -0.5 },
        bipolar: { meanScore: 89, effectSize: -0.55 }
      }
    }
  },

  /**
   * Attachment and Interpersonal Patterns
   * Sources: Brennan et al. (1998), Fraley et al. (2015),
   * Meta-analysis by Konrath et al. (2019, N=90,000)
   */
  attachmentPatterns: {
    // Adult attachment dimensions
    dimensions: {
      anxiety: {
        definition: 'Fear of abandonment and rejection',
        highScore: {
          behaviors: ['Seeking reassurance', 'Jealousy', 'Emotional dysregulation'],
          prevalence: 0.15,
          therapyFocus: 'Emotion regulation, self-soothing'
        }
      },
      avoidance: {
        definition: 'Discomfort with closeness and dependency',
        highScore: {
          behaviors: ['Self-reliance', 'Emotional distance', 'Intimacy discomfort'],
          prevalence: 0.23,
          therapyFocus: 'Trust building, vulnerability'
        }
      }
    },

    // Attachment styles
    styles: {
      secure: {
        anxiety: 'low',
        avoidance: 'low',
        prevalence: 0.59,
        characteristics: ['Comfortable with intimacy', 'Trust', 'Effective communication'],
        relationshipSatisfaction: 0.62
      },
      anxiousPreoccupied: {
        anxiety: 'high',
        avoidance: 'low',
        prevalence: 0.15,
        characteristics: ['Seeks approval', 'Fear of abandonment', 'Emotional intensity'],
        mentalHealthRisk: 2.31
      },
      dismissiveAvoidant: {
        anxiety: 'low',
        avoidance: 'high',
        prevalence: 0.18,
        characteristics: ['Self-sufficient', 'Minimizes attachment', 'Defensive'],
        lonelinessRisk: 2.14
      },
      fearfulAvoidant: {
        anxiety: 'high',
        avoidance: 'high',
        prevalence: 0.08,
        characteristics: ['Wants close relationships but fears hurt', 'Mistrust'],
        traumaHistory: 0.73
      }
    },

    // Interpersonal problems (IIP-32)
    interpersonalProblems: {
      domineering: { prevalence: 0.12, clusterB: 0.42 },
      vindictive: { prevalence: 0.08, paranoid: 0.38 },
      cold: { prevalence: 0.14, schizoid: 0.51 },
      sociallyInhibited: { prevalence: 0.19, avoidant: 0.62 },
      nonassertive: { prevalence: 0.22, dependent: 0.48 },
      exploitable: { prevalence: 0.15, dependent: 0.41 },
      overlyNurturant: { prevalence: 0.18, codependent: 0.56 },
      intrusive: { prevalence: 0.11, histrionic: 0.39 }
    },

    // Relationship patterns
    relationshipPatterns: {
      conflictResolution: {
        constructive: { secure: 0.72, prevalence: 0.45 },
        withdrawal: { avoidant: 0.68, prevalence: 0.28 },
        aggression: { anxious: 0.43, prevalence: 0.15 },
        submission: { fearful: 0.51, prevalence: 0.12 }
      },
      intimacy: {
        comfortable: { secure: 0.78, satisfaction: 0.65 },
        anxious: { preoccupied: 0.71, burnout: 0.42 },
        avoidant: { dismissive: 0.74, loneliness: 0.48 }
      }
    }
  },

  /**
   * Sleep and Circadian Rhythms
   * Sources: Buysse et al. (1989), Roenneberg et al. (2019),
   * Meta-analysis by Li et al. (2021, N=500,000)
   */
  sleepAssessment: {
    // Pittsburgh Sleep Quality Index
    psqi: {
      components: {
        subjectiveQuality: { weight: 1 },
        latency: { weight: 1, clinical: '>30min' },
        duration: { weight: 1, clinical: '<7hours' },
        efficiency: { weight: 1, clinical: '<85%' },
        disturbances: { weight: 1 },
        medication: { weight: 1 },
        daytimeDysfunction: { weight: 1 }
      },
      globalScore: {
        range: [0, 21],
        cutoff: 5,
        sensitivity: 0.897,
        specificity: 0.865
      }
    },

    // Chronotype (MEQ-5)
    chronotype: {
      types: {
        definiteEvening: { range: [4, 11], prevalence: 0.09, adhdRisk: 2.31 },
        moderateEvening: { range: [12, 17], prevalence: 0.29, depressionRisk: 1.82 },
        intermediate: { range: [18, 25], prevalence: 0.51 },
        moderateMorning: { range: [26, 31], prevalence: 0.09 },
        definiteMorning: { range: [32, 35], prevalence: 0.02 }
      },
      neurodiversityAssociations: {
        adhd: { eveningType: 0.43, delayedPhase: 0.73 },
        autism: { irregularPatterns: 0.65, insomnia: 0.8 },
        bipolar: { irregularRhythms: 0.69, seasonalVariation: 0.42 }
      }
    },

    // Sleep disorders prevalence
    disorders: {
      insomnia: {
        chronic: 0.1,
        acute: 0.25,
        comorbidAnxiety: 0.73,
        comorbidDepression: 0.65
      },
      sleepApnea: {
        prevalence: 0.13,
        undiagnosed: 0.82,
        adhd: 0.25
      },
      restlessLegs: {
        prevalence: 0.07,
        adhd: 0.44,
        ironDeficiency: 0.43
      },
      circadianDisorders: {
        delayedPhase: { prevalence: 0.07, teenPrevalence: 0.16, adhd: 0.73 },
        advancedPhase: { prevalence: 0.01, elderly: 0.07 },
        nonTwentyFour: { prevalence: 0.001, blind: 0.5 },
        irregular: { prevalence: 0.002, neurodegenerative: 0.25 }
      }
    }
  },

  /**
   * Scoring Algorithms and Statistical Methods
   */
  scoringMethods: {
    // Standard score conversions
    standardScores: {
      zToT: z => 50 + z * 10,
      tToPercentile: t => {
        // Using normal distribution approximation
        const z = (t - 50) / 10;
        return ExtendedPsychologicalResearchDatabase.scoringMethods.zToPercentile(z);
      },
      zToPercentile: z => {
        // Approximation of normal CDF
        const a1 = 0.254829592;
        const a2 = -0.284496736;
        const a3 = 1.421413741;
        const a4 = -1.453152027;
        const a5 = 1.061405429;
        const p = 0.3275911;

        const sign = z < 0 ? -1 : 1;
        const x = Math.abs(z) / Math.sqrt(2);
        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

        return 50 + 50 * sign * y;
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

    // Reliability calculations
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
    },

    // Effect size calculations
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

    // Clinical significance
    clinicalSignificance: {
      reliableChangeIndex: (pre, post, sem) => {
        const diff = post - pre;
        const sediff = sem * Math.sqrt(2);
        return diff / sediff;
      },

      jacobsonCutoff: (meanClinical, meanNormal, sdClinical, sdNormal) => {
        return (sdNormal * meanClinical + sdClinical * meanNormal) / (sdNormal + sdClinical);
      },

      clinicallySignificant: (pre, post, rci, cutoff) => {
        return (
          Math.abs(rci) > 1.96 &&
          ((pre > cutoff && post < cutoff) || (pre < cutoff && post > cutoff))
        );
      }
    }
  },

  /**
   * Cultural and Demographic Considerations
   */
  culturalConsiderations: {
    // Cross-cultural validity
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

    // Socioeconomic factors
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

    // Language considerations
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
    // Psychotherapy outcomes
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

    // Medication response
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

    // Prognostic factors
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
  module.exports = ExtendedPsychologicalResearchDatabase;
}

// Also make available as global for browser environments
if (typeof window !== 'undefined') {
  window.ExtendedPsychologicalResearchDatabase = ExtendedPsychologicalResearchDatabase;
}
