/**
 * ACEs Calculator (Adverse Childhood Experiences)
 *
 * Calculates ACEs score based on 10 categories of childhood adversity:
 * - Abuse: Physical, Emotional, Sexual
 * - Neglect: Physical, Emotional
 * - Household Dysfunction: Substance abuse, Mental illness, Incarceration,
 *   Domestic violence, Parental separation/divorce
 *
 * ACEs Score: 0-10 (count of categories experienced)
 *
 * Research shows strong dose-response relationship between ACEs and:
 * - Mental health disorders (depression, anxiety, PTSD, suicide attempts)
 * - Substance use disorders
 * - Chronic health conditions
 * - Premature mortality
 *
 * Source: Felitti et al. (1998) - Original ACEs Study
 */

const logger = require('../utils/logger');

// ACEs question IDs
const ACES_ITEMS = {
  physicalAbuse: 'ACES_ABUSE_PHYSICAL',
  emotionalAbuse: 'ACES_ABUSE_EMOTIONAL',
  sexualAbuse: 'ACES_ABUSE_SEXUAL',
  physicalNeglect: 'ACES_NEGLECT_PHYSICAL',
  emotionalNeglect: 'ACES_NEGLECT_EMOTIONAL',
  householdSubstance: 'ACES_HOUSEHOLD_SUBSTANCE',
  householdMental: 'ACES_HOUSEHOLD_MENTAL',
  householdIncarcerated: 'ACES_HOUSEHOLD_INCARCERATED',
  householdViolence: 'ACES_HOUSEHOLD_VIOLENCE',
  householdDivorce: 'ACES_HOUSEHOLD_DIVORCE'
};

class ACEsCalculator {
  constructor(responses) {
    this.responses = responses;
    this.scores = {
      categories: {
        physicalAbuse: 0,
        emotionalAbuse: 0,
        sexualAbuse: 0,
        physicalNeglect: 0,
        emotionalNeglect: 0,
        householdSubstance: 0,
        householdMental: 0,
        householdIncarcerated: 0,
        householdViolence: 0,
        householdDivorce: 0
      },
      totalScore: 0,
      riskLevel: 'Unknown',
      domains: {
        abuse: 0,
        neglect: 0,
        householdDysfunction: 0
      }
    };
  }

  /**
   * Calculate ACEs score
   */
  calculate() {
    this.calculateCategories();
    this.calculateDomains();
    this.calculateTotal();
    this.assessRisk();

    return this.getACEsReport();
  }

  /**
   * Calculate individual ACEs categories
   */
  calculateCategories() {
    for (const [category, questionId] of Object.entries(ACES_ITEMS)) {
      const resp = this.findResponse(questionId);

      if (resp) {
        const score = this.getBinaryScore(resp);
        this.scores.categories[category] = score;
      }
    }
  }

  /**
   * Calculate domain scores
   */
  calculateDomains() {
    // Abuse domain (3 categories)
    this.scores.domains.abuse =
      this.scores.categories.physicalAbuse +
      this.scores.categories.emotionalAbuse +
      this.scores.categories.sexualAbuse;

    // Neglect domain (2 categories)
    this.scores.domains.neglect =
      this.scores.categories.physicalNeglect +
      this.scores.categories.emotionalNeglect;

    // Household dysfunction domain (5 categories)
    this.scores.domains.householdDysfunction =
      this.scores.categories.householdSubstance +
      this.scores.categories.householdMental +
      this.scores.categories.householdIncarcerated +
      this.scores.categories.householdViolence +
      this.scores.categories.householdDivorce;
  }

  /**
   * Calculate total ACEs score (0-10)
   */
  calculateTotal() {
    this.scores.totalScore = Object.values(this.scores.categories).reduce((a, b) => a + b, 0);
    logger.info(`[ACEs] Total score: ${this.scores.totalScore}/10`);
  }

  /**
   * Assess risk level based on total score
   */
  assessRisk() {
    const score = this.scores.totalScore;

    if (score === 0) {
      this.scores.riskLevel = 'None';
    } else if (score <= 3) {
      this.scores.riskLevel = 'Low to Moderate';
    } else if (score <= 6) {
      this.scores.riskLevel = 'Moderate to High';
    } else {
      this.scores.riskLevel = 'High to Very High';
    }
  }

  /**
   * Get comprehensive ACEs report
   */
  getACEsReport() {
    return {
      scores: this.scores,
      summary: this.generateSummary(),
      healthRisks: this.getHealthRisks(),
      recommendations: this.getRecommendations(),
      alerts: this.getAlerts()
    };
  }

  /**
   * Generate human-readable summary
   */
  generateSummary() {
    const score = this.scores.totalScore;

    if (score === 0) {
      return 'No adverse childhood experiences reported.';
    }

    let summary = `ACEs score: ${score}/10 (${this.scores.riskLevel} risk). `;

    // Identify primary domains
    const primaryDomains = [];
    if (this.scores.domains.abuse > 0) primaryDomains.push('abuse');
    if (this.scores.domains.neglect > 0) primaryDomains.push('neglect');
    if (this.scores.domains.householdDysfunction > 0) primaryDomains.push('household dysfunction');

    if (primaryDomains.length > 0) {
      summary += `Experienced: ${primaryDomains.join(', ')}. `;
    }

    if (score >= 4) {
      summary += 'Significant childhood adversity detected - trauma-informed care recommended.';
    } else {
      summary += 'Some childhood adversity experienced.';
    }

    return summary;
  }

  /**
   * Get health risks associated with ACEs score
   */
  getHealthRisks() {
    const score = this.scores.totalScore;
    const risks = [];

    if (score === 0) {
      return risks; // No elevated risks
    }

    // Mental Health Risks
    if (score >= 1) {
      risks.push({
        category: 'Mental Health',
        conditions: [
          'Depression (2-5x increased risk)',
          'Anxiety disorders (2-4x increased risk)'
        ]
      });
    }

    if (score >= 4) {
      risks.push({
        category: 'Mental Health (Elevated)',
        conditions: [
          'Suicide attempts (12x increased risk)',
          'PTSD/Complex PTSD (high probability)',
          'Personality disorders (increased risk)'
        ]
      });
    }

    // Substance Use Risks
    if (score >= 2) {
      risks.push({
        category: 'Substance Use',
        conditions: [
          'Alcohol abuse (2-4x increased risk)',
          'Drug use (2-4x increased risk)'
        ]
      });
    }

    if (score >= 5) {
      risks.push({
        category: 'Substance Use (High Risk)',
        conditions: [
          'Injection drug use (10x increased risk)',
          'Alcoholism (7x increased risk)'
        ]
      });
    }

    // Physical Health Risks
    if (score >= 4) {
      risks.push({
        category: 'Physical Health',
        conditions: [
          'Chronic obstructive pulmonary disease (COPD)',
          'Heart disease (2x increased risk)',
          'Liver disease',
          'Chronic pain conditions'
        ]
      });
    }

    if (score >= 6) {
      risks.push({
        category: 'Longevity',
        conditions: [
          'Life expectancy reduced by 20 years',
          'Increased risk of premature death'
        ]
      });
    }

    return risks;
  }

  /**
   * Get clinical recommendations
   */
  getRecommendations() {
    const recommendations = [];
    const score = this.scores.totalScore;

    if (score === 0) {
      return recommendations; // No recommendations needed
    }

    // General recommendations
    if (score >= 1) {
      recommendations.push('Consider trauma-informed therapy (EMDR, trauma-focused CBT)');
      recommendations.push('Self-care and stress management are important');
    }

    if (score >= 4) {
      recommendations.push('Seek evaluation from trauma specialist');
      recommendations.push('CRITICAL: Trauma-informed care is essential - inform all healthcare providers of ACEs');
      recommendations.push('Building secure attachments and social support network is crucial');
      recommendations.push('Consider screening for Complex PTSD');
    }

    // Sexual abuse specific
    if (this.scores.categories.sexualAbuse === 1) {
      recommendations.push('Trauma therapy with sexual abuse specialization recommended');
      recommendations.push('Support groups for survivors can be helpful');
    }

    // Neglect specific
    if (this.scores.domains.neglect >= 2) {
      recommendations.push('Attachment-based therapy may be beneficial');
      recommendations.push('Work on building self-compassion and self-worth');
    }

    // Household dysfunction specific
    if (this.scores.domains.householdDysfunction >= 3) {
      recommendations.push('Family systems therapy may help understand relationship patterns');
      recommendations.push('Adult Children of Alcoholics (ACoA) or similar support groups');
    }

    // High score recommendations
    if (score >= 7) {
      recommendations.push('Comprehensive mental health evaluation strongly recommended');
      recommendations.push('Monitor for PTSD, depression, substance use');
      recommendations.push('Prioritize healing and professional support');
    }

    return recommendations;
  }

  /**
   * Get critical alerts
   */
  getAlerts() {
    const alerts = [];
    const score = this.scores.totalScore;

    // High ACEs alert
    if (score >= 4) {
      alerts.push({
        type: 'HIGH_ACES_SCORE',
        severity: 'HIGH',
        message: `High ACEs score detected (${score}/10)`,
        recommendation: 'Trauma-informed care strongly recommended. Increased risk for multiple health conditions.'
      });
    }

    // Very high ACEs alert
    if (score >= 7) {
      alerts.push({
        type: 'VERY_HIGH_ACES',
        severity: 'CRITICAL',
        message: `Very high ACEs score (${score}/10) - significant childhood trauma`,
        recommendation: 'URGENT: Comprehensive trauma evaluation needed. High risk for complex mental health conditions.'
      });
    }

    // Sexual abuse alert
    if (this.scores.categories.sexualAbuse === 1) {
      alerts.push({
        type: 'SEXUAL_ABUSE_HISTORY',
        severity: 'HIGH',
        message: 'Childhood sexual abuse history detected',
        recommendation: 'Specialized trauma therapy strongly recommended. High risk for PTSD and dissociative symptoms.'
      });
    }

    // Multiple abuse types
    const abuseCount = this.scores.domains.abuse;
    if (abuseCount >= 2) {
      alerts.push({
        type: 'MULTIPLE_ABUSE_TYPES',
        severity: 'HIGH',
        message: `Multiple forms of abuse detected (${abuseCount} types)`,
        recommendation: 'Complex trauma likely - comprehensive trauma-focused treatment needed.'
      });
    }

    return alerts;
  }

  /**
   * Helper: Get binary score (0 or 1)
   */
  getBinaryScore(response) {
    if (typeof response.score === 'number') {
      return response.score;
    }

    const scoreMap = {
      'Yes': 1,
      'No': 0,
      'true': 1,
      'false': 0
    };

    return scoreMap[response.response] || scoreMap[response.value] || 0;
  }

  /**
   * Helper: Find response by question ID
   */
  findResponse(questionId) {
    return this.responses.find(r => r.questionId === questionId);
  }
}

module.exports = ACEsCalculator;
