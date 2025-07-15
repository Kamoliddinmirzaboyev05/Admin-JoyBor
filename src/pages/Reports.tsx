import React, { useState } from 'react';
import { Calendar, Users, CreditCard, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { apiQueries } from '../data/api';

const Reports: React.FC = () => {
  const [date, setDate] = useState('');
  const [search, setSearch] = useState('');

  // Fetch stats and transactions from API
  const { data: stats = {}, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['reportsStats'],
    queryFn: apiQueries.getReportsStats,
    staleTime: 1000 * 60 * 5,
  });
  const { data: transactions = [], isLoading: txLoading, error: txError } = useQuery({
    queryKey: ['transactions'],
    queryFn: apiQueries.getTransactions,
    staleTime: 1000 * 60 * 5,
  });

  const filteredTransactions = transactions.filter((t: any) =>
    (!date || t.date === date) &&
    (!search || t.student.toLowerCase().includes(search.toLowerCase()))
  );

  if (statsLoading || txLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div></div>;
  }
  if (statsError || txError) {
    return <div className="text-center py-10 text-red-600 dark:text-red-400">Hisobotlarni yuklashda xatolik yuz berdi.</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10"
    >
      <div className="max-w-5xl mx-auto w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-slate-700">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Hisobotlar</h1>
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {/* Example: stats.totalStudents, stats.totalPayments, stats.totalRooms */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 flex items-center gap-4 border border-gray-100 dark:border-slate-700">
            <span className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200"><Users className="w-6 h-6" /></span>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Jami talabalar</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalStudents}</div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 flex items-center gap-4 border border-gray-100 dark:border-slate-700">
            <span className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200"><CreditCard className="w-6 h-6" /></span>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Jami to‘lovlar</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPayments}</div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 flex items-center gap-4 border border-gray-100 dark:border-slate-700">
            <span className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200"><Home className="w-6 h-6" /></span>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Xonalar</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRooms}</div>
            </div>
          </div>
        </div>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded px-3 py-2" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Talaba ismi..." className="border rounded px-3 py-2" />
        </div>
        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2">Talaba</th>
                <th className="px-4 py-2">Miqdor</th>
                <th className="px-4 py-2">Sana</th>
                <th className="px-4 py-2">Turi</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-gray-400 py-6">Tranzaksiyalar topilmadi</td></tr>
              ) : filteredTransactions.map((t: any) => (
                <tr key={t.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2">{t.student}</td>
                  <td className="px-4 py-2">{t.amount}</td>
                  <td className="px-4 py-2">{t.date}</td>
                  <td className="px-4 py-2">{t.type}</td>
                  <td className="px-4 py-2">{t.status}</td>
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