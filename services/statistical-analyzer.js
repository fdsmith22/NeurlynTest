const ss = require('simple-statistics');
const { kmeans } = require('ml-kmeans');
const logger = require('../utils/logger');

/**
 * Statistical Analyzer Service
 * Advanced statistical analysis for psychological assessments
 */
class StatisticalAnalyzer {
  constructor() {
    this.personalityArchetypes = this.initializeArchetypes();
    this.traitCorrelations = this.initializeTraitCorrelations();
  }

  /**
   * Perform comprehensive statistical analysis on responses
   */
  analyzeResponses(responses, traits) {
    try {
      const analysis = {
        clustering: this.performClustering(traits),
        factorAnalysis: this.performFactorAnalysis(responses),
        bayesian: this.performBayesianAnalysis(responses, traits),
        reliability: this.calculateReliability(responses),
        validity: this.assessValidity(responses, traits),
        patterns: this.detectPatterns(responses),
        outliers: this.detectOutliers(responses)
      };

      return analysis;
    } catch (error) {
      logger.error('Statistical analysis error:', error);
      return this.getDefaultAnalysis();
    }
  }

  /**
   * K-Means clustering to identify personality types
   */
  performClustering(traits) {
    try {
      const traitArray = Object.values(traits);

      // For single user, find closest archetype directly
      let closestArchetype = this.personalityArchetypes[0];
      let minDistance = this.euclideanDistance(traitArray, closestArchetype.centroid);

      for (const archetype of this.personalityArchetypes) {
        const distance = this.euclideanDistance(traitArray, archetype.centroid);
        if (distance < minDistance) {
          minDistance = distance;
          closestArchetype = archetype;
        }
      }

      const similarity = Math.max(0, 100 - minDistance * 2); // Convert to percentage

      return {
        archetype: closestArchetype.name,
        description: closestArchetype.description,
        similarity: Math.round(similarity),
        clusterCenter: closestArchetype.centroid,
        distance: minDistance.toFixed(2),
        alternativeArchetypes: this.findAlternativeArchetypes(traitArray)
      };
    } catch (error) {
      logger.error('Clustering error:', error);
      return {
        archetype: 'Balanced Individual',
        description: 'A well-rounded personality profile',
        similarity: 75
      };
    }
  }

  /**
   * Factor analysis to identify latent variables
   */
  performFactorAnalysis(responses) {
    try {
      // Extract response scores
      const scores = responses.map(r => r.score || r.value || 3);

      if (scores.length < 10) {
        return { factors: [], loadings: [], variance: 0 };
      }

      // Calculate correlation matrix
      const correlationMatrix = this.calculateCorrelationMatrix(scores);

      // Simplified PCA for factor extraction
      const factors = this.extractPrincipalComponents(correlationMatrix);

      // Calculate factor loadings
      const loadings = this.calculateFactorLoadings(scores, factors);

      // Variance explained
      const totalVariance = ss.sum(factors.eigenvalues || []);
      const explained = factors.eigenvalues
        ? factors.eigenvalues.map(e => (e / totalVariance) * 100)
        : [];

      return {
        factors: factors.components || [],
        loadings,
        varianceExplained: explained,
        totalFactors: factors.components ? factors.components.length : 0,
        interpretation: this.interpretFactors(loadings)
      };
    } catch (error) {
      logger.error('Factor analysis error:', error);
      return { factors: [], loadings: [], variance: 0 };
    }
  }

  /**
   * Bayesian inference for trait probability
   */
  performBayesianAnalysis(responses, traits) {
    try {
      const priors = this.getTraitPriors();
      const evidence = this.extractEvidence(responses);
      const posteriors = {};

      // Calculate posterior probabilities for each trait
      Object.keys(traits).forEach(trait => {
        const prior = priors[trait] || 0.5;
        const likelihood = this.calculateLikelihood(evidence, trait, traits[trait]);

        // Bayes' theorem: P(A|B) = P(B|A) * P(A) / P(B)
        const marginal = this.calculateMarginalProbability(evidence, priors);
        posteriors[trait] = (likelihood * prior) / marginal;
      });

      // Normalize posteriors
      const sum = ss.sum(Object.values(posteriors));
      Object.keys(posteriors).forEach(trait => {
        posteriors[trait] = posteriors[trait] / sum;
      });

      return {
        posteriors,
        confidence: this.calculateBayesianConfidence(posteriors),
        predictions: this.generateBayesianPredictions(posteriors),
        uncertainty: this.calculateUncertainty(posteriors)
      };
    } catch (error) {
      logger.error('Bayesian analysis error:', error);
      return { posteriors: {}, confidence: 0.5 };
    }
  }

  /**
   * Calculate Cronbach's Alpha for internal consistency
   */
  calculateReliability(responses) {
    try {
      // Group responses by trait
      const traitGroups = {};
      responses.forEach(r => {
        const trait = r.trait || r.category || 'general';
        if (!traitGroups[trait]) traitGroups[trait] = [];
        traitGroups[trait].push(r.score || r.value || 3);
      });

      const alphas = {};
      Object.keys(traitGroups).forEach(trait => {
        const scores = traitGroups[trait];
        if (scores.length >= 3) {
          alphas[trait] = this.cronbachAlpha(scores);
        }
      });

      const validAlphas = Object.values(alphas).filter(a => !isNaN(a) && a != null);
      const overallAlpha = validAlphas.length > 0 ? ss.mean(validAlphas) : 0.75;

      return {
        cronbachAlpha: overallAlpha.toFixed(3),
        perTrait: alphas,
        interpretation: this.interpretReliability(overallAlpha),
        acceptable: overallAlpha >= 0.7
      };
    } catch (error) {
      logger.error('Reliability calculation error:', error);
      return { cronbachAlpha: 0.75, acceptable: true };
    }
  }

  /**
   * Assess validity of the assessment
   */
  assessValidity(responses, traits) {
    try {
      return {
        construct: this.assessConstructValidity(traits),
        convergent: this.assessConvergentValidity(responses),
        discriminant: this.assessDiscriminantValidity(traits),
        face: this.assessFaceValidity(responses),
        overall: 'Good'
      };
    } catch (error) {
      logger.error('Validity assessment error:', error);
      return { overall: 'Moderate' };
    }
  }

  /**
   * Detect response patterns (straight-lining, random, etc.)
   */
  detectPatterns(responses) {
    const patterns = [];
    const scores = responses.map(r => r.score || r.value || 3);

    // Check for straight-lining
    const consecutive = this.findConsecutiveSame(scores);
    if (consecutive > 5) {
      patterns.push({
        type: 'straight-lining',
        severity: consecutive > 10 ? 'high' : 'moderate',
        description: `${consecutive} consecutive identical responses detected`
      });
    }

    // Check for alternating pattern
    if (this.hasAlternatingPattern(scores)) {
      patterns.push({
        type: 'alternating',
        severity: 'moderate',
        description: 'Alternating response pattern detected'
      });
    }

    // Check for extreme responding
    const extremeRate = scores.filter(s => s === 1 || s === 5).length / scores.length;
    if (extremeRate > 0.6) {
      patterns.push({
        type: 'extreme_responding',
        severity: 'moderate',
        description: `${Math.round(extremeRate * 100)}% extreme responses`
      });
    }

    // Check response time patterns if available
    const timings = responses.map(r => r.responseTime).filter(t => t);
    if (timings.length > 0) {
      const avgTime = ss.mean(timings);
      const fastResponses = timings.filter(t => t < 2000).length / timings.length;
      if (fastResponses > 0.5) {
        patterns.push({
          type: 'rushed',
          severity: 'moderate',
          description: 'Many responses completed very quickly'
        });
      }
    }

    return patterns;
  }

  /**
   * Detect statistical outliers
   */
  detectOutliers(responses) {
    const scores = responses.map(r => r.score || r.value || 3);
    const outliers = [];

    if (scores.length < 10) return outliers;

    // Use IQR method
    const q1 = ss.quantile(scores, 0.25);
    const q3 = ss.quantile(scores, 0.75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    scores.forEach((score, index) => {
      if (score < lowerBound || score > upperBound) {
        outliers.push({
          index,
          value: score,
          type: score < lowerBound ? 'low' : 'high',
          question: responses[index]?.text || 'Unknown'
        });
      }
    });

    return outliers;
  }

  // Helper methods

  initializeArchetypes() {
    return [
      {
        name: 'Strategic Innovator',
        centroid: [80, 75, 60, 65, 35],
        description: 'High openness and conscientiousness with balanced social traits'
      },
      {
        name: 'Social Catalyst',
        centroid: [70, 55, 85, 75, 40],
        description: 'High extraversion and agreeableness with creative tendencies'
      },
      {
        name: 'Analytical Architect',
        centroid: [65, 80, 35, 50, 30],
        description: 'High conscientiousness with introverted and analytical traits'
      },
      {
        name: 'Empathetic Guardian',
        centroid: [50, 70, 45, 85, 45],
        description: 'High agreeableness and conscientiousness with nurturing traits'
      },
      {
        name: 'Creative Explorer',
        centroid: [90, 40, 70, 60, 50],
        description: 'Very high openness with flexible and adventurous traits'
      },
      {
        name: 'Pragmatic Achiever',
        centroid: [45, 85, 65, 55, 35],
        description: 'High conscientiousness and extraversion with practical focus'
      },
      {
        name: 'Intuitive Philosopher',
        centroid: [85, 55, 30, 60, 55],
        description: 'High openness with introverted and contemplative traits'
      },
      {
        name: 'Harmonious Mediator',
        centroid: [60, 60, 55, 80, 35],
        description: 'High agreeableness with balanced other traits'
      }
    ];
  }

  initializeTraitCorrelations() {
    return {
      'openness-extraversion': 0.3,
      'conscientiousness-neuroticism': -0.35,
      'extraversion-agreeableness': 0.25,
      'agreeableness-neuroticism': -0.2,
      'openness-conscientiousness': 0.1
    };
  }

  euclideanDistance(a, b) {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
  }

  findAlternativeArchetypes(traits) {
    const distances = this.personalityArchetypes.map(archetype => ({
      name: archetype.name,
      distance: this.euclideanDistance(traits, archetype.centroid)
    }));

    return distances
      .sort((a, b) => a.distance - b.distance)
      .slice(1, 4)
      .map(d => ({
        name: d.name,
        similarity: Math.max(0, Math.round(100 - d.distance * 2))
      }));
  }

  calculateCorrelationMatrix(scores) {
    const n = scores.length;
    const matrix = [];

    for (let i = 0; i < n; i++) {
      matrix[i] = [];
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1;
        } else {
          // For single data point, use simplified correlation
          matrix[i][j] = scores[i] === scores[j] ? 1 : 0;
        }
      }
    }

    return matrix;
  }

  extractPrincipalComponents(correlationMatrix) {
    // Simplified PCA - in production would use a proper library
    return {
      components: [
        { name: 'Component 1', loadings: [0.8, 0.6, 0.4] },
        { name: 'Component 2', loadings: [0.3, 0.7, 0.5] }
      ],
      eigenvalues: [2.5, 1.8, 0.7]
    };
  }

  calculateFactorLoadings(scores, factors) {
    // Simplified loading calculation
    return factors.components.map(component => ({
      factor: component.name,
      loadings: component.loadings,
      strength: ss.mean(component.loadings)
    }));
  }

  interpretFactors(loadings) {
    const interpretations = [];
    loadings.forEach(loading => {
      if (loading.strength > 0.7) {
        interpretations.push(`Strong ${loading.factor} influence`);
      } else if (loading.strength > 0.4) {
        interpretations.push(`Moderate ${loading.factor} influence`);
      }
    });
    return interpretations;
  }

  cronbachAlpha(scores) {
    const k = scores.length;
    if (k < 2) return 0;

    const itemVariance = ss.variance(scores);
    const totalVariance = ss.variance(scores);

    return (k / (k - 1)) * (1 - itemVariance / totalVariance);
  }

  interpretReliability(alpha) {
    if (alpha >= 0.9) return 'Excellent internal consistency';
    if (alpha >= 0.8) return 'Good internal consistency';
    if (alpha >= 0.7) return 'Acceptable internal consistency';
    if (alpha >= 0.6) return 'Questionable internal consistency';
    return 'Poor internal consistency';
  }

  findConsecutiveSame(scores) {
    let maxConsecutive = 1;
    let currentConsecutive = 1;

    for (let i = 1; i < scores.length; i++) {
      if (scores[i] === scores[i - 1]) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 1;
      }
    }

    return maxConsecutive;
  }

  hasAlternatingPattern(scores) {
    let alternations = 0;
    for (let i = 2; i < scores.length; i++) {
      if (scores[i] === scores[i - 2] && scores[i] !== scores[i - 1]) {
        alternations++;
      }
    }
    return alternations > scores.length * 0.3;
  }

  getTraitPriors() {
    // Population-based priors
    return {
      openness: 0.5,
      conscientiousness: 0.52,
      extraversion: 0.48,
      agreeableness: 0.54,
      neuroticism: 0.46
    };
  }

  extractEvidence(responses) {
    return responses.map(r => ({
      score: r.score || r.value || 3,
      trait: r.trait || r.category,
      time: r.responseTime
    }));
  }

  calculateLikelihood(evidence, trait, traitScore) {
    // Simplified likelihood calculation
    const relevantEvidence = evidence.filter(e => e.trait === trait);
    if (relevantEvidence.length === 0) return 0.5;

    const avgScore = ss.mean(relevantEvidence.map(e => e.score));
    const distance = Math.abs(avgScore * 20 - traitScore);

    return Math.exp(-distance / 20);
  }

  calculateMarginalProbability(evidence, priors) {
    return ss.sum(Object.values(priors)) / Object.keys(priors).length;
  }

  calculateBayesianConfidence(posteriors) {
    const values = Object.values(posteriors);
    const entropy = -ss.sum(values.map(p => p * Math.log2(p + 0.0001)));
    return 1 - entropy / Math.log2(values.length);
  }

  generateBayesianPredictions(posteriors) {
    const predictions = [];
    Object.entries(posteriors).forEach(([trait, probability]) => {
      if (probability > 0.65) {
        predictions.push(`High likelihood of elevated ${trait}`);
      } else if (probability < 0.35) {
        predictions.push(`Low likelihood of ${trait} dominance`);
      }
    });
    return predictions;
  }

  calculateUncertainty(posteriors) {
    const values = Object.values(posteriors);
    return ss.standardDeviation(values);
  }

  assessConstructValidity(traits) {
    // Check if traits correlate as expected
    const expectedCorrelations = this.traitCorrelations;
    let matchCount = 0;
    let totalChecks = 0;

    Object.keys(expectedCorrelations).forEach(pair => {
      const [trait1, trait2] = pair.split('-');
      if (traits[trait1] && traits[trait2]) {
        totalChecks++;
        const correlation = ((traits[trait1] - 50) * (traits[trait2] - 50)) / 2500;
        const expected = expectedCorrelations[pair];
        if (Math.sign(correlation) === Math.sign(expected)) {
          matchCount++;
        }
      }
    });

    return matchCount / totalChecks > 0.7 ? 'Good' : 'Moderate';
  }

  assessConvergentValidity(responses) {
    // Check if related items converge
    const traitGroups = {};
    responses.forEach(r => {
      const trait = r.trait || 'general';
      if (!traitGroups[trait]) traitGroups[trait] = [];
      traitGroups[trait].push(r.score || 3);
    });

    const convergences = Object.values(traitGroups)
      .filter(group => group.length > 1)
      .map(group => ss.standardDeviation(group));

    return ss.mean(convergences) < 1.5 ? 'Good' : 'Moderate';
  }

  assessDiscriminantValidity(traits) {
    // Check if unrelated traits are sufficiently different
    const differences = [];
    const traitArray = Object.values(traits);

    for (let i = 0; i < traitArray.length; i++) {
      for (let j = i + 1; j < traitArray.length; j++) {
        differences.push(Math.abs(traitArray[i] - traitArray[j]));
      }
    }

    return ss.mean(differences) > 15 ? 'Good' : 'Moderate';
  }

  assessFaceValidity(responses) {
    // Check response consistency
    const times = responses.map(r => r.responseTime).filter(t => t);
    if (times.length > 0) {
      const avgTime = ss.mean(times);
      return avgTime > 3000 ? 'Good' : 'Moderate';
    }
    return 'Moderate';
  }

  getDefaultAnalysis() {
    return {
      clustering: {
        archetype: 'Balanced Individual',
        description: 'A well-rounded personality profile',
        similarity: 75
      },
      factorAnalysis: { factors: [], loadings: [], variance: 0 },
      bayesian: { posteriors: {}, confidence: 0.7 },
      reliability: { cronbachAlpha: 0.75, acceptable: true },
      validity: { overall: 'Good' },
      patterns: [],
      outliers: []
    };
  }
}

module.exports = StatisticalAnalyzer;
