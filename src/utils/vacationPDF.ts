
import jsPDF from 'jspdf';
import { format } from "date-fns";

interface VacationData {
  fullName: string;
  employeeId: string;
  phoneNumber: string;
  position: string;
  department: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  reason: string;
}

class VacationPDFHelper {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  async addLogo() {
    // يمكن إضافة الشعار هنا إذا كان متوفراً
    console.log('Adding logo...');
  }

  addText(text: string, x: number, y: number, options?: { align?: string; fontSize?: number; fontStyle?: string; maxWidth?: number }) {
    if (options?.fontSize) {
      this.doc.setFontSize(options.fontSize);
    }
    if (options?.fontStyle === 'bold') {
      this.doc.setFont(undefined, 'bold');
    } else {
      this.doc.setFont(undefined, 'normal');
    }

    if (options?.maxWidth) {
      const lines = this.doc.splitTextToSize(text, options.maxWidth);
      this.doc.text(lines, x, y);
    } else {
      this.doc.text(text, x, y);
    }
  }

  addFooters() {
    const pageHeight = this.doc.internal.pageSize.height;
    this.doc.setFontSize(10);
    this.doc.text('توقيع الموظف: _______________', 20, pageHeight - 30);
    this.doc.text('توقيع المدير: _______________', 120, pageHeight - 30);
    this.doc.text(`تاريخ الطباعة: ${format(new Date(), "yyyy-MM-dd")}`, 20, pageHeight - 15);
  }

  getBase64(): string {
    return this.doc.output('datauristring');
  }
}

export const generateVacationPDF = async (data: VacationData): Promise<string> => {
  const pdfHelper = new VacationPDFHelper();
  
  // إضافة الشعار
  await pdfHelper.addLogo();
  
  // إضافة العنوان
  pdfHelper.addText("طلب إجازة", 105, 80, { 
    align: "center", 
    fontSize: 18, 
    fontStyle: "bold" 
  });
  
  let yPosition = 100;
  
  // إضافة البيانات الشخصية
  pdfHelper.addText("البيانات الشخصية:", 20, yPosition, { fontSize: 14, fontStyle: "bold" });
  yPosition += 10;
  
  pdfHelper.addText(`الاسم الكامل: ${data.fullName}`, 25, yPosition);
  yPosition += 8;
  pdfHelper.addText(`رقم الموظف: ${data.employeeId}`, 25, yPosition);
  yPosition += 8;
  pdfHelper.addText(`رقم الهاتف: ${data.phoneNumber}`, 25, yPosition);
  yPosition += 8;
  pdfHelper.addText(`المنصب: ${data.position}`, 25, yPosition);
  yPosition += 8;
  pdfHelper.addText(`القسم: ${data.department}`, 25, yPosition);
  yPosition += 15;
  
  // إضافة بيانات الإجازة
  pdfHelper.addText("بيانات الإجازة:", 20, yPosition, { fontSize: 14, fontStyle: "bold" });
  yPosition += 10;
  
  pdfHelper.addText(`نوع الإجازة: ${data.leaveType}`, 25, yPosition);
  yPosition += 8;
  pdfHelper.addText(`تاريخ البداية: ${format(data.startDate, "yyyy-MM-dd")}`, 25, yPosition);
  yPosition += 8;
  pdfHelper.addText(`تاريخ النهاية: ${format(data.endDate, "yyyy-MM-dd")}`, 25, yPosition);
  yPosition += 8;
  pdfHelper.addText(`عدد الأيام: ${data.numberOfDays}`, 25, yPosition);
  yPosition += 15;
  
  // إضافة السبب
  pdfHelper.addText("سبب الإجازة:", 20, yPosition, { fontSize: 14, fontStyle: "bold" });
  yPosition += 10;
  pdfHelper.addText(data.reason, 25, yPosition, { maxWidth: 150 });
  
  // إضافة التذييلات
  pdfHelper.addFooters();
  
  return pdfHelper.getBase64();
};
