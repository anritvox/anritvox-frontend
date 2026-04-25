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

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || localStorage.getItem("ms_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("ms_token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

// ==========================================
// --- ULTIMATE API MODULE MAP ---
// ==========================================

export const auth = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  adminLogin: (data) => api.post("/auth/admin/login", data),
  getAdminProfile: () => api.get("/auth/me"),
  updateAdminProfile: (data) => api.put("/auth/me", data),
  changeAdminPassword: (data) => api.post("/auth/change-password", data),
};

export const users = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
  changePassword: (data) => api.post("/users/change-password", data),
};

export const products = {
  getAllActive: (params) => api.get("/products/active", { params }), 
  getAllAdmin: () => api.get("/products"),
  getById: (id) => api.get(`/products/${id}`),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  toggleStatus: (id, status) => api.patch(`/products/${id}/status`, { status }),
  uploadImages: (id, formData) => api.post(`/products/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage: (id, imageId) => api.delete(`/products/${id}/images`, { data: { imageId } }),
  addSerials: (id, serials) => api.post(`/products/${id}/serials`, { serials }),
  delete: (id) => api.delete(`/products/${id}`),
};

export const categories = {
  getAll: () => api.get("/categories"),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const subcategories = {
  getAll: () => api.get("/subcategories"),
  getById: (id) => api.get(`/subcategories/${id}`),
  create: (data) => api.post("/subcategories", data),
  update: (id, data) => api.put(`/subcategories/${id}`, data),
  delete: (id) => api.delete(`/subcategories/${id}`),
};

export const cart = {
  get: () => api.get("/cart"),
  add: (data) => api.post("/cart", data),
  updateQuantity: (id, quantity) => api.put(`/cart/${id}`, { quantity }),
  remove: (id) => api.delete(`/cart/${id}`),
  clear: () => api.delete("/cart"),
};

export const orders = {
  getMyOrders: () => api.get("/orders/my"),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post("/orders", data),
  getAllAdmin: () => api.get("/orders"),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/orders/${id}`),
};

export const addresses = {
  getAll: () => api.get("/addresses"),
  create: (data) => api.post("/addresses", data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  delete: (id) => api.delete(`/addresses/${id}`),
  setDefault: (id) => api.patch(`/addresses/${id}/default`),
};

export const wishlist = {
  get: () => api.get("/wishlist"),
  add: (productId) => api.post("/wishlist", { productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
};

export const coupons = {
  validate: (code) => api.post("/coupons/validate", { code }),
  getAllAdmin: () => api.get("/coupons"),
  create: (data) => api.post("/coupons", data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
};

export const reviews = {
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  submit: (data) => api.post("/reviews", data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const notifications = {
  get: () => api.get("/notifications"),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
  send: (data) => api.post("/notifications", data),
};

export const analytics = {
  getDashboard: () => api.get("/analytics/dashboard"),
  getSales: () => api.get("/analytics/sales"),
  getProducts: () => api.get("/analytics/products"),
};

export const settings = {
  get: () => api.get("/settings"),
  update: (data) => api.put("/settings", data),
};

export const shipping = {
  getAll: () => api.get("/shipping"),
  create: (data) => api.post("/shipping", data),
  update: (id, data) => api.put(`/shipping/${id}`, data),
  delete: (id) => api.delete(`/shipping/${id}`),
};

export const returns = {
  getMyReturns: () => api.get("/returns/my"),
  submit: (data) => api.post("/returns", data),
  getAllAdmin: () => api.get("/returns"),
  updateStatus: (id, status) => api.patch(`/returns/${id}/status`, { status }),
};

export const inventory = {
  get: () => api.get("/inventory"),
  updateStock: (productId, quantity) => api.patch(`/inventory/${productId}`, { quantity }),
};

export const banners = {
  getActive: () => api.get("/banners"),
  getAllAdmin: () => api.get("/banners/admin/all"),
  create: (data) => api.post("/banners", data),
  update: (id, data) => api.put(`/banners/${id}`, data),
  delete: (id) => api.delete(`/banners/${id}`),
};

export const warranty = {
  register: (data) => api.post("/warranty/register", data),
  getMyWarranties: () => api.get("/warranty/my"),
  getAllAdmin: () => api.get("/warranty"),
  updateStatus: (id, status) => api.patch(`/warranty/${id}/status`, { status }),
};

export const serials = {
  validate: (serial) => api.post("/serials/validate", { serial }),
  getAllAdmin: () => api.get("/serials"),
  add: (data) => api.post("/serials", data),
  delete: (id) => api.delete(`/serials/${id}`),
};

export const contact = {
  submit: (data) => api.post("/contact", data),
  getAllAdmin: () => api.get("/contact"),
  delete: (id) => api.delete(`/contact/${id}`),
};

export const adminManagement = {
  getAllUsers: () => api.get("/admin/users"),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  getAllOrders: () => api.get("/admin/orders"),
};

// ─── ALIAS & VIRTUAL MODULES (To prevent Vercel crashes) ───
export const support = {
  getAllAdmin: () => api.get("/contact"),
  updateStatus: (id, status) => api.patch(`/contact/${id}/status`, { status }),
  delete: (id) => api.delete(`/contact/${id}`),
};

export const loyalty = {
  getSystemConfig: () => api.get("/settings"),
  updateSystemConfig: (data) => api.put("/settings", data),
  getMembers: () => api.get("/admin/users"),
  adjustPoints: (userId, data) => api.patch(`/admin/users/${userId}/status`, data), 
};

// VIRTUAL MODULE: Flash Sales maps securely to products and settings
export const flashSales = {
  getActive: () => api.get("/products/active", { params: { is_flash: true } }),
  getAllAdmin: () => api.get("/products", { params: { flash_sale: true } }),
  create: (data) => api.put(`/products/${data.product_id}`, data), // Proxies to product update
  delete: (id) => api.put(`/products/${id}`, { flash_sale_active: false }),
};

export const fetchCart = () => cart.get();
export const addToCartAPI = (productId, quantity) => cart.add({ productId, quantity });
export const removeFromCartAPI = (productId) => cart.remove(productId);
export const clearCartAPI = () => cart.clear();
export const fetchPublicSettings = () => settings.get(); 
export const fetchProducts = () => products.getAllActive(); 
export const fetchCategories = () => categories.getAll();
export const submitContact = (data) => contact.submit(data);
export const fetchAddressesAPI = async () => { const res = await addresses.getAll(); return res.data; };
export const saveAddressAPI = async (data) => { const res = await addresses.create(data); return res.data.addresses || res.data; };
export const placeOrderAPI = async (data) => { const res = await orders.create(data); return res.data; };

export default api;
