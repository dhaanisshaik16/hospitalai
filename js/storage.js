/**
 * Smart Hospital Appointment System (SHAS) - Storage Module
 * Manages all browser LocalStorage persistence with namespacing, versioning,
 * reactive state change events, demo data export/import, and quota safeguards.
 */

window.SHAS = window.SHAS || {};

window.SHAS.Storage = (function () {
  'use strict';

  const STORAGE_VERSION = '1.0.0';

  const KEYS = {
    VERSION: 'shas_version',
    DEPARTMENTS: 'shas_departments',
    DOCTORS: 'shas_doctors',
    PATIENTS: 'shas_patients',
    APPOINTMENTS: 'shas_appointments',
    WAITLIST: 'shas_waitlist',
    WAITLIST_OFFERS: 'shas_waitlist_offers',
    NOTIFICATIONS: 'shas_notifications',
    SETTINGS: 'shas_settings',
    AUDIT_LOGS: 'shas_audit_logs',
    DEMO_SESSION: 'shas_demo_session'
  };

  /**
   * Safely reads and parses data from LocalStorage
   */
  function getData(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null || raw === undefined) {
        return defaultValue;
      }
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`[SHAS Storage] Error parsing key "${key}":`, err);
      return defaultValue;
    }
  }

  /**
   * Safely writes data to LocalStorage and emits a state-changed event
   */
  function setData(key, value, silent = false) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      if (!silent) {
        emitStateChange(key, value);
      }
      return true;
    } catch (err) {
      console.error(`[SHAS Storage] Quota or write error on key "${key}":`, err);
      if (window.SHAS.Utils && window.SHAS.Utils.showToast) {
        window.SHAS.Utils.showToast('Storage Alert', 'Local browser storage quota reached or write failed.', 'warning');
      }
      return false;
    }
  }

  /**
   * Emits a window CustomEvent for reactive UI updates across modules
   */
  function emitStateChange(key, payload = null) {
    try {
      const event = new CustomEvent('shas:stateChanged', {
        detail: { key, payload, timestamp: Date.now() }
      });
      window.dispatchEvent(event);
    } catch (e) {
      // Event dispatching fallback
    }
  }

  /**
   * Helper to subscribe to state changes
   */
  function onStateChange(callback) {
    window.addEventListener('shas:stateChanged', callback);
    return () => window.removeEventListener('shas:stateChanged', callback);
  }

  /**
   * Returns current active demo session (role and user identity)
   */
  function getDemoSession() {
    return (
      getData(KEYS.DEMO_SESSION) || {
        role: 'patient', // 'patient' | 'doctor' | 'admin'
        userId: 'pat-1', // Default demo patient: Sarah Jenkins
        userName: 'Sarah Jenkins',
        userRoleLabel: 'Patient'
      }
    );
  }

  /**
   * Sets the active demo session
   */
  function setDemoSession(role, userId, userName) {
    let roleLabel = 'Patient';
    if (role === 'doctor') roleLabel = 'Physician';
    if (role === 'admin') roleLabel = 'Hospital Operations Administrator';

    const session = {
      role,
      userId: userId || (role === 'admin' ? 'admin-1' : 'pat-1'),
      userName: userName || (role === 'admin' ? 'Hospital Admin' : 'Demo User'),
      userRoleLabel: roleLabel,
      updatedAt: new Date().toISOString()
    };
    setData(KEYS.DEMO_SESSION, session);
    return session;
  }

  /**
   * Logs an audit record for tracking system events (cancellations, allocations, offers)
   */
  function logAudit(action, details = {}) {
    const logs = getData(KEYS.AUDIT_LOGS, []);
    const entry = {
      id: window.SHAS.Utils ? window.SHAS.Utils.generateUUID() : 'log-' + Date.now(),
      action,
      details,
      timestamp: new Date().toISOString()
    };
    // Keep last 100 logs
    logs.unshift(entry);
    if (logs.length > 100) logs.pop();
    setData(KEYS.AUDIT_LOGS, logs, true);
    return entry;
  }

  /**
   * Exports all application data to a JSON object/string for backup or demonstration
   */
  function exportDemoData() {
    const snapshot = {};
    Object.keys(KEYS).forEach((k) => {
      snapshot[KEYS[k]] = getData(KEYS[k]);
    });
    snapshot.exportedAt = new Date().toISOString();
    snapshot.app = 'Smart Hospital Appointment System';
    return JSON.stringify(snapshot, null, 2);
  }

  /**
   * Imports application data from a JSON string
   */
  function importDemoData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid JSON structure');
      }

      Object.keys(KEYS).forEach((k) => {
        const storageKey = KEYS[k];
        if (data[storageKey] !== undefined) {
          localStorage.setItem(storageKey, JSON.stringify(data[storageKey]));
        }
      });

      emitStateChange('all');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Resets all demo data by clearing SHAS keys and re-initializing seed data
   */
  function resetDemoData() {
    Object.keys(KEYS).forEach((k) => {
      localStorage.removeItem(KEYS[k]);
    });
    if (window.SHAS.SeedData && typeof window.SHAS.SeedData.initialize === 'function') {
      window.SHAS.SeedData.initialize(true);
    }
    emitStateChange('all');
  }

  return {
    KEYS,
    STORAGE_VERSION,
    getData,
    setData,
    emitStateChange,
    onStateChange,
    getDemoSession,
    setDemoSession,
    logAudit,
    exportDemoData,
    importDemoData,
    resetDemoData
  };
})();
