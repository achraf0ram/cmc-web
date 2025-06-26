
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload } from 'lucide-react';
import { sendRequestWithEmail } from '@/services/requestService';
import { generateWorkCertificatePDF } from '@/utils/pdfGenerator';
import { useLanguage } from '@/contexts/LanguageContext';

const SalaryDomiciliation = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signature, setSignature] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    matricule: '',
    grade: '',
    hireDate: '',
    function: '',
    purpose: '',
    additionalInfo: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSignature(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.matricule || !formData.purpose) {
      toast({
        title: t('error'),
        description: t('required'),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const pdfBase64 = await generateWorkCertificatePDF({
        ...formData,
        signature: signature ? await convertFileToBase64(signature) : undefined
      }, 'salary-domiciliation');

      const result = await sendRequestWithEmail({
        type: 'salary-domiciliation',
        data: formData,
        pdfBase64
      });

      if (result.success) {
        toast({
          title: t('requestSubmitted'),
          description: t('requestReviewMessage'),
          className: 'bg-green-50 border-green-200 text-green-800',
        });

        // Reset form
        setFormData({
          fullName: '',
          matricule: '',
          grade: '',
          hireDate: '',
          function: '',
          purpose: '',
          additionalInfo: ''
        });
        setSignature(null);
      } else {
        throw new Error(result.error || t('submitError'));
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('submitError'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <CardTitle className="text-2xl font-bold text-gray-800">
              {t('salaryDomiciliation')}
            </CardTitle>
          </div>
          <p className="text-gray-600">
            طلب شهادة إقامة راتب غير قابلة للإلغاء
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  {t('fullName')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder={t('fullNamePlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="matricule" className="text-sm font-medium">
                  {t('matricule')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="matricule"
                  value={formData.matricule}
                  onChange={(e) => handleInputChange('matricule', e.target.value)}
                  placeholder={t('matriculePlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade" className="text-sm font-medium">
                  {t('grade')}
                </Label>
                <Input
                  id="grade"
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  placeholder={t('gradePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hireDate" className="text-sm font-medium">
                  {t('hireDate')}
                </Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => handleInputChange('hireDate', e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="function" className="text-sm font-medium">
                  {t('fonction')}
                </Label>
                <Input
                  id="function"
                  value={formData.function}
                  onChange={(e) => handleInputChange('function', e.target.value)}
                  placeholder={t('fonctionPlaceholder')}
                />
              </div>
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purpose" className="text-sm font-medium">
                {t('purposeLabel')} <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                placeholder="اذكر الغرض من الشهادة والمؤسسة المالية..."
                rows={3}
                required
              />
            </div>

            {/* Additional Information */}
            <div className="space-y-2">
              <Label htmlFor="additionalInfo" className="text-sm font-medium">
                {t('additionalInfo')}
              </Label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                placeholder={t('additionalInfoPlaceholder')}
                rows={3}
              />
            </div>

            {/* Signature Upload */}
            <div className="space-y-2">
              <Label htmlFor="signature" className="text-sm font-medium">
                {t('signatureOptional')}
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="signature"
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('signature')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {t('chooseSignatureFile')}
                </Button>
                {signature && (
                  <span className="text-sm text-green-600">
                    {signature.name}
                  </span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto min-w-[200px] bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
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

export default SalaryDomiciliation;
