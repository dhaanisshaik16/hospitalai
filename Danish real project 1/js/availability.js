/**
 * Smart Hospital Appointment System (SHAS) - Appointment Availability Engine
 * Dynamically computes real-time doctor availability slots taking into account:
 * - Active doctor status
 * - Past dates / current time
 * - Working days & schedule hours
 * - Lunch & operational breaks
 * - Approved leave periods
 * - Existing confirmed appointments
 * - Active temporary waiting-list reservations/offers
 */

window.SHAS = window.SHAS || {};

window.SHAS.Availability = (function () {
  'use strict';

  function getStorage() {
    return window.SHAS.Storage;
  }

  function getUtils() {
    return window.SHAS.Utils;
  }

  /**
   * Calculates slot breakdown for a specific doctor on a specific date
   * @param {string} doctorId - ID of doctor
   * @param {string} dateStr - Date string 'YYYY-MM-DD'
   * @returns {Object} { isOperating: boolean, message: string, slots: Array, doctor: Object }
   */
  function getDoctorAvailability(doctorId, dateStr) {
    const Utils = getUtils();
    const Storage = getStorage();

    const doctor = window.SHAS.Doctors.getDoctorById(doctorId);
    if (!doctor) {
      return { isOperating: false, message: 'Doctor not found.', slots: [], doctor: null };
    }

    if (!doctor.active) {
      return { isOperating: false, message: 'This doctor is currently inactive.', slots: [], doctor };
    }

    // Check if date is in the past
    if (Utils.isPastDate(dateStr)) {
      return { isOperating: false, message: 'Cannot schedule appointments for past dates.', slots: [], doctor };
    }

    // Check doctor working days
    const dayName = Utils.getDayOfWeek(dateStr);
    const worksOnDay = Array.isArray(doctor.workingDays) && doctor.workingDays.includes(dayName);
    if (!worksOnDay) {
      return {
        isOperating: false,
        message: `${doctor.name} does not have clinic hours on ${dayName}s.`,
        slots: [],
        doctor
      };
    }

    // Check if doctor is on leave
    if (Array.isArray(doctor.leaves)) {
      const onLeave = doctor.leaves.find((leave) => dateStr >= leave.startDate && dateStr <= leave.endDate);
      if (onLeave) {
        return {
          isOperating: false,
          message: `${doctor.name} is on scheduled leave (${onLeave.reason || 'Leave'}) on this date.`,
          slots: [],
          doctor
        };
      }
    }

    // Working hours & duration
    const workingStart = doctor.workingHours?.start || '09:00';
    const workingEnd = doctor.workingHours?.end || '17:00';
    const duration = doctor.consultationDuration || 30;

    const startMinutes = Utils.timeToMinutes(workingStart);
    const endMinutes = Utils.timeToMinutes(workingEnd);

    if (startMinutes >= endMinutes) {
      return { isOperating: false, message: 'Invalid working hours configuration.', slots: [], doctor };
    }

    // Retrieve confirmed appointments for this doctor on this date
    const allAppointments = Storage.getData(Storage.KEYS.APPOINTMENTS, []);
    const doctorAppointmentsOnDate = allAppointments.filter(
      (apt) => apt.doctorId === doctorId && apt.appointmentDate === dateStr && apt.status === 'CONFIRMED'
    );

    // Retrieve active waitlist temporary reservations
    // Waitlist offers reserve a slot for a short period so it cannot be double-booked
    const activeOffers = Storage.getData(Storage.KEYS.WAITLIST_OFFERS, []);
    const now = Date.now();
    const validOffersOnDate = activeOffers.filter(
      (off) => off.doctorId === doctorId && off.date === dateStr && (!off.expiresAt || off.expiresAt > now)
    );

    // If today, check current time to avoid slots already passed earlier today
    const isToday = dateStr === Utils.getTodayDateString();
    const currentTotalMinutes = isToday ? new Date().getHours() * 60 + new Date().getMinutes() : -1;

    const slots = [];
    let currentSlotStart = startMinutes;

    while (currentSlotStart + duration <= endMinutes) {
      const currentSlotEnd = currentSlotStart + duration;
      const startTimeStr = Utils.minutesToTime(currentSlotStart);
      const endTimeStr = Utils.minutesToTime(currentSlotEnd);

      let slotStatus = 'available';
      let reason = 'Available for booking';
      let isAvailable = true;
      let referenceId = null;

      // 1. Check if slot is already in the past (today)
      if (isToday && currentSlotStart <= currentTotalMinutes) {
        slotStatus = 'past';
        isAvailable = false;
        reason = 'Time slot has passed';
      }

      // 2. Check if slot overlaps with doctor's breaks
      if (isAvailable && Array.isArray(doctor.breaks)) {
        for (const brk of doctor.breaks) {
          if (Utils.isTimeOverlap(startTimeStr, endTimeStr, brk.start, brk.end)) {
            slotStatus = 'break';
            isAvailable = false;
            reason = brk.name || 'Doctor Break / Lunch';
            break;
          }
        }
      }

      // 3. Check if slot overlaps with confirmed appointment
      if (isAvailable) {
        const conflictingApt = doctorAppointmentsOnDate.find((apt) =>
          Utils.isTimeOverlap(startTimeStr, endTimeStr, apt.startTime, apt.endTime)
        );
        if (conflictingApt) {
          slotStatus = 'booked';
          isAvailable = false;
          reason = 'Booked';
          referenceId = conflictingApt.bookingRef;
        }
      }

      // 4. Check if slot is held by an active temporary waitlist offer
      if (isAvailable) {
        const conflictingOffer = validOffersOnDate.find((off) =>
          Utils.isTimeOverlap(startTimeStr, endTimeStr, off.startTime, off.endTime)
        );
        if (conflictingOffer) {
          slotStatus = 'reserved_offer';
          isAvailable = false;
          reason = 'Reserved for Waitlist Candidate';
        }
      }

      slots.push({
        doctorId,
        doctorName: doctor.name,
        date: dateStr,
        startTime: startTimeStr,
        endTime: endTimeStr,
        formattedTime: Utils.formatTime(startTimeStr),
        formattedRange: Utils.formatTimeRange(startTimeStr, endTimeStr),
        status: slotStatus, // 'available' | 'booked' | 'break' | 'reserved_offer' | 'past'
        isAvailable,
        reason,
        referenceId
      });

      currentSlotStart += duration;
    }

    const availableCount = slots.filter((s) => s.isAvailable).length;

    return {
      isOperating: true,
      message: availableCount > 0 ? `${availableCount} slots available` : 'All appointment slots are fully booked.',
      totalSlots: slots.length,
      availableCount,
      bookedCount: slots.filter((s) => s.status === 'booked').length,
      slots,
      doctor
    };
  }

  /**
   * Verifies if a single slot is strictly available right now before saving booking
   */
  function isSlotAvailable(doctorId, dateStr, startTime) {
    const availability = getDoctorAvailability(doctorId, dateStr);
    if (!availability.isOperating) return false;
    const match = availability.slots.find((s) => s.startTime === startTime);
    return match ? match.isAvailable : false;
  }

  /**
   * Generates a 7-day availability preview summary for a doctor
   */
  function getWeeklyAvailability(doctorId, startDateStr) {
    const Utils = getUtils();
    const days = [];
    const baseDate = startDateStr || Utils.getTodayDateString();

    for (let i = 0; i < 7; i++) {
      const curDate = Utils.addDays(baseDate, i);
      const res = getDoctorAvailability(doctorId, curDate);
      days.push({
        date: curDate,
        dayName: Utils.getDayOfWeek(curDate),
        formattedDate: Utils.formatDate(curDate, { month: 'short', day: 'numeric' }),
        isOperating: res.isOperating,
        availableCount: res.availableCount || 0,
        totalSlots: res.totalSlots || 0
      });
    }

    return days;
  }

  return {
    getDoctorAvailability,
    isSlotAvailable,
    getWeeklyAvailability
  };
})();
