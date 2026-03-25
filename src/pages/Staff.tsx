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
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/UI/DataTable';

// Mock data for employees
const MOCK_STAFF = [
  {
    id: 1,
    name: "Azamat Toshpo'latov",
    role: "Boshqaruvchi",
    phone: "+998 90 123 45 67",
    salary: "8,500,000",
    status: "Ishda",
    avatar: "https://i.pravatar.cc/150?u=1",
    email: "azamat@joybor.uz",
    joined_date: "2023-01-15"
  },
  {
    id: 2,
    name: "Malika Ahmedova",
    role: "Administrator",
    phone: "+998 93 987 65 43",
    salary: "5,000,000",
    status: "Ishda",
    avatar: "https://i.pravatar.cc/150?u=2",
    email: "malika@joybor.uz",
    joined_date: "2023-03-20"
  },
  {
    id: 3,
    name: "Jasur Karimov",
    role: "Xavfsizlik xodimi",
    phone: "+998 94 555 44 33",
    salary: "4,200,000",
    status: "Ishda",
    avatar: "https://i.pravatar.cc/150?u=3",
    email: "jasur@joybor.uz",
    joined_date: "2022-11-05"
  },
  {
    id: 4,
    name: "Nigora Usmonova",
    role: "Tozalik xodimi",
    phone: "+998 99 111 22 33",
    salary: "3,500,000",
    status: "Ta'tilda",
    avatar: "https://i.pravatar.cc/150?u=4",
    email: "nigora@joybor.uz",
    joined_date: "2023-06-12"
  },
  {
    id: 5,
    name: "Sardor Ergashev",
    role: "Texnik xodim",
    phone: "+998 97 777 88 99",
    salary: "4,800,000",
    status: "Ishda",
    avatar: "https://i.pravatar.cc/150?u=5",
    email: "sardor@joybor.uz",
    joined_date: "2023-02-28"
  },
  {
    id: 6,
    name: "Dilnoza Olimova",
    role: "Oshpaz",
    phone: "+998 91 222 33 44",
    salary: "4,500,000",
    status: "Ishda",
    avatar: "https://i.pravatar.cc/150?u=6",
    email: "dilnoza@joybor.uz",
    joined_date: "2023-08-10"
  }
];

const ROLES = [
  "Boshqaruvchi",
  "Administrator",
  "Xavfsizlik xodimi",
  "Tozalik xodimi",
  "Texnik xodim",
  "Oshpaz"
];

const Staff: React.FC = () => {
  const [staffList, setStaffList] = useState(MOCK_STAFF);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    role: ROLES[0],
    phone: '',
    salary: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEmployee = {
      id: staffList.length + 1,
      ...formData,
      status: "Ishda",
      avatar: `https://i.pravatar.cc/150?u=${staffList.length + 1}`,
      email: `${formData.name.toLowerCase().replace(' ', '.')}@joybor.uz`,
      joined_date: new Date().toISOString().split('T')[0]
    };
    setStaffList(prev => [newEmployee, ...prev]);
    setIsModalOpen(false);
    setFormData({ name: '', role: ROLES[0], phone: '', salary: '' });
    toast.success("Yangi xodim muvaffaqiyatli qo'shildi");
  };

  const handleDelete = (id: number) => {
    setStaffList(prev => prev.filter(item => item.id !== id));
    toast.error("Xodim tizimdan o'chirildi");
  };

  const columns = [
    {
      key: 'name',
      title: 'Xodim',
      sortable: true,
      render: (value: unknown, row: any) => (
        <div className="flex items-center gap-3">
          <img src={row.avatar} alt={String(value)} className="w-10 h-10 rounded-xl object-cover border border-gray-200 dark:border-gray-700" />
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{String(value)}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{row.email}</span>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Lavozim',
      sortable: true,
      render: (value: unknown) => (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
          {String(value)}
        </span>
      )
    },
    {
      key: 'phone',
      title: 'Telefon',
      render: (value: unknown) => (
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{String(value)}</span>
      )
    },
    {
      key: 'salary',
      title: 'Maosh',
      sortable: true,
      render: (value: unknown) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900 dark:text-white">{String(value)}</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase">UZS</span>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Holati',
      sortable: true,
      render: (value: unknown) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
          value === 'Ishda' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full mr-2 ${value === 'Ishda' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
          {String(value)}
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
              navigate(`/staff/${row.id}`);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
            title="Profilni ko'rish"
          >
            <ChevronRight className="w-5 h-5" />
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Xodimlar
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Tizimdagi barcha xodimlarni boshqarish va monitoring qilish
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
        >
          <UserPlus className="w-5 h-5" />
          <span>Xodim qo'shish</span>
        </motion.button>
      </div>

      {/* Main Content Card - Using DataTable for professional look */}
      <DataTable 
        data={staffList as any} 
        columns={columns as any}
        onRowClick={(row) => navigate(`/staff/${row.id}`)}
      />

      {/* Add Employee Modal */}
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
                      <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">Xodim qo'shish</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Yangi xodim ma'lumotlarini kiriting</p>
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
                    <div>
                      <label className="flex items-center gap-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
                        <User className="w-3.5 h-3.5" />
                        F.I.SH
                      </label>
                      <input 
                        required
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Masalan: Ali Valiyev"
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 transition-all outline-none font-semibold"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        Lavozim
                      </label>
                      <div className="relative">
                        <select 
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl text-slate-900 dark:text-white focus:ring-0 transition-all outline-none cursor-pointer appearance-none font-semibold"
                        >
                          {ROLES.map(role => (
                            <option key={role} value={role}>{role}</option>
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
                      className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                    >
                      Qo'shish
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
