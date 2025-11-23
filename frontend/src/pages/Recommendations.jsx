import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import CropRecommendationForm from '../components/CropRecommendationForm'
import RecommendationCards from '../components/RecommendationCards'
import VoiceInput from '../components/VoiceInput'

export default function Recommendations() {
  const { t } = useTranslation()
  const [recommendations, setRecommendations] = useState([])

  useEffect(() => {
    // Load saved recommendations from localStorage
    const saved = localStorage.getItem('recommendations')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setRecommendations(parsed)
      } catch (e) {
        console.error('Failed to load recommendations:', e)
      }
    }
  }, [])

  const handleNewRecommendations = (newRecs) => {
    console.log('📥 Recommendations page received:', newRecs)
    setRecommendations(newRecs)
    localStorage.setItem('recommendations', JSON.stringify(newRecs))
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('app.recommendations.pageTitle')}</h1>
        <p className="text-gray-600 mt-1">{t('app.recommendations.pageSubtitle')}</p>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-6 rounded-lg">
        <div className="flex items-start">
          <span className="text-3xl mr-4">🤖</span>
          <div>
            <h3 className="font-semibold text-purple-900 text-lg">{t('app.recommendations.aiPoweredTitle')}</h3>
            <p className="text-sm text-purple-700 mt-1">
              {t('app.recommendations.aiPoweredDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Recommendation Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">🌱</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{t('app.recommendations.enterFarmTitle')}</h2>
            <p className="text-sm text-gray-600">{t('app.recommendations.enterFarmDesc')}</p>
          </div>
        </div>
        
        {/*<div className="mb-4">
          <VoiceInput onTranscript={(text) => console.log('Transcript:', text)} />
        </div>*/}
        
        <CropRecommendationForm onResult={handleNewRecommendations} />
      </div>

      {/* Results Section */}
      <div id="results-section" className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🎯</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('app.recommendations.yourRecommendations')}</h2>
              <p className="text-sm text-gray-600">{t('app.recommendations.yourRecommendationsDesc')}</p>
            </div>
          </div>
          {recommendations.length > 0 && (
            <button 
              onClick={() => { 
                setRecommendations([]); 
                localStorage.removeItem('recommendations'); 
              }} 
              className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              {t('app.recommendations.clearAll')}
            </button>
          )}
        </div>
        
        <RecommendationCards items={recommendations} />
      </div>

      {/* How it Works */}
      <div id="how-it-works" className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('app.recommendations.howItWorks')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('app.recommendations.step1Title')}</h3>
            <p className="text-sm text-gray-600">{t('app.recommendations.step1Desc')}</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🧠</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('app.recommendations.step2Title')}</h3>
            <p className="text-sm text-gray-600">{t('app.recommendations.step2Desc')}</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🌾</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('app.recommendations.step3Title')}</h3>
            <p className="text-sm text-gray-600">{t('app.recommendations.step3Desc')}</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚜</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('app.recommendations.step4Title')}</h3>
            <p className="text-sm text-gray-600">{t('app.recommendations.step4Desc')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
