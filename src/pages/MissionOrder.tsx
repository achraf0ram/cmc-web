
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      matricule: "",
      destination: "",
      purpose: "",
      driver: "",
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
    // Format dates
    const startDateFormatted = format(data.startDate, "yyyy-MM-dd");
    const endDateFormatted = format(data.endDate, "yyyy-MM-dd");
    
    // Create mission order PDF content
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr" dir="rtl">
      <head>
      <meta charset="UTF-8" />
      <title>Ordre de mission / أمر مهمة</title>
      <style>
        body { font-family: Arial, sans-serif; direction: rtl; line-height: 1.6; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        td, th { border: 1px solid #333; padding: 8px; vertical-align: top; }
        .fr { font-style: italic; direction: ltr; text-align: left; }
      </style>
      </head>
      <body>

      <h1>ORDRE DE MISSION <br> أمر مهمة</h1>

      <table>
        <tr>
          <td>Monsieur/Madame :<br><span class="fr">Monsieur/Madame :</span></td>
          <td>${data.fullName}</td>
        </tr>
        <tr>
          <td>Matricule :<br><span class="fr">Matricule :</span></td>
          <td>${data.matricule}</td>
        </tr>
        <tr>
          <td>De se rendre à :<br><span class="fr">De se rendre à :</span></td>
          <td>${data.destination}</td>
        </tr>
        <tr>
          <td>Pour accomplir la mission suivante :<br><span class="fr">Pour accomplir la mission suivante :</span></td>
          <td>${data.purpose}</td>
        </tr>
        <tr>
          <td>Conducteur :<br><span class="fr">Conducteur :</span></td>
          <td>${data.driver || ""}</td>
        </tr>
        <tr>
          <td>Date de départ :<br><span class="fr">Date de départ :</span></td>
          <td>${startDateFormatted}</td>
        </tr>
        <tr>
          <td>Heure :<br><span class="fr">Heure :</span></td>
          <td>${data.startTime || ""}</td>
        </tr>
        <tr>
          <td>Date de retour :<br><span class="fr">Date de retour :</span></td>
          <td>${endDateFormatted}</td>
        </tr>
        <tr>
          <td>Heure :<br><span class="fr">Heure :</span></td>
          <td>${data.endTime || ""}</td>
        </tr>
        <tr>
          <td>L'intéressé(e) utilisera :<br><span class="fr">L'intéressé(e) utilisera :</span></td>
          <td>${data.transportMethod || ""}</td>
        </tr>
      </table>

      <p><strong>Cadre réservé à l'entité de destinations / القسم المخصص لجهة الوصول :</strong></p>
      <p>Visa d'arrivée / تأشيرة الوصول</p>
      <p>Date et Heure d'arrivée : ..................................................</p>
      <p>Cachet et signature : ..................................................</p>
      <p>Visa de départ / تأشيرة المغادرة</p>
      <p>Date et Heure de départ : ..................................................</p>
      <p>Cachet et signature : ..................................................</p>

      <p><em>NB : Le visa de départ est obligatoire pour les missions au-delà d'une journée.<br>ملاحظة : تأشيرة المغادرة إلزامية للمهمات التي تزيد عن يوم واحد.</em></p>

      </body>
      </html>
    `;
    
    // Create a new blob with the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = url;
    link.download = `mission_order_${startDateFormatted}.html`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
