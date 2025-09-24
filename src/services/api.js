export const BASE_URL = import.meta.env.VITE_BASE_URL;

// Helper: attach authorization header
function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

// Public: Products
export async function fetchProducts() {
  const res = await fetch(`${BASE_URL}/api/products`);
  if (!res.ok) throw new Error("Failed to load products");
  return res.json(); // images[] are full S3 URLs
}

export async function fetchProductById(id) {
  const res = await fetch(`${BASE_URL}/api/products/${id}`);
  if (!res.ok) throw new Error("Failed to load product");
  return res.json(); // images[] are full S3 URLs
}

export async function validateSerial(serial) {
  const res = await fetch(`${BASE_URL}/api/warranty/validate/${serial}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Validation failed");
  return body;
}

export async function registerWarranty(data) {
  const res = await fetch(`${BASE_URL}/api/warranty/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Registration failed");
  return body;
}

// Public: Contact
export async function submitContact(message) {
  const res = await fetch(`${BASE_URL}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Contact submission failed");
  return body;
}

export async function fetchContactsAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/contact`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load contact submissions");
  return res.json(); // expects [{ id, name, email, phone, message, created_at }, …]
}

// Admin: Authentication
export async function loginAdmin(credentials) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Login failed");
  return body; // { token }
}

// Admin: Warranty Requests
export async function fetchWarrantyAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/warranty/admin`, {
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error("Failed to load warranty requests");
  return res.json();
}

export async function updateWarrantyStatusAdmin(token, id, status) {
  const res = await fetch(`${BASE_URL}/api/warranty/admin/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",

      ...authHeader(token),
    },
    body: JSON.stringify({ status }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Update failed");
  return body;
}

export async function deleteWarrantyAdmin(token, id) {
  const res = await fetch(`${BASE_URL}/api/warranty/admin/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Deletion failed");
  }
}

// Admin: Categories CRUD
export async function fetchCategories(token) {
  const res = await fetch(`${BASE_URL}/api/categories`, {
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error("Failed to load categories");
  return res.json();
}

export async function createCategory(data, token) {
  const res = await fetch(`${BASE_URL}/api/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Create category failed");
  return body;
}

export async function updateCategory(id, data, token) {
  const res = await fetch(`${BASE_URL}/api/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Update category failed");
  return body;
}

export async function deleteCategory(id, token) {
  const res = await fetch(`${BASE_URL}/api/categories/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error("Delete category failed");
}

// Admin: Products CRUD (with image upload and serials)
export async function fetchProductsAdmin(token) {
  const res = await fetch(`${BASE_URL}/api/products`, {
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

export async function createProduct(data, token) {
  const isForm = data instanceof FormData;
  const res = await fetch(`${BASE_URL}/api/products`, {
    method: "POST",
    headers: isForm
      ? authHeader(token) // Let browser set multipart boundary
      : { "Content-Type": "application/json", ...authHeader(token) },
    body: isForm ? data : JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Create product failed");
  return body;
}

export async function updateProduct(id, data, token) {
  const isForm = data instanceof FormData;
  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: "PUT",
    headers: isForm
      ? authHeader(token)
      : { "Content-Type": "application/json", ...authHeader(token) },
    body: isForm ? data : JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Update product failed");
  return body;
}

export async function deleteProduct(id, token) {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error("Delete product failed");
}

// Admin: Serial Number Management
export async function fetchProductSerials(productId, token) {
  const res = await fetch(
    `${BASE_URL}/api/serials/products/${productId}/serials`,
    {
      headers: authHeader(token),
    }
  );
  if (!res.ok) throw new Error("Failed to load product serials");
  return res.json(); // { serials: [...], statistics: {...} }
}

export async function addProductSerials(productId, serials, token) {
  const res = await fetch(
    `${BASE_URL}/api/serials/products/${productId}/serials`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
      body: JSON.stringify({ serials }),
    }
  );
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Failed to add serials");
  return body;
}

export async function bulkAddProductSerials(productId, data, token) {
  const res = await fetch(
    `${BASE_URL}/api/serials/products/${productId}/serials/bulk`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
      body: JSON.stringify(data), // { serials: [...] } or { csvData: "..." }
    }
  );
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Bulk import failed");
  return body;
}

export async function updateProductSerial(
  productId,
  serialId,
  newSerial,
  token
) {
  const res = await fetch(
    `${BASE_URL}/api/serials/products/${productId}/serials/${serialId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
      body: JSON.stringify({ serial: newSerial }),
    }
  );
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Failed to update serial");
  return body;
}

export async function deleteProductSerial(productId, serialId, token) {
  const res = await fetch(
    `${BASE_URL}/api/serials/products/${productId}/serials/${serialId}`,
    {
      method: "DELETE",
      headers: authHeader(token),
    }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to delete serial");
  }
  return res.json();
}

export async function checkSerialAvailability(serial) {
  const res = await fetch(
    `${BASE_URL}/api/serials/check/${encodeURIComponent(serial)}`
  );
  if (!res.ok) throw new Error("Failed to check serial availability");
  return res.json(); // { available: true/false, exists: true/false, details: {...} }
}

// Admin: Subcategories CRUD
export async function fetchSubcategories(token) {
  const res = await fetch(`${BASE_URL}/api/subcategories`, {
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error("Failed to load subcategories");
  return res.json();
}

export async function createSubcategory(data, token) {
  const res = await fetch(`${BASE_URL}/api/subcategories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Create subcategory failed");
  return body;
}

export async function updateSubcategory(id, data, token) {
  const res = await fetch(`${BASE_URL}/api/subcategories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Update subcategory failed");
  return body;
}

export async function deleteSubcategory(id, token) {
  const res = await fetch(`${BASE_URL}/api/subcategories/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error("Delete subcategory failed");
}
