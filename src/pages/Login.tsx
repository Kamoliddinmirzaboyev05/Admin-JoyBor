import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('https://joyboryangi.pythonanywhere.com/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: login, password }),
      });
      const result = await res.json();
      if (res.ok && result.access) {
        localStorage.setItem('access', result.access);
        localStorage.setItem('isAuth', 'true');
        window.location.href = '/';
      } else {
        setError(result.detail || 'Login yoki parol noto‘g‘ri!');
        setLoading(false);
      }
    } catch {
      setError('Tarmoqda xatolik. Qayta urinib ko‘ring.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-2">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-md border border-gray-200 dark:border-gray-800"
      >
        <div className="mb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-blue-600 to-[#1E293B] rounded-full flex items-center justify-center shadow">
            <span className="text-white text-2xl font-bold tracking-wide">JB</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1E293B] dark:text-white font-sans">Xush kelibsiz, Admin!</h2>
          <p className="text-gray-500 dark:text-gray-300 text-xs sm:text-sm mt-1 font-sans">Platformaga kirish uchun login va parolingizni kiriting</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#1E293B] dark:text-gray-200 mb-1 font-sans">Login</label>
            <input
              type="text"
              className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none font-sans text-sm sm:text-base"
              value={login}
              onChange={e => setLogin(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#1E293B] dark:text-gray-200 mb-1 font-sans">Parol</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none font-sans text-sm sm:text-base pr-10"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675m2.122 2.122A7.963 7.963 0 004 9c0 4.418 3.582 8 8 8 1.657 0 3.236-.336 4.675-.938m2.122-2.122A7.963 7.963 0 0020 15c0-4.418-3.582-8-8-8-1.657 0-3.236.336-4.675.938" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675m2.122 2.122A7.963 7.963 0 004 9c0 4.418 3.582 8 8 8 1.657 0 3.236-.336 4.675-.938m2.122-2.122A7.963 7.963 0 0020 15c0-4.418-3.582-8-8-8-1.657 0-3.236.336-4.675.938" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-blue-600 hover:bg-[#1E293B] text-white font-semibold transition-colors disabled:opacity-60 font-sans text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? 'Tekshirilmoqda...' : 'Kirish'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login; 