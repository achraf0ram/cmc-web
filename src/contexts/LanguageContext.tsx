
import { createContext, useContext, useState } from 'react';

type Language = 'ar' | 'fr';

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  ar: {
    home: "الرئيسية",
    workCertificate: "طلب شهادة عمل",
    missionOrder: "أمر مهمة",
    vacationRequest: "طلب إجازة",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
    notifications: "الإشعارات",
    viewAll: "عرض الكل",
    search: "بحث...",
    welcome: "مرحباً بك،",
  },
  fr: {
    home: "Accueil",
    workCertificate: "Demande d'attestation",
    missionOrder: "Ordre de mission",
    vacationRequest: "Demande de congé",
    settings: "Paramètres",
    logout: "Déconnexion",
    notifications: "Notifications",
    viewAll: "Voir tout",
    search: "Rechercher...",
    welcome: "Bienvenue,",
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
