// Demo function to add sample notifications
// Call these from console or button to test the notification system

import { addInAppNotification } from './notificationUtils';

// Add demo price alert
export const addDemoPriceAlert = () => {
  addInAppNotification(
    'priceAlerts',
    'Rice Price Alert',
    'Rice price has increased by 15% to ₹2,100/quintal. Good time to sell!',
    { crop: 'Rice', price: 2100, change: 15 },
    {
      hi: {
        title: 'चावल मूल्य अलर्ट',
        body: 'चावल की कीमत 15% बढ़कर ₹2,100/क्विंटल हो गई है। बेचने का अच्छा समय!'
      }
    }
  );
};

// Add demo weather alert
export const addDemoWeatherAlert = () => {
  addInAppNotification(
    'weatherAlerts',
    'Heavy Rainfall Warning',
    'Heavy rain expected in your area tomorrow. Take necessary precautions for your crops.',
    { location: 'Ranchi', rainfall: 'heavy', date: new Date().toISOString() },
    {
      hi: {
        title: 'भारी वर्षा चेतावनी',
        body: 'कल आपके क्षेत्र में भारी बारिश की उम्मीद है। अपनी फसलों के लिए आवश्यक सावधानी बरतें।'
      }
    }
  );
};

// Add demo crop alert
export const addDemoCropAlert = () => {
  addInAppNotification(
    'cropAlerts',
    'Harvest Reminder',
    'Your wheat crop is ready for harvest in 5 days. Prepare equipment and labor.',
    { crop: 'Wheat', daysToHarvest: 5 },
    {
      hi: {
        title: 'कटाई अनुस्मारक',
        body: 'आपकी गेहूं की फसल 5 दिनों में कटाई के लिए तैयार है। उपकरण और श्रमिक तैयार रखें।'
      }
    }
  );
};

// Add demo soil alert
export const addDemoSoilAlert = () => {
  addInAppNotification(
    'soilAlerts',
    'Soil Health Update',
    'Nitrogen levels are low (25 kg/ha). Consider adding urea fertilizer for better yield.',
    { nutrient: 'nitrogen', level: 25, recommendation: 'urea' },
    {
      hi: {
        title: 'मिट्टी स्वास्थ्य अद्यतन',
        body: 'नाइट्रोजन का स्तर कम है (25 किग्रा/हेक्टेयर)। बेहतर उपज के लिए यूरिया उर्वरक जोड़ने पर विचार करें।'
      }
    }
  );
};

// Add demo system notification
export const addDemoSystemNotification = () => {
  addInAppNotification(
    'system',
    'Welcome to Krishi Mitra!',
    'Your account has been successfully set up. Start by getting crop recommendations for your farm.',
    { action: 'get_started' },
    {
      hi: {
        title: 'कृषि मित्र में आपका स्वागत है!',
        body: 'आपका खाता सफलतापूर्वक सेट अप हो गया है। अपने खेत के लिए फसल सिफारिशें प्राप्त करके शुरुआत करें।'
      }
    }
  );
};

// Add all demo notifications
export const addAllDemoNotifications = () => {
  setTimeout(() => addDemoPriceAlert(), 100);
  setTimeout(() => addDemoWeatherAlert(), 300);
  setTimeout(() => addDemoCropAlert(), 500);
  setTimeout(() => addDemoSoilAlert(), 700);
  setTimeout(() => addDemoSystemNotification(), 900);
};

// Make functions available in console for testing
if (typeof window !== 'undefined') {
  window.demoNotifications = {
    price: addDemoPriceAlert,
    weather: addDemoWeatherAlert,
    crop: addDemoCropAlert,
    soil: addDemoSoilAlert,
    system: addDemoSystemNotification,
    all: addAllDemoNotifications
  };
  
  console.log('📢 Demo notifications available! Try:');
  console.log('- window.demoNotifications.price()');
  console.log('- window.demoNotifications.weather()');
  console.log('- window.demoNotifications.crop()');
  console.log('- window.demoNotifications.soil()');
  console.log('- window.demoNotifications.all()');
}
