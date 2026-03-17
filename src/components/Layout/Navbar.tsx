import React from 'react';
import { Bell, Moon, Sun, User, LogOut, PanelLeft, CheckCircle, AlertCircle, Info, Clock, Eye, RefreshCw, X } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { useQueryClient } from '@tanstack/react-query';

interface NavbarProps {
  handleSidebarToggle?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ handleSidebarToggle }) => {
  const { isDark, toggleTheme } = useAppStore();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showProfile, setShowProfile] = React.useState(false);
  const [notificationFilter, setNotificationFilter] = React.useState<'all' | 'unread'>('unread');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Demo settings
  const settings = {
    name: 'JoyBor Yotoqxonasi',
    logo: null,
  };

  // Fetch admin profile from API
  const [adminProfile, setAdminProfile] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = sessionStorage.getItem('access');
        const response = await fetch('https://joyborv1.pythonanywhere.com/api/me/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setAdminProfile(data);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      }
    };

    fetchProfile();
  }, []);

  // Use notifications hook
  const { 
    notifications, 
    unreadNotifications,
    unreadCount,
    isLoading: notificationsLoading, 
    refetch: refetchNotifications,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  // Filtrlangan bildirishnomalar
  const filteredNotifications = (notificationFilter === 'unread' ? unreadNotifications : notifications).slice(0, 8);

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    if (notification.type === 'application') {
      window.location.href = '/applications';
    }
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
              <div className="w-10 h-10 flex items-center justify-center">
                <img src="/logoicon.png" alt="logo" className='w-full h-full object-contain' />
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
                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowNotifications(false)} />
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
                              <X className="w-4 h-4" />
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
                          Barchasi ({notifications.length})
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
                              const isRead = notification.is_read;
                              return (
                                <motion.div
                                  key={notification.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 20 }}
                                  whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                                  onClick={() => handleNotificationClick(notification)}
                                  className={`p-4 border-l-4 transition-all cursor-pointer border-b border-gray-100 dark:border-gray-700/50 ${
                                    isRead 
                                      ? 'bg-white dark:bg-gray-800 border-l-transparent' 
                                      : `bg-blue-50/50 dark:bg-blue-900/10 ${getNotificationBorderColor(notification.type)}`
                                  }`}
                                >
                                  <div className="flex gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                      {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                          notification.type === 'application' 
                                            ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' 
                                            : 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
                                        }`}>
                                          {notification.type === 'application' ? 'Ariza' : 'Bildirishnoma'}
                                        </span>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                          <Clock className="w-2.5 h-2.5" />
                                          <span>{formatNotificationTime(notification.created_at)}</span>
                                        </div>
                                      </div>
                                      <p className={`text-sm leading-snug line-clamp-3 ${isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white font-medium'}`}>
                                        {notification.message}
                                      </p>
                                      
                                      <div className="flex justify-end mt-2">
                                        {!isRead && (
                                          <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-blue-500 font-bold uppercase">Yangi</span>
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                          </div>
                                        )}
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
                                markAllAsRead();
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
                  {adminProfile?.avatar ? (
                    <img 
                      src={adminProfile.avatar} 
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