/**
 * Psychosis/Thought Disorder Scorer
 *
 * Calculates psychosis risk using:
 * - PQ-B (Prodromal Questionnaire-Brief) - Gold standard for psychosis risk screening
 *
 * PQ-B Positive Screen Criteria:
 * - ≥6 "Yes" answers
 * - Moderate to high distress from experiences
 *
 * Subscales:
 * - Positive symptoms (hallucinations, delusions, thought disorder)
 * - Negative symptoms (avolition, anhedonia, flat affect)
 * - Disorganization (thought/speech disorganization)
 *
 * Sensitivity: 87%, Specificity: 87% (Loewy et al., 2011)
 */

const logger = require('../utils/logger');

// PQ-B question IDs
const PQB_POSITIVE_ITEMS = [
  'PSYCHOSIS_PQB_1',   // Auditory hallucinations
  'PSYCHOSIS_PQB_2',   // Visual hallucinations
  'PSYCHOSIS_PQB_3',   // Paranoia
  'PSYCHOSIS_PQB_4',   // Grandiosity
  'PSYCHOSIS_PQB_5',   // Magical thinking
  'PSYCHOSIS_PQB_6',   // Thought control
  'PSYCHOSIS_PQB_7'    // Thought broadcasting
];

const PQB_NEGATIVE_ITEMS = [
  'PSYCHOSIS_PQB_8',   // Anhedonia
  'PSYCHOSIS_PQB_9',   // Flat affect
  'PSYCHOSIS_PQB_10',  // Alogia
  'PSYCHOSIS_PQB_11',  // Avolition
  'PSYCHOSIS_PQB_12'   // Social withdrawal
];

const PQB_DISORGANIZATION_ITEMS = [
  'PSYCHOSIS_PQB_13',  // Tangential thinking
  'PSYCHOSIS_PQB_14',  // Disorganized thought
  'PSYCHOSIS_PQB_15',  // Communication difficulty
  'PSYCHOSIS_PQB_16',  // Bizarre behavior
  'PSYCHOSIS_PQB_17'   // Confusion
];

const DISTRESS_ITEM = 'PSYCHOSIS_PQB_DISTRESS';

class PsychosisScorer {
  constructor(responses) {
    this.responses = responses;
    this.scores = {
      positive: {
        total: 0,
        count: 0,
        severity: 'Unknown'
      },
      negative: {
        total: 0,
        count: 0,
        severity: 'Unknown'
      },
      disorganization: {
        total: 0,
        count: 0,
        severity: 'Unknown'
      },
      overall: {
        total: 0,
        distress: 0,
        positiveScreen: false,
        risk: 'Unknown'
      }
    };
  }

  /**
   * Calculate all psychosis scores
   */
  calculate() {
    this.calculatePositiveSymptoms();
    this.calculateNegativeSymptoms();
    this.calculateDisorganization();
    this.calculateOverall();

    return this.getPsychosisReport();
  }

  /**
   * Calculate positive symptoms (hallucinations, delusions)
   */
  calculatePositiveSymptoms() {
    let total = 0;
    let count = 0;

    PQB_POSITIVE_ITEMS.forEach(qid => {
      const resp = this.findResponse(qid);

      if (resp) {
        const score = this.getBinaryScore(resp);
        total += score;
        count++;
      }
    });

    if (count > 0) {
      this.scores.positive.total = total;
      this.scores.positive.count = count;
      this.scores.positive.severity = this.getSubscaleSeverity(total, count);

      logger.info(`[PSYCHOSIS] Positive symptoms: ${total}/${count}`);
    }
  }

  /**
   * Calculate negative symptoms (flat affect, avolition, etc.)
   */
  calculateNegativeSymptoms() {
    let total = 0;
    let count = 0;

    PQB_NEGATIVE_ITEMS.forEach(qid => {
      const resp = this.findResponse(qid);

      if (resp) {
        const score = this.getBinaryScore(resp);
        total += score;
        count++;
      }
    });

    if (count > 0) {
      this.scores.negative.total = total;
      this.scores.negative.count = count;
      this.scores.negative.severity = this.getSubscaleSeverity(total, count);

      logger.info(`[PSYCHOSIS] Negative symptoms: ${total}/${count}`);
    }
  }

  /**
   * Calculate disorganization symptoms
   */
  calculateDisorganization() {
    let total = 0;
    let count = 0;

    PQB_DISORGANIZATION_ITEMS.forEach(qid => {
      const resp = this.findResponse(qid);

      if (resp) {
        const score = this.getBinaryScore(resp);
        total += score;
        count++;
      }
    });

    if (count > 0) {
      this.scores.disorganization.total = total;
      this.scores.disorganization.count = count;
      this.scores.disorganization.severity = this.getSubscaleSeverity(total, count);

      logger.info(`[PSYCHOSIS] Disorganization: ${total}/${count}`);
    }
  }

  /**
   * Calculate overall psychosis risk
   */
  calculateOverall() {
    const totalSymptoms =
      this.scores.positive.total +
      this.scores.negative.total +
      this.scores.disorganization.total;

    this.scores.overall.total = totalSymptoms;

    // Get distress level
    const distressResp = this.findResponse(DISTRESS_ITEM);
    if (distressResp) {
      this.scores.overall.distress = this.getLikertScore(distressResp);
    }

    // Positive screen: ≥6 symptoms AND moderate-high distress (≥3)
    this.scores.overall.positiveScreen =
      totalSymptoms >= 6 && this.scores.overall.distress >= 3;

    this.scores.overall.risk = this.getRiskLevel(totalSymptoms, this.scores.overall.distress);

    logger.info(`[PSYCHOSIS] Overall: ${totalSymptoms} symptoms, distress: ${this.scores.overall.distress}, positive screen: ${this.scores.overall.positiveScreen}`);
  }

  /**
   * Get comprehensive psychosis report
   */
  getPsychosisReport() {
    return {
      scores: this.scores,
      summary: this.generateSummary(),
      recommendations: this.getRecommendations(),
      alerts: this.getAlerts()
    };
  }

  /**
   * Generate human-readable summary
   */
  generateSummary() {
    const total = this.scores.overall.total;
    const positiveScreen = this.scores.overall.positiveScreen;

    if (total === 0) {
      return 'No psychotic-spectrum symptoms detected.';
    }

    if (!positiveScreen) {
      return `Some unusual experiences detected (${total} symptoms), but below clinical threshold or low distress. Monitor for changes.`;
    }

    let summary = `Positive screen for psychosis risk (${total} symptoms with significant distress). `;

    // Identify dominant symptom type
    const dominant = this.getDominantSymptomType();
    if (dominant) {
      summary += `Primarily ${dominant} symptoms. `;
    }

    summary += 'Urgent psychiatric evaluation strongly recommended.';

    return summary;
  }

  /**
   * Determine dominant symptom type
   */
  getDominantSymptomType() {
    const scores = [
      { type: 'positive', score: this.scores.positive.total },
      { type: 'negative', score: this.scores.negative.total },
      { type: 'disorganization', score: this.scores.disorganization.total }
    ];

    const max = scores.reduce((a, b) => a.score > b.score ? a : b);

    if (max.score === 0) return null;

    return max.type;
  }

  /**
   * Get clinical recommendations
   */
  getRecommendations() {
    const recommendations = [];
    const total = this.scores.overall.total;
    const positiveScreen = this.scores.overall.positiveScreen;

    if (total === 0) {
      return recommendations; // No recommendations needed
    }

    if (positiveScreen) {
      recommendations.push('URGENT: Seek psychiatric evaluation immediately');
      recommendations.push('Early intervention for psychosis significantly improves outcomes');
      recommendations.push('Do not delay - psychotic symptoms require specialized treatment');
      recommendations.push('Family members should be informed and supportive');
    } else if (total >= 3) {
      recommendations.push('Monitor symptoms closely for any worsening or increased distress');
      recommendations.push('Consider discussing with mental health provider');
      recommendations.push('Avoid substance use (can trigger or worsen psychotic symptoms)');
    }

    // Symptom-specific recommendations
    if (this.scores.positive.total >= 2) {
      recommendations.push('Positive symptoms (hallucinations/delusions) respond well to antipsychotic medication');
      recommendations.push('Cognitive-Behavioral Therapy for Psychosis (CBTp) can help manage symptoms');
    }

    if (this.scores.negative.total >= 3) {
      recommendations.push('Negative symptoms may require different treatment approach');
      recommendations.push('Social skills training and supported employment can help with negative symptoms');
    }

    if (this.scores.disorganization.total >= 2) {
      recommendations.push('Disorganized thinking may benefit from structured cognitive remediation');
    }

    return recommendations;
  }

  /**
   * Get critical alerts
   */
  getAlerts() {
    const alerts = [];

    // Positive screen alert
    if (this.scores.overall.positiveScreen) {
      alerts.push({
        type: 'PSYCHOSIS_RISK_POSITIVE',
        severity: 'CRITICAL',
        message: 'Positive screen for psychosis risk - urgent evaluation needed',
        score: this.scores.overall.total,
        distress: this.scores.overall.distress,
        recommendation: 'IMMEDIATE psychiatric evaluation required. Early intervention critical for best outcomes.'
      });
    }

    // Hallucinations alert
    const auditoryHall = this.findResponse('PSYCHOSIS_PQB_1');
    const visualHall = this.findResponse('PSYCHOSIS_PQB_2');

    if ((auditoryHall && this.getBinaryScore(auditoryHall) === 1) ||
        (visualHall && this.getBinaryScore(visualHall) === 1)) {
      alerts.push({
        type: 'HALLUCINATIONS_DETECTED',
        severity: 'CRITICAL',
        message: 'Hallucinations (auditory or visual) detected',
        recommendation: 'Urgent psychiatric evaluation. Hallucinations indicate active psychotic symptoms.'
      });
    }

    // Thought control/broadcasting alert
    const thoughtControl = this.findResponse('PSYCHOSIS_PQB_6');
    const thoughtBroadcast = this.findResponse('PSYCHOSIS_PQB_7');

    if ((thoughtControl && this.getBinaryScore(thoughtControl) === 1) ||
        (thoughtBroadcast && this.getBinaryScore(thoughtBroadcast) === 1)) {
      alerts.push({
        type: 'THOUGHT_DISORDER_SEVERE',
        severity: 'CRITICAL',
        message: 'Severe thought disorder symptoms detected (thought control/broadcasting)',
        recommendation: 'URGENT psychiatric evaluation. These are first-rank symptoms of psychosis.'
      });
    }

    // High total symptoms
    if (this.scores.overall.total >= 10) {
      alerts.push({
        type: 'HIGH_PSYCHOSIS_SYMPTOMS',
        severity: 'CRITICAL',
        message: 'Very high number of psychotic symptoms detected',
        score: this.scores.overall.total,
        recommendation: 'IMMEDIATE psychiatric care needed. Multiple psychotic symptoms present.'
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
   * Get subscale severity
   */
  getSubscaleSeverity(total, max) {
    const percentage = total / max;
    if (percentage === 0) return 'None';
    if (percentage < 0.3) return 'Minimal';
    if (percentage < 0.5) return 'Mild';
    if (percentage < 0.7) return 'Moderate';
    return 'High';
  }

  /**
   * Get overall risk level
   */
  getRiskLevel(totalSymptoms, distress) {
    if (totalSymptoms === 0) return 'None';

    if (totalSymptoms >= 6 && distress >= 4) return 'Very High';
    if (totalSymptoms >= 6 && distress >= 3) return 'High';
    if (totalSymptoms >= 3) return 'Moderate';
    return 'Low';
  }

  /**
   * Helper: Find response by question ID
   */
  findResponse(questionId) {
    return this.responses.find(r => r.questionId === questionId);
  }
}

module.exports = PsychosisScorer;
