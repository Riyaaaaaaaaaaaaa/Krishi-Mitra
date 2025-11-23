const express = require('express');
const router = express.Router();
const soilDataService = require('../services/soilDataService');

/**
 * GET /api/soil-data/comprehensive
 * Get comprehensive soil data from all sources (Bhuvan, SoilGrids, IoT)
 * Query params: lat, lon
 */
router.get('/comprehensive', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude (lat) and longitude (lon) are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude or longitude'
      });
    }

    const soilData = await soilDataService.getComprehensiveSoilData(latitude, longitude);

    res.json(soilData);
  } catch (error) {
    console.error('Error fetching comprehensive soil data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch soil data',
      message: error.message
    });
  }
});

/**
 * GET /api/soil-data/location
 * Get soil data for a specific location (alias for /comprehensive)
 * Query params: lat, lon
 */
router.get('/location', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude (lat) and longitude (lon) are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude or longitude'
      });
    }

    const soilData = await soilDataService.getComprehensiveSoilData(latitude, longitude);

    res.json(soilData);
  } catch (error) {
    console.error('Error fetching soil data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch soil data'
    });
  }
});

/**
 * POST /api/soil-data/iot-sensor
 * Submit IoT sensor data and get merged soil information
 * Body: { lat, lon, sensorData: { n, p, k, ph, moisture, temperature, ... } }
 */
router.post('/iot-sensor', async (req, res) => {
  try {
    const { lat, lon, sensorData } = req.body;

    if (!lat || !lon || !sensorData) {
      return res.status(400).json({
        success: false,
        error: 'Latitude, longitude, and sensorData are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude or longitude'
      });
    }

    const soilData = await soilDataService.getComprehensiveSoilData(
      latitude,
      longitude,
      sensorData
    );

    res.json(soilData);
  } catch (error) {
    console.error('Error processing IoT sensor data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process IoT sensor data'
    });
  }
});

/**
 * GET /api/soil-data/bhuvan
 * Get soil data specifically from Bhuvan (ISRO) API
 * Query params: lat, lon
 */
router.get('/bhuvan', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const bhuvanData = await soilDataService.fetchBhuvanSoilData(
      parseFloat(lat),
      parseFloat(lon)
    );

    if (bhuvanData) {
      res.json({
        success: true,
        data: bhuvanData
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'No data available from Bhuvan API'
      });
    }
  } catch (error) {
    console.error('Error fetching Bhuvan data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Bhuvan data'
    });
  }
});

/**
 * GET /api/soil-data/soilgrids
 * Get soil data specifically from SoilGrids API
 * Query params: lat, lon
 */
router.get('/soilgrids', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const soilGridsData = await soilDataService.fetchSoilGridsData(
      parseFloat(lat),
      parseFloat(lon)
    );

    if (soilGridsData) {
      res.json({
        success: true,
        data: soilGridsData
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'No data available from SoilGrids API'
      });
    }
  } catch (error) {
    console.error('Error fetching SoilGrids data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch SoilGrids data'
    });
  }
});

module.exports = router;
