import React, { useEffect, useState } from 'react';
import { MoreVertical, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoManSharp, IoWomanSharp } from 'react-icons/io5';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { get, post, put, del } from '../data/api';

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

const Rooms: React.FC = () => {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [roomsByFloor, setRoomsByFloor] = useState<Record<number, Room[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [newFloor, setNewFloor] = useState('');
  const [newFloorGender, setNewFloorGender] = useState<'male' | 'female'>('male');
  const [newRoom, setNewRoom] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editFloor, setEditFloor] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Qavatlarni olish
        const floorsRes = await get('/floors/');
        let floorsData: Floor[] = floorsRes;
        // 2. Qavatlarni raqam bo'yicha sort qilish
        floorsData = floorsData.sort((a, b) => {
          const aNum = parseInt(a.name);
          const bNum = parseInt(b.name);
          return (isNaN(aNum) || isNaN(bNum)) ? a.name.localeCompare(b.name) : aNum - bNum;
        });
        setFloors(floorsData);
        // 3. Har bir qavat uchun xonalarni olish
        const roomsObj: Record<number, Room[]> = {};
        await Promise.all(
          floorsData.map(async (floor) => {
            const res = await get(`/rooms/?floor=${floor.id}`);
            roomsObj[floor.id] = res;
          })
        );
        setRoomsByFloor(roomsObj);
      } catch (err: any) {
        setError('Maʼlumotlarni yuklashda xatolik.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Add new floor
  const handleAddFloor = (e: React.FormEvent) => {
    e.preventDefault();
    const floorStr = newFloor.trim();
    if (!floorStr) return;
    if (editFloor) {
      setFloors(floors => floors.map(f =>
        f.id === editFloor.id
          ? { ...f, name: floorStr, gender: newFloorGender }
          : f
      ).sort((a, b) => Number(a.id) - Number(b.id)));
      setEditFloor(null);
      toast.success('Qavat muvaffaqiyatli tahrirlandi!');
      setShowFloorModal(false);
      setNewFloor('');
      setNewFloorGender('male');
    } else {
      if (floors.some(f => f.name === floorStr)) {
        toast.error('Bunday qavat allaqachon mavjud!');
        return;
      }
      setFloors(prev => [
        ...prev,
        { id: prev.length + 1, name: floorStr, gender: newFloorGender },
      ].sort((a, b) => Number(a.id) - Number(b.id)));
      toast.success('Qavat muvaffaqiyatli qo\'shildi!');
      setShowFloorModal(false);
      setNewFloor('');
      setNewFloorGender('male');
    }
  };

  // Add new room
  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const roomStr = newRoom.trim();
    if (!selectedFloor || !roomStr) return;
    // Dublikat xona raqami tekshiruvi
    const floorObj = floors.find(f => f.name === selectedFloor);
    if (!floorObj) return;
    if (roomsByFloor[floorObj.id] && roomsByFloor[floorObj.id].some(r => r.name === roomStr)) {
      toast.error('Bu xona allaqachon mavjud!');
      return;
    }
    setRoomsByFloor(rooms => ({
      ...rooms,
      [floorObj.id]: [
        ...(roomsByFloor[floorObj.id] || []),
        {
          id: (roomsByFloor[floorObj.id]?.length || 0) + 1,
          name: roomStr,
          floor: floorObj,
          capacity: 0,
          currentOccupancy: 0,
          room_type: '',
          gender: floorObj.gender,
          status: 'EMPTY',
          students: [],
        } as Room,
      ],
    }));
    setNewRoom('');
    setSelectedFloor('');
    setShowRoomModal(false);
    toast.success('Xona muvaffaqiyatli qo\'shildi!');
  };

  // Edit floor handler
  const handleEditFloor = (floor: any) => {
    setEditFloor(floor);
    setNewFloor(floor.name);
    setNewFloorGender(floor.gender);
    setShowFloorModal(true);
    setMenuOpen(null);
  };

  // Delete floor handler
  const handleDeleteFloor = (floor: any) => {
    setFloors(floors => floors.filter(f => f.id !== floor.id));
    setRoomsByFloor(rooms => ({
      ...rooms,
      [floor.id]: [],
    }));
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
          {loading ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-16">Yuklanmoqda...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-16">{error}</div>
          ) : (
            floors.map((floor, idx) => (
              <motion.div
                key={floor.id}
                className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700 relative group cursor-pointer hover:shadow-lg transition-all"
                onClick={e => {
                  // Prevent navigation if menu or action button is clicked
                  if ((e.target as HTMLElement).closest('.floor-actions')) return;
                  navigate(`/rooms/${floor.id}`);
                }}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.07 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{floor.name}-qavat</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${floor.gender === 'female' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'}`}>{genderLabels[floor.gender]?.label}</span>
                  </div>
                  <div className="relative floor-actions">
                    <button
                      className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 dark:text-slate-400 transition-colors"
                      onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === floor.id.toString() ? null : floor.id.toString()); }}
                    >
                      <MoreVertical size={20} />
                    </button>
                    {menuOpen === floor.id.toString() && (
                      <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-30 animate-fade-in">
                        <button
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-t-lg transition-colors"
                          onClick={() => handleEditFloor(floor)}
                        >
                          ✏️ Tahrirlash
                        </button>
                        <button
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-b-lg transition-colors"
                          onClick={() => handleDeleteFloor(floor)}
                        >
                          🗑️ O'chirish
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  {roomsByFloor[floor.id]?.length === 0 ? (
                    <span className="text-gray-400 dark:text-slate-500">Xona yo'q</span>
                  ) : (
                    roomsByFloor[floor.id]?.map((room) => (
                      <div
                        key={room.id}
                        className="px-5 py-3 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-sm min-w-[180px] max-w-xs flex flex-col gap-2 hover:shadow-md transition cursor-pointer"
                        title={room.students.length > 0 ? room.students.map(s => `${s.name} ${s.last_name}`).join(', ') : undefined}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 dark:text-white">{room.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColors[room.status] || 'bg-gray-200 text-gray-700'}`}>{room.status.replace('_', ' ').toLowerCase()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{room.room_type}</span>
                          <span>•</span>
                          <span>{room.currentOccupancy}/{room.capacity} band</span>
                        </div>
                        {room.students.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {room.students.map((s) => (
                              <span key={s.id} className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded px-2 py-0.5 text-xs">
                                {s.name} {s.last_name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
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
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                  >
                    Qo'shish
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Xona qo'shish modal (unchanged) */}
    </div>
  );
};

export default Rooms;