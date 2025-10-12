const mongoose = require('mongoose');
require('../models/QuestionBank');
const QuestionBank = mongoose.model('QuestionBank');

// Map questions to EF domains based on their text content
const efDomainMapping = {
  // Working Memory
  'NEURLYN_EXECUTIVE_95': { domain: 'workingMemory', baseline: true },  // forget appointments
  'NEURLYN_EXECUTIVE_94': { domain: 'workingMemory', baseline: true },  // write everything down
  'NEURLYN_EXECUTIVE_93': { domain: 'workingMemory', baseline: false }, // walk into rooms forget
  'NEURLYN_EXECUTIVE_92': { domain: 'workingMemory', baseline: false }, // forget where I put things

  // Organization
  'NEURLYN_EXECUTIVE_96': { domain: 'organization', baseline: true },   // living space organized
  'NEURLYN_EXECUTIVE_98': { domain: 'organization', baseline: true },   // use organizational tools

  // Planning
  'NEURLYN_EXECUTIVE_97': { domain: 'planning', baseline: true },       // create detailed plans
  'NEURLYN_EXECUTIVE_99': { domain: 'planning', baseline: false },      // overwhelmed multi-step tasks

  // Time Management
  'NEURLYN_EXECUTIVE_88': { domain: 'timeManagement', baseline: true }, // frequently late
  'NEURLYN_EXECUTIVE_85': { domain: 'timeManagement', baseline: false },// lose track of time
  'NEURLYN_EXECUTIVE_87': { domain: 'timeManagement', baseline: true }, // underestimate how long
  'NEURLYN_EXECUTIVE_86': { domain: 'timeManagement', baseline: false },// multiple alarms

  // Task Initiation
  'NEURLYN_EXECUTIVE_82': { domain: 'taskInitiation', baseline: true }, // start tasks right away
  'NEURLYN_EXECUTIVE_83': { domain: 'taskInitiation', baseline: true }, // put off tasks
  'NEURLYN_EXECUTIVE_84': { domain: 'taskInitiation', baseline: false },// need external deadlines

  // Flexibility
  'NEURLYN_EXECUTIVE_89': { domain: 'flexibility', baseline: true },    // switch between tasks
  'NEURLYN_EXECUTIVE_91': { domain: 'flexibility', baseline: false },   // get stuck on one activity

  // Sustained Attention
  'NEURLYN_EXECUTIVE_90': { domain: 'sustainedAttention', baseline: true }, // return after interrupt

  // Emotional Regulation
  'NEURLYN_EXECUTIVE_100': { domain: 'emotionalRegulation', baseline: true }, // manage emotions under stress
  'NEURLYN_EXECUTIVE_101': { domain: 'emotionalRegulation', baseline: false } // small frustrations derail
};

// Map sensory questions to sensory domains
const sensoryDomainMapping = {
  // Auditory
  'NEURLYN_SENSORY_106': { domain: 'auditory', baseline: true },  // notice subtle sounds
  'NEURLYN_SENSORY_107': { domain: 'auditory', baseline: true },  // background noise
  'NEURLYN_SENSORY_108': { domain: 'auditory', baseline: false }, // noise-canceling headphones
  'NEURLYN_SENSORY_109': { domain: 'auditory', baseline: false }, // sudden loud noises

  // Olfactory
  'NEURLYN_SENSORY_114': { domain: 'olfactory', baseline: true }, // strong smells
  'NEURLYN_SENSORY_116': { domain: 'olfactory', baseline: false },// smell things others don't
  'NEURLYN_SENSORY_OLFACTORY_3': { domain: 'olfactory', baseline: false },

  // Oral
  'NEURLYN_SENSORY_115': { domain: 'oral', baseline: true },      // limited diet texture/taste
  'NEURLYN_SENSORY_ORAL_2': { domain: 'oral', baseline: false },  // food temperatures
  'NEURLYN_SENSORY_ORAL_3': { domain: 'oral', baseline: false },  // mixed textures

  // Vestibular
  'NEURLYN_SENSORY_118': { domain: 'vestibular', baseline: true }, // crave movement
  'NEURLYN_SENSORY_119': { domain: 'vestibular', baseline: false },// bump into things
  'NEURLYN_SENSORY_117': { domain: 'vestibular', baseline: true }, // dizzy on swings
  'NEURLYN_SENSORY_VESTIBULAR_2': { domain: 'vestibular', baseline: false },
  'NEURLYN_SENSORY_VESTIBULAR_3': { domain: 'vestibular', baseline: false },

  // Tactile
  'NEURLYN_SENSORY_102': { domain: 'tactile', baseline: true },   // fabric textures
  'NEURLYN_SENSORY_103': { domain: 'tactile', baseline: false },  // cut tags
  'NEURLYN_SENSORY_104': { domain: 'tactile', baseline: true },   // light touches painful
  'NEURLYN_SENSORY_105': { domain: 'tactile', baseline: false },  // prefer deep pressure

  // Visual
  'NEURLYN_SENSORY_110': { domain: 'visual', baseline: true },    // bright lights headaches
  'NEURLYN_SENSORY_111': { domain: 'visual', baseline: false },   // prefer dim lighting
  'NEURLYN_SENSORY_112': { domain: 'visual', baseline: true },    // fluorescent lights
  'NEURLYN_SENSORY_113': { domain: 'visual', baseline: false }    // notice visual details
};

async function tagQuestions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test');

    console.log('🏷️  Tagging Executive Function questions...\n');

    let efUpdated = 0;
    let efBaseline = 0;

    for (const [questionId, config] of Object.entries(efDomainMapping)) {
      const result = await QuestionBank.updateOne(
        { questionId },
        {
          $set: {
            efDomain: config.domain,
            'adaptive.isBaseline': config.baseline,
            'adaptive.baselinePriority': config.baseline ? 2 : 5
          }
        }
      );

      if (result.modifiedCount > 0) {
        efUpdated++;
        if (config.baseline) efBaseline++;
        console.log(`✓ ${questionId} → ${config.domain} ${config.baseline ? '[BASELINE]' : ''}`);
      }
    }

    console.log(`\n✅ Tagged ${efUpdated} EF questions (${efBaseline} baseline)\n`);

    console.log('🏷️  Tagging Sensory Processing questions...\n');

    let sensoryUpdated = 0;
    let sensoryBaseline = 0;

    for (const [questionId, config] of Object.entries(sensoryDomainMapping)) {
      const result = await QuestionBank.updateOne(
        { questionId },
        {
          $set: {
            sensoryDomain: config.domain,
            'adaptive.isBaseline': config.baseline,
            'adaptive.baselinePriority': config.baseline ? 2 : 5
          }
        }
      );

      if (result.modifiedCount > 0) {
        sensoryUpdated++;
        if (config.baseline) sensoryBaseline++;
        console.log(`✓ ${questionId} → ${config.domain} ${config.baseline ? '[BASELINE]' : ''}`);
      }
    }

    console.log(`\n✅ Tagged ${sensoryUpdated} sensory questions (${sensoryBaseline} baseline)\n`);

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('                SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`Total EF questions tagged: ${efUpdated}`);
    console.log(`  - Baseline: ${efBaseline}`);
    console.log(`  - Adaptive: ${efUpdated - efBaseline}\n`);
    console.log(`Total Sensory questions tagged: ${sensoryUpdated}`);
    console.log(`  - Baseline: ${sensoryBaseline}`);
    console.log(`  - Adaptive: ${sensoryUpdated - sensoryBaseline}\n`);

    // Count by domain
    console.log('EF domains coverage:');
    const efDomains = ['planning', 'organization', 'timeManagement', 'workingMemory',
                       'emotionalRegulation', 'taskInitiation', 'sustainedAttention', 'flexibility'];
    for (const domain of efDomains) {
      const count = await QuestionBank.countDocuments({ efDomain: domain });
      const baselineCount = await QuestionBank.countDocuments({ efDomain: domain, 'adaptive.isBaseline': true });
      console.log(`  ${domain}: ${count} total (${baselineCount} baseline)`);
    }

    console.log('\nSensory domains coverage:');
    const sensoryDomains = ['visual', 'auditory', 'tactile', 'vestibular', 'oral', 'olfactory'];
    for (const domain of sensoryDomains) {
      const count = await QuestionBank.countDocuments({ sensoryDomain: domain });
      const baselineCount = await QuestionBank.countDocuments({ sensoryDomain: domain, 'adaptive.isBaseline': true });
      console.log(`  ${domain}: ${count} total (${baselineCount} baseline)`);
    }

    console.log('\n✅ All questions tagged successfully!\n');

    process.exit(0);
  } catch (error) {
    console.error('Error tagging questions:', error);
    process.exit(1);
  }
}

tagQuestions();
