
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Eye, Clock, FileText } from "lucide-react";
import { useRequests } from "@/hooks/useRequests";
import { format } from "date-fns";

export const AdminRequestsManagement = () => {
  const { allRequests, allRequestsLoading, updateRequestStatus } = useRequests();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'معلق', variant: 'secondary' as const, icon: Clock },
      approved: { label: 'موافق عليه', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'مرفوض', variant: 'destructive' as const, icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getRequestTypeLabel = (type: string) => {
    const types = {
      vacation: 'طلب إجازة',
      'work-certificate': 'شهادة عمل',
      'mission-order': 'أمر مهمة',
    };
    return types[type as keyof typeof types] || type;
  };

  const handleApprove = async (requestId: string) => {
    await updateRequestStatus.mutateAsync({
      requestId,
      status: 'approved',
      adminNotes,
    });
    setAdminNotes('');
    setSelectedRequest(null);
  };

  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      return;
    }
    await updateRequestStatus.mutateAsync({
      requestId,
      status: 'rejected',
      adminNotes,
      rejectionReason,
    });
    setAdminNotes('');
    setRejectionReason('');
    setSelectedRequest(null);
  };

  if (allRequestsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                <p className="text-2xl font-bold">{allRequests?.length || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">طلبات معلقة</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {allRequests?.filter(r => r.status === 'pending').length || 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">طلبات موافق عليها</p>
                <p className="text-2xl font-bold text-green-600">
                  {allRequests?.filter(r => r.status === 'approved').length || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إدارة الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allRequests?.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{getRequestTypeLabel(request.type)}</h3>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(request.submitted_at), 'dd/MM/yyyy HH:mm')}
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  <p><strong>المستخدم:</strong> {request.profiles?.full_name || 'غير محدد'}</p>
                  <p><strong>البريد الإلكتروني:</strong> {request.profiles?.email || 'غير محدد'}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        عرض التفاصيل
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>تفاصيل الطلب - {getRequestTypeLabel(request.type)}</DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">الحالة:</label>
                            <div className="mt-1">{getStatusBadge(request.status)}</div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">تاريخ التقديم:</label>
                            <p className="mt-1 text-sm">{format(new Date(request.submitted_at), 'dd/MM/yyyy HH:mm')}</p>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">بيانات الطلب:</label>
                          <pre className="mt-1 p-3 bg-gray-100 rounded text-sm overflow-auto">
                            {JSON.stringify(request.data, null, 2)}
                          </pre>
                        </div>

                        {request.status === 'pending' && (
                          <div className="space-y-4 border-t pt-4">
                            <div>
                              <label className="text-sm font-medium text-gray-700">ملاحظات إدارية:</label>
                              <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="إضافة ملاحظات..."
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-700">سبب الرفض (في حالة الرفض):</label>
                              <Textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="سبب رفض الطلب..."
                                className="mt-1"
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleApprove(request.id)}
                                className="bg-green-600 hover:bg-green-700"
                                disabled={updateRequestStatus.isPending}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                موافقة
                              </Button>
                              <Button
                                onClick={() => handleReject(request.id)}
                                variant="destructive"
                                disabled={updateRequestStatus.isPending || !rejectionReason.trim()}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                رفض
                              </Button>
                            </div>
                          </div>
                        )}

                        {request.admin_notes && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">الملاحظات الإدارية:</label>
                            <p className="mt-1 p-3 bg-blue-50 rounded text-sm">{request.admin_notes}</p>
                          </div>
                        )}

                        {request.rejection_reason && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">سبب الرفض:</label>
                            <p className="mt-1 p-3 bg-red-50 rounded text-sm">{request.rejection_reason}</p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {request.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={updateRequestStatus.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        موافقة سريعة
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {!allRequests?.length && (
              <div className="text-center py-8 text-gray-500">
                لا توجد طلبات حالياً
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
