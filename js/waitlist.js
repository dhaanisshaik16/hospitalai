/**
 * Smart Hospital Appointment System (SHAS) - Automatic Waiting-List System
 * The core innovation: Automatically re-allocates released appointment slots
 * to eligible patients based on department, doctor preference, date/time range,
 * and queue seniority (FIFO). Handles offers, acceptance, decline, and expiration cascades.
 */

window.SHAS = window.SHAS || {};

window.SHAS.Waitlist = (function () {
  'use strict';

  function getStorage() {
    return window.SHAS.Storage;
  }

  function getUtils() {
    return window.SHAS.Utils;
  }

  function getSettings() {
    return getStorage().getData(getStorage().KEYS.SETTINGS, {
      offerExpiryMinutes: 15,
      autoProcessWaitlist: true
    });
  }

  /**
   * Checks if a slot time matches patient's preferred time range
   */
  function matchesTimeRange(slotStartTime, preferredTimeRange) {
    if (!preferredTimeRange || preferredTimeRange === 'any') return true;
    const startMins = getUtils().timeToMinutes(slotStartTime);

    if (preferredTimeRange === 'morning') {
      // 08:00 to 12:00
      return startMins >= 8 * 60 && startMins < 12 * 60;
    }
    if (preferredTimeRange === 'afternoon') {
      // 12:00 to 17:00
      return startMins >= 12 * 60 && startMins < 17 * 60;
    }
    if (preferredTimeRange === 'evening') {
      // 17:00 to 21:00
      return startMins >= 17 * 60;
    }

    return true;
  }

  /**
   * Retrieves all waitlist entries, optionally filtered
   */
  function getAllWaitlist(filters = {}) {
    let list = getStorage().getData(getStorage().KEYS.WAITLIST, []);

    if (filters.status && filters.status !== 'all') {
      list = list.filter((w) => w.status === filters.status);
    }
    if (filters.departmentId && filters.departmentId !== 'all') {
      list = list.filter((w) => w.departmentId === filters.departmentId);
    }
    if (filters.patientId) {
      list = list.filter((w) => w.patientId === filters.patientId);
    }
    if (filters.doctorId && filters.doctorId !== 'all') {
      list = list.filter((w) => w.preferredDoctorId === filters.doctorId || w.preferredDoctorId === 'ANY');
    }

    // Sort by queuePosition ascending then createdAt
    return list.sort((a, b) => (a.queuePosition || 999) - (b.queuePosition || 999));
  }

  /**
   * Retrieves active waitlist entries for a specific patient
   */
  function getPatientWaitlist(patientId) {
    return getAllWaitlist({ patientId });
  }

  /**
   * Retrieves active pending offers for a specific patient
   */
  function getPatientPendingOffers(patientId) {
    const list = getStorage().getData(getStorage().KEYS.WAITLIST, []);
    const now = Date.now();
    return list.filter((w) => w.patientId === patientId && w.status === 'OFFERED' && (!w.offerExpiresAt || w.offerExpiresAt > now));
  }

  /**
   * Patient joins the waiting list
   */
  function joinWaitlist(data) {
    const Storage = getStorage();
    const Utils = getUtils();

    if (!data.patientId || !data.departmentId) {
      return { success: false, error: 'Patient ID and Department are required.' };
    }

    const dept = window.SHAS.Departments.getDepartmentById(data.departmentId);
    if (!dept) {
      return { success: false, error: 'Invalid department selected.' };
    }

    let doctorName = 'Any Available Doctor';
    if (data.preferredDoctorId && data.preferredDoctorId !== 'ANY') {
      const doc = window.SHAS.Doctors.getDoctorById(data.preferredDoctorId);
      if (doc) doctorName = doc.name;
    }

    const list = Storage.getData(Storage.KEYS.WAITLIST, []);

    // Check duplicate active waitlist entry for the same patient and department
    const existing = list.find(
      (w) =>
        w.patientId === data.patientId &&
        w.departmentId === data.departmentId &&
        w.preferredDoctorId === (data.preferredDoctorId || 'ANY') &&
        ['WAITING', 'OFFERED'].includes(w.status)
    );
    if (existing) {
      return {
        success: false,
        error: 'You already have an active waiting list entry for this department and doctor preference.'
      };
    }

    // Calculate queue position for this department
    const deptQueue = list.filter((w) => w.departmentId === data.departmentId && w.status === 'WAITING');
    const queuePosition = deptQueue.length + 1;

    const startDate = data.preferredStartDate || Utils.getTodayDateString();
    const endDate = data.preferredEndDate || Utils.addDays(startDate, 7);

    const newEntry = {
      id: 'wl-' + Utils.generateUUID().substring(0, 8),
      patientId: data.patientId,
      patientName: data.patientName || 'Registered Patient',
      patientEmail: data.patientEmail || '',
      patientPhone: data.patientPhone || '',
      departmentId: dept.id,
      departmentName: dept.name,
      preferredDoctorId: data.preferredDoctorId || 'ANY',
      preferredDoctorName: doctorName,
      preferredStartDate: startDate,
      preferredEndDate: endDate,
      preferredTimeRange: data.preferredTimeRange || 'any',
      urgency: data.urgency || 'Standard',
      notes: data.notes ? data.notes.trim() : '',
      queuePosition,
      status: 'WAITING',
      offeredSlot: null,
      offerExpiresAt: null,
      createdAt: new Date().toISOString()
    };

    list.push(newEntry);
    Storage.setData(Storage.KEYS.WAITLIST, list);

    Storage.logAudit('WAITLIST_JOINED', {
      waitlistId: newEntry.id,
      patientName: newEntry.patientName,
      department: dept.name,
      doctor: doctorName,
      queuePosition
    });

    window.SHAS.Notifications.createNotification(
      newEntry.patientId,
      'patient',
      'Joined Waiting List',
      `You are at Queue Position #${queuePosition} for ${dept.name} (${doctorName}) between ${Utils.formatDate(startDate)} and ${Utils.formatDate(endDate)}.`,
      'waitlist',
      { waitlistId: newEntry.id }
    );

    return { success: true, waitlistEntry: newEntry };
  }

  /**
   * THE CORE AUTOMATIC ALLOCATION ALGORITHM
   * Called when an appointment is cancelled or rescheduled, or when an offer is declined/expired.
   * Matches the newly released slot with the highest priority eligible patient in queue.
   *
   * @param {Object} releasedSlot - { doctorId, doctorName, departmentId, departmentName, date, startTime, endTime, consultationFee, originalAppointmentId }
   * @returns {Object} { allocated: boolean, candidate: Object|null, message: string }
   */
  function processReleasedSlot(releasedSlot) {
    const Storage = getStorage();
    const Utils = getUtils();
    const settings = getSettings();

    if (!releasedSlot || !releasedSlot.doctorId || !releasedSlot.date || !releasedSlot.startTime) {
      return { allocated: false, message: 'Invalid slot specification for allocation.' };
    }

    console.log('[SHAS Waitlist] Processing released slot for automatic allocation:', releasedSlot);

    // 1. Retrieve all active waitlist entries
    const waitlist = Storage.getData(Storage.KEYS.WAITLIST, []);

    // 2. Filter strictly eligible entries
    const eligibleCandidates = waitlist.filter((entry) => {
      // Must be WAITING status
      if (entry.status !== 'WAITING') return false;

      // Department must match
      if (entry.departmentId !== releasedSlot.departmentId) return false;

      // Doctor preference: either ANY or matches the released slot doctor
      if (entry.preferredDoctorId !== 'ANY' && entry.preferredDoctorId !== releasedSlot.doctorId) {
        return false;
      }

      // Slot date must fall within patient's preferred date range [startDate, endDate]
      if (entry.preferredStartDate && releasedSlot.date < entry.preferredStartDate) {
        return false;
      }
      if (entry.preferredEndDate && releasedSlot.date > entry.preferredEndDate) {
        return false;
      }

      // Time range preference must match
      if (!matchesTimeRange(releasedSlot.startTime, entry.preferredTimeRange)) {
        return false;
      }

      return true;
    });

    // 3. Sort eligible candidates by queuePosition ascending (or createdAt ascending for FIFO)
    eligibleCandidates.sort((a, b) => {
      const posA = a.queuePosition !== undefined ? a.queuePosition : 999;
      const posB = b.queuePosition !== undefined ? b.queuePosition : 999;
      if (posA !== posB) return posA - posB;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    if (eligibleCandidates.length === 0) {
      console.log('[SHAS Waitlist] No eligible candidates found in waitlist queue for this slot.');
      Storage.logAudit('SLOT_RELEASED_GENERAL', {
        slot: releasedSlot,
        note: 'Slot returned to general booking pool: no eligible waitlist matches.'
      });
      return {
        allocated: false,
        message: 'No eligible waitlist entries matched this slot. Slot returned to general booking.'
      };
    }

    // 4. Select the highest priority candidate
    const chosenCandidate = eligibleCandidates[0];
    const expiryMinutes = settings.offerExpiryMinutes || 15;
    const expiresAt = Date.now() + expiryMinutes * 60 * 1000;

    // 5. Update the candidate entry to OFFERED
    const candidateIndex = waitlist.findIndex((w) => w.id === chosenCandidate.id);
    if (candidateIndex !== -1) {
      waitlist[candidateIndex].status = 'OFFERED';
      waitlist[candidateIndex].offeredSlot = {
        doctorId: releasedSlot.doctorId,
        doctorName: releasedSlot.doctorName,
        departmentId: releasedSlot.departmentId,
        departmentName: releasedSlot.departmentName,
        date: releasedSlot.date,
        startTime: releasedSlot.startTime,
        endTime: releasedSlot.endTime,
        consultationFee: releasedSlot.consultationFee || 100,
        originalAppointmentId: releasedSlot.originalAppointmentId || null
      };
      waitlist[candidateIndex].offerExpiresAt = expiresAt;
      waitlist[candidateIndex].offeredAt = new Date().toISOString();

      Storage.setData(Storage.KEYS.WAITLIST, waitlist);
    }

    // 6. Record temporary slot reservation in WAITLIST_OFFERS to block general public booking
    const offers = Storage.getData(Storage.KEYS.WAITLIST_OFFERS, []);
    offers.push({
      waitlistId: chosenCandidate.id,
      patientId: chosenCandidate.patientId,
      doctorId: releasedSlot.doctorId,
      date: releasedSlot.date,
      startTime: releasedSlot.startTime,
      endTime: releasedSlot.endTime,
      expiresAt
    });
    Storage.setData(Storage.KEYS.WAITLIST_OFFERS, offers);

    // 7. Re-index remaining waiting candidates in this department
    reindexQueuePositions(releasedSlot.departmentId);

    // 8. Log audit trail
    Storage.logAudit('WAITLIST_SLOT_OFFERED', {
      waitlistId: chosenCandidate.id,
      patientName: chosenCandidate.patientName,
      doctorName: releasedSlot.doctorName,
      date: releasedSlot.date,
      time: releasedSlot.startTime,
      expiresAt: new Date(expiresAt).toISOString()
    });

    // 9. Dispatch high-priority patient notification
    window.SHAS.Notifications.createNotification(
      chosenCandidate.patientId,
      'patient',
      '⚡ Urgent: New Appointment Slot Offered!',
      `A slot opened up with ${releasedSlot.doctorName} on ${Utils.formatDate(releasedSlot.date)} at ${Utils.formatTime(releasedSlot.startTime)}. You have ${expiryMinutes} minutes to accept before it passes to the next person.`,
      'offer',
      { waitlistId: chosenCandidate.id, slot: releasedSlot }
    );

    // Admin notification
    window.SHAS.Notifications.createNotification(
      'admin-1',
      'admin',
      'Waitlist Auto-Allocation Triggered',
      `Released slot with ${releasedSlot.doctorName} (${Utils.formatDate(releasedSlot.date)} ${releasedSlot.startTime}) automatically offered to ${chosenCandidate.patientName} (Queue #1).`,
      'system',
      { waitlistId: chosenCandidate.id }
    );

    console.log(`[SHAS Waitlist] Slot successfully allocated to ${chosenCandidate.patientName} with ${expiryMinutes}m offer window.`);

    return {
      allocated: true,
      candidate: chosenCandidate,
      expiresAt,
      message: `Released slot automatically allocated to ${chosenCandidate.patientName} (Offer expires in ${expiryMinutes}m).`
    };
  }

  /**
   * Re-indexes queue positions for waiting patients in a department
   */
  function reindexQueuePositions(deptId) {
    const Storage = getStorage();
    const waitlist = Storage.getData(Storage.KEYS.WAITLIST, []);
    const deptWaiting = waitlist
      .filter((w) => w.departmentId === deptId && w.status === 'WAITING')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    deptWaiting.forEach((item, idx) => {
      const match = waitlist.find((w) => w.id === item.id);
      if (match) match.queuePosition = idx + 1;
    });

    Storage.setData(Storage.KEYS.WAITLIST, waitlist, true);
  }

  /**
   * Patient ACCEPTS an offered appointment slot
   */
  function acceptOffer(waitlistId) {
    const Storage = getStorage();
    const Utils = getUtils();

    const waitlist = Storage.getData(Storage.KEYS.WAITLIST, []);
    const entryIndex = waitlist.findIndex((w) => w.id === waitlistId);

    if (entryIndex === -1) {
      return { success: false, error: 'Waiting list entry not found.' };
    }

    const entry = waitlist[entryIndex];
    if (entry.status !== 'OFFERED') {
      return { success: false, error: `Cannot accept offer with status "${entry.status}".` };
    }

    // Verify offer has not expired
    if (entry.offerExpiresAt && Date.now() > entry.offerExpiresAt) {
      handleExpiredOffer(entry);
      return { success: false, error: 'This slot offer has expired and was released to the next candidate.' };
    }

    const slot = entry.offeredSlot;
    if (!slot) {
      return { success: false, error: 'No offered slot data attached.' };
    }

    // Double check availability (make sure no overlapping appointment was inserted)
    const appointments = Storage.getData(Storage.KEYS.APPOINTMENTS, []);
    const conflicting = appointments.find(
      (apt) =>
        apt.doctorId === slot.doctorId &&
        apt.appointmentDate === slot.date &&
        apt.status === 'CONFIRMED' &&
        Utils.isTimeOverlap(slot.startTime, slot.endTime, apt.startTime, apt.endTime)
    );

    if (conflicting) {
      return { success: false, error: 'Internal conflict: slot is already occupied.' };
    }

    // Create the confirmed appointment
    const newAppointment = {
      id: 'apt-' + Utils.generateUUID().substring(0, 8),
      bookingRef: Utils.generateBookingRef(),
      patientId: entry.patientId,
      patientName: entry.patientName,
      patientEmail: entry.patientEmail,
      patientPhone: entry.patientPhone,
      doctorId: slot.doctorId,
      doctorName: slot.doctorName,
      departmentId: slot.departmentId,
      departmentName: slot.departmentName,
      appointmentDate: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      consultationFee: slot.consultationFee,
      status: 'CONFIRMED',
      notes: `Allocated via Automatic Waiting List (Original Request: ${entry.id})`,
      createdAt: new Date().toISOString()
    };

    appointments.push(newAppointment);
    Storage.setData(Storage.KEYS.APPOINTMENTS, appointments);

    // Update waitlist entry to FULFILLED
    waitlist[entryIndex].status = 'FULFILLED';
    waitlist[entryIndex].fulfilledAppointmentId = newAppointment.id;
    waitlist[entryIndex].fulfilledAt = new Date().toISOString();
    Storage.setData(Storage.KEYS.WAITLIST, waitlist);

    // Remove the temporary slot reservation
    removeTemporaryReservation(waitlistId);

    // Log audit
    Storage.logAudit('WAITLIST_OFFER_ACCEPTED', {
      waitlistId,
      patientName: entry.patientName,
      appointmentId: newAppointment.id,
      bookingRef: newAppointment.bookingRef
    });

    // Notify patient
    window.SHAS.Notifications.createNotification(
      entry.patientId,
      'patient',
      'Appointment Confirmed from Waitlist!',
      `Congratulations! Your appointment with ${slot.doctorName} on ${Utils.formatDate(slot.date)} at ${Utils.formatTime(slot.startTime)} is confirmed (Ref: ${newAppointment.bookingRef}).`,
      'appointment',
      { appointmentId: newAppointment.id }
    );

    return {
      success: true,
      appointment: newAppointment,
      message: `Offer accepted! Appointment ${newAppointment.bookingRef} successfully confirmed.`
    };
  }

  /**
   * Patient DECLINES an offered appointment slot
   * The slot is released and immediately offered to the next eligible patient!
   */
  function declineOffer(waitlistId, reason = 'Patient declined offer') {
    const Storage = getStorage();
    const waitlist = Storage.getData(Storage.KEYS.WAITLIST, []);
    const entryIndex = waitlist.findIndex((w) => w.id === waitlistId);

    if (entryIndex === -1) {
      return { success: false, error: 'Waiting list entry not found.' };
    }

    const entry = waitlist[entryIndex];
    if (entry.status !== 'OFFERED') {
      return { success: false, error: `Cannot decline offer with status "${entry.status}".` };
    }

    const releasedSlot = entry.offeredSlot;

    // Mark as DECLINED
    waitlist[entryIndex].status = 'DECLINED';
    waitlist[entryIndex].declinedReason = reason;
    waitlist[entryIndex].declinedAt = new Date().toISOString();
    Storage.setData(Storage.KEYS.WAITLIST, waitlist);

    // Remove reservation
    removeTemporaryReservation(waitlistId);

    Storage.logAudit('WAITLIST_OFFER_DECLINED', {
      waitlistId,
      patientName: entry.patientName,
      reason
    });

    window.SHAS.Notifications.createNotification(
      entry.patientId,
      'patient',
      'Offer Declined',
      `You declined the appointment offer for ${releasedSlot ? releasedSlot.doctorName : 'the slot'}.`,
      'system'
    );

    // Re-trigger automatic allocation for the next eligible person in queue!
    let nextAllocation = null;
    if (releasedSlot) {
      console.log('[SHAS Waitlist] Offer was declined. Cascading slot to next candidate in queue...');
      nextAllocation = processReleasedSlot(releasedSlot);
    }

    return {
      success: true,
      message: 'Offer declined. The slot has been cascaded to the next waiting patient.',
      nextAllocation
    };
  }

  /**
   * Handles an expired offer: marks EXPIRED, frees lock, passes slot to next in line
   */
  function handleExpiredOffer(entry) {
    const Storage = getStorage();
    const waitlist = Storage.getData(Storage.KEYS.WAITLIST, []);
    const index = waitlist.findIndex((w) => w.id === entry.id);

    if (index === -1) return;

    const releasedSlot = waitlist[index].offeredSlot;
    waitlist[index].status = 'EXPIRED';
    waitlist[index].expiredAt = new Date().toISOString();
    Storage.setData(Storage.KEYS.WAITLIST, waitlist);

    removeTemporaryReservation(entry.id);

    Storage.logAudit('WAITLIST_OFFER_EXPIRED', {
      waitlistId: entry.id,
      patientName: entry.patientName
    });

    window.SHAS.Notifications.createNotification(
      entry.patientId,
      'patient',
      'Appointment Offer Expired',
      `Your reservation window for ${releasedSlot ? releasedSlot.doctorName : 'the appointment'} has ended.`,
      'system'
    );

    // Immediately cascade released slot to next patient
    if (releasedSlot) {
      console.log('[SHAS Waitlist] Offer expired. Automatically re-allocating to next candidate...');
      processReleasedSlot(releasedSlot);
    }
  }

  /**
   * Removes temporary reservation from WAITLIST_OFFERS
   */
  function removeTemporaryReservation(waitlistId) {
    const Storage = getStorage();
    const offers = Storage.getData(Storage.KEYS.WAITLIST_OFFERS, []);
    const updated = offers.filter((o) => o.waitlistId !== waitlistId);
    Storage.setData(Storage.KEYS.WAITLIST_OFFERS, updated, true);
  }

  /**
   * Scans all OFFERED items and automatically expires any whose deadline has elapsed.
   * Runs on foreground intervals and page reloads.
   */
  function checkAndExpireOffers() {
    const Storage = getStorage();
    const waitlist = Storage.getData(Storage.KEYS.WAITLIST, []);
    const now = Date.now();
    let expiredCount = 0;

    waitlist.forEach((entry) => {
      if (entry.status === 'OFFERED' && entry.offerExpiresAt && now > entry.offerExpiresAt) {
        console.log(`[SHAS Waitlist] Expiring offer for ${entry.patientName} (${entry.id})`);
        handleExpiredOffer(entry);
        expiredCount++;
      }
    });

    return expiredCount;
  }

  /**
   * HACKATHON DEMO HELPER:
   * Forces an offer to expire immediately so judges don't have to wait 15 minutes!
   */
  function forceExpireOffer(waitlistId) {
    const Storage = getStorage();
    const waitlist = Storage.getData(Storage.KEYS.WAITLIST, []);
    const entry = waitlist.find((w) => w.id === waitlistId);
    if (!entry) return { success: false, error: 'Waitlist item not found' };

    entry.offerExpiresAt = Date.now() - 1000; // set to 1 second ago
    handleExpiredOffer(entry);
    return { success: true, message: 'Offer expired immediately for demo testing.' };
  }

  /**
   * Cancels a waiting list entry (by patient or admin)
   */
  function cancelWaitlistEntry(waitlistId, reason = 'Cancelled by user') {
    const Storage = getStorage();
    const waitlist = Storage.getData(Storage.KEYS.WAITLIST, []);
    const entryIndex = waitlist.findIndex((w) => w.id === waitlistId);

    if (entryIndex === -1) {
      return { success: false, error: 'Waitlist entry not found.' };
    }

    const entry = waitlist[entryIndex];
    const prevStatus = entry.status;
    const releasedSlot = entry.offeredSlot;

    waitlist[entryIndex].status = 'CANCELLED';
    waitlist[entryIndex].cancelledReason = reason;
    waitlist[entryIndex].cancelledAt = new Date().toISOString();
    Storage.setData(Storage.KEYS.WAITLIST, waitlist);

    removeTemporaryReservation(waitlistId);

    // If it was in OFFERED status, pass that slot to the next candidate!
    if (prevStatus === 'OFFERED' && releasedSlot) {
      processReleasedSlot(releasedSlot);
    }

    reindexQueuePositions(entry.departmentId);

    Storage.logAudit('WAITLIST_CANCELLED', { waitlistId, patientName: entry.patientName, reason });

    return { success: true, message: 'Waitlist entry cancelled.' };
  }

  /**
   * Returns audit logs for inspection
   */
  function getAuditLogs() {
    return getStorage().getData(getStorage().KEYS.AUDIT_LOGS, []);
  }

  return {
    getAllWaitlist,
    getPatientWaitlist,
    getPatientPendingOffers,
    joinWaitlist,
    processReleasedSlot,
    acceptOffer,
    declineOffer,
    checkAndExpireOffers,
    forceExpireOffer,
    cancelWaitlistEntry,
    getAuditLogs
  };
})();
