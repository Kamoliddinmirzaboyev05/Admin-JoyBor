import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import BackButton from '../components/UI/BackButton';
import { get, post } from '../data/api';
// import { toast } from 'sonner';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const CARD_HEIGHT = 'h-44';

function getShortName(fullName: string) {
  const [first, ...rest] = fullName.split(' ');
  const last = rest.length > 0 ? rest[rest.length - 1] : '';
  return `${first[0]}. ${last}`;
}

interface Floor {
  id: number;
  name: string;
  gender: 'male' | 'female';
}

interface Student {
  id: number;
  name: string;
  last_name: string;
  fullName?: string;
}

interface Room {
  id: number;
  name: string;
  capacity: number;
  room_type: string;
  students: Student[];
}

const FloorDetail: React.FC = () => {
  const { floorId } = useParams();
  const [floor, setFloor] = useState<Floor | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [newRoom, setNewRoom] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const floors: Floor[] = await get('/floors/');
        const found = floors.find(f => String(f.id) === String(floorId));
        if (!found) {
          setError('Qavat topilmadi.');
          setLoading(false);
          return;
        }
        setFloor(found);
        const roomsRes: Room[] = await get(`/rooms/?floor=${found.id}`);
        setRooms(roomsRes);
      } catch {
        setError('Maʼlumotlarni yuklashda xatolik.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [floorId]);

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.trim() || !floor) return;
    setAdding(true);
    try {
      await post('/rooms/', {
        name: newRoom.trim(),
        floor: floor.id,
        capacity: 0,
        room_type: '',
        gender: floor.gender,
        status: 'EMPTY',
      });
      // toast.success('Xona muvaffaqiyatli qo\'shildi!');
      setShowRoomModal(false);
      setNewRoom('');
      // Refresh rooms
      const roomsRes: Room[] = await get(`/rooms/?floor=${floor.id}`);
      setRooms(roomsRes);
    } catch {
      // toast.error('Xona qo\'shishda xatolik!');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        {error} <BackButton label="Orqaga qaytish" className="mx-auto mt-4" />
      </div>
    );
  }
  if (!floor) return null;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <BackButton className="w-max" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{floor.name}-qavat xonalari</h2>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${floor.gender === 'female' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'}`}>{floor.gender === 'female' ? 'Qizlar' : 'Yigitlar'}</span>
        <button
          className="ml-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors"
          onClick={() => setShowRoomModal(true)}
        >
          + Xona qo'shish
        </button>
      </div>
      {/* Add Room Modal */}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Xona nomi yoki raqami</label>
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
                    disabled={adding}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-60"
                  >
                    {adding ? 'Qo\'shilmoqda...' : 'Qo\'shish'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* End Add Room Modal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {rooms.length === 0 ? (
          <span className="text-gray-400 dark:text-slate-500 col-span-full">Xona yo'q</span>
        ) : (
          rooms.map(room => {
            const students = room.students || [];
            return (
              <div
                key={room.id}
                className={`flex flex-col justify-between px-5 py-4 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white font-medium border border-gray-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-600 hover:border-blue-400 dark:hover:border-blue-600 focus:ring-2 focus:ring-blue-400 transition-colors shadow-sm cursor-pointer ${CARD_HEIGHT}`}
              >
                <div>
                  <div className="font-bold text-lg mb-2">{room.name}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {students.length === 0 ? (
                      <span className="text-gray-400 dark:text-slate-400 col-span-2">Talaba yo'q</span>
                    ) : (
                      [0, 1].map(col => (
                        <div key={col} className="flex flex-col gap-1">
                          {students.slice(col * 3, col * 3 + 3).map(student => (
                            <Link
                              key={student.id}
                              to={`/profile/${student.id}`}
                              className="text-sm whitespace-nowrap text-blue-600 hover:underline dark:text-blue-400"
                            >
                              {getShortName(student.name + ' ' + student.last_name)}
                            </Link>
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-400 dark:text-slate-400 mt-2">{students.length} ta talaba</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FloorDetail; 