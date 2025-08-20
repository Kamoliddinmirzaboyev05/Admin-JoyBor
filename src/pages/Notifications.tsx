import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiQueries } from '../data/api';
import { Bell, Clock, CheckCircle, AlertCircle, Info, Filter, Search, Eye } from 'lucide-react';
import BackButton from '../components/UI/BackButton';
import { useSEO } from '../hooks/useSEO';
import { toast } from 'sonner';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  is_read: boolean;
  created_at: string;
}

const Notifications: React.FC = () => {
  // SEO
  useSEO('notifications');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, error } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await apiQueries.getNotifications();
      return Array.isArray(res) ? res : [];
    },
    staleTime: 1000 * 60 * 2, // 2 daqiqa cache
  });

  // Bildirishnomani o'qilgan qilish mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => apiQueries.markNotificationAsRead(id),
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<Notification[]>(['notifications']);
      queryClient.setQueryData<Notification[]>(['notifications'], (old) => {
        if (!Array.isArray(old)) return old as any;
        return old.map((n) => (n.id === id ? { ...n, read: true, is_read: true } : n));
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

  // Barcha o'qilmagan bildirishnomalarni o'qilgan qilish
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter(n => !n.read && !n.is_read);
      await Promise.all(unreadNotifications.map(n => apiQueries.markNotificationAsRead(n.id)));
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

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  // Bildirishnomani bosganda avtomatik o'qilgan qilish
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read && !notification.is_read) {
      handleMarkAsRead(notification.id);
    }
  };

  // Filtrlash va qidiruv
  const filteredNotifications = (Array.isArray(notifications) ? notifications : []).filter(notification => {
    const matchesSearch = (notification.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (notification.message?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const isRead = Boolean((notification as any).read) || Boolean((notification as any).is_read);
    const matchesFilter = filterType === "all" ||
      (filterType === "read" && isRead) ||
      (filterType === "unread" && !isRead);

    return matchesSearch && matchesFilter;
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
        <div className="max-w-5xl mx-auto">
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
        <div className="max-w-5xl mx-auto">
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
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              Sahifani yangilash
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-16 sm:pt-20 px-4">
      <div className="max-w-5xl mx-auto">
        <BackButton className="mb-4 sm:mb-6" />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Bildirishnomalar
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Tizim bildirishnomalari va muhim xabarlar
                </p>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 sm:mt-6">
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
                      {notifications.filter(n => n.read || n.is_read).length}
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
                      {notifications.filter(n => !n.read && !n.is_read).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mark all as read button */}
            {notifications.filter(n => !n.read && !n.is_read).length > 0 && (
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
            <div className="flex flex-col sm:flex-row gap-4">
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

              {/* Filter */}
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
            </div>
          </div>
        </motion.div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
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
            filteredNotifications.map((notification, index) => {
              const isRead = notification.read || notification.is_read;
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  onClick={() => handleNotificationClick(notification)}
                  className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group ${!isRead ? "ring-2 ring-blue-100 dark:ring-blue-900/30 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10" : ""
                    }`}
                >
                  <div className={`h-1 ${getNotificationBorderColor(notification.type).replace("border-l-", "bg-")}`}></div>
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start gap-4">
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
                              {new Date(notification.created_at).toLocaleString("uz-UZ", {
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
                                  handleMarkAsRead(notification.id);
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
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;