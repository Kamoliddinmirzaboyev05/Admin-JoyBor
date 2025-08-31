import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import DataTable from '../components/UI/DataTable';
import { toast } from 'sonner';
import Select from 'react-select';
import { Link, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiQueries } from '../data/api';
// import { useAppStore } from '../stores/useAppStore';
import { link } from '../data/config';
import axios from 'axios';
import { formatCurrency } from '../utils/formatters';
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

const Students: React.FC = () => {
  const queryClient = useQueryClient();
  const { emitStudentUpdate, subscribe } = useGlobalEvents();
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Record<string, unknown> | null>(null);

  // formData'ga gender va course string maydonini qo'sh
  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    fatherName: string;
    phone: string;
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
    direction: "",
    floor: "",
    gender: "",
    passportImage1: null,
    passportImage2: null,
  });
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  // Fetch provinces using React Query
  const { data: provincesData = [] } = useQuery({
    queryKey: ['provinces'],
    queryFn: apiQueries.getProvinces,
    staleTime: 1000 * 60 * 10, // 10 daqiqa cache
  });

  // Fetch districts for selected province using React Query
  const { data: districtsData = [] } = useQuery({
    queryKey: ['districts', formData.region],
    queryFn: () => formData.region ? apiQueries.getDistricts(Number(formData.region)) : Promise.resolve([]),
    enabled: !!formData.region,
    staleTime: 1000 * 60 * 10, // 10 daqiqa cache
  });

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

  // Fetch available floors using React Query
  const { data: floorsData = [] } = useQuery({
    queryKey: ['available-floors'],
    queryFn: apiQueries.getAvailableFloors,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch available rooms for selected floor using React Query
  const { data: roomsData = [] } = useQuery({
    queryKey: ['available-rooms', formData.floor],
    queryFn: () => formData.floor ? apiQueries.getAvailableRooms(Number(formData.floor)) : Promise.resolve([]),
    enabled: !!formData.floor,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch all rooms for filter dropdown
  const { data: allRoomsData = [] } = useQuery({
    queryKey: ['all-rooms'],
    queryFn: () => apiQueries.getRooms(),
    staleTime: 1000 * 60 * 5,
  });

  const regionOptions = Array.isArray(provincesData)
    ? provincesData.map((p: any) => ({ value: String(p.id), label: p.name }))
    : [];
  const districtOptions = Array.isArray(districtsData)
    ? districtsData.map((d: any) => ({ value: String(d.id), label: d.name }))
    : [];
  const floorOptions = Array.isArray(floorsData)
    ? floorsData.map((f: any) => ({
      value: String(f.id),
      label: `${f.name.endsWith('-qavat') ? f.name : `${f.name}-qavat`} (${f.gender === 'male' ? 'Yigitlar' : 'Qizlar'})`
    }))
    : [];
  const roomOptions = Array.isArray(roomsData)
    ? roomsData
      .sort((a: any, b: any) => {
        // Xona nomlarini raqam bo'yicha saralash
        const aNum = parseInt(a.name.replace(/\D/g, '')) || 0;
        const bNum = parseInt(b.name.replace(/\D/g, '')) || 0;
        return aNum - bNum;
      })
      .map((r: any) => ({ value: String(r.id), label: r.name }))
    : [];

  const allRoomOptions = Array.isArray(allRoomsData)
    ? allRoomsData.map((r: any) => ({ value: String(r.id), label: r.name }))
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
      title: "Familiya Ism",
      sortable: true,
      render: (_: any, row: Record<string, unknown>) => (
        <Link to={`/studentprofile/${row.id}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">{String(row.last_name)} {String(row.name)}</Link>
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
      render: (value: unknown) => <span className="font-semibold text-green-600 dark:text-green-400">{typeof value === 'number' ? formatCurrency(value) : '-'}</span>,
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
      firstName: student.first_name || "",
      lastName: student.last_name || "",
      fatherName: student.father_name || "",
      phone: student.phone || "",
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
      direction: student.direction || "",
      floor: student.floor && typeof student.floor === 'object' ? String(student.floor.id) : "",
      gender: student.gender || "",
      passportImage1: null,
      passportImage2: null,
    });
    setAvatarPreview(student.picture || "");
    setShowModal(true);
  };

  // Validation funksiyasi
  const validateForm = () => {
    const errors: string[] = [];

    // Majburiy maydonlarni tekshirish
    if (!formData.firstName.trim()) {
      errors.push("Ism kiritilishi shart");
    }
    if (!formData.lastName.trim()) {
      errors.push("Familiya kiritilishi shart");
    }
    if (!formData.fatherName.trim()) {
      errors.push("Otasining ismi kiritilishi shart");
    }
    if (!formData.phone.trim()) {
      errors.push("Telefon raqami kiritilishi shart");
    }
    if (!formData.passport.trim()) {
      errors.push("Pasport seriyasi kiritilishi shart");
    }
    if (!formData.direction.trim()) {
      errors.push("Yo'nalish kiritilishi shart");
    }
    if (!formData.faculty.trim()) {
      errors.push("Fakultet kiritilishi shart");
    }
    if (!formData.group.trim()) {
      errors.push("Guruh kiritilishi shart");
    }
    if (!formData.gender.trim()) {
      errors.push("Jins tanlanishi shart");
    }
    if (!formData.course.trim()) {
      errors.push("Kurs tanlanishi shart");
    }
    if (!formData.region.trim()) {
      errors.push("Viloyat tanlanishi shart");
    }
    if (!formData.district.trim()) {
      errors.push("Tuman tanlanishi shart");
    }
    if (!formData.floor.trim()) {
      errors.push("Qavat tanlanishi shart");
    }
    if (!formData.room.trim()) {
      errors.push("Xona tanlanishi shart");
    }


    // Telefon raqami formatini tekshirish
    if (formData.phone.trim()) {
      const phoneRegex = /^(\+998|998|8)?[0-9]{9}$/;
      const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        errors.push("Telefon raqami noto'g'ri formatda");
      }
    }

    // Pasport formatini tekshirish
    if (formData.passport.trim()) {
      const passportRegex = /^[A-Z]{2}[0-9]{7}$/;
      if (!passportRegex.test(formData.passport.toUpperCase())) {
        errors.push("Pasport seriyasi noto'g'ri formatda (masalan: AB1234567)");
      }
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation tekshirish (faqat yangi talaba qo'shishda)
    if (!editingStudent) {
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        // Birinchi xatolikni ko'rsatish
        toast.error(validationErrors[0]);
        return;
      }
    }

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
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: option ? option.value : '',
      };

      // Agar qavat o'zgarsa, xonani tozalash
      if (name === 'floor') {
        newData.room = '';
      }

      // Agar viloyat o'zgarsa, tumanni tozalash
      if (name === 'region') {
        newData.district = '';
      }

      return newData;
    });
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

  // Add filter states for gender, payment status, and room
  const [genderFilter, setGenderFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");

  // Debug: API dan kelayotgan ma'lumotlarni ko'rish
  React.useEffect(() => {
    if (students.length > 0) {
      console.log('Students data sample:', students.slice(0, 2).map((s: Record<string, any>) => ({
        name: s.name,
        total_payment: s.total_payment,
        tarif: s.tarif,
        gender: s.gender
      })));
    }
  }, [students]);

  // Filtering and sorting logic
  const filteredStudents = students
    .filter((s: Record<string, any>) => {
      // Gender filter validation

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

        // Debug gender filter
        if (genderFilter && students.indexOf(s as Record<string, any>) < 3) {
          console.log(`Gender filter debug for ${s.name}:`, {
            studentGender,
            filterGender,
            matchesGender
          });
        }
      }

      // Payment filter
      let matchesPayment = true;

      if (paymentStatusFilter) {
        // Total payment ni olish
        const totalPayment = Number(s.total_payment) || 0;

        // Tarif qiymatini olish
        let tarif = 0;
        if (s.tarif !== undefined && s.tarif !== null) {
          if (typeof s.tarif === 'number') {
            tarif = s.tarif;
          } else if (typeof s.tarif === 'string') {
            // String dan barcha raqamlarni olish
            const numStr = s.tarif.replace(/[^\d]/g, '');
            tarif = numStr ? Number(numStr) : 0;
          }
        }

        // Agar tarif hali ham 0 yoki yo'q bo'lsa, default qiymat
        if (tarif <= 0) {
          tarif = 1200000; // Default oylik tarif
        }

        // Haqdor/qarzdor logikasi
        const isHaqdor = totalPayment >= tarif;
        const isQarzdor = totalPayment < tarif;

        // Filter bo'yicha tekshirish
        if (paymentStatusFilter === "haqdor") {
          matchesPayment = isHaqdor;
        } else if (paymentStatusFilter === "qarzdor") {
          matchesPayment = isQarzdor;
        }

        // Debug payment filter (faqat birinchi 3 ta talaba uchun)
        if (paymentStatusFilter && students.indexOf(s as Record<string, any>) < 3) {
          console.log(`Payment filter debug for ${s.name || s.last_name}:`, {
            originalTarif: s.tarif,
            parsedTarif: tarif,
            totalPayment,
            isHaqdor,
            isQarzdor,
            filter: paymentStatusFilter,
            matchesPayment
          });
        }
      }

      // Room filter
      let matchesRoom = true;
      if (roomFilter) {
        const studentRoom = s.room;
        if (studentRoom && typeof studentRoom === 'object' && studentRoom.id) {
          matchesRoom = String(studentRoom.id) === roomFilter;
        } else {
          matchesRoom = false;
        }
      }

      const finalMatch = matchesGender && matchesPayment && matchesRoom;

      // Debug final filter result
      if ((genderFilter || paymentStatusFilter || roomFilter) && students.indexOf(s as Record<string, any>) < 3) {
        console.log(`Final filter result for ${s.name}:`, {
          matchesGender,
          matchesPayment,
          matchesRoom,
          finalMatch
        });
      }

      return finalMatch;
    })
    .sort((a: Record<string, any>, b: Record<string, any>) => {
      // Familiya bo'yicha alifbo tartibida saralash
      const lastNameA = (a.last_name || '').toLowerCase();
      const lastNameB = (b.last_name || '').toLowerCase();
      return lastNameA.localeCompare(lastNameB, 'uz-UZ');
    });





  // Listen for global student updates
  useEffect(() => {
    const unsubscribe = subscribe('student-updated', () => {
      refetch();
    });
    return unsubscribe;
  }, [subscribe, refetch]);

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
            faculty: studentData.faculty || '',
            group: studentData.group || '',
            passport: studentData.passport || '',
            course: studentData.course || '1-kurs',
            gender: studentData.gender || 'Erkak',
            isPrivileged: studentData.isPrivileged || false,
            region: studentData.province || '',
            district: studentData.district || '',
            avatar: studentData.imageUrl || '',
            passportImage1: studentData.passportImage1Base64 || null,
            passportImage2: studentData.passportImage2Base64 || null,
          }));
          
          // Avatar preview ni ham o'rnatish
          if (studentData.imageUrl) {
            setAvatarPreview(studentData.imageUrl);
          }
          // Ma'lumotlarni tozalash
          sessionStorage.removeItem('pendingStudentData');
          toast.success('Ariza ma\'lumotlari yuklandi! Qo\'shimcha ma\'lumotlarni to\'ldiring.');
        } catch (error) {
          console.error('Pending student data parse error:', error);
          sessionStorage.removeItem('pendingStudentData');
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
    formdata.append("tarif", "1200000"); // Default tarif
    if (formData.isPrivileged) formdata.append("privilege", String(formData.isPrivileged));
    if (formData.privilegeShare) {
      formdata.append("privilegeShare", formData.privilegeShare);
    }
    if (formData.gender) formdata.append("gender", formData.gender);
    if (formData.course) formdata.append("course", formData.course);
    // Avatar handling - both File and URL string
    if (formData.avatar) {
      if (typeof formData.avatar !== "string" && formData.avatar instanceof File) {
        // File upload
        formdata.append("picture", formData.avatar);
      } else if (typeof formData.avatar === "string" && formData.avatar.trim()) {
        // URL string - send as picture_url
        formdata.append("picture_url", formData.avatar);
      }
    }

    // Passport images handling
    if (formData.passportImage1) {
      if (typeof formData.passportImage1 !== "string" && formData.passportImage1 instanceof File) {
        formdata.append("passport_image_first", formData.passportImage1);
      } else if (typeof formData.passportImage1 === "string" && formData.passportImage1.trim()) {
        formdata.append("passport_image_first_url", formData.passportImage1);
      }
    }

    if (formData.passportImage2) {
      if (typeof formData.passportImage2 !== "string" && formData.passportImage2 instanceof File) {
        formdata.append("passport_image_second", formData.passportImage2);
      } else if (typeof formData.passportImage2 === "string" && formData.passportImage2.trim()) {
        formdata.append("passport_image_second_url", formData.passportImage2);
      }
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
          // API error logged
          toast.error(result.detail || result.message || JSON.stringify(result) || "Xatolik yuz berdi");
          throw new Error(result.detail || result.message || JSON.stringify(result) || "Xatolik yuz berdi");
        }
        // Barcha bog'liq cache larni yangilash
        await invalidateStudentCaches(queryClient);
        // Force immediate refetch
        await refetch();
        // Emit global event
        emitStudentUpdate({ action: 'created' });
        setShowModal(false);
        toast.success("Talaba muvaffaqiyatli qo'shildi!");
      })
      .catch((error) => {
        // Catch error logged
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
            {(genderFilter || paymentStatusFilter || roomFilter) && (
              <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">
                ({filteredStudents.length} ta natija)
              </span>
            )}
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
          <Select
            options={allRoomOptions}
            value={roomFilter ? allRoomOptions.find(opt => opt.value === roomFilter) || null : null}
            onChange={opt => setRoomFilter(opt ? String(opt.value) : "")}
            isClearable
            placeholder="Xona"
            styles={selectStyles}
            classNamePrefix="react-select"
            className="min-w-[120px]"
          />

          {/* Filter reset button */}
          {(genderFilter || paymentStatusFilter || roomFilter) && (
            <button
              onClick={() => {
                setGenderFilter("");
                setPaymentStatusFilter("");
                setRoomFilter("");
              }}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Filterlarni tozalash
            </button>
          )}
        </div>

        {/* Filter results info */}
        {(genderFilter || paymentStatusFilter || roomFilter) && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {filteredStudents.length}
            </span> ta natija topildi
            {genderFilter && (
              <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                {genderFilter === "male" ? "Erkak" : "Ayol"}
              </span>
            )}
            {paymentStatusFilter && (
              <span className={`ml-2 px-2 py-1 rounded text-xs ${paymentStatusFilter === "haqdor"
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                }`}>
                {paymentStatusFilter === "haqdor" ? "Haqdor" : "Qarzdor"}
              </span>
            )}
            {roomFilter && (
              <span className="ml-2 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">
                {allRoomOptions.find(opt => opt.value === roomFilter)?.label || roomFilter}
              </span>
            )}
          </div>
        )}
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ism <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      placeholder="Talabaning ismini kiriting"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Familiya <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      placeholder="Talabaning familiyasini kiriting"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Otasining ismi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      required
                      placeholder="Otasining ismini kiriting"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Telefon <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="+998901234567"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <hr className="my-2 border-gray-200 dark:border-gray-700" />

              {/* Universitet ma'lumotlari */}
              <div>
                <div className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Universitet ma'lumotlari</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fakultet <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="faculty"
                      value={formData.faculty}
                      onChange={handleInputChange}
                      required
                      placeholder="Fakultet nomi"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Yo'nalish <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="direction"
                      value={formData.direction}
                      onChange={handleInputChange}
                      required
                      placeholder="Yo'nalish nomi"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Guruh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="group"
                      value={formData.group}
                      onChange={handleInputChange}
                      required
                      placeholder="IF-21-01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
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
                    <span className="text-xs text-gray-500 mt-1">Qavat tanlang, keyin to'lmagan xonalar ko'rsatiladi</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Xona</label>
                    <Select
                      options={roomOptions}
                      value={roomOptions.find(opt => String(opt.value) === String(formData.room)) || null}
                      onChange={opt => handleSelectChange('room', opt)}
                      isClearable
                      placeholder="To'lmagan xona tanlang..."
                      styles={selectStyles}
                      classNamePrefix="react-select"
                      isDisabled={!formData.floor}
                    />
                    {!formData.floor && (
                      <span className="text-xs text-gray-500 mt-1">Avval qavat tanlang</span>
                    )}
                    {formData.floor && roomOptions.length === 0 && (
                      <span className="text-xs text-orange-500 mt-1">Bu qavatda bo'sh xona yo'q</span>
                    )}
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Passport ma'lumoti <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="passport"
                      value={formData.passport}
                      onChange={handleInputChange}
                      required
                      placeholder="AB1234567"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
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
              <div className="fixed left-0 right-0 bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-end pt-4 gap-2 px-2 sm:px-8 pb-6 z-20 max-w-xl mx-auto w-full" style={{ borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
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
