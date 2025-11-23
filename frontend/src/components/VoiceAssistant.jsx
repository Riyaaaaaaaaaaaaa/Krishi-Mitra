import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function VoiceAssistant() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [listening, setListening] = useState(false)

  const start = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert(t('app.dashboard.voice.notSupported', 'Voice not supported'))
      return
    }
    const recog = new SpeechRecognition()
    recog.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-IN'
    recog.continuous = false
    recog.interimResults = false
    setListening(true)
    recog.onresult = (e) => {
      const transcript = e.results[0][0].transcript.toLowerCase()
      if (transcript.includes('soil') || transcript.includes('मिट्टी')) navigate('/soil-data')
      if (transcript.includes('recommend') || transcript.includes('सिफारिश')) navigate('/recommendations')
      if (transcript.includes('weather') || transcript.includes('मौसम')) navigate('/weather')
      setListening(false)
    }
    recog.onerror = () => {
      setListening(false)
    }
    recog.onend = () => {
      setListening(false)
    }
    recog.start()
  }

  return (
    <button onClick={start} className={`px-3 py-1 rounded ${listening ? 'bg-blue-300' : 'bg-blue-600'} text-white`} title="Speak to navigate: say Soil, Recommendations, or Weather">
      {listening ? t('app.dashboard.voice.listening', 'Listening...') : t('app.dashboard.voice.startRecording', 'Start voice')}
    </button>
  )
}