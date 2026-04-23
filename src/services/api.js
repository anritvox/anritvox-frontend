import axios from "axios";

let envBaseUrl = import.meta.env.VITE_BASE_URL || "https://service.anritvox.com";

if (envBaseUrl.startsWith("http://") && !envBaseUrl.includes("localhost")) {
  envBaseUrl = envBaseUrl.replace("http://", "https://");
}

export const BASE_URL = envBaseUrl;
const API_BASE_URL = `${BASE_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// REQUEST INTERCEPTOR: Auth Token Injection
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || localStorage.getItem("ms_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// GLOBAL 401 HANDLER: Auto-logout on token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("ms_token");
      localStorage.removeItem("user");
      // Optional: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- API HELPER MODULES ---

export const products = {
  getAll: () => api.get("/products"),
  getActive: () => api.get("/products/active"),
  getNewArrivals: () => api.get("/products/new-arrivals"),
  getById: (id) => api.get(`/products/${id}`),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const categories = {
  getAll: () => api.get("/categories"),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const orders = {
  getAll: () => api.get("/orders"),
  getMyOrders: () => api.get("/orders/my-orders"),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post("/orders", data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

export const warranty = {
  validate: (serial) => api.get(`/warranty/validate/${encodeURIComponent(serial)}`),
  register: (data) => api.post("/warranty/register", data),
  getAll: () => api.get("/warranty"), 
  updateStatus: (id, status) => api.patch(`/warranty/${id}/status`, { status }),
};

export const users = {
  getProfile: () => api.get("/users/profile"),
  getAll: () => api.get("/admin-users"), 
  updateRole: (id, role) => api.patch(`/admin-users/${id}/role`, { role }),
};

export const banners = {
  getAll: () => api.get("/banners"),
  create: (data) => api.post("/banners", data),
  delete: (id) => api.delete(`/banners/${id}`),
};

// --- NAMED EXPORTS: CART, SETTINGS, SHOP, CONTACT (Legacy Context Preservation) ---
export const fetchCart = () => api.get("/cart");
export const addToCartAPI = (productId, quantity) => api.post("/cart", { productId, quantity });
export const removeFromCartAPI = (productId) => api.delete(`/cart/${productId}`);
export const clearCartAPI = () => api.delete("/cart");

export const fetchPublicSettings = () => api.get("/settings/public");
export const fetchProducts = () => api.get("/products");
export const fetchCategories = () => api.get("/categories");
export const submitContact = (data) => api.post("/contact", data);

// --- NAMED EXPORTS: CHECKOUT (New Dependencies Found in Deep Scan) ---
export const fetchAddressesAPI = async () => {
  const res = await api.get("/addresses");
  return res.data;
};

export const saveAddressAPI = async (data) => {
  const res = await api.post("/addresses", data);
  return res.data.addresses || res.data; 
};

export const placeOrderAPI = async (data) => {
  const res = await api.post("/orders", data);
  return res.data;
};

export default api;
