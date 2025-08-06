import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import DataTable from '../components/UI/DataTable';
import { toast } from 'sonner';
import Select from 'react-select';
import { Link, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiQueries } from '../data/api';
import { useAppStore } from '../stores/useAppStore';
import { link } from '../data/config';
import axios from 'axios';

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

const Students: React.FC = () => {
  const queryClient = useQueryClient();
  const updateStudentStore = useAppStore(state => state.updateStudent);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Record<string, unknown> | null>(null);
  const [provinces, setProvinces] = useState<{ id: number; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: number; name: string; province: number }[]>([]);
  const regionOptions = provinces.map(p => ({ value: String(p.id), label: p.name }));
  const districtOptions = districts.map(d => ({ value: String(d.id), label: d.name }));
  // formData'ga gender va course string maydonini qo'sh
  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    fatherName: string;
    phone: string;
    email: string;
    room: string;
    course: string;
    faculty: string;
    group: string;
    region: string;
    district: string;
    passport: string;
    isPrivileged: boolean;
    privilegeShare: string;
    avatar: string | File;
    tarif: string;
    direction: string;
    floor: string;
    gender: string;
    passportImage1: string | File | null;
    passportImage2: string | File | null;
  }>({
    firstName: "",
    lastName: "",
    fatherName: "",
    phone: "",
    email: "",
    room: "",
    course: "1-kurs",
    faculty: "",
    group: "",
    region: "",
    district: "",
    passport: "",
    isPrivileged: false,
    privilegeShare: "",
    avatar: "",
    tarif: "",
    direction: "",
    floor: "",
    gender: "",
    passportImage1: null,
    passportImage2: null,
  });
  const [loading, setLoading] = useState(false);
  // 1. Add avatarPreview state
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const location = useLocation();

  // React Query bilan students ma'lumotlarini olish
  const { 
    data: students = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['students'],
    queryFn: apiQueries.getStudents,
    staleTime: 1000 * 60 * 5, // 5 daqiqa cache
  });

  // Fetch available floors (only floors with empty rooms)
  const { data: floors = [] } = useQuery({
    queryKey: ['available-floors'],
    queryFn: apiQueries.getAvailableFloors,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch available rooms for selected floor (only empty rooms)
  const { data: rooms = [] } = useQuery({
    queryKey: ['available-rooms', formData.floor],
    queryFn: () => formData.floor ? apiQueries.getAvailableRooms(Number(formData.floor)) : Promise.resolve([]),
    enabled: !!formData.floor,
    staleTime: 1000 * 60 * 5,
  });

  const floorOptions = Array.isArray(floors)
    ? floors.map((f: any) => ({ value: f.id, label: f.name }))
    : [];
  const roomOptions = Array.isArray(rooms)
    ? rooms.map((r: any) => ({ value: r.id, label: r.name }))
    : [];

  const columns = [
    {
      key: "index",
      title: "№",
      render: (_: unknown, row: Record<string, unknown>) => (
        <span className="text-gray-500 dark:text-gray-400 font-semibold">{(row._idx as number) + 1}</span>
      ),
    },
    {
      key: "fullName",
      title: "Ism Familiya",
      sortable: true,
      render: (_: any, row: Record<string, unknown>) => (
        <Link to={`/studentprofile/${row.id}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">{String(row.name)} {String(row.last_name)}</Link>
      ) as React.ReactNode,
    },
    {
      key: "direction",
      title: "Yo'nalish",
      render: (value: unknown) => <span className="text-sm text-gray-700 dark:text-gray-300">{value as string}</span>,
    },
    {
      key: "room",
      title: "Xona",
      render: (_: unknown, row: Record<string, unknown>) => <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 rounded-full text-sm font-medium">{row.room && typeof row.room === 'object' ? (row.room as any).name : "-"}</span>,
    },
    {
      key: "total_payment",
      title: "Umumiy to'lov",
      render: (value: unknown) => <span className="font-semibold text-green-600 dark:text-green-400">{typeof value === 'number' ? value.toLocaleString() : value} so'm</span>,
    },
  ];

  // Actions column for edit
  const columnsWithActions = [
    ...columns,
    {
      key: 'actions',
      title: 'Amallar',
      render: (_: unknown, row: Record<string, any>) => {
        return (
          <button
            className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 text-sm font-semibold"
            onClick={() => handleEdit(row)}
          >
            Tahrirlash
          </button>
        );
      },
    },
  ];

  const handleAdd = () => {
    setEditingStudent(null);
    setFormData({
      firstName: "",
      lastName: "",
      fatherName: "",
      phone: "",
      email: "",
      room: "",
      course: "1-kurs",
      faculty: "",
      group: "",
      region: "",
      district: "",
      passport: "",
      isPrivileged: false,
      privilegeShare: "",
      avatar: "",
      tarif: "",
      direction: "",
      floor: "",
      gender: "",
      passportImage1: null,
      passportImage2: null,
    });
    setAvatarPreview("");
    setShowModal(true);
  };

  // Edit handler
  const handleEdit = (student: Record<string, any>) => {
    setEditingStudent(student);
    setFormData({
      firstName: student.name || "",
      lastName: student.last_name || "",
      fatherName: student.middle_name || "",
      phone: student.phone || "",
      email: student.email || "",
      room: student.room && typeof student.room === 'object' ? String(student.room.id) : "",
      course: student.course || "1-kurs",
      faculty: student.faculty || "",
      group: student.group || "",
      region: student.province && typeof student.province === 'object' ? String(student.province.id) : "",
      district: student.district && typeof student.district === 'object' ? String(student.district.id) : "",
      passport: student.passport || "",
      isPrivileged: Boolean(student.privilege),
      privilegeShare: student.privilegeShare || "",
      avatar: student.picture || "",
      tarif: student.tarif || "",
      direction: student.direction || "",
      floor: student.floor && typeof student.floor === 'object' ? String(student.floor.id) : "",
      gender: student.gender || "",
    });
    setAvatarPreview(student.picture || "");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('access');
        // Prepare payload according to API documentation
        const payload: any = {
          name: formData.firstName,
          last_name: formData.lastName,
          middle_name: formData.fatherName,
          phone: formData.phone,
          faculty: formData.faculty,
          direction: formData.direction,
          group: formData.group,
          passport: formData.passport,
          privilege: formData.isPrivileged, // Use 'privilege' as per API docs
          course: formData.course,
          gender: formData.gender,
          province: formData.region ? Number(formData.region) : 0,
          district: formData.district ? Number(formData.district) : 0,
          floor: formData.floor ? Number(formData.floor) : 0,
          room: formData.room ? Number(formData.room) : 0,
        };
        await axios.patch(
          `${link}/students/${editingStudent.id}/`,
          payload,
          { 
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        toast.success('Talaba maʼlumotlari yangilandi!');
        refetch();
        setShowModal(false);
      } catch {
        toast.error('Talaba maʼlumotlarini saqlashda xatolik!');
      } finally {
        setLoading(false);
      }
      return;
    }
    try {
      await addStudent();
      // addStudent already calls refetch and closes modal
    } catch (error) {
      toast.error("Xatolik yuz berdi!");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSelectChange = (name: string, option: { value: string; label: string } | null) => {
    setFormData(prev => ({
      ...prev,
      [name]: option ? option.value : '',
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.checked,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }));
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Add filter states for gender and payment status
  const [genderFilter, setGenderFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  
  // Debug: API dan kelayotgan ma'lumotlarni ko'rish
  React.useEffect(() => {
    if (students.length > 0) {
      console.log('First student data:', students[0]);
      console.log('All gender values:', students.map(s => s.gender).filter(Boolean));
    }
  }, [students]);

  // Filtering and sorting logic
  const filteredStudents = students
    .filter((s: Record<string, any>) => {
      // Debug: gender qiymatlarini tekshirish
      if (genderFilter && !s.gender) {
        console.log('Student without gender:', s);
      }
      
      // Gender filter - API dan kelayotgan qiymatlarni tekshirish
      let matchesGender = true;
      if (genderFilter) {
        const studentGender = String(s.gender || '').toLowerCase().trim();
        const filterGender = genderFilter.toLowerCase();
        
        // Barcha mumkin bo'lgan variantlarni tekshirish
        matchesGender = studentGender === filterGender || 
                       (studentGender === 'erkak' && filterGender === 'male') ||
                       (studentGender === 'ayol' && filterGender === 'female') ||
                       (studentGender === 'male' && filterGender === 'male') ||
                       (studentGender === 'female' && filterGender === 'female') ||
                       (studentGender === 'м' && filterGender === 'male') || // Rus tilida
                       (studentGender === 'ж' && filterGender === 'female'); // Rus tilida
        
        // Debug
        if (!matchesGender && genderFilter) {
          console.log(`Gender mismatch: student="${studentGender}", filter="${filterGender}"`);
        }
      }
      
      // Payment filter
      let isHaqdor = false;
      let isQarzdor = false;
      let matchesPayment = true;
      
      if (paymentStatusFilter) {
        if (typeof s.total_payment === "number" && s.tarif) {
          const tarifNum = Number(String(s.tarif).replace(/[^\d]/g, ""));
          isHaqdor = s.total_payment >= tarifNum;
          isQarzdor = s.total_payment < tarifNum;
          
          matchesPayment = paymentStatusFilter === "haqdor" ? isHaqdor : isQarzdor;
          
          // Debug
          if (paymentStatusFilter && !matchesPayment) {
            console.log(`Payment mismatch: total=${s.total_payment}, tarif=${tarifNum}, filter=${paymentStatusFilter}, isHaqdor=${isHaqdor}, isQarzdor=${isQarzdor}`);
          }
        } else {
          // Agar payment ma'lumotlari yo'q bo'lsa, filter bo'yicha ko'rsatmaslik
          matchesPayment = false;
          console.log(`No payment data for student:`, s.name, s.total_payment, s.tarif);
        }
      }
      
      return matchesGender && matchesPayment;
    })
    .sort((a: Record<string, any>, b: Record<string, any>) => {
      // Alifbo tartibida saralash (ism bo'yicha)
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return nameA.localeCompare(nameB, 'uz-UZ');
    });

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

  // Fetch districts when province (region) changes
  useEffect(() => {
    if (!formData.region) {
      setDistricts([]);
      return;
    }
    const token = sessionStorage.getItem("access");
    const headers: HeadersInit = token ? { "Authorization": `Bearer ${token}` } : {};
    fetch(`${link}/districts/?province=${formData.region}`, { headers })
      .then(res => {
        if (!res.ok) throw new Error("Tumanlarni yuklashda xatolik");
        return res.json();
      })
      .then(data => setDistricts(data))
      .catch(() => setDistricts([]));
  }, [formData.region]);

  useEffect(() => {
    // URL parametrlarini tekshirish
    const urlParams = new URLSearchParams(window.location.search);
    const openModal = urlParams.get('openModal');
    
    if (openModal === 'true') {
      setShowModal(true);
      // URL dan parametrni olib tashlash
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // SessionStorage dan ma'lumotlarni olish
      const pendingData = sessionStorage.getItem('pendingStudentData');
      if (pendingData) {
        try {
          const studentData = JSON.parse(pendingData);
          setFormData(prev => ({
            ...prev,
            firstName: studentData.firstName || '',
            lastName: studentData.lastName || '',
            fatherName: studentData.fatherName || '',
            phone: studentData.phone || '',
            direction: studentData.direction || '',
            faculty: '', // Bo'sh qoldirish
            passport: studentData.passport || '',
            course: studentData.course || '1-kurs',
            gender: studentData.gender || 'Erkak',
            isPrivileged: studentData.isPrivileged || false,
            tarif: studentData.tarif || '500000',
            passportImage1: studentData.passportImage1Base64 || null,
            passportImage2: studentData.passportImage2Base64 || null,
          }));
          // Ma'lumotlarni tozalash
          sessionStorage.removeItem('pendingStudentData');
        } catch (error) {
          console.error('Pending student data parse error:', error);
        }
      }
    }
    
    // Eski location.state logikasi
    if (location.state && (location.state as any).openAddModal) {
      setShowModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-10 text-red-600 dark:text-red-400">
        Ma'lumotlarni yuklashda xatolik yuz berdi.
      </div>
    );
  }

  // Add student function for modal
  const addStudent = async () => {
    setLoading(true); // 🔄 loader ON
    const myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      `Bearer ${sessionStorage.getItem("access")}`
    );

    const formdata = new FormData();
    if (formData.firstName) formdata.append("name", formData.firstName);
    if (formData.lastName) formdata.append("last_name", formData.lastName);
    if (formData.fatherName) formdata.append("middle_name", formData.fatherName);
    if (formData.region) formdata.append("province", String(parseInt(formData.region)));
    if (formData.district) formdata.append("district", String(parseInt(formData.district)));
    if (formData.passport) formdata.append("passport", formData.passport);
    if (formData.group) formdata.append("group", formData.group);
    if (formData.faculty) formdata.append("faculty", formData.faculty);
    if (formData.direction) formdata.append("direction", formData.direction);
    if (formData.floor) formdata.append("floor", String(parseInt(formData.floor)));
    if (formData.room) formdata.append("room", String(parseInt(formData.room)));
    if (formData.phone) formdata.append("phone", formData.phone);
    if (formData.tarif) formdata.append("tarif", formData.tarif);
    if (formData.isPrivileged) formdata.append("privilege", String(formData.isPrivileged));
    if (formData.privilegeShare) {
      formdata.append("privilegeShare", formData.privilegeShare);
    }
    if (formData.gender) formdata.append("gender", formData.gender);
    if (formData.course) formdata.append("course", formData.course);
    // Fix instanceof check for avatar
    if (formData.avatar && typeof formData.avatar !== 'string' && formData.avatar instanceof File) {
      formdata.append("picture", formData.avatar);
    }

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
    };

    fetch(`${link}/student/create/`, requestOptions)
      .then(async (response) => {
        let result;
        try {
          result = await response.json();
        } catch (e) {
          result = {};
        }
        if (!response.ok) {
          console.error('API error:', result);
          toast.error(result.detail || result.message || JSON.stringify(result) || "Xatolik yuz berdi");
          throw new Error(result.detail || result.message || JSON.stringify(result) || "Xatolik yuz berdi");
        }
        // Cache ni yangilash
        queryClient.invalidateQueries({ queryKey: ['students'] });
        queryClient.invalidateQueries({ queryKey: ['floors'] });
        queryClient.invalidateQueries({ queryKey: ['rooms'] });
        
        refetch();
        setShowModal(false);
        toast.success("Talaba muvaffaqiyatli qo'shildi!");
      })
      .catch((error) => {
        console.error('Catch error:', error);
        toast.error(error.message || "Xatolik yuz berdi");
      })
      .finally(() => {
        setLoading(false); // 🔄 loader OFF
      });
  };

  // Export handler for DataTable
  const handleExportStudents = async () => {
    try {
      const token = sessionStorage.getItem('access');
      if (!token) {
        toast.error('Avtorizatsiya talab qilinadi!');
        return;
      }
      const response = await fetch('https://joyboryangi.pythonanywhere.com/export-student/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/json',
        },
      });
      if (!response.ok) {
        toast.error('Export xatolik yuz berdi!');
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `talabalar_ro'yxati_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Talabalar ro\'yxati muvaffaqiyatli yuklandi!');
    } catch (error) {
      toast.error('Export xatolik yuz berdi!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-8 px-1 sm:px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">Talabalar</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-xs sm:text-base">
            Yotoqxonada yashayotgan talabalar ro'yxati
          </p>
        </div>
        <div className="mt-2 sm:mt-0">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-base disabled:opacity-60"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                <span>Qo'shilmoqda...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Talaba qo'shish</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter va qidiruv */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <Select
            options={[
              { value: "male", label: "Erkak" },
              { value: "female", label: "Ayol" },
            ]}
            value={genderFilter ? { value: genderFilter, label: genderFilter === "male" ? "Erkak" : "Ayol" } : null}
            onChange={opt => setGenderFilter(opt ? String(opt.value) : "")}
            isClearable
            placeholder="Jins"
            styles={selectStyles}
            classNamePrefix="react-select"
            className="min-w-[120px]"
          />
          <Select
            options={[
              { value: "haqdor", label: "Haqdor" },
              { value: "qarzdor", label: "Qarzdor" },
            ]}
            value={paymentStatusFilter ? { value: paymentStatusFilter, label: paymentStatusFilter === "haqdor" ? "Haqdor" : "Qarzdor" } : null}
            onChange={opt => setPaymentStatusFilter(opt ? String(opt.value) : "")}
            isClearable
            placeholder="To'lov holati"
            styles={selectStyles}
            classNamePrefix="react-select"
            className="min-w-[140px]"
          />

        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <DataTable
          data={filteredStudents.map((s: Record<string, any>, idx: number) => ({ ...s, _idx: idx }))}
          columns={columnsWithActions}
          actions={null}
          searchable={true}
          filterable={false}
          pagination={true}
          pageSize={10}
          onExport={handleExportStudents}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 40 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl p-0 overflow-hidden relative max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div className="flex-1 flex items-center justify-center relative">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center w-full">
                  {editingStudent ? 'Talabani Tahrirlash' : 'Yangi Talaba Qo\'shish'}
                </h2>
                <button onClick={() => setShowModal(false)} className="absolute right-0 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded transition-colors">
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-2 sm:px-8 py-6 sm:py-8 pb-40 space-y-6 sm:space-y-8">
              {/* Profil rasmi */}
              <div className="flex flex-col items-center gap-3 mb-4">
                <label className="block text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">Profil rasmi</label>
                <div className="relative w-24 h-24 group">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profil"
                      className="w-24 h-24 rounded-xl object-cover border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 shadow-md transition-all duration-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-xl flex items-center justify-center text-3xl font-bold text-white bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md select-none">
                      {formData.firstName?.[0] || ''} {formData.lastName?.[0] || ''}
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    title="Rasm yuklash"
                    aria-label="Profil rasm yuklash"
                  />
                  {/* Overlay for hover */}
                  <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                    <span className="text-white">📸</span>
                  </div>
                  {/* Remove button */}
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={() => { setFormData(prev => ({ ...prev, avatar: "" })); setAvatarPreview(""); }}
                      className="absolute -top-2 -right-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-full p-1 shadow hover:bg-red-500 hover:text-white transition-colors z-30"
                      aria-label="Rasmni olib tashlash"
                    >
                      <span className="text-2xl">×</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Shaxsiy ma'lumotlar */}
              <div>
                <div className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Shaxsiy ma'lumotlar</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ism</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Familiya</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Otasining ismi</label>
                    <input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Telefon</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+998901234567" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus-border-transparent" />
                  </div>
                </div>
              </div>
              <hr className="my-2 border-gray-200 dark:border-gray-700" />

              {/* Universitet ma'lumotlari */}
              <div>
                <div className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Universitet ma'lumotlari</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fakultet</label>
                    <input type="text" name="faculty" value={formData.faculty} onChange={handleInputChange} placeholder="Fakultet nomi" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Yo'nalish</label>
                    <input type="text" name="direction" value={formData.direction} onChange={handleInputChange} placeholder="Yo'nalish nomi" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Guruh</label>
                    <input type="text" name="group" value={formData.group} onChange={handleInputChange} placeholder="IF-21-01" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kurs</label>
                    <select name="course" value={formData.course} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="1-kurs">1-kurs</option>
                      <option value="2-kurs">2-kurs</option>
                      <option value="3-kurs">3-kurs</option>
                      <option value="4-kurs">4-kurs</option>
                      <option value="5-kurs">5-kurs</option>
                    </select>
                  </div>
                </div>
              </div>
              <hr className="my-2 border-gray-200 dark:border-gray-700" />

              {/* Yashash ma'lumotlari */}
              <div>
                <div className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Yashash ma'lumotlari</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Qavat</label>
                    <Select
                      options={floorOptions}
                      value={floorOptions.find(opt => String(opt.value) === String(formData.floor)) || null}
                      onChange={opt => handleSelectChange('floor', opt)}
                      isClearable
                      placeholder="Qavat tanlang..."
                      styles={selectStyles}
                      classNamePrefix="react-select"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Xona</label>
                    <Select
                      options={roomOptions}
                      value={roomOptions.find(opt => String(opt.value) === String(formData.room)) || null}
                      onChange={opt => handleSelectChange('room', opt)}
                      isClearable
                      placeholder="Xona tanlang..."
                      styles={selectStyles}
                      classNamePrefix="react-select"
                      isDisabled={!formData.floor}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Viloyat/Shahar</label>
                    <Select
                      options={regionOptions}
                      value={regionOptions.find(opt => opt.value === String(formData.region)) || null}
                      onChange={opt => handleSelectChange('region', opt)}
                      isClearable
                      placeholder="Viloyat tanlang..."
                      styles={selectStyles}
                      classNamePrefix="react-select"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tuman/Shaharcha</label>
                    <Select
                      options={districtOptions}
                      value={districtOptions.find(opt => opt.value === String(formData.district)) || null}
                      onChange={opt => handleSelectChange('district', opt)}
                      isClearable
                      placeholder="Tuman tanlang..."
                      styles={selectStyles}
                      classNamePrefix="react-select"
                      isDisabled={!formData.region}
                    />
                  </div>
                </div>
              </div>
              <hr className="my-2 border-gray-200 dark:border-gray-700" />

              {/* Qo'shimcha */}
              <div>
                <div className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Qo'shimcha</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Passport ma'lumoti</label>
                    <input type="text" name="passport" value={formData.passport} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                  </div>
                  <div className="flex items-center gap-2 mt-4 sm:mt-8">
                    <input type="checkbox" name="isPrivileged" checked={formData.isPrivileged} onChange={handleCheckboxChange} className="form-checkbox h-5 w-5 text-primary-600" />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Imtiyozli talaba</label>
                  </div>
                </div>
                {/* Gender radio group */}
                <div className="mt-4 mb-6">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Jinsi</label>
                  <div className="flex gap-4 sm:gap-6">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Erkak"
                        checked={formData.gender === "Erkak"}
                        onChange={handleInputChange}
                        className="form-radio h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-200">Erkak</span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Ayol"
                        checked={formData.gender === "Ayol"}
                        onChange={handleInputChange}
                        className="form-radio h-5 w-5 text-pink-500 border-gray-300 focus:ring-pink-400"
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-200">Ayol</span>
                    </label>
                  </div>
                </div>
                {formData.isPrivileged && (
                  <div className="mt-4 mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Imtiyoz ulushi (%)</label>
                    <input type="number" name="privilegeShare" value={formData.privilegeShare} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" min={1} max={100} />
                  </div>
                )}
              </div>
              <div className="fixed left-0 right-0 bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-end pt-4 gap-2 px-2 sm:px-8 pb-6 z-20 max-w-xl mx-auto w-full" style={{borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem'}}>
                <button type="button" onClick={() => setShowModal(false)} className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base">Bekor qilish</button>
                <button type="submit" className="px-3 sm:px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors text-sm sm:text-base" disabled={loading}>
                  {editingStudent ? 'Saqlash' : loading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                      Qo'shilmoqda...
                    </span>
                  ) : "Qo'shish"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Students;