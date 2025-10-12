/**
 * Real-Time Validity Monitor
 *
 * Monitors assessment validity DURING the session, not after.
 * Detects and responds to:
 * - Random responding
 * - Inconsistent answers
 * - Social desirability bias
 * - Infrequency (bizarre responses)
 * - Rushing/carelessness
 *
 * Based on established validity scales:
 * - MMPI-2 validity scales
 * - NEO-PI-R validity checks
 * - PAI validity indices
 */

const ResponseTimeAnalyzer = require('./response-time-analyzer');

class RealTimeValidityMonitor {
  constructor() {
    this.responseTimeAnalyzer = new ResponseTimeAnalyzer();

    // Validity thresholds
    this.thresholds = {
      inconsistency: 0.30,      // > 30% inconsistent pairs = flag
      randomness: 0.25,          // > 25% random pattern = flag
      socialDesirability: 0.75,  // > 75% extremely positive = flag
      infrequency: 0.15,         // > 15% bizarre responses = flag
      rushing: 6,                // 6+ consecutive fast responses = flag
      extremeResponding: 0.80    // > 80% extreme responses (1 or 5) = flag
    };

    // Track validity indicators
    this.validityData = {
      inconsistentPairs: [],
      randomPatternScore: 0,
      socialDesirabilityScore: 0,
      infrequencyScore: 0,
      rushingCount: 0,
      extremeResponseCount: 0,
      totalResponses: 0,
      flags: [],
      overallValidity: 'GOOD'
    };

    // Known item pairs that should correlate
    this.consistencyPairs = [
      // Conscientiousness pairs
      {
        positive: 'BASELINE_CONSCIENTIOUSNESS_1', // "I'm organized"
        negative: 'BASELINE_CONSCIENTIOUSNESS_5_R', // "I'm messy" (reverse)
        trait: 'conscientiousness',
        expectedCorrelation: -0.70
      },
      // Depression pairs
      {
        positive: 'DEPRESSION_PHQ9_1', // Anhedonia
        negative: 'PROBE_INTEREST_1', // Interest in activities
        trait: 'depression',
        expectedCorrelation: -0.65
      },
      // Neuroticism pairs
      {
        positive: 'BASELINE_NEUROTICISM_1', // "I worry often"
        negative: 'PROBE_STRESS_1', // "I bounce back from stress"
        trait: 'neuroticism',
        expectedCorrelation: -0.60
      }
    ];

    // Infrequency items (rarely endorsed by normal population)
    this.infrequencyItems = [
      // These would be marked in the question bank
      // For now, track responses that are extremely uncommon
    ];
  }

  /**
   * Monitor a new response
   *
   * @param {Object} question - Question object
   * @param {Number|String} response - User's response
   * @param {Number} responseTime - Time taken to respond
   * @param {Array} allResponses - All previous responses
   * @returns {Object} Validity analysis with any flags or interventions needed
   */
  monitor(question, response, responseTime, allResponses = []) {
    this.validityData.totalResponses = allResponses.length + 1;

    const analysis = {
      valid: true,
      flags: [],
      severity: 'none',
      interventions: [],
      confidence: 1.0
    };

    // 1. RESPONSE TIME ANALYSIS
    const timeAnalysis = this.responseTimeAnalyzer.analyze(question, responseTime, response, allResponses);
    if (timeAnalysis.flags.length > 0) {
      analysis.flags.push(...timeAnalysis.flags);
      analysis.interventions.push(...timeAnalysis.suggestedActions);

      if (timeAnalysis.severity === 'high') {
        analysis.severity = 'high';
        analysis.confidence -= 0.15;
      }
    }

    // 2. INCONSISTENCY DETECTION
    const inconsistencies = this.detectInconsistencies(question, response, allResponses);
    if (inconsistencies.length > 0) {
      analysis.flags.push('INCONSISTENCY_DETECTED');
      this.validityData.inconsistentPairs.push(...inconsistencies);

      const inconsistencyRate = this.validityData.inconsistentPairs.length / this.validityData.totalResponses;
      if (inconsistencyRate > this.thresholds.inconsistency) {
        analysis.severity = 'high';
        analysis.confidence -= 0.25;

        analysis.interventions.push({
          type: 'CLARIFICATION',
          priority: 'high',
          inconsistencies: inconsistencies,
          message: 'Some of your recent answers seem to contradict each other. Would you like to review them?'
        });
      }
    }

    // 3. RANDOM RESPONDING DETECTION
    const randomnessScore = this.detectRandomResponding(response, allResponses);
    this.validityData.randomPatternScore = randomnessScore;

    if (randomnessScore > this.thresholds.randomness) {
      analysis.flags.push('RANDOM_RESPONDING');
      analysis.severity = 'high';
      analysis.confidence -= 0.30;

      analysis.interventions.push({
        type: 'ATTENTION_CHECK',
        priority: 'critical',
        message: 'Please read each question carefully and answer thoughtfully.',
        insertQuestion: 'VALIDITY_ATTENTION_CHECK'
      });
    }

    // 4. SOCIAL DESIRABILITY DETECTION
    const sdScore = this.detectSocialDesirability(question, response, allResponses);
    this.validityData.socialDesirabilityScore = sdScore;

    if (sdScore > this.thresholds.socialDesirability && allResponses.length > 15) {
      analysis.flags.push('SOCIAL_DESIRABILITY');
      analysis.severity = 'medium';
      analysis.confidence -= 0.10;

      // Don't intervene, but note in report
    }

    // 5. INFREQUENCY DETECTION (Bizarre/improbable responses)
    if (this.isInfrequentResponse(question, response)) {
      this.validityData.infrequencyScore++;
      const infrequencyRate = this.validityData.infrequencyScore / this.validityData.totalResponses;

      if (infrequencyRate > this.thresholds.infrequency) {
        analysis.flags.push('INFREQUENCY');
        analysis.severity = 'medium';
        analysis.confidence -= 0.15;
      }
    }

    // 6. EXTREME RESPONDING DETECTION
    if (this.isExtremeResponse(response)) {
      this.validityData.extremeResponseCount++;
      const extremeRate = this.validityData.extremeResponseCount / this.validityData.totalResponses;

      if (extremeRate > this.thresholds.extremeResponding && allResponses.length > 20) {
        analysis.flags.push('EXTREME_RESPONDING');
        analysis.severity = 'low';
        // This is informational, not necessarily invalid
      }
    }

    // 7. UPDATE OVERALL VALIDITY STATUS
    this.updateOverallValidity(analysis);

    // Store flags for report
    if (analysis.flags.length > 0) {
      this.validityData.flags.push({
        questionNumber: this.validityData.totalResponses,
        questionId: question.questionId,
        flags: analysis.flags,
        severity: analysis.severity,
        timestamp: Date.now()
      });
    }

    return analysis;
  }

  /**
   * Detect inconsistencies with previous responses
   */
  detectInconsistencies(question, response, allResponses) {
    const inconsistencies = [];

    // Check against consistency pairs
    for (const pair of this.consistencyPairs) {
      let pairedResponse = null;
      let pairedQuestion = null;

      // Check if current question is part of a pair
      if (question.questionId === pair.positive) {
        pairedQuestion = allResponses.find(r => r.questionId === pair.negative);
        if (pairedQuestion) {
          pairedResponse = pairedQuestion.value || pairedQuestion.response;

          // Positive and negative should be opposite
          // If both are high (4-5) or both are low (1-2), it's inconsistent
          if ((response >= 4 && pairedResponse >= 4) || (response <= 2 && pairedResponse <= 2)) {
            inconsistencies.push({
              type: 'LOGICAL_INCONSISTENCY',
              trait: pair.trait,
              question1: question.questionId,
              response1: response,
              question2: pairedQuestion.questionId,
              response2: pairedResponse,
              severity: 'high'
            });
          }
        }
      } else if (question.questionId === pair.negative) {
        pairedQuestion = allResponses.find(r => r.questionId === pair.positive);
        if (pairedQuestion) {
          pairedResponse = pairedQuestion.value || pairedQuestion.response;

          if ((response >= 4 && pairedResponse >= 4) || (response <= 2 && pairedResponse <= 2)) {
            inconsistencies.push({
              type: 'LOGICAL_INCONSISTENCY',
              trait: pair.trait,
              question1: pairedQuestion.questionId,
              response1: pairedResponse,
              question2: question.questionId,
              response2: response,
              severity: 'high'
            });
          }
        }
      }
    }

    // Check for same-trait contradictions
    const sameTrait = allResponses.filter(r =>
      r.trait === question.trait &&
      r.reverseScored !== question.reverseScored
    );

    for (const prev of sameTrait) {
      const prevResponse = prev.value || prev.response;
      // If both very high or both very low on opposite-scored items
      if ((response >= 4 && prevResponse >= 4) || (response <= 2 && prevResponse <= 2)) {
        inconsistencies.push({
          type: 'TRAIT_INCONSISTENCY',
          trait: question.trait,
          question1: prev.questionId,
          response1: prevResponse,
          question2: question.questionId,
          response2: response,
          severity: 'medium'
        });
      }
    }

    return inconsistencies;
  }

  /**
   * Detect random responding patterns
   */
  detectRandomResponding(response, allResponses) {
    if (allResponses.length < 10) return 0;

    // Check for random patterns in recent responses
    const recentResponses = [...allResponses.slice(-9), { response }].map(r => r.value || r.response);

    // Calculate pattern entropy
    // Random responding would have high entropy (equal distribution of 1,2,3,4,5)
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    recentResponses.forEach(r => {
      if (distribution[r] !== undefined) distribution[r]++;
    });

    const total = recentResponses.length;
    let entropy = 0;
    for (const count of Object.values(distribution)) {
      if (count > 0) {
        const p = count / total;
        entropy -= p * Math.log2(p);
      }
    }

    // Max entropy for 5 options is log2(5) ≈ 2.32
    // Normalize to 0-1 scale
    const normalizedEntropy = entropy / 2.32;

    // Also check for alternating patterns (1,5,1,5,1,5)
    let alternatingCount = 0;
    for (let i = 1; i < recentResponses.length; i++) {
      const diff = Math.abs(recentResponses[i] - recentResponses[i - 1]);
      if (diff >= 3) alternatingCount++; // Alternating between extremes
    }

    const alternatingRate = alternatingCount / (recentResponses.length - 1);

    // Combine entropy and alternating pattern
    return (normalizedEntropy * 0.6 + alternatingRate * 0.4);
  }

  /**
   * Detect social desirability bias
   */
  detectSocialDesirability(question, response, allResponses) {
    if (allResponses.length < 10) return 0;

    // Count extremely positive responses on socially desirable items
    const sociallyDesirableCategories = ['personality', 'interpersonal', 'wellbeing'];

    const relevantResponses = allResponses.filter(r =>
      sociallyDesirableCategories.includes(r.category)
    );

    if (relevantResponses.length === 0) return 0;

    let positiveCount = 0;
    for (const r of relevantResponses) {
      const resp = r.value || r.response;
      // Consider reverse-scored items
      if (r.reverseScored) {
        if (resp <= 2) positiveCount++; // Low on reverse-scored = positive
      } else {
        if (resp >= 4) positiveCount++; // High on normal = positive
      }
    }

    return positiveCount / relevantResponses.length;
  }

  /**
   * Detect infrequent/bizarre responses
   */
  isInfrequentResponse(question, response) {
    // Items marked as infrequency checks
    if (question.tags?.includes('infrequency')) {
      // These questions should rarely be endorsed
      return response >= 4;
    }

    // Extreme responses on clinical items when no other indicators present
    // (This would require more context about other responses)
    return false;
  }

  /**
   * Check if response is extreme (1 or 5)
   */
  isExtremeResponse(response) {
    return response === 1 || response === 5;
  }

  /**
   * Update overall validity status
   */
  updateOverallValidity(currentAnalysis) {
    const inconsistencyRate = this.validityData.inconsistentPairs.length / this.validityData.totalResponses;
    const randomScore = this.validityData.randomPatternScore;
    const infrequencyRate = this.validityData.infrequencyScore / this.validityData.totalResponses;

    // Determine overall validity
    if (inconsistencyRate > 0.30 || randomScore > 0.30 || infrequencyRate > 0.20) {
      this.validityData.overallValidity = 'QUESTIONABLE';
    } else if (inconsistencyRate > 0.20 || randomScore > 0.20 || infrequencyRate > 0.15) {
      this.validityData.overallValidity = 'FAIR';
    } else if (inconsistencyRate > 0.10 || randomScore > 0.10) {
      this.validityData.overallValidity = 'GOOD';
    } else {
      this.validityData.overallValidity = 'EXCELLENT';
    }
  }

  /**
   * Get comprehensive validity report
   */
  getValidityReport() {
    const inconsistencyRate = this.validityData.inconsistentPairs.length / this.validityData.totalResponses;
    const infrequencyRate = this.validityData.infrequencyScore / this.validityData.totalResponses;
    const extremeRate = this.validityData.extremeResponseCount / this.validityData.totalResponses;

    const timeAnalysisSessionStats = this.responseTimeAnalyzer.getSessionSummary();

    return {
      overallValidity: this.validityData.overallValidity,
      confidence: this.calculateConfidence(),
      scales: {
        inconsistency: {
          score: inconsistencyRate,
          interpretation: this.interpretInconsistency(inconsistencyRate),
          flagged: inconsistencyRate > this.thresholds.inconsistency
        },
        randomness: {
          score: this.validityData.randomPatternScore,
          interpretation: this.interpretRandomness(this.validityData.randomPatternScore),
          flagged: this.validityData.randomPatternScore > this.thresholds.randomness
        },
        socialDesirability: {
          score: this.validityData.socialDesirabilityScore,
          interpretation: this.interpretSocialDesirability(this.validityData.socialDesirabilityScore),
          flagged: this.validityData.socialDesirabilityScore > this.thresholds.socialDesirability
        },
        infrequency: {
          score: infrequencyRate,
          interpretation: this.interpretInfrequency(infrequencyRate),
          flagged: infrequencyRate > this.thresholds.infrequency
        },
        extremeResponding: {
          score: extremeRate,
          interpretation: this.interpretExtremeResponding(extremeRate),
          informational: true
        }
      },
      responsePattern: timeAnalysisSessionStats,
      flags: this.validityData.flags,
      interventionsTriggered: this.validityData.flags.length,
      recommendation: this.getRecommendation()
    };
  }

  /**
   * Calculate overall confidence in results
   */
  calculateConfidence() {
    let confidence = 1.0;

    const inconsistencyRate = this.validityData.inconsistentPairs.length / this.validityData.totalResponses;
    const randomScore = this.validityData.randomPatternScore;
    const infrequencyRate = this.validityData.infrequencyScore / this.validityData.totalResponses;

    confidence -= inconsistencyRate * 0.5;
    confidence -= randomScore * 0.6;
    confidence -= infrequencyRate * 0.4;
    confidence -= (this.validityData.socialDesirabilityScore - 0.5) * 0.2; // Only penalize if > 0.5

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Interpretation methods
   */
  interpretInconsistency(rate) {
    if (rate > 0.30) return 'High inconsistency suggests careless responding or confusion';
    if (rate > 0.20) return 'Moderate inconsistency may indicate some confusion or variability in self-view';
    if (rate > 0.10) return 'Mild inconsistency is within normal range';
    return 'Highly consistent responding';
  }

  interpretRandomness(score) {
    if (score > 0.25) return 'Pattern suggests random or careless responding';
    if (score > 0.15) return 'Some randomness detected, results should be interpreted cautiously';
    return 'Response pattern appears thoughtful and non-random';
  }

  interpretSocialDesirability(score) {
    if (score > 0.80) return 'Strong tendency to present self in overly favorable light';
    if (score > 0.65) return 'Moderate impression management detected';
    if (score > 0.50) return 'Mild positive presentation bias';
    return 'Honest and balanced self-presentation';
  }

  interpretInfrequency(rate) {
    if (rate > 0.20) return 'High rate of unusual responses suggests invalid profile';
    if (rate > 0.15) return 'Some unusual responses detected';
    return 'Response pattern within normal range';
  }

  interpretExtremeResponding(rate) {
    if (rate > 0.85) return 'Very high use of extreme responses (black-and-white thinking)';
    if (rate > 0.70) return 'Frequent use of extreme responses';
    if (rate > 0.40) return 'Moderate use of extreme responses';
    return 'Balanced use of response scale';
  }

  /**
   * Get recommendation based on validity
   */
  getRecommendation() {
    switch (this.validityData.overallValidity) {
      case 'QUESTIONABLE':
        return 'Results should be interpreted with significant caution. Consider retaking assessment.';
      case 'FAIR':
        return 'Results are generally valid but should be interpreted with some caution.';
      case 'GOOD':
        return 'Results appear valid and can be interpreted with confidence.';
      case 'EXCELLENT':
        return 'Results show excellent validity and can be interpreted with high confidence.';
      default:
        return 'Unable to determine validity.';
    }
  }

  /**
   * Reset monitor for new session
   */
  reset() {
    this.validityData = {
      inconsistentPairs: [],
      randomPatternScore: 0,
      socialDesirabilityScore: 0,
      infrequencyScore: 0,
      rushingCount: 0,
      extremeResponseCount: 0,
      totalResponses: 0,
      flags: [],
      overallValidity: 'GOOD'
    };
    this.responseTimeAnalyzer.reset();
  }
}

module.exports = RealTimeValidityMonitor;
