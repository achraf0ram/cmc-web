
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  const { toast } = useToast();

  const handleLanguageChange = () => {
    const newLanguage = language === 'ar' ? 'fr' : 'ar';
    setLanguage(newLanguage);
    
    // Show a toast notification when language changes
    toast({
      title: newLanguage === 'ar' 
        ? 'تم تغيير اللغة إلى العربية'
        : 'Langue changée en français',
      description: newLanguage === 'ar'
        ? 'تم تحديث واجهة المستخدم'
        : 'L\'interface a été mise à jour',
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLanguageChange}
      className="min-w-[60px] flex items-center gap-1"
    >
      <Globe size={16} />
      {language === 'ar' ? 'FR' : 'عربي'}
    </Button>
  );
};
