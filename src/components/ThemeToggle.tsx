
import React from 'react';
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { t, language } = useLanguage();

  const handleToggleTheme = () => {
    toggleTheme();
    
    // Show toast notification when theme changes
    toast({
      title: theme === 'light' 
        ? (language === 'ar' ? 'تم التبديل إلى الوضع المظلم' : 'Mode sombre activé')
        : (language === 'ar' ? 'تم التبديل إلى الوضع المضيء' : 'Mode clair activé'),
      description: theme === 'light'
        ? (language === 'ar' ? 'تم تغيير الوضع بنجاح' : 'Le mode a bien été changé')
        : (language === 'ar' ? 'تم تغيير الوضع بنجاح' : 'Le mode a bien été changé'),
    });
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={handleToggleTheme}
      aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}
      className="rounded-full bg-background border-2 text-foreground hover:text-primary hover:bg-accent transition-colors"
    >
      {theme === 'dark' ? (
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      )}
      <span className="sr-only">
        {theme === 'dark' ? t('lightMode') : t('darkMode')}
      </span>
    </Button>
  );
};
