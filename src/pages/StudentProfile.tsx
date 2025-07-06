import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    setError("");
    const token = localStorage.getItem("access");
    const headers: HeadersInit = token ? { "Authorization": `Bearer ${token}` } : {};
    fetch(`https://joyboryangi.pythonanywhere.com/students/${studentId}/`, { headers })
      .then(res => {
        if (!res.ok) throw new Error("Talaba topilmadi");
        return res.json();
      })
      .then(data => {
        setStudent(data);
        setForm(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div></div>;
  }
  if (error || !student || !form) {
    return (
      <div className="p-8 text-center text-red-500">
        {error || 'Talaba topilmadi.'} <BackButton label="Orqaga qaytish" className="mx-auto mt-4" />
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
              alt={form.name}
              className="w-32 h-32 object-cover rounded-md border border-gray-200 dark:border-slate-600 shadow"
            />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center bg-gray-200 dark:bg-slate-700 text-5xl font-bold text-gray-500 dark:text-gray-400 rounded-md border border-gray-200 dark:border-slate-600 shadow">
              {form.name && form.last_name
                ? `${form.name[0] || ''}${form.last_name[0] || ''}`
                : ''}
            </div>
          )}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            {editMode ? (
              <>
                <EditableInput label="Ism" value={form.name} onChange={v => handleChange('name', v)} />
                <EditableInput label="Familiya" value={form.last_name} onChange={v => handleChange('last_name', v)} />
                <EditableInput label="Otasining ismi" value={form.middle_name} onChange={v => handleChange('middle_name', v)} />
                <EditableInput label="Telefon" value={form.phone} onChange={v => handleChange('phone', v)} />
              </>
            ) : (
              <>
                <ReadOnlyInput label="Ism" value={form.name} />
                <ReadOnlyInput label="Familiya" value={form.last_name} />
                <ReadOnlyInput label="Otasining ismi" value={form.middle_name} />
                <ReadOnlyInput label="Telefon" value={form.phone} />
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mt-6">
          {editMode ? (
            <>
              <EditableInput label="Fakultet" value={form.faculty} onChange={v => handleChange('faculty', v)} />
              <EditableInput label="Yo'nalish" value={form.direction} onChange={v => handleChange('direction', v)} />
              <EditableInput label="Guruh" value={form.group || ''} onChange={v => handleChange('group', v)} />
              <EditableInput label="Xona" value={form.room?.name || ''} onChange={v => handleChange('room', v)} />
              <EditableInput label="Qavat" value={form.floor?.name || ''} onChange={v => handleChange('floor', v)} />
              <EditableInput label="Viloyat" value={form.province?.name || ''} onChange={v => handleChange('province', v)} />
              <EditableInput label="Tuman" value={form.district?.name || ''} onChange={v => handleChange('district', v)} />
              <EditableInput label="Pasport" value={form.passport || ''} onChange={v => handleChange('passport', v)} />
              <EditableInput label="Tarif" value={form.tarif || ''} onChange={v => handleChange('tarif', v)} />
              <EditableInput label="Imtiyoz" value={form.imtiyoz || ''} onChange={v => handleChange('imtiyoz', v)} />
              <EditableInput label="Qabul qilingan sana" value={form.accepted_date || ''} onChange={v => handleChange('accepted_date', v)} />
              <EditableInput label="Jami to'lov" value={form.total_payment || ''} onChange={v => handleChange('total_payment', v)} />
            </>
          ) : (
            <>
              <ReadOnlyInput label="Fakultet" value={form.faculty} />
              <ReadOnlyInput label="Yo'nalish" value={form.direction} />
              <ReadOnlyInput label="Guruh" value={form.group} />
              <ReadOnlyInput label="Xona" value={form.room?.name} />
              <ReadOnlyInput label="Qavat" value={form.floor?.name} />
              <ReadOnlyInput label="Viloyat" value={form.province?.name} />
              <ReadOnlyInput label="Tuman" value={form.district?.name} />
              <ReadOnlyInput label="Pasport" value={form.passport} />
              <ReadOnlyInput label="Tarif" value={form.tarif} />
              <ReadOnlyInput label="Imtiyoz" value={form.imtiyoz} />
              <ReadOnlyInput label="Qabul qilingan sana" value={form.accepted_date} />
              <ReadOnlyInput label="Jami to'lov" value={form.total_payment} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile; 