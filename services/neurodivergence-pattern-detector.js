/**
 * Neurodivergence Pattern Detector
 *
 * Detects autism, ADHD, and other neurodivergence from RESPONSE PATTERNS,
 * not just question content.
 *
 * Research Foundation:
 * - Baron-Cohen et al. (2001): Autism Quotient patterns
 * - Barkley (2015): ADHD response patterns
 * - Kooij et al. (2019): Adult ADHD assessment patterns
 */

class NeurodivergencePatternDetector {
  constructor() {
    this.patterns = {
      autism: {
        spikyProfile: 0,
        extremeConsistency: 0,
        literalResponding: 0,
        socialWithdrawal: 0,
        routinePreference: 0
      },
      adhd: {
        inconsistencyWithinTrait: 0,
        impulsivityIndicators: 0,
        fastResponses: 0,
        variability: 0
      },
      dyscalculia: {
        timeEstimationErrors: 0,
        frequencyJudgmentErrors: 0
      }
    };
  }

  /**
   * Analyze complete response pattern
   */
  analyzePattern(allResponses, scores, responseTimes) {
    const analysis = {
      autism: this.detectAutismPattern(allResponses, scores),
      adhd: this.detectADHDPattern(allResponses, responseTimes),
      general: this.detectGeneralNeurodivergence(allResponses, scores)
    };

    return analysis;
  }

  /**
   * Detect autism-specific patterns
   */
  detectAutismPattern(allResponses, scores) {
    const indicators = [];
    let confidence = 0;

    // 1. SPIKY PROFILE: Extreme differences between trait scores
    const spikeIndex = this.calculateSpikeIndex(scores);
    if (spikeIndex > 2.5) {
      indicators.push({
        type: 'SPIKY_PROFILE',
        confidence: 0.70,
        description: 'Very uneven profile across traits (some very high, others very low)'
      });
      confidence += 0.70;
    }

    // 2. EXTREME CONSISTENCY within domains
    const consistency = this.calculateWithinDomainConsistency(allResponses);
    if (consistency > 0.90) {
      indicators.push({
        type: 'EXTREME_CONSISTENCY',
        confidence: 0.65,
        description: 'Extremely consistent responses within same domains (black-and-white thinking)'
      });
      confidence += 0.65;
    }

    // 3. SOCIAL WITHDRAWAL PATTERN
    const socialScore = scores.extraversion || 50;
    const agreeablenessScore = scores.agreeableness || 50;
    if (socialScore < 30 && agreeablenessScore < 35) {
      indicators.push({
        type: 'SOCIAL_WITHDRAWAL',
        confidence: 0.60,
        description: 'Very low extraversion + low agreeableness pattern common in autism'
      });
      confidence += 0.60;
    }

    // 4. PREFERENCE FOR ROUTINE (low openness + high conscientiousness)
    const opennessScore = scores.openness || 50;
    const conscientiousnessScore = scores.conscientiousness || 50;
    if (opennessScore < 35 && conscientiousnessScore > 65) {
      indicators.push({
        type: 'ROUTINE_PREFERENCE',
        confidence: 0.55,
        description: 'Strong preference for routine and predictability'
      });
      confidence += 0.55;
    }

    // 5. EXTREME RESPONDING (only 1s and 5s)
    const extremityRate = this.calculateExtremityRate(allResponses);
    if (extremityRate > 0.75) {
      indicators.push({
        type: 'CATEGORICAL_THINKING',
        confidence: 0.60,
        description: 'Frequent use of extremes suggests absolute/categorical thinking'
      });
      confidence += 0.60;
    }

    // Normalize confidence
    confidence = Math.min(0.90, confidence / indicators.length);

    return {
      likelihood: indicators.length >= 3 ? 'HIGH' : indicators.length >= 2 ? 'MODERATE' : 'LOW',
      confidence: confidence || 0,
      indicators,
      recommendation: indicators.length >= 3 ?
        'Pattern suggests autism spectrum traits. Consider professional evaluation.' :
        'Some autism-related patterns present but not conclusive.'
    };
  }

  /**
   * Detect ADHD-specific patterns
   */
  detectADHDPattern(allResponses, responseTimes) {
    const indicators = [];
    let confidence = 0;

    // 1. HIGH VARIABILITY within same trait
    const traitVariability = this.calculateTraitVariability(allResponses);
    if (traitVariability > 1.5) {
      indicators.push({
        type: 'INCONSISTENT_SELF_VIEW',
        confidence: 0.70,
        description: 'High variability when answering similar questions (ADHD trait)'
      });
      confidence += 0.70;
    }

    // 2. FAST, IMPULSIVE RESPONSES
    if (responseTimes && responseTimes.length > 20) {
      const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const fastResponseRate = responseTimes.filter(t => t < 2000).length / responseTimes.length;

      if (avgTime < 2500 && fastResponseRate > 0.60) {
        indicators.push({
          type: 'IMPULSIVE_RESPONDING',
          confidence: 0.65,
          description: 'Very fast responses suggest impulsivity'
        });
        confidence += 0.65;
      }
    }

    // 3. DIFFICULTY WITH CONSISTENCY
    const pairInconsistency = this.detectInconsistentPairs(allResponses);
    if (pairInconsistency > 0.25) {
      indicators.push({
        type: 'POOR_SELF_MONITORING',
        confidence: 0.60,
        description: 'Inconsistent answers to similar questions (executive function difficulty)'
      });
      confidence += 0.60;
    }

    // 4. HIGH SCORES ON ADHD-RELATED TRAITS
    // (This would check actual ADHD question responses)

    // Normalize confidence
    confidence = Math.min(0.85, confidence / Math.max(1, indicators.length));

    return {
      likelihood: indicators.length >= 3 ? 'HIGH' : indicators.length >= 2 ? 'MODERATE' : 'LOW',
      confidence: confidence || 0,
      indicators,
      recommendation: indicators.length >= 2 ?
        'Response pattern consistent with ADHD traits. Consider professional evaluation.' :
        'Some ADHD-related patterns present but not conclusive.'
    };
  }

  /**
   * Detect general neurodivergence indicators
   */
  detectGeneralNeurodivergence(allResponses, scores) {
    const indicators = [];

    // Overall pattern complexity
    const patternComplexity = this.calculatePatternComplexity(allResponses);
    if (patternComplexity > 0.75) {
      indicators.push('Complex, non-typical response pattern');
    }

    // Extreme score variations
    const scoreRange = this.calculateScoreRange(scores);
    if (scoreRange > 60) {
      indicators.push('Very wide range of trait scores');
    }

    return {
      indicators,
      complexity: patternComplexity
    };
  }

  /**
   * Calculate spike index (how spiky the profile is)
   */
  calculateSpikeIndex(scores) {
    const values = Object.values(scores).filter(v => typeof v === 'number');
    if (values.length < 3) return 0;

    const mean = values.reduce((a, b) => a + b) / values.length;
    const deviations = values.map(v => Math.abs(v - mean));
    const maxDeviation = Math.max(...deviations);

    return maxDeviation / mean;
  }

  /**
   * Calculate consistency within domains
   */
  calculateWithinDomainConsistency(allResponses) {
    const domains = {};

    // Group by trait/subcategory
    for (const response of allResponses) {
      const domain = response.trait || response.subcategory;
      if (!domain) continue;

      if (!domains[domain]) domains[domain] = [];
      domains[domain].push(response.value || response.response);
    }

    // Calculate average variance within domains
    let totalConsistency = 0;
    let domainCount = 0;

    for (const [domain, values] of Object.entries(domains)) {
      if (values.length < 2) continue;

      const mean = values.reduce((a, b) => a + b) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      const consistency = 1 - (Math.sqrt(variance) / 2); // Normalize to 0-1

      totalConsistency += consistency;
      domainCount++;
    }

    return domainCount > 0 ? totalConsistency / domainCount : 0;
  }

  /**
   * Calculate extremity rate (how often user picks 1 or 5)
   */
  calculateExtremityRate(allResponses) {
    const extremeCount = allResponses.filter(r => {
      const val = r.value || r.response;
      return val === 1 || val === 5;
    }).length;

    return extremeCount / allResponses.length;
  }

  /**
   * Calculate trait variability
   */
  calculateTraitVariability(allResponses) {
    const traitResponses = {};

    for (const response of allResponses) {
      const trait = response.trait;
      if (!trait) continue;

      if (!traitResponses[trait]) traitResponses[trait] = [];
      traitResponses[trait].push(response.value || response.response);
    }

    let avgVariability = 0;
    let count = 0;

    for (const [trait, values] of Object.entries(traitResponses)) {
      if (values.length < 3) continue;

      const mean = values.reduce((a, b) => a + b) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;

      avgVariability += Math.sqrt(variance);
      count++;
    }

    return count > 0 ? avgVariability / count : 0;
  }

  /**
   * Detect inconsistent pairs
   */
  detectInconsistentPairs(allResponses) {
    // Simple heuristic: responses to same trait that differ by 3+ points
    const traitResponses = {};

    for (const response of allResponses) {
      const trait = response.trait;
      if (!trait) continue;

      if (!traitResponses[trait]) traitResponses[trait] = [];
      traitResponses[trait].push(response.value || response.response);
    }

    let inconsistentCount = 0;
    let totalPairs = 0;

    for (const values of Object.values(traitResponses)) {
      for (let i = 0; i < values.length - 1; i++) {
        for (let j = i + 1; j < values.length; j++) {
          totalPairs++;
          if (Math.abs(values[i] - values[j]) >= 3) {
            inconsistentCount++;
          }
        }
      }
    }

    return totalPairs > 0 ? inconsistentCount / totalPairs : 0;
  }

  /**
   * Calculate pattern complexity
   */
  calculatePatternComplexity(allResponses) {
    // Measure entropy of response pattern
    const transitions = [];

    for (let i = 1; i < allResponses.length; i++) {
      const prev = allResponses[i - 1].value || allResponses[i - 1].response;
      const curr = allResponses[i].value || allResponses[i].response;
      transitions.push(curr - prev);
    }

    // Calculate entropy of transitions
    const counts = {};
    transitions.forEach(t => counts[t] = (counts[t] || 0) + 1);

    let entropy = 0;
    const total = transitions.length;

    for (const count of Object.values(counts)) {
      const p = count / total;
      entropy -= p * Math.log2(p);
    }

    // Normalize to 0-1
    return entropy / 4; // Max entropy for transitions is ~4
  }

  /**
   * Calculate score range
   */
  calculateScoreRange(scores) {
    const values = Object.values(scores).filter(v => typeof v === 'number');
    if (values.length === 0) return 0;

    return Math.max(...values) - Math.min(...values);
  }
}

module.exports = NeurodivergencePatternDetector;
