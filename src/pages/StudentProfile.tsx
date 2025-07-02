import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { mockStudents } from '../data/mockStudents';
import BackButton from '../components/UI/BackButton';
import { BadgeCheck } from 'lucide-react';

function ReadOnlyInput({ label, value }: { label: string; value?: string | number | boolean }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{label}</label>
      <input
        className="bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-base font-medium cursor-default focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
        value={typeof value === 'boolean' ? (value ? 'Ha' : 'Yo\'q') : value || '-'}
        readOnly
        tabIndex={-1}
      />
    </div>
  );
}

function EditableInput({ label, value, onChange, type = 'text' }: { label: string; value?: string | number; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{label}</label>
      <input
        className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        type={type}
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

  // Edit state
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(student ? { ...student, firstName, lastName, fatherName } : null);

  if (!student || !form) {
    return (
      <div className="p-8 text-center text-red-500">
        Talaba topilmadi. <BackButton label="Orqaga qaytish" className="mx-auto mt-4" />
      </div>
    );
  }

  const handleChange = (field: string, value: string) => {
    setForm(f => f ? { ...f, [field]: value } : f);
  };

  const handleSave = () => {
    // Here you would send the updated data to the backend
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-2 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 sm:p-8 border border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <BackButton label="Orqaga" />
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-7 h-7 text-blue-600 dark:text-blue-300" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Talaba profili</h1>
          </div>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            onClick={() => editMode ? handleSave() : setEditMode(true)}
          >
            {editMode ? 'Saqlash' : 'Tahrirlash'}
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          {/* Profil rasmi yoki avatar */}
          {form.avatar ? (
            <img
              src={form.avatar}
              alt={form.fullName}
              className="w-32 h-32 object-cover rounded-md border border-gray-200 dark:border-slate-600 shadow"
            />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center bg-gray-200 dark:bg-slate-700 text-5xl font-bold text-gray-500 dark:text-gray-400 rounded-md border border-gray-200 dark:border-slate-600 shadow">
              {form.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
          )}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            {editMode ? (
              <>
                <EditableInput label="Ism" value={form.firstName} onChange={v => handleChange('firstName', v)} />
                <EditableInput label="Familiya" value={form.lastName} onChange={v => handleChange('lastName', v)} />
                <EditableInput label="Otasining ismi" value={form.fatherName} onChange={v => handleChange('fatherName', v)} />
                <EditableInput label="Telefon" value={form.phone} onChange={v => handleChange('phone', v)} />
              </>
            ) : (
              <>
                <ReadOnlyInput label="Ism" value={form.firstName} />
                <ReadOnlyInput label="Familiya" value={form.lastName} />
                <ReadOnlyInput label="Otasining ismi" value={form.fatherName} />
                <ReadOnlyInput label="Telefon" value={form.phone} />
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          {editMode ? (
            <>
              <EditableInput label="Fakultet" value={form.faculty} onChange={v => handleChange('faculty', v)} />
              <EditableInput label="Yo'nalish" value={form.direction} onChange={v => handleChange('direction', v)} />
              <EditableInput label="Guruh" value={form.group} onChange={v => handleChange('group', v)} />
              <EditableInput label="Xona" value={form.room} onChange={v => handleChange('room', v)} />
              <EditableInput label="Qavat" value={form.floor} onChange={v => handleChange('floor', v)} />
              <EditableInput label="Viloyat" value={form.region} onChange={v => handleChange('region', v)} />
              <EditableInput label="Pasport" value={form.passport} onChange={v => handleChange('passport', v)} />
              <EditableInput label="Tug'ilgan sana" value={form.birthDate} onChange={v => handleChange('birthDate', v)} type="date" />
              <EditableInput label="Tuman yoki shahar" value={form.district} onChange={v => handleChange('district', v)} />
              <EditableInput label="Kurs" value={form.course} onChange={v => handleChange('course', v)} />
              <EditableInput label="Jinsi" value={form.gender} onChange={v => handleChange('gender', v)} />
              <EditableInput label="Imtiyoz (%)" value={form.isPrivileged ? String(form.privilegeShare ?? '') : ''} onChange={v => handleChange('privilegeShare', v)} />
            </>
          ) : (
            <>
              <ReadOnlyInput label="Fakultet" value={form.faculty} />
              <ReadOnlyInput label="Yo'nalish" value={form.direction} />
              <ReadOnlyInput label="Guruh" value={form.group} />
              <ReadOnlyInput label="Xona" value={form.room} />
              <ReadOnlyInput label="Qavat" value={form.floor} />
              <ReadOnlyInput label="Viloyat" value={form.region} />
              <ReadOnlyInput label="Pasport" value={form.passport} />
              <ReadOnlyInput label="Tug'ilgan sana" value={form.birthDate} />
              <ReadOnlyInput label="Tuman yoki shahar" value={form.district} />
              <ReadOnlyInput label="Kurs" value={form.course + '-kurs'} />
              <ReadOnlyInput label="Jinsi" value={form.gender} />
              <ReadOnlyInput label="Imtiyoz" value={form.isPrivileged ? (form.privilegeShare ? form.privilegeShare + '%' : '0%') : 'Yo\'q'} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile; 