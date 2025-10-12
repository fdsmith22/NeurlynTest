/**
 * Score Interpretation System
 *
 * Provides clear, user-friendly interpretations of neurodiversity scores
 * with context about what scores mean functionally and what to do with the information
 */

class ScoreInterpreter {
  /**
   * Interpret autism spectrum scores
   */
  interpretAutismScore(score, indicators) {
    const interpretation = {
      rawScore: score,
      scale: this.getAutismScale(score),
      percentile: this.getAutismPercentile(score),
      meaning: this.getAutismMeaning(score),
      functionalImpact: this.getAutismFunctionalImpact(score, indicators),
      nextSteps: this.getAutismNextSteps(score),
      context: this.getAutismContext()
    };

    return interpretation;
  }

  getAutismScale(score) {
    // Scale: 0-60 (theoretical max: ~30 questions x 2 points)
    if (score >= 30) return { level: 'Very High', value: 5, max: 5, description: 'Strong trait indicators' };
    if (score >= 20) return { level: 'High', value: 4, max: 5, description: 'Significant trait indicators' };
    if (score >= 12) return { level: 'Moderate-High', value: 3, max: 5, description: 'Moderate trait indicators' };
    if (score >= 6) return { level: 'Moderate', value: 2, max: 5, description: 'Some trait indicators' };
    if (score >= 3) return { level: 'Low-Moderate', value: 1, max: 5, description: 'Minimal trait indicators' };
    return { level: 'Low', value: 0, max: 5, description: 'Few to no trait indicators' };
  }

  getAutismPercentile(score) {
    if (score >= 30) return 98;
    if (score >= 20) return 95;
    if (score >= 15) return 85;
    if (score >= 10) return 70;
    if (score >= 6) return 50;
    return 30;
  }

  getAutismMeaning(score) {
    if (score >= 30) {
      return 'Your responses indicate autism spectrum traits more strongly than approximately 98% of the general population. This suggests significant differences in how you process social information, sensory input, and routines.';
    }
    if (score >= 20) {
      return 'Your responses show autism spectrum traits more strongly than approximately 95% of the general population. This indicates notable differences in social communication, sensory processing, or preference for routines.';
    }
    if (score >= 12) {
      return 'Your responses suggest autism spectrum traits more strongly than approximately 85% of the general population. This reflects some meaningful differences in how you experience social situations and process sensory information.';
    }
    if (score >= 6) {
      return 'Your responses show some autism spectrum traits, similar to approximately 50% of the population. This suggests you may experience occasional differences in social communication or sensory processing.';
    }
    return 'Your responses show minimal autism spectrum traits, similar to most of the general population.';
  }

  getAutismFunctionalImpact(score, indicators) {
    const impacts = [];

    if (indicators.social >= 8) {
      impacts.push({
        area: 'Social Communication',
        severity: 'significant',
        description: 'You may find social interactions require more conscious effort, with challenges in reading social cues, maintaining eye contact, or understanding unspoken rules.'
      });
    } else if (indicators.social >= 5) {
      impacts.push({
        area: 'Social Communication',
        severity: 'moderate',
        description: 'You may occasionally find social situations challenging, particularly in large groups or when social rules are unclear.'
      });
    }

    if (indicators.sensory >= 8) {
      impacts.push({
        area: 'Sensory Processing',
        severity: 'significant',
        description: 'Sensory experiences (sounds, lights, textures, smells) likely have a strong impact on your daily functioning and may cause overwhelm or avoidance.'
      });
    } else if (indicators.sensory >= 5) {
      impacts.push({
        area: 'Sensory Processing',
        severity: 'moderate',
        description: 'Certain sensory inputs may be uncomfortable or distracting, though you have likely developed some coping strategies.'
      });
    }

    if (indicators.routine >= 6) {
      impacts.push({
        area: 'Routine & Predictability',
        severity: 'significant',
        description: 'Unexpected changes or disruptions to routines may cause significant distress or require extended adjustment time.'
      });
    } else if (indicators.routine >= 3) {
      impacts.push({
        area: 'Routine & Predictability',
        severity: 'moderate',
        description: 'You prefer predictability and may need some time to adjust to changes in plans or routines.'
      });
    }

    return impacts;
  }

  getAutismNextSteps(score) {
    if (score >= 20) {
      return [
        'Consider seeking evaluation from a qualified clinician specializing in autism assessment (psychologist, psychiatrist, or neuropsychologist)',
        'Research autism in adults to better understand your experiences',
        'Connect with autistic communities for peer support and shared experiences',
        'Explore accommodations that might help (noise-canceling headphones, written instructions, predictable schedules)',
        'Consider whether disclosure in workplace/relationships might reduce masking burden'
      ];
    }
    if (score >= 10) {
      return [
        'Learn more about autism spectrum traits and how they manifest in adults',
        'Consider whether specific accommodations might improve daily functioning',
        'If traits cause distress or impairment, consider professional evaluation',
        'Explore online autistic communities to see if experiences resonate'
      ];
    }
    return [
      'Your responses suggest minimal autism traits',
      'If you have concerns about specific symptoms, consider discussing with a healthcare provider'
    ];
  }

  getAutismContext() {
    return {
      important: 'This is NOT a diagnostic tool',
      explanation: 'These scores reflect trait indicators based on your responses. Autism is diagnosed by qualified clinicians through comprehensive assessment. Many autistic traits exist on a spectrum in the general population.',
      validatedInstruments: 'Screening questions based on AQ-10 and clinical autism assessment criteria',
      limitations: 'Self-report measures may be influenced by self-awareness, masking behaviors, and current context. Female and non-binary individuals may present differently than traditional diagnostic criteria expect.'
    };
  }

  /**
   * Interpret sensory processing scores
   */
  interpretSensoryScore(domainScore, domain) {
    const interpretation = {
      rawScore: domainScore,
      domain: domain,
      scale: this.getSensoryScale(domainScore),
      meaning: this.getSensoryMeaning(domainScore, domain),
      functionalImpact: this.getSensoryFunctionalImpact(domainScore, domain),
      strategies: this.getSensoryStrategies(domainScore, domain)
    };

    return interpretation;
  }

  getSensoryScale(score) {
    // Scale: 0-20+ (theoretical max: ~10 questions x 2 points per domain)
    if (score >= 12) return { level: 'Very High', value: 5, max: 5, description: 'Extreme sensitivity' };
    if (score >= 8) return { level: 'High', value: 4, max: 5, description: 'Significant sensitivity' };
    if (score >= 5) return { level: 'Moderate-High', value: 3, max: 5, description: 'Moderate sensitivity' };
    if (score >= 3) return { level: 'Mild', value: 2, max: 5, description: 'Mild sensitivity' };
    if (score >= 1) return { level: 'Low', value: 1, max: 5, description: 'Minimal differences' };
    return { level: 'Typical', value: 0, max: 5, description: 'Typical processing' };
  }

  getSensoryMeaning(score, domain) {
    const domainDescriptions = {
      visual: 'lights, patterns, visual clutter',
      auditory: 'sounds, noise levels, background noise',
      tactile: 'touch, textures, clothing',
      vestibular: 'movement, balance, spatial orientation',
      oral: 'food textures, tastes, oral sensations',
      olfactory: 'smells, scents, odors'
    };

    const stimulus = domainDescriptions[domain] || 'sensory input';

    if (score >= 12) {
      return `You experience extreme sensitivity to ${stimulus}. These sensory experiences likely have a major impact on your daily life, potentially causing physical pain, overwhelm, or requiring significant avoidance strategies.`;
    }
    if (score >= 8) {
      return `You experience significant sensitivity to ${stimulus}. These sensory experiences regularly impact your comfort and may influence where you go, what you wear, or how you structure your environment.`;
    }
    if (score >= 5) {
      return `You experience moderate sensitivity to ${stimulus}. Certain sensory situations are uncomfortable and you likely have developed preferences or avoidance strategies.`;
    }
    if (score >= 3) {
      return `You experience mild sensitivity to ${stimulus}. Some sensory situations may be noticeable or mildly uncomfortable, but generally manageable.`;
    }
    return `Your responses suggest typical sensitivity to ${stimulus}.`;
  }

  getSensoryFunctionalImpact(score, domain) {
    if (score < 5) return [];

    const impacts = {
      visual: [
        'Difficulty in fluorescent-lit environments (offices, stores)',
        'Overwhelm in visually busy spaces',
        'Need for sunglasses even in moderate light',
        'Preference for dim lighting and muted colors'
      ],
      auditory: [
        'Difficulty concentrating in noisy environments',
        'Need for noise-canceling headphones',
        'Overwhelm in crowded/loud spaces (restaurants, malls)',
        'Sensitivity to specific sounds others tolerate easily'
      ],
      tactile: [
        'Difficulty with certain clothing textures',
        'Discomfort with tags, seams, or tight clothing',
        'Strong preferences for specific fabrics',
        'Challenges with physical touch or textures'
      ],
      vestibular: [
        'Motion sickness or dizziness',
        'Discomfort with heights or movement',
        'Difficulty with balance or spatial orientation',
        'Nausea in vehicles or on rides'
      ],
      oral: [
        'Restricted diet due to texture sensitivities',
        'Strong food preferences',
        'Difficulty with mixed textures',
        'Challenges in social eating situations'
      ],
      olfactory: [
        'Overwhelm from perfumes, cleaning products, or food smells',
        'Nausea or headaches from certain odors',
        'Avoidance of scented products',
        'Difficulty in environments with strong smells'
      ]
    };

    const domainImpacts = impacts[domain] || [];
    return score >= 8 ? domainImpacts : domainImpacts.slice(0, 2);
  }

  getSensoryStrategies(score, domain) {
    if (score < 5) return [];

    const strategies = {
      visual: [
        'Use blue-light filtering glasses or screen filters',
        'Adjust lighting in your environment (lamps vs overhead)',
        'Wear sunglasses or hats to reduce light input',
        'Create visual calm zones with minimal patterns/clutter',
        'Use privacy screens or room dividers in open spaces'
      ],
      auditory: [
        'Use noise-canceling headphones or earplugs',
        'Create quiet spaces for work/rest',
        'Use white noise or preferred music to mask disturbing sounds',
        'Request accommodations for quiet work environments',
        'Plan activities during quieter times of day'
      ],
      tactile: [
        'Remove clothing tags and choose seamless garments',
        'Identify comfortable fabrics (often soft, natural fibers)',
        'Wash new clothes multiple times before wearing',
        'Communicate touch preferences to close contacts',
        'Use weighted blankets or compression clothing if helpful'
      ],
      vestibular: [
        'Take breaks from movement activities',
        'Use motion sickness remedies for travel',
        'Choose seats with stable views (front of vehicles)',
        'Practice grounding techniques',
        'Avoid triggering movements when possible'
      ],
      oral: [
        'Build a safe food list and expand gradually',
        'Prepare meals with preferred textures',
        'Communicate dietary needs without shame',
        'Find restaurants with sensory-friendly options',
        'Consider texture-modified versions of nutritious foods'
      ],
      olfactory: [
        'Use unscented personal care products',
        'Request fragrance-free environments when possible',
        'Keep preferred scents (mint, lavender) for relief',
        'Use air purifiers to reduce odors',
        'Step outside when overwhelmed by smells'
      ]
    };

    return strategies[domain] || [];
  }

  /**
   * Interpret ADHD scores
   */
  interpretADHDScore(score, indicators) {
    const interpretation = {
      rawScore: score,
      scale: this.getADHDScale(score),
      percentile: this.getADHDPercentile(score),
      meaning: this.getADHDMeaning(score),
      functionalImpact: this.getADHDFunctionalImpact(score, indicators),
      nextSteps: this.getADHDNextSteps(score)
    };

    return interpretation;
  }

  getADHDScale(score) {
    if (score >= 20) return { level: 'Very High', value: 5, max: 5, description: 'Strong trait indicators' };
    if (score >= 14) return { level: 'High', value: 4, max: 5, description: 'Significant trait indicators' };
    if (score >= 10) return { level: 'Moderate-High', value: 3, max: 5, description: 'Moderate trait indicators' };
    if (score >= 5) return { level: 'Moderate', value: 2, max: 5, description: 'Some trait indicators' };
    if (score >= 2) return { level: 'Low', value: 1, max: 5, description: 'Minimal trait indicators' };
    return { level: 'Very Low', value: 0, max: 5, description: 'Few to no trait indicators' };
  }

  getADHDPercentile(score) {
    if (score >= 20) return 98;
    if (score >= 14) return 95;
    if (score >= 10) return 85;
    if (score >= 5) return 65;
    return 40;
  }

  getADHDMeaning(score) {
    if (score >= 14) {
      return 'Your responses indicate ADHD traits more strongly than approximately 95% of the general population. This suggests significant challenges with attention, executive function, and/or impulse control.';
    }
    if (score >= 10) {
      return 'Your responses show ADHD traits more strongly than approximately 85% of the general population. This indicates notable difficulties with focus, organization, or impulse regulation.';
    }
    if (score >= 5) {
      return 'Your responses suggest some ADHD traits. This reflects occasional challenges with attention or organization that are noticeable but may not significantly impair functioning.';
    }
    return 'Your responses show minimal ADHD traits, similar to most of the general population.';
  }

  getADHDFunctionalImpact(score, indicators) {
    const impacts = [];

    if (indicators.inattention >= 8) {
      impacts.push({
        area: 'Attention & Focus',
        severity: 'significant',
        description: 'You likely experience frequent difficulty sustaining attention, completing tasks, and avoiding distractions. This may impact work, relationships, and daily responsibilities.'
      });
    }

    if (indicators.hyperactivity >= 6) {
      impacts.push({
        area: 'Hyperactivity & Restlessness',
        severity: 'moderate',
        description: 'You may feel driven by an internal motor, have difficulty sitting still, or feel constantly "on the go." This restlessness may make relaxation challenging.'
      });
    }

    if (indicators.impulsivity >= 6) {
      impacts.push({
        area: 'Impulsivity',
        severity: 'moderate',
        description: 'You may act without thinking, interrupt others, make snap decisions, or struggle to wait your turn. This can affect relationships and financial decisions.'
      });
    }

    return impacts;
  }

  getADHDNextSteps(score) {
    if (score >= 14) {
      return [
        'Strongly consider evaluation by a qualified clinician (psychiatrist, psychologist, or neuropsychologist)',
        'ADHD is highly treatable with medication and/or therapy',
        'Learn about executive function strategies and tools',
        'Explore environmental modifications (timers, reminders, body doubling)',
        'Connect with ADHD communities for support and strategies'
      ];
    }
    if (score >= 10) {
      return [
        'Consider professional evaluation if symptoms cause distress or impairment',
        'Explore ADHD-friendly organization systems and time management tools',
        'Learn about executive function challenges and compensatory strategies',
        'Consider whether symptoms vary with medication, sleep, or stress levels'
      ];
    }
    return [
      'Your responses suggest minimal ADHD traits',
      'If specific focus or organization challenges persist, consider discussing with a healthcare provider'
    ];
  }
}

module.exports = new ScoreInterpreter();
