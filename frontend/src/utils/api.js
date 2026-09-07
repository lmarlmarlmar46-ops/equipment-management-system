import axios from 'axios';

// Get API URL from environment or use Railway deployment
const API_URL = import.meta.env.VITE_API_URL || 
                process.env.VITE_API_URL || 
                'https://equipment-management-system-production-7e9c.up.railway.app/api';

console.log('API URL:', API_URL); // Debug log

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access denied. Insufficient permissions.');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error. Please try again later.');
          break;
        default:
          console.error('An error occurred:', error.response.data.error || error.message);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  changePassword: (data) => api.post('/auth/change-password', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// ============================================
// WORKFLOW API (Core IT Operations)
// ============================================

export const workflowAPI = {
  // Employee: Submit equipment request
  requestEquipment: (requestData) => api.post('/workflow/request-equipment', requestData),
  
  // IT: Get pending requests with suggested equipment
  getPendingRequests: () => api.get('/workflow/pending-requests'),
  
  // IT: Approve request and create allocation in one step
  approveAndAllocate: (data) => api.post('/workflow/approve-and-allocate', data),
  
  // Employee: Initiate return
  initiateReturn: (data) => api.post('/workflow/initiate-return', data),
  
  // IT: Process return
  processReturn: (data) => api.post('/workflow/process-return', data),
  
  // Dashboard overview
  getDashboardOverview: () => api.get('/workflow/dashboard-overview'),
};

// ============================================
// WORK ASSIGNMENTS API (Task Management)
// ============================================

export const workAssignmentsAPI = {
  getAll: (params) => api.get('/work-assignments', { params }),
  getById: (id) => api.get(`/work-assignments/${id}`),
  create: (assignmentData) => api.post('/work-assignments', assignmentData),
  updateStatus: (id, statusData) => api.patch(`/work-assignments/${id}/status`, statusData),
  delete: (id) => api.delete(`/work-assignments/${id}`),
  getStats: () => api.get('/work-assignments/stats/overview'),
};

// ============================================
// EMPLOYEES API
// ============================================

export const employeesAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (employeeData) => api.post('/employees', employeeData),
  update: (id, employeeData) => api.put(`/employees/${id}`, employeeData),
  delete: (id) => api.delete(`/employees/${id}`),
  getEquipment: (id) => api.get(`/employees/${id}/equipment`),
  getAllocationHistory: (id) => api.get(`/employees/${id}/allocation-history`),
};

// ============================================
// EQUIPMENT API
// ============================================

export const equipmentAPI = {
  getAll: (params) => api.get('/equipment', { params }),
  getById: (id) => api.get(`/equipment/${id}`),
  create: (equipmentData) => api.post('/equipment', equipmentData),
  update: (id, equipmentData) => api.put(`/equipment/${id}`, equipmentData),
  delete: (id) => api.delete(`/equipment/${id}`),
  getHistory: (id) => api.get(`/equipment/${id}/history`),
  getQRCode: (id) => api.get(`/equipment/${id}/qrcode`),
  bulkGenerateQR: () => api.post('/equipment/qrcode/bulk'),
};

// ============================================
// ALLOCATIONS API
// ============================================

export const allocationsAPI = {
  getAll: (params) => api.get('/allocations', { params }),
  getById: (id) => api.get(`/allocations/${id}`),
  create: (allocationData) => api.post('/allocations', allocationData),
  update: (id, allocationData) => api.put(`/allocations/${id}`, allocationData),
  delete: (id) => api.delete(`/allocations/${id}`),
  getActive: () => api.get('/allocations?status=active'),
  getOverdue: () => api.get('/allocations?status=active&overdue=true'),
};

// ============================================
// MAINTENANCE API
// ============================================

export const maintenanceAPI = {
  getAll: (params) => api.get('/maintenance', { params }),
  getById: (id) => api.get(`/maintenance/${id}`),
  create: (maintenanceData) => api.post('/maintenance', maintenanceData),
  update: (id, maintenanceData) => api.put(`/maintenance/${id}`, maintenanceData),
  delete: (id) => api.delete(`/maintenance/${id}`),
  getByEquipment: (equipmentId) => api.get(`/maintenance?equipment_id=${equipmentId}`),
  getUpcoming: () => api.get('/maintenance/upcoming'),
};

// ============================================
// WARRANTIES API
// ============================================

export const warrantiesAPI = {
  getAll: (params) => api.get('/warranties', { params }),
  getById: (id) => api.get(`/warranties/${id}`),
  create: (warrantyData) => api.post('/warranties', warrantyData),
  update: (id, warrantyData) => api.put(`/warranties/${id}`, warrantyData),
  delete: (id) => api.delete(`/warranties/${id}`),
  getExpiring: (days = 30) => api.get(`/warranties/expiring?days=${days}`),
};

// ============================================
// SERVICE REQUESTS API
// ============================================

export const serviceRequestsAPI = {
  getAll: (params) => api.get('/service-requests', { params }),
  getById: (id) => api.get(`/service-requests/${id}`),
  create: (requestData) => api.post('/service-requests', requestData),
  update: (id, requestData) => api.put(`/service-requests/${id}`, requestData),
  delete: (id) => api.delete(`/service-requests/${id}`),
  assign: (id, userId) => api.patch(`/service-requests/${id}/assign`, { assigned_to: userId }),
  resolve: (id, resolution) => api.patch(`/service-requests/${id}/resolve`, { resolution }),
};

// ============================================
// RESERVATIONS API
// ============================================

export const reservationsAPI = {
  getAll: (params) => api.get('/reservations', { params }),
  getById: (id) => api.get(`/reservations/${id}`),
  create: (reservationData) => api.post('/reservations', reservationData),
  update: (id, reservationData) => api.put(`/reservations/${id}`, reservationData),
  delete: (id) => api.delete(`/reservations/${id}`),
  cancel: (id) => api.patch(`/reservations/${id}/cancel`),
  fulfill: (id) => api.patch(`/reservations/${id}/fulfill`),
};

// ============================================
// REPORTS API
// ============================================

export const reportsAPI = {
  getEquipmentUtilization: () => api.get('/reports/equipment-utilization'),
  getDepartmentAnalysis: () => api.get('/reports/department-analysis'),
  getCostAnalysis: () => api.get('/reports/cost-analysis'),
  getAllocationHistory: (params) => api.get('/reports/allocation-history', { params }),
  getOverdueEquipment: () => api.get('/reports/overdue-equipment'),
  getLifecycleReport: () => api.get('/reports/lifecycle'),
};

// ============================================
// NOTIFICATIONS API
// ============================================

export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnread: () => api.get('/notifications/unread'),
  getById: (id) => api.get(`/notifications/${id}`),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// ============================================
// DEPRECIATION API
// ============================================

export const depreciationAPI = {
  calculate: (equipmentId, params) => api.get(`/depreciation/calculate/${equipmentId}`, { params }),
  getCurrentValue: (equipmentId) => api.get(`/depreciation/current-value/${equipmentId}`),
  getSchedule: (equipmentId, params) => api.get(`/depreciation/schedule/${equipmentId}`, { params }),
};

// ============================================
// BULK OPERATIONS API
// ============================================

export const bulkAPI = {
  importEquipment: (formData) => api.post('/bulk/import/equipment', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  importEmployees: (formData) => api.post('/bulk/import/employees', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  exportEquipment: (params) => api.get('/bulk/export/equipment', { 
    params,
    responseType: 'blob'
  }),
  exportEmployees: (params) => api.get('/bulk/export/employees', { 
    params,
    responseType: 'blob'
  }),
  exportAllocations: (params) => api.get('/bulk/export/allocations', { 
    params,
    responseType: 'blob'
  }),
};

// ============================================
// DASHBOARD API
// ============================================

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
