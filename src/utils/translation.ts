
export const translateToArabic = (frenchText: string): string => {
  if (!frenchText || frenchText.trim() === "") return "";
  
  const translations: Record<string, string> = {
    "Administratif": "إدارية",
    "Mariage": "زواج", 
    "Naissance": "ازدياد",
    "Exceptionnel": "استثنائية",
    "jour": "يوم",
    "jours": "أيام",
    "semaine": "أسبوع",
    "semaines": "أسابيع",
    "mois": "شهر",
    "avec": "مع",
    "sans": "بدون",
    "famille": "عائلة",
    "époux": "زوج",
    "épouse": "زوجة",
    "enfant": "طفل",
    "enfants": "أطفال",
    "parent": "والد",
    "parents": "والدين",
    "Directeur": "مدير",
    "Chef": "رئيس",
    "Responsable": "مسؤول",
    "Adjoint": "مساعد",
    "Secrétaire": "كاتب",
    "Comptable": "محاسب",
    "Informaticien": "مختص في المعلوميات",
    "Technicien": "تقني",
    "Ingénieur": "مهندس",
    "Direction": "مديرية",
    "Service": "مصلحة",
    "Bureau": "مكتب",
    "Département": "قسم",
    "urgence": "طارئ",
    "maladie": "مرض",
    "personnel": "شخصي",
    "voyage": "سفر",
    "formation": "تكوين",
    "repos": "راحة",
  };

  let arabicText = frenchText;
  Object.entries(translations).forEach(([french, arabic]) => {
    const regex = new RegExp(`\\b${french}\\b`, 'gi');
    arabicText = arabicText.replace(regex, arabic);
  });

  return arabicText !== frenchText ? arabicText : frenchText;
};

// تحسين دالة تنسيق النص العربي للـ PDF
export const formatArabicForPDF = (text: string): string => {
  if (!text || text.trim() === "") return "";
  
  try {
    // ترجمة النص أولاً
    const arabicText = translateToArabic(text);
    
    // استخدام المكتبات المثبتة بالفعل
    const reshaper = require("arabic-persian-reshaper");
    const bidi = require("bidi-js");
    
    // تشكيل النص العربي وتطبيق BIDI
    const shaped = reshaper.reshape(arabicText);
    const bidirectional = bidi.from_string(shaped);
    
    return bidirectional.toString();
  } catch (error) {
    console.warn("Error formatting Arabic text for PDF:", error);
    // في حالة الخطأ، إرجاع النص المترجم فقط
    return translateToArabic(text);
  }
};

// دالة مساعدة لتحديد اتجاه النص
export const isArabicText = (text: string): boolean => {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F]/;
  return arabicPattern.test(text);
};

// دالة لتحسين عرض النص في PDF
export const optimizeTextForPDF = (text: string): string => {
  if (!text) return "";
  
  // إذا كان النص يحتوي على عربي، استخدم التنسيق المحسن
  if (isArabicText(text)) {
    return formatArabicForPDF(text);
  }
  
  // إذا كان النص لاتيني، أرجعه كما هو
  return text;
};
