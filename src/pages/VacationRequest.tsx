
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Calendar, FileImage } from "lucide-react";
import { AmiriFont } from "../fonts/AmiriFont";

const formSchema = z.object({
  fullName: z.string().min(3, { message: "يرجى إدخال الاسم الكامل" }),
  matricule: z.string().min(1, { message: "يرجى إدخال رقم التسجيل" }),
  phone: z.string().min(10, { message: "يرجى إدخال رقم هاتف صحيح" }),
  grade: z.string().optional(),
  department: z.string().min(2, { message: "يرجى إدخال القسم" }),
  leaveType: z.string().min(1, { message: "يرجى اختيار نوع الإجازة" }),
  customLeaveType: z.string().optional(),
  customLeaveTypeFrench: z.string().optional(),
  startDate: z.string().min(1, { message: "يرجى اختيار تاريخ البداية" }),
  endDate: z.string().min(1, { message: "يرجى اختيار تاريخ النهاية" }),
  duration: z.string().min(1, { message: "يرجى إدخال مدة الإجازة" }),
  arabicDuration: z.string().optional(),
  with: z.string().optional(),
  arabicWith: z.string().optional(),
  interim: z.string().optional(),
  arabicInterim: z.string().optional(),
  reason: z.string().min(5, { message: "يرجى وصف سبب الإجازة" }),
  leaveTravel: z.string().optional(),
  signature: z.string().optional(),
  address: z.string().optional(),
  arabicAddress: z.string().optional(),
});

const VacationRequest = () => {
  const { t } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const logoPath = "/lovable-uploads/d44e75ac-eac5-4ed3-bf43-21a71c6a089d.png";
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      matricule: "",
      phone: "",
      grade: "",
      department: "",
      leaveType: "",
      customLeaveType: "",
      customLeaveTypeFrench: "",
      startDate: "",
      endDate: "",
      duration: "",
      arabicDuration: "",
      with: "",
      arabicWith: "",
      interim: "",
      arabicInterim: "",
      reason: "",
      leaveTravel: "",
      signature: "",
      address: "",
      arabicAddress: "",
    },
  });

  const leaveTypes = [
    { value: "administrative", label: "إدارية / Administratif", french: "Administratif", arabic: "إدارية" },
    { value: "marriage", label: "زواج / Mariage", french: "Mariage", arabic: "زواج" },
    { value: "birth", label: "ازدياد / Naissance", french: "Naissance", arabic: "ازدياد" },
    { value: "exceptional", label: "استثنائية / Exceptionnel", french: "Exceptionnel", arabic: "استثنائية" },
    { value: "other", label: "أخرى / Autre", french: "Autre", arabic: "أخرى" },
  ];

  const watchLeaveType = form.watch("leaveType");

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSignaturePreview(result);
        form.setValue("signature", result);
      };
      reader.readAsDataURL(file);
    }
  };

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
        doc.addImage(img, "PNG", 6, 6, 98, 33);
      } catch (error) {
        console.error("Error loading logo:", error);
      }

      // Setup fonts
      doc.addFileToVFS("Amiri-Regular.ttf", AmiriFont);
      doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
      
      // Header information
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text("N/Réf. : OFP/DR CASA SETTAT/DAAL/SRRH /N°", 20, 45);
      doc.text(`Casablanca, le ${currentDate}`, 140, 45);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("DEMANDE DE CONGÉ", 75, 60);

      // Form fields
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      
      // Name and matricule on same line
      doc.text(`Nom et Prénom : ${data.fullName}`, 20, 75);
      doc.text(`الاسم والنسب : ${data.fullName}`, 120, 75);
      
      doc.text(`Matricule : ${data.matricule}`, 20, 85);
      doc.text(`الرقم التسجيلي : ${data.matricule}`, 120, 85);
      
      // Grade/Scale on same line
      doc.text(`Echelle : ${data.grade || ""}`, 20, 95);
      doc.text(`السلم : ${data.grade || ""}`, 120, 95);
      
      // Department
      doc.text(`Service : ${data.department}`, 20, 105);
      doc.text(`المصلحة : ${data.department}`, 120, 105);
      
      // Phone
      doc.text(`Téléphone : ${data.phone}`, 20, 115);
      doc.text(`الهاتف : ${data.phone}`, 120, 115);
      
      // Leave type
      let leaveTypeText = "";
      let leaveTypeArabicText = "";
      
      if (data.leaveType === "other") {
        leaveTypeText = data.customLeaveTypeFrench || "";
        leaveTypeArabicText = data.customLeaveType || "";
      } else {
        const selectedType = leaveTypes.find(type => type.value === data.leaveType);
        leaveTypeText = selectedType?.french || "";
        leaveTypeArabicText = selectedType?.arabic || "";
      }
      
      doc.text(`Nature de congé : ${leaveTypeText}`, 20, 125);
      doc.text(`نوع الإجازة : ${leaveTypeArabicText}`, 120, 125);
      
      // Duration
      doc.text(`Durée : ${data.duration}`, 20, 135);
      doc.text(`المدة : ${data.arabicDuration || data.duration}`, 120, 135);
      
      // Dates on same line
      doc.text(`Du : ${data.startDate}`, 20, 145);
      doc.text(`Au : ${data.endDate}`, 70, 145);
      doc.text(`ابتداء من : ${data.startDate}`, 120, 145);
      doc.text(`إلى : ${data.endDate}`, 170, 145);
      
      // With family
      if (data.with) {
        doc.text(`Avec : ${data.with}`, 20, 155);
        doc.text(`مع : ${data.arabicWith || data.with}`, 120, 155);
      }
      
      // Interim
      if (data.interim) {
        doc.text(`Intérim : ${data.interim}`, 20, 165);
        doc.text(`النيابة : ${data.arabicInterim || data.interim}`, 120, 165);
      }
      
      // Address
      if (data.address) {
        doc.text(`Adresse : ${data.address}`, 20, 175);
        doc.text(`العنوان : ${data.arabicAddress || data.address}`, 120, 175);
      }
      
      // Travel indication
      if (data.leaveTravel) {
        doc.text(`${data.leaveTravel}`, 20, 185);
      }
      
      // Reason
      doc.text(`Motif : ${data.reason}`, 20, 195);
      
      // Signature section
      doc.text("Signature de l'intéressé", 20, 220);
      doc.text("امضاء المعني بالأمر", 120, 220);
      
      // Add signature if provided
      if (data.signature) {
        try {
          doc.addImage(data.signature, "PNG", 20, 225, 30, 15);
        } catch (error) {
          console.error("Error adding signature:", error);
        }
      }

      doc.save("demande_de_conge.pdf");
      
      setIsSubmitted(true);

      toast({
        title: "تم بنجاح",
        description: "تم إنشاء طلب الإجازة وتحميله بنجاح",
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
                <p className="text-slate-600 leading-relaxed mb-4 md:mb-6 text-sm md:text-base">تم إرسال طلب الإجازة بنجاح وسيتم معالجته قريباً</p>
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
            <Calendar className="w-6 h-6 md:w-8 md:h-8 text-cmc-blue" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">طلب إجازة</h1>
          <p className="text-slate-600 text-sm md:text-base">قم بملء البيانات المطلوبة لتقديم طلب الإجازة</p>
        </div>

        <Card className="cmc-card">
          <CardHeader className="cmc-gradient text-white rounded-t-lg p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl font-semibold text-center">معلومات الطلب</CardTitle>
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

                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">رقم الهاتف / Téléphone</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="tel"
                            className="cmc-input"
                            placeholder="أدخل رقم الهاتف"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="grade" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">السلم / Echelle</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                            placeholder="أدخل السلم"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="department" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">المصلحة / Service</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                            placeholder="أدخل المصلحة"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Leave Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-cmc-green-light pb-2 mb-4">
                    معلومات الإجازة
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <FormField control={form.control} name="leaveType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">نوع الإجازة / Nature de congé</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="cmc-input">
                              <SelectValue placeholder="اختر نوع الإجازة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {leaveTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {watchLeaveType === "other" && (
                      <>
                        <FormField control={form.control} name="customLeaveType" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">نوع الإجازة (عربي)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="cmc-input"
                                placeholder="أدخل نوع الإجازة بالعربية"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="customLeaveTypeFrench" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">نوع الإجازة (فرنسي)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="cmc-input"
                                placeholder="Entrez le type de congé en français"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </>
                    )}

                    <FormField control={form.control} name="duration" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">المدة (فرنسي) / Durée</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                            placeholder="Ex: 5 jours"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="arabicDuration" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">المدة (عربي)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                            placeholder="مثال: 5 أيام"
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

                    <FormField control={form.control} name="with" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">مع (فرنسي) / Avec</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                            placeholder="Avec époux/épouse et enfants"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="arabicWith" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">مع (عربي)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                            placeholder="مع الزوج/الزوجة والأطفال"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="interim" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">النيابة (فرنسي) / Intérim</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                            placeholder="Nom et fonction du remplaçant"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="arabicInterim" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">النيابة (عربي)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                            placeholder="اسم ووظيفة المتنائب"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">العنوان (فرنسي) / Adresse</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                            placeholder="Adresse pendant le congé"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="arabicAddress" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">العنوان (عربي)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                            placeholder="العنوان أثناء الإجازة"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="leaveTravel" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-slate-700 font-medium">مغادرة التراب الوطني / Quitter le territoire Marocain</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                            placeholder="إذا كنت تنوي مغادرة التراب الوطني، اذكر ذلك هنا"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                <FormField control={form.control} name="reason" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">سبب الإجازة / Motif</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        className="resize-none cmc-input" 
                        placeholder="أدخل سبب طلب الإجازة"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="signature" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">التوقيع (اختياري) / Signature</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2 p-4 border border-dashed border-cmc-blue rounded-lg bg-cmc-blue-light/30">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleSignatureChange}
                          className="border-0 bg-transparent"
                        />
                        <FileImage className="h-5 w-5 text-cmc-blue" />
                      </div>
                    </FormControl>
                    {signaturePreview && (
                      <div className="mt-2">
                        <img 
                          src={signaturePreview} 
                          alt="Signature preview" 
                          className="max-w-32 max-h-16 border rounded shadow-sm"
                        />
                      </div>
                    )}
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

export default VacationRequest;
