const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = 'admin_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const assetUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path, API_URL).origin + path;
};

async function request(path, { method = 'GET', body, auth = false, isForm = false } = {}) {
  const headers = {};
  if (body && !isForm) headers['Content-Type'] = 'application/json';
  if (auth) headers.Authorization = `Bearer ${getToken()}`;

  const res = await fetch(API_URL + path, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  if (res.status === 401 && auth) clearToken();
  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Error de red');
    err.status = res.status;
    throw err;
  }
  return data;
}

const qs = (params) => {
  const p = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
  return p.toString() ? `?${p}` : '';
};

export const api = {
  getProducts: (params = {}) => request(`/products${qs(params)}`),
  getProduct: (id) => request(`/products/${id}`),
  getRelated: (id, limit = 8) => request(`/products/${id}/related?limit=${limit}`),
  getCategories: () => request('/categories'),

  login: (email, password) => request('/admin/auth/login', { method: 'POST', body: { email, password } }),
  admin: {
    products: () => request('/admin/products', { auth: true }),
    createProduct: (body) => request('/admin/products', { method: 'POST', body, auth: true }),
    updateProduct: (id, body) => request(`/admin/products/${id}`, { method: 'PUT', body, auth: true }),
    deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE', auth: true }),
    createCategory: (name) => request('/admin/categories', { method: 'POST', body: { name }, auth: true }),
    updateCategory: (id, name) => request(`/admin/categories/${id}`, { method: 'PUT', body: { name }, auth: true }),
    deleteCategory: (id) => request(`/admin/categories/${id}`, { method: 'DELETE', auth: true }),
    upload: (files) => {
      const form = new FormData();
      files.forEach((f) => form.append('images', f));
      return request('/admin/upload', { method: 'POST', body: form, auth: true, isForm: true });
    },
  },
};

