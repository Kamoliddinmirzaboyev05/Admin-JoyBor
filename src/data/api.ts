// Universal API helper for authenticated requests
export const BASE_URL = 'https://joyboryangi.pythonanywhere.com';

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
    const error = new Error(data?.detail || data?.message || 'API xatolik');
    (error as any).response = { data, status: res.status, statusText: res.statusText };
    throw error;
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
export function patch(url: string, body?: Record<string, unknown>) {
  return apiFetch(url, { method: 'PATCH', body: JSON.stringify(body) });
}

// React Query uchun API funksiyalar
export const apiQueries = {
  // Students
  getStudents: () => get('/students/'),
  
  // Rooms
  getFloors: () => get('/floors/'),
  getAvailableFloors: () => get('/available-floors/'),
  getRooms: (floorId?: number) => get(`/rooms/${floorId ? `?floor=${floorId}` : ''}`),
  getAvailableRooms: (floorId?: number) => get(`/available-rooms/${floorId ? `?floor=${floorId}` : ''}`),
  
  // Payments
  getPayments: () => get('/payments/'),
  createPayment: (data: Record<string, unknown>) => post('/payment/create/', data),
  
  // Applications
  getApplications: () => get('/applications/'),
  
  // Student Profile
  getStudentProfile: (id: string) => get(`/students/${id}/`),
  updateStudent: (id: string, data: Record<string, unknown>) => patch(`/students/${id}/`, data),

  // Settings (dormitory info)
  getSettings: () => get('/my-dormitory/'),
  updateSettings: (data: any) => patch('/my-dormitory/', data),
  patchMyDormitory: (data: any) => patch('/my-dormitory-update/', data),

  // Dashboard
  getDashboard: () => get('/dashboard/'),
  // Admin Profile (updated to use absolute URL)
  getAdminProfile: () => get('https://joyboryangi.pythonanywhere.com/profile/'),
}; 