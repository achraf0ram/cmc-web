
import React, { useState } from "react";
import PersonalInfoSection from "@/components/forms/PersonalInfoSection";
import LeaveInfoSection from "@/components/forms/LeaveInfoSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Send, Loader2 } from "lucide-react";
import { generateVacationPDF } from "@/utils/vacationPDF";
import { sendRequestWithEmail } from "@/services/requestService";
import { SuccessMessage } from "@/components/SuccessMessage";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";

export default function VacationRequest() {
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    employeeId: "",
    phoneNumber: "",
    position: "",
    department: "",
  });

  const [leaveInfo, setLeaveInfo] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    numberOfDays: 0,
    reason: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  const handlePersonalInfoChange = (info: typeof personalInfo) => {
    setPersonalInfo(info);
  };

  const handleLeaveInfoChange = (info: typeof leaveInfo) => {
    setLeaveInfo(info);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const requestData = {
        ...personalInfo,
        ...leaveInfo,
        startDate: new Date(leaveInfo.startDate),
        endDate: new Date(leaveInfo.endDate),
      };

      console.log("Generating PDF...");
      const pdfBase64 = await generateVacationPDF(requestData);
      console.log("PDF generated successfully");

      console.log("Sending request...");
      const result = await sendRequestWithEmail({
        type: 'vacation',
        data: requestData,
        pdfBase64
      });

      if (result.success) {
        console.log("Request sent successfully");
        setIsSuccess(true);
        
        // إضافة إشعار محلي
        addNotification({
          title: "تم إرسال طلب الإجازة",
          message: "تم إرسال طلبك بنجاح وهو قيد المراجعة",
          type: "success"
        });

        toast({
          title: "تم إرسال الطلب بنجاح",
          description: "سيتم مراجعة طلبك والرد عليك قريباً",
          className: "bg-green-50 border-green-200",
        });
      } else {
        throw new Error(result.error || "فشل في إرسال الطلب");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      
      addNotification({
        title: "خطأ في إرسال الطلب",
        message: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        type: "error"
      });

      toast({
        title: "خطأ في إرسال الطلب",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setPersonalInfo({
      fullName: "",
      employeeId: "",
      phoneNumber: "",
      position: "",
      department: "",
    });
    setLeaveInfo({
      leaveType: "",
      startDate: "",
      endDate: "",
      numberOfDays: 0,
      reason: "",
    });
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <SuccessMessage
            title="تم إرسال طلب الإجازة بنجاح"
            description="تم إرسال طلبك إلى الإدارة للمراجعة. ستتلقى إشعاراً بالموافقة أو الرفض قريباً."
            buttonText="إرسال طلب جديد"
            onReset={handleReset}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-cmc-blue-light to-cmc-green-light rounded-full mb-4 shadow-lg">
            <Calendar className="w-6 h-6 md:w-8 md:h-8 text-cmc-blue" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">طلب إجازة</h1>
          <p className="text-slate-600 text-sm md:text-base">قم بملء النموذج أدناه لتقديم طلب الإجازة</p>
        </div>

        <Card className="cmc-card">
          <CardHeader className="cmc-gradient text-white rounded-t-lg">
            <CardTitle className="text-xl md:text-2xl font-bold text-center">
              نموذج طلب الإجازة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-blue-200 pb-2">
                المعلومات الشخصية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    value={personalInfo.fullName}
                    onChange={(e) => handlePersonalInfoChange({...personalInfo, fullName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل الاسم الكامل"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الموظف *</label>
                  <input
                    type="text"
                    value={personalInfo.employeeId}
                    onChange={(e) => handlePersonalInfoChange({...personalInfo, employeeId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل رقم الموظف"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={personalInfo.phoneNumber}
                    onChange={(e) => handlePersonalInfoChange({...personalInfo, phoneNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المنصب</label>
                  <input
                    type="text"
                    value={personalInfo.position}
                    onChange={(e) => handlePersonalInfoChange({...personalInfo, position: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل المنصب"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                  <input
                    type="text"
                    value={personalInfo.department}
                    onChange={(e) => handlePersonalInfoChange({...personalInfo, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل القسم"
                  />
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-green-200 pb-2">
                معلومات الإجازة
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نوع الإجازة *</label>
                  <select
                    value={leaveInfo.leaveType}
                    onChange={(e) => handleLeaveInfoChange({...leaveInfo, leaveType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر نوع الإجازة</option>
                    <option value="سنوية">إجازة سنوية</option>
                    <option value="مرضية">إجازة مرضية</option>
                    <option value="طارئة">إجازة طارئة</option>
                    <option value="أمومة">إجازة أمومة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">عدد الأيام *</label>
                  <input
                    type="number"
                    value={leaveInfo.numberOfDays}
                    onChange={(e) => handleLeaveInfoChange({...leaveInfo, numberOfDays: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل عدد الأيام"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية *</label>
                  <input
                    type="date"
                    value={leaveInfo.startDate}
                    onChange={(e) => handleLeaveInfoChange({...leaveInfo, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ النهاية *</label>
                  <input
                    type="date"
                    value={leaveInfo.endDate}
                    onChange={(e) => handleLeaveInfoChange({...leaveInfo, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">سبب الإجازة</label>
                  <textarea
                    value={leaveInfo.reason}
                    onChange={(e) => handleLeaveInfoChange({...leaveInfo, reason: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="أدخل سبب الإجازة"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="cmc-button-primary px-8 md:px-12 py-3 md:py-4 text-base md:text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin ml-2" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 ml-2" />
                    إرسال الطلب
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
