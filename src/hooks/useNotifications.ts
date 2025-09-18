import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiQueries } from '../data/api';
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

interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  highPriority: number;
  byType: {
    info: number;
    success: number;
    warning: number;
    error: number;
  };
  byCategory: Record<string, number>;
}

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const [lastNotificationCount, setLastNotificationCount] = useState(0);

  // Fetch notifications
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch
  } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const res = await apiQueries.getNotifications();
        return Array.isArray(res) ? res : [];
      } catch (error) {
        console.error('Notifications fetch error:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes cache
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    retry: 2,
  });

  // Mark as read mutation
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

  // Mark all as read mutation
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

  // Mark multiple as read mutation
  const markMultipleAsReadMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map(id => apiQueries.markNotificationAsRead(id)));
    },
    onSuccess: (_, ids) => {
      toast.success(`${ids.length} ta bildirishnoma o'qilgan deb belgilandi!`);
    },
    onError: () => {
      toast.error("Bildirishnomalarni o'qilgan qilishda xatolik yuz berdi!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Calculate notification statistics
  const stats: NotificationStats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read && !n.is_read).length;
    const read = notifications.filter(n => n.read || n.is_read).length;
    const applications = notifications.filter(n => n.notification_type === 'application').length;

    const byType = {
      info: notifications.filter(n => n.type === 'info').length,
      success: notifications.filter(n => n.type === 'success').length,
      warning: notifications.filter(n => n.type === 'warning').length,
      error: notifications.filter(n => n.type === 'error').length,
    };

    const byCategory = notifications.reduce((acc, n) => {
      const category = n.category || 'other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      unread,
      read,
      highPriority: applications, // Ariza bildirishnomalar soni
      byType,
      byCategory
    };
  }, [notifications]);

  // Check for new notifications
  useEffect(() => {
    if (notifications.length > lastNotificationCount && lastNotificationCount > 0) {
      const newCount = notifications.length - lastNotificationCount;
      toast.info(`${newCount} ta yangi bildirishnoma kelgan!`, {
        action: {
          label: 'Ko\'rish',
          onClick: () => {
            // Navigate to notifications page or open dropdown
            window.location.href = '/notifications';
          }
        }
      });
    }
    setLastNotificationCount(notifications.length);
  }, [notifications.length, lastNotificationCount]);

  // Filter notifications
  const filterNotifications = useCallback((
    filters: {
      type?: 'all' | 'unread' | 'read';
      category?: string;
      search?: string;
    }
  ) => {
    return notifications.filter(notification => {
      // Type filter
      if (filters.type && filters.type !== 'all') {
        const isRead = notification.read || notification.is_read;
        if (filters.type === 'read' && !isRead) return false;
        if (filters.type === 'unread' && isRead) return false;
      }

      // Category filter
      if (filters.category && notification.category !== filters.category) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          notification.title.toLowerCase().includes(searchTerm) ||
          notification.message.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [notifications]);

  // Sort notifications
  const sortNotifications = useCallback((
    notifications: Notification[],
    sortBy: 'date' | 'type' | 'category' = 'date',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) => {
    return [...notifications].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date': {
          // received_at yoki created_at bo'yicha saralash
          const aDate = new Date(a.received_at || a.created_at).getTime();
          const bDate = new Date(b.received_at || b.created_at).getTime();
          comparison = aDate - bDate;
          break;
        }
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, []);

  // Get notifications by category
  const getNotificationsByCategory = useCallback((category: string) => {
    return notifications.filter(n => n.category === category);
  }, [notifications]);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.read && !n.is_read);
  }, [notifications]);

  // Get application notifications
  const getApplicationNotifications = useCallback(() => {
    return notifications.filter(n => n.notification_type === 'application');
  }, [notifications]);

  return {
    // Data
    notifications,
    stats,
    isLoading,
    error,
    
    // Actions
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    markMultipleAsRead: markMultipleAsReadMutation.mutate,
    refetch,
    
    // Utilities
    filterNotifications,
    sortNotifications,
    getNotificationsByCategory,
    getUnreadNotifications,
    getApplicationNotifications,
    
    // Mutation states
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isMarkingMultipleAsRead: markMultipleAsReadMutation.isPending,
  };
}; 