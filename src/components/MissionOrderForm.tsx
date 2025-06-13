
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { createMissionOrderSchema, MissionOrderFormData } from "@/utils/missionOrderSchema";

interface MissionOrderFormProps {
  onSubmit: (data: MissionOrderFormData) => Promise<void>;
  isGenerating: boolean;
}

const MissionOrderForm = ({ onSubmit, isGenerating }: MissionOrderFormProps) => {
  const { language, t } = useLanguage();
  const formSchema = createMissionOrderSchema(language);

  const form = useForm<MissionOrderFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monsieurMadame: "",
      matricule: "",
      destination: "",
      purpose: "",
      additionalInfo: "",
      conducteur: "",
      conducteurMatricule: "",
      startTime: "",
      endTime: "",
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            {language === 'ar' ? 'أمر المهمة' : 'Ordre de Mission'}
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            {language === 'ar' ? 'قم بملء البيانات المطلوبة لإصدار أمر المهمة' : 'Veuillez remplir les informations requises pour obtenir votre ordre de mission'}
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl font-semibold text-center">
              {language === 'ar' ? 'معلومات الطلب' : 'Informations de la demande'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <FormField
                    control={form.control}
                    name="monsieurMadame"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">
                          {language === 'ar' ? 'السيد/السيدة' : 'Monsieur/Madame'}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
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
                        <FormLabel className="text-slate-700 font-medium">
                          {language === 'ar' ? 'الرقم التسجيلي' : 'Matricule'}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">
                          {language === 'ar' ? 'الوجهة' : 'Destination'}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                            placeholder={t("destinationPlaceholder")}
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
                        <FormLabel className="text-slate-700 font-medium">
                          {language === 'ar' ? 'الغرض' : 'Objet'}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="resize-none border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                            placeholder={t("purposePlaceholder")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-slate-700 font-medium">
                          {language === 'ar' ? 'تاريخ البداية' : 'Date de départ'}
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
                                  format(field.value, "yyyy-MM-dd")
                                ) : (
                                  <span>{t("pickDate")}</span>
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
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">
                          {language === 'ar' ? 'وقت البداية' : 'Heure de départ'}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="time" 
                            {...field} 
                            className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-slate-700 font-medium">
                          {language === 'ar' ? 'تاريخ النهاية' : 'Date de retour'}
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
                                  format(field.value, "yyyy-MM-dd")
                                ) : (
                                  <span>{t("pickDate")}</span>
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
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">
                          {language === 'ar' ? 'وقت النهاية' : 'Heure de retour'}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="time" 
                            {...field} 
                            className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="conducteur"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">
                          {language === 'ar' ? 'السائق' : 'Conducteur'}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="conducteurMatricule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">
                          {language === 'ar' ? 'رقم تسجيل السائق' : 'Matricule Conducteur'}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
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
                      <FormLabel className="text-slate-700 font-medium">
                        {language === 'ar' ? 'معلومات إضافية' : 'Informations supplémentaires'}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="resize-none border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                          placeholder={t("additionalInfoPlaceholder")}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-center pt-4 md:pt-6">
                  <Button 
                    type="submit" 
                    disabled={isGenerating}
                    className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isGenerating ? 
                      (language === 'ar' ? "جاري المعالجة..." : "Traitement en cours...") 
                      : (language === 'ar' ? "إرسال وتحميل PDF" : "Envoyer et télécharger le PDF")}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MissionOrderForm;
