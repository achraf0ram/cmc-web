
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
    doc.addImage(logoPath, 'PNG', 20, 10, 50, 20);
    
    // Add headers and reference number
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("N/Réf : OFP/DR Casa Settat/", 20, 40);
    doc.text("/N°", 70, 40);
    doc.text("…/2025", 75, 40);
    doc.text(`Casablanca, le ${currentDate}`, 145, 40);
    
    // Add the title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("ORDRE DE MISSION", 80, 55);
    doc.text("OFFICE DE LA FORMATION PROFESSIONNELLE", 50, 62);
    doc.text("ET DE LA PROMOTION DU TRAVAIL", 70, 69);
    
    doc.text("D E S I G N E", 90, 80);
    
    // Create table for mission details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Table header and borders
    doc.rect(20, 85, 170, 100); // Main rectangle
    
    // Row 1
    doc.line(20, 95, 190, 95); // Horizontal line after row 1
    doc.line(130, 85, 130, 95); // Vertical line in row 1
    doc.text("Monsieur/Madame :", 25, 90);
    doc.text(data.fullName, 70, 90);
    doc.text("Matricule :", 135, 90);
    doc.text(data.matricule, 155, 90);
    
    // Row 2
    doc.line(20, 105, 190, 105); // Horizontal line after row 2
    doc.text("De se rendre à", 25, 100);
    doc.text(":", 60, 100);
    doc.text(data.destination, 70, 100);
    
    // Row 3
    doc.line(20, 115, 190, 115); // Horizontal line after row 3
    doc.text("Pour accomplir la mission suivante :", 25, 110);
    doc.text(data.purpose, 90, 110);
    
    // Row 4
    doc.line(20, 125, 190, 125); // Horizontal line after row 4
    doc.line(130, 115, 130, 125); // Vertical line in row 4
    doc.text("Conducteur :", 25, 120);
    doc.text(data.driver || "", 70, 120);
    doc.text("Matricule :", 135, 120);
    doc.text(data.driverMatricule || "", 155, 120);
    
    // Row 5
    doc.line(20, 135, 190, 135); // Horizontal line after row 5
    doc.line(130, 125, 130, 135); // Vertical line in row 5
    doc.text("Date de départ", 25, 130);
    doc.text(":", 60, 130);
    doc.text(format(data.startDate, "yyyy-MM-dd"), 70, 130);
    doc.text("Heure :", 135, 130);
    doc.text(data.startTime || "", 155, 130);
    
    // Row 6
    doc.line(20, 145, 190, 145); // Horizontal line after row 6
    doc.line(130, 135, 130, 145); // Vertical line in row 6
    doc.text("Date de retour", 25, 140);
    doc.text(":", 60, 140);
    doc.text(format(data.endDate, "yyyy-MM-dd"), 70, 140);
    doc.text("Heure :", 135, 140);
    doc.text(data.endTime || "", 155, 140);
    
    // Row 7
    doc.text("L'intéressé(e) utilisera :", 25, 150);
    doc.text(data.transportMethod || "", 70, 150);
    
    // Add the section for destination entity
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    
    // Add grey background for the header of this section
    doc.setFillColor(220, 220, 220);
    doc.rect(20, 195, 170, 10, "F");
    doc.text("Cadre réservé à l'entité de destinations", 70, 201);
    
    // Create 2-column table below
    doc.rect(20, 205, 170, 40); // Main rectangle
    doc.line(105, 205, 105, 245); // Vertical line dividing the columns
    
    // Headers for each column
    doc.text("Visa d'arrivée", 55, 211);
    doc.text("Visa de départ", 140, 211);
    
    // Dividing lines to separate headers from content
    doc.line(20, 215, 190, 215);
    
    // Content rows
    doc.setFont("helvetica", "normal");
    doc.text("Date et Heure d'arrivée :", 25, 222);
    doc.text("Date et Heure de départ :", 110, 222);
    
    doc.text("Cachet et signature :", 25, 235);
    doc.text("Cachet et signature :", 110, 235);
    
    // Add the note at the bottom
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("NB : Le visa de départ est obligatoire pour les missions au-delà d'une journée.", 30, 255);
    
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
