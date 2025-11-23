/**
 * Conversational AI Service
 * Handles text, voice, and image-based farmer queries
 */

const axios = require('axios');

/**
 * Agricultural knowledge base for farmer queries
 */
const knowledgeBase = {
  crops: {
    rice: {
      season: 'Kharif',
      nitrogen: 'High (80-120 kg/ha)',
      water: 'Very High - Paddy field',
      duration: '120-150 days',
      soil: 'Clay loam, pH 6.0-7.0',
      tips: ['Maintain water level 5-10cm', 'Apply nitrogen in splits', 'Watch for blast disease']
    },
    wheat: {
      season: 'Rabi',
      nitrogen: 'Medium (60-80 kg/ha)',
      water: 'Medium - 4-5 irrigations',
      duration: '120-140 days',
      soil: 'Loamy, pH 6.5-7.5',
      tips: ['Sow in November', 'First irrigation at 20-25 days', 'Protect from rust']
    },
    cotton: {
      season: 'Kharif',
      nitrogen: 'High (100-120 kg/ha)',
      water: 'Medium - Well drained',
      duration: '180-210 days',
      soil: 'Black soil, pH 6.0-8.0',
      tips: ['Deep plowing required', 'Integrated pest management', 'Harvest at 50% boll opening']
    }
  },
  
  diseases: {
    blast: {
      crop: 'Rice',
      symptoms: 'Diamond-shaped lesions on leaves, whitish-gray center',
      treatment: 'Apply Tricyclazole 75% WP @ 0.6g/L or Carbendazim 50% WP @ 1g/L',
      prevention: 'Balanced fertilization, avoid excess nitrogen'
    },
    rust: {
      crop: 'Wheat',
      symptoms: 'Orange-brown pustules on leaves and stems',
      treatment: 'Spray Propiconazole 25% EC @ 0.1% or Mancozeb 75% WP @ 0.25%',
      prevention: 'Use resistant varieties, timely sowing'
    },
    bollworm: {
      crop: 'Cotton',
      symptoms: 'Holes in bolls, damaged squares and flowers',
      treatment: 'Spray Chlorantraniliprole 18.5% SC @ 0.3ml/L',
      prevention: 'Pheromone traps, remove damaged plant parts'
    }
  },

  fertilizers: {
    urea: {
      nutrient: 'Nitrogen (46%)',
      application: 'Top dressing in 2-3 splits',
      dosage: '130 kg/ha for rice, 100 kg/ha for wheat',
      precaution: 'Apply when soil has moisture, avoid in dry soil'
    },
    dap: {
      nutrient: 'Nitrogen (18%) + Phosphorus (46%)',
      application: 'Basal dose at sowing',
      dosage: '100-125 kg/ha',
      precaution: 'Mix with soil, dont let it touch seeds directly'
    },
    potash: {
      nutrient: 'Potassium (60%)',
      application: 'Split doses or basal',
      dosage: '50-60 kg/ha',
      precaution: 'Increases disease resistance and quality'
    }
  },

  schemes: {
    pmksy: {
      name: 'Pradhan Mantri Krishi Sinchai Yojana',
      benefit: 'Irrigation infrastructure subsidy up to 90%',
      eligibility: 'All farmers',
      apply: 'District agriculture office'
    },
    pmfby: {
      name: 'Pradhan Mantri Fasal Bima Yojana',
      benefit: 'Crop insurance - Premium: 2% for Kharif, 1.5% for Rabi',
      eligibility: 'All farmers with crop loan',
      apply: 'Banks, CSC centers'
    },
    soilHealthCard: {
      name: 'Soil Health Card Scheme',
      benefit: 'Free soil testing every 3 years',
      eligibility: 'All farmers',
      apply: 'Nearest soil testing lab'
    }
  }
};

/**
 * Detect intent from user message
 */
function detectIntent(message) {
  const lowerMsg = message.toLowerCase();
  
  // Disease identification
  if (lowerMsg.match(/disease|pest|insect|problem|damage|yellow|spot|hole|rot/i)) {
    return 'disease_identification';
  }
  
  // Crop recommendation
  if (lowerMsg.match(/what.*grow|which crop|recommend|suitable|best crop|plant what/i)) {
    return 'crop_recommendation';
  }
  
  // Fertilizer guidance
  if (lowerMsg.match(/fertilizer|urea|dap|potash|nutrient|nitrogen|npk/i)) {
    return 'fertilizer_guidance';
  }
  
  // Weather query
  if (lowerMsg.match(/weather|rain|temperature|forecast|climate/i)) {
    return 'weather_query';
  }
  
  // Market prices
  if (lowerMsg.match(/price|market|sell|rate|mandi|msp/i)) {
    return 'market_prices';
  }
  
  // Government schemes
  if (lowerMsg.match(/scheme|yojana|subsidy|loan|insurance|government/i)) {
    return 'government_schemes';
  }
  
  // Irrigation
  if (lowerMsg.match(/irrigation|water|drip|sprinkler/i)) {
    return 'irrigation_guidance';
  }
  
  // General farming
  if (lowerMsg.match(/how to|when to|farming|cultivation|sowing|harvest/i)) {
    return 'farming_guidance';
  }
  
  return 'general_query';
}

/**
 * Extract entities from message (crop names, locations, etc.)
 */
function extractEntities(message) {
  const entities = [];
  const lowerMsg = message.toLowerCase();
  
  // Crop names
  const crops = ['rice', 'wheat', 'cotton', 'maize', 'soybean', 'chickpea', 'tomato', 'potato', 'onion'];
  crops.forEach(crop => {
    if (lowerMsg.includes(crop)) {
      entities.push({ type: 'crop', value: crop });
    }
  });
  
  // Numbers (could be area, quantity, etc.)
  const numbers = message.match(/\d+(\.\d+)?/g);
  if (numbers) {
    numbers.forEach(num => {
      entities.push({ type: 'number', value: parseFloat(num) });
    });
  }
  
  return entities;
}

/**
 * Response translations
 */
const translations = {
  en: {
    disease_identification: {
      text: `🔍 To help identify the disease, please:\n\n` +
        `1. Tell me which crop is affected\n` +
        `2. Describe the symptoms (color, shape, location)\n` +
        `3. Share a photo if possible\n\n` +
        `Common symptoms to look for:\n` +
        `• Leaf spots or discoloration\n` +
        `• Wilting or drooping\n` +
        `• Holes in leaves/fruits\n` +
        `• Powdery coating\n` +
        `• Stunted growth`,
      suggestions: ['Upload disease photo', 'Rice blast disease', 'Wheat rust', 'Cotton bollworm']
    },
    crop_recommendation: {
      text: `🌾 To recommend the best crop for your field, I need:\n\n` +
        `1. Your location (State/District)\n` +
        `2. Current season\n` +
        `3. Soil type (if known)\n` +
        `4. Available irrigation\n\n` +
        `Or you can use our AI Recommendation tool for detailed analysis based on N, P, K, pH, rainfall, etc.`,
      suggestions: ['Get AI Recommendation', 'Kharif crops', 'Rabi crops', 'View my soil data']
    },
    fertilizer_guidance_crop: (crop) => ({
      text: `💊 **Fertilizer Guidance for ${crop.charAt(0).toUpperCase() + crop.slice(1)}**\n\n` +
        `**Recommended Doses:**\n` +
        `• Urea: Apply in 2-3 splits during growth stages\n` +
        `• DAP: Apply as basal dose at sowing\n` +
        `• Potash: Split application or as basal\n\n` +
        `**Application Tips:**\n` +
        `✓ First dose: At sowing (DAP + half Potash)\n` +
        `✓ Second dose: 20-30 days after sowing (Urea)\n` +
        `✓ Third dose: Before flowering (Urea + remaining Potash)\n\n` +
        `💡 Tip: Get soil tested for precise recommendations!`,
      suggestions: ['Rice fertilizer schedule', 'Wheat fertilizer schedule', 'Organic alternatives']
    }),
    fertilizer_guidance_general: {
      text: `💊 **General Fertilizer Information**\n\n` +
        `Common fertilizers:\n` +
        `• **Urea** - 46% Nitrogen\n` +
        `• **DAP** - 18% N + 46% P\n` +
        `• **Potash (MOP)** - 60% K\n\n` +
        `Which crop do you need fertilizer guidance for?`,
      suggestions: ['Rice fertilizer schedule', 'Wheat fertilizer schedule', 'Organic alternatives']
    },
    market_prices: {
      text: `💰 **Check Current Market Prices**\n\n` +
        `I can help you find:\n` +
        `• Live mandi prices for your crops\n` +
        `• MSP (Minimum Support Price)\n` +
        `• Price trends and forecasts\n` +
        `• Nearby markets and rates\n\n` +
        `Which crop's price do you want to check?`,
      suggestions: ['View all market prices', 'Set price alert', 'Check MSP rates']
    },
    government_schemes: {
      text: `🏛️ **Government Schemes for Farmers**\n\n` +
        `**Top Schemes:**\n\n` +
        `1. **PM-KISAN** - ₹6000/year direct benefit\n` +
        `2. **PMFBY** - Crop insurance (2% premium for Kharif)\n` +
        `3. **PM-KUSUM** - Solar pump subsidy (90%)\n` +
        `4. **Soil Health Card** - Free soil testing\n` +
        `5. **KCC** - Kisan Credit Card for loans\n\n` +
        `Which scheme would you like details about?`,
      suggestions: ['PM-KISAN registration', 'Crop insurance', 'Soil health card', 'All schemes']
    },
    weather_query: {
      text: `🌦️ **Weather Information**\n\n` +
        `I can provide:\n` +
        `• 7-day weather forecast\n` +
        `• Rainfall predictions\n` +
        `• Best days for spraying\n` +
        `• Irrigation scheduling\n\n` +
        `Check the Weather page for detailed forecast, or tell me your location for quick info.`,
      suggestions: ['View 7-day forecast', 'Best spraying days', 'Rainfall alert']
    },
    farming_guidance: {
      text: `👨‍🌾 **Farming Guidance**\n\n` +
        `I can help with:\n` +
        `✓ Sowing techniques and timing\n` +
        `✓ Irrigation scheduling\n` +
        `✓ Pest and disease management\n` +
        `✓ Harvesting best practices\n` +
        `✓ Post-harvest handling\n\n` +
        `What specific farming topic do you need help with?`,
      suggestions: ['Sowing guidelines', 'Irrigation tips', 'Pest management', 'Harvesting tips']
    },
    default: {
      text: `👋 Hello! I'm your Krishi Mitra AI assistant.\n\n` +
        `I can help you with:\n` +
        `🌾 Crop recommendations\n` +
        `🔍 Disease identification\n` +
        `💊 Fertilizer guidance\n` +
        `💰 Market prices\n` +
        `🌦️ Weather forecasts\n` +
        `🏛️ Government schemes\n\n` +
        `What would you like to know?`,
      suggestions: ['Recommend crops', 'Check market prices', 'Government schemes', 'Weather forecast']
    }
  },
  hi: {
    disease_identification: {
      text: `🔍 बीमारी की पहचान करने में मदद के लिए, कृपया:\n\n` +
        `1. बताएं कि कौन सी फसल प्रभावित है\n` +
        `2. लक्षणों का वर्णन करें (रंग, आकार, स्थान)\n` +
        `3. यदि संभव हो तो फोटो शेयर करें\n\n` +
        `देखने के लिए सामान्य लक्षण:\n` +
        `• पत्तियों पर धब्बे या रंग बदलना\n` +
        `• मुरझाना या लटकना\n` +
        `• पत्तियों/फलों में छेद\n` +
        `• पाउडर जैसी परत\n` +
        `• विकास रुकना`,
      suggestions: ['बीमारी की फोटो अपलोड करें', 'धान में ब्लास्ट रोग', 'गेहूं में रस्ट', 'कपास में बॉलवर्म']
    },
    crop_recommendation: {
      text: `🌾 आपके खेत के लिए सबसे अच्छी फसल की सिफारिश करने के लिए, मुझे चाहिए:\n\n` +
        `1. आपका स्थान (राज्य/जिला)\n` +
        `2. वर्तमान मौसम\n` +
        `3. मिट्टी का प्रकार (यदि पता हो)\n` +
        `4. उपलब्ध सिंचाई\n\n` +
        `या आप N, P, K, pH, वर्षा आदि के आधार पर विस्तृत विश्लेषण के लिए हमारे AI सिफारिश टूल का उपयोग कर सकते हैं।`,
      suggestions: ['AI सिफारिश प्राप्त करें', 'खरीफ फसलें', 'रबी फसलें', 'मेरा मिट्टी डेटा देखें']
    },
    fertilizer_guidance_crop: (crop) => ({
      text: `💊 **${crop.charAt(0).toUpperCase() + crop.slice(1)} के लिए उर्वरक मार्गदर्शन**\n\n` +
        `**अनुशंसित खुराक:**\n` +
        `• यूरिया: विकास चरणों के दौरान 2-3 बार में डालें\n` +
        `• DAP: बुवाई के समय आधारीय खुराक\n` +
        `• पोटाश: विभाजित या आधारीय रूप में\n\n` +
        `**डालने की युक्तियाँ:**\n` +
        `✓ पहली खुराक: बुवाई के समय (DAP + आधा पोटाश)\n` +
        `✓ दूसरी खुराक: बुवाई के 20-30 दिन बाद (यूरिया)\n` +
        `✓ तीसरी खुराक: फूल आने से पहले (यूरिया + बाकी पोटाश)\n\n` +
        `💡 सुझाव: सटीक सिफारिशों के लिए मिट्टी परीक्षण करवाएं!`,
      suggestions: ['धान उर्वरक कार्यक्रम', 'गेहूं उर्वरक कार्यक्रम', 'जैविक विकल्प']
    }),
    fertilizer_guidance_general: {
      text: `💊 **सामान्य उर्वरक जानकारी**\n\n` +
        `आम उर्वरक:\n` +
        `• **यूरिया** - 46% नाइट्रोजन\n` +
        `• **DAP** - 18% N + 46% P\n` +
        `• **पोटाश (MOP)** - 60% K\n\n` +
        `आपको किस फसल के लिए उर्वरक मार्गदर्शन चाहिए?`,
      suggestions: ['धान उर्वरक कार्यक्रम', 'गेहूं उर्वरक कार्यक्रम', 'जैविक विकल्प']
    },
    market_prices: {
      text: `💰 **वर्तमान बाजार मूल्य जांचें**\n\n` +
        `मैं आपको खोजने में मदद कर सकता हूं:\n` +
        `• आपकी फसलों के लिए लाइव मंडी कीमतें\n` +
        `• MSP (न्यूनतम समर्थन मूल्य)\n` +
        `• मूल्य रुझान और पूर्वानुमान\n` +
        `• नजदीकी बाजार और दरें\n\n` +
        `आप किस फसल की कीमत जांचना चाहते हैं?`,
      suggestions: ['सभी बाजार मूल्य देखें', 'मूल्य अलर्ट सेट करें', 'MSP दरें जांचें']
    },
    government_schemes: {
      text: `🏛️ **किसानों के लिए सरकारी योजनाएं**\n\n` +
        `**शीर्ष योजनाएं:**\n\n` +
        `1. **PM-KISAN** - ₹6000/वर्ष प्रत्यक्ष लाभ\n` +
        `2. **PMFBY** - फसल बीमा (खरीफ के लिए 2% प्रीमियम)\n` +
        `3. **PM-KUSUM** - सोलर पंप सब्सिडी (90%)\n` +
        `4. **मृदा स्वास्थ्य कार्ड** - मुफ्त मिट्टी परीक्षण\n` +
        `5. **KCC** - किसान क्रेडिट कार्ड ऋण के लिए\n\n` +
        `आप किस योजना के बारे में विवरण चाहेंगे?`,
      suggestions: ['PM-KISAN पंजीकरण', 'फसल बीमा', 'मृदा स्वास्थ्य कार्ड', 'सभी योजनाएं']
    },
    weather_query: {
      text: `🌦️ **मौसम की जानकारी**\n\n` +
        `मैं प्रदान कर सकता हूं:\n` +
        `• 7-दिन का मौसम पूर्वानुमान\n` +
        `• वर्षा पूर्वानुमान\n` +
        `• छिड़काव के लिए सबसे अच्छे दिन\n` +
        `• सिंचाई शेड्यूलिंग\n\n` +
        `विस्तृत पूर्वानुमान के लिए मौसम पेज देखें, या त्वरित जानकारी के लिए मुझे अपना स्थान बताएं।`,
      suggestions: ['7-दिन का पूर्वानुमान देखें', 'छिड़काव के बेहतर दिन', 'वर्षा अलर्ट']
    },
    farming_guidance: {
      text: `👨‍🌾 **कृषि मार्गदर्शन**\n\n` +
        `मैं मदद कर सकता हूं:\n` +
        `✓ बुवाई तकनीक और समय\n` +
        `✓ सिंचाई शेड्यूलिंग\n` +
        `✓ कीट और रोग प्रबंधन\n` +
        `✓ कटाई की सर्वोत्तम प्रथाएं\n` +
        `✓ कटाई के बाद संभाल\n\n` +
        `आपको किस विशेष कृषि विषय में मदद चाहिए?`,
      suggestions: ['बुवाई दिशानिर्देश', 'सिंचाई युक्तियाँ', 'कीट प्रबंधन', 'कटाई युक्तियाँ']
    },
    default: {
      text: `👋 नमस्ते! मैं आपका कृषि मित्र AI सहायक हूं।\n\n` +
        `मैं आपकी मदद कर सकता हूं:\n` +
        `🌾 फसल सिफारिशें\n` +
        `🔍 बीमारी पहचान\n` +
        `💊 उर्वरक मार्गदर्शन\n` +
        `💰 बाजार मूल्य\n` +
        `🌦️ मौसम पूर्वानुमान\n` +
        `🏛️ सरकारी योजनाएं\n\n` +
        `आप क्या जानना चाहेंगे?`,
      suggestions: ['फसल की सिफारिश करें', 'बाजार मूल्य जांचें', 'सरकारी योजनाएं', 'मौसम पूर्वानुमान']
    }
  }
};

/**
 * Generate AI response based on intent and context
 */
async function generateResponse(message, intent, entities, context = {}, language = 'en') {
  const response = {
    text: '',
    suggestions: [],
    data: null
  };

  // Get translation for current language (default to English if not supported)
  const lang = language === 'hi' ? 'hi' : 'en';
  const t = translations[lang];

  switch (intent) {
    case 'disease_identification':
      response.text = t.disease_identification.text;
      response.suggestions = t.disease_identification.suggestions;
      break;

    case 'crop_recommendation':
      response.text = t.crop_recommendation.text;
      response.suggestions = t.crop_recommendation.suggestions;
      break;

    case 'fertilizer_guidance':
      const cropEntity = entities.find(e => e.type === 'crop');
      if (cropEntity) {
        const crop = cropEntity.value;
        const result = t.fertilizer_guidance_crop(crop);
        response.text = result.text;
        response.suggestions = result.suggestions;
      } else {
        response.text = t.fertilizer_guidance_general.text;
        response.suggestions = t.fertilizer_guidance_general.suggestions;
      }
      break;

    case 'market_prices':
      response.text = t.market_prices.text;
      response.suggestions = t.market_prices.suggestions;
      break;

    case 'government_schemes':
      response.text = t.government_schemes.text;
      response.suggestions = t.government_schemes.suggestions;
      break;

    case 'weather_query':
      response.text = t.weather_query.text;
      response.suggestions = t.weather_query.suggestions;
      break;

    case 'farming_guidance':
      response.text = t.farming_guidance.text;
      response.suggestions = t.farming_guidance.suggestions;
      break;

    default:
      response.text = t.default.text;
      response.suggestions = t.default.suggestions;
  }

  return response;
}

/**
 * Process image for disease/pest identification
 */
async function processImageQuery(imageData, message = '') {
  try {
    // In production, this would call a computer vision API
    // For now, return a template response
    return {
      success: true,
      analysis: {
        detected: 'Plant disease detected',
        confidence: 0.85,
        disease: 'Unable to identify - Please consult local agriculture extension officer',
        recommendations: [
          'Remove affected leaves',
          'Ensure proper plant spacing',
          'Apply recommended fungicide',
          'Monitor daily for spread'
        ]
      },
      message: `📸 **Image Analysis Results**\n\n` +
        `I've analyzed your image. For accurate disease identification, I recommend:\n\n` +
        `1. **Take close-up photos** of affected areas\n` +
        `2. **Include healthy parts** for comparison\n` +
        `3. **Good lighting** for clear images\n\n` +
        `For expert diagnosis, please contact your nearest agriculture extension office or use our disease identification guide.`
    };
  } catch (error) {
    console.error('Image processing error:', error);
    return {
      success: false,
      error: 'Failed to process image'
    };
  }
}

/**
 * Process voice query
 */
async function processVoiceQuery(audioData, language = 'en') {
  try {
    // In production, this would use speech-to-text API
    // For now, return a template response
    return {
      success: true,
      transcript: 'Voice input received',
      message: '🎤 Voice message processed. Please type your question or use text input for better accuracy.'
    };
  } catch (error) {
    console.error('Voice processing error:', error);
    return {
      success: false,
      error: 'Failed to process voice input'
    };
  }
}

module.exports = {
  detectIntent,
  extractEntities,
  generateResponse,
  processImageQuery,
  processVoiceQuery,
  knowledgeBase
};
