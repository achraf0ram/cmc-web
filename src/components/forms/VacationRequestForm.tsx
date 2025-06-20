
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormData, formSchema } from "@/types/vacationRequest";
import PersonalInfoSection from "./PersonalInfoSection";
import LeaveInfoSection from "./LeaveInfoSection";
import VacationEmailSender from "../VacationEmailSender";
import { generateVacationPDF } from "@/utils/vacationPDF";
import { format } from "date-fns";
import { useState, useEffect } from "react";

interface VacationRequestFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isGenerating: boolean;
}

const VacationRequestForm = ({ onSubmit, isGenerating }: VacationRequestFormProps) => {
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string>("");
  
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
      startDate: new Date(),
      endDate: new Date(),
      with: "",
      arabicWith: "",
      interim: "",
      arabicInterim: "",
      leaveMorocco: false,
      signature: "",
      hireDate: "",
    },
  });

  // Watch form values to generate PDF when data changes
  const watchedValues = form.watch();

  useEffect(() => {
    const generatePDF = async () => {
      if (watchedValues.fullName && watchedValues.matricule && watchedValues.leaveType) {
        try {
          const pdfData = {
            fullName: watchedValues.fullName,
            matricule: watchedValues.matricule,
            grade: watchedValues.grade || "",
            hireDate: watchedValues.hireDate || format(new Date(), "yyyy-MM-dd"),
            function: watchedValues.fonction || "",
            leaveType: watchedValues.leaveType,
            startDate: format(watchedValues.startDate, "yyyy-MM-dd"),
            endDate: format(watchedValues.endDate, "yyyy-MM-dd"),
            numberOfDays: Math.ceil((watchedValues.endDate.getTime() - watchedValues.startDate.getTime()) / (1000 * 60 * 60 * 24)),
            reason: watchedValues.duration || "طلب إجازة",
            additionalInfo: watchedValues.arabicDuration || "",
          };
          
          const base64 = await generateVacationPDF(pdfData);
          setPdfBase64(base64);
        } catch (error) {
          console.error("Error generating PDF:", error);
        }
      }
    };

    generatePDF();
  }, [watchedValues]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            طلب إجازة
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            قم بملء البيانات المطلوبة للحصول على موافقة الإجازة
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl font-semibold text-center">
              معلومات طلب الإجازة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <PersonalInfoSection form={form} />
              <LeaveInfoSection 
                form={form} 
                signaturePreview={signaturePreview}
                setSignaturePreview={setSignaturePreview}
              />
              
              <div className="flex justify-center pt-4 md:pt-6">
                <VacationEmailSender 
                  pdfBase64={pdfBase64}
                  formData={watchedValues}
                  isGenerating={isGenerating}
                />
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VacationRequestForm;
