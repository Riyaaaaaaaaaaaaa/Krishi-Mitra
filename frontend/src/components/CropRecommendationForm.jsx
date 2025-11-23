import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import AreaConverter from './AreaConverter'

// Regional benchmark data
const regionalBenchmarks = {
  'Punjab': { N: 80, P: 40, K: 40, rainfall: 70, temp: 22, ph: 7.0, mainCrops: 'Rice, Wheat' },
  'Maharashtra': { N: 60, P: 50, K: 45, rainfall: 110, temp: 26, ph: 6.8, mainCrops: 'Cotton, Soybean' },
  'Uttar Pradesh': { N: 70, P: 45, K: 40, rainfall: 90, temp: 25, ph: 7.2, mainCrops: 'Sugarcane, Wheat' },
  'Tamil Nadu': { N: 50, P: 40, K: 50, rainfall: 100, temp: 28, ph: 6.5, mainCrops: 'Rice, Cotton' },
  'West Bengal': { N: 75, P: 35, K: 35, rainfall: 160, temp: 27, ph: 6.0, mainCrops: 'Rice, Jute' },
  'Karnataka': { N: 55, P: 45, K: 50, rainfall: 90, temp: 25, ph: 6.8, mainCrops: 'Coffee, Cotton' },
  'Gujarat': { N: 50, P: 50, K: 50, rainfall: 80, temp: 27, ph: 7.5, mainCrops: 'Cotton, Groundnut' },
  'Andhra Pradesh': { N: 60, P: 45, K: 50, rainfall: 95, temp: 28, ph: 6.5, mainCrops: 'Rice, Cotton' },
  'Rajasthan': { N: 40, P: 40, K: 35, rainfall: 60, temp: 26, ph: 7.8, mainCrops: 'Bajra, Mustard' },
  'Madhya Pradesh': { N: 55, P: 45, K: 40, rainfall: 110, temp: 25, ph: 7.0, mainCrops: 'Soybean, Wheat' },
  'Haryana': { N: 75, P: 40, K: 40, rainfall: 65, temp: 23, ph: 7.2, mainCrops: 'Wheat, Rice' },
  'Bihar': { N: 70, P: 35, K: 35, rainfall: 120, temp: 26, ph: 6.5, mainCrops: 'Rice, Maize' },
  'Odisha': { N: 65, P: 40, K: 40, rainfall: 150, temp: 27, ph: 6.0, mainCrops: 'Rice, Pulses' },
  'Telangana': { N: 55, P: 45, K: 50, rainfall: 90, temp: 27, ph: 6.8, mainCrops: 'Cotton, Rice' },
  'Kerala': { N: 50, P: 30, K: 60, rainfall: 300, temp: 27, ph: 5.5, mainCrops: 'Coconut, Rubber' },
  'Assam': { N: 60, P: 30, K: 40, rainfall: 280, temp: 25, ph: 5.5, mainCrops: 'Rice, Tea' },
  'Jharkhand': { N: 60, P: 40, K: 40, rainfall: 140, temp: 25, ph: 6.5, mainCrops: 'Rice, Pulses' },
  'Uttarakhand': { N: 50, P: 35, K: 35, rainfall: 150, temp: 20, ph: 6.5, mainCrops: 'Rice, Wheat' },
  'Himachal Pradesh': { N: 45, P: 35, K: 35, rainfall: 120, temp: 18, ph: 6.8, mainCrops: 'Wheat, Maize' },
  'Jammu and Kashmir': { N: 40, P: 30, K: 30, rainfall: 110, temp: 16, ph: 7.0, mainCrops: 'Rice, Maize' }
}

// Tooltip content for NPK
const npkTooltips = {
  N: {
    title: 'Nitrogen (N)',
    description: 'Essential for leaf growth and green color. Promotes vegetative development.',
    ranges: 'Low (<40), Medium (40-80), High (>80) kg/ha'
  },
  P: {
    title: 'Phosphorus (P)',
    description: 'Critical for root development, flowering, and seed production.',
    ranges: 'Low (<30), Medium (30-60), High (>60) kg/ha'
  },
  K: {
    title: 'Potassium (K)',
    description: 'Strengthens stems, improves disease resistance and water regulation.',
    ranges: 'Low (<40), Medium (40-80), High (>80) kg/ha'
  }
}

export default function CropRecommendationForm({ onResult }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState({})
  const [touchedFields, setTouchedFields] = useState({})
  const [showTooltip, setShowTooltip] = useState(null)
  const [showBenchmarks, setShowBenchmarks] = useState(false)
  const [estimatedTime, setEstimatedTime] = useState(0)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showFirstTimeBanner, setShowFirstTimeBanner] = useState(true)
  const [showAreaConverter, setShowAreaConverter] = useState(false)
  
  const [formData, setFormData] = useState(() => {
    // Try to load draft from localStorage
    const savedDraft = localStorage.getItem('cropFormDraft')
    if (savedDraft) {
      try {
        return JSON.parse(savedDraft)
      } catch (e) {
        console.error('Failed to load draft:', e)
      }
    }
    return {
      N: '40',
      P: '30',
      K: '30',
      temperature: '25',
      humidity: '70',
      ph: '6.5',
      rainfall: '200',
      state: 'Punjab',
      season: 'Kharif',
      soil_type: 'Loam',
      irrigation: 'Flood',
      farm_size: 'Medium'
    }
  })

  // Validation function
  const validateField = (name, value) => {
    const errors = {}
    const numValue = parseFloat(value)

    switch(name) {
      case 'N':
        if (numValue < 0 || numValue > 140) errors[name] = `${t('app.form.validation.mustBeBetween')} 0-140 kg/ha`
        else if (numValue < 20) errors[name] = t('app.form.validation.veryLowNitrogen')
        break
      case 'P':
        if (numValue < 0 || numValue > 145) errors[name] = `${t('app.form.validation.mustBeBetween')} 0-145 kg/ha`
        else if (numValue < 15) errors[name] = t('app.form.validation.veryLowPhosphorus')
        break
      case 'K':
        if (numValue < 0 || numValue > 205) errors[name] = `${t('app.form.validation.mustBeBetween')} 0-205 kg/ha`
        else if (numValue < 20) errors[name] = t('app.form.validation.veryLowPotassium')
        break
      case 'temperature':
        if (numValue < 0 || numValue > 50) errors[name] = `${t('app.form.validation.mustBeBetween')} 0-50°C`
        else if (numValue < 10 || numValue > 45) errors[name] = t('app.form.validation.extremeTemperature')
        break
      case 'humidity':
        if (numValue < 0 || numValue > 100) errors[name] = `${t('app.form.validation.mustBeBetween')} 0-100%`
        break
      case 'ph':
        if (numValue < 0 || numValue > 14) errors[name] = `${t('app.form.validation.mustBeBetween')} 0-14`
        else if (numValue < 4.5 || numValue > 9) errors[name] = t('app.form.validation.extremePh')
        break
      case 'rainfall':
        if (numValue < 20 || numValue > 300) errors[name] = `${t('app.form.validation.mustBeBetween')} 20-300 mm`
        break
    }
    return errors
  }

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('cropFormDraft', JSON.stringify(formData))
    }, 1000)
    return () => clearTimeout(timer)
  }, [formData])

  // Show benchmarks when state changes
  useEffect(() => {
    if (formData.state && regionalBenchmarks[formData.state]) {
      setShowBenchmarks(true)
      const timer = setTimeout(() => setShowBenchmarks(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [formData.state])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Mark field as touched
    setTouchedFields(prev => ({ ...prev, [name]: true }))
    
    // Validate on change for numeric fields
    if (['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'].includes(name)) {
      const fieldErrors = validateField(name, value)
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        if (Object.keys(fieldErrors).length > 0) {
          newErrors[name] = fieldErrors[name]
        } else {
          delete newErrors[name]
        }
        return newErrors
      })
    }
  }

  const handleReset = () => {
    const defaultData = {
      N: '40',
      P: '30',
      K: '30',
      temperature: '25',
      humidity: '70',
      ph: '6.5',
      rainfall: '200',
      state: 'Punjab',
      season: 'Kharif',
      soil_type: 'Loam',
      irrigation: 'Flood',
      farm_size: 'Medium'
    }
    setFormData(defaultData)
    setValidationErrors({})
    setTouchedFields({})
    setError('')
    localStorage.removeItem('cropFormDraft')
    setShowResetDialog(false)
  }

  const applyBenchmark = () => {
    const benchmark = regionalBenchmarks[formData.state]
    if (benchmark) {
      setFormData(prev => ({
        ...prev,
        N: benchmark.N.toString(),
        P: benchmark.P.toString(),
        K: benchmark.K.toString(),
        rainfall: benchmark.rainfall.toString(),
        temperature: benchmark.temp.toString(),
        ph: benchmark.ph.toString()
      }))
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    
    // Check for validation errors
    if (Object.keys(validationErrors).length > 0) {
      setError(t('app.form.validation.fixErrors'))
      return
    }
    
    setLoading(true)
    setError('')
    setEstimatedTime(3) // Start 3 second countdown

    // Countdown timer
    const timer = setInterval(() => {
      setEstimatedTime(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    try {
      // Call backend API (which calls ML service)
      const response = await axios.post('http://localhost:5000/api/recommend', {
        N: parseFloat(formData.N),
        P: parseFloat(formData.P),
        K: parseFloat(formData.K),
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        ph: parseFloat(formData.ph),
        rainfall: parseFloat(formData.rainfall),
        state: formData.state,
        season: formData.season,
        soil_type: formData.soil_type,
        irrigation: formData.irrigation,
        farm_size: formData.farm_size
      })

      if (response.data && response.data.success && response.data.recommendations) {
        console.log('✅ Recommendations received:', response.data.recommendations)
        console.log('✅ Number of recommendations:', response.data.recommendations.length)
        onResult?.(response.data.recommendations)
        // Clear draft on successful submission
        localStorage.removeItem('cropFormDraft')
      } else {
        console.error('❌ Invalid response format:', response.data)
        throw new Error('Invalid response format from server')
      }
    } catch (err) {
      console.error('Prediction error:', err)
      clearInterval(timer)
      
      // Show error message to user
      if (err.response?.status === 503) {
        setError('ML service is not available. Please ensure the Flask server is running on port 5001.')
      } else if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError('Failed to get recommendations. Please try again.')
      }
    } finally {
      setLoading(false)
      setEstimatedTime(0)
      clearInterval(timer)
    }
  }

  // Helper to get translated NPK tooltips
  const getNPKTooltip = (nutrient) => ({
    title: t(`app.form.tooltips.${nutrient.toLowerCase()}.title`),
    description: t(`app.form.tooltips.${nutrient.toLowerCase()}.description`),
    ranges: t(`app.form.tooltips.${nutrient.toLowerCase()}.ranges`)
  })

  // Define states array with translation keys
  const statesList = [
    { value: 'Andhra Pradesh', key: 'andhraPradesh' },
    { value: 'Assam', key: 'assam' },
    { value: 'Bihar', key: 'bihar' },
    { value: 'Gujarat', key: 'gujarat' },
    { value: 'Haryana', key: 'haryana' },
    { value: 'Himachal Pradesh', key: 'himachalPradesh' },
    { value: 'Jammu and Kashmir', key: 'jammuKashmir' },
    { value: 'Karnataka', key: 'karnataka' },
    { value: 'Kerala', key: 'kerala' },
    { value: 'Madhya Pradesh', key: 'madhyaPradesh' },
    { value: 'Maharashtra', key: 'maharashtra' },
    { value: 'Odisha', key: 'odisha' },
    { value: 'Punjab', key: 'punjab' },
    { value: 'Rajasthan', key: 'rajasthan' },
    { value: 'Tamil Nadu', key: 'tamilNadu' },
    { value: 'Telangana', key: 'telangana' },
    { value: 'Uttar Pradesh', key: 'uttarPradesh' },
    { value: 'Uttarakhand', key: 'uttarakhand' },
    { value: 'West Bengal', key: 'westBengal' }
  ]

  // Helper function to get input border color based on validation state
  const getInputBorderClass = (fieldName) => {
    if (!touchedFields[fieldName]) return 'border-gray-300'
    if (validationErrors[fieldName]) {
      return validationErrors[fieldName].startsWith('Warning') 
        ? 'border-yellow-400 bg-yellow-50' 
        : 'border-red-400 bg-red-50'
    }
    return 'border-green-400 bg-green-50'
  }

  // Helper function to show validation icon
  const getValidationIcon = (fieldName) => {
    if (!touchedFields[fieldName] || !formData[fieldName]) return null
    if (validationErrors[fieldName]) {
      return validationErrors[fieldName].startsWith('Warning') 
        ? <span className="text-yellow-500 text-lg">⚠️</span>
        : <span className="text-red-500 text-lg">❌</span>
    }
    return <span className="text-green-500 text-lg">✅</span>
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* First Time Banner */}
      {showFirstTimeBanner && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 animate-fadeIn">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <span>👋</span>
                {t('app.form.firstTimeBanner.title')}
              </h4>
              <p className="text-sm text-green-800 mb-3">
                {t('app.form.firstTimeBanner.description')}
              </p>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="text-sm font-medium text-green-700 hover:text-green-800 underline flex items-center gap-1"
              >
                {t('app.form.firstTimeBanner.learnHow')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowFirstTimeBanner(false)}
              className="ml-4 text-green-600 hover:text-green-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Auto-save indicator */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {t('app.form.draftSaved')}
        </span>
        <button
          type="button"
          onClick={() => setShowResetDialog(true)}
          className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {t('app.form.resetForm')}
        </button>
      </div>

      {/* Regional Benchmarks Banner */}
      {showBenchmarks && regionalBenchmarks[formData.state] && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 animate-fadeIn">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <span>📊</span>
                {t('app.form.regionalBenchmarks')} {formData.state}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-blue-800">
                <div>
                  <span className="font-medium">N:</span> {regionalBenchmarks[formData.state].N} kg/ha
                </div>
                <div>
                  <span className="font-medium">P:</span> {regionalBenchmarks[formData.state].P} kg/ha
                </div>
                <div>
                  <span className="font-medium">K:</span> {regionalBenchmarks[formData.state].K} kg/ha
                </div>
                <div>
                  <span className="font-medium">{t('app.form.annualRainfall')}:</span> {regionalBenchmarks[formData.state].rainfall} mm
                </div>
                <div>
                  <span className="font-medium">{t('app.form.temperature')}:</span> {regionalBenchmarks[formData.state].temp}°C
                </div>
                <div>
                  <span className="font-medium">pH:</span> {regionalBenchmarks[formData.state].ph}
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                🌾 {t('app.form.mainCrops')}: {regionalBenchmarks[formData.state].mainCrops}
              </p>
            </div>
            <button
              type="button"
              onClick={applyBenchmark}
              className="ml-4 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              {t('app.form.applyValues')}
            </button>
          </div>
        </div>
      )}

      {/* Soil Nutrients Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-green-600">🌱</span>
          {t('app.form.soilNutrients')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['N', 'P', 'K'].map((nutrient) => {
            const tooltip = getNPKTooltip(nutrient)
            return (
            <div key={nutrient}>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-1">
                  {t(`app.form.${nutrient === 'N' ? 'nitrogen' : nutrient === 'P' ? 'phosphorus' : 'potassium'}`)}
                </span>
                <button
                  type="button"
                  onMouseEnter={() => setShowTooltip(nutrient)}
                  onMouseLeave={() => setShowTooltip(null)}
                  className="text-gray-400 hover:text-blue-600 relative"
                >
                  <span className="text-xs">ℹ️</span>
                  {showTooltip === nutrient && (
                    <div className="absolute z-50 right-0 top-6 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                      <div className="font-semibold mb-1">{tooltip.title}</div>
                      <div className="mb-2">{tooltip.description}</div>
                      <div className="text-gray-300 italic">{tooltip.ranges}</div>
                      <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                    </div>
                  )}
                </button>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name={nutrient}
                  value={formData[nutrient]}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2.5 pr-20 text-sm focus:ring-1 transition-all ${
                    getInputBorderClass(nutrient)
                  } ${validationErrors[nutrient] ? 'focus:border-red-500 focus:ring-red-500' : 'focus:border-green-500 focus:ring-green-500'}`}
                  placeholder={nutrient === 'N' ? '40' : '30'}
                  min="0"
                  max={nutrient === 'N' ? 140 : nutrient === 'P' ? 145 : 205}
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {getValidationIcon(nutrient)}
                  <span className="text-xs text-gray-500">kg/ha</span>
                </div>
              </div>
              {touchedFields[nutrient] && validationErrors[nutrient] && (
                <p className={`text-xs mt-1 ${
                  validationErrors[nutrient].startsWith('Warning') ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {validationErrors[nutrient]}
                </p>
              )}
            </div>
          )})
        }
        </div>
      </div>

      {/* Climate Conditions Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-orange-500">☀️</span>
          {t('app.form.climateConditions')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">{t('app.form.temperature')}</label>
            <div className="relative">
              <input
                type="number"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2.5 pr-20 text-sm focus:ring-1 transition-all ${
                  getInputBorderClass('temperature')
                } ${validationErrors.temperature ? 'focus:border-red-500 focus:ring-red-500' : 'focus:border-orange-500 focus:ring-orange-500'}`}
                placeholder="25"
                min="0"
                max="50"
                step="0.1"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {getValidationIcon('temperature')}
                <span className="text-xs text-gray-500">°C</span>
              </div>
            </div>
            {touchedFields.temperature && validationErrors.temperature && (
              <p className={`text-xs mt-1 ${
                validationErrors.temperature.startsWith('Warning') ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {validationErrors.temperature}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">{t('app.form.humidity')}</label>
            <div className="relative">
              <input
                type="number"
                name="humidity"
                value={formData.humidity}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2.5 pr-20 text-sm focus:ring-1 transition-all ${
                  getInputBorderClass('humidity')
                } ${validationErrors.humidity ? 'focus:border-red-500 focus:ring-red-500' : 'focus:border-orange-500 focus:ring-orange-500'}`}
                placeholder="70"
                min="0"
                max="100"
                step="0.1"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {getValidationIcon('humidity')}
                <span className="text-xs text-gray-500">%</span>
              </div>
            </div>
            {touchedFields.humidity && validationErrors.humidity && (
              <p className="text-xs mt-1 text-red-600">{validationErrors.humidity}</p>
            )}
          </div>
        </div>
      </div>

      {/* Soil Properties Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-blue-500">🌊</span>
          {t('app.form.soilProperties')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
              <span>{t('app.form.phLevel')}</span>
              <span className="text-xs text-gray-500">0-14</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="ph"
                value={formData.ph}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2.5 pr-12 text-sm focus:ring-1 transition-all ${
                  getInputBorderClass('ph')
                } ${validationErrors.ph ? 'focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}
                placeholder="6.5"
                min="0"
                max="14"
                step="0.1"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {getValidationIcon('ph')}
              </div>
            </div>
            {touchedFields.ph && validationErrors.ph && (
              <p className={`text-xs mt-1 ${
                validationErrors.ph.startsWith('Warning') ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {validationErrors.ph}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">{t('app.form.annualRainfall')}</label>
            <div className="relative">
              <input
                type="number"
                name="rainfall"
                value={formData.rainfall}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2.5 pr-20 text-sm focus:ring-1 transition-all ${
                  getInputBorderClass('rainfall')
                } ${validationErrors.rainfall ? 'focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}
                placeholder="200"
                min="20"
                max="300"
                step="0.1"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {getValidationIcon('rainfall')}
                <span className="text-xs text-gray-500">mm</span>
              </div>
            </div>
            {touchedFields.rainfall && validationErrors.rainfall && (
              <p className="text-xs mt-1 text-red-600">{validationErrors.rainfall}</p>
            )}
          </div>
        </div>
      </div>

      {/* Location & Farm Details Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-purple-500">🗺️</span>
          {t('app.form.locationFarm')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">{t('app.form.state')}</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              required
            >
              {statesList.map(state => (
                <option key={state.value} value={state.value}>
                  {t(`app.form.states.${state.key}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">{t('app.form.season')}</label>
            <select
              name="season"
              value={formData.season}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              required
            >
              <option value="Kharif">{t('app.form.seasons.kharif')}</option>
              <option value="Rabi">{t('app.form.seasons.rabi')}</option>
              <option value="Zaid">{t('app.form.seasons.zaid')}</option>
              <option value="Year-round">{t('app.form.seasons.yearRound')}</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">{t('app.form.soilType')}</label>
            <select
              name="soil_type"
              value={formData.soil_type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              required
            >
              <option value="Clay">{t('app.form.soilTypes.clay')}</option>
              <option value="Clay-Loam">{t('app.form.soilTypes.clayLoam')}</option>
              <option value="Loam">{t('app.form.soilTypes.loam')}</option>
              <option value="Sandy">{t('app.form.soilTypes.sandy')}</option>
              <option value="Sandy-Loam">{t('app.form.soilTypes.sandyLoam')}</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">{t('app.form.irrigation')}</label>
            <select
              name="irrigation"
              value={formData.irrigation}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              required
            >
              <option value="Rainfed">{t('app.form.irrigationTypes.rainfed')}</option>
              <option value="Flood">{t('app.form.irrigationTypes.flood')}</option>
              <option value="Drip">{t('app.form.irrigationTypes.drip')}</option>
              <option value="Sprinkler">{t('app.form.irrigationTypes.sprinkler')}</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">{t('app.form.farmSize')}</label>
              <button
                type="button"
                onClick={() => setShowAreaConverter(true)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:underline"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                {t('app.converter.areaConverter')}
              </button>
            </div>
            <select
              name="farm_size"
              value={formData.farm_size}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              required
            >
              <option value="Small">{t('app.form.farmSizes.small')}</option>
              <option value="Medium">{t('app.form.farmSizes.medium')}</option>
              <option value="Large">{t('app.form.farmSizes.large')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || Object.keys(validationErrors).length > 0}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base relative overflow-hidden"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="flex items-center gap-2">
              {t('app.form.analyzing')}
              {estimatedTime > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{estimatedTime}s</span>
              )}
            </span>
          </>
        ) : (
          <>
            <span>🌾</span>
            {t('app.form.getRecommendations')}
          </>
        )}
      </button>

      {/* Reset Confirmation Dialog */}
      {showResetDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowResetDialog(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('app.form.resetDialog.title')}</h3>
                <p className="text-sm text-gray-600">{t('app.form.resetDialog.message')}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetDialog(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                {t('app.form.resetDialog.cancel')}
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                {t('app.form.resetDialog.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Area Converter Modal */}
      {showAreaConverter && (
        <AreaConverter 
          onClose={() => setShowAreaConverter(false)}
          onConvert={(hectares) => {
            // Optionally update form with hectare value or just close
            console.log('Converted to hectares:', hectares)
          }}
        />
      )}
    </form>
  )
}