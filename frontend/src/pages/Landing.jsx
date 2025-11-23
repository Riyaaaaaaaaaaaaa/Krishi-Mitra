import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import AuthModal from '../components/AuthModal'

export default function Landing() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('register')
  const [isListening, setIsListening] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    const auth = localStorage.getItem('auth')
    if (auth) {
      navigate('/home')
    }
  }, [])

  const openLogin = () => { setAuthMode('login'); setAuthOpen(true) }
  const openRegister = () => { setAuthMode('register'); setAuthOpen(true) }

  // Language change handler
  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value)
  }

  // Voice recognition handler
  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.lang = i18n.language || 'en-US'
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        console.log('Voice input:', transcript)
        // Handle voice command here
        setIsListening(false)
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } else {
      alert('Speech recognition is not supported in your browser')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🌱</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                {t('brand.name', 'Krishi Mitra')}
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-gray-700 hover:text-green-600 transition-colors font-medium"
              >
                {t('nav.features', 'Features')}
              </a>
              <a
                href="#how"
                className="text-gray-700 hover:text-green-600 transition-colors font-medium"
              >
                {t('nav.howItWorks', 'How It Works')}
              </a>
              <a
                href="#benefits"
                className="text-gray-700 hover:text-green-600 transition-colors font-medium"
              >
                {t('nav.benefits', 'Benefits')}
              </a>
              <a
                href="#get-started"
                className="text-gray-700 hover:text-green-600 transition-colors font-medium"
              >
                {t('nav.getStarted', 'Get Started')}
              </a>
            </div>

            {/* Right Side - Language, Voice, Buttons */}
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 hidden sm:block">
                  {t('nav.language', 'Language')}
                </span>
                <select
                  value={i18n.language}
                  onChange={handleLanguageChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white cursor-pointer hover:border-green-500 transition-colors"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी</option>
                  {/*<option value="mr">मराठी</option>
                  <option value="pa">ਪੰਜਾਬੀ</option>
                  <option value="ta">தமிழ்</option>
                  <option value="te">తెలుగు</option>
                  <option value="bn">বাংলা</option>
                  <option value="gu">ગુજરાતી</option>
                  <option value="kn">ಕನ್ನಡ</option>
                  <option value="ml">മലയാളം</option>
                  <option value="or">ଓଡ଼ିଆ</option>
                  <option value="as">অসমীয়া</option>*/}
                </select>
              </div>

              {/* Login Button */}
              <button
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold shadow-sm hover:shadow-md hidden sm:block"
                onClick={openLogin}
              >
                {t('nav.login', 'Login')}
              </button>

              {/* Register Button */}
              <button
                className="px-5 py-2.5 bg-white text-green-600 border-2 border-green-600 rounded-lg hover:bg-green-50 transition-all font-semibold shadow-sm hover:shadow-md"
                onClick={openRegister}
              >
                {t('nav.register', 'Register')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url(/hero-farmer.jpg)',
                filter: 'brightness(0.5)'
              }}
              role="img"
              aria-label="Indian farms"
            />
            {/*<div className="absolute inset-0 bg-gradient-to-r from-green-900/85 via-emerald-800/75 to-green-700/70" />*/}
          </div>

          <div className="relative z-10 w-full">
            <div className="text-center text-white">
              <span className="inline-block text-sm uppercase tracking-wide bg-green-500/30 border border-green-400/50 rounded-full px-5 py-2 mb-6 backdrop-blur-sm font-medium">
                {t('landing.badge', 'AI-POWERED AGRICULTURAL INTELLIGENCE')}
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
                {t('landing.heroTitle', 'Smart Crop Recommendations')} <br />
                <span className="text-green-400">
                  {t('landing.heroTitleAccent', 'for Indian Farmers')}
                </span>
              </h1>
              <p className="text-lg md:text-xl opacity-95 mb-10 max-w-4xl mx-auto leading-relaxed">
                {t(
                  'landing.heroSubtitle',
                  'Harness the power of artificial intelligence to make data-driven decisions about crop selection based on soil health, climate conditions, and regional insights'
                )}
              </p>

              {/* CTA Button */}
              <div className="flex justify-center mb-12">
                <button
                  className="group px-10 py-4 bg-green-600 text-white font-bold rounded-lg shadow-xl hover:bg-green-700 hover:scale-105 transition-all duration-200 flex items-center gap-3 text-lg"
                  onClick={openRegister}
                >
                  {t('landing.ctaPrimary', 'Get Crop Recommendations')}
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
                <StatHero
                  label={t('landing.stat.recos', 'Recommendations Made')}
                  value="50K+"
                />
                <StatHero
                  label={t('landing.stat.accuracy', 'Accuracy Rate')}
                  value="98%"
                />
                <StatHero
                  label={t('landing.stat.farmers', 'Happy Farmers')}
                  value="15K+"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="w-full">
            <div className="text-center mb-16">
              <span className="inline-block text-xs bg-green-100 text-green-800 rounded-full px-4 py-1.5 font-semibold uppercase tracking-wide mb-4">
                {t('landing.features.badge', 'POWERFUL FEATURES')}
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
                {t('landing.whyTitle', 'Why Choose Krishi Mitra?')}
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                {t(
                  'landing.whySubtitle',
                  'Advanced technology meets agricultural wisdom to deliver precise crop recommendations'
                )}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon="🧠"
                iconBg="bg-green-100"
                title={t('landing.features.ai', 'AI-Powered Analysis')}
                desc={t('landing.features.aiDesc', 'Advanced machine learning algorithms analyze multiple parameters to provide accurate crop recommendations tailored to your farm')}
              />
              <FeatureCard
                icon="🌿"
                iconBg="bg-green-100"
                title={t('landing.features.optimize', 'Soil & Climate Optimization')}
                desc={t('landing.features.optimizeDesc', 'Get recommendations based on NPK levels, pH balance, temperature, humidity, and rainfall patterns specific to your region')}
              />
              <FeatureCard
                icon="📈"
                iconBg="bg-blue-100"
                title={t('landing.features.data', 'Data-Driven Insights')}
                desc={t('landing.features.dataDesc', 'Access comprehensive analytics and insights to understand why specific crops are recommended for your farmland conditions')}
              />
              <FeatureCard
                icon="✅"
                iconBg="bg-orange-100"
                title={t('landing.features.easy', 'Free & Easy to Use')}
                desc={t('landing.features.easyDesc', 'Simple interface designed for farmers. No technical knowledge required. Get instant recommendations in just a few clicks')}
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="w-full">
            <div className="text-center mb-16">
              <span className="inline-block text-xs bg-green-100 text-green-800 rounded-full px-4 py-1.5 font-semibold uppercase tracking-wide mb-4">
                {t('landing.howBadge', 'SIMPLE PROCESS')}
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
                {t('landing.how', 'How It Works')}
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                {t('landing.howDesc', 'Get personalized crop recommendations in four simple steps')}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StepCard
                n={1}
                icon="🌾"
                title={t('landing.steps.soil', 'Enter Soil Parameters')}
                desc={t('landing.steps.soilDesc', "Input NPK values, pH level, and other soil nutrients from your farm's soil test report")}
              />
              <StepCard
                n={2}
                icon="☁️"
                title={t('landing.steps.climate', 'Add Climate Data')}
                desc={t('landing.steps.climateDesc', 'Provide temperature, humidity, and rainfall information for your location and season')}
              />
              <StepCard
                n={3}
                icon="🤖"
                title={t('landing.steps.reco', 'Get AI Recommendations')}
                desc={t('landing.steps.recoDesc', 'Our AI analyzes your data and generates personalized crop recommendations instantly')}
              />
              <StepCard
                n={4}
                icon="📊"
                title={t('landing.steps.insights', 'View Detailed Insights')}
                desc={t('landing.steps.insightsDesc', 'Access comprehensive reports with crop suitability scores and cultivation tips')}
              />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-50 to-white">
          <div className="w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
                <span className="inline-block text-xs bg-green-100 text-green-800 rounded-full px-4 py-1.5 font-semibold uppercase tracking-wide mb-4">
                  {t('landing.benefitsBadge', 'BENEFITS')}
                </span>
                <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
                  {t('landing.benefitsTitle', "Maximize Your Farm's Potential")}
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  {t('landing.benefitsSubtitle', 'Make informed decisions that increase yield, reduce risk, and optimize resource utilization')}
                </p>

                <div className="space-y-6">
                  <BenefitItem
                    icon="📈"
                    iconBg="bg-green-100"
                    title={t('landing.benefits.yield', 'Increase Crop Yield')}
                    desc={t('landing.benefits.yieldDesc', 'Choose crops that thrive in your specific soil and climate conditions for maximum productivity')}
                  />
                  <BenefitItem
                    icon="🛡️"
                    iconBg="bg-green-100"
                    title={t('landing.benefits.risk', 'Reduce Farming Risk')}
                    desc={t('landing.benefits.riskDesc', 'Minimize crop failure by selecting varieties best suited to your environmental conditions')}
                  />
                  <BenefitItem
                    icon="💧"
                    iconBg="bg-green-100"
                    title={t('landing.benefits.resources', 'Optimize Resources')}
                    desc={t('landing.benefits.resourcesDesc', 'Save water, fertilizers, and time by growing crops that match your land\'s natural capabilities')}
                  />
                  <BenefitItem
                    icon="🔬"
                    iconBg="bg-green-100"
                    title={t('landing.benefits.scientific', 'Scientific Approach')}
                    desc={t('landing.benefits.scientificDesc', 'Leverage data science and agricultural research for evidence-based farming decisions')}
                  />
                </div>
              </div>

              {/* Right Image Card */}
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow duration-300">
                  <img
                    src="/farmer-phone.jpg"
                    alt="Indian farmer using smartphone"
                    className="w-full h-96 object-cover"
                  />
                  <div className="p-8">
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-3xl font-extrabold text-green-600 mb-1">25+</div>
                        <div className="text-sm text-gray-600">{t('landing.stats.crops', 'Crop Types')}</div>
                      </div>
                      <div>
                        <div className="text-3xl font-extrabold text-green-600 mb-1">500+</div>
                        <div className="text-sm text-gray-600">{t('landing.stats.regions', 'Regions')}</div>
                      </div>
                      <div>
                        <div className="text-3xl font-extrabold text-green-600 mb-1">24/7</div>
                        <div className="text-sm text-gray-600">{t('landing.stats.available', 'Available')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="get-started" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="w-full">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
              <div className="relative z-10 p-12 text-center text-white">
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                  {t('landing.ready', 'Ready to Transform Your Farming?')}
                </h3>
                <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                  {t('landing.readyDesc', 'Join thousands of farmers who are making smarter crop decisions with Krishi Mitra')}
                </p>
                <button
                  className="group px-10 py-4 bg-white text-green-700 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-bold text-lg inline-flex items-center gap-3"
                  onClick={openRegister}
                >
                  {t('landing.ctaStart', "Start Now - It's Free")}
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm opacity-90">
                  <span className="flex items-center gap-2">
                    <span className="text-green-300">✓</span>
                    {t('landing.trust.noCard', 'No Credit Card Required')}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-green-300">✓</span>
                    {t('landing.trust.instant', 'Instant Access')}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-green-300">✓</span>
                    {t('landing.trust.free', '100% Free Forever')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full">
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">🌱</span>
                  </div>
                  <span className="text-xl font-bold">
                    {t('brand.name', 'Krishi Mitra')}
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {t('footer.aboutDesc', 'Empowering Indian farmers with AI-driven crop recommendations for sustainable and profitable agriculture.')}
                </p>
              </div>

              {/* Product */}
              <div>
                <h4 className="font-semibold text-lg mb-4">{t('footer.product', 'Product')}</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#features" className="hover:text-green-400 transition-colors">{t('footer.features', 'Features')}</a></li>
                  <li><a href="#how" className="hover:text-green-400 transition-colors">{t('footer.howItWorks', 'How It Works')}</a></li>
                  <li><a href="#" className="hover:text-green-400 transition-colors">{t('footer.pricing', 'Pricing')}</a></li>
                  <li><a href="#" className="hover:text-green-400 transition-colors">{t('footer.faq', 'FAQ')}</a></li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="font-semibold text-lg mb-4">{t('footer.resources', 'Resources')}</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-green-400 transition-colors">{t('footer.blog', 'Blog')}</a></li>
                  <li><a href="#" className="hover:text-green-400 transition-colors">{t('footer.guides', 'Guides')}</a></li>
                  <li><a href="#" className="hover:text-green-400 transition-colors">{t('footer.support', 'Support')}</a></li>
                  <li><a href="#" className="hover:text-green-400 transition-colors">{t('footer.contact', 'Contact')}</a></li>
                </ul>
              </div>

              {/* Connect */}
              <div>
                <h4 className="font-semibold text-lg mb-4">{t('footer.connect', 'Connect')}</h4>
                <div className="flex gap-4">
                  {/* Facebook */}
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#1877F2] transition-all duration-200 hover:scale-110 group"
                    aria-label="Visit our Facebook page"
                  >
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                    </svg>
                  </a>

                  {/* Twitter */}
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#1DA1F2] transition-all duration-200 hover:scale-110 group"
                    aria-label="Visit our Twitter page"
                  >
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600 transition-all duration-200 hover:scale-110 group"
                    aria-label="Visit our Instagram page"
                  >
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#0A66C2] transition-all duration-200 hover:scale-110 group"
                    aria-label="Visit our LinkedIn page"
                  >
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                    </svg>
                  </a>
                </div>

              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
              <p>&copy; {new Date().getFullYear()} {t('brand.name', 'Krishi Mitra')}. {t('footer.rights', 'All rights reserved.')}</p>
            </div>
          </div>
        </footer>
      </main>

      {authOpen && (
        <AuthModal mode={authMode} onClose={() => setAuthOpen(false)} />
      )}
    </div>
  )
}

// Optimized Components with Enhanced Hover Effects
const StatHero = React.memo(({ value, label }) => (
  <div className="text-center transform hover:scale-110 transition-transform duration-200">
    <div className="text-3xl md:text-4xl font-extrabold text-green-400 mb-2">{value}</div>
    <div className="text-sm md:text-base opacity-90">{label}</div>
  </div>
))

const FeatureCard = React.memo(({ title, desc, icon, iconBg }) => (
  <div className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-500 hover:-translate-y-2 cursor-pointer">
    <div className={`w-16 h-16 ${iconBg} rounded-xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
      {icon}
    </div>
    <h3 className="font-bold text-xl mb-3 text-gray-900 group-hover:text-green-600 transition-colors">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{desc}</p>
  </div>
))

const StepCard = React.memo(({ n, title, desc, icon }) => (
  <div className="group relative bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-green-500 transition-all duration-300 shadow-sm hover:shadow-2xl hover:-translate-y-2 cursor-pointer">
    <div className="flex items-start gap-4 mb-4">
      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 relative group-hover:scale-110 transition-transform duration-300">
        {n}
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-lg group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
          {icon}
        </div>
      </div>
    </div>
    <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-green-600 transition-colors">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
  </div>
))

const BenefitItem = React.memo(({ icon, iconBg, title, desc }) => (
  <div className="group flex items-start gap-4 p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer">
    <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-lg mb-1 text-gray-900 group-hover:text-green-600 transition-colors">{title}</h4>
      <p className="text-gray-600 leading-relaxed">{desc}</p>
    </div>
  </div>
))

StatHero.displayName = 'StatHero'
FeatureCard.displayName = 'FeatureCard'
StepCard.displayName = 'StepCard'
BenefitItem.displayName = 'BenefitItem'
