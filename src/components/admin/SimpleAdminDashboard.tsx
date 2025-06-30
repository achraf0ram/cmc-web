
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Activity,
  Download,
  Image,
  FileIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MetricsCard } from '@/components/admin/MetricsCard';

interface Request {
  id: string;
  type: string;
  status: string;
  data: any;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
    email: string;
  };
  request_attachments?: {
    id: string;
    file_name: string;
    file_url: string;
    file_type: string;
    file_size: number;
  }[];
}

interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  totalUsers: number;
  newUsersThisWeek: number;
}

export const SimpleAdminDashboard: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    totalUsers: 0,
    newUsersThisWeek: 0
  });
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // جلب الطلبات المعلقة مع بيانات المستخدمين والملفات المرفقة
      const { data: requestsData, error: requestsError } = await supabase
        .from('requests')
        .select(`
          *,
          request_attachments (
            id,
            file_name,
            file_url,
            file_type,
            file_size
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);

      if (requestsError) throw requestsError;

      // جلب بيانات المستخدمين
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email');

      if (profilesError) throw profilesError;

      // ربط الطلبات بالمستخدمين
      const requestsWithProfiles = requestsData?.map(request => {
        const profile = profilesData?.find(p => p.id === request.user_id);
        return {
          ...request,
          profiles: profile ? {
            full_name: profile.full_name || 'غير محدد',
            email: profile.email || ''
          } : undefined
        };
      }) || [];

      setRequests(requestsWithProfiles);

      // حساب الإحصائيات
      const { data: allRequests } = await supabase
        .from('requests')
        .select('id, status');

      const { data: allUsers } = await supabase
        .from('profiles')
        .select('id, created_at');

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const newUsersThisWeek = allUsers?.filter(user => 
        new Date(user.created_at) > weekAgo
      ).length || 0;

      setStats({
        totalRequests: allRequests?.length || 0,
        pendingRequests: allRequests?.filter(r => r.status === 'pending').length || 0,
        totalUsers: allUsers?.length || 0,
        newUsersThisWeek
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل بيانات لوحة التحكم',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectionReason.trim()) {
      toast({
        title: 'خطأ',
        description: 'يجب كتابة سبب الرفض',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const updateData: any = {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      if (action === 'reject' && rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      if (action === 'approve') {
        updateData.approval_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: action === 'approve' ? 'تم الموافقة على الطلب' : 'تم رفض الطلب',
        description: action === 'approve' 
          ? 'تم الموافقة على الطلب بنجاح'
          : 'تم رفض الطلب بنجاح',
      });

      setSelectedRequest(null);
      setAdminNotes('');
      setRejectionReason('');
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تحديث الطلب',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'vacation': 'طلب إجازة',
      'work-certificate': 'شهادة عمل',
      'mission-order': 'أمر مهمة',
      'salary-domiciliation': 'شهادة راتب',
      'annual-income': 'شهادة دخل سنوي'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    return <FileIcon className="w-4 h-4" />;
  };

  const metricsData = [
    {
      title: 'إجمالي الطلبات',
      value: stats.totalRequests,
      icon: FileText,
      description: 'العدد الكلي للطلبات'
    },
    {
      title: 'الطلبات المعلقة',
      value: stats.pendingRequests,
      icon: Clock,
      description: 'طلبات تحتاج للمراجعة'
    },
    {
      title: 'إجمالي المستخدمين',
      value: stats.totalUsers,
      icon: Users,
      description: 'عدد المستخدمين المسجلين'
    },
    {
      title: 'المستخدمون الجدد',
      value: stats.newUsersThisWeek,
      icon: Activity,
      description: 'مستخدمين جدد هذا الأسبوع'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* بطاقات المقاييس */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* الطلبات المعلقة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            الطلبات المعلقة ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <div 
                  key={request.id} 
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <h3 className="font-semibold">{getTypeLabel(request.type)}</h3>
                        <Badge variant="secondary">معلق</Badge>
                        {request.request_attachments && request.request_attachments.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {request.request_attachments.length} ملف مرفق
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>المستخدم: {request.profiles?.full_name || 'غير محدد'}</p>
                        <p>التاريخ: {new Date(request.created_at).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        عرض
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                        onClick={() => handleRequestAction(request.id, 'approve')}
                        disabled={isProcessing}
                      >
                        <CheckCircle className="w-4 h-4" />
                        موافقة
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setRejectionReason('');
                        }}
                        disabled={isProcessing}
                        className="flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        رفض
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
              <p className="text-lg font-medium">لا توجد طلبات معلقة</p>
              <p className="text-sm">جميع الطلبات تم التعامل معها</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* نافذة تفاصيل الطلب */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              تفاصيل {selectedRequest ? getTypeLabel(selectedRequest.type) : ''}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">المستخدم:</label>
                  <p>{selectedRequest.profiles?.full_name || 'غير محدد'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">البريد الإلكتروني:</label>
                  <p>{selectedRequest.profiles?.email || 'غير محدد'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">النوع:</label>
                  <p>{getTypeLabel(selectedRequest.type)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">التاريخ:</label>
                  <p>{new Date(selectedRequest.created_at).toLocaleDateString('ar-SA')}</p>
                </div>
              </div>

              {/* عرض الملفات المرفقة */}
              {selectedRequest.request_attachments && selectedRequest.request_attachments.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">الملفات المرفقة:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRequest.request_attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center gap-2 p-2 border rounded">
                        {getFileIcon(attachment.file_type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                          <p className="text-xs text-gray-500">
                            {(attachment.file_size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(attachment.file_url, '_blank')}
                          className="flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          عرض
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">تفاصيل الطلب:</label>
                <div className="bg-gray-100 p-3 rounded text-sm mt-1">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(selectedRequest.data, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div>
                  <label className="text-sm font-medium">ملاحظات إدارية (اختياري):</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="أضف ملاحظات للطلب..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">سبب الرفض (مطلوب في حالة الرفض):</label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="اكتب سبب الرفض..."
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={() => handleRequestAction(selectedRequest.id, 'approve')}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 ml-1" />
                    موافقة
                  </Button>
                  <Button
                    onClick={() => handleRequestAction(selectedRequest.id, 'reject')}
                    disabled={isProcessing || !rejectionReason.trim()}
                    variant="destructive"
                  >
                    <XCircle className="w-4 h-4 ml-1" />
                    رفض
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
