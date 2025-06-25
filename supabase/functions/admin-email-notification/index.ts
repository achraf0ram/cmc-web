
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminNotificationRequest {
  type: 'new_request' | 'user_registered' | 'test' | 'urgent';
  title: string;
  message: string;
  adminEmail: string;
  requestData?: any;
  userData?: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, title, message, adminEmail, requestData, userData }: AdminNotificationRequest = await req.json();

    console.log("Sending admin notification:", { type, title, adminEmail });

    // تحديد أولوية الإشعار ولونه
    const getNotificationStyle = (notificationType: string) => {
      switch (notificationType) {
        case 'new_request':
          return {
            priority: 'عالية',
            color: '#FFA500',
            icon: '📋'
          };
        case 'user_registered':
          return {
            priority: 'متوسطة',
            color: '#4CAF50',
            icon: '👤'
          };
        case 'urgent':
          return {
            priority: 'عاجلة',
            color: '#F44336',
            icon: '🚨'
          };
        default:
          return {
            priority: 'عادية',
            color: '#2196F3',
            icon: '🔔'
          };
      }
    };

    const style = getNotificationStyle(type);

    // إنشاء محتوى مفصل للإشعار
    let detailedContent = '';
    if (requestData) {
      detailedContent = `
        <h3 style="color: ${style.color};">تفاصيل الطلب:</h3>
        <ul style="list-style-type: none; padding: 0;">
          <li><strong>نوع الطلب:</strong> ${getRequestTypeLabel(requestData.type)}</li>
          <li><strong>اسم المستخدم:</strong> ${requestData.userName}</li>
          <li><strong>البريد الإلكتروني:</strong> ${requestData.userEmail}</li>
          <li><strong>تاريخ التقديم:</strong> ${new Date().toLocaleDateString('ar-SA')}</li>
        </ul>
      `;
    }

    if (userData) {
      detailedContent = `
        <h3 style="color: ${style.color};">تفاصيل المستخدم الجديد:</h3>
        <ul style="list-style-type: none; padding: 0;">
          <li><strong>الاسم:</strong> ${userData.fullName}</li>
          <li><strong>البريد الإلكتروني:</strong> ${userData.email}</li>
          <li><strong>تاريخ التسجيل:</strong> ${new Date().toLocaleDateString('ar-SA')}</li>
        </ul>
      `;
    }

    const emailSubject = `${style.icon} [CMC Admin] ${title}`;
    
    const emailContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #0FA0CE 0%, #2E7D32 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">نظام إدارة CMC</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">إشعار إداري</p>
        </div>
        
        <div style="padding: 30px; background-color: white; border-radius: 0 0 10px 10px;">
          <div style="background-color: ${style.color}20; border: 2px solid ${style.color}; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <span style="font-size: 24px; margin-left: 10px;">${style.icon}</span>
              <div>
                <h2 style="margin: 0; color: ${style.color}; font-size: 20px;">${title}</h2>
                <span style="background-color: ${style.color}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                  أولوية ${style.priority}
                </span>
              </div>
            </div>
            <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #333;">${message}</p>
          </div>

          ${detailedContent}

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 25px;">
            <h3 style="margin: 0 0 15px 0; color: #333;">الإجراءات المطلوبة:</h3>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <a href="https://preview--market-cap-visual-guide.lovable.app/admin-dashboard" 
                 style="background-color: #0FA0CE; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                🔗 دخول لوحة التحكم
              </a>
              <a href="https://preview--market-cap-visual-guide.lovable.app/admin-dashboard?tab=requests" 
                 style="background-color: #2E7D32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                📋 مراجعة الطلبات
              </a>
            </div>
          </div>

          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="margin: 0; font-size: 14px; color: #666; text-align: center;">
              📧 تم إرسال هذا الإشعار تلقائياً من نظام إدارة CMC<br>
              🕐 الوقت: ${new Date().toLocaleString('ar-SA')}
            </p>
          </div>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "CMC Admin System <onboarding@resend.dev>",
      to: [adminEmail],
      subject: emailSubject,
      html: emailContent,
    });

    console.log("Admin notification email sent:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailResponse: emailResponse 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error in admin-email-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

function getRequestTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'vacation': 'طلب إجازة',
    'work-certificate': 'شهادة عمل',
    'mission-order': 'أمر مهمة'
  };
  return labels[type] || type;
}

serve(handler);
