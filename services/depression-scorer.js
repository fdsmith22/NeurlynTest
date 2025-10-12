/**
 * Depression Scorer
 *
 * Calculates depression severity using:
 * - PHQ-9 (Patient Health Questionnaire-9) - Gold standard
 * - Additional clinical depression indicators
 *
 * PHQ-9 Severity Levels:
 * - None: 0-4
 * - Mild: 5-9
 * - Moderate: 10-14
 * - Moderately Severe: 15-19
 * - Severe: 20-27
 */

const logger = require('../utils/logger');

// PHQ-9 question IDs
const PHQ9_ITEMS = [
  'DEPRESSION_PHQ9_1',  // Anhedonia
  'DEPRESSION_PHQ9_2',  // Depressed mood
  'DEPRESSION_PHQ9_3',  // Sleep
  'DEPRESSION_PHQ9_4',  // Energy
  'DEPRESSION_PHQ9_5',  // Appetite
  'DEPRESSION_PHQ9_6',  // Guilt/worthlessness
  'DEPRESSION_PHQ9_7',  // Concentration
  'DEPRESSION_PHQ9_8',  // Psychomotor
  'DEPRESSION_PHQ9_9'   // Suicidal ideation
];

// Additional clinical depression items
const CLINICAL_DEPRESSION_ITEMS = [
  'DEPRESSION_CLINICAL_1',  // Nothing matters
  'DEPRESSION_CLINICAL_2',  // Lost interest in activities
  'DEPRESSION_CLINICAL_3',  // Emotional numbness
  'DEPRESSION_CLINICAL_4',  // Can't get out of bed
  'DEPRESSION_CLINICAL_5',  // Emptiness
  'DEPRESSION_CLINICAL_6',  // Difficulty experiencing pleasure
  'DEPRESSION_CLINICAL_7',  // Crying
  'DEPRESSION_CLINICAL_8',  // Going through motions
  'DEPRESSION_CLINICAL_9'   // Tasks feel impossible
];

// Baseline screening
const BASELINE_DEPRESSION_ITEM = 'BASELINE_CLINICAL_DEPRESSION';

class DepressionScorer {
  constructor(responses) {
    this.responses = responses;
    this.scores = {
      phq9: {
        total: 0,
        severity: 'Unknown',
        severityLevel: 0,
        itemScores: {}
      },
      clinical: {
        total: 0,
        average: 0,
        count: 0
      },
      composite: {
        score: 0,
        severity: 'Unknown'
      },
      suicidalIdeation: {
        detected: false,
        score: 0,
        severity: 'None'
      }
    };
  }

  /**
   * Calculate all depression scores
   */
  calculate() {
    this.calculatePHQ9();
    this.calculateClinicalDepression();
    this.assessSuicidalIdeation();
    this.calculateComposite();

    return this.getDepressionReport();
  }

  /**
   * Calculate PHQ-9 score (0-27)
   */
  calculatePHQ9() {
    let total = 0;
    let answeredCount = 0;

    PHQ9_ITEMS.forEach((qid, index) => {
      const resp = this.findResponse(qid);

      if (resp) {
        const score = this.getPhq9Score(resp);
        this.scores.phq9.itemScores[`item${index + 1}`] = score;
        total += score;
        answeredCount++;
      }
    });

    // Only calculate if at least 7/9 items answered
    if (answeredCount >= 7) {
      this.scores.phq9.total = total;
      this.scores.phq9.severity = this.getPhq9Severity(total);
      this.scores.phq9.severityLevel = this.getPhq9SeverityLevel(total);

      logger.info(`[DEPRESSION] PHQ-9 Score: ${total}/27 (${this.scores.phq9.severity})`);
    } else {
      logger.warn(`[DEPRESSION] PHQ-9 incomplete: only ${answeredCount}/9 items answered`);
    }
  }

  /**
   * Calculate clinical depression indicators
   */
  calculateClinicalDepression() {
    let total = 0;
    let count = 0;

    CLINICAL_DEPRESSION_ITEMS.forEach(qid => {
      const resp = this.findResponse(qid);

      if (resp) {
        const score = this.getLikertScore(resp);
        total += score;
        count++;
      }
    });

    if (count > 0) {
      this.scores.clinical.total = total;
      this.scores.clinical.count = count;
      this.scores.clinical.average = total / count;

      logger.info(`[DEPRESSION] Clinical indicators: ${total}/${count * 5} (avg: ${this.scores.clinical.average.toFixed(2)})`);
    }
  }

  /**
   * Assess suicidal ideation specifically
   */
  assessSuicidalIdeation() {
    // PHQ-9 Item 9 (primary)
    const phq9Item9 = this.findResponse('DEPRESSION_PHQ9_9');

    if (phq9Item9) {
      const score = this.getPhq9Score(phq9Item9);
      this.scores.suicidalIdeation.score = score;
      this.scores.suicidalIdeation.detected = score > 0;

      if (score === 0) {
        this.scores.suicidalIdeation.severity = 'None';
      } else if (score === 1) {
        this.scores.suicidalIdeation.severity = 'Mild';
      } else if (score === 2) {
        this.scores.suicidalIdeation.severity = 'Moderate';
      } else {
        this.scores.suicidalIdeation.severity = 'Severe';
      }

      logger.info(`[DEPRESSION] Suicidal ideation: ${this.scores.suicidalIdeation.severity} (score: ${score})`);
    }
  }

  /**
   * Calculate composite depression score
   * Combines PHQ-9 and clinical indicators
   */
  calculateComposite() {
    // If we have PHQ-9, use it as primary
    if (this.scores.phq9.total > 0) {
      this.scores.composite.score = this.scores.phq9.total;
      this.scores.composite.severity = this.scores.phq9.severity;
    }
    // Otherwise, use clinical indicators if available
    else if (this.scores.clinical.count > 0) {
      // Convert clinical average (1-5) to PHQ-9 scale (0-27)
      const scaledScore = (this.scores.clinical.average - 1) * 6.75; // (5-1) = 4, 4 * 6.75 = 27
      this.scores.composite.score = Math.round(scaledScore);
      this.scores.composite.severity = this.getPhq9Severity(this.scores.composite.score);
    }
  }

  /**
   * Get comprehensive depression report
   */
  getDepressionReport() {
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
    const severity = this.scores.composite.severity;

    if (severity === 'Unknown') {
      return 'Depression severity could not be determined (insufficient data).';
    }

    if (severity === 'None') {
      return 'No clinically significant depressive symptoms detected.';
    }

    if (severity === 'Mild') {
      return 'Mild depressive symptoms detected. Monitoring and self-care recommended.';
    }

    if (severity === 'Moderate') {
      return 'Moderate depression detected. Professional evaluation and treatment recommended.';
    }

    if (severity === 'Moderately Severe') {
      return 'Moderately severe depression detected. Professional treatment strongly recommended.';
    }

    if (severity === 'Severe') {
      return 'Severe depression detected. Immediate professional intervention recommended.';
    }

    return 'Depression assessment complete.';
  }

  /**
   * Get clinical recommendations based on severity
   */
  getRecommendations() {
    const recommendations = [];
    const severity = this.scores.composite.severity;

    if (severity === 'Mild') {
      recommendations.push('Consider lifestyle modifications (exercise, sleep hygiene, social connection)');
      recommendations.push('Monitor symptoms; seek help if they worsen');
      recommendations.push('Self-help resources and support groups may be beneficial');
    }

    if (severity === 'Moderate' || severity === 'Moderately Severe' || severity === 'Severe') {
      recommendations.push('Seek evaluation from a mental health professional');
      recommendations.push('Evidence-based treatments include therapy (CBT, IPT) and/or medication');
      recommendations.push('Do not face this alone - professional help is effective');
    }

    if (severity === 'Severe') {
      recommendations.push('URGENT: Contact a mental health crisis line or emergency services if in crisis');
      recommendations.push('Consider intensive outpatient or inpatient treatment if safety is a concern');
    }

    if (this.scores.suicidalIdeation.detected) {
      recommendations.push('IMPORTANT: Suicidal thoughts detected - seek immediate support');
      recommendations.push('National Suicide Prevention Lifeline: 988 (US) or local emergency services');
    }

    return recommendations;
  }

  /**
   * Get critical alerts
   */
  getAlerts() {
    const alerts = [];

    // Suicidal ideation alert
    if (this.scores.suicidalIdeation.detected) {
      alerts.push({
        type: 'SUICIDAL_IDEATION',
        severity: this.scores.suicidalIdeation.score >= 2 ? 'CRITICAL' : 'HIGH',
        message: 'Suicidal ideation detected',
        score: this.scores.suicidalIdeation.score,
        recommendation: 'Immediate safety assessment and professional intervention required'
      });
    }

    // Severe depression alert
    if (this.scores.phq9.severityLevel >= 4) {
      alerts.push({
        type: 'SEVERE_DEPRESSION',
        severity: 'HIGH',
        message: 'Severe depression detected',
        score: this.scores.phq9.total,
        recommendation: 'Urgent professional evaluation and treatment recommended'
      });
    }

    return alerts;
  }

  /**
   * Helper: Get PHQ-9 specific score (0-3)
   */
  getPhq9Score(response) {
    const scoreMap = {
      'Not at all': 0,
      'Several days': 1,
      'More than half the days': 2,
      'Nearly every day': 3,
      // Fallback to likert if needed
      'Strongly Disagree': 0,
      'Disagree': 1,
      'Neutral': 1,
      'Agree': 2,
      'Strongly Agree': 3
    };

    if (typeof response.score === 'number') {
      // Convert 1-5 likert to 0-3 PHQ-9
      return Math.min(3, Math.max(0, response.score - 1));
    }

    return scoreMap[response.response] || scoreMap[response.value] || 0;
  }

  /**
   * Helper: Get standard likert score (1-5)
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
   * Get PHQ-9 severity category
   */
  getPhq9Severity(score) {
    if (score <= 4) return 'None';
    if (score <= 9) return 'Mild';
    if (score <= 14) return 'Moderate';
    if (score <= 19) return 'Moderately Severe';
    return 'Severe';
  }

  /**
   * Get PHQ-9 severity level (0-4)
   */
  getPhq9SeverityLevel(score) {
    if (score <= 4) return 0;
    if (score <= 9) return 1;
    if (score <= 14) return 2;
    if (score <= 19) return 3;
    return 4;
  }

  /**
   * Helper: Find response by question ID
   */
  findResponse(questionId) {
    return this.responses.find(r => r.questionId === questionId);
  }
}

module.exports = DepressionScorer;
