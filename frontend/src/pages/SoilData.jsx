import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function SoilData() {
  const { t, i18n } = useTranslation();
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);
  const [soilData, setSoilData] = useState(null);
  const [iotData, setIotData] = useState({
    n: '',
    p: '',
    k: '',
    ph: '',
    moisture: '',
    temperature: '',
    ec: '',
    deviceId: ''
  });
  const [showIotForm, setShowIotForm] = useState(false);
  const [historicalData, setHistoricalData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedCrops, setSelectedCrops] = useState([]);
  const [showFertilizerCalc, setShowFertilizerCalc] = useState(false);
  const [farmArea, setFarmArea] = useState('');
  const [selectedFertilizer, setSelectedFertilizer] = useState(null);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [showNotificationBadge, setShowNotificationBadge] = useState(false);
  const [criticalCount, setCriticalCount] = useState(0);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

  // Preload voices for better Hindi voice selection
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Load voices on mount
      window.speechSynthesis.getVoices();
      
      // Some browsers need this event listener to load voices
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
          setLoading(false);
        },
        (error) => {
          setLoading(false);
          let errorMessage = 'Unable to get location. ';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please allow location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'An unknown error occurred.';
          }
          
          alert(errorMessage + ' You can enter coordinates manually.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert('Geolocation is not supported by your browser. Please enter coordinates manually.');
    }
  };

  // Fetch comprehensive soil data
  const fetchSoilData = async () => {
    if (!latitude || !longitude) {
      alert('Please enter latitude and longitude');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/soil-data/comprehensive?lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      
      if (data.success) {
        setSoilData(data);
        const recs = generateRecommendations(data.data);
        setRecommendations(recs);
        checkAlerts(data.data);
        generateHistoricalData(data.data);
        setShowRecommendations(true);
      } else {
        alert('Failed to fetch soil data: ' + data.error);
      }
    } catch (error) {
      console.error('Error fetching soil data:', error);
      alert('Error fetching soil data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit IoT sensor data
  const submitIoTData = async () => {
    if (!latitude || !longitude) {
      alert('Please enter latitude and longitude');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/soil-data/iot-sensor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: parseFloat(latitude),
          lon: parseFloat(longitude),
          sensorData: {
            n: parseFloat(iotData.n) || null,
            p: parseFloat(iotData.p) || null,
            k: parseFloat(iotData.k) || null,
            ph: parseFloat(iotData.ph) || null,
            moisture: parseFloat(iotData.moisture) || null,
            temperature: parseFloat(iotData.temperature) || null,
            ec: parseFloat(iotData.ec) || null,
            deviceId: iotData.deviceId || 'manual',
            timestamp: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSoilData(data);
        const recs = generateRecommendations(data.data);
        setRecommendations(recs);
        checkAlerts(data.data);
        generateHistoricalData(data.data);
        setShowRecommendations(true);
        setShowIotForm(false);
        alert('IoT sensor data submitted successfully!');
      } else {
        alert('Failed to submit IoT data: ' + data.error);
      }
    } catch (error) {
      console.error('Error submitting IoT data:', error);
      alert('Error submitting data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Voice navigation function with improved Hindi support
  const speakText = (text, lang = 'en-US') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      
      // Improve voice quality with better parameters
      utterance.rate = 0.85; // Slightly slower for better clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Try to use a better quality Hindi voice if available
      if (lang === 'hi') {
        const voices = window.speechSynthesis.getVoices();
        // Prefer Google or Microsoft Hindi voices which sound more natural
        const hindiVoice = voices.find(voice => 
          voice.lang.startsWith('hi') && 
          (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Hemant'))
        ) || voices.find(voice => voice.lang.startsWith('hi'));
        
        if (hindiVoice) {
          utterance.voice = hindiVoice;
        }
      }
      
      utterance.onend = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Translate text for Hindi voice
  const getVoiceText = (key) => {
    const lang = t('lang') || 'en';
    if (lang === 'hi') {
      const translations = {
        'Nitrogen': 'नाइट्रोजन',
        'Phosphorus': 'फास्फोरस',
        'Potassium': 'पोटेशियम',
        'pH': 'पीएच',
        'Good': 'अच्छा',
        'Poor': 'खराब',
        'Medium': 'मध्यम',
        'Low': 'कम',
        'High': 'उच्च',
        'Critical Alert': 'गंभीर चेतावनी',
        'Warning': 'चेतावनी'
      };
      return translations[key] || key;
    }
    return key;
  };

  // Get metric status and color
  const getMetricStatus = (metric, value) => {
    const ranges = {
      nitrogen: { low: 40, high: 80, unit: 'kg/ha' },
      phosphorus: { low: 30, high: 60, unit: 'kg/ha' },
      potassium: { low: 40, high: 80, unit: 'kg/ha' },
      ph: { low: 6.0, high: 7.5, unit: '' },
      moisture: { low: 20, high: 60, unit: '%' },
      temperature: { low: 15, high: 35, unit: '°C' }
    };

    if (!ranges[metric]) return { status: 'unknown', color: 'gray', icon: '⚪' };
    
    const range = ranges[metric];
    if (value < range.low) {
      return { status: 'poor', color: 'red', icon: '🔴', label: 'Low - Needs Attention' };
    } else if (value > range.high) {
      return { status: 'poor', color: 'red', icon: '🔴', label: 'High - Needs Attention' };
    } else if (value >= range.low && value <= (range.low + (range.high - range.low) * 0.3)) {
      return { status: 'medium', color: 'yellow', icon: '🟡', label: 'Medium' };
    } else if (value >= (range.high - (range.high - range.low) * 0.3) && value <= range.high) {
      return { status: 'medium', color: 'yellow', icon: '🟡', label: 'Medium' };
    } else {
      return { status: 'good', color: 'green', icon: '🟢', label: 'Good - Optimal' };
    }
  };

  // Generate recommendations based on soil data
  const generateRecommendations = (data) => {
    const crops = [];
    const fertilizers = [];
    
    // Crop recommendations based on soil conditions
    if (data.pH >= 6.0 && data.pH <= 7.5 && data.nitrogen >= 40) {
      crops.push({ name: 'Rice', suitability: 'High', reason: 'Optimal pH and nitrogen levels' });
      crops.push({ name: 'Wheat', suitability: 'High', reason: 'Good soil conditions' });
    }
    
    if (data.nitrogen < 40) {
      crops.push({ name: 'Legumes (Pulses)', suitability: 'High', reason: 'Nitrogen-fixing crops recommended for low N soils' });
      fertilizers.push({ name: 'Urea', amount: '100-150 kg/ha', reason: 'Low nitrogen levels detected' });
    }
    
    if (data.phosphorus < 30) {
      fertilizers.push({ name: 'DAP (Diammonium Phosphate)', amount: '50-75 kg/ha', reason: 'Low phosphorus levels' });
    }
    
    if (data.potassium < 40) {
      fertilizers.push({ name: 'Muriate of Potash (MOP)', amount: '40-60 kg/ha', reason: 'Low potassium levels' });
    }
    
    if (data.pH < 6.0) {
      crops.push({ name: 'Tea', suitability: 'Medium', reason: 'Acidic soil suitable' });
      fertilizers.push({ name: 'Lime', amount: '200-300 kg/ha', reason: 'Soil too acidic - needs pH correction' });
    }
    
    if (data.pH > 7.5) {
      crops.push({ name: 'Cotton', suitability: 'Medium', reason: 'Tolerates alkaline soils' });
      fertilizers.push({ name: 'Sulfur', amount: '50-100 kg/ha', reason: 'Soil too alkaline - needs pH correction' });
    }
    
    if (data.soilType === 'Clay' || data.soilType === 'Clay Loam') {
      crops.push({ name: 'Sugarcane', suitability: 'High', reason: 'Heavy soil with good water retention' });
    }
    
    if (data.soilType === 'Sandy' || data.soilType === 'Sandy Loam') {
      crops.push({ name: 'Groundnut', suitability: 'High', reason: 'Light soil with good drainage' });
      crops.push({ name: 'Millets', suitability: 'Medium', reason: 'Drought-tolerant crops for sandy soil' });
    }
    
    // Add organic matter recommendation
    if (data.organicCarbon && data.organicCarbon < 0.5) {
      fertilizers.push({ name: 'Farm Yard Manure (FYM)', amount: '5-10 tons/ha', reason: 'Low organic matter content' });
    }
    
    return { crops, fertilizers };
  };

  // Check for critical alerts with notification badge
  const checkAlerts = (data) => {
    const newAlerts = [];
    let critical = 0;
    
    if (data.nitrogen < 30) {
      critical++;
      newAlerts.push({
        type: 'critical',
        metric: 'Nitrogen',
        message: 'Critical: Nitrogen levels extremely low. Immediate fertilization required.',
        messageHi: 'गंभीर: नाइट्रोजन का स्तर बेहद कम है। तत्काल उर्वरक की आवश्यकता है।',
        action: 'Apply 150-200 kg/ha Urea immediately',
        actionHi: 'तुरंत 150-200 किग्रा/हेक्टेयर यूरिया डालें'
      });
    }
    
    if (data.phosphorus < 20) {
      newAlerts.push({
        type: 'warning',
        metric: 'Phosphorus',
        message: 'Warning: Phosphorus levels low. May affect crop growth.',
        messageHi: 'चेतावनी: फास्फोरस का स्तर कम है। फसल की वृद्धि प्रभावित हो सकती है।',
        action: 'Apply 75-100 kg/ha DAP before next planting',
        actionHi: 'अगली बुवाई से पहले 75-100 किग्रा/हेक्टेयर DAP डालें'
      });
    }
    
    if (data.potassium < 30) {
      critical++;
      newAlerts.push({
        type: 'warning',
        metric: 'Potassium',
        message: 'Warning: Potassium levels low. Crop quality may be affected.',
        messageHi: 'चेतावनी: पोटेशियम का स्तर कम है। फसल की गुणवत्ता प्रभावित हो सकती है।',
        action: 'Apply 60-80 kg/ha MOP',
        actionHi: '60-80 किग्रा/हेक्टेयर MOP डालें'
      });
    }
    
    if (data.pH < 5.5 || data.pH > 8.5) {
      critical++;
      newAlerts.push({
        type: 'critical',
        metric: 'pH',
        message: `Critical: Soil pH ${data.pH} is extreme. Most crops won't thrive.`,
        messageHi: `गंभीर: मिट्टी का pH ${data.pH} अत्यधिक है। अधिकांश फसलें नहीं पनपेंगी।`,
        action: data.pH < 5.5 ? 'Apply lime to increase pH' : 'Apply sulfur to decrease pH',
        actionHi: data.pH < 5.5 ? 'pH बढ़ाने के लिए चूना डालें' : 'pH कम करने के लिए सल्फर डालें'
      });
    }
    
    if (data.moisture && data.moisture < 15) {
      critical++;
      newAlerts.push({
        type: 'warning',
        metric: 'Moisture',
        message: 'Warning: Soil moisture critically low.',
        messageHi: 'चेतावनी: मिट्टी की नमी बहुत कम है।',
        action: 'Immediate irrigation required',
        actionHi: 'तत्काल सिंचाई की आवश्यकता है'
      });
    }
    
    setAlerts(newAlerts);
    setCriticalCount(critical);
    setShowNotificationBadge(critical > 0);
    
    // Play notification sound if critical
    if (critical > 0 && window.Audio) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi2F0O');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  };

  // Generate historical data with predictions
  const generateHistoricalData = (currentData) => {
    const history = [];
    const today = new Date();
    
    // Historical data (last 6 months)
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i * 30);
      
      history.push({
        date: date.toLocaleDateString('en-US', { month: 'short' }),
        nitrogen: Math.max(0, currentData.nitrogen + (Math.random() - 0.5) * 10),
        phosphorus: Math.max(0, currentData.phosphorus + (Math.random() - 0.5) * 8),
        potassium: Math.max(0, currentData.potassium + (Math.random() - 0.5) * 8),
        ph: Math.max(3, Math.min(11, currentData.pH + (Math.random() - 0.5) * 0.5)),
        moisture: currentData.moisture ? Math.max(0, Math.min(100, currentData.moisture + (Math.random() - 0.5) * 10)) : null,
        isPrediction: false
      });
    }
    
    // Prediction for next 3 months (simple linear trend)
    const lastN = history[history.length - 1].nitrogen;
    const lastP = history[history.length - 1].phosphorus;
    const lastK = history[history.length - 1].potassium;
    const lastPh = history[history.length - 1].ph;
    const lastMoisture = history[history.length - 1].moisture;
    
    // Calculate trends
    const nTrend = (history[history.length - 1].nitrogen - history[0].nitrogen) / 6;
    const pTrend = (history[history.length - 1].phosphorus - history[0].phosphorus) / 6;
    const kTrend = (history[history.length - 1].potassium - history[0].potassium) / 6;
    const phTrend = (history[history.length - 1].ph - history[0].ph) / 6;
    
    for (let i = 1; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i * 30);
      
      history.push({
        date: date.toLocaleDateString('en-US', { month: 'short' }),
        nitrogen: Math.max(0, lastN + nTrend * i),
        phosphorus: Math.max(0, lastP + pTrend * i),
        potassium: Math.max(0, lastK + kTrend * i),
        ph: Math.max(3, Math.min(11, lastPh + phTrend * i)),
        moisture: lastMoisture ? Math.max(0, Math.min(100, lastMoisture)) : null,
        isPrediction: true
      });
    }
    
    setHistoricalData(history);
  };

  // Crop comparison data
  const cropComparisonData = {
    Rice: {
      name: 'Rice',
      nameHi: 'धान',
      yieldPerHa: '4-6 tons',
      pricePerQuintal: 2100,
      costPerHa: 35000,
      waterNeed: 'High (1200-1500mm)',
      duration: '120-150 days',
      soilPreference: 'Clay loam, pH 6.0-7.0',
      bestSeason: 'Kharif',
      profitPerHa: 91000,
      riskLevel: 'Medium'
    },
    Wheat: {
      name: 'Wheat',
      nameHi: 'गेहूं',
      yieldPerHa: '3-5 tons',
      pricePerQuintal: 2125,
      costPerHa: 32000,
      waterNeed: 'Medium (450-650mm)',
      duration: '120-140 days',
      soilPreference: 'Loam, pH 6.0-7.5',
      bestSeason: 'Rabi',
      profitPerHa: 74250,
      riskLevel: 'Low'
    },
    Cotton: {
      name: 'Cotton',
      nameHi: 'कपास',
      yieldPerHa: '20-30 quintals',
      pricePerQuintal: 6500,
      costPerHa: 45000,
      waterNeed: 'Medium (700-1300mm)',
      duration: '150-180 days',
      soilPreference: 'Black cotton soil, pH 6.5-8.0',
      bestSeason: 'Kharif',
      profitPerHa: 117500,
      riskLevel: 'High'
    },
    Sugarcane: {
      name: 'Sugarcane',
      nameHi: 'गन्ना',
      yieldPerHa: '70-100 tons',
      pricePerQuintal: 315,
      costPerHa: 75000,
      waterNeed: 'Very High (1500-2500mm)',
      duration: '12-18 months',
      soilPreference: 'Heavy loam, pH 6.5-7.5',
      bestSeason: 'Year-round',
      profitPerHa: 205500,
      riskLevel: 'Low'
    }
  };

  // Fertilizer calculator
  const calculateFertilizer = (fertName, area, deficiency) => {
    const rates = {
      'Urea': { min: 100, max: 150, unit: 'kg/ha' },
      'DAP': { min: 50, max: 75, unit: 'kg/ha' },
      'MOP': { min: 40, max: 60, unit: 'kg/ha' },
      'Lime': { min: 200, max: 300, unit: 'kg/ha' },
      'Sulfur': { min: 50, max: 100, unit: 'kg/ha' },
      'FYM': { min: 5, max: 10, unit: 'tons/ha' }
    };
    
    const rate = rates[fertName];
    if (!rate || !area) return null;
    
    const areaNum = parseFloat(area);
    const avgRate = (rate.min + rate.max) / 2;
    const totalQty = avgRate * areaNum;
    const costPerUnit = {
      'Urea': 6,
      'DAP': 27,
      'MOP': 17,
      'Lime': 3,
      'Sulfur': 20,
      'FYM': 500
    };
    
    return {
      quantity: totalQty.toFixed(2),
      unit: rate.unit.split('/')[0],
      cost: (totalQty * costPerUnit[fertName]).toFixed(2),
      perHa: `${rate.min}-${rate.max} ${rate.unit}`
    };
  };

  const getQualityColor = (level) => {
    switch (level) {
      case 'Excellent': return 'bg-green-100 text-green-800 border-green-300';
      case 'Good': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Fair': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Voice Navigation and Notification Badge */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              🌍 {t('app.soilData.title')}
              {showNotificationBadge && (
                <span className="relative inline-flex">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-8 w-8 bg-red-500 text-white items-center justify-center text-sm font-bold">
                    {criticalCount}
                  </span>
                </span>
              )}
            </h1>
            <p className="text-gray-600">
              {t('app.soilData.subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const lang = t('lang') || 'en';
                const text = lang === 'hi' 
                  ? 'मिट्टी डेटा प्रबंधन। अपना स्थान दर्ज करें और व्यापक मिट्टी डेटा प्राप्त करें।'
                  : 'Soil Data Management. Enter your location to fetch comprehensive soil data.';
                speakText(text, lang === 'hi' ? 'hi-IN' : 'en-US');
              }}
              disabled={speaking}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {speaking ? '🔊 Speaking...' : '🎤 Voice Guide'}
            </button>
          </div>
        </div>

        {/* Critical Alerts Section with Hindi Support */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-3">
            {alerts.map((alert, idx) => (
              <div 
                key={idx} 
                className={`rounded-lg p-4 border-2 ${
                  alert.type === 'critical' 
                    ? 'bg-red-50 border-red-300 text-red-900' 
                    : 'bg-yellow-50 border-yellow-300 text-yellow-900'
                } animate-pulse`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {alert.type === 'critical' ? '⚠️' : '⚠️'}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">
                      {alert.type === 'critical' ? t('app.soilData.criticalAlert') : t('app.soilData.warning')}: {alert.metric}
                    </h3>
                    <p className="mb-2">{t('lang') === 'hi' ? alert.messageHi : alert.message}</p>
                    <div className="bg-white bg-opacity-50 p-2 rounded border border-current">
                      <strong>💡 {t('app.soilData.actionRequired')}:</strong> {t('lang') === 'hi' ? alert.actionHi : alert.action}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const lang = t('lang') || 'en';
                      const text = lang === 'hi' ? alert.messageHi + '. ' + alert.actionHi : alert.message + '. ' + alert.action;
                      speakText(text, lang === 'hi' ? 'hi-IN' : 'en-US');
                    }}
                    className="px-3 py-1 bg-white rounded hover:bg-opacity-80 transition-colors"
                  >
                    🔊
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Location Input Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📍 {t('app.soilData.location')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('app.soilData.latitude')}
              </label>
              <input
                type="number"
                step="0.000001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g., 28.6139"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('app.soilData.longitude')}
              </label>
              <input
                type="number"
                step="0.000001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g., 77.2090"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={getCurrentLocation}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📍 {loading ? t('app.soilData.gettingLocation') : t('app.soilData.useCurrentLocation')}
              </button>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={fetchSoilData}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? t('app.soilData.loading') : `🔍 ${t('app.soilData.fetchSoilData')}`}
            </button>

            <button
              onClick={() => setShowIotForm(!showIotForm)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              📡 {showIotForm ? 'Hide' : 'Submit'} {t('app.soilData.iotSensorData')}
            </button>
          </div>
        </div>

        {/* IoT Sensor Form */}
        {showIotForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📡 {t('app.soilData.iotSensorData')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('app.soilData.nitrogen')}
                </label>
                <input
                  type="number"
                  value={iotData.n}
                  onChange={(e) => setIotData({...iotData, n: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('app.soilData.phosphorus')}
                </label>
                <input
                  type="number"
                  value={iotData.p}
                  onChange={(e) => setIotData({...iotData, p: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('app.soilData.potassium')}
                </label>
                <input
                  type="number"
                  value={iotData.k}
                  onChange={(e) => setIotData({...iotData, k: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('app.soilData.phLevel')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={iotData.ph}
                  onChange={(e) => setIotData({...iotData, ph: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('app.soilData.moisture')}
                </label>
                <input
                  type="number"
                  value={iotData.moisture}
                  onChange={(e) => setIotData({...iotData, moisture: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('app.soilData.temperature')}
                </label>
                <input
                  type="number"
                  value={iotData.temperature}
                  onChange={(e) => setIotData({...iotData, temperature: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('app.soilData.ec')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={iotData.ec}
                  onChange={(e) => setIotData({...iotData, ec: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('app.soilData.deviceId')}
                </label>
                <input
                  type="text"
                  value={iotData.deviceId}
                  onChange={(e) => setIotData({...iotData, deviceId: e.target.value})}
                  placeholder="Sensor ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              onClick={submitIoTData}
              disabled={loading}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium"
            >
              {loading ? t('app.soilData.loading') : `📡 ${t('app.soilData.submitIoTData')}`}
            </button>
          </div>
        )}

        {/* Soil Data Results */}
        {soilData && (
          <div className="space-y-6">
            {/* Data Quality Card */}
            <div className={`rounded-lg shadow-md p-6 border-2 ${getQualityColor(soilData.data.dataQuality.level)}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  📊 {t('app.soilData.dataQuality')}: {soilData.data.dataQuality.level}
                </h2>
                <span className="text-2xl font-bold">
                  {soilData.data.dataQuality.score}%
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium mb-2">{t('app.soilData.dataSourceStatus')}:</p>
                <div className="flex flex-wrap gap-2">
                  {soilData.data.dataQuality.sources.map((source, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white rounded-full text-sm font-medium border">
                      {source}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-sm">
                💡 <strong>Recommendation:</strong> {soilData.data.dataQuality.recommendation}
              </p>
            </div>

            {/* Soil Parameters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* NPK Card with Visual Indicators */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🌱 {t('app.soilData.npkLevels')}</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">{t('app.soilData.nitrogen').split(' ')[0]} (N):</span>
                      <span className="font-semibold text-green-600">{soilData.data.nitrogen} kg/ha</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            getMetricStatus('nitrogen', soilData.data.nitrogen).color === 'green' ? 'bg-green-500' :
                            getMetricStatus('nitrogen', soilData.data.nitrogen).color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min((soilData.data.nitrogen / 120) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xl">{getMetricStatus('nitrogen', soilData.data.nitrogen).icon}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {getMetricStatus('nitrogen', soilData.data.nitrogen).label}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">{t('app.soilData.phosphorus').split(' ')[0]} (P):</span>
                      <span className="font-semibold text-blue-600">{soilData.data.phosphorus} kg/ha</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            getMetricStatus('phosphorus', soilData.data.phosphorus).color === 'green' ? 'bg-green-500' :
                            getMetricStatus('phosphorus', soilData.data.phosphorus).color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min((soilData.data.phosphorus / 90) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xl">{getMetricStatus('phosphorus', soilData.data.phosphorus).icon}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {getMetricStatus('phosphorus', soilData.data.phosphorus).label}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">{t('app.soilData.potassium').split(' ')[0]} (K):</span>
                      <span className="font-semibold text-purple-600">{soilData.data.potassium} kg/ha</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            getMetricStatus('potassium', soilData.data.potassium).color === 'green' ? 'bg-green-500' :
                            getMetricStatus('potassium', soilData.data.potassium).color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min((soilData.data.potassium / 120) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xl">{getMetricStatus('potassium', soilData.data.potassium).icon}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {getMetricStatus('potassium', soilData.data.potassium).label}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => speakText(`Nitrogen: ${soilData.data.nitrogen}. ${getMetricStatus('nitrogen', soilData.data.nitrogen).label}. Phosphorus: ${soilData.data.phosphorus}. ${getMetricStatus('phosphorus', soilData.data.phosphorus).label}. Potassium: ${soilData.data.potassium}. ${getMetricStatus('potassium', soilData.data.potassium).label}`)}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    🔊 Read NPK Status
                  </button>
                </div>
              </div>

              {/* Soil Properties Card with pH Visual */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🧪 {t('app.soilData.soilProperties')}</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">{t('app.soilData.phLevel')}:</span>
                      <span className="font-semibold">{soilData.data.pH}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-full relative">
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 w-1 h-4 bg-black"
                          style={{ left: `${((soilData.data.pH - 3) / 11) * 100}%` }}
                        />
                      </div>
                      <span className="text-xl">{getMetricStatus('ph', soilData.data.pH).icon}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Acidic (3)</span>
                      <span>Neutral (7)</span>
                      <span>Alkaline (14)</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {getMetricStatus('ph', soilData.data.pH).label}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('app.soilData.soilType')}:</span>
                    <span className="font-semibold">{soilData.data.soilType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('app.soilData.texture')}:</span>
                    <span className="font-semibold">{soilData.data.texture}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => speakText(`pH level is ${soilData.data.pH}. ${getMetricStatus('ph', soilData.data.pH).label}. Soil type: ${soilData.data.soilType}. Texture: ${soilData.data.texture}`)}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    🔊 Read Soil Properties
                  </button>
                </div>
              </div>

              {/* Physical Properties Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🏞️ {t('app.soilData.physicalProperties')}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('app.soilData.drainage')}:</span>
                    <span className="font-semibold">{soilData.data.drainage}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('app.soilData.depth')}:</span>
                    <span className="font-semibold">{soilData.data.depth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('app.soilData.erosion')}:</span>
                    <span className="font-semibold">{soilData.data.erosion}</span>
                  </div>
                </div>
              </div>

              {/* Environmental Data Card */}
              {(soilData.data.temperature || soilData.data.moisture) && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🌡️ {t('app.soilData.environmentalData')}</h3>
                  <div className="space-y-3">
                    {soilData.data.temperature && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t('app.soilData.temperature').split(' ')[0]}:</span>
                        <span className="font-semibold">{soilData.data.temperature}°C</span>
                      </div>
                    )}
                    {soilData.data.moisture && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t('app.soilData.moisture').split(' ')[0]}:</span>
                        <span className="font-semibold">{soilData.data.moisture}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Organic Matter Card */}
              {soilData.data.organicCarbon && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🍂 {t('app.soilData.organicMatter')}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('app.soilData.organicCarbon')}:</span>
                      <span className="font-semibold">{soilData.data.organicCarbon} g/kg</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Location Info Card */}
              {soilData.location && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">📍 {t('app.soilData.locationInfo')}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('app.soilData.latitude')}:</span>
                      <span className="font-semibold">{soilData.location.latitude}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('app.soilData.longitude')}:</span>
                      <span className="font-semibold">{soilData.location.longitude}</span>
                    </div>
                    {soilData.location.state && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t('app.soilData.state')}:</span>
                        <span className="font-semibold">{soilData.location.state}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Data Sources Breakdown */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📡 {t('app.soilData.dataSourceStatus')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border-2 ${soilData.data.sources.iot ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t('app.soilData.iotSensors')}</span>
                    <span className="text-2xl">{soilData.data.sources.iot ? '✅' : '❌'}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{t('app.soilData.realTimeSensorData')}</p>
                </div>

                <div className={`p-4 rounded-lg border-2 ${soilData.data.sources.bhuvan ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t('app.soilData.bhuvanISRO')}</span>
                    <span className="text-2xl">{soilData.data.sources.bhuvan ? '✅' : '❌'}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{t('app.soilData.indianSatelliteData')}</p>
                </div>

                <div className={`p-4 rounded-lg border-2 ${soilData.data.sources.soilgrids ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t('app.soilData.soilGrids')}</span>
                    <span className="text-2xl">{soilData.data.sources.soilgrids ? '✅' : '❌'}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{t('app.soilData.globalSoilDatabase')}</p>
                </div>
              </div>
            </div>

            {/* Soil Parameter Trends Chart with Predictions and Interactive Features */}
            {historicalData.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">📈 {i18n.language === 'hi' ? 'मिट्टी पैरामीटर रुझान (6 महीने + 3 महीने पूर्वानुमानित)' : `Soil Parameter Trends (6 Months + 3 Months Predicted)`}</h3>
                  <button
                    onClick={() => {
                      const lang = i18n.language || 'en';
                      const text = lang === 'hi'
                        ? 'पिछले 6 महीनों के मिट्टी पैरामीटर रुझान अगले 3 महीनों के पूर्वानुमान के साथ। चार्ट नाइट्रोजन, फास्फोरस, पोटेशियम और pH स्तर में परिवर्तन दिखाते हैं।'
                        : 'Soil parameter trends over the last 6 months with predictions for the next 3 months. The charts show changes in nitrogen, phosphorus, potassium, and pH levels.';
                      speakText(text, lang === 'hi' ? 'hi-IN' : 'en-US');
                    }}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    🔊 {t('app.soilData.explainChart')}
                  </button>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{t('app.soilData.npkLevelsOverTime')}</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart 
                      data={historicalData}
                      onClick={(e) => {
                        if (e && e.activePayload) {
                          setSelectedDataPoint(e.activePayload[0].payload);
                        }
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis label={{ value: 'kg/ha', angle: -90, position: 'insideLeft' }} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 shadow-lg rounded border border-gray-200">
                                <p className="font-semibold">{data.date} {data.isPrediction ? `(${t('app.soilData.predicted')})` : ''}</p>
                                <p className="text-green-600">N: {data.nitrogen?.toFixed(1)} kg/ha</p>
                                <p className="text-blue-600">P: {data.phosphorus?.toFixed(1)} kg/ha</p>
                                <p className="text-purple-600">K: {data.potassium?.toFixed(1)} kg/ha</p>
                                {data.isPrediction && (
                                  <p className="text-xs text-gray-500 mt-1">🔮 {t('app.soilData.prediction')}</p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="nitrogen" 
                        stroke="#10b981" 
                        name="Nitrogen (N)" 
                        strokeWidth={2}
                        strokeDasharray={(entry) => entry?.isPrediction ? '5 5' : '0'}
                        dot={{ r: 4, cursor: 'pointer' }}
                        activeDot={{ r: 6, onClick: (e, payload) => setSelectedDataPoint(payload.payload) }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="phosphorus" 
                        stroke="#3b82f6" 
                        name="Phosphorus (P)" 
                        strokeWidth={2}
                        strokeDasharray={(entry) => entry?.isPrediction ? '5 5' : '0'}
                        dot={{ r: 4, cursor: 'pointer' }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="potassium" 
                        stroke="#8b5cf6" 
                        name="Potassium (K)" 
                        strokeWidth={2}
                        strokeDasharray={(entry) => entry?.isPrediction ? '5 5' : '0'}
                        dot={{ r: 4, cursor: 'pointer' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-gray-500 mt-2">🔮 {t('app.soilData.dashedLines')} {t('app.soilData.clickForDetails')}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">pH Level Trend</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[5, 8]} label={{ value: 'pH', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="ph" stroke="#f59e0b" fill="#fbbf24" name="pH Level" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {historicalData.some(d => d.moisture) && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Soil Moisture Trend</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis label={{ value: 'Moisture %', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="moisture" fill="#06b6d4" name="Moisture %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {/* Recommendations Panel */}
            {showRecommendations && recommendations && (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-md p-6 border-2 border-green-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">🌾 {t('app.soilData.soilBasedRecommendations')}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCompareModal(true)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                    >
                      🌾 {t('app.soilData.compareCrops')}
                    </button>
                    <button
                      onClick={() => setShowFertilizerCalc(true)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                    >
                      🧪 {t('app.soilData.fertilizerCalculator')}
                    </button>
                    <button
                      onClick={() => {
                        const lang = i18n.language || 'en';
                        const cropNames = recommendations.crops.map(c => c.name).join(', ');
                        const fertNames = recommendations.fertilizers.map(f => f.name).join(', ');
                        const text = lang === 'hi'
                          ? `आपकी मिट्टी की स्थिति के आधार पर, अनुशंसित फसलें हैं: ${cropNames}। अनुशंसित उर्वरक हैं: ${fertNames}।`
                          : `Based on your soil conditions, recommended crops are: ${cropNames}. Recommended fertilizers are: ${fertNames}`;
                        speakText(text, lang === 'hi' ? 'hi-IN' : 'en-US');
                      }}
                      className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-1"
                    >
                      🔊 {t('app.soilData.readRecommendations')}
                    </button>
                  </div>
                </div>

                {/* Crop Recommendations */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                    🌱 {t('app.soilData.recommendedCropsTitle')}
                  </h4>
                  {recommendations.crops.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendations.crops.map((crop, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-bold text-gray-900">{crop.name}</h5>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              crop.suitability === 'High' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {crop.suitability === 'High' ? t('app.soilData.highSuitability') : t('app.soilData.mediumSuitability')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">💡 {crop.reason}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">{t('app.soilData.noRecommendations')}</p>
                  )}
                </div>

                {/* Fertilizer Recommendations */}
                <div>
                  <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    🧪 {t('app.soilData.recommendedFertilizers')}
                  </h4>
                  {recommendations.fertilizers.length > 0 ? (
                    <div className="space-y-3">
                      {recommendations.fertilizers.map((fert, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h5 className="font-bold text-gray-900">{fert.name}</h5>
                              <p className="text-sm text-blue-600 font-medium mt-1">
                                📏 {t('app.soilData.applicationRate')}: {fert.amount}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">💡 {fert.reason}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">{t('app.soilData.adequateNutrients')}</p>
                  )}
                </div>

                {/* General Advisory */}
                <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
                  <h5 className="font-semibold text-blue-900 mb-2">👨‍🌾 {t('app.soilData.expertAdvisory')}</h5>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>{t('app.soilData.conductSoilTesting')}</li>
                    <li>{t('app.soilData.considerCropRotation')}</li>
                    <li>{t('app.soilData.applyOrganicMatter')}</li>
                    <li>{t('app.soilData.monitorMoisture')}</li>
                    <li>{t('app.soilData.consultServices')}</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Last Updated */}
            <div className="text-center text-sm text-gray-500">
              {t('app.soilData.lastUpdated')}: {new Date(soilData.data.lastUpdated).toLocaleString()}
            </div>
          </div>
        )}

        {/* Selected Data Point Modal */}
        {selectedDataPoint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedDataPoint(null)}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">📅 {selectedDataPoint.date} {t('app.soilData.details') || 'Details'}</h3>
                <button onClick={() => setSelectedDataPoint(null)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              
              {selectedDataPoint.isPrediction && (
                <div className="bg-purple-50 border border-purple-200 rounded p-3 mb-4">
                  <p className="text-sm text-purple-900">🔮 <strong>{t('app.soilData.predicted')}</strong> - {t('app.soilData.prediction')}</p>
                </div>
              )}
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="font-medium">{t('app.soilData.nitrogen').split(' ')[0]}:</span>
                  <span className="text-lg font-bold text-green-600">{selectedDataPoint.nitrogen?.toFixed(1)} kg/ha</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="font-medium">{t('app.soilData.phosphorus').split(' ')[0]}:</span>
                  <span className="text-lg font-bold text-blue-600">{selectedDataPoint.phosphorus?.toFixed(1)} kg/ha</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                  <span className="font-medium">{t('app.soilData.potassium').split(' ')[0]}:</span>
                  <span className="text-lg font-bold text-purple-600">{selectedDataPoint.potassium?.toFixed(1)} kg/ha</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                  <span className="font-medium">{t('app.soilData.phLevel')}:</span>
                  <span className="text-lg font-bold text-yellow-600">{selectedDataPoint.ph?.toFixed(2)}</span>
                </div>
                {selectedDataPoint.moisture && (
                  <div className="flex justify-between items-center p-3 bg-cyan-50 rounded">
                    <span className="font-medium">{t('app.soilData.moisture').split(' ')[0]}:</span>
                    <span className="text-lg font-bold text-cyan-600">{selectedDataPoint.moisture?.toFixed(1)}%</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setSelectedDataPoint(null)}
                className="w-full mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                {t('app.soilData.close')}
              </button>
            </div>
          </div>
        )}

        {/* Crop Comparison Modal */}
        {showCompareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto" onClick={() => setShowCompareModal(false)}>
            <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 my-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">🌾 {t('app.soilData.cropComparison')}</h3>
                <button onClick={() => setShowCompareModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
              </div>
              
              {/* Crop Selection */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">{t('app.soilData.selectCrops')}:</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(cropComparisonData).map((crop) => (
                    <button
                      key={crop}
                      onClick={() => {
                        if (selectedCrops.includes(crop)) {
                          setSelectedCrops(selectedCrops.filter(c => c !== crop));
                        } else if (selectedCrops.length < 3) {
                          setSelectedCrops([...selectedCrops, crop]);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedCrops.includes(crop)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {crop} {selectedCrops.includes(crop) ? '✓' : ''}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Comparison Table */}
              {selectedCrops.length >= 2 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-3 text-left font-semibold">{t('app.soilData.parameter')}</th>
                        {selectedCrops.map((crop) => (
                          <th key={crop} className="border p-3 text-center font-semibold">{i18n.language === 'hi' ? cropComparisonData[crop].nameHi : cropComparisonData[crop].name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-3 font-medium bg-gray-50">{t('app.soilData.expectedYield')}</td>
                        {selectedCrops.map((crop) => (
                          <td key={crop} className="border p-3 text-center">{cropComparisonData[crop].yieldPerHa}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border p-3 font-medium bg-gray-50">{t('app.soilData.pricePerQuintal')}</td>
                        {selectedCrops.map((crop) => (
                          <td key={crop} className="border p-3 text-center">₹{cropComparisonData[crop].pricePerQuintal}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border p-3 font-medium bg-gray-50">{t('app.soilData.costPerHectare')}</td>
                        {selectedCrops.map((crop) => (
                          <td key={crop} className="border p-3 text-center">₹{cropComparisonData[crop].costPerHa}</td>
                        ))}
                      </tr>
                      <tr className="bg-green-50">
                        <td className="border p-3 font-bold">{t('app.soilData.profitPerHectare')}</td>
                        {selectedCrops.map((crop) => (
                          <td key={crop} className="border p-3 text-center font-bold text-green-600">₹{cropComparisonData[crop].profitPerHa.toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border p-3 font-medium bg-gray-50">{t('app.soilData.waterRequirement')}</td>
                        {selectedCrops.map((crop) => (
                          <td key={crop} className="border p-3 text-center text-sm">{cropComparisonData[crop].waterNeed}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border p-3 font-medium bg-gray-50">{t('app.soilData.duration')}</td>
                        {selectedCrops.map((crop) => (
                          <td key={crop} className="border p-3 text-center">{cropComparisonData[crop].duration}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border p-3 font-medium bg-gray-50">{t('app.soilData.soilPreference')}</td>
                        {selectedCrops.map((crop) => (
                          <td key={crop} className="border p-3 text-center text-sm">{cropComparisonData[crop].soilPreference}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border p-3 font-medium bg-gray-50">{t('app.soilData.bestSeason')}</td>
                        {selectedCrops.map((crop) => (
                          <td key={crop} className="border p-3 text-center">{cropComparisonData[crop].bestSeason}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border p-3 font-medium bg-gray-50">{t('app.soilData.riskLevel')}</td>
                        {selectedCrops.map((crop) => (
                          <td key={crop} className="border p-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              cropComparisonData[crop].riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                              cropComparisonData[crop].riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {cropComparisonData[crop].riskLevel}
                            </span>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                  
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">💡 {t('app.soilData.recommendation')}:</h4>
                    <p className="text-sm text-blue-800">
                      {t('app.soilData.basedOnProfitability')}, <strong>{selectedCrops.reduce((best, crop) => 
                        cropComparisonData[crop].profitPerHa > cropComparisonData[best].profitPerHa ? crop : best
                      )}</strong> {t('app.soilData.offersHighest')}. {t('app.soilData.considerFactors')}.
                    </p>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => setShowCompareModal(false)}
                className="w-full mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                {t('app.soilData.close')}
              </button>
            </div>
          </div>
        )}

        {/* Fertilizer Calculator Modal */}
        {showFertilizerCalc && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowFertilizerCalc(false)}>
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">🧪 {t('app.soilData.fertilizerCalculator')}</h3>
                <button onClick={() => setShowFertilizerCalc(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('app.soilData.farmArea')}:
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={farmArea}
                  onChange={(e) => setFarmArea(e.target.value)}
                  placeholder="e.g., 2.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              {soilData && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">{t('app.soilData.recommendedFertilizers')}:</h4>
                  
                  {/* NPK Fertilizers - Always show */}
                  {soilData.data.nitrogen < 40 && (
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-bold text-lg">Urea</h5>
                          <p className="text-sm text-gray-600">Low nitrogen levels detected (N: {soilData.data.nitrogen} kg/ha)</p>
                          <p className="text-xs text-gray-500 mt-1">{t('app.soilData.standardRate')}: 100-150 kg/ha</p>
                        </div>
                        <button
                          onClick={() => setSelectedFertilizer(selectedFertilizer === 'Urea' ? null : 'Urea')}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          {selectedFertilizer === 'Urea' ? t('app.soilData.hide') : t('app.soilData.calculate')}
                        </button>
                      </div>
                      {selectedFertilizer === 'Urea' && farmArea && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-600">{t('app.soilData.totalQuantity')}:</p>
                              <p className="text-xl font-bold text-green-700">{calculateFertilizer('Urea', farmArea).quantity} {calculateFertilizer('Urea', farmArea).unit}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">{t('app.soilData.estimatedCost')}:</p>
                              <p className="text-xl font-bold text-green-700">₹{calculateFertilizer('Urea', farmArea).cost}</p>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-green-200">
                            <p className="text-xs text-gray-600">{t('app.soilData.for')} {farmArea} {t('app.soilData.hectares')} @ {calculateFertilizer('Urea', farmArea).perHa}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {soilData.data.phosphorus < 30 && (
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-bold text-lg">DAP (Diammonium Phosphate)</h5>
                          <p className="text-sm text-gray-600">Low phosphorus levels (P: {soilData.data.phosphorus} kg/ha)</p>
                          <p className="text-xs text-gray-500 mt-1">{t('app.soilData.standardRate')}: 50-75 kg/ha</p>
                        </div>
                        <button
                          onClick={() => setSelectedFertilizer(selectedFertilizer === 'DAP' ? null : 'DAP')}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          {selectedFertilizer === 'DAP' ? t('app.soilData.hide') : t('app.soilData.calculate')}
                        </button>
                      </div>
                      {selectedFertilizer === 'DAP' && farmArea && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-600">{t('app.soilData.totalQuantity')}:</p>
                              <p className="text-xl font-bold text-green-700">{calculateFertilizer('DAP', farmArea).quantity} {calculateFertilizer('DAP', farmArea).unit}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">{t('app.soilData.estimatedCost')}:</p>
                              <p className="text-xl font-bold text-green-700">₹{calculateFertilizer('DAP', farmArea).cost}</p>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-green-200">
                            <p className="text-xs text-gray-600">{t('app.soilData.for')} {farmArea} {t('app.soilData.hectares')} @ {calculateFertilizer('DAP', farmArea).perHa}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {soilData.data.potassium < 40 && (
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-bold text-lg">Muriate of Potash (MOP)</h5>
                          <p className="text-sm text-gray-600">Low potassium levels (K: {soilData.data.potassium} kg/ha)</p>
                          <p className="text-xs text-gray-500 mt-1">{t('app.soilData.standardRate')}: 40-60 kg/ha</p>
                        </div>
                        <button
                          onClick={() => setSelectedFertilizer(selectedFertilizer === 'MOP' ? null : 'MOP')}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          {selectedFertilizer === 'MOP' ? t('app.soilData.hide') : t('app.soilData.calculate')}
                        </button>
                      </div>
                      {selectedFertilizer === 'MOP' && farmArea && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-600">{t('app.soilData.totalQuantity')}:</p>
                              <p className="text-xl font-bold text-green-700">{calculateFertilizer('MOP', farmArea).quantity} {calculateFertilizer('MOP', farmArea).unit}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">{t('app.soilData.estimatedCost')}:</p>
                              <p className="text-xl font-bold text-green-700">₹{calculateFertilizer('MOP', farmArea).cost}</p>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-green-200">
                            <p className="text-xs text-gray-600">{t('app.soilData.for')} {farmArea} {t('app.soilData.hectares')} @ {calculateFertilizer('MOP', farmArea).perHa}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* pH Correction Fertilizers */}
                  {soilData.data.pH < 6.0 && (
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-bold text-lg">Lime</h5>
                          <p className="text-sm text-gray-600">Soil too acidic (pH: {soilData.data.pH}) - needs pH correction</p>
                          <p className="text-xs text-gray-500 mt-1">{t('app.soilData.standardRate')}: 200-300 kg/ha</p>
                        </div>
                        <button
                          onClick={() => setSelectedFertilizer(selectedFertilizer === 'Lime' ? null : 'Lime')}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          {selectedFertilizer === 'Lime' ? t('app.soilData.hide') : t('app.soilData.calculate')}
                        </button>
                      </div>
                      {selectedFertilizer === 'Lime' && farmArea && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-600">{t('app.soilData.totalQuantity')}:</p>
                              <p className="text-xl font-bold text-green-700">{calculateFertilizer('Lime', farmArea).quantity} {calculateFertilizer('Lime', farmArea).unit}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">{t('app.soilData.estimatedCost')}:</p>
                              <p className="text-xl font-bold text-green-700">₹{calculateFertilizer('Lime', farmArea).cost}</p>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-green-200">
                            <p className="text-xs text-gray-600">{t('app.soilData.for')} {farmArea} {t('app.soilData.hectares')} @ {calculateFertilizer('Lime', farmArea).perHa}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {soilData.data.pH > 7.5 && (
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-bold text-lg">Sulfur</h5>
                          <p className="text-sm text-gray-600">Soil too alkaline (pH: {soilData.data.pH}) - needs pH correction</p>
                          <p className="text-xs text-gray-500 mt-1">{t('app.soilData.standardRate')}: 50-100 kg/ha</p>
                        </div>
                        <button
                          onClick={() => setSelectedFertilizer(selectedFertilizer === 'Sulfur' ? null : 'Sulfur')}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          {selectedFertilizer === 'Sulfur' ? t('app.soilData.hide') : t('app.soilData.calculate')}
                        </button>
                      </div>
                      {selectedFertilizer === 'Sulfur' && farmArea && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-600">{t('app.soilData.totalQuantity')}:</p>
                              <p className="text-xl font-bold text-green-700">{calculateFertilizer('Sulfur', farmArea).quantity} {calculateFertilizer('Sulfur', farmArea).unit}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">{t('app.soilData.estimatedCost')}:</p>
                              <p className="text-xl font-bold text-green-700">₹{calculateFertilizer('Sulfur', farmArea).cost}</p>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-green-200">
                            <p className="text-xs text-gray-600">{t('app.soilData.for')} {farmArea} {t('app.soilData.hectares')} @ {calculateFertilizer('Sulfur', farmArea).perHa}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Organic Matter */}
                  {soilData.data.organicCarbon && soilData.data.organicCarbon < 0.5 && (
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-bold text-lg">Farm Yard Manure (FYM)</h5>
                          <p className="text-sm text-gray-600">Low organic matter content (OC: {soilData.data.organicCarbon}%)</p>
                          <p className="text-xs text-gray-500 mt-1">{t('app.soilData.standardRate')}: 5-10 tons/ha</p>
                        </div>
                        <button
                          onClick={() => setSelectedFertilizer(selectedFertilizer === 'FYM' ? null : 'FYM')}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          {selectedFertilizer === 'FYM' ? t('app.soilData.hide') : t('app.soilData.calculate')}
                        </button>
                      </div>
                      {selectedFertilizer === 'FYM' && farmArea && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-600">{t('app.soilData.totalQuantity')}:</p>
                              <p className="text-xl font-bold text-green-700">{calculateFertilizer('FYM', farmArea).quantity} {calculateFertilizer('FYM', farmArea).unit}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">{t('app.soilData.estimatedCost')}:</p>
                              <p className="text-xl font-bold text-green-700">₹{calculateFertilizer('FYM', farmArea).cost}</p>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-green-200">
                            <p className="text-xs text-gray-600">{t('app.soilData.for')} {farmArea} {t('app.soilData.hectares')} @ {calculateFertilizer('FYM', farmArea).perHa}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Message if all nutrients are adequate */}
                  {soilData.data.nitrogen >= 40 && soilData.data.phosphorus >= 30 && soilData.data.potassium >= 40 && soilData.data.pH >= 6.0 && soilData.data.pH <= 7.5 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">✅ {t('app.soilData.adequateNutrients')}</p>
                    </div>
                  )}
                </div>
              )}
              
              {(!farmArea || parseFloat(farmArea) <= 0) && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">💡 {t('app.soilData.enterArea')}.</p>
                </div>
              )}
              
              <button
                onClick={() => setShowFertilizerCalc(false)}
                className="w-full mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                {t('app.soilData.close')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
