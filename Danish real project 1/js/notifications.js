/**
 * Smart Hospital Appointment System (SHAS) - Notifications Module
 * In-app notifications with badge counter, filtering by role/recipient,
 * read/unread tracking, and toast synchronization.
 */

window.SHAS = window.SHAS || {};

window.SHAS.Notifications = (function () {
  'use strict';

  function getStorage() {
    return window.SHAS.Storage;
  }

  function getUtils() {
    return window.SHAS.Utils;
  }

  /**
   * Creates and stores a notification
   */
  function createNotification(recipientId, role, title, message, type = 'info', actionData = null, showToastAlert = true) {
    const list = getStorage().getData(getStorage().KEYS.NOTIFICATIONS, []);

    const newNotif = {
      id: 'notif-' + getUtils().generateUUID().substring(0, 8),
      recipientId: recipientId || 'all',
      role: role || 'patient', // 'patient' | 'doctor' | 'admin' | 'all'
      title,
      message,
      type, // 'appointment' | 'cancellation' | 'reschedule' | 'waitlist' | 'offer' | 'system'
      read: false,
      timestamp: new Date().toISOString(),
      actionData
    };

    list.unshift(newNotif);
    // Keep max 150 notifications in storage
    if (list.length > 150) list.pop();

    getStorage().setData(getStorage().KEYS.NOTIFICATIONS, list);

    if (showToastAlert && window.SHAS.Utils && window.SHAS.Utils.showToast) {
      const toastTypeMap = {
        offer: 'waitlist',
        waitlist: 'waitlist',
        appointment: 'success',
        cancellation: 'warning',
        reschedule: 'info',
        system: 'info'
      };
      window.SHAS.Utils.showToast(title, message, toastTypeMap[type] || 'info');
    }

    return newNotif;
  }

  /**
   * Retrieves notifications for current demo user session
   */
  function getUserNotifications(userId, role) {
    const list = getStorage().getData(getStorage().KEYS.NOTIFICATIONS, []);
    return list.filter((n) => {
      if (role === 'admin') return true; // Admins can view hospital-wide notifications
      if (n.role === 'all') return true;
      if (n.recipientId === userId) return true;
      if (n.role === role && (n.recipientId === 'all' || !n.recipientId)) return true;
      return false;
    });
  }

  /**
   * Gets unread count for user session
   */
  function getUnreadCount(userId, role) {
    const notifs = getUserNotifications(userId, role);
    return notifs.filter((n) => !n.read).length;
  }

  /**
   * Marks a single notification as read
   */
  function markAsRead(notificationId) {
    const list = getStorage().getData(getStorage().KEYS.NOTIFICATIONS, []);
    const notif = list.find((n) => n.id === notificationId);
    if (notif) {
      notif.read = true;
      getStorage().setData(getStorage().KEYS.NOTIFICATIONS, list);
    }
  }

  /**
   * Marks all notifications as read for current user/role
   */
  function markAllAsRead(userId, role) {
    const list = getStorage().getData(getStorage().KEYS.NOTIFICATIONS, []);
    list.forEach((n) => {
      if (role === 'admin' || n.recipientId === userId || n.role === 'all' || (n.role === role && !n.recipientId)) {
        n.read = true;
      }
    });
    getStorage().setData(getStorage().KEYS.NOTIFICATIONS, list);
  }

  /**
   * Clears notification history
   */
  function clearAll(userId, role) {
    let list = getStorage().getData(getStorage().KEYS.NOTIFICATIONS, []);
    if (role === 'admin') {
      list = [];
    } else {
      list = list.filter((n) => n.recipientId !== userId && n.role !== role);
    }
    getStorage().setData(getStorage().KEYS.NOTIFICATIONS, list);
  }

  return {
    createNotification,
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    clearAll
  };
})();
