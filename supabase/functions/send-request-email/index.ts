
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestEmailData {
  type: string;
  userEmail: string;
  userName: string;
  data: any;
  pdfBase64?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, userEmail, userName, data, pdfBase64 }: RequestEmailData = await req.json();

    console.log("Sending email for request type:", type);

    // إنشاء محتوى الإيميل حسب نوع الطلب
    let subject = "";
    let content = "";

    switch (type) {
      case "vacation":
        subject = "طلب إجازة جديد";
        content = `
          <h2>طلب إجازة جديد</h2>
          <p><strong>الاسم:</strong> ${userName}</p>
          <p><strong>الإيميل:</strong> ${userEmail}</p>
          <p><strong>نوع الإجازة:</strong> ${data.leaveType}</p>
          <p><strong>تاريخ البداية:</strong> ${data.startDate}</p>
          <p><strong>تاريخ النهاية:</strong> ${data.endDate}</p>
          <p><strong>عدد الأيام:</strong> ${data.numberOfDays}</p>
          <p><strong>السبب:</strong> ${data.reason}</p>
        `;
        break;
      case "work-certificate":
        subject = "طلب شهادة عمل جديد";
        content = `
          <h2>طلب شهادة عمل جديد</h2>
          <p><strong>الاسم:</strong> ${userName}</p>
          <p><strong>الإيميل:</strong> ${userEmail}</p>
          <p><strong>الاسم الكامل:</strong> ${data.fullName}</p>
          <p><strong>الرقم التسجيلي:</strong> ${data.matricule}</p>
          <p><strong>الرتبة:</strong> ${data.grade || "غير محدد"}</p>
          <p><strong>تاريخ التوظيف:</strong> ${data.hireDate || "غير محدد"}</p>
          <p><strong>الوظيفة:</strong> ${data.function || "غير محدد"}</p>
          <p><strong>الغرض:</strong> ${data.purpose}</p>
          <p><strong>معلومات إضافية:</strong> ${data.additionalInfo || "لا توجد"}</p>
        `;
        break;
      case "mission-order":
        subject = "طلب أمر مهمة جديد";
        content = `
          <h2>طلب أمر مهمة جديد</h2>
          <p><strong>الاسم:</strong> ${userName}</p>
          <p><strong>الإيميل:</strong> ${userEmail}</p>
          <p><strong>السيد/السيدة:</strong> ${data.monsieurMadame}</p>
          <p><strong>الرقم التسجيلي:</strong> ${data.matricule}</p>
          <p><strong>الوجهة:</strong> ${data.destination}</p>
          <p><strong>الغرض:</strong> ${data.purpose}</p>
          <p><strong>تاريخ البداية:</strong> ${data.startDate}</p>
          <p><strong>تاريخ النهاية:</strong> ${data.endDate}</p>
          <p><strong>وقت البداية:</strong> ${data.startTime || "غير محدد"}</p>
          <p><strong>وقت النهاية:</strong> ${data.endTime || "غير محدد"}</p>
          <p><strong>السائق:</strong> ${data.conducteur || "غير محدد"}</p>
          <p><strong>رقم تسجيل السائق:</strong> ${data.conducteurMatricule || "غير محدد"}</p>
          <p><strong>معلومات إضافية:</strong> ${data.additionalInfo || "لا توجد"}</p>
        `;
        break;
      default:
        subject = "طلب جديد";
        content = `
          <h2>طلب جديد</h2>
          <p><strong>الاسم:</strong> ${userName}</p>
          <p><strong>الإيميل:</strong> ${userEmail}</p>
          <p><strong>البيانات:</strong> ${JSON.stringify(data, null, 2)}</p>
        `;
    }

    // إعداد المرفقات
    const attachments = [];
    if (pdfBase64) {
      attachments.push({
        filename: `${type}_${userName.replace(/\s+/g, '_')}.pdf`,
        content: pdfBase64,
        content_type: "application/pdf",
      });
    }

    // إرسال الإيميل للإدارة - تم تغيير الإيميل إلى إيميلك المسجل
    const adminEmailResponse = await resend.emails.send({
      from: "CMC System <onboarding@resend.dev>",
      to: ["achraframdani2@gmail.com"], // تم تغيير الإيميل إلى إيميلك المسجل في Resend
      subject: `[طلب إدارة] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0FA0CE 0%, #2E7D32 100%); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">نظام إدارة الطلبات CMC</h1>
            <p style="margin: 5px 0 0 0;">طلب مقدم للإدارة</p>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            ${content}
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              تم إرسال هذا الإيميل تلقائياً من نظام إدارة الطلبات CMC
            </p>
          </div>
        </div>
      `,
      attachments: attachments,
    });

    console.log("Admin email sent:", adminEmailResponse);

    // إرسال إيميل تأكيد للمستخدم
    const userEmailResponse = await resend.emails.send({
      from: "CMC System <onboarding@resend.dev>",
      to: [userEmail],
      subject: `تأكيد استلام ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0FA0CE 0%, #2E7D32 100%); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">نظام إدارة الطلبات CMC</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #2E7D32;">مرحباً ${userName}</h2>
            <p>تم استلام طلبك بنجاح وسيتم مراجعته من قبل الإدارة.</p>
            <p><strong>نوع الطلب:</strong> ${subject}</p>
            <p><strong>تاريخ الإرسال:</strong> ${new Date().toLocaleDateString('ar-SA')}</p>
            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #2E7D32;"><strong>ملاحظة:</strong> سيتم التواصل معك قريباً بخصوص حالة طلبك.</p>
            </div>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              تم إرسال هذا الإيميل تلقائياً من نظام إدارة الطلبات CMC
            </p>
          </div>
        </div>
      `,
    });

    console.log("User confirmation email sent:", userEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        adminEmail: adminEmailResponse,
        userEmail: userEmailResponse 
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
    console.error("Error in send-request-email function:", error);
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

serve(handler);
