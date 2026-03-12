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
  id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  image?: string | null;
}

const Notifications: React.FC = () => {
  // SEO
  useSEO('notifications');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const queryClient = useQueryClient();

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
    staleTime: 1000 * 60,
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => api.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success("Barchasi o'qilgan deb belgilandi");
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }

    if (notification.type === 'application') {
      window.location.href = '/applications';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
      (filterType === 'unread' && !n.is_read) || 
      (filterType === 'read' && n.is_read);
    return matchesSearch && matchesFilter;
  });

  const sortedNotifications = [...filteredNotifications].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'application': return <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Bell className="w-5 h-5" /></div>;
      case 'warning': return <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg"><AlertCircle className="w-5 h-5" /></div>;
      case 'error': return <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"><X className="w-5 h-5" /></div>;
      default: return <div className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg"><Info className="w-5 h-5" /></div>;
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><RefreshCw className="w-10 h-10 animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Bell className="w-8 h-8 text-blue-500" />
              Bildirishnomalar
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Sizga kelgan so'nggi xabarlar va bildirishnomalar</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => markAllAsReadMutation.mutate()}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Barchasini o'qilgan qilish
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Bildirishnomalarni qidirish..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            {(['all', 'unread', 'read'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  filterType === type 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {type === 'all' ? 'Barchasi' : type === 'unread' ? 'O\'qilmagan' : 'O\'qilgan'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {sortedNotifications.length > 0 ? (
              sortedNotifications.map((n) => (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => handleNotificationClick(n)}
                  className={`relative group p-4 rounded-2xl border transition-all cursor-pointer ${
                    n.is_read 
                      ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-75' 
                      : 'bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-900 shadow-md ring-1 ring-blue-50 dark:ring-blue-900/20'
                  } hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700`}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">{getIcon(n.type)}</div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                          {n.type === 'application' ? 'Ariza' : 'Bildirishnoma'}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(n.created_at).toLocaleString('uz-UZ', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                        </span>
                      </div>
                      
                      <p className={`text-sm md:text-base leading-relaxed ${n.is_read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white font-medium'}`}>
                        {n.message}
                      </p>

                      {n.image && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 max-w-sm">
                          <img 
                            src={n.image} 
                            alt="Notification" 
                            className="w-full h-auto object-cover max-h-48 cursor-zoom-in"
                            onClick={(e) => { e.stopPropagation(); setSelectedImage(n.image!); }}
                          />
                        </div>
                      )}
                    </div>

                    {!n.is_read && (
                      <div className="flex-shrink-0 self-center">
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700"
              >
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Bildirishnomalar topilmadi</h3>
                <p className="text-gray-500">Hozircha hech qanday yangilik yo'q</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 p-2 text-white hover:bg-white/10 rounded-full transition"
              >
                <X className="w-8 h-8" />
              </button>
              <img src={selectedImage} alt="Full size" className="w-full h-auto rounded-2xl shadow-2xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;