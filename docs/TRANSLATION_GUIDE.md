# 🌍 Translation System Guide

## Overview

KrishiCropAI uses **LibreTranslate** (free, open-source) for automated translations with **manual override** for farming-specific terminology.

## ✅ What's Implemented

### 1. Translation Utility (`src/utils/translateUtil.js`)
- LibreTranslate API integration
- Farming terminology overrides for 8 Indian languages
- Batch translation support
- Automatic fallback to English on errors

### 2. Translation Generator Script (`generateTranslations.js`)
- Command-line tool to generate translations
- Processes entire translation objects
- Outputs JSON file with all translations
- Built-in rate limiting to avoid API throttling

### 3. Translation Manager Component (`src/components/TranslationManager.jsx`)
- Browser-based UI for testing translations
- Live preview of translated text
- Farming terminology display
- Batch translation with download

## 🚀 Quick Start

### Option 1: Using the Script (Recommended for bulk translation)

```bash
cd frontend
npm run translate
```

This will:
- Generate translations for all 8 languages (Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, Odia, Assamese)
- Save to `translations-generated.json`
- Takes ~5-10 minutes due to API rate limiting

### Option 2: Using the UI Component

1. Import the component in your app:
```javascript
import TranslationManager from './components/TranslationManager';

// In your App.jsx or Routes
<Route path="/translate" element={<TranslationManager />} />
```

2. Visit `http://localhost:5173/translate`
3. Select language, enter text, translate!

## 📋 Farming Terminology

The system automatically replaces English farming terms with accurate local translations:

| English | Tamil | Telugu | Bengali | Gujarati | Kannada | Malayalam | Odia | Assamese |
|---------|-------|--------|---------|----------|---------|-----------|------|----------|
| crop | பயிர் | పంట | ফসল | પાક | ಬೆಳೆ | വിള | ଫସଲ | শস্য |
| soil | மண் | నేల | মাটি | માટી | ಮಣ್ಣು | മണ്ണ് | ମାଟି | মাটি |
| farmer | விவசாயி | రైతు | কৃষক | ખેડૂત | ರೈತ | കർഷകൻ | କୃଷକ | কৃষক |
| fertilizer | உரம் | ఎరువు | সার | ખાતર | ಗೊಬ್ಬರ | വളം | ସାର | সাৰ |

**15+ farming terms** are pre-configured for each language.

## 🔧 How It Works

### Translation Flow:
```
English Text
    ↓
LibreTranslate API (auto-translation)
    ↓
Farming Terminology Override (domain-specific)
    ↓
Final Translated Text
```

### Example:
```javascript
Input:  "Get crop recommendations for your soil"
Auto:   "உங்கள் மண்ணிற்கு crop பரிந்துரைகளைப் பெறுங்கள்"
Final:  "உங்கள் மண்ணிற்கு பயிர் பரிந்துரைகளைப் பெறுங்கள்"
         ↑ 'crop' replaced with correct Tamil term 'பயிர்'
```

## 📝 Adding New Languages

1. **Add language code mapping** in `translateUtil.js`:
```javascript
const LANGUAGE_CODE_MAP = {
  'newlang': 'nl',  // LibreTranslate code
  // ...
};
```

2. **Add farming terminology**:
```javascript
const FARMING_TERMINOLOGY = {
  newlang: {
    'crop': 'local_term',
    'soil': 'local_term',
    // ...
  }
};
```

3. **Add brand name** in `i18n.js`:
```javascript
newlang: {
  translation: {
    brand: { name: 'कृषि मित्र (in local script)' },
    // ...
  }
}
```

## 🎯 Best Practices

### 1. **Manual Review Required**
- Auto-translations are ~80-90% accurate
- **Always review** agricultural terminology
- Test with native speakers

### 2. **Rate Limiting**
- LibreTranslate free tier: limited requests/minute
- Script includes automatic delays
- For large batches, use self-hosted LibreTranslate

### 3. **Terminology Override**
- Add domain-specific terms to `FARMING_TERMINOLOGY`
- Keep agricultural jargon consistent
- Use regional dialects when appropriate

### 4. **Fallback Strategy**
```javascript
// If translation fails → return original English
// If key missing → fallback to English (i18next config)
fallbackLng: 'en'
```

## 🆓 LibreTranslate Options

### Free API (Current)
- URL: `https://libretranslate.com/translate`
- Rate Limited
- Good for testing

### Self-Hosted (Production)
```bash
# Docker deployment
docker run -d -p 5000:5000 libretranslate/libretranslate

# Update API URL in translateUtil.js
const LIBRETRANSLATE_API = 'http://localhost:5000/translate';
```

Benefits:
- No rate limits
- Better performance
- Privacy (data stays on your server)

## 📊 Current Status

| Language | Status | Brand Name | Completion |
|----------|--------|------------|------------|
| English | ✅ Complete | Krishi Mitra | 100% |
| Hindi | ✅ Complete | कृषि मित्र | 100% |
| Marathi | ✅ Complete | कृषि मित्र | 100% |
| Punjabi | ✅ Complete | ਕ੍ਰਿਸ਼ੀ ਮਿੱਤਰ | 100% |
| Tamil | 🔄 Auto-translate | கிரிஷி மித்ர | Ready |
| Telugu | 🔄 Auto-translate | కృషి మిత్ర | Ready |
| Bengali | 🔄 Auto-translate | কৃষি মিত্র | Ready |
| Gujarati | 🔄 Auto-translate | કૃષિ મિત્ર | Ready |
| Kannada | 🔄 Auto-translate | ಕೃಷಿ ಮಿತ್ರ | Ready |
| Malayalam | 🔄 Auto-translate | കൃഷി മിത്ര | Ready |
| Odia | 🔄 Auto-translate | କୃଷି ମିତ୍ର | Ready |
| Assamese | 🔄 Auto-translate | কৃষি মিত্ৰ | Ready |

## 🚀 Next Steps

1. **Run the translation script**:
   ```bash
   npm run translate
   ```

2. **Review generated translations**:
   - Check `translations-generated.json`
   - Verify farming terminology accuracy
   - Test with native speakers

3. **Update i18n.js**:
   - Copy translations from JSON
   - Paste into respective language sections
   - Test language switching

4. **Optional: Deploy self-hosted LibreTranslate** for production

## 🆘 Troubleshooting

### Issue: "Translation failed"
- Check internet connection
- API might be rate-limited (wait 1 minute)
- Try self-hosted LibreTranslate

### Issue: "Incorrect terminology"
- Add term to `FARMING_TERMINOLOGY` object
- Re-run translation
- Manual correction in i18n.js

### Issue: "Slow translation"
- Normal due to rate limiting
- Increase delays in script
- Use self-hosted instance

## 📚 Resources

- [LibreTranslate Docs](https://github.com/LibreTranslate/LibreTranslate)
- [LibreTranslate API](https://libretranslate.com/)
- [i18next Documentation](https://www.i18next.com/)

---

**Need help?** The translation system is designed to be flexible. You can:
- Use the UI for quick translations
- Run the script for bulk operations
- Manually edit i18n.js for fine-tuning
