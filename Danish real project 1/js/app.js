/**
 * Smart Hospital Appointment System (SHAS) - Core App Controller & Router
 * Coordinates view navigation, demo role switching, booking wizard workflows,
 * notification dropdowns, background offer expiration timers, and interactive demo tours.
 */

window.SHAS = window.SHAS || {};

window.SHAS.App = (function () {
  'use strict';

  let currentView = 'landing'; // 'landing' | 'patient' | 'doctor' | 'admin' | 'booking' | 'directory'

  function getStorage() {
    return window.SHAS.Storage;
  }

  function getUtils() {
    return window.SHAS.Utils;
  }

  /**
   * Initializes application on DOMContentLoaded
   */
  function init() {
    console.log('[SHAS App] Initializing Smart Hospital Appointment System...');

    // 1. Initialize seed data if needed
    window.SHAS.SeedData.initialize(false);

    // 2. Set up reactive state listener
    getStorage().onStateChange((e) => {
      console.log('[SHAS App] Reactive state changed:', e.detail?.key);
      updateNotificationBadge();
      // Re-render current view if inside one of the dashboards
      if (['patient', 'doctor', 'admin'].includes(currentView)) {
        renderCurrentView();
      }
    });

    // 3. Bind global navigation elements
    bindGlobalEvents();

    // 4. Initial check for expired offers
    window.SHAS.Waitlist.checkAndExpireOffers();

    // 5. Start background tick (every 1s for live countdowns, every 10s for expiration checks)
    startBackgroundTimer();

    // 6. Navigate to initial view based on hash or landing
    const initialView = window.location.hash ? window.location.hash.replace('#', '') : 'landing';
    navigateTo(initialView);
    updateNotificationBadge();
    updateRoleIndicator();

    console.log('[SHAS App] Initialization complete.');
  }

  /**
   * Switches view / screen
   */
  function navigateTo(viewName, params = {}) {
    currentView = viewName;
    window.location.hash = viewName;

    const mainContainer = document.getElementById('app-main-content');
    if (!mainContainer) return;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update nav active states
    document.querySelectorAll('.nav-link').forEach((link) => {
      const target = link.getAttribute('data-view');
      link.classList.toggle('active', target === viewName);
    });

    // Toggle Landing page specific body class for styling
    document.body.classList.toggle('is-landing', viewName === 'landing');

    renderCurrentView(params);
  }

  /**
   * Renders whichever view is active
   */
  function renderCurrentView(params = {}) {
    const mainContainer = document.getElementById('app-main-content');
    if (!mainContainer) return;

    switch (currentView) {
      case 'landing':
        renderLandingView(mainContainer);
        break;
      case 'patient':
        window.SHAS.Dashboard.renderPatientDashboard(mainContainer);
        break;
      case 'doctor':
        const session = getStorage().getDemoSession();
        window.SHAS.Dashboard.renderDoctorDashboard(mainContainer, session.userId);
        break;
      case 'admin':
        window.SHAS.Dashboard.renderAdminDashboard(mainContainer);
        break;
      case 'booking':
        renderBookingWizard(mainContainer, params);
        break;
      case 'directory':
        renderDoctorDirectoryView(mainContainer, params);
        break;
      default:
        renderLandingView(mainContainer);
    }
  }

  /* ==========================================================================
     LANDING PAGE VIEW
     ========================================================================== */

  function renderLandingView(container) {
    const departments = window.SHAS.Departments.getAllDepartments(false);
    const featuredDoctors = window.SHAS.Doctors.getAllDoctors({ activeOnly: true }).slice(0, 4);

    container.innerHTML = `
      <div class="landing-page-wrapper animate-fade-in">
        <!-- Hero Section -->
        <section class="landing-hero">
          <div class="hero-content">
            <div class="hero-badge">
              <span class="badge-dot"></span> Next-Generation Hospital Management
            </div>
            <h1 class="hero-title">Your Health, Your Time, Simplified.</h1>
            <p class="hero-subtitle">
              Seamlessly connect with top clinical specialists, explore real-time appointment openings, and leverage our 
              <strong>Intelligent Waiting-List Engine</strong> that instantly re-allocates cancelled slots to patients in need.
            </p>
            <div class="hero-actions">
              <button class="btn btn-primary btn-lg btn-hero-book" id="btn-hero-book">
                Book an Appointment <span class="arrow-right">→</span>
              </button>
              <button class="btn btn-secondary btn-lg btn-hero-demo-role" id="btn-hero-demo">
                Select Demo Role
              </button>
            </div>

            <!-- Doctor Quick Search Bar -->
            <div class="hero-search-bar">
              <div class="search-input-wrap">
                <span class="search-icon">🔍</span>
                <input type="text" id="landing-search-input" placeholder="Search doctor name, specialty, or condition..." />
              </div>
              <select id="landing-dept-select" class="landing-search-select">
                <option value="all">All Departments</option>
                ${departments.map((d) => `<option value="${d.id}">${getUtils().escapeHTML(d.name)}</option>`).join('')}
              </select>
              <button class="btn btn-primary btn-landing-search" id="btn-landing-search">Find Doctors</button>
            </div>

            <div class="hero-trust-metrics">
              <div class="trust-item">
                <span class="trust-num">12+</span>
                <span class="trust-lbl">Specialist Physicians</span>
              </div>
              <div class="trust-item">
                <span class="trust-num">8</span>
                <span class="trust-lbl">Clinical Departments</span>
              </div>
              <div class="trust-item">
                <span class="trust-num">100%</span>
                <span class="trust-lbl">Automated Waitlist Allocation</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Department Highlights -->
        <section class="landing-section bg-light">
          <div class="section-container">
            <div class="section-heading-center">
              <div class="section-tag">COMPREHENSIVE CARE</div>
              <h2 class="section-title">Specialized Medical Departments</h2>
              <p class="section-desc">Consult with experienced department chairs and board-certified healthcare professionals.</p>
            </div>

            <div class="departments-grid">
              ${departments
                .map(
                  (dept) => `
                <div class="dept-card" data-dept-id="${dept.id}">
                  <div class="dept-card-icon" style="background-color: ${dept.color || '#2563eb'}18; color: ${dept.color || '#2563eb'};">
                    🏥
                  </div>
                  <h3 class="dept-card-title">${getUtils().escapeHTML(dept.name)}</h3>
                  <p class="dept-card-desc">${getUtils().escapeHTML(dept.description)}</p>
                  <div class="dept-card-action">Find Specialists →</div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        </section>

        <!-- Featured Doctors -->
        <section class="landing-section">
          <div class="section-container">
            <div class="section-heading-center">
              <div class="section-tag">TOP MEDICAL EXPERTS</div>
              <h2 class="section-title">Meet Our Leading Physicians</h2>
              <p class="section-desc">Distinguished clinicians committed to compassionate, individualized patient outcomes.</p>
            </div>

            <div class="doctors-cards-grid">
              ${featuredDoctors
                .map(
                  (doc) => `
                <div class="doctor-feature-card">
                  <div class="doc-card-image-wrap">
                    <img src="${getUtils().escapeHTML(doc.avatar)}" alt="${getUtils().escapeHTML(doc.name)}" class="doc-card-img" />
                    <span class="doc-dept-pill">${getUtils().escapeHTML(doc.departmentName)}</span>
                  </div>
                  <div class="doc-card-body">
                    <h3 class="doc-card-name">${getUtils().escapeHTML(doc.name)}</h3>
                    <p class="doc-card-title">${getUtils().escapeHTML(doc.title)}</p>
                    <p class="doc-card-qual">${getUtils().escapeHTML(doc.qualification)}</p>
                    <div class="doc-card-meta">
                      <span>⭐ ${doc.rating} (${doc.reviewsCount})</span>
                      <span class="doc-fee">$${doc.consultationFee} / consult</span>
                    </div>
                  </div>
                  <div class="doc-card-footer">
                    <button class="btn btn-primary btn-block btn-book-doc" data-doc-id="${doc.id}">
                      Book Appointment
                    </button>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>

            <div class="text-center mt-4">
              <button class="btn btn-outline btn-lg" id="btn-view-all-doctors">Explore All 12 Doctors →</button>
            </div>
          </div>
        </section>

        <!-- How It Works & Waitlist Innovation -->
        <section class="landing-section bg-gradient-light">
          <div class="section-container">
            <div class="section-heading-center">
              <div class="section-tag">SEAMLESS PATIENT JOURNEY</div>
              <h2 class="section-title">How Our Smart System Works</h2>
              <p class="section-desc">Three simple steps to secure your consultation, with an automatic safety net if your slot is booked.</p>
            </div>

            <div class="how-it-works-grid">
              <div class="step-card">
                <div class="step-number">01</div>
                <h3>Choose Doctor & Department</h3>
                <p>Browse by medical specialty, reviews, fee, or clinical expertise to find the perfect healthcare provider.</p>
              </div>
              <div class="step-card">
                <div class="step-number">02</div>
                <h3>Select Real-Time Slots</h3>
                <p>Our availability engine computes live conflict-free slots based on physician schedules and current bookings.</p>
              </div>
              <div class="step-card">
                <div class="step-number">03</div>
                <h3>Instant Confirmation</h3>
                <p>Receive your booking reference immediately. Reschedule or cancel anytime with a single click.</p>
              </div>
            </div>

            <!-- Waitlist Highlight Banner -->
            <div class="waitlist-innovation-banner">
              <div class="innovation-content">
                <div class="innovation-tag">★ PRIMARY HACKATHON INNOVATION</div>
                <h2>Automatic Waiting-List Allocation Engine</h2>
                <p>
                  When popular specialists are fully booked, patients join our FIFO prioritized waiting list. 
                  The moment an existing appointment is cancelled or rescheduled, our browser engine instantly matches 
                  the freed slot with the next patient in line and offers it with a live reservation window.
                </p>
                <div class="innovation-perks">
                  <div>✓ Zero wasted released slots</div>
                  <div>✓ Prevents manual hospital phone queues</div>
                  <div>✓ Fairness guaranteed by priority timestamp</div>
                  <div>✓ Automatic cascading if offer declined or expired</div>
                </div>
                <button class="btn btn-primary mt-3 btn-test-waitlist-demo" id="btn-launch-demo-walkthrough">
                  Launch Interactive Demonstration Walkthrough
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <footer class="landing-footer">
          <div class="footer-container">
            <div class="footer-brand">
              <div class="brand-logo">🏥 Smart Hospital System</div>
              <p class="footer-disclaimer">
                Hackathon Prototype Demonstration. Built with pure HTML5, CSS3, Vanilla JavaScript, and LocalStorage. 
                Runs 100% in-browser with zero backend dependencies. Synthetic healthcare data for demonstration only.
              </p>
            </div>
            <div class="footer-links">
              <h4>Demo Navigation</h4>
              <ul>
                <li><a href="#patient" class="nav-goto" data-goto="patient">Patient Dashboard</a></li>
                <li><a href="#doctor" class="nav-goto" data-goto="doctor">Doctor Schedule</a></li>
                <li><a href="#admin" class="nav-goto" data-goto="admin">Administrator Panel</a></li>
                <li><a href="#booking" class="nav-goto" data-goto="booking">Appointment Wizard</a></li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    `;

    // Bind landing buttons
    const btnHeroBook = container.querySelector('#btn-hero-book');
    if (btnHeroBook) btnHeroBook.addEventListener('click', () => navigateTo('booking'));

    const btnHeroDemo = container.querySelector('#btn-hero-demo');
    if (btnHeroDemo) btnHeroDemo.addEventListener('click', openRoleSwitcherModal);

    const btnViewAll = container.querySelector('#btn-view-all-doctors');
    if (btnViewAll) btnViewAll.addEventListener('click', () => navigateTo('directory'));

    const btnDemoTour = container.querySelector('#btn-launch-demo-walkthrough');
    if (btnDemoTour) btnDemoTour.addEventListener('click', openDemoWalkthroughModal);

    // Department cards
    container.querySelectorAll('.dept-card').forEach((card) => {
      card.addEventListener('click', () => {
        const deptId = card.getAttribute('data-dept-id');
        navigateTo('directory', { departmentId: deptId });
      });
    });

    // Book doctor cards
    container.querySelectorAll('.btn-book-doc').forEach((btn) => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-doc-id');
        navigateTo('booking', { doctorId: docId });
      });
    });

    // Search button
    const btnSearch = container.querySelector('#btn-landing-search');
    if (btnSearch) {
      btnSearch.addEventListener('click', () => {
        const q = container.querySelector('#landing-search-input').value;
        const d = container.querySelector('#landing-dept-select').value;
        navigateTo('directory', { search: q, departmentId: d });
      });
    }

    // Footer links
    container.querySelectorAll('.nav-goto').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.getAttribute('data-goto'));
      });
    });
  }

  /* ==========================================================================
     DOCTOR DIRECTORY VIEW
     ========================================================================== */

  function renderDoctorDirectoryView(container, initialParams = {}) {
    const departments = window.SHAS.Departments.getAllDepartments(false);
    let doctors = window.SHAS.Doctors.getAllDoctors({
      activeOnly: true,
      departmentId: initialParams.departmentId,
      search: initialParams.search
    });

    container.innerHTML = `
      <div class="directory-view-container animate-fade-in">
        <div class="directory-header">
          <div class="section-tag">PHYSICIAN DIRECTORY</div>
          <h1 class="greeting-title">Find Hospital Doctors & Specialists</h1>
          <p class="text-muted">Filter by medical department, doctor name, and consultation fee.</p>
        </div>

        <div class="directory-filters-bar">
          <div class="filter-group flex-2">
            <input type="text" id="dir-search-input" class="form-control" placeholder="Search by doctor name or specialty..." value="${getUtils().escapeHTML(initialParams.search || '')}" />
          </div>
          <div class="filter-group">
            <select id="dir-dept-select" class="form-select">
              <option value="all">All Departments</option>
              ${departments.map((d) => `<option value="${d.id}" ${d.id === initialParams.departmentId ? 'selected' : ''}>${getUtils().escapeHTML(d.name)}</option>`).join('')}
            </select>
          </div>
          <div class="filter-group">
            <select id="dir-fee-select" class="form-select">
              <option value="all">All Fees</option>
              <option value="under100">Under $100</option>
              <option value="100to130">$100 - $130</option>
              <option value="over130">$130+</option>
            </select>
          </div>
        </div>

        <div class="doctors-cards-grid mt-4" id="dir-doctors-grid">
          ${renderDoctorCardsHTML(doctors)}
        </div>
      </div>
    `;

    const searchInput = container.querySelector('#dir-search-input');
    const deptSelect = container.querySelector('#dir-dept-select');
    const feeSelect = container.querySelector('#dir-fee-select');
    const grid = container.querySelector('#dir-doctors-grid');

    function filterGrid() {
      const q = searchInput.value;
      const dept = deptSelect.value;
      const fee = feeSelect.value;

      let minFee = undefined;
      let maxFee = undefined;
      if (fee === 'under100') maxFee = 99;
      if (fee === '100to130') {
        minFee = 100;
        maxFee = 130;
      }
      if (fee === 'over130') minFee = 131;

      const filtered = window.SHAS.Doctors.getAllDoctors({
        activeOnly: true,
        departmentId: dept,
        search: q,
        minFee,
        maxFee
      });

      grid.innerHTML = renderDoctorCardsHTML(filtered);
      bindDoctorCardBookButtons(grid);
    }

    searchInput.addEventListener('input', filterGrid);
    deptSelect.addEventListener('change', filterGrid);
    feeSelect.addEventListener('change', filterGrid);

    bindDoctorCardBookButtons(grid);
  }

  function renderDoctorCardsHTML(doctors) {
    if (!doctors || doctors.length === 0) {
      return '<div class="empty-state-card col-span-full"><h3>No doctors found matching filters</h3></div>';
    }
    return doctors
      .map(
        (doc) => `
      <div class="doctor-feature-card">
        <div class="doc-card-image-wrap">
          <img src="${getUtils().escapeHTML(doc.avatar)}" alt="${getUtils().escapeHTML(doc.name)}" class="doc-card-img" />
          <span class="doc-dept-pill">${getUtils().escapeHTML(doc.departmentName)}</span>
        </div>
        <div class="doc-card-body">
          <h3 class="doc-card-name">${getUtils().escapeHTML(doc.name)}</h3>
          <p class="doc-card-title">${getUtils().escapeHTML(doc.title)}</p>
          <p class="doc-card-qual">${getUtils().escapeHTML(doc.qualification)}</p>
          <div class="doc-card-schedule-snippet">
            <span>📅 Days: ${doc.workingDays.map((d) => d.substring(0, 3)).join(', ')}</span>
            <span>⏰ Hours: ${doc.workingHours?.start} - ${doc.workingHours?.end}</span>
          </div>
          <div class="doc-card-meta">
            <span>⭐ ${doc.rating} (${doc.reviewsCount})</span>
            <span class="doc-fee">$${doc.consultationFee}</span>
          </div>
        </div>
        <div class="doc-card-footer">
          <button class="btn btn-primary btn-block btn-book-doc" data-doc-id="${doc.id}">
            Book Appointment
          </button>
        </div>
      </div>
    `
      )
      .join('');
  }

  function bindDoctorCardBookButtons(container) {
    container.querySelectorAll('.btn-book-doc').forEach((btn) => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-doc-id');
        navigateTo('booking', { doctorId: docId });
      });
    });
  }

  /* ==========================================================================
     BOOKING WIZARD FLOW (Steps 1 to 8)
     ========================================================================== */

  function renderBookingWizard(container, initialParams = {}) {
    const departments = window.SHAS.Departments.getAllDepartments(false);
    const session = getStorage().getDemoSession();

    let wizardState = {
      departmentId: initialParams.departmentId || null,
      doctorId: initialParams.doctorId || null,
      date: initialParams.date || getUtils().addDays(getUtils().getTodayDateString(), 1),
      selectedSlot: null,
      notes: ''
    };

    if (wizardState.doctorId && !wizardState.departmentId) {
      const doc = window.SHAS.Doctors.getDoctorById(wizardState.doctorId);
      if (doc) wizardState.departmentId = doc.departmentId;
    } else if (!wizardState.departmentId && departments.length > 0) {
      wizardState.departmentId = departments[0].id;
    }

    container.innerHTML = `
      <div class="booking-wizard-wrapper animate-fade-in">
        <div class="wizard-header">
          <div class="section-tag">STEP-BY-STEP SCHEDULING</div>
          <h1 class="greeting-title">Book a Specialist Appointment</h1>
          <p class="text-muted">Select your department, preferred physician, date, and available time slot.</p>
        </div>

        <div class="wizard-card-container">
          <!-- Step 1: Department -->
          <div class="wizard-step-section">
            <label class="wizard-step-label"><span class="step-badge">1</span> Select Department</label>
            <div class="wizard-dept-pills" id="wizard-dept-pills">
              ${departments
                .map(
                  (d) => `
                <button class="dept-select-pill ${d.id === wizardState.departmentId ? 'selected' : ''}" data-dept-id="${d.id}">
                  ${getUtils().escapeHTML(d.name)}
                </button>
              `
                )
                .join('')}
            </div>
          </div>

          <!-- Step 2: Doctor Selection -->
          <div class="wizard-step-section mt-4">
            <label class="wizard-step-label"><span class="step-badge">2</span> Select Consulting Doctor</label>
            <div class="wizard-doc-picker-grid" id="wizard-doc-picker-grid">
              <!-- Dynamically populated -->
            </div>
          </div>

          <!-- Step 3: Date & Step 4: Slots -->
          <div class="wizard-step-section mt-4">
            <div class="form-row-two">
              <div>
                <label class="wizard-step-label"><span class="step-badge">3</span> Select Appointment Date</label>
                <input type="date" id="wizard-date-input" class="form-control" value="${wizardState.date}" min="${getUtils().getTodayDateString()}" />
              </div>
              <div class="doc-summary-badge" id="wizard-doc-summary-badge">
                <!-- Dynamically populated -->
              </div>
            </div>

            <div class="mt-4">
              <label class="wizard-step-label"><span class="step-badge">4</span> Calculated Available Time Slots</label>
              <div id="wizard-slots-container" class="wizard-slots-container">
                <!-- Slots populated here -->
              </div>
            </div>
          </div>

          <!-- Step 5: Summary & Confirmation Box -->
          <div class="wizard-step-section mt-4" id="wizard-confirmation-box" style="display:none;">
            <label class="wizard-step-label"><span class="step-badge">5</span> Booking Summary</label>
            <div class="booking-summary-card">
              <div class="summary-grid">
                <div>
                  <span class="text-muted text-xs">Patient</span>
                  <div class="font-bold">${getUtils().escapeHTML(session.userName)}</div>
                </div>
                <div>
                  <span class="text-muted text-xs">Doctor</span>
                  <div class="font-bold" id="summary-doc-name">-</div>
                </div>
                <div>
                  <span class="text-muted text-xs">Scheduled Slot</span>
                  <div class="font-bold text-primary" id="summary-slot-time">-</div>
                </div>
                <div>
                  <span class="text-muted text-xs">Consultation Fee</span>
                  <div class="font-bold text-success" id="summary-fee">-</div>
                </div>
              </div>

              <div class="form-group mt-3">
                <label>Clinical Notes or Symptoms (Optional):</label>
                <input type="text" id="wizard-notes-input" class="form-control" placeholder="Brief reason for consultation..." />
              </div>

              <div class="wizard-actions-bar mt-4">
                <button class="btn btn-secondary" id="btn-wizard-back">Back</button>
                <button class="btn btn-primary btn-lg" id="btn-wizard-confirm">Confirm Appointment</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Elements
    const pillsContainer = container.querySelector('#wizard-dept-pills');
    const docGrid = container.querySelector('#wizard-doc-picker-grid');
    const dateInput = container.querySelector('#wizard-date-input');
    const slotsContainer = container.querySelector('#wizard-slots-container');
    const confirmBox = container.querySelector('#wizard-confirmation-box');
    const confirmBtn = container.querySelector('#btn-wizard-confirm');
    const summaryDocName = container.querySelector('#summary-doc-name');
    const summarySlotTime = container.querySelector('#summary-slot-time');
    const summaryFee = container.querySelector('#summary-fee');

    // 1. Department pill click
    pillsContainer.querySelectorAll('.dept-select-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        pillsContainer.querySelectorAll('.dept-select-pill').forEach((p) => p.classList.remove('selected'));
        pill.classList.add('selected');
        wizardState.departmentId = pill.getAttribute('data-dept-id');
        wizardState.doctorId = null;
        wizardState.selectedSlot = null;
        confirmBox.style.display = 'none';
        updateDoctorGrid();
      });
    });

    // 2. Populate Doctor Grid
    function updateDoctorGrid() {
      const docs = window.SHAS.Doctors.getAllDoctors({
        activeOnly: true,
        departmentId: wizardState.departmentId
      });

      if (docs.length === 0) {
        docGrid.innerHTML = '<div class="text-muted py-2">No active doctors in this department.</div>';
        return;
      }

      if (!wizardState.doctorId || !docs.some((d) => d.id === wizardState.doctorId)) {
        wizardState.doctorId = docs[0].id;
      }

      docGrid.innerHTML = docs
        .map(
          (d) => `
        <div class="wizard-doc-card ${d.id === wizardState.doctorId ? 'selected' : ''}" data-doc-id="${d.id}">
          <img src="${getUtils().escapeHTML(d.avatar)}" class="doc-avatar-small" alt="" />
          <div>
            <div class="font-bold">${getUtils().escapeHTML(d.name)}</div>
            <div class="text-xs text-muted">${getUtils().escapeHTML(d.title)} • $${d.consultationFee}</div>
          </div>
        </div>
      `
        )
        .join('');

      docGrid.querySelectorAll('.wizard-doc-card').forEach((card) => {
        card.addEventListener('click', () => {
          docGrid.querySelectorAll('.wizard-doc-card').forEach((c) => c.classList.remove('selected'));
          card.classList.add('selected');
          wizardState.doctorId = card.getAttribute('data-doc-id');
          wizardState.selectedSlot = null;
          confirmBox.style.display = 'none';
          updateSlotsView();
        });
      });

      updateSlotsView();
    }

    // 3. Update Available Slots dynamically using Availability Engine
    function updateSlotsView() {
      const curDate = dateInput.value;
      wizardState.date = curDate;
      wizardState.selectedSlot = null;
      confirmBox.style.display = 'none';

      if (!wizardState.doctorId) {
        slotsContainer.innerHTML = '<div class="text-muted">Select a doctor to view available slots.</div>';
        return;
      }

      const res = window.SHAS.Availability.getDoctorAvailability(wizardState.doctorId, curDate);
      const doctor = res.doctor;

      // Update doctor summary header badge
      const summaryBadge = container.querySelector('#wizard-doc-summary-badge');
      if (summaryBadge && doctor) {
        summaryBadge.innerHTML = `
          <div class="badge-text">
            <strong>${getUtils().escapeHTML(doctor.name)}</strong> (${getUtils().escapeHTML(doctor.departmentName)})
            <div class="text-xs text-muted">Hours: ${doctor.workingHours?.start} - ${doctor.workingHours?.end} • ${doctor.consultationDuration}m slots</div>
          </div>
        `;
      }

      if (!res.isOperating) {
        slotsContainer.innerHTML = `
          <div class="slot-error-box">
            <p class="text-danger"><strong>${getUtils().escapeHTML(res.message)}</strong></p>
            <p class="text-sm">Would you like to join the waiting list for this doctor?</p>
            <button class="btn btn-sm btn-primary" id="btn-wizard-join-waitlist">
              Join Waiting List for ${getUtils().escapeHTML(doctor ? doctor.name : 'this Doctor')}
            </button>
          </div>
        `;
        const wlBtn = slotsContainer.querySelector('#btn-wizard-join-waitlist');
        if (wlBtn) {
          wlBtn.addEventListener('click', () => {
            window.SHAS.Dashboard.openJoinWaitlistModal(wizardState.departmentId, wizardState.doctorId);
          });
        }
        return;
      }

      const availableSlots = res.slots.filter((s) => s.isAvailable);
      const bookedSlots = res.slots.filter((s) => s.status === 'booked' || s.status === 'reserved_offer');

      if (availableSlots.length === 0) {
        slotsContainer.innerHTML = `
          <div class="slot-error-box">
            <p class="text-amber"><strong>All ${res.totalSlots} slots for ${getUtils().formatDate(curDate)} are fully booked.</strong></p>
            <p class="text-sm">Join our waiting list! If any booked patient cancels, our engine will automatically offer the slot to you.</p>
            <button class="btn btn-primary" id="btn-wizard-join-waitlist">
              ⚡ Join Waiting List for ${getUtils().escapeHTML(doctor.name)}
            </button>
          </div>
        `;
        const wlBtn = slotsContainer.querySelector('#btn-wizard-join-waitlist');
        if (wlBtn) {
          wlBtn.addEventListener('click', () => {
            window.SHAS.Dashboard.openJoinWaitlistModal(wizardState.departmentId, wizardState.doctorId);
          });
        }
        return;
      }

      slotsContainer.innerHTML = `
        <div class="slots-info-text text-sm text-muted mb-2">
          ${availableSlots.length} available slot${availableSlots.length === 1 ? '' : 's'} (${bookedSlots.length} booked)
        </div>
        <div class="slots-picker-grid">
          ${res.slots
            .map((s) => {
              if (s.isAvailable) {
                return `
                <button class="slot-pill-btn available" data-time="${s.startTime}">
                  ${s.formattedTime}
                </button>
              `;
              } else {
                return `
                <button class="slot-pill-btn disabled" disabled title="${getUtils().escapeHTML(s.reason)}">
                  ${s.formattedTime} <span class="slot-label">${s.status === 'break' ? 'Break' : 'Booked'}</span>
                </button>
              `;
              }
            })
            .join('')}
        </div>
      `;

      // Bind slot pill click
      slotsContainer.querySelectorAll('.slot-pill-btn.available').forEach((btn) => {
        btn.addEventListener('click', () => {
          slotsContainer.querySelectorAll('.slot-pill-btn').forEach((b) => b.classList.remove('selected'));
          btn.classList.add('selected');
          wizardState.selectedSlot = btn.getAttribute('data-time');

          // Reveal Confirmation Box
          confirmBox.style.display = 'block';
          summaryDocName.textContent = doctor.name;
          summarySlotTime.textContent = `${getUtils().formatDate(curDate)} at ${getUtils().formatTime(wizardState.selectedSlot)}`;
          summaryFee.textContent = `$${doctor.consultationFee}`;
          confirmBox.scrollIntoView({ behavior: 'smooth' });
        });
      });
    }

    dateInput.addEventListener('change', updateSlotsView);

    // Confirm Booking Action
    confirmBtn.addEventListener('click', () => {
      if (!wizardState.doctorId || !wizardState.date || !wizardState.selectedSlot) {
        getUtils().showToast('Validation', 'Please select a date and available time slot.', 'warning');
        return;
      }

      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Securing Slot...';

      const notes = container.querySelector('#wizard-notes-input').value;
      const res = window.SHAS.Appointments.bookAppointment({
        patientId: session.userId,
        patientName: session.userName,
        doctorId: wizardState.doctorId,
        date: wizardState.date,
        startTime: wizardState.selectedSlot,
        notes
      });

      if (res.success) {
        renderBookingSuccess(container, res.appointment);
      } else {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Confirm Appointment';
        getUtils().showToast('Booking Failed', res.error, 'error');
        updateSlotsView(); // Refresh slots if there was a conflict
      }
    });

    // Start wizard
    updateDoctorGrid();
  }

  /**
   * Renders booking success screen (Step 8)
   */
  function renderBookingSuccess(container, appointment) {
    container.innerHTML = `
      <div class="booking-success-wrapper animate-scale-up">
        <div class="success-icon-large">✓</div>
        <h1 class="success-title">Appointment Confirmed!</h1>
        <p class="success-subtitle">Your appointment has been secured in the hospital system.</p>

        <div class="success-ref-card">
          <div class="text-xs text-muted">BOOKING REFERENCE CODE</div>
          <div class="booking-ref-huge">${getUtils().escapeHTML(appointment.bookingRef)}</div>
          
          <div class="success-details-grid">
            <div>
              <span class="text-muted text-xs">Doctor</span>
              <div><strong>${getUtils().escapeHTML(appointment.doctorName)}</strong></div>
              <div class="text-xs text-muted">${getUtils().escapeHTML(appointment.departmentName)}</div>
            </div>
            <div>
              <span class="text-muted text-xs">Date & Time</span>
              <div><strong>${getUtils().formatDate(appointment.appointmentDate)}</strong></div>
              <div>${getUtils().formatTimeRange(appointment.startTime, appointment.endTime)}</div>
            </div>
            <div>
              <span class="text-muted text-xs">Patient</span>
              <div>${getUtils().escapeHTML(appointment.patientName)}</div>
            </div>
            <div>
              <span class="text-muted text-xs">Status</span>
              <div><span class="badge badge-confirmed">Confirmed</span></div>
            </div>
          </div>
        </div>

        <div class="success-actions-row">
          <button class="btn btn-primary btn-lg" id="btn-success-view-portal">
            Go to My Appointments
          </button>
          <button class="btn btn-outline btn-lg" id="btn-success-book-another">
            Book Another Visit
          </button>
        </div>
      </div>
    `;

    container.querySelector('#btn-success-view-portal').addEventListener('click', () => {
      navigateTo('patient');
    });
    container.querySelector('#btn-success-book-another').addEventListener('click', () => {
      navigateTo('booking');
    });
  }

  /* ==========================================================================
     DEMO ROLE SWITCHER MODAL
     ========================================================================== */

  function openRoleSwitcherModal() {
    let modal = document.getElementById('shas-role-switcher-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'shas-role-switcher-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    const currentSession = getStorage().getDemoSession();

    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h2 class="modal-title">Switch Demonstration Role</h2>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="alert-info-box mb-3">
            <div class="box-icon">ℹ</div>
            <div>
              <strong>Frontend Hackathon Prototype:</strong>
              No passwords or credentials required. Switch roles instantly to evaluate Patient, Doctor, and Administrator workflows.
            </div>
          </div>

          <div class="role-selector-cards">
            <!-- Patient 1: Sarah Jenkins -->
            <div class="role-card ${currentSession.role === 'patient' && currentSession.userId === 'pat-1' ? 'active-role' : ''}" data-role="patient" data-user-id="pat-1" data-user-name="Sarah Jenkins">
              <div class="role-card-icon">👩</div>
              <div class="role-card-info">
                <strong>Continue as Patient (Sarah Jenkins)</strong>
                <p class="text-xs text-muted">Holds Queue Position #1 for Dr. Marcus Chen (Tomorrow Morning). Prime candidate for automatic waitlist allocation demo!</p>
              </div>
            </div>

            <!-- Patient 2: Marcus Vance -->
            <div class="role-card ${currentSession.role === 'patient' && currentSession.userId === 'pat-2' ? 'active-role' : ''}" data-role="patient" data-user-id="pat-2" data-user-name="Marcus Vance">
              <div class="role-card-icon">👨</div>
              <div class="role-card-info">
                <strong>Continue as Patient (Marcus Vance)</strong>
                <p class="text-xs text-muted">Holds Queue Position #2. Receives slot if Sarah declines or offer expires.</p>
              </div>
            </div>

            <!-- Doctor: Dr. Marcus Chen -->
            <div class="role-card ${currentSession.role === 'doctor' ? 'active-role' : ''}" data-role="doctor" data-user-id="doc-cardio-1" data-user-name="Dr. Marcus Chen">
              <div class="role-card-icon">🩺</div>
              <div class="role-card-info">
                <strong>Continue as Doctor (Dr. Marcus Chen)</strong>
                <p class="text-xs text-muted">Senior Cardiologist. View fully-booked agenda, mark consults completed, or cancel appointments.</p>
              </div>
            </div>

            <!-- Admin -->
            <div class="role-card ${currentSession.role === 'admin' ? 'active-role' : ''}" data-role="admin" data-user-id="admin-1" data-user-name="Hospital Administrator">
              <div class="role-card-icon">⚙️</div>
              <div class="role-card-info">
                <strong>Continue as Administrator (Hospital Operations)</strong>
                <p class="text-xs text-muted">Full operational dashboard, cancellation management, doctor directory, and real-time waitlist allocation audit logs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    getUtils().openModal('shas-role-switcher-modal');
    modal.querySelectorAll('.modal-close-btn').forEach((b) => {
      b.addEventListener('click', () => getUtils().closeModal('shas-role-switcher-modal'));
    });

    modal.querySelectorAll('.role-card').forEach((card) => {
      card.addEventListener('click', () => {
        const role = card.getAttribute('data-role');
        const userId = card.getAttribute('data-user-id');
        const userName = card.getAttribute('data-user-name');

        getStorage().setDemoSession(role, userId, userName);
        getUtils().closeModal('shas-role-switcher-modal');
        updateRoleIndicator();
        getUtils().showToast('Role Switched', `Now acting as ${userName} (${role.toUpperCase()})`, 'info');

        // Automatically route to appropriate dashboard
        navigateTo(role);
      });
    });
  }

  /* ==========================================================================
     INTERACTIVE DEMO WALKTHROUGH GUIDE (For Hackathon Judges)
     ========================================================================== */

  function openDemoWalkthroughModal() {
    let modal = document.getElementById('shas-demo-tour-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'shas-demo-tour-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-dialog modal-lg">
        <div class="modal-header">
          <h2 class="modal-title">⭐ Hackathon Demonstration Walkthrough Guide</h2>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body tour-modal-body">
          <p>Follow these 4 simple steps to observe the end-to-end <strong>Automatic Waiting-List Allocation Engine</strong> in action:</p>

          <div class="tour-steps-list">
            <div class="tour-step-item">
              <div class="tour-badge">1</div>
              <div class="tour-desc">
                <strong>Inspect Pre-Booked Schedule:</strong>
                Dr. Marcus Chen (Cardiology) is 100% fully booked tomorrow. Sarah Jenkins holds Queue Position #1 on the waiting list.
                <div class="mt-2"><button class="btn btn-xs btn-outline btn-tour-step1">View Dr. Chen's Schedule</button></div>
              </div>
            </div>

            <div class="tour-step-item">
              <div class="tour-badge">2</div>
              <div class="tour-desc">
                <strong>Cancel a Confirmed Appointment:</strong>
                Switch to Administrator or Doctor view and cancel Emily Watson's 10:00 AM appointment (or click the shortcut below).
                <div class="mt-2"><button class="btn btn-xs btn-danger btn-tour-step2">⚡ 1-Click: Cancel Emily's 10:00 AM Slot</button></div>
              </div>
            </div>

            <div class="tour-step-item">
              <div class="tour-badge">3</div>
              <div class="tour-desc">
                <strong>Observe Instant Allocation to Sarah Jenkins:</strong>
                The system automatically evaluates waiting tickets and offers the freed 10:00 AM slot to Sarah Jenkins with an active countdown timer.
                <div class="mt-2"><button class="btn btn-xs btn-success btn-tour-step3">Switch to Sarah's Portal & View Offer</button></div>
              </div>
            </div>

            <div class="tour-step-item">
              <div class="tour-badge">4</div>
              <div class="tour-desc">
                <strong>Test Acceptance or Cascade:</strong>
                Sarah can click "Accept & Confirm" to finalize the booking, or "Decline Slot" to immediately cascade the slot to Marcus Vance (Queue #2)!
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-close-btn">Close Tour</button>
        </div>
      </div>
    `;

    getUtils().openModal('shas-demo-tour-modal');
    modal.querySelectorAll('.modal-close-btn').forEach((b) => {
      b.addEventListener('click', () => getUtils().closeModal('shas-demo-tour-modal'));
    });

    // Tour shortcuts
    modal.querySelector('.btn-tour-step1').addEventListener('click', () => {
      getUtils().closeModal('shas-demo-tour-modal');
      getStorage().setDemoSession('doctor', 'doc-cardio-1', 'Dr. Marcus Chen');
      updateRoleIndicator();
      navigateTo('doctor');
    });

    modal.querySelector('.btn-tour-step2').addEventListener('click', () => {
      const res = window.SHAS.Appointments.cancelAppointment('apt-demo-chen-3', 'Demonstration cancellation', 'admin');
      getUtils().closeModal('shas-demo-tour-modal');
      if (res.success) {
        getUtils().showToast('Slot Released & Allocated!', res.message, 'success');
        getStorage().setDemoSession('patient', 'pat-1', 'Sarah Jenkins');
        updateRoleIndicator();
        navigateTo('patient');
      } else {
        getUtils().showToast('Notice', res.error, 'warning');
      }
    });

    modal.querySelector('.btn-tour-step3').addEventListener('click', () => {
      getUtils().closeModal('shas-demo-tour-modal');
      getStorage().setDemoSession('patient', 'pat-1', 'Sarah Jenkins');
      updateRoleIndicator();
      navigateTo('patient');
    });
  }

  /* ==========================================================================
     NOTIFICATION DROPDOWN & BADGE
     ========================================================================== */

  function updateNotificationBadge() {
    const session = getStorage().getDemoSession();
    const count = window.SHAS.Notifications.getUnreadCount(session.userId, session.role);
    const badge = document.getElementById('nav-notif-badge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
  }

  function toggleNotificationDropdown() {
    let dropdown = document.getElementById('shas-notif-dropdown');
    if (dropdown && dropdown.classList.contains('active')) {
      dropdown.classList.remove('active');
      return;
    }

    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.id = 'shas-notif-dropdown';
      dropdown.className = 'notification-dropdown-panel';
      document.body.appendChild(dropdown);
    }

    const session = getStorage().getDemoSession();
    const notifs = window.SHAS.Notifications.getUserNotifications(session.userId, session.role);

    dropdown.innerHTML = `
      <div class="notif-dropdown-header">
        <h3>Notifications</h3>
        <button class="btn-text text-sm" id="btn-mark-all-read">Mark all as read</button>
      </div>
      <div class="notif-dropdown-list">
        ${
          notifs.length === 0
            ? '<div class="empty-notif py-4 text-center text-muted">No notifications yet.</div>'
            : notifs
                .slice(0, 10)
                .map(
                  (n) => `
              <div class="notif-item ${!n.read ? 'unread' : ''}" data-notif-id="${n.id}">
                <div class="notif-item-header">
                  <strong>${getUtils().escapeHTML(n.title)}</strong>
                  <span class="notif-item-time">${getUtils().formatRelativeTime(new Date(n.timestamp).getTime())}</span>
                </div>
                <p class="notif-item-msg">${getUtils().escapeHTML(n.message)}</p>
              </div>
            `
                )
                .join('')
        }
      </div>
    `;

    // Position dropdown relative to notification button
    const bellBtn = document.getElementById('nav-bell-btn');
    if (bellBtn) {
      const rect = bellBtn.getBoundingClientRect();
      dropdown.style.top = `${rect.bottom + 8}px`;
      dropdown.style.right = `${window.innerWidth - rect.right}px`;
    }

    dropdown.classList.add('active');

    dropdown.querySelector('#btn-mark-all-read')?.addEventListener('click', () => {
      window.SHAS.Notifications.markAllAsRead(session.userId, session.role);
      updateNotificationBadge();
      toggleNotificationDropdown();
    });

    dropdown.querySelectorAll('.notif-item').forEach((item) => {
      item.addEventListener('click', () => {
        const notifId = item.getAttribute('data-notif-id');
        window.SHAS.Notifications.markAsRead(notifId);
        updateNotificationBadge();
        item.classList.remove('unread');
      });
    });

    // Close on click outside
    const closeListener = (e) => {
      if (!dropdown.contains(e.target) && !bellBtn.contains(e.target)) {
        dropdown.classList.remove('active');
        document.removeEventListener('click', closeListener);
      }
    };
    setTimeout(() => document.addEventListener('click', closeListener), 10);
  }

  /* ==========================================================================
     GLOBAL EVENTS & TIMERS
     ========================================================================== */

  function updateRoleIndicator() {
    const session = getStorage().getDemoSession();
    const btn = document.getElementById('btn-active-role-pill');
    if (btn) {
      btn.innerHTML = `<span class="role-icon">👤</span> ${getUtils().escapeHTML(session.userName)} (${getUtils().escapeHTML(session.role.toUpperCase())})`;
    }
  }

  function bindGlobalEvents() {
    // Nav links
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-view');
        if (view) navigateTo(view);
      });
    });

    // Notification bell button
    const bellBtn = document.getElementById('nav-bell-btn');
    if (bellBtn) bellBtn.addEventListener('click', toggleNotificationDropdown);

    // Active role switcher button in header
    const roleBtn = document.getElementById('btn-active-role-pill');
    if (roleBtn) roleBtn.addEventListener('click', openRoleSwitcherModal);

    // Demo tour button in header
    const tourBtn = document.getElementById('nav-demo-tour-btn');
    if (tourBtn) tourBtn.addEventListener('click', openDemoWalkthroughModal);

    // Reset demo button in footer or header
    const resetBtn = document.getElementById('nav-reset-data-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset all demo hospital data to original state?')) {
          getStorage().resetDemoData();
          getUtils().showToast('Reset Complete', 'Demo data restored.', 'info');
          navigateTo('landing');
        }
      });
    }

    // Mobile nav toggle
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const mobileMenu = document.getElementById('nav-menu-wrapper');
    if (mobileToggle && mobileMenu) {
      mobileToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
      });
    }
  }

  /**
   * Background tick for live countdown timers & expired offer checks
   */
  function startBackgroundTimer() {
    let tickCount = 0;
    setInterval(() => {
      tickCount++;

      // 1. Update countdown clock in offer banner if present
      const clockElem = document.getElementById('offer-countdown-clock');
      const offerBanner = document.getElementById('active-offer-banner');
      if (clockElem && offerBanner) {
        const waitlistId = offerBanner.getAttribute('data-waitlist-id');
        const waitlist = getStorage().getData(getStorage().KEYS.WAITLIST, []);
        const entry = waitlist.find((w) => w.id === waitlistId);
        if (entry && entry.offerExpiresAt) {
          const diffMs = entry.offerExpiresAt - Date.now();
          if (diffMs <= 0) {
            clockElem.textContent = '00:00 - EXPIRED';
            window.SHAS.Waitlist.checkAndExpireOffers();
          } else {
            const m = Math.floor(diffMs / 60000);
            const s = Math.floor((diffMs % 60000) / 1000);
            clockElem.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
          }
        }
      }

      // 2. Check for expired offers every 10 seconds
      if (tickCount % 10 === 0) {
        window.SHAS.Waitlist.checkAndExpireOffers();
      }
    }, 1000);
  }

  return {
    init,
    navigateTo,
    openRoleSwitcherModal,
    openDemoWalkthroughModal,
    renderCurrentView
  };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.SHAS.App.init();
});
