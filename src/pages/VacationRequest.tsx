import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, FileText } from "lucide-react";

// Validation schema
const vacationRequestSchema = z.object({
  employeeName: z.string().min(2, { message: "الاسم يجب أن يكون على الأقل حرفين." }),
  employeeId: z.string().min(3, { message: "رقم الموظف يجب أن يكون على الأقل 3 خانات." }),
  department: z.string().min(2, { message: "القسم يجب أن يكون على الأقل حرفين." }),
  position: z.string().min(2, { message: "المنصب يجب أن يكون على الأقل حرفين." }),
  startDate: z.string().refine((date) => date !== "", {
    message: "تاريخ البداية مطلوب.",
  }),
  endDate: z.string().refine((date) => date !== "", {
    message: "تاريخ النهاية مطلوب.",
  }),
  vacationType: z.enum(["annual", "sick", "emergency", "maternity", "paternity"]),
  reason: z.string().min(10, { message: "السبب يجب أن يكون على الأقل 10 حروف." }),
  managerName: z.string().min(2, { message: "اسم المدير يجب أن يكون على الأقل حرفين." }),
  contactInfo: z.string().min(5, { message: "معلومات الاتصال يجب أن تكون على الأقل 5 خانات." }),
});

// Form data type
type VacationRequestFormData = z.infer<typeof vacationRequestSchema>;

const VacationRequest = () => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VacationRequestFormData>({
    resolver: zodResolver(vacationRequestSchema),
    defaultValues: {
      employeeName: "",
      employeeId: "",
      department: "",
      position: "",
      startDate: "",
      endDate: "",
      vacationType: "annual",
      reason: "",
      managerName: "",
      contactInfo: "",
    },
  });

  const onSubmit = async (data: VacationRequestFormData) => {
    setIsSubmitting(true);
    try {
      console.log("Vacation request data:", data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: t('requestSubmitted'),
        description: t('requestSubmittedDesc'),
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الطلب",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mb-4 shadow-lg">
            <Calendar className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            {t('vacationRequest')}
          </h1>
          <p className="text-slate-600 text-sm md:text-base">طلب إجازة سنوية أو مرضية</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl font-semibold text-center flex items-center justify-center gap-2">
              <FileText className="w-5 h-5 md:w-6 md:h-6" />
              {t('vacationRequest')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information Section */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 md:p-6 rounded-lg border border-blue-200/50">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-full"></div>
                    المعلومات الشخصية
                  </h3>
                  <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="employeeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">{t('name')}</FormLabel>
                          <FormControl>
                            <Input {...field} className="border-blue-300 focus:border-blue-500 focus:ring-blue-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="employeeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">رقم الموظف</FormLabel>
                          <FormControl>
                            <Input {...field} className="border-blue-300 focus:border-blue-500 focus:ring-blue-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">القسم</FormLabel>
                          <FormControl>
                            <Input {...field} className="border-blue-300 focus:border-blue-500 focus:ring-blue-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">المنصب</FormLabel>
                          <FormControl>
                            <Input {...field} className="border-blue-300 focus:border-blue-500 focus:ring-blue-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Vacation Details Section */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 md:p-6 rounded-lg border border-green-200/50">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-green-600 to-blue-600 rounded-full"></div>
                    تفاصيل الإجازة
                  </h3>
                  <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">تاريخ البداية</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="border-green-300 focus:border-green-500 focus:ring-green-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">تاريخ النهاية</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="border-green-300 focus:border-green-500 focus:ring-green-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="vacationType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">نوع الإجازة</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-green-300 focus:border-green-500 focus:ring-green-200">
                                <SelectValue placeholder="اختر نوع الإجازة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="annual">إجازة سنوية</SelectItem>
                              <SelectItem value="sick">إجازة مرضية</SelectItem>
                              <SelectItem value="emergency">إجازة طارئة</SelectItem>
                              <SelectItem value="maternity">إجازة أمومة</SelectItem>
                              <SelectItem value="paternity">إجازة أبوة</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="contactInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">معلومات الاتصال</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="رقم الهاتف أو البريد الإلكتروني" className="border-green-300 focus:border-green-500 focus:ring-green-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="mt-4 md:mt-6">
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">سبب الإجازة</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="اذكر سبب طلب الإجازة"
                              className="border-green-300 focus:border-green-500 focus:ring-green-200 min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Manager Information Section */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 md:p-6 rounded-lg border border-blue-200/50">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-full"></div>
                    معلومات المدير المباشر
                  </h3>
                  <FormField
                    control={form.control}
                    name="managerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">اسم المدير المباشر</FormLabel>
                        <FormControl>
                          <Input {...field} className="border-blue-300 focus:border-blue-500 focus:ring-blue-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => form.reset()}
                    className="px-6 py-3 border-slate-300 text-slate-600 hover:bg-slate-50"
                  >
                    إعادة تعيين
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isSubmitting ? "جاري الإرسال..." : t('submitRequest')}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VacationRequest;
