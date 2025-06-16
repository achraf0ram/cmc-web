
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
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
import { LogIn, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  email: z.string().email({ message: "البريد الإلكتروني غير صحيح" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
});

export const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, signInWithGoogle, isLoading } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log("Login attempt:", values);
    
    try {
      const success = await login(values.email, values.password);
      console.log("Login result:", success);
      
      if (success) {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في منصة CMC",
          className: "bg-green-50 border-green-200",
        });
        
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 100);
      } else {
        throw new Error("فشل في تسجيل الدخول");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      let errorMessage = "يرجى التحقق من البيانات والمحاولة مرة أخرى";
      
      if (error?.message) {
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "يرجى تأكيد البريد الإلكتروني أولاً";
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "محاولات كثيرة، يرجى المحاولة لاحقاً";
        }
      }
      
      toast({
        title: "خطأ في تسجيل الدخول",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return;
    
    setIsGoogleLoading(true);
    try {
      const success = await signInWithGoogle();
      if (success) {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في منصة CMC",
          className: "bg-green-50 border-green-200",
        });
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      toast({
        title: "خطأ في تسجيل الدخول بـ Google",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const isButtonDisabled = isLoading || isSubmitting;

  return (
    <div className="min-h-screen cmc-page-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cmc-blue-light to-cmc-green-light rounded-full mb-4 shadow-lg">
            <LogIn className="w-8 h-8 text-cmc-blue" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">تسجيل الدخول</h1>
          <p className="text-slate-600">أدخل بياناتك للوصول إلى حسابك</p>
        </div>

        <Card className="cmc-card">
          <CardHeader className="cmc-gradient text-white rounded-t-lg p-6">
            <CardTitle className="text-xl font-semibold text-center">C M C</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full mb-6 py-3 border-2 hover:bg-gray-50"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isButtonDisabled}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isGoogleLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول بـ Google"}
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">أو</span>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="example@ofppt.ma"
                          className="cmc-input"
                          disabled={isButtonDisabled}
                          {...field}
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
                      <FormLabel className="text-slate-700 font-medium">كلمة المرور</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="أدخل كلمة المرور"
                            className="cmc-input pr-10"
                            disabled={isButtonDisabled}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isButtonDisabled}
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

                <div className="flex items-center justify-between">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-cmc-blue hover:text-cmc-blue-dark transition-colors"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full cmc-button-primary py-3"
                  disabled={isButtonDisabled}
                >
                  {isButtonDisabled ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </Button>

                <div className="text-center">
                  <span className="text-slate-600">ليس لديك حساب؟ </span>
                  <Link
                    to="/register"
                    className="text-cmc-blue hover:text-cmc-blue-dark font-medium transition-colors"
                  >
                    إنشاء حساب جديد
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
