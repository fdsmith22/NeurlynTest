/**
 * Resilience Scorer
 *
 * Calculates resilience and coping strategy scores based on:
 * - CD-RISC (Connor-Davidson Resilience Scale) concepts
 * - Brief COPE inventory
 *
 * Dimensions assessed:
 * 1. Resilience:
 *    - Adaptability (3 questions)
 *    - Sense of Control (3 questions)
 *    - Social Support (2 questions)
 *
 * 2. Coping Strategies:
 *    - Adaptive Coping (5 questions)
 *    - Maladaptive Coping (4 questions)
 *
 * Outputs:
 * - Resilience total score (1-5 scale)
 * - Adaptive vs maladaptive coping ratio
 * - Protective factors assessment
 * - Coping strategy recommendations
 *
 * Research basis:
 * - CD-RISC: Connor & Davidson (2003), α = .89
 * - Brief COPE: Carver (1997), widely validated
 */

const logger = require('../utils/logger');

// Resilience facet items
const RESILIENCE_FACETS = {
  adaptability: ['RESILIENCE_ADAPT_1', 'RESILIENCE_ADAPT_2', 'RESILIENCE_ADAPT_3'],
  control: ['RESILIENCE_CONTROL_1', 'RESILIENCE_CONTROL_2', 'RESILIENCE_CONTROL_3'],
  socialSupport: ['RESILIENCE_SUPPORT_1', 'RESILIENCE_SUPPORT_2']
};

// Coping strategy items
const COPING_ITEMS = {
  adaptive: [
    'COPING_ADAPTIVE_1',
    'COPING_ADAPTIVE_2',
    'COPING_ADAPTIVE_3',
    'COPING_ADAPTIVE_4',
    'COPING_ADAPTIVE_5'
  ],
  maladaptive: [
    'COPING_MALADAPTIVE_1',
    'COPING_MALADAPTIVE_2',
    'COPING_MALADAPTIVE_3',
    'COPING_MALADAPTIVE_4'
  ]
};

class ResilienceScorer {
  constructor(responses) {
    this.responses = responses;
    this.scores = {
      resilience: {
        facets: {
          adaptability: { total: 0, average: 0, count: 0 },
          control: { total: 0, average: 0, count: 0 },
          socialSupport: { total: 0, average: 0, count: 0 }
        },
        overall: {
          total: 0,
          average: 0,
          percentile: 0,
          level: 'Unknown'
        }
      },
      coping: {
        adaptive: { total: 0, average: 0, count: 0 },
        maladaptive: { total: 0, average: 0, count: 0 },
        ratio: 0,
        balance: 'Unknown'
      }
    };
  }

  /**
   * Calculate all resilience and coping scores
   */
  calculate() {
    this.calculateResilienceFacets();
    this.calculateOverallResilience();
    this.calculateCopingStrategies();

    return this.getResilienceReport();
  }

  /**
   * Calculate resilience facet scores
   */
  calculateResilienceFacets() {
    for (const [facet, items] of Object.entries(RESILIENCE_FACETS)) {
      let total = 0;
      let count = 0;

      items.forEach(qid => {
        const resp = this.findResponse(qid);

        if (resp) {
          const score = this.getLikertScore(resp);
          total += score;
          count++;
        }
      });

      if (count > 0) {
        this.scores.resilience.facets[facet].total = total;
        this.scores.resilience.facets[facet].count = count;
        this.scores.resilience.facets[facet].average = total / count;

        logger.info(`[Resilience] ${facet}: ${(total / count).toFixed(2)} (${count} items)`);
      }
    }
  }

  /**
   * Calculate overall resilience score
   */
  calculateOverallResilience() {
    const facetAverages = Object.values(this.scores.resilience.facets)
      .filter(f => f.count > 0)
      .map(f => f.average);

    if (facetAverages.length === 0) {
      logger.warn('[Resilience] No facet scores available');
      return;
    }

    // Overall average across all facets
    this.scores.resilience.overall.average = facetAverages.reduce((a, b) => a + b, 0) / facetAverages.length;

    // Convert to percentile (approximate, assuming mean=3.5, SD=0.7)
    this.scores.resilience.overall.percentile = this.scoreToPercentile(this.scores.resilience.overall.average);

    // Determine level
    this.scores.resilience.overall.level = this.getResilienceLevel(this.scores.resilience.overall.average);

    logger.info(`[Resilience] Overall: ${this.scores.resilience.overall.average.toFixed(2)} (${this.scores.resilience.overall.level})`);
  }

  /**
   * Calculate coping strategy scores
   */
  calculateCopingStrategies() {
    // Adaptive coping
    let adaptiveTotal = 0;
    let adaptiveCount = 0;

    COPING_ITEMS.adaptive.forEach(qid => {
      const resp = this.findResponse(qid);
      if (resp) {
        const score = this.getLikertScore(resp);
        adaptiveTotal += score;
        adaptiveCount++;
      }
    });

    if (adaptiveCount > 0) {
      this.scores.coping.adaptive.total = adaptiveTotal;
      this.scores.coping.adaptive.count = adaptiveCount;
      this.scores.coping.adaptive.average = adaptiveTotal / adaptiveCount;
    }

    // Maladaptive coping
    let maladaptiveTotal = 0;
    let maladaptiveCount = 0;

    COPING_ITEMS.maladaptive.forEach(qid => {
      const resp = this.findResponse(qid);
      if (resp) {
        const score = this.getLikertScore(resp);
        maladaptiveTotal += score;
        maladaptiveCount++;
      }
    });

    if (maladaptiveCount > 0) {
      this.scores.coping.maladaptive.total = maladaptiveTotal;
      this.scores.coping.maladaptive.count = maladaptiveCount;
      this.scores.coping.maladaptive.average = maladaptiveTotal / maladaptiveCount;
    }

    // Calculate adaptive/maladaptive ratio
    if (adaptiveCount > 0 && maladaptiveCount > 0) {
      this.scores.coping.ratio = this.scores.coping.adaptive.average / this.scores.coping.maladaptive.average;
      this.scores.coping.balance = this.getCopingBalance(this.scores.coping.ratio);

      logger.info(`[Coping] Adaptive: ${this.scores.coping.adaptive.average.toFixed(2)}, Maladaptive: ${this.scores.coping.maladaptive.average.toFixed(2)}, Ratio: ${this.scores.coping.ratio.toFixed(2)}`);
    }
  }

  /**
   * Get comprehensive resilience report
   */
  getResilienceReport() {
    return {
      scores: this.scores,
      summary: this.generateSummary(),
      protectiveFactors: this.getProtectiveFactors(),
      riskFactors: this.getRiskFactors(),
      copingStrategies: this.getCopingStrategiesReport(),
      recommendations: this.getRecommendations()
    };
  }

  /**
   * Generate human-readable summary
   */
  generateSummary() {
    const resLevel = this.scores.resilience.overall.level;
    const resAvg = this.scores.resilience.overall.average;
    const copingBalance = this.scores.coping.balance;

    if (resLevel === 'Unknown') {
      return 'Resilience score could not be determined (insufficient data).';
    }

    let summary = `Resilience: ${resLevel} (${resAvg.toFixed(1)}/5.0, ${this.scores.resilience.overall.percentile}${this.getOrdinalSuffix(this.scores.resilience.overall.percentile)} percentile). `;

    if (copingBalance !== 'Unknown') {
      summary += `Coping strategy balance: ${copingBalance} (adaptive/maladaptive ratio: ${this.scores.coping.ratio.toFixed(2)}). `;
    }

    // Identify strongest/weakest resilience facet
    const facetScores = Object.entries(this.scores.resilience.facets)
      .filter(([_, data]) => data.count > 0)
      .map(([name, data]) => ({ name, average: data.average }));

    if (facetScores.length > 0) {
      const strongest = facetScores.reduce((a, b) => a.average > b.average ? a : b);
      const weakest = facetScores.reduce((a, b) => a.average < b.average ? a : b);

      summary += `Strongest facet: ${this.formatFacetName(strongest.name)} (${strongest.average.toFixed(1)}). `;
      summary += `Weakest facet: ${this.formatFacetName(weakest.name)} (${weakest.average.toFixed(1)}).`;
    }

    return summary;
  }

  /**
   * Identify protective factors
   */
  getProtectiveFactors() {
    const factors = [];

    // High resilience
    if (this.scores.resilience.overall.average >= 4.0) {
      factors.push({
        factor: 'High Overall Resilience',
        description: 'Strong ability to bounce back from adversity',
        strength: 'High'
      });
    }

    // Strong adaptability
    if (this.scores.resilience.facets.adaptability.average >= 4.0) {
      factors.push({
        factor: 'Strong Adaptability',
        description: 'Able to adjust well to changes and uncertainty',
        strength: 'High'
      });
    }

    // Strong sense of control
    if (this.scores.resilience.facets.control.average >= 4.0) {
      factors.push({
        factor: 'Strong Sense of Control',
        description: 'Belief in personal agency and problem-solving ability',
        strength: 'High'
      });
    }

    // Good social support
    if (this.scores.resilience.facets.socialSupport.average >= 4.0) {
      factors.push({
        factor: 'Strong Social Support',
        description: 'Access to supportive relationships and willingness to seek help',
        strength: 'High'
      });
    }

    // Adaptive coping dominance
    if (this.scores.coping.ratio >= 1.5) {
      factors.push({
        factor: 'Adaptive Coping Strategies',
        description: 'Primary use of healthy, problem-focused coping methods',
        strength: 'High'
      });
    }

    return factors;
  }

  /**
   * Identify risk factors
   */
  getRiskFactors() {
    const factors = [];

    // Low resilience
    if (this.scores.resilience.overall.average <= 2.5) {
      factors.push({
        factor: 'Low Overall Resilience',
        description: 'Difficulty recovering from setbacks or stress',
        severity: 'High'
      });
    }

    // Poor adaptability
    if (this.scores.resilience.facets.adaptability.average <= 2.5) {
      factors.push({
        factor: 'Poor Adaptability',
        description: 'Struggle with changes or uncertainty',
        severity: 'Moderate'
      });
    }

    // Low sense of control
    if (this.scores.resilience.facets.control.average <= 2.5) {
      factors.push({
        factor: 'Low Sense of Control',
        description: 'Feelings of helplessness or lack of agency',
        severity: 'High'
      });
    }

    // Weak social support
    if (this.scores.resilience.facets.socialSupport.average <= 2.5) {
      factors.push({
        factor: 'Limited Social Support',
        description: 'Lack of supportive relationships or reluctance to seek help',
        severity: 'High'
      });
    }

    // Maladaptive coping dominance
    if (this.scores.coping.ratio < 0.8) {
      factors.push({
        factor: 'Maladaptive Coping Dominance',
        description: 'Primary use of avoidance, denial, or substance-based coping',
        severity: 'High'
      });
    }

    // High maladaptive coping
    if (this.scores.coping.maladaptive.average >= 3.5) {
      factors.push({
        factor: 'High Maladaptive Coping',
        description: 'Frequent use of unhealthy coping strategies',
        severity: 'High'
      });
    }

    return factors;
  }

  /**
   * Get detailed coping strategies report
   */
  getCopingStrategiesReport() {
    return {
      adaptive: {
        score: this.scores.coping.adaptive.average,
        level: this.getCopingLevel(this.scores.coping.adaptive.average),
        strategies: [
          'Problem-focused coping',
          'Active coping and planning',
          'Emotion regulation strategies',
          'Seeking social support',
          'Positive reframing'
        ]
      },
      maladaptive: {
        score: this.scores.coping.maladaptive.average,
        level: this.getCopingLevel(this.scores.coping.maladaptive.average),
        strategies: [
          'Avoidance',
          'Denial',
          'Substance use',
          'Self-blame'
        ]
      },
      ratio: this.scores.coping.ratio,
      balance: this.scores.coping.balance
    };
  }

  /**
   * Get recommendations based on scores
   */
  getRecommendations() {
    const recommendations = [];
    const resAvg = this.scores.resilience.overall.average;

    // Overall resilience recommendations
    if (resAvg >= 4.0) {
      recommendations.push('Your strong resilience is a major protective factor - continue to nurture it');
      recommendations.push('Share your coping strategies with others who may benefit');
    } else if (resAvg >= 3.0) {
      recommendations.push('Build on your moderate resilience by strengthening weaker areas');
      recommendations.push('Practice stress management techniques regularly');
    } else {
      recommendations.push('Focus on building resilience through small, achievable goals');
      recommendations.push('Consider therapy to develop healthier coping strategies');
      recommendations.push('Strengthen social connections and support networks');
    }

    // Facet-specific recommendations
    if (this.scores.resilience.facets.adaptability.average < 3.0) {
      recommendations.push('Practice flexibility by intentionally trying new approaches to problems');
    }

    if (this.scores.resilience.facets.control.average < 3.0) {
      recommendations.push('Work on identifying areas where you do have control and influence');
      recommendations.push('Challenge helplessness thoughts with evidence of past successes');
    }

    if (this.scores.resilience.facets.socialSupport.average < 3.0) {
      recommendations.push('Actively build and maintain supportive relationships');
      recommendations.push('Practice asking for help when needed');
    }

    // Coping recommendations
    if (this.scores.coping.ratio < 1.0) {
      recommendations.push('Shift toward more adaptive coping strategies (problem-solving, seeking support)');
      recommendations.push('Reduce reliance on avoidance, denial, or substance use');
    }

    if (this.scores.coping.maladaptive.average >= 3.5) {
      recommendations.push('High maladaptive coping may perpetuate problems - consider professional support');
    }

    if (this.scores.coping.adaptive.average < 3.0) {
      recommendations.push('Learn and practice new adaptive coping skills');
      recommendations.push('Consider cognitive-behavioral therapy (CBT) to build coping toolkit');
    }

    return recommendations;
  }

  /**
   * Helper: Get likert score (1-5)
   */
  getLikertScore(response) {
    if (typeof response.score === 'number') {
      return response.score;
    }

    const scoreMap = {
      'Strongly Disagree': 1,
      'Disagree': 2,
      'Neutral': 3,
      'Agree': 4,
      'Strongly Agree': 5
    };

    return scoreMap[response.response] || scoreMap[response.value] || 3;
  }

  /**
   * Convert score (1-5) to approximate percentile
   * Assuming mean=3.5, SD=0.7 for resilience
   */
  scoreToPercentile(score) {
    if (score >= 4.5) return 92;
    if (score >= 4.0) return 76;
    if (score >= 3.5) return 50;
    if (score >= 3.0) return 24;
    if (score >= 2.5) return 8;
    return 2;
  }

  /**
   * Get resilience level category
   */
  getResilienceLevel(average) {
    if (average >= 4.5) return 'Very High';
    if (average >= 3.7) return 'High';
    if (average >= 2.8) return 'Moderate';
    if (average >= 2.0) return 'Low';
    return 'Very Low';
  }

  /**
   * Get coping balance category
   */
  getCopingBalance(ratio) {
    if (ratio >= 1.5) return 'Strongly Adaptive';
    if (ratio >= 1.2) return 'Moderately Adaptive';
    if (ratio >= 0.8) return 'Balanced';
    if (ratio >= 0.5) return 'Moderately Maladaptive';
    return 'Strongly Maladaptive';
  }

  /**
   * Get coping level (for individual adaptive/maladaptive scores)
   */
  getCopingLevel(average) {
    if (average >= 4.0) return 'Very High';
    if (average >= 3.3) return 'High';
    if (average >= 2.7) return 'Moderate';
    if (average >= 2.0) return 'Low';
    return 'Very Low';
  }

  /**
   * Format facet name for display
   */
  formatFacetName(facetName) {
    const nameMap = {
      adaptability: 'Adaptability',
      control: 'Sense of Control',
      socialSupport: 'Social Support'
    };

    return nameMap[facetName] || facetName;
  }

  /**
   * Helper: Find response by question ID
   */
  findResponse(questionId) {
    return this.responses.find(r => r.questionId === questionId);
  }

  /**
   * Get ordinal suffix for a number (1st, 2nd, 3rd, 4th, etc.)
   */
  getOrdinalSuffix(num) {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  }
}

module.exports = ResilienceScorer;
