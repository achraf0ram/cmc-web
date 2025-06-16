
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, FileText, Calendar, MapPin } from "lucide-react";
import { useRequests } from "@/hooks/useRequests";
import { format } from "date-fns";

export const UserRequestsStatus = () => {
  const { userRequests, userRequestsLoading } = useRequests();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'معلق', variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      approved: { label: 'موافق عليه', variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      rejected: { label: 'مرفوض', variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
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

  const getRequestTypeIcon = (type: string) => {
    const icons = {
      vacation: Calendar,
      'work-certificate': FileText,
      'mission-order': MapPin,
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const getRequestTypeLabel = (type: string) => {
    const types = {
      vacation: 'طلب إجازة',
      'work-certificate': 'شهادة عمل',
      'mission-order': 'أمر مهمة',
    };
    return types[type as keyof typeof types] || type;
  };

  if (userRequestsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">جاري تحميل طلباتك...</p>
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
                <p className="text-sm text-gray-600">إجمالي طلباتك</p>
                <p className="text-2xl font-bold">{userRequests?.length || 0}</p>
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
                  {userRequests?.filter(r => r.status === 'pending').length || 0}
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
                  {userRequests?.filter(r => r.status === 'approved').length || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>حالة طلباتك</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userRequests?.map((request) => {
              const Icon = getRequestTypeIcon(request.type);
              
              return (
                <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold">{getRequestTypeLabel(request.type)}</h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(request.submitted_at), 'dd/MM/yyyy HH:mm')}
                    </div>
                  </div>

                  {request.status === 'approved' && request.approval_date && (
                    <div className="mb-2 p-3 bg-green-50 border border-green-200 rounded">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">تم الموافقة على طلبك</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        تاريخ الموافقة: {format(new Date(request.approval_date), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                  )}

                  {request.status === 'rejected' && request.rejection_reason && (
                    <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded">
                      <div className="flex items-center gap-2 text-red-700 mb-2">
                        <XCircle className="w-4 h-4" />
                        <span className="font-medium">تم رفض طلبك</span>
                      </div>
                      <p className="text-sm text-red-600">
                        <strong>سبب الرفض:</strong> {request.rejection_reason}
                      </p>
                    </div>
                  )}

                  {request.admin_notes && (
                    <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-blue-700">
                        <strong>ملاحظات إدارية:</strong> {request.admin_notes}
                      </p>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="flex items-center gap-2 text-yellow-700">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">طلبك قيد المراجعة، سيتم التواصل معك قريباً</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {!userRequests?.length && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>لم تقم بتقديم أي طلبات بعد</p>
                <p className="text-sm">يمكنك تقديم طلب جديد من القائمة الجانبية</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
