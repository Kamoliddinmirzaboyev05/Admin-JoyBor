import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
// API imports o'chirilgan - demo ma'lumotlar

interface Notification {
  id: number;
  notification_id?: number;
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
  target_user?: unknown;
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
}

export const useNotifications = () => {
  // Demo notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Yangi ariza',
      message: 'Yangi ariza tushdi: Alisher Valiyev sizning yotoqxonangizga ariza topshirdi',
      type: 'info',
      read: false,
      is_read: false,
      created_at: new Date().toISOString(),
      notification_type: 'application',
    },
    {
      id: 2,
      title: 'To\'lov qabul qilindi',
      message: 'Dilnoza Karimova oylik to\'lovni amalga oshirdi',
      type: 'success',
      read: false,
      is_read: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      notification_type: 'general',
    },
    {
      id: 3,
      title: 'Davomat',
      message: '2-qavatda davomat sessiyasi yakunlandi',
      type: 'info',
      read: true,
      is_read: true,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      notification_type: 'general',
    },
  ]);

  const isLoading = false;
  const error = null;
  const refetch = () => Promise.resolve();

  // Mark as read (demo)
  const markAsRead = useCallback((id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true, is_read: true } : n))
    );
    console.log('Demo: Notification marked as read', id);
  }, []);

  // Mark all as read (demo)
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true, is_read: true }))
    );
    toast.success('Barcha bildirishnomalar o\'qilgan! (Demo)');
    console.log('Demo: All notifications marked as read');
  }, []);

  // Mark multiple as read (demo)
  const markMultipleAsRead = useCallback((ids: number[]) => {
    setNotifications(prev =>
      prev.map(n => (ids.includes(n.id) ? { ...n, read: true, is_read: true } : n))
    );
    console.log('Demo: Multiple notifications marked as read', ids);
  }, []);

  // Delete notification (demo)
  const deleteNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Bildirishnoma o\'chirildi! (Demo)');
    console.log('Demo: Notification deleted', id);
  }, []);

  // Statistics
  const stats: NotificationStats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read && !n.is_read).length;
    const read = total - unread;
    const highPriority = notifications.filter(n => n.type === 'error' || n.type === 'warning').length;

    const byType = {
      info: notifications.filter(n => n.type === 'info').length,
      success: notifications.filter(n => n.type === 'success').length,
      warning: notifications.filter(n => n.type === 'warning').length,
      error: notifications.filter(n => n.type === 'error').length,
    };

    return { total, unread, read, highPriority, byType };
  }, [notifications]);

  return {
    notifications,
    isLoading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
    markMultipleAsRead,
    deleteNotification,
    stats,
    unreadCount: stats.unread,
  };
};
