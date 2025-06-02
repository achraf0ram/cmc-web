
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, Calendar, CheckCircle, Settings, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Dashboard = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();

  const stats = [
    {
      title: t('pendingRequests'),
      value: '5',
      description: t('awaitingApproval'),
      icon: Calendar,
      color: 'from-cmc-blue to-cmc-blue-dark'
    },
    {
      title: t('approvedRequests'),
      value: '12',
      description: t('thisMonth'),
      icon: CheckCircle,
      color: 'from-cmc-green to-emerald-600'
    },
    {
      title: t('vacationDays'),
      value: '15',
      description: t('remaining'),
      icon: BarChart3,
      color: 'from-cmc-blue to-cmc-green'
    },
  ];

  const notifications = [
    {
      id: 1,
      title: "تم الموافقة على طلب الإجازة",
      time: "منذ ساعتين",
      type: "success"
    },
    {
      id: 2,
      title: "تم إصدار شهادة العمل",
      time: "منذ 3 ساعات",
      type: "info"
    },
    {
      id: 3,
      title: "تذكير: تحديث البيانات الشخصية",
      time: "منذ يوم",
      type: "warning"
    }
  ];

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-cmc-blue-light to-cmc-green-light rounded-full mb-4 shadow-lg">
            <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-cmc-blue" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">{t('dashboard')}</h1>
          <p className="text-slate-600 text-sm md:text-base">
            مرحباً {profile?.full_name || 'بك'} - لوحة التحكم الرئيسية
          </p>
        </div>

        {/* User Profile Quick Info */}
        <Card className="cmc-card mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cmc-blue to-cmc-green rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {profile?.full_name?.charAt(0) || 'M'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{profile?.full_name || 'المستخدم'}</h3>
                  <p className="text-sm text-slate-600">{profile?.email || 'البريد الإلكتروني'}</p>
                </div>
              </div>
              <Link to="/settings">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  تعديل البيانات
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats Cards */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3 mb-6 md:mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="cmc-card">
              <CardHeader className={`bg-gradient-to-r ${stat.color} text-white rounded-t-lg p-4 md:p-6`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg font-semibold">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">{stat.value}</div>
                <p className="text-xs md:text-sm text-slate-600">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Notifications Section */}
        <Card className="cmc-card mb-6">
          <CardHeader className="cmc-gradient text-white rounded-t-lg p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl font-semibold text-center flex items-center justify-center gap-2">
              <Bell className="w-5 h-5 md:w-6 md:h-6" />
              الإشعارات الحديثة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      notification.type === 'success' ? 'bg-green-500' :
                      notification.type === 'info' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-slate-800">{notification.title}</p>
                      <p className="text-xs text-slate-500">{notification.time}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    جديد
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="cmc-card">
          <CardHeader className="cmc-gradient text-white rounded-t-lg p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl font-semibold text-center">
              الإجراءات السريعة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-8">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <Link to="/vacation-request" className="block">
                <div className="text-center p-4 md:p-6 bg-gradient-to-br from-cmc-blue-light/50 to-cmc-blue-light/30 rounded-lg border border-cmc-blue/20 hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <Calendar className="w-10 h-10 md:w-12 md:h-12 text-cmc-blue mx-auto mb-3 md:mb-4" />
                  <h3 className="font-semibold text-slate-800 mb-2 text-sm md:text-base">طلب إجازة جديد</h3>
                  <p className="text-xs md:text-sm text-slate-600">تقديم طلب إجازة سنوية أو مرضية</p>
                </div>
              </Link>
              <Link to="/work-certificate" className="block">
                <div className="text-center p-4 md:p-6 bg-gradient-to-br from-cmc-green-light/50 to-cmc-green-light/30 rounded-lg border border-cmc-green/20 hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-cmc-green mx-auto mb-3 md:mb-4" />
                  <h3 className="font-semibold text-slate-800 mb-2 text-sm md:text-base">شهادة عمل</h3>
                  <p className="text-xs md:text-sm text-slate-600">طلب شهادة عمل أو راتب</p>
                </div>
              </Link>
              <Link to="/mission-order" className="block">
                <div className="text-center p-4 md:p-6 bg-gradient-to-br from-emerald-100/50 to-emerald-50/30 rounded-lg border border-emerald-200/50 hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <BarChart3 className="w-10 h-10 md:w-12 md:h-12 text-emerald-600 mx-auto mb-3 md:mb-4" />
                  <h3 className="font-semibold text-slate-800 mb-2 text-sm md:text-base">أمر مهمة</h3>
                  <p className="text-xs md:text-sm text-slate-600">تقديم طلب أمر مهمة</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
