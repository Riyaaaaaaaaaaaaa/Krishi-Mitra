import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function AreaConverter({ onClose, onConvert }) {
  const { t } = useTranslation()
  const [acres, setAcres] = useState('')
  const [hectares, setHectares] = useState('')

  const handleAcresChange = (value) => {
    setAcres(value)
    if (value) {
      const hectareValue = (parseFloat(value) * 0.4047).toFixed(4)
      setHectares(hectareValue)
    } else {
      setHectares('')
    }
  }

  const handleHectaresChange = (value) => {
    setHectares(value)
    if (value) {
      const acreValue = (parseFloat(value) * 2.471).toFixed(4)
      setAcres(acreValue)
    } else {
      setAcres('')
    }
  }

  const handleUseValue = () => {
    if (hectares && onConvert) {
      onConvert(parseFloat(hectares))
      onClose()
    }
  }

  const commonSizes = [
    { label: t('app.converter.smallFarm'), acres: 2.5, hectares: 1.01 },
    { label: t('app.converter.mediumFarm'), acres: 10, hectares: 4.05 },
    { label: t('app.converter.largeFarm'), acres: 50, hectares: 20.23 }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl sticky top-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{t('app.converter.areaConverter')}</h2>
              <p className="text-green-100 text-sm mt-1">{t('app.converter.convertArea')}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Converter Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Acres Input */}
            <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('app.converter.acres')}
              </label>
              <input
                type="number"
                value={acres}
                onChange={(e) => handleAcresChange(e.target.value)}
                placeholder={t('app.converter.enterAcres')}
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg font-semibold"
                step="0.01"
              />
            </div>

            {/* Hectares Input */}
            <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('app.converter.hectares')}
              </label>
              <input
                type="number"
                value={hectares}
                onChange={(e) => handleHectaresChange(e.target.value)}
                placeholder={t('app.converter.enterHectares')}
                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 text-lg font-semibold"
                step="0.01"
              />
            </div>
          </div>

          {/* Conversion Formula */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>📐</span>
              {t('app.converter.conversionFormula')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-white p-3 rounded-lg">
                <span className="font-semibold text-blue-600">{t('app.converter.acreToHectare')}</span>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <span className="font-semibold text-green-600">{t('app.converter.hectareToAcre')}</span>
              </div>
            </div>
          </div>

          {/* Common Sizes */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border-2 border-amber-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>📏</span>
              {t('app.converter.commonSizes')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {commonSizes.map((size, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setAcres(size.acres.toString())
                    setHectares(size.hectares.toString())
                  }}
                  className="bg-white p-3 rounded-lg hover:shadow-md transition-shadow text-left border-2 border-transparent hover:border-amber-400"
                >
                  <p className="font-semibold text-gray-900 text-sm">{size.label}</p>
                  <p className="text-xs text-gray-600 mt-1">{size.acres} {t('app.converter.acres')}</p>
                  <p className="text-xs text-green-600 font-medium">= {size.hectares} {t('app.converter.hectares')}</p>
                </button>
              ))}
            </div>
          </div>

          {/* How to Use */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-xl border-2 border-cyan-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>💡</span>
              {t('app.converter.howToUse')}
            </h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="bg-cyan-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                <span>{t('app.converter.step1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-cyan-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                <span>{t('app.converter.step2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-cyan-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                <span>{t('app.converter.step3')}</span>
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              {t('app.settings.cancel')}
            </button>
            {onConvert && (
              <button
                onClick={handleUseValue}
                disabled={!hectares}
                className="flex-1 px-6 py-3 text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
              >
                {t('app.common.useValue')} ({hectares} ha)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
