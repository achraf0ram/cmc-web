
import React, { createContext, useContext, useEffect, useState } from 'react';

// Define available languages
type Language = 'fr' | 'ar';

// Define translation key structure
interface Translations {
  [key: string]: {
    fr: string;
    ar: string;
  };
}

// Define the context type
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

// Default translations
const translations: Translations = {
  dashboard: {
    fr: 'Tableau de bord',
    ar: 'لوحة التحكم',
  },
  welcome: {
    fr: 'Bienvenue',
    ar: 'مرحباً',
  },
  recentRequests: {
    fr: 'Demandes récentes',
    ar: 'الطلبات الأخيرة',
  },
  upcomingEvents: {
    fr: 'Événements à venir',
    ar: 'الأحداث القادمة',
  },
  pendingApprovals: {
    fr: 'Approbations en attente',
    ar: 'موافقات معلقة',
  },
  settings: {
    fr: 'Paramètres',
    ar: 'الإعدادات',
  },
  settingsDescription: {
    fr: 'Gérez les paramètres et les préférences de votre compte',
    ar: 'إدارة إعدادات وتفضيلات حسابك',
  },
  profileSettings: {
    fr: 'Paramètres du profil',
    ar: 'إعدادات الملف الشخصي',
  },
  appearanceSettings: {
    fr: 'Paramètres d\'apparence',
    ar: 'إعدادات المظهر',
  },
  darkMode: {
    fr: 'Mode sombre',
    ar: 'الوضع المظلم',
  },
  lightMode: {
    fr: 'Mode clair',
    ar: 'الوضع الفاتح',
  },
  darkModeDescription: {
    fr: 'Basculer entre le mode clair et le mode sombre',
    ar: 'التبديل بين الوضع الفاتح والوضع المظلم',
  },
  fullName: {
    fr: 'Nom complet',
    ar: 'الاسم الكامل',
  },
  enterFullName: {
    fr: 'Entrez votre nom complet',
    ar: 'أدخل اسمك الكامل',
  },
  email: {
    fr: 'Email',
    ar: 'البريد الإلكتروني',
  },
  saveChanges: {
    fr: 'Enregistrer les modifications',
    ar: 'حفظ التغييرات',
  },
  saving: {
    fr: 'Enregistrement...',
    ar: 'جاري الحفظ...',
  },
  vacationRequest: {
    fr: 'Demande de congé',
    ar: 'طلب إجازة',
  },
  workCertificate: {
    fr: 'Certificat de travail',
    ar: 'شهادة عمل',
  },
  missionOrder: {
    fr: 'Ordre de mission',
    ar: 'أمر مهمة',
  },
  signIn: {
    fr: 'Se connecter',
    ar: 'تسجيل الدخول',
  },
  signUp: {
    fr: 'S\'inscrire',
    ar: 'إنشاء حساب',
  },
  startDate: {
    fr: 'Date de début',
    ar: 'تاريخ البدء',
  },
  endDate: {
    fr: 'Date de fin',
    ar: 'تاريخ الانتهاء',
  },
  reason: {
    fr: 'Raison',
    ar: 'السبب',
  },
  submit: {
    fr: 'Soumettre',
    ar: 'إرسال',
  },
  submitting: {
    fr: 'Soumission...',
    ar: 'جاري الإرسال...',
  },
  selectDates: {
    fr: 'Sélectionner les dates',
    ar: 'اختر التواريخ',
  },
  pleaseWait: {
    fr: 'Veuillez patienter...',
    ar: 'برجاء الانتظار...',
  },
  enterReason: {
    fr: 'Entrez la raison du congé',
    ar: 'أدخل سبب الإجازة',
  },
  success: {
    fr: 'Succès',
    ar: 'نجاح',
  },
  successfullySubmitted: {
    fr: 'Votre demande a été soumise avec succès',
    ar: 'تم تقديم طلبك بنجاح',
  },
  home: {
    fr: 'Accueil',
    ar: 'الرئيسية',
  },
  search: {
    fr: 'Rechercher',
    ar: 'بحث',
  },
  notifications: {
    fr: 'Notifications',
    ar: 'الإشعارات',
  },
  viewAll: {
    fr: 'Voir tout',
    ar: 'عرض الكل',
  },
  logout: {
    fr: 'Déconnexion',
    ar: 'تسجيل الخروج',
  },
  pendingRequests: {
    fr: 'Demandes en attente',
    ar: 'الطلبات المعلقة',
  },
  approvedRequests: {
    fr: 'Demandes approuvées',
    ar: 'الطلبات الموافق عليها',
  },
  vacationDays: {
    fr: 'Jours de congé',
    ar: 'أيام الإجازة',
  },
  awaitingApproval: {
    fr: 'En attente d\'approbation',
    ar: 'في انتظار الموافقة',
  },
  thisMonth: {
    fr: 'Ce mois-ci',
    ar: 'هذا الشهر',
  },
  remaining: {
    fr: 'Restant',
    ar: 'متبقي',
  },
  // Work certificate translations
  workCertificateTitle: {
    fr: 'Demande de certificat de travail',
    ar: 'طلب شهادة عمل',
  },
  requestSubmitted: {
    fr: 'Demande soumise',
    ar: 'تم تقديم الطلب',
  },
  requestReviewMessage: {
    fr: 'Votre demande est en cours d\'examen. ',
    ar: 'طلبك قيد المراجعة. ',
  },
  followUpMessage: {
    fr: 'Nous vous contacterons sous peu.',
    ar: 'سنتواصل معك قريبًا.',
  },
  newRequest: {
    fr: 'Nouvelle demande',
    ar: 'طلب جديد',
  },
  requestInfo: {
    fr: 'Informations sur la demande',
    ar: 'معلومات الطلب',
  },
  purposeLabel: {
    fr: 'Objet',
    ar: 'الغرض',
  },
  purposePlaceholder: {
    fr: 'Veuillez décrire l\'objectif du certificat',
    ar: 'يرجى وصف الغرض من الشهادة',
  },
  additionalInfo: {
    fr: 'Informations supplémentaires',
    ar: 'معلومات إضافية',
  },
  additionalInfoPlaceholder: {
    fr: 'Toute information complémentaire que vous souhaitez ajouter',
    ar: 'أي معلومات إضافية ترغب في إضافتها',
  },
  signatureUpload: {
    fr: 'Télécharger la signature',
    ar: 'تحميل التوقيع',
  },
  signatureUploadButton: {
    fr: 'Sélectionner le fichier de signature',
    ar: 'اختر ملف التوقيع',
  },
  // New settings page translations
  profileTab: {
    fr: 'Profil',
    ar: 'الملف الشخصي',
  },
  notificationsTab: {
    fr: 'Notifications',
    ar: 'الإشعارات',
  },
  passwordTab: {
    fr: 'Mot de passe',
    ar: 'كلمة المرور',
  },
  name: {
    fr: 'Nom',
    ar: 'الاسم',
  },
  phone: {
    fr: 'Téléphone',
    ar: 'رقم الهاتف',
  },
  notificationSettings: {
    fr: 'Paramètres de notification',
    ar: 'إعدادات الإشعارات',
  },
  emailNotifications: {
    fr: 'Notifications par email',
    ar: 'إشعارات البريد الإلكتروني',
  },
  emailNotificationsDesc: {
    fr: 'Recevoir des notifications par email',
    ar: 'تلقي الإشعارات عبر البريد الإلكتروني',
  },
  newRequests: {
    fr: 'Nouvelles demandes',
    ar: 'الطلبات الجديدة',
  },
  newRequestsDesc: {
    fr: 'Notifications pour les nouvelles demandes',
    ar: 'إشعارات للطلبات الجديدة',
  },
  requestUpdates: {
    fr: 'Mises à jour des demandes',
    ar: 'تحديثات الطلبات',
  },
  requestUpdatesDesc: {
    fr: 'Notifications pour les mises à jour des demandes',
    ar: 'إشعارات لتحديثات الطلبات',
  },
  passwordSettings: {
    fr: 'Paramètres du mot de passe',
    ar: 'إعدادات كلمة المرور',
  },
  currentPassword: {
    fr: 'Mot de passe actuel',
    ar: 'كلمة المرور الحالية',
  },
  newPassword: {
    fr: 'Nouveau mot de passe',
    ar: 'كلمة المرور الجديدة',
  },
  confirmPassword: {
    fr: 'Confirmer le mot de passe',
    ar: 'تأكيد كلمة المرور',
  },
  changePassword: {
    fr: 'Changer le mot de passe',
    ar: 'تغيير كلمة المرور',
  },
};

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component
export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize state with preferred language or default to Arabic
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || 'ar';
  });

  // Update document direction when language changes
  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language];
    }
    console.warn(`Translation missing for key: ${key}`);
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
