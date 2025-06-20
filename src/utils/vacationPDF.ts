
import { jsPDF } from "jspdf";
import { format } from "date-fns";

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

export const generateVacationPDF = async (data: any): Promise<string> => {
  const helper = new VacationPDFHelper();
  
  // Add header/logo
  await helper.addLogo();
  
  // Add title
  helper.addText("DEMANDE DE CONGÉ", 105, 80, { fontSize: 16, fontStyle: "bold", align: "center" });
  
  let yPosition = 100;
  
  // Personal information
  helper.addText("INFORMATIONS PERSONNELLES", 20, yPosition, { fontSize: 14, fontStyle: "bold" });
  yPosition += 10;
  
  helper.addText(`Nom et Prénom: ${data.fullName || ""}`, 20, yPosition);
  yPosition += 8;
  
  helper.addText(`Matricule: ${data.matricule || ""}`, 20, yPosition);
  yPosition += 8;
  
  if (data.fonction) {
    helper.addText(`Fonction: ${data.fonction}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (data.direction) {
    helper.addText(`Direction: ${data.direction}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (data.phone) {
    helper.addText(`Téléphone: ${data.phone}`, 20, yPosition);
    yPosition += 8;
  }
  
  yPosition += 10;
  
  // Leave information
  helper.addText("INFORMATIONS DE CONGÉ", 20, yPosition, { fontSize: 14, fontStyle: "bold" });
  yPosition += 10;
  
  helper.addText(`Nature de congé: ${data.leaveType || ""}`, 20, yPosition);
  yPosition += 8;
  
  if (data.customLeaveType) {
    helper.addText(`Type personnalisé: ${data.customLeaveType}`, 20, yPosition);
    yPosition += 8;
  }
  
  helper.addText(`Durée: ${data.duration || ""}`, 20, yPosition);
  yPosition += 8;
  
  if (data.startDate) {
    helper.addText(`Date de début: ${format(new Date(data.startDate), "dd/MM/yyyy")}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (data.endDate) {
    helper.addText(`Date de fin: ${format(new Date(data.endDate), "dd/MM/yyyy")}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (data.with) {
    helper.addText(`Avec: ${data.with}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (data.interim) {
    helper.addText(`Intérim: ${data.interim}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (data.leaveMorocco) {
    helper.addText("Quitter le territoire Marocain: Oui", 20, yPosition);
    yPosition += 8;
  }
  
  // Add date
  helper.addText(`Date de la demande: ${format(new Date(), "dd/MM/yyyy")}`, 20, yPosition + 20);
  
  // Add footers
  helper.addFooters();
  
  return helper.getBase64();
};
