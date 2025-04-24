
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const NotFound = () => {
  const { t, language } = useLanguage();

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">
        {language === 'ar' ? '404 - الصفحة غير موجودة' : '404 - Page non trouvée'}
      </h1>
      <p className="text-muted-foreground mb-6">
        {language === 'ar' 
          ? 'عذراً، الصفحة التي تبحث عنها غير موجودة'
          : 'Désolé, la page que vous recherchez est introuvable'
        }
      </p>
      <Button asChild>
        <Link to="/">
          {language === 'ar' ? 'العودة للرئيسية' : 'Retour à l\'accueil'}
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;
