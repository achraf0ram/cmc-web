
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      // Fix API URL construction by ensuring proper concatenation
      const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
      
      await axios.post(
        `${apiBaseUrl}/forgot-password`,
        { email }
      );
      
      toast({
        title: "تم إرسال رابط إعادة تعيين كلمة المرور",
        description: "تحقق من بريدك الإلكتروني.",
      });
      
      // Wait a moment before redirecting to login page
      setTimeout(() => {
        navigate("/sign-in");
      }, 3000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error?.response?.data?.message || "حدث خطأ أثناء إرسال البريد. حاول مرة أخرى.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-[#0FA0CE] mb-2">استعادة كلمة المرور</h2>
          <p className="text-gray-600">أدخل بريدك الإلكتروني لإرسال رابط إعادة تعيين كلمة المرور</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="rtl"
                className="pl-10 pr-4"
              />
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-[#0EA5E9] hover:bg-[#0EA5E9]/90"
            disabled={isSending}
          >
            {isSending ? "جاري الإرسال..." : "إرسال رابط الاستعادة"}
          </Button>
          
          <div className="text-center mt-4 text-sm">
            <Button
              variant="link"
              className="p-0 text-[#0EA5E9]"
              onClick={() => navigate("/sign-in")}
              type="button"
            >
              العودة إلى تسجيل الدخول
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
