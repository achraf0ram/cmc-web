
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, ClipboardCheck, Calendar, User, TrendingUp, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const Dashboard = () => {
  const { t } = useLanguage();
  const { profile, user } = useAuth();

  const stats = [
    {
      title: "إجمالي الطلبات",
      value: "12",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "الطلبات المعتمدة",
      value: "8",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "قيد المراجعة",
      value: "3",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "مرفوضة",
      value: "1",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  const quickActions = [
    {
      title: "شهادة عمل",
      description: "طلب شهادة عمل جديدة",
      icon: FileText,
      path: "/work-certificate",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "أمر مهمة",
      description: "إنشاء أمر مهمة جديد",
      icon: ClipboardCheck,
      path: "/mission-order",
      color: "from-green-500 to-green-600"
    },
    {
      title: "طلب إجازة",
      description: "تقديم طلب إجازة",
      icon: Calendar,
      path: "/vacation-request",
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            لوحة التحكم
          </h1>
          <p className="text-slate-600">
            مرحباً {profile?.full_name || user?.email || "بك"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg">
            <CardTitle className="text-xl font-semibold text-center">
              الإجراءات السريعة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.path}>
                  <Card className="h-full cursor-pointer hover:shadow-lg transition-all duration-300 border border-slate-200 hover:border-slate-300">
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">
                        {action.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg">
            <CardTitle className="text-xl font-semibold text-center">
              الطلبات الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[
                { type: "شهادة عمل", date: "2024-01-15", status: "معتمد", statusColor: "text-green-600 bg-green-50" },
                { type: "أمر مهمة", date: "2024-01-12", status: "قيد المراجعة", statusColor: "text-yellow-600 bg-yellow-50" },
                { type: "طلب إجازة", date: "2024-01-10", status: "معتمد", statusColor: "text-green-600 bg-green-50" }
              ].map((request, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <FileText className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-800">{request.type}</p>
                      <p className="text-sm text-slate-600">{request.date}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${request.statusColor}`}>
                    {request.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
