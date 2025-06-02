
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: Date;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    setNotifications(prev => [newNotification, ...prev]);

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

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // محاكاة الإشعارات الحقيقية
  useEffect(() => {
    const interval = setInterval(() => {
      // يمكنك هنا إضافة منطق لجلب الإشعارات من الخادم
      // const fetchNotifications = async () => {
      //   // جلب الإشعارات من API
      // };
    }, 30000); // كل 30 ثانية

    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
  };
};
