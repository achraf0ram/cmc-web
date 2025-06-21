
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PersonalInfoSection } from '@/components/forms/PersonalInfoSection';
import { LeaveInfoSection } from '@/components/forms/LeaveInfoSection';
import { vacationFormSchema, type VacationFormData } from '@/utils/vacationPDF';
import { submitVacationRequest } from '@/services/requestService';
import { useLanguage } from '@/contexts/LanguageContext';

const VacationRequest = () => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<VacationFormData>({
    resolver: zodResolver(vacationFormSchema),
    defaultValues: {
      // Personal info
      fullName: '',
      employeeId: '',
      phoneNumber: '',
      position: '',
      department: '',
      
      // Leave info
      leaveType: '',
      startDate: '',
      endDate: '',
      numberOfDays: 0,
      reason: '',
    },
  });

  const onSubmit = async (data: VacationFormData) => {
    try {
      setIsSubmitting(true);
      
      // Convert string dates to Date objects for the PDF generation
      const vacationData = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      };
      
      await submitVacationRequest(vacationData);
      
      toast({
        title: t('success'),
        description: t('requestSubmitted'),
      });
      
      form.reset();
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
