
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

const Settings = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Update local storage with new name
      if (user) {
        const updatedUser = { ...user, fullName };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        toast({
          title: "تم تحديث البيانات",
          description: "تم تحديث معلومات الحساب بنجاح",
        });
      }
      
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">{t('settings')}</h2>
          <p className="text-muted-foreground mt-1">
            {t('settingsDescription')}
          </p>
        </div>
        <ThemeToggle />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('profileSettings')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('fullName')}</Label>
              <Input 
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('enterFullName')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input 
                id="email"
                value={user?.email}
                disabled
                placeholder={t('email')}
              />
            </div>
            
            <Button 
              type="submit" 
              className="mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  {t('saving')}
                </>
              ) : (
                t('saveChanges')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('appearanceSettings')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('darkMode')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('darkModeDescription')}
                </p>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
