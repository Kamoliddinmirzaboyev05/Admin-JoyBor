import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../data/api';
import {
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Filter,
  Search,
  Eye,
  RefreshCw,
  Star,
  X,
  ZoomIn
} from 'lucide-react';
import BackButton from '../components/UI/BackButton';
import { useSEO } from '../hooks/useSEO';
import { toast } from 'sonner';


interface Notification {
  id: number; // User notification ID
  notification_id?: number; // Original notification ID - o'qilgan qilish uchun
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  is_read: boolean;
  created_at: string;
  received_at?: string;
  image?: string;
  image_url?: string;
  target_type?: string;
  target_user?: any;
  is_active?: boolean;
  category?: string;
  notification_type?: 'general' | 'application';
}

const Notifications: React.FC = () => {
  // SEO
  useSEO('notifications');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'type'>('date');
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }, 30000);

    return () => clearInterval(interval);
  }, [queryClient]);

  const { data: notifications = [], isLoading, error, refetch } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const res = await api.getNotifications();
        return Array.isArray(res) ? res : [];
      } catch (error) {
        console.error('Notifications fetch error:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 2, // 2 daqiqa cache
    retry: 2,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Umumiy bildirishnomani o'qilgan qilish mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => api.markNotificationAsRead(id),
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<Notification[]>(['notifications']);

      // Optimistik yangilash - to'g'ri notification ni topish
      queryClient.setQueryData<Notification[]>(['notifications'], (old) => {
        if (!Array.isArray(old)) return old as any;
        return old.map((n) => {
          // notification_id yoki id bo'yicha topish
          const matchesId = n.id === id || n.notification_id === id;
          return matchesId ? { ...n, read: true, is_read: true } : n;
        });
      });
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['notifications'], ctx.previous);
      toast.error("Bildirishnomani o'qilgan qilishda xatolik yuz berdi!");
    },
    onSuccess: () => {
      toast.success("Bildirishnoma o'qilgan deb belgilandi!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Ariza bildirishnomani o'qilgan qilish mutation
  const markApplicationAsReadMutation = useMutation({
    mutationFn: (id: number) => api.markApplicationNotificationAsRead(id),
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<Notification[]>(['notifications']);

      // Optimistik yangilash
      queryClient.setQueryData<Notification[]>(['notifications'], (old) => {
        if (!Array.isArray(old)) return old as any;
        return old.map((n) => {
          return n.id === id ? { ...n, read: true, is_read: true } : n;
        });
      });
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['notifications'], ctx.previous);
      toast.error("Ariza bildirishnomani o'qilgan qilishda xatolik yuz berdi!");
    },
    onSuccess: () => {
      toast.success("Ariza bildirishnoma o'qilgan deb belgilandi!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Barcha o'qilmagan bildirishnomalarni o'qilgan qilish
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter(n => !(n.read || n.is_read));

      // Ariza va umumiy bildirishnomalarni ajratish
      const applicationNotifications = unreadNotifications.filter(n => n.notification_type === 'application');
      const generalNotifications = unreadNotifications.filter(n => n.notification_type !== 'application');

      const promises = [];

      // Agar ariza bildirishnomalari bo'lsa, barcha ariza bildirishnomalarini o'qilgan qilish
      if (applicationNotifications.length > 0) {
        promises.push(api.markAllApplicationNotificationsAsRead());
      }

      // Umumiy bildirishnomalarni alohida-alohida o'qilgan qilish
      if (generalNotifications.length > 0) {
        promises.push(...generalNotifications.map(n => {
          const notificationId = n.notification_id || n.id;
          return api.markNotificationAsRead(notificationId);
        }));
      }

      await Promise.all(promises);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<Notification[]>(['notifications']);
      queryClient.setQueryData<Notification[]>(['notifications'], (old) => {
        if (!Array.isArray(old)) return old as any;
        return old.map((n) => ({ ...n, read: true, is_read: true }));
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['notifications'], ctx.previous);
      toast.error("Bildirishnomalarni o'qilgan qilishda xatolik yuz berdi!");
    },
    onSuccess: () => {
      toast.success("Barcha bildirishnomalar o'qilgan deb belgilandi!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Tanlangan bildirishnomalarni o'qilgan qilish
  const markSelectedAsReadMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const selectedNotifs = notifications.filter(n => ids.includes(n.id));

      await Promise.all(selectedNotifs.map(notification => {
        if (notification.notification_type === 'application') {
          return api.markApplicationNotificationAsRead(notification.id);
        } else {
          const notificationId = notification.notification_id || notification.id;
          return api.markNotificationAsRead(notificationId);
        }
      }));
    },
    onSuccess: () => {
      toast.success(`${selectedNotifications.length} ta bildirishnoma o'qilgan deb belgilandi!`);
      setSelectedNotifications([]);
      setShowBulkActions(false);
    },
    onError: () => {
      toast.error("Bildirishnomalarni o'qilgan qilishda xatolik yuz berdi!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleMarkAsRead = (notification: Notification) => {
    // Ariza bildirishnomasi uchun maxsus endpoint ishlatamiz
    if (notification.notification_type === 'application') {
      markApplicationAsReadMutation.mutate(notification.id);
    } else {
      // Umumiy bildirishnomalar uchun
      const notificationId = notification.notification_id || notification.id;
      markAsReadMutation.mutate(notificationId);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleMarkSelectedAsRead = () => {
    if (selectedNotifications.length > 0) {
      markSelectedAsReadMutation.mutate(selectedNotifications);
    }
  };

  // Bildirishnomani bosganda avtomatik o'qilgan qilish va sahifaga o'tish
  const handleNotificationClick = (notification: Notification) => {
    // O'qilmagan bo'lsa o'qilgan qilish
    const isRead = Boolean(notification.read || notification.is_read);
    if (!isRead) {
      handleMarkAsRead(notification);
    }

    // Ariza bildirishnomasi bo'lsa ariza sahifasiga o'tish
    if (notification.notification_type === 'application') {
      // Ariza sahifasiga o'tish
      setTimeout(() => {
        window.location.href = '/applications';
      }, 100); // O'qilgan qilish uchun biroz kutish
      return;
    }
  };

  // Tanlash funksiyalari
  const handleSelectNotification = (id: number) => {
    setSelectedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(n => n !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  // Filtrlash va qidiruv
  const filteredNotifications = (Array.isArray(notifications) ? notifications : []).filter(notification => {
    const matchesSearch = (notification.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (notification.message?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    // O'qilgan holatni to'g'ri tekshirish
    const isRead = Boolean(notification.read || notification.is_read);
    const matchesFilter = filterType === "all" ||
      (filterType === "read" && isRead) ||
      (filterType === "unread" && !isRead);

    return matchesSearch && matchesFilter;
  });

  // Saralash - avval o'qilmagan xabarlar, keyin sana bo'yicha
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    const aRead = Boolean(a.read || a.is_read);
    const bRead = Boolean(b.read || b.is_read);

    // Avval o'qilmagan xabarlarni tepaga chiqarish
    if (aRead !== bRead) {
      return aRead ? 1 : -1; // O'qilmagan (-1) tepada, o'qilgan (1) pastda
    }

    // Agar ikkalasi ham bir xil holatda bo'lsa, sana bo'yicha saralash
    switch (sortBy) {
      case 'date':
        // received_at yoki created_at bo'yicha saralash
        const aDate = new Date(a.received_at || a.created_at).getTime();
        const bDate = new Date(b.received_at || b.created_at).getTime();
        return bDate - aDate; // Eng yangi tepada
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        // Default: received_at bo'yicha saralash
        const defaultADate = new Date(a.received_at || a.created_at).getTime();
        const defaultBDate = new Date(b.received_at || b.created_at).getTime();
        return defaultBDate - defaultADate;
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationBorderColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'error':
        return 'border-l-red-500';
      default:
        return 'border-l-blue-500';
    }
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-800"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Bildirishnomalar yuklanmoqda...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Xatolik yuz berdi
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Bildirishnomalarni yuklashda muammo yuz berdi. Iltimos, sahifani yangilang yoki keyinroq urinib ko'ring.
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              Qayta urinish
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-16 sm:pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <BackButton className="mb-4 sm:mb-6" />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Bell className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      Bildirishnomalar
                    </h1>
                    {notifications.filter(n => !(n.read || n.is_read)).length > 0 && (
                      <div className="bg-red-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                        {notifications.filter(n => !(n.read || n.is_read)).length} yangi
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Tizim bildirishnomalari va muhim xabarlar
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Yangilash"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4 sm:mt-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Jami</span>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {notifications.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-green-900 dark:text-green-100">O'qilgan</span>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {notifications.filter(n => Boolean(n.read || n.is_read)).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-orange-900 dark:text-orange-100">O'qilmagan</span>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {notifications.filter(n => !(n.read || n.is_read)).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Arizalar</span>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {notifications.filter(n => n.notification_type === 'application').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {showBulkActions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {selectedNotifications.length} ta bildirishnoma tanlandi
                    </span>
                    <button
                      onClick={handleSelectAll}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {selectedNotifications.length === filteredNotifications.length ? 'Tanlashni bekor qilish' : 'Hammasini tanlash'}
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleMarkSelectedAsRead}
                      disabled={markSelectedAsReadMutation.status === "pending"}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <Eye className="w-4 h-4" />
                      {markSelectedAsReadMutation.status === "pending" ? "Saqlanmoqda..." : "O'qilgan qilish"}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedNotifications([]);
                        setShowBulkActions(false);
                      }}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Bekor qilish
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Mark all as read button */}
            {notifications.filter(n => !(n.read || n.is_read)).length > 0 && !showBulkActions && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.status === "pending"}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5" />
                  {markAllAsReadMutation.status === "pending" ? "Saqlanmoqda..." : "Barchasini o'qilgan qilish"}
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Bildirishnomalarni qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all duration-200"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as "all" | "unread" | "read")}
                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 min-w-[140px]"
                  >
                    <option value="all">Barchasi</option>
                    <option value="unread">O'qilmagan</option>
                    <option value="read">O'qilgan</option>
                  </select>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "date" | "type")}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 min-w-[140px]"
                >
                  <option value="date">Sana bo'yicha</option>
                  <option value="type">Turi bo'yicha</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notifications List */}
        <div className="space-y-4">
          {sortedNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 sm:p-16 text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {searchTerm || filterType !== "all" ? "Hech narsa topilmadi" : "Bildirishnomalar yo'q"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {searchTerm || filterType !== "all"
                  ? "Qidiruv yoki filtr shartlariga mos bildirishnoma topilmadi"
                  : "Hozircha sizga bildirishnomalar kelmagan. Yangi bildirishnomalar kelganda bu yerda ko'rasiz."
                }
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {sortedNotifications.map((notification, index) => {
                  const isRead = Boolean(notification.read || notification.is_read);
                  const isSelected = selectedNotifications.includes(notification.id);

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      onClick={() => handleNotificationClick(notification)}
                      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group ${!isRead ? "ring-2 ring-blue-100 dark:ring-blue-900/30 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10" : ""
                        } ${isSelected ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""
                        }`}
                    >
                      <div className={`h-1 ${getNotificationBorderColor(notification.type).replace("border-l-", "bg-")}`}></div>
                      <div className="p-4 sm:p-6">
                        <div className="flex items-start gap-4">
                          {/* Checkbox for bulk selection */}
                          <div className="flex-shrink-0 mt-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSelectNotification(notification.id);
                                if (!showBulkActions) setShowBulkActions(true);
                              }}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                          </div>

                          <div className="flex-shrink-0 mt-1">
                            <div className={`p-3 rounded-xl shadow-sm ${notification.type === "success" ? "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30" :
                              notification.type === "warning" ? "bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30" :
                                notification.type === "error" ? "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30" :
                                  "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30"
                              }`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {notification.title}
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                  {notification.message}
                                </p>

                                {/* Notification image */}
                                {notification.image_url && (
                                  <div className="mt-4 relative group">
                                    <div className="relative overflow-hidden rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                                      {/* Loading state */}
                                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                      </div>

                                      <img
                                        src={notification.image_url}
                                        alt="Bildirishnoma rasm"
                                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105 relative z-10 cursor-pointer"
                                        style={{ maxHeight: '250px' }}
                                        onClick={() => setSelectedImage(notification.image_url!)}
                                        onLoad={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          const loadingDiv = target.previousElementSibling as HTMLElement;
                                          if (loadingDiv) {
                                            loadingDiv.style.display = 'none';
                                          }
                                        }}
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          const loadingDiv = target.previousElementSibling as HTMLElement;
                                          if (loadingDiv) {
                                            loadingDiv.style.display = 'none';
                                          }
                                          target.style.display = 'none';
                                          target.parentElement!.innerHTML = `
                                            <div class="flex items-center justify-center h-32 bg-gray-100 dark:bg-gray-700 rounded-xl">
                                              <div class="text-center">
                                                <svg class="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                </svg>
                                                <p class="text-sm text-gray-500 dark:text-gray-400">Rasm yuklanmadi</p>
                                              </div>
                                            </div>
                                          `;
                                        }}
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>

                                      {/* Zoom button */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedImage(notification.image_url!);
                                        }}
                                        className="absolute top-2 left-2 bg-black/50 text-white p-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 hover:bg-black/70"
                                        title="Rasmni kattalashtirish"
                                      >
                                        <ZoomIn className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                                      Rasm
                                    </div>
                                  </div>
                                )}
                              </div>

                              {!isRead && (
                                <div className="flex-shrink-0">
                                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse shadow-lg"></div>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {new Date(notification.received_at || notification.created_at).toLocaleString("uz-UZ", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">


                                {!isRead && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(notification);
                                    }}
                                    disabled={markAsReadMutation.status === "pending"}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 disabled:opacity-50 border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700"
                                    title="O'qilgan qilish"
                                  >
                                    <Eye className="w-3 h-3" />
                                    {markAsReadMutation.status === "pending" ? "Saqlanmoqda..." : "O'qilgan qilish"}
                                  </button>
                                )}

                                <div className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${isRead
                                  ? "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600"
                                  : "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                  }`}>
                                  {isRead ? "O'qilgan" : "Yangi"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setSelectedImage(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <div className="relative max-w-4xl max-h-full">
                <img
                  src={selectedImage}
                  alt="Bildirishnoma rasm"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(null);
                  }}
                  className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;