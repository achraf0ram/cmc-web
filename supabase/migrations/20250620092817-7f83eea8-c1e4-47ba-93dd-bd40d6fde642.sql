
-- إنشاء جدول الإشعارات إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- تفعيل Row Level Security
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح للمستخدمين برؤية إشعاراتهم فقط
CREATE POLICY "Users can view their own notifications" 
ON public.user_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- سياسة للسماح للمستخدمين بتحديث إشعاراتهم فقط
CREATE POLICY "Users can update their own notifications" 
ON public.user_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- دالة لإنشاء إشعار جديد
CREATE OR REPLACE FUNCTION public.create_user_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_request_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.user_notifications (user_id, title, message, type, request_id)
  VALUES (p_user_id, p_title, p_message, p_type, p_request_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- دالة لتحديث حالة الطلبات وإنشاء إشعارات
CREATE OR REPLACE FUNCTION public.notify_request_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
BEGIN
  -- عند إنشاء طلب جديد
  IF TG_OP = 'INSERT' THEN
    notification_title := 'تم استلام طلبك';
    notification_message := 
      CASE NEW.type
        WHEN 'vacation' THEN 'تم استلام طلب الإجازة الخاص بك وهو قيد المراجعة'
        WHEN 'work-certificate' THEN 'تم استلام طلب شهادة العمل الخاص بك وهو قيد المراجعة'
        WHEN 'mission-order' THEN 'تم استلام طلب أمر المهمة الخاص بك وهو قيد المراجعة'
        ELSE 'تم استلام طلبك وهو قيد المراجعة'
      END;
    notification_type := 'info';
    
    PERFORM public.create_user_notification(
      NEW.user_id, 
      notification_title, 
      notification_message, 
      notification_type, 
      NEW.id
    );
    
  -- عند تغيير حالة الطلب
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
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
      notification_type := 'error';
      
    ELSE
      notification_title := 'تم تحديث حالة طلبك';
      notification_message := 'تم تحديث حالة طلبك إلى: ' || NEW.status;
      notification_type := 'info';
    END IF;
    
    PERFORM public.create_user_notification(
      NEW.user_id, 
      notification_title, 
      notification_message, 
      notification_type, 
      NEW.id
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- إنشاء trigger لتتبع تغييرات الطلبات
DROP TRIGGER IF EXISTS on_request_status_change ON public.requests;
CREATE TRIGGER on_request_status_change
  AFTER INSERT OR UPDATE ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_request_status_change();
