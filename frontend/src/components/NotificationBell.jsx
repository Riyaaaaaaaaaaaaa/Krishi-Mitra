import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export default function NotificationBell() {
  const { t, i18n } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Load notifications from localStorage initially
    loadNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);

    // Listen for new notifications
    const handleNewNotification = () => {
      loadNotifications();
    };
    window.addEventListener('notificationAdded', handleNewNotification);

    // Click outside to close
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationAdded', handleNewNotification);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadNotifications = () => {
    // Load from localStorage (can be replaced with API call)
    const stored = localStorage.getItem('notifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
        const unread = parsed.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (e) {
        console.error('Failed to parse notifications:', e);
      }
    }
  };

  const markAsRead = (id) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    setUnreadCount(updated.filter(n => !n.read).length);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    setUnreadCount(0);
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    setUnreadCount(updated.filter(n => !n.read).length);
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.setItem('notifications', JSON.stringify([]));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      priceAlerts: '💰',
      weatherAlerts: '🌧️',
      cropAlerts: '🌾',
      soilAlerts: '🌱',
      system: '🔔'
    };
    return icons[type] || '🔔';
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notifTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return i18n.language === 'hi' ? 'अभी' : 'Just now';
    if (diffInMinutes < 60) return i18n.language === 'hi' ? `${diffInMinutes} मिनट पहले` : `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return i18n.language === 'hi' ? `${diffInHours} घंटे पहले` : `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return i18n.language === 'hi' ? `${diffInDays} दिन पहले` : `${diffInDays}d ago`;
  };

  const getLocalizedContent = (notification) => {
    if (i18n.language === 'hi' && notification.translations?.hi) {
      return {
        title: notification.translations.hi.title,
        body: notification.translations.hi.body
      };
    }
    return {
      title: notification.title,
      body: notification.body
    };
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">
              {i18n.language === 'hi' ? 'सूचनाएं' : 'Notifications'}
            </h3>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {i18n.language === 'hi' ? 'सभी को पढ़ें' : 'Mark all read'}
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  {i18n.language === 'hi' ? 'सभी साफ़ करें' : 'Clear all'}
                </button>
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="text-6xl mb-3">🔔</div>
                <p className="text-gray-500 text-center">
                  {i18n.language === 'hi' ? 'कोई सूचना नहीं' : 'No notifications'}
                </p>
                <p className="text-sm text-gray-400 text-center mt-1">
                  {i18n.language === 'hi' 
                    ? 'नई सूचनाएं यहां दिखाई देंगी' 
                    : 'New notifications will appear here'}
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const content = getLocalizedContent(notification);
                return (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {content.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {content.body}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {getTimeAgo(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <button className="text-sm text-green-600 hover:text-green-700 font-medium w-full text-center">
                {i18n.language === 'hi' ? 'सभी सूचनाएं देखें' : 'View all notifications'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
