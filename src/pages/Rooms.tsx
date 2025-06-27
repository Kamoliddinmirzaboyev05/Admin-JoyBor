import React, { useState } from 'react';
import { MoreVertical, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoManSharp, IoWomanSharp } from 'react-icons/io5';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Mock data for floors and rooms
const initialFloors = [
  {
    floor: '1',
    gender: 'Yigitlar',
    rooms: [
      '101-xona', '102-xona', '103-xona', '104-xona', '105-xona', '106-xona', '107-xona', '108-xona', '109-xona', '110-xona',
      '111-xona', '112-xona', '113-xona', '114-xona', '115-xona', '116-xona', '117-xona', '118-xona', '119-xona', '120-xona',
      '121-xona',
    ],
  },
  {
    floor: '2',
    gender: 'Qizlar',
    rooms: ['201-xona', '202-xona', '203-xona', '204-xona'],
  },
  {
    floor: '3',
    gender: 'Yigitlar',
    rooms: [],
  },
];

const genderOptions = [
  { value: 'Yigitlar', label: 'Yigitlar uchun', icon: <IoManSharp className="w-6 h-6" /> },
  { value: 'Qizlar', label: 'Qizlar uchun', icon: <IoWomanSharp className="w-6 h-6" /> },
];

const isDark = () => document.documentElement.classList.contains('dark');

const Rooms: React.FC = () => {
  const [floors, setFloors] = useState(initialFloors);
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [newFloor, setNewFloor] = useState('');
  const [newFloorGender, setNewFloorGender] = useState('Yigitlar');
  const [newRoom, setNewRoom] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editFloor, setEditFloor] = useState<any>(null);
  const navigate = useNavigate();

  // Add new floor
  const handleAddFloor = (e: React.FormEvent) => {
    e.preventDefault();
    const floorStr = newFloor.trim();
    if (!floorStr) return;
    if (editFloor) {
      setFloors(floors => floors.map(f =>
        f.floor === editFloor.floor
          ? { ...f, floor: floorStr, gender: newFloorGender }
          : f
      ).sort((a, b) => Number(a.floor) - Number(b.floor)));
      setEditFloor(null);
      toast.success('Qavat muvaffaqiyatli tahrirlandi!');
      setShowFloorModal(false);
      setNewFloor('');
      setNewFloorGender('Yigitlar');
    } else {
      if (floors.some(f => f.floor === floorStr)) {
        toast.error('Bunday qavat allaqachon mavjud!');
        return;
      }
      setFloors(prev => [
        ...prev,
        { floor: floorStr, gender: newFloorGender, rooms: [] },
      ].sort((a, b) => Number(a.floor) - Number(b.floor)));
      toast.success('Qavat muvaffaqiyatli qo‘shildi!');
      setShowFloorModal(false);
      setNewFloor('');
      setNewFloorGender('Yigitlar');
    }
  };

  // Add new room
  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const roomStr = newRoom.trim();
    if (!selectedFloor || !roomStr) return;
    // Dublikat xona raqami tekshiruvi
    const floorObj = floors.find(f => f.floor === selectedFloor);
    if (floorObj && floorObj.rooms.includes(roomStr)) {
      toast.error('Bu xona allaqachon mavjud!');
      return;
    }
    setFloors(floors => floors.map(f =>
      f.floor === selectedFloor
        ? { ...f, rooms: [...f.rooms, roomStr] }
        : f
    ));
    setNewRoom('');
    setSelectedFloor('');
    setShowRoomModal(false);
    toast.success('Xona muvaffaqiyatli qo‘shildi!');
  };

  // Edit floor handler
  const handleEditFloor = (floor: any) => {
    setEditFloor(floor);
    setNewFloor(floor.floor);
    setNewFloorGender(floor.gender);
    setShowFloorModal(true);
    setMenuOpen(null);
  };

  // Delete floor handler
  const handleDeleteFloor = (floor: any) => {
    setFloors(floors => floors.filter(f => f.floor !== floor.floor));
    setMenuOpen(null);
    toast.success('Qavat o‘chirildi!');
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
          {floors.map((floor) => (
            <div
              key={floor.floor}
              className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700 relative group cursor-pointer hover:shadow-lg transition-all"
              onClick={e => {
                // Prevent navigation if menu or action button is clicked
                if ((e.target as HTMLElement).closest('.floor-actions')) return;
                navigate(`/rooms/${floor.floor}`);
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{floor.floor}-qavat</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${floor.gender === 'Qizlar' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'}`}>{floor.gender}</span>
                </div>
                <div className="relative floor-actions">
                  <button
                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 dark:text-slate-400 transition-colors"
                    onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === floor.floor ? null : floor.floor); }}
                  >
                    <MoreVertical size={20} />
                  </button>
                  {menuOpen === floor.floor && (
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
                        🗑️ O‘chirish
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                {floor.rooms.length === 0 ? (
                  <span className="text-gray-400 dark:text-slate-500">Xona yo'q</span>
                ) : (
                  floor.rooms.map((room) => (
                    <button
                      key={room}
                      className="px-5 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white font-medium border border-gray-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-600 hover:border-blue-400 dark:hover:border-blue-600 focus:ring-2 focus:ring-blue-400 transition-colors shadow-sm"
                    >
                      {room}
                    </button>
                  ))
                )}
              </div>
            </div>
          ))}
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
                    {genderOptions.map(opt => (
                      <label
                        key={opt.value}
                        className={`group flex flex-col items-center justify-center cursor-pointer px-4 py-3 rounded-xl border-2 transition-all duration-200 select-none
                          ${newFloorGender === opt.value
                            ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-slate-900 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-400'}
                          hover:shadow-md
                        `}
                        style={{ minWidth: 120 }}
                      >
                        <input
                          type="radio"
                          name="floor-gender"
                          checked={newFloorGender === opt.value}
                          onChange={() => setNewFloorGender(opt.value)}
                          className="sr-only"
                        />
                        <span className={`flex items-center justify-center w-10 h-10 rounded-full mb-2
                          ${newFloorGender === opt.value
                            ? 'bg-blue-600 text-white shadow'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}
                          transition-all duration-200
                        `}>
                          {opt.icon}
                        </span>
                        <span className={`text-sm font-semibold
                          ${newFloorGender === opt.value
                            ? 'text-blue-700 dark:text-blue-200'
                            : 'text-gray-700 dark:text-gray-200'}
                          transition-colors
                        `}>
                          {opt.label}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Qavatni tanlang</label>
                  <select
                    value={selectedFloor}
                    onChange={e => setSelectedFloor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Tanlang...</option>
                    {floors.map(f => (
                      <option key={f.floor} value={f.floor}>{f.floor}-qavat</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Xona raqami</label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={e => setNewRoom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"
                  >
                    Qo'shish
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