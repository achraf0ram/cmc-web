
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'manager' | 'employee' | 'hr';
  assigned_by?: string;
  assigned_at: string;
  is_active: boolean;
}

export const useUserRoles = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userRoles, isLoading } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data as UserRole[];
    },
  });

  const assignRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole['role'] }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role,
          assigned_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث دور المستخدم بنجاح',
        className: 'bg-green-50 border-green-200',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث دور المستخدم',
        variant: 'destructive',
      });
    },
  });

  const removeRole = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('id', roleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم إزالة الدور بنجاح',
        className: 'bg-green-50 border-green-200',
      });
    },
  });

  return {
    userRoles,
    isLoading,
    assignRole,
    removeRole,
  };
};

export const useCurrentUserRole = () => {
  return useQuery({
    queryKey: ['current-user-role'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.user.id)
        .eq('is_active', true);
      
      if (error) throw error;
      return data as { role: UserRole['role'] }[];
    },
  });
};
