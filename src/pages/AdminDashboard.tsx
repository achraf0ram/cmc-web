
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  FileText, 
  BarChart3,
  Calendar,
  AlertCircle
} from "lucide-react";
import { useState } from "react";

interface Request {
  id: string;
  type: 'vacation' | 'certificate' | 'mission';
  employeeName: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  details: string;
}

const AdminDashboard = () => {
  const { t } = useLanguage();
  
  // Mock data - في التطبيق الحقيقي سيتم جلب البيانات من قاعدة البيانات
  const [requests, setRequests] = useState<Request[]>([
    {
      id: '1',
      type: 'vacation',
      employeeName: 'أحمد محمد',
      requestDate: '2024-01-15',
      status: 'pending',
      details: 'إجازة سنوية لمدة 5 أيام'
    },
    {
      id: '2', 
      type: 'certificate',
      employeeName: 'فاطمة علي',
      requestDate: '2024-01-14',
      status: 'pending',
      details: 'شهادة عمل للبنك'
    },
    {
      id: '3',
      type: 'mission',
      employeeName: 'محمد حسن',
      requestDate: '2024-01-13',
      status: 'approved',
      details: 'مهمة عمل إلى الرباط'
    }
  ]);

  const stats = {
    totalRequests: requests.length,
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    approvedRequests: requests.filter(r => r.status === 'approved').length,
    rejectedRequests: requests.filter(r => r.status === 'rejected').length
  };

  const handleApprove = (id: string) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'approved' as const } : req
    ));
  };

  const handleReject = (id: string) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'rejected' as const } : req
    ));
  };

  const getRequestTypeLabel = (type: string) => {
    switch(type) {
      case 'vacation': return 'طلب إجازة';
      case 'certificate': return 'شهادة عمل';
      case 'mission': return 'أمر مهمة';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">قيد الانتظار</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600">موافق عليه</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600">مرفوض</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-cmc-blue-light to-cmc-green-light rounded-full mb-4 shadow-lg">
            <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-cmc-blue" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">لوحة تحكم الأدمن</h1>
          <p className="text-slate-600 text-sm md:text-base">إدارة الطلبات والموافقات</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-4 mb-6 md:mb-8">
          <Card className="cmc-card">
            <CardHeader className="bg-gradient-to-r from-cmc-blue to-cmc-blue-dark text-white rounded-t-lg p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">إجمالي الطلبات</CardTitle>
                <FileText className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-slate-800">{stats.totalRequests}</div>
            </CardContent>
          </Card>

          <Card className="cmc-card">
            <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-t-lg p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">قيد الانتظار</CardTitle>
                <Clock className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-slate-800">{stats.pendingRequests}</div>
            </CardContent>
          </Card>

          <Card className="cmc-card">
            <CardHeader className="bg-gradient-to-r from-cmc-green to-emerald-600 text-white rounded-t-lg p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">موافق عليها</CardTitle>
                <CheckCircle className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-slate-800">{stats.approvedRequests}</div>
            </CardContent>
          </Card>

          <Card className="cmc-card">
            <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">مرفوضة</CardTitle>
                <XCircle className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-slate-800">{stats.rejectedRequests}</div>
            </CardContent>
          </Card>
        </div>

        {/* Requests Management */}
        <Card className="cmc-card">
          <CardHeader className="cmc-gradient text-white rounded-t-lg p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl font-semibold">
              إدارة الطلبات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          {request.type === 'vacation' && <Calendar className="w-4 h-4 text-cmc-blue" />}
                          {request.type === 'certificate' && <FileText className="w-4 h-4 text-cmc-green" />}
                          {request.type === 'mission' && <Users className="w-4 h-4 text-emerald-600" />}
                          <span className="font-semibold text-slate-800">
                            {getRequestTypeLabel(request.type)}
                          </span>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="text-sm text-slate-600 mb-1">
                        <strong>الموظف:</strong> {request.employeeName}
                      </div>
                      <div className="text-sm text-slate-600 mb-1">
                        <strong>تاريخ الطلب:</strong> {request.requestDate}
                      </div>
                      <div className="text-sm text-slate-600">
                        <strong>التفاصيل:</strong> {request.details}
                      </div>
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-cmc-green hover:bg-cmc-green/90"
                          onClick={() => handleApprove(request.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          موافقة
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleReject(request.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          رفض
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Section */}
        <div className="mt-6 md:mt-8">
          <Card className="cmc-card">
            <CardHeader className="cmc-gradient text-white rounded-t-lg p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl font-semibold">
                التحليلات والإحصائيات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div className="text-center p-4 bg-gradient-to-br from-cmc-blue-light/50 to-cmc-blue-light/30 rounded-lg border border-cmc-blue/20">
                  <AlertCircle className="w-8 h-8 text-cmc-blue mx-auto mb-2" />
                  <h3 className="font-semibold text-slate-800 mb-1">معدل الموافقة</h3>
                  <p className="text-2xl font-bold text-cmc-blue">
                    {stats.totalRequests > 0 ? Math.round((stats.approvedRequests / stats.totalRequests) * 100) : 0}%
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-cmc-green-light/50 to-cmc-green-light/30 rounded-lg border border-cmc-green/20">
                  <BarChart3 className="w-8 h-8 text-cmc-green mx-auto mb-2" />
                  <h3 className="font-semibold text-slate-800 mb-1">الطلبات الشهرية</h3>
                  <p className="text-2xl font-bold text-cmc-green">{stats.totalRequests}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-emerald-100/50 to-emerald-50/30 rounded-lg border border-emerald-200/50">
                  <Clock className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-slate-800 mb-1">متوسط وقت الرد</h3>
                  <p className="text-2xl font-bold text-emerald-600">2.5 يوم</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
