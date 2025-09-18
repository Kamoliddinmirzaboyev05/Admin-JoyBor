import React, { useEffect, useState } from 'react';
import { X, Filter } from 'lucide-react';
import Select from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';
import { IoManSharp, IoWomanSharp } from 'react-icons/io5';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { post, get } from '../data/api';
import axios from 'axios';
// import NProgress from 'nprogress';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiQueries } from '../data/api';
import FloorRooms from '../components/UI/FloorRooms';
import { link } from '../data/config';

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

export interface Room {
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

const genderLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  male: { label: 'Yigitlar', icon: <IoManSharp className="inline w-5 h-5 mr-1" /> },
  female: { label: 'Qizlar', icon: <IoWomanSharp className="inline w-5 h-5 mr-1" /> },
};

// Select styles for filters
const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    backgroundColor: 'var(--tw-bg-opacity,1) #fff',
    borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 2px #3b82f6' : undefined,
    minHeight: 40,
    fontSize: 14,
    ...(document.documentElement.classList.contains('dark') && {
      backgroundColor: '#1f2937',
      color: '#fff',
      borderColor: state.isFocused ? '#60a5fa' : '#374151',
    })
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
    color: document.documentElement.classList.contains('dark') ? '#fff' : '#111827',
  }),
  singleValue: (base: any) => ({
    ...base,
    color: document.documentElement.classList.contains('dark') ? '#fff' : '#111827',
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? (document.documentElement.classList.contains('dark') ? '#2563eb' : '#3b82f6')
      : state.isFocused
      ? (document.documentElement.classList.contains('dark') ? '#374151' : '#e0e7ef')
      : 'transparent',
    color: state.isSelected || document.documentElement.classList.contains('dark') ? '#fff' : '#111827',
    cursor: 'pointer',
  }),
};

const Rooms: React.FC = () => {
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [newFloor, setNewFloor] = useState('');
  const [newFloorGender, setNewFloorGender] = useState<'male' | 'female'>('male');
  const [newRoom, setNewRoom] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  
  // Filter states
  const [roomStatusFilter, setRoomStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState('');
  const [addingRoom, setAddingRoom] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [addingFloor, setAddingFloor] = useState(false);
  const [deleteFloorId, setDeleteFloorId] = useState<number | null>(null);
  const [deletingFloor, setDeletingFloor] = useState(false);
  const [editFloor, setEditFloor] = useState<Floor | null>(null);
  const [editFloorName, setEditFloorName] = useState('');
  const [editFloorGender, setEditFloorGender] = useState<'male' | 'female'>('male');
  const [editingFloor, setEditingFloor] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [editRoomName, setEditRoomName] = useState('');
  const [editRoomCapacity, setEditRoomCapacity] = useState('');
  const [editRoomFloor, setEditRoomFloor] = useState<number | null>(null);
  const [editingRoom, setEditingRoom] = useState(false);
  const [deleteRoom, setDeleteRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { 
    data: floors = [] as Floor[], 
    isLoading: floorsLoading, 
    error: floorsError,
    refetch: refetchFloors 
  } = useQuery({
    queryKey: ['floors'],
    queryFn: apiQueries.getFloors,
    staleTime: 1000 * 30, // Cache ni qisqartirdik
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Helper: check if all rooms for all floors are loaded
  const typedFloors: Floor[] = Array.isArray(floors) ? (floors as Floor[]) : [];
  // No need for allRoomsLoaded, rely on react-query loading states per floor

  useEffect(() => {
    if (location.state && (location.state as { openAddRoomModal?: boolean })?.openAddRoomModal) {
      setShowRoomModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Now, after all hooks, handle early returns:
  if (floorsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }
  if (floorsError) {
    return (
      <div className="text-center py-10 text-red-600 dark:text-red-400">
        Ma'lumotlarni yuklashda xatolik yuz berdi.
      </div>
    );
  }

  // Add new floor
  const handleAddFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addingFloor) return; // Prevent double submit

    let floorStr = newFloor.trim();
    
    // Validation
    if (!floorStr) {
      toast.error('Qavat raqamini kiriting!');
      return;
    }

    // Remove all instances of 'qavat' (with or without dash or space)
    floorStr = floorStr.replace(/[- ]*qavat/gi, '');
    // Extract only the number part
    const match = floorStr.match(/\d+/);
    if (!match) {
      toast.error('Qavat raqami faqat raqamlardan iborat bo\'lishi kerak!');
      return;
    }
    const floorNumber = match[0];
    
    // Validate floor number range
    const floorNum = parseInt(floorNumber);
    if (floorNum <= 0) {
      toast.error('Qavat raqami 0 dan katta bo\'lishi kerak!');
      return;
    }
    if (floorNum > 20) {
      toast.error('Qavat raqami 20 dan oshmasligi kerak!');
      return;
    }

    floorStr = `${floorNumber}-qavat`;

    setAddingFloor(true);
    try {
      // Check if floor already exists
      const existingFloor = typedFloors.find(f => f.name === floorStr);
      if (existingFloor) {
        toast.error('Bu qavat allaqachon mavjud!');
        setAddingFloor(false);
        return;
      }

      await post(`${link}/floor/create/`, { name: floorStr, gender: newFloorGender });
      toast.success('Qavat muvaffaqiyatli qo\'shildi!');
      // Refresh floors from API
      refetchFloors();
      setShowFloorModal(false);
      setNewFloor('');
      setNewFloorGender('male');
    } catch (error: any) {
      if (error?.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Qavat qo\'shishda xatolik!');
      }
    } finally {
      setAddingFloor(false);
    }
  };

  // Add new room
  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    let roomStr = newRoom.trim();
    const capacity = parseInt(newRoomCapacity);
    
    // Validation
    if (!selectedFloor) {
      toast.error('Qavat tanlang!');
      return;
    }
    if (!roomStr) {
      toast.error('Xona raqamini kiriting!');
      return;
    }
    if (isNaN(capacity) || capacity <= 0) {
      toast.error('Xona sig\'imini to\'g\'ri kiriting!');
      return;
    }
    if (capacity > 10) {
      toast.error('Xona sig\'imi 10 dan oshmasligi kerak!');
      return;
    }

    // Remove all instances of 'xona' (with or without dash or space)
    roomStr = roomStr.replace(/[- ]*xona/gi, '');
    // Extract only the number part
    const match = roomStr.match(/\d+/);
    if (!match) {
      toast.error('Xona raqami faqat raqamlardan iborat bo\'lishi kerak!');
      return;
    }
    const roomNumber = match[0];
    roomStr = `${roomNumber}-xona`;

    setAddingRoom(true);
    try {
      const floorObj = typedFloors.find(f => f.name === selectedFloor);
      if (!floorObj) {
        toast.error('Qavat topilmadi!');
        setAddingRoom(false);
        return;
      }

      // Check if room already exists
      const existingRooms = await get(`/rooms/?floor=${floorObj.id}`);
      if (existingRooms && existingRooms.some((room: any) => room.name === roomStr)) {
        toast.error('Bu xona allaqachon mavjud!');
        setAddingRoom(false);
        return;
      }

      await post(`${link}/room/create/`, {
        name: roomStr,
        floor: floorObj.id,
        capacity: capacity,
        room_type: capacity <= 2 ? '2-Kishilik' : capacity <= 3 ? '3-Kishilik' : `${capacity}-Kishilik`,
      });
      toast.success('Xona muvaffaqiyatli qo\'shildi!');
      setNewRoom('');
      setSelectedFloor('');
      setNewRoomCapacity('');
      setShowRoomModal(false);
      // Force refetch for all rooms and this floor's rooms
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['rooms', floorObj.id] });
      queryClient.invalidateQueries({ queryKey: ['floors'] });
      
      // Global refetch
      queryClient.refetchQueries({ queryKey: ['rooms'] });
    } catch {
      toast.error('Xona qo\'shishda xatolik!');
    } finally {
      setAddingRoom(false);
    }
  };

  // Edit floor handler
  const handleEditFloor = (floor: Floor) => {
    setEditFloor(floor);
    setEditFloorName(floor.name);
    setEditFloorGender(floor.gender);
    setMenuOpen(null);
  };

  const handleEditFloorSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFloor) return;
    setEditingFloor(true);
    try {
      const token = sessionStorage.getItem('access');
      await axios.patch(
        `${link}/floors/${editFloor.id}/`,
        { name: editFloorName, gender: editFloorGender },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Qavat tahrirlandi!');
      setEditFloor(null);
      refetchFloors();
    } catch {
      toast.error('Qavatni tahrirlashda xatolik!');
    } finally {
      setEditingFloor(false);
    }
  };

  // Delete floor handler
  const handleDeleteFloor = (floor: Floor) => {
    setDeleteFloorId(floor.id);
    setMenuOpen(null);
  };

  const confirmDeleteFloor = async () => {
    if (!deleteFloorId) return;
    setDeletingFloor(true);
    try {
      const token = sessionStorage.getItem('access');
      await axios.delete(
        `${link}/floors/${deleteFloorId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Qavat o'chirildi!");
      setDeleteFloorId(null);
      refetchFloors();
    } catch {
      toast.error("Qavatni o'chirishda xatolik!");
    } finally {
      setDeletingFloor(false);
    }
  };

  const handleEditRoom = (room: Room) => {
    setEditRoom(room);
    setEditRoomName(room.name);
    setEditRoomCapacity(String(room.capacity));
    setEditRoomFloor(room.floor?.id || null);
  };
  const handleEditRoomSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoom) return;
    setEditingRoom(true);
    try {
      const token = sessionStorage.getItem('access');
      await axios.patch(
        `${link}/rooms/${editRoom.id}/`,
        { name: editRoomName, floor: editRoomFloor, capacity: Number(editRoomCapacity) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Xona tahrirlandi!');
      setEditRoom(null);
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      if (editRoomFloor) queryClient.invalidateQueries({ queryKey: ['rooms', editRoomFloor] });
    } catch {
      toast.error('Xonani tahrirlashda xatolik!');
    } finally {
      setEditingRoom(false);
    }
  };
  const confirmDeleteRoom = async () => {
    if (!deleteRoom) return;
    setDeletingRoom(true);
    try {
      const token = sessionStorage.getItem('access');
      await axios.delete(
        `${link}/rooms/${deleteRoom.id}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Xona o\'chirildi!');
      setDeleteRoom(null);
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      if (deleteRoom.floor?.id) queryClient.invalidateQueries({ queryKey: ['rooms', deleteRoom.floor.id] });
    } catch {
      toast.error('Xonani o\'chirishda xatolik!');
    } finally {
      setDeletingRoom(false);
    }
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

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filterlar:</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="min-w-[150px]">
              <Select
                options={[
                  { value: 'empty', label: 'Bo\'sh xonalar' },
                  { value: 'occupied', label: 'To\'lmagan xonalar' },
                  { value: 'full', label: 'To\'lgan xonalar' },
                ]}
                value={roomStatusFilter ? { value: roomStatusFilter, label: 
                  roomStatusFilter === 'empty' ? 'Bo\'sh xonalar' : 
                  roomStatusFilter === 'occupied' ? 'To\'lmagan xonalar' : 'To\'lgan xonalar' 
                } : null}
                onChange={(opt) => setRoomStatusFilter(opt ? opt.value : '')}
                isClearable
                placeholder="Xona holati"
                styles={selectStyles}
                classNamePrefix="react-select"
              />
            </div>

            <div className="min-w-[120px]">
              <Select
                options={[
                  { value: 'male', label: 'Yigitlar' },
                  { value: 'female', label: 'Qizlar' },
                ]}
                value={genderFilter ? { value: genderFilter, label: genderFilter === 'male' ? 'Yigitlar' : 'Qizlar' } : null}
                onChange={(opt) => setGenderFilter(opt ? opt.value : '')}
                isClearable
                placeholder="Jinsi"
                styles={selectStyles}
                classNamePrefix="react-select"
              />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          {floorsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
            </div>
          ) : floorsError ? (
            <div className="text-center text-red-500 py-16">{String(floorsError)}</div>
          ) : (
            typedFloors.length > 0 ? (
              typedFloors.map((floor) => (
                <FloorRooms
                  key={floor.id}
                  floor={floor}
                  genderLabels={genderLabels}
                  roomStatusFilter={roomStatusFilter}
                  genderFilter={genderFilter}
                  menuOpen={menuOpen}
                  setMenuOpen={setMenuOpen}
                  handleEditFloor={handleEditFloor}
                  handleDeleteFloor={handleDeleteFloor}
                  navigate={navigate}
                />
              ))
            ) : null
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Qavat raqami</label>
                  <input
                    type="text"
                    value={newFloor}
                    onChange={e => setNewFloor(e.target.value)}
                    placeholder="Masalan: 1, 2, 3..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Faqat raqam kiriting, "qavat" so'zi avtomatik qo'shiladi</p>
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
                        {floor.name} ({floor.gender === 'female' ? 'Qizlar' : 'Yigitlar'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Xona raqami</label>
                  <input
                    type="number"
                    value={newRoom}
                    onChange={e => setNewRoom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masalan: 101, 102, 201..."
                    min="1"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Faqat raqam kiriting, "xona" so'zi avtomatik qo'shiladi</p>
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
      {/* Qavatni tahrirlash modali */}
      <AnimatePresence>
        {editFloor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setEditFloor(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Qavatni tahrirlash</h2>
              <form onSubmit={handleEditFloorSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Qavat nomi yoki raqami</label>
                  <input
                    type="text"
                    value={editFloorName}
                    onChange={e => setEditFloorName(e.target.value)}
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
                          ${editFloorGender === g
                            ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-slate-900 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-400'}
                        `}
                      >
                        <input
                          type="radio"
                          name="edit-floor-gender"
                          checked={editFloorGender === g}
                          onChange={() => setEditFloorGender(g)}
                          className="sr-only"
                        />
                        <span className={`flex items-center justify-center w-10 h-10 rounded-full mb-2
                          ${editFloorGender === g
                            ? 'bg-blue-600 text-white shadow'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}
                          transition-all duration-200
                        `}>
                          {genderLabels[g]?.icon}
                        </span>
                        <span className={`text-sm font-semibold
                          ${editFloorGender === g
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
                    onClick={() => setEditFloor(null)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    disabled={editingFloor}
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={editingFloor}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-60"
                  >
                    {editingFloor ? "Saqlanmoqda..." : "Saqlash"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Qavatni o'chirishni tasdiqlash modali */}
      <AnimatePresence>
        {deleteFloorId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDeleteFloorId(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Qavatni o'chirish</h2>
              <p className="mb-6 text-gray-700 dark:text-gray-300">Rostdan ham ushbu qavatni o'chirmoqchimisiz?</p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteFloorId(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  disabled={deletingFloor}
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteFloor}
                  disabled={deletingFloor}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-60"
                >
                  {deletingFloor ? "O'chirilmoqda..." : "O'chirish"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Xonani tahrirlash modali */}
      <AnimatePresence>
        {editRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setEditRoom(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Xonani tahrirlash</h2>
              <form onSubmit={handleEditRoomSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Xona nomi</label>
                  <input
                    type="text"
                    value={editRoomName}
                    onChange={e => setEditRoomName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Qavat</label>
                  <select
                    value={editRoomFloor ?? ''}
                    onChange={e => setEditRoomFloor(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Qavat tanlang</option>
                    {typedFloors.map(floor => (
                      <option key={floor.id} value={floor.id}>{floor.name}</option>
                    ))}
                  </select>
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
                    onClick={() => setEditRoom(null)}
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
      {/* Xonani o'chirishni tasdiqlash modali */}
      <AnimatePresence>
        {deleteRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDeleteRoom(null)}>
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
                  onClick={() => setDeleteRoom(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  disabled={deletingRoom}
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteRoom}
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
    </div>
  );
};

export default Rooms;