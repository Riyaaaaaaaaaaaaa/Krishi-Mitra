// Notification utility for frontend
// Use this to send notifications from anywhere in the app

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Add in-app notification to localStorage
 * @param {string} type - Notification type: 'priceAlerts', 'weatherAlerts', 'cropAlerts', 'soilAlerts', 'system'
 * @param {string} title - Notification title (English)
 * @param {string} body - Notification body (English)
 * @param {object} data - Additional data
 * @param {object} translations - Hindi translations { hi: { title, body } }
 */
export const addInAppNotification = (type, title, body, data = {}, translations = {}) => {
  try {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    const newNotification = {
      id: Date.now() + Math.random(),
      type,
      title,
      body,
      data,
      translations,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    notifications.unshift(newNotification);
    
    // Keep only last 50 notifications
    if (notifications.length > 50) {
      notifications.splice(50);
    }
    
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // Dispatch custom event to update notification bell
    window.dispatchEvent(new Event('notificationAdded'));
    
    return newNotification;
  } catch (error) {
    console.error('Error adding notification:', error);
  }
};

/**
 * Send notification to user
 * @param {string} type - Notification type: 'priceAlerts', 'weatherAlerts', 'cropAlerts', 'soilAlerts'
 * @param {string} title - Notification title (English)
 * @param {string} body - Notification body (English)
 * @param {object} data - Additional data
 * @param {object} translations - Hindi translations { hi: { title, body } }
 * @returns {Promise}
 */
export const sendNotification = async (type, title, body, data = {}, translations = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No auth token found, cannot send notification');
      return;
    }

    const notification = {
      type,
      title,
      body,
      data,
      translations
    };

    const response = await axios.post(
      `${API_BASE_URL}/notifications/send`,
      { notification },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

/**
 * Subscribe to push notifications
 * @returns {Promise}
 */
export const subscribeToPushNotifications = async () => {
  try {
    // Check for notification support
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications not supported');
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // Get VAPID public key
    const token = localStorage.getItem('token');
    const vapidResponse = await axios.get(`${API_BASE_URL}/notifications/vapid-public-key`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const vapidPublicKey = vapidResponse.data.publicKey;

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    // Send subscription to backend
    await axios.post(
      `${API_BASE_URL}/notifications/subscribe`,
      { subscription },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return { success: true, subscription };
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    throw error;
  }
};

/**
 * Update notification preferences
 * @param {object} preferences - { email, push, sms, types: { priceAlerts, weatherAlerts, cropAlerts, soilAlerts } }
 * @returns {Promise}
 */
export const updateNotificationPreferences = async (preferences) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `${API_BASE_URL}/notifications/preferences`,
      { preferences },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};

/**
 * Get notification preferences
 * @returns {Promise}
 */
export const getNotificationPreferences = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/notifications/preferences`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    throw error;
  }
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Example usage:
/*
// Send a price alert
sendNotification(
  'priceAlerts',
  'Rice Price Alert',
  'Rice price has increased by 15% to ₹2,100/quintal',
  { crop: 'Rice', price: 2100, change: 15 },
  {
    hi: {
      title: 'चावल मूल्य अलर्ट',
      body: 'चावल की कीमत 15% बढ़कर ₹2,100/क्विंटल हो गई है'
    }
  }
);

// Send a weather alert
sendNotification(
  'weatherAlerts',
  'Heavy Rainfall Warning',
  'Heavy rain expected in your area tomorrow. Take necessary precautions.',
  { location: 'Ranchi', rainfall: 'heavy', date: '2024-01-15' },
  {
    hi: {
      title: 'भारी वर्षा चेतावनी',
      body: 'कल आपके क्षेत्र में भारी बारिश की उम्मीद है। आवश्यक सावधानी बरतें।'
    }
  }
);

// Send a crop alert
sendNotification(
  'cropAlerts',
  'Harvest Reminder',
  'Your wheat crop is ready for harvest in 5 days',
  { crop: 'Wheat', daysToHarvest: 5 },
  {
    hi: {
      title: 'कटाई अनुस्मारक',
      body: 'आपकी गेहूं की फसल 5 दिनों में कटाई के लिए तैयार है'
    }
  }
);

// Send a soil alert
sendNotification(
  'soilAlerts',
  'Soil Health Update',
  'Nitrogen levels are low. Consider adding fertilizer.',
  { nutrient: 'nitrogen', level: 'low' },
  {
    hi: {
      title: 'मिट्टी स्वास्थ्य अद्यतन',
      body: 'नाइट्रोजन का स्तर कम है। उर्वरक जोड़ने पर विचार करें।'
    }
  }
);
*/
