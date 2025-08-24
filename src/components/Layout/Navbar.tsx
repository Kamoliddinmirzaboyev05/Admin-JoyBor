import React from 'react';
import { Bell, Moon, Sun, User, LogOut, PanelLeft, CheckCircle, AlertCircle, Info, Clock, Eye, Settings, Archive, MoreVertical, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiQueries } from '../../data/api';

interface NavbarProps {
  handleSidebarToggle?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ handleSidebarToggle }) => {
  const { isDark, toggleTheme, notifications, markNotificationRead } = useAppStore();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showProfile, setShowProfile] = React.useState(false);
  const [notificationFilter, setNotificationFilter] = React.useState<'all' | 'unread'>('unread');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // API dan yotoqxona ma'lumotlarini olish
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: apiQueries.getSettings,
    staleTime: 1000 * 60 * 5,
  });

  // API dan admin profil ma'lumotlarini olish
  const { data: adminProfile } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: apiQueries.getAdminProfile,
    staleTime: 1000 * 60 * 5,
  });

  // API dan bildirishnomalarni olish
  const { data: apiNotifications = [], isLoading: notificationsLoading, refetch: refetchNotifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: apiQueries.getNotifications,
    staleTime: 1000 * 60 * 2, // 2 daqiqa cache
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Bildirishnomani o'qilgan qilish uchun mutation
  const markReadMutation = useMutation({
    mutationFn: (id: number) => apiQueries.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // API dan kelgan notifications (store faqat demo uchun, navbar faqat API ga tayansin)
  const displayNotifications = Array.isArray(apiNotifications) ? apiNotifications : [];
  // O'qilmagan bildirishnomalar soni
  const unreadCount = displayNotifications.filter((n: any) => !n?.read && !n?.is_read).length;

  // Filtrlangan bildirishnomalar
  const filteredNotifications = displayNotifications.filter((n: any) => {
    if (notificationFilter === 'unread') {
      return !n?.read && !n?.is_read;
    }
    return true;
  }).slice(0, 8); // Faqat 8 ta ko'rsatish

  const handleNotificationClick = (notification: any) => {
    // Ariza bildirishnomasi bo'lsa ariza sahifasiga o'tish
    if (notification.notification_type === 'application') {
      // Ariza sahifasiga o'tish
      window.location.href = '/applications';
      return;
    }

    // React Query cache-ni optimistik yangilash (badge darhol yo'qolsin)
    queryClient.setQueryData(['notifications'], (oldData: any) => {
      if (!Array.isArray(oldData)) return oldData;
      return oldData.map((n: any) => {
        const nid = Number(n.id ?? n.notification_id ?? n.pk);
        return nid === Number(notification.id) ? { ...n, read: true, is_read: true } : n;
      });
    });

    // API orqali ham o'qilgan qilish
    markReadMutation.mutate(Number(notification.id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
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

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Hozir';
    if (diffInMinutes < 60) return `${diffInMinutes} daqiqa oldin`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} soat oldin`;
    return date.toLocaleDateString('uz-UZ');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <img src="/logoicon.svg" alt="logo" className='w-full h-full object-contain' />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">JoyBor</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
              </div>
            </motion.div>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Sidebar toggle icon (Theme toggle chapida, bir xil dizayn) */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSidebarToggle}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Sidebar ochish/yopish"
            >
              <PanelLeft className="w-5 h-5" />
            </motion.button>
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                      onClick={e => e.stopPropagation()}
                    >
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <Bell className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">Bildirishnomalar</h3>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {unreadCount} ta o'qilmagan
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => refetchNotifications()}
                              disabled={notificationsLoading}
                              className="p-1.5 rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                              title="Yangilash"
                            >
                              <RefreshCw className={`w-4 h-4 ${notificationsLoading ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                              onClick={() => setShowNotifications(false)}
                              className="p-1.5 rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            >
                              <div className="w-4 h-4 flex items-center justify-center">
                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full"></div>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Filter Tabs */}
                      <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => setNotificationFilter('unread')}
                          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                            notificationFilter === 'unread'
                              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          O'qilmagan ({unreadCount})
                        </button>
                        <button
                          onClick={() => setNotificationFilter('all')}
                          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                            notificationFilter === 'all'
                              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          Barchasi ({displayNotifications.length})
                        </button>
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-96 overflow-y-auto">
                        {notificationsLoading ? (
                          <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Yuklanmoqda...</p>
                          </div>
                        ) : filteredNotifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Bell className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {notificationFilter === 'unread' ? 'O\'qilmagan bildirishnomalar yo\'q' : 'Bildirishnomalar yo\'q'}
                            </p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredNotifications.map((notification: any) => {
                              const isRead = notification.read || notification.is_read;
                              return (
                                <motion.div
                                  key={notification.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 20 }}
                                  whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                                  onClick={() => handleNotificationClick(notification)}
                                  className={`px-4 py-3 cursor-pointer transition-all duration-200 ${
                                    !isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                  }`}
                                >
                                  <div className={`border-l-4 ${getNotificationBorderColor(notification.type)} pl-3`}>
                                    <div className="flex items-start gap-3">
                                      <div className="flex-shrink-0 mt-0.5">
                                        {getNotificationIcon(notification.type)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                          <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-tight">
                                            {notification.title}
                                          </h4>
                                          {!isRead && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                                          )}
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 text-xs mt-1 line-clamp-2">
                                          {notification.message}
                                        </p>
                                        
                                        {/* Notification image in dropdown */}
                                        {notification.image_url && (
                                          <div className="mt-2 relative group">
                                            <div className="relative overflow-hidden rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                                              {/* Loading state */}
                                              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                              </div>
                                              
                                              <img 
                                                src={notification.image_url} 
                                                alt="Bildirishnoma rasm" 
                                                className="w-full h-20 object-cover transition-transform duration-200 group-hover:scale-105 relative z-10 cursor-pointer"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  // Open image in new tab for dropdown
                                                  window.open(notification.image_url, '_blank');
                                                }}
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
                                                    <div class="flex items-center justify-center h-20 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                      <div class="text-center">
                                                        <svg class="w-5 h-5 mx-auto text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                        </svg>
                                                        <p class="text-xs text-gray-500 dark:text-gray-400">Rasm</p>
                                                      </div>
                                                    </div>
                                                  `;
                                                }}
                                              />
                                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"></div>
                                            </div>
                                            <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] z-30">
                                              Rasm
                                            </div>
                                          </div>
                                        )}
                                        <div className="flex items-center justify-between mt-2">
                                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            <Clock className="w-3 h-3" />
                                            <span>{formatNotificationTime(notification.received_at || notification.created_at || notification.createdAt)}</span>
                                          </div>
                                          {!isRead && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleNotificationClick(notification);
                                              }}
                                              className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                                            >
                                              <Eye className="w-3 h-3" />
                                              O'qilgan qilish
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center justify-between px-4 py-3">
                          <button
                            onClick={() => {
                              setShowNotifications(false);
                              navigate("/notifications");
                            }}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                          >
                            Barchasini ko'rish
                          </button>
                          {unreadCount > 0 && (
                            <button
                              onClick={() => {
                                // Mark all as read functionality
                                const unreadNotifications = displayNotifications.filter((n: any) => !n?.read && !n?.is_read);
                                unreadNotifications.forEach((n: any) => {
                                  handleNotificationClick(n);
                                });
                              }}
                              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                            >
                              Barchasini o'qilgan qilish
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center overflow-hidden">
                  {adminProfile?.image ? (
                    <img 
                      src={adminProfile.image} 
                      alt="Admin" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-sm">
                      {(() => {
                        // Avval first_name va last_name dan harflarni olishga harakat qilish
                        if (adminProfile?.first_name && adminProfile?.last_name) {
                          return adminProfile.first_name[0]?.toUpperCase() + adminProfile.last_name[0]?.toUpperCase();
                        }
                        // Agar faqat first_name bo'lsa
                        if (adminProfile?.first_name) {
                          return adminProfile.first_name[0]?.toUpperCase();
                        }
                        // Bio dan ism familiya bosh harflarini olish
                        if (adminProfile?.bio) {
                          const names = adminProfile.bio.trim().split(' ');
                          if (names.length >= 2) {
                            return names[0][0]?.toUpperCase() + names[1][0]?.toUpperCase();
                          }
                          return names[0][0]?.toUpperCase() || 'A';
                        }
                        // Agar bio yo'q bo'lsa, username dan
                        return adminProfile?.username?.[0]?.toUpperCase() || 'A';
                      })()}
                    </span>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {(() => {
                      // Avval first_name va last_name ni birlashtirish
                      if (adminProfile?.first_name && adminProfile?.last_name) {
                        return `${adminProfile.first_name} ${adminProfile.last_name}`;
                      }
                      // Agar faqat first_name bo'lsa
                      if (adminProfile?.first_name) {
                        return adminProfile.first_name;
                      }
                      // Bio dan to'liq ismni olish
                      if (adminProfile?.bio) {
                        return adminProfile.bio;
                      }
                      // Oxirgi variant - username
                      return adminProfile?.username || 'Admin';
                    })()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {settings?.name || 'Yotoqxona'}
                  </p>
                </div>
              </motion.button>

              {/* Profile Dropdown */}
              {showProfile && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      onClick={() => {
                        setShowProfile(false);
                        navigate('/profile');
                      }}
                    >
                      <User className="w-4 h-4" />
                      <span>Profil</span>
                    </button>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2" onClick={() => { sessionStorage.clear(); window.location.href = '/login'; }}>
                      <LogOut className="w-4 h-4" />
                      <span>Chiqish</span>
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;