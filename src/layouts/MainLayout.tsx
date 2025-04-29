
import { AppHeader } from "@/components/AppHeader";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export const MainLayout = () => {
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex relative">
      <AppSidebar />
      
      <div className={cn(
        "flex-1 flex flex-col",
        !isMobile && (language === 'ar' ? 'mr-0 md:mr-64' : 'ml-0 md:ml-64'),
        "pt-16 md:pt-0" // Add padding top for mobile menu button
      )}>
        {/* White top bar for desktop */}
        <div className={cn(
          "hidden md:block h-[180px] bg-white w-full border-b",
          "absolute top-0 left-0 right-0 z-10"
        )} />
        
        <AppHeader />
        
        <main className="flex-1 bg-slate-50 p-6 relative z-20 md:mt-[180px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
