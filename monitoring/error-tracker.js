/**
 * Comprehensive Error Tracking System
 * Captures, categorizes, and reports errors throughout the application
 */

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

class ErrorTracker extends EventEmitter {
  constructor(config = {}) {
    super();

    this.errors = {
      client: [],
      server: [],
      database: [],
      validation: [],
      authentication: [],
      payment: []
    };

    this.errorPatterns = new Map();
    this.errorCounts = new Map();
    this.errorTrends = [];

    this.config = {
      maxErrorsPerCategory: config.maxErrorsPerCategory || 100,
      alertThreshold: config.alertThreshold || 10,
      trendWindowMinutes: config.trendWindowMinutes || 15,
      logPath: config.logPath || './monitoring/error-logs',
      enableAlerts: config.enableAlerts !== false,
      enableStackTrace: config.enableStackTrace !== false
    };

    // Ensure log directory exists
    if (!fs.existsSync(this.config.logPath)) {
      fs.mkdirSync(this.config.logPath, { recursive: true });
    }

    this.startErrorAnalysis();
  }

  /**
   * Track an error with full context
   */
  trackError(error, context = {}) {
    const errorInfo = this.parseError(error, context);
    const category = this.categorizeError(errorInfo);

    // Store in appropriate category
    if (!this.errors[category]) {
      this.errors[category] = [];
    }

    this.errors[category].push(errorInfo);

    // Maintain max errors per category
    if (this.errors[category].length > this.config.maxErrorsPerCategory) {
      this.errors[category].shift();
    }

    // Update error counts
    const errorKey = `${category}:${errorInfo.code || errorInfo.type}`;
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

    // Check for patterns
    this.detectErrorPattern(errorInfo);

    // Log to file
    this.logError(errorInfo);

    // Emit event for real-time monitoring
    this.emit('error', errorInfo);

    // Check if alert needed
    this.checkAlertConditions(category);

    return errorInfo;
  }

  /**
   * Parse error object into structured format
   */
  parseError(error, context) {
    const errorInfo = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      message: error.message || String(error),
      type: error.name || 'UnknownError',
      code: error.code || null,
      severity: this.determineSeverity(error),
      context: {
        ...context,
        url: context.url || null,
        method: context.method || null,
        userId: context.userId || null,
        sessionId: context.sessionId || null,
        userAgent: context.userAgent || null,
        ip: context.ip || null
      },
      metadata: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    };

    // Add stack trace if enabled
    if (this.config.enableStackTrace && error.stack) {
      errorInfo.stack = this.cleanStackTrace(error.stack);
    }

    // Add additional error properties
    if (error.statusCode) errorInfo.statusCode = error.statusCode;
    if (error.details) errorInfo.details = error.details;
    if (error.query) errorInfo.query = error.query;

    return errorInfo;
  }

  /**
   * Categorize error based on type and context
   */
  categorizeError(errorInfo) {
    const { message, type, code } = errorInfo;

    // Database errors
    if (
      type === 'MongoError' ||
      type === 'MongooseError' ||
      message.includes('database') ||
      message.includes('MongoDB')
    ) {
      return 'database';
    }

    // Authentication errors
    if (
      code === 401 ||
      code === 403 ||
      message.includes('auth') ||
      message.includes('token') ||
      message.includes('permission')
    ) {
      return 'authentication';
    }

    // Validation errors
    if (
      type === 'ValidationError' ||
      code === 400 ||
      message.includes('validation') ||
      message.includes('invalid')
    ) {
      return 'validation';
    }

    // Payment errors
    if (
      message.includes('stripe') ||
      message.includes('payment') ||
      message.includes('subscription')
    ) {
      return 'payment';
    }

    // Client errors (4xx)
    if (errorInfo.statusCode >= 400 && errorInfo.statusCode < 500) {
      return 'client';
    }

    // Server errors (5xx or unknown)
    return 'server';
  }

  /**
   * Determine error severity
   */
  determineSeverity(error) {
    if (error.severity) return error.severity;

    // Critical errors
    if (
      error.code === 500 ||
      error.message.includes('FATAL') ||
      error.message.includes('CRITICAL')
    ) {
      return 'critical';
    }

    // High severity
    if (error.code >= 500 || error.name === 'TypeError' || error.name === 'ReferenceError') {
      return 'high';
    }

    // Medium severity
    if (error.code >= 400 && error.code < 500) {
      return 'medium';
    }

    // Low severity
    return 'low';
  }

  /**
   * Clean and format stack trace
   */
  cleanStackTrace(stack) {
    return stack
      .split('\n')
      .filter(line => !line.includes('node_modules'))
      .slice(0, 10)
      .join('\n');
  }

  /**
   * Detect error patterns
   */
  detectErrorPattern(errorInfo) {
    const patternKey = `${errorInfo.type}:${errorInfo.message.substring(0, 50)}`;

    if (!this.errorPatterns.has(patternKey)) {
      this.errorPatterns.set(patternKey, {
        firstSeen: errorInfo.timestamp,
        lastSeen: errorInfo.timestamp,
        count: 1,
        examples: [errorInfo.id]
      });
    } else {
      const pattern = this.errorPatterns.get(patternKey);
      pattern.lastSeen = errorInfo.timestamp;
      pattern.count++;
      if (pattern.examples.length < 5) {
        pattern.examples.push(errorInfo.id);
      }
    }

    // Alert on recurring patterns
    const pattern = this.errorPatterns.get(patternKey);
    if (pattern.count === 10) {
      this.emit('pattern-detected', {
        pattern: patternKey,
        count: pattern.count,
        timespan: Date.now() - new Date(pattern.firstSeen).getTime()
      });
    }
  }

  /**
   * Check if alerts should be triggered
   */
  checkAlertConditions(category) {
    if (!this.config.enableAlerts) return;

    const recentErrors = this.errors[category].filter(
      err => new Date(err.timestamp) > new Date(Date.now() - 300000)
    );

    if (recentErrors.length >= this.config.alertThreshold) {
      this.sendAlert({
        type: 'high-error-rate',
        category,
        count: recentErrors.length,
        timeWindow: '5 minutes',
        severity: 'warning'
      });
    }

    // Check for critical errors
    const criticalErrors = recentErrors.filter(err => err.severity === 'critical');
    if (criticalErrors.length > 0) {
      this.sendAlert({
        type: 'critical-error',
        category,
        errors: criticalErrors,
        severity: 'critical'
      });
    }
  }

  /**
   * Send alert
   */
  sendAlert(alert) {
    console.error(`🚨 ERROR ALERT [${alert.severity}]: ${alert.type} in ${alert.category}`);
    console.error(
      `   ${alert.count || alert.errors.length} errors in ${alert.timeWindow || 'recent'}`
    );

    // Log alert
    const alertFile = path.join(this.config.logPath, 'error-alerts.log');
    fs.appendFileSync(
      alertFile,
      JSON.stringify({
        ...alert,
        timestamp: new Date().toISOString()
      }) + '\n'
    );

    // Emit alert event
    this.emit('alert', alert);
  }

  /**
   * Log error to file
   */
  logError(errorInfo) {
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(this.config.logPath, `errors-${date}.jsonl`);
    fs.appendFileSync(logFile, JSON.stringify(errorInfo) + '\n');
  }

  /**
   * Start error trend analysis
   */
  startErrorAnalysis() {
    setInterval(() => {
      this.analyzeErrorTrends();
    }, 60000); // Every minute
  }

  /**
   * Analyze error trends
   */
  analyzeErrorTrends() {
    const now = Date.now();
    const windowMs = this.config.trendWindowMinutes * 60000;

    // Count errors per category in time window
    const trendData = {};
    for (const [category, errors] of Object.entries(this.errors)) {
      const recentErrors = errors.filter(err => new Date(err.timestamp) > new Date(now - windowMs));

      trendData[category] = {
        count: recentErrors.length,
        severities: this.groupBySeverity(recentErrors),
        topErrors: this.getTopErrors(recentErrors)
      };
    }

    // Store trend
    this.errorTrends.push({
      timestamp: new Date().toISOString(),
      window: `${this.config.trendWindowMinutes} minutes`,
      data: trendData,
      totalErrors: Object.values(trendData).reduce((sum, cat) => sum + cat.count, 0)
    });

    // Keep only last 24 hours of trends
    const dayAgo = now - 86400000;
    this.errorTrends = this.errorTrends.filter(
      trend => new Date(trend.timestamp) > new Date(dayAgo)
    );

    // Check for anomalies
    this.detectAnomalies(trendData);
  }

  /**
   * Group errors by severity
   */
  groupBySeverity(errors) {
    const groups = { critical: 0, high: 0, medium: 0, low: 0 };
    errors.forEach(err => {
      groups[err.severity]++;
    });
    return groups;
  }

  /**
   * Get top errors by frequency
   */
  getTopErrors(errors) {
    const errorMap = new Map();
    errors.forEach(err => {
      const key = err.message.substring(0, 50);
      errorMap.set(key, (errorMap.get(key) || 0) + 1);
    });

    return Array.from(errorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([message, count]) => ({ message, count }));
  }

  /**
   * Detect anomalies in error trends
   */
  detectAnomalies(currentTrend) {
    if (this.errorTrends.length < 5) return;

    // Calculate average error rate
    const recentTrends = this.errorTrends.slice(-5);
    const avgErrors = recentTrends.reduce((sum, trend) => sum + trend.totalErrors, 0) / 5;

    const currentTotal = Object.values(currentTrend).reduce((sum, cat) => sum + cat.count, 0);

    // Alert if error rate spikes
    if (currentTotal > avgErrors * 2) {
      this.sendAlert({
        type: 'error-spike',
        currentCount: currentTotal,
        averageCount: Math.round(avgErrors),
        increase: `${Math.round((currentTotal / avgErrors - 1) * 100)}%`,
        severity: 'warning'
      });
    }
  }

  /**
   * Generate unique error ID
   */
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Get error statistics
   */
  getStatistics() {
    const stats = {
      totalErrors: 0,
      byCategory: {},
      bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
      recentErrors: [],
      topPatterns: [],
      errorRate: 0
    };

    // Count by category
    for (const [category, errors] of Object.entries(this.errors)) {
      stats.byCategory[category] = errors.length;
      stats.totalErrors += errors.length;

      // Count by severity
      errors.forEach(err => {
        stats.bySeverity[err.severity]++;
      });
    }

    // Recent errors (last 5 minutes)
    const fiveMinutesAgo = Date.now() - 300000;
    for (const errors of Object.values(this.errors)) {
      const recent = errors.filter(err => new Date(err.timestamp) > new Date(fiveMinutesAgo));
      stats.recentErrors.push(...recent);
    }

    // Calculate error rate
    stats.errorRate = stats.recentErrors.length / 5; // Per minute

    // Top patterns
    stats.topPatterns = Array.from(this.errorPatterns.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([pattern, data]) => ({
        pattern,
        count: data.count,
        firstSeen: data.firstSeen,
        lastSeen: data.lastSeen
      }));

    return stats;
  }

  /**
   * Clear old errors
   */
  clearOldErrors(olderThanHours = 24) {
    const cutoff = Date.now() - olderThanHours * 3600000;

    for (const [category, errors] of Object.entries(this.errors)) {
      this.errors[category] = errors.filter(err => new Date(err.timestamp) > new Date(cutoff));
    }

    // Clear old patterns
    for (const [key, pattern] of this.errorPatterns.entries()) {
      if (new Date(pattern.lastSeen) < new Date(cutoff)) {
        this.errorPatterns.delete(key);
      }
    }
  }
}

// Export for use
module.exports = ErrorTracker;

// If run directly, demonstrate functionality
if (require.main === module) {
  const tracker = new ErrorTracker({
    enableAlerts: true,
    alertThreshold: 5
  });

  console.log('🛡️ Error Tracker Started');
  console.log('📊 Error statistics will be logged periodically');

  // Listen for alerts
  tracker.on('alert', alert => {
    console.log('📨 Alert received:', alert);
  });

  // Keep running
  process.on('SIGINT', () => {
    const stats = tracker.getStatistics();
    console.log('\n📊 Final Statistics:', stats);
    process.exit(0);
  });
}
