import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BackButton from '../components/UI/BackButton';
import { BadgeCheck, Calendar, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { link } from '../data/config';
import axios from 'axios';
import { toast } from 'sonner';
import Select from 'react-select';
import { formatCurrency, formatDate } from '../utils/formatters';
import { invalidateStudentCaches } from '../utils/cacheUtils';
import { useGlobalEvents } from '../utils/globalEvents';

// react-select custom styles for dark mode
const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
    borderColor: state.isFocused ? (document.documentElement.classList.contains('dark') ? '#60a5fa' : '#3b82f6') : (document.documentElement.classList.contains('dark') ? '#374151' : '#d1d5db'),
    boxShadow: state.isFocused ? `0 0 0 2px ${document.documentElement.classList.contains('dark') ? '#60a5fa' : '#3b82f6'}` : undefined,
    minHeight: 40,
    fontSize: 15,
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
  input: (base: any) => ({
    ...base,
    color: document.documentElement.classList.contains('dark') ? '#fff' : '#111827',
  }),
  placeholder: (base: any) => ({
    ...base,
    color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280',
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
  const inputType = type;

  if (type === "date" && typeof value === "string") {
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
  const { emitStudentUpdate, subscribe } = useGlobalEvents();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Record<string, unknown> | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
    queryFn: async () => {
      const token = sessionStorage.getItem('access');
      const response = await fetch(`${link}/students/${studentId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Talaba ma\'lumotlarini yuklashda xatolik');
      return response.json();
    },
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

  // Tahrirlash rejimiga o'tganda barcha inputlarni to'g'ri holatga keltirish
  React.useEffect(() => {
    if (editMode && student) {
      // Form ma'lumotlarini qayta o'rnatish
      setForm({
        ...student,
        course: student.course || '1-kurs',
        gender: student.gender || 'Erkak',
      });
    }
  }, [editMode, student]);

  // Listen for global student updates
  useEffect(() => {
    const unsubscribe = subscribe('student-updated', () => {
      refetch();
    });
    return unsubscribe;
  }, [subscribe, refetch]);

  // Fetch provinces
  useEffect(() => {
    const token = sessionStorage.getItem("access");
    const headers: HeadersInit = token ? { "Authorization": `Bearer ${token}` } : {};
    fetch(`${link}/provinces/`, { headers })
      .then(res => {
        if (!res.ok) throw new Error("Viloyatlarni yuklashda xatolik");
        return res.json();
      })
      .then(data => {
        // Handle both array and { results: [] } format
        const provincesArray = Array.isArray(data) ? data : (data.results || []);
        setProvinces(provincesArray);
      })
      .catch(() => setProvinces([]));
  }, []);

  // Fetch floors
  useEffect(() => {
    const token = sessionStorage.getItem("access");
    const headers: HeadersInit = token ? { "Authorization": `Bearer ${token}` } : {};
    fetch(`${link}/floors/`, { headers })
      .then(res => {
        if (!res.ok) throw new Error("Qavatlarni yuklashda xatolik");
        return res.json();
      })
      .then(data => {
        // Handle both array and { results: [] } format
        const floorsArray = Array.isArray(data) ? data : (data.results || []);
        setFloors(floorsArray);
      })
      .catch(() => setFloors([]));
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    const currentProvince = form?.province;
    const provinceId = typeof currentProvince === 'number' ? currentProvince : null;

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
      .then(data => {
        // Handle both array and { results: [] } format
        const districtsArray = Array.isArray(data) ? data : (data.results || []);
        setDistricts(districtsArray);
      })
      .catch(() => setDistricts([]));
  }, [form?.province]);

  // Fetch rooms when floor changes
  useEffect(() => {
    const currentFloor = form?.floor;
    const floorId = typeof currentFloor === 'number' ? currentFloor : null;

    if (!floorId) {
      setRooms([]);
      return;
    }

    const token = sessionStorage.getItem("access");
    const headers: HeadersInit = token ? { "Authorization": `Bearer ${token}` } : {};
    fetch(`${link}/rooms/?floor=${floorId}`, { headers })
      .then(res => {
        if (!res.ok) throw new Error("Xonalarni yuklashda xatolik");
        return res.json();
      })
      .then(data => {
        // Handle both array and { results: [] } format
        const roomsArray = Array.isArray(data) ? data : (data.results || []);
        // Xona raqami bo'yicha saralash
        const sortedRooms = roomsArray.sort((a: any, b: any) => {
          const aNum = parseInt(a.name.replace(/\D/g, '')) || 0;
          const bNum = parseInt(b.name.replace(/\D/g, '')) || 0;
          return aNum - bNum;
        });
        setRooms(sortedRooms);
      })
      .catch(() => setRooms([]));
  }, [form?.floor]);

  // Create options for dropdowns
  const provinceOptions = provinces.map(p => ({ value: p.id, label: p.name }));
  const districtOptions = districts.map(d => ({ value: d.id, label: d.name }));
  const floorOptions = floors.map(f => ({ value: f.id, label: f.name }));
  const roomOptions = rooms.map(r => ({ value: r.id, label: r.name }));

  // Imtiyoz options
  const privilegeOptions = [
    { value: true, label: 'Imtiyozli' },
    { value: false, label: 'Imtiyozsiz' }
  ];

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setForm(f => f ? { ...f, picture: null } : f);
  };

  const handleSelectChange = (field: string, option: { value: number | boolean; label: string } | null) => {
    if (!option) {
      setForm(f => f ? { ...f, [field]: null } : f);
      return;
    }

    // Imtiyoz uchun boolean value
    if (field === 'privilege') {
      setForm(f => f ? { ...f, [field]: option.value } : f);
      return;
    }

    // Create object with id and name for consistency with existing data structure
    const selectedValue = { id: option.value, name: option.label };
    setForm(f => f ? { ...f, [field]: selectedValue } : f);
  };

  const handleSave = async () => {
    if (!studentId || !form) return;
    
    setSaving(true);

    // FormData yaratish (rasm yuklash uchun)
    const formData = new FormData();

    // Basic fields
    if (form.name) formData.append('name', form.name as string);
    if (form.last_name) formData.append('last_name', form.last_name as string);
    if (form.middle_name) formData.append('middle_name', form.middle_name as string);
    if (form.phone) formData.append('phone', form.phone as string);
    if (form.faculty) formData.append('faculty', form.faculty as string);
    if (form.direction) formData.append('direction', form.direction as string);
    if (form.group) formData.append('group', form.group as string);
    if (form.passport) formData.append('passport', form.passport as string);

    // Imtiyoz va uning ulushi
    if (form.privilege !== undefined) {
      formData.append('privilege', form.privilege ? 'true' : 'false');
    }
    if (form.privilege_share) {
      formData.append('privilege_share', form.privilege_share as string);
    }

    // Boolean and enum fields with defaults
    formData.append('course', (form as any).course || '1-kurs');
    formData.append('gender', (form as any).gender || 'Erkak');

    // Rasm yuklash
    if (selectedImage) {
      formData.append('picture', selectedImage);
    }

    // Location fields - only if they have valid IDs
    if (form.province && typeof form.province === 'object' && (form.province as any).id) {
      formData.append('province', String((form.province as any).id));
    }

    if (form.district && typeof form.district === 'object' && (form.district as any).id) {
      formData.append('district', String((form.district as any).id));
    }

    // Include room and floor if they are selected (using available endpoints ensures no capacity errors)
    // Only include if they are different from original values to avoid unnecessary updates
    const originalStudent = student as any;

    if (form.floor && typeof form.floor === 'object' && (form.floor as any).id) {
      const newFloorId = Number((form.floor as any).id);
      const originalFloorId = originalStudent?.floor?.id;
      if (newFloorId !== originalFloorId) {
        formData.append('floor', String(newFloorId));

      }
    }

    if (form.room && typeof form.room === 'object' && (form.room as any).id) {
      const newRoomId = Number((form.room as any).id);
      const originalRoomId = originalStudent?.room?.id;
      if (newRoomId !== originalRoomId) {
        formData.append('room', String(newRoomId));

      }
    }

    try {
      const token = sessionStorage.getItem('access');
      const response = await axios.patch(
        `${link}/students/${studentId}/`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Talaba maʼlumotlari saqlandi!');
      setEditMode(false);
      setSelectedImage(null);
      setImagePreview(null);

      // Barcha bog'liq cache larni yangilash
      await invalidateStudentCaches(queryClient);
      // Force immediate refetch
      await refetch();
      // Emit global event
      emitStudentUpdate({ action: 'updated', id: studentId });
    } catch (error: any) {
      // Try to get more details from server response
      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          // Handle string error response
        }
      }

      let errorMessage = 'Noma\'lum xatolik';

      if (error.response?.status === 500) {
        // If 500 error and we included room/floor, try again without them
        const hasRoomOrFloor = formData.has('room') || formData.has('floor');
        if (hasRoomOrFloor) {
          const retryFormData = new FormData();

          // Copy all fields except room and floor
          for (const [key, value] of formData.entries()) {
            if (key !== 'room' && key !== 'floor') {
              retryFormData.append(key, value);
            }
          }

          try {
            const token = sessionStorage.getItem('access');
            const retryResponse = await axios.patch(
              `${link}/students/${studentId}/`,
              retryFormData,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'multipart/form-data'
                }
              }
            );

            toast.success('Talaba maʼlumotlari saqlandi! (Xona o\'zgartirilmadi)');
            setEditMode(false);
            setSelectedImage(null);
            setImagePreview(null);
            // Barcha bog'liq cache larni yangilash
            await invalidateStudentCaches(queryClient);
            // Force immediate refetch
            await refetch();
            // Emit global event
            emitStudentUpdate({ action: 'updated', id: studentId });
            return; // Exit early on success
          } catch (retryError) {
            errorMessage = 'Server xatoligi. Xona o\'zgartirishda muammo bo\'lishi mumkin.';
          }
        } else {
          errorMessage = 'Server xatoligi. Iltimos, keyinroq qayta urinib ko\'ring.';
        }
      } else if (error.response?.data) {
        const errorData = error.response.data;

        // Check if response is HTML (server error page)
        if (typeof errorData === "string" && errorData.includes("<html>")) {
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
        } else if (typeof errorData === "string") {
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
            } else if (typeof errors === "string") {
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
    } finally {
      setSaving(false);
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

      // Barcha bog'liq cache larni yangilash
      await invalidateStudentCaches(queryClient);
      // Emit global event
      emitStudentUpdate({ action: 'deleted', id: studentId });

      // Students sahifasiga qaytish
      window.location.href = '/students';
    } catch (error: any) {
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
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
              >
                Bekor qilish
              </button>
            )}
            <button
              className="px-3 sm:px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => editMode ? handleSave() : setEditMode(true)}
              disabled={saving}
            >
              {editMode ? (saving ? 'Saqlanmoqda...' : 'Saqlash') : 'Tahrirlash'}
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
          <div className="relative">
            {imagePreview || (form as Record<string, any>)?.picture ? (
              <img
                src={imagePreview || (((form as Record<string, any>).picture as string)?.startsWith('http')
                  ? (form as Record<string, any>).picture as string
                  : link + (form as Record<string, any>).picture)}
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

            {editMode && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <span className="text-white text-sm font-medium">📷 Rasm yuklash</span>
              </div>
            )}

            {editMode && (imagePreview || (form as Record<string, any>)?.picture) && (
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            )}
          </div>
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
                  value={floorOptions.find(opt => opt.value === (form as Record<string, any>).floor) || null}
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
                  value={roomOptions.find(opt => opt.value === (form as Record<string, any>).room) || null}
                  onChange={opt => handleSelectChange('room', opt)}
                  isClearable
                  placeholder="Xona tanlang..."
                  styles={selectStyles}
                  classNamePrefix="react-select"
                  isDisabled={!((form as Record<string, any>).floor?.id)}
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Viloyat</label>
                <Select
                  options={provinceOptions}
                  value={provinceOptions.find(opt => opt.value === (form as Record<string, any>).province) || null}
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
                  value={districtOptions.find(opt => opt.value === (form as Record<string, any>).district) || null}
                  onChange={opt => handleSelectChange('district', opt)}
                  isClearable
                  placeholder="Tuman tanlang..."
                  styles={selectStyles}
                  classNamePrefix="react-select"
                  isDisabled={!((form as Record<string, any>).province?.id)}
                />
              </div>
              <EditableInput label="Pasport" value={(form as Record<string, any>).passport || ''} onChange={v => handleChange('passport', v)} />

              {/* Imtiyoz Select */}
              <div className="flex flex-col gap-1 w-full">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Imtiyoz</label>
                <Select
                  options={privilegeOptions}
                  value={privilegeOptions.find(opt => opt.value === (form as Record<string, any>).privilege) || null}
                  onChange={opt => handleSelectChange('privilege', opt)}
                  isClearable
                  placeholder="Imtiyoz tanlang..."
                  styles={selectStyles}
                  classNamePrefix="react-select"
                />
              </div>

              {/* Imtiyoz ulushi - faqat imtiyoz belgilangan bo'lsa ko'rsatish */}
              {(form as Record<string, any>).privilege && (
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Imtiyoz ulushi (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={(form as Record<string, any>).privilege_share || ''}
                    onChange={e => handleChange('privilege_share', e.target.value)}
                    className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
                    placeholder="Imtiyoz ulushi"
                  />
                </div>
              )}
              <ReadOnlyInput label="Qabul qilingan sana" value={(form as Record<string, any>).accepted_date} type="date" />
              <ReadOnlyInput label="Jami to'lov" value={(form as Record<string, any>).total_payment} type="currency" />
            </>
          ) : (
            <>
              <ReadOnlyInput label="Fakultet" value={(form as Record<string, any>).faculty} />
              <ReadOnlyInput label="Yo'nalish" value={(form as Record<string, any>).direction} />
              <ReadOnlyInput label="Guruh" value={(form as Record<string, any>).group} />
              <ReadOnlyInput label="Xona" value={(form as Record<string, any>).room_name} />
              <ReadOnlyInput label="Qavat" value={(form as Record<string, any>).floor_name} />
              <ReadOnlyInput label="Viloyat" value={(form as Record<string, any>).province_name} />
              <ReadOnlyInput label="Tuman" value={(form as Record<string, any>).district_name} />
              <ReadOnlyInput label="Pasport" value={(form as Record<string, any>).passport} />
              <ReadOnlyInput
                label="Imtiyoz"
                value={(form as Record<string, any>).privilege ? 'Imtiyozli' : 'Imtiyozsiz'}
              />
              {(form as Record<string, any>).privilege && (form as Record<string, any>).privilege_share && (
                <ReadOnlyInput
                  label="Imtiyoz ulushi"
                  value={`${(form as Record<string, any>).privilege_share}%`}
                />
              )}
              <ReadOnlyInput label="Qabul qilingan sana" value={(form as Record<string, any>).accepted_date} type="date" />
              <ReadOnlyInput label="Jami to'lov" value={(form as Record<string, unknown>).total_payment} type="currency" />
            </>
          )}
        </div>

        {/* Hujjatlar bo'limi */}
        {!editMode && form && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Hujjatlar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Pasport old tomoni */}
              {(form as Record<string, any>).passport_image_first && (
                <div className="group relative bg-gray-50 dark:bg-slate-700/50 rounded-lg overflow-hidden">
                  <img
                    src={(form as Record<string, any>).passport_image_first}
                    alt="Pasport old tomoni"
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition"
                    onClick={() => window.open((form as Record<string, any>).passport_image_first, '_blank')}
                  />
                  <div className="p-3 bg-white dark:bg-slate-800">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Pasport (old tomoni)</div>
                  </div>
                </div>
              )}
              
              {/* Pasport orqa tomoni */}
              {(form as Record<string, any>).passport_image_second && (
                <div className="group relative bg-gray-50 dark:bg-slate-700/50 rounded-lg overflow-hidden">
                  <img
                    src={(form as Record<string, any>).passport_image_second}
                    alt="Pasport orqa tomoni"
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition"
                    onClick={() => window.open((form as Record<string, any>).passport_image_second, '_blank')}
                  />
                  <div className="p-3 bg-white dark:bg-slate-800">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Pasport (orqa tomoni)</div>
                  </div>
                </div>
              )}
              
              {/* Qo'shimcha hujjat */}
              {(form as Record<string, any>).document && (
                <div className="group relative bg-gray-50 dark:bg-slate-700/50 rounded-lg overflow-hidden">
                  <img
                    src={(form as Record<string, any>).document}
                    alt="Qo'shimcha hujjat"
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition"
                    onClick={() => window.open((form as Record<string, unknown>).document, '_blank')}
                  />
                  <div className="p-3 bg-white dark:bg-slate-800">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Qo'shimcha hujjat</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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