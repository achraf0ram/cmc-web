
import { AppHeader } from "@/components/AppHeader";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export const MainLayout = () => {
  const { language } = useLanguage();
  
  return (
    <div className="min-h-screen flex relative">
      <AppSidebar />
      
      <div className={cn(
        "flex-1 flex flex-col",
        language === 'ar' ? 'mr-0 md:mr-64' : 'ml-0 md:ml-64'
      )}>
        <AppHeader />
        
        <main className="flex-1 bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
