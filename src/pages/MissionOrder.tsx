
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { sendRequestWithEmail } from "@/services/requestService";
import { generateMissionOrderPDF } from "@/utils/missionOrderPDF";
import { MissionOrderFormData } from "@/utils/missionOrderSchema";
import MissionOrderForm from "@/components/MissionOrderForm";
import MissionOrderSuccess from "@/components/MissionOrderSuccess";

const MissionOrder = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  const handleSubmit = async (values: MissionOrderFormData) => {
    try {
      setIsGenerating(true);
      console.log("Starting mission order submission...", values);
      
      // توليد PDF والحصول على base64
      const pdfBase64 = await generateMissionOrderPDF(values);
      console.log("PDF base64 generated, sending email...");
      
      // إرسال الطلب عبر الإيميل مع PDF
      const emailResult = await sendRequestWithEmail({
        type: 'mission-order',
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
        message: "تم إرسال طلب أمر المهمة إلى إيميل الإدارة وتم تحميل PDF بنجاح",
        type: "success"
      });

      // Show success toast
      toast({
        title: "تم بنجاح",
        description: "تم إرسال أمر المهمة إلى الإدارة وتحميل PDF بنجاح",
        variant: "default",
        className: "bg-green-50 border-green-200",
      });
    } catch (error) {
      console.error("Error in mission order submission:", error);
      
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
    return <MissionOrderSuccess onNewRequest={() => setIsSubmitted(false)} />;
  }

  return (
    <MissionOrderForm 
      onSubmit={handleSubmit} 
      isGenerating={isGenerating} 
    />
  );
};

export default MissionOrder;
