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
    queryFn: apiQueries.getNotifications,
    staleTime: 1000 * 60 * 2, // 2 daqiqa cache
  });

  // Bildirishnomani o'qilgan qilish mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => apiQueries.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Bildirishnoma o\'qilgan deb belgilandi!');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Bildirishnomani o\'qilgan qilishda xatolik yuz berdi!');
    },
  });

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  // Filtrlash va qidiruv
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = (notification.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (notification.message?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === 'all' ||
      (filterType === 'read' && notification.read) ||
      (filterType === 'unread' && !notification.read);

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
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Xatolik yuz berdi
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Bildirishnomalarni yuklashda muammo yuz berdi
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20 px-4">
      <div className="max-w-5xl mx-auto">
        <BackButton />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Bildirishnomalar
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Tizim bildirishnomalari va muhim xabarlar
                </p>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Jami</span>
                </div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {notifications.length}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">O'qilgan</span>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {notifications.filter(n => n.read).length}
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">O'qilmagan</span>
                </div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                  {notifications.filter(n => !n.read).length}
                </p>
              </div>
            </div>

            {/* Mark all as read button */}
            {notifications.filter(n => !n.read).length > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    const unreadNotifications = notifications.filter(n => !n.read);
                    unreadNotifications.forEach(notification => {
                      handleMarkAsRead(notification.id);
                    });
                  }}
                  disabled={markAsReadMutation.status === 'pending'}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  {markAsReadMutation.status === 'pending' ? 'Saqlanmoqda...' : 'Barchasini o\'qilgan qilish'}
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Bildirishnomalarni qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'unread' | 'read')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-16 text-center"
            >
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm || filterType !== 'all' ? 'Hech narsa topilmadi' : 'Bildirishnomalar yo\'q'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || filterType !== 'all'
                  ? 'Qidiruv yoki filtr shartlariga mos bildirishnoma topilmadi'
                  : 'Hozircha sizga bildirishnomalar kelmagan'
                }
              </p>
            </motion.div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 overflow-hidden ${!notification.read ? 'ring-2 ring-blue-100 dark:ring-blue-900/30' : ''
                  }`}
              >
                <div className={`h-1 ${getNotificationBorderColor(notification.type).replace('border-l-', 'bg-')}`}></div>
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`p-2 rounded-lg ${notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                        notification.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                          notification.type === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                            'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 leading-tight">
                            {notification.title}
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {notification.message}
                          </p>
                        </div>

                        {!notification.read && (
                          <div className="flex-shrink-0">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(notification.created_at).toLocaleString('uz-UZ', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              disabled={markAsReadMutation.status === 'pending'}
                              className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors disabled:opacity-50"
                              title="O'qilgan qilish"
                            >
                              <Eye className="w-3 h-3" />
                              {markAsReadMutation.status === 'pending' ? 'Saqlanmoqda...' : 'O\'qilgan qilish'}
                            </button>
                          )}
                          
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${notification.read
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            }`}>
                            {notification.read ? 'O\'qilgan' : 'Yangi'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;