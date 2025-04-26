
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
    dashboard: "لوحة التحكم",
    pendingRequests: "الطلبات المعلقة",
    approvedRequests: "الطلبات الموافق عليها",
    vacationDays: "أيام الإجازة",
    awaitingApproval: "في انتظار الموافقة",
    thisMonth: "هذا الشهر",
    remaining: "متبقية",
    workCertificate: "طلب شهادة عمل",
    missionOrder: "أمر مهمة",
    vacationRequest: "طلب إجازة",
    settings: "الإعدادات",
    profile: "الملف الشخصي",
    notifications: "الإشعارات",
    logout: "تسجيل الخروج",
    search: "بحث",
    viewAll: "عرض الكل",
    name: "الاسم",
    startDate: "تاريخ البداية",
    endDate: "تاريخ النهاية",
    submit: "إرسال",
    cancel: "إلغاء",
    signatureUpload: "رفع التوقيع",
    reason: "السبب",
    type: "النوع",
    description: "الوصف",
    save: "حفظ"
  },
  fr: {
    home: "Accueil",
    dashboard: "Tableau de bord",
    pendingRequests: "Demandes en attente",
    approvedRequests: "Demandes approuvées",
    vacationDays: "Jours de congé",
    awaitingApproval: "En attente d'approbation",
    thisMonth: "Ce mois-ci",
    remaining: "Restants",
    workCertificate: "Attestation de travail",
    missionOrder: "Ordre de mission",
    vacationRequest: "Demande de congé",
    settings: "Paramètres",
    profile: "Profil",
    notifications: "Notifications",
    logout: "Déconnexion",
    search: "Rechercher",
    viewAll: "Voir tout",
    name: "Nom",
    startDate: "Date de début",
    endDate: "Date de fin",
    submit: "Soumettre",
    cancel: "Annuler",
    signatureUpload: "Télécharger la signature",
    reason: "Raison",
    type: "Type",
    description: "Description",
    save: "Enregistrer"
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
      <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen">
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
