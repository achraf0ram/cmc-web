
import { UseFormReturn } from "react-hook-form";
import { FormData } from "@/types/vacationRequest";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

interface PersonalInfoSectionProps {
  form: UseFormReturn<FormData>;
}

const PersonalInfoSection = ({ form }: PersonalInfoSectionProps) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 border-b border-blue-200 pb-2">
        {language === 'ar' ? 'المعلومات الشخصية' : 'Informations Personnelles'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                {language === 'ar' ? 'الاسم الكامل' : 'Nom & Prénom'} *
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={language === 'ar' ? 'أدخل الاسم الكامل' : 'Entrez le nom complet'}
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
              <FormLabel className="text-sm font-medium text-gray-700">
                {language === 'ar' ? 'الرقم المالي' : 'Matricule'} *
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={language === 'ar' ? 'أدخل الرقم المالي' : 'Entrez le matricule'}
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="echelle"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                {language === 'ar' ? 'الرتبة' : 'Échelle'}
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={language === 'ar' ? 'أدخل الرتبة' : 'Entrez l\'échelle'}
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="echelon"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                {language === 'ar' ? 'السلم' : 'Échelon'}
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={language === 'ar' ? 'أدخل السلم' : 'Entrez l\'échelon'}
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
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
              <FormLabel className="text-sm font-medium text-gray-700">
                {language === 'ar' ? 'الدرجة' : 'Grade'}
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={language === 'ar' ? 'أدخل الدرجة' : 'Entrez le grade'}
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
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
              <FormLabel className="text-sm font-medium text-gray-700">
                {language === 'ar' ? 'الهاتف' : 'Téléphone'}
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={language === 'ar' ? 'أدخل رقم الهاتف' : 'Entrez le numéro de téléphone'}
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
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
          name="fonction"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Fonction (Français)
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Entrez la fonction en français"
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="arabicFonction"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                الوظيفة (العربية)
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="أدخل الوظيفة بالعربية"
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
          name="direction"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Direction (Français)
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Entrez la direction en français"
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="arabicDirection"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                المديرية (العربية)
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="أدخل المديرية بالعربية"
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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Adresse (Français)
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Entrez l'adresse en français"
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="arabicAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                العنوان (العربية)
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="أدخل العنوان بالعربية"
                  className="border-green-300 focus:border-green-500 focus:ring-green-200 text-right"
                  dir="rtl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default PersonalInfoSection;
