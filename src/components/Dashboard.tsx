
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Bell,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import { NotificationCenter } from '@/components/NotificationCenter';

const Dashboard = () => {
  const { requests, stats, isLoading, error } = useDashboardData();
  const { unreadCount } = useRealTimeNotifications();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">خطأ في تحميل البيانات</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">مرحباً بك في منصة الموارد البشرية</h1>
            <p className="text-blue-100">
              تابع طلباتك واستلم الإشعارات في الوقت الفعلي
            </p>
          </div>
          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
                <Bell className="w-5 h-5" />
                <span className="font-semibold">{unreadCount} إشعار جديد</span>
              </div>
            )}
            <Activity className="w-12 h-12 text-blue-200" />
          </div>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">إجمالي الطلبات</p>
                <p className="text-2xl font-bold">{stats.totalRequests}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">قيد المراجعة</p>
                <p className="text-2xl font-bold">{stats.pendingRequests}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">موافق عليها</p>
                <p className="text-2xl font-bold">{stats.approvedRequests}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">مرفوضة</p>
                <p className="text-2xl font-bold">{stats.rejectedRequests}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* مركز الإشعارات */}
        <NotificationCenter />

        {/* أحدث الطلبات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              أحدث الطلبات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requests.length > 0 ? requests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-sm">
                      {request.type === 'vacation' ? 'طلب إجازة' :
                       request.type === 'work-certificate' ? 'شهادة عمل' :
                       request.type === 'mission-order' ? 'أمر مهمة' : request.type}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(request.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <Badge
                    className={
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }
                  >
                    {request.status === 'pending' ? 'قيد المراجعة' :
                     request.status === 'approved' ? 'موافق عليه' : 'مرفوض'}
                  </Badge>
                </div>
              )) : (
                <p className="text-center text-gray-500 py-8">لا توجد طلبات حالياً</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* معلومات إضافية */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">
                تحديثات في الوقت الفعلي
              </h3>
              <p className="text-blue-600 text-sm">
                ستتلقى إشعارات فورية عند تغيير حالة طلباتك. 
                {unreadCount > 0 && ` لديك ${unreadCount} إشعار جديد لم تقرأه بعد.`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
