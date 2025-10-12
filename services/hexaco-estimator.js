/**
 * HEXACO Honesty-Humility Estimator
 *
 * Estimates the 6th personality dimension (Honesty-Humility) from Big Five data
 * HEXACO Model: Ashton & Lee (2007, 2009)
 *
 * Research basis:
 * - Lee & Ashton (2004) - Psychometric Properties of the HEXACO Personality Inventory
 * - Ashton et al. (2014) - The HEXACO-60: A Short Measure of the Major Dimensions of Personality
 * - De Vries et al. (2009) - A comparison of the HEXACO and FFM personality models
 *
 * HEXACO = Honesty-Humility + Emotionality + eXtraversion + Agreeableness + Conscientiousness + Openness
 */

class HEXACOEstimator {
  constructor() {
    // HEXACO Honesty-Humility facets
    this.honestyFacets = {
      sincerity: 'Genuine vs. manipulative in interpersonal relations',
      fairness: 'Avoids cheating and rule-breaking for personal gain',
      greedAvoidance: 'Uninterested in wealth and luxury',
      modesty: 'Views self as ordinary rather than superior'
    };

    // Mapping from Big Five facets to Honesty-Humility
    // Based on meta-analytic correlations (Lee & Ashton, 2004; De Vries et al., 2009)
    this.facetMappings = {
      sincerity: {
        // Low sincerity correlates with facets related to manipulation
        'agreeableness.straightforwardness': 0.65,  // r = .65 with sincerity
        'agreeableness.modesty': 0.45,              // r = .45 with sincerity
        'conscientiousness.dutifulness': 0.35       // r = .35 with sincerity
      },
      fairness: {
        'conscientiousness.dutifulness': 0.60,      // r = .60 with fairness
        'agreeableness.compliance': 0.50,           // r = .50 with fairness
        'agreeableness.trust': 0.40                 // r = .40 with fairness
      },
      greedAvoidance: {
        'openness.values': -0.45,                   // Materialism (reversed)
        'agreeableness.altruism': 0.55,             // r = .55 with greed avoidance
        'conscientiousness.achievementStriving': -0.30  // High achievement seeking can correlate with greed (reversed)
      },
      modesty: {
        'agreeableness.modesty': 0.75,              // r = .75 with modesty (direct)
        'extraversion.assertiveness': -0.50,        // r = -.50 with modesty (assertive people less modest)
        'neuroticism.selfConsciousness': 0.35       // r = .35 with modesty
      }
    };

    // Conversion from Big Five traits to HEXACO Emotionality
    // HEXACO Emotionality ≈ Neuroticism + facets of Agreeableness
    this.emotionalityMapping = {
      'neuroticism.anxiety': 0.70,
      'neuroticism.vulnerability': 0.65,
      'agreeableness.sympathy': 0.45,
      'extraversion.warmth': 0.35
    };

    // Thresholds for interpretation
    this.thresholds = {
      veryHigh: 70,
      high: 60,
      average: 50,
      low: 40,
      veryLow: 30
    };

    // Population statistics
    this.populationStats = {
      mean: 50,
      sd: 10
    };

    // Outcome correlations (research-based)
    this.outcomeCorrelations = {
      unethicalBehavior: {
        correlation: -0.42,  // r = -.42 with honesty-humility (Ashton & Lee, 2008)
        description: 'Lower honesty-humility predicts higher likelihood of unethical behavior'
      },
      counterproductiveWorkBehavior: {
        correlation: -0.35,  // r = -.35 (Lee et al., 2005)
        description: 'Predicts workplace deviance and rule-breaking'
      },
      prosocialBehavior: {
        correlation: 0.30,   // r = .30 (Hilbig et al., 2014)
        description: 'Higher honesty-humility predicts helping and cooperation'
      },
      sexualHarassment: {
        correlation: -0.28,  // r = -.28 (Lee et al., 2013)
        description: 'Low honesty-humility is strongest personality predictor of harassment'
      },
      environmentalBehavior: {
        correlation: 0.25,   // r = .25 (Brick & Lewis, 2016)
        description: 'Predicts pro-environmental attitudes and behaviors'
      }
    };
  }

  /**
   * Main estimation function
   */
  estimate(bigFiveScores, facetScores = null) {
    // Calculate Honesty-Humility from Big Five
    const honestyHumility = this.calculateHonestyHumility(bigFiveScores, facetScores);

    // Calculate HEXACO Emotionality (different from Big Five Neuroticism)
    const emotionality = this.calculateEmotionality(bigFiveScores, facetScores);

    // Full HEXACO profile
    const hexacoProfile = {
      H: honestyHumility,  // Honesty-Humility (estimated)
      E: emotionality,      // Emotionality (converted from Neuroticism + Agreeableness facets)
      X: bigFiveScores.extraversion,  // eXtraversion (same as Big Five)
      A: this.convertAgreeableness(bigFiveScores.agreeableness),  // Agreeableness (adjusted)
      C: bigFiveScores.conscientiousness,  // Conscientiousness (same)
      O: bigFiveScores.openness  // Openness (same)
    };

    // Detailed Honesty-Humility breakdown
    const honestyBreakdown = this.calculateHonestyFacets(bigFiveScores, facetScores);

    // Outcome predictions
    const predictions = this.predictOutcomes(honestyHumility);

    // Interpretation
    const interpretation = this.interpretHonestyHumility(honestyHumility, honestyBreakdown);

    // Behavioral implications
    const behavioralImplications = this.generateBehavioralImplications(honestyHumility, honestyBreakdown);

    return {
      hexacoProfile,
      honestyHumility: {
        score: honestyHumility,
        percentile: this.scoreToPercentile(honestyHumility),
        facets: honestyBreakdown,
        interpretation,
        behavioralImplications
      },
      emotionality: {
        score: emotionality,
        percentile: this.scoreToPercentile(emotionality),
        interpretation: this.interpretEmotionality(emotionality)
      },
      predictions,
      modelComparison: this.compareBigFiveToHEXACO(bigFiveScores, hexacoProfile),
      insights: this.generateHEXACOInsights(hexacoProfile, bigFiveScores),
      estimationQuality: facetScores ? 'high' : 'moderate'  // Better with facet data
    };
  }

  /**
   * Calculate Honesty-Humility score from Big Five
   */
  calculateHonestyHumility(bigFiveScores, facetScores = null) {
    if (facetScores) {
      // Use facet-level estimation (more accurate)
      return this.calculateFromFacets(facetScores);
    }

    // Trait-level estimation (less accurate but still useful)
    // Research shows H correlates with: high Agreeableness (.35), low Conscientiousness (-.15 with achievement)
    // But H is largely orthogonal to Big Five, so we use conservative estimation

    const agreeablenessComponent = bigFiveScores.agreeableness * 0.35;
    const conscientiousnessComponent = (100 - bigFiveScores.conscientiousness) * 0.10;  // Slight negative with high C
    const opennessComponent = bigFiveScores.openness * 0.15;  // Slight positive with values facet

    // Base of 50 + weighted components
    let honestyEstimate = 50 + (agreeablenessComponent - 50) * 0.35 + (conscientiousnessComponent - 50) * 0.10 + (opennessComponent - 50) * 0.15;

    // Constrain to 0-100
    honestyEstimate = Math.max(0, Math.min(100, honestyEstimate));

    return Math.round(honestyEstimate);
  }

  /**
   * Calculate from facets (more accurate)
   */
  calculateFromFacets(facetScores) {
    const facetBreakdown = this.calculateHonestyFacets(null, facetScores);

    // Average the four Honesty-Humility facets
    const facetValues = Object.values(facetBreakdown).map(f => f.score);
    const average = facetValues.reduce((sum, val) => sum + val, 0) / facetValues.length;

    return Math.round(average);
  }

  /**
   * Calculate individual Honesty-Humility facets
   */
  calculateHonestyFacets(bigFiveScores, facetScores) {
    const facets = {};

    // If we have facet scores, use precise mapping
    if (facetScores) {
      // Sincerity
      const sincerity = this.estimateFacetFromBigFive('sincerity', facetScores);
      facets.sincerity = {
        score: sincerity,
        description: this.honestyFacets.sincerity,
        level: this.scoreToLevel(sincerity)
      };

      // Fairness
      const fairness = this.estimateFacetFromBigFive('fairness', facetScores);
      facets.fairness = {
        score: fairness,
        description: this.honestyFacets.fairness,
        level: this.scoreToLevel(fairness)
      };

      // Greed Avoidance
      const greedAvoidance = this.estimateFacetFromBigFive('greedAvoidance', facetScores);
      facets.greedAvoidance = {
        score: greedAvoidance,
        description: this.honestyFacets.greedAvoidance,
        level: this.scoreToLevel(greedAvoidance)
      };

      // Modesty
      const modesty = this.estimateFacetFromBigFive('modesty', facetScores);
      facets.modesty = {
        score: modesty,
        description: this.honestyFacets.modesty,
        level: this.scoreToLevel(modesty)
      };
    } else {
      // Without facets, provide conservative estimates
      facets.sincerity = {
        score: 50,
        description: this.honestyFacets.sincerity,
        level: 'average',
        estimated: true
      };
      facets.fairness = {
        score: 50,
        description: this.honestyFacets.fairness,
        level: 'average',
        estimated: true
      };
      facets.greedAvoidance = {
        score: 50,
        description: this.honestyFacets.greedAvoidance,
        level: 'average',
        estimated: true
      };
      facets.modesty = {
        score: 50,
        description: this.honestyFacets.modesty,
        level: 'average',
        estimated: true
      };
    }

    return facets;
  }

  /**
   * Estimate HEXACO facet from Big Five facets
   */
  estimateFacetFromBigFive(hexacoFacet, bigFiveFacetScores) {
    const mappings = this.facetMappings[hexacoFacet];
    if (!mappings) return 50;

    let weightedSum = 0;
    let totalWeight = 0;

    Object.entries(mappings).forEach(([facetPath, weight]) => {
      const facetValue = bigFiveFacetScores[facetPath];
      if (facetValue !== undefined) {
        // Apply weight (positive or negative correlation)
        const contribution = weight > 0
          ? facetValue * Math.abs(weight)
          : (100 - facetValue) * Math.abs(weight);
        weightedSum += contribution;
        totalWeight += Math.abs(weight);
      }
    });

    if (totalWeight === 0) return 50;

    const estimate = weightedSum / totalWeight;
    return Math.round(Math.max(0, Math.min(100, estimate)));
  }

  /**
   * Calculate HEXACO Emotionality (different from Big Five Neuroticism)
   */
  calculateEmotionality(bigFiveScores, facetScores = null) {
    if (facetScores) {
      let weightedSum = 0;
      let totalWeight = 0;

      Object.entries(this.emotionalityMapping).forEach(([facetPath, weight]) => {
        const facetValue = facetScores[facetPath];
        if (facetValue !== undefined) {
          weightedSum += facetValue * weight;
          totalWeight += weight;
        }
      });

      return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : bigFiveScores.neuroticism;
    }

    // Without facets, approximate from Big Five
    // HEXACO Emotionality = Neuroticism + sentimentality component
    return Math.round((bigFiveScores.neuroticism * 0.7) + (bigFiveScores.agreeableness * 0.3));
  }

  /**
   * Convert Big Five Agreeableness to HEXACO Agreeableness
   * HEXACO A is narrower (patience, forgiveness, flexibility)
   */
  convertAgreeableness(bigFiveAgreeableness) {
    // HEXACO Agreeableness is slightly lower than Big Five
    return Math.round(bigFiveAgreeableness * 0.9);
  }

  /**
   * Interpret Honesty-Humility score
   */
  interpretHonestyHumility(score, facets) {
    const level = this.scoreToLevel(score);
    const percentile = this.scoreToPercentile(score);

    let description = '';
    let characteristics = [];
    let risks = [];
    let strengths = [];

    if (score >= this.thresholds.veryHigh) {
      description = 'Very High Honesty-Humility';
      characteristics = [
        'Exceptionally sincere and genuine in interactions',
        'Strong moral compass and ethical standards',
        'Uninterested in wealth, status, or luxury',
        'Views self as equal to others, not superior'
      ];
      strengths = [
        'Highly trusted by others',
        'Ethical leadership potential',
        'Strong pro-social orientation',
        'Low risk of unethical behavior'
      ];
      risks = [
        'May be exploited by less honest individuals',
        'Could struggle in highly competitive environments',
        'May undervalue own contributions'
      ];
    } else if (score >= this.thresholds.high) {
      description = 'High Honesty-Humility';
      characteristics = [
        'Generally sincere and straightforward',
        'Values fairness and ethical behavior',
        'Not strongly motivated by material gain',
        'Modest in self-assessment'
      ];
      strengths = [
        'Trusted team member',
        'Reliable and ethical',
        'Cooperative and fair-minded'
      ];
      risks = [
        'May need to advocate more for self-interest',
        'Could be overlooked in competitive settings'
      ];
    } else if (score <= this.thresholds.veryLow) {
      description = 'Very Low Honesty-Humility';
      characteristics = [
        'Strategic and tactical in interactions',
        'Comfortable bending rules for personal gain',
        'Motivated by wealth, status, and luxury',
        'Confident in own superiority'
      ];
      strengths = [
        'Effective in competitive environments',
        'Strong negotiation skills',
        'Ambitious and achievement-oriented'
      ];
      risks = [
        'Higher risk of unethical behavior (r = -.42)',
        'May damage trust in relationships',
        'Elevated risk of workplace deviance',
        'Potential for exploiting others'
      ];
    } else if (score <= this.thresholds.low) {
      description = 'Low Honesty-Humility';
      characteristics = [
        'Sometimes strategic in self-presentation',
        'Willing to bend rules when beneficial',
        'Motivated by material success',
        'Confident in own abilities'
      ];
      strengths = [
        'Competitive and ambitious',
        'Effective negotiator',
        'Self-promoting'
      ];
      risks = [
        'May prioritize self-interest over ethics',
        'Could damage relationships if unchecked',
        'Risk of reputation damage'
      ];
    } else {
      description = 'Average Honesty-Humility';
      characteristics = [
        'Balance between sincerity and strategy',
        'Generally ethical with occasional flexibility',
        'Moderate interest in material success',
        'Realistic self-assessment'
      ];
      strengths = [
        'Adaptable to different contexts',
        'Can compete while maintaining ethics',
        'Balanced self-interest and cooperation'
      ];
      risks = [];
    }

    return {
      level,
      percentile,
      description,
      characteristics,
      strengths,
      risks
    };
  }

  /**
   * Interpret Emotionality
   */
  interpretEmotionality(score) {
    const level = this.scoreToLevel(score);

    if (score >= 60) {
      return `High Emotionality (${level}): Strong emotional responses to threats, high anxiety sensitivity, and elevated sentimentality. More emotionally expressive and empathetic.`;
    } else if (score <= 40) {
      return `Low Emotionality (${level}): Calm under stress, low anxiety, and less sentimental. More emotionally detached and resilient to threats.`;
    } else {
      return `Average Emotionality (${level}): Moderate emotional responses and balanced sentimentality.`;
    }
  }

  /**
   * Predict behavioral outcomes
   */
  predictOutcomes(honestyScore) {
    const predictions = {};

    Object.entries(this.outcomeCorrelations).forEach(([outcome, data]) => {
      const correlation = data.correlation;

      // Calculate predicted percentile based on correlation
      // Higher H → lower unethical behavior (negative correlation)
      let predictedPercentile;
      if (correlation < 0) {
        // Negative correlation: high H → low outcome
        predictedPercentile = Math.round(100 - ((honestyScore / 100) * 80 + 10));
      } else {
        // Positive correlation: high H → high outcome
        predictedPercentile = Math.round((honestyScore / 100) * 80 + 10);
      }

      predictions[outcome] = {
        percentile: predictedPercentile,
        correlation: correlation,
        description: data.description,
        strength: Math.abs(correlation) >= 0.3 ? 'strong' : 'moderate'
      };
    });

    return predictions;
  }

  /**
   * Generate behavioral implications
   */
  generateBehavioralImplications(honestyScore, facets) {
    const implications = [];

    // Based on overall score
    if (honestyScore >= 60) {
      implications.push({
        domain: 'workplace',
        implication: 'Excel in roles requiring trust and ethical decision-making. Strong fit for compliance, ethics, or governance roles.'
      });
      implications.push({
        domain: 'leadership',
        implication: 'Ethical leadership style. Trusted by teams but may need to balance fairness with tough decisions.'
      });
    } else if (honestyScore <= 40) {
      implications.push({
        domain: 'workplace',
        implication: 'Thrive in competitive, high-stakes environments. May need to monitor ethical boundaries actively.'
      });
      implications.push({
        domain: 'leadership',
        implication: 'Strategic and ambitious leadership style. Guard against reputation risks from overly aggressive tactics.'
      });
    }

    // Based on specific facets
    if (facets.greedAvoidance?.score <= 40) {
      implications.push({
        domain: 'motivation',
        implication: 'Strongly motivated by material success and status. Channel this drive productively through clear goals.'
      });
    }

    if (facets.modesty?.score >= 60) {
      implications.push({
        domain: 'career',
        implication: 'May undervalue own contributions. Practice self-advocacy and negotiation skills.'
      });
    }

    return implications;
  }

  /**
   * Compare Big Five to HEXACO
   */
  compareBigFiveToHEXACO(bigFive, hexaco) {
    return {
      keydifference: 'HEXACO adds Honesty-Humility as 6th dimension and restructures Agreeableness and Neuroticism',
      hexacoAdvantage: 'Better prediction of ethical behavior, counterproductive work behavior, and exploitation tendencies',
      bigFiveAdvantage: 'More established research base and wider adoption',
      honestyUniqueness: 'Honesty-Humility captures variance not explained by Big Five (15-20% unique variance)',
      emotionalityDifference: `HEXACO Emotionality (${hexaco.E}) includes sentimentality, while Big Five Neuroticism (${bigFive.neuroticism}) focuses on negative affect`
    };
  }

  /**
   * Generate HEXACO-specific insights
   */
  generateHEXACOInsights(hexaco, bigFive) {
    const insights = [];

    // Check for significant H-factor
    if (hexaco.H >= 60 && bigFive.agreeableness < 55) {
      insights.push({
        type: 'unique_pattern',
        title: 'Ethical Independence',
        description: 'High Honesty-Humility with moderate Agreeableness suggests principled independence - ethical and fair, but not necessarily compliant or conflict-avoidant.'
      });
    }

    if (hexaco.H <= 40 && bigFive.conscientiousness >= 60) {
      insights.push({
        type: 'unique_pattern',
        title: 'Strategic Achiever',
        description: 'Low Honesty-Humility with high Conscientiousness suggests strategic ambition - organized and goal-directed, willing to bend rules for success.'
      });
    }

    if (hexaco.E >= 60 && bigFive.neuroticism < 50) {
      insights.push({
        type: 'emotionality_insight',
        title: 'Empathetic Stability',
        description: 'High Emotionality without high Neuroticism suggests emotional expressiveness and empathy without anxiety or emotional instability.'
      });
    }

    return insights;
  }

  /**
   * Convert score to percentile
   */
  scoreToPercentile(score) {
    const z = (score - this.populationStats.mean) / this.populationStats.sd;
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

    const percentile = z >= 0 ? (1 - p) * 100 : p * 100;
    return Math.round(percentile);
  }

  /**
   * Convert score to descriptive level
   */
  scoreToLevel(score) {
    if (score >= this.thresholds.veryHigh) return 'very high';
    if (score >= this.thresholds.high) return 'high';
    if (score >= this.thresholds.average) return 'average';
    if (score >= this.thresholds.low) return 'low';
    return 'very low';
  }
}

module.exports = HEXACOEstimator;
