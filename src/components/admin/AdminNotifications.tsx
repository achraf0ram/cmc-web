
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, Check, X, Clock, User, FileText, AlertCircle } from 'lucide-react';
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
      setIsLoading(true);
      
      // جلب جميع الطلبات مع تفاصيل المستخدمين
      const { data: allRequests } = await supabase
        .from('requests')
        .select(`
          id,
          type,
          status,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      // جلب جميع المستخدمين
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      const requestNotifications: AdminNotification[] = [];
      
      if (allRequests) {
        for (const request of allRequests) {
          let user = null;
          if (allUsers) {
            user = allUsers.find(u => u.id === request.user_id);
          }

          // إشعار للطلبات الجديدة (المعلقة)
          if (request.status === 'pending') {
            requestNotifications.push({
              id: `request-${request.id}`,
              title: 'طلب جديد يحتاج للمراجعة',
              message: `طلب ${getRequestTypeLabel(request.type)} من ${user?.full_name || 'مستخدم غير معروف'}`,
              type: 'new_request' as const,
              is_read: false,
              created_at: request.created_at,
              request_id: request.id,
              user_name: user?.full_name || 'مستخدم غير معروف',
              request_type: request.type
            });
          }

          // إشعار للطلبات المعتمدة حديثاً
          if (request.status === 'approved') {
            requestNotifications.push({
              id: `approved-${request.id}`,
              title: 'تم اعتماد طلب',
              message: `تم اعتماد طلب ${getRequestTypeLabel(request.type)} للمستخدم ${user?.full_name || 'مستخدم غير معروف'}`,
              type: 'system' as const,
              is_read: true,
              created_at: request.created_at,
              request_id: request.id,
              user_name: user?.full_name || 'مستخدم غير معروف',
              request_type: request.type
            });
          }
        }
      }

      // إشعارات المستخدمين الجدد
      const userNotifications: AdminNotification[] = (allUsers || [])
        .filter(user => {
          const userDate = new Date(user.created_at);
          const now = new Date();
          const diffDays = Math.floor((now.getTime() - userDate.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays <= 7; // المستخدمين الجدد خلال أسبوع
        })
        .map(user => ({
          id: `user-${user.id}`,
          title: 'مستخدم جديد سجل في النظام',
          message: `المستخدم ${user.full_name || user.email || 'مستخدم غير معروف'} انضم للنظام`,
          type: 'user_registered' as const,
          is_read: false,
          created_at: user.created_at,
          user_id: user.id,
          user_name: user.full_name || user.email || 'مستخدم غير معروف'
        }));

      // دمج جميع الإشعارات وترتيبها
      const allNotifications = [...requestNotifications, ...userNotifications]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 30); // أحدث 30 إشعار

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.is_read).length);
      
      console.log('تم جلب الإشعارات:', allNotifications.length);
    } catch (error) {
      console.error('خطأ في جلب الإشعارات:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل الإشعارات',
        variant: 'destructive',
      });
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
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'system':
        return <FileText className="w-4 h-4 text-green-500" />;
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
          title: 'اختبار نظام الإشعارات',
          message: 'هذا إشعار تجريبي للتأكد من عمل نظام الإيميل للمدير',
          adminEmail: 'cmc.rh.ram@gmail.com'
        }
      });

      if (error) throw error;

      toast({
        title: 'تم الإرسال',
        description: 'تم إرسال إشعار تجريبي إلى البريد الإلكتروني',
      });
    } catch (error) {
      console.error('خطأ في إرسال الإشعار:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إرسال الإشعار التجريبي',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // تحديث الإشعارات كل دقيقتين
    const interval = setInterval(fetchNotifications, 120000);
    
    // إعداد الاستماع للتحديثات المباشرة
    const channel = supabase
      .channel('admin-notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'requests'
      }, () => {
        console.log('تم اكتشاف تغيير في الطلبات');
        fetchNotifications();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'profiles'
      }, () => {
        console.log('تم اكتشاف مستخدم جديد');
        fetchNotifications();
      })
      .subscribe();
    
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">جاري تحميل الإشعارات...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-blue-600" />
            مركز إشعارات الموارد البشرية
            {unreadCount > 0 && (
              <Badge variant="destructive" className="px-2 py-1">
                {unreadCount} جديد
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={sendTestEmailNotification}
              className="flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              اختبار الإيميل
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchNotifications}
              className="flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              تحديث
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                قراءة الكل
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">لا توجد إشعارات</h3>
              <p className="text-gray-500">ستظهر هنا جميع الإشعارات المتعلقة بالطلبات والمستخدمين</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${
                  !notification.is_read 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-semibold text-sm ${
                        !notification.is_read ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {new Date(notification.created_at).toLocaleDateString('ar-SA', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2">
                      {!notification.is_read && (
                        <Badge variant="secondary" className="text-xs px-2 py-1">
                          جديد
                        </Badge>
                      )}
                      {notification.request_type && (
                        <Badge variant="outline" className="text-xs px-2 py-1">
                          {getRequestTypeLabel(notification.request_type)}
                        </Badge>
                      )}
                    </div>
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
