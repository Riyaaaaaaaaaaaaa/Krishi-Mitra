const express = require('express');
const axios = require('axios');
const Alert = require('../models/Alert');
const router = express.Router();

// Agmarknet API Configuration
const AGMARKNET_BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const API_KEY = process.env.AGMARKNET_API_KEY || 'your_api_key_here'; // Get from data.gov.in

// Crop name mapping (English to Agmarknet names)
const cropMapping = {
  'Rice': 'Paddy(Dhan)(Common)',
  'Wheat': 'Wheat',
  'Cotton': 'Cotton',
  'Maize': 'Maize',
  'Soybean': 'Soyabean',
  'Chickpea': 'Gram(Whole)',
  'Kidneybeans': 'Rajmah(Beans)',
  'Pigeonpeas': 'Arhar (Tur/Red Gram)(Whole)',
  'Mothbeans': 'Moth(Mataki)',
  'Mungbean': 'Moong(Green Gram)',
  'Blackgram': 'Urad(Black Gram)',
  'Lentil': 'Masur(Lentil)',
  'Pomegranate': 'Pomegranate',
  'Banana': 'Banana',
  'Mango': 'Mango',
  'Grapes': 'Grapes',
  'Watermelon': 'Water Melon',
  'Muskmelon': 'Musk Melon',
  'Apple': 'Apple',
  'Orange': 'Orange',
  'Papaya': 'Papaya',
  'Coconut': 'Coconut'
};

// Mock data - Replace with actual database queries or API calls
const mockPrices = [
  { id: 1, crop: 'Rice', price: 2100, msp: 2040, change: +5.2, state: 'Jharkhand', district: 'Ranchi', market: 'Ranchi Mandi', lastUpdated: '2 hours ago', trend: 'up' },
  { id: 2, crop: 'Wheat', price: 2250, msp: 2275, change: -2.1, state: 'Bihar', district: 'Patna', market: 'Patna Mandi', lastUpdated: '1 hour ago', trend: 'down' },
  { id: 3, crop: 'Cotton', price: 6500, msp: 6080, change: +8.5, state: 'Maharashtra', district: 'Mumbai', market: 'Mumbai Mandi', lastUpdated: '3 hours ago', trend: 'up' },
  { id: 4, crop: 'Maize', price: 1800, msp: 1962, change: +1.2, state: 'Delhi', district: 'Delhi', market: 'Delhi Mandi', lastUpdated: '4 hours ago', trend: 'up' },
  { id: 5, crop: 'Soybean', price: 4200, msp: 4300, change: -3.5, state: 'Madhya Pradesh', district: 'Indore', market: 'Indore Mandi', lastUpdated: '2 hours ago', trend: 'down' },
  { id: 6, crop: 'Chickpea', price: 5100, msp: 5335, change: +4.8, state: 'Rajasthan', district: 'Jaipur', market: 'Jaipur Mandi', lastUpdated: '1 hour ago', trend: 'up' },
  { id: 7, crop: 'Kidneybeans', price: 6800, msp: 6450, change: +2.3, state: 'Maharashtra', district: 'Pune', market: 'Pune Mandi', lastUpdated: '3 hours ago', trend: 'up' },
  { id: 8, crop: 'Pigeonpeas', price: 6600, msp: 6950, change: -1.8, state: 'Karnataka', district: 'Bangalore', market: 'Bangalore Mandi', lastUpdated: '2 hours ago', trend: 'down' },
  { id: 9, crop: 'Mothbeans', price: 4900, msp: 4850, change: +3.2, state: 'Rajasthan', district: 'Jodhpur', market: 'Jodhpur Mandi', lastUpdated: '5 hours ago', trend: 'up' },
  { id: 10, crop: 'Mungbean', price: 7200, msp: 7755, change: -2.5, state: 'Uttar Pradesh', district: 'Lucknow', market: 'Lucknow Mandi', lastUpdated: '1 hour ago', trend: 'down' },
  { id: 11, crop: 'Blackgram', price: 6300, msp: 6600, change: +1.9, state: 'Andhra Pradesh', district: 'Vijayawada', market: 'Vijayawada Mandi', lastUpdated: '3 hours ago', trend: 'up' },
  { id: 12, crop: 'Lentil', price: 5800, msp: 6000, change: -0.8, state: 'Madhya Pradesh', district: 'Bhopal', market: 'Bhopal Mandi', lastUpdated: '2 hours ago', trend: 'down' },
  { id: 13, crop: 'Pomegranate', price: 8500, msp: 0, change: +6.5, state: 'Maharashtra', district: 'Nashik', market: 'Nashik Mandi', lastUpdated: '4 hours ago', trend: 'up' },
  { id: 14, crop: 'Banana', price: 1200, msp: 0, change: +2.1, state: 'Tamil Nadu', district: 'Coimbatore', market: 'Coimbatore Mandi', lastUpdated: '1 hour ago', trend: 'up' },
  { id: 15, crop: 'Mango', price: 3500, msp: 0, change: -1.5, state: 'Uttar Pradesh', district: 'Meerut', market: 'Meerut Mandi', lastUpdated: '5 hours ago', trend: 'down' },
  { id: 16, crop: 'Grapes', price: 4800, msp: 0, change: +4.2, state: 'Maharashtra', district: 'Nashik', market: 'Nashik Mandi', lastUpdated: '2 hours ago', trend: 'up' },
  { id: 17, crop: 'Watermelon', price: 800, msp: 0, change: +1.8, state: 'Karnataka', district: 'Bangalore', market: 'Bangalore Mandi', lastUpdated: '3 hours ago', trend: 'up' },
  { id: 18, crop: 'Muskmelon', price: 1500, msp: 0, change: -0.5, state: 'Uttar Pradesh', district: 'Agra', market: 'Agra Mandi', lastUpdated: '4 hours ago', trend: 'down' },
  { id: 19, crop: 'Apple', price: 7500, msp: 0, change: +3.8, state: 'Himachal Pradesh', district: 'Shimla', market: 'Shimla Mandi', lastUpdated: '6 hours ago', trend: 'up' },
  { id: 20, crop: 'Orange', price: 4200, msp: 0, change: +2.5, state: 'Maharashtra', district: 'Nagpur', market: 'Nagpur Mandi', lastUpdated: '2 hours ago', trend: 'up' },
  { id: 21, crop: 'Papaya', price: 1800, msp: 0, change: -1.2, state: 'Andhra Pradesh', district: 'Guntur', market: 'Guntur Mandi', lastUpdated: '3 hours ago', trend: 'down' },
  { id: 22, crop: 'Coconut', price: 2500, msp: 0, change: +5.5, state: 'Kerala', district: 'Kochi', market: 'Kochi Mandi', lastUpdated: '1 hour ago', trend: 'up' }
];

/**
 * Fetch live data from Agmarknet API
 */
async function fetchAgmarknetData(state = null, district = null, commodity = null) {
  try {
    const params = {
      'api-key': API_KEY,
      format: 'json',
      limit: 100,
      offset: 0
    };

    // Add filters if provided
    if (state) {
      params['filters[state]'] = state;
    }
    if (district) {
      params['filters[district]'] = district;
    }
    if (commodity) {
      const agmarketCrop = cropMapping[commodity] || commodity;
      params['filters[commodity]'] = agmarketCrop;
    }

    const response = await axios.get(AGMARKNET_BASE_URL, {
      params,
      timeout: 10000 // 10 second timeout
    });

    if (response.data && response.data.records) {
      return transformAgmarknetData(response.data.records);
    }

    return [];
  } catch (error) {
    console.error('Agmarknet API Error:', error.message);
    // Return mock data as fallback
    return null;
  }
}

/**
 * Transform Agmarknet data to our format
 */
function transformAgmarknetData(records) {
  return records.map((record, index) => {
    const modal_price = parseFloat(record.modal_price) || 0;
    const min_price = parseFloat(record.min_price) || 0;
    const max_price = parseFloat(record.max_price) || 0;
    
    // Calculate price change (mock for now, need historical data)
    const change = ((Math.random() - 0.5) * 10).toFixed(1);
    
    // Find MSP for this crop
    const cropName = Object.keys(cropMapping).find(
      key => cropMapping[key] === record.commodity
    ) || record.commodity;
    
    const mspData = {
      'Rice': 2040,
      'Wheat': 2275,
      'Cotton': 6080,
      'Maize': 1962,
      'Soybean': 4300,
      'Chickpea': 5335,
      'Kidneybeans': 6450,
      'Pigeonpeas': 6950,
      'Mothbeans': 4850,
      'Mungbean': 7755,
      'Blackgram': 6600,
      'Lentil': 6000
    };

    return {
      id: index + 1,
      crop: cropName,
      price: Math.round(modal_price),
      msp: mspData[cropName] || 0,
      change: parseFloat(change),
      state: record.state,
      district: record.district,
      market: record.market,
      lastUpdated: formatTimestamp(record.arrival_date),
      trend: parseFloat(change) > 0 ? 'up' : 'down',
      minPrice: Math.round(min_price),
      maxPrice: Math.round(max_price)
    };
  });
}

/**
 * Format timestamp to readable format
 */
function formatTimestamp(dateStr) {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  } catch {
    return 'Recently';
  }
}

/**
 * GET /api/market-prices
 * Get market prices with optional filters
 * Query params: state, district, commodity
 */
router.get('/market-prices', async (req, res) => {
  try {
    const { state, district, commodity } = req.query;
    
    // Try to fetch from Agmarknet API first
    const agmarknetData = await fetchAgmarknetData(state, district, commodity);
    
    let filteredPrices;
    
    if (agmarknetData && agmarknetData.length > 0) {
      // Use live data from Agmarknet
      filteredPrices = agmarknetData;
      console.log(`✅ Fetched ${agmarknetData.length} records from Agmarknet API`);
    } else {
      // Fallback to mock data
      console.log('⚠️ Using mock data (Agmarknet API unavailable)');
      filteredPrices = [...mockPrices];
      
      // Apply filters to mock data
      if (state && state !== 'all') {
        filteredPrices = filteredPrices.filter(p => p.state === state);
      }
      if (district && district !== 'all') {
        filteredPrices = filteredPrices.filter(p => p.district === district);
      }
      if (commodity) {
        filteredPrices = filteredPrices.filter(p => 
          p.crop.toLowerCase().includes(commodity.toLowerCase())
        );
      }
    }

    res.json({ 
      success: true,
      count: filteredPrices.length,
      source: agmarknetData ? 'agmarknet' : 'mock',
      prices: filteredPrices 
    });
  } catch (error) {
    console.error('Error fetching market prices:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch market prices' 
    });
  }
});

/**
 * GET /api/market-prices/:id/history
 * Get price history for a specific commodity
 * Query params: days (default: 30)
 */
router.get('/market-prices/:id/history', (req, res) => {
  try {
    const { id } = req.params;
    const days = parseInt(req.query.days) || 30;

    // Find the commodity
    const commodity = mockPrices.find(p => p.id === parseInt(id));
    if (!commodity) {
      return res.status(404).json({ 
        success: false,
        error: 'Commodity not found' 
      });
    }

    // Generate mock historical data
    const history = [];
    const basePrice = commodity.price;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Random price variation ±10%
      const randomChange = (Math.random() - 0.5) * basePrice * 0.2;
      const price = Math.round(basePrice + randomChange);
      
      history.push({
        date: date.toISOString().split('T')[0],
        price: price
      });
    }

    res.json({ 
      success: true,
      commodity: commodity.crop,
      days: days,
      history: history 
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch price history' 
    });
  }
});

/**
 * GET /api/msp
 * Get MSP (Minimum Support Price) data for all crops
 */
router.get('/msp', (req, res) => {
  try {
    const mspData = {
      'Rice': 2040,
      'Wheat': 2275,
      'Cotton': 6080,
      'Maize': 1962,
      'Soybean': 4300,
      'Chickpea': 5335,
      'Kidneybeans': 6450,
      'Pigeonpeas': 6950,
      'Mothbeans': 4850,
      'Mungbean': 7755,
      'Blackgram': 6600,
      'Lentil': 6000
    };

    res.json({ 
      success: true,
      msp: mspData,
      year: '2024-25'
    });
  } catch (error) {
    console.error('Error fetching MSP data:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch MSP data' 
    });
  }
});

/**
 * POST /api/alerts
 * Create a new price alert
 * Body: { userId, commodity, targetPrice, condition: 'above'|'below' }
 */
router.post('/alerts', async (req, res) => {
  try {
    const { userId, commodity, targetPrice, condition } = req.body;

    // Validation
    if (!userId || !commodity || !targetPrice || !condition) {
      return res.status(400).json({ 
        success: false,
        error: 'userId, commodity, targetPrice, and condition are required' 
      });
    }

    const alert = new Alert({
      userId,
      commodity,
      targetPrice,
      condition,
      active: true
    });

    await alert.save();

    res.status(201).json({ 
      success: true,
      alert,
      message: 'Price alert created successfully'
    });
  } catch (error) {
    console.error('Error creating price alert:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create price alert' 
    });
  }
});

/**
 * GET /api/alerts
 * Get all price alerts for the user
 * Query params: userId (required)
 */
router.get('/alerts', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const alerts = await Alert.find({ userId, active: true }).sort({ createdAt: -1 });

    res.json({ 
      success: true,
      count: alerts.length,
      alerts
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch alerts' 
    });
  }
});

/**
 * DELETE /api/alerts/:id
 * Delete a price alert
 */
router.delete('/alerts/:id', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    res.json({ 
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete alert' 
    });
  }
});

module.exports = router;
