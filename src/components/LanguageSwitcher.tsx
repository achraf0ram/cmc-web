
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(language === 'ar' ? 'fr' : 'ar')}
      className="min-w-[60px] flex items-center gap-1"
    >
      <Globe size={16} />
      {language === 'ar' ? 'FR' : 'عربي'}
    </Button>
  );
};
