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
  ai: {
    fr: 'IA',
    ar: 'ذكاء اصطناعي',
  },
  aiAssistant: {
    fr: 'Assistant IA',
    ar: 'مساعد ذكي',
  },
  aiChat: {
    fr: 'Chat IA',
    ar: 'محادثة ذكية',
  },
  askAI: {
    fr: 'Demander à l\'IA',
    ar: 'اسأل الذكاء الاصطناعي',
  },
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
  loading: {
    fr: 'Chargement...',
    ar: 'جاري التحميل...',
  },
  loginTitle: {
    fr: 'Connexion',
    ar: 'تسجيل الدخول',
  },
  signupTitle: {
    fr: 'Créer un compte',
    ar: 'إنشاء حساب',
  },
  password: {
    fr: 'Mot de passe',
    ar: 'كلمة المرور',
  },
  enterEmail: {
    fr: 'Entrez votre email',
    ar: 'أدخل بريدك الإلكتروني',
  },
  enterPassword: {
    fr: 'Entrez votre mot de passe',
    ar: 'أدخل كلمة المرور',
  },
  confirmPasswordLabel: {
    fr: 'Confirmer le mot de passe',
    ar: 'تأكيد كلمة المرور',
  },
  enterPasswordConfirmation: {
    fr: 'Entrez la confirmation du mot de passe',
    ar: 'أدخل تأكيد كلمة المرور',
  },
  signingIn: {
    fr: 'Connexion...',
    ar: 'جاري تسجيل الدخول...',
  },
  creatingAccount: {
    fr: 'Création du compte...',
    ar: 'جاري إنشاء الحساب...',
  },
  alreadyHaveAccount: {
    fr: 'Vous avez déjà un compte ?',
    ar: 'لديك حساب بالفعل؟',
  },
  dontHaveAccount: {
    fr: 'Vous n\'avez pas de compte ?',
    ar: 'ليس لديك حساب؟',
  },
  createAccount: {
    fr: 'Créer un compte',
    ar: 'إنشاء حساب',
  },
  hrPlatformDescription: {
    fr: 'Plateforme de gestion des demandes de ressources humaines',
    ar: 'منصة إدارة طلبات الموارد البشرية',
  },
  approvedLeaveRequest: {
    fr: 'Demande de congé approuvée',
    ar: 'تم الموافقة على طلب الإجازة',
  },
  workCertificateIssued: {
    fr: 'Certificat de travail émis',
    ar: 'تم إصدار شهادة العمل',
  },
  updatePersonalDataReminder: {
    fr: 'Rappel: mettre à jour les données personnelles',
    ar: 'تذكير: تحديث البيانات الشخصية',
  },
  hoursAgo: {
    fr: 'il y a {hours} heures',
    ar: 'منذ {hours} ساعات',
  },
  dayAgo: {
    fr: 'il y a {days} jour(s)',
    ar: 'منذ {days} أيام',
  },
  backToHome: {
    fr: 'Retour à l\'accueil',
    ar: 'العودة للرئيسية',
  },
  pageNotFoundTitle: {
    fr: '404 - Page non trouvée',
    ar: '404 - الصفحة غير موجودة',
  },
  pageNotFoundMessage: {
    fr: 'Désolé, la page que vous recherchez est introuvable',
    ar: 'عذراً، الصفحة التي تبحث عنها غير موجودة',
  },
  profileUpdated: {
    fr: 'Profil mis à jour',
    ar: 'تم تحديث الملف الشخصي',
  },
  profileUpdatedSuccess: {
    fr: 'Vos informations ont été mises à jour avec succès',
    ar: 'تم تحديث معلوماتك بنجاح',
  },
  errorUpdatingProfile: {
    fr: 'Erreur lors de la mise à jour du profil',
    ar: 'خطأ في تحديث الملف الشخصي',
  },
  errorTryAgain: {
    fr: 'Une erreur s\'est produite. Veuillez réessayer.',
    ar: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
  },
  notificationsUpdated: {
    fr: 'Notifications mises à jour',
    ar: 'تم تحديث الإشعارات',
  },
  settingsSavedSuccess: {
    fr: 'Vos paramètres ont été sauvegardés avec succès',
    ar: 'تم حفظ إعداداتك بنجاح',
  },
  passwordChanged: {
    fr: 'Mot de passe modifié',
    ar: 'تم تغيير كلمة المرور',
  },
  passwordChangedSuccess: {
    fr: 'Votre mot de passe a été modifié avec succès',
    ar: 'تم تغيير كلمة المرور بنجاح',
  },
  yourProfile: {
    fr: 'Votre profil',
    ar: 'ملفك الشخصي',
  },
  googleAccountEmail: {
    fr: 'Email du compte Google (non modifiable)',
    ar: 'بريد حساب جوجل (غير قابل للتعديل)',
  },
  googleAccountPassword: {
    fr: 'Vous utilisez un compte Google. Le mot de passe ne peut pas être modifié ici.',
    ar: 'أنت تستخدم حساب جوجل. لا يمكن تغيير كلمة المرور هنا.',
  },
  resetPassword: {
    fr: 'Réinitialiser le mot de passe',
    ar: 'إعادة تعيين كلمة المرور',
  },
  resetPasswordDescription: {
    fr: 'Entrez votre email pour recevoir un lien de réinitialisation',
    ar: 'أدخل بريدك الإلكتروني لتلقي رابط إعادة التعيين',
  },
  sendResetLink: {
    fr: 'Envoyer le lien',
    ar: 'إرسال الرابط',
  },
  backToLogin: {
    fr: 'Retour à la connexion',
    ar: 'العودة لتسجيل الدخول',
  },
  user: {
    fr: 'Utilisateur',
    ar: 'المستخدم',
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
