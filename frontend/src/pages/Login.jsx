import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { loginUser } from '../services/auth.js'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const onSubmit = (e) => {
    e.preventDefault()
    const ok = loginUser(email, password)
    if (ok) {
      navigate('/home')
    } else {
      setError(t('auth.invalid'))
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg p-6 shadow">
      <h2 className="text-xl font-semibold mb-2">{t('auth.login')}</h2> {/* लॉगिन */}
      {location.state?.msg && (
        <div className="mb-2 text-green-700 bg-green-50 border border-green-200 rounded p-2">
          {location.state.msg}
        </div>
      )}
      {error && <div className="mb-2 text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
      <form onSubmit={onSubmit} className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm">{t('auth.email')}</span>
          <input type="email" className="border rounded px-2 py-1" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">{t('auth.password')}</span>
          <input type="password" className="border rounded px-2 py-1" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit" className="px-3 py-2 rounded bg-green-600 text-white">{t('auth.login')}</button>
      </form>
      <p className="text-sm mt-3 text-gray-600">
        {t('auth.noAccount')} <Link to="/register" className="text-green-700 font-medium">{t('auth.register')}</Link>
      </p>
    </div>
  )
}