const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const aiService = require('../services/conversationalAI');
const crypto = require('crypto');

// Generate UUID using crypto instead of uuid package
function generateSessionId() {
  return crypto.randomUUID();
}

/**
 * POST /api/ai/chat
 * Send a message to the AI assistant
 * Body: { userId, sessionId, message, type: 'text'|'voice'|'image', imageData, audioData, context }
 */
router.post('/chat', async (req, res) => {
  try {
    const { userId, sessionId, message, type = 'text', imageData, audioData, context, language = 'en' } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        error: 'userId and message are required'
      });
    }

    const actualSessionId = sessionId || generateSessionId();

    // Find or create conversation
    let conversation = await Conversation.findOne({ userId, sessionId: actualSessionId, active: true });
    
    if (!conversation) {
      conversation = new Conversation({
        userId,
        sessionId: actualSessionId,
        messages: [],
        context: context || {},
        language: language // Save user's preferred language
      });
    } else {
      // Update language if it changed
      conversation.language = language;
    }

    // Detect intent and extract entities
    const intent = aiService.detectIntent(message);
    const entities = aiService.extractEntities(message);

    // Add user message to conversation
    conversation.messages.push({
      role: 'user',
      content: message,
      type: type,
      imageUrl: imageData ? 'uploaded' : null,
      audioUrl: audioData ? 'uploaded' : null,
      metadata: {
        intent: intent,
        entities: entities.map(e => `${e.type}:${e.value}`)
      }
    });

    // Process based on type
    let aiResponse;
    
    if (type === 'image' && imageData) {
      aiResponse = await aiService.processImageQuery(imageData, message);
      conversation.messages.push({
        role: 'assistant',
        content: aiResponse.message,
        type: 'text',
        metadata: {
          confidence: aiResponse.analysis?.confidence || 0
        }
      });
    } else if (type === 'voice' && audioData) {
      aiResponse = await aiService.processVoiceQuery(audioData);
      conversation.messages.push({
        role: 'assistant',
        content: aiResponse.message,
        type: 'text'
      });
    } else {
      // Text-based conversation
      const response = await aiService.generateResponse(
        message,
        intent,
        entities,
        conversation.context,
        language // Pass language to generate response
      );
      
      conversation.messages.push({
        role: 'assistant',
        content: response.text,
        type: 'text',
        metadata: {
          intent: intent,
          suggestions: response.suggestions
        }
      });

      aiResponse = response;
    }

    // Update context if provided
    if (context) {
      conversation.context = { ...conversation.context, ...context };
    }

    await conversation.save();

    res.json({
      success: true,
      sessionId: actualSessionId,
      response: {
        text: aiResponse.text || aiResponse.message,
        suggestions: aiResponse.suggestions || [],
        data: aiResponse.data || null
      },
      metadata: {
        intent: intent,
        entities: entities
      }
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message'
    });
  }
});

/**
 * GET /api/ai/conversation/:sessionId
 * Get conversation history
 */
router.get('/conversation/:sessionId', async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ 
      sessionId: req.params.sessionId,
      active: true 
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      conversation: {
        sessionId: conversation.sessionId,
        messages: conversation.messages,
        context: conversation.context,
        language: conversation.language,
        createdAt: conversation.createdAt,
        lastActivity: conversation.lastActivity
      }
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversation'
    });
  }
});

/**
 * GET /api/ai/conversations/:userId
 * Get all conversations for a user
 */
router.get('/conversations/:userId', async (req, res) => {
  try {
    const conversations = await Conversation.find({ 
      userId: req.params.userId,
      active: true 
    })
    .sort({ lastActivity: -1 })
    .limit(20);

    res.json({
      success: true,
      count: conversations.length,
      conversations: conversations.map(conv => ({
        sessionId: conv.sessionId,
        messageCount: conv.messages.length,
        lastMessage: conv.messages[conv.messages.length - 1]?.content?.substring(0, 100),
        lastActivity: conv.lastActivity,
        topics: conv.context.topics || []
      }))
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations'
    });
  }
});

/**
 * POST /api/ai/conversation/:sessionId/context
 * Update conversation context
 */
router.post('/conversation/:sessionId/context', async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ 
      sessionId: req.params.sessionId,
      active: true 
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    conversation.context = { ...conversation.context, ...req.body };
    await conversation.save();

    res.json({
      success: true,
      message: 'Context updated',
      context: conversation.context
    });
  } catch (error) {
    console.error('Error updating context:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update context'
    });
  }
});

/**
 * DELETE /api/ai/conversation/:sessionId
 * End/delete a conversation
 */
router.delete('/conversation/:sessionId', async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ 
      sessionId: req.params.sessionId 
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    conversation.active = false;
    await conversation.save();

    res.json({
      success: true,
      message: 'Conversation ended'
    });
  } catch (error) {
    console.error('Error ending conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end conversation'
    });
  }
});

/**
 * GET /api/ai/knowledge/:topic
 * Get knowledge base information on a topic
 */
router.get('/knowledge/:topic', (req, res) => {
  try {
    const topic = req.params.topic.toLowerCase();
    const knowledgeBase = aiService.knowledgeBase;

    let data = null;

    // Search in crops
    if (knowledgeBase.crops[topic]) {
      data = { type: 'crop', ...knowledgeBase.crops[topic] };
    }
    // Search in diseases
    else if (knowledgeBase.diseases[topic]) {
      data = { type: 'disease', ...knowledgeBase.diseases[topic] };
    }
    // Search in fertilizers
    else if (knowledgeBase.fertilizers[topic]) {
      data = { type: 'fertilizer', ...knowledgeBase.fertilizers[topic] };
    }
    // Search in schemes
    else if (knowledgeBase.schemes[topic]) {
      data = { type: 'scheme', ...knowledgeBase.schemes[topic] };
    }

    if (data) {
      res.json({
        success: true,
        topic: topic,
        data: data
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Topic not found in knowledge base'
      });
    }
  } catch (error) {
    console.error('Error fetching knowledge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch knowledge'
    });
  }
});

module.exports = router;
