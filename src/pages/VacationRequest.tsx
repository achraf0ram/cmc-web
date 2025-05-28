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

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitted(true);
    generatePDF(values);
  }

  const generatePDF = (data: z.infer<typeof formSchema>) => {
    const doc = new jsPDF("p", "mm", "a4");
    const currentDate = format(new Date(), "dd/MM/yyyy");

    // Set Arabic font
    doc.addFont("https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic&display=swap", "Arabic", "normal");
    
    doc.setFont("Helvetica");
    doc.setFontSize(11);

    // Add logo at the top
    try {
      doc.addImage(logoPath, "PNG", 10, 10, 50, 25);
    } catch (error) {
      console.log("Could not load logo:", error);
    }

    // Header
    doc.text("Réf : OFP/DR……/CMC…../N°", 20, 45);
    doc.text("/2025", 75, 45);
    doc.text("Date :", 20, 50);
    doc.text(currentDate, 35, 50);

    // Title - French and Arabic
    doc.setFontSize(14);
    doc.setFont("Helvetica", "bold");
    doc.text("Demande de congé", 70, 65);
    doc.setFont("Arabic", "normal");
    doc.text("طلب إجازة", 130, 65, { align: "right" });
    doc.setFont("Helvetica", "normal");

    // Employee information table
    doc.setFontSize(11);
    doc.text("Nom & Prénom :", 20, 80);
    doc.text(data.fullName, 60, 80);
    doc.setFont("Arabic", "normal");
    doc.text(": الاسم الكامل", 190, 80, { align: "right" });
    doc.setFont("Helvetica", "normal");

    doc.text("Matricule :", 20, 87);
    doc.text(data.matricule, 60, 87);
    doc.setFont("Arabic", "normal");
    doc.text(": الرقم المالي", 190, 87, { align: "right" });
    doc.setFont("Helvetica", "normal");

    doc.text("Echelle :", 20, 94);
    doc.text(data.echelle || "", 60, 94);
    doc.setFont("Arabic", "normal");
    doc.text(": السلم", 190, 94, { align: "right" });
    doc.setFont("Helvetica", "normal");

    doc.text("Grade :", 20, 101);
    doc.text(data.grade || "", 60, 101);
    doc.setFont("Arabic", "normal");
    doc.text(": الدرجة", 190, 101, { align: "right" });
    doc.setFont("Helvetica", "normal");

    doc.text("Fonction :", 20, 108);
    doc.text(data.fonction || "", 60, 108);
    doc.setFont("Arabic", "normal");
    doc.text(": الوظيفة", 190, 108, { align: "right" });
    doc.setFont("Helvetica", "normal");

    // Affectation section
    doc.setFont("Helvetica", "bold");
    doc.text("Affectation", 70, 120);
    doc.setFont("Arabic", "normal");
    doc.text("التعيين", 130, 120, { align: "right" });
    doc.setFont("Helvetica", "normal");

    doc.text("Direction :", 20, 130);
    doc.text(data.direction || "", 60, 130);
    doc.setFont("Arabic", "normal");
    doc.text(": المديرية", 190, 130, { align: "right" });
    doc.setFont("Helvetica", "normal");

    doc.text("Adresse :", 20, 137);
    doc.text(data.address || "", 60, 137);
    doc.setFont("Arabic", "normal");
    doc.text(": العنوان", 190, 137, { align: "right" });
    doc.setFont("Helvetica", "normal");

    doc.text("Téléphone :", 20, 144);
    doc.text(data.phone || "", 60, 144);
    doc.setFont("Arabic", "normal");
    doc.text(": الهاتف", 190, 144, { align: "right" });
    doc.setFont("Helvetica", "normal");

    // Leave details
    const leaveTypeMap: Record<string, { fr: string; ar: string }> = {
      administrative: { fr: "Administratif", ar: "إدارية" },
      marriage: { fr: "Mariage", ar: "زواج" },
      birth: { fr: "Naissance", ar: "ازدياد" },
      exceptional: { fr: "Exceptionnel", ar: "استثنائية" },
    };

    const leaveType = leaveTypeMap[data.leaveType] || { fr: data.leaveType, ar: data.leaveType };

    doc.text("Nature de congé (2) :", 20, 151);
    doc.text(`${leaveType.fr}`, 60, 151);
    doc.setFont("Arabic", "normal");
    doc.text(`: نوع الإجازة (2) ${leaveType.ar}`, 190, 151, { align: "right" });
    doc.setFont("Helvetica", "normal");

    doc.text("Durée :", 20, 158);
    doc.text(data.duration, 60, 158);
    doc.setFont("Arabic", "normal");
    doc.text(": المدة", 190, 158, { align: "right" });
    doc.setFont("Helvetica", "normal");

    doc.text("Du :", 20, 165);
    doc.text(format(data.startDate, "dd/MM/yyyy"), 60, 165);
    doc.setFont("Arabic", "normal");
    doc.text(": ابتداء من", 190, 165, { align: "right" });
    doc.setFont("Helvetica", "normal");

    doc.text("Au :", 20, 172);
    doc.text(format(data.endDate, "dd/MM/yyyy"), 60, 172);
    doc.setFont("Arabic", "normal");
    doc.text(": إلى", 190, 172, { align: "right" });
    doc.setFont("Helvetica", "normal");

    doc.text("Avec (3) :", 20, 179);
    doc.text(data.with || "", 60, 179);
    doc.setFont("Arabic", "normal");
    doc.text(": مع (3)", 190, 179, { align: "right" });
    doc.setFont("Helvetica", "normal");

    doc.text("Intérim (Nom et Fonction) :", 20, 186);
    doc.text(data.interim || "", 60, 186);
    doc.setFont("Arabic", "normal");
    doc.text(": النيابة (الاسم والوظيفة)", 190, 186, { align: "right" });
    doc.setFont("Helvetica", "normal");

    // Leave Morocco checkbox
    if (data.leaveMorocco) {
      doc.text("Quitter le territoire Marocain", 20, 193);
      doc.setFont("Arabic", "normal");
      doc.text("مغادرة التراب الوطني", 190, 193, { align: "right" });
      doc.setFont("Helvetica", "normal");
    }

    // Signature sections
    doc.text("Signature de l'intéressé", 30, 210);
    doc.setFont("Arabic", "normal");
    doc.text("المضاء المعني (3) بالأمر", 30, 215, { align: "left" });
    doc.setFont("Helvetica", "normal");

    doc.text("Avis du Chef Immédiat", 85, 210);
    doc.setFont("Arabic", "normal");
    doc.text("رأي الرئيس المباشر", 85, 215, { align: "left" });
    doc.setFont("Helvetica", "normal");

    doc.text("Avis du Directeur", 150, 210);
    doc.setFont("Arabic", "normal");
    doc.text("رأي المدير", 150, 215, { align: "left" });
    doc.setFont("Helvetica", "normal");

    // Add signature if available
    if (signaturePreview) {
      doc.addImage(signaturePreview, "PNG", 25, 220, 40, 20);
    }

    // Footer notes
    doc.setFontSize(9);
    doc.setFont("Helvetica", "bold");
    doc.text("Très important :", 20, 250);
    doc.setFont("Arabic", "bold");
    doc.text("هام جدا :", 190, 250, { align: "right" });

    doc.setFontSize(8);
    doc.setFont("Helvetica", "normal");
    const frenchNotes = [
      "Aucun agent n'est autorisé à quitter le lieu de son travail avant d'avoir",
      "obtenu sa décision de congé le cas échéant il sera considéré en",
      "abandon de poste.",
      "(1) La demande doit être déposée 8 jours avant la date demandée.",
      "(2) Nature de congé : Administratif-Mariage-Naissance-Exceptionnel.",
      "(3) Si l'intéressé projette de quitter le territoire Marocain il faut qu'il",
      "le mentionne \"Quitter le territoire Marocain\".",
    ];

    doc.setFont("Arabic", "normal");
    const arabicNotes = [
      "لا يسمح لأي مستخدم بمغادرة العمل إلا بعد توصله بمقرر الإجازة و إلا أعتبر في",
      "وضعية تعني عن العمل.",
      "(1) يجب تقديم الطلبية لهم قبل القارئ والسلوب.",
      "(2) نوع الإجازة : إدارية - زواج - نزدية - استثنائية.",
      "(3) إذا كان السعي بالأمر يرغب في مخدرة التراب الوطني فعلها أن يحدد ذلك",
      "بإضافة \"مغادرة التراب الوطني\".",
    ];

    let yPos = 255;
    frenchNotes.forEach((note, i) => {
      doc.setFont("Helvetica", "normal");
      doc.text(note, 20, yPos);
      if (i < arabicNotes.length) {
        doc.setFont("Arabic", "normal");
        doc.text(arabicNotes[i], 190, yPos, { align: "right" });
      }
      yPos += 5;
    });

    doc.save(`demande_conge_${data.fullName.replace(/\s+/g, "_")}.pdf`);
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
                        <FormLabel>{t('matricule')}*</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>{t('grade')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input {...field} />
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
                        <Input {...field} />
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
                        <FormLabel>{t('phone')}</FormLabel>
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
                        <Input {...field} />
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
                        <Input {...field} />
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
                        <Input {...field} />
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