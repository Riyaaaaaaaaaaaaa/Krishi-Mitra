import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api/auth'

export default function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  // Step 1: Email verification
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  
  const [error, setError] = useState('')
  const [okMsg, setOkMsg] = useState('')
  const [loading, setLoading] = useState(false)

  // Step 1: Send verification code
  const sendVerificationCode = async (e) => {
    e.preventDefault()
    setError('')
    setOkMsg('')
    
    if (!name.trim()) {
      setError(t('auth.nameRequired', 'Name is required'))
      return
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('auth.invalidEmail', 'Invalid email'))
      return
    }

    setLoading(true)
    try {
      console.log('Sending verification code to:', email)
      const response = await axios.post(`${API_URL}/register/send-code`, { email, name })
      console.log('Response:', response.data)
      setOkMsg(t('auth.codeSent', 'Verification code sent to your email!'))
      setStep(2)
    } catch (err) {
      console.error('Error sending code:', err)
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Make sure backend is running on port 5000')
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to send verification code')
      }
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify code and complete registration
  const completeRegistration = async (e) => {
    e.preventDefault()
    setError('')
    setOkMsg('')
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter the 6-digit verification code')
      return
    }
    if (!password || password.length < 6) {
      setError(t('auth.weakPassword', 'Password must be at least 6 characters'))
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/register/verify`, {
        email,
        code: verificationCode,
        password,
        phone
      })
      setOkMsg(t('auth.registerSuccess', 'Registration successful!'))
      localStorage.setItem('auth', JSON.stringify(response.data.user))
      setTimeout(() => navigate('/home'), 1500)
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🌱</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              {t('brand.name', 'Krishi Mitra')}
            </h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {t('auth.register', 'Create Account')}
          </h2>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          {okMsg && (
            <div className="mb-3 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{okMsg}</span>
            </div>
          )}
          
          {error && (
            <div className="mb-3 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={step === 1 ? sendVerificationCode : completeRegistration} className="grid gap-4">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <>
                <label className="grid gap-1.5">
                  <span className="text-sm font-medium text-gray-700">{t('auth.name', 'Name')}</span>
                  <input 
                    type="text" 
                    className="border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                    placeholder="Enter your full name"
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </label>
                
                <label className="grid gap-1.5">
                  <span className="text-sm font-medium text-gray-700">{t('auth.email', 'Email')}</span>
                  <input 
                    type="email" 
                    className="border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                    placeholder="your@email.com"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </label>

                <button 
                  type="submit" 
                  className="px-4 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : t('auth.sendCode', 'Send Verification Code')}
                </button>
              </>
            )}

            {/* Step 2: Verification */}
            {step === 2 && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                  <p className="text-sm text-blue-800">
                    {t('auth.enterCode', 'Enter the 6-digit code sent to your email')}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">{email}</p>
                </div>

                <label className="grid gap-1.5">
                  <span className="text-sm font-medium text-gray-700">{t('auth.verificationCode', 'Verification Code')}</span>
                  <input 
                    type="text" 
                    maxLength="6"
                    className="border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-2xl font-mono tracking-widest" 
                    placeholder="000000"
                    value={verificationCode} 
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    disabled={loading}
                    required
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-sm font-medium text-gray-700">{t('auth.phone', 'Phone (Optional)')}</span>
                  <input 
                    type="tel" 
                    className="border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                    placeholder="+91 1234567890"
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                  />
                </label>
                
                <label className="grid gap-1.5">
                  <span className="text-sm font-medium text-gray-700">{t('auth.password', 'Password')}</span>
                  <input 
                    type="password" 
                    className="border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                    placeholder="Minimum 6 characters"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </label>
                
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all flex-1"
                    disabled={loading}
                  >
                    {t('auth.back', 'Back')}
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : t('auth.register', 'Complete Registration')}
                  </button>
                </div>
              </>
            )}
          </form>
          
          <p className="text-sm mt-4 text-center text-gray-600">
            {t('auth.haveAccount', 'Already have an account?')}{' '}
            <Link to="/login" className="text-green-600 font-semibold hover:text-green-700">
              {t('auth.login', 'Login')}
            </Link>
          </p>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-gray-600 hover:text-green-600">
            ← {t('auth.backToHome', 'Back to Home')}
          </Link>
        </div>
      </div>
    </div>
  )
}