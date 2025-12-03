// Universal API helper for authenticated requests
export const BASE_URL = 'https://joyborv1.pythonanywhere.com/api';
export const link = 'https://joyborv1.pythonanywhere.com/api';

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
      const error = new Error(data?.detail || data?.message || `HTTP ${res.status}: ${res.statusText}`) as Error & { response?: { data: unknown; status: number; statusText: string } };
      error.response = { data, status: res.status, statusText: res.statusText };
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

// Generic API methods
export const get = (url: string) => apiFetch(url, { method: 'GET' });
export const post = (url: string, data?: unknown) => apiFetch(url, {
  method: 'POST',
  body: data ? JSON.stringify(data) : undefined,
});
export const put = (url: string, data?: unknown) => apiFetch(url, {
  method: 'PUT',
  body: data ? JSON.stringify(data) : undefined,
});
export const patch = (url: string, data?: unknown) => apiFetch(url, {
  method: 'PATCH',
  body: data ? JSON.stringify(data) : undefined,
});
export const del = (url: string) => apiFetch(url, { method: 'DELETE' });

// API endpoints
export const api = {
  // Auth
  login: (data: { username: string; password: string }) => post('/auth/login/', data),
  logout: () => post('/auth/logout/'),
  refreshToken: (refresh: string) => post('/auth/refresh/', { refresh }),
  
  // Profile
  getProfile: () => get('/profile/'),
  updateProfile: (data: Record<string, unknown>) => patch('/profile/', data),
  
  // Students
  getStudents: (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    floor?: number;
    room?: number;
    faculty?: string;
    course?: number;
    group?: string;
    status?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.floor) searchParams.append('floor', params.floor.toString());
    if (params?.room) searchParams.append('room', params.room.toString());
    if (params?.faculty) searchParams.append('faculty', params.faculty);
    if (params?.course) searchParams.append('course', params.course.toString());
    if (params?.group) searchParams.append('group', params.group);
    if (params?.status) searchParams.append('status', params.status);
    
    const queryString = searchParams.toString();
    return get(`/students/${queryString ? `?${queryString}` : ''}`);
  },
  
  createStudent: (data: Record<string, unknown>) => post('/student/create/', data),
  updateStudent: (id: number, data: Record<string, unknown>) => patch(`/students/${id}/`, data),
  deleteStudent: (id: number) => del(`/students/${id}/`),
  
  // Floors and Rooms
  getFloors: () => get('/floors/'),
  getRooms: (floorId?: number) => get(`/rooms/${floorId ? `?floor=${floorId}` : ''}`),
  getAvailableRooms: (floorId: number) => get(`/available-rooms/?floor=${floorId}`),
  
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
  
  createAttendanceSession: (data: {
    floor: number;
    date: string;
    students: Array<{
      student_id: number;
      is_present: boolean;
      reason?: string;
    }>;
  }) => post('/attendance-sessions/', data),
  
  updateAttendanceSession: (id: number, data: Record<string, unknown>) => patch(`/attendance-sessions/${id}/`, data),
  deleteAttendanceSession: (id: number) => del(`/attendance-sessions/${id}/`),
  
  // Reports
  getReports: (params?: {
    start_date?: string;
    end_date?: string;
    floor?: number;
    type?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);
    if (params?.floor) searchParams.append('floor', params.floor.toString());
    if (params?.type) searchParams.append('type', params.type);
    
    const queryString = searchParams.toString();
    return get(`/reports/${queryString ? `?${queryString}` : ''}`);
  },
  
  // Settings
  getSettings: () => get('/settings/'),
  updateSettings: (data: Record<string, unknown>) => patch('/settings/', data),
  
  // Dashboard
  getDashboard: () => get('/dashboard/'),
  
  // Additional Notification Methods
  markApplicationNotificationAsRead: (id: number) => patch(`/notifications/${id}/`, { is_read: true }),
  markAllApplicationNotificationsAsRead: () => post('/notifications/mark-all-read/', {}),
  
  // Dormitory Management
  patchMyDormitory: (data: Record<string, unknown>) => patch('/dormitory/', data),
  
  // Amenities Management
  getAmenities: () => get('/amenities/'),
  createAmenity: (data: { name: string; is_active: boolean }) => post('/amenities/', data),
  updateAmenity: (id: number, data: { name: string; is_active: boolean }) => patch(`/amenities/${id}/`, data),
  deleteAmenity: (id: number) => del(`/amenities/${id}/`),
  
  // Rules Management
  getRules: () => get('/rules/'),
  createRule: (data: { rule: string }) => post('/rules/', data),
  updateRule: (id: number, data: { rule: string }) => patch(`/rules/${id}/`, data),
  deleteRule: (id: number) => del(`/rules/${id}/`),
  
  // Dormitory Images
  getDormitoryImages: () => get('/dormitory_images/'),
  uploadDormitoryImage: (data: FormData) => {
    const token = sessionStorage.getItem('access');
    return fetch(`${BASE_URL}/dormitory_image_create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: data,
    }).then(res => res.json());
  },
  deleteDormitoryImage: (id: number) => del(`/dormitory_images/${id}/`),
  
  // Notifications - Fixed endpoint
  getNotifications: async () => {
    try {
      // Ikkita turdagi bildirishnomalarni olish
      const [generalNotifications, applicationNotifications] = await Promise.all([
        get('/notifications/my/').catch(() => []),
        get('/notifications/').catch(() => []) // Fixed: removed application_notifications endpoint
      ]);

      const allNotifications = [];

      // Umumiy bildirishnomalar
      if (Array.isArray(generalNotifications)) {
        const mappedGeneral = generalNotifications.map((item: Record<string, unknown>) => {
          const notification = item.notification as Record<string, unknown> | undefined;
          return {
            id: item.id as number,
            notification_id: notification?.id as number,
            title: (notification?.title as string) || 'Bildirishnoma',
            message: (notification?.message as string) || '',
            type: (notification?.type as string) || 'info',
            is_read: (item.is_read as boolean) || false,
            created_at: (item.created_at as string) || (notification?.created_at as string),
            category: 'general'
          };
        });
        allNotifications.push(...mappedGeneral);
      }

      // Ariza bildirishnomalari
      if (Array.isArray(applicationNotifications)) {
        const mappedApplication = applicationNotifications.map((item: Record<string, unknown>) => ({
          id: item.id as number,
          notification_id: item.id as number,
          title: (item.title as string) || 'Ariza bildirishnomasi',
          message: (item.message as string) || '',
          type: (item.type as string) || 'application',
          is_read: (item.is_read as boolean) || false,
          created_at: item.created_at as string,
          category: 'application'
        }));
        allNotifications.push(...mappedApplication);
      }

      // Vaqt bo'yicha saralash (eng yangi birinchi)
      return allNotifications.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('Notifications fetch error:', error);
      return [];
    }
  },
  
  markNotificationAsRead: async (id: number) => {
    try {
      console.log('Trying PATCH /notifications/' + id + '/');
      return await patch(`/notifications/${id}/`, { is_read: true });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      // Fallback to alternative endpoint
      try {
        return await post('/notifications/mark-read/', { notification_id: id });
      } catch (fallbackError) {
        console.error('Fallback mark as read error:', fallbackError);
        throw fallbackError;
      }
    }
  },
  
  markAllNotificationsAsRead: async () => {
    try {
      return await post('/notifications/mark-all-read/', {});
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      throw error;
    }
  },
  
  // Export functions
  exportStudents: () => {
    const token = sessionStorage.getItem('access');
    return fetch(`${BASE_URL}/export-student/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
  
  exportPayments: () => {
    const token = sessionStorage.getItem('access');
    return fetch(`${BASE_URL}/export-payment/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
  
  // Admin profile endpoints
  getAdminProfile: () => get(`${BASE_URL}/profile/`),
  
  updateAdminProfile: async (data: unknown) => {
    const token = sessionStorage.getItem('access');
    if (!token) {
      throw new Error('Avtorizatsiya talab qilinadi');
    }
    
    return fetch(`${BASE_URL}/profile/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(res => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json();
    });
  }
};

export default api;
