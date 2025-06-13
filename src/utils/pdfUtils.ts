
import jsPDF from "jspdf";
import { AmiriFont } from "../fonts/AmiriFont";
import { optimizeTextForPDF, isArabicText } from "./translation";

export class PDFHelper {
  private doc: jsPDF;
  private logoPath = "/lovable-uploads/d44e75ac-eac5-4ed3-bf43-21a71c6a089d.png";

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.setupFonts();
  }

  private setupFonts() {
    // إضافة الخط العربي
    console.log("Setting up Arabic font for PDF...");
    this.doc.addFileToVFS("Amiri-Regular.ttf", AmiriFont);
    this.doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    console.log("Arabic font setup complete.");
  }

  async addLogo(): Promise<void> {
    try {
      const img = new Image();
      img.src = this.logoPath;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      // إضافة الشعار في موضع ثابت
      this.doc.addImage(img, "PNG", 6, 6, 98, 33);
      console.log("Logo added successfully");
    } catch (error) {
      console.error("Error loading logo:", error);
    }
  }

  setFont(language: 'ar' | 'fr' | 'auto' = 'auto', style: 'normal' | 'bold' = 'normal') {
    if (language === 'ar') {
      this.doc.setFont('Amiri', style);
    } else if (language === 'fr') {
      this.doc.setFont('helvetica', style);
    }
    // للـ auto، سيتم تحديد الخط حسب النص في addText
  }

  addText(text: string, x: number, y: number, options: {
    align?: 'left' | 'center' | 'right';
    fontSize?: number;
    fontStyle?: 'normal' | 'bold';
    maxWidth?: number;
  } = {}) {
    const {
      align = 'left',
      fontSize = 12,
      fontStyle = 'normal',
      maxWidth
    } = options;

    // تحسين النص للـ PDF
    const optimizedText = optimizeTextForPDF(text);
    
    // تحديد الخط حسب نوع النص
    if (isArabicText(text)) {
      this.doc.setFont('Amiri', fontStyle);
    } else {
      this.doc.setFont('helvetica', fontStyle);
    }

    this.doc.setFontSize(fontSize);

    if (maxWidth) {
      // تقسيم النص إذا كان طويلاً
      const lines = this.doc.splitTextToSize(optimizedText, maxWidth);
      this.doc.text(lines, x, y, { align });
    } else {
      this.doc.text(optimizedText, x, y, { align });
    }
  }

  addArabicFooter() {
    // إضافة التذييل العربي
    this.setFont('ar', 'normal');
    this.doc.setFontSize(9);
    
    const footerTexts = [
      "المديرية الجهوية لجهة الدارالبيضاء – سطات",
      "زنقة الكابورال إدريس اشباكو,50",
      "عين البرجة - الدار البيضاء",
      "الهاتف : 82 00 60 22 05 - الفاكس : 65 6039 22 05"
    ];

    footerTexts.forEach((text, index) => {
      this.addText(text, 190, 230 + (index * 4), { align: 'right', fontSize: 9 });
    });
  }

  addFrenchFooter() {
    // إضافة التذييل الفرنسي
    this.setFont('fr', 'normal');
    this.doc.setFontSize(9);
    
    const footerTexts = [
      "Direction Régionale CASABLANCA –SETTAT",
      "50, rue Caporal Driss Chbakou",
      "Ain Bordja-Casablanca",
      "Tél :05 22 60 00 82 - Fax :05 22 6039 65"
    ];

    footerTexts.forEach((text, index) => {
      this.doc.text(text, 20, 230 + (index * 4));
    });
  }

  addFooters() {
    this.addFrenchFooter();
    this.addArabicFooter();
  }

  getDoc(): jsPDF {
    return this.doc;
  }

  save(filename: string) {
    this.doc.save(filename);
  }

  getBase64(): string {
    return this.doc.output('datauristring').split(',')[1];
  }
}
