import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BackButton from '../components/UI/BackButton';
import { 
  User, 
  Briefcase, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  Shield, 
  Trash2, 
  Edit2,
  CheckCircle,
  Clock,
  MapPin,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// Mock data (same as in Staff.tsx for consistency)
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
    joined_date: "2023-01-15",
    address: "Toshkent sh., Yunusobod tumani",
    bio: "Ko'p yillik tajribaga ega boshqaruvchi. Yotoqxona faoliyatini to'liq nazorat qiladi."
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
    joined_date: "2023-03-20",
    address: "Toshkent sh., Chilonzor tumani",
    bio: "Talabalar bilan ishlash va hujjatlashtirish bo'yicha mas'ul xodim."
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
    joined_date: "2022-11-05",
    address: "Toshkent vil., Zangiota tumani",
    bio: "Yotoqxona xavfsizligi va tartib-intizomiga javobgar."
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
    joined_date: "2023-06-12",
    address: "Toshkent sh., Olmazor tumani",
    bio: "Yotoqxona hududi va xonalari tozaligini ta'minlaydi."
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
    joined_date: "2023-02-28",
    address: "Toshkent sh., Yashnobod tumani",
    bio: "Bino ichidagi barcha texnik nosozliklarni bartaraf etishga mas'ul."
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
    joined_date: "2023-08-10",
    address: "Toshkent sh., Mirzo Ulug'bek tumani",
    bio: "Talabalar uchun mazali va sifatli taomlar tayyorlashga javobgar."
  }
];

const StaffProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<any>(null);

  useEffect(() => {
    const foundStaff = MOCK_STAFF.find(s => s.id === Number(id));
    if (foundStaff) {
      setStaff(foundStaff);
    } else {
      toast.error("Xodim topilmadi");
      navigate('/staff');
    }
  }, [id, navigate]);

  if (!staff) return null;

  const handleStatusToggle = () => {
    const newStatus = staff.status === 'Ishda' ? 'Ta\'tilda' : 'Ishda';
    setStaff({ ...staff, status: newStatus });
    toast.success(`Xodim holati "${newStatus}" ga o'zgartirildi`);
  };

  const handleDelete = () => {
    if (window.confirm("Rostdan ham ushbu xodimni o'chirib tashlamoqchimisiz?")) {
      toast.error("Xodim tizimdan o'chirildi");
      navigate('/staff');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="mb-6">
        <BackButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 dark:border-slate-700 p-8 text-center"
          >
            <div className="relative inline-block mb-6">
              <img 
                src={staff.avatar} 
                alt={staff.name} 
                className="w-32 h-32 rounded-[2.5rem] object-cover ring-4 ring-blue-50 dark:ring-blue-900/20 shadow-lg"
              />
              <div className={`absolute -bottom-2 -right-2 p-2 rounded-2xl border-4 border-white dark:border-slate-800 shadow-md ${
                staff.status === 'Ishda' ? 'bg-green-500' : 'bg-amber-500'
              }`}>
                {staff.status === 'Ishda' ? <CheckCircle className="w-4 h-4 text-white" /> : <Clock className="w-4 h-4 text-white" />}
              </div>
            </div>

            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{staff.name}</h2>
            <p className="text-blue-600 dark:text-blue-400 font-bold mb-6">{staff.role}</p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleStatusToggle}
                className={`w-full py-4 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  staff.status === 'Ishda' 
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100' 
                    : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100'
                }`}
              >
                {staff.status === 'Ishda' ? <Clock className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                <span>{staff.status === 'Ishda' ? "Ta'tilga chiqarish" : "Ishga qaytarish"}</span>
              </button>
              
              <button 
                onClick={handleDelete}
                className="w-full py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-bold hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                <span>O'chirish</span>
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 dark:border-slate-700 p-8"
          >
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Tizimga kirish
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">ID raqami</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">#ST-{staff.id.toString().padStart(4, '0')}</p>
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Tizimda roli</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Moderator</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 dark:border-slate-700 p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-500" />
                Umumiy ma'lumotlar
              </h3>
              <button className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl hover:bg-blue-100 transition-all">
                <Edit2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-2xl text-blue-500">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Telefon</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{staff.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-2xl text-blue-500">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{staff.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-2xl text-blue-500">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Oylik maosh</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{staff.salary} <span className="text-[10px] uppercase text-gray-400">UZS</span></p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-2xl text-blue-500">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Manzil</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{staff.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-2xl text-blue-500">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Ishga kirgan sana</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{staff.joined_date}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-2xl text-blue-500">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Lavozim</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{staff.role}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100/50 dark:border-blue-800/20">
              <h4 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">Qisqacha tavsif</h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                {staff.bio}
              </p>
            </div>
          </motion.div>

          {/* Activity Timeline (Optional but professional) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 dark:border-slate-700 p-8"
          >
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8">Oxirgi faoliyat</h3>
            <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-slate-700">
              <div className="relative pl-10">
                <div className="absolute left-0 top-1.5 w-9 h-9 bg-green-500 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Ishga keldi</p>
                <p className="text-xs text-gray-500">Bugun, 08:45</p>
              </div>
              <div className="relative pl-10">
                <div className="absolute left-0 top-1.5 w-9 h-9 bg-blue-500 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Tushlik tanaffusi</p>
                <p className="text-xs text-gray-500">Bugun, 13:00 - 14:00</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;
