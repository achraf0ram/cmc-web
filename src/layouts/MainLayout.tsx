
import { AppHeader } from "@/components/AppHeader";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export const MainLayout = () => {
  const { language } = useLanguage();
  
  return (
    <div className="min-h-screen flex w-full relative">
      <AppSidebar />
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 min-h-screen",
        "md:mr-64"
      )}>
        <AppHeader />
        
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
