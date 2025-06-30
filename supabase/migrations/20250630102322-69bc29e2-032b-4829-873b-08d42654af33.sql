
-- إنشاء جدول للملفات المرفقة مع الطلبات
CREATE TABLE public.request_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- تفعيل Row Level Security
ALTER TABLE public.request_attachments ENABLE ROW LEVEL SECURITY;

-- سياسة للمستخدمين لرؤية ملفاتهم فقط
CREATE POLICY "Users can view their own attachments" 
  ON public.request_attachments 
  FOR SELECT 
  USING (uploaded_by = auth.uid());

-- سياسة للمستخدمين لإضافة ملفاتهم
CREATE POLICY "Users can upload their own attachments" 
  ON public.request_attachments 
  FOR INSERT 
  WITH CHECK (uploaded_by = auth.uid());

-- سياسة للأدمن لرؤية جميع الملفات
CREATE POLICY "Admin can view all attachments" 
  ON public.request_attachments 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'cmc.rh.ram@gmail.com'
  ));

-- إنشاء جدول للأدمن (للتحقق من الهوية)
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- إدراج بيانات الأدمن
INSERT INTO public.admin_users (email, password_hash) 
VALUES ('cmc.rh.ram@gmail.com', '$2b$10$YourHashedPasswordHere');

-- دالة للتحقق من صحة تسجيل دخول الأدمن
CREATE OR REPLACE FUNCTION public.verify_admin_login(admin_email TEXT, admin_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = admin_email 
    AND password_hash = crypt(admin_password, password_hash)
    AND is_active = true
  );
END;
$$;

-- دالة للحصول على إحصائيات تحليلية للأدمن
CREATE OR REPLACE FUNCTION public.get_admin_analytics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_requests', (SELECT COUNT(*) FROM public.requests),
    'requests_by_type', (
      SELECT jsonb_object_agg(type, count)
      FROM (
        SELECT type, COUNT(*) as count
        FROM public.requests
        GROUP BY type
      ) t
    ),
    'requests_by_status', (
      SELECT jsonb_object_agg(status, count)
      FROM (
        SELECT status, COUNT(*) as count
        FROM public.requests
        GROUP BY status
      ) t
    ),
    'requests_with_attachments', (
      SELECT COUNT(DISTINCT r.id)
      FROM public.requests r
      INNER JOIN public.request_attachments ra ON r.id = ra.request_id
    ),
    'total_attachments', (SELECT COUNT(*) FROM public.request_attachments),
    'users_with_requests', (
      SELECT COUNT(DISTINCT user_id) FROM public.requests
    ),
    'avg_processing_time', (
      SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (reviewed_at - created_at))/3600), 0)
      FROM public.requests
      WHERE reviewed_at IS NOT NULL
    )
  ) INTO result;
  
  RETURN result;
END;
$$;
