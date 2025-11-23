import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function HelpSupport() {
  const { t } = useTranslation()
  
  // FAQs array - will update when language changes
  const faqs = [
    {
      question: t('app.helpSupport.faq1Q'),
      answer: t('app.helpSupport.faq1A')
    },
    {
      question: t('app.helpSupport.faq2Q'),
      answer: t('app.helpSupport.faq2A')
    },
    {
      question: t('app.helpSupport.faq3Q'),
      answer: t('app.helpSupport.faq3A')
    },
    {
      question: t('app.helpSupport.faq4Q'),
      answer: t('app.helpSupport.faq4A')
    },
    {
      question: t('app.helpSupport.faq5Q'),
      answer: t('app.helpSupport.faq5A')
    },
    {
      question: t('app.helpSupport.faq6Q'),
      answer: t('app.helpSupport.faq6A')
    },
    {
      question: t('app.helpSupport.faq7Q'),
      answer: t('app.helpSupport.faq7A')
    },
    {
      question: t('app.helpSupport.faq8Q'),
      answer: t('app.helpSupport.faq8A')
    },
    {
      question: t('app.helpSupport.faq9Q'),
      answer: t('app.helpSupport.faq9A')
    },
    {
      question: t('app.helpSupport.faq10Q'),
      answer: t('app.helpSupport.faq10A')
    },
    {
      question: t('app.helpSupport.faq11Q'),
      answer: t('app.helpSupport.faq11A')
    },
    {
      question: t('app.helpSupport.faq12Q'),
      answer: t('app.helpSupport.faq12A')
    },
    {
      question: t('app.helpSupport.faq13Q'),
      answer: t('app.helpSupport.faq13A')
    },
    {
      question: t('app.helpSupport.faq14Q'),
      answer: t('app.helpSupport.faq14A')
    },
    {
      question: t('app.helpSupport.faq15Q'),
      answer: t('app.helpSupport.faq15A')
    }
  ]

  const [expandedFaq, setExpandedFaq] = useState(null)
  const [chatModalOpen, setChatModalOpen] = useState(false)

  const handleStartChat = () => {
    setChatModalOpen(true)
  }

  const handleCloseChat = () => {
    setChatModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('app.helpSupport.pageTitle')}</h1>
        <p className="text-gray-600 mt-1">{t('app.helpSupport.pageSubtitle')}</p>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
          <div className="text-4xl mb-3">📞</div>
          <h3 className="font-bold text-lg text-gray-900 mb-2">{t('app.helpSupport.phoneSupport')}</h3>
          <p className="text-sm text-gray-600 mb-3">{t('app.helpSupport.phoneDesc')}</p>
          <p className="font-semibold text-green-700">1800-180-1551</p>
          <p className="text-xs text-gray-500 mt-1">{t('app.helpSupport.available247')}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
          <div className="text-4xl mb-3">📧</div>
          <h3 className="font-bold text-lg text-gray-900 mb-2">{t('app.helpSupport.emailSupport')}</h3>
          <p className="text-sm text-gray-600 mb-3">{t('app.helpSupport.emailDesc')}</p>
          <p className="font-semibold text-blue-700 text-sm break-all">krishiii.mitra@gmail.com</p>
          <p className="text-xs text-gray-500 mt-1">{t('app.helpSupport.responseWithin24')}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
          <div className="text-4xl mb-3">💬</div>
          <h3 className="font-bold text-lg text-gray-900 mb-2">{t('app.helpSupport.liveChat')}</h3>
          <p className="text-sm text-gray-600 mb-3">{t('app.helpSupport.liveChatDesc')}</p>
          <button 
            onClick={handleStartChat}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
          >
            {t('app.helpSupport.startChat')}
          </button>
          <p className="text-xs text-gray-500 mt-2">{t('app.helpSupport.monSat9to6')}</p>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span>❓</span>
          {t('app.helpSupport.faqs')}
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                <svg
                  className={`w-5 h-5 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedFaq === idx && (
                <div className="px-4 pb-4 text-gray-600 bg-gray-50">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>



      {/* Tutorial Videos */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span>🎥</span>
          {t('app.helpSupport.videoTutorials')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
              <span className="text-white text-5xl">▶️</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">{t('app.helpSupport.gettingStarted')}</h3>
              <p className="text-sm text-gray-600">{t('app.helpSupport.gettingStartedDesc')}</p>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
              <span className="text-white text-5xl">▶️</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">{t('app.helpSupport.howToUseRecommendations')}</h3>
              <p className="text-sm text-gray-600">{t('app.helpSupport.howToUseRecommendationsDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Chat Modal */}
      {chatModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">💬</div>
                  <div>
                    <h3 className="text-xl font-bold">{t('app.helpSupport.liveChat')}</h3>
                    <p className="text-sm text-purple-100">{t('app.helpSupport.monSat9to6')}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseChat}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-semibold text-purple-700">🎯 {t('app.helpSupport.liveChatService')}</span>
                </p>
                <p className="text-sm text-gray-600">
                  {t('app.helpSupport.chatSetupMessage')}
                </p>
              </div>

              <div className="space-y-4">
                {/* Phone Option */}
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl">📞</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{t('app.helpSupport.callUsNow')}</h4>
                    <p className="text-green-700 font-bold">1800-180-1551</p>
                    <p className="text-xs text-gray-600">{t('app.helpSupport.available247')}</p>
                  </div>
                </div>

                {/* Email Option */}
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl">📧</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{t('app.helpSupport.emailSupport')}</h4>
                    <p className="text-blue-700 font-medium text-sm break-all">krishiii.mitra@gmail.com</p>
                    <p className="text-xs text-gray-600">{t('app.helpSupport.responseWithin24')}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <a
                  href="tel:18001801551"
                  className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold text-center flex items-center justify-center gap-2"
                >
                  <span>📞</span>
                  <span>{t('app.helpSupport.callNow')}</span>
                </a>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=krishiii.mitra@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center flex items-center justify-center gap-2"
                >
                  <span>✉️</span>
                  <span>{t('app.helpSupport.email')}</span>
                </a>
              </div>

              <button
                onClick={handleCloseChat}
                className="w-full mt-3 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                {t('app.helpSupport.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
