// Universal API helper for authenticated requests
const BASE_URL = 'https://joyboryangi.pythonanywhere.com';

export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Always use absolute URL
  const fullUrl = url.startsWith('http') ? url : BASE_URL + url;
  const res = await fetch(fullUrl, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw data?.detail || data?.message || 'API xatolik';
  }
  return data;
}

export function get(url: string) {
  return apiFetch(url, { method: 'GET' });
}
export function post(url: string, body?: Record<string, unknown>) {
  return apiFetch(url, { method: 'POST', body: JSON.stringify(body) });
}
export function put(url: string, body?: Record<string, unknown>) {
  return apiFetch(url, { method: 'PUT', body: JSON.stringify(body) });
}
export function del(url: string) {
  return apiFetch(url, { method: 'DELETE' });
} 