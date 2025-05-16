import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  ClipboardCheck,
  Calendar,
  Home,
  Settings,
  User,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

export const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  

  const menuItems = [
    { icon: Home, name: 'home', path: "/" },
    { icon: FileText, name: 'workCertificate', path: "/work-certificate" },
    { icon: ClipboardCheck, name: 'missionOrder', path: "/mission-order" },
    { icon: Calendar, name: 'vacationRequest', path: "/vacation-request" },
    { icon: Settings, name: 'settings', path: "/settings" },
  ];

  const handleSignOut = () => {
    logout();
    navigate("/sign-in");
  };

  const chevronIcon = language === 'ar' ? 
  (collapsed ? 
    <ChevronLeft size={18} /> : 
    <ChevronRight size={18} />) :
  (collapsed ? 
    <ChevronRight size={18} /> : 
    <ChevronLeft size={18} />);

  // Mobile toggle button that appears at the top of the screen
  const MobileToggle = () => (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsMobileOpen(!isMobileOpen)}  // Toggle mobile sidebar visibility
      className={cn(
        "fixed top-4 z-40 hover:bg-[#D3E4FD] text-[#0EA5E9]",
        language === 'ar' ? 'right-4' : 'left-4'
      )}
    >
      {/* Change icon to X when sidebar is open */}
      {isMobileOpen ? <ChevronLeft size={24} /> : <Menu size={24} />}
    </Button>
  );

  return (
    <>
      {isMobile && <MobileToggle />}
      <div 
        className={cn(
          "fixed md:static h-screen bg-white shadow-md flex flex-col transition-all duration-300 z-40",
          collapsed ? "w-20" : "w-64",
          isMobile ? (
            isMobileOpen ? "translate-x-0" : 
            language === 'ar' ? "translate-x-full" : "-translate-x-full"
          ) : "",
          language === 'ar' ? 'right-0' : 'left-0'
        )}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b h-20">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/61196920-7ed5-45d7-af8f-330e58178ad2.png" 
                alt="CMC" 
                className="h-10 w-auto"
              />
              <span className="text-[#0FA0CE] font-bold text-xl">CMC</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (isMobile) {
                setIsMobileOpen(false);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            className="hover:bg-[#D3E4FD] text-[#0EA5E9]"
          >
            {chevronIcon}
          </Button>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 py-4 flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link 
              to={item.path} 
              key={item.path}
              onClick={() => isMobile && setIsMobileOpen(false)}  // Close mobile sidebar when clicking on a menu item
            >
              <Button
                variant="ghost"
                className={cn(
                  "flex justify-start items-center gap-3 w-full rounded-none px-4 h-12",
                  "hover:bg-[#D3E4FD] hover:text-[#0EA5E9]"
                )}
              >
                <item.icon size={20} />
                {!collapsed && <span>{t(item.name)}</span>}
              </Button>
            </Link>
          ))}
        </div>
        
        {/* Footer */}
        <div className="border-t py-4 flex flex-col gap-2">
          <div className={cn(
            "flex items-center gap-3 px-4 py-2", 
            collapsed && "justify-center"
          )}>
            <div className="w-8 h-8 rounded-full bg-[#D3E4FD] flex items-center justify-center">
              <User size={16} className="text-[#0EA5E9]" />
            </div>
            {!collapsed && (
              <div className="text-sm">{user?.fullName || "user"}</div>
            )}
          </div>
          <Button
            variant="ghost"
            className={cn(
              "flex justify-start items-center gap-3 w-full rounded-none px-4 h-12",
              "hover:bg-[#FDE1D3] hover:text-red-500 text-muted-foreground",
              collapsed && "justify-center"
            )}
            onClick={handleSignOut}
          >
            <LogOut size={18} />
            {!collapsed && <span>{t('logout')}</span>}
          </Button>
        </div>
      </div>
      {/* Overlay for mobile */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};
