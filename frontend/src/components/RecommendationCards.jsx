import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { translateCropName } from '../utils/cropTranslation'

const cropEmojis = {
  rice: '🌾',
  wheat: '🌾',
  cotton: '🧶',
  maize: '🌽',
  sugarcane: '🍬',
  soybean: '🌱',
  pulses: '🫘',
  groundnut: '🥜',
  chickpea: '🫘',
  kidneybeans: '🫘',
  pigeonpeas: '🫘',
  mothbeans: '🫘',
  mungbean: '🫘',
  blackgram: '🫘',
  lentil: '🫘',
  pomegranate: '🫐',
  banana: '🍌',
  mango: '🥭',
  grapes: '🍇',
  watermelon: '🍉',
  muskmelon: '🍈',
  apple: '🍎',
  orange: '🍊',
  papaya: '🥭',
  coconut: '🥥',
  jute: '🌱',
  coffee: '☕',
  default: '🌱'
}

const getCropEmoji = (cropName) => {
  const name = cropName.toLowerCase()
  return cropEmojis[name] || cropEmojis.default
}

const getConfidenceColor = (confidence) => {
  if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200'
  if (confidence >= 0.6) return 'text-blue-600 bg-blue-50 border-blue-200'
  return 'text-amber-600 bg-amber-50 border-amber-200'
}

const getConfidenceBadge = (confidence, t) => {
  if (confidence >= 0.9) return { label: t('app.recommendations.highlyRecommended'), color: 'bg-green-500' }
  if (confidence >= 0.7) return { label: t('app.recommendations.recommended'), color: 'bg-blue-500' }
  return { label: t('app.recommendations.consider'), color: 'bg-amber-500' }
}

export default function RecommendationCards({ items = [] }) {
  const { t } = useTranslation()
  const [selectedCrop, setSelectedCrop] = useState(null)

  if (!items.length) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-4xl">🌾</span>
        </div>
        <p className="text-gray-600 font-medium">{t('app.recommendations.noRecommendations')}</p>
        <p className="text-sm text-gray-500 mt-2">{t('app.recommendations.fillForm')}</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, idx) => {
        const badge = getConfidenceBadge(item.confidence, t)
        const confidencePercent = (item.confidence * 100).toFixed(0)
        
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:scale-105"
          >
            {/* Card Header with Badge */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center text-4xl">
                  {getCropEmoji(item.crop)}
                </div>
                <span className={`${badge.color} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                  {badge.label}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{translateCropName(item.crop)}</h3>
              {item.season && (
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                  <span>🌿</span> {item.season} {t('app.recommendations.season')}
                </p>
              )}
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-4">
              {/* Confidence Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{t('app.recommendations.confidenceScore')}</span>
                  <span className="text-lg font-bold text-green-600">{confidencePercent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${confidencePercent}%` }}
                  />
                </div>
              </div>

              {/* Reason */}
              {item.reason && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-xs font-semibold text-blue-900 mb-1">💡 {t('app.recommendations.whyThisCrop')}</p>
                  <p className="text-sm text-blue-700">{item.reason}</p>
                </div>
              )}

              {/* Expected Yield */}
              {item.expectedYield && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-amber-600">🌾</span>
                  <span className="text-gray-700">{t('app.recommendations.expectedYield')}:</span>
                  <span className="font-semibold text-gray-900">{item.expectedYield}</span>
                </div>
              )}

              {/* Profit Margin */}
              {item.profitMargin && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-600">💰</span>
                  <span className="text-gray-700">{t('app.recommendations.profitMargin')}:</span>
                  <span className="font-semibold text-green-700">{item.profitMargin}</span>
                </div>
              )}

              {/* Action Button */}
              <button 
                onClick={() => setSelectedCrop(item)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('app.recommendations.viewDetails')}
              </button>
            </div>
          </div>
        )
      })}
      </div>

      {/* Modal */}
      {selectedCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCrop(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-6 text-white relative">
              <button 
                onClick={() => setSelectedCrop(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center text-5xl">
                  {getCropEmoji(selectedCrop.crop)}
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{translateCropName(selectedCrop.crop)}</h2>
                  {selectedCrop.season && (
                    <p className="text-green-100 mt-1 flex items-center gap-2">
                      <span>🌿</span> {selectedCrop.season} {t('app.recommendations.season')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Confidence Score */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{t('app.recommendations.aiConfidenceScore')}</h3>
                  <span className="text-3xl font-bold text-green-600">{(selectedCrop.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                    style={{ width: `${(selectedCrop.confidence * 100).toFixed(0)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {t('app.recommendations.basedOnAnalysis')}
                </p>
              </div>

              {/* Why This Crop */}
              {selectedCrop.reason && (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span>💡</span> {t('app.recommendations.whyThisCrop')}
                  </h3>
                  <p className="text-gray-700">{selectedCrop.reason}</p>
                </div>
              )}

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCrop.expectedYield && (
                  <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">
                        🌾
                      </div>
                      <div>
                        <p className="text-xs text-amber-600 font-semibold uppercase">{t('app.recommendations.expectedYield')}</p>
                        <p className="text-xl font-bold text-gray-900">{selectedCrop.expectedYield}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{t('app.recommendations.avgProduction')}</p>
                  </div>
                )}

                {selectedCrop.profitMargin && (
                  <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                        💰
                      </div>
                      <div>
                        <p className="text-xs text-green-600 font-semibold uppercase">{t('app.recommendations.profitMargin')}</p>
                        <p className="text-xl font-bold text-gray-900">{selectedCrop.profitMargin}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{t('app.recommendations.estimatedProfit')}</p>
                  </div>
                )}
              </div>

              {/* Farming Tips */}
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📝</span> {t('app.recommendations.farmingTips')}
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>{t('app.recommendations.tip1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>{t('app.recommendations.tip2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>{t('app.recommendations.tip3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>{t('app.recommendations.tip4')}</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg">
                  {t('app.recommendations.saveToCrops')}
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-all">
                  {t('app.recommendations.share')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}