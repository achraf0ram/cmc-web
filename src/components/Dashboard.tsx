
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { BarChart3, Calendar, CheckCircle } from "lucide-react";

export const Dashboard = () => {
  const { t } = useLanguage();

  const stats = [
    {
      title: t('pendingRequests'),
      value: '5',
      description: t('awaitingApproval'),
      icon: Calendar,
      color: 'from-sahara-500 to-sahara-600'
    },
    {
      title: t('approvedRequests'),
      value: '12',
      description: t('thisMonth'),
      icon: CheckCircle,
      color: 'from-green-500 to-green-600'
    },
    {
      title: t('vacationDays'),
      value: '15',
      description: t('remaining'),
      icon: BarChart3,
      color: 'from-blue-500 to-blue-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sahara-50 via-white to-sahara-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sahara-100 rounded-full mb-4">
            <BarChart3 className="w-8 h-8 text-sahara-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('dashboard')}</h1>
          <p className="text-gray-600">لوحة التحكم الرئيسية</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className={`bg-gradient-to-r ${stat.color} text-white rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="w-6 h-6" />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <p className="text-sm text-gray-600">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-sahara-600 to-sahara-700 text-white rounded-t-lg">
            <CardTitle className="text-xl font-semibold text-center">
              الإجراءات السريعة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-6 bg-gradient-to-br from-sahara-50 to-sahara-100 rounded-lg border border-sahara-200 hover:shadow-lg transition-all duration-200">
                <Calendar className="w-12 h-12 text-sahara-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">طلب إجازة جديد</h3>
                <p className="text-sm text-gray-600">تقديم طلب إجازة سنوية أو مرضية</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-lg transition-all duration-200">
                <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">شهادة عمل</h3>
                <p className="text-sm text-gray-600">طلب شهادة عمل أو راتب</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-lg transition-all duration-200">
                <BarChart3 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">أمر مهمة</h3>
                <p className="text-sm text-gray-600">تقديم طلب أمر مهمة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
