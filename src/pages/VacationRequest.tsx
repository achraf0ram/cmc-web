
import PersonalInfoSection from "@/components/forms/PersonalInfoSection";
import LeaveInfoSection from "@/components/forms/LeaveInfoSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { generateVacationPDF } from "@/utils/vacationPDF";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendRequestWithEmail } from "@/services/requestService";
import { Mail } from "lucide-react";
import { SuccessMessage } from "@/components/SuccessMessage";

const VacationRequest = () => {
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      fullName: "",
      matricule: "",
      fonction: "",
      direction: "",
      address: "",
      phone: "",
      leaveType: "",
      startDate: "",
      endDate: "",
      duration: "",
    },
  });

  const handleReset = () => {
    setShowSuccess(false);
    form.reset();
    setSignaturePreview(null);
  };

  const onSubmit = async (values: any) => {
    console.log("Form submitted with values:", values);
    
    if (!signaturePreview) {
      toast({
        title: "خطأ",
        description: "يرجى رفع صورة التوقيع",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Starting form submission process");

      // إعداد بيانات الطلب
      const requestData = {
        ...values,
        signaturePreview,
        requestDate: format(new Date(), "yyyy-MM-dd"),
      };

      console.log("Request data prepared:", requestData);

      // إنشاء ملف PDF
      console.log("Generating PDF");
      const pdfBase64 = await generateVacationPDF(requestData);
      console.log("PDF generated successfully");

      if (!pdfBase64) {
        throw new Error("فشل في إنشاء ملف PDF");
      }

      console.log("Sending request with email service");

      // إرسال الطلب مع الإيميل باستخدام نفس الطريقة المستخدمة في الطلبات الأخرى
      const result = await sendRequestWithEmail({
        type: 'vacation',
        data: requestData,
        pdfBase64: pdfBase64,
      });

      if (result.success) {
        console.log("Request sent successfully");
        setShowSuccess(true);
      } else {
        console.error("Failed to send request:", result.error);
        toast({
          title: "خطأ في الإرسال",
          description: result.error || "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cmc-blue-light via-white to-cmc-green-light flex items-center justify-center p-4">
        <SuccessMessage
          title="تم الإرسال بنجاح"
          description="تم إرسال طلب الإجازة بنجاح وسيتم معالجته قريباً"
          buttonText="إرسال طلب جديد"
          onReset={handleReset}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cmc-blue-light via-white to-cmc-green-light p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="cmc-card">
          <CardHeader className="text-center bg-gradient-to-r from-cmc-blue to-cmc-green text-white rounded-t-lg">
            <CardTitle className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2">
              <Mail className="h-6 w-6 md:h-8 md:w-8" />
              طلب إجازة
            </CardTitle>
            <Badge variant="secondary" className="mx-auto mt-2 bg-white/20 text-white">
              نموذج طلب إجازة
            </Badge>
          </CardHeader>
          
          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <PersonalInfoSection 
                  form={form} 
                  signaturePreview={signaturePreview}
                  setSignaturePreview={setSignaturePreview}
                />
                
                <Separator className="my-8" />
                
                <LeaveInfoSection 
                  form={form}
                  signaturePreview={signaturePreview}
                  setSignaturePreview={setSignaturePreview}
                />
                
                <div className="flex justify-center pt-6">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="cmc-button-primary px-8 py-3 text-lg font-semibold min-w-[200px]"
                  >
                    {isSubmitting ? "جاري الإرسال..." : "إرسال الطلب"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VacationRequest;
