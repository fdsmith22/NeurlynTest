/**
 * Multi-Stage Coordinator - Master orchestrator for 4-stage adaptive system
 * Decides which stage to use and delegates to appropriate selector
 *
 * Stage Flow:
 * Stage 1 (12-15q) → Stage 2 (25-30q) → Stage 3 (15-20q) → Stage 4 (5-10q) = 70 total
 *
 * Stage Advancement Criteria:
 * - Stage 1 → 2: After 12-15 questions answered
 * - Stage 2 → 3: After ~40 questions, avg confidence ≥60%
 * - Stage 3 → 4: After ~57 questions, avg confidence ≥75%
 * - Stage 4: Final push to exactly 70 questions
 */

const Stage1BroadScreening = require('./stage-1-broad-screening');
const Stage2TargetedBuilding = require('./stage-2-targeted-building');
const Stage3PrecisionRefinement = require('./stage-3-precision-refinement');
const Stage4GapFilling = require('./stage-4-gap-filling');
const ConfidenceTracker = require('../confidence-tracker');

class MultiStageCoordinator {
  constructor() {
    this.stage1 = new Stage1BroadScreening();
    this.stage2 = new Stage2TargetedBuilding();
    this.stage3 = new Stage3PrecisionRefinement();
    this.stage4 = new Stage4GapFilling();

    // Stage advancement thresholds
    this.thresholds = {
      1: { minQuestions: 12, minConfidence: 30, nextStageAt: 15 },
      2: { minQuestions: 37, minConfidence: 60, nextStageAt: 42 },
      3: { minQuestions: 55, minConfidence: 75, nextStageAt: 60 },
      4: { targetTotal: 70 } // Final stage - fill to 70
    };
  }

  /**
   * Get next questions for current session
   * Decides stage and delegates to appropriate selector
   *
   * @param {Object} session - Assessment session (with responses, currentStage, confidenceState)
   * @param {Model} QuestionBank - Mongoose QuestionBank model
   * @returns {Object} { questions, stage, stageMessage, confidenceSummary, stageChanged }
   */
  async getNextQuestions(session, QuestionBank) {
    const currentStage = session.currentStage || 1;
    const allResponses = [...(session.baselineResponses || []), ...(session.adaptiveResponses || []), ...(session.responses || [])];
    const presentedQuestions = session.presentedQuestions || allResponses.map(r => r.questionId);

    // Restore confidence tracker
    // Convert Mongoose Map to plain object to avoid internal properties
    const confidencePlain = session.confidenceState instanceof Map
      ? Object.fromEntries(session.confidenceState)
      : (session.confidenceState || {});

    const tracker = ConfidenceTracker.fromJSON({
      dimensions: confidencePlain
    });

    // Check if should advance stage
    const newStage = this.shouldAdvanceStage(currentStage, tracker, allResponses);
    const stageChanged = newStage !== currentStage;

    if (stageChanged) {
      await this.recordStageTransition(session, currentStage, newStage, tracker);
      session.currentStage = newStage;
    }

    // Select questions for current/new stage
    const questions = await this.selectQuestionsForStage(
      session.currentStage,
      QuestionBank,
      tracker,
      allResponses,
      presentedQuestions
    );

    return {
      questions,
      stage: session.currentStage,
      stageChanged,
      stageMessage: this.getStageMessage(session.currentStage),
      progressMessage: this.getProgressMessage(tracker, allResponses.length),
      confidenceSummary: tracker.getSummary(),
      skipNotifications: this.getSkipNotifications(tracker)
    };
  }

  /**
   * Determine if should advance to next stage
   *
   * @param {Number} currentStage - Current stage (1-4)
   * @param {Object} tracker - ConfidenceTracker instance
   * @param {Array} responses - All responses so far
   * @returns {Number} Stage number (1-4)
   */
  shouldAdvanceStage(currentStage, tracker, responses) {
    // Stage 4 is final
    if (currentStage === 4) return 4;
    if (currentStage > 4) return 4;

    const threshold = this.thresholds[currentStage];
    if (!threshold) return currentStage;

    const questionCount = responses.length;
    const avgConfidence = this.getAverageConfidence(tracker);

    // Must meet BOTH criteria to advance:
    // 1. Minimum questions answered
    // 2. Minimum confidence achieved (or reached nextStageAt)

    if (questionCount < threshold.minQuestions) {
      return currentStage; // Not enough questions yet
    }

    // Advanced based on confidence OR reaching nextStageAt question count
    if (avgConfidence >= threshold.minConfidence || questionCount >= threshold.nextStageAt) {
      return currentStage + 1;
    }

    return currentStage;
  }

  /**
   * Select questions for specific stage
   *
   * @param {Number} stage - Stage number (1-4)
   * @param {Model} QuestionBank - Mongoose QuestionBank model
   * @param {Object} tracker - ConfidenceTracker instance
   * @param {Array} responses - All responses so far
   * @param {Array} presentedQuestions - Question IDs already asked
   * @returns {Array} Selected questions
   */
  async selectQuestionsForStage(stage, QuestionBank, tracker, responses, presentedQuestions) {
    switch (stage) {
      case 1:
        return await this.stage1.selectQuestions(QuestionBank, presentedQuestions);

      case 2:
        return await this.stage2.selectQuestions(QuestionBank, tracker, responses, presentedQuestions);

      case 3:
        return await this.stage3.selectQuestions(QuestionBank, tracker, responses, presentedQuestions);

      case 4:
        return await this.stage4.selectQuestions(QuestionBank, tracker, responses, presentedQuestions, 70);

      default:
        throw new Error(`Invalid stage: ${stage}`);
    }
  }

  /**
   * Get average confidence across Big Five traits
   */
  getAverageConfidence(tracker) {
    const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    let total = 0;
    let count = 0;

    for (const trait of traits) {
      const dim = tracker.dimensions.get(trait);
      if (dim) {
        total += dim.confidence;
        count++;
      }
    }

    return count > 0 ? total / count : 0;
  }

  /**
   * Record stage transition in session
   */
  async recordStageTransition(session, oldStage, newStage, tracker) {
    const summary = tracker.getSummary();

    // Use session method if available
    if (typeof session.recordStageTransition === 'function') {
      session.recordStageTransition(oldStage, summary);
    } else {
      // Manual recording if method not available
      if (!session.stageHistory) {
        session.stageHistory = [];
      }

      session.stageHistory.push({
        stage: oldStage,
        completedAt: new Date(),
        questionsAsked: (session.responses || []).length,
        confidenceSummary: summary
      });
    }

    // Log transition
    console.log(`[MultiStageCoordinator] Stage ${oldStage} → ${newStage}`, {
      sessionId: session.sessionId || session._id,
      avgConfidence: Math.round(this.getAverageConfidence(tracker)),
      questionCount: (session.responses || []).length
    });
  }

  /**
   * Get user-facing message for stage
   */
  getStageMessage(stage) {
    const messages = {
      1: 'Getting to know you - building initial profile',
      2: 'Exploring key areas in depth',
      3: 'Fine-tuning your unique patterns',
      4: 'Completing comprehensive assessment'
    };
    return messages[stage] || '';
  }

  /**
   * Get progress message based on confidence
   */
  getProgressMessage(tracker, questionCount) {
    const summary = tracker.getSummary();
    const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];

    // Find trait with lowest confidence
    let lowestTrait = null;
    let lowestConfidence = 100;

    for (const trait of traits) {
      const dim = summary[trait];
      if (dim && dim.confidence < lowestConfidence) {
        lowestConfidence = dim.confidence;
        lowestTrait = trait;
      }
    }

    // Questions remaining
    const remaining = Math.max(0, 70 - questionCount);

    // Only show "nearly complete" if we've actually answered most questions
    if (lowestConfidence >= 85 && questionCount >= 50) {
      return `Assessment nearly complete - ${remaining} questions remaining`;
    } else if (lowestTrait) {
      const displayName = lowestTrait.charAt(0).toUpperCase() + lowestTrait.slice(1);
      return `Building your ${displayName} profile... ${Math.round(lowestConfidence)}% confident (${remaining} questions remaining)`;
    } else {
      return `Building your comprehensive personality profile (${remaining} questions remaining)`;
    }
  }

  /**
   * Get skip notifications for dimensions that reached threshold
   */
  getSkipNotifications(tracker) {
    const skippable = tracker.getSkippableDimensions(85, 2);

    return skippable.map(dim => ({
      type: 'skip',
      dimension: dim.dimension,
      confidence: dim.confidence,
      message: `Skipping additional ${dim.dimension} questions - pattern is clear (${Math.round(dim.confidence)}% confident)`
    }));
  }

  /**
   * Check if assessment is complete
   */
  isComplete(session) {
    const allResponses = [...(session.baselineResponses || []), ...(session.adaptiveResponses || []), ...(session.responses || [])];
    return allResponses.length >= 70;
  }

  /**
   * Get overall assessment progress
   */
  getProgress(session) {
    const allResponses = [...(session.baselineResponses || []), ...(session.adaptiveResponses || []), ...(session.responses || [])];
    const current = allResponses.length;
    const total = 70;
    const percentage = Math.round((current / total) * 100);

    return {
      current,
      total,
      percentage,
      remaining: total - current,
      stage: session.currentStage || 1,
      complete: current >= total
    };
  }

  /**
   * Get stage-specific statistics
   */
  getStageStatistics(session) {
    const stageHistory = session.stageHistory || [];

    return {
      currentStage: session.currentStage || 1,
      stagesCompleted: stageHistory.length,
      stageHistory: stageHistory.map(s => ({
        stage: s.stage,
        questionsAsked: s.questionsAsked,
        completedAt: s.completedAt,
        avgConfidence: this.calculateAvgFromSummary(s.confidenceSummary)
      }))
    };
  }

  /**
   * Calculate average confidence from summary object
   */
  calculateAvgFromSummary(summary) {
    if (!summary || typeof summary !== 'object') return 0;

    const summaryObj = summary instanceof Map ? Object.fromEntries(summary) : summary;
    const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];

    let total = 0;
    let count = 0;

    for (const trait of traits) {
      if (summaryObj[trait]?.confidence) {
        total += summaryObj[trait].confidence;
        count++;
      }
    }

    return count > 0 ? Math.round(total / count) : 0;
  }
}

module.exports = MultiStageCoordinator;
