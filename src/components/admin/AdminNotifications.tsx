
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, XCircle, Clock, Users, FileText, AlertTriangle } from 'lucide-react';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { supabase } from '@/integrations/supabase/client';

export const AdminNotifications: React.FC = () => {
  const { notifications, unreadCount, isLoading } = useAdminNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'new_request' | 'user_registered'>('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.is_read;
    return notification.type === filter;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_request':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'user_registered':
        return <Users className="w-5 h-5 text-green-600" />;
      case 'urgent':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'new_request': 'طلب جديد',
      'user_registered': 'مستخدم جديد',
      'urgent': 'عاجل',
      'system': 'نظام'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الإشعارات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header مع إحصائيات */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">مركز الإشعارات الإدارية</h2>
          <p className="text-gray-600 mt-1">
            إجمالي الإشعارات: {notifications.length} | غير مقروءة: {unreadCount}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-blue-600">
            <Bell className="w-4 h-4 ml-1" />
            {unreadCount} جديد
          </Badge>
        </div>
      </div>

      {/* فلاتر */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">تصفية الإشعارات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              جميع الإشعارات ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              غير مقروءة ({unreadCount})
            </Button>
            <Button
              variant={filter === 'new_request' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('new_request')}
            >
              طلبات جديدة ({notifications.filter(n => n.type === 'new_request').length})
            </Button>
            <Button
              variant={filter === 'user_registered' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('user_registered')}
            >
              مستخدمين جدد ({notifications.filter(n => n.type === 'user_registered').length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* قائمة الإشعارات */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all hover:shadow-md ${
                !notification.is_read ? 'border-blue-200 bg-blue-50' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(notification.type)}
                        </Badge>
                        {!notification.is_read && (
                          <Badge className="bg-blue-600 text-white text-xs">
                            جديد
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(notification.created_at).toLocaleString('ar-SA')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {notification.request_id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // التنقل إلى تفاصيل الطلب
                          window.location.hash = `#request-${notification.request_id}`;
                        }}
                      >
                        عرض الطلب
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                لا توجد إشعارات
              </h3>
              <p className="text-gray-500 text-center">
                {filter === 'all' 
                  ? 'لا توجد إشعارات حالياً'
                  : filter === 'unread'
                  ? 'لا توجد إشعارات غير مقروءة'
                  : `لا توجد إشعارات من نوع "${getTypeLabel(filter)}"`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* معلومات إضافية */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <Bell className="w-5 h-5" />
            <span className="font-semibold">معلومة:</span>
          </div>
          <p className="text-blue-700 text-sm mt-1">
            يتم إرسال إشعارات بريد إلكتروني تلقائياً إلى {' '}
            <span className="font-mono bg-blue-100 px-1 rounded">cmc.rh.ram@gmail.com</span>
            {' '} عند حدوث أي من الأحداث المهمة في النظام.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
