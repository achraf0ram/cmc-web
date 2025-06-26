
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface RealTimeNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  is_read: boolean;
  request_id?: string;
  created_at: string;
  expires_at: string;
}

export const useRealTimeNotifications = () => {
  const [notifications, setNotifications] = useState<RealTimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('real_time_notifications')
        .select('*')
        .eq('user_id', user.id)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      // تأكد من أن نوع الإشعار صحيح
      const validNotifications = (data || []).map(notification => ({
        ...notification,
        type: ['success', 'error', 'info', 'warning'].includes(notification.type) 
          ? notification.type as 'success' | 'error' | 'info' | 'warning'
          : 'info' as const
      }));

      setNotifications(validNotifications);
      setUnreadCount(validNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('real_time_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('real_time_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // إعداد الاستماع للإشعارات في الوقت الفعلي
    const channel = supabase
      .channel('real-time-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'real_time_notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('New notification received:', payload);
        
        const newNotification = payload.new as RealTimeNotification;
        
        // التأكد من صحة نوع الإشعار
        const validType = ['success', 'error', 'info', 'warning'].includes(newNotification.type) 
          ? newNotification.type 
          : 'info' as const;

        const validatedNotification = {
          ...newNotification,
          type: validType
        };
        
        // إضافة الإشعار للقائمة
        setNotifications(prev => [validatedNotification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // عرض toast للإشعار الجديد
        toast({
          title: validatedNotification.title,
          description: validatedNotification.message,
          variant: validatedNotification.type === 'error' ? 'destructive' : 'default',
          className: `${
            validatedNotification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            validatedNotification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            validatedNotification.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`,
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
  };
};
