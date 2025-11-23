import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Dashboard from './Dashboard.jsx'
import MyCrops from './MyCrops.jsx'
import Recommendations from './Recommendations.jsx'
import Weather from './Weather.jsx'
import MarketPrices from './MarketPrices.jsx'
import Calendar from './Calendar.jsx'
import Resources from './Resources.jsx'
import Settings from './Settings.jsx'
import HelpSupport from './HelpSupport.jsx'
import AIChat from './AIChat.jsx'
import SoilData from './SoilData.jsx'
import CropRotation from './CropRotation.jsx'
import NotificationBell from '../components/NotificationBell.jsx'
import '../utils/demoNotifications.js' // Make demo functions available

export default function Home() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState('dashboard')

  useEffect(() => {
    // Get user from localStorage
    const authData = localStorage.getItem('auth')
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        setUser(parsed)
      } catch (e) {
        console.error('Failed to parse auth data:', e)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('auth')
    setShowProfileMenu(false)
    navigate('/')
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

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />
      case 'my-crops':
        return <MyCrops />
      case 'recommendations':
        return <Recommendations />
      case 'ai-chat':
        return <AIChat />
      case 'soil-data':
        return <SoilData />
      case 'crop-rotation':
        return <CropRotation />
      case 'weather':
        return <Weather />
      case 'market-prices':
        return <MarketPrices />
      case 'calendar':
        return <Calendar />
      case 'resources':
        return <Resources />
      case 'settings':
        return <Settings />
      case 'help-support':
        return <HelpSupport />
      default:
        return <Dashboard onNavigate={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Sidebar */}
      <aside className={`bg-gradient-to-b from-green-800 to-green-900 text-white flex-shrink-0 transition-all duration-300 fixed left-0 top-0 h-screen overflow-y-auto z-40 ${
        sidebarOpen ? 'w-80' : 'w-20'
      }`}>
        {/* Removed branding from sidebar - now in navbar */}

        <nav className={`transition-all duration-300 ${
          sidebarOpen ? 'px-4 mt-6' : 'px-2 mt-6'
        }`}>
          {sidebarOpen && (
            <p className="text-green-300 text-xs font-semibold uppercase tracking-wider mb-4 px-3">{t('app.dashboard.mainMenu')}</p>
          )}
          <ul className="space-y-2">
            <li>
              <button onClick={() => setCurrentPage('dashboard')} className={`w-full flex items-center rounded-lg font-medium transition-all ${
                currentPage === 'dashboard' ? 'bg-green-700 text-white' : 'text-green-100 hover:bg-green-700/50'
              } ${
                sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3'
              }`} title={!sidebarOpen ? t('app.dashboard.dashboard') : ''}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                {sidebarOpen && <span className="whitespace-nowrap">{t('app.dashboard.dashboard')}</span>}
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('my-crops')} className={`w-full flex items-center rounded-lg font-medium transition-all ${
                currentPage === 'my-crops' ? 'bg-green-700 text-white' : 'text-green-100 hover:bg-green-700/50'
              } ${
                sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3'
              }`} title={!sidebarOpen ? t('app.dashboard.myCrops') : ''}>
                <span className="text-xl flex-shrink-0">🌱</span>
                {sidebarOpen && <span className="whitespace-nowrap">{t('app.dashboard.myCrops')}</span>}
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('recommendations')} className={`w-full flex items-center rounded-lg font-medium transition-all ${
                currentPage === 'recommendations' ? 'bg-green-700 text-white' : 'text-green-100 hover:bg-green-700/50'
              } ${
                sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3'
              }`} title={!sidebarOpen ? t('app.dashboard.recommendations') : ''}>
                <span className="text-xl flex-shrink-0">💡</span>
                {sidebarOpen && <span className="whitespace-nowrap">{t('app.dashboard.recommendations')}</span>}
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('ai-chat')} className={`w-full flex items-center rounded-lg font-medium transition-all ${
                currentPage === 'ai-chat' ? 'bg-green-700 text-white' : 'text-green-100 hover:bg-green-700/50'
              } ${
                sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3'
              }`} title={!sidebarOpen ? t('app.dashboard.aiChat') : ''}>
                <span className="text-xl flex-shrink-0">🤖</span>
                {sidebarOpen && <span className="whitespace-nowrap">{t('app.dashboard.aiChat')}</span>}
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('soil-data')} className={`w-full flex items-center rounded-lg font-medium transition-all ${
                currentPage === 'soil-data' ? 'bg-green-700 text-white' : 'text-green-100 hover:bg-green-700/50'
              } ${
                sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3'
              }`} title={!sidebarOpen ? t('app.dashboard.soilData') : ''}>
                <span className="text-xl flex-shrink-0">🌍</span>
                {sidebarOpen && <span className="whitespace-nowrap">{t('app.dashboard.soilData')}</span>}
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('crop-rotation')} className={`w-full flex items-center rounded-lg font-medium transition-all ${
                currentPage === 'crop-rotation' ? 'bg-green-700 text-white' : 'text-green-100 hover:bg-green-700/50'
              } ${
                sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3'
              }`} title={!sidebarOpen ? t('app.dashboard.cropRotation') : ''}>
                <span className="text-xl flex-shrink-0">🔄</span>
                {sidebarOpen && <span className="whitespace-nowrap">{t('app.dashboard.cropRotation')}</span>}
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('weather')} className={`w-full flex items-center rounded-lg font-medium transition-all ${
                currentPage === 'weather' ? 'bg-green-700 text-white' : 'text-green-100 hover:bg-green-700/50'
              } ${
                sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3'
              }`} title={!sidebarOpen ? t('app.dashboard.weather') : ''}>
                <span className="text-xl flex-shrink-0">☀️</span>
                {sidebarOpen && <span className="whitespace-nowrap">{t('app.dashboard.weather')}</span>}
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('market-prices')} className={`w-full flex items-center rounded-lg font-medium transition-all ${
                currentPage === 'market-prices' ? 'bg-green-700 text-white' : 'text-green-100 hover:bg-green-700/50'
              } ${
                sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3'
              }`} title={!sidebarOpen ? t('app.dashboard.marketPrices') : ''}>
                <span className="text-xl flex-shrink-0">📈</span>
                {sidebarOpen && <span className="whitespace-nowrap">{t('app.dashboard.marketPrices')}</span>}
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('calendar')} className={`w-full flex items-center rounded-lg font-medium transition-all ${
                currentPage === 'calendar' ? 'bg-green-700 text-white' : 'text-green-100 hover:bg-green-700/50'
              } ${
                sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3'
              }`} title={!sidebarOpen ? t('app.dashboard.calendar') : ''}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {sidebarOpen && <span className="whitespace-nowrap">{t('app.dashboard.calendar')}</span>}
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('resources')} className={`w-full flex items-center rounded-lg font-medium transition-all ${
                currentPage === 'resources' ? 'bg-green-700 text-white' : 'text-green-100 hover:bg-green-700/50'
              } ${
                sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3'
              }`} title={!sidebarOpen ? t('app.dashboard.resources') : ''}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                {sidebarOpen && <span className="whitespace-nowrap">{t('app.dashboard.resources')}</span>}
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('settings')} className={`w-full flex items-center rounded-lg font-medium transition-all ${
                currentPage === 'settings' ? 'bg-green-700 text-white' : 'text-green-100 hover:bg-green-700/50'
              } ${
                sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3'
              }`} title={!sidebarOpen ? t('app.dashboard.settings') : ''}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {sidebarOpen && <span className="whitespace-nowrap">{t('app.dashboard.settings')}</span>}
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('help-support')} className={`w-full flex items-center rounded-lg font-medium transition-all ${
                currentPage === 'help-support' ? 'bg-green-700 text-white' : 'text-green-100 hover:bg-green-700/50'
              } ${
                sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3'
              }`} title={!sidebarOpen ? t('app.dashboard.helpSupport') : ''}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {sidebarOpen && <span className="whitespace-nowrap">{t('app.dashboard.helpSupport')}</span>}
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <div className={`flex-1 flex flex-col min-w-0 h-screen transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-20'}`}>
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left side - Menu toggle + Branding */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                {/* Krishi Mitra Branding */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🌱</span>
                  </div>
                  <div className="hidden md:block">
                    <h1 className="text-lg font-bold text-gray-900">{t('app.title')}</h1>
                    <p className="text-xs text-green-600 font-medium">{t('app.dashboard.farmAssistant')}</p>
                  </div>
                </div>
              </div>

              {/* Right side - Language, Notifications, Profile */}
              <div className="flex items-center gap-3 ml-auto">
                {/* Language Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">{i18n.language === 'hi' ? 'भाषा' : 'Language'}</span>
                  <select
                    value={i18n.language}
                    onChange={(e) => i18n.changeLanguage(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white cursor-pointer hover:border-green-500 transition-colors"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी</option>
                  </select>
                </div>

                {/* Notifications */}
                <NotificationBell />

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-3 hover:bg-gray-50 rounded-xl px-3 py-2 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                      {getUserDisplayName()?.[0]?.toUpperCase() || 'R'}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500">{ t('app.dashboard.farmer')}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-500 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{user?.email || ''}</p>
                      </div>
                      <div className="py-1">
                        <button 
                          onClick={() => {
                            setCurrentPage('settings')
                            setShowProfileMenu(false)
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                        >
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {t('app.dashboard.myProfile')}
                        </button>
                        <button 
                          onClick={() => {
                            setCurrentPage('settings')
                            setShowProfileMenu(false)
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                        >
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {t('app.dashboard.settings')}
                        </button>
                        <button 
                          onClick={() => {
                            setCurrentPage('help-support')
                            setShowProfileMenu(false)
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                        >
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {t('app.dashboard.helpSupport')}
                        </button>
                      </div>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          {t('auth.logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {currentPage === 'ai-chat' ? (
            <div className="h-full">
              {renderPage()}
            </div>
          ) : (
            <div className="px-6 py-6">
              {renderPage()}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}