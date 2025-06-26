
import { supabase } from "@/integrations/supabase/client";

export interface RequestData {
  type: 'vacation' | 'work-certificate' | 'mission-order' | 'salary-domiciliation' | 'annual-income';
  data: any;
  pdfBase64?: string;
}

export const sendRequestWithEmail = async (requestData: RequestData): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log("Starting request submission:", requestData.type);
    
    // الحصول على بيانات المستخدم الحالي
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('المستخدم غير مسجل الدخول');
    }

    console.log("User authenticated:", user.email);

    // الحصول على ملف المستخدم
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    console.log("User profile:", profile);

    // حفظ الطلب في قاعدة البيانات أولاً
    const { data: savedRequest, error: saveError } = await supabase
      .from('requests')
      .insert({
        user_id: user.id,
        type: requestData.type,
        data: requestData.data,
        status: 'pending'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving request to database:', saveError);
      throw new Error('فشل في حفظ الطلب في قاعدة البيانات');
    }

    console.log('Request saved to database:', savedRequest);

    // تحضير بيانات الطلب للإيميل
    const requestPayload = {
      type: requestData.type,
      userEmail: user.email,
      userName: profile?.full_name || 'مستخدم',
      data: requestData.data,
      pdfBase64: requestData.pdfBase64,
      requestId: savedRequest.id,
    };

    console.log("Sending request to edge function:", requestPayload);

    // إرسال الطلب عبر Edge Function
    const { data, error } = await supabase.functions.invoke('send-request-email', {
      body: requestPayload,
    });

    if (error) {
      console.error('Error calling edge function:', error);
      // حتى لو فشل الإيميل، الطلب محفوظ في قاعدة البيانات
      console.log('Request saved but email failed to send');
    }

    console.log('Edge function response:', data);

    // إرسال إشعار للأدمن (يتم تشغيله تلقائياً عبر الـ realtime subscription)
    console.log('Admin notification will be sent automatically via realtime');

    console.log('Request sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error in sendRequestWithEmail:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع' 
    };
  }
};
