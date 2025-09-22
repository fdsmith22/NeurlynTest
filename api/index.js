// Vercel serverless function wrapper for backend
module.exports = (req, res) => {
  // For now, just return a simple API response
  // In production, this would proxy to your backend.js
  res.status(200).json({
    message: 'Neurlyn API',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
};
