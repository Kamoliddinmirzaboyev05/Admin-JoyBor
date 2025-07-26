import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import BackButton from '../components/UI/BackButton';
import { BadgeCheck, Phone, MapPin, GraduationCap, Calendar, User, FileText, Image, X, Check, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { link } from '../data/config';
import { toast } from 'sonner';

const statusColors = {
  'PENDING': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
  'APPROVED': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
  'REJECTED': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',
  'CANCELLED': 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  'NEW': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
};

const statusLabels = {
  'PENDING': 'Ko\'rib chiqilmoqda',
  'APPROVED': 'Qabul qilindi',
  'REJECTED': 'Rad etilgan',
  'CANCELLED': 'Bekor qilindi',
  'NEW': 'Yangi',
};

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number | null }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className="text-blue-600 dark:text-blue-400">
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{label}</div>
          <div className="text-gray-900 dark:text-gray-100 font-semibold">
            {value || '-'}
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageCard({ src, alt, label }: { src?: string | null; alt: string; label: string }) {
  if (!src) return null;
  
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Image className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      </div>
      <img 
        src={src} 
        alt={alt}
        className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-slate-600"
      />
    </div>
  );
}

const ApplicationDetail: React.FC = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  
  // Fetch application details from API
  const {
    data: application,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['application', id],
    queryFn: async () => {
      const token = localStorage.getItem('access');
      const response = await fetch(`${link}/applications/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Ariza ma\'lumotlarini yuklashda xatolik');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const prepareStudentDataFromApplication = () => {
    if (!application) return null;
    
    const fullName = application.fio || application.name || '';
    const nameParts = fullName.trim().split(' ');
    
    // Ismni ajratish
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';
    
    // Telefon raqamini to'g'ri formatda tayyorlash
    let phone = application.phone ? application.phone.toString() : '';
    if (phone.startsWith('+')) phone = phone.substring(1);
    
    return {
      firstName,
      lastName,
      fatherName: middleName,
      phone,
      direction: application.direction || '',
      faculty: '', // Bo'sh qoldirish
      passport: application.passport || '',
      // Default qiymatlar
      course: '1-kurs',
      gender: 'Erkak',
      isPrivileged: false,
      group: '',
      tarif: '500000',
      // Rasm URL (keyin yuklab olish uchun)
      imageUrl: application.user_image || null,
      // Pasport rasmlari
      passportImage1: application.passport_image_first || null,
      passportImage2: application.passport_image_second || null,
    };
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access');
      
      // FormData bilan urinib ko'ramiz (Students.tsx kabi)
      const formData = new FormData();
      formData.append('status', 'APPROVED');
      if (comment.trim()) {
        formData.append('admin_comment', comment.trim());
      }
      
      const response = await fetch(`${link}/applications/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('API Response:', response.status, errorData);
        throw new Error(errorData.message || errorData.detail || `Server xatoligi: ${response.status}`);
      }
      
      toast.success('Ariza muvaffaqiyatli qabul qilindi!');
      setShowApproveModal(false);
      setComment('');
      
      // Cache ni yangilash
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      refetch();
    } catch (error: any) {
      console.error('Approve error:', error);
      toast.error(error.message || 'Arizani qabul qilishda xatolik yuz berdi!');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      toast.error('Iltimos, rad etish sababini yozing!');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('access');
      
      // FormData bilan urinib ko'ramiz (Students.tsx kabi)
      const formData = new FormData();
      formData.append('status', 'REJECTED');
      formData.append('admin_comment', comment.trim());
      
      const response = await fetch(`${link}/applications/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('API Response:', response.status, errorData);
        throw new Error(errorData.message || errorData.detail || `Server xatoligi: ${response.status}`);
      }
      
      toast.success('Ariza rad etildi!');
      setShowRejectModal(false);
      setComment('');
      
      // Cache ni yangilash
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      refetch();
    } catch (error: any) {
      console.error('Reject error:', error);
      toast.error(error.message || 'Arizani rad etishda xatolik yuz berdi!');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600 dark:text-red-400">
        Ma'lumotlarni yuklashda xatolik yuz berdi.
        <button
          onClick={() => refetch()}
          className="ml-2 text-blue-600 hover:underline"
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-8 text-center text-red-500 dark:text-red-400">
        Ariza topilmadi. <BackButton label="Orqaga qaytish" className="mx-auto mt-4" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <BackButton label="Orqaga" />
          <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${statusColors[application.status as keyof typeof statusColors] || statusColors.NEW}`}>
            <BadgeCheck className="w-4 h-4" />
            {statusLabels[application.status as keyof typeof statusLabels] || application.status}
          </span>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          {/* Profile Section */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 p-6 text-white">
            <div className="flex items-center gap-6">
              {application.user_image ? (
                <img
                  src={application.user_image}
                  alt={application.name}
                  className="w-20 h-20 rounded-full border-4 border-white/20 object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full border-4 border-white/20 bg-white/10 flex items-center justify-center text-2xl font-bold">
                  {application.name?.charAt(0) || 'A'}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold mb-1">{application.fio || application.name}</h1>
                <p className="text-blue-100 mb-2">{application.university}</p>
                <div className="flex items-center gap-4 text-sm text-blue-100">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(application.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    +{application.phone}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <InfoCard 
                icon={<User className="w-5 h-5" />}
                label="To'liq ism"
                value={application.fio || application.name}
              />
              <InfoCard 
                icon={<Phone className="w-5 h-5" />}
                label="Telefon raqam"
                value={`+${application.phone}`}
              />
              <InfoCard 
                icon={<GraduationCap className="w-5 h-5" />}
                label="Universitet"
                value={application.university}
              />
              <InfoCard 
                icon={<MapPin className="w-5 h-5" />}
                label="Shahar"
                value={application.city}
              />
              <InfoCard 
                icon={<MapPin className="w-5 h-5" />}
                label="Qishloq/Tuman"
                value={application.village}
              />
              <InfoCard 
                icon={<FileText className="w-5 h-5" />}
                label="Yo'nalish"
                value={application.direction}
              />
            </div>

            {/* Comment Section */}
            {application.comment && (
              <div className="bg-blue-50 dark:bg-slate-700/50 border border-blue-200 dark:border-slate-600 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Talaba izohi</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{application.comment}</p>
              </div>
            )}

            {/* Admin Comment Section */}
            {application.admin_comment && (
              <div className={`border rounded-xl p-4 mb-6 ${
                application.status === 'APPROVED' 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {application.status === 'APPROVED' ? (
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    application.status === 'APPROVED' 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    Admin javobi
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{application.admin_comment}</p>
              </div>
            )}

            {/* Passport Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ImageCard 
                src={application.passport_image_first}
                alt="Pasport birinchi sahifa"
                label="Pasport (birinchi sahifa)"
              />
              <ImageCard 
                src={application.passport_image_second}
                alt="Pasport ikkinchi sahifa"
                label="Pasport (ikkinchi sahifa)"
              />
            </div>

            {/* Document */}
            {application.document && (
              <div className="bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hujjat</span>
                </div>
                <a 
                  href={application.document}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Hujjatni ko'rish
                </a>
              </div>
            )}

            {/* Action Buttons - Only show for pending applications */}
            {(application.status === 'PENDING' || application.status === 'NEW') && (
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-slate-700">
                <button 
                  onClick={() => setShowApproveModal(true)}
                  className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <BadgeCheck className="w-4 h-4" />
                  Qabul qilish
                </button>
                <button 
                  onClick={() => setShowRejectModal(true)}
                  className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Rad etish
                </button>
              </div>
            )}

            {/* Status Message and Actions for processed applications */}
            {application.status !== 'PENDING' && application.status !== 'NEW' && (
              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg mb-4 ${
                  application.status === 'APPROVED' 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                    : application.status === 'REJECTED'
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                    : 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300'
                }`}>
                  {application.status === 'APPROVED' ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span className="font-medium">Bu ariza qabul qilingan</span>
                    </>
                  ) : application.status === 'REJECTED' ? (
                    <>
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">Bu ariza rad etilgan</span>
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5" />
                      <span className="font-medium">Bu ariza bekor qilingan</span>
                    </>
                  )}
                </div>
                
                {/* Add Student Button for approved applications */}
                {application.status === 'APPROVED' && (
                  <div className="flex justify-center">
                    <button
                      onClick={() => setShowAddStudentModal(true)}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
                    >
                      <User className="w-5 h-5" />
                      Talabalar ro'yxatiga qo'shish
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      <AnimatePresence>
        {showApproveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowApproveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 40 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Arizani qabul qilish</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Qabul qilish sababini yozing</p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Qabul qilish sababi (ixtiyoriy)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Masalan: Barcha talablar bajarilgan, hujjatlar to'liq..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setComment('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Qabul qilinmoqda...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Qabul qilish
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 40 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Arizani rad etish</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rad etish sababini yozing</p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rad etish sababi *
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Masalan: Hujjatlar to'liq emas, talablar bajarilmagan..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setComment('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading || !comment.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Rad etilmoqda...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Rad etish
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Student Modal */}
      <AnimatePresence>
        {showAddStudentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddStudentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 40 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Talabalar ro'yxatiga qo'shish
                  </h3>
                  <button
                    onClick={() => setShowAddStudentModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="text-center py-8">
                  <User className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Talaba ma'lumotlari tayyorlandi
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Ariza ma'lumotlari asosida talaba yaratiladi. Qo'shimcha ma'lumotlarni keyin tahrirlashingiz mumkin.
                  </p>
                  
                  {/* Tayyorlangan ma'lumotlarni ko'rsatish */}
                  {(() => {
                    const studentData = prepareStudentDataFromApplication();
                    if (!studentData) return null;
                    
                    return (
                      <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-6 text-left">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-3">Tayyorlangan ma'lumotlar:</h5>
                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
                          <div><strong className="text-gray-900 dark:text-white">Ism:</strong> {studentData.firstName}</div>
                          <div><strong className="text-gray-900 dark:text-white">Familiya:</strong> {studentData.lastName}</div>
                          <div><strong className="text-gray-900 dark:text-white">Otasining ismi:</strong> {studentData.fatherName}</div>
                          <div><strong className="text-gray-900 dark:text-white">Telefon:</strong> +{studentData.phone}</div>
                          <div><strong className="text-gray-900 dark:text-white">Universitet:</strong> {application.university}</div>
                          <div><strong className="text-gray-900 dark:text-white">Yo'nalish:</strong> {studentData.direction}</div>
                          <div><strong className="text-gray-900 dark:text-white">Pasport:</strong> {studentData.passport}</div>
                          <div><strong className="text-gray-900 dark:text-white">Kurs:</strong> {studentData.course}</div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setShowAddStudentModal(false)}
                      className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      Bekor qilish
                    </button>
                    <button
                      onClick={async () => {
                        // Students sahifasiga o'tish va modal ochish
                        const studentData = prepareStudentDataFromApplication();
                        if (studentData) {
                          // Passport rasmlarini yuklab olish va localStorage ga saqlash
                          const dataToSave = { ...studentData };
                          
                          // Passport rasmlarini base64 formatida saqlash
                          if (application.passport_image_first) {
                            try {
                              const response = await fetch(application.passport_image_first);
                              const blob = await response.blob();
                              const reader = new FileReader();
                              reader.onload = () => {
                                dataToSave.passportImage1Base64 = reader.result as string;
                                saveAndNavigate(dataToSave);
                              };
                              reader.readAsDataURL(blob);
                              return; // Async operatsiya tugashini kutish
                            } catch (error) {
                              console.error('Passport image 1 yuklab olishda xatolik:', error);
                            }
                          }
                          
                          saveAndNavigate(dataToSave);
                        }
                        
                        function saveAndNavigate(data: any) {
                          localStorage.setItem('pendingStudentData', JSON.stringify(data));
                          window.location.href = '/students?openModal=true';
                        }
                      }}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Talaba qo'shish
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ApplicationDetail;