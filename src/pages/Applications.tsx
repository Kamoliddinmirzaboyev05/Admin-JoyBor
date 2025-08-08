import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, X, Filter, Search, ChevronDown, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Select, { SingleValue } from 'react-select';
import { useQuery } from '@tanstack/react-query';


interface StatusColors {
  [key: string]: string;
}

interface Application {
  id: string | number;
  fullName?: string;
  full_name?: string;
  name?: string;
  fio?: string;
  phone: string;
  date: string;
  created_at?: string;
  status: string;
  city?: string;
  village?: string;
  university?: string;
  direction?: string;
  admin_comment?: string;
  comment?: string;
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
  'PENDING': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'APPROVED': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'REJECTED': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'REVIEWING': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  // O'zbek tilidagi statuslar ham qo'llab-quvvatlash uchun
  'Yangi': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'Ko\'rib chiqilmoqda': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Rad etilgan': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'Qabul qilindi': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
} as const;

// Status tarjima funksiyasi
const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'PENDING': 'Yangi',
    'APPROVED': 'Qabul qilindi',
    'REJECTED': 'Rad etilgan',
    'REVIEWING': 'Ko\'rib chiqilmoqda',
    // O'zbek tilidagi statuslar
    'Yangi': 'Yangi',
    'Ko\'rib chiqilmoqda': 'Ko\'rib chiqilmoqda',
    'Rad etilgan': 'Rad etilgan',
    'Qabul qilindi': 'Qabul qilindi',
  };
  return statusMap[status] || status;
};

// Status rangini olish funksiyasi
const getStatusColor = (status: string) => {
  return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
};

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

  // React Query bilan applications ma'lumotlarini olish
  const {
    data: applications = [],
    isLoading,
    error
  } = useQuery<Application[], Error>({
    queryKey: ['applications'],
    queryFn: async () => {
      const token = sessionStorage.getItem('access');
      if (!token) {
        throw new Error('Avtorizatsiya talab qilinadi');
      }

      const response = await fetch('https://joyboryangi.pythonanywhere.com/applications/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Arizalarni yuklashda xatolik yuz berdi');
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // Filter API data with proper type safety
  const filteredApps = applications.filter((app) => {
    const searchLower = search.toLowerCase();

    // Qidiruv - faqat ism va telefon bo'yicha
    const nameMatch = !search || (
      (app.name || '').toLowerCase().includes(searchLower) ||
      (app.fio || '').toLowerCase().includes(searchLower) ||
      (app.phone || '').toString().includes(searchLower)
    );

    // Status filter - ingliz va o'zbek tillarini qo'llab-quvvatlash
    const statusMatch = !statusFilter ||
      app.status === statusFilter ||
      (statusFilter === 'PENDING' && (app.status === 'Yangi' || app.status === 'PENDING')) ||
      (statusFilter === 'REVIEWING' && (app.status === 'Ko\'rib chiqilmoqda' || app.status === 'REVIEWING')) ||
      (statusFilter === 'APPROVED' && (app.status === 'Qabul qilindi' || app.status === 'APPROVED')) ||
      (statusFilter === 'REJECTED' && (app.status === 'Rad etilgan' || app.status === 'REJECTED'));

    return nameMatch && statusMatch;
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
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Arizalar</h1>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Jami: {applications.length} ta ariza | Ko'rsatilmoqda: {filteredApps.length} ta
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Qidiruv */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Ism yoki telefon raqami bo'yicha qidiruv..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Status filter */}
            <div className="lg:w-64">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full appearance-none px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="">Barcha holatlar</option>
                  <option value="PENDING">🆕 Yangi arizalar ({applications.filter(app => app.status === 'PENDING' || app.status === 'Yangi').length})</option>
                  <option value="REVIEWING">⏳ Ko'rib chiqilmoqda ({applications.filter(app => app.status === 'REVIEWING' || app.status === 'Ko\'rib chiqilmoqda').length})</option>
                  <option value="APPROVED">✅ Qabul qilingan ({applications.filter(app => app.status === 'APPROVED' || app.status === 'Qabul qilindi').length})</option>
                  <option value="REJECTED">❌ Rad etilgan ({applications.filter(app => app.status === 'REJECTED' || app.status === 'Rad etilgan').length})</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filter tags */}
          {(search || statusFilter) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
              {search && (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  <Search className="w-4 h-4" />
                  Qidiruv: "{search}"
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                  <Filter className="w-4 h-4" />
                  Status: {getStatusText(statusFilter)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredApps.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Arizalar topilmadi</h3>
            <p className="text-gray-500 dark:text-gray-400">Qidiruv shartlaringizga mos ariza mavjud emas</p>
          </div>
        ) : (
          filteredApps.map((app: Application) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Talaba ma'lumotlari */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <User className="w-6 h-6" />
                      </div>

                      {/* Ariza yuboruvchi ismi */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                          {app.fio || app.name || `Ariza #${app.id}`}
                        </h3>
                        <div
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(app.status)}`}
                        >
                          {app.status === 'APPROVED' || app.status === 'Qabul qilindi' ? (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          ) : app.status === 'REJECTED' || app.status === 'Rad etilgan' ? (
                            <XCircle className="w-4 h-4 mr-2" />
                          ) : app.status === 'REVIEWING' || app.status === 'Ko\'rib chiqilmoqda' ? (
                            <Clock className="w-4 h-4 mr-2" />
                          ) : (
                            <AlertCircle className="w-4 h-4 mr-2" />
                          )}
                          {getStatusText(app.status)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ma'lumotlar grid - faqat muhim ma'lumotlar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Viloyat */}
                    {app.city && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <span className="text-green-600 dark:text-green-400 text-sm">🏙️</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Viloyat</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {app.city}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Talaba izohi */}
                    {(app.comment || app.admin_comment) && (
                      <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <span className="text-purple-600 dark:text-purple-400 text-sm">💬</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Izoh</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {app.comment || app.admin_comment}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action button */}
                <div className="flex flex-col gap-3">
                  <Link
                    to={`/application/${app.id}`}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <span>Batafsil</span>
                    <ChevronRight className="w-5 h-5" />
                  </Link>

                  {/* Quick actions */}
                  <div className="flex gap-2">
                    {(app.status === 'PENDING' || app.status === 'Yangi') && (
                      <>
                        <button className="flex-1 px-3 py-2 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition">
                          Qabul
                        </button>
                        <button className="flex-1 px-3 py-2 text-xs font-medium text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition">
                          Rad
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Yangi ariza modal */}
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
                    classNamePrefix="react-select"
                  />
                  <input type="text" name="group" value={form.group} onChange={handleInputChange} placeholder="Guruh" className="input" />
                  <Select
                    options={regionOptions}
                    value={regionOptions.find(opt => opt.value === form.region) || null}
                    onChange={opt => handleSelectChange('region', opt)}
                    isClearable
                    placeholder="Viloyat"
                    classNamePrefix="react-select"
                  />
                  <Select
                    options={form.region ? districtOptions[form.region] : []}
                    value={form.region && districtOptions[form.region]?.find(opt => opt.value === form.district) || null}
                    onChange={opt => handleSelectChange('district', opt)}
                    isClearable
                    placeholder="Tuman"
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