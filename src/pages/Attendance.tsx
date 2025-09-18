import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  TrendingUp,
  Building,
  Eye,
  Calendar,
  UserPlus
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import StatsCard from '../components/UI/StatsCard';
import AddLeaderModal from '../components/Modals/AddLeaderModal';
import { useQuery } from '@tanstack/react-query';
import { apiQueries } from '../data/api';
import type { AttendanceSession } from '../types/AttendanceSession';

const Attendance: React.FC = () => {
  const { floors, attendanceRecords, updateFloorStats } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [isAddLeaderModalOpen, setIsAddLeaderModalOpen] = useState(false);

  useEffect(() => {
    updateFloorStats();
  }, [updateFloorStats]);

  // Real API'dan attendance sessions olish
  const { 
    data: attendanceSessions = [], 
    isLoading: sessionsLoading,
    error: sessionsError,
    refetch: refetchSessions
  } = useQuery<AttendanceSession[]>({
    queryKey: ['attendance-sessions', selectedDate],
    queryFn: () => apiQueries.getAttendanceSessions({ date: selectedDate }),
    staleTime: 1000 * 60 * 5, // 5 daqiqa cache
  });

  // Bugungi umumiy statistika
  const totalStudents = floors.reduce((sum, floor) => sum + floor.totalStudents, 0);
  const totalPresent = floors.reduce((sum, floor) => sum + floor.presentStudents, 0);
  const totalAbsent = totalStudents - totalPresent; // Haqiqiy absent talabalar soni
  const attendanceRate = totalStudents > 0 ? ((totalPresent / totalStudents) * 100).toFixed(1) : '0';

  // Tanlangan sana uchun davomat ma'lumotlari
  const selectedDateAttendance = useMemo(() => 
    attendanceRecords.filter(record => record.date === selectedDate),
    [attendanceRecords, selectedDate]
  );

  // Tanlangan qavat uchun davomat ma'lumotlari
  const selectedFloorAttendance = useMemo(() => 
    selectedFloor ? selectedDateAttendance.filter(record => record.floor === selectedFloor) : [],
    [selectedDateAttendance, selectedFloor]
  );

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
            onClick={() => setIsAddLeaderModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Qavat sardori qo&apos;shish
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
          color="blue"
        />
        <StatsCard
          title="Hozir"
          value={totalPresent.toString()}
          icon={UserCheck}
          color="green"
        />
        <StatsCard
          title="Yo&apos;q"
          value={totalAbsent.toString()}
          icon={UserX}
          color="red"
        />
        <StatsCard
          title="Davomat foizi"
          value={`${attendanceRate}%`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Navbatchilar va davomat sessiyalari */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Navbatchilar va davomat sessiyalari
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {selectedDate} sanasi uchun
          </p>
        </div>
        
        <div className="p-6">
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Yuklanmoqda...</span>
            </div>
          ) : sessionsError ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-2">Ma&apos;lumotlarni yuklashda xatolik</div>
              <button 
                onClick={() => refetchSessions()}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Qayta urinish
              </button>
            </div>
          ) : attendanceSessions.length === 0 ? (
            <div className="text-center py-8">
              <UserX className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {selectedDate} sanasi uchun davomat sessiyalari topilmadi
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {attendanceSessions.map((session) => (
                <motion.div
                  key={session.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 cursor-pointer transition-all duration-200 hover:shadow-md"
                  onClick={() => setSelectedSession(selectedSession?.id === session.id ? null : session)}
                >
                  {/* Session header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {session.floor?.[0]?.name || `${session.leader.floor}-qavat`}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {session.rooms.length} xona
                        </p>
                      </div>
                    </div>
                    <Eye className="h-4 w-4 text-gray-400" />
                  </div>

                  {/* Navbatchi ma'lumoti */}
                  <div className="mb-4 p-3 bg-white dark:bg-gray-600/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Navbatchi
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {session.leader.user}
                    </p>
                  </div>

                  {/* Xonalar statistikasi */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {session.rooms.reduce((sum, room) => sum + room.students.length, 0)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Jami talaba
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {session.rooms.length}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Xonalar
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Qavatlar overview (eski) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Qavatlar bo&apos;yicha davomat (Eski)
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {floors.map((floor) => (
              <motion.div
                key={floor.id}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 cursor-pointer transition-all duration-200 hover:shadow-md"
                onClick={() => setSelectedFloor(selectedFloor === floor.number ? null : floor.number)}
              >
                {/* Floor header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {floor.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {floor.totalRooms} xona
                      </p>
                    </div>
                  </div>
                  <Eye className="h-4 w-4 text-gray-400" />
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Davomat</span>
                    <span>
                      {floor.totalStudents > 0 
                        ? `${((floor.presentStudents / floor.totalStudents) * 100).toFixed(0)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: floor.totalStudents > 0 
                          ? `${(floor.presentStudents / floor.totalStudents) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {floor.totalStudents}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Jami
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {floor.presentStudents}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Hozir
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">
                      {floor.absentStudents}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Yo&apos;q
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Tanlangan qavat tafsilotlari */}
      {selectedFloor && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {floors.find(f => f.number === selectedFloor)?.name} - Batafsil ma'lumot
              </h2>
              <button
                onClick={() => setSelectedFloor(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {selectedFloorAttendance.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        record.status === 'present' 
                          ? 'bg-green-100 dark:bg-green-900/50' 
                          : record.status === 'late'
                          ? 'bg-yellow-100 dark:bg-yellow-900/50'
                          : 'bg-red-100 dark:bg-red-900/50'
                      }`}>
                        {record.status === 'present' ? (
                          <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : record.status === 'late' ? (
                          <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        ) : (
                          <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {record.studentName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {record.room}-xona
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          record.status === 'present'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                            : record.status === 'late'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        }`}>
                          {record.status === 'present' ? 'Hozir' : 
                           record.status === 'late' ? 'Kech keldi' : 'Yo&apos;q'}
                        </span>
                      </div>
                      {record.checkInTime && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {record.checkInTime}
                        </p>
                      )}
                      {record.notes && (
                        <p className="text-xs text-gray-400 mt-1 max-w-32 truncate">
                          {record.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

              {selectedFloorAttendance.length === 0 && (
                <div className="text-center py-8">
                  <UserX className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Bu qavat uchun tanlangan sanada davomat ma'lumotlari topilmadi
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Add Leader Modal */}
      <AddLeaderModal
        isOpen={isAddLeaderModalOpen}
        onClose={() => setIsAddLeaderModalOpen(false)}
        floors={floors}
      />
    </div>
  );
};

export default Attendance;
