
import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FormData, formSchema } from "@/types/vacationRequest";
import PersonalInfoSection from "./PersonalInfoSection";
import LeaveInfoSection from "./LeaveInfoSection";
import { generateVacationPDF } from "@/utils/pdfGenerator";
import { sendRequestWithEmail } from "@/services/requestService";
import { useLanguage } from "@/contexts/LanguageContext";

const VacationRequestForm = () => {
  const { t } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      matricule: '',
      echelle: '',
      echelon: '',
      grade: '',
      fonction: '',
      arabicFonction: '',
      direction: '',
      arabicDirection: '',
      address: '',
      arabicAddress: '',
      phone: '',
      leaveType: '',
      customLeaveType: '',
      arabicCustomLeaveType: '',
      duration: '',
      arabicDuration: '',
      startDate: undefined,
      endDate: undefined,
      with: '',
      arabicWith: '',
      interim: '',
      arabicInterim: '',
      leaveMorocco: false,
      signature: undefined,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      console.log('Form submitted with data:', data);
      setIsGenerating(true);
      
      // Generate PDF
      const pdfBase64 = await generateVacationPDF(data);
      
      // Send request
      const result = await sendRequestWithEmail({
        type: 'vacation',
        data: data,
        pdfBase64: pdfBase64,
      });
      
      if (result.success) {
        toast({
          title: t('success'),
          description: t('requestSubmitted'),
        });
        
        methods.reset();
        setSignaturePreview(null);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error submitting vacation request:', error);
      toast({
        title: t('error'),
        description: t('submitError'),
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {t('vacationRequest')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
              <PersonalInfoSection />
              
              <LeaveInfoSection 
                signaturePreview={signaturePreview}
                setSignaturePreview={setSignaturePreview}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="px-8 py-2"
                >
                  {isGenerating ? t('submitting') : t('submitRequest')}
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export default VacationRequestForm;
