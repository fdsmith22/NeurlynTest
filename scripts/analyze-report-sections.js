/**
 * Comprehensive Report Section Analyzer
 * Analyzes actual generated report to verify all sections are present and correct
 */

const fs = require('fs');
const path = require('path');

// Read the latest test report
const reportPath = '/home/freddy/Neurlyn/test-full-assessment-report.json';

async function analyzeReport() {
  try {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('         COMPREHENSIVE REPORT SECTION ANALYSIS');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Read report file
    let report;
    if (fs.existsSync(reportPath)) {
      const rawData = fs.readFileSync(reportPath, 'utf8');
      report = JSON.parse(rawData);
      console.log(`✅ Loaded report from: ${reportPath}\n`);
    } else {
      console.log(`❌ Report file not found at: ${reportPath}`);
      console.log('Please run a full assessment and save the report first.\n');
      return;
    }

    // Section 1: Basic Metadata
    console.log('📋 SECTION 1: REPORT METADATA');
    console.log('─'.repeat(60));
    console.log(`  Report ID: ${report.id || 'N/A'}`);
    console.log(`  Timestamp: ${report.timestamp || 'N/A'}`);
    console.log(`  Tier: ${report.tier || 'N/A'}`);
    console.log(`  Total Questions: ${report.metadata?.totalQuestions || 'N/A'}`);
    console.log(`  Completion Time: ${report.metadata?.completionTime || 'N/A'}`);
    console.log('');

    // Section 2: Big Five Personality Traits
    console.log('🧠 SECTION 2: BIG FIVE PERSONALITY TRAITS');
    console.log('─'.repeat(60));
    if (report.personality?.bigFive) {
      const bigFive = report.personality.bigFive;
      console.log(`  Openness:          ${bigFive.openness}/100`);
      console.log(`  Conscientiousness: ${bigFive.conscientiousness}/100`);
      console.log(`  Extraversion:      ${bigFive.extraversion}/100`);
      console.log(`  Agreeableness:     ${bigFive.agreeableness}/100`);
      console.log(`  Neuroticism:       ${bigFive.neuroticism}/100`);
    } else {
      console.log('  ❌ Big Five scores missing!');
    }
    console.log('');

    // Section 3: RUO Classification
    console.log('🎭 SECTION 3: RUO PERSONALITY PROTOTYPE');
    console.log('─'.repeat(60));
    if (report.personality?.ruoPrototype) {
      const ruo = report.personality.ruoPrototype;
      console.log(`  Classification: ${ruo.primaryType || 'N/A'}`);
      console.log(`  Confidence: ${((ruo.confidence || 0) * 100).toFixed(1)}%`);
      console.log(`  Is Hybrid: ${ruo.isHybrid ? 'Yes' : 'No'}`);
      console.log(`  Scores:`);
      if (ruo.scores) {
        console.log(`    Resilient: ${(ruo.scores.resilient || 0).toFixed(1)}`);
        console.log(`    Undercontrolled: ${(ruo.scores.undercontrolled || 0).toFixed(1)}`);
        console.log(`    Overcontrolled: ${(ruo.scores.overcontrolled || 0).toFixed(1)}`);
      }
    } else {
      console.log('  ❌ RUO classification missing!');
    }
    console.log('');

    // Section 4: Interpersonal Circumplex
    console.log('🤝 SECTION 4: INTERPERSONAL STYLE (AGENCY-COMMUNION)');
    console.log('─'.repeat(60));
    if (report.personality?.interpersonalStyle) {
      const ipc = report.personality.interpersonalStyle;
      console.log(`  Agency: ${ipc.agency}/100`);
      console.log(`  Communion: ${ipc.communion}/100`);
      console.log(`  Octant: ${ipc.octant} (${ipc.octantLabel || 'N/A'})`);
      console.log(`  Description: ${ipc.description?.substring(0, 60) || 'N/A'}...`);
    } else {
      console.log('  ❌ Interpersonal style missing!');
    }
    console.log('');

    // Section 5: Neurodiversity Screening
    console.log('🧩 SECTION 5: NEURODIVERSITY SCREENING');
    console.log('─'.repeat(60));
    if (report.detailed?.neurodiversity) {
      const nd = report.detailed.neurodiversity;

      // ADHD
      if (nd.adhd) {
        console.log(`  ADHD:`);
        console.log(`    Score: ${nd.adhd.score || 'N/A'}/100`);
        console.log(`    Likelihood: ${nd.adhd.likelihood || 'N/A'}`);
        console.log(`    Reportable: ${nd.adhd.reportable ? 'Yes' : 'No'}`);
      } else {
        console.log(`  ADHD: ❌ Missing`);
      }

      // Autism
      if (nd.autism) {
        console.log(`  Autism:`);
        console.log(`    Score: ${nd.autism.score || 'N/A'}/100`);
        console.log(`    Likelihood: ${nd.autism.likelihood || 'N/A'}`);
        console.log(`    Reportable: ${nd.autism.reportable ? 'Yes' : 'No'}`);
      } else {
        console.log(`  Autism: ❌ Missing`);
      }

      // Executive Function
      if (nd.executiveFunction) {
        console.log(`  Executive Function:`);
        console.log(`    Overall: ${nd.executiveFunction.overall || 'N/A'}/100`);
        console.log(`    Reportable: ${nd.executiveFunction.reportable ? 'Yes' : 'No'}`);
        if (nd.executiveFunction.domains) {
          console.log(`    Domains (${Object.keys(nd.executiveFunction.domains).length}):`);
          Object.entries(nd.executiveFunction.domains).forEach(([domain, score]) => {
            console.log(`      ${domain}: ${score}/100`);
          });
        }
      } else {
        console.log(`  Executive Function: ❌ Missing`);
      }

      // Sensory Processing
      if (nd.sensoryProfile) {
        console.log(`  Sensory Processing:`);
        console.log(`    Overall: ${nd.sensoryProfile.overall || 'N/A'}/100`);
        console.log(`    Reportable: ${nd.sensoryProfile.reportable ? 'Yes' : 'No'}`);
        const domains = ['visual', 'auditory', 'tactile', 'vestibular', 'oral', 'olfactory'];
        domains.forEach(d => {
          if (nd.sensoryProfile[d] !== undefined) {
            console.log(`    ${d}: ${nd.sensoryProfile[d]}/100`);
          }
        });
      } else {
        console.log(`  Sensory Processing: ❌ Missing`);
      }
    } else {
      console.log('  ❌ Neurodiversity section missing!');
    }
    console.log('');

    // Section 6: Clinical Assessments
    console.log('🏥 SECTION 6: CLINICAL ASSESSMENTS');
    console.log('─'.repeat(60));
    if (report.clinical) {
      const clinicalKeys = Object.keys(report.clinical);
      console.log(`  Total Components: ${clinicalKeys.length}`);
      console.log(`  Components: ${clinicalKeys.join(', ')}`);
      console.log('');

      // Detailed breakdown
      clinicalKeys.forEach(key => {
        if (key === 'summary' || key === 'alerts') return; // Skip meta sections

        const component = report.clinical[key];
        console.log(`  ${key.toUpperCase()}:`);

        if (component.scores) {
          console.log(`    Scores: ${JSON.stringify(component.scores).substring(0, 80)}...`);
        }
        if (component.summary) {
          console.log(`    Summary: ${component.summary.substring(0, 60)}...`);
        }
        if (component.recommendations && component.recommendations.length > 0) {
          console.log(`    Recommendations: ${component.recommendations.length} items`);
        }
        console.log('');
      });

      // Alerts
      if (report.clinical.alerts && report.clinical.alerts.length > 0) {
        console.log(`  🚨 CLINICAL ALERTS: ${report.clinical.alerts.length}`);
        report.clinical.alerts.forEach((alert, i) => {
          console.log(`    ${i + 1}. [${alert.severity}] ${alert.domain}`);
          console.log(`       ${alert.message.substring(0, 70)}...`);
        });
      } else {
        console.log(`  No critical alerts (good sign)`);
      }
    } else {
      console.log('  ❌ Clinical assessment section completely missing!');
    }
    console.log('');

    // Section 7: Additional Analyses
    console.log('🔬 SECTION 7: ADDITIONAL ANALYSES');
    console.log('─'.repeat(60));

    if (report.detailed?.hexaco) {
      console.log(`  ✅ HEXACO Personality Estimation: Present`);
      console.log(`     Honesty-Humility: ${report.detailed.hexaco.honestyHumility?.score || 'N/A'}/100`);
    } else {
      console.log(`  ❌ HEXACO: Missing`);
    }

    if (report.detailed?.temperament) {
      console.log(`  ✅ Temperament Analysis: Present`);
    } else {
      console.log(`  ❌ Temperament: Missing`);
    }

    if (report.detailed?.ageNormative) {
      console.log(`  ✅ Age-Normative Analysis: Present`);
    } else {
      console.log(`  ℹ️  Age-Normative: Not present (age may not be provided)`);
    }

    if (report.detailed?.careerInsights) {
      console.log(`  ✅ Career Insights: Present`);
    } else {
      console.log(`  ❌ Career Insights: Missing`);
    }

    if (report.detailed?.relationshipInsights) {
      console.log(`  ✅ Relationship Insights: Present`);
    } else {
      console.log(`  ❌ Relationship Insights: Missing`);
    }

    if (report.detailed?.behavioralFingerprint) {
      console.log(`  ✅ Behavioral Fingerprint: Present`);
    } else {
      console.log(`  ❌ Behavioral Fingerprint: Missing`);
    }
    console.log('');

    // Section 8: Consistency Check
    console.log('✅ SECTION 8: CONSISTENCY VALIDATION');
    console.log('─'.repeat(60));

    const e = report.personality?.bigFive?.extraversion;
    const a = report.personality?.bigFive?.agreeableness;
    const n = report.personality?.bigFive?.neuroticism;

    if (e !== undefined && a !== undefined && n !== undefined) {
      console.log(`  Personality Profile: E=${e}, A=${a}, N=${n}`);

      // Check RUO consistency
      const ruo = report.personality?.ruoPrototype?.primaryType;
      console.log(`  RUO Classification: ${ruo || 'N/A'}`);

      // Validate RUO makes sense given traits
      if (ruo === 'resilient' && n > 50) {
        console.log(`  ⚠️  WARNING: Classified as Resilient but N=${n} (should be < 40)`);
      } else if (ruo === 'undercontrolled' && n < 50) {
        console.log(`  ⚠️  WARNING: Classified as Undercontrolled but N=${n} (should be > 60)`);
      } else {
        console.log(`  ✅ RUO classification appears consistent with traits`);
      }

      // Check IPC consistency
      const agency = report.personality?.interpersonalStyle?.agency;
      const communion = report.personality?.interpersonalStyle?.communion;

      console.log(`  Interpersonal: Agency=${agency}, Communion=${communion}`);

      // Agency should correlate with E and (inversely) A
      // Communion should correlate with E and A
      if (agency !== undefined && communion !== undefined) {
        // Low E and low A should give low agency and low communion
        if (e < 40 && a < 40) {
          if (agency < 50 && communion < 50) {
            console.log(`  ✅ IPC scores consistent with low E and A`);
          } else {
            console.log(`  ⚠️  WARNING: Expected low agency and communion for E=${e}, A=${a}`);
          }
        } else {
          console.log(`  ✅ IPC scores appear reasonable`);
        }
      }
    }
    console.log('');

    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('         ANALYSIS COMPLETE');
    console.log('═══════════════════════════════════════════════════════════\n');

    const totalSections = 8;
    const presentSections = [
      report.personality?.bigFive,
      report.personality?.ruoPrototype,
      report.personality?.interpersonalStyle,
      report.detailed?.neurodiversity,
      report.clinical,
      report.detailed?.hexaco,
      report.detailed?.careerInsights,
      report.detailed?.behavioralFingerprint
    ].filter(Boolean).length;

    console.log(`Sections Present: ${presentSections}/${totalSections}`);
    console.log(`Completeness: ${((presentSections / totalSections) * 100).toFixed(1)}%`);

    if (presentSections === totalSections) {
      console.log('\n✅ All major report sections are present and populated!');
    } else {
      console.log(`\n⚠️  ${totalSections - presentSections} section(s) missing or incomplete`);
    }

  } catch (error) {
    console.error('❌ Error analyzing report:', error.message);
    console.error(error.stack);
  }
}

// Run analysis
if (require.main === module) {
  analyzeReport();
}

module.exports = analyzeReport;
