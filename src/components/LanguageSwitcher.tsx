
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(language === 'ar' ? 'fr' : 'ar')}
      className="min-w-[50px] md:min-w-[60px] h-8 md:h-9 text-xs md:text-sm border-cmc-blue/30 text-cmc-blue hover:bg-cmc-blue-light/30 hover:border-cmc-blue transition-all duration-200"
    >
      {language === 'ar' ? 'FR' : 'عربي'}
    </Button>
  );
};
