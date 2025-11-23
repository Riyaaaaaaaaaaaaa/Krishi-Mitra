import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api/auth'

export default function AuthModal({ mode = 'login', onClose }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [active, setActive] = useState(mode)
  const [step, setStep] = useState(1) // 1: enter details, 2: verify code
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const reset = () => {
    setStep(1)
    setName('')
    setEmail('')
    setPhone('')
    setPassword('')
    setConfirmPassword('')
    setVerificationCode('')
    setMessage('')
    setError('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  // Step 1: Send verification code
  const sendVerificationCode = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    // Validation
    if (!name.trim() || name.trim().length < 2) {
      setError(t('auth.invalidName', 'Please enter your full name'))
      return
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('auth.invalidEmail', 'Please enter a valid email'))
      return
    }
    if (!phone || phone.length < 10) {
      setError(t('auth.invalidPhone', 'Phone must be at least 10 digits'))
      return
    }
    if (!password || password.length < 6) {
      setError(t('auth.invalidPassword', 'Password must be at least 6 characters'))
      return
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch', 'Passwords do not match'))
      return
    }

    setLoading(true)
    try {
      console.log('Sending verification code to:', email)
      await axios.post(`${API_URL}/register/send-code`, { email, name })
      setMessage(t('auth.codeSent', 'Verification code sent to your email!'))
      setStep(2)
    } catch (err) {
      console.error('Error:', err)
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Make sure backend is running on port 5000')
      } else {
        setError(err.response?.data?.error || 'Failed to send verification code')
      }
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify code and complete registration
  const completeRegistration = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!verificationCode || verificationCode.length !== 6) {
      setError(t('auth.invalidCode', 'Please enter a valid 6-digit code'))
      return
    }

    setLoading(true)
    try {
      console.log('Verifying code and completing registration')
      const response = await axios.post(`${API_URL}/register/verify`, {
        email,
        code: verificationCode,
        password,
        phone
      })
      
      localStorage.setItem('auth', JSON.stringify(response.data.user))
      setMessage(t('auth.registerSuccess', 'Registration successful!'))
      setTimeout(() => {
        onClose?.()
        navigate('/home')
      }, 1000)
    } catch (err) {
      console.error('Error:', err)
      setError(err.response?.data?.error || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('auth.invalidEmail', 'Please enter a valid email'))
      return
    }
    if (!password) {
      setError(t('auth.passwordRequired', 'Password is required'))
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password })
      localStorage.setItem('auth', JSON.stringify(response.data.user))
      setMessage(t('auth.loginSuccess', 'Login successful!'))
      setTimeout(() => {
        onClose?.()
        navigate('/home')
      }, 1000)
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Please verify your email first. Check your inbox for the verification code.')
      } else {
        setError(err.response?.data?.error || 'Invalid credentials')
      }
    } finally {
      setLoading(false)
    }
  }

  const SwitchLink = () => (
    <p className="text-sm text-gray-600 text-center mt-3">
      {active === 'login' ? (
        <>
          {t('auth.noAccount', "Don't have an account?")}{' '}
          <button className="text-green-700 underline" onClick={() => { setActive('register'); reset() }}>
            {t('auth.register')}
          </button>
        </>
      ) : (
        <>
          {t('auth.haveAccount', 'Already have an account?')}{' '}
          <button className="text-green-700 underline" onClick={() => { setActive('login'); reset() }}>
            {t('auth.login')}
          </button>
        </>
      )}
    </p>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded ${active === 'login' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
              onClick={() => { setActive('login'); reset() }}
            >
              {t('auth.login')}
            </button>
            <button
              className={`px-3 py-1 rounded ${active === 'register' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
              onClick={() => { setActive('register'); reset() }}
            >
              {t('auth.register')}
            </button>
          </div>
          <button className="text-gray-600 hover:text-gray-800" onClick={onClose} aria-label={t('auth.close', 'Close')}>
            ✕
          </button>
        </div>

        <div className="mb-3">
          <h3 className="text-xl font-semibold">
            {active === 'login' ? t('auth.welcomeBack', 'Welcome back') : t('auth.createAccount', 'Create your account')}
          </h3>
          <p className="text-sm text-gray-600">
            {active === 'login'
              ? t('auth.loginSubtitle', 'Enter your email and password to continue')
              : t('auth.registerSubtitle', 'Fill in the details to start using Krishi Mitra')}
          </p>
        </div>

        <form onSubmit={active === 'login' ? handleLogin : (step === 1 ? sendVerificationCode : completeRegistration)} className="space-y-3">
          {/* Success/Error Messages */}
          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{message}</span>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Registration Step 1: Enter Details */}
          {active === 'register' && step === 1 && (
            <>
              <div>
                <label className="block text-sm text-gray-700 mb-1" htmlFor="name">{t('auth.name')}</label>
                <input
                  id="name"
                  type="text"
                  placeholder={t('auth.name')}
                  className="w-full border rounded px-3 py-2 border-gray-300"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1" htmlFor="email">{t('auth.email')}</label>
                <input
                  id="email"
                  type="email"
                  placeholder={t('auth.email')}
                  className="w-full border rounded px-3 py-2 border-gray-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1" htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+91 1234567890"
                  className="w-full border rounded px-3 py-2 border-gray-300"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1" htmlFor="password">{t('auth.password')}</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('auth.password')}
                    className="w-full border rounded px-3 py-2 pr-10 border-gray-300"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1" htmlFor="confirmPassword">{t('auth.confirmPassword', 'Confirm Password')}</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t('auth.confirmPassword', 'Confirm Password')}
                    className="w-full border rounded px-3 py-2 pr-10 border-gray-300"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Registration Step 2: Verify Code */}
          {active === 'register' && step === 2 && (
            <>
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 mb-3">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📧</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-900 mb-1">
                      {t('auth.checkEmail', 'Check your email!')}
                    </p>
                    <p className="text-xs text-amber-700">
                      We've sent a 6-digit verification code to:
                    </p>
                    <p className="text-sm font-mono text-amber-900 mt-1 font-semibold">{email}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2 font-semibold" htmlFor="code">
                  {t('auth.verificationCode', 'Verification Code')}
                </label>
                <input
                  id="code"
                  type="text"
                  maxLength="6"
                  placeholder="0 0 0 0 0 0"
                  className="w-full border-2 border-amber-300 rounded-lg px-4 py-3 text-center text-3xl font-mono tracking-[0.5em] focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                  autoFocus
                  required
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  ⏰ Code expires in 10 minutes
                </p>
              </div>
            </>
          )}

          {/* Login Form */}
          {active === 'login' && (
            <>
              <div>
                <label className="block text-sm text-gray-700 mb-1" htmlFor="email">{t('auth.email')}</label>
                <input
                  id="email"
                  type="email"
                  placeholder={t('auth.email')}
                  className="w-full border rounded px-3 py-2 border-gray-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1" htmlFor="password">{t('auth.password')}</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('auth.password')}
                    className="w-full border rounded px-3 py-2 pr-10 border-gray-300"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          {active === 'register' && step === 2 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setStep(1); setError(''); setMessage('') }}
                className="flex-1 border-2 border-gray-300 text-gray-700 rounded px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
                disabled={loading}
              >
                {t('auth.back', 'Back')}
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white rounded px-3 py-2 hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Verifying...' : t('auth.register')}
              </button>
            </div>
          )}
          {(active === 'login' || (active === 'register' && step === 1)) && (
            <button
              type="submit"
              className="w-full bg-green-600 text-white rounded px-3 py-2 hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading
                ? (active === 'login' ? 'Logging in...' : 'Sending code...')
                : (active === 'register' ? t('auth.sendCode', 'Send Verification Code') : t('auth.login'))}
            </button>
          )}
          <SwitchLink />
        </form>
      </div>
    </div>
  )
}