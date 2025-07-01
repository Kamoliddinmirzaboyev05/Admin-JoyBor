import React from 'react';
import { useParams } from 'react-router-dom';
import BackButton from '../components/UI/BackButton';

// Mock data for applications
const mockApplications = [
  {
    id: '1',
    fullName: 'Mirzaboyev Kamoliddin',
    phone: '+998889563848',
    date: '2024-06-01',
    status: 'Yangi',
    type: 'Yotoqxona',
    passport: 'AA 1234567',
    address: 'Andijon, Oltinko‘l',
    comment: 'Tezroq javob kutaman',
  },
  {
    id: '2',
    fullName: 'Aliyev Doston',
    phone: '+998901234567',
    date: '2024-06-02',
    status: 'Ko‘rib chiqilmoqda',
    type: 'Yotoqxona',
    passport: 'AB 7654321',
    address: 'Toshkent, Yunusobod',
    comment: '',
  },
];

const statusColors = {
  'Yangi': 'bg-blue-100 text-blue-700',
  'Ko‘rib chiqilmoqda': 'bg-yellow-100 text-yellow-700',
  'Rad etilgan': 'bg-red-100 text-red-700',
  'Qabul qilindi': 'bg-green-100 text-green-700',
};

const ApplicationDetail: React.FC = () => {
  const { id } = useParams();
  const app = mockApplications.find(a => a.id === id);

  if (!app) {
    return (
      <div className="p-8 text-center text-red-500">
        Ariza topilmadi. <BackButton label="Orqaga qaytish" className="mx-auto mt-4" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto w-full">
      <div className="mb-6 flex items-center gap-4">
        <BackButton />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ariza tafsilotlari</h1>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-8 border border-gray-100 dark:border-slate-700 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <DetailField label="F.I.Sh." value={app.fullName} />
          <DetailField label="Telefon raqami" value={app.phone} />
          <DetailField label="Ariza turi" value={app.type} />
          <DetailField label="Passport" value={app.passport} />
          <DetailField label="Manzil" value={app.address} />
          <DetailField label="Yuborilgan sana" value={app.date} />
          <DetailField label="Status" value={<span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[app.status]}`}>{app.status}</span>} />
        </div>
        {app.comment && (
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Izoh</div>
            <div className="bg-gray-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-base font-medium">{app.comment}</div>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailField: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs text-gray-400 dark:text-gray-500 mb-1">{label}</span>
    <span className="text-base text-gray-900 dark:text-white font-medium break-all">{value || '-'}</span>
  </div>
);

export default ApplicationDetail; 