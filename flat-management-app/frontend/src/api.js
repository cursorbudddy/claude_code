import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Buildings
export const getBuildings = () => api.get('/buildings');
export const getBuilding = (id) => api.get(`/buildings/${id}`);
export const createBuilding = (data) => api.post('/buildings', data);
export const updateBuilding = (id, data) => api.put(`/buildings/${id}`, data);
export const deleteBuilding = (id) => api.delete(`/buildings/${id}`);

// Flats
export const getFlats = (params) => api.get('/flats', { params });
export const getFlatsByBuilding = (buildingId) => api.get(`/flats/building/${buildingId}`);
export const getFlat = (id) => api.get(`/flats/${id}`);
export const getFlatHistory = (id) => api.get(`/flats/${id}/history`);
export const updateFlat = (id, data) => api.put(`/flats/${id}`, data);

// Tenants
export const getTenants = () => api.get('/tenants');
export const getTenant = (id) => api.get(`/tenants/${id}`);
export const getTenantPayments = (id, params) => api.get(`/tenants/${id}/payments`, { params });
export const getTenantRentals = (id) => api.get(`/tenants/${id}/rentals`);
export const createTenant = (formData) => api.post('/tenants', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateTenant = (id, formData) => api.put(`/tenants/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteTenant = (id) => api.delete(`/tenants/${id}`);

// Rental Agreements
export const getRentals = (params) => api.get('/rentals', { params });
export const getRental = (id) => api.get(`/rentals/${id}`);
export const createRental = (data) => api.post('/rentals', data);
export const updateRental = (id, data) => api.put(`/rentals/${id}`, data);
export const endRental = (id, data) => api.post(`/rentals/${id}/end`, data);
export const deleteRental = (id) => api.delete(`/rentals/${id}`);

// Payments
export const getPayments = (params) => api.get('/payments', { params });
export const getPayment = (id) => api.get(`/payments/${id}`);
export const getPendingPayments = (params) => api.get('/payments/pending', { params });
export const getPaymentStats = (params) => api.get('/payments/stats', { params });
export const createPayment = (data) => api.post('/payments', data);
export const updatePayment = (id, data) => api.put(`/payments/${id}`, data);
export const deletePayment = (id) => api.delete(`/payments/${id}`);

// Expenses
export const getExpenses = (params) => api.get('/expenses', { params });
export const getExpense = (id) => api.get(`/expenses/${id}`);
export const getExpenseCategories = () => api.get('/expenses/categories');
export const getExpenseStats = (params) => api.get('/expenses/stats', { params });
export const createExpense = (data) => api.post('/expenses', data);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

// Dashboard
export const getDashboardStats = (params) => api.get('/dashboard/stats', { params });
export const getDashboardTrends = (params) => api.get('/dashboard/trends', { params });

// Invoices
export const getInvoices = (params) => api.get('/invoices', { params });
export const getInvoice = (id) => api.get(`/invoices/${id}`);
export const createInvoice = (data) => api.post('/invoices', data);
export const updateInvoice = (id, data) => api.put(`/invoices/${id}`, data);
export const downloadInvoice = (id) => api.get(`/invoices/${id}/download`, {
  responseType: 'blob'
});
export const deleteInvoice = (id) => api.delete(`/invoices/${id}`);

// Payment Schedules
export const getPaymentSchedules = (rentalId) => api.get(`/payment-schedules/${rentalId}`);
export const getOverdueSchedules = (params) => api.get('/payment-schedules/overdue/all', { params });
export const getPendingSchedules = (params) => api.get('/payment-schedules/pending/all', { params });
export const generateSchedules = (rentalId) => api.post(`/payment-schedules/${rentalId}/generate`);
export const updateSchedule = (id, data) => api.put(`/payment-schedules/${id}`, data);
export const recordSchedulePayment = (id, data) => api.post(`/payment-schedules/${id}/payment`, data);
export const getNextDuePayment = (rentalId) => api.get(`/payment-schedules/${rentalId}/next-due`);

export default api;
