
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
import { UserPlus, Eye, EyeOff, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  fullName: z.string().min(3, { message: "الاسم يجب أن يكون 3 أحرف على الأقل" }),
  email: z.string().email({ message: "البريد الإلكتروني غير صحيح" }),
  matricule: z.string().min(1, { message: "رقم التسجيل مطلوب" }),
  department: z.string().min(2, { message: "القسم مطلوب" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
  confirmPassword: z.string().min(1, { message: "تأكيد كلمة المرور مطلوب" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

export const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signup, isLoading } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      matricule: "",
      department: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log("Signup attempt:", values);
    
    try {
      const success = await signup(
        values.fullName, 
        values.email, 
        values.password,
        values.matricule + " - " + values.department
      );
      
      console.log("Signup result:", success);
      
      if (success) {
        setUserEmail(values.email);
        setEmailSent(true);
        
        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: "تم إرسال رسالة تأكيد إلى بريدك الإلكتروني",
          className: "bg-green-50 border-green-200",
        });
      } else {
        throw new Error("فشل في إنشاء الحساب");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      
      let errorMessage = "يرجى التحقق من البيانات والمحاولة مرة أخرى";
      
      if (error?.message) {
        if (error.message.includes("User already registered")) {
          errorMessage = "البريد الإلكتروني مسجل بالفعل";
        } else if (error.message.includes("Invalid email")) {
          errorMessage = "البريد الإلكتروني غير صحيح";
        } else if (error.message.includes("Password should be")) {
          errorMessage = "كلمة المرور ضعيفة، يرجى استخدام كلمة مرور أقوى";
        }
      }
      
      toast({
        title: "خطأ في إنشاء الحساب",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = isLoading || isSubmitting;

  // Email confirmation success screen
  if (emailSent) {
    return (
      <div className="min-h-screen cmc-page-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="cmc-card">
            <CardContent className="pt-6 pb-6 md:pt-8 md:pb-8">
              <div className="flex flex-col items-center text-center gap-4 md:gap-6">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gradient-to-r from-cmc-blue-light to-cmc-green-light flex items-center justify-center shadow-lg">
                  <Mail className="h-8 w-8 md:h-10 md:w-10 text-cmc-blue" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-slate-800">تحقق من بريدك الإلكتروني</h2>
                  <p className="text-slate-600 leading-relaxed mb-4 md:mb-6 text-sm md:text-base">
                    تم إرسال رسالة تأكيد إلى <strong>{userEmail}</strong>
                    <br />
                    يرجى النقر على الرابط في الرسالة لتأكيد حسابك
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-blue-800 text-sm">
                      <strong>ملاحظة:</strong> قد تجد الرسالة في مجلد الرسائل غير المرغوبة (Spam)
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate("/login")}
                    className="cmc-button-primary px-6 md:px-8 py-2 md:py-3 rounded-lg text-sm md:text-base w-full"
                  >
                    العودة لتسجيل الدخول
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cmc-page-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cmc-blue-light to-cmc-green-light rounded-full mb-4 shadow-lg">
            <UserPlus className="w-8 h-8 text-cmc-blue" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">إنشاء حساب جديد</h1>
          <p className="text-slate-600">أدخل بياناتك لإنشاء حساب جديد</p>
        </div>

        <Card className="cmc-card">
          <CardHeader className="cmc-gradient text-white rounded-t-lg p-6">
            <CardTitle className="text-xl font-semibold text-center">تسجيل موظف جديد</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">الاسم الكامل</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="أدخل الاسم الكامل"
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
                  name="matricule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">رقم التسجيل</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="أدخل رقم التسجيل"
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
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">القسم</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="أدخل القسم"
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
                            disabled={isButtonDisabled}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isButtonDisabled}
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
                  disabled={isButtonDisabled}
                >
                  {isButtonDisabled ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
                </Button>

                <div className="text-center">
                  <span className="text-slate-600">لديك حساب بالفعل؟ </span>
                  <Link
                    to="/login"
                    className="text-cmc-blue hover:text-cmc-blue-dark font-medium transition-colors"
                  >
                    تسجيل الدخول
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
