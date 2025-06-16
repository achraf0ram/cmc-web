
-- إنشاء جدول الأدوار
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee', 'hr');

-- إنشاء جدول أدوار المستخدمين
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'employee',
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role)
);

-- إنشاء جدول الأقسام
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- إنشاء جدول المناصب
CREATE TABLE public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  level INTEGER DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- تحديث جدول الملفات الشخصية لإضافة معلومات إضافية
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employee_id TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS position_id UUID REFERENCES public.positions(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hire_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS salary DECIMAL(10,2);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES auth.users(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- إنشاء جدول إعدادات النظام
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول سجل النشاطات
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول الإشعارات
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- تحديث جدول الطلبات لإضافة حقول إضافية
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id);
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS approval_workflow JSONB;
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS attachments JSONB;

-- إنشاء دالة للتحقق من الأدوار
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name user_role)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_roles.user_id = has_role.user_id 
      AND user_roles.role = role_name 
      AND is_active = true
  );
$$;

-- إنشاء دالة للحصول على أدوار المستخدم
CREATE OR REPLACE FUNCTION public.get_user_roles(user_id UUID)
RETURNS TABLE(role user_role)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT user_roles.role 
  FROM public.user_roles 
  WHERE user_roles.user_id = get_user_roles.user_id 
    AND is_active = true;
$$;

-- تفعيل RLS على الجداول الجديدة
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للأدوار
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- سياسات الأمان للأقسام
CREATE POLICY "All authenticated users can view departments" ON public.departments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and HR can manage departments" ON public.departments
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'hr')
  );

-- سياسات الأمان للمناصب
CREATE POLICY "All authenticated users can view positions" ON public.positions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and HR can manage positions" ON public.positions
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'hr')
  );

-- سياسات الأمان لإعدادات النظام
CREATE POLICY "Admins can manage system settings" ON public.system_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- سياسات الأمان لسجل النشاطات
CREATE POLICY "Users can view their own activity logs" ON public.activity_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all activity logs" ON public.activity_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (true);

-- سياسات الأمان للإشعارات
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- إدراج بيانات أولية
INSERT INTO public.departments (name, code, description) VALUES
  ('إدارة الموارد البشرية', 'HR', 'قسم إدارة الموارد البشرية والتوظيف'),
  ('تقنية المعلومات', 'IT', 'قسم تقنية المعلومات والدعم التقني'),
  ('المحاسبة والمالية', 'FIN', 'قسم المحاسبة والشؤون المالية'),
  ('الإدارة العامة', 'ADMIN', 'الإدارة العامة والتخطيط الاستراتيجي');

INSERT INTO public.positions (title, department_id, level) VALUES
  ('مدير الموارد البشرية', (SELECT id FROM public.departments WHERE code = 'HR'), 5),
  ('موظف موارد بشرية', (SELECT id FROM public.departments WHERE code = 'HR'), 3),
  ('مدير تقنية المعلومات', (SELECT id FROM public.departments WHERE code = 'IT'), 5),
  ('مطور برمجيات', (SELECT id FROM public.departments WHERE code = 'IT'), 3),
  ('محاسب', (SELECT id FROM public.departments WHERE code = 'FIN'), 3),
  ('مدير مالي', (SELECT id FROM public.departments WHERE code = 'FIN'), 5);

INSERT INTO public.system_settings (key, value, description, category) VALUES
  ('company_name', '"شركة CMC"', 'اسم الشركة', 'general'),
  ('max_vacation_days', '30', 'الحد الأقصى لأيام الإجازة السنوية', 'vacation'),
  ('working_hours_per_day', '8', 'ساعات العمل اليومية', 'general'),
  ('weekend_days', '["friday", "saturday"]', 'أيام نهاية الأسبوع', 'general'),
  ('email_notifications', 'true', 'تفعيل الإشعارات عبر البريد الإلكتروني', 'notifications');

-- إنشاء دالة لتسجيل النشاطات
CREATE OR REPLACE FUNCTION public.log_activity(
  action_type TEXT,
  resource_type TEXT DEFAULT NULL,
  resource_id UUID DEFAULT NULL,
  details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.activity_logs (
    user_id, action, resource_type, resource_id, details
  ) VALUES (
    auth.uid(), action_type, resource_type, resource_id, details
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- إنشاء تريجر لتسجيل النشاطات على الطلبات
CREATE OR REPLACE FUNCTION public.log_request_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_activity(
      'request_created',
      'request',
      NEW.id,
      jsonb_build_object('type', NEW.type, 'status', NEW.status)
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    PERFORM public.log_activity(
      'request_status_changed',
      'request',
      NEW.id,
      jsonb_build_object(
        'type', NEW.type,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'reviewed_by', NEW.reviewed_by
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER requests_activity_log_trigger
  AFTER INSERT OR UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.log_request_activity();
