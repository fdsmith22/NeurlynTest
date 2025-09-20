/**
 * Performance Monitoring System
 * Tracks and reports on application performance metrics
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

class PerformanceMonitor {
  constructor(config = {}) {
    this.metrics = {
      apiCalls: [],
      pageLoads: [],
      dbQueries: [],
      memoryUsage: [],
      errors: []
    };

    this.thresholds = {
      apiResponseTime: config.apiResponseTime || 1000, // ms
      pageLoadTime: config.pageLoadTime || 3000, // ms
      dbQueryTime: config.dbQueryTime || 100, // ms
      memoryLimit: config.memoryLimit || 500 * 1024 * 1024, // 500MB
      errorRate: config.errorRate || 0.01 // 1%
    };

    this.reportInterval = config.reportInterval || 60000; // 1 minute
    this.logPath = config.logPath || './monitoring/performance-logs';

    // Ensure log directory exists
    if (!fs.existsSync(this.logPath)) {
      fs.mkdirSync(this.logPath, { recursive: true });
    }

    this.startMonitoring();
  }

  // Track API call performance
  trackApiCall(endpoint, method, duration, statusCode) {
    const metric = {
      endpoint,
      method,
      duration,
      statusCode,
      timestamp: new Date().toISOString(),
      success: statusCode >= 200 && statusCode < 300
    };

    this.metrics.apiCalls.push(metric);

    // Alert if slow
    if (duration > this.thresholds.apiResponseTime) {
      this.alert('SLOW_API', `${method} ${endpoint} took ${duration}ms`);
    }

    // Keep only last 1000 entries
    if (this.metrics.apiCalls.length > 1000) {
      this.metrics.apiCalls.shift();
    }

    return metric;
  }

  // Track page load performance
  trackPageLoad(page, loadTime, resources = []) {
    const metric = {
      page,
      loadTime,
      resourceCount: resources.length,
      totalResourceSize: resources.reduce((sum, r) => sum + (r.size || 0), 0),
      timestamp: new Date().toISOString()
    };

    this.metrics.pageLoads.push(metric);

    // Alert if slow
    if (loadTime > this.thresholds.pageLoadTime) {
      this.alert('SLOW_PAGE_LOAD', `${page} took ${loadTime}ms to load`);
    }

    // Keep only last 500 entries
    if (this.metrics.pageLoads.length > 500) {
      this.metrics.pageLoads.shift();
    }

    return metric;
  }

  // Track database query performance
  trackDbQuery(collection, operation, duration, documentCount = 0) {
    const metric = {
      collection,
      operation,
      duration,
      documentCount,
      timestamp: new Date().toISOString(),
      slow: duration > this.thresholds.dbQueryTime
    };

    this.metrics.dbQueries.push(metric);

    // Alert if slow
    if (metric.slow) {
      this.alert('SLOW_DB_QUERY', `${operation} on ${collection} took ${duration}ms`);
    }

    // Keep only last 1000 entries
    if (this.metrics.dbQueries.length > 1000) {
      this.metrics.dbQueries.shift();
    }

    return metric;
  }

  // Track memory usage
  trackMemoryUsage() {
    const usage = process.memoryUsage();
    const metric = {
      rss: usage.rss,
      heapTotal: usage.heapTotal,
      heapUsed: usage.heapUsed,
      external: usage.external,
      timestamp: new Date().toISOString()
    };

    this.metrics.memoryUsage.push(metric);

    // Alert if high memory
    if (usage.rss > this.thresholds.memoryLimit) {
      this.alert('HIGH_MEMORY', `Memory usage: ${Math.round(usage.rss / 1024 / 1024)}MB`);
    }

    // Keep only last 100 entries
    if (this.metrics.memoryUsage.length > 100) {
      this.metrics.memoryUsage.shift();
    }

    return metric;
  }

  // Track errors
  trackError(error, context = {}) {
    const metric = {
      message: error.message || error,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    };

    this.metrics.errors.push(metric);

    // Calculate error rate
    const recentApiCalls = this.metrics.apiCalls.filter(
      call => new Date(call.timestamp) > new Date(Date.now() - 300000)
    );

    const recentErrors = this.metrics.errors.filter(
      err => new Date(err.timestamp) > new Date(Date.now() - 300000)
    );

    const errorRate = recentApiCalls.length > 0 ? recentErrors.length / recentApiCalls.length : 0;

    if (errorRate > this.thresholds.errorRate) {
      this.alert('HIGH_ERROR_RATE', `Error rate: ${(errorRate * 100).toFixed(2)}%`);
    }

    // Keep only last 100 errors
    if (this.metrics.errors.length > 100) {
      this.metrics.errors.shift();
    }

    return metric;
  }

  // Generate performance report
  generateReport() {
    const now = Date.now();
    const fiveMinutesAgo = now - 300000;

    // Calculate API metrics
    const recentApiCalls = this.metrics.apiCalls.filter(
      call => new Date(call.timestamp) > new Date(fiveMinutesAgo)
    );

    const apiMetrics = {
      totalCalls: recentApiCalls.length,
      averageResponseTime:
        recentApiCalls.length > 0
          ? recentApiCalls.reduce((sum, call) => sum + call.duration, 0) / recentApiCalls.length
          : 0,
      successRate:
        recentApiCalls.length > 0
          ? recentApiCalls.filter(call => call.success).length / recentApiCalls.length
          : 1,
      slowCalls: recentApiCalls.filter(call => call.duration > this.thresholds.apiResponseTime)
        .length
    };

    // Calculate page load metrics
    const recentPageLoads = this.metrics.pageLoads.filter(
      load => new Date(load.timestamp) > new Date(fiveMinutesAgo)
    );

    const pageMetrics = {
      totalLoads: recentPageLoads.length,
      averageLoadTime:
        recentPageLoads.length > 0
          ? recentPageLoads.reduce((sum, load) => sum + load.loadTime, 0) / recentPageLoads.length
          : 0,
      slowLoads: recentPageLoads.filter(load => load.loadTime > this.thresholds.pageLoadTime).length
    };

    // Calculate DB metrics
    const recentDbQueries = this.metrics.dbQueries.filter(
      query => new Date(query.timestamp) > new Date(fiveMinutesAgo)
    );

    const dbMetrics = {
      totalQueries: recentDbQueries.length,
      averageQueryTime:
        recentDbQueries.length > 0
          ? recentDbQueries.reduce((sum, query) => sum + query.duration, 0) / recentDbQueries.length
          : 0,
      slowQueries: recentDbQueries.filter(query => query.slow).length
    };

    // Current memory usage
    const currentMemory = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1] || {};

    // Recent errors
    const recentErrors = this.metrics.errors.filter(
      err => new Date(err.timestamp) > new Date(fiveMinutesAgo)
    );

    const report = {
      timestamp: new Date().toISOString(),
      period: '5_minutes',
      api: apiMetrics,
      pages: pageMetrics,
      database: dbMetrics,
      memory: {
        current: Math.round((currentMemory.rss || 0) / 1024 / 1024),
        heap: Math.round((currentMemory.heapUsed || 0) / 1024 / 1024),
        limit: Math.round(this.thresholds.memoryLimit / 1024 / 1024)
      },
      errors: {
        count: recentErrors.length,
        rate: apiMetrics.totalCalls > 0 ? recentErrors.length / apiMetrics.totalCalls : 0
      },
      health: this.calculateHealthScore(apiMetrics, pageMetrics, dbMetrics, recentErrors.length)
    };

    return report;
  }

  // Calculate overall health score
  calculateHealthScore(apiMetrics, pageMetrics, dbMetrics, errorCount) {
    let score = 100;

    // Deduct for slow API calls
    if (apiMetrics.averageResponseTime > this.thresholds.apiResponseTime * 0.5) {
      score -= 10;
    }
    if (apiMetrics.averageResponseTime > this.thresholds.apiResponseTime) {
      score -= 20;
    }

    // Deduct for low success rate
    if (apiMetrics.successRate < 0.99) score -= 10;
    if (apiMetrics.successRate < 0.95) score -= 20;

    // Deduct for slow page loads
    if (pageMetrics.averageLoadTime > this.thresholds.pageLoadTime * 0.7) {
      score -= 10;
    }
    if (pageMetrics.averageLoadTime > this.thresholds.pageLoadTime) {
      score -= 20;
    }

    // Deduct for slow DB queries
    if (dbMetrics.averageQueryTime > this.thresholds.dbQueryTime * 0.7) {
      score -= 10;
    }
    if (dbMetrics.averageQueryTime > this.thresholds.dbQueryTime) {
      score -= 15;
    }

    // Deduct for errors
    if (errorCount > 5) score -= 10;
    if (errorCount > 10) score -= 20;

    return Math.max(0, score);
  }

  // Send alert
  alert(type, message) {
    const alert = {
      type,
      message,
      timestamp: new Date().toISOString()
    };

    console.warn(`⚠️  PERFORMANCE ALERT [${type}]: ${message}`);

    // Log to file
    const alertFile = path.join(this.logPath, 'alerts.log');
    fs.appendFileSync(alertFile, JSON.stringify(alert) + '\n');

    return alert;
  }

  // Start monitoring
  startMonitoring() {
    // Monitor memory every 30 seconds
    setInterval(() => {
      this.trackMemoryUsage();
    }, 30000);

    // Generate reports every minute
    setInterval(() => {
      const report = this.generateReport();
      this.saveReport(report);

      // Log summary
      console.log(`📊 Performance Report - Health: ${report.health}%`);
      console.log(
        `   API: ${report.api.totalCalls} calls, ${Math.round(report.api.averageResponseTime)}ms avg`
      );
      console.log(
        `   Pages: ${report.pages.totalLoads} loads, ${Math.round(report.pages.averageLoadTime)}ms avg`
      );
      console.log(
        `   DB: ${report.database.totalQueries} queries, ${Math.round(report.database.averageQueryTime)}ms avg`
      );
      console.log(`   Memory: ${report.memory.current}MB / ${report.memory.limit}MB`);
      console.log(`   Errors: ${report.errors.count} (${(report.errors.rate * 100).toFixed(2)}%)`);
    }, this.reportInterval);
  }

  // Save report to file
  saveReport(report) {
    const date = new Date().toISOString().split('T')[0];
    const reportFile = path.join(this.logPath, `performance-${date}.jsonl`);
    fs.appendFileSync(reportFile, JSON.stringify(report) + '\n');
  }

  // Get current metrics summary
  getMetricsSummary() {
    const report = this.generateReport();
    return {
      health: report.health,
      api: {
        responseTime: Math.round(report.api.averageResponseTime),
        successRate: (report.api.successRate * 100).toFixed(1)
      },
      pages: {
        loadTime: Math.round(report.pages.averageLoadTime)
      },
      database: {
        queryTime: Math.round(report.database.averageQueryTime)
      },
      memory: {
        usage: report.memory.current,
        percentage: ((report.memory.current / report.memory.limit) * 100).toFixed(1)
      },
      errors: {
        count: report.errors.count,
        rate: (report.errors.rate * 100).toFixed(2)
      }
    };
  }
}

// Export for use in other modules
module.exports = PerformanceMonitor;

// If run directly, start monitoring
if (require.main === module) {
  const monitor = new PerformanceMonitor({
    apiResponseTime: 1000,
    pageLoadTime: 3000,
    dbQueryTime: 100,
    memoryLimit: 500 * 1024 * 1024,
    errorRate: 0.01,
    reportInterval: 60000
  });

  console.log('🚀 Performance Monitor Started');
  console.log('📊 Reports will be generated every minute');
  console.log(`📁 Logs saved to: ${monitor.logPath}`);

  // Keep process running
  process.on('SIGINT', () => {
    console.log('\n👋 Performance Monitor Stopped');
    process.exit(0);
  });
}
