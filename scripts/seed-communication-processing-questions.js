#!/usr/bin/env node

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

// Communication Style Questions
const communicationQuestions = [
  // Direct vs Indirect
  {
    text: "I prefer to get straight to the point in conversations.",
    subcategory: "directness",
    domain: "communication_style"
  },
  {
    text: "I often hint at what I want rather than asking directly.",
    subcategory: "directness",
    domain: "communication_style",
    reverseScored: true
  },
  {
    text: "I appreciate when people are blunt and honest with me.",
    subcategory: "directness",
    domain: "communication_style"
  },

  // Formal vs Informal
  {
    text: "I adapt my communication style based on the formality of the situation.",
    subcategory: "formality",
    domain: "communication_style"
  },
  {
    text: "I prefer casual, relaxed communication even in professional settings.",
    subcategory: "formality",
    domain: "communication_style",
    reverseScored: true
  },

  // Expressive vs Reserved
  {
    text: "I use gestures and facial expressions frequently when speaking.",
    subcategory: "expressiveness",
    domain: "communication_style"
  },
  {
    text: "I keep my emotions out of professional communications.",
    subcategory: "expressiveness",
    domain: "communication_style",
    reverseScored: true
  },

  // Detail-oriented vs Big Picture
  {
    text: "I provide lots of context and details when explaining things.",
    subcategory: "detail_orientation",
    domain: "communication_style"
  },
  {
    text: "I focus on the main points and skip unnecessary details.",
    subcategory: "detail_orientation",
    domain: "communication_style",
    reverseScored: true
  },

  // Listening Style
  {
    text: "I listen more than I speak in most conversations.",
    subcategory: "listening",
    domain: "communication_style"
  },
  {
    text: "I often interrupt to share my thoughts before I forget them.",
    subcategory: "listening",
    domain: "communication_style",
    reverseScored: true
  },

  // Conflict Style
  {
    text: "I address conflicts directly as soon as they arise.",
    subcategory: "conflict",
    domain: "communication_style"
  },
  {
    text: "I avoid confrontation and hope conflicts resolve themselves.",
    subcategory: "conflict",
    domain: "communication_style",
    reverseScored: true
  },

  // Written vs Verbal
  {
    text: "I express myself better in writing than in spoken conversation.",
    subcategory: "medium_preference",
    domain: "communication_style"
  },
  {
    text: "I prefer face-to-face or phone conversations over written communication.",
    subcategory: "medium_preference",
    domain: "communication_style",
    reverseScored: true
  }
];

// Processing Style Questions
const processingQuestions = [
  // Sequential vs Random
  {
    text: "I need to understand things step-by-step in order.",
    subcategory: "sequential_processing",
    domain: "cognitive_style"
  },
  {
    text: "I can jump between different parts of a problem without losing track.",
    subcategory: "sequential_processing",
    domain: "cognitive_style",
    reverseScored: true
  },
  {
    text: "I create mental checklists and follow them systematically.",
    subcategory: "sequential_processing",
    domain: "cognitive_style"
  },

  // Concrete vs Abstract
  {
    text: "I understand concepts better through real-world examples.",
    subcategory: "concrete_thinking",
    domain: "cognitive_style"
  },
  {
    text: "I enjoy thinking about theoretical concepts and possibilities.",
    subcategory: "concrete_thinking",
    domain: "cognitive_style",
    reverseScored: true
  },
  {
    text: "I need to see or touch something to fully understand it.",
    subcategory: "concrete_thinking",
    domain: "cognitive_style"
  },

  // Visual vs Verbal Processing
  {
    text: "I think in pictures and images more than words.",
    subcategory: "visual_processing",
    domain: "cognitive_style"
  },
  {
    text: "I remember things better when I see them rather than hear them.",
    subcategory: "visual_processing",
    domain: "cognitive_style"
  },
  {
    text: "I prefer diagrams and charts over written explanations.",
    subcategory: "visual_processing",
    domain: "cognitive_style"
  },

  // Analytical vs Intuitive
  {
    text: "I rely on data and logic when making decisions.",
    subcategory: "analytical_thinking",
    domain: "cognitive_style"
  },
  {
    text: "I trust my gut feelings even without logical justification.",
    subcategory: "analytical_thinking",
    domain: "cognitive_style",
    reverseScored: true
  },
  {
    text: "I need to analyze all options before making a choice.",
    subcategory: "analytical_thinking",
    domain: "cognitive_style"
  },

  // Processing Speed
  {
    text: "I need time to process information before responding.",
    subcategory: "processing_speed",
    domain: "cognitive_style"
  },
  {
    text: "I can quickly understand and respond to new information.",
    subcategory: "processing_speed",
    domain: "cognitive_style",
    reverseScored: true
  },
  {
    text: "I prefer to think things through thoroughly rather than responding quickly.",
    subcategory: "processing_speed",
    domain: "cognitive_style"
  },

  // Global vs Detail Focus
  {
    text: "I see the big picture before noticing the details.",
    subcategory: "global_processing",
    domain: "cognitive_style"
  },
  {
    text: "I notice small details that others often miss.",
    subcategory: "global_processing",
    domain: "cognitive_style",
    reverseScored: true
  },
  {
    text: "I struggle with details when I don't understand the overall context.",
    subcategory: "global_processing",
    domain: "cognitive_style"
  }
];

// Decision-Making Style Questions
const decisionMakingQuestions = [
  {
    text: "I make decisions quickly once I have the key information.",
    subcategory: "decision_speed",
    domain: "decision_making"
  },
  {
    text: "I often second-guess my decisions after making them.",
    subcategory: "decision_confidence",
    domain: "decision_making",
    reverseScored: true
  },
  {
    text: "I consider how my decisions will affect others.",
    subcategory: "decision_consideration",
    domain: "decision_making"
  },
  {
    text: "I prefer to make decisions independently without input from others.",
    subcategory: "decision_independence",
    domain: "decision_making"
  },
  {
    text: "I rely heavily on past experiences when making decisions.",
    subcategory: "decision_basis",
    domain: "decision_making"
  }
];

// Stress Management Questions
const stressManagementQuestions = [
  {
    text: "I have effective strategies for managing stress.",
    subcategory: "stress_coping",
    domain: "stress_management"
  },
  {
    text: "Stress motivates me to perform better.",
    subcategory: "stress_response",
    domain: "stress_management"
  },
  {
    text: "I notice physical symptoms when I'm stressed (headaches, tension, etc.).",
    subcategory: "stress_awareness",
    domain: "stress_management"
  },
  {
    text: "I seek support from others when feeling overwhelmed.",
    subcategory: "stress_support",
    domain: "stress_management"
  },
  {
    text: "I can remain calm and focused even in high-pressure situations.",
    subcategory: "stress_resilience",
    domain: "stress_management"
  }
];

// Attachment Style Questions
const attachmentQuestions = [
  {
    text: "I find it easy to trust and depend on others.",
    subcategory: "secure_attachment",
    domain: "attachment_style"
  },
  {
    text: "I worry that people will abandon me.",
    subcategory: "anxious_attachment",
    domain: "attachment_style"
  },
  {
    text: "I prefer to keep emotional distance in relationships.",
    subcategory: "avoidant_attachment",
    domain: "attachment_style"
  },
  {
    text: "I am comfortable with closeness and intimacy.",
    subcategory: "secure_attachment",
    domain: "attachment_style"
  },
  {
    text: "I fear being too dependent on others.",
    subcategory: "avoidant_attachment",
    domain: "attachment_style"
  }
];

// Helper function to generate adaptive criteria
function getAdaptiveCriteria(domain, subcategory) {
  const baseScore = Math.random() * 20 + 40; // Random between 40-60

  return {
    triggerTraits: [
      {
        trait: domain === 'communication_style' ? 'extraversion' : 'openness',
        minScore: Math.max(20, baseScore - 20),
        maxScore: Math.min(80, baseScore + 20)
      }
    ],
    triggerPatterns: [`high_${subcategory}`, `low_${subcategory}`],
    followUpTo: [],
    incompatibleWith: [],
    requiredPrior: []
  };
}

// Helper function to format all questions
function formatAllQuestions() {
  const allQuestions = [];
  let questionId = 2000; // Start from 2000 to avoid conflicts

  // Format communication questions
  communicationQuestions.forEach((q, index) => {
    allQuestions.push({
      questionId: `COMM_STYLE_${questionId++}`,
      text: q.text,
      category: 'cognitive',
      instrument: 'NEURLYN_COMMUNICATION',
      trait: 'communication',
      subcategory: q.subcategory,
      domain: q.domain,
      responseType: 'likert',
      options: [
        { value: 1, label: 'Strongly Disagree', score: q.reverseScored ? 5 : 1 },
        { value: 2, label: 'Disagree', score: q.reverseScored ? 4 : 2 },
        { value: 3, label: 'Neutral', score: 3 },
        { value: 4, label: 'Agree', score: q.reverseScored ? 2 : 4 },
        { value: 5, label: 'Strongly Agree', score: q.reverseScored ? 1 : 5 }
      ],
      reverseScored: q.reverseScored || false,
      weight: 1.1,
      tier: 'comprehensive',
      adaptive: {
        isBaseline: false,
        adaptiveCriteria: getAdaptiveCriteria(q.domain, q.subcategory),
        correlatedTraits: ['extraversion', 'openness'],
        diagnosticWeight: 2,
        difficultyLevel: 2,
        discriminationIndex: 0.6
      },
      metadata: {
        scientificSource: 'Communication style assessment literature',
        validationStudy: 'Based on interpersonal communication research'
      },
      active: true
    });
  });

  // Format processing questions
  processingQuestions.forEach((q, index) => {
    allQuestions.push({
      questionId: `PROC_STYLE_${questionId++}`,
      text: q.text,
      category: 'cognitive',
      instrument: 'NEURLYN_PROCESSING',
      trait: 'processing',
      subcategory: q.subcategory,
      domain: q.domain,
      responseType: 'likert',
      options: [
        { value: 1, label: 'Strongly Disagree', score: q.reverseScored ? 5 : 1 },
        { value: 2, label: 'Disagree', score: q.reverseScored ? 4 : 2 },
        { value: 3, label: 'Neutral', score: 3 },
        { value: 4, label: 'Agree', score: q.reverseScored ? 2 : 4 },
        { value: 5, label: 'Strongly Agree', score: q.reverseScored ? 1 : 5 }
      ],
      reverseScored: q.reverseScored || false,
      weight: 1.1,
      tier: 'comprehensive',
      adaptive: {
        isBaseline: false,
        adaptiveCriteria: getAdaptiveCriteria(q.domain, q.subcategory),
        correlatedTraits: ['openness', 'conscientiousness'],
        diagnosticWeight: 2,
        difficultyLevel: 3,
        discriminationIndex: 0.65
      },
      metadata: {
        scientificSource: 'Cognitive style and learning theory',
        validationStudy: 'Based on information processing research'
      },
      active: true
    });
  });

  // Format decision-making questions
  decisionMakingQuestions.forEach((q, index) => {
    allQuestions.push({
      questionId: `DECISION_${questionId++}`,
      text: q.text,
      category: 'cognitive',
      instrument: 'NEURLYN_DECISION',
      trait: 'decision_making',
      subcategory: q.subcategory,
      domain: q.domain,
      responseType: 'likert',
      options: [
        { value: 1, label: 'Strongly Disagree', score: q.reverseScored ? 5 : 1 },
        { value: 2, label: 'Disagree', score: q.reverseScored ? 4 : 2 },
        { value: 3, label: 'Neutral', score: 3 },
        { value: 4, label: 'Agree', score: q.reverseScored ? 2 : 4 },
        { value: 5, label: 'Strongly Agree', score: q.reverseScored ? 1 : 5 }
      ],
      reverseScored: q.reverseScored || false,
      weight: 1.0,
      tier: 'comprehensive',
      adaptive: {
        isBaseline: false,
        adaptiveCriteria: getAdaptiveCriteria(q.domain, q.subcategory),
        correlatedTraits: ['conscientiousness', 'neuroticism'],
        diagnosticWeight: 2,
        difficultyLevel: 2,
        discriminationIndex: 0.55
      },
      metadata: {
        scientificSource: 'Decision-making psychology literature',
        validationStudy: 'Based on judgment and decision-making research'
      },
      active: true
    });
  });

  // Format stress management questions
  stressManagementQuestions.forEach((q, index) => {
    allQuestions.push({
      questionId: `STRESS_MGMT_${questionId++}`,
      text: q.text,
      category: 'personality',
      instrument: 'NEURLYN_STRESS',
      trait: 'stress_management',
      subcategory: q.subcategory,
      domain: q.domain,
      responseType: 'likert',
      options: [
        { value: 1, label: 'Strongly Disagree', score: q.reverseScored ? 5 : 1 },
        { value: 2, label: 'Disagree', score: q.reverseScored ? 4 : 2 },
        { value: 3, label: 'Neutral', score: 3 },
        { value: 4, label: 'Agree', score: q.reverseScored ? 2 : 4 },
        { value: 5, label: 'Strongly Agree', score: q.reverseScored ? 1 : 5 }
      ],
      reverseScored: q.reverseScored || false,
      weight: 1.2,
      tier: 'comprehensive',
      adaptive: {
        isBaseline: false,
        adaptiveCriteria: getAdaptiveCriteria(q.domain, q.subcategory),
        correlatedTraits: ['neuroticism', 'conscientiousness'],
        diagnosticWeight: 3,
        difficultyLevel: 2,
        discriminationIndex: 0.7
      },
      metadata: {
        scientificSource: 'Stress and coping research',
        validationStudy: 'Based on stress management scales'
      },
      active: true
    });
  });

  // Format attachment questions
  attachmentQuestions.forEach((q, index) => {
    allQuestions.push({
      questionId: `ATTACH_${questionId++}`,
      text: q.text,
      category: 'attachment',
      instrument: 'NEURLYN_ATTACHMENT',
      trait: 'attachment',
      subcategory: q.subcategory,
      domain: q.domain,
      responseType: 'likert',
      options: [
        { value: 1, label: 'Strongly Disagree', score: q.reverseScored ? 5 : 1 },
        { value: 2, label: 'Disagree', score: q.reverseScored ? 4 : 2 },
        { value: 3, label: 'Neutral', score: 3 },
        { value: 4, label: 'Agree', score: q.reverseScored ? 2 : 4 },
        { value: 5, label: 'Strongly Agree', score: q.reverseScored ? 1 : 5 }
      ],
      reverseScored: q.reverseScored || false,
      weight: 1.3,
      tier: 'comprehensive',
      adaptive: {
        isBaseline: false,
        adaptiveCriteria: getAdaptiveCriteria(q.domain, q.subcategory),
        correlatedTraits: ['agreeableness', 'neuroticism'],
        diagnosticWeight: 3,
        difficultyLevel: 3,
        discriminationIndex: 0.75
      },
      metadata: {
        scientificSource: 'Attachment theory (Bowlby, 1969; Ainsworth, 1978)',
        validationStudy: 'Based on adult attachment scales'
      },
      active: true
    });
  });

  return allQuestions;
}

async function seedCommunicationProcessingQuestions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Generate all questions
    const allQuestions = formatAllQuestions();
    console.log(`Generated ${allQuestions.length} communication, processing, and related questions`);

    // Count by category
    const categories = {};
    allQuestions.forEach(q => {
      const key = `${q.instrument} (${q.domain})`;
      categories[key] = (categories[key] || 0) + 1;
    });
    console.log('\nQuestion distribution:');
    Object.entries(categories).forEach(([key, count]) => {
      console.log(`  ${key}: ${count} questions`);
    });

    // Remove any existing questions with these IDs
    const deleteResult = await QuestionBank.deleteMany({
      questionId: { $regex: /^(COMM_STYLE_|PROC_STYLE_|DECISION_|STRESS_MGMT_|ATTACH_)/ }
    });
    console.log(`\nRemoved ${deleteResult.deletedCount} existing questions`);

    // Insert the new questions
    const result = await QuestionBank.insertMany(allQuestions);
    console.log(`Successfully inserted ${result.length} new questions`);

    // Verify the insertion
    const verifyCount = await QuestionBank.countDocuments({
      instrument: { $in: [
        'NEURLYN_COMMUNICATION',
        'NEURLYN_PROCESSING',
        'NEURLYN_DECISION',
        'NEURLYN_STRESS',
        'NEURLYN_ATTACHMENT'
      ]}
    });
    console.log(`\nVerification: ${verifyCount} questions in database`);

    console.log('\n✅ Communication, processing, and related questions seeded successfully!');

  } catch (error) {
    console.error('Error seeding questions:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding
if (require.main === module) {
  seedCommunicationProcessingQuestions();
}

module.exports = { formatAllQuestions, seedCommunicationProcessingQuestions };
