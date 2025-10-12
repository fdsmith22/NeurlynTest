/**
 * HEXACO Scorer (Honesty-Humility Dimension)
 *
 * Calculates the 6th personality dimension from HEXACO model:
 * - H = Honesty-Humility
 *
 * Facets (4 total):
 * - H1: Sincerity (genuine vs. manipulative)
 * - H2: Fairness (rule-abiding vs. rule-breaking)
 * - H3: Greed Avoidance (non-materialistic vs. greedy)
 * - H4: Modesty (humble vs. entitled)
 *
 * HEXACO-H uniquely predicts:
 * - Counterproductive work behavior (r = -.35)
 * - Ethical decision-making
 * - Dark Triad traits (Machiavellianism, Psychopathy, Narcissism)
 * - Integrity and honesty in various contexts
 *
 * Source: Lee & Ashton (2018) - HEXACO-PI-R
 */

const logger = require('../utils/logger');

// HEXACO Honesty-Humility facet items
const HEXACO_FACETS = {
  sincerity: ['HEXACO_H1_1', 'HEXACO_H1_2', 'HEXACO_H1_3', 'HEXACO_H1_4', 'HEXACO_H1_5'],
  fairness: ['HEXACO_H2_1', 'HEXACO_H2_2', 'HEXACO_H2_3', 'HEXACO_H2_4', 'HEXACO_H2_5'],
  greedAvoidance: ['HEXACO_H3_1', 'HEXACO_H3_2', 'HEXACO_H3_3', 'HEXACO_H3_4'],
  modesty: ['HEXACO_H4_1', 'HEXACO_H4_2', 'HEXACO_H4_3', 'HEXACO_H4_4']
};

class HEXACOScorer {
  constructor(responses) {
    this.responses = responses;
    this.scores = {
      facets: {
        sincerity: { total: 0, average: 0, count: 0 },
        fairness: { total: 0, average: 0, count: 0 },
        greedAvoidance: { total: 0, average: 0, count: 0 },
        modesty: { total: 0, average: 0, count: 0 }
      },
      overall: {
        total: 0,
        average: 0,
        percentile: 0,
        level: 'Unknown'
      }
    };
  }

  /**
   * Calculate all HEXACO Honesty-Humility scores
   */
  calculate() {
    this.calculateFacets();
    this.calculateOverall();

    return this.getHEXACOReport();
  }

  /**
   * Calculate facet scores
   */
  calculateFacets() {
    for (const [facet, items] of Object.entries(HEXACO_FACETS)) {
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
        this.scores.facets[facet].total = total;
        this.scores.facets[facet].count = count;
        this.scores.facets[facet].average = total / count;

        logger.info(`[HEXACO] ${facet}: ${(total / count).toFixed(2)} (${count} items)`);
      }
    }
  }

  /**
   * Calculate overall Honesty-Humility score
   */
  calculateOverall() {
    const facetAverages = Object.values(this.scores.facets)
      .filter(f => f.count > 0)
      .map(f => f.average);

    if (facetAverages.length === 0) {
      logger.warn('[HEXACO] No facet scores available');
      return;
    }

    // Overall average across all facets
    this.scores.overall.average = facetAverages.reduce((a, b) => a + b, 0) / facetAverages.length;

    // Convert to percentile (approximate)
    this.scores.overall.percentile = this.scoreToPercentile(this.scores.overall.average);

    // Determine level
    this.scores.overall.level = this.getHonestyLevel(this.scores.overall.average);

    logger.info(`[HEXACO] Overall Honesty-Humility: ${this.scores.overall.average.toFixed(2)} (${this.scores.overall.level})`);
  }

  /**
   * Get comprehensive HEXACO report
   */
  getHEXACOReport() {
    return {
      scores: this.scores,
      summary: this.generateSummary(),
      characteristics: this.getCharacteristics(),
      predictions: this.getPredictions(),
      recommendations: this.getRecommendations()
    };
  }

  /**
   * Generate human-readable summary
   */
  generateSummary() {
    const level = this.scores.overall.level;
    const avg = this.scores.overall.average;

    if (level === 'Unknown') {
      return 'Honesty-Humility score could not be determined (insufficient data).';
    }

    let summary = `Honesty-Humility: ${level} (${avg.toFixed(1)}/5.0, ${this.scores.overall.percentile}${this.getOrdinalSuffix(this.scores.overall.percentile)} percentile). `;

    // Identify strongest/weakest facet
    const facetScores = Object.entries(this.scores.facets)
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
   * Get behavioral characteristics based on score
   */
  getCharacteristics() {
    const level = this.scores.overall.level;
    const characteristics = [];

    if (level === 'Very High') {
      characteristics.push('Highly sincere and genuine in interactions');
      characteristics.push('Strong moral principles and rule-abiding');
      characteristics.push('Uninterested in material wealth or status');
      characteristics.push('Humble and realistic self-view');
      characteristics.push('Low risk for unethical behavior');
    } else if (level === 'High') {
      characteristics.push('Generally honest and straightforward');
      characteristics.push('Respects rules and fairness');
      characteristics.push('Modest and down-to-earth');
      characteristics.push('Not driven by greed or status');
    } else if (level === 'Moderate') {
      characteristics.push('Balanced approach to honesty and self-interest');
      characteristics.push('Generally ethical with some flexibility');
      characteristics.push('Moderate material interests');
      characteristics.push('Realistic self-confidence');
    } else if (level === 'Low') {
      characteristics.push('Pragmatic and strategic in dealings');
      characteristics.push('May bend rules when beneficial');
      characteristics.push('Values status and material success');
      characteristics.push('Confident, possibly entitled');
    } else if (level === 'Very Low') {
      characteristics.push('Manipulative and self-serving tendencies');
      characteristics.push('Willing to exploit others for personal gain');
      characteristics.push('Highly materialistic and status-seeking');
      characteristics.push('Grandiose self-view');
      characteristics.push('High risk for counterproductive work behavior');
    }

    return characteristics;
  }

  /**
   * Get behavioral predictions based on HEXACO-H research
   */
  getPredictions() {
    const avg = this.scores.overall.average;
    const predictions = [];

    if (avg >= 4.0) {
      predictions.push({
        domain: 'Workplace',
        behaviors: ['Low counterproductive work behavior', 'High ethical decision-making', 'Strong organizational citizenship']
      });
      predictions.push({
        domain: 'Relationships',
        behaviors: ['Cooperative and fair', 'Low manipulation or exploitation', 'High trust and integrity']
      });
      predictions.push({
        domain: 'Financial',
        behaviors: ['Conservative with money', 'Low materialistic goals', 'Resistant to fraud or corruption']
      });
    } else if (avg >= 3.0) {
      predictions.push({
        domain: 'Workplace',
        behaviors: ['Moderate work ethics', 'Generally honest in dealings', 'Some competitive behavior']
      });
      predictions.push({
        domain: 'Relationships',
        behaviors: ['Generally cooperative', 'Occasional self-serving behavior', 'Moderate trust levels']
      });
    } else {
      predictions.push({
        domain: 'Workplace',
        behaviors: ['High risk for counterproductive work behavior', 'May engage in office politics or manipulation', 'Self-interest prioritized over team']
      });
      predictions.push({
        domain: 'Relationships',
        behaviors: ['Manipulative tendencies', 'Exploitation of others possible', 'Low empathy or fairness']
      });
      predictions.push({
        domain: 'Dark Triad Risk',
        behaviors: ['Overlap with Machiavellianism', 'Possible narcissistic traits', 'Psychopathy correlation (low empathy)']
      });
    }

    return predictions;
  }

  /**
   * Get recommendations based on score
   */
  getRecommendations() {
    const recommendations = [];
    const avg = this.scores.overall.average;

    if (avg >= 4.0) {
      recommendations.push('Your integrity and honesty are strengths - continue to leverage them');
      recommendations.push('Be aware that others may take advantage of your good nature');
      recommendations.push('Balance humility with appropriate self-advocacy');
    } else if (avg >= 3.0) {
      recommendations.push('Consider the long-term benefits of ethical behavior');
      recommendations.push('Reflect on how manipulation or rule-breaking affects relationships');
      recommendations.push('Balance self-interest with consideration for others');
    } else {
      recommendations.push('Consider how self-serving behavior impacts long-term success');
      recommendations.push('Work on building genuine connections rather than manipulative ones');
      recommendations.push('Reflect on ethical decision-making and its importance');
      recommendations.push('Consider whether material/status goals align with deeper values');
    }

    // Facet-specific recommendations
    if (this.scores.facets.sincerity.average < 2.5) {
      recommendations.push('Work on authenticity and genuine self-presentation');
    }

    if (this.scores.facets.fairness.average < 2.5) {
      recommendations.push('Consider the importance of rules and fairness for social functioning');
    }

    if (this.scores.facets.greedAvoidance.average < 2.5) {
      recommendations.push('Reflect on whether material wealth truly brings lasting satisfaction');
    }

    if (this.scores.facets.modesty.average < 2.5) {
      recommendations.push('Practice humility and realistic self-assessment');
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
   */
  scoreToPercentile(score) {
    // Assuming normal distribution with mean=3.0, SD=0.7
    if (score >= 4.5) return 95;
    if (score >= 4.0) return 85;
    if (score >= 3.5) return 70;
    if (score >= 3.0) return 50;
    if (score >= 2.5) return 30;
    if (score >= 2.0) return 15;
    return 5;
  }

  /**
   * Get honesty level category
   */
  getHonestyLevel(average) {
    if (average >= 4.5) return 'Very High';
    if (average >= 3.7) return 'High';
    if (average >= 2.3) return 'Moderate';
    if (average >= 1.5) return 'Low';
    return 'Very Low';
  }

  /**
   * Format facet name for display
   */
  formatFacetName(facetName) {
    const nameMap = {
      sincerity: 'Sincerity',
      fairness: 'Fairness',
      greedAvoidance: 'Greed Avoidance',
      modesty: 'Modesty'
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

module.exports = HEXACOScorer;
