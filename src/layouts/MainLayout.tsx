
import { AppHeader } from "@/components/AppHeader";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export const MainLayout = () => {
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex w-full relative bg-gradient-to-br from-blue-50 to-green-50">
      <AppSidebar />
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        "pt-16 md:pt-0"
      )}>
        <div className="flex items-center gap-2 p-2 md:hidden">
          <SidebarTrigger />
        </div>
        
        <AppHeader />
        
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
