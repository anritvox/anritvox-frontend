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
export async function adminLogin(credentials) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials), // Now it properly stringifies the object
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
  // 🔴 FIX: Changed endpoint from /api/orders/my-orders to /api/orders/my
  const res = await fetch(`${BASE_URL}/api/orders/my`, {
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

// ─── Aliases & Missing Functions ───────────────────────────────────────────

// Aliases for DashboardOverview
export const fetchWarrantyAdmin = fetchWarrantiesAdmin;
export const fetchCategories = fetchCategoriesAdmin;
export const fetchAdminUsers = fetchUsersAdmin;
export const fetchAdminOrders = fetchOrdersAdmin;

// ─── Admin: Category Update ─────────────────────────────────────────────────
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

// ─── Admin: Subcategories ────────────────────────────────────────────────────
export async function fetchSubcategories(token) {
  const res = await fetch(`${BASE_URL}/api/subcategories`, {
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error('Failed to load subcategories');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.subcategories || data.data || []);
}
export async function createSubcategory(token, data) {
  const res = await fetch(`${BASE_URL}/api/subcategories`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to create subcategory');
  return body;
}
export async function updateSubcategory(token, id, data) {
  const res = await fetch(`${BASE_URL}/api/subcategories/${id}`, {
    method: 'PUT',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to update subcategory');
  return body;
}
export async function deleteSubcategory(token, id) {
  const res = await fetch(`${BASE_URL}/api/subcategories/${id}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to delete subcategory');
  return body;
}

// ─── Admin: Warranty Management ──────────────────────────────────────────────
export async function updateWarrantyStatusAdmin(token, id, status) {
  const res = await fetch(`${BASE_URL}/api/warranty/${id}/status`, {
    method: 'PUT',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to update warranty status');
  return body;
}
export async function deleteWarrantyAdmin(token, id) {
  const res = await fetch(`${BASE_URL}/api/warranty/${id}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to delete warranty');
  return body;
}

// ─── Admin: Product Serials ──────────────────────────────────────────────────
export async function fetchProductSerials(token, productId) {
  const res = await fetch(`${BASE_URL}/api/products/${productId}/serials`, {
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error('Failed to load product serials');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.serials || data.data || []);
}
export async function addProductSerials(token, productId, serials) {
  const res = await fetch(`${BASE_URL}/api/products/${productId}/serials`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ serials }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to add serials');
  return body;
}
export async function bulkAddProductSerials(token, data) {
  const res = await fetch(`${BASE_URL}/api/products/serials/bulk`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to bulk add serials');
  return body;
}
export async function updateProductSerial(token, id, data) {
  const res = await fetch(`${BASE_URL}/api/serials/${id}`, {
    method: 'PUT',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to update serial');
  return body;
}
export async function deleteProductSerial(token, id) {
  const res = await fetch(`${BASE_URL}/api/serials/${id}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to delete serial');
  return body;
}
export async function checkSerialAvailability(serial) {
  const res = await fetch(`${BASE_URL}/api/serials/check/${serial}`);
  if (!res.ok) throw new Error('Failed to check serial availability');
  return res.json();
}


// ─── Admin: Banner Aliases & Update ────────────────────────────────────────
export const createBannerAdmin = createBanner;
export const deleteBannerAdmin = deleteBanner;
export async function updateBannerAdmin(token, id, formData) {
  const res = await fetch(`${BASE_URL}/api/banners/${id}`, {
    method: 'PUT',
    headers: authHeader(token),
    body: formData,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to update banner');
  return body;
}

// ─── Admin: Password Change Alias ───────────────────────────────────────
export async function changeAdminPassword(currentPassword, newPassword, token) {
  return changePassword(token, currentPassword, newPassword);
}
// ─── Customer: Cart Management ───────────────────────────────────────────────
export async function fetchCart(token) {
  const res = await fetch(`${BASE_URL}/api/cart`, {
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error('Failed to load cart');
  return res.json();
}

export async function addToCartAPI(token, productId, quantity) {
  const res = await fetch(`${BASE_URL}/api/cart`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity }),
  });
  if (!res.ok) throw new Error('Failed to update cart');
  return res.json();
}

export async function removeFromCartAPI(token, productId) {
  const res = await fetch(`${BASE_URL}/api/cart/${productId}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error('Failed to remove from cart');
  return res.json();
}

export async function clearCartAPI(token) {
  const res = await fetch(`${BASE_URL}/api/cart`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error('Failed to clear cart');
  return res.json();
}
export async function fetchAllSerialRecords(token) {
  const res = await fetch(`${BASE_URL}/api/serials/all`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to load serial records');
  return res.json();
}
// Add or update these functions in src/services/api.js

export const checkSerialAvailability = async (serial) => {
  // Use the new unified validation route
  const response = await fetch(`${API_URL}/api/warranty/validate/${serial}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Invalid Serial Number');
  }
  return response.json();
};

export const registerWarranty = async (data) => {
  const response = await fetch(`${API_URL}/api/warranty/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data), // Sends { serialNumber, productId, customerName, email, phone, purchaseDate, invoiceNumber }
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }
  return response.json();
};
