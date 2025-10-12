const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

class NeurodiversityScoring {
  constructor() {
    // ADHD scoring based on ASRS-5 instrument
    this.adhdThresholds = {
      inattention: {
        low: 2,
        moderate: 4,
        high: 6
      },
      hyperactivity: {
        low: 2,
        moderate: 4,
        high: 6
      }
    };

    // Autism spectrum scoring based on AQ-10
    this.autismThresholds = {
      screening: 6, // AQ-10 threshold for further assessment
      traits: {
        social: { low: 2, moderate: 4, high: 6 },
        sensory: { low: 2, moderate: 4, high: 6 },
        routine: { low: 1, moderate: 3, high: 5 },
        communication: { low: 2, moderate: 4, high: 6 }
      }
    };

    // Executive function scoring
    this.executiveFunctionDomains = {
      planning: 0,
      organization: 0,
      timeManagement: 0,
      workingMemory: 0,
      emotionalRegulation: 0,
      taskInitiation: 0,
      sustainedAttention: 0,
      flexibility: 0
    };
  }

  async analyzeNeurodiversityResponses(responses) {
    const analysis = {
      adhd: {
        score: 0,
        indicators: {
          inattention: 0,
          hyperactivity: 0,
          impulsivity: 0
        },
        severity: null,
        traits: [],
        percentile: null
      },
      autism: {
        score: 0,
        indicators: {
          social: 0,
          sensory: 0,
          routine: 0,
          communication: 0,
          interests: 0
        },
        severity: null,
        traits: [],
        percentile: null
      },
      executiveFunction: {
        overall: 0,
        domains: { ...this.executiveFunctionDomains },
        strengths: [],
        challenges: []
      },
      sensoryProfile: {
        sensitivity: 0,
        avoidance: 0,
        seeking: 0,
        registration: 0,
        patterns: [],
        // Individual sensory domains
        visual: 0,
        auditory: 0,
        tactile: 0,
        vestibular: 0,
        oral: 0,
        olfactory: 0
      },
      maskingBehaviors: {
        score: 0,
        indicators: [],
        compensationStrategies: []
      }
    };

    // Fetch question details from database for responses that need them
    const questionIds = responses
      .map(r => r.questionId)
      .filter(Boolean);

    console.log('[NEURODIVERSITY] Processing responses:', responses.length);
    console.log('[NEURODIVERSITY] Question IDs extracted:', questionIds.length);
    console.log('[NEURODIVERSITY] First 3 question IDs:', questionIds.slice(0, 3));

    const questionMap = {};
    if (questionIds.length > 0) {
      const questions = await QuestionBank.find({ questionId: { $in: questionIds } });
      console.log('[NEURODIVERSITY] Questions fetched from DB:', questions.length);
      questions.forEach(q => {
        questionMap[q.questionId] = q;
      });
    }

    // Process each response
    responses.forEach((response, index) => {
      // The response object has metadata directly on it (trait, instrument, category, etc.)
      // Use the response itself as the question data
      let question = response;

      // DEBUG: Log first response structure
      if (index === 0) {
        console.log('[NEURODIVERSITY] First response structure:', {
          questionId: response.questionId,
          trait: response.trait,
          instrument: response.instrument,
          category: response.category,
          subcategory: response.subcategory,
          hasText: !!response.text,
          keys: Object.keys(response).slice(0, 15)
        });
      }

      // If question lacks text metadata, populate from database
      // NOTE: We need text for keyword matching even if trait exists
      if (question.questionId && !question.text) {
        const dbQuestion = questionMap[question.questionId];

        if (index === 0) {
          console.log('[NEURODIVERSITY] Looking up questionId:', question.questionId);
          console.log('[NEURODIVERSITY] Found in DB:', !!dbQuestion);
        }

        if (dbQuestion) {
          // Merge DB data with response data
          question = {
            ...response,  // Start with response data (includes score, answer, etc.)
            questionId: dbQuestion.questionId,
            instrument: dbQuestion.instrument,
            category: dbQuestion.category,
            subcategory: dbQuestion.subcategory,
            text: dbQuestion.text,
            questionText: dbQuestion.questionText,
            trait: dbQuestion.trait,
            sensoryDomain: dbQuestion.sensoryDomain
          };

          if (index === 0) {
            console.log('[NEURODIVERSITY] Merged from DB:', {
              questionId: question.questionId,
              trait: question.trait,
              instrument: question.instrument
            });
          }
        }
      } else if (index === 0) {
        console.log('[NEURODIVERSITY] Using response data directly:', {
          questionId: question.questionId,
          trait: question.trait,
          instrument: question.instrument
        });
      }

      if (!question) return;

      const score = this.calculateResponseScore(response);

      // ADHD scoring
      if (question.instrument?.includes('ASRS') || question.subcategory === 'executive_function') {
        this.scoreADHDResponse(question, score, analysis.adhd);
      }

      // Autism spectrum scoring
      if (question.instrument?.includes('AQ') || question.subcategory === 'sensory_processing') {
        this.scoreAutismResponse(question, score, analysis.autism);
      }

      // Executive function scoring
      // EF correlates strongly with Conscientiousness and some Neuroticism questions
      const trait = (question?.trait || '').toLowerCase();
      const text = (question?.text || question?.questionText || '').toLowerCase();
      const questionId = (question?.questionId || '').toUpperCase();
      const category = (question?.category || '').toLowerCase();

      // DEBUG: Log all question data to diagnose EF detection
      console.log('[EF-CHECK]', {
        questionId,
        trait,
        instrument: question?.instrument,
        subcategory: question?.subcategory,
        category,
        textPreview: text.substring(0, 50)
      });

      const isExecutiveFunctionRelated =
        questionId.includes('EXECUTIVE') ||
        question.instrument?.includes('EXECUTIVE') ||
        question.subcategory === 'executive_function' ||
        category === 'executive_function' ||
        trait === 'conscientiousness' ||
        // Check for specific EF traits
        trait.includes('memory_compensation') ||
        trait.includes('task_resumption') ||
        trait.includes('planning') ||
        trait.includes('appointment_memory') ||
        trait.includes('cognitive_flexibility') ||
        trait.includes('organization') ||
        trait.includes('task_initiation') ||
        trait.includes('time_estimation') ||
        trait.includes('procrastination') ||
        trait.includes('punctuality') ||
        // Check for EF-related text
        text.includes('organized') ||
        text.includes('plan') ||
        text.includes('focus') ||
        text.includes('attention') ||
        text.includes('procrastinat') ||
        text.includes('forget') ||
        text.includes('complete task');

      console.log('[EF-RESULT]', isExecutiveFunctionRelated);

      if (isExecutiveFunctionRelated) {
        this.scoreExecutiveFunction(question, score, analysis.executiveFunction);
      }

      // Sensory processing scoring
      if (
        question.instrument?.includes('SENSORY') ||
        question.subcategory === 'sensory_processing'
      ) {
        this.scoreSensoryProfile(question, score, analysis.sensoryProfile);
      }

      // Masking behaviors scoring
      if (
        question.instrument?.includes('MASKING') ||
        question.text?.includes('mask') ||
        question.text?.includes('camouflage')
      ) {
        this.scoreMaskingBehaviors(question, score, analysis.maskingBehaviors);
      }
    });

    // Calculate severity levels and percentiles
    this.calculateSeverityLevels(analysis);
    this.calculatePercentiles(analysis);

    // CRITICAL FIX: Average EF domain scores (total / count)
    // Domains were accumulating totals but never being averaged!
    if (analysis.executiveFunction && analysis.executiveFunction.domains && analysis.executiveFunction.counts) {
      Object.keys(analysis.executiveFunction.domains).forEach(domain => {
        const total = analysis.executiveFunction.domains[domain];
        const count = analysis.executiveFunction.counts[domain] || 0;

        if (count > 0) {
          // Average the accumulated total
          analysis.executiveFunction.domains[domain] = Math.round(total / count);
          console.log(`[EF-AVERAGE] ${domain}: ${total} / ${count} = ${analysis.executiveFunction.domains[domain]}%`);
        } else {
          // No questions for this domain - set to null to indicate no data
          analysis.executiveFunction.domains[domain] = null;
          console.log(`[EF-AVERAGE] ${domain}: No questions answered (count=0), setting to null`);
        }
      });

      // Calculate overall EF score as average of non-null domains
      const validDomains = Object.values(analysis.executiveFunction.domains).filter(v => v !== null);
      if (validDomains.length > 0) {
        analysis.executiveFunction.overall = Math.round(
          validDomains.reduce((sum, score) => sum + score, 0) / validDomains.length
        );
        console.log(`[EF-AVERAGE] Overall: ${analysis.executiveFunction.overall}% (from ${validDomains.length} domains)`);
      }
    }

    // CRITICAL FIX: Average Sensory domain scores (total / count)
    // Same issue as EF - scores were accumulating but never being averaged!
    if (analysis.sensoryProfile) {
      const sensoryDomains = ['visual', 'auditory', 'tactile', 'vestibular', 'oral', 'olfactory'];
      sensoryDomains.forEach(domain => {
        const total = analysis.sensoryProfile[domain] || 0;
        const count = analysis.sensoryProfile[domain + 'Count'] || 0;

        if (count > 0) {
          // Average the accumulated score (scores are 1-5, so average will be 1-5 too)
          analysis.sensoryProfile[domain] = Math.round(total / count);
          console.log(`[SENSORY-AVERAGE] ${domain}: ${total} / ${count} = ${analysis.sensoryProfile[domain]}`);
        } else if (count === 0) {
          // No questions for this domain - set to 0
          analysis.sensoryProfile[domain] = 0;
          console.log(`[SENSORY-AVERAGE] ${domain}: No questions answered (count=0), setting to 0`);
        }
      });
    }

    // === VALIDATION & CONFIDENCE ASSESSMENT ===
    // Validate patterns with multi-indicator triangulation
    const adhdValidation = this.validateADHDPattern(
      analysis.adhd,
      analysis.executiveFunction,
      responses
    );
    const autismValidation = this.validateAutismPattern(
      analysis.autism,
      analysis.sensoryProfile,
      responses
    );
    const sensoryValidation = this.validateSensoryPattern(
      analysis.sensoryProfile,
      {
        auditoryCount: analysis.sensoryProfile.auditoryCount || 0,
        visualCount: analysis.sensoryProfile.visualCount || 0,
        tactileCount: analysis.sensoryProfile.tactileCount || 0,
        vestibularCount: analysis.sensoryProfile.vestibularCount || 0,
        oralCount: analysis.sensoryProfile.oralCount || 0,
        olfactoryCount: analysis.sensoryProfile.olfactoryCount || 0
      }
    );

    // Add validation metadata to analysis
    analysis.validation = {
      adhd: adhdValidation,
      autism: autismValidation,
      sensory: sensoryValidation
    };

    // Calculate confidence for executive function domains
    analysis.executiveFunction.domainConfidence = {};
    Object.entries(analysis.executiveFunction.domains).forEach(([domain, score]) => {
      const count = analysis.executiveFunction.counts?.[domain] || 0;
      const confidence = this.calculateConfidence(score, count);
      analysis.executiveFunction.domainConfidence[domain] = confidence;
    });

    // Calculate overall EF confidence
    const efTotalQuestions = Object.values(analysis.executiveFunction.counts || {})
      .reduce((sum, count) => sum + count, 0);
    analysis.executiveFunction.overallConfidence = this.calculateConfidence(
      analysis.executiveFunction.overall,
      efTotalQuestions
    );

    // Log confidence summary for debugging
    console.log('[Confidence] ADHD:', adhdValidation.confidence.level, '(' + adhdValidation.validatedIndicators + '/3 indicators)');
    console.log('[Confidence] Autism:', autismValidation.confidence.level, '(' + autismValidation.validatedIndicators + '/3 indicators)');
    console.log('[Confidence] Sensory:', sensoryValidation.valid ? sensoryValidation.confidence.level : 'insufficient');
    console.log('[Confidence] EF Overall:', analysis.executiveFunction.overallConfidence.level, '(' + efTotalQuestions + ' questions)');

    // Identify patterns and generate insights
    analysis.patterns = this.identifyNeurodiversityPatterns(analysis);
    analysis.insights = this.generateNeurodiversityInsights(analysis);
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  calculateResponseScore(response) {
    if (typeof response.value === 'number') {
      return response.value;
    }

    // Handle different response types
    const optionMap = {
      strongly_disagree: 1,
      disagree: 2,
      neutral: 3,
      agree: 4,
      strongly_agree: 5,
      never: 1,
      rarely: 2,
      sometimes: 3,
      often: 4,
      very_often: 5,
      yes: 5,
      no: 1
    };

    return optionMap[response.value] || 3;
  }

  scoreADHDResponse(question, score, adhdData) {
    // Handle different question formats - could be string or object
    const text = (question?.text || question?.questionText || '').toLowerCase();

    // Inattention indicators
    if (
      text.includes('attention') ||
      text.includes('focus') ||
      text.includes('concentrate') ||
      text.includes('distracted') ||
      text.includes('forget') ||
      text.includes('lose things')
    ) {
      adhdData.indicators.inattention += score > 3 ? score - 3 : 0;
    }

    // Hyperactivity indicators
    if (
      text.includes('restless') ||
      text.includes('fidget') ||
      text.includes('active') ||
      text.includes('energy') ||
      text.includes('sit still')
    ) {
      adhdData.indicators.hyperactivity += score > 3 ? score - 3 : 0;
    }

    // Impulsivity indicators
    if (
      text.includes('impuls') ||
      text.includes('interrupt') ||
      text.includes('wait') ||
      text.includes('blurt') ||
      text.includes('decision')
    ) {
      adhdData.indicators.impulsivity += score > 3 ? score - 3 : 0;
    }

    adhdData.score += score > 3 ? (score - 3) * 2 : 0;

    // Track specific traits
    if (score >= 4) {
      if (text.includes('hyperfocus')) adhdData.traits.push('hyperfocus');
      if (text.includes('time blind')) adhdData.traits.push('time_blindness');
      if (text.includes('rejection')) adhdData.traits.push('rejection_sensitivity');
    }
  }

  scoreAutismResponse(question, score, autismData) {
    // Handle different question formats - could be string or object
    const text = (question?.text || question?.questionText || '').toLowerCase();

    // Social communication
    if (
      text.includes('social') ||
      text.includes('eye contact') ||
      text.includes('conversation') ||
      text.includes('friend') ||
      text.includes('people')
    ) {
      autismData.indicators.social += score > 3 ? score - 3 : 0;
    }

    // Sensory processing
    if (
      text.includes('sensory') ||
      text.includes('sound') ||
      text.includes('light') ||
      text.includes('texture') ||
      text.includes('smell') ||
      text.includes('touch')
    ) {
      autismData.indicators.sensory += score > 3 ? score - 3 : 0;
    }

    // Routines and patterns
    if (
      text.includes('routine') ||
      text.includes('change') ||
      text.includes('same') ||
      text.includes('pattern') ||
      text.includes('predict')
    ) {
      autismData.indicators.routine += score > 3 ? score - 3 : 0;
    }

    // Communication style
    if (
      text.includes('literal') ||
      text.includes('sarcasm') ||
      text.includes('hint') ||
      text.includes('indirect') ||
      text.includes('nonverbal')
    ) {
      autismData.indicators.communication += score > 3 ? score - 3 : 0;
    }

    // Special interests
    if (
      text.includes('interest') ||
      text.includes('topic') ||
      text.includes('hobby') ||
      text.includes('passionate') ||
      text.includes('detail')
    ) {
      autismData.indicators.interests += score > 3 ? score - 3 : 0;
    }

    autismData.score += score > 3 ? (score - 3) * 2 : 0;

    // Track specific traits
    if (score >= 4) {
      if (text.includes('stimming') || text.includes('repetitive'))
        autismData.traits.push('stimming');
      if (text.includes('pattern')) autismData.traits.push('pattern_recognition');
      if (text.includes('detail')) autismData.traits.push('detail_oriented');
      if (text.includes('direct')) autismData.traits.push('direct_communication');
    }
  }

  scoreExecutiveFunction(question, score, efData) {
    // Handle different question formats - could be string or object
    const text = (question?.text || question?.questionText || '').toLowerCase();
    const trait = (question?.trait || '').toLowerCase();

    // DEBUG: Log executive function scoring
    console.log('[EF-DEBUG] Scoring:', {
      questionId: question?.questionId,
      text: text.substring(0, 50),
      score,
      trait: question?.trait
    });

    // Initialize counters if not present
    if (!efData.counts) {
      efData.counts = {
        planning: 0,
        organization: 0,
        timeManagement: 0,
        workingMemory: 0,
        emotionalRegulation: 0,
        taskInitiation: 0,
        sustainedAttention: 0,
        flexibility: 0
      };
    }

    // Use efDomain field if available, otherwise fall back to trait/keyword matching
    let domain = question.efDomain;

    if (!domain) {
      // First try trait-based mapping (preferred when metadata is available)
      const traitToDomainMap = {
        // Working Memory traits
        'memory_compensation': 'workingMemory',
        'appointment_memory': 'workingMemory',
        'working_memory': 'workingMemory',
        // Planning traits
        'planning': 'planning',
        'strategic_thinking': 'planning',
        // Organization traits
        'organization': 'organization',
        'organizational_skills': 'organization',
        // Time Management traits
        'time_estimation': 'timeManagement',
        'punctuality': 'timeManagement',
        'time_management': 'timeManagement',
        // Task Initiation traits
        'task_initiation': 'taskInitiation',
        'procrastination': 'taskInitiation',
        // Flexibility traits
        'cognitive_flexibility': 'flexibility',
        'task_resumption': 'flexibility',
        'adaptability': 'flexibility',
        // Sustained Attention traits
        'sustained_attention': 'sustainedAttention',
        'focus': 'sustainedAttention',
        'concentration': 'sustainedAttention',
        // Emotional Regulation traits
        'emotional_regulation': 'emotionalRegulation',
        'impulse_control': 'emotionalRegulation'
      };

      // Try trait mapping first
      if (trait && traitToDomainMap[trait]) {
        domain = traitToDomainMap[trait];
        console.log(`[EF-DEBUG] Mapped trait '${trait}' to domain '${domain}'`);
      }

      // If no trait match, fall back to keyword matching
      if (!domain) {
        const domainMap = {
          planning: ['plan', 'ahead', 'prepare', 'strategy', 'goal'],
          organization: ['organize', 'organized', 'sort', 'arrange', 'system', 'tidy', 'messy'],
          timeManagement: ['time', 'late', 'deadline', 'schedule', 'punctual'],
          workingMemory: ['remember', 'forget', 'memory', 'recall', 'mind'],
          emotionalRegulation: ['emotion', 'feeling', 'mood', 'upset', 'calm', 'control myself'],
          taskInitiation: ['start', 'begin', 'procrastinat', 'initiate', 'get going'],
          sustainedAttention: ['focus', 'attention', 'concentrate', 'maintain', 'distract'],
          flexibility: ['adapt', 'change', 'flexible', 'switch', 'routine']
        };

        // Try to match keywords in text
        for (const [key, keywords] of Object.entries(domainMap)) {
          if (keywords.some(keyword => text.includes(keyword))) {
            domain = key;
            console.log(`[EF-DEBUG] Mapped text keyword to domain '${domain}'`);
            break;
          }
        }
      }
    }

    if (!domain) {
      console.log('[EF-DEBUG] No domain matched for this question');
      return;
    }

    // Detect if question is negatively worded (needs reverse scoring)
    const isNegative = text.includes('not ') || text.includes('dis') ||
                       text.includes('lack') || text.includes('fail') ||
                       text.includes('unable') || text.includes('messy') ||
                       text.includes('forget') || text.includes('late') ||
                       text.includes('procrastinat') || text.includes('distract');

    // Normalize score to 0-100 scale (assuming 1-5 input scale)
    // For positive questions: 5 = 100, 1 = 0
    // For negative questions: 1 = 100, 5 = 0 (reverse)
    let normalizedScore;
    if (isNegative) {
      normalizedScore = ((6 - score) / 4) * 100; // Reverse score
    } else {
      normalizedScore = ((score - 1) / 4) * 100;
    }

    // Add score to the matched domain
    efData.domains[domain] += normalizedScore;
    efData.counts[domain]++;
    console.log(`[EF-DEBUG] Matched domain '${domain}', normalized score: ${normalizedScore}, new total: ${efData.domains[domain]}, count: ${efData.counts[domain]}`);

    // Calculate overall average (will be finalized in identifyNeurodiversityPatterns)
  }

  scoreSensoryProfile(question, score, sensoryData) {
    // Handle different question formats - could be string or object
    // Only use text/questionText fields, don't fall back to question object
    const text = (question?.text || question?.questionText || '').toLowerCase();
    const trait = (question?.trait || '').toLowerCase();
    const instrument = (question?.instrument || '').toLowerCase();

    // Initialize domain scores if not present
    if (!sensoryData.visual) sensoryData.visual = 0;
    if (!sensoryData.auditory) sensoryData.auditory = 0;
    if (!sensoryData.tactile) sensoryData.tactile = 0;
    if (!sensoryData.vestibular) sensoryData.vestibular = 0;
    if (!sensoryData.oral) sensoryData.oral = 0;
    if (!sensoryData.olfactory) sensoryData.olfactory = 0;

    // Check if this is a sensory question by instrument or category
    const isSensoryQuestion = instrument.includes('sensory') ||
                              (question?.category || '').toLowerCase().includes('neurodiversity');

    // Initialize counters for averaging
    if (!sensoryData.visualCount) sensoryData.visualCount = 0;
    if (!sensoryData.auditoryCount) sensoryData.auditoryCount = 0;
    if (!sensoryData.tactileCount) sensoryData.tactileCount = 0;
    if (!sensoryData.vestibularCount) sensoryData.vestibularCount = 0;
    if (!sensoryData.oralCount) sensoryData.oralCount = 0;
    if (!sensoryData.olfactoryCount) sensoryData.olfactoryCount = 0;

    // Use sensoryDomain field if available, otherwise fall back to keyword matching
    let domain = question.sensoryDomain;

    if (!domain) {
      // Fallback: keyword matching for questions without sensoryDomain
      // Visual sensitivity (light, colors, patterns)
      if (
        trait.includes('visual') ||
        text.includes('light') ||
        text.includes('bright') ||
        text.includes('fluorescent') ||
        text.includes('visual') ||
        text.includes('see') ||
        text.includes('color') ||
        text.includes('pattern') ||
        text.includes('picture frame')
      ) {
        domain = 'visual';
      }
      // Auditory sensitivity (sounds, noise)
      else if (
        trait.includes('auditory') ||
        text.includes('sound') ||
        text.includes('noise') ||
        text.includes('loud') ||
        text.includes('hear') ||
        text.includes('quiet') ||
        text.includes('headphone') ||
        text.includes('earplug') ||
        text.includes('crowd')
      ) {
        domain = 'auditory';
      }
      // Tactile sensitivity (touch, textures)
      else if (
        trait.includes('tactile') ||
        text.includes('touch') ||
        text.includes('texture') ||
        text.includes('fabric') ||
        text.includes('feel') ||
        text.includes('tag') ||
        text.includes('clothing') ||
        text.includes('soft') ||
        text.includes('rough') ||
        text.includes('hug')
      ) {
        domain = 'tactile';
      }
      // Vestibular/movement sensitivity
      else if (
        trait.includes('vestibular') ||
        text.includes('movement') ||
        text.includes('balance') ||
        text.includes('dizzy') ||
        text.includes('nauseous') ||
        text.includes('motion') ||
        text.includes('swing') ||
        text.includes('ride') ||
        text.includes('spin')
      ) {
        domain = 'vestibular';
      }
      // Oral/gustatory sensitivity (taste, oral)
      else if (
        trait.includes('gustatory') ||
        trait.includes('oral') ||
        text.includes('taste') ||
        text.includes('food') ||
        text.includes('diet') ||
        text.includes('eat') ||
        text.includes('oral') ||
        text.includes('mouth') ||
        text.includes('chew')
      ) {
        domain = 'oral';
      }
      // Olfactory sensitivity (smell)
      else if (
        trait.includes('olfactory') ||
        text.includes('smell') ||
        text.includes('odor') ||
        text.includes('scent') ||
        text.includes('fragrance') ||
        text.includes('perfume')
      ) {
        domain = 'olfactory';
      }
    }

    // Detect if question is negatively worded (needs reverse scoring)
    const isNegative = text.includes('not ') || text.includes('rarely') ||
                       text.includes('never') || text.includes('unable');

    // CRITICAL FIX: Normalize sensory score to 0-100 scale (like EF scores)
    // Input: 1-5 Likert scale
    // Output: 0-100 scale
    let normalizedScore;
    if (isNegative) {
      // Reverse score for negative questions
      normalizedScore = ((6 - score) / 4) * 100;
    } else {
      // Normal score
      normalizedScore = ((score - 1) / 4) * 100;
    }

    console.log(`[SENSORY-DEBUG] ${domain}: raw=${score}, normalized=${normalizedScore}, question="${text.substring(0, 50)}"`);

    // Add normalized score to the identified domain
    if (domain) {
      sensoryData[domain] += normalizedScore;
      sensoryData[domain + 'Count']++;
    }

    // General sensory sensitivity (still track these for overall patterns)
    if (text.includes('sensitive') || text.includes('overwhelm')) {
      sensoryData.sensitivity += score > 3 ? score - 3 : 0;
    }

    // Sensory avoidance
    if (text.includes('avoid') || text.includes('uncomfortable')) {
      sensoryData.avoidance += score > 3 ? score - 3 : 0;
    }

    // Sensory seeking
    if (text.includes('seek') || text.includes('crave') || text.includes('need')) {
      sensoryData.seeking += score > 3 ? score - 3 : 0;
    }

    // Low registration
    if (text.includes('notice') || text.includes('aware') || text.includes('miss')) {
      sensoryData.registration += score <= 2 ? 3 - score : 0;
    }

    // Identify patterns based on score thresholds (check for duplicates before adding)
    if (score >= 4) {
      if (text.includes('light') && !sensoryData.patterns.includes('light_sensitivity')) {
        sensoryData.patterns.push('light_sensitivity');
      }
      if (text.includes('sound') && !sensoryData.patterns.includes('sound_sensitivity')) {
        sensoryData.patterns.push('sound_sensitivity');
      }
      if (text.includes('texture') && !sensoryData.patterns.includes('texture_sensitivity')) {
        sensoryData.patterns.push('texture_sensitivity');
      }
      if (text.includes('smell') && !sensoryData.patterns.includes('smell_sensitivity')) {
        sensoryData.patterns.push('smell_sensitivity');
      }
      if (text.includes('movement') && !sensoryData.patterns.includes('movement_sensitivity')) {
        sensoryData.patterns.push('movement_sensitivity');
      }
      if (text.includes('taste') && !sensoryData.patterns.includes('taste_sensitivity')) {
        sensoryData.patterns.push('taste_sensitivity');
      }
    }
  }

  scoreMaskingBehaviors(question, score, maskingData) {
    // Handle different question formats - could be string or object
    const text = (question?.text || question?.questionText || '').toLowerCase();

    if (score >= 4) {
      maskingData.score += score - 3;

      // Identify specific masking behaviors
      if (text.includes('pretend') || text.includes('act')) {
        maskingData.indicators.push('social_camouflaging');
      }
      if (text.includes('copy') || text.includes('mimic')) {
        maskingData.indicators.push('behavioral_mimicry');
      }
      if (text.includes('hide') || text.includes('suppress')) {
        maskingData.indicators.push('trait_suppression');
      }
      if (text.includes('exhaust') || text.includes('tired')) {
        maskingData.indicators.push('masking_fatigue');
      }

      // Compensation strategies
      if (text.includes('script') || text.includes('prepare')) {
        maskingData.compensationStrategies.push('social_scripting');
      }
      if (text.includes('observe') || text.includes('watch')) {
        maskingData.compensationStrategies.push('social_observation');
      }
    }
  }

  calculateSeverityLevels(analysis) {
    // ADHD severity
    const adhdTotal =
      analysis.adhd.indicators.inattention +
      analysis.adhd.indicators.hyperactivity +
      analysis.adhd.indicators.impulsivity;

    if (adhdTotal >= 15) {
      analysis.adhd.severity = 'significant';
    } else if (adhdTotal >= 10) {
      analysis.adhd.severity = 'moderate';
    } else if (adhdTotal >= 5) {
      analysis.adhd.severity = 'mild';
    } else {
      analysis.adhd.severity = 'minimal';
    }

    // Autism spectrum indicators
    const autismTotal = Object.values(analysis.autism.indicators).reduce(
      (sum, val) => sum + val,
      0
    );

    if (autismTotal >= 20) {
      analysis.autism.severity = 'significant';
    } else if (autismTotal >= 12) {
      analysis.autism.severity = 'moderate';
    } else if (autismTotal >= 6) {
      analysis.autism.severity = 'mild';
    } else {
      analysis.autism.severity = 'minimal';
    }

    // Executive function assessment - normalize accumulated scores
    const efCounts = analysis.executiveFunction.counts || {};

    console.log('[EF-DEBUG] Normalizing executive function scores');
    console.log('[EF-DEBUG] Raw domains:', JSON.stringify(analysis.executiveFunction.domains));
    console.log('[EF-DEBUG] Counts:', JSON.stringify(efCounts));

    // Calculate average percentage for each domain
    Object.keys(analysis.executiveFunction.domains).forEach(domain => {
      const count = efCounts[domain] || 0;
      const rawTotal = analysis.executiveFunction.domains[domain];
      if (count > 0) {
        analysis.executiveFunction.domains[domain] =
          Math.round(analysis.executiveFunction.domains[domain] / count);
        console.log(`[EF-DEBUG] ${domain}: ${rawTotal} / ${count} = ${analysis.executiveFunction.domains[domain]}%`);
      } else {
        // No data for this domain - use 50% as neutral
        analysis.executiveFunction.domains[domain] = 50;
        console.log(`[EF-DEBUG] ${domain}: No data, defaulting to 50%`);
      }
    });

    // Calculate overall average from all domains
    const domainScores = Object.values(analysis.executiveFunction.domains);
    analysis.executiveFunction.overall = domainScores.length > 0
      ? Math.round(domainScores.reduce((sum, val) => sum + val, 0) / domainScores.length)
      : 50;

    // Clear existing arrays to ensure dynamic generation
    analysis.executiveFunction.strengths = [];
    analysis.executiveFunction.challenges = [];

    // Identify specific strengths and challenges based on individual domain scores
    Object.entries(analysis.executiveFunction.domains).forEach(([domain, score]) => {
      // Convert camelCase to readable format
      const readableDomain = domain
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .replace(/^./, str => str.toUpperCase())
        .trim();

      // Scores > 65 indicate strength, < 40 indicate challenges
      if (score >= 65) {
        analysis.executiveFunction.strengths.push(readableDomain);
      } else if (score <= 40) {
        analysis.executiveFunction.challenges.push(readableDomain);
      }
    });

    // Only add general assessments if no specific strengths/challenges found
    const efAverage = analysis.executiveFunction.overall;
    if (
      analysis.executiveFunction.strengths.length === 0 &&
      analysis.executiveFunction.challenges.length === 0
    ) {
      if (efAverage <= 40) {
        analysis.executiveFunction.challenges = ['Executive function support may be beneficial'];
      } else if (efAverage >= 65) {
        analysis.executiveFunction.strengths = ['Strong executive function overall'];
      }
    }
  }

  calculatePercentiles(analysis) {
    // ADHD percentiles based on population norms
    const adhdScore = analysis.adhd.score;
    if (adhdScore >= 20) {
      analysis.adhd.percentile = 95;
    } else if (adhdScore >= 15) {
      analysis.adhd.percentile = 85;
    } else if (adhdScore >= 10) {
      analysis.adhd.percentile = 70;
    } else if (adhdScore >= 5) {
      analysis.adhd.percentile = 50;
    } else {
      analysis.adhd.percentile = 30;
    }

    // Autism spectrum percentiles
    const autismScore = analysis.autism.score;
    if (autismScore >= 20) {
      analysis.autism.percentile = 95;
    } else if (autismScore >= 15) {
      analysis.autism.percentile = 85;
    } else if (autismScore >= 10) {
      analysis.autism.percentile = 70;
    } else if (autismScore >= 6) {
      analysis.autism.percentile = 50;
    } else {
      analysis.autism.percentile = 30;
    }
  }

  identifyNeurodiversityPatterns(analysis) {
    const patterns = [];

    // ADHD-Autism overlap
    if (analysis.adhd.severity !== 'minimal' && analysis.autism.severity !== 'minimal') {
      patterns.push({
        type: 'audhd',
        label: 'ADHD-Autism Co-occurrence',
        description: 'Shows traits of both ADHD and autism spectrum, which often co-occur',
        significance: 'high'
      });
    }

    // Executive function impact
    if (analysis.executiveFunction.challenges.length > 3) {
      patterns.push({
        type: 'executive_dysfunction',
        label: 'Executive Function Challenges',
        description: 'Multiple areas of executive function show difficulties',
        significance: 'moderate'
      });
    }

    // Sensory processing differences
    const sensoryTotal =
      analysis.sensoryProfile.sensitivity +
      analysis.sensoryProfile.avoidance +
      analysis.sensoryProfile.seeking;
    if (sensoryTotal > 10) {
      patterns.push({
        type: 'sensory_processing',
        label: 'Sensory Processing Differences',
        description: 'Significant sensory processing variations from typical patterns',
        significance: 'moderate'
      });
    }

    // Masking and compensation
    if (analysis.maskingBehaviors.score > 5) {
      patterns.push({
        type: 'masking',
        label: 'Masking/Camouflaging Behaviors',
        description: 'Tendency to mask or hide neurodivergent traits in social situations',
        significance: 'high'
      });
    }

    // Twice-exceptional indicators
    if (
      analysis.executiveFunction.strengths.includes('pattern_recognition') &&
      analysis.executiveFunction.challenges.includes('organization')
    ) {
      patterns.push({
        type: 'twice_exceptional',
        label: 'Twice-Exceptional Profile',
        description:
          'Combination of strengths and challenges suggesting giftedness with neurodivergence',
        significance: 'moderate'
      });
    }

    return patterns;
  }

  generateNeurodiversityInsights(analysis) {
    const insights = [];

    // ADHD insights
    if (analysis.adhd.severity === 'significant' || analysis.adhd.severity === 'moderate') {
      insights.push({
        category: 'ADHD Indicators',
        points: [
          `Inattention score: ${analysis.adhd.indicators.inattention}/10 - ${this.getInattentionDescription(analysis.adhd.indicators.inattention)}`,
          `Hyperactivity score: ${analysis.adhd.indicators.hyperactivity}/10 - ${this.getHyperactivityDescription(analysis.adhd.indicators.hyperactivity)}`,
          analysis.adhd.traits.includes('hyperfocus')
            ? 'Shows capacity for hyperfocus on areas of interest'
            : null,
          analysis.adhd.traits.includes('rejection_sensitivity')
            ? 'May experience rejection sensitive dysphoria'
            : null
        ].filter(Boolean)
      });
    }

    // Autism spectrum insights
    if (analysis.autism.severity === 'significant' || analysis.autism.severity === 'moderate') {
      insights.push({
        category: 'Autism Spectrum Indicators',
        points: [
          `Social communication differences: ${this.getSocialDescription(analysis.autism.indicators.social)}`,
          `Sensory processing variations: ${this.getSensoryDescription(analysis.autism.indicators.sensory)}`,
          analysis.autism.traits.includes('pattern_recognition')
            ? 'Strong pattern recognition abilities'
            : null,
          analysis.autism.traits.includes('detail_oriented')
            ? 'Exceptional attention to detail'
            : null,
          analysis.autism.indicators.routine > 3
            ? 'Preference for routine and predictability'
            : null
        ].filter(Boolean)
      });
    }

    // Executive function insights
    if (analysis.executiveFunction.challenges.length > 0) {
      insights.push({
        category: 'Executive Function Profile',
        points: [
          `Strengths: ${analysis.executiveFunction.strengths.length > 0 ? analysis.executiveFunction.strengths.join(', ') : 'developing'}`,
          `Areas for support: ${analysis.executiveFunction.challenges.join(', ')}`,
          'Consider executive function coaching or strategies'
        ]
      });
    }

    // Sensory processing insights - detailed analysis
    const sensoryDomains = analysis.sensoryProfile;
    const sensoryInsights = [];
    const sensoryRecommendations = [];

    // Check each sensory domain for notable patterns
    if (sensoryDomains.visual > 0) {
      const visualLevel = this.interpretSensoryScore(sensoryDomains.visual);
      if (visualLevel !== 'typical') {
        sensoryInsights.push(`Visual ${visualLevel}: ${this.getSensoryDomainDescription('visual', visualLevel)}`);
        sensoryRecommendations.push(...this.getSensoryRecommendations('visual', visualLevel));
      }
    }

    if (sensoryDomains.auditory > 0) {
      const auditoryLevel = this.interpretSensoryScore(sensoryDomains.auditory);
      if (auditoryLevel !== 'typical') {
        sensoryInsights.push(`Auditory ${auditoryLevel}: ${this.getSensoryDomainDescription('auditory', auditoryLevel)}`);
        sensoryRecommendations.push(...this.getSensoryRecommendations('auditory', auditoryLevel));
      }
    }

    if (sensoryDomains.tactile > 0) {
      const tactileLevel = this.interpretSensoryScore(sensoryDomains.tactile);
      if (tactileLevel !== 'typical') {
        sensoryInsights.push(`Tactile ${tactileLevel}: ${this.getSensoryDomainDescription('tactile', tactileLevel)}`);
        sensoryRecommendations.push(...this.getSensoryRecommendations('tactile', tactileLevel));
      }
    }

    if (sensoryDomains.vestibular > 0) {
      const vestibularLevel = this.interpretSensoryScore(sensoryDomains.vestibular);
      if (vestibularLevel !== 'typical') {
        sensoryInsights.push(`Vestibular ${vestibularLevel}: ${this.getSensoryDomainDescription('vestibular', vestibularLevel)}`);
        sensoryRecommendations.push(...this.getSensoryRecommendations('vestibular', vestibularLevel));
      }
    }

    if (sensoryDomains.oral > 0) {
      const oralLevel = this.interpretSensoryScore(sensoryDomains.oral);
      if (oralLevel !== 'typical') {
        sensoryInsights.push(`Oral/taste ${oralLevel}: ${this.getSensoryDomainDescription('oral', oralLevel)}`);
        sensoryRecommendations.push(...this.getSensoryRecommendations('oral', oralLevel));
      }
    }

    if (sensoryDomains.olfactory > 0) {
      const olfactoryLevel = this.interpretSensoryScore(sensoryDomains.olfactory);
      if (olfactoryLevel !== 'typical') {
        sensoryInsights.push(`Olfactory ${olfactoryLevel}: ${this.getSensoryDomainDescription('olfactory', olfactoryLevel)}`);
        sensoryRecommendations.push(...this.getSensoryRecommendations('olfactory', olfactoryLevel));
      }
    }

    // Add sensory insights if any were identified
    if (sensoryInsights.length > 0) {
      insights.push({
        category: 'Sensory Processing Profile',
        points: [
          ...sensoryInsights,
          sensoryRecommendations.length > 0 ? '\nRecommendations:' : null,
          ...sensoryRecommendations
        ].filter(Boolean)
      });
    }

    // Masking insights
    if (analysis.maskingBehaviors.score > 5) {
      insights.push({
        category: 'Masking and Compensation',
        points: [
          'Shows signs of masking or camouflaging behaviors',
          `Strategies used: ${analysis.maskingBehaviors.compensationStrategies.join(', ') || 'various'}`,
          'May experience increased fatigue from masking efforts',
          'Creating safe spaces to unmask is important for wellbeing'
        ]
      });
    }

    return insights;
  }

  getInattentionDescription(score) {
    if (score >= 8) return 'Significant challenges with sustained attention and focus';
    if (score >= 5) return 'Moderate difficulties maintaining attention';
    if (score >= 3) return 'Some attention regulation challenges';
    return 'Minimal attention difficulties';
  }

  getHyperactivityDescription(score) {
    if (score >= 8) return 'High levels of physical or mental restlessness';
    if (score >= 5) return 'Moderate hyperactivity or inner restlessness';
    if (score >= 3) return 'Some hyperactive tendencies';
    return 'Typical activity levels';
  }

  getSocialDescription(score) {
    if (score >= 8) return 'Significant differences in social communication style';
    if (score >= 5) return 'Moderate social communication variations';
    if (score >= 3) return 'Some social interaction differences';
    return 'Typical social communication patterns';
  }

  getSensoryDescription(score) {
    if (score >= 8) return 'Significant sensory processing differences';
    if (score >= 5) return 'Moderate sensory sensitivities';
    if (score >= 3) return 'Some sensory processing variations';
    return 'Typical sensory processing';
  }

  // New sensory insight helper methods
  interpretSensoryScore(score) {
    // UPDATED: Scores now on 0-100 scale (normalized from 1-5 Likert)
    // Aligned with score-interpretation.js thresholds for consistency
    if (score >= 75) return 'extreme-sensitivity';       // Score 75-100: Extreme/Very High sensitivity
    if (score >= 60) return 'high-sensitivity';          // Score 60-74: High/Significant sensitivity
    if (score >= 40) return 'moderate-sensitivity';      // Score 40-59: Moderate-High sensitivity
    if (score >= 20) return 'mild-sensitivity';          // Score 20-39: Mild sensitivity
    if (score >= 5) return 'minimal-sensitivity';        // Score 5-19: Minimal differences
    if (score > 0) return 'typical';                     // Score 1-4: Typical with some data
    return 'no-data';                                    // Score 0: No sensory data
  }

  getSensoryDomainDescription(domain, level) {
    const descriptions = {
      visual: {
        'extreme-sensitivity': 'Very heightened sensitivity to lights, colors, patterns, or visual clutter; significant impact on daily functioning',
        'high-sensitivity': 'Heightened sensitivity to lights, colors, patterns, or visual clutter',
        'moderate-sensitivity': 'Noticeable sensitivity to visual stimulation in certain situations',
        'mild-sensitivity': 'Some sensitivity to visual stimulation, particularly in busy environments',
        'minimal-sensitivity': 'Slight awareness of visual sensitivities in specific contexts',
        'typical': 'Visual processing within typical range',
        'hypo-sensitivity': 'May seek out visual stimulation, prefer bright colors or busy environments'
      },
      auditory: {
        'extreme-sensitivity': 'Very heightened sensitivity to sounds; background noise frequently overwhelming; significant impact on daily life',
        'high-sensitivity': 'Increased sensitivity to sounds; may find background noise overwhelming',
        'moderate-sensitivity': 'Noticeable sensitivity to sounds, particularly in louder environments',
        'mild-sensitivity': 'Some sensitivity to sounds or noise in certain situations',
        'minimal-sensitivity': 'Slight awareness of sound sensitivities in specific contexts',
        'typical': 'Auditory processing within typical range',
        'hypo-sensitivity': 'May seek out louder environments or have difficulty hearing subtle sounds'
      },
      tactile: {
        'extreme-sensitivity': 'Very heightened awareness of touch, textures, clothing tags, or temperature; significant daily impact',
        'high-sensitivity': 'Heightened awareness of touch, textures, clothing tags, or temperature',
        'moderate-sensitivity': 'Noticeable tactile sensitivities to certain textures or materials',
        'mild-sensitivity': 'Some tactile sensitivities in specific situations',
        'minimal-sensitivity': 'Slight awareness of tactile preferences',
        'typical': 'Tactile processing within typical range',
        'hypo-sensitivity': 'May seek out strong tactile input or have reduced sensitivity to touch'
      },
      vestibular: {
        'extreme-sensitivity': 'Very sensitive to movement, heights, or position changes; significantly impacts activities',
        'high-sensitivity': 'May be sensitive to movement, heights, or changes in head position',
        'moderate-sensitivity': 'Noticeable sensitivity to movement or balance challenges',
        'mild-sensitivity': 'Some sensitivity to movement in certain situations',
        'minimal-sensitivity': 'Slight awareness of movement sensitivities',
        'typical': 'Vestibular processing within typical range',
        'hypo-sensitivity': 'May seek out movement activities like spinning, swinging, or rocking'
      },
      oral: {
        'extreme-sensitivity': 'Very heightened sensitivity to food textures, temperatures, or tastes; significantly limits food choices',
        'high-sensitivity': 'Heightened sensitivity to food textures, temperatures, or tastes',
        'moderate-sensitivity': 'Noticeable preferences for certain food textures or temperatures',
        'mild-sensitivity': 'Some oral sensitivities to specific textures or tastes',
        'minimal-sensitivity': 'Slight awareness of food texture or taste preferences',
        'typical': 'Oral/gustatory processing within typical range',
        'hypo-sensitivity': 'May seek strong flavors, crunchy foods, or enjoy chewing/mouthing objects'
      },
      olfactory: {
        'extreme-sensitivity': 'Very heightened sensitivity to smells; scents frequently overwhelming; significant daily impact',
        'high-sensitivity': 'Heightened sensitivity to smells; may find certain scents overwhelming',
        'moderate-sensitivity': 'Noticeable sensitivity to stronger scents or fragrances',
        'mild-sensitivity': 'Some sensitivity to scents in certain situations',
        'minimal-sensitivity': 'Slight awareness of scent sensitivities',
        'typical': 'Olfactory processing within typical range',
        'hypo-sensitivity': 'May seek out strong scents or have difficulty detecting subtle odors'
      }
    };

    return descriptions[domain]?.[level] || `${level} in ${domain} processing`;
  }

  getSensoryRecommendations(domain, level) {
    const recommendations = {
      visual: {
        'extreme-sensitivity': [
          '• Use softer lighting or lamps instead of overhead fluorescent lights',
          '• Wear sunglasses or tinted lenses in bright environments',
          '• Minimize visual clutter in living/working spaces',
          '• Take frequent breaks from screens and busy visual environments',
          '• Consider professional occupational therapy for sensory integration',
          '• Discuss accommodations with employers/educators for lighting adjustments'
        ],
        'high-sensitivity': [
          '• Use softer lighting or lamps instead of overhead fluorescent lights',
          '• Wear sunglasses or tinted lenses in bright environments',
          '• Minimize visual clutter in living/working spaces',
          '• Take breaks from screens and busy visual environments'
        ],
        'moderate-sensitivity': [
          '• Consider adjustable lighting options',
          '• Take regular screen breaks',
          '• Notice which visual environments feel most comfortable',
          '• Reduce visual clutter in frequently used spaces'
        ],
        'mild-sensitivity': [
          '• Be aware of visual comfort in different environments',
          '• Adjust lighting when possible to suit your preferences',
          '• Take screen breaks as needed'
        ],
        'minimal-sensitivity': [
          '• Notice which visual environments you find most comfortable'
        ],
        'hypo-sensitivity': [
          '• Incorporate colorful decorations or visual interests',
          '• Use visual timers and schedules',
          '• Engage in visually stimulating activities safely'
        ]
      },
      auditory: {
        'extreme-sensitivity': [
          '• Use noise-canceling headphones or earplugs in loud environments',
          '• Create quiet spaces for work and rest',
          '• Communicate needs for reduced auditory stimulation',
          '• Consider white noise machines to mask unpredictable sounds',
          '• Seek professional occupational therapy for sensory integration strategies',
          '• Discuss workplace/educational accommodations for quiet spaces'
        ],
        'high-sensitivity': [
          '• Use noise-canceling headphones or earplugs in loud environments',
          '• Create quiet spaces for work and rest',
          '• Communicate needs for reduced auditory stimulation',
          '• Consider white noise machines to mask unpredictable sounds'
        ],
        'moderate-sensitivity': [
          '• Have headphones available for louder environments',
          '• Take breaks from noisy situations when needed',
          '• Communicate preferences for quieter settings',
          '• Use white noise or calming sounds to aid concentration'
        ],
        'mild-sensitivity': [
          '• Be aware of noise levels in your environment',
          '• Have headphones available when needed',
          '• Seek quieter spaces when feeling overwhelmed'
        ],
        'minimal-sensitivity': [
          '• Notice which sound environments you find most comfortable'
        ],
        'hypo-sensitivity': [
          '• Use background music to aid concentration',
          '• Engage in music or sound-based activities',
          '• May benefit from verbal reminders and auditory cues'
        ]
      },
      tactile: {
        'extreme-sensitivity': [
          '• Choose soft, comfortable clothing without tags',
          '• Use seamless socks and gentle fabrics',
          '• Communicate touch preferences to others',
          '• Explore different textures to identify comfortable ones',
          '• Consider professional occupational therapy for desensitization strategies',
          '• Discuss accommodations for tactile sensitivities in work/school settings'
        ],
        'high-sensitivity': [
          '• Choose soft, comfortable clothing without tags',
          '• Use seamless socks and gentle fabrics',
          '• Communicate touch preferences to others',
          '• Explore different textures to identify comfortable ones'
        ],
        'moderate-sensitivity': [
          '• Pay attention to fabric comfort',
          '• Remove clothing tags when they bother you',
          '• Choose comfortable textures for frequently used items',
          '• Communicate tactile preferences to close contacts'
        ],
        'mild-sensitivity': [
          '• Be aware of fabric and texture preferences',
          '• Choose comfortable clothing when possible',
          '• Notice which textures you find pleasant or unpleasant'
        ],
        'minimal-sensitivity': [
          '• Notice which textures and materials you prefer'
        ],
        'hypo-sensitivity': [
          '• Incorporate tactile activities (fidgets, textured objects)',
          '• Engage in activities with varied textures',
          '• Use weighted blankets or compression clothing if helpful'
        ]
      },
      vestibular: {
        'extreme-sensitivity': [
          '• Move slowly and deliberately when changing positions',
          '• Avoid heights or rapid movements if uncomfortable',
          '• Practice grounding techniques',
          '• Communicate needs during group activities involving movement',
          '• Seek professional occupational therapy for vestibular integration',
          '• Discuss accommodations for movement-based activities'
        ],
        'high-sensitivity': [
          '• Move slowly and deliberately when changing positions',
          '• Avoid heights or rapid movements if uncomfortable',
          '• Practice grounding techniques',
          '• Communicate needs during group activities involving movement'
        ],
        'moderate-sensitivity': [
          '• Take your time with position changes',
          '• Be mindful in high-movement situations',
          '• Find your comfortable pace for movement activities',
          '• Practice balance and grounding exercises'
        ],
        'mild-sensitivity': [
          '• Be aware of how movement affects you',
          '• Move at a comfortable pace for you',
          '• Notice which movement activities you find pleasant or challenging'
        ],
        'minimal-sensitivity': [
          '• Notice your preferences for movement and balance activities'
        ],
        'hypo-sensitivity': [
          '• Incorporate regular movement breaks',
          '• Engage in activities like swinging, spinning, or rocking',
          '• Consider standing desks or active seating',
          '• Use movement-based stress regulation techniques'
        ]
      },
      oral: {
        'extreme-sensitivity': [
          '• Keep safe foods available',
          '• Introduce new foods gradually with support',
          '• Respect texture and temperature preferences',
          '• Work with understanding dietitians or feeding therapists',
          '• Consider professional occupational therapy for oral sensitivities',
          '• Ensure adequate nutrition despite limitations'
        ],
        'high-sensitivity': [
          '• Keep safe foods available',
          '• Introduce new foods gradually',
          '• Respect texture and temperature preferences',
          '• Work with understanding dietitians if needed'
        ],
        'moderate-sensitivity': [
          '• Honor food texture preferences',
          '• Introduce new foods at your own pace',
          '• Keep preferred foods accessible',
          '• Experiment with new foods in low-pressure settings'
        ],
        'mild-sensitivity': [
          '• Be aware of your food texture and taste preferences',
          '• Introduce new foods gradually if desired',
          '• Notice which textures and temperatures you prefer'
        ],
        'minimal-sensitivity': [
          '• Notice your food preferences and patterns'
        ],
        'hypo-sensitivity': [
          '• Provide crunchy or chewy snacks',
          '• Offer chewable fidgets if helpful',
          '• Explore varied textures and flavors safely'
        ]
      },
      olfactory: {
        'extreme-sensitivity': [
          '• Use fragrance-free products exclusively',
          '• Avoid strong-smelling environments when possible',
          '• Communicate scent sensitivities to others',
          '• Keep windows open for fresh air when feasible',
          '• Consider professional support for managing severe sensitivities',
          '• Discuss scent-free policies at work/school'
        ],
        'high-sensitivity': [
          '• Use fragrance-free products',
          '• Avoid strong-smelling environments when possible',
          '• Communicate scent sensitivities to others',
          '• Keep windows open for fresh air when feasible'
        ],
        'moderate-sensitivity': [
          '• Be mindful of strong scents',
          '• Choose lightly scented or unscented products',
          '• Ventilate spaces with strong odors',
          '• Communicate preferences for scent-free environments'
        ],
        'mild-sensitivity': [
          '• Be aware of your scent sensitivities',
          '• Choose lightly scented products when available',
          '• Notice which scents you find pleasant or overwhelming'
        ],
        'minimal-sensitivity': [
          '• Notice your scent preferences and sensitivities'
        ],
        'hypo-sensitivity': [
          '• Use scent as a grounding or alerting tool',
          '• Explore aromatherapy safely',
          '• May enjoy cooking or scent-based activities'
        ]
      }
    };

    return recommendations[domain]?.[level] || [];
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    // ADHD recommendations
    if (analysis.adhd.severity !== 'minimal') {
      recommendations.push({
        category: 'ADHD Management Strategies',
        suggestions: [
          'Consider professional ADHD assessment for formal diagnosis',
          'Explore time management tools and techniques (timers, calendars, reminders)',
          'Break large tasks into smaller, manageable steps',
          'Create structured routines and environments',
          'Consider body-doubling or accountability partners',
          analysis.adhd.traits.includes('hyperfocus')
            ? 'Leverage hyperfocus periods for important tasks'
            : null
        ].filter(Boolean)
      });
    }

    // Autism spectrum recommendations
    if (analysis.autism.severity !== 'minimal') {
      recommendations.push({
        category: 'Autism Spectrum Support',
        suggestions: [
          'Consider autism assessment by a qualified professional',
          'Create sensory-friendly environments when possible',
          'Use visual schedules and clear communication',
          'Build in time for special interests as self-care',
          'Connect with neurodivergent communities for support',
          analysis.autism.indicators.sensory > 5
            ? 'Explore sensory accommodations (noise-canceling headphones, fidgets, etc.)'
            : null
        ].filter(Boolean)
      });
    }

    // Executive function recommendations
    if (analysis.executiveFunction.challenges.length > 2) {
      recommendations.push({
        category: 'Executive Function Support',
        suggestions: [
          'Use external organization systems (apps, planners, lists)',
          'Set up environmental cues and reminders',
          'Practice breaking down complex tasks',
          'Consider executive function coaching',
          'Build in regular breaks and movement'
        ]
      });
    }

    // Masking recommendations
    if (analysis.maskingBehaviors.score > 5) {
      recommendations.push({
        category: 'Managing Masking',
        suggestions: [
          'Schedule regular "unmask" time for recovery',
          'Identify safe spaces and people where masking is not needed',
          'Practice self-advocacy for accommodations',
          'Monitor energy levels and burnout signs',
          'Consider therapy with neurodivergent-affirming practitioners'
        ]
      });
    }

    // General neurodiversity recommendations
    if (analysis.patterns.length > 0) {
      recommendations.push({
        category: 'General Neurodiversity Support',
        suggestions: [
          'Embrace neurodivergent identity and seek community',
          'Focus on strengths while accommodating challenges',
          'Advocate for needed accommodations at work/school',
          'Explore neurodivergent-affirming resources and support',
          'Remember that different does not mean less'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Calculate confidence level for a domain based on question count and score characteristics
   * @param {number} score - Domain score (0-100)
   * @param {number} questionCount - Number of questions answered for this domain
   * @param {Array} scoreVariance - Optional array of individual scores for variance calculation
   * @returns {Object} Confidence assessment with level and metadata
   */
  calculateConfidence(score, questionCount, scoreVariance = []) {
    // Base confidence from question count
    // Need at least 3 questions for any confidence, 5+ for high confidence
    let questionConfidence = 0;
    if (questionCount >= 5) {
      questionConfidence = 1.0;
    } else if (questionCount >= 3) {
      questionConfidence = 0.7;
    } else if (questionCount >= 2) {
      questionConfidence = 0.5;
    } else {
      questionConfidence = 0.3;
    }

    // Score confidence - extreme scores are more definitive than middle scores
    let scoreConfidence = 1.0;
    if (score >= 35 && score <= 65) {
      // Middle-range scores are less confident (could go either way)
      scoreConfidence = 0.7;
    }

    // Variance confidence - if we have individual scores, check consistency
    let varianceConfidence = 1.0;
    if (scoreVariance.length >= 3) {
      const mean = scoreVariance.reduce((a, b) => a + b, 0) / scoreVariance.length;
      const variance = scoreVariance.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / scoreVariance.length;
      const stdDev = Math.sqrt(variance);

      // High variance means inconsistent responses
      if (stdDev > 1.5) {
        varianceConfidence = 0.6;
      } else if (stdDev > 1.0) {
        varianceConfidence = 0.8;
      }
    }

    // Overall confidence is weighted average
    const overallConfidence = (questionConfidence * 0.5) + (scoreConfidence * 0.3) + (varianceConfidence * 0.2);

    // Determine confidence level
    let level, status;
    if (overallConfidence >= 0.8) {
      level = 'high';
      status = 'report';
    } else if (overallConfidence >= 0.6) {
      level = 'moderate';
      status = 'report_with_caveat';
    } else if (overallConfidence >= 0.4) {
      level = 'low';
      status = 'mention_insufficient';
    } else {
      level = 'insufficient';
      status = 'hide';
    }

    return {
      level,
      status,
      score: overallConfidence,
      questionCount,
      metadata: {
        questionConfidence,
        scoreConfidence,
        varianceConfidence
      }
    };
  }

  /**
   * Validate sensory pattern - require multiple domains with data
   * @param {Object} sensoryProfile - Sensory profile with domain scores
   * @param {Object} sensoryCounts - Count of questions per domain
   * @returns {Object|null} Validated sensory profile or null if insufficient
   */
  validateSensoryPattern(sensoryProfile, sensoryCounts = {}) {
    const domains = ['auditory', 'visual', 'tactile', 'vestibular', 'oral', 'olfactory'];

    // Count domains with sufficient data (at least 1 question answered)
    const domainsWithData = domains.filter(domain => {
      const count = sensoryCounts[domain + 'Count'] || 0;
      return count > 0;
    });

    // Need at least 3 sensory domains assessed to make meaningful conclusions
    if (domainsWithData.length < 3) {
      return {
        valid: false,
        reason: 'insufficient_domain_coverage',
        domainsAssessed: domainsWithData.length,
        message: 'Sensory processing not fully assessed - only ' + domainsWithData.length + ' of 6 domains evaluated'
      };
    }

    // Check if any domain shows clinically significant sensitivity
    // (average score >= 4 on 1-5 scale after averaging)
    const significantDomains = domains.filter(domain => {
      const count = sensoryCounts[domain + 'Count'] || 0;
      const rawScore = sensoryProfile[domain] || 0;
      const avgScore = count > 0 ? rawScore / count : 0;
      return avgScore >= 4;
    });

    // Calculate confidence for sensory pattern
    const totalQuestions = Object.values(sensoryCounts).reduce((sum, count) => sum + (count || 0), 0);
    const avgConfidence = this.calculateConfidence(
      significantDomains.length > 0 ? 75 : 50, // Higher if significant domains found
      totalQuestions
    );

    return {
      valid: true,
      confidence: avgConfidence,
      domainsAssessed: domainsWithData.length,
      significantDomains: significantDomains.length,
      pattern: significantDomains.length > 0 ? 'hyper-sensitivity' : 'typical',
      profile: sensoryProfile
    };
  }

  /**
   * Validate ADHD pattern with multi-indicator triangulation
   * @param {Object} adhdData - ADHD indicators
   * @param {Object} efData - Executive function data
   * @param {Array} responses - All responses for behavioral analysis
   * @returns {Object} Validation result with confidence
   */
  validateADHDPattern(adhdData, efData, responses) {
    const indicators = {
      executive: 0,
      behavioral: 0,
      functional: 0
    };

    // 1. Executive function challenges (2+ domains with score < 40)
    if (efData.domains) {
      const efChallenges = Object.values(efData.domains).filter(score => score < 40).length;
      if (efChallenges >= 2) indicators.executive = 1;
    }

    // 2. Behavioral indicators from ADHD scoring
    const behavioralScore = (adhdData.indicators.inattention || 0) + (adhdData.indicators.hyperactivity || 0);
    if (behavioralScore >= 4) indicators.behavioral = 1;

    // 3. Functional impact (self-reported difficulty in responses)
    const impactQuestions = responses.filter(r => {
      const text = (r.text || r.questionText || '').toLowerCase();
      return (text.includes('difficult') || text.includes('struggle') || text.includes('challenge')) &&
             (r.value >= 4); // High score on difficulty questions
    });
    if (impactQuestions.length >= 2) indicators.functional = 1;

    // Need at least 2 of 3 indicator types
    const validatedIndicators = Object.values(indicators).filter(v => v > 0).length;
    const valid = validatedIndicators >= 2;

    // Calculate confidence
    const totalEvidencePoints = Object.values(indicators).reduce((sum, v) => sum + v, 0);
    const confidenceScore = (totalEvidencePoints / 3) * 100;

    return {
      valid,
      confidence: this.calculateConfidence(confidenceScore, validatedIndicators + 2),
      indicators,
      validatedIndicators,
      recommendation: valid ? 'clinical_assessment' : validatedIndicators === 1 ? 'monitor' : 'no_indication'
    };
  }

  /**
   * Validate autism pattern with multi-indicator triangulation
   * @param {Object} autismData - Autism indicators
   * @param {Object} sensoryData - Sensory profile
   * @param {Array} responses - All responses
   * @returns {Object} Validation result with confidence
   */
  validateAutismPattern(autismData, sensoryData, responses) {
    const indicators = {
      social: 0,
      sensory: 0,
      patterns: 0
    };

    // 1. Social communication indicators
    if (autismData.indicators.social >= 3 || autismData.indicators.communication >= 3) {
      indicators.social = 1;
    }

    // 2. Sensory processing differences (2+ domains with significant scores)
    const sensoryValidation = this.validateSensoryPattern(sensoryData, {
      auditoryCount: sensoryData.auditoryCount,
      visualCount: sensoryData.visualCount,
      tactileCount: sensoryData.tactileCount,
      vestibularCount: sensoryData.vestibularCount,
      oralCount: sensoryData.oralCount,
      olfactoryCount: sensoryData.olfactoryCount
    });
    if (sensoryValidation.valid && sensoryValidation.significantDomains >= 2) {
      indicators.sensory = 1;
    }

    // 3. Pattern/routine preferences
    if (autismData.indicators.routine >= 2 || autismData.indicators.interests >= 2) {
      indicators.patterns = 1;
    }

    // Need at least 2 of 3 indicator types
    const validatedIndicators = Object.values(indicators).filter(v => v > 0).length;
    const valid = validatedIndicators >= 2;

    const totalEvidencePoints = Object.values(indicators).reduce((sum, v) => sum + v, 0);
    const confidenceScore = (totalEvidencePoints / 3) * 100;

    return {
      valid,
      confidence: this.calculateConfidence(confidenceScore, validatedIndicators + 2),
      indicators,
      validatedIndicators,
      recommendation: valid ? 'clinical_assessment' : validatedIndicators === 1 ? 'monitor' : 'no_indication'
    };
  }

  /**
   * Assess domain status for reporting
   * @param {string} domain - Domain name
   * @param {number} questionCount - Questions answered
   * @param {number} score - Domain score
   * @returns {Object} Status and display information
   */
  assessDomainStatus(domain, questionCount, score) {
    if (questionCount < 2) {
      return {
        status: 'insufficient_data',
        display: false,
        message: null
      };
    } else if (questionCount >= 4 && score < 30) {
      return {
        status: 'not_detected',
        display: true,
        confidence: 'high',
        message: 'No significant indicators detected in ' + domain
      };
    } else if (questionCount >= 4 && score > 70) {
      return {
        status: 'detected',
        display: true,
        confidence: 'high',
        message: null
      };
    } else if (questionCount >= 2 && (score < 35 || score > 65)) {
      return {
        status: score > 65 ? 'detected' : 'not_detected',
        display: true,
        confidence: 'moderate',
        message: 'Based on limited data (' + questionCount + ' questions)'
      };
    } else {
      // Inconclusive middle scores
      return {
        status: 'indeterminate',
        display: false,
        message: 'Results inconclusive for ' + domain
      };
    }
  }
}

module.exports = NeurodiversityScoring;
