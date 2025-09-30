import React, { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { LogOut, User, KeyRound, Phone, UserCog, CalendarCheck2, MapPin, MessageCircle } from 'lucide-react';
import BackButton from '../components/UI/BackButton';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../data/api';
import { useRef } from 'react';



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
  const queryClient = useQueryClient();
  const { data: admin, isLoading, error } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: api.getAdminProfile,
    staleTime: 1000 * 60 * 5,
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);



  // Edit form state
  const [editForm, setEditForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
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
        first_name: admin.first_name || '',
        last_name: admin.last_name || '',
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
      if (key === 'username') return; // Username ni o'zgartirishga ruxsat bermaymiz
      if (value) formData.append(key, value as any);
    });
    setIsUpdating(true);

    try {
      await api.updateAdminProfile(formData);

      setShowEditModal(false);
      toast.success('Profil muvaffaqiyatli yangilandi!');
      // Query ni invalidate qilib, yangi ma'lumotlarni olish
      queryClient.invalidateQueries({ queryKey: ['adminProfile'] }); // toast ko‘rinib ulgurishi uchun
    } catch (err: any) {
      toast.error('Xatolik: ' + (err?.detail || err?.message || 'Profilni yangilashda xatolik'));
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div></div>;
  if (error || !admin) return <div className="text-center py-10 text-red-600 dark:text-red-400">Admin ma'lumotlarini yuklashda xatolik yuz berdi.</div>;

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
        className="w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1E293B] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="relative flex flex-col items-center justify-center pt-10 pb-6 px-8 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-[#1E293B] dark:to-gray-900">
          <div className="absolute top-4 left-4 z-10">
            <BackButton />
          </div>
          <div className="relative w-32 h-32 mb-4">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl border-4 border-white dark:border-gray-800 overflow-hidden">
              {admin.image ? (
                <img src={admin.image} alt="Admin Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-4xl">
                  {(() => {
                    // Ism va familiya bosh harflarini olish
                    if (admin.first_name && admin.last_name) {
                      return admin.first_name[0]?.toUpperCase() + admin.last_name[0]?.toUpperCase();
                    }
                    if (admin.first_name) {
                      return admin.first_name[0]?.toUpperCase();
                    }
                    if (admin.bio) {
                      const names = admin.bio.trim().split(' ');
                      if (names.length >= 2) {
                        return names[0][0]?.toUpperCase() + names[1][0]?.toUpperCase();
                      }
                      return names[0][0]?.toUpperCase() || 'A';
                    }
                    return admin.username?.[0]?.toUpperCase() || 'A';
                  })()}
                </span>
              )}
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-3 border-white dark:border-gray-800 shadow-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-xl sm:text-3xl font-bold text-[#1E293B] dark:text-white mb-1 text-center">
            {(() => {
              // Ism va familiyani ko'rsatish
              if (admin.first_name && admin.last_name) {
                return `${admin.first_name} ${admin.last_name}`;
              }
              if (admin.first_name) {
                return admin.first_name;
              }
              if (admin.bio) {
                return admin.bio;
              }
              return admin.username || 'Admin';
            })()}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">@{admin.username}</p>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-300 mb-2">{admin.bio || 'Bio kiritilmagan'}</p>

        </div>
        {/* Main content */}
        <div className="px-2 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 sm:p-6 flex flex-col gap-6 border border-gray-200 dark:border-gray-700 w-full max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <ProfileField icon={<User className="w-5 h-5" />} label="Ism" value={admin.first_name} />
              <ProfileField icon={<User className="w-5 h-5" />} label="Familiya" value={admin.last_name} />
              <ProfileField icon={<Phone className="w-5 h-5" />} label="Telefon" value={admin.phone} />
              <ProfileField icon={<CalendarCheck2 className="w-5 h-5" />} label="Tug‘ilgan sana" value={admin.birth_date} />
              <ProfileField icon={<MessageCircle className="w-5 h-5" />} label="Telegram" value={admin.telegram} />
              <ProfileField icon={<MapPin className="w-5 h-5" />} label="Manzil" value={admin.address} />
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
              className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl w-full max-w-4xl p-0 overflow-hidden relative max-h-[90vh] flex flex-col"
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
              <form id="editProfileForm" onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto px-2 sm:px-8 py-6 sm:py-8 pb-6 space-y-6 sm:space-y-8">
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
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ism</label>
                      <input name="first_name" value={editForm.first_name} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ism" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Familiya</label>
                      <input name="last_name" value={editForm.last_name} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Familiya" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Telegram</label>
                      <input name="telegram" value={editForm.telegram} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Telegram" maxLength={64} />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Manzil</label>
                      <input name="address" value={editForm.address} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Manzil" maxLength={255} />
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
                  </div>
                </div>
              </form>

              {/* Action Bar - Modal pastida */}
              <div className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1E293B] px-6 py-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  form="editProfileForm"
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold transition-colors flex items-center gap-2"
                >
                  {isUpdating && (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                  )}
                  {isUpdating ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile; 