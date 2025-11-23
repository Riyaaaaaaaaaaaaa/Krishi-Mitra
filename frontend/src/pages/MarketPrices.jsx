import React, { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getMarketPrices, getPriceHistory, getUserAlerts, deletePriceAlert, createPriceAlert } from '../services/marketApi'
import { translateCropName } from '../utils/cropTranslation'

// Function to translate mandi/market names to Hindi
const translateMarketName = (marketName, language) => {
  if (language !== 'hi') return marketName
  
  const marketTranslations = {
    'Delhi Mandi': 'दिल्ली मंडी',
    'Mumbai Mandi': 'मुंबई मंडी',
    'Bangalore Mandi': 'बेंगलुरु मंडी',
    'Hyderabad Mandi': 'हैदराबाद मंडी',
    'Pune Mandi': 'पुणे मंडी',
    'Indore Mandi': 'इंदौर मंडी',
    'Lucknow Mandi': 'लखनऊ मंडी',
    'Jaipur Mandi': 'जयपुर मंडी',
    'Ahmedabad Mandi': 'अहमदाबाद मंडी',
    'Kolkata Mandi': 'कोलकाता मंडी',
    'Chennai Mandi': 'चेन्नई मंडी',
    'Chandigarh Mandi': 'चंडीगढ़ मंडी',
    'Patna Mandi': 'पटना मंडी',
    'Bhopal Mandi': 'भोपाल मंडी',
    'Nagpur Mandi': 'नागपुर मंडी',
    'Mandi': 'मंडी'
  }
  
  // Try exact match first
  if (marketTranslations[marketName]) {
    return marketTranslations[marketName]
  }
  
  // If contains 'Mandi', replace it
  if (marketName.includes('Mandi')) {
    return marketName.replace('Mandi', 'मंडी')
  }
  
  return marketName
}

export default function MarketPrices() {
  const { t, i18n } = useTranslation()
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedState, setSelectedState] = useState('all')
  const [selectedDistrict, setSelectedDistrict] = useState('all')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [showPriceChart, setShowPriceChart] = useState(null)
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [priceHistory, setPriceHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [loadingAlerts, setLoadingAlerts] = useState(false)
  const [showAddAlert, setShowAddAlert] = useState(false)
  const [newAlert, setNewAlert] = useState({ commodity: '', targetPrice: '', type: 'above' })
  const [deletedAlert, setDeletedAlert] = useState(null)
  const [showUndo, setShowUndo] = useState(false)
  
  // Fetch market prices on component mount and when filters change
  useEffect(() => {
    fetchMarketPrices()
  }, [selectedState, selectedDistrict])

  // Fetch alerts on mount
  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    setLoadingAlerts(true)
    try {
      const data = await getUserAlerts()
      setAlerts(data)
    } catch (err) {
      console.error('Failed to fetch alerts:', err)
    } finally {
      setLoadingAlerts(false)
    }
  }

  const fetchMarketPrices = async () => {
    setLoading(true)
    setError(null)
    try {
      const filters = {
        state: selectedState,
        district: selectedDistrict
      }
      const data = await getMarketPrices(filters)
      setPrices(data)
    } catch (err) {
      setError(err.message)
      console.error('Failed to fetch market prices:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setLastRefresh(new Date())
    await fetchMarketPrices()
  }

  const handleShowChart = async (cropId) => {
    setShowPriceChart(cropId)
    setLoadingHistory(true)
    try {
      const history = await getPriceHistory(cropId, 30)
      setPriceHistory(history)
    } catch (err) {
      console.error('Failed to fetch price history:', err)
      setPriceHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedState('all')
    setSelectedDistrict('all')
  }

  const hasActiveFilters = searchTerm !== '' || selectedState !== 'all' || selectedDistrict !== 'all'

  const handleDismissAlert = async (alertId) => {
    const alertToDelete = alerts.find(a => a.id === alertId)
    
    // Remove from UI immediately
    setAlerts(alerts.filter(a => a.id !== alertId))
    
    // Store for undo
    setDeletedAlert(alertToDelete)
    setShowUndo(true)
    
    // Auto-hide undo after 5 seconds
    const undoTimer = setTimeout(() => {
      setShowUndo(false)
      setDeletedAlert(null)
    }, 5000)
    
    // Actually delete from backend
    const deleteTimer = setTimeout(async () => {
      if (deletedAlert?.id === alertId) {
        await deletePriceAlert(alertId)
      }
    }, 5000)
    
    // Store timers for cleanup
    window.undoTimer = undoTimer
    window.deleteTimer = deleteTimer
  }

  const handleUndoDelete = () => {
    if (deletedAlert) {
      // Restore alert to list
      setAlerts([...alerts, deletedAlert])
      setDeletedAlert(null)
      setShowUndo(false)
      
      // Clear timers
      if (window.undoTimer) clearTimeout(window.undoTimer)
      if (window.deleteTimer) clearTimeout(window.deleteTimer)
    }
  }

  const handleAddAlert = async () => {
    if (!newAlert.commodity || !newAlert.targetPrice) {
      alert('Please fill in all fields')
      return
    }

    try {
      const alert = await createPriceAlert({
        commodity: newAlert.commodity,
        targetPrice: parseFloat(newAlert.targetPrice),
        type: newAlert.type
      })
      setAlerts([...alerts, alert.alert])
      setShowAddAlert(false)
      setNewAlert({ commodity: '', targetPrice: '', type: 'above' })
    } catch (err) {
      console.error('Failed to create alert:', err)
      alert('Failed to create alert')
    }
  }

  // Get unique states and districts for filters
  const states = useMemo(() => {
    const uniqueStates = [...new Set(prices.map(p => p.state))].sort()
    return uniqueStates
  }, [prices])

  const districts = useMemo(() => {
    if (selectedState === 'all') return []
    return [...new Set(prices.filter(p => p.state === selectedState).map(p => p.district))].sort()
  }, [prices, selectedState])

  // Filter and sort prices
  const filteredAndSortedPrices = useMemo(() => {
    let filtered = prices

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.market.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // State filter
    if (selectedState !== 'all') {
      filtered = filtered.filter(item => item.state === selectedState)
    }

    // District filter
    if (selectedDistrict !== 'all') {
      filtered = filtered.filter(item => item.district === selectedDistrict)
    }

    // Sorting
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        let aVal = a[sortConfig.key]
        let bVal = b[sortConfig.key]

        if (sortConfig.key === 'crop' || sortConfig.key === 'market') {
          aVal = aVal.toLowerCase()
          bVal = bVal.toLowerCase()
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [prices, searchTerm, selectedState, selectedDistrict, sortConfig])

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getMSPStatus = (price, msp) => {
    if (msp === 0) return null // No MSP for fruits/vegetables
    const diff = ((price - msp) / msp * 100).toFixed(1)
    return { diff: parseFloat(diff), aboveMSP: price > msp }
  }

  // Calculate stats from filtered data
  const trendingUp = filteredAndSortedPrices.filter(p => p.trend === 'up').length
  const trendingDown = filteredAndSortedPrices.filter(p => p.trend === 'down').length
  const avgChange = filteredAndSortedPrices.length > 0 
    ? (filteredAndSortedPrices.reduce((sum, p) => sum + p.change, 0) / filteredAndSortedPrices.length).toFixed(1)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('app.marketPrices.pageTitle')}</h1>
          <p className="text-gray-600 mt-1">{t('app.marketPrices.pageSubtitle')}</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {t('app.marketPrices.refreshPrices')}
        </button>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">{t('app.marketPrices.trendingUp')}</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{trendingUp} {t('app.marketPrices.crops')}</p>
            </div>
            <div className="text-4xl">📈</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">{t('app.marketPrices.trendingDown')}</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{trendingDown} {t('app.marketPrices.crops')}</p>
            </div>
            <div className="text-4xl">📉</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">{t('app.marketPrices.avgPriceChange')}</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{avgChange > 0 ? '+' : ''}{avgChange}%</p>
            </div>
            <div className="text-4xl">💹</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('app.marketPrices.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* State Filter */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value)
                setSelectedDistrict('all')
              }}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">{t('app.marketPrices.allStates')}</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={selectedState === 'all'}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="all">{t('app.marketPrices.allDistricts')}</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Active Filters Pills & Clear Button */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">{t('app.marketPrices.activeFilters')}:</span>
            
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTerm}
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            
            {selectedState !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {selectedState}
                <button
                  onClick={() => {
                    setSelectedState('all')
                    setSelectedDistrict('all')
                  }}
                  className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            
            {selectedDistrict !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {selectedDistrict}
                <button
                  onClick={() => setSelectedDistrict('all')}
                  className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            
            <button
              onClick={clearAllFilters}
              className="ml-auto inline-flex items-center gap-1 px-4 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-full text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {t('app.marketPrices.clearAllFilters')}
            </button>
          </div>
        )}
        
        {/* Results count */}
        <div className="mt-3 text-sm text-gray-600">
          {t('app.marketPrices.showing')} <span className="font-semibold">{filteredAndSortedPrices.length}</span> {t('app.marketPrices.results')}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading market prices...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Prices</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Price Table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <h2 className="text-xl font-bold text-gray-900">{t('app.marketPrices.currentMarketPrices')} ({t('app.marketPrices.perQuintal')})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  onClick={() => handleSort('crop')}
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    {t('app.marketPrices.commodity')}
                    {sortConfig.key === 'crop' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('price')}
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    {t('app.marketPrices.currentPrice')}
                    {sortConfig.key === 'price' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('app.marketPrices.msp')}</th>
                <th 
                  onClick={() => handleSort('change')}
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    {t('app.marketPrices.change24h')}
                    {sortConfig.key === 'change' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('market')}
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    {t('app.marketPrices.market')}
                    {sortConfig.key === 'market' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('app.marketPrices.lastUpdated')}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('app.marketPrices.trend')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedPrices.map((item) => {
                const mspStatus = getMSPStatus(item.price, item.msp)
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🌾</span>
                        <div className="text-sm font-medium text-gray-900">{translateCropName(item.crop)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-gray-900">₹{item.price.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {mspStatus ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-700">₹{item.msp.toLocaleString()}</span>
                          <span className={`text-xs font-medium ${
                            mspStatus.aboveMSP ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {mspStatus.aboveMSP ? '↑' : '↓'} {Math.abs(mspStatus.diff)}% {t(mspStatus.aboveMSP ? 'app.marketPrices.aboveMSP' : 'app.marketPrices.belowMSP')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">{t('app.marketPrices.noMSP')}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        item.change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.change > 0 ? '↑' : '↓'} {Math.abs(item.change)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{translateMarketName(item.market, i18n.language)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.lastUpdated.includes('hour') 
                        ? item.lastUpdated.replace('hours ago', t('app.marketPrices.hoursAgo')).replace('hour ago', t('app.marketPrices.hourAgo'))
                        : item.lastUpdated
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleShowChart(item.id)}
                        className="text-2xl hover:scale-110 transition-transform cursor-pointer"
                        title="View price trend"
                      >
                        {item.trend === 'up' ? '📈' : '📉'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {/* Price Alerts */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{t('app.marketPrices.priceAlerts')}</h2>
          <button 
            onClick={() => setShowAddAlert(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('app.marketPrices.addAlert').replace('+ ', '')}
          </button>
        </div>
        
        {loadingAlerts ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🔔</div>
            <p>{t('app.marketPrices.noAlertsSet')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const isAbove = alert.type === 'above'
              return (
                <div 
                  key={alert.id}
                  className={`border-l-4 p-4 rounded flex items-center justify-between ${
                    isAbove 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{isAbove ? '✅' : '🔔'}</span>
                    <div>
                      <h3 className={`font-semibold ${
                        isAbove ? 'text-green-900' : 'text-blue-900'
                      }`}>
                        {translateCropName(alert.commodity)} {t('app.marketPrices.priceAlert')}
                      </h3>
                      <p className={`text-sm ${
                        isAbove ? 'text-green-700' : 'text-blue-700'
                      }`}>
                        {t('app.marketPrices.alertWhenPriceGoes')} {alert.type} ₹{alert.targetPrice}/quintal
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDismissAlert(alert.id)}
                    className={`hover:underline ${
                      isAbove ? 'text-green-700 hover:text-green-900' : 'text-blue-700 hover:text-blue-900'
                    }`}
                  >
                    {t('app.marketPrices.dismiss')}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Price Chart Modal */}
      {showPriceChart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full">
            {(() => {
              const crop = prices.find(p => p.id === showPriceChart)
              return (
                <>
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{translateCropName(crop.crop)} - {t('app.marketPrices.priceChart')}</h3>
                        <p className="text-sm text-blue-100">{translateMarketName(crop.market, i18n.language)}</p>
                      </div>
                      <button
                        onClick={() => setShowPriceChart(null)}
                        className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 text-center">
                      <div className="text-6xl mb-4">📈</div>
                      <p className="text-lg text-gray-700 mb-2">Price Trend Chart</p>
                      <p className="text-sm text-gray-500">This feature will show 30-day price history</p>
                      <div className="mt-6 grid grid-cols-3 gap-4 text-left">
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-xs text-gray-500">Current Price</p>
                          <p className="text-lg font-bold text-gray-900">₹{crop.price.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-xs text-gray-500">24h Change</p>
                          <p className={`text-lg font-bold ${crop.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {crop.change > 0 ? '+' : ''}{crop.change}%
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-xs text-gray-500">Trend</p>
                          <p className="text-lg">{crop.trend === 'up' ? '📈 Bullish' : '📉 Bearish'}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPriceChart(null)}
                      className="w-full mt-4 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                    >
                      {t('app.marketPrices.closeChart')}
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* Add Alert Modal */}
      {showAddAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{t('app.marketPrices.createPriceAlert')}</h3>
                <button
                  onClick={() => setShowAddAlert(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('app.marketPrices.commodity')}</label>
                <select
                  value={newAlert.commodity}
                  onChange={(e) => setNewAlert({...newAlert, commodity: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">{t('app.marketPrices.selectCrop')}</option>
                  {['Rice', 'Wheat', 'Cotton', 'Maize', 'Soybean', 'Chickpea', 'Kidney Beans', 'Pigeon Peas', 'Moth Beans', 'Mung Bean', 'Black Gram', 'Lentil'].map(crop => (
                    <option key={crop} value={crop}>{translateCropName(crop)}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('app.marketPrices.targetPrice')} (₹/quintal)</label>
                <input
                  type="number"
                  value={newAlert.targetPrice}
                  onChange={(e) => setNewAlert({...newAlert, targetPrice: e.target.value})}
                  placeholder="e.g., 2100"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('app.marketPrices.alertType')}</label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="above"
                      checked={newAlert.type === 'above'}
                      onChange={(e) => setNewAlert({...newAlert, type: e.target.value})}
                      className="mr-2"
                    />
                    <span className="text-sm">{t('app.marketPrices.abovePrice')}</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="below"
                      checked={newAlert.type === 'below'}
                      onChange={(e) => setNewAlert({...newAlert, type: e.target.value})}
                      className="mr-2"
                    />
                    <span className="text-sm">{t('app.marketPrices.belowPrice')}</span>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddAlert(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  {t('app.marketPrices.cancel')}
                </button>
                <button
                  onClick={handleAddAlert}
                  className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
                >
                  {t('app.marketPrices.createAlert')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Undo Notification */}
      {showUndo && deletedAlert && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="bg-gray-900 text-white rounded-lg shadow-2xl p-4 flex items-center gap-4 max-w-md">
            <div className="flex-1">
              <p className="font-medium">{t('app.marketPrices.alertDeleted')}</p>
              <p className="text-sm text-gray-300">{translateCropName(deletedAlert.commodity)} - ₹{deletedAlert.targetPrice}</p>
            </div>
            <button
              onClick={handleUndoDelete}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {t('app.marketPrices.undo')}
            </button>
            <button
              onClick={() => setShowUndo(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
