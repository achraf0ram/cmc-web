
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import PersonalInfoSection from "@/components/forms/PersonalInfoSection";
import LeaveInfoSection from "@/components/forms/LeaveInfoSection";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { generateVacationPDF } from "@/utils/pdfGenerator";
import { sendRequestWithEmail } from "@/services/requestService";
import { useNotifications } from "@/hooks/useNotifications";

const VacationRequest = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const { language } = useLanguage();
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  const formSchema = z.object({
    fullName: z.string().min(3, { message: language === 'ar' ? "يرجى إدخال الاسم الكامل" : "Veuillez entrer le nom complet" }),
    employeeId: z.string().min(1, { message: language === 'ar' ? "يرجى إدخال رقم الموظف" : "Veuillez entrer le numéro d'employé" }),
    phoneNumber: z.string().min(10, { message: language === 'ar' ? "يرجى إدخال رقم هاتف صحيح" : "Veuillez entrer un numéro de téléphone valide" }),
    position: z.string().min(2, { message: language === 'ar' ? "يرجى إدخال المنصب" : "Veuillez entrer le poste" }),
    department: z.string().min(2, { message: language === 'ar' ? "يرجى إدخال القسم" : "Veuillez entrer le département" }),
    leaveType: z.string().min(1, { message: language === 'ar' ? "يرجى اختيار نوع الإجازة" : "Veuillez sélectionner le type de congé" }),
    startDate: z.date({ required_error: language === 'ar' ? "يرجى تحديد تاريخ البداية" : "Veuillez sélectionner la date de début" }),
    endDate: z.date({ required_error: language === 'ar' ? "يرجى تحديد تاريخ النهاية" : "Veuillez sélectionner la date de fin" }),
    numberOfDays: z.number().min(1, { message: language === 'ar' ? "يرجى إدخال عدد الأيام" : "Veuillez entrer le nombre de jours" }),
    reason: z.string().min(5, { message: language === 'ar' ? "يرجى ذكر سبب الإجازة" : "Veuillez indiquer la raison du congé" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      matricule: "",
      echelle: "",
      echelon: "",
      grade: "",
      phone: "",
      fonction: "",
      arabicFonction: "",
      direction: "",
      arabicDirection: "",
      address: "",
      arabicAddress: "",
      leaveType: "",
      customLeaveType: "",
      arabicCustomLeaveType: "",
      duration: "",
      arabicDuration: "",
      with: "",
      arabicWith: "",
      interim: "",
      arabicInterim: "",
      leaveMorocco: false,
      signature: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsGenerating(true);
      console.log("Submitting vacation request:", values);

      // إنشاء PDF
      const pdfBase64 = await generateVacationPDF(values);
      
      // إرسال الطلب عبر الإيميل
      const emailResult = await sendRequestWithEmail({
        type: 'vacation',
        data: values,
        pdfBase64: pdfBase64,
      });

      if (!emailResult.success) {
        throw new Error(emailResult.error || 'فشل في إرسال الطلب');
      }

      setIsSubmitted(true);
      
      // إضافة إشعار نجاح
      addNotification({
        title: "تم الإرسال بنجاح",
        message: "تم إرسال طلب الإجازة وسيتم مراجعته قريباً",
        type: "success"
      });

      // Show success toast
      toast({
        title: "تم بنجاح",
        description: "تم إرسال طلب الإجازة وتحميل PDF بنجاح",
        variant: "default",
        className: "bg-green-50 border-green-200",
      });

    } catch (error) {
      console.error("Error:", error);
      
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6 pb-6 md:pt-8 md:pb-8">
            <div className="flex flex-col items-center text-center gap-4 md:gap-6">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center shadow-lg">
                <CheckCircle className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-slate-800">تم الإرسال بنجاح</h2>
                <p className="text-slate-600 leading-relaxed mb-4 md:mb-6 text-sm md:text-base">
                  تم إرسال طلب الإجازة بنجاح للإدارة وسيتم مراجعته قريباً. 
                  كما تم إرسال رسالة تأكيد على بريدك الإلكتروني.
                </p>
                <Button 
                  onClick={() => setIsSubmitted(false)}
                  className="border-blue-500 text-blue-600 hover:bg-blue-50 px-6 md:px-8 py-2 md:py-3 rounded-lg text-sm md:text-base"
                >
                  إرسال طلب جديد
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            {language === 'ar' ? 'طلب إجازة' : 'Demande de Congé'}
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            {language === 'ar' ? 'قم بملء البيانات المطلوبة لتقديم طلب الإجازة' : 'Veuillez remplir les informations requises pour votre demande de congé'}
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
          <PersonalInfoSection form={form} />
          <LeaveInfoSection 
            form={form} 
            signaturePreview={signaturePreview}
            setSignaturePreview={setSignaturePreview}
          />
          
          <div className="flex justify-center pt-4 md:pt-6">
            <Button 
              type="submit" 
              disabled={isGenerating}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isGenerating ? 
                (language === 'ar' ? "جاري الإرسال..." : "Envoi en cours...") 
                : (language === 'ar' ? "إرسال الطلب وتحميل PDF" : "Envoyer la demande et télécharger le PDF")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VacationRequest;
