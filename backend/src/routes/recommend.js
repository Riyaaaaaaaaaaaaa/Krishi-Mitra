const express = require('express');
const axios = require('axios');
const router = express.Router();

// ML Service URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';

/**
 * POST /api/recommend
 * Get crop recommendation from ML model
 * 
 * Body:
 * {
 *   N: number (0-140),
 *   P: number (5-145),
 *   K: number (5-205),
 *   temperature: number (8-43),
 *   humidity: number (14-99),
 *   ph: number (3.5-9.9),
 *   rainfall: number (20-300),
 *   state: string (Punjab, Maharashtra, etc),
 *   season: string (Kharif, Rabi, Zaid, Year-round),
 *   soil_type: string (Clay, Loam, Sandy, Clay-Loam, Sandy-Loam),
 *   irrigation: string (Rainfed, Flood, Drip, Sprinkler),
 *   farm_size: string (Small, Medium, Large)
 * }
 */
router.post('/recommend', async (req, res) => {
  try {
    const { N, P, K, temperature, humidity, ph, rainfall, state, season, soil_type, irrigation, farm_size } = req.body;

    // Validate input
    if (!N || !P || !K || !temperature || !humidity || !ph || !rainfall || !state || !season || !soil_type || !irrigation || !farm_size) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: N, P, K, temperature, humidity, ph, rainfall, state, season, soil_type, irrigation, farm_size'
      });
    }

    // Call ML service
    console.log('📡 Calling ML service at:', ML_SERVICE_URL);
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, {
      N: parseFloat(N),
      P: parseFloat(P),
      K: parseFloat(K),
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      ph: parseFloat(ph),
      rainfall: parseFloat(rainfall),
      state: state,
      season: season,
      soil_type: soil_type,
      irrigation: irrigation,
      farm_size: farm_size
    }, {
      timeout: 10000 // 10 second timeout
    });

    if (!mlResponse.data || !mlResponse.data.success) {
      throw new Error('ML service returned invalid response');
    }

    // Format response for frontend
    const prediction = mlResponse.data.prediction;
    const recommendations = [
      {
        crop: prediction.crop,
        confidence: prediction.confidence,
        reason: `Optimal soil and climate conditions for ${prediction.crop}`,
        season: prediction.season,
        expectedYield: prediction.yield_estimate,
        profitMargin: prediction.profit_margin
      },
      ...(prediction.alternatives || []).map(alt => ({
        crop: alt.crop,
        confidence: alt.confidence,
        reason: `Good alternative with favorable conditions`,
        season: alt.season,
        expectedYield: alt.yield,
        profitMargin: alt.profit
      }))
    ].filter(rec => rec.confidence > 0.05); // Filter out crops with less than 5% confidence

    console.log(`✅ Recommendation: ${prediction.crop} (${(prediction.confidence * 100).toFixed(1)}%)`);

    res.json({
      success: true,
      recommendations,
      input: mlResponse.data.input,
      timestamp: mlResponse.data.timestamp
    });

  } catch (error) {
    console.error('❌ Recommendation error:', error.message);

    // Check if ML service is down
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        success: false,
        error: 'ML service is not available. Please ensure the Flask server is running on port 5001.',
        details: error.message
      });
    }

    // Return error response
    res.status(500).json({
      success: false,
      error: 'Failed to get crop recommendation',
      details: error.response?.data?.error || error.message
    });
  }
});

/**
 * GET /api/recommend/health
 * Check ML service health
 */
router.get('/recommend/health', async (req, res) => {
  try {
    const healthCheck = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 5000 });
    res.json({
      success: true,
      ml_service: healthCheck.data
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'ML service is not available',
      ml_service_url: ML_SERVICE_URL
    });
  }
});

module.exports = router;
