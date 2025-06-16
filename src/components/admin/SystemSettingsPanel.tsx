
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Settings, Mail, Calendar, Building } from "lucide-react";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { Badge } from "@/components/ui/badge";

export const SystemSettingsPanel = () => {
  const { settings, isLoading, updateSetting } = useSystemSettings();
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});

  const getSettingsByCategory = (category: string) => {
    return settings?.filter(s => s.category === category) || [];
  };

  const handleSaveSetting = (key: string, value: any) => {
    updateSetting.mutate({ key, value });
  };

  const getSettingValue = (key: string) => {
    const setting = settings?.find(s => s.key === key);
    return localSettings[key] !== undefined ? localSettings[key] : setting?.value;
  };

  const handleLocalChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            إعدادات النظام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                عام
              </TabsTrigger>
              <TabsTrigger value="vacation" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                الإجازات
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                الإشعارات
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                متقدم
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">الإعدادات العامة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>اسم الشركة</Label>
                    <Input
                      value={getSettingValue('company_name')?.replace(/"/g, '') || ''}
                      onChange={(e) => handleLocalChange('company_name', `"${e.target.value}"`)}
                      placeholder="أدخل اسم الشركة"
                    />
                    <Button 
                      size="sm" 
                      className="mt-2"
                      onClick={() => handleSaveSetting('company_name', getSettingValue('company_name'))}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      حفظ
                    </Button>
                  </div>

                  <div>
                    <Label>ساعات العمل اليومية</Label>
                    <Input
                      type="number"
                      value={getSettingValue('working_hours_per_day') || ''}
                      onChange={(e) => handleLocalChange('working_hours_per_day', parseInt(e.target.value))}
                      placeholder="8"
                    />
                    <Button 
                      size="sm" 
                      className="mt-2"
                      onClick={() => handleSaveSetting('working_hours_per_day', getSettingValue('working_hours_per_day'))}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      حفظ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vacation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">إعدادات الإجازات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>الحد الأقصى لأيام الإجازة السنوية</Label>
                    <Input
                      type="number"
                      value={getSettingValue('max_vacation_days') || ''}
                      onChange={(e) => handleLocalChange('max_vacation_days', parseInt(e.target.value))}
                      placeholder="30"
                    />
                    <Button 
                      size="sm" 
                      className="mt-2"
                      onClick={() => handleSaveSetting('max_vacation_days', getSettingValue('max_vacation_days'))}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      حفظ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">إعدادات الإشعارات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>تفعيل الإشعارات عبر البريد الإلكتروني</Label>
                      <p className="text-sm text-gray-500">إرسال إشعارات للمستخدمين عبر البريد الإلكتروني</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={getSettingValue('email_notifications') === true}
                        onCheckedChange={(checked) => {
                          handleLocalChange('email_notifications', checked);
                          handleSaveSetting('email_notifications', checked);
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">الإعدادات المتقدمة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {settings?.map((setting) => (
                      <div key={setting.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <strong>{setting.key}</strong>
                            <Badge variant="outline">{setting.category}</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{setting.description}</p>
                        <div className="text-sm bg-gray-50 p-2 rounded">
                          القيمة: {JSON.stringify(setting.value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
