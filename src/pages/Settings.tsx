import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const profileFormSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
});

const notificationsFormSchema = z.object({
  email_notifications: z.boolean().default(true),
  new_requests_notifications: z.boolean().default(true),
  request_updates_notifications: z.boolean().default(true),
});

const passwordFormSchema = z.object({
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const { t, language } = useLanguage();
  const { profile, updateUser, user, userSettings, updateSettings } = useAuth();
  
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      email: user?.email || "",
      phone: profile?.phone || "",
    },
  });

  const notificationsForm = useForm<z.infer<typeof notificationsFormSchema>>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      email_notifications: userSettings?.email_notifications ?? true,
      new_requests_notifications: userSettings?.new_requests_notifications ?? true,
      request_updates_notifications: userSettings?.request_updates_notifications ?? true,
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update form values when profile or settings change
  useEffect(() => {
    if (profile && user) {
      console.log("Updating profile form with data:", profile);
      const formData = {
        full_name: profile.full_name || "",
        email: user.email || "",
        phone: profile.phone || "",
      };
      console.log("Form data being set:", formData);
      profileForm.reset(formData);
    }
  }, [profile, user, profileForm]);

  useEffect(() => {
    if (userSettings) {
      console.log("Updating notifications form with data:", userSettings);
      const notificationData = {
        email_notifications: userSettings.email_notifications,
        new_requests_notifications: userSettings.new_requests_notifications,
        request_updates_notifications: userSettings.request_updates_notifications,
      };
      console.log("Notification data being set:", notificationData);
      notificationsForm.reset(notificationData);
    }
  }, [userSettings, notificationsForm]);

  async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    try {
      setIsLoading(true);
      console.log("Submitting profile update:", values);
      
      // Update email if changed
      if (values.email !== user?.email) {
        console.log("Updating email...");
        const { error: emailError } = await supabase.auth.updateUser({
          email: values.email
        });

        if (emailError) {
          console.error("Email update error:", emailError);
          throw emailError;
        }
      }

      // Update profile data
      console.log("Updating profile...");
      const success = await updateUser({
        id: user?.id || "",
        full_name: values.full_name,
        phone: values.phone,
        email: values.email,
        created_at: "",
        updated_at: "",
      });

      if (success) {
        console.log("Profile updated successfully");
        toast.success(language === 'ar' ? "تم تحديث المعلومات الشخصية بنجاح" : "Profil mis à jour avec succès");
      } else {
        throw new Error("فشل في تحديث المعلومات");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(language === 'ar' ? "حدث خطأ أثناء تحديث المعلومات" : "Erreur lors de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  }

  async function onNotificationsSubmit(values: z.infer<typeof notificationsFormSchema>) {
    try {
      setIsLoading(true);
      console.log("Submitting notifications update:", values);
      
      if (!userSettings) {
        console.log("Creating new user settings...");
        // إنشاء إعدادات جديدة إذا لم تكن موجودة
        const { data, error } = await supabase
          .from('user_settings')
          .insert([
            {
              user_id: user?.id || "",
              email_notifications: values.email_notifications,
              new_requests_notifications: values.new_requests_notifications,
              request_updates_notifications: values.request_updates_notifications,
              language: "ar",
              theme: "light",
            }
          ])
          .select()
          .single();

        if (error) {
          console.error("Error creating settings:", error);
          throw error;
        }
        
        console.log("Settings created successfully:", data);
      } else {
        console.log("Updating existing user settings...");
        const success = await updateSettings({
          id: userSettings.id,
          user_id: user?.id || "",
          email_notifications: values.email_notifications,
          new_requests_notifications: values.new_requests_notifications,
          request_updates_notifications: values.request_updates_notifications,
          language: userSettings.language || "ar",
          theme: userSettings.theme || "light",
          created_at: userSettings.created_at || "",
          updated_at: userSettings.updated_at || "",
        });

        if (!success) {
          throw new Error("فشل في تحديث الإعدادات");
        }
      }

      console.log("Notifications updated successfully");
      toast.success(language === 'ar' ? "تم تحديث إعدادات الإشعارات بنجاح" : "Paramètres de notification mis à jour avec succès");
    } catch (error) {
      console.error("Error updating notifications:", error);
      toast.error(language === 'ar' ? "حدث خطأ أثناء تحديث إعدادات الإشعارات" : "Erreur lors de la mise à jour des notifications");
    } finally {
      setIsLoading(false);
    }
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
    try {
      setIsLoading(true);
      console.log("Updating password...");
      
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword
      });

      if (error) {
        console.error("Password update error:", error);
        throw error;
      }

      console.log("Password updated successfully");
      toast.success(language === 'ar' ? "تم تغيير كلمة المرور بنجاح" : "Mot de passe modifié avec succès");
      
      passwordForm.reset({
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(language === 'ar' ? "حدث خطأ أثناء تغيير كلمة المرور" : "Erreur lors du changement de mot de passe");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            {language === 'ar' ? 'الإعدادات' : 'Paramètres'}
          </h1>
          {profile?.full_name && (
            <p className="text-lg text-slate-600">
              {language === 'ar' ? `مرحباً، ${profile.full_name}` : `Bonjour, ${profile.full_name}`}
            </p>
          )}
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl font-semibold text-center">
              {language === 'ar' ? 'إعدادات الحساب' : 'Paramètres du compte'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-blue-50/50">
                <TabsTrigger 
                  value="profile" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-green-600 data-[state=active]:text-white"
                >
                  {language === 'ar' ? 'المعلومات الشخصية' : 'Informations personnelles'}
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-green-600 data-[state=active]:text-white"
                >
                  {language === 'ar' ? 'الإشعارات' : 'Notifications'}
                </TabsTrigger>
                <TabsTrigger 
                  value="password" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-green-600 data-[state=active]:text-white"
                >
                  {language === 'ar' ? 'كلمة المرور' : 'Mot de passe'}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-1">
                      <FormField
                        control={profileForm.control}
                        name="full_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">
                              {language === 'ar' ? 'الاسم الكامل' : 'Nom complet'}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                value={field.value || profile?.full_name || ""}
                                placeholder={language === 'ar' ? 'أدخل الاسم الكامل' : 'Entrez le nom complet'}
                                className="border-blue-300 focus:border-blue-500 focus:ring-blue-200" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">
                              {language === 'ar' ? 'البريد الإلكتروني' : 'Adresse e-mail'}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                value={field.value || user?.email || ""}
                                type="email" 
                                placeholder={language === 'ar' ? 'أدخل البريد الإلكتروني' : 'Entrez l\'adresse e-mail'}
                                className="border-blue-300 focus:border-blue-500 focus:ring-blue-200" 
                              />
                            </FormControl>
                            <FormDescription className="text-slate-500 text-sm">
                              {language === 'ar' ? 'سيتم إرسال رسالة تأكيد إلى البريد الجديد عند التغيير' : 'Un e-mail de confirmation sera envoyé lors du changement'}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">
                              {language === 'ar' ? 'رقم الهاتف' : 'Numéro de téléphone'}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                value={field.value || profile?.phone || ""}
                                placeholder={language === 'ar' ? 'أدخل رقم الهاتف' : 'Entrez le numéro de téléphone'}
                                className="border-blue-300 focus:border-blue-500 focus:ring-blue-200" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {language === 'ar' ? 'جاري الحفظ...' : 'Enregistrement...'}
                          </>
                        ) : (
                          language === 'ar' ? 'حفظ التغييرات' : 'Enregistrer les modifications'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="notifications">
                <Form {...notificationsForm}>
                  <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={notificationsForm.control}
                        name="email_notifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-blue-200 p-4 bg-white/50">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base text-slate-700 font-medium">
                                {language === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Notifications par e-mail'}
                              </FormLabel>
                              <FormDescription className="text-slate-600">
                                {language === 'ar' ? 'تلقي إشعارات عبر البريد الإلكتروني' : 'Recevoir des notifications par e-mail'}
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-green-600"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationsForm.control}
                        name="new_requests_notifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-blue-200 p-4 bg-white/50">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base text-slate-700 font-medium">
                                {language === 'ar' ? 'الطلبات الجديدة' : 'Nouvelles demandes'}
                              </FormLabel>
                              <FormDescription className="text-slate-600">
                                {language === 'ar' ? 'تلقي إشعارات عند تقديم طلبات جديدة' : 'Recevoir des notifications pour les nouvelles demandes'}
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-green-600"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationsForm.control}
                        name="request_updates_notifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-blue-200 p-4 bg-white/50">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base text-slate-700 font-medium">
                                {language === 'ar' ? 'تحديثات الطلبات' : 'Mises à jour des demandes'}
                              </FormLabel>
                              <FormDescription className="text-slate-600">
                                {language === 'ar' ? 'تلقي إشعارات عند تحديث حالة الطلبات' : 'Recevoir des notifications lors des mises à jour'}
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-green-600"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {language === 'ar' ? 'جاري الحفظ...' : 'Enregistrement...'}
                          </>
                        ) : (
                          language === 'ar' ? 'حفظ التغييرات' : 'Enregistrer les modifications'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="password">
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    <div className="grid gap-6">
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">
                              {language === 'ar' ? 'كلمة المرور الجديدة' : 'Nouveau mot de passe'}
                            </FormLabel>
                            <FormControl>
                              <Input type="password" {...field} className="border-blue-300 focus:border-blue-500 focus:ring-blue-200" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">
                              {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirmer le mot de passe'}
                            </FormLabel>
                            <FormControl>
                              <Input type="password" {...field} className="border-blue-300 focus:border-blue-500 focus:ring-blue-200" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {language === 'ar' ? 'جاري التغيير...' : 'Modification...'}
                          </>
                        ) : (
                          language === 'ar' ? 'تغيير كلمة المرور' : 'Changer le mot de passe'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
