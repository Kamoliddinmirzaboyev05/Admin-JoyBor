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
  
  // Leaders
  getLeaders: () => get('/leaders/'),
  createLeader: (data: {
    floor: number;
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  }) => post('/leaders/', data),
  
  // Attendance Sessions
  getAttendanceSessions: (params?: {
    date?: string;
    floor?: number;
    page?: number;
    page_size?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.append('date', params.date);
    if (params?.floor) searchParams.append('floor', params.floor.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString());
    
    const queryString = searchParams.toString();
    return get(`/attendance-sessions/${queryString ? `?${queryString}` : ''}`);
  },
  
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
    try {
      // Ikkita turdagi bildirishnomalarni olish
      const [generalNotifications, applicationNotifications] = await Promise.all([
        get('/notifications/my/').catch(() => []),
        get('/application_notifications/').catch(() => [])
      ]);

      const allNotifications = [];

      // Umumiy bildirishnomalar
      if (Array.isArray(generalNotifications)) {
        const mappedGeneral = generalNotifications.map((item: any) => ({
          id: item.id, // User notification ID
          notification_id: item.notification?.id, // Original notification ID - o'qilgan qilish uchun
          title: item.notification?.title || 'Bildirishnoma',
          message: item.notification?.message || '',
          type: (item.notification?.type || 'info') as 'info' | 'success' | 'warning' | 'error',
          read: item.is_read,
          is_read: item.is_read,
          created_at: item.notification?.created_at || item.received_at,
          received_at: item.received_at,
          image: item.notification?.image,
          image_url: item.notification?.image_url,
          target_type: item.notification?.target_type,
          target_user: item.notification?.target_user,
          is_active: item.notification?.is_active,
          category: 'general',
          notification_type: 'general' as const
        }));
        allNotifications.push(...mappedGeneral);
      }

      // Ariza bildirishnomalar
      if (Array.isArray(applicationNotifications)) {
        const mappedApplications = applicationNotifications.map((item: any) => ({
          id: item.id,
          notification_id: item.id, // Ariza bildirishnomalar uchun id bir xil
          title: 'Yangi ariza',
          message: item.message || '',
          type: 'info' as const,
          read: item.is_read,
          is_read: item.is_read,
          created_at: item.created_at,
          received_at: item.created_at,
          image: undefined,
          image_url: undefined,
          target_type: 'application',
          target_user: item.user,
          is_active: true,
          category: 'application',
          notification_type: 'application' as const
        }));
        allNotifications.push(...mappedApplications);
      }

      // Vaqt bo'yicha saralash (eng yangi tepada)
      return allNotifications.sort((a, b) => {
        const aDate = new Date(a.received_at || a.created_at).getTime();
        const bDate = new Date(b.received_at || b.created_at).getTime();
        return bDate - aDate;
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      return [];
    }
  },
  markNotificationAsRead: async (id: number) => {
    try {
      console.log('Trying to mark notification as read with ID:', id);
      
      // Birinchi urinish: POST endpoint
      try {
        console.log('Trying POST /notifications/mark-read/ with notification_id:', id);
        return await post('/notifications/mark-read/', { notification_id: id });
      } catch (e1: any) {
        console.log('POST endpoint failed:', e1.message, 'trying PATCH...');
        
        // Ikkinchi urinish: PATCH endpoint
        try {
          console.log('Trying PATCH /notifications/' + id + '/');
          return await patch(`/notifications/${id}/`, { is_read: true });
        } catch (e2: any) {
          console.log('PATCH endpoint failed:', e2.message, 'trying PUT...');
          
          // Uchinchi urinish: PUT endpoint
          try {
            console.log('Trying PUT /notifications/' + id + '/');
            return await put(`/notifications/${id}/`, { is_read: true });
          } catch (e3: any) {
            console.log('PUT endpoint failed:', e3.message, 'trying application notifications...');
            
            // To'rtinchi urinish: Application notifications endpoint
            try {
              console.log('Trying PATCH /application_notifications/' + id + '/');
              return await patch(`/application_notifications/${id}/`, { is_read: true });
            } catch (e4: any) {
              console.log('Application notifications failed:', e4.message, 'trying alternative endpoints...');
              
              // Beshinchi urinish: Alternative endpoints
              try {
                console.log('Trying POST /notifications/mark-as-read/');
                return await post('/notifications/mark-as-read/', { notification_id: id });
              } catch (e5: any) {
                try {
                  console.log('Trying POST /notifications/read/');
                  return await post('/notifications/read/', { notification_id: id });
                } catch (e6: any) {
                  try {
                    console.log('Trying PATCH /notifications/mark-read/' + id + '/');
                    return await patch(`/notifications/mark-read/${id}/`, { is_read: true });
                  } catch (e7: any) {
                    try {
                      console.log('Trying POST /notifications/mark-read/ with different body');
                      return await post('/notifications/mark-read/', { id: id });
                    } catch (e8: any) {
                      try {
                        console.log('Trying POST /notifications/mark-read/ with different body 2');
                        return await post('/notifications/mark-read/', { notification: id });
                      } catch (e9: any) {
                        console.error('All endpoints failed:', { 
                          e1: e1.message, 
                          e2: e2.message, 
                          e3: e3.message, 
                          e4: e4.message,
                          e5: e5.message,
                          e6: e6.message,
                          e7: e7.message,
                          e8: e8.message,
                          e9: e9.message
                        });
                        throw new Error('Barcha endpointlar ishlamayapti');
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  },

  // Ariza bildirishnomalari uchun maxsus funksiyalar
  markApplicationNotificationAsRead: async (id: number) => {
    try {
      console.log('Marking application notification as read with ID:', id);
      return await post('/application_notifications/mark-read/', { notification_id: id });
    } catch (error: any) {
      console.error('Mark application notification as read error:', error);
      throw error;
    }
  },

  markAllApplicationNotificationsAsRead: async () => {
    try {
      console.log('Marking all application notifications as read');
      return await post('/application_notifications/mark-all-read/', {});
    } catch (error: any) {
      console.error('Mark all application notifications as read error:', error);
      throw error;
    }
  },
  
  // Amenities
  getAmenities: () => get('/amenities/'),
  updateAmenity: (id: number, data: { name: string; is_active: boolean }) => patch(`/amenities/${id}/update/`, data),
}; 