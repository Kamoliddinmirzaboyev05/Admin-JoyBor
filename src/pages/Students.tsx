import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Phone, Mail, User, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../stores/useAppStore';
import DataTable from '../components/UI/DataTable';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { Link, useNavigate } from 'react-router-dom';
import { toast as sonnerToast } from 'sonner';
import NProgress from 'nprogress';

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
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [provinces, setProvinces] = useState<{ id: number; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: number; name: string; province: number }[]>([]);
  const regionOptions = provinces.map(p => ({ value: p.id, label: p.name }));
  const districtOptions = districts.map(d => ({ value: d.id, label: d.name }));
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    fatherName: "",
    phone: "",
    email: "",
    room: "",
    course: 1,
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
  });

  const columns = [
    {
      key: "index",
      title: "№",
      render: (_: any, row: any) => (
        <span className="text-gray-500 dark:text-gray-400 font-semibold">{row._idx + 1}</span>
      ),
    },
    {
      key: "fullName",
      title: "Ism Familiya",
      sortable: true,
      render: (_: any, row: any) => (
        <Link to={`/profile/${row.id}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">{row.name} {row.last_name}</Link>
      ),
    },
    {
      key: "faculty",
      title: "Fakultet",
      render: (value: string) => <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>,
    },
    {
      key: "direction",
      title: "Yo'nalish",
      render: (value: string) => <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>,
    },
    {
      key: "room",
      title: "Xona",
      render: (_: any, row: any) => <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 rounded-full text-sm font-medium">{row.room?.name || "-"}</span>,
    },
    {
      key: "floor",
      title: "Qavat",
      render: (_: any, row: any) => <span className="text-sm text-gray-700 dark:text-gray-300">{row.floor?.name || "-"}</span>,
    },
    {
      key: "province",
      title: "Viloyat",
      render: (_: any, row: any) => <span className="text-sm text-gray-700 dark:text-gray-300">{row.province?.name || "-"}</span>,
    },
    {
      key: "district",
      title: "Tuman",
      render: (_: any, row: any) => <span className="text-sm text-gray-700 dark:text-gray-300">{row.district?.name || "-"}</span>,
    },
    {
      key: "phone",
      title: "Telefon",
      render: (value: string) => <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>,
    },
    {
      key: "total_payment",
      title: "Umumiy to'lov",
      render: (value: number) => <span className="font-semibold text-green-600 dark:text-green-400">{value?.toLocaleString()} so'm</span>,
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
      course: 1,
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
    });
    setShowModal(true);
  };

  const handleEdit = (student: any) => {
    setEditingStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      fatherName: student.fatherName,
      phone: student.phone,
      email: student.email,
      room: student.room,
      course: student.course,
      faculty: student.faculty,
      group: student.group,
      region: student.region,
      district: student.district,
      passport: student.passport,
      isPrivileged: student.isPrivileged,
      privilegeShare: student.privilegeShare,
      avatar: student.avatar,
      direction: student.direction,
      floor: student.floor,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Talabani ochirish tasdiqlaysizmi?')) {
      // deleteStudent(id);
      toast.success('Talaba muvaffaqiyatli ochirildi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingStudent) {
      // updateStudent(editingStudent.id, formData);
      toast.success('Talaba malumotlari yangilandi');
    } else {
      try {
        // ... your API call logic ...
        toast.success("Talaba muvaffaqiyatli qo'shildi!");
        setShowModal(false);
      } catch (err: any) {
        toast.error("Talaba qo'shishda xatolik: " + err.message);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'course' ? parseInt(value) : value,
    }));
  };

  const handleSelectChange = (name: string, option: any) => {
    setFormData(prev => ({ ...prev, [name]: option ? String(option.value) : "" }));
    if (name === "region") setFormData(prev => ({ ...prev, district: "" }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  // Add filter states for gender, payment status, and floor
  const [genderFilter, setGenderFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [floorFilter, setFloorFilter] = useState("");

  // Filtering logic
  const filteredStudents = students.filter(s => {
    const matchesGender = genderFilter ? s.gender === genderFilter : true;
    // Assume s.total_payment and s.tarif exist and are numbers
    let isHaqdor = false;
    let isQarzdor = false;
    if (typeof s.total_payment === "number" && s.tarif) {
      const tarifNum = Number(String(s.tarif).replace(/[^\d]/g, ""));
      isHaqdor = s.total_payment >= tarifNum;
      isQarzdor = s.total_payment < tarifNum;
    }
    const matchesPayment = paymentStatusFilter === "haqdor" ? isHaqdor : paymentStatusFilter === "qarzdor" ? isQarzdor : true;
    const matchesFloor = floorFilter ? (s.floor && s.floor.name === floorFilter) : true;
    return matchesGender && matchesPayment && matchesFloor;
  });

  const navigate = useNavigate();

  // Simulate loading for demonstration
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("access");
    const headers: HeadersInit = token ? { "Authorization": `Bearer ${token}` } : {};
    fetch("https://joyboryangi.pythonanywhere.com/students/", { headers })
      .then(res => {
        if (!res.ok) throw new Error("Serverdan togri javob kelmadi");
        return res.json();
      })
      .then(data => {
        setStudents(data);
        setFetchError("");
      })
      .catch(err => {
        setFetchError("Talabalarni yuklashda xatolik: " + err.message);
      })
      .finally(() => setLoading(false));

    // Fetch provinces
    fetch("https://joyboryangi.pythonanywhere.com/provinces/", { headers })
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
    const token = localStorage.getItem("access");
    const headers: HeadersInit = token ? { "Authorization": `Bearer ${token}` } : {};
    fetch(`https://joyboryangi.pythonanywhere.com/districts/?province=${formData.region}`, { headers })
      .then(res => {
        if (!res.ok) throw new Error("Tumanlarni yuklashda xatolik");
        return res.json();
      })
      .then(data => setDistricts(data))
      .catch(() => setDistricts([]));
  }, [formData.region]);

  // Show only loading bar and spinner until data is loaded
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  if (fetchError) {
    return <div className="text-center py-10 text-red-600 dark:text-red-400">{fetchError}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Talabalar</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Yotoqxonadagi barcha talabalar ro'yxati va boshqaruvi
          </p>
        </div>
      </motion.div>

      {/* Filter va qidiruv */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-3 items-center mb-4">
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
            options={Array.from(new Set(students.map(s => s.floor?.name))).filter(Boolean).map(floor => ({ value: floor, label: floor }))}
            value={floorFilter ? { value: floorFilter, label: floorFilter } : null}
            onChange={opt => setFloorFilter(opt ? String(opt.value) : "")}
            isClearable
            placeholder="Qavat"
            styles={selectStyles}
            classNamePrefix="react-select"
            className="min-w-[120px]"
          />
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Talaba</span>
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredStudents.map((s, idx) => ({ ...s, _idx: idx }))}
        columns={columns}
        actions={null}
      />

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

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-8 pb-32 space-y-8">
              {/* Profil rasmi */}
              <div className="flex flex-col items-center gap-3 mb-4">
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">Profil rasmi</label>
                <div className="relative w-24 h-24 group">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
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
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  {/* Remove button */}
                  {formData.avatar && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                      className="absolute -top-2 -right-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-full p-1 shadow hover:bg-red-500 hover:text-white transition-colors z-30"
                      aria-label="Rasmni olib tashlash"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Shaxsiy ma'lumotlar */}
              <div>
                <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Shaxsiy ma'lumotlar</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ism</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Familiya</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Otasining ismi</label>
                    <input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Telefon</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+998901234567" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
                  </div>
                </div>
              </div>
              <hr className="my-2 border-gray-200 dark:border-gray-700" />

              {/* Universitet ma'lumotlari */}
              <div>
                <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Universitet ma'lumotlari</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fakultet</label>
                    <input type="text" name="faculty" value={formData.faculty} onChange={handleInputChange} placeholder="Fakultet nomi" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Yo'nalish</label>
                    <input type="text" name="direction" value={formData.direction} onChange={handleInputChange} placeholder="Yo'nalish nomi" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Guruh</label>
                    <input type="text" name="group" value={formData.group} onChange={handleInputChange} placeholder="IF-21-01" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kurs</label>
                    <select name="course" value={formData.course} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value={1}>1-kurs</option>
                      <option value={2}>2-kurs</option>
                      <option value={3}>3-kurs</option>
                      <option value={4}>4-kurs</option>
                    </select>
                  </div>
                </div>
              </div>
              <hr className="my-2 border-gray-200 dark:border-gray-700" />

              {/* Yashash ma'lumotlari */}
              <div>
                <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Yashash ma'lumotlari</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Qavat</label>
                    <Select
                      options={floorOptions}
                      value={floorOptions.find(opt => opt.value === formData.floor) || null}
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
                      value={roomOptions.find(opt => opt.value === formData.room) || null}
                      onChange={opt => handleSelectChange('room', opt)}
                      isClearable
                      placeholder="Xona tanlang..."
                      styles={selectStyles}
                      classNamePrefix="react-select"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Viloyat/Shahar</label>
                    <Select
                      options={regionOptions}
                      value={regionOptions.find(opt => opt.value === Number(formData.region)) || null}
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
                      value={districtOptions.find(opt => opt.value === Number(formData.district)) || null}
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
                <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Qo'shimcha</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Passport ma'lumoti</label>
                    <input type="text" name="passport" value={formData.passport} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" required />
                  </div>
                  <div className="flex items-center gap-2 mt-8">
                    <input type="checkbox" name="isPrivileged" checked={formData.isPrivileged} onChange={handleCheckboxChange} className="form-checkbox h-5 w-5 text-primary-600" />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Imtiyozli talaba</label>
                  </div>
                </div>
                {formData.isPrivileged && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Imtiyoz ulushi (%)</label>
                    <input type="number" name="privilegeShare" value={formData.privilegeShare} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" min={1} max={100} required={formData.isPrivileged} />
                  </div>
                )}
              </div>
              <div className="fixed left-0 right-0 bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-end pt-4 gap-2 px-8 pb-6 z-20 max-w-xl mx-auto w-full" style={{borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem'}}>
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Bekor qilish</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors">{editingStudent ? 'Saqlash' : 'Qo\'shish'}</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Students;