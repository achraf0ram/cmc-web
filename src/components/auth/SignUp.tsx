
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, User, Lock, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export const SignUp = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await signup(fullName, email, password);
      if (success) {
        toast({
          title: language === 'ar' ? "تم إنشاء الحساب بنجاح" : "Compte créé avec succès",
          description: language === 'ar' ? "مرحباً بك في منصة CMC" : "Bienvenue sur la plateforme CMC",
        });
        navigate("/");
      } else {
        toast({
          variant: "destructive",
          title: language === 'ar' ? "خطأ في إنشاء الحساب" : "Erreur lors de la création du compte",
          description: language === 'ar' ? "يرجى التحقق من البيانات المدخلة" : "Veuillez vérifier les informations saisies",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: language === 'ar' ? "خطأ في إنشاء الحساب" : "Erreur lors de la création du compte",
        description: language === 'ar'
          ? "حدث خطأ أثناء محاولة إنشاء الحساب. يرجى المحاولة مرة أخرى"
          : "Une erreur s'est produite lors de la tentative de création du compte. Veuillez réessayer",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <img 
            src="/lovable-uploads/61196920-7ed5-45d7-af8f-330e58178ad2.png" 
            alt="CMC" 
            className="mx-auto h-16 w-auto mb-4" 
          />
          <h2 className="text-2xl font-bold text-[#0FA0CE]">CMC</h2>
          <p className="text-gray-600 mt-2">
            {language === 'ar'
              ? "منصة إدارة طلبات الموارد البشرية"
              : "Plateforme de gestion des demandes RH"}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">
              {language === 'ar' ? "الاسم الكامل" : "Nom complet"}
            </Label>
            <div className="relative">
              <Input
                id="fullName"
                type="text"
                placeholder={language === 'ar' ? "أدخل الاسم الكامل" : "Entrez votre nom complet"}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={language === 'ar' ? "pl-10 pr-4" : "pl-4 pr-10"}
                required
                dir={language === 'ar' ? "rtl" : "ltr"}
              />
              <User className={`absolute top-3 h-4 w-4 text-muted-foreground ${language === 'ar' ? "left-3" : "right-3"}`} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">
              {language === 'ar' ? "البريد الإلكتروني" : "Email"}
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder={language === 'ar' ? "أدخل البريد الإلكتروني" : "Entrez votre email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={language === 'ar' ? "pl-10 pr-4" : "pl-4 pr-10"}
                required
                dir={language === 'ar' ? "rtl" : "ltr"}
              />
              <Mail className={`absolute top-3 h-4 w-4 text-muted-foreground ${language === 'ar' ? "left-3" : "right-3"}`} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">
              {language === 'ar' ? "كلمة المرور" : "Mot de passe"}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder={language === 'ar' ? "أدخل كلمة المرور" : "Entrez votre mot de passe"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={language === 'ar' ? "pl-10 pr-4" : "pl-4 pr-10"}
                required
                dir={language === 'ar' ? "rtl" : "ltr"}
              />
              <Lock className={`absolute top-3 h-4 w-4 text-muted-foreground ${language === 'ar' ? "left-3" : "right-3"}`} />
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
                {language === 'ar' ? "جاري إنشاء الحساب..." : "Création du compte en cours..."}
              </>
            ) : (
              language === 'ar' ? "إنشاء حساب" : "Créer un compte"
            )}
          </Button>
          
          <div className="text-center mt-4 text-sm">
            {language === 'ar' ? "لديك حساب بالفعل؟" : "Vous avez déjà un compte?"}{" "}
            <Button
              variant="link"
              className="p-0 text-[#0EA5E9]"
              onClick={() => navigate("/sign-in")}
            >
              {language === 'ar' ? "تسجيل الدخول" : "Se connecter"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
