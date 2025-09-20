module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { tier = 'standard', concerns = [], demographics = {} } = req.body || {};

    // Generate questions based on tier
    const limits = {
      quick: 20,
      standard: 45,
      deep: 75
    };
    const totalQuestions = limits[tier] || 45;

    // Create sample adaptive questions
    const questions = [];
    const categories = [
      'self-awareness',
      'emotional-regulation',
      'social-dynamics',
      'cognitive-patterns',
      'behavioral-traits'
    ];

    for (let i = 0; i < totalQuestions; i++) {
      const category = categories[i % categories.length];
      questions.push({
        id: `adaptive_${i + 1}`,
        text: generateAdaptiveQuestion(category, i),
        responseType: 'scale',
        category: category,
        adaptiveWeight: Math.random() * 0.5 + 0.5,
        options: [
          { value: 1, label: 'Strongly Disagree' },
          { value: 2, label: 'Disagree' },
          { value: 3, label: 'Neutral' },
          { value: 4, label: 'Agree' },
          { value: 5, label: 'Strongly Agree' }
        ]
      });
    }

    res.status(200).json({
      success: true,
      questions: questions,
      totalQuestions: totalQuestions,
      tier,
      concerns,
      adaptiveMetadata: {
        version: '2.0',
        algorithm: 'enhanced-adaptive',
        personalization: true
      }
    });
  } catch (error) {
    console.error('Adaptive assessment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate adaptive assessment',
      message: error.message
    });
  }
};

function generateAdaptiveQuestion(category, index) {
  const questionBank = {
    'self-awareness': [
      'I am aware of my emotional triggers',
      'I understand my strengths and limitations',
      'I recognize patterns in my behavior',
      'I notice when my mood shifts',
      'I can identify what motivates me'
    ],
    'emotional-regulation': [
      'I can calm myself when feeling overwhelmed',
      'I manage stress effectively',
      'I express emotions appropriately',
      'I recover quickly from setbacks',
      'I maintain emotional balance under pressure'
    ],
    'social-dynamics': [
      'I pick up on social cues easily',
      'I adapt my communication style to different people',
      'I maintain healthy boundaries in relationships',
      'I feel comfortable in group settings',
      'I can read the emotional atmosphere of a room'
    ],
    'cognitive-patterns': [
      'I think through problems systematically',
      'I see connections others might miss',
      'I learn new concepts quickly',
      'I prefer concrete facts over abstract ideas',
      'I notice details that others overlook'
    ],
    'behavioral-traits': [
      'I follow through on commitments',
      'I organize my environment effectively',
      'I adapt easily to change',
      'I maintain consistent routines',
      'I act on impulse rather than planning'
    ]
  };

  const questions = questionBank[category] || questionBank['self-awareness'];
  return questions[index % questions.length];
}
