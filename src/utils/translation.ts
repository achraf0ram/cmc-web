// This file contains translation utilities and common translations

export const translations = {
  ar: {
    home: 'الرئيسية',
    workCertificate: 'شهادة عمل',
    missionOrder: 'أمر مهمة',
    vacationRequest: 'طلب إجازة',
    adminDashboard: 'لوحة تحكم الأدمن',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    dashboard: 'لوحة التحكم',
    loading: 'جاري التحميل...',
    dataLoadError: 'خطأ في تحميل البيانات',
    pendingRequests: 'الطلبات المعلقة',
    approvedRequests: 'الطلبات الموافق عليها',
    vacationDays: 'أيام الإجازة',
    awaitingApproval: 'في انتظار الموافقة',
    thisMonth: 'هذا الشهر',
    remaining: 'المتبقية',
    quickActions: 'الإجراءات السريعة',
    newVacationRequest: 'طلب إجازة جديد',
    newVacationRequestDesc: 'تقديم طلب إجازة سنوية أو مرضية',
    workCertificateDesc: 'طلب شهادة عمل للمعاملات الرسمية',
    missionOrderDesc: 'طلب أمر مهمة للسفر والعمل خارج المكتب'
  },
  fr: {
    home: 'Accueil',
    workCertificate: 'Certificat de travail',
    missionOrder: 'Ordre de mission',
    vacationRequest: 'Demande de congé',
    adminDashboard: 'Tableau de bord Admin',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    dashboard: 'Tableau de bord',
    loading: 'Chargement...',
    dataLoadError: 'Erreur de chargement des données',
    pendingRequests: 'Demandes en attente',
    approvedRequests: 'Demandes approuvées',
    vacationDays: 'Jours de congé',
    awaitingApproval: 'En attente d\'approbation',
    thisMonth: 'Ce mois-ci',
    remaining: 'Restants',
    quickActions: 'Actions rapides',
    newVacationRequest: 'Nouvelle demande de congé',
    newVacationRequestDesc: 'Soumettre une demande de congé annuel ou maladie',
    workCertificateDesc: 'Demander un certificat de travail pour les démarches officielles',
    missionOrderDesc: 'Demander un ordre de mission pour les déplacements professionnels'
  }
};

export const useTranslation = () => {
  const getTranslation = (key: keyof typeof translations.ar, language: keyof typeof translations) => {
    return translations[language][key] || key;
  };

  return {
    t: getTranslation
  };
};
