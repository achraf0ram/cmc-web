
import { Search, Bell, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const AppHeader = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const handleAIClick = () => {
    toast({
      title: t('aiAssistant'),
      description: t('askAI'),
    });
  };
  
  return (
    <header className={cn(
      "bg-white border-b py-2 px-6 flex items-center justify-between",
      "relative z-20 h-20"
    )}>
      <div className="flex-1">
        <div className="relative w-full max-w-xs">
          <Search className="absolute right-5 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder={t('search')}
            className="pl-4 pr-10 bg-slate-50 border-slate-200"
          /> 
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAIClick}
          className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
        >
          <Bot size={16} />
          {!isMobile && <span>{t('ai')}</span>}
        </Button>
        
        <LanguageSwitcher />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={18} />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-white">
            <div className="p-4 border-b">
              <h4 className="font-semibold">{t('notifications')}</h4>
            </div>
            <DropdownMenuItem className="p-4 cursor-pointer hover:bg-slate-50">
              <div className="flex flex-col gap-1">
                <span className="font-medium">{t('approvedLeaveRequest')}</span>
                <span className="text-xs text-muted-foreground">{t('hoursAgo').replace('{hours}', '2')}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-4 cursor-pointer hover:bg-slate-50">
              <div className="flex flex-col gap-1">
                <span className="font-medium">{t('workCertificateIssued')}</span>
                <span className="text-xs text-muted-foreground">{t('hoursAgo').replace('{hours}', '3')}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-4 cursor-pointer hover:bg-slate-50">
              <div className="flex flex-col gap-1">
                <span className="font-medium">{t('updatePersonalDataReminder')}</span>
                <span className="text-xs text-muted-foreground">{t('dayAgo').replace('{days}', '1')}</span>
              </div>
            </DropdownMenuItem>
            <div className="p-2 text-center border-t">
              <Button variant="link" size="sm">
                {t('viewAll')}
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
