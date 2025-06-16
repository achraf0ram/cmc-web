
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description?: string;
  category: string;
  updated_by?: string;
  updated_at: string;
}

export const useSystemSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true });
      
      if (error) throw error;
      return data as SystemSetting[];
    },
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('system_settings')
        .update({
          value,
          updated_by: user.user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('key', key)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم حفظ الإعدادات بنجاح',
        className: 'bg-green-50 border-green-200',
      });
    },
  });

  const createSetting = useMutation({
    mutationFn: async (setting: Omit<SystemSetting, 'id' | 'updated_at' | 'updated_by'>) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('system_settings')
        .insert({
          ...setting,
          updated_by: user.user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم إنشاء الإعداد بنجاح',
        className: 'bg-green-50 border-green-200',
      });
    },
  });

  return {
    settings,
    isLoading,
    updateSetting,
    createSetting,
  };
};
