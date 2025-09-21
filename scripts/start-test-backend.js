#!/usr/bin/env node

// Test backend startup script for CI/CD
// This ensures all required environment variables are set

// Set test environment variables if not already set
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PORT = process.env.PORT || '3000';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test-secret-key-for-ci-testing-purposes-only-32chars';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';
process.env.LOG_LEVEL = 'error'; // Reduce noise in tests

console.log('Starting test backend with environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI ? 'configured' : 'missing',
  JWT_SECRET: process.env.JWT_SECRET ? 'configured' : 'missing',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing'
});

// Start the backend
try {
  const app = require('../backend.js');

  // In test mode, the server doesn't start automatically, so start it here
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`Test backend server started on port ${PORT}`);
    console.log('Server is ready to accept connections');
  });

  // Store server reference for cleanup
  app.server = server;

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
} catch (error) {
  console.error('Failed to start backend:', error);
  process.exit(1);
}
