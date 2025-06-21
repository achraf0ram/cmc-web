
import { UseFormReturn } from "react-hook-form";
import { FormData } from "@/types/vacationRequest";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

interface PersonalInfoSectionProps {
  form: UseFormReturn<FormData>;
}

const PersonalInfoSection = ({ form }: PersonalInfoSectionProps) => {
  const { language, t } = useLanguage();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 border-b border-blue-200 pb-2">
        {t('personalInfo')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                {t('fullName')} *
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={t('fullNamePlaceholder')}
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
                {t('matricule')} *
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={t('matriculePlaceholder')}
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
                {t('echelle')}
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={t('echellePlaceholder')}
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
                {t('echelon')}
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={t('echelonPlaceholder')}
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
                {t('grade')}
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={t('gradePlaceholder')}
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
                {t('phone')}
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={t('phonePlaceholder')}
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
                {language === 'ar' ? 'الوظيفة (العربية)' : 'Fonction (Français)'}
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={language === 'ar' ? t('fonctionPlaceholder') : 'Entrez la fonction en français'}
                  className={language === 'ar' ? 
                    "border-green-300 focus:border-green-500 focus:ring-green-200 text-right" :
                    "border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                  }
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
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
                {language === 'ar' ? 'الوظيفة (الفرنسية)' : 'Fonction (Arabe)'}
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={language === 'ar' ? 'أدخل الوظيفة بالفرنسية' : 'Entrez la fonction en arabe'}
                  className={language === 'ar' ? 
                    "border-blue-300 focus:border-blue-500 focus:ring-blue-200" :
                    "border-green-300 focus:border-green-500 focus:ring-green-200 text-right"
                  }
                  dir={language === 'ar' ? 'ltr' : 'rtl'}
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
                {language === 'ar' ? 'المديرية (العربية)' : 'Direction (Français)'}
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={language === 'ar' ? t('directionPlaceholder') : 'Entrez la direction en français'}
                  className={language === 'ar' ? 
                    "border-green-300 focus:border-green-500 focus:ring-green-200 text-right" :
                    "border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                  }
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
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
                {language === 'ar' ? 'المديرية (الفرنسية)' : 'Direction (Arabe)'}
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={language === 'ar' ? 'أدخل المديرية بالفرنسية' : 'Entrez la direction en arabe'}
                  className={language === 'ar' ? 
                    "border-blue-300 focus:border-blue-500 focus:ring-blue-200" :
                    "border-green-300 focus:border-green-500 focus:ring-green-200 text-right"
                  }
                  dir={language === 'ar' ? 'ltr' : 'rtl'}
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
                {language === 'ar' ? 'العنوان (العربية)' : 'Adresse (Français)'}
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={language === 'ar' ? t('addressPlaceholder') : 'Entrez l\'adresse en français'}
                  className={language === 'ar' ? 
                    "border-green-300 focus:border-green-500 focus:ring-green-200 text-right" :
                    "border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                  }
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
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
                {language === 'ar' ? 'العنوان (الفرنسية)' : 'Adresse (Arabe)'}
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={language === 'ar' ? 'أدخل العنوان بالفرنسية' : 'Entrez l\'adresse en arabe'}
                  className={language === 'ar' ? 
                    "border-blue-300 focus:border-blue-500 focus:ring-blue-200" :
                    "border-green-300 focus:border-green-500 focus:ring-green-200 text-right"
                  }
                  dir={language === 'ar' ? 'ltr' : 'rtl'}
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
