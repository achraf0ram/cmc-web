import { useState } from "react";
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
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "الاسم يجب أن يكون على الأقل حرفين" }),
  email: z.string().email({ message: "يرجى إدخال بريد إلكتروني صحيح" }),
  phone: z.string().min(10, { message: "رقم الهاتف يجب أن يكون على الأقل 10 أرقام" }).optional(),
});

const notificationsFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  newRequests: z.boolean(),
  requestUpdates: z.boolean(),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(8, { message: "كلمة المرور يجب أن تكون على الأقل 8 أحرف" }),
  newPassword: z.string().min(8, { message: "كلمة المرور يجب أن تكون على الأقل 8 أحرف" }),
  confirmPassword: z.string().min(8, { message: "كلمة المرور يجب أن تكون على الأقل 8 أحرف" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isUpdating, setIsUpdating] = useState(false);
  const { t } = useLanguage();
  const { user, profile, updateUser } = useAuth();
  
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: profile?.full_name || "",
      email: user?.email || "",
      phone: profile?.phone || "",
    },
  });

  const notificationsForm = useForm<z.infer<typeof notificationsFormSchema>>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailNotifications: true,
      newRequests: true,
      requestUpdates: true,
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    try {
      setIsUpdating(true);
      console.log("تحديث الملف الشخصي بـ:", values);
      
      if (updateUser && user) {
        const success = await updateUser({
          full_name: values.fullName,
          phone: values.phone || "",
        });
        
        if (success) {
          toast({
            title: "تم تحديث الملف الشخصي",
            description: "تم حفظ التغييرات بنجاح",
          });
        } else {
          throw new Error("فشل في تحديث الملف الشخصي");
        }
      }
    } catch (error) {
      console.error("خطأ في تحديث الملف الشخصي:", error);
      toast({
        title: "خطأ في تحديث الملف الشخصي",
        description: "حدث خطأ، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  }

  function onNotificationsSubmit(values: z.infer<typeof notificationsFormSchema>) {
    console.log(values);
    toast({
      title: "تم تحديث الإشعارات",
      description: "تم حفظ التغييرات بنجاح",
    });
  }

  function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
    console.log(values);
    toast({
      title: "تم تغيير كلمة المرور",
      description: "تم حفظ التغييرات بنجاح",
    });
    passwordForm.reset({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }

  return (
    <div className="container mx-auto py-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-5">الإعدادات</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="space-x-5 grid-cols-1 md:grid-cols-3 mb-3">
          <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          <TabsTrigger value="password">كلمة المرور</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الملف الشخصي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="text-4xl">
                    <User />
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-medium">{profile?.full_name || "ملفك الشخصي"}</h2>
              </div>
              
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={profileForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الاسم الكامل</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>البريد الإلكتروني</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                          <FormDescription>
                            البريد الإلكتروني لا يمكن تغييره
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? "جاري الحفظ..." : "حفظ التغييرات"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الإشعارات</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...notificationsForm}>
                <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <FormField
                      control={notificationsForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">الإشعارات عبر البريد الإلكتروني</FormLabel>
                            <FormDescription>
                              {t('emailNotificationsDesc')}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationsForm.control}
                      name="newRequests"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">الإشعارات عن طلبات جديدة</FormLabel>
                            <FormDescription>
                              {t('newRequestsDesc')}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationsForm.control}
                      name="requestUpdates"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">الإشعارات عن تحديثات طلبات</FormLabel>
                            <FormDescription>
                              {t('requestUpdatesDesc')}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">{t('saveChanges')}</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات كلمة المرور</CardTitle>
            </CardHeader>
            <CardContent>
              {user?.provider === 'google' ? (
                <div className="p-4 text-center">
                  <p>{t('googleAccountPassword')}</p>
                </div>
              ) : (
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    <div className="grid gap-6">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('currentPassword')}</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('newPassword')}</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
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
                            <FormLabel>{t('confirmPassword')}</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit">{t('changePassword')}</Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
