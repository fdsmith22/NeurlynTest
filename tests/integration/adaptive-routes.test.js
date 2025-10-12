/**
 * Integration Tests - Adaptive Assessment Routes
 *
 * Tests all API endpoints for the adaptive assessment system:
 * - POST /api/adaptive/start
 * - POST /api/adaptive/next
 * - GET /api/adaptive/:sessionId/confidence
 * - GET /api/adaptive/:sessionId/dimension/:dimensionName
 *
 * Verifies end-to-end route functionality with real database operations.
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../backend'); // Your Express app

// Import models
require('../../models/QuestionBank');
require('../../models/AssessmentSession');

const QuestionBank = mongoose.model('QuestionBank');
const AssessmentSession = mongoose.model('Assessment');

describe('Adaptive Assessment Routes Integration Tests', () => {
  let sessionId;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }

    // Ensure we have some questions in the database
    const questionCount = await QuestionBank.countDocuments({ active: true });
    if (questionCount === 0) {
      console.warn('Warning: No active questions in database for testing');
    }
  });

  afterAll(async () => {
    // Clean up test session
    if (sessionId) {
      await AssessmentSession.deleteOne({ sessionId });
    }

    await mongoose.connection.close();
  });

  describe('POST /api/adaptive/start', () => {
    test('should create new session with Stage 1 questions', async () => {
      const response = await request(app)
        .post('/api/adaptive/start')
        .send({
          tier: 'comprehensive',
          useMultiStage: true,
          demographics: {
            age: 30,
            gender: 'non-binary'
          }
        })
        .expect(200);

      expect(response.body).toHaveProperty('sessionId');
      expect(response.body).toHaveProperty('currentBatch');
      expect(response.body).toHaveProperty('currentStage');
      expect(response.body.currentStage).toBe(1);

      // Should return 12-15 questions for Stage 1
      expect(response.body.currentBatch.length).toBeGreaterThanOrEqual(12);
      expect(response.body.currentBatch.length).toBeLessThanOrEqual(15);

      // Save session ID for subsequent tests
      sessionId = response.body.sessionId;

      // Should have confidence summary
      expect(response.body).toHaveProperty('confidence');

      // Should have stage message
      expect(response.body).toHaveProperty('stageMessage');
    });

    test('should return 400 if tier is invalid', async () => {
      const response = await request(app)
        .post('/api/adaptive/start')
        .send({
          tier: 'invalid_tier'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should support legacy mode (useMultiStage=false)', async () => {
      const response = await request(app)
        .post('/api/adaptive/start')
        .send({
          tier: 'standard',
          useMultiStage: false
        })
        .expect(200);

      expect(response.body).toHaveProperty('sessionId');
      expect(response.body).toHaveProperty('currentBatch');

      // Clean up
      await AssessmentSession.deleteOne({ sessionId: response.body.sessionId });
    });
  });

  describe('POST /api/adaptive/next', () => {
    test('should submit answer and update confidence', async () => {
      // First, get a question from start
      const startResponse = await request(app)
        .post('/api/adaptive/start')
        .send({ tier: 'comprehensive', useMultiStage: true });

      const testSessionId = startResponse.body.sessionId;
      const firstQuestion = startResponse.body.currentBatch[0];

      // Submit answer
      const response = await request(app)
        .post('/api/adaptive/next')
        .send({
          sessionId: testSessionId,
          responses: [{
            questionId: firstQuestion.questionId,
            value: 3 // Neutral response
          }]
        })
        .expect(200);

      expect(response.body).toHaveProperty('currentBatch');
      expect(response.body).toHaveProperty('confidence');
      expect(response.body).toHaveProperty('progress');

      // Confidence should have been updated
      expect(Object.keys(response.body.confidence).length).toBeGreaterThan(0);

      // Clean up
      await AssessmentSession.deleteOne({ sessionId: testSessionId });
    });

    test('should advance stage when threshold met', async () => {
      // Create session and answer 15 questions to trigger Stage 2
      const startResponse = await request(app)
        .post('/api/adaptive/start')
        .send({ tier: 'comprehensive', useMultiStage: true });

      const testSessionId = startResponse.body.sessionId;
      let currentStage = 1;
      let stageChanged = false;

      // Answer 15 questions
      for (let i = 0; i < 15; i++) {
        const nextResponse = await request(app)
          .post('/api/adaptive/next')
          .send({
            sessionId: testSessionId,
            responses: [{
              questionId: `Q${i}`,
              value: 3
            }]
          });

        if (nextResponse.body.stageChanged) {
          stageChanged = true;
          currentStage = nextResponse.body.stage;
          break;
        }
      }

      // Should have advanced to Stage 2
      expect(stageChanged).toBe(true);
      expect(currentStage).toBe(2);

      // Clean up
      await AssessmentSession.deleteOne({ sessionId: testSessionId });
    });

    test('should handle multiple responses in one request', async () => {
      const startResponse = await request(app)
        .post('/api/adaptive/start')
        .send({ tier: 'comprehensive', useMultiStage: true });

      const testSessionId = startResponse.body.sessionId;
      const questions = startResponse.body.currentBatch.slice(0, 3);

      // Submit 3 answers at once
      const response = await request(app)
        .post('/api/adaptive/next')
        .send({
          sessionId: testSessionId,
          responses: questions.map((q, idx) => ({
            questionId: q.questionId,
            value: 3 + idx
          }))
        })
        .expect(200);

      expect(response.body.progress.current).toBeGreaterThanOrEqual(3);

      // Clean up
      await AssessmentSession.deleteOne({ sessionId: testSessionId });
    });

    test('should return 404 for invalid session', async () => {
      const response = await request(app)
        .post('/api/adaptive/next')
        .send({
          sessionId: 'invalid_session_id',
          responses: [{ questionId: 'Q1', value: 3 }]
        })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('should complete assessment at 70 questions', async () => {
      // This is a long test - simulate answering 70 questions
      const startResponse = await request(app)
        .post('/api/adaptive/start')
        .send({ tier: 'comprehensive', useMultiStage: true });

      const testSessionId = startResponse.body.sessionId;
      let complete = false;
      let questionCount = 0;

      // Keep answering until complete or safety limit reached
      while (!complete && questionCount < 75) {
        const response = await request(app)
          .post('/api/adaptive/next')
          .send({
            sessionId: testSessionId,
            responses: [{
              questionId: `Q${questionCount}`,
              value: 3
            }]
          });

        questionCount++;
        complete = response.body.complete;

        if (questionCount >= 70 && !complete) {
          // Should be complete at 70
          expect(complete).toBe(true);
          break;
        }
      }

      // Clean up
      await AssessmentSession.deleteOne({ sessionId: testSessionId });
    }, 60000); // 60 second timeout
  });

  describe('GET /api/adaptive/:sessionId/confidence', () => {
    test('should return confidence summary', async () => {
      // Create session and answer a few questions
      const startResponse = await request(app)
        .post('/api/adaptive/start')
        .send({ tier: 'comprehensive', useMultiStage: true });

      const testSessionId = startResponse.body.sessionId;

      // Answer one question
      await request(app)
        .post('/api/adaptive/next')
        .send({
          sessionId: testSessionId,
          responses: [{ questionId: 'Q1', value: 3 }]
        });

      // Get confidence
      const response = await request(app)
        .get(`/api/adaptive/${testSessionId}/confidence`)
        .expect(200);

      expect(response.body).toHaveProperty('confidence');
      expect(response.body.confidence).toBeInstanceOf(Object);

      // Clean up
      await AssessmentSession.deleteOne({ sessionId: testSessionId });
    });

    test('should return 404 for invalid session', async () => {
      await request(app)
        .get('/api/adaptive/invalid_session/confidence')
        .expect(404);
    });
  });

  describe('GET /api/adaptive/:sessionId/dimension/:dimensionName', () => {
    test('should return specific dimension data', async () => {
      // Create session and answer questions that affect openness
      const startResponse = await request(app)
        .post('/api/adaptive/start')
        .send({ tier: 'comprehensive', useMultiStage: true });

      const testSessionId = startResponse.body.sessionId;

      // Answer a few questions
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/adaptive/next')
          .send({
            sessionId: testSessionId,
            responses: [{ questionId: `Q${i}`, value: 4 }]
          });
      }

      // Get openness dimension
      const response = await request(app)
        .get(`/api/adaptive/${testSessionId}/dimension/openness`)
        .expect(200);

      expect(response.body).toHaveProperty('dimension');
      expect(response.body.dimension).toBe('openness');

      // Clean up
      await AssessmentSession.deleteOne({ sessionId: testSessionId });
    });

    test('should return 404 for non-existent dimension', async () => {
      const startResponse = await request(app)
        .post('/api/adaptive/start')
        .send({ tier: 'comprehensive', useMultiStage: true });

      const testSessionId = startResponse.body.sessionId;

      await request(app)
        .get(`/api/adaptive/${testSessionId}/dimension/nonexistent`)
        .expect(404);

      // Clean up
      await AssessmentSession.deleteOne({ sessionId: testSessionId });
    });
  });

  describe('Stage Advancement Logic', () => {
    test('should advance from Stage 1 to 2 after minimum questions', async () => {
      const startResponse = await request(app)
        .post('/api/adaptive/start')
        .send({ tier: 'comprehensive', useMultiStage: true });

      const testSessionId = startResponse.body.sessionId;

      // Answer 15 questions (Stage 1 → 2 threshold)
      let currentStage = 1;
      for (let i = 0; i < 15; i++) {
        const response = await request(app)
          .post('/api/adaptive/next')
          .send({
            sessionId: testSessionId,
            responses: [{ questionId: `Q${i}`, value: 3 }]
          });

        if (response.body.stage) {
          currentStage = response.body.stage;
        }
      }

      expect(currentStage).toBe(2);

      // Clean up
      await AssessmentSession.deleteOne({ sessionId: testSessionId });
    });

    test('should notify when stage changes', async () => {
      const startResponse = await request(app)
        .post('/api/adaptive/start')
        .send({ tier: 'comprehensive', useMultiStage: true });

      const testSessionId = startResponse.body.sessionId;

      // Answer questions until stage changes
      let stageChanged = false;
      let stageMessage = null;

      for (let i = 0; i < 20; i++) {
        const response = await request(app)
          .post('/api/adaptive/next')
          .send({
            sessionId: testSessionId,
            responses: [{ questionId: `Q${i}`, value: 3 }]
          });

        if (response.body.stageChanged) {
          stageChanged = true;
          stageMessage = response.body.stageMessage;
          break;
        }
      }

      expect(stageChanged).toBe(true);
      expect(stageMessage).toBeTruthy();

      // Clean up
      await AssessmentSession.deleteOne({ sessionId: testSessionId });
    });
  });

  describe('Skip Logic', () => {
    test('should generate skip notifications for high-confidence dimensions', async () => {
      const startResponse = await request(app)
        .post('/api/adaptive/start')
        .send({ tier: 'comprehensive', useMultiStage: true });

      const testSessionId = startResponse.body.sessionId;

      // Answer many consistent questions to build high confidence
      for (let i = 0; i < 40; i++) {
        const response = await request(app)
          .post('/api/adaptive/next')
          .send({
            sessionId: testSessionId,
            responses: [{ questionId: `Q${i}`, value: 4 }] // Consistent answers
          });

        // Check for skip notifications
        if (response.body.skipNotifications && response.body.skipNotifications.length > 0) {
          expect(response.body.skipNotifications[0]).toHaveProperty('dimension');
          expect(response.body.skipNotifications[0]).toHaveProperty('confidence');
          expect(response.body.skipNotifications[0].confidence).toBeGreaterThanOrEqual(85);
          break;
        }
      }

      // Clean up
      await AssessmentSession.deleteOne({ sessionId: testSessionId });
    });
  });
});
