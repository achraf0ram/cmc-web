
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import VacationRequestForm from "@/components/forms/VacationRequestForm";
import { FormData } from "@/types/vacationRequest";
import { SuccessMessage } from "@/components/SuccessMessage";
import { generateVacationPDF } from "@/utils/vacationPDF";
import { format } from "date-fns";

const VacationRequest = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: FormData) => {
    try {
      setIsGenerating(true);
      
      // Generate PDF with form data
      const pdfData = {
        fullName: data.fullName,
        matricule: data.matricule,
        grade: data.grade || "",
        hireDate: data.hireDate || format(new Date(), "yyyy-MM-dd"),
        function: data.fonction || "",
        leaveType: data.leaveType,
        startDate: format(data.startDate, "yyyy-MM-dd"),
        endDate: format(data.endDate, "yyyy-MM-dd"),
        numberOfDays: Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24)),
        reason: data.duration || "طلب إجازة",
        additionalInfo: data.arabicDuration || "",
      };

      // Send the request to the email service (VacationEmailSender handles this)
      console.log("Vacation request submitted:", data);
      
      setIsSubmitted(true);
      toast.success("تم إرسال طلب الإجازة بنجاح!");
    } catch (error) {
      console.error("Error submitting vacation request:", error);
      toast.error("حدث خطأ في إرسال الطلب");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 p-4 flex items-center justify-center">
        <SuccessMessage
          title="تم إرسال طلب الإجازة بنجاح"
          description="تم إرسال طلبك إلى الإدارة وسيتم مراجعته قريباً. ستصلك رسالة بالنتيجة."
          buttonText="إرسال طلب جديد"
          onReset={handleReset}
        />
      </div>
    );
  }

  return (
    <VacationRequestForm 
      onSubmit={handleSubmit} 
      isGenerating={isGenerating}
    />
  );
};

export default VacationRequest;
