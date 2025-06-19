
import { jsPDF } from "jspdf";

export class VacationPDFHelper {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  async addLogo() {
    // Add OFPPT logo at the top
    this.doc.setFontSize(12);
    this.doc.text("ROYAUME DU MAROC", 20, 20);
    this.doc.text("MINISTÈRE DE L'ÉDUCATION NATIONALE", 20, 25);
    this.doc.text("DE LA FORMATION PROFESSIONNELLE", 20, 30);
    this.doc.text("DE L'ENSEIGNEMENT SUPÉRIEUR ET DE LA RECHERCHE SCIENTIFIQUE", 20, 35);
    
    this.doc.setFontSize(10);
    this.doc.text("OFFICE DE LA FORMATION PROFESSIONNELLE", 20, 45);
    this.doc.text("ET DE LA PROMOTION DU TRAVAIL", 20, 50);
    this.doc.text("DIRECTION RÉGIONALE CASABLANCA-SETTAT", 20, 55);
    
    // Add a line separator
    this.doc.line(20, 65, 190, 65);
  }

  addText(text: string, x: number, y: number, options: any = {}) {
    if (options.fontSize) this.doc.setFontSize(options.fontSize);
    if (options.fontStyle) this.doc.setFont(undefined, options.fontStyle);
    
    if (options.align === "center") {
      this.doc.text(text, x, y, { align: "center" });
    } else {
      this.doc.text(text, x, y);
    }
    
    // Reset to normal font
    this.doc.setFont(undefined, "normal");
    this.doc.setFontSize(12);
  }

  addFooters() {
    const pageHeight = this.doc.internal.pageSize.height;
    
    // Add signature section
    this.doc.text("Le Directeur Régional", 140, pageHeight - 40);
    this.doc.text("Par délégation", 140, pageHeight - 35);
    
    // Add footer address
    this.doc.setFontSize(8);
    this.doc.text("Adresse: Rue Abou Kacem Echabbi, Casablanca", 20, pageHeight - 20);
    this.doc.text("Tél: 0522 54 XX XX - Fax: 0522 54 XX XX", 20, pageHeight - 15);
    this.doc.text("Site web: www.ofppt.ma", 20, pageHeight - 10);
  }

  getBase64(): string {
    return this.doc.output('datauristring').split(',')[1];
  }

  save(filename: string) {
    this.doc.save(filename);
  }
}

// Function to generate vacation PDF and return base64
export const generateVacationPDF = async (values: any): Promise<string> => {
  console.log("Generating vacation PDF with values:", values);
  
  const pdfHelper = new VacationPDFHelper();
  
  // Add logo and header
  await pdfHelper.addLogo();
  
  // Add title
  pdfHelper.addText("طلب إجازة", 105, 90, { fontSize: 18, fontStyle: "bold", align: "center" });
  pdfHelper.addText("DEMANDE DE CONGÉ", 105, 100, { fontSize: 16, align: "center" });
  
  // Add form content
  let yPos = 130;
  
  pdfHelper.addText(`الاسم الكامل / Nom complet: ${values.fullName || ''}`, 20, yPos);
  yPos += 15;
  
  pdfHelper.addText(`الرقم التسجيلي / Matricule: ${values.matricule || ''}`, 20, yPos);
  yPos += 15;
  
  pdfHelper.addText(`الرتبة / Grade: ${values.grade || ''}`, 20, yPos);
  yPos += 15;
  
  pdfHelper.addText(`تاريخ التوظيف / Date d'embauche: ${values.hireDate || ''}`, 20, yPos);
  yPos += 15;
  
  pdfHelper.addText(`الوظيفة / Fonction: ${values.function || ''}`, 20, yPos);
  yPos += 15;
  
  pdfHelper.addText(`نوع الإجازة / Type de congé: ${values.leaveType || ''}`, 20, yPos);
  yPos += 15;
  
  pdfHelper.addText(`تاريخ البداية / Date de début: ${values.startDate || ''}`, 20, yPos);
  yPos += 15;
  
  pdfHelper.addText(`تاريخ النهاية / Date de fin: ${values.endDate || ''}`, 20, yPos);
  yPos += 15;
  
  pdfHelper.addText(`عدد الأيام / Nombre de jours: ${values.numberOfDays || ''}`, 20, yPos);
  yPos += 15;
  
  pdfHelper.addText(`السبب / Motif: ${values.reason || ''}`, 20, yPos);
  yPos += 15;
  
  if (values.additionalInfo) {
    pdfHelper.addText(`معلومات إضافية / Informations supplémentaires:`, 20, yPos);
    yPos += 10;
    pdfHelper.addText(`${values.additionalInfo}`, 20, yPos);
  }
  
  // Add footers
  pdfHelper.addFooters();
  
  console.log("PDF generated successfully");
  return pdfHelper.getBase64();
};
