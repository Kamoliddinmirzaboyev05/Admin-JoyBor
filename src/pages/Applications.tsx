import React from 'react';
import { Link } from 'react-router-dom';

// Mock data for applications
const mockApplications = [
  {
    id: '1',
    fullName: 'Mirzaboyev Kamoliddin',
    phone: '+998889563848',
    date: '2024-06-01',
    status: 'Yangi',
    type: 'Yotoqxona',
  },
  {
    id: '2',
    fullName: 'Aliyev Doston',
    phone: '+998901234567',
    date: '2024-06-02',
    status: 'Ko‘rib chiqilmoqda',
    type: 'Yotoqxona',
  },
];

const statusColors = {
  'Yangi': 'bg-blue-100 text-blue-700',
  'Ko‘rib chiqilmoqda': 'bg-yellow-100 text-yellow-700',
  'Rad etilgan': 'bg-red-100 text-red-700',
  'Qabul qilindi': 'bg-green-100 text-green-700',
};

const Applications: React.FC = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Arizalar</h1>
      <div className="grid grid-cols-1 gap-6">
        {mockApplications.map(app => (
          <div key={app.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 flex flex-col md:flex-row md:items-center gap-4 border border-gray-100 dark:border-slate-700">
            <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{app.fullName}</div>
              <div className="text-gray-500 dark:text-gray-300">{app.phone}</div>
              <div className="text-gray-400 text-sm">{app.date}</div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[app.status] || 'bg-gray-100 text-gray-700'}`}>{app.status}</div>
            </div>
            <Link to={`/application/${app.id}`} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">Batafsil</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Applications; 