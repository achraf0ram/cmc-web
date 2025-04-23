
import { useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: Home, name: "الرئيسية", path: "/" },
    { icon: FileText, name: "طلب شهادة عمل", path: "/work-certificate" },
    { icon: ClipboardCheck, name: "أمر مهمة", path: "/mission-order" },
    { icon: Calendar, name: "طلب إجازة", path: "/vacation-request" },
    { icon: Settings, name: "الإعدادات", path: "/settings" },
  ];

  return (
    <div className={cn(
      "h-screen bg-white shadow-md flex flex-col transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="text-sahara-700 font-bold text-2xl">صحارى</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="hover:bg-sahara-100 text-sahara-700"
        >
          {collapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </Button>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 py-4 flex flex-col gap-2">
        {menuItems.map((item) => (
          <Link to={item.path} key={item.path}>
            <Button
              variant="ghost"
              className={cn(
                "flex justify-start items-center gap-3 w-full rounded-none px-4 h-12",
                "hover:bg-sahara-100 hover:text-sahara-700"
              )}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.name}</span>}
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
          <div className="w-8 h-8 rounded-full bg-sahara-200 flex items-center justify-center">
            <User size={16} className="text-sahara-700" />
          </div>
          {!collapsed && <div className="text-sm">أحمد محمد</div>}
        </div>
        <Button
          variant="ghost"
          className={cn(
            "flex justify-start items-center gap-3 w-full rounded-none px-4 h-12",
            "hover:bg-sahara-100 hover:text-destructive text-muted-foreground",
            collapsed && "justify-center"
          )}
        >
          <LogOut size={18} />
          {!collapsed && <span>تسجيل الخروج</span>}
        </Button>
      </div>
    </div>
  );
};
