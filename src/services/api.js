export const BASE_URL = import.meta.env.VITE_BASE_URL;

// Helper: attach authorization header
function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

// ─── Public: Products ───────────────────────────────────────────────────────
export async function fetchProducts() {
  const res = await fetch(`${BASE_URL}/api/products`);
  if (!res.ok) throw new Error('Failed to load products');
  const data = await res.json();
  // backend returns array directly or { products: [] }
  return Array.isArray(data) ? data : (data.products || data.data || []);
}

export async function fetchProductById(id) {
  const res = await fetch(`${BASE_URL}/api/products/${id}`);
  if (!res.ok) throw new Error('Failed to load product');
  const data = await res.json();
  // backend may return product directly or wrapped
  return data.product || data.data || data;
}

// ─── Warranty ────────────────────────────────────────────────────────────────
export async function validateSerial(serial) {
  const res = await fetch(`${BASE_URL}/api/warranty/validate/${serial}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Validation failed');
  return body;
}

export async function registerWarranty(data) {
  const res = await fetch(`${BASE_URL}/api/warranty/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Registration failed');
  return body;
}

// ─── Public: Contact ─────────────────────────────────────────────────────────
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

// ─── Admin: Authentication ───────────────────────────────────────────────────
export async function adminLogin(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Login failed');
  return body;
}

// ─── Admin: Products ─────────────────────────────────────────────────────────
export async function fetchProductsAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/products`, {
    headers: authHeader(token),
  });
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

// ─── Admin: Orders ───────────────────────────────────────────────────────────
export async function fetchOrdersAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/orders`, {
    headers: authHeader(token),
  });
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

// ─── Admin: Users ────────────────────────────────────────────────────────────
export async function fetchUsersAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/admin/users`, {
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error('Failed to load users');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.users || data.data || []);
}

// ─── Admin: Contacts ─────────────────────────────────────────────────────────
export async function fetchContactsAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/contact`, {
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error('Failed to load contact submissions');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.contacts || data.data || []);
}

// ─── Admin: Categories ───────────────────────────────────────────────────────
export async function fetchCategoriesAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/categories`, {
    headers: authHeader(token),
  });
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

export async function deleteCategory(token, id) {
  const res = await fetch(`${BASE_URL}/api/categories/${id}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to delete category');
  return body;
}

// ─── Admin: Banners ──────────────────────────────────────────────────────────
export async function fetchActiveBanners() {
  const res = await fetch(`${BASE_URL}/api/banners/active`);
  if (!res.ok) throw new Error('Failed to load banners');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.banners || data.data || []);
}

export async function fetchBannersAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/banners`, {
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error('Failed to load banners');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.banners || data.data || []);
}

export async function createBanner(token, formData) {
  const res = await fetch(`${BASE_URL}/api/banners`, {
    method: 'POST',
    headers: authHeader(token),
    body: formData,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to create banner');
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

// ─── Customer: Orders ────────────────────────────────────────────────────────
export async function fetchMyOrders(token) {
  const res = await fetch(`${BASE_URL}/api/orders/my-orders`, {
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error('Failed to load orders');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.orders || data.data || []);
}

// ─── Customer: Profile / Change Password ─────────────────────────────────────
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

// ─── Admin: EWarranty ────────────────────────────────────────────────────────
export async function fetchWarrantiesAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/warranty`, {
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error('Failed to load warranties');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.warranties || data.data || []);
}

// ─── Admin: Analytics ────────────────────────────────────────────────────────
export async function fetchAnalytics(token) {
  const res = await fetch(`${BASE_URL}/api/analytics`, {
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error('Failed to load analytics');
  return res.json();
}

// ─── Admin: Inventory ────────────────────────────────────────────────────────
export async function fetchInventory(token) {
  const res = await fetch(`${BASE_URL}/api/inventory`, {
    headers: authHeader(token),
  });
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
