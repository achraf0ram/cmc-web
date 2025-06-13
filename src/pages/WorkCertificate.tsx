import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { sendRequestWithEmail } from "@/services/requestService";
import { PDFHelper } from "@/utils/pdfUtils";

const WorkCertificate = () => {
  const { t, language } = useLanguage();
  console.log('Current language:', language);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  // Define form schema inside the component to access the language context
  const formSchema = z.object({
    fullName: z.string().min(3, { message: language === 'ar' ? "يرجى إدخال الاسم الكامل" : "Veuillez entrer le nom complet" }),
    matricule: z.string().min(1, { message: language === 'ar' ? "يرجى إدخال رقم التسجيل" : "Veuillez entrer le numéro de matricule" }),
    grade: z.string().optional(),
    hireDate: z.string().optional(),
    function: z.string().optional(),
    purpose: z.string().min(5, { message: language === 'ar' ? "يرجى وصف الغرض من الشهادة" : "Veuillez décrire l'objet de l'attestation" }),
    additionalInfo: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      matricule: "",
      grade: "",
      hireDate: "",
      function: "",
      purpose: "",
      additionalInfo: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsGenerating(true);
      
      // إنشاء PDF باستخدام المكتبة الجديدة
      const pdfHelper = new PDFHelper();
      const currentDate = format(new Date(), "dd/MM/yyyy");

      // إضافة الشعار
      await pdfHelper.addLogo();

      // إضافة محتوى الشهادة
      pdfHelper.addText(`N/Réf. : OFP/DR CASA SETTAT/DAAL/SRRH /N°`, 20, 45, { fontSize: 12 });
      pdfHelper.addText(`Casablanca, le ${currentDate}`, 140, 45, { fontSize: 12 });

      pdfHelper.addText("ATTESTATION DE TRAVAIL", 105, 65, { 
        align: "center", 
        fontSize: 16, 
        fontStyle: "bold" 
      });

      pdfHelper.addText("Nous soussignés, Directeur Régional Casablanca-Settat de l'Office de la", 20, 75, { fontSize: 12 });
      pdfHelper.addText("Formation Professionnelle et de la Promotion du Travail (OFPPT), attestons", 20, 80, { fontSize: 12 });
      pdfHelper.addText("que :", 20, 85, { fontSize: 12 });

      pdfHelper.addText(`Monsieur : ${data.fullName}`, 20, 95, { fontSize: 12 });
      pdfHelper.addText(`Matricule : ${data.matricule}`, 20, 105, { fontSize: 12 });
      pdfHelper.addText(`Grade : ${data.grade || ""}`, 20, 115, { fontSize: 12 });
      pdfHelper.addText(`Est employé au sein de notre organisme depuis le : ${data.hireDate || ""}`, 20, 125, { fontSize: 12 });
      pdfHelper.addText(`En qualité de : ${data.function || ""}`, 20, 135, { fontSize: 12 });

      pdfHelper.addText("La présente attestation est délivrée à l'intéressé pour servir et valoir ce que de droit.", 20, 165, { fontSize: 12 });

      // إضافة التذييل
      pdfHelper.addFooters();

      // الحصول على base64 وحفظ الملف
      const pdfBase64 = pdfHelper.getBase64();
      pdfHelper.save("attestation_de_travail.pdf");

      // إرسال الطلب عبر الإيميل
      const emailResult = await sendRequestWithEmail({
        type: 'work-certificate',
        data: data,
        pdfBase64: pdfBase64,
      });

      if (!emailResult.success) {
        throw new Error(emailResult.error || 'فشل في إرسال الطلب');
      }
      
      setIsSubmitted(true);

      // إضافة إشعار نجاح مع تأكيد إرسال الإيميل
      addNotification({
        title: "تم الإرسال بنجاح",
        message: "تم إرسال طلب شهادة العمل إلى إيميل الإدارة وسيتم مراجعته قريباً. كما تم إرسال نسخة تأكيد إلى بريدك الإلكتروني.",
        type: "success"
      });

      // Show success toast
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء شهادة العمل وإرسالها إلى إيميل الإدارة بنجاح",
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
                <p className="text-slate-600 leading-relaxed mb-4 md:mb-6 text-sm md:text-base">تم إرسال طلب شهادة العمل بنجاح وسيتم معالجته قريباً</p>
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
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            {language === 'ar' ? 'شهادة العمل' : 'Attestation de Travail'}
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            {language === 'ar' ? 'قم بملء البيانات المطلوبة لإصدار شهادة العمل' : 'Veuillez remplir les informations requises pour obtenir votre attestation de travail'}
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
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">
                        {language === 'ar' ? 'الاسم الكامل' : 'Nom complet'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                          placeholder={language === 'ar' ? "أدخل الاسم الكامل" : "Entrez le nom complet"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="matricule" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">
                        {language === 'ar' ? 'الرقم التسجيلي' : 'Matricule'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                          placeholder={language === 'ar' ? "أدخل الرقم التسجيلي" : "Entrez le matricule"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="grade" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">
                        {language === 'ar' ? 'الرتبة' : 'Grade'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                          placeholder={language === 'ar' ? "أدخل الرتبة" : "Entrez le grade"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="hireDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">
                        {language === 'ar' ? 'تاريخ التوظيف' : 'Date d\'embauche'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="function" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">
                        {language === 'ar' ? 'الوظيفة' : 'Fonction'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                          placeholder={language === 'ar' ? "أدخل الوظيفة" : "Entrez la fonction"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="purpose" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">
                        {language === 'ar' ? 'الغرض' : 'Objet'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                          placeholder={language === 'ar' ? "أدخل الغرض من الشهادة" : "Entrez l'objet"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="additionalInfo" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">
                      {language === 'ar' ? 'معلومات إضافية' : 'Informations supplémentaires'}
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        className="resize-none border-blue-300 focus:border-blue-500 focus:ring-blue-200" 
                        placeholder={language === 'ar' ? "أدخل أي معلومات إضافية" : "Entrez les informations supplémentaires"}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="flex justify-center pt-4 md:pt-6">
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

export default WorkCertificate;
