class NeurodiversityScoring {
  constructor() {
    // ADHD scoring based on ASRS-5 instrument
    this.adhdThresholds = {
      inattention: {
        low: 2,
        moderate: 4,
        high: 6
      },
      hyperactivity: {
        low: 2,
        moderate: 4,
        high: 6
      }
    };

    // Autism spectrum scoring based on AQ-10
    this.autismThresholds = {
      screening: 6, // AQ-10 threshold for further assessment
      traits: {
        social: { low: 2, moderate: 4, high: 6 },
        sensory: { low: 2, moderate: 4, high: 6 },
        routine: { low: 1, moderate: 3, high: 5 },
        communication: { low: 2, moderate: 4, high: 6 }
      }
    };

    // Executive function scoring
    this.executiveFunctionDomains = {
      planning: 0,
      organization: 0,
      timeManagement: 0,
      workingMemory: 0,
      emotionalRegulation: 0,
      taskInitiation: 0,
      sustainedAttention: 0,
      flexibility: 0
    };
  }

  analyzeNeurodiversityResponses(responses) {
    const analysis = {
      adhd: {
        score: 0,
        indicators: {
          inattention: 0,
          hyperactivity: 0,
          impulsivity: 0
        },
        severity: null,
        traits: [],
        percentile: null
      },
      autism: {
        score: 0,
        indicators: {
          social: 0,
          sensory: 0,
          routine: 0,
          communication: 0,
          interests: 0
        },
        severity: null,
        traits: [],
        percentile: null
      },
      executiveFunction: {
        overall: 0,
        domains: { ...this.executiveFunctionDomains },
        strengths: [],
        challenges: []
      },
      sensoryProfile: {
        sensitivity: 0,
        avoidance: 0,
        seeking: 0,
        registration: 0,
        patterns: []
      },
      maskingBehaviors: {
        score: 0,
        indicators: [],
        compensationStrategies: []
      }
    };

    // Process each response
    responses.forEach(response => {
      if (!response.question) return;

      const question = response.question;
      const score = this.calculateResponseScore(response);

      // ADHD scoring
      if (question.instrument?.includes('ASRS') || question.subcategory === 'executive_function') {
        this.scoreADHDResponse(question, score, analysis.adhd);
      }

      // Autism spectrum scoring
      if (question.instrument?.includes('AQ') || question.subcategory === 'sensory_processing') {
        this.scoreAutismResponse(question, score, analysis.autism);
      }

      // Executive function scoring
      if (
        question.instrument?.includes('EXECUTIVE') ||
        question.subcategory === 'executive_function'
      ) {
        this.scoreExecutiveFunction(question, score, analysis.executiveFunction);
      }

      // Sensory processing scoring
      if (
        question.instrument?.includes('SENSORY') ||
        question.subcategory === 'sensory_processing'
      ) {
        this.scoreSensoryProfile(question, score, analysis.sensoryProfile);
      }

      // Masking behaviors scoring
      if (
        question.instrument?.includes('MASKING') ||
        question.text?.includes('mask') ||
        question.text?.includes('camouflage')
      ) {
        this.scoreMaskingBehaviors(question, score, analysis.maskingBehaviors);
      }
    });

    // Calculate severity levels and percentiles
    this.calculateSeverityLevels(analysis);
    this.calculatePercentiles(analysis);

    // Identify patterns and generate insights
    analysis.patterns = this.identifyNeurodiversityPatterns(analysis);
    analysis.insights = this.generateNeurodiversityInsights(analysis);
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  calculateResponseScore(response) {
    if (typeof response.value === 'number') {
      return response.value;
    }

    // Handle different response types
    const optionMap = {
      strongly_disagree: 1,
      disagree: 2,
      neutral: 3,
      agree: 4,
      strongly_agree: 5,
      never: 1,
      rarely: 2,
      sometimes: 3,
      often: 4,
      very_often: 5,
      yes: 5,
      no: 1
    };

    return optionMap[response.value] || 3;
  }

  scoreADHDResponse(question, score, adhdData) {
    // Handle different question formats - could be string or object
    const text = (question?.text || question?.questionText || question || '').toLowerCase();

    // Inattention indicators
    if (
      text.includes('attention') ||
      text.includes('focus') ||
      text.includes('concentrate') ||
      text.includes('distracted') ||
      text.includes('forget') ||
      text.includes('lose things')
    ) {
      adhdData.indicators.inattention += score > 3 ? score - 3 : 0;
    }

    // Hyperactivity indicators
    if (
      text.includes('restless') ||
      text.includes('fidget') ||
      text.includes('active') ||
      text.includes('energy') ||
      text.includes('sit still')
    ) {
      adhdData.indicators.hyperactivity += score > 3 ? score - 3 : 0;
    }

    // Impulsivity indicators
    if (
      text.includes('impuls') ||
      text.includes('interrupt') ||
      text.includes('wait') ||
      text.includes('blurt') ||
      text.includes('decision')
    ) {
      adhdData.indicators.impulsivity += score > 3 ? score - 3 : 0;
    }

    adhdData.score += score > 3 ? (score - 3) * 2 : 0;

    // Track specific traits
    if (score >= 4) {
      if (text.includes('hyperfocus')) adhdData.traits.push('hyperfocus');
      if (text.includes('time blind')) adhdData.traits.push('time_blindness');
      if (text.includes('rejection')) adhdData.traits.push('rejection_sensitivity');
    }
  }

  scoreAutismResponse(question, score, autismData) {
    // Handle different question formats - could be string or object
    const text = (question?.text || question?.questionText || question || '').toLowerCase();

    // Social communication
    if (
      text.includes('social') ||
      text.includes('eye contact') ||
      text.includes('conversation') ||
      text.includes('friend') ||
      text.includes('people')
    ) {
      autismData.indicators.social += score > 3 ? score - 3 : 0;
    }

    // Sensory processing
    if (
      text.includes('sensory') ||
      text.includes('sound') ||
      text.includes('light') ||
      text.includes('texture') ||
      text.includes('smell') ||
      text.includes('touch')
    ) {
      autismData.indicators.sensory += score > 3 ? score - 3 : 0;
    }

    // Routines and patterns
    if (
      text.includes('routine') ||
      text.includes('change') ||
      text.includes('same') ||
      text.includes('pattern') ||
      text.includes('predict')
    ) {
      autismData.indicators.routine += score > 3 ? score - 3 : 0;
    }

    // Communication style
    if (
      text.includes('literal') ||
      text.includes('sarcasm') ||
      text.includes('hint') ||
      text.includes('indirect') ||
      text.includes('nonverbal')
    ) {
      autismData.indicators.communication += score > 3 ? score - 3 : 0;
    }

    // Special interests
    if (
      text.includes('interest') ||
      text.includes('topic') ||
      text.includes('hobby') ||
      text.includes('passionate') ||
      text.includes('detail')
    ) {
      autismData.indicators.interests += score > 3 ? score - 3 : 0;
    }

    autismData.score += score > 3 ? (score - 3) * 2 : 0;

    // Track specific traits
    if (score >= 4) {
      if (text.includes('stimming') || text.includes('repetitive'))
        autismData.traits.push('stimming');
      if (text.includes('pattern')) autismData.traits.push('pattern_recognition');
      if (text.includes('detail')) autismData.traits.push('detail_oriented');
      if (text.includes('direct')) autismData.traits.push('direct_communication');
    }
  }

  scoreExecutiveFunction(question, score, efData) {
    // Handle different question formats - could be string or object
    const text = (question?.text || question?.questionText || question || '').toLowerCase();

    const domainMap = {
      planning: ['plan', 'ahead', 'prepare', 'strategy'],
      organization: ['organize', 'sort', 'arrange', 'system'],
      timeManagement: ['time', 'late', 'deadline', 'schedule'],
      workingMemory: ['remember', 'forget', 'memory', 'recall'],
      emotionalRegulation: ['emotion', 'feeling', 'mood', 'upset'],
      taskInitiation: ['start', 'begin', 'procrastinat', 'initiate'],
      sustainedAttention: ['focus', 'attention', 'concentrate', 'maintain'],
      flexibility: ['adapt', 'change', 'flexible', 'switch']
    };

    Object.entries(domainMap).forEach(([domain, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        // Lower scores indicate better function (reverse scoring for difficulties)
        efData.domains[domain] += score <= 2 ? 2 : score >= 4 ? -1 : 0;
      }
    });

    efData.overall = Object.values(efData.domains).reduce((sum, val) => sum + val, 0) / 8;
  }

  scoreSensoryProfile(question, score, sensoryData) {
    // Handle different question formats - could be string or object
    const text = (question?.text || question?.questionText || question || '').toLowerCase();

    // Initialize domain scores if not present
    if (!sensoryData.visual) sensoryData.visual = 0;
    if (!sensoryData.auditory) sensoryData.auditory = 0;
    if (!sensoryData.tactile) sensoryData.tactile = 0;
    if (!sensoryData.vestibular) sensoryData.vestibular = 0;
    if (!sensoryData.oral) sensoryData.oral = 0;
    if (!sensoryData.olfactory) sensoryData.olfactory = 0;

    // Visual sensitivity (light, colors, patterns)
    if (
      text.includes('light') ||
      text.includes('bright') ||
      text.includes('visual') ||
      text.includes('see') ||
      text.includes('color') ||
      text.includes('pattern')
    ) {
      sensoryData.visual += score > 3 ? score - 3 : 0;
    }

    // Auditory sensitivity (sounds, noise)
    if (
      text.includes('sound') ||
      text.includes('noise') ||
      text.includes('loud') ||
      text.includes('hear') ||
      text.includes('quiet') ||
      text.includes('auditory')
    ) {
      sensoryData.auditory += score > 3 ? score - 3 : 0;
    }

    // Tactile sensitivity (touch, textures)
    if (
      text.includes('touch') ||
      text.includes('texture') ||
      text.includes('fabric') ||
      text.includes('feel') ||
      text.includes('soft') ||
      text.includes('rough')
    ) {
      sensoryData.tactile += score > 3 ? score - 3 : 0;
    }

    // Vestibular/movement sensitivity
    if (
      text.includes('movement') ||
      text.includes('balance') ||
      text.includes('dizzy') ||
      text.includes('motion') ||
      text.includes('spin') ||
      text.includes('vestibular')
    ) {
      sensoryData.vestibular += score > 3 ? score - 3 : 0;
    }

    // Oral/gustatory sensitivity (taste, oral)
    if (
      text.includes('taste') ||
      text.includes('food') ||
      text.includes('eat') ||
      text.includes('oral') ||
      text.includes('mouth') ||
      text.includes('chew')
    ) {
      sensoryData.oral += score > 3 ? score - 3 : 0;
    }

    // Olfactory sensitivity (smell)
    if (
      text.includes('smell') ||
      text.includes('odor') ||
      text.includes('scent') ||
      text.includes('fragrance') ||
      text.includes('olfactory')
    ) {
      sensoryData.olfactory += score > 3 ? score - 3 : 0;
    }

    // General sensory sensitivity (still track these for overall patterns)
    if (text.includes('sensitive') || text.includes('overwhelm')) {
      sensoryData.sensitivity += score > 3 ? score - 3 : 0;
    }

    // Sensory avoidance
    if (text.includes('avoid') || text.includes('uncomfortable')) {
      sensoryData.avoidance += score > 3 ? score - 3 : 0;
    }

    // Sensory seeking
    if (text.includes('seek') || text.includes('crave') || text.includes('need')) {
      sensoryData.seeking += score > 3 ? score - 3 : 0;
    }

    // Low registration
    if (text.includes('notice') || text.includes('aware') || text.includes('miss')) {
      sensoryData.registration += score <= 2 ? 3 - score : 0;
    }

    // Identify patterns based on score thresholds
    if (score >= 4) {
      if (text.includes('light')) sensoryData.patterns.push('light_sensitivity');
      if (text.includes('sound')) sensoryData.patterns.push('sound_sensitivity');
      if (text.includes('texture')) sensoryData.patterns.push('texture_sensitivity');
      if (text.includes('smell')) sensoryData.patterns.push('smell_sensitivity');
      if (text.includes('movement')) sensoryData.patterns.push('movement_sensitivity');
      if (text.includes('taste')) sensoryData.patterns.push('taste_sensitivity');
    }
  }

  scoreMaskingBehaviors(question, score, maskingData) {
    // Handle different question formats - could be string or object
    const text = (question?.text || question?.questionText || question || '').toLowerCase();

    if (score >= 4) {
      maskingData.score += score - 3;

      // Identify specific masking behaviors
      if (text.includes('pretend') || text.includes('act')) {
        maskingData.indicators.push('social_camouflaging');
      }
      if (text.includes('copy') || text.includes('mimic')) {
        maskingData.indicators.push('behavioral_mimicry');
      }
      if (text.includes('hide') || text.includes('suppress')) {
        maskingData.indicators.push('trait_suppression');
      }
      if (text.includes('exhaust') || text.includes('tired')) {
        maskingData.indicators.push('masking_fatigue');
      }

      // Compensation strategies
      if (text.includes('script') || text.includes('prepare')) {
        maskingData.compensationStrategies.push('social_scripting');
      }
      if (text.includes('observe') || text.includes('watch')) {
        maskingData.compensationStrategies.push('social_observation');
      }
    }
  }

  calculateSeverityLevels(analysis) {
    // ADHD severity
    const adhdTotal =
      analysis.adhd.indicators.inattention +
      analysis.adhd.indicators.hyperactivity +
      analysis.adhd.indicators.impulsivity;

    if (adhdTotal >= 15) {
      analysis.adhd.severity = 'significant';
    } else if (adhdTotal >= 10) {
      analysis.adhd.severity = 'moderate';
    } else if (adhdTotal >= 5) {
      analysis.adhd.severity = 'mild';
    } else {
      analysis.adhd.severity = 'minimal';
    }

    // Autism spectrum indicators
    const autismTotal = Object.values(analysis.autism.indicators).reduce(
      (sum, val) => sum + val,
      0
    );

    if (autismTotal >= 20) {
      analysis.autism.severity = 'significant';
    } else if (autismTotal >= 12) {
      analysis.autism.severity = 'moderate';
    } else if (autismTotal >= 6) {
      analysis.autism.severity = 'mild';
    } else {
      analysis.autism.severity = 'minimal';
    }

    // Executive function assessment
    const efAverage = analysis.executiveFunction.overall;

    // Clear existing arrays to ensure dynamic generation
    analysis.executiveFunction.strengths = [];
    analysis.executiveFunction.challenges = [];

    // Identify specific strengths and challenges based on individual domain scores
    Object.entries(analysis.executiveFunction.domains).forEach(([domain, score]) => {
      // Convert camelCase to readable format
      const readableDomain = domain
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .replace(/^./, str => str.toUpperCase())
        .trim();

      if (score >= 2) {
        analysis.executiveFunction.strengths.push(readableDomain);
      } else if (score <= -2) {
        analysis.executiveFunction.challenges.push(readableDomain);
      }
    });

    // Only add general assessments if no specific strengths/challenges found
    if (
      analysis.executiveFunction.strengths.length === 0 &&
      analysis.executiveFunction.challenges.length === 0
    ) {
      if (efAverage <= -2) {
        analysis.executiveFunction.challenges = ['Executive function support needed'];
      } else if (efAverage >= 2) {
        analysis.executiveFunction.strengths = ['Strong executive function overall'];
      }
    }
  }

  calculatePercentiles(analysis) {
    // ADHD percentiles based on population norms
    const adhdScore = analysis.adhd.score;
    if (adhdScore >= 20) {
      analysis.adhd.percentile = 95;
    } else if (adhdScore >= 15) {
      analysis.adhd.percentile = 85;
    } else if (adhdScore >= 10) {
      analysis.adhd.percentile = 70;
    } else if (adhdScore >= 5) {
      analysis.adhd.percentile = 50;
    } else {
      analysis.adhd.percentile = 30;
    }

    // Autism spectrum percentiles
    const autismScore = analysis.autism.score;
    if (autismScore >= 20) {
      analysis.autism.percentile = 95;
    } else if (autismScore >= 15) {
      analysis.autism.percentile = 85;
    } else if (autismScore >= 10) {
      analysis.autism.percentile = 70;
    } else if (autismScore >= 6) {
      analysis.autism.percentile = 50;
    } else {
      analysis.autism.percentile = 30;
    }
  }

  identifyNeurodiversityPatterns(analysis) {
    const patterns = [];

    // ADHD-Autism overlap
    if (analysis.adhd.severity !== 'minimal' && analysis.autism.severity !== 'minimal') {
      patterns.push({
        type: 'audhd',
        label: 'ADHD-Autism Co-occurrence',
        description: 'Shows traits of both ADHD and autism spectrum, which often co-occur',
        significance: 'high'
      });
    }

    // Executive function impact
    if (analysis.executiveFunction.challenges.length > 3) {
      patterns.push({
        type: 'executive_dysfunction',
        label: 'Executive Function Challenges',
        description: 'Multiple areas of executive function show difficulties',
        significance: 'moderate'
      });
    }

    // Sensory processing differences
    const sensoryTotal =
      analysis.sensoryProfile.sensitivity +
      analysis.sensoryProfile.avoidance +
      analysis.sensoryProfile.seeking;
    if (sensoryTotal > 10) {
      patterns.push({
        type: 'sensory_processing',
        label: 'Sensory Processing Differences',
        description: 'Significant sensory processing variations from typical patterns',
        significance: 'moderate'
      });
    }

    // Masking and compensation
    if (analysis.maskingBehaviors.score > 5) {
      patterns.push({
        type: 'masking',
        label: 'Masking/Camouflaging Behaviors',
        description: 'Tendency to mask or hide neurodivergent traits in social situations',
        significance: 'high'
      });
    }

    // Twice-exceptional indicators
    if (
      analysis.executiveFunction.strengths.includes('pattern_recognition') &&
      analysis.executiveFunction.challenges.includes('organization')
    ) {
      patterns.push({
        type: 'twice_exceptional',
        label: 'Twice-Exceptional Profile',
        description:
          'Combination of strengths and challenges suggesting giftedness with neurodivergence',
        significance: 'moderate'
      });
    }

    return patterns;
  }

  generateNeurodiversityInsights(analysis) {
    const insights = [];

    // ADHD insights
    if (analysis.adhd.severity === 'significant' || analysis.adhd.severity === 'moderate') {
      insights.push({
        category: 'ADHD Indicators',
        points: [
          `Inattention score: ${analysis.adhd.indicators.inattention}/10 - ${this.getInattentionDescription(analysis.adhd.indicators.inattention)}`,
          `Hyperactivity score: ${analysis.adhd.indicators.hyperactivity}/10 - ${this.getHyperactivityDescription(analysis.adhd.indicators.hyperactivity)}`,
          analysis.adhd.traits.includes('hyperfocus')
            ? 'Shows capacity for hyperfocus on areas of interest'
            : null,
          analysis.adhd.traits.includes('rejection_sensitivity')
            ? 'May experience rejection sensitive dysphoria'
            : null
        ].filter(Boolean)
      });
    }

    // Autism spectrum insights
    if (analysis.autism.severity === 'significant' || analysis.autism.severity === 'moderate') {
      insights.push({
        category: 'Autism Spectrum Indicators',
        points: [
          `Social communication differences: ${this.getSocialDescription(analysis.autism.indicators.social)}`,
          `Sensory processing variations: ${this.getSensoryDescription(analysis.autism.indicators.sensory)}`,
          analysis.autism.traits.includes('pattern_recognition')
            ? 'Strong pattern recognition abilities'
            : null,
          analysis.autism.traits.includes('detail_oriented')
            ? 'Exceptional attention to detail'
            : null,
          analysis.autism.indicators.routine > 3
            ? 'Preference for routine and predictability'
            : null
        ].filter(Boolean)
      });
    }

    // Executive function insights
    if (analysis.executiveFunction.challenges.length > 0) {
      insights.push({
        category: 'Executive Function Profile',
        points: [
          `Strengths: ${analysis.executiveFunction.strengths.length > 0 ? analysis.executiveFunction.strengths.join(', ') : 'developing'}`,
          `Areas for support: ${analysis.executiveFunction.challenges.join(', ')}`,
          'Consider executive function coaching or strategies'
        ]
      });
    }

    // Masking insights
    if (analysis.maskingBehaviors.score > 5) {
      insights.push({
        category: 'Masking and Compensation',
        points: [
          'Shows signs of masking or camouflaging behaviors',
          `Strategies used: ${analysis.maskingBehaviors.compensationStrategies.join(', ') || 'various'}`,
          'May experience increased fatigue from masking efforts',
          'Creating safe spaces to unmask is important for wellbeing'
        ]
      });
    }

    return insights;
  }

  getInattentionDescription(score) {
    if (score >= 8) return 'Significant challenges with sustained attention and focus';
    if (score >= 5) return 'Moderate difficulties maintaining attention';
    if (score >= 3) return 'Some attention regulation challenges';
    return 'Minimal attention difficulties';
  }

  getHyperactivityDescription(score) {
    if (score >= 8) return 'High levels of physical or mental restlessness';
    if (score >= 5) return 'Moderate hyperactivity or inner restlessness';
    if (score >= 3) return 'Some hyperactive tendencies';
    return 'Typical activity levels';
  }

  getSocialDescription(score) {
    if (score >= 8) return 'Significant differences in social communication style';
    if (score >= 5) return 'Moderate social communication variations';
    if (score >= 3) return 'Some social interaction differences';
    return 'Typical social communication patterns';
  }

  getSensoryDescription(score) {
    if (score >= 8) return 'Significant sensory processing differences';
    if (score >= 5) return 'Moderate sensory sensitivities';
    if (score >= 3) return 'Some sensory processing variations';
    return 'Typical sensory processing';
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    // ADHD recommendations
    if (analysis.adhd.severity !== 'minimal') {
      recommendations.push({
        category: 'ADHD Management Strategies',
        suggestions: [
          'Consider professional ADHD assessment for formal diagnosis',
          'Explore time management tools and techniques (timers, calendars, reminders)',
          'Break large tasks into smaller, manageable steps',
          'Create structured routines and environments',
          'Consider body-doubling or accountability partners',
          analysis.adhd.traits.includes('hyperfocus')
            ? 'Leverage hyperfocus periods for important tasks'
            : null
        ].filter(Boolean)
      });
    }

    // Autism spectrum recommendations
    if (analysis.autism.severity !== 'minimal') {
      recommendations.push({
        category: 'Autism Spectrum Support',
        suggestions: [
          'Consider autism assessment by a qualified professional',
          'Create sensory-friendly environments when possible',
          'Use visual schedules and clear communication',
          'Build in time for special interests as self-care',
          'Connect with neurodivergent communities for support',
          analysis.autism.indicators.sensory > 5
            ? 'Explore sensory accommodations (noise-canceling headphones, fidgets, etc.)'
            : null
        ].filter(Boolean)
      });
    }

    // Executive function recommendations
    if (analysis.executiveFunction.challenges.length > 2) {
      recommendations.push({
        category: 'Executive Function Support',
        suggestions: [
          'Use external organization systems (apps, planners, lists)',
          'Set up environmental cues and reminders',
          'Practice breaking down complex tasks',
          'Consider executive function coaching',
          'Build in regular breaks and movement'
        ]
      });
    }

    // Masking recommendations
    if (analysis.maskingBehaviors.score > 5) {
      recommendations.push({
        category: 'Managing Masking',
        suggestions: [
          'Schedule regular "unmask" time for recovery',
          'Identify safe spaces and people where masking is not needed',
          'Practice self-advocacy for accommodations',
          'Monitor energy levels and burnout signs',
          'Consider therapy with neurodivergent-affirming practitioners'
        ]
      });
    }

    // General neurodiversity recommendations
    if (analysis.patterns.length > 0) {
      recommendations.push({
        category: 'General Neurodiversity Support',
        suggestions: [
          'Embrace neurodivergent identity and seek community',
          'Focus on strengths while accommodating challenges',
          'Advocate for needed accommodations at work/school',
          'Explore neurodivergent-affirming resources and support',
          'Remember that different does not mean less'
        ]
      });
    }

    return recommendations;
  }
}

module.exports = NeurodiversityScoring;
