
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  FileText, 
  Download, 
  Eye, 
  User,
  Calendar,
  Paperclip,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RequestWithAttachments {
  id: string;
  type: string;
  status: string;
  created_at: string;
  user_name: string;
  user_email: string;
  attachments_count: number;
  attachments: Array<{
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    uploaded_at: string;
  }>;
}

export const AdminRequestsAnalytics: React.FC = () => {
  const [requests, setRequests] = useState<RequestWithAttachments[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'with_attachments' | 'pending'>('all');

  useEffect(() => {
    fetchRequestsData();
  }, []);

  const fetchRequestsData = async () => {
    try {
      setIsLoading(true);
      
      // جلب الطلبات مع بيانات المستخدمين
      const { data: requestsData, error: requestsError } = await supabase
        .from('requests')
        .select(`
          id,
          type,
          status,
          created_at,
          user_id,
          profiles!inner(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('Error fetching requests:', requestsError);
        return;
      }

      // جلب الملفات المرفقة
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from('request_attachments')
        .select('*');

      if (attachmentsError) {
        console.error('Error fetching attachments:', attachmentsError);
      }

      // ربط البيانات
      const processedRequests: RequestWithAttachments[] = requestsData?.map(request => {
        const requestAttachments = attachmentsData?.filter(att => att.request_id === request.id) || [];
        
        return {
          id: request.id,
          type: request.type,
          status: request.status,
          created_at: request.created_at,
          user_name: request.profiles?.full_name || 'غير معروف',
          user_email: request.profiles?.email || '',
          attachments_count: requestAttachments.length,
          attachments: requestAttachments.map(att => ({
            id: att.id,
            file_name: att.file_name,
            file_type: att.file_type,
            file_size: att.file_size || 0,
            uploaded_at: att.uploaded_at
          }))
        };
      }) || [];

      setRequests(processedRequests);
    } catch (error) {
      console.error('Error in fetchRequestsData:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredRequests = () => {
    switch (filter) {
      case 'with_attachments':
        return requests.filter(req => req.attachments_count > 0);
      case 'pending':
        return requests.filter(req => req.status === 'pending');
      default:
        return requests;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'vacation': 'طلب إجازة',
      'work-certificate': 'شهادة عمل',
      'mission-order': 'أمر مهمة',
      'salary-domiciliation': 'شهادة راتب',
      'annual-income': 'شهادة دخل سنوي'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: 'معلق', variant: 'secondary' as const },
      approved: { label: 'موافق', variant: 'default' as const },
      rejected: { label: 'مرفوض', variant: 'destructive' as const }
    };
    
    const statusConfig = config[status as keyof typeof config] || { label: status, variant: 'secondary' as const };
    
    return (
      <Badge variant={statusConfig.variant}>
        {statusConfig.label}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredRequests = getFilteredRequests();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            تحليل تفصيلي للطلبات والملفات
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              جميع الطلبات ({requests.length})
            </Button>
            <Button
              variant={filter === 'with_attachments' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('with_attachments')}
            >
              مع مرفقات ({requests.filter(r => r.attachments_count > 0).length})
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              معلقة ({requests.filter(r => r.status === 'pending').length})
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نوع الطلب</TableHead>
                <TableHead>المستخدم</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead>المرفقات</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length > 0 ? filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      {getTypeLabel(request.type)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-sm">{request.user_name}</p>
                        <p className="text-xs text-gray-500">{request.user_email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(request.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        {new Date(request.created_at).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {request.attachments_count > 0 ? (
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          {request.attachments_count} ملف
                        </span>
                        <div className="text-xs text-gray-500">
                          {request.attachments.map(att => (
                            <div key={att.id} className="truncate max-w-32">
                              {att.file_name} ({formatFileSize(att.file_size)})
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">لا توجد مرفقات</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        عرض
                      </Button>
                      {request.attachments_count > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          تحميل
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    لا توجد طلبات للعرض
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
