
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "lucide-react";

export const AppHeader = () => {
  const { language } = useLanguage();
  const { profile, user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 shadow-sm">
      <div className="flex items-center space-x-4 space-x-reverse">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <span className="text-sm font-medium text-slate-700">
            {profile?.full_name || user?.email || "مستخدم"}
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4 space-x-reverse">
        <LanguageSwitcher />
      </div>
    </header>
  );
};
