import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import { useQuery } from '@tanstack/react-query';
import { apiQueries } from '../data/api';
import { link } from '../data/config';

const statusColors = {
  'Yangi': 'bg-blue-100 text-blue-700',
  'Ko‘rib chiqilmoqda': 'bg-yellow-100 text-yellow-700',
  'Rad etilgan': 'bg-red-100 text-red-700',
  'Qabul qilindi': 'bg-green-100 text-green-700',
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
  { value: 'Farg‘ona', label: 'Farg‘ona' },
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
  'Farg‘ona': [
    { value: 'Farg‘ona sh.', label: 'Farg‘ona sh.' },
    { value: 'Qo‘qon', label: 'Qo‘qon' },
  ],
  'Andijon': [
    { value: 'Andijon sh.', label: 'Andijon sh.' },
    { value: 'Asaka', label: 'Asaka' },
  ],
  'Buxoro': [
    { value: 'Buxoro sh.', label: 'Buxoro sh.' },
    { value: 'G‘ijduvon', label: 'G‘ijduvon' },
  ],
  'Namangan': [
    { value: 'Namangan sh.', label: 'Namangan sh.' },
    { value: 'Chortoq', label: 'Chortoq' },
  ],
};

const Applications: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
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
  } = useQuery({
    queryKey: ['applications'],
    queryFn: apiQueries.getApplications,
    staleTime: 1000 * 60 * 5,
  });

  // Filter API data
  const filteredApps = applications.filter((app: Record<string, any>) =>
    (app.fullName || app.full_name || '').toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter ? (app.status === statusFilter) : true)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' && 'checked' in e.target ? (e.target as HTMLInputElement).checked : value,
    }));
  };
  const handleSelectChange = (name: string, option: { value: string; label: string } | null) => {
    setForm(f => ({ ...f, [name]: option ? option.value : '' }));
    if (name === 'region') setForm(f => ({ ...f, district: '' }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Yangi arizani qo'shish logikasi (mock)
    setShowModal(false);
  };

  // Replace mockApplications with filteredApps in render
  // Add loading and error states
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
        <button
          onClick={() => refetch()}
          className="ml-2 text-blue-600 hover:underline"
        >
          Qayta urinish
        </button>
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
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full sm:w-48"
          >
            <option value="">Barcha holatlar</option>
            <option value="Yangi">Yangi</option>
            <option value="Ko‘rib chiqilmoqda">Ko‘rib chiqilmoqda</option>
            <option value="Rad etilgan">Rad etilgan</option>
            <option value="Qabul qilindi">Qabul qilindi</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {filteredApps.length === 0 ? (
          <div className="text-center text-gray-400 py-10">Arizalar topilmadi</div>
        ) : (
          filteredApps.map((app: Record<string, any>) => (
            <div
              key={app.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 border border-gray-100 dark:border-slate-700 hover:shadow-lg transition"
            >
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{app.fullName || app.full_name}</div>
                <div className="text-gray-500 dark:text-gray-300 text-sm sm:text-base">{app.phone}</div>
                <div className="text-gray-400 text-xs sm:text-sm">{app.date}</div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[app.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700'}`}>{app.status}</div>
              </div>
              <Link
                to={`/application/${app.id}`}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition text-sm sm:text-base"
              >
                Batafsil <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
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