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
  
  const [formData, setFormData] = useState<any>({
    name: '',
    last_name: '',
    position: ROLES_OPTIONS[0].value,
    phone: '',
    salary: '',
    hired_date: new Date().toISOString().split('T')[0],
    is_active: true,
    photo: null,
    file: null,
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
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setFormData((prev: any) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'file') {
      setFormData((prev: any) => ({ ...prev, [name]: (e.target as HTMLInputElement).files?.[0] }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  // Add/Edit mutation
  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      const form = new FormData();
      form.append('name', data.name);
      form.append('last_name', data.last_name);
      form.append('position', data.position);
      form.append('phone', data.phone);
      form.append('salary', data.salary.toString().replace(/[^0-9]/g, ''));
      form.append('hired_date', data.hired_date);
      form.append('is_active', data.is_active.toString());
      
      if (data.photo instanceof File) form.append('photo', data.photo);
      if (data.file instanceof File) form.append('file', data.file);

      if (editStaff) {
        return api.updateStaff(editStaff.id, form);
      }
      return api.createStaff(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setIsModalOpen(false);
      setEditStaff(null);
      setFormData({ 
        name: '', 
        last_name: '', 
        position: ROLES_OPTIONS[0].value, 
        phone: '', 
        salary: '',
        hired_date: new Date().toISOString().split('T')[0],
        is_active: true,
        photo: null,
        file: null,
      });
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
      hired_date: staff.hired_date || new Date().toISOString().split('T')[0],
      is_active: staff.is_active,
      photo: null,
      file: null,
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
          {row.photo ? (
            <img 
              src={row.photo} 
              alt={row.name} 
              className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-slate-700"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
              {row.name[0]}{row.last_name?.[0]}
            </div>
          )}
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
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-white dark:bg-slate-800 w-full max-w-2xl rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-slate-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                      {editStaff ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {editStaff ? "Xodimni tahrirlash" : "Yangi xodim qo'shish"}
                      </h3>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all text-slate-400 hover:text-red-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                          Ismi *
                        </label>
                        <input 
                          required
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Ism"
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                          Familiyasi
                        </label>
                        <input 
                          type="text" 
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          placeholder="Familiya"
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                          Lavozimi
                        </label>
                        <select 
                          name="position"
                          value={formData.position}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                        >
                          {ROLES_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                          Telefon raqami
                        </label>
                        <input 
                          type="text" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+998"
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                        />
                      </div>
                    </div>

                    {/* Additional Info & Files */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                          Maoshi (UZS)
                        </label>
                        <input 
                          type="number" 
                          name="salary"
                          value={formData.salary}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                          Ishga kirgan sanasi
                        </label>
                        <input 
                          type="date" 
                          name="hired_date"
                          value={formData.hired_date}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                          Rasmi (Photo)
                        </label>
                        <input 
                          type="file" 
                          name="photo"
                          onChange={handleInputChange}
                          accept="image/*"
                          className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-400 hover:file:bg-blue-100 transition-all cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                          Hujjat (File)
                        </label>
                        <input 
                          type="file" 
                          name="file"
                          onChange={handleInputChange}
                          className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-400 hover:file:bg-blue-100 transition-all cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 py-2">
                    <input 
                      type="checkbox" 
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-all"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Hozirda faol (Ishda)
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-slate-600 transition-all active:scale-[0.98] text-sm"
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="submit"
                      disabled={saveMutation.isPending}
                      className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] text-sm disabled:opacity-50"
                    >
                      {saveMutation.isPending ? "Saqlanmoqda..." : (editStaff ? "Yangilash" : "Xodimni saqlash")}
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
