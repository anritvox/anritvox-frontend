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
// GLOBAL 401 HANDLER: Prevents .filter() crashes by forcing logout on expired sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("ms_token");
      // Redirect based on current path
      const isAdminPath = window.location.pathname.startsWith('/admin');
      window.location.href = isAdminPath ? "/admin/login" : "/login";
    }
    return Promise.reject(error);
  }
);
/* --- CATEGORIES & PRODUCTS --- */
export async function fetchCategories() {
  const res = await api.get(`/categories`);
  return res.data;
}
export async function fetchProducts() {
  const res = await api.get(`/products/active`);
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
export async function addProductSerials(productId, count, prefix, batchNumber, notes, base_warranty_months) {
  const payload = { productId, count, prefix, format: "advanced", batchNumber, notes };
  if (base_warranty_months !== null && base_warranty_months !== undefined && base_warranty_months !== "") {
    payload.base_warranty_months = Number(base_warranty_months);
  }
  const res = await api.post(`/serials/generate`, payload);
  return res.data;
}
export async function bulkAddProductSerials(productId, serials, base_warranty_months = null) {
  const payload = { serials };
  if (base_warranty_months !== null && base_warranty_months !== undefined && base_warranty_months !== "") {
    payload.base_warranty_months = Number(base_warranty_months);
  }
  const res = await api.post(`/serials/${productId}/add`, payload);
  return res.data;
}
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
/* --- SEARCH & DISCOVERY --- */
export async function searchProductSuggestions(query) {
  const res = await api.get(`/products/search/suggestions?q=${encodeURIComponent(query)}`);
  return res.data;
}
export async function fetchProductsByBrand(brand) {
  const res = await api.get(`/products?brand=${encodeURIComponent(brand)}`);
  return res.data;
}
export async function fetchNewArrivals(limit = 8) {
  const res = await api.get(`/products/new-arrivals?limit=${limit}`);
  return res.data;
}
export async function fetchRelatedProducts(productId) {
  const res = await api.get(`/products/${productId}/related`);
  return res.data;
}
export async function fetchFrequentlyBoughtTogether(productId) {
  const res = await api.get(`/products/${productId}/frequently-bought`);
  return res.data;
}
export async function fetchPersonalizedRecommendations() {
  const res = await api.get(`/products/recommendations`);
  return res.data;
}
/* --- PRODUCT Q&A --- */
export async function fetchProductQA(productId) {
  try {
    const res = await api.get(`/products/${productId}/qa`);
    return res.data;
  } catch (err) {
    console.warn('QA feature not available:', err);
    return { questions: [] };
  }
}
export async function submitProductQuestion(productId, data) {
  try {
    const res = await api.post(`/products/${productId}/qa`, data);
    return res.data;
  } catch (err) {
    console.warn('QA feature not available:', err);
    throw new Error('Q&A feature is not available');
  }
}
export async function answerProductQuestion(productId, questionId, answer) {
  const res = await api.post(`/products/${productId}/qa/${questionId}/answer`, { answer });
  return res.data;
}
export async function fetchAdminQA(params = {}) {
  const q = new URLSearchParams(params);
  const res = await api.get(`/admin/qa?${q}`);
  return res.data;
}
export async function approveQA(id) {
  const res = await api.put(`/admin/qa/${id}/approve`);
  return res.data;
}
export async function deleteQA(id) {
  const res = await api.delete(`/admin/qa/${id}`);
  return res.data;
}
/* --- REVIEWS EXTENDED --- */
export async function fetchProductReviews(productId) {
  const res = await api.get(`/reviews/product/${productId}`);
  return res.data;
}
export async function submitProductReview(productId, formData) {
  const payload = { ...formData, product_id: productId };
  const res = await api.post(`/reviews`, payload);
  return res.data;
}
export async function fetchAdminReviews(params = {}) {
  const q = new URLSearchParams(params);
  const res = await api.get(`/reviews?${q}`);
  return res.data;
}
export async function approveReview(id) {
  const res = await api.put(`/reviews/${id}/approve`);
  return res.data;
}
export async function deleteReview(id) {
  const res = await api.delete(`/reviews/${id}`);
  return res.data;
}
/* --- WISHLIST API --- */
export async function fetchWishlistAPI() {
  const res = await api.get(`/wishlist`);
  return res.data;
}
export async function addToWishlistAPI(productId) {
  const res = await api.post(`/wishlist`, { productId });
  return res.data;
}
export async function removeFromWishlistAPI(productId) {
  const res = await api.delete(`/wishlist/${productId}`);
  return res.data;
}
/* --- LOYALTY & REFERRAL --- */
export async function fetchLoyaltyPoints() {
  const res = await api.get(`/loyalty/points`);
  return res.data;
}
export async function fetchLoyaltyHistory() {
  const res = await api.get(`/loyalty/history`);
  return res.data;
}
export async function fetchReferralInfo() {
  const res = await api.get(`/referral/my`);
  return res.data;
}
export async function submitReferral(referralCode) {
  const res = await api.post(`/referral/use`, { code: referralCode });
  return res.data;
}
/* --- CART SAVE & ABANDONED CART --- */
export async function saveCartAPI(cartData) {
  const res = await api.post(`/cart/save`, { items: cartData });
  return res.data;
}
export async function restoreCartAPI() {
  const res = await api.get(`/cart/saved`);
  return res.data;
}
export async function trackAbandonedCart(cartData) {
  const res = await api.post(`/cart/abandoned`, { items: cartData });
  return res.data;
}
/* --- ORDERS EXTENDED --- */
export async function cancelOrderAPI(orderId, reason) {
  const res = await api.post(`/orders/${orderId}/cancel`, { reason });
  return res.data;
}
export async function requestReturnAPI(orderId, data) {
  const res = await api.post(`/orders/${orderId}/return`, data);
  return res.data;
}
export async function requestExchangeAPI(orderId, data) {
  const res = await api.post(`/orders/${orderId}/exchange`, data);
  return res.data;
}
export async function downloadInvoiceAPI(orderId) {
  const res = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
  return res.data;
}
export async function reorderAPI(orderId) {
  const res = await api.post(`/orders/${orderId}/reorder`);
  return res.data;
}
export async function fetchOrderDetailsAPI(orderId) {
  const res = await api.get(`/orders/${orderId}`);
  return res.data;
}
/* --- SUPPORT TICKETS --- */
export async function createSupportTicket(data) {
  const res = await api.post(`/support/tickets`, data);
  return res.data;
}
export async function fetchMyTickets() {
  const res = await api.get(`/support/tickets/my`);
  return res.data;
}
/* --- SHIPPING --- */
export async function calculateShipping(pincode, cartTotal) {
  const res = await api.post(`/shipping/calculate`, { pincode, cartTotal });
  return res.data;
}
export async function checkCODAvailability(pincode) {
  const res = await api.get(`/shipping/cod-check?pincode=${pincode}`);
  return res.data;
}
export async function getEstimatedDelivery(pincode) {
  const res = await api.get(`/shipping/delivery-estimate?pincode=${pincode}`);
  return res.data;
}
/* --- COUPONS STOREFRONT --- */
export async function applyCouponAPI(code, cartTotal) {
  const res = await api.post(`/coupons/apply`, { code, cartTotal });
  return res.data;
}
/* --- ADMIN SHIPMENT MANAGEMENT --- */
export async function fetchShipmentsAdmin(params = {}) {
  const q = new URLSearchParams(params);
  const res = await api.get(`/admin/shipments?${q}`);
  return res.data;
}
export async function updateShipmentAdmin(id, data) {
  const res = await api.put(`/admin/shipments/${id}`, data);
  return res.data;
}
export async function fetchAdminSalesKPIs(period = '30d') {
  const res = await api.get(`/admin/analytics/kpis?period=${period}`);
  return res.data;
}
export async function fetchExchangesAdmin() {
  const res = await api.get(`/admin/exchanges`);
  return res.data;
}
export async function updateExchangeAdmin(id, data) {
  const res = await api.put(`/admin/exchanges/${id}`, data);
  return res.data;
}
/* --- PRODUCT ATTACHMENTS --- */
export async function fetchProductAttachments(productId) {
  const res = await api.get(`/products/${productId}/attachments`);
  return res.data;
}
/* --- SEO --- */
export async function updateProductSEO(productId, data) {
  const res = await api.put(`/products/${productId}/seo`, data);
  return res.data;
}
export async function updateCategorySEO(categoryId, data) {
  const res = await api.put(`/categories/${categoryId}/seo`, data);
  return res.data;
}
