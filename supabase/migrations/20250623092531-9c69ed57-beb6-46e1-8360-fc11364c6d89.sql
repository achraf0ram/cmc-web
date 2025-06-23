
-- إنشاء جدول لإعدادات المستخدم
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email_notifications BOOLEAN DEFAULT true,
  new_requests_notifications BOOLEAN DEFAULT true,
  request_updates_notifications BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'ar',
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- تفعيل Row Level Security
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح للمستخدمين بقراءة إعداداتهم الخاصة
CREATE POLICY "Users can view their own settings" 
  ON public.user_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- سياسة للسماح للمستخدمين بإنشاء إعداداتهم الخاصة
CREATE POLICY "Users can create their own settings" 
  ON public.user_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- سياسة للسماح للمستخدمين بتحديث إعداداتهم الخاصة
CREATE POLICY "Users can update their own settings" 
  ON public.user_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- إنشاء trigger لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE
    ON public.user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إنشاء function لإنشاء إعدادات افتراضية للمستخدم الجديد
CREATE OR REPLACE FUNCTION public.create_user_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- إنشاء trigger لإنشاء إعدادات تلقائية عند إنشاء مستخدم جديد
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_settings();
