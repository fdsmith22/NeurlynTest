/**
 * Comprehensive Report Structure Diagnostic Tool
 * Run this in the browser console after completing an assessment
 */

function diagnoseReport() {
  console.log('='.repeat(80));
  console.log('NEURLYN REPORT STRUCTURE DIAGNOSTIC');
  console.log('='.repeat(80));

  // 1. Find the main container
  const outerContainer = document.querySelector('.enhanced-report-container');
  if (!outerContainer) {
    console.error('❌ Enhanced report container not found!');
    return;
  }

  console.log('✅ Found outer enhanced report container');
  console.log(`Outer container HTML length: ${outerContainer.innerHTML.length} characters`);
  console.log(`Outer container direct children: ${outerContainer.children.length}`);
  console.log('');

  // Check for nested container structure
  const innerContainer = outerContainer.querySelector('.enhanced-report-container');
  const container = innerContainer || outerContainer;

  if (innerContainer) {
    console.log('⚠️  Detected NESTED container structure!');
    console.log(`Inner container HTML length: ${innerContainer.innerHTML.length} characters`);
    console.log('Using inner container for section analysis...');
  } else {
    console.log('Using single container structure');
  }
  console.log('');

  // 2. Analyze all direct children (sections)
  const children = Array.from(container.children);
  console.log(`📊 Total sections: ${children.length}`);
  console.log('');

  // 3. Detailed section analysis
  console.log('SECTION BREAKDOWN:');
  console.log('-'.repeat(80));

  children.forEach((child, index) => {
    const section = {
      index: index + 1,
      tagName: child.tagName,
      classes: child.className || '(none)',
      id: child.id || '(none)',
      htmlLength: child.innerHTML.length,
      textPreview: child.textContent.substring(0, 100).trim().replace(/\s+/g, ' '),
      styles: {
        display: window.getComputedStyle(child).display,
        visibility: window.getComputedStyle(child).visibility,
        opacity: window.getComputedStyle(child).opacity,
        background: window.getComputedStyle(child).background.substring(0, 50),
        padding: window.getComputedStyle(child).padding,
        margin: window.getComputedStyle(child).margin,
        maxWidth: window.getComputedStyle(child).maxWidth,
        width: window.getComputedStyle(child).width
      }
    };

    console.log(`\n[${section.index}] ${section.tagName}`);
    console.log(`  Preview: "${section.textPreview}..."`);
    console.log(`  HTML Length: ${section.htmlLength} chars`);
    console.log(`  Display: ${section.styles.display}`);
    console.log(`  Visibility: ${section.styles.visibility}`);
    console.log(`  Opacity: ${section.styles.opacity}`);
    console.log(`  Padding: ${section.styles.padding}`);
    console.log(`  Width: ${section.styles.width} (max: ${section.styles.maxWidth})`);

    // Check if section might be hidden
    if (section.styles.display === 'none' ||
        section.styles.visibility === 'hidden' ||
        section.styles.opacity === '0') {
      console.warn(`  ⚠️  WARNING: This section may be hidden!`);
    }
  });

  // 4. Look for specific sections
  console.log('\n' + '='.repeat(80));
  console.log('KEY SECTIONS CHECK:');
  console.log('-'.repeat(80));

  const keyPhrases = [
    'Your Comprehensive Personality Report',
    'Your Personality Archetype',
    'Big Five Personality Traits',
    'Assessment Quality',
    'Deep Trait Analysis',
    'Neurodiversity Analysis',
    'Personalized Recommendations',
    'Career & Work Style',
    'Relationship & Communication'
  ];

  keyPhrases.forEach(phrase => {
    const found = container.textContent.includes(phrase);
    console.log(`${found ? '✅' : '❌'} ${phrase}`);
  });

  // 5. Check for floating button
  console.log('\n' + '='.repeat(80));
  console.log('FLOATING BUTTON CHECK:');
  console.log('-'.repeat(80));
  const floatingBtn = document.querySelector('.floating-download-btn');
  if (floatingBtn) {
    console.log('✅ Floating download button found');
    console.log(`  Display: ${window.getComputedStyle(floatingBtn).display}`);
    console.log(`  Position: ${window.getComputedStyle(floatingBtn).position}`);
  } else {
    console.log('❌ Floating download button not found');
  }

  // 6. Check print container
  console.log('\n' + '='.repeat(80));
  console.log('PRINT CONTAINER CHECK:');
  console.log('-'.repeat(80));
  const printContainer = document.getElementById('pdf-print-content');
  if (printContainer) {
    console.log('✅ Print container exists');
    console.log(`  Children: ${printContainer.children.length}`);
    console.log(`  HTML Length: ${printContainer.innerHTML.length} chars`);
    console.log(`  Display: ${window.getComputedStyle(printContainer).display}`);
  } else {
    console.log('ℹ️  Print container not yet created (normal until download is clicked)');
  }

  // 7. CSS Variables check
  console.log('\n' + '='.repeat(80));
  console.log('CSS VARIABLES CHECK:');
  console.log('-'.repeat(80));
  const computedStyle = window.getComputedStyle(container);
  const vars = [
    '--space-5',
    '--space-6',
    '--space-8',
    '--space-10',
    '--color-bg-secondary',
    '--sage-500',
    '--sage-600'
  ];

  vars.forEach(varName => {
    const value = computedStyle.getPropertyValue(varName);
    console.log(`  ${varName}: ${value || '(not defined)'}`);
  });

  // 8. Width analysis
  console.log('\n' + '='.repeat(80));
  console.log('WIDTH CONSISTENCY CHECK:');
  console.log('-'.repeat(80));

  const whiteBgSections = container.querySelectorAll('div[style*="background: white"]');
  console.log(`Found ${whiteBgSections.length} sections with white background`);

  const widths = new Map();
  whiteBgSections.forEach((section, idx) => {
    const computed = window.getComputedStyle(section);
    const width = computed.width;
    const padding = computed.padding;
    const key = `width:${width} padding:${padding}`;

    if (!widths.has(key)) {
      widths.set(key, []);
    }
    widths.get(key).push(idx + 1);
  });

  console.log(`Found ${widths.size} different width/padding combinations:`);
  widths.forEach((sections, key) => {
    console.log(`  ${key}`);
    console.log(`    Sections: ${sections.join(', ')}`);
  });

  // 9. Return data for further inspection
  console.log('\n' + '='.repeat(80));
  console.log('DIAGNOSTIC COMPLETE');
  console.log('='.repeat(80));
  console.log('Tip: Run window.diagnoseReport() again after clicking Download Report');
  console.log('');

  return {
    container,
    sections: children,
    totalLength: container.innerHTML.length,
    sectionCount: children.length,
    whiteBgSections: whiteBgSections.length
  };
}

// Make it globally available
window.diagnoseReport = diagnoseReport;

// Auto-run if enhanced container exists
if (document.querySelector('.enhanced-report-container')) {
  console.log('Report detected! Running diagnostics...\n');
  diagnoseReport();
} else {
  console.log('No report found yet. Complete an assessment, then run: window.diagnoseReport()');
}
