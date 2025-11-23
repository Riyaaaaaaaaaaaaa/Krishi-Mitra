import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import RecommendationCards from '../components/RecommendationCards.jsx'
import { translateCropName } from '../utils/cropTranslation'

export default function Dashboard({ onNavigate }) {
  const { t, i18n } = useTranslation()
  const [recommendations, setRecommendations] = useState([])
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    totalRecommendations: 0,
    lastUpdated: null,
    favoritesCrop: null
  })
  const [currentDateTime, setCurrentDateTime] = useState(new Date())
  const [weather, setWeather] = useState({
    temp: 28,
    humidity: 65,
    condition: 'Sunny',
    icon: '☀️',
    loading: true
  })
  const [location, setLocation] = useState({
    state: 'Madhya Pradesh',
    district: 'Indore',
    city: 'Indore'
  })
  const [marketTrend, setMarketTrend] = useState('+2.3')
  const [activeCrops, setActiveCrops] = useState([
    { id: 1, name: 'Soybean', status: 'Growing', daysLeft: 35, area: 5, yield: 1500, price: 4200, msp: 4300, icon: '🌱' },
    { id: 2, name: 'Cotton', status: 'Planted', daysLeft: 120, area: 3, yield: 800, price: 6500, msp: 6080, icon: '☁️' },
    { id: 3, name: 'Rice', status: 'Harvesting', daysLeft: 7, area: 2, yield: 2000, price: 2100, msp: 2040, icon: '🌾' }
  ])
  const [alerts, setAlerts] = useState(2)

  useEffect(() => {
    const authData = localStorage.getItem('auth')
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        setUser(parsed)
      } catch (e) {
        console.error('Failed to parse auth data:', e)
      }
    }

    // Fetch weather based on user location
    const fetchWeather = async () => {
      try {
        // Try to get user's geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords
              
              // Fetch weather from OpenWeather API
              const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || '37c4e2a6c36c9f60d70a9cd44ba1b062'
              const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
              )
              
              if (response.ok) {
                const data = await response.json()
                const weatherIcon = getWeatherIcon(data.weather[0].main)
                
                setWeather({
                  temp: Math.round(data.main.temp),
                  humidity: data.main.humidity,
                  condition: data.weather[0].main,
                  icon: weatherIcon,
                  loading: false
                })
                
                // Try to get location name from reverse geocoding
                const geoResponse = await fetch(
                  `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`
                )
                if (geoResponse.ok) {
                  const geoData = await geoResponse.json()
                  if (geoData.length > 0) {
                    setLocation({
                      state: geoData[0].state || 'Madhya Pradesh',
                      district: geoData[0].name || 'Indore',
                      city: geoData[0].name || 'Indore'
                    })
                  }
                }
              }
            },
            (error) => {
              console.log('Geolocation error:', error)
              setWeather(prev => ({ ...prev, loading: false }))
            }
          )
        } else {
          setWeather(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        console.error('Weather fetch error:', error)
        setWeather(prev => ({ ...prev, loading: false }))
      }
    }

    fetchWeather()

    const loadRecommendations = () => {
      const saved = localStorage.getItem('recommendations')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setRecommendations(parsed)
          setStats(prev => ({
            ...prev,
            totalRecommendations: parsed.length,
            lastUpdated: new Date().toLocaleDateString(),
            favoriteCrop: parsed[0]?.crop || null
          }))
        } catch (e) {
          console.error('Failed to load recommendations:', e)
        }
      }
    }

    loadRecommendations()

    const pollInterval = setInterval(() => {
      loadRecommendations()
    }, 1000)

    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 60000)

    return () => {
      clearInterval(pollInterval)
      clearInterval(timer)
    }
  }, [])

  // Helper function to get weather icon
  const getWeatherIcon = (condition) => {
    const icons = {
      Clear: '☀️',
      Clouds: '☁️',
      Rain: '🌧️',
      Drizzle: '🌦️',
      Thunderstorm: '⛈️',
      Snow: '❄️',
      Mist: '🌫️',
      Fog: '🌫️',
      Haze: '🌫️'
    }
    return icons[condition] || '☀️'
  }

  // Translate weather condition
  const translateWeatherCondition = (condition) => {
    if (!condition) return ''
    
    // Direct mapping to avoid any caching issues
    const weatherTranslations = {
      'Clear': i18n.language === 'hi' ? 'साफ' : 'Clear',
      'Clouds': i18n.language === 'hi' ? 'बादल' : 'Cloudy',
      'Rain': i18n.language === 'hi' ? 'बरिश' : 'Rainy',
      'Drizzle': i18n.language === 'hi' ? 'फुहार' : 'Drizzle',
      'Thunderstorm': i18n.language === 'hi' ? 'आँधी-तूफान' : 'Thunderstorm',
      'Snow': i18n.language === 'hi' ? 'बर्फ' : 'Snowy',
      'Mist': i18n.language === 'hi' ? 'धुंध' : 'Misty',
      'Fog': i18n.language === 'hi' ? 'कोहरा' : 'Foggy',
      'Haze': i18n.language === 'hi' ? 'धुंधला' : 'Hazy',
      'Sunny': i18n.language === 'hi' ? 'धूप' : 'Sunny'
    }
    
    return weatherTranslations[condition] || condition
  }

  // Translate crop status
  const translateCropStatus = (status) => {
    const statusMap = {
      'Growing': t('app.dashboard.statusGrowing'),
      'Planted': t('app.dashboard.statusPlanted'),
      'Harvesting': t('app.dashboard.statusHarvesting')
    }
    return statusMap[status] || status
  }

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = currentDateTime.getHours()
    if (hour < 12) return t('app.dashboard.goodMorning')
    if (hour < 18) return t('app.dashboard.goodAfternoon')
    return t('app.dashboard.goodEvening')
  }

  // Get user display name - use Hindi name if available and language is Hindi
  const getUserDisplayName = () => {
    if (!user) return t('app.dashboard.farmer')
    
    // If Hindi is selected and hindiName exists, use it
    if (i18n.language === 'hi' && user.nameHi) {
      return user.nameHi
    }
    
    // Otherwise use the regular name
    return user.name || t('app.dashboard.farmer')
  }

  return (
    <div className="space-y-6" key={i18n.language}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              {getGreeting()}, {getUserDisplayName()}! 🌾
            </h2>
            <p className="text-green-100 flex flex-wrap items-center gap-2">
              <span>📍 {location.state} | {location.district}</span>
              <span className="hidden md:inline">|</span>
              <span>{t('app.weather.temperature')}: {weather.temp}°C, {t('app.weather.humidity')} {weather.humidity}%</span>
              <span className="hidden md:inline">|</span>
              <span>{t('app.dashboard.season')}: {t('app.dashboard.kharif')}</span>
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{weather.icon}</div>
              <div>
                <div className="text-3xl font-bold">{weather.temp}°C</div>
                <div className="text-green-100 text-sm">{translateWeatherCondition(weather.condition)}</div>
                <div className="text-green-200 text-xs">💧 {weather.humidity}% {t('app.weather.humidity')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">🌱 {t('app.dashboard.myCropsLabel')}</p>
              <p className="text-2xl font-bold text-gray-900">{activeCrops.length} {t('app.dashboard.active')}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🌾</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">📈 {t('app.dashboard.avgPriceChange')}</p>
              <p className="text-2xl font-bold text-green-600">{marketTrend}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-amber-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">💰 {t('app.dashboard.potentialRevenue')}</p>
              <p className="text-2xl font-bold text-gray-900">₹2.4L</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💵</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">🎯 {t('app.dashboard.activeAlerts')}</p>
              <p className="text-2xl font-bold text-red-600">{alerts} {t('app.dashboard.new')}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔔</span>
            </div>
          </div>
        </div>
      </div>

      {/* My Farm Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🌾 {t('app.dashboard.myFarmOverview')}</h2>
          <button 
            onClick={() => onNavigate && onNavigate('my-crops')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {t('app.dashboard.viewAllCrops')}
          </button>
        </div>
        <div className="space-y-4">
          {activeCrops.map(crop => {
            const isPriceBelowMSP = crop.price < crop.msp
            return (
              <div key={crop.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-green-300 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-4xl">{crop.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{translateCropName(crop.name)}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          crop.status === 'Growing' ? 'bg-green-100 text-green-700' :
                          crop.status === 'Planted' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {translateCropStatus(crop.status)} {crop.status === 'Growing' ? '🟢' : crop.status === 'Planted' ? '🌱' : '🌾'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span>⏱️ {t('app.dashboard.harvestIn')} <strong className="text-gray-900">{crop.daysLeft} {t('app.dashboard.days')}</strong></span>
                        <span>|</span>
                        <span>📏 {t('app.dashboard.area')}: <strong className="text-gray-900">{crop.area} {t('app.dashboard.hectares')}</strong></span>
                        <span>|</span>
                        <span>🌾 {t('app.dashboard.expectedYield')}: <strong className="text-gray-900">{crop.yield} kg/ha</strong></span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm mt-2">
                        <span className="text-gray-600">{t('app.dashboard.marketPrice')}: <strong className="text-blue-600">₹{crop.price.toLocaleString()}{t('app.dashboard.perQuintal')}</strong></span>
                        <span>|</span>
                        <span className="text-gray-600">{t('app.dashboard.msp')}: <strong className="text-gray-900">₹{crop.msp.toLocaleString()}</strong></span>
                        {isPriceBelowMSP && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            ⚠️ {(((crop.msp - crop.price) / crop.msp) * 100).toFixed(1)}% {t('app.dashboard.belowMSP')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onNavigate && onNavigate('my-crops')}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {t('app.dashboard.viewDetails')}
                    </button>
                    <button 
                      onClick={() => onNavigate && onNavigate('market-prices')}
                      className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                    >
                      {t('app.dashboard.setAlert')}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Market Intelligence & Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">📊 {t('app.dashboard.marketIntelligence')}</h2>
            <button 
              onClick={() => onNavigate && onNavigate('market-prices')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {t('app.dashboard.viewAllPrices')}
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('app.dashboard.trendingUp')} 📈</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">{translateCropName('Cotton')}</span>
                  <span className="text-green-700 font-bold">+8.5% (₹6,500)</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">{translateCropName('Rice')}</span>
                  <span className="text-green-700 font-bold">+5.2% (₹2,100)</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('app.dashboard.trendingDown')} 📉</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">{translateCropName('Wheat')}</span>
                  <span className="text-red-700 font-bold">-2.1% (₹2,250)</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">{translateCropName('Soybean')}</span>
                  <span className="text-red-700 font-bold">-3.5% (₹4,200)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">🔔 {t('app.dashboard.priceAlerts')}</h2>
            <button 
              onClick={() => onNavigate && onNavigate('market-prices')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {t('app.dashboard.manageAlerts')}
            </button>
          </div>
          <div className="space-y-3">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">✅</span>
                <h3 className="font-semibold text-green-900">{translateCropName('Rice')} {t('app.dashboard.reachedTarget')} ₹2,100</h3>
              </div>
              <p className="text-sm text-green-700">{t('app.dashboard.goodTimeToSell')}</p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">⚠️</span>
                <h3 className="font-semibold text-red-900">{translateCropName('Soybean')} 2.3% {t('app.dashboard.belowMSP')}</h3>
              </div>
              <p className="text-sm text-red-700">{t('app.dashboard.recommendation')}: {t('app.dashboard.holdAndSell')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Crop Recommendation Widget */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🌾 {t('app.dashboard.whatToPlantNext')}</h2>
            <p className="text-gray-600 mb-3">{t('app.dashboard.basedOnSoil')} (N:40, P:30, K:30) {t('app.dashboard.and')} {t('app.dashboard.rabi')} {t('app.dashboard.season')}:</p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold">{t('app.dashboard.topPick')}: {translateCropName('Wheat')}</span>
              <span className="px-3 py-1 bg-white border-2 border-green-600 text-green-700 rounded-full text-sm font-medium">85% {t('app.dashboard.confidence')}</span>
              <span className="text-gray-700">{t('app.dashboard.expectedProfit')}: <strong className="text-green-600">₹38,000/ha</strong></span>
            </div>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('recommendations')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold whitespace-nowrap"
          >
            {t('app.dashboard.getFullRecommendation')}
          </button>
        </div>
      </div>

      {/* Original Recommendations Section */}
      <section className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🎯</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('app.dashboard.recommendations')}</h2>
              <p className="text-sm text-gray-600">{t('app.dashboard.aiPoweredSuggestions')}</p>
            </div>
          </div>
          {recommendations.length > 0 && (
            <button onClick={() => { setRecommendations([]); localStorage.removeItem('recommendations'); setStats(prev => ({ ...prev, totalRecommendations: 0, favoriteCrop: null })) }} className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors">{t('app.dashboard.clearAll')}</button>
          )}
        </div>
        
        <RecommendationCards items={recommendations} />
      </section>
    </div>
  )
}
