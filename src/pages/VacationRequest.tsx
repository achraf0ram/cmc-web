
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormData, formSchema } from "@/types/vacationRequest";
import PersonalInfoSection from "@/components/forms/PersonalInfoSection";
import LeaveInfoSection from "@/components/forms/LeaveInfoSection";
import { generateVacationPDF } from "@/utils/vacationPDF";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail } from "lucide-react";

const VacationRequest = () => {
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      matricule: "",
      echelle: "",
      echelon: "",
      grade: "",
      fonction: "",
      arabicFonction: "",
      direction: "",
      arabicDirection: "",
      address: "",
      arabicAddress: "",
      phone: "",
      leaveType: "",
      customLeaveType: "",
      arabicCustomLeaveType: "",
      duration: "",
      arabicDuration: "",
      startDate: new Date(),
      endDate: new Date(),
      with: "",
      arabicWith: "",
      interim: "",
      arabicInterim: "",
      leaveMorocco: false,
      signature: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log("Form submitted with data:", data);
    setIsSubmitting(true);

    try {
      // حساب عدد الأيام
      const numberOfDays = Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // تحضير بيانات PDF
      const pdfData = {
        fullName: data.fullName,
        matricule: data.matricule,
        grade: data.grade || "",
        hireDate: format(new Date(), "yyyy-MM-dd"),
        function: data.fonction || "",
        leaveType: data.leaveType,
        startDate: format(data.startDate, "yyyy-MM-dd"),
        endDate: format(data.endDate, "yyyy-MM-dd"),
        numberOfDays: numberOfDays,
        reason: data.duration || "طلب إجازة",
        additionalInfo: data.arabicDuration || "",
      };

      console.log("Generating PDF with data:", pdfData);
      
      // توليد PDF
      const pdfBase64 = await generateVacationPDF(pdfData);
      console.log("PDF generated successfully");

      // تحضير بيانات الطلب للإرسال
      const requestData = {
        fullName: data.fullName,
        matricule: data.matricule,
        leaveType: data.leaveType,
        startDate: format(data.startDate, "yyyy-MM-dd"),
        endDate: format(data.endDate, "yyyy-MM-dd"),
        numberOfDays: numberOfDays,
        reason: data.duration || "طلب إجازة",
        duration: data.duration,
        arabicDuration: data.arabicDuration,
        grade: data.grade,
        fonction: data.fonction,
        direction: data.direction,
        address: data.address,
        phone: data.phone,
      };

      console.log("Sending request with email service");

      // إرسال الطلب عبر Supabase Edge Function
      const { data: result, error } = await supabase.functions.invoke('send-request-email', {
        body: {
          type: 'vacation',
          data: requestData,
          pdfBase64: pdfBase64,
        }
      });

      if (error) {
        throw error;
      }

      if (result && result.success) {
        console.log("Request sent successfully");
        toast({
          title: "تم الإرسال بنجاح",
          description: "تم إرسال طلب الإجازة بنجاح إلى الإدارة",
          className: "bg-green-50 border-green-200",
        });

        // إعادة تعيين النموذج
        form.reset();
        setSignaturePreview(null);
      } else {
        throw new Error("فشل في إرسال الطلب");
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "خطأ في الإرسال",
        description: "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            طلب إجازة
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            قم بملء البيانات المطلوبة للحصول على موافقة الإجازة
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl font-semibold text-center">
              معلومات طلب الإجازة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <PersonalInfoSection form={form} />
              <LeaveInfoSection 
                form={form} 
                signaturePreview={signaturePreview}
                setSignaturePreview={setSignaturePreview}
              />
              
              <div className="flex justify-center pt-4 md:pt-6">
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {isSubmitting ? "جاري الإرسال..." : "إرسال طلب الإجازة"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VacationRequest;
