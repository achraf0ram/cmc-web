
import React from 'react';
import emailjs from 'emailjs-com';
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VacationEmailSenderProps {
  pdfBase64: string;
  formData: any;
  isGenerating: boolean;
}

const VacationEmailSender = ({ pdfBase64, formData, isGenerating }: VacationEmailSenderProps) => {
  const { toast } = useToast();

  const sendEmail = async () => {
    try {
      // Initialize EmailJS
      emailjs.init("XnirLJya11juqBcGt");

      const templateParams = {
        to_email: "cmc.rh.ram@gmail.com",
        from_name: formData.fullName || "موظف",
        subject: `طلب إجازة - ${formData.fullName}`,
        message: `
          طلب إجازة جديد:
          
          الاسم الكامل: ${formData.fullName}
          الرقم المالي: ${formData.matricule}
          نوع الإجازة: ${formData.leaveType}
          تاريخ البداية: ${formData.startDate}
          تاريخ النهاية: ${formData.endDate}
          عدد الأيام: ${formData.numberOfDays}
          السبب: ${formData.reason}
        `,
        pdf_attachment: pdfBase64
      };

      const result = await emailjs.send(
        "service_t3sn7ky",
        "template_c2aqfac",
        templateParams
      );

      console.log("Email sent successfully:", result);
      
      toast({
        title: "تم الإرسال بنجاح",
        description: "تم إرسال طلب الإجازة بنجاح إلى الإدارة",
        className: "bg-green-50 border-green-200",
      });

    } catch (error) {
      console.error("Error sending email:", error);
      
      toast({
        title: "خطأ في الإرسال",
        description: "حدث خطأ أثناءإرسال الطلب. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      onClick={sendEmail}
      disabled={isGenerating || !pdfBase64}
      className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
    >
      <Mail className="mr-2 h-4 w-4" />
      {isGenerating ? "جاري المعالجة..." : "إرسال وتحميل PDF"}
    </Button>
  );
};

export default VacationEmailSender;
