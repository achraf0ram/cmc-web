
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AdminData {
  requests: any[];
  users: any[];
  stats: {
    totalUsers: number;
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
  };
  isLoading: boolean;
  error: string | null;
}

export const useAdminData = (): AdminData & { refreshData: () => void } => {
  const [data, setData] = useState<AdminData>({
    requests: [],
    users: [],
    stats: {
      totalUsers: 0,
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
    },
    isLoading: true,
    error: null,
  });

  const { user, isAdmin } = useAuth();

  const fetchAdminData = async () => {
    if (!user || !isAdmin) {
      setData(prev => ({ ...prev, isLoading: false, error: 'غير مصرح لك بالوصول' }));
      return;
    }

    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      // جلب الطلبات مع بيانات المستخدمين
      const { data: requestsData, error: requestsError } = await supabase
        .from('requests')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // جلب بيانات المستخدمين
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // حساب الإحصائيات
      const stats = {
        totalUsers: usersData?.length || 0,
        totalRequests: requestsData?.length || 0,
        pendingRequests: requestsData?.filter(r => r.status === 'pending').length || 0,
        approvedRequests: requestsData?.filter(r => r.status === 'approved').length || 0,
        rejectedRequests: requestsData?.filter(r => r.status === 'rejected').length || 0,
      };

      setData({
        requests: requestsData || [],
        users: usersData || [],
        stats,
        isLoading: false,
        error: null,
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: 'حدث خطأ في تحميل البيانات'
      }));
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user, isAdmin]);

  return {
    ...data,
    refreshData: fetchAdminData
  };
};
