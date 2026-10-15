/**
 * Smart Hospital Appointment System (SHAS) - Departments Module
 * CRUD operations, status management, validation, and queries for hospital departments.
 */

window.SHAS = window.SHAS || {};

window.SHAS.Departments = (function () {
  'use strict';

  function getStorage() {
    return window.SHAS.Storage;
  }

  function getUtils() {
    return window.SHAS.Utils;
  }

  /**
   * Retrieves all departments from storage
   * @param {boolean} includeInactive - whether to include inactive departments
   */
  function getAllDepartments(includeInactive = false) {
    const list = getStorage().getData(getStorage().KEYS.DEPARTMENTS, []);
    if (includeInactive) return list;
    return list.filter((dept) => dept.active);
  }

  /**
   * Finds a department by ID
   */
  function getDepartmentById(id) {
    const list = getAllDepartments(true);
    return list.find((dept) => dept.id === id) || null;
  }

  /**
   * Adds a new department
   */
  function addDepartment(data) {
    if (!data.name || !data.name.trim()) {
      return { success: false, error: 'Department name is required.' };
    }

    const list = getAllDepartments(true);
    const normalizedName = data.name.trim().toLowerCase();
    const exists = list.some((d) => d.name.toLowerCase() === normalizedName);
    if (exists) {
      return { success: false, error: 'A department with this name already exists.' };
    }

    const newDept = {
      id: 'dept-' + getUtils().generateUUID().substring(0, 8),
      name: data.name.trim(),
      description: data.description ? data.description.trim() : 'Specialized medical department.',
      icon: data.icon || 'Activity',
      color: data.color || '#2563eb',
      active: data.active !== false,
      createdAt: new Date().toISOString()
    };

    list.push(newDept);
    getStorage().setData(getStorage().KEYS.DEPARTMENTS, list);
    getStorage().logAudit('DEPARTMENT_ADDED', { departmentId: newDept.id, name: newDept.name });

    return { success: true, department: newDept };
  }

  /**
   * Updates an existing department
   */
  function updateDepartment(id, updates) {
    const list = getAllDepartments(true);
    const index = list.findIndex((d) => d.id === id);
    if (index === -1) {
      return { success: false, error: 'Department not found.' };
    }

    if (updates.name && updates.name.trim()) {
      const normalizedName = updates.name.trim().toLowerCase();
      const duplicate = list.some((d) => d.id !== id && d.name.toLowerCase() === normalizedName);
      if (duplicate) {
        return { success: false, error: 'Another department already uses this name.' };
      }
      list[index].name = updates.name.trim();
    }

    if (updates.description !== undefined) {
      list[index].description = updates.description.trim();
    }
    if (updates.icon) {
      list[index].icon = updates.icon;
    }
    if (updates.color) {
      list[index].color = updates.color;
    }
    if (updates.active !== undefined) {
      list[index].active = Boolean(updates.active);
    }

    list[index].updatedAt = new Date().toISOString();
    getStorage().setData(getStorage().KEYS.DEPARTMENTS, list);
    getStorage().logAudit('DEPARTMENT_UPDATED', { departmentId: id, updates });

    return { success: true, department: list[index] };
  }

  /**
   * Toggles department active / inactive status
   */
  function toggleDepartmentStatus(id) {
    const list = getAllDepartments(true);
    const dept = list.find((d) => d.id === id);
    if (!dept) return { success: false, error: 'Department not found.' };

    dept.active = !dept.active;
    dept.updatedAt = new Date().toISOString();
    getStorage().setData(getStorage().KEYS.DEPARTMENTS, list);
    getStorage().logAudit('DEPARTMENT_STATUS_TOGGLED', { departmentId: id, active: dept.active });

    return { success: true, active: dept.active, department: dept };
  }

  /**
   * Returns doctor count associated with a department
   */
  function getDoctorCountForDepartment(deptId) {
    const doctors = getStorage().getData(getStorage().KEYS.DOCTORS, []);
    return doctors.filter((doc) => doc.departmentId === deptId && doc.active).length;
  }

  return {
    getAllDepartments,
    getDepartmentById,
    addDepartment,
    updateDepartment,
    toggleDepartmentStatus,
    getDoctorCountForDepartment
  };
})();
