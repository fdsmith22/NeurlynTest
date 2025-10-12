const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { env, isProduction, isTest } = require('./env.validation');

class Database {
  constructor() {
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
    this.isConnected = false;
  }

  /**
   * Connect to MongoDB with retry logic
   */
  async connect() {
    // Skip in test environment unless explicitly needed
    if (isTest && !env.MONGODB_URI) {
      logger.info('Skipping database connection in test environment');
      return;
    }

    const options = {
      // Connection pooling
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,

      // Retry logic
      retryWrites: true,
      retryReads: true
    };

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully');
      this.isConnected = true;
    });

    mongoose.connection.on('error', err => {
      logger.error('MongoDB connection error:', err);
      this.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      this.isConnected = false;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });

    // Attempt connection with retries
    await this.connectWithRetry(options);
  }

  /**
   * Connect with exponential backoff retry
   */
  async connectWithRetry(options, attempt = 1) {
    try {
      const uri = env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

      logger.info(`Attempting database connection (attempt ${attempt}/${this.maxRetries})`);

      await mongoose.connect(uri, options);

      logger.info('Database connection established');
      this.isConnected = true;
    } catch (error) {
      logger.error(`Database connection attempt ${attempt} failed:`, error.message);

      if (attempt >= this.maxRetries) {
        logger.error('Max retries reached. Could not connect to database');

        // In production, we might want to exit
        if (isProduction) {
          logger.error('Exiting due to database connection failure');
          process.exit(1);
        } else {
          logger.warn('Running without database connection');
        }
        return;
      }

      // Exponential backoff
      const delay = this.retryDelay * Math.pow(2, attempt - 1);
      logger.info(`Retrying in ${delay / 1000} seconds...`);

      await new Promise(resolve => setTimeout(resolve, delay));
      await this.connectWithRetry(options, attempt + 1);
    }
  }

  /**
   * Disconnect from database
   */
  async disconnect() {
    try {
      await mongoose.connection.close();
      logger.info('Database connection closed');
      this.isConnected = false;
    } catch (error) {
      logger.error('Error closing database connection:', error);
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return {
      isConnected: this.isConnected,
      readyState: states[mongoose.connection.readyState],
      host: mongoose.connection.host,
      name: mongoose.connection.name
    };
  }

  /**
   * Health check for database
   */
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { healthy: false, message: 'Database not connected' };
      }

      // Ping the database
      await mongoose.connection.db.admin().ping();

      return {
        healthy: true,
        message: 'Database is healthy',
        details: this.getStatus()
      };
    } catch (error) {
      return {
        healthy: false,
        message: 'Database health check failed',
        error: error.message
      };
    }
  }
}

// Create singleton instance
const database = new Database();

module.exports = database;
