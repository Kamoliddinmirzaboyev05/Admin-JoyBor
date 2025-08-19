// Universal API helper for authenticated requests
export const BASE_URL = 'https://joyboryangi.pythonanywhere.com';

export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = sessionStorage.getItem('access');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Always use absolute URL
  const fullUrl = url.startsWith('http') ? url : BASE_URL + url;
  
  try {
    const res = await fetch(fullUrl, { ...options, headers });
    
    // Handle 403 Forbidden specifically
    if (res.status === 403) {
      // 403 Forbidden - User may not have permission
      // Return empty data instead of throwing error for 403
      return {};
    }
    
    // Handle 401 Unauthorized - redirect to login
    if (res.status === 401) {
      sessionStorage.removeItem('access');
      sessionStorage.removeItem('isAuth');
      window.location.href = '/login';
      return {};
    }
    
    const data = await res.json().catch(() => ({}));
    
    if (!res.ok) {
      const error = new Error(data?.detail || data?.message || `HTTP ${res.status}: ${res.statusText}`);
      (error as any).response = { data, status: res.status, statusText: res.statusText };
      throw error;
    }
    
    return data;
  } catch (error) {
    // Network errors or other fetch errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // Network error logged
      throw new Error('Tarmoq xatoligi. Internetga ulanishingizni tekshiring.');
    }
    throw error;
  }
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
  
  // Provinces and Districts
  getProvinces: () => get('/provinces/'),
  getDistricts: (provinceId?: number) => get(`/districts/${provinceId ? `?province=${provinceId}` : ''}`),
  
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
  patchMyDormitory: (data: any) => {
    // Handle FormData differently from regular objects
    if (data instanceof FormData) {
      const token = sessionStorage.getItem('access');
      return fetch(`${BASE_URL}/my-dormitory-update/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      }).then(async (res) => {
        const responseData = await res.json().catch(() => ({}));
        if (!res.ok) {
          const error = new Error(responseData?.detail || responseData?.message || 'API xatolik');
          (error as any).response = { data: responseData, status: res.status, statusText: res.statusText };
          throw error;
        }
        return responseData;
      });
    }
    return patch('/my-dormitory-update/', data);
  },

  // Dashboard
  getDashboard: () => get('/dashboard/'),
  // Admin Profile (updated to use absolute URL)
  getAdminProfile: () => get('https://joyboryangi.pythonanywhere.com/profile/'),
  updateAdminProfile: (data: {
    username?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    bio?: string;
    phone?: string;
    birth_date?: string;
    address?: string;
    telegram?: string;
    password?: string;
  } | FormData) => {
    // Handle FormData differently from regular objects
    if (data instanceof FormData) {
      const token = sessionStorage.getItem('access');
      return fetch(`https://joyboryangi.pythonanywhere.com/profile/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      }).then(async (res) => {
        const responseData = await res.json().catch(() => ({}));
        if (!res.ok) {
          const error = new Error(responseData?.detail || responseData?.message || 'API xatolik');
          (error as any).response = { data: responseData, status: res.status, statusText: res.statusText };
          throw error;
        }
        return responseData;
      });
    }
    return patch('https://joyboryangi.pythonanywhere.com/profile/', data);
  },
  
  // Rules
  getRules: () => get('/rules/'),
  createRule: (data: { rule: string }) => post('/rules/', data),
  updateRule: (id: number, data: { rule: string }) => put(`/rules/${id}/`, data),
  deleteRule: (id: number) => del(`/rules/${id}/`),
  
  // Notifications
  getNotifications: async () => {
    const res: any = await get('/notifications/');
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.results)) return res.results;
    if (Array.isArray(res?.notifications)) return res.notifications;
    return [];
  },
  markNotificationAsRead: async (id: number) => {
    try {
      return await patch(`/notification/${id}/read/`, { is_read: true });
    } catch (e: any) {
      // Try plural fallback
      return await patch(`/notifications/${id}/read/`, { is_read: true });
    }
  },
  
  // Amenities
  getAmenities: () => get('/amenities/'),
  updateAmenity: (id: number, data: { name: string; is_active: boolean }) => patch(`/amenities/${id}/update/`, data),
}; 