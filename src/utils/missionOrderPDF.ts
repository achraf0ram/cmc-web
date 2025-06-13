
import jsPDF from "jspdf";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AmiriFont } from "../fonts/AmiriFont";
import { MissionOrderFormData } from "./missionOrderSchema";

export const generateMissionOrderPDF = async (data: MissionOrderFormData): Promise<string> => {
  console.log("Starting PDF generation for mission order...");
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
    console.log("Logo added to PDF");
  } catch (error) {
    console.error("Error loading logo:", error);
  }

  // Add Amiri font to PDF
  doc.addFileToVFS("Amiri-Regular.ttf", AmiriFont);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");

  // Set font for Latin text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("N/Réf : OFP/DR Casa Settat/          / N° :           …/2025", 20, 50);
  doc.text(`Casablanca, le ${currentDate}`, 140, 50);

  // العنوان
  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(14);
  doc.text("ORDRE DE MISSION", 105, 65, { align: "center" });
  doc.text("OFFICE DE LA FORMATION PROFESSIONNELLE", 105, 72, { align: "center" });
  doc.text("ET DE LA PROMOTION DU TRAVAIL", 105, 79, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("D E S I G N E", 105, 90, { align: "center" });

  // تفاصيل المهمة
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const startY = 95;
  const col1X = 20;
  const col2X = 105;
  const endX = 190;
  const rowHeight = 10;

  // Header row
  doc.rect(col1X, startY, endX - col1X, rowHeight);
  doc.text("Monsieur/Madame :", col1X + 5, startY + rowHeight / 2 + 2);
  doc.text(data.monsieurMadame || "", col1X + 50, startY + rowHeight / 2 + 2);
  doc.text("Matricule :", col2X + 5, startY + rowHeight / 2 + 2);
  doc.text(data.matricule || "", col2X + 30, startY + rowHeight / 2 + 2);

  // Row 1
  doc.rect(col1X, startY + rowHeight, endX - col1X, rowHeight);
  doc.text("De se rendre à           :", col1X + 5, startY + rowHeight * 1.5 + 2);
  doc.text(data.destination, col1X + 50, startY + rowHeight * 1.5 + 2);

  // Row 2
  doc.rect(col1X, startY + rowHeight * 2, endX - col1X, rowHeight);
  doc.text("Pour accomplir la mission suivante :", col1X + 5, startY + rowHeight * 2.5 + 2);
  doc.text(data.purpose, col1X + 80, startY + rowHeight * 2.5 + 2);

  // Row 3
  doc.rect(col1X, startY + rowHeight * 3, endX - col1X, rowHeight);
  doc.text("Conducteur :", col1X + 5, startY + rowHeight * 3.5 + 2);
  doc.text(data.conducteur || "", col1X + 40, startY + rowHeight * 3.5 + 2);
  doc.text("Matricule :", col2X + 5, startY + rowHeight * 3.5 + 2);
  doc.text(data.conducteurMatricule || "", col2X + 30, startY + rowHeight * 3.5 + 2);

  // Row 4
  doc.rect(col1X, startY + rowHeight * 4, endX - col1X, rowHeight);
  doc.text("Date de départ :", col1X + 5, startY + rowHeight * 4.5 + 2);
  doc.text(format(data.startDate, "yyyy-MM-dd"), col1X + 45, startY + rowHeight * 4.5 + 2);
  doc.text("Heure :", col2X + 5, startY + rowHeight * 4.5 + 2);
  doc.text(data.startTime || "", col2X + 25, startY + rowHeight * 4.5 + 2);

  // Row 5
  doc.rect(col1X, startY + rowHeight * 5, endX - col1X, rowHeight);
  doc.text("Date de retour :", col1X + 5, startY + rowHeight * 5.5 + 2);
  doc.text(format(data.endDate, "yyyy-MM-dd"), col1X + 45, startY + rowHeight * 5.5 + 2);
  doc.text("Heure :", col2X + 5, startY + rowHeight * 5.5 + 2);
  doc.text(data.endTime || "", col2X + 25, startY + rowHeight * 5.5 + 2);

  const row6Height = 20;
  doc.rect(col1X, startY + rowHeight * 6, endX - col1X, row6Height);
  doc.text("L'intéressé(e) utilisera :", col1X + 5, startY + rowHeight * 6 + row6Height / 2 + 2);
  doc.text(data.additionalInfo || "", col1X + 60, startY + rowHeight * 6 + row6Height / 2 + 2);

  // Cadre réservé à l'entité de destinations
  const cadreY = startY + rowHeight * 6 + row6Height + 10;
  doc.setFont("helvetica", "bold");
  doc.setFillColor(220, 220, 220);
  doc.rect(col1X, cadreY, endX - col1X, rowHeight, "F");
  doc.text("Cadre réservé à l'entité de destinations", col1X + (endX - col1X) / 2, cadreY + rowHeight / 2 + 2, { align: "center" });

  // Visa section
  const visaY = cadreY + rowHeight;
  const visaSectionHeight = 40;
  doc.setFont("helvetica", "normal");
  doc.rect(col1X, visaY, endX - col1X, visaSectionHeight);
  doc.line(col2X, visaY, col2X, visaY + visaSectionHeight);
  doc.text("Visa d'arrivée", col1X + (col2X - col1X) / 2, visaY + rowHeight / 2 + 2, { align: "center" });
  doc.text("Visa de départ", col2X + (endX - col2X) / 2, visaY + rowHeight / 2 + 2, { align: "center" });
  doc.line(col1X, visaY + rowHeight, endX, visaY + rowHeight);
  doc.text("Date et Heure d'arrivée :", col1X + 5, visaY + rowHeight * 1.5 + 2);
  doc.text("Date et Heure de départ :", col2X + 5, visaY + rowHeight * 1.5 + 2);
  doc.text("Cachet et signature :", col1X + 5, visaY + rowHeight * 2.5 + 2);
  doc.text("Cachet et signature :", col2X + 5, visaY + rowHeight * 2.5 + 2);

  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  const noteY = visaY + visaSectionHeight + 5;
  doc.text("NB : Le visa de départ est obligatoire pour les missions au-delà d'une journée.", 30, noteY);

  // الحصول على base64 للإرسال عبر الإيميل
  const pdfBase64 = doc.output('datauristring').split(',')[1];
  console.log("PDF generated successfully, base64 length:", pdfBase64.length);

  // حفظ الـ PDF للتحميل
  doc.save(`ordre_mission_${data.destination.replace(/\s+/g, '_')}.pdf`);
  console.log("PDF downloaded successfully");

  return pdfBase64;
};
