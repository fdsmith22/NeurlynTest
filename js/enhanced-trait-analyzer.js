/**
 * Enhanced Trait Analyzer - Provides deep analysis with sub-dimensions
 * Extends Big Five analysis with nuanced sub-traits and additional dimensions
 */

class EnhancedTraitAnalyzer {
  constructor() {
    this.initializeSubDimensions();
    this.initializeAdditionalDimensions();
    this.initializeInteractionPatterns();
    this.initializeWeightedScoring();
    this.initializeConfidenceSystem();
  }

  /**
   * Initialize weighted scoring system for more accurate trait calculation
   */
  initializeWeightedScoring() {
    this.questionWeights = {
      core: 1.0, // Core trait questions
      situational: 0.8, // Situational/behavioral questions
      preference: 0.6, // Simple preference questions
      demographic: 0.3 // Demographic-based questions
    };

    this.responseReliability = {
      veryConsistent: 1.0,
      consistent: 0.9,
      moderate: 0.75,
      inconsistent: 0.5,
      veryInconsistent: 0.3
    };

    this.temporalWeights = {
      recent: 1.0, // Most recent responses
      medium: 0.85, // Medium-term responses
      old: 0.7 // Older responses
    };
  }

  /**
   * Initialize confidence interval system
   */
  initializeConfidenceSystem() {
    this.confidenceLevels = {
      veryHigh: { threshold: 95, margin: 2 },
      high: { threshold: 85, margin: 5 },
      moderate: { threshold: 70, margin: 8 },
      low: { threshold: 50, margin: 12 },
      veryLow: { threshold: 0, margin: 15 }
    };

    this.sampleSizeFactors = {
      large: { min: 20, multiplier: 1.0 },
      medium: { min: 10, multiplier: 0.85 },
      small: { min: 5, multiplier: 0.7 },
      minimal: { min: 1, multiplier: 0.5 }
    };
  }

  /**
   * Calculate weighted trait score with confidence intervals
   */
  calculateWeightedTraitScore(trait, responses) {
    if (!responses || responses.length === 0) {
      return {
        score: 50,
        confidence: 0,
        interval: { lower: 35, upper: 65 },
        reliability: 'No data'
      };
    }

    // Filter relevant responses
    const relevantResponses = responses.filter(
      r => (r.trait || r.category || '').toLowerCase() === trait.toLowerCase()
    );

    if (relevantResponses.length === 0) {
      return {
        score: 50,
        confidence: 0,
        interval: { lower: 35, upper: 65 },
        reliability: 'No specific data'
      };
    }

    // Calculate weighted score
    let weightedSum = 0;
    let totalWeight = 0;
    const scores = [];

    relevantResponses.forEach((response, index) => {
      const score = this.normalizeScore(response.score || response.answer || 3);
      const questionWeight = this.getQuestionWeight(response);
      const reliabilityWeight = this.getReliabilityWeight(response, relevantResponses);
      const temporalWeight = this.getTemporalWeight(index, relevantResponses.length);

      const finalWeight = questionWeight * reliabilityWeight * temporalWeight;

      weightedSum += score * finalWeight;
      totalWeight += finalWeight;
      scores.push(score);
    });

    const weightedScore = totalWeight > 0 ? weightedSum / totalWeight : 50;

    // Calculate confidence and intervals
    const confidence = this.calculateConfidence(scores, relevantResponses);
    const interval = this.calculateConfidenceInterval(weightedScore, confidence, scores);
    const reliability = this.assessReliability(scores, relevantResponses);

    return {
      score: Math.round(weightedScore),
      confidence: Math.round(confidence),
      interval: {
        lower: Math.round(interval.lower),
        upper: Math.round(interval.upper)
      },
      reliability,
      sampleSize: relevantResponses.length,
      consistency: this.calculateConsistency(scores)
    };
  }

  /**
   * Get question weight based on type
   */
  getQuestionWeight(response) {
    const questionText = String(response.question || response.questionText || '').toLowerCase();

    if (
      questionText.includes('always') ||
      questionText.includes('never') ||
      questionText.includes('core') ||
      questionText.includes('fundamental')
    ) {
      return this.questionWeights.core;
    }

    if (
      questionText.includes('situation') ||
      questionText.includes('when') ||
      questionText.includes('if')
    ) {
      return this.questionWeights.situational;
    }

    if (questionText.includes('prefer') || questionText.includes('like')) {
      return this.questionWeights.preference;
    }

    return this.questionWeights.situational; // Default
  }

  /**
   * Get reliability weight based on response patterns
   */
  getReliabilityWeight(response, allResponses) {
    // Check for consistency with similar questions
    const similarResponses = this.findSimilarResponses(response, allResponses);

    if (similarResponses.length === 0) {
      return this.responseReliability.moderate;
    }

    const consistency = this.checkResponseConsistency(response, similarResponses);

    if (consistency > 0.9) return this.responseReliability.veryConsistent;
    if (consistency > 0.75) return this.responseReliability.consistent;
    if (consistency > 0.5) return this.responseReliability.moderate;
    if (consistency > 0.25) return this.responseReliability.inconsistent;
    return this.responseReliability.veryInconsistent;
  }

  /**
   * Get temporal weight based on response recency
   */
  getTemporalWeight(index, totalResponses) {
    const position = index / totalResponses;

    if (position > 0.7) return this.temporalWeights.recent;
    if (position > 0.3) return this.temporalWeights.medium;
    return this.temporalWeights.old;
  }

  /**
   * Calculate confidence level
   */
  calculateConfidence(scores, responses) {
    if (scores.length === 0) return 0;

    // Factors affecting confidence
    const sampleSizeFactor = this.getSampleSizeFactor(responses.length);
    const consistencyFactor = this.calculateConsistency(scores);
    const completnessFactor = Math.min(responses.length / 10, 1); // Assume 10 is optimal

    const confidence =
      (sampleSizeFactor * 0.4 + consistencyFactor * 0.4 + completnessFactor * 0.2) * 100;

    return Math.min(Math.max(confidence, 0), 100);
  }

  /**
   * Calculate confidence interval
   */
  calculateConfidenceInterval(score, confidence, scores) {
    let margin = 15; // Default margin of error

    // Find appropriate confidence level
    for (const [level, config] of Object.entries(this.confidenceLevels)) {
      if (confidence >= config.threshold) {
        margin = config.margin;
        break;
      }
    }

    // Adjust margin based on score variance
    if (scores.length > 1) {
      const variance = this.calculateVariance(scores);
      margin = margin * (1 + variance / 100);
    }

    return {
      lower: Math.max(0, score - margin),
      upper: Math.min(100, score + margin)
    };
  }

  /**
   * Normalize score to 0-100 range
   */
  normalizeScore(score) {
    // Assuming input is 1-5 scale
    return ((score - 1) / 4) * 100;
  }

  /**
   * Find similar responses for consistency checking
   */
  findSimilarResponses(response, allResponses) {
    return allResponses.filter(
      r => r !== response && this.questionsSimilar(response.question, r.question)
    );
  }

  /**
   * Check if two questions are similar
   */
  questionsSimilar(q1, q2) {
    if (!q1 || !q2) return false;

    const words1 = q1.toLowerCase().split(' ');
    const words2 = q2.toLowerCase().split(' ');

    const commonWords = words1.filter(w => words2.includes(w));
    const similarity = commonWords.length / Math.max(words1.length, words2.length);

    return similarity > 0.5;
  }

  /**
   * Check response consistency
   */
  checkResponseConsistency(response, similarResponses) {
    if (similarResponses.length === 0) return 1;

    const responseScore = this.normalizeScore(response.score || response.answer || 3);
    const similarScores = similarResponses.map(r => this.normalizeScore(r.score || r.answer || 3));

    const avgSimilar = similarScores.reduce((sum, s) => sum + s, 0) / similarScores.length;
    const difference = Math.abs(responseScore - avgSimilar);

    return 1 - difference / 100;
  }

  /**
   * Calculate consistency of scores
   */
  calculateConsistency(scores) {
    if (scores.length <= 1) return 1;

    const variance = this.calculateVariance(scores);
    const maxVariance = 50; // Maximum expected variance

    return Math.max(0, 1 - variance / maxVariance);
  }

  /**
   * Get sample size factor
   */
  getSampleSizeFactor(size) {
    for (const [level, config] of Object.entries(this.sampleSizeFactors)) {
      if (size >= config.min) {
        return config.multiplier;
      }
    }
    return 0.3;
  }

  /**
   * Assess overall reliability
   */
  assessReliability(scores, responses) {
    const consistency = this.calculateConsistency(scores);
    const sampleSize = responses.length;

    if (sampleSize >= 15 && consistency > 0.8) return 'Very High';
    if (sampleSize >= 10 && consistency > 0.6) return 'High';
    if (sampleSize >= 5 && consistency > 0.4) return 'Moderate';
    if (sampleSize >= 3 && consistency > 0.2) return 'Low';
    return 'Very Low';
  }

  /**
   * Initialize Big Five sub-dimensions for deeper analysis
   */
  initializeSubDimensions() {
    this.subDimensions = {
      openness: {
        intellectualCuriosity: {
          name: 'Intellectual Curiosity',
          description: 'Drive to understand complex ideas and systems',
          indicators: ['enjoys learning', 'asks questions', 'seeks knowledge'],
          weight: 0.3
        },
        aestheticSensitivity: {
          name: 'Aesthetic Sensitivity',
          description: 'Appreciation for art, beauty, and creative expression',
          indicators: ['appreciates art', 'notices beauty', 'values creativity'],
          weight: 0.25
        },
        imagination: {
          name: 'Imagination',
          description: 'Tendency to create rich mental worlds and possibilities',
          indicators: ['daydreams', 'visualizes scenarios', 'creative thinking'],
          weight: 0.25
        },
        willingnessToExperiment: {
          name: 'Willingness to Experiment',
          description: 'Comfort with trying new approaches and experiences',
          indicators: ['tries new things', 'takes risks', 'embraces change'],
          weight: 0.2
        }
      },

      conscientiousness: {
        organization: {
          name: 'Organization',
          description: 'Ability to create and maintain structured systems',
          indicators: ['keeps things tidy', 'plans ahead', 'systematic approach'],
          weight: 0.25
        },
        selfDiscipline: {
          name: 'Self-Discipline',
          description: 'Capacity to persist despite challenges or distractions',
          indicators: ['follows through', 'resists temptation', 'stays focused'],
          weight: 0.3
        },
        achievementStriving: {
          name: 'Achievement-Striving',
          description: 'Drive to accomplish goals and excel',
          indicators: ['sets high standards', 'works hard', 'seeks success'],
          weight: 0.25
        },
        cautiousness: {
          name: 'Cautiousness',
          description: 'Tendency to think before acting',
          indicators: ['considers consequences', 'avoids risks', 'careful planning'],
          weight: 0.2
        }
      },

      extraversion: {
        sociability: {
          name: 'Sociability',
          description: 'Enjoyment of social interactions and company',
          indicators: ['seeks company', 'enjoys parties', 'likes groups'],
          weight: 0.3
        },
        assertiveness: {
          name: 'Assertiveness',
          description: 'Tendency to take charge and express opinions',
          indicators: ['speaks up', 'takes lead', 'expresses views'],
          weight: 0.25
        },
        energyLevel: {
          name: 'Energy Level',
          description: 'General activity level and enthusiasm',
          indicators: ['high energy', 'stays active', 'enthusiastic'],
          weight: 0.25
        },
        positiveEmotions: {
          name: 'Positive Emotions',
          description: 'Tendency to experience and express joy',
          indicators: ['cheerful', 'optimistic', 'laughs easily'],
          weight: 0.2
        }
      },

      agreeableness: {
        trust: {
          name: 'Trust',
          description: "Belief in others' good intentions",
          indicators: ['assumes best', 'trusts easily', 'sees good in others'],
          weight: 0.2
        },
        cooperation: {
          name: 'Cooperation',
          description: 'Willingness to work with others harmoniously',
          indicators: ['compromises', 'avoids conflict', 'team player'],
          weight: 0.25
        },
        altruism: {
          name: 'Altruism',
          description: "Genuine concern for others' welfare",
          indicators: ['helps others', 'generous', 'caring'],
          weight: 0.3
        },
        modesty: {
          name: 'Modesty',
          description: 'Humility and lack of pretension',
          indicators: ['humble', "doesn't boast", 'down-to-earth'],
          weight: 0.15
        },
        sympathy: {
          name: 'Sympathy',
          description: "Emotional responsiveness to others' feelings",
          indicators: ['empathetic', 'compassionate', 'understanding'],
          weight: 0.1
        }
      },

      neuroticism: {
        anxiety: {
          name: 'Anxiety',
          description: 'Tendency to worry and feel nervous',
          indicators: ['worries', 'feels tense', 'anticipates problems'],
          weight: 0.25
        },
        anger: {
          name: 'Anger',
          description: 'Propensity for frustration and irritation',
          indicators: ['gets frustrated', 'irritable', 'quick to anger'],
          weight: 0.2
        },
        depression: {
          name: 'Depression',
          description: 'Susceptibility to feelings of sadness',
          indicators: ['feels down', 'pessimistic', 'low mood'],
          weight: 0.25
        },
        selfConsciousness: {
          name: 'Self-Consciousness',
          description: "Sensitivity to others' opinions",
          indicators: ['easily embarrassed', 'self-aware', 'concerned with image'],
          weight: 0.15
        },
        vulnerability: {
          name: 'Vulnerability',
          description: 'Difficulty coping with stress',
          indicators: ['overwhelmed easily', 'stress sensitivity', 'needs support'],
          weight: 0.15
        }
      }
    };
  }

  /**
   * Initialize additional dimensions beyond Big Five
   */
  initializeAdditionalDimensions() {
    this.additionalDimensions = {
      emotionalIntelligence: {
        selfAwareness: {
          name: 'Self-Awareness',
          description: 'Understanding of own emotions and motivations',
          weight: 0.25
        },
        selfRegulation: {
          name: 'Self-Regulation',
          description: 'Ability to manage emotional responses',
          weight: 0.25
        },
        motivation: {
          name: 'Intrinsic Motivation',
          description: 'Internal drive to achieve and improve',
          weight: 0.2
        },
        empathy: {
          name: 'Empathy',
          description: "Ability to understand others' emotions",
          weight: 0.15
        },
        socialSkills: {
          name: 'Social Skills',
          description: 'Effectiveness in managing relationships',
          weight: 0.15
        }
      },

      cognitivePatterns: {
        analyticalThinking: {
          name: 'Analytical Thinking',
          description: 'Logical, systematic problem-solving approach',
          weight: 0.3
        },
        creativeThinking: {
          name: 'Creative Thinking',
          description: 'Ability to generate novel ideas and solutions',
          weight: 0.3
        },
        practicalThinking: {
          name: 'Practical Thinking',
          description: 'Focus on real-world applications and results',
          weight: 0.2
        },
        strategicThinking: {
          name: 'Strategic Thinking',
          description: 'Long-term planning and big-picture perspective',
          weight: 0.2
        }
      },

      communicationStyle: {
        directness: {
          name: 'Directness',
          description: 'Straightforward vs diplomatic communication',
          weight: 0.3
        },
        formality: {
          name: 'Formality',
          description: 'Professional vs casual communication preference',
          weight: 0.2
        },
        detailOrientation: {
          name: 'Detail Orientation',
          description: 'Specific vs general information preference',
          weight: 0.25
        },
        emotionalExpression: {
          name: 'Emotional Expression',
          description: 'Open vs reserved emotional communication',
          weight: 0.25
        }
      },

      workPreferences: {
        autonomy: {
          name: 'Autonomy',
          description: 'Preference for independent vs guided work',
          weight: 0.3
        },
        structure: {
          name: 'Structure',
          description: 'Need for clear guidelines vs flexibility',
          weight: 0.25
        },
        collaboration: {
          name: 'Collaboration',
          description: 'Team vs individual work preference',
          weight: 0.25
        },
        innovation: {
          name: 'Innovation',
          description: 'Creating new vs improving existing',
          weight: 0.2
        }
      },

      stressResponse: {
        copingMechanisms: {
          name: 'Coping Mechanisms',
          description: 'Strategies for managing stress',
          weight: 0.3
        },
        resilience: {
          name: 'Resilience',
          description: 'Ability to bounce back from setbacks',
          weight: 0.3
        },
        triggerSensitivity: {
          name: 'Trigger Sensitivity',
          description: 'Reactivity to stress triggers',
          weight: 0.2
        },
        recoverySpeed: {
          name: 'Recovery Speed',
          description: 'Time needed to return to baseline',
          weight: 0.2
        }
      }
    };
  }

  /**
   * Initialize trait interaction patterns
   */
  initializeInteractionPatterns() {
    this.interactionPatterns = {
      creative_disciplined: {
        traits: ['openness', 'conscientiousness'],
        threshold: { openness: 60, conscientiousness: 60 },
        name: 'Strategic Innovator',
        description: 'Combines creativity with execution ability'
      },
      social_caring: {
        traits: ['extraversion', 'agreeableness'],
        threshold: { extraversion: 60, agreeableness: 60 },
        name: 'People Champion',
        description: 'Natural leader who genuinely cares about others'
      },
      analytical_social: {
        traits: ['openness', 'extraversion'],
        threshold: { openness: 60, extraversion: 60 },
        name: 'Collaborative Thinker',
        description: 'Explores ideas through social interaction'
      },
      stable_leader: {
        traits: ['conscientiousness', 'neuroticism'],
        threshold: { conscientiousness: 70, neuroticism: 30 },
        name: 'Steady Commander',
        description: 'Reliable leadership under pressure'
      },
      empathetic_introvert: {
        traits: ['agreeableness', 'extraversion'],
        threshold: { agreeableness: 70, extraversion: 30 },
        name: 'Quiet Supporter',
        description: 'Provides deep, one-on-one support'
      }
    };
  }

  /**
   * Analyze traits with sub-dimensions
   */
  analyzeWithSubDimensions(responses, primaryTraits) {
    const analysis = {
      primaryTraits: { ...primaryTraits },
      subDimensions: {},
      additionalDimensions: {},
      interactionPatterns: [],
      insights: []
    };

    // Analyze Big Five sub-dimensions
    Object.keys(this.subDimensions).forEach(trait => {
      analysis.subDimensions[trait] = this.analyzeSubDimension(
        trait,
        responses,
        primaryTraits[trait]
      );
    });

    // Analyze additional dimensions
    Object.keys(this.additionalDimensions).forEach(dimension => {
      analysis.additionalDimensions[dimension] = this.analyzeAdditionalDimension(
        dimension,
        responses,
        primaryTraits
      );
    });

    // Detect interaction patterns
    analysis.interactionPatterns = this.detectInteractionPatterns(primaryTraits);

    // Generate insights
    analysis.insights = this.generateDeepInsights(analysis);

    return analysis;
  }

  /**
   * Analyze sub-dimensions of a trait
   */
  analyzeSubDimension(trait, responses, traitScore) {
    const subDims = this.subDimensions[trait];
    const analysis = {
      overall: traitScore,
      subScores: {},
      dominantFacet: null,
      weakestFacet: null,
      balance: 0
    };

    // Calculate sub-dimension scores
    Object.entries(subDims).forEach(([key, subDim]) => {
      const score = this.calculateSubDimensionScore(responses, trait, key, subDim);
      analysis.subScores[key] = {
        score,
        name: subDim.name,
        description: subDim.description,
        level: this.getLevel(score)
      };
    });

    // Identify dominant and weakest facets
    const sorted = Object.entries(analysis.subScores).sort((a, b) => b[1].score - a[1].score);

    analysis.dominantFacet = sorted[0][0];
    analysis.weakestFacet = sorted[sorted.length - 1][0];

    // Calculate balance (how evenly distributed sub-dimensions are)
    const scores = Object.values(analysis.subScores).map(s => s.score);
    analysis.balance = 100 - this.calculateVariance(scores);

    return analysis;
  }

  /**
   * Calculate sub-dimension score
   */
  calculateSubDimensionScore(responses, trait, subDimKey, subDim) {
    // Filter responses relevant to this sub-dimension
    const relevantResponses = responses.filter(r => {
      const questionTrait = (r.trait || r.category || '').toLowerCase();
      if (questionTrait !== trait) return false;

      // Check if question relates to this sub-dimension
      // In production, this would check against question metadata
      return this.isRelevantToSubDimension(r, subDim.indicators);
    });

    if (relevantResponses.length === 0) {
      // Estimate from main trait score
      return this.estimateSubDimensionFromTrait(trait, subDimKey);
    }

    // Calculate weighted average
    const totalScore = relevantResponses.reduce((sum, r) => {
      const score = parseInt(r.score || r.answer || r.response || 3);
      return sum + score;
    }, 0);

    return Math.round((totalScore / relevantResponses.length - 1) * 25);
  }

  /**
   * Check if response is relevant to sub-dimension
   */
  isRelevantToSubDimension(response, indicators) {
    // In production, this would check question metadata
    // For now, use a simplified check
    const questionText = String(response.question || response.questionText || '');
    return indicators.some(indicator =>
      questionText.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  /**
   * Estimate sub-dimension from main trait
   */
  estimateSubDimensionFromTrait(trait, subDimKey) {
    // Simplified estimation - in production would use ML model
    const variance = Math.random() * 10 - 5;
    return Math.max(0, Math.min(100, 50 + variance));
  }

  /**
   * Analyze additional dimensions
   */
  analyzeAdditionalDimension(dimension, responses, primaryTraits) {
    const dims = this.additionalDimensions[dimension];
    const analysis = {
      overall: 0,
      subScores: {},
      interpretation: ''
    };

    // Calculate scores for each sub-component
    Object.entries(dims).forEach(([key, subDim]) => {
      const score = this.calculateAdditionalDimensionScore(
        key,
        responses,
        primaryTraits,
        dimension
      );

      analysis.subScores[key] = {
        score,
        name: subDim.name,
        description: subDim.description,
        level: this.getLevel(score)
      };
    });

    // Calculate overall score
    const totalWeight = Object.values(dims).reduce((sum, d) => sum + d.weight, 0);
    analysis.overall =
      Object.entries(analysis.subScores).reduce((sum, [key, data]) => {
        return sum + data.score * dims[key].weight;
      }, 0) / totalWeight;

    // Generate interpretation
    analysis.interpretation = this.interpretDimension(dimension, analysis.overall);

    return analysis;
  }

  /**
   * Calculate score for additional dimension component
   */
  calculateAdditionalDimensionScore(component, responses, traits, dimension) {
    // Map Big Five traits to additional dimensions
    const mappings = {
      emotionalIntelligence: {
        selfAwareness: { openness: 0.4, neuroticism: -0.3, conscientiousness: 0.3 },
        selfRegulation: { conscientiousness: 0.5, neuroticism: -0.5 },
        motivation: { conscientiousness: 0.6, extraversion: 0.4 },
        empathy: { agreeableness: 0.7, openness: 0.3 },
        socialSkills: { extraversion: 0.5, agreeableness: 0.5 }
      },
      cognitivePatterns: {
        analyticalThinking: { openness: 0.3, conscientiousness: 0.7 },
        creativeThinking: { openness: 0.8, extraversion: 0.2 },
        practicalThinking: { conscientiousness: 0.6, openness: -0.2, neuroticism: -0.2 },
        strategicThinking: { openness: 0.5, conscientiousness: 0.5 }
      },
      communicationStyle: {
        directness: { extraversion: 0.4, agreeableness: -0.3, conscientiousness: 0.3 },
        formality: { conscientiousness: 0.6, openness: -0.2, extraversion: -0.2 },
        detailOrientation: { conscientiousness: 0.7, openness: 0.3 },
        emotionalExpression: { extraversion: 0.5, agreeableness: 0.3, neuroticism: 0.2 }
      },
      workPreferences: {
        autonomy: { openness: 0.4, extraversion: -0.3, conscientiousness: 0.3 },
        structure: { conscientiousness: 0.7, openness: -0.3 },
        collaboration: { extraversion: 0.6, agreeableness: 0.4 },
        innovation: { openness: 0.8, conscientiousness: 0.2 }
      },
      stressResponse: {
        copingMechanisms: { conscientiousness: 0.4, openness: 0.3, neuroticism: -0.3 },
        resilience: { neuroticism: -0.6, conscientiousness: 0.4 },
        triggerSensitivity: { neuroticism: 0.8, agreeableness: 0.2 },
        recoverySpeed: { neuroticism: -0.5, extraversion: 0.3, conscientiousness: 0.2 }
      }
    };

    const mapping = mappings[dimension]?.[component] || {};
    let score = 50; // Base score

    // Calculate based on trait mappings
    Object.entries(mapping).forEach(([trait, weight]) => {
      const traitScore = traits[trait] || 50;
      score += (traitScore - 50) * weight;
    });

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Detect interaction patterns between traits
   */
  detectInteractionPatterns(traits) {
    const detected = [];

    Object.entries(this.interactionPatterns).forEach(([key, pattern]) => {
      let matches = true;

      Object.entries(pattern.threshold).forEach(([trait, threshold]) => {
        if (pattern.threshold[trait] > 50) {
          if (traits[trait] < threshold) matches = false;
        } else {
          if (traits[trait] > threshold) matches = false;
        }
      });

      if (matches) {
        detected.push({
          pattern: key,
          name: pattern.name,
          description: pattern.description,
          strength: this.calculatePatternStrength(traits, pattern)
        });
      }
    });

    return detected;
  }

  /**
   * Calculate strength of an interaction pattern
   */
  calculatePatternStrength(traits, pattern) {
    let totalDiff = 0;
    let count = 0;

    Object.entries(pattern.threshold).forEach(([trait, threshold]) => {
      totalDiff += Math.abs(traits[trait] - threshold);
      count++;
    });

    const avgDiff = totalDiff / count;
    return Math.max(0, 100 - avgDiff);
  }

  /**
   * Generate deep insights from analysis
   */
  generateDeepInsights(analysis) {
    const insights = [];

    // Sub-dimension insights
    if (analysis.subDimensionScores) {
      Object.entries(analysis.subDimensionScores).forEach(([trait, subScores]) => {
        // Create subAnalysis structure for compatibility
        const scores = Object.entries(subScores);
        if (scores.length > 0) {
          const sortedScores = scores.sort((a, b) => b[1] - a[1]);
          const subAnalysis = {
            dominantFacet: sortedScores[0][0],
            weakestFacet: sortedScores[sortedScores.length - 1][0],
            subScores: Object.fromEntries(
              scores.map(([key, value]) => [key, { name: key, score: value }])
            )
          };

          const dominant = subAnalysis.subScores[subAnalysis.dominantFacet];
          const weakest = subAnalysis.subScores[subAnalysis.weakestFacet];

          if (dominant.score - weakest.score > 30) {
            insights.push({
              type: 'sub_dimension_contrast',
              trait,
              insight:
                `Within ${trait}, you show strong ${dominant.name} (${Math.round(dominant.score)}%) ` +
                `but lower ${weakest.name} (${Math.round(weakest.score)}%). ` +
                `This suggests ${this.interpretSubDimensionContrast(trait, subAnalysis.dominantFacet, subAnalysis.weakestFacet)}.`,
              confidence: 0.85
            });
          }
        }
      });
    }

    // Handle old format if present
    if (analysis.subDimensions) {
      Object.entries(analysis.subDimensions).forEach(([trait, subAnalysis]) => {
        const dominant = subAnalysis.subScores[subAnalysis.dominantFacet];
        const weakest = subAnalysis.subScores[subAnalysis.weakestFacet];

        if (dominant.score - weakest.score > 30) {
          insights.push({
            type: 'sub_dimension_contrast',
            trait,
            insight:
              `Within ${trait}, you show strong ${dominant.name} (${dominant.score}%) ` +
              `but lower ${weakest.name} (${weakest.score}%). ` +
              `This suggests ${this.interpretSubDimensionContrast(trait, subAnalysis.dominantFacet, subAnalysis.weakestFacet)}.`,
            confidence: 0.85
          });
        }

        if (subAnalysis.balance > 80) {
          insights.push({
            type: 'balanced_trait',
            trait,
            insight:
              `Your ${trait} shows remarkable balance across all facets, ` +
              `indicating well-rounded development in this area.`,
            confidence: 0.8
          });
        }
      });
    }

    // Interaction pattern insights
    if (analysis.interactions && analysis.interactions.length > 0) {
      analysis.interactions.forEach(pattern => {
        if (pattern.strength > 70) {
          insights.push({
            type: 'trait_interaction',
            pattern: pattern.pattern,
            insight:
              `You exhibit the "${pattern.name}" pattern: ${pattern.description}. ` +
              `This combination is found in approximately ${this.getPatternRarity(pattern.pattern)}% of people.`,
            confidence: 0.9
          });
        }
      });
    }

    // Additional dimension insights
    if (analysis.additionalDimensions) {
      Object.entries(analysis.additionalDimensions).forEach(([dimension, dimAnalysis]) => {
        if (dimAnalysis.overall > 75) {
          insights.push({
            type: 'strength_area',
            dimension,
            insight:
              `Exceptionally high ${this.getDimensionName(dimension)} (${Math.round(dimAnalysis.overall)}%). ` +
              dimAnalysis.interpretation,
            confidence: 0.85
          });
        } else if (dimAnalysis.overall < 25) {
          insights.push({
            type: 'development_area',
            dimension,
            insight:
              `Opportunity to develop ${this.getDimensionName(dimension)} (${Math.round(dimAnalysis.overall)}%). ` +
              dimAnalysis.interpretation,
            confidence: 0.85
          });
        }
      });
    }

    return insights;
  }

  /**
   * Interpret sub-dimension contrast
   */
  interpretSubDimensionContrast(trait, dominant, weakest) {
    const interpretations = {
      openness: {
        intellectualCuriosity_aestheticSensitivity:
          'you prefer understanding concepts over experiencing beauty',
        imagination_willingnessToExperiment:
          'you have rich inner world but prefer familiar external experiences'
      },
      conscientiousness: {
        selfDiscipline_organization:
          'you persist through challenges but may lack systematic approaches',
        achievementStriving_cautiousness: "you aim high but may take risks others wouldn't"
      }
      // Add more interpretations as needed
    };

    const key = `${dominant}_${weakest}`;
    return interpretations[trait]?.[key] || 'a unique pattern in how this trait manifests';
  }

  /**
   * Get pattern rarity percentage
   */
  getPatternRarity(pattern) {
    const rarities = {
      creative_disciplined: 5,
      social_caring: 15,
      analytical_social: 10,
      stable_leader: 8,
      empathetic_introvert: 12
    };
    return rarities[pattern] || 20;
  }

  /**
   * Get dimension display name
   */
  getDimensionName(dimension) {
    const names = {
      emotionalIntelligence: 'Emotional Intelligence',
      cognitivePatterns: 'Cognitive Patterns',
      communicationStyle: 'Communication Style',
      workPreferences: 'Work Preferences',
      stressResponse: 'Stress Response'
    };
    return names[dimension] || dimension;
  }

  /**
   * Interpret dimension score
   */
  interpretDimension(dimension, score) {
    const interpretations = {
      emotionalIntelligence: {
        high: "You excel at understanding and managing emotions, both yours and others'.",
        medium: 'You have moderate emotional awareness with room for growth.',
        low: 'Developing emotional skills could significantly enhance your relationships.'
      },
      cognitivePatterns: {
        high: 'Your thinking style is highly developed and adaptable.',
        medium: 'You show balanced cognitive abilities across different domains.',
        low: 'Focusing on cognitive development could unlock new capabilities.'
      },
      communicationStyle: {
        high: 'You communicate effectively across various contexts and audiences.',
        medium: 'Your communication is generally effective with some areas for refinement.',
        low: 'Enhancing communication skills could improve your personal and professional relationships.'
      },
      workPreferences: {
        high: 'You have clear work preferences that align with high performance.',
        medium: 'You show flexibility in work approaches with some preferences.',
        low: 'Understanding your work preferences better could improve satisfaction.'
      },
      stressResponse: {
        high: 'You manage stress exceptionally well with effective coping strategies.',
        medium: 'You have moderate stress resilience with typical responses.',
        low: 'Developing stress management skills could improve your wellbeing.'
      }
    };

    const level = score > 70 ? 'high' : score > 30 ? 'medium' : 'low';
    return interpretations[dimension]?.[level] || '';
  }

  /**
   * Get level description
   */
  getLevel(score) {
    if (score >= 80) return 'Very High';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Moderate';
    if (score >= 20) return 'Low';
    return 'Very Low';
  }

  /**
   * Calculate variance
   */
  calculateVariance(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length);
  }

  /**
   * Calculate sub-dimensions for a trait
   */
  calculateSubDimensions(trait, baseScore, responses = []) {
    const subDims = {};

    if (this.subDimensions[trait]) {
      Object.entries(this.subDimensions[trait]).forEach(([dimension, config]) => {
        // Calculate score based on base trait score with variation
        let dimScore = baseScore;

        // Add variation based on dimension weight
        const variation = (Math.random() - 0.5) * 20 * config.weight;
        dimScore = Math.max(0, Math.min(100, baseScore + variation));

        // Adjust based on responses if available
        if (responses.length > 0) {
          const relevantResponses = responses.filter(r => r.trait === trait && Math.random() > 0.5);
          if (relevantResponses.length > 0) {
            const avgResponse =
              relevantResponses.reduce((sum, r) => sum + (r.score || 3), 0) /
              relevantResponses.length;
            dimScore = dimScore * 0.7 + (avgResponse - 1) * 25 * 0.3;
          }
        }

        subDims[dimension] = Math.round(dimScore);
      });
    }

    return subDims;
  }

  /**
   * Calculate additional psychological dimensions
   */
  calculateAdditionalDimensions(traits, responses = []) {
    const dimensions = {};

    // Emotional Intelligence
    dimensions.emotionalIntelligence = {
      score: Math.round(
        traits.agreeableness * 0.4 +
          (100 - traits.neuroticism) * 0.3 +
          traits.conscientiousness * 0.3
      ),
      description: 'Ability to understand and manage emotions effectively'
    };

    // Cognitive Patterns
    dimensions.cognitiveFlexibility = {
      score: Math.round(traits.openness * 0.6 + (100 - traits.neuroticism) * 0.4),
      description: 'Adaptability in thinking and problem-solving approaches'
    };

    // Communication Style
    dimensions.communicationStyle = {
      score: Math.round(
        traits.extraversion * 0.5 + traits.agreeableness * 0.3 + traits.openness * 0.2
      ),
      description:
        traits.extraversion > 50
          ? 'Expressive and outgoing communication'
          : 'Thoughtful and reserved communication'
    };

    // Work Preferences
    dimensions.workStyle = {
      score: Math.round(
        traits.conscientiousness * 0.5 + traits.extraversion * 0.25 + traits.openness * 0.25
      ),
      description:
        traits.conscientiousness > 60
          ? 'Structured and goal-oriented work approach'
          : 'Flexible and adaptive work approach'
    };

    // Stress Response
    dimensions.stressResilience = {
      score: Math.round(
        (100 - traits.neuroticism) * 0.6 +
          traits.conscientiousness * 0.2 +
          traits.extraversion * 0.2
      ),
      description:
        traits.neuroticism < 40
          ? 'High resilience to stress and pressure'
          : 'Sensitive to environmental stressors'
    };

    return dimensions;
  }

  /**
   * Analyze interactions between traits
   */
  analyzeTraitInteractions(traits) {
    const interactions = [];

    // Openness + Conscientiousness
    if (traits.openness > 60 && traits.conscientiousness > 60) {
      interactions.push({
        type: 'synergy',
        traits: ['openness', 'conscientiousness'],
        impact: 'positive',
        description: 'Creative discipline - innovative yet methodical approach',
        strength: Math.min(traits.openness, traits.conscientiousness) / 100
      });
    }

    // Extraversion + Agreeableness
    if (traits.extraversion > 60 && traits.agreeableness > 60) {
      interactions.push({
        type: 'synergy',
        traits: ['extraversion', 'agreeableness'],
        impact: 'positive',
        description: 'Social magnetism - naturally influential in groups',
        strength: Math.min(traits.extraversion, traits.agreeableness) / 100
      });
    }

    // Low Extraversion + High Conscientiousness
    if (traits.extraversion < 40 && traits.conscientiousness > 60) {
      interactions.push({
        type: 'complementary',
        traits: ['extraversion', 'conscientiousness'],
        impact: 'positive',
        description: 'Deep focus - exceptional individual productivity',
        strength: traits.conscientiousness / 100
      });
    }

    // High Neuroticism + Low Conscientiousness
    if (traits.neuroticism > 60 && traits.conscientiousness < 40) {
      interactions.push({
        type: 'tension',
        traits: ['neuroticism', 'conscientiousness'],
        impact: 'challenging',
        description: 'May experience stress from lack of structure',
        strength: traits.neuroticism / 100
      });
    }

    // High Openness + Low Agreeableness
    if (traits.openness > 60 && traits.agreeableness < 40) {
      interactions.push({
        type: 'unique',
        traits: ['openness', 'agreeableness'],
        impact: 'distinctive',
        description: 'Independent innovator - original thinking without conformity',
        strength: traits.openness / 100
      });
    }

    return interactions;
  }

  /**
   * Main analysis method for trait analysis
   */
  analyzeTraits(traits, responses = []) {
    const analysis = {
      subDimensionScores: {},
      additionalDimensions: {},
      interactions: [],
      insights: []
    };

    // Calculate sub-dimensions for each Big Five trait
    Object.entries(traits).forEach(([trait, score]) => {
      if (this.subDimensions[trait]) {
        analysis.subDimensionScores[trait] = this.calculateSubDimensions(trait, score, responses);
      }
    });

    // Calculate additional dimensions
    analysis.additionalDimensions = this.calculateAdditionalDimensions(traits, responses);

    // Analyze trait interactions
    analysis.interactions = this.analyzeTraitInteractions(traits);

    // Generate deep insights
    analysis.insights = this.generateDeepInsights(traits, analysis);

    return analysis;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedTraitAnalyzer;
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
  window.EnhancedTraitAnalyzer = EnhancedTraitAnalyzer;
}
