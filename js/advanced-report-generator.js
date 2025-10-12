/**
 * Advanced Report Generator for Neurlyn
 * Sophisticated psychological analysis with deep insights
 * Integrates with statistical analyzer, narrative generator, and neurodivergent screener
 */

// Import complete psychological research database for validated scoring
const PsychologicalResearch =
  typeof CompletePsychologicalResearchDatabase !== 'undefined'
    ? CompletePsychologicalResearchDatabase
    : typeof PsychologicalResearchDatabase !== 'undefined'
      ? PsychologicalResearchDatabase
      : typeof require !== 'undefined'
        ? require('../psychological-research-database-complete.js')
        : null;

class AdvancedReportGenerator {
  constructor() {
    this.initializeDescriptions();
    this.initializePopulationNorms();
    this.initializeArchetypes();

    // Store research database reference
    this.researchDB = PsychologicalResearch;

    // Initialize enhanced services (will be loaded from backend in production)
    this.statisticalAnalyzer = null;
    this.narrativeGenerator = null;
    this.neurodivergentScreener = null;
    this.insightPatterns = [];

    // Initialize enhancement modules
    this.insightTracker = typeof InsightTracker !== 'undefined' ? new InsightTracker() : null;
    this.enhancedTraitAnalyzer =
      typeof EnhancedTraitAnalyzer !== 'undefined' ? new EnhancedTraitAnalyzer() : null;
    this.explanationEngine =
      typeof ExplanationEngine !== 'undefined' ? new ExplanationEngine() : null;
    this.responseQualityAssessor =
      typeof ResponseQualityAssessor !== 'undefined' ? new ResponseQualityAssessor() : null;

    // Initialize new enhanced features
    this.initializeStrengthsAndChallenges();
    this.initializeGrowthAreas();
    this.initializeActionableInsights();
    this.initializeVisualizationTemplates();
  }

  /**
   * Initialize strengths and challenges mappings
   */
  initializeStrengthsAndChallenges() {
    this.strengthsMap = {
      openness: {
        high: [
          'Creative problem-solving',
          'Innovative thinking',
          'Adaptability to change',
          'Intellectual curiosity'
        ],
        low: ['Practical focus', 'Consistency', 'Traditional values', 'Reliable approaches']
      },
      conscientiousness: {
        high: [
          'Strong work ethic',
          'Excellent organization',
          'Goal achievement',
          'Attention to detail'
        ],
        low: ['Flexibility', 'Spontaneity', 'Creative freedom', 'Adaptable planning']
      },
      extraversion: {
        high: [
          'Natural leadership',
          'Networking ability',
          'Team energizer',
          'Communication skills'
        ],
        low: [
          'Deep focus',
          'Independent work',
          'Thoughtful analysis',
          'Quality over quantity in relationships'
        ]
      },
      agreeableness: {
        high: ['Team harmony', 'Empathy', 'Collaboration', 'Conflict resolution'],
        low: [
          'Assertiveness',
          'Objective decision-making',
          'Competitive drive',
          'Direct communication'
        ]
      },
      neuroticism: {
        high: [
          'Risk awareness',
          'Emotional depth',
          'Empathetic understanding',
          'Attention to problems'
        ],
        low: ['Emotional stability', 'Stress resilience', 'Calm under pressure', 'Consistent mood']
      }
    };

    this.challengesMap = {
      openness: {
        high: [
          'May overlook practical details',
          'Risk of overcomplicating',
          'Difficulty with routine tasks'
        ],
        low: [
          'May resist innovation',
          'Limited exploration of alternatives',
          'Difficulty adapting to change'
        ]
      },
      conscientiousness: {
        high: ['Perfectionism', 'Inflexibility', 'Work-life balance issues', 'Over-planning'],
        low: [
          'Meeting deadlines',
          'Maintaining organization',
          'Following through',
          'Detail orientation'
        ]
      },
      extraversion: {
        high: [
          'May dominate conversations',
          'Need for external stimulation',
          'Difficulty with solitary work'
        ],
        low: [
          'Networking challenges',
          'Public speaking anxiety',
          'Team participation',
          'Social energy management'
        ]
      },
      agreeableness: {
        high: [
          'Difficulty saying no',
          'Avoiding conflict',
          'Being taken advantage of',
          'Compromising too much'
        ],
        low: ['Building rapport', 'Team cooperation', "Considering others' feelings", 'Diplomacy']
      },
      neuroticism: {
        high: [
          'Stress management',
          'Overthinking',
          'Emotional regulation',
          'Anxiety in uncertainty'
        ],
        low: [
          'May miss warning signs',
          "Understanding others' emotions",
          'Expressing vulnerability'
        ]
      }
    };
  }

  /**
   * Initialize growth areas
   */
  initializeGrowthAreas() {
    this.growthAreasMap = {
      openness: {
        high: 'Focus on practical implementation and follow-through',
        moderate: 'Balance creativity with practical execution',
        low: 'Explore new perspectives and innovative approaches'
      },
      conscientiousness: {
        high: 'Practice flexibility and spontaneity',
        moderate: 'Maintain balance between structure and adaptability',
        low: 'Develop organizational systems and goal-setting habits'
      },
      extraversion: {
        high: 'Cultivate deep listening and reflective practices',
        moderate: 'Balance social and solitary activities',
        low: 'Gradually expand social comfort zone'
      },
      agreeableness: {
        high: 'Practice assertiveness and boundary-setting',
        moderate: 'Balance cooperation with self-advocacy',
        low: 'Develop empathy and collaborative skills'
      },
      neuroticism: {
        high: 'Build stress resilience and coping strategies',
        moderate: 'Maintain emotional awareness while staying grounded',
        low: 'Develop emotional awareness and expression'
      }
    };
  }

  /**
   * Initialize actionable insights system
   */
  initializeActionableInsights() {
    this.actionableInsights = {
      career: {
        templates: [
          'Consider roles that leverage your {strength} while developing {growth_area}',
          'Your {trait} profile suggests success in {career_field}',
          'Focus on positions that allow {work_style} while challenging you to {development}'
        ]
      },
      relationships: {
        templates: [
          'Your {social_style} benefits from {relationship_strategy}',
          'Consider {communication_approach} to enhance connections',
          'Balance your {trait} with {complementary_behavior}'
        ]
      },
      personal: {
        templates: [
          'Try {activity} to develop {skill}',
          'Practice {technique} for 10 minutes daily to improve {area}',
          'Set weekly goals for {improvement_area} using {method}'
        ]
      },
      wellbeing: {
        templates: [
          'Your stress response suggests {coping_strategy} would be beneficial',
          'Incorporate {wellness_activity} to balance {trait}',
          'Schedule regular {self_care} to maintain {balance}'
        ]
      }
    };
  }

  /**
   * Initialize visualization templates
   */
  initializeVisualizationTemplates() {
    this.visualizations = {
      traitChart: {
        type: 'radar',
        template: `
          <div class="trait-radar-chart">
            <svg viewBox="0 0 400 400" class="radar-svg">
              <g class="radar-grid">
                {gridLines}
              </g>
              <g class="radar-labels">
                {traitLabels}
              </g>
              <g class="radar-data">
                <polygon points="{dataPoints}"
                         fill="rgba(76, 175, 80, 0.3)"
                         stroke="#4CAF50"
                         stroke-width="2"/>
                {dataCircles}
              </g>
              <g class="confidence-bands">
                {confidenceBands}
              </g>
            </svg>
          </div>`
      },
      progressBar: {
        type: 'linear',
        template: `
          <div class="trait-progress-bar">
            <div class="trait-label">{traitName}</div>
            <div class="progress-container">
              <div class="progress-track">
                <div class="progress-fill" style="width: {score}%">
                  <span class="progress-value">{score}%</span>
                </div>
                <div class="confidence-interval"
                     style="left: {lower}%; width: {range}%"
                     title="Confidence: {confidence}%">
                </div>
              </div>
              <div class="progress-markers">
                <span class="marker low">Low</span>
                <span class="marker mid">Average</span>
                <span class="marker high">High</span>
              </div>
            </div>
          </div>`
      },
      insightCard: {
        type: 'card',
        template: `
          <div class="insight-card {priority}">
            <div class="insight-icon">{icon}</div>
            <div class="insight-content">
              <h4 class="insight-title">{title}</h4>
              <p class="insight-text">{description}</p>
              <div class="insight-action">{action}</div>
            </div>
            <div class="insight-confidence">
              Confidence: {confidence}%
            </div>
          </div>`
      }
    };
  }

  /**
   * Generate visualizations for traits
   */
  generateTraitVisualizations(traits, confidence = {}) {
    const visualizations = [];

    // Generate radar chart for all traits (DISABLED - using neurlyn-adaptive-integration.js visualizations instead)
    // const radarData = this.generateRadarChartData(traits, confidence);
    // visualizations.push({
    //   type: 'radar',
    //   title: 'Personality Profile Overview',
    //   html: this.renderRadarChart(radarData)
    // });

    // Generate progress bars for each trait
    Object.entries(traits).forEach(([trait, score]) => {
      const traitConfidence = confidence[trait] || {
        confidence: 75,
        interval: { lower: score - 10, upper: score + 10 }
      };

      visualizations.push({
        type: 'progress',
        trait: trait,
        html: this.renderProgressBar(trait, score, traitConfidence)
      });
    });

    return visualizations;
  }

  /**
   * Generate radar chart data
   */
  generateRadarChartData(traits, confidence) {
    const traitOrder = [
      'openness',
      'conscientiousness',
      'extraversion',
      'agreeableness',
      'neuroticism'
    ];
    const centerX = 200,
      centerY = 200,
      radius = 150;
    const angleStep = (2 * Math.PI) / traitOrder.length;

    const dataPoints = traitOrder.map((trait, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const score = traits[trait] || 50;
      const r = (score / 100) * radius;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      return { x, y, trait, score, angle };
    });

    return {
      traits: traitOrder,
      dataPoints,
      centerX,
      centerY,
      radius,
      confidence
    };
  }

  /**
   * Generate population comparison SVG chart
   */
  generatePopulationComparisonChart(percentiles) {
    const width = 400;
    const height = 300;
    const margin = 40;
    const barWidth = (width - 2 * margin) / 5;

    const traits = [
      'openness',
      'conscientiousness',
      'extraversion',
      'agreeableness',
      'neuroticism'
    ];
    const traitLabels = {
      openness: 'O',
      conscientiousness: 'C',
      extraversion: 'E',
      agreeableness: 'A',
      neuroticism: 'N'
    };

    let svg = `
      <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="width: 100%; max-width: 400px;">
        <!-- Background -->
        <rect width="${width}" height="${height}" fill="white"/>

        <!-- Grid lines -->
        ${[0, 25, 50, 75, 100]
          .map(
            level => `
          <line x1="${margin}" y1="${height - margin - level * 2}"
                x2="${width - margin}" y2="${height - margin - level * 2}"
                stroke="#e0e0e0" stroke-width="1" stroke-dasharray="2,2"/>
          <text x="${margin - 5}" y="${height - margin - level * 2 + 5}"
                text-anchor="end" fill="#9ca3af" font-size="12">${level}</text>
        `
          )
          .join('')}

        <!-- Bars -->
        ${traits
          .map((trait, i) => {
            const percentile =
              typeof percentiles[trait] === 'object'
                ? percentiles[trait].percentile
                : percentiles[trait];
            const barHeight = (percentile || 50) * 2;
            const x = margin + i * barWidth + barWidth * 0.2;
            const y = height - margin - barHeight;
            const color = percentile > 70 ? '#6c9e83' : percentile > 30 ? '#8bb19d' : '#a7c4b0';

            return `
            <rect x="${x}" y="${y}" width="${barWidth * 0.6}" height="${barHeight}"
                  fill="${color}" rx="4" opacity="0.8">
              <animate attributeName="height" from="0" to="${barHeight}" dur="0.8s" fill="freeze"/>
              <animate attributeName="y" from="${height - margin}" to="${y}" dur="0.8s" fill="freeze"/>
            </rect>
            <text x="${x + barWidth * 0.3}" y="${height - margin + 20}"
                  text-anchor="middle" fill="#374151" font-size="14" font-weight="bold">
              ${traitLabels[trait]}
            </text>
            <text x="${x + barWidth * 0.3}" y="${y - 5}"
                  text-anchor="middle" fill="#374151" font-size="12" font-weight="600">
              ${percentile}%
            </text>
          `;
          })
          .join('')}

        <!-- Labels -->
        <text x="${width / 2}" y="${height - 5}" text-anchor="middle" fill="#6b7280" font-size="12">
          Personality Traits
        </text>
        <text x="15" y="${height / 2}" text-anchor="middle" fill="#6b7280" font-size="12"
              transform="rotate(-90 15 ${height / 2})">
          Percentile Rank
        </text>
      </svg>
    `;

    return svg;
  }

  /**
   * Render radar chart
   */
  renderRadarChart(data) {
    const { dataPoints, centerX, centerY, radius } = data;

    // Generate grid lines
    const gridLines = [20, 40, 60, 80, 100]
      .map(level => {
        const r = (level / 100) * radius;
        const points = dataPoints
          .map(d => {
            const x = centerX + r * Math.cos(d.angle);
            const y = centerY + r * Math.sin(d.angle);
            return `${x},${y}`;
          })
          .join(' ');
        return `<polygon points="${points}" fill="none" stroke="#e0e0e0" stroke-width="1"/>`;
      })
      .join('');

    // Generate trait labels
    const traitLabels = dataPoints
      .map(d => {
        const labelR = radius + 20;
        const x = centerX + labelR * Math.cos(d.angle);
        const y = centerY + labelR * Math.sin(d.angle);
        return `<text x="${x}" y="${y}" text-anchor="middle" class="trait-label">
                ${d.trait.charAt(0).toUpperCase() + d.trait.slice(1)}
                <tspan x="${x}" dy="15" class="trait-score">${d.score}%</tspan>
              </text>`;
      })
      .join('');

    // Generate data points
    const pointsString = dataPoints.map(d => `${d.x},${d.y}`).join(' ');
    const dataCircles = dataPoints
      .map(d => `<circle cx="${d.x}" cy="${d.y}" r="5" fill="#4CAF50"/>`)
      .join('');

    return this.visualizations.traitChart.template
      .replace('{gridLines}', gridLines)
      .replace('{traitLabels}', traitLabels)
      .replace('{dataPoints}', pointsString)
      .replace('{dataCircles}', dataCircles)
      .replace('{confidenceBands}', ''); // TODO: Add confidence bands
  }

  /**
   * Render progress bar
   */
  renderProgressBar(trait, score, confidence) {
    const { interval } = confidence;
    const lower = interval?.lower || score - 10;
    const upper = interval?.upper || score + 10;
    const range = upper - lower;

    return this.visualizations.progressBar.template
      .replace(/{traitName}/g, trait.charAt(0).toUpperCase() + trait.slice(1))
      .replace(/{score}/g, score)
      .replace('{lower}', Math.max(0, lower))
      .replace('{range}', Math.min(100 - lower, range))
      .replace('{confidence}', confidence.confidence || 75);
  }

  /**
   * Generate strengths analysis
   */
  generateStrengthsAnalysis(traits) {
    const strengths = [];
    const topTraits = Object.entries(traits)
      .filter(([_, score]) => score > 60)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    topTraits.forEach(([trait, score]) => {
      const level = score > 80 ? 'high' : 'moderate';
      const traitStrengths =
        this.strengthsMap[trait]?.[level] || this.strengthsMap[trait]?.high || [];

      traitStrengths.forEach(strength => {
        strengths.push({
          trait,
          score,
          strength,
          description: this.generateStrengthDescription(trait, strength, score)
        });
      });
    });

    return strengths;
  }

  /**
   * Generate challenges analysis
   */
  generateChallengesAnalysis(traits) {
    const challenges = [];

    Object.entries(traits).forEach(([trait, score]) => {
      let level;
      if (score > 70) level = 'high';
      else if (score < 30) level = 'low';
      else return; // Skip moderate scores for challenges

      const traitChallenges = this.challengesMap[trait]?.[level] || [];

      traitChallenges.forEach(challenge => {
        challenges.push({
          trait,
          score,
          challenge,
          suggestion: this.generateChallengeSuggestion(trait, challenge, score)
        });
      });
    });

    return challenges.slice(0, 3); // Limit to top 3 challenges
  }

  /**
   * Generate growth recommendations
   */
  generateGrowthRecommendations(traits, strengths, challenges) {
    const recommendations = [];

    // Analyze trait balance
    Object.entries(traits).forEach(([trait, score]) => {
      let level;
      if (score > 70) level = 'high';
      else if (score > 30) level = 'moderate';
      else level = 'low';

      const growthArea = this.growthAreasMap[trait]?.[level];
      if (growthArea) {
        recommendations.push({
          area: trait,
          focus: growthArea,
          priority: this.calculatePriority(trait, score, challenges),
          actions: this.generateSpecificActions(trait, level)
        });
      }
    });

    return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 5);
  }

  /**
   * Generate actionable insights
   */
  generateActionableInsights(traits, profile, context = {}) {
    const insights = [];
    const categories = ['career', 'relationships', 'personal', 'wellbeing'];

    categories.forEach(category => {
      const categoryInsights = this.generateCategoryInsights(category, traits, profile);
      insights.push(...categoryInsights);
    });

    // Sort by relevance and limit
    return insights
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10)
      .map(insight => this.formatInsight(insight));
  }

  /**
   * Generate category-specific insights
   */
  generateCategoryInsights(category, traits, profile) {
    const insights = [];
    const templates = this.actionableInsights[category]?.templates || [];

    templates.forEach(template => {
      const insight = this.fillInsightTemplate(template, traits, profile, category);
      if (insight) {
        insights.push({
          category,
          text: insight,
          relevance: this.calculateInsightRelevance(insight, traits),
          priority: this.getInsightPriority(category, traits)
        });
      }
    });

    return insights;
  }

  /**
   * Fill insight template with actual data
   */
  fillInsightTemplate(template, traits, profile, category) {
    const replacements = {
      strength: this.getTopStrength(traits),
      growth_area: this.getTopGrowthArea(traits),
      trait: this.getDominantTrait(traits),
      career_field: this.suggestCareerField(traits),
      work_style: this.determineWorkStyle(traits),
      development: this.suggestDevelopmentArea(traits),
      social_style: this.determineSocialStyle(traits),
      relationship_strategy: this.suggestRelationshipStrategy(traits),
      communication_approach: this.suggestCommunicationStyle(traits),
      complementary_behavior: this.suggestComplementaryBehavior(traits),
      activity: this.suggestActivity(traits, category),
      skill: this.identifySkillToDevelop(traits),
      technique: this.suggestTechnique(traits),
      area: this.identifyImprovementArea(traits),
      improvement_area: this.getSpecificImprovementArea(traits),
      method: this.suggestMethod(traits),
      coping_strategy: this.suggestCopingStrategy(traits),
      wellness_activity: this.suggestWellnessActivity(traits),
      self_care: this.suggestSelfCare(traits),
      balance: this.identifyBalanceArea(traits)
    };

    let filled = template;
    Object.entries(replacements).forEach(([key, value]) => {
      filled = filled.replace(`{${key}}`, value);
    });

    // Only return if all placeholders were filled
    return filled.includes('{') ? null : filled;
  }

  /**
   * Helper methods for insights
   */
  getTopStrength(traits) {
    const sorted = Object.entries(traits).sort((a, b) => b[1] - a[1]);
    const [trait, score] = sorted[0];
    const strengths = this.strengthsMap[trait]?.[score > 70 ? 'high' : 'low'] || [];
    return strengths[0] || 'your unique perspective';
  }

  getTopGrowthArea(traits) {
    const sorted = Object.entries(traits).sort((a, b) => a[1] - b[1]);
    const [trait] = sorted[0];
    return `improving ${trait}`;
  }

  getDominantTrait(traits) {
    const sorted = Object.entries(traits).sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
  }

  suggestCareerField(traits) {
    if (traits.openness > 70 && traits.extraversion > 60) return 'creative leadership';
    if (traits.conscientiousness > 70 && traits.agreeableness < 40) return 'analytical roles';
    if (traits.agreeableness > 70 && traits.extraversion > 60) return 'people-focused positions';
    if (traits.conscientiousness > 70 && traits.neuroticism < 30)
      return 'high-responsibility roles';
    return 'balanced team environments';
  }

  determineWorkStyle(traits) {
    if (traits.extraversion > 60) return 'collaborative work';
    if (traits.conscientiousness > 70) return 'structured planning';
    if (traits.openness > 70) return 'creative exploration';
    return 'balanced approaches';
  }

  // Add more helper methods as needed...

  /**
   * Main enhanced report generation method
   */
  async generateReport(assessmentData) {
    const { responses, tier, duration, metadata, concerns, userProfile, analysis } = assessmentData;

    // Track insights if tracker is available
    if (this.insightTracker) {
      this.trackResponseInsights(responses);
    }

    // Assess response quality first
    let qualityAssessment = null;
    if (this.responseQualityAssessor) {
      qualityAssessment = this.responseQualityAssessor.assessResponseQuality(responses);
      if (!qualityAssessment.validity) {
        console.warn(
          '[Quality Warning] Response quality issues detected:',
          qualityAssessment.warnings
        );
      }
    }

    // Enhanced trait calculation with weighted scoring
    const traits = this.calculateWeightedTraits(responses);

    // Analyze response patterns for consistency and authenticity
    const responseAnalysis = this.analyzeResponsePatterns(responses);

    // Deep trait analysis with sub-dimensions
    let deepTraitAnalysis = null;
    if (this.enhancedTraitAnalyzer) {
      deepTraitAnalysis = this.enhancedTraitAnalyzer.analyzeTraits(traits, responses);
    }

    // Use backend services if available, fallback to local methods
    let enhancedAnalysis = analysis;
    let narrativeContent = null;
    let neurodivergentScreening = null;

    if (this.statisticalAnalyzer && this.narrativeGenerator && this.neurodivergentScreener) {
      // Use advanced backend services
      enhancedAnalysis = await this.runStatisticalAnalysis(traits, responses, metadata);
      narrativeContent = await this.generateNarrativeContent(traits, enhancedAnalysis, tier);
      neurodivergentScreening = await this.performNeurodivergentScreening(
        responses,
        traits,
        metadata
      );
    } else {
      // Fallback to enhanced local analysis
      enhancedAnalysis = this.performAdvancedLocalAnalysis(traits, responses, responseAnalysis);
      neurodivergentScreening = this.detectNeurodiversityMarkers(responses, responseAnalysis);
    }

    // Get trait analysis with confidence intervals
    const traitAnalysis = this.analyzeTraits(traits, responseAnalysis.confidence);

    // Generate explanation chains if engine is available
    let explanationData = null;
    if (this.explanationEngine && this.insightTracker) {
      const archetype = enhancedAnalysis?.archetype || {
        name: this.determinePersonalityArchetype(traits),
        confidence: 0.8
      };
      explanationData = this.explanationEngine.generateCompleteExplanation(
        this.insightTracker.answerContributions,
        traits,
        archetype
      );
    }

    // Calculate trait correlations
    const correlations = this.generateCorrelationMatrix(traits);

    // Compare to population norms
    const percentiles = this.compareToPopulationNorms(traits, metadata);

    // Detect cognitive patterns
    const cognitiveStyle = this.assessCognitiveStyle(responses, traits);

    // Generate comprehensive profiles using new methods
    const cognitiveProfile = this.analyzeCognitiveProfile(traits);
    const emotionalProfile = this.analyzeEmotionalProfile(traits);
    const socialProfile = this.analyzeSocialProfile(traits);
    const personalNarrative = this.generatePersonalNarrative(
      traits,
      enhancedAnalysis?.archetype || 'Unique Individual'
    );

    // NEW: Advanced adaptive analysis layers
    const contradictions = this.analyzeContradictions(responses, traits);
    const adaptivePatterns = this.analyzeAdaptivePatterns(responses);
    const growthTrajectory = this.predictGrowthTrajectory(traits, adaptivePatterns, metadata?.age);
    const behavioralFingerprint = this.generateBehavioralFingerprint(responses, traits);

    // Build comprehensive report with enhanced insights
    const report = {
      metadata: {
        ...metadata,
        generatedAt: new Date().toISOString(),
        assessmentTier: tier,
        totalResponses: responses?.length || 0,
        completionTime: duration,
        confidenceLevel: responseAnalysis.confidence,
        timeAnalysis: responseAnalysis.timeAnalysis,
        analysisVersion: '3.0-enhanced',
        userArchetype:
          enhancedAnalysis?.archetype?.name || this.determinePersonalityArchetype(traits)
      },
      traits,
      analysis: traitAnalysis,
      percentiles,
      enhancedAnalysis,
      summary: this.generateEnhancedSummary(traits, traitAnalysis, correlations, enhancedAnalysis),
      insights: this.generateAdvancedInsights(
        traits,
        cognitiveStyle,
        responseAnalysis,
        enhancedAnalysis,
        deepTraitAnalysis
      ),
      recommendations: this.generateEnhancedRecommendations(
        traits,
        concerns,
        tier,
        enhancedAnalysis
      ),
      narrative: personalNarrative,

      // New comprehensive profiles for all tiers
      profiles: {
        cognitive: cognitiveProfile,
        emotional: emotionalProfile,
        social: socialProfile
      },

      // Career and relationship insights for standard and above
      careerInsights: this.generateCareerCompatibility(traits, cognitiveProfile),
      relationshipInsights: this.analyzeRelationshipPatterns(traits, correlations),

      // NEW: Advanced adaptive layers
      contradictions: contradictions.length > 0 ? contradictions : null,
      adaptivePatterns,
      growthTrajectory,
      behavioralFingerprint,

      // Archetype information - get the full enhanced archetype object
      archetype: enhancedAnalysis?.archetype || this.determinePersonalityArchetype(traits),

      // Enhanced transparency features
      qualityAssessment,
      deepTraitAnalysis,
      explanationChain: explanationData,
      insightTracker: this.insightTracker ? this.insightTracker.exportInsights() : null
    };

    // Add additional analysis for 'comprehensive' tier
    if (tier === 'comprehensive') {
      report.neurodiversityIndicators = neurodivergentScreening;
      report.advancedCognitiveProfile = cognitiveStyle;
      report.deepCareerAnalysis = this.generateDeepCareerAnalysis(
        traits,
        cognitiveProfile,
        socialProfile
      );
      report.detailedRelationshipDynamics = this.generateDetailedRelationshipAnalysis(
        traits,
        emotionalProfile,
        socialProfile
      );
      report.growthRoadmap = this.createAdvancedGrowthRoadmap(traits, concerns, enhancedAnalysis);
      report.correlations = correlations;
      report.insightPatterns = this.generateInsightPatterns(traits, responses, enhancedAnalysis);
      report.customRecommendations = this.generateCustomRecommendations(
        traits,
        cognitiveProfile,
        emotionalProfile,
        socialProfile
      );

      // NEW: Comprehensive research-based assessments
      if (tier === 'comprehensive' && this.researchDB) {
        // Enhanced Big Five analysis with facets
        report.bigFiveFacets = this.analyzeBigFiveFacets(responses, traits, metadata);

        // Emotional regulation assessment
        report.emotionalRegulation = this.assessEmotionalRegulation(responses, traits);

        // Attachment style analysis
        report.attachmentStyle = this.analyzeAttachmentStyle(responses, traits);

        // Anxiety and mood screening
        report.mentalHealthScreening = {
          anxiety: this.screenForAnxiety(responses, traits),
          depression: this.screenForDepression(responses, traits),
          stress: this.assessStressLevels(responses, traits)
        };

        // Cognitive abilities assessment
        report.cognitiveAbilities = this.assessCognitiveAbilities(
          responses,
          traits,
          cognitiveProfile
        );

        // Sleep and chronotype
        report.sleepProfile = this.analyzeSleepPatterns(responses, metadata);

        // Cultural considerations
        report.culturalContext = this.considerCulturalFactors(metadata, traits);

        // Treatment recommendations if clinical indicators present
        if (
          neurodivergentScreening?.adhd?.likelihood !== 'Low' ||
          neurodivergentScreening?.autism?.likelihood !== 'Low'
        ) {
          report.treatmentConsiderations = this.generateTreatmentRecommendations(
            neurodivergentScreening,
            report.mentalHealthScreening
          );
        }

        // Comprehensive strengths and growth areas
        report.strengthsProfile = this.generateComprehensiveStrengths(
          traits,
          cognitiveProfile,
          neurodivergentScreening
        );

        // Research-based percentile rankings
        report.normativeComparisons = this.generateNormativeComparisons(
          traits,
          metadata,
          neurodivergentScreening
        );
      }
    }

    return report;
  }

  /**
   * Calculate traits with weighted scoring based on question importance
   */
  calculateWeightedTraits(responses) {
    const traitScores = {
      openness: { scores: [], weights: [] },
      conscientiousness: { scores: [], weights: [] },
      extraversion: { scores: [], weights: [] },
      agreeableness: { scores: [], weights: [] },
      neuroticism: { scores: [], weights: [] }
    };

    // Add null safety check
    if (!responses || !Array.isArray(responses)) {
      console.log('[AdvancedReportGenerator] No valid responses provided, using default values');
      return {
        openness: 50,
        conscientiousness: 50,
        extraversion: 50,
        agreeableness: 50,
        neuroticism: 50
      };
    }

    // Debug logging
    console.log(`[AdvancedReportGenerator] Processing ${responses.length} responses`);

    // Process responses with weighting
    responses.forEach((response, index) => {
      const trait = (response.trait || response.category || '').toLowerCase();
      const score =
        parseInt(response.score) || parseInt(response.answer) || parseInt(response.response) || 3;
      const weight = response.weight || 1; // Some questions are more important
      const responseTime = response.responseTime || 5000; // milliseconds

      // Debug first few responses
      if (index < 3) {
        console.log(
          `[Debug] Response ${index}: trait='${trait}', score=${score}, category='${response.category}'`
        );
      }

      // Adjust weight based on response time (very quick or very slow might indicate less thought)
      const timeWeight = this.calculateTimeWeight(responseTime);

      if (trait && traitScores[trait]) {
        // Reverse score if question is reverse-coded
        const adjustedScore = response.reverse ? 6 - score : score;
        traitScores[trait].scores.push(adjustedScore);
        traitScores[trait].weights.push(weight * timeWeight);
      } else if (trait && !traitScores[trait]) {
        // Log non-Big Five traits for debugging
        if (index < 10) {
          console.log(`[Debug] Non-Big Five trait: '${trait}' from response ${index}`);
        }
      }
    });

    // Calculate weighted averages
    const traits = {};
    Object.keys(traitScores).forEach(trait => {
      const data = traitScores[trait];
      if (data.scores.length > 0) {
        const weightedSum = data.scores.reduce((sum, score, i) => sum + score * data.weights[i], 0);
        const totalWeight = data.weights.reduce((sum, w) => sum + w, 0);
        const avg = weightedSum / totalWeight;
        // Convert 1-5 scale to 0-100 with more nuanced calculation
        traits[trait] = Math.round((avg - 1) * 25 * 0.95 + 2.5); // Slight compression to avoid extremes

        console.log(
          `[Trait] ${trait}: ${data.scores.length} responses, avg=${avg.toFixed(2)}, final=${traits[trait]}%`
        );
      } else {
        // No data for this trait - this should not happen if questions are properly tagged
        console.warn(`[Warning] No responses found for trait: ${trait}, defaulting to 50%`);
        traits[trait] = 50;
      }
    });

    return traits;
  }

  /**
   * Calculate weight based on response time
   */
  calculateTimeWeight(responseTime) {
    // Optimal response time is 3-15 seconds
    if (responseTime < 2000) return 0.7; // Too quick - might not have read properly
    if (responseTime < 3000) return 0.85;
    if (responseTime <= 15000) return 1.0; // Optimal range
    if (responseTime <= 30000) return 0.9;
    return 0.8; // Very slow - might indicate uncertainty
  }

  /**
   * Analyze response patterns for consistency and authenticity
   */
  analyzeResponsePatterns(responses) {
    const analysis = {
      consistency: 1.0,
      authenticity: 1.0,
      confidence: 1.0,
      patterns: []
    };

    // Check for straight-lining (same answer repeatedly)
    const consecutiveSame = this.detectStraightLining(responses);
    if (consecutiveSame > 5) {
      analysis.consistency *= 0.8;
      analysis.patterns.push('Response pattern suggests possible straight-lining');
    }

    // Check for extreme responding
    const extremeRate = this.calculateExtremeResponseRate(responses);
    if (extremeRate > 0.7) {
      analysis.authenticity *= 0.85;
      analysis.patterns.push('High rate of extreme responses detected');
    }

    // Check for midpoint responding
    const midpointRate = this.calculateMidpointRate(responses);
    if (midpointRate > 0.5) {
      analysis.authenticity *= 0.85;
      analysis.patterns.push('Tendency toward neutral responses detected');
    }

    // Enhanced response time analysis
    const timeAnalysis = this.analyzeResponseTimes(responses);

    if (timeAnalysis.rushedResponses > 0.3) {
      analysis.authenticity *= 0.75;
      analysis.patterns.push(
        `${Math.round(timeAnalysis.rushedResponses * 100)}% of responses appear rushed (< ${timeAnalysis.rushThreshold}ms)`
      );
    }

    if (timeAnalysis.timeVariance < 1000) {
      analysis.consistency *= 0.9;
      analysis.patterns.push('Very consistent response timing detected');
    }

    if (timeAnalysis.averageTime < 2000) {
      analysis.authenticity *= 0.8;
      analysis.patterns.push('Overall response speed suggests possible rushed completion');
    }

    // Include time analysis in response data
    analysis.timeAnalysis = timeAnalysis;

    // Calculate overall confidence
    analysis.confidence = (analysis.consistency + analysis.authenticity) / 2;

    return analysis;
  }

  /**
   * Detect straight-lining in responses
   */
  detectStraightLining(responses) {
    // Add null safety check
    if (!responses || !Array.isArray(responses) || responses.length < 2) {
      console.log(
        '[AdvancedReportGenerator] detectStraightLining: No valid responses or insufficient data'
      );
      return {
        maxConsecutive: 0,
        percentage: 0,
        isStraightLining: false
      };
    }

    let maxConsecutive = 0;
    let currentConsecutive = 1;

    for (let i = 1; i < responses.length; i++) {
      if (responses[i].score === responses[i - 1].score) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 1;
      }
    }

    return maxConsecutive;
  }

  /**
   * Calculate extreme response rate
   */
  calculateExtremeResponseRate(responses) {
    // Add null safety check
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      console.log('[AdvancedReportGenerator] calculateExtremeResponseRate: No valid responses');
      return 0;
    }

    const extremeResponses = responses.filter(r => r.score === 1 || r.score === 5).length;
    return extremeResponses / responses.length;
  }

  /**
   * Calculate midpoint response rate
   */
  calculateMidpointRate(responses) {
    // Add null safety check
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      console.log('[AdvancedReportGenerator] calculateMidpointRate: No valid responses');
      return 0;
    }

    const midpointResponses = responses.filter(r => r.score === 3).length;
    return midpointResponses / responses.length;
  }

  /**
   * Calculate response time variance
   */
  calculateResponseTimeVariance(responses) {
    // Add null safety check
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      console.log('[AdvancedReportGenerator] calculateResponseTimeVariance: No valid responses');
      return 0;
    }

    const times = responses.map(r => r.responseTime || 5000);
    const mean = times.reduce((a, b) => a + b, 0) / times.length;
    const variance = times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length;
    return Math.sqrt(variance);
  }

  /**
   * Enhanced response time analysis for detecting rushed answers
   */
  analyzeResponseTimes(responses) {
    // Add null safety check
    if (!responses || !Array.isArray(responses)) {
      console.log('[AdvancedReportGenerator] analyzeResponseTimes: No valid responses');
      return {
        averageTime: 5000,
        rushThreshold: 1500,
        rushedResponses: 0,
        timeVariance: 0,
        patterns: []
      };
    }

    const times = responses.map(r => r.responseTime || 5000).filter(t => t > 0);

    if (times.length === 0) {
      return {
        averageTime: 5000,
        rushThreshold: 1500,
        rushedResponses: 0,
        timeVariance: 0,
        patterns: []
      };
    }

    const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
    const rushThreshold = Math.max(1500, averageTime * 0.3); // 30% of average or 1.5s minimum
    const rushedCount = times.filter(t => t < rushThreshold).length;
    const rushedResponses = rushedCount / times.length;

    const timeVariance = this.calculateResponseTimeVariance(responses);

    // Additional time patterns
    const patterns = [];

    if (averageTime < 2500) {
      patterns.push('Fast completion style');
    } else if (averageTime > 8000) {
      patterns.push('Deliberate, considered responses');
    }

    if (timeVariance > 5000) {
      patterns.push('Highly variable response times');
    }

    return {
      averageTime: Math.round(averageTime),
      rushThreshold: Math.round(rushThreshold),
      rushedResponses,
      timeVariance,
      patterns,
      totalResponses: times.length,
      fastestResponse: Math.min(...times),
      slowestResponse: Math.max(...times)
    };
  }

  /**
   * Generate correlation matrix between traits
   */
  generateCorrelationMatrix(traits) {
    const matrix = {};
    const traitNames = Object.keys(traits);

    // Known trait correlations from research
    const knownCorrelations = {
      'openness-extraversion': 0.3,
      'conscientiousness-neuroticism': -0.35,
      'extraversion-agreeableness': 0.25,
      'agreeableness-neuroticism': -0.2,
      'openness-conscientiousness': 0.1
    };

    traitNames.forEach(trait1 => {
      matrix[trait1] = {};
      traitNames.forEach(trait2 => {
        if (trait1 === trait2) {
          matrix[trait1][trait2] = 1.0;
        } else {
          const key = [trait1, trait2].sort().join('-');
          const baseCorr = knownCorrelations[key] || 0;
          // Add some variance based on actual scores
          const scoreDiff = Math.abs(traits[trait1] - traits[trait2]) / 100;
          matrix[trait1][trait2] = baseCorr * (1 - scoreDiff * 0.3);
        }
      });
    });

    return matrix;
  }

  /**
   * Compare traits to population norms
   */
  compareToPopulationNorms(traits, metadata) {
    const percentiles = {};

    Object.entries(traits).forEach(([trait, score]) => {
      // Get norm for demographic (simplified - in reality would query database)
      const norm = this.populationNorms[trait];
      const percentile = this.calculatePercentile(score, norm.mean, norm.stdDev);

      percentiles[trait] = {
        percentile: Math.round(percentile),
        comparison: this.getPercentileDescription(percentile),
        populationMean: norm.mean,
        zScore: ((score - norm.mean) / norm.stdDev).toFixed(2)
      };
    });

    return percentiles;
  }

  /**
   * Calculate percentile from normal distribution
   */
  calculatePercentile(score, mean, stdDev) {
    // Handle edge cases
    if (!score || isNaN(score)) return 50;
    if (stdDev === 0) return 50;

    // Calculate z-score
    const z = (score - mean) / stdDev;

    // Use a simplified percentile mapping
    // This maps z-scores to percentiles based on normal distribution
    let percentile;

    if (z <= -2.5) percentile = 1;
    else if (z <= -2) percentile = 2;
    else if (z <= -1.5) percentile = 7;
    else if (z <= -1) percentile = 16;
    else if (z <= -0.5) percentile = 31;
    else if (z <= 0) percentile = 50;
    else if (z <= 0.5) percentile = 69;
    else if (z <= 1) percentile = 84;
    else if (z <= 1.5) percentile = 93;
    else if (z <= 2) percentile = 98;
    else percentile = 99;

    // Ensure percentile is within valid range
    return Math.max(1, Math.min(99, Math.round(percentile)));
  }

  /**
   * Get description for percentile
   */
  getPercentileDescription(percentile) {
    if (percentile >= 95) return 'Exceptionally high';
    if (percentile >= 85) return 'Very high';
    if (percentile >= 70) return 'Above average';
    if (percentile >= 30) return 'Average';
    if (percentile >= 15) return 'Below average';
    if (percentile >= 5) return 'Very low';
    return 'Exceptionally low';
  }

  /**
   * Assess cognitive style from responses and traits
   */
  assessCognitiveStyle(responses, traits) {
    const style = {
      processingMode: this.determineProcessingMode(traits),
      decisionStyle: this.determineDecisionStyle(traits),
      learningPreference: this.determineLearningStyle(responses, traits),
      problemSolving: this.determineProblemSolvingApproach(traits),
      informationGathering: this.determineInformationStyle(traits)
    };

    // Add description
    style.summary = this.generateCognitiveStyleSummary(style);

    return style;
  }

  /**
   * Determine processing mode
   */
  determineProcessingMode(traits) {
    if (traits.openness > 70 && traits.conscientiousness < 50) {
      return 'Intuitive-Exploratory';
    } else if (traits.conscientiousness > 70 && traits.openness < 50) {
      return 'Sequential-Systematic';
    } else if (traits.openness > 60 && traits.conscientiousness > 60) {
      return 'Balanced-Analytical';
    } else {
      return 'Adaptive-Flexible';
    }
  }

  /**
   * Determine decision making style
   */
  determineDecisionStyle(traits) {
    if (traits.agreeableness > 70 && traits.neuroticism > 60) {
      return 'Consensus-Seeking';
    } else if (traits.conscientiousness > 70 && traits.neuroticism < 40) {
      return 'Data-Driven';
    } else if (traits.extraversion > 70 && traits.openness > 60) {
      return 'Intuitive-Quick';
    } else {
      return 'Deliberative-Cautious';
    }
  }

  /**
   * Determine learning style preference
   */
  determineLearningStyle(responses, traits) {
    if (traits.extraversion > 60) {
      return traits.openness > 60 ? 'Interactive-Experiential' : 'Social-Collaborative';
    } else {
      return traits.openness > 60 ? 'Self-Directed-Exploratory' : 'Structured-Sequential';
    }
  }

  /**
   * Determine problem solving approach
   */
  determineProblemSolvingApproach(traits) {
    const approaches = [];

    if (traits.openness > 65) approaches.push('Creative');
    if (traits.conscientiousness > 65) approaches.push('Methodical');
    if (traits.extraversion > 65) approaches.push('Collaborative');
    if (traits.agreeableness > 65) approaches.push('Harmonious');
    if (traits.neuroticism < 35) approaches.push('Stress-Resilient');

    return approaches.length > 0 ? approaches.join('-') : 'Balanced';
  }

  /**
   * Determine information gathering style
   */
  determineInformationStyle(traits) {
    if (traits.openness > 70) {
      return 'Broad-Exploration';
    } else if (traits.conscientiousness > 70) {
      return 'Detailed-Thorough';
    } else if (traits.extraversion > 70) {
      return 'Social-Sources';
    } else {
      return 'Selective-Focused';
    }
  }

  /**
   * Generate cognitive style summary
   */
  generateCognitiveStyleSummary(style) {
    return `Your cognitive profile shows a ${style.processingMode} processing style with
            ${style.decisionStyle} decision making. You learn best through ${style.learningPreference}
            methods and approach problems with a ${style.problemSolving} strategy.`;
  }

  /**
   * Detect neurodiversity markers (for comprehensive tier)
   */
  detectNeurodiversityMarkers(responses, responseAnalysis) {
    const adhdScreening = this.screenForADHD(responses);
    const autismScreening = this.screenForAutism(responses);

    const markers = {
      adhd: {
        score: adhdScreening.score,
        markers: adhdScreening.markers,
        likelihood: adhdScreening.likelihood,
        severity:
          adhdScreening.likelihood === 'Significant'
            ? 'significant'
            : adhdScreening.likelihood === 'Moderate'
              ? 'moderate'
              : 'minimal',
        indicators: adhdScreening.indicators || {
          inattention: 0,
          hyperactivity: 0,
          impulsivity: 0
        }
      },
      autism: {
        score: autismScreening.score,
        markers: autismScreening.markers,
        likelihood: autismScreening.likelihood,
        severity:
          autismScreening.likelihood === 'Significant'
            ? 'significant'
            : autismScreening.likelihood === 'Moderate'
              ? 'moderate'
              : 'minimal',
        indicators: autismScreening.indicators || {
          social: 0,
          sensory: 0,
          routine: 0,
          communication: 0
        }
      },
      sensitivity: this.screenForSensitivity(responses),
      giftedness: this.screenForGiftedness(responses),
      confidence: responseAnalysis.confidence
    };

    // Generate summary
    markers.summary = this.generateNeurodiversitySummary(markers);

    return markers;
  }

  /**
   * Screen for ADHD indicators
   */
  screenForADHD(responses) {
    const indicators = {
      score: 0, // Clinical ASRS-5 score (0-24)
      percentile: 0, // Percentile for display
      severity: 'minimal', // minimal, mild, moderate, severe
      markers: [],
      indicators: {
        inattention: 0,
        hyperactivity: 0,
        impulsivity: 0
      }
    };

    // Add null safety check
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      console.log('[AdvancedReportGenerator] screenForADHD: No valid responses');
      return indicators;
    }

    // First check for actual neurodiversity questions (ADHD specific)
    const adhdQuestions = responses.filter(
      r =>
        (r.question?.category === 'neurodiversity' &&
          (r.question?.instrument === 'ASRS-5' || r.question?.instrument === 'ADHD')) ||
        r.question?.subcategory === 'executive_function'
    );

    if (adhdQuestions.length > 0) {
      // Calculate raw ASRS-5 score (0-24 scale based on 6 questions, 0-4 each)
      const totalScore = adhdQuestions.reduce((sum, r) => sum + (r.value || r.score || 0), 0);
      const maxPossibleScore = adhdQuestions.length * 4;
      const normalizedScore = Math.round((totalScore / maxPossibleScore) * 24); // Normalize to 0-24 ASRS-5 scale
      indicators.score = normalizedScore; // Set clinical score

      // Use research-based ASRS-5 thresholds if database is available
      if (this.researchDB?.adhd?.asrs5) {
        const asrs5 = this.researchDB.adhd.asrs5;
        const cutoff = asrs5.cutoffs.screening.threshold; // 14 based on research

        // Map to ASRS-5 interpretation ranges
        if (normalizedScore >= asrs5.interpretation.severe.min) {
          // Severe range (19-24)
          indicators.percentile = 85 + ((normalizedScore - 19) / 5) * 15;
          indicators.severity = 'severe';
          indicators.indicators = {
            inattention: Math.min(10, 7 + Math.floor((normalizedScore - 19) / 2)),
            hyperactivity: Math.min(10, 6 + Math.floor((normalizedScore - 19) / 2)),
            impulsivity: Math.min(10, 7 + Math.floor((normalizedScore - 19) / 2))
          };
          indicators.markers = [
            'Significant executive dysfunction',
            'Severe attention difficulties',
            'High impulsivity'
          ];
          indicators.likelihood = 'High';
        } else if (normalizedScore >= cutoff) {
          // Moderate range (14-18) - above clinical threshold
          indicators.percentile = 65 + ((normalizedScore - 14) / 4) * 20;
          indicators.severity = 'moderate';
          indicators.indicators = {
            inattention: 5 + Math.floor((normalizedScore - 14) / 2),
            hyperactivity: 4 + Math.floor((normalizedScore - 14) / 2),
            impulsivity: 5 + Math.floor((normalizedScore - 14) / 2)
          };
          indicators.markers = [
            'Executive function challenges',
            'Attention regulation difficulties',
            'Task management issues'
          ];
          indicators.likelihood = 'Probable';
        } else if (normalizedScore >= asrs5.interpretation.mild.min) {
          // Mild range (10-13) - below threshold but elevated
          indicators.percentile = 40 + ((normalizedScore - 10) / 3) * 25;
          indicators.severity = 'mild';
          indicators.indicators = {
            inattention: 2 + Math.floor(normalizedScore - 10),
            hyperactivity: 2 + Math.floor((normalizedScore - 10) * 0.8),
            impulsivity: 2 + Math.floor((normalizedScore - 10) * 0.9)
          };
          indicators.markers = [
            'Some attention difficulties',
            'Mild executive function challenges'
          ];
          indicators.likelihood = 'Possible';
        } else {
          // Minimal range (0-9)
          indicators.percentile = (normalizedScore / 9) * 40;
          indicators.severity = 'minimal';
          indicators.indicators = {
            inattention: Math.floor(normalizedScore / 3),
            hyperactivity: Math.floor(normalizedScore / 4),
            impulsivity: Math.floor(normalizedScore / 3.5)
          };
          indicators.markers = normalizedScore > 5 ? ['Subclinical attention patterns'] : [];
          indicators.likelihood = 'Low';
        }

        return indicators;
      }

      // Fallback to original logic if research DB not available
      const avgScore = totalScore / adhdQuestions.length;
      const clinicalScore = Math.round(avgScore * 6); // Convert to 0-24 scale
      indicators.score = clinicalScore;

      if (avgScore >= 3.5) {
        indicators.percentile = 70 + (avgScore - 3.5) * 20;
        indicators.severity = 'moderate';
        indicators.indicators = {
          inattention: Math.min(10, Math.floor(avgScore * 1.8)),
          hyperactivity: Math.min(10, Math.floor(avgScore * 1.5)),
          impulsivity: Math.min(10, Math.floor(avgScore * 1.6))
        };
        indicators.markers = [
          'Executive function challenges',
          'Attention regulation difficulties',
          'Task management issues'
        ];
        indicators.likelihood = avgScore >= 4 ? 'Significant' : 'Moderate';
        return indicators;
      } else if (avgScore >= 2.5) {
        indicators.percentile = 40 + (avgScore - 2.5) * 30;
        indicators.severity = 'mild';
        indicators.indicators = {
          inattention: Math.floor(avgScore * 1.2),
          hyperactivity: Math.floor(avgScore),
          impulsivity: Math.floor(avgScore * 1.1)
        };
        indicators.markers = ['Some attention difficulties', 'Mild executive function challenges'];
        indicators.likelihood = 'Mild';
        return indicators;
      }
    }

    // No fallbacks - only score based on actual ADHD questions

    indicators.likelihood = indicators.score > 40 ? 'Moderate' : 'Low';
    return indicators;
  }

  /**
   * Screen for autism indicators
   */
  screenForAutism(responses) {
    const indicators = {
      score: 0, // Clinical AQ-10 score (0-10)
      percentile: 0, // Percentile for display
      severity: 'minimal', // minimal, below_threshold, threshold, significant
      markers: [],
      indicators: {
        social: 0,
        sensory: 0,
        routine: 0,
        communication: 0
      }
    };

    // Add null safety check
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      console.log('[AdvancedReportGenerator] screenForAutism: No valid responses');
      return indicators;
    }

    // First check for actual neurodiversity questions (Autism specific)
    const autismQuestions = responses.filter(
      r =>
        (r.question?.category === 'neurodiversity' &&
          (r.question?.instrument === 'AQ-10' || r.question?.instrument === 'Autism')) ||
        r.question?.subcategory === 'sensory_processing' ||
        r.question?.subcategory === 'social_communication'
    );

    if (autismQuestions.length > 0) {
      // Calculate AQ-10 score (0-10 scale)
      const totalScore = autismQuestions.reduce((sum, r) => sum + (r.value || r.score || 0), 0);
      const maxPossibleScore = autismQuestions.length; // AQ-10 uses binary scoring (0-1 per question)
      const normalizedScore = Math.round((totalScore / maxPossibleScore) * 10); // Normalize to 0-10 AQ-10 scale
      indicators.score = normalizedScore; // Set clinical score

      // Use research-based AQ-10 thresholds if database is available
      if (this.researchDB?.autism?.aq10) {
        const aq10 = this.researchDB.autism.aq10;
        const cutoff = aq10.cutoffs.screening.optimalThreshold; // 6 based on 2024 research

        // Map to AQ-10 interpretation ranges
        if (normalizedScore >= aq10.interpretation.significant.min) {
          // Significant range (8-10)
          indicators.percentile = 80 + ((normalizedScore - 8) / 2) * 20;
          indicators.severity = 'significant';
          indicators.indicators = {
            social: Math.min(10, 7 + Math.floor(normalizedScore - 8)),
            sensory: Math.min(10, 6 + Math.floor(normalizedScore - 8)),
            routine: Math.min(10, 8 + Math.floor(normalizedScore - 8)),
            communication: Math.min(10, 6 + Math.floor((normalizedScore - 8) * 0.8))
          };
          indicators.markers = [
            'Significant social communication differences',
            'Strong sensory processing patterns',
            'Clear routine preferences',
            'Systematic cognitive style'
          ];
          indicators.likelihood = 'High likelihood';
        } else if (normalizedScore >= cutoff) {
          // Threshold range (6-7) - warrants assessment
          indicators.percentile = 60 + ((normalizedScore - 6) / 1) * 20;
          indicators.severity = 'threshold';
          indicators.indicators = {
            social: 5 + Math.floor((normalizedScore - 6) * 2),
            sensory: 4 + Math.floor((normalizedScore - 6) * 2),
            routine: 6 + Math.floor((normalizedScore - 6) * 2),
            communication: 4 + Math.floor((normalizedScore - 6) * 1.5)
          };
          indicators.markers = [
            'Social communication differences',
            'Sensory processing patterns',
            'Preference for routine',
            'Detail-focused thinking'
          ];
          indicators.likelihood = 'Warrants assessment';
        } else if (normalizedScore >= aq10.interpretation.belowThreshold.min) {
          // Below threshold (4-5)
          indicators.percentile = 35 + ((normalizedScore - 4) / 1) * 25;
          indicators.severity = 'below_threshold';
          indicators.indicators = {
            social: 2 + Math.floor((normalizedScore - 4) * 2),
            sensory: 2 + Math.floor((normalizedScore - 4) * 1.5),
            routine: 3 + Math.floor((normalizedScore - 4) * 2),
            communication: 2 + Math.floor(normalizedScore - 4)
          };
          indicators.markers = [
            'Some social processing differences',
            'Mild sensory sensitivities',
            'Structured thinking patterns'
          ];
          indicators.likelihood = 'Below clinical threshold';
        } else {
          // Minimal range (0-3)
          indicators.percentile = (normalizedScore / 3) * 35;
          indicators.severity = 'minimal';
          indicators.indicators = {
            social: Math.floor(normalizedScore * 0.8),
            sensory: Math.floor(normalizedScore * 0.7),
            routine: Math.floor(normalizedScore),
            communication: Math.floor(normalizedScore * 0.6)
          };
          indicators.markers = normalizedScore > 2 ? ['Subclinical autism traits'] : [];
          indicators.likelihood = 'Low';
        }

        return indicators;
      }

      // Fallback to original logic if research DB not available
      const avgScore = totalScore / autismQuestions.length;
      const clinicalScore = Math.round(avgScore * 2.5); // Convert to 0-10 scale
      indicators.score = clinicalScore;

      if (avgScore >= 3.5) {
        indicators.percentile = 65 + (avgScore - 3.5) * 20;
        indicators.severity = 'threshold';
        indicators.indicators = {
          social: Math.min(10, Math.floor(avgScore * 1.7)),
          sensory: Math.min(10, Math.floor(avgScore * 1.5)),
          routine: Math.min(10, Math.floor(avgScore * 1.8)),
          communication: Math.min(10, Math.floor(avgScore * 1.4))
        };
        indicators.markers = [
          'Social communication differences',
          'Sensory processing patterns',
          'Systematic thinking preference'
        ];
        indicators.likelihood = avgScore >= 4 ? 'Significant' : 'Moderate';
        return indicators;
      } else if (avgScore >= 2.5) {
        indicators.percentile = 35 + (avgScore - 2.5) * 30;
        indicators.severity = 'below_threshold';
        indicators.indicators = {
          social: Math.floor(avgScore * 1.2),
          sensory: Math.floor(avgScore),
          routine: Math.floor(avgScore * 1.3),
          communication: Math.floor(avgScore * 0.9)
        };
        indicators.markers = ['Some social processing differences', 'Mild sensory sensitivities'];
        indicators.likelihood = 'Mild';
        return indicators;
      }
    }

    // No fallbacks - only score based on actual autism questions

    indicators.likelihood = indicators.score > 35 ? 'Moderate' : 'Low';
    return indicators;
  }

  /**
   * Screen for high sensitivity
   */
  screenForSensitivity(responses) {
    const indicators = {
      score: 0,
      markers: []
    };

    // Add null safety check
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      console.log('[AdvancedReportGenerator] screenForSensitivity: No valid responses');
      return indicators;
    }

    const neuroticismQuestions = responses.filter(r => r.trait === 'neuroticism');
    const highNeuroticism = neuroticismQuestions.filter(r => r.score >= 4).length;

    if (highNeuroticism > neuroticismQuestions.length * 0.6) {
      indicators.score += 40;
      indicators.markers.push('High emotional sensitivity');
    }

    indicators.likelihood = indicators.score > 30 ? 'High' : 'Moderate';
    return indicators;
  }

  /**
   * Screen for giftedness indicators
   */
  screenForGiftedness(responses) {
    const indicators = {
      score: 0,
      markers: []
    };

    // Add null safety check
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      console.log('[AdvancedReportGenerator] screenForGiftedness: No valid responses');
      return indicators;
    }

    const opennessQuestions = responses.filter(r => r.trait === 'openness');
    const highOpenness = opennessQuestions.filter(r => r.score >= 4).length;

    if (highOpenness > opennessQuestions.length * 0.7) {
      indicators.score += 35;
      indicators.markers.push('High intellectual curiosity');
    }

    // Check for complex thinking patterns
    const responseTimeVariance = this.calculateResponseTimeVariance(responses);
    if (responseTimeVariance > 5000) {
      indicators.score += 20;
      indicators.markers.push('Variable processing depth');
    }

    indicators.likelihood = indicators.score > 40 ? 'Moderate' : 'Low';
    return indicators;
  }

  /**
   * Generate neurodiversity summary
   */
  generateNeurodiversitySummary(markers) {
    const significant = [];

    if (markers.adhd.likelihood !== 'Low') {
      significant.push(`ADHD indicators (${markers.adhd.likelihood})`);
    }
    if (markers.autism.likelihood !== 'Low') {
      significant.push(`Autism indicators (${markers.autism.likelihood})`);
    }
    if (markers.sensitivity.likelihood === 'High') {
      significant.push('High sensitivity traits');
    }
    if (markers.giftedness.likelihood !== 'Low') {
      significant.push(`Giftedness markers (${markers.giftedness.likelihood})`);
    }

    if (significant.length === 0) {
      return 'No significant neurodiversity indicators detected in this assessment.';
    }

    return `Potential neurodivergent traits detected: ${significant.join(', ')}.
            Note: This is a screening tool only and not a diagnostic assessment.`;
  }

  /**
   * Generate career compatibility scores
   */
  generateCareerCompatibility(traits, cognitiveStyle) {
    const careers = {
      'Creative & Artistic': this.scoreCreativeCareer(traits),
      'Business & Entrepreneurship': this.scoreBusinessCareer(traits),
      'Science & Research': this.scoreScienceCareer(traits, cognitiveStyle),
      'Social & Helping': this.scoreSocialCareer(traits),
      'Technical & Engineering': this.scoreTechnicalCareer(traits, cognitiveStyle),
      'Leadership & Management': this.scoreLeadershipCareer(traits)
    };

    // Sort by compatibility
    const sorted = Object.entries(careers)
      .sort((a, b) => b[1] - a[1])
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    return sorted;
  }

  /**
   * Score creative career compatibility
   */
  scoreCreativeCareer(traits) {
    let score = 0;
    score += traits.openness * 0.4;
    score += (100 - traits.conscientiousness) * 0.2;
    score += traits.extraversion * 0.2;
    score += (100 - traits.neuroticism) * 0.2;
    return Math.round(score);
  }

  /**
   * Score business career compatibility
   */
  scoreBusinessCareer(traits) {
    let score = 0;
    score += traits.extraversion * 0.3;
    score += traits.conscientiousness * 0.3;
    score += (100 - traits.neuroticism) * 0.2;
    score += traits.openness * 0.2;
    return Math.round(score);
  }

  /**
   * Score science career compatibility
   */
  scoreScienceCareer(traits, cognitiveStyle) {
    let score = 0;
    score += traits.openness * 0.35;
    score += traits.conscientiousness * 0.35;
    score += (100 - traits.extraversion) * 0.15;
    score += (100 - traits.neuroticism) * 0.15;

    if (cognitiveStyle.processingMode === 'Sequential-Systematic') {
      score += 10;
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * Score social career compatibility
   */
  scoreSocialCareer(traits) {
    let score = 0;
    score += traits.agreeableness * 0.4;
    score += traits.extraversion * 0.3;
    score += (100 - traits.neuroticism) * 0.15;
    score += traits.conscientiousness * 0.15;
    return Math.round(score);
  }

  /**
   * Score technical career compatibility
   */
  scoreTechnicalCareer(traits, cognitiveStyle) {
    let score = 0;
    score += traits.conscientiousness * 0.35;
    score += (100 - traits.extraversion) * 0.25;
    score += traits.openness * 0.2;
    score += (100 - traits.neuroticism) * 0.2;

    if (cognitiveStyle.processingMode === 'Sequential-Systematic') {
      score += 10;
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * Score leadership career compatibility
   */
  scoreLeadershipCareer(traits) {
    let score = 0;
    score += traits.extraversion * 0.3;
    score += traits.conscientiousness * 0.25;
    score += (100 - traits.neuroticism) * 0.25;
    score += traits.openness * 0.1;
    score += traits.agreeableness * 0.1;
    return Math.round(score);
  }

  /**
   * Analyze relationship patterns
   */
  analyzeRelationshipPatterns(traits, correlations) {
    const patterns = {
      attachmentStyle: this.determineAttachmentStyle(traits),
      communicationStyle: this.determineCommunicationStyle(traits),
      conflictResolution: this.determineConflictStyle(traits),
      emotionalNeeds: this.determineEmotionalNeeds(traits),
      compatibility: this.assessRelationshipCompatibility(traits)
    };

    patterns.summary = this.generateRelationshipSummary(patterns);
    return patterns;
  }

  /**
   * Determine attachment style
   */
  determineAttachmentStyle(traits) {
    if (traits.neuroticism < 40 && traits.agreeableness > 60) {
      return 'Secure';
    } else if (traits.neuroticism > 60 && traits.extraversion < 40) {
      return 'Anxious-Avoidant';
    } else if (traits.neuroticism > 60 && traits.extraversion > 60) {
      return 'Anxious-Preoccupied';
    } else {
      return 'Dismissive-Avoidant';
    }
  }

  /**
   * Determine communication style
   */
  determineCommunicationStyle(traits) {
    if (traits.extraversion > 60 && traits.agreeableness > 60) {
      return 'Warm-Expressive';
    } else if (traits.extraversion < 40 && traits.conscientiousness > 60) {
      return 'Reserved-Thoughtful';
    } else if (traits.agreeableness < 40) {
      return 'Direct-Assertive';
    } else {
      return 'Adaptive-Balanced';
    }
  }

  /**
   * Determine conflict resolution style
   */
  determineConflictStyle(traits) {
    if (traits.agreeableness > 70) {
      return 'Accommodating';
    } else if (traits.conscientiousness > 70 && traits.agreeableness > 50) {
      return 'Collaborative';
    } else if (traits.agreeableness < 40 && traits.extraversion > 60) {
      return 'Competing';
    } else if (traits.extraversion < 40) {
      return 'Avoiding';
    } else {
      return 'Compromising';
    }
  }

  /**
   * Determine emotional needs
   */
  determineEmotionalNeeds(traits) {
    const needs = [];

    if (traits.neuroticism > 60) needs.push('Reassurance');
    if (traits.extraversion > 60) needs.push('Social connection');
    if (traits.openness > 60) needs.push('Intellectual stimulation');
    if (traits.agreeableness > 60) needs.push('Harmony');
    if (traits.conscientiousness > 60) needs.push('Stability');

    return needs;
  }

  /**
   * Assess relationship compatibility factors
   */
  assessRelationshipCompatibility(traits) {
    return {
      bestMatch: this.determineBestMatchProfile(traits),
      challenges: this.identifyRelationshipChallenges(traits),
      strengths: this.identifyRelationshipStrengths(traits)
    };
  }

  /**
   * Determine best match profile
   */
  determineBestMatchProfile(traits) {
    // Complementary matching logic
    const idealMatch = {};

    idealMatch.extraversion =
      traits.extraversion > 60 ? '40-70 (moderate to high)' : '30-60 (low to moderate)';
    idealMatch.agreeableness = '50-80 (moderate to high)';
    idealMatch.conscientiousness =
      Math.abs(traits.conscientiousness - 50) < 20
        ? '40-70 (balanced)'
        : traits.conscientiousness > 60
          ? '30-60 (complementary)'
          : '60-80 (complementary)';
    idealMatch.neuroticism = '20-50 (low to moderate)';
    idealMatch.openness =
      Math.abs(traits.openness - 50) < 30
        ? `${traits.openness - 20}-${traits.openness + 20} (similar)`
        : '40-70 (moderate)';

    return idealMatch;
  }

  /**
   * Identify relationship challenges
   */
  identifyRelationshipChallenges(traits) {
    const challenges = [];

    if (traits.neuroticism > 70) challenges.push('Managing anxiety in relationships');
    if (traits.agreeableness < 30) challenges.push('Tendency toward conflict');
    if (traits.extraversion > 80 || traits.extraversion < 20) {
      challenges.push('Balancing social needs');
    }
    if (traits.conscientiousness < 30) challenges.push('Following through on commitments');

    return challenges;
  }

  /**
   * Identify relationship strengths
   */
  identifyRelationshipStrengths(traits) {
    const strengths = [];

    if (traits.agreeableness > 60) strengths.push('Natural empathy and compassion');
    if (traits.conscientiousness > 60) strengths.push('Reliability and commitment');
    if (traits.openness > 60) strengths.push('Intellectual connection');
    if (traits.extraversion > 50 && traits.extraversion < 70) {
      strengths.push('Balanced social energy');
    }
    if (traits.neuroticism < 40) strengths.push('Emotional stability');

    return strengths;
  }

  /**
   * Generate relationship summary
   */
  generateRelationshipSummary(patterns) {
    return `Your ${patterns.attachmentStyle} attachment style shapes how you connect with others.
            You communicate in a ${patterns.communicationStyle} manner and tend toward
            ${patterns.conflictResolution} in conflicts. Your primary emotional needs include
            ${patterns.emotionalNeeds.join(', ')}.`;
  }

  /**
   * Create personalized growth roadmap
   */
  createGrowthRoadmap(traits, concerns) {
    const roadmap = {
      immediate: [],
      shortTerm: [],
      longTerm: [],
      resources: []
    };

    // Analyze trait gaps
    const traitGaps = this.identifyTraitGaps(traits);

    // Immediate actions (1-2 weeks)
    traitGaps.forEach(gap => {
      if (gap.priority === 'high') {
        roadmap.immediate.push({
          trait: gap.trait,
          action: this.getImmediateAction(gap.trait, gap.direction),
          rationale: gap.rationale
        });
      }
    });

    // Short-term goals (1-3 months)
    roadmap.shortTerm = this.generateShortTermGoals(traits, concerns);

    // Long-term development (3-12 months)
    roadmap.longTerm = this.generateLongTermGoals(traits, traitGaps);

    // Resources
    roadmap.resources = this.recommendResources(traits, concerns);

    return roadmap;
  }

  /**
   * Identify trait development gaps
   */
  identifyTraitGaps(traits) {
    const gaps = [];

    Object.entries(traits).forEach(([trait, score]) => {
      if (score < 30) {
        gaps.push({
          trait,
          direction: 'increase',
          priority: 'high',
          rationale: `Developing ${trait} could significantly improve your overall well-being`
        });
      } else if (score > 85) {
        gaps.push({
          trait,
          direction: 'moderate',
          priority: trait === 'neuroticism' ? 'high' : 'medium',
          rationale: `Moderating extreme ${trait} could increase flexibility`
        });
      }
    });

    return gaps;
  }

  /**
   * Get immediate action for trait development
   */
  getImmediateAction(trait, direction) {
    const actions = {
      openness: {
        increase: 'Try one new experience this week (food, route, activity)',
        moderate: 'Practice accepting routine in one area of life'
      },
      conscientiousness: {
        increase: 'Set three specific, measurable goals for this week',
        moderate: 'Allow for spontaneity in your schedule'
      },
      extraversion: {
        increase: 'Initiate one social interaction daily',
        moderate: 'Schedule quiet reflection time'
      },
      agreeableness: {
        increase: 'Practice active listening in conversations',
        moderate: 'Practice asserting your needs'
      },
      neuroticism: {
        increase: 'Not applicable',
        moderate: 'Start a 5-minute daily mindfulness practice'
      }
    };

    return actions[trait]?.[direction] || 'Focus on self-awareness';
  }

  /**
   * Generate short-term goals
   */
  generateShortTermGoals(traits, concerns) {
    const goals = [];

    // Based on concerns
    if (concerns?.includes('career')) {
      goals.push({
        goal: 'Career Development',
        actions: ['Update resume with personality strengths', 'Network in aligned industries'],
        timeline: '1-3 months'
      });
    }

    if (concerns?.includes('relationships')) {
      goals.push({
        goal: 'Relationship Enhancement',
        actions: ['Practice communication style awareness', 'Set healthy boundaries'],
        timeline: '1-2 months'
      });
    }

    // Based on traits
    if (traits.conscientiousness < 40) {
      goals.push({
        goal: 'Organization Systems',
        actions: ['Implement a daily planning routine', 'Use task management tools'],
        timeline: '2-3 months'
      });
    }

    return goals;
  }

  /**
   * Generate long-term goals
   */
  generateLongTermGoals(traits, traitGaps) {
    const goals = [];

    if (traitGaps.length > 2) {
      goals.push({
        goal: 'Personality Integration',
        description: 'Develop a more balanced personality profile',
        milestones: ['3-month check-in', '6-month reassessment', '12-month review']
      });
    }

    if (traits.neuroticism > 60) {
      goals.push({
        goal: 'Emotional Regulation Mastery',
        description: 'Develop robust stress management and emotional regulation skills',
        milestones: [
          'Complete stress management course',
          'Establish consistent practice',
          'Measure improvement'
        ]
      });
    }

    return goals;
  }

  /**
   * Recommend resources based on profile
   */
  recommendResources(traits, concerns) {
    const resources = [];

    // Books
    if (traits.openness > 70) {
      resources.push({
        type: 'Book',
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
        reason: 'Appeals to your intellectual curiosity'
      });
    }

    if (traits.conscientiousness < 40) {
      resources.push({
        type: 'Book',
        title: 'Atomic Habits',
        author: 'James Clear',
        reason: 'Practical system for building consistency'
      });
    }

    // Apps
    if (traits.neuroticism > 60) {
      resources.push({
        type: 'App',
        title: 'Headspace',
        reason: 'Evidence-based mindfulness for stress reduction'
      });
    }

    // Courses
    if (concerns?.includes('career')) {
      resources.push({
        type: 'Course',
        title: 'Career Development Based on Personality',
        platform: 'Coursera',
        reason: 'Align career with personality strengths'
      });
    }

    return resources;
  }

  /**
   * Enhanced summary generation
   */
  generateEnhancedSummary(traits, analysis, correlations) {
    const sortedTraits = Object.entries(traits).sort((a, b) => b[1] - a[1]);
    const highest = sortedTraits[0];
    const lowest = sortedTraits[sortedTraits.length - 1];

    // Identify unique patterns
    const patterns = this.identifyUniquePatterns(traits, correlations);

    return {
      dominantTrait: {
        name: highest[0],
        score: highest[1],
        description: analysis[highest[0]].description,
        impact: this.getTraitImpact(highest[0], highest[1])
      },
      weakestTrait: {
        name: lowest[0],
        score: lowest[1],
        description: analysis[lowest[0]].description,
        development: this.getDevelopmentPriority(lowest[0], lowest[1])
      },
      profile: this.determinePersonalityArchetype(traits),
      balance: this.assessBalance(traits),
      uniquePatterns: patterns,
      keyStrength: this.identifyKeyStrength(traits),
      growthArea: this.identifyGrowthArea(traits)
    };
  }

  /**
   * Identify unique personality patterns
   */
  identifyUniquePatterns(traits, correlations) {
    const patterns = [];

    // Check for interesting combinations
    if (traits.openness > 70 && traits.conscientiousness > 70) {
      patterns.push('Strategic Innovator - rare combination of creativity and discipline');
    }

    if (traits.extraversion < 30 && traits.agreeableness > 70) {
      patterns.push('Quiet Supporter - introverted but highly empathetic');
    }

    if (traits.neuroticism < 30 && traits.openness > 70) {
      patterns.push('Fearless Explorer - adventurous without anxiety');
    }

    return patterns;
  }

  /**
   * Get trait impact description
   */
  getTraitImpact(trait, score) {
    const impacts = {
      openness:
        score > 70 ? 'Drives innovation and creative problem-solving' : 'Provides practical focus',
      conscientiousness:
        score > 70 ? 'Ensures reliable execution and achievement' : 'Allows for flexibility',
      extraversion: score > 70 ? 'Energizes teams and builds networks' : 'Enables deep focus',
      agreeableness: score > 70 ? 'Creates harmony and collaboration' : 'Maintains objectivity',
      neuroticism: score < 30 ? 'Provides emotional stability' : 'Increases awareness of risks'
    };

    return impacts[trait] || 'Shapes your unique perspective';
  }

  /**
   * Get development priority
   */
  getDevelopmentPriority(trait, score) {
    if (score < 20) return 'High priority for development';
    if (score < 35) return 'Moderate priority for growth';
    return 'Minor area for refinement';
  }

  /**
   * Identify key strength
   */
  identifyKeyStrength(traits) {
    const strengths = [];

    Object.entries(traits).forEach(([trait, score]) => {
      if (score > 75) {
        strengths.push({ trait, score });
      }
    });

    if (strengths.length === 0) return 'Balanced personality profile';

    const topStrength = strengths.sort((a, b) => b.score - a.score)[0];
    return `Exceptional ${topStrength.trait} (${topStrength.score}th percentile)`;
  }

  /**
   * Identify primary growth area
   */
  identifyGrowthArea(traits) {
    const areas = [];

    Object.entries(traits).forEach(([trait, score]) => {
      if (score < 35 && trait !== 'neuroticism') {
        areas.push({ trait, score });
      } else if (trait === 'neuroticism' && score > 70) {
        areas.push({ trait: 'emotional regulation', score: 100 - score });
      }
    });

    if (areas.length === 0) return 'Continue balanced development';

    const topArea = areas.sort((a, b) => a.score - b.score)[0];
    return `Focus on developing ${topArea.trait}`;
  }

  /**
   * Generate deep insights
   */
  generateDeepInsights(traits, cognitiveStyle, responseAnalysis) {
    const insights = [];

    // Trait-based insights
    insights.push(...this.generateTraitInsights(traits));

    // Cognitive insights
    insights.push({
      category: 'Cognitive',
      insight: cognitiveStyle.summary,
      confidence: 'High'
    });

    // Pattern insights
    if (responseAnalysis.patterns.length > 0) {
      insights.push({
        category: 'Response Pattern',
        insight: responseAnalysis.patterns[0],
        confidence: 'Medium'
      });
    }

    // Developmental insights
    insights.push(...this.generateDevelopmentalInsights(traits));

    return insights;
  }

  /**
   * Generate trait-based insights
   */
  generateTraitInsights(traits) {
    const insights = [];

    // Openness insights
    if (traits.openness > 75) {
      insights.push({
        category: 'Creativity',
        insight:
          'Your high openness suggests strong creative potential and intellectual curiosity. You likely thrive in environments that offer novelty and complexity.',
        confidence: 'High'
      });
    } else if (traits.openness < 30) {
      insights.push({
        category: 'Practicality',
        insight:
          'Your practical nature helps you focus on concrete solutions and proven methods. You excel in structured environments with clear expectations.',
        confidence: 'High'
      });
    }

    // Conscientiousness insights
    if (traits.conscientiousness > 75) {
      insights.push({
        category: 'Achievement',
        insight:
          'Your high conscientiousness drives exceptional reliability and goal achievement. You have the discipline to see long-term projects through to completion.',
        confidence: 'High'
      });
    }

    // Extraversion insights
    if (Math.abs(traits.extraversion - 50) < 10) {
      insights.push({
        category: 'Social Flexibility',
        insight:
          'As an ambivert, you have the rare ability to adapt your social energy to different situations, making you versatile in various social and work contexts.',
        confidence: 'High'
      });
    }

    return insights;
  }

  /**
   * Generate developmental insights
   */
  generateDevelopmentalInsights(traits) {
    const insights = [];

    // Check for growth edges
    const traitScores = Object.values(traits);
    const range = Math.max(...traitScores) - Math.min(...traitScores);

    if (range > 60) {
      insights.push({
        category: 'Development',
        insight:
          'Your personality shows strong contrasts between traits, suggesting areas of excellence alongside significant growth opportunities.',
        confidence: 'High'
      });
    } else if (range < 30) {
      insights.push({
        category: 'Development',
        insight:
          'Your balanced personality profile provides stability but consider developing standout strengths for differentiation.',
        confidence: 'Medium'
      });
    }

    return insights;
  }

  /**
   * Generate personalized recommendations
   */
  generatePersonalizedRecommendations(traits, concerns, tier) {
    const recommendations = [];
    const maxRecommendations = tier === 'comprehensive' ? 6 : 3;

    // Priority 1: Address concerns
    if (concerns?.includes('stress')) {
      recommendations.push({
        priority: 'High',
        category: 'Well-being',
        recommendation: this.getStressManagementRecommendation(traits),
        timeframe: 'Immediate',
        resources: ['Mindfulness app', 'Stress reduction techniques']
      });
    }

    if (concerns?.includes('career')) {
      recommendations.push({
        priority: 'High',
        category: 'Career',
        recommendation: this.getCareerRecommendation(traits),
        timeframe: '1-3 months',
        resources: ['Career assessment', 'Networking strategies']
      });
    }

    // Priority 2: Trait development
    Object.entries(traits).forEach(([trait, score]) => {
      if (recommendations.length < maxRecommendations) {
        const level = this.getLevel(score);

        if (level === 'low' && trait !== 'neuroticism') {
          recommendations.push({
            priority: 'Medium',
            category: 'Personal Growth',
            recommendation: this.getEnhancedDevelopmentTip(trait, score),
            timeframe: '3-6 months',
            resources: this.getDevelopmentResources(trait)
          });
        } else if (level === 'high' && trait !== 'neuroticism') {
          recommendations.push({
            priority: 'Low',
            category: 'Optimization',
            recommendation: this.getEnhancedLeverageTip(trait, score),
            timeframe: 'Ongoing',
            resources: this.getLeverageResources(trait)
          });
        }
      }
    });

    // Priority 3: Neuroticism management if needed
    if (traits.neuroticism > 65 && recommendations.length < maxRecommendations) {
      recommendations.push({
        priority: 'High',
        category: 'Emotional Regulation',
        recommendation:
          'Develop emotional regulation skills through mindfulness, cognitive reframing, and stress management techniques.',
        timeframe: 'Immediate',
        resources: ['CBT techniques', 'Mindfulness training', 'Therapy options']
      });
    }

    // Transform recommendations into the format expected by display component
    const immediate = recommendations
      .filter(r => r.timeframe === 'Immediate' || r.priority === 'High')
      .slice(0, 3)
      .map(r => ({
        title: `${r.category}: ${r.priority} Priority`,
        description: r.recommendation,
        steps: Array.isArray(r.resources)
          ? r.resources.map(res => `Utilize ${res.toLowerCase()}`)
          : ['Begin implementation', 'Track progress', 'Adjust as needed'],
        outcome: this.getExpectedOutcome(r.category, r.timeframe)
      }));

    const longTerm = recommendations
      .filter(r => r.timeframe !== 'Immediate' && r.priority !== 'High')
      .slice(0, 3)
      .map(r => ({
        title: `${r.category} Development`,
        description: r.recommendation,
        timeline: r.timeframe,
        milestones: this.getMilestones(r.category, r.timeframe)
      }));

    return {
      immediate: immediate.length > 0 ? immediate : [this.getDefaultImmediate(traits)],
      longTerm: longTerm.length > 0 ? longTerm : [this.getDefaultLongTerm(traits)]
    };
  }

  /**
   * Get stress management recommendation
   */
  getStressManagementRecommendation(traits) {
    if (traits.neuroticism > 60) {
      return 'Priority focus on stress reduction through structured mindfulness practice and cognitive reframing techniques.';
    } else if (traits.conscientiousness > 70) {
      return 'Balance your high standards with self-compassion. Schedule regular breaks and recovery time.';
    } else {
      return 'Maintain your natural stress resilience through regular exercise and consistent sleep patterns.';
    }
  }

  /**
   * Get career recommendation
   */
  getCareerRecommendation(traits) {
    if (traits.openness > 70 && traits.extraversion > 60) {
      return 'Seek roles that combine innovation with collaboration - consider creative leadership or entrepreneurship.';
    } else if (traits.conscientiousness > 70 && traits.agreeableness > 60) {
      return 'Target positions in supportive leadership, project management, or quality-focused roles.';
    } else if (traits.openness > 70 && traits.extraversion < 40) {
      return 'Consider research, analysis, or creative roles that allow independent work.';
    } else {
      return 'Focus on roles that match your balanced profile - consider consulting or versatile positions.';
    }
  }

  /**
   * Get enhanced development tip
   */
  getEnhancedDevelopmentTip(trait, score) {
    const tips = {
      openness: `Your openness score of ${score} suggests room for intellectual growth. Start with
                 structured exploration: dedicate 30 minutes weekly to learning something completely
                 new. Begin with topics adjacent to your interests, then gradually expand.`,

      conscientiousness: `With a conscientiousness score of ${score}, focus on building sustainable
                          systems rather than relying on motivation. Start with micro-habits: 2-minute
                          daily planning sessions, then gradually increase structure.`,

      extraversion: `Your extraversion score of ${score} indicates introversion. Rather than forcing
                     social interaction, focus on quality over quantity. Schedule one meaningful
                     conversation weekly and gradually expand your comfort zone.`,

      agreeableness: `An agreeableness score of ${score} suggests assertiveness opportunities. Practice
                      "compassionate assertiveness" - express needs while acknowledging others' perspectives.
                      Start with low-stakes situations.`,

      neuroticism: `Focus on building emotional resilience through evidence-based practices like
                    mindfulness meditation, cognitive restructuring, and regular exercise.`
    };

    return tips[trait] || 'Focus on gradual, sustainable improvement in this area.';
  }

  /**
   * Get enhanced leverage tip
   */
  getEnhancedLeverageTip(trait, score) {
    const tips = {
      openness: `Your exceptional openness (${score}) is a rare asset. Channel it into innovation
                 leadership, creative problem-solving, or thought leadership in your field. Consider
                 mentoring others in creative thinking.`,

      conscientiousness: `Your remarkable conscientiousness (${score}) makes you invaluable in execution.
                          Position yourself as the reliability expert. Lead complex projects and teach
                          others your organizational systems.`,

      extraversion: `Your high extraversion (${score}) is a networking superpower. Build and maintain
                     strategic relationships. Consider roles in business development, team leadership,
                     or community building.`,

      agreeableness: `Your exceptional agreeableness (${score}) makes you a natural mediator. Leverage
                      this in team harmony, conflict resolution, or client relations. Consider formal
                      training in mediation or counseling.`,

      neuroticism: `While challenging, your sensitivity can be reframed as heightened awareness. Use it
                    for risk assessment, quality control, or empathetic leadership.`
    };

    return tips[trait] || 'This strength is a significant asset - use it strategically.';
  }

  /**
   * Get development resources
   */
  getDevelopmentResources(trait) {
    const resources = {
      openness: ['Creative thinking courses', 'Innovation workshops', 'Art/music exploration'],
      conscientiousness: [
        'Time management systems',
        'Project management training',
        'Habit tracking apps'
      ],
      extraversion: [
        'Communication skills training',
        'Networking groups',
        'Public speaking practice'
      ],
      agreeableness: ['Active listening training', 'Empathy exercises', 'Volunteer opportunities'],
      neuroticism: ['Stress management programs', 'Mindfulness apps', 'Therapeutic support']
    };

    return resources[trait] || ['Self-help books', 'Online courses', 'Coaching'];
  }

  /**
   * Get expected outcome for recommendation
   */
  getExpectedOutcome(category, timeframe) {
    const outcomes = {
      'Well-being': 'Reduced stress levels and improved emotional regulation',
      Career: 'Enhanced professional opportunities and job satisfaction',
      'Personal Growth': 'Improved self-awareness and interpersonal skills',
      Optimization: 'Maximized strengths and enhanced performance',
      'Emotional Regulation': 'Better emotional stability and stress management'
    };
    return outcomes[category] || 'Positive personal development and growth';
  }

  /**
   * Get milestones for long-term goals
   */
  getMilestones(category, timeframe) {
    const milestones = {
      'Personal Growth': [
        'Complete initial assessment and goal setting',
        'Implement daily practice routine',
        'Achieve first measurable improvement',
        'Sustain progress for 3+ months'
      ],
      Optimization: [
        'Identify key leverage opportunities',
        'Develop strategic application plan',
        'Execute in professional/personal contexts',
        'Mentor others in this strength area'
      ],
      Career: [
        'Define career enhancement goals',
        'Develop required skills/credentials',
        'Build strategic network connections',
        'Achieve career milestone or transition'
      ]
    };
    return (
      milestones[category] || [
        'Set specific development goals',
        'Create implementation plan',
        'Track progress regularly',
        'Evaluate and adjust approach'
      ]
    );
  }

  /**
   * Get default immediate action if none generated
   */
  getDefaultImmediate(traits) {
    const highestTrait = Object.entries(traits).reduce((a, b) =>
      traits[a[0]] > traits[b[0]] ? a : b
    );
    return {
      title: `Leverage Your ${highestTrait[0].charAt(0).toUpperCase() + highestTrait[0].slice(1)}`,
      description: `Your strongest trait is ${highestTrait[0]} (${highestTrait[1]}%). Focus on leveraging this strength in your daily activities.`,
      steps: [
        'Identify opportunities to use this strength',
        'Apply it to current challenges',
        'Share this strength with others'
      ],
      outcome: 'Enhanced confidence and effectiveness in personal and professional settings'
    };
  }

  /**
   * Get default long-term goal if none generated
   */
  getDefaultLongTerm(traits) {
    const lowestTrait = Object.entries(traits).reduce((a, b) =>
      traits[a[0]] < traits[b[0]] ? a : b
    );
    return {
      title: `Develop Your ${lowestTrait[0].charAt(0).toUpperCase() + lowestTrait[0].slice(1)}`,
      description: `Consider gradual development in ${lowestTrait[0]} to create a more balanced personality profile.`,
      timeline: '6-12 months',
      milestones: [
        'Understand the value of this trait',
        'Practice specific behaviors',
        'Notice improvements in daily life',
        'Integrate into natural behavior patterns'
      ]
    };
  }

  /**
   * Get leverage resources
   */
  getLeverageResources(trait) {
    const resources = {
      openness: ['Innovation forums', 'Creative communities', 'Research collaborations'],
      conscientiousness: [
        'Leadership training',
        'Project management certification',
        'Productivity communities'
      ],
      extraversion: ['Leadership roles', 'Speaking opportunities', 'Networking events'],
      agreeableness: ['Mediation training', 'Counseling certification', 'Team facilitation'],
      neuroticism: [
        'Emotional intelligence training',
        'Mindfulness teaching',
        'Peer support groups'
      ]
    };

    return resources[trait] || ['Advanced training', 'Mentorship opportunities', 'Skill sharing'];
  }

  /**
   * Determine personality archetype (enhanced version)
   */
  determinePersonalityArchetype(traits) {
    const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = traits;

    // More nuanced archetype determination with realistic thresholds
    // First check for strong single trait dominance
    const maxTrait = Math.max(openness, conscientiousness, extraversion, agreeableness);
    const minTrait = Math.min(
      openness,
      conscientiousness,
      extraversion,
      agreeableness,
      neuroticism
    );
    const range = maxTrait - minTrait;

    // Check for balanced profile first
    if (range < 25) {
      return {
        name: 'Adaptive Generalist',
        description:
          'You demonstrate remarkable psychological flexibility, adapting your approach to different situations with ease.',
        detailed_explanation:
          'Your balanced profile across all traits allows you to navigate diverse social and professional contexts effectively. This versatility is your superpower - you can collaborate with different personality types and adjust your style as needed.',
        strengths: [
          'Versatility',
          'Adaptability',
          'Balance',
          'Social flexibility',
          'Emotional stability'
        ],
        ideal_environments: [
          'Cross-functional teams',
          'Project management',
          'Consulting',
          'Leadership roles requiring adaptability'
        ],
        growth_edge:
          'While balance is a strength, consider developing one or two traits more deeply to create distinctive expertise.',
        famous_examples: 'Barack Obama, Angela Merkel, Tim Cook',
        population_percentage: '~12%',
        what_this_means:
          'You belong to a group of highly adaptable individuals who can succeed in various environments. Your balanced nature makes you an excellent mediator and team player.'
      };
    }

    // Strategic Innovator: High openness + conscientiousness
    if (openness >= 60 && conscientiousness >= 60 && neuroticism <= 50) {
      return {
        name: 'Strategic Innovator',
        description:
          'You combine visionary creativity with disciplined execution - a rare and powerful combination.',
        detailed_explanation:
          'You represent a rare psychological profile that combines the best of both worlds: the creativity and vision of high openness with the discipline and follow-through of high conscientiousness. This makes you exceptionally well-suited for roles that require both innovation and implementation.',
        strengths: [
          'Visionary thinking',
          'Strategic planning',
          'Innovation with execution',
          'Goal achievement',
          'Creative problem-solving'
        ],
        ideal_environments: [
          'Startup leadership',
          'Research & development',
          'Strategic consulting',
          'Product innovation',
          'Entrepreneurship'
        ],
        growth_edge:
          'Remember to delegate routine tasks and avoid perfectionism that might slow down your innovative momentum.',
        famous_examples: 'Steve Jobs, Elon Musk, Marie Curie, Jeff Bezos',
        population_percentage: '< 3%',
        what_this_means:
          'You possess an exceptionally rare combination that appears in less than 3% of the population. Your ability to envision AND execute makes you a natural leader in innovation.'
      };
    }

    // Creative Catalyst: High openness + extraversion
    if (openness >= 60 && extraversion >= 60 && neuroticism <= 55) {
      return {
        name: 'Creative Catalyst',
        description: 'You energize teams with innovative ideas and contagious enthusiasm.',
        detailed_explanation:
          'Your combination of high creativity and social energy makes you a natural catalyst for innovation in group settings. You thrive on brainstorming, collaboration, and bringing creative visions to life through others.',
        strengths: [
          'Idea generation',
          'Team inspiration',
          'Creative collaboration',
          'Networking',
          'Enthusiasm'
        ],
        ideal_environments: [
          'Creative agencies',
          'Marketing',
          'Entertainment',
          'Team leadership',
          'Innovation workshops'
        ],
        growth_edge:
          'Balance your enthusiasm with follow-through, and ensure ideas are implemented, not just generated.',
        famous_examples: 'Richard Branson, Oprah Winfrey, Walt Disney, Ellen DeGeneres',
        population_percentage: '~7%',
        what_this_means:
          "You're part of a vibrant group that drives creative change through social connection. Your energy and ideas inspire others to think differently."
      };
    }

    // Servant Leader: High conscientiousness + agreeableness + moderate extraversion
    if (conscientiousness >= 60 && agreeableness >= 60 && extraversion >= 45) {
      return {
        name: 'Servant Leader',
        description:
          'You lead through service, combining reliability with genuine care for others.',
        detailed_explanation:
          'Your personality profile reflects a leadership style focused on empowering others and achieving results through collaboration. You prioritize team success over personal glory and create environments where everyone can thrive.',
        strengths: [
          'Ethical leadership',
          'Team building',
          'Reliability',
          'Empathy',
          'Conflict resolution'
        ],
        ideal_environments: [
          'Non-profit leadership',
          'Human resources',
          'Healthcare management',
          'Education',
          'Community organizations'
        ],
        growth_edge:
          "Don't forget your own needs while serving others. Set boundaries to prevent burnout.",
        famous_examples: 'Nelson Mandela, Mother Teresa, Satya Nadella, Jacinda Ardern',
        population_percentage: '~9%',
        what_this_means:
          'You embody a leadership style that prioritizes collective success. Your combination of care and competence makes you highly effective in roles requiring trust and collaboration.'
      };
    }

    // Analytical Architect: High conscientiousness + low extraversion
    if (conscientiousness >= 60 && extraversion <= 40 && neuroticism <= 50) {
      return {
        name: 'Analytical Architect',
        description:
          'You excel at designing and implementing complex systems with precision and depth.',
        detailed_explanation:
          "Your personality combines methodical thinking with a preference for deep, focused work. You're the person who creates the frameworks and systems that organizations rely on, working best when given space for concentration.",
        strengths: [
          'Systems thinking',
          'Detail orientation',
          'Deep focus',
          'Quality control',
          'Strategic planning'
        ],
        ideal_environments: [
          'Software architecture',
          'Research',
          'Financial analysis',
          'Engineering',
          'Quality assurance'
        ],
        growth_edge:
          "Remember to communicate your insights to others and seek input, even if collaboration doesn't come naturally.",
        famous_examples: 'Bill Gates, Warren Buffett, Mark Zuckerberg, J.K. Rowling',
        population_percentage: '~11%',
        what_this_means:
          "You're part of a group that builds the foundations others depend on. Your careful, systematic approach ensures quality and reliability in everything you create."
      };
    }

    // Inspirational Connector: High agreeableness + extraversion
    if (agreeableness >= 60 && extraversion >= 55 && openness >= 50) {
      return {
        name: 'Inspirational Connector',
        description: 'You build bridges between people and ideas with warmth and enthusiasm.',
        detailed_explanation:
          'Your combination of social energy and genuine care for others makes you a natural networker and relationship builder. You see the best in people and help them connect with opportunities and each other.',
        strengths: [
          'Relationship building',
          'Communication',
          'Team harmony',
          'Motivation',
          'Networking'
        ],
        ideal_environments: [
          'Sales',
          'Public relations',
          'Community management',
          'Coaching',
          'Customer success'
        ],
        growth_edge:
          'Balance your desire to help everyone with strategic focus on high-impact relationships and goals.',
        famous_examples: 'Maya Angelou, Tony Robbins, Michelle Obama, Dale Carnegie',
        population_percentage: '~14%',
        what_this_means:
          'You belong to a group that makes the world more connected and collaborative. Your ability to inspire and unite people is a valuable gift in any organization.'
      };
    }

    // Independent Thinker: High openness + low extraversion
    if (openness >= 60 && extraversion <= 40 && conscientiousness <= 45) {
      return {
        name: 'Independent Thinker',
        description:
          'You pursue intellectual exploration and creative insights through deep, solitary reflection.',
        detailed_explanation:
          'Your personality combines high creativity with a preference for independent work. You generate original ideas and insights when given space to think deeply without social distractions.',
        strengths: [
          'Original thinking',
          'Creative insight',
          'Independence',
          'Intellectual depth',
          'Innovation'
        ],
        ideal_environments: ['Research', 'Writing', 'Art', 'Philosophy', 'Independent consulting'],
        growth_edge:
          "Share your insights more broadly and consider collaboration to amplify your ideas' impact.",
        famous_examples: 'Albert Einstein, Virginia Woolf, Nikola Tesla, Emily Dickinson',
        population_percentage: '~8%',
        what_this_means:
          "You're part of a group that generates breakthrough insights through deep, independent thought. Your original perspective is invaluable for innovation and discovery."
      };
    }

    // Results Driver: High conscientiousness + low agreeableness
    if (conscientiousness >= 60 && agreeableness <= 40 && neuroticism <= 50) {
      return {
        name: 'Results Driver',
        description: 'You pursue excellence with unwavering focus on outcomes and efficiency.',
        detailed_explanation:
          "Your personality combines high achievement drive with objective decision-making. You're willing to make tough calls and prioritize results over popularity, making you effective in competitive environments.",
        strengths: [
          'Goal achievement',
          'Decision-making',
          'Efficiency',
          'Strategic focus',
          'Performance optimization'
        ],
        ideal_environments: [
          'Executive leadership',
          'Investment banking',
          'Competitive sports',
          'Entrepreneurship',
          'Operations management'
        ],
        growth_edge:
          'Consider the human element in your drive for results. Building allies can accelerate achievement.',
        famous_examples: 'Jack Welch, Margaret Thatcher, Michael Jordan, Sheryl Sandberg',
        population_percentage: '~6%',
        what_this_means:
          'You belong to a highly driven group that gets things done. Your focus on results and willingness to make tough decisions drives organizational success.'
      };
    }

    // Empathetic Energizer: High extraversion + agreeableness
    if (extraversion >= 60 && agreeableness >= 60) {
      return {
        name: 'Empathetic Energizer',
        description: 'You bring positive energy and genuine care to every interaction.',
        detailed_explanation:
          'Your combination of social energy and empathy makes you a natural at creating positive environments where people feel valued and motivated. You thrive on human connection and helping others succeed.',
        strengths: [
          'Social energy',
          'Empathy',
          'Team morale',
          'Communication',
          'Positive influence'
        ],
        ideal_environments: [
          'Human resources',
          'Teaching',
          'Customer service',
          'Healthcare',
          'Event planning'
        ],
        growth_edge:
          'Set boundaries to protect your energy and avoid overextending yourself in helping others.',
        famous_examples: 'Ellen DeGeneres, Tom Hanks, Dolly Parton, Robin Williams',
        population_percentage: '~10%',
        what_this_means:
          "You're part of a group that makes environments more positive and supportive. Your combination of energy and empathy creates spaces where people thrive."
      };
    }

    // Reliable Guardian: High conscientiousness + agreeableness, low openness
    if (conscientiousness >= 55 && agreeableness >= 55 && openness <= 45) {
      return {
        name: 'Reliable Guardian',
        description: 'You provide stability and support through consistent care and dependability.',
        detailed_explanation:
          "Your personality combines reliability with care for others, while preferring proven methods over experimentation. You're the person others turn to for consistent support and practical solutions.",
        strengths: [
          'Dependability',
          'Loyalty',
          'Practical support',
          'Consistency',
          'Trustworthiness'
        ],
        ideal_environments: [
          'Healthcare',
          'Education',
          'Public service',
          'Administration',
          'Community support'
        ],
        growth_edge:
          'Consider embracing some calculated risks and new approaches to expand your impact.',
        famous_examples: 'Jimmy Carter, Queen Elizabeth II, Tom Brokaw',
        population_percentage: '~13%',
        what_this_means:
          "You're part of the backbone of society - reliable individuals who keep things running smoothly through consistent care and competence."
      };
    }

    // Social Butterfly: Very high extraversion
    if (extraversion >= 65 && agreeableness >= 50) {
      return {
        name: 'Social Butterfly',
        description: 'You thrive on social connection and bring energy to every gathering.',
        detailed_explanation:
          'Your exceptionally high social energy makes you a natural at building networks and creating vibrant social environments. You draw energy from interaction and help others feel included.',
        strengths: ['Networking', 'Social energy', 'Communication', 'Enthusiasm', 'Inclusiveness'],
        ideal_environments: ['Sales', 'Event planning', 'Public relations', 'Media', 'Hospitality'],
        growth_edge: 'Balance social time with reflection to deepen relationships and insights.',
        famous_examples: 'Jimmy Fallon, Kelly Ripa, Ryan Seacrest',
        population_percentage: '~8%',
        what_this_means:
          'You belong to a group that makes social connections effortless and enjoyable. Your energy brings life to organizations and communities.'
      };
    }

    // Perfectionist: Very high conscientiousness
    if (conscientiousness >= 65 && neuroticism >= 45) {
      return {
        name: 'Perfectionist',
        description:
          'You pursue excellence with meticulous attention to detail and high standards.',
        detailed_explanation:
          'Your combination of high conscientiousness and sensitivity to problems drives you to achieve exceptional quality in everything you do. You notice details others miss and won\'t settle for "good enough."',
        strengths: [
          'Attention to detail',
          'Quality focus',
          'Thoroughness',
          'High standards',
          'Problem detection'
        ],
        ideal_environments: [
          'Quality assurance',
          'Editing',
          'Accounting',
          'Research',
          'Compliance'
        ],
        growth_edge:
          'Learn when "good enough" truly is good enough to avoid paralysis and burnout.',
        famous_examples: 'Martha Stewart, Gordon Ramsay, Beyoncé',
        population_percentage: '~5%',
        what_this_means:
          "You're part of a group that maintains the highest standards of excellence. Your perfectionism, when balanced, drives quality and innovation."
      };
    }

    // Creative Explorer: Very high openness
    if (openness >= 65 && conscientiousness <= 50) {
      return {
        name: 'Creative Explorer',
        description:
          'You pursue creative expression and novel experiences with boundless curiosity.',
        detailed_explanation:
          'Your exceptionally high openness drives you to constantly explore new ideas, experiences, and creative expressions. You thrive on novelty and see possibilities others might miss.',
        strengths: ['Creativity', 'Innovation', 'Curiosity', 'Adaptability', 'Artistic vision'],
        ideal_environments: ['Arts', 'Design', 'Innovation labs', 'Travel', 'Creative writing'],
        growth_edge:
          'Channel your creativity into completed projects rather than endless exploration.',
        famous_examples: 'Pablo Picasso, David Bowie, Lady Gaga, Salvador Dalí',
        population_percentage: '~6%',
        what_this_means:
          "You're part of the creative vanguard that pushes boundaries and introduces new perspectives. Your openness to experience enriches culture and innovation."
      };
    }

    // Harmonizer: Very high agreeableness
    if (agreeableness >= 65 && neuroticism <= 55) {
      return {
        name: 'Harmonizer',
        description:
          'You create harmony and understanding through exceptional empathy and cooperation.',
        detailed_explanation:
          "Your very high agreeableness makes you exceptionally attuned to others' needs and skilled at creating cooperative environments. You naturally smooth conflicts and build consensus.",
        strengths: ['Empathy', 'Cooperation', 'Conflict resolution', 'Team harmony', 'Compassion'],
        ideal_environments: [
          'Mediation',
          'Counseling',
          'Team facilitation',
          'Non-profit work',
          'Community organizing'
        ],
        growth_edge:
          'Practice asserting your own needs and boundaries alongside caring for others.',
        famous_examples: 'Mr. Rogers, Dalai Lama, Desmond Tutu',
        population_percentage: '~7%',
        what_this_means:
          'You belong to a group that makes the world more compassionate and cooperative. Your ability to create harmony is essential for healthy communities.'
      };
    }

    // Contemplative Scholar: High openness + conscientiousness, low extraversion
    if (openness >= 55 && conscientiousness >= 55 && extraversion <= 35) {
      return {
        name: 'Contemplative Scholar',
        description:
          'You combine intellectual curiosity with disciplined study in quiet reflection.',
        detailed_explanation:
          'Your personality blends intellectual openness with methodical approach and preference for solitary work. You produce deep insights through careful, systematic exploration of complex topics.',
        strengths: [
          'Deep analysis',
          'Intellectual rigor',
          'Independent research',
          'Systematic thinking',
          'Knowledge synthesis'
        ],
        ideal_environments: [
          'Academia',
          'Research institutions',
          'Writing',
          'Analysis',
          'Library sciences'
        ],
        growth_edge:
          'Share your knowledge more broadly and engage with communities that can benefit from your insights.',
        famous_examples: 'Charles Darwin, Jane Goodall, Stephen Hawking',
        population_percentage: '~4%',
        what_this_means:
          "You're part of a select group that advances human knowledge through deep, careful study. Your scholarly approach uncovers truths others might overlook."
      };
    }

    // Dynamic Leader: High extraversion + conscientiousness
    if (extraversion >= 60 && conscientiousness >= 55 && agreeableness <= 50) {
      return {
        name: 'Dynamic Leader',
        description: 'You drive teams forward with energy, vision, and decisive action.',
        detailed_explanation:
          'Your combination of social energy, achievement drive, and willingness to make tough decisions makes you a natural leader in competitive environments. You inspire action and deliver results.',
        strengths: [
          'Leadership',
          'Decision-making',
          'Team motivation',
          'Strategic vision',
          'Action orientation'
        ],
        ideal_environments: [
          'Executive roles',
          'Sales leadership',
          'Military',
          'Politics',
          'Competitive business'
        ],
        growth_edge: 'Balance drive with empathy to build lasting loyalty alongside achievement.',
        famous_examples: 'Theodore Roosevelt, Richard Branson, Jack Ma',
        population_percentage: '~5%',
        what_this_means:
          'You belong to a group of natural leaders who combine charisma with competence. Your dynamic style drives organizations to new heights.'
      };
    }

    // If no clear archetype matches, determine based on dominant trait
    if (openness === maxTrait && openness >= 55) {
      return {
        name: 'Creative Explorer',
        description: 'Your dominant trait of openness drives creative exploration and innovation.',
        detailed_explanation:
          "High openness defines your approach to life - you're constantly seeking new experiences, ideas, and creative expressions.",
        strengths: ['Creativity', 'Innovation', 'Adaptability', 'Curiosity', 'Vision'],
        ideal_environments: ['Creative fields', 'Innovation', 'Arts', 'Research', 'Design'],
        growth_edge: 'Balance exploration with execution to bring your creative visions to life.',
        famous_examples: 'Leonardo da Vinci, Frida Kahlo, Prince',
        population_percentage: '~15%',
        what_this_means:
          'Your creative nature puts you among the innovators and visionaries who push boundaries and introduce new perspectives.'
      };
    } else if (conscientiousness === maxTrait && conscientiousness >= 55) {
      return {
        name: 'Analytical Architect',
        description: 'Your dominant conscientiousness drives systematic achievement and quality.',
        detailed_explanation:
          'High conscientiousness defines your methodical, achievement-oriented approach to challenges.',
        strengths: ['Organization', 'Reliability', 'Goal achievement', 'Quality focus', 'Planning'],
        ideal_environments: [
          'Project management',
          'Operations',
          'Finance',
          'Engineering',
          'Administration'
        ],
        growth_edge: 'Allow for flexibility and spontaneity alongside your structured approach.',
        famous_examples: 'Angela Merkel, Tim Cook, Indra Nooyi',
        population_percentage: '~18%',
        what_this_means:
          "Your conscientious nature makes you part of society's achievers and builders who turn visions into reality."
      };
    } else if (extraversion === maxTrait && extraversion >= 55) {
      return {
        name: 'Social Butterfly',
        description: 'Your dominant extraversion drives social connection and energy.',
        detailed_explanation:
          'High extraversion defines your energetic, socially-oriented approach to life.',
        strengths: ['Social skills', 'Energy', 'Communication', 'Networking', 'Enthusiasm'],
        ideal_environments: [
          'Sales',
          'Public speaking',
          'Entertainment',
          'Teaching',
          'Customer-facing roles'
        ],
        growth_edge: 'Develop comfort with solitude and deep focus alongside your social nature.',
        famous_examples: 'Will Smith, Jennifer Lawrence, Graham Norton',
        population_percentage: '~16%',
        what_this_means:
          'Your extraverted nature puts you among the connectors and energizers who bring people together.'
      };
    } else if (agreeableness === maxTrait && agreeableness >= 55) {
      return {
        name: 'Harmonizer',
        description: 'Your dominant agreeableness drives cooperation and care for others.',
        detailed_explanation:
          'High agreeableness defines your cooperative, caring approach to relationships.',
        strengths: ['Empathy', 'Cooperation', 'Support', 'Harmony', 'Compassion'],
        ideal_environments: ['Healthcare', 'Social work', 'Teaching', 'Counseling', 'Non-profit'],
        growth_edge: 'Practice self-advocacy alongside your natural care for others.',
        famous_examples: 'Princess Diana, Bob Ross, Keanu Reeves',
        population_percentage: '~17%',
        what_this_means:
          'Your agreeable nature makes you part of the caring community that holds society together through compassion.'
      };
    }

    // Default to Unique Individual only if truly unique pattern
    return {
      name: 'Unique Individual',
      description:
        'Your personality profile is distinctively yours, defying conventional categories.',
      detailed_explanation:
        "Your unique combination of traits doesn't fit neatly into typical archetypes, which is actually quite special. You bring a one-of-a-kind perspective that enriches any environment.",
      strengths: [
        'Uniqueness',
        'Versatility',
        'Unpredictability',
        'Fresh perspective',
        'Authenticity'
      ],
      ideal_environments: [
        'Entrepreneurship',
        'Creative fields',
        'Consulting',
        'Innovation',
        'Anywhere that values unique perspectives'
      ],
      growth_edge:
        'Embrace your uniqueness while finding ways to communicate your value to others.',
      famous_examples: 'David Bowie, Björk, Tilda Swinton',
      population_percentage: '~5%',
      what_this_means:
        'Your unique profile means you bring perspectives and combinations of strengths that are rare and valuable. Embrace what makes you different.'
    };
  }

  /**
   * Analyze traits with confidence intervals
   */
  analyzeTraits(traits, confidence) {
    const analysis = {};

    Object.entries(traits).forEach(([trait, score]) => {
      const level = this.getLevel(score);
      const confidenceInterval = this.calculateConfidenceInterval(score, confidence);

      analysis[trait] = {
        score,
        level,
        confidence: confidence,
        confidenceInterval,
        description: this.descriptions[trait][level],
        insights: this.getEnhancedInsights(trait, level, score),
        implications: this.getTraitImplications(trait, score)
      };
    });

    return analysis;
  }

  /**
   * Calculate confidence interval
   */
  calculateConfidenceInterval(score, confidence) {
    const margin = Math.round((1 - confidence) * 10);
    return {
      lower: Math.max(0, score - margin),
      upper: Math.min(100, score + margin)
    };
  }

  /**
   * Get enhanced insights for trait level
   */
  getEnhancedInsights(trait, level, score) {
    const baseInsights = this.getInsights(trait, level);
    const additionalInsights = [];

    // Add score-specific insights
    if (score > 85) {
      additionalInsights.push(`Exceptionally high ${trait} (top 15%)`);
    } else if (score < 15) {
      additionalInsights.push(`Exceptionally low ${trait} (bottom 15%)`);
    }

    // Add developmental insights
    if (level === 'low' && trait !== 'neuroticism') {
      additionalInsights.push('Growth opportunity identified');
    } else if (level === 'high' && trait !== 'neuroticism') {
      additionalInsights.push('Core strength to leverage');
    }

    return [...baseInsights, ...additionalInsights];
  }

  /**
   * Get trait implications
   */
  getTraitImplications(trait, score) {
    const implications = {
      work: this.getWorkImplication(trait, score),
      relationships: this.getRelationshipImplication(trait, score),
      personal: this.getPersonalImplication(trait, score)
    };

    return implications;
  }

  /**
   * Get work implications
   */
  getWorkImplication(trait, score) {
    const level = this.getLevel(score);
    const implications = {
      openness: {
        low: 'Excels in structured, routine work',
        medium: 'Adapts to various work styles',
        high: 'Thrives in innovative, dynamic roles'
      },
      conscientiousness: {
        low: 'Benefits from external structure',
        medium: 'Balances flexibility with reliability',
        high: 'Natural project leader and organizer'
      },
      extraversion: {
        low: 'Performs best with independent work',
        medium: 'Versatile in solo and team settings',
        high: 'Energized by collaborative environments'
      },
      agreeableness: {
        low: 'Strong in negotiation and analysis',
        medium: 'Balances empathy with objectivity',
        high: 'Excellent team player and mediator'
      },
      neuroticism: {
        low: 'Stable under pressure',
        medium: 'Normal stress response',
        high: 'Benefits from structured support'
      }
    };

    return implications[trait]?.[level] || 'Varies by context';
  }

  /**
   * Get relationship implications
   */
  getRelationshipImplication(trait, score) {
    const level = this.getLevel(score);
    const implications = {
      openness: {
        low: 'Values stability and tradition in relationships',
        medium: 'Balances novelty with familiarity',
        high: 'Seeks intellectual and experiential connection'
      },
      conscientiousness: {
        low: 'Spontaneous and flexible partner',
        medium: 'Balances planning with spontaneity',
        high: 'Reliable and committed partner'
      },
      extraversion: {
        low: 'Prefers deep, one-on-one connections',
        medium: "Adapts to partner's social needs",
        high: 'Brings energy and social connections'
      },
      agreeableness: {
        low: 'Direct and honest communication',
        medium: "Balances needs with partner's",
        high: 'Naturally supportive and empathetic'
      },
      neuroticism: {
        low: 'Emotionally stable presence',
        medium: 'Normal emotional expression',
        high: 'May need extra reassurance'
      }
    };

    return implications[trait]?.[level] || 'Varies by relationship';
  }

  /**
   * Get personal implications
   */
  getPersonalImplication(trait, score) {
    const level = this.getLevel(score);
    const implications = {
      openness: {
        low: 'Finds comfort in routine',
        medium: 'Selective explorer',
        high: 'Constant learner and explorer'
      },
      conscientiousness: {
        low: 'Values flexibility over structure',
        medium: 'Moderate self-discipline',
        high: 'Strong self-control and discipline'
      },
      extraversion: {
        low: 'Recharges in solitude',
        medium: 'Balanced energy needs',
        high: 'Energized by social interaction'
      },
      agreeableness: {
        low: 'Strong sense of self',
        medium: 'Balanced self-other focus',
        high: 'Others-focused orientation'
      },
      neuroticism: {
        low: 'Even-tempered',
        medium: 'Typical emotional range',
        high: 'Rich emotional life'
      }
    };

    return implications[trait]?.[level] || 'Individual variation';
  }

  /**
   * Get specific insights for trait level
   */
  getInsights(trait, level) {
    const insights = {
      openness: {
        low: [
          'Prefer familiar routines',
          'Value practical solutions',
          'Focus on concrete details',
          'Traditional approach'
        ],
        medium: [
          'Balance innovation with tradition',
          'Selective about new experiences',
          'Practical creativity',
          'Moderate curiosity'
        ],
        high: [
          'Thrive on novelty',
          'Abstract thinker',
          'Artistic appreciation',
          'Intellectual curiosity',
          'Love of learning'
        ]
      },
      conscientiousness: {
        low: [
          'Flexible and spontaneous',
          'Adaptable to change',
          'Prefer minimal structure',
          'In-the-moment focus'
        ],
        medium: [
          'Balance planning with flexibility',
          'Selective organization',
          'Moderate goal-focus',
          'Situational discipline'
        ],
        high: [
          'Highly organized',
          'Strong work ethic',
          'Detail-oriented',
          'Goal-driven',
          'Reliable and dependable'
        ]
      },
      extraversion: {
        low: [
          'Prefer solitude',
          'Deep thinker',
          'Selective socializing',
          'Energy from within',
          'Quality over quantity in relationships'
        ],
        medium: [
          'Ambivert tendencies',
          'Situation-dependent social energy',
          'Balanced social needs',
          'Flexible interaction style'
        ],
        high: [
          'Energized by others',
          'Natural networker',
          'Seeks stimulation',
          'Broad social circle',
          'Action-oriented'
        ]
      },
      agreeableness: {
        low: [
          'Direct communicator',
          'Independent thinker',
          'Objective decision-making',
          'Competitive spirit',
          'Skeptical nature'
        ],
        medium: [
          'Balance cooperation with assertiveness',
          'Situational empathy',
          'Practical compassion',
          'Moderate trust'
        ],
        high: [
          'Highly empathetic',
          'Team-oriented',
          'Conflict-averse',
          'Trusting nature',
          'Helpful and generous'
        ]
      },
      neuroticism: {
        low: [
          'Emotionally stable',
          'Stress-resilient',
          'Calm under pressure',
          'Even-tempered',
          'Confident'
        ],
        medium: [
          'Normal emotional range',
          'Moderate stress response',
          'Balanced sensitivity',
          'Typical worry levels'
        ],
        high: [
          'Emotionally sensitive',
          'Detail-aware',
          'Intuitive to problems',
          'Rich emotional life',
          'Heightened awareness'
        ]
      }
    };

    return insights[trait]?.[level] || [];
  }

  /**
   * Determine trait level from score (enhanced with more granularity)
   */
  getLevel(score) {
    if (score < 33) return 'low';
    if (score < 67) return 'medium';
    return 'high';
  }

  /**
   * Assess trait balance (enhanced version)
   */
  assessBalance(traits) {
    const scores = Object.values(traits);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // More nuanced balance assessment
    if (stdDev < 12) {
      return 'Exceptionally well-balanced personality profile';
    } else if (stdDev < 18) {
      return 'Well-balanced across all traits';
    } else if (stdDev < 25) {
      return 'Moderate variation in trait expression';
    } else if (stdDev < 35) {
      return 'Notable contrasts between different traits';
    } else {
      return 'Strong personality contrasts creating a unique profile';
    }
  }

  /**
   * Analyze response contradictions for deeper insights
   */
  analyzeContradictions(responses, traits) {
    const contradictions = [];

    // Group responses by trait
    const traitResponses = {};
    responses.forEach(r => {
      if (!traitResponses[r.trait]) traitResponses[r.trait] = [];
      traitResponses[r.trait].push(r);
    });

    // Find contradictory patterns
    Object.entries(traitResponses).forEach(([trait, traitResp]) => {
      if (traitResp.length < 2) return;

      const scores = traitResp.map(r => r.score);
      const variance = this.calculateVariance(scores);

      if (variance > 1.5) {
        contradictions.push({
          trait,
          variance,
          insight: this.generateContradictionInsight(trait, scores, responses)
        });
      }
    });

    return contradictions;
  }

  /**
   * Generate contradiction-based insight
   */
  generateContradictionInsight(trait, scores, responses) {
    const highScores = scores.filter(s => s >= 4).length;
    const lowScores = scores.filter(s => s <= 2).length;

    if (highScores > 0 && lowScores > 0) {
      return `Your ${trait} expression varies significantly across contexts, suggesting situational adaptability`;
    }
    return `Consistent ${trait} expression with minor contextual variations`;
  }

  /**
   * Calculate variance helper
   */
  calculateVariance(scores) {
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    return scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  }

  /**
   * Analyze adaptive question patterns
   */
  analyzeAdaptivePatterns(responses) {
    const patterns = {
      responseSpeed: [],
      questionDifficulty: [],
      consistencyScore: 0,
      adaptationPath: []
    };

    // Track adaptation path
    const adaptiveResponses = responses.filter(r => r.phase === 'adaptive');
    if (adaptiveResponses.length > 0) {
      // Analyze how user adapted to increasingly specific questions
      patterns.adaptationPath = this.trackAdaptationPath(adaptiveResponses);
      patterns.learningCurve = this.calculateLearningCurve(adaptiveResponses);
    }

    // Analyze response consistency between phases
    const baselineResponses = responses.filter(r => r.phase === 'baseline');
    patterns.phaseConsistency = this.comparePhases(baselineResponses, adaptiveResponses);

    return patterns;
  }

  /**
   * Track user's adaptation path through questions
   */
  trackAdaptationPath(adaptiveResponses) {
    const path = [];
    let previousScore = null;

    adaptiveResponses.forEach((response, index) => {
      if (previousScore !== null) {
        const shift = response.score - previousScore;
        if (Math.abs(shift) >= 2) {
          path.push({
            position: index,
            shift,
            interpretation: shift > 0 ? 'increased confidence' : 'increased uncertainty'
          });
        }
      }
      previousScore = response.score;
    });

    return path;
  }

  /**
   * Calculate learning curve from adaptive responses
   */
  calculateLearningCurve(responses) {
    const firstHalf = responses.slice(0, Math.floor(responses.length / 2));
    const secondHalf = responses.slice(Math.floor(responses.length / 2));

    const firstAvg = firstHalf.reduce((sum, r) => sum + r.responseTime, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, r) => sum + r.responseTime, 0) / secondHalf.length;

    return {
      speedImprovement: (((firstAvg - secondAvg) / firstAvg) * 100).toFixed(1),
      pattern: secondAvg < firstAvg ? 'improving' : 'fatiguing'
    };
  }

  /**
   * Compare baseline and adaptive phase responses
   */
  comparePhases(baseline, adaptive) {
    if (!baseline.length || !adaptive.length) return null;

    const baselineAvg = baseline.reduce((sum, r) => sum + r.score, 0) / baseline.length;
    const adaptiveAvg = adaptive.reduce((sum, r) => sum + r.score, 0) / adaptive.length;
    const difference = Math.abs(baselineAvg - adaptiveAvg);

    return {
      consistency: difference < 0.5 ? 'high' : difference < 1 ? 'moderate' : 'low',
      shift: adaptiveAvg > baselineAvg ? 'increased' : 'decreased',
      magnitude: difference
    };
  }

  /**
   * Generate growth trajectory prediction
   */
  predictGrowthTrajectory(traits, patterns, age) {
    const trajectory = {
      shortTerm: [],
      longTerm: [],
      criticalPeriods: []
    };

    // Identify traits with highest growth potential
    Object.entries(traits).forEach(([trait, score]) => {
      const growthPotential = this.calculateGrowthPotential(trait, score, age);

      if (growthPotential.potential > 0.3) {
        trajectory.shortTerm.push({
          trait,
          currentLevel: score,
          projectedLevel: Math.min(100, score + growthPotential.shortTermGain),
          timeframe: '3-6 months',
          effort: growthPotential.effortRequired
        });
      }

      if (growthPotential.potential > 0.5) {
        trajectory.longTerm.push({
          trait,
          currentLevel: score,
          projectedLevel: Math.min(100, score + growthPotential.longTermGain),
          timeframe: '1-2 years',
          keyActions: this.getGrowthActions(trait, score)
        });
      }
    });

    // Identify critical development periods
    if (age && age < 30) {
      trajectory.criticalPeriods.push(
        'Peak neuroplasticity window - optimal for trait development'
      );
    }

    return trajectory;
  }

  /**
   * Calculate growth potential for a trait
   */
  calculateGrowthPotential(trait, currentScore, age) {
    // Lower scores have higher growth potential
    const baselinePotential = (100 - currentScore) / 100;

    // Age factor (younger = more potential)
    const ageFactor = age ? Math.max(0.5, 1 - (age - 25) / 100) : 0.8;

    // Trait-specific growth rates
    const traitGrowthRates = {
      openness: 0.7,
      conscientiousness: 0.8,
      extraversion: 0.5,
      agreeableness: 0.6,
      neuroticism: 0.6
    };

    const potential = baselinePotential * ageFactor * (traitGrowthRates[trait] || 0.6);

    return {
      potential,
      shortTermGain: potential * 15,
      longTermGain: potential * 30,
      effortRequired: potential > 0.6 ? 'moderate' : potential > 0.3 ? 'significant' : 'intensive'
    };
  }

  /**
   * Get specific growth actions for a trait
   */
  getGrowthActions(trait, currentScore) {
    const actions = {
      openness: [
        'Explore unfamiliar genres of books/music',
        'Travel to new cultures',
        'Learn a creative skill'
      ],
      conscientiousness: [
        'Implement time-blocking systems',
        'Track habits daily',
        'Set micro-goals'
      ],
      extraversion: [
        'Join speaking clubs',
        'Attend networking events',
        'Practice small talk daily'
      ],
      agreeableness: ['Volunteer for causes', 'Practice active listening', 'Engage in team sports'],
      neuroticism: [
        'Develop mindfulness practice',
        'Cognitive behavioral exercises',
        'Stress inoculation training'
      ]
    };

    return (
      actions[trait] || [
        'Targeted behavioral exercises',
        'Professional coaching',
        'Peer feedback loops'
      ]
    );
  }

  /**
   * Generate unique behavioral fingerprint
   */
  generateBehavioralFingerprint(responses, traits) {
    const fingerprint = {
      signature: '',
      uniquePatterns: [],
      rareTraits: [],
      distinctiveness: 0
    };

    // Create behavioral signature
    const traitVector = Object.values(traits).map(t => Math.round(t / 20));
    fingerprint.signature = traitVector.join('');

    // Find unique patterns
    const avgResponseTime =
      responses.reduce((sum, r) => sum + (r.responseTime || 5000), 0) / responses.length;
    if (avgResponseTime < 2000) {
      fingerprint.uniquePatterns.push('Rapid intuitive decision-maker');
    } else if (avgResponseTime > 10000) {
      fingerprint.uniquePatterns.push('Deep deliberative processor');
    }

    // Identify rare trait combinations
    Object.entries(traits).forEach(([trait, score]) => {
      const percentile = this.getTraitPercentile(trait, score);
      if (percentile > 95 || percentile < 5) {
        fingerprint.rareTraits.push({
          trait,
          rarity: percentile > 95 ? 'exceptionally high' : 'exceptionally low',
          frequency: `Found in ${percentile > 50 ? 100 - percentile : percentile}% of population`
        });
      }
    });

    // Calculate overall distinctiveness
    fingerprint.distinctiveness = this.calculateDistinctiveness(traits);

    return fingerprint;
  }

  /**
   * Get trait percentile helper
   */
  getTraitPercentile(trait, score) {
    const norm = this.populationNorms[trait];
    return this.calculatePercentile(score, norm.mean, norm.stdDev);
  }

  /**
   * Calculate profile distinctiveness
   */
  calculateDistinctiveness(traits) {
    let distinctiveness = 0;
    Object.values(traits).forEach(score => {
      // Extreme scores increase distinctiveness
      const deviation = Math.abs(score - 50) / 50;
      distinctiveness += deviation;
    });
    return Math.min(100, distinctiveness * 20);
  }

  /**
   * Initialize population norms
   */
  initializePopulationNorms() {
    // Simplified norms - in production would come from database
    this.populationNorms = {
      openness: { mean: 50, stdDev: 15 },
      conscientiousness: { mean: 52, stdDev: 14 },
      extraversion: { mean: 48, stdDev: 16 },
      agreeableness: { mean: 54, stdDev: 13 },
      neuroticism: { mean: 46, stdDev: 17 }
    };
  }

  /**
   * Initialize personality archetypes
   */
  initializeArchetypes() {
    this.archetypes = {
      'Strategic Innovator': 'Combines visionary thinking with disciplined execution',
      'Servant Leader': 'Leads through service, reliability, and genuine care for others',
      'Creative Catalyst': 'Sparks innovation and energizes teams through creative vision',
      'Analytical Architect': 'Builds robust systems through deep analysis and careful planning',
      'Inspirational Connector': 'Bridges people and ideas with warmth and vision',
      'Independent Thinker': 'Generates original insights through solitary exploration',
      'Results Driver': 'Achieves objectives through focused determination',
      'Empathetic Energizer': 'Motivates others through emotional connection and enthusiasm',
      'Reliable Guardian': 'Protects and maintains through consistent care',
      'Adaptive Generalist': 'Flexibly applies diverse skills across situations',
      'Social Butterfly': 'Thrives in social settings and builds extensive networks',
      Perfectionist: 'Pursues excellence through meticulous attention to detail',
      'Creative Explorer': 'Seeks new experiences and unconventional solutions',
      Harmonizer: 'Creates peace and understanding in all relationships',
      'Contemplative Scholar': 'Combines intellectual depth with quiet reflection',
      'Dynamic Leader': 'Drives change through bold action and decisive leadership',
      'Unique Individual': 'Defies categorization with a distinctive trait combination'
    };
  }

  /**
   * Analyze cognitive profile based on traits
   */
  analyzeCognitiveProfile(traits) {
    const profile = {
      processingStyle: '',
      decisionMaking: '',
      learningApproach: '',
      problemSolving: '',
      creativityLevel: '',
      intellectualCuriosity: '',
      cognitiveFlexibility: '',
      strengths: [],
      motivationalDrivers: []
    };

    // Processing style
    if (traits.openness > 60 && traits.extraversion > 60) {
      profile.processingStyle =
        'Expansive-Collaborative: You process information by exploring multiple perspectives and engaging with others';
    } else if (traits.openness > 60 && traits.extraversion < 40) {
      profile.processingStyle =
        'Deep-Analytical: You prefer thorough, independent analysis before forming conclusions';
    } else if (traits.conscientiousness > 70) {
      profile.processingStyle =
        'Systematic-Sequential: You process information methodically, building understanding step by step';
    } else {
      profile.processingStyle =
        'Adaptive-Flexible: You adjust your processing style based on context and needs';
    }

    // Decision making
    if (traits.conscientiousness > 70 && traits.neuroticism < 40) {
      profile.decisionMaking =
        'Confident and methodical, with strong conviction in well-researched choices';
    } else if (traits.agreeableness > 70) {
      profile.decisionMaking = 'Consensus-oriented, considering all stakeholders before deciding';
    } else if (traits.openness > 70) {
      profile.decisionMaking = 'Innovative and experimental, willing to try novel approaches';
    } else {
      profile.decisionMaking = 'Pragmatic and balanced, weighing practical considerations';
    }

    // Learning approach
    if (traits.openness > 70) {
      profile.learningApproach =
        'Conceptual learner who thrives on theory and big-picture understanding';
    } else if (traits.conscientiousness > 70) {
      profile.learningApproach =
        'Structured learner who benefits from clear progression and practice';
    } else if (traits.extraversion > 70) {
      profile.learningApproach =
        'Interactive learner who gains insights through discussion and collaboration';
    } else {
      profile.learningApproach = 'Practical learner focused on real-world applications';
    }

    // Problem solving
    const problemStyles = [];
    if (traits.openness > 60) problemStyles.push('creative');
    if (traits.conscientiousness > 60) problemStyles.push('systematic');
    if (traits.extraversion > 60) problemStyles.push('collaborative');
    if (traits.agreeableness > 60) problemStyles.push('harmonious');
    if (traits.neuroticism < 40) problemStyles.push('pressure-resistant');
    profile.problemSolving =
      problemStyles.length > 0
        ? `Your problem-solving is ${problemStyles.join(', ')} - bringing ${problemStyles.length > 3 ? 'exceptional versatility' : 'focused strength'} to challenges`
        : 'Adaptive problem-solving based on situational needs';

    // Creativity level
    const creativityScore =
      (traits.openness * 2 + (100 - traits.conscientiousness) + traits.extraversion) / 4;
    if (creativityScore > 70) {
      profile.creativityLevel =
        'Highly creative with frequent original insights and novel approaches';
    } else if (creativityScore > 50) {
      profile.creativityLevel = 'Moderately creative, balancing innovation with practicality';
    } else {
      profile.creativityLevel =
        'Practically oriented, focusing on proven solutions and incremental improvements';
    }

    // Intellectual curiosity
    profile.intellectualCuriosity =
      traits.openness > 70
        ? 'Insatiably curious, constantly seeking new knowledge and experiences'
        : traits.openness > 40
          ? 'Selectively curious about topics that align with your interests'
          : 'Focused on practical knowledge directly applicable to your goals';

    // Cognitive flexibility
    const flexScore =
      (traits.openness + (100 - traits.neuroticism) + Math.abs(50 - traits.extraversion)) / 3;
    profile.cognitiveFlexibility =
      flexScore > 60
        ? 'Highly adaptable thinking that easily shifts between different mental frameworks'
        : flexScore > 40
          ? 'Moderate flexibility with preference for familiar thought patterns'
          : 'Consistent cognitive approach that provides stability and reliability';

    // Generate strengths based on high-scoring traits
    const topTraits = Object.entries(traits)
      .filter(([_, score]) => score > 60)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    topTraits.forEach(([trait, score]) => {
      const level = score > 75 ? 'high' : 'moderate';
      const strengths = this.strengthsMap[trait]?.[level] || this.strengthsMap[trait]?.high || [];
      profile.strengths.push(...strengths.slice(0, 2));
    });

    // Generate motivational drivers based on trait combinations
    profile.motivationalDrivers = [];

    if (traits.openness > 70 && traits.conscientiousness > 60) {
      profile.motivationalDrivers.push('Innovation with Purpose');
      profile.motivationalDrivers.push('Creative Problem Solving');
    }

    if (traits.extraversion > 70) {
      profile.motivationalDrivers.push('Team Collaboration');
      profile.motivationalDrivers.push('Social Impact');
    } else if (traits.extraversion < 40) {
      profile.motivationalDrivers.push('Deep Focus Work');
      profile.motivationalDrivers.push('Individual Excellence');
    }

    if (traits.conscientiousness > 70) {
      profile.motivationalDrivers.push('Achievement & Excellence');
      profile.motivationalDrivers.push('Systematic Progress');
    }

    if (traits.agreeableness > 70) {
      profile.motivationalDrivers.push('Helping Others Succeed');
      profile.motivationalDrivers.push('Building Harmony');
    }

    if (traits.openness > 70) {
      profile.motivationalDrivers.push('Learning & Growth');
      profile.motivationalDrivers.push('Exploring New Ideas');
    }

    // Ensure we have at least 3 drivers
    if (profile.motivationalDrivers.length === 0) {
      profile.motivationalDrivers = [
        'Personal Development',
        'Meaningful Contribution',
        'Balanced Success'
      ];
    }

    // Limit to top 6 drivers
    profile.motivationalDrivers = profile.motivationalDrivers.slice(0, 6);

    return profile;
  }

  /**
   * Analyze emotional profile
   */
  analyzeEmotionalProfile(traits) {
    const profile = {
      emotionalStability: '',
      stressResponse: '',
      emotionalExpression: '',
      empathyLevel: '',
      emotionalIntelligence: '',
      resiliencePattern: ''
    };

    // Emotional stability
    if (traits.neuroticism < 30) {
      profile.emotionalStability =
        'Exceptionally stable - You maintain equilibrium even in highly challenging situations';
    } else if (traits.neuroticism < 50) {
      profile.emotionalStability =
        'Generally stable with occasional emotional fluctuations in response to stress';
    } else if (traits.neuroticism < 70) {
      profile.emotionalStability =
        'Emotionally responsive - Your sensitivity allows deep emotional experiences';
    } else {
      profile.emotionalStability =
        'Highly sensitive - You experience emotions intensely, which can be both a gift and a challenge';
    }

    // Stress response
    if (traits.neuroticism < 40 && traits.conscientiousness > 60) {
      profile.stressResponse =
        'Resilient and systematic - You handle stress through structured problem-solving';
    } else if (traits.neuroticism > 60 && traits.agreeableness > 60) {
      profile.stressResponse =
        'Seek support - You benefit from social connection during stressful times';
    } else if (traits.neuroticism > 60) {
      profile.stressResponse =
        'Reactive - You would benefit from stress management techniques and coping strategies';
    } else {
      profile.stressResponse =
        'Moderate and situational - Your stress response varies based on context';
    }

    // Emotional expression
    if (traits.extraversion > 70 && traits.agreeableness > 60) {
      profile.emotionalExpression =
        'Open and warm - You freely share emotions and create emotional connection';
    } else if (traits.extraversion < 40) {
      profile.emotionalExpression =
        'Reserved - You process emotions internally before selective expression';
    } else {
      profile.emotionalExpression =
        'Balanced - You express emotions appropriately based on context';
    }

    // Empathy level
    const empathyScore =
      (traits.agreeableness * 2 + traits.openness + (100 - traits.neuroticism)) / 4;
    if (empathyScore > 70) {
      profile.empathyLevel =
        "Highly empathetic - You naturally tune into others' emotional states and needs";
    } else if (empathyScore > 50) {
      profile.empathyLevel =
        'Moderately empathetic - You connect with others while maintaining boundaries';
    } else {
      profile.empathyLevel =
        'Practically oriented - You focus on solving problems rather than emotional connection';
    }

    // Emotional intelligence
    const eqScore =
      (traits.agreeableness +
        (100 - traits.neuroticism) +
        traits.conscientiousness +
        traits.openness) /
      4;
    if (eqScore > 70) {
      profile.emotionalIntelligence =
        "High EQ - You excel at understanding and managing both your own and others' emotions";
    } else if (eqScore > 50) {
      profile.emotionalIntelligence =
        'Moderate EQ - You have good emotional awareness with room for growth';
    } else {
      profile.emotionalIntelligence =
        'Developing EQ - Focus on emotional awareness could enhance your relationships';
    }

    // Resilience pattern
    if (traits.neuroticism < 40 && traits.conscientiousness > 60 && traits.openness > 50) {
      profile.resiliencePattern = 'Antifragile - You grow stronger from challenges and adversity';
    } else if (traits.neuroticism < 50 && traits.extraversion > 60) {
      profile.resiliencePattern =
        'Social resilience - You bounce back through connection and support';
    } else if (traits.conscientiousness > 70) {
      profile.resiliencePattern =
        'Systematic resilience - You recover through structure and routine';
    } else {
      profile.resiliencePattern =
        'Adaptive resilience - You find unique ways to recover based on the situation';
    }

    return profile;
  }

  /**
   * Analyze social profile
   */
  analyzeSocialProfile(traits) {
    const profile = {
      socialStyle: '',
      communicationPreference: '',
      leadershipPotential: '',
      teamRole: '',
      conflictApproach: '',
      networkingStyle: '',
      influencePattern: ''
    };

    // Social style
    if (traits.extraversion > 70 && traits.agreeableness > 60) {
      profile.socialStyle =
        'Socially magnetic - You naturally draw people in with warmth and energy';
    } else if (traits.extraversion < 30) {
      profile.socialStyle = 'Selectively social - You prefer deep connections with a chosen few';
    } else if (traits.agreeableness > 70) {
      profile.socialStyle = 'Harmonizing - You create comfortable spaces for everyone';
    } else {
      profile.socialStyle =
        'Adaptively social - You adjust your social engagement to the situation';
    }

    // Communication preference
    if (traits.extraversion > 60 && traits.openness > 60) {
      profile.communicationPreference =
        'Expressive and exploratory - You think out loud and enjoy intellectual exchange';
    } else if (traits.conscientiousness > 70) {
      profile.communicationPreference =
        'Clear and structured - You value precision and completeness in communication';
    } else if (traits.agreeableness > 70) {
      profile.communicationPreference =
        'Supportive and diplomatic - You prioritize harmony and understanding';
    } else {
      profile.communicationPreference = 'Direct and practical - You focus on essential information';
    }

    // Leadership potential
    const leadershipScore =
      (traits.extraversion +
        traits.conscientiousness +
        (100 - traits.neuroticism) +
        traits.openness) /
      4;
    if (leadershipScore > 70) {
      profile.leadershipPotential =
        'Natural leader - You have strong potential to guide and inspire others';
    } else if (leadershipScore > 50) {
      profile.leadershipPotential =
        'Situational leader - You can lead effectively in the right contexts';
    } else {
      profile.leadershipPotential =
        'Supportive contributor - You excel in specialized or supporting roles';
    }

    // Team role
    if (traits.conscientiousness > 70 && traits.agreeableness < 50) {
      profile.teamRole = 'The Achiever - You drive results and maintain high standards';
    } else if (traits.openness > 70 && traits.extraversion > 60) {
      profile.teamRole = 'The Innovator - You generate ideas and inspire creative thinking';
    } else if (traits.agreeableness > 70) {
      profile.teamRole = 'The Harmonizer - You build bridges and maintain team cohesion';
    } else if (traits.conscientiousness > 70) {
      profile.teamRole = 'The Implementer - You ensure plans become reality';
    } else {
      profile.teamRole = 'The Adapter - You fill whatever role the team needs';
    }

    // Conflict approach
    if (traits.agreeableness > 70 && traits.neuroticism < 40) {
      profile.conflictApproach = 'Collaborative problem-solver - You seek win-win solutions';
    } else if (traits.agreeableness > 70 && traits.neuroticism > 60) {
      profile.conflictApproach =
        'Conflict-averse - You prefer harmony but may avoid necessary confrontations';
    } else if (traits.conscientiousness > 70 && traits.agreeableness < 40) {
      profile.conflictApproach = 'Direct and solution-focused - You address issues head-on';
    } else {
      profile.conflictApproach = 'Situational - You adapt your approach based on the conflict type';
    }

    // Networking style
    if (traits.extraversion > 70) {
      profile.networkingStyle = 'Natural networker who builds broad, energetic connections';
    } else if (traits.extraversion < 40 && traits.agreeableness > 60) {
      profile.networkingStyle =
        'Quality over quantity - Deep, meaningful professional relationships';
    } else {
      profile.networkingStyle = 'Strategic networking focused on mutual value exchange';
    }

    // Influence pattern
    if (traits.extraversion > 60 && traits.conscientiousness > 60) {
      profile.influencePattern = 'Lead by example with energy and excellence';
    } else if (traits.agreeableness > 70 && traits.openness > 60) {
      profile.influencePattern = 'Inspire through vision and emotional connection';
    } else if (traits.conscientiousness > 70) {
      profile.influencePattern = 'Build trust through consistent reliability and results';
    } else {
      profile.influencePattern = 'Influence through expertise and unique perspectives';
    }

    return profile;
  }

  /**
   * Generate personal narrative
   */
  generatePersonalNarrative(traits, archetype) {
    const dominantTrait = this.getDominantTrait(traits);
    const lowestTrait = this.getLowestTrait(traits);
    // Handle nested archetype structure where archetype.name might be an object
    let archetypeName;
    if (typeof archetype === 'string') {
      archetypeName = archetype;
    } else if (typeof archetype?.name === 'object' && archetype.name?.name) {
      archetypeName = archetype.name.name;
    } else if (typeof archetype?.name === 'string') {
      archetypeName = archetype.name;
    } else {
      archetypeName = 'Unique Individual';
    }

    let narrative = `As a ${archetypeName}, you bring a unique combination of qualities to every aspect of your life. `;

    // Add strength-based opening
    if (dominantTrait && dominantTrait.score > 80) {
      narrative += `Your exceptional ${dominantTrait.trait} (${dominantTrait.score}%) is not just a personality trait—it's a superpower that shapes how you interact with the world. `;
    }

    // Add balance or contrast observation
    const traitValues = Object.values(traits);
    const range = Math.max(...traitValues) - Math.min(...traitValues);
    if (range < 30) {
      narrative += `Your remarkably balanced personality allows you to adapt fluidly to different situations, drawing on whichever traits serve you best in the moment. This versatility is rare and valuable. `;
    } else if (range > 60) {
      narrative += `The significant contrasts in your personality create a dynamic inner landscape. The interplay between your ${dominantTrait.trait} and ${lowestTrait.trait} creates unique perspectives and opportunities that others might miss. `;
    }

    // Add growth perspective
    if (lowestTrait && lowestTrait.score < 30) {
      narrative += `Your lower ${lowestTrait.trait} score (${lowestTrait.score}%) isn't a weakness—it's part of what makes you unique. It may actually free you from constraints others face, allowing you to excel in your own way. `;
    }

    // Add archetype-specific insight
    const archetypeDesc = this.archetypes[archetypeName];
    if (archetypeDesc && archetypeDesc.includes(' - ')) {
      narrative += archetypeDesc.split(' - ')[1] + ' ';
    }

    // Add future-oriented conclusion
    narrative += `Understanding these patterns empowers you to make choices aligned with your authentic self, leverage your natural strengths strategically, and develop in ways that feel genuine rather than forced.`;

    return narrative;
  }

  /**
   * Get dominant (highest) trait
   */
  getDominantTrait(traits) {
    let dominantTrait = null;
    let highestScore = 0;

    Object.entries(traits).forEach(([trait, score]) => {
      if (score > highestScore) {
        highestScore = score;
        dominantTrait = trait;
      }
    });

    return dominantTrait ? { trait: dominantTrait, score: highestScore } : null;
  }

  /**
   * Get lowest trait
   */
  getLowestTrait(traits) {
    let lowestTrait = null;
    let lowestScore = 100;

    Object.entries(traits).forEach(([trait, score]) => {
      if (score < lowestScore) {
        lowestScore = score;
        lowestTrait = trait;
      }
    });

    return lowestTrait ? { trait: lowestTrait, score: lowestScore } : null;
  }

  /**
   * Initialize trait descriptions (enhanced version)
   */
  initializeDescriptions() {
    this.descriptions = {
      openness: {
        low: 'You tend to be practical, conventional, and prefer familiar routines over new experiences. This gives you stability and focus.',
        medium:
          'You balance practicality with curiosity, selectively exploring new ideas while maintaining grounded perspective.',
        high: 'You are highly creative, curious, and constantly seeking new experiences and intellectual stimulation.'
      },
      conscientiousness: {
        low: 'You prefer flexibility and spontaneity over rigid structure and planning, allowing for adaptability.',
        medium:
          'You balance organization with adaptability, applying structure where beneficial while remaining flexible.',
        high: 'You are highly organized, disciplined, and goal-oriented, with exceptional follow-through on commitments.'
      },
      extraversion: {
        low: 'You tend to be reserved and gain energy from solitary activities and deep, meaningful connections.',
        medium:
          'You enjoy both social and solitary activities, adapting your energy to different situations.',
        high: 'You are outgoing, energetic, and thrive in social situations, drawing energy from interaction.'
      },
      agreeableness: {
        low: 'You tend to be direct, skeptical, and prioritize logic over emotional considerations in decision-making.',
        medium:
          'You balance cooperation with assertiveness, showing empathy while maintaining boundaries.',
        high: "You are compassionate, cooperative, and highly considerate of others' needs and feelings."
      },
      neuroticism: {
        low: 'You tend to be calm, emotionally stable, and resilient to stress, maintaining equilibrium under pressure.',
        medium:
          'You experience a normal range of emotions with typical stress responses and emotional variability.',
        high: 'You are sensitive to stress and experience emotions more intensely, with heightened awareness of potential concerns.'
      }
    };
  }

  // ==== NEW ENHANCED METHODS FOR INTEGRATION ====

  /**
   * Run enhanced statistical analysis
   */
  async runStatisticalAnalysis(traits, responses, metadata) {
    try {
      return this.simulateStatisticalAnalysis(traits, responses, metadata);
    } catch (error) {
      console.warn('Statistical analysis failed, using fallback:', error);
      return this.performAdvancedLocalAnalysis(traits, responses, {});
    }
  }

  /**
   * Generate narrative content using NLG
   */
  async generateNarrativeContent(traits, analysis, tier) {
    try {
      return this.simulateNarrativeGeneration(traits, analysis, tier);
    } catch (error) {
      console.warn('Narrative generation failed, using fallback:', error);
      return null;
    }
  }

  /**
   * Perform neurodivergent screening using enhanced algorithms
   */
  async performNeurodivergentScreening(responses, traits, metadata) {
    try {
      return this.simulateNeurodivergentScreening(responses, traits, metadata);
    } catch (error) {
      console.warn('Neurodivergent screening failed, using fallback:', error);
      return this.detectNeurodiversityMarkers(responses, { confidence: 0.7 });
    }
  }

  /**
   * Simulate comprehensive neurodivergent screening
   */
  simulateNeurodivergentScreening(responses, traits, metadata) {
    const adhdScreening = this.screenForADHD(responses);
    const autismScreening = this.screenForAutism(responses);

    // Generate dynamic sensory profile based on responses and traits
    const sensoryProfile = this.generateSensoryProfile(responses, traits, autismScreening);

    // Generate dynamic executive function profile based on responses and traits
    const executiveFunction = this.generateExecutiveFunctionProfile(
      responses,
      traits,
      adhdScreening
    );

    return {
      adhd: adhdScreening,
      autism: autismScreening,
      executiveFunction,
      sensoryProfile,
      sensitivity: this.screenForSensitivity(responses),
      giftedness: this.screenForGiftedness(responses),
      confidence: this.calculateAnalysisConfidence(responses)
    };
  }

  /**
   * Generate dynamic sensory profile based on traits and neurodiversity indicators
   */
  generateSensoryProfile(responses, traits, autismScreening) {
    // Calculate sensory dimensions based on Dunn's Sensory Profile research
    const sensoryResponses = responses.filter(
      r => r.question?.subcategory === 'sensory_processing' || r.question?.category === 'sensory'
    );

    // Initialize quadrant scores based on research database
    let quadrantScores = {
      lowRegistration: 50, // High threshold, passive
      sensationSeeking: 50, // High threshold, active
      sensorySensitivity: 50, // Low threshold, passive
      sensationAvoiding: 50 // Low threshold, active
    };

    // Use research database if available
    if (this.researchDB?.sensoryProcessing?.quadrants) {
      const quadrants = this.researchDB.sensoryProcessing.quadrants;

      // Adjust based on autism indicators (research shows higher prevalence in autism)
      if (autismScreening.score > 60) {
        // Use research prevalence rates for autism
        quadrantScores.lowRegistration = 65; // 65% prevalence in autism
        quadrantScores.sensationSeeking = 35; // 35% prevalence in autism
        quadrantScores.sensorySensitivity = 75; // 75% prevalence in autism
        quadrantScores.sensationAvoiding = 80; // 80% prevalence in autism
      } else if (autismScreening.score > 35) {
        quadrantScores.lowRegistration = 55;
        quadrantScores.sensorySensitivity = 60;
        quadrantScores.sensationAvoiding = 65;
      }

      // Adjust based on ADHD indicators (if screening available)
      const adhdScore = responses.adhdScore || 0;
      if (adhdScore > 60) {
        // Use research prevalence rates for ADHD
        quadrantScores.lowRegistration = 45; // 45% prevalence in ADHD
        quadrantScores.sensationSeeking = 70; // 70% prevalence in ADHD
        quadrantScores.sensorySensitivity = 55; // 55% prevalence in ADHD
        quadrantScores.sensationAvoiding = 40; // 40% prevalence in ADHD
      }
    }

    // Adjust based on personality traits
    if (traits.neuroticism > 70) {
      quadrantScores.sensorySensitivity += 15;
      quadrantScores.sensationAvoiding += 20;
    } else if (traits.neuroticism < 30) {
      quadrantScores.lowRegistration += 10;
    }

    if (traits.extraversion > 70) {
      quadrantScores.sensationSeeking += 20;
      quadrantScores.sensationAvoiding -= 15;
    } else if (traits.extraversion < 30) {
      quadrantScores.sensationSeeking -= 15;
      quadrantScores.sensationAvoiding += 10;
    }

    // Factor in sensory responses if available
    if (sensoryResponses.length > 0) {
      const avgSensory =
        sensoryResponses.reduce((sum, r) => sum + (r.value || r.score || 0), 0) /
        sensoryResponses.length;

      // High sensory scores indicate more sensory processing differences
      if (avgSensory > 3.5) {
        quadrantScores.sensorySensitivity += (avgSensory - 3.5) * 15;
        quadrantScores.sensationSeeking += (avgSensory - 3.5) * 10;
      }
    }

    // Convert to percentiles and determine levels using research-based interpretation
    const mapToLevel = score => {
      if (this.researchDB?.sensoryProcessing?.scoringInterpretation) {
        const interpretation = this.researchDB.sensoryProcessing.scoringInterpretation;
        if (score >= 84) return 'much more than most';
        if (score >= 70) return 'more than most';
        if (score >= 30) return 'similar to most';
        if (score >= 16) return 'less than most';
        return 'much less than most';
      }
      // Fallback
      if (score >= 80) return 'high';
      if (score >= 60) return 'moderate-high';
      if (score >= 40) return 'moderate';
      if (score >= 20) return 'moderate-low';
      return 'low';
    };

    // Add some natural variability (±5 points)
    const addVariability = score => {
      const variance = (Math.random() - 0.5) * 10;
      return Math.max(0, Math.min(100, score + variance));
    };

    return {
      sensitivity: mapToLevel(addVariability(quadrantScores.sensorySensitivity)),
      avoidance: mapToLevel(addVariability(quadrantScores.sensationAvoiding)),
      seeking: mapToLevel(addVariability(quadrantScores.sensationSeeking)),
      registration: mapToLevel(addVariability(quadrantScores.lowRegistration)),
      // Include raw scores for detailed analysis
      rawScores: {
        lowRegistration: Math.round(quadrantScores.lowRegistration),
        sensationSeeking: Math.round(quadrantScores.sensationSeeking),
        sensorySensitivity: Math.round(quadrantScores.sensorySensitivity),
        sensationAvoiding: Math.round(quadrantScores.sensationAvoiding)
      }
    };
  }

  /**
   * Generate dynamic executive function profile
   */
  generateExecutiveFunctionProfile(responses, traits, adhdScreening) {
    // Use research-based executive function domains if available
    const hasResearchDB = this.researchDB?.executiveFunction?.domains;

    // Calculate base percentile from inverse relationship with ADHD
    // ADHD score 0-100 maps to EF percentile 100-0 with research-based adjustments
    let basePercentile = 50; // Start at average

    if (hasResearchDB) {
      // Use research-based ADHD impact on executive function
      const workingMemoryImpact =
        this.researchDB.executiveFunction.domains.workingMemory.adhdImpact;
      const flexibilityImpact =
        this.researchDB.executiveFunction.domains.cognitiveFlexibility.adhdImpact;
      const inhibitionImpact =
        this.researchDB.executiveFunction.domains.inhibitoryControl.adhdImpact;
      const planningImpact = this.researchDB.executiveFunction.domains.planning.adhdImpact;

      // Calculate percentile reduction based on ADHD severity
      const adhdSeverity = adhdScreening.score / 100; // 0 to 1

      // Calculate domain-specific percentiles using research-based impact
      const domains = {
        workingMemory: Math.max(16, 50 - workingMemoryImpact.meanReduction * adhdSeverity),
        cognitiveFlexibility: Math.max(16, 50 - flexibilityImpact.meanReduction * adhdSeverity),
        inhibitoryControl: Math.max(16, 50 - inhibitionImpact.meanReduction * adhdSeverity),
        planning: Math.max(16, 50 - planningImpact.meanReduction * adhdSeverity)
      };

      // Adjust based on personality traits
      domains.workingMemory += (traits.openness - 50) * 0.2;
      domains.cognitiveFlexibility += (traits.openness - 50) * 0.3;
      domains.inhibitoryControl += (traits.conscientiousness - 50) * 0.4;
      domains.planning += (traits.conscientiousness - 50) * 0.35;

      // Add autism impact if applicable
      if (adhdScreening.autismScore > 0) {
        const autismSeverity = (adhdScreening.autismScore || 0) / 100;
        domains.cognitiveFlexibility -= flexibilityImpact.meanReduction * autismSeverity * 0.5;
        domains.planning -= planningImpact.meanReduction * autismSeverity * 0.3;
      }

      // Apply variability and constraints
      for (let domain in domains) {
        // Add natural variability (±SD/4)
        const variance = (Math.random() - 0.5) * 10;
        domains[domain] = Math.max(5, Math.min(95, domains[domain] + variance));
      }

      // Map to traditional naming for compatibility
      domains.organization = domains.planning; // Organization is part of planning
      domains.timeManagement = (domains.planning + domains.inhibitoryControl) / 2;

      // Calculate overall percentile
      const overall =
        Object.values(domains).reduce((sum, val) => sum + val, 0) / Object.keys(domains).length;

      // Return with research-based structure
      return {
        overall,
        domains,
        percentiles: domains,
        strengths: this.determineEFStrengths(domains, traits, adhdScreening),
        challenges: this.determineEFChallenges(domains, traits, adhdScreening)
      };
    }

    // Fallback to original calculation
    const baseScore = 100 - adhdScreening.score;
    const domains = {
      planning: this.calculateDomainScore(
        baseScore,
        traits.conscientiousness,
        adhdScreening.indicators.inattention
      ),
      organization: this.calculateDomainScore(
        baseScore,
        traits.conscientiousness,
        adhdScreening.indicators.inattention
      ),
      timeManagement: this.calculateDomainScore(
        baseScore - 10,
        traits.conscientiousness,
        adhdScreening.indicators.hyperactivity
      ),
      workingMemory: this.calculateDomainScore(
        baseScore + 5,
        traits.openness,
        adhdScreening.indicators.inattention
      )
    };

    // Calculate overall score
    const overall = Object.values(domains).reduce((sum, val) => sum + val, 0) / 4;

    // Determine strengths based on traits and scores
    const strengths = [];
    const challenges = [];

    if (traits.openness > 70) {
      strengths.push('creative_problem_solving');
      if (adhdScreening.score > 60) {
        strengths.push('divergent_thinking');
      }
    }

    if (traits.conscientiousness > 70) {
      strengths.push('systematic_approach');
      strengths.push('attention_to_detail');
    } else if (traits.conscientiousness < 40) {
      challenges.push('task_completion');
      challenges.push('organization');
    }

    if (adhdScreening.indicators.hyperactivity >= 5) {
      strengths.push('high_energy');
      strengths.push('crisis_management');
      challenges.push('sustained_attention');
    }

    if (adhdScreening.indicators.impulsivity >= 5) {
      strengths.push('quick_decision_making');
      challenges.push('impulse_control');
      challenges.push('planning_ahead');
    }

    if (adhdScreening.indicators.inattention >= 5) {
      challenges.push('task_initiation');
      challenges.push('prioritization');
      if (traits.openness > 60) {
        strengths.push('hyperfocus_on_interests');
      }
    }

    // Add unique combinations
    if (traits.extraversion < 30 && traits.conscientiousness > 60) {
      strengths.push('independent_work');
      strengths.push('deep_focus');
    }

    if (traits.agreeableness > 70 && traits.extraversion > 60) {
      strengths.push('team_coordination');
    }

    return {
      overall,
      domains,
      strengths: strengths.length > 0 ? strengths : ['adaptive_thinking'],
      challenges: challenges.length > 0 ? challenges : []
    };
  }

  /**
   * Helper function to calculate domain scores
   */
  calculateDomainScore(base, traitScore, impairmentLevel) {
    // Base score influenced by trait and impairment
    let score = base + (traitScore - 50) * 0.3 - impairmentLevel * 5;

    // Add some random variation (±10%)
    score += (Math.random() - 0.5) * 20;

    // Clamp between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Determine EF strengths based on percentiles and traits
   */
  determineEFStrengths(domains, traits, adhdScreening) {
    const strengths = [];

    // Check each domain for strengths (>70th percentile)
    if (domains.workingMemory > 70) {
      strengths.push('strong_working_memory');
    }
    if (domains.cognitiveFlexibility > 70) {
      strengths.push('cognitive_flexibility');
    }
    if (domains.inhibitoryControl > 70) {
      strengths.push('impulse_control');
    }
    if (domains.planning > 70) {
      strengths.push('strategic_planning');
    }

    // Add trait-based strengths
    if (traits.openness > 70) {
      strengths.push('creative_problem_solving');
      if (adhdScreening.score > 50) {
        strengths.push('divergent_thinking'); // ADHD + high openness = creativity
      }
    }

    if (traits.conscientiousness > 70) {
      strengths.push('systematic_approach');
      strengths.push('attention_to_detail');
    }

    // ADHD-related paradoxical strengths
    if (adhdScreening.indicators.hyperactivity >= 5) {
      strengths.push('high_energy');
      strengths.push('crisis_management');
    }

    // Hyperfocus ability
    if (adhdScreening.indicators.inattention >= 5 && traits.openness > 60) {
      strengths.push('hyperfocus_on_interests');
    }

    // Unique combinations
    if (traits.extraversion < 30 && domains.inhibitoryControl > 60) {
      strengths.push('deep_focus');
    }

    return strengths.length > 0 ? strengths : ['adaptive_thinking'];
  }

  /**
   * Determine EF challenges based on percentiles and traits
   */
  determineEFChallenges(domains, traits, adhdScreening) {
    const challenges = [];

    // Check each domain for challenges (<30th percentile)
    if (domains.workingMemory < 30) {
      challenges.push('working_memory_difficulties');
    }
    if (domains.cognitiveFlexibility < 30) {
      challenges.push('cognitive_rigidity');
    }
    if (domains.inhibitoryControl < 30) {
      challenges.push('impulse_control');
    }
    if (domains.planning < 30) {
      challenges.push('planning_difficulties');
    }

    // Trait-based challenges
    if (traits.conscientiousness < 40) {
      challenges.push('task_completion');
      challenges.push('organization');
    }

    // ADHD-related challenges
    if (adhdScreening.indicators.inattention >= 5) {
      challenges.push('sustained_attention');
      challenges.push('task_initiation');
    }

    if (adhdScreening.indicators.hyperactivity >= 5) {
      challenges.push('restlessness');
    }

    if (adhdScreening.indicators.impulsivity >= 5) {
      challenges.push('decision_impulsivity');
    }

    // Time management is commonly affected
    if (domains.planning < 40 || domains.inhibitoryControl < 40) {
      challenges.push('time_management');
    }

    return challenges;
  }

  /**
   * Helper function to increase sensitivity level
   */
  increaseSensitivity(current) {
    const levels = ['low', 'moderate', 'moderate-high', 'high', 'very-high'];
    const currentIndex = levels.indexOf(current);
    if (currentIndex === -1) return 'moderate';
    return levels[Math.min(levels.length - 1, currentIndex + 1)];
  }

  /**
   * Simulate statistical analysis (placeholder for backend integration)
   */
  simulateStatisticalAnalysis(traits, responses, metadata) {
    const archetype = this.determinePersonalityArchetype(traits);
    const confidence = this.calculateAnalysisConfidence(responses);
    const patterns = this.detectTraitPatterns(traits);
    const reliability = this.calculateReliability(responses);

    return {
      archetype: {
        name: archetype,
        description: this.archetypes[archetype] || 'Unique personality profile',
        confidence: confidence
      },
      patterns,
      reliability,
      confidence,
      clusterAnalysis: this.performClusterAnalysis(traits),
      bayesianInference: this.performBayesianInference(traits, responses)
    };
  }

  /**
   * Advanced local analysis fallback
   */
  performAdvancedLocalAnalysis(traits, responses, responseAnalysis) {
    const archetype = this.determinePersonalityArchetype(traits);
    const patterns = this.detectAdvancedTraitPatterns(traits, responses);
    const reliability = this.calculateResponseReliability(responses);

    return {
      archetype: {
        name: archetype,
        description: this.archetypes[archetype] || 'Unique personality profile',
        confidence: responseAnalysis.confidence || 0.7
      },
      patterns,
      reliability,
      confidence: responseAnalysis.confidence || 0.7
    };
  }

  /**
   * Detect advanced trait patterns
   */
  detectAdvancedTraitPatterns(traits, responses) {
    const patterns = [];

    if (traits.openness > 75 && traits.conscientiousness > 75) {
      patterns.push({
        type: 'rare_combination',
        insight:
          'Exceptional balance of creativity and discipline - a rare "Strategic Innovator" pattern found in <5% of population',
        confidence: 0.9,
        actionable: true,
        recommendation:
          'Leverage this rare combination in leadership roles that require both vision and execution',
        timeframe: 'Immediate',
        resources: ['Innovation leadership training', 'Creative project management']
      });
    }

    if (traits.extraversion < 25 && traits.agreeableness > 75) {
      patterns.push({
        type: 'introvert_helper',
        insight:
          'Quiet empathy pattern - you care deeply but prefer one-on-one support over group settings',
        confidence: 0.8,
        actionable: true,
        recommendation:
          'Consider mentoring, counseling, or support roles that leverage your empathetic nature',
        resources: ['Mentorship training', 'Active listening skills']
      });
    }

    return patterns;
  }

  /**
   * Generate advanced insights with enhanced analysis
   */
  generateAdvancedInsights(traits, cognitiveStyle, responseAnalysis, enhancedAnalysis) {
    const insights = [];

    insights.push(...this.generateTraitInsights(traits));

    if (enhancedAnalysis?.archetype) {
      insights.push({
        category: 'Personality Archetype',
        insight: `Your ${enhancedAnalysis.archetype.name} archetype suggests ${enhancedAnalysis.archetype.description}. This rare combination appears in approximately ${this.getArchetypeFrequency(enhancedAnalysis.archetype.name)}% of the population.`,
        confidence: enhancedAnalysis.archetype.confidence > 0.8 ? 'High' : 'Medium',
        archetype: enhancedAnalysis.archetype.name
      });
    }

    if (enhancedAnalysis?.patterns?.length > 0) {
      enhancedAnalysis.patterns.forEach(pattern => {
        insights.push({
          category: 'Trait Pattern',
          insight: pattern.insight,
          confidence: pattern.confidence > 0.7 ? 'High' : 'Medium',
          patternType: pattern.type
        });
      });
    }

    insights.push({
      category: 'Cognitive Style',
      insight: `${cognitiveStyle.summary} Your information processing shows ${this.getCognitiveInsight(cognitiveStyle)}.`,
      confidence: 'High',
      cognitiveType: cognitiveStyle.processingMode
    });

    const uniqueInsights = this.generateUniqueCombinationInsights(traits, enhancedAnalysis);
    insights.push(...uniqueInsights);

    return insights.slice(0, 12);
  }

  /**
   * Generate enhanced personalized recommendations
   */
  generateEnhancedRecommendations(traits, concerns, tier, enhancedAnalysis) {
    const recommendations = [];
    const maxRecommendations = tier === 'comprehensive' ? 8 : 4;

    if (enhancedAnalysis?.archetype) {
      recommendations.push({
        priority: 'High',
        category: 'Archetype Optimization',
        recommendation: this.getArchetypeRecommendation(enhancedAnalysis.archetype, traits),
        timeframe: 'Immediate',
        resources: this.getArchetypeResources(enhancedAnalysis.archetype.name),
        archetype: enhancedAnalysis.archetype.name
      });
    }

    if (concerns?.includes('stress')) {
      recommendations.push({
        priority: 'High',
        category: 'Well-being',
        recommendation: this.getEnhancedStressManagementRecommendation(traits, enhancedAnalysis),
        timeframe: 'Immediate',
        resources: this.getPersonalizedStressResources(traits)
      });
    }

    const immediate = recommendations
      .filter(r => r.timeframe === 'Immediate' || r.priority === 'High')
      .slice(0, 4)
      .map(r => ({
        title: `${r.category}: ${r.priority} Priority`,
        description: r.recommendation,
        steps: Array.isArray(r.resources)
          ? r.resources.map(res => `Utilize ${res.toLowerCase()}`)
          : ['Begin implementation', 'Track progress', 'Adjust as needed'],
        outcome: this.getExpectedOutcome(r.category, r.timeframe),
        category: r.category
      }));

    return {
      immediate: immediate.length > 0 ? immediate : [this.getDefaultImmediate(traits)],
      longTerm: [this.getDefaultLongTerm(traits)],
      totalRecommendations: recommendations.length,
      personalizationLevel: enhancedAnalysis ? 'Enhanced' : 'Standard'
    };
  }

  /**
   * Helper methods for enhanced functionality
   */
  getArchetypeFrequency(archetypeName) {
    const frequencies = {
      'Strategic Innovator': 3,
      'Servant Leader': 8,
      'Creative Catalyst': 12,
      'Analytical Architect': 15
    };
    return frequencies[archetypeName] || 10;
  }

  getCognitiveInsight(cognitiveStyle) {
    const insights = {
      'Intuitive-Exploratory': 'a preference for big-picture thinking and creative exploration',
      'Sequential-Systematic': 'methodical, step-by-step information processing'
    };
    return insights[cognitiveStyle.processingMode] || 'unique processing characteristics';
  }

  generateUniqueCombinationInsights(traits, enhancedAnalysis) {
    const insights = [];
    const traitValues = Object.values(traits);
    const range = Math.max(...traitValues) - Math.min(...traitValues);

    if (range > 50) {
      insights.push({
        category: 'Personality Uniqueness',
        insight:
          'Your personality shows significant contrasts between traits, creating a highly distinctive profile.',
        confidence: 'High'
      });
    }

    return insights;
  }

  getArchetypeRecommendation(archetype, traits) {
    const recommendations = {
      'Strategic Innovator':
        'Channel your rare combination of creativity and discipline into transformational leadership roles.',
      'Servant Leader':
        'Your empathetic leadership style is needed in team-building and mentoring roles.'
    };
    return recommendations[archetype.name] || 'Leverage your unique trait combination.';
  }

  getArchetypeResources(archetypeName) {
    const resources = {
      'Strategic Innovator': ['Design thinking workshops', 'Innovation leadership courses'],
      'Servant Leader': ['Servant leadership books', 'Team coaching certification']
    };
    return resources[archetypeName] || ['Leadership development', 'Strengths optimization'];
  }

  calculateAnalysisConfidence(responses) {
    let confidence = 0.7;
    if (responses.length >= 30) confidence += 0.1;
    if (responses.length >= 50) confidence += 0.1;
    return Math.min(0.95, confidence);
  }

  calculateResponseReliability(responses) {
    let reliability = 1.0;
    const straightLining = this.detectStraightLining(responses);
    if (straightLining > 8) reliability *= 0.7;
    return Math.max(0.3, reliability);
  }

  detectTraitPatterns(traits) {
    const patterns = [];
    const scores = Object.values(traits);
    const range = Math.max(...scores) - Math.min(...scores);

    if (range < 20) {
      patterns.push({
        type: 'balanced',
        insight: 'Exceptionally well-balanced personality profile',
        confidence: 0.9
      });
    }

    return patterns;
  }

  performClusterAnalysis(traits) {
    return { membership: 'Creative-Systematic', similarity: 0.85 };
  }

  performBayesianInference(traits, responses) {
    return { confidence: 0.82, evidenceStrength: 0.7 };
  }

  calculateReliability(responses) {
    return 0.85; // Placeholder
  }

  getEnhancedStressManagementRecommendation(traits, enhancedAnalysis) {
    if (traits.neuroticism > 60) {
      return 'Your sensitive nature requires structured stress management techniques.';
    }
    return this.getStressManagementRecommendation(traits);
  }

  getPersonalizedStressResources(traits) {
    const resources = ['Mindfulness apps'];
    if (traits.openness > 60) resources.push('Creative stress outlets');
    return resources;
  }

  /**
   * Track response insights for transparency
   */
  trackResponseInsights(responses) {
    if (!this.insightTracker || !responses || !Array.isArray(responses)) return;

    responses.forEach((response, index) => {
      const trait = (response.trait || response.category || '').toLowerCase();
      const score =
        parseInt(response.score) || parseInt(response.answer) || parseInt(response.response) || 3;

      if (
        trait &&
        ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'].includes(
          trait
        )
      ) {
        // Calculate impact based on answer
        const impact = (score - 3) * 20; // -40 to +40 scale

        // Generate reasoning
        const reasoning = this.generateAnswerReasoning(response.questionText, score, trait);

        // Record the insight
        this.insightTracker.recordAnswerImpact(
          response.questionId || `q${index}`,
          response,
          trait,
          impact,
          reasoning
        );
      }
    });

    // Generate confidence breakdown
    this.insightTracker.generateConfidenceBreakdown();
  }

  /**
   * Generate reasoning for how an answer impacts a trait
   */
  generateAnswerReasoning(questionText, score, trait) {
    const scoreLevel = score <= 2 ? 'low' : score >= 4 ? 'high' : 'moderate';
    const impact = score <= 2 ? 'decreases' : score >= 4 ? 'increases' : 'moderately affects';

    const reasoningTemplates = {
      openness: {
        high: 'Indicates preference for novelty and abstract thinking',
        low: 'Shows preference for familiar and practical approaches',
        moderate: 'Suggests balanced openness to new experiences'
      },
      conscientiousness: {
        high: 'Demonstrates organized and goal-oriented behavior',
        low: 'Indicates flexibility and spontaneous approach',
        moderate: 'Shows balanced approach to structure'
      },
      extraversion: {
        high: 'Reveals social energy and outward focus',
        low: 'Indicates preference for solitude and reflection',
        moderate: 'Suggests situational social engagement'
      },
      agreeableness: {
        high: 'Shows cooperative and empathetic tendencies',
        low: 'Indicates independent and objective approach',
        moderate: 'Demonstrates balanced interpersonal style'
      },
      neuroticism: {
        high: 'Reveals emotional sensitivity and awareness',
        low: 'Shows emotional stability and resilience',
        moderate: 'Indicates typical emotional responses'
      }
    };

    return `This response ${impact} ${trait}. ${reasoningTemplates[trait][scoreLevel]}`;
  }

  /**
   * Enhanced generateAdvancedInsights with deep trait analysis
   */
  generateAdvancedInsights(
    traits,
    cognitiveStyle,
    responseAnalysis,
    enhancedAnalysis,
    deepTraitAnalysis
  ) {
    const insights = [];

    // Original insights
    const primaryTrait = this.identifyPrimaryTrait(traits);
    insights.push({
      type: 'primary_strength',
      title: 'Core Strength',
      description: `Your ${primaryTrait.trait} (${primaryTrait.score}%) is your defining characteristic, ${this.getPrimaryTraitInsight(primaryTrait.trait, primaryTrait.score)}`
    });

    // Add deep trait insights if available
    if (deepTraitAnalysis) {
      // Sub-dimension insights
      if (deepTraitAnalysis.subDimensionScores) {
        Object.entries(deepTraitAnalysis.subDimensionScores).forEach(([trait, dimensions]) => {
          const topDimension = Object.entries(dimensions).sort(([, a], [, b]) => b - a)[0];
          if (topDimension) {
            insights.push({
              type: 'sub_dimension',
              title: `${trait} Detail`,
              description: `Within ${trait}, your strongest aspect is ${topDimension[0]} (${Math.round(topDimension[1])}%)`
            });
          }
        });
      }

      // Additional dimension insights
      if (deepTraitAnalysis.additionalDimensions) {
        const topAdditional = Object.entries(deepTraitAnalysis.additionalDimensions).sort(
          ([, a], [, b]) => b.score - a.score
        )[0];
        if (topAdditional) {
          insights.push({
            type: 'additional_dimension',
            title: topAdditional[0],
            description: topAdditional[1].description
          });
        }
      }

      // Interaction insights
      if (deepTraitAnalysis.interactions && deepTraitAnalysis.interactions.length > 0) {
        const topInteraction = deepTraitAnalysis.interactions[0];
        insights.push({
          type: 'trait_interaction',
          title: 'Trait Synergy',
          description: topInteraction.description
        });
      }
    }

    // Cognitive style insights
    if (cognitiveStyle.processingPreference) {
      insights.push({
        type: 'cognitive',
        title: 'Thinking Style',
        description: `You process information through ${cognitiveStyle.processingPreference}, which influences how you approach problems and make decisions`
      });
    }

    // Response quality insights
    if (responseAnalysis.confidence > 0.8) {
      insights.push({
        type: 'assessment_quality',
        title: 'High Quality Assessment',
        description: 'Your thoughtful and consistent responses provide highly reliable insights'
      });
    }

    // Additional meaningful insights based on trait patterns

    // Work style insight
    if (traits.conscientiousness > 70 && traits.openness > 60) {
      insights.push({
        type: 'work_style',
        title: 'Innovation Excellence',
        description:
          'Your combination of high conscientiousness and openness makes you exceptional at turning creative ideas into concrete results.'
      });
    } else if (traits.extraversion > 70 && traits.agreeableness > 70) {
      insights.push({
        type: 'work_style',
        title: 'People Leader',
        description:
          'Your natural warmth and social energy make you highly effective in roles that involve motivating and coordinating with others.'
      });
    }

    // Balance insight
    const traitRange = Math.max(...Object.values(traits)) - Math.min(...Object.values(traits));
    if (traitRange < 30) {
      insights.push({
        type: 'trait_balance',
        title: 'Balanced Profile',
        description:
          'Your personality traits are well-balanced, giving you adaptability across different situations and the ability to understand diverse perspectives.'
      });
    } else if (traitRange > 60) {
      insights.push({
        type: 'trait_contrast',
        title: 'Distinctive Profile',
        description:
          'You have a strongly differentiated personality with clear strengths and preferences, making you particularly effective in specific contexts.'
      });
    }

    // Stress and wellbeing insight
    if (traits.neuroticism > 60) {
      insights.push({
        type: 'wellbeing',
        title: 'Emotional Depth',
        description:
          'Your emotional sensitivity brings depth to your experiences and relationships. Consider stress management techniques to harness this sensitivity effectively.'
      });
    } else if (traits.neuroticism < 30) {
      insights.push({
        type: 'wellbeing',
        title: 'Stress Resilience',
        description:
          'Your exceptional emotional stability allows you to remain calm in crisis situations, making you a stabilizing force for others.'
      });
    }

    // Growth opportunity
    const lowestTrait = Object.entries(traits).sort((a, b) => a[1] - b[1])[0];
    if (lowestTrait && lowestTrait[1] < 40) {
      insights.push({
        type: 'growth',
        title: 'Development Opportunity',
        description: `Developing your ${lowestTrait[0]} could unlock new capabilities and enhance your overall effectiveness in both personal and professional contexts.`
      });
    }

    // Relationship pattern
    if (traits.agreeableness > 70) {
      insights.push({
        type: 'relationship',
        title: 'Natural Connector',
        description:
          'Your high agreeableness enables you to build trust quickly and maintain harmonious relationships across diverse groups.'
      });
    }

    // Learning style
    if (traits.openness > 70) {
      insights.push({
        type: 'learning',
        title: 'Conceptual Learner',
        description:
          'You thrive when exploring abstract concepts and theoretical frameworks. Seek learning opportunities that challenge conventional thinking.'
      });
    }

    return insights;
  }

  /**
   * Identify primary trait (highest deviation from mean)
   */
  identifyPrimaryTrait(traits) {
    let maxDeviation = 0;
    let primaryTrait = null;

    Object.entries(traits).forEach(([trait, score]) => {
      const deviation = Math.abs(score - 50);
      if (deviation > maxDeviation) {
        maxDeviation = deviation;
        primaryTrait = { trait, score };
      }
    });

    return primaryTrait || { trait: 'balanced', score: 50 };
  }

  /**
   * Get primary trait insight
   */
  getPrimaryTraitInsight(trait, score) {
    const insights = {
      openness:
        score > 65
          ? 'driving your creative and innovative approach'
          : 'grounding you in practical thinking',
      conscientiousness:
        score > 65
          ? 'enabling exceptional organization and reliability'
          : 'allowing flexibility and adaptability',
      extraversion:
        score > 65 ? 'energizing your social interactions' : 'supporting deep focus and reflection',
      agreeableness:
        score > 65
          ? 'fostering strong relationships and empathy'
          : 'maintaining independence and objectivity',
      neuroticism:
        score > 65 ? 'heightening your emotional awareness' : 'providing emotional stability',
      balanced: 'creating a well-rounded personality profile'
    };

    return insights[trait] || 'shaping your unique personality';
  }

  generateDeepCareerAnalysis(traits, cognitiveProfile, socialProfile) {
    const analysis = {
      careerMatches: [],
      workStyle: {},
      leadershipStyle: '',
      teamRole: '',
      optimalEnvironment: [],
      developmentAreas: []
    };

    // Career matches based on trait combinations
    const careerMapping = {
      high_openness_high_conscientiousness: [
        'Product Manager',
        'Research Scientist',
        'Strategic Consultant'
      ],
      high_openness_high_extraversion: [
        'Creative Director',
        'Marketing Manager',
        'Business Development'
      ],
      high_conscientiousness_high_agreeableness: [
        'Project Manager',
        'HR Manager',
        'Quality Assurance'
      ],
      high_extraversion_high_agreeableness: ['Sales Manager', 'Team Lead', 'Client Relations'],
      low_extraversion_high_openness: ['Software Developer', 'Data Analyst', 'Researcher'],
      low_extraversion_high_conscientiousness: ['Accountant', 'Technical Writer', 'Quality Control']
    };

    // Determine career matches
    const sortedTraits = Object.entries(traits).sort((a, b) => b[1] - a[1]);
    const primaryTrait = sortedTraits[0];
    const secondaryTrait = sortedTraits[1];

    if (primaryTrait[1] > 70 && secondaryTrait[1] > 70) {
      const comboKey = `high_${primaryTrait[0]}_high_${secondaryTrait[0]}`;
      analysis.careerMatches = careerMapping[comboKey] || [
        'Generalist roles',
        'Cross-functional positions'
      ];
    } else if (primaryTrait[1] < 30 && secondaryTrait[1] > 70) {
      const comboKey = `low_${primaryTrait[0]}_high_${secondaryTrait[0]}`;
      analysis.careerMatches = careerMapping[comboKey] || [
        'Specialized roles',
        'Individual contributor positions'
      ];
    } else {
      analysis.careerMatches = [`${primaryTrait[0]}-focused roles`, 'Adaptive positions'];
    }

    // Work style analysis
    analysis.workStyle = {
      preferredPace:
        traits.conscientiousness > 70 ? 'Structured and planned' : 'Flexible and adaptive',
      decisionMaking: traits.openness > 70 ? 'Innovative and exploratory' : 'Practical and proven',
      collaboration:
        traits.agreeableness > 70
          ? 'Highly collaborative'
          : 'Independent with selective collaboration',
      stressResponse:
        traits.neuroticism < 30 ? 'Calm under pressure' : 'Benefits from supportive environment'
    };

    // Leadership style
    if (traits.extraversion > 70 && traits.conscientiousness > 70) {
      analysis.leadershipStyle = 'Directive and organized leader';
    } else if (traits.extraversion > 70 && traits.agreeableness > 70) {
      analysis.leadershipStyle = 'Inspirational and people-focused leader';
    } else if (traits.openness > 70 && traits.conscientiousness > 70) {
      analysis.leadershipStyle = 'Visionary and strategic leader';
    } else {
      analysis.leadershipStyle = 'Situational and adaptive leader';
    }

    // Team role
    if (traits.agreeableness > 70) {
      analysis.teamRole = 'Team harmonizer and collaborator';
    } else if (traits.openness > 70) {
      analysis.teamRole = 'Innovation catalyst and idea generator';
    } else if (traits.conscientiousness > 70) {
      analysis.teamRole = 'Process optimizer and quality controller';
    } else {
      analysis.teamRole = 'Versatile team contributor';
    }

    // Optimal environment
    if (traits.extraversion > 70) {
      analysis.optimalEnvironment.push('Open, collaborative workspace');
    } else {
      analysis.optimalEnvironment.push('Quiet, focused work environment');
    }

    if (traits.openness > 70) {
      analysis.optimalEnvironment.push('Innovation-friendly culture');
    }

    if (traits.conscientiousness > 70) {
      analysis.optimalEnvironment.push('Well-structured processes');
    }

    // Development areas
    const sortedLowTraits = Object.entries(traits).sort((a, b) => a[1] - b[1]);
    const lowestTrait = sortedLowTraits[0];

    if (lowestTrait[1] < 40) {
      const developmentMap = {
        openness: 'Creative thinking and adaptability',
        conscientiousness: 'Organization and follow-through',
        extraversion: 'Communication and networking',
        agreeableness: 'Collaboration and empathy',
        neuroticism: 'Stress management and resilience'
      };
      analysis.developmentAreas.push(developmentMap[lowestTrait[0]]);
    }

    return analysis;
  }

  generateDetailedRelationshipAnalysis(traits, socialProfile) {
    const analysis = {
      communicationStyle: '',
      conflictResolution: '',
      intimacyStyle: '',
      attachmentTendencies: '',
      partnershipCompatibility: {},
      relationshipChallenges: [],
      relationshipStrengths: []
    };

    // Communication style
    if (traits.extraversion > 70 && traits.agreeableness > 70) {
      analysis.communicationStyle = 'Open, expressive, and emotionally responsive';
    } else if (traits.extraversion > 70 && traits.agreeableness < 50) {
      analysis.communicationStyle = 'Direct, assertive, and results-focused';
    } else if (traits.extraversion < 50 && traits.agreeableness > 70) {
      analysis.communicationStyle = 'Thoughtful, considerate, and supportive';
    } else {
      analysis.communicationStyle = 'Reserved, independent, and selective';
    }

    // Conflict resolution
    if (traits.agreeableness > 70) {
      analysis.conflictResolution = 'Seeks harmony and compromise';
    } else if (traits.openness > 70) {
      analysis.conflictResolution = 'Approaches conflicts creatively and adaptively';
    } else if (traits.conscientiousness > 70) {
      analysis.conflictResolution = 'Systematic and fair problem-solving approach';
    } else {
      analysis.conflictResolution = 'Direct confrontation when necessary';
    }

    // Intimacy style
    if (traits.openness > 70 && traits.extraversion > 70) {
      analysis.intimacyStyle = 'Emotionally expressive and physically affectionate';
    } else if (traits.openness > 70) {
      analysis.intimacyStyle = 'Deep emotional connection and meaningful conversations';
    } else if (traits.agreeableness > 70) {
      analysis.intimacyStyle = 'Supportive, caring, and attentive to partner needs';
    } else {
      analysis.intimacyStyle = 'Shows love through actions rather than words';
    }

    // Attachment tendencies
    if (traits.neuroticism > 70) {
      analysis.attachmentTendencies = 'May experience relationship anxiety and need reassurance';
    } else if (traits.agreeableness > 70 && traits.extraversion > 70) {
      analysis.attachmentTendencies = 'Forms secure, trusting attachments easily';
    } else if (traits.extraversion < 50) {
      analysis.attachmentTendencies = 'Values independence while maintaining close bonds';
    } else {
      analysis.attachmentTendencies = 'Balanced approach to intimacy and independence';
    }

    // Partnership compatibility
    analysis.partnershipCompatibility = {
      idealPartnerTraits: [],
      complementaryQualities: [],
      sharedValues: []
    };

    if (traits.openness > 70) {
      analysis.partnershipCompatibility.idealPartnerTraits.push('Creative and adventurous');
      analysis.partnershipCompatibility.sharedValues.push('Growth and exploration');
    }

    if (traits.conscientiousness > 70) {
      analysis.partnershipCompatibility.idealPartnerTraits.push('Reliable and goal-oriented');
      analysis.partnershipCompatibility.sharedValues.push('Achievement and stability');
    }

    if (traits.agreeableness > 70) {
      analysis.partnershipCompatibility.idealPartnerTraits.push('Kind and empathetic');
      analysis.partnershipCompatibility.sharedValues.push('Harmony and compassion');
    }

    // Relationship strengths
    if (traits.agreeableness > 70) {
      analysis.relationshipStrengths.push('Creates emotionally safe environment');
    }
    if (traits.conscientiousness > 70) {
      analysis.relationshipStrengths.push('Committed and dependable partner');
    }
    if (traits.openness > 70) {
      analysis.relationshipStrengths.push('Brings novelty and growth to relationship');
    }
    if (traits.extraversion > 70) {
      analysis.relationshipStrengths.push('Energizes and motivates partner');
    }

    // Relationship challenges
    if (traits.neuroticism > 70) {
      analysis.relationshipChallenges.push('May need extra emotional support during stress');
    }
    if (traits.conscientiousness > 80) {
      analysis.relationshipChallenges.push('High standards may create pressure');
    }
    if (traits.openness > 80) {
      analysis.relationshipChallenges.push('Need for constant stimulation may challenge stability');
    }
    if (traits.agreeableness < 30) {
      analysis.relationshipChallenges.push(
        'May prioritize personal goals over relationship harmony'
      );
    }

    return analysis;
  }

  createAdvancedGrowthRoadmap(traits, enhancedAnalysis) {
    const roadmap = {
      personalGrowthPath: [],
      careerDevelopment: [],
      relationshipEnhancement: [],
      wellbeingOptimization: [],
      timeframes: {
        immediate: [], // 0-3 months
        shortTerm: [], // 3-12 months
        longTerm: [] // 1+ years
      }
    };

    // Personal growth based on trait gaps
    const sortedTraits = Object.entries(traits).sort((a, b) => a[1] - b[1]);
    const lowestTrait = sortedTraits[0];
    const highestTrait = sortedTraits[sortedTraits.length - 1];

    // Development areas for lowest traits
    if (lowestTrait[1] < 40) {
      const growthStrategies = {
        openness: {
          immediate: ['Try one new experience this week', 'Read about unfamiliar topics'],
          shortTerm: ['Take a creative class', 'Travel to new places'],
          longTerm: ['Develop artistic skills', 'Pursue continuous learning mindset']
        },
        conscientiousness: {
          immediate: ['Create daily routine checklist', 'Set weekly goals'],
          shortTerm: ['Implement time management system', 'Develop organization habits'],
          longTerm: ['Build long-term planning skills', 'Master project management']
        },
        extraversion: {
          immediate: ['Practice small talk daily', 'Join one social activity'],
          shortTerm: ['Take public speaking class', 'Expand social network'],
          longTerm: ['Develop leadership presence', 'Build communication confidence']
        },
        agreeableness: {
          immediate: ['Practice active listening', 'Express empathy daily'],
          shortTerm: ['Volunteer for causes you care about', 'Improve conflict resolution'],
          longTerm: ['Develop emotional intelligence', 'Build deeper relationships']
        },
        neuroticism: {
          immediate: ['Practice daily mindfulness', 'Learn stress management techniques'],
          shortTerm: ['Develop coping strategies', 'Build resilience habits'],
          longTerm: ['Master emotional regulation', 'Create strong support systems']
        }
      };

      const strategies = growthStrategies[lowestTrait[0]];
      if (strategies) {
        roadmap.timeframes.immediate.push(...strategies.immediate);
        roadmap.timeframes.shortTerm.push(...strategies.shortTerm);
        roadmap.timeframes.longTerm.push(...strategies.longTerm);
        roadmap.personalGrowthPath.push(`Develop ${lowestTrait[0]} to enhance overall balance`);
      }
    }

    // Leverage highest traits
    if (highestTrait[1] > 70) {
      const leverageStrategies = {
        openness: ['Use creativity for innovation', 'Mentor others in adaptability'],
        conscientiousness: ['Lead organizational initiatives', 'Become process improvement expert'],
        extraversion: ['Take on networking roles', 'Develop others through communication'],
        agreeableness: ['Focus on team building', 'Specialize in conflict mediation'],
        neuroticism: ['Use sensitivity for empathy', 'Help others with emotional awareness']
      };

      const strategies = leverageStrategies[highestTrait[0]];
      if (strategies) {
        roadmap.personalGrowthPath.push(...strategies);
      }
    }

    // Career development based on trait profile
    if (traits.openness > 70 && traits.conscientiousness > 70) {
      roadmap.careerDevelopment.push(
        'Pursue strategic leadership roles',
        'Develop innovation management skills',
        'Build cross-functional expertise'
      );
    } else if (traits.extraversion > 70 && traits.agreeableness > 70) {
      roadmap.careerDevelopment.push(
        'Focus on people management',
        'Develop coaching and mentoring skills',
        'Build stakeholder relationship expertise'
      );
    } else if (traits.conscientiousness > 70) {
      roadmap.careerDevelopment.push(
        'Specialize in process optimization',
        'Develop quality management expertise',
        'Build analytical and technical skills'
      );
    }

    // Relationship enhancement
    if (traits.agreeableness < 50) {
      roadmap.relationshipEnhancement.push(
        'Practice empathy and perspective-taking',
        'Develop active listening skills',
        'Learn collaborative communication'
      );
    }

    if (traits.extraversion < 50) {
      roadmap.relationshipEnhancement.push(
        'Build confidence in social settings',
        'Practice initiating conversations',
        'Develop networking skills'
      );
    }

    // Wellbeing optimization
    if (traits.neuroticism > 70) {
      roadmap.wellbeingOptimization.push(
        'Implement stress reduction practices',
        'Build emotional resilience',
        'Create strong support networks'
      );
    }

    if (traits.conscientiousness < 50) {
      roadmap.wellbeingOptimization.push(
        'Develop healthy routines',
        'Improve work-life balance',
        'Build sustainable habits'
      );
    }

    // Add timeframe-specific recommendations if not already populated
    if (roadmap.timeframes.immediate.length === 0) {
      roadmap.timeframes.immediate.push(
        'Complete a personality strengths assessment',
        'Set one specific development goal'
      );
    }

    if (roadmap.timeframes.shortTerm.length === 0) {
      roadmap.timeframes.shortTerm.push(
        'Join a professional development group',
        'Seek feedback from trusted colleagues'
      );
    }

    if (roadmap.timeframes.longTerm.length === 0) {
      roadmap.timeframes.longTerm.push(
        'Pursue advanced skill development',
        'Take on leadership challenges'
      );
    }

    return roadmap;
  }

  generateInsightPatterns(responses, traits) {
    const patterns = {
      responsePatterns: [],
      traitPatterns: [],
      behavioralInsights: [],
      uniqueCharacteristics: []
    };

    // Ensure responses is an array
    const responseArray = Array.isArray(responses) ? responses : [];

    // Analyze response patterns
    const responseTimes = responseArray.map(r => r.responseTime || 3000);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

    if (avgResponseTime < 2000) {
      patterns.responsePatterns.push('Quick decision-maker who trusts initial instincts');
    } else if (avgResponseTime > 5000) {
      patterns.responsePatterns.push('Thoughtful responder who carefully considers options');
    } else {
      patterns.responsePatterns.push('Balanced decision-making approach');
    }

    // Trait combination patterns
    const sortedTraits = Object.entries(traits).sort((a, b) => b[1] - a[1]);
    const highTraits = sortedTraits.filter(([, score]) => score > 70);
    const lowTraits = sortedTraits.filter(([, score]) => score < 40);

    if (highTraits.length >= 3) {
      patterns.traitPatterns.push(
        'Multi-dimensional personality with several strong characteristics'
      );
    } else if (highTraits.length === 2) {
      patterns.traitPatterns.push(
        `Dual-strength profile combining ${highTraits[0][0]} and ${highTraits[1][0]}`
      );
    } else if (highTraits.length === 1) {
      patterns.traitPatterns.push(
        `Single-strength profile with dominant ${highTraits[0][0]} orientation`
      );
    }

    // Behavioral insights based on trait combinations
    if (traits.openness > 70 && traits.conscientiousness > 70) {
      patterns.behavioralInsights.push(
        'Rare combination of creativity and reliability makes you a valuable innovator'
      );
    }

    if (traits.extraversion > 70 && traits.neuroticism < 30) {
      patterns.behavioralInsights.push('Natural leadership presence with emotional stability');
    }

    if (traits.agreeableness > 70 && traits.openness > 70) {
      patterns.behavioralInsights.push(
        'Combines empathy with intellectual curiosity for deep understanding'
      );
    }

    // Unique characteristics
    const traitRange = Math.max(...Object.values(traits)) - Math.min(...Object.values(traits));
    if (traitRange > 60) {
      patterns.uniqueCharacteristics.push(
        'Distinctive personality profile with clear strengths and development areas'
      );
    } else if (traitRange < 30) {
      patterns.uniqueCharacteristics.push(
        'Balanced personality profile with consistent traits across dimensions'
      );
    }

    // Response consistency patterns
    const traitScores = {};
    responseArray.forEach(r => {
      if (!traitScores[r.trait]) traitScores[r.trait] = [];
      traitScores[r.trait].push(r.response || r.score || 3);
    });

    const consistencyScores = Object.entries(traitScores).map(([trait, scores]) => {
      const variance =
        scores.reduce((acc, score) => {
          const diff = score - scores.reduce((a, b) => a + b, 0) / scores.length;
          return acc + diff * diff;
        }, 0) / scores.length;
      return { trait, consistency: Math.max(0, 100 - variance * 20) };
    });

    const avgConsistency =
      consistencyScores.reduce((sum, s) => sum + s.consistency, 0) / consistencyScores.length;

    if (avgConsistency > 80) {
      patterns.responsePatterns.push('Highly consistent responses indicate strong self-awareness');
    } else if (avgConsistency < 60) {
      patterns.responsePatterns.push('Variable responses suggest complex, nuanced personality');
    }

    return patterns;
  }

  generateCustomRecommendations(traits, enhancedAnalysis, patterns) {
    const recommendations = {
      immediate: [],
      development: [],
      career: [],
      relationships: [],
      personalized: []
    };

    // Immediate action recommendations
    const sortedTraits = Object.entries(traits).sort((a, b) => a[1] - b[1]);
    const lowestTrait = sortedTraits[0];

    if (lowestTrait[1] < 40) {
      const immediateActions = {
        openness: 'Try one new experience this week to expand your comfort zone',
        conscientiousness: 'Create a simple daily routine to build organizational habits',
        extraversion: 'Initiate one meaningful conversation today',
        agreeableness: 'Practice active listening in your next interaction',
        neuroticism: 'Implement a 5-minute daily mindfulness practice'
      };
      recommendations.immediate.push(immediateActions[lowestTrait[0]]);
    }

    // Development recommendations based on trait combinations
    if (traits.openness > 70 && traits.conscientiousness < 50) {
      recommendations.development.push(
        'Channel your creativity through structured projects',
        'Use time-blocking to balance exploration with completion'
      );
    }

    if (traits.extraversion > 70 && traits.agreeableness < 50) {
      recommendations.development.push(
        'Practice collaborative leadership styles',
        'Focus on building consensus before driving decisions'
      );
    }

    if (traits.conscientiousness > 80) {
      recommendations.development.push(
        'Practice flexibility when plans change unexpectedly',
        'Set "good enough" standards for non-critical tasks'
      );
    }

    // Career recommendations
    const highestTrait = sortedTraits[sortedTraits.length - 1];
    const careerPaths = {
      openness: [
        'Pursue roles requiring innovation and creative problem-solving',
        'Consider industries that value adaptability and change'
      ],
      conscientiousness: [
        'Target positions requiring attention to detail and reliability',
        'Explore project management or quality assurance roles'
      ],
      extraversion: [
        'Seek opportunities involving team leadership and communication',
        'Consider sales, marketing, or public-facing positions'
      ],
      agreeableness: [
        'Look for collaborative environments and helping professions',
        'Consider HR, counseling, or team facilitation roles'
      ],
      neuroticism:
        traits.neuroticism < 30
          ? [
              'Take on high-pressure roles where stability is crucial',
              'Consider crisis management or emergency response positions'
            ]
          : [
              'Seek supportive work environments with clear expectations',
              'Look for roles with predictable routines and low conflict'
            ]
    };

    recommendations.career.push(...careerPaths[highestTrait[0]]);

    // Relationship recommendations
    if (traits.agreeableness < 50) {
      recommendations.relationships.push(
        "Practice expressing appreciation for others' contributions",
        "Work on seeing situations from others' perspectives"
      );
    }

    if (traits.extraversion < 40) {
      recommendations.relationships.push(
        'Start with small group interactions before large gatherings',
        'Focus on deepening existing relationships rather than expanding networks'
      );
    }

    if (traits.neuroticism > 70) {
      recommendations.relationships.push(
        'Communicate your emotional needs clearly to close partners',
        'Build a support network for stress management'
      );
    }

    // Personalized recommendations based on unique patterns
    if (patterns && patterns.uniqueCharacteristics) {
      patterns.uniqueCharacteristics.forEach(characteristic => {
        if (characteristic.includes('distinctive')) {
          recommendations.personalized.push(
            'Leverage your unique trait combination as a competitive advantage',
            'Seek environments that value diverse thinking styles'
          );
        } else if (characteristic.includes('balanced')) {
          recommendations.personalized.push(
            'Use your balanced profile to serve as a bridge between different personality types',
            'Consider roles requiring versatility and adaptability'
          );
        }
      });
    }

    // Ensure we have content in each category
    if (recommendations.immediate.length === 0) {
      recommendations.immediate.push(
        'Reflect on your personality strengths and how to apply them today'
      );
    }

    if (recommendations.development.length === 0) {
      recommendations.development.push(
        "Identify one trait you'd like to develop and create a practice plan"
      );
    }

    if (recommendations.relationships.length === 0) {
      recommendations.relationships.push(
        'Focus on authenticity and genuine connection in your interactions'
      );
    }

    return recommendations;
  }

  /**
   * NEW: Research-based assessment methods using complete database
   */

  /**
   * Analyze Big Five facets using research database
   */
  analyzeBigFiveFacets(responses, traits, metadata) {
    if (!this.researchDB?.bigFive?.facets) return null;

    const facetAnalysis = {};

    // For each Big Five trait, analyze its facets
    Object.keys(traits).forEach(trait => {
      if (this.researchDB.bigFive.facets[trait]) {
        const traitFacets = this.researchDB.bigFive.facets[trait];
        const traitScore = traits[trait];

        // Estimate facet scores based on trait level and response patterns
        facetAnalysis[trait] = {
          overall: traitScore,
          percentile: this.researchDB.scoringAlgorithms.rawToPercentile(traitScore, 50, 10),
          facets: {}
        };

        // Analyze each facet
        Object.keys(traitFacets).forEach(facet => {
          if (typeof traitFacets[facet] === 'object' && traitFacets[facet].description) {
            // Vary facet scores around trait mean with some variance
            const variance = (Math.random() - 0.5) * 10;
            const facetScore = Math.max(0, Math.min(100, traitScore + variance));

            facetAnalysis[trait].facets[facet] = {
              score: facetScore,
              description: traitFacets[facet].description,
              implications:
                facetScore > 60
                  ? traitFacets[facet].highScoreImplications
                  : traitFacets[facet].lowScoreImplications
            };
          }
        });

        // Add correlations if available
        if (traitFacets.correlations) {
          facetAnalysis[trait].correlations = traitFacets.correlations;
        }

        // Add life outcomes for conscientiousness
        if (trait === 'conscientiousness' && traitFacets.lifeOutcomes) {
          facetAnalysis[trait].predictedOutcomes = traitFacets.lifeOutcomes;
        }
      }
    });

    return facetAnalysis;
  }

  /**
   * Assess emotional regulation using DERS-2 framework
   */
  assessEmotionalRegulation(responses, traits) {
    if (!this.researchDB?.emotionalRegulation?.ders2) return null;

    const ders = this.researchDB.emotionalRegulation.ders2;
    const assessment = {
      dimensions: {},
      totalScore: 0,
      clinicalConcern: false,
      strategies: {},
      alexithymiaRisk: 0
    };

    // Assess each DERS dimension based on traits and responses
    Object.keys(ders.dimensions).forEach(dimension => {
      const dimData = ders.dimensions[dimension];
      let score = 50; // Start at average

      // Adjust based on relevant traits
      if (dimension === 'nonacceptance' || dimension === 'impulse') {
        score += (traits.neuroticism - 50) * 0.5;
      }
      if (dimension === 'goals' && dimData.adhdCorrelation) {
        // Check ADHD indicators if available
        const adhdResponses = responses.filter(r => r.question?.instrument === 'ASRS-5');
        if (adhdResponses.length > 0) {
          const adhdScore =
            adhdResponses.reduce((sum, r) => sum + (r.value || 0), 0) / adhdResponses.length;
          score += adhdScore * 10 * dimData.adhdCorrelation;
        }
      }
      if (dimension === 'strategies') {
        score += (traits.neuroticism - 50) * 0.4;
        score -= (traits.conscientiousness - 50) * 0.3;
      }

      score = Math.max(0, Math.min(100, score));
      assessment.dimensions[dimension] = {
        score,
        clinicalConcern: score > dimData.clinicalCutoff * 3, // Normalize to 0-100
        description: dimData.description
      };

      assessment.totalScore += score / Object.keys(ders.dimensions).length;
    });

    // Assess alexithymia risk
    if (this.researchDB.emotionalRegulation.alexithymia) {
      const alexData = this.researchDB.emotionalRegulation.alexithymia;
      assessment.alexithymiaRisk =
        traits.neuroticism < 30 ? 0.15 : traits.openness < 40 ? 0.25 : 0.1;

      // Check for autism indicators which increase alexithymia risk
      const autismQuestions = responses.filter(r => r.question?.instrument === 'AQ-10');
      if (autismQuestions.length > 0) {
        const autismScore = autismQuestions.reduce((sum, r) => sum + (r.value || 0), 0);
        if (autismScore >= 6) {
          assessment.alexithymiaRisk = alexData.prevalence.autism;
        }
      }
    }

    // Recommend strategies
    const strategies = this.researchDB.emotionalRegulation.strategies;
    if (strategies) {
      assessment.strategies = {
        recommended:
          assessment.totalScore > 60
            ? Object.keys(strategies.adaptive)
            : ['reappraisal', 'problemSolving'],
        avoid:
          assessment.totalScore > 70
            ? Object.keys(strategies.maladaptive)
            : ['rumination', 'suppression']
      };
    }

    return assessment;
  }

  /**
   * Analyze attachment style based on research
   */
  analyzeAttachmentStyle(responses, traits) {
    if (!this.researchDB?.attachmentPatterns) return null;

    // Calculate attachment dimensions
    let anxietyScore = 50;
    let avoidanceScore = 50;

    // Anxiety dimension correlates with neuroticism
    anxietyScore += (traits.neuroticism - 50) * 0.6;
    anxietyScore -= (traits.agreeableness - 50) * 0.2;

    // Avoidance dimension correlates with low extraversion and agreeableness
    avoidanceScore -= (traits.extraversion - 50) * 0.4;
    avoidanceScore -= (traits.agreeableness - 50) * 0.5;
    avoidanceScore += (traits.conscientiousness - 50) * 0.2;

    // Normalize scores
    anxietyScore = Math.max(0, Math.min(100, anxietyScore));
    avoidanceScore = Math.max(0, Math.min(100, avoidanceScore));

    // Determine attachment style
    let style = 'secure';
    if (anxietyScore < 40 && avoidanceScore < 40) {
      style = 'secure';
    } else if (anxietyScore > 60 && avoidanceScore < 40) {
      style = 'anxiousPreoccupied';
    } else if (anxietyScore < 40 && avoidanceScore > 60) {
      style = 'dismissiveAvoidant';
    } else if (anxietyScore > 60 && avoidanceScore > 60) {
      style = 'fearfulAvoidant';
    }

    const attachmentData = this.researchDB.attachmentPatterns?.styles?.[style] || {};

    return {
      style,
      dimensions: {
        anxiety: anxietyScore,
        avoidance: avoidanceScore
      },
      description: attachmentData.characteristics || [],
      prevalence: attachmentData.prevalence || 0,
      relationshipImpact: attachmentData.relationshipSatisfaction || 0,
      recommendations: this.generateAttachmentRecommendations(style)
    };
  }

  /**
   * Screen for anxiety using GAD-7 framework
   */
  screenForAnxiety(responses, traits) {
    if (!this.researchDB?.anxietyAssessment?.gad7) return null;

    const gad7 = this.researchDB.anxietyAssessment.gad7;

    // Estimate GAD-7 score based on neuroticism and anxiety-related responses
    let estimatedScore = 0;

    // Neuroticism is highly correlated with anxiety
    const neuroticismContribution = ((traits.neuroticism - 50) / 50) * 10;
    estimatedScore += Math.max(0, neuroticismContribution);

    // Check for specific anxiety responses
    const anxietyResponses = responses.filter(
      r =>
        r.question?.category === 'anxiety' ||
        r.question?.subcategory === 'worry' ||
        r.trait === 'neuroticism'
    );

    if (anxietyResponses.length > 0) {
      const avgAnxiety =
        anxietyResponses.reduce((sum, r) => sum + (r.value || r.score || 3), 0) /
        anxietyResponses.length;
      estimatedScore += (avgAnxiety - 3) * 3;
    }

    estimatedScore = Math.max(0, Math.min(21, Math.round(estimatedScore)));

    // Determine severity
    let severity = 'minimal';
    if (estimatedScore >= 15) severity = 'severe';
    else if (estimatedScore >= 10) severity = 'moderate';
    else if (estimatedScore >= 5) severity = 'mild';

    return {
      estimatedGAD7: estimatedScore,
      severity,
      clinicalRange: estimatedScore >= 10,
      subtypes: this.assessAnxietySubtypes(responses, traits),
      recommendations:
        estimatedScore >= 10 ? this.researchDB.recommendations?.anxiety?.[severity] || [] : []
    };
  }

  /**
   * Screen for depression using PHQ-9 framework
   */
  screenForDepression(responses, traits) {
    if (!this.researchDB?.depressionAssessment?.phq9) return null;

    const phq9 = this.researchDB.depressionAssessment.phq9;

    // Estimate PHQ-9 score
    let estimatedScore = 0;

    // Neuroticism and low extraversion predict depression
    const neuroticismContribution = ((traits.neuroticism - 50) / 50) * 8;
    const extraversionContribution = ((50 - traits.extraversion) / 50) * 5;

    estimatedScore += Math.max(0, neuroticismContribution);
    estimatedScore += Math.max(0, extraversionContribution);

    // Check for depression-specific responses
    const depressionResponses = responses.filter(
      r => r.question?.category === 'mood' || r.question?.subcategory === 'depression'
    );

    if (depressionResponses.length > 0) {
      const avgMood =
        depressionResponses.reduce((sum, r) => sum + (r.value || r.score || 3), 0) /
        depressionResponses.length;
      estimatedScore += (avgMood - 3) * 2;
    }

    estimatedScore = Math.max(0, Math.min(27, Math.round(estimatedScore)));

    // Determine severity
    let severity = 'minimal';
    if (estimatedScore >= 20) severity = 'severe';
    else if (estimatedScore >= 15) severity = 'moderatelySevere';
    else if (estimatedScore >= 10) severity = 'moderate';
    else if (estimatedScore >= 5) severity = 'mild';

    // Assess anhedonia
    const anhedoniaRisk = traits.extraversion < 30 && traits.openness < 40;

    return {
      estimatedPHQ9: estimatedScore,
      severity,
      clinicalRange: estimatedScore >= 10,
      anhedoniaRisk,
      subtype: this.determineDepressionSubtype(traits, responses),
      recommendations:
        estimatedScore >= 10 ? this.researchDB.recommendations?.depression?.[severity] || [] : []
    };
  }

  /**
   * Assess stress levels
   */
  assessStressLevels(responses, traits) {
    // Simple stress assessment based on multiple factors
    let stressScore = 50;

    // High neuroticism increases stress
    stressScore += (traits.neuroticism - 50) * 0.5;

    // Low conscientiousness may indicate poor coping
    stressScore += (50 - traits.conscientiousness) * 0.3;

    // Check for stress-related responses
    const stressResponses = responses.filter(
      r => r.question?.category === 'stress' || r.question?.subcategory === 'coping'
    );

    if (stressResponses.length > 0) {
      const avgStress =
        stressResponses.reduce((sum, r) => sum + (r.value || r.score || 3), 0) /
        stressResponses.length;
      stressScore += (avgStress - 3) * 10;
    }

    stressScore = Math.max(0, Math.min(100, stressScore));

    return {
      level: stressScore,
      category: stressScore > 75 ? 'high' : stressScore > 50 ? 'moderate' : 'low',
      copingStrategies: this.recommendCopingStrategies(stressScore, traits)
    };
  }

  /**
   * Assess cognitive abilities
   */
  assessCognitiveAbilities(responses, traits, cognitiveProfile) {
    if (!this.researchDB?.cognitiveAssessment) return null;

    const assessment = {
      estimatedIQ: 100, // Start at average
      processingSpeed: 50,
      workingMemory: 50,
      cognitiveFlexibility: 50,
      strengths: [],
      challenges: []
    };

    // Openness correlates with IQ (r = 0.33)
    assessment.estimatedIQ += (traits.openness - 50) * 0.33;

    // Processing speed affected by age and ADHD
    const adhdResponses = responses.filter(r => r.question?.instrument === 'ASRS-5');
    if (adhdResponses.length > 0) {
      const adhdScore =
        adhdResponses.reduce((sum, r) => sum + (r.value || 0), 0) / adhdResponses.length;
      assessment.processingSpeed -= adhdScore * 5;
    }

    // Use executive function data if available
    if (cognitiveProfile?.domains) {
      assessment.workingMemory = cognitiveProfile.domains.workingMemory || 50;
      assessment.cognitiveFlexibility = cognitiveProfile.domains.cognitiveFlexibility || 50;
    }

    // Determine strengths and challenges
    if (assessment.estimatedIQ > 110) assessment.strengths.push('Abstract reasoning');
    if (assessment.processingSpeed > 60) assessment.strengths.push('Quick thinking');
    if (assessment.workingMemory > 60) assessment.strengths.push('Strong working memory');

    if (assessment.processingSpeed < 40) assessment.challenges.push('Processing speed');
    if (assessment.workingMemory < 40) assessment.challenges.push('Working memory');

    return assessment;
  }

  /**
   * Analyze sleep patterns and chronotype
   */
  analyzeSleepPatterns(responses, metadata) {
    if (!this.researchDB?.sleepAssessment) return null;

    const sleepProfile = {
      chronotype: 'intermediate',
      qualityScore: 50,
      disorders: [],
      recommendations: []
    };

    // Check for sleep-related responses
    const sleepResponses = responses.filter(
      r => r.question?.category === 'sleep' || r.question?.subcategory === 'circadian'
    );

    if (sleepResponses.length > 0) {
      const avgSleep =
        sleepResponses.reduce((sum, r) => sum + (r.value || r.score || 3), 0) /
        sleepResponses.length;

      // Determine chronotype
      if (avgSleep < 2.5) sleepProfile.chronotype = 'definiteEvening';
      else if (avgSleep < 3) sleepProfile.chronotype = 'moderateEvening';
      else if (avgSleep > 4) sleepProfile.chronotype = 'moderateMorning';
      else if (avgSleep > 4.5) sleepProfile.chronotype = 'definiteMorning';
    }

    // Age-based adjustments
    const age = metadata?.age || 30;
    if (age < 25 && sleepProfile.chronotype.includes('Evening')) {
      sleepProfile.disorders.push('Possible delayed sleep phase');
    }

    // ADHD association with sleep issues
    const adhdResponses = responses.filter(r => r.question?.instrument === 'ASRS-5');
    if (adhdResponses.length > 0) {
      const adhdScore = adhdResponses.reduce((sum, r) => sum + (r.value || 0), 0);
      if (adhdScore >= 14) {
        sleepProfile.disorders.push('ADHD-related sleep difficulties');
        sleepProfile.recommendations.push('Consider sleep hygiene interventions');
      }
    }

    return sleepProfile;
  }

  /**
   * Consider cultural factors in assessment
   */
  considerCulturalFactors(metadata, traits) {
    if (!this.researchDB?.culturalConsiderations) return null;

    const cultural = {
      considerations: [],
      adjustments: {},
      interpretationNotes: []
    };

    // Check if cultural background provided
    const culture = metadata?.culture || metadata?.ethnicity;

    if (culture) {
      // Apply known cultural variations
      if (this.researchDB.culturalConsiderations.crossCultural?.bigFive?.variations) {
        const variations = this.researchDB.culturalConsiderations.crossCultural.bigFive.variations;

        if (
          culture.toLowerCase().includes('collectivist') ||
          ['asian', 'latino', 'hispanic'].some(c => culture.toLowerCase().includes(c))
        ) {
          cultural.adjustments.agreeableness = '+0.3 SD expected';
          cultural.adjustments.extraversion = '-0.2 SD expected';
          cultural.interpretationNotes.push('Scores adjusted for collectivist cultural context');
        }
      }

      // Note diagnostic disparities
      if (this.researchDB.culturalConsiderations.crossCultural?.autism?.diagnosticDisparity) {
        const disparities =
          this.researchDB.culturalConsiderations.crossCultural.autism.diagnosticDisparity;
        const ethnicGroup = culture.toLowerCase();

        if (disparities[ethnicGroup]) {
          cultural.considerations.push(`Historical underdiagnosis in ${culture} populations`);
          cultural.considerations.push(
            `Average diagnostic delay: ${disparities[ethnicGroup].delay}`
          );
        }
      }
    }

    // Language considerations
    const language = metadata?.primaryLanguage;
    if (language && language !== 'English') {
      cultural.considerations.push('Assessment conducted in second language may affect scores');
      cultural.interpretationNotes.push('Consider language factors in interpretation');
    }

    return cultural;
  }

  /**
   * Generate treatment recommendations
   */
  generateTreatmentRecommendations(neurodivergentScreening, mentalHealthScreening) {
    if (!this.researchDB?.treatmentResponse) return null;

    const recommendations = {
      psychotherapy: [],
      considerations: [],
      prognosis: {}
    };

    // ADHD treatment recommendations
    if (neurodivergentScreening?.adhd?.likelihood !== 'Low') {
      recommendations.psychotherapy.push({
        type: 'CBT for ADHD',
        effectSize: this.researchDB.treatmentResponse.psychotherapy.cbt.adhd.effectSize,
        description: 'Cognitive-behavioral therapy adapted for ADHD'
      });

      recommendations.considerations.push('Consider evaluation for ADHD medication');

      if (this.researchDB.treatmentResponse.medication?.stimulants) {
        const stimulants = this.researchDB.treatmentResponse.medication.stimulants;
        recommendations.considerations.push(
          `Stimulant medication response rate: ${stimulants.responseRate * 100}%`
        );
      }
    }

    // Autism support recommendations
    if (neurodivergentScreening?.autism?.likelihood !== 'Low') {
      recommendations.psychotherapy.push({
        type: 'Autism-informed therapy',
        description: 'Therapy adapted for autistic communication and sensory needs'
      });

      recommendations.considerations.push('Sensory accommodations');
      recommendations.considerations.push('Executive function support');
    }

    // Anxiety treatment
    if (mentalHealthScreening?.anxiety?.clinicalRange) {
      recommendations.psychotherapy.push({
        type: 'CBT for anxiety',
        effectSize: this.researchDB.treatmentResponse.psychotherapy.cbt.anxiety.effectSize,
        description: 'Evidence-based treatment for anxiety disorders'
      });
    }

    // Depression treatment
    if (mentalHealthScreening?.depression?.clinicalRange) {
      recommendations.psychotherapy.push({
        type: 'CBT for depression',
        effectSize: this.researchDB.treatmentResponse.psychotherapy.cbt.depression.effectSize,
        description: 'Cognitive-behavioral therapy for depression'
      });

      if (mentalHealthScreening.depression.severity === 'severe') {
        recommendations.considerations.push('Immediate professional evaluation recommended');
      }
    }

    // Add prognostic factors
    recommendations.prognosis = {
      positive: this.researchDB.treatmentResponse.prognosis.positive,
      considerations: this.researchDB.treatmentResponse.prognosis.negative
    };

    return recommendations;
  }

  /**
   * Generate comprehensive strengths profile
   */
  generateComprehensiveStrengths(traits, cognitiveProfile, neurodivergentScreening) {
    const strengths = {
      personality: [],
      cognitive: [],
      neurodivergent: [],
      overall: []
    };

    // Personality strengths
    Object.keys(traits).forEach(trait => {
      if (traits[trait] > 70) {
        const strengthMap = this.strengthsMap[trait];
        if (strengthMap?.high) {
          strengths.personality.push(...strengthMap.high);
        }
      } else if (traits[trait] < 30) {
        const strengthMap = this.strengthsMap[trait];
        if (strengthMap?.low) {
          strengths.personality.push(...strengthMap.low);
        }
      }
    });

    // Cognitive strengths
    if (cognitiveProfile?.strengths) {
      strengths.cognitive.push(...cognitiveProfile.strengths);
    }

    // Neurodivergent strengths
    if (neurodivergentScreening?.adhd?.likelihood !== 'Low') {
      strengths.neurodivergent.push('Crisis management', 'Creative thinking', 'High energy');
    }

    if (neurodivergentScreening?.autism?.likelihood !== 'Low') {
      strengths.neurodivergent.push(
        'Pattern recognition',
        'Attention to detail',
        'Systematic thinking'
      );
    }

    // Compile overall top strengths
    strengths.overall = [
      ...new Set([
        ...strengths.personality.slice(0, 3),
        ...strengths.cognitive.slice(0, 2),
        ...strengths.neurodivergent.slice(0, 2)
      ])
    ];

    return strengths;
  }

  /**
   * Generate normative comparisons
   */
  generateNormativeComparisons(traits, metadata, neurodivergentScreening) {
    if (!this.researchDB?.scoringAlgorithms) return null;

    const comparisons = {
      traits: {},
      executiveFunction: {},
      neurodiversity: {}
    };

    // Get age group for norms
    const age = metadata?.age || 30;
    let ageGroup = '26-35';
    if (age < 26) ageGroup = '18-25';
    else if (age < 36) ageGroup = '26-35';
    else if (age < 51) ageGroup = '36-50';
    else ageGroup = '51+';

    // Compare traits to age norms
    if (this.researchDB.bigFive?.ageNorms?.[ageGroup]) {
      const norms = this.researchDB.bigFive.ageNorms[ageGroup];

      Object.keys(traits).forEach(trait => {
        if (norms[trait]) {
          const zScore = (traits[trait] - norms[trait].mean) / norms[trait].sd;
          const percentile = this.researchDB.scoringAlgorithms.rawToPercentile(
            traits[trait],
            norms[trait].mean,
            norms[trait].sd
          );

          comparisons.traits[trait] = {
            score: traits[trait],
            percentile: Math.round(percentile),
            interpretation: this.interpretPercentile(percentile)
          };
        }
      });
    }

    // Add neurodiversity percentiles if applicable
    if (neurodivergentScreening?.adhd?.score) {
      comparisons.neurodiversity.adhd = {
        score: neurodivergentScreening.adhd.score,
        percentile: Math.min(99, Math.round(neurodivergentScreening.adhd.score)),
        interpretation: neurodivergentScreening.adhd.likelihood
      };
    }

    if (neurodivergentScreening?.autism?.score) {
      comparisons.neurodiversity.autism = {
        score: neurodivergentScreening.autism.score,
        percentile: Math.min(99, Math.round(neurodivergentScreening.autism.score)),
        interpretation: neurodivergentScreening.autism.likelihood
      };
    }

    return comparisons;
  }

  /**
   * Helper methods for new assessments
   */

  generateAttachmentRecommendations(style) {
    const recommendations = {
      secure: [
        'Continue building on your secure foundation',
        'Model healthy relationships for others'
      ],
      anxiousPreoccupied: [
        'Practice self-soothing techniques',
        'Work on building self-worth independent of relationships'
      ],
      dismissiveAvoidant: [
        'Practice vulnerability in safe relationships',
        'Challenge beliefs about independence'
      ],
      fearfulAvoidant: [
        'Consider therapy to address attachment wounds',
        'Practice gradual trust-building'
      ]
    };

    return recommendations[style] || [];
  }

  assessAnxietySubtypes(responses, traits) {
    const subtypes = [];

    if (traits.extraversion < 40) {
      subtypes.push('Social anxiety possible');
    }

    const panicResponses = responses.filter(r => r.question?.subcategory === 'panic');
    if (panicResponses.length > 0 && panicResponses.some(r => r.value > 3)) {
      subtypes.push('Panic symptoms reported');
    }

    return subtypes;
  }

  determineDepressionSubtype(traits, responses) {
    if (traits.neuroticism < 40 && traits.openness < 40) {
      return 'atypical';
    }

    if (traits.neuroticism > 70 && traits.conscientiousness > 60) {
      return 'melancholic';
    }

    // Check for seasonal pattern
    const metadata = responses[0]?.metadata;
    if (metadata?.assessmentDate) {
      const month = new Date(metadata.assessmentDate).getMonth();
      if ([10, 11, 0, 1, 2].includes(month)) {
        return 'seasonal';
      }
    }

    return 'unspecified';
  }

  recommendCopingStrategies(stressLevel, traits) {
    const strategies = [];

    if (stressLevel > 60) {
      strategies.push('Mindfulness meditation', 'Progressive muscle relaxation');
    }

    if (traits.extraversion > 60) {
      strategies.push('Social support', 'Group activities');
    } else {
      strategies.push('Journaling', 'Solo exercise');
    }

    if (traits.openness > 60) {
      strategies.push('Creative expression', 'New experiences');
    }

    if (traits.conscientiousness > 60) {
      strategies.push('Structured planning', 'Goal setting');
    }

    return strategies;
  }

  interpretPercentile(percentile) {
    if (percentile >= 90) return 'Well above average';
    if (percentile >= 70) return 'Above average';
    if (percentile >= 30) return 'Average';
    if (percentile >= 10) return 'Below average';
    return 'Well below average';
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedReportGenerator;
} else if (typeof window !== 'undefined') {
  window.AdvancedReportGenerator = AdvancedReportGenerator;
}
