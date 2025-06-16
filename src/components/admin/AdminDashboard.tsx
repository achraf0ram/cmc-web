
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Building2, Settings, Activity, Bell, BarChart3, FileText } from "lucide-react";
import { useCurrentUserRole } from "@/hooks/useUserRoles";
import { UsersManagement } from "./UsersManagement";
import { DepartmentsManagement } from "./DepartmentsManagement";
import { SystemSettingsPanel } from "./SystemSettingsPanel";
import { ActivityLogsPanel } from "./ActivityLogsPanel";
import { AdminRequestsManagement } from "./AdminRequestsManagement";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const AdminDashboard = () => {
  const { data: userRoles } = useCurrentUserRole();
  const navigate = useNavigate();
  
  const hasAdminRole = userRoles?.some(r => r.role === 'admin');
  const hasHRRole = userRoles?.some(r => r.role === 'hr');
  
  if (!hasAdminRole && !hasHRRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-red-500 mb-4">
          <Users className="w-16 h-16 mx-auto mb-2" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">غير مصرح لك بالوصول</h2>
        <p className="text-gray-600 mb-4">تحتاج إلى صلاحيات إدارية للوصول إلى هذه الصفحة</p>
        <Button onClick={() => navigate('/')}>العودة إلى الرئيسية</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">لوحة التحكم الإدارية</h1>
        <p className="text-gray-600">إدارة النظام والمستخدمين والطلبات والإعدادات</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">+20% من الشهر الماضي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأقسام النشطة</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 أقسام جديدة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الطلبات المعلقة</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">تحتاج مراجعة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">النشاطات اليوم</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">عملية جديدة</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            إدارة الطلبات
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            إدارة المستخدمين
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            الأقسام والمناصب
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            إعدادات النظام
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            سجل النشاطات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <AdminRequestsManagement />
        </TabsContent>

        <TabsContent value="users">
          <UsersManagement />
        </TabsContent>

        <TabsContent value="departments">
          <DepartmentsManagement />
        </TabsContent>

        <TabsContent value="settings">
          <SystemSettingsPanel />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityLogsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};
