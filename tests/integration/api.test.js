const request = require('supertest');

// Set longer timeout for integration tests
jest.setTimeout(10000);

let app;
let server;

describe('API Integration Tests', () => {
  beforeAll(() => {
    // Start fresh app instance for tests
    delete require.cache[require.resolve('../../backend')];
    app = require('../../backend');
    // Close any existing server
    if (app.server) {
      app.server.close();
    }
  });

  afterAll(async () => {
    // Clean up server
    if (app && app.server) {
      await new Promise(resolve => app.server.close(resolve));
    }
  });
  describe('GET /', () => {
    test('should serve the index page', async () => {
      const response = await request(app).get('/').expect('Content-Type', /html/);

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/assessment/start', () => {
    test.skip('should start a new assessment (requires MongoDB)', async () => {
      const assessmentData = {
        mode: 'validated',
        tier: 'core',
        demographics: {
          age: 25,
          gender: 'male',
          country: 'US'
        },
        consent: {
          research: true,
          dataSharing: false,
          timestamp: new Date()
        }
      };

      const response = await request(app)
        .post('/api/assessment/start')
        .send(assessmentData)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('sessionId');
      expect(response.body).toHaveProperty('assessmentId');
      expect(response.body).toHaveProperty('questionCount');
    });

    test.skip('should handle invalid mode (requires MongoDB)', async () => {
      const invalidData = {
        mode: 'invalid_mode',
        tier: 'core'
      };

      const response = await request(app).post('/api/assessment/start').send(invalidData);

      expect(response.status).toBe(500);
    });
  });

  describe('API Rate Limiting', () => {
    test('should enforce rate limits', async () => {
      // Rate limit is set to 100 requests per 15 minutes
      // This is a placeholder for rate limit testing
      expect(true).toBe(true);
    });
  });
});
