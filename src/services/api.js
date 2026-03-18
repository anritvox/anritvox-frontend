import axios from 'axios';

// This checks if Vite is in development mode.
const API_BASE_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:5000/api' 
    : 'https://service.anritvox.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Example request interceptor for attaching tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const BASE_URL = import.meta.env.MODE === 'development'
  ? 'http://localhost:5000'
    : 'https://service.anritvox.com';

/**
 * Helper: attach authorization header
 */
function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

// ─── PUBLIC: GLOBAL SETTINGS & CATEGORIES ────────────────────────────────────

export async function fetchPublicSettings() {
  const res = await fetch(`${BASE_URL}/api/settings/public`);
  if (!res.ok) throw new Error('Failed to load site settings');
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${BASE_URL}/api/categories`);
  if (!res.ok) throw new Error('Failed to load categories');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.categories || data.data || []);
}

export async function fetchActiveBanners(position = '') {
  const url = position ? `${BASE_URL}/api/banners?position=${position}` : `${BASE_URL}/api/banners`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load banners');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.banners || data.data || []);
}

// ─── PUBLIC: PRODUCTS ───────────────────────────────────────────────────────

export async function fetchProducts() {
  const res = await fetch(`${BASE_URL}/api/products`);
  if (!res.ok) throw new Error('Failed to load products');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.products || data.data || []);
}

export async function fetchProductById(id) {
  const res = await fetch(`${BASE_URL}/api/products/${id}`);
  if (!res.ok) throw new Error('Failed to load product');
  const data = await res.json();
  return data.product || data.data || data;
}

// ─── PUBLIC: CONTACT ─────────────────────────────────────────────────────────

export async function submitContact(message) {
  const res = await fetch(`${BASE_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Contact submission failed');
  return body;
}

// ─── WARRANTY REGISTRATION ──────────────────────────────────────────────────

export const checkSerialAvailability = async (serial) => {
  const response = await fetch(`${BASE_URL}/api/warranty/validate/${serial}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Invalid Serial Number');
  }
  return response.json();
};

export const registerWarranty = async (data) => {
  const response = await fetch(`${BASE_URL}/api/warranty/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }
  return response.json();
};

// ─── ADMIN: AUTHENTICATION ───────────────────────────────────────────────────

export async function adminLogin(credentials) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Login failed');
  return body;
}

// ─── ADMIN: PRODUCT MANAGEMENT ───────────────────────────────────────────────

export async function fetchProductsAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/products`, { headers: authHeader(token) });
  if (!res.ok) throw new Error('Failed to load products');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.products || data.data || []);
}

export async function createProduct(token, formData) {
  const res = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: authHeader(token),
    body: formData,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to create product');
  return body;
}

export async function updateProduct(token, id, formData) {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: authHeader(token),
    body: formData,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to update product');
  return body;
}

export async function deleteProduct(token, id) {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to delete product');
  return body;
}

// ─── ADMIN: CATEGORY MANAGEMENT ──────────────────────────────────────────────

export async function fetchCategoriesAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/categories`, { headers: authHeader(token) });
  if (!res.ok) throw new Error('Failed to load categories');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.categories || data.data || []);
}

export async function createCategory(token, data) {
  const res = await fetch(`${BASE_URL}/api/categories`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to create category');
  return body;
}

export async function updateCategory(token, id, data) {
  const res = await fetch(`${BASE_URL}/api/categories/${id}`, {
    method: 'PUT',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to update category');
  return body;
}

export async function deleteCategory(token, id) {
  const res = await fetch(`${BASE_URL}/api/categories/${id}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to delete category');
  return body;
}

// ─── ADMIN: BANNER MANAGEMENT ───────────────────────────────────────────────

export async function fetchBannersAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/banners/admin/all`, { 
    headers: authHeader(token) 
  });
  if (!res.ok) throw new Error('Failed to load banners');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.banners || data.data || []);
}

export async function createBanner(token, data) {
  const res = await fetch(`${BASE_URL}/api/banners`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to create banner');
  return body;
}

export async function updateBannerAdmin(token, id, data) {
  const res = await fetch(`${BASE_URL}/api/banners/${id}`, {
    method: 'PUT',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to update banner');
  return body;
}

export async function deleteBanner(token, id) {
  const res = await fetch(`${BASE_URL}/api/banners/${id}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to delete banner');
  return body;
}

// ─── ADMIN: ORDER MANAGEMENT ───────────────────────────────────────────────

export async function fetchOrdersAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/orders`, { headers: authHeader(token) });
  if (!res.ok) throw new Error('Failed to load orders');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.orders || data.data || []);
}

export async function updateOrderStatus(token, id, status) {
  const res = await fetch(`${BASE_URL}/api/orders/${id}/status`, {
    method: 'PUT',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to update order');
  return body;
}

// ─── ADMIN: USER & CONTACT MANAGEMENT ───────────────────────────────────────

export async function fetchUsersAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/admin/users`, { headers: authHeader(token) });
  if (!res.ok) throw new Error('Failed to load users');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.users || data.data || []);
}

export async function fetchContactsAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/contact`, { headers: authHeader(token) });
  if (!res.ok) throw new Error('Failed to load contact submissions');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.contacts || data.data || []);
}

// ─── ADMIN: ANALYTICS & INVENTORY ──────────────────────────────────────────

export async function fetchAnalytics(token) {
  const res = await fetch(`${BASE_URL}/api/analytics`, { headers: authHeader(token) });
  if (!res.ok) throw new Error('Failed to load analytics');
  return res.json();
}

export async function fetchInventory(token) {
  const res = await fetch(`${BASE_URL}/api/inventory`, { headers: authHeader(token) });
  if (!res.ok) throw new Error('Failed to load inventory');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.inventory || data.data || []);
}

export async function updateInventory(token, id, stock) {
  const res = await fetch(`${BASE_URL}/api/inventory/${id}`, {
    method: 'PUT',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ stock }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to update inventory');
  return body;
}

// ─── ADMIN: SERIAL & WARRANTY MANAGEMENT ────────────────────────────────────

export async function fetchWarrantiesAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/warranty/admin`, { headers: authHeader(token) });
  if (!res.ok) throw new Error('Failed to load warranties');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.warranties || data.data || []);
}

export async function updateWarrantyStatusAdmin(token, id, status) {
  const res = await fetch(`${BASE_URL}/api/warranty/admin/${id}`, {
    method: 'PUT',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to update warranty status');
  return body;
}

export async function bulkAddProductSerials(token, productId, count, prefix) {
  const res = await fetch(`${BASE_URL}/api/serials/generate`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, count, prefix }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to generate serials');
  return body;
}

export async function fetchAllSerialRecords(token) {
  const res = await fetch(`${BASE_URL}/api/serials/all`, { headers: authHeader(token) });
  if (!res.ok) throw new Error('Failed to load serial records');
  return res.json();
}

/**
 * INTEGRATED: Fetches serial numbers for a specific product for the Admin dashboard.
 */
export async function fetchProductSerials(token, productId) {
  const res = await fetch(`${BASE_URL}/api/admin/products/${productId}/serials`, { 
    headers: authHeader(token) 
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch serial numbers');
  }
  return res.json();
}

// ─── CUSTOMER: CART & ORDERS ───────────────────────────────────────────────

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
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to update cart');
  return body; 
}

export async function removeFromCartAPI(token, productId) {
  const res = await fetch(`${BASE_URL}/api/cart/${productId}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to remove from cart');
  return body;
}

export async function clearCartAPI(token) {
  const res = await fetch(`${BASE_URL}/api/cart`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to clear cart');
  return body;
}

export async function fetchMyOrders(token) {
  const res = await fetch(`${BASE_URL}/api/orders/my`, { headers: authHeader(token) });
  if (!res.ok) throw new Error('Failed to load orders');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.orders || data.data || []);
}

export async function placeOrderAPI(token, orderData) {
  const res = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Order failed');
  return body;
}

// ─── CUSTOMER: PROFILE & ADDRESSES ───────────────────────────────────────────

export async function fetchAddressesAPI(token) {
  const res = await fetch(`${BASE_URL}/api/addresses`, { headers: authHeader(token) });
  if (!res.ok) throw new Error('Failed to fetch addresses');
  return res.json();
}

export async function saveAddressAPI(token, addressData) {
  const res = await fetch(`${BASE_URL}/api/addresses`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(addressData),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to save address');
  return body;
}

export async function updateProfile(token, data) {
  const res = await fetch(`${BASE_URL}/api/users/profile`, {
    method: 'PUT',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to update profile');
  return body;
}

export async function changePassword(token, currentPassword, newPassword) {
  const res = await fetch(`${BASE_URL}/api/users/change-password`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to change password');
  return body;
}

// ─── ALIASES FOR BACKWARD COMPATIBILITY ─────────────────────────────────────

export const createBannerAdmin = createBanner;
export const deleteBannerAdmin = deleteBanner;
export const fetchAdminUsers = fetchUsersAdmin;
export const fetchAdminOrders = fetchOrdersAdmin;
export const fetchWarrantyAdmin = fetchWarrantiesAdmin;
export async function changeAdminPassword(currentPassword, newPassword, token) {
  return changePassword(token, currentPassword, newPassword);
}

// ——— NEW FEATURE API ENDPOINTS ———————————————————————————————

// Wishlist
export async function fetchWishlist(token) {
  const res = await fetch(`${BASE_URL}/api/wishlist`, { headers: authHeader(token) });
  if (!res.ok) throw new Error('Failed to fetch wishlist');
  return res.json();
}
export async function addToWishlist(token, productId) {
  const res = await fetch(`${BASE_URL}/api/wishlist/${productId}`, { method: 'POST', headers: authHeader(token) });
  if (!res.ok) throw new Error('Failed to add to wishlist');
  return res.json();
}
export async function removeFromWishlist(token, productId) {
  const res = await fetch(`${BASE_URL}/api/wishlist/${productId}`, { method: 'DELETE', headers: authHeader(token) });
  if (!res.ok) throw new Error('Failed to remove from wishlist');
  return res.json();
}

// Reviews
export async function fetchProductReviews(productId, page = 1) {
  const res = await fetch(`${BASE_URL}/api/reviews/product/${productId}?page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}
export async function submitReview(token, data) {
  const res = await fetch(`${BASE_URL}/api/reviews`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to submit review');
  return res.json();
}

// Order Tracking
export async function fetchOrderTracking(token, orderId) {
  const res = await fetch(`${BASE_URL}/api/orders/${orderId}/tracking`, { headers: authHeader(token) });
  if (!res.ok) throw new Error('Failed to fetch order tracking');
  return res.json();
}

// Coupons
export async function validateCoupon(token, code, orderAmount) {
  const res = await fetch(`${BASE_URL}/api/coupons/validate`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, orderAmount })
  });
  if (!res.ok) throw new Error('Invalid coupon');
  return res.json();
}
export async function fetchCouponsAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/coupons`, { headers: authHeader(token) });
  if (!res.ok) throw new Error('Failed to fetch coupons');
  return res.json();
}
export async function createCoupon(token, data) {
  const res = await fetch(`${BASE_URL}/api/coupons`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create coupon');
  return res.json();
}
export async function deleteCoupon(token, id) {
  const res = await fetch(`${BASE_URL}/api/coupons/${id}`, { method: 'DELETE', headers: authHeader(token) });
  if (!res.ok) throw new Error('Failed to delete coupon');
  return res.json();
}

// Returns
export async function fetchReturnsAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/returns`, { headers: authHeader(token) });
  if (!res.ok) throw new Error('Failed to fetch returns');
  return res.json();
}
export async function updateReturnStatus(token, id, status) {
  const res = await fetch(`${BASE_URL}/api/returns/${id}`, {
    method: 'PUT',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update return');
  return res.json();
}

// Address Book
export async function fetchAddresses(token) {
  const res = await fetch(`${BASE_URL}/api/users/addresses`, { headers: authHeader(token) });
  if (!res.ok) throw new Error('Failed to fetch addresses');
  return res.json();
}
export async function addAddress(token, data) {
  const res = await fetch(`${BASE_URL}/api/users/addresses`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to add address');
  return res.json();
}
export async function deleteAddress(token, id) {
  const res = await fetch(`${BASE_URL}/api/users/addresses/${id}`, { method: 'DELETE', headers: authHeader(token) });
  if (!res.ok) throw new Error('Failed to delete address');
  return res.json();
}

// Notifications
export async function fetchNotifications(token) {
  const res = await fetch(`${BASE_URL}/api/notifications`, { headers: authHeader(token) });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}
export async function markNotificationsRead(token) {
  const res = await fetch(`${BASE_URL}/api/notifications/read-all`, { method: 'PUT', headers: authHeader(token) });
  if (!res.ok) throw new Error('Failed to mark notifications');
  return res.json();
}

// Inventory
export async function updateProductStock(token, id, stockData) {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(stockData)
  });
  if (!res.ok) throw new Error('Failed to update stock');
  return res.json();
}
