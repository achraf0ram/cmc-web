
-- إنشاء جدول إعدادات المدراء
CREATE TABLE public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  admin_email TEXT NOT NULL,
  receives_notifications BOOLEAN DEFAULT true,
  auto_approve_vacation BOOLEAN DEFAULT false,
  auto_approve_certificates BOOLEAN DEFAULT false,
  signature_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- تحديث جدول الطلبات لإضافة حقول إضافية
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- إنشاء جدول تتبع حالات الطلبات
CREATE TABLE public.request_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- تفعيل RLS على الجداول الجديدة
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_status_history ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان لإعدادات المدراء
CREATE POLICY "Admins can view their own settings" ON public.admin_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage their own settings" ON public.admin_settings
  FOR ALL USING (user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

-- سياسات الأمان لتاريخ حالات الطلبات
CREATE POLICY "Users can view status history of their requests" ON public.request_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.requests 
      WHERE requests.id = request_status_history.request_id 
      AND requests.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all status history" ON public.request_status_history
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert status history" ON public.request_status_history
  FOR INSERT WITH CHECK (true);

-- تحديث سياسات الطلبات للسماح للمدراء بإدارتها
CREATE POLICY "Admins can manage all requests" ON public.requests
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- إنشاء دالة لتحديث حالة الطلب (بدون GET DIAGNOSTICS FOUND)
CREATE OR REPLACE FUNCTION public.update_request_status(
  request_id UUID,
  new_status TEXT,
  admin_notes TEXT DEFAULT NULL,
  rejection_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_status TEXT;
BEGIN
  -- التحقق من وجود الطلب والحصول على الحالة الحالية
  SELECT status INTO old_status 
  FROM public.requests 
  WHERE id = request_id;
  
  -- إذا لم يوجد الطلب، إرجاع false
  IF old_status IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- تحديث الطلب
  UPDATE public.requests 
  SET 
    status = new_status,
    admin_notes = COALESCE(update_request_status.admin_notes, requests.admin_notes),
    rejection_reason = COALESCE(update_request_status.rejection_reason, requests.rejection_reason),
    reviewed_by = auth.uid(),
    reviewed_at = CASE 
      WHEN new_status IN ('approved', 'rejected') THEN now() 
      ELSE reviewed_at 
    END,
    approval_date = CASE 
      WHEN new_status = 'approved' THEN now() 
      ELSE approval_date 
    END,
    updated_at = now()
  WHERE id = request_id;
  
  -- إضافة سجل في تاريخ الحالات
  INSERT INTO public.request_status_history (
    request_id, old_status, new_status, changed_by, change_reason
  ) VALUES (
    request_id, old_status, new_status, auth.uid(), admin_notes
  );
  
  -- تسجيل النشاط
  PERFORM public.log_activity(
    'request_status_updated',
    'request',
    request_id,
    jsonb_build_object(
      'old_status', old_status,
      'new_status', new_status,
      'admin_notes', admin_notes
    )
  );
  
  RETURN TRUE;
END;
$$;

-- إنشاء دالة للحصول على إحصائيات المدير
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_requests', (SELECT COUNT(*) FROM public.requests),
    'pending_requests', (SELECT COUNT(*) FROM public.requests WHERE status = 'pending'),
    'approved_requests', (SELECT COUNT(*) FROM public.requests WHERE status = 'approved'),
    'rejected_requests', (SELECT COUNT(*) FROM public.requests WHERE status = 'rejected'),
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'vacation_requests', (SELECT COUNT(*) FROM public.requests WHERE type = 'vacation'),
    'certificate_requests', (SELECT COUNT(*) FROM public.requests WHERE type = 'work-certificate'),
    'mission_requests', (SELECT COUNT(*) FROM public.requests WHERE type = 'mission-order')
  ) INTO stats;
  
  RETURN stats;
END;
$$;

-- إدراج إعدادات المدير الافتراضية للمستخدمين الحاليين الذين لديهم دور admin
INSERT INTO public.admin_settings (user_id, admin_email, receives_notifications)
SELECT ur.user_id, COALESCE(p.email, 'admin@company.com'), true
FROM public.user_roles ur
LEFT JOIN public.profiles p ON ur.user_id = p.id
WHERE ur.role = 'admin' AND ur.is_active = true
ON CONFLICT (user_id) DO NOTHING;
