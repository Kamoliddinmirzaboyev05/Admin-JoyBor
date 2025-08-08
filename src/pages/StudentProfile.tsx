import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BackButton from '../components/UI/BackButton';
import { BadgeCheck, Calendar, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiQueries } from '../data/api';
import { link } from '../data/config';
import axios from 'axios';
import { toast } from 'sonner';
import Select from 'react-select';

// react-select custom styles for dark mode
const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    backgroundColor: 'var(--tw-bg-opacity,1) #fff',
    borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 2px #3b82f6' : undefined,
    minHeight: 40,
    fontSize: 15,
    ...(document.documentElement.classList.contains('dark') && {
      backgroundColor: '#1f2937',
      color: '#fff',
      borderColor: state.isFocused ? '#60a5fa' : '#374151',
    })
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
    color: document.documentElement.classList.contains('dark') ? '#fff' : '#111827',
  }),
  singleValue: (base: any) => ({
    ...base,
    color: document.documentElement.classList.contains('dark') ? '#fff' : '#111827',
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? (document.documentElement.classList.contains('dark') ? '#2563eb' : '#3b82f6')
      : state.isFocused
        ? (document.documentElement.classList.contains('dark') ? '#374151' : '#e0e7ef')
        : 'transparent',
    color: state.isSelected || document.documentElement.classList.contains('dark') ? '#fff' : '#111827',
    cursor: 'pointer',
  }),
};

// Format date to a more readable format (DD.MM.YYYY)
const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  } catch (e) {
    return dateString;
  }
};

// Format currency with thousand separators
const formatCurrency = (amount?: string | number) => {
  if (amount === undefined || amount === null || amount === '') return '-';

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return amount;

  return numAmount.toLocaleString('uz-UZ') + ' so\'m';
};

function ReadOnlyInput({ label, value, type }: { label: string; value?: string | number | boolean; type?: 'date' | 'currency' | 'default' }) {
  let displayValue = typeof value === 'boolean' ? (value ? 'Ha' : 'Yo\'q') : value || '-';

  // Format based on type
  if (type === 'date') {
    displayValue = formatDate(displayValue as string);
  } else if (type === 'currency') {
    displayValue = formatCurrency(displayValue as string | number);
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{label}</label>
      <div className={`bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-base font-medium cursor-default focus:outline-none focus:ring-2 focus:ring-blue-300 w-full flex items-center ${type === 'date' || type === 'currency' ? 'text-blue-600 dark:text-blue-300' : ''}`}>
        {type === 'date' && <Calendar className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />}
        {type === 'currency' && <span className="mr-2 text-green-500 dark:text-green-400">₩</span>}
        {displayValue}
      </div>
    </div>
  );
}

function EditableInput({ label, value, onChange, type = 'text' }: { label: string; value?: string | number; onChange: (v: string) => void; type?: string }) {
  // Convert date format for date inputs (YYYY-MM-DD for HTML date input)
  let inputValue = value ?? '';
  let inputType = type;

  if (type === 'date' && typeof value === 'string') {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        inputValue = date.toISOString().split('T')[0];
      }
    } catch (e) {
      // Keep original value if parsing fails
    }
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{label}</label>
      <input
        className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
        value={inputValue}
        onChange={e => onChange(e.target.value)}
        type={inputType}
      />
    </div>
  );
}

const StudentProfile: React.FC = () => {
  const { studentId } = useParams();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Record<string, unknown> | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // States for dropdown data
  const [provinces, setProvinces] = useState<{ id: number; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: number; name: string; province: number }[]>([]);
  const [floors, setFloors] = useState<{ id: number; name: string }[]>([]);
  const [rooms, setRooms] = useState<{ id: number; name: string; floor: number }[]>([]);

  // React Query bilan student profilini olish
  const {
    data: student,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['studentProfile', studentId],
    queryFn: () => apiQueries.getStudentProfile(studentId!),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
  });

  React.useEffect(() => {
    if (student) {
      setForm({
        ...student,
        course: student.course || '1-kurs',
        gender: student.gender || 'Erkak',
      });
    }
  }, [student]);

  // Fetch provinces
  useEffect(() => {
    const token = sessionStorage.getItem("access");
    const headers: HeadersInit = token ? { "Authorization": `Bearer ${token}` } : {};
    fetch(`${link}/provinces/`, { headers })
      .then(res => {
        if (!res.ok) throw new Error("Viloyatlarni yuklashda xatolik");
        return res.json();
      })
      .then(data => setProvinces(data))
      .catch(() => setProvinces([]));
  }, []);

  // Fetch available floors (only floors with empty rooms)
  useEffect(() => {
    const token = sessionStorage.getItem("access");
    const headers: HeadersInit = token ? { "Authorization": `Bearer ${token}` } : {};
    fetch(`${link}/available-floors/`, { headers })
      .then(res => {
        if (!res.ok) throw new Error("Qavatlarni yuklashda xatolik");
        return res.json();
      })
      .then(data => setFloors(data))
      .catch(() => setFloors([]));
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    const currentProvince = form?.province;
    const provinceId = typeof currentProvince === 'object' && currentProvince ? (currentProvince as any).id : null;

    if (!provinceId) {
      setDistricts([]);
      return;
    }

    const token = sessionStorage.getItem("access");
    const headers: HeadersInit = token ? { "Authorization": `Bearer ${token}` } : {};
    fetch(`${link}/districts/?province=${provinceId}`, { headers })
      .then(res => {
        if (!res.ok) throw new Error("Tumanlarni yuklashda xatolik");
        return res.json();
      })
      .then(data => setDistricts(data))
      .catch(() => setDistricts([]));
  }, [form?.province]);

  // Fetch available rooms when floor changes (only empty rooms)
  useEffect(() => {
    const currentFloor = form?.floor;
    const floorId = typeof currentFloor === 'object' && currentFloor ? (currentFloor as any).id : null;

    if (!floorId) {
      setRooms([]);
      return;
    }

    const token = sessionStorage.getItem("access");
    const headers: HeadersInit = token ? { "Authorization": `Bearer ${token}` } : {};
    fetch(`${link}/available-rooms/?floor=${floorId}`, { headers })
      .then(res => {
        if (!res.ok) throw new Error("Xonalarni yuklashda xatolik");
        return res.json();
      })
      .then(data => setRooms(data))
      .catch(() => setRooms([]));
  }, [form?.floor]);

  // Create options for dropdowns
  const provinceOptions = provinces.map(p => ({ value: p.id, label: p.name }));
  const districtOptions = districts.map(d => ({ value: d.id, label: d.name }));
  const floorOptions = floors.map(f => ({ value: f.id, label: f.name }));
  const roomOptions = rooms.map(r => ({ value: r.id, label: r.name }));

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div></div>;
  }
  if (error || !student || !form) {
    return (
      <div className="p-8 text-center text-red-500">
        {error ? 'Maʼlumotlarni yuklashda xatolik.' : 'Talaba topilmadi.'} <BackButton label="Orqaga qaytish" className="mx-auto mt-4" />
      </div>
    );
  }

  const handleChange = (field: string, value: string) => {
    setForm(f => f ? { ...f, [field]: value } : f);
  };

  const handleSelectChange = (field: string, option: { value: number; label: string } | null) => {
    if (!option) {
      setForm(f => f ? { ...f, [field]: null } : f);
      return;
    }

    // Create object with id and name for consistency with existing data structure
    const selectedValue = { id: option.value, name: option.label };
    setForm(f => f ? { ...f, [field]: selectedValue } : f);
  };

  const handleSave = async () => {
    if (!studentId || !form) return;

    // Prepare minimal payload - only send fields that might have changed
    const payload: any = {};

    // Basic fields
    if (form.name) payload.name = form.name;
    if (form.last_name) payload.last_name = form.last_name;
    if (form.middle_name) payload.middle_name = form.middle_name;
    if (form.phone) payload.phone = form.phone;
    if (form.faculty) payload.faculty = form.faculty;
    if (form.direction) payload.direction = form.direction;
    if (form.group) payload.group = form.group;
    if (form.passport) payload.passport = form.passport;

    // Boolean and enum fields with defaults
    payload.privilege = form.imtiyoz ? true : false;
    payload.course = (form as any).course || '1-kurs';
    payload.gender = (form as any).gender || 'Erkak';

    // Location fields - only if they have valid IDs
    if (form.province && typeof form.province === 'object' && (form.province as any).id) {
      payload.province = Number((form.province as any).id);
    }

    if (form.district && typeof form.district === 'object' && (form.district as any).id) {
      payload.district = Number((form.district as any).id);
    }

    // Include room and floor if they are selected (using available endpoints ensures no capacity errors)
    // Only include if they are different from original values to avoid unnecessary updates
    const originalStudent = student as any;

    if (form.floor && typeof form.floor === 'object' && (form.floor as any).id) {
      const newFloorId = Number((form.floor as any).id);
      const originalFloorId = originalStudent?.floor?.id;
      if (newFloorId !== originalFloorId) {
        payload.floor = newFloorId;
        console.log('Floor changed from', originalFloorId, 'to', newFloorId);
      }
    }

    if (form.room && typeof form.room === 'object' && (form.room as any).id) {
      const newRoomId = Number((form.room as any).id);
      const originalRoomId = originalStudent?.room?.id;
      if (newRoomId !== originalRoomId) {
        payload.room = newRoomId;
        console.log('Room changed from', originalRoomId, 'to', newRoomId);
      }
    }

    console.log('Room and floor handling completed');

    console.log('=== STUDENT PROFILE UPDATE DEBUG ===');
    console.log('Original student data:', JSON.stringify(student, null, 2));
    console.log('Original form data:', JSON.stringify(form, null, 2));
    console.log('Sending payload:', JSON.stringify(payload, null, 2));
    console.log('Student ID:', studentId);
    console.log('Full URL:', `${link}/students/${studentId}/`);
    console.log('Token exists:', !!sessionStorage.getItem('access'));

    try {
      const token = sessionStorage.getItem('access');
      console.log('Making request...');
      const response = await axios.patch(
        `${link}/students/${studentId}/`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Success! Response:', response.data);
      toast.success('Talaba maʼlumotlari saqlandi!');
      setEditMode(false);

      // Cache ni yangilash - barcha bog'liq ma'lumotlarni yangilash
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['floors'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });

      refetch();
    } catch (error: any) {
      console.error('Save error:', error);
      console.error('Error response:', JSON.stringify(error.response?.data, null, 2));
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      console.error('Request payload was:', JSON.stringify(payload, null, 2));

      // Try to get more details from server response
      if (error.response?.data) {
        console.error('Raw error data:', error.response.data);
        if (typeof error.response.data === 'string') {
          console.error('Error data as string:', error.response.data.substring(0, 500));
        }
      }

      let errorMessage = 'Noma\'lum xatolik';

      if (error.response?.status === 500) {
        // If 500 error and we included room/floor, try again without them
        if (payload.room || payload.floor) {
          console.log('500 error with room/floor, retrying without them...');
          const retryPayload = { ...payload };
          delete retryPayload.room;
          delete retryPayload.floor;

          try {
            const token = sessionStorage.getItem('access');
            const retryResponse = await axios.patch(
              `${link}/students/${studentId}/`,
              retryPayload,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            console.log('Retry success! Response:', retryResponse.data);
            toast.success('Talaba maʼlumotlari saqlandi! (Xona o\'zgartirilmadi)');
            setEditMode(false);
            refetch();
            return; // Exit early on success
          } catch (retryError) {
            console.error('Retry also failed:', retryError);
            errorMessage = 'Server xatoligi. Xona o\'zgartirishda muammo bo\'lishi mumkin.';
          }
        } else {
          errorMessage = 'Server xatoligi. Iltimos, keyinroq qayta urinib ko\'ring.';
        }
      } else if (error.response?.data) {
        const errorData = error.response.data;

        // Check if response is HTML (server error page)
        if (typeof errorData === 'string' && errorData.includes('<html>')) {
          errorMessage = 'Server xatoligi yuz berdi. Iltimos, admin bilan bog\'laning.';
        } else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
          const roomError = errorData.non_field_errors.find((err: string) =>
            err.includes('xona to\'lgan') || err.includes('room is full')
          );
          if (roomError) {
            errorMessage = roomError;
          } else {
            errorMessage = errorData.non_field_errors.join('; ');
          }
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else {
          // Show all field errors
          const fieldErrors = [];
          for (const [field, errors] of Object.entries(errorData)) {
            if (Array.isArray(errors)) {
              fieldErrors.push(`${field}: ${errors.join(', ')}`);
            } else if (typeof errors === 'string') {
              fieldErrors.push(`${field}: ${errors}`);
            }
          }
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join('; ');
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(`Xatolik: ${errorMessage}`);
    }
  };

  const handleDelete = async () => {
    if (!studentId) return;

    setDeleting(true);
    try {
      const token = sessionStorage.getItem('access');
      const response = await axios.delete(
        `${link}/students/${studentId}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      toast.success('Talaba muvaffaqiyatli o\'chirildi!');

      // Cache ni yangilash
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['floors'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });

      // Students sahifasiga qaytish
      window.location.href = '/students';
    } catch (error: any) {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Talabani o\'chirishda xatolik yuz berdi!';
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 px-1 sm:px-2 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-2 sm:p-6 md:p-8 border border-gray-100 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <BackButton label="Orqaga" />

          <div className="flex items-center gap-2 justify-center">
            <BadgeCheck className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-300" />
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Talaba profili</h1>
          </div>

          <div className="flex gap-2">
            {editMode && (
              <button
                className="px-3 sm:px-4 py-2 rounded-lg bg-gray-500 text-white font-semibold hover:bg-gray-600 transition text-sm sm:text-base"
                onClick={() => {
                  setEditMode(false);
                  setForm(student); // Reset form to original data
                }}
              >
                Bekor qilish
              </button>
            )}
            <button
              className="px-3 sm:px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition text-sm sm:text-base"
              onClick={() => editMode ? handleSave() : setEditMode(true)}
            >
              {editMode ? 'Saqlash' : 'Tahrirlash'}
            </button>
            {!editMode && (
              <button
                className="px-3 sm:px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition text-sm sm:text-base flex items-center gap-2"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="w-4 h-4" />
                O'chirish
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Profil rasmi yoki avatar */}
          {(form as Record<string, any>)?.picture ? (
            <img
              src={((form as Record<string, any>).picture as string)?.startsWith('http')
                ? (form as Record<string, any>).picture as string
                : link + (form as Record<string, any>).picture}
              alt={(form as Record<string, any>).name as string}
              className="w-32 h-32 object-cover rounded-md border border-gray-200 dark:border-slate-600 shadow"
            />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center bg-gray-200 dark:bg-slate-700 text-5xl font-bold text-gray-500 dark:text-gray-400 rounded-md border border-gray-200 dark:border-slate-600 shadow">
              {(form as Record<string, any>)?.name && (form as Record<string, any>)?.last_name
                ? `${((form as Record<string, any>).name as string)[0] || ''}${((form as Record<string, any>).last_name as string)[0] || ''}`
                : ''}
            </div>
          )}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {editMode ? (
              <>
                <EditableInput label="Ism" value={(form as Record<string, any>)?.name as string} onChange={v => handleChange('name', v)} />
                <EditableInput label="Familiya" value={(form as Record<string, any>)?.last_name as string} onChange={v => handleChange('last_name', v)} />
                <EditableInput label="Otasining ismi" value={(form as Record<string, any>)?.middle_name as string} onChange={v => handleChange('middle_name', v)} />
                <EditableInput label="Telefon" value={(form as Record<string, any>)?.phone as string} onChange={v => handleChange('phone', v)} />
              </>
            ) : (
              <>
                <ReadOnlyInput label="Ism" value={(form as Record<string, any>)?.name as string} />
                <ReadOnlyInput label="Familiya" value={(form as Record<string, any>)?.last_name as string} />
                <ReadOnlyInput label="Otasining ismi" value={(form as Record<string, any>)?.middle_name as string} />
                <ReadOnlyInput label="Telefon" value={(form as Record<string, any>)?.phone as string} />
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 md:gap-8 mt-4 sm:mt-6">
          {editMode ? (
            <>
              <EditableInput label="Fakultet" value={(form as Record<string, any>).faculty} onChange={v => handleChange('faculty', v)} />
              <EditableInput label="Yo'nalish" value={(form as Record<string, any>).direction} onChange={v => handleChange('direction', v)} />
              <EditableInput label="Guruh" value={(form as Record<string, any>).group || ''} onChange={v => handleChange('group', v)} />
              <div className="flex flex-col gap-1 w-full">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Qavat</label>
                <Select
                  options={floorOptions}
                  value={floorOptions.find(opt => opt.value === (form as Record<string, any>).floor?.id) || null}
                  onChange={opt => handleSelectChange('floor', opt)}
                  isClearable
                  placeholder="Qavat tanlang..."
                  styles={selectStyles}
                  classNamePrefix="react-select"
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Xona</label>
                <Select
                  options={roomOptions}
                  value={roomOptions.find(opt => opt.value === (form as Record<string, any>).room?.id) || null}
                  onChange={opt => handleSelectChange('room', opt)}
                  isClearable
                  placeholder="Xona tanlang..."
                  styles={selectStyles}
                  classNamePrefix="react-select"
                  isDisabled={!((form as Record<string, any>).floor?.id)}
                />
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  ⚠️ Xona o'zgartirishda server xatoligi bo'lishi mumkin
                </p>
              </div>
              <div className="flex flex-col gap-1 w-full">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Viloyat</label>
                <Select
                  options={provinceOptions}
                  value={provinceOptions.find(opt => opt.value === (form as Record<string, any>).province?.id) || null}
                  onChange={opt => handleSelectChange('province', opt)}
                  isClearable
                  placeholder="Viloyat tanlang..."
                  styles={selectStyles}
                  classNamePrefix="react-select"
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Tuman</label>
                <Select
                  options={districtOptions}
                  value={districtOptions.find(opt => opt.value === (form as Record<string, any>).district?.id) || null}
                  onChange={opt => handleSelectChange('district', opt)}
                  isClearable
                  placeholder="Tuman tanlang..."
                  styles={selectStyles}
                  classNamePrefix="react-select"
                  isDisabled={!((form as Record<string, any>).province?.id)}
                />
              </div>
              <EditableInput label="Pasport" value={(form as Record<string, any>).passport || ''} onChange={v => handleChange('passport', v)} />
              <EditableInput label="Tarif" value={(form as Record<string, any>).tarif || ''} onChange={v => handleChange('tarif', v)} />
              <EditableInput label="Imtiyoz" value={(form as Record<string, any>).imtiyoz || ''} onChange={v => handleChange('imtiyoz', v)} />
              <ReadOnlyInput label="Qabul qilingan sana" value={(form as Record<string, any>).accepted_date} type="date" />
              <ReadOnlyInput label="Jami to'lov" value={(form as Record<string, any>).total_payment} type="currency" />
            </>
          ) : (
            <>
              <ReadOnlyInput label="Fakultet" value={(form as Record<string, any>).faculty} />
              <ReadOnlyInput label="Yo'nalish" value={(form as Record<string, any>).direction} />
              <ReadOnlyInput label="Guruh" value={(form as Record<string, any>).group} />
              <ReadOnlyInput label="Xona" value={(form as Record<string, any>).room?.name} />
              <ReadOnlyInput label="Qavat" value={(form as Record<string, any>).floor?.name} />
              <ReadOnlyInput label="Viloyat" value={(form as Record<string, any>).province?.name} />
              <ReadOnlyInput label="Tuman" value={(form as Record<string, any>).district?.name} />
              <ReadOnlyInput label="Pasport" value={(form as Record<string, any>).passport} />
              <ReadOnlyInput label="Tarif" value={(form as Record<string, any>).tarif} />
              <ReadOnlyInput label="Imtiyoz" value={(form as Record<string, any>).imtiyoz} />
              <ReadOnlyInput label="Qabul qilingan sana" value={(form as Record<string, any>).accepted_date} type="date" />
              <ReadOnlyInput label="Jami to'lov" value={(form as Record<string, any>).total_payment} type="currency" />
            </>
          )}
        </div>
      </div>

      {/* O'chirish modali */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Talabani o'chirish</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Bu amalni bekor qilib bo'lmaydi</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300">
                Rostdan ham <strong>{student?.name} {student?.last_name}</strong> nomli talabani o'chirmoqchimisiz?
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                Bu amal qaytarilmaydi va barcha ma'lumotlar yo'qoladi.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    O'chirilmoqda...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    O'chirish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile; 