import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Select, { SingleValue } from 'react-select';
import { useQuery } from '@tanstack/react-query';
import { apiQueries } from '../data/api';
import { link } from '../data/config';

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
  status: keyof typeof statusColors;
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
  'Yangi': 'bg-blue-100 text-blue-700',
  'Ko\'rib chiqilmoqda': 'bg-yellow-100 text-yellow-700',
  'Rad etilgan': 'bg-red-100 text-red-700',
  'Qabul qilindi': 'bg-green-100 text-green-700',
} as const;

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
  const [statusFilter, setStatusFilter] = useState<keyof typeof statusColors | ''>('');
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
    error,
    refetch
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
    const nameMatch = (
      (app.fullName || '').toLowerCase().includes(searchLower) ||
      (app.full_name || '').toLowerCase().includes(searchLower) ||
      (app.name || '').toLowerCase().includes(searchLower) ||
      (app.fio || '').toLowerCase().includes(searchLower) ||
      (app.phone || '').toString().includes(searchLower)
    );
    const statusMatch = statusFilter ? app.status === statusFilter : true;
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
    console.log('Form submitted:', form);
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Arizalar</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Qidiruv..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-48"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as keyof typeof statusColors | '')}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full sm:w-48"
          >
            <option value="">Barcha holatlar</option>
            {Object.keys(statusColors).map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
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
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        📋
                      </div>
                      
                      {/* Status */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                          Ariza #{app.id}
                        </h3>
                        <div 
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                            statusColors[app.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            app.status === 'Qabul qilindi' ? 'bg-green-500' :
                            app.status === 'Rad etilgan' ? 'bg-red-500' :
                            app.status === 'Ko\'rib chiqilmoqda' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}></div>
                          {app.status}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ma'lumotlar grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Ism */}
                    {(app.name || app.fio) && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 text-sm">👤</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">F.I.O</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {app.fio || app.name || 'Kiritilmagan'}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 text-sm">📱</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Telefon</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {app.phone || 'Kiritilmagan'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-orange-600 dark:text-orange-400 text-sm">📅</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Ariza sanasi</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {(app.created_at || app.date) ? new Date(app.created_at || app.date).toLocaleDateString('uz-UZ') : 'Kiritilmagan'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600 dark:text-purple-400 text-sm">🆔</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Ariza ID</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          #{app.id}
                        </p>
                      </div>
                    </div>

                    {/* Shahar */}
                    {app.city && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                          <span className="text-indigo-600 dark:text-indigo-400 text-sm">🏙️</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Shahar</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {app.city}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Universitet */}
                    {app.university && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                          <span className="text-teal-600 dark:text-teal-400 text-sm">🎓</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Universitet</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {app.university}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Admin izohi */}
                    {app.admin_comment && (
                      <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg sm:col-span-2">
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                          <span className="text-red-600 dark:text-red-400 text-sm">💬</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Admin izohi</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {app.admin_comment}
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
                    {app.status === 'Yangi' && (
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