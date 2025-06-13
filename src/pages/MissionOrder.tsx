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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ar, fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { sendRequestWithEmail } from "@/services/requestService";
import { useNotifications } from "@/hooks/useNotifications";
import { PDFHelper } from "@/utils/pdfUtils";

// Import the Arabic font data
import { AmiriFont } from "../fonts/AmiriFont";

const MissionOrder = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { language, t } = useLanguage();
  const { toast } = useToast();

  // Import the notification hook  
  const { addNotification } = useNotifications();

  // تعريف الـ Schema للتحقق من صحة البيانات
  const formSchema = z.object({
    monsieurMadame: z.string().min(3, { message: language === 'ar' ? "يرجى إدخال اسم السيد/السيدة" : "Veuillez entrer le nom complet" }),
    matricule: z.string().min(1, { message: language === 'ar' ? "يرجى إدخال رقم التسجيل" : "Veuillez entrer le numéro de matricule" }),
    destination: z.string().min(3, {
      message: language === 'ar' ? "يرجى ذكر وجهة المهمة" : "Veuillez spécifier la destination de la mission",
    }),
    purpose: z.string().min(5, {
      message: language === 'ar' ? "يرجى وصف الغرض من المهمة" : "Veuillez décrire l'objet de la mission",
    }),
    startDate: z.date({
      required_error: language === 'ar' ? "يرجى تحديد تاريخ البداية" : "Veuillez sélectionner la date de début",
    }),
    endDate: z.date({
      required_error: language === 'ar' ? "يرجى تحديد تاريخ النهاية" : "Veuillez sélectionner la date de fin",
    }),
    conducteur: z.string().optional(),
    conducteurMatricule: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    additionalInfo: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monsieurMadame: "",
      matricule: "",
      destination: "",
      purpose: "",
      additionalInfo: "",
      conducteur: "",
      conducteurMatricule: "",
      startTime: "",
      endTime: "",
    },
  });

  // دالة للإرسال
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsGenerating(true);
      console.log(values);
      
      // إنشاء PDF والحصول على base64
      const pdfBase64 = await generatePDF(values);
      
      // إرسال الطلب عبر الإيميل
      const emailResult = await sendRequestWithEmail({
        type: 'mission-order',
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
        message: "تم إرسال طلب أمر المهمة وسيتم مراجعته قريباً",
        type: "success"
      });

      // Show success toast
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء أمر المهمة وإرساله للإدارة بنجاح",
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

  // دالة لتوليد PDF مع إرجاع base64
  const generatePDF = async (data: z.infer<typeof formSchema>): Promise<string> => {
    const pdfHelper = new PDFHelper();
    const currentDate = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

    // إضافة الشعار
    await pdfHelper.addLogo();

    // إضافة محتوى الوثيقة
    pdfHelper.addText(`N/Réf : OFP/DR Casa Settat/          / N° :           …/2025`, 20, 50, { fontSize: 11 });
    pdfHelper.addText(`Casablanca, le ${currentDate}`, 140, 50, { fontSize: 11 });

    // العناوين
    pdfHelper.addText("ORDRE DE MISSION", 105, 65, { 
      align: "center", 
      fontSize: 14, 
      fontStyle: "bold" 
    });
    pdfHelper.addText("OFFICE DE LA FORMATION PROFESSIONNELLE", 105, 72, { 
      align: "center", 
      fontSize: 14, 
      fontStyle: "bold" 
    });
    pdfHelper.addText("ET DE LA PROMOTION DU TRAVAIL", 105, 79, { 
      align: "center", 
      fontSize: 14, 
      fontStyle: "bold" 
    });

    pdfHelper.addText("D E S I G N E", 105, 90, { 
      align: "center", 
      fontSize: 14, 
      fontStyle: "bold" 
    });

    // رسم الجدول وإضافة البيانات
    const doc = pdfHelper.getDoc();
    const startY = 95;
    const col1X = 20;
    const col2X = 105;
    const endX = 190;
    const rowHeight = 10;

    // Header row
    doc.rect(col1X, startY, endX - col1X, rowHeight);
    pdfHelper.addText("Monsieur/Madame :", col1X + 5, startY + rowHeight / 2 + 2, { fontSize: 10 });
    pdfHelper.addText(data.monsieurMadame || "", col1X + 50, startY + rowHeight / 2 + 2, { fontSize: 10 });
    pdfHelper.addText("Matricule :", col2X + 5, startY + rowHeight / 2 + 2, { fontSize: 10 });
    pdfHelper.addText(data.matricule || "", col2X + 30, startY + rowHeight / 2 + 2, { fontSize: 10 });

    // باقي صفوف الجدول
    doc.rect(col1X, startY + rowHeight, endX - col1X, rowHeight);
    pdfHelper.addText("De se rendre à           :", col1X + 5, startY + rowHeight * 1.5 + 2, { fontSize: 10 });
    pdfHelper.addText(data.destination, col1X + 50, startY + rowHeight * 1.5 + 2, { fontSize: 10 });

    doc.rect(col1X, startY + rowHeight * 2, endX - col1X, rowHeight);
    pdfHelper.addText("Pour accomplir la mission suivante :", col1X + 5, startY + rowHeight * 2.5 + 2, { fontSize: 10 });
    pdfHelper.addText(data.purpose, col1X + 80, startY + rowHeight * 2.5 + 2, { fontSize: 10 });

    doc.rect(col1X, startY + rowHeight * 3, endX - col1X, rowHeight);
    pdfHelper.addText("Conducteur :", col1X + 5, startY + rowHeight * 3.5 + 2, { fontSize: 10 });
    pdfHelper.addText(data.conducteur || "", col1X + 40, startY + rowHeight * 3.5 + 2, { fontSize: 10 });
    pdfHelper.addText("Matricule :", col2X + 5, startY + rowHeight * 3.5 + 2, { fontSize: 10 });
    pdfHelper.addText(data.conducteurMatricule || "", col2X + 30, startY + rowHeight * 3.5 + 2, { fontSize: 10 });

    doc.rect(col1X, startY + rowHeight * 4, endX - col1X, rowHeight);
    pdfHelper.addText("Date de départ :", col1X + 5, startY + rowHeight * 4.5 + 2, { fontSize: 10 });
    pdfHelper.addText(format(data.startDate, "yyyy-MM-dd"), col1X + 45, startY + rowHeight * 4.5 + 2, { fontSize: 10 });
    pdfHelper.addText("Heure :", col2X + 5, startY + rowHeight * 4.5 + 2, { fontSize: 10 });
    pdfHelper.addText(data.startTime || "", col2X + 25, startY + rowHeight * 4.5 + 2, { fontSize: 10 });

    doc.rect(col1X, startY + rowHeight * 5, endX - col1X, rowHeight);
    pdfHelper.addText("Date de retour :", col1X + 5, startY + rowHeight * 5.5 + 2, { fontSize: 10 });
    pdfHelper.addText(format(data.endDate, "yyyy-MM-dd"), col1X + 45, startY + rowHeight * 5.5 + 2, { fontSize: 10 });
    pdfHelper.addText("Heure :", col2X + 5, startY + rowHeight * 5.5 + 2, { fontSize: 10 });
    pdfHelper.addText(data.endTime || "", col2X + 25, startY + rowHeight * 5.5 + 2, { fontSize: 10 });

    // Row 6
    const row6Height = 20;
    doc.rect(col1X, startY + rowHeight * 6, endX - col1X, row6Height);
    pdfHelper.addText("L'intéressé(e) utilisera :", col1X + 5, startY + rowHeight * 6 + row6Height / 2 + 2, { fontSize: 10 });
    pdfHelper.addText(data.additionalInfo || "", col1X + 60, startY + rowHeight * 6 + row6Height / 2 + 2, { fontSize: 10 });

    // باقي أقسام الوثيقة...
    const cadreY = startY + rowHeight * 6 + row6Height + 10;
    doc.setFillColor(220, 220, 220);
    doc.rect(col1X, cadreY, endX - col1X, rowHeight, "F");
    pdfHelper.addText("Cadre réservé à l'entité de destinations", col1X + (endX - col1X) / 2, cadreY + rowHeight / 2 + 2, { 
      align: "center", 
      fontSize: 10, 
      fontStyle: "bold" 
    });

    // Visa section
    const visaY = cadreY + rowHeight;
    const visaSectionHeight = 40;
    doc.rect(col1X, visaY, endX - col1X, visaSectionHeight);
    doc.line(col2X, visaY, col2X, visaY + visaSectionHeight);
    pdfHelper.addText("Visa d'arrivée", col1X + (col2X - col1X) / 2, visaY + rowHeight / 2 + 2, { 
      align: "center", 
      fontSize: 10 
    });
    pdfHelper.addText("Visa de départ", col2X + (endX - col2X) / 2, visaY + rowHeight / 2 + 2, { 
      align: "center", 
      fontSize: 10 
    });
    doc.line(col1X, visaY + rowHeight, endX, visaY + rowHeight);
    pdfHelper.addText("Date et Heure d'arrivée :", col1X + 5, visaY + rowHeight * 1.5 + 2, { fontSize: 10 });
    pdfHelper.addText("Date et Heure de départ :", col2X + 5, visaY + rowHeight * 1.5 + 2, { fontSize: 10 });
    pdfHelper.addText("Cachet et signature :", col1X + 5, visaY + rowHeight * 2.5 + 2, { fontSize: 10 });
    pdfHelper.addText("Cachet et signature :", col2X + 5, visaY + rowHeight * 2.5 + 2, { fontSize: 10 });

    // ملاحظة
    const noteY = visaY + visaSectionHeight + 5;
    pdfHelper.addText("NB : Le visa de départ est obligatoire pour les missions au-delà d'une journée.", 30, noteY, { 
      fontSize: 9, 
      fontStyle: "bold" 
    });

    // إضافة التذييل
    pdfHelper.addFooters();

    // حفظ الملف والحصول على base64
    const pdfBase64 = pdfHelper.getBase64();
    pdfHelper.save(`ordre_mission_${data.destination.replace(/\s+/g, '_')}.pdf`);
    
    return pdfBase64;
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
                <p className="text-slate-600 leading-relaxed mb-4 md:mb-6 text-sm md:text-base">تم إرسال طلب أمر المهمة بنجاح وسيتم معالجته قريباً</p>
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
            {language === 'ar' ? 'أمر المهمة' : 'Ordre de Mission'}
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            {language === 'ar' ? 'قم بملء البيانات المطلوبة لإصدار أمر المهمة' : 'Veuillez remplir les informations requises pour obtenir votre ordre de mission'}
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <FormField
                    control={form.control}
                    name="monsieurMadame"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">
                          {language === 'ar' ? 'السيد/السيدة' : 'Monsieur/Madame'}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="matricule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">
                          {language === 'ar' ? 'الرقم التسجيلي' : 'Matricule'}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">
                          {language === 'ar' ? 'الوجهة' : 'Destination'}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                            placeholder={t("destinationPlaceholder")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">
                          {language === 'ar' ? 'الغرض' : 'Objet'}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="resize-none border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                            placeholder={t("purposePlaceholder")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-slate-700 font-medium">
                          {language === 'ar' ? 'تاريخ البداية' : 'Date de départ'}
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal border-blue-300 focus:border-blue-500 focus:ring-blue-200",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "yyyy-MM-dd")
                                ) : (
                                  <span>{t("pickDate")}</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">
                          {language === 'ar' ? 'وقت البداية' : 'Heure de départ'}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="time" 
                            {...field} 
                            className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-slate-700 font-medium">
                          {language === 'ar' ? 'تاريخ النهاية' : 'Date de retour'}
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal border-blue-300 focus:border-blue-500 focus:ring-blue-200",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "yyyy-MM-dd")
                                ) : (
                                  <span>{t("pickDate")}</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">
                          {language === 'ar' ? 'وقت النهاية' : 'Heure de retour'}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="time" 
                            {...field} 
                            className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="conducteur"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">
                          {language === 'ar' ? 'السائق' : 'Conducteur'}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="conducteurMatricule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">
                          {language === 'ar' ? 'رقم تسجيل السائق' : 'Matricule Conducteur'}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">
                        {language === 'ar' ? 'معلومات إضافية' : 'Informations supplémentaires'}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="resize-none border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                          placeholder={t("additionalInfoPlaceholder")}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

export default MissionOrder;
