
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, FileText, BarChart3, Bell } from 'lucide-react';
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminRequestsTable } from '@/components/admin/AdminRequestsTable';
import { UsersTable } from '@/components/admin/UsersTable';
import { AdminNotifications } from '@/components/admin/AdminNotifications';
import { useAdminData } from '@/hooks/useAdminData';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const { requests, users, stats, isLoading, error, refreshData } = useAdminData();
  const { unreadCount } = useAdminNotifications();
  const [activeTab, setActiveTab] = useState('overview');

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Users className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              غير مصرح لك بالوصول
            </h2>
            <p className="text-gray-500 text-center">
              هذه الصفحة مخصصة للمديرين فقط
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-red-500 mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">خطأ</h2>
            <p className="text-gray-500 text-center">{error}</p>
            <Button onClick={refreshData} className="mt-4">
              <RefreshCw className="w-4 h-4 ml-1" />
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم الأدمن</h1>
          <p className="text-gray-600 mt-1">إدارة المستخدمين والطلبات والإشعارات</p>
        </div>
        <Button onClick={refreshData} variant="outline">
          <RefreshCw className="w-4 h-4 ml-1" />
          تحديث البيانات
        </Button>
      </div>

      <AdminStats
        totalUsers={stats.totalUsers}
        totalRequests={stats.totalRequests}
        pendingRequests={stats.pendingRequests}
        approvedRequests={stats.approvedRequests}
        rejectedRequests={stats.rejectedRequests}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            الإشعارات
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-1">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            الطلبات ({stats.totalRequests})
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            المستخدمين ({stats.totalUsers})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>آخر الطلبات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {requests.slice(0, 5).map((request) => (
                    <div key={request.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{request.profiles?.full_name || 'مستخدم'}</p>
                        <p className="text-sm text-gray-500">
                          {request.type === 'vacation' ? 'طلب إجازة' : 
                           request.type === 'work-certificate' ? 'شهادة عمل' : 
                           request.type === 'mission-order' ? 'أمر مهمة' : request.type}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status === 'pending' ? 'معلق' :
                         request.status === 'approved' ? 'موافق عليه' : 'مرفوض'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>آخر المستخدمين المسجلين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{user.full_name || 'مستخدم'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(user.created_at).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <AdminNotifications />
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إدارة الطلبات</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminRequestsTable 
                requests={requests}
                onRequestUpdate={refreshData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إدارة المستخدمين</CardTitle>
            </CardHeader>
            <CardContent>
              <UsersTable users={users} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
