/**
 * Translation Utility using LibreTranslate
 * Provides automated translation with manual override capability
 */

// Translation API endpoints
const LIBRETRANSLATE_API = 'https://libretranslate.com/translate';
const MYMEMORY_API = 'https://api.mymemory.translated.net/get'; // Fallback API (free, 1000 chars/request)

// Farming terminology overrides - manual corrections for domain-specific terms
const FARMING_TERMINOLOGY = {
  ta: { // Tamil
    'crop': 'பயிர்',
    'soil': 'மண்',
    'fertilizer': 'உரம்',
    'harvest': 'அறுவடை',
    'irrigation': 'நீர்ப்பாசனம்',
    'pesticide': 'பூச்சிக்கொல்லி',
    'yield': 'விளைச்சல்',
    'farmer': 'விவசாயி',
    'seeds': 'விதைகள்',
    'rainfall': 'மழை',
    'temperature': 'வெப்பநிலை',
    'humidity': 'ஈரப்பதம்',
    'recommendation': 'பரிந்துரை',
    'NPK': 'NPK',
    'pH': 'pH'
  },
  te: { // Telugu
    'crop': 'పంట',
    'soil': 'నేల',
    'fertilizer': 'ఎరువు',
    'harvest': 'పంట కోత',
    'irrigation': 'నీటిపారుదల',
    'pesticide': 'పురుగుమందు',
    'yield': 'దిగుబడి',
    'farmer': 'రైతు',
    'seeds': 'విత్తనాలు',
    'rainfall': 'వర్షపాతం',
    'temperature': 'ఉష్ణోగ్రత',
    'humidity': 'తేమ',
    'recommendation': 'సిఫార్సు',
    'NPK': 'NPK',
    'pH': 'pH'
  },
  bn: { // Bengali
    'crop': 'ফসল',
    'soil': 'মাটি',
    'fertilizer': 'সার',
    'harvest': 'ফসল কাটা',
    'irrigation': 'সেচ',
    'pesticide': 'কীটনাশক',
    'yield': 'ফলন',
    'farmer': 'কৃষক',
    'seeds': 'বীজ',
    'rainfall': 'বৃষ্টিপাত',
    'temperature': 'তাপমাত্রা',
    'humidity': 'আর্দ্রতা',
    'recommendation': 'সুপারিশ',
    'NPK': 'NPK',
    'pH': 'pH'
  },
  gu: { // Gujarati
    'crop': 'પાક',
    'soil': 'માટી',
    'fertilizer': 'ખાતર',
    'harvest': 'લણણી',
    'irrigation': 'સિંચાઈ',
    'pesticide': 'જંતુનાશક',
    'yield': 'ઉપજ',
    'farmer': 'ખેડૂત',
    'seeds': 'બીજ',
    'rainfall': 'વરસાદ',
    'temperature': 'તાપમાન',
    'humidity': 'ભેજ',
    'recommendation': 'ભલામણ',
    'NPK': 'NPK',
    'pH': 'pH'
  },
  kn: { // Kannada
    'crop': 'ಬೆಳೆ',
    'soil': 'ಮಣ್ಣು',
    'fertilizer': 'ಗೊಬ್ಬರ',
    'harvest': 'ಕೊಯ್ಲು',
    'irrigation': 'ನೀರಾವರಿ',
    'pesticide': 'ಕೀಟನಾಶಕ',
    'yield': 'ಇಳುವರಿ',
    'farmer': 'ರೈತ',
    'seeds': 'ಬೀಜಗಳು',
    'rainfall': 'ಮಳೆ',
    'temperature': 'ತಾಪಮಾನ',
    'humidity': 'ತೇವಾಂಶ',
    'recommendation': 'ಶಿಫಾರಸು',
    'NPK': 'NPK',
    'pH': 'pH'
  },
  ml: { // Malayalam
    'crop': 'വിള',
    'soil': 'മണ്ണ്',
    'fertilizer': 'വളം',
    'harvest': 'വിളവെടുപ്പ്',
    'irrigation': 'ജലസേചനം',
    'pesticide': 'കീടനാശിനി',
    'yield': 'വിളവ്',
    'farmer': 'കർഷകൻ',
    'seeds': 'വിത്തുകൾ',
    'rainfall': 'മഴ',
    'temperature': 'താപനില',
    'humidity': 'ഈർപ്പം',
    'recommendation': 'ശുപാർശ',
    'NPK': 'NPK',
    'pH': 'pH'
  },
  or: { // Odia
    'crop': 'ଫସଲ',
    'soil': 'ମାଟି',
    'fertilizer': 'ସାର',
    'harvest': 'ଅମଳ',
    'irrigation': 'ଜଳସେଚନ',
    'pesticide': 'କୀଟନାଶକ',
    'yield': 'ଉତ୍ପାଦନ',
    'farmer': 'କୃଷକ',
    'seeds': 'ମଞ୍ଜି',
    'rainfall': 'ବର୍ଷା',
    'temperature': 'ତାପମାତ୍ରା',
    'humidity': 'ଆର୍ଦ୍ରତା',
    'recommendation': 'ସୁପାରିଶ',
    'NPK': 'NPK',
    'pH': 'pH'
  },
  as: { // Assamese
    'crop': 'শস্য',
    'soil': 'মাটি',
    'fertilizer': 'সাৰ',
    'harvest': 'শস্য চপোৱা',
    'irrigation': 'জলসিঞ্চন',
    'pesticide': 'কীটনাশক',
    'yield': 'উৎপাদন',
    'farmer': 'কৃষক',
    'seeds': 'বীজ',
    'rainfall': 'বৰষুণ',
    'temperature': 'উষ্ণতা',
    'humidity': 'আৰ্দ্ৰতা',
    'recommendation': 'পৰামৰ্শ',
    'NPK': 'NPK',
    'pH': 'pH'
  }
};

// Language code mapping for LibreTranslate
const LANGUAGE_CODE_MAP = {
  'en': 'en',
  'hi': 'hi',
  'mr': 'mr',
  'pa': 'pa',
  'ta': 'ta',
  'te': 'te',
  'bn': 'bn',
  'gu': 'gu',
  'kn': 'kn',
  'ml': 'ml',
  'or': 'or',
  'as': 'as'
};

/**
 * Translate text using LibreTranslate API
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (default: 'en')
 * @returns {Promise<string>} Translated text
 */
export async function translateText(text, targetLang, sourceLang = 'en') {
  try {
    // Check if translation needed
    if (sourceLang === targetLang) {
      return text;
    }

    // Try MyMemory API (more reliable, free)
    try {
      const response = await fetch(
        `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.responseData && data.responseData.translatedText) {
          let translatedText = data.responseData.translatedText;
          
          // Apply farming terminology overrides
          const overrides = FARMING_TERMINOLOGY[targetLang];
          if (overrides) {
            for (const [english, translation] of Object.entries(overrides)) {
              const regex = new RegExp(`\\b${english}\\b`, 'gi');
              translatedText = translatedText.replace(regex, translation);
            }
          }
          
          return translatedText;
        }
      }
    } catch (myMemoryError) {
      console.warn('MyMemory API failed, trying LibreTranslate...');
    }

    // Fallback to LibreTranslate
    const response = await fetch(LIBRETRANSLATE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: text,
        source: LANGUAGE_CODE_MAP[sourceLang] || sourceLang,
        target: LANGUAGE_CODE_MAP[targetLang] || targetLang,
        format: 'text'
      })
    });

    if (!response.ok) {
      console.warn(`Translation failed: ${response.statusText}`);
      return text; // Fallback to original text
    }

    const data = await response.json();
    let translatedText = data.translatedText || text;
    
    // Apply farming terminology overrides
    const overrides = FARMING_TERMINOLOGY[targetLang];
    if (overrides) {
      for (const [english, translation] of Object.entries(overrides)) {
        const regex = new RegExp(`\\b${english}\\b`, 'gi');
        translatedText = translatedText.replace(regex, translation);
      }
    }
    
    return translatedText;

  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to original text
  }
}

/**
 * Translate an entire translation object
 * @param {object} sourceTranslations - Source translation object (typically English)
 * @param {string} targetLang - Target language code
 * @returns {Promise<object>} Translated object
 */
export async function translateObject(sourceObj, targetLang, prefix = '') {
  const translated = {};

  for (const [key, value] of Object.entries(sourceObj)) {
    if (typeof value === 'string') {
      // Translate string values
      translated[key] = await translateText(value, targetLang);
      console.log(`Translated ${prefix}${key}: ${translated[key]}`);
    } else if (typeof value === 'object' && value !== null) {
      // Recursively translate nested objects
      translated[key] = await translateObject(value, targetLang, `${prefix}${key}.`);
    } else {
      // Keep non-string, non-object values as is
      translated[key] = value;
    }
  }

  return translated;
}

/**
 * Generate complete translation for a language
 * @param {object} englishTranslations - English translation object
 * @param {string} targetLang - Target language code
 * @returns {Promise<object>} Complete translation object
 */
export async function generateLanguageTranslation(englishTranslations, targetLang) {
  console.log(`Starting translation for ${targetLang}...`);
  const translated = await translateObject(englishTranslations, targetLang);
  console.log(`Translation for ${targetLang} completed!`);
  return translated;
}

/**
 * Batch translate multiple languages
 * @param {object} englishTranslations - English translation object
 * @param {string[]} targetLangs - Array of target language codes
 * @returns {Promise<object>} Object with all translations
 */
export async function batchTranslate(englishTranslations, targetLangs) {
  const results = {};
  
  for (const lang of targetLangs) {
    results[lang] = await generateLanguageTranslation(englishTranslations, lang);
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}

export default {
  translateText,
  translateObject,
  generateLanguageTranslation,
  batchTranslate,
  FARMING_TERMINOLOGY
};
