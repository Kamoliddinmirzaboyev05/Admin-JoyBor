import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import BackButton from '../components/UI/BackButton';
import { MapPin, GraduationCap, User, FileText, Check, XCircle, MessageSquare, CreditCard, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { link } from '../data/config';
import { toast } from 'sonner';
import { invalidateApplicationCaches } from '../utils/cacheUtils';
import { useGlobalEvents } from '../utils/globalEvents';

interface Application {
  id: number;
  name: string;
  last_name: string;
  middle_name: string;
  province_name: string;
  district_name: string;
  faculty: string;
  direction: string;
  course: string;
  group: string;
  phone: string;
  passport: string;
  status: string;
  comment: string;
  admin_comment: string | null;
  document: string | null;
  user_image: string | null;
  passport_image_first: string | null;
  passport_image_second: string | null;
  created_at: string;
  dormitory_name: string;
  user: string | number;
  dormitory: number;
  province: number;
  district: number;
  gender?: string;
  student_id?: number;
}

const statusColors: Record<string, string> = {
  'PENDING': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  'APPROVED': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  'REJECTED': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};

const statusLabels: Record<string, string> = {
  'PENDING': 'Ko\'rib chiqilmoqda',
  'APPROVED': 'Qabul qilindi',
  'REJECTED': 'Rad etilgan',
};

const getStatusColor = (status: string) => {
  const upperStatus = String(status).toUpperCase();
  return statusColors[upperStatus] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
};

const getStatusLabel = (status: string) => {
  const upperStatus = String(status).toUpperCase();
  return statusLabels[upperStatus] || status;
};

const ApplicationDetail: React.FC = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { emitApplicationUpdate, emitStudentUpdate } = useGlobalEvents();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number>(0);
  const [selectedRoom, setSelectedRoom] = useState<number>(0);
  
  // Student form data
  const [studentForm, setStudentForm] = useState({
    name: '',
    last_name: '',
    middle_name: '',
    passport: '',
    faculty: '',
    direction: '',
    course: '',
    group: '',
    phone: '',
    gender: 'Erkak',
  });

  const { data: application, isLoading, error, refetch } = useQuery<Application>({
    queryKey: ['application', id],
    queryFn: async () => {
      const token = sessionStorage.getItem('access');
      const response = await fetch(`${link}/applications/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Ariza ma\'lumotlarini yuklashda xatolik');
      return response.json();
    },
    enabled: !!id,
  });

  // Fetch floors
  const { data: floorsData } = useQuery<{ results: Array<{ id: number; name: string }> }>({
    queryKey: ['floors'],
    queryFn: async () => {
      const token = sessionStorage.getItem('access');
      const response = await fetch(`${link}/floors/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Qavatlarni yuklashda xatolik');
      return response.json();
    },
  });
  const floors = floorsData?.results || [];

  // Fetch rooms based on selected floor
  const { data: roomsData } = useQuery<{ results: Array<{ id: number; name: string; capacity: number; current_occupancy: number; status: string }> }>({
    queryKey: ['rooms', selectedFloor],
    queryFn: async () => {
      if (!selectedFloor) return { results: [] };
      const token = sessionStorage.getItem('access');
      const response = await fetch(`${link}/rooms/?floor=${selectedFloor}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Xonalarni yuklashda xatolik');
      return response.json();
    },
    enabled: !!selectedFloor,
  });
  const rooms = roomsData?.results || [];

  const handleApprove = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('access');
      const payload = {
        admin_comment: comment.trim() || 'Qabul qilindi',
      };
      
      console.log('Approve request:', {
        url: `${link}/applications/${id}/approve/`,
        method: 'PATCH',
        payload
      });

      const response = await fetch(`${link}/applications/${id}/approve/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Approve response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Approve error:', errorData);
        throw new Error(errorData.detail || errorData.message || JSON.stringify(errorData) || 'Xatolik yuz berdi');
      }

      const result = await response.json().catch(() => ({}));
      console.log('Approve success:', result);

      toast.success('Ariza qabul qilindi!');
      setShowApproveModal(false);
      setComment('');
      await invalidateApplicationCaches(queryClient);
      await refetch();
      emitApplicationUpdate({ action: 'approved', id });
      emitStudentUpdate({ action: 'created' });
    } catch (error) {
      console.error('Approve catch error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Xatolik yuz berdi!';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      toast.error('Rad etish sababini yozing!');
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem('access');
      const response = await fetch(`${link}/applications/${id}/admin/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Rejected',
          admin_comment: comment.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Xatolik yuz berdi');
      }

      toast.success('Ariza rad etildi!');
      setShowRejectModal(false);
      setComment('');
      await invalidateApplicationCaches(queryClient);
      await refetch();
      emitApplicationUpdate({ action: 'rejected', id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Xatolik yuz berdi!';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedFloor || !selectedRoom) {
      toast.error('Qavat va xonani tanlang!');
      return;
    }

    if (!application) {
      toast.error('Ariza ma\'lumotlari topilmadi!');
      return;
    }

    // Validate required fields
    if (!studentForm.name || !studentForm.last_name || !studentForm.passport) {
      toast.error('Ism, familiya va pasport majburiy!');
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem('access');
      
      // Parse user ID correctly
      const userId = typeof application.user === 'number' 
        ? application.user 
        : (typeof application.user === 'string' ? parseInt(application.user) : 0);
      
      // Find student by user ID (more accurate than passport)
      console.log('Searching for student with user ID:', userId);
      const searchResponse = await fetch(`${link}/students/?user=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!searchResponse.ok) {
        throw new Error('Talabani qidirishda xatolik yuz berdi');
      }

      const searchData = await searchResponse.json();
      console.log('Student search result:', searchData);

      // Check if student exists
      if (!searchData.results || searchData.results.length === 0) {
        toast.error('User ID bo\'yicha talaba topilmadi! Avval arizani qabul qiling.');
        return;
      }

      const studentId = searchData.results[0].id;
      console.log('Found student ID:', studentId, 'for user:', userId);

      // Update existing student with PATCH (only fields that need to be updated)
      const updateData = {
        name: studentForm.name || '',
        last_name: studentForm.last_name || '',
        middle_name: studentForm.middle_name || '',
        faculty: studentForm.faculty || '',
        direction: studentForm.direction || '',
        group: studentForm.group || '',
        course: studentForm.course || '1-kurs',
        gender: studentForm.gender || 'Erkak',
        phone: studentForm.phone || '',
        placement_status: 'Qabul qilindi',
        is_active: true,
        floor: selectedFloor,
        room: selectedRoom,
      };

      console.log('Updating student:', {
        studentId: studentId,
        url: `${link}/students/${studentId}/`,
        data: updateData
      });

      const response = await fetch(`${link}/students/${studentId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Student update error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          sentData: updateData
        });
        
        // Show detailed error message
        let errorMessage = 'Xatolik yuz berdi';
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'object') {
          // Show field-specific errors
          const errors = Object.entries(errorData).map(([key, value]) => `${key}: ${value}`).join(', ');
          if (errors) errorMessage = errors;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Student update success:', result);

      toast.success('Talaba muvaffaqiyatli yangilandi!');
      setShowAddStudentModal(false);
      setSelectedFloor(0);
      setSelectedRoom(0);
      // Reset form
      setStudentForm({
        name: '',
        last_name: '',
        middle_name: '',
        passport: '',
        faculty: '',
        direction: '',
        course: '',
        group: '',
        phone: '',
        gender: 'Erkak',
      });
      emitStudentUpdate({ action: 'created' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Xatolik yuz berdi!';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="text-center py-10 text-red-600 dark:text-red-400">
        Ariza topilmadi yoki yuklashda xatolik yuz berdi.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <BackButton />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden mt-6"
      >
        {/* Header with Student Image */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Student Image */}
            {application.user_image && (
              <div 
                className="flex-shrink-0 cursor-pointer group"
                onClick={() => setSelectedImage(application.user_image)}
              >
                <div className="relative w-32 h-32 rounded-lg overflow-hidden ring-2 ring-gray-200 dark:ring-slate-600 group-hover:ring-blue-500 transition">
                  <img
                    src={application.user_image}
                    alt="Talaba"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition text-xs font-medium">
                      Ko'rish
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Student Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {application.last_name} {application.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {application.middle_name}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${getStatusColor(application.status)}`}>
                  {getStatusLabel(application.status)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Shaxsiy ma'lumotlar */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Shaxsiy ma'lumotlar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  Pasport seriyasi
                </div>
                <div className="text-gray-900 dark:text-white font-semibold">{application.passport}</div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Yashash manzili
                </div>
                <div className="text-gray-900 dark:text-white font-semibold text-sm">
                  {application.province_name}, {application.district_name}
                </div>
              </div>
            </div>
          </div>

          {/* O'qish ma'lumotlari */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              O'qish ma'lumotlari
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fakultet</div>
                <div className="text-gray-900 dark:text-white font-semibold">{application.faculty}</div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Yo'nalish</div>
                <div className="text-gray-900 dark:text-white font-semibold">{application.direction || '-'}</div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Kurs</div>
                <div className="text-gray-900 dark:text-white font-semibold">{application.course}</div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Guruh</div>
                <div className="text-gray-900 dark:text-white font-semibold">{application.group || '-'}</div>
              </div>
            </div>
          </div>

          {/* Talaba izohi */}
          {application.comment && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Talaba izohi
              </h2>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <p className="text-gray-700 dark:text-gray-300">{application.comment}</p>
              </div>
            </div>
          )}

          {/* Pasport rasmlari */}
          {(application.passport_image_first || application.passport_image_second) && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Pasport rasmlari
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {application.passport_image_first && (
                  <div 
                    className="group relative bg-gray-50 dark:bg-slate-700/50 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition"
                    onClick={() => setSelectedImage(application.passport_image_first)}
                  >
                    <img
                      src={application.passport_image_first}
                      alt="Pasport old tomoni"
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition text-sm font-medium">
                        Ko'rish
                      </span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Pasport (old tomoni)</div>
                    </div>
                  </div>
                )}
                {application.passport_image_second && (
                  <div 
                    className="group relative bg-gray-50 dark:bg-slate-700/50 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition"
                    onClick={() => setSelectedImage(application.passport_image_second)}
                  >
                    <img
                      src={application.passport_image_second}
                      alt="Pasport orqa tomoni"
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition text-sm font-medium">
                        Ko'rish
                      </span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Pasport (orqa tomoni)</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Qo'shimcha hujjat */}
          {application.document && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Qo'shimcha hujjat
              </h2>
              <div 
                className="group relative bg-gray-50 dark:bg-slate-700/50 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition max-w-md"
                onClick={() => setSelectedImage(application.document)}
              >
                <img
                  src={application.document}
                  alt="Qo'shimcha hujjat"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 transition text-sm font-medium">
                    Ko'rish
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Qo'shimcha hujjat</div>
                </div>
              </div>
            </div>
          )}

          {/* Admin izohi */}
          {application.admin_comment && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Admin izohi
              </h2>
              <div className={`rounded-lg p-4 border ${
                String(application.status).toUpperCase() === 'APPROVED'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
              }`}>
                <p className="text-gray-700 dark:text-gray-300">{application.admin_comment}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
            {String(application.status).toUpperCase() === 'PENDING' ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowApproveModal(true)}
                  className="flex-1 px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Qabul qilish
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="flex-1 px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Rad etish
                </button>
              </div>
            ) : String(application.status).toUpperCase() === 'APPROVED' && (
              <button
                onClick={() => {
                  if (application) {
                    setStudentForm({
                      name: application.name,
                      last_name: application.last_name,
                      middle_name: application.middle_name,
                      passport: application.passport,
                      faculty: application.faculty,
                      direction: application.direction,
                      course: application.course,
                      group: application.group,
                      phone: application.phone,
                      gender: 'Erkak',
                    });
                  }
                  setShowAddStudentModal(true);
                }}
                className="w-full px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Talabalar ro'yxatiga qo'shish
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition"
              >
                <XCircle className="w-8 h-8" />
              </button>
              <img
                src={selectedImage}
                alt="Katta rasm"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Arizani qabul qilish
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Rostdan ham bu arizani qabul qilmoqchimisiz?
              </p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Izoh (ixtiyoriy)"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setComment('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saqlanmoqda...
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
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Arizani rad etish
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Rad etish sababini yozing:
              </p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Sabab..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={3}
                required
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setComment('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading || !comment.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saqlanmoqda...
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
        {showAddStudentModal && application && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowAddStudentModal(false);
              setSelectedFloor(0);
              setSelectedRoom(0);
              // Reset form
              setStudentForm({
                name: '',
                last_name: '',
                middle_name: '',
                passport: '',
                faculty: '',
                direction: '',
                course: '',
                group: '',
                phone: '',
                gender: 'Erkak',
              });
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Talabalar ro'yxatiga qo'shish
              </h3>
              
              {/* Form */}
              <div className="space-y-4">
                {/* Shaxsiy ma'lumotlar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ism <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ism"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Familiya <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={studentForm.last_name}
                      onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Familiya"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Otasining ismi
                    </label>
                    <input
                      type="text"
                      value={studentForm.middle_name}
                      onChange={(e) => setStudentForm({ ...studentForm, middle_name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Otasining ismi"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pasport <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={studentForm.passport}
                      onChange={(e) => setStudentForm({ ...studentForm, passport: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="AA1234567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Telefon
                    </label>
                    <input
                      type="text"
                      value={studentForm.phone}
                      onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+998901234567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Jinsi
                    </label>
                    <select
                      value={studentForm.gender}
                      onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Erkak">Erkak</option>
                      <option value="Ayol">Ayol</option>
                    </select>
                  </div>
                </div>

                {/* O'qish ma'lumotlari */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fakultet
                    </label>
                    <input
                      type="text"
                      value={studentForm.faculty}
                      onChange={(e) => setStudentForm({ ...studentForm, faculty: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Fakultet"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Yo'nalish
                    </label>
                    <input
                      type="text"
                      value={studentForm.direction}
                      onChange={(e) => setStudentForm({ ...studentForm, direction: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Yo'nalish"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Kurs
                    </label>
                    <select
                      value={studentForm.course}
                      onChange={(e) => setStudentForm({ ...studentForm, course: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Kursni tanlang</option>
                      <option value="1-kurs">1-kurs</option>
                      <option value="2-kurs">2-kurs</option>
                      <option value="3-kurs">3-kurs</option>
                      <option value="4-kurs">4-kurs</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Guruh
                    </label>
                    <input
                      type="text"
                      value={studentForm.group}
                      onChange={(e) => setStudentForm({ ...studentForm, group: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Guruh"
                    />
                  </div>
                </div>

                {/* Qavat va xona */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Qavat <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedFloor}
                      onChange={(e) => {
                        setSelectedFloor(Number(e.target.value));
                        setSelectedRoom(0);
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={0}>Qavatni tanlang</option>
                      {floors.map((floor) => (
                        <option key={floor.id} value={floor.id}>
                          {floor.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Xona <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedRoom}
                      onChange={(e) => setSelectedRoom(Number(e.target.value))}
                      disabled={!selectedFloor}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value={0}>Xonani tanlang</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name} ({room.current_occupancy}/{room.capacity})
                        </option>
                      ))}
                    </select>
                    {selectedFloor && rooms.length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Bu qavatda xonalar mavjud emas
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    setShowAddStudentModal(false);
                    setSelectedFloor(0);
                    setSelectedRoom(0);
                    // Reset form
                    setStudentForm({
                      name: '',
                      last_name: '',
                      middle_name: '',
                      passport: '',
                      faculty: '',
                      direction: '',
                      course: '',
                      group: '',
                      phone: '',
                      gender: 'Erkak',
                    });
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleAddStudent}
                  disabled={loading || !selectedFloor || !selectedRoom || !studentForm.name || !studentForm.last_name || !studentForm.passport}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Qo'shilmoqda...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Talaba qo'shish
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApplicationDetail;
