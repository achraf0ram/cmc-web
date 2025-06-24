
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

interface AdminStatsProps {
  totalUsers: number;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}

export const AdminStats: React.FC<AdminStatsProps> = ({
  totalUsers,
  totalRequests,
  pendingRequests,
  approvedRequests,
  rejectedRequests
}) => {
  const stats = [
    {
      title: 'إجمالي المستخدمين',
      value: totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'إجمالي الطلبات',
      value: totalRequests,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'الطلبات المعلقة',
      value: pendingRequests,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'الطلبات الموافق عليها',
      value: approvedRequests,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'الطلبات المرفوضة',
      value: rejectedRequests,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="flex items-center p-6">
            <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg ml-4`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
