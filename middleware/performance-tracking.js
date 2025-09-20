/**
 * Performance Tracking Middleware
 * Integrates performance monitoring into Express application
 */

const PerformanceMonitor = require('../monitoring/performance-monitor');

// Initialize performance monitor
const monitor = new PerformanceMonitor({
  apiResponseTime: 1000, // 1s threshold
  pageLoadTime: 3000, // 3s threshold
  dbQueryTime: 100, // 100ms threshold
  memoryLimit: 500 * 1024 * 1024, // 500MB
  errorRate: 0.01, // 1% threshold
  reportInterval: 60000 // Generate reports every minute
});

/**
 * Express middleware to track API performance
 */
const performanceMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Store original methods
  const originalSend = res.send;
  const originalJson = res.json;

  // Track response
  const trackResponse = () => {
    const duration = Date.now() - startTime;
    const endpoint = req.route ? req.route.path : req.path;
    const method = req.method;
    const statusCode = res.statusCode;

    // Track API call
    monitor.trackApiCall(endpoint, method, duration, statusCode);

    // Log slow requests
    if (duration > 1000) {
      console.log(`⚠️  Slow API call: ${method} ${endpoint} took ${duration}ms`);
    }
  };

  // Override response methods
  res.send = function (data) {
    trackResponse();
    originalSend.call(res, data);
  };

  res.json = function (data) {
    trackResponse();
    originalJson.call(res, data);
  };

  next();
};

/**
 * MongoDB query performance tracking wrapper
 */
const trackDbQuery = (collection, operation) => {
  return function (originalMethod) {
    return async function (...args) {
      const startTime = Date.now();

      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;

        // Track the query
        const documentCount = Array.isArray(result) ? result.length : 1;
        monitor.trackDbQuery(collection, operation, duration, documentCount);

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        monitor.trackDbQuery(collection, operation, duration, 0);
        throw error;
      }
    };
  };
};

/**
 * Error tracking middleware
 */
const errorTrackingMiddleware = (err, req, res, next) => {
  // Track the error
  monitor.trackError(err, {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    headers: req.headers
  });

  // Pass to next error handler
  next(err);
};

/**
 * Performance status endpoint
 */
const performanceStatusRoute = (req, res) => {
  const metrics = monitor.getMetricsSummary();
  res.json({
    status: 'operational',
    health: metrics.health,
    metrics: metrics,
    timestamp: new Date().toISOString()
  });
};

/**
 * Performance report endpoint
 */
const performanceReportRoute = (req, res) => {
  const report = monitor.generateReport();
  res.json(report);
};

module.exports = {
  performanceMiddleware,
  errorTrackingMiddleware,
  performanceStatusRoute,
  performanceReportRoute,
  trackDbQuery,
  monitor
};
