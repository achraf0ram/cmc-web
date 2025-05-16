import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await axios.post(
        `${import.meta.env.REACT_APP_API_UR || "http://localhost:8000/api"}/forgot-password`,
        { email }
      );
      toast({
        title: "تم إرسال رابط إعادة تعيين كلمة المرور",
        description: "تحقق من بريدك الإلكتروني.",
      });
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
            <Input
              id="email"
              type="email"
              placeholder="أدخل بريدك الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="rtl"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#0EA5E9] hover:bg-[#0EA5E9]/90"
            disabled={isSending}
          >
            {isSending ? "جاري الإرسال..." : "إرسال رابط الاستعادة"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;