/**
 * Translation Manager Component
 * UI for generating and managing translations using LibreTranslate
 */

import React, { useState } from 'react';
import { translateText, FARMING_TERMINOLOGY } from '../utils/translateUtil';

const LANGUAGES = [
  { code: 'ta', name: 'Tamil - தமிழ்', brandName: 'கிரிஷி மித்ர' },
  { code: 'te', name: 'Telugu - తెలుగు', brandName: 'కృషి మిత్ర' },
  { code: 'bn', name: 'Bengali - বাংলা', brandName: 'কৃষি মিত্র' },
  { code: 'gu', name: 'Gujarati - ગુજરાતી', brandName: 'કૃષિ મિત્ર' },
  { code: 'kn', name: 'Kannada - ಕನ್ನಡ', brandName: 'ಕೃಷಿ ಮಿತ್ರ' },
  { code: 'ml', name: 'Malayalam - മലയാളം', brandName: 'കൃഷി മിത്ര' },
  { code: 'or', name: 'Odia - ଓଡ଼ିଆ', brandName: 'କୃଷି ମିତ୍ର' },
  { code: 'as', name: 'Assamese - অসমীয়া', brandName: 'কৃষি মিত্ৰ' }
];

export default function TranslationManager() {
  const [selectedLang, setSelectedLang] = useState('ta');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [batchProgress, setBatchProgress] = useState('');

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    setIsTranslating(true);
    try {
      const result = await translateText(inputText, selectedLang);
      setTranslatedText(result);
    } catch (error) {
      console.error('Translation error:', error);
      alert('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const generateAllTranslations = async () => {
    setBatchProgress('Starting batch translation...');
    
    // Sample text for demonstration
    const sampleTexts = [
      'Smart Crop Recommendations for Indian Farmers',
      'AI-Powered Agricultural Intelligence',
      'Get personalized crop recommendations'
    ];
    
    const results = {};
    
    for (const lang of LANGUAGES) {
      setBatchProgress(`Translating to ${lang.name}...`);
      results[lang.code] = {};
      
      for (const text of sampleTexts) {
        const translated = await translateText(text, lang.code);
        results[lang.code][text] = translated;
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
      }
    }
    
    setBatchProgress('Batch translation complete!');
    console.log('Translation Results:', results);
    
    // Download as JSON
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'translations.json';
    a.click();
  };

  const currentLang = LANGUAGES.find(l => l.code === selectedLang);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl">🌐</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Translation Manager</h1>
              <p className="text-gray-600">LibreTranslate + Farming Terminology</p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Target Language
            </label>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-2">
              Brand name: <span className="font-semibold">{currentLang?.brandName}</span>
            </p>
          </div>

          {/* Input Text */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              English Text
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter English text to translate..."
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 h-32 focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
          </div>

          {/* Translate Button */}
          <button
            onClick={handleTranslate}
            disabled={isTranslating || !inputText.trim()}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-6"
          >
            {isTranslating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Translating...
              </span>
            ) : (
              '🌍 Translate'
            )}
          </button>

          {/* Translated Output */}
          {translatedText && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Translated Text ({currentLang?.name})
              </label>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg px-4 py-3 min-h-32">
                <p className="text-lg">{translatedText}</p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(translatedText)}
                className="mt-2 text-sm text-green-600 hover:text-green-700 font-semibold"
              >
                📋 Copy to Clipboard
              </button>
            </div>
          )}

          {/* Farming Terminology */}
          <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">🌾 Farming Terminology Overrides</h3>
            <p className="text-sm text-gray-600 mb-2">
              These terms are automatically replaced for better accuracy:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {FARMING_TERMINOLOGY[selectedLang] && Object.entries(FARMING_TERMINOLOGY[selectedLang]).slice(0, 8).map(([en, local]) => (
                <div key={en} className="bg-white rounded px-2 py-1 border border-amber-200">
                  <span className="text-gray-600">{en}</span>
                  <span className="mx-1">→</span>
                  <span className="font-semibold">{local}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Batch Translation */}
          <div className="border-t-2 border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Batch Translation</h3>
            <p className="text-sm text-gray-600 mb-4">
              Generate translations for all languages at once (useful for testing)
            </p>
            <button
              onClick={generateAllTranslations}
              className="bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              🚀 Generate All Translations
            </button>
            {batchProgress && (
              <p className="mt-3 text-sm text-blue-600 font-semibold">{batchProgress}</p>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">📖 How to Use</h3>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Select the target language from the dropdown</li>
              <li>Enter English text in the input box</li>
              <li>Click "Translate" to get the translation</li>
              <li>Farming terms are automatically corrected for accuracy</li>
              <li>Use "Generate All Translations" to create a JSON file for all languages</li>
              <li>Copy the translations and paste into your i18n.js file</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
