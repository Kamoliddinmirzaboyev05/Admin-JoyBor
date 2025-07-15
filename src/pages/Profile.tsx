import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, KeyRound, Mail, Phone, UserCog, ShieldCheck, CalendarCheck2, CheckCircle2, Activity } from 'lucide-react';
import BackButton from '../components/UI/BackButton';
import { useQuery } from '@tanstack/react-query';
import { apiQueries } from '../data/api';

const tabList = [
  { key: 'main', label: 'Asosiy', icon: <UserCog className="w-4 h-4 mr-1" /> },
  { key: 'security', label: 'Xavfsizlik', icon: <KeyRound className="w-4 h-4 mr-1" /> },
  { key: 'activity', label: 'Faoliyat', icon: <Activity className="w-4 h-4 mr-1" /> },
];

function CircularProgress({ value, size = 90, stroke = 8, color = '#1E293B' }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} className="block">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1 }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="0.35em"
        className="fill-[#1E293B] dark:fill-gray-200 font-bold text-lg"
      >
        {value}%
      </text>
    </svg>
  );
}

const Profile: React.FC = () => {
  const { data: admin, isLoading, error } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: apiQueries.getAdminProfile,
    staleTime: 1000 * 60 * 5,
  });
  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div></div>;
  if (error || !admin) return <div className="text-center py-10 text-red-600 dark:text-red-400">Admin ma'lumotlarini yuklashda xatolik yuz berdi.</div>;
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [login, setLogin] = useState(admin.login);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('main');

  const handleLoginChange = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginSuccess(true);
    setTimeout(() => setLoginSuccess(false), 2000);
    setShowLoginForm(false);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('Parollar mos emas');
      return;
    }
    setPasswordError('');
    setPasswordSuccess(true);
    setTimeout(() => setPasswordSuccess(false), 2000);
    setShowPasswordForm(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-2 py-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1E293B] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="relative flex flex-col items-center justify-center pt-10 pb-6 px-8 border-b border-gray-100 dark:border-gray-700">
          <div className="absolute top-4 left-4 z-10">
            <BackButton />
          </div>
          <div className="w-28 h-28 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow border-4 border-white dark:border-[#1E293B] mb-2">
            {admin.avatar ? (
              <img src={admin.avatar} alt={admin.firstName} className="w-full h-full object-cover rounded-full" />
            ) : (
              <User className="w-16 h-16 text-[#1E293B] dark:text-gray-200 opacity-90" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-[#1E293B] dark:text-white mb-1 flex items-center gap-2">
            {admin.firstName} {admin.lastName}
          </h2>
          <div className="flex flex-wrap gap-2 justify-center mb-2">
            <span className="px-3 py-1 rounded-full bg-[#1E293B] text-white text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> {admin.status}
            </span>
            <span className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-[#1E293B] dark:text-white text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> {admin.role}
            </span>
            <span className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-[#1E293B] dark:text-white text-xs font-semibold flex items-center gap-1">
              {admin.permissions} ruxsat
            </span>
          </div>
          {/* Mini-cards for stats */}
          <div className="flex flex-wrap gap-4 justify-center mt-2 mb-4">
            <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2 border border-gray-200 dark:border-gray-700">
              <span className="text-xs text-[#1E293B] dark:text-gray-200 font-semibold mb-1">So‘nggi kirish</span>
              <span className="flex items-center gap-1 text-base font-bold text-[#1E293B] dark:text-white"><CalendarCheck2 className="w-4 h-4" /> {admin.lastLogin}</span>
            </div>
            <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2 border border-gray-200 dark:border-gray-700">
              <span className="text-xs text-[#1E293B] dark:text-gray-200 font-semibold mb-1">Login</span>
              <span className="flex items-center gap-1 text-base font-bold text-[#1E293B] dark:text-white"><UserCog className="w-4 h-4" /> {login}</span>
            </div>
            <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2 border border-gray-200 dark:border-gray-700">
              <span className="text-xs text-[#1E293B] dark:text-gray-200 font-semibold mb-1">Telefon</span>
              <span className="flex items-center gap-1 text-base font-bold text-[#1E293B] dark:text-white"><Phone className="w-4 h-4" /> {admin.phone}</span>
            </div>
          </div>
          {/* Circular progress */}
          <div className="mt-2 mb-2">
            <CircularProgress value={admin.completeness} />
            <div className="text-xs text-[#1E293B] dark:text-gray-200 text-center mt-1">Profil to‘ldirilganligi</div>
          </div>
        </div>
        {/* Pill navigation */}
        <div className="flex gap-2 mb-4 justify-center px-6 pt-6">
          {tabList.map(tab => (
            <button
              key={tab.key}
              className={`flex items-center px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border-2 ${activeTab === tab.key
                ? 'bg-[#1E293B] text-white border-[#1E293B] scale-105 shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-[#1E293B] dark:text-white border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105'}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        {/* Tab content */}
        <div className="px-6 pb-10 flex flex-col gap-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow p-6 flex flex-col gap-4 border border-gray-200 dark:border-gray-700 min-h-[180px]">
            <AnimatePresence mode="wait">
              {activeTab === 'main' && (
                <motion.div
                  key="main"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col md:flex-row gap-6 md:gap-12"
                >
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[#1E293B] dark:text-gray-200 text-base">
                      <Mail className="w-5 h-5" /> <span>{admin.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#1E293B] dark:text-gray-200 text-base">
                      <UserCog className="w-5 h-5" /> Login: <span className="font-semibold">{login}</span>
                      <button
                        className="ml-2 px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-[#1E293B] dark:text-white text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        onClick={() => setShowLoginForm(true)}
                      >O‘zgartirish</button>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-4 items-center justify-center">
                    <button
                      className="w-full md:w-56 px-6 py-2 rounded-lg bg-[#1E293B] text-white font-semibold hover:bg-gray-900 transition flex items-center justify-center gap-2 shadow"
                      onClick={() => setShowPasswordForm(true)}
                    >
                      <KeyRound className="w-5 h-5" /> Parolni o‘zgartirish
                    </button>
                    <button className="w-full md:w-56 px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-[#1E293B] dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2 shadow mt-2" onClick={handleLogout}>
                      <LogOut className="w-5 h-5" /> Chiqish
                    </button>
                  </div>
                </motion.div>
              )}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center gap-2 text-[#1E293B] dark:text-gray-200 text-base">
                    <KeyRound className="w-5 h-5" /> Parolni o‘zgartirish uchun quyidagi tugmani bosing:
                  </div>
                  <button
                    className="w-full md:w-56 px-6 py-2 rounded-lg bg-[#1E293B] text-white font-semibold hover:bg-gray-900 transition flex items-center justify-center gap-2 shadow"
                    onClick={() => setShowPasswordForm(true)}
                  >
                    <KeyRound className="w-5 h-5" /> Parolni o‘zgartirish
                  </button>
                </motion.div>
              )}
              {activeTab === 'activity' && (
                <motion.div
                  key="activity"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-2 text-[#1E293B] dark:text-gray-200 text-base"
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5" /> So‘nggi kirish: <span className="font-semibold">{admin.lastLogin}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" /> Ruxsat: <span className="font-semibold">{admin.permissions}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" /> Status: <span className="font-semibold">{admin.status}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {/* Login o‘zgartirish modal */}
        {showLoginForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowLoginForm(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl p-8 w-full max-w-xs flex flex-col gap-4 border border-gray-200 dark:border-gray-700"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-2 text-[#1E293B] dark:text-white">Loginni o‘zgartirish</h3>
              <form onSubmit={handleLoginChange} className="flex flex-col gap-4">
                <input
                  type="text"
                  value={login}
                  onChange={e => setLogin(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[#1E293B] dark:text-white"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-[#1E293B] dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    onClick={() => setShowLoginForm(false)}
                  >Bekor qilish</button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg bg-[#1E293B] text-white font-semibold hover:bg-gray-900 transition"
                  >Saqlash</button>
                </div>
                {loginSuccess && <div className="text-green-600 text-sm text-center">Login muvaffaqiyatli o‘zgartirildi!</div>}
              </form>
            </motion.div>
          </div>
        )}
        {/* Parol o‘zgartirish modal */}
        {showPasswordForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowPasswordForm(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl p-8 w-full max-w-xs flex flex-col gap-4 border border-gray-200 dark:border-gray-700"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-2 text-[#1E293B] dark:text-white">Parolni o‘zgartirish</h3>
              <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
                <input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[#1E293B] dark:text-white"
                  placeholder="Joriy parol"
                  required
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[#1E293B] dark:text-white"
                  placeholder="Yangi parol"
                  required
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[#1E293B] dark:text-white"
                  placeholder="Yangi parolni tasdiqlang"
                  required
                />
                {passwordError && <div className="text-red-600 text-sm text-center">{passwordError}</div>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-[#1E293B] dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    onClick={() => setShowPasswordForm(false)}
                  >Bekor qilish</button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg bg-[#1E293B] text-white font-semibold hover:bg-gray-900 transition"
                  >Saqlash</button>
                </div>
                {passwordSuccess && <div className="text-green-600 text-sm text-center">Parol muvaffaqiyatli o‘zgartirildi!</div>}
              </form>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile; 