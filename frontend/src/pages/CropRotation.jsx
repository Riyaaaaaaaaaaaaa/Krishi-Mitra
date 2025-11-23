import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { translateCropName } from '../utils/cropTranslation';
import AreaConverter from '../components/AreaConverter';

export default function CropRotation() {
  const { t, i18n } = useTranslation();
  const [rotations, setRotations] = useState([]);
  const [selectedRotation, setSelectedRotation] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddCropForm, setShowAddCropForm] = useState(false);
  const [showAreaConverter, setShowAreaConverter] = useState(false);
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });
  const [editingField, setEditingField] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [expandedAction, setExpandedAction] = useState(null);
  const [expandedRecommendation, setExpandedRecommendation] = useState(null);
  const [showSoilHealthEdit, setShowSoilHealthEdit] = useState(false);
  const [editingSoilHealth, setEditingSoilHealth] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    pH: '',
    organicMatter: ''
  });
  const [userLocation, setUserLocation] = useState(null);

  const [newField, setNewField] = useState({
    fieldId: '',
    fieldName: '',
    area: ''
  });

  const [newCrop, setNewCrop] = useState({
    cropName: '',
    cropFamily: 'Cereal',
    season: 'Kharif',
    year: new Date().getFullYear(),
    plantedDate: '',
    harvestDate: '',
    yield: '',
    yieldUnit: 't/ha',
    soilHealthBefore: { nitrogen: '', phosphorus: '', potassium: '', pH: '', organicMatter: '' },
    soilHealthAfter: { nitrogen: '', phosphorus: '', potassium: '', pH: '', organicMatter: '' },
    notes: ''
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

  // Common field names in English, Hindi, and Hinglish
  const fieldNameOptions = [
    { en: 'North Field', hi: 'उत्तरी खेत', hinglish: 'Uttari Khet' },
    { en: 'South Field', hi: 'दक्षिणी खेत', hinglish: 'Dakshini Khet' },
    { en: 'East Field', hi: 'पूर्वी खेत', hinglish: 'Purvi Khet' },
    { en: 'West Field', hi: 'पश्चिमी खेत', hinglish: 'Pashchimi Khet' },
    { en: 'Main Field', hi: 'मुख्य खेत', hinglish: 'Mukhya Khet' },
    { en: 'Front Field', hi: 'सामने वाला खेत', hinglish: 'Samne Wala Khet' },
    { en: 'Back Field', hi: 'पीछे वाला खेत', hinglish: 'Piche Wala Khet' },
    { en: 'Upper Field', hi: 'ऊपरी खेत', hinglish: 'Upri Khet' },
    { en: 'Lower Field', hi: 'निचला खेत', hinglish: 'Nichla Khet' },
    { en: 'River Side Field', hi: 'नदी के पास वाला खेत', hinglish: 'Nadi Ke Paas Wala Khet' },
    { en: 'Hill Field', hi: 'पहाड़ी खेत', hinglish: 'Pahari Khet' },
    { en: 'Plot 1', hi: 'प्लॉट 1', hinglish: 'Plot 1' },
    { en: 'Plot 2', hi: 'प्लॉट 2', hinglish: 'Plot 2' },
    { en: 'Plot 3', hi: 'प्लॉट 3', hinglish: 'Plot 3' },
    { en: 'Farm A', hi: 'फार्म A', hinglish: 'Farm A' },
    { en: 'Farm B', hi: 'फार्म B', hinglish: 'Farm B' },
    { en: 'Custom', hi: 'अन्य', hinglish: 'Custom' }
  ];

  const getFieldNameDisplay = (option) => {
    if (i18n.language === 'hi') return option.hi;
    return `${option.en} (${option.hinglish})`;
  };

  // Show custom alert modal
  const showAlert = (message, type = 'success') => {
    setAlertModal({ show: true, message, type });
  };

  // Translate field name to current language
  const getTranslatedFieldName = (fieldName) => {
    const option = fieldNameOptions.find(opt => opt.en === fieldName);
    if (option) {
      return i18n.language === 'hi' ? option.hi : fieldName;
    }
    return fieldName;
  };

  // Get yield benchmark comparison
  const getYieldComparison = (cropName, yieldValue, yieldUnit) => {
    if (!yieldValue || yieldUnit !== 't/ha') return null;
    
    // Average yields in t/ha for Indian context
    const benchmarks = {
      'Rice': { avg: 2.8, good: 3.5 },
      'Wheat': { avg: 3.2, good: 4.0 },
      'Cotton': { avg: 1.8, good: 2.5 },
      'Maize': { avg: 2.5, good: 3.2 },
      'Sugarcane': { avg: 70, good: 85 },
      'Chickpea': { avg: 1.0, good: 1.5 },
      'Soybean': { avg: 1.2, good: 1.8 },
      'Groundnut': { avg: 1.5, good: 2.0 },
      'Mustard': { avg: 1.2, good: 1.6 },
      'Potato': { avg: 23, good: 28 }
    };
    
    const benchmark = benchmarks[cropName];
    if (!benchmark) return null;
    
    const percentage = ((yieldValue / benchmark.avg) * 100).toFixed(0);
    const isAboveAvg = yieldValue >= benchmark.avg;
    const isGood = yieldValue >= benchmark.good;
    
    return {
      avg: benchmark.avg,
      good: benchmark.good,
      percentage,
      status: isGood ? 'excellent' : isAboveAvg ? 'good' : 'below',
      message: i18n.language === 'hi'
        ? isGood 
          ? `🎉 उत्कृष्ट! औसत से ${percentage}%`
          : isAboveAvg
          ? `✅ अच्छा - औसत से ${percentage}%`
          : `⚠️ औसत से कम (${benchmark.avg} t/ha)`
        : isGood
        ? `🎉 Excellent! ${percentage}% of avg`
          : isAboveAvg
          ? `✅ Good - ${percentage}% of avg`
          : `⚠️ Below avg (${benchmark.avg} t/ha)`
    };
  };

  // Get color-coded NPK levels
  const getNPKColor = (value, nutrient) => {
    const thresholds = {
      nitrogen: { low: 30, optimal: 50 },
      phosphorus: { low: 20, optimal: 40 },
      potassium: { low: 25, optimal: 45 }
    };
    
    const t = thresholds[nutrient];
    if (!t || !value) return 'bg-gray-100 text-gray-600';
    
    if (value < t.low) return 'bg-red-100 text-red-800';
    if (value >= t.optimal) return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  // Get NPK status with ranges
  const getNPKStatus = (value, nutrient) => {
    const thresholds = {
      nitrogen: { low: 30, optimal: 50, range: '30-60' },
      phosphorus: { low: 20, optimal: 40, range: '20-50' },
      potassium: { low: 25, optimal: 45, range: '25-55' }
    };
    
    const t = thresholds[nutrient];
    if (!t || !value) return { label: i18n.language === 'hi' ? 'अज्ञात' : 'Unknown', range: '' };
    
    if (value < t.low) return { 
      label: i18n.language === 'hi' ? 'कम' : 'Low',
      range: i18n.language === 'hi' ? `(${t.range} अच्छा)` : `(${t.range} optimal)`
    };
    if (value >= t.optimal) return { 
      label: i18n.language === 'hi' ? 'अच्छा' : 'Optimal',
      range: i18n.language === 'hi' ? `(${t.range} सीमा)` : `(${t.range} range)`
    };
    return { 
      label: i18n.language === 'hi' ? 'मध्यम' : 'Moderate',
      range: i18n.language === 'hi' ? `(${t.range} अच्छा)` : `(${t.range} optimal)`
    };
  };

  // Get pH color and status
  const getPHColor = (pH) => {
    if (!pH) return 'bg-gray-100 text-gray-600';
    if (pH < 5.5 || pH > 8.0) return 'bg-red-100 text-red-800';
    if (pH >= 6.0 && pH <= 7.5) return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getPHStatus = (pH) => {
    if (!pH) return { label: i18n.language === 'hi' ? 'अज्ञात' : 'Unknown', range: '' };
    if (pH < 5.5) return { 
      label: i18n.language === 'hi' ? 'अम्लीय' : 'Acidic',
      range: i18n.language === 'hi' ? '(6.0-7.5 अच्छा)' : '(6.0-7.5 optimal)'
    };
    if (pH > 8.0) return { 
      label: i18n.language === 'hi' ? 'क्षारीय' : 'Alkaline',
      range: i18n.language === 'hi' ? '(6.0-7.5 अच्छा)' : '(6.0-7.5 optimal)'
    };
    if (pH >= 6.0 && pH <= 7.5) return { 
      label: i18n.language === 'hi' ? 'अच्छा' : 'Optimal',
      range: i18n.language === 'hi' ? '(6.0-7.5 सीमा)' : '(6.0-7.5 range)'
    };
    return { 
      label: i18n.language === 'hi' ? 'मध्यम' : 'Moderate',
      range: i18n.language === 'hi' ? '(6.0-7.5 अच्छा)' : '(6.0-7.5 optimal)'
    };
  };

  // Get intelligent crop suggestions with suitability scores
  const getCropSuggestions = (rotation) => {
    if (!rotation || rotation.rotationHistory.length === 0) {
      return {
        suggested: [
          { name: 'Rice', score: 90, yield: '2.8-3.5', price: '₹2000-2500/q', water: i18n.language === 'hi' ? 'उच्च' : 'High', days: '120-150' },
          { name: 'Wheat', score: 85, yield: '3.2-4.0', price: '₹2100-2400/q', water: i18n.language === 'hi' ? 'मध्यम' : 'Medium', days: '110-130' },
          { name: 'Cotton', score: 80, yield: '1.8-2.5', price: '₹5500-6500/q', water: i18n.language === 'hi' ? 'मध्यम' : 'Medium', days: '150-180' },
          { name: 'Maize', score: 88, yield: '2.5-3.2', price: '₹1800-2200/q', water: i18n.language === 'hi' ? 'मध्यम' : 'Medium', days: '90-110' }
        ],
        reason: i18n.language === 'hi' 
          ? 'शुरुआती फसलें - आप किसी भी मुख्य फसल से शुरू कर सकते हैं'
          : 'Starter crops - you can begin with any major crop'
      };
    }

    const lastCrop = rotation.rotationHistory[rotation.rotationHistory.length - 1];
    const lastFamily = lastCrop.cropFamily;
    const currentSoil = rotation.currentSoilHealth;

    let suggested = [];
    let reason = '';

    // Nitrogen-fixing crops after nitrogen-depleting crops
    if (['Cereal', 'Oilseed'].includes(lastFamily) || currentSoil.nitrogen < 35) {
      suggested = [
        { name: 'Chickpea', score: 95, yield: '1.0-1.5', price: '₹5000-6000/q', water: i18n.language === 'hi' ? 'कम' : 'Low', days: '100-120' },
        { name: 'Pigeon Pea', score: 92, yield: '0.8-1.2', price: '₹5500-7000/q', water: i18n.language === 'hi' ? 'कम' : 'Low', days: '150-180' },
        { name: 'Lentil', score: 90, yield: '0.7-1.0', price: '₹6000-7500/q', water: i18n.language === 'hi' ? 'कम' : 'Low', days: '110-130' },
        { name: 'Green Gram', score: 88, yield: '0.6-0.9', price: '₹6500-8000/q', water: i18n.language === 'hi' ? 'मध्यम' : 'Medium', days: '60-90' },
        { name: 'Soybean', score: 85, yield: '1.2-1.8', price: '₹3800-4500/q', water: i18n.language === 'hi' ? 'मध्यम' : 'Medium', days: '90-120' },
        { name: 'Groundnut', score: 87, yield: '1.5-2.0', price: '₹5000-6000/q', water: i18n.language === 'hi' ? 'मध्यम' : 'Medium', days: '120-140' }
      ];
      reason = i18n.language === 'hi'
        ? `${translateCropName(lastCrop.cropName)} के बाद नाइट्रोजन स्तर कम है। दलहन फसलें मिट्टी में नाइट्रोजन बढ़ाएंगी।`
        : `Nitrogen depleted after ${lastCrop.cropName}. Legumes will restore soil nitrogen.`;
    }
    // Cereals after legumes
    else if (lastFamily === 'Legume') {
      suggested = [
        { name: 'Rice', score: 95, yield: '2.8-3.5', price: '₹2000-2500/q', water: i18n.language === 'hi' ? 'उच्च' : 'High', days: '120-150' },
        { name: 'Wheat', score: 93, yield: '3.2-4.0', price: '₹2100-2400/q', water: i18n.language === 'hi' ? 'मध्यम' : 'Medium', days: '110-130' },
        { name: 'Maize', score: 90, yield: '2.5-3.2', price: '₹1800-2200/q', water: i18n.language === 'hi' ? 'मध्यम' : 'Medium', days: '90-110' },
        { name: 'Sugarcane', score: 85, yield: '70-85', price: '₹280-350/q', water: i18n.language === 'hi' ? 'उच्च' : 'High', days: '300-365' }
      ];
      reason = i18n.language === 'hi'
        ? 'दलहन के बाद अनाज की फसल लगाएं - मिट्टी में नाइट्रोजन भरपूर है'
        : 'Plant cereals after legumes - soil nitrogen is enriched';
    }
    // Avoid same family
    else {
      suggested = [
        { name: 'Rice', score: 80, yield: '2.8-3.5', price: '₹2000-2500/q', water: i18n.language === 'hi' ? 'उच्च' : 'High', days: '120-150' },
        { name: 'Wheat', score: 82, yield: '3.2-4.0', price: '₹2100-2400/q', water: i18n.language === 'hi' ? 'मध्यम' : 'Medium', days: '110-130' },
        { name: 'Chickpea', score: 85, yield: '1.0-1.5', price: '₹5000-6000/q', water: i18n.language === 'hi' ? 'कम' : 'Low', days: '100-120' },
        { name: 'Mustard', score: 78, yield: '1.2-1.6', price: '₹4500-5500/q', water: i18n.language === 'hi' ? 'कम' : 'Low', days: '90-110' }
      ];
      reason = i18n.language === 'hi'
        ? `${lastFamily} के बाद अलग परिवार की फसल लगाएं`
        : `Rotate to different family after ${lastFamily}`;
    }

    // Season-specific filtering
    const currentMonth = new Date().getMonth() + 1;
    if (currentMonth >= 6 && currentMonth <= 9) {
      const kharifCrops = ['Rice', 'Cotton', 'Maize', 'Soybean', 'Groundnut'];
      suggested = suggested.filter(c => kharifCrops.includes(c.name));
      if (suggested.length === 0) {
        suggested = [
          { name: 'Rice', score: 90, yield: '2.8-3.5', price: '₹2000-2500/q', water: i18n.language === 'hi' ? 'उच्च' : 'High', days: '120-150' },
          { name: 'Cotton', score: 85, yield: '1.8-2.5', price: '₹5500-6500/q', water: i18n.language === 'hi' ? 'मध्यम' : 'Medium', days: '150-180' }
        ];
      }
      reason += i18n.language === 'hi' ? ' (खरीफ मौसम)' : ' (Kharif season)';
    } else if (currentMonth >= 10 || currentMonth <= 3) {
      const rabiCrops = ['Wheat', 'Chickpea', 'Lentil', 'Mustard'];
      suggested = suggested.filter(c => rabiCrops.includes(c.name));
      if (suggested.length === 0) {
        suggested = [
          { name: 'Wheat', score: 90, yield: '3.2-4.0', price: '₹2100-2400/q', water: i18n.language === 'hi' ? 'मध्यम' : 'Medium', days: '110-130' },
          { name: 'Chickpea', score: 88, yield: '1.0-1.5', price: '₹5000-6000/q', water: i18n.language === 'hi' ? 'कम' : 'Low', days: '100-120' }
        ];
      }
      reason += i18n.language === 'hi' ? ' (रबी मौसम)' : ' (Rabi season)';
    }

    return { suggested: suggested.slice(0, 6), reason };
  };

  // Get actionable soil recommendations with priority and detailed guides
  const getActionableRecommendations = (rotation) => {
    if (!rotation) return [];
    
    const recs = [];
    const soil = rotation.currentSoilHealth;
    const history = rotation.rotationHistory;
    const families = [...new Set(history.map(c => c.cropFamily))];

    // Priority 1: Monoculture warning (Critical)
    if (families.length === 1 && history.length >= 2) {
      recs.push({
        priority: 'high',
        priorityNum: 1,
        icon: '⚠️',
        title: i18n.language === 'hi' ? 'फसल विविधता जरूरी' : 'Crop Diversification Required',
        action: i18n.language === 'hi'
          ? 'एक ही परिवार की फसल लगातार उगाने से बचें। दलहन या अन्य परिवार की फसलें लगाएं।'
          : 'Avoid continuous cultivation of the same crop family. Rotate with legumes or other families.',
        guide: i18n.language === 'hi' ? {
          title: 'फसल विविधता गाइड',
          steps: [
            '🔄 फसल चक्र क्यों जरूरी है: एक ही फसल परिवार लगातार उगाने से मिट्टी में कीट-रोग बढ़ते हैं और पोषक तत्व कम होते हैं।',
            '✅ अनाज के बाद दलहन: गेहूं/चावल के बाद चना, मसूर, मूंग जैसी दलहन लगाएं। दलहन मिट्टी में नाइट्रोजन बढ़ाती हैं।',
            '📅 2-3 साल का अंतराल: एक ही फसल परिवार को दोबारा उसी खेत में 2-3 साल बाद ही लगाएं।',
            '🌾 उदाहरण चक्र: धान (खरीफ) → गेहूं (रबी) → चना/मूंग (खरीफ) → सरसों (रबी)',
            '💰 लाभ: उत्पादन 15-25% बढ़ता है, रासायनिक खाद की जरूरत कम होती है।'
          ]
        } : {
          title: 'Crop Diversification Guide',
          steps: [
            '🔄 Why crop rotation matters: Continuous monoculture increases pests, diseases and depletes specific nutrients.',
            '✅ Cereals → Legumes: After wheat/rice, plant chickpea, lentil, mung bean. Legumes restore soil nitrogen naturally.',
            '📅 2-3 year interval: Wait 2-3 years before replanting the same crop family in the same field.',
            '🌾 Example rotation: Rice (Kharif) → Wheat (Rabi) → Chickpea/Mung (Kharif) → Mustard (Rabi)',
            '💰 Benefits: 15-25% yield increase, reduced chemical fertilizer needs.'
          ]
        }
      });
    }

    // Priority 2: Nitrogen deficiency
    if (soil.nitrogen < 30) {
      const priorityNum = recs.length + 1;
      recs.push({        icon: '🌱',
        priority: 'high',
        priorityNum,
        title: i18n.language === 'hi' ? 'नाइट्रोजन की कमी' : 'Low Nitrogen',
        action: i18n.language === 'hi'
          ? `${Math.ceil((40 - soil.nitrogen) * rotation.area * 4)} किग्रा वर्मी कम्पोस्ट प्रति हेक्टेयर डालें या दलहन फसल उगाएं`
          : `Add ${Math.ceil((40 - soil.nitrogen) * rotation.area * 4)}kg vermicompost per hectare or plant legumes`,
        guide: i18n.language === 'hi' ? {
          title: 'नाइट्रोजन बढ़ाने की विधि',
          steps: [
            '🍂 जैविक खाद: 3-5 टन गोबर खाद या 1-2 टन वर्मी कम्पोस्ट प्रति हेक्टेयर डालें।',
            '🌿 हरी खाद: ढैंचा या सनई उगाकर फूल आने पर मिट्टी में मिला दें।',
            '✨ दलहन फसल: अगली फसल चना, मूंग, उड़द जैसी दलहन लगाएं - यह मिट्टी में नाइट्रोजन बढ़ाती हैं।',
            '⚗️ यूरिया (अंतिम विकल्प): 50-75 किग्रा यूरिया प्रति हेक्टेयर, 2-3 बार में विभाजित करके दें।',
            '📊 परीक्षण: हर 6 महीने में मिट्टी जांच करवाएं।'
          ]
        } : {
          title: 'Nitrogen Enhancement Methods',
          steps: [
            '🍂 Organic manure: Apply 3-5 tons farmyard manure or 1-2 tons vermicompost per hectare.',
            '🌿 Green manure: Grow dhaincha or sunn hemp, incorporate into soil at flowering.',
            '✨ Legume crops: Plant chickpea, mung bean, or black gram next - they fix atmospheric nitrogen.',
            '⚗️ Urea (last resort): 50-75kg urea per hectare, split into 2-3 applications.',
            '📊 Testing: Test soil every 6 months to monitor levels.'
          ]
        }
      });
    }

    // Priority 3: Soil fertility declining
    if (history.length >= 2 && soil.organicMatter < 2.0) {
      const priorityNum = recs.length + 1;
      recs.push({
        icon: '🍂',
        priority: 'medium',
        priorityNum,
        title: i18n.language === 'hi' ? 'मिट्टी की उर्वरता घट रही है' : 'Soil Fertility Declining',
        action: i18n.language === 'hi'
          ? 'हरी खाद, जैविक कम्पोस्ट या कवर क्रॉप लगाने पर विचार करें।'
          : 'Consider green manure, organic compost, or cover crops.',
        guide: i18n.language === 'hi' ? {
          title: 'मिट्टी सुधार विस्तृत गाइड',
          steps: [
            '🌱 हरी खाद क्या है: तेजी से बढ़ने वाली फसल (ढैंचा, सनई) उगाकर फूल आने पर जोतकर मिट्टी में मिला देना।',
            '⏰ कब करें: फसल कटाई के बाद और अगली बुवाई से 40-50 दिन पहले।',
            '🌿 कवर क्रॉप: बरसीम, लोबिया जैसी फसलें उगाएं जो मिट्टी को ढकें और खरपतवार रोकें।',
            '♻️ कम्पोस्ट तैयारी: फसल अवशेष, गोबर, हरी पत्तियां मिलाकर 2-3 महीने में तैयार करें।',
            '📈 लाभ: जैविक पदार्थ 0.5-1% बढ़ता है, पानी रोकने की क्षमता बढ़ती है।',
            '💡 टिप: सीजन के बीच खाली जमीन न छोड़ें, हमेशा कुछ न कुछ उगाएं।'
          ]
        } : {
          title: 'Soil Improvement Detailed Guide',
          steps: [
            '🌱 What is green manure: Fast-growing crops (dhaincha, sunn hemp) ploughed into soil at flowering stage.',
            '⏰ When to apply: After harvest and 40-50 days before next planting.',
            '🌿 Cover crops: Grow berseem, cowpea to cover soil and suppress weeds.',
            '♻️ Composting: Mix crop residue, manure, green leaves - ready in 2-3 months.',
            '📈 Benefits: Organic matter increases 0.5-1%, improves water retention.',
            '💡 Tip: Never leave land bare - always grow something between seasons.'
          ]
        }
      });
    }

    // Phosphorus recommendations
    if (soil.phosphorus < 20) {
      const priorityNum = recs.length + 1;
      recs.push({
        icon: '💪',
        priority: 'medium',
        priorityNum,
        title: i18n.language === 'hi' ? 'फास्फोरस की कमी' : 'Low Phosphorus',
        action: i18n.language === 'hi'
          ? 'रॉक फॉस्फेट या बोन मील 15-20 किग्रा प्रति हेक्टेयर डालें'
          : 'Apply rock phosphate or bone meal 15-20kg per hectare',
        guide: i18n.language === 'hi' ? {
          title: 'फास्फोरस प्रबंधन',
          steps: [
            '🦴 बोन मील: 15-20 किग्रा प्रति हेक्टेयर बुवाई से पहले मिट्टी में मिलाएं।',
            '⛰️ रॉक फॉस्फेट: 200-300 किग्रा प्रति हेक्टेयर, धीरे-धीरे घुलता है।',
            '📅 समय: फास्फोरस जड़ विकास में मदद करता है, इसलिए बुवाई के समय दें।',
            '🌾 DAP खाद (रासायनिक): 100-150 किग्रा प्रति हेक्टेयर।'
          ]
        } : {
          title: 'Phosphorus Management',
          steps: [
            '🦴 Bone meal: 15-20kg per hectare mixed into soil before planting.',
            '⛰️ Rock phosphate: 200-300kg per hectare, slow release.',
            '📅 Timing: Phosphorus aids root development, apply at sowing time.',
            '🌾 DAP fertilizer (chemical): 100-150kg per hectare.'
          ]
        }
      });
    }

    // pH recommendations
    if (soil.pH < 6.0) {
      const priorityNum = recs.length + 1;
      recs.push({
        icon: '🧪',
        priority: 'high',
        priorityNum,
        title: i18n.language === 'hi' ? 'मिट्टी अम्लीय है' : 'Acidic Soil',
        action: i18n.language === 'hi'
          ? `${Math.ceil((6.5 - soil.pH) * rotation.area * 50)} किग्रा चूना प्रति हेक्टेयर डालें`
          : `Apply ${Math.ceil((6.5 - soil.pH) * rotation.area * 50)}kg lime per hectare`,
        guide: i18n.language === 'hi' ? {
          title: 'अम्लीय मिट्टी सुधार',
          steps: [
            '🪨 चूना: कैल्शियम कार्बोनेट (चूना पत्थर पाउडर) फसल कटाई के बाद डालें।',
            '⏰ समय: बरसात से 2-3 महीने पहले ताकि अच्छी तरह मिल जाए।',
            '💧 पानी: चूना डालने के बाद हल्की सिंचाई करें।',
            '📊 जांच: 6 महीने बाद pH दोबारा जांचें।'
          ]
        } : {
          title: 'Acidic Soil Correction',
          steps: [
            '🪨 Lime: Calcium carbonate (limestone powder) applied after harvest.',
            '⏰ Timing: 2-3 months before monsoon for proper mixing.',
            '💧 Water: Light irrigation after lime application.',
            '📊 Testing: Retest pH after 6 months.'
          ]
        }
      });
    } else if (soil.pH > 8.0) {
      const priorityNum = recs.length + 1;
      recs.push({
        icon: '🧪',
        priority: 'high',
        priorityNum,
        title: i18n.language === 'hi' ? 'मिट्टी क्षारीय है' : 'Alkaline Soil',
        action: i18n.language === 'hi'
          ? 'जिप्सम या गंधक 20-25 किग्रा प्रति हेक्टेयर डालें'
          : 'Apply gypsum or sulfur 20-25kg per hectare',
        guide: i18n.language === 'hi' ? {
          title: 'क्षारीय मिट्टी सुधार',
          steps: [
            '⚗️ जिप्सम: 200-300 किग्रा प्रति हेक्टेयर बुवाई से पहले।',
            '🌾 गंधक (Sulfur): 20-25 किग्रा प्रति हेक्टेयर।',
            '🍂 जैविक खाद: गोबर खाद pH कम करने में मदद करता है।',
            '💧 जल निकास: अच्छी जल निकासी व्यवस्था बनाएं।'
          ]
        } : {
          title: 'Alkaline Soil Correction',
          steps: [
            '⚗️ Gypsum: 200-300kg per hectare before sowing.',
            '🌾 Sulfur: 20-25kg per hectare.',
            '🍂 Organic manure: Farmyard manure helps reduce pH.',
            '💧 Drainage: Ensure good drainage system.'
          ]
        }
      });
    }

    return recs;
  };

  useEffect(() => {
    fetchRotations();
    getUserLocation();
  }, []);

  // Get user's location for soil data
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied or unavailable');
        }
      );
    }
  };

  // Fetch soil data from location and populate defaults
  const fetchSoilDataFromLocation = async () => {
    if (!userLocation) {
      showAlert(
        i18n.language === 'hi' 
          ? 'स्थान डेटा उपलब्ध नहीं है। मैन्युअल रूप से दर्ज करें।'
          : 'Location data not available. Enter manually.',
        'error'
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/soil-data/comprehensive?lat=${userLocation.latitude}&lon=${userLocation.longitude}`
      );
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const soilData = data.data;
        setEditingSoilHealth({
          nitrogen: soilData.nitrogen || 40,
          phosphorus: soilData.phosphorus || 30,
          potassium: soilData.potassium || 30,
          pH: soilData.ph || 6.5,
          organicMatter: soilData.organic_carbon ? (soilData.organic_carbon * 1.724).toFixed(1) : 2.0
        });
        showAlert(
          i18n.language === 'hi'
            ? 'स्थान से मिट्टी डेटा लोड किया गया!'
            : 'Soil data loaded from location!',
          'success'
        );
      } else {
        // Use default values if no data found
        setEditingSoilHealth({
          nitrogen: 40,
          phosphorus: 30,
          potassium: 30,
          pH: 6.5,
          organicMatter: 2.0
        });
        showAlert(
          i18n.language === 'hi'
            ? 'स्थान से डेटा प्राप्त नहीं हुआ। डिफ़ॉल्ट मान लोड किए गए।'
            : 'Could not fetch data from location. Default values loaded.',
          'error'
        );
      }
    } catch (error) {
      console.error('Error fetching soil data:', error);
      // Load default values on error
      setEditingSoilHealth({
        nitrogen: 40,
        phosphorus: 30,
        potassium: 30,
        pH: 6.5,
        organicMatter: 2.0
      });
      showAlert(
        i18n.language === 'hi'
          ? 'मिट्टी डेटा लोड करने में त्रुटि। डिफ़ॉल्ट मान लोड किए गए।'
          : 'Error loading soil data. Default values loaded.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Update soil health
  const updateSoilHealth = async () => {
    if (!selectedRotation) return;

    if (!editingSoilHealth.nitrogen || !editingSoilHealth.phosphorus || 
        !editingSoilHealth.potassium || !editingSoilHealth.pH) {
      showAlert(
        i18n.language === 'hi'
          ? 'कृपया सभी आवश्यक फ़ील्ड भरें'
          : 'Please fill all required fields',
        'error'
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/crop-rotation/${selectedRotation._id}/soil-health`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nitrogen: parseFloat(editingSoilHealth.nitrogen),
            phosphorus: parseFloat(editingSoilHealth.phosphorus),
            potassium: parseFloat(editingSoilHealth.potassium),
            pH: parseFloat(editingSoilHealth.pH),
            organicMatter: parseFloat(editingSoilHealth.organicMatter)
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setRotations(rotations.map(r => r._id === data.rotation._id ? data.rotation : r));
        setSelectedRotation(data.rotation);
        setShowSoilHealthEdit(false);
        showAlert(
          i18n.language === 'hi'
            ? 'मिट्टी स्वास्थ्य सफलतापूर्वक अपडेट किया गया!'
            : 'Soil health updated successfully!',
          'success'
        );
      } else {
        throw new Error(data.error || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating soil health:', error);
      showAlert(
        i18n.language === 'hi'
          ? 'मिट्टी स्वास्थ्य अपडेट करने में त्रुटि: ' + error.message
          : 'Error updating soil health: ' + error.message,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchRotations = async () => {
    setLoading(true);
    try {
      // Remove login requirement - use a default userId for testing
      const userId = 'test-user-id';

      const response = await fetch(`${API_BASE_URL}/api/crop-rotation/${userId}`);
      const data = await response.json();

      if (data.success) {
        setRotations(data.rotations);
      }
    } catch (error) {
      console.error('Error fetching rotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRotation = async () => {
    if (!newField.fieldName || !newField.area) {
      showAlert(
        i18n.language === 'hi' ? 'कृपया सभी आवश्यक फ़ील्ड भरें' : 'Please fill all required fields',
        'error'
      );
      return;
    }

    // Auto-generate Field ID if not provided
    const fieldId = newField.fieldId || `F${Date.now().toString().slice(-6)}`;

    setLoading(true);
    try {
      // Remove login requirement - use a default userId for testing
      const userId = 'test-user-id';
      const response = await fetch(`${API_BASE_URL}/api/crop-rotation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          fieldId: fieldId,
          fieldName: newField.fieldName,
          area: parseFloat(newField.area)
        })
      });

      const data = await response.json();

      if (data.success) {
        setRotations([data.rotation, ...rotations]);
        setShowCreateForm(false);
        setNewField({ fieldId: '', fieldName: '', area: '' });
        showAlert(
          i18n.language === 'hi' ? 'खेत सफलतापूर्वक बनाया गया!' : 'Field created successfully!',
          'success'
        );
      }
    } catch (error) {
      console.error('Error creating rotation:', error);
      showAlert(
        i18n.language === 'hi' ? 'खेत बनाने में त्रुटि' : 'Error creating field',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const addCropToRotation = async () => {
    if (!selectedRotation || !newCrop.cropName || !newCrop.plantedDate) {
      showAlert(
        i18n.language === 'hi' ? 'कृपया आवश्यक फ़ील्ड भरें' : 'Please fill required fields',
        'error'
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/crop-rotation/${selectedRotation._id}/add-crop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCrop,
          yield: parseFloat(newCrop.yield) || null,
          soilHealthBefore: Object.keys(newCrop.soilHealthBefore).some(k => newCrop.soilHealthBefore[k])
            ? Object.fromEntries(Object.entries(newCrop.soilHealthBefore).map(([k, v]) => [k, parseFloat(v) || null]))
            : null,
          soilHealthAfter: Object.keys(newCrop.soilHealthAfter).some(k => newCrop.soilHealthAfter[k])
            ? Object.fromEntries(Object.entries(newCrop.soilHealthAfter).map(([k, v]) => [k, parseFloat(v) || null]))
            : null
        })
      });

      const data = await response.json();

      if (data.success) {
        setRotations(rotations.map(r => r._id === data.rotation._id ? data.rotation : r));
        setSelectedRotation(data.rotation);
        setShowAddCropForm(false);
        setNewCrop({
          cropName: '',
          cropFamily: 'Cereal',
          season: 'Kharif',
          year: new Date().getFullYear(),
          plantedDate: '',
          harvestDate: '',
          yield: '',
          yieldUnit: 't/ha',
          soilHealthBefore: { nitrogen: '', phosphorus: '', potassium: '', pH: '', organicMatter: '' },
          soilHealthAfter: { nitrogen: '', phosphorus: '', potassium: '', pH: '', organicMatter: '' },
          notes: ''
        });
        showAlert(
          i18n.language === 'hi' ? 'फसल चक्र में जोड़ी गई!' : 'Crop added to rotation!',
          'success'
        );
        
        // Automatically refresh analysis after adding crop
        fetchAnalysis(data.rotation._id);
      }
    } catch (error) {
      console.error('Error adding crop:', error);
      showAlert(
        i18n.language === 'hi' ? 'फसल जोड़ने में त्रुटि' : 'Error adding crop',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysis = async (rotationId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/crop-rotation/${rotationId}/analysis`);
      const data = await response.json();

      if (data.success) {
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced rotation pattern analysis with severity
  const getRotationPatternAnalysis = (rotation) => {
    if (!rotation || rotation.rotationHistory.length < 2) {
      return {
        pattern: i18n.language === 'hi' ? 'अपर्याप्त डेटा' : 'Insufficient Data',
        severity: 'info',
        message: i18n.language === 'hi' 
          ? 'विश्लेषण के लिए 2+ फसलें जोड़ें'
          : 'Add 2+ crops for analysis',
        interval: '',
        color: 'text-gray-600 bg-gray-50'
      };
    }

    const history = rotation.rotationHistory;
    const families = history.map(c => c.cropFamily);
    const uniqueFamilies = [...new Set(families)];
    
    // Check for monoculture patterns
    if (uniqueFamilies.length === 1) {
      const years = [...new Set(history.map(c => c.year))].length;
      const consecutiveSame = history.length;
      
      if (years >= 3 || consecutiveSame >= 4) {
        return {
          pattern: i18n.language === 'hi' ? 'एकल खेती (गंभीर)' : 'Monoculture (Critical)',
          severity: 'critical',
          message: i18n.language === 'hi'
            ? `${consecutiveSame} बार लगातार ${families[0]} - मिट्टी की गुणवत्ता में गंभीर गिरावट`
            : `${consecutiveSame} consecutive ${families[0]} crops - severe soil degradation risk`,
          interval: i18n.language === 'hi'
            ? `${families[0]} फसलों को 2-3 साल बाद ही दोबारा लगाएं`
            : `Replant ${families[0]} crops after 2-3 years interval`,
          color: 'text-red-700 bg-red-100 border-red-300'
        };
      } else {
        return {
          pattern: i18n.language === 'hi' ? 'एकल खेती (सावधानी)' : 'Monoculture (Caution)',
          severity: 'warning',
          message: i18n.language === 'hi'
            ? `${consecutiveSame} बार ${families[0]} - जल्दी फसल बदलें`
            : `${consecutiveSame} ${families[0]} seasons - diversify soon`,
          interval: i18n.language === 'hi'
            ? 'अगली सीजन में फसल परिवार बदलें (अनाज↔दलहन)'
            : 'Rotate family next season (Cereal↔Legume)',
          color: 'text-orange-700 bg-orange-100 border-orange-300'
        };
      }
    }
    
    // Check for legume-cereal rotation
    if (families.includes('Legume') && families.includes('Cereal')) {
      return {
        pattern: i18n.language === 'hi' ? 'दलहन-अनाज चक्र (अच्छा)' : 'Legume-Cereal Rotation (Good)',
        severity: 'good',
        message: i18n.language === 'hi'
          ? 'नाइट्रोजन संतुलन बना हुआ है'
          : 'Nitrogen balance maintained',
        interval: i18n.language === 'hi'
          ? 'हर 1-2 सीजन में फसल परिवार बदलते रहें'
          : 'Continue alternating every 1-2 seasons',
        color: 'text-blue-700 bg-blue-100 border-blue-300'
      };
    }
    
    // Multi-crop rotation
    if (uniqueFamilies.length >= 3) {
      return {
        pattern: i18n.language === 'hi' ? 'बहु-फसल चक्र (उत्कृष्ट)' : 'Multi-crop Rotation (Excellent)',
        severity: 'excellent',
        message: i18n.language === 'hi'
          ? `${uniqueFamilies.length} फसल परिवार - मिट्टी स्वास्थ्य इष्टतम`
          : `${uniqueFamilies.length} crop families - optimal soil health`,
        interval: i18n.language === 'hi'
          ? 'विविधता बनाए रखें'
          : 'Maintain diversity',
        color: 'text-green-700 bg-green-100 border-green-300'
      };
    }
    
    // Two-crop rotation
    return {
      pattern: i18n.language === 'hi' ? 'दो-फसल चक्र (ठीक)' : 'Two-crop Rotation (Fair)',
      severity: 'fair',
      message: i18n.language === 'hi'
        ? 'तीसरी फसल परिवार जोड़ने पर विचार करें'
        : 'Consider adding a third crop family',
      interval: i18n.language === 'hi'
        ? 'हर 2 सीजन में फसल बदलें'
        : 'Rotate every 2 seasons',
      color: 'text-yellow-700 bg-yellow-100 border-yellow-300'
    };
  };

  // Compatibility function for field list display
  const getPatternColor = (pattern) => {
    if (!pattern) return 'text-gray-600 bg-gray-50';
    if (pattern.includes('Excellent')) return 'text-green-600 bg-green-50';
    if (pattern.includes('Good')) return 'text-blue-600 bg-blue-50';
    if (pattern.includes('Fair')) return 'text-yellow-600 bg-yellow-50';
    if (pattern.includes('Not Recommended') || pattern.includes('Monoculture')) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  // Soil fertility trend with metrics
  const getSoilTrendAnalysis = (rotation) => {
    if (!rotation || rotation.rotationHistory.length < 2) {
      return {
        trend: i18n.language === 'hi' ? 'अज्ञात' : 'Unknown',
        metrics: i18n.language === 'hi' ? '2+ फसलें जोड़ें' : 'Add 2+ crops',
        sparkline: [],
        color: 'text-gray-600 bg-gray-50'
      };
    }

    const recentCrops = rotation.rotationHistory.slice(-3);
    const nitrogenData = recentCrops
      .filter(crop => crop.soilHealthBefore && crop.soilHealthAfter)
      .map(crop => ({
        before: crop.soilHealthBefore.nitrogen,
        after: crop.soilHealthAfter.nitrogen,
        change: crop.soilHealthAfter.nitrogen - crop.soilHealthBefore.nitrogen
      }));

    if (nitrogenData.length === 0) {
      return {
        trend: i18n.language === 'hi' ? 'अज्ञात' : 'Unknown',
        metrics: i18n.language === 'hi' 
          ? 'फसल जोड़ते समय "मिट्टी स्वास्थ्य पहले/बाद" डेटा जोड़ें' 
          : 'Add "Soil Health Before/After" data when adding crops',
        sparkline: [],
        color: 'text-gray-600 bg-gray-50'
      };
    }

    const avgChange = nitrogenData.reduce((sum, d) => sum + d.change, 0) / nitrogenData.length;
    const baselineN = nitrogenData[0].before;
    const currentN = rotation.currentSoilHealth.nitrogen;
    const percentChange = ((currentN - baselineN) / baselineN * 100).toFixed(0);
    
    // Generate sparkline data points
    const sparkline = nitrogenData.map(d => d.after);

    if (avgChange > 5) {
      return {
        trend: i18n.language === 'hi' ? 'सुधर रहा है' : 'Improving',
        metrics: i18n.language === 'hi'
          ? `NPK स्तर बेसलाइन से ${Math.abs(percentChange)}% ऊपर`
          : `NPK levels up ${Math.abs(percentChange)}% from baseline`,
        sparkline,
        direction: 'up',
        color: 'text-green-700 bg-green-100'
      };
    } else if (avgChange > -5) {
      return {
        trend: i18n.language === 'hi' ? 'स्थिर' : 'Stable',
        metrics: i18n.language === 'hi'
          ? `NPK स्तर स्थिर (±${Math.abs(percentChange)}%)`
          : `NPK levels stable (±${Math.abs(percentChange)}%)`,
        sparkline,
        direction: 'stable',
        color: 'text-blue-700 bg-blue-100'
      };
    } else {
      return {
        trend: i18n.language === 'hi' ? 'घट रहा है' : 'Declining',
        metrics: i18n.language === 'hi'
          ? `NPK स्तर बेसलाइन से ${Math.abs(percentChange)}% नीचे`
          : `NPK levels down ${Math.abs(percentChange)}% from baseline`,
        sparkline,
        direction: 'down',
        color: 'text-red-700 bg-red-100'
      };
    }
  };

  // Translate backend recommendations to Hindi
  const translateRecommendation = (rec) => {
    if (i18n.language !== 'hi') return rec;
    
    const translations = {
      'Avoid continuous cultivation of the same crop family. Rotate with legumes or other families.': 
        'एक ही फसल परिवार की लगातार खेती से बचें। दलहन या अन्य परिवारों के साथ फसल चक्र अपनाएं।',
      'Include legume crops (chickpea, lentil, beans) to naturally restore soil nitrogen.':
        'मिट्टी में नाइट्रोजन बढ़ाने के लिए दलहन फसलें (चना, मसूर, राजमा) शामिल करें।',
      'Soil fertility is declining. Consider green manure, organic compost, or cover crops.':
        'मिट्टी की उर्वरता घट रही है। हरी खाद, जैविक कम्पोस्ट, या कवर क्रॉप का उपयोग करें।',
      'Soil nitrogen is low. Plant nitrogen-fixing crops or apply organic fertilizers.':
        'मिट्टी में नाइट्रोजन कम है। नाइट्रोजन फिक्सिंग फसलें लगाएं या जैविक खाद डालें।',
      'Soil is acidic (pH < 6.0). Consider lime application to raise pH.':
        'मिट्टी अम्लीय है (pH < 6.0)। pH बढ़ाने के लिए चूना डालें।',
      'Soil is alkaline (pH > 8.0). Consider gypsum or sulfur application.':
        'मिट्टी क्षारीय है (pH > 8.0)। जिप्सम या गंधक डालें।',
      'Low organic matter. Add compost, farmyard manure, or crop residues.':
        'जैविक पदार्थ कम है। कम्पोस्ट, गोबर खाद, या फसल अवशेष डालें।',
      'Diversify crop families in rotation for better soil health.':
        'बेहतर मिट्टी स्वास्थ्य के लिए फसल चक्र में फसल परिवारों में विविधता लाएं।'
    };
    
    // Remove emoji and get the text
    const textWithoutEmoji = rec.replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, '');
    const emoji = rec.match(/^[\u{1F300}-\u{1F9FF}]/u)?.[0] || '';
    
    // Find translation
    for (const [eng, hindi] of Object.entries(translations)) {
      if (textWithoutEmoji.includes(eng) || rec.includes(eng)) {
        return emoji ? `${emoji} ${hindi}` : hindi;
      }
    }
    
    return rec;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔄 {t('app.cropRotation.title')}
            </h1>
            <p className="text-gray-600">
              {t('app.cropRotation.subtitle')}
            </p>
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            + {t('app.cropRotation.addNewField')}
          </button>
        </div>

        {/* Create Field Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-6">{t('app.cropRotation.createNewField')}</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('app.cropRotation.fieldId')} <span className="text-gray-500 text-xs">({i18n.language === 'hi' ? 'वैकल्पिक' : 'optional'})</span>
                  </label>
                  <input
                    type="text"
                    value={newField.fieldId}
                    onChange={(e) => setNewField({...newField, fieldId: e.target.value})}
                    placeholder={i18n.language === 'hi' ? 'उ.दा., F001 (खाली छोड़ें तो ऑटो-जेनरेट होगा)' : 'e.g., F001 (leave empty to auto-generate)'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('app.cropRotation.fieldName')} *
                  </label>
                  {newField.fieldName === 'Custom' || (newField.fieldName && !fieldNameOptions.find(opt => opt.en === newField.fieldName)) ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newField.fieldName === 'Custom' ? '' : newField.fieldName}
                        onChange={(e) => setNewField({...newField, fieldName: e.target.value})}
                        placeholder={i18n.language === 'hi' ? 'अपना नाम दर्ज करें' : 'Enter custom name'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setNewField({...newField, fieldName: ''})}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        ← {i18n.language === 'hi' ? 'ड्रॉपडाउन पर वापस जाएं' : 'Back to dropdown'}
                      </button>
                    </div>
                  ) : (
                    <select
                      value={newField.fieldName}
                      onChange={(e) => setNewField({...newField, fieldName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">{i18n.language === 'hi' ? 'खेत का नाम चुनें' : 'Select field name'}</option>
                      {fieldNameOptions.map((option, idx) => (
                        <option key={idx} value={option.en}>
                          {getFieldNameDisplay(option)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {t('app.cropRotation.area')} *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAreaConverter(true)}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      📏 {i18n.language === 'hi' ? 'क्षेत्रफल परिवर्तक' : 'Area Converter'}
                    </button>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={newField.area}
                    onChange={(e) => setNewField({...newField, area: e.target.value})}
                    placeholder={i18n.language === 'hi' ? 'उ.दा., 2.5' : 'e.g., 2.5'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {t('app.cropRotation.cancel')}
                </button>
                <button
                  onClick={createRotation}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? t('app.cropRotation.creating') : t('app.cropRotation.createField')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fields List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {rotations.map((rotation) => (
            <div
              key={rotation._id}
              className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all ${
                selectedRotation?._id === rotation._id ? 'border-green-500' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-800">
                  {getTranslatedFieldName(rotation.fieldName)}
                </h3>
                <button
                  onClick={() => {
                    setEditingField(rotation);
                    setShowEditForm(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 p-1"
                  title={i18n.language === 'hi' ? 'संपादित करें' : 'Edit'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">ID: {rotation.fieldId}</p>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('app.cropRotation.area')}:</span>
                  <span className="font-medium">{rotation.area} {i18n.language === 'hi' ? 'हे' : 'ha'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('app.cropRotation.cropsGrown')}:</span>
                  <span className="font-medium">{rotation.rotationHistory.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('app.cropRotation.pattern')}:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPatternColor(rotation.rotationPattern)}`}>
                    {rotation.rotationPattern === 'Insufficient Data' 
                      ? (i18n.language === 'hi' ? 'अपर्याप्त डेटा' : 'Insufficient Data')
                      : rotation.rotationPattern
                    }
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setSelectedRotation(rotation);
                  fetchAnalysis(rotation._id);
                }}
                className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                {i18n.language === 'hi' ? 'विवरण देखें' : 'View Details'}
              </button>
            </div>
          ))}

          {rotations.length === 0 && !loading && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p className="text-lg mb-2">{t('app.cropRotation.noFieldsYet')}</p>
              <p className="text-sm">{t('app.cropRotation.clickToGetStarted')}</p>
            </div>
          )}
        </div>

        {/* Selected Field Details */}
        {selectedRotation && (
          <div className="space-y-6">
            {/* Field Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{getTranslatedFieldName(selectedRotation.fieldName)}</h2>
                  <p className="text-gray-600">{t('app.cropRotation.fieldId')}: {selectedRotation.fieldId} • {t('app.cropRotation.area')}: {selectedRotation.area} {i18n.language === 'hi' ? 'हे' : 'ha'}</p>
                </div>

                <button
                  onClick={() => setShowAddCropForm(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + {t('app.cropRotation.addCrop')}
                </button>
              </div>

              {/* Current Soil Health - Color Coded */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">{i18n.language === 'hi' ? '🌱 मिट्टी का स्वास्थ्य' : '🌱 Soil Health'}</h3>
                  <button
                    onClick={() => {
                      setEditingSoilHealth({
                        nitrogen: selectedRotation.currentSoilHealth.nitrogen,
                        phosphorus: selectedRotation.currentSoilHealth.phosphorus,
                        potassium: selectedRotation.currentSoilHealth.potassium,
                        pH: selectedRotation.currentSoilHealth.pH,
                        organicMatter: selectedRotation.currentSoilHealth.organicMatter
                      });
                      setShowSoilHealthEdit(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {i18n.language === 'hi' ? 'अपडेट करें' : 'Update'}
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className={`p-4 rounded-lg border-2 ${getNPKColor(selectedRotation.currentSoilHealth.nitrogen, 'nitrogen')}`}>
                    <p className="text-xs font-medium mb-1">{i18n.language === 'hi' ? 'नाइट्रोजन (N)' : 'Nitrogen (N)'}</p>
                    <p className="text-2xl font-bold">{selectedRotation.currentSoilHealth.nitrogen}</p>
                    <p className="text-xs mt-1 font-medium">{getNPKStatus(selectedRotation.currentSoilHealth.nitrogen, 'nitrogen').label}</p>
                    <p className="text-xs text-gray-600">{getNPKStatus(selectedRotation.currentSoilHealth.nitrogen, 'nitrogen').range}</p>
                  </div>
                  <div className={`p-4 rounded-lg border-2 ${getNPKColor(selectedRotation.currentSoilHealth.phosphorus, 'phosphorus')}`}>
                    <p className="text-xs font-medium mb-1">{i18n.language === 'hi' ? 'फास्फोरस (P)' : 'Phosphorus (P)'}</p>
                    <p className="text-2xl font-bold">{selectedRotation.currentSoilHealth.phosphorus}</p>
                    <p className="text-xs mt-1 font-medium">{getNPKStatus(selectedRotation.currentSoilHealth.phosphorus, 'phosphorus').label}</p>
                    <p className="text-xs text-gray-600">{getNPKStatus(selectedRotation.currentSoilHealth.phosphorus, 'phosphorus').range}</p>
                  </div>
                  <div className={`p-4 rounded-lg border-2 ${getNPKColor(selectedRotation.currentSoilHealth.potassium, 'potassium')}`}>
                    <p className="text-xs font-medium mb-1">{i18n.language === 'hi' ? 'पोटेशियम (K)' : 'Potassium (K)'}</p>
                    <p className="text-2xl font-bold">{selectedRotation.currentSoilHealth.potassium}</p>
                    <p className="text-xs mt-1 font-medium">{getNPKStatus(selectedRotation.currentSoilHealth.potassium, 'potassium').label}</p>
                    <p className="text-xs text-gray-600">{getNPKStatus(selectedRotation.currentSoilHealth.potassium, 'potassium').range}</p>
                  </div>
                  <div className={`p-4 rounded-lg border-2 ${getPHColor(selectedRotation.currentSoilHealth.pH)}`}>
                    <p className="text-xs font-medium mb-1">{i18n.language === 'hi' ? 'pH स्तर' : 'pH Level'}</p>
                    <p className="text-2xl font-bold">{selectedRotation.currentSoilHealth.pH}</p>
                    <p className="text-xs mt-1 font-medium">{getPHStatus(selectedRotation.currentSoilHealth.pH).label}</p>
                    <p className="text-xs text-gray-600">{getPHStatus(selectedRotation.currentSoilHealth.pH).range}</p>
                  </div>
                  <div className="p-4 rounded-lg border-2 bg-amber-50 text-amber-800">
                    <p className="text-xs font-medium mb-1">{i18n.language === 'hi' ? 'जैविक पदार्थ' : 'Organic Matter'}</p>
                    <p className="text-2xl font-bold">{selectedRotation.currentSoilHealth.organicMatter}%</p>
                    <p className="text-xs mt-1 font-medium">
                      {selectedRotation.currentSoilHealth.organicMatter >= 2.5 
                        ? (i18n.language === 'hi' ? 'अच्छा' : 'Good')
                        : selectedRotation.currentSoilHealth.organicMatter >= 1.5
                        ? (i18n.language === 'hi' ? 'मध्यम' : 'Moderate')
                        : (i18n.language === 'hi' ? 'कम' : 'Low')
                      }
                    </p>
                    <p className="text-xs text-gray-600">{i18n.language === 'hi' ? '(2.0-3.5 अच्छा)' : '(2.0-3.5 optimal)'}</p>
                  </div>
                </div>
              </div>

              {/* Next Crop Suggestions - Moved Higher for F-Pattern */}
              {(() => {
                const suggestions = getCropSuggestions(selectedRotation);
                return (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">{i18n.language === 'hi' ? '🌾 अगली फसल के सुझाव' : '🌾 Suggested Next Crops'}</h3>
                    <p className="text-sm text-gray-600 mb-4">{suggestions.reason}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {suggestions.suggested.map((crop, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setNewCrop({...newCrop, cropName: crop.name});
                            setShowAddCropForm(true);
                          }}
                          className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-lg border border-green-200 cursor-pointer transition-all hover:shadow-md group"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 group-hover:text-green-700">{translateCropName(crop.name)}</h4>
                            <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs font-bold">
                              {crop.score}%
                            </span>
                          </div>
                          <div className="space-y-1 text-xs text-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="w-16 text-gray-600">{i18n.language === 'hi' ? 'उपज:' : 'Yield:'}</span>
                              <span className="font-medium">{crop.yield} t/ha</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-16 text-gray-600">{i18n.language === 'hi' ? 'मूल्य:' : 'Price:'}</span>
                              <span className="font-medium">{crop.price}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-16 text-gray-600">{i18n.language === 'hi' ? 'पानी:' : 'Water:'}</span>
                              <span className="font-medium">{crop.water}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-16 text-gray-600">{i18n.language === 'hi' ? 'अवधि:' : 'Duration:'}</span>
                              <span className="font-medium">{crop.days} {i18n.language === 'hi' ? 'दिन' : 'days'}</span>
                            </div>
                          </div>
                          <div className="mt-3 pt-2 border-t border-green-200">
                            <p className="text-xs text-green-700 font-medium group-hover:text-green-800">
                              {i18n.language === 'hi' ? '☝ चयन करने के लिए क्लिक करें' : '☝ Click to select'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Actionable Recommendations - With Priority and Expandable Details */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">{i18n.language === 'hi' ? '💡 तुरंत कार्यवाही' : '💡 Immediate Actions'}</h3>
                <div className="space-y-3">
                  {getActionableRecommendations(selectedRotation).map((rec, idx) => (
                    <div 
                      key={idx} 
                      className={`rounded-lg border-2 transition-all ${
                        rec.priority === 'high' ? 'bg-red-50 border-red-400'
                        : rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-400'
                        : 'bg-blue-50 border-blue-400'
                      }`}
                    >
                      <div 
                        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-opacity-80"
                        onClick={() => setExpandedRecommendation(expandedRecommendation === idx ? null : idx)}
                      >
                        {/* Priority Number Badge */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          rec.priority === 'high' ? 'bg-red-600'
                          : rec.priority === 'medium' ? 'bg-yellow-600'
                          : 'bg-blue-600'
                        }`}>
                          {rec.priorityNum}
                        </div>
                        <span className="text-2xl flex-shrink-0">{rec.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-gray-900">{rec.title}</p>
                            {rec.priority === 'high' && (
                              <span className="px-2 py-0.5 bg-red-200 text-red-800 text-xs font-semibold rounded-full">
                                {i18n.language === 'hi' ? 'उच्च' : 'HIGH'}
                              </span>
                            )}
                            {rec.priority === 'medium' && (
                              <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs font-semibold rounded-full">
                                {i18n.language === 'hi' ? 'मध्यम' : 'MEDIUM'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{rec.action}</p>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                          <svg 
                            className={`w-5 h-5 transition-transform ${expandedRecommendation === idx ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      {/* Expandable Detailed Guide */}
                      {expandedRecommendation === idx && rec.guide && (
                        <div className="px-4 pb-4 pt-2 border-t-2 border-gray-200 bg-white bg-opacity-50">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <h4 className="font-semibold text-gray-900">{rec.guide.title}</h4>
                          </div>
                          <ul className="space-y-2">
                            {rec.guide.steps.map((step, stepIdx) => (
                              <li key={stepIdx} className="text-sm text-gray-700 leading-relaxed pl-4 border-l-2 border-blue-300">
                                {step}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-600 italic">
                              {i18n.language === 'hi'
                                ? '💡 सलाह: अधिक जानकारी के लिए अपने निकटतम कृषि विज्ञान केंद्र (KVK) या मिट्टी परीक्षण प्रयोगशाला से संपर्क करें।'
                                : '💡 Tip: Contact your nearest Krishi Vigyan Kendra (KVK) or soil testing laboratory for more information.'
                              }
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {getActionableRecommendations(selectedRotation).length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">{i18n.language === 'hi' ? '✅ मिट्टी का स्वास्थ्य अच्छा है!' : '✅ Soil health is good!'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Analysis Results */}
            {analysis && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-6">📊 {t('app.cropRotation.rotationAnalysis')}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Enhanced Rotation Pattern with Severity */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">{t('app.cropRotation.rotationPattern')}</p>
                    {(() => {
                      const patternAnalysis = getRotationPatternAnalysis(selectedRotation);
                      return (
                        <div className={`p-4 rounded-lg border-2 ${patternAnalysis.color}`}>
                          <p className="text-lg font-bold mb-2">{patternAnalysis.pattern}</p>
                          <p className="text-sm mb-2">{patternAnalysis.message}</p>
                          {patternAnalysis.interval && (
                            <p className="text-xs italic flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {patternAnalysis.interval}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Enhanced Soil Fertility Trend with Metrics */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">{t('app.cropRotation.soilFertilityTrend')}</p>
                    {(() => {
                      const trendAnalysis = getSoilTrendAnalysis(selectedRotation);
                      return (
                        <div className={`p-4 rounded-lg border-2 ${trendAnalysis.color}`}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-lg font-bold">{trendAnalysis.trend}</p>
                            {/* Trend Arrow */}
                            {trendAnalysis.direction === 'up' && (
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                              </svg>
                            )}
                            {trendAnalysis.direction === 'down' && (
                              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                            {trendAnalysis.direction === 'stable' && (
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14" />
                              </svg>
                            )}
                          </div>
                          {trendAnalysis.metrics && (
                            <p className="text-sm mb-2">{trendAnalysis.metrics}</p>
                          )}
                          {/* Sparkline visualization */}
                          {trendAnalysis.sparkline && trendAnalysis.sparkline.length > 0 && (
                            <div className="h-12 flex items-end gap-1 mt-2">
                              {trendAnalysis.sparkline.map((value, idx) => {
                                const maxValue = Math.max(...trendAnalysis.sparkline);
                                const height = (value / maxValue) * 100;
                                return (
                                  <div 
                                    key={idx}
                                    className={`flex-1 rounded-t transition-all ${
                                      trendAnalysis.direction === 'up' ? 'bg-green-500' :
                                      trendAnalysis.direction === 'down' ? 'bg-red-500' :
                                      'bg-blue-500'
                                    }`}
                                    style={{ height: `${height}%` }}
                                    title={`N: ${value}`}
                                  ></div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">{t('app.cropRotation.totalCrops')}</p>
                    <p className="text-2xl font-bold text-gray-900">{analysis.statistics.totalCropsGrown}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">{t('app.cropRotation.cropFamilies')}</p>
                    <p className="text-2xl font-bold text-gray-900">{analysis.statistics.cropFamilies.length}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">{t('app.cropRotation.yearsTracked')}</p>
                    <p className="text-2xl font-bold text-gray-900">{analysis.statistics.yearsTracked}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">{t('app.cropRotation.avgYield')}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analysis.statistics.averageYield ? analysis.statistics.averageYield.toFixed(1) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-4">💡 {t('app.cropRotation.recommendations')}</h4>
                    <div className="space-y-2">
                      {analysis.recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                          <p className="text-gray-800">{translateRecommendation(rec)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rotation History */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-6">📜 {t('app.cropRotation.rotationHistory')}</h3>

              {selectedRotation.rotationHistory.length > 0 ? (
                <div className="space-y-4">
                  {selectedRotation.rotationHistory.slice().reverse().map((crop, idx) => {
                    const yieldComparison = getYieldComparison(crop.cropName, crop.yield, crop.yieldUnit || 't/ha');
                    return (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{translateCropName(crop.cropName)}</h4>
                            <p className="text-sm text-gray-600">
                              {crop.cropFamily} • {crop.season} {crop.year}
                            </p>
                          </div>
                          {crop.yield && (
                            <div className="text-right">
                              <p className="text-sm text-gray-600">{t('app.cropRotation.yield')}</p>
                              <p className={`text-lg font-bold ${
                                yieldComparison?.status === 'excellent' ? 'text-green-600'
                                : yieldComparison?.status === 'good' ? 'text-blue-600'
                                : 'text-yellow-600'
                              }`}>
                                {crop.yield} {crop.yieldUnit || (i18n.language === 'hi' ? 'टन/हे' : 't/ha')}
                              </p>
                              {yieldComparison && (
                                <p className="text-xs mt-1">{yieldComparison.message}</p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-gray-600">{t('app.cropRotation.planted')}: {new Date(crop.plantedDate).toLocaleDateString()}</p>
                            {crop.harvestDate && (
                              <p className="text-gray-600">{t('app.cropRotation.harvested')}: {new Date(crop.harvestDate).toLocaleDateString()}</p>
                            )}
                          </div>
                          {crop.notes && (
                            <div>
                              <p className="text-gray-600">{t('app.cropRotation.notes')}: {crop.notes}</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Yield Benchmark Details */}
                        {yieldComparison && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span>{i18n.language === 'hi' ? 'औसत उपज' : 'Avg Yield'}: {yieldComparison.avg} t/ha</span>
                              <span>{i18n.language === 'hi' ? 'अच्छी उपज' : 'Good Yield'}: {yieldComparison.good} t/ha</span>
                              <div className="flex-1">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      yieldComparison.status === 'excellent' ? 'bg-green-500'
                                      : yieldComparison.status === 'good' ? 'bg-blue-500'
                                      : 'bg-yellow-500'
                                    }`}
                                    style={{ width: `${Math.min(yieldComparison.percentage, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">{t('app.cropRotation.noCropsYet')}</p>
              )}
            </div>
          </div>
        )}

        {/* Add Crop Modal */}
        {showAddCropForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full m-4 max-h-screen overflow-y-auto">
              <h2 className="text-2xl font-bold mb-2">{t('app.cropRotation.addCropToRotation')}</h2>
              
              {/* Smart Suggestions */}
              {(() => {
                const suggestions = getCropSuggestions(selectedRotation);
                return suggestions.suggested.length > 0 && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-2">
                      🎯 {i18n.language === 'hi' ? 'आपके लिए सुझाव' : 'Recommended for you'}:
                    </p>
                    <p className="text-xs text-blue-700 mb-3">{suggestions.reason}</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.suggested.map((crop, idx) => (
                        <button
                          key={idx}
                          onClick={() => setNewCrop({...newCrop, cropName: crop.name})}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            newCrop.cropName === crop.name
                              ? 'bg-green-600 text-white'
                              : 'bg-white text-green-700 border border-green-300 hover:bg-green-50'
                          }`}
                        >
                          {translateCropName(crop.name)}
                          <span className="ml-2 text-xs opacity-75">{crop.score}%</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('app.cropRotation.cropName')} *
                  </label>
                  <select
                    value={newCrop.cropName}
                    onChange={(e) => setNewCrop({...newCrop, cropName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{i18n.language === 'hi' ? 'फसल चुनें' : 'Select Crop'}</option>
                    <option value="Rice">{translateCropName('Rice')}</option>
                    <option value="Wheat">{translateCropName('Wheat')}</option>
                    <option value="Maize">{translateCropName('Maize')}</option>
                    <option value="Cotton">{translateCropName('Cotton')}</option>
                    <option value="Soybean">{translateCropName('Soybean')}</option>
                    <option value="Sugarcane">{translateCropName('Sugarcane')}</option>
                    <option value="Groundnut">{translateCropName('Groundnut')}</option>
                    <option value="Sunflower">{translateCropName('Sunflower')}</option>
                    <option value="Chickpea">{translateCropName('Chickpea')}</option>
                    <option value="Pigeon Pea">{translateCropName('Pigeon Pea')}</option>
                    <option value="Lentil">{translateCropName('Lentil')}</option>
                    <option value="Green Gram">{translateCropName('Green Gram')}</option>
                    <option value="Black Gram">{translateCropName('Black Gram')}</option>
                    <option value="Mustard">{translateCropName('Mustard')}</option>
                    <option value="Sesame">{translateCropName('Sesame')}</option>
                    <option value="Potato">{translateCropName('Potato')}</option>
                    <option value="Tomato">{translateCropName('Tomato')}</option>
                    <option value="Onion">{translateCropName('Onion')}</option>
                    <option value="Brinjal">{translateCropName('Brinjal')}</option>
                    <option value="Cabbage">{translateCropName('Cabbage')}</option>
                    <option value="Cauliflower">{translateCropName('Cauliflower')}</option>
                    <option value="Banana">{translateCropName('Banana')}</option>
                    <option value="Mango">{translateCropName('Mango')}</option>
                    <option value="Papaya">{translateCropName('Papaya')}</option>
                    <option value="Jute">{translateCropName('Jute')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('app.cropRotation.cropFamily')} *
                  </label>
                  <select
                    value={newCrop.cropFamily}
                    onChange={(e) => setNewCrop({...newCrop, cropFamily: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Legume">{i18n.language === 'hi' ? 'दलहन' : 'Legume'}</option>
                    <option value="Cereal">{i18n.language === 'hi' ? 'अनाज' : 'Cereal'}</option>
                    <option value="Oilseed">{i18n.language === 'hi' ? 'तिलहन' : 'Oilseed'}</option>
                    <option value="Vegetable">{i18n.language === 'hi' ? 'सब्जी' : 'Vegetable'}</option>
                    <option value="Fruit">{i18n.language === 'hi' ? 'फल' : 'Fruit'}</option>
                    <option value="Fiber">{i18n.language === 'hi' ? 'रेशा' : 'Fiber'}</option>
                    <option value="Other">{i18n.language === 'hi' ? 'अन्य' : 'Other'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('app.cropRotation.season')} *
                  </label>
                  <select
                    value={newCrop.season}
                    onChange={(e) => setNewCrop({...newCrop, season: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Kharif">{i18n.language === 'hi' ? 'खरीफ' : 'Kharif'}</option>
                    <option value="Rabi">{i18n.language === 'hi' ? 'रबी' : 'Rabi'}</option>
                    <option value="Zaid">{i18n.language === 'hi' ? 'जायद' : 'Zaid'}</option>
                    <option value="Perennial">{i18n.language === 'hi' ? 'बहुवर्षीय' : 'Perennial'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('app.cropRotation.year')} *
                  </label>
                  <input
                    type="number"
                    value={newCrop.year}
                    onChange={(e) => setNewCrop({...newCrop, year: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('app.cropRotation.plantedDate')} *
                  </label>
                  <input
                    type="date"
                    value={newCrop.plantedDate}
                    onChange={(e) => setNewCrop({...newCrop, plantedDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('app.cropRotation.harvestDate')}
                  </label>
                  <input
                    type="date"
                    value={newCrop.harvestDate}
                    onChange={(e) => setNewCrop({...newCrop, harvestDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('app.cropRotation.yield')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={newCrop.yield}
                      onChange={(e) => setNewCrop({...newCrop, yield: e.target.value})}
                      placeholder={i18n.language === 'hi' ? 'उ.दा., 2.5' : 'e.g., 2.5'}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={newCrop.yieldUnit}
                      onChange={(e) => setNewCrop({...newCrop, yieldUnit: e.target.value})}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="t/ha">{i18n.language === 'hi' ? 'टन/हे' : 't/ha'}</option>
                      <option value="kg/ha">{i18n.language === 'hi' ? 'किग्रा/हे' : 'kg/ha'}</option>
                      <option value="quintal/ha">{i18n.language === 'hi' ? 'क्विंटल/हे' : 'q/ha'}</option>
                      <option value="tons">{i18n.language === 'hi' ? 'टन' : 'tons'}</option>
                      <option value="kg">{i18n.language === 'hi' ? 'किग्रा' : 'kg'}</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('app.cropRotation.notes')}
                  </label>
                  <textarea
                    value={newCrop.notes}
                    onChange={(e) => setNewCrop({...newCrop, notes: e.target.value})}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Soil Health Before Planting Section */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {i18n.language === 'hi' ? '🌱 बुवाई से पहले मिट्टी स्वास्थ्य' : '🌱 Soil Health Before Planting'}
                  </h3>
                  <span className="text-xs text-gray-500">
                    ({i18n.language === 'hi' ? 'वैकल्पिक - प्रवृत्ति विश्लेषण के लिए' : 'Optional - for trend analysis'})
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {i18n.language === 'hi' ? 'नाइट्रोजन (N)' : 'Nitrogen (N)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newCrop.soilHealthBefore.nitrogen}
                      onChange={(e) => setNewCrop({
                        ...newCrop,
                        soilHealthBefore: {...newCrop.soilHealthBefore, nitrogen: e.target.value}
                      })}
                      placeholder="40"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {i18n.language === 'hi' ? 'फास्फोरस (P)' : 'Phosphorus (P)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newCrop.soilHealthBefore.phosphorus}
                      onChange={(e) => setNewCrop({
                        ...newCrop,
                        soilHealthBefore: {...newCrop.soilHealthBefore, phosphorus: e.target.value}
                      })}
                      placeholder="30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {i18n.language === 'hi' ? 'पोटेशियम (K)' : 'Potassium (K)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newCrop.soilHealthBefore.potassium}
                      onChange={(e) => setNewCrop({
                        ...newCrop,
                        soilHealthBefore: {...newCrop.soilHealthBefore, potassium: e.target.value}
                      })}
                      placeholder="30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {i18n.language === 'hi' ? 'pH स्तर' : 'pH Level'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newCrop.soilHealthBefore.pH}
                      onChange={(e) => setNewCrop({
                        ...newCrop,
                        soilHealthBefore: {...newCrop.soilHealthBefore, pH: e.target.value}
                      })}
                      placeholder="6.5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {i18n.language === 'hi' ? 'जैविक पदार्थ (%)' : 'Organic Matter (%)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newCrop.soilHealthBefore.organicMatter}
                      onChange={(e) => setNewCrop({
                        ...newCrop,
                        soilHealthBefore: {...newCrop.soilHealthBefore, organicMatter: e.target.value}
                      })}
                      placeholder="2.0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Soil Health After Harvest Section */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {i18n.language === 'hi' ? '🌾 कटाई के बाद मिट्टी स्वास्थ्य' : '🌾 Soil Health After Harvest'}
                  </h3>
                  <span className="text-xs text-gray-500">
                    ({i18n.language === 'hi' ? 'वैकल्पिक - प्रवृत्ति विश्लेषण के लिए' : 'Optional - for trend analysis'})
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {i18n.language === 'hi' ? 'नाइट्रोजन (N)' : 'Nitrogen (N)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newCrop.soilHealthAfter.nitrogen}
                      onChange={(e) => setNewCrop({
                        ...newCrop,
                        soilHealthAfter: {...newCrop.soilHealthAfter, nitrogen: e.target.value}
                      })}
                      placeholder="35"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {i18n.language === 'hi' ? 'फास्फोरस (P)' : 'Phosphorus (P)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newCrop.soilHealthAfter.phosphorus}
                      onChange={(e) => setNewCrop({
                        ...newCrop,
                        soilHealthAfter: {...newCrop.soilHealthAfter, phosphorus: e.target.value}
                      })}
                      placeholder="28"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {i18n.language === 'hi' ? 'पोटेशियम (K)' : 'Potassium (K)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newCrop.soilHealthAfter.potassium}
                      onChange={(e) => setNewCrop({
                        ...newCrop,
                        soilHealthAfter: {...newCrop.soilHealthAfter, potassium: e.target.value}
                      })}
                      placeholder="32"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {i18n.language === 'hi' ? 'pH स्तर' : 'pH Level'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newCrop.soilHealthAfter.pH}
                      onChange={(e) => setNewCrop({
                        ...newCrop,
                        soilHealthAfter: {...newCrop.soilHealthAfter, pH: e.target.value}
                      })}
                      placeholder="6.3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {i18n.language === 'hi' ? 'जैविक पदार्थ (%)' : 'Organic Matter (%)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newCrop.soilHealthAfter.organicMatter}
                      onChange={(e) => setNewCrop({
                        ...newCrop,
                        soilHealthAfter: {...newCrop.soilHealthAfter, organicMatter: e.target.value}
                      })}
                      placeholder="1.8"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2 italic">
                  {i18n.language === 'hi'
                    ? '💡 सुझाव: फसल के पहले और बाद के मान जोड़ने से आपको मिट्टी की प्रवृत्ति (सुधर रहा/घट रहा) दिखाई देगी।'
                    : '💡 Tip: Adding before & after values will show you soil fertility trends (Improving/Declining) with sparkline charts.'
                  }
                </p>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowAddCropForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {t('app.cropRotation.cancel')}
                </button>
                <button
                  onClick={addCropToRotation}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? t('app.cropRotation.adding') : t('app.cropRotation.addCropButton')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Area Converter Modal */}
        {showAreaConverter && (
          <AreaConverter
            onClose={() => setShowAreaConverter(false)}
            onConvert={(hectares) => {
              setNewField({...newField, area: hectares.toString()});
              setShowAreaConverter(false);
            }}
          />
        )}

        {/* Edit Field Modal */}
        {showEditForm && editingField && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-6">
                {i18n.language === 'hi' ? 'खेत संपादित करें' : 'Edit Field'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('app.cropRotation.fieldId')}
                  </label>
                  <input
                    type="text"
                    value={editingField.fieldId}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('app.cropRotation.fieldName')} *
                  </label>
                  <select
                    value={editingField.fieldName}
                    onChange={(e) => setEditingField({...editingField, fieldName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    {fieldNameOptions.map((option, idx) => (
                      <option key={idx} value={option.en}>
                        {getFieldNameDisplay(option)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('app.cropRotation.area')} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingField.area}
                    onChange={(e) => setEditingField({...editingField, area: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingField(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {t('app.cropRotation.cancel')}
                </button>
                <button
                  onClick={async () => {
                    if (!editingField.fieldName || !editingField.area) {
                      showAlert(
                        i18n.language === 'hi' ? 'कृपया सभी आवश्यक फ़ील्ड भरें' : 'Please fill all required fields',
                        'error'
                      );
                      return;
                    }
                    
                    setLoading(true);
                    try {
                      const response = await fetch(`${API_BASE_URL}/api/crop-rotation/${editingField._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          fieldName: editingField.fieldName,
                          area: parseFloat(editingField.area)
                        })
                      });

                      const data = await response.json();

                      if (data.success) {
                        setRotations(rotations.map(r => r._id === data.rotation._id ? data.rotation : r));
                        if (selectedRotation?._id === data.rotation._id) {
                          setSelectedRotation(data.rotation);
                        }
                        setShowEditForm(false);
                        setEditingField(null);
                        showAlert(
                          i18n.language === 'hi' ? 'खेत सफलतापूर्वक अपडेट किया गया!' : 'Field updated successfully!',
                          'success'
                        );
                      }
                    } catch (error) {
                      console.error('Error updating field:', error);
                      showAlert(
                        i18n.language === 'hi' ? 'खेत अपडेट करने में त्रुटि' : 'Error updating field',
                        'error'
                      );
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading 
                    ? (i18n.language === 'hi' ? 'अपडेट हो रहा है...' : 'Updating...') 
                    : (i18n.language === 'hi' ? 'अपडेट करें' : 'Update')
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Alert Modal */}
        {alertModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
              <div className={`p-6 rounded-t-2xl ${
                alertModal.type === 'success' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-red-500 to-rose-500'
              }`}>
                <div className="flex items-center justify-center">
                  {alertModal.type === 'success' ? (
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-center text-gray-800 text-lg font-medium leading-relaxed">
                  {alertModal.message}
                </p>
              </div>
              
              <div className="px-6 pb-6">
                <button
                  onClick={() => setAlertModal({ show: false, message: '', type: 'success' })}
                  className={`w-full py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg ${
                    alertModal.type === 'success'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                      : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600'
                  }`}
                >
                  {i18n.language === 'hi' ? 'ठीक है' : 'OK'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Soil Health Edit Modal */}
        {showSoilHealthEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {i18n.language === 'hi' ? '🌱 मिट्टी स्वास्थ्य अपडेट करें' : '🌱 Update Soil Health'}
                </h2>
                <button
                  onClick={fetchSoilDataFromLocation}
                  className="px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm font-medium flex items-center gap-2 border border-green-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {i18n.language === 'hi' ? 'स्थान से लोड करें' : 'Load from Location'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === 'hi' ? 'नाइट्रोजन (N)' : 'Nitrogen (N)'} *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingSoilHealth.nitrogen}
                    onChange={(e) => setEditingSoilHealth({...editingSoilHealth, nitrogen: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="40"
                  />
                  <p className="text-xs text-gray-500 mt-1">{i18n.language === 'hi' ? 'अच्छा सीमा: 30-60' : 'Optimal range: 30-60'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === 'hi' ? 'फास्फोरस (P)' : 'Phosphorus (P)'} *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingSoilHealth.phosphorus}
                    onChange={(e) => setEditingSoilHealth({...editingSoilHealth, phosphorus: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="30"
                  />
                  <p className="text-xs text-gray-500 mt-1">{i18n.language === 'hi' ? 'अच्छा सीमा: 20-50' : 'Optimal range: 20-50'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === 'hi' ? 'पोटेशियम (K)' : 'Potassium (K)'} *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingSoilHealth.potassium}
                    onChange={(e) => setEditingSoilHealth({...editingSoilHealth, potassium: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="30"
                  />
                  <p className="text-xs text-gray-500 mt-1">{i18n.language === 'hi' ? 'अच्छा सीमा: 25-55' : 'Optimal range: 25-55'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === 'hi' ? 'pH स्तर' : 'pH Level'} *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingSoilHealth.pH}
                    onChange={(e) => setEditingSoilHealth({...editingSoilHealth, pH: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="6.5"
                  />
                  <p className="text-xs text-gray-500 mt-1">{i18n.language === 'hi' ? 'अच्छा सीमा: 6.0-7.5' : 'Optimal range: 6.0-7.5'}</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === 'hi' ? 'जैविक पदार्थ (%)' : 'Organic Matter (%)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingSoilHealth.organicMatter}
                    onChange={(e) => setEditingSoilHealth({...editingSoilHealth, organicMatter: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="2.0"
                  />
                  <p className="text-xs text-gray-500 mt-1">{i18n.language === 'hi' ? 'अच्छा सीमा: 2.0-3.5%' : 'Optimal range: 2.0-3.5%'}</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">{i18n.language === 'hi' ? '💡 सुझाव:' : '💡 Tip:'}</span>
                  {' '}
                  {i18n.language === 'hi'
                    ? '"स्थान से लोड करें" बटन पर क्लिक करके आपके क्षेत्र के लिए स्वचालित मिट्टी डेटा प्राप्त करें या मैन्युअल रूप से मान दर्ज करें।'
                    : 'Click "Load from Location" to automatically fetch soil data for your area or enter values manually from your soil test report.'
                  }
                </p>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowSoilHealthEdit(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {i18n.language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  onClick={updateSoilHealth}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading 
                    ? (i18n.language === 'hi' ? 'अपडेट हो रहा है...' : 'Updating...') 
                    : (i18n.language === 'hi' ? 'सहेजें' : 'Save')
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
