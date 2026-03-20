import axios from 'axios';

// Correctly use Vite environment variables
export const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://service.anritvox.com';
const API_BASE_URL = `${BASE_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Helper for tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('ms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

// ─── PUBLIC API ────────────────────────────────────────────────────────────
export async function fetchCategories() {
  const res = await fetch(`${BASE_URL}/api/categories`);
  return res.json();
}

export async function fetchProducts() {
  const res = await fetch(`${BASE_URL}/api/products`);
  return res.json();
}

export async function fetchProductById(id) {
  const res = await fetch(`${BASE_URL}/api/products/${id}`);
  return res.json();
}

// ─── ADMIN: PRODUCT MANAGEMENT ────────────────────────────────────────────
export async function fetchProductsAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/products`, { headers: authHeader(token) });
  return res.json();
}

export async function createProduct(formData, token) {
  const res = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: authHeader(token),
    body: formData,
  });
  return res.json();
}

export async function updateProduct(id, formData, token) {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: authHeader(token),
    body: formData,
  });
  return res.json();
}

export async function deleteProduct(id, token) {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  return res.json();
}

// ─── ADMIN: SERIAL MANAGEMENT (FIXED ENDPOINTS) ────────────────────────────
export async function fetchProductSerials(token, productId, page = 1, limit = 100) {
  const res = await fetch(`${BASE_URL}/api/serials/product/${productId}?page=${page}&limit=${limit}`, {
    headers: authHeader(token)
  });
  return res.json();
}

export async function addProductSerials(productId, count, prefix, token) {
  const res = await fetch(`${BASE_URL}/api/serials/generate`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, count, prefix, batchNumber: Date.now() }),
  });
  return res.json();
}

export async function bulkAddProductSerials(productId, serials, token) {
  // Same endpoint as addProductSerials - backend generates them
  const count = Array.isArray(serials) ? serials.length : parseInt(serials);
  return addProductSerials(productId, count, 'AV', token);
}

export async function updateProductSerial(productId, serialId, newSerial, token) {
  const res = await fetch(`${BASE_URL}/api/serials/${serialId}`, {
    method: 'PUT',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, serial: newSerial }),
  });
  return res.json();
}

export async function deleteProductSerial(productId, serialId, token) {
  const res = await fetch(`${BASE_URL}/api/serials/${serialId}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  return res.json();
}

export async function checkSerialAvailability(serial) {
  const res = await fetch(`${BASE_URL}/api/serials/check/${encodeURIComponent(serial)}`);
  return res.json();
}

// ─── CART SYSTEM ───────────────────────────────────────────────────────────
export async function fetchCart(token) {
  const res = await fetch(`${BASE_URL}/api/cart`, { headers: authHeader(token) });
  if (!res.ok) throw new Error('Failed to load cart');
  return res.json();
}

export async function addToCartAPI(token, productId, quantity) {
  const res = await fetch(`${BASE_URL}/api/cart`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity }),
  });
  return res.json();
}

export async function removeFromCartAPI(token, productId) {
  const res = await fetch(`${BASE_URL}/api/cart/${productId}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  return res.json();
}

export async function clearCartAPI(token) {
  const res = await fetch(`${BASE_URL}/api/cart`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  return res.json();
}

// ─── AUTH & ADMIN ──────────────────────────────────────────────────────────
export async function adminLogin(credentials) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return res.json();
}

export async function changeAdminPassword(currentPassword, newPassword, token) {
  const res = await fetch(`${BASE_URL}/api/users/change-password`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return res.json();
}

// ─── CATEGORIES & SUBCATEGORIES (FIXED ENDPOINTS) ──────────────────────────
export async function fetchSubcategories(token) {
  const res = await fetch(`${BASE_URL}/api/subcategories`, { headers: authHeader(token) });
  return res.json();
}

export async function updateCategory(id, data, token) {
  const res = await fetch(`${BASE_URL}/api/categories/${id}`, {
    method: 'PUT',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createCategory(data, token) {
  const res = await fetch(`${BASE_URL}/api/categories`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteCategory(id, token) {
  const res = await fetch(`${BASE_URL}/api/categories/${id}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  return res.json();
}

export async function createSubcategory(data, token) {
  const res = await fetch(`${BASE_URL}/api/subcategories`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateSubcategory(id, data, token) {
  const res = await fetch(`${BASE_URL}/api/subcategories/${id}`, {
    method: 'PUT',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteSubcategory(id, token) {
  const res = await fetch(`${BASE_URL}/api/subcategories/${id}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  return res.json();
}

// ─── ADMIN FEATURES (COUPONS, RETURNS, WARRANTY, USERS, ORDERS) ───────────
export async function fetchCouponsAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/coupons`, { headers: authHeader(token) });
  return res.json();
}

export async function fetchReturnsAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/returns`, { headers: authHeader(token) });
  return res.json();
}

export async function fetchWarrantyAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/warranty/admin`, { headers: authHeader(token) });
  return res.json();
}

export async function fetchAdminUsers(token) {
  const res = await fetch(`${BASE_URL}/api/admin/users`, { headers: authHeader(token) });
  return res.json();
}

export async function fetchAdminOrders(token) {
  const res = await fetch(`${BASE_URL}/api/admin/orders`, { headers: authHeader(token) });
  return res.json();
}

export async function fetchContactsAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/contact`, { headers: authHeader(token) });
  return res.json();
}

export async function updateWarrantyStatusAdmin(token, id, status) {
  const res = await fetch(`${BASE_URL}/api/warranty/admin/${id}`, {
    method: 'PUT',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function deleteWarrantyAdmin(token, id) {
  const res = await fetch(`${BASE_URL}/api/warranty/admin/${id}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  return res.json();
}

export async function fetchPublicSettings() {
  const res = await fetch(`${BASE_URL}/api/settings/public`);
  return res.json();
}

// ─── PUBLIC BANNERS (FIXED ENDPOINT) ───────────────────────────────────────
export async function fetchActiveBanners() {
  const res = await fetch(`${BASE_URL}/api/banners`);
  return res.json();
}

// ─── ADMIN: BANNER MANAGEMENT (FIXED ENDPOINT) ─────────────────────────────
export async function fetchBannersAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/banners/admin/all`, { headers: authHeader(token) });
  return res.json();
}

export async function createBannerAdmin(formData, token) {
  const res = await fetch(`${BASE_URL}/api/banners`, {
    method: 'POST',
    headers: authHeader(token),
    body: formData,
  });
  return res.json();
}

export async function updateBannerAdmin(id, formData, token) {
  const res = await fetch(`${BASE_URL}/api/banners/${id}`, {
    method: 'PUT',
    headers: authHeader(token),
    body: formData,
  });
  return res.json();
}

export async function deleteBannerAdmin(id, token) {
  const res = await fetch(`${BASE_URL}/api/banners/${id}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  return res.json();
}

// ─── EWARRANTY REGISTRATION ─────────────────────────────────────────────────
export async function registerWarranty(data) {
  const res = await fetch(`${BASE_URL}/api/warranty/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ─── USER: PROFILE & ORDERS ──────────────────────────────────────────────────
export async function fetchMyOrders(token) {
  const res = await fetch(`${BASE_URL}/api/orders/my`, { headers: authHeader(token) });
  return res.json();
}

export async function changePassword(currentPassword, newPassword, token) {
  const res = await fetch(`${BASE_URL}/api/users/change-password`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return res.json();
}

export async function updateProfile(data, token) {
  const res = await fetch(`${BASE_URL}/api/users/profile`, {
    method: 'PUT',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ─── CHECKOUT: ADDRESS & ORDER ────────────────────────────────────────────────
export async function fetchAddressesAPI(token) {
  const res = await fetch(`${BASE_URL}/api/addresses`, { headers: authHeader(token) });
  return res.json();
}

export async function saveAddressAPI(data, token) {
  const res = await fetch(`${BASE_URL}/api/addresses`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function placeOrderAPI(data, token) {
  const res = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ─── CONTACT FORM ────────────────────────────────────────────────────────────
export async function submitContact(data) {
  const res = await fetch(`${BASE_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export default api;
