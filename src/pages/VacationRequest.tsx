
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PersonalInfoSection from '@/components/forms/PersonalInfoSection';
import LeaveInfoSection from '@/components/forms/LeaveInfoSection';
import { formSchema, type FormData } from '@/types/vacationRequest';
import { sendRequestWithEmail } from '@/services/requestService';
import { generateVacationPDF } from '@/utils/pdfGenerator';
import { useLanguage } from '@/contexts/LanguageContext';

const VacationRequest = () => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
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
      setIsSubmitting(true);
      
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
        
        form.reset();
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
      setIsSubmitting(false);
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <PersonalInfoSection 
              form={form}
            />
            
            <LeaveInfoSection 
              form={form}
              signaturePreview={signaturePreview}
              setSignaturePreview={setSignaturePreview}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2"
              >
                {isSubmitting ? t('submitting') : t('submitRequest')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VacationRequest;
