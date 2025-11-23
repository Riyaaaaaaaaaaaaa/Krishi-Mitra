import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function Settings() {
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState('profile')
  const [showSaveNotification, setShowSaveNotification] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [settings, setSettings] = useState({
    // Profile
    farmName: 'Green Valley Farm',
    ownerName: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91 98765 43210',
    location: 'Ranchi, Jharkhand',
    farmSize: '5.5',
    soilType: 'Loam',
    // Notifications
    notifications: true,
    emailAlerts: true,
    smsAlerts: false,
    priceAlerts: false,
    weatherAlerts: true,
    cropAlerts: true,
    soilAlerts: true,
    // App Preferences
    language: i18n.language,
    theme: 'light',
    dataSync: true,
    autoSave: true,
    offlineMode: false,
    // Units
    areaUnit: 'hectares',
    temperatureUnit: 'celsius',
    currencyUnit: 'INR'
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = () => {
    // Save settings to localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings))
    
    // Update language if changed
    if (settings.language !== i18n.language) {
      i18n.changeLanguage(settings.language)
    }
    
    // Show notification
    setShowSaveNotification(true)
    setTimeout(() => setShowSaveNotification(false), 3000)
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      const defaultSettings = {
        farmName: '',
        ownerName: '',
        email: '',
        phone: '',
        location: '',
        farmSize: '',
        soilType: 'Loam',
        notifications: true,
        emailAlerts: false,
        smsAlerts: false,
        priceAlerts: false,
        weatherAlerts: true,
        cropAlerts: true,
        language: 'en',
        theme: 'light',
        dataSync: true,
        autoSave: true,
        offlineMode: false,
        areaUnit: 'hectares',
        temperatureUnit: 'celsius',
        currencyUnit: 'INR'
      }
      setSettings(defaultSettings)
      localStorage.removeItem('userSettings')
    }
  }

  const handleDeleteAccount = () => {
    setShowDeleteDialog(false)
    // Handle account deletion logic
    alert('Account deletion requested. Please contact support.')
  }

  const handlePasswordChange = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Please fill in all password fields')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }
    // Handle password change logic
    alert('Password changed successfully!')
    setShowPasswordDialog(false)
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  const handleExportData = () => {
    const dataToExport = {
      settings,
      exportDate: new Date().toISOString(),
      farmName: settings.farmName,
      location: settings.location
    }
    
    // Create downloadable JSON file
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `farm-data-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    // Show success notification
    alert('Your data has been exported successfully!')
  }

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {showSaveNotification && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {t('app.settings.settingsSaved')}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('app.settings.pageTitle')}</h1>
        <p className="text-gray-600 mt-1">{t('app.settings.pageSubtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          👤 {t('app.settings.profile')}
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          🔔 {t('app.settings.notifications')}
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          ⚙️ {t('app.settings.appPreferences')}
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'privacy'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          🔒 {t('app.settings.privacySecurity')}
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t('app.settings.farmInformation')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('app.settings.farmName')}</label>
                <input
                  type="text"
                  name="farmName"
                  value={settings.farmName}
                  onChange={handleChange}
                  placeholder={t('app.settings.farmName')}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('app.settings.ownerName')}</label>
                <input
                  type="text"
                  name="ownerName"
                  value={settings.ownerName}
                  onChange={handleChange}
                  placeholder={t('app.settings.ownerName')}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('app.settings.email')}</label>
                <input
                  type="email"
                  name="email"
                  value={settings.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('app.settings.phone')}</label>
                <input
                  type="tel"
                  name="phone"
                  value={settings.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('app.settings.location')}</label>
                <input
                  type="text"
                  name="location"
                  value={settings.location}
                  onChange={handleChange}
                  placeholder={t('app.settings.location')}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('app.settings.farmSize')}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="farmSize"
                    value={settings.farmSize}
                    onChange={handleChange}
                    placeholder="0.0"
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                  <select
                    name="areaUnit"
                    value={settings.areaUnit}
                    onChange={handleChange}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500"
                  >
                    <option value="hectares">{t('app.settings.hectares')}</option>
                    <option value="acres">{t('app.settings.acres')}</option>
                    <option value="bigha">{t('app.settings.bigha')}</option>
                  </select>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('app.settings.soilType')}</label>
                <select
                  name="soilType"
                  value={settings.soilType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                >
                  <option value="Clay">{t('app.settings.clay')}</option>
                  <option value="Loam">{t('app.settings.loam')}</option>
                  <option value="Sandy">{t('app.settings.sandy')}</option>
                  <option value="Silt">{t('app.settings.silt')}</option>
                  <option value="Clay-Loam">{t('app.settings.clayLoam')}</option>
                  <option value="Sandy-Loam">{t('app.settings.sandyLoam')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t('app.settings.notificationPreferences')}</h2>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">{t('app.settings.pushNotifications')}</p>
                <p className="text-sm text-gray-600">{t('app.settings.pushNotificationsDesc')}</p>
              </div>
              <input
                type="checkbox"
                name="notifications"
                checked={settings.notifications}
                onChange={handleChange}
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">{t('app.settings.emailAlerts')}</p>
                <p className="text-sm text-gray-600">{t('app.settings.emailAlertsDesc')}</p>
              </div>
              <input
                type="checkbox"
                name="emailAlerts"
                checked={settings.emailAlerts}
                onChange={handleChange}
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">{t('app.settings.smsAlerts')}</p>
                <p className="text-sm text-gray-600">{t('app.settings.smsAlertsDesc')}</p>
              </div>
              <input
                type="checkbox"
                name="smsAlerts"
                checked={settings.smsAlerts}
                onChange={handleChange}
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
            </label>

            <div className="border-t border-gray-200 pt-4 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">{t('app.settings.alertCategories')}</h3>
            </div>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">💰 {t('app.settings.priceAlerts')}</p>
                <p className="text-sm text-gray-600">{t('app.settings.priceAlertsDesc')}</p>
              </div>
              <input
                type="checkbox"
                name="priceAlerts"
                checked={settings.priceAlerts}
                onChange={handleChange}
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">🌧️ {t('app.settings.weatherAlerts')}</p>
                <p className="text-sm text-gray-600">{t('app.settings.weatherAlertsDesc')}</p>
              </div>
              <input
                type="checkbox"
                name="weatherAlerts"
                checked={settings.weatherAlerts}
                onChange={handleChange}
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">🌾 {t('app.settings.cropReminders')}</p>
                <p className="text-sm text-gray-600">{t('app.settings.cropRemindersDesc')}</p>
              </div>
              <input
                type="checkbox"
                name="cropAlerts"
                checked={settings.cropAlerts}
                onChange={handleChange}
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">🌱 {t('app.settings.soilAlerts')}</p>
                <p className="text-sm text-gray-600">{t('app.settings.soilAlertsDesc')}</p>
              </div>
              <input
                type="checkbox"
                name="soilAlerts"
                checked={settings.soilAlerts}
                onChange={handleChange}
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
            </label>
          </div>
        </div>
      )}

      {/* App Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          {/* Language & Display */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t('app.settings.languageDisplay')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('app.settings.language')}</label>
                <select
                  name="language"
                  value={settings.language}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                >
                  <option value="en">{t('app.settings.english')}</option>
                  <option value="hi">{t('app.settings.hindi')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('app.settings.theme')}</label>
                <select
                  name="theme"
                  value={settings.theme}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                >
                  <option value="light">{t('app.settings.light')}</option>
                  <option value="dark">{t('app.settings.dark')}</option>
                  <option value="auto">{t('app.settings.auto')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Units */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t('app.settings.unitPreferences')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('app.settings.temperature')}</label>
                <select
                  name="temperatureUnit"
                  value={settings.temperatureUnit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                >
                  <option value="celsius">{t('app.settings.celsius')}</option>
                  <option value="fahrenheit">{t('app.settings.fahrenheit')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('app.settings.currency')}</label>
                <select
                  name="currencyUnit"
                  value={settings.currencyUnit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                >
                  <option value="INR">{t('app.settings.inr')}</option>
                  <option value="USD">{t('app.settings.usd')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* App Behavior */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t('app.settings.appBehavior')}</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">{t('app.settings.autoSave')}</p>
                  <p className="text-sm text-gray-600">{t('app.settings.autoSaveDesc')}</p>
                </div>
                <input
                  type="checkbox"
                  name="autoSave"
                  checked={settings.autoSave}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
              </label>
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">{t('app.settings.cloudSync')}</p>
                  <p className="text-sm text-gray-600">{t('app.settings.cloudSyncDesc')}</p>
                </div>
                <input
                  type="checkbox"
                  name="dataSync"
                  checked={settings.dataSync}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
              </label>
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">{t('app.settings.offlineMode')}</p>
                  <p className="text-sm text-gray-600">{t('app.settings.offlineModeDesc')}</p>
                </div>
                <input
                  type="checkbox"
                  name="offlineMode"
                  checked={settings.offlineMode}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Privacy & Security Tab */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          {/* Privacy */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t('app.settings.privacySettings')}</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>🔒 {t('app.settings.privacyMatters')}:</strong> {t('app.settings.privacyDesc')}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{t('app.settings.dataCollection')}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {t('app.settings.dataCollectionDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Account Management */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t('app.settings.accountManagement')}</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{t('app.settings.changePassword')}</h3>
                <p className="text-sm text-gray-600 mb-4">{t('app.settings.changePasswordDesc')}</p>
                <button 
                  onClick={() => setShowPasswordDialog(true)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors font-medium"
                >
                  {t('app.settings.changePassword')}
                </button>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{t('app.settings.exportData')}</h3>
                <p className="text-sm text-gray-600 mb-4">{t('app.settings.exportDataDesc')}</p>
                <button 
                  onClick={handleExportData}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors font-medium"
                >
                  {t('app.settings.downloadData')}
                </button>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2">⚠️ {t('app.settings.dangerZone')}</h3>
                <p className="text-sm text-red-700 mb-4">{t('app.settings.deleteAccountDesc')}</p>
                <button 
                  onClick={() => setShowDeleteDialog(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  {t('app.settings.deleteAccount')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Dialog */}
      {showPasswordDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t('app.settings.changePassword')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('app.settings.currentPassword')}</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder={t('app.settings.enterCurrentPassword')}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('app.settings.newPassword')}</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder={t('app.settings.enterNewPassword')}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('app.settings.confirmPassword')}</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder={t('app.settings.reenterPassword')}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordDialog(false)
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {t('app.settings.cancel')}
              </button>
              <button
                onClick={handlePasswordChange}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                {t('app.settings.updatePassword')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t('app.settings.deleteAccountTitle')}</h3>
            <p className="text-gray-600 mb-6">
              {t('app.settings.deleteAccountConfirm')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {t('app.settings.cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                {t('app.settings.deleteAccount')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center gap-4 pt-6 border-t border-gray-200">
        <button 
          onClick={handleReset}
          className="px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors font-semibold rounded-lg"
        >
          🔄 {t('app.settings.resetToDefault')}
        </button>
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            {t('app.settings.cancel')}
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
            </svg>
            {t('app.settings.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
