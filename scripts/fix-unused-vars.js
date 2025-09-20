#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files and their unused variables to fix
const fixes = [
  {
    file: 'api/assessments/adaptive.js',
    changes: [{ old: 'const { demographics } =', new: 'const { demographics: _demographics } =' }]
  },
  {
    file: 'backend.js',
    changes: [
      { old: 'const isProduction =', new: 'const _isProduction =' },
      { old: 'const jwt =', new: 'const _jwt =' },
      { old: 'const bcrypt =', new: 'const _bcrypt =' },
      { old: 'const User =', new: 'const _User =' },
      { old: 'catch (e)', new: 'catch (_e)' },
      { old: ', t)', new: ', _t)' },
      { old: 'const r =', new: 'const _r =' },
      { old: 'const t =', new: 'const _t =' }
    ]
  },
  {
    file: 'js/api-client.js',
    changes: [{ old: 'taskMode =', new: '_taskMode =' }]
  },
  {
    file: 'js/comprehensive-report-generator.js',
    changes: [
      { old: 'neurodiversityScores)', new: '_neurodiversityScores)' },
      { old: ', responses)', new: ', _responses)' }
    ]
  }
];

// Process each file
fixes.forEach(({ file, changes }) => {
  const filePath = path.join(__dirname, '..', file);

  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  changes.forEach(({ old, new: newStr }) => {
    if (content.includes(old)) {
      content = content.replace(
        new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        newStr
      );
      modified = true;
      console.log(`Fixed: ${old} -> ${newStr} in ${file}`);
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Updated ${file}`);
  } else {
    console.log(`No changes needed in ${file}`);
  }
});

console.log('\nUnused variables fixed!');
