import React from 'react';
import { useParams } from 'react-router-dom';
import { mockStudents } from '../data/mockStudents';
import BackButton from '../components/UI/BackButton';
import { BadgeCheck } from 'lucide-react';

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

const StudentProfile: React.FC = () => {
  const { studentId } = useParams();
  const student = mockStudents.find(s => s.id === studentId);

  const getNameParts = (fullName: string) => {
    const parts = fullName.split(' ');
    return {
      lastName: parts[0] || '-',
      firstName: parts[1] || '-',
      fatherName: parts.slice(2).join(' ') || '-',
    };
  };
  const { lastName, firstName, fatherName } = student ? getNameParts(student.fullName) : { lastName: '-', firstName: '-', fatherName: '-' };

  if (!student) {
    return (
      <div className="p-8 text-center text-red-500">
        Talaba topilmadi. <BackButton label="Orqaga qaytish" className="mx-auto mt-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
      <div className="max-w-4xl mx-auto w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-4 mb-8">
          <BadgeCheck className="w-8 h-8 text-blue-600 dark:text-blue-300" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Talaba profili</h1>
          <span className="ml-4 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-semibold">Talaba</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="mb-4">
              <div className="text-gray-500 dark:text-gray-400 text-xs">Ism</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{firstName}</div>
            </div>
            <div className="mb-4">
              <div className="text-gray-500 dark:text-gray-400 text-xs">Familiya</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{lastName}</div>
            </div>
            <div className="mb-4">
              <div className="text-gray-500 dark:text-gray-400 text-xs">Otasining ismi</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{fatherName}</div>
            </div>
            <div className="mb-4">
              <div className="text-gray-500 dark:text-gray-400 text-xs">Telefon</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{student.phone}</div>
            </div>
            <div className="mb-4">
              <div className="text-gray-500 dark:text-gray-400 text-xs">Xona</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{student.room}</div>
            </div>
          </div>
          <div>
            <div className="mb-4">
              <div className="text-gray-500 dark:text-gray-400 text-xs">Viloyat</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{student.region}</div>
            </div>
            <div className="mb-4">
              <div className="text-gray-500 dark:text-gray-400 text-xs">Pasport</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{student.passport}</div>
            </div>
            <div className="mb-4">
              <div className="text-gray-500 dark:text-gray-400 text-xs">Tug'ilgan sana</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{student.birthDate}</div>
            </div>
            <div className="mb-4">
              <div className="text-gray-500 dark:text-gray-400 text-xs">Manzil</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{student.address}</div>
            </div>
            <div className="mb-4">
              <div className="text-gray-500 dark:text-gray-400 text-xs">OTM</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{student.university}</div>
            </div>
            <div className="mb-4">
              <div className="text-gray-500 dark:text-gray-400 text-xs">Kurs</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{student.course}-kurs</div>
            </div>
            <div className="mb-4">
              <div className="text-gray-500 dark:text-gray-400 text-xs">Jinsi</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{student.gender}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile; 