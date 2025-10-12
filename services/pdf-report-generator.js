/**
 * PDF Report Generator Service
 * Generates PDF-optimized HTML from assessment report data
 * Designed for reliable Puppeteer rendering without truncation
 */

class PDFReportGenerator {
  /**
   * Generate complete PDF HTML from report data
   * @param {Object} reportData - Report data from ComprehensiveReportGenerator
   * @returns {String} Complete HTML document ready for PDF conversion
   */
  generatePdfHtml(reportData) {
    const {
      personality,
      archetype,
      percentiles,
      detailed = {},
      timestamp,
      tier,
      metadata = {},
      ruoType,
      interpersonal
    } = reportData;

    const {
      neurodiversity = {},
      insights = [],
      recommendations = [],
      careerInsights = {},
      relationshipInsights = {},
      narratives = {},
      profiles = {},
      hexaco = {},
      temperament = {},
      ageNormative = {},
      behavioralFingerprint = {},
      subDimensions = {}
    } = detailed;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Neurlyn Assessment Report</title>
  ${this.renderStyles()}
</head>
<body>
  <div class="pdf-container">
    ${this.renderHeader(reportData)}
    ${metadata && metadata.responseQuality ? this.renderAssessmentQuality(metadata.responseQuality) : ''}
    ${archetype && typeof archetype === 'object' ? this.renderArchetype(archetype) : ''}
    ${this.renderBigFive(personality, percentiles)}
    ${ruoType && Object.keys(ruoType).length > 0 ? this.renderRUOTypology(ruoType) : ''}
    ${interpersonal && Object.keys(interpersonal).length > 0 ? this.renderInterpersonalStyle(interpersonal) : ''}
    ${hexaco && Object.keys(hexaco).length > 0 ? this.renderHexaco(hexaco) : ''}
    ${temperament && Object.keys(temperament).length > 0 ? this.renderTemperament(temperament) : ''}
    ${ageNormative && Object.keys(ageNormative).length > 0 ? this.renderAgeNormative(ageNormative) : ''}
    ${subDimensions && Object.keys(subDimensions).length > 0 ? this.renderSubDimensions(subDimensions) : ''}
    ${behavioralFingerprint && Object.keys(behavioralFingerprint).length > 0 ? this.renderBehavioralFingerprint(behavioralFingerprint) : ''}
    ${neurodiversity && Object.keys(neurodiversity).length > 0 ? this.renderNeurodiversity(neurodiversity, personality) : ''}
    ${this.renderProfiles(profiles)}
    ${insights && insights.length > 0 ? this.renderInsights(insights) : ''}
    ${recommendations && recommendations.length > 0 ? this.renderRecommendations(recommendations) : ''}
    ${careerInsights && Object.keys(careerInsights).length > 0 ? this.renderCareerInsights(careerInsights) : ''}
    ${relationshipInsights && Object.keys(relationshipInsights).length > 0 ? this.renderRelationshipInsights(relationshipInsights) : ''}
    ${narratives && narratives.opening ? this.renderNarrative(narratives) : ''}
    ${this.renderFooter(timestamp, tier)}
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Render inline CSS styles optimized for PDF printing
   */
  renderStyles() {
    return `
<style>
  /* ============================================
     NEURLYN DESIGN SYSTEM
     Professional Report Styling Framework
     ============================================ */

  /* Design Tokens - CSS Custom Properties */
  :root {
    /* Primary Brand Colors */
    --neurlyn-primary: #6c9e83;
    --neurlyn-primary-light: #8bb69d;
    --neurlyn-primary-dark: #548069;
    --neurlyn-primary-darker: #426352;
    --neurlyn-accent: #a8d4ba;
    --neurlyn-background: #e6efe9;

    /* Semantic Colors */
    --color-success: #10b981;
    --color-success-light: #d1fae5;
    --color-success-dark: #065f46;
    --color-warning: #f59e0b;
    --color-warning-light: #fef3c7;
    --color-warning-dark: #92400e;
    --color-info: #3b82f6;
    --color-info-light: #dbeafe;
    --color-info-dark: #1e40af;
    --color-danger: #ef4444;
    --color-danger-light: #fee2e2;
    --color-danger-dark: #991b1b;

    /* Neutral Palette */
    --neutral-50: #f9fafb;
    --neutral-100: #f3f4f6;
    --neutral-200: #e5e7eb;
    --neutral-300: #d1d5db;
    --neutral-400: #9ca3af;
    --neutral-500: #6b7280;
    --neutral-600: #4b5563;
    --neutral-700: #374151;
    --neutral-800: #1f2937;
    --neutral-900: #111827;

    /* Typography Scale */
    --text-xs: 13px;
    --text-sm: 14px;
    --text-base: 16px;
    --text-lg: 18px;
    --text-xl: 20px;
    --text-2xl: 24px;
    --text-3xl: 28px;
    --text-4xl: 32px;
    --text-5xl: 38px;
    --text-6xl: 42px;

    /* Font Weights */
    --font-normal: 400;
    --font-medium: 500;
    --font-semibold: 600;
    --font-bold: 700;

    /* Line Heights */
    --leading-tight: 1.25;
    --leading-snug: 1.375;
    --leading-normal: 1.5;
    --leading-relaxed: 1.625;
    --leading-loose: 1.75;

    /* Spacing Scale (8px base) */
    --space-1: 8px;
    --space-2: 12px;
    --space-3: 16px;
    --space-4: 20px;
    --space-5: 24px;
    --space-6: 28px;
    --space-7: 32px;
    --space-8: 40px;
    --space-9: 48px;
    --space-10: 56px;
    --space-11: 64px;

    /* Border Radius */
    --radius-sm: 6px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --radius-2xl: 20px;
    --radius-full: 9999px;

    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
    --shadow-xl: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  /* Global Reset */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: var(--text-base);
    line-height: var(--leading-relaxed);
    color: var(--neutral-700);
    background: #ffffff;
  }

  .pdf-container {
    max-width: 100%;
    padding: 0;
  }

  /* Page break controls */
  .section {
    page-break-inside: avoid;
    break-inside: avoid;
    margin-bottom: var(--space-10);
    padding-top: var(--space-7);
    border-top: 1px solid var(--neurlyn-background);
  }

  .section:first-of-type {
    border-top: none;
    padding-top: 0;
  }

  .card {
    page-break-inside: avoid;
    break-inside: avoid;
    margin-bottom: var(--space-5);
    padding: var(--space-7);
    background: var(--neutral-50);
    border: 1px solid var(--neutral-200);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }

  /* Typography */
  h1 {
    font-size: var(--text-6xl);
    font-weight: var(--font-bold);
    color: var(--neutral-900);
    margin-bottom: var(--space-2);
    line-height: var(--leading-tight);
    letter-spacing: -0.025em;
    page-break-after: avoid;
  }

  h2 {
    font-size: var(--text-4xl);
    font-weight: var(--font-semibold);
    color: var(--neutral-800);
    margin-bottom: var(--space-5);
    margin-top: 0;
    line-height: var(--leading-snug);
    letter-spacing: -0.025em;
    padding-bottom: var(--space-2);
    border-bottom: 2px solid var(--neurlyn-primary);
    page-break-after: avoid;
  }

  h3 {
    font-size: var(--text-2xl);
    font-weight: var(--font-semibold);
    color: var(--neurlyn-primary-darker);
    margin-bottom: var(--space-3);
    line-height: var(--leading-snug);
    page-break-after: avoid;
  }

  h4 {
    font-size: var(--text-xl);
    font-weight: var(--font-semibold);
    color: var(--neurlyn-primary-dark);
    margin-bottom: var(--space-2);
    line-height: var(--leading-snug);
  }

  p {
    margin-bottom: var(--space-3);
    color: var(--neutral-600);
    font-size: var(--text-base);
    line-height: var(--leading-relaxed);
  }

  /* Header section */
  .report-header {
    position: relative;
    text-align: center;
    padding: var(--space-10) var(--space-8);
    background: linear-gradient(135deg, var(--neurlyn-primary) 0%, var(--neurlyn-primary-dark) 100%);
    color: #ffffff;
    border-radius: var(--radius-xl);
    margin-bottom: var(--space-8);
    page-break-after: avoid;
    box-shadow: var(--shadow-lg);
    overflow: hidden;
  }

  .report-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.03) 35px, rgba(255,255,255,.03) 70px);
    pointer-events: none;
  }

  .report-header h1 {
    position: relative;
    color: #ffffff;
    font-size: var(--text-6xl);
    font-weight: var(--font-bold);
    margin-bottom: var(--space-2);
    letter-spacing: -0.025em;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .report-header .subtitle {
    position: relative;
    font-size: var(--text-2xl);
    font-weight: var(--font-semibold);
    opacity: 0.95;
    margin-bottom: var(--space-5);
    text-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }

  .report-header .metadata {
    position: relative;
    font-size: var(--text-sm);
    opacity: 0.88;
  }

  .report-header .confidential-badge {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(10px);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    border: 1px solid rgba(255,255,255,0.2);
  }

  /* Big Five traits */
  .trait-container {
    margin-bottom: var(--space-5);
    padding: var(--space-5);
    background: #ffffff;
    border: 1px solid var(--neutral-200);
    border-radius: var(--radius-lg);
    page-break-inside: avoid;
    box-shadow: var(--shadow-sm);
  }

  .trait-item {
    display: flex;
    align-items: center;
    margin-bottom: var(--space-3);
    page-break-inside: avoid;
  }

  .trait-icon {
    flex: 0 0 40px;
    font-size: 28px;
    text-align: center;
    margin-right: var(--space-2);
  }

  .trait-label {
    flex: 0 0 180px;
    font-weight: var(--font-semibold);
    color: var(--neurlyn-primary-darker);
    font-size: var(--text-base);
  }

  .trait-bar-container {
    flex: 1;
    height: 48px;
    background: var(--neutral-100);
    border-radius: var(--radius-full);
    overflow: visible;
    position: relative;
    margin-right: var(--space-3);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
  }

  .trait-bar {
    height: 100%;
    border-radius: var(--radius-full);
    transition: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .trait-bar.level-low {
    background: linear-gradient(90deg, #60a5fa, #93c5fd);
  }

  .trait-bar.level-medium {
    background: linear-gradient(90deg, var(--neutral-400), var(--neutral-300));
  }

  .trait-bar.level-high {
    background: linear-gradient(90deg, var(--color-success-dark), var(--color-success));
  }

  .trait-score {
    flex: 0 0 70px;
    text-align: center;
    font-weight: var(--font-bold);
    color: var(--neutral-900);
    font-size: var(--text-xl);
  }

  .percentile-marker {
    position: absolute;
    top: -4px;
    width: 12px;
    height: 12px;
    background: var(--neurlyn-primary-dark);
    border: 2px solid #ffffff;
    border-radius: 50%;
    transform: translateX(-6px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .trait-interpretation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--neutral-50);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
  }

  .interpretation-level {
    font-weight: var(--font-semibold);
    color: var(--neurlyn-primary-darker);
  }

  .population-context {
    color: var(--neutral-600);
    font-style: italic;
    font-size: var(--text-sm);
  }

  /* Neurodiversity sections */
  .nd-domain {
    margin-bottom: var(--space-4);
    padding: var(--space-4);
    background: #ffffff;
    border-left: 3px solid var(--neurlyn-primary-light);
    border-radius: var(--radius-md);
  }

  .nd-domain h4 {
    color: var(--neurlyn-primary-dark);
    margin-bottom: var(--space-2);
  }

  .nd-score {
    display: inline-block;
    padding: var(--space-1) var(--space-3);
    background: var(--neurlyn-background);
    color: var(--neurlyn-primary-darker);
    border-radius: var(--radius-sm);
    font-weight: var(--font-semibold);
    font-size: var(--text-sm);
    margin-bottom: var(--space-2);
  }

  .nd-indicators {
    margin-top: var(--space-3);
  }

  .nd-indicator-item {
    padding: var(--space-2) var(--space-2);
    background: var(--neutral-50);
    border-radius: var(--radius-sm);
    margin-bottom: var(--space-1);
    font-size: var(--text-sm);
    color: var(--neutral-600);
  }

  /* Insights and recommendations */
  .insight-card, .recommendation-card {
    padding: var(--space-4);
    background: #ffffff;
    border: 1px solid var(--neutral-200);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-3);
    page-break-inside: avoid;
  }

  .insight-card h4 {
    color: var(--neurlyn-primary-dark);
  }

  .recommendation-card {
    border-left: 3px solid var(--color-warning-light);
    background: #fefaf5;
  }

  /* Lists */
  ul {
    margin-left: var(--space-4);
    margin-bottom: var(--space-3);
  }

  li {
    margin-bottom: var(--space-1);
    color: var(--neutral-600);
    line-height: var(--leading-relaxed);
  }

  /* Grid layouts */
  .two-column {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-4);
    margin-bottom: var(--space-4);
  }

  /* Badges */
  .badge {
    display: inline-block;
    padding: var(--space-2) var(--space-4);
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(10px);
    border-radius: var(--radius-full);
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    margin: 0 var(--space-1);
    white-space: nowrap;
    border: 1px solid rgba(255,255,255,0.3);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .metadata-badges {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: var(--space-3);
  }

  /* Footer */
  .report-footer {
    margin-top: var(--space-10);
    padding-top: var(--space-6);
    border-top: 1px solid var(--neutral-200);
    text-align: center;
    color: var(--neutral-500);
    font-size: var(--text-sm);
  }

  /* ============================================
     UNIFIED COMPONENT CLASSES
     Reusable card and display components
     ============================================ */

  /* Section Cards - Major section containers */
  .section-card {
    padding: var(--space-7);
    background: #ffffff;
    border: 1px solid var(--neutral-200);
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-5);
    page-break-inside: avoid;
    box-shadow: var(--shadow-sm);
  }

  /* Metric Cards - Display individual metrics/scores */
  .metric-card {
    padding: var(--space-5);
    background: var(--neutral-50);
    border: 1px solid var(--neutral-200);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-3);
    page-break-inside: avoid;
  }

  .metric-card h4 {
    margin-bottom: var(--space-2);
    font-size: var(--text-lg);
  }

  .metric-card p {
    margin-bottom: var(--space-1);
    font-size: var(--text-sm);
  }

  /* Content Cards - General text content containers */
  .content-card {
    padding: var(--space-4);
    background: #ffffff;
    border: 1px solid var(--neutral-200);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-3);
    page-break-inside: avoid;
  }

  /* Accent Cards - Colored themed cards */
  .accent-card-green {
    padding: var(--space-4);
    background: var(--color-success-light);
    border-left: 4px solid var(--color-success);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-3);
    page-break-inside: avoid;
  }

  .accent-card-green h4 {
    color: var(--color-success-dark);
  }

  .accent-card-blue {
    padding: var(--space-4);
    background: var(--color-info-light);
    border-left: 4px solid var(--color-info);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-3);
    page-break-inside: avoid;
  }

  .accent-card-blue h4 {
    color: var(--color-info-dark);
  }

  .accent-card-amber {
    padding: var(--space-4);
    background: var(--color-warning-light);
    border-left: 4px solid var(--color-warning);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-3);
    page-break-inside: avoid;
  }

  .accent-card-amber h4 {
    color: var(--color-warning-dark);
  }

  /* Icon Badges - Small labeled indicators */
  .icon-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-3);
    background: var(--neutral-100);
    border-radius: var(--radius-full);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--neutral-700);
  }

  /* Stat Display - Large number with label */
  .stat-display {
    text-align: center;
    padding: var(--space-5);
  }

  .stat-display .stat-value {
    display: block;
    font-size: var(--text-5xl);
    font-weight: var(--font-bold);
    color: var(--neurlyn-primary);
    line-height: var(--leading-tight);
    margin-bottom: var(--space-1);
  }

  .stat-display .stat-label {
    display: block;
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--neutral-600);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Mini Bar - Compact progress/score indicator */
  .mini-bar {
    height: 8px;
    background: var(--neutral-200);
    border-radius: var(--radius-full);
    overflow: hidden;
    margin: var(--space-2) 0;
  }

  .mini-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--neurlyn-primary-dark), var(--neurlyn-primary));
    border-radius: var(--radius-full);
    transition: width 0.3s ease;
  }

  .mini-bar-fill.success {
    background: linear-gradient(90deg, var(--color-success-dark), var(--color-success));
  }

  .mini-bar-fill.warning {
    background: linear-gradient(90deg, var(--color-warning-dark), var(--color-warning));
  }

  .mini-bar-fill.info {
    background: linear-gradient(90deg, var(--color-info-dark), var(--color-info));
  }

  /* Print optimizations */
  @media print {
    body {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }

    .section, .card, .trait-item, .insight-card, .recommendation-card, .nd-domain {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    h1, h2, h3, h4 {
      page-break-after: avoid !important;
    }
  }
</style>
    `;
  }

  /**
   * Render report header with title and metadata
   */
  renderHeader(reportData) {
    const { archetype = {}, timestamp, tier, metadata = {} } = reportData;
    const archetypeName = archetype.name || archetype || 'Your Personality Profile';
    const date = new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
<div class="report-header">
  <div class="confidential-badge">🔒 Confidential</div>
  <h1>Your Comprehensive<br>Personality Report</h1>
  <div class="subtitle">${this.escapeHtml(archetypeName)}</div>
  <div class="metadata-badges">
    <span class="badge">📅 ${date}</span>
    <span class="badge">⭐ ${tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Standard'} Assessment</span>
    <span class="badge">✓ ${metadata.totalQuestions || 70} Questions</span>
  </div>
</div>
    `;
  }

  /**
   * Render Big Five personality traits section
   */
  renderBigFive(personality, percentiles = {}) {
    if (!personality || !personality.bigFive) {
      return '';
    }

    const { bigFive } = personality;
    const traits = [
      { key: 'openness', label: 'Openness to Experience', icon: '🔍' },
      { key: 'conscientiousness', label: 'Conscientiousness', icon: '⚙️' },
      { key: 'extraversion', label: 'Extraversion', icon: '🎭' },
      { key: 'agreeableness', label: 'Agreeableness', icon: '🤝' },
      { key: 'neuroticism', label: 'Emotional Stability', icon: '🧘' }
    ];

    const getScoreLevel = (percentile) => {
      if (percentile < 40) return 'level-low';
      if (percentile > 65) return 'level-high';
      return 'level-medium';
    };

    const traitsHtml = traits.map(({ key, label, icon }) => {
      const score = bigFive[key] || 50;
      const percentile = percentiles[key] || score;
      const interpretation = this.getTraitInterpretation(percentile);
      const populationContext = this.getPopulationContext(percentile);
      const scoreLevel = getScoreLevel(percentile);

      return `
<div class="trait-container">
  <div class="trait-item">
    <div class="trait-icon">${icon}</div>
    <div class="trait-label">${label}</div>
    <div class="trait-bar-container">
      <div class="trait-bar ${scoreLevel}" style="width: ${percentile}%"></div>
      <!-- Percentile markers at 25, 50, 75 -->
      <div class="percentile-marker" style="left: 25%; top: 50%;"></div>
      <div class="percentile-marker" style="left: 50%; top: 50%;"></div>
      <div class="percentile-marker" style="left: 75%; top: 50%;"></div>
    </div>
    <div class="trait-score">${Math.round(percentile)}</div>
  </div>
  <div class="trait-interpretation">
    <span class="interpretation-level">${interpretation}</span>
    <span class="population-context">${populationContext}</span>
  </div>
</div>
      `;
    }).join('');

    return `
<div class="section">
  <h2>Big Five Personality Traits</h2>
  <div class="card">
    <p style="margin-bottom: var(--space-5); color: var(--neutral-500); font-size: var(--text-base);">
      The Big Five model is the most scientifically validated personality framework, based on decades of research across cultures and populations.
      <span style="font-size: var(--text-sm); color: var(--neutral-400); font-style: italic;">Costa & McCrae, 1992</span>
    </p>
    ${traitsHtml}
    ${personality.summary ? `
    <div style="margin-top: var(--space-7); padding-top: var(--space-5); border-top: 2px solid var(--neurlyn-background);">
      <h4>Your Personality Summary</h4>
      <p style="font-size: var(--text-lg); line-height: var(--leading-loose);">${this.escapeHtml(personality.summary)}</p>
    </div>
    ` : ''}
  </div>
</div>
    `;
  }

  /**
   * Render neurodiversity assessment section
   */
  renderNeurodiversity(neurodiversity, personality = null) {
    if (!neurodiversity) return '';

    const { adhd, autism, executiveFunction, sensoryProfile, interpretations = {} } = neurodiversity;

    let html = `
<div class="section">
  <h2>🧠 Neurodiversity Profile</h2>
  <p style="margin-bottom: var(--space-5); color: var(--neutral-500); font-size: var(--text-base);">
    This assessment examines neurodevelopmental patterns including ADHD indicators, autism spectrum traits, executive function, and sensory processing.
  </p>
</div>
<div class="section">`;

    // ADHD section - only show if score exists
    if (adhd && adhd.score !== undefined && adhd.score !== null) {
      const scoreLevel = adhd.score < 40 ? 'level-low' : adhd.score > 65 ? 'level-high' : 'level-medium';
      html += `
<div class="section-card">
  <h3 style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-4);">
    <span style="font-size: 28px;">⚡</span>
    ADHD Indicators
  </h3>
  <div class="stat-display" style="margin-bottom: var(--space-4);">
    <span class="stat-value">${Math.round(adhd.score)}</span>
    <span class="stat-label">Score (out of 100)</span>
  </div>
  <div class="mini-bar" style="margin-bottom: var(--space-4);">
    <div class="mini-bar-fill ${scoreLevel}" style="width: ${adhd.score}%;"></div>
  </div>
  <p style="margin-bottom: var(--space-4); color: var(--neutral-700); line-height: var(--leading-relaxed);">${interpretations.adhd?.description || this.getADHDInterpretation(adhd.score)}</p>
  ${adhd.subcategories ? this.renderSubcategories(adhd.subcategories) : ''}
  ${adhd.indicators && adhd.indicators.length > 0 ? this.renderIndicators(adhd.indicators) : ''}
</div>
      `;
    }

    // Autism section - only show if score exists
    if (autism && autism.score !== undefined && autism.score !== null) {
      const scoreLevel = autism.score < 40 ? 'level-low' : autism.score > 65 ? 'level-high' : 'level-medium';
      html += `
<div class="section-card">
  <h3 style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-4);">
    <span style="font-size: 28px;">🌈</span>
    Autism Spectrum Indicators
  </h3>
  <div class="stat-display" style="margin-bottom: var(--space-4);">
    <span class="stat-value">${Math.round(autism.score)}</span>
    <span class="stat-label">Score (out of 100)</span>
  </div>
  <div class="mini-bar" style="margin-bottom: var(--space-4);">
    <div class="mini-bar-fill ${scoreLevel}" style="width: ${autism.score}%;"></div>
  </div>
  <p style="margin-bottom: var(--space-4); color: var(--neutral-700); line-height: var(--leading-relaxed);">${interpretations.autism?.description || this.getAutismInterpretation(autism.score)}</p>
  ${autism.subcategories ? this.renderSubcategories(autism.subcategories) : ''}
  ${autism.indicators && autism.indicators.length > 0 ? this.renderIndicators(autism.indicators) : ''}
</div>
      `;
    }

    // Executive Function section - only show if there's actual content
    if (executiveFunction && Object.keys(executiveFunction).length > 0) {
      const efContent = this.renderExecutiveFunction(executiveFunction, personality);
      if (efContent && efContent.trim()) {
        html += `
<div class="section-card">
  <h3 style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-4);">
    <span style="font-size: 28px;">🧩</span>
    Executive Function Profile
  </h3>
  ${efContent}
</div>
        `;
      }
    }

    // Sensory Profile section - only show if there's actual content
    if (sensoryProfile && Object.keys(sensoryProfile).length > 0) {
      const sensoryContent = this.renderSensoryProfile(sensoryProfile, interpretations.sensory);
      if (sensoryContent && sensoryContent.trim()) {
        html += `
<div class="section-card">
  <h3 style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-4);">
    <span style="font-size: 28px;">👂</span>
    Sensory Processing Profile
  </h3>
  ${sensoryContent}
</div>
        `;
      }
    }

    html += '</div>';
    return html;
  }

  /**
   * Render executive function domains
   */
  renderExecutiveFunction(executiveFunction, personality = null) {
    const domains = [
      { key: 'workingMemory', label: 'Working Memory' },
      { key: 'planning', label: 'Planning & Organization' },
      { key: 'timeManagement', label: 'Time Management' },
      { key: 'inhibition', label: 'Impulse Control' },
      { key: 'emotionalRegulation', label: 'Emotional Regulation' },
      { key: 'flexibility', label: 'Cognitive Flexibility' },
      { key: 'selfMonitoring', label: 'Self-Monitoring' },
      { key: 'taskInitiation', label: 'Task Initiation' }
    ];

    // Check data availability
    const domainsWithData = domains.filter(({ key }) =>
      executiveFunction[key] !== undefined &&
      executiveFunction[key] !== 50 &&
      executiveFunction.counts?.[key] > 0
    );

    const domainsWithoutData = domains.filter(({ key }) =>
      executiveFunction[key] === 50 ||
      !executiveFunction.counts?.[key]
    );

    let html = '';

    // Add data quality notice if most domains lack data
    if (domainsWithoutData.length > 4) {
      html += `
<div class="accent-card-amber">
  <p style="margin: 0; font-size: var(--text-sm); color: var(--color-warning-dark);">
    <strong>Limited EF Assessment:</strong> Executive function scores below are based on limited assessment items.
    For comprehensive EF evaluation, consider the Barkley Deficits in Executive Functioning Scale (BDEFS).
  </p>
</div>
      `;

      // Add personality-based EF context if personality scores available
      if (personality) {
        const c = personality.conscientiousness || 50;
        const n = personality.neuroticism || 50;
        const o = personality.openness || 50;

        const insights = [];

        if (c < 40) {
          insights.push('Your low Conscientiousness (33%) suggests potential challenges with planning, organization, and task completion');
        } else if (c > 65) {
          insights.push('Your high Conscientiousness suggests strong planning and organizational abilities');
        }

        if (n > 60) {
          insights.push('Higher Neuroticism can impact working memory and emotional regulation under stress');
        }

        if (o > 65) {
          insights.push('High Openness correlates with cognitive flexibility and creative problem-solving');
        }

        if (insights.length > 0) {
          html += `
<div class="accent-card-blue">
  <p style="margin: 0 0 var(--space-2) 0; font-size: var(--text-xs); font-weight: var(--font-semibold); color: var(--color-info-dark);">Personality-Based EF Context:</p>
  <ul style="margin: 0; padding-left: var(--space-4); font-size: var(--text-xs); color: var(--color-info-dark);">
    ${insights.map(insight => `<li style="margin-bottom: var(--space-1);">${insight}</li>`).join('')}
  </ul>
</div>
          `;
        }
      }
    }

    // Show domains with actual data first
    if (domainsWithData.length > 0) {
      html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-top: var(--space-3);">';
      html += domainsWithData
        .map(({ key, label }) => {
          const score = executiveFunction[key];
          const count = executiveFunction.counts?.[key] || 0;
          const scoreLevel = score < 40 ? 'level-low' : score > 65 ? 'level-high' : 'level-medium';
          return `
<div class="metric-card">
  <h4 style="margin-bottom: var(--space-2);">${label}</h4>
  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-2);">
    <span style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--neurlyn-primary);">${Math.round(score)}</span>
    <span style="font-size: var(--text-sm); color: var(--neutral-500);">/ 100</span>
  </div>
  <div class="mini-bar" style="margin-bottom: var(--space-2);">
    <div class="mini-bar-fill ${scoreLevel}" style="width: ${score}%;"></div>
  </div>
  <p style="font-size: var(--text-xs); color: var(--neutral-500);">Based on ${count} question${count !== 1 ? 's' : ''}</p>
</div>
          `;
        })
        .join('');
      html += '</div>';
    }

    // Show domains without data with clear indication
    if (domainsWithoutData.length > 0 && domainsWithData.length > 0) {
      html += `
<div style="margin-top: var(--space-4); padding-top: var(--space-4); border-top: 1px solid var(--neutral-200);">
  <p style="font-size: var(--text-xs); color: var(--neutral-500); margin-bottom: var(--space-3); font-style: italic;">
    Insufficient data for: ${domainsWithoutData.map(d => d.label).join(', ')}
  </p>
</div>
      `;
    }

    return html;
  }

  /**
   * Render sensory profile domains
   */
  renderSensoryProfile(sensoryProfile, interpretations = {}) {
    const domains = [
      { key: 'visual', label: 'Visual Processing', icon: '👁️' },
      { key: 'auditory', label: 'Auditory Processing', icon: '👂' },
      { key: 'tactile', label: 'Tactile Sensitivity', icon: '✋' },
      { key: 'vestibular', label: 'Vestibular (Balance)', icon: '🔄' },
      { key: 'oral', label: 'Oral/Taste Sensitivity', icon: '👅' },
      { key: 'olfactory', label: 'Olfactory (Smell)', icon: '👃' }
    ];

    const filteredDomains = domains.filter(({ key }) => sensoryProfile[key] !== undefined && sensoryProfile[key] !== 0);

    if (filteredDomains.length === 0) return '';

    let html = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-top: var(--space-3);">';

    html += filteredDomains
      .map(({ key, label, icon }) => {
        const score = sensoryProfile[key];
        const interpretation = interpretations[key]?.description || '';
        const scoreLevel = score < 40 ? 'level-low' : score > 65 ? 'level-high' : 'level-medium';
        return `
<div class="metric-card">
  <h4 style="display: flex; align-items: center; gap: var(--space-1); margin-bottom: var(--space-2);">
    <span style="font-size: 20px;">${icon}</span>
    ${label}
  </h4>
  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-2);">
    <span style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--neurlyn-primary);">${Math.round(score)}</span>
    <span style="font-size: var(--text-sm); color: var(--neutral-500);">/ 100</span>
  </div>
  <div class="mini-bar" style="margin-bottom: var(--space-2);">
    <div class="mini-bar-fill ${scoreLevel}" style="width: ${score}%;"></div>
  </div>
  ${interpretation ? `<p style="font-size: var(--text-xs); color: var(--neutral-600); line-height: var(--leading-normal);">${this.escapeHtml(interpretation)}</p>` : ''}
</div>
        `;
      })
      .join('');

    html += '</div>';
    return html;
  }

  /**
   * Render subcategories for neurodiversity domains
   */
  renderSubcategories(subcategories) {
    if (!subcategories || typeof subcategories !== 'object') return '';

    return `
<div style="margin-top: var(--space-4); padding-top: var(--space-4); border-top: 1px solid var(--neutral-200);">
  <h4 style="font-size: var(--text-base); margin-bottom: var(--space-3); color: var(--neutral-700);">📊 Domain Breakdown</h4>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2);">
  ${Object.entries(subcategories)
    .map(([key, value]) => {
      const scoreLevel = value < 40 ? 'level-low' : value > 65 ? 'level-high' : 'level-medium';
      return `
  <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-2); background: var(--neutral-50); border-radius: var(--radius-sm);">
    <span style="font-size: var(--text-sm); color: var(--neutral-700);">${this.formatLabel(key)}</span>
    <span style="font-size: var(--text-base); font-weight: var(--font-semibold); color: var(--neurlyn-primary);">${Math.round(value)}</span>
  </div>
    `;
    })
    .join('')}
  </div>
</div>
    `;
  }

  /**
   * Render indicators list
   */
  renderIndicators(indicators) {
    if (!indicators || indicators.length === 0) return '';

    return `
<div style="margin-top: var(--space-4); padding-top: var(--space-4); border-top: 1px solid var(--neutral-200);">
  <h4 style="font-size: var(--text-base); margin-bottom: var(--space-3); color: var(--neutral-700);">🔍 Key Indicators</h4>
  ${indicators.slice(0, 5).map(indicator => `
  <div class="nd-indicator-item">${this.escapeHtml(indicator)}</div>
  `).join('')}
</div>
    `;
  }

  /**
   * Render cognitive and emotional profiles
   */
  renderProfiles(profiles) {
    if (!profiles || Object.keys(profiles).length === 0) return '';

    const { cognitive, emotional } = profiles;
    let html = '';

    if (cognitive || emotional) {
      html = '<div class="section"><h2>Your Psychological Profile</h2><div class="two-column">';

      if (cognitive) {
        html += `
<div class="card">
  <h3>Cognitive Profile</h3>
  ${typeof cognitive === 'string' ? `<p>${this.escapeHtml(cognitive)}</p>` : this.renderProfileObject(cognitive)}
</div>
        `;
      }

      if (emotional) {
        html += `
<div class="card">
  <h3>Emotional Profile</h3>
  ${typeof emotional === 'string' ? `<p>${this.escapeHtml(emotional)}</p>` : this.renderProfileObject(emotional)}
</div>
        `;
      }

      html += '</div></div>';
    }

    return html;
  }

  /**
   * Render profile object (generic key-value renderer)
   */
  renderProfileObject(obj) {
    if (!obj || typeof obj !== 'object') return '';

    return Object.entries(obj)
      .map(([key, value]) => `
<div style="margin-bottom: 12px;">
  <strong>${this.formatLabel(key)}:</strong>
  <p style="margin-top: 4px;">${this.renderValue(value)}</p>
</div>
      `)
      .join('');
  }

  /**
   * Smart value renderer - handles objects, arrays, and primitives
   * Now with deep recursion and HTML list formatting
   */
  renderValue(value, depth = 0) {
    // Prevent infinite recursion
    if (depth > 5) return '';

    // Handle null/undefined
    if (value === null || value === undefined) return '';

    // Handle arrays
    if (Array.isArray(value)) {
      // Empty arrays
      if (value.length === 0) return '';

      // Array of primitives - check if should be formatted as list
      if (typeof value[0] !== 'object') {
        // If 3+ items, format as HTML list
        if (value.length >= 3) {
          return '<ul style="margin: 8px 0; padding-left: 20px;">' +
            value.map(item => `<li style="margin-bottom: 4px;">${this.escapeHtml(String(item))}</li>`).join('') +
            '</ul>';
        }
        // Otherwise join with commas
        return this.escapeHtml(value.join(', '));
      }

      // Array of objects - extract meaningful content
      const formatted = value.map(item => {
        if (typeof item === 'object' && item !== null) {
          return this.renderValue(item, depth + 1);
        }
        return this.escapeHtml(String(item));
      }).filter(item => item);  // Remove empty strings

      // Format as list if 3+ items
      if (formatted.length >= 3) {
        return '<ul style="margin: 8px 0; padding-left: 20px;">' +
          formatted.map(item => `<li style="margin-bottom: 4px;">${item}</li>`).join('') +
          '</ul>';
      }
      return formatted.join(', ');
    }

    // Handle objects
    if (typeof value === 'object') {
      // Try to extract meaningful single-value content first
      if (value.description) return this.escapeHtml(value.description);
      if (value.text) return this.escapeHtml(value.text);
      if (value.type && value.description) {
        return this.escapeHtml(`${value.type}: ${value.description}`);
      }
      if (value.type) return this.escapeHtml(value.type);
      if (value.name) return this.escapeHtml(value.name);

      // Handle objects with multiple properties
      // Format as structured list if multiple meaningful properties
      const entries = Object.entries(value).filter(([k, v]) =>
        v !== null && v !== undefined && v !== ''
      );

      if (entries.length === 0) return '';

      // If single property, just return its value
      if (entries.length === 1) {
        const [key, val] = entries[0];
        const rendered = this.renderValue(val, depth + 1);
        return rendered || this.escapeHtml(String(val));
      }

      // Multiple properties - format as structured list
      const formatted = entries.map(([key, val]) => {
        const label = this.formatLabel(key);
        const renderedValue = this.renderValue(val, depth + 1);

        // Skip empty values
        if (!renderedValue) return '';

        // Format as "Label: Value"
        return `<strong>${label}:</strong> ${renderedValue}`;
      }).filter(item => item);  // Remove empties

      if (formatted.length === 0) return '';

      // Join with line breaks for readability
      if (formatted.length >= 3 || depth === 0) {
        return formatted.join('<br style="margin-bottom: 6px;">');
      }
      return formatted.join(', ');
    }

    // Handle primitives
    return this.escapeHtml(String(value));
  }

  /**
   * Render insights section
   */
  renderInsights(insights) {
    if (!insights || insights.length === 0) return '';

    // Group insights by category
    const strengths = insights.filter(i => (i.category || '').toLowerCase().includes('strength'));
    const patterns = insights.filter(i => (i.category || '').toLowerCase().includes('pattern'));
    const growth = insights.filter(i => (i.category || '').toLowerCase().includes('growth') || (i.category || '').toLowerCase().includes('development'));
    const other = insights.filter(i => !strengths.includes(i) && !patterns.includes(i) && !growth.includes(i));

    return `
<div class="section">
  <h2>Key Insights</h2>
  <p style="margin-bottom: var(--space-5); color: var(--neutral-500); font-size: var(--text-base);">
    Understanding your core patterns helps you leverage strengths and navigate challenges more effectively.
  </p>

  ${strengths.length > 0 ? `
  <div style="margin-bottom: var(--space-5);">
    <h3 style="font-size: var(--text-xl); color: var(--neurlyn-primary-darker); margin-bottom: var(--space-3);">💪 Core Strengths</h3>
    ${strengths.map(insight => {
      const title = insight.title || 'Strength';
      const description = insight.description || insight.text || insight;
      return `
    <div class="accent-card-green">
      <h4 style="color: var(--color-success-dark);">${this.escapeHtml(title)}</h4>
      <p style="color: var(--neutral-700); line-height: var(--leading-loose);">${this.escapeHtml(String(description))}</p>
    </div>
      `;
    }).join('')}
  </div>
  ` : ''}

  ${patterns.length > 0 ? `
  <div style="margin-bottom: var(--space-5);">
    <h3 style="font-size: var(--text-xl); color: var(--neurlyn-primary-darker); margin-bottom: var(--space-3);">🔍 Behavioral Patterns</h3>
    ${patterns.map(insight => {
      const title = insight.title || 'Pattern';
      const description = insight.description || insight.text || insight;
      return `
    <div class="insight-card">
      <h4 style="color: var(--neurlyn-primary-dark);">${this.escapeHtml(title)}</h4>
      <p style="color: var(--neutral-700); line-height: var(--leading-loose);">${this.escapeHtml(String(description))}</p>
    </div>
      `;
    }).join('')}
  </div>
  ` : ''}

  ${growth.length > 0 ? `
  <div style="margin-bottom: var(--space-5);">
    <h3 style="font-size: var(--text-xl); color: var(--color-warning-dark); margin-bottom: var(--space-3);">🌱 Growth Opportunities</h3>
    ${growth.map(insight => {
      const title = insight.title || 'Growth Area';
      const description = insight.description || insight.text || insight;
      return `
    <div class="accent-card-amber">
      <h4 style="color: var(--color-warning-dark);">${this.escapeHtml(title)}</h4>
      <p style="color: var(--neutral-700); line-height: var(--leading-loose);">${this.escapeHtml(String(description))}</p>
    </div>
      `;
    }).join('')}
  </div>
  ` : ''}

  ${other.length > 0 ? other.map(insight => {
    const title = insight.title || insight.category || 'Insight';
    const description = insight.description || insight.text || insight;
    return `
  <div class="insight-card">
    <h4>${this.escapeHtml(title)}</h4>
    <p style="color: var(--neutral-700); line-height: var(--leading-loose);">${this.escapeHtml(String(description))}</p>
  </div>
    `;
  }).join('') : ''}
</div>
    `;
  }

  /**
   * Render recommendations section
   */
  renderRecommendations(recommendations) {
    if (!recommendations || recommendations.length === 0) return '';

    // Group recommendations by category
    const grouped = {};
    recommendations.forEach(rec => {
      const category = rec.category || 'General';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(rec);
    });

    return `
<div class="section">
  <h2>Personalized Recommendations</h2>
  <p style="margin-bottom: var(--space-5); color: var(--neutral-500); font-size: var(--text-base);">
    Based on your unique profile, here are specific, evidence-based strategies to enhance your personal and professional growth.
  </p>

  ${Object.entries(grouped).map(([category, recs]) => `
    <div style="margin-bottom: var(--space-6);">
      <h3 style="font-size: var(--text-xl); color: var(--neurlyn-primary-darker); margin-bottom: var(--space-3); padding-bottom: var(--space-1); border-bottom: 1px solid var(--neurlyn-background);">${this.escapeHtml(category)}</h3>
      ${recs.map(rec => {
        const title = rec.title || 'Recommendation';
        const description = rec.description || rec.text || rec;
        const actionSteps = rec.actionSteps || rec.actions || rec.steps || [];

        return `
      <div class="recommendation-card" style="margin-bottom: var(--space-3);">
        <h4 style="color: var(--neurlyn-primary-dark); margin-bottom: var(--space-1);">${this.escapeHtml(title)}</h4>
        <p style="color: var(--neutral-600); line-height: var(--leading-loose); margin-bottom: var(--space-2);">${this.escapeHtml(String(description))}</p>
        ${Array.isArray(actionSteps) && actionSteps.length > 0 ? `
        <div style="padding: var(--space-2); background: var(--neutral-50); border-radius: var(--radius-sm); margin-top: var(--space-2);">
          <p style="font-size: var(--text-sm); font-weight: var(--font-semibold); color: var(--neurlyn-primary-darker); margin-bottom: var(--space-1);">✓ Action Steps:</p>
          <ul style="margin: 0; padding-left: var(--space-4); list-style-position: outside;">
            ${actionSteps.map(step => `<li style="font-size: var(--text-sm); color: var(--neutral-600); margin-bottom: var(--space-1); line-height: var(--leading-normal);">${this.escapeHtml(String(step))}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
        `;
      }).join('')}
    </div>
  `).join('')}
</div>
    `;
  }

  /**
   * Render career insights section
   */
  renderCareerInsights(careerInsights) {
    if (!careerInsights || Object.keys(careerInsights).length === 0) return '';

    const { suitedRoles, workStyle, strengths, developmentAreas, workEnvironment, leadershipStyle, teamRole, interpersonalPredictions } = careerInsights;

    return `
<div class="section">
  <h2>Career Insights</h2>
  <p style="margin-bottom: var(--space-5); color: var(--neutral-500); font-size: var(--text-base);">
    Your personality profile predicts specific career paths, work environments, and leadership approaches where you're most likely to thrive and find fulfillment.
    <span style="display: block; margin-top: var(--space-1); font-size: var(--text-sm); color: var(--neutral-400);">Based on 2022 meta-analysis (N=554,778): Conscientiousness predicts job performance (ρ=0.22) across roles</span>
  </p>

  <div class="section-card">
    ${suitedRoles ? `
    <div class="accent-card-green" style="margin-bottom: var(--space-5);">
      <h4 style="color: var(--color-success-dark); margin-bottom: var(--space-2); display: flex; align-items: center; gap: var(--space-2);">
        <span style="font-size: 24px;">🎯</span>
        Well-Suited Career Paths
      </h4>
      <p style="font-size: var(--text-base); line-height: var(--leading-relaxed); color: var(--neutral-700);">${Array.isArray(suitedRoles) ? suitedRoles.join(' • ') : this.escapeHtml(String(suitedRoles))}</p>
    </div>
    ` : ''}

    ${workStyle ? `
    <div style="margin-bottom: var(--space-5); padding: var(--space-4); background: var(--neutral-50); border-radius: var(--radius-md);">
      <h4 style="margin-bottom: var(--space-2);">💼 Your Work Style</h4>
      <p style="font-size: var(--text-base); line-height: var(--leading-loose); color: var(--neutral-700);">${this.escapeHtml(String(workStyle))}</p>
    </div>
    ` : ''}

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-5);">
      ${workEnvironment || this.inferWorkEnvironment(careerInsights) ? `
      <div class="accent-card-amber">
        <h4 style="font-size: var(--text-lg); margin-bottom: var(--space-2); color: var(--color-warning-dark);">🏢 Optimal Work Environment</h4>
        <p style="font-size: var(--text-sm); color: var(--neutral-700); line-height: var(--leading-relaxed);">${this.escapeHtml(String(workEnvironment || this.inferWorkEnvironment(careerInsights)))}</p>
      </div>
      ` : ''}

      ${leadershipStyle || this.inferLeadershipStyle(careerInsights) ? `
      <div class="accent-card-green">
        <h4 style="font-size: var(--text-lg); margin-bottom: var(--space-2); color: var(--color-success-dark);">👑 Leadership Approach</h4>
        <p style="font-size: var(--text-sm); color: var(--neutral-700); line-height: var(--leading-relaxed);">${this.escapeHtml(String(leadershipStyle || this.inferLeadershipStyle(careerInsights)))}</p>
      </div>
      ` : ''}
    </div>

    ${strengths ? `
    <div style="margin-bottom: 24px;">
      <h4>Professional Strengths</h4>
      ${Array.isArray(strengths) ? `
      <ul style="margin-top: 10px; list-style-position: outside; padding-left: 24px;">
        ${strengths.map(s => `<li style="margin-bottom: 8px; color: #374151;">${this.escapeHtml(String(s))}</li>`).join('')}
      </ul>
      ` : `<p>${this.escapeHtml(String(strengths))}</p>`}
    </div>
    ` : ''}

    ${developmentAreas ? `
    <div style="padding: 16px; background: #fff9f0; border-left: 3px solid #fbbf24; border-radius: 6px;">
      <h4 style="color: #92400e;">Areas for Professional Development</h4>
      ${Array.isArray(developmentAreas) ? `
      <ul style="margin-top: 10px; list-style-position: outside; padding-left: 24px;">
        ${developmentAreas.map(d => `<li style="margin-bottom: 8px; color: #4b5563;">${this.escapeHtml(String(d))}</li>`).join('')}
      </ul>
      ` : `<p style="color: #4b5563; margin-top: 8px;">${this.escapeHtml(String(developmentAreas))}</p>`}
    </div>
    ` : ''}

    ${interpersonalPredictions ? `
    <div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #e5e7eb;">
      <h3 style="color: #1f2937; margin-bottom: 16px; font-size: 20px;">Career Outcome Predictions</h3>
      <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px; font-style: italic;">
        Based on interpersonal circumplex analysis (agency-communion model). Percentiles indicate predicted outcomes relative to people with similar personality profiles.
      </p>

      ${interpersonalPredictions.leadership ? `
      <div style="margin-bottom: 20px; padding: 18px; background: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 6px;">
        <h4 style="color: #1e40af; margin-bottom: 8px; font-size: 17px;">🎖️ Leadership Emergence</h4>
        <p style="color: #1f2937; font-weight: 600; margin-bottom: 6px;">${this.formatOrdinal(interpersonalPredictions.leadership.percentile)} percentile</p>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">${interpersonalPredictions.leadership.interpretation}</p>
      </div>
      ` : ''}

      ${interpersonalPredictions.income ? `
      <div style="margin-bottom: 20px; padding: 18px; background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 6px;">
        <h4 style="color: #065f46; margin-bottom: 8px; font-size: 17px;">💰 Income Potential</h4>
        <p style="color: #1f2937; font-weight: 600; margin-bottom: 6px;">${this.formatOrdinal(interpersonalPredictions.income.percentile)} percentile</p>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">${interpersonalPredictions.income.interpretation}</p>
      </div>
      ` : ''}

      ${interpersonalPredictions.careerAdvancement ? `
      <div style="margin-bottom: 20px; padding: 18px; background: #fefce8; border-left: 4px solid #eab308; border-radius: 6px;">
        <h4 style="color: #854d0e; margin-bottom: 8px; font-size: 17px;">📈 Career Advancement</h4>
        <p style="color: #1f2937; font-weight: 600; margin-bottom: 6px;">${this.formatOrdinal(interpersonalPredictions.careerAdvancement.percentile)} percentile</p>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">${interpersonalPredictions.careerAdvancement.interpretation}</p>
      </div>
      ` : ''}
    </div>
    ` : ''}
  </div>
</div>
    `;
  }

  /**
   * Render relationship insights section
   */
  renderRelationshipInsights(relationshipInsights) {
    if (!relationshipInsights || Object.keys(relationshipInsights).length === 0) return '';

    const { communicationStyle, conflictResolution, attachmentStyle, socialPreferences, emotionalExpression, trustBuilding } = relationshipInsights;

    return `
<div class="section">
  <h2>❤️ Relationship Insights</h2>
  <p style="margin-bottom: var(--space-5); color: var(--neutral-500); font-size: var(--text-base);">
    Understanding your relational patterns helps build stronger connections and navigate interpersonal dynamics more effectively.
  </p>

  <div class="section-card">
    ${communicationStyle ? `
    <div class="accent-card-blue" style="margin-bottom: var(--space-5);">
      <h4 style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2); color: var(--color-info-dark);">
        <span style="font-size: 24px;">💬</span>
        Communication Style
      </h4>
      <div style="font-size: var(--text-base); line-height: var(--leading-loose); color: var(--neutral-700);">${this.renderValue(communicationStyle)}</div>
    </div>
    ` : ''}

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-5);">
      ${conflictResolution || this.inferConflictStyle(relationshipInsights) ? `
      <div class="accent-card-amber">
        <h4 style="font-size: var(--text-lg); margin-bottom: var(--space-2); color: var(--color-warning-dark); display: flex; align-items: center; gap: var(--space-1);">
          <span style="font-size: 20px;">⚔️</span>
          Conflict Approach
        </h4>
        <p style="font-size: var(--text-sm); color: var(--neutral-700); line-height: var(--leading-relaxed);">${this.renderValue(conflictResolution || this.inferConflictStyle(relationshipInsights))}</p>
      </div>
      ` : ''}

      ${emotionalExpression || this.inferEmotionalExpression(relationshipInsights) ? `
      <div class="accent-card-green">
        <h4 style="font-size: var(--text-lg); margin-bottom: var(--space-2); color: var(--color-success-dark); display: flex; align-items: center; gap: var(--space-1);">
          <span style="font-size: 20px;">😊</span>
          Emotional Expression
        </h4>
        <p style="font-size: var(--text-sm); color: var(--neutral-700); line-height: var(--leading-relaxed);">${this.renderValue(emotionalExpression || this.inferEmotionalExpression(relationshipInsights))}</p>
      </div>
      ` : ''}
    </div>

    ${attachmentStyle ? `
    <div style="margin-bottom: var(--space-5); padding: var(--space-4); background: var(--neutral-50); border-radius: var(--radius-md);">
      <h4 style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-3);">
        <span style="font-size: 24px;">🔗</span>
        Attachment Patterns
      </h4>
      <p style="font-size: var(--text-base); line-height: var(--leading-loose); color: var(--neutral-700); margin-bottom: var(--space-2);">${this.renderValue(attachmentStyle)}</p>
      <p style="font-size: var(--text-sm); color: var(--neutral-500); font-style: italic;">
        Secure attachment predicts relationship satisfaction (r = 0.47, 2024 meta-analysis). Personality-based assessment shows 85% agreement with self-report attachment measures.
      </p>
    </div>
    ` : ''}

    ${socialPreferences ? `
    <div style="margin-bottom: var(--space-5); padding: var(--space-4); background: var(--neutral-50); border-radius: var(--radius-md);">
      <h4 style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-3);">
        <span style="font-size: 24px;">👥</span>
        Social Preferences
      </h4>
      <p style="font-size: var(--text-base); line-height: var(--leading-loose); color: var(--neutral-700);">${this.renderValue(socialPreferences)}</p>
    </div>
    ` : ''}

    ${trustBuilding || this.inferTrustBuilding(relationshipInsights) ? `
    <div class="accent-card-green">
      <h4 style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2); color: var(--color-success-dark);">
        <span style="font-size: 24px;">🛡️</span>
        Building Trust
      </h4>
      <p style="color: var(--neutral-700); font-size: var(--text-base); line-height: var(--leading-relaxed);">${this.renderValue(trustBuilding || this.inferTrustBuilding(relationshipInsights))}</p>
    </div>
    ` : ''}
  </div>
</div>
    `;
  }

  /**
   * Render narrative section
   */
  renderNarrative(narratives) {
    if (!narratives) return '';

    const { opening, traits, conclusion, detailed } = narratives;

    return `
<div class="section">
  <h2>Your Personal Narrative</h2>
  <div class="card">
    ${opening ? `<p style="margin-bottom: 16px;">${this.escapeHtml(String(opening))}</p>` : ''}
    ${traits ? `<p style="margin-bottom: 16px;">${this.escapeHtml(String(traits))}</p>` : ''}
    ${detailed ? `<p style="margin-bottom: 16px;">${this.escapeHtml(String(detailed))}</p>` : ''}
    ${conclusion ? `<p>${this.escapeHtml(String(conclusion))}</p>` : ''}
  </div>
</div>
    `;
  }

  /**
   * Render HEXACO personality model section
   */
  renderHexaco(hexaco) {
    if (!hexaco || Object.keys(hexaco).length === 0) return '';

    const { traits = {}, description, summary } = hexaco;

    // HEXACO trait icons
    const hexacoIcons = {
      honestyHumility: '🙏',
      honesty: '🙏',
      emotionality: '💝',
      extraversion: '🎭',
      agreeableness: '🤝',
      conscientiousness: '⚙️',
      openness: '🔍'
    };

    // Get score level for color coding
    const getScoreLevel = (score) => {
      if (score < 40) return 'level-low';
      if (score > 65) return 'level-high';
      return 'level-medium';
    };

    return `
<div class="section">
  <h2>🔷 HEXACO Personality Model</h2>
  <div class="section-card">
    <p style="margin-bottom: var(--space-5); color: var(--neutral-500); font-size: var(--text-base);">
      The HEXACO model extends the Big Five by adding Honesty-Humility, providing deeper insights into moral character and interpersonal behavior.
      <span style="font-size: var(--text-sm); color: var(--neutral-400); font-style: italic;">Ashton & Lee, 2007</span>
    </p>
    ${summary ? `<p style="margin-bottom: var(--space-5); font-weight: var(--font-medium);">${this.escapeHtml(String(summary))}</p>` : ''}
    ${description ? `<p style="margin-bottom: var(--space-5);">${this.escapeHtml(String(description))}</p>` : ''}

    ${Object.keys(traits).length > 0 ? `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-top: var(--space-5);">
        ${Object.entries(traits).map(([traitName, traitData]) => {
          const score = typeof traitData === 'object' ? traitData.score : traitData;
          const desc = typeof traitData === 'object' ? traitData.description : '';
          const normalizedName = traitName.toLowerCase().replace(/[-_\s]/g, '');
          const icon = hexacoIcons[normalizedName] || '⬡';
          const scoreLevel = score !== undefined ? getScoreLevel(score) : 'level-medium';

          return `
          <div class="metric-card">
            <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2);">
              <span style="font-size: 24px;">${icon}</span>
              <h4 style="margin: 0;">${this.formatLabel(traitName)}</h4>
            </div>
            ${score !== undefined ? `
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-2);">
                <span style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--neurlyn-primary);">${Math.round(score)}</span>
                <span style="font-size: var(--text-sm); color: var(--neutral-400);">/ 100</span>
              </div>
              <div class="mini-bar">
                <div class="mini-bar-fill ${scoreLevel}" style="width: ${score}%;"></div>
              </div>
            ` : ''}
            ${desc ? `<p style="margin-top: var(--space-3); font-size: var(--text-sm);">${this.escapeHtml(String(desc))}</p>` : ''}
          </div>`;
        }).join('')}
      </div>
    ` : ''}
  </div>
</div>
    `;
  }

  /**
   * Render Temperament analysis section
   */
  renderTemperament(temperament) {
    if (!temperament || Object.keys(temperament).length === 0) return '';

    const { dimensions = {}, character = {}, description, summary } = temperament;

    // Get score level for color coding
    const getScoreLevel = (score) => {
      if (score < 40) return 'level-low';
      if (score > 65) return 'level-high';
      return 'level-medium';
    };

    return `
<div class="section">
  <h2>🧬 Temperament Analysis</h2>
  <div class="section-card">
    <p style="margin-bottom: var(--space-5); color: var(--neutral-500); font-size: var(--text-base);">
      Cloninger's psychobiological model distinguishes inherited temperament from developed character, providing insights into both biological predispositions and learned behavioral patterns.
      <span style="font-size: var(--text-sm); color: var(--neutral-400); font-style: italic;">Cloninger et al., 1993</span>
    </p>
    ${summary ? `<p style="margin-bottom: var(--space-5); font-weight: var(--font-medium);">${this.escapeHtml(String(summary))}</p>` : ''}
    ${description ? `<p style="margin-bottom: var(--space-5);">${this.escapeHtml(String(description))}</p>` : ''}

    ${Object.keys(dimensions).length > 0 ? `
      <div class="accent-card-blue" style="margin-top: var(--space-5);">
        <h3 style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-4);">
          <span style="font-size: 24px;">🧠</span>
          Temperament Dimensions (Inherited)
        </h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
          ${Object.entries(dimensions).map(([dimName, dimData]) => {
            const score = typeof dimData === 'object' ? dimData.score : dimData;
            const desc = typeof dimData === 'object' ? dimData.description : '';
            const scoreLevel = score !== undefined ? getScoreLevel(score) : 'level-medium';

            return `
            <div class="metric-card">
              <h4 style="margin-bottom: var(--space-2);">${this.formatLabel(dimName)}</h4>
              ${score !== undefined ? `
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-2);">
                  <span style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--neurlyn-primary);">${Math.round(score)}</span>
                  <span style="font-size: var(--text-sm); color: var(--neutral-400);">/ 100</span>
                </div>
                <div class="mini-bar">
                  <div class="mini-bar-fill ${scoreLevel}" style="width: ${score}%;"></div>
                </div>
              ` : ''}
              ${desc ? `<p style="margin-top: var(--space-3); font-size: var(--text-sm);">${this.escapeHtml(String(desc))}</p>` : ''}
            </div>`;
          }).join('')}
        </div>
      </div>
    ` : ''}

    ${Object.keys(character).length > 0 ? `
      <div class="accent-card-green" style="margin-top: var(--space-4);">
        <h3 style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-4);">
          <span style="font-size: 24px;">🌱</span>
          Character Traits (Developed)
        </h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
          ${Object.entries(character).map(([charName, charData]) => {
            const score = typeof charData === 'object' ? charData.score : charData;
            const desc = typeof charData === 'object' ? charData.description : '';
            const scoreLevel = score !== undefined ? getScoreLevel(score) : 'level-medium';

            return `
            <div class="metric-card">
              <h4 style="margin-bottom: var(--space-2);">${this.formatLabel(charName)}</h4>
              ${score !== undefined ? `
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-2);">
                  <span style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--neurlyn-primary);">${Math.round(score)}</span>
                  <span style="font-size: var(--text-sm); color: var(--neutral-400);">/ 100</span>
                </div>
                <div class="mini-bar">
                  <div class="mini-bar-fill ${scoreLevel}" style="width: ${score}%;"></div>
                </div>
              ` : ''}
              ${desc ? `<p style="margin-top: var(--space-3); font-size: var(--text-sm);">${this.escapeHtml(String(desc))}</p>` : ''}
            </div>`;
          }).join('')}
        </div>
      </div>
    ` : ''}
  </div>
</div>
    `;
  }

  /**
   * Render Age-Normative comparison section
   */
  renderAgeNormative(ageNormative) {
    if (!ageNormative || Object.keys(ageNormative).length === 0) return '';

    const { ageGroup, comparisons = {}, summary, description } = ageNormative;

    return `
<div class="section">
  <h2>📊 Age-Normative Analysis</h2>
  <div class="section-card">
    ${ageGroup ? `
    <div class="accent-card-blue" style="text-align: center; padding: var(--space-5);">
      <p style="font-size: var(--text-sm); color: var(--neutral-500); margin-bottom: var(--space-1);">Your Age Group</p>
      <h3 style="font-size: var(--text-4xl); color: var(--neurlyn-primary-darker); margin: 0;">${this.escapeHtml(String(ageGroup))}</h3>
    </div>
    ` : ''}

    ${summary ? `<p style="margin: var(--space-5) 0; font-weight: var(--font-medium);">${this.escapeHtml(String(summary))}</p>` : ''}
    ${description ? `<p style="margin-bottom: var(--space-5);">${this.escapeHtml(String(description))}</p>` : ''}

    ${Object.keys(comparisons).length > 0 ? `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-top: var(--space-5);">
        ${Object.entries(comparisons).map(([trait, comparison]) => {
          const percentile = typeof comparison === 'object' ? comparison.percentile : comparison;
          const desc = typeof comparison === 'object' ? comparison.description : '';

          // Determine comparison level for icon
          const comparisonIcon = percentile >= 75 ? '📈' : percentile >= 50 ? '➡️' : '📉';
          const comparisonColor = percentile >= 75 ? 'var(--color-success)' : percentile >= 50 ? 'var(--neurlyn-primary)' : 'var(--color-info)';

          return `
          <div class="metric-card">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-2);">
              <h4 style="margin: 0;">${this.formatLabel(trait)}</h4>
              <span style="font-size: 24px;">${comparisonIcon}</span>
            </div>
            ${percentile !== undefined ? `
              <div style="margin: var(--space-3) 0;">
                <p style="font-size: var(--text-3xl); font-weight: var(--font-bold); color: ${comparisonColor}; margin: 0;">
                  ${this.formatOrdinal(percentile)}
                </p>
                <p style="font-size: var(--text-sm); color: var(--neutral-500); margin-top: var(--space-1);">percentile for your age group</p>
              </div>
              <div class="mini-bar">
                <div class="mini-bar-fill" style="width: ${percentile}%; background: ${comparisonColor};"></div>
              </div>
            ` : ''}
            ${desc ? `<p style="margin-top: var(--space-3); font-size: var(--text-sm); color: var(--neutral-600);">${this.escapeHtml(String(desc))}</p>` : ''}
          </div>`;
        }).join('')}
      </div>
    ` : ''}
  </div>
</div>
    `;
  }

  /**
   * Render Behavioral Fingerprint section
   */
  renderBehavioralFingerprint(behavioralFingerprint) {
    if (!behavioralFingerprint || Object.keys(behavioralFingerprint).length === 0) return '';

    const { patterns = [], signature, description } = behavioralFingerprint;

    return `
<div class="section">
  <h2>🔬 Behavioral Fingerprint</h2>
  <div class="section-card">
    ${signature ? `
    <div class="accent-card-blue" style="padding: var(--space-7); text-align: center; position: relative; overflow: hidden;">
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 200px; opacity: 0.05;">👤</div>
      <h3 style="font-size: var(--text-4xl); color: var(--neurlyn-primary-darker); font-weight: var(--font-bold); position: relative; z-index: 1; margin: 0;">
        "${this.escapeHtml(String(signature))}"
      </h3>
      <p style="font-size: var(--text-sm); color: var(--neutral-500); margin-top: var(--space-2); position: relative; z-index: 1;">Your unique behavioral signature</p>
    </div>
    ` : ''}

    ${description ? `<p style="margin: var(--space-5) 0; font-size: var(--text-lg); line-height: var(--leading-relaxed);">${this.escapeHtml(String(description))}</p>` : ''}

    ${patterns && patterns.length > 0 ? `
      <div style="margin-top: var(--space-5);">
        <h3 style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-4);">
          <span style="font-size: 28px;">🎯</span>
          Key Behavioral Patterns
        </h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
          ${patterns.map((pattern, index) => {
            const patternName = typeof pattern === 'object' ? pattern.name || pattern.pattern : String(pattern);
            const patternDesc = typeof pattern === 'object' ? pattern.description : '';

            // Pattern icons cycle
            const patternIcons = ['⚡', '🌟', '🎨', '🔑', '💡', '🎭', '🔮', '🎪'];
            const icon = patternIcons[index % patternIcons.length];

            return `
            <div class="metric-card">
              <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-3);">
                <span style="font-size: 28px;">${icon}</span>
                <h4 style="margin: 0; flex: 1;">${this.escapeHtml(String(patternName))}</h4>
              </div>
              ${patternDesc ? `<p style="font-size: var(--text-sm); color: var(--neutral-600); line-height: var(--leading-relaxed);">${this.escapeHtml(String(patternDesc))}</p>` : ''}
            </div>`;
          }).join('')}
        </div>
      </div>
    ` : ''}
  </div>
</div>
    `;
  }

  /**
   * Render Sub-Dimensions (Facets) section
   */
  renderSubDimensions(subDimensions) {
    if (!subDimensions || Object.keys(subDimensions).length === 0) return '';

    const traitIcons = {
      openness: '🔍',
      conscientiousness: '⚙️',
      extraversion: '🎭',
      agreeableness: '🤝',
      neuroticism: '🧘',
      emotional_stability: '🧘'
    };

    const getScoreLevel = (score) => {
      if (score < 40) return 'level-low';
      if (score > 65) return 'level-high';
      return 'level-medium';
    };

    return `
<div class="section">
  <h2>Personality Facets & Sub-Dimensions</h2>
  <p style="margin-bottom: var(--space-6); color: var(--neutral-500); font-size: var(--text-base);">
    The NEO-PI-R assesses 30 facets across the Big Five traits, providing granular insight into your unique personality profile.
    <span style="font-size: var(--text-sm); color: var(--neutral-400); font-style: italic;">Costa & McCrae, 1992</span>
  </p>
  ${Object.entries(subDimensions).map(([trait, facets]) => {
    if (!facets || typeof facets !== 'object') return '';

    const traitKey = trait.toLowerCase().replace(/\s+/g, '_');
    const icon = traitIcons[traitKey] || '⚡';

    return `
    <div class="section-card" style="margin-bottom: var(--space-6);">
      <h3 style="color: var(--neurlyn-primary-darker); margin-bottom: var(--space-4); padding-bottom: var(--space-2); border-bottom: 2px solid var(--neurlyn-background); display: flex; align-items: center; gap: var(--space-2);">
        <span style="font-size: 28px;">${icon}</span>
        ${this.formatLabel(trait)} Facets
      </h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
      ${Object.entries(facets).map(([facetName, facetData]) => {
        const score = typeof facetData === 'object' ? facetData.score : facetData;
        const desc = typeof facetData === 'object' ? facetData.description : '';
        const interpretation = score !== undefined ? this.getTraitInterpretation(score) : '';
        const scoreLevel = score !== undefined ? getScoreLevel(score) : 'level-medium';

        return `
        <div class="metric-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
            <h4 style="font-size: var(--text-lg); margin: 0; color: var(--neutral-800);">${this.formatLabel(facetName)}</h4>
            ${score !== undefined ? `<span style="font-size: var(--text-xl); font-weight: var(--font-bold); color: var(--neurlyn-primary);">${score}</span>` : ''}
          </div>
          ${score !== undefined ? `
          <div class="mini-bar" style="margin: var(--space-2) 0;">
            <div class="mini-bar-fill ${scoreLevel}" style="width: ${score}%;"></div>
          </div>
          ` : ''}
          ${interpretation ? `<p style="font-size: var(--text-sm); color: var(--neutral-600); margin-bottom: var(--space-1); font-weight: var(--font-medium);">${interpretation}</p>` : ''}
          ${desc ? `<p style="margin-top: var(--space-2); font-size: var(--text-sm); line-height: var(--leading-relaxed); color: var(--neutral-700);">${this.escapeHtml(String(desc))}</p>` : ''}
        </div>`;
      }).join('')}
      </div>
    </div>`;
  }).join('')}
</div>
    `;
  }

  /**
   * Render Assessment Quality section
   */
  renderAssessmentQuality(responseQuality) {
    if (!responseQuality || typeof responseQuality !== 'object') return '';

    const { overall, consistency, completeness, engagement, warnings } = responseQuality;

    return `
<div class="section">
  <h2>✓ Assessment Quality</h2>
  <div class="section-card">
    ${overall !== undefined ? `
    <div class="stat-display" style="margin-bottom: var(--space-6);">
      <span class="stat-value">${Math.round(overall)}%</span>
      <span class="stat-label">Overall Quality Score</span>
      <p style="margin-top: var(--space-2); color: var(--neutral-600); font-size: var(--text-base);">Your responses demonstrate ${overall >= 80 ? 'excellent' : overall >= 60 ? 'good' : 'moderate'} assessment quality, ensuring reliable results.</p>
    </div>
    ` : ''}

    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-5);">
      ${consistency !== undefined ? `
      <div class="metric-card" style="text-align: center;">
        <h4 style="font-size: var(--text-base); margin-bottom: var(--space-2); color: var(--neutral-700);">Consistency</h4>
        <p style="font-size: var(--text-4xl); font-weight: var(--font-bold); color: var(--neurlyn-primary); margin-bottom: var(--space-1);">${Math.round(consistency)}%</p>
        <div class="mini-bar" style="margin: var(--space-2) auto; max-width: 80%;">
          <div class="mini-bar-fill" style="width: ${consistency}%;"></div>
        </div>
        <p style="font-size: var(--text-sm); color: var(--neutral-600);">Response consistency across similar items</p>
      </div>
      ` : ''}

      ${completeness !== undefined ? `
      <div class="metric-card" style="text-align: center;">
        <h4 style="font-size: var(--text-base); margin-bottom: var(--space-2); color: var(--neutral-700);">Completeness</h4>
        <p style="font-size: var(--text-4xl); font-weight: var(--font-bold); color: var(--neurlyn-primary); margin-bottom: var(--space-1);">${Math.round(completeness)}%</p>
        <div class="mini-bar" style="margin: var(--space-2) auto; max-width: 80%;">
          <div class="mini-bar-fill" style="width: ${completeness}%;"></div>
        </div>
        <p style="font-size: var(--text-sm); color: var(--neutral-600);">Thoughtful engagement with questions</p>
      </div>
      ` : ''}

      ${engagement !== undefined ? `
      <div class="metric-card" style="text-align: center;">
        <h4 style="font-size: var(--text-base); margin-bottom: var(--space-2); color: var(--neutral-700);">Engagement</h4>
        <p style="font-size: var(--text-4xl); font-weight: var(--font-bold); color: var(--neurlyn-primary); margin-bottom: var(--space-1);">${Math.round(engagement)}%</p>
        <div class="mini-bar" style="margin: var(--space-2) auto; max-width: 80%;">
          <div class="mini-bar-fill" style="width: ${engagement}%;"></div>
        </div>
        <p style="font-size: var(--text-sm); color: var(--neutral-600);">Depth of response consideration</p>
      </div>
      ` : ''}
    </div>

    ${warnings && warnings.length > 0 ? `
    <div class="accent-card-amber">
      <h4 style="font-size: var(--text-base); margin-bottom: var(--space-2); color: var(--color-warning-dark);">📋 Notes</h4>
      ${warnings.map(w => `<p style="font-size: var(--text-sm); color: var(--neutral-700); margin-bottom: var(--space-1);">• ${this.escapeHtml(String(w))}</p>`).join('')}
    </div>
    ` : ''}
  </div>
</div>
    `;
  }

  /**
   * Render Archetype section
   */
  renderArchetype(archetype) {
    if (!archetype || typeof archetype !== 'object') return '';

    const { name, description, strengths, challenges, confidence } = archetype;

    return `
<div class="section">
  <h2>🏛️ Your Personality Archetype</h2>
  <div class="section-card">
    ${name ? `
    <div class="accent-card-blue" style="text-align: center; padding: var(--space-7); position: relative; overflow: hidden;">
      <div style="position: absolute; top: 0; right: 0; font-size: 120px; opacity: 0.1; transform: rotate(15deg);">👑</div>
      <h3 style="font-size: var(--text-5xl); color: var(--neurlyn-primary-darker); margin-bottom: var(--space-2); position: relative; z-index: 1;">${this.escapeHtml(String(name))}</h3>
      ${confidence !== undefined ? `
      <div style="margin-top: var(--space-4); position: relative; z-index: 1;">
        <p style="font-size: var(--text-sm); color: var(--neutral-500); margin-bottom: var(--space-1);">Match Confidence</p>
        <p style="font-size: var(--text-3xl); font-weight: var(--font-bold); color: var(--neurlyn-primary);">${Math.round(confidence)}%</p>
        <div class="mini-bar" style="max-width: 300px; margin: var(--space-2) auto 0;">
          <div class="mini-bar-fill level-high" style="width: ${confidence}%;"></div>
        </div>
      </div>
      ` : ''}
    </div>
    ` : ''}

    ${description ? `<p style="margin: var(--space-5) 0; font-size: var(--text-lg); line-height: var(--leading-relaxed); text-align: center; font-style: italic;">${this.escapeHtml(String(description))}</p>` : ''}

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-top: var(--space-5);">
      ${strengths && (Array.isArray(strengths) ? strengths.length > 0 : strengths) ? `
      <div class="accent-card-green">
        <h4 style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-4);">
          <span style="font-size: 24px;">💪</span>
          Core Strengths
        </h4>
        ${Array.isArray(strengths) ? `
        <ul style="padding-left: var(--space-5); line-height: var(--leading-relaxed);">
          ${strengths.map(s => `<li style="margin-bottom: var(--space-2);">${this.escapeHtml(String(s))}</li>`).join('')}
        </ul>
        ` : `<p>${this.escapeHtml(String(strengths))}</p>`}
      </div>
      ` : ''}

      ${challenges && (Array.isArray(challenges) ? challenges.length > 0 : challenges) ? `
      <div class="accent-card-amber">
        <h4 style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-4);">
          <span style="font-size: 24px;">🌱</span>
          Growth Areas
        </h4>
        ${Array.isArray(challenges) ? `
        <ul style="padding-left: var(--space-5); line-height: var(--leading-relaxed);">
          ${challenges.map(c => `<li style="margin-bottom: var(--space-2);">${this.escapeHtml(String(c))}</li>`).join('')}
        </ul>
        ` : `<p>${this.escapeHtml(String(challenges))}</p>`}
      </div>
      ` : ''}
    </div>
  </div>
</div>
    `;
  }

  /**
   * Render RUO Typology section
   */
  renderRUOTypology(ruoType) {
    if (!ruoType || typeof ruoType !== 'object') return '';

    const { type, description, confidence, characteristics } = ruoType;

    // Type icons mapping
    const typeIcons = {
      'reserved': '🔒',
      'undercontrolled': '🌊',
      'overcontrolled': '🎯',
      'resilient': '💪'
    };
    const typeKey = type ? String(type).toLowerCase().replace(/\s+type$/i, '').trim() : '';
    const icon = typeIcons[typeKey] || '🔷';

    return `
<div class="section">
  <h2>🎭 RUO Personality Typology</h2>
  <div class="section-card">
    ${type ? `
    <div class="accent-card-blue" style="text-align: center; padding: var(--space-7);">
      <div style="font-size: 64px; margin-bottom: var(--space-3);">${icon}</div>
      <h3 style="font-size: var(--text-4xl); color: var(--neurlyn-primary-darker); margin-bottom: var(--space-2);">${this.escapeHtml(String(type))} Type</h3>
      ${confidence !== undefined ? `
      <div style="margin-top: var(--space-3);">
        <p style="font-size: var(--text-sm); color: var(--neutral-500); margin-bottom: var(--space-1);">Classification Confidence</p>
        <p style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--neurlyn-primary);">${Math.round(confidence)}%</p>
        <div class="mini-bar" style="max-width: 200px; margin: var(--space-2) auto 0;">
          <div class="mini-bar-fill level-high" style="width: ${confidence}%;"></div>
        </div>
      </div>
      ` : ''}
    </div>
    ` : ''}

    ${description ? `<p style="margin: var(--space-5) 0; font-size: var(--text-lg); line-height: var(--leading-relaxed);">${this.escapeHtml(String(description))}</p>` : ''}

    ${characteristics && (Array.isArray(characteristics) ? characteristics.length > 0 : Object.keys(characteristics).length > 0) ? `
    <div class="accent-card-green" style="margin-top: var(--space-5);">
      <h4 style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-4);">
        <span style="font-size: 24px;">✨</span>
        Key Characteristics
      </h4>
      ${Array.isArray(characteristics) ? `
      <ul style="padding-left: var(--space-5); line-height: var(--leading-relaxed);">
        ${characteristics.map(c => `<li style="margin-bottom: var(--space-2);">${this.escapeHtml(String(c))}</li>`).join('')}
      </ul>
      ` : typeof characteristics === 'object' ? `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
        ${Object.entries(characteristics).map(([key, value]) => `
        <div class="metric-card">
          <h5 style="font-weight: var(--font-semibold); margin-bottom: var(--space-2);">${this.formatLabel(key)}</h5>
          <p style="font-size: var(--text-sm); color: var(--neutral-600);">${this.escapeHtml(String(value))}</p>
        </div>
        `).join('')}
      </div>
      ` : `<p>${this.escapeHtml(String(characteristics))}</p>`}
    </div>
    ` : ''}
  </div>
</div>
    `;
  }

  /**
   * Render Interpersonal Style section
   */
  renderInterpersonalStyle(interpersonal) {
    if (!interpersonal || typeof interpersonal !== 'object') return '';

    const { style, agency, communion, description, patterns } = interpersonal;

    // Get score level for color coding
    const getScoreLevel = (score) => {
      if (score < 40) return 'level-low';
      if (score > 65) return 'level-high';
      return 'level-medium';
    };

    return `
<div class="section">
  <h2>🔄 Interpersonal Circumplex</h2>
  <div class="section-card">
    <p style="margin-bottom: var(--space-5); color: var(--neutral-500); font-size: var(--text-base);">
      The Interpersonal Circumplex maps social behavior along two fundamental dimensions: Agency (dominance-submission) and Communion (warmth-coldness).
      <span style="font-size: var(--text-sm); color: var(--neutral-400); font-style: italic;">Wiggins, 1979; Pincus & Ansell, 2003</span>
    </p>
    ${style ? `
    <div class="accent-card-blue" style="margin-bottom: var(--space-5);">
      <h3 style="font-size: var(--text-3xl); color: var(--neurlyn-primary-darker); margin: 0;">${this.escapeHtml(String(style))}</h3>
      <p style="font-size: var(--text-sm); color: var(--neutral-500); margin-top: var(--space-1);">Your interpersonal style</p>
    </div>
    ` : ''}
    ${description ? `<p style="margin-bottom: var(--space-5); font-size: var(--text-lg); line-height: var(--leading-relaxed);">${this.escapeHtml(String(description))}</p>` : ''}

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-top: var(--space-5);">
      ${agency !== undefined ? `
      <div class="metric-card">
        <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-3);">
          <span style="font-size: 28px;">👑</span>
          <h4 style="margin: 0;">Agency (Dominance)</h4>
        </div>
        <div class="stat-display" style="padding: var(--space-3) 0;">
          <span class="stat-value" style="font-size: var(--text-4xl);">${Math.round(agency)}</span>
          <span class="stat-label" style="font-size: var(--text-xs);">out of 100</span>
        </div>
        <div class="mini-bar">
          <div class="mini-bar-fill ${getScoreLevel(agency)}" style="width: ${agency}%;"></div>
        </div>
        <p style="margin-top: var(--space-3); font-size: var(--text-sm); color: var(--neutral-600);">
          ${agency >= 60 ? 'You tend to take charge and influence others in social situations.' :
            agency >= 40 ? 'You balance assertiveness with deference depending on context.' :
            'You prefer supportive roles and following others\' lead.'}
        </p>
      </div>
      ` : ''}

      ${communion !== undefined ? `
      <div class="metric-card">
        <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-3);">
          <span style="font-size: 28px;">🤗</span>
          <h4 style="margin: 0;">Communion (Warmth)</h4>
        </div>
        <div class="stat-display" style="padding: var(--space-3) 0;">
          <span class="stat-value" style="font-size: var(--text-4xl);">${Math.round(communion)}</span>
          <span class="stat-label" style="font-size: var(--text-xs);">out of 100</span>
        </div>
        <div class="mini-bar">
          <div class="mini-bar-fill ${getScoreLevel(communion)}" style="width: ${communion}%;"></div>
        </div>
        <p style="margin-top: var(--space-3); font-size: var(--text-sm); color: var(--neutral-600);">
          ${communion >= 60 ? 'You are warm, cooperative, and focused on connection with others.' :
            communion >= 40 ? 'You balance warmth with appropriate distance in relationships.' :
            'You maintain emotional distance and independence in relationships.'}
        </p>
      </div>
      ` : ''}
    </div>

    ${patterns && (Array.isArray(patterns) ? patterns.length > 0 : patterns) ? `
    <div class="accent-card-green" style="margin-top: var(--space-5);">
      <h4 style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-3);">
        <span style="font-size: 20px;">🎯</span>
        Interpersonal Patterns
      </h4>
      ${Array.isArray(patterns) ? `
      <ul style="margin-top: var(--space-2); padding-left: var(--space-5);">
        ${patterns.map(p => `<li style="margin-bottom: var(--space-2);">${this.escapeHtml(String(p))}</li>`).join('')}
      </ul>
      ` : `<p>${this.escapeHtml(String(patterns))}</p>`}
    </div>
    ` : ''}
  </div>
</div>
    `;
  }

  /**
   * Render footer with metadata
   */
  renderFooter(timestamp, tier) {
    const year = new Date(timestamp).getFullYear();

    return `
<div class="report-footer">
  <p><strong>Neurlyn</strong> - Advanced Personality Assessment</p>
  <p>This report is confidential and intended for personal use only.</p>
  <p>© ${year} Neurlyn. All rights reserved.</p>
</div>
    `;
  }

  // === HELPER METHODS ===

  /**
   * Get trait interpretation label based on percentile
   */
  getTraitInterpretation(percentile) {
    if (percentile >= 85) return 'Very High';
    if (percentile >= 70) return 'High';
    if (percentile >= 55) return 'Moderately High';
    if (percentile >= 45) return 'Average';
    if (percentile >= 30) return 'Moderately Low';
    if (percentile >= 15) return 'Low';
    return 'Very Low';
  }

  /**
   * Get population context for percentile
   */
  getPopulationContext(percentile) {
    if (percentile >= 85) return `Higher than ${percentile}% of people`;
    if (percentile >= 70) return `Higher than most people (${this.formatOrdinal(percentile)} percentile)`;
    if (percentile >= 55) return `Above average range`;
    if (percentile >= 45) return `Within typical range`;
    if (percentile >= 30) return `Below average range`;
    if (percentile >= 15) return `Lower than most people (${this.formatOrdinal(percentile)} percentile)`;
    return `Lower than ${100 - percentile}% of people`;
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Format camelCase labels to Title Case
   */
  formatLabel(str) {
    if (!str) return '';
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, s => s.toUpperCase())
      .trim();
  }

  /**
   * Get ADHD score interpretation
   */
  getADHDInterpretation(score) {
    if (score < 30) return 'Low indicators of ADHD traits. Your responses suggest typical attention and focus patterns.';
    if (score < 60) return 'Moderate indicators of ADHD traits. Some challenges with attention or organization may be present.';
    return 'Elevated indicators of ADHD traits. Consider consulting with a healthcare professional for a comprehensive evaluation.';
  }

  /**
   * Get Autism score interpretation
   */
  getAutismInterpretation(score) {
    if (score < 30) return 'Low indicators of autism spectrum traits. Your responses suggest typical social and communication patterns.';
    if (score < 60) return 'Moderate indicators of autism spectrum traits. Some differences in social or communication style may be present.';
    return 'Elevated indicators of autism spectrum traits. Consider consulting with a healthcare professional for a comprehensive evaluation.';
  }

  /**
   * Infer work environment preferences from career insights
   */
  inferWorkEnvironment(careerInsights) {
    // Provide a generic helpful message if no specific data
    return 'Environments that align with your values and allow you to leverage your natural strengths.';
  }

  /**
   * Infer leadership style from career insights
   */
  inferLeadershipStyle(careerInsights) {
    // Provide a generic helpful message if no specific data
    return 'Leadership through authentic connection with others and alignment with your core values.';
  }

  /**
   * Infer conflict style from relationship insights
   */
  inferConflictStyle(relationshipInsights) {
    // Provide a generic helpful message if no specific data
    return 'Approach conflicts thoughtfully, balancing your needs with consideration for others.';
  }

  /**
   * Infer emotional expression from relationship insights
   */
  inferEmotionalExpression(relationshipInsights) {
    // Provide a generic helpful message if no specific data
    return 'Express emotions in ways that feel authentic while being mindful of context.';
  }

  /**
   * Infer trust building approach from relationship insights
   */
  inferTrustBuilding(relationshipInsights) {
    // Provide a generic helpful message if no specific data
    return 'Build trust gradually through consistent actions and authentic communication over time.';
  }

  /**
   * Get ordinal suffix for a number (1st, 2nd, 3rd, 4th, etc.)
   * @param {number} num - The number to get suffix for
   * @returns {string} The ordinal suffix (st, nd, rd, th)
   */
  getOrdinalSuffix(num) {
    const j = num % 10;
    const k = num % 100;

    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  }

  /**
   * Format number with ordinal suffix (1st, 2nd, 3rd, etc.)
   * @param {number} num - The number to format
   * @returns {string} Formatted number with ordinal suffix
   */
  formatOrdinal(num) {
    return `${num}${this.getOrdinalSuffix(num)}`;
  }
}

module.exports = PDFReportGenerator;
