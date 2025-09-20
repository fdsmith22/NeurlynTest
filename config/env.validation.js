const Joi = require('joi');
const logger = require('../utils/logger');

// Define the environment variable schema
const envSchema = Joi.object({
  // Server Configuration
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'staging', 'production')
    .default('development'),
  PORT: Joi.number().integer().min(1).max(65535).default(3000),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'http', 'debug').default('info'),

  // Database
  MONGODB_URI: Joi.string().uri().when('NODE_ENV', {
    is: 'test',
    then: Joi.optional(),
    otherwise: Joi.required()
  }),

  // Stripe (required in production)
  STRIPE_SECRET_KEY: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  STRIPE_WEBHOOK_SECRET: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),

  // Application URLs
  BASE_URL: Joi.string().uri().default('http://localhost:3000'),

  // JWT Configuration
  JWT_SECRET: Joi.string().min(32).optional(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().integer().min(1000).default(900000),
  RATE_LIMIT_MAX: Joi.number().integer().min(1).default(100)
}).unknown(true); // Allow unknown keys for system env vars

// Validate environment variables
function validateEnv() {
  const { error, value } = envSchema.validate(process.env, {
    abortEarly: false,
    stripUnknown: false
  });

  if (error) {
    const errors = error.details.map(detail => detail.message).join('\n  - ');
    logger.error(`Environment validation failed:\n  - ${errors}`);

    // In development, show helpful message
    if (process.env.NODE_ENV === 'development') {
      logger.info('Please check your .env file against .env.example');
    }

    throw new Error('Environment validation failed');
  }

  // Log successful validation
  logger.info(`Environment validated successfully for ${value.NODE_ENV} mode`);

  return value;
}

// Export validated environment variables
const validatedEnv = validateEnv();

module.exports = {
  env: validatedEnv,
  validateEnv,
  isProduction: validatedEnv.NODE_ENV === 'production',
  isDevelopment: validatedEnv.NODE_ENV === 'development',
  isTest: validatedEnv.NODE_ENV === 'test'
};
