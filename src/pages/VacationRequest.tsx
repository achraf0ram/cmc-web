
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
import { CheckCircle, CalendarIcon, Download } from "lucide-react";
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
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ar, fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";

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
  const logoPath = "/lovable-uploads/d44e75ac-eac5-4ed3-bf43-21a71c6a089d.png";

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
    const doc = new jsPDF('p', 'mm', 'a4');
    const currentDate = format(new Date(), "dd/MM/yyyy");
    
    // Add the OFPPT logo
    doc.addImage(logoPath, 'PNG', 20, 10, 50, 20);
    
    // Add reference and date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Réf : OFP/DR……/CMC…../N°", 20, 40);
    doc.text("/2025", 75, 40);
    doc.text("Date :", 20, 45);
    doc.text(currentDate, 35, 45);
    
    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Demande de congé", 80, 60);
    doc.text("طلب إجازة", 95, 65);
    
    // Personal information
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    doc.text("Nom & Prénom :", 20, 75);
    doc.text(data.fullName, 60, 75);
    doc.text(":الاسم الكامل", 160, 75);
    
    doc.text("Matricule :", 20, 80);
    doc.text(data.matricule, 60, 80);
    doc.text(":الرقم الوظيفي", 160, 80);
    
    doc.text("Echelle :", 20, 85);
    doc.text(data.echelle || "", 60, 85);
    doc.text("Echelon :", 100, 85);
    doc.text(":السلم", 160, 85);
    
    doc.text("Grade :", 20, 90);
    doc.text(data.grade || "", 60, 90);
    doc.text(":الدرجة", 160, 90);
    
    doc.text("Fonction :", 20, 95);
    doc.text(data.fonction || "", 60, 95);
    doc.text(":الوظيفة", 160, 95);
    
    // Affectation section
    doc.setFont("helvetica", "bold");
    doc.text("Affectation", 90, 105);
    doc.text("التعيين", 100, 110);
    doc.setFont("helvetica", "normal");
    
    doc.text("Direction :", 20, 120);
    doc.text(data.direction || "", 60, 120);
    doc.text(":المديرية", 160, 120);
    
    doc.text("Adresse :", 20, 125);
    doc.text(data.address || "", 60, 125);
    doc.text(":العنوان", 160, 125);
    
    doc.text("Téléphone :", 20, 130);
    doc.text(data.phone || "", 60, 130);
    doc.text(":الهاتف", 160, 130);
    
    doc.text("Nature de congé (1) :", 20, 135);
    
    const leaveTypeOptions = {
      administrative: "إدارية / Administrative",
      marriage: "زواج / Mariage",
      birth: "ازدياد / Naissance",
      exceptional: "استثنائية / Exceptionnel"
    };
    
    doc.text(leaveTypeOptions[data.leaveType as keyof typeof leaveTypeOptions] || data.leaveType, 70, 135);
    doc.text(":(1) نوع الإجازة", 160, 135);
    
    doc.text("Durée :", 20, 140);
    doc.text(data.duration, 60, 140);
    doc.text(":المدة", 160, 140);
    
    doc.text("Du :", 20, 145);
    doc.text(format(data.startDate, "yyyy-MM-dd"), 60, 145);
    doc.text(":من", 160, 145);
    
    doc.text("Au :", 20, 150);
    doc.text(format(data.endDate, "yyyy-MM-dd"), 60, 150);
    doc.text(":إلى", 160, 150);
    
    doc.text("Avec (3) :", 20, 155);
    doc.text(data.with || "", 60, 155);
    doc.text(":(3) مع", 160, 155);
    
    doc.text("Intérim (Nom et Fonction) :", 20, 160);
    doc.text(data.interim || "", 80, 160);
    doc.text(":(الإنابة (الاسم والوظيفة", 160, 160);
    
    // Signature sections
    doc.text("Signature de l'intéressé", 30, 175);
    doc.text("إمضاء المعني(ة) بالأمر", 30, 180);
    
    doc.text("Avis du Chef Immédiat", 85, 175);
    doc.text("رأي الرئيس المباشر", 85, 180);
    
    doc.text("Avis du Directeur", 150, 175);
    doc.text("رأي المدير", 150, 180);
    
    // Important notes
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Très important :", 20, 200);
    doc.text("هام جدا :", 150, 200);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("1. Aucun agent n'est autorisé à quitter le lieu de son travail avant d'avoir obtenu sa décision de congé, sinon il sera considéré en abandon de poste.", 20, 205, { maxWidth: 170 });
    doc.text("2. La demande doit être déposée 8 jours avant la date demandée.", 20, 215);
    doc.text("3. Nature de congé : Administratif - Mariage - Naissance - Exceptionnel.", 20, 220);
    doc.text("4. Si l'intéressé projette de quitter le territoire marocain, il doit le mentionner.", 20, 225);
    
    // Save the PDF
    doc.save(`demande_conge_${data.fullName.replace(/\s+/g, '_')}.pdf`);
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
