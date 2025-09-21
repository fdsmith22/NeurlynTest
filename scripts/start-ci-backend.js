#!/usr/bin/env node

/**
 * Start backend server for CI/E2E testing
 * This script starts the backend server even in test mode
 */

process.env.NODE_ENV = 'development'; // Use development to bypass test mode check
const app = require('../backend');
const PORT = process.env.PORT || 3002;

// Force server start for CI
const server = app.listen(PORT, () => {
  console.log(`CI Backend server running on port ${PORT}`);
  console.log('Ready for E2E tests');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
