import axios from "axios";

export const BASE_URL = import.meta.env.VITE_BASE_URL || "https://service.anritvox.com";
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
  (error) => {
    return Promise.reject(error);
  }
);

/* --- CATEGORIES & PRODUCTS --- */
export async function fetchCategories() {
  const res = await api.get(`/categories`);
  return res.data;
}
export async function fetchProducts() {
  const res = await api.get(`/products`);
  return res.data;
}
export async function fetchProductById(id) {
  const res = await api.get(`/products/${id}`);
  return res.data;
}
export async function fetchProductsAdmin() {
  const res = await api.get(`/products`);
  return res.data;
}
export async function createProduct(formData) {
  const res = await api.post(`/products`, formData);
  return res.data;
}
export async function updateProduct(id, formData) {
  const res = await api.put(`/products/${id}`, formData);
  return res.data;
}
export async function deleteProduct(id) {
  const res = await api.delete(`/products/${id}`);
  return res.data;
}

/* --- SERIAL MANAGEMENT API --- */
export async function fetchProductSerials(productId, page = 1, limit = 100, sortBy = "created_at", sortOrder = "DESC") {
  const res = await api.get(`/serials/${productId}?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
  return res.data;
}
// Advanced Generator - now accepts base_warranty_months
export async function addProductSerials(productId, count, prefix, batchNumber, notes, base_warranty_months) {
  const payload = { productId, count, prefix, format: "advanced", batchNumber, notes };
  if (base_warranty_months !== null && base_warranty_months !== undefined && base_warranty_months !== "") {
    payload.base_warranty_months = Number(base_warranty_months);
  }
  const res = await api.post(`/serials/generate`, payload);
  return res.data;
}
// Manual/Excel Array Importer
export async function bulkAddProductSerials(productId, serials, base_warranty_months = null) {
  const payload = { serials };
  if (base_warranty_months !== null && base_warranty_months !== undefined && base_warranty_months !== "") {
    payload.base_warranty_months = Number(base_warranty_months);
  }
  const res = await api.post(`/serials/${productId}/add`, payload);
  return res.data;
}
// Native Excel Exporter
export async function exportSerialsExcel(filters = {}) {
  const params = new URLSearchParams(filters);
  const res = await api.get(`/serials/export/excel?${params.toString()}`, { responseType: "blob" });
  return res.data;
}
export async function updateProductSerial(productId, serialId, serial) {
  const res = await api.put(`/serials/${productId}/${serialId}`, { serial });
  return res.data;
}
export async function deleteProductSerial(productId, serialId) {
  const res = await api.delete(`/serials/${productId}/${serialId}`);
  return res.data;
}
export async function checkSerialAvailability(serial) {
  const res = await api.get(`/serials/check/${encodeURIComponent(serial)}`);
  return res.data;
}

/* --- WARRANTY & ADMIN --- */
export async function fetchAllSerialsAdmin() {
  const res = await api.get(`/warranty/serials`);
  return res.data;
}
export async function deleteWarrantySerial(serialId) {
  const res = await api.delete(`/warranty/serials/${serialId}`);
  return res.data;
}
export async function fetchCart() {
  const res = await api.get(`/cart`);
  return res.data;
}
export async function addToCartAPI(productId, quantity) {
  const res = await api.post(`/cart`, { productId, quantity });
  return res.data;
}
export async function removeFromCartAPI(productId) {
  const res = await api.delete(`/cart/${productId}`);
  return res.data;
}
export async function clearCartAPI() {
  const res = await api.delete(`/cart`);
  return res.data;
}
export async function adminLogin(credentials) {
  const res = await api.post(`/auth/login`, credentials);
  return res.data;
}
export async function changeAdminPassword(currentPassword, newPassword) {
  const res = await api.post(`/users/change-password`, { currentPassword, newPassword });
  return res.data;
}
export async function fetchSubcategories() {
  const res = await api.get(`/subcategories`);
  return res.data;
}
export async function updateCategory(id, data) {
  const res = await api.put(`/categories/${id}`, data);
  return res.data;
}
export async function createCategory(data) {
  const res = await api.post(`/categories`, data);
  return res.data;
}
export async function deleteCategory(id) {
  const res = await api.delete(`/categories/${id}`);
  return res.data;
}
export async function createSubcategory(data) {
  const res = await api.post(`/subcategories`, data);
  return res.data;
}
export async function updateSubcategory(id, data) {
  const res = await api.put(`/subcategories/${id}`, data);
  return res.data;
}
export async function deleteSubcategory(id) {
  const res = await api.delete(`/subcategories/${id}`);
  return res.data;
}
export async function fetchCouponsAdmin() {
  const res = await api.get(`/coupons`);
  return res.data;
}
export async function fetchReturnsAdmin() {
  const res = await api.get(`/returns`);
  return res.data;
}
export async function fetchWarrantyAdmin() {
  const res = await api.get(`/warranty/admin`);
  return res.data;
}
export async function fetchAdminUsers() {
  const res = await api.get(`/admin/users`);
  return res.data;
}
export async function fetchAdminOrders() {
  const res = await api.get(`/admin/orders`);
  return res.data;
}
export async function fetchContactsAdmin() {
  const res = await api.get(`/contact`);
  return res.data;
}
export async function updateWarrantyStatusAdmin(id, status) {
  const res = await api.put(`/warranty/admin/${id}`, { status });
  return res.data;
}
export async function deleteWarrantyAdmin(id) {
  const res = await api.delete(`/warranty/admin/${id}`);
  return res.data;
}
export async function fetchPublicSettings() {
  const res = await api.get(`/settings/public`);
  return res.data;
}
export async function fetchActiveBanners() {
  const res = await api.get(`/banners`);
  return res.data;
}
export async function fetchBannersAdmin() {
  const res = await api.get(`/banners/admin/all`);
  return res.data;
}
export async function createBannerAdmin(formData) {
  const res = await api.post(`/banners`, formData);
  return res.data;
}
export async function updateBannerAdmin(id, formData) {
  const res = await api.put(`/banners/${id}`, formData);
  return res.data;
}
export async function deleteBannerAdmin(id) {
  if (!id || typeof id === "object") {
    throw new Error("Invalid Banner ID provided");
  }
  const res = await api.delete(`/banners/${id}`);
  return res.data;
}
export async function registerWarranty(data) {
  const res = await api.post(`/warranty/register`, data);
  return res.data;
}
export async function fetchMyOrders() {
  const res = await api.get(`/orders/my`);
  return res.data;
}
export async function changePassword(currentPassword, newPassword) {
  const res = await api.post(`/users/change-password`, { currentPassword, newPassword });
  return res.data;
}
export async function getProfile() {
  const res = await api.get(`/users/profile`);
  return res.data;
}
export async function updateProfile(data) {
  const res = await api.put(`/users/profile`, data);
  return res.data;
}
export async function fetchAddressesAPI() {
  const res = await api.get(`/addresses`);
  return res.data;
}
export async function saveAddressAPI(data) {
  const res = await api.post(`/addresses`, data);
  return res.data;
}
export async function placeOrderAPI(data) {
  const res = await api.post(`/orders`, data);
  return res.data;
}
export async function submitContact(data) {
  const res = await api.post(`/contact`, data);
  return res.data;
}
export async function adjustStock(productId, adjustment) {
  const res = await api.post(`/products/${productId}/stock`, { adjustment });
  return res.data;
}
export async function fetchAdminDashboard() {
  const res = await api.get(`/admin/dashboard`);
  return res.data;
}
export async function exportOrdersCSV() {
  const res = await api.get(`/admin/orders/export/csv`, { responseType: "blob" });
  return res.data;
}
export async function bulkUpdateOrderStatus(orderIds, status) {
  const res = await api.post(`/admin/orders/bulk-status`, { orderIds, status });
  return res.data;
}
export async function fetchCustomerSegments() {
  const res = await api.get(`/admin/customers/segments`);
  return res.data;
}
export default api;
