
import jsPDF from "jspdf";
import { PDFHelper } from "./pdfUtils";

interface WorkCertificateData {
  fullName: string;
  matricule: string;
  grade?: string;
  hireDate?: string;
  function?: string;
  purpose: string;
  additionalInfo?: string;
  signature?: string;
}

export const generateWorkCertificatePDF = async (
  data: WorkCertificateData, 
  certificateType: string = 'work-certificate'
): Promise<string> => {
  console.log("Starting PDF generation for certificate type:", certificateType);
  
  const helper = new PDFHelper();
  
  try {
    // إضافة الشعار
    await helper.addLogo();
    
    // تحديد العنوان حسب نوع الشهادة
    let title = "";
    let content = "";
    
    switch (certificateType) {
      case 'salary-domiciliation':
        title = "ATTESTATION DE DOMICILIATION IRREVOCABLE DE SALAIRE";
        content = `
Je soussigné, Directeur de la Cité des Métiers et des Compétences de Casablanca-Settat, certifie que :

Monsieur/Madame : ${data.fullName}
Matricule : ${data.matricule}
${data.grade ? `Grade : ${data.grade}` : ''}
${data.function ? `Fonction : ${data.function}` : ''}
${data.hireDate ? `Date d'embauche : ${data.hireDate}` : ''}

Est employé(e) de façon permanente dans notre établissement et accepte par la présente la domiciliation irrévocable de son salaire auprès de l'établissement bancaire désigné ci-après pour les besoins suivants :

${data.purpose}

Cette attestation est délivrée pour servir et valoir ce que de droit.

${data.additionalInfo ? `\nInformations complémentaires :\n${data.additionalInfo}` : ''}
        `;
        break;
        
      case 'annual-income':
        title = "ATTESTATION DE REVENUS ANNUELS";
        content = `
Je soussigné, Directeur de la Cité des Métiers et des Compétences de Casablanca-Settat, certifie que :

Monsieur/Madame : ${data.fullName}
Matricule : ${data.matricule}
${data.grade ? `Grade : ${data.grade}` : ''}
${data.function ? `Fonction : ${data.function}` : ''}
${data.hireDate ? `Date d'embauche : ${data.hireDate}` : ''}

Perçoit un revenu annuel dans le cadre de ses fonctions au sein de notre établissement.

Cette attestation est délivrée dans le cadre de :
${data.purpose}

En foi de quoi, la présente attestation lui est délivrée pour servir et valoir ce que de droit.

${data.additionalInfo ? `\nInformations complémentaires :\n${data.additionalInfo}` : ''}
        `;
        break;
        
      default: // work-certificate
        title = "ATTESTATION DE TRAVAIL";
        content = `
Je soussigné, Directeur de la Cité des Métiers et des Compétences de Casablanca-Settat, certifie que :

Monsieur/Madame : ${data.fullName}
Matricule : ${data.matricule}
${data.grade ? `Grade : ${data.grade}` : ''}
${data.function ? `Fonction : ${data.function}` : ''}
${data.hireDate ? `Date d'embauche : ${data.hireDate}` : ''}

Est effectivement employé(e) dans notre établissement en qualité de fonctionnaire.

Cette attestation est établie à sa demande pour :
${data.purpose}

En foi de quoi, la présente attestation lui est délivrée pour servir et valoir ce que de droit.

${data.additionalInfo ? `\nInformations complémentaires :\n${data.additionalInfo}` : ''}
        `;
    }

    // إضافة العنوان
    helper.addText(title, 105, 60, {
      align: 'center',
      fontSize: 16,
      fontStyle: 'bold',
      maxWidth: 180
    });

    // إضافة المحتوى
    const lines = content.trim().split('\n');
    let yPosition = 85;
    
    lines.forEach((line) => {
      if (line.trim()) {
        const fontSize = line.includes(':') ? 12 : 11;
        const fontStyle = line.includes('Je soussigné') || line.includes('certifie que') ? 'bold' : 'normal';
        
        helper.addText(line.trim(), 20, yPosition, {
          fontSize,
          fontStyle,
          maxWidth: 170
        });
        yPosition += fontSize === 12 ? 8 : 6;
      } else {
        yPosition += 4;
      }
    });

    // إضافة التاريخ والمكان
    helper.addText(`Casablanca, le ${new Date().toLocaleDateString('fr-FR')}`, 130, yPosition + 20, {
      fontSize: 12,
      fontStyle: 'bold'
    });

    // إضافة التوقيع إذا كان متوفراً
    if (data.signature) {
      try {
        const img = new Image();
        img.src = data.signature;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        helper.getDoc().addImage(img, "PNG", 130, yPosition + 30, 40, 20);
      } catch (error) {
        console.warn("Could not add signature image:", error);
      }
    }

    // إضافة التذييل
    helper.addFooters();

    console.log("PDF generation completed successfully");
    return helper.getBase64();
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
