
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { ar, fr } from "date-fns/locale";
import { CalendarIcon, FileImage, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { AmiriFont } from "@/fonts/AmiriFont";
// @ts-ignore
import * as reshaper from "arabic-persian-reshaper";
// @ts-ignore
import bidi from "bidi-js";

// تعريف الأنواع
type LeaveType = 'administrative' | 'marriage' | 'birth' | 'exceptional';

interface LeaveTypeMapping {
  [key: string]: {
    fr: string;
    ar: string;
  };
}

// تعريف الثوابت
const LEAVE_TYPES: LeaveTypeMapping = {
  administrative: { fr: "Administratif", ar: "إدارية" },
  marriage: { fr: "Mariage", ar: "زواج" },
  birth: { fr: "Naissance", ar: "ازدياد" },
  exceptional: { fr: "Exceptionnel", ar: "استثنائية" },
};

// تعريف مخطط النموذج
const formSchema = z.object({
  fullName: z.string().min(3, { message: "يرجى إدخال الاسم الكامل" }),
  matricule: z.string().min(1, { message: "يرجى إدخال الرقم المالي" }),
  echelle: z.string().optional(),
  echelon: z.string().optional(),
  grade: z.string().optional(),
  fonction: z.string().optional(),
  direction: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  leaveType: z.string().min(1, { message: "يرجى اختيار نوع الإجازة" }),
  duration: z.string().min(1, { message: "يرجى تحديد المدة" }),
  startDate: z.date({ required_error: "يرجى تحديد تاريخ البداية" }),
  endDate: z.date({ required_error: "يرجى تحديد تاريخ النهاية" }),
  with: z.string().optional(),
  interim: z.string().optional(),
  leaveMorocco: z.string().optional(),
  refNumber: z.string().optional(),
});

const VacationRequest = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const { language, t } = useLanguage();
  const logoPath = "/lovable-uploads/d44e75ac-eac5-4ed3-bf43-21a71c6a089d.png";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      matricule: "",
      echelle: "",
      echelon: "",
      grade: "",
      fonction: "",
      direction: "",
      address: "",
      phone: "",
      leaveType: "",
      duration: "",
      startDate: undefined,
      endDate: undefined,
      with: "",
      interim: "",
      leaveMorocco: "",
      refNumber: "",
    },
  });

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // دالة لمعالجة النص العربي
  const processArabicText = (text: string): string => {
    if (!text) return "";
    try {
      const reshaped = reshaper.reshape(text);
      const bidiText = bidi.from_string(reshaped, { dir: 'rtl' });
      return bidiText.toString();
    } catch (error) {
      console.error("Error processing Arabic text:", error);
      return text;
    }
  };

  const generatePDF = (data: z.infer<typeof formSchema>) => {
    const doc = new jsPDF("p", "mm", "a4");
    
    const currentDate = format(new Date(), "dd/MM/yyyy");
    const refNumber = data.refNumber || "OFP/DR……/CMC…../N°";

    // إضافة خط عربي
    doc.addFileToVFS("Amiri-Regular.ttf", AmiriFont);
    doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");

    // إعداد الخطوط
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);

    // إضافة الشعار
    try {
      doc.addImage(logoPath, "PNG", 10, 10, 50, 25);
    } catch (error) {
      console.log("Could not load logo:", error);
    }

    // ترويسة المستند
    doc.text(`Réf : ${refNumber}/2025`, 20, 45);
    doc.text(`Date : ${currentDate}`, 20, 52);

    // العنوان المركز
    doc.setFontSize(16);
    doc.setFont("Helvetica", "bold");
    doc.text("Demande de congé", 105, 70, { align: "center" });
    
    // العنوان العربي
    doc.setFont("Amiri", "normal");
    const arabicTitle = processArabicText("طلب إجازة");
    doc.text(arabicTitle, 105, 78, { align: "center" });

    // إعادة تعيين الخط للنص العادي
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);

    // دالة مساعدة لإضافة الصفوف
    const addRow = (labelFr: string, value: string | undefined, labelAr: string, y: number) => {
      // النص الفرنسي
      doc.setFont("Helvetica", "normal");
      doc.text(`${labelFr} :`, 20, y);
      doc.text(`${value || "........................"}`, 70, y);
      
      // النص العربي
      doc.setFont("Amiri", "normal");
      const processedArabicLabel = processArabicText(`${labelAr} :`);
      doc.text(processedArabicLabel, 190, y, { align: "right" });
    };

    let currentY = 95;

    // معلومات الموظف
    addRow("Nom & Prénom", data.fullName, "الإسم الكامل", currentY);
    currentY += 7;
    addRow("Matricule", data.matricule, "الرقم المالي", currentY);
    currentY += 7;
    addRow("Echelle", data.echelle, "السلم", currentY);
    currentY += 7;
    addRow("Echelon", data.echelon, "الرتبة", currentY);
    currentY += 7;
    addRow("Grade", data.grade, "الدرجة", currentY);
    currentY += 7;
    addRow("Fonction", data.fonction, "الوظيفة", currentY);
    currentY += 15;

    // عنوان قسم التعيين
    doc.setFont("Helvetica", "bold");
    doc.text("Affectation", 105, currentY, { align: "center" });
    doc.setFont("Amiri", "normal");
    const affectationArabic = processArabicText("التعيين");
    doc.text(affectationArabic, 105, currentY + 7, { align: "center" });
    doc.setFont("Helvetica", "normal");
    currentY += 20;

    // معلومات التعيين
    addRow("Direction", data.direction, "المديرية", currentY);
    currentY += 7;
    addRow("Adresse", data.address, "العنوان", currentY);
    currentY += 7;
    addRow("Téléphone", data.phone, "الهاتف", currentY);
    currentY += 15;

    // معلومات الإجازة
    const selectedLeaveType = LEAVE_TYPES[data.leaveType as LeaveType];
    const leaveTypeText = selectedLeaveType ? `${selectedLeaveType.fr} / ${selectedLeaveType.ar}` : data.leaveType;
    
    addRow("Nature de congé (2)", leaveTypeText, "نوع الإجازة (2)", currentY);
    currentY += 7;
    addRow("Durée", data.duration, "المدة", currentY);
    currentY += 7;
    addRow("Du", format(data.startDate, "dd/MM/yyyy"), "ابتداء من", currentY);
    currentY += 7;
    addRow("Au", format(data.endDate, "dd/MM/yyyy"), "إلى", currentY);
    currentY += 7;
    addRow("Avec (3)", data.with, "مع (3)", currentY);
    currentY += 7;
    addRow("Intérim (Nom et Fonction)", data.interim, "النيابة (الإسم والوظيفة)", currentY);
    currentY += 20;

    // أقسام التوقيع
    const signatureY = currentY;
    
    // توقيع المعني بالأمر
    doc.setFont("Helvetica", "normal");
    doc.text("Signature de l'intéressé", 30, signatureY);
    doc.setFont("Amiri", "normal");
    const signatureArabic = processArabicText("إمضاء المعني(ة) بالأمر");
    doc.text(signatureArabic, 30, signatureY + 7);
    
    // إضافة التوقيع إذا كان متوفراً
    if (signaturePreview) {
      doc.addImage(signaturePreview, "PNG", 25, signatureY + 10, 40, 20);
    }
    
    // رأي الرئيس المباشر
    doc.setFont("Helvetica", "normal");
    doc.text("Avis du Chef Immédiat", 105, signatureY, { align: "center" });
    doc.setFont("Amiri", "normal");
    const chiefOpinionArabic = processArabicText("رأي الرئيس المباشر");
    doc.text(chiefOpinionArabic, 105, signatureY + 7, { align: "center" });
    
    // رأي المدير
    doc.setFont("Helvetica", "normal");
    doc.text("Avis du Directeur", 175, signatureY, { align: "center" });
    doc.setFont("Amiri", "normal");
    const directorOpinionArabic = processArabicText("رأي المدير");
    doc.text(directorOpinionArabic, 175, signatureY + 7, { align: "center" });

    // ملاحظات هامة
    const notesY = signatureY + 50;
    doc.setFontSize(10);
    doc.setFont("Helvetica", "bold");
    doc.text("Très important :", 20, notesY);
    doc.setFont("Amiri", "normal");
    const importantArabic = processArabicText("شيء مهم جداً :");
    doc.text(importantArabic, 190, notesY, { align: "right" });

    // ملاحظات تفصيلية
    doc.setFontSize(9);
    doc.setFont("Helvetica", "normal");
    const frenchNotes = [
      "Aucun agent n'est autorisé à quitter le lieu de son travail avant d'avoir",
      "obtenu sa décision de congé le cas échéant il sera considéré en",
      "abandon de poste.",
      "(1) La demande doit être déposée 8 jours avant la date demandée",
      "(2) Nature de congé : Administratif - Mariage - Naissance - Exceptionnel",
      "(3) Si l'intéressé projette de quitter le territoire Marocain il faut qu'il",
      "le mentionne \"Quitter le territoire Marocain\"",
    ];

    const arabicNotes = [
      "لا يسمح لأي موظف بمغادرة مكان عمله قبل الحصول على قرار الإجازة وإلا اعتبر في حالة",
      "تخلي عن المنصب.",
      "",
      "(1) يجب تقديم الطلب قبل 8 أيام من التاريخ المطلوب",
      "(2) نوع الإجازة : إدارية - زواج - ازدياد - استثنائية",
      "(3) إذا كان المعني بالأمر يريد مغادرة التراب المغربي فعليه أن يذكر ذلك",
      "\"مغادرة التراب المغربي\"",
    ];

    let startY = notesY + 7;
    frenchNotes.forEach((line, i) => {
      if (line) {
        doc.setFont("Helvetica", "normal");
        doc.text(line, 20, startY);
      }
      if (i < arabicNotes.length && arabicNotes[i]) {
        doc.setFont("Amiri", "normal");
        const processedNote = processArabicText(arabicNotes[i]);
        doc.text(processedNote, 190, startY, { align: "right" });
      }
      startY += 4;
    });

    // حفظ الملف
    doc.save(`demande_conge_${data.fullName.replace(/\s+/g, "_")}.pdf`);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitted(true);
    generatePDF(values);
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">{t("vacationRequestTitle")}</h1>

      {isSubmitted ? (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  تم إرسال الطلب بنجاح!
                </h2>
                <p className="text-muted-foreground">
                  تم تحميل ملف PDF لطلب الإجازة.
                  <br />
                  يرجى طباعته وتقديمه للإدارة.
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => setIsSubmitted(false)}
                >
                  طلب جديد
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">معلومات طلب الإجازة</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* معلومات المرجع والتاريخ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="refNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم المرجع (Réf)</FormLabel>
                        <FormControl>
                          <Input placeholder="OFP/DR……/CMC…../N°" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* المعلومات الشخصية */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold border-b pb-2">المعلومات الشخصية</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الاسم الكامل (Nom & Prénom) *</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>الرقم المالي (Matricule) *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="echelle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>السلم (Echelle)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="echelon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الرتبة (Echelon)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="grade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الدرجة (Grade)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="fonction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الوظيفة (Fonction)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* معلومات التعيين */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold border-b pb-2">التعيين (Affectation)</h3>
                  
                  <FormField
                    control={form.control}
                    name="direction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المديرية (Direction)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>العنوان (Adresse)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الهاتف (Téléphone)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* معلومات الإجازة */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold border-b pb-2">معلومات الإجازة</h3>
                  
                  <FormField
                    control={form.control}
                    name="leaveType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع الإجازة (Nature de congé) *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر نوع الإجازة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="administrative">إدارية - Administratif</SelectItem>
                            <SelectItem value="marriage">زواج - Mariage</SelectItem>
                            <SelectItem value="birth">ازدياد - Naissance</SelectItem>
                            <SelectItem value="exceptional">استثنائية - Exceptionnel</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المدة (Durée) *</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: 3 أيام" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>ابتداء من (Du) *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-right font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy")
                                  ) : (
                                    <span>اختر التاريخ</span>
                                  )}
                                  <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0, 0, 0, 0))
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
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>إلى (Au) *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-right font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy")
                                  ) : (
                                    <span>اختر التاريخ</span>
                                  )}
                                  <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => {
                                  const startDate = form.getValues("startDate");
                                  return (
                                    date < (startDate || new Date(new Date().setHours(0, 0, 0, 0)))
                                  );
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="with"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>مع (Avec)</FormLabel>
                          <FormControl>
                            <Input placeholder="إذا كانت الإجازة مع شخص آخر" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="interim"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>النيابة - الاسم والوظيفة (Intérim)</FormLabel>
                          <FormControl>
                            <Input placeholder="اسم ووظيفة من سينوب عنك" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="leaveMorocco"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>هل تنوي مغادرة التراب المغربي؟</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-row space-x-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="yes" />
                              <label htmlFor="yes">نعم</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="no" />
                              <label htmlFor="no">لا</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* التوقيع */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold border-b pb-2">التوقيع</h3>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleSignatureChange}
                        className="hidden"
                        id="signature-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("signature-upload")?.click()}
                        className="w-full"
                      >
                        <FileImage className="mr-2 h-4 w-4" />
                        رفع التوقيع (اختياري)
                      </Button>
                    </div>
                    {signaturePreview && (
                      <div className="border rounded-md p-2">
                        <img
                          src={signaturePreview}
                          alt="التوقيع"
                          className="max-h-32 mx-auto"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <Button type="submit" className="px-8">
                    إرسال وتحميل PDF
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VacationRequest;
