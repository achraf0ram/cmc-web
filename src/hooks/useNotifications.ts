
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: Date;
  read?: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // جلب الطلبات المعلقة وإضافتها كإشعارات
  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!user) return;

      try {
        const { data: pendingRequests, error } = await supabase
          .from('requests')
          .select('id, type, submitted_at, data')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .order('submitted_at', { ascending: false });

        if (error) {
          console.error('Error fetching pending requests:', error);
          return;
        }

        // تحويل الطلبات المعلقة إلى إشعارات
        const pendingNotifications = pendingRequests?.map(request => {
          const requestTypeMap = {
            'vacation': 'طلب إجازة',
            'work-certificate': 'طلب شهادة عمل',
            'mission-order': 'طلب أمر مهمة'
          };

          const submittedDate = new Date(request.submitted_at);
          const daysSinceSubmission = Math.floor((new Date().getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));

          return {
            id: `pending-${request.id}`,
            title: `${requestTypeMap[request.type as keyof typeof requestTypeMap]} معلق`,
            message: `تم تقديم الطلب منذ ${daysSinceSubmission} ${daysSinceSubmission === 1 ? 'يوم' : 'أيام'}`,
            type: 'warning' as const,
            timestamp: submittedDate,
            read: false,
          };
        }) || [];

        // دمج الإشعارات الجديدة مع الإشعارات الموجودة (بدون تكرار)
        setNotifications(prev => {
          const existingIds = prev.map(n => n.id);
          const newNotifications = pendingNotifications.filter(n => !existingIds.includes(n.id));
          return [...newNotifications, ...prev.filter(n => !n.id.startsWith('pending-'))];
        });

      } catch (error) {
        console.error('Error in fetchPendingRequests:', error);
      }
    };

    fetchPendingRequests();
  }, [user]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    console.log("Adding new notification:", newNotification);

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      console.log("Updated notifications:", updated);
      return updated;
    });

    // عرض Toast للإشعار
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.type === 'error' ? 'destructive' : 'default',
      className: `${
        notification.type === 'success' ? 'bg-green-50 border-green-200' :
        notification.type === 'error' ? 'bg-red-50 border-red-200' :
        notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
        'bg-blue-50 border-blue-200'
      }`,
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    markAsRead,
    getUnreadCount,
  };
};
