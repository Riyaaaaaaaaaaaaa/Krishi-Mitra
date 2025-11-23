const mongoose = require('mongoose');

/**
 * Conversation Schema
 * Stores conversational AI chat history and context
 */
const conversationSchema = new mongoose.Schema({
  userId: {
    type: String,  // Changed to String to support both ObjectId and 'guest'
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'image', 'voice', 'mixed'],
      default: 'text'
    },
    imageUrl: {
      type: String
    },
    audioUrl: {
      type: String
    },
    metadata: {
      language: String,
      confidence: Number,
      intent: String,
      entities: [String]
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  context: {
    userLocation: {
      state: String,
      district: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    currentCrops: [String],
    soilData: {
      nitrogen: Number,
      phosphorus: Number,
      potassium: Number,
      pH: Number
    },
    lastRecommendation: {
      crop: String,
      confidence: Number,
      date: Date
    },
    topics: [String]
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'auto'],
    default: 'auto'
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
});

// Update lastActivity before saving
conversationSchema.pre('save', function(next) {
  this.lastActivity = Date.now();
  next();
});

module.exports = mongoose.model('Conversation', conversationSchema);
