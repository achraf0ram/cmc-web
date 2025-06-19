
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormData, formSchema } from "@/types/vacationRequest";
import PersonalInfoSection from "./PersonalInfoSection";
import LeaveInfoSection from "./LeaveInfoSection";
import { useState } from "react";

interface VacationRequestFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isGenerating: boolean;
}

const VacationRequestForm = ({ onSubmit, isGenerating }: VacationRequestFormProps) => {
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  
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
    },
  });

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
                <Button 
                  type="submit" 
                  disabled={isGenerating}
                  className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isGenerating ? "جاري المعالجة..." : "إرسال وتحميل PDF"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VacationRequestForm;
