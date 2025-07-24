import React from 'react';
import { useParams } from 'react-router-dom';
import BackButton from '../components/UI/BackButton';
import { BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { apiQueries } from '../data/api';
import { link } from '../data/config';

const statusColors = {
  'Yangi': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200',
  'Ko‘rib chiqilmoqda': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-200',
  'Rad etilgan': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200',
  'Qabul qilindi': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200',
};

function ReadOnlyInput({ label, value }: { label: string; value?: string | number | boolean }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5 pl-1">{label}</span>
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 text-base font-medium min-h-[40px] flex items-center">
        {typeof value === 'boolean' ? (value ? 'Ha' : 'Yo\'q') : value || '-'}
      </div>
    </div>
  );
}

const ApplicationDetail: React.FC = () => {
  const { id } = useParams();
  // Fetch all applications and find by id (API does not have getApplicationById)
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
  const app = applications.find((a: Record<string, any>) => String(a.id) === String(id));

  const getNameParts = (fullName: string) => {
    const parts = fullName.split(' ');
    return {
      lastName: parts[0] || '-',
      firstName: parts[1] || '-',
      fatherName: parts.slice(2).join(' ') || '-',
    };
  };
  const { lastName, firstName, fatherName } = app ? getNameParts(app.fullName || app.full_name || '') : { lastName: '-', firstName: '-', fatherName: '-' };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div></div>;
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
  if (!app) {
    return (
      <div className="p-8 text-center text-red-500">
        Ariza topilmadi. <BackButton label="Orqaga qaytish" className="mx-auto mt-4" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="min-h-screen bg-white dark:bg-slate-900 py-8 px-2 flex flex-col items-center"
    >
      <div className="w-full max-w-3xl bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-slate-700">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="flex w-full justify-between items-center mb-2">
            <BackButton label="Orqaga" />
            <span className={`flex items-center gap-2 px-4 py-1 rounded-full text-sm font-medium ${statusColors[app.status as keyof typeof statusColors]} shadow`}>
              <BadgeCheck className="w-5 h-5" /> {app.status}
            </span>
          </div>
          {app.avatar ? (
            <img
              src={app.avatar}
              alt={app.fullName || app.full_name}
              className="w-28 h-28 object-cover rounded-full border-4 border-blue-200 dark:border-slate-700 shadow-lg -mt-6"
            />
          ) : (
            <div className="w-28 h-28 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 dark:from-slate-700 dark:to-slate-900 text-4xl font-bold text-blue-700 dark:text-blue-200 rounded-full border-4 border-blue-200 dark:border-slate-700 shadow-lg -mt-6">
              {(app.fullName || app.full_name || '').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-2 text-center">{app.fullName || app.full_name}</h1>
          <div className="text-gray-500 dark:text-gray-400 text-sm">{app.type} arizasi</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <ReadOnlyInput label="Ism" value={firstName} />
          <ReadOnlyInput label="Familiya" value={lastName} />
          <ReadOnlyInput label="Otasining ismi" value={fatherName} />
          <ReadOnlyInput label="Telefon" value={app.phone} />
          <ReadOnlyInput label="Fakultet" value={app.faculty} />
          <ReadOnlyInput label="Yo'nalish" value={app.direction} />
          <ReadOnlyInput label="Guruh" value={app.group} />
          <ReadOnlyInput label="Viloyat" value={app.region} />
          <ReadOnlyInput label="Tuman yoki shahar" value={app.district} />
          <ReadOnlyInput label="Pasport" value={app.passport} />
          <ReadOnlyInput label="Kurs" value={app.course ? app.course + '-kurs' : ''} />
          <ReadOnlyInput label="Jinsi" value={app.gender} />
        </div>
        {app.comment && (
          <div className="bg-blue-50/50 dark:bg-slate-700/50 border border-blue-100 dark:border-slate-600 rounded-xl px-6 py-4 mt-4">
            <div className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-semibold">Izoh</div>
            <div className="text-base text-gray-800 dark:text-gray-200 font-medium break-words">{app.comment}</div>
          </div>
        )}
      </div>
      {/* Qabul qilish va rad etish tugmalari */}
      <div className="flex gap-3 mt-8 justify-end w-full max-w-3xl">
        <button className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors duration-200">Qabul qilish</button>
        <button className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors duration-200">Rad etish</button>
      </div>
    </motion.div>
  );
};

export default ApplicationDetail; 