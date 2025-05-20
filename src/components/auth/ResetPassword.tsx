
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [token, setToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isResetSuccessful, setIsResetSuccessful] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const emailParam = query.get('email');
    const tokenParam = query.get('token');
    if (emailParam) setEmail(emailParam);
    if (tokenParam) setToken(tokenParam);
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (!email || !password || !passwordConfirmation || !token) {
      setErrorMessage("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    
    if (password !== passwordConfirmation) {
      setErrorMessage("كلمات المرور غير متطابقة");
      return;
    }
    
    setIsLoading(true);

    try {
      const success = await resetPassword(email, password, passwordConfirmation, token);
      if (success) {
        setIsResetSuccessful(true);
        toast({
          title: "تم إعادة تعيين كلمة المرور بنجاح",
          description: "يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة",
        });
      } else {
        setErrorMessage("فشل إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى");
        toast({
          variant: "destructive",
          title: "خطأ في إعادة تعيين كلمة المرور",
          description: "يرجى التحقق من المعلومات المدخلة والمحاولة مرة أخرى",
        });
      }
    } catch (error) {
      setErrorMessage("حدث خطأ أثناء محاولة إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى");
      toast({
        variant: "destructive",
        title: "خطأ في إعادة تعيين كلمة المرور",
        description: "حدث خطأ أثناء محاولة إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى",
      });
    } finally {
      setIsLoading(false);
    }
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
          <p className="text-gray-600 mt-2">إعادة تعيين كلمة المرور</p>
        </div>
        
        {errorMessage && (
          <div className="mb-4 p-3 text-sm text-white bg-red-500 rounded-md">
            {errorMessage}
          </div>
        )}
        
        {isResetSuccessful ? (
          <div className="text-center p-4">
            <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
              تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.
            </div>
            <Button 
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/sign-in")}
            >
              <ArrowLeft className="ml-2" size={16} />
              العودة إلى تسجيل الدخول
            </Button>
          </div>
        ) : (
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
                  readOnly={!!email}
                />
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="أدخل كلمة المرور الجديدة"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-4"
                  required
                  dir="rtl"
                />
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="passwordConfirmation">تأكيد كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="passwordConfirmation"
                  type="password"
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
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
                  جاري إعادة تعيين كلمة المرور...
                </>
              ) : (
                "إعادة تعيين كلمة المرور"
              )}
            </Button>
            
            <div className="text-center mt-4">
              <Button
                variant="link"
                className="text-[#0EA5E9]"
                onClick={() => navigate("/sign-in")}
                type="button"
              >
                <ArrowLeft className="ml-2" size={16} />
                العودة إلى تسجيل الدخول
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
