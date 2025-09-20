/**
 * Environment Configuration System
 * Centralizes all environment-specific settings for the Neurlyn platform
 */

class EnvironmentConfig {
  constructor() {
    this.detectEnvironment();
    this.loadConfiguration();
  }

  detectEnvironment() {
    // Detect environment based on hostname and NODE_ENV
    if (typeof window !== 'undefined') {
      // Browser environment
      const hostname = window.location.hostname;

      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168')) {
        this.environment = 'development';
      } else if (hostname.includes('staging') || hostname.includes('test')) {
        this.environment = 'staging';
      } else {
        this.environment = 'production';
      }
    } else {
      // Node.js environment
      this.environment = process.env.NODE_ENV || 'development';
    }
  }

  loadConfiguration() {
    const configs = {
      development: {
        API_BASE_URL: 'http://localhost:3002',
        FRONTEND_URL: 'http://localhost:3000',
        MONGODB_URI: 'mongodb://localhost:27017/neurlyn',
        LOG_LEVEL: 'debug',
        ENABLE_DEBUG: true,
        ENABLE_ANALYTICS: false,
        ENABLE_ERROR_REPORTING: false,
        CACHE_DURATION: 0, // No caching in dev
        RATE_LIMIT: {
          windowMs: 900000,
          max: 1000 // Higher limit for development
        },
        FEATURES: {
          ADAPTIVE_ASSESSMENT: true,
          PREMIUM_FEATURES: true,
          PAYMENT_PROCESSING: false,
          EMAIL_NOTIFICATIONS: false
        }
      },

      staging: {
        API_BASE_URL: 'https://staging.neurlyn.com',
        FRONTEND_URL: 'https://staging.neurlyn.com',
        MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-staging',
        LOG_LEVEL: 'info',
        ENABLE_DEBUG: false,
        ENABLE_ANALYTICS: true,
        ENABLE_ERROR_REPORTING: true,
        CACHE_DURATION: 300, // 5 minutes
        RATE_LIMIT: {
          windowMs: 900000,
          max: 200
        },
        FEATURES: {
          ADAPTIVE_ASSESSMENT: true,
          PREMIUM_FEATURES: true,
          PAYMENT_PROCESSING: true,
          EMAIL_NOTIFICATIONS: true
        }
      },

      production: {
        API_BASE_URL: 'https://www.neurlyn.com',
        FRONTEND_URL: 'https://www.neurlyn.com',
        MONGODB_URI: process.env.MONGODB_URI,
        LOG_LEVEL: 'error',
        ENABLE_DEBUG: false,
        ENABLE_ANALYTICS: true,
        ENABLE_ERROR_REPORTING: true,
        CACHE_DURATION: 3600, // 1 hour
        RATE_LIMIT: {
          windowMs: 900000,
          max: 100
        },
        FEATURES: {
          ADAPTIVE_ASSESSMENT: true,
          PREMIUM_FEATURES: true,
          PAYMENT_PROCESSING: true,
          EMAIL_NOTIFICATIONS: true
        }
      }
    };

    this.config = configs[this.environment];

    // Override with environment variables if available
    if (typeof process !== 'undefined' && process.env) {
      this.applyEnvironmentOverrides();
    }
  }

  applyEnvironmentOverrides() {
    // Allow environment variables to override config
    if (process.env.API_BASE_URL) {
      this.config.API_BASE_URL = process.env.API_BASE_URL;
    }
    if (process.env.MONGODB_URI) {
      this.config.MONGODB_URI = process.env.MONGODB_URI;
    }
    if (process.env.LOG_LEVEL) {
      this.config.LOG_LEVEL = process.env.LOG_LEVEL;
    }
    if (process.env.ENABLE_DEBUG) {
      this.config.ENABLE_DEBUG = process.env.ENABLE_DEBUG === 'true';
    }
  }

  get(key) {
    // Get nested config values using dot notation
    const keys = key.split('.');
    let value = this.config;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return undefined;
      }
    }

    return value;
  }

  getApiUrl(endpoint = '') {
    const baseUrl = this.config.API_BASE_URL;
    return endpoint ? `${baseUrl}${endpoint}` : baseUrl;
  }

  isProduction() {
    return this.environment === 'production';
  }

  isDevelopment() {
    return this.environment === 'development';
  }

  isStaging() {
    return this.environment === 'staging';
  }

  isFeatureEnabled(feature) {
    return this.config.FEATURES && this.config.FEATURES[feature] === true;
  }

  getEnvironment() {
    return this.environment;
  }

  getFullConfig() {
    return this.config;
  }

  // Helper method for logging configuration (without sensitive data)
  getSafeConfig() {
    const safe = { ...this.config };

    // Remove sensitive information
    if (safe.MONGODB_URI) {
      safe.MONGODB_URI = '***HIDDEN***';
    }
    if (safe.JWT_SECRET) {
      safe.JWT_SECRET = '***HIDDEN***';
    }
    if (safe.STRIPE_SECRET_KEY) {
      safe.STRIPE_SECRET_KEY = '***HIDDEN***';
    }

    return safe;
  }
}

// Create singleton instance
let instance = null;

function getEnvironmentConfig() {
  if (!instance) {
    instance = new EnvironmentConfig();
  }
  return instance;
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  // Node.js
  module.exports = getEnvironmentConfig;
} else if (typeof window !== 'undefined') {
  // Browser
  window.EnvironmentConfig = getEnvironmentConfig;
}
