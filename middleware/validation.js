const Joi = require('joi');
const { ApiError } = require('./errorHandler');

/**
 * Validation schemas for different endpoints
 */
const schemas = {
  // Assessment start validation
  startAssessment: Joi.object({
    mode: Joi.string().valid('validated', 'experimental').required(),
    tier: Joi.string().valid('core', 'comprehensive', 'specialized', 'experimental').optional(),
    userId: Joi.string().alphanum().min(3).max(50).optional(),
    demographics: Joi.object({
      age: Joi.number().min(13).max(120).optional(),
      gender: Joi.string().optional(),
      country: Joi.string().length(2).uppercase().optional(),
      education: Joi.string().optional(),
      ethnicity: Joi.array().items(Joi.string()).optional(),
      language: Joi.string().optional()
    }).optional(),
    consent: Joi.object({
      research: Joi.boolean().required(),
      dataSharing: Joi.boolean().required(),
      timestamp: Joi.date().required()
    }).optional()
  }),

  // Progress save validation
  saveProgress: Joi.object({
    sessionId: Joi.string()
      .pattern(/^neurlyn_\d+_[a-z0-9]+$/)
      .required(),
    responses: Joi.array()
      .items(
        Joi.object({
          questionId: Joi.string().required(),
          value: Joi.any().required(),
          responseTime: Joi.number().positive().optional(),
          category: Joi.string().optional(),
          instrument: Joi.string().optional(),
          biometrics: Joi.object().optional()
        })
      )
      .min(1)
      .required(),
    currentIndex: Joi.number().integer().min(0).optional()
  }),

  // Complete assessment validation
  completeAssessment: Joi.object({
    sessionId: Joi.string()
      .pattern(/^neurlyn_\d+_[a-z0-9]+$/)
      .required(),
    responses: Joi.array()
      .items(
        Joi.object({
          questionId: Joi.string().required(),
          value: Joi.any().required(),
          responseTime: Joi.number().positive().optional(),
          category: Joi.string().optional(),
          instrument: Joi.string().optional(),
          biometrics: Joi.object().optional()
        })
      )
      .min(10) // Minimum responses for valid assessment
      .required()
  }),

  // Payment checkout validation
  createCheckout: Joi.object({
    sessionId: Joi.string()
      .pattern(/^neurlyn_\d+_[a-z0-9]+$/)
      .required()
  }),

  // Session ID parameter validation
  sessionIdParam: Joi.object({
    sessionId: Joi.string()
      .pattern(/^neurlyn_\d+_[a-z0-9]+$/)
      .required()
  })
};

/**
 * Validation middleware factory
 */
const validate = schemaName => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      throw new ApiError(500, 'Invalid validation schema');
    }

    // Determine what to validate
    const toValidate = req.body && Object.keys(req.body).length > 0 ? req.body : req.params;

    const { error, value } = schema.validate(toValidate, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return next(new ApiError(400, `Validation error: ${errorMessage}`));
    }

    // Replace with validated values
    if (req.body && Object.keys(req.body).length > 0) {
      req.body = value;
    } else {
      req.params = value;
    }

    next();
  };
};

/**
 * Sanitize input to prevent XSS
 */
const sanitizeInput = (req, res, next) => {
  // Recursively sanitize strings in request body
  const sanitize = obj => {
    if (typeof obj === 'string') {
      // Remove script tags and other dangerous patterns
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj !== null && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitize(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

module.exports = {
  validate,
  sanitizeInput,
  schemas
};
