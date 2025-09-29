/**
 * ResponseQualityAssessor - Evaluates the quality and reliability of assessment responses
 * Detects patterns, inconsistencies, and provides confidence scoring
 */

class ResponseQualityAssessor {
  constructor() {
    this.qualityMetrics = {
      responseTime: { weight: 0.2, optimal: { min: 2000, max: 15000 } },
      consistency: { weight: 0.3 },
      patternDetection: { weight: 0.2 },
      completeness: { weight: 0.15 },
      engagement: { weight: 0.15 }
    };

    this.suspiciousPatterns = {
      straightLining: { threshold: 0.8, description: 'Same answer repeated' },
      zigzagging: { threshold: 0.8, description: 'Alternating extreme answers' },
      speedRunning: { threshold: 1500, description: 'Answering too quickly' },
      randomClicking: { threshold: 0.7, description: 'No coherent pattern' }
    };

    this.validityChecks = [];
    this.qualityScore = 0;
    this.reliabilityScore = 0;
  }

  /**
   * Assess overall response quality
   */
  assessResponseQuality(responses) {
    const assessment = {
      overallScore: 0,
      metrics: {},
      patterns: [],
      warnings: [],
      recommendations: [],
      validity: true
    };

    // Evaluate each metric
    assessment.metrics.responseTime = this.assessResponseTiming(responses);
    assessment.metrics.consistency = this.assessConsistency(responses);
    assessment.metrics.patterns = this.detectResponsePatterns(responses);
    assessment.metrics.completeness = this.assessCompleteness(responses);
    assessment.metrics.engagement = this.assessEngagement(responses);

    // Check for suspicious patterns
    assessment.patterns = this.identifySuspiciousPatterns(responses);

    // Calculate overall score
    assessment.overallScore = this.calculateOverallQuality(assessment.metrics);

    // Generate warnings and recommendations
    assessment.warnings = this.generateWarnings(assessment);
    assessment.recommendations = this.generateRecommendations(assessment);

    // Determine validity
    assessment.validity = this.determineValidity(assessment);

    this.qualityScore = assessment.overallScore;
    this.reliabilityScore = this.calculateReliability(assessment);

    return assessment;
  }

  /**
   * Assess response timing quality
   */
  assessResponseTiming(responses) {
    if (!responses || !Array.isArray(responses)) {
      return {
        averageTime: 5000,
        medianTime: 5000,
        score: 0.8,
        issues: ['No response data available']
      };
    }
    const times = responses.map(r => r.responseTime || 5000);
    const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
    const medianTime = this.calculateMedian(times);

    const quality = {
      average: avgTime,
      median: medianTime,
      tooFast: times.filter(t => t < this.qualityMetrics.responseTime.optimal.min).length,
      tooSlow: times.filter(t => t > this.qualityMetrics.responseTime.optimal.max).length,
      score: 1.0
    };

    // Calculate timing score
    if (avgTime < 1000) {
      quality.score = 0.3; // Very suspicious - too fast
      quality.issue = 'Responses are too quick to be thoughtful';
    } else if (avgTime < 2000) {
      quality.score = 0.7;
      quality.issue = 'Responses may be rushed';
    } else if (avgTime > 20000) {
      quality.score = 0.8;
      quality.issue = 'Responses may indicate distraction';
    }

    // Check for consistency in timing
    const variance = this.calculateVariance(times);
    if (variance < 500) {
      quality.score *= 0.8; // Too consistent - might be automated
      quality.suspicion = 'Timing is unusually consistent';
    }

    return quality;
  }

  /**
   * Assess response consistency
   */
  assessConsistency(responses) {
    const consistency = {
      score: 1.0,
      inversions: [],
      contradictions: []
    };

    if (!responses || !Array.isArray(responses)) {
      return consistency;
    }

    // Group responses by trait
    const traitResponses = {};
    responses.forEach(r => {
      if (!traitResponses[r.trait]) {
        traitResponses[r.trait] = [];
      }
      traitResponses[r.trait].push(r);
    });

    // Check for inversions within each trait
    Object.entries(traitResponses).forEach(([trait, traitResponses]) => {
      const scores = traitResponses.map(r => r.score || r.answer || 3);

      // Check for extreme variance
      const variance = this.calculateVariance(scores);
      if (variance > 1.5) {
        consistency.inversions.push({
          trait,
          variance,
          description: `Inconsistent responses for ${trait}`
        });
        consistency.score *= 0.9;
      }

      // Check for contradictory patterns
      const hasExtremes = scores.includes(1) && scores.includes(5);
      if (hasExtremes) {
        consistency.contradictions.push({
          trait,
          description: `Contradictory extremes in ${trait} responses`
        });
        consistency.score *= 0.85;
      }
    });

    // Check cross-trait consistency
    consistency.crossTrait = this.assessCrossTraitConsistency(responses);
    consistency.score *= consistency.crossTrait.score;

    return consistency;
  }

  /**
   * Assess cross-trait consistency
   */
  assessCrossTraitConsistency(responses) {
    const analysis = {
      score: 1.0,
      issues: []
    };

    // Expected correlations between traits
    const expectedCorrelations = [
      { traits: ['extraversion', 'agreeableness'], correlation: 'positive' },
      { traits: ['conscientiousness', 'neuroticism'], correlation: 'negative' },
      { traits: ['openness', 'extraversion'], correlation: 'slight_positive' }
    ];

    expectedCorrelations.forEach(expectation => {
      const trait1Responses = responses.filter(r => r.trait === expectation.traits[0]);
      const trait2Responses = responses.filter(r => r.trait === expectation.traits[1]);

      if (trait1Responses.length > 0 && trait2Responses.length > 0) {
        const avg1 = this.calculateAverage(trait1Responses.map(r => r.score || r.answer || 3));
        const avg2 = this.calculateAverage(trait2Responses.map(r => r.score || r.answer || 3));

        // Check if correlation matches expectation
        if (expectation.correlation === 'positive' && avg1 > 3.5 && avg2 < 2.5) {
          analysis.issues.push(
            `Unexpected inverse correlation between ${expectation.traits.join(' and ')}`
          );
          analysis.score *= 0.9;
        } else if (expectation.correlation === 'negative' && avg1 > 3.5 && avg2 > 3.5) {
          analysis.issues.push(
            `Unexpected positive correlation between ${expectation.traits.join(' and ')}`
          );
          analysis.score *= 0.9;
        }
      }
    });

    return analysis;
  }

  /**
   * Detect response patterns
   */
  detectResponsePatterns(responses) {
    const patterns = {
      detected: [],
      score: 1.0
    };

    if (!responses || !Array.isArray(responses)) {
      return patterns;
    }

    const answers = responses.map(r => r.score || r.answer || 3);

    // Check for straight-lining
    const uniqueAnswers = new Set(answers);
    const straightLiningRatio = 1 - uniqueAnswers.size / answers.length;
    if (straightLiningRatio > this.suspiciousPatterns.straightLining.threshold) {
      patterns.detected.push({
        type: 'straightLining',
        severity: 'high',
        ratio: straightLiningRatio,
        description: 'Repeated same answer too frequently'
      });
      patterns.score *= 0.5;
    }

    // Check for zigzagging
    let zigzagCount = 0;
    for (let i = 1; i < answers.length; i++) {
      if (Math.abs(answers[i] - answers[i - 1]) >= 3) {
        zigzagCount++;
      }
    }
    const zigzagRatio = zigzagCount / (answers.length - 1);
    if (zigzagRatio > this.suspiciousPatterns.zigzagging.threshold) {
      patterns.detected.push({
        type: 'zigzagging',
        severity: 'medium',
        ratio: zigzagRatio,
        description: 'Alternating between extremes'
      });
      patterns.score *= 0.7;
    }

    // Check for middle bias
    const middleCount = answers.filter(a => a === 3).length;
    const middleRatio = middleCount / answers.length;
    if (middleRatio > 0.6) {
      patterns.detected.push({
        type: 'middleBias',
        severity: 'low',
        ratio: middleRatio,
        description: 'Excessive neutral responses'
      });
      patterns.score *= 0.85;
    }

    // Check for acquiescence bias (tendency to agree)
    const agreeCount = answers.filter(a => a >= 4).length;
    const agreeRatio = agreeCount / answers.length;
    if (agreeRatio > 0.8) {
      patterns.detected.push({
        type: 'acquiescenceBias',
        severity: 'medium',
        ratio: agreeRatio,
        description: 'Tendency to agree with most statements'
      });
      patterns.score *= 0.8;
    }

    return patterns;
  }

  /**
   * Assess completeness of responses
   */
  assessCompleteness(responses) {
    const completeness = {
      score: 1.0,
      totalQuestions: 0,
      answered: 0,
      skipped: 0
    };

    if (!responses || !Array.isArray(responses)) {
      return completeness;
    }

    completeness.totalQuestions = responses.length;

    responses.forEach(r => {
      if (r.score !== undefined || r.answer !== undefined) {
        completeness.answered++;
      } else {
        completeness.skipped++;
      }
    });

    completeness.score = completeness.answered / completeness.totalQuestions;

    if (completeness.score < 0.9) {
      completeness.issue = 'Some questions were not answered';
    }

    return completeness;
  }

  /**
   * Assess engagement level
   */
  assessEngagement(responses) {
    const engagement = {
      score: 1.0,
      indicators: []
    };

    if (!responses || !Array.isArray(responses)) {
      return engagement;
    }

    // Check response time variation
    const times = responses.map(r => r.responseTime || 5000);
    const timeVariance = this.calculateVariance(times);

    if (timeVariance > 3000) {
      engagement.indicators.push('Good time variation shows engagement');
      engagement.score *= 1.1;
    }

    // Check for thoughtful responses (not all extremes or middles)
    const answers = responses.map(r => r.score || r.answer || 3);
    const distribution = this.calculateDistribution(answers);

    if (distribution.balanced) {
      engagement.indicators.push('Balanced response distribution');
      engagement.score *= 1.05;
    }

    // Check for response progression (learning effect)
    const firstHalfAvgTime = this.calculateAverage(times.slice(0, times.length / 2));
    const secondHalfAvgTime = this.calculateAverage(times.slice(times.length / 2));

    if (secondHalfAvgTime < firstHalfAvgTime * 0.9) {
      engagement.indicators.push('Increased response speed shows familiarity');
    }

    engagement.score = Math.min(1.0, engagement.score);

    return engagement;
  }

  /**
   * Identify suspicious patterns
   */
  identifySuspiciousPatterns(responses) {
    const patterns = [];

    if (!responses || !Array.isArray(responses)) {
      return patterns;
    }

    // Speed running detection
    const avgTime = this.calculateAverage(responses.map(r => r.responseTime || 5000));
    if (avgTime < this.suspiciousPatterns.speedRunning.threshold) {
      patterns.push({
        type: 'speedRunning',
        confidence: 0.9,
        impact: 'high',
        description: 'Responses completed too quickly for thoughtful consideration'
      });
    }

    // Random clicking detection
    const answers = responses.map(r => r.score || r.answer || 3);
    const entropy = this.calculateEntropy(answers);
    if (entropy > 2.2) {
      patterns.push({
        type: 'randomClicking',
        confidence: 0.7,
        impact: 'high',
        description: 'Response pattern appears random'
      });
    }

    // Social desirability bias
    const sociallyDesirable = this.detectSocialDesirabilityBias(responses);
    if (sociallyDesirable.detected) {
      patterns.push({
        type: 'socialDesirability',
        confidence: sociallyDesirable.confidence,
        impact: 'medium',
        description: 'Responses show social desirability bias'
      });
    }

    return patterns;
  }

  /**
   * Detect social desirability bias
   */
  detectSocialDesirabilityBias(responses) {
    const result = {
      detected: false,
      confidence: 0,
      indicators: []
    };

    // Check for overly positive responses on socially desirable traits
    const agreeablenessResponses = responses.filter(r => r.trait === 'agreeableness');
    const conscientiousnessResponses = responses.filter(r => r.trait === 'conscientiousness');

    const agreeablenessAvg = this.calculateAverage(
      agreeablenessResponses.map(r => r.score || r.answer || 3)
    );
    const conscientiousnessAvg = this.calculateAverage(
      conscientiousnessResponses.map(r => r.score || r.answer || 3)
    );

    if (agreeablenessAvg > 4.3 && conscientiousnessAvg > 4.3) {
      result.detected = true;
      result.confidence = 0.8;
      result.indicators.push('Extremely high scores on socially desirable traits');
    }

    // Check for low neuroticism (often faked)
    const neuroticismResponses = responses.filter(r => r.trait === 'neuroticism');
    const neuroticismAvg = this.calculateAverage(
      neuroticismResponses.map(r => r.score || r.answer || 3)
    );

    if (neuroticismAvg < 1.7) {
      result.detected = true;
      result.confidence = Math.max(result.confidence, 0.7);
      result.indicators.push('Unusually low neuroticism scores');
    }

    return result;
  }

  /**
   * Calculate overall quality score
   */
  calculateOverallQuality(metrics) {
    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(this.qualityMetrics).forEach(([metric, config]) => {
      if (metrics[metric] && metrics[metric].score !== undefined) {
        totalScore += metrics[metric].score * config.weight;
        totalWeight += config.weight;
      }
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Calculate reliability score
   */
  calculateReliability(assessment) {
    let reliability = assessment.overallScore;

    // Reduce reliability for each suspicious pattern
    assessment.patterns.forEach(pattern => {
      if (pattern.impact === 'high') {
        reliability *= 0.7;
      } else if (pattern.impact === 'medium') {
        reliability *= 0.85;
      }
    });

    // Boost reliability for good engagement
    if (assessment.metrics.engagement && assessment.metrics.engagement.score > 0.9) {
      reliability *= 1.1;
    }

    return Math.min(1.0, Math.max(0.3, reliability));
  }

  /**
   * Generate warnings based on assessment
   */
  generateWarnings(assessment) {
    const warnings = [];

    if (assessment.overallScore < 0.6) {
      warnings.push({
        level: 'high',
        message: 'Response quality is below acceptable threshold',
        recommendation: 'Consider retaking the assessment with more thoughtful responses'
      });
    }

    assessment.patterns.forEach(pattern => {
      if (pattern.impact === 'high') {
        warnings.push({
          level: 'high',
          message: `Detected ${pattern.type}: ${pattern.description}`,
          recommendation: 'This may significantly affect result accuracy'
        });
      }
    });

    if (assessment.metrics.responseTime && assessment.metrics.responseTime.score < 0.5) {
      warnings.push({
        level: 'medium',
        message: 'Response timing suggests rushed or automated answers',
        recommendation: 'Take more time to consider each question'
      });
    }

    return warnings;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(assessment) {
    const recommendations = [];

    if (
      assessment.metrics.patterns &&
      assessment.metrics.patterns.detected.some(p => p.type === 'middleBias')
    ) {
      recommendations.push({
        type: 'response_strategy',
        message: 'Try to avoid defaulting to neutral responses',
        detail: 'Consider your actual tendencies rather than playing it safe'
      });
    }

    if (assessment.metrics.consistency && assessment.metrics.consistency.score < 0.8) {
      recommendations.push({
        type: 'consistency',
        message: 'Your responses show some inconsistencies',
        detail: 'Try to answer similar questions in a consistent manner'
      });
    }

    if (assessment.metrics.engagement && assessment.metrics.engagement.score < 0.7) {
      recommendations.push({
        type: 'engagement',
        message: 'Consider being more engaged with the assessment',
        detail: 'Thoughtful responses lead to more accurate results'
      });
    }

    return recommendations;
  }

  /**
   * Determine if responses are valid
   */
  determineValidity(assessment) {
    // Invalid if quality score is too low
    if (assessment.overallScore < 0.4) return false;

    // Invalid if high-impact suspicious patterns detected
    const hasHighImpactPattern = assessment.patterns.some(
      p => p.impact === 'high' && p.confidence > 0.8
    );
    if (hasHighImpactPattern) return false;

    // Invalid if too many warnings
    const highWarnings = assessment.warnings.filter(w => w.level === 'high');
    if (highWarnings.length > 2) return false;

    return true;
  }

  /**
   * Helper functions
   */
  calculateAverage(values) {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  calculateVariance(values) {
    const mean = this.calculateAverage(values);
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length);
  }

  calculateDistribution(values) {
    const counts = {};
    values.forEach(v => {
      counts[v] = (counts[v] || 0) + 1;
    });

    const distribution = Object.values(counts);
    const maxCount = Math.max(...distribution);
    const minCount = Math.min(...distribution);

    return {
      balanced: maxCount - minCount < values.length * 0.3,
      counts
    };
  }

  calculateEntropy(values) {
    const counts = {};
    values.forEach(v => {
      counts[v] = (counts[v] || 0) + 1;
    });

    let entropy = 0;
    const total = values.length;

    Object.values(counts).forEach(count => {
      const probability = count / total;
      if (probability > 0) {
        entropy -= probability * Math.log2(probability);
      }
    });

    return entropy;
  }

  /**
   * Export quality assessment
   */
  exportAssessment() {
    return {
      qualityScore: this.qualityScore,
      reliabilityScore: this.reliabilityScore,
      validityChecks: this.validityChecks,
      metrics: this.qualityMetrics
    };
  }
}

// Export for use in assessment system
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResponseQualityAssessor;
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
  window.ResponseQualityAssessor = ResponseQualityAssessor;
}
