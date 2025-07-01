import React from 'react';
import BackButton from '../components/UI/BackButton';

function ReadOnlyInput({ label, value }: { label: string; value?: string | number | boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{label}</label>
      <input
        className="bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-base font-medium cursor-default focus:outline-none focus:ring-2 focus:ring-blue-300"
        value={typeof value === 'boolean' ? (value ? 'Ha' : 'Yo\'q') : value || '-'}
        readOnly
        tabIndex={-1}
      />
    </div>
  );
}

const admin = {
  fullName: 'Adminov Admin',
  phone: '+998 90 123 45 67',
  email: 'admin@joybor.uz',
  role: 'Yotoqxona Admini',
  address: 'Toshkent shahri, TTU yotoqxonasi, 2-qavat',
  avatar: '',
};

const Profile: React.FC = () => {
  return (
    <div className="p-4 sm:p-8 w-full">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <BackButton className="w-max" />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin profili</h2>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 flex flex-col md:flex-row gap-10 w-full border border-gray-100 dark:border-slate-700">
        {/* Avatar and main info */}
        <div className="flex flex-col items-center gap-4 md:w-1/3">
          {admin.avatar ? (
            <img src={admin.avatar} alt={admin.fullName} className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-lg" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-5xl font-bold text-blue-600 shadow-lg">
              {admin.fullName[0]}
            </div>
          )}
          <div className="text-2xl font-semibold text-gray-900 dark:text-white text-center">{admin.fullName}</div>
          <div className="text-base text-gray-500 dark:text-gray-300 text-center">{admin.role}</div>
        </div>
        {/* Details */}
        <div className="flex-1 flex flex-col gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Admin ma'lumotlari</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <ReadOnlyInput label="F.I.Sh." value={admin.fullName} />
              <ReadOnlyInput label="Telefon raqami" value={admin.phone} />
              <ReadOnlyInput label="Email" value={admin.email} />
              <ReadOnlyInput label="Lavozimi" value={admin.role} />
              <ReadOnlyInput label="Manzil" value={admin.address} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 