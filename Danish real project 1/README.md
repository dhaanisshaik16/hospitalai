# Smart Hospital Appointment System (SHAS)

> **Frontend-Only Hackathon Prototype**  
> Built with HTML5, CSS3, Vanilla JavaScript, and LocalStorage.  
> **Zero backend or external database required.**

---

## 🏥 Project Overview

The **Smart Hospital Appointment System (SHAS)** is a modern, responsive web application engineered to solve one of healthcare's most pervasive operational bottlenecks: **unfilled appointment slots caused by late cancellations and inefficient manual scheduling.**

At the core of the system is the **Automatic Waiting-List Allocation Engine**. When an existing patient cancels or reschedules an appointment, the system evaluates waitlist requests in real-time, matches physician and time preferences, locks the released slot, and delivers a time-sensitive offer to the next eligible patient with live countdown clocks and automated cascading.

---

## 🚀 Instant Launch Instructions

Because SHAS is built with standard Vanilla JavaScript and LocalStorage, **no backend installation, build step, or API keys are required.**

### Option 1: Direct File Launch (No server required)
Simply double-click or drag-and-drop `index.html` into Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari:
```bash
# In Windows File Explorer or terminal:
start index.html
```

### Option 2: Local Static Server (Recommended for local previews)
If you prefer running via a local static web server:
```bash
# Using Node.js npx serve:
npx serve .

# Or using Python (if installed):
python -m http.server 8080
```
Then navigate to: `http://localhost:3000` (or `http://localhost:8080`).

---

## 🌟 Primary Hackathon Innovation: Automatic Waiting-List Allocation

### The Problem
Hospitals typically experience a 10%–25% appointment cancellation rate. Front-desk staff must manually telephone waiting patients, causing delays, lost physician productivity, and prolonged patient wait times.

### The Innovation
SHAS automates the entire slot recovery pipeline in the browser:
1. **Slot Release:** A patient or administrator cancels an appointment or reschedules to another date.
2. **Criteria Filtering:** The engine identifies all waiting patients matching:
   - Selected department (e.g., Cardiology)
   - Doctor preference (Specific physician or "Any Available Doctor")
   - Preferred date window ($[\text{start\_date}, \text{end\_date}]$)
   - Preferred time of day (Morning 8am–12pm, Afternoon 12pm–5pm, or Any)
3. **FIFO Queue Priority:** Candidates are sorted by timestamp / queue seniority.
4. **Temporary Reservation Lock:** The highest priority candidate receives an **OFFERED** ticket with a configurable expiration window (default 15 minutes, with a 1-click test simulation button for judges).
5. **Two-Way Action:**
   - **Accept:** The slot converts into a confirmed booking, queue status updates to `FULFILLED`, and confirmation references are generated.
   - **Decline or Expire:** The reservation lock releases and **immediately cascades to the next eligible patient in queue.**

---

## 🎯 Step-by-Step Hackathon Demonstration Script

Judges can execute this complete live demo in **under 2 minutes**:

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| **1** | Open the website and click the **⭐ Demo Guide** button in the top navigation bar. | The demo helper drawer opens explaining the pre-configured scenario. |
| **2** | Switch to **Doctor Role (Dr. Marcus Chen, Cardiology)**. | View tomorrow's schedule: **Dr. Chen is 100% fully booked** with 14 patients across morning and afternoon. |
| **3** | Switch to **Patient Role (Sarah Jenkins)**. | Sarah holds **Queue Position #1** on the waitlist for Dr. Chen tomorrow morning. Marcus Vance holds Queue Position #2. |
| **4** | Switch to **Admin Portal** or click **"1-Click: Cancel Emily's 10:00 AM Slot"** in the Demo Guide. | Emily Watson's 10:00 AM appointment is cancelled. The system notification confirms: *"Released slot automatically offered to Sarah Jenkins (Offer expires in 15m)"*. |
| **5** | Switch to **Sarah Jenkins (Patient Portal)**. | A glowing amber banner appears: **"⚡ TIME-SENSITIVE SLOT ALLOCATION"** displaying Dr. Chen on tomorrow at 10:00 AM with a live ticking countdown clock! |
| **6** | Click **"Decline Slot"** as Sarah. | Sarah declines the offer. The engine immediately cascades the released slot to **Marcus Vance (Queue #2)**! |
| **7** | Switch to **Marcus Vance** in the role switcher. | Marcus now holds the active offer for the 10:00 AM slot. |
| **8** | Click **"Accept & Confirm Appointment"**. | The slot is confirmed, booking reference `SHAS-2026-XXXX` is issued, and the slot is removed from availability. |
| **9** | Refresh the browser page (`F5`). | All updated records, audit logs, and appointments persist in LocalStorage without data loss. |

---

## 📂 Project Architecture

```
smart-hospital-appointment-system/
├── index.html               # Main HTML entry point with semantic landmarks & modals
├── css/
│   ├── styles.css           # Modern clinical design tokens, cards, badges, buttons, tables
│   └── responsive.css       # Mobile & tablet breakpoints, responsive drawers, tap targets
├── js/
│   ├── utils.js             # Date/time arithmetic, UUID, HTML escaping, toast alerts
│   ├── storage.js           # LocalStorage wrapper, custom reactive event bus, import/export
│   ├── seed-data.js         # Synthetic dataset (8 depts, 12 doctors, 30 patients, demo queues)
│   ├── departments.js       # Department CRUD, validation, active status toggling
│   ├── doctors.js           # Doctor profiles, schedules, fees, breaks, leaves, status
│   ├── availability.js      # Core slot calculation engine (detects breaks, leaves, overlaps)
│   ├── appointments.js      # Booking lifecycle, cancellation, rescheduling, status updates
│   ├── waitlist.js          # Automatic allocation algorithm, FIFO matching, cascading offers
│   ├── notifications.js     # In-app notifications with badge counter and action links
│   ├── dashboard.js         # Patient, Doctor, and Administrator views & analytics
│   └── app.js               # Application router, demo role switcher, background timers
├── assets/
│   ├── images/              # Visual assets & avatars
│   └── icons/               # SVG icon graphics
└── README.md                # Documentation & evaluation guide
```

---

## 🛠 Implemented Features

### 1. Public Landing Page
- Clinical medical theme (Medical blue `#1e40af`, teal `#0d9488`, slate `#0f172a`).
- Prominent hero heading: *"Your Health, Your Time, Simplified."*
- Doctor search bar with department filtering.
- Department specialty cards.
- Featured physician cards with credentials and fees.
- 3-step booking explanation and waiting list innovation showcase.

### 2. Demo Role Switcher
- Fast 1-click identity switching without login barriers:
  - **Patient:** Sarah Jenkins (`pat-1`), Marcus Vance (`pat-2`), or any synthetic patient.
  - **Physician:** Dr. Marcus Chen (Cardiology) or any of the 12 doctors.
  - **Operations Administrator:** Full facility oversight.

### 3. Patient Portal
- Welcome banner with patient medical profile.
- Next appointment spotlight card with quick Reschedule and Cancel triggers.
- Live ticking slot offer banner with Accept and Decline buttons.
- Tabs for All, Upcoming, Waitlist Tickets, Completed, and Cancelled appointments.
- Filterable views and detailed booking modal.

### 4. Appointment Availability Engine (`js/availability.js`)
- Dynamically generates time slots from doctor's operating hours and duration (15, 20, 30 mins).
- Prevents slots from displaying if:
  - Doctor is inactive or off-duty.
  - Date is in the past or earlier today.
  - Slot falls on a doctor break (e.g., lunch 1:00 PM – 2:00 PM).
  - Doctor is on scheduled leave.
  - Conflicting confirmed appointment exists.
  - Active temporary waitlist reservation is holding the slot.

### 5. Multi-Step Booking Wizard
- Step 1: Medical Department.
- Step 2: Physician Selection.
- Step 3: Appointment Date.
- Step 4: Available Slots (with direct prompt to join waitlist if fully booked).
- Step 5: Booking Summary & Patient Notes.
- Step 6: Confirmation & Unique Booking Reference (`SHAS-2026-XXXX`).

### 6. Doctor Dashboard
- Physician profile card with rating, fee, and operating hours.
- 7-day capacity and slot availability forecast bar.
- Daily agenda with patient contact details and clinical notes.
- Clinical action triggers: *Mark Completed*, *Mark No-Show*, *Cancel Consultation*.

### 7. Administrator Operations Center
- Real-time KPI summary cards (Total doctors, active departments, today's visits, cancellation rate).
- Full appointment manager with multi-criteria search and filter.
- Doctor Directory Manager (Add doctor, edit fees, modify consultation durations, toggle status).
- Department Manager (Add department, edit descriptions, toggle active state).
- Waitlist Allocation Center (Live queue inspection, pending offer monitor, *Simulate Expiration* button, allocation audit trail).
- Operational Analytics (Department volume breakdown, slot recovery rate).
- System settings and Data Management (Export JSON, Import JSON, Reset demo data).

---

## ⚠️ Prototype Scope & Known Limitations

This software is an **academic/hackathon demonstration prototype**:
1. **Frontend-Only Architecture:** Built without a Node.js, Python, or database server.
2. **Browser LocalStorage:** Data is persisted in the local browser profile. It does not synchronize concurrently across distinct devices.
3. **Simulated Authentication:** Role switching is provided for interface evaluation and does not constitute HIPAA-compliant secure authentication.
4. **Demonstration Dataset:** All doctor names, patient identities, and facility details are synthetic.
5. **No Medical Diagnosis:** SHAS is purely an administrative scheduling platform and does not offer medical advice.

---

## 🏆 Hackathon Evaluation Summary

- **Architecture:** Zero dependencies, modular ES6 JavaScript, responsive CSS3.
- **Problem Solved:** Eradicates unused cancelled appointment slots through instantaneous, automated waitlist reallocation.
- **Completeness:** 100% of workflows (booking, cancellation, auto-allocation, acceptance, cascading, administrative controls) are demonstrable out of the box.
