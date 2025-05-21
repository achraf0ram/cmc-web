
import { useState, useRef } from "react";
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
import { CheckCircle, FileImage, Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const formSchema = z.object({
  fullName: z.string().min(3, {
    message: "يرجى إدخال الاسم الكامل",
  }),
  matricule: z.string().min(1, {
    message: "يرجى إدخال الرقم الوظيفي",
  }),
  grade: z.string().min(1, {
    message: "يرجى إدخال الدرجة",
  }),
  hireDate: z.string().min(1, {
    message: "يرجى إدخال تاريخ التعيين",
  }),
  jobTitle: z.string().min(1, {
    message: "يرجى إدخال المسمى الوظيفي",
  }),
  purpose: z.string().min(5, {
    message: "يرجى وصف الغرض من الشهادة",
  }),
  additionalInfo: z.string().optional(),
  signature: z.instanceof(File).optional(),
});

const WorkCertificate = () => {
  const { t, language } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      matricule: "",
      grade: "",
      hireDate: "",
      jobTitle: "",
      purpose: "",
      additionalInfo: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setIsSubmitted(true);
    // PDF generation will be triggered from the success card
  }

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("signature", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePDF = async () => {
    if (!pdfContentRef.current) return;

    try {
      toast({
        title: t('generatingPdf'),
        description: t('pleaseWait'),
      });

      const canvas = await html2canvas(pdfContentRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(`work_certificate_${form.getValues('fullName')}.pdf`);
      
      toast({
        title: t('pdfGenerated'),
        description: t('pdfDownloadSuccess'),
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: t('errorGeneratingPdf'),
        description: t('tryAgain'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('workCertificateTitle')}</h1>

      {isSubmitted ? (
        <>
          <Card className="border-green-200 bg-green-50 mb-6">
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
                  <div className="flex flex-wrap gap-3 justify-center mt-4">
                    <Button 
                      variant="outline"
                      onClick={() => setIsSubmitted(false)}
                    >
                      {t('newRequest')}
                    </Button>
                    <Button 
                      onClick={generatePDF}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      {t('downloadPdf')}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* PDF Content Template - Hidden but used for PDF generation */}
          <div className="hidden">
            <div ref={pdfContentRef} className="bg-white p-8" style={{width: "800px", minHeight: "1130px"}}>
              <div style={{textAlign: "center", marginBottom: "20px"}}>
                <img 
                  src="/lovable-uploads/61196920-7ed5-45d7-af8f-330e58178ad2.png" 
                  alt="Logo" 
                  style={{height: "80px", marginBottom: "10px"}} 
                />
                <h1 style={{fontSize: "24px", fontWeight: "bold"}}>
                  {language === 'ar' ? 'شهادة عمل' : 'ATTESTATION DE TRAVAIL'}
                </h1>
              </div>
              
              <div style={{marginBottom: "20px"}}>
                <p style={{marginBottom: "20px"}}>
                  {language === 'ar' 
                    ? 'نحن الموقعين أدناه، المدير الإقليمي للدار البيضاء - سطات بمكتب التكوين المهني وإنعاش الشغل (OFPPT)، نشهد أن:'
                    : 'Nous soussignés, Directeur Régional Casablanca-Settat de l\'Office de la Formation Professionnelle et de la Promotion du Travail (OFPPT), attestons que :'}
                </p>
              </div>
              
              <div style={{marginBottom: "20px"}}>
                <table style={{width: "100%", borderCollapse: "collapse"}}>
                  <tbody>
                    <tr>
                      <td style={{border: "1px solid #333", padding: "8px", width: "200px"}}>
                        {language === 'ar' ? 'الاسم الكامل / Nom' : 'Nom / الاسم الكامل'}:
                      </td>
                      <td style={{border: "1px solid #333", padding: "8px"}}>
                        {form.getValues('fullName')}
                      </td>
                    </tr>
                    <tr>
                      <td style={{border: "1px solid #333", padding: "8px"}}>
                        {language === 'ar' ? 'الرقم الوظيفي / Matricule' : 'Matricule / الرقم الوظيفي'}:
                      </td>
                      <td style={{border: "1px solid #333", padding: "8px"}}>
                        {form.getValues('matricule')}
                      </td>
                    </tr>
                    <tr>
                      <td style={{border: "1px solid #333", padding: "8px"}}>
                        {language === 'ar' ? 'الدرجة / Grade' : 'Grade / الدرجة'}:
                      </td>
                      <td style={{border: "1px solid #333", padding: "8px"}}>
                        {form.getValues('grade')}
                      </td>
                    </tr>
                    <tr>
                      <td style={{border: "1px solid #333", padding: "8px"}}>
                        {language === 'ar' ? 'موظف منذ / Embauché depuis' : 'Embauché depuis / موظف منذ'}:
                      </td>
                      <td style={{border: "1px solid #333", padding: "8px"}}>
                        {form.getValues('hireDate')}
                      </td>
                    </tr>
                    <tr>
                      <td style={{border: "1px solid #333", padding: "8px"}}>
                        {language === 'ar' ? 'الوظيفة / Fonction' : 'Fonction / الوظيفة'}:
                      </td>
                      <td style={{border: "1px solid #333", padding: "8px"}}>
                        {form.getValues('jobTitle')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div style={{marginTop: "30px"}}>
                <p>
                  {language === 'ar' 
                    ? 'تم إصدار هذه الشهادة للمعني بالأمر للاستخدام حسب الحاجة.'
                    : 'La présente attestation est délivrée à l\'intéressé pour servir et valoir ce que de droit.'}
                </p>
              </div>
              
              {signaturePreview && (
                <div style={{marginTop: "50px", textAlign: "left"}}>
                  <p style={{marginBottom: "10px", fontWeight: "bold"}}>
                    {language === 'ar' ? 'التوقيع:' : 'Signature:'}
                  </p>
                  <img 
                    src={signaturePreview} 
                    alt="Signature" 
                    style={{maxHeight: "80px"}} 
                  />
                </div>
              )}
              
              <div style={{marginTop: "50px", textAlign: "right", fontSize: "14px"}}>
                <p>
                  {language === 'ar' ? 'الدار البيضاء، بتاريخ:' : 'Casablanca, le:'} {new Date().toLocaleDateString()}
                </p>
              </div>

              {form.getValues('additionalInfo') && (
                <div style={{marginTop: "30px", borderTop: "1px solid #ddd", paddingTop: "10px"}}>
                  <p style={{fontSize: "14px", fontStyle: "italic"}}>
                    <strong>{language === 'ar' ? 'معلومات إضافية:' : 'Informations supplémentaires:'}</strong> {form.getValues('additionalInfo')}
                  </p>
                </div>
              )}

              <div style={{marginTop: "50px", borderTop: "1px dashed #ddd", paddingTop: "10px", fontSize: "12px", color: "#666"}}>
                <p>{language === 'ar' ? 'طلب الشهادة تم لأجل:' : 'Certificat demandé pour:'} {form.getValues('purpose')}</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t('workCertificateRequestInfo')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fullName')}*</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('enterFullName')}
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
                          placeholder={t('enterMatricule')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('grade')}*</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('enterGrade')}
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
                        <FormLabel>{t('hireDate')}*</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('enterHireDate')}
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
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('jobTitle')}*</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('enterJobTitle')}
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

                <FormField
                  control={form.control}
                  name="signature"
                  render={({ field: { value, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>{t('signatureUpload')}</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-4">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleSignatureChange}
                              className="hidden"
                              id="signature-upload"
                              {...fieldProps}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById("signature-upload")?.click()}
                              className="w-full"
                            >
                              <FileImage className="mr-2 h-4 w-4" />
                              {t('signatureUploadButton')}
                            </Button>
                          </div>
                          {signaturePreview && (
                            <div className="border rounded-md p-2">
                              <img
                                src={signaturePreview}
                                alt={t('signatureUpload')}
                                className="max-h-32 mx-auto"
                              />
                            </div>
                          )}
                        </div>
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
