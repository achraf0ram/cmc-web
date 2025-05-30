
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { formSchema, FormData } from "@/types/vacationRequest";
import { generatePDF } from "@/utils/pdfGenerator";
import PersonalInfoSection from "@/components/forms/PersonalInfoSection";
import LeaveInfoSection from "@/components/forms/LeaveInfoSection";

const VacationRequest = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { language } = useLanguage();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      matricule: "",
      echelle: "",
      echelon: "",
      grade: "",
      fonction: "",
      arabicFonction: "",
      direction: "",
      arabicDirection: "",
      address: "",
      arabicAddress: "",
      phone: "",
      leaveType: "",
      customLeaveType: "",
      arabicCustomLeaveType: "",
      duration: "",
      arabicDuration: "",
      startDate: undefined,
      endDate: undefined,
      with: "",
      arabicWith: "",
      interim: "",
      arabicInterim: "",
      leaveMorocco: false,
      signature: undefined,
    },
  });

  const onSubmit = async (values: FormData) => {
    setIsSubmitted(true);
    setIsGeneratingPDF(true);
    await generatePDF(values, signaturePreview);
    setIsGeneratingPDF(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            {language === 'ar' ? 'طلب إجازة' : 'Demande de Congé'}
          </h1>
          <p className="text-gray-600">
            {language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Veuillez remplir tous les champs requis'}
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
            <CardTitle className="text-xl font-semibold">
              {language === 'ar' ? 'معلومات طلب الإجازة' : 'Informations de la demande'}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {!isSubmitted ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <PersonalInfoSection form={form} />
                  <LeaveInfoSection 
                    form={form} 
                    signaturePreview={signaturePreview}
                    setSignaturePreview={setSignaturePreview}
                  />

                  <div className="flex justify-center pt-6">
                    <Button 
                      type="submit" 
                      className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={isGeneratingPDF}
                    >
                      {isGeneratingPDF ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {language === 'ar' ? 'جاري إنشاء الملف...' : 'Génération en cours...'}
                        </div>
                      ) : (
                        <>
                          {language === 'ar' ? 'تحميل طلب الإجازة' : 'Télécharger la demande'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {language === 'ar' ? 'تم إنشاء الطلب بنجاح!' : 'Demande générée avec succès!'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {language === 'ar' ? 'تم تحميل ملف PDF لطلب الإجازة' : 'Le fichier PDF de votre demande a été téléchargé'}
                </p>
                <Button 
                  onClick={() => {
                    setIsSubmitted(false);
                    form.reset();
                  }}
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  {language === 'ar' ? 'طلب جديد' : 'Nouvelle demande'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VacationRequest;
