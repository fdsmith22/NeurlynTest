#!/usr/bin/env node

/**
 * Setup Verification Script - Comprehensive system check
 * Run: node scripts/verify-setup.js
 */

const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const checks = [];

function addCheck(name, status, details = '') {
  const icon = status ? '✓' : '✗';
  const color = status ? colors.green : colors.red;
  // console.log(`${color}${icon} ${name}${colors.reset} ${details}`);
  checks.push({ name, status, details });
}

async function checkEnvironment() {
  // console.log(`\n${colors.cyan}1. Environment Configuration${colors.reset}`);

  // Check .env file
  const envExists = fs.existsSync(path.join(__dirname, '../.env'));
  addCheck('.env file exists', envExists);

  // Check required environment variables
  const requiredEnvVars = ['PORT', 'MONGODB_URI', 'NODE_ENV'];

  requiredEnvVars.forEach(varName => {
    const exists = process.env[varName] !== undefined;
    addCheck(
      `${varName} configured`,
      exists,
      exists ? `(${process.env[varName]?.substring(0, 20)}...)` : ''
    );
  });

  return envExists;
}

async function checkDependencies() {
  // console.log(`\n${colors.cyan}2. Dependencies${colors.reset}`);

  const packageJson = require('../package.json');
  const criticalDeps = [
    'express',
    'mongoose',
    'cors',
    'dotenv',
    'winston',
    'joi',
    'helmet',
    'express-rate-limit'
  ];

  criticalDeps.forEach(dep => {
    const installed = packageJson.dependencies[dep] !== undefined;
    addCheck(`${dep} installed`, installed, installed ? `v${packageJson.dependencies[dep]}` : '');
  });

  // Check node_modules
  const nodeModulesExists = fs.existsSync(path.join(__dirname, '../node_modules'));
  addCheck('node_modules exists', nodeModulesExists);

  return nodeModulesExists;
}

async function checkDatabase() {
  // console.log(`\n${colors.cyan}3. Database Connection${colors.reset}`);

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test');
    addCheck('MongoDB connection', true, 'Connected successfully');

    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    const requiredCollections = [
      'questionbanks',
      'reporttemplates',
      'temporarysessions',
      'transactions'
    ];
    requiredCollections.forEach(collection => {
      const exists = collectionNames.includes(collection);
      addCheck(`Collection: ${collection}`, exists);
    });

    // Check question count
    const QuestionBank = require('../models/QuestionBank');
    const questionCount = await QuestionBank.countDocuments();
    addCheck('Questions in database', questionCount > 0, `${questionCount} questions found`);

    // Check question distribution
    const categories = await QuestionBank.distinct('category');
    addCheck('Question categories', categories.length > 0, categories.join(', '));

    const instruments = await QuestionBank.distinct('instrument');
    addCheck('Assessment instruments', instruments.length > 0, `${instruments.length} instruments`);

    return true;
  } catch (error) {
    addCheck('MongoDB connection', false, error.message);
    return false;
  }
}

async function checkServer() {
  // console.log(`\n${colors.cyan}4. Server Status${colors.reset}`);

  const baseUrl = `http://localhost:${process.env.PORT || 3000}`;

  // Check health endpoint
  try {
    const healthResponse = await axios.get(`${baseUrl}/health`);
    addCheck(
      'Health endpoint',
      healthResponse.data.status === 'healthy',
      healthResponse.data.status
    );
  } catch (error) {
    addCheck('Health endpoint', false, 'Server may not be running');
  }

  // Check API endpoints
  const endpoints = [
    { path: '/api/questions/stats', name: 'Questions Stats API' },
    { path: '/api/questions/assessment/personality', name: 'Personality Questions API' },
    { path: '/api/questions/assessment/neurodiversity', name: 'Neurodiversity Questions API' }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${baseUrl}${endpoint.path}`);
      addCheck(endpoint.name, response.data.success === true);
    } catch (error) {
      addCheck(endpoint.name, false, error.message);
    }
  }

  return true;
}

async function checkFileStructure() {
  // console.log(`\n${colors.cyan}5. File Structure${colors.reset}`);

  const requiredDirs = [
    'models',
    'routes',
    'middleware',
    'config',
    'utils',
    'scripts',
    'js/questions'
  ];

  requiredDirs.forEach(dir => {
    const exists = fs.existsSync(path.join(__dirname, '..', dir));
    addCheck(`Directory: ${dir}`, exists);
  });

  const requiredFiles = [
    'backend.js',
    'index.html',
    'webpack.config.js',
    'tsconfig.json',
    '.eslintrc.js',
    '.prettierrc'
  ];

  requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, '..', file));
    addCheck(`File: ${file}`, exists);
  });

  return true;
}

async function checkQuestionData() {
  // console.log(`\n${colors.cyan}6. Question Data Integrity${colors.reset}`);

  try {
    const QuestionBank = require('../models/QuestionBank');

    // Check question distribution by category
    const categoryStats = await QuestionBank.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // console.log(`\n  ${colors.magenta}Questions by Category:${colors.reset}`);
    categoryStats.forEach(stat => {
      // console.log(`    ${stat._id}: ${stat.count}`);
    });

    // Check tier distribution
    const tierStats = await QuestionBank.aggregate([
      { $group: { _id: '$tier', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // console.log(`\n  ${colors.magenta}Questions by Tier:${colors.reset}`);
    tierStats.forEach(stat => {
      // console.log(`    ${stat._id}: ${stat.count}`);
    });

    // Check for required fields
    const sampleQuestion = await QuestionBank.findOne();
    const requiredFields = ['questionId', 'text', 'category', 'instrument', 'responseType'];

    requiredFields.forEach(field => {
      const hasField = sampleQuestion && sampleQuestion[field] !== undefined;
      addCheck(`Questions have ${field}`, hasField);
    });

    return true;
  } catch (error) {
    addCheck('Question data integrity', false, error.message);
    return false;
  }
}

async function generateReport() {
  // console.log(`\n${colors.bright}${colors.yellow}===========================================`);
  // console.log(`             VERIFICATION SUMMARY`);
  // console.log(`===========================================${colors.reset}\n`);

  const passed = checks.filter(c => c.status).length;
  const failed = checks.filter(c => !c.status).length;
  const passRate = Math.round((passed / checks.length) * 100);

  // console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  // console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  // console.log(`Total: ${checks.length}`);
  // console.log(`Pass Rate: ${passRate}%`);

  if (failed > 0) {
    // console.log(`\n${colors.red}Failed Checks:${colors.reset}`);
    checks
      .filter(c => !c.status)
      .forEach(check => {
        // console.log(`  - ${check.name}: ${check.details}`);
      });
  }

  // Generate report file
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      passed,
      failed,
      total: checks.length,
      passRate: `${passRate}%`
    },
    checks: checks,
    systemInfo: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      env: process.env.NODE_ENV
    }
  };

  fs.writeFileSync(path.join(__dirname, '../setup-report.json'), JSON.stringify(report, null, 2));

  // console.log(`\n${colors.cyan}Report saved to setup-report.json${colors.reset}`);

  return passRate === 100;
}

async function main() {
  // console.log(`${colors.bright}${colors.cyan}===========================================`);
  // console.log(`    NEURLYN SETUP VERIFICATION SCRIPT`);
  // console.log(`===========================================${colors.reset}`);

  try {
    await checkEnvironment();
    await checkDependencies();
    await checkFileStructure();
    await checkDatabase();
    await checkServer();
    await checkQuestionData();

    const allPassed = await generateReport();

    if (allPassed) {
      // console.log(
      //         `\n${colors.green}${colors.bright}✨ All checks passed! System is ready.${colors.reset}`
      //       );
      process.exit(0);
    } else {
      // console.log(
      //         `\n${colors.yellow}⚠️  Some checks failed. Please review the report.${colors.reset}`
      //       );
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n${colors.red}Fatal error during verification:${colors.reset}`, error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  main();
}
