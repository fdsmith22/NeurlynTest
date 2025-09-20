#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function fixFile(filePath) {
  try {
    // Run ESLint fix on the file
    const { stdout, stderr } = await execAsync(`npx eslint ${filePath} --fix`, {
      maxBuffer: 1024 * 1024 * 10
    });

    if (stderr && !stderr.includes('Warning')) {
      console.error(`Error fixing ${filePath}:`, stderr);
    } else {
      console.log(`✅ Fixed: ${path.basename(filePath)}`);
    }
  } catch (error) {
    // ESLint returns non-zero exit code even for warnings
    if (error.stdout) {
      const issues = error.stdout.match(/\d+ problems?/);
      if (issues) {
        console.log(`⚠️  ${path.basename(filePath)}: ${issues[0]} remaining`);
      }
    }
  }
}

async function fixAllFiles() {
  console.log('🔧 Fixing ESLint issues in all JavaScript files...\n');

  const filesToFix = [
    'backend.js',
    'config/*.js',
    'middleware/*.js',
    'models/*.js',
    'routes/*.js',
    'services/*.js',
    'utils/*.js',
    'scripts/*.js',
    'api/**/*.js',
    'monitoring/*.js'
  ];

  for (const pattern of filesToFix) {
    const fullPath = path.join(process.cwd(), pattern);

    // Check if it's a glob pattern or single file
    if (pattern.includes('*')) {
      const dir = path.dirname(fullPath);
      const filePattern = path.basename(fullPath);

      if (fs.existsSync(dir)) {
        const files = fs
          .readdirSync(dir)
          .filter(f => {
            if (filePattern === '*.js') return f.endsWith('.js');
            return f.match(new RegExp(filePattern.replace('*', '.*')));
          })
          .map(f => path.join(dir, f));

        for (const file of files) {
          await fixFile(file);
        }
      }
    } else if (fs.existsSync(fullPath)) {
      await fixFile(fullPath);
    }
  }

  console.log('\n📊 Running final ESLint check...');

  try {
    const { stdout } = await execAsync('npm run lint 2>&1 | tail -5');
    console.log(stdout);
  } catch (error) {
    if (error.stdout) {
      console.log(error.stdout);
    }
  }
}

fixAllFiles().catch(console.error);
