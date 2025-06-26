
-- إضافة جدول للإشعارات في الوقت الفعلي
CREATE TABLE IF NOT EXISTS public.real_time_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  request_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days')
);

-- تفعيل Row Level Security
ALTER TABLE public.real_time_notifications ENABLE ROW LEVEL SECURITY;

-- سياسة للمستخدمين لرؤية إشعاراتهم فقط
CREATE POLICY "Users can view their own notifications" 
  ON public.real_time_notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- سياسة للأدمن لإنشاء إشعارات
CREATE POLICY "Admins can create notifications" 
  ON public.real_time_notifications 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin' 
      AND is_active = true
    )
  );

-- سياسة للمستخدمين لتحديث حالة قراءة إشعاراتهم
CREATE POLICY "Users can update their own notifications" 
  ON public.real_time_notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- تفعيل الإشعارات في الوقت الفعلي
ALTER PUBLICATION supabase_realtime ADD TABLE public.real_time_notifications;
ALTER TABLE public.real_time_notifications REPLICA IDENTITY FULL;

-- إضافة trigger لإرسال إشعارات عند تغيير حالة الطلبات
CREATE OR REPLACE FUNCTION public.send_real_time_notification()
RETURNS TRIGGER AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
BEGIN
  -- عند تغيير حالة الطلب من pending إلى approved أو rejected
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    
    IF NEW.status = 'approved' THEN
      notification_title := 'تم الموافقة على طلبك';
      notification_message := 
        CASE NEW.type
          WHEN 'vacation' THEN 'تم الموافقة على طلب الإجازة الخاص بك'
          WHEN 'work-certificate' THEN 'تم الموافقة على طلب شهادة العمل الخاص بك'
          WHEN 'mission-order' THEN 'تم الموافقة على طلب أمر المهمة الخاص بك'
          ELSE 'تم الموافقة على طلبك'
        END;
      notification_type := 'success';
      
    ELSIF NEW.status = 'rejected' THEN
      notification_title := 'تم رفض طلبك';
      notification_message := 
        CASE NEW.type
          WHEN 'vacation' THEN 'تم رفض طلب الإجازة الخاص بك'
          WHEN 'work-certificate' THEN 'تم رفض طلب شهادة العمل الخاص بك'
          WHEN 'mission-order' THEN 'تم رفض طلب أمر المهمة الخاص بك'
          ELSE 'تم رفض طلبك'
        END;
        
      IF NEW.rejection_reason IS NOT NULL THEN
        notification_message := notification_message || '. السبب: ' || NEW.rejection_reason;
      END IF;
      
      notification_type := 'error';
    END IF;
    
    -- إدراج الإشعار في الجدول
    INSERT INTO public.real_time_notifications (
      user_id, 
      title, 
      message, 
      type, 
      request_id
    ) VALUES (
      NEW.user_id,
      notification_title,
      notification_message,
      notification_type,
      NEW.id
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger
DROP TRIGGER IF EXISTS send_real_time_notification_trigger ON public.requests;
CREATE TRIGGER send_real_time_notification_trigger
  AFTER UPDATE ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.send_real_time_notification();
