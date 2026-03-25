import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ChevronRight, X, Filter, Search, ChevronDown, User, CheckCircle, XCircle, AlertCircle, UserPlus, SlidersHorizontal, Calendar, Phone as PhoneIcon, MapPin, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Select, { SingleValue, StylesConfig } from 'react-select';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { link } from '../data/config';
import api from '../data/api';


interface StatusColors {
  [key: string]: string;
}

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

const statusColors: StatusColors = {
  'PENDING': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  'APPROVED': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'REJECTED': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  // O'zbek tilidagi statuslar ham qo'llab-quvvatlash uchun
  'Yangi': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  'Rad etilgan': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  'Qabul qilindi': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
} as const;

// Status tarjima funksiyasi
const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'PENDING': 'Yangi',
    'APPROVED': 'Qabul qilindi',
    'REJECTED': 'Rad etilgan',
    // O'zbek tilidagi statuslar
    'Yangi': 'Yangi',
    'Rad etilgan': 'Rad etilgan',
    'Qabul qilindi': 'Qabul qilindi',
  };
  return statusMap[status] || status;
};

// Status rangini olish funksiyasi
const getStatusColor = (status: string) => {
  return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
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
    zIndex: 50,
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
  { value: '', label: 'Barcha holatlar' },
  { value: 'PENDING', label: 'Yangi arizalar' },
  { value: 'APPROVED', label: 'Qabul qilingan' },
  { value: 'REJECTED', label: 'Rad etilgan' },
];

const facultyOptions = [
  { value: 'Informatika', label: 'Informatika' },
  { value: 'Iqtisodiyot', label: 'Iqtisodiyot' },
  { value: 'Muhandislik', label: 'Muhandislik' },
  { value: 'Matematika', label: 'Matematika' },
  { value: 'Fizika', label: 'Fizika' },
  { value: 'Kimyo', label: 'Kimyo' },
];
const regionOptions = [
  { value: 'Toshkent', label: 'Toshkent' },
  { value: 'Samarqand', label: 'Samarqand' },
  { value: 'Farg\'ona', label: 'Farg\'ona' },
  { value: 'Andijon', label: 'Andijon' },
  { value: 'Buxoro', label: 'Buxoro' },
  { value: 'Namangan', label: 'Namangan' },
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
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [convertingApp, setConvertingApp] = useState<string | number | null>(null);
  const [deletingApp, setDeletingApp] = useState<string | number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ show: boolean; id: string | number | null }>({ show: false, id: null });

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

  // Listen for application updates
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

  // Convert application to student function - Updated to use FormData
  const handleConvertToStudent = async (applicationId: string | number) => {
    setConvertingApp(applicationId);
    try {
      const token = sessionStorage.getItem('access');
      if (!token) {
        toast.error('Avtorizatsiya talab qilinadi');
        return;
      }

      // Create FormData instead of JSON
      const formData = new FormData();
      formData.append('application_id', String(applicationId));

      const response = await fetch('https://joyborv1.pythonanywhere.com/student/create/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData, // Send FormData instead of JSON
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Arizani talabaga aylantirishda xatolik');
      }

      const result = await response.json();
      toast.success('Ariza muvaffaqiyatli talabaga aylantirildi!');
      
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

      // Status filter - ingliz va o'zbek tillarini qo'llab-quvvatlash
      const statusMatch = !statusFilter ||
        app.status === statusFilter ||
        (statusFilter === 'PENDING' && (app.status === 'Yangi' || app.status === 'PENDING')) ||
        (statusFilter === 'APPROVED' && (app.status === 'Qabul qilindi' || app.status === 'APPROVED')) ||
        (statusFilter === 'REJECTED' && (app.status === 'Rad etilgan' || app.status === 'REJECTED'));

      return nameMatch && statusMatch;
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Arizalar
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Tizimdagi barcha kelib tushgan arizalarni boshqarish
          </p>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Jami arizalar</span>
            <span className="text-xl font-black text-blue-700 dark:text-blue-300">{applications.length}</span>
          </div>
          <div className="w-px h-8 bg-blue-200 dark:bg-blue-800/50 mx-1"></div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Saralandi</span>
            <span className="text-xl font-black text-gray-700 dark:text-gray-200">{filteredApps.length}</span>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 dark:border-slate-700 p-2 mb-10">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
          {/* Search Input */}
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Ism yoki telefon raqami bo'yicha qidiruv..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl border-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0 transition-all text-lg font-medium"
            />
          </div>

          <div className="hidden lg:block w-px h-10 bg-gray-100 dark:bg-slate-700"></div>

          {/* Status Select */}
          <div className="lg:w-72 relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
              <SlidersHorizontal className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <Select
              options={statusFilterOptions}
              value={statusFilterOptions.find(opt => opt.value === statusFilter)}
              onChange={(opt) => setStatusFilter(opt?.value || '')}
              styles={selectStyles as any}
              placeholder="Holatni tanlang"
              className="react-select-container"
              classNamePrefix="react-select"
              components={{
                DropdownIndicator: () => <ChevronDown className="h-4 w-4 text-gray-400 mr-4" />,
                IndicatorSeparator: () => null
              }}
            />
          </div>

          {/* Refresh Button */}
          <button 
            onClick={() => refetch()}
            className="lg:ml-2 p-4 rounded-2xl bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95"
            title="Yangilash"
          >
            <Filter className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Applications List */}
      <div className="grid grid-cols-1 gap-6 pb-20">
        {filteredApps.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-700"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-blue-200 dark:text-blue-800" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Arizalar topilmadi</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              Siz qidirayotgan mezonlar bo'yicha hech qanday ma'lumot mavjud emas.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredApps.map((app: Application, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 border border-gray-100 dark:border-slate-700 p-1 transition-all duration-500 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start gap-5">
                    {/* Profile Section */}
                    <div className="relative">
                      {app.user_image ? (
                        <img
                          src={app.user_image}
                          alt={app.name}
                          className="w-20 h-20 rounded-3xl object-cover ring-4 ring-gray-50 dark:ring-slate-700 group-hover:ring-blue-500/20 transition-all duration-500 shadow-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl group-hover:scale-105 transition-all duration-500">
                          <span className="text-2xl font-black">
                            {(app.last_name?.[0] || '') + (app.name?.[0] || '') || <User className="w-8 h-8" />}
                          </span>
                        </div>
                      )}
                      <div className={`absolute -bottom-2 -right-2 p-1.5 rounded-xl border-4 border-white dark:border-slate-800 shadow-md ${getStatusColor(app.status)}`}>
                        {app.status === 'APPROVED' || app.status === 'Qabul qilindi' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : app.status === 'REJECTED' || app.status === 'Rad etilgan' ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {`${app.last_name || ''} ${app.name || ''}`.trim() || `Ariza #${app.id}`}
                        </h3>
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          ID: #{app.id}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <PhoneIcon className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-sm font-semibold">{app.phone || 'Noma\'lum'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-sm font-semibold">
                            {app.created_at ? new Date(app.created_at).toLocaleDateString('uz-UZ') : 'Noma\'lum'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info Cards */}
                  <div className="grid grid-cols-2 gap-3 mt-8">
                    <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10 transition-colors">
                      <div className="flex items-center gap-2 mb-1 text-gray-400 dark:text-gray-500 uppercase tracking-widest text-[10px] font-black">
                        <MapPin className="w-3 h-3" />
                        <span>Hudud</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {app.province_name || app.province?.name || 'Noma\'lum'}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10 transition-colors">
                      <div className="flex items-center gap-2 mb-1 text-gray-400 dark:text-gray-500 uppercase tracking-widest text-[10px] font-black">
                        <GraduationCap className="w-3 h-3" />
                        <span>Fakultet</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {app.faculty || 'Noma\'lum'}
                      </p>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
                    <Link
                      to={`/applications/${app.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                    >
                      <span>Ko'rish</span>
                      <ChevronRight className="w-5 h-5" />
                    </Link>

                    {(app.status === 'PENDING' || app.status === 'Yangi') && (
                      <button
                        onClick={() => handleConvertToStudent(app.id)}
                        disabled={convertingApp === app.id}
                        className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                        title="Talabaga aylantirish"
                      >
                        {convertingApp === app.id ? (
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <UserPlus className="w-5 h-5" />
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => setShowDeleteConfirm({ show: true, id: app.id })}
                      disabled={deletingApp === app.id}
                      className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                      title="O'chirish"
                    >
                      {deletingApp === app.id ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="w-5 h-5" />
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
