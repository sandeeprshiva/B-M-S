import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // PostgREST: request representation on write and exact count for ranges
    Prefer: 'return=representation',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    // Only attach Authorization if we have a real JWT. Skip demo token to avoid PostgREST JWT requirement.
    if (token && token !== 'demo-token') {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers && config.headers.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getUsers: () => api.get('/users'),
};

// Users API (admin only)
export const usersAPI = {
  getAll: (params = {}, headers = {}) => api.get('/users', { params, headers }),
  getById: (id) => api.get(`/users?id=eq.${id}`),
  getByUsername: (username) => api.get(`/users?username=eq.${username}`),
  getByEmail: (email) => api.get(`/users?email=eq.${email}`),
  create: (user) => api.post('/users', user, { 
    headers: { 'Prefer': 'return=representation' } 
  }),
  update: (id, user) => api.patch(`/users?id=eq.${id}`, user),
  delete: (id) => api.delete(`/users?id=eq.${id}`),
  register: (userData) => api.post('/users', userData, { 
    headers: { 'Prefer': 'return=representation' } 
  }),
  // Test database connection
  testConnection: () => api.get('/users?limit=1'),
};

// Vendors API
export const vendorsAPI = {
  getAll: (params = {}, headers = {}) => api.get('/vendors', { params, headers }),
  getById: (id) => api.get(`/vendors?id=eq.${id}`),
  create: (vendor) => api.post('/vendors', vendor),
  update: (id, vendor) => api.patch(`/vendors?id=eq.${id}`, vendor),
  delete: (id) => api.delete(`/vendors?id=eq.${id}`),
};

// Products API
export const productsAPI = {
  getAll: (params = {}, headers = {}) => api.get('/products', { params, headers }),
  getById: (id) => api.get(`/products?id=eq.${id}`),
  create: (product) => api.post('/products', product),
  update: (id, product) => api.patch(`/products?id=eq.${id}`, product),
  delete: (id) => api.delete(`/products?id=eq.${id}`),
};

// Purchase Orders API
export const purchaseOrdersAPI = {
  getAll: (params = {}, headers = {}) => api.get('/purchase_orders', { params, headers }),
  getById: (id) => api.get(`/purchase_orders?id=eq.${id}`),
  create: (order) => api.post('/purchase_orders', order, { 
    headers: { 'Prefer': 'return=representation' } 
  }),
  update: (id, order) => api.patch(`/purchase_orders?id=eq.${id}`, order),
  delete: (id) => api.delete(`/purchase_orders?id=eq.${id}`),
  getLines: (orderId) => api.get(`/purchase_order_lines?purchase_order_id=eq.${orderId}`),
  createLine: (line) => api.post('/purchase_order_lines', line, { 
    headers: { 'Prefer': 'return=representation' } 
  }),
  updateLine: (id, line) => api.patch(`/purchase_order_lines?id=eq.${id}`, line),
  deleteLine: (id) => api.delete(`/purchase_order_lines?id=eq.${id}`),
};

// Vendor Bills API
export const vendorBillsAPI = {
  getAll: (params = {}, headers = {}) => api.get('/vendor_bills', { params, headers }),
  getById: (id) => api.get(`/vendor_bills?id=eq.${id}`),
  create: (bill) => api.post('/vendor_bills', bill, { 
    headers: { 'Prefer': 'return=representation' } 
  }),
  update: (id, bill) => api.patch(`/vendor_bills?id=eq.${id}`, bill),
  delete: (id) => api.delete(`/vendor_bills?id=eq.${id}`),
  getLines: (billId) => api.get(`/vendor_bill_lines?vendor_bill_id=eq.${billId}`),
  createLine: (line) => api.post('/vendor_bill_lines', line),
  updateLine: (id, line) => api.patch(`/vendor_bill_lines?id=eq.${id}`, line),
  deleteLine: (id) => api.delete(`/vendor_bill_lines?id=eq.${id}`),
};

// Payments API
export const paymentsAPI = {
  getAll: (params = {}, headers = {}) => api.get('/payments', { params, headers }),
  getById: (id) => api.get(`/payments?id=eq.${id}`),
  create: (payment) => api.post('/payments', payment),
  update: (id, payment) => api.patch(`/payments?id=eq.${id}`, payment),
  delete: (id) => api.delete(`/payments?id=eq.${id}`),
};

// HSN Cache API
export const hsnAPI = {
  getAll: (params = {}, headers = {}) => api.get('/hsn_cache', { params, headers }),
  getByCode: (code) => api.get(`/hsn_cache?hsn_code=eq.${code}`),
  create: (record) => api.post('/hsn_cache', record),
  update: (idOrCode, record) => {
    // If numeric id available use id, else use hsn_code
    if (Number(idOrCode)) return api.patch(`/hsn_cache?id=eq.${idOrCode}`, record);
    return api.patch(`/hsn_cache?hsn_code=eq.${idOrCode}`, record);
  },
  delete: (idOrCode) => {
    if (Number(idOrCode)) return api.delete(`/hsn_cache?id=eq.${idOrCode}`);
    return api.delete(`/hsn_cache?hsn_code=eq.${idOrCode}`);
  },
};

// Dashboard Stats API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// Health API
export const healthAPI = {
  ping: () => api.get('/'), // PostgREST serves OpenAPI at root
};

export default api;
