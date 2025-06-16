
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdminSettings {
  id: string;
  user_id: string;
  admin_email: string;
  receives_notifications: boolean;
  auto_approve_vacation: boolean;
  auto_approve_certificates: boolean;
  signature_image_url?: string;
  created_at: string;
  updated_at: string;
}

export const useAdminSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as AdminSettings;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<AdminSettings>) => {
      const { data, error } = await supabase
        .from('admin_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم حفظ الإعدادات بنجاح',
        className: 'bg-green-50 border-green-200',
      });
    },
  });

  const createSettings = useMutation({
    mutationFn: async (settings: Omit<AdminSettings, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('admin_settings')
        .insert(settings)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم إنشاء الإعدادات بنجاح',
        className: 'bg-green-50 border-green-200',
      });
    },
  });

  return {
    settings,
    isLoading,
    updateSettings,
    createSettings,
  };
};
