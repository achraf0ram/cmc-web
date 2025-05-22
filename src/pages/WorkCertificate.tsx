
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import jsPDF from "jspdf";
import { format } from "date-fns";

const formSchema = z.object({
  fullName: z.string().min(3, {
    message: "يرجى إدخال الاسم الكامل",
  }),
  matricule: z.string().min(1, {
    message: "يرجى إدخال رقم التسجيل",
  }),
  grade: z.string().optional(),
  hireDate: z.string().optional(),
  function: z.string().optional(),
  purpose: z.string().min(5, {
    message: "يرجى وصف الغرض من الشهادة",
  }),
  additionalInfo: z.string().optional(),
});

const WorkCertificate = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const logoPath = "/lovable-uploads/d44e75ac-eac5-4ed3-bf43-21a71c6a089d.png";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      matricule: "",
      grade: "",
      hireDate: "",
      function: "",
      purpose: "",
      additionalInfo: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setIsSubmitted(true);
    generatePDF(values);
  }

  const generatePDF = (data: z.infer<typeof formSchema>) => {
    // Create a new jsPDF instance
    const doc = new jsPDF('p', 'mm', 'a4');
    const currentDate = format(new Date(), "dd/MM/yyyy");
    
    // Add the OFPPT logo at the top
    const imgData = logoPath;
    doc.addImage(imgData, 'PNG', 20, 10, 50, 20);
    
    // Add headers and reference number
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("N/Réf. : OFP/DR CASA SETTAT/DAAL/SRRH /N°", 20, 40);
    doc.text("164 / 2025", 90, 40);
    doc.text(`Casablanca, le ${currentDate}`, 140, 40);
    
    // Add the title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("ATTESTATION DE TRAVAIL", 80, 60);
    
    // Add the main text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Nous soussignés, Directeur Régional Casablanca-Settat de l'Office de la Formation", 20, 70);
    doc.text("Professionnelle et de la Promotion du Travail (OFPPT), attestons que :", 20, 75);
    
    // Add the employee information
    doc.setFontSize(12);
    doc.text("Monsieur/Madame :", 20, 85);
    doc.text(data.fullName, 70, 85);
    
    doc.text("Matricule :", 20, 95);
    doc.text(data.matricule, 70, 95);
    
    doc.text("Grade :", 20, 105);
    doc.text(data.grade || "", 70, 105);
    
    doc.text("Est employé au sein de notre organisme depuis le :", 20, 115);
    doc.text(data.hireDate || "", 120, 115);
    
    doc.text("En qualité de :", 20, 125);
    doc.text(data.function || "", 70, 125);
    
    // Add purpose
    if (data.purpose) {
      doc.text("Motif : " + data.purpose, 20, 135);
    }
    
    // Add the closing text
    doc.text("La présente attestation est délivrée à l'intéressé pour servir et valoir ce que de droit.", 20, 145);
    
    // Add the footer with contact information
    doc.setFontSize(9);
    doc.text("Direction Régionale CASABLANCA -SETTAT", 20, 230);
    doc.text("50, rue Colonel Driss Cheraibi", 20, 234);
    doc.text("Aïn Bordja-Casablanca", 20, 238);
    doc.text("Tel :05 22 60 80 82-Fax :05 22 6039 65", 20, 242);
    
    // Save the PDF
    doc.save(`attestation_travail_${data.fullName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('workCertificateTitle')}</h1>

      {isSubmitted ? (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {t('requestSubmitted')}
                </h2>
                <p className="text-muted-foreground">
                  {t('requestReviewMessage')}
                  {t('followUpMessage')}
                </p>
                <div className="flex flex-col gap-3 mt-4">
                  <Button 
                    onClick={() => setIsSubmitted(false)}
                  >
                    {t('newRequest')}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t('requestInfo')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('fullName')}*</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('fullNamePlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="matricule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('matricule')}*</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('matriculePlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('grade')}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('gradePlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hireDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('hireDate')}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('hireDatePlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="function"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('function')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('functionPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('purposeLabel')}*</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('purposePlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('additionalInfo')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={t('additionalInfoPlaceholder')}
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button type="submit">{t('submit')}</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkCertificate;
