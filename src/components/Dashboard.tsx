
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, Calendar, CheckCircle, Settings, Bell, X, TrendingUp, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export const Dashboard = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const { notifications, removeNotification, markAsRead, getUnreadCount } = useNotifications();
  const { pendingRequests, approvedRequests, vacationDaysRemaining, isLoading, error } = useDashboardData();

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return `منذ ${diffDays} يوم`;
  };

  const displayNotifications = notifications.slice(0, 5).map(notif => ({
    id: notif.id,
    title: notif.title,
    message: notif.message,
    time: formatTimeAgo(notif.timestamp),
    type: notif.type,
    read: notif.read
  }));

  const stats = [
    {
      title: 'الطلبات المعلقة',
      value: isLoading ? 0 : pendingRequests,
      description: 'في انتظار المراجعة',
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      trend: '+12%'
    },
    {
      title: 'الطلبات الموافق عليها',
      value: isLoading ? 0 : approvedRequests,
      description: 'هذا الشهر',
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      trend: '+8%'
    },
    {
      title: 'أيام الإجازة المتبقية',
      value: isLoading ? 0 : vacationDaysRemaining,
      description: 'من إجمالي 30 يوم',
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      trend: `${Math.round((vacationDaysRemaining / 30) * 100)}%`
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                مرحباً، {profile?.full_name || 'المستخدم'}
              </h1>
              <p className="text-slate-600 text-lg">إليك ملخص نشاطك اليوم</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-500">اليوم</p>
                <p className="font-semibold text-slate-700">{new Date().toLocaleDateString('ar-SA')}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">
                  {profile?.full_name?.charAt(0) || 'M'}
                </span>
              </div>
            </div>
          </div>

          {/* User Info Card */}
          <Card className="mb-6 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-700">نشط</Badge>
                      <span className="text-sm text-slate-500">متصل الآن</span>
                    </div>
                    <p className="text-slate-600">{profile?.email}</p>
                    {profile?.phone && (
                      <p className="text-sm text-slate-500">{profile.phone}</p>
                    )}
                  </div>
                </div>
                <Link to="/settings">
                  <Button variant="outline" className="gap-2 hover:bg-blue-50">
                    <Settings className="w-4 h-4" />
                    إعدادات الحساب
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-700 text-center flex items-center justify-center gap-2">
                <X className="w-4 h-4" />
                {error}
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Enhanced Stats Cards */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">{stat.trend}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-700">{stat.title}</h3>
                  <div className="flex items-baseline gap-2">
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <span className="text-3xl font-bold text-slate-800">{stat.value}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{stat.description}</p>
                  {stat.title.includes('الإجازة') && !isLoading && (
                    <Progress value={(stat.value / 30) * 100} className="h-2 mt-3" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Notifications */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                الإشعارات الحديثة
              </div>
              {getUnreadCount() > 0 && (
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {getUnreadCount()} جديد
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {displayNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`flex items-start justify-between p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                    notification.read 
                      ? 'bg-slate-50 border-slate-200' 
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm'
                  }`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      notification.type === 'success' ? 'bg-green-500' :
                      notification.type === 'info' ? 'bg-blue-500' : 
                      notification.type === 'error' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`}></div>
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-1 ${notification.read ? 'text-slate-600' : 'text-slate-800'}`}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-slate-500 mb-2">{notification.message}</p>
                      <p className="text-xs text-slate-400">{notification.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                        جديد
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {displayNotifications.length === 0 && (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500 mb-2">لا توجد إشعارات جديدة</p>
                  <p className="text-sm text-slate-400">سنقوم بإعلامك عند وجود تحديثات جديدة</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Quick Actions */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <BarChart3 className="w-5 h-5" />
              الإجراءات السريعة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              <Link to="/vacation-request" className="block group">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-xl transition-all duration-300 cursor-pointer group-hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">طلب إجازة جديد</h3>
                  <p className="text-sm text-slate-600">تقديم طلب إجازة سنوية أو مرضية</p>
                </div>
              </Link>
              
              <Link to="/work-certificate" className="block group">
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-xl transition-all duration-300 cursor-pointer group-hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">شهادة عمل</h3>
                  <p className="text-sm text-slate-600">طلب شهادة عمل أو راتب</p>
                </div>
              </Link>
              
              <Link to="/mission-order" className="block group">
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-100 hover:shadow-xl transition-all duration-300 cursor-pointer group-hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">أمر مهمة</h3>
                  <p className="text-sm text-slate-600">تقديم طلب أمر مهمة</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
