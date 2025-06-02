
import jsPDF from "jspdf";
import { format } from "date-fns";
import { ar, fr } from "date-fns/locale";

// Import the Arabic font data
import { AmiriFont } from "../fonts/AmiriFont";

export const generateVacationPDF = async (data: any): Promise<string> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const currentDate = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

  // رأس المستند
  const logoPath = "/lovable-uploads/d44e75ac-eac5-4ed3-bf43-21a71c6a089d.png";
  
  // Load and add logo
  try {
    const img = new Image();
    img.src = logoPath;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    doc.addImage(img, "PNG", 6, 6, 98, 33);
  } catch (error) {
    console.error("Error loading logo:", error);
  }

  // Add Arabic font
  doc.addFileToVFS("Amiri-Regular.ttf", AmiriFont);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");

  // Set font for Latin text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("N/Réf : OFP/DR Casa Settat/DRHU/", 20, 45);
  doc.text(`Casablanca, le ${currentDate}`, 140, 45);

  // العنوان
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("DEMANDE DE CONGÉ", 105, 65, { align: "center" });

  // تفاصيل الطلب
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  
  let yPosition = 85;
  
  doc.text(`Nom complet: ${data.fullName}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Numéro d'employé: ${data.employeeId}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Téléphone: ${data.phoneNumber}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Poste: ${data.position}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Département: ${data.department}`, 20, yPosition);
  yPosition += 15;
  
  doc.text(`Type de congé: ${data.leaveType}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Date de début: ${format(data.startDate, "yyyy-MM-dd")}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Date de fin: ${format(data.endDate, "yyyy-MM-dd")}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Nombre de jours: ${data.numberOfDays}`, 20, yPosition);
  yPosition += 15;
  
  doc.text("Raison:", 20, yPosition);
  yPosition += 8;
  
  // Handle long text for reason
  const splitReason = doc.splitTextToSize(data.reason, 170);
  doc.text(splitReason, 20, yPosition);
  yPosition += splitReason.length * 5 + 20;

  // Signature section
  doc.text("Signature de l'employé:", 20, yPosition);
  doc.text("Visa de l'administration:", 120, yPosition);
  
  // Footer with Arabic
  doc.setFont('Amiri', 'normal');
  doc.setFontSize(9);
  doc.text("المديرية الجهوية لجهة الدارالبيضاء – سطات", 190, 260, { align: "right" });
  doc.text("50 زنقة الكابورال إدريس اشباكو", 190, 265, { align: "right" });
  doc.text("عين البرجة - الدار البيضاء", 190, 270, { align: "right" });

  // French footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Direction Régionale CASABLANCA-SETTAT", 20, 260);
  doc.text("50, rue Caporal Driss Chbakou", 20, 265);
  doc.text("Ain Bordja-Casablanca", 20, 270);

  // Convert to base64 and return
  const pdfBase64 = doc.output('datauristring').split(',')[1];
  
  // Save the PDF for download
  doc.save(`demande_conge_${data.fullName.replace(/\s+/g, '_')}.pdf`);
  
  return pdfBase64;
};
