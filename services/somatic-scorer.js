/**
 * Somatic Symptom Scorer
 *
 * Calculates somatic symptom severity based on:
 * - PHQ-15 (Patient Health Questionnaire-15)
 * - Health Anxiety screening
 *
 * Dimensions assessed:
 * 1. PHQ-15 Somatic Symptoms (10 questions):
 *    - Pain symptoms (stomach, back, joints, headaches, chest)
 *    - Cardiopulmonary (heart racing, shortness of breath)
 *    - Gastrointestinal (nausea, constipation/diarrhea)
 *    - Other (dizziness)
 *
 * 2. Health Anxiety (2 questions):
 *    - Worry about serious illness
 *    - Preoccupation with body sensations
 *
 * Outputs:
 * - PHQ-15 total score (0-30)
 * - Severity category (Minimal, Low, Medium, High)
 * - Symptom domain breakdown
 * - Health anxiety assessment
 *
 * Research basis:
 * - PHQ-15: Kroenke et al. (2002)
 * - Cronbach's α = .80
 * - Correlates with functional impairment and healthcare utilization
 */

const logger = require('../utils/logger');

// PHQ-15 items (0-2 scoring: Not bothered=0, Bothered a little=1, Bothered a lot=2)
const PHQ15_ITEMS = {
  pain: [
    'SOMATIC_PHQ15_1',   // Stomach pain
    'SOMATIC_PHQ15_2',   // Back pain
    'SOMATIC_PHQ15_3',   // Joint/limb pain
    'SOMATIC_PHQ15_4',   // Headaches
    'SOMATIC_PHQ15_5'    // Chest pain
  ],
  cardiopulmonary: [
    'SOMATIC_PHQ15_6',   // Heart pounding/racing
    'SOMATIC_PHQ15_7'    // Shortness of breath
  ],
  gastrointestinal: [
    'SOMATIC_PHQ15_8',   // Nausea/upset stomach
    'SOMATIC_PHQ15_9'    // Constipation/diarrhea
  ],
  other: [
    'SOMATIC_PHQ15_10'   // Dizziness
  ]
};

// Health anxiety items
const HEALTH_ANXIETY_ITEMS = [
  'SOMATIC_HEALTH_ANXIETY_1',  // Worry about serious illness
  'SOMATIC_HEALTH_ANXIETY_2'   // Preoccupation with body sensations
];

class SomaticScorer {
  constructor(responses) {
    this.responses = responses;
    this.scores = {
      phq15: {
        total: 0,
        severity: 'Unknown',
        domains: {
          pain: { total: 0, count: 0, average: 0 },
          cardiopulmonary: { total: 0, count: 0, average: 0 },
          gastrointestinal: { total: 0, count: 0, average: 0 },
          other: { total: 0, count: 0, average: 0 }
        },
        symptomCount: 0  // Number of symptoms rated as "bothered a lot"
      },
      healthAnxiety: {
        total: 0,
        average: 0,
        count: 0,
        level: 'Unknown'
      }
    };
  }

  /**
   * Calculate all somatic scores
   */
  calculate() {
    this.calculatePHQ15();
    this.calculateHealthAnxiety();

    return this.getSomaticReport();
  }

  /**
   * Calculate PHQ-15 scores
   */
  calculatePHQ15() {
    let overallTotal = 0;
    let overallCount = 0;
    let severeSymptomCount = 0;

    // Calculate domain scores
    for (const [domain, items] of Object.entries(PHQ15_ITEMS)) {
      let domainTotal = 0;
      let domainCount = 0;

      items.forEach(qid => {
        const resp = this.findResponse(qid);

        if (resp) {
          const score = this.getPHQ15Score(resp);
          domainTotal += score;
          domainCount++;
          overallTotal += score;
          overallCount++;

          // Count "bothered a lot" responses
          if (score === 2) {
            severeSymptomCount++;
          }
        }
      });

      if (domainCount > 0) {
        this.scores.phq15.domains[domain].total = domainTotal;
        this.scores.phq15.domains[domain].count = domainCount;
        this.scores.phq15.domains[domain].average = domainTotal / domainCount;

        logger.info(`[Somatic] ${domain}: ${domainTotal}/${domainCount * 2} (avg: ${(domainTotal / domainCount).toFixed(2)})`);
      }
    }

    // Overall PHQ-15 score
    this.scores.phq15.total = overallTotal;
    this.scores.phq15.symptomCount = severeSymptomCount;
    this.scores.phq15.severity = this.getPHQ15Severity(overallTotal);

    logger.info(`[Somatic] PHQ-15 Total: ${overallTotal}/30 (${this.scores.phq15.severity})`);
    logger.info(`[Somatic] Severe symptoms (bothered a lot): ${severeSymptomCount}`);
  }

  /**
   * Calculate health anxiety
   */
  calculateHealthAnxiety() {
    let total = 0;
    let count = 0;

    HEALTH_ANXIETY_ITEMS.forEach(qid => {
      const resp = this.findResponse(qid);

      if (resp) {
        const score = this.getLikertScore(resp);
        total += score;
        count++;
      }
    });

    if (count > 0) {
      this.scores.healthAnxiety.total = total;
      this.scores.healthAnxiety.count = count;
      this.scores.healthAnxiety.average = total / count;
      this.scores.healthAnxiety.level = this.getHealthAnxietyLevel(total / count);

      logger.info(`[Somatic] Health Anxiety: ${(total / count).toFixed(2)} (${this.scores.healthAnxiety.level})`);
    }
  }

  /**
   * Get comprehensive somatic report
   */
  getSomaticReport() {
    return {
      scores: this.scores,
      summary: this.generateSummary(),
      symptomAnalysis: this.getSymptomAnalysis(),
      healthAnxietyAnalysis: this.getHealthAnxietyAnalysis(),
      medicalRecommendations: this.getMedicalRecommendations(),
      recommendations: this.getRecommendations()
    };
  }

  /**
   * Generate human-readable summary
   */
  generateSummary() {
    const phq15Total = this.scores.phq15.total;
    const severity = this.scores.phq15.severity;
    const symptomCount = this.scores.phq15.symptomCount;
    const healthAnxiety = this.scores.healthAnxiety.level;

    let summary = `PHQ-15 Score: ${phq15Total}/30 (${severity} somatic symptom severity). `;
    summary += `${symptomCount} symptoms rated as "bothered a lot". `;

    if (healthAnxiety !== 'Unknown') {
      summary += `Health anxiety: ${healthAnxiety}. `;
    }

    // Identify most problematic domain
    const domainScores = Object.entries(this.scores.phq15.domains)
      .filter(([_, data]) => data.count > 0)
      .map(([name, data]) => ({ name, average: data.average }))
      .sort((a, b) => b.average - a.average);

    if (domainScores.length > 0 && domainScores[0].average >= 1.0) {
      summary += `Highest symptom domain: ${this.formatDomainName(domainScores[0].name)} (${domainScores[0].average.toFixed(2)}/2.0).`;
    }

    return summary;
  }

  /**
   * Get detailed symptom analysis
   */
  getSymptomAnalysis() {
    const analysis = {
      severity: this.scores.phq15.severity,
      totalScore: this.scores.phq15.total,
      severeSymptoms: this.scores.phq15.symptomCount,
      domains: [],
      functionalImpairment: this.getFunctionalImpairment()
    };

    // Domain analysis
    for (const [domain, data] of Object.entries(this.scores.phq15.domains)) {
      if (data.count > 0) {
        analysis.domains.push({
          domain: this.formatDomainName(domain),
          score: data.total,
          maxScore: data.count * 2,
          average: data.average,
          severity: this.getDomainSeverity(data.average)
        });
      }
    }

    // Sort domains by severity
    analysis.domains.sort((a, b) => b.average - a.average);

    return analysis;
  }

  /**
   * Get functional impairment estimate
   */
  getFunctionalImpairment() {
    const total = this.scores.phq15.total;

    if (total >= 15) {
      return {
        level: 'High',
        description: 'Significant functional impairment; may involve frequent healthcare utilization and work/social disability'
      };
    } else if (total >= 10) {
      return {
        level: 'Moderate',
        description: 'Moderate functional impairment; symptoms likely interfere with daily activities'
      };
    } else if (total >= 5) {
      return {
        level: 'Mild',
        description: 'Mild functional impairment; some interference with activities'
      };
    } else {
      return {
        level: 'Minimal',
        description: 'Minimal to no functional impairment'
      };
    }
  }

  /**
   * Get health anxiety analysis
   */
  getHealthAnxietyAnalysis() {
    const level = this.scores.healthAnxiety.level;
    const avg = this.scores.healthAnxiety.average;

    if (level === 'Unknown') {
      return {
        level: 'Unknown',
        description: 'Insufficient data'
      };
    }

    const analysis = {
      level: level,
      score: avg,
      description: ''
    };

    if (avg >= 4.0) {
      analysis.description = 'Very high health anxiety; excessive worry about illness and bodily sensations';
      analysis.likelyDiagnosis = 'Possible Illness Anxiety Disorder or Somatic Symptom Disorder';
    } else if (avg >= 3.5) {
      analysis.description = 'High health anxiety; significant worry about health';
      analysis.likelyDiagnosis = 'Health anxiety concerns warrant clinical attention';
    } else if (avg >= 3.0) {
      analysis.description = 'Moderate health anxiety; some preoccupation with health';
    } else {
      analysis.description = 'Low health anxiety; minimal worry about illness';
    }

    return analysis;
  }

  /**
   * Get medical recommendations
   */
  getMedicalRecommendations() {
    const recommendations = [];
    const phq15Total = this.scores.phq15.total;
    const severeSymptoms = this.scores.phq15.symptomCount;

    if (phq15Total >= 15) {
      recommendations.push({
        priority: 'High',
        recommendation: 'Comprehensive medical evaluation recommended to rule out underlying medical conditions'
      });
      recommendations.push({
        priority: 'High',
        recommendation: 'Evaluate for Somatic Symptom Disorder (SSD) with mental health professional'
      });
    } else if (phq15Total >= 10) {
      recommendations.push({
        priority: 'Moderate',
        recommendation: 'Medical evaluation recommended for persistent symptoms'
      });
      recommendations.push({
        priority: 'Moderate',
        recommendation: 'Consider mental health evaluation if symptoms lack medical explanation'
      });
    } else if (phq15Total >= 5) {
      recommendations.push({
        priority: 'Low-Moderate',
        recommendation: 'Discuss symptoms with primary care physician'
      });
    }

    // Domain-specific recommendations
    if (this.scores.phq15.domains.pain.average >= 1.5) {
      recommendations.push({
        priority: 'Moderate',
        recommendation: 'Pain management evaluation (multiple pain complaints present)'
      });
    }

    if (this.scores.phq15.domains.cardiopulmonary.average >= 1.5) {
      recommendations.push({
        priority: 'High',
        recommendation: 'Cardiac and pulmonary evaluation recommended for chest/breathing symptoms'
      });
    }

    if (this.scores.phq15.domains.gastrointestinal.average >= 1.5) {
      recommendations.push({
        priority: 'Moderate',
        recommendation: 'Gastroenterological evaluation if GI symptoms persist'
      });
    }

    // Health anxiety
    if (this.scores.healthAnxiety.average >= 4.0) {
      recommendations.push({
        priority: 'High',
        recommendation: 'Mental health evaluation for health anxiety/illness anxiety disorder'
      });
    }

    return recommendations;
  }

  /**
   * Get treatment recommendations
   */
  getRecommendations() {
    const recommendations = [];
    const phq15Total = this.scores.phq15.total;
    const healthAnxiety = this.scores.healthAnxiety.average;

    // PHQ-15 based recommendations
    if (phq15Total >= 15) {
      recommendations.push('IMMEDIATE: Seek comprehensive medical evaluation to rule out medical causes');
      recommendations.push('Consider mental health treatment for Somatic Symptom Disorder (CBT is effective)');
      recommendations.push('Integrated care approach (primary care + mental health) recommended');
      recommendations.push('Avoid excessive medical testing once serious conditions ruled out');
    } else if (phq15Total >= 10) {
      recommendations.push('Medical evaluation for persistent symptoms recommended');
      recommendations.push('Consider CBT for medically unexplained symptoms');
      recommendations.push('Mindfulness and stress reduction may help manage symptoms');
    } else if (phq15Total >= 5) {
      recommendations.push('Monitor symptoms and discuss with primary care physician');
      recommendations.push('Address lifestyle factors (stress, sleep, exercise)');
    }

    // Health anxiety recommendations
    if (healthAnxiety >= 4.0) {
      recommendations.push('CBT specifically for health anxiety is highly effective');
      recommendations.push('Reduce reassurance-seeking and excessive body checking');
      recommendations.push('Limit Dr. Google and health-related internet searches');
      recommendations.push('Exposure therapy for health-related fears may be beneficial');
    } else if (healthAnxiety >= 3.5) {
      recommendations.push('Address health anxiety in therapy to prevent escalation');
      recommendations.push('Practice tolerating uncertainty about health');
    }

    // Combined somatic + health anxiety
    if (phq15Total >= 10 && healthAnxiety >= 3.5) {
      recommendations.push('High somatic symptoms + health anxiety suggests Somatic Symptom Disorder');
      recommendations.push('Focus on managing anxiety rather than pursuing extensive medical testing');
    }

    return recommendations;
  }

  /**
   * Helper: Get PHQ-15 score (0-2 scale)
   */
  getPHQ15Score(response) {
    if (typeof response.score === 'number') {
      return response.score;
    }

    // PHQ-15 uses 0-2 scoring
    const scoreMap = {
      'Not bothered at all': 0,
      'Bothered a little': 1,
      'Bothered a lot': 2
    };

    return scoreMap[response.response] || scoreMap[response.value] || 0;
  }

  /**
   * Helper: Get likert score (1-5) for health anxiety
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
   * Get PHQ-15 severity category
   */
  getPHQ15Severity(total) {
    if (total >= 15) return 'High';
    if (total >= 10) return 'Medium';
    if (total >= 5) return 'Low';
    return 'Minimal';
  }

  /**
   * Get domain severity
   */
  getDomainSeverity(average) {
    if (average >= 1.5) return 'High';
    if (average >= 1.0) return 'Moderate';
    if (average >= 0.5) return 'Mild';
    return 'Minimal';
  }

  /**
   * Get health anxiety level
   */
  getHealthAnxietyLevel(average) {
    if (average >= 4.5) return 'Very High';
    if (average >= 4.0) return 'High';
    if (average >= 3.5) return 'Moderate-High';
    if (average >= 3.0) return 'Moderate';
    if (average >= 2.5) return 'Low-Moderate';
    return 'Low';
  }

  /**
   * Format domain name for display
   */
  formatDomainName(domain) {
    const nameMap = {
      pain: 'Pain Symptoms',
      cardiopulmonary: 'Cardiopulmonary Symptoms',
      gastrointestinal: 'Gastrointestinal Symptoms',
      other: 'Other Symptoms'
    };

    return nameMap[domain] || domain;
  }

  /**
   * Helper: Find response by question ID
   */
  findResponse(questionId) {
    return this.responses.find(r => r.questionId === questionId);
  }
}

module.exports = SomaticScorer;
