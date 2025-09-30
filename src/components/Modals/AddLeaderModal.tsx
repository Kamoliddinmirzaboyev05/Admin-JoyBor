import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, User, Mail, Phone, Building, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../data/api';

interface AddLeaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  floors: Array<{ id: string; number: number; name: string; }>;
}

interface LeaderFormData {
  floor: number | '';
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

const AddLeaderModal: React.FC<AddLeaderModalProps> = ({ isOpen, onClose, floors }) => {
  const [formData, setFormData] = useState<LeaderFormData>({
    floor: '',
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });

  const [errors, setErrors] = useState<Partial<LeaderFormData>>({});
  const [showPassword, setShowPassword] = useState(false);

  const queryClient = useQueryClient();

  // Create leader mutation
  const createLeaderMutation = useMutation({
    mutationFn: api.createLeader,
    onSuccess: () => {
      toast.success('Qavat sardori muvaffaqiyatli qo&apos;shildi!');
      queryClient.invalidateQueries({ queryKey: ['leaders'] });
      handleClose();
    },
    onError: (error: Error & { response?: { data?: Record<string, unknown> } }) => {
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          error?.message || 
                          'Qavat sardorini qo&apos;shishda xatolik yuz berdi';
      toast.error(errorMessage);
      
      // Handle field-specific errors
      if (error?.response?.data && typeof error.response.data === 'object') {
        const fieldErrors: Partial<LeaderFormData> = {};
        Object.keys(error.response.data).forEach(field => {
          if (field in formData) {
            fieldErrors[field as keyof LeaderFormData] = Array.isArray(error.response.data[field]) 
              ? error.response.data[field][0] 
              : error.response.data[field];
          }
        });
        setErrors(fieldErrors);
      }
    }
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<LeaderFormData> = {};

    if (!formData.floor) {
      newErrors.floor = 'Qavat tanlanishi shart';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Foydalanuvchi nomi kiritilishi shart';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Foydalanuvchi nomi kamida 3 ta belgidan iborat bo&apos;lishi kerak';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Parol kiritilishi shart';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Parol kamida 8 ta belgidan iborat bo&apos;lishi kerak';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Ism kiritilishi shart';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Familiya kiritilishi shart';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email kiritilishi shart';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email formati noto&apos;g&apos;ri';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon raqami kiritilishi shart';
    } else if (!/^\+998[0-9]{9}$/.test(formData.phone)) {
      newErrors.phone = 'Telefon raqami +998XXXXXXXXX formatida bo&apos;lishi kerak';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LeaderFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      floor: Number(formData.floor)
    };

    createLeaderMutation.mutate(submitData);
  };

  const handleClose = () => {
    setFormData({
      floor: '',
      username: '',
      password: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: ''
    });
    setErrors({});
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Yangi qavat sardori qo&apos;shish
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Qavat sardorining barcha ma&apos;lumotlarini kiriting
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Floor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  <Building className="w-4 h-4 inline mr-2" />
                  Qavat
                </label>
                <select
                  value={formData.floor}
                  onChange={(e) => handleInputChange('floor', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.floor ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Qavatni tanlang</option>
                  {floors.map((floor) => (
                    <option key={floor.id} value={floor.number}>
                      {floor.name} ({floor.number}-qavat)
                    </option>
                  ))}
                </select>
                {errors.floor && (
                  <p className="text-red-500 text-sm mt-1">{errors.floor}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Ism
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.first_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Ismni kiriting"
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Familiya
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.last_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Familiyani kiriting"
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                  )}
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Foydalanuvchi nomi
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Foydalanuvchi nomini kiriting"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Parol
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-4 py-3 pr-12 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Parolni kiriting"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Telefon raqami
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="+998901234567"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={createLeaderMutation.isPending}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-4 h-4" />
              {createLeaderMutation.isPending ? 'Qo&apos;shilmoqda...' : 'Qo&apos;shish'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddLeaderModal;