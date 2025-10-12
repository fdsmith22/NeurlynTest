/**
 * Adaptive Assessment Logger
 * Provides structured logging for assessment flow debugging
 */

class AdaptiveLogger {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.verbose = options.verbose || false;
    this.stage = null;
  }

  setStage(stageNumber, stageName) {
    this.stage = { number: stageNumber, name: stageName };
  }

  /**
   * Log stage start
   */
  stageStart(stageNumber, stageName, targetQuestions, currentTotal) {
    if (!this.enabled) return;

    console.log('\n┌─────────────────────────────────────────────────────────┐');
    console.log(`│ STAGE ${stageNumber}: ${stageName.toUpperCase().padEnd(48)} │`);
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log(`  Target: ${targetQuestions} questions`);
    console.log(`  Current total: ${currentTotal} questions\n`);
  }

  /**
   * Log stage completion
   */
  stageComplete(selected, currentTotal) {
    if (!this.enabled) return;

    console.log(`\n✓ Stage ${this.stage?.number} complete: ${selected} questions selected`);
    console.log(`  Total so far: ${currentTotal} questions\n`);
  }

  /**
   * Log question selection details
   */
  questionSelected(category, details = {}) {
    if (!this.enabled || !this.verbose) return;

    const { questionId, instrument, trait, facet, discriminationIndex } = details;
    let msg = `  [${category}] ${questionId}`;

    if (trait && facet) {
      msg += ` (${trait}.${facet})`;
    } else if (trait) {
      msg += ` (${trait})`;
    } else if (instrument) {
      msg += ` (${instrument})`;
    }

    if (discriminationIndex != null) {
      msg += ` [quality: ${discriminationIndex.toFixed(2)}]`;
    }

    console.log(msg);
  }

  /**
   * Log intelligent facet selection
   */
  intelligentFacet(trait, facet, priority) {
    if (!this.enabled) return;

    console.log(`  [Intelligent] ${trait}.${facet} (priority: ${priority})`);
  }

  /**
   * Log clinical screening results
   */
  clinicalScreen(results) {
    if (!this.enabled) return;

    console.log('\n  Clinical Screening Results:');
    Object.entries(results).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        const icon = value ? '🔴' : '🟢';
        console.log(`    ${icon} ${key}: ${value ? 'FLAGGED' : 'clear'}`);
      } else if (typeof value === 'number') {
        console.log(`    • ${key}: ${value}`);
      }
    });
    console.log('');
  }

  /**
   * Log neurodiversity flags
   */
  neurodiversityFlags(flags) {
    if (!this.enabled) return;

    console.log('\n  Neurodiversity Flags:');
    Object.entries(flags).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        const icon = value ? '🔵' : '⚪';
        console.log(`    ${icon} ${key}: ${value ? 'DETECTED' : 'not detected'}`);
      } else if (typeof value === 'number') {
        console.log(`    • ${key}: ${value}%`);
      }
    });
    console.log('');
  }

  /**
   * Log confidence levels
   */
  confidenceLevels(tracker, targetConfidence) {
    if (!this.enabled) return;

    const dimensions = tracker.getAllDimensions();
    console.log(`\n  Confidence Levels (target: ${targetConfidence}%):`);

    dimensions.slice(0, 10).forEach(dim => {
      const bar = this.makeProgressBar(dim.confidence, 100);
      const icon = dim.confidence >= targetConfidence ? '✓' : '○';
      console.log(`    ${icon} ${dim.dimension.padEnd(20)} ${bar} ${dim.confidence.toFixed(0)}% (${dim.questionCount}Q)`);
    });

    if (dimensions.length > 10) {
      console.log(`    ... and ${dimensions.length - 10} more dimensions`);
    }
    console.log('');
  }

  /**
   * Log priority dimensions
   */
  priorityDimensions(priorities) {
    if (!this.enabled) return;

    if (priorities.length === 0) {
      console.log('  No priority dimensions (all above threshold)\n');
      return;
    }

    console.log(`  Priority Dimensions (${priorities.length}):`);
    priorities.forEach(dim => {
      console.log(`    • ${dim.dimension} (${dim.confidence.toFixed(0)}% confidence, ${dim.questionCount}Q)`);
    });
    console.log('');
  }

  /**
   * Log validity check
   */
  validityCheck(count, subcategories) {
    if (!this.enabled) return;

    console.log(`  Validity questions: ${count}`);
    if (subcategories) {
      subcategories.forEach(sub => {
        console.log(`    • ${sub}`);
      });
    }
  }

  /**
   * Log warning
   */
  warn(message) {
    if (!this.enabled) return;
    console.log(`  ⚠️  WARNING: ${message}`);
  }

  /**
   * Log error
   */
  error(message) {
    console.error(`  ❌ ERROR: ${message}`);
  }

  /**
   * Log info
   */
  info(message) {
    if (!this.enabled) return;
    console.log(`  ℹ️  ${message}`);
  }

  /**
   * Create progress bar
   */
  makeProgressBar(value, max, width = 20) {
    const filled = Math.round((value / max) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  /**
   * Log summary statistics
   */
  summary(stats) {
    if (!this.enabled) return;

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('         ASSESSMENT SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');

    if (stats.totalQuestions != null) {
      console.log(`Total Questions: ${stats.totalQuestions}`);
    }

    if (stats.stageBreakdown) {
      console.log('\nStage Breakdown:');
      Object.entries(stats.stageBreakdown).forEach(([stage, count]) => {
        console.log(`  • ${stage}: ${count} questions`);
      });
    }

    if (stats.categoryBreakdown) {
      console.log('\nCategory Distribution:');
      Object.entries(stats.categoryBreakdown).forEach(([cat, count]) => {
        console.log(`  • ${cat}: ${count} questions`);
      });
    }

    if (stats.averageConfidence != null) {
      console.log(`\nAverage Confidence: ${stats.averageConfidence.toFixed(1)}%`);
    }

    if (stats.completionTime != null) {
      console.log(`Estimated Completion Time: ${stats.completionTime} minutes`);
    }

    console.log('');
  }
}

// Singleton instance
let globalLogger = null;

/**
 * Get or create global logger instance
 */
function getLogger(options) {
  if (!globalLogger) {
    globalLogger = new AdaptiveLogger(options);
  }
  return globalLogger;
}

/**
 * Reset global logger (useful for testing)
 */
function resetLogger() {
  globalLogger = null;
}

module.exports = {
  AdaptiveLogger,
  getLogger,
  resetLogger
};
