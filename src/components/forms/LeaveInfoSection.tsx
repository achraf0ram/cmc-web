
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { format } from "date-fns";
import { ar, fr } from "date-fns/locale";
import { CalendarIcon, FileImage } from "lucide-react";
import { FormData } from "@/types/vacationRequest";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface LeaveInfoSectionProps {
  form: UseFormReturn<FormData>;
  signaturePreview: string | null;
  setSignaturePreview: (preview: string | null) => void;
}

const LeaveInfoSection = ({ form, signaturePreview, setSignaturePreview }: LeaveInfoSectionProps) => {
  const { language } = useLanguage();
  const [showCustomLeaveType, setShowCustomLeaveType] = useState(false);

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

  return (
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
    </div>
  );
};

export default LeaveInfoSection;
