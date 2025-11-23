const webpush = require('web-push');
const User = require('../models/User');
const emailService = require('../utils/emailService');

class NotificationService {
  constructor() {
    this.initializeWebPush();
  }

  // Initialize Web Push with VAPID keys
  initializeWebPush() {
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidEmail = process.env.VAPID_EMAIL || 'admin@krishimitra.com';

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn('⚠️  [NotificationService] VAPID keys not configured. Push notifications will be disabled.');
      console.log('   Generate keys with: npx web-push generate-vapid-keys');
      return;
    }

    webpush.setVapidDetails(
      `mailto:${vapidEmail}`,
      vapidPublicKey,
      vapidPrivateKey
    );

    console.log('✅ [NotificationService] Web Push initialized');
  }

  // Subscribe user to push notifications
  async subscribePush(userId, subscription) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if subscription already exists
      const exists = user.pushSubscriptions.some(
        sub => sub.endpoint === subscription.endpoint
      );

      if (!exists) {
        user.pushSubscriptions.push({
          endpoint: subscription.endpoint,
          keys: subscription.keys,
          userAgent: subscription.userAgent || 'Unknown'
        });
        await user.save();
      }

      console.log(`✅ [NotificationService] Push subscription added for user: ${userId}`);
      return true;
    } catch (error) {
      console.error('[NotificationService] Subscribe error:', error.message);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribePush(userId, endpoint) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.pushSubscriptions = user.pushSubscriptions.filter(
        sub => sub.endpoint !== endpoint
      );
      await user.save();

      console.log(`✅ [NotificationService] Push subscription removed for user: ${userId}`);
      return true;
    } catch (error) {
      console.error('[NotificationService] Unsubscribe error:', error.message);
      throw error;
    }
  }

  // Send push notification to user
  async sendPushToUser(userId, notification) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.preferences.notifications.push) {
        return { sent: 0, failed: 0 };
      }

      const language = user.preferences.language || 'en';
      const localizedNotification = this.localizeNotification(notification, language);

      let sent = 0;
      let failed = 0;

      for (const subscription of user.pushSubscriptions) {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: subscription.keys
            },
            JSON.stringify(localizedNotification)
          );
          sent++;
        } catch (error) {
          console.error(`[NotificationService] Failed to send to endpoint:`, error.message);
          
          // Remove invalid subscriptions (410 Gone)
          if (error.statusCode === 410) {
            await this.unsubscribePush(userId, subscription.endpoint);
          }
          failed++;
        }
      }

      return { sent, failed };
    } catch (error) {
      console.error('[NotificationService] Send push error:', error.message);
      return { sent: 0, failed: 1 };
    }
  }

  // Send email notification to user
  async sendEmailToUser(userId, emailData) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.preferences.notifications.email) {
        return false;
      }

      const language = user.preferences.language || 'en';
      
      // Send multilingual email
      return await emailService.sendNotificationEmail(
        user.email,
        emailData,
        user.name,
        language
      );
    } catch (error) {
      console.error('[NotificationService] Send email error:', error.message);
      return false;
    }
  }

  // Send notification through all enabled channels
  async sendNotification(userId, notificationData) {
    const results = {
      push: { sent: 0, failed: 0 },
      email: false
    };

    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check notification type preferences
      const { type } = notificationData;
      const typeEnabled = user.preferences.notifications.types?.[type];
      
      if (typeEnabled === false) {
        console.log(`[NotificationService] ${type} notifications disabled for user ${userId}`);
        return results;
      }

      // Send push notification
      if (user.preferences.notifications.push) {
        results.push = await this.sendPushToUser(userId, notificationData);
      }

      // Send email notification for critical alerts
      if (user.preferences.notifications.email && notificationData.critical) {
        results.email = await this.sendEmailToUser(userId, notificationData);
      }

      console.log(`✅ [NotificationService] Notification sent to user ${userId}:`, results);
      return results;
    } catch (error) {
      console.error('[NotificationService] Send notification error:', error.message);
      return results;
    }
  }

  // Localize notification content
  localizeNotification(notification, language) {
    if (!notification.translations || language === 'en') {
      return notification;
    }

    const translated = notification.translations[language];
    if (!translated) {
      return notification;
    }

    return {
      ...notification,
      title: translated.title || notification.title,
      body: translated.body || notification.body,
      data: {
        ...notification.data,
        ...translated.data
      }
    };
  }

  // Get VAPID public key
  getVapidPublicKey() {
    return process.env.VAPID_PUBLIC_KEY || null;
  }
}

// Export singleton instance
const notificationService = new NotificationService();
module.exports = notificationService;
