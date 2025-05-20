
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (!email) {
      setErrorMessage("يرجى إدخال البريد الإلكتروني");
      return;
    }
    
    setIsLoading(true);

    try {
      const success = await forgotPassword(email);
      if (success) {
        setIsEmailSent(true);
        toast({
          title: "تم إرسال رابط إعادة تعيين كلمة المرور",
          description: "يرجى التحقق من بريدك الإلكتروني",
        });
      } else {
        setErrorMessage("فشل إرسال رابط إعادة تعيين كلمة المرور. يرجى التحقق من البريد الإلكتروني");
        toast({
          variant: "destructive",
          title: "خطأ في إعادة تعيين كلمة المرور",
          description: "يرجى التحقق من بريدك الإلكتروني",
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
        
        {isEmailSent ? (
          <div className="text-center p-4">
            <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
              تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من بريدك الإلكتروني.
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
                  placeholder="أدخل البريد الإلكتروني المرتبط بحسابك"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 pr-4"
                  required
                  dir="rtl"
                />
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                  جاري الإرسال...
                </>
              ) : (
                "إرسال رابط إعادة تعيين كلمة المرور"
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
