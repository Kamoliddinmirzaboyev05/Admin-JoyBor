import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import BackButton from '../components/UI/BackButton';
import { BadgeCheck, Phone, MapPin, GraduationCap, Calendar, User, FileText, Image, Check, XCircle, UserPlus, Building, CreditCard, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { link } from '../data/config';
import { toast } from 'sonner';
import { invalidateApplicationCaches, invalidateStudentCaches } from '../utils/cacheUtils';
import { useGlobalEvents } from '../utils/globalEvents';

// Application interface API ma'lumotlariga mos
interface Application {
  id: number;
  user: {
    id: number;
    username: string;
  };
  dormitory: {
    id: number;
    name: string;
  };
  name: string;
  last_name: string;
  middle_name: string;
  province: {
    id: number;
    name: string;
  };
  district: {
    id: number;
    name: string;
    province: number;
  };
  faculty: string;
  direction: string | null;
  course: string;
  group: string | null;
  phone: number;
  passport: string | null;
  status: string;
  comment: string;
  admin_comment: string | null;
  document: string | null;
  user_image: string | null;
  passport_image_first: string | null;
  passport_image_second: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  'PENDING': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
  'APPROVED': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
  'REJECTED': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',
};

const statusLabels: Record<string, string> = {
  'PENDING': 'Ko\'rib chiqilmoqda',
  'APPROVED': 'Qabul qilindi',
  'REJECTED': 'Rad etilgan',
};

// Status olish funksiyasi
const getStatusColor = (status: string) => {
  const upperStatus = String(status).toUpperCase();
  return statusColors[upperStatus] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
};

const getStatusLabel = (status: string) => {
  const upperStatus = String(status).toUpperCase();
  return statusLabels[upperStatus] || status;
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
  const { emitApplicationUpdate, emitStudentUpdate, subscribe } = useGlobalEvents();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [convertingToStudent, setConvertingToStudent] = useState(false);

  // Fetch application details from API
  const {
    data: application,
    isLoading,
    error,
    refetch
  } = useQuery<Application>({
    queryKey: ['application', id],
    queryFn: async () => {
      const token = sessionStorage.getItem('access');
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

  // Listen for global application updates
  React.useEffect(() => {
    const unsubscribe = subscribe('application-updated', () => {
      refetch();
    });
    return unsubscribe;
  }, [subscribe, refetch]);

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

  const handleApprove = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('access');

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
        throw new Error(errorData.message || errorData.detail || `Server xatoligi: ${response.status}`);
      }

      toast.success('Ariza muvaffaqiyatli qabul qilindi!');
      setShowApproveModal(false);
      setComment('');

      // Barcha bog'liq cache larni yangilash
      await Promise.all([
        invalidateApplicationCaches(queryClient),
        invalidateStudentCaches(queryClient)
      ]);
      await refetch();
      emitApplicationUpdate({ action: 'approved', id });
      emitStudentUpdate({ action: 'created' });
    } catch (error: any) {
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
      const token = sessionStorage.getItem('access');

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
        throw new Error(errorData.message || errorData.detail || `Server xatoligi: ${response.status}`);
      }

      toast.success('Ariza rad etildi!');
      setShowRejectModal(false);
      setComment('');

      await invalidateApplicationCaches(queryClient);
      await refetch();
      emitApplicationUpdate({ action: 'rejected', id });
    } catch (error: any) {
      toast.error(error.message || 'Arizani rad etishda xatolik yuz berdi!');
    } finally {
      setLoading(false);
    }
  };

  // Convert application to student function - Updated with proper error handling
  const handleConvertToStudent = async () => {
    if (!application?.id) {
      toast.error("Ariza ID topilmadi.");
      return;
    }
    
    setConvertingToStudent(true);
    try {
      const token = sessionStorage.getItem('access');
      if (!token) {
        throw new Error('Avtorizatsiya talab qilinadi');
      }

      // Create FormData with application_id
      const formData = new FormData();
      formData.append('application_id', String(application.id));

      const response = await fetch(`${link}/student/create/`, {
        method: 'POST',
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
        throw new Error(errorData.message || errorData.detail || `Server xatoligi: ${response.status}`);
      }

      const result = await response.json();
      toast.success('Ariza muvaffaqiyatli talabaga aylantirildi!');
      
      // Refresh application details
      await refetch();
      
      // Emit global event for student update
      emitStudentUpdate({ action: 'created', data: result });
      
    } catch (error: any) {
      console.error('Convert application error:', error);
      toast.error(error.message || 'Arizani talabaga aylantirishda xatolik yuz berdi');
    } finally {
      setConvertingToStudent(false);
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
          <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
            <BadgeCheck className="w-4 h-4" />
            {getStatusLabel(application.status)}
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
                  {(application.last_name?.charAt(0) || '') + (application.name?.charAt(0) || '') || 'A'}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold mb-1">{application.last_name} {application.name}</h1>
                <p className="text-blue-100 mb-2">{application.dormitory?.name || 'Yotoqxona'}</p>
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
                value={`${application.last_name} ${application.name} ${application.middle_name}`.trim()}
              />
              <InfoCard
                icon={<Phone className="w-5 h-5" />}
                label="Telefon raqam"
                value={`+${application.phone}`}
              />
              <InfoCard
                icon={<Building className="w-5 h-5" />}
                label="Yotoqxona"
                value={application.dormitory?.name}
              />
              <InfoCard
                icon={<MapPin className="w-5 h-5" />}
                label="Viloyat"
                value={application.province?.name}
              />
              <InfoCard
                icon={<MapPin className="w-5 h-5" />}
                label="Tuman"
                value={application.district?.name}
              />
              <InfoCard
                icon={<GraduationCap className="w-5 h-5" />}
                label="Fakultet"
                value={application.faculty}
              />
              <InfoCard
                icon={<GraduationCap className="w-5 h-5" />}
                label="Yo'nalish"
                value={application.direction}
              />
              <InfoCard
                icon={<GraduationCap className="w-5 h-5" />}
                label="Kurs"
                value={application.course}
              />
              <InfoCard
                icon={<GraduationCap className="w-5 h-5" />}
                label="Guruh"
                value={application.group}
              />
              <InfoCard
                icon={<CreditCard className="w-5 h-5" />}
                label="Pasport"
                value={application.passport}
              />
              <InfoCard
                icon={<User className="w-5 h-5" />}
                label="Foydalanuvchi ID"
                value={application.user?.id}
              />
              <InfoCard
                icon={<User className="w-5 h-5" />}
                label="Username"
                value={application.user?.username}
              />
            </div>

            {/* Comment Section */}
            {application.comment && (
              <div className="bg-blue-50 dark:bg-slate-700/50 border border-blue-200 dark:border-slate-600 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Talaba izohi</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{application.comment}</p>
              </div>
            )}

            {/* Admin Comment Section */}
            {application.admin_comment && (
              <div className={`border rounded-xl p-4 mb-6 ${String(application.status).toUpperCase() === 'APPROVED'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                }`}>
                <div className="flex items-center gap-2 mb-2">
                  {String(application.status).toUpperCase() === 'APPROVED' ? (
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${String(application.status).toUpperCase() === 'APPROVED'
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
            {String(application.status).toUpperCase() === 'PENDING' && (
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
            {String(application.status).toUpperCase() !== 'PENDING' && (
              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg mb-4 ${String(application.status).toUpperCase() === 'APPROVED'
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                  }`}>
                  {String(application.status).toUpperCase() === 'APPROVED' ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span className="font-medium">Bu ariza qabul qilingan</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">Bu ariza rad etilgan</span>
                    </>
                  )}
                </div>

                {/* Add Student Button for approved applications */}
                {String(application.status).toUpperCase() === 'APPROVED' && (
                  <div className="flex justify-center">
                    <button
                      onClick={handleConvertToStudent}
                      disabled={convertingToStudent}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {convertingToStudent ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Qo'shilmoqda...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5" />
                          <span>Talabalar ro'yxatiga qo'shish</span>
                        </>
                      )}
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
    </motion.div>
  );
};

export default ApplicationDetail;
