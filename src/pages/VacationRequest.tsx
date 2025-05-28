
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

// Import Arabic reshaping libraries
// @ts-ignore
import * as reshaper from "arabic-persian-reshaper";
const reshape = reshaper.reshape;
// @ts-ignore
import bidi from "bidi-js";

const formSchema = z.object({
  fullName: z.string().min(3, { message: "يرجى إدخال الاسم الكامل" }),
  matricule: z.string().min(1, { message: "يرجى إدخال الرقم المالي" }),
  echelle: z.string().optional(),
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
  leaveMorocco: z.boolean().optional(),
  signature: z.instanceof(File).optional(),
});

type FormData = z.infer<typeof formSchema>;

const VacationRequest = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
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
      address: "",
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

  // Enhanced translation function for French to Arabic
  const translateToArabic = (frenchText: string): string => {
    if (!frenchText || frenchText.trim() === "") return "";
    
    const translations: Record<string, string> = {
      // Leave types
      "Administratif": "إدارية",
      "Mariage": "زواج", 
      "Naissance": "ازدياد",
      "Exceptionnel": "استثنائية",
      
      // Duration units
      "jour": "يوم",
      "jours": "أيام",
      "semaine": "أسبوع",
      "semaines": "أسابيع",
      "mois": "شهر",
      
      // Family relations
      "avec": "مع",
      "sans": "بدون",
      "famille": "عائلة",
      "époux": "زوج",
      "épouse": "زوجة",
      "enfant": "طفل",
      "enfants": "أطفال",
      "parent": "والد",
      "parents": "والدين",
      
      // Work positions
      "Directeur": "مدير",
      "Chef": "رئيس",
      "Responsable": "مسؤول",
      "Adjoint": "مساعد",
      "Secrétaire": "كاتب",
      "Comptable": "محاسب",
      "Informaticien": "مختص في المعلوميات",
      "Technicien": "تقني",
      "Ingénieur": "مهندس",
      
      // Departments
      "Direction": "مديرية",
      "Service": "مصلحة",
      "Bureau": "مكتب",
      "Département": "قسم",
      
      // Common words
      "urgence": "طارئ",
      "maladie": "مرض",
      "personnel": "شخصي",
      "voyage": "سفر",
      "formation": "تكوين",
      "repos": "راحة",
    };

    let arabicText = frenchText;
    
    // Apply word-by-word translation
    Object.entries(translations).forEach(([french, arabic]) => {
      const regex = new RegExp(`\\b${french}\\b`, 'gi');
      arabicText = arabicText.replace(regex, arabic);
    });

    return arabicText !== frenchText ? arabicText : frenchText;
  };

  // Function to properly format Arabic text for PDF
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

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("signature", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: FormData) => {
    setIsSubmitted(true);
    generatePDF(values);
  };

  const generatePDF = (data: FormData) => {
    const doc = new jsPDF("p", "mm", "a4");
    const currentDate = format(new Date(), "dd/MM/yyyy");

    try {
      // Add Amiri font for Arabic
      doc.addFileToVFS("Amiri-Regular.ttf", AmiriFont);
      doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    } catch (error) {
      console.warn("Could not load Amiri font:", error);
    }

    // Set default font
    doc.setFont("Helvetica");
    doc.setFontSize(11);

    // Add logo
    try {
      doc.addImage(logoPath, "PNG", 10, 10, 50, 25);
    } catch (error) {
      console.log("Could not load logo:", error);
    }

    // Header information
    doc.text("Réf : OFP/DR……/CMC…../N°", 20, 45);
    doc.text("/2025", 75, 45);
    doc.text("Date :", 20, 50);
    doc.text(currentDate, 35, 50);

    // Title in French and Arabic
    doc.setFontSize(14);
    doc.setFont("Helvetica", "bold");
    doc.text("Demande de congé", 70, 65);
    
    // Arabic title
    try {
      doc.setFont("Amiri");
      const arabicTitle = formatArabicForPDF("طلب إجازة");
      doc.text(arabicTitle, 130, 65, { align: "right" });
    } catch (error) {
      console.warn("Error adding Arabic title:", error);
    }
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);

    let yPosition = 80;

    // Helper function to add bilingual field
    const addBilingualField = (frenchLabel: string, arabicLabel: string, value: string, yPos: number) => {
      // French side
      doc.setFont("Helvetica", "normal");
      doc.text(`${frenchLabel} :`, 20, yPos);
      doc.text(value, 60, yPos);
      
      // Arabic side
      try {
        doc.setFont("Amiri");
        const formattedArabicValue = formatArabicForPDF(value);
        doc.text(formattedArabicValue, 150, yPos, { align: "right" });
        doc.text(`: ${arabicLabel}`, 190, yPos, { align: "right" });
      } catch (error) {
        console.warn("Error adding Arabic text:", error);
      }
      
      doc.setFont("Helvetica", "normal");
    };

    // Employee information
    addBilingualField("Nom & Prénom", "الاسم الكامل", data.fullName, yPosition);
    yPosition += 7;
    
    addBilingualField("Matricule", "الرقم المالي", data.matricule, yPosition);
    yPosition += 7;
    
    if (data.echelle) {
      addBilingualField("Echelle", "السلم", data.echelle, yPosition);
      yPosition += 7;
    }
    
    if (data.grade) {
      addBilingualField("Grade", "الدرجة", data.grade, yPosition);
      yPosition += 7;
    }
    
    if (data.fonction) {
      addBilingualField("Fonction", "الوظيفة", data.fonction, yPosition);
      yPosition += 7;
    }

    // Affectation section
    yPosition += 5;
    doc.setFont("Helvetica", "bold");
    doc.text("Affectation", 70, yPosition);
    try {
      doc.setFont("Amiri");
      doc.text("التعيين", 130, yPosition, { align: "right" });
    } catch (error) {
      console.warn("Error adding Arabic section title:", error);
    }
    doc.setFont("Helvetica", "normal");
    yPosition += 10;

    if (data.direction) {
      addBilingualField("Direction", "المديرية", data.direction, yPosition);
      yPosition += 7;
    }
    
    if (data.address) {
      addBilingualField("Adresse", "العنوان", data.address, yPosition);
      yPosition += 7;
    }
    
    if (data.phone) {
      addBilingualField("Téléphone", "الهاتف", data.phone, yPosition);
      yPosition += 7;
    }

    // Leave details
    yPosition += 5;
    const leaveTypeMap: Record<string, { fr: string; ar: string }> = {
      administrative: { fr: "Administratif", ar: "إدارية" },
      marriage: { fr: "Mariage", ar: "زواج" },
      birth: { fr: "Naissance", ar: "ازدياد" },
      exceptional: { fr: "Exceptionnel", ar: "استثنائية" },
    };

    const leaveType = leaveTypeMap[data.leaveType] || { 
      fr: data.leaveType, 
      ar: translateToArabic(data.leaveType) 
    };

    addBilingualField("Nature de congé", "نوع الإجازة", leaveType.fr, yPosition);
    yPosition += 7;
    
    addBilingualField("Durée", "المدة", data.duration, yPosition);
    yPosition += 7;
    
    addBilingualField("Du", "ابتداء من", format(data.startDate, "dd/MM/yyyy"), yPosition);
    yPosition += 7;
    
    addBilingualField("Au", "إلى", format(data.endDate, "dd/MM/yyyy"), yPosition);
    yPosition += 7;

    if (data.with) {
      addBilingualField("Avec", "مع", data.with, yPosition);
      yPosition += 7;
    }

    if (data.interim) {
      addBilingualField("Intérim", "النيابة", data.interim, yPosition);
      yPosition += 7;
    }

    // Leave Morocco checkbox
    if (data.leaveMorocco) {
      yPosition += 5;
      doc.text("☑ Quitter le territoire Marocain", 20, yPosition);
      try {
        doc.setFont("Amiri");
        const arabicCheckbox = formatArabicForPDF("☑ مغادرة التراب الوطني");
        doc.text(arabicCheckbox, 190, yPosition, { align: "right" });
        doc.setFont("Helvetica", "normal");
      } catch (error) {
        console.warn("Error adding Arabic checkbox:", error);
      }
      yPosition += 7;
    }

    // Signature sections
    yPosition += 15;
    const signatureY = yPosition;
    
    doc.text("Signature de l'intéressé", 30, signatureY);
    doc.text("Avis du Chef Immédiat", 85, signatureY);
    doc.text("Avis du Directeur", 150, signatureY);
    
    try {
      doc.setFont("Amiri");
      doc.text("توقيع المعني بالأمر", 30, signatureY + 5, { align: "left" });
      doc.text("رأي الرئيس المباشر", 85, signatureY + 5, { align: "left" });
      doc.text("رأي المدير", 150, signatureY + 5, { align: "left" });
      doc.setFont("Helvetica", "normal");
    } catch (error) {
      console.warn("Error adding Arabic signature labels:", error);
    }

    // Add signature if available
    if (signaturePreview) {
      try {
        doc.addImage(signaturePreview, "PNG", 25, signatureY + 10, 40, 20);
      } catch (error) {
        console.warn("Error adding signature image:", error);
      }
    }

    // Footer notes
    yPosition += 40;
    doc.setFontSize(9);
    doc.setFont("Helvetica", "bold");
    doc.text("Très important :", 20, yPosition);
    
    try {
      doc.setFont("Amiri");
      doc.text("هام جدا :", 190, yPosition, { align: "right" });
    } catch (error) {
      console.warn("Error adding Arabic footer title:", error);
    }

    doc.setFontSize(8);
    doc.setFont("Helvetica", "normal");
    yPosition += 5;

    const frenchNotes = [
      "Aucun agent n'est autorisé à quitter le lieu de son travail avant d'avoir",
      "obtenu sa décision de congé le cas échéant il sera considéré en",
      "abandon de poste.",
      "(1) La demande doit être déposée 8 jours avant la date demandée.",
      "(2) Nature de congé : Administratif-Mariage-Naissance-Exceptionnel.",
      "(3) Si l'intéressé projette de quitter le territoire Marocain il faut qu'il",
      "le mentionne \"Quitter le territoire Marocain\".",
    ];

    const arabicNotes = [
      "لا يسمح لأي مستخدم بمغادرة العمل إلا بعد توصله بمقرر الإجازة و إلا أعتبر في",
      "وضعية تغيب عن العمل.",
      "(1) يجب تقديم الطلب ثمانية أيام قبل التاريخ المطلوب.",
      "(2) نوع الإجازة : إدارية - زواج - ازدياد - استثنائية.",
      "(3) إذا كان المعني بالأمر يرغب في مغادرة التراب الوطني فعليه أن يحدد ذلك",
      "بإضافة \"مغادرة التراب الوطني\".",
    ];

    frenchNotes.forEach((note, i) => {
      doc.setFont("Helvetica", "normal");
      doc.text(note, 20, yPosition);
      
      if (i < arabicNotes.length) {
        try {
          doc.setFont("Amiri", "normal");
          const formattedNote = formatArabicForPDF(arabicNotes[i]);
          doc.text(formattedNote, 190, yPosition, { align: "right" });
        } catch (error) {
          console.warn("Error adding Arabic note:", error);
        }
      }
      yPosition += 5;
    });

    // Save PDF
    try {
      doc.save(`demande_conge_${data.fullName.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Error saving PDF:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("vacationRequestTitle")}</h1>

      {isSubmitted ? (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {t('requestSubmitted')}
                </h2>
                <p className="text-muted-foreground">
                  {t('requestReviewMessage')}
                  <br />
                  {t('followUpMessage')}
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => setIsSubmitted(false)}
                >
                  {t('newRequest')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t('requestInfo')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('fullName')}*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="مثال: أحمد محمد / Ahmed Mohammed" />
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
                        <FormLabel>{t('matricule')}*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="رقمك المالي" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="echelle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('echelle')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="مثال: 10" />
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
                        <FormLabel>{t('grade')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="مثال: 3" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fonction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('fonction')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="مثال: Ingénieur / Technicien" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="direction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('direction')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="مثال: Direction des Ressources Humaines" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('address')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="عنوانك الكامل" />
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
                        <FormLabel>{t('phone')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="0612345678" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="leaveType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('leaveType')}*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectLeaveType')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="administrative">{t('administrativeLeave')}</SelectItem>
                          <SelectItem value="marriage">{t('marriageLeave')}</SelectItem>
                          <SelectItem value="birth">{t('birthLeave')}</SelectItem>
                          <SelectItem value="exceptional">{t('exceptionalLeave')}</SelectItem>
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
                      <FormLabel>{t('duration')}*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="مثال: 15 jours / 2 semaines" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>{t('startDate')}*</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: language === 'ar' ? ar : fr })
                                ) : (
                                  <span>{t('selectDate')}</span>
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
                        <FormLabel>{t('endDate')}*</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: language === 'ar' ? ar : fr })
                                ) : (
                                  <span>{t('selectDate')}</span>
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

                <FormField
                  control={form.control}
                  name="with"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('with')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="مثال: famille / époux / épouse" />
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
                      <FormLabel>{t('interim')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="اسم ووظيفة من سيحل محلك" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="leaveMorocco"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          {t('leaveMorocco')}
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="signature"
                  render={({ field: { value, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>{t('signatureUpload')}</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-4">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleSignatureChange}
                              className="hidden"
                              id="signature-upload"
                              {...fieldProps}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById("signature-upload")?.click()}
                              className="w-full"
                            >
                              <FileImage className="mr-2 h-4 w-4" />
                              {t('signatureUploadButton')}
                            </Button>
                          </div>
                          {signaturePreview && (
                            <div className="border rounded-md p-2">
                              <img
                                src={signaturePreview}
                                alt={t('signature')}
                                className="max-h-32 mx-auto"
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button type="submit">{t('submit')}</Button>
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
