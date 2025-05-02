
import React, { createContext, useContext, useEffect, useState } from 'react';

// Define available languages
type Language = 'en' | 'ar';

// Define translation key structure
interface Translations {
  [key: string]: {
    en: string;
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
    en: 'Dashboard',
    ar: 'لوحة التحكم',
  },
  welcome: {
    en: 'Welcome',
    ar: 'مرحباً',
  },
  recentRequests: {
    en: 'Recent Requests',
    ar: 'الطلبات الأخيرة',
  },
  upcomingEvents: {
    en: 'Upcoming Events',
    ar: 'الأحداث القادمة',
  },
  pendingApprovals: {
    en: 'Pending Approvals',
    ar: 'موافقات معلقة',
  },
  settings: {
    en: 'Settings',
    ar: 'الإعدادات',
  },
  settingsDescription: {
    en: 'Manage your account settings and preferences',
    ar: 'إدارة إعدادات وتفضيلات حسابك',
  },
  profileSettings: {
    en: 'Profile Settings',
    ar: 'إعدادات الملف الشخصي',
  },
  appearanceSettings: {
    en: 'Appearance Settings',
    ar: 'إعدادات المظهر',
  },
  darkMode: {
    en: 'Dark Mode',
    ar: 'الوضع المظلم',
  },
  lightMode: {
    en: 'Light Mode',
    ar: 'الوضع الفاتح',
  },
  darkModeDescription: {
    en: 'Toggle between light and dark mode',
    ar: 'التبديل بين الوضع الفاتح والوضع المظلم',
  },
  fullName: {
    en: 'Full Name',
    ar: 'الاسم الكامل',
  },
  enterFullName: {
    en: 'Enter your full name',
    ar: 'أدخل اسمك الكامل',
  },
  email: {
    en: 'Email',
    ar: 'البريد الإلكتروني',
  },
  saveChanges: {
    en: 'Save Changes',
    ar: 'حفظ التغييرات',
  },
  saving: {
    en: 'Saving...',
    ar: 'جاري الحفظ...',
  },
  vacationRequest: {
    en: 'Vacation Request',
    ar: 'طلب إجازة',
  },
  workCertificate: {
    en: 'Work Certificate',
    ar: 'شهادة عمل',
  },
  missionOrder: {
    en: 'Mission Order',
    ar: 'أمر مهمة',
  },
  signIn: {
    en: 'Sign In',
    ar: 'تسجيل الدخول',
  },
  signUp: {
    en: 'Sign Up',
    ar: 'إنشاء حساب',
  },
  startDate: {
    en: 'Start Date',
    ar: 'تاريخ البدء',
  },
  endDate: {
    en: 'End Date',
    ar: 'تاريخ الانتهاء',
  },
  reason: {
    en: 'Reason',
    ar: 'السبب',
  },
  submit: {
    en: 'Submit',
    ar: 'إرسال',
  },
  submitting: {
    en: 'Submitting...',
    ar: 'جاري الإرسال...',
  },
  selectDates: {
    en: 'Select dates',
    ar: 'اختر التواريخ',
  },
  pleaseWait: {
    en: 'Please wait...',
    ar: 'برجاء الانتظار...',
  },
  enterReason: {
    en: 'Enter reason for vacation',
    ar: 'أدخل سبب الإجازة',
  },
  success: {
    en: 'Success',
    ar: 'نجاح',
  },
  successfullySubmitted: {
    en: 'Your request has been successfully submitted',
    ar: 'تم تقديم طلبك بنجاح',
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
