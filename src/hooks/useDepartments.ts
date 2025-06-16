
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  manager_id?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export const useDepartments = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Department[];
    },
  });

  const createDepartment = useMutation({
    mutationFn: async (department: Omit<Department, 'id' | 'created_at' | 'updated_at' | 'is_active'>) => {
      const { data, error } = await supabase
        .from('departments')
        .insert(department)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم إنشاء القسم بنجاح',
        className: 'bg-green-50 border-green-200',
      });
    },
  });

  const updateDepartment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Department> & { id: string }) => {
      const { data, error } = await supabase
        .from('departments')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث القسم بنجاح',
        className: 'bg-green-50 border-green-200',
      });
    },
  });

  const deleteDepartment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('departments')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم حذف القسم بنجاح',
        className: 'bg-green-50 border-green-200',
      });
    },
  });

  return {
    departments,
    isLoading,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
};
