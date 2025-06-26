
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Request {
  id: string;
  type: string;
  status: string;
  created_at: string;
}

interface Stats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}

interface DashboardData {
  requests: Request[];
  stats: Stats;
  isLoading: boolean;
  error: string | null;
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    requests: [],
    stats: {
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
    },
    isLoading: true,
    error: null,
  });

  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setData(prev => ({ ...prev, isLoading: false, error: 'User not authenticated' }));
        return;
      }

      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));

        // جلب جميع الطلبات للمستخدم
        const { data: requests, error: requestsError } = await supabase
          .from('requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (requestsError) throw requestsError;

        // حساب الإحصائيات
        const stats = {
          totalRequests: requests?.length || 0,
          pendingRequests: requests?.filter(r => r.status === 'pending').length || 0,
          approvedRequests: requests?.filter(r => r.status === 'approved').length || 0,
          rejectedRequests: requests?.filter(r => r.status === 'rejected').length || 0,
        };

        setData({
          requests: requests || [],
          stats,
          isLoading: false,
          error: null,
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: 'حدث خطأ في تحميل البيانات'
        }));
      }
    };

    fetchDashboardData();
  }, [user]);

  return data;
};
