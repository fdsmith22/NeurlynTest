#!/usr/bin/env node
/**
 * Neurlyn Setup Requirements Checker
 *
 * Run this script on a new device to verify all requirements are met
 * before starting development.
 *
 * Usage: node scripts/check-requirements.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

const REQUIRED_NODE_VERSION = 18; // Matches package.json requirement
const REQUIRED_NPM_VERSION = 9;
const REQUIRED_MONGO_VERSION = 6;

let passCount = 0;
let failCount = 0;
let warnCount = 0;

function log(message, type = 'info') {
  const prefix = {
    'success': `${GREEN}✓${RESET}`,
    'fail': `${RED}✗${RESET}`,
    'warn': `${YELLOW}⚠${RESET}`,
    'info': `${BLUE}ℹ${RESET}`
  };
  console.log(`${prefix[type]} ${message}`);
}

function section(title) {
  console.log(`\n${BLUE}━━━ ${title} ━━━${RESET}`);
}

function checkCommand(command, description) {
  try {
    execSync(command, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function getVersion(command) {
  try {
    const output = execSync(command, { encoding: 'utf-8' }).trim();
    return output;
  } catch (error) {
    return null;
  }
}

function parseVersion(versionString) {
  const match = versionString.match(/(\d+)\.(\d+)\.(\d+)/);
  if (match) {
    return {
      major: parseInt(match[1]),
      minor: parseInt(match[2]),
      patch: parseInt(match[3])
    };
  }
  return null;
}

function checkNodeVersion() {
  section('Node.js');

  const version = getVersion('node --version');
  if (!version) {
    log('Node.js is not installed', 'fail');
    failCount++;
    return false;
  }

  const parsed = parseVersion(version);
  if (!parsed) {
    log(`Could not parse Node.js version: ${version}`, 'fail');
    failCount++;
    return false;
  }

  if (parsed.major >= REQUIRED_NODE_VERSION) {
    log(`Node.js ${version} (Required: v${REQUIRED_NODE_VERSION}+)`, 'success');
    passCount++;
    return true;
  } else {
    log(`Node.js ${version} - Update required (need v${REQUIRED_NODE_VERSION}+)`, 'fail');
    failCount++;
    return false;
  }
}

function checkNpmVersion() {
  const version = getVersion('npm --version');
  if (!version) {
    log('npm is not installed', 'fail');
    failCount++;
    return false;
  }

  const parsed = parseVersion(version);
  if (!parsed) {
    log(`Could not parse npm version: ${version}`, 'fail');
    failCount++;
    return false;
  }

  if (parsed.major >= REQUIRED_NPM_VERSION) {
    log(`npm ${version} (Required: v${REQUIRED_NPM_VERSION}+)`, 'success');
    passCount++;
    return true;
  } else {
    log(`npm ${version} - Update required (need v${REQUIRED_NPM_VERSION}+)`, 'fail');
    failCount++;
    return false;
  }
}

function checkMongoDB() {
  section('MongoDB');

  // Try mongod first
  let version = getVersion('mongod --version 2>/dev/null | head -1');

  // If mongod not available, try mongo client
  if (!version) {
    version = getVersion('mongo --version 2>/dev/null | head -1');
  }

  // If still no version, try mongosh
  if (!version) {
    version = getVersion('mongosh --version 2>/dev/null');
  }

  if (!version) {
    log('MongoDB is not installed locally', 'warn');
    log('You can use Docker or MongoDB Atlas instead', 'info');
    warnCount++;
    return false;
  }

  const parsed = parseVersion(version);
  if (!parsed) {
    log(`MongoDB found but could not parse version: ${version}`, 'warn');
    warnCount++;
    return true;
  }

  if (parsed.major >= REQUIRED_MONGO_VERSION) {
    log(`MongoDB ${version.split('\n')[0]} (Required: v${REQUIRED_MONGO_VERSION}+)`, 'success');
    passCount++;
    return true;
  } else {
    log(`MongoDB ${version} - Update required (need v${REQUIRED_MONGO_VERSION}+)`, 'fail');
    failCount++;
    return false;
  }
}

function checkDocker() {
  if (checkCommand('docker --version', 'Docker')) {
    const version = getVersion('docker --version');
    log(`Docker ${version}`, 'success');
    passCount++;

    // Check for neurlyn-mongo container
    checkMongoDockerContainer();

    return true;
  } else {
    log('Docker not installed (optional, useful for MongoDB)', 'info');
    return false;
  }
}

function checkMongoDockerContainer() {
  // Check if neurlyn-mongo container exists
  const containerExists = checkCommand('docker ps -a --format "{{.Names}}" | grep -w neurlyn-mongo 2>/dev/null');

  if (!containerExists) {
    log('neurlyn-mongo Docker container not found', 'info');
    log('Create with: docker run -d --name neurlyn-mongo -p 27017:27017 mongo:latest', 'info');
    return false;
  }

  // Check if container is running
  const containerRunning = checkCommand('docker ps --format "{{.Names}}" | grep -w neurlyn-mongo 2>/dev/null');

  if (containerRunning) {
    log('neurlyn-mongo Docker container is running', 'success');
    passCount++;
    return true;
  } else {
    log('neurlyn-mongo container exists but is not running', 'warn');
    log('Start with: docker start neurlyn-mongo', 'info');
    warnCount++;
    return false;
  }
}

function checkGit() {
  section('Git');

  if (checkCommand('git --version', 'Git')) {
    const version = getVersion('git --version');
    log(`${version}`, 'success');
    passCount++;
    return true;
  } else {
    log('Git is not installed', 'fail');
    failCount++;
    return false;
  }
}

function checkProjectFiles() {
  section('Project Files');

  const requiredFiles = [
    'package.json',
    'backend.js',
    'README.md',
    '.gitignore',
    '.env.example'
  ];

  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      log(`${file} exists`, 'success');
      passCount++;
    } else {
      log(`${file} is missing`, 'fail');
      failCount++;
    }
  });
}

function checkEnvFile() {
  section('Environment Configuration');

  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');

  if (!fs.existsSync(envExamplePath)) {
    log('.env.example is missing', 'fail');
    failCount++;
    return false;
  }

  if (fs.existsSync(envPath)) {
    log('.env file exists', 'success');
    passCount++;

    // Check for required variables
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const requiredVars = [
      'MONGODB_URI',
      'PORT',
      'NODE_ENV'
    ];

    requiredVars.forEach(varName => {
      if (envContent.includes(`${varName}=`)) {
        log(`${varName} is configured`, 'success');
        passCount++;
      } else {
        log(`${varName} is missing in .env`, 'fail');
        failCount++;
      }
    });

    // Check optional but recommended variables
    const optionalVars = [
      'JWT_SECRET',
      'STRIPE_SECRET_KEY'
    ];

    optionalVars.forEach(varName => {
      if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=\n`)) {
        log(`${varName} is configured`, 'info');
      } else {
        log(`${varName} not configured (optional)`, 'info');
      }
    });

    return true;
  } else {
    log('.env file does not exist', 'warn');
    log('Copy .env.example to .env and configure it', 'info');
    warnCount++;
    return false;
  }
}

function checkNodeModules() {
  section('Dependencies');

  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  const packageLockPath = path.join(process.cwd(), 'package-lock.json');

  if (fs.existsSync(nodeModulesPath)) {
    log('node_modules directory exists', 'success');

    // Check if it's populated
    const nodeModulesContents = fs.readdirSync(nodeModulesPath);
    if (nodeModulesContents.length > 10) {
      log(`${nodeModulesContents.length} packages installed`, 'success');
      passCount++;
    } else {
      log('node_modules seems empty, run npm install', 'warn');
      warnCount++;
    }
  } else {
    log('node_modules not found - run npm install', 'warn');
    warnCount++;
  }

  if (fs.existsSync(packageLockPath)) {
    log('package-lock.json exists', 'success');
    passCount++;
  } else {
    log('package-lock.json not found', 'warn');
    warnCount++;
  }
}

function checkDatabaseConnection() {
  section('Database Connection');

  // Check if MongoDB is running
  try {
    // Try to connect using mongoose
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
      log('Cannot test database connection - .env not found', 'info');
      return false;
    }

    log('Database connection test requires .env configuration', 'info');
    log('Run "npm run verify" after setup to test connection', 'info');
    return true;
  } catch (error) {
    log('Could not test database connection', 'warn');
    warnCount++;
    return false;
  }
}

function checkOptionalTools() {
  section('Optional Tools');

  // Python (for dev:with-logging)
  if (checkCommand('python3 --version', 'Python 3')) {
    const version = getVersion('python3 --version');
    log(`${version} (for logging script)`, 'info');
  } else {
    log('Python 3 not installed (optional)', 'info');
  }

  // Playwright
  const playwrightPath = path.join(process.cwd(), 'node_modules', '@playwright');
  if (fs.existsSync(playwrightPath)) {
    log('Playwright installed (for E2E tests)', 'info');
  } else {
    log('Playwright not installed (run "npx playwright install" if needed)', 'info');
  }
}

function checkPorts() {
  section('Port Availability');

  const ports = [3000, 8080, 27017];

  ports.forEach(port => {
    try {
      // Try to check if port is in use
      if (checkCommand(`lsof -i :${port} | grep LISTEN 2>/dev/null`, `Port ${port}`)) {
        log(`Port ${port} is in use`, 'warn');
        warnCount++;
      } else {
        log(`Port ${port} is available`, 'success');
        passCount++;
      }
    } catch (error) {
      // lsof might not be available on all systems
      log(`Could not check port ${port} (lsof not available)`, 'info');
    }
  });
}

function printSummary() {
  console.log('\n' + '='.repeat(50));
  console.log(`${BLUE}Requirements Check Summary${RESET}`);
  console.log('='.repeat(50));

  log(`${passCount} checks passed`, 'success');

  if (warnCount > 0) {
    log(`${warnCount} warnings`, 'warn');
  }

  if (failCount > 0) {
    log(`${failCount} checks failed`, 'fail');
  }

  console.log('\n' + '='.repeat(50));

  if (failCount === 0 && warnCount === 0) {
    console.log(`${GREEN}✓ All requirements met! You're ready to start development.${RESET}`);
    console.log('\nNext steps:');
    console.log('  1. npm install');
    console.log('  2. npm run seed');
    console.log('  3. npm run dev');
  } else if (failCount === 0) {
    console.log(`${YELLOW}⚠ Setup is mostly complete, but there are some warnings.${RESET}`);
    console.log('\nAddress the warnings above, then:');
    console.log('  1. npm install (if not done)');
    console.log('  2. npm run seed');
    console.log('  3. npm run dev');
  } else {
    console.log(`${RED}✗ Some requirements are not met.${RESET}`);
    console.log('\nPlease fix the failed checks above before proceeding.');
    console.log('See SETUP-CHECKLIST.md for detailed instructions.');
  }

  console.log('\n');

  return failCount === 0;
}

function main() {
  console.log(`${BLUE}╔════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BLUE}║     Neurlyn Setup Requirements Checker        ║${RESET}`);
  console.log(`${BLUE}╚════════════════════════════════════════════════╝${RESET}`);
  console.log('');

  // Run all checks
  checkNodeVersion();
  checkNpmVersion();
  checkGit();
  checkMongoDB();
  checkDocker();
  checkProjectFiles();
  checkEnvFile();
  checkNodeModules();
  checkDatabaseConnection();
  checkOptionalTools();
  checkPorts();

  // Print summary
  const success = printSummary();

  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}

// Run the checker
main();
