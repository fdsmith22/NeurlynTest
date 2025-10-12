/**
 * Response Time Analyzer
 *
 * Analyzes response time patterns to detect:
 * - Discomfort/hesitation on sensitive questions
 * - Rushing/inattentive responding
 * - Fatigue patterns
 * - Cognitive load indicators
 *
 * Based on psychological research:
 * - Yan & Tourangeau (2008): Response latency in web surveys
 * - Bassili & Fletcher (1991): Response-time measurement in survey research
 */

class ResponseTimeAnalyzer {
  constructor() {
    // Response time thresholds (milliseconds)
    this.thresholds = {
      veryFast: 800,      // < 800ms: Possibly not reading carefully
      fast: 2000,          // < 2s: Quick but plausible
      normal: 5000,        // 2-5s: Thoughtful consideration
      slow: 8000,          // 5-8s: Extended consideration
      verySlow: 12000,     // 8-12s: Possible hesitation/discomfort
      extreme: 15000       // > 15s: Clear difficulty or distraction
    };

    // Track statistics across session
    this.sessionStats = {
      count: 0,
      sum: 0,
      mean: 0,
      variance: 0,
      consecutiveFast: 0,
      consecutiveSlow: 0
    };
  }

  /**
   * Analyze a single response's timing
   *
   * @param {Object} question - Question object
   * @param {Number} responseTime - Time in milliseconds
   * @param {Number} response - User's response value
   * @param {Array} allResponses - All previous responses
   * @returns {Object} Analysis with flags and suggested actions
   */
  analyze(question, responseTime, response, allResponses = []) {
    // Update session statistics
    this.updateSessionStats(responseTime);

    const analysis = {
      responseTime,
      speed: this.classifySpeed(responseTime),
      flags: [],
      severity: 'none',
      suggestedActions: [],
      insights: []
    };

    // Expected time for this question type
    const expectedTime = this.estimateExpectedTime(question);
    const deviation = (responseTime - expectedTime) / expectedTime;

    // 1. DETECT DISCOMFORT/HESITATION
    if (this.detectDiscomfort(question, responseTime, expectedTime)) {
      analysis.flags.push('DISCOMFORT_DETECTED');
      analysis.severity = question.sensitivity === 'EXTREME' ? 'high' : 'medium';
      analysis.insights.push({
        type: 'discomfort',
        message: `Prolonged hesitation (${(responseTime / 1000).toFixed(1)}s) on ${question.sensitivity || 'standard'} question`,
        confidence: 0.75
      });

      // Suggest meta-question for extreme cases
      if (question.sensitivity === 'EXTREME' || question.sensitivity === 'HIGH') {
        analysis.suggestedActions.push({
          type: 'META_QUESTION',
          priority: 'medium',
          text: 'That question took a moment to answer. Was it unclear, or would you prefer to skip similar questions?',
          options: ['It was clear', 'Please clarify', 'Skip similar questions']
        });
      }
    }

    // 2. DETECT RUSHING/INATTENTIVE RESPONDING
    if (this.detectRushing(responseTime, allResponses)) {
      analysis.flags.push('POSSIBLE_RUSHING');
      this.sessionStats.consecutiveFast++;

      if (this.sessionStats.consecutiveFast > 5) {
        analysis.severity = 'high';
        analysis.insights.push({
          type: 'rushing',
          message: `${this.sessionStats.consecutiveFast} consecutive fast responses`,
          confidence: 0.80
        });

        // Insert attention check
        analysis.suggestedActions.push({
          type: 'ATTENTION_CHECK',
          priority: 'high',
          insertNextQuestion: 'VALIDITY_ATTENTION_CHECK',
          reason: 'Possible inattentive responding detected'
        });
      }
    } else {
      this.sessionStats.consecutiveFast = 0;
    }

    // 3. DETECT FATIGUE
    if (this.detectFatigue(responseTime, allResponses)) {
      analysis.flags.push('FATIGUE_DETECTED');
      this.sessionStats.consecutiveSlow++;

      if (this.sessionStats.consecutiveSlow > 3) {
        analysis.severity = 'medium';
        analysis.insights.push({
          type: 'fatigue',
          message: 'Increasing response times suggest possible fatigue',
          confidence: 0.70
        });

        // Suggest break or pace adjustment
        analysis.suggestedActions.push({
          type: 'PACE_ADJUSTMENT',
          priority: 'medium',
          message: 'You seem to be taking more time. Would you like a brief break?',
          options: ['Continue', 'Take a 30-second break']
        });
      }
    } else {
      this.sessionStats.consecutiveSlow = 0;
    }

    // 4. DETECT EXTREME TIMING VARIABILITY
    if (Math.abs(deviation) > 2.0 && allResponses.length > 10) {
      analysis.flags.push('EXTREME_VARIABILITY');
      analysis.insights.push({
        type: 'variability',
        message: `Response time ${deviation > 0 ? 'much slower' : 'much faster'} than expected`,
        confidence: 0.60
      });
    }

    // 5. DETECT PATTERN INCONSISTENCY
    if (this.detectInconsistentTiming(responseTime, allResponses)) {
      analysis.flags.push('INCONSISTENT_TIMING');
      analysis.insights.push({
        type: 'inconsistency',
        message: 'Response timing varies significantly from established pattern',
        confidence: 0.65
      });
    }

    return analysis;
  }

  /**
   * Classify response speed
   */
  classifySpeed(responseTime) {
    if (responseTime < this.thresholds.veryFast) return 'very_fast';
    if (responseTime < this.thresholds.fast) return 'fast';
    if (responseTime < this.thresholds.normal) return 'normal';
    if (responseTime < this.thresholds.slow) return 'slow';
    if (responseTime < this.thresholds.verySlow) return 'very_slow';
    if (responseTime < this.thresholds.extreme) return 'extreme';
    return 'distracted';
  }

  /**
   * Estimate expected response time for question
   */
  estimateExpectedTime(question) {
    let baseTime = 3000; // 3 seconds base

    // Adjust for text length
    const textLength = question.text?.length || 0;
    if (textLength > 150) baseTime += 2000;
    else if (textLength > 100) baseTime += 1000;
    else if (textLength > 50) baseTime += 500;

    // Adjust for sensitivity (sensitive questions take longer)
    if (question.sensitivity === 'EXTREME') baseTime += 3000;
    else if (question.sensitivity === 'HIGH') baseTime += 2000;
    else if (question.sensitivity === 'MODERATE') baseTime += 1000;

    // Adjust for response type
    if (question.responseType === 'frequency') baseTime += 1000; // Frequency scales require recall
    if (question.responseType === 'multi_select') baseTime += 2000; // Multiple options

    // Adjust for complex traits
    if (question.subcategory === 'executive_function') baseTime += 1000;
    if (question.instrument === 'NEO-PI-R') baseTime += 500; // Facet questions need more thought

    return baseTime;
  }

  /**
   * Detect discomfort/hesitation
   */
  detectDiscomfort(question, responseTime, expectedTime) {
    // Threshold: 2x expected time AND > 8 seconds
    return responseTime > Math.max(expectedTime * 2, this.thresholds.slow);
  }

  /**
   * Detect rushing
   */
  detectRushing(responseTime, allResponses) {
    if (responseTime > this.thresholds.veryFast) return false;
    if (allResponses.length < 3) return false; // Need baseline

    // Check if consistently faster than average
    const recentResponses = allResponses.slice(-5);
    const avgRecent = recentResponses.reduce((sum, r) => sum + (r.responseTime || 3000), 0) / recentResponses.length;

    return responseTime < avgRecent * 0.4; // 40% of recent average
  }

  /**
   * Detect fatigue (increasing response times)
   */
  detectFatigue(responseTime, allResponses) {
    if (allResponses.length < 10) return false;

    // Compare current to early responses
    const earlyResponses = allResponses.slice(0, 10);
    const avgEarly = earlyResponses.reduce((sum, r) => sum + (r.responseTime || 3000), 0) / earlyResponses.length;

    // Fatigue = current response > 2x early average
    return responseTime > avgEarly * 2 && responseTime > this.thresholds.slow;
  }

  /**
   * Detect inconsistent timing pattern
   */
  detectInconsistentTiming(responseTime, allResponses) {
    if (allResponses.length < 5) return false;

    const recentTimes = allResponses.slice(-5).map(r => r.responseTime || 3000);
    const mean = recentTimes.reduce((a, b) => a + b) / recentTimes.length;
    const variance = recentTimes.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / recentTimes.length;
    const stdDev = Math.sqrt(variance);

    // Inconsistent if current response is > 2 standard deviations from recent mean
    return Math.abs(responseTime - mean) > 2 * stdDev;
  }

  /**
   * Update session statistics
   */
  updateSessionStats(responseTime) {
    this.sessionStats.count++;
    this.sessionStats.sum += responseTime;

    const oldMean = this.sessionStats.mean;
    this.sessionStats.mean = this.sessionStats.sum / this.sessionStats.count;

    // Update variance using Welford's online algorithm
    if (this.sessionStats.count > 1) {
      const delta = responseTime - oldMean;
      this.sessionStats.variance = ((this.sessionStats.count - 2) * this.sessionStats.variance + delta * (responseTime - this.sessionStats.mean)) / (this.sessionStats.count - 1);
    }
  }

  /**
   * Get session summary
   */
  getSessionSummary() {
    return {
      totalResponses: this.sessionStats.count,
      averageTime: Math.round(this.sessionStats.mean),
      standardDeviation: Math.round(Math.sqrt(this.sessionStats.variance)),
      interpretation: this.interpretSessionPattern()
    };
  }

  /**
   * Interpret overall session pattern
   */
  interpretSessionPattern() {
    const avg = this.sessionStats.mean;
    const interpretation = {
      pace: '',
      quality: '',
      engagement: ''
    };

    // Pace
    if (avg < 2000) {
      interpretation.pace = 'very_fast';
      interpretation.engagement = 'possible_rushing';
    } else if (avg < 3500) {
      interpretation.pace = 'fast';
      interpretation.engagement = 'efficient';
    } else if (avg < 6000) {
      interpretation.pace = 'normal';
      interpretation.engagement = 'thoughtful';
    } else if (avg < 10000) {
      interpretation.pace = 'slow';
      interpretation.engagement = 'careful';
    } else {
      interpretation.pace = 'very_slow';
      interpretation.engagement = 'possible_difficulty';
    }

    // Quality based on variability
    const cv = Math.sqrt(this.sessionStats.variance) / this.sessionStats.mean;
    if (cv < 0.3) {
      interpretation.quality = 'very_consistent';
    } else if (cv < 0.6) {
      interpretation.quality = 'consistent';
    } else if (cv < 1.0) {
      interpretation.quality = 'variable';
    } else {
      interpretation.quality = 'highly_variable';
    }

    return interpretation;
  }

  /**
   * Reset analyzer for new session
   */
  reset() {
    this.sessionStats = {
      count: 0,
      sum: 0,
      mean: 0,
      variance: 0,
      consecutiveFast: 0,
      consecutiveSlow: 0
    };
  }
}

module.exports = ResponseTimeAnalyzer;
