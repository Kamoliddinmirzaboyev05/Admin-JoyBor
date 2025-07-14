import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-800"
      >
        <div className="mb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-2 bg-[#1E293B] rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">JB</span>
          </div>
          <h2 className="text-2xl font-bold text-[#1E293B] dark:text-white">Xush kelibsiz, Admin!</h2>
          <p className="text-gray-500 dark:text-gray-300 text-sm mt-1">Platformaga kirish uchun login va parolingizni kiriting</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#1E293B] dark:text-gray-200 mb-1">Login</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:ring-2 focus:ring-[#1E293B] outline-none"
              value={login}
              onChange={e => setLogin(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1E293B] dark:text-gray-200 mb-1">Parol</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:ring-2 focus:ring-[#1E293B] outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-[#1E293B] hover:bg-gray-900 text-white font-semibold transition-colors disabled:opacity-60"
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