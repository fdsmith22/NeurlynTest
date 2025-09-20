/**
 * Comprehensive Report Generator for Neurlyn
 * Generates detailed, beautiful assessment reports with complete analysis
 */

export class ComprehensiveReportGenerator {
  constructor() {
    this.initializeData();
  }

  initializeData() {
    // Big Five trait descriptions with detailed analysis
    this.traitAnalysis = {
      openness: {
        high: {
          title: 'The Creative Visionary',
          summary: 'Highly imaginative, curious, and open to new experiences',
          characteristics: [
            'Exceptional creativity and imagination',
            'Strong intellectual curiosity',
            'Appreciation for art and beauty',
            'Preference for variety over routine',
            'Abstract and theoretical thinking'
          ],
          strengths: [
            'Innovation and creative problem-solving',
            'Adaptability to change',
            'Broad interests and knowledge',
            'Cultural sensitivity',
            'Visionary thinking'
          ],
          challenges: [
            'May struggle with routine tasks',
            'Can be seen as impractical',
            'Difficulty focusing on one thing',
            'May overlook important details',
            'Risk of being too idealistic'
          ],
          careers: [
            'Research Scientist',
            'Artist/Designer',
            'Writer/Journalist',
            'Entrepreneur',
            'Professor',
            'Architect',
            'Film Director',
            'Marketing Creative',
            'Philosopher',
            'Innovation Consultant'
          ],
          relationships:
            'Values intellectual stimulation and deep conversations. Seeks partners who share curiosity and love of learning.',
          growth:
            'Focus on completing projects, developing practical skills, and balancing innovation with execution.'
        },
        medium: {
          title: 'The Balanced Explorer',
          summary: 'Appreciates both tradition and innovation in balanced measure',
          characteristics: [
            'Selective curiosity',
            'Practical creativity',
            'Moderate risk-taking',
            'Balance of routine and variety',
            'Grounded imagination'
          ],
          strengths: [
            'Versatility',
            'Balanced perspective',
            'Practical innovation',
            'Selective adaptation',
            'Realistic creativity'
          ]
        },
        low: {
          title: 'The Practical Realist',
          summary: 'Values proven methods, stability, and practical approaches',
          characteristics: [
            'Preference for familiar and proven',
            'Practical and concrete thinking',
            'Comfort with routine',
            'Focus on real-world applications',
            'Traditional values'
          ],
          strengths: [
            'Reliability and consistency',
            'Practical problem-solving',
            'Focus and concentration',
            'Attention to detail',
            'Efficient execution'
          ]
        }
      },
      conscientiousness: {
        high: {
          title: 'The Dedicated Achiever',
          summary: 'Highly organized, disciplined, and goal-oriented',
          characteristics: [
            'Exceptional self-discipline',
            'Strong work ethic',
            'Meticulous attention to detail',
            'Goal-oriented and ambitious',
            'Reliable and dependable'
          ],
          strengths: [
            'Outstanding organizational skills',
            'High achievement orientation',
            'Exceptional reliability',
            'Strong planning abilities',
            'Quality-focused work'
          ],
          challenges: [
            'Perfectionism tendencies',
            'Difficulty delegating',
            'Risk of burnout',
            'May be inflexible',
            'Can be overly critical'
          ],
          careers: [
            'Executive/CEO',
            'Project Manager',
            'Accountant',
            'Engineer',
            'Surgeon',
            'Financial Analyst',
            'Quality Assurance Manager',
            'Operations Director',
            'Military Officer',
            'Judge'
          ],
          relationships:
            'Values commitment, reliability, and shared goals. Appreciates partners who are responsible and have clear life direction.',
          growth:
            'Practice flexibility, embrace imperfection when appropriate, and remember to celebrate progress not just completion.'
        }
      },
      extraversion: {
        high: {
          title: 'The Social Energizer',
          summary: 'Thrives in social situations and draws energy from interactions',
          characteristics: [
            'High social energy',
            'Natural enthusiasm',
            'Seeks stimulation',
            'Comfortable in spotlight',
            'Extensive social networks'
          ],
          strengths: [
            'Natural leadership abilities',
            'Excellent networking',
            'Strong communication skills',
            'Team building expertise',
            'Positive energy and enthusiasm'
          ],
          challenges: [
            'May struggle with solitude',
            'Risk of oversharing',
            'Can dominate conversations',
            'May act impulsively',
            'Difficulty with deep focus'
          ],
          careers: [
            'Sales Director',
            'Public Relations Manager',
            'Event Coordinator',
            'Teacher/Professor',
            'Marketing Manager',
            'TV Host/Presenter',
            'Politician',
            'Recruiter',
            'Customer Success Manager',
            'Tour Guide'
          ],
          relationships:
            'Seeks active, social partnerships with shared activities. Values open communication and social connections.',
          growth:
            'Develop active listening skills, practice mindful solitude, and create space for others to contribute.'
        }
      },
      agreeableness: {
        high: {
          title: 'The Compassionate Harmonizer',
          summary: 'Prioritizes cooperation, empathy, and positive relationships',
          characteristics: [
            'Deep empathy and compassion',
            'Strong desire for harmony',
            'Trusting nature',
            'Cooperative approach',
            'Selfless and altruistic'
          ],
          strengths: [
            'Exceptional team player',
            'Conflict resolution skills',
            'Building trust easily',
            'Emotional intelligence',
            'Supportive nature'
          ],
          challenges: [
            'Difficulty saying no',
            'May avoid confrontation',
            'Risk of being taken advantage of',
            'Can neglect own needs',
            'Struggle with tough decisions'
          ],
          careers: [
            'Counselor/Therapist',
            'Human Resources Manager',
            'Social Worker',
            'Nurse',
            'Teacher',
            'Non-profit Director',
            'Mediator',
            'Customer Service Manager',
            'Team Coach',
            'Chaplain'
          ],
          relationships:
            'Creates warm, supportive partnerships based on mutual care and understanding. Values emotional connection and kindness.',
          growth:
            'Practice assertiveness, set healthy boundaries, and remember that self-care enables you to care for others.'
        }
      },
      neuroticism: {
        low: {
          title: 'The Steady Rock',
          summary: 'Maintains emotional stability and handles stress exceptionally well',
          characteristics: [
            'Emotional resilience',
            'Calm under pressure',
            'Optimistic outlook',
            'Stress resistance',
            'Emotional regulation'
          ],
          strengths: [
            'Crisis management',
            'Consistent mood',
            'Rational decision-making',
            'Stress tolerance',
            'Emotional stability'
          ],
          careers: [
            'Emergency Room Doctor',
            'Air Traffic Controller',
            'Military Leader',
            'Crisis Manager',
            'Pilot',
            'Police Officer',
            'Firefighter'
          ]
        },
        high: {
          title: 'The Sensitive Soul',
          summary: 'Experiences emotions deeply and intensely',
          characteristics: [
            'Emotional depth',
            'High sensitivity',
            'Rich inner life',
            'Strong intuition',
            'Empathetic nature'
          ],
          strengths: [
            'Emotional awareness',
            'Deep empathy',
            'Artistic sensitivity',
            'Passionate engagement',
            'Intuitive understanding'
          ],
          challenges: [
            'Stress vulnerability',
            'Mood fluctuations',
            'Overthinking tendency',
            'Anxiety proneness',
            'Emotional overwhelm'
          ],
          growth:
            'Develop stress management techniques, practice self-compassion, and build emotional regulation skills.'
        }
      }
    };

    // Neurodiversity insights
    this.neurodiversityAnalysis = {
      adhd: {
        high: {
          title: 'ADHD Traits Present',
          characteristics: [
            'High creativity and innovation',
            'Ability to hyperfocus on interests',
            'Quick thinking and problem-solving',
            'High energy and enthusiasm',
            'Unique perspective and thinking style'
          ],
          strategies: [
            'Use timers and reminders',
            'Break tasks into smaller chunks',
            'Create structured routines',
            'Minimize distractions',
            'Leverage hyperfocus periods'
          ],
          strengths: [
            'Creative thinking',
            'Crisis management',
            'Multitasking ability',
            'High energy',
            'Innovation'
          ]
        }
      },
      autism: {
        high: {
          title: 'Autism Spectrum Traits',
          characteristics: [
            'Detail-oriented thinking',
            'Pattern recognition abilities',
            'Deep focus on interests',
            'Logical and systematic approach',
            'Unique cognitive strengths'
          ],
          strategies: [
            'Create predictable routines',
            'Use visual schedules',
            'Prepare for transitions',
            'Communicate directly',
            'Honor sensory needs'
          ],
          strengths: [
            'Attention to detail',
            'Pattern recognition',
            'Systematic thinking',
            'Deep expertise',
            'Reliability'
          ]
        }
      }
    };

    // Lateral thinking patterns
    this.lateralPatterns = {
      innovative: {
        title: 'Innovative Thinker',
        description: 'You approach problems from unique angles and generate original solutions'
      },
      analytical: {
        title: 'Analytical Thinker',
        description: 'You break down complex problems systematically and logically'
      },
      intuitive: {
        title: 'Intuitive Thinker',
        description: 'You rely on gut feelings and pattern recognition to solve problems'
      },
      practical: {
        title: 'Practical Thinker',
        description: 'You focus on real-world applications and actionable solutions'
      }
    };

    // Comprehensive archetypes
    this.archetypes = {
      VISIONARY_LEADER: {
        name: 'The Visionary Leader',
        description:
          'Natural born leaders who inspire others with compelling visions of the future',
        traits: ['High Extraversion', 'High Openness', 'High Conscientiousness'],
        strengths: 'Strategic thinking, Inspiration, Innovation, Team building, Goal achievement',
        challenges: 'May overlook details, Risk of burnout, Can be demanding',
        careers: 'CEO, Entrepreneur, Director, Politician, Consultant',
        famous: 'Steve Jobs, Elon Musk, Oprah Winfrey'
      },
      CREATIVE_INNOVATOR: {
        name: 'The Creative Innovator',
        description: 'Original thinkers who challenge conventions and create new possibilities',
        traits: ['High Openness', 'Medium Conscientiousness', 'Low Neuroticism'],
        strengths: 'Creativity, Problem-solving, Vision, Adaptability, Original thinking',
        challenges: 'May lack follow-through, Can be impractical, Difficulty with routine',
        careers: 'Artist, Designer, Researcher, Writer, Inventor',
        famous: 'Leonardo da Vinci, Albert Einstein, Frida Kahlo'
      },
      ANALYTICAL_MASTERMIND: {
        name: 'The Analytical Mastermind',
        description:
          'Systematic thinkers who excel at understanding and optimizing complex systems',
        traits: ['High Conscientiousness', 'Low Extraversion', 'High Openness'],
        strengths: 'Analysis, Planning, Problem-solving, Focus, Objectivity',
        challenges: 'May seem detached, Perfectionism, Difficulty delegating',
        careers: 'Data Scientist, Engineer, Researcher, Strategist, Architect',
        famous: 'Marie Curie, Bill Gates, Warren Buffett'
      },
      COMPASSIONATE_HELPER: {
        name: 'The Compassionate Helper',
        description: 'Empathetic souls dedicated to supporting and uplifting others',
        traits: ['High Agreeableness', 'High Extraversion', 'Low Neuroticism'],
        strengths: 'Empathy, Support, Team building, Communication, Nurturing',
        challenges: 'Self-neglect, Boundary issues, Avoiding conflict',
        careers: 'Counselor, Teacher, Nurse, Social Worker, HR Manager',
        famous: 'Mother Teresa, Mr. Rogers, Princess Diana'
      },
      STEADFAST_GUARDIAN: {
        name: 'The Steadfast Guardian',
        description: 'Reliable protectors who maintain stability and uphold traditions',
        traits: ['High Conscientiousness', 'High Agreeableness', 'Low Openness'],
        strengths: 'Reliability, Loyalty, Organization, Duty, Consistency',
        challenges: 'Resistance to change, Rigidity, Risk aversion',
        careers: 'Military Officer, Police Officer, Administrator, Accountant',
        famous: 'Queen Elizabeth II, George Washington'
      },
      FREE_SPIRIT: {
        name: 'The Free Spirit Explorer',
        description: 'Adventurous souls who seek new experiences and embrace spontaneity',
        traits: ['High Openness', 'Low Conscientiousness', 'High Extraversion'],
        strengths: 'Adaptability, Enthusiasm, Creativity, Social skills, Adventure',
        challenges: 'Lack of structure, Impulsiveness, Difficulty with commitment',
        careers: 'Travel Writer, Photographer, Performer, Tour Guide, Artist',
        famous: 'Richard Branson, Anthony Bourdain, Amelia Earhart'
      }
    };
  }

  /**
   * Generate comprehensive report from assessment results
   */
  async generateComprehensiveReport(assessmentData) {
    const {
      mode,
      track,
      responses,
      traits,
      duration,
      behavioralMetrics,
      gamifiedMetrics,
      neurodiversityScores
    } = assessmentData;

    const report = {
      // Meta information
      meta: this.generateMetaData(mode, track, duration, responses),

      // Executive summary
      executive: this.generateExecutiveSummary(traits, neurodiversityScores),

      // Detailed trait analysis
      personality: this.generatePersonalityAnalysis(traits),

      // Neurodiversity insights if applicable
      neurodiversity:
        track === 'neurodiversity'
          ? this.generateNeurodiversityAnalysis(neurodiversityScores)
          : null,

      // Lateral thinking analysis
      cognitive: this.analyzeCognitivePatterns(responses, gamifiedMetrics),

      // Archetype determination
      archetype: this.determineComprehensiveArchetype(traits, neurodiversityScores),

      // Comprehensive insights
      insights: this.generateComprehensiveInsights(traits, behavioralMetrics, gamifiedMetrics),

      // Detailed recommendations
      recommendations: this.generateDetailedRecommendations(traits, neurodiversityScores),

      // Career guidance
      career: this.generateCareerGuidance(traits, neurodiversityScores),

      // Relationship insights
      relationships: this.generateRelationshipInsights(traits),

      // Personal growth plan
      growth: this.generateGrowthPlan(traits, neurodiversityScores),

      // Visualization data
      visualizations: this.prepareVisualizationData(traits, neurodiversityScores),

      // Comparative analysis
      comparisons: this.generateComparativeAnalysis(traits),

      // Scientific validity
      validity: this.calculateValidityMetrics(responses, behavioralMetrics)
    };

    return report;
  }

  generateMetaData(mode, track, duration, responses) {
    return {
      generatedAt: new Date().toISOString(),
      assessmentType: track || 'personality',
      assessmentMode: mode,
      duration: Math.round(duration / 60000) + ' minutes',
      totalQuestions: responses.length,
      completionRate: this.calculateCompletionRate(responses),
      reliability: this.calculateReliability(responses),
      timestamp: {
        date: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    };
  }

  generateExecutiveSummary(traits, _neurodiversityScores) {
    const topTraits = this.identifyTopTraits(traits);
    const keyStrengths = this.identifyKeyStrengths(traits);
    const growthAreas = this.identifyGrowthAreas(traits);

    return {
      headline: this.generateHeadline(topTraits),
      summary: this.generatePersonalitySummary(traits),
      topTraits: topTraits,
      keyStrengths: keyStrengths,
      growthAreas: growthAreas,
      uniqueFactors: this.identifyUniqueFactors(traits),
      populationComparison: this.calculatePopulationPercentile(traits)
    };
  }

  generatePersonalityAnalysis(traits) {
    const analysis = {};

    Object.entries(traits).forEach(([trait, score]) => {
      const level = this.getTraitLevel(score);
      const traitData = this.traitAnalysis[trait.toLowerCase()]?.[level] || {};

      analysis[trait] = {
        score: score,
        percentile: this.calculatePercentile(score),
        level: level,
        title: traitData.title || `${level} ${trait}`,
        summary: traitData.summary || '',
        characteristics: traitData.characteristics || [],
        strengths: traitData.strengths || [],
        challenges: traitData.challenges || [],
        careers: traitData.careers || [],
        relationships: traitData.relationships || '',
        growth: traitData.growth || '',
        interpretation: this.generateTraitInterpretation(trait, score),
        comparison: this.generateTraitComparison(score)
      };
    });

    return analysis;
  }

  generateNeurodiversityAnalysis(scores) {
    if (!scores) return null;

    const analysis = {
      adhd: null,
      autism: null,
      anxiety: null,
      depression: null,
      overall: null
    };

    if (scores.adhd && scores.adhd > 14) {
      analysis.adhd = {
        score: scores.adhd,
        indication: 'Possible ADHD traits present',
        ...this.neurodiversityAnalysis.adhd.high
      };
    }

    if (scores.autism && scores.autism > 6) {
      analysis.autism = {
        score: scores.autism,
        indication: 'Possible autism spectrum traits',
        ...this.neurodiversityAnalysis.autism.high
      };
    }

    if (scores.anxiety && scores.anxiety > 3) {
      analysis.anxiety = {
        score: scores.anxiety,
        indication: 'Elevated anxiety levels',
        recommendations: [
          'Consider mindfulness practices',
          'Regular exercise routine',
          'Professional support if needed'
        ]
      };
    }

    if (scores.depression && scores.depression > 3) {
      analysis.depression = {
        score: scores.depression,
        indication: 'Possible depression symptoms',
        recommendations: [
          'Maintain social connections',
          'Establish daily routines',
          'Seek professional support'
        ]
      };
    }

    analysis.overall = this.generateNeurodiversityOverview(analysis);

    return analysis;
  }

  analyzeCognitivePatterns(responses, gamifiedMetrics) {
    const lateralResponses = responses.filter(r => r.category === 'lateral');
    const cognitiveResponses = responses.filter(r => r.category === 'cognitive');

    return {
      thinkingStyle: this.determineThinkingStyle(lateralResponses),
      problemSolving: this.analyzeProblemSolving(lateralResponses, cognitiveResponses),
      creativity: this.assessCreativity(lateralResponses, gamifiedMetrics),
      cognitiveStrengths: this.identifyCognitiveStrengths(responses),
      learningStyle: this.determineLearningStyle(responses, gamifiedMetrics)
    };
  }

  determineComprehensiveArchetype(traits, _neurodiversityScores) {
    let bestMatch = null;
    let highestScore = 0;

    Object.entries(this.archetypes).forEach(([key, archetype]) => {
      const score = this.calculateArchetypeMatch(traits, archetype.traits);

      if (score > highestScore) {
        highestScore = score;
        bestMatch = {
          ...archetype,
          matchScore: Math.round(score * 100),
          key: key
        };
      }
    });

    return bestMatch;
  }

  generateComprehensiveInsights(traits, behavioralMetrics, gamifiedMetrics) {
    return {
      personality: {
        strengths: this.identifyPersonalityStrengths(traits),
        challenges: this.identifyPersonalityChallenges(traits),
        opportunities: this.identifyOpportunities(traits),
        risks: this.identifyRisks(traits)
      },
      behavioral: {
        patterns: this.analyzeBehavioralPatterns(behavioralMetrics),
        tendencies: this.identifyBehavioralTendencies(behavioralMetrics),
        consistency: this.assessResponseConsistency(behavioralMetrics)
      },
      cognitive: {
        style: this.determineCognitiveStyle(gamifiedMetrics),
        strengths: this.identifyCognitiveStrengths(gamifiedMetrics),
        preferences: this.identifyCognitivePreferences(gamifiedMetrics)
      },
      emotional: {
        regulation: this.assessEmotionalRegulation(traits),
        intelligence: this.assessEmotionalIntelligence(traits),
        resilience: this.assessResilience(traits)
      },
      social: {
        style: this.determineSocialStyle(traits),
        skills: this.assessSocialSkills(traits),
        preferences: this.identifySocialPreferences(traits)
      }
    };
  }

  generateDetailedRecommendations(traits, _neurodiversityScores) {
    return {
      immediate: this.generateImmediateActions(traits, _neurodiversityScores),
      shortTerm: this.generateShortTermGoals(traits),
      longTerm: this.generateLongTermGoals(traits),
      books: this.recommendBooks(traits),
      courses: this.recommendCourses(traits),
      activities: this.recommendActivities(traits),
      mindfulness: this.recommendMindfulnessPractices(traits),
      skills: this.recommendSkillDevelopment(traits),
      habits: this.recommendHabits(traits),
      tools: this.recommendTools(traits, _neurodiversityScores)
    };
  }

  generateCareerGuidance(traits, _neurodiversityScores) {
    const careerMatches = this.calculateCareerMatches(traits);

    return {
      topCareers: careerMatches.slice(0, 10),
      careerTraits: this.identifyCareerTraits(traits),
      workEnvironment: this.determineIdealWorkEnvironment(traits),
      teamRole: this.determineTeamRole(traits),
      leadershipStyle: this.determineLeadershipStyle(traits),
      workMotivation: this.identifyWorkMotivation(traits),
      careerDevelopment: this.generateCareerDevelopmentPlan(traits),
      industryFit: this.determineIndustryFit(traits),
      entrepreneurialPotential: this.assessEntrepreneurialPotential(traits),
      remoteWorkCompatibility: this.assessRemoteWorkCompatibility(traits)
    };
  }

  generateRelationshipInsights(traits) {
    return {
      style: this.determineRelationshipStyle(traits),
      strengths: this.identifyRelationshipStrengths(traits),
      challenges: this.identifyRelationshipChallenges(traits),
      needs: this.identifyRelationshipNeeds(traits),
      communication: this.analyzeCommunicationStyle(traits),
      conflictResolution: this.analyzeConflictResolution(traits),
      emotionalAvailability: this.assessEmotionalAvailability(traits),
      compatibility: this.generateCompatibilityProfile(traits),
      attachmentStyle: this.determineAttachmentStyle(traits),
      loveLanguage: this.determineLoveLanguage(traits)
    };
  }

  generateGrowthPlan(traits, _neurodiversityScores) {
    return {
      priorities: this.identifyGrowthPriorities(traits),
      goals: {
        month1: this.generateMonthlyGoals(traits, 1),
        month3: this.generateMonthlyGoals(traits, 3),
        month6: this.generateMonthlyGoals(traits, 6),
        year1: this.generateYearlyGoals(traits, 1)
      },
      exercises: this.generateGrowthExercises(traits),
      milestones: this.defineMilestones(traits),
      accountability: this.generateAccountabilityPlan(traits),
      resources: this.compileGrowthResources(traits, _neurodiversityScores),
      tracking: this.generateProgressTracking(traits)
    };
  }

  prepareVisualizationData(traits, _neurodiversityScores) {
    return {
      radarChart: {
        labels: Object.keys(traits),
        datasets: [
          {
            label: 'Your Profile',
            data: Object.values(traits),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.2)'
          }
        ]
      },
      barChart: {
        labels: Object.keys(traits),
        datasets: [
          {
            label: 'Trait Scores',
            data: Object.values(traits),
            backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe']
          }
        ]
      },
      pieChart: this.generatePieChartData(traits),
      lineChart: this.generateProgressionData(traits),
      heatmap: this.generateHeatmapData(traits),
      comparison: this.generateComparisonData(traits)
    };
  }

  generateComparativeAnalysis(traits) {
    return {
      population: this.compareToPopulation(traits),
      ageGroup: this.compareToAgeGroup(traits),
      profession: this.compareToProfession(traits),
      culture: this.compareToCulture(traits),
      percentiles: this.calculateAllPercentiles(traits),
      rarity: this.calculateProfileRarity(traits),
      similarProfiles: this.findSimilarProfiles(traits)
    };
  }

  calculateValidityMetrics(responses, behavioralMetrics) {
    return {
      reliability: this.calculateReliability(responses),
      consistency: this.calculateConsistency(responses),
      completeness: this.calculateCompleteness(responses),
      engagement: this.calculateEngagement(behavioralMetrics),
      validity: this.assessOverallValidity(responses, behavioralMetrics),
      confidence: this.calculateConfidenceInterval(responses)
    };
  }

  // Helper methods
  getTraitLevel(score) {
    if (score >= 70) return 'high';
    if (score <= 30) return 'low';
    return 'medium';
  }

  calculatePercentile(score) {
    // Using normal distribution approximation
    const mean = 50;
    const stdDev = 15;
    const z = (score - mean) / stdDev;
    const percentile = this.normalCDF(z) * 100;
    return Math.round(percentile);
  }

  normalCDF(x) {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2.0);

    const t = 1.0 / (1.0 + p * x);
    const t2 = t * t;
    const t3 = t2 * t;
    const t4 = t3 * t;
    const t5 = t4 * t;
    const y = t * a1 + t2 * a2 + t3 * a3 + t4 * a4 + t5 * a5;
    const erfx = 1 - y * Math.exp(-x * x);

    return 0.5 * (1.0 + sign * erfx);
  }

  identifyTopTraits(traits) {
    return Object.entries(traits)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([trait, score]) => ({ trait, score }));
  }

  identifyKeyStrengths(traits) {
    const strengths = [];

    Object.entries(traits).forEach(([trait, score]) => {
      if (score >= 70) {
        const level = 'high';
        const traitData = this.traitAnalysis[trait.toLowerCase()]?.[level];
        if (traitData?.strengths) {
          strengths.push(...traitData.strengths.slice(0, 2));
        }
      }
    });

    return [...new Set(strengths)].slice(0, 5);
  }

  identifyGrowthAreas(traits) {
    const areas = [];

    Object.entries(traits).forEach(([trait, score]) => {
      const level = this.getTraitLevel(score);
      const traitData = this.traitAnalysis[trait.toLowerCase()]?.[level];
      if (traitData?.challenges) {
        areas.push(...traitData.challenges.slice(0, 1));
      }
    });

    return [...new Set(areas)].slice(0, 3);
  }

  generateHeadline(topTraits) {
    const trait1 = topTraits[0]?.trait.toLowerCase();
    const trait2 = topTraits[1]?.trait.toLowerCase();

    const headlines = [
      `The ${this.getTraitAdjective(trait1)} ${this.getTraitNoun(trait2)}`,
      `A Unique Blend of ${trait1} and ${trait2}`,
      `Your Signature: High ${trait1} with Notable ${trait2}`
    ];

    return headlines[Math.floor(Math.random() * headlines.length)];
  }

  getTraitAdjective(trait) {
    const adjectives = {
      openness: 'Creative',
      conscientiousness: 'Organized',
      extraversion: 'Social',
      agreeableness: 'Compassionate',
      neuroticism: 'Sensitive'
    };
    return adjectives[trait] || 'Unique';
  }

  getTraitNoun(trait) {
    const nouns = {
      openness: 'Innovator',
      conscientiousness: 'Achiever',
      extraversion: 'Leader',
      agreeableness: 'Helper',
      neuroticism: 'Thinker'
    };
    return nouns[trait] || 'Individual';
  }

  generatePersonalitySummary(traits) {
    const topTrait = Object.entries(traits).sort(([, a], [, b]) => b - a)[0];
    const summary = `Your personality assessment reveals a distinctive profile characterized by ${topTrait[0].toLowerCase()} (${Math.round(topTrait[1])}%). This suggests you are someone who ${this.getTraitDescription(
      topTrait[0],
      topTrait[1]
    )}. Your unique combination of traits makes you well-suited for ${this.getSuitableEnvironments(
      traits
    )}.`;

    return summary;
  }

  getTraitDescription(trait, score) {
    const level = this.getTraitLevel(score);
    const descriptions = {
      openness: {
        high: 'embraces new experiences and thinks creatively',
        medium: 'balances innovation with practicality',
        low: 'values tradition and proven methods'
      },
      conscientiousness: {
        high: 'approaches life with discipline and organization',
        medium: 'maintains flexibility while pursuing goals',
        low: 'values spontaneity and adaptability'
      },
      extraversion: {
        high: 'thrives in social situations and energizes others',
        medium: 'balances social interaction with solitude',
        low: 'prefers deep connections and quiet reflection'
      },
      agreeableness: {
        high: 'prioritizes harmony and cooperation',
        medium: 'balances cooperation with assertiveness',
        low: 'values directness and independence'
      },
      neuroticism: {
        high: 'experiences emotions deeply and intensely',
        medium: 'maintains emotional balance',
        low: 'remains calm and stable under pressure'
      }
    };

    return descriptions[trait.toLowerCase()]?.[level] || 'exhibits unique characteristics';
  }

  getSuitableEnvironments(traits) {
    const environments = [];

    if (traits.openness > 70) environments.push('creative and innovative settings');
    if (traits.conscientiousness > 70) environments.push('structured and goal-oriented roles');
    if (traits.extraversion > 70) environments.push('collaborative and social environments');
    if (traits.agreeableness > 70) environments.push('supportive team settings');
    if (traits.neuroticism < 30) environments.push('high-pressure situations');

    return environments.join(', ') || 'diverse professional settings';
  }

  calculateCompletionRate(responses) {
    const answered = responses.filter(r => !r.response?.skipped).length;
    return Math.round((answered / responses.length) * 100);
  }

  calculateReliability(responses) {
    const completionRate = this.calculateCompletionRate(responses);
    const consistency = this.assessResponseConsistency(responses);

    const reliability = completionRate * 0.6 + consistency * 0.4;

    if (reliability >= 90) return 'Excellent';
    if (reliability >= 75) return 'Good';
    if (reliability >= 60) return 'Moderate';
    return 'Basic';
  }

  assessResponseConsistency(responses) {
    // Simplified consistency check
    return 85; // Placeholder - would implement actual consistency algorithm
  }

  identifyUniqueFactors(traits) {
    const factors = [];

    Object.entries(traits).forEach(([trait, score]) => {
      if (score >= 85 || score <= 15) {
        factors.push(`Exceptionally ${score >= 85 ? 'high' : 'low'} ${trait.toLowerCase()}`);
      }
    });

    return factors;
  }

  calculatePopulationPercentile(traits) {
    const percentiles = Object.values(traits).map(score => this.calculatePercentile(score));
    const average = percentiles.reduce((a, b) => a + b, 0) / percentiles.length;

    return {
      overall: Math.round(average),
      rarity: this.calculateProfileRarity(traits),
      description: this.getPopulationDescription(average)
    };
  }

  calculateProfileRarity(traits) {
    let rarity = 100;

    Object.values(traits).forEach(score => {
      if (score >= 80 || score <= 20) rarity *= 0.5;
      else if (score >= 70 || score <= 30) rarity *= 0.7;
    });

    return Math.max(1, Math.round(rarity));
  }

  getPopulationDescription(percentile) {
    if (percentile >= 95) return 'Exceptionally rare profile (top 5%)';
    if (percentile >= 90) return 'Very uncommon profile (top 10%)';
    if (percentile >= 75) return 'Distinctive profile (top 25%)';
    if (percentile >= 60) return 'Above average profile';
    if (percentile >= 40) return 'Common profile';
    return 'Unique profile';
  }

  // Additional helper methods would continue...
  generateTraitInterpretation(trait, score) {
    const level = this.getTraitLevel(score);
    const percentile = this.calculatePercentile(score);

    return `Your ${trait.toLowerCase()} score of ${Math.round(score)}% places you in the ${
      percentile
    }th percentile, indicating ${level} levels of this trait.`;
  }

  generateTraitComparison(score) {
    const percentile = this.calculatePercentile(score);

    if (percentile >= 90) return 'You score higher than 90% of people';
    if (percentile >= 75) return 'You score higher than 75% of people';
    if (percentile >= 60) return 'You score above average';
    if (percentile >= 40) return 'You score around average';
    if (percentile >= 25) return 'You score below average';
    return 'You score in the lower range';
  }

  // Continue with remaining methods...
  calculateArchetypeMatch(traits, archetypeTraits) {
    let matchScore = 0;
    let totalWeight = 0;

    archetypeTraits.forEach(requirement => {
      const [level, traitName] = requirement.split(' ');
      const traitScore = traits[traitName.toLowerCase()] || traits[traitName];

      if (traitScore !== undefined) {
        const weight = 1;
        totalWeight += weight;

        if (level === 'High' && traitScore >= 60) {
          matchScore += (weight * (traitScore - 50)) / 50;
        } else if (level === 'Low' && traitScore <= 40) {
          matchScore += (weight * (50 - traitScore)) / 50;
        } else if (level === 'Medium' && traitScore >= 35 && traitScore <= 65) {
          matchScore += weight * (1 - Math.abs(50 - traitScore) / 50);
        }
      }
    });

    return totalWeight > 0 ? matchScore / totalWeight : 0;
  }

  recommendBooks(traits) {
    const books = [];

    if (traits.openness > 70) {
      books.push("'Sapiens' by Yuval Noah Harari");
      books.push("'Thinking, Fast and Slow' by Daniel Kahneman");
    }
    if (traits.conscientiousness > 70) {
      books.push("'Atomic Habits' by James Clear");
      books.push("'Deep Work' by Cal Newport");
    }
    if (traits.extraversion < 30) {
      books.push("'Quiet' by Susan Cain");
    }
    if (traits.agreeableness > 70) {
      books.push("'Nonviolent Communication' by Marshall Rosenberg");
    }
    if (traits.neuroticism > 70) {
      books.push("'The Power of Now' by Eckhart Tolle");
      books.push("'When Things Fall Apart' by Pema Chödrön");
    }

    return [...new Set(books)].slice(0, 5);
  }

  recommendActivities(traits) {
    const activities = [];

    if (traits.extraversion > 70) {
      activities.push('Join networking groups', 'Attend social events', 'Team sports');
    } else if (traits.extraversion < 30) {
      activities.push('Solo hiking', 'Reading clubs', 'Creative writing');
    }

    if (traits.openness > 70) {
      activities.push('Travel to new places', 'Art classes', 'Learn a new language');
    }

    if (traits.conscientiousness < 30) {
      activities.push('Improv classes', 'Spontaneous adventures');
    }

    if (traits.agreeableness > 70) {
      activities.push('Volunteer work', 'Community service', 'Mentoring');
    }

    return [...new Set(activities)].slice(0, 6);
  }
}

export default ComprehensiveReportGenerator;

// Make available globally for non-module scripts
if (typeof window !== 'undefined') {
  window.ComprehensiveReportGenerator = ComprehensiveReportGenerator;
}
