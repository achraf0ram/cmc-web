
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
import jsPDF from "jspdf";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Briefcase } from "lucide-react";

const formSchema = z.object({
  fullName: z.string().min(3, { message: "يرجى إدخال الاسم الكامل" }),
  matricule: z.string().min(1, { message: "يرجى إدخال رقم التسجيل" }),
  grade: z.string().optional(),
  department: z.string().min(2, { message: "يرجى إدخال القسم" }),
  destination: z.string().min(3, { message: "يرجى إدخال وجهة المهمة" }),
  startDate: z.string().min(1, { message: "يرجى اختيار تاريخ البداية" }),
  endDate: z.string().min(1, { message: "يرجى اختيار تاريخ النهاية" }),
  purpose: z.string().min(10, { message: "يرجى وصف الغرض من المهمة" }),
  transportation: z.string().optional(),
  accommodationExpenses: z.string().optional(),
  dailyAllowance: z.string().optional(),
  travelExpenses: z.string().optional(),
  otherExpenses: z.string().optional(),
  totalExpenses: z.string().optional(),
  accompaniedBy: z.string().optional(),
  missionType: z.string().optional(),
  specialInstructions: z.string().optional(),
});

const MissionOrder = () => {
  const { t } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const logoPath = "/lovable-uploads/d44e75ac-eac5-4ed3-bf43-21a71c6a089d.png";
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      matricule: "",
      grade: "",
      department: "",
      destination: "",
      startDate: "",
      endDate: "",
      purpose: "",
      transportation: "",
      accommodationExpenses: "",
      dailyAllowance: "",
      travelExpenses: "",
      otherExpenses: "",
      totalExpenses: "",
      accompaniedBy: "",
      missionType: "",
      specialInstructions: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsGenerating(true);
      
      const doc = new jsPDF("p", "mm", "a4");
      const currentDate = format(new Date(), "dd/MM/yyyy");

      // Load and add logo
      try {
        const img = new Image();
        img.src = logoPath;
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        doc.addImage(img, "PNG", 20, 10, 80, 30);
      } catch (error) {
        console.error("Error loading logo:", error);
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text("N/Réf. : OFP/DR CASA SETTAT/DAAL/SRRH /N°", 20, 50);
      doc.text(`Casablanca, le ${currentDate}`, 140, 50);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("ORDRE DE MISSION", 75, 70);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      
      doc.text(`Nom et Prénom : ${data.fullName}`, 20, 90);
      doc.text(`Matricule : ${data.matricule}`, 20, 100);
      doc.text(`Grade : ${data.grade || ""}`, 20, 110);
      doc.text(`Service : ${data.department}`, 20, 120);
      doc.text(`Destination : ${data.destination}`, 20, 130);
      doc.text(`Du : ${data.startDate} Au : ${data.endDate}`, 20, 140);
      doc.text(`Objet de la mission : ${data.purpose}`, 20, 150);
      
      if (data.missionType) {
        doc.text(`Type de mission : ${data.missionType}`, 20, 160);
      }
      
      if (data.transportation) {
        doc.text(`Moyen de transport : ${data.transportation}`, 20, 170);
      }
      
      if (data.accompaniedBy) {
        doc.text(`Accompagné par : ${data.accompaniedBy}`, 20, 180);
      }
      
      // Financial details
      let yPosition = 190;
      if (data.dailyAllowance) {
        doc.text(`Indemnité journalière : ${data.dailyAllowance}`, 20, yPosition);
        yPosition += 10;
      }
      
      if (data.accommodationExpenses) {
        doc.text(`Frais d'hébergement : ${data.accommodationExpenses}`, 20, yPosition);
        yPosition += 10;
      }
      
      if (data.travelExpenses) {
        doc.text(`Frais de déplacement : ${data.travelExpenses}`, 20, yPosition);
        yPosition += 10;
      }
      
      if (data.otherExpenses) {
        doc.text(`Autres frais : ${data.otherExpenses}`, 20, yPosition);
        yPosition += 10;
      }
      
      if (data.totalExpenses) {
        doc.setFont("helvetica", "bold");
        doc.text(`Total des frais : ${data.totalExpenses}`, 20, yPosition);
        doc.setFont("helvetica", "normal");
        yPosition += 10;
      }
      
      if (data.specialInstructions) {
        yPosition += 10;
        doc.text("Instructions spéciales :", 20, yPosition);
        yPosition += 10;
        const lines = doc.splitTextToSize(data.specialInstructions, 170);
        doc.text(lines, 20, yPosition);
        yPosition += lines.length * 10;
      }

      doc.text("Le Directeur Régional", 140, 220);
      doc.text("Signature et cachet", 140, 230);

      doc.save("ordre_de_mission.pdf");
      
      setIsSubmitted(true);

      toast({
        title: "تم بنجاح",
        description: "تم إنشاء أمر المهمة وتحميله بنجاح",
        variant: "default",
        className: "bg-green-50 border-green-200",
      });

    } catch (error) {
      console.error("Error:", error);
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
      <div className="min-h-screen cmc-page-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md cmc-card">
          <CardContent className="pt-6 pb-6 md:pt-8 md:pb-8">
            <div className="flex flex-col items-center text-center gap-4 md:gap-6">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gradient-to-r from-cmc-green-light to-emerald-100 flex items-center justify-center shadow-lg">
                <CheckCircle className="h-8 w-8 md:h-10 md:w-10 text-cmc-green" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-slate-800">تم الإرسال بنجاح</h2>
                <p className="text-slate-600 leading-relaxed mb-4 md:mb-6 text-sm md:text-base">تم إرسال أمر المهمة بنجاح وسيتم معالجته قريباً</p>
                <Button 
                  onClick={() => setIsSubmitted(false)}
                  className="cmc-button-primary px-6 md:px-8 py-2 md:py-3 rounded-lg text-sm md:text-base"
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
    <div className="min-h-screen cmc-page-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-cmc-blue-light to-cmc-green-light rounded-full mb-4 shadow-lg">
            <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-cmc-blue" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">أمر مهمة</h1>
          <p className="text-slate-600 text-sm md:text-base">قم بملء البيانات المطلوبة لإصدار أمر المهمة</p>
        </div>

        <Card className="cmc-card">
          <CardHeader className="cmc-gradient text-white rounded-t-lg p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl font-semibold text-center">معلومات المهمة</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 md:space-y-6">
                {/* Personal Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-cmc-blue-light pb-2 mb-4">
                    المعلومات الشخصية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">الاسم الكامل / Nom complet</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                            placeholder="أدخل الاسم الكامل"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="matricule" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">الرقم التسجيلي / Matricule</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                            placeholder="أدخل الرقم التسجيلي"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="grade" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">الرتبة / Grade</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                            placeholder="أدخل الرتبة"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="department" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">القسم / Service</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                            placeholder="أدخل القسم"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Mission Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-cmc-green-light pb-2 mb-4">
                    معلومات المهمة
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <FormField control={form.control} name="destination" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">وجهة المهمة / Destination</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                            placeholder="أدخل وجهة المهمة"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="missionType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">نوع المهمة / Type de mission</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                            placeholder="أدخل نوع المهمة"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="startDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">تاريخ البداية / Du</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            className="cmc-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="endDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">تاريخ النهاية / Au</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            className="cmc-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="transportation" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">وسيلة النقل / Transport</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                            placeholder="أدخل وسيلة النقل"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="accompaniedBy" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">مرافق بواسطة / Accompagné par</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                            placeholder="أدخل اسم المرافق إن وجد"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Financial Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-cmc-blue-light pb-2 mb-4">
                    المعلومات المالية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <FormField control={form.control} name="dailyAllowance" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">البدل اليومي / Indemnité journalière</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                            placeholder="أدخل البدل اليومي"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="accommodationExpenses" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">مصاريف الإقامة / Frais d'hébergement</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                            placeholder="أدخل مصاريف الإقامة"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="travelExpenses" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">مصاريف السفر / Frais de déplacement</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                            placeholder="أدخل مصاريف السفر"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="otherExpenses" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">مصاريف أخرى / Autres frais</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                            placeholder="أدخل المصاريف الأخرى"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="totalExpenses" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-slate-700 font-medium">إجمالي المصاريف / Total des frais</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                            placeholder="أدخل إجمالي المصاريف"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                <FormField control={form.control} name="purpose" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">الغرض من المهمة / Objet de la mission</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        className="resize-none cmc-input" 
                        placeholder="أدخل الغرض من المهمة بالتفصيل"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="specialInstructions" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">تعليمات خاصة / Instructions spéciales</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        className="resize-none cmc-input" 
                        placeholder="أدخل أي تعليمات خاصة"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="flex justify-center pt-4 md:pt-6">
                  <Button 
                    type="submit" 
                    disabled={isGenerating}
                    className="cmc-button-primary px-8 md:px-12 py-2 md:py-3 rounded-lg text-sm md:text-base"
                  >
                    {isGenerating ? "جاري المعالجة..." : "إرسال وتحميل PDF"}
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
