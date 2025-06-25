
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Settings, 
  Mail, 
  Users, 
  FileText, 
  Download,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminActionsProps {
  onRefresh: () => void;
  stats: {
    totalUsers: number;
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
  };
}

export const AdminActions: React.FC<AdminActionsProps> = ({ onRefresh, stats }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleBroadcastEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-email-notification', {
        body: {
          type: 'broadcast',
          title: emailSubject,
          message: emailMessage,
          adminEmail: 'cmc.rh.ram@gmail.com'
        }
      });

      if (error) throw error;

      toast({
        title: 'تم الإرسال بنجاح',
        description: 'تم إرسال الرسالة الجماعية بنجاح',
      });

      setEmailSubject('');
      setEmailMessage('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error sending broadcast email:', error);
      toast({
        title: 'خطأ في الإرسال',
        description: 'حدث خطأ أثناء إرسال الرسالة',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const { data: requests } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: users } = await supabase
        .from('profiles')
        .select('*');

      const exportData = {
        requests: requests || [],
        users: users || [],
        stats,
        exportDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `admin-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'تم التصدير بنجاح',
        description: 'تم تصدير البيانات بنجاح',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'خطأ في التصدير',
        description: 'حدث خطأ أثناء تصدير البيانات',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          إجراءات إدارية سريعة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* تحديث البيانات */}
          <Button 
            onClick={onRefresh} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث البيانات
          </Button>

          {/* البحث السريع */}
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="البحث السريع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* تصدير البيانات */}
          <Button 
            onClick={handleExportData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            تصدير البيانات
          </Button>

          {/* إرسال رسالة جماعية */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Mail className="w-4 h-4" />
                رسالة جماعية
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إرسال رسالة جماعية للمستخدمين</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">موضوع الرسالة:</label>
                  <Input
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="أدخل موضوع الرسالة..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">محتوى الرسالة:</label>
                  <Textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="أدخل محتوى الرسالة..."
                    rows={5}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    إلغاء
                  </Button>
                  <Button 
                    onClick={handleBroadcastEmail}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? 'جاري الإرسال...' : 'إرسال'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* إحصائيات سريعة */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">إجمالي المستخدمين</p>
            <p className="text-lg font-bold text-blue-600">{stats.totalUsers}</p>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <FileText className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">إجمالي الطلبات</p>
            <p className="text-lg font-bold text-green-600">{stats.totalRequests}</p>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <Badge className="bg-yellow-100 text-yellow-800 mb-1">معلقة</Badge>
            <p className="text-lg font-bold text-yellow-600">{stats.pendingRequests}</p>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Badge className="bg-green-100 text-green-800 mb-1">موافق</Badge>
            <p className="text-lg font-bold text-green-600">{stats.approvedRequests}</p>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <Badge className="bg-red-100 text-red-800 mb-1">مرفوض</Badge>
            <p className="text-lg font-bold text-red-600">{stats.rejectedRequests}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
