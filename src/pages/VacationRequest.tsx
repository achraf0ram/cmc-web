import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ar, fr } from "date-fns/locale";
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { sendRequestWithEmail } from "@/services/requestService";
import { VacationPDFHelper } from "@/utils/vacationPDF";
import PersonalInfoSection from "@/components/forms/PersonalInfoSection";
import LeaveInfoSection from "@/components/forms/LeaveInfoSection";
import { FormData } from "@/types/vacationRequest";

const VacationRequest = () => {
  const { language } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  const formSchema = z.object({
    fullName: z.string().min(2, "الاسم الكامل مطلوب"),
    matricule: z.string().min(1, "الرقم التسجيلي مطلوب"),
    grade: z.string().optional(),
    fonction: z.string().optional(),
    leaveType: z.string().min(1, "نوع الإجازة مطلوب"),
    customLeaveType: z.string().optional(),
    arabicCustomLeaveType: z.string().optional(),
    duration: z.string().min(1, "المدة مطلوبة"),
    arabicDuration: z.string().optional(),
    startDate: z.date({
      required_error: "تاريخ البداية مطلوب",
    }),
    endDate: z.date({
      required_error: "تاريخ النهاية مطلوب",
    }),
    with: z.string().optional(),
    arabicWith: z.string().optional(),
    interim: z.string().optional(),
    arabicInterim: z.string().optional(),
    leaveMorocco: z.boolean().default(false),
    signature: z.string().optional(),
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      matricule: "",
      grade: "",
      fonction: "",
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

  const handleSubmit = async (data: FormData) => {
    try {
      setIsGenerating(true);
      
      // إنشاء PDF
      const pdfHelper = new VacationPDFHelper();
      const currentDate = format(new Date(), "dd/MM/yyyy");

      // إضافة الشعار
      await pdfHelper.addLogo();

      // إضافة محتوى طلب الإجازة
      pdfHelper.addText(`N/Réf. : OFP/DR CASA SETTAT/DAAL/SRRH /N°`, 20, 80, { fontSize: 12 });
      pdfHelper.addText(`Casablanca, le ${currentDate}`, 140, 80, { fontSize: 12 });

      pdfHelper.addText("DEMANDE DE CONGÉ", 105, 100, { 
        align: "center", 
        fontSize: 16, 
        fontStyle: "bold" 
      });

      pdfHelper.addText(`Nom et Prénom : ${data.fullName}`, 20, 120, { fontSize: 12 });
      pdfHelper.addText(`Matricule : ${data.matricule}`, 20, 130, { fontSize: 12 });
      pdfHelper.addText(`Grade : ${data.grade || ""}`, 20, 140, { fontSize: 12 });
      pdfHelper.addText(`Fonction : ${data.fonction || ""}`, 20, 150, { fontSize: 12 });

      const leaveTypeDisplay = data.leaveType === "Autre" ? 
        (data.customLeaveType || data.arabicCustomLeaveType) : 
        data.leaveType;
      
      pdfHelper.addText(`Nature de congé : ${leaveTypeDisplay}`, 20, 170, { fontSize: 12 });
      pdfHelper.addText(`Durée : ${data.duration}`, 20, 180, { fontSize: 12 });
      
      if (data.arabicDuration) {
        pdfHelper.addText(`المدة : ${data.arabicDuration}`, 20, 190, { fontSize: 12 });
      }

      pdfHelper.addText(`Du : ${format(data.startDate, "dd/MM/yyyy")}`, 20, 210, { fontSize: 12 });
      pdfHelper.addText(`Au : ${format(data.endDate, "dd/MM/yyyy")}`, 20, 220, { fontSize: 12 });

      if (data.with) {
        pdfHelper.addText(`Avec : ${data.with}`, 20, 240, { fontSize: 12 });
      }

      if (data.interim) {
        pdfHelper.addText(`Intérim : ${data.interim}`, 20, 260, { fontSize: 12 });
      }

      if (data.leaveMorocco) {
        pdfHelper.addText("☑ Quitter le territoire Marocain", 20, 280, { fontSize: 12 });
      } else {
        pdfHelper.addText("☐ Quitter le territoire Marocain", 20, 280, { fontSize: 12 });
      }

      // إضافة التذييل
      pdfHelper.addFooters();

      // الحصول على base64 وحفظ الملف
      const pdfBase64 = pdfHelper.getBase64();
      pdfHelper.save("demande_de_conge.pdf");

      // إرسال الطلب عبر الإيميل
      const emailResult = await sendRequestWithEmail({
        type: 'vacation',
        data: {
          ...data,
          startDate: format(data.startDate, "yyyy-MM-dd"),
          endDate: format(data.endDate, "yyyy-MM-dd"),
          numberOfDays: Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
          reason: `${data.leaveType} - ${data.duration}`
        },
        pdfBase64: pdfBase64,
      });

      if (!emailResult.success) {
        throw new Error(emailResult.error || 'فشل في إرسال الطلب');
      }
      
      setIsSubmitted(true);

      // إضافة إشعار نجاح
      addNotification({
        title: "تم الإرسال بنجاح",
        message: "تم إرسال طلب الإجازة إلى إيميل الإدارة وسيتم مراجعته قريباً. كما تم إرسال نسخة تأكيد إلى بريدك الإلكتروني.",
        type: "success"
      });

      toast({
        title: "تم بنجاح",
        description: "تم إنشاء طلب الإجازة وإرساله إلى إيميل الإدارة بنجاح",
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
                <p className="text-slate-600 leading-relaxed mb-4 md:mb-6 text-sm md:text-base">تم إرسال طلب الإجازة بنجاح وسيتم معالجته قريباً</p>
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            {language === 'ar' ? 'طلب إجازة' : 'Demande de Congé'}
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            {language === 'ar' ? 'قم بملء البيانات المطلوبة لطلب الإجازة' : 'Veuillez remplir les informations requises pour votre demande de congé'}
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl font-semibold text-center">
              {language === 'ar' ? 'معلومات الطلب' : 'Informations de la demande'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 md:space-y-8">
                <PersonalInfoSection form={form} />
                <LeaveInfoSection 
                  form={form} 
                  signaturePreview={signaturePreview}
                  setSignaturePreview={setSignaturePreview}
                />

                <div className="flex justify-center pt-6">
                  <Button 
                    type="submit" 
                    disabled={isGenerating}
                    className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isGenerating ? 
                      (language === 'ar' ? "جاري المعالجة..." : "Traitement en cours...") 
                      : (language === 'ar' ? "إرسال وتحميل PDF" : "Envoyer et télécharger le PDF")}
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
