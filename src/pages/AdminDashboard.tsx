
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Shield } from 'lucide-react';
import { HRDashboard } from '@/components/admin/HRDashboard';

const AdminDashboard = () => {
  const { isAdmin, user } = useAuth();

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

  // عرض منصة الموارد البشرية للمدير
  return <HRDashboard />;
};

export default AdminDashboard;
