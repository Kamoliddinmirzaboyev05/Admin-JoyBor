import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, KeyRound, Mail, Phone, UserCog } from 'lucide-react';
import BackButton from '../components/UI/BackButton';

function ReadOnlyInput({ label, value }: { label: string; value?: string | number | boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{label}</label>
      <input
        className="bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-base font-medium cursor-default focus:outline-none focus:ring-2 focus:ring-blue-300"
        value={typeof value === 'boolean' ? (value ? 'Ha' : 'Yo\'q') : value || '-'}
        readOnly
        tabIndex={-1}
      />
    </div>
  );
}

const admin = {
  firstName: 'Admin',
  lastName: 'Adminov',
  phone: '+998 90 123 45 67',
  email: 'admin@ttu.uz',
  login: 'admin',
  avatar: '',
};

const Profile: React.FC = () => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [login, setLogin] = useState(admin.login);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 px-4 py-10"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-slate-700 flex flex-col items-center gap-6 overflow-hidden">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 dark:from-blue-800 dark:to-blue-900 flex items-center justify-center shadow-lg mb-2">
          {admin.avatar ? (
            <img src={admin.avatar} alt={admin.firstName} className="w-full h-full object-cover rounded-full" />
          ) : (
            <User className="w-16 h-16 text-white opacity-80" />
          )}
        </div>
        <div className="text-center w-full">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{admin.firstName} {admin.lastName}</h2>
          <div className="flex flex-col gap-2 items-center mt-2">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-300 text-sm">
              <Phone className="w-4 h-4" /> {admin.phone}
            </div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-300 text-sm">
              <Mail className="w-4 h-4" /> {admin.email}
            </div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-300 text-sm">
              <UserCog className="w-4 h-4" /> Login: <span className="font-semibold">{login}</span>
              <button
                className="ml-2 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                onClick={() => setShowLoginForm(true)}
              >O‘zgartirish</button>
            </div>
          </div>
        </div>
        <button
          className="w-full mt-2 px-6 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2"
          onClick={() => setShowPasswordForm(true)}
        >
          <KeyRound className="w-5 h-5" /> Parolni o‘zgartirish
        </button>
        <button className="w-full mt-2 px-6 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2">
          <LogOut className="w-5 h-5" /> Chiqish
        </button>

        {/* Login o‘zgartirish modal */}
        {showLoginForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowLoginForm(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 w-full max-w-xs flex flex-col gap-4 border border-gray-100 dark:border-slate-700"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Loginni o‘zgartirish</h3>
              <form onSubmit={handleLoginChange} className="flex flex-col gap-4">
                <input
                  type="text"
                  value={login}
                  onChange={e => setLogin(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    onClick={() => setShowLoginForm(false)}
                  >Bekor qilish</button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
                  >Saqlash</button>
                </div>
                {loginSuccess && <div className="text-green-600 text-sm text-center">Login muvaffaqiyatli o‘zgartirildi!</div>}
              </form>
            </motion.div>
          </div>
        )}

        {/* Parol o‘zgartirish modal */}
        {showPasswordForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowPasswordForm(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 w-full max-w-xs flex flex-col gap-4 border border-gray-100 dark:border-slate-700"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Parolni o‘zgartirish</h3>
              <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
                <input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Joriy parol"
                  required
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Yangi parol"
                  required
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Yangi parolni tasdiqlang"
                  required
                />
                {passwordError && <div className="text-red-600 text-sm text-center">{passwordError}</div>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    onClick={() => setShowPasswordForm(false)}
                  >Bekor qilish</button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
                  >Saqlash</button>
                </div>
                {passwordSuccess && <div className="text-green-600 text-sm text-center">Parol muvaffaqiyatli o‘zgartirildi!</div>}
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Profile; 