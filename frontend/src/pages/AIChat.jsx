import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function AIChat() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const fileInputRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

  useEffect(() => {
    console.log('AIChat component mounted');
    // Initialize speech recognition
    initializeSpeechRecognition();
    
    // Initialize with welcome message
    try {
      const welcomeMessage = {
        role: 'assistant',
        content: t('app.ai.welcome') || '👋 Hello! I\'m your Krishi Mitra AI assistant. I can help you with crop recommendations, disease identification, fertilizer guidance, market prices, weather forecasts, and government schemes. What would you like to know?',
        suggestions: [
          t('app.ai.suggestions.cropRecommendation') || 'Recommend crops',
          t('app.ai.suggestions.marketPrices') || 'Check market prices',
          t('app.ai.suggestions.govtSchemes') || 'Government schemes',
          t('app.ai.suggestions.weather') || 'Weather forecast'
        ]
      };
      console.log('Welcome message:', welcomeMessage);
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error initializing AI Chat:', error);
      setMessages([{
        role: 'assistant',
        content: '👋 Hello! How can I help you today?',
        suggestions: ['Recommend crops', 'Check market prices', 'Government schemes', 'Weather forecast']
      }]);
    }
    
    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current.speaking) {
        synthRef.current.cancel();
      }
    };
  }, [t]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (messageText = null, imageData = null) => {
    const textToSend = messageText || inputMessage.trim();
    const imageToSend = imageData || selectedImage;
    
    if (!textToSend && !imageToSend) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id || 'guest';

    // Add user message to UI
    const userMessage = { 
      role: 'user', 
      content: textToSend || '📷 Image uploaded',
      image: imagePreview
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSelectedImage(null);
    setImagePreview(null);
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const requestBody = {
        userId,
        sessionId,
        message: textToSend || 'Identify this plant/disease',
        type: imageToSend ? 'image' : 'text',
        language: i18n.language
      };

      if (imageToSend) {
        requestBody.imageData = imageToSend;
      }

      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success) {
        // Save session ID if new
        if (data.sessionId && !sessionId) {
          setSessionId(data.sessionId);
        }

        // Add AI response to UI
        const aiMessage = {
          role: 'assistant',
          content: data.response.text,
          suggestions: data.response.suggestions || []
        };
        setMessages(prev => [...prev, aiMessage]);
        setShowSuggestions(data.response.suggestions?.length > 0);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.',
        suggestions: []
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: t('app.ai.welcome') || '👋 Hello! How can I help you today?',
      suggestions: [
        'Recommend crops',
        'Check market prices',
        'Government schemes',
        'Weather forecast'
      ]
    }]);
    setSessionId(null);
    setShowSuggestions(true);
  };

  // Initialize Speech Recognition
  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Set language based on current locale
      const currentLang = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
      recognitionRef.current.lang = currentLang;
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsRecording(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'no-speech') {
          alert(t('app.ai.voice.noSpeech') || 'No speech detected. Please try again.');
        }
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  };

  // Start voice recording
  const startVoiceRecording = () => {
    if (recognitionRef.current) {
      // Update language if changed
      const currentLang = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
      recognitionRef.current.lang = currentLang;
      
      setIsRecording(true);
      recognitionRef.current.start();
    } else {
      alert(t('app.ai.voice.notSupported') || 'Voice recognition is not supported in your browser.');
    }
  };

  // Stop voice recording
  const stopVoiceRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Text to speech - speak the message
  const speakMessage = (text) => {
    if (synthRef.current) {
      // Cancel any ongoing speech
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language based on current locale
      utterance.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
      };
      
      synthRef.current.speak(utterance);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Handle image file selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setSelectedImage(base64String);
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear selected image
  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t('app.ai.title') || 'AI Assistant'}</h1>
              <p className="text-sm text-green-100">{t('app.ai.subtitle') || 'Your Farming Companion'}</p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
          >
            🔄 {t('app.ai.clearChat') || 'Clear Chat'}
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index}>
            {/* Message Bubble */}
            <div
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-start gap-2">
                <div
                  className={`max-w-3xl px-6 py-4 rounded-2xl shadow-md ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  {/* Show image if present */}
                  {message.image && (
                    <div className="mb-3">
                      <img 
                        src={message.image} 
                        alt="Uploaded" 
                        className="max-w-xs rounded-lg border-2 border-white/30"
                      />
                    </div>
                  )}
                  <div className="whitespace-pre-wrap break-words">{message.content}</div>
                </div>
                {/* Speaker button for AI messages */}
                {message.role === 'assistant' && (
                  <button
                    onClick={() => isSpeaking ? stopSpeaking() : speakMessage(message.content)}
                    className={`p-2 rounded-full transition-colors ${
                      isSpeaking 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    }`}
                    title={isSpeaking ? (t('app.ai.voice.stopSpeaking') || 'Stop speaking') : (t('app.ai.voice.speak') || 'Speak message')}
                  >
                    {isSpeaking ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Suggestions */}
            {message.role === 'assistant' && message.suggestions && message.suggestions.length > 0 && showSuggestions && index === messages.length - 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 bg-white border-2 border-green-500 text-green-700 rounded-full hover:bg-green-50 transition-colors text-sm font-medium shadow-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-3xl px-6 py-4 rounded-2xl bg-white shadow-md border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm">{t('app.ai.thinking') || 'Thinking...'}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
        {/* Recording Indicator */}
        {isRecording && (
          <div className="mb-3 flex items-center justify-center gap-2 text-red-600 animate-pulse">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="8" />
            </svg>
            <span className="text-sm font-medium">{t('app.ai.voice.listening') || 'Listening...'}</span>
          </div>
        )}

        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="max-w-xs rounded-lg border-2 border-green-500"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('app.ai.inputPlaceholder') || 'Type your question... (Press Enter to send)'}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl resize-none focus:outline-none focus:border-green-500 transition-colors"
              rows="2"
              disabled={isLoading || isRecording}
            />
          </div>
          {/* Image Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isRecording}
            className="px-4 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md font-medium"
            title="Upload image for disease identification"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          {/* Microphone Button */}
          <button
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            disabled={isLoading}
            className={`px-4 py-3 rounded-xl transition-all shadow-md font-medium ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isRecording ? (t('app.ai.voice.stopRecording') || 'Stop recording') : (t('app.ai.voice.startRecording') || 'Start voice input')}
          >
            {isRecording ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
          </button>
          {/* Send Button */}
          <button
            onClick={() => sendMessage()}
            disabled={(!inputMessage.trim() && !selectedImage) || isLoading || isRecording}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md font-medium"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => sendMessage('What crop should I plant?')}
            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium hover:bg-green-200 transition-colors"
          >
            🌾 {t('app.ai.quickActions.cropAdvice') || 'Crop Advice'}
          </button>
          <button
            onClick={() => sendMessage('Check market prices')}
            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
          >
            💰 {t('app.ai.quickActions.prices') || 'Prices'}
          </button>
          <button
            onClick={() => sendMessage('Weather forecast')}
            className="px-3 py-1.5 bg-sky-100 text-sky-700 rounded-full text-xs font-medium hover:bg-sky-200 transition-colors"
          >
            🌦️ {t('app.ai.quickActions.weather') || 'Weather'}
          </button>
          <button
            onClick={() => sendMessage('Government schemes')}
            className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors"
          >
            🏛️ {t('app.ai.quickActions.schemes') || 'Schemes'}
          </button>
        </div>
      </div>
    </div>
  );
}
