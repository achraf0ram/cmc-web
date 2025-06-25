
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
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      console.log('Starting to fetch admin data...');

      // جلب الطلبات مع بيانات المستخدمين باستخدام استعلام منفصل
      const { data: requestsData, error: requestsError } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('Error fetching requests:', requestsError);
        throw new Error('فشل في تحميل الطلبات');
      }

      console.log('Requests fetched:', requestsData?.length);

      // جلب بيانات المستخدمين منفصلة
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw new Error('فشل في تحميل بيانات المستخدمين');
      }

      console.log('Users fetched:', usersData?.length);

      // ربط بيانات المستخدمين بالطلبات
      const requestsWithProfiles = requestsData?.map(request => {
        const profile = usersData?.find(user => user.id === request.user_id);
        return {
          ...request,
          profiles: profile ? {
            full_name: profile.full_name,
            email: profile.email,
            phone: profile.phone
          } : null
        };
      }) || [];

      // حساب الإحصائيات
      const stats = {
        totalUsers: usersData?.length || 0,
        totalRequests: requestsData?.length || 0,
        pendingRequests: requestsData?.filter(r => r.status === 'pending').length || 0,
        approvedRequests: requestsData?.filter(r => r.status === 'approved').length || 0,
        rejectedRequests: requestsData?.filter(r => r.status === 'rejected').length || 0,
      };

      console.log('Admin data processed successfully:', stats);

      setData({
        requests: requestsWithProfiles,
        users: usersData || [],
        stats,
        isLoading: false,
        error: null,
      });

    } catch (error) {
      console.error('Error in fetchAdminData:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'حدث خطأ في تحميل البيانات'
      }));
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      console.log('Admin user detected, fetching data...');
      fetchAdminData();
    } else if (user && !isAdmin) {
      console.log('Non-admin user, not fetching admin data');
      setData(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'غير مصرح لك بالوصول لهذه البيانات' 
      }));
    } else {
      console.log('No user logged in');
      setData(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'يجب تسجيل الدخول أولاً' 
      }));
    }
  }, [user, isAdmin]);

  return {
    ...data,
    refreshData: fetchAdminData
  };
};
