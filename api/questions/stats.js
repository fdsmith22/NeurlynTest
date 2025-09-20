module.exports = function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Return question statistics
  res.status(200).json({
    total: 450,
    categories: {
      personality: 150,
      cognitive: 75,
      emotional: 75,
      behavioral: 75,
      neurodiversity: 75
    },
    validated: {
      bigFive: 50,
      hexaco: 60,
      custom: 340
    },
    instruments: [
      { name: 'Big Five', questions: 50, validated: true },
      { name: 'HEXACO', questions: 60, validated: true },
      { name: 'Custom Adaptive', questions: 340, validated: false }
    ],
    lastUpdated: new Date().toISOString()
  });
};
