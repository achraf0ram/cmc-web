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
import "jspdf-autotable";

// Import Arabic reshaping libraries
import * as reshaper from "arabic-persian-reshaper";
const reshape = reshaper.reshape;
import bidi from "bidi-js";

// Define form schema and type at the top level
const formSchema = z.object({
  fullName: z.string().min(3, { message: "يرجى إدخال الاسم الكامل" }),
  matricule: z.string().min(1, { message: "يرجى إدخال الرقم المالي" }),
  echelle: z.string().optional(),
  grade: z.string().optional(),
  fonction: z.string().optional(),
  direction: z.string().optional(),
  arabicDirection: z.string().optional(),
  address: z.string().optional(),
  arabicAddress: z.string().optional(),
  phone: z.string().optional(),
  leaveType: z.string().min(1, { message: "يرجى اختيار نوع الإجازة" }),
  duration: z.string().min(1, { message: "يرجى تحديد المدة" }),
  startDate: z.date({ required_error: "يرجى تحديد تاريخ البداية" }),
  endDate: z.date({ required_error: "يرجى تحديد تاريخ النهاية" }),
  with: z.string().optional(),
  interim: z.string().optional(),
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
  const { language, t } = useLanguage();
  const logoPath = "/lovable-uploads/d44e75ac-eac5-4ed3-bf43-21a71c6a089d.png";

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      matricule: "",
      echelle: "",
      grade: "",
      fonction: "",
      direction: "",
      arabicDirection: "",
      address: "",
      arabicAddress: "",
      phone: "",
      leaveType: "",
      duration: "",
      startDate: undefined,
      endDate: undefined,
      with: "",
      interim: "",
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
          // Ensure image is loaded before adding to PDF
          img.onload = () => {
            console.log("Logo image loaded successfully.");
            doc.addImage(img, "PNG", 10, 10, 50, 25);
             addContent(doc, data, resolve);
          }
           // Handle potential image loading errors or if logoPath is not set
           img.onerror = (err) => {
             console.error("Error loading logo image:", err);
             // Continue generating PDF even if logo fails to load
             addContent(doc, data, resolve); // Ensure content is added even on error
           };

        } else {
           console.log("No logo path specified. Adding content directly.");
           addContent(doc, data, resolve); // Add content directly if no logo
        }

      } catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
      }
    });
  };

  // Helper function to add content after logo loading (or immediately if no logo)
  const addContent = (doc: jsPDF, data: FormData, resolve: () => void) => {
    console.log("Adding PDF content.");
    // رأس الصفحة
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Réf : OFP/DR……/CMC…../N° /2025", 150, 20);
    doc.text(`Date : ${format(new Date(), "dd/MM/yyyy")}`, 150, 30);
    
    // العنوان الرئيسي
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Demande de congé", 105, 50, { align: "center" });
    doc.setFont("Amiri", "bold");
    doc.text("طلب إجازة (1)", 105, 60, { align: "center" });
    
    // بداية إدخال البيانات
    let startY = 80;
    const lineHeight = 10; // Increased line height for better spacing
    const frenchColX = 20;  // X position for French text
    const arabicColX = 190; // X position for Arabic text (further right)
    const valueFillLength = 60; // Approximate length for the value field (can be adjusted)

    // Helper to add a dotted line or spaces for value
    const addValueSpace = (y: number, startX: number, length: number) => {
        // Using spaces for simplicity, can be replaced with dotted lines if needed
        const spaces = " ".repeat(length);
        doc.text(spaces, startX, y);
    };
    
    // Function to add a bilingual field with French left and Arabic right
    const addBilingualField = (frenchLabel: string, arabicLabel: string, value: string | undefined, useArabicValueOnLeft = false) => {
        doc.setFontSize(12);
        
        // French part (Label + Value on the left)
        doc.setFont("helvetica", "normal");
        doc.text(`${frenchLabel} :`, frenchColX, startY);
        
        const frenchLabelWidth = doc.getTextDimensions(`${frenchLabel} :`).w;
        const valueStartX = frenchColX + frenchLabelWidth + 2; // Space after French label
        
        if (value !== undefined && value !== null && value !== "") {
            if (useArabicValueOnLeft) {
                 doc.setFont("Amiri", "normal");
                 doc.text(value, valueStartX, startY);
            } else {
                 const isArabic = /[؀-ۿ]/.test(value);
                 doc.setFont(isArabic ? "Amiri" : "helvetica", "normal");
                 // Attempt to place value somewhat in the middle, adjusting based on script
                 // This is a simplification; precise centering between two points is complex.
                 doc.text(value, (frenchColX + arabicColX) / 2, startY, { align: "center" });
            }
        } else {
             // Add space filler if no value
             // addValueSpace(startY, valueStartX, valueFillLength);
        }
        
        // Arabic part (Label on the right)
        doc.setFont("Amiri", "normal");
        doc.text(`: ${arabicLabel}`, arabicColX, startY, { align: "right" });
        
        startY += lineHeight;
    };
    
    // معلومات أساسية
    addBilingualField("Nom & Prénom", "الاسم الكامل", data.fullName);
    addBilingualField("Matricule", "الرقم المالي", data.matricule);
    addBilingualField("Echelle", "الرتبة", data.echelle);
    addBilingualField("Grade", "الدرجة", data.grade);
    addBilingualField("Fonction", "الوظيفة", data.fonction);
    
    // عنوان القسم Affectation
    startY += 5; // Extra space before section title
    doc.setFontSize(14); // Slightly larger font for section titles
    doc.setFont("helvetica", "bold");
    doc.text("Affectation", frenchColX, startY);
    doc.setFont("Amiri", "bold");
    doc.text("التعيين", arabicColX, startY, { align: "right" });
    startY += lineHeight;
    
    // معلومات التعيين - Handling bilingual inputs specifically
    doc.setFontSize(12);
    
    // Direction field
    doc.setFont("helvetica", "normal");
    doc.text("Direction :", frenchColX, startY);
    if (data.arabicDirection) {
        doc.setFont("Amiri", "normal");
        // Place Arabic direction value near the French label
        doc.text(data.arabicDirection, frenchColX + doc.getTextDimensions("Direction : ").w + 2, startY);
    }
    if (data.direction) {
        doc.setFont("helvetica", "normal");
        // Place French direction value near the Arabic label on the right
        doc.text(data.direction, arabicColX - doc.getTextDimensions(": المديرية").w - 2, startY, { align: "right" });
    }
    doc.setFont("Amiri", "normal");
    doc.text(": المديرية", arabicColX, startY, { align: "right" });
    startY += lineHeight;

    // Address field
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Adresse :", frenchColX, startY);
    if (data.arabicAddress) {
        doc.setFont("Amiri", "normal");
         // Place Arabic address value near the French label
        doc.text(data.arabicAddress, frenchColX + doc.getTextDimensions("Adresse : ").w + 2, startY);
    }
     if (data.address) {
         doc.setFont("helvetica", "normal");
         // Place French address value near the Arabic label on the right
        doc.text(data.address, arabicColX - doc.getTextDimensions(": العنوان").w - 2, startY, { align: "right" });
     }
    doc.setFont("Amiri", "normal");
    doc.text(": العنوان", arabicColX, startY, { align: "right" });
    startY += lineHeight;

    // Remaining fields using the general bilingual function
    addBilingualField("Téléphone", "الهاتف", data.phone);
    addBilingualField("Nature de congé (2)", "نوع الإجازة (2)", translateToArabic(data.leaveType));
    addBilingualField("Durée", "المدة", translateToArabic(data.duration));
    
    // تواريخ البدء والانتهاء (تبقى كما هي، محاذاة لليسار واليمين)
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    if (data.startDate) {
        doc.text(`Du : ${format(data.startDate, "dd/MM/yyyy")}`, frenchColX, startY);
    }
    doc.setFont("Amiri", "normal");
    if (data.endDate) {
        doc.text(`: إلى ${format(data.endDate, "dd/MM/yyyy")}`, arabicColX, startY, { align: "right" });
    }
    startY += lineHeight;
    
    // معلومات إضافية
    if (data.with) {
      addBilingualField("Avec (3)", "مع (3)", translateToArabic(data.with));
    }
    if (data.interim) {
      addBilingualField("Intérim (Nom et Fonction)", "التنبيه (الاسم والوظيفة)", data.interim);
    }
    if (data.leaveMorocco) {
      addBilingualField("Quitter le territoire Marocain", "مغادرة التراب الوطني", "Oui / نعم");
    }
    
    // التوقيعات
    startY += 20; // Increased space before signatures
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Signature de l'intéressé", frenchColX, startY);
    doc.setFont("Amiri", "bold");
    doc.text("إمضاء المعني(ة) بالأمر", arabicColX, startY, { align: "right" });
    startY += lineHeight * 2;
    
    // توقيع الرئيس المباشر
    doc.setFont("helvetica", "bold");
    doc.text("Avis du Chef Immédiat", frenchColX, startY);
    doc.setFont("Amiri", "bold");
    doc.text("رأي الرئيس المباشر", arabicColX, startY, { align: "right" });
    startY += lineHeight * 3;
    
    // توقيع المدير
    doc.setFont("helvetica", "bold");
    doc.text("Avis du Directeur", frenchColX, startY);
    doc.setFont("Amiri", "bold");
    doc.text("رأي المدير", arabicColX, startY, { align: "right" });
    
    // التنبيهات المهمة في الأسفل
    startY += 40; // Increased space before important notes
    doc.setFontSize(9); // Slightly smaller font for notes
    
    // French Notes (Left Column)
    doc.setFont("helvetica", "bold");
    doc.text("Très important :", frenchColX, startY);
    doc.setFont("helvetica", "normal");
    doc.text("Aucun agent n'est autorisé à quitter le lieu de son travail avant", frenchColX, startY + 5);
    doc.text("d'avoir obtenu sa décision de congé, le cas échéant il sera", frenchColX, startY + 10);
    doc.text("considéré en abandon de poste.", frenchColX, startY + 15);
    doc.text("(1) La demande doit être déposée 8 jours avant la date demandée.", frenchColX, startY + 20);
    doc.text("(2) Nature de congé : Administratif – Mariage – Naissance – Exceptionnel.", frenchColX, startY + 25);
    doc.text("(3) Si l'intéressé projette de quitter le territoire Marocain,", frenchColX, startY + 30);
    doc.text("il faut qu'il le mentionne : \"Quitter le territoire Marocain\".", frenchColX, startY + 35);
    
    // Arabic Notes (Right Column)
    doc.setFont("Amiri", "bold");
    doc.text("هام جداً:", arabicColX, startY, { align: "right" });
    doc.setFont("Amiri", "normal");
    doc.text("لا يسمح لأي مستخدم بمغادرة العمل إلا بعد توصله", arabicColX, startY + 5, { align: "right" });
    doc.text("بمقرر الإجازة، وإلا اعتبر في وضعية تخلي عن العمل.", arabicColX, startY + 10, { align: "right" });
    doc.text("(1) يجب تقديم الطلب 8 أيام قبل التاريخ المطلوب.", arabicColX, startY + 15, { align: "right" });
    doc.text("(2) نوع الإجازة: إدارية - زواج - ازدياد - استثنائية.", arabicColX, startY + 20, { align: "right" });
    doc.text("(3) إذا كان المعني بالأمر يرغب في مغادرة التراب الوطني،", arabicColX, startY + 25, { align: "right" });
    doc.text("فعليه أن يحدد ذلك بكتابة: \"مغادرة التراب الوطني\".", arabicColX, startY + 30, { align: "right" });
    
    // حفظ الملف باستخدام الرقم المالي كما هو في الصورة الأصلية
    if (data.matricule) {
      doc.save(`demande_conge_${data.matricule}.pdf`);
    } else {
       doc.save(`demande_conge.pdf`);
    }
    console.log("PDF saved.");
    resolve();
  };

  return (
    <div>
      {/* Rest of the component content */}
    </div>
  );
};

export default VacationRequest;
