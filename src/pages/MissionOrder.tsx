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
import { useAuth } from "@/contexts/AuthContext";
import jsPDF from "jspdf";

const formSchema = z.object({
  fullName: z.string().min(3, {
    message: "يرجى إدخال الاسم الكامل",
  }),
  matricule: z.string().min(1, {
    message: "يرجى إدخال رقم التسجيل",
  }),
  destination: z.string().min(3, {
    message: "يرجى تحديد وجهة المهمة",
  }),
  purpose: z.string().min(5, {
    message: "يرجى وصف الغرض من المهمة",
  }),
  driver: z.string().optional(),
  driverMatricule: z.string().optional(),
  transportMethod: z.string().optional(),
  startDate: z.date({
    required_error: "يرجى تحديد تاريخ البداية",
  }),
  startTime: z.string().optional(),
  endDate: z.date({
    required_error: "يرجى تحديد تاريخ النهاية",
  }),
  endTime: z.string().optional(),
  additionalInfo: z.string().optional(),
});

const MissionOrder = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const logoPath = "/lovable-uploads/d44e75ac-eac5-4ed3-bf43-21a71c6a089d.png";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      matricule: "",
      destination: "",
      purpose: "",
      driver: "",
      driverMatricule: "",
      transportMethod: "",
      startTime: "",
      endTime: "",
      additionalInfo: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setIsSubmitted(true);
    generatePDF(values);
  }

  const generatePDF = (data: z.infer<typeof formSchema>) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const currentDate = format(new Date(), "dd/MM/yyyy");
    
    // Add the OFPPT logo
    try {
      doc.addImage(logoPath, 'PNG', 20, 10, 50, 25);
    } catch (error) {
      console.log("Could not load logo:", error);
    }
    
    // Add headers and reference number
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("N/Réf : OFP/DR Casa Settat/", 20, 45);
    doc.text("/N°", 70, 45);
    doc.text("…/2025", 75, 45);
    doc.text(`Casablanca, le ${currentDate}`, 145, 45);
    
    // Add the title in French and Arabic
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("ORDRE DE MISSION", 80, 60);
    const arabicTitle = "أمر مهمة";
    doc.text(arabicTitle, 105, 65, { align: "center" });
    
    doc.setFontSize(12);
    doc.text("OFFICE DE LA FORMATION PROFESSIONNELLE", 50, 72);
    doc.text("ET DE LA PROMOTION DU TRAVAIL", 70, 77);
    const arabicOrganization1 = "مكتب التكوين المهني وإنعاش الشغل";
    doc.text(arabicOrganization1, 105, 82, { align: "center" });
    
    doc.text("D E S I G N E", 90, 90);
    const arabicDesigne = "ي ك ل ف";
    doc.text(arabicDesigne, 100, 95, { align: "center" });
    
    // Create table for mission details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Table header and borders
    doc.rect(20, 100, 170, 100); // Main rectangle
    
    // Row 1 - Name and Matricule
    doc.line(20, 110, 190, 110);
    doc.line(130, 100, 130, 110);
    doc.text("Monsieur/Madame :", 25, 105);
    const arabicMrMs = "السيد/السيدة :";
    doc.text(arabicMrMs, 25, 108);
    doc.text(data.fullName, 70, 105);
    doc.text("Matricule :", 135, 105);
    const arabicMatricule = "الرقم :";
    doc.text(arabicMatricule, 135, 108);
    doc.text(data.matricule, 155, 105);
    
    // Row 2 - Destination
    doc.line(20, 120, 190, 120);
    doc.text("De se rendre à", 25, 115);
    doc.text(":", 60, 115);
    doc.text(data.destination, 70, 115);
    
    // Row 3 - Purpose
    doc.line(20, 130, 190, 130);
    doc.text("Pour accomplir la mission suivante :", 25, 125);
    doc.text(data.purpose, 90, 125);
    
    // Row 4 - Driver information
    doc.line(20, 140, 190, 140);
    doc.line(130, 130, 130, 140);
    doc.text("Conducteur :", 25, 135);
    doc.text(data.driver || "", 70, 135);
    doc.text("Matricule :", 135, 135);
    doc.text(data.driverMatricule || "", 155, 135);
    
    // Row 5 - Start date and time
    doc.line(20, 150, 190, 150);
    doc.line(130, 140, 130, 150);
    doc.text("Date de départ", 25, 145);
    doc.text(":", 60, 145);
    doc.text(format(data.startDate, "yyyy-MM-dd"), 70, 145);
    doc.text("Heure :", 135, 145);
    doc.text(data.startTime || "", 155, 145);
    
    // Row 6 - End date and time
    doc.line(20, 160, 190, 160);
    doc.line(130, 150, 130, 160);
    doc.text("Date de retour", 25, 155);
    doc.text(":", 60, 155);
    doc.text(format(data.endDate, "yyyy-MM-dd"), 70, 155);
    doc.text("Heure :", 135, 155);
    doc.text(data.endTime || "", 155, 155);
    
    // Row 7 - Transport method
    doc.text("L'intéressé(e) utilisera :", 25, 165);
    doc.text(data.transportMethod || "", 70, 165);
    
    // Add the section for destination entity with Arabic translation
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    
    // Add grey background for the header of this section
    doc.setFillColor(220, 220, 220);
    doc.rect(20, 200, 170, 10, "F");
    doc.text("Cadre réservé à l'entité de destinations", 50, 206);
    const arabicEntityHeader = "إطار محجوز لكيان الوجهات";
    doc.text(arabicEntityHeader, 140, 206);
    
    // Create 2-column table below
    doc.rect(20, 210, 170, 40); // Main rectangle
    doc.line(105, 210, 105, 250); // Vertical line dividing the columns
    
    // Headers for each column with Arabic translations
    doc.text("Visa d'arrivée", 45, 216);
    const arabicArrival = "تأشيرة الوصول";
    doc.text(arabicArrival, 65, 220, { align: "center" });
    
    doc.text("Visa de départ", 130, 216);
    const arabicDeparture = "تأشيرة المغادرة";
    doc.text(arabicDeparture, 150, 220, { align: "center" });
    
    // Dividing lines to separate headers from content
    doc.line(20, 225, 190, 225);
    
    // Content rows with Arabic labels
    doc.setFont("helvetica", "normal");
    doc.text("Date et Heure d'arrivée :", 25, 232);
    const arabicArrivalDateTime = "تاريخ ووقت الوصول :";
    doc.text(arabicArrivalDateTime, 25, 236);
    
    doc.text("Date et Heure de départ :", 110, 232);
    const arabicDepartureDateTime = "تاريخ ووقت المغادرة :";
    doc.text(arabicDepartureDateTime, 110, 236);
    
    doc.text("Cachet et signature :", 25, 245);
    const arabicStampSignature1 = "الختم والتوقيع :";
    doc.text(arabicStampSignature1, 25, 248);
    
    doc.text("Cachet et signature :", 110, 245);
    const arabicStampSignature2 = "الختم والتوقيع :";
    doc.text(arabicStampSignature2, 110, 248);
    
    // Add the note at the bottom with Arabic translation
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("NB : Le visa de départ est obligatoire pour les missions au-delà d'une journée.", 20, 260);
    const arabicNote = "ملاحظة : تأشيرة المغادرة إجبارية للمهام التي تتجاوز يوما واحدا.";
    doc.text(arabicNote, 190, 265, { align: "right" });
    
    // Save the PDF
    doc.save(`ordre_mission_${data.fullName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('missionOrderTitle')}</h1>

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
                <div className="flex flex-col gap-3 mt-4">
                  <Button 
                    onClick={() => setIsSubmitted(false)}
                  >
                    {t('newRequest')}
                  </Button>
                </div>
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
                          <Input 
                            placeholder={t('fullNamePlaceholder')}
                            {...field}
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
                        <FormLabel>{t('matricule')}*</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('matriculePlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('destination')}*</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('destinationPlaceholder')}
                          {...field}
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
                      <FormLabel>{t('purpose')}*</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={t('purposePlaceholder')}
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="driver"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('driver')}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('driverPlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="driverMatricule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('driverMatricule')}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('driverMatriculePlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
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
                                  "pl-3 text-right font-normal",
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
                              className={cn("p-3 pointer-events-auto")}
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
                        <FormLabel>{t('startTime')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="time"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
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
                                  "pl-3 text-right font-normal",
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
                              className={cn("p-3 pointer-events-auto")}
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
                        <FormLabel>{t('endTime')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="time"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="transportMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('transportMethod')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('transportMethodPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('additionalInfo')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={t('additionalInfoPlaceholder')}
                          className="resize-none"
                          {...field}
                        />
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

export default MissionOrder;
