/**
 * Borderline Personality Features Scorer
 *
 * Calculates borderline personality disorder screening based on:
 * - MSI-BPD (McLean Screening Instrument for BPD)
 * - DSM-5 diagnostic criteria for Borderline Personality Disorder
 *
 * Dimensions assessed (9 DSM-5 criteria):
 * 1. Emotional Instability (3 questions)
 * 2. Identity Disturbance (2 questions)
 * 3. Interpersonal Instability (3 questions)
 * 4. Impulsivity (2 questions)
 * 5. Chronic Emptiness (1 question)
 * 6. Dissociation/Paranoia (1 question)
 * 7. Overall Impairment (1 question)
 *
 * Outputs:
 * - MSI-BPD criteria count (0-9)
 * - Domain severity scores
 * - Positive screen indicator (≥7 criteria)
 * - DBT recommendation if positive
 *
 * Research basis:
 * - MSI-BPD: Zanarini et al. (2003)
 * - Sensitivity: 81%, Specificity: 85%
 * - Positive screen (≥7): PPV = 0.74 for BPD diagnosis
 */

const logger = require('../utils/logger');

// MSI-BPD domain items
const BPD_DOMAINS = {
  emotionalInstability: [
    'BORDERLINE_EMOTIONAL_1',
    'BORDERLINE_EMOTIONAL_2',
    'BORDERLINE_EMOTIONAL_3'
  ],
  identityDisturbance: [
    'BORDERLINE_IDENTITY_1',
    'BORDERLINE_IDENTITY_2'
  ],
  interpersonalInstability: [
    'BORDERLINE_INTERPERSONAL_1',
    'BORDERLINE_INTERPERSONAL_2',
    'BORDERLINE_INTERPERSONAL_3'
  ],
  impulsivity: [
    'BORDERLINE_IMPULSIVITY_1',
    'BORDERLINE_IMPULSIVITY_2'
  ],
  chronicEmptiness: [
    'BORDERLINE_EMPTINESS_1'
  ],
  dissociationParanoia: [
    'BORDERLINE_DISSOCIATION_1'
  ],
  overallImpairment: [
    'BORDERLINE_IMPAIRMENT_1'
  ]
};

// Threshold for each domain to count as criterion met
const DOMAIN_THRESHOLD = 3.5;  // ≥3.5 on 1-5 Likert scale

class BorderlineScorer {
  constructor(responses) {
    this.responses = responses;
    this.scores = {
      domains: {
        emotionalInstability: { average: 0, count: 0, criterionMet: false },
        identityDisturbance: { average: 0, count: 0, criterionMet: false },
        interpersonalInstability: { average: 0, count: 0, criterionMet: false },
        impulsivity: { average: 0, count: 0, criterionMet: false },
        chronicEmptiness: { average: 0, count: 0, criterionMet: false },
        dissociationParanoia: { average: 0, count: 0, criterionMet: false },
        overallImpairment: { average: 0, count: 0, criterionMet: false }
      },
      totalCriteria: 0,
      positiveScreen: false,
      screeningLevel: 'Unknown'
    };
  }

  /**
   * Calculate all borderline scores
   */
  calculate() {
    this.calculateDomains();
    this.calculateTotalCriteria();
    this.determineScreeningLevel();

    return this.getBorderlineReport();
  }

  /**
   * Calculate domain scores
   */
  calculateDomains() {
    for (const [domain, items] of Object.entries(BPD_DOMAINS)) {
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
        const average = total / count;
        this.scores.domains[domain].average = average;
        this.scores.domains[domain].count = count;
        this.scores.domains[domain].criterionMet = average >= DOMAIN_THRESHOLD;

        logger.info(`[BPD] ${domain}: ${average.toFixed(2)} (criterion ${this.scores.domains[domain].criterionMet ? 'MET' : 'not met'})`);
      }
    }
  }

  /**
   * Calculate total criteria met
   */
  calculateTotalCriteria() {
    this.scores.totalCriteria = Object.values(this.scores.domains)
      .filter(d => d.criterionMet)
      .length;

    this.scores.positiveScreen = this.scores.totalCriteria >= 7;

    logger.info(`[BPD] Total criteria met: ${this.scores.totalCriteria}/9 (positive screen: ${this.scores.positiveScreen})`);
  }

  /**
   * Determine screening level
   */
  determineScreeningLevel() {
    const total = this.scores.totalCriteria;

    if (total >= 7) {
      this.scores.screeningLevel = 'Positive (High Probability BPD)';
    } else if (total >= 5) {
      this.scores.screeningLevel = 'Subthreshold (Some BPD Features)';
    } else if (total >= 3) {
      this.scores.screeningLevel = 'Low (Few BPD Features)';
    } else {
      this.scores.screeningLevel = 'Negative (Minimal BPD Features)';
    }
  }

  /**
   * Get comprehensive borderline report
   */
  getBorderlineReport() {
    return {
      scores: this.scores,
      summary: this.generateSummary(),
      criteriaMet: this.getCriteriaMet(),
      clinicalFeatures: this.getClinicalFeatures(),
      riskFactors: this.getRiskFactors(),
      recommendations: this.getRecommendations(),
      treatmentOptions: this.getTreatmentOptions()
    };
  }

  /**
   * Generate human-readable summary
   */
  generateSummary() {
    const total = this.scores.totalCriteria;
    const level = this.scores.screeningLevel;

    let summary = `MSI-BPD Screening: ${level}. ${total}/9 DSM-5 criteria met. `;

    if (this.scores.positiveScreen) {
      summary += 'POSITIVE SCREEN: High probability of Borderline Personality Disorder. ';
      summary += 'Comprehensive clinical evaluation recommended. ';
    } else if (total >= 5) {
      summary += 'Subthreshold BPD features present. ';
      summary += 'Some borderline traits may benefit from targeted intervention. ';
    } else if (total >= 3) {
      summary += 'Low level of borderline features. ';
    } else {
      summary += 'Minimal borderline features. ';
    }

    return summary;
  }

  /**
   * Get list of criteria met
   */
  getCriteriaMet() {
    const criteriaMet = [];

    for (const [domain, data] of Object.entries(this.scores.domains)) {
      if (data.criterionMet) {
        criteriaMet.push({
          criterion: this.formatDomainName(domain),
          score: data.average,
          dsmCriterion: this.getDSMCriterion(domain)
        });
      }
    }

    return criteriaMet;
  }

  /**
   * Get DSM-5 criterion description
   */
  getDSMCriterion(domain) {
    const criteria = {
      emotionalInstability: 'Affective instability (intense, rapidly shifting emotions)',
      identityDisturbance: 'Identity disturbance (unstable self-image or sense of self)',
      interpersonalInstability: 'Pattern of unstable and intense interpersonal relationships',
      impulsivity: 'Impulsivity in ≥2 areas (spending, sex, substance use, reckless driving, binge eating)',
      chronicEmptiness: 'Chronic feelings of emptiness',
      dissociationParanoia: 'Transient, stress-related paranoid ideation or severe dissociative symptoms',
      overallImpairment: 'Significant impairment in functioning'
    };

    return criteria[domain] || '';
  }

  /**
   * Get clinical features present
   */
  getClinicalFeatures() {
    const features = [];

    // Emotional dysregulation
    if (this.scores.domains.emotionalInstability.criterionMet) {
      features.push({
        feature: 'Emotional Dysregulation',
        description: 'Intense, rapidly changing emotions; difficulty regulating affect',
        severity: this.getSeverity(this.scores.domains.emotionalInstability.average)
      });
    }

    // Identity issues
    if (this.scores.domains.identityDisturbance.criterionMet) {
      features.push({
        feature: 'Identity Confusion',
        description: 'Unstable sense of self; frequent changes in values, goals, or self-image',
        severity: this.getSeverity(this.scores.domains.identityDisturbance.average)
      });
    }

    // Interpersonal chaos
    if (this.scores.domains.interpersonalInstability.criterionMet) {
      features.push({
        feature: 'Interpersonal Instability',
        description: 'Intense, unstable relationships; idealization-devaluation pattern',
        severity: this.getSeverity(this.scores.domains.interpersonalInstability.average)
      });
    }

    // Impulsivity
    if (this.scores.domains.impulsivity.criterionMet) {
      features.push({
        feature: 'Impulsive Behavior',
        description: 'Difficulty controlling impulses in multiple life areas',
        severity: this.getSeverity(this.scores.domains.impulsivity.average)
      });
    }

    // Emptiness
    if (this.scores.domains.chronicEmptiness.criterionMet) {
      features.push({
        feature: 'Chronic Emptiness',
        description: 'Persistent feelings of emptiness or void',
        severity: this.getSeverity(this.scores.domains.chronicEmptiness.average)
      });
    }

    // Dissociation/paranoia
    if (this.scores.domains.dissociationParanoia.criterionMet) {
      features.push({
        feature: 'Dissociation/Paranoia',
        description: 'Stress-related dissociative symptoms or paranoid thoughts',
        severity: this.getSeverity(this.scores.domains.dissociationParanoia.average)
      });
    }

    return features;
  }

  /**
   * Get risk factors
   */
  getRiskFactors() {
    const riskFactors = [];

    if (this.scores.positiveScreen) {
      riskFactors.push({
        factor: 'High Risk for BPD Diagnosis',
        description: '≥7 criteria met suggests high probability of meeting full diagnostic criteria',
        severity: 'High'
      });

      riskFactors.push({
        factor: 'Self-Harm Risk',
        description: 'BPD associated with increased risk of self-harm and suicidal behavior',
        severity: 'High'
      });

      riskFactors.push({
        factor: 'Functional Impairment',
        description: 'Significant difficulties in relationships, work, and daily functioning',
        severity: 'High'
      });
    }

    if (this.scores.domains.impulsivity.criterionMet) {
      riskFactors.push({
        factor: 'Impulsive Behavior Risk',
        description: 'Risk of self-damaging impulsive acts',
        severity: 'Moderate-High'
      });
    }

    if (this.scores.domains.interpersonalInstability.criterionMet) {
      riskFactors.push({
        factor: 'Relationship Instability',
        description: 'Pattern of turbulent, unstable relationships',
        severity: 'Moderate'
      });
    }

    return riskFactors;
  }

  /**
   * Get recommendations
   */
  getRecommendations() {
    const recommendations = [];

    if (this.scores.positiveScreen) {
      recommendations.push('IMMEDIATE: Seek comprehensive psychiatric evaluation for BPD assessment');
      recommendations.push('CRITICAL: If experiencing suicidal thoughts or self-harm urges, contact crisis services immediately');
      recommendations.push('Consider specialized BPD treatment (DBT, MBT, or TFP)');
      recommendations.push('DBT (Dialectical Behavior Therapy) is gold-standard treatment for BPD');
      recommendations.push('Build crisis coping plan with mental health professional');
    } else if (this.scores.totalCriteria >= 5) {
      recommendations.push('Discuss borderline traits with mental health professional');
      recommendations.push('Consider therapy focused on emotion regulation (DBT skills, CBT)');
      recommendations.push('Work on relationship stability and communication skills');
    } else if (this.scores.totalCriteria >= 3) {
      recommendations.push('Address specific borderline traits in therapy');
      recommendations.push('Focus on emotion regulation and interpersonal effectiveness');
    }

    // Domain-specific recommendations
    if (this.scores.domains.emotionalInstability.criterionMet) {
      recommendations.push('Learn emotion regulation skills (DBT, mindfulness, distress tolerance)');
    }

    if (this.scores.domains.identityDisturbance.criterionMet) {
      recommendations.push('Explore identity and values in therapy (schema therapy, mentalization-based therapy)');
    }

    if (this.scores.domains.interpersonalInstability.criterionMet) {
      recommendations.push('Work on relationship patterns and attachment in therapy');
    }

    if (this.scores.domains.impulsivity.criterionMet) {
      recommendations.push('Develop impulse control strategies and safety planning');
    }

    return recommendations;
  }

  /**
   * Get treatment options
   */
  getTreatmentOptions() {
    const options = [];

    if (this.scores.positiveScreen) {
      options.push({
        treatment: 'DBT (Dialectical Behavior Therapy)',
        description: 'Gold-standard treatment for BPD; focuses on emotion regulation, distress tolerance, interpersonal effectiveness, and mindfulness',
        evidenceLevel: 'Strong (multiple RCTs)',
        recommended: true
      });

      options.push({
        treatment: 'MBT (Mentalization-Based Therapy)',
        description: 'Focuses on understanding mental states (own and others) to improve emotion regulation and relationships',
        evidenceLevel: 'Strong (RCTs)',
        recommended: true
      });

      options.push({
        treatment: 'TFP (Transference-Focused Psychotherapy)',
        description: 'Psychodynamic approach focusing on relationship patterns and identity integration',
        evidenceLevel: 'Moderate (RCTs)',
        recommended: false
      });

      options.push({
        treatment: 'Schema Therapy',
        description: 'Integrative approach addressing early maladaptive schemas and modes',
        evidenceLevel: 'Moderate (RCTs)',
        recommended: false
      });

      options.push({
        treatment: 'Medication (Adjunctive)',
        description: 'No FDA-approved medications for BPD; may target specific symptoms (depression, anxiety, impulsivity)',
        evidenceLevel: 'Limited',
        recommended: false
      });
    } else if (this.scores.totalCriteria >= 5) {
      options.push({
        treatment: 'DBT Skills Training',
        description: 'Group-based skills training in emotion regulation and distress tolerance',
        evidenceLevel: 'Moderate',
        recommended: true
      });

      options.push({
        treatment: 'CBT',
        description: 'Cognitive-behavioral therapy for specific borderline features',
        evidenceLevel: 'Moderate',
        recommended: false
      });
    } else {
      options.push({
        treatment: 'General Psychotherapy',
        description: 'Address specific symptoms and improve coping skills',
        evidenceLevel: 'N/A',
        recommended: true
      });
    }

    return options;
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
   * Get severity level from score
   */
  getSeverity(score) {
    if (score >= 4.5) return 'Severe';
    if (score >= 4.0) return 'Moderate-Severe';
    if (score >= 3.5) return 'Moderate';
    if (score >= 3.0) return 'Mild-Moderate';
    return 'Mild';
  }

  /**
   * Format domain name for display
   */
  formatDomainName(domain) {
    const nameMap = {
      emotionalInstability: 'Emotional Instability',
      identityDisturbance: 'Identity Disturbance',
      interpersonalInstability: 'Interpersonal Instability',
      impulsivity: 'Impulsivity',
      chronicEmptiness: 'Chronic Emptiness',
      dissociationParanoia: 'Dissociation/Paranoia',
      overallImpairment: 'Overall Impairment'
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

module.exports = BorderlineScorer;
