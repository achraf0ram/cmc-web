
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'new_request' | 'user_registered' | 'system' | 'urgent';
  is_read: boolean;
  created_at: string;
  request_id?: string;
  user_id?: string;
}

export const useAdminNotifications = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin } = useAuth();

  const sendAdminEmailNotification = async (
    type: string,
    title: string,
    message: string,
    additionalData?: any
  ) => {
    if (!isAdmin) return;
    
    try {
      const { error } = await supabase.functions.invoke('admin-email-notification', {
        body: {
          type,
          title,
          message,
          adminEmail: 'cmc.rh.ram@gmail.com',
          ...additionalData
        }
      });

      if (error) {
        console.error('Error sending admin notification:', error);
      }
    } catch (error) {
      console.error('Error in sendAdminEmailNotification:', error);
    }
  };

  const watchForNewRequests = () => {
    const channel = supabase
      .channel('admin-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'requests'
      }, async (payload) => {
        console.log('New request detected:', payload);
        
        // جلب بيانات المستخدم
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', payload.new.user_id)
          .single();

        // إرسال إشعار بريد إلكتروني للأدمن
        await sendAdminEmailNotification(
          'new_request',
          'طلب جديد يحتاج للمراجعة',
          `طلب ${getRequestTypeLabel(payload.new.type)} من ${profile?.full_name || 'مستخدم'}`,
          {
            requestData: {
              type: payload.new.type,
              userName: profile?.full_name,
              userEmail: profile?.email
            }
          }
        );

        // إضافة الإشعار للقائمة المحلية
        const newNotification: AdminNotification = {
          id: `request-${payload.new.id}`,
          title: 'طلب جديد يحتاج للمراجعة',
          message: `طلب ${getRequestTypeLabel(payload.new.type)} من ${profile?.full_name || 'مستخدم'}`,
          type: 'new_request',
          is_read: false,
          created_at: payload.new.created_at,
          request_id: payload.new.id
        };

        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'profiles'
      }, async (payload) => {
        console.log('New user detected:', payload);
        
        // إرسال إشعار بريد إلكتروني للأدمن
        await sendAdminEmailNotification(
          'user_registered',
          'مستخدم جديد سجل في المنصة',
          `المستخدم ${payload.new.full_name} سجل في المنصة`,
          {
            userData: {
              fullName: payload.new.full_name,
              email: payload.new.email
            }
          }
        );

        // إضافة الإشعار للقائمة المحلية
        const newNotification: AdminNotification = {
          id: `user-${payload.new.id}`,
          title: 'مستخدم جديد سجل في المنصة',
          message: `المستخدم ${payload.new.full_name} سجل في المنصة`,
          type: 'user_registered',
          is_read: false,
          created_at: payload.new.created_at,
          user_id: payload.new.id
        };

        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return channel;
  };

  const getRequestTypeLabel = (type: string) => {
    const labels = {
      'vacation': 'إجازة',
      'work-certificate': 'شهادة عمل',
      'mission-order': 'أمر مهمة'
    };
    return labels[type as keyof typeof labels] || type;
  };

  useEffect(() => {
    if (!isAdmin) return;

    let channel: any = null;

    const setupNotifications = async () => {
      try {
        // إعداد مراقبة التغييرات في الوقت الفعلي
        channel = watchForNewRequests();
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error setting up admin notifications:', error);
        setIsLoading(false);
      }
    };

    setupNotifications();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [isAdmin]);

  return {
    notifications,
    unreadCount,
    isLoading,
    sendAdminEmailNotification
  };
};
