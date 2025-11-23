import React from 'react'

export default function VoiceInput({ onTranscript }) {
  const handle = () => {
    onTranscript?.('Sample transcript')
  }
  return (
    <div className="flex items-center gap-2">
      <button onClick={handle} className="px-3 py-1 rounded bg-blue-600 text-white">Speak</button>
      <span className="text-sm text-gray-600">Voice input stub</span>
    </div>
  )
}