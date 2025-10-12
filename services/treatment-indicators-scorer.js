/**
 * Treatment Indicators Scorer
 *
 * Calculates treatment planning indicators based on:
 * - Stages of Change model (treatment motivation)
 * - AQ (Aggression Questionnaire - brief)
 * - MSPSS (Multidimensional Scale of Perceived Social Support)
 * - Environmental stressor assessment
 *
 * Dimensions assessed:
 * 1. Treatment Motivation (4 questions):
 *    - Readiness for change
 *    - Treatment engagement
 *    - Hope/optimism
 *
 * 2. Aggression Risk (4 questions):
 *    - Physical aggression
 *    - Verbal aggression
 *    - Anger control
 *
 * 3. Social Support (4 questions - MSPSS):
 *    - Family support
 *    - Friend support
 *    - Significant other support
 *    - Practical support
 *
 * 4. Environmental Stressors (2 questions):
 *    - Current life stressors
 *    - Financial/housing stress
 *
 * Outputs:
 * - Treatment motivation level (low, moderate, high)
 * - Aggression risk flag
 * - Social support total
 * - Stressor count
 * - Treatment planning recommendations
 *
 * Research basis:
 * - MSPSS: Zimet et al. (1988), α = .88
 * - AQ: Buss & Perry (1992)
 * - Stages of Change: Prochaska & DiClemente (1983)
 */

const logger = require('../utils/logger');

// Treatment motivation items
const MOTIVATION_ITEMS = {
  readiness: ['TREATMENT_MOTIVATION_1', 'TREATMENT_MOTIVATION_2'],
  engagement: ['TREATMENT_ENGAGEMENT_1', 'TREATMENT_ENGAGEMENT_2']
};

// Aggression risk items
const AGGRESSION_ITEMS = {
  physical: ['AGGRESSION_PHYSICAL_1', 'AGGRESSION_PHYSICAL_2'],
  verbal: ['AGGRESSION_VERBAL_1'],
  anger: ['AGGRESSION_ANGER_1']
};

// Social support items (MSPSS)
const SOCIAL_SUPPORT_ITEMS = {
  family: ['SOCIAL_SUPPORT_FAMILY_1'],
  friends: ['SOCIAL_SUPPORT_FRIENDS_1'],
  significantOther: ['SOCIAL_SUPPORT_SO_1'],
  practical: ['SOCIAL_SUPPORT_PRACTICAL_1']
};

// Environmental stressor items
const STRESSOR_ITEMS = [
  'STRESSOR_LIFE_1',
  'STRESSOR_FINANCIAL_1'
];

class TreatmentIndicatorsScorer {
  constructor(responses) {
    this.responses = responses;
    this.scores = {
      motivation: {
        readiness: { total: 0, average: 0, count: 0 },
        engagement: { total: 0, average: 0, count: 0 },
        overall: { average: 0, level: 'Unknown' }
      },
      aggression: {
        physical: { total: 0, average: 0, count: 0 },
        verbal: { total: 0, average: 0, count: 0 },
        anger: { total: 0, average: 0, count: 0 },
        overall: { average: 0, riskLevel: 'Unknown' }
      },
      socialSupport: {
        family: { score: 0, count: 0 },
        friends: { score: 0, count: 0 },
        significantOther: { score: 0, count: 0 },
        practical: { score: 0, count: 0 },
        overall: { average: 0, level: 'Unknown' }
      },
      stressors: {
        count: 0,
        severity: 'Unknown',
        items: []
      }
    };
  }

  /**
   * Calculate all treatment indicator scores
   */
  calculate() {
    this.calculateMotivation();
    this.calculateAggression();
    this.calculateSocialSupport();
    this.calculateStressors();

    return this.getTreatmentIndicatorsReport();
  }

  /**
   * Calculate treatment motivation
   */
  calculateMotivation() {
    let overallTotal = 0;
    let overallCount = 0;

    for (const [facet, items] of Object.entries(MOTIVATION_ITEMS)) {
      let total = 0;
      let count = 0;

      items.forEach(qid => {
        const resp = this.findResponse(qid);

        if (resp) {
          const score = this.getLikertScore(resp);
          total += score;
          count++;
          overallTotal += score;
          overallCount++;
        }
      });

      if (count > 0) {
        this.scores.motivation[facet].total = total;
        this.scores.motivation[facet].count = count;
        this.scores.motivation[facet].average = total / count;
      }
    }

    if (overallCount > 0) {
      this.scores.motivation.overall.average = overallTotal / overallCount;
      this.scores.motivation.overall.level = this.getMotivationLevel(this.scores.motivation.overall.average);

      logger.info(`[Treatment] Motivation: ${this.scores.motivation.overall.average.toFixed(2)} (${this.scores.motivation.overall.level})`);
    }
  }

  /**
   * Calculate aggression risk
   */
  calculateAggression() {
    let overallTotal = 0;
    let overallCount = 0;

    for (const [type, items] of Object.entries(AGGRESSION_ITEMS)) {
      let total = 0;
      let count = 0;

      items.forEach(qid => {
        const resp = this.findResponse(qid);

        if (resp) {
          const score = this.getLikertScore(resp);
          total += score;
          count++;
          overallTotal += score;
          overallCount++;
        }
      });

      if (count > 0) {
        this.scores.aggression[type].total = total;
        this.scores.aggression[type].count = count;
        this.scores.aggression[type].average = total / count;
      }
    }

    if (overallCount > 0) {
      this.scores.aggression.overall.average = overallTotal / overallCount;
      this.scores.aggression.overall.riskLevel = this.getAggressionRisk(this.scores.aggression.overall.average);

      logger.info(`[Treatment] Aggression: ${this.scores.aggression.overall.average.toFixed(2)} (${this.scores.aggression.overall.riskLevel})`);
    }
  }

  /**
   * Calculate social support (MSPSS)
   */
  calculateSocialSupport() {
    let overallTotal = 0;
    let overallCount = 0;

    for (const [source, items] of Object.entries(SOCIAL_SUPPORT_ITEMS)) {
      let total = 0;
      let count = 0;

      items.forEach(qid => {
        const resp = this.findResponse(qid);

        if (resp) {
          const score = this.getLikertScore(resp);
          total += score;
          count++;
          overallTotal += score;
          overallCount++;
        }
      });

      if (count > 0) {
        this.scores.socialSupport[source].score = total;
        this.scores.socialSupport[source].count = count;
      }
    }

    if (overallCount > 0) {
      this.scores.socialSupport.overall.average = overallTotal / overallCount;
      this.scores.socialSupport.overall.level = this.getSocialSupportLevel(this.scores.socialSupport.overall.average);

      logger.info(`[Treatment] Social Support: ${this.scores.socialSupport.overall.average.toFixed(2)} (${this.scores.socialSupport.overall.level})`);
    }
  }

  /**
   * Calculate environmental stressors
   */
  calculateStressors() {
    let highStressCount = 0;
    const stressors = [];

    STRESSOR_ITEMS.forEach(qid => {
      const resp = this.findResponse(qid);

      if (resp) {
        const score = this.getLikertScore(resp);

        if (score >= 4) {
          highStressCount++;
          stressors.push({
            item: qid,
            severity: this.getStressorSeverity(score)
          });
        }
      }
    });

    this.scores.stressors.count = highStressCount;
    this.scores.stressors.items = stressors;
    this.scores.stressors.severity = this.getOverallStressorSeverity(highStressCount);

    logger.info(`[Treatment] Environmental Stressors: ${highStressCount} high-severity stressors (${this.scores.stressors.severity})`);
  }

  /**
   * Get comprehensive treatment indicators report
   */
  getTreatmentIndicatorsReport() {
    return {
      scores: this.scores,
      summary: this.generateSummary(),
      motivationAnalysis: this.getMotivationAnalysis(),
      aggressionAnalysis: this.getAggressionAnalysis(),
      supportAnalysis: this.getSupportAnalysis(),
      stressorAnalysis: this.getStressorAnalysis(),
      treatmentPlanning: this.getTreatmentPlanning(),
      recommendations: this.getRecommendations()
    };
  }

  /**
   * Generate human-readable summary
   */
  generateSummary() {
    const motivation = this.scores.motivation.overall.level;
    const aggression = this.scores.aggression.overall.riskLevel;
    const support = this.scores.socialSupport.overall.level;
    const stressors = this.scores.stressors.severity;

    let summary = `Treatment Motivation: ${motivation}. `;
    summary += `Aggression Risk: ${aggression}. `;
    summary += `Social Support: ${support}. `;
    summary += `Environmental Stressors: ${stressors}.`;

    return summary;
  }

  /**
   * Get motivation analysis
   */
  getMotivationAnalysis() {
    const level = this.scores.motivation.overall.level;
    const avg = this.scores.motivation.overall.average;

    const analysis = {
      level: level,
      score: avg,
      readiness: this.scores.motivation.readiness.average,
      engagement: this.scores.motivation.engagement.average,
      description: '',
      prognosis: ''
    };

    if (avg >= 4.0) {
      analysis.description = 'High treatment motivation; ready for change and engaged in the process';
      analysis.prognosis = 'Excellent prognosis; likely to benefit from therapy';
      analysis.stage = 'Action/Maintenance (Stages of Change)';
    } else if (avg >= 3.5) {
      analysis.description = 'Moderate-high treatment motivation; open to change';
      analysis.prognosis = 'Good prognosis; likely to engage in treatment';
      analysis.stage = 'Preparation (Stages of Change)';
    } else if (avg >= 3.0) {
      analysis.description = 'Moderate motivation; some ambivalence about change';
      analysis.prognosis = 'Fair prognosis; may need motivational enhancement';
      analysis.stage = 'Contemplation (Stages of Change)';
    } else if (avg >= 2.5) {
      analysis.description = 'Low-moderate motivation; significant ambivalence';
      analysis.prognosis = 'Guarded prognosis; motivational interviewing recommended';
      analysis.stage = 'Contemplation/Precontemplation (Stages of Change)';
    } else {
      analysis.description = 'Low treatment motivation; may not see need for change';
      analysis.prognosis = 'Poor prognosis without motivational work';
      analysis.stage = 'Precontemplation (Stages of Change)';
    }

    return analysis;
  }

  /**
   * Get aggression analysis
   */
  getAggressionAnalysis() {
    const level = this.scores.aggression.overall.riskLevel;
    const avg = this.scores.aggression.overall.average;

    const analysis = {
      riskLevel: level,
      score: avg,
      physical: this.scores.aggression.physical.average,
      verbal: this.scores.aggression.verbal.average,
      anger: this.scores.aggression.anger.average,
      description: '',
      treatmentImplications: []
    };

    if (avg >= 4.0) {
      analysis.description = 'High aggression risk; significant anger and potentially violent behavior';
      analysis.treatmentImplications = [
        'Safety assessment and planning critical',
        'Anger management therapy strongly recommended',
        'May need specialized aggression treatment (CBT for anger)',
        'Consider impact on therapeutic relationship',
        'Assess for domestic violence or harm to others'
      ];
    } else if (avg >= 3.5) {
      analysis.description = 'Moderate-high aggression risk; notable anger control issues';
      analysis.treatmentImplications = [
        'Incorporate anger management into treatment',
        'Address aggression as priority treatment target',
        'Monitor for escalation during therapy'
      ];
    } else if (avg >= 3.0) {
      analysis.description = 'Moderate aggression; some difficulty with anger';
      analysis.treatmentImplications = [
        'Address anger/frustration tolerance in therapy',
        'Teach emotion regulation skills'
      ];
    } else {
      analysis.description = 'Low aggression risk; adequate anger control';
      analysis.treatmentImplications = [];
    }

    return analysis;
  }

  /**
   * Get social support analysis
   */
  getSupportAnalysis() {
    const level = this.scores.socialSupport.overall.level;
    const avg = this.scores.socialSupport.overall.average;

    const analysis = {
      level: level,
      score: avg,
      sources: {
        family: this.scores.socialSupport.family.score,
        friends: this.scores.socialSupport.friends.score,
        significantOther: this.scores.socialSupport.significantOther.score,
        practical: this.scores.socialSupport.practical.score
      },
      description: '',
      treatmentImplications: []
    };

    if (avg >= 4.0) {
      analysis.description = 'Strong social support network; protective factor for recovery';
      analysis.treatmentImplications = [
        'Leverage social support in treatment',
        'May benefit from involving supportive others in therapy',
        'Lower risk of dropout'
      ];
    } else if (avg >= 3.0) {
      analysis.description = 'Moderate social support; some supportive relationships available';
      analysis.treatmentImplications = [
        'Work on strengthening existing support',
        'Consider support groups or community resources'
      ];
    } else {
      analysis.description = 'Low social support; isolated or lacking supportive relationships';
      analysis.treatmentImplications = [
        'Social isolation is risk factor for poor outcomes',
        'Building social connections should be treatment priority',
        'Consider group therapy or support groups',
        'Higher risk of treatment dropout',
        'May need intensive case management'
      ];
    }

    return analysis;
  }

  /**
   * Get stressor analysis
   */
  getStressorAnalysis() {
    const severity = this.scores.stressors.severity;
    const count = this.scores.stressors.count;

    const analysis = {
      severity: severity,
      count: count,
      description: '',
      treatmentImplications: []
    };

    if (count >= 2) {
      analysis.description = 'Multiple high-severity environmental stressors present';
      analysis.treatmentImplications = [
        'Address practical/environmental needs before psychological work',
        'May need case management or social services',
        'Crisis intervention may be needed',
        'Stressors may interfere with therapy engagement',
        'Consider practical support (housing, financial assistance)'
      ];
    } else if (count === 1) {
      analysis.description = 'One significant environmental stressor present';
      analysis.treatmentImplications = [
        'Address stressor in treatment planning',
        'May need problem-solving therapy or practical support'
      ];
    } else {
      analysis.description = 'Minimal environmental stressors; stable life circumstances';
      analysis.treatmentImplications = [
        'Favorable conditions for therapy engagement'
      ];
    }

    return analysis;
  }

  /**
   * Get comprehensive treatment planning recommendations
   */
  getTreatmentPlanning() {
    const planning = {
      readiness: '',
      priorities: [],
      modality: [],
      barriers: [],
      prognosis: ''
    };

    // Readiness assessment
    if (this.scores.motivation.overall.average >= 3.5) {
      planning.readiness = 'Ready for active treatment; can proceed with evidence-based interventions';
    } else if (this.scores.motivation.overall.average >= 3.0) {
      planning.readiness = 'Moderately ready; may benefit from motivational enhancement';
    } else {
      planning.readiness = 'Low readiness; motivational interviewing strongly recommended before directive therapy';
    }

    // Treatment priorities
    if (this.scores.aggression.overall.average >= 3.5) {
      planning.priorities.push('Aggression/anger management (HIGH PRIORITY)');
    }

    if (this.scores.stressors.count >= 2) {
      planning.priorities.push('Environmental stabilization (housing, financial) (HIGH PRIORITY)');
    }

    if (this.scores.socialSupport.overall.average <= 2.5) {
      planning.priorities.push('Social connection and support building (MODERATE PRIORITY)');
    }

    // Treatment modality recommendations
    if (this.scores.socialSupport.overall.average <= 2.5) {
      planning.modality.push('Group therapy (to build social support)');
    }

    if (this.scores.aggression.overall.average >= 3.5) {
      planning.modality.push('CBT for anger management');
    }

    if (this.scores.motivation.overall.average < 3.0) {
      planning.modality.push('Motivational interviewing (initial phase)');
    }

    // Barriers to treatment
    if (this.scores.motivation.overall.average < 3.0) {
      planning.barriers.push('Low treatment motivation');
    }

    if (this.scores.stressors.count >= 2) {
      planning.barriers.push('Environmental stressors may interfere with engagement');
    }

    if (this.scores.socialSupport.overall.average <= 2.5) {
      planning.barriers.push('Low social support increases dropout risk');
    }

    // Overall prognosis
    const motivationScore = this.scores.motivation.overall.average;
    const supportScore = this.scores.socialSupport.overall.average;
    const stressorCount = this.scores.stressors.count;

    if (motivationScore >= 3.5 && supportScore >= 3.5 && stressorCount === 0) {
      planning.prognosis = 'Excellent prognosis; favorable conditions for treatment success';
    } else if (motivationScore >= 3.0 && supportScore >= 3.0 && stressorCount <= 1) {
      planning.prognosis = 'Good prognosis; reasonable expectation of treatment benefit';
    } else if (motivationScore >= 2.5 || supportScore >= 2.5) {
      planning.prognosis = 'Fair prognosis; some barriers to treatment success present';
    } else {
      planning.prognosis = 'Guarded prognosis; significant barriers to treatment success; intensive support needed';
    }

    return planning;
  }

  /**
   * Get recommendations
   */
  getRecommendations() {
    const recommendations = [];

    // Motivation-based
    if (this.scores.motivation.overall.average < 3.0) {
      recommendations.push('Start with motivational interviewing to build readiness for change');
      recommendations.push('Avoid confrontational or directive approaches initially');
    } else if (this.scores.motivation.overall.average >= 4.0) {
      recommendations.push('High motivation - capitalize on readiness with active intervention');
    }

    // Aggression-based
    if (this.scores.aggression.overall.average >= 3.5) {
      recommendations.push('PRIORITY: Address aggression and anger management in treatment');
      recommendations.push('Assess safety (harm to self or others)');
      recommendations.push('Consider specialized anger management program or CBT for anger');
    }

    // Social support-based
    if (this.scores.socialSupport.overall.average <= 2.5) {
      recommendations.push('Building social support should be treatment goal');
      recommendations.push('Consider group therapy, support groups, or community resources');
      recommendations.push('Monitor closely for treatment dropout (isolation is risk factor)');
    }

    // Stressor-based
    if (this.scores.stressors.count >= 2) {
      recommendations.push('PRIORITY: Address environmental stressors before psychological treatment');
      recommendations.push('Connect with case management or social services');
      recommendations.push('Crisis stabilization may be needed');
    } else if (this.scores.stressors.count === 1) {
      recommendations.push('Incorporate problem-solving therapy for environmental stressor');
    }

    // Combined risk factors
    if (this.scores.motivation.overall.average < 3.0 && this.scores.socialSupport.overall.average <= 2.5) {
      recommendations.push('Low motivation + low support = high dropout risk; intensive engagement needed');
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
   * Get motivation level
   */
  getMotivationLevel(average) {
    if (average >= 4.0) return 'High';
    if (average >= 3.5) return 'Moderate-High';
    if (average >= 3.0) return 'Moderate';
    if (average >= 2.5) return 'Low-Moderate';
    return 'Low';
  }

  /**
   * Get aggression risk level
   */
  getAggressionRisk(average) {
    if (average >= 4.0) return 'High';
    if (average >= 3.5) return 'Moderate-High';
    if (average >= 3.0) return 'Moderate';
    if (average >= 2.5) return 'Low-Moderate';
    return 'Low';
  }

  /**
   * Get social support level
   */
  getSocialSupportLevel(average) {
    if (average >= 4.5) return 'Very High';
    if (average >= 4.0) return 'High';
    if (average >= 3.5) return 'Moderate-High';
    if (average >= 3.0) return 'Moderate';
    if (average >= 2.5) return 'Low-Moderate';
    return 'Low';
  }

  /**
   * Get stressor severity (individual item)
   */
  getStressorSeverity(score) {
    if (score >= 4.5) return 'Severe';
    if (score >= 4.0) return 'High';
    return 'Moderate';
  }

  /**
   * Get overall stressor severity
   */
  getOverallStressorSeverity(count) {
    if (count >= 2) return 'High (Multiple Stressors)';
    if (count === 1) return 'Moderate (One Stressor)';
    return 'Low (Minimal Stressors)';
  }

  /**
   * Helper: Find response by question ID
   */
  findResponse(questionId) {
    return this.responses.find(r => r.questionId === questionId);
  }
}

module.exports = TreatmentIndicatorsScorer;
