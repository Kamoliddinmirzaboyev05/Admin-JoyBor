import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp,
  Building,
  UserPlus,
  UserCog,
  ChevronDown,
  Clock,
  ArrowRightLeft,
  Calendar,
  X,
  User,
  Mail
} from 'lucide-react';
import StatsCard from '../components/UI/StatsCard';
import api from '../data/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AddLeaderModal from '../components/Modals/AddLeaderModal';
import ModernDatePicker from '../components/UI/ModernDatePicker';

const Attendance: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [showAddLeaderModal, setShowAddLeaderModal] = useState(false);
  const [floorLeaders, setFloorLeaders] = useState<Array<{ id: number; user_info: { username: string; email: string; id: number }; floor_info: { name: string; id: number }; floor: number; user: number }>>([]);
  const [showFloorFilter, setShowFloorFilter] = useState(false);
  const [showLeadersModal, setShowLeadersModal] = useState(false);
  
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

  // 1. Barcha talabalarni olish (Qavatlar statistikasi uchun)
  const { data: studentsData } = useQuery({
    queryKey: ['students-all'], 
    queryFn: () => api.getStudents(),
  });

  const allStudents = studentsData?.results || studentsData || [];

  // 2. Kunlik barcha davomat qaydlarini olish
  const { data: attendanceRecordsData, isLoading: isAttendanceLoading } = useQuery({
    queryKey: ['attendance-records-daily', selectedDate],
    queryFn: () => api.getAttendanceRecords({ date: selectedDate })
  });

  const allDailyRecords = React.useMemo(() => {
    const rawRecords = attendanceRecordsData?.results || attendanceRecordsData || [];
    // Sana bo'yicha qat'iy filtrlash (API noto'g'ri sana qaytarsa ham frontend to'g'irlaydi)
    return rawRecords.filter((record: any) => !selectedDate || record.session_date === selectedDate);
  }, [attendanceRecordsData, selectedDate]);

  // 3. Tanlangan qavat va sana bo'yicha filtrlangan records (Jadval uchun)
  const attendanceRecords = React.useMemo(() => {
    return allDailyRecords.filter((record: any) => {
      let floorMatch = true;
      if (selectedFloor) {
        const selectedFloorName = floors.find((f: any) => f.id === selectedFloor)?.name;
        floorMatch = record.floor_name === selectedFloorName;
      }
      return floorMatch;
    });
  }, [allDailyRecords, selectedFloor, floors]);

  // 4. Statistika hisoblash
  const stats = React.useMemo(() => {
    // Tanlangan qavatdagi talabalar
    const filteredStudents = selectedFloor
      ? allStudents.filter((s: any) => s.floor === selectedFloor)
      : allStudents;

    const totalCount = filteredStudents.length;

    // Har bir talabaning eng oxirgi holatini topish (faqat tanlangan qavat/barcha uchun)
    const latestStudentStatuses: Record<number, string> = {};
    const sortedRecords = [...attendanceRecords].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    sortedRecords.forEach((record: any) => {
      latestStudentStatuses[record.student] = record.status;
    });

    const presentCount = Object.values(latestStudentStatuses).filter(status => status === 'in').length;
    const absentCount = totalCount - presentCount;
    const rate = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : '0';

    return { total: totalCount, present: presentCount, absent: absentCount, rate: rate };
  }, [allStudents, attendanceRecords, selectedFloor]);

  // 5. Har bir qavat uchun alohida statistika (Grid uchun)
  const floorStats = React.useMemo(() => {
    const statsMap: Record<number, { total: number; present: number }> = {};
    
    // Barcha talabalarning kunlik oxirgi holatlarini hisoblash
    const globalLatestStatuses: Record<number, string> = {};
    [...allDailyRecords]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .forEach((record: any) => {
        globalLatestStatuses[record.student] = record.status;
      });

    floors.forEach((floor: any) => {
      const floorStudents = allStudents.filter((s: any) => s.floor === floor.id);
      const presentOnFloor = floorStudents.filter((s: any) => globalLatestStatuses[s.id] === 'in').length;
      
      statsMap[floor.id] = {
        total: floorStudents.length,
        present: presentOnFloor
      };
    });

    return statsMap;
  }, [allStudents, allDailyRecords, floors]);

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

  const floorOptions = floors.map((f: { id: number; name: string }) => ({
    value: f.id,
    label: f.name
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-blue-600" />
            Davomat nazorati
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Talabalarning qavatlar bo'yicha davomat holati
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowLeadersModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all hover:bg-gray-200 dark:hover:bg-gray-700 text-sm sm:text-base border border-gray-200 dark:border-gray-700"
          >
            <UserCog className="h-4 w-4 text-blue-500" />
            <span className="sm:inline">Sardorlar</span>
          </button>

          <button
            onClick={() => setShowAddLeaderModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 text-sm sm:text-base"
          >
            <UserPlus className="h-4 w-4" />
            <span className="sm:inline">Yangi</span>
          </button>
        </div>
      </div>

      {/* Umumiy statistika */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Jami talabalar"
          value={stats.total}
          icon={Users}
          color="primary"
        />
        <StatsCard
          title="Hozir"
          value={stats.present}
          icon={UserCheck}
          color="accent"
        />
        <StatsCard
          title="Yo&apos;q"
          value={stats.absent}
          icon={UserX}
          color="danger"
        />
        <StatsCard
          title="Davomat foizi"
          value={`${stats.rate}%`}
          icon={TrendingUp}
          color="secondary"
        />
      </div>

      {/* Qavatlar bo'yicha davomat holati */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 overflow-hidden relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Building className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Qavatlar bo&apos;yicha davomat holati
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(selectedDate).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {floors.map((floor: any) => {
            const floorRecords = allDailyRecords.filter((record: any) => record.floor_name === floor.name);
            const hasAttendance = floorRecords.length > 0;
            const stats = floorStats[floor.id] || { total: 0, present: 0 };
            
            return (
              <motion.div
                key={floor.id}
                whileHover={{ y: -4, shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                onClick={() => {
                  setSelectedFloor(floor.id);
                  const element = document.getElementById('attendance-records-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex flex-col gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
                  selectedFloor === floor.id
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 ring-4 ring-blue-500/10'
                    : hasAttendance
                    ? 'border-green-200 bg-white dark:bg-gray-800/50 dark:border-green-900/30 hover:border-green-400'
                    : 'border-red-100 bg-white dark:bg-gray-800/50 dark:border-red-900/20 hover:border-red-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${hasAttendance ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                      <Building className="h-4 w-4" />
                    </div>
                    <span className="font-black text-gray-900 dark:text-white text-base">
                      {floor.name}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      hasAttendance
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                    }`}
                  >
                    {hasAttendance ? 'Qayd etilgan' : 'Yo\'q'}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Davomat ko'rsatkichi</span>
                    <span className="text-sm font-black text-gray-900 dark:text-white">
                      {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.total > 0 ? (stats.present / stats.total) * 100 : 0}%` }}
                      className={`h-full rounded-full ${hasAttendance ? 'bg-green-500' : 'bg-red-500'}`}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3 w-3 text-gray-400" />
                      <span className="text-[11px] font-black text-gray-500 dark:text-gray-400">
                        JAMI: <span className="text-gray-900 dark:text-white ml-0.5">{stats.total} ta</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="h-3 w-3 text-green-500" />
                      <span className="text-[11px] font-black text-gray-500 dark:text-gray-400">
                        BOR: <span className="text-green-600 dark:text-green-400 ml-0.5">{stats.present} ta</span>
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Davomat qaydlari jadvali */}
      <div id="attendance-records-section" className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Davomat qaydlari
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                Tanlangan sana va qavat bo'yicha ma'lumotlar
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* React Aria uslubidagi zamonaviy DatePicker */}
            <ModernDatePicker 
              selectedDate={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              label="Sana"
            />

            {/* Qavat Filter - Z-index to'g'rilandi */}
            <div className="relative z-[100] flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">
                Qavat
              </label>
              <button
                onClick={() => setShowFloorFilter(!showFloorFilter)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-all duration-300 border shadow-sm h-[44px] ${
                  selectedFloor 
                    ? 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-500/10' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Building className={`h-4 w-4 ${selectedFloor ? 'text-white' : 'text-blue-500'}`} />
                <span className="truncate max-w-[120px]">
                  {selectedFloor ? floorOptions.find((f: any) => f.value === selectedFloor)?.label : 'Barcha qavatlar'}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showFloorFilter ? 'rotate-180' : ''}`} />
              </button>
              
              {showFloorFilter && (
                <>
                  <div className="fixed inset-0 z-[-1]" onClick={() => setShowFloorFilter(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute top-full mt-2 right-0 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-gray-800 overflow-hidden z-[101] p-2"
                  >
                    <button
                      onClick={() => {
                        setSelectedFloor(null);
                        setShowFloorFilter(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-black transition-all mb-1 flex items-center justify-between ${
                        !selectedFloor 
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span>Barcha qavatlar</span>
                      {!selectedFloor && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-gray-800 my-2 mx-2" />
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      {floorOptions.map((floor: any) => (
                        <button
                          key={floor.value}
                          onClick={() => {
                            setSelectedFloor(floor.value);
                            setShowFloorFilter(false);
                          }}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm font-black transition-all mb-1 flex items-center justify-between ${
                            selectedFloor === floor.value 
                              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <span>{floor.label}</span>
                          {selectedFloor === floor.value && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {isAttendanceLoading ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-bold">Ma&apos;lumotlar yuklanmoqda...</p>
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="text-center py-24">
              <div className="bg-gray-50 dark:bg-gray-900/50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-12">
                <Clock className="h-10 w-10 text-gray-300" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-bold text-lg">
                Bu qavat yoki sana uchun ma'lumot topilmadi
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                Filtrlarni o'zgartirib ko'ring
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/40">
                    <tr>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        #
                      </th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        Talaba
                      </th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        Vaqt
                      </th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        Qavat
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {attendanceRecords.map((record: any, index: number) => (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-gray-50/80 dark:hover:bg-gray-900/30 transition-colors"
                      >
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-black text-gray-400">
                          {index + 1}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 flex items-center justify-center mr-3.5 border border-blue-100/50 dark:border-blue-800/50 shadow-sm">
                              <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                                {record.student_name?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-gray-900 dark:text-white">
                                {record.student_name} {record.student_last_name}
                              </span>
                              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                ID: {record.student}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                            record.status === 'in' 
                              ? 'bg-green-100/80 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200/50 dark:border-green-800/50' 
                              : 'bg-red-100/80 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200/50 dark:border-red-800/50'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${record.status === 'in' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                            {record.status === 'in' ? 'Bor' : 'Yo\'q'}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-gray-700 dark:text-gray-300">
                              {new Date(record.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400">
                              {new Date(record.created_at).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-[11px] font-black uppercase tracking-wider border border-gray-200/50 dark:border-gray-700/50">
                            <Building className="h-3 w-3" />
                            {record.floor_name || 'Noma\'lum'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-800/50">
                {attendanceRecords.map((record: any, index: number) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-5 active:bg-gray-50 dark:active:bg-gray-900/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3.5">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 flex items-center justify-center border border-blue-100 dark:border-blue-800 shadow-sm">
                          <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                            {record.student_name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">
                            {record.student_name} {record.student_last_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                              ID: {record.student}
                            </span>
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                              <Building className="h-2.5 w-2.5" />
                              {record.floor_name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        record.status === 'in' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${record.status === 'in' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {record.status === 'in' ? 'Bor' : 'Yo\'q'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50/80 dark:bg-gray-900/60 p-3 rounded-xl border border-gray-100/50 dark:border-gray-800/50">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-[11px] font-black text-gray-700 dark:text-gray-300">
                          {new Date(record.created_at).toLocaleString('uz-UZ', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
                        T/R #{index + 1}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
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

      {/* Floor Leaders View Modal */}
      {showLeadersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLeadersModal(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <UserCog className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Qavat sardorlari
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Barcha qavat sardorlarining ro&apos;yxati
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLeadersModal(false)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-4 sm:p-6">
              {floorLeaders.length === 0 ? (
                <div className="text-center py-12">
                  <UserCog className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                    Hozircha qavat sardorlari tayinlanmagan
                  </p>
                  <button
                    onClick={() => {
                      setShowLeadersModal(false);
                      setShowAddLeaderModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <UserPlus className="h-5 w-5" />
                    Yangi sardor qo&apos;shish
                  </button>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-l-lg">
                            ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              Qavat
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              Username
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              Email
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-r-lg">
                            Holat
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {floorLeaders.map((leader, index) => (
                          <motion.tr
                            key={leader.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                          >
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              #{leader.id}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium">
                                <Building className="h-3.5 w-3.5" />
                                {leader.floor_info?.name || `${leader.floor}-qavat`}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                    {leader.user_info?.username?.charAt(0).toUpperCase() || '?'}
                                  </span>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {leader.user_info?.username || 'Noma\'lum'}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {leader.user_info?.email || '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                Faol
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="sm:hidden space-y-3">
                    {floorLeaders.map((leader, index) => (
                      <motion.div
                        key={leader.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <span className="text-base font-medium text-green-600 dark:text-green-400">
                                {leader.user_info?.username?.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {leader.user_info?.username || 'Noma\'lum'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                #{leader.id}
                              </p>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium">
                            <Building className="h-3.5 w-3.5" />
                            {leader.floor_info?.name || `${leader.floor}-qavat`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Mail className="h-3 w-3" />
                            {leader.user_info?.email || '-'}
                          </div>
                          <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-400 font-medium">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            Faol
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Jami: <span className="font-semibold text-gray-900 dark:text-white">{floorLeaders.length}</span> ta sardor
              </p>
              <button
                onClick={() => setShowLeadersModal(false)}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-colors"
              >
                Yopish
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
