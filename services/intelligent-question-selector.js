/**
 * Intelligent Question Selector - Human-like adaptive assessment
 *
 * This replaces the rigid stage-based system with a truly adaptive,
 * context-aware question selection algorithm that feels natural and therapeutic.
 *
 * Core Principles:
 * 1. Select ONE question at a time based on all previous answers
 * 2. Avoid clustering similar questions (no 7 depression questions in a row)
 * 3. Balance exploration (broad coverage) and exploitation (deep dives)
 * 4. Create natural conversational flow
 * 5. Maximize information gain while minimizing user fatigue
 *
 * ENHANCED WITH ORDER-OF-MAGNITUDE INTELLIGENCE:
 * 6. Cross-trait prediction via Bayesian Belief Network
 * 7. Real-time validity monitoring and intervention
 * 8. Pattern-based neurodivergence detection
 * 9. Semantic contradiction detection and clarification
 * 10. Adaptive question difficulty based on response style
 */

const ConfidenceTracker = require('./confidence-tracker');
const DimensionMapper = require('./dimension-mapper');
const BayesianBeliefNetwork = require('./bayesian-belief-network');
const RealTimeValidityMonitor = require('./real-time-validity-monitor');
const NeurodivergencePatternDetector = require('./neurodivergence-pattern-detector');
const SemanticContradictionDetector = require('./semantic-contradiction-detector');
const AdaptiveQuestionDifficulty = require('./adaptive-question-difficulty');

class IntelligentQuestionSelector {
  constructor() {
    // Context window: Track last N questions to avoid repetition
    this.contextWindow = 5;

    // Topic categories for diversity tracking
    this.topicCategories = {
      personality: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'],
      clinical: ['depression', 'anxiety', 'mania', 'psychosis', 'somatic'],
      neurodiversity: ['adhd', 'autism', 'executive_function', 'sensory'],
      interpersonal: ['attachment', 'relationships', 'social'],
      wellbeing: ['resilience', 'stress', 'coping'],
      substance: ['alcohol', 'drugs'],
      trauma: ['aces', 'ptsd'],
      validity: ['inconsistency', 'infrequency', 'positive_impression']
    };

    // Pacing strategy: How many questions between topic switches
    this.optimalTopicRun = 3; // Ask 3 personality questions, then switch topic
    this.maxTopicRun = 5; // Never more than 5 questions on same topic

    // Assessment phases for natural progression
    this.phases = {
      warmup: { range: [0, 10], focus: 'broad_screening', variety: 'high' },
      exploration: { range: [10, 30], focus: 'trait_building', variety: 'medium' },
      deepening: { range: [30, 50], focus: 'clinical_validation', variety: 'medium' },
      precision: { range: [50, 65], focus: 'uncertainty_reduction', variety: 'low' },
      completion: { range: [65, 70], focus: 'gap_filling', variety: 'high' }
    };

    // ENHANCED INTELLIGENCE SYSTEMS
    this.bayesianNetwork = new BayesianBeliefNetwork();
    this.validityMonitor = new RealTimeValidityMonitor();
    this.patternDetector = new NeurodivergencePatternDetector();
    this.contradictionDetector = new SemanticContradictionDetector();
    this.adaptiveDifficulty = new AdaptiveQuestionDifficulty();

    // Track intelligence insights
    this.intelligenceInsights = {
      crossPredictions: {},
      validityFlags: [],
      patterns: {},
      contradictions: [],
      responseStyle: {}
    };
  }

  /**
   * Process a response through all intelligence systems
   * This updates cross-predictions, detects patterns, monitors validity, etc.
   *
   * @param {Object} response - Most recent response
   * @param {Array} allResponses - All responses including this one
   * @param {Number} responseTime - Time taken to respond (ms)
   * @param {Object} currentScores - Current trait scores
   * @returns {Object} Intelligence insights and any interventions needed
   */
  processResponseIntelligence(response, allResponses, responseTime, currentScores = {}) {
    const insights = {
      bayesianUpdate: null,
      validityAnalysis: null,
      contradictions: [],
      patternAnalysis: null,
      responseStyleAnalysis: null,
      interventions: [],
      flags: []
    };

    try {
      // 1. BAYESIAN BELIEF NETWORK: Update all trait estimates
      insights.bayesianUpdate = this.bayesianNetwork.updateBeliefs(response, allResponses);
      this.intelligenceInsights.crossPredictions = this.bayesianNetwork.getAllBeliefs();

      // Log cross-predictions
      const discrepancies = this.bayesianNetwork.detectDiscrepancies();
      if (discrepancies.length > 0) {
        console.log('[Bayesian Network] Detected discrepancies:', discrepancies.length);
        insights.flags.push(...discrepancies.map(d => ({
          type: 'CROSS_PREDICTION_DISCREPANCY',
          trait: d.trait,
          details: d
        })));
      }

      // 2. VALIDITY MONITORING: Check response validity
      insights.validityAnalysis = this.validityMonitor.monitor(
        response,
        response.value || response.response,
        responseTime,
        allResponses.slice(0, -1) // All except current
      );

      if (insights.validityAnalysis.flags.length > 0) {
        console.log('[Validity Monitor] Flags:', insights.validityAnalysis.flags);
        this.intelligenceInsights.validityFlags.push(...insights.validityAnalysis.flags);
        insights.interventions.push(...insights.validityAnalysis.interventions);
      }

      // 3. CONTRADICTION DETECTION: Check for logical contradictions
      insights.contradictions = this.contradictionDetector.detectContradictions(
        response,
        allResponses.slice(0, -1)
      );

      if (insights.contradictions.length > 0) {
        console.log('[Contradiction Detector] Found:', insights.contradictions.length, 'contradictions');
        this.intelligenceInsights.contradictions.push(...insights.contradictions);

        // Generate clarification for severe contradictions
        for (const contradiction of insights.contradictions) {
          if (contradiction.severity === 'HIGH') {
            const clarification = this.contradictionDetector.generateClarification(contradiction);
            insights.interventions.push(clarification);
          }
        }
      }

      // 4. PATTERN ANALYSIS: Detect neurodivergence patterns (every 10 responses)
      if (allResponses.length % 10 === 0 && allResponses.length >= 20) {
        const responseTimes = allResponses.map(r => r.responseTime).filter(t => t);
        insights.patternAnalysis = this.patternDetector.analyzePattern(
          allResponses,
          currentScores,
          responseTimes
        );

        this.intelligenceInsights.patterns = insights.patternAnalysis;

        // Log significant patterns
        if (insights.patternAnalysis.autism.likelihood !== 'LOW') {
          console.log('[Pattern Detector] Autism likelihood:', insights.patternAnalysis.autism.likelihood);
        }
        if (insights.patternAnalysis.adhd.likelihood !== 'LOW') {
          console.log('[Pattern Detector] ADHD likelihood:', insights.patternAnalysis.adhd.likelihood);
        }
      }

      // 5. ADAPTIVE DIFFICULTY: Analyze response style
      if (allResponses.length >= 10) {
        insights.responseStyleAnalysis = this.adaptiveDifficulty.analyzeResponsePattern(allResponses);
        this.intelligenceInsights.responseStyle = insights.responseStyleAnalysis;

        if (insights.responseStyleAnalysis.pattern !== 'INSUFFICIENT_DATA' &&
            insights.responseStyleAnalysis.pattern !== 'BALANCED') {
          console.log('[Adaptive Difficulty] Response pattern:', insights.responseStyleAnalysis.pattern);
        }
      }

    } catch (error) {
      console.error('[Intelligence Processing Error]:', error.message);
      // Don't fail the assessment if intelligence processing fails
    }

    return insights;
  }

  /**
   * Select the next single question
   * This is the core "intelligence" - called after every user response
   *
   * @param {Model} QuestionBank - Mongoose QuestionBank model
   * @param {Array} allResponses - All responses so far
   * @param {Array} askedQuestionIds - Question IDs already asked
   * @param {Object} confidenceTracker - Current confidence state
   * @param {String} assessmentTier - CORE (free 30Q), COMPREHENSIVE (paid 70Q), or CLINICAL_ADDON (optional clinical)
   * @param {Boolean} clinicalAddonEnabled - Whether user opted-in to clinical screening
   * @returns {Object} Next question to ask
   */
  async selectNextQuestion(QuestionBank, allResponses, askedQuestionIds, confidenceTracker, assessmentTier = 'COMPREHENSIVE', clinicalAddonEnabled = false) {
    const currentCount = allResponses.length;
    const currentPhase = this.determinePhase(currentCount);

    console.log(`\n[Intelligent Selector] Question ${currentCount + 1}/70 - Phase: ${currentPhase.focus} - Tier: ${assessmentTier}`);

    // TIER FILTERING: Determine which tiers are accessible
    const accessibleTiers = this.getAccessibleTiers(assessmentTier, clinicalAddonEnabled);
    console.log(`[Intelligent Selector] Accessible tiers: [${accessibleTiers.join(', ')}]`);

    // Get all candidate questions (not yet asked, within accessible tiers)
    const candidates = await QuestionBank.find({
      questionId: { $nin: askedQuestionIds },
      active: true,
      assessmentTiers: { $in: accessibleTiers } // TIER BOUNDARY ENFORCEMENT
    });

    console.log(`[Intelligent Selector] Evaluating ${candidates.length} candidate questions`);

    // TACTFUL FILTERING: Filter by sensitivity level and trigger conditions
    const appropriateCandidates = candidates.filter(q => {
      return this.checkQuestionAppropriate(q, currentCount, currentPhase, allResponses, confidenceTracker);
    });

    console.log(`[Intelligent Selector] ${appropriateCandidates.length} questions pass sensitivity filtering`);

    // Score each candidate using multi-factor priority system
    const scoredCandidates = appropriateCandidates.map(question => {
      const score = this.calculateQuestionPriority(
        question,
        allResponses,
        askedQuestionIds,
        confidenceTracker,
        currentPhase
      );

      return { question, score, breakdown: score.breakdown };
    });

    // Sort by total score (highest priority first)
    scoredCandidates.sort((a, b) => b.score.total - a.score.total);

    // Log top 5 candidates for debugging
    console.log('[Intelligent Selector] Top 5 candidates:');
    scoredCandidates.slice(0, 5).forEach((candidate, i) => {
      console.log(`  ${i + 1}. ${candidate.question.questionId} (score: ${candidate.score.total.toFixed(2)})`);
      console.log(`     Breakdown: ${JSON.stringify(candidate.breakdown)}`);
    });

    // Return highest-priority question
    const selected = scoredCandidates[0].question;
    console.log(`[Intelligent Selector] Selected: ${selected.questionId}\n`);

    return selected;
  }

  /**
   * Calculate priority score for a candidate question
   * This is where the "intelligence" happens
   *
   * Multi-factor scoring system:
   * 1. Information Gain (0-100): How much will this question reduce uncertainty?
   * 2. Context Diversity (0-100): How different is this from recent questions?
   * 3. Phase Alignment (0-100): How well does this fit current phase?
   * 4. Quality (0-100): discriminationIndex of the question
   * 5. Completion Priority (0-100): Does this complete an important instrument?
   */
  calculateQuestionPriority(question, allResponses, askedQuestionIds, confidenceTracker, currentPhase) {
    const weights = {
      informationGain: 0.30,      // 30% - What we learn (reduced to make room for adaptive)
      contextDiversity: 0.25,     // 25% - Natural flow
      phaseAlignment: 0.20,       // 20% - Right timing
      quality: 0.15,              // 15% - Question validity
      completionPriority: 0.05,   // 5%  - Finishing instruments
      adaptiveMatch: 0.05         // 5%  - Match to user's response style (NEW)
    };

    // Calculate each factor
    const informationGain = this.calculateInformationGain(question, confidenceTracker, allResponses);
    const contextDiversity = this.calculateContextDiversity(question, allResponses, askedQuestionIds);
    const phaseAlignment = this.calculatePhaseAlignment(question, currentPhase, allResponses);
    const quality = (question.adaptive?.discriminationIndex || 0.7) * 100;
    const completionPriority = this.calculateCompletionPriority(question, allResponses, askedQuestionIds);

    // NEW: Adaptive difficulty matching
    let adaptiveMatch = 50; // Default neutral
    if (this.intelligenceInsights.responseStyle && this.intelligenceInsights.responseStyle.preferredQuestionType) {
      adaptiveMatch = this.adaptiveDifficulty.scoreQuestionMatch(
        question,
        this.intelligenceInsights.responseStyle.preferredQuestionType
      );
    }

    // Use Bayesian cross-predictions to boost information gain for predicted high-value traits
    let crossPredictionBoost = 0;
    if (this.intelligenceInsights.crossPredictions) {
      const questionTrait = this.getQuestionPrimaryTrait(question);
      if (questionTrait && this.intelligenceInsights.crossPredictions[questionTrait]) {
        const belief = this.intelligenceInsights.crossPredictions[questionTrait];
        const crossPred = belief.crossPrediction;

        // If cross-prediction differs significantly from direct evidence, prioritize this question
        if (crossPred && crossPred.confidence > 0.50) {
          const diff = Math.abs(belief.current - crossPred.predicted);
          if (diff > 20) {
            crossPredictionBoost = 15; // Boost to validate discrepancy
          }
        }
      }
    }

    // Weighted sum
    const total =
      (informationGain * weights.informationGain) +
      (contextDiversity * weights.contextDiversity) +
      (phaseAlignment * weights.phaseAlignment) +
      (quality * weights.quality) +
      (completionPriority * weights.completionPriority) +
      (adaptiveMatch * weights.adaptiveMatch) +
      crossPredictionBoost;

    return {
      total,
      breakdown: {
        informationGain: Math.round(informationGain),
        contextDiversity: Math.round(contextDiversity),
        phaseAlignment: Math.round(phaseAlignment),
        quality: Math.round(quality),
        completionPriority: Math.round(completionPriority),
        adaptiveMatch: Math.round(adaptiveMatch),
        crossPredictionBoost: Math.round(crossPredictionBoost)
      }
    };
  }

  /**
   * Get primary trait measured by question
   */
  getQuestionPrimaryTrait(question) {
    return question.trait || question.subcategory || null;
  }

  /**
   * Calculate Information Gain
   * How much will this question reduce our uncertainty?
   *
   * High information gain = low confidence in related dimensions
   */
  calculateInformationGain(question, confidenceTracker, allResponses) {
    // Get dimensions this question measures
    const dimensions = DimensionMapper.getDimensions(question);

    if (dimensions.length === 0) {
      return 50; // Default moderate priority
    }

    // Calculate average confidence across dimensions this question measures
    let totalConfidence = 0;
    let count = 0;

    for (const dim of dimensions) {
      const dimData = confidenceTracker.dimensions.get(dim);
      if (dimData) {
        totalConfidence += dimData.confidence;
        count++;
      } else {
        // New dimension - high information gain
        totalConfidence += 0;
        count++;
      }
    }

    const avgConfidence = count > 0 ? totalConfidence / count : 0;

    // Invert confidence: low confidence = high information gain
    // 0% confidence → 100 information gain
    // 100% confidence → 0 information gain
    const informationGain = 100 - avgConfidence;

    // Boost for completely unmeasured dimensions
    const hasUnmeasuredDimension = dimensions.some(dim => !confidenceTracker.dimensions.has(dim));
    const boost = hasUnmeasuredDimension ? 20 : 0;

    return Math.min(100, informationGain + boost);
  }

  /**
   * Calculate Context Diversity
   * Avoid clustering similar questions together
   *
   * Penalize questions that are too similar to recent questions
   */
  calculateContextDiversity(question, allResponses, askedQuestionIds) {
    // Get recent questions (last N responses)
    const recentResponses = allResponses.slice(-this.contextWindow);

    if (recentResponses.length === 0) {
      return 100; // First question - no context to compare
    }

    let diversityScore = 100;

    // Check similarity to recent questions
    for (const recent of recentResponses) {
      const similarity = this.calculateQuestionSimilarity(question, recent);

      // Penalize based on similarity (more recent = bigger penalty)
      const recency = recentResponses.indexOf(recent) + 1; // 1 to N
      const recencyWeight = recency / recentResponses.length; // 0.2 to 1.0

      diversityScore -= similarity * recencyWeight * 20; // Up to -20 per similar question
    }

    // Check topic run length
    const currentTopicRun = this.getCurrentTopicRunLength(question, allResponses);
    if (currentTopicRun >= this.maxTopicRun) {
      diversityScore -= 50; // Heavy penalty for exceeding max run
    } else if (currentTopicRun >= this.optimalTopicRun) {
      diversityScore -= 20; // Moderate penalty for exceeding optimal run
    }

    return Math.max(0, diversityScore);
  }

  /**
   * Calculate similarity between two questions
   * Returns 0-1 (0 = completely different, 1 = identical topic)
   */
  calculateQuestionSimilarity(question1, question2) {
    let similarity = 0;

    // Same instrument (e.g., both PHQ-9)
    if (question1.instrument && question1.instrument === question2.instrument) {
      similarity += 0.4;
    }

    // Same category (e.g., both clinical_psychopathology)
    if (question1.category && question1.category === question2.category) {
      similarity += 0.2;
    }

    // Same trait (e.g., both measure neuroticism)
    if (question1.trait && question1.trait === question2.trait) {
      similarity += 0.2;
    }

    // Same subcategory (e.g., both depression)
    if (question1.subcategory && question1.subcategory === question2.subcategory) {
      similarity += 0.2;
    }

    return similarity;
  }

  /**
   * Calculate current topic run length
   * How many consecutive questions on same topic?
   */
  getCurrentTopicRunLength(question, allResponses) {
    if (allResponses.length === 0) return 0;

    const questionTopic = this.getQuestionTopic(question);
    let runLength = 0;

    // Count backwards from most recent
    for (let i = allResponses.length - 1; i >= 0; i--) {
      const responseTopic = this.getQuestionTopic(allResponses[i]);

      if (responseTopic === questionTopic) {
        runLength++;
      } else {
        break; // Topic changed, stop counting
      }
    }

    return runLength;
  }

  /**
   * Get high-level topic for a question
   */
  getQuestionTopic(question) {
    // Check which topic category this question belongs to
    for (const [topic, identifiers] of Object.entries(this.topicCategories)) {
      if (question.category === topic) return topic;
      if (identifiers.includes(question.trait)) return topic;
      if (identifiers.includes(question.subcategory)) return topic;
      if (question.tags?.some(tag => identifiers.includes(tag))) return topic;
    }

    return 'other';
  }

  /**
   * Calculate Phase Alignment
   * Does this question fit the current assessment phase?
   */
  calculatePhaseAlignment(question, currentPhase, allResponses) {
    const phaseFocus = currentPhase.focus;
    let alignmentScore = 50; // Base score

    switch (phaseFocus) {
      case 'broad_screening':
        // Warmup phase: Prefer baseline questions and easy starters
        if (question.tags?.includes('baseline')) alignmentScore += 30;
        if (question.category === 'personality') alignmentScore += 20;
        if (question.instrument?.includes('NEO')) alignmentScore += 10;
        break;

      case 'trait_building':
        // Exploration phase: Build out Big Five traits
        if (question.category === 'personality') alignmentScore += 25;
        if (question.trait) alignmentScore += 15;
        if (question.facet) alignmentScore += 10;
        break;

      case 'clinical_validation':
        // Deepening phase: Validate clinical flags
        if (question.category === 'clinical_psychopathology') alignmentScore += 30;
        if (question.category === 'neurodiversity') alignmentScore += 20;
        if (this.shouldValidateClinical(question, allResponses)) alignmentScore += 20;
        break;

      case 'uncertainty_reduction':
        // Precision phase: Target low-confidence dimensions
        // (Already handled by informationGain score)
        alignmentScore += 10;
        break;

      case 'gap_filling':
        // Completion phase: Fill any remaining gaps
        if (this.isGapFillingQuestion(question, allResponses)) alignmentScore += 30;
        break;
    }

    return Math.min(100, alignmentScore);
  }

  /**
   * Should we validate this clinical area?
   */
  shouldValidateClinical(question, allResponses) {
    // Check if user has shown indicators for this clinical area
    const subcategory = question.subcategory;
    if (!subcategory) return false;

    // Count how many times this subcategory was endorsed
    const endorsements = allResponses.filter(r =>
      r.subcategory === subcategory && (r.score || 0) >= 3
    ).length;

    // If 2+ endorsements, validate further
    return endorsements >= 2;
  }

  /**
   * Is this a gap-filling question?
   */
  isGapFillingQuestion(question, allResponses) {
    const askedCategories = new Set(allResponses.map(r => r.category));

    // Question from category we haven't covered yet
    if (!askedCategories.has(question.category)) return true;

    const askedInstruments = new Set(allResponses.map(r => r.instrument).filter(Boolean));

    // Question from instrument we haven't used yet
    if (question.instrument && !askedInstruments.has(question.instrument)) return true;

    return false;
  }

  /**
   * Calculate Completion Priority
   * Boost priority for completing important instruments
   */
  calculateCompletionPriority(question, allResponses, askedQuestionIds) {
    if (!question.instrument) return 0;

    // Check how many questions from this instrument have been asked
    const instrumentResponses = allResponses.filter(r => r.instrument === question.instrument);

    // Check total questions in this instrument
    const instrumentSize = this.getInstrumentSize(question.instrument);

    if (instrumentSize === 0) return 0;

    const completion = instrumentResponses.length / instrumentSize;

    // Boost priority if we're close to completing an instrument (75%+ done)
    if (completion >= 0.75) {
      return 80; // High priority to finish
    } else if (completion >= 0.5) {
      return 40; // Moderate priority
    } else {
      return 0; // Low priority (just started)
    }
  }

  /**
   * Get instrument size (approximate)
   */
  getInstrumentSize(instrument) {
    const sizes = {
      'PHQ-9': 9,
      'GAD-7': 7,
      'MDQ': 13,
      'PQ-B': 21,
      'PHQ-15': 15,
      'MSI-BPD': 10,
      'ASRS-5': 5,
      'AQ-10': 10,
      'AUDIT': 10,
      'DAST': 10,
      'ACEs': 10,
      'CD-RISC': 10,
      'IIP-32': 32,
      'HEXACO-60': 60,
      'NEO-PI-R': 240
    };

    return sizes[instrument] || 10; // Default 10
  }

  /**
   * Determine current assessment phase
   */
  determinePhase(questionCount) {
    for (const [phaseName, config] of Object.entries(this.phases)) {
      const [min, max] = config.range;
      if (questionCount >= min && questionCount < max) {
        return { name: phaseName, ...config };
      }
    }

    return this.phases.completion; // Default to completion phase
  }

  /**
   * Check if a question is appropriate to ask based on sensitivity and trigger conditions
   * Implements tactful assessment logic from TACTFUL-BASELINE-PROPOSAL
   */
  checkQuestionAppropriate(question, currentCount, currentPhase, allResponses, confidenceTracker) {
    const sensitivity = question.sensitivity || 'NONE';
    const requiredSignals = question.requiredSignals;

    // TIER 1: Filter by sensitivity level based on question count
    if (sensitivity === 'EXTREME' && currentCount < 40) {
      console.log(`[Tactful Filter] Skipping ${question.questionId} - EXTREME sensitivity too early (Q${currentCount})`);
      return false;
    }

    if (sensitivity === 'HIGH' && currentCount < 30) {
      console.log(`[Tactful Filter] Skipping ${question.questionId} - HIGH sensitivity too early (Q${currentCount})`);
      return false;
    }

    if (sensitivity === 'MODERATE' && currentCount < 20) {
      console.log(`[Tactful Filter] Skipping ${question.questionId} - MODERATE sensitivity too early (Q${currentCount})`);
      return false;
    }

    // TIER 2: Check required signals/trigger conditions
    if (requiredSignals) {
      if (!this.checkTriggerConditions(question, currentCount, currentPhase, allResponses, confidenceTracker)) {
        console.log(`[Tactful Filter] Skipping ${question.questionId} - trigger conditions not met`);
        return false;
      }
    }

    return true; // Question is appropriate to ask
  }

  /**
   * Check if trigger conditions are met for a question
   */
  checkTriggerConditions(question, currentCount, currentPhase, allResponses, confidenceTracker) {
    const signals = question.requiredSignals;

    // Check minimum question count
    if (signals.minQuestionCount && currentCount < signals.minQuestionCount) {
      return false;
    }

    // Check required phase
    if (signals.requiredPhase && currentPhase.focus !== signals.requiredPhase) {
      return false;
    }

    // Check trigger conditions
    if (!signals.triggerConditions || signals.triggerConditions.length === 0) {
      return true; // No specific conditions, just check count/phase
    }

    const meetsCondition = (condition) => {
      const dimension = condition.dimension;

      // Get current score/level for this dimension
      const dimData = confidenceTracker.dimensions.get(dimension);
      if (!dimData) return false; // Dimension not yet measured

      const score = dimData.estimate || 0;

      // Check score thresholds
      if (condition.minScore !== undefined && score < condition.minScore) return false;
      if (condition.maxScore !== undefined && score > condition.maxScore) return false;

      // Check severity level (for clinical dimensions)
      if (condition.minLevel) {
        const severityLevels = { minimal: 1, mild: 2, moderate: 3, severe: 4, extreme: 5 };
        const currentLevel = this.getSeverityLevel(score);
        const requiredLevel = severityLevels[condition.minLevel];
        const currentLevelNum = severityLevels[currentLevel];

        if (currentLevelNum < requiredLevel) return false;
      }

      return true;
    };

    // Check if ANY or ALL conditions must be met
    const anyOf = signals.anyOf || false;

    if (anyOf) {
      // At least one condition must be met
      return signals.triggerConditions.some(meetsCondition);
    } else {
      // ALL conditions must be met
      return signals.triggerConditions.every(meetsCondition);
    }
  }

  /**
   * Get severity level from a score (0-100 scale)
   */
  getSeverityLevel(score) {
    if (score < 20) return 'minimal';
    if (score < 40) return 'mild';
    if (score < 60) return 'moderate';
    if (score < 80) return 'severe';
    return 'extreme';
  }

  /**
   * Get assessment progress message
   */
  getProgressMessage(questionCount, currentPhase, confidenceTracker) {
    const remaining = 70 - questionCount;

    switch (currentPhase.name) {
      case 'warmup':
        return `Getting to know you... (${remaining} questions remaining)`;

      case 'exploration':
        const avgConfidence = confidenceTracker.getAverageConfidence();
        return `Building your profile... ${Math.round(avgConfidence)}% confident (${remaining} questions remaining)`;

      case 'deepening':
        return `Exploring key areas in depth... (${remaining} questions remaining)`;

      case 'precision':
        return `Fine-tuning your unique patterns... (${remaining} questions remaining)`;

      case 'completion':
        return `Nearly complete! (${remaining} questions remaining)`;

      default:
        return `Assessment in progress (${remaining} questions remaining)`;
    }
  }

  /**
   * Get comprehensive intelligence insights
   * Called at end of assessment for report generation
   */
  getIntelligenceInsights() {
    return {
      // Bayesian cross-predictions
      crossPredictions: this.bayesianNetwork.getAllBeliefs(),
      discrepancies: this.bayesianNetwork.detectDiscrepancies(),

      // Validity analysis
      validity: this.validityMonitor.getValidityReport(),

      // Pattern detection
      patterns: this.intelligenceInsights.patterns,

      // Contradiction summary
      contradictions: this.contradictionDetector.getSummary(this.intelligenceInsights.contradictions),

      // Response style
      responseStyle: this.intelligenceInsights.responseStyle,

      // Overall intelligence summary
      summary: {
        totalFlags: this.intelligenceInsights.validityFlags.length,
        totalContradictions: this.intelligenceInsights.contradictions.length,
        overallValidity: this.validityMonitor.validityData.overallValidity,
        intelligenceVersion: '2.0-ENHANCED'
      }
    };
  }

  /**
   * Reset all intelligence systems for new assessment
   */
  resetIntelligence() {
    this.bayesianNetwork.reset();
    this.validityMonitor.reset();
    this.adaptiveDifficulty.reset();

    this.intelligenceInsights = {
      crossPredictions: {},
      validityFlags: [],
      patterns: {},
      contradictions: [],
      responseStyle: {}
    };
  }

  /**
   * Get accessible assessment tiers based on user's tier and opt-ins
   *
   * TIER STRUCTURE:
   * - CORE (Free, 30Q): Personality + light ND screening, NO clinical content
   * - COMPREHENSIVE (Paid, 70Q): CORE + personality facets + brief screeners (PHQ-2, GAD-2)
   * - CLINICAL_ADDON (Optional): Full clinical batteries + suicide screening
   *
   * @param {String} assessmentTier - CORE or COMPREHENSIVE
   * @param {Boolean} clinicalAddonEnabled - Whether user opted-in to clinical add-on
   * @returns {Array<String>} List of accessible tiers
   */
  getAccessibleTiers(assessmentTier, clinicalAddonEnabled) {
    const tiers = [];

    if (assessmentTier === 'CORE') {
      // Free tier: Only CORE questions
      tiers.push('CORE');
    } else if (assessmentTier === 'COMPREHENSIVE') {
      // Paid tier: CORE + COMPREHENSIVE questions
      tiers.push('CORE', 'COMPREHENSIVE');

      // If clinical addon enabled, also include CLINICAL_ADDON questions
      if (clinicalAddonEnabled) {
        tiers.push('CLINICAL_ADDON');
      }
    }

    return tiers;
  }
}

module.exports = IntelligentQuestionSelector;
