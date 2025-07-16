import React, { useEffect, useState } from 'react';
import { MoreVertical, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoManSharp, IoWomanSharp } from 'react-icons/io5';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { get, post } from '../data/api';
// import NProgress from 'nprogress';
import { useQuery } from '@tanstack/react-query';
import { apiQueries } from '../data/api';
import FloorRooms from '../components/UI/FloorRooms';

interface Floor {
  id: number;
  name: string;
  gender: 'male' | 'female';
}

interface Student {
  id: number;
  name: string;
  last_name: string;
}

interface Room {
  id: number;
  name: string;
  floor: Floor;
  capacity: number;
  currentOccupancy: number;
  room_type: string;
  gender: 'male' | 'female';
  status: string;
  students: Student[];
}

const statusColors: Record<string, string> = {
  EMPTY: 'bg-gray-200 text-gray-700',
  OCCUPIED: 'bg-blue-600 text-white',
  PARTIALLY_OCCUPIED: 'bg-blue-200 text-blue-800',
};

const genderLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  male: { label: 'Yigitlar', icon: <IoManSharp className="inline w-5 h-5 mr-1" /> },
  female: { label: 'Qizlar', icon: <IoWomanSharp className="inline w-5 h-5 mr-1" /> },
};

// Add Uzbek status labels
const statusLabels: Record<string, string> = {
  OCCUPIED: "To'lgan",
  PARTIALLY_OCCUPIED: "To'lmagan",
  EMPTY: "Bo'sh",
};

// Custom hook for rooms by floor
function useRoomsByFloor(floorId: number) {
  return useQuery({
    queryKey: ['rooms', floorId],
    queryFn: async () => {
      const res = await get(`/rooms/?floor=${floorId}`);
      return (res || []).map((room: Record<string, unknown>) => {
        const students = room.students || [];
        const capacity = room.capacity || 0;
        const currentOccupancy = students.length;
        let status = 'EMPTY';
        if (currentOccupancy === 0) status = 'EMPTY';
        else if (currentOccupancy === capacity && capacity > 0) status = 'OCCUPIED';
        else status = 'PARTIALLY_OCCUPIED';
        return {
          ...room,
          students,
          capacity,
          currentOccupancy,
          status,
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });
}

const Rooms: React.FC = () => {
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [newFloor, setNewFloor] = useState('');
  const [newFloorGender, setNewFloorGender] = useState<'male' | 'female'>('male');
  const [newRoom, setNewRoom] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState('');
  const [addingRoom, setAddingRoom] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [addingFloor, setAddingFloor] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { 
    data: floors = [], 
    isLoading: floorsLoading, 
    error: floorsError,
    refetch: refetchFloors 
  } = useQuery({
    queryKey: ['floors'],
    queryFn: apiQueries.getFloors,
    staleTime: 1000 * 60 * 5, // 5 daqiqa cache
  });

  // Helper: check if all rooms for all floors are loaded
  const typedFloors: Floor[] = Array.isArray(floors) ? floors as Floor[] : [];
  // No need for allRoomsLoaded, rely on react-query loading states per floor

  useEffect(() => {
    if (location.state && (location.state as any).openAddRoomModal) {
      setShowRoomModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Now, after all hooks, handle early returns:
  if (floorsLoading || typedFloors.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin w-16 h-16 text-blue-500" />
      </div>
    );
  }
  if (floorsError) {
    return (
      <div className="text-center py-10 text-red-600 dark:text-red-400">
        Ma'lumotlarni yuklashda xatolik yuz berdi. 
        <button 
          onClick={() => refetchFloors()} 
          className="ml-2 text-blue-600 hover:underline"
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  // Add new floor
  const handleAddFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    const floorStr = newFloor.trim();
    if (!floorStr) return;
    setAddingFloor(true);
    try {
      await post('/floor/create/', { name: floorStr, gender: newFloorGender });
      toast.success('Qavat muvaffaqiyatli qo\'shildi!');
      // Refresh floors from API
      refetchFloors();
      setShowFloorModal(false);
      setNewFloor('');
      setNewFloorGender('male');
    } catch {
      toast.error('Qavat qo\'shishda xatolik!');
    } finally {
      setAddingFloor(false);
    }
  };

  // Add new room
  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const roomStr = newRoom.trim();
    const capacity = parseInt(newRoomCapacity);
    if (!selectedFloor || !roomStr || isNaN(capacity) || capacity <= 0) {
      toast.error('Barcha maydonlarni to\'g\'ri to\'ldiring!');
      return;
    }
    setAddingRoom(true);
    try {
      const floorObj = typedFloors.find(f => f.name === selectedFloor);
      if (!floorObj) {
        toast.error('Qavat topilmadi!');
        return;
      }
      await post('/room/create/', {
        name: roomStr,
        floor: floorObj.id,
        capacity: capacity,
        room_type: '3-Kishilik',
      });
      toast.success('Xona muvaffaqiyatli qo\'shildi!');
      setNewRoom('');
      setSelectedFloor('');
      setNewRoomCapacity('');
      setShowRoomModal(false);
      // Refresh rooms for the selected floor
      const res = await get(`/rooms/?floor=${floorObj.id}`);
      const rooms = (res || []).map((room: Record<string, unknown>) => {
        const students = room.students || [];
        const roomCapacity = room.capacity || 0;
        const currentOccupancy = students.length;
        let status = 'EMPTY';
        if (currentOccupancy === 0) status = 'EMPTY';
        else if (currentOccupancy === roomCapacity && roomCapacity > 0) status = 'OCCUPIED';
        else status = 'PARTIALLY_OCCUPIED';
        return {
          ...room,
          students,
          capacity: roomCapacity,
          currentOccupancy,
          status,
        };
      });
      // setRoomsByFloor(prev => ({ ...prev, [floorObj.id]: rooms })); // This line is removed
    } catch {
      toast.error('Xona qo\'shishda xatolik!');
    } finally {
      setAddingRoom(false);
    }
  };

  // Edit floor handler
  const handleEditFloor = (floor: Floor) => {
    // setEditFloor(floor); // Tozalandi
    setNewFloor(floor.name);
    setNewFloorGender(floor.gender);
    setShowFloorModal(true);
    setMenuOpen(null);
  };

  // Delete floor handler
  const handleDeleteFloor = (floor: Floor) => {
    // setRoomsByFloor(rooms => ({ // This line is removed
    //   ...rooms,
    //   [floor.id]: [],
    // }));
    setMenuOpen(null);
    toast.success("Qavat o'chirildi!");
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Yotoqxona</h1>
          <div className="flex gap-2">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors"
              onClick={() => setShowFloorModal(true)}
            >
              + Qavat qo'shish
            </button>
            <button
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors"
              onClick={() => setShowRoomModal(true)}
            >
              + Xona qo'shish
            </button>
          </div>
        </div>
        <div className="space-y-6">
          {floorsLoading ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-16">Yuklanmoqda...</div>
          ) : floorsError ? (
            <div className="text-center text-red-500 py-16">{floorsError.toString()}</div>
          ) : (
            typedFloors.map((floor, idx) => (
              <FloorRooms
                key={floor.id}
                floor={floor}
                genderLabels={genderLabels}
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
                handleEditFloor={handleEditFloor}
                handleDeleteFloor={handleDeleteFloor}
                navigate={navigate}
              />
            ))
          )}
        </div>
      </div>

      {/* Qavat qo'shish modal */}
      <AnimatePresence>
        {showFloorModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFloorModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded transition-colors"
                onClick={() => setShowFloorModal(false)}
              >
                <X size={22} />
              </button>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Yangi qavat qo'shish</h2>
              <form onSubmit={handleAddFloor} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Qavat nomi yoki raqami</label>
                  <input
                    type="text"
                    value={newFloor}
                    onChange={e => setNewFloor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Qavat jinsi</label>
                  <div className="flex gap-4">
                    {(['male', 'female'] as const).map(g => (
                      <label
                        key={g}
                        className={`group flex flex-col items-center justify-center cursor-pointer px-4 py-3 rounded-xl border-2 transition-all duration-200 select-none
                          ${newFloorGender === g
                            ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-slate-900 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-400'}
                        `}
                      >
                        <input
                          type="radio"
                          name="floor-gender"
                          checked={newFloorGender === g}
                          onChange={() => setNewFloorGender(g)}
                          className="sr-only"
                        />
                        <span className={`flex items-center justify-center w-10 h-10 rounded-full mb-2
                          ${newFloorGender === g
                            ? 'bg-blue-600 text-white shadow'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}
                          transition-all duration-200
                        `}>
                          {genderLabels[g]?.icon}
                        </span>
                        <span className={`text-sm font-semibold
                          ${newFloorGender === g
                            ? 'text-blue-700 dark:text-blue-200'
                            : 'text-gray-700 dark:text-gray-200'}
                          transition-colors
                        `}>
                          {genderLabels[g]?.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFloorModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={addingFloor}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-60"
                  >
                    {addingFloor ? 'Qo\'shilmoqda...' : 'Qo\'shish'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Xona qo'shish modal */}
      <AnimatePresence>
        {showRoomModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowRoomModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded transition-colors"
                onClick={() => setShowRoomModal(false)}
              >
                <X size={22} />
              </button>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Yangi xona qo'shish</h2>
              <form onSubmit={handleAddRoom} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Qavat tanlang</label>
                  <select
                    value={selectedFloor}
                    onChange={e => setSelectedFloor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Qavat tanlang</option>
                    {typedFloors.map(floor => (
                      <option key={floor.id} value={floor.name}>
                        {floor.name}-qavat ({floor.gender === 'female' ? 'Qizlar' : 'Yigitlar'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Xona nomi yoki raqami</label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={e => setNewRoom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masalan: 101, 102, A1..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Xona sigimi</label>
                  <input
                    type="number"
                    value={newRoomCapacity}
                    onChange={e => setNewRoomCapacity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masalan: 3, 5, 8..."
                    min="1"
                    max="20"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRoomModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={addingRoom}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-60"
                  >
                    {addingRoom ? 'Qo\'shilmoqda...' : 'Qo\'shish'}
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

export default Rooms;