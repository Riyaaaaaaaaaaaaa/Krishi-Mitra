import React, { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'

export default function Weather() {
  const { t } = useTranslation()
  const [selectedLocation, setSelectedLocation] = useState('Ranchi, Jharkhand')
  const [showRadar, setShowRadar] = useState(false)
  const [showHistorical, setShowHistorical] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [locations, setLocations] = useState([
    { id: 1, name: 'Ranchi, Jharkhand', active: true, coords: { lat: 23.3441, lon: 85.3096 } },
    { id: 2, name: 'Patna, Bihar', active: false, coords: { lat: 25.5941, lon: 85.1376 } },
    { id: 3, name: 'Lucknow, Uttar Pradesh', active: false, coords: { lat: 26.8467, lon: 80.9462 } },
    { id: 4, name: 'Bhopal, Madhya Pradesh', active: false, coords: { lat: 23.2599, lon: 77.4126 } },
    { id: 5, name: 'Jaipur, Rajasthan', active: false, coords: { lat: 26.9124, lon: 75.7873 } },
    { id: 6, name: 'Ahmedabad, Gujarat', active: false, coords: { lat: 23.0225, lon: 72.5714 } },
    { id: 7, name: 'Hyderabad, Telangana', active: false, coords: { lat: 17.3850, lon: 78.4867 } },
    { id: 8, name: 'Bengaluru, Karnataka', active: false, coords: { lat: 12.9716, lon: 77.5946 } },
    { id: 9, name: 'Chennai, Tamil Nadu', active: false, coords: { lat: 13.0827, lon: 80.2707 } },
    { id: 10, name: 'Pune, Maharashtra', active: false, coords: { lat: 18.5204, lon: 73.8567 } },
    { id: 11, name: 'Kolkata, West Bengal', active: false, coords: { lat: 22.5726, lon: 88.3639 } },
    { id: 12, name: 'Indore, Madhya Pradesh', active: false, coords: { lat: 22.7196, lon: 75.8577 } },
    { id: 13, name: 'Nagpur, Maharashtra', active: false, coords: { lat: 21.1458, lon: 79.0882 } },
    { id: 14, name: 'Coimbatore, Tamil Nadu', active: false, coords: { lat: 11.0168, lon: 76.9558 } },
    { id: 15, name: 'Amritsar, Punjab', active: false, coords: { lat: 31.6340, lon: 74.8723 } }
  ])
  
  const [weather, setWeather] = useState({
    current: {
      temp: 28,
      condition: 'Partly Cloudy',
      humidity: 70,
      windSpeed: 12,
      rainfall: 0,
      pressure: 1013,
      feelsLike: 30,
      uvIndex: 6,
      visibility: 10,
      dewPoint: 22,
      soilMoisture: 65 // percentage
    },
    forecast: [
      { day: 'Mon', temp: 30, condition: 'Sunny', icon: '☀️', rain: 0, minTemp: 22, maxTemp: 30 },
      { day: 'Tue', temp: 29, condition: 'Cloudy', icon: '☁️', rain: 10, minTemp: 23, maxTemp: 29 },
      { day: 'Wed', temp: 27, condition: 'Rainy', icon: '🌧️', rain: 80, minTemp: 20, maxTemp: 27 },
      { day: 'Thu', temp: 26, condition: 'Rainy', icon: '🌧️', rain: 70, minTemp: 19, maxTemp: 26 },
      { day: 'Fri', temp: 28, condition: 'Partly Cloudy', icon: '⛅', rain: 20, minTemp: 21, maxTemp: 28 },
      { day: 'Sat', temp: 31, condition: 'Sunny', icon: '☀️', rain: 0, minTemp: 24, maxTemp: 31 },
      { day: 'Sun', temp: 32, condition: 'Sunny', icon: '☀️', rain: 0, minTemp: 25, maxTemp: 32 }
    ],
    alerts: [
      { 
        id: 1, 
        type: 'critical', 
        icon: '❄️', 
        title: t('app.weather.frostWarning'), 
        message: t('app.weather.frostWarningMsg'),
        color: 'red'
      },
      { 
        id: 2, 
        type: 'warning', 
        icon: '⚠️', 
        title: t('app.weather.heavyRainfall'), 
        message: t('app.weather.heavyRainfallMsg'),
        color: 'yellow'
      },
      { 
        id: 3, 
        type: 'info', 
        icon: 'ℹ️', 
        title: t('app.weather.optimalIrrigation'), 
        message: t('app.weather.optimalIrrigationMsg'),
        color: 'blue'
      },
      { 
        id: 4, 
        type: 'success', 
        icon: '✅', 
        title: t('app.weather.goodHarvesting'), 
        message: t('app.weather.goodHarvestingMsg'),
        color: 'green'
      }
    ],
    cropImpact: [
      { crop: t('app.weather.riceImpact'), condition: t('app.weather.riceCondition'), score: 'excellent', icon: '🌾' },
      { crop: t('app.weather.wheatImpact'), condition: t('app.weather.wheatCondition'), score: 'caution', icon: '🌾' },
      { crop: t('app.weather.cottonImpact'), condition: t('app.weather.cottonCondition'), score: 'good', icon: '🌿' }
    ]
  })

  // Fetch weather data from OpenWeatherMap API
  const fetchWeatherData = async (locationName) => {
    setLoading(true)
    setError(null)
    
    try {
      const location = locations.find(loc => loc.name === locationName)
      if (!location) return

      const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
      const { lat, lon } = location.coords

      // Check if API key is configured
      if (!API_KEY || API_KEY === 'your_api_key_here' || API_KEY === 'demo') {
        console.warn('OpenWeatherMap API key not configured. Using Open-Meteo free API instead.')
        await fetchOpenMeteoData(lat, lon)
        return
      }

      // Fetch current weather from OpenWeatherMap
      const currentResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      )

      // Fetch 7-day forecast from OpenWeatherMap
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      )

      // Process current weather
      const current = currentResponse.data
      
      // Translate condition
      const translateCurrentCondition = (condition) => {
        const conditionMap = {
          'Clear': 'Clear',
          'Clouds': 'Cloudy',
          'Rain': 'Rainy',
          'Drizzle': 'Drizzle',
          'Thunderstorm': 'Thunderstorm',
          'Snow': 'Snowy',
          'Mist': 'Mist',
          'Fog': 'Fog'
        }
        const mappedCondition = conditionMap[condition] || 'PartlyCloudy'
        return t(`app.weather.weatherConditions.${mappedCondition}`)
      }
      
      const updatedWeather = {
        current: {
          temp: Math.round(current.main.temp),
          condition: translateCurrentCondition(current.weather[0].main),
          humidity: current.main.humidity,
          windSpeed: Math.round(current.wind.speed * 3.6), // Convert m/s to km/h
          rainfall: current.rain?.['1h'] || 0,
          pressure: current.main.pressure,
          feelsLike: Math.round(current.main.feels_like),
          uvIndex: 6, // UV data requires separate API call
          visibility: Math.round(current.visibility / 1000), // Convert meters to km
          dewPoint: Math.round(current.main.temp - ((100 - current.main.humidity) / 5)),
          soilMoisture: current.main.humidity > 70 ? 75 : current.main.humidity < 40 ? 35 : 60
        },
        forecast: processForecastData(forecastResponse.data),
        alerts: generateAlerts(current, forecastResponse.data),
        cropImpact: generateCropImpact(current)
      }

      setWeather(updatedWeather)
      setLoading(false)
    } catch (err) {
      console.error('OpenWeatherMap API error:', err.message)
      // Fallback to Open-Meteo free API
      const location = locations.find(loc => loc.name === locationName)
      if (location) {
        await fetchOpenMeteoData(location.coords.lat, location.coords.lon)
      }
    }
  }

  // Fetch from Open-Meteo (free, no API key required)
  const fetchOpenMeteoData = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia/Kolkata`
      )

      const data = response.data
      const current = data.current
      const daily = data.daily

      const getWeatherCondition = (code) => {
        if (code === 0) return t('app.weather.weatherConditions.Clear')
        if (code <= 3) return t('app.weather.weatherConditions.Cloudy')
        if (code <= 67) return t('app.weather.weatherConditions.Rainy')
        if (code <= 77) return t('app.weather.weatherConditions.Snowy')
        return t('app.weather.weatherConditions.PartlyCloudy')
      }

      const getWeatherIcon = (code) => {
        if (code === 0) return '☀️'
        if (code <= 3) return '☁️'
        if (code <= 67) return '🌧️'
        if (code <= 77) return '❄️'
        return '⛅'
      }

      const updatedWeather = {
        current: {
          temp: Math.round(current.temperature_2m),
          condition: getWeatherCondition(current.weather_code),
          humidity: current.relative_humidity_2m,
          windSpeed: Math.round(current.wind_speed_10m * 3.6),
          rainfall: 0,
          pressure: Math.round(current.surface_pressure),
          feelsLike: Math.round(current.temperature_2m - 2),
          uvIndex: 6,
          visibility: 10,
          dewPoint: Math.round(current.temperature_2m - ((100 - current.relative_humidity_2m) / 5)),
          soilMoisture: current.relative_humidity_2m > 70 ? 75 : current.relative_humidity_2m < 40 ? 35 : 60
        },
        forecast: daily.time.slice(0, 7).map((date, idx) => {
          const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
          return {
            day: dayName,
            temp: Math.round((daily.temperature_2m_max[idx] + daily.temperature_2m_min[idx]) / 2),
            minTemp: Math.round(daily.temperature_2m_min[idx]),
            maxTemp: Math.round(daily.temperature_2m_max[idx]),
            condition: getWeatherCondition(daily.weather_code[idx]),
            icon: getWeatherIcon(daily.weather_code[idx]),
            rain: daily.precipitation_probability_max[idx] || 0
          }
        }),
        alerts: generateAlertsFromOpenMeteo(current, daily),
        cropImpact: generateCropImpactFromOpenMeteo(current)
      }

      setWeather(updatedWeather)
      setError(null)
    } catch (err) {
      console.error('Open-Meteo API error:', err.message)
      setError('Unable to fetch weather data. Showing cached data.')
    } finally {
      setLoading(false)
    }
  }

  // Generate alerts for Open-Meteo data
  const generateAlertsFromOpenMeteo = (current, daily) => {
    const alerts = []
    
    if (current.temperature_2m < 5) {
      alerts.push({
        id: 1,
        type: 'critical',
        icon: '❄️',
        title: t('app.weather.frostWarning'),
        message: t('app.weather.frostWarningMsg'),
        color: 'red'
      })
    }

    const highRainDays = daily.precipitation_probability_max.slice(0, 3).filter(p => p > 70)
    if (highRainDays.length > 0) {
      alerts.push({
        id: 2,
        type: 'warning',
        icon: '⚠️',
        title: t('app.weather.heavyRainfall'),
        message: t('app.weather.heavyRainfallMsg'),
        color: 'yellow'
      })
    }

    const lowRainDays = daily.precipitation_probability_max.slice(0, 3).every(p => p < 20)
    if (lowRainDays) {
      alerts.push({
        id: 3,
        type: 'info',
        icon: 'ℹ️',
        title: t('app.weather.optimalIrrigation'),
        message: t('app.weather.optimalIrrigationMsg'),
        color: 'blue'
      })
    }

    if (current.weather_code === 0 && current.wind_speed_10m < 5) {
      alerts.push({
        id: 4,
        type: 'success',
        icon: '✅',
        title: t('app.weather.goodHarvesting'),
        message: t('app.weather.goodHarvestingMsg'),
        color: 'green'
      })
    }

    return alerts.length > 0 ? alerts : [{
      id: 1,
      type: 'info',
      icon: '✅',
      title: t('app.weather.noAlertsTitle'),
      message: t('app.weather.noAlertsMsg'),
      color: 'green'
    }]
  }

  // Generate crop impact for Open-Meteo data
  const generateCropImpactFromOpenMeteo = (current) => {
    const temp = current.temperature_2m
    const humidity = current.relative_humidity_2m

    return [
      {
        crop: t('app.weather.riceImpact'),
        condition: t('app.weather.riceCondition'),
        score: temp >= 20 && temp <= 35 && humidity >= 60 ? 'excellent' : temp > 35 ? 'caution' : 'good',
        icon: '🌾'
      },
      {
        crop: t('app.weather.wheatImpact'),
        condition: t('app.weather.wheatCondition'),
        score: temp >= 12 && temp <= 25 ? 'excellent' : humidity > 80 ? 'caution' : 'good',
        icon: '🌾'
      },
      {
        crop: t('app.weather.cottonImpact'),
        condition: t('app.weather.cottonCondition'),
        score: temp >= 21 && temp <= 30 && humidity < 70 ? 'excellent' : humidity > 80 ? 'caution' : 'good',
        icon: '🌿'
      }
    ]
  }

  // Process forecast data into 7-day format
  const processForecastData = (data) => {
    const dailyData = {}
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000)
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
      
      if (!dailyData[dayName]) {
        dailyData[dayName] = {
          temps: [],
          conditions: [],
          rain: 0,
          icon: item.weather[0].main
        }
      }
      
      dailyData[dayName].temps.push(item.main.temp)
      dailyData[dayName].conditions.push(item.weather[0].main)
      dailyData[dayName].rain += (item.pop * 100) // Probability of precipitation
    })

    const getWeatherIcon = (condition) => {
      const icons = {
        Clear: '☀️',
        Clouds: '☁️',
        Rain: '🌧️',
        Drizzle: '🌦️',
        Thunderstorm: '⛈️',
        Snow: '❄️',
        Mist: '🌫️',
        Fog: '🌫️'
      }
      return icons[condition] || '⛅'
    }

    const translateCondition = (condition) => {
      const conditionMap = {
        'Clear': 'Clear',
        'Clouds': 'Cloudy',
        'Rain': 'Rainy',
        'Drizzle': 'Drizzle',
        'Thunderstorm': 'Thunderstorm',
        'Snow': 'Snowy',
        'Mist': 'Mist',
        'Fog': 'Fog'
      }
      const mappedCondition = conditionMap[condition] || 'PartlyCloudy'
      return t(`app.weather.weatherConditions.${mappedCondition}`)
    }

    return Object.keys(dailyData).slice(0, 7).map(day => {
      const temps = dailyData[day].temps
      const avgTemp = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length)
      const minTemp = Math.round(Math.min(...temps))
      const maxTemp = Math.round(Math.max(...temps))
      const rawCondition = dailyData[day].conditions[0]
      
      return {
        day,
        temp: avgTemp,
        minTemp,
        maxTemp,
        condition: translateCondition(rawCondition),
        icon: getWeatherIcon(rawCondition),
        rain: Math.round(dailyData[day].rain / dailyData[day].temps.length)
      }
    })
  }

  // Generate alerts based on weather data
  const generateAlerts = (current, forecast) => {
    const alerts = []
    
    // Frost warning
    if (current.main.temp < 5) {
      alerts.push({
        id: 1,
        type: 'critical',
        icon: '❄️',
        title: t('app.weather.frostWarning'),
        message: t('app.weather.frostWarningMsg'),
        color: 'red'
      })
    }

    // Heavy rainfall check
    const upcomingRain = forecast.list.slice(0, 8).filter(item => item.pop > 0.7)
    if (upcomingRain.length > 0) {
      alerts.push({
        id: 2,
        type: 'warning',
        icon: '⚠️',
        title: t('app.weather.heavyRainfall'),
        message: t('app.weather.heavyRainfallMsg'),
        color: 'yellow'
      })
    }

    // Irrigation recommendation
    const lowRain = forecast.list.slice(0, 8).every(item => item.pop < 0.2)
    if (lowRain) {
      alerts.push({
        id: 3,
        type: 'info',
        icon: 'ℹ️',
        title: t('app.weather.optimalIrrigation'),
        message: t('app.weather.optimalIrrigationMsg'),
        color: 'blue'
      })
    }

    // Good harvesting weather
    if (current.weather[0].main === 'Clear' && current.wind.speed < 5) {
      alerts.push({
        id: 4,
        type: 'success',
        icon: '✅',
        title: t('app.weather.goodHarvesting'),
        message: t('app.weather.goodHarvestingMsg'),
        color: 'green'
      })
    }

    return alerts.length > 0 ? alerts : [{
      id: 1,
      type: 'info',
      icon: '✅',
      title: t('app.weather.noAlertsTitle'),
      message: t('app.weather.noAlertsMsg'),
      color: 'green'
    }]
  }

  // Generate crop impact based on weather
  const generateCropImpact = (current) => {
    const temp = current.main.temp
    const humidity = current.main.humidity

    return [
      {
        crop: t('app.weather.riceImpact'),
        condition: t('app.weather.riceCondition'),
        score: temp >= 20 && temp <= 35 && humidity >= 60 ? 'excellent' : temp > 35 ? 'caution' : 'good',
        icon: '🌾'
      },
      {
        crop: t('app.weather.wheatImpact'),
        condition: t('app.weather.wheatCondition'),
        score: temp >= 12 && temp <= 25 ? 'excellent' : humidity > 80 ? 'caution' : 'good',
        icon: '🌾'
      },
      {
        crop: t('app.weather.cottonImpact'),
        condition: t('app.weather.cottonCondition'),
        score: temp >= 21 && temp <= 30 && humidity < 70 ? 'excellent' : humidity > 80 ? 'caution' : 'good',
        icon: '🌿'
      }
    ]
  }

  // Fetch weather data when location changes
  useEffect(() => {
    fetchWeatherData(selectedLocation)
  }, [selectedLocation])

  // Helper functions
  const getImpactColor = (score) => {
    const colors = {
      excellent: 'bg-green-100 text-green-800 border-green-300',
      good: 'bg-blue-100 text-blue-800 border-blue-300',
      fair: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      caution: 'bg-orange-100 text-orange-800 border-orange-300',
      poor: 'bg-red-100 text-red-800 border-red-300'
    }
    return colors[score] || colors.fair
  }

  const getAlertStyle = (color) => {
    const styles = {
      red: 'bg-red-50 border-red-500',
      yellow: 'bg-yellow-50 border-yellow-500',
      blue: 'bg-blue-50 border-blue-500',
      green: 'bg-green-50 border-green-500'
    }
    return styles[color] || styles.blue
  }

  const getSoilMoistureStatus = (level) => {
    if (level < 40) return { status: t('app.weather.low'), color: 'text-red-600' }
    if (level > 80) return { status: t('app.weather.high'), color: 'text-blue-600' }
    return { status: t('app.weather.optimal'), color: 'text-green-600' }
  }

  const soilMoistureInfo = getSoilMoistureStatus(weather.current.soilMoisture)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('app.weather.pageTitle')}</h1>
          <p className="text-gray-600 mt-1">{t('app.weather.pageSubtitle')}</p>
          {error && (
            <p className="text-orange-600 text-sm mt-2">⚠️ {error}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {loading && (
            <div className="flex items-center gap-2 text-blue-600">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm">{t('app.weather.loading')}...</span>
            </div>
          )}
          <button
            onClick={() => setShowRadar(!showRadar)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            {showRadar ? t('app.weather.hideRadar') : t('app.weather.showRadar')}
          </button>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            {locations.map(loc => (
              <option key={loc.id} value={loc.name}>{loc.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Radar View */}
      {showRadar && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('app.weather.radarView')}</h2>
          <div className="bg-gradient-to-br from-blue-100 via-blue-50 to-green-50 rounded-lg p-8 relative overflow-hidden" style={{ height: '400px' }}>
            {/* Simulated Radar Map */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="relative w-64 h-64 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-blue-300 rounded-full animate-ping opacity-20"></div>
                  <div className="absolute inset-4 border-4 border-blue-400 rounded-full animate-ping opacity-30" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute inset-8 border-4 border-blue-500 rounded-full animate-ping opacity-40" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl">🌧️</div>
                  </div>
                  {/* Simulated cloud movements */}
                  <div className="absolute top-10 right-10 text-3xl animate-pulse">☁️</div>
                  <div className="absolute bottom-10 left-10 text-3xl animate-pulse" style={{ animationDelay: '0.7s' }}>☁️</div>
                </div>
                <p className="text-gray-600 text-sm">{t('app.weather.radarMapInfo')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Weather Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-blue-100 text-sm mb-2">📍 {selectedLocation}</p>
            <h2 className="text-6xl font-bold mb-2">{weather.current.temp}°C</h2>
            <p className="text-2xl text-blue-100">{weather.current.condition}</p>
            <p className="text-blue-200 text-sm mt-2">{t('app.weather.lastUpdated')}: {t('app.weather.justNow')}</p>
          </div>
          <div className="text-8xl">⛅</div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-blue-200 text-sm">{t('app.weather.humidity')}</p>
            <p className="text-2xl font-bold">{weather.current.humidity}%</p>
            <span className="text-3xl">💧</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-blue-200 text-sm">{t('app.weather.windSpeed')}</p>
            <p className="text-2xl font-bold">{weather.current.windSpeed} km/h</p>
            <span className="text-3xl">🌬️</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-blue-200 text-sm">{t('app.weather.rainfall')}</p>
            <p className="text-2xl font-bold">{weather.current.rainfall} mm</p>
            <span className="text-3xl">🌧️</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-blue-200 text-sm">{t('app.weather.pressure')}</p>
            <p className="text-2xl font-bold">{weather.current.pressure} hPa</p>
            <span className="text-3xl">🌡️</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-blue-200 text-sm">{t('app.weather.feelsLike')}</p>
            <p className="text-2xl font-bold">{weather.current.feelsLike}°C</p>
            <span className="text-3xl">🌡️</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-blue-200 text-sm">{t('app.weather.uvIndex')}</p>
            <p className="text-2xl font-bold">{weather.current.uvIndex}</p>
            <span className="text-3xl">☀️</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-blue-200 text-sm">{t('app.weather.visibility')}</p>
            <p className="text-2xl font-bold">{weather.current.visibility} km</p>
            <span className="text-3xl">👁️</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-blue-200 text-sm">{t('app.weather.soilMoistureLevel')}</p>
            <p className="text-2xl font-bold">{weather.current.soilMoisture}%</p>
            <span className={`text-sm font-semibold ${soilMoistureInfo.color}`}>{soilMoistureInfo.status}</span>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('app.weather.forecast7Day')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
          {weather.forecast.map((day, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center hover:shadow-lg transition-shadow cursor-pointer"
            >
              <p className="text-sm font-semibold text-gray-700 mb-2">{t(`app.weather.${day.day}`)}</p>
              <div className="text-5xl my-3">{day.icon}</div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{day.temp}°C</p>
              <p className="text-xs text-gray-500 mb-2">{day.minTemp}° / {day.maxTemp}°</p>
              <p className="text-xs text-gray-600 mb-2">{day.condition}</p>
              <div className="flex items-center justify-center text-xs text-blue-600">
                <span className="mr-1">💧</span>
                {day.rain}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agricultural Alerts */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('app.weather.agriculturalAlerts')}</h2>
        <div className="space-y-3">
          {weather.alerts.map((alert) => (
            <div key={alert.id} className={`${getAlertStyle(alert.color)} border-l-4 p-4 rounded`}>
              <div className="flex items-start">
                <span className="text-2xl mr-3">{alert.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                  <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Planting & Spraying Windows */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🤖</span>
          <h2 className="text-2xl font-bold text-gray-900">{t('app.weather.plantingWindows')}</h2>
        </div>
        <p className="text-gray-600 mb-6 text-sm">{t('app.weather.aiRecommendations')}</p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌱</span>
              <h3 className="font-semibold text-green-900">{t('app.weather.optimalPlanting')}</h3>
            </div>
            <p className="text-sm text-green-800">{t('app.weather.optimalPlantingMsg')}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">💨</span>
              <h3 className="font-semibold text-blue-900">{t('app.weather.sprayingWindow')}</h3>
            </div>
            <p className="text-sm text-blue-800">{t('app.weather.sprayingWindowMsg')}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">⚠️</span>
              <h3 className="font-semibold text-orange-900">{t('app.weather.avoidSpraying')}</h3>
            </div>
            <p className="text-sm text-orange-800">{t('app.weather.avoidSprayingMsg')}</p>
          </div>
        </div>
      </div>

      {/* Weather Impact on Crops */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('app.weather.weatherImpact')}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {weather.cropImpact.map((crop, idx) => (
            <div key={idx} className={`border-2 rounded-lg p-5 ${getImpactColor(crop.score)}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{crop.icon}</span>
                  <h3 className="font-bold text-lg">{crop.crop}</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold border">
                  {t(`app.weather.${crop.score}`)}
                </span>
              </div>
              <p className="text-sm">{crop.condition}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Data Comparison */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('app.weather.historicalData')}</h2>
          <button
            onClick={() => setShowHistorical(!showHistorical)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
          >
            {showHistorical ? '▲' : '▼'} {t('app.weather.compareWithPast')}
          </button>
        </div>
        {showHistorical && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">{t('app.weather.currentSeason')}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t('app.weather.temperature')}:</span>
                  <span className="text-sm font-semibold">28°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t('app.weather.rainfallTotal')}:</span>
                  <span className="text-sm font-semibold">450mm</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">{t('app.weather.lastYear')}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t('app.weather.temperature')}:</span>
                  <span className="text-sm font-semibold">26°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t('app.weather.rainfallTotal')}:</span>
                  <span className="text-sm font-semibold">380mm</span>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-3">{t('app.weather.avgLast5Years')}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t('app.weather.temperature')}:</span>
                  <span className="text-sm font-semibold">27°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t('app.weather.rainfallTotal')}:</span>
                  <span className="text-sm font-semibold">420mm</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
