
import { VacationPDFHelper } from "./vacationPDF";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

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
