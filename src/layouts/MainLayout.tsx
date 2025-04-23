
import { AppHeader } from "@/components/AppHeader";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      
      <div className="flex-1 flex flex-col">
        <AppHeader />
        
        <main className="flex-1 bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
