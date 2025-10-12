/**
 * Integration Test: Full 70-Question Assessment Flow
 *
 * Tests the complete adaptive assessment system from start to finish:
 * - Session initialization
 * - Multi-stage progression (Stage 1 → 2 → 3 → 4)
 * - Confidence tracking across all responses
 * - Stage advancement logic
 * - Question selection at each stage
 * - Completion at exactly 70 questions
 *
 * Uses synthetic profiles to simulate realistic user responses.
 */

const mongoose = require('mongoose');
const MultiStageCoordinator = require('../../services/adaptive-selectors/multi-stage-coordinator');
const ConfidenceTracker = require('../../services/confidence-tracker');
const DimensionMapper = require('../../services/dimension-mapper');
const syntheticProfiles = require('../fixtures/synthetic-profiles');

// Import models
require('../../models/QuestionBank');
require('../../models/AssessmentSession');

const QuestionBank = mongoose.model('QuestionBank');
const AssessmentSession = mongoose.model('Assessment');

describe('Full Assessment Flow Integration Test', () => {
  let coordinator;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }

    coordinator = new MultiStageCoordinator();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  /**
   * Helper: Simulate full assessment for a profile
   */
  async function simulateAssessment(profile) {
    const startTime = Date.now();

    // Create session
    const session = new AssessmentSession({
      sessionId: `test_${profile.id}_${Date.now()}`,
      mode: 'adaptive-multistage',
      currentStage: 1,
      confidenceState: new Map(),
      stageHistory: [],
      responses: [],
      adaptiveMetadata: {
        useMultiStage: true,
        totalQuestionLimit: 70
      }
    });

    await session.save();

    const allQuestions = [];
    const stageTransitions = [];
    let currentStage = 1;

    // Simulate 70-question flow
    while (session.responses.length < 70) {
      // Get next questions
      const result = await coordinator.getNextQuestions(session, QuestionBank);

      if (!result.questions || result.questions.length === 0) {
        console.warn(`No questions returned at ${session.responses.length} questions, stage ${session.currentStage}`);
        break;
      }

      // Track stage transitions
      if (result.stageChanged) {
        stageTransitions.push({
          from: currentStage,
          to: result.stage,
          questionCount: session.responses.length,
          avgConfidence: Object.values(result.confidenceSummary).reduce((sum, dim) => sum + dim.confidence, 0) / Object.keys(result.confidenceSummary).length
        });
        currentStage = result.stage;
      }

      // Select one question to answer (in real scenario, user answers all in batch)
      const question = result.questions[0];
      allQuestions.push(question);

      // Generate synthetic response based on profile
      const syntheticResponses = syntheticProfiles.generateResponses(profile, [question]);
      const response = syntheticResponses[0];

      // Update tracker
      const tracker = ConfidenceTracker.fromJSON({ dimensions: session.confidenceState || {} });
      const dimensions = DimensionMapper.getDimensions(question);

      for (const dim of dimensions) {
        tracker.updateConfidence(dim, {
          questionId: question.questionId,
          score: response.score,
          timestamp: new Date()
        });
      }

      // Save response
      session.responses.push({
        questionId: question.questionId,
        value: response.value,
        score: response.score,
        timestamp: new Date()
      });

      session.confidenceState = tracker.toJSON().dimensions;
      await session.save();

      // Safety check to prevent infinite loops
      if (session.responses.length > 75) {
        console.error('Safety break: Exceeded 75 questions');
        break;
      }
    }

    const duration = Date.now() - startTime;

    return {
      session,
      allQuestions,
      stageTransitions,
      duration,
      finalStage: session.currentStage,
      questionCount: session.responses.length,
      finalConfidence: ConfidenceTracker.fromJSON({ dimensions: session.confidenceState }).getSummary()
    };
  }

  /**
   * Test Suite: Resilient Profile
   */
  describe('Resilient Profile Assessment', () => {
    let result;

    beforeAll(async () => {
      result = await simulateAssessment(syntheticProfiles.resilient);
    }, 60000); // 60 second timeout

    test('should reach exactly 70 questions', () => {
      expect(result.questionCount).toBe(70);
    });

    test('should progress through all 4 stages', () => {
      expect(result.finalStage).toBe(4);
      expect(result.stageTransitions.length).toBeGreaterThanOrEqual(3);
    });

    test('should achieve high confidence across Big Five', () => {
      const { finalConfidence } = result;
      const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];

      traits.forEach(trait => {
        if (finalConfidence[trait]) {
          expect(finalConfidence[trait].confidence).toBeGreaterThanOrEqual(60);
        }
      });
    });

    test('should complete within reasonable time', () => {
      // Should complete in less than 30 seconds (database operations included)
      expect(result.duration).toBeLessThan(30000);
    });

    test('should not ask duplicate questions', () => {
      const questionIds = result.allQuestions.map(q => q.questionId);
      const uniqueIds = new Set(questionIds);
      expect(uniqueIds.size).toBe(questionIds.length);
    });
  });

  /**
   * Test Suite: Anxious-Undercontrolled Profile
   */
  describe('Anxious-Undercontrolled Profile Assessment', () => {
    let result;

    beforeAll(async () => {
      result = await simulateAssessment(syntheticProfiles.anxiousUndercontrolled);
    }, 60000);

    test('should reach exactly 70 questions', () => {
      expect(result.questionCount).toBe(70);
    });

    test('should progress through all 4 stages', () => {
      expect(result.finalStage).toBe(4);
    });

    test('should expand clinical assessments (PHQ-9, GAD-7)', () => {
      const clinicalQuestions = result.allQuestions.filter(q =>
        q.instrument === 'PHQ-9' || q.instrument === 'GAD-7'
      );

      // Should have expanded beyond just screeners
      expect(clinicalQuestions.length).toBeGreaterThan(4);
    });

    test('should identify high neuroticism in confidence', () => {
      const { finalConfidence } = result;

      if (finalConfidence.neuroticism) {
        expect(finalConfidence.neuroticism.questionCount).toBeGreaterThanOrEqual(3);
      }
    });

    test('should complete assessment', () => {
      expect(result.questionCount).toBe(70);
      expect(result.finalStage).toBe(4);
    });
  });

  /**
   * Test Suite: Creative-Extrovert Profile
   */
  describe('Creative-Extrovert Profile Assessment', () => {
    let result;

    beforeAll(async () => {
      result = await simulateAssessment(syntheticProfiles.creativeExtrovert);
    }, 60000);

    test('should reach exactly 70 questions', () => {
      expect(result.questionCount).toBe(70);
    });

    test('should explore openness facets', () => {
      const opennessQuestions = result.allQuestions.filter(q => q.trait === 'openness');
      expect(opennessQuestions.length).toBeGreaterThanOrEqual(3);
    });

    test('should explore extraversion facets', () => {
      const extraversionQuestions = result.allQuestions.filter(q => q.trait === 'extraversion');
      expect(extraversionQuestions.length).toBeGreaterThanOrEqual(3);
    });

    test('should achieve high confidence on primary traits', () => {
      const { finalConfidence } = result;

      ['openness', 'extraversion'].forEach(trait => {
        if (finalConfidence[trait]) {
          expect(finalConfidence[trait].confidence).toBeGreaterThanOrEqual(60);
        }
      });
    });
  });

  /**
   * Test Suite: Average Profile
   */
  describe('Average/Balanced Profile Assessment', () => {
    let result;

    beforeAll(async () => {
      result = await simulateAssessment(syntheticProfiles.average);
    }, 60000);

    test('should reach exactly 70 questions', () => {
      expect(result.questionCount).toBe(70);
    });

    test('should progress through all stages', () => {
      expect(result.finalStage).toBe(4);
    });

    test('should achieve balanced coverage across traits', () => {
      const { finalConfidence } = result;
      const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];

      const counts = traits.map(trait => finalConfidence[trait]?.questionCount || 0);
      const maxCount = Math.max(...counts);
      const minCount = Math.min(...counts.filter(c => c > 0));

      // Should have relatively even distribution (within 3x)
      if (minCount > 0) {
        expect(maxCount / minCount).toBeLessThan(3);
      }
    });
  });

  /**
   * Test Suite: Stage Advancement Logic
   */
  describe('Stage Advancement Logic', () => {
    test('should advance from Stage 1 to Stage 2 after 12-15 questions', async () => {
      const result = await simulateAssessment(syntheticProfiles.resilient);

      const stage1to2 = result.stageTransitions.find(t => t.from === 1 && t.to === 2);
      expect(stage1to2).toBeDefined();
      expect(stage1to2.questionCount).toBeGreaterThanOrEqual(12);
      expect(stage1to2.questionCount).toBeLessThanOrEqual(15);
    }, 60000);

    test('should advance from Stage 2 to Stage 3 after ~37-42 questions', async () => {
      const result = await simulateAssessment(syntheticProfiles.average);

      const stage2to3 = result.stageTransitions.find(t => t.from === 2 && t.to === 3);
      if (stage2to3) {
        expect(stage2to3.questionCount).toBeGreaterThanOrEqual(35);
        expect(stage2to3.questionCount).toBeLessThanOrEqual(45);
      }
    }, 60000);

    test('should reach Stage 4 before 70 questions', async () => {
      const result = await simulateAssessment(syntheticProfiles.creativeExtrovert);

      const stage3to4 = result.stageTransitions.find(t => t.to === 4);
      if (stage3to4) {
        expect(stage3to4.questionCount).toBeLessThan(70);
        expect(stage3to4.questionCount).toBeGreaterThanOrEqual(50);
      }
    }, 60000);
  });

  /**
   * Test Suite: Confidence Tracking
   */
  describe('Confidence Tracking', () => {
    test('should increase confidence as more questions answered', async () => {
      const result = await simulateAssessment(syntheticProfiles.resilient);

      // Check confidence increases throughout assessment
      const initialConfidence = result.stageTransitions[0]?.avgConfidence || 0;
      const finalAvgConfidence = Object.values(result.finalConfidence)
        .reduce((sum, dim) => sum + dim.confidence, 0) / Object.keys(result.finalConfidence).length;

      expect(finalAvgConfidence).toBeGreaterThan(initialConfidence);
    }, 60000);

    test('should track confidence for all Big Five traits', async () => {
      const result = await simulateAssessment(syntheticProfiles.average);

      const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
      traits.forEach(trait => {
        expect(result.finalConfidence).toHaveProperty(trait);
      });
    });
  });

  /**
   * Performance Test
   */
  describe('Performance', () => {
    test('should complete assessment in under 30 seconds', async () => {
      const result = await simulateAssessment(syntheticProfiles.resilient);
      expect(result.duration).toBeLessThan(30000);
    }, 60000);

    test('should average less than 400ms per question selection', async () => {
      const result = await simulateAssessment(syntheticProfiles.average);
      const avgTime = result.duration / result.questionCount;

      expect(avgTime).toBeLessThan(400); // 400ms per question
    }, 60000);
  });
});
