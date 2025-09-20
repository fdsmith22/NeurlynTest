const express = require('express');
const router = express.Router();
const os = require('os');
const database = require('../config/database');
const logger = require('../utils/logger');
const { version } = require('../package.json');

/**
 * @route   GET /health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'neurlyn-backend',
    version
  });
});

/**
 * @route   GET /health/live
 * @desc    Liveness probe for Kubernetes
 * @access  Public
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /health/ready
 * @desc    Readiness probe - checks if service is ready to accept traffic
 * @access  Public
 */
router.get('/ready', async (req, res) => {
  try {
    const dbHealth = await database.healthCheck();

    if (!dbHealth.healthy) {
      return res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: dbHealth
        }
      });
    }

    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbHealth
      }
    });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * @route   GET /health/detailed
 * @desc    Detailed health check with system metrics
 * @access  Private (should be protected in production)
 */
router.get('/detailed', async (req, res) => {
  try {
    const dbHealth = await database.healthCheck();

    const systemInfo = {
      platform: process.platform,
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage(),
        system: {
          total: os.totalmem(),
          free: os.freemem(),
          usage: (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(2) + '%'
        }
      },
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0]?.model,
        usage: os.loadavg()
      }
    };

    const health = {
      status: dbHealth.healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version,
      environment: process.env.NODE_ENV,
      checks: {
        database: dbHealth
      },
      system: systemInfo
    };

    const statusCode = dbHealth.healthy ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Detailed health check failed:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * @route   GET /health/metrics
 * @desc    Prometheus-compatible metrics endpoint
 * @access  Private (should be protected in production)
 */
router.get('/metrics', async (req, res) => {
  try {
    const dbStatus = database.getStatus();
    const memUsage = process.memoryUsage();

    // Format as Prometheus metrics
    const metrics = [
      `# HELP nodejs_version_info Node.js version`,
      `# TYPE nodejs_version_info gauge`,
      `nodejs_version_info{version="${process.version}"} 1`,
      '',
      `# HELP process_uptime_seconds Process uptime in seconds`,
      `# TYPE process_uptime_seconds gauge`,
      `process_uptime_seconds ${process.uptime()}`,
      '',
      `# HELP nodejs_memory_heap_used_bytes Process heap memory usage`,
      `# TYPE nodejs_memory_heap_used_bytes gauge`,
      `nodejs_memory_heap_used_bytes ${memUsage.heapUsed}`,
      '',
      `# HELP nodejs_memory_heap_total_bytes Process total heap memory`,
      `# TYPE nodejs_memory_heap_total_bytes gauge`,
      `nodejs_memory_heap_total_bytes ${memUsage.heapTotal}`,
      '',
      `# HELP database_connected Database connection status`,
      `# TYPE database_connected gauge`,
      `database_connected ${dbStatus.isConnected ? 1 : 0}`,
      ''
    ].join('\n');

    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    logger.error('Metrics generation failed:', error);
    res.status(500).send('Error generating metrics');
  }
});

module.exports = router;
