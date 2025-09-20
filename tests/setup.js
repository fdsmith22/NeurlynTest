// Test setup file for Jest
// This file runs before each test suite

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Only show errors during tests
process.env.MONGODB_URI = 'mongodb://localhost:27017/neurlyn-test';

// Mock external services
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          url: 'https://checkout.stripe.com/test',
          id: 'test_session_id'
        })
      }
    },
    webhooks: {
      constructEvent: jest.fn()
    }
  }));
});

// Global test timeout
jest.setTimeout(10000);

// Clean up after tests
afterAll(async () => {
  // Close database connections if needed
  const mongoose = require('mongoose');
  await mongoose.connection.close();
});
