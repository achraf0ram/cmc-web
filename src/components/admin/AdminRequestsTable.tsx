
import React, { useState } from 'react';
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
import { CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Request {
  id: string;
  type: string;
  status: string;
  data: any;
  created_at: string;
  user_id: string;
  admin_notes?: string;
  rejection_reason?: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface AdminRequestsTableProps {
  requests: Request[];
  onRequestUpdate: () => void;
}

export const AdminRequestsTable: React.FC<AdminRequestsTableProps> = ({
  requests,
  onRequestUpdate
}) => {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      pending: 'معلق',
      approved: 'موافق عليه',
      rejected: 'مرفوض'
    };

    return (
      <Badge className={styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'vacation': 'طلب إجازة',
      'work-certificate': 'شهادة عمل',
      'mission-order': 'أمر مهمة'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    setIsProcessing(true);
    try {
      const updateData: any = {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getUser()).data.user?.id,
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
      onRequestUpdate();
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

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {requests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{getTypeLabel(request.type)}</h3>
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-sm text-gray-600">
                    المستخدم: {request.profiles?.full_name || 'غير محدد'}
                  </p>
                  <p className="text-sm text-gray-500">
                    تاريخ التقديم: {new Date(request.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <Eye className="w-4 h-4 ml-1" />
                    عرض
                  </Button>
                  {request.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleRequestAction(request.id, 'approve')}
                        disabled={isProcessing}
                      >
                        <CheckCircle className="w-4 h-4 ml-1" />
                        موافقة
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          setSelectedRequest(request);
                        }}
                        disabled={isProcessing}
                      >
                        <XCircle className="w-4 h-4 ml-1" />
                        رفض
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
                  <label className="text-sm font-medium">الحالة:</label>
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">تفاصيل الطلب:</label>
                <pre className="bg-gray-100 p-3 rounded text-sm mt-1 whitespace-pre-wrap">
                  {JSON.stringify(selectedRequest.data, null, 2)}
                </pre>
              </div>

              {selectedRequest.admin_notes && (
                <div>
                  <label className="text-sm font-medium">ملاحظات الأدمن:</label>
                  <p className="bg-blue-50 p-3 rounded mt-1">{selectedRequest.admin_notes}</p>
                </div>
              )}

              {selectedRequest.rejection_reason && (
                <div>
                  <label className="text-sm font-medium">سبب الرفض:</label>
                  <p className="bg-red-50 p-3 rounded mt-1">{selectedRequest.rejection_reason}</p>
                </div>
              )}

              {selectedRequest.status === 'pending' && (
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
                    <label className="text-sm font-medium">سبب الرفض (في حالة الرفض):</label>
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
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
