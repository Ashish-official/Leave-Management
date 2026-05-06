const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

const getToken = () => localStorage.getItem('leaveToken');

const request = async (path, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  const data = contentType?.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.message || 'Something went wrong');
  }

  return data;
};

export const authApi = {
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/auth/me'),
};

export const leaveApi = {
  apply: (payload) => request('/leaves/apply', { method: 'POST', body: JSON.stringify(payload) }),
  mine: () => request('/leaves/my-leaves'),
  balance: () => request('/leaves/balance'),
  cancel: (id) => request(`/leaves/${id}/cancel`, { method: 'PUT' }),
  all: () => request('/leaves'),
  updateStatus: (id, payload) => request(`/leaves/${id}/status`, { method: 'PUT', body: JSON.stringify(payload) }),
};

export const adminApi = {
  dashboard: () => request('/admin/dashboard'),
  users: () => request('/users'),
  createUser: (payload) => request('/users', { method: 'POST', body: JSON.stringify(payload) }),
  updateUser: (id, payload) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deactivateUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};
