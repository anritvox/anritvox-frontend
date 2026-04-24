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
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
  getAllAdmin: () => api.get("/reviews"),
  approve: (id) => api.put(`/reviews/${id}/approve`),
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
  getSales: (period) => api.get(`/analytics/kpis?period=${period || '30'}`),
  getProducts: () => api.get("/analytics/products"),
  getKpis: (period) => api.get(`/analytics/kpis?period=${period || '30'}`),
};

export const settings = {
  get: () => api.get("/settings/public").catch(() => api.get("/settings")),
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
  getActive: () => api.get("/banners/active").catch(() => api.get("/banners")),
  getAllAdmin: () => api.get("/banners"),
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

export const support = {
  getAllTickets: () => api.get("/support/tickets"),
  getTicket: (id) => api.get(`/support/tickets/${id}`),
  createTicket: (data) => api.post("/support/tickets", data),
  replyToTicket: (id, data) => api.post(`/support/tickets/${id}/reply`, data),
  updateTicketStatus: (id, status) => api.patch(`/support/tickets/${id}/status`, { status }),
  deleteTicket: (id) => api.delete(`/support/tickets/${id}`),
  uploadAttachment: (formData) => api.post("/support/upload", formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const loyalty = {
  getConfig: () => api.get("/loyalty/config"),
  updateConfig: (data) => api.put("/loyalty/config", data),
  getAllMembers: () => api.get("/loyalty/members"),
  getMemberPoints: (userId) => api.get(`/loyalty/members/${userId}`),
  adjustPoints: (userId, data) => api.post(`/loyalty/members/${userId}/adjust`, data),
  getTiers: () => api.get("/loyalty/tiers"),
  createTier: (data) => api.post("/loyalty/tiers", data),
  updateTier: (id, data) => api.put(`/loyalty/tiers/${id}`, data),
  deleteTier: (id) => api.delete(`/loyalty/tiers/${id}`),
};

export const flashSales = {
  getAll: () => api.get("/flash-sales"),
  getById: (id) => api.get(`/flash-sales/${id}`),
  create: (data) => api.post("/flash-sales", data),
  update: (id, data) => api.put(`/flash-sales/${id}`, data),
  delete: (id) => api.delete(`/flash-sales/${id}`),
  toggleStatus: (id) => api.patch(`/flash-sales/${id}/toggle`),
};

export const affiliate = {
  getAllPartners: () => api.get("/affiliate/partners"),
  getPartner: (id) => api.get(`/affiliate/partners/${id}`),
  updatePartnerStatus: (id, status) => api.patch(`/affiliate/partners/${id}/status`, { status }),
  getCommissions: () => api.get("/affiliate/commissions"),
  updateCommission: (id, data) => api.put(`/affiliate/commissions/${id}`, data),
  getConfig: () => api.get("/affiliate/config"),
  updateConfig: (data) => api.put("/affiliate/config", data),
  approveWithdrawal: (id) => api.patch(`/affiliate/withdrawals/${id}/approve`),
  getAllWithdrawals: () => api.get("/affiliate/withdrawals"),
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
