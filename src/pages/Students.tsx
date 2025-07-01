import React, { useState } from 'react';
import { Plus, Edit, Trash2, Phone, Mail, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/useAppStore';
import DataTable from '../components/UI/DataTable';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { Link } from 'react-router-dom';

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
  const { students, payments, addStudent, updateStudent, deleteStudent } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const regionOptions = [
    { value: 'Toshkent', label: 'Toshkent' },
    { value: 'Samarqand', label: 'Samarqand' },
    { value: 'Farg‘ona', label: 'Farg‘ona' },
    { value: 'Andijon', label: 'Andijon' },
    { value: 'Buxoro', label: 'Buxoro' },
    { value: 'Namangan', label: 'Namangan' },
  ];
  const districtOptions: Record<string, { value: string; label: string }[]> = {
    'Toshkent': [
      { value: 'Yunusobod', label: 'Yunusobod' },
      { value: 'Chilonzor', label: 'Chilonzor' },
      { value: 'Olmazor', label: 'Olmazor' },
    ],
    'Samarqand': [
      { value: 'Samarqand sh.', label: 'Samarqand sh.' },
      { value: 'Urgut', label: 'Urgut' },
    ],
    'Farg‘ona': [
      { value: 'Farg‘ona sh.', label: 'Farg‘ona sh.' },
      { value: 'Qo‘qon', label: 'Qo‘qon' },
    ],
    'Andijon': [
      { value: 'Andijon sh.', label: 'Andijon sh.' },
      { value: 'Asaka', label: 'Asaka' },
    ],
    'Buxoro': [
      { value: 'Buxoro sh.', label: 'Buxoro sh.' },
      { value: 'G‘ijduvon', label: 'G‘ijduvon' },
    ],
    'Namangan': [
      { value: 'Namangan sh.', label: 'Namangan sh.' },
      { value: 'Chortoq', label: 'Chortoq' },
    ],
  };
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    room: '',
    course: 1,
    faculty: '',
    group: '',
    region: '',
    district: '',
    passport: '',
    isPrivileged: false,
    privilegeShare: '',
    avatar: '',
  });

  const columns = [
    {
      key: 'index',
      title: '№',
      render: (_: any, row: any) => (
        <span className="text-gray-500 dark:text-gray-400 font-semibold">{row._idx + 1}</span>
      ),
    },
    {
      key: 'name',
      title: 'Ism Familiya',
      sortable: true,
      render: (_, row: any) => (
        <Link to={`/profile/${row.id}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">{row.firstName} {row.lastName}</Link>
      ),
    },
    {
      key: 'facultyGroup',
      title: 'Fakultet/Guruh',
      render: (_, row: any) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">{row.faculty} / {row.group}</span>
      ),
    },
    {
      key: 'room',
      title: 'Xona',
      sortable: true,
      render: (value: string) => (
        <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 rounded-full text-sm font-medium">{value}</span>
      ),
    },
    {
      key: 'course',
      title: 'Kurs',
      sortable: true,
      render: (value: number) => (
        <span className="text-sm font-medium text-gray-900 dark:text-white">{value}-kurs</span>
      ),
    },
    {
      key: 'totalPaid',
      title: 'Umumiy to‘lov',
      render: (_, row: any) => {
        const total = payments.filter(p => p.studentId === row.id && p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
        return <span className="font-semibold text-green-600 dark:text-green-400">{total.toLocaleString()} so‘m</span>;
      },
    },
    {
      key: 'joinedAt',
      title: 'Kirgan sana',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('uz-UZ'),
    },
    {
      key: 'actions',
      title: 'Amallar',
      render: (_, row: any) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingStudent(null);
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      room: '',
      course: 1,
      faculty: '',
      group: '',
      region: '',
      district: '',
      passport: '',
      isPrivileged: false,
      privilegeShare: '',
      avatar: '',
    });
    setShowModal(true);
  };

  const handleEdit = (student: any) => {
    setEditingStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
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
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Talabani o\'chirish tasdiqlaysizmi?')) {
      deleteStudent(id);
      toast.success('Talaba muvaffaqiyatli o\'chirildi');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingStudent) {
      updateStudent(editingStudent.id, formData);
      toast.success('Talaba ma\'lumotlari yangilandi');
    } else {
      addStudent(formData);
      toast.success('Yangi talaba qo\'shildi');
    }
    
    setShowModal(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'course' ? parseInt(value) : value,
    }));
  };

  const handleSelectChange = (name: string, option: any) => {
    setFormData(prev => ({ ...prev, [name]: option ? option.value : '' }));
    if (name === 'region') setFormData(prev => ({ ...prev, district: '' }));
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

  // Qidiruv va filter
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.firstName.toLowerCase().includes(search.toLowerCase()) ||
      s.lastName.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search);
    const totalPaid = payments.filter(p => p.studentId === s.id && p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const matchesPayment =
      paymentFilter === 'all' ? true :
      (paymentFilter === 'paid' ? totalPaid > 0 : totalPaid === 0);
    return matchesSearch && matchesPayment;
  });

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
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ism yoki telefon..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <select
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Barchasi</option>
            <option value="paid">To‘lov qilganlar</option>
            <option value="unpaid">To‘lov qilmaganlar</option>
          </select>
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingStudent ? 'Talabani Tahrirlash' : 'Yangi Talaba Qo\'shish'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded transition-colors">
                <span className="text-2xl">×</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
              <div className="flex flex-col items-center gap-3 mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profil rasmi</label>
                <div className="relative w-24 h-24 group">
                  <img src={formData.avatar || '/avatar-placeholder.png'} alt="Profil" className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800" />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="absolute inset-0 opacity-0 cursor-pointer" title="Rasm yuklash" />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-white text-xs">Rasm yuklash</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ism
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Familiya
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Telefon</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+998901234567"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Xona</label>
                  <input
                    type="text"
                    name="room"
                    value={formData.room}
                    onChange={handleInputChange}
                    placeholder="101"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kurs</label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value={1}>1-kurs</option>
                    <option value={2}>2-kurs</option>
                    <option value={3}>3-kurs</option>
                    <option value={4}>4-kurs</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fakultet</label>
                  <select
                    name="faculty"
                    value={formData.faculty}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Tanlang...</option>
                    <option value="Informatika">Informatika</option>
                    <option value="Iqtisodiyot">Iqtisodiyot</option>
                    <option value="Muhandislik">Muhandislik</option>
                    <option value="Matematika">Matematika</option>
                    <option value="Fizika">Fizika</option>
                    <option value="Kimyo">Kimyo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Guruh</label>
                  <input
                    type="text"
                    name="group"
                    value={formData.group}
                    onChange={handleInputChange}
                    placeholder="IF-21-01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Viloyat/Shahar</label>
                  <Select
                    options={regionOptions}
                    value={regionOptions.find(opt => opt.value === formData.region) || null}
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
                    options={formData.region ? districtOptions[formData.region] : []}
                    value={formData.region ? (districtOptions[formData.region].find(opt => opt.value === formData.district) || null) : null}
                    onChange={opt => handleSelectChange('district', opt)}
                    isClearable
                    placeholder="Tuman tanlang..."
                    styles={selectStyles}
                    classNamePrefix="react-select"
                    isDisabled={!formData.region}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Passport ma'lumoti</label>
                  <input
                    type="text"
                    name="passport"
                    value={formData.passport}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div className="flex items-center gap-2 mt-8">
                  <input
                    type="checkbox"
                    name="isPrivileged"
                    checked={formData.isPrivileged}
                    onChange={handleCheckboxChange}
                    className="form-checkbox h-5 w-5 text-primary-600"
                  />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Imtiyozli talaba</label>
                </div>
              </div>
              {formData.isPrivileged && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Imtiyoz ulushi (%)</label>
                  <input
                    type="number"
                    name="privilegeShare"
                    value={formData.privilegeShare}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    min={1}
                    max={100}
                    required
                  />
                </div>
              )}
              <div className="fixed left-0 right-0 bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-end pt-4 gap-2 px-8 pb-6 z-20 max-w-xl mx-auto w-full" style={{borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem'}}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"
                >
                  {editingStudent ? 'Saqlash' : 'Qo‘shish'}
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