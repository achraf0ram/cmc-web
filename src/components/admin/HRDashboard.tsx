
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  BarChart3, 
  Bell, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  Settings
} from 'lucide-react';
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminRequestsTable } from '@/components/admin/AdminRequestsTable';
import { UsersTable } from '@/components/admin/UsersTable';
import { AdminNotifications } from '@/components/admin/AdminNotifications';
import { AdminActions } from '@/components/admin/AdminActions';
import { useAdminData } from '@/hooks/useAdminData';

export const HRDashboard: React.FC = () => {
  const { requests, users, stats, isLoading, error, refreshData } = useAdminData();
  const [activeTab, setActiveTab] = useState('overview');

  // إحصائيات سريعة للعرض
  const quickStats = {
    pendingToday: requests.filter(r => {
      const today = new Date().toDateString();
      return r.status === 'pending' && new Date(r.created_at).toDateString() === today;
    }).length,
    newUsersThisWeek: users.filter(u => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(u.created_at) > weekAgo;
    }).length,
    urgentRequests: requests.filter(r => r.priority === 'urgent' && r.status === 'pending').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">جاري تحميل لوحة الموارد البشرية...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-16 w-16 text-red-400 mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">خطأ في تحميل البيانات</h2>
            <p className="text-gray-500 text-center mb-4">{error}</p>
            <Button onClick={refreshData} className="bg-blue-600 hover:bg-blue-700">
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              منصة إدارة الموارد البشرية - CMC
            </h1>
            <p className="text-gray-600">
              مركز التحكم الشامل لإدارة الموظفين والطلبات والإشعارات
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={refreshData} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              تحديث البيانات
            </Button>
          </div>
        </div>
      </div>

      {/* إجراءات إدارية سريعة */}
      <AdminActions onRefresh={refreshData} stats={stats} />

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">طلبات اليوم المعلقة</p>
                <p className="text-3xl font-bold">{quickStats.pendingToday}</p>
              </div>
              <Clock className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">مستخدمين جدد هذا الأسبوع</p>
                <p className="text-3xl font-bold">{quickStats.newUsersThisWeek}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">طلبات عاجلة</p>
                <p className="text-3xl font-bold">{quickStats.urgentRequests}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الإحصائيات التفصيلية */}
      <AdminStats
        totalUsers={stats.totalUsers}
        totalRequests={stats.totalRequests}
        pendingRequests={stats.pendingRequests}
        approvedRequests={stats.approvedRequests}
        rejectedRequests={stats.rejectedRequests}
      />

      {/* التبويبات الرئيسية */}
      <Card className="shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b">
            <TabsList className="w-full h-12 bg-gray-50 p-1">
              <TabsTrigger 
                value="overview" 
                className="flex-1 flex items-center gap-2 data-[state=active]:bg-white"
              >
                <BarChart3 className="w-4 h-4" />
                لوحة المعلومات
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="flex-1 flex items-center gap-2 data-[state=active]:bg-white"
              >
                <Bell className="w-4 h-4" />
                مركز الإشعارات
              </TabsTrigger>
              <TabsTrigger 
                value="requests" 
                className="flex-1 flex items-center gap-2 data-[state=active]:bg-white"
              >
                <FileText className="w-4 h-4" />
                إدارة الطلبات ({stats.totalRequests})
              </TabsTrigger>
              <TabsTrigger 
                value="employees" 
                className="flex-1 flex items-center gap-2 data-[state=active]:bg-white"
              >
                <Users className="w-4 h-4" />
                إدارة الموظفين ({stats.totalUsers})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* أحدث الطلبات */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    أحدث الطلبات المقدمة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {requests.length > 0 ? requests.slice(0, 6).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-sm">
                            {request.profiles?.full_name || 'مستخدم غير معروف'}
                          </p>
                          <p className="text-xs text-gray-600">
                            {request.type === 'vacation' ? 'طلب إجازة' : 
                             request.type === 'work-certificate' ? 'شهادة عمل' : 
                             request.type === 'mission-order' ? 'أمر مهمة' : request.type}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {request.status === 'pending' ? 'معلق' :
                             request.status === 'approved' ? 'موافق' : 'مرفوض'}
                          </span>
                        </div>
                      </div>
                    )) : (
                      <p className="text-center text-gray-500 py-8">لا توجد طلبات حالياً</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* أحدث الموظفين */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    أحدث الموظفين المسجلين
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users.length > 0 ? users.slice(0, 6).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-sm">
                            {user.full_name || 'مستخدم غير معروف'}
                          </p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    )) : (
                      <p className="text-center text-gray-500 py-8">لا يوجد موظفون مسجلون حالياً</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="p-6">
            <AdminNotifications />
          </TabsContent>

          <TabsContent value="requests" className="p-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  إدارة جميع الطلبات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AdminRequestsTable 
                  requests={requests}
                  onRequestUpdate={refreshData}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="p-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  إدارة جميع الموظفين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UsersTable users={users} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
