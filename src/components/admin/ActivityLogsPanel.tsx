
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Activity, User, FileText, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: any;
  created_at: string;
}

export const ActivityLogsPanel = () => {
  const { data: activityLogs, isLoading } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as ActivityLog[];
    },
  });

  const getActionIcon = (action: string) => {
    if (action.includes('user')) return <User className="w-4 h-4" />;
    if (action.includes('request')) return <FileText className="w-4 h-4" />;
    if (action.includes('settings')) return <Settings className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'request_created': 'إنشاء طلب',
      'request_status_changed': 'تغيير حالة الطلب',
      'user_login': 'تسجيل دخول',
      'user_logout': 'تسجيل خروج',
      'settings_updated': 'تحديث الإعدادات',
    };
    return labels[action] || action;
  };

  const getActionColor = (action: string) => {
    if (action.includes('created')) return 'bg-green-100 text-green-800';
    if (action.includes('updated') || action.includes('changed')) return 'bg-blue-100 text-blue-800';
    if (action.includes('deleted')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">جاري التحميل...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          سجل النشاطات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>النشاط</TableHead>
              <TableHead>المستخدم</TableHead>
              <TableHead>نوع المورد</TableHead>
              <TableHead>التفاصيل</TableHead>
              <TableHead>التاريخ والوقت</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activityLogs?.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getActionIcon(log.action)}
                    <Badge className={getActionColor(log.action)}>
                      {getActionLabel(log.action)}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {log.user_id ? log.user_id.substring(0, 8) + '...' : 'نظام'}
                </TableCell>
                <TableCell>
                  {log.resource_type ? (
                    <Badge variant="outline">{log.resource_type}</Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="max-w-xs">
                  {log.details ? (
                    <div className="text-sm bg-gray-50 p-2 rounded">
                      {JSON.stringify(log.details, null, 2).substring(0, 100)}...
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {new Date(log.created_at).toLocaleString('ar-EG')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
