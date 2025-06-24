
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
  full_name: z.string().min(2, "الاسم يجب أن يكون أكثر من حرفين"),
  email: z.string().email("يرجى إدخال بريد إلكتروني صحيح"),
  phone: z.string().min(10, "رقم الهاتف يجب أن يكون 10 أرقام على الأقل"),
});

const notificationsFormSchema = z.object({
  email_notifications: z.boolean().default(true),
  new_requests_notifications: z.boolean().default(true),
  request_updates_notifications: z.boolean().default(true),
});

const passwordFormSchema = z.object({
  newPassword: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  confirmPassword: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();
  const { profile, updateUser, user, userSettings, updateSettings } = useAuth();
  
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
    },
  });

  const notificationsForm = useForm<z.infer<typeof notificationsFormSchema>>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      email_notifications: true,
      new_requests_notifications: true,
      request_updates_notifications: true,
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
      profileForm.reset({
        full_name: profile.full_name || "",
        email: user.email || "",
        phone: profile.phone || "",
      });
    }
  }, [profile, user, profileForm]);

  useEffect(() => {
    if (userSettings) {
      console.log("Updating notifications form with data:", userSettings);
      notificationsForm.reset({
        email_notifications: userSettings.email_notifications,
        new_requests_notifications: userSettings.new_requests_notifications,
        request_updates_notifications: userSettings.request_updates_notifications,
      });
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
        toast.success("تم تحديث المعلومات الشخصية بنجاح");
      } else {
        throw new Error("فشل في تحديث المعلومات");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("حدث خطأ أثناء تحديث المعلومات");
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
      toast.success("تم تحديث إعدادات الإشعارات بنجاح");
    } catch (error) {
      console.error("Error updating notifications:", error);
      toast.error("حدث خطأ أثناء تحديث إعدادات الإشعارات");
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
      toast.success("تم تغيير كلمة المرور بنجاح");
      
      passwordForm.reset({
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("حدث خطأ أثناء تغيير كلمة المرور");
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
            الإعدادات
          </h1>
          {profile?.full_name && (
            <p className="text-lg text-slate-600">
              مرحباً، {profile.full_name}
            </p>
          )}
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl font-semibold text-center">
              إعدادات الحساب
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-blue-50/50">
                <TabsTrigger 
                  value="profile" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-green-600 data-[state=active]:text-white"
                >
                  المعلومات الشخصية
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-green-600 data-[state=active]:text-white"
                >
                  الإشعارات
                </TabsTrigger>
                <TabsTrigger 
                  value="password" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-green-600 data-[state=active]:text-white"
                >
                  كلمة المرور
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
                            <FormLabel className="text-slate-700 font-medium">الاسم الكامل</FormLabel>
                            <FormControl>
                              <Input {...field} className="border-blue-300 focus:border-blue-500 focus:ring-blue-200" />
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
                            <FormLabel className="text-slate-700 font-medium">البريد الإلكتروني</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" className="border-blue-300 focus:border-blue-500 focus:ring-blue-200" />
                            </FormControl>
                            <FormDescription className="text-slate-500 text-sm">
                              سيتم إرسال رسالة تأكيد إلى البريد الجديد عند التغيير
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
                            <FormLabel className="text-slate-700 font-medium">رقم الهاتف</FormLabel>
                            <FormControl>
                              <Input {...field} className="border-blue-300 focus:border-blue-500 focus:ring-blue-200" />
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
                            جاري الحفظ...
                          </>
                        ) : (
                          "حفظ التغييرات"
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
                              <FormLabel className="text-base text-slate-700 font-medium">إشعارات البريد الإلكتروني</FormLabel>
                              <FormDescription className="text-slate-600">
                                تلقي إشعارات عبر البريد الإلكتروني
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
                              <FormLabel className="text-base text-slate-700 font-medium">الطلبات الجديدة</FormLabel>
                              <FormDescription className="text-slate-600">
                                تلقي إشعارات عند تقديم طلبات جديدة
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
                              <FormLabel className="text-base text-slate-700 font-medium">تحديثات الطلبات</FormLabel>
                              <FormDescription className="text-slate-600">
                                تلقي إشعارات عند تحديث حالة الطلبات
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
                            جاري الحفظ...
                          </>
                        ) : (
                          "حفظ التغييرات"
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
                            <FormLabel className="text-slate-700 font-medium">كلمة المرور الجديدة</FormLabel>
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
                            <FormLabel className="text-slate-700 font-medium">تأكيد كلمة المرور</FormLabel>
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
                            جاري التغيير...
                          </>
                        ) : (
                          "تغيير كلمة المرور"
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
