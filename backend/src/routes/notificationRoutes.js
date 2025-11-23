const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const User = require('../models/User');

// Middleware to verify user (simplified - in production use proper JWT auth)
const authMiddleware = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  req.userId = userId;
  next();
};

// Get VAPID public key for push subscription
router.get('/vapid-public-key', (req, res) => {
  const publicKey = notificationService.getVapidPublicKey();
  if (!publicKey) {
    return res.status(503).json({ 
      error: 'Push notifications not configured',
      message: 'VAPID keys missing' 
    });
  }
  res.json({ publicKey });
});

// Subscribe to push notifications
router.post('/subscribe', authMiddleware, async (req, res) => {
  try {
    const { subscription } = req.body;
    
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription data' });
    }

    await notificationService.subscribePush(req.userId, subscription);
    res.json({ 
      success: true,
      message: 'Push notification subscription successful' 
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// Unsubscribe from push notifications
router.post('/unsubscribe', authMiddleware, async (req, res) => {
  try {
    const { endpoint } = req.body;
    
    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint required' });
    }

    await notificationService.unsubscribePush(req.userId, endpoint);
    res.json({ 
      success: true,
      message: 'Push notification unsubscription successful' 
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// Update notification preferences
router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    const { preferences } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update notification preferences
    if (preferences.email !== undefined) {
      user.preferences.notifications.email = preferences.email;
    }
    if (preferences.sms !== undefined) {
      user.preferences.notifications.sms = preferences.sms;
    }
    if (preferences.push !== undefined) {
      user.preferences.notifications.push = preferences.push;
    }
    
    // Update notification types
    if (preferences.types) {
      user.preferences.notifications.types = {
        ...user.preferences.notifications.types,
        ...preferences.types
      };
    }

    await user.save();

    res.json({ 
      success: true,
      preferences: user.preferences.notifications
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Get notification preferences
router.get('/preferences', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      success: true,
      preferences: user.preferences.notifications,
      language: user.preferences.language
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to get preferences' });
  }
});

// Send test notification (for testing purposes)
router.post('/test', authMiddleware, async (req, res) => {
  try {
    const testNotification = {
      type: 'cropAlerts',
      title: 'Test Notification',
      body: 'This is a test notification from Krishi Mitra!',
      translations: {
        hi: {
          title: 'परीक्षण सूचना',
          body: 'यह कृषि मित्र से एक परीक्षण सूचना है!'
        }
      },
      data: {
        url: '/dashboard',
        timestamp: new Date().toISOString()
      },
      icon: '/logo.png',
      badge: '/badge.png',
      critical: false
    };

    const result = await notificationService.sendNotification(req.userId, testNotification);
    res.json({ 
      success: true,
      result
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

module.exports = router;
