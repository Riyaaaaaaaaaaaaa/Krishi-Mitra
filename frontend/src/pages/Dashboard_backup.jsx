import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import RecommendationCards from '../components/RecommendationCards.jsx'

export default function Dashboard() {
  const { t } = useTranslation()
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
    icon: '☀️'
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

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Good {currentDateTime.getHours() < 12 ? 'Morning' : currentDateTime.getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name || 'Farmer'}! 🌾
            </h2>
            <p className="text-green-100 flex flex-wrap items-center gap-2">
              <span>📍 Madhya Pradesh | Indore District</span>
              <span className="hidden md:inline">|</span>
              <span>Weather: {weather.temp}°C, Humidity {weather.humidity}%</span>
              <span className="hidden md:inline">|</span>
              <span>Season: Kharif</span>
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{weather.icon}</div>
              <div>
                <div className="text-3xl font-bold">{weather.temp}°C</div>
                <div className="text-green-100 text-sm">{weather.condition}</div>
                <div className="text-green-200 text-xs">💧 {weather.humidity}% Humidity</div>
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
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">🌱 My Crops</p>
              <p className="text-2xl font-bold text-gray-900">{activeCrops.length} Active</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🌾</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">📈 Avg Price Change</p>
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
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">💰 Potential Revenue</p>
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
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">🎯 Active Alerts</p>
              <p className="text-2xl font-bold text-red-600">{alerts} New</p>
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
          <h2 className="text-2xl font-bold text-gray-900">🌾 MY FARM OVERVIEW</h2>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            <span>+</span> Add New Crop
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
                        <h3 className="text-lg font-bold text-gray-900">{crop.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          crop.status === 'Growing' ? 'bg-green-100 text-green-700' :
                          crop.status === 'Planted' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {crop.status} {crop.status === 'Growing' ? '🟢' : crop.status === 'Planted' ? '🌱' : '🌾'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span>⏱️ Harvest in <strong className="text-gray-900">{crop.daysLeft} days</strong></span>
                        <span>|</span>
                        <span>📏 Area: <strong className="text-gray-900">{crop.area} hectares</strong></span>
                        <span>|</span>
                        <span>🌾 Expected Yield: <strong className="text-gray-900">{crop.yield} kg/ha</strong></span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm mt-2">
                        <span className="text-gray-600">Market Price: <strong className="text-blue-600">₹{crop.price.toLocaleString()}/quintal</strong></span>
                        <span>|</span>
                        <span className="text-gray-600">MSP: <strong className="text-gray-900">₹{crop.msp.toLocaleString()}</strong></span>
                        {isPriceBelowMSP && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            ⚠️ {(((crop.msp - crop.price) / crop.msp) * 100).toFixed(1)}% below MSP
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">View Details</button>
                    <button className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors">Set Alert</button>
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
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 MARKET INTELLIGENCE</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Trending Up 📈</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">Cotton</span>
                  <span className="text-green-700 font-bold">+8.5% (₹6,500)</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">Rice</span>
                  <span className="text-green-700 font-bold">+5.2% (₹2,100)</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Trending Down 📉</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">Wheat</span>
                  <span className="text-red-700 font-bold">-2.1% (₹2,250)</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">Soybean</span>
                  <span className="text-red-700 font-bold">-3.5% (₹4,200)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">🔔 PRICE ALERTS</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Manage Alerts</button>
          </div>
          <div className="space-y-3">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">✅</span>
                <h3 className="font-semibold text-green-900">Rice reached ₹2,100 target</h3>
              </div>
              <p className="text-sm text-green-700">Market price is above your target - Good time to sell!</p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">⚠️</span>
                <h3 className="font-semibold text-red-900">Soybean 2.3% below MSP</h3>
              </div>
              <p className="text-sm text-red-700">Recommendation: Hold and sell to govt procurement</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Crop Recommendation Widget */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🌾 What to Plant Next Season?</h2>
            <p className="text-gray-600 mb-3">Based on your soil (N:40, P:30, K:30) and Rabi season:</p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold">Top Pick: Wheat</span>
              <span className="px-3 py-1 bg-white border-2 border-green-600 text-green-700 rounded-full text-sm font-medium">85% confidence</span>
              <span className="text-gray-700">Expected Profit: <strong className="text-green-600">₹38,000/ha</strong></span>
            </div>
          </div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold whitespace-nowrap">
            Get Full Recommendation
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
