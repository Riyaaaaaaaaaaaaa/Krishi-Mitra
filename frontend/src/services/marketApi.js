// Market Prices API Service
// Integrates with government mandi data sources

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
const AGMARKNET_PROXY = `${API_BASE_URL}/api/market-prices`

/**
 * Fetch current market prices from various mandis
 * @param {Object} filters - Filter options
 * @param {string} filters.state - State name (optional)
 * @param {string} filters.district - District name (optional)
 * @param {string} filters.commodity - Commodity name (optional)
 * @returns {Promise<Array>} Array of market price data
 */
export async function getMarketPrices(filters = {}) {
  try {
    const queryParams = new URLSearchParams()
    
    if (filters.state && filters.state !== 'all') {
      queryParams.append('state', filters.state)
    }
    if (filters.district && filters.district !== 'all') {
      queryParams.append('district', filters.district)
    }
    if (filters.commodity) {
      queryParams.append('commodity', filters.commodity)
    }

    const url = `${AGMARKNET_PROXY}?${queryParams.toString()}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.prices || []
  } catch (error) {
    console.error('Error fetching market prices:', error)
    // Return mock data as fallback
    return getMockPrices()
  }
}

/**
 * Get price history for a specific commodity
 * @param {number} commodityId - Commodity ID
 * @param {number} days - Number of days of history (default 30)
 * @returns {Promise<Array>} Array of historical price data
 */
export async function getPriceHistory(commodityId, days = 30) {
  try {
    const url = `${AGMARKNET_PROXY}/${commodityId}/history?days=${days}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.history || []
  } catch (error) {
    console.error('Error fetching price history:', error)
    // Return mock historical data
    return getMockPriceHistory(days)
  }
}

/**
 * Get MSP (Minimum Support Price) data
 * @returns {Promise<Object>} MSP data for various crops
 */
export async function getMSPData() {
  try {
    const url = `${API_BASE_URL}/api/msp`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.msp || {}
  } catch (error) {
    console.error('Error fetching MSP data:', error)
    return getMockMSP()
  }
}

/**
 * Create a price alert
 * @param {Object} alert - Alert configuration
 * @returns {Promise<Object>} Created alert
 */
export async function createPriceAlert(alert) {
  try {
    const url = `${API_BASE_URL}/api/alerts`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alert)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating price alert via API, using localStorage fallback:', error)
    // Fallback to localStorage
    const newAlert = {
      id: Date.now(),
      ...alert,
      createdAt: new Date().toISOString()
    }
    
    const alerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]')
    alerts.push(newAlert)
    localStorage.setItem('priceAlerts', JSON.stringify(alerts))
    
    return { alert: newAlert }
  }
}

/**
 * Get user's price alerts
 * @returns {Promise<Array>} Array of user alerts
 */
export async function getUserAlerts() {
  try {
    const url = `${API_BASE_URL}/api/alerts`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.alerts || []
  } catch (error) {
    console.error('Error fetching alerts from API, using localStorage fallback:', error)
    // Fallback to localStorage
    const alerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]')
    return alerts
  }
}

/**
 * Delete a price alert
 * @param {number} alertId - Alert ID
 * @returns {Promise<boolean>} Success status
 */
export async function deletePriceAlert(alertId) {
  try {
    const url = `${API_BASE_URL}/api/alerts/${alertId}`
    const response = await fetch(url, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return true
  } catch (error) {
    console.error('Error deleting alert from API, using localStorage fallback:', error)
    // Fallback to localStorage
    const alerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]')
    const filteredAlerts = alerts.filter(a => a.id !== alertId)
    localStorage.setItem('priceAlerts', JSON.stringify(filteredAlerts))
    return true
  }
}

// ============ MOCK DATA (Fallback) ============

function getMockPrices() {
  return [
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
  ]
}

function getMockPriceHistory(days) {
  const history = []
  const basePrice = 2100
  
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const randomChange = (Math.random() - 0.5) * 200
    history.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(basePrice + randomChange)
    })
  }
  
  return history
}

function getMockMSP() {
  return {
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
  }
}
