import React, { useState } from 'react';
import { Calendar, Users, CreditCard, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const mockStats = [
  { icon: <Users className="w-6 h-6" />, label: 'Jami talabalar', value: 120 },
  { icon: <CreditCard className="w-6 h-6" />, label: 'Jami to‘lovlar', value: '36 000 000 so‘m' },
  { icon: <Home className="w-6 h-6" />, label: 'Xonalar', value: 24 },
];

const mockTransactions = [
  { id: 1, student: 'Kamoliddin Mirzaboyev', amount: '1 200 000 so‘m', date: '2024-06-01', type: 'To‘lov', status: 'Qabul qilindi' },
  { id: 2, student: 'Doston Aliyev', amount: '1 200 000 so‘m', date: '2024-06-01', type: 'To‘lov', status: 'Qabul qilindi' },
  { id: 3, student: 'Akmal Karimov', amount: '1 200 000 so‘m', date: '2024-05-28', type: 'To‘lov', status: 'Qabul qilindi' },
];

const Reports: React.FC = () => {
  const [date, setDate] = useState('');
  const [search, setSearch] = useState('');

  const filteredTransactions = mockTransactions.filter(t =>
    (!date || t.date === date) &&
    (!search || t.student.toLowerCase().includes(search.toLowerCase()))
  );

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
          {mockStats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 flex items-center gap-4 border border-gray-100 dark:border-slate-700">
              <span className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200">{stat.icon}</span>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <input
            type="text"
            placeholder="Talaba ismi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-100 dark:border-slate-700 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Talaba</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Miqdori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sana</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Turi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map((t) => (
                <tr key={t.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{t.student}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-semibold">{t.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{t.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{t.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">{t.status}</span>
                  </td>
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