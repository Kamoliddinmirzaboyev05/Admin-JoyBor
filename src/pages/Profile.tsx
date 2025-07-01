import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockStudents } from '../data/mockStudents';

const Profile: React.FC = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const student = mockStudents.find(s => s.id === studentId);

  if (!student) {
    return (
      <div className="p-8 text-center text-red-500">
        Talaba topilmadi. <button className="underline" onClick={() => navigate(-1)}>Orqaga qaytish</button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">&larr; Orqaga</button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Talaba profili</h2>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          {student.avatar ? (
            <img src={student.avatar} alt={student.fullName} className="w-24 h-24 rounded-full object-cover border-4 border-blue-200" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-600">
              {student.fullName[0]}
            </div>
          )}
          <div className="text-xl font-semibold text-gray-900 dark:text-white">{student.fullName}</div>
          <div className="text-sm text-gray-500 dark:text-gray-300">{student.faculty} | {student.group}</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 w-full mt-4">
          <ProfileField label="Xona" value={student.room} />
          <ProfileField label="Telefon" value={student.phone} />
          <ProfileField label="To'lov holati" value={student.paymentStatus === 'paid' ? 'To‘langan' : 'To‘lanmagan'} />
          <ProfileField label="Qo‘shilgan sana" value={student.joinedAt} />
          <ProfileField label="Tug‘ilgan sana" value={student.birthDate} />
          <ProfileField label="Manzil" value={student.address} />
          <ProfileField label="Viloyat/Shahar" value={student.region} />
          <ProfileField label="Tuman/Shaharcha" value={student.district} />
          <ProfileField label="Passport" value={student.passport} />
          <ProfileField label="Imtiyozli" value={student.isPrivileged ? 'Ha' : 'Yo‘q'} />
          {student.isPrivileged && student.privilegeShare && (
            <ProfileField label="Imtiyoz ulushi" value={student.privilegeShare + '%'} />
          )}
        </div>
      </div>
    </div>
  );
};

const ProfileField: React.FC<{ label: string; value?: string | number | boolean }> = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
    <span className="text-base text-gray-900 dark:text-white font-medium break-all">{value || '-'}</span>
  </div>
);

export default Profile; 