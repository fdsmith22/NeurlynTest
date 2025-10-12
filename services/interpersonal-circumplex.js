/**
 * Interpersonal Circumplex Analyzer
 *
 * Maps personality to the interpersonal circumplex model using Agency (Dominance)
 * and Communion (Warmth) dimensions. Based on Wiggins (1979), Leary (1957),
 * and recent meta-analyses (Locke 2023, Sosnowska et al. 2020).
 *
 * The circumplex defines 8 octants describing interpersonal styles:
 * PA - Assured-Dominant, BC - Gregarious-Extraverted, DE - Arrogant-Calculating,
 * FG - Cold-Quarrelsome, HI - Aloof-Introverted, JK - Unassured-Submissive,
 * LM - Unassuming-Ingenuous, NO - Warm-Agreeable
 *
 * Research shows strong predictive validity for:
 * - Relationship satisfaction (r = .42 for communion)
 * - Leadership emergence (r = .38 for agency)
 * - Psychopathology patterns (distinct profiles for disorders)
 *
 * @see Locke, K. D. (2023). Interpersonal circumplex models and measures of personality
 * @see Wiggins, J. S. (1979). A psychological taxonomy of trait-descriptive terms
 */

class InterpersonalCircumplex {
  constructor() {
    // Octant definitions with Big Five correlations
    this.octants = {
      PA: {
        name: 'Assured-Dominant',
        shortName: 'Dominant',
        angle: 90,
        description: 'Confident, assertive, takes charge in social situations',
        characteristics: [
          'Natural leadership presence',
          'Comfortable giving direction',
          'Socially confident and outgoing',
          'Influences others effectively'
        ],
        strengths: ['Leadership', 'Decision-making', 'Inspiring others', 'Taking initiative'],
        challenges: ['May dominate conversations', 'Risk of appearing overbearing'],
        ideal_contexts: ['Leadership roles', 'Public speaking', 'Team direction', 'Negotiations']
      },
      BC: {
        name: 'Gregarious-Extraverted',
        shortName: 'Sociable',
        angle: 45,
        description: 'Outgoing, friendly, seeks social connection',
        characteristics: [
          'Thrives in social settings',
          'Builds connections easily',
          'Energetic and enthusiastic',
          'Enjoys group activities'
        ],
        strengths: ['Networking', 'Team building', 'Social energy', 'Enthusiasm'],
        challenges: ['May neglect solitary work', 'Risk of superficial connections'],
        ideal_contexts: ['Sales', 'Community organizing', 'Event planning', 'Hospitality']
      },
      DE: {
        name: 'Arrogant-Calculating',
        shortName: 'Competitive',
        angle: 0,
        description: 'Competitive, strategic, prioritizes winning',
        characteristics: [
          'Highly competitive drive',
          'Strategic in interactions',
          'Focused on status and achievement',
          'Willing to challenge others'
        ],
        strengths: ['Competition', 'Strategic thinking', 'Ambition', 'Results focus'],
        challenges: ['Relationship strain', 'May alienate collaborators'],
        ideal_contexts: ['Competitive fields', 'Individual achievement', 'Debate', 'Advocacy']
      },
      FG: {
        name: 'Cold-Quarrelsome',
        shortName: 'Critical',
        angle: 315,
        description: 'Critical, skeptical, maintains emotional distance',
        characteristics: [
          'Skeptical of others\' motives',
          'Maintains emotional boundaries',
          'Direct in criticism',
          'Values truth over harmony'
        ],
        strengths: ['Critical analysis', 'Honesty', 'Independence', 'Quality standards'],
        challenges: ['Relationship building', 'Team harmony', 'Emotional connection'],
        ideal_contexts: ['Quality assurance', 'Critical analysis', 'Investigation', 'Auditing']
      },
      HI: {
        name: 'Aloof-Introverted',
        shortName: 'Reserved',
        angle: 270,
        description: 'Reserved, private, comfortable in solitude',
        characteristics: [
          'Values privacy and independence',
          'Selective in social engagement',
          'Comfortable working alone',
          'Reflective and introspective'
        ],
        strengths: ['Independent work', 'Deep focus', 'Self-sufficiency', 'Introspection'],
        challenges: ['Networking', 'Team visibility', 'Asking for help'],
        ideal_contexts: ['Research', 'Writing', 'Technical work', 'Creative solitude']
      },
      JK: {
        name: 'Unassured-Submissive',
        shortName: 'Modest',
        angle: 225,
        description: 'Modest, deferential, prefers following to leading',
        characteristics: [
          'Modest and unassuming',
          'Defers to others\' expertise',
          'Uncomfortable with authority',
          'Seeks guidance from others'
        ],
        strengths: ['Humility', 'Collaboration', 'Receptiveness', 'Avoiding conflict'],
        challenges: ['Self-advocacy', 'Leadership', 'Confidence building'],
        ideal_contexts: ['Supportive roles', 'Team membership', 'Service positions', 'Craftsmanship']
      },
      LM: {
        name: 'Unassuming-Ingenuous',
        shortName: 'Agreeable',
        angle: 180,
        description: 'Agreeable, trusting, values harmony',
        characteristics: [
          'Highly agreeable and cooperative',
          'Trusts others readily',
          'Values group harmony',
          'Avoids confrontation'
        ],
        strengths: ['Cooperation', 'Trust building', 'Harmony', 'Supportiveness'],
        challenges: ['Assertiveness', 'Boundary setting', 'Conflict engagement'],
        ideal_contexts: ['Team collaboration', 'Counseling', 'Mediation', 'Customer care']
      },
      NO: {
        name: 'Warm-Agreeable',
        shortName: 'Nurturing',
        angle: 135,
        description: 'Warm, nurturing, focuses on relationships',
        characteristics: [
          'Deeply caring and empathetic',
          'Prioritizes relationships',
          'Provides emotional support',
          'Builds strong bonds'
        ],
        strengths: ['Empathy', 'Relationship building', 'Emotional support', 'Caregiving'],
        challenges: ['Boundaries', 'Self-care', 'Asserting needs'],
        ideal_contexts: ['Healthcare', 'Teaching', 'Therapy', 'Social work']
      }
    };

    // Agency and Communion outcome correlations from research
    this.outcomes = {
      agency: {
        leadership: 0.38,
        income: 0.24,
        career_success: 0.31,
        assertiveness_benefits: 0.42
      },
      communion: {
        relationship_satisfaction: 0.42,
        social_support: 0.47,
        empathy: 0.51,
        helping_behavior: 0.39
      }
    };
  }

  /**
   * Calculate Agency and Communion scores from Big Five
   *
   * Agency = Extraversion.assertiveness + Extraversion.activity + Conscientiousness.achievement
   * Communion = Agreeableness + Extraversion.warmth + Extraversion.gregariousness
   *
   * @param {Object} bigFive - Big Five trait scores (0-100)
   * @param {Object} facets - Optional facet-level scores for precision
   * @returns {Object} Agency and communion scores with octant classification
   */
  analyze(bigFive, facets = null) {
    const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = bigFive;

    console.log('[IPC-DEBUG] Input Big Five:', { O: openness, C: conscientiousness, E: extraversion, A: agreeableness, N: neuroticism });
    console.log('[IPC-DEBUG] Facets provided:', facets ? 'YES' : 'NO');

    // Calculate Agency (Dominance/Status)
    let agency;
    if (facets) {
      // Use facet-level data for more accurate calculation
      const assertiveness = facets.extraversion?.assertiveness || extraversion;
      const activity = facets.extraversion?.activity || extraversion;
      const achievement = facets.conscientiousness?.achievementStriving || conscientiousness;

      agency = (
        assertiveness * 0.5 +
        activity * 0.25 +
        achievement * 0.25
      );
      console.log('[IPC-DEBUG] Agency (facet-based):');
      console.log(`  Assertiveness: ${assertiveness} * 0.5 = ${assertiveness * 0.5}`);
      console.log(`  Activity: ${activity} * 0.25 = ${activity * 0.25}`);
      console.log(`  Achievement: ${achievement} * 0.25 = ${achievement * 0.25}`);
      console.log(`  Total: ${agency}`);
    } else {
      // Estimate from trait-level data
      const eTerm = extraversion * 0.6;
      const cTerm = conscientiousness * 0.3;
      const nTerm = (100 - neuroticism) * 0.1;

      agency = eTerm + cTerm + nTerm;

      console.log('[IPC-DEBUG] Agency (trait-based):');
      console.log(`  E term: ${extraversion} * 0.6 = ${eTerm}`);
      console.log(`  C term: ${conscientiousness} * 0.3 = ${cTerm}`);
      console.log(`  N term: (100 - ${neuroticism}) * 0.1 = ${nTerm}`);
      console.log(`  Total: ${agency}`);
    }

    // Calculate Communion (Warmth/Love)
    let communion;
    if (facets) {
      const agree = agreeableness;
      const warmth = facets.extraversion?.warmth || extraversion;
      const gregariousness = facets.extraversion?.gregariousness || extraversion;

      communion = (
        agree * 0.5 +
        warmth * 0.3 +
        gregariousness * 0.2
      );
      console.log('[IPC-DEBUG] Communion (facet-based):');
      console.log(`  Agreeableness: ${agree} * 0.5 = ${agree * 0.5}`);
      console.log(`  Warmth: ${warmth} * 0.3 = ${warmth * 0.3}`);
      console.log(`  Gregariousness: ${gregariousness} * 0.2 = ${gregariousness * 0.2}`);
      console.log(`  Total: ${communion}`);
    } else {
      const aTerm = agreeableness * 0.6;
      const eTerm = extraversion * 0.3;
      const oTerm = openness * 0.1;

      communion = aTerm + eTerm + oTerm;

      console.log('[IPC-DEBUG] Communion (trait-based):');
      console.log(`  A term: ${agreeableness} * 0.6 = ${aTerm}`);
      console.log(`  E term: ${extraversion} * 0.3 = ${eTerm}`);
      console.log(`  O term: ${openness} * 0.1 = ${oTerm}`);
      console.log(`  Total: ${communion}`);
    }

    // Normalize to 0-100 range
    const rawAgency = agency;
    const rawCommunion = communion;

    agency = Math.max(0, Math.min(100, agency));
    communion = Math.max(0, Math.min(100, communion));

    console.log('[IPC-DEBUG] After normalization:');
    console.log(`  Agency: ${rawAgency} → ${agency} (rounded: ${Math.round(agency)})`);
    console.log(`  Communion: ${rawCommunion} → ${communion} (rounded: ${Math.round(communion)})`);

    // Determine octant
    const octant = this.determineOctant(agency, communion);

    // Calculate interpersonal effectiveness
    const effectiveness = this.calculateEffectiveness(agency, communion);

    return {
      agency: Math.round(agency),
      communion: Math.round(communion),
      octant,
      octantDetails: this.octants[octant],
      effectiveness,
      style: this.getInterpersonalStyle(agency, communion),
      recommendations: this.getRecommendations(octant, agency, communion),
      outcomePredictions: this.predictOutcomes(agency, communion),
      visualization: this.generateVisualizationData(agency, communion, octant)
    };
  }

  /**
   * Determine which octant based on agency and communion scores
   */
  determineOctant(agency, communion) {
    // Convert to angle (0-360 degrees)
    // Center point is 50,50 (average agency and communion)
    const dx = agency - 50;
    const dy = communion - 50;

    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;

    // Map angle to octant
    // Each octant spans 45 degrees
    const octantMap = [
      { min: 337.5, max: 22.5, code: 'DE' },   // 0° (east)
      { min: 22.5, max: 67.5, code: 'BC' },    // 45°
      { min: 67.5, max: 112.5, code: 'PA' },   // 90° (north)
      { min: 112.5, max: 157.5, code: 'NO' },  // 135°
      { min: 157.5, max: 202.5, code: 'LM' },  // 180° (west)
      { min: 202.5, max: 247.5, code: 'JK' },  // 225°
      { min: 247.5, max: 292.5, code: 'HI' },  // 270° (south)
      { min: 292.5, max: 337.5, code: 'FG' }   // 315°
    ];

    for (const { min, max, code } of octantMap) {
      if (min > max) {  // Wraps around 0°
        if (angle >= min || angle < max) return code;
      } else {
        if (angle >= min && angle < max) return code;
      }
    }

    return 'PA';  // Default
  }

  /**
   * Calculate interpersonal effectiveness
   * High on both dimensions = most effective
   */
  calculateEffectiveness(agency, communion) {
    // Balanced high scores are most effective
    const avgScore = (agency + communion) / 2;
    const balance = 100 - Math.abs(agency - communion);

    const effectiveness = (avgScore * 0.7 + balance * 0.3);

    return {
      score: Math.round(effectiveness),
      level: effectiveness > 70 ? 'High' :
             effectiveness > 50 ? 'Moderate' :
             effectiveness > 30 ? 'Developing' : 'Low',
      interpretation: this.interpretEffectiveness(effectiveness, agency, communion)
    };
  }

  /**
   * Get interpersonal style description
   */
  getInterpersonalStyle(agency, communion) {
    const styles = [];

    if (agency > 65 && communion > 65) {
      styles.push('Charismatic Leader: High agency and communion create influential warmth');
    } else if (agency > 65 && communion < 40) {
      styles.push('Commanding Director: High agency with low communion creates authoritative presence');
    } else if (agency < 40 && communion > 65) {
      styles.push('Supportive Partner: High communion with low agency creates nurturing presence');
    } else if (agency < 40 && communion < 40) {
      styles.push('Independent Observer: Low on both dimensions suggests preference for autonomy');
    }

    // Add balance note
    const diff = Math.abs(agency - communion);
    if (diff < 15) {
      styles.push('Balanced Profile: Similar agency and communion create versatile interpersonal style');
    } else if (diff > 40) {
      styles.push('Specialized Profile: Large difference creates distinctive interpersonal niche');
    }

    return styles.join('. ');
  }

  /**
   * Interpret effectiveness score
   */
  interpretEffectiveness(score, agency, communion) {
    if (score > 70) {
      return 'Your balanced high scores on agency and communion suggest strong interpersonal effectiveness. You can both lead and connect, making you valuable in diverse social contexts.';
    } else if (score > 50) {
      return 'You demonstrate moderate interpersonal effectiveness. Consider developing the dimension where you score lower to enhance your social impact.';
    } else {
      const lower = agency < communion ? 'agency (assertiveness, confidence)' : 'communion (warmth, cooperation)';
      return `Building your ${lower} will significantly improve your interpersonal effectiveness. Small increases in this area can have large impacts on relationship quality.`;
    }
  }

  /**
   * Get recommendations based on octant and scores
   */
  getRecommendations(octant, agency, communion) {
    const octantData = this.octants[octant];
    const recommendations = {
      strengths: octantData.strengths,
      challenges: octantData.challenges,
      development: [],
      contexts: octantData.ideal_contexts
    };

    // Add development recommendations based on scores
    if (agency < 40) {
      recommendations.development.push({
        area: 'Agency Development',
        actions: [
          'Practice assertiveness in low-stakes situations',
          'Take leadership roles in familiar contexts',
          'Build confidence through competence development',
          'Join Toastmasters or similar speaking groups'
        ]
      });
    }

    if (communion < 40) {
      recommendations.development.push({
        area: 'Communion Development',
        actions: [
          'Practice active listening without judgment',
          'Express appreciation and warmth more frequently',
          'Engage in cooperative activities',
          'Develop empathy through perspective-taking exercises'
        ]
      });
    }

    if (agency > 75 && communion < 40) {
      recommendations.development.push({
        area: 'Balance High Agency with Warmth',
        actions: [
          'Lead with questions rather than directives',
          'Show vulnerability to build connection',
          'Acknowledge others\' contributions explicitly',
          'Practice collaborative decision-making'
        ]
      });
    }

    if (communion > 75 && agency < 40) {
      recommendations.development.push({
        area: 'Balance High Communion with Assertiveness',
        actions: [
          'Practice saying no to unreasonable requests',
          'State your needs and preferences clearly',
          'Set boundaries while maintaining warmth',
          'Take credit for your contributions'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Predict outcomes based on agency and communion
   */
  predictOutcomes(agency, communion) {
    // Normalize to correlation scale
    const agencyZ = (agency - 50) / 20;
    const communionZ = (communion - 50) / 20;

    return {
      career: {
        leadership: this.predictOutcome(agencyZ, 0.38),
        income: this.predictOutcome(agencyZ, 0.24),
        career_advancement: this.predictOutcome(agencyZ, 0.31)
      },
      relationships: {
        satisfaction: this.predictOutcome(communionZ, 0.42),
        social_support: this.predictOutcome(communionZ, 0.47),
        conflict_resolution: this.predictOutcome(communionZ, 0.35)
      },
      wellbeing: {
        overall_effectiveness: this.predictOutcome((agencyZ + communionZ) / 2, 0.45),
        stress_resilience: this.predictOutcome(agencyZ, 0.28),
        social_wellbeing: this.predictOutcome(communionZ, 0.51)
      }
    };
  }

  /**
   * Predict specific outcome from dimension score and correlation
   */
  predictOutcome(zScore, correlation) {
    // Calculate percentile based on correlation
    const effect = zScore * correlation;
    const percentile = 50 + (effect * 20);  // Rough conversion

    return {
      percentile: Math.max(1, Math.min(99, Math.round(percentile))),
      effect: effect > 0.3 ? 'Strong positive' :
              effect > 0.1 ? 'Moderate positive' :
              effect > -0.1 ? 'Average' :
              effect > -0.3 ? 'Developing' : 'Below average',
      confidence: Math.abs(correlation) > 0.4 ? 'High' :
                  Math.abs(correlation) > 0.25 ? 'Moderate' : 'Low'
    };
  }

  /**
   * Generate data for circumplex visualization
   */
  generateVisualizationData(agency, communion, octant) {
    return {
      center: { x: 50, y: 50 },
      userPoint: { x: agency, y: communion },
      octant,
      angle: Math.atan2(communion - 50, agency - 50) * (180 / Math.PI),
      distance: Math.sqrt(Math.pow(agency - 50, 2) + Math.pow(communion - 50, 2)),
      quadrant: this.getQuadrant(agency, communion)
    };
  }

  /**
   * Determine quadrant for simplified interpretation
   */
  getQuadrant(agency, communion) {
    if (agency >= 50 && communion >= 50) return 'Influential (High Agency + High Communion)';
    if (agency >= 50 && communion < 50) return 'Dominant (High Agency + Low Communion)';
    if (agency < 50 && communion >= 50) return 'Supportive (Low Agency + High Communion)';
    return 'Independent (Low Agency + Low Communion)';
  }
}

module.exports = InterpersonalCircumplex;
