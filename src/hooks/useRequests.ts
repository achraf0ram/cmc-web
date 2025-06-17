
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Request {
  id: string;
  user_id: string;
  type: string;
  status: string;
  data: any;
  admin_notes?: string;
  rejection_reason?: string;
  approval_date?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

export const useRequests = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب جميع الطلبات (للمدير)
  const { data: allRequests, isLoading: allRequestsLoading } = useQuery({
    queryKey: ['all-requests'],
    queryFn: async () => {
      // First get all requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('requests')
        .select('*')
        .order('submitted_at', { ascending: false });
      
      if (requestsError) throw requestsError;
      if (!requestsData) return [];

      // Then get profiles for each request
      const requestsWithProfiles = await Promise.all(
        requestsData.map(async (request) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', request.user_id)
            .single();
          
          return {
            ...request,
            profiles: profileData || null
          };
        })
      );

      return requestsWithProfiles as Request[];
    },
  });

  // جلب طلبات المستخدم الحالي
  const { data: userRequests, isLoading: userRequestsLoading } = useQuery({
    queryKey: ['user-requests'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('user_id', user.user.id)
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return data as Request[];
    },
  });

  // تحديث حالة الطلب (للمدير)
  const updateRequestStatus = useMutation({
    mutationFn: async ({ 
      requestId, 
      status, 
      adminNotes, 
      rejectionReason 
    }: { 
      requestId: string; 
      status: string; 
      adminNotes?: string; 
      rejectionReason?: string; 
    }) => {
      const { data, error } = await supabase.rpc('update_request_status', {
        request_id: requestId,
        new_status: status,
        admin_notes: adminNotes,
        rejection_reason: rejectionReason,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-requests'] });
      queryClient.invalidateQueries({ queryKey: ['user-requests'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث حالة الطلب بنجاح',
        className: 'bg-green-50 border-green-200',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة الطلب',
        variant: 'destructive',
      });
    },
  });

  return {
    allRequests,
    allRequestsLoading,
    userRequests,
    userRequestsLoading,
    updateRequestStatus,
  };
};
