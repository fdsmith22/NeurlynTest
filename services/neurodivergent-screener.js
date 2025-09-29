const logger = require('../utils/logger');

/**
 * Neurodivergent Screener Service
 * Detects patterns associated with neurodivergent conditions
 * NOTE: This is a screening tool only, not a diagnostic instrument
 */
class NeurodivergentScreener {
  constructor() {
    this.thresholds = this.initializeThresholds();
    this.patterns = this.initializePatterns();
  }

  /**
   * Comprehensive neurodivergent screening
   */
  screenForNeurodivergence(responses, traits, metadata = {}) {
    try {
      const screening = {
        adhd: this.screenForADHD(responses, traits, metadata),
        autism: this.screenForAutism(responses, traits, metadata),
        audhd: this.screenForAuDHD(responses, traits),
        hsp: this.screenForHSP(responses, traits),
        dyslexia: this.screenForDyslexia(responses, metadata),
        giftedness: this.screenForGiftedness(responses, traits),
        disclaimer:
          'This is a screening tool only. Professional evaluation is recommended for diagnosis.',
        overallConfidence: 0,
        recommendations: []
      };

      // Calculate overall confidence
      const confidences = [
        screening.adhd.confidence,
        screening.autism.confidence,
        screening.hsp.confidence
      ];
      screening.overallConfidence = Math.max(...confidences);

      // Generate recommendations based on screening results
      screening.recommendations = this.generateRecommendations(screening);

      return screening;
    } catch (error) {
      logger.error('Neurodivergent screening error:', error);
      return this.getDefaultScreening();
    }
  }

  /**
   * Screen for ADHD indicators
   */
  screenForADHD(responses, traits, metadata) {
    const indicators = {
      score: 0,
      confidence: 0,
      markers: [],
      subtype: null,
      strengths: [],
      challenges: []
    };

    // Response time variability
    const responseTimes = responses.map(r => r.responseTime || 5000).filter(t => t > 0);
    let timeVariance = 0;

    if (responseTimes.length > 10) {
      timeVariance = this.calculateVariance(responseTimes);
      const avgTime = responseTimes.reduce((a, b) => a + b) / responseTimes.length;

      if (timeVariance > 5000) {
        indicators.score += 15;
        indicators.markers.push('High response time variability');
      }

      if (avgTime < 2500) {
        indicators.score += 10;
        indicators.markers.push('Quick, potentially impulsive responses');
      }

      // Check for rushing through questions
      const rushedResponses = responseTimes.filter(t => t < 1500).length;
      if (rushedResponses > responses.length * 0.3) {
        indicators.score += 15;
        indicators.markers.push('Pattern of rushed responses');
      }
    }

    // Conscientiousness patterns (executive function)
    if (traits.conscientiousness < 35) {
      indicators.score += 20;
      indicators.markers.push('Executive function challenges indicated');
      indicators.challenges.push('Organization and planning');
    }

    // Check for specific ADHD-related responses
    const executiveFunctionResponses = responses.filter(
      r =>
        r.subcategory === 'executive_function' ||
        r.category === 'cognitive' ||
        r.trait === 'conscientiousness'
    );

    const lowScores = executiveFunctionResponses.filter(r => (r.score || r.value) <= 2);
    if (lowScores.length > executiveFunctionResponses.length * 0.5) {
      indicators.score += 25;
      indicators.markers.push('Consistent executive dysfunction patterns');
    }

    // Hyperactivity indicators (high extraversion + low conscientiousness)
    if (traits.extraversion > 70 && traits.conscientiousness < 40) {
      indicators.score += 15;
      indicators.markers.push('Hyperactive presentation possible');
      indicators.subtype = 'combined';
    }

    // Inattentive indicators (low conscientiousness + moderate/low extraversion)
    if (traits.conscientiousness < 40 && traits.extraversion < 60) {
      indicators.score += 15;
      indicators.markers.push('Inattentive presentation possible');
      indicators.subtype = indicators.subtype === 'combined' ? 'combined' : 'inattentive';
    }

    // Identify ADHD strengths
    if (traits.openness > 65) {
      indicators.strengths.push('Creative thinking and innovation');
    }
    if (traits.extraversion > 60) {
      indicators.strengths.push('High energy and enthusiasm');
    }
    if (timeVariance > 5000) {
      indicators.strengths.push('Ability to hyperfocus on interesting tasks');
    }

    // Calculate confidence
    indicators.confidence = Math.min(indicators.score / 100, 0.85);

    // Determine likelihood
    if (indicators.score >= 60) {
      indicators.likelihood = 'High';
      indicators.recommendation = 'Consider ADHD assessment with a qualified professional';
    } else if (indicators.score >= 40) {
      indicators.likelihood = 'Moderate';
      indicators.recommendation =
        'Monitor symptoms and consider screening if they impact daily life';
    } else {
      indicators.likelihood = 'Low';
      indicators.recommendation = 'ADHD indicators are minimal based on this assessment';
    }

    return indicators;
  }

  /**
   * Screen for Autism indicators
   */
  screenForAutism(responses, traits, metadata) {
    const indicators = {
      score: 0,
      confidence: 0,
      markers: [],
      strengths: [],
      challenges: [],
      maskingLevel: 0
    };

    // Social communication patterns
    if (traits.extraversion < 35) {
      indicators.score += 15;
      indicators.markers.push('Preference for solitary activities');
    }

    if (traits.agreeableness < 40) {
      indicators.score += 10;
      indicators.markers.push('Direct communication style');
    }

    // Systematizing vs Empathizing
    if (traits.conscientiousness > 70 && traits.agreeableness < 50) {
      indicators.score += 20;
      indicators.markers.push('High systematizing, lower empathizing');
      indicators.strengths.push('Pattern recognition and systematic thinking');
    }

    // Check for rigidity/routine preference
    const routineResponses = responses.filter(
      r =>
        r.subcategory === 'routine' ||
        r.text?.toLowerCase().includes('routine') ||
        r.text?.toLowerCase().includes('change')
    );

    const highRoutinePreference = routineResponses.filter(r => (r.score || r.value) >= 4);
    if (highRoutinePreference.length > routineResponses.length * 0.6) {
      indicators.score += 20;
      indicators.markers.push('Strong preference for routine and predictability');
    }

    // Sensory processing differences
    const sensoryResponses = responses.filter(
      r =>
        r.subcategory === 'sensory_processing' ||
        r.text?.toLowerCase().includes('sensory') ||
        r.text?.toLowerCase().includes('texture') ||
        r.text?.toLowerCase().includes('sound')
    );

    const sensoryDifferences = sensoryResponses.filter(
      r => (r.score || r.value) <= 2 || (r.score || r.value) >= 4
    );
    if (sensoryDifferences.length > sensoryResponses.length * 0.5) {
      indicators.score += 15;
      indicators.markers.push('Sensory processing differences');
      indicators.challenges.push('Sensory sensitivities');
    }

    // Special interests (high openness + high conscientiousness in specific areas)
    if (traits.openness > 70 && traits.conscientiousness > 65) {
      indicators.score += 10;
      indicators.markers.push('Potential for deep, focused interests');
      indicators.strengths.push('Deep knowledge and expertise in areas of interest');
    }

    // Check for masking patterns
    indicators.maskingLevel = this.assessMasking(responses, traits);
    if (indicators.maskingLevel > 60) {
      indicators.markers.push('High masking/camouflaging behaviors');
      indicators.challenges.push('Social exhaustion from masking');
    }

    // Response consistency (autistic individuals often show more consistent patterns)
    const responseConsistency = this.calculateConsistency(responses);
    if (responseConsistency > 0.8) {
      indicators.score += 10;
      indicators.markers.push('Highly consistent response patterns');
    }

    // Identify autism strengths
    if (traits.conscientiousness > 70) {
      indicators.strengths.push('Attention to detail and accuracy');
    }
    if (responseConsistency > 0.8) {
      indicators.strengths.push('Authentic and consistent self-presentation');
    }
    if (traits.openness > 65 && traits.extraversion < 40) {
      indicators.strengths.push('Deep thinking and analysis');
    }

    // Calculate confidence
    indicators.confidence = Math.min(indicators.score / 100, 0.85);

    // Determine likelihood
    if (indicators.score >= 60) {
      indicators.likelihood = 'High';
      indicators.recommendation =
        'Consider autism assessment with a specialist familiar with adult presentations';
    } else if (indicators.score >= 40) {
      indicators.likelihood = 'Moderate';
      indicators.recommendation =
        'Some autistic traits present; assessment may provide helpful insights';
    } else {
      indicators.likelihood = 'Low';
      indicators.recommendation = 'Autism indicators are minimal based on this assessment';
    }

    return indicators;
  }

  /**
   * Screen for AuDHD (Autism + ADHD)
   */
  screenForAuDHD(responses, traits) {
    const adhdScore = this.screenForADHD(responses, traits, {}).score;
    const autismScore = this.screenForAutism(responses, traits, {}).score;

    const indicators = {
      score: 0,
      confidence: 0,
      markers: [],
      internalConflicts: [],
      compensatoryStrategies: []
    };

    // Check for co-occurrence
    if (adhdScore >= 40 && autismScore >= 40) {
      indicators.score = (adhdScore + autismScore) / 2;
      indicators.markers.push('Mixed ADHD and autism presentation');

      // Identify internal conflicts
      if (traits.conscientiousness < 40 && autismScore >= 40) {
        indicators.internalConflicts.push('Need for routine vs executive dysfunction');
      }

      if (traits.extraversion > 60 && autismScore >= 40) {
        indicators.internalConflicts.push('Social energy vs social processing differences');
      }

      // Identify compensatory strategies
      if (traits.openness > 70) {
        indicators.compensatoryStrategies.push(
          'Creative problem-solving to manage competing needs'
        );
      }

      if (traits.neuroticism > 60) {
        indicators.compensatoryStrategies.push(
          'Heightened anxiety from managing dual presentations'
        );
      }

      indicators.confidence = Math.min((adhdScore + autismScore) / 200, 0.85);

      if (indicators.score >= 50) {
        indicators.likelihood = 'Moderate to High';
        indicators.recommendation = 'Consider comprehensive neurodevelopmental assessment';
      } else {
        indicators.likelihood = 'Low to Moderate';
        indicators.recommendation = 'Some overlapping traits present';
      }
    } else {
      indicators.likelihood = 'Low';
      indicators.recommendation = 'Minimal indicators of co-occurring ADHD and autism';
    }

    return indicators;
  }

  /**
   * Screen for Highly Sensitive Person (HSP)
   */
  screenForHSP(responses, traits) {
    const indicators = {
      score: 0,
      confidence: 0,
      markers: [],
      domains: {
        sensory: 0,
        emotional: 0,
        cognitive: 0,
        social: 0
      }
    };

    // Emotional sensitivity (high neuroticism)
    if (traits.neuroticism > 65) {
      indicators.score += 25;
      indicators.domains.emotional = 80;
      indicators.markers.push('High emotional sensitivity');
    }

    // Sensory sensitivity patterns
    const sensoryResponses = responses.filter(
      r => r.subcategory === 'sensory_processing' || r.category === 'sensory'
    );

    const highSensitivity = sensoryResponses.filter(r => (r.score || r.value) >= 4);
    if (highSensitivity.length > sensoryResponses.length * 0.5) {
      indicators.score += 20;
      indicators.domains.sensory = 70;
      indicators.markers.push('Sensory processing sensitivity');
    }

    // Deep processing (high openness + high conscientiousness)
    if (traits.openness > 65 && traits.conscientiousness > 60) {
      indicators.score += 15;
      indicators.domains.cognitive = 75;
      indicators.markers.push('Deep cognitive processing');
    }

    // Social sensitivity (high agreeableness + moderate/low extraversion)
    if (traits.agreeableness > 70 && traits.extraversion < 50) {
      indicators.score += 15;
      indicators.domains.social = 70;
      indicators.markers.push('High interpersonal sensitivity');
    }

    // Overstimulation patterns
    const avgResponseTime =
      responses.map(r => r.responseTime || 5000).reduce((a, b) => a + b) / responses.length;

    if (avgResponseTime > 6000) {
      indicators.score += 10;
      indicators.markers.push('Careful, deliberate processing style');
    }

    // Calculate overall HSP profile
    const domainScores = Object.values(indicators.domains);
    const avgDomainScore = domainScores.reduce((a, b) => a + b) / domainScores.length;

    if (avgDomainScore > 60) {
      indicators.score += 15;
      indicators.markers.push('Comprehensive HSP profile');
    }

    indicators.confidence = Math.min(indicators.score / 100, 0.85);

    if (indicators.score >= 60) {
      indicators.likelihood = 'High';
      indicators.recommendation = 'Strong indicators of high sensitivity; consider HSP resources';
    } else if (indicators.score >= 40) {
      indicators.likelihood = 'Moderate';
      indicators.recommendation = 'Some sensitivity traits present';
    } else {
      indicators.likelihood = 'Low';
      indicators.recommendation = 'Typical sensitivity levels';
    }

    return indicators;
  }

  /**
   * Screen for Dyslexia indicators
   */
  screenForDyslexia(responses, metadata) {
    const indicators = {
      score: 0,
      confidence: 0,
      markers: [],
      strengths: []
    };

    // Check response patterns that might indicate reading difficulties
    const avgResponseTime =
      responses.map(r => r.responseTime || 5000).reduce((a, b) => a + b) / responses.length;

    // Longer reading time might indicate processing differences
    if (avgResponseTime > 7000) {
      indicators.score += 15;
      indicators.markers.push('Extended processing time for text');
    }

    // Check for specific cognitive patterns
    const cognitiveResponses = responses.filter(r => r.category === 'cognitive');
    const spatialStrength = cognitiveResponses.filter(
      r => r.text?.toLowerCase().includes('visual') || r.text?.toLowerCase().includes('spatial')
    );

    if (spatialStrength.length > 0) {
      const avgSpatialScore =
        spatialStrength.map(r => r.score || r.value || 3).reduce((a, b) => a + b) /
        spatialStrength.length;

      if (avgSpatialScore > 3.5) {
        indicators.score += 10;
        indicators.strengths.push('Strong visual-spatial processing');
      }
    }

    // Note: Limited screening without specific dyslexia questions
    indicators.confidence = Math.min(indicators.score / 50, 0.5);
    indicators.likelihood = indicators.score >= 25 ? 'Possible' : 'Insufficient data';
    indicators.recommendation = 'Specific dyslexia screening required for accurate assessment';

    return indicators;
  }

  /**
   * Screen for Giftedness indicators
   */
  screenForGiftedness(responses, traits) {
    const indicators = {
      score: 0,
      confidence: 0,
      markers: [],
      domains: []
    };

    // Intellectual curiosity (very high openness)
    if (traits.openness > 85) {
      indicators.score += 30;
      indicators.markers.push('Exceptional intellectual curiosity');
      indicators.domains.push('Intellectual');
    }

    // High conscientiousness with high openness (rare combination)
    if (traits.openness > 75 && traits.conscientiousness > 75) {
      indicators.score += 25;
      indicators.markers.push('Creative achievement potential');
      indicators.domains.push('Creative');
    }

    // Emotional intensity combined with stability
    if (traits.neuroticism > 60 && traits.agreeableness > 70) {
      indicators.score += 15;
      indicators.markers.push('Emotional giftedness/overexcitability');
      indicators.domains.push('Emotional');
    }

    // Response pattern analysis
    const responseVariance = this.calculateVariance(responses.map(r => r.score || r.value || 3));

    if (responseVariance > 1.5) {
      indicators.score += 10;
      indicators.markers.push('Complex, nuanced thinking patterns');
    }

    // Processing speed combined with depth
    const responseTimes = responses.map(r => r.responseTime || 5000);
    const avgTime = responseTimes.reduce((a, b) => a + b) / responseTimes.length;
    const timeVariance = this.calculateVariance(responseTimes);

    if (avgTime > 4000 && avgTime < 8000 && timeVariance > 3000) {
      indicators.score += 10;
      indicators.markers.push('Variable processing depth based on interest');
    }

    indicators.confidence = Math.min(indicators.score / 100, 0.75);

    if (indicators.score >= 60) {
      indicators.likelihood = 'High';
      indicators.recommendation = 'Multiple giftedness indicators present';
    } else if (indicators.score >= 40) {
      indicators.likelihood = 'Moderate';
      indicators.recommendation = 'Some giftedness traits identified';
    } else {
      indicators.likelihood = 'Low';
      indicators.recommendation = 'Typical range of abilities';
    }

    return indicators;
  }

  /**
   * Assess masking/camouflaging behaviors
   */
  assessMasking(responses, traits) {
    let maskingScore = 0;

    // High agreeableness with low extraversion (people-pleasing without social energy)
    if (traits.agreeableness > 70 && traits.extraversion < 40) {
      maskingScore += 30;
    }

    // High neuroticism with social responses (anxiety about social performance)
    if (traits.neuroticism > 65 && traits.extraversion > 30) {
      maskingScore += 20;
    }

    // Check for exhaustion patterns
    const fatigueResponses = responses.filter(
      r =>
        r.text?.toLowerCase().includes('tired') ||
        r.text?.toLowerCase().includes('exhausted') ||
        r.text?.toLowerCase().includes('drained')
    );

    if (fatigueResponses.length > 0) {
      const avgFatigue =
        fatigueResponses.map(r => r.score || r.value || 3).reduce((a, b) => a + b) /
        fatigueResponses.length;

      if (avgFatigue >= 3.5) {
        maskingScore += 25;
      }
    }

    // Response time patterns (careful responses suggesting self-monitoring)
    const avgResponseTime =
      responses.map(r => r.responseTime || 5000).reduce((a, b) => a + b) / responses.length;

    if (avgResponseTime > 6000) {
      maskingScore += 15;
    }

    return Math.min(maskingScore, 100);
  }

  /**
   * Calculate response consistency
   */
  calculateConsistency(responses) {
    // Group responses by trait/category
    const groups = {};
    responses.forEach(r => {
      const key = r.trait || r.category || 'general';
      if (!groups[key]) groups[key] = [];
      groups[key].push(r.score || r.value || 3);
    });

    // Calculate variance within each group
    const variances = [];
    Object.values(groups).forEach(group => {
      if (group.length > 1) {
        variances.push(this.calculateVariance(group));
      }
    });

    // Lower variance = higher consistency
    const avgVariance = variances.reduce((a, b) => a + b, 0) / (variances.length || 1);
    return Math.max(0, 1 - avgVariance / 2);
  }

  /**
   * Calculate variance of an array
   */
  calculateVariance(values) {
    const mean = values.reduce((a, b) => a + b) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b) / values.length;
  }

  /**
   * Generate recommendations based on screening results
   */
  generateRecommendations(screening) {
    const recommendations = [];

    // ADHD recommendations
    if (screening.adhd.likelihood === 'High' || screening.adhd.likelihood === 'Moderate') {
      recommendations.push({
        condition: 'ADHD',
        priority: screening.adhd.likelihood === 'High' ? 'high' : 'medium',
        suggestions: [
          'Consider professional ADHD assessment',
          'Explore executive function support strategies',
          'Look into ADHD-friendly organizational tools'
        ],
        resources: [
          'ADHD self-help books and apps',
          'Executive function coaching',
          'ADHD support groups'
        ]
      });
    }

    // Autism recommendations
    if (screening.autism.likelihood === 'High' || screening.autism.likelihood === 'Moderate') {
      recommendations.push({
        condition: 'Autism',
        priority: screening.autism.likelihood === 'High' ? 'high' : 'medium',
        suggestions: [
          'Consider autism assessment with adult autism specialist',
          'Explore sensory accommodation strategies',
          'Learn about autistic burnout prevention'
        ],
        resources: [
          'Autistic adult communities',
          'Sensory processing resources',
          'Autism self-advocacy organizations'
        ]
      });
    }

    // AuDHD recommendations
    if (screening.audhd.likelihood === 'Moderate to High') {
      recommendations.push({
        condition: 'AuDHD',
        priority: 'high',
        suggestions: [
          'Seek comprehensive neurodevelopmental assessment',
          'Develop strategies for managing competing needs',
          'Create flexible structure that accommodates both presentations'
        ],
        resources: [
          'AuDHD specific support groups',
          'Dual diagnosis resources',
          'Integrated support strategies'
        ]
      });
    }

    // HSP recommendations
    if (screening.hsp.likelihood === 'High') {
      recommendations.push({
        condition: 'HSP',
        priority: 'medium',
        suggestions: [
          'Learn about sensory processing sensitivity',
          'Develop boundaries and energy management strategies',
          'Create low-stimulation environments when needed'
        ],
        resources: [
          'HSP self-help books',
          'Sensitivity-friendly lifestyle resources',
          'HSP support communities'
        ]
      });
    }

    // Giftedness recommendations
    if (
      screening.giftedness.likelihood === 'High' ||
      screening.giftedness.likelihood === 'Moderate'
    ) {
      recommendations.push({
        condition: 'Giftedness',
        priority: 'low',
        suggestions: [
          'Explore intellectual and creative challenges',
          'Connect with gifted adult communities',
          'Consider intensity and overexcitability management'
        ],
        resources: [
          'Gifted adult resources',
          'Creative and intellectual communities',
          'Intensity management strategies'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Initialize screening thresholds
   */
  initializeThresholds() {
    return {
      adhd: {
        low: 30,
        moderate: 40,
        high: 60
      },
      autism: {
        low: 30,
        moderate: 40,
        high: 60
      },
      hsp: {
        low: 30,
        moderate: 40,
        high: 60
      },
      giftedness: {
        low: 30,
        moderate: 40,
        high: 60
      }
    };
  }

  /**
   * Initialize known patterns
   */
  initializePatterns() {
    return {
      adhd: {
        impulsive: ['quick_responses', 'low_conscientiousness', 'high_extraversion'],
        inattentive: ['low_conscientiousness', 'moderate_extraversion', 'high_openness'],
        combined: ['low_conscientiousness', 'high_extraversion', 'variable_responses']
      },
      autism: {
        classical: ['low_extraversion', 'high_conscientiousness', 'low_agreeableness'],
        masked: ['moderate_extraversion', 'high_agreeableness', 'high_neuroticism'],
        female: ['high_masking', 'high_agreeableness', 'sensory_sensitivity']
      },
      audhd: {
        conflicting: [
          'need_routine',
          'executive_dysfunction',
          'social_energy',
          'social_difficulty'
        ],
        compensating: ['high_openness', 'creative_strategies', 'exhaustion_pattern']
      },
      hsp: {
        sensory: ['sensory_sensitivity', 'overstimulation', 'need_downtime'],
        emotional: ['high_neuroticism', 'high_agreeableness', 'emotional_depth'],
        cognitive: ['deep_processing', 'high_openness', 'careful_responses']
      }
    };
  }

  /**
   * Get default screening results
   */
  getDefaultScreening() {
    return {
      adhd: { score: 0, confidence: 0, likelihood: 'Unknown', markers: [] },
      autism: { score: 0, confidence: 0, likelihood: 'Unknown', markers: [] },
      audhd: { score: 0, confidence: 0, likelihood: 'Unknown', markers: [] },
      hsp: { score: 0, confidence: 0, likelihood: 'Unknown', markers: [] },
      dyslexia: { score: 0, confidence: 0, likelihood: 'Unknown', markers: [] },
      giftedness: { score: 0, confidence: 0, likelihood: 'Unknown', markers: [] },
      disclaimer: 'Screening could not be completed. Professional evaluation recommended.',
      overallConfidence: 0,
      recommendations: []
    };
  }
}

module.exports = NeurodivergentScreener;
