import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ar, fr } from "date-fns/locale";
import { CalendarIcon, FileImage, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { AmiriFont } from "../fonts/AmiriFont";
import { AmiriBoldFont } from "../fonts/AmiriBoldFont";
import jsPDF from "jspdf";

// Import Arabic reshaping libraries
import * as reshaper from "arabic-persian-reshaper";
const reshape = reshaper.reshape;
import bidi from "bidi-js";

// Define form schema and type at the top level
const formSchema = z.object({
  fullName: z.string().min(3, { message: "يرجى إدخال الاسم الكامل" }),
  matricule: z.string().min(1, { message: "يرجى إدخال الرقم المالي" }),
  echelle: z.string().optional(),
  echelon: z.string().optional(),
  grade: z.string().optional(),
  fonction: z.string().optional(),
  arabicFonction: z.string().optional(),
  direction: z.string().optional(),
  arabicDirection: z.string().optional(),
  address: z.string().optional(),
  arabicAddress: z.string().optional(),
  phone: z.string().optional(),
  leaveType: z.string().min(1, { message: "يرجى اختيار نوع الإجازة" }),
  customLeaveType: z.string().optional(),
  arabicCustomLeaveType: z.string().optional(),
  duration: z.string().min(1, { message: "يرجى تحديد المدة" }),
  arabicDuration: z.string().optional(),
  startDate: z.date({ required_error: "يرجى تحديد تاريخ البداية" }),
  endDate: z.date({ required_error: "يرجى تحديد تاريخ النهاية" }),
  with: z.string().optional(),
  arabicWith: z.string().optional(),
  interim: z.string().optional(),
  arabicInterim: z.string().optional(),
  leaveMorocco: z.boolean().optional(),
  signature: z.union([z.instanceof(File), z.string()]).optional(),
});

type FormData = z.infer<typeof formSchema>;

// Define translateToArabic function outside the component
const translateToArabic = (frenchText: string): string => {
  if (!frenchText || frenchText.trim() === "") return "";
  
  const translations: Record<string, string> = {
    "Administratif": "إدارية",
    "Mariage": "زواج", 
    "Naissance": "ازدياد",
    "Exceptionnel": "استثنائية",
    "jour": "يوم",
    "jours": "أيام",
    "semaine": "أسبوع",
    "semaines": "أسابيع",
    "mois": "شهر",
    "avec": "مع",
    "sans": "بدون",
    "famille": "عائلة",
    "époux": "زوج",
    "épouse": "زوجة",
    "enfant": "طفل",
    "enfants": "أطفال",
    "parent": "والد",
    "parents": "والدين",
    "Directeur": "مدير",
    "Chef": "رئيس",
    "Responsable": "مسؤول",
    "Adjoint": "مساعد",
    "Secrétaire": "كاتب",
    "Comptable": "محاسب",
    "Informaticien": "مختص في المعلوميات",
    "Technicien": "تقني",
    "Ingénieur": "مهندس",
    "Direction": "مديرية",
    "Service": "مصلحة",
    "Bureau": "مكتب",
    "Département": "قسم",
    "urgence": "طارئ",
    "maladie": "مرض",
    "personnel": "شخصي",
    "voyage": "سفر",
    "formation": "تكوين",
    "repos": "راحة",
  };

  let arabicText = frenchText;
  Object.entries(translations).forEach(([french, arabic]) => {
    const regex = new RegExp(`\\b${french}\\b`, 'gi');
    arabicText = arabicText.replace(regex, arabic);
  });

  return arabicText !== frenchText ? arabicText : frenchText;
};

// Define formatArabicForPDF function outside the component (if needed by generatePDF)
const formatArabicForPDF = (text: string): string => {
  if (!text || text.trim() === "") return "";
  
  try {
    const arabicText = translateToArabic(text);
    const shaped = reshape(arabicText);
    return bidi.from_string(shaped).toString();
  } catch (error) {
    console.warn("Error formatting Arabic text:", error);
    return text;
  }
};

const VacationRequest = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showCustomLeaveType, setShowCustomLeaveType] = useState(false);
  const { language, t } = useLanguage();
  const logoPath = "/lovable-uploads/d44e75ac-eac5-4ed3-bf43-21a71c6a089d.png";

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
      startDate: undefined,
      endDate: undefined,
      with: "",
      arabicWith: "",
      interim: "",
      arabicInterim: "",
      leaveMorocco: false,
      signature: undefined,
    },
  });

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

  const onSubmit = async (values: FormData) => {
    setIsSubmitted(true);
    setIsGeneratingPDF(true);
    await generatePDF(values);
    setIsGeneratingPDF(false);
  };

  const generatePDF = async (data: FormData) => {
    return new Promise<void>((resolve) => {
      try {
        const doc = new jsPDF();
        
        // إعداد الخط العربي
        doc.addFileToVFS("Amiri-Regular.ttf", AmiriFont as unknown as string);
        doc.addFileToVFS("Amiri-Bold.ttf", AmiriBoldFont as unknown as string);
        doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
        doc.addFont("Amiri-Bold.ttf", "Amiri", "bold");
        
        console.log("jsPDF document created. Attempting to add logo.");

        // إضافة الشعار إن وجد
        if (logoPath) {
          console.log("Logo path found:", logoPath);
          const img = new Image();
          img.src = logoPath;
          img.onload = () => {
            console.log("Logo image loaded successfully.");
            doc.addImage(img, "PNG", 10, 4, 66, 20);
            addContent(doc, data, resolve);
          }
          img.onerror = (err) => {
            console.error("Error loading logo image:", err);
            addContent(doc, data, resolve);
          };
        } else {
          console.log("No logo path specified. Adding content directly.");
          addContent(doc, data, resolve);
        }
      } catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
      }
    });
  };

  // Helper function to add content after logo loading
  const addContent = (doc: jsPDF, data: FormData, resolve: () => void) => {
    console.log("Adding PDF content.");
    
    // رأس الصفحة
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    // Position Réf and Date text
    let headerTextY = 35;
    
    // Réf text - Bold label and normal value
    doc.setFont("helvetica", "bold");
    doc.text("Réf :", 20, headerTextY);
    const refLabelWidth = doc.getTextWidth("Réf :");
    doc.setFont("helvetica", "normal");
    doc.text(`OFP/DR……/CMC…../N° /2025`, 20 + refLabelWidth, headerTextY);
    
    headerTextY += 7; // Move down for Date line
    
    // Date text - Bold label and normal value
    doc.setFont("helvetica", "bold");
    doc.text("Date :", 20, headerTextY);
    const dateLabelWidth = doc.getTextWidth("Date :");
    doc.setFont("helvetica", "normal");
    doc.text(`${format(new Date(), "dd/MM/yyyy")}`, 20 + dateLabelWidth, headerTextY);
    
    // العنوان الرئيسي
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Demande de congé", 105, 56, { align: "center" });
    doc.setFont("Amiri", "bold");
    doc.text("(1) طلب إجازة", 105, 63, { align: "center" });
    
    let currentY = 80;
    const lineHeight = 8;
    
    // معلومات شخصية
    doc.setFontSize(11);
    
    // الاسم الكامل
    doc.setFont("helvetica", "normal");
    doc.text(`Nom & Prénom : ${data.fullName || '…………………………………'}`, 20, currentY);
    doc.setFont("Amiri", "normal");
    doc.text(formatArabicForPDF(`${data.fullName || '…………………………………'} : الاسم الكامل`), 190, currentY, { align: "right" });
    currentY += lineHeight;
    
    // الرقم المالي
    doc.setFont("helvetica", "normal");
    doc.text(`Matricule : ${data.matricule || '…………………………………'}`, 20, currentY);
    doc.setFont("Amiri", "normal");
    doc.text(formatArabicForPDF(`${data.matricule || '…………………………………'} : الرقم المالي`), 190, currentY, { align: "right" });
    currentY += lineHeight;
    
    // السلم والرتبة في نفس السطر
    doc.setFont("helvetica", "normal");
    doc.text(`Echelle : ${data.echelle || '………………'}`, 20, currentY);
    doc.text(`Echelon : ${data.echelon || '………………'}`, 100, currentY, { align: "right" });
    doc.setFont("Amiri", "normal");
    doc.text(formatArabicForPDF(`${data.echelle || '………………'} : السلم`), 190, currentY, { align: "right" });
    doc.text(formatArabicForPDF(`${data.echelon || '………………'} : الرتبة`), 130, currentY);
    currentY += lineHeight;
    
    // الدرجة
    doc.setFont("helvetica", "normal");
    doc.text(`Grade : ${data.grade || '…………………………………'}`, 20, currentY);
    doc.setFont("Amiri", "normal");
    doc.text(formatArabicForPDF(`${data.grade || '…………………………………'} : الدرجة`), 190, currentY, { align: "right" });
    currentY += lineHeight;
    
    // الوظيفة
    const functionText = data.fonction || '…………………………………';
    const arabicFunctionText = data.arabicFonction || '…………………………………';
    doc.setFont("helvetica", "normal");
    doc.text(`Fonction : ${functionText}`, 20, currentY);
    doc.setFont("Amiri", "normal");
    doc.text(formatArabicForPDF(`${arabicFunctionText} : الوظيفة`), 190, currentY, { align: "right" });
    currentY += lineHeight + 5;
    
    // قسم التعيين
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Affectation", 105, currentY, { align: "center" });
    doc.setFont("Amiri", "bold");
    doc.text("التعيين", 105, currentY + 5, { align: "center" });
    currentY += 15;
    
    doc.setFontSize(11);
    // المديرية
const directionText = data.direction || '………………';
const arabicDirectionText = data.arabicDirection || '………………';
doc.setFont("helvetica", "normal");
doc.text(`Direction : ${directionText}`, 20, currentY);

doc.setFont("Amiri", "normal");
const dirText = data.arabicDirection 
    ? `${arabicDirectionText} :المديرية` 
    : `${arabicDirectionText} :المديرية`;
doc.text(dirText, 190, currentY, { align: "right" });

currentY += lineHeight;

// العنوان
const addressText = data.address || '………………';
const arabicAddressText = data.arabicAddress || '………………';
doc.setFont("helvetica", "normal");
doc.text(`Adresse : ${addressText}`, 20, currentY);

doc.setFont("Amiri", "normal");
const addrText = data.arabicAddress 
    ? `${arabicAddressText} :العنوان` 
    : `${arabicAddressText} :العنوان`;
doc.text(addrText, 190, currentY, { align: "right" });

currentY += lineHeight;
    // الهاتف
    doc.setFont("helvetica", "normal");
    doc.text(`Téléphone : ${data.phone || '…………………………………'}`, 20, currentY);
    doc.setFont("Amiri", "normal");
    doc.text(formatArabicForPDF(`${data.phone || '…………………………………'} : الهاتف`), 190, currentY, { align: "right" });
    currentY += lineHeight;
    
    // نوع الإجازة
const leaveTypeToDisplay = data.leaveType === "Autre" ? data.customLeaveType : data.leaveType;
const arabicLeaveTypeToDisplay = data.leaveType === "Autre" ? data.arabicCustomLeaveType : translateToArabic(data.leaveType);

// النص الفرنسي
doc.setFont("helvetica", "normal");
doc.text(`Nature de congé (2) : ${leaveTypeToDisplay || '…………………………………'}`, 20, currentY);

// النص العربي المعدل
doc.setFont("Amiri", "normal");
const arabicText = `نوع الإجازة )2(: ${arabicLeaveTypeToDisplay || '…………………………………'}`;
doc.text(formatArabicForPDF(arabicText), 190, currentY, { 
  align: "right",

});

currentY += lineHeight;
    // المدة
    const durationText = data.duration || '…………………………………';
    const arabicDurationText = data.arabicDuration || translateToArabic(data.duration) || '…………………………………';
    doc.setFont("helvetica", "normal");
    doc.text(`Durée : ${durationText}`, 20, currentY);
    doc.setFont("Amiri", "normal");
    
    // النص العربي مع النقط أو القيمة المطلوبة
    const formattedArabicDuration = `المدة : ${arabicDurationText}`;
    doc.text(formattedArabicDuration, 190, currentY, { align: "right" });
    currentY += lineHeight;
    
    // التواريخ في نفس السطر
    if (data.startDate && data.endDate) {
      doc.setFont("helvetica", "normal");
      doc.text(`Du : ${format(data.startDate, "dd/MM/yyyy")}`, 20, currentY);
      doc.text(`Au : ${format(data.endDate, "dd/MM/yyyy")}`, 100, currentY, { align: "right" });
      
      doc.setFont("Amiri", "normal");
      doc.text(formatArabicForPDF(`${format(data.endDate, "dd/MM/yyyy")} : إلى`), 110, currentY);
      doc.text(formatArabicForPDF(`${format(data.startDate, "dd/MM/yyyy")} : ابتداء من`), 190, currentY, { align: "right" });
      currentY += lineHeight;
    }
    
    // مع (3)
if (data.with || data.arabicWith) {
  const withText = data.with || '…………………………………';
  const arabicWithText = data.arabicWith || '…………………………………';
  doc.setFont("helvetica", "normal");
  doc.text(`Avec (3) : ${withText}`, 20, currentY);
  doc.setFont("Amiri", "normal");
  const formattedArabicWith = `مع )3( : ${arabicWithText}`; // النص العربي مع النقط
  doc.text(formattedArabicWith, 190, currentY, { align: "right" });
  currentY += lineHeight;
}
// النيابة
if (data.interim || data.arabicInterim) {
  const interimText = data.interim || '…………………………………';
  const arabicInterimText = data.arabicInterim || '…………………………………';
  
  // النص الفرنسي
  doc.setFont("helvetica", "normal");
  doc.text(`Intérim (Nom et Fonction) : ${interimText}`, 20, currentY);
  
  // النص العربي المعدل
  doc.setFont("Amiri", "normal");
  const formattedArabicInterim = `النيابة )الاسم والوظيفة(: ${arabicInterimText}`;
  doc.text(formattedArabicInterim, 190, currentY, { 
    align: "right",

  });
  
  currentY += lineHeight;
}
    // مغادرة التراب الوطني
    if (data.leaveMorocco) {
      doc.setFont("helvetica", "normal");
      doc.text("Quitter le territoire Marocain : Oui", 20, currentY);
      doc.setFont("Amiri", "normal");
      doc.text(formatArabicForPDF(`مغادرة التراب الوطني : نعم` ), 190, currentY, { align: "right" });
      currentY += lineHeight;
    }
    
    // التوقيعات
    const signatureY = 212;
    
    doc.text("Signature de l'intéressé", 30, signatureY);
    doc.text("إمضاء المعني)ة( بالأمر", 30, signatureY + 5);

    doc.text("Avis du Chef Immédiat", 85, signatureY);
    doc.text("رأي الرئيس المباشر", 85, signatureY + 5);

    doc.text("Avis du Directeur", 150, signatureY);
    doc.text("رأي المدير", 150, signatureY + 5);

    console.log("Signature preview value before adding image:", signaturePreview ? "Has data" : "No data", signaturePreview ? `Data URL starts with: ${signaturePreview.substring(0, 30)}` : "");

    if (signaturePreview) {
      const imgType = signaturePreview.startsWith("data:image/png") ? "PNG" : "JPEG";
      try {
        doc.addImage(signaturePreview, imgType, 30, signatureY + 15, 40, 20);
      } catch (error) {
        console.error("Error adding signature image:", error);
      }
    }

    let notesY = 250;
    doc.setFontSize(9);
    
    // العناوين الرئيسية
    doc.setFont("helvetica", "bold");
    doc.text("Très important :", 10, notesY);
    doc.setFont("Amiri", "bold");
    doc.text(":هام جداً ", 200, notesY, { align: "right" });
    
    notesY += 5;
    doc.setFontSize(8);
    

const frenchNotes = [
  "Aucun agent n'est autorisé à quitter le lieu de son travail avant d'avoir",
  "obtenu sa décision de congé le cas échéant il sera considéré en",
  "abandon de poste.",
  "(1) La demande doit être déposée 8 jours avant la date demandée",
  "(2) Nature de congé : Administratif - Mariage - Naissance - Exceptionnel",
  "(3) Si l'intéressé projette de quitter le territoire Marocain il faut qu'il",
  'le mentionne "Quitter le territoire Marocain"'
];

const arabicNotes = [
  "يجب تقديم الطلب 8 أيام قبل التاريخ المطلوب",
  "نوع الإجازة: إدارية - زواج - ازدياد - استثنائية",
  "إذا كان المعني بالأمر يرغب في مغادرة التراب الوطني فعليه أن يحدد ذلك بإضافة",
  " 'مغادرة التراب الوطني'",
];

const arabicHeader = [
  "لا يسمح لأي مستخدم بمغادرة العمل إلا بعد توصله بمقرر الإجازة و إلا اعتبر في",
  ".وضعية تخلي عن العمل"
];

const numbers = ["(1)", "(2)", "(3)", " "];

// طباعة النصوص الفرنسية
doc.setFont("helvetica", "normal");
let currentLineY = notesY;

frenchNotes.forEach(line => {
  doc.text(line, 10, currentLineY); // يسار
  currentLineY += 5;
});

// طباعة النصوص العربية
doc.setFont("Amiri", "normal");
currentLineY = notesY;

// طباعة السطرين الأوائل بدون أرقام
arabicHeader.forEach(line => {
  doc.text(line, 200, currentLineY, {
    align: "right",
  });
  currentLineY += 5;
});

// طباعة النصوص مع الأرقام مفصولة
for (let i = 0; i < arabicNotes.length; i++) {
  // الرقم في أقصى اليمين
  doc.text(numbers[i], 200, currentLineY, {
    align: "right",
  });

  // النص بجانبه
  doc.text(arabicNotes[i], 195, currentLineY, {
    align: "right",
  });

  currentLineY += 5;
}

// تحميل PDF

    // حفظ الملف
    if (data.fullName) {
      doc.save(`demande_conge_${data.fullName}.pdf`);
    } else {
      doc.save(`demande_conge.pdf`);
    }
    console.log("PDF saved.");
    resolve();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            {language === 'ar' ? 'طلب إجازة' : 'Demande de Congé'}
          </h1>
          <p className="text-gray-600">
            {language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Veuillez remplir tous les champs requis'}
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
            <CardTitle className="text-xl font-semibold">
              {language === 'ar' ? 'معلومات طلب الإجازة' : 'Informations de la demande'}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {!isSubmitted ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Personal Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b border-blue-200 pb-2">
                      {language === 'ar' ? 'المعلومات الشخصية' : 'Informations Personnelles'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Full Name - Single field */}
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              {language === 'ar' ? 'الاسم الكامل' : 'Nom & Prénom'} *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder={language === 'ar' ? 'أدخل الاسم الكامل' : 'Entrez le nom complet'}
                                className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Matricule - Single field */}
                      <FormField
                        control={form.control}
                        name="matricule"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              {language === 'ar' ? 'الرقم المالي' : 'Matricule'} *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder={language === 'ar' ? 'أدخل الرقم المالي' : 'Entrez le matricule'}
                                className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Echelle and Echelon - Two separate fields in same row */}
                      <FormField
                        control={form.control}
                        name="echelle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              {language === 'ar' ? 'الرتبة' : 'Échelle'}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder={language === 'ar' ? 'أدخل الرتبة' : 'Entrez l\'échelle'}
                                className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                              />
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
                            <FormLabel className="text-sm font-medium text-gray-700">
                              {language === 'ar' ? 'السلم' : 'Échelon'}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder={language === 'ar' ? 'أدخل السلم' : 'Entrez l\'échelon'}
                                className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Grade - Single field */}
                      <FormField
                        control={form.control}
                        name="grade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              {language === 'ar' ? 'الدرجة' : 'Grade'}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder={language === 'ar' ? 'أدخل الدرجة' : 'Entrez le grade'}
                                className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Phone - Single field */}
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              {language === 'ar' ? 'الهاتف' : 'Téléphone'}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder={language === 'ar' ? 'أدخل رقم الهاتف' : 'Entrez le numéro de téléphone'}
                                className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Function - Separate Arabic and French fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="fonction"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Fonction (Français)
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Entrez la fonction en français"
                                className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="arabicFonction"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              الوظيفة (العربية)
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="أدخل الوظيفة بالعربية"
                                className="border-green-300 focus:border-green-500 focus:ring-green-200 text-right"
                                dir="rtl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Direction - Separate Arabic and French fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="direction"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Direction (Français)
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Entrez la direction en français"
                                className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="arabicDirection"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              المديرية (العربية)
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="أدخل المديرية بالعربية"
                                className="border-green-300 focus:border-green-500 focus:ring-green-200 text-right"
                                dir="rtl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Address - Separate Arabic and French fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Adresse (Français)
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Entrez l'adresse en français"
                                className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="arabicAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              العنوان (العربية)
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="أدخل العنوان بالعربية"
                                className="border-green-300 focus:border-green-500 focus:ring-green-200 text-right"
                                dir="rtl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Leave Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b border-green-200 pb-2">
                      {language === 'ar' ? 'معلومات الإجازة' : 'Informations de Congé'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="leaveType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              {language === 'ar' ? 'نوع الإجازة' : 'Nature de congé'} *
                            </FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setShowCustomLeaveType(value === "Autre");
                              }} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="border-blue-300 focus:border-blue-500 focus:ring-blue-200">
                                  <SelectValue placeholder={language === 'ar' ? 'اختر نوع الإجازة' : 'Sélectionnez le type'} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Administratif">
                                  {language === 'ar' ? 'إدارية' : 'Administratif'}
                                </SelectItem>
                                <SelectItem value="Mariage">
                                  {language === 'ar' ? 'زواج' : 'Mariage'}
                                </SelectItem>
                                <SelectItem value="Naissance">
                                  {language === 'ar' ? 'ازدياد' : 'Naissance'}
                                </SelectItem>
                                <SelectItem value="Exceptionnel">
                                  {language === 'ar' ? 'استثنائية' : 'Exceptionnel'}
                                </SelectItem>
                                <SelectItem value="Autre">
                                  {language === 'ar' ? 'أخرى' : 'Autre'}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Custom Leave Type Fields - Show when "Autre" is selected */}
                    {showCustomLeaveType && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="customLeaveType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">
                                نوع الإجازة المخصص (Français)
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Spécifiez le type de congé"
                                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="arabicCustomLeaveType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">
                                نوع الإجازة المخصص (العربية)
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="حدد نوع الإجازة"
                                  className="border-green-300 focus:border-green-500 focus:ring-green-200 text-right"
                                  dir="rtl"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Duration - Separate Arabic and French fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Durée (Français) *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Ex: 5 jours"
                                className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="arabicDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              المدة (العربية)
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="مثال: 5 أيام"
                                className="border-green-300 focus:border-green-500 focus:ring-green-200 text-right"
                                dir="rtl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Date Range - Single fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-sm font-medium text-gray-700">
                              {language === 'ar' ? 'تاريخ البداية' : 'Date de début'} *
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
                                      format(field.value, "PPP", { locale: language === 'ar' ? ar : fr })
                                    ) : (
                                      <span>{language === 'ar' ? 'اختر تاريخ البداية' : 'Choisir une date'}</span>
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
                        name="endDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-sm font-medium text-gray-700">
                              {language === 'ar' ? 'تاريخ النهاية' : 'Date de fin'} *
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal border-green-300 focus:border-green-500 focus:ring-green-200",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP", { locale: language === 'ar' ? ar : fr })
                                    ) : (
                                      <span>{language === 'ar' ? 'اختر تاريخ النهاية' : 'Choisir une date'}</span>
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
                    </div>

                    {/* With (Family) - Separate Arabic and French fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="with"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Avec (famille) - Français
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Avec époux/épouse et enfants"
                                className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="arabicWith"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              مع (العائلة) - العربية
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="مع الزوج/الزوجة والأطفال"
                                className="border-green-300 focus:border-green-500 focus:ring-green-200 text-right"
                                dir="rtl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Interim - Separate Arabic and French fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="interim"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Intérim (Nom et Fonction) - Français
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Nom et fonction du remplaçant"
                                className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="arabicInterim"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              النيابة (الاسم والوظيفة) - العربية
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="اسم ووظيفة المتنائب"
                                className="border-green-300 focus:border-green-500 focus:ring-green-200 text-right"
                                dir="rtl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Leave Morocco Checkbox */}
                    <FormField
                      control={form.control}
                      name="leaveMorocco"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-blue-200 p-4 bg-blue-50/50">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="mt-1 border-blue-400 data-[state=checked]:bg-blue-600"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium text-gray-700">
                              {language === 'ar' ? 'مغادرة التراب الوطني' : 'Quitter le territoire Marocain'}
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Signature Upload */}
                    <FormField
                      control={form.control}
                      name="signature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            {language === 'ar' ? 'التوقيع (اختياري)' : 'Signature (optionnel)'}
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2 p-4 border border-dashed border-blue-300 rounded-lg bg-blue-50/30">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleSignatureChange}
                                className="border-0 bg-transparent"
                              />
                              <FileImage className="h-5 w-5 text-blue-500" />
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
                      )}
                    />

                    {/* Submit Button */}
                    <div className="flex justify-center pt-6">
                      <Button 
                        type="submit" 
                        className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                        disabled={isGeneratingPDF}
                      >
                        {isGeneratingPDF ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {language === 'ar' ? 'جاري إنشاء الملف...' : 'Génération en cours...'}
                          </div>
                        ) : (
                          <>
                            {language === 'ar' ? 'تحميل طلب الإجازة' : 'Télécharger la demande'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {language === 'ar' ? 'تم إنشاء الطلب بنجاح!' : 'Demande générée avec succès!'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {language === 'ar' ? 'تم تحميل ملف PDF لطلب الإجازة' : 'Le fichier PDF de votre demande a été téléchargé'}
                </p>
                <Button 
                  onClick={() => {
                    setIsSubmitted(false);
                    form.reset();
                    setShowCustomLeaveType(false);
                  }}
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  {language === 'ar' ? 'طلب جديد' : 'Nouvelle demande'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VacationRequest;