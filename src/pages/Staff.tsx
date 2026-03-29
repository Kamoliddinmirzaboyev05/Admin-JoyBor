import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Edit2, 
  Trash2, 
  X, 
  User, 
  Briefcase, 
  Phone, 
  DollarSign,
  ChevronRight,
  UserCheck,
  Calendar,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DataTable from '../components/UI/DataTable';
import api from '../data/api';

const ROLES_MAP: Record<string, string> = {
  "manager": "Boshqaruvchi",
  "admin": "Administrator",
  "guard": "Xavfsizlik xodimi",
  "cleaner": "Tozalik xodimi",
  "technician": "Texnik xodim",
  "cook": "Oshpaz"
};

const ROLES_OPTIONS = [
  { value: "manager", label: "Boshqaruvchi" },
  { value: "admin", label: "Administrator" },
  { value: "guard", label: "Xavfsizlik xodimi" },
  { value: "cleaner", label: "Tozalik xodimi" },
  { value: "technician", label: "Texnik xodim" },
  { value: "cook", label: "Oshpaz" }
];

const Staff: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<any>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    position: ROLES_OPTIONS[0].value,
    phone: '',
    salary: '',
  });

  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');

  // Fetch staff list
  const { data: staffData, isLoading } = useQuery({
    queryKey: ['staff', search, positionFilter],
    queryFn: () => api.getStaff({ search, position: positionFilter })
  });

  const staffList = Array.isArray(staffData?.results) ? staffData.results : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Add/Edit mutation
  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (editStaff) {
        return api.updateStaff(editStaff.id, data);
      }
      return api.createStaff({
        ...data,
        salary: Number(data.salary.replace(/[^0-9]/g, '')),
        hired_date: new Date().toISOString().split('T')[0],
        is_active: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setIsModalOpen(false);
      setEditStaff(null);
      setFormData({ name: '', last_name: '', position: ROLES_OPTIONS[0].value, phone: '', salary: '' });
      toast.success(editStaff ? "Xodim ma'lumotlari yangilandi" : "Yangi xodim muvaffaqiyatli qo'shildi");
    },
    onError: (error: any) => {
      toast.error(error.message || "Xatolik yuz berdi");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.error("Xodim tizimdan o'chirildi");
    },
    onError: (error: any) => {
      toast.error(error.message || "O'chirishda xatolik");
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Haqiqatan ham ushbu xodimni o'chirmoqchimisiz?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (staff: any) => {
    setEditStaff(staff);
    setFormData({
      name: staff.name,
      last_name: staff.last_name,
      position: staff.position,
      phone: staff.phone,
      salary: staff.salary.toString(),
    });
    setIsModalOpen(true);
  };

  const columns = [
    {
      key: 'name',
      title: 'Xodim',
      sortable: true,
      render: (_: unknown, row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
            {row.name[0]}{row.last_name?.[0]}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{row.name} {row.last_name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{row.phone}</span>
          </div>
        </div>
      )
    },
    {
      key: 'position',
      title: 'Lavozim',
      sortable: true,
      render: (value: unknown) => (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
          {ROLES_MAP[String(value)] || String(value)}
        </span>
      )
    },
    {
      key: 'salary',
      title: 'Maosh',
      sortable: true,
      render: (value: unknown) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {Number(value).toLocaleString()}
          </span>
          <span className="text-[10px] text-gray-400 font-bold uppercase">UZS</span>
        </div>
      )
    },
    {
      key: 'is_active',
      title: 'Holati',
      sortable: true,
      render: (value: unknown) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
          value 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full mr-2 ${value ? 'bg-green-500' : 'bg-amber-500'}`}></span>
          {value ? 'Ishda' : 'Nofaol'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Amallar',
      render: (_: unknown, row: any) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
            title="Tahrirlash"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
            title="O'chirish"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      
      {/* Header Section - Fixed */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-shrink-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Xodimlar
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Tizimdagi barcha xodimlarni boshqarish va monitoring qilish
              </p>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Qidirish..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all w-full sm:w-64"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                >
                  <option value="">Barcha lavozimlar</option>
                  {ROLES_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditStaff(null);
              setFormData({ name: '', last_name: '', position: ROLES_OPTIONS[0].value, phone: '', salary: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            <UserPlus className="w-5 h-5" />
            <span>Xodim qo'shish</span>
          </motion.button>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-8">
        <DataTable 
          data={staffList} 
          columns={columns as any}
        />
      </div>

      {/* Add/Edit Employee Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400 shadow-inner">
                      {editStaff ? <Edit2 className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                        {editStaff ? "Xodimni tahrirlash" : "Xodim qo'shish"}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        {editStaff ? "Xodim ma'lumotlarini yangilang" : "Yangi xodim ma'lumotlarini kiriting"}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all text-slate-400 hover:text-red-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
                          Ismi
                        </label>
                        <input 
                          required
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Ali"
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 transition-all outline-none font-semibold"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
                          Familiyasi
                        </label>
                        <input 
                          required
                          type="text" 
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          placeholder="Valiyev"
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 transition-all outline-none font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        Lavozim
                      </label>
                      <div className="relative">
                        <select 
                          name="position"
                          value={formData.position}
                          onChange={handleInputChange}
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl text-slate-900 dark:text-white focus:ring-0 transition-all outline-none cursor-pointer appearance-none font-semibold"
                        >
                          {ROLES_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <ChevronRight className="w-5 h-5 rotate-90" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="flex items-center gap-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
                          <Phone className="w-3.5 h-3.5" />
                          Telefon
                        </label>
                        <input 
                          required
                          type="text" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+998 90 123 45 67"
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 transition-all outline-none font-semibold"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          Maosh
                        </label>
                        <input 
                          required
                          type="text" 
                          name="salary"
                          value={formData.salary}
                          onChange={handleInputChange}
                          placeholder="4,500,000"
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 transition-all outline-none font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-95"
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="submit"
                      disabled={saveMutation.isPending}
                      className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {saveMutation.isPending ? "Saqlanmoqda..." : (editStaff ? "Yangilash" : "Qo'shish")}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Staff;
