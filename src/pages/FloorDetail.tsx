import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import BackButton from '../components/UI/BackButton';
import { get } from '../data/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, MoreVertical, Filter } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
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

  // Close room menu on outside click or Esc
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openRoomMenuId !== null) {
        const target = e.target as HTMLElement;
        if (!target.closest('.room-menu') && !target.closest('.room-menu-button')) {
          setOpenRoomMenuId(null);
        }
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openRoomMenuId !== null) setOpenRoomMenuId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openRoomMenuId]);

  // Filter states
  const [roomStatusFilter, setRoomStatusFilter] = useState('');

  // React Query bilan floors va rooms ma'lumotlarini olish
  const {
    data: floors = [],
    isLoading: floorsLoading,
    error: floorsError
  } = useQuery({
    queryKey: ['floors'],
    queryFn: () => get('/floors/'),
    staleTime: 1000 * 60 * 5,
  });

  const floor = floors.find((f: Floor) => String(f.id) === String(floorId)) as Floor | undefined;

  const {
    data: roomsData,
    isLoading: roomsLoading,
    error: roomsError,
    refetch: refetchRooms
  } = useQuery({
    queryKey: ['rooms', floor?.id],
    queryFn: async () => {
      if (!floor) return [];
      const response = await get(`/rooms/?floor=${floor.id}`);
      console.log('Rooms API response:', response);
      // API returns paginated data with results array
      if (response && response.results && Array.isArray(response.results)) {
        return response.results;
      }
      // Fallback for non-paginated response
      return Array.isArray(response) ? response : [];
    },
    enabled: !!floor,
    staleTime: 1000 * 60 * 5,
  });

  const rooms = Array.isArray(roomsData) ? roomsData : [];

  const roomStats = React.useMemo(() => {
    const stats = { total: rooms.length, empty: 0, partial: 0, full: 0 } as { total: number; empty: number; partial: number; full: number };
    rooms.forEach((room: Room) => {
      const students = room.students || [];
      const occupancy = students.length;
      if (occupancy === 0) stats.empty += 1;
      else if (occupancy >= room.capacity) stats.full += 1;
      else stats.partial += 1;
    });
    return stats;
  }, [rooms]);

  const sortedRooms = React.useMemo(() => {
    const roomsCopy = Array.isArray(rooms) ? [...rooms] : [];
    const getRoomOrderKey = (name: string) => {
      const digitsOnly = (name || '').replace(/[^\d]/g, '');
      const numericPart = digitsOnly ? parseInt(digitsOnly, 10) : Number.POSITIVE_INFINITY;
      return { numericPart, nameKey: (name || '').toLowerCase() };
    };
    roomsCopy.sort((a: Room, b: Room) => {
      const ka = getRoomOrderKey(a.name);
      const kb = getRoomOrderKey(b.name);
      if (ka.numericPart !== kb.numericPart) return ka.numericPart - kb.numericPart;
      return ka.nameKey.localeCompare(kb.nameKey);
    });
    return roomsCopy;
  }, [rooms]);

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.trim() || !newRoomCapacity.trim() || !floor) return;
    setAdding(true);
    
    try {
      const token = sessionStorage.getItem('access');
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);
      myHeaders.append("Content-Type", "application/json");

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
          name: `${newRoom.trim()}-xona`,
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
    } catch {
      // Room creation error logged
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
    <div className="p-4 sm:p-8 max-w-7xl mx-auto pb-24">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <BackButton className="w-max" />
          <div className="flex items-center flex-wrap gap-2 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white break-words">{floor.name.endsWith('-qavat') ? floor.name : `${floor.name}-qavat`} xonalari</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${floor.gender === 'female' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'}`}>{floor.gender === 'female' ? 'Qizlar' : 'Yigitlar'}</span>
          </div>
        </div>
        <div className="sm:ml-auto w-full sm:w-auto">
          <button
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors"
            onClick={() => {
              setShowRoomModal(true);
              setNewRoom('');
              setNewRoomCapacity('');
            }}
          >
            + Xona qo'shish
          </button>
        </div>
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
                    type="number"
                    value={newRoom}
                    onChange={e => setNewRoom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masalan: 101, 102, 201..."
                    min="1"
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
                                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoomModal(false);
                      setNewRoom('');
                      setNewRoomCapacity('');
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors w-full sm:w-auto"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={adding}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-60 w-full sm:w-auto"
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
                    const token = sessionStorage.getItem('access');
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
                    placeholder="Masalan: 101-xona"
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
                                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditRoomModal(null)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors w-full sm:w-auto"
                    disabled={editingRoom}
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={editingRoom}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-60 w-full sm:w-auto"
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
                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteRoomModal(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors w-full sm:w-auto"
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
                      const token = sessionStorage.getItem('access');
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
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-60 w-full sm:w-auto"
                >
                  {deletingRoom ? "O'chirilmoqda..." : "O'chirish"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Stats + Filters */}
      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">Jami xona</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{roomStats.total}</div>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">Bo'sh</div>
            <div className="text-lg font-semibold text-emerald-600">{roomStats.empty}</div>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">To'lmagan</div>
            <div className="text-lg font-semibold text-amber-600">{roomStats.partial}</div>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">To'lgan</div>
            <div className="text-lg font-semibold text-blue-600">{roomStats.full}</div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filterlar</span>
          </div>
          <div className="flex sm:ml-auto">
            <div className="inline-flex w-full sm:w-auto rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
              <button
                onClick={() => setRoomStatusFilter("")}
                className={`px-3 py-2 text-sm ${roomStatusFilter === "" ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200'}`}
              >Barchasi</button>
              <button
                onClick={() => setRoomStatusFilter("empty")}
                className={`px-3 py-2 text-sm ${roomStatusFilter === "empty" ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200'}`}
              >Bo'sh</button>
              <button
                onClick={() => setRoomStatusFilter("occupied")}
                className={`px-3 py-2 text-sm ${roomStatusFilter === "occupied" ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200'}`}
              >To'lmagan</button>
              <button
                onClick={() => setRoomStatusFilter("full")}
                className={`px-3 py-2 text-sm ${roomStatusFilter === "full" ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200'}`}
              >To'lgan</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 relative">
        {rooms.length === 0 ? (
          <span className="text-gray-400 dark:text-slate-500 col-span-full">Xona yo'q</span>
        ) : (
          sortedRooms
            .filter((room: Room) => {
              const students = room.students || [];
              const occupancy = students.length;
              const capacity = room.capacity;
              
              if (!roomStatusFilter) return true;
              
              if (roomStatusFilter === "empty") return occupancy === 0;
              if (roomStatusFilter === "full") return occupancy >= capacity;
              if (roomStatusFilter === "occupied") return occupancy > 0 && occupancy < capacity;
              
              return true;
            })
            .map((room: Room) => {
            const students = room.students || [];
            return (
                             <div
                key={room.id}
                className={`flex flex-col justify-between px-5 py-4 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-medium border border-gray-200 dark:border-slate-700 hover:shadow-md focus:ring-2 focus:ring-blue-400 transition-colors shadow-sm cursor-pointer ${CARD_HEIGHT} relative overflow-hidden`}
              >
                {/* Three dots button */}
                <div className="absolute top-2 right-2 z-20">
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300 room-menu-button"
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
                        className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg z-30 room-menu"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-slate-800">
                          <span className="text-xs font-medium text-gray-500">Amallar</span>
                          <button
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500"
                            onClick={() => setOpenRoomMenuId(null)}
                            aria-label="Yopish"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <button
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-800 transition-colors"
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
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
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
                  <div className="flex items-start justify-between gap-3 mb-2 pr-8">
                    <div className="font-bold text-lg truncate pr-2" title={room.name.endsWith('-xona') ? room.name : `${room.name}-xona`}>
                      {room.name.endsWith('-xona') ? room.name : `${room.name}-xona`}
                    </div>
                    <div className="text-xs shrink-0 rounded-full px-2 py-0.5 border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                      {students.length}/{room.capacity}
                    </div>
                  </div>
                  <div className="h-1.5 rounded bg-gray-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`${students.length === 0 ? 'bg-emerald-500' : students.length >= room.capacity ? 'bg-blue-600' : 'bg-amber-500'} h-full`}
                      style={{ width: `${Math.min(100, (students.length / Math.max(1, room.capacity)) * 100)}%` }}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-1 xs:grid-cols-2 gap-2 overflow-y-auto pr-2 flex-1"
                    style={{ maxHeight: '4rem' }}
                  >
                    {students.length === 0 ? (
                      <span className="text-gray-400 dark:text-slate-400 col-span-full">Talaba yo'q</span>
                    ) : (
                      [0, 1].map(col => (
                        <div key={col} className="flex flex-col gap-1">
                          {students.slice(col * 3, col * 3 + 3).map(student => (
                            <Link
                              key={student.id}
                              to={`/studentprofile/${student.id}`}
                              className="text-sm whitespace-normal sm:whitespace-nowrap break-words text-blue-600 hover:underline dark:text-blue-400"
                            >
                              {getShortName(student.name + ' ' + student.last_name)}
                            </Link>
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between mt-auto pt-3">
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    {students.length === 0 ? "Bo'sh" : students.length >= room.capacity ? "To'lgan" : "To'lmagan"}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Add Button (mobile) */}
      <div className="fixed right-4 bottom-20 sm:hidden z-40">
        <button
          onClick={() => {
            setShowRoomModal(true);
            setNewRoom('');
            setNewRoomCapacity('');
          }}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-[0.98] transition"
        >
          <span className="text-lg">+</span>
          <span className="font-semibold">Xona qo'shish</span>
        </button>
      </div>


    </div>
  );
};

export default FloorDetail; 