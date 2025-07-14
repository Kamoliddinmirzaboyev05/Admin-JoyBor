import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  room: string;
  course: number;
  faculty: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  avatar?: string;
  gender: 'male' | 'female';
}

interface Room {
  id: string;
  number: string;
  capacity: number;
  occupied: number;
  floor: number;
  status: 'available' | 'occupied' | 'maintenance' | 'full';
  type: 'single' | 'double' | 'triple' | 'quad';
}

interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  month: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentDate: string;
  transactionId?: string;
  validUntil: string;
  paymentType?: string;
}

interface Application {
  id: string;
  studentId: string;
  studentName: string;
  type: 'room_change' | 'maintenance' | 'complaint' | 'leave';
  subject: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

interface AppState {
  // Theme and UI
  isDark: boolean;
  sidebarCollapsed: boolean;
  
  // Data
  students: Student[];
  rooms: Room[];
  payments: Payment[];
  applications: Application[];
  notifications: Notification[];
  
  // Actions
  toggleTheme: () => void;
  toggleSidebar: () => void;
  
  // Student actions
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  
  // Room actions
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, room: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  
  // Payment actions
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  
  // Application actions
  updateApplication: (id: string, application: Partial<Application>) => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

// Sample data
const sampleStudents: Student[] = [
  {
    id: '1',
    firstName: 'Akmal',
    lastName: 'Karimov',
    phone: '+998901234567',
    email: 'akmal.karimov@ttu.uz',
    room: '101',
    course: 2,
    faculty: 'Kompyuter Injiniringi',
    status: 'active',
    createdAt: '2024-01-15T00:00:00Z',
    gender: 'male',
  },
  {
    id: '2',
    firstName: 'Malika',
    lastName: 'Tursunova',
    phone: '+998901234568',
    email: 'malika.tursunova@ttu.uz',
    room: '205',
    course: 3,
    faculty: 'Iqtisodiyot',
    status: 'active',
    createdAt: '2024-01-16T00:00:00Z',
    gender: 'female',
  },
  {
    id: '3',
    firstName: 'Jasur',
    lastName: 'Umarov',
    phone: '+998901234569',
    email: 'jasur.umarov@ttu.uz',
    room: '304',
    course: 1,
    faculty: 'Muhandislik',
    status: 'suspended',
    createdAt: '2024-01-17T00:00:00Z',
    gender: 'male',
  },
];

const sampleRooms: Room[] = [
  { id: '1', number: '101', capacity: 2, occupied: 2, floor: 1, status: 'full', type: 'double' },
  { id: '2', number: '102', capacity: 2, occupied: 1, floor: 1, status: 'available', type: 'double' },
  { id: '3', number: '205', capacity: 3, occupied: 3, floor: 2, status: 'full', type: 'triple' },
  { id: '4', number: '304', capacity: 4, occupied: 1, floor: 3, status: 'available', type: 'quad' },
  { id: '5', number: '305', capacity: 2, occupied: 0, floor: 3, status: 'maintenance', type: 'double' },
];

const samplePayments: Payment[] = [
  {
    id: '1',
    studentId: '1',
    studentName: 'Akmal Karimov',
    amount: 850000,
    month: '2024-12',
    status: 'paid',
    paymentDate: '2024-12-01T00:00:00Z',
    transactionId: 'TXN001',
    validUntil: '2025-12-01',
    paymentType: 'cash',
  },
  {
    id: '2',
    studentId: '2',
    studentName: 'Malika Tursunova',
    amount: 850000,
    month: '2024-12',
    status: 'pending',
    paymentDate: '2024-12-15T00:00:00Z',
    validUntil: '2025-12-15',
    paymentType: 'online',
  },
  {
    id: '3',
    studentId: '3',
    studentName: 'Jasur Umarov',
    amount: 850000,
    month: '2024-11',
    status: 'overdue',
    paymentDate: '2024-11-30T00:00:00Z',
    validUntil: '2024-12-30',
    paymentType: 'cash',
  },
];

const sampleApplications: Application[] = [
  {
    id: '1',
    studentId: '1',
    studentName: 'Akmal Karimov',
    type: 'room_change',
    subject: 'Xonani almashtirish so\'rovi',
    description: 'Hozirgi xonadoshim bilan kelishmovchiliklar tufayli boshqa xonaga o\'tishni iltimos qilaman.',
    status: 'pending',
    priority: 'medium',
    createdAt: '2024-12-15T10:30:00Z',
  },
  {
    id: '2',
    studentId: '2',
    studentName: 'Malika Tursunova',
    type: 'maintenance',
    subject: 'Vannaning buzilishi',
    description: 'Xonamizda vanna ishlamayapti, ta\'mirlash kerak.',
    status: 'approved',
    priority: 'high',
    createdAt: '2024-12-14T14:20:00Z',
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      isDark: false,
      sidebarCollapsed: false,
      students: sampleStudents,
      rooms: sampleRooms,
      payments: samplePayments,
      applications: sampleApplications,
      notifications: [
        {
          id: '1',
          title: 'Yangi ariza',
          message: 'Akmal Karimov tomonidan yangi ariza yuborildi',
          type: 'info',
          read: false,
          createdAt: '2024-12-15T10:30:00Z',
        },
      ],
      
      // UI Actions
      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      // Student actions
      addStudent: (student) =>
        set((state) => ({
          students: [
            ...state.students,
            {
              ...student,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      
      updateStudent: (id, student) =>
        set((state) => ({
          students: state.students.map((s) => (s.id === id ? { ...s, ...student } : s)),
        })),
      
      deleteStudent: (id) =>
        set((state) => ({
          students: state.students.filter((s) => s.id !== id),
        })),
      
      // Room actions
      addRoom: (room) =>
        set((state) => ({
          rooms: [...state.rooms, { ...room, id: Date.now().toString() }],
        })),
      
      updateRoom: (id, room) =>
        set((state) => ({
          rooms: state.rooms.map((r) => (r.id === id ? { ...r, ...room } : r)),
        })),
      
      deleteRoom: (id) =>
        set((state) => ({
          rooms: state.rooms.filter((r) => r.id !== id),
        })),
      
      // Payment actions
      addPayment: (payment) =>
        set((state) => ({
          payments: [...state.payments, { ...payment, id: Date.now().toString() }],
        })),
      
      updatePayment: (id, payment) =>
        set((state) => ({
          payments: state.payments.map((p) => (p.id === id ? { ...p, ...payment } : p)),
        })),
      
      // Application actions
      updateApplication: (id, application) =>
        set((state) => ({
          applications: state.applications.map((a) => (a.id === id ? { ...a, ...application } : a)),
        })),
      
      // Notification actions
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
            },
            ...state.notifications,
          ],
        })),
      
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      
      clearNotifications: () => set(() => ({ notifications: [] })),
    }),
    {
      name: 'joyBor-storage',
      partialize: (state) => ({
        isDark: state.isDark,
        sidebarCollapsed: state.sidebarCollapsed,
        students: state.students,
        rooms: state.rooms,
        payments: state.payments,
        applications: state.applications,
      }),
    }
  )
);