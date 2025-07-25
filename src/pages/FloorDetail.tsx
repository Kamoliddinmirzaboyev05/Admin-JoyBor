import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import BackButton from '../components/UI/BackButton';
import { get, post } from '../data/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import { MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { link } from '../data/config';

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
  const queryClient = useQueryClient();
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [newRoom, setNewRoom] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState('');
  const [adding, setAdding] = useState(false);
  // Add state for room actions
  // Replace global roomActionRoom/showRoomActionModal with a state for openRoomMenuId
  const [openRoomMenuId, setOpenRoomMenuId] = useState<number | null>(null);
  const [editRoomModal, setEditRoomModal] = useState<Room | null>(null);
  const [editRoomName, setEditRoomName] = useState('');
  const [editRoomCapacity, setEditRoomCapacity] = useState('');
  const [editingRoom, setEditingRoom] = useState(false);
  const [deleteRoomModal, setDeleteRoomModal] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState(false);

  // React Query bilan floors va rooms ma'lumotlarini olish
  const {
    data: floors = [],
    isLoading: floorsLoading,
    error: floorsError,
    refetch: refetchFloors
  } = useQuery({
    queryKey: ['floors'],
    queryFn: () => get('/floors/'),
    staleTime: 1000 * 60 * 5,
  });

  const floor = floors.find((f: Floor) => String(f.id) === String(floorId)) as Floor | undefined;

  const {
    data: rooms = [],
    isLoading: roomsLoading,
    error: roomsError,
    refetch: refetchRooms
  } = useQuery({
    queryKey: ['rooms', floor?.id],
    queryFn: () => floor ? get(`/rooms/?floor=${floor.id}`) : Promise.resolve([]),
    enabled: !!floor,
    staleTime: 1000 * 60 * 5,
  });

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.trim() || !newRoomCapacity.trim() || !floor) return;
    setAdding(true);
    
    try {
      const token = localStorage.getItem('access');
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);
      myHeaders.append("Content-Type", "application/json");

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
          name: newRoom.trim(),
          floor: floor.id,
          capacity: Number(newRoomCapacity),
          room_type: '',
          gender: floor.gender,
          status: 'EMPTY',
        }),
      };

      // Try /room/create/ first, if it fails, try /rooms/
      let response = await fetch(`${link}/room/create/`, requestOptions);
      
      if (response.status === 405 || response.status === 404) {
        // Try alternative endpoint
        response = await fetch(`${link}/rooms/`, requestOptions);
      }
      
      if (response.ok) {
        setShowRoomModal(false);
        setNewRoom('');
        setNewRoomCapacity('');
        toast.success('Xona muvaffaqiyatli qo\'shildi!');
        
        // Cache ni yangilash - barcha bog'liq ma'lumotlarni yangilash
        queryClient.invalidateQueries({ queryKey: ['floors'] });
        queryClient.invalidateQueries({ queryKey: ['floor', floorId] });
        queryClient.invalidateQueries({ queryKey: ['rooms'] });
        queryClient.invalidateQueries({ queryKey: ['students'] });
        
        // Har bir qavat uchun xonalarni yangilash
        queryClient.invalidateQueries({ queryKey: ['rooms', parseInt(floorId || '0')] });
        
        // Global cache ni tozalash
        queryClient.refetchQueries({ queryKey: ['rooms'] });
        
        // Refresh rooms
        refetchRooms();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || errorData.message || 'Xona qo\'shishda xatolik!');
      }
    } catch (error) {
      console.error('Room creation error:', error);
      toast.error('Xona qo\'shishda xatolik!');
    } finally {
      setAdding(false);
    }
  };

  if (floorsLoading || roomsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }
  if (floorsError || roomsError) {
    return (
      <div className="p-8 text-center text-red-500">
        Ma'lumotlarni yuklashda xatolik. <BackButton label="Orqaga qaytish" className="mx-auto mt-4" />
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
          onClick={() => {
            setShowRoomModal(true);
            setNewRoom('');
            setNewRoomCapacity('');
          }}
        >
          + Xona qo'shish
        </button>
      </div>
      {/* Add Room Modal */}
      <AnimatePresence>
        {showRoomModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowRoomModal(false);
              setNewRoom('');
              setNewRoomCapacity('');
            }}
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
                onClick={() => {
                  setShowRoomModal(false);
                  setNewRoom('');
                  setNewRoomCapacity('');
                }}
              >
                <X size={22} />
              </button>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Yangi xona qo'shish</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Qavat: <span className="font-semibold text-blue-600 dark:text-blue-400">{floor.name}</span>
              </p>
              <form onSubmit={handleAddRoom} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Xona nomi yoki raqami</label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={e => setNewRoom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masalan: 101, A-12, yoki Xona 1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Xona sig'imi</label>
                  <input
                    type="number"
                    value={newRoomCapacity}
                    onChange={e => setNewRoomCapacity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Necha kishi sig'adi?"
                    min="1"
                    max="20"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoomModal(false);
                      setNewRoom('');
                      setNewRoomCapacity('');
                    }}
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
      {/* Edit room modal */}
      <AnimatePresence>
        {editRoomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setEditRoomModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Xonani tahrirlash</h2>
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  if (!editRoomModal) return;
                  setEditingRoom(true);
                  try {
                    const token = localStorage.getItem('access');
                    await axios.patch(
                      `${link}/rooms/${editRoomModal.id}/`,
                      { name: editRoomName, capacity: Number(editRoomCapacity) },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    toast.success('Xona tahrirlandi!');
                    setEditRoomModal(null);
                    refetchRooms();
                  } catch {
                    toast.error('Xonani tahrirlashda xatolik!');
                  } finally {
                    setEditingRoom(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Xona nomi yoki raqami</label>
                  <input
                    type="text"
                    value={editRoomName}
                    onChange={e => setEditRoomName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Xona sig'imi</label>
                  <input
                    type="number"
                    value={editRoomCapacity}
                    onChange={e => setEditRoomCapacity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="20"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditRoomModal(null)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    disabled={editingRoom}
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={editingRoom}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-60"
                  >
                    {editingRoom ? "Saqlanmoqda..." : "Saqlash"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Delete room modal */}
      <AnimatePresence>
        {deleteRoomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDeleteRoomModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Xonani o'chirish</h2>
              <p className="mb-6 text-gray-700 dark:text-gray-300">Rostdan ham ushbu xonani o'chirmoqchimisiz?</p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteRoomModal(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  disabled={deletingRoom}
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!deleteRoomModal) return;
                    setDeletingRoom(true);
                    try {
                      const token = localStorage.getItem('access');
                      await axios.delete(
                        `${link}/rooms/${deleteRoomModal.id}/`,
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      toast.success('Xona o\'chirildi!');
                      setDeleteRoomModal(null);
                      refetchRooms();
                    } catch {
                      toast.error('Xonani o\'chirishda xatolik!');
                    } finally {
                      setDeletingRoom(false);
                    }
                  }}
                  disabled={deletingRoom}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-60"
                >
                  {deletingRoom ? "O'chirilmoqda..." : "O'chirish"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {rooms.length === 0 ? (
          <span className="text-gray-400 dark:text-slate-500 col-span-full">Xona yo'q</span>
        ) : (
          rooms.map((room: Room) => {
            const students = room.students || [];
            return (
              <div
                key={room.id}
                className={`flex flex-col justify-between px-5 py-4 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white font-medium border border-gray-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-600 hover:border-blue-400 dark:hover:border-blue-600 focus:ring-2 focus:ring-blue-400 transition-colors shadow-sm cursor-pointer ${CARD_HEIGHT} relative`}
              >
                {/* Three dots button */}
                <div className="absolute top-2 right-2 z-20">
                  <button
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300"
                    onClick={e => { e.stopPropagation(); setOpenRoomMenuId(room.id === openRoomMenuId ? null : room.id); }}
                    title="Ko'proq"
                  >
                    <MoreVertical size={20} />
                  </button>
                  {/* Inline dropdown menu for this room only */}
                  <AnimatePresence>
                    {openRoomMenuId === room.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg z-30"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-800 rounded-t-xl transition-colors"
                          onClick={() => {
                            setEditRoomModal(room);
                            setEditRoomName(room.name);
                            setEditRoomCapacity(room.capacity.toString());
                            setOpenRoomMenuId(null);
                          }}
                        >
                          ✏️ Tahrirlash
                        </button>
                        <button
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-b-xl transition-colors"
                          onClick={() => {
                            setDeleteRoomModal(room);
                            setOpenRoomMenuId(null);
                          }}
                        >
                          🗑️ O'chirish
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
                              to={`/studentprofile/${student.id}`}
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