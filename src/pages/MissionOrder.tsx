
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, MapPin } from "lucide-react";

const formSchema = z.object({
  fullName: z.string().min(3, { message: "يرجى إدخال الاسم الكامل" }),
  position: z.string().min(2, { message: "يرجى إدخال المنصب" }),
  department: z.string().min(2, { message: "يرجى إدخال القسم" }),
  destination: z.string().min(3, { message: "يرجى إدخال وجهة المهمة" }),
  purpose: z.string().min(10, { message: "يرجى وصف الغرض من المهمة" }),
  startDate: z.string().min(1, { message: "يرجى اختيار تاريخ البداية" }),
  endDate: z.string().min(1, { message: "يرجى اختيار تاريخ النهاية" }),
  transportation: z.string().optional(),
  accommodation: z.string().optional(),
  additionalNotes: z.string().optional(),
});

const MissionOrder = () => {
  const { t } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      position: "",
      department: "",
      destination: "",
      purpose: "",
      startDate: "",
      endDate: "",
      transportation: "",
      accommodation: "",
      additionalNotes: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // Here you would typically send the data to your backend
      console.log("Mission order data:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      
      toast({
        title: "تم بنجاح",
        description: "تم إرسال طلب أمر المهمة بنجاح",
        variant: "default",
        className: "bg-green-50 border-green-200",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sahara-50 via-white to-sahara-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">تم الإرسال بنجاح</h2>
              <p className="text-gray-600">تم إرسال طلب أمر المهمة بنجاح وسيتم معالجته قريباً</p>
              <Button 
                onClick={() => setIsSubmitted(false)}
                className="w-full bg-sahara-600 hover:bg-sahara-700"
              >
                إرسال طلب جديد
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sahara-50 via-white to-sahara-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sahara-100 rounded-full mb-4">
            <MapPin className="w-8 h-8 text-sahara-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">أمر المهمة</h1>
          <p className="text-gray-600">قم بملء البيانات المطلوبة لطلب أمر مهمة</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-sahara-600 to-sahara-700 text-white rounded-t-lg">
            <CardTitle className="text-xl font-semibold text-center">معلومات المهمة</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    المعلومات الشخصية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">الاسم الكامل</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="border-gray-300 focus:border-sahara-500 focus:ring-sahara-500"
                            placeholder="أدخل الاسم الكامل"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="position" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">المنصب</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="border-gray-300 focus:border-sahara-500 focus:ring-sahara-500"
                            placeholder="أدخل المنصب"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="department" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">القسم</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="border-gray-300 focus:border-sahara-500 focus:ring-sahara-500"
                            placeholder="أدخل القسم"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Mission Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    تفاصيل المهمة
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="destination" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">وجهة المهمة</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="border-gray-300 focus:border-sahara-500 focus:ring-sahara-500"
                            placeholder="أدخل وجهة المهمة"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="transportation" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">وسيلة النقل</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="border-gray-300 focus:border-sahara-500 focus:ring-sahara-500"
                            placeholder="مثال: سيارة، قطار، طائرة"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="startDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">تاريخ البداية</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            className="border-gray-300 focus:border-sahara-500 focus:ring-sahara-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="endDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">تاريخ النهاية</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            className="border-gray-300 focus:border-sahara-500 focus:ring-sahara-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="purpose" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">الغرض من المهمة</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          className="resize-none border-gray-300 focus:border-sahara-500 focus:ring-sahara-500" 
                          placeholder="اشرح الغرض من المهمة والأنشطة المطلوبة"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="accommodation" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">الإقامة</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="border-gray-300 focus:border-sahara-500 focus:ring-sahara-500"
                          placeholder="نوع الإقامة المطلوبة (اختياري)"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="additionalNotes" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">ملاحظات إضافية</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          className="resize-none border-gray-300 focus:border-sahara-500 focus:ring-sahara-500" 
                          placeholder="أي ملاحظات أو متطلبات إضافية"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="flex justify-center pt-6">
                  <Button 
                    type="submit" 
                    className="px-12 py-3 bg-gradient-to-r from-sahara-600 to-sahara-700 hover:from-sahara-700 hover:to-sahara-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    إرسال الطلب
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

export default MissionOrder;
