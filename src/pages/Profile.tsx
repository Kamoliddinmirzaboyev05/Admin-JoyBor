import React, { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, KeyRound, Mail, Phone, UserCog, ShieldCheck, CalendarCheck2, CheckCircle2, Activity } from 'lucide-react';
import BackButton from '../components/UI/BackButton';
import { useQuery } from '@tanstack/react-query';
import { apiQueries } from '../data/api';
import { useRef } from 'react';
import { link } from '../data/config';

const tabList = [
  { key: 'main', label: 'Asosiy', icon: <UserCog className="w-4 h-4 mr-1" /> },
  { key: 'security', label: 'Xavfsizlik', icon: <KeyRound className="w-4 h-4 mr-1" /> },
  { key: 'activity', label: 'Faoliyat', icon: <Activity className="w-4 h-4 mr-1" /> },
];

function ProfileField({ icon, label, value, actionLabel, onAction }: { icon: React.ReactNode; label: string; value?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-3 last:border-b-0 last:pb-0">
      <span className="text-[#1E293B] dark:text-gray-200">{icon}</span>
      <span className="font-medium text-gray-700 dark:text-gray-300 w-32">{label}:</span>
      <span className="flex-1 text-gray-900 dark:text-white">{value || '-'}</span>
      {actionLabel && onAction && (
        <button
          className="ml-2 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-[#1E293B] dark:text-white text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          onClick={onAction}
        >{actionLabel}</button>
      )}
    </div>
  );
}

const Profile: React.FC = () => {
  const { data: admin, isLoading, error } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: apiQueries.getAdminProfile,
    staleTime: 1000 * 60 * 5,
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('main');
  const [showEditModal, setShowEditModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set login state when admin is loaded
  React.useEffect(() => {
    if (admin && admin.username) setUsername(admin.username);
  }, [admin]);

  // Edit form state
  const [editForm, setEditForm] = useState({
    username: '',
    password: '',
    image: null as File | null,
    bio: '',
    phone: '',
    birth_date: '',
    address: '',
    telegram: '',
  });
  React.useEffect(() => {
    if (admin) {
      setEditForm({
        username: admin.username || '',
        password: '',
        image: null,
        bio: admin.bio || '',
        phone: admin.phone || '',
        birth_date: admin.birth_date || '',
        address: admin.address || '',
        telegram: admin.telegram || '',
      });
    }
  }, [admin, showEditModal]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as any;
    setEditForm(f => ({
      ...f,
      [name]: files ? files[0] : value,
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(editForm).forEach(([key, value]) => {
      if (key === 'image' && !value) return;
      if (key === 'password') return; // Parolni faqat alohida modal orqali o'zgartiramiz
      if (value) formData.append(key, value as any);
    });
    try {
      const token = sessionStorage.getItem('access');
      const res = await fetch(`${link}/profile/`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw await res.json();
      setShowEditModal(false);
      toast.success('Profil muvaffaqiyatli yangilandi!');
      setTimeout(() => window.location.reload(), 1200); // toast ko‘rinib ulgurishi uchun
    } catch (err: any) {
      toast.error('Xatolik: ' + (err?.detail || 'Profilni yangilashda xatolik'));
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div></div>;
  if (error || !admin) return <div className="text-center py-10 text-red-600 dark:text-red-400">Admin ma'lumotlarini yuklashda xatolik yuz berdi.</div>;

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
    toast.success('Parol muvaffaqiyatli o‘zgartirildi!');
    setTimeout(() => setPasswordSuccess(false), 2000);
    setShowPasswordForm(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogout = () => {
    sessionStorage.clear();
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
        <div className="relative flex flex-col items-center justify-center pt-10 pb-6 px-8 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-[#1E293B] dark:to-gray-900">
          <div className="absolute top-4 left-4 z-10">
            <BackButton />
          </div>
          <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow border-4 border-white dark:border-[#1E293B] mb-3 p-4">
            {admin.image ? (
              <img src={admin.image} alt={admin.username} className="w-full h-full object-cover rounded-full" />
            ) : (
              <img src="/logo.svg" alt="Profile Logo" className="w-full h-full object-contain" />
            )}
          </div>
          <h2 className="text-xl sm:text-3xl font-bold text-[#1E293B] dark:text-white mb-1 flex items-center gap-2">
            {admin.username || '-'}
          </h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-300 mb-2">{admin.bio || 'Bio kiritilmagan'}</p>
          <div className="flex flex-wrap gap-2 justify-center mb-2">
            <span className="px-2 py-1 rounded-full bg-[#1E293B] text-white text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Admin
            </span>
          </div>
        </div>
        {/* Main content */}
        <div className="px-2 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 sm:p-6 flex flex-col gap-6 border border-gray-200 dark:border-gray-700 w-full max-w-xl mx-auto">
            <div className="flex flex-col gap-3 sm:gap-4">
              <ProfileField icon={<UserCog className="w-5 h-5" />} label="Login" value={username} />
              <ProfileField icon={<Phone className="w-5 h-5" />} label="Telefon" value={admin.phone} />
              <ProfileField icon={<CalendarCheck2 className="w-5 h-5" />} label="Tug‘ilgan sana" value={admin.birth_date} />
              <ProfileField icon={<Mail className="w-5 h-5" />} label="Telegram" value={admin.telegram} />
              <ProfileField icon={<Mail className="w-5 h-5" />} label="Manzil" value={admin.address} />
            </div>
            <button
              className="mt-4 sm:mt-6 px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow text-sm sm:text-base"
              onClick={() => setShowEditModal(true)}
            >
              <UserCog className="w-5 h-5" /> Profilni tahrirlash
            </button>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6">
              <button
                className="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-[#1E293B] text-white font-semibold hover:bg-gray-900 transition flex items-center justify-center gap-2 shadow text-sm sm:text-base"
                onClick={() => setShowPasswordForm(true)}
              >
                <KeyRound className="w-5 h-5" /> Parolni o‘zgartirish
              </button>
              <button
                className="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-[#1E293B] dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2 shadow text-sm sm:text-base"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" /> Chiqish
              </button>
            </div>
          </div>
        </div>
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
        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 40 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl w-full max-w-xl p-0 overflow-hidden relative max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 pt-6 pb-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#1E293B] z-10">
                <div className="flex-1 flex items-center justify-center relative">
                  <h2 className="text-lg sm:text-xl font-bold text-[#1E293B] dark:text-white text-center w-full">Profilni tahrirlash</h2>
                  <button onClick={() => setShowEditModal(false)} className="absolute right-0 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded transition-colors">
                    <span className="text-2xl">×</span>
                  </button>
                </div>
              </div>
              <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto px-2 sm:px-8 py-6 sm:py-8 pb-32 space-y-6 sm:space-y-8">
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center gap-3 mb-4">
                  <label className="block text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">Profil rasmi</label>
                  <div className="relative w-24 h-24 group">
                    {editForm.image || admin.image ? (
                      <img
                        src={editForm.image ? URL.createObjectURL(editForm.image as File) : admin.image}
                        alt="Profil"
                        className="w-24 h-24 rounded-xl object-cover border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 shadow-md transition-all duration-200"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-xl flex items-center justify-center text-3xl font-bold text-white bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md select-none">
                        {editForm.username?.[0] || admin.username?.[0] || ''}
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      name="image"
                      ref={fileInputRef}
                      onChange={handleEditChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-20"
                      title="Rasm yuklash"
                      aria-label="Profil rasm yuklash"
                    />
                    {/* Overlay for hover */}
                    <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                      <span className="text-white">📸</span>
                    </div>
                    {/* Remove button */}
                    {(editForm.image || admin.image) && (
                  <button
                    type="button"
                        onClick={() => setEditForm(f => ({ ...f, image: null }))}
                        className="absolute -top-2 -right-2 bg-white dark:bg-[#1E293B] border border-gray-300 dark:border-gray-700 rounded-full p-1 shadow hover:bg-red-500 hover:text-white transition-colors z-30"
                        aria-label="Rasmni olib tashlash"
                      >
                        <span className="text-2xl">×</span>
                      </button>
                    )}
                  </div>
                </div>
                {/* Personal Info Section */}
                <div>
                  <div className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Shaxsiy ma'lumotlar</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Login</label>
                      <input name="username" value={editForm.username} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Login" minLength={1} />
                    </div>
                    {/* Parolni o'zgartirish faqat alohida modal orqali */}
                    <div className="md:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                      <textarea name="bio" value={editForm.bio} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Bio" />
                    </div>
                  </div>
                </div>
                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                {/* Contact Info Section */}
                <div>
                  <div className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Aloqa ma'lumotlari</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Telefon</label>
                      <input name="phone" value={editForm.phone} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Telefon" maxLength={20} />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tug‘ilgan sana</label>
                      <input name="birth_date" type="date" value={editForm.birth_date} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Tug‘ilgan sana" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Manzil</label>
                      <input name="address" value={editForm.address} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Manzil" maxLength={255} />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Telegram</label>
                      <input name="telegram" value={editForm.telegram} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Telegram" maxLength={64} />
                    </div>
                  </div>
                </div>
                {/* Sticky Action Bar */}
                <div className="fixed left-0 right-0 bottom-0 bg-white dark:bg-[#1E293B] border-t border-gray-100 dark:border-gray-800 flex justify-end pt-4 gap-2 px-2 sm:px-8 pb-6 z-20 max-w-xl mx-auto w-full" style={{borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem'}}>
                  <button type="button" onClick={() => setShowEditModal(false)} className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base">Bekor qilish</button>
                  <button type="submit" className="px-3 sm:px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors text-sm sm:text-base">Saqlash</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile; 