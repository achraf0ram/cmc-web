
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  FileText, 
  Users, 
  TrendingUp, 
  Download,
  Eye,
  LogOut,
  AlertTriangle 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { MetricsCard } from '@/components/admin/MetricsCard';
import { AdminRequestsAnalytics } from '@/components/admin/AdminRequestsAnalytics';

interface AnalyticsData {
  total_requests: number;
  requests_by_type: Record<string, number>;
  requests_by_status: Record<string, number>;
  requests_with_attachments: number;
  total_attachments: number;
  users_with_requests: number;
  avg_processing_time: number;
}

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // التحقق من تسجيل دخول الأدمن
  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn');
    const adminEmail = localStorage.getItem('adminEmail');
    
    if (!isAdminLoggedIn || adminEmail !== 'cmc.rh.ram@gmail.com') {
      navigate('/admin-login');
      return;
    }
    
    fetchAnalyticsData();
  }, [navigate]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_admin_analytics');
      
      if (error) {
        console.error('Error fetching analytics:', error);
        setError('فشل في تحميل بيانات التحليل');
        return;
      }
      
      // تحويل البيانات إلى النوع المطلوب
      const parsedData: AnalyticsData = {
        total_requests: data.total_requests || 0,
        requests_by_type: data.requests_by_type || {},
        requests_by_status: data.requests_by_status || {},
        requests_with_attachments: data.requests_with_attachments || 0,
        total_attachments: data.total_attachments || 0,
        users_with_requests: data.users_with_requests || 0,
        avg_processing_time: data.avg_processing_time || 0
      };
      
      setAnalyticsData(parsedData);
    } catch (error) {
      console.error('Analytics fetch error:', error);
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminEmail');
    navigate('/admin-login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">جاري تحميل بيانات التحليل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-16 w-16 text-red-400 mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">خطأ في تحميل البيانات</h2>
            <p className="text-gray-500 text-center mb-4">{error}</p>
            <Button onClick={fetchAnalyticsData} className="bg-blue-600 hover:bg-blue-700">
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metricsData = analyticsData ? [
    {
      title: 'إجمالي الطلبات',
      value: analyticsData.total_requests,
      icon: FileText,
      description: 'العدد الكلي للطلبات في النظام'
    },
    {
      title: 'المستخدمون النشطون',
      value: analyticsData.users_with_requests,
      icon: Users,
      description: 'عدد المستخدمين الذين قدموا طلبات'
    },
    {
      title: 'الطلبات مع مرفقات',
      value: analyticsData.requests_with_attachments,
      icon: Download,
      description: 'عدد الطلبات التي تحتوي على ملفات مرفقة'
    },
    {
      title: 'متوسط وقت المعالجة',
      value: `${analyticsData.avg_processing_time.toFixed(1)} ساعة`,
      icon: TrendingUp,
      description: 'متوسط الوقت لمعالجة الطلبات'
    }
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              منصة التحليل الإداري المتقدم
            </h1>
            <p className="text-gray-600">
              تحليل شامل للطلبات والمستخدمين والملفات المرفقة
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={fetchAnalyticsData} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              تحديث البيانات
            </Button>
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

      {/* بطاقات المقاييس */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {metricsData.map((metric, index) => (
          <MetricsCard
            key={index}
            title={metric.title}
            value={metric.value}
            description={metric.description}
            icon={metric.icon}
          />
        ))}
      </div>

      {/* جدول التحليل التفصيلي */}
      <AdminRequestsAnalytics />
    </div>
  );
};

export default AdminAnalytics;
