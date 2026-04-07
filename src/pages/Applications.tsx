import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Building, Home, ChevronRight, X, Filter, Search, User, UserPlus, Calendar, Phone as PhoneIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Select, { SingleValue, StylesConfig } from 'react-select';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { link } from '../data/config';
import api from '../data/api';


interface Application {
  id: string | number;
  name?: string;
  last_name?: string;
  middle_name?: string;
  phone: string | number;
  date?: string;
  created_at?: string;
  status: string;
  city?: string;
  province?: {
    id: number;
    name: string;
  };
  province_name?: string;
  district?: {
    id: number;
    name: string;
    province: number;
  };
  district_name?: string;
  faculty?: string;
  direction?: string;
  course?: string;
  group?: string;
  passport?: string;
  admin_comment?: string;
  comment?: string;
  dormitory?: {
    id: number;
    name: string;
  };
  dormitory_name?: string;
  user_image?: string;
  passport_image_first?: string;
  passport_image_second?: string;
  document?: string;
  user_info?: {
    id: number;
    username: string;
    role: string;
    email: string;
  };
  user?: number;
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  room: string;
  course: number;
  faculty: string;
  group: string;
  region: string;
  district: string;
  passport: string;
  isPrivileged: boolean;
  privilegeShare: string;
  direction: string;
  floor: string;
  birthDate: string;
  address: string;
  type: string;
}

interface SelectOption {
  value: string;
  label: string;
}

// Status rangini olish funksiyasi
const getStatusColor = (status: string) => {
  return statusBadgeColors[status] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
};

const selectStyles: StylesConfig<SelectOption, false> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'transparent',
    borderColor: state.isFocused ? '#3b82f6' : 'transparent',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#3b82f6',
    },
    borderRadius: '0.75rem',
    padding: '2px 4px',
    cursor: 'pointer',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
    borderRadius: '1rem',
    overflow: 'hidden',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    border: '1px solid ' + (document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0'),
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected 
      ? '#3b82f6' 
      : state.isFocused 
        ? (document.documentElement.classList.contains('dark') ? '#334155' : '#f1f5f9')
        : 'transparent',
    color: state.isSelected 
      ? '#ffffff' 
      : (document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#1e293b'),
    padding: '10px 16px',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#3b82f6',
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#1e293b',
    fontWeight: '500',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#94a3b8',
  }),
};

const statusFilterOptions = [
  { value: 'PENDING', label: 'Yangi arizalar' },
  { value: 'APPROVED', label: 'Qabul qilingan' },
  { value: 'REJECTED', label: 'Rad etilgan' },
  { value: 'CONVERTED', label: 'Talabaga aylantirilgan' },
  { value: '', label: 'Barcha arizalar' },
];

// Status labels for display
const statusLabels: Record<string, string> = {
  'PENDING': 'Yangi',
  'APPROVED': 'Qabul qilindi',
  'REJECTED': 'Rad etilgan',
  'CONVERTED': 'Talabaga aylantirilgan',
  'Yangi': 'Yangi',
  'Qabul qilindi': 'Qabul qilindi',
  'Rad etilgan': 'Rad etilgan',
  'Pending': 'Yangi',
  'Approved': 'Qabul qilindi',
  'Rejected': 'Rad etilgan',
  'Converted': 'Talabaga aylantirilgan',
};

// Status badge colors
const statusBadgeColors: Record<string, string> = {
  'PENDING': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  'APPROVED': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  'REJECTED': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  'CONVERTED': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  'Yangi': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  'Qabul qilindi': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  'Rad etilgan': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  'Pending': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  'Approved': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  'Rejected': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  'Converted': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
};

const facultyOptions = [
  { value: 'ATT', label: 'ATT' },
  { value: 'Informatika', label: 'Informatika' },
  { value: 'Iqtisodiyot', label: 'Iqtisodiyot' },
  { value: 'Muhandislik', label: 'Muhandislik' },
  { value: '', label: 'Barcha fakultetlar' },
];
const regionOptions = [
  { value: 'Farg‘ona viloyati', label: 'Farg‘ona' },
  { value: 'Toshkent viloyati', label: 'Toshkent viloyati' },
  { value: 'Toshkent shahri', label: 'Toshkent shahri' },
  { value: 'Andijon viloyati', label: 'Andijon' },
  { value: 'Samarqand viloyati', label: 'Samarqand' },
  { value: 'Namangan viloyati', label: 'Namangan' },
  { value: 'Buxoro viloyati', label: 'Buxoro' },
  { value: '', label: 'Barcha viloyatlar' },
];

const genderOptions = [
  { value: 'Erkak', label: 'Erkak' },
  { value: 'Ayol', label: 'Ayol' },
  { value: '', label: 'Barcha jinslar' },
];

const courseOptions = [
  { value: '1-kurs', label: '1-kurs' },
  { value: '2-kurs', label: '2-kurs' },
  { value: '3-kurs', label: '3-kurs' },
  { value: '4-kurs', label: '4-kurs' },
  { value: '', label: 'Barcha kurslar' },
];
const districtOptions: Record<string, { value: string; label: string }[]> = {
  'Toshkent': [
    { value: 'Yunusobod', label: 'Yunusobod' },
    { value: 'Chilonzor', label: 'Chilonzor' },
    { value: 'Olmazor', label: 'Olmazor' },
  ],
  'Samarqand': [
    { value: 'Samarqand sh.', label: 'Samarqand sh.' },
    { value: 'Urgut', label: 'Urgut' },
  ],
  'Farg\'ona': [
    { value: 'Farg\'ona sh.', label: 'Farg\'ona sh.' },
    { value: 'Qo\'qon', label: 'Qo\'qon' },
  ],
  'Andijon': [
    { value: 'Andijon sh.', label: 'Andijon sh.' },
    { value: 'Asaka', label: 'Asaka' },
  ],
  'Buxoro': [
    { value: 'Buxoro sh.', label: 'Buxoro sh.' },
    { value: 'G\'ijduvon', label: 'G\'ijduvon' },
  ],
  'Namangan': [
    { value: 'Namangan sh.', label: 'Namangan sh.' },
    { value: 'Chortoq', label: 'Chortoq' },
  ],
};

const Applications: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING'); // Default to PENDING
  const [genderFilter, setGenderFilter] = useState<string>('');
  const [facultyFilter, setFacultyFilter] = useState<string>('');
  const [courseFilter, setCourseFilter] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('');
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedAppForConvert, setSelectedAppForConvert] = useState<Application | null>(null);
  const [convertForm, setConvertForm] = useState({
    floor: '',
    room: ''
  });
  const [convertingApp, setConvertingApp] = useState<string | number | null>(null);
  const [deletingApp, setDeletingApp] = useState<string | number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ show: boolean; id: string | number | null }>({ show: false, id: null });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    room: '',
    course: 1,
    faculty: '',
    group: '',
    region: '',
    district: '',
    passport: '',
    isPrivileged: false,
    privilegeShare: '',
    direction: '',
    floor: '',
    birthDate: '',
    address: '',
    type: 'Yotoqxona',
  });

  const queryClient = useQueryClient();

  // Fetch floors for convert modal
  const { data: floorsData } = useQuery({
    queryKey: ['floors'],
    queryFn: () => api.getFloors(),
  });

  const floors = floorsData?.results || floorsData || [];

  // Fetch rooms based on selected floor
  const { data: roomsData } = useQuery({
    queryKey: ['rooms', convertForm.floor],
    queryFn: () => api.getRooms(convertForm.floor),
    enabled: !!convertForm.floor,
  });

  const rooms = roomsData?.results || roomsData || [];
  React.useEffect(() => {
    const handleApplicationUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    };
    
    window.addEventListener('application-updated', handleApplicationUpdate);
    
    return () => {
      window.removeEventListener('application-updated', handleApplicationUpdate);
    };
  }, [queryClient]);

  // API dan arizalarni olish
  const { data: applicationsData, isLoading, error, refetch } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const token = sessionStorage.getItem('access');
      if (!token) {
        throw new Error('Avtorizatsiya talab qilinadi');
      }

      const response = await fetch(`${link}/applications/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Arizalarni yuklashda xatolik');
      }

      const data = await response.json();
      console.log('Applications API response:', data);
      
      // API returns paginated data with results array
      if (data && data.results && Array.isArray(data.results)) {
        return data.results.map((app: Record<string, unknown>) => ({
          id: app.id,
          name: app.name,
          last_name: app.last_name,
          middle_name: app.middle_name,
          phone: app.phone,
          created_at: app.created_at,
          status: app.status,
          province_name: app.province_name,
          district_name: app.district_name,
          faculty: app.faculty,
          direction: app.direction,
          course: app.course,
          group: app.group,
          passport: app.passport,
          comment: app.comment,
          dormitory_name: app.dormitory_name,
          user_image: app.user_image,
          passport_image_first: app.passport_image_first,
          passport_image_second: app.passport_image_second,
          document: app.document,
          user_info: app.user_info,
          user: app.user,
          dormitory: app.dormitory,
          province: app.province,
          district: app.district,
        }));
      }
      
      // Fallback for non-paginated response
      return Array.isArray(data) ? data : [];
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const applications: Application[] = applicationsData || [];

  // Listen for global application updates
  React.useEffect(() => {
    const handleApplicationUpdate = () => {
      refetch();
    };
    window.addEventListener('application-updated', handleApplicationUpdate);
    return () => {
      window.removeEventListener('application-updated', handleApplicationUpdate);
    };
  }, [refetch]);

  // Open convert modal with application data
  const openConvertModal = (app: Application) => {
    setSelectedAppForConvert(app);
    setConvertForm({ floor: '', room: '' });
    setShowConvertModal(true);
  };

  // Handle floor selection
  const handleFloorChange = (floorId: string) => {
    setConvertForm(prev => ({ ...prev, floor: floorId, room: '' }));
  };

  // Handle room selection  
  const handleRoomChange = (roomId: string) => {
    setConvertForm(prev => ({ ...prev, room: roomId }));
  };

  // Convert application to student with floor and room
  const handleConvertToStudent = async () => {
    if (!selectedAppForConvert || !convertForm.floor || !convertForm.room) {
      toast.error('Qavat va xona tanlash shart!');
      return;
    }

    setConvertingApp(selectedAppForConvert.id);
    try {
      const token = sessionStorage.getItem('access');
      if (!token) {
        toast.error('Avtorizatsiya talab qilinadi');
        return;
      }

      // Create FormData with application_id, floor, room and is_active
      const formData = new FormData();
      formData.append('application_id', String(selectedAppForConvert.id));
      formData.append('floor', convertForm.floor);
      formData.append('room', convertForm.room);
      formData.append('is_active', 'true');

      const response = await fetch(`${link}/student/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Arizani talabaga aylantirishda xatolik');
      }

      const result = await response.json();
      toast.success('Ariza muvaffaqiyatli talabaga aylantirildi!');
      
      // Close modal and refresh
      setShowConvertModal(false);
      setSelectedAppForConvert(null);
      setConvertForm({ floor: '', room: '' });
      
      // Refresh applications and students list
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
      await queryClient.invalidateQueries({ queryKey: ['students'] });
      await refetch();
      
      // Emit global event for student update
      window.dispatchEvent(new CustomEvent('student-updated', { detail: { action: 'created', data: result } }));
      
    } catch (error: unknown) {
      console.error('Convert application error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Arizani talabaga aylantirishda xatolik yuz berdi';
      toast.error(errorMessage);
    } finally {
      setConvertingApp(null);
    }
  };

  // Delete application function
  const handleDeleteApplication = async (id: string | number) => {
    setDeletingApp(id);
    try {
      await api.deleteApplication(id);
      toast.success('Ariza muvaffaqiyatli o\'chirildi');
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
      await refetch();
    } catch (error: any) {
      toast.error(error.message || 'Arizani o\'chirishda xatolik yuz berdi');
    } finally {
      setDeletingApp(null);
      setShowDeleteConfirm({ show: false, id: null });
    }
  };

  // Filter API data with proper type safety and sort by newest first
  const filteredApps = applications
    .filter((app) => {
      const searchLower = search.toLowerCase();

      // Qidiruv - faqat ism va telefon bo'yicha
      const nameMatch = !search || (
        (app.name || '').toLowerCase().includes(searchLower) ||
        (app.last_name || '').toLowerCase().includes(searchLower) ||
        (app.middle_name || '').toLowerCase().includes(searchLower) ||
        (app.phone || '').toString().includes(searchLower)
      );

      // Status filter
      const statusMatch = !statusFilter || 
        app.status === statusFilter ||
        (statusFilter === 'PENDING' && (app.status === 'Yangi' || app.status === 'Pending')) ||
        (statusFilter === 'APPROVED' && (app.status === 'Qabul qilindi' || app.status === 'Approved')) ||
        (statusFilter === 'REJECTED' && (app.status === 'Rad etilgan' || app.status === 'Rejected')) ||
        (statusFilter === 'CONVERTED' && (app.status === 'Talabaga aylantirilgan' || app.status === 'Converted'));

      // Gender filter
      const genderMatch = !genderFilter || 
        (app as any).gender?.toLowerCase() === genderFilter.toLowerCase();

      // Faculty filter
      const facultyMatch = !facultyFilter || 
        app.faculty?.toLowerCase() === facultyFilter.toLowerCase();

      // Course filter
      const courseMatch = !courseFilter || 
        app.course === courseFilter;

      // Region filter
      const regionMatch = !regionFilter || 
        app.province_name === regionFilter;

      return nameMatch && statusMatch && genderMatch && facultyMatch && courseMatch && regionMatch;
    })
    .sort((a, b) => {
      // Eng yangisi tepada bo'lishi uchun created_at bo'yicha saralash
      const dateA = new Date(a.created_at || a.date || 0).getTime();
      const dateB = new Date(b.created_at || b.date || 0).getTime();
      return dateB - dateA; // Eng yangi birinchi
    });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' && 'checked' in e.target
        ? (e.target as HTMLInputElement).checked
        : value,
    }));
  };
  const handleSelectChange = (
    name: keyof Pick<FormData, 'faculty' | 'region' | 'district'>,
    option: SingleValue<SelectOption>
  ) => {
    setForm(f => ({ ...f, [name]: option?.value || '' }));
    if (name === 'region') {
      setForm(f => ({ ...f, district: '' }));
    }
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Yangi arizani qo'shish logikasi (mock)
    setShowModal(false);
  };

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center py-10 text-red-600 dark:text-red-400">
        Ma'lumotlarni yuklashda xatolik yuz berdi.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-screen bg-gray-100 dark:bg-slate-900 transition-colors duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Arizalar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Tizimdagi barcha kelib tushgan arizalar
          </p>
        </div>
        
        <div className="flex items-center gap-4 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
          <div className="text-right">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Jami</span>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{applications.length}</p>
          </div>
          <div className="w-px h-8 bg-gray-200 dark:bg-slate-600"></div>
          <div className="text-right">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Saralandi</span>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{filteredApps.length}</p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Ism, familiya yoki telefon..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Select */}
            <div className="lg:w-64">
              <Select
                options={statusFilterOptions}
                value={statusFilterOptions.find(opt => opt.value === statusFilter)}
                onChange={(opt) => setStatusFilter(opt?.value || '')}
                styles={selectStyles as any}
                placeholder="Holatni tanlang"
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>

            {/* Refresh Button */}
            <button 
              onClick={() => refetch()}
              className="px-4 py-2.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
              title="Yangilash"
            >
              <Filter className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Yangilash</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Gender Filter */}
            <Select
              options={genderOptions}
              value={genderOptions.find(opt => opt.value === genderFilter)}
              onChange={(opt) => setGenderFilter(opt?.value || '')}
              styles={selectStyles as any}
              placeholder="Jinsni tanlang"
            />

            {/* Faculty Filter */}
            <Select
              options={facultyOptions}
              value={facultyOptions.find(opt => opt.value === facultyFilter)}
              onChange={(opt) => setFacultyFilter(opt?.value || '')}
              styles={selectStyles as any}
              placeholder="Fakultetni tanlang"
            />

            {/* Course Filter */}
            <Select
              options={courseOptions}
              value={courseOptions.find(opt => opt.value === courseFilter)}
              onChange={(opt) => setCourseFilter(opt?.value || '')}
              styles={selectStyles as any}
              placeholder="Kursni tanlang"
            />

            {/* Region Filter */}
            <Select
              options={regionOptions}
              value={regionOptions.find(opt => opt.value === regionFilter)}
              onChange={(opt) => setRegionFilter(opt?.value || '')}
              styles={selectStyles as any}
              placeholder="Viloyatni tanlang"
            />
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="grid grid-cols-1 gap-4 pb-10">
        {filteredApps.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Arizalar topilmadi</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Tanlangan filter bo'yicha arizalar mavjud emas
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredApps.map((app: Application, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Profile Section */}
                    <div className="relative flex-shrink-0">
                      {app.user_image ? (
                        <img
                          src={app.user_image}
                          alt={app.name}
                          className="w-14 h-14 rounded-md object-cover border border-gray-200 dark:border-slate-600"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-blue-600 rounded-md flex items-center justify-center text-white">
                          <span className="text-lg font-semibold">
                            {(app.last_name?.[0] || '') + (app.name?.[0] || '') || <User className="w-6 h-6" />}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                          {`${app.last_name || ''} ${app.name || ''}`.trim() || `Ariza #${app.id}`}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(app.status)}`}>
                          {statusLabels[app.status] || app.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <PhoneIcon className="w-4 h-4 text-gray-400" />
                          <span>{app.phone || 'Noma\'lum'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            {app.created_at ? new Date(app.created_at).toLocaleDateString('uz-UZ') : 'Noma\'lum'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-4 mt-3 text-sm">
                        <div className="text-gray-600 dark:text-gray-400">
                          <span className="text-gray-400 dark:text-gray-500">{app.province_name || app.province?.name || '-'}</span>
                        </div>
                        <div className="text-gray-400">|</div>
                        <div className="text-gray-600 dark:text-gray-400">
                          <span className="text-gray-400 dark:text-gray-500">{app.faculty || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                    <Link
                      to={`/applications/${app.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <span>Ko'rish</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>

                    {(app.status === 'PENDING' || app.status === 'Yangi') && (
                      <button
                        onClick={() => openConvertModal(app)}
                        disabled={convertingApp === app.id}
                        className="px-3 py-2 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-600 hover:text-white transition-colors disabled:opacity-50"
                        title="Talabalar ro'yhatiga qo'shish"
                      >
                        {convertingApp === app.id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => setShowDeleteConfirm({ show: true, id: app.id })}
                      disabled={deletingApp === app.id}
                      className="px-3 py-2 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
                      title="O'chirish"
                    >
                      {deletingApp === app.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8 w-full max-w-md border border-gray-100 dark:border-slate-700 text-center"
            >
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                <Trash2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Arizani o'chirish?</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
                Siz haqiqatan ham ushbu arizani tizimdan butunlay o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm({ show: false, id: null })}
                  className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={() => showDeleteConfirm.id && handleDeleteApplication(showDeleteConfirm.id)}
                  className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all active:scale-95"
                >
                  O'chirish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Convert to Student Modal */}
      <AnimatePresence>
        {showConvertModal && selectedAppForConvert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8 w-full max-w-lg border border-gray-100 dark:border-slate-700"
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-green-500">
                  <UserPlus className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">Talabaga aylantirish</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Ariza ma'lumotlarini tekshirib, qavat va xona tanlang
                  </p>
                </div>
              </div>

              {/* Application Info Card */}
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-4 mb-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                    {(selectedAppForConvert.last_name?.[0] || '') + (selectedAppForConvert.name?.[0] || '')}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {selectedAppForConvert.last_name} {selectedAppForConvert.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedAppForConvert.phone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white dark:bg-slate-700 rounded-xl p-3">
                    <p className="text-gray-400 dark:text-gray-500 text-xs uppercase font-bold mb-1">Fakultet</p>
                    <p className="text-gray-900 dark:text-white font-medium truncate">{selectedAppForConvert.faculty || '-'}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-700 rounded-xl p-3">
                    <p className="text-gray-400 dark:text-gray-500 text-xs uppercase font-bold mb-1">Yo'nalish</p>
                    <p className="text-gray-900 dark:text-white font-medium truncate">{selectedAppForConvert.direction || '-'}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-700 rounded-xl p-3">
                    <p className="text-gray-400 dark:text-gray-500 text-xs uppercase font-bold mb-1">Guruh</p>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedAppForConvert.group || '-'}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-700 rounded-xl p-3">
                    <p className="text-gray-400 dark:text-gray-500 text-xs uppercase font-bold mb-1">Kurs</p>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedAppForConvert.course || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Floor and Room Selection */}
              <div className="space-y-4 mb-6">
                {/* Floor Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Qavat *
                  </label>
                  <Select
                    options={floors.map((f: any) => ({ value: String(f.id), label: f.name }))}
                    value={floors.find((f: any) => String(f.id) === convertForm.floor) 
                      ? { value: convertForm.floor, label: floors.find((f: any) => String(f.id) === convertForm.floor)?.name }
                      : null
                    }
                    onChange={(opt) => handleFloorChange(opt?.value || '')}
                    placeholder="Qavat tanlang"
                    styles={selectStyles as any}
                    classNamePrefix="react-select"
                  />
                </div>

                {/* Room Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    <Home className="w-4 h-4 inline mr-1" />
                    Xona *
                  </label>
                  <Select
                    options={rooms.map((r: any) => ({ value: String(r.id), label: r.name }))}
                    value={rooms.find((r: any) => String(r.id) === convertForm.room)
                      ? { value: convertForm.room, label: rooms.find((r: any) => String(r.id) === convertForm.room)?.name }
                      : null
                    }
                    onChange={(opt) => handleRoomChange(opt?.value || '')}
                    placeholder={convertForm.floor ? "Xona tanlang" : "Avval qavat tanlang"}
                    isDisabled={!convertForm.floor}
                    styles={selectStyles as any}
                    classNamePrefix="react-select"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowConvertModal(false);
                    setSelectedAppForConvert(null);
                    setConvertForm({ floor: '', room: '' });
                  }}
                  className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleConvertToStudent}
                  disabled={!convertForm.floor || !convertForm.room || convertingApp === selectedAppForConvert.id}
                  className="flex-1 py-4 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {convertingApp === selectedAppForConvert.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Aylantirilmoqda...
                    </span>
                  ) : (
                    "Talabalar ro'yhatiga qo'shish"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Yangi ariza modal - kept for functionality but could be improved too if needed */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-2xl relative flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 dark:hover:text-red-400 bg-transparent rounded-full p-1 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">Yangi ariza yuborish</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" name="firstName" value={form.firstName} onChange={handleInputChange} placeholder="Ism" required className="input" />
                  <input type="text" name="lastName" value={form.lastName} onChange={handleInputChange} placeholder="Familiya" required className="input" />
                  <input type="text" name="phone" value={form.phone} onChange={handleInputChange} placeholder="Telefon" required className="input" />
                  <input type="email" name="email" value={form.email} onChange={handleInputChange} placeholder="Email" className="input" />
                  <input type="text" name="room" value={form.room} onChange={handleInputChange} placeholder="Xona" className="input" />
                  <input type="number" name="course" value={form.course} onChange={handleInputChange} placeholder="Kurs" min={1} max={6} className="input" />
                  <Select
                    options={facultyOptions}
                    value={facultyOptions.find(opt => opt.value === form.faculty) || null}
                    onChange={opt => handleSelectChange('faculty', opt)}
                    isClearable
                    placeholder="Fakultet"
                    styles={selectStyles as any}
                    classNamePrefix="react-select"
                  />
                  <input type="text" name="group" value={form.group} onChange={handleInputChange} placeholder="Guruh" className="input" />
                  <Select
                    options={regionOptions}
                    value={regionOptions.find(opt => opt.value === form.region) || null}
                    onChange={opt => handleSelectChange('region', opt)}
                    isClearable
                    placeholder="Viloyat"
                    styles={selectStyles as any}
                    classNamePrefix="react-select"
                  />
                  <Select
                    options={form.region ? districtOptions[form.region] : []}
                    value={form.region && districtOptions[form.region]?.find(opt => opt.value === form.district) || null}
                    onChange={opt => handleSelectChange('district', opt)}
                    isClearable
                    placeholder="Tuman"
                    styles={selectStyles as any}
                    classNamePrefix="react-select"
                  />
                  <input type="text" name="passport" value={form.passport} onChange={handleInputChange} placeholder="Passport" className="input" />
                  <input type="text" name="direction" value={form.direction} onChange={handleInputChange} placeholder="Yo'nalish" className="input" />
                  <input type="text" name="floor" value={form.floor} onChange={handleInputChange} placeholder="Qavat" className="input" />
                  <input type="date" name="birthDate" value={form.birthDate} onChange={handleInputChange} placeholder="Tug'ilgan sana" className="input" />
                  <input type="text" name="address" value={form.address} onChange={handleInputChange} placeholder="Manzil" className="input" />
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="isPrivileged" checked={form.isPrivileged} onChange={handleInputChange} />
                    Imtiyozli
                  </label>
                  {form.isPrivileged && (
                    <input type="number" name="privilegeShare" value={form.privilegeShare} onChange={handleInputChange} placeholder="Imtiyoz foizi" min={0} max={100} className="input w-32" />
                  )}
                </div>
                <button type="submit" className="mt-4 px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">Yuborish</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Applications;

// Tailwind input style helper
// Add this to your global CSS or index.css if not already present:
// .input { @apply w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent; }
