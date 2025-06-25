
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, Check, X, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'new_request' | 'user_registered' | 'system' | 'urgent';
  is_read: boolean;
  created_at: string;
  request_id?: string;
  user_id?: string;
  user_name?: string;
  request_type?: string;
}

export const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      // جلب الطلبات الجديدة مع بيانات المستخدمين منفصلة
      const { data: pendingRequests } = await supabase
        .from('requests')
        .select('id, type, created_at, status, user_id')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      // جلب بيانات المستخدمين لكل طلب
      const requestNotifications: AdminNotification[] = [];
      if (pendingRequests) {
        for (const request of pendingRequests) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', request.user_id)
            .single();

          requestNotifications.push({
            id: `request-${request.id}`,
            title: 'طلب جديد يحتاج للمراجعة',
            message: `طلب ${getRequestTypeLabel(request.type)} من ${profile?.full_name || 'مستخدم'}`,
            type: 'new_request' as const,
            is_read: false,
            created_at: request.created_at,
            request_id: request.id,
            user_name: profile?.full_name || 'مستخدم',
            request_type: request.type
          });
        }
      }

      // جلب المستخدمين الجدد (آخر 24 ساعة)
      const { data: newUsers } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      const userNotifications: AdminNotification[] = (newUsers || []).map(user => ({
        id: `user-${user.id}`,
        title: 'مستخدم جديد سجل في المنصة',
        message: `المستخدم ${user.full_name || 'مستخدم'} سجل في المنصة`,
        type: 'user_registered' as const,
        is_read: false,
        created_at: user.created_at,
        user_id: user.id,
        user_name: user.full_name || 'مستخدم'
      }));

      const allNotifications = [...requestNotifications, ...userNotifications]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 20);

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRequestTypeLabel = (type: string) => {
    const labels = {
      'vacation': 'إجازة',
      'work-certificate': 'شهادة عمل',
      'mission-order': 'أمر مهمة'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_request':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'user_registered':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'urgent':
        return <Bell className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    toast({
      title: 'تم وضع علامة مقروء',
      description: 'تم وضع علامة مقروء على جميع الإشعارات',
    });
  };

  const sendTestEmailNotification = async () => {
    try {
      const { error } = await supabase.functions.invoke('admin-email-notification', {
        body: {
          type: 'test',
          title: 'إشعار تجريبي',
          message: 'هذا إشعار تجريبي للتأكد من عمل النظام',
          adminEmail: 'cmc.rh.ram@gmail.com'
        }
      });

      if (error) throw error;

      toast({
        title: 'تم الإرسال',
        description: 'تم إرسال إشعار تجريبي إلى البريد الإلكتروني',
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إرسال الإشعار التجريبي',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // تحديث الإشعارات كل دقيقة
    const interval = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            الإشعارات
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={sendTestEmailNotification}
              className="flex items-center gap-1"
            >
              <Mail className="w-4 h-4" />
              إرسال تجريبي
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                تحديد الكل كمقروء
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>لا توجد إشعارات جديدة</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors cursor-pointer hover:bg-gray-50 ${
                  !notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                }`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${!notification.is_read ? 'text-blue-900' : 'text-gray-900'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    {!notification.is_read && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs">
                          جديد
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
