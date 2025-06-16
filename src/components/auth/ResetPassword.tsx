
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { useToast } from "@/hooks/use-toast";
import { Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
  confirmPassword: z.string().min(1, { message: "تأكيد كلمة المرور مطلوب" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

export const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    // التحقق من وجود access_token و refresh_token في URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (accessToken && refreshToken) {
      // تعيين الجلسة باستخدام التوكنات
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }
  }, [searchParams]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      console.log("Password reset:", values);
      
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });

      if (error) {
        throw error;
      }
      
      toast({
        title: "تم تحديث كلمة المرور",
        description: "تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول",
        className: "bg-green-50 border-green-200",
      });
      
      // تسجيل الخروج وتوجيه المستخدم لتسجيل الدخول
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error: any) {
      console.error("Password update error:", error);
      
      let errorMessage = "حدث خطأ أثناء تحديث كلمة المرور. يرجى المحاولة مرة أخرى";
      
      if (error?.message) {
        if (error.message.includes("New password should be different")) {
          errorMessage = "كلمة المرور الجديدة يجب أن تكون مختلفة عن القديمة";
        } else if (error.message.includes("Password should be at least")) {
          errorMessage = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
        }
      }
      
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen cmc-page-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cmc-blue-light to-cmc-green-light rounded-full mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-cmc-blue" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">إعادة تعيين كلمة المرور</h1>
          <p className="text-slate-600">أدخل كلمة المرور الجديدة</p>
        </div>

        <Card className="cmc-card">
          <CardHeader className="cmc-gradient text-white rounded-t-lg p-6">
            <CardTitle className="text-xl font-semibold text-center">كلمة مرور جديدة</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">كلمة المرور الجديدة</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="أدخل كلمة المرور الجديدة"
                            className="cmc-input pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-slate-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-slate-400" />
                            )}
                          </Button>
                        </div>
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
                      <FormLabel className="text-slate-700 font-medium">تأكيد كلمة المرور</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="أعد إدخال كلمة المرور"
                            className="cmc-input pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-slate-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-slate-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full cmc-button-primary py-3"
                  disabled={isLoading}
                >
                  {isLoading ? "جاري التحديث..." : "تحديث كلمة المرور"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
