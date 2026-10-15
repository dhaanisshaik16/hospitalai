/**
 * Smart Hospital Appointment System (SHAS) - Dashboard Module
 * Renders dynamic, responsive interfaces for Patient, Doctor, and Admin dashboards,
 * including real-time KPI metrics, interactive appointment lists, live countdowns,
 * doctor schedule blocks, and administrative control panels.
 */

window.SHAS = window.SHAS || {};

window.SHAS.Dashboard = (function () {
  'use strict';

  function getStorage() {
    return window.SHAS.Storage;
  }

  function getUtils() {
    return window.SHAS.Utils;
  }

  /**
   * Helper: generates status badge HTML
   */
  function renderStatusBadge(status) {
    const s = (status || '').toUpperCase();
    const map = {
      CONFIRMED: { text: 'Confirmed', class: 'badge-confirmed', icon: '✓' },
      COMPLETED: { text: 'Completed', class: 'badge-completed', icon: '●' },
      CANCELLED: { text: 'Cancelled', class: 'badge-cancelled', icon: '✕' },
      NO_SHOW: { text: 'No Show', class: 'badge-noshow', icon: '⊘' },
      WAITING: { text: 'In Waitlist', class: 'badge-waitlist', icon: '⏳' },
      OFFERED: { text: 'Slot Offered!', class: 'badge-offered', icon: '⚡' },
      ACCEPTED: { text: 'Accepted', class: 'badge-confirmed', icon: '✓' },
      DECLINED: { text: 'Declined', class: 'badge-cancelled', icon: '✕' },
      EXPIRED: { text: 'Expired', class: 'badge-expired', icon: '⏰' },
      FULFILLED: { text: 'Fulfilled', class: 'badge-completed', icon: '★' }
    };

    const config = map[s] || { text: status, class: 'badge-neutral', icon: '•' };
    return `<span class="badge ${config.class}"><span class="badge-icon">${config.icon}</span> ${config.text}</span>`;
  }

  /* ==========================================================================
     PATIENT DASHBOARD
     ========================================================================== */

  /**
   * Renders the complete patient dashboard view
   */
  function renderPatientDashboard(container, activeTab = 'all') {
    const session = getStorage().getDemoSession();
    const patientId = session.userId || 'pat-1';
    const patients = getStorage().getData(getStorage().KEYS.PATIENTS, []);
    const patient = patients.find((p) => p.id === patientId) || {
      name: session.userName || 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      phone: '+1 (555) 234-5678',
      bloodGroup: 'A+',
      dob: '1989-04-12'
    };

    const appointments = window.SHAS.Appointments.getAllAppointments({ patientId });
    const waitlistItems = window.SHAS.Waitlist.getPatientWaitlist(patientId);
    const pendingOffers = window.SHAS.Waitlist.getPatientPendingOffers(patientId);

    const today = getUtils().getTodayDateString();
    const upcomingApts = appointments.filter((a) => a.status === 'CONFIRMED' && a.appointmentDate >= today);
    const completedApts = appointments.filter((a) => a.status === 'COMPLETED');
    const cancelledApts = appointments.filter((a) => a.status === 'CANCELLED');
    const nextAppointment = upcomingApts.length > 0 ? upcomingApts[0] : null;

    let filteredAppointments = appointments;
    if (activeTab === 'upcoming') filteredAppointments = upcomingApts;
    if (activeTab === 'completed') filteredAppointments = completedApts;
    if (activeTab === 'cancelled') filteredAppointments = cancelledApts;

    let html = `
      <div class="patient-dashboard-container animate-fade-in">
        <!-- Top Profile Welcome Bar -->
        <div class="dashboard-header-card">
          <div class="user-greeting-wrap">
            <div class="user-avatar-large">${getUtils().escapeHTML(patient.name.charAt(0))}</div>
            <div>
              <div class="greeting-subtitle">Patient Portal</div>
              <h1 class="greeting-title">Welcome back, ${getUtils().escapeHTML(patient.name)}</h1>
              <div class="user-meta-tags">
                <span class="meta-tag"><i class="icon-email">✉</i> ${getUtils().escapeHTML(patient.email)}</span>
                <span class="meta-tag"><i class="icon-phone">☎</i> ${getUtils().escapeHTML(patient.phone)}</span>
                <span class="meta-tag"><i class="icon-blood">🩸</i> Blood Group: ${getUtils().escapeHTML(patient.bloodGroup || 'O+')}</span>
              </div>
            </div>
          </div>
          <div class="header-action-buttons">
            <button class="btn btn-primary btn-book-appointment-trigger" id="btn-book-flow-trigger">
              <span class="btn-icon">＋</span> Book New Appointment
            </button>
            <button class="btn btn-secondary btn-join-waitlist-trigger" id="btn-waitlist-flow-trigger">
              <span class="btn-icon">⏳</span> Join Waiting List
            </button>
          </div>
        </div>

        <!-- ACTIVE SLOT OFFER BANNER (If patient has a pending slot offer) -->
        ${renderPendingOfferBanner(pendingOffers)}

        <!-- Quick KPI Stats -->
        <div class="stats-grid">
          <div class="stat-card stat-primary">
            <div class="stat-icon-wrap">📅</div>
            <div class="stat-content">
              <div class="stat-value">${upcomingApts.length}</div>
              <div class="stat-label">Upcoming Visits</div>
            </div>
          </div>
          <div class="stat-card stat-teal">
            <div class="stat-icon-wrap">⏳</div>
            <div class="stat-content">
              <div class="stat-value">${waitlistItems.filter((w) => w.status === 'WAITING').length}</div>
              <div class="stat-label">Waitlist Requests</div>
            </div>
          </div>
          <div class="stat-card stat-amber">
            <div class="stat-icon-wrap">⚡</div>
            <div class="stat-content">
              <div class="stat-value">${pendingOffers.length}</div>
              <div class="stat-label">Active Slot Offers</div>
            </div>
          </div>
          <div class="stat-card stat-purple">
            <div class="stat-icon-wrap">✓</div>
            <div class="stat-content">
              <div class="stat-value">${completedApts.length}</div>
              <div class="stat-label">Completed Consults</div>
            </div>
          </div>
        </div>

        <!-- Next Appointment Spotlight Card -->
        ${
          nextAppointment
            ? `
          <div class="next-appointment-card">
            <div class="spotlight-badge">NEXT APPOINTMENT</div>
            <div class="next-apt-body">
              <div class="doctor-snippet">
                <div class="doc-avatar-medium">🩺</div>
                <div>
                  <h3 class="next-doc-name">${getUtils().escapeHTML(nextAppointment.doctorName)}</h3>
                  <p class="next-dept-name">${getUtils().escapeHTML(nextAppointment.departmentName)}</p>
                  <p class="next-ref-code">Ref: <strong>${getUtils().escapeHTML(nextAppointment.bookingRef)}</strong></p>
                </div>
              </div>
              <div class="schedule-snippet">
                <div class="time-block">
                  <div class="time-day">${getUtils().formatDate(nextAppointment.appointmentDate)}</div>
                  <div class="time-hours">${getUtils().formatTimeRange(nextAppointment.startTime, nextAppointment.endTime)}</div>
                </div>
                <div class="apt-actions">
                  <button class="btn btn-sm btn-outline btn-reschedule" data-apt-id="${nextAppointment.id}">Reschedule</button>
                  <button class="btn btn-sm btn-danger-outline btn-cancel-apt" data-apt-id="${nextAppointment.id}">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        `
            : `
          <div class="empty-spotlight-card">
            <div class="empty-icon">📅</div>
            <h3>No upcoming appointments scheduled</h3>
            <p>Need to see a doctor? Find available specialist slots or join the waitlist.</p>
            <button class="btn btn-primary btn-sm btn-book-appointment-trigger">Find Available Slots</button>
          </div>
        `
        }

        <!-- Tabs Navigation -->
        <div class="dashboard-tabs-bar">
          <button class="tab-btn ${activeTab === 'all' ? 'active' : ''}" data-tab="all">
            All Records (${appointments.length})
          </button>
          <button class="tab-btn ${activeTab === 'upcoming' ? 'active' : ''}" data-tab="upcoming">
            Upcoming (${upcomingApts.length})
          </button>
          <button class="tab-btn ${activeTab === 'waitlist' ? 'active' : ''}" data-tab="waitlist">
            Waitlist Entries (${waitlistItems.length})
          </button>
          <button class="tab-btn ${activeTab === 'completed' ? 'active' : ''}" data-tab="completed">
            Past / Completed (${completedApts.length})
          </button>
          <button class="tab-btn ${activeTab === 'cancelled' ? 'active' : ''}" data-tab="cancelled">
            Cancelled (${cancelledApts.length})
          </button>
        </div>

        <!-- Tab Content View -->
        <div class="tab-content-area">
          ${
            activeTab === 'waitlist'
              ? renderPatientWaitlistTab(waitlistItems)
              : renderPatientAppointmentsList(filteredAppointments)
          }
        </div>
      </div>
    `;

    container.innerHTML = html;
    bindPatientDashboardEvents(container);
  }

  /**
   * Renders the interactive Offer banner with countdown timer
   */
  function renderPendingOfferBanner(pendingOffers) {
    if (!pendingOffers || pendingOffers.length === 0) return '';
    const offer = pendingOffers[0];
    const slot = offer.offeredSlot;
    if (!slot) return '';

    const remainingMs = Math.max(0, offer.offerExpiresAt - Date.now());
    const remainingMins = Math.floor(remainingMs / 60000);
    const remainingSecs = Math.floor((remainingMs % 60000) / 1000);
    const timeDisplay = `${String(remainingMins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;

    return `
      <div class="offer-urgent-banner animate-pulse-glow" id="active-offer-banner" data-waitlist-id="${offer.id}">
        <div class="offer-banner-content">
          <div class="offer-badge-label">⚡ TIME-SENSITIVE SLOT ALLOCATION</div>
          <h2 class="offer-title">An appointment slot is available for you!</h2>
          <p class="offer-details">
            <strong>${getUtils().escapeHTML(slot.doctorName)}</strong> (${getUtils().escapeHTML(slot.departmentName)})
            • Date: <strong>${getUtils().formatDate(slot.date)}</strong>
            • Time: <strong>${getUtils().formatTime(slot.startTime)} - ${getUtils().formatTime(slot.endTime)}</strong>
          </p>
          <div class="offer-timer-wrap">
            <span>Offer expires in:</span>
            <div class="offer-countdown-clock" id="offer-countdown-clock">${timeDisplay}</div>
          </div>
        </div>
        <div class="offer-action-buttons">
          <button class="btn btn-success btn-lg btn-accept-offer" data-waitlist-id="${offer.id}">
            ✓ Accept & Confirm Appointment
          </button>
          <button class="btn btn-secondary btn-decline-offer" data-waitlist-id="${offer.id}">
            ✕ Decline Slot
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Renders patient appointments list table / cards
   */
  function renderPatientAppointmentsList(appointments) {
    if (!appointments || appointments.length === 0) {
      return `
        <div class="empty-state-card">
          <div class="empty-icon">📋</div>
          <h3>No appointments found</h3>
          <p>No appointments match the selected filter category.</p>
        </div>
      `;
    }

    return `
      <div class="appointments-table-card">
        <div class="table-responsive">
          <table class="shas-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Doctor</th>
                <th>Department</th>
                <th>Date & Time</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${appointments
                .map((apt) => {
                  const isUpcoming = apt.status === 'CONFIRMED' && apt.appointmentDate >= getUtils().getTodayDateString();
                  return `
                  <tr>
                    <td><strong class="code-ref">${getUtils().escapeHTML(apt.bookingRef)}</strong></td>
                    <td>
                      <div class="cell-doctor">
                        <span class="cell-title">${getUtils().escapeHTML(apt.doctorName)}</span>
                      </div>
                    </td>
                    <td>${getUtils().escapeHTML(apt.departmentName)}</td>
                    <td>
                      <div><strong>${getUtils().formatDate(apt.appointmentDate)}</strong></div>
                      <div class="text-muted text-sm">${getUtils().formatTimeRange(apt.startTime, apt.endTime)}</div>
                    </td>
                    <td>$${apt.consultationFee}</td>
                    <td>${renderStatusBadge(apt.status)}</td>
                    <td>
                      <div class="table-actions">
                        <button class="btn-icon-action btn-view-apt" data-apt-id="${apt.id}" title="View Details">👁</button>
                        ${
                          isUpcoming
                            ? `
                          <button class="btn-icon-action btn-reschedule" data-apt-id="${apt.id}" title="Reschedule">🔄</button>
                          <button class="btn-icon-action text-danger btn-cancel-apt" data-apt-id="${apt.id}" title="Cancel Appointment">✕</button>
                        `
                            : ''
                        }
                      </div>
                    </td>
                  </tr>
                `;
                })
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Renders patient waitlist tab
   */
  function renderPatientWaitlistTab(waitlistItems) {
    if (!waitlistItems || waitlistItems.length === 0) {
      return `
        <div class="empty-state-card">
          <div class="empty-icon">⏳</div>
          <h3>No active waitlist entries</h3>
          <p>When high-demand doctors are fully booked, join the waiting list to automatically secure newly cancelled slots.</p>
          <button class="btn btn-primary btn-sm btn-join-waitlist-trigger">Join Waiting List</button>
        </div>
      `;
    }

    return `
      <div class="waitlist-card-grid">
        ${waitlistItems
          .map((item) => {
            const isWaiting = item.status === 'WAITING';
            const isOffered = item.status === 'OFFERED';
            return `
            <div class="waitlist-ticket-card ${isOffered ? 'ticket-offered' : ''}">
              <div class="ticket-header">
                <span class="queue-pill">Queue Position: #${item.queuePosition || 1}</span>
                ${renderStatusBadge(item.status)}
              </div>
              <div class="ticket-body">
                <h3 class="ticket-dept">${getUtils().escapeHTML(item.departmentName)}</h3>
                <p class="ticket-pref-doc">Preferred Doctor: <strong>${getUtils().escapeHTML(item.preferredDoctorName)}</strong></p>
                <div class="ticket-pref-dates">
                  <span>📅 Dates: ${getUtils().formatDate(item.preferredStartDate)} - ${getUtils().formatDate(item.preferredEndDate)}</span>
                  <span>⏰ Time: ${getUtils().escapeHTML(item.preferredTimeRange)}</span>
                </div>
                ${item.notes ? `<p class="ticket-notes"><em>"${getUtils().escapeHTML(item.notes)}"</em></p>` : ''}
                
                ${
                  isOffered && item.offeredSlot
                    ? `
                  <div class="offered-slot-mini-card">
                    <div class="mini-card-title">⚡ Available Slot Offered!</div>
                    <div>Doctor: <strong>${getUtils().escapeHTML(item.offeredSlot.doctorName)}</strong></div>
                    <div>Time: ${getUtils().formatDate(item.offeredSlot.date)} at ${getUtils().formatTime(item.offeredSlot.startTime)}</div>
                    <div class="mini-card-actions">
                      <button class="btn btn-sm btn-success btn-accept-offer" data-waitlist-id="${item.id}">Accept</button>
                      <button class="btn btn-sm btn-secondary btn-decline-offer" data-waitlist-id="${item.id}">Decline</button>
                    </div>
                  </div>
                `
                    : ''
                }
              </div>
              <div class="ticket-footer">
                <span class="text-muted text-xs">Requested ${getUtils().formatRelativeTime(new Date(item.createdAt).getTime())}</span>
                ${
                  isWaiting
                    ? `<button class="btn-text-danger btn-cancel-waitlist" data-waitlist-id="${item.id}">Leave Queue</button>`
                    : ''
                }
              </div>
            </div>
          `;
          })
          .join('')}
      </div>
    `;
  }

  /**
   * Binds click handlers for patient dashboard
   */
  function bindPatientDashboardEvents(container) {
    // Tabs
    container.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        renderPatientDashboard(container, tab);
      });
    });

    // Accept offer
    container.querySelectorAll('.btn-accept-offer').forEach((btn) => {
      btn.addEventListener('click', () => {
        const waitlistId = btn.getAttribute('data-waitlist-id');
        const res = window.SHAS.Waitlist.acceptOffer(waitlistId);
        if (res.success) {
          getUtils().showToast('Offer Accepted!', res.message, 'success');
          renderPatientDashboard(container, 'all');
        } else {
          getUtils().showToast('Offer Error', res.error, 'error');
        }
      });
    });

    // Decline offer
    container.querySelectorAll('.btn-decline-offer').forEach((btn) => {
      btn.addEventListener('click', () => {
        const waitlistId = btn.getAttribute('data-waitlist-id');
        if (confirm('Are you sure you want to decline this slot? It will immediately be offered to the next waiting patient.')) {
          const res = window.SHAS.Waitlist.declineOffer(waitlistId, 'Patient declined slot');
          if (res.success) {
            getUtils().showToast('Offer Declined', res.message, 'info');
            renderPatientDashboard(container, 'all');
          } else {
            getUtils().showToast('Error', res.error, 'error');
          }
        }
      });
    });

    // Cancel appointment
    container.querySelectorAll('.btn-cancel-apt').forEach((btn) => {
      btn.addEventListener('click', () => {
        const aptId = btn.getAttribute('data-apt-id');
        openCancellationModal(aptId);
      });
    });

    // Reschedule appointment
    container.querySelectorAll('.btn-reschedule').forEach((btn) => {
      btn.addEventListener('click', () => {
        const aptId = btn.getAttribute('data-apt-id');
        openRescheduleModal(aptId);
      });
    });

    // Leave waitlist
    container.querySelectorAll('.btn-cancel-waitlist').forEach((btn) => {
      btn.addEventListener('click', () => {
        const wlId = btn.getAttribute('data-waitlist-id');
        if (confirm('Cancel your waiting list request?')) {
          window.SHAS.Waitlist.cancelWaitlistEntry(wlId, 'Patient withdrew request');
          renderPatientDashboard(container, 'waitlist');
        }
      });
    });

    // View appointment details
    container.querySelectorAll('.btn-view-apt').forEach((btn) => {
      btn.addEventListener('click', () => {
        const aptId = btn.getAttribute('data-apt-id');
        openAppointmentDetailsModal(aptId);
      });
    });

    // Trigger book appointment flow
    container.querySelectorAll('.btn-book-appointment-trigger').forEach((btn) => {
      btn.addEventListener('click', () => {
        window.SHAS.App.navigateTo('booking');
      });
    });

    // Trigger waitlist modal
    container.querySelectorAll('.btn-join-waitlist-trigger').forEach((btn) => {
      btn.addEventListener('click', () => {
        openJoinWaitlistModal();
      });
    });
  }

  /* ==========================================================================
     DOCTOR DASHBOARD
     ========================================================================== */

  /**
   * Renders the dedicated doctor dashboard
   */
  function renderDoctorDashboard(container, selectedDoctorId) {
    const doctors = window.SHAS.Doctors.getAllDoctors({ activeOnly: false });
    const doctorId = selectedDoctorId || doctors[0]?.id || 'doc-cardio-1';
    const doctor = window.SHAS.Doctors.getDoctorById(doctorId);

    if (!doctor) {
      container.innerHTML = '<div class="p-4">Doctor record not found.</div>';
      return;
    }

    const today = getUtils().getTodayDateString();
    const allApts = window.SHAS.Appointments.getAllAppointments({ doctorId });
    const todayApts = allApts.filter((a) => a.appointmentDate === today && a.status === 'CONFIRMED');
    const upcomingApts = allApts.filter((a) => a.appointmentDate > today && a.status === 'CONFIRMED');
    const completedApts = allApts.filter((a) => a.status === 'COMPLETED');
    const cancelledApts = allApts.filter((a) => a.status === 'CANCELLED');

    const weeklyAvailability = window.SHAS.Availability.getWeeklyAvailability(doctorId, today);

    let html = `
      <div class="doctor-dashboard-container animate-fade-in">
        <!-- Doctor Selector & Profile Header -->
        <div class="dashboard-header-card doctor-header-card">
          <div class="doctor-profile-hero">
            <img src="${getUtils().escapeHTML(doctor.avatar)}" alt="${getUtils().escapeHTML(doctor.name)}" class="doc-avatar-large" />
            <div>
              <div class="greeting-subtitle">${getUtils().escapeHTML(doctor.departmentName)} Specialist</div>
              <h1 class="greeting-title">${getUtils().escapeHTML(doctor.name)}</h1>
              <p class="doc-qualifications">${getUtils().escapeHTML(doctor.qualification)} • ${doctor.experienceYears} Years Exp</p>
              <div class="user-meta-tags">
                <span class="meta-tag">Fee: $${doctor.consultationFee}</span>
                <span class="meta-tag">Duration: ${doctor.consultationDuration} mins</span>
                <span class="meta-tag">⭐ ${doctor.rating} (${doctor.reviewsCount} reviews)</span>
                <span class="badge ${doctor.active ? 'badge-confirmed' : 'badge-cancelled'}">${doctor.active ? 'Active Clinic' : 'Inactive'}</span>
              </div>
            </div>
          </div>
          <div class="doctor-switcher-wrap">
            <label for="doctor-select-switch"><strong>Switch Doctor Profile:</strong></label>
            <select id="doctor-select-switch" class="form-select">
              ${doctors
                .map((d) => `<option value="${d.id}" ${d.id === doctorId ? 'selected' : ''}>${getUtils().escapeHTML(d.name)} (${getUtils().escapeHTML(d.departmentName)})</option>`)
                .join('')}
            </select>
          </div>
        </div>

        <!-- Doctor KPI Stats -->
        <div class="stats-grid">
          <div class="stat-card stat-primary">
            <div class="stat-icon-wrap">🩺</div>
            <div class="stat-content">
              <div class="stat-value">${todayApts.length}</div>
              <div class="stat-label">Today's Patients</div>
            </div>
          </div>
          <div class="stat-card stat-teal">
            <div class="stat-icon-wrap">📅</div>
            <div class="stat-content">
              <div class="stat-value">${upcomingApts.length}</div>
              <div class="stat-label">Upcoming Bookings</div>
            </div>
          </div>
          <div class="stat-card stat-purple">
            <div class="stat-icon-wrap">✓</div>
            <div class="stat-content">
              <div class="stat-value">${completedApts.length}</div>
              <div class="stat-label">Completed Consults</div>
            </div>
          </div>
          <div class="stat-card stat-rose">
            <div class="stat-icon-wrap">✕</div>
            <div class="stat-content">
              <div class="stat-value">${cancelledApts.length}</div>
              <div class="stat-label">Cancellations</div>
            </div>
          </div>
        </div>

        <!-- 7-Day Capacity & Availability Preview -->
        <div class="weekly-availability-card">
          <h3 class="section-heading">7-Day Slot Availability & Capacity</h3>
          <div class="weekly-pills-grid">
            ${weeklyAvailability
              .map((day) => {
                const isOperating = day.isOperating;
                const pct = day.totalSlots > 0 ? Math.round(((day.totalSlots - day.availableCount) / day.totalSlots) * 100) : 0;
                return `
                <div class="day-slot-pill ${!isOperating ? 'pill-off' : ''}">
                  <div class="day-pill-name">${day.dayName.substring(0, 3)}</div>
                  <div class="day-pill-date">${day.formattedDate}</div>
                  ${
                    isOperating
                      ? `
                    <div class="day-pill-count ${day.availableCount === 0 ? 'text-danger' : 'text-teal'}">
                      ${day.availableCount === 0 ? 'Fully Booked' : `${day.availableCount} Free`}
                    </div>
                    <div class="mini-progress-bar"><div class="mini-fill" style="width: ${pct}%"></div></div>
                  `
                      : '<div class="day-pill-off">Off Duty</div>'
                  }
                </div>
              `;
              })
              .join('')}
          </div>
        </div>

        <!-- Today's Schedule Agenda & All Appointments -->
        <div class="doctor-schedule-section">
          <div class="section-header-row">
            <h2 class="section-title">Schedule & Patient Management</h2>
            <div class="text-sm text-muted">Showing all patient appointments for Dr. ${getUtils().escapeHTML(doctor.name)}</div>
          </div>

          <div class="appointments-table-card">
            <div class="table-responsive">
              <table class="shas-table">
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>Patient Name</th>
                    <th>Date</th>
                    <th>Time Window</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>Clinical Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    allApts.length === 0
                      ? '<tr><td colspan="7" class="text-center py-4">No appointments scheduled for this doctor.</td></tr>'
                      : allApts
                          .map((apt) => {
                            const isConfirmed = apt.status === 'CONFIRMED';
                            return `
                        <tr>
                          <td><strong class="code-ref">${getUtils().escapeHTML(apt.bookingRef)}</strong></td>
                          <td>
                            <strong>${getUtils().escapeHTML(apt.patientName)}</strong>
                            <div class="text-xs text-muted">${getUtils().escapeHTML(apt.patientPhone || apt.patientEmail || '')}</div>
                          </td>
                          <td>${getUtils().formatDate(apt.appointmentDate)}</td>
                          <td><strong>${getUtils().formatTimeRange(apt.startTime, apt.endTime)}</strong></td>
                          <td>${renderStatusBadge(apt.status)}</td>
                          <td class="text-sm">${getUtils().escapeHTML(apt.notes || 'Routine checkup')}</td>
                          <td>
                            <div class="table-actions">
                              ${
                                isConfirmed
                                  ? `
                                <button class="btn btn-xs btn-success btn-doctor-complete" data-apt-id="${apt.id}" title="Mark Consultation Completed">✓ Complete</button>
                                <button class="btn btn-xs btn-warning-outline btn-doctor-noshow" data-apt-id="${apt.id}" title="Mark Patient No-Show">No-Show</button>
                                <button class="btn btn-xs btn-danger-outline btn-cancel-apt" data-apt-id="${apt.id}" title="Cancel Consultation (Releases to Waitlist)">Cancel</button>
                              `
                                  : `<button class="btn btn-xs btn-outline btn-view-apt" data-apt-id="${apt.id}">Details</button>`
                              }
                            </div>
                          </td>
                        </tr>
                      `;
                          })
                          .join('')
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Doctor switch dropdown
    const select = container.querySelector('#doctor-select-switch');
    if (select) {
      select.addEventListener('change', (e) => {
        renderDoctorDashboard(container, e.target.value);
      });
    }

    // Complete appointment
    container.querySelectorAll('.btn-doctor-complete').forEach((btn) => {
      btn.addEventListener('click', () => {
        const aptId = btn.getAttribute('data-apt-id');
        window.SHAS.Appointments.markCompleted(aptId);
        getUtils().showToast('Status Updated', 'Appointment marked as Completed.', 'success');
        renderDoctorDashboard(container, doctorId);
      });
    });

    // Mark No-Show
    container.querySelectorAll('.btn-doctor-noshow').forEach((btn) => {
      btn.addEventListener('click', () => {
        const aptId = btn.getAttribute('data-apt-id');
        window.SHAS.Appointments.markNoShow(aptId);
        getUtils().showToast('Status Updated', 'Patient marked as No-Show.', 'warning');
        renderDoctorDashboard(container, doctorId);
      });
    });

    // Cancel appointment
    container.querySelectorAll('.btn-cancel-apt').forEach((btn) => {
      btn.addEventListener('click', () => {
        const aptId = btn.getAttribute('data-apt-id');
        openCancellationModal(aptId, () => renderDoctorDashboard(container, doctorId));
      });
    });

    // View details
    container.querySelectorAll('.btn-view-apt').forEach((btn) => {
      btn.addEventListener('click', () => {
        const aptId = btn.getAttribute('data-apt-id');
        openAppointmentDetailsModal(aptId);
      });
    });
  }

  /* ==========================================================================
     ADMINISTRATOR DASHBOARD
     ========================================================================== */

  /**
   * Renders the administrative operations dashboard
   */
  function renderAdminDashboard(container, activeTab = 'overview') {
    const Storage = getStorage();
    const Utils = getUtils();

    const doctors = Storage.getData(Storage.KEYS.DOCTORS, []);
    const departments = Storage.getData(Storage.KEYS.DEPARTMENTS, []);
    const appointments = Storage.getData(Storage.KEYS.APPOINTMENTS, []);
    const waitlist = Storage.getData(Storage.KEYS.WAITLIST, []);
    const waitlistOffers = Storage.getData(Storage.KEYS.WAITLIST_OFFERS, []);
    const auditLogs = Storage.getData(Storage.KEYS.AUDIT_LOGS, []);

    const today = Utils.getTodayDateString();
    const todayAppointments = appointments.filter((a) => a.appointmentDate === today);
    const confirmedCount = appointments.filter((a) => a.status === 'CONFIRMED').length;
    const cancelledCount = appointments.filter((a) => a.status === 'CANCELLED').length;
    const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;
    const totalCount = appointments.length;

    const cancellationRate = totalCount > 0 ? Math.round((cancelledCount / totalCount) * 100) : 0;
    const activeWaitlist = waitlist.filter((w) => w.status === 'WAITING').length;
    const activeOffers = waitlist.filter((w) => w.status === 'OFFERED').length;
    const fulfilledWaitlist = waitlist.filter((w) => w.status === 'FULFILLED').length;
    const waitlistConversionRate = waitlist.length > 0 ? Math.round((fulfilledWaitlist / waitlist.length) * 100) : 0;

    let html = `
      <div class="admin-dashboard-container animate-fade-in">
        <!-- Admin Title Bar -->
        <div class="dashboard-header-card admin-header-card">
          <div>
            <div class="greeting-subtitle">Hospital Command & Control</div>
            <h1 class="greeting-title">Operations Administrator</h1>
            <p class="text-sm text-muted">Real-time scheduling management, automatic waitlist allocation engine, and clinical capacity analytics.</p>
          </div>
          <div class="admin-quick-actions">
            <button class="btn btn-sm btn-outline" id="btn-export-data">⬇ Export JSON</button>
            <button class="btn btn-sm btn-outline" id="btn-import-trigger">⬆ Import JSON</button>
            <input type="file" id="admin-file-import" accept=".json" style="display:none;" />
            <button class="btn btn-sm btn-danger-outline" id="btn-reset-demo-data">🔄 Reset Demo Data</button>
          </div>
        </div>

        <!-- Admin KPI Cards -->
        <div class="stats-grid">
          <div class="stat-card stat-primary">
            <div class="stat-icon-wrap">👨‍⚕️</div>
            <div class="stat-content">
              <div class="stat-value">${doctors.filter((d) => d.active).length} / ${doctors.length}</div>
              <div class="stat-label">Active Doctors</div>
            </div>
          </div>
          <div class="stat-card stat-teal">
            <div class="stat-icon-wrap">🏢</div>
            <div class="stat-content">
              <div class="stat-value">${departments.filter((d) => d.active).length}</div>
              <div class="stat-label">Active Departments</div>
            </div>
          </div>
          <div class="stat-card stat-blue">
            <div class="stat-icon-wrap">📅</div>
            <div class="stat-content">
              <div class="stat-value">${todayAppointments.length}</div>
              <div class="stat-label">Today's Visits</div>
            </div>
          </div>
          <div class="stat-card stat-purple">
            <div class="stat-icon-wrap">✓</div>
            <div class="stat-content">
              <div class="stat-value">${confirmedCount}</div>
              <div class="stat-label">Confirmed Total</div>
            </div>
          </div>
          <div class="stat-card stat-rose">
            <div class="stat-icon-wrap">✕</div>
            <div class="stat-content">
              <div class="stat-value">${cancelledCount} (${cancellationRate}%)</div>
              <div class="stat-label">Cancelled Rate</div>
            </div>
          </div>
          <div class="stat-card stat-amber">
            <div class="stat-icon-wrap">⏳</div>
            <div class="stat-content">
              <div class="stat-value">${activeWaitlist} Active / ${activeOffers} Offers</div>
              <div class="stat-label">Waitlist Engine</div>
            </div>
          </div>
        </div>

        <!-- Admin Navigation Tabs -->
        <div class="dashboard-tabs-bar">
          <button class="tab-btn ${activeTab === 'overview' ? 'active' : ''}" data-admin-tab="overview">
            Overview & All Appointments (${appointments.length})
          </button>
          <button class="tab-btn ${activeTab === 'waitlist' ? 'active' : ''}" data-admin-tab="waitlist">
            Waitlist Allocation Center (${waitlist.length})
          </button>
          <button class="tab-btn ${activeTab === 'doctors' ? 'active' : ''}" data-admin-tab="doctors">
            Doctors Directory (${doctors.length})
          </button>
          <button class="tab-btn ${activeTab === 'departments' ? 'active' : ''}" data-admin-tab="departments">
            Departments (${departments.length})
          </button>
          <button class="tab-btn ${activeTab === 'analytics' ? 'active' : ''}" data-admin-tab="analytics">
            Analytics & Reports
          </button>
          <button class="tab-btn ${activeTab === 'settings' ? 'active' : ''}" data-admin-tab="settings">
            System Settings
          </button>
        </div>

        <!-- Admin Tab Body -->
        <div class="admin-tab-body">
          ${renderAdminTabContent(activeTab, { doctors, departments, appointments, waitlist, waitlistOffers, auditLogs })}
        </div>
      </div>
    `;

    container.innerHTML = html;
    bindAdminDashboardEvents(container, activeTab);
  }

  /**
   * Renders specific Admin tab content
   */
  function renderAdminTabContent(tab, data) {
    const Utils = getUtils();

    switch (tab) {
      case 'overview':
        return `
          <div class="admin-appointments-panel">
            <div class="panel-filters-bar">
              <div class="filter-group">
                <input type="text" id="admin-search-input" class="form-control" placeholder="Search patient, doctor, ref..." />
              </div>
              <div class="filter-group">
                <select id="admin-dept-filter" class="form-select">
                  <option value="all">All Departments</option>
                  ${data.departments.map((d) => `<option value="${d.id}">${Utils.escapeHTML(d.name)}</option>`).join('')}
                </select>
              </div>
              <div class="filter-group">
                <select id="admin-status-filter" class="form-select">
                  <option value="all">All Statuses</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="NO_SHOW">No Show</option>
                </select>
              </div>
            </div>

            <div class="appointments-table-card">
              <div class="table-responsive">
                <table class="shas-table" id="admin-appointments-table">
                  <thead>
                    <tr>
                      <th>Ref</th>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Department</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.appointments
                      .map((apt) => `
                      <tr>
                        <td><strong class="code-ref">${Utils.escapeHTML(apt.bookingRef)}</strong></td>
                        <td><strong>${Utils.escapeHTML(apt.patientName)}</strong></td>
                        <td>${Utils.escapeHTML(apt.doctorName)}</td>
                        <td>${Utils.escapeHTML(apt.departmentName)}</td>
                        <td>
                          <div>${Utils.formatDate(apt.appointmentDate)}</div>
                          <div class="text-xs text-muted">${Utils.formatTimeRange(apt.startTime, apt.endTime)}</div>
                        </td>
                        <td>${renderStatusBadge(apt.status)}</td>
                        <td>
                          <div class="table-actions">
                            <button class="btn-icon-action btn-view-apt" data-apt-id="${apt.id}" title="Details">👁</button>
                            ${
                              apt.status === 'CONFIRMED'
                                ? `<button class="btn-icon-action text-danger btn-cancel-apt" data-apt-id="${apt.id}" title="Cancel (Triggers Waitlist)">✕</button>`
                                : ''
                            }
                          </div>
                        </td>
                      </tr>
                    `)
                      .join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `;

      case 'waitlist':
        const pendingOffers = data.waitlist.filter((w) => w.status === 'OFFERED');
        return `
          <div class="admin-waitlist-panel">
            <div class="alert-info-box">
              <div class="box-icon">⚡</div>
              <div>
                <strong>Automatic Waitlist Innovation Engine:</strong>
                When an appointment is cancelled, the system algorithm instantly evaluates waitlist tickets, matches doctor & time constraints, and offers the slot to the next queue candidate with a live reservation lock.
              </div>
            </div>

            <!-- Active Pending Offers Card -->
            ${
              pendingOffers.length > 0
                ? `
              <div class="active-offers-admin-card">
                <h3 class="section-title text-amber">⚡ Currently Active Temporary Slot Offers (${pendingOffers.length})</h3>
                <div class="offers-admin-grid">
                  ${pendingOffers
                    .map((item) => {
                      const remainingMs = Math.max(0, (item.offerExpiresAt || 0) - Date.now());
                      const mins = Math.floor(remainingMs / 60000);
                      const secs = Math.floor((remainingMs % 60000) / 1000);
                      return `
                      <div class="offer-admin-item">
                        <div>
                          <strong>${Utils.escapeHTML(item.patientName)}</strong> (${Utils.escapeHTML(item.departmentName)})
                          <div class="text-xs text-muted">Offered: ${Utils.escapeHTML(item.offeredSlot?.doctorName)} on ${Utils.formatDate(item.offeredSlot?.date)} at ${item.offeredSlot?.startTime}</div>
                          <div class="countdown-badge">Expires in: ${mins}m ${secs}s</div>
                        </div>
                        <div class="offer-admin-controls">
                          <button class="btn btn-xs btn-primary btn-force-expire" data-waitlist-id="${item.id}" title="Force expiration immediately for demonstration testing">
                            Simulate Expiration
                          </button>
                        </div>
                      </div>
                    `;
                    })
                    .join('')}
                </div>
              </div>
            `
                : ''
            }

            <div class="section-header-row">
              <h3 class="section-title">All Waiting List Entries (${data.waitlist.length})</h3>
              <button class="btn btn-sm btn-outline" id="btn-check-expired-offers">Check Expired Offers Now</button>
            </div>

            <div class="appointments-table-card">
              <div class="table-responsive">
                <table class="shas-table">
                  <thead>
                    <tr>
                      <th>Queue #</th>
                      <th>Patient</th>
                      <th>Department</th>
                      <th>Doctor Preference</th>
                      <th>Date Range</th>
                      <th>Time Pref</th>
                      <th>Status</th>
                      <th>Requested</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${
                      data.waitlist.length === 0
                        ? '<tr><td colspan="9" class="text-center py-4">No waiting list records found.</td></tr>'
                        : data.waitlist
                            .map((w) => `
                        <tr>
                          <td><strong>#${w.queuePosition || 1}</strong></td>
                          <td><strong>${Utils.escapeHTML(w.patientName)}</strong></td>
                          <td>${Utils.escapeHTML(w.departmentName)}</td>
                          <td>${Utils.escapeHTML(w.preferredDoctorName)}</td>
                          <td>${Utils.formatDate(w.preferredStartDate)} - ${Utils.formatDate(w.preferredEndDate)}</td>
                          <td>${Utils.escapeHTML(w.preferredTimeRange)}</td>
                          <td>${renderStatusBadge(w.status)}</td>
                          <td class="text-xs text-muted">${Utils.formatRelativeTime(new Date(w.createdAt).getTime())}</td>
                          <td>
                            ${
                              w.status === 'OFFERED'
                                ? `<button class="btn btn-xs btn-outline btn-force-expire" data-waitlist-id="${w.id}">Force Expire</button>`
                                : w.status === 'WAITING'
                                ? `<button class="btn-text-danger btn-cancel-waitlist" data-waitlist-id="${w.id}">Remove</button>`
                                : '-'
                            }
                          </td>
                        </tr>
                      `)
                            .join('')
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Audit Trail Log -->
            <div class="audit-log-section mt-4">
              <h3 class="section-title">Allocation Audit Trail</h3>
              <div class="audit-log-list">
                ${data.auditLogs
                  .slice(0, 15)
                  .map(
                    (log) => `
                  <div class="audit-log-item">
                    <span class="log-time">${Utils.formatDate(log.timestamp.substring(0, 10))} ${log.timestamp.substring(11, 16)}</span>
                    <span class="log-action badge badge-neutral">${Utils.escapeHTML(log.action)}</span>
                    <span class="log-detail">${Utils.escapeHTML(JSON.stringify(log.details))}</span>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          </div>
        `;

      case 'doctors':
        return `
          <div class="admin-doctors-panel">
            <div class="section-header-row">
              <h3 class="section-title">Hospital Medical Staff (${data.doctors.length})</h3>
              <button class="btn btn-primary btn-sm" id="btn-add-doctor-modal">＋ Add New Doctor</button>
            </div>

            <div class="appointments-table-card">
              <div class="table-responsive">
                <table class="shas-table">
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Department</th>
                      <th>Qualifications</th>
                      <th>Fee</th>
                      <th>Duration</th>
                      <th>Working Hours</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.doctors
                      .map(
                        (doc) => `
                      <tr>
                        <td>
                          <div class="cell-doctor">
                            <img src="${Utils.escapeHTML(doc.avatar)}" class="doc-avatar-small" alt="" />
                            <div>
                              <strong>${Utils.escapeHTML(doc.name)}</strong>
                              <div class="text-xs text-muted">${Utils.escapeHTML(doc.title)}</div>
                            </div>
                          </div>
                        </td>
                        <td>${Utils.escapeHTML(doc.departmentName)}</td>
                        <td class="text-sm">${Utils.escapeHTML(doc.qualification)}</td>
                        <td>$${doc.consultationFee}</td>
                        <td>${doc.consultationDuration} min</td>
                        <td class="text-sm">${doc.workingHours?.start} - ${doc.workingHours?.end}</td>
                        <td>
                          <button class="btn-toggle-status ${doc.active ? 'active' : 'inactive'}" data-doctor-id="${doc.id}">
                            ${doc.active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td>
                          <button class="btn btn-xs btn-outline btn-edit-doctor" data-doctor-id="${doc.id}">Edit</button>
                        </td>
                      </tr>
                    `
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `;

      case 'departments':
        return `
          <div class="admin-departments-panel">
            <div class="section-header-row">
              <h3 class="section-title">Hospital Departments (${data.departments.length})</h3>
              <button class="btn btn-primary btn-sm" id="btn-add-dept-modal">＋ Add Department</button>
            </div>

            <div class="department-admin-grid">
              ${data.departments
                .map((dept) => {
                  const docCount = data.doctors.filter((d) => d.departmentId === dept.id).length;
                  return `
                  <div class="dept-admin-card ${!dept.active ? 'card-inactive' : ''}">
                    <div class="dept-card-top">
                      <div class="dept-icon-circle" style="background-color: ${dept.color || '#2563eb'}20; color: ${dept.color || '#2563eb'};">
                        🏥
                      </div>
                      <button class="btn-toggle-dept ${dept.active ? 'active' : 'inactive'}" data-dept-id="${dept.id}">
                        ${dept.active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                    <h3 class="dept-name">${Utils.escapeHTML(dept.name)}</h3>
                    <p class="dept-desc">${Utils.escapeHTML(dept.description)}</p>
                    <div class="dept-footer">
                      <span class="text-sm text-muted">${docCount} Assigned Doctor${docCount === 1 ? '' : 's'}</span>
                      <button class="btn btn-xs btn-outline btn-edit-dept" data-dept-id="${dept.id}">Edit</button>
                    </div>
                  </div>
                `;
                })
                .join('')}
            </div>
          </div>
        `;

      case 'analytics':
        const deptCounts = {};
        data.appointments.forEach((a) => {
          deptCounts[a.departmentName] = (deptCounts[a.departmentName] || 0) + 1;
        });

        return `
          <div class="admin-analytics-panel">
            <h3 class="section-title">Hospital Operations Analytics</h3>
            
            <div class="analytics-charts-grid">
              <!-- Department Volume Breakdown -->
              <div class="analytics-card">
                <h4>Appointments by Department</h4>
                <div class="bar-chart-container">
                  ${Object.keys(deptCounts)
                    .map((dept) => {
                      const count = deptCounts[dept];
                      const pct = Math.round((count / data.appointments.length) * 100);
                      return `
                      <div class="chart-row">
                        <div class="chart-label">${Utils.escapeHTML(dept)}</div>
                        <div class="chart-bar-wrap">
                          <div class="chart-bar-fill" style="width: ${pct}%;"></div>
                          <span class="chart-bar-num">${count} (${pct}%)</span>
                        </div>
                      </div>
                    `;
                    })
                    .join('')}
                </div>
              </div>

              <!-- Waitlist Performance Card -->
              <div class="analytics-card">
                <h4>Waiting List Efficiency</h4>
                <div class="efficiency-metrics">
                  <div class="metric-item">
                    <div class="metric-num">${data.waitlist.filter((w) => w.status === 'FULFILLED').length}</div>
                    <div class="metric-label">Allocations Successfully Fulfilled</div>
                  </div>
                  <div class="metric-item">
                    <div class="metric-num">${data.waitlist.filter((w) => w.status === 'OFFERED').length}</div>
                    <div class="metric-label">Active Pending Offers</div>
                  </div>
                  <div class="metric-item">
                    <div class="metric-num">${data.waitlist.filter((w) => w.status === 'DECLINED').length}</div>
                    <div class="metric-label">Offers Cascaded to Next Patient</div>
                  </div>
                  <div class="metric-item">
                    <div class="metric-num">~100%</div>
                    <div class="metric-label">Slot Recovery Rate (No Wasted Released Slots)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;

      case 'settings':
        const settings = Storage.getData(Storage.KEYS.SETTINGS, {});
        return `
          <div class="admin-settings-panel">
            <h3 class="section-title">System & Cancellation Policy Settings</h3>
            <form id="admin-settings-form" class="settings-form-grid">
              <div class="form-group">
                <label>Hospital Facility Name</label>
                <input type="text" name="hospitalName" class="form-control" value="${Utils.escapeHTML(settings.hospitalName || 'St. Jude Metropolitan Hospital')}" />
              </div>

              <div class="form-group">
                <label>Offer Expiration Timeout (Minutes)</label>
                <input type="number" name="offerExpiryMinutes" class="form-control" min="1" max="120" value="${settings.offerExpiryMinutes || 15}" />
                <span class="form-hint">Time allowed for a patient to accept an automatically offered slot before cascading.</span>
              </div>

              <div class="form-group">
                <label>Cancellation Policy</label>
                <select name="allowCancellationAnytime" class="form-select">
                  <option value="true" ${settings.allowCancellationAnytime ? 'selected' : ''}>Allow patient cancellation anytime (Demo Friendly)</option>
                  <option value="false" ${!settings.allowCancellationAnytime ? 'selected' : ''}>Enforce strict 2-hour cutoff before slot</option>
                </select>
              </div>

              <div class="form-group">
                <label>Automatic Waitlist Allocation Engine</label>
                <select name="autoProcessWaitlist" class="form-select">
                  <option value="true" ${settings.autoProcessWaitlist ? 'selected' : ''}>Enabled (Automatically allocate upon cancellation)</option>
                  <option value="false" ${!settings.autoProcessWaitlist ? 'selected' : ''}>Disabled (Manual review required)</option>
                </select>
              </div>

              <div class="form-actions-bar">
                <button type="submit" class="btn btn-primary">Save System Settings</button>
              </div>
            </form>
          </div>
        `;

      default:
        return '';
    }
  }

  /**
   * Binds click handlers for Admin dashboard
   */
  function bindAdminDashboardEvents(container, currentTab) {
    // Tabs
    container.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-admin-tab');
        renderAdminDashboard(container, tab);
      });
    });

    // Reset Demo Data
    const btnReset = container.querySelector('#btn-reset-demo-data');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all records to the original synthetic demo state?')) {
          getStorage().resetDemoData();
          getUtils().showToast('System Reset', 'Demo data successfully restored.', 'info');
          renderAdminDashboard(container, 'overview');
        }
      });
    }

    // Export Data JSON
    const btnExport = container.querySelector('#btn-export-data');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const json = getStorage().exportDemoData();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shas-hospital-backup-${getUtils().getTodayDateString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        getUtils().showToast('Exported', 'JSON data downloaded.', 'success');
      });
    }

    // Import Data JSON
    const btnImport = container.querySelector('#btn-import-trigger');
    const fileInput = container.querySelector('#admin-file-import');
    if (btnImport && fileInput) {
      btnImport.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const res = getStorage().importDemoData(event.target.result);
            if (res.success) {
              getUtils().showToast('Import Successful', 'Data loaded into browser storage.', 'success');
              renderAdminDashboard(container, 'overview');
            } else {
              getUtils().showToast('Import Failed', res.error, 'error');
            }
          };
          reader.readAsText(file);
        }
      });
    }

    // Force expire offer (Simulation test)
    container.querySelectorAll('.btn-force-expire').forEach((btn) => {
      btn.addEventListener('click', () => {
        const wlId = btn.getAttribute('data-waitlist-id');
        window.SHAS.Waitlist.forceExpireOffer(wlId);
        getUtils().showToast('Simulated Expiration', 'Offer expired; slot cascaded to next waiting candidate!', 'info');
        renderAdminDashboard(container, 'waitlist');
      });
    });

    // Check expired offers
    const btnCheckExpired = container.querySelector('#btn-check-expired-offers');
    if (btnCheckExpired) {
      btnCheckExpired.addEventListener('click', () => {
        const count = window.SHAS.Waitlist.checkAndExpireOffers();
        getUtils().showToast('Check Complete', `${count} expired offers processed.`, 'info');
        renderAdminDashboard(container, 'waitlist');
      });
    }

    // Toggle Doctor status
    container.querySelectorAll('.btn-toggle-status').forEach((btn) => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-doctor-id');
        window.SHAS.Doctors.toggleDoctorStatus(docId);
        renderAdminDashboard(container, 'doctors');
      });
    });

    // Toggle Dept status
    container.querySelectorAll('.btn-toggle-dept').forEach((btn) => {
      btn.addEventListener('click', () => {
        const deptId = btn.getAttribute('data-dept-id');
        window.SHAS.Departments.toggleDepartmentStatus(deptId);
        renderAdminDashboard(container, 'departments');
      });
    });

    // Cancel appointment from admin
    container.querySelectorAll('.btn-cancel-apt').forEach((btn) => {
      btn.addEventListener('click', () => {
        const aptId = btn.getAttribute('data-apt-id');
        openCancellationModal(aptId, () => renderAdminDashboard(container, currentTab));
      });
    });

    // View details
    container.querySelectorAll('.btn-view-apt').forEach((btn) => {
      btn.addEventListener('click', () => {
        const aptId = btn.getAttribute('data-apt-id');
        openAppointmentDetailsModal(aptId);
      });
    });

    // Add Doctor Modal
    const btnAddDoc = container.querySelector('#btn-add-doctor-modal');
    if (btnAddDoc) {
      btnAddDoc.addEventListener('click', () => openAddDoctorModal(() => renderAdminDashboard(container, 'doctors')));
    }

    // Edit Doctor Modal
    container.querySelectorAll('.btn-edit-doctor').forEach((btn) => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-doctor-id');
        openEditDoctorModal(docId, () => renderAdminDashboard(container, 'doctors'));
      });
    });

    // Add Department Modal
    const btnAddDept = container.querySelector('#btn-add-dept-modal');
    if (btnAddDept) {
      btnAddDept.addEventListener('click', () => openAddDepartmentModal(() => renderAdminDashboard(container, 'departments')));
    }

    // Edit Department Modal
    container.querySelectorAll('.btn-edit-dept').forEach((btn) => {
      btn.addEventListener('click', () => {
        const deptId = btn.getAttribute('data-dept-id');
        openEditDepartmentModal(deptId, () => renderAdminDashboard(container, 'departments'));
      });
    });

    // Save Settings form
    const settingsForm = container.querySelector('#admin-settings-form');
    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(settingsForm);
        const newSettings = {
          hospitalName: formData.get('hospitalName'),
          offerExpiryMinutes: parseInt(formData.get('offerExpiryMinutes'), 10) || 15,
          allowCancellationAnytime: formData.get('allowCancellationAnytime') === 'true',
          autoProcessWaitlist: formData.get('autoProcessWaitlist') === 'true'
        };
        getStorage().setData(getStorage().KEYS.SETTINGS, newSettings);
        getUtils().showToast('Settings Saved', 'System configurations updated successfully.', 'success');
      });
    }

    // Search & Filter in Overview
    const searchInput = container.querySelector('#admin-search-input');
    const deptFilter = container.querySelector('#admin-dept-filter');
    const statusFilter = container.querySelector('#admin-status-filter');
    const filterAppointments = () => {
      const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
      const d = deptFilter ? deptFilter.value : 'all';
      const s = statusFilter ? statusFilter.value : 'all';

      const rows = container.querySelectorAll('#admin-appointments-table tbody tr');
      rows.forEach((row) => {
        const text = row.innerText.toLowerCase();
        const matchesSearch = !q || text.includes(q);
        const matchesDept = d === 'all' || text.includes(d.toLowerCase()) || row.innerHTML.includes(d);
        const matchesStatus = s === 'all' || text.includes(s.toLowerCase());
        row.style.display = matchesSearch && matchesDept && matchesStatus ? '' : 'none';
      });
    };

    if (searchInput) searchInput.addEventListener('input', filterAppointments);
    if (deptFilter) deptFilter.addEventListener('change', filterAppointments);
    if (statusFilter) statusFilter.addEventListener('change', filterAppointments);
  }

  /* ==========================================================================
     MODAL DIALOG HELPERS (Cancellation, Reschedule, Waitlist, Doctor, Dept)
     ========================================================================== */

  /**
   * Opens Appointment Cancellation Modal with explanation of automatic waitlist allocation
   */
  function openCancellationModal(appointmentId, onSuccessCallback) {
    const apt = window.SHAS.Appointments.getAppointmentById(appointmentId);
    if (!apt) return;

    let modal = document.getElementById('shas-cancel-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'shas-cancel-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h2 class="modal-title">Confirm Appointment Cancellation</h2>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="cancel-summary-box">
            <p><strong>Appointment:</strong> ${getUtils().escapeHTML(apt.bookingRef)}</p>
            <p><strong>Doctor:</strong> ${getUtils().escapeHTML(apt.doctorName)} (${getUtils().escapeHTML(apt.departmentName)})</p>
            <p><strong>Date & Time:</strong> ${getUtils().formatDate(apt.appointmentDate)} at ${getUtils().formatTimeRange(apt.startTime, apt.endTime)}</p>
          </div>
          
          <div class="alert-info-box mt-3">
            <div class="box-icon">⚡</div>
            <div>
              <strong>Automatic Slot Re-Allocation Notice:</strong>
              When you cancel, this slot is immediately released and will be offered automatically to the first eligible patient in the waiting list queue.
            </div>
          </div>

          <div class="form-group mt-3">
            <label for="cancel-reason-input">Reason for Cancellation (Optional):</label>
            <select id="cancel-reason-select" class="form-select mb-2">
              <option value="Patient schedule conflict">Schedule conflict</option>
              <option value="Condition improved">Condition improved / No longer needed</option>
              <option value="Personal emergency">Personal emergency</option>
              <option value="Other">Other reason</option>
            </select>
            <input type="text" id="cancel-reason-custom" class="form-control" placeholder="Additional details..." />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-close-btn">Keep Appointment</button>
          <button class="btn btn-danger" id="btn-confirm-cancel">Confirm & Release Slot</button>
        </div>
      </div>
    `;

    getUtils().openModal('shas-cancel-modal');

    modal.querySelectorAll('.modal-close-btn').forEach((b) => {
      b.addEventListener('click', () => getUtils().closeModal('shas-cancel-modal'));
    });

    const btnConfirm = modal.querySelector('#btn-confirm-cancel');
    btnConfirm.addEventListener('click', () => {
      const selectVal = modal.querySelector('#cancel-reason-select').value;
      const customVal = modal.querySelector('#cancel-reason-custom').value.trim();
      const reason = customVal ? `${selectVal} - ${customVal}` : selectVal;

      const session = getStorage().getDemoSession();
      const res = window.SHAS.Appointments.cancelAppointment(appointmentId, reason, session.role);

      getUtils().closeModal('shas-cancel-modal');

      if (res.success) {
        getUtils().showToast('Appointment Cancelled', res.message, 'warning');
        if (typeof onSuccessCallback === 'function') {
          onSuccessCallback();
        }
      } else {
        getUtils().showToast('Error', res.error, 'error');
      }
    });
  }

  /**
   * Opens Reschedule Appointment Modal
   */
  function openRescheduleModal(appointmentId) {
    const apt = window.SHAS.Appointments.getAppointmentById(appointmentId);
    if (!apt) return;

    let modal = document.getElementById('shas-reschedule-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'shas-reschedule-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    const today = getUtils().getTodayDateString();
    const minDate = today;
    const maxDate = getUtils().addDays(today, 30);

    modal.innerHTML = `
      <div class="modal-dialog modal-lg">
        <div class="modal-header">
          <h2 class="modal-title">Reschedule Appointment</h2>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p class="text-sm text-muted">Currently scheduled with <strong>${getUtils().escapeHTML(apt.doctorName)}</strong> on ${getUtils().formatDate(apt.appointmentDate)} at ${apt.startTime}.</p>
          
          <div class="form-group mt-3">
            <label>Select New Date:</label>
            <input type="date" id="reschedule-date-input" class="form-control" min="${minDate}" max="${maxDate}" value="${apt.appointmentDate}" />
          </div>

          <div class="slots-container mt-3">
            <label>Available Slots for Selected Date:</label>
            <div id="reschedule-slots-grid" class="slots-grid-picker">
              <div class="text-sm text-muted">Loading slots...</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-close-btn">Cancel</button>
          <button class="btn btn-primary" id="btn-confirm-reschedule" disabled>Confirm Reschedule</button>
        </div>
      </div>
    `;

    getUtils().openModal('shas-reschedule-modal');

    modal.querySelectorAll('.modal-close-btn').forEach((b) => {
      b.addEventListener('click', () => getUtils().closeModal('shas-reschedule-modal'));
    });

    let selectedNewSlot = null;
    const dateInput = modal.querySelector('#reschedule-date-input');
    const slotsGrid = modal.querySelector('#reschedule-slots-grid');
    const confirmBtn = modal.querySelector('#btn-confirm-reschedule');

    function updateSlots() {
      const curDate = dateInput.value;
      const res = window.SHAS.Availability.getDoctorAvailability(apt.doctorId, curDate);
      selectedNewSlot = null;
      confirmBtn.disabled = true;

      if (!res.isOperating) {
        slotsGrid.innerHTML = `<div class="text-danger py-2">${getUtils().escapeHTML(res.message)}</div>`;
        return;
      }

      const availableSlots = res.slots.filter((s) => s.isAvailable);
      if (availableSlots.length === 0) {
        slotsGrid.innerHTML = `<div class="text-muted py-2">All slots booked on this date.</div>`;
        return;
      }

      slotsGrid.innerHTML = availableSlots
        .map(
          (s) => `
        <button class="slot-pill-btn" data-time="${s.startTime}">
          ${s.formattedTime}
        </button>
      `
        )
        .join('');

      slotsGrid.querySelectorAll('.slot-pill-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          slotsGrid.querySelectorAll('.slot-pill-btn').forEach((b) => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedNewSlot = btn.getAttribute('data-time');
          confirmBtn.disabled = false;
        });
      });
    }

    dateInput.addEventListener('change', updateSlots);
    updateSlots();

    confirmBtn.addEventListener('click', () => {
      if (!selectedNewSlot) return;
      const res = window.SHAS.Appointments.rescheduleAppointment(appointmentId, dateInput.value, selectedNewSlot);
      getUtils().closeModal('shas-reschedule-modal');

      if (res.success) {
        getUtils().showToast('Rescheduled', res.message, 'success');
      } else {
        getUtils().showToast('Error', res.error, 'error');
      }
    });
  }

  /**
   * Opens Appointment Details Modal
   */
  function openAppointmentDetailsModal(appointmentId) {
    const apt = window.SHAS.Appointments.getAppointmentById(appointmentId);
    if (!apt) return;

    let modal = document.getElementById('shas-details-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'shas-details-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h2 class="modal-title">Appointment Specification</h2>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body details-modal-body">
          <div class="details-ref-hero">
            <span class="ref-label">Booking Reference:</span>
            <div class="ref-code-big">${getUtils().escapeHTML(apt.bookingRef)}</div>
            <div>${renderStatusBadge(apt.status)}</div>
          </div>
          
          <div class="details-grid-two">
            <div>
              <label>Patient</label>
              <strong>${getUtils().escapeHTML(apt.patientName)}</strong>
              <div class="text-xs text-muted">${getUtils().escapeHTML(apt.patientEmail || '')}</div>
              <div class="text-xs text-muted">${getUtils().escapeHTML(apt.patientPhone || '')}</div>
            </div>
            <div>
              <label>Consulting Physician</label>
              <strong>${getUtils().escapeHTML(apt.doctorName)}</strong>
              <div class="text-xs text-muted">${getUtils().escapeHTML(apt.departmentName)}</div>
            </div>
            <div>
              <label>Scheduled Date</label>
              <strong>${getUtils().formatDate(apt.appointmentDate)}</strong>
            </div>
            <div>
              <label>Time Window</label>
              <strong>${getUtils().formatTimeRange(apt.startTime, apt.endTime)}</strong>
            </div>
            <div>
              <label>Consultation Fee</label>
              <strong>$${apt.consultationFee}</strong>
            </div>
            <div>
              <label>Created On</label>
              <div class="text-sm">${getUtils().formatDate(apt.createdAt ? apt.createdAt.substring(0, 10) : '')}</div>
            </div>
          </div>

          ${
            apt.cancellationReason
              ? `
            <div class="cancellation-alert-box mt-3">
              <strong>Cancelled:</strong> ${getUtils().escapeHTML(apt.cancellationReason)}
              <div class="text-xs text-muted">Cancelled by ${getUtils().escapeHTML(apt.cancelledBy || 'User')} at ${getUtils().formatDate(apt.cancelledAt ? apt.cancelledAt.substring(0, 10) : '')}</div>
            </div>
          `
              : ''
          }
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-close-btn">Close</button>
        </div>
      </div>
    `;

    getUtils().openModal('shas-details-modal');
    modal.querySelectorAll('.modal-close-btn').forEach((b) => {
      b.addEventListener('click', () => getUtils().closeModal('shas-details-modal'));
    });
  }

  /**
   * Opens Join Waitlist Modal
   */
  function openJoinWaitlistModal(preselectedDeptId = null, preselectedDocId = null) {
    const session = getStorage().getDemoSession();
    const departments = window.SHAS.Departments.getAllDepartments(false);
    const doctors = window.SHAS.Doctors.getAllDoctors({ activeOnly: true });

    let modal = document.getElementById('shas-waitlist-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'shas-waitlist-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    const today = getUtils().getTodayDateString();
    const tomorrow = getUtils().addDays(today, 1);
    const defaultEnd = getUtils().addDays(today, 7);

    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h2 class="modal-title">Join Department Waiting List</h2>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p class="text-sm text-muted">Cannot find a slot that fits your schedule? When another patient cancels or reschedules, our engine immediately allocates the released slot to you.</p>

          <form id="form-join-waitlist" class="mt-3">
            <div class="form-group">
              <label>Department <span class="text-danger">*</span></label>
              <select id="wl-dept-select" class="form-select" required>
                ${departments
                  .map((d) => `<option value="${d.id}" ${d.id === preselectedDeptId ? 'selected' : ''}>${getUtils().escapeHTML(d.name)}</option>`)
                  .join('')}
              </select>
            </div>

            <div class="form-group">
              <label>Preferred Doctor</label>
              <select id="wl-doc-select" class="form-select">
                <option value="ANY">Any Available Doctor in this Department</option>
                ${doctors
                  .map((d) => `<option value="${d.id}" data-dept="${d.departmentId}" ${d.id === preselectedDocId ? 'selected' : ''}>${getUtils().escapeHTML(d.name)}</option>`)
                  .join('')}
              </select>
            </div>

            <div class="form-row-two">
              <div class="form-group">
                <label>Preferred Start Date</label>
                <input type="date" id="wl-start-date" class="form-control" value="${tomorrow}" min="${today}" required />
              </div>
              <div class="form-group">
                <label>Preferred End Date</label>
                <input type="date" id="wl-end-date" class="form-control" value="${defaultEnd}" min="${today}" required />
              </div>
            </div>

            <div class="form-group">
              <label>Time Preference</label>
              <select id="wl-time-pref" class="form-select">
                <option value="any">Any Time of Day</option>
                <option value="morning">Morning Only (8:00 AM - 12:00 PM)</option>
                <option value="afternoon">Afternoon Only (12:00 PM - 5:00 PM)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Clinical Notes or Urgency</label>
              <input type="text" id="wl-notes" class="form-control" placeholder="E.g. Travel next week, urgent follow-up requested..." />
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary modal-close-btn">Cancel</button>
              <button type="submit" class="btn btn-primary">Join Waiting Queue</button>
            </div>
          </form>
        </div>
      </div>
    `;

    getUtils().openModal('shas-waitlist-modal');

    modal.querySelectorAll('.modal-close-btn').forEach((b) => {
      b.addEventListener('click', () => getUtils().closeModal('shas-waitlist-modal'));
    });

    const deptSelect = modal.querySelector('#wl-dept-select');
    const docSelect = modal.querySelector('#wl-doc-select');

    function filterDoctors() {
      const selectedDept = deptSelect.value;
      docSelect.querySelectorAll('option').forEach((opt) => {
        if (opt.value === 'ANY') return;
        const dDept = opt.getAttribute('data-dept');
        opt.style.display = dDept === selectedDept ? '' : 'none';
      });
      docSelect.value = 'ANY';
    }

    deptSelect.addEventListener('change', filterDoctors);
    filterDoctors();

    const form = modal.querySelector('#form-join-waitlist');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const entryData = {
        patientId: session.userId,
        patientName: session.userName,
        departmentId: deptSelect.value,
        preferredDoctorId: docSelect.value,
        preferredStartDate: modal.querySelector('#wl-start-date').value,
        preferredEndDate: modal.querySelector('#wl-end-date').value,
        preferredTimeRange: modal.querySelector('#wl-time-pref').value,
        notes: modal.querySelector('#wl-notes').value
      };

      const res = window.SHAS.Waitlist.joinWaitlist(entryData);
      getUtils().closeModal('shas-waitlist-modal');

      if (res.success) {
        getUtils().showToast('Waitlist Joined', `You are at Queue Position #${res.waitlistEntry.queuePosition}.`, 'success');
      } else {
        getUtils().showToast('Notice', res.error, 'warning');
      }
    });
  }

  /**
   * Opens Add Doctor Modal
   */
  function openAddDoctorModal(onSuccessCallback) {
    const departments = window.SHAS.Departments.getAllDepartments(false);
    let modal = document.getElementById('shas-add-doctor-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'shas-add-doctor-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-dialog modal-lg">
        <div class="modal-header">
          <h2 class="modal-title">Add Hospital Physician</h2>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form id="form-add-doctor">
            <div class="form-row-two">
              <div class="form-group">
                <label>Doctor Full Name <span class="text-danger">*</span></label>
                <input type="text" name="name" class="form-control" required placeholder="Dr. Firstname Lastname" />
              </div>
              <div class="form-group">
                <label>Specialty Title</label>
                <input type="text" name="title" class="form-control" placeholder="Consultant Specialist" />
              </div>
            </div>

            <div class="form-row-two">
              <div class="form-group">
                <label>Department <span class="text-danger">*</span></label>
                <select name="departmentId" class="form-select" required>
                  ${departments.map((d) => `<option value="${d.id}">${getUtils().escapeHTML(d.name)}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Qualifications</label>
                <input type="text" name="qualification" class="form-control" placeholder="MD, FACP" />
              </div>
            </div>

            <div class="form-row-three">
              <div class="form-group">
                <label>Consultation Fee ($)</label>
                <input type="number" name="consultationFee" class="form-control" value="100" min="20" max="1000" />
              </div>
              <div class="form-group">
                <label>Duration (Minutes)</label>
                <select name="consultationDuration" class="form-select">
                  <option value="15">15 mins</option>
                  <option value="20">20 mins</option>
                  <option value="30" selected>30 mins</option>
                  <option value="45">45 mins</option>
                </select>
              </div>
              <div class="form-group">
                <label>Years Exp</label>
                <input type="number" name="experienceYears" class="form-control" value="8" min="1" max="50" />
              </div>
            </div>

            <div class="form-row-two">
              <div class="form-group">
                <label>Working Start Time</label>
                <input type="time" name="startTime" class="form-control" value="09:00" required />
              </div>
              <div class="form-group">
                <label>Working End Time</label>
                <input type="time" name="endTime" class="form-control" value="17:00" required />
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary modal-close-btn">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Doctor Profile</button>
            </div>
          </form>
        </div>
      </div>
    `;

    getUtils().openModal('shas-add-doctor-modal');
    modal.querySelectorAll('.modal-close-btn').forEach((b) => {
      b.addEventListener('click', () => getUtils().closeModal('shas-add-doctor-modal'));
    });

    const form = modal.querySelector('#form-add-doctor');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const res = window.SHAS.Doctors.addDoctor({
        name: formData.get('name'),
        title: formData.get('title'),
        departmentId: formData.get('departmentId'),
        qualification: formData.get('qualification'),
        consultationFee: parseFloat(formData.get('consultationFee')),
        consultationDuration: parseInt(formData.get('consultationDuration'), 10),
        experienceYears: parseInt(formData.get('experienceYears'), 10),
        workingHours: {
          start: formData.get('startTime'),
          end: formData.get('endTime')
        }
      });

      getUtils().closeModal('shas-add-doctor-modal');

      if (res.success) {
        getUtils().showToast('Doctor Added', `Dr. ${res.doctor.name} was added.`, 'success');
        if (typeof onSuccessCallback === 'function') onSuccessCallback();
      } else {
        getUtils().showToast('Error', res.error, 'error');
      }
    });
  }

  /**
   * Opens Edit Doctor Modal
   */
  function openEditDoctorModal(doctorId, onSuccessCallback) {
    const doc = window.SHAS.Doctors.getDoctorById(doctorId);
    if (!doc) return;

    const departments = window.SHAS.Departments.getAllDepartments(false);
    let modal = document.getElementById('shas-edit-doctor-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'shas-edit-doctor-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-dialog modal-lg">
        <div class="modal-header">
          <h2 class="modal-title">Edit Doctor Profile: ${getUtils().escapeHTML(doc.name)}</h2>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form id="form-edit-doctor">
            <div class="form-row-two">
              <div class="form-group">
                <label>Name</label>
                <input type="text" name="name" class="form-control" value="${getUtils().escapeHTML(doc.name)}" required />
              </div>
              <div class="form-group">
                <label>Department</label>
                <select name="departmentId" class="form-select">
                  ${departments.map((d) => `<option value="${d.id}" ${d.id === doc.departmentId ? 'selected' : ''}>${getUtils().escapeHTML(d.name)}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-row-three">
              <div class="form-group">
                <label>Fee ($)</label>
                <input type="number" name="consultationFee" class="form-control" value="${doc.consultationFee}" />
              </div>
              <div class="form-group">
                <label>Duration (mins)</label>
                <select name="consultationDuration" class="form-select">
                  <option value="15" ${doc.consultationDuration === 15 ? 'selected' : ''}>15 mins</option>
                  <option value="20" ${doc.consultationDuration === 20 ? 'selected' : ''}>20 mins</option>
                  <option value="30" ${doc.consultationDuration === 30 ? 'selected' : ''}>30 mins</option>
                </select>
              </div>
              <div class="form-group">
                <label>Status</label>
                <select name="active" class="form-select">
                  <option value="true" ${doc.active ? 'selected' : ''}>Active</option>
                  <option value="false" ${!doc.active ? 'selected' : ''}>Inactive</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Doctor Bio</label>
              <textarea name="bio" class="form-control" rows="2">${getUtils().escapeHTML(doc.bio || '')}</textarea>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary modal-close-btn">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    `;

    getUtils().openModal('shas-edit-doctor-modal');
    modal.querySelectorAll('.modal-close-btn').forEach((b) => {
      b.addEventListener('click', () => getUtils().closeModal('shas-edit-doctor-modal'));
    });

    const form = modal.querySelector('#form-edit-doctor');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const updates = {
        name: formData.get('name'),
        departmentId: formData.get('departmentId'),
        consultationFee: parseFloat(formData.get('consultationFee')),
        consultationDuration: parseInt(formData.get('consultationDuration'), 10),
        active: formData.get('active') === 'true',
        bio: formData.get('bio')
      };

      const res = window.SHAS.Doctors.updateDoctor(doctorId, updates);
      getUtils().closeModal('shas-edit-doctor-modal');

      if (res.success) {
        getUtils().showToast('Updated', 'Doctor profile updated.', 'success');
        if (typeof onSuccessCallback === 'function') onSuccessCallback();
      } else {
        getUtils().showToast('Error', res.error, 'error');
      }
    });
  }

  /**
   * Opens Add Department Modal
   */
  function openAddDepartmentModal(onSuccessCallback) {
    let modal = document.getElementById('shas-add-dept-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'shas-add-dept-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h2 class="modal-title">Add Department</h2>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form id="form-add-dept">
            <div class="form-group">
              <label>Department Name <span class="text-danger">*</span></label>
              <input type="text" name="name" class="form-control" required placeholder="E.g. Oncology" />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea name="description" class="form-control" rows="3" placeholder="Department clinical scope..."></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary modal-close-btn">Cancel</button>
              <button type="submit" class="btn btn-primary">Create Department</button>
            </div>
          </form>
        </div>
      </div>
    `;

    getUtils().openModal('shas-add-dept-modal');
    modal.querySelectorAll('.modal-close-btn').forEach((b) => {
      b.addEventListener('click', () => getUtils().closeModal('shas-add-dept-modal'));
    });

    const form = modal.querySelector('#form-add-dept');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const res = window.SHAS.Departments.addDepartment({
        name: formData.get('name'),
        description: formData.get('description')
      });
      getUtils().closeModal('shas-add-dept-modal');

      if (res.success) {
        getUtils().showToast('Created', 'Department created successfully.', 'success');
        if (typeof onSuccessCallback === 'function') onSuccessCallback();
      } else {
        getUtils().showToast('Error', res.error, 'error');
      }
    });
  }

  /**
   * Opens Edit Department Modal
   */
  function openEditDepartmentModal(deptId, onSuccessCallback) {
    const dept = window.SHAS.Departments.getDepartmentById(deptId);
    if (!dept) return;

    let modal = document.getElementById('shas-edit-dept-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'shas-edit-dept-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h2 class="modal-title">Edit Department</h2>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form id="form-edit-dept">
            <div class="form-group">
              <label>Department Name</label>
              <input type="text" name="name" class="form-control" value="${getUtils().escapeHTML(dept.name)}" required />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea name="description" class="form-control" rows="3">${getUtils().escapeHTML(dept.description || '')}</textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary modal-close-btn">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    `;

    getUtils().openModal('shas-edit-dept-modal');
    modal.querySelectorAll('.modal-close-btn').forEach((b) => {
      b.addEventListener('click', () => getUtils().closeModal('shas-edit-dept-modal'));
    });

    const form = modal.querySelector('#form-edit-dept');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const res = window.SHAS.Departments.updateDepartment(deptId, {
        name: formData.get('name'),
        description: formData.get('description')
      });
      getUtils().closeModal('shas-edit-dept-modal');

      if (res.success) {
        getUtils().showToast('Updated', 'Department updated.', 'success');
        if (typeof onSuccessCallback === 'function') onSuccessCallback();
      } else {
        getUtils().showToast('Error', res.error, 'error');
      }
    });
  }

  return {
    renderPatientDashboard,
    renderDoctorDashboard,
    renderAdminDashboard,
    openCancellationModal,
    openRescheduleModal,
    openAppointmentDetailsModal,
    openJoinWaitlistModal
  };
})();
