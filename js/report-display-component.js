import { ComprehensiveReportGenerator } from './comprehensive-report-generator.js';

class ReportDisplayComponent {
  constructor() {
    this.reportGenerator = new ComprehensiveReportGenerator();
    this.currentReport = null;
  }

  async renderReport(assessmentData) {
    try {
      // Generate comprehensive report
      this.currentReport = await this.reportGenerator.generateComprehensiveReport(assessmentData);

      // Create report container
      const reportContainer = document.createElement('div');
      reportContainer.className = 'comprehensive-report-container';
      reportContainer.innerHTML = this.generateReportHTML();

      // Initialize visualizations after DOM is ready
      setTimeout(() => {
        this.initializeVisualizations();
        this.attachEventListeners();
      }, 100);

      return reportContainer;
    } catch (error) {
      console.error('Error rendering report:', error);
      return this.renderErrorState();
    }
  }

  generateReportHTML() {
    const {
      meta,
      executive,
      personality,
      neurodiversity,
      cognitive,
      archetype,
      insights,
      recommendations,
      career,
      relationships,
      growth,
      comparisons
    } = this.currentReport;

    return `
            <div class="report-header">
                <div class="header-gradient"></div>
                <div class="header-content">
                    <h1>Comprehensive Assessment Report</h1>
                    <div class="report-meta">
                        <span class="meta-item"><i class="icon-calendar"></i> ${new Date(meta.timestamp).toLocaleDateString()}</span>
                        <span class="meta-item"><i class="icon-clock"></i> ${meta.duration} minutes</span>
                        <span class="meta-item"><i class="icon-target"></i> ${meta.mode} Mode</span>
                        ${meta.track ? `<span class="meta-item"><i class="icon-track"></i> ${meta.track} Track</span>` : ''}
                    </div>
                    <div class="report-actions">
                        <button class="btn-primary" onclick="reportDisplay.exportPDF()">
                            <i class="icon-download"></i> Export PDF
                        </button>
                        <button class="btn-secondary" onclick="reportDisplay.shareReport()">
                            <i class="icon-share"></i> Share Report
                        </button>
                    </div>
                </div>
            </div>

            <div class="report-navigation">
                <nav class="sticky-nav">
                    <a href="#executive-summary" class="nav-link active">Overview</a>
                    <a href="#personality-analysis" class="nav-link">Personality</a>
                    ${neurodiversity ? '<a href="#neurodiversity-analysis" class="nav-link">Neurodiversity</a>' : ''}
                    <a href="#cognitive-patterns" class="nav-link">Cognitive</a>
                    <a href="#archetype" class="nav-link">Archetype</a>
                    <a href="#insights" class="nav-link">Insights</a>
                    <a href="#recommendations" class="nav-link">Action Plan</a>
                    <a href="#career" class="nav-link">Career</a>
                    <a href="#relationships" class="nav-link">Relationships</a>
                    <a href="#growth-plan" class="nav-link">Growth</a>
                </nav>
            </div>

            <div class="report-content">
                ${this.renderExecutiveSummary(executive)}
                ${this.renderPersonalityAnalysis(personality)}
                ${neurodiversity ? this.renderNeurodiversityAnalysis(neurodiversity) : ''}
                ${this.renderCognitivePatterns(cognitive)}
                ${this.renderArchetype(archetype)}
                ${this.renderInsights(insights)}
                ${this.renderRecommendations(recommendations)}
                ${this.renderCareerGuidance(career)}
                ${this.renderRelationships(relationships)}
                ${this.renderGrowthPlan(growth)}
                ${this.renderComparisons(comparisons)}
            </div>

            <div class="report-footer">
                <div class="validity-section">
                    <h3>Report Validity Metrics</h3>
                    <div class="validity-grid">
                        <div class="validity-item">
                            <span class="label">Consistency Score</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${this.currentReport.validity.consistency * 100}%"></div>
                            </div>
                            <span class="value">${Math.round(this.currentReport.validity.consistency * 100)}%</span>
                        </div>
                        <div class="validity-item">
                            <span class="label">Completion Rate</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${this.currentReport.validity.completionRate * 100}%"></div>
                            </div>
                            <span class="value">${Math.round(this.currentReport.validity.completionRate * 100)}%</span>
                        </div>
                        <div class="validity-item">
                            <span class="label">Response Quality</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${this.currentReport.validity.responseQuality * 100}%"></div>
                            </div>
                            <span class="value">${Math.round(this.currentReport.validity.responseQuality * 100)}%</span>
                        </div>
                    </div>
                </div>
                <div class="footer-actions">
                    <button class="btn-outline" onclick="reportDisplay.retakeAssessment()">
                        <i class="icon-refresh"></i> Retake Assessment
                    </button>
                    <button class="btn-outline" onclick="reportDisplay.compareResults()">
                        <i class="icon-compare"></i> Compare with Previous
                    </button>
                </div>
                <p class="disclaimer">
                    This report is based on your responses and behavioral patterns during the assessment.
                    Results should be considered as insights rather than definitive diagnoses.
                </p>
            </div>
        `;
  }

  renderExecutiveSummary(executive) {
    return `
            <section id="executive-summary" class="report-section">
                <h2 class="section-title">Executive Summary</h2>
                <div class="executive-content">
                    <div class="summary-card highlight">
                        <h3>Key Findings</h3>
                        <p>${executive.overview}</p>
                    </div>
                    <div class="strengths-weaknesses">
                        <div class="strengths-card">
                            <h4><i class="icon-star"></i> Top Strengths</h4>
                            <ul class="strength-list">
                                ${executive.strengths
                                  .map(
                                    s => `
                                    <li class="strength-item">
                                        <span class="strength-icon">✓</span>
                                        <span>${s}</span>
                                    </li>
                                `
                                  )
                                  .join('')}
                            </ul>
                        </div>
                        <div class="areas-card">
                            <h4><i class="icon-growth"></i> Growth Areas</h4>
                            <ul class="area-list">
                                ${executive.areasForGrowth
                                  .map(
                                    a => `
                                    <li class="area-item">
                                        <span class="area-icon">→</span>
                                        <span>${a}</span>
                                    </li>
                                `
                                  )
                                  .join('')}
                            </ul>
                        </div>
                    </div>
                    <div class="key-insights">
                        <h4>Primary Insights</h4>
                        <div class="insight-cards">
                            ${executive.keyInsights
                              .map(
                                insight => `
                                <div class="insight-card">
                                    <i class="icon-lightbulb"></i>
                                    <p>${insight}</p>
                                </div>
                            `
                              )
                              .join('')}
                        </div>
                    </div>
                </div>
            </section>
        `;
  }

  renderPersonalityAnalysis(personality) {
    return `
            <section id="personality-analysis" class="report-section">
                <h2 class="section-title">Personality Profile</h2>
                <div class="personality-overview">
                    <div class="radar-chart-container">
                        <canvas id="personality-radar" width="400" height="400"></canvas>
                    </div>
                    <div class="trait-details">
                        ${Object.entries(personality.traits)
                          .map(
                            ([trait, data]) => `
                            <div class="trait-card ${this.getTraitClass(data.score)}">
                                <div class="trait-header">
                                    <h3>${this.formatTraitName(trait)}</h3>
                                    <span class="trait-score">${Math.round(data.score)}</span>
                                </div>
                                <div class="trait-bar">
                                    <div class="trait-fill" style="width: ${data.score}%">
                                        <span class="trait-label">${data.level}</span>
                                    </div>
                                </div>
                                <p class="trait-description">${data.description}</p>
                                <div class="trait-facets">
                                    ${data.facets
                                      .map(
                                        facet => `
                                        <span class="facet-tag">${facet}</span>
                                    `
                                      )
                                      .join('')}
                                </div>
                            </div>
                        `
                          )
                          .join('')}
                    </div>
                </div>
            </section>
        `;
  }

  renderNeurodiversityAnalysis(neurodiversity) {
    return `
            <section id="neurodiversity-analysis" class="report-section">
                <h2 class="section-title">Neurodiversity Profile</h2>
                <div class="neurodiversity-content">
                    <div class="screening-results">
                        ${Object.entries(neurodiversity.screening)
                          .map(
                            ([condition, data]) => `
                            <div class="screening-card ${this.getScreeningClass(data.likelihood)}">
                                <div class="screening-header">
                                    <h3>${condition.toUpperCase()}</h3>
                                    <span class="likelihood-badge ${data.likelihood.toLowerCase()}">${data.likelihood}</span>
                                </div>
                                <div class="indicators-section">
                                    <h4>Indicators Present:</h4>
                                    <ul class="indicators-list">
                                        ${data.indicators.map(i => `<li>${i}</li>`).join('')}
                                    </ul>
                                </div>
                                <div class="strategies-section">
                                    <h4>Support Strategies:</h4>
                                    <ul class="strategies-list">
                                        ${data.strategies.map(s => `<li>${s}</li>`).join('')}
                                    </ul>
                                </div>
                                ${
                                  data.resources
                                    ? `
                                    <div class="resources-section">
                                        <h4>Resources:</h4>
                                        <ul class="resources-list">
                                            ${data.resources.map(r => `<li>${r}</li>`).join('')}
                                        </ul>
                                    </div>
                                `
                                    : ''
                                }
                            </div>
                        `
                          )
                          .join('')}
                    </div>
                </div>
            </section>
        `;
  }

  renderCognitivePatterns(cognitive) {
    return `
            <section id="cognitive-patterns" class="report-section">
                <h2 class="section-title">Cognitive & Thinking Patterns</h2>
                <div class="cognitive-grid">
                    <div class="thinking-style-card">
                        <h3>Thinking Style</h3>
                        <div class="style-visualization">
                            <canvas id="thinking-style-chart" width="300" height="200"></canvas>
                        </div>
                        <p>${cognitive.thinkingStyle.description}</p>
                        <div class="style-traits">
                            ${cognitive.thinkingStyle.traits
                              .map(
                                t => `
                                <span class="trait-badge">${t}</span>
                            `
                              )
                              .join('')}
                        </div>
                    </div>
                    <div class="problem-solving-card">
                        <h3>Problem-Solving Approach</h3>
                        <div class="approach-metrics">
                            ${Object.entries(cognitive.problemSolving)
                              .map(
                                ([key, value]) => `
                                <div class="metric-item">
                                    <span class="metric-label">${this.formatLabel(key)}</span>
                                    <div class="metric-bar">
                                        <div class="metric-fill" style="width: ${value}%"></div>
                                    </div>
                                    <span class="metric-value">${value}%</span>
                                </div>
                            `
                              )
                              .join('')}
                        </div>
                    </div>
                    <div class="lateral-thinking-card">
                        <h3>Lateral Thinking</h3>
                        <div class="lateral-score">
                            <div class="score-circle">
                                <span class="score-value">${cognitive.lateralThinking.score}</span>
                                <span class="score-label">Score</span>
                            </div>
                        </div>
                        <p>${cognitive.lateralThinking.analysis}</p>
                        <div class="pattern-examples">
                            <h4>Pattern Examples:</h4>
                            <ul>
                                ${cognitive.lateralThinking.examples
                                  .map(
                                    e => `
                                    <li>${e}</li>
                                `
                                  )
                                  .join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        `;
  }

  renderArchetype(archetype) {
    return `
            <section id="archetype" class="report-section archetype-section">
                <h2 class="section-title">Your Personality Archetype</h2>
                <div class="archetype-container">
                    <div class="archetype-header">
                        <div class="archetype-icon">
                            <i class="icon-${archetype.icon}"></i>
                        </div>
                        <h3 class="archetype-name">${archetype.name}</h3>
                        <p class="archetype-tagline">${archetype.tagline}</p>
                    </div>
                    <div class="archetype-content">
                        <div class="archetype-description">
                            <p>${archetype.description}</p>
                        </div>
                        <div class="archetype-traits">
                            <h4>Core Characteristics</h4>
                            <div class="traits-grid">
                                ${archetype.characteristics
                                  .map(
                                    c => `
                                    <div class="characteristic-item">
                                        <i class="icon-check"></i>
                                        <span>${c}</span>
                                    </div>
                                `
                                  )
                                  .join('')}
                            </div>
                        </div>
                        <div class="archetype-strengths">
                            <h4>Signature Strengths</h4>
                            <ul>
                                ${archetype.strengths.map(s => `<li>${s}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="archetype-challenges">
                            <h4>Potential Challenges</h4>
                            <ul>
                                ${archetype.challenges.map(c => `<li>${c}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        `;
  }

  renderInsights(insights) {
    return `
            <section id="insights" class="report-section">
                <h2 class="section-title">Deep Insights</h2>
                <div class="insights-grid">
                    ${insights
                      .map(
                        (insight, index) => `
                        <div class="insight-card-detailed">
                            <div class="insight-number">${index + 1}</div>
                            <h3>${insight.title}</h3>
                            <p>${insight.description}</p>
                            <div class="insight-impact">
                                <span class="impact-label">Impact Area:</span>
                                <span class="impact-value">${insight.impactArea}</span>
                            </div>
                            <div class="insight-action">
                                <span class="action-label">Action:</span>
                                <span class="action-value">${insight.suggestedAction}</span>
                            </div>
                        </div>
                    `
                      )
                      .join('')}
                </div>
            </section>
        `;
  }

  renderRecommendations(recommendations) {
    return `
            <section id="recommendations" class="report-section">
                <h2 class="section-title">Personalized Recommendations</h2>
                <div class="recommendations-container">
                    <div class="immediate-actions">
                        <h3><i class="icon-lightning"></i> Immediate Actions</h3>
                        <div class="action-cards">
                            ${recommendations.immediate
                              .map(
                                action => `
                                <div class="action-card">
                                    <div class="action-priority high">High Priority</div>
                                    <h4>${action.title}</h4>
                                    <p>${action.description}</p>
                                    <div class="action-steps">
                                        <h5>Steps:</h5>
                                        <ol>
                                            ${action.steps.map(step => `<li>${step}</li>`).join('')}
                                        </ol>
                                    </div>
                                    <div class="expected-outcome">
                                        <strong>Expected Outcome:</strong> ${action.outcome}
                                    </div>
                                </div>
                            `
                              )
                              .join('')}
                        </div>
                    </div>
                    <div class="long-term-goals">
                        <h3><i class="icon-target"></i> Long-term Development</h3>
                        <div class="goal-cards">
                            ${recommendations.longTerm
                              .map(
                                goal => `
                                <div class="goal-card">
                                    <h4>${goal.title}</h4>
                                    <p>${goal.description}</p>
                                    <div class="timeline">
                                        <span class="timeline-label">Timeline:</span>
                                        <span class="timeline-value">${goal.timeline}</span>
                                    </div>
                                    <div class="milestones">
                                        <h5>Key Milestones:</h5>
                                        <ul>
                                            ${goal.milestones.map(m => `<li>${m}</li>`).join('')}
                                        </ul>
                                    </div>
                                </div>
                            `
                              )
                              .join('')}
                        </div>
                    </div>
                </div>
            </section>
        `;
  }

  renderCareerGuidance(career) {
    return `
            <section id="career" class="report-section">
                <h2 class="section-title">Career Guidance</h2>
                <div class="career-content">
                    <div class="ideal-roles">
                        <h3>Ideal Career Paths</h3>
                        <div class="role-cards">
                            ${career.idealRoles
                              .map(
                                role => `
                                <div class="role-card">
                                    <h4>${role.title}</h4>
                                    <p>${role.description}</p>
                                    <div class="fit-score">
                                        <span class="fit-label">Fit Score:</span>
                                        <div class="fit-bar">
                                            <div class="fit-fill" style="width: ${role.fitScore}%"></div>
                                        </div>
                                        <span class="fit-value">${role.fitScore}%</span>
                                    </div>
                                    <div class="role-reasons">
                                        <h5>Why This Works:</h5>
                                        <ul>
                                            ${role.reasons.map(r => `<li>${r}</li>`).join('')}
                                        </ul>
                                    </div>
                                </div>
                            `
                              )
                              .join('')}
                        </div>
                    </div>
                    <div class="work-environment">
                        <h3>Optimal Work Environment</h3>
                        <div class="environment-factors">
                            ${Object.entries(career.workEnvironment)
                              .map(
                                ([factor, value]) => `
                                <div class="factor-item">
                                    <span class="factor-name">${this.formatLabel(factor)}</span>
                                    <span class="factor-value">${value}</span>
                                </div>
                            `
                              )
                              .join('')}
                        </div>
                    </div>
                    <div class="skill-development">
                        <h3>Skills to Develop</h3>
                        <div class="skills-grid">
                            ${career.skillsToDevelop
                              .map(
                                skill => `
                                <div class="skill-card">
                                    <h4>${skill.name}</h4>
                                    <p>${skill.importance}</p>
                                    <div class="skill-resources">
                                        <h5>Resources:</h5>
                                        <ul>
                                            ${skill.resources.map(r => `<li>${r}</li>`).join('')}
                                        </ul>
                                    </div>
                                </div>
                            `
                              )
                              .join('')}
                        </div>
                    </div>
                </div>
            </section>
        `;
  }

  renderRelationships(relationships) {
    return `
            <section id="relationships" class="report-section">
                <h2 class="section-title">Relationship Insights</h2>
                <div class="relationships-content">
                    <div class="communication-style">
                        <h3>Communication Style</h3>
                        <div class="style-card">
                            <p>${relationships.communicationStyle.description}</p>
                            <div class="style-characteristics">
                                <h4>Key Characteristics:</h4>
                                <ul>
                                    ${relationships.communicationStyle.characteristics
                                      .map(
                                        c => `
                                        <li>${c}</li>
                                    `
                                      )
                                      .join('')}
                                </ul>
                            </div>
                            <div class="improvement-tips">
                                <h4>Improvement Tips:</h4>
                                <ul>
                                    ${relationships.communicationStyle.tips
                                      .map(
                                        t => `
                                        <li>${t}</li>
                                    `
                                      )
                                      .join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="compatibility-insights">
                        <h3>Compatibility Patterns</h3>
                        <div class="compatibility-grid">
                            ${relationships.compatibility
                              .map(
                                comp => `
                                <div class="compatibility-card">
                                    <h4>With ${comp.type}</h4>
                                    <div class="compatibility-meter">
                                        <div class="meter-fill" style="width: ${comp.score}%"></div>
                                    </div>
                                    <p>${comp.description}</p>
                                    <div class="compatibility-tips">
                                        <h5>Success Tips:</h5>
                                        <ul>
                                            ${comp.tips.map(tip => `<li>${tip}</li>`).join('')}
                                        </ul>
                                    </div>
                                </div>
                            `
                              )
                              .join('')}
                        </div>
                    </div>
                    <div class="relationship-strengths">
                        <h3>Relationship Strengths</h3>
                        <ul class="strengths-list">
                            ${relationships.strengths
                              .map(
                                s => `
                                <li class="strength-item">
                                    <i class="icon-heart"></i>
                                    <span>${s}</span>
                                </li>
                            `
                              )
                              .join('')}
                        </ul>
                    </div>
                    <div class="growth-areas">
                        <h3>Areas for Growth</h3>
                        <ul class="growth-list">
                            ${relationships.growthAreas
                              .map(
                                g => `
                                <li class="growth-item">
                                    <i class="icon-growth"></i>
                                    <span>${g}</span>
                                </li>
                            `
                              )
                              .join('')}
                        </ul>
                    </div>
                </div>
            </section>
        `;
  }

  renderGrowthPlan(growth) {
    return `
            <section id="growth-plan" class="report-section">
                <h2 class="section-title">Personal Growth Plan</h2>
                <div class="growth-timeline">
                    <div class="timeline-container">
                        ${growth.phases
                          .map(
                            (phase, index) => `
                            <div class="timeline-item ${index === 0 ? 'active' : ''}">
                                <div class="timeline-marker">${index + 1}</div>
                                <div class="timeline-content">
                                    <h3>${phase.name}</h3>
                                    <span class="phase-duration">${phase.duration}</span>
                                    <p>${phase.description}</p>
                                    <div class="phase-goals">
                                        <h4>Goals:</h4>
                                        <ul>
                                            ${phase.goals.map(g => `<li>${g}</li>`).join('')}
                                        </ul>
                                    </div>
                                    <div class="phase-activities">
                                        <h4>Key Activities:</h4>
                                        <ul>
                                            ${phase.activities.map(a => `<li>${a}</li>`).join('')}
                                        </ul>
                                    </div>
                                    <div class="success-metrics">
                                        <h4>Success Metrics:</h4>
                                        <ul>
                                            ${phase.metrics.map(m => `<li>${m}</li>`).join('')}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        `
                          )
                          .join('')}
                    </div>
                </div>
                <div class="habits-section">
                    <h3>Daily Habits to Cultivate</h3>
                    <div class="habits-grid">
                        ${growth.dailyHabits
                          .map(
                            habit => `
                            <div class="habit-card">
                                <i class="icon-${habit.icon}"></i>
                                <h4>${habit.name}</h4>
                                <p>${habit.description}</p>
                                <span class="habit-time">${habit.timeRequired}</span>
                            </div>
                        `
                          )
                          .join('')}
                    </div>
                </div>
                <div class="resources-section">
                    <h3>Recommended Resources</h3>
                    <div class="resources-categories">
                        ${Object.entries(growth.resources)
                          .map(
                            ([category, items]) => `
                            <div class="resource-category">
                                <h4>${this.formatLabel(category)}</h4>
                                <ul class="resource-list">
                                    ${items
                                      .map(
                                        item => `
                                        <li class="resource-item">
                                            <i class="icon-${this.getResourceIcon(category)}"></i>
                                            <span>${item}</span>
                                        </li>
                                    `
                                      )
                                      .join('')}
                                </ul>
                            </div>
                        `
                          )
                          .join('')}
                    </div>
                </div>
            </section>
        `;
  }

  renderComparisons(comparisons) {
    if (!comparisons || !comparisons.populationPercentiles) return '';

    return `
            <section id="comparisons" class="report-section">
                <h2 class="section-title">How You Compare</h2>
                <div class="comparison-content">
                    <div class="percentile-chart">
                        <h3>Population Percentiles</h3>
                        <div class="percentile-bars">
                            ${Object.entries(comparisons.populationPercentiles)
                              .map(
                                ([trait, percentile]) => `
                                <div class="percentile-item">
                                    <span class="trait-label">${this.formatTraitName(trait)}</span>
                                    <div class="percentile-bar">
                                        <div class="percentile-fill" style="width: ${percentile}%">
                                            <span class="percentile-value">${percentile}th</span>
                                        </div>
                                    </div>
                                    <span class="percentile-description">${this.getPercentileDescription(percentile)}</span>
                                </div>
                            `
                              )
                              .join('')}
                        </div>
                    </div>
                    <div class="comparison-insights">
                        <h3>What This Means</h3>
                        <p>${comparisons.interpretation}</p>
                    </div>
                </div>
            </section>
        `;
  }

  // Helper methods
  formatTraitName(trait) {
    const names = {
      openness: 'Openness',
      conscientiousness: 'Conscientiousness',
      extraversion: 'Extraversion',
      agreeableness: 'Agreeableness',
      neuroticism: 'Emotional Stability'
    };
    return names[trait] || trait;
  }

  formatLabel(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  getTraitClass(score) {
    if (score >= 70) return 'trait-high';
    if (score >= 30) return 'trait-medium';
    return 'trait-low';
  }

  getScreeningClass(likelihood) {
    const classes = {
      High: 'screening-high',
      Moderate: 'screening-moderate',
      Low: 'screening-low'
    };
    return classes[likelihood] || '';
  }

  getPercentileDescription(percentile) {
    if (percentile >= 90) return 'Exceptionally High';
    if (percentile >= 70) return 'Above Average';
    if (percentile >= 30) return 'Average Range';
    if (percentile >= 10) return 'Below Average';
    return 'Exceptionally Low';
  }

  getResourceIcon(category) {
    const icons = {
      books: 'book',
      courses: 'graduation',
      apps: 'mobile',
      websites: 'globe',
      podcasts: 'headphones',
      videos: 'play'
    };
    return icons[category.toLowerCase()] || 'resource';
  }

  initializeVisualizations() {
    // Initialize radar chart for personality traits
    this.drawRadarChart();

    // Initialize thinking style chart
    this.drawThinkingStyleChart();

    // Initialize smooth scrolling for navigation
    this.initSmoothScroll();

    // Initialize interactive elements
    this.initInteractiveElements();
  }

  drawRadarChart() {
    const canvas = document.getElementById('personality-radar');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    // Draw radar grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      for (let j = 0; j < 5; j++) {
        const angle = (Math.PI * 2 * j) / 5 - Math.PI / 2;
        const x = centerX + Math.cos(angle) * ((radius * i) / 5);
        const y = centerY + Math.sin(angle) * ((radius * i) / 5);
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw axes
    const traits = [
      'openness',
      'conscientiousness',
      'extraversion',
      'agreeableness',
      'neuroticism'
    ];
    traits.forEach((trait, i) => {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
      ctx.stroke();

      // Add labels
      ctx.font = '14px Inter, sans-serif';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      const labelX = centerX + Math.cos(angle) * (radius + 25);
      const labelY = centerY + Math.sin(angle) * (radius + 25);
      ctx.fillText(this.formatTraitName(trait), labelX, labelY);
    });

    // Draw data
    if (this.currentReport && this.currentReport.personality) {
      ctx.beginPath();
      ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;

      traits.forEach((trait, i) => {
        const score = this.currentReport.personality.traits[trait].score / 100;
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const x = centerX + Math.cos(angle) * (radius * score);
        const y = centerY + Math.sin(angle) * (radius * score);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  drawThinkingStyleChart() {
    const canvas = document.getElementById('thinking-style-chart');
    if (!canvas || !this.currentReport) return;

    const ctx = canvas.getContext('2d');
    const data = this.currentReport.cognitive.thinkingStyle.distribution;

    // Draw bar chart
    const barWidth = canvas.width / Object.keys(data).length;
    let x = 0;

    Object.entries(data).forEach(([style, value]) => {
      const height = (value / 100) * canvas.height * 0.8;

      // Draw bar
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(x + barWidth * 0.1, canvas.height - height, barWidth * 0.8, height);

      // Draw label
      ctx.fillStyle = '#333';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(style, x + barWidth / 2, canvas.height - 5);

      // Draw value
      ctx.fillText(`${value}%`, x + barWidth / 2, canvas.height - height - 10);

      x += barWidth;
    });
  }

  initSmoothScroll() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

          // Update active nav
          document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    });
  }

  initInteractiveElements() {
    // Add hover effects to cards
    document.querySelectorAll('.trait-card, .insight-card, .action-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-2px)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
      });
    });

    // Initialize tooltips
    document.querySelectorAll('[data-tooltip]').forEach(element => {
      element.addEventListener('mouseenter', e => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = e.target.dataset.tooltip;
        document.body.appendChild(tooltip);

        const rect = e.target.getBoundingClientRect();
        tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
      });

      element.addEventListener('mouseleave', () => {
        document.querySelectorAll('.tooltip').forEach(t => t.remove());
      });
    });
  }

  attachEventListeners() {
    // Intersection observer for section animations
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');

            // Update navigation
            const id = entry.target.id;
            const navLink = document.querySelector(`.nav-link[href="#${id}"]`);
            if (navLink) {
              document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
              navLink.classList.add('active');
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.report-section').forEach(section => {
      observer.observe(section);
    });
  }

  async exportPDF() {
    // Placeholder for PDF export functionality
    // console.log('Exporting report as PDF...');
    alert('PDF export will be implemented with a PDF library like jsPDF');
  }

  shareReport() {
    // Placeholder for share functionality
    // console.log('Sharing report...');
    if (navigator.share) {
      navigator.share({
        title: 'My Neurlyn Assessment Report',
        text: 'Check out my personality assessment results',
        url: window.location.href
      });
    } else {
      alert('Share functionality coming soon!');
    }
  }

  retakeAssessment() {
    if (
      confirm('Are you sure you want to retake the assessment? This will start a new assessment.')
    ) {
      window.location.href = '/assessment';
    }
  }

  compareResults() {
    // console.log('Loading comparison view...');
    alert('Comparison with previous results coming soon!');
  }

  renderErrorState() {
    return `
            <div class="error-container">
                <h2>Unable to Generate Report</h2>
                <p>There was an error generating your assessment report. Please try again or contact support.</p>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReportDisplayComponent;
}

// Make available globally for non-module scripts
if (typeof window !== 'undefined') {
  window.ReportDisplayComponent = ReportDisplayComponent;
}

// Initialize global instance
const reportDisplay = new ReportDisplayComponent();
