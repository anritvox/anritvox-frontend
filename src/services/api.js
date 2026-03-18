export const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

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

/**
 * Fetches active banners for the public website.
 * FIXED: Points to /api/banners which is the correct public route.
 */
export async function fetchActiveBanners() {
  const res = await fetch(`${BASE_URL}/api/banners`);
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

/**
 * Uses FormData for file uploads (images)
 */
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

/**
 * Fetches ALL banners for admin dashboard.
 */
export async function fetchBannersAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/banners/admin/all`, { 
    headers: authHeader(token) 
  });
  if (!res.ok) throw new Error('Failed to load banners');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.banners || data.data || []);
}

/**
 * FIXED: Pass token first, uses JSON stringify for URL-based uploads.
 */
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

/**
 * FIXED: Pass token first, id second.
 */
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

/**
 * FIXED: Pass token first.
 */
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
