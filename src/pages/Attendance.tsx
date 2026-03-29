import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  TrendingUp,
  Building,
  Eye,
  Calendar,
  UserCog,
  X,
  Search,
  UserPlus
} from 'lucide-react';
import StatsCard from '../components/UI/StatsCard';
import api from '../data/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Select from 'react-select';
import AddLeaderModal from '../components/Modals/AddLeaderModal';

const Attendance: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [showAddLeaderModal, setShowAddLeaderModal] = useState(false);
  const [floorLeaders, setFloorLeaders] = useState<Array<{ id: number; user_info: { username: string; email: string; id: number }; floor_info: { name: string; id: number }; floor: number; user: number }>>([]);
  const [leaderForm, setLeaderForm] = useState({
    floor_id: '',
    student_id: '',
  });
  const [editingLeader, setEditingLeader] = useState<{ id: number; floor_id: string; student_id: string } | null>(null);
  const [addingLeader, setAddingLeader] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  
  const queryClient = useQueryClient();

  // Fetch floors
  const { data: floorsData } = useQuery({
    queryKey: ['floors'],
    queryFn: () => api.getFloors(),
  });

  const floors = floorsData?.results || floorsData || [];
  
  const floorsForModal = floors.map((f: any) => ({
    id: String(f.id),
    number: f.id, // Assuming ID is the floor number or use another property
    name: f.name
  }));

  // Fetch students
  const { data: studentsData } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.getStudents(),
  });

  const students = studentsData?.results || studentsData || [];

  // Fetch floor leaders
  const { data: leadersData, refetch: refetchLeaders } = useQuery({
    queryKey: ['floor-leaders'],
    queryFn: () => api.getFloorLeaders()
  });

  useEffect(() => {
    if (leadersData) {
      setFloorLeaders(leadersData.results || leadersData);
    }
  }, [leadersData]);

  // Calculate statistics
  const totalStudents = students.length;
  const totalPresent = 0; // Bu davomat sessiyalaridan hisoblanadi
  const totalAbsent = totalStudents - totalPresent;
  const attendanceRate = totalStudents > 0 ? ((totalPresent / totalStudents) * 100).toFixed(1) : '0';

  // Floor leader handlers
  const handleAddLeader = async () => {
    if (!leaderForm.floor_id || !leaderForm.student_id) {
      toast.error('Qavat va talabani tanlang!');
      return;
    }
    
    setAddingLeader(true);
    try {
      if (editingLeader) {
        // Update existing leader
        await api.updateFloorLeader(editingLeader.id, {
          floor: parseInt(leaderForm.floor_id),
          user: parseInt(leaderForm.student_id),
        });
        toast.success('Qavat sardori muvaffaqiyatli yangilandi!');
      } else {
        // Create new leader
        await api.createFloorLeader({
          floor: parseInt(leaderForm.floor_id),
          user: parseInt(leaderForm.student_id),
        });
        toast.success('Qavat sardori muvaffaqiyatli qo\'shildi!');
      }
      
      setShowLeaderModal(false);
      setLeaderForm({ floor_id: '', student_id: '' });
      setEditingLeader(null);
      setStudentSearch('');
      
      // Refresh floor leaders
      refetchLeaders();
    } catch (error: any) {
      console.error('Add/Edit leader error:', error);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const message = errorData.detail || errorData.message || JSON.stringify(errorData);
        toast.error(`Xatolik: ${message}`);
      } else {
        toast.error((error as Error)?.message || (editingLeader ? 'Sardorni yangilashda xatolik!' : 'Sardor qo\'shishda xatolik!'));
      }
    } finally {
      setAddingLeader(false);
    }
  };

  const handleEditLeader = (leader: any) => {
    setEditingLeader({
      id: leader.id,
      floor_id: String(leader.floor),
      student_id: String(leader.user)
    });
    setLeaderForm({
      floor_id: String(leader.floor),
      student_id: String(leader.user)
    });
    setShowLeaderModal(true);
  };

  const handleRemoveLeader = async (leaderId: number) => {
    if (!window.confirm('Haqiqatan ham bu qavat sardorini o\'chirmoqchimisiz?')) {
      return;
    }
    
    try {
      await api.deleteFloorLeader(leaderId);
      toast.success('Qavat sardori o\'chirildi!');
      
      // Refresh floor leaders
      refetchLeaders();
    } catch (error: any) {
      console.error('Remove leader error:', error);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const message = errorData.detail || errorData.message || JSON.stringify(errorData);
        toast.error(`Xatolik: ${message}`);
      } else {
        toast.error('Sardorni o\'chirishda xatolik!');
      }
    }
  };

  // Filter students for select
  const studentOptions = students
    .filter((s: any) => {
      const firstName = s.first_name || s.name || '';
      const lastName = s.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      return studentSearch === '' || fullName.toLowerCase().includes(studentSearch.toLowerCase());
    })
    .map((s: any) => {
      // Check if student has a user field (ID or object)
      // If s.user exists, use it. If not, fallback to s.id but log warning
      let userId = s.id;
      if (s.user) {
         if (typeof s.user === 'object' && s.user.id) {
             userId = s.user.id;
         } else if (typeof s.user === 'number') {
             userId = s.user;
         }
      }
      
      const firstName = s.first_name || s.name || '';
      const lastName = s.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      return {
        value: userId, // Use the determine User ID
        label: `${fullName} (ID: ${userId})`
      };
    });

  const floorOptions = floors.map((f: { id: number; name: string }) => ({
    value: f.id,
    label: f.name
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Davomat nazorati
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Talabalarning qavatlar bo'yicha davomat holati
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLeaderModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <UserCog className="h-4 w-4" />
            Sardor tayinlash
          </button>
          <button
            onClick={() => setShowAddLeaderModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Yangi sardor qo&apos;shish
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Umumiy statistika */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Jami talabalar"
          value={totalStudents.toString()}
          icon={Users}
          color="primary"
        />
        <StatsCard
          title="Hozir"
          value={totalPresent.toString()}
          icon={UserCheck}
          color="accent"
        />
        <StatsCard
          title="Yo&apos;q"
          value={totalAbsent.toString()}
          icon={UserX}
          color="danger"
        />
        <StatsCard
          title="Davomat foizi"
          value={`${attendanceRate}%`}
          icon={TrendingUp}
          color="secondary"
        />
      </div>

      {/* Qavat sardorlari */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Qavat sardorlari
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Har bir qavat uchun tayinlangan sardorlar
          </p>
        </div>
        
        <div className="p-6">
          {floorLeaders.length === 0 ? (
            <div className="text-center py-8">
              <UserCog className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Hozircha qavat sardorlari tayinlanmagan
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowLeaderModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <UserCog className="h-4 w-4" />
                  Sardor tayinlash
                </button>
                <button
                  onClick={() => setShowAddLeaderModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  Yangi sardor
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {floorLeaders.map((leader) => (
                <motion.div
                  key={leader.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-700 transition-all duration-200 hover:shadow-md relative group"
                >
                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditLeader(leader)}
                      className="p-1.5 bg-white dark:bg-gray-700 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg shadow-sm transition-colors"
                      title="Sardorni tahrirlash"
                    >
                      <UserCog className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveLeader(leader.id)}
                      className="p-1.5 bg-white dark:bg-gray-700 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-lg shadow-sm transition-colors"
                      title="Sardorni o'chirish"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Leader header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-600 dark:bg-green-700 rounded-lg">
                      <Building className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {leader.floor_info?.name || `${leader.floor}-qavat`}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Qavat
                      </p>
                    </div>
                  </div>

                  {/* Sardor ma'lumoti */}
                  <div className="p-3 bg-white dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCog className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Sardor
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                      {leader.user_info?.username || 'Noma\'lum'}
                    </p>
                    {leader.user_info?.email && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {leader.user_info.email}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AddLeaderModal Component */}
      <AddLeaderModal 
        isOpen={showAddLeaderModal}
        onClose={() => {
          setShowAddLeaderModal(false);
          refetchLeaders();
        }}
        floors={floorsForModal}
      />

      {/* Floor Leader Modal (Linking existing) */}
      <AnimatePresence>
        {showLeaderModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowLeaderModal(false);
              setLeaderForm({ floor_id: '', student_id: '' });
              setEditingLeader(null);
              setStudentSearch('');
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded transition-colors"
                onClick={() => {
                  setShowLeaderModal(false);
                  setLeaderForm({ floor_id: '', student_id: '' });
                  setEditingLeader(null);
                  setStudentSearch('');
                }}
              >
                <X size={22} />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <UserCog className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingLeader ? 'Sardorni tahrirlash' : 'Sardor tayinlash'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mavjud talabani tanlang</p>
                </div>
              </div>
              
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleAddLeader();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Qavat
                  </label>
                  <Select
                    options={floorOptions}
                    value={floorOptions.find((opt: { value: number; label: string }) => opt.value === parseInt(leaderForm.floor_id)) || null}
                    onChange={(option: { value: number; label: string } | null) => setLeaderForm({ ...leaderForm, floor_id: option ? String(option.value) : '' })}
                    placeholder="Qavatni tanlang..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    isClearable
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Talaba
                  </label>
                  <Select
                    options={studentOptions}
                    value={studentOptions.find((opt: { value: number; label: string }) => opt.value === parseInt(leaderForm.student_id)) || null}
                    onChange={(option: { value: number; label: string } | null) => setLeaderForm({ ...leaderForm, student_id: option ? String(option.value) : '' })}
                    onInputChange={(value) => setStudentSearch(value)}
                    placeholder="Talabani qidiring..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    isClearable
                    isSearchable
                    noOptionsMessage={() => "Talaba topilmadi"}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Mavjud talabalar ro'yxatidan tanlang
                  </p>
                </div>
                
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLeaderModal(false);
                      setLeaderForm({ floor_id: '', student_id: '' });
                      setEditingLeader(null);
                      setStudentSearch('');
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors w-full sm:w-auto"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={addingLeader}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-60 w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    {addingLeader ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {editingLeader ? 'Yangilanmoqda...' : 'Tayinlanmoqda...'}
                      </>
                    ) : (
                      <>
                        <UserCog className="w-4 h-4" />
                        {editingLeader ? 'Saqlash' : 'Tayinlash'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Attendance;
