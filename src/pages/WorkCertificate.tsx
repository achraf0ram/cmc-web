
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
    // Create work certificate PDF content
    const currentDate = new Date().toLocaleDateString();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr" dir="rtl">
      <head>
      <meta charset="UTF-8" />
      <title>Attestation de travail / شهادة عمل</title>
      <style>
        body { font-family: Arial, sans-serif; direction: rtl; line-height: 1.6; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        td, th { border: 1px solid #333; padding: 8px; vertical-align: top; }
        .fr { font-style: italic; direction: ltr; text-align: left; }
      </style>
      </head>
      <body>

      <h1>ATTESTATION DE TRAVAIL <br> شهادة عمل</h1>

      <p>Nous soussignés, Directeur Régional Casablanca-Settat de l'Office de la Formation Professionnelle et de la Promotion du Travail (OFPPT), attestons que :</p>

      <table>
        <tr>
          <td>Nom / الاسم :</td>
          <td>${data.fullName}</td>
        </tr>
        <tr>
          <td>Matricule :</td>
          <td>${data.matricule}</td>
        </tr>
        <tr>
          <td>Grade / الدرجة :</td>
          <td>${data.grade || ""}</td>
        </tr>
        <tr>
          <td>Embauché depuis / موظف منذ :</td>
          <td>${data.hireDate || ""}</td>
        </tr>
        <tr>
          <td>Fonction / الوظيفة :</td>
          <td>${data.function || ""}</td>
        </tr>
      </table>

      <p>La présente attestation est délivrée à l'intéressé pour servir et valoir ce que de droit.</p>
      <p>Motif: ${data.purpose}</p>
      ${data.additionalInfo ? `<p>Information additionnelle: ${data.additionalInfo}</p>` : ''}
      
      <p>Fait le: ${currentDate}</p>

      </body>
      </html>
    `;
    
    // Create a new blob with the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = url;
    link.download = `work_certificate_${data.fullName}.html`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
