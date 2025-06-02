
import { supabase } from "@/integrations/supabase/client";

export interface RequestData {
  type: 'vacation' | 'work-certificate' | 'mission-order';
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

    // تحضير بيانات الطلب
    const requestPayload = {
      type: requestData.type,
      userEmail: user.email,
      userName: profile?.full_name || 'مستخدم',
      data: requestData.data,
      pdfBase64: requestData.pdfBase64,
    };

    console.log("Sending request to edge function:", requestPayload);

    // إرسال الطلب عبر Edge Function
    const { data, error } = await supabase.functions.invoke('send-request-email', {
      body: requestPayload,
    });

    if (error) {
      console.error('Error calling edge function:', error);
      throw error;
    }

    console.log('Edge function response:', data);

    if (!data || !data.success) {
      throw new Error(data?.error || 'فشل في إرسال الطلب');
    }

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
