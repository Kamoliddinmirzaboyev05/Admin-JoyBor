import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, Building2, CreditCard, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { get, api } from '../data/api';
import { link } from '../data/config';
import { formatCurrency } from '../utils/formatters';

// Mock data ni olib tashlaymiz, API dan foydalanamiz

const Reports: React.FC = () => {
  // const [selectedPeriod, setSelectedPeriod] = useState('month'); // Hozircha ishlatilmaydi
  const [search, setSearch] = useState('');

  // React Query bilan dashboard ma'lumotlarini olish
  const { 
    data: dashboardData, 
    isLoading: dashboardLoading 
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: api.getDashboard,
    staleTime: 1000 * 60 * 5, // 5 daqiqa cache
  });

  // React Query bilan recent activities ma'lumotlarini olish
  const { 
    data: recentActivities = [], 
    isLoading: recentActivitiesLoading 
  } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: async () => {
      const res = await get(`${link}/recent_activity/`);
      return Array.isArray(res.activities) ? res.activities : [];
    },
    staleTime: 1000 * 60 * 5, // 5 daqiqa cache
  });

  // Dashboard ma'lumotlarini ajratib olish
  const students = dashboardData?.students || { total: 0, male: 0, female: 0 };
  const rooms = dashboardData?.rooms || { 
    available_places_total: 0, 
    available_places_male: 0, 
    available_places_female: 0 
  };
  const payments = dashboardData?.payments || { total_payment: 0, debtor_students_count: 0, non_debtor_students_count: 0 };


  const filteredActions = recentActivities.filter((a: any) =>
    a.title?.toLowerCase().includes(search.toLowerCase()) ||
    a.desc?.toLowerCase().includes(search.toLowerCase()) ||
    a.time?.toLowerCase().includes(search.toLowerCase())
  );

  function getActivityIcon(type: string) {
    if (type === 'payment_approved') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (type === 'debt') return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    if (type === 'new_student') return <FileText className="w-5 h-5 text-blue-500" />;
    return <FileText className="w-5 h-5 text-gray-400" />;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hisobotlar</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Yotoqxona faoliyati hisobotlari va statistikalar
          </p>
        </div>
      </motion.div>
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-xl p-6 flex flex-col items-center text-white relative overflow-hidden group hover:scale-105 transition-transform duration-200">
            <Users className="w-8 h-8 mb-2 opacity-90" />
            <div className="text-xs uppercase tracking-wider font-semibold opacity-80">Jami talabalar</div>
            <div className="text-3xl font-extrabold mt-1">{dashboardLoading ? '...' : students.total}</div>
            <div className="text-xs mt-2 opacity-75 text-center">
              <div>Yigitlar: {dashboardLoading ? '...' : students.male}</div>
              <div>Qizlar: {dashboardLoading ? '...' : students.female}</div>
            </div>
            <div className="absolute right-2 bottom-2 opacity-10 text-7xl font-black select-none">{students.total}</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-green-400 to-blue-500 shadow-xl p-6 flex flex-col items-center text-white relative overflow-hidden group hover:scale-105 transition-transform duration-200">
            <CreditCard className="w-8 h-8 mb-2 opacity-90" />
            <div className="text-xs uppercase tracking-wider font-semibold opacity-80">Jami to‘lovlar</div>
            <div className="text-2xl font-extrabold mt-1">
              {dashboardLoading ? '...' : formatCurrency(payments.total_payment)}
            </div>
            <div className="text-xs mt-2 opacity-75 text-center">
              <div>Qarzdor: {dashboardLoading ? '...' : payments.debtor_students_count}</div>
              <div>To'lagan: {dashboardLoading ? '...' : payments.non_debtor_students_count}</div>
            </div>
            <div className="absolute right-2 bottom-2 opacity-10 text-7xl font-black select-none">💸</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 shadow-xl p-6 flex flex-col items-center text-white relative overflow-hidden group hover:scale-105 transition-transform duration-200">
            <Building2 className="w-8 h-8 mb-2 opacity-90" />
            <div className="text-xs uppercase tracking-wider font-semibold opacity-80">Bo'sh joylar</div>
            <div className="text-3xl font-extrabold mt-1">{dashboardLoading ? '...' : rooms.available_places_total}</div>
            <div className="text-xs mt-2 opacity-75 text-center">
              <div>Yigitlar: {dashboardLoading ? '...' : rooms.available_places_male}</div>
              <div>Qizlar: {dashboardLoading ? '...' : rooms.available_places_female}</div>
            </div>
            <div className="absolute right-2 bottom-2 opacity-10 text-7xl font-black select-none">🏠</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-pink-500 to-red-500 shadow-xl p-6 flex flex-col items-center text-white relative overflow-hidden group hover:scale-105 transition-transform duration-200">
            <AlertTriangle className="w-8 h-8 mb-2 opacity-90" />
            <div className="text-xs uppercase tracking-wider font-semibold opacity-80">Qarzdorlar</div>
            <div className="text-3xl font-extrabold mt-1 text-yellow-200">{dashboardLoading ? '...' : payments.debtor_students_count}</div>
            <div className="text-xs mt-2 opacity-75 text-center">
              <div>To'lagan: {dashboardLoading ? '...' : payments.non_debtor_students_count}</div>
            </div>
            <div className="absolute right-2 bottom-2 opacity-10 text-7xl font-black select-none">⚠️</div>
          </div>
        </div>
        {/* Search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidiruv..." className="border border-blue-200 dark:border-gray-700 rounded-lg px-4 py-2 w-full sm:w-80 text-base shadow focus:ring-2 focus:ring-blue-400 focus:border-transparent transition" />
        </div>
        {/* Actions Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xl">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800 text-base">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950">
              <tr>
                <th className="px-5 py-3 text-left font-bold text-gray-700 dark:text-gray-200">Amal</th>
                <th className="px-5 py-3 text-left font-bold text-gray-700 dark:text-gray-200">Tafsilot</th>
                <th className="px-5 py-3 text-left font-bold text-gray-700 dark:text-gray-200">Vaqt</th>
              </tr>
            </thead>
            <tbody>
              {recentActivitiesLoading ? (
                <tr><td colSpan={3} className="text-center text-gray-400 dark:text-gray-500 py-8 text-lg bg-white dark:bg-gray-950">Yuklanmoqda...</td></tr>
              ) : filteredActions.length === 0 ? (
                <tr><td colSpan={3} className="text-center text-gray-400 dark:text-gray-500 py-8 text-lg bg-white dark:bg-gray-950">Hech qanday amal topilmadi</td></tr>
              ) : filteredActions.map((a: any, idx: number) => (
                <tr key={idx} className={`transition hover:bg-blue-50 dark:hover:bg-gray-900 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-blue-50/40 dark:bg-gray-900/60'}`}>
                  <td className="px-5 py-3 flex items-center gap-3 font-semibold text-gray-800 dark:text-gray-100">{getActivityIcon(a.type)}{a.title}</td>
                  <td className="px-5 py-3 text-gray-700 dark:text-gray-200">{a.desc}</td>
                  <td className="px-5 py-3 text-gray-700 dark:text-gray-200">{a.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  );
};

export default Reports; 