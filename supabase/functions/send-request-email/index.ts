
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

    // إنشاء محتوى الإيميل بالفرنسية للإدارة
    let subject = "";
    let adminContent = "";

    switch (type) {
      case "vacation":
        subject = "Nouvelle demande de congé";
        adminContent = `
          <h2>Nouvelle demande de congé</h2>
          <p><strong>Nom complet:</strong> ${data.fullName}</p>
          <p><strong>Matricule:</strong> ${data.matricule}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Type de congé:</strong> ${data.leaveType}</p>
          <p><strong>Date de début:</strong> ${data.startDate}</p>
          <p><strong>Date de fin:</strong> ${data.endDate}</p>
          <p><strong>Durée:</strong> ${data.duration}</p>
          <p><strong>Fonction:</strong> ${data.fonction || "Non spécifiée"}</p>
          <p><strong>Direction:</strong> ${data.direction || "Non spécifiée"}</p>
          <p><strong>Adresse:</strong> ${data.address || "Non spécifiée"}</p>
          <p><strong>Téléphone:</strong> ${data.phone || "Non spécifié"}</p>
        `;
        break;
      case "work-certificate":
        subject = "Nouvelle demande d'attestation de travail";
        adminContent = `
          <h2>Nouvelle demande d'attestation de travail</h2>
          <p><strong>Nom complet:</strong> ${data.fullName}</p>
          <p><strong>Matricule:</strong> ${data.matricule}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Grade:</strong> ${data.grade || "Non spécifié"}</p>
          <p><strong>Date d'embauche:</strong> ${data.hireDate || "Non spécifiée"}</p>
          <p><strong>Fonction:</strong> ${data.function || "Non spécifiée"}</p>
          <p><strong>Objectif:</strong> ${data.purpose}</p>
          <p><strong>Informations supplémentaires:</strong> ${data.additionalInfo || "Aucune"}</p>
        `;
        break;
      case "mission-order":
        subject = "Nouvelle demande d'ordre de mission";
        adminContent = `
          <h2>Nouvelle demande d'ordre de mission</h2>
          <p><strong>Nom:</strong> ${data.monsieurMadame}</p>
          <p><strong>Matricule:</strong> ${data.matricule}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Destination:</strong> ${data.destination}</p>
          <p><strong>Objectif:</strong> ${data.purpose}</p>
          <p><strong>Date de début:</strong> ${data.startDate}</p>
          <p><strong>Date de fin:</strong> ${data.endDate}</p>
          <p><strong>Heure de début:</strong> ${data.startTime || "Non spécifiée"}</p>
          <p><strong>Heure de fin:</strong> ${data.endTime || "Non spécifiée"}</p>
          <p><strong>Conducteur:</strong> ${data.conducteur || "Non spécifié"}</p>
          <p><strong>Matricule conducteur:</strong> ${data.conducteurMatricule || "Non spécifié"}</p>
          <p><strong>Informations supplémentaires:</strong> ${data.additionalInfo || "Aucune"}</p>
        `;
        break;
      default:
        subject = "Nouvelle demande";
        adminContent = `
          <h2>Nouvelle demande</h2>
          <p><strong>Nom:</strong> ${userName}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Données:</strong> ${JSON.stringify(data, null, 2)}</p>
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

    // إرسال الإيميل للإدارة بالفرنسية
    const adminEmailResponse = await resend.emails.send({
      from: "CMC System <onboarding@resend.dev>",
      to: ["achraframdani2@gmail.com"],
      subject: `[Administration] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0FA0CE 0%, #2E7D32 100%); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">Système de Gestion des Demandes CMC</h1>
            <p style="margin: 5px 0 0 0;">Demande soumise à l'administration</p>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            ${adminContent}
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement par le système de gestion des demandes CMC
            </p>
          </div>
        </div>
      `,
      attachments: attachments,
    });

    console.log("Admin email sent:", adminEmailResponse);

    // إرسال إيميل تأكيد للمستخدم بالعربية
    let userSubject = "";
    let userMessage = "";
    
    switch (type) {
      case "vacation":
        userSubject = "تأكيد استلام طلب الإجازة";
        userMessage = "تم استلام طلب الإجازة الخاص بك بنجاح. سيتم مراجعته من قبل الإدارة قريباً.";
        break;
      case "work-certificate":
        userSubject = "تأكيد استلام طلب شهادة العمل";
        userMessage = "تم استلام طلب شهادة العمل الخاص بك بنجاح. سيتم مراجعته من قبل الإدارة قريباً.";
        break;
      case "mission-order":
        userSubject = "تأكيد استلام طلب أمر المهمة";
        userMessage = "تم استلام طلب أمر المهمة الخاص بك بنجاح. سيتم مراجعته من قبل الإدارة قريباً.";
        break;
      default:
        userSubject = "تأكيد استلام الطلب";
        userMessage = "تم استلام طلبك بنجاح. سيتم مراجعته من قبل الإدارة قريباً.";
    }

    const userEmailResponse = await resend.emails.send({
      from: "CMC System <onboarding@resend.dev>",
      to: [userEmail],
      subject: userSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0FA0CE 0%, #2E7D32 100%); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">نظام إدارة الطلبات CMC</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #2E7D32;">مرحباً ${userName}</h2>
            <p>${userMessage}</p>
            <p>تم إرسال المستند PDF المرفق إلى الإدارة للمراجعة.</p>
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
      attachments: attachments,
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
