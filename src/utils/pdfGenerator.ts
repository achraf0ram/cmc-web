import jsPDF from "jspdf";
import { format } from "date-fns";
import { FormData } from "@/types/vacationRequest";
import { AmiriFont } from "../fonts/AmiriFont";
import { AmiriBoldFont } from "../fonts/AmiriBoldFont";
import { formatArabicForPDF, translateToArabic } from "./translation";

export const generatePDF = async (data: FormData, signaturePreview: string | null): Promise<void> => {
  return new Promise<void>((resolve) => {
    try {
      const doc = new jsPDF();
      const logoPath = "/lovable-uploads/d44e75ac-eac5-4ed3-bf43-21a71c6a089d.png";
      
      // إعداد الخط العربي
      doc.addFileToVFS("Amiri-Regular.ttf", AmiriFont as unknown as string);
      doc.addFileToVFS("Amiri-Bold.ttf", AmiriBoldFont as unknown as string);
      doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
      doc.addFont("Amiri-Bold.ttf", "Amiri", "bold");
      
      console.log("jsPDF document created. Attempting to add logo.");

      // إضافة الشعار إن وجد
      if (logoPath) {
        console.log("Logo path found:", logoPath);
        const img = new Image();
        img.src = logoPath;
        img.onload = () => {
          console.log("Logo image loaded successfully.");
          doc.addImage(img, "PNG", 10, 4, 66, 20);
          addContent(doc, data, signaturePreview, resolve);
        };
        img.onerror = (err) => {
          console.error("Error loading logo image:", err);
          addContent(doc, data, signaturePreview, resolve);
        };
      } else {
        console.log("No logo path specified. Adding content directly.");
        addContent(doc, data, signaturePreview, resolve);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  });
};

// Helper function to add content after logo loading
const addContent = (doc: jsPDF, data: FormData, signaturePreview: string | null, resolve: () => void) => {
  console.log("Adding PDF content.");
  
  // رأس الصفحة
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  
  // Position Réf and Date text
  let headerTextY = 35;
  
  // Réf text - Bold label and normal value
  doc.setFont("helvetica", "bold");
  doc.text("Réf :", 20, headerTextY);
  const refLabelWidth = doc.getTextWidth("Réf :");
  doc.setFont("helvetica", "normal");
  doc.text(`OFP/DR……/CMC…../N° /2025`, 20 + refLabelWidth, headerTextY);
  
  headerTextY += 7; // Move down for Date line
  
  // Date text - Bold label and normal value
  doc.setFont("helvetica", "bold");
  doc.text("Date :", 20, headerTextY);
  const dateLabelWidth = doc.getTextWidth("Date :");
  doc.setFont("helvetica", "normal");
  doc.text(`${format(new Date(), "dd/MM/yyyy")}`, 20 + dateLabelWidth, headerTextY);
  
  // العنوان الرئيسي مع خط تحته
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  const frenchTitle = "Demande de congé";
  doc.text(frenchTitle, 105, 56, { align: "center" });
  
  // إضافة خط تحت العنوان الفرنسي
  const frenchTitleWidth = doc.getTextWidth(frenchTitle);
  const frenchTitleStartX = 105 - (frenchTitleWidth / 2);
  doc.line(frenchTitleStartX, 58, frenchTitleStartX + frenchTitleWidth, 58);
  
  doc.setFont("Amiri", "bold");
  const arabicTitle = "(1) طلب إجازة";
  doc.text(arabicTitle, 105, 63, { align: "center" });
  
  // إضافة خط تحت العنوان العربي
  const arabicTitleWidth = doc.getTextWidth(arabicTitle);
  const arabicTitleStartX = 105 - (arabicTitleWidth / 2);
  doc.line(arabicTitleStartX, 65, arabicTitleStartX + arabicTitleWidth, 65);
  
  let currentY = 80;
  const lineHeight = 8;
  
  // معلومات شخصية
  doc.setFontSize(11);
  
  // الاسم الكامل
  doc.setFont("helvetica", "normal");
  doc.text(`Nom & Prénom : ${data.fullName || '…………………………………'}`, 20, currentY);
  doc.setFont("Amiri", "normal");
  doc.text(formatArabicForPDF(`${data.fullName || '…………………………………'} : الاسم الكامل`), 190, currentY, { align: "right" });
  currentY += lineHeight;
  
  // الرقم المالي
  doc.setFont("helvetica", "normal");
  doc.text(`Matricule : ${data.matricule || '…………………………………'}`, 20, currentY);
  doc.setFont("Amiri", "normal");
  doc.text(formatArabicForPDF(`${data.matricule || '…………………………………'} : الرقم المالي`), 190, currentY, { align: "right" });
  currentY += lineHeight;
  
  // السلم والرتبة في نفس السطر
  doc.setFont("helvetica", "normal");
  doc.text(`Echelle : ${data.echelle || '………………'}`, 20, currentY);
  doc.text(`Echelon : ${data.echelon || '………………'}`, 100, currentY, { align: "right" });
  doc.setFont("Amiri", "normal");
  doc.text(formatArabicForPDF(`${data.echelle || '………………'} : السلم`), 190, currentY, { align: "right" });
  doc.text(formatArabicForPDF(`${data.echelon || '………………'} : الرتبة`), 130, currentY);
  currentY += lineHeight;
  
  // الدرجة
  doc.setFont("helvetica", "normal");
  doc.text(`Grade : ${data.grade || '…………………………………'}`, 20, currentY);
  doc.setFont("Amiri", "normal");
  doc.text(formatArabicForPDF(`${data.grade || '…………………………………'} : الدرجة`), 190, currentY, { align: "right" });
  currentY += lineHeight;
  
  // الوظيفة
  const functionText = data.fonction || '…………………………………';
  const arabicFunctionText = data.arabicFonction || '…………………………………';
  doc.setFont("helvetica", "normal");
  doc.text(`Fonction : ${functionText}`, 20, currentY);
  doc.setFont("Amiri", "normal");
  doc.text(formatArabicForPDF(`${arabicFunctionText} : الوظيفة`), 190, currentY, { align: "right" });
  currentY += lineHeight + 5;
  
  // قسم التعيين مع خط تحته
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  const affectationText = "Affectation";
  doc.text(affectationText, 105, currentY, { align: "center" });
  
  // إضافة خط تحت "Affectation"
  const affectationWidth = doc.getTextWidth(affectationText);
  const affectationStartX = 105 - (affectationWidth / 2);
  doc.line(affectationStartX, currentY + 2, affectationStartX + affectationWidth, currentY + 2);
  
  doc.setFont("Amiri", "bold");
  const arabicAffectation = "التعيين";
  doc.text(arabicAffectation, 105, currentY + 5, { align: "center" });
  
  // إضافة خط تحت "التعيين"
  const arabicAffectationWidth = doc.getTextWidth(arabicAffectation);
  const arabicAffectationStartX = 105 - (arabicAffectationWidth / 2);
  doc.line(arabicAffectationStartX, currentY + 7, arabicAffectationStartX + arabicAffectationWidth, currentY + 7);
  
  currentY += 15;
  
  doc.setFontSize(11);
  
  // المديرية
  const directionText = data.direction || '………………';
  const arabicDirectionText = data.arabicDirection || '………………';
  doc.setFont("helvetica", "normal");
  doc.text(`Direction : ${directionText}`, 20, currentY);

  doc.setFont("Amiri", "normal");
  const dirText = data.arabicDirection 
      ? `${arabicDirectionText} :المديرية` 
      : `${arabicDirectionText} :المديرية`;
  doc.text(dirText, 190, currentY, { align: "right" });

  currentY += lineHeight;

  // العنوان
  const addressText = data.address || '………………';
  const arabicAddressText = data.arabicAddress || '………………';
  doc.setFont("helvetica", "normal");
  doc.text(`Adresse : ${addressText}`, 20, currentY);

  doc.setFont("Amiri", "normal");
  const addrText = data.arabicAddress 
      ? `${arabicAddressText} :العنوان` 
      : `${arabicAddressText} :العنوان`;
  doc.text(addrText, 190, currentY, { align: "right" });

  currentY += lineHeight;
  // الهاتف
  doc.setFont("helvetica", "normal");
  doc.text(`Téléphone : ${data.phone || '…………………………………'}`, 20, currentY);
  doc.setFont("Amiri", "normal");
  doc.text(formatArabicForPDF(`${data.phone || '…………………………………'} : الهاتف`), 190, currentY, { align: "right" });
  currentY += lineHeight;
  
  // نوع الإجازة
  const leaveTypeToDisplay = data.leaveType === "Autre" ? data.customLeaveType : data.leaveType;
  const arabicLeaveTypeToDisplay = data.leaveType === "Autre" ? data.arabicCustomLeaveType : translateToArabic(data.leaveType);

  // النص الفرنسي
  doc.setFont("helvetica", "normal");
  doc.text(`Nature de congé (2) : ${leaveTypeToDisplay || '…………………………………'}`, 20, currentY);

  // النص العربي المعدل
  doc.setFont("Amiri", "normal");
  const arabicText = `نوع الإجازة )2(: ${arabicLeaveTypeToDisplay || '…………………………………'}`;
  doc.text(formatArabicForPDF(arabicText), 190, currentY, { 
    align: "right",
  });

  currentY += lineHeight;
  // المدة
  const durationText = data.duration || '…………………………………';
  const arabicDurationText = data.arabicDuration || translateToArabic(data.duration) || '…………………………………';
  doc.setFont("helvetica", "normal");
  doc.text(`Durée : ${durationText}`, 20, currentY);
  doc.setFont("Amiri", "normal");
  
  // النص العربي مع النقط أو القيمة المطلوبة
  const formattedArabicDuration = `المدة : ${arabicDurationText}`;
  doc.text(formattedArabicDuration, 190, currentY, { align: "right" });
  currentY += lineHeight;
  
  // التواريخ في نفس السطر
  if (data.startDate && data.endDate) {
    doc.setFont("helvetica", "normal");
    doc.text(`Du : ${format(data.startDate, "dd/MM/yyyy")}`, 20, currentY);
    doc.text(`Au : ${format(data.endDate, "dd/MM/yyyy")}`, 100, currentY, { align: "right" });
    
    doc.setFont("Amiri", "normal");
    doc.text(formatArabicForPDF(`${format(data.endDate, "dd/MM/yyyy")} : إلى`), 110, currentY);
    doc.text(formatArabicForPDF(`${format(data.startDate, "dd/MM/yyyy")} : ابتداء من`), 190, currentY, { align: "right" });
    currentY += lineHeight;
  }
  
  // مع (3)
  if (data.with || data.arabicWith) {
    const withText = data.with || '…………………………………';
    const arabicWithText = data.arabicWith || '…………………………………';
    doc.setFont("helvetica", "normal");
    doc.text(`Avec (3) : ${withText}`, 20, currentY);
    doc.setFont("Amiri", "normal");
    const formattedArabicWith = `مع )3( : ${arabicWithText}`; // النص العربي مع النقط
    doc.text(formattedArabicWith, 190, currentY, { align: "right" });
    currentY += lineHeight;
  }
  // النيابة
  if (data.interim || data.arabicInterim) {
    const interimText = data.interim || '…………………………………';
    const arabicInterimText = data.arabicInterim || '…………………………………';
    
    // النص الفرنسي
    doc.setFont("helvetica", "normal");
    doc.text(`Intérim (Nom et Fonction) : ${interimText}`, 20, currentY);
    
    // النص العربي المعدل
    doc.setFont("Amiri", "normal");
    const formattedArabicInterim = `النيابة )الاسم والوظيفة(: ${arabicInterimText}`;
    doc.text(formattedArabicInterim, 190, currentY, { 
      align: "right",
    });
    
    currentY += lineHeight;
  }
  // مغادرة التراب الوطني
  if (data.leaveMorocco) {
    doc.setFont("helvetica", "normal");
    doc.text("Quitter le territoire Marocain : Oui", 20, currentY);
    doc.setFont("Amiri", "normal");
    doc.text(formatArabicForPDF(`مغادرة التراب الوطني : نعم` ), 190, currentY, { align: "right" });
    currentY += lineHeight;
  }
  
  // التوقيعات مع خطوط تحتها
  const signatureY = 215;
  
  // توقيع المعني بالأمر
  doc.setFont("helvetica", "normal");
  const signatureText = "Signature de l'intéressé";
  doc.text(signatureText, 30, signatureY);
  // خط تحت النص الفرنسي
  const signatureWidth = doc.getTextWidth(signatureText);
  doc.line(30, signatureY + 2, 30 + signatureWidth, signatureY + 2);
  
  doc.setFont("Amiri", "normal");
  const arabicSignature = "إمضاء المعني)ة( بالأمر";
  doc.text(arabicSignature, 30, signatureY + 5);
  // خط تحت النص العربي
  const arabicSignatureWidth = doc.getTextWidth(arabicSignature);
  doc.line(30, signatureY + 7, 30 + arabicSignatureWidth, signatureY + 7);

  // رأي الرئيس المباشر
  doc.setFont("helvetica", "normal");
  const chefText = "Avis du Chef Immédiat";
  doc.text(chefText, 85, signatureY);
  // خط تحت النص الفرنسي
  const chefWidth = doc.getTextWidth(chefText);
  doc.line(85, signatureY + 2, 85 + chefWidth, signatureY + 2);
  
  doc.setFont("Amiri", "normal");
  const arabicChef = "رأي الرئيس المباشر";
  doc.text(arabicChef, 85, signatureY + 5);
  // خط تحت النص العربي
  const arabicChefWidth = doc.getTextWidth(arabicChef);
  doc.line(85, signatureY + 7, 85 + arabicChefWidth, signatureY + 7);

  // رأي المدير
  doc.setFont("helvetica", "normal");
  const directorText = "Avis du Directeur";
  doc.text(directorText, 150, signatureY);
  // خط تحت النص الفرنسي
  const directorWidth = doc.getTextWidth(directorText);
  doc.line(150, signatureY + 2, 150 + directorWidth, signatureY + 2);
  
  doc.setFont("Amiri", "normal");
  const arabicDirector = "رأي المدير";
  doc.text(arabicDirector, 150, signatureY + 5);
  // خط تحت النص العربي
  const arabicDirectorWidth = doc.getTextWidth(arabicDirector);
  doc.line(150, signatureY + 7, 150 + arabicDirectorWidth, signatureY + 7);

  console.log("Signature preview value before adding image:", signaturePreview ? "Has data" : "No data", signaturePreview ? `Data URL starts with: ${signaturePreview.substring(0, 30)}` : "");

  if (signaturePreview) {
    const imgType = signaturePreview.startsWith("data:image/png") ? "PNG" : "JPEG";
    try {
      doc.addImage(signaturePreview, imgType, 30, signatureY + 15, 40, 20);
    } catch (error) {
      console.error("Error adding signature image:", error);
    }
  }

  doc.line(25, signatureY + 38, 70, signatureY + 38);
  doc.line(80, signatureY + 38, 125, signatureY + 38);
  doc.line(145, signatureY + 38, 190, signatureY + 38);

  let notesY = 250;
  doc.setFontSize(9);
  doc.setFont("Helvetica", "bold");
  
  // "هام جدا" و "Très important" مع خطوط تحتها
  const importantTextFr = "Très important :";
  doc.text(importantTextFr, 20, notesY);
  // خط تحت النص الفرنسي
  const importantFrWidth = doc.getTextWidth(importantTextFr);
  doc.line(20, notesY + 2, 20 + importantFrWidth, notesY + 2);
  
  doc.setFont("Amiri", "bold");
  const importantTextAr = "هام جدا :";
  doc.text(importantTextAr, 190, notesY, { align: "right" });
  // خط تحت النص العربي
  const importantArWidth = doc.getTextWidth(importantTextAr);
  doc.line(190 - importantArWidth, notesY + 2, 190, notesY + 2);

  notesY += 5;
  doc.setFontSize(8);
  doc.setFont("Helvetica", "normal");

  const notes = [
    "Aucun agent n'est autorisé à quitter le lieu de son travail avant d'avoir",
    "obtenu sa décision de congé le cas échéant il sera considéré en",
    "abandon de poste.",
    "(1) La demande doit être déposée 8 jours avant la date demandée",
    "(2) Nature de congé : Administratif - Mariage - Naissance - Exceptionnel",
    '(3) Si l\'intéressé projette de quitter le territoire Marocain il faut qu\'il',
    'le mentionne "Quitter le territoire Marocain"',
  ];

  const notesAr = [
    "لا يسمح لأي مستخدم بمغادرة العمل إلا بعد توصله بمقرر الإجازة و إلا اعتبر في",
    "وضعية تخلي عن العمل.",
    "(1) يجب تقديم الطلب قبل 8 أيام من التاريخ المطلوب",
    "(2) نوع الإجازة : إدارية - زواج - ازدياد - استثنائية",
    '(3) إذا كان المعني بالأمر يرغب في مغادرة التراب الوطني فعليه أن يحدد ذلك بإضافة',
    '"مغادرة التراب الوطني"',
  ];

  let notesStartXFr = 20;
  let notesStartXAr = 190;
  let currentNotesY = notesY;

  notes.forEach((line, i) => {
    doc.text(line, notesStartXFr, currentNotesY);
    if (i < notesAr.length) {
      doc.text(notesAr[i], notesStartXAr, currentNotesY, { align: "right" });
    }
    currentNotesY += 5;
  });

  // حفظ الملف
  if (data.fullName) {
    doc.save(`demande_conge_${data.fullName}.pdf`);
  } else {
    doc.save(`demande_conge.pdf`);
  }
  console.log("PDF saved.");
  resolve();
};
