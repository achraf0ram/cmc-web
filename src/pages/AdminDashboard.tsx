
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { SimpleAdminDashboard } from '@/components/admin/SimpleAdminDashboard';

const AdminDashboard = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // تسجيل الخروج من الحساب
    navigate('/');
  };

  // التحقق من صلاحيات الأدمن
  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Shield className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              يرجى تسجيل الدخول
            </h2>
            <p className="text-gray-500 text-center">
              يجب تسجيل الدخول للوصول إلى منصة الإدارة
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Users className="h-16 w-16 text-red-400 mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              غير مصرح لك بالوصول
            </h2>
            <p className="text-gray-500 text-center">
              هذه الصفحة مخصصة للمديرين فقط. إذا كنت مديراً، يرجى التواصل مع الدعم التقني.
            </p>
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>البريد الإلكتروني الحالي:</strong> {user.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>بريد المدير المطلوب:</strong> cmc.rh.ram@gmail.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // عرض لوحة التحكم البسيطة للمدير
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              لوحة تحكم المدير - CMC
            </h1>
            <p className="text-gray-600">
              مركز التحكم البسيط لإدارة الطلبات والموظفين
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>

      {/* لوحة التحكم البسيطة */}
      <SimpleAdminDashboard />
    </div>
  );
};

export default AdminDashboard;
