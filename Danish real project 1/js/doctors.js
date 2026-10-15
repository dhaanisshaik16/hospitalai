/**
 * Smart Hospital Appointment System (SHAS) - Doctors Module
 * Manages doctor directory, profiles, schedules, working hours, breaks, leaves,
 * and administrative updates with LocalStorage persistence.
 */

window.SHAS = window.SHAS || {};

window.SHAS.Doctors = (function () {
  'use strict';

  function getStorage() {
    return window.SHAS.Storage;
  }

  function getUtils() {
    return window.SHAS.Utils;
  }

  /**
   * Retrieves all doctors, optionally filtered
   * @param {Object} filters - { departmentId, search, minFee, maxFee, activeOnly }
   */
  function getAllDoctors(filters = {}) {
    let list = getStorage().getData(getStorage().KEYS.DOCTORS, []);

    if (filters.activeOnly !== false) {
      list = list.filter((doc) => doc.active);
    }

    if (filters.departmentId && filters.departmentId !== 'all') {
      list = list.filter((doc) => doc.departmentId === filters.departmentId);
    }

    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (doc) =>
          doc.name.toLowerCase().includes(q) ||
          doc.title.toLowerCase().includes(q) ||
          doc.departmentName.toLowerCase().includes(q) ||
          (doc.qualification && doc.qualification.toLowerCase().includes(q))
      );
    }

    if (filters.minFee !== undefined && filters.minFee !== '') {
      list = list.filter((doc) => doc.consultationFee >= Number(filters.minFee));
    }

    if (filters.maxFee !== undefined && filters.maxFee !== '') {
      list = list.filter((doc) => doc.consultationFee <= Number(filters.maxFee));
    }

    return list;
  }

  /**
   * Gets a doctor by ID
   */
  function getDoctorById(id) {
    const list = getStorage().getData(getStorage().KEYS.DOCTORS, []);
    return list.find((doc) => doc.id === id) || null;
  }

  /**
   * Adds a new doctor
   */
  function addDoctor(data) {
    if (!data.name || !data.name.trim()) {
      return { success: false, error: 'Doctor name is required.' };
    }
    if (!data.departmentId) {
      return { success: false, error: 'Department is required.' };
    }

    const dept = window.SHAS.Departments.getDepartmentById(data.departmentId);
    if (!dept) {
      return { success: false, error: 'Selected department is invalid.' };
    }

    // Working hours validation
    const startMins = getUtils().timeToMinutes(data.workingHours?.start || '09:00');
    const endMins = getUtils().timeToMinutes(data.workingHours?.end || '17:00');
    if (startMins >= endMins) {
      return { success: false, error: 'Working start time must be before end time.' };
    }

    const duration = parseInt(data.consultationDuration, 10) || 30;
    if (![15, 20, 30, 45, 60].includes(duration)) {
      return { success: false, error: 'Consultation duration must be 15, 20, 30, 45, or 60 minutes.' };
    }

    const newDoctor = {
      id: 'doc-' + getUtils().generateUUID().substring(0, 8),
      name: data.name.trim(),
      title: data.title ? data.title.trim() : 'Physician Specialist',
      departmentId: dept.id,
      departmentName: dept.name,
      qualification: data.qualification ? data.qualification.trim() : 'MD',
      experienceYears: parseInt(data.experienceYears, 10) || 5,
      consultationFee: parseFloat(data.consultationFee) || 100,
      consultationDuration: duration,
      avatar: data.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
      workingDays: Array.isArray(data.workingDays) && data.workingDays.length > 0
        ? data.workingDays
        : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: {
        start: data.workingHours?.start || '09:00',
        end: data.workingHours?.end || '17:00'
      },
      breaks: Array.isArray(data.breaks)
        ? data.breaks
        : [{ name: 'Lunch Break', start: '13:00', end: '14:00' }],
      leaves: Array.isArray(data.leaves) ? data.leaves : [],
      rating: 5.0,
      reviewsCount: 1,
      active: data.active !== false,
      bio: data.bio ? data.bio.trim() : 'Dedicated clinical specialist.',
      createdAt: new Date().toISOString()
    };

    const list = getStorage().getData(getStorage().KEYS.DOCTORS, []);
    list.push(newDoctor);
    getStorage().setData(getStorage().KEYS.DOCTORS, list);
    getStorage().logAudit('DOCTOR_ADDED', { doctorId: newDoctor.id, name: newDoctor.name });

    return { success: true, doctor: newDoctor };
  }

  /**
   * Updates an existing doctor profile
   */
  function updateDoctor(id, updates) {
    const list = getStorage().getData(getStorage().KEYS.DOCTORS, []);
    const index = list.findIndex((doc) => doc.id === id);
    if (index === -1) {
      return { success: false, error: 'Doctor not found.' };
    }

    if (updates.departmentId) {
      const dept = window.SHAS.Departments.getDepartmentById(updates.departmentId);
      if (dept) {
        list[index].departmentId = dept.id;
        list[index].departmentName = dept.name;
      }
    }

    if (updates.name) list[index].name = updates.name.trim();
    if (updates.title) list[index].title = updates.title.trim();
    if (updates.qualification) list[index].qualification = updates.qualification.trim();
    if (updates.experienceYears !== undefined) list[index].experienceYears = parseInt(updates.experienceYears, 10);
    if (updates.consultationFee !== undefined) list[index].consultationFee = parseFloat(updates.consultationFee);
    if (updates.consultationDuration !== undefined) list[index].consultationDuration = parseInt(updates.consultationDuration, 10);
    if (updates.avatar) list[index].avatar = updates.avatar;
    if (updates.workingDays) list[index].workingDays = updates.workingDays;
    if (updates.workingHours) list[index].workingHours = updates.workingHours;
    if (updates.breaks) list[index].breaks = updates.breaks;
    if (updates.active !== undefined) list[index].active = Boolean(updates.active);
    if (updates.bio !== undefined) list[index].bio = updates.bio.trim();

    list[index].updatedAt = new Date().toISOString();
    getStorage().setData(getStorage().KEYS.DOCTORS, list);
    getStorage().logAudit('DOCTOR_UPDATED', { doctorId: id, updates });

    return { success: true, doctor: list[index] };
  }

  /**
   * Toggles doctor active/inactive status
   */
  function toggleDoctorStatus(id) {
    const list = getStorage().getData(getStorage().KEYS.DOCTORS, []);
    const doc = list.find((d) => d.id === id);
    if (!doc) return { success: false, error: 'Doctor not found.' };

    doc.active = !doc.active;
    doc.updatedAt = new Date().toISOString();
    getStorage().setData(getStorage().KEYS.DOCTORS, list);
    getStorage().logAudit('DOCTOR_STATUS_TOGGLED', { doctorId: id, active: doc.active });

    return { success: true, active: doc.active, doctor: doc };
  }

  /**
   * Adds a planned leave period for a doctor
   */
  function addDoctorLeave(doctorId, leave) {
    if (!leave.startDate || !leave.endDate) {
      return { success: false, error: 'Start and end dates are required for leave.' };
    }
    if (leave.startDate > leave.endDate) {
      return { success: false, error: 'Leave start date cannot be after end date.' };
    }

    const list = getStorage().getData(getStorage().KEYS.DOCTORS, []);
    const doc = list.find((d) => d.id === doctorId);
    if (!doc) return { success: false, error: 'Doctor not found.' };

    if (!Array.isArray(doc.leaves)) {
      doc.leaves = [];
    }

    const newLeave = {
      id: getUtils().generateUUID().substring(0, 8),
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason || 'Medical / Personal Leave',
      createdAt: new Date().toISOString()
    };

    doc.leaves.push(newLeave);
    getStorage().setData(getStorage().KEYS.DOCTORS, list);
    getStorage().logAudit('DOCTOR_LEAVE_ADDED', { doctorId, leave: newLeave });

    return { success: true, leave: newLeave };
  }

  /**
   * Removes a leave entry
   */
  function removeDoctorLeave(doctorId, leaveId) {
    const list = getStorage().getData(getStorage().KEYS.DOCTORS, []);
    const doc = list.find((d) => d.id === doctorId);
    if (!doc || !Array.isArray(doc.leaves)) return { success: false, error: 'Doctor or leaves not found.' };

    doc.leaves = doc.leaves.filter((l) => l.id !== leaveId);
    getStorage().setData(getStorage().KEYS.DOCTORS, list);
    getStorage().logAudit('DOCTOR_LEAVE_REMOVED', { doctorId, leaveId });

    return { success: true };
  }

  /**
   * Checks whether a doctor has historical appointments (to prevent deletion)
   */
  function hasHistoricalAppointments(doctorId) {
    const appointments = getStorage().getData(getStorage().KEYS.APPOINTMENTS, []);
    return appointments.some((apt) => apt.doctorId === doctorId);
  }

  return {
    getAllDoctors,
    getDoctorById,
    addDoctor,
    updateDoctor,
    toggleDoctorStatus,
    addDoctorLeave,
    removeDoctorLeave,
    hasHistoricalAppointments
  };
})();
