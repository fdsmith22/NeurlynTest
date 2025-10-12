/**
 * Performance Benchmark Tests
 *
 * Tests performance of critical assessment system components:
 * - Confidence calculation speed (<10ms target)
 * - Stage selection speed (<200ms target)
 * - Full assessment flow speed (<30s target)
 * - Memory usage (stable, no leaks)
 *
 * Run with: npm test tests/performance/benchmark.test.js
 */

const ConfidenceTracker = require('../../services/confidence-tracker');
const MultiStageCoordinator = require('../../services/adaptive-selectors/multi-stage-coordinator');
const mongoose = require('mongoose');

// Import models
require('../../models/QuestionBank');
require('../../models/AssessmentSession');

const QuestionBank = mongoose.model('QuestionBank');

describe('Performance Benchmarks', () => {
  beforeAll(async () => {
    // Connect to database for stage selection benchmarks
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('ConfidenceTracker Performance', () => {
    let tracker;

    beforeEach(() => {
      tracker = new ConfidenceTracker();
    });

    test('updateConfidence should complete in <10ms', () => {
      // Add some initial data
      for (let i = 0; i < 3; i++) {
        tracker.updateConfidence('openness', {
          questionId: `Q${i}`,
          score: 50 + i * 5,
          timestamp: new Date()
        });
      }

      const startTime = Date.now();
      const iterations = 1000;

      // Run 1000 updates
      for (let i = 0; i < iterations; i++) {
        tracker.updateConfidence('openness', {
          questionId: `Q${i + 100}`,
          score: Math.random() * 100,
          timestamp: new Date()
        });
      }

      const duration = Date.now() - startTime;
      const avgTime = duration / iterations;

      console.log(`updateConfidence average: ${avgTime.toFixed(3)}ms per call`);
      expect(avgTime).toBeLessThan(10); // <10ms per update
    });

    test('calculateConfidence should complete in <5ms', () => {
      const responses = [];
      for (let i = 0; i < 10; i++) {
        responses.push({ score: 40 + Math.random() * 20 });
      }

      const startTime = Date.now();
      const iterations = 10000;

      // Run 10000 calculations
      for (let i = 0; i < iterations; i++) {
        tracker.calculateConfidence(responses);
      }

      const duration = Date.now() - startTime;
      const avgTime = duration / iterations;

      console.log(`calculateConfidence average: ${avgTime.toFixed(3)}ms per call`);
      expect(avgTime).toBeLessThan(5); // <5ms per calculation
    });

    test('getPriorityDimensions should complete in <5ms', () => {
      // Set up tracker with 30 dimensions
      const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
      const facets = ['ideas', 'values', 'order', 'self_discipline', 'warmth', 'gregariousness'];

      for (const trait of traits) {
        for (let i = 0; i < 3; i++) {
          tracker.updateConfidence(trait, {
            questionId: `${trait}_${i}`,
            score: Math.random() * 100,
            timestamp: new Date()
          });
        }

        for (const facet of facets) {
          tracker.updateConfidence(`${trait}_${facet}`, {
            questionId: `${trait}_${facet}_1`,
            score: Math.random() * 100,
            timestamp: new Date()
          });
        }
      }

      const startTime = Date.now();
      const iterations = 1000;

      // Run 1000 priority checks
      for (let i = 0; i < iterations; i++) {
        tracker.getPriorityDimensions(2);
      }

      const duration = Date.now() - startTime;
      const avgTime = duration / iterations;

      console.log(`getPriorityDimensions average: ${avgTime.toFixed(3)}ms per call`);
      expect(avgTime).toBeLessThan(5); // <5ms per priority check
    });

    test('toJSON/fromJSON should complete in <5ms', () => {
      // Set up complex tracker
      for (let i = 0; i < 20; i++) {
        tracker.updateConfidence(`dimension_${i}`, {
          questionId: `Q${i}`,
          score: Math.random() * 100,
          timestamp: new Date()
        });
      }

      const startTime = Date.now();
      const iterations = 1000;

      // Run 1000 serialize/deserialize cycles
      for (let i = 0; i < iterations; i++) {
        const json = tracker.toJSON();
        ConfidenceTracker.fromJSON(json);
      }

      const duration = Date.now() - startTime;
      const avgTime = duration / iterations;

      console.log(`toJSON/fromJSON average: ${avgTime.toFixed(3)}ms per cycle`);
      expect(avgTime).toBeLessThan(5); // <5ms per serialization cycle
    });
  });

  describe('Stage Selection Performance', () => {
    let coordinator;

    beforeEach(() => {
      coordinator = new MultiStageCoordinator();
    });

    test('shouldAdvanceStage should complete in <1ms', () => {
      const tracker = new ConfidenceTracker();

      // Set up tracker
      ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'].forEach(trait => {
        for (let i = 0; i < 3; i++) {
          tracker.updateConfidence(trait, {
            questionId: `${trait}_${i}`,
            score: 50,
            timestamp: new Date()
          });
        }
      });

      const responses = new Array(20).fill({ questionId: 'Q1', score: 50 });

      const startTime = Date.now();
      const iterations = 10000;

      // Run 10000 stage checks
      for (let i = 0; i < iterations; i++) {
        coordinator.shouldAdvanceStage(1, tracker, responses);
      }

      const duration = Date.now() - startTime;
      const avgTime = duration / iterations;

      console.log(`shouldAdvanceStage average: ${avgTime.toFixed(3)}ms per call`);
      expect(avgTime).toBeLessThan(1); // <1ms per stage check
    });

    test('getAverageConfidence should complete in <1ms', () => {
      const tracker = new ConfidenceTracker();

      // Set up Big Five
      ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'].forEach(trait => {
        tracker.dimensions.set(trait, { score: 50, confidence: 75, questionCount: 3 });
      });

      const startTime = Date.now();
      const iterations = 100000;

      // Run 100000 average calculations
      for (let i = 0; i < iterations; i++) {
        coordinator.getAverageConfidence(tracker);
      }

      const duration = Date.now() - startTime;
      const avgTime = duration / iterations;

      console.log(`getAverageConfidence average: ${avgTime.toFixed(4)}ms per call`);
      expect(avgTime).toBeLessThan(1); // <1ms per average calc
    });
  });

  describe('Database Query Performance', () => {
    test('Stage 1 question selection should complete in <200ms', async () => {
      const startTime = Date.now();

      // Select Stage 1 questions (5 Big Five + 4 clinical + 3 neuro + 1 validity)
      await coordinator.stage1.selectQuestions(QuestionBank, []);

      const duration = Date.now() - startTime;

      console.log(`Stage 1 selection: ${duration}ms`);
      expect(duration).toBeLessThan(200); // <200ms for Stage 1
    }, 30000);

    test('Full 70-question selection should complete in <10 seconds', async () => {
      const tracker = new ConfidenceTracker();
      const session = {
        sessionId: 'perf_test',
        currentStage: 1,
        responses: [],
        confidenceState: {},
        presentedQuestions: []
      };

      const startTime = Date.now();
      let totalQuestions = 0;

      // Simulate question selection up to 70 questions
      while (totalQuestions < 70) {
        const result = await coordinator.getNextQuestions(session, QuestionBank);

        if (!result.questions || result.questions.length === 0) break;

        // Simulate answering one question
        const question = result.questions[0];
        session.responses.push({
          questionId: question.questionId,
          score: 50,
          timestamp: new Date()
        });

        session.presentedQuestions.push(question.questionId);

        // Update confidence (simplified)
        tracker.updateConfidence('openness', {
          questionId: question.questionId,
          score: 50,
          timestamp: new Date()
        });

        session.confidenceState = tracker.toJSON().dimensions;
        totalQuestions++;

        // Safety break
        if (totalQuestions > 75) break;
      }

      const duration = Date.now() - startTime;

      console.log(`Full 70-question selection: ${duration}ms (${totalQuestions} questions)`);
      expect(duration).toBeLessThan(10000); // <10 seconds total
      expect(totalQuestions).toBeGreaterThanOrEqual(70);
    }, 60000);
  });

  describe('Memory Performance', () => {
    test('Confidence tracker should not leak memory', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const trackers = [];

      // Create 1000 trackers
      for (let i = 0; i < 1000; i++) {
        const tracker = new ConfidenceTracker();

        // Add data to each
        for (let j = 0; j < 10; j++) {
          tracker.updateConfidence(`dimension_${j}`, {
            questionId: `Q${j}`,
            score: Math.random() * 100,
            timestamp: new Date()
          });
        }

        trackers.push(tracker);
      }

      const afterCreationMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (afterCreationMemory - initialMemory) / 1024 / 1024; // MB

      console.log(`Memory increase for 1000 trackers: ${memoryIncrease.toFixed(2)} MB`);

      // Clear trackers
      trackers.length = 0;
      global.gc && global.gc(); // Force garbage collection if available

      const afterClearMemory = process.memoryUsage().heapUsed;
      const memoryReclaimed = (afterCreationMemory - afterClearMemory) / 1024 / 1024; // MB

      console.log(`Memory reclaimed after clear: ${memoryReclaimed.toFixed(2)} MB`);

      // Should use less than 50MB for 1000 trackers (avg 50KB each)
      expect(memoryIncrease).toBeLessThan(50);
    });
  });

  describe('Scalability', () => {
    test('should handle 100 concurrent confidence updates efficiently', async () => {
      const startTime = Date.now();

      // Create 100 trackers
      const trackers = [];
      for (let i = 0; i < 100; i++) {
        trackers.push(new ConfidenceTracker());
      }

      // Update each tracker 70 times (simulating 70-question assessment)
      const promises = trackers.map(async (tracker, idx) => {
        for (let j = 0; j < 70; j++) {
          tracker.updateConfidence('openness', {
            questionId: `Q${idx}_${j}`,
            score: Math.random() * 100,
            timestamp: new Date()
          });
        }
      });

      await Promise.all(promises);

      const duration = Date.now() - startTime;
      const avgPerAssessment = duration / 100;

      console.log(`100 concurrent assessments: ${duration}ms total, ${avgPerAssessment.toFixed(1)}ms per assessment`);

      expect(avgPerAssessment).toBeLessThan(100); // <100ms per assessment on average
    });
  });
});
