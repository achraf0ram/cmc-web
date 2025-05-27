
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Home, 
  FileText, 
  Plane, 
  Calendar,
  Settings,
  LogOut,
  User
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

export const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { logout, profile } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const menuItems = [
    {
      title: t('dashboard'),
      href: "/",
      icon: Home,
    },
    {
      title: t('workCertificate'),
      href: "/work-certificate",
      icon: FileText,
    },
    {
      title: t('missionOrder'),
      href: "/mission-order", 
      icon: Plane,
    },
    {
      title: t('vacationRequest'),
      href: "/vacation-request",
      icon: Calendar,
    },
    {
      title: t('settings'),
      href: "/settings",
      icon: Settings,
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={cn(
      "flex h-full w-64 flex-col bg-white border-r",
      isMobile && "fixed inset-y-0 z-50 w-64",
      language === 'ar' ? "right-0" : "left-0"
    )}>
      <div className="flex h-20 items-center justify-center border-b px-6">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/61196920-7ed5-45d7-af8f-330e58178ad2.png" 
            alt="CMC" 
            className="h-10 w-auto" 
          />
          <div className="text-right">
            <h2 className="text-xl font-bold text-[#0FA0CE]">CMC</h2>
            <p className="text-xs text-gray-600">منصة الموارد البشرية</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  language === 'ar' && "flex-row-reverse"
                )}
                onClick={() => navigate(item.href)}
              >
                <Icon size={18} />
                {item.title}
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        {profile && (
          <div className="flex items-center gap-3 mb-3 p-2 bg-slate-50 rounded-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0FA0CE] text-white text-sm">
              <User size={16} />
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm font-medium">{profile.full_name}</p>
              <p className="text-xs text-gray-500">{profile.email}</p>
            </div>
          </div>
        )}
        
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-11 text-red-600 border-red-200 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );
};
