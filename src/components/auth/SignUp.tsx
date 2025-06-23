
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const signUpSchema = z.object({
  fullName: z.string().min(2, "الاسم يجب أن يكون أكثر من حرفين"),
  email: z.string().email("يرجى إدخال بريد إلكتروني صحيح"),
  phone: z.string().min(10, "رقم الهاتف يجب أن يكون 10 أرقام على الأقل"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  confirmPassword: z.string().min(8, "تأكيد كلمة المرور مطلوب"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

export const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signUpSchema>) {
    try {
      setIsLoading(true);
      console.log("Attempting signup with:", { ...values, password: "[REDACTED]" });
      
      const success = await signup(values.fullName, values.email, values.password, values.phone);
      
      if (success) {
        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: "يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب",
          className: "bg-green-50 border-green-200",
        });
        navigate("/");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      
      let errorMessage = "حدث خطأ أثناء إنشاء الحساب";
      
      if (error?.message?.includes("already registered")) {
        errorMessage = "هذا البريد الإلكتروني مسجل مسبقاً";
      } else if (error?.message?.includes("Password")) {
        errorMessage = "كلمة المرور ضعيفة جداً";
      } else if (error?.message?.includes("Email")) {
        errorMessage = "بريد إلكتروني غير صحيح";
      }

      toast({
        title: "خطأ في إنشاء الحساب",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/lovable-uploads/61196920-7ed5-45d7-af8f-330e58178ad2.png"
              alt="CMC"
              className="h-12 w-auto"
            />
          </div>
          <CardTitle className="text-center text-xl font-semibold">
            إنشاء حساب جديد
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">الاسم الكامل</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                        placeholder="أدخل اسمك الكامل"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="email"
                        className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                        placeholder="أدخل بريدك الإلكتروني"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">رقم الهاتف</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="tel"
                        className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                        placeholder="أدخل رقم هاتفك"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">كلمة المرور</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="password"
                        className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                        placeholder="أدخل كلمة المرور"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">تأكيد كلمة المرور</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="password"
                        className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                        placeholder="أعد كتابة كلمة المرور"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري إنشاء الحساب...
                  </>
                ) : (
                  "إنشاء حساب"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              لديك حساب بالفعل؟{" "}
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
