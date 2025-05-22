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
import { CheckCircle, Calendar, Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
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
import { format } from "date-fns";
import { ar, fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  fullName: z.string().min(3, {
    message: "يرجى إدخال الاسم الكامل",
  }),
  matricule: z.string().min(1, {
    message: "يرجى إدخال رقم التسجيل",
  }),
  echelle: z.string().optional(),
  grade: z.string().optional(),
  fonction: z.string().optional(),
  direction: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  leaveType: z.string().min(1, {
    message: "يرجى اختيار نوع الإجازة",
  }),
  duration: z.string().min(1, {
    message: "يرجى تحديد المدة",
  }),
  startDate: z.date({
    required_error: "يرجى تحديد تاريخ البداية",
  }),
  endDate: z.date({
    required_error: "يرجى تحديد تاريخ النهاية",
  }),
  with: z.string().optional(),
  interim: z.string().optional(),
  additionalInfo: z.string().optional(),
});

const VacationRequest = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      matricule: "",
      echelle: "",
      grade: "",
      fonction: "",
      direction: "",
      address: "",
      phone: "",
      leaveType: "",
      duration: "",
      with: "",
      interim: "",
      additionalInfo: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setIsSubmitted(true);
    generatePDF(values);
  }

  const generatePDF = (data: z.infer<typeof formSchema>) => {
    // Create vacation request PDF content
    const leaveTypeOptions = {
      administrative: "إدارية / Administrative",
      marriage: "زواج / Mariage",
      birth: "ازدياد / Naissance",
      exceptional: "استثنائية / Exceptionnel"
    };
    
    const startDateFormatted = format(data.startDate, "yyyy-MM-dd");
    const endDateFormatted = format(data.endDate, "yyyy-MM-dd");
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr" dir="rtl">
      <head>
      <meta charset="UTF-8" />
      <title>Demande de congé / طلب إجازة</title>
      <style>
        body { font-family: Arial, sans-serif; direction: rtl; line-height: 1.6; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        td, th { border: 1px solid #333; padding: 8px; vertical-align: top; }
        .section-title { background-color: #eee; font-weight: bold; text-align: center; }
        .fr { font-style: italic; direction: ltr; text-align: left; }
      </style>
      </head>
      <body>

      <h1>Demande de congé <br> طلب إجازة</h1>

      <table>
        <tr>
          <td>Nom & Prénom :<br><span class="fr">Nom & Prénom :</span></td>
          <td>${data.fullName}</td>
        </tr>
        <tr>
          <td>Matricule :<br><span class="fr">Matricule :</span></td>
          <td>${data.matricule}</td>
        </tr>
        <tr>
          <td>Echelle :<br><span class="fr">Echelle :</span></td>
          <td>${data.echelle || ""}</td>
        </tr>
        <tr>
          <td>Grade :<br><span class="fr">Grade :</span></td>
          <td>${data.grade || ""}</td>
        </tr>
        <tr>
          <td>Fonction :<br><span class="fr">Fonction :</span></td>
          <td>${data.fonction || ""}</td>
        </tr>
        <tr>
          <td>Direction :<br><span class="fr">Direction :</span></td>
          <td>${data.direction || ""}</td>
        </tr>
        <tr>
          <td>Adresse :<br><span class="fr">Adresse :</span></td>
          <td>${data.address || ""}</td>
        </tr>
        <tr>
          <td>Téléphone :<br><span class="fr">Téléphone :</span></td>
          <td>${data.phone || ""}</td>
        </tr>
        <tr>
          <td>Nature de congé :<br><span class="fr">Nature de congé :</span></td>
          <td>${leaveTypeOptions[data.leaveType as keyof typeof leaveTypeOptions] || data.leaveType}</td>
        </tr>
        <tr>
          <td>Durée :<br><span class="fr">Durée :</span></td>
          <td>${data.duration}</td>
        </tr>
        <tr>
          <td>Du :<br><span class="fr">Du :</span></td>
          <td>${startDateFormatted}</td>
        </tr>
        <tr>
          <td>Au :<br><span class="fr">Au :</span></td>
          <td>${endDateFormatted}</td>
        </tr>
        <tr>
          <td>Avec :<br><span class="fr">Avec :</span></td>
          <td>${data.with || ""}</td>
        </tr>
        <tr>
          <td>Intérim (Nom et Fonction) :<br><span class="fr">Intérim (Nom et Fonction) :</span></td>
          <td>${data.interim || ""}</td>
        </tr>
      </table>

      <p><strong>Signature de l'intéressé / إمضاء المعني(ة) بالأمر :</strong> ......................................</p>

      <p><strong>Avis du Chef Immédiat / رأي الرئيس المباشر :</strong> ......................................</p>

      <p><strong>Avis du Directeur / رأي المدير :</strong> ......................................</p>

      <hr>

      <p><strong>Très important / هام جدا :</strong></p>
      <ul>
        <li>Aucun agent n'est autorisé à quitter le lieu de son travail avant d'avoir obtenu sa décision de congé, sinon il sera considéré en abandon de poste.<br><span class="fr">لا يسمح لأي مستخدم بمغادرة العمل إلا بعد توصله بمقرر الإجازة وإلا اعتبر في وضعية تخلي عن العمل.</span></li>
        <li>La demande doit être déposée 8 jours avant la date demandée.<br><span class="fr">يجب تقديم الطلب 8 أيام قبل التاريخ المطلوب.</span></li>
        <li>Nature de congé : Administratif - Mariage - Naissance - Exceptionnel.<br><span class="fr">نوع الإجازة : إدارية - زواج - ازدياد - استثنائية.</span></li>
        <li>Si l'intéressé projette de quitter le territoire marocain, il doit le mentionner.<br><span class="fr">إذا كان المعني يرغب في مغادرة التراب الوطني فعليه ذكر ذلك.</span></li>
      </ul>
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
    link.download = `vacation_request_${startDateFormatted}.html`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('vacationRequestTitle')}</h1>

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
            <CardTitle>{t('vacationRequestInfo')}</CardTitle>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="echelle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('echelle')}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('echellePlaceholder')}
                            {...field}
                          />
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
                          <Input 
                            placeholder={t('gradePlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fonction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('fonction')}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('fonctionPlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="direction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('direction')}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('directionPlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('address')}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('addressPlaceholder')}
                            {...field}
                          />
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
                          <Input 
                            placeholder={t('phonePlaceholder')}
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
                  name="leaveType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('leaveType')}*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectLeaveType')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="administrative">{t('administrative')}</SelectItem>
                          <SelectItem value="marriage">{t('marriage')}</SelectItem>
                          <SelectItem value="birth">{t('birth')}</SelectItem>
                          <SelectItem value="exceptional">{t('exceptional')}</SelectItem>
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
                        <Input 
                          placeholder={t('durationPlaceholder')}
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
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
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
                                  "pl-3 text-right font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: language === 'ar' ? ar : fr })
                                ) : (
                                  <span>{t('selectDate')}</span>
                                )}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="with"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('with')}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('withPlaceholder')}
                            {...field}
                          />
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
                          <Input 
                            placeholder={t('interimPlaceholder')}
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

export default VacationRequest;
