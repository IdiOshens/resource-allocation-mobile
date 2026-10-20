import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  fetchMyNotifications,
  fetchNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/api/notifications';

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = useCallback(async (authToken) => {
    if (!authToken) return;
    setIsLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        fetchMyNotifications(authToken),
        fetchNotificationCount(authToken),
      ]);

      if (listRes && listRes.success && Array.isArray(listRes.data)) {
        setNotifications(listRes.data);
      }
      if (countRes && countRes.success && countRes.data && typeof countRes.data.count === 'number') {
        setUnreadCount(countRes.data.count);
      }
    } catch (e) {
      // Keep existing state or silently ignore network errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    loadNotifications(token);
  }, [isAuthenticated, token, loadNotifications]);

  const refresh = useCallback(async () => {
    if (token) {
      await loadNotifications(token);
    }
  }, [token, loadNotifications]);

  const markRead = useCallback(async (notificationId) => {
    if (!token) return;

    // Optimistically or after API call update state
    try {
      const res = await markNotificationRead(token, notificationId);
      if (res && res.success) {
        setNotifications((prev) =>
          prev.map((item) => {
            if (item.notification_id === notificationId) {
              return { ...item, is_read: 1, read_at: new Date().toISOString() };
            }
            return item;
          })
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (e) {
      // Error handling
    }
  }, [token]);

  const markAllRead = useCallback(async () => {
    if (!token) return;

    try {
      const res = await markAllNotificationsRead(token);
      if (res && res.success) {
        setNotifications((prev) =>
          prev.map((item) => ({ ...item, is_read: 1, read_at: new Date().toISOString() }))
        );
        setUnreadCount(0);
      }
    } catch (e) {
      // Error handling
    }
  }, [token]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        refresh,
        markRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationsProvider');
  return ctx;
}
