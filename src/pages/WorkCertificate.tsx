import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, FileImage } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import jsPDF from "jspdf";
import { format } from "date-fns";

const formSchema = z.object({
  fullName: z.string().min(3, { message: "يرجى إدخال الاسم الكامل" }),
  matricule: z.string().min(1, { message: "يرجى إدخال رقم التسجيل" }),
  grade: z.string().optional(),
  hireDate: z.string().optional(),
  function: z.string().optional(),
  purpose: z.string().min(5, { message: "يرجى وصف الغرض من الشهادة" }),
  additionalInfo: z.string().optional(),
  signature: z.instanceof(File).optional(),
});

const WorkCertificate = () => {
  const { t } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const logoPath = "/lovable-uploads/d44e75ac-eac5-4ed3-bf43-21a71c6a089d.png";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      matricule: "",
      grade: "",
      hireDate: "",
      function: "",
      purpose: "",
      additionalInfo: "",
    },
  });

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("signature", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSignaturePreview(base64);
        setSignatureData(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePDF = (data: z.infer<typeof formSchema>) => {
    const doc = new jsPDF("p", "mm", "a4");
    const currentDate = format(new Date(), "dd/MM/yyyy");

    // Add logo at the top
    try {
      doc.addImage(logoPath, 'PNG', 20, 10, 50, 25);
    } catch (error) {
      console.log("Could not load logo:", error);
    }

    // Header with reference
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("N/Réf. : OFP/DR CASA SETTAT/DAAL/SRRH /N°", 20, 50);
    doc.text(`Casablanca, le ${currentDate}`, 140, 50);

    // Title in French
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("ATTESTATION DE TRAVAIL", 75, 70);
    
    // Arabic title - using Unicode representation
    doc.setFontSize(14);
    const arabicTitle = "شهادة عمل";
    doc.text(arabicTitle, 110, 75, { align: "center" });

    // Content in French
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Nous soussignés, Directeur Régional Casablanca-Settat de l'Office de la", 20, 85);
    doc.text("Formation Professionnelle et de la Promotion du Travail (OFPPT), attestons", 20, 90);
    doc.text("que :", 20, 95);

    // Arabic translation - using reverse text for better display
    const arabicText1 = "نحن الموقعون أسفله، المدير الجهوي للدار البيضاء-سطات لمكتب";
    const arabicText2 = "التكوين المهني وإنعاش الشغل، نشهد أن:";
    doc.text(arabicText1, 180, 100, { align: "right" });
    doc.text(arabicText2, 180, 105, { align: "right" });

    // Employee details - French on left, Arabic labels on right
    doc.text(`Monsieur : ${data.fullName}`, 20, 115);
    const arabicName = `السيد : ${data.fullName}`;
    doc.text(arabicName, 180, 120, { align: "right" });
    
    doc.text(`Matricule : ${data.matricule}`, 20, 130);
    const arabicMatricule = `الرقم التسجيلي : ${data.matricule}`;
    doc.text(arabicMatricule, 180, 135, { align: "right" });
    
    if (data.grade) {
      doc.text(`Grade : ${data.grade}`, 20, 145);
      const arabicGrade = `الدرجة : ${data.grade}`;
      doc.text(arabicGrade, 180, 150, { align: "right" });
    }
    
    if (data.hireDate) {
      doc.text(`Est employé au sein de notre organisme depuis le : ${data.hireDate}`, 20, 160);
      const arabicHireDate = `يعمل لدى مؤسستنا منذ : ${data.hireDate}`;
      doc.text(arabicHireDate, 180, 165, { align: "right" });
    }
    
    if (data.function) {
      doc.text(`En qualité de : ${data.function}`, 20, 175);
      const arabicFunction = `بصفة : ${data.function}`;
      doc.text(arabicFunction, 180, 180, { align: "right" });
    }

    // Purpose in French and Arabic
    doc.text("La présente attestation est délivrée à l'intéressé pour servir et valoir ce que de droit.", 20, 195);
    const arabicPurpose = "هذه الشهادة تسلم للمعني بالأمر لتخدمه فيما يهمه الأمر.";
    doc.text(arabicPurpose, 180, 200, { align: "right" });

    // Signature section
    if (signatureData?.startsWith("data:image")) {
      const format = signatureData.includes("image/jpeg") ? "JPEG" : "PNG";
      doc.text("Signature / التوقيع :", 20, 215);
      doc.addImage(signatureData, format, 40, 210, 50, 20);
    }

    // Footer - French on left, Arabic on right
    doc.setFontSize(9);
    doc.text("Direction Régionale CASABLANCA –SETTAT", 20, 250);
    doc.text("50, rue Caporal Driss Chbakou", 20, 254);
    doc.text("Ain Bordja-Casablanca", 20, 258);
    doc.text("Tél :05 22 60 00 82 - Fax :05 22 6039 65", 20, 262);

    const arabicFooter1 = "المديرية الجهوية لجهة الدارالبيضاء – سطات";
    const arabicFooter2 = "50 زنقة الكابورال إدريس اشباكو";
    const arabicFooter3 = "عين البرجة - الدار البيضاء";
    const arabicFooter4 = "الهاتف : 05 22 60 00 82 - الفاكس : 05 22 6039 65";
    
    doc.text(arabicFooter1, 190, 250, { align: "right" });
    doc.text(arabicFooter2, 190, 254, { align: "right" });
    doc.text(arabicFooter3, 190, 258, { align: "right" });
    doc.text(arabicFooter4, 190, 262, { align: "right" });

    doc.save("attestation_de_travail.pdf");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("workCertificateTitle")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("requestInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(() => setIsSubmitted(true))} className="space-y-6">
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet (Monsieur)</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="matricule" render={({ field }) => (
                <FormItem>
                  <FormLabel>Matricule (الرقم التسجيلي)</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="grade" render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade (الرتبة)</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="hireDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date d'embauche (Est employé...)</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="function" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fonction (En qualité de)</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="purpose" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("purposeLabel")}</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="additionalInfo" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("additionalInfo")}</FormLabel>
                  <FormControl><Textarea {...field} className="resize-none" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="signature" render={({ field: { value, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>{t("signatureUpload")}</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <Input type="file" accept="image/*" onChange={handleSignatureChange} className="hidden" id="signature-upload" {...fieldProps} />
                        <Button type="button" variant="outline" onClick={() => document.getElementById("signature-upload")?.click()} className="w-full">
                          <FileImage className="mr-2 h-4 w-4" />
                          {t("signatureUploadButton")}
                        </Button>
                      </div>
                      {signaturePreview && (
                        <div className="border rounded-md p-2">
                          <img src={signaturePreview} alt={t("signatureUpload")} className="max-h-32 mx-auto" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex justify-between gap-3">
                <Button type="submit">{t("submit")}</Button>
                <Button type="button" variant="outline" onClick={() => generatePDF(form.getValues())}>
                  تحميل PDF
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkCertificate;
