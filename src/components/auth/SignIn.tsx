
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, User, Lock, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (!email || !password) {
      setErrorMessage("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في منصة CMC",
        });
        navigate("/");
      } else {
        setErrorMessage("فشل تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور");
        toast({
          variant: "destructive",
          title: "خطأ في تسجيل الدخول",
          description: "يرجى التحقق من بريدك الإلكتروني وكلمة المرور",
        });
      }
    } catch (error) {
      setErrorMessage("حدث خطأ أثناء محاولة تسجيل الدخول. يرجى المحاولة مرة أخرى");
      toast({
        variant: "destructive",
        title: "خطأ في تسجيل الدخول",
        description: "حدث خطأ أثناء محاولة تسجيل الدخول. يرجى المحاولة مرة أخرى",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Will implement in AuthContext
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-9 shadow-lg">
        <div className="mb-7 text-center">
          <img 
            src="/lovable-uploads/61196920-7ed5-45d7-af8f-330e58178ad2.png" 
            alt="CMC" 
            className="mx-auto h-16 w-auto mb-4" 
          />
          <h2 className="text-2xl font-bold text-[#0FA0CE]">CMC</h2>
          <p className="text-gray-600 mt-2">منصة إدارة طلبات الموارد البشرية</p>
        </div>
        
        {errorMessage && (
          <div className="mb-4 p-3 text-sm text-white bg-red-500 rounded-md">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="أدخل البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 pr-4"
                required
                dir="rtl"
              />
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-4"
                required
                dir="rtl"
              />
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#0EA5E9] hover:bg-[#0EA5E9]/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري تسجيل الدخول...
              </>
            ) : (
              "تسجيل الدخول"
            )}
          </Button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-gray-300 w-full"></div>
            <p className="text-center text-gray-500 bg-white px-2 text-sm">أو</p>
            <div className="border-t border-gray-300 w-full"></div>
          </div>
          
          <Button 
            type="button" 
            variant="outline"
            className="w-full border-gray-300 hover:bg-gray-50"
            onClick={handleGoogleLogin}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px" className="mr-2">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
            تسجيل الدخول باستخدام جوجل
          </Button>
          
          <div className="text-center mt-4 text-sm">
            ليس لديك حساب؟{" "}
            <Button
              variant="link"
              className="p-0 text-[#0EA5E9]"
              onClick={() => navigate("/sign-up")}
            >
              إنشاء حساب جديد
            </Button>
          </div>

          <div className="text-center">
            <Button
              variant="link"
              className="p-0 text-[#0EA5E9] text-sm"
              onClick={() => navigate("/forgot-password")}
              type="button"
            >
              هل نسيت كلمة السر؟
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
