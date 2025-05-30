
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Settings as SettingsIcon, User, Lock, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const profileSchema = z.object({
  fullName: z.string().min(3, { message: "يرجى إدخال الاسم الكامل" }),
  email: z.string().email({ message: "يرجى إدخال بريد إلكتروني صحيح" }),
  phone: z.string().min(10, { message: "يرجى إدخال رقم هاتف صحيح" }),
  department: z.string().min(2, { message: "يرجى إدخال القسم" }),
  position: z.string().min(2, { message: "يرجى إدخال المنصب" }),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: "يرجى إدخال كلمة المرور الحالية" }),
  newPassword: z.string().min(6, { message: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" }),
  confirmPassword: z.string().min(1, { message: "يرجى تأكيد كلمة المرور الجديدة" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

const Settings = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("profile");
  const [isUpdated, setIsUpdated] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
  });
  const { toast } = useToast();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "أحمد محمد العلي",
      email: "ahmed.ali@ofppt.ma",
      phone: "+212612345678",
      department: "الموارد البشرية",
      position: "مدير",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      console.log("Profile data:", data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsUpdated(true);
      toast({
        title: "تم الحفظ",
        description: "تم تحديث معلومات الملف الشخصي بنجاح",
        variant: "default",
        className: "bg-green-50 border-green-200",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث المعلومات",
        variant: "destructive",
      });
    }
  };

  const handlePasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    try {
      console.log("Password change data:", data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      passwordForm.reset();
      toast({
        title: "تم التحديث",
        description: "تم تغيير كلمة المرور بنجاح",
        variant: "default",
        className: "bg-green-50 border-green-200",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تغيير كلمة المرور",
        variant: "destructive",
      });
    }
  };

  const handleNotificationChange = (type: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [type]: value
    }));
    
    toast({
      title: "تم التحديث",
      description: "تم تحديث إعدادات الإشعارات",
      variant: "default",
      className: "bg-green-50 border-green-200",
    });
  };

  const tabs = [
    { id: "profile", label: "الملف الشخصي", icon: User },
    { id: "password", label: "كلمة المرور", icon: Lock },
    { id: "notifications", label: "الإشعارات", icon: Bell },
  ];

  return (
    <div className="min-h-screen cmc-page-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-cmc-blue-light to-cmc-green-light rounded-full mb-4 shadow-lg">
            <SettingsIcon className="w-6 h-6 md:w-8 md:h-8 text-cmc-blue" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">الإعدادات</h1>
          <p className="text-slate-600 text-sm md:text-base">إدارة معلومات الحساب والإعدادات</p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex justify-center mb-6 md:mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 space-x-reverse px-4 md:px-6 py-2 md:py-3 rounded-md transition-all duration-200 text-sm md:text-base ${
                  activeTab === tab.id
                    ? "cmc-gradient text-white shadow-md"
                    : "text-slate-600 hover:bg-cmc-blue-light/30"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <Card className="cmc-card">
          <CardHeader className="cmc-gradient text-white rounded-t-lg p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl font-semibold text-center">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-8">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <FormField control={profileForm.control} name="fullName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">الاسم الكامل</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={profileForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">البريد الإلكتروني</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email"
                            className="cmc-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={profileForm.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="tel"
                            className="cmc-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={profileForm.control} name="department" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">القسم</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={profileForm.control} name="position" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-slate-700 font-medium">المنصب</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="cmc-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="flex justify-center pt-4 md:pt-6">
                    <Button 
                      type="submit" 
                      className="cmc-button-primary px-8 md:px-12 py-2 md:py-3 rounded-lg text-sm md:text-base"
                    >
                      حفظ التغييرات
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4 md:space-y-6">
                  <div className="max-w-md mx-auto space-y-4 md:space-y-6">
                    <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">كلمة المرور الحالية</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="password"
                            className="cmc-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">كلمة المرور الجديدة</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="password"
                            className="cmc-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">تأكيد كلمة المرور الجديدة</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="password"
                            className="cmc-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="flex justify-center pt-4 md:pt-6">
                    <Button 
                      type="submit" 
                      className="cmc-button-primary px-8 md:px-12 py-2 md:py-3 rounded-lg text-sm md:text-base"
                    >
                      تغيير كلمة المرور
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-4 md:space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cmc-blue-light/20 to-cmc-green-light/20 rounded-lg border border-cmc-blue/20">
                    <div>
                      <h3 className="font-medium text-slate-800">إشعارات البريد الإلكتروني</h3>
                      <p className="text-sm text-slate-600">تلقي إشعارات حول الطلبات والتحديثات عبر البريد الإلكتروني</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cmc-blue-light/20 to-cmc-green-light/20 rounded-lg border border-cmc-blue/20">
                    <div>
                      <h3 className="font-medium text-slate-800">الإشعارات الفورية</h3>
                      <p className="text-sm text-slate-600">تلقي إشعارات فورية في المتصفح</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => handleNotificationChange("push", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cmc-blue-light/20 to-cmc-green-light/20 rounded-lg border border-cmc-blue/20">
                    <div>
                      <h3 className="font-medium text-slate-800">إشعارات الرسائل النصية</h3>
                      <p className="text-sm text-slate-600">تلقي إشعارات مهمة عبر الرسائل النصية</p>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) => handleNotificationChange("sms", checked)}
                    />
                  </div>
                </div>

                <div className="pt-4 md:pt-6 border-t border-slate-200">
                  <h3 className="font-medium text-slate-800 mb-3">حالة الإشعارات</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={notifications.email ? "default" : "secondary"} className={notifications.email ? "bg-cmc-green text-white" : ""}>
                      البريد الإلكتروني: {notifications.email ? "مفعل" : "معطل"}
                    </Badge>
                    <Badge variant={notifications.push ? "default" : "secondary"} className={notifications.push ? "bg-cmc-green text-white" : ""}>
                      الإشعارات الفورية: {notifications.push ? "مفعل" : "معطل"}
                    </Badge>
                    <Badge variant={notifications.sms ? "default" : "secondary"} className={notifications.sms ? "bg-cmc-green text-white" : ""}>
                      الرسائل النصية: {notifications.sms ? "مفعل" : "معطل"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
