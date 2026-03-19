import axios from 'axios';

// 1. Environment Configuration
export const BASE_URL = import.meta.env.MODE === 'development'
  ? 'http://localhost:5000'
  : (import.meta.env.VITE_BASE_URL || 'https://service.anritvox.com');

const API_BASE_URL = `${BASE_URL}/api`;

// 2. Axios Instance (Used for complex requests or interceptors)
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Helper for Fetch-based calls
function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── ADMIN: PRODUCT MANAGEMENT (Fixed Argument Order) ───────────────────────

/**
 * Matches ProductManagement.jsx: createProduct(formData, token)
 */
export async function createProduct(formData, token) {
  const res = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: authHeader(token),
    body: formData, // FormData handles its own Content-Type
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create product');
  return data;
}

/**
 * Matches ProductManagement.jsx: updateProduct(id, formData, token)
 */
export async function updateProduct(id, formData, token) {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: authHeader(token),
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update product');
  return data;
}

export async function deleteProduct(id, token) {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete product');
  return data;
}

// ─── ADMIN: SERIAL MANAGEMENT (Fixed Argument Order) ─────────────────────────

export async function fetchProductSerials(productId, token) {
  const res = await fetch(`${BASE_URL}/api/admin/products/${productId}/serials`, {
    headers: authHeader(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch serials');
  return data;
}

export async function updateProductSerial(serialId, newSerial, token, productId) {
  const res = await fetch(`${BASE_URL}/api/serials/${serialId}`, {
    method: 'PUT',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, serial: newSerial }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update serial');
  return data;
}

// ─── CATEGORIES & SUB-CATEGORIES ───────────────────────────────────────────

export async function fetchCategories() {
  const res = await fetch(`${BASE_URL}/api/categories`);
  const data = await res.json();
  if (!res.ok) throw new Error('Failed to load categories');
  return Array.isArray(data) ? data : (data.categories || data.data || []);
}

export async function fetchSubcategories(categoryId) {
  const url = categoryId 
    ? `${BASE_URL}/api/categories/${categoryId}/subcategories`
    : `${BASE_URL}/api/categories/all/subcategories`;
    
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error('Failed to load subcategories');
  return Array.isArray(data) ? data : (data.subcategories || data.data || []);
}

// ─── PUBLIC: PRODUCTS ───────────────────────────────────────────────────────

export async function fetchProducts() {
  const res = await fetch(`${BASE_URL}/api/products`);
  const data = await res.json();
  if (!res.ok) throw new Error('Failed to load products');
  return Array.isArray(data) ? data : (data.products || data.data || []);
}

export async function fetchProductById(id) {
  const res = await fetch(`${BASE_URL}/api/products/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error('Failed to load product details');
  return data.product || data.data || data;
}

// ─── ADMIN: GENERAL ─────────────────────────────────────────────────────────

export async function fetchProductsAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/products`, { headers: authHeader(token) });
  const data = await res.json();
  if (!res.ok) throw new Error('Failed to load admin products');
  return Array.isArray(data) ? data : (data.products || data.data || []);
}

export default api;
