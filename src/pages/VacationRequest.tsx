
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { sendRequestWithEmail } from "@/services/requestService";
import { generateVacationPDF } from "@/utils/vacationPDF";
import VacationRequestForm from "@/components/forms/VacationRequestForm";
import { VacationFormData } from "@/types/vacationRequest";
import SuccessMessage from "@/components/SuccessMessage";

const VacationRequest = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  const handleSubmit = async (values: VacationFormData) => {
    try {
      setIsGenerating(true);
      console.log("Starting vacation request submission...", values);
      
      // توليد PDF والحصول على base64
      const pdfBase64 = await generateVacationPDF(values);
      console.log("PDF base64 generated, sending email...");
      
      // إرسال الطلب عبر الإيميل مع PDF
      const emailResult = await sendRequestWithEmail({
        type: 'vacation',
        data: values,
        pdfBase64: pdfBase64,
      });

      console.log("Email result:", emailResult);

      if (!emailResult.success) {
        throw new Error(emailResult.error || 'فشل في إرسال الطلب');
      }

      setIsSubmitted(true);
      
      // إضافة إشعار نجاح
      addNotification({
        title: "تم الإرسال بنجاح",
        message: "تم إرسال طلب الإجازة إلى إيميل الإدارة وتم تحميل PDF بنجاح",
        type: "success"
      });

      // Show success toast
      toast({
        title: "تم بنجاح",
        description: "تم إرسال طلب الإجازة إلى الإدارة وتحميل PDF بنجاح",
        variant: "default",
        className: "bg-green-50 border-green-200",
      });
    } catch (error) {
      console.error("Error in vacation request submission:", error);
      
      addNotification({
        title: "خطأ في الإرسال",
        message: error instanceof Error ? error.message : "حدث خطأ أثناء معالجة الطلب",
        type: "error"
      });

      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isSubmitted) {
    return <SuccessMessage onNewRequest={() => setIsSubmitted(false)} />;
  }

  return (
    <VacationRequestForm 
      onSubmit={handleSubmit} 
      isGenerating={isGenerating} 
    />
  );
};

export default VacationRequest;
