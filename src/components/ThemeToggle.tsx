
import React from 'react';
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}
    >
      {theme === 'dark' ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
};
