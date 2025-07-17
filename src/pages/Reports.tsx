import React, { useState } from 'react';
import { Calendar, Users, CreditCard, Home, Edit, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const mockStats = {
  totalStudents: 245,
  totalPayments: '120,500,000 so‘m',
  totalRooms: 48,
  totalDebtors: 17,
};

const mockActions = [
  { id: 1, type: 'Talaba qo‘shildi', user: 'Ali Valiyev', date: '2024-06-01', details: 'Yangi talaba qo‘shildi', icon: <Plus className="w-5 h-5 text-green-500" /> },
  { id: 2, type: 'To‘lov', user: 'Dilshod Karimov', date: '2024-06-01', details: 'To‘lov qabul qilindi: 1,200,000 so‘m', icon: <CreditCard className="w-5 h-5 text-blue-500" /> },
  { id: 3, type: 'Talaba tahrirlandi', user: 'Aziza Qodirova', date: '2024-05-30', details: 'Talaba maʼlumotlari o‘zgartirildi', icon: <Edit className="w-5 h-5 text-yellow-500" /> },
  { id: 4, type: 'Talaba o‘chirildi', user: 'Jasur Tursunov', date: '2024-05-29', details: 'Talaba tizimdan o‘chirildi', icon: <Trash2 className="w-5 h-5 text-red-500" /> },
  { id: 5, type: 'To‘lov', user: 'Ali Valiyev', date: '2024-05-28', details: 'To‘lov qabul qilindi: 900,000 so‘m', icon: <CreditCard className="w-5 h-5 text-blue-500" /> },
  { id: 6, type: 'Talaba qo‘shildi', user: 'Madina Ergasheva', date: '2024-05-27', details: 'Yangi talaba qo‘shildi', icon: <Plus className="w-5 h-5 text-green-500" /> },
];

const Reports: React.FC = () => {
  const [search, setSearch] = useState('');

  const filteredActions = mockActions.filter(a =>
    a.user.toLowerCase().includes(search.toLowerCase()) ||
    a.type.toLowerCase().includes(search.toLowerCase()) ||
    a.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-900 py-0"
    >
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center gap-4">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg">
            <Calendar className="w-7 h-7" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Hisobotlar</h1>
        </div>
      </div>
      <div className="max-w-6xl mx-auto w-full px-2 sm:px-6 py-8 bg-white dark:bg-gray-900/80 rounded-2xl shadow-none">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-xl p-6 flex flex-col items-center text-white relative overflow-hidden">
            <Users className="w-8 h-8 mb-2 opacity-90" />
            <div className="text-xs uppercase tracking-wider font-semibold opacity-80">Jami talabalar</div>
            <div className="text-3xl font-extrabold mt-1">{mockStats.totalStudents}</div>
            <div className="absolute right-2 bottom-2 opacity-10 text-7xl font-black select-none">{mockStats.totalStudents}</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-green-400 to-blue-500 shadow-xl p-6 flex flex-col items-center text-white relative overflow-hidden">
            <CreditCard className="w-8 h-8 mb-2 opacity-90" />
            <div className="text-xs uppercase tracking-wider font-semibold opacity-80">Jami to‘lovlar</div>
            <div className="text-3xl font-extrabold mt-1">{mockStats.totalPayments}</div>
            <div className="absolute right-2 bottom-2 opacity-10 text-7xl font-black select-none">💸</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 shadow-xl p-6 flex flex-col items-center text-white relative overflow-hidden">
            <Home className="w-8 h-8 mb-2 opacity-90" />
            <div className="text-xs uppercase tracking-wider font-semibold opacity-80">Xonalar</div>
            <div className="text-3xl font-extrabold mt-1">{mockStats.totalRooms}</div>
            <div className="absolute right-2 bottom-2 opacity-10 text-7xl font-black select-none">🏠</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-pink-500 to-red-500 shadow-xl p-6 flex flex-col items-center text-white relative overflow-hidden">
            <Users className="w-8 h-8 mb-2 opacity-90" />
            <div className="text-xs uppercase tracking-wider font-semibold opacity-80">Qarzdorlar</div>
            <div className="text-3xl font-extrabold mt-1 text-yellow-200">{mockStats.totalDebtors}</div>
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
                <th className="px-5 py-3 text-left font-bold text-gray-700 dark:text-gray-200">Foydalanuvchi</th>
                <th className="px-5 py-3 text-left font-bold text-gray-700 dark:text-gray-200">Sana</th>
                <th className="px-5 py-3 text-left font-bold text-gray-700 dark:text-gray-200">Tafsilot</th>
              </tr>
            </thead>
            <tbody>
              {filteredActions.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-gray-400 dark:text-gray-500 py-8 text-lg bg-white dark:bg-gray-950">Hech qanday amal topilmadi</td></tr>
              ) : filteredActions.map((a, idx) => (
                <tr key={a.id} className={`transition hover:bg-blue-50 dark:hover:bg-gray-900 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-blue-50/40 dark:bg-gray-900/60'}`}>
                  <td className="px-5 py-3 flex items-center gap-3 font-semibold text-gray-800 dark:text-gray-100">{a.icon}{a.type}</td>
                  <td className="px-5 py-3 text-gray-700 dark:text-gray-200">{a.user}</td>
                  <td className="px-5 py-3 text-gray-700 dark:text-gray-200">{a.date}</td>
                  <td className="px-5 py-3 text-gray-700 dark:text-gray-200">{a.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Reports; 