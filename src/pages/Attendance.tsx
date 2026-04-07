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

  // Fetch attendance records
  const { data: attendanceRecordsData } = useQuery({
    queryKey: ['attendance-records'],
    queryFn: () => api.getAttendanceRecords()
  });

  const attendanceRecords = attendanceRecordsData?.results || attendanceRecordsData || [];

  useEffect(() => {
    if (leadersData) {
      setFloorLeaders(leadersData.results || leadersData);
    }
  }, [leadersData]);

  // Calculate statistics from attendance records
  const totalStudents = students.length;
  const totalPresent = attendanceRecords.filter((r: any) => r.status === 'in').length;
  const totalAbsent = totalStudents - totalPresent;
  const attendanceRate = totalStudents > 0 ? ((totalPresent / totalStudents) * 100).toFixed(1) : '0';

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
          {/* Chiroyli Filter */}
          <div className="relative">
            <button
              onClick={() => setShowFloorFilter(!showFloorFilter)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                selectedFloor 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-300 dark:border-blue-700' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Building className="h-4 w-4" />
              <span>{selectedFloor ? floorOptions.find((f: { value: number; label: string }) => f.value === selectedFloor)?.label : 'Barcha qavatlar'}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFloorFilter ? 'rotate-180' : ''}`} />
            </button>
            
            {showFloorFilter && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20">
                <div className="p-2">
                  <button
                    onClick={() => {
                      setSelectedFloor(null);
                      setShowFloorFilter(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !selectedFloor 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    Barcha qavatlar
                  </button>
                  {floorOptions.map((floor: { value: number; label: string }) => (
                    <button
                      key={floor.value}
                      onClick={() => {
                        setSelectedFloor(floor.value);
                        setShowFloorFilter(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedFloor === floor.value 
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {floor.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowLeadersModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
          >
            <UserCog className="h-4 w-4" />
            Sardorlarni ko&apos;rish
          </button>

          <button
            onClick={() => setShowAddLeaderModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
          >
            <UserPlus className="h-4 w-4" />
            Yangi sardor
          </button>
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

      {/* Davomat qaydlari jadvali */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Davomat qaydlari
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Talabalarning kirish-chiqish vaqtlari
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{new Date().toLocaleDateString('uz-UZ')}</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {attendanceRecords.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                Hozircha davomat qaydlari mavjud emas
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Talaba
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <ArrowRightLeft className="h-3 w-3" />
                      Status
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Vaqt
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sessiya
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {attendanceRecords.map((record: any, index: number) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      #{record.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {record.student_name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {record.student_name || 'Noma\'lum'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        record.status === 'in' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {record.status === 'in' ? (
                          <>
                            <ArrowRightLeft className="h-3 w-3" />
                            Kirish
                          </>
                        ) : (
                          <>
                            <ArrowRightLeft className="h-3 w-3" />
                            Chiqish
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(record.created_at).toLocaleString('uz-UZ', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      #{record.session}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
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
            <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6">
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
                <div className="overflow-x-auto">
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
