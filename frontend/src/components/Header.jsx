import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher.jsx'
import VoiceAssistant from './VoiceAssistant.jsx'

export default function Header() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const authed = !!localStorage.getItem('auth')

  const logout = () => {
    localStorage.removeItem('auth')
    navigate('/login')
  }

  return (
    <header className="bg-white/80 backdrop-blur shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-block w-8 h-8 rounded-full bg-green-600" />
          <h1 className="text-xl font-semibold">{t('app.title')}</h1>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <VoiceAssistant />
          {authed ? (
            <>
              <Link to="/home" className="px-3 py-1 rounded bg-green-600 text-white">{t('app.home')}</Link>
              <button onClick={logout} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">{t('app.logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1 rounded bg-green-600 text-white">{t('auth.login')}</Link>
              <Link to="/register" className="px-3 py-1 rounded bg-green-100 text-green-800 border border-green-600">{t('auth.register')}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}