
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const NotFound = () => {
  const { t } = useLanguage();

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">
        {t('pageNotFoundTitle')}
      </h1>
      <p className="text-muted-foreground mb-6">
        {t('pageNotFoundMessage')}
      </p>
      <Button asChild>
        <Link to="/">
          {t('backToHome')}
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;
