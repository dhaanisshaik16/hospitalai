/**
 * Smart Hospital Appointment System (SHAS) - Utility Module
 * Core helper functions for date/time formatting, UUID generation,
 * text sanitization, toast alerts, and modal operations.
 */

window.SHAS = window.SHAS || {};

window.SHAS.Utils = (function () {
  'use strict';

  /**
   * Generates a crypto-safe UUID with fallback
   */
  function generateUUID() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      try {
        return crypto.randomUUID();
      } catch (e) {
        // Fallback if randomUUID fails
      }
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Generates a human-friendly booking reference (e.g. SHAS-2026-8A3F)
   */
  function generateBookingRef() {
    const year = new Date().getFullYear();
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `SHAS-${year}-${randomHex}`;
  }

  /**
   * Escapes HTML to prevent XSS in rendering
   */
  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Formats a YYYY-MM-DD date string into a friendly localized date
   */
  function formatDate(dateStr, options) {
    if (!dateStr) return 'N/A';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        // Construct local date without UTC offset shifting
        const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        const defaultOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options || defaultOptions);
      }
      return new Date(dateStr).toLocaleDateString('en-US', options || { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }

  /**
   * Formats time string 'HH:mm' into 12-hour format (e.g., '09:30 AM')
   */
  function formatTime(timeStr) {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    return `${hours}:${minutes} ${ampm}`;
  }

  /**
   * Formats a slot range: '09:00' to '09:30' -> '9:00 AM - 9:30 AM'
   */
  function formatTimeRange(startStr, endStr) {
    return `${formatTime(startStr)} - ${formatTime(endStr)}`;
  }

  /**
   * Converts HH:mm string to minutes from midnight
   */
  function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  /**
   * Converts minutes from midnight to HH:mm string
   */
  function minutesToTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  /**
   * Returns today's date in YYYY-MM-DD
   */
  function getTodayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Adds specified days to a date string YYYY-MM-DD
   */
  function addDays(dateStr, days) {
    const parts = dateStr.split('-');
    const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    date.setDate(date.getDate() + days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Checks if date string YYYY-MM-DD is in the past
   */
  function isPastDate(dateStr) {
    const today = getTodayDateString();
    return dateStr < today;
  }

  /**
   * Gets day of week name from date string ('Sunday', 'Monday', ...)
   */
  function getDayOfWeek(dateStr) {
    const parts = dateStr.split('-');
    const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  /**
   * Checks if two time intervals overlap [start1, end1) and [start2, end2)
   */
  function isTimeOverlap(start1, end1, start2, end2) {
    const s1 = timeToMinutes(start1);
    const e1 = timeToMinutes(end1);
    const s2 = timeToMinutes(start2);
    const e2 = timeToMinutes(end2);
    return Math.max(s1, s2) < Math.min(e1, e2);
  }

  /**
   * Formats relative time (e.g., '5 mins ago', 'in 10 mins')
   */
  function formatRelativeTime(timestamp) {
    if (!timestamp) return '';
    const now = Date.now();
    const diffMs = timestamp - now;
    const isFuture = diffMs > 0;
    const absDiffSec = Math.floor(Math.abs(diffMs) / 1000);

    if (absDiffSec < 60) return isFuture ? 'in moments' : 'just now';
    const mins = Math.floor(absDiffSec / 60);
    if (mins < 60) return isFuture ? `in ${mins}m` : `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return isFuture ? `in ${hours}h` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return isFuture ? `in ${days}d` : `${days}d ago`;
  }

  /**
   * Shows a polished floating toast message
   */
  function showToast(title, message, type = 'info', duration = 4000) {
    if (typeof document === 'undefined' || !document.body) return;
    let container = document.getElementById('shas-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'shas-toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type} animate-slide-in`;

    const iconMap = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
      waitlist: '⏳'
    };

    toast.innerHTML = `
      <div class="toast-icon-wrap">${iconMap[type] || 'ℹ'}</div>
      <div class="toast-content">
        <div class="toast-title">${escapeHTML(title)}</div>
        ${message ? `<div class="toast-message">${escapeHTML(message)}</div>` : ''}
      </div>
      <button class="toast-close-btn" aria-label="Close notification">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast-close-btn');
    const dismiss = () => {
      toast.classList.add('animate-slide-out');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    };

    closeBtn.addEventListener('click', dismiss);
    container.appendChild(toast);

    if (duration > 0) {
      setTimeout(dismiss, duration);
    }
  }

  /**
   * Modal management
   */
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) firstFocusable.focus();
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay.active').forEach((modal) => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    });
    document.body.classList.remove('modal-open');
  }

  // Setup ESC key listener for modal closing
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  return {
    generateUUID,
    generateBookingRef,
    escapeHTML,
    formatDate,
    formatTime,
    formatTimeRange,
    timeToMinutes,
    minutesToTime,
    getTodayDateString,
    addDays,
    isPastDate,
    getDayOfWeek,
    isTimeOverlap,
    formatRelativeTime,
    showToast,
    openModal,
    closeModal,
    closeAllModals
  };
})();
