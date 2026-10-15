/**
 * Smart Hospital Appointment System (SHAS) - Appointments Module
 * Handles the complete lifecycle of bookings, atomic availability verification,
 * cancellations with automatic waitlist cascade, rescheduling, and status transitions.
 */

window.SHAS = window.SHAS || {};

window.SHAS.Appointments = (function () {
  'use strict';

  function getStorage() {
    return window.SHAS.Storage;
  }

  function getUtils() {
    return window.SHAS.Utils;
  }

  function getSettings() {
    return getStorage().getData(getStorage().KEYS.SETTINGS, {
      allowCancellationAnytime: true,
      cancellationCutoffHours: 2
    });
  }

  /**
   * Retrieves all appointments with optional filters
   */
  function getAllAppointments(filters = {}) {
    let list = getStorage().getData(getStorage().KEYS.APPOINTMENTS, []);

    if (filters.patientId) {
      list = list.filter((a) => a.patientId === filters.patientId);
    }
    if (filters.doctorId && filters.doctorId !== 'all') {
      list = list.filter((a) => a.doctorId === filters.doctorId);
    }
    if (filters.departmentId && filters.departmentId !== 'all') {
      list = list.filter((a) => a.departmentId === filters.departmentId);
    }
    if (filters.status && filters.status !== 'all') {
      list = list.filter((a) => a.status === filters.status);
    }
    if (filters.date) {
      list = list.filter((a) => a.appointmentDate === filters.date);
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          a.doctorName.toLowerCase().includes(q) ||
          a.bookingRef.toLowerCase().includes(q)
      );
    }

    // Sort by appointmentDate descending, then startTime
    return list.sort((a, b) => {
      if (a.appointmentDate !== b.appointmentDate) {
        return b.appointmentDate.localeCompare(a.appointmentDate);
      }
      return a.startTime.localeCompare(b.startTime);
    });
  }

  /**
   * Retrieves single appointment by ID
   */
  function getAppointmentById(id) {
    const list = getStorage().getData(getStorage().KEYS.APPOINTMENTS, []);
    return list.find((a) => a.id === id) || null;
  }

  /**
   * Retrieves upcoming appointments for a patient
   */
  function getPatientAppointments(patientId, statusFilter = 'all') {
    const today = getUtils().getTodayDateString();
    let list = getAllAppointments({ patientId });

    if (statusFilter === 'upcoming') {
      list = list.filter((a) => a.status === 'CONFIRMED' && a.appointmentDate >= today);
    } else if (statusFilter === 'completed') {
      list = list.filter((a) => a.status === 'COMPLETED');
    } else if (statusFilter === 'cancelled') {
      list = list.filter((a) => a.status === 'CANCELLED');
    }

    return list;
  }

  /**
   * BOOK APPOINTMENT
   * Validates slot availability on the fly, enforces concurrency safety,
   * generates unique booking reference, and persists record.
   */
  function bookAppointment(bookingData) {
    const Storage = getStorage();
    const Utils = getUtils();

    // 1. Validation of required inputs
    const { patientId, doctorId, date, startTime, notes } = bookingData;
    if (!patientId || !doctorId || !date || !startTime) {
      return { success: false, error: 'Please provide all required appointment details.' };
    }

    if (Utils.isPastDate(date)) {
      return { success: false, error: 'Cannot book appointments for past dates.' };
    }

    const doctor = window.SHAS.Doctors.getDoctorById(doctorId);
    if (!doctor || !doctor.active) {
      return { success: false, error: 'Doctor is not available or inactive.' };
    }

    // 2. Strict real-time availability recalculation
    const isAvailable = window.SHAS.Availability.isSlotAvailable(doctorId, date, startTime);
    if (!isAvailable) {
      return {
        success: false,
        error: 'This slot is no longer available. Please select another slot or join the waiting list.'
      };
    }

    // 3. Compute slot end time based on doctor's consultation duration
    const duration = doctor.consultationDuration || 30;
    const startMins = Utils.timeToMinutes(startTime);
    const endMins = startMins + duration;
    const endTime = Utils.minutesToTime(endMins);

    // 4. Retrieve patient details
    const patients = Storage.getData(Storage.KEYS.PATIENTS, []);
    const patient = patients.find((p) => p.id === patientId) || {
      id: patientId,
      name: bookingData.patientName || 'Patient',
      email: bookingData.patientEmail || '',
      phone: bookingData.patientPhone || ''
    };

    // 5. Patient duplicate booking prevention (prevent double-booking the same patient at the same time)
    const allAppointments = Storage.getData(Storage.KEYS.APPOINTMENTS, []);
    const patientConflict = allAppointments.find(
      (a) =>
        a.patientId === patientId &&
        a.appointmentDate === date &&
        a.status === 'CONFIRMED' &&
        Utils.isTimeOverlap(startTime, endTime, a.startTime, a.endTime)
    );
    if (patientConflict) {
      return {
        success: false,
        error: `You already have an appointment with ${patientConflict.doctorName} at this time (${patientConflict.bookingRef}).`
      };
    }

    // 6. Generate appointment record
    const bookingRef = Utils.generateBookingRef();
    const newAppointment = {
      id: 'apt-' + Utils.generateUUID().substring(0, 8),
      bookingRef,
      patientId: patient.id,
      patientName: patient.name,
      patientEmail: patient.email,
      patientPhone: patient.phone,
      doctorId: doctor.id,
      doctorName: doctor.name,
      departmentId: doctor.departmentId,
      departmentName: doctor.departmentName,
      appointmentDate: date,
      startTime,
      endTime,
      consultationFee: doctor.consultationFee,
      status: 'CONFIRMED',
      notes: notes ? notes.trim() : 'Standard clinical consultation.',
      createdAt: new Date().toISOString()
    };

    allAppointments.push(newAppointment);
    Storage.setData(Storage.KEYS.APPOINTMENTS, allAppointments);

    // 7. Audit and notification
    Storage.logAudit('APPOINTMENT_BOOKED', {
      appointmentId: newAppointment.id,
      bookingRef,
      patientName: patient.name,
      doctorName: doctor.name,
      date,
      time: startTime
    });

    window.SHAS.Notifications.createNotification(
      patient.id,
      'patient',
      'Appointment Confirmed',
      `Your consultation with ${doctor.name} on ${Utils.formatDate(date)} at ${Utils.formatTime(startTime)} is confirmed! Reference: ${bookingRef}`,
      'appointment',
      { appointmentId: newAppointment.id }
    );

    return { success: true, appointment: newAppointment };
  }

  /**
   * CANCEL APPOINTMENT WITH AUTOMATIC WAITING-LIST ALLOCATION
   * Marks appointment CANCELLED, preserves record, and immediately triggers
   * the automatic waitlist allocation engine to fill the newly freed slot.
   */
  function cancelAppointment(appointmentId, reason = 'Patient cancellation', cancelledByRole = 'patient') {
    const Storage = getStorage();
    const Utils = getUtils();
    const settings = getSettings();

    const appointments = Storage.getData(Storage.KEYS.APPOINTMENTS, []);
    const index = appointments.findIndex((a) => a.id === appointmentId);

    if (index === -1) {
      return { success: false, error: 'Appointment not found.' };
    }

    const apt = appointments[index];

    if (apt.status === 'CANCELLED') {
      return { success: false, error: 'This appointment is already cancelled.' };
    }

    if (apt.status === 'COMPLETED') {
      return { success: false, error: 'Cannot cancel a completed appointment.' };
    }

    // Cancellation policy check
    if (cancelledByRole === 'patient' && !settings.allowCancellationAnytime) {
      const today = Utils.getTodayDateString();
      if (apt.appointmentDate < today) {
        return { success: false, error: 'Cannot cancel past appointments.' };
      }
      // Check cutoff hours if applicable
    }

    // 1. Mark as CANCELLED with audit details
    apt.status = 'CANCELLED';
    apt.cancellationReason = reason.trim() || 'No reason provided';
    apt.cancelledAt = new Date().toISOString();
    apt.cancelledBy = cancelledByRole;
    apt.updatedAt = new Date().toISOString();

    Storage.setData(Storage.KEYS.APPOINTMENTS, appointments);

    Storage.logAudit('APPOINTMENT_CANCELLED', {
      appointmentId: apt.id,
      bookingRef: apt.bookingRef,
      patientName: apt.patientName,
      doctorName: apt.doctorName,
      date: apt.appointmentDate,
      time: apt.startTime,
      reason: apt.cancellationReason
    });

    // Notify patient
    window.SHAS.Notifications.createNotification(
      apt.patientId,
      'patient',
      'Appointment Cancelled',
      `Your appointment with ${apt.doctorName} on ${Utils.formatDate(apt.appointmentDate)} at ${Utils.formatTime(apt.startTime)} has been cancelled.`,
      'cancellation',
      { appointmentId: apt.id }
    );

    // 2. TRIGGER THE AUTOMATIC WAITING LIST ALLOCATION FOR THE FREED SLOT
    const releasedSlot = {
      doctorId: apt.doctorId,
      doctorName: apt.doctorName,
      departmentId: apt.departmentId,
      departmentName: apt.departmentName,
      date: apt.appointmentDate,
      startTime: apt.startTime,
      endTime: apt.endTime,
      consultationFee: apt.consultationFee,
      originalAppointmentId: apt.id
    };

    console.log('[SHAS Appointments] Appointment cancelled. Triggering automatic waitlist allocation...');
    const allocationResult = window.SHAS.Waitlist.processReleasedSlot(releasedSlot);

    return {
      success: true,
      appointment: apt,
      waitlistAllocation: allocationResult,
      message: `Appointment ${apt.bookingRef} cancelled. ${allocationResult.message}`
    };
  }

  /**
   * RESCHEDULE APPOINTMENT
   * Replaces appointment slot, releases old slot, and triggers waitlist on the old slot.
   */
  function rescheduleAppointment(appointmentId, newDate, newStartTime, reason = 'Patient reschedule') {
    const Storage = getStorage();
    const Utils = getUtils();

    const appointments = Storage.getData(Storage.KEYS.APPOINTMENTS, []);
    const index = appointments.findIndex((a) => a.id === appointmentId);

    if (index === -1) {
      return { success: false, error: 'Appointment not found.' };
    }

    const apt = appointments[index];
    if (apt.status !== 'CONFIRMED') {
      return { success: false, error: 'Only confirmed appointments can be rescheduled.' };
    }

    if (apt.appointmentDate === newDate && apt.startTime === newStartTime) {
      return { success: false, error: 'The selected new slot is identical to the current slot.' };
    }

    // 1. Verify availability of the new slot
    const isNewAvailable = window.SHAS.Availability.isSlotAvailable(apt.doctorId, newDate, newStartTime);
    if (!isNewAvailable) {
      return { success: false, error: 'The requested new slot is not available. Please pick another slot.' };
    }

    // 2. Compute new end time
    const doctor = window.SHAS.Doctors.getDoctorById(apt.doctorId);
    const duration = doctor ? doctor.consultationDuration : 30;
    const newEndMins = Utils.timeToMinutes(newStartTime) + duration;
    const newEndTime = Utils.minutesToTime(newEndMins);

    // 3. Save old slot details for waiting list release
    const oldSlot = {
      doctorId: apt.doctorId,
      doctorName: apt.doctorName,
      departmentId: apt.departmentId,
      departmentName: apt.departmentName,
      date: apt.appointmentDate,
      startTime: apt.startTime,
      endTime: apt.endTime,
      consultationFee: apt.consultationFee,
      originalAppointmentId: apt.id
    };

    // 4. Update appointment
    const previousDate = apt.appointmentDate;
    const previousTime = apt.startTime;

    if (!Array.isArray(apt.rescheduleHistory)) {
      apt.rescheduleHistory = [];
    }
    apt.rescheduleHistory.push({
      fromDate: previousDate,
      fromTime: previousTime,
      toDate: newDate,
      toTime: newStartTime,
      reason,
      rescheduledAt: new Date().toISOString()
    });

    apt.appointmentDate = newDate;
    apt.startTime = newStartTime;
    apt.endTime = newEndTime;
    apt.updatedAt = new Date().toISOString();

    Storage.setData(Storage.KEYS.APPOINTMENTS, appointments);

    Storage.logAudit('APPOINTMENT_RESCHEDULED', {
      appointmentId: apt.id,
      bookingRef: apt.bookingRef,
      from: `${previousDate} ${previousTime}`,
      to: `${newDate} ${newStartTime}`
    });

    window.SHAS.Notifications.createNotification(
      apt.patientId,
      'patient',
      'Appointment Rescheduled',
      `Your appointment with ${apt.doctorName} was rescheduled to ${Utils.formatDate(newDate)} at ${Utils.formatTime(newStartTime)}.`,
      'reschedule',
      { appointmentId: apt.id }
    );

    // 5. Automatically cascade released OLD slot to waiting list!
    console.log('[SHAS Appointments] Appointment rescheduled. Triggering waitlist on released previous slot...');
    const allocationResult = window.SHAS.Waitlist.processReleasedSlot(oldSlot);

    return {
      success: true,
      appointment: apt,
      waitlistAllocation: allocationResult,
      message: `Appointment rescheduled to ${Utils.formatDate(newDate)} at ${Utils.formatTime(newStartTime)}. ${allocationResult.message}`
    };
  }

  /**
   * Doctor Action: Marks an appointment as COMPLETED
   */
  function markCompleted(appointmentId) {
    const Storage = getStorage();
    const appointments = Storage.getData(Storage.KEYS.APPOINTMENTS, []);
    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt) return { success: false, error: 'Appointment not found' };

    apt.status = 'COMPLETED';
    apt.completedAt = new Date().toISOString();
    Storage.setData(Storage.KEYS.APPOINTMENTS, appointments);
    Storage.logAudit('APPOINTMENT_COMPLETED', { appointmentId, bookingRef: apt.bookingRef });

    return { success: true, appointment: apt };
  }

  /**
   * Doctor Action: Marks an appointment as NO_SHOW
   */
  function markNoShow(appointmentId) {
    const Storage = getStorage();
    const appointments = Storage.getData(Storage.KEYS.APPOINTMENTS, []);
    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt) return { success: false, error: 'Appointment not found' };

    apt.status = 'NO_SHOW';
    apt.noShowAt = new Date().toISOString();
    Storage.setData(Storage.KEYS.APPOINTMENTS, appointments);
    Storage.logAudit('APPOINTMENT_NO_SHOW', { appointmentId, bookingRef: apt.bookingRef });

    return { success: true, appointment: apt };
  }

  return {
    getAllAppointments,
    getAppointmentById,
    getPatientAppointments,
    bookAppointment,
    cancelAppointment,
    rescheduleAppointment,
    markCompleted,
    markNoShow
  };
})();
