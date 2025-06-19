
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardData {
  pendingRequests: number;
  approvedRequests: number;
  vacationDaysRemaining: number;
  isLoading: boolean;
  error: string | null;
}

export const useDashboardData = (): DashboardData => {
  const [data, setData] = useState<DashboardData>({
    pendingRequests: 0,
    approvedRequests: 0,
    vacationDaysRemaining: 0,
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

        // جلب الطلبات المعلقة
        const { data: pendingRequestsData, error: pendingError } = await supabase
          .from('requests')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'pending');

        if (pendingError) throw pendingError;

        // جلب الطلبات الموافق عليها هذا الشهر
        const currentMonth = new Date();
        const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        
        const { data: approvedRequestsData, error: approvedError } = await supabase
          .from('requests')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'approved')
          .gte('reviewed_at', firstDayOfMonth.toISOString());

        if (approvedError) throw approvedError;

        // جلب رصيد الإجازات المتبقي
        const currentYear = new Date().getFullYear();
        const { data: vacationData, error: vacationError } = await supabase
          .from('vacation_balances')
          .select('remaining_days')
          .eq('user_id', user.id)
          .eq('year', currentYear)
          .maybeSingle();

        if (vacationError) throw vacationError;

        // إذا لم يوجد رصيد إجازات، إنشاء واحد جديد
        let remainingDays = 30; // القيمة الافتراضية
        if (!vacationData) {
          const { error: insertError } = await supabase
            .from('vacation_balances')
            .insert({
              user_id: user.id,
              year: currentYear,
              total_days: 30,
              used_days: 0
            });
          
          if (insertError) {
            console.error('Error creating vacation balance:', insertError);
          }
        } else {
          remainingDays = vacationData.remaining_days || 30;
        }

        setData({
          pendingRequests: pendingRequestsData?.length || 0,
          approvedRequests: approvedRequestsData?.length || 0,
          vacationDaysRemaining: remainingDays,
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
