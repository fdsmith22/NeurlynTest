#!/usr/bin/env node

// Test backend startup script for CI/CD
// This ensures all required environment variables are set

// Set test environment variables if not already set
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PORT = process.env.PORT || '3002';
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
require('../backend.js');
