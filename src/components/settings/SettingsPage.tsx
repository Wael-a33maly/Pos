'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Settings as SettingsIcon,
  Store,
  DollarSign,
  Printer,
  Globe,
  Palette,
  Bell,
  Shield,
  Database,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/store';

export function SettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currency, setCurrency, decimalPlaces, setDecimalPlaces, theme, setTheme } = useAppStore();
  
  // Get tab from URL or default to 'general'
  const activeTab = useMemo(() => {
    const tab = searchParams.get('tab');
    return tab && ['general', 'company', 'currency', 'invoice', 'pos', 'notifications'].includes(tab) 
      ? tab 
      : 'general';
  }, [searchParams]);
  
  // Handle tab change - update URL
  const handleTabChange = (tab: string) => {
    router.push(`/?page=settings&tab=${tab}`);
  };
  
  const [settings, setSettings] = useState({
    // General
    companyName: 'شركة نقاط البيع',
    companyNameAr: 'نقاط البيع للتقنية',
    companyPhone: '920000000',
    companyEmail: 'info@pos.com',
    companyAddress: 'الرياض، المملكة العربية السعودية',
    taxNumber: '300000000000003',
    
    // Currency
    defaultCurrency: 'SAR',
    decimalPlaces: 2,
    
    // Invoice
    invoicePrefix: 'INV',
    invoiceStartNumber: 1,
    showTaxOnInvoice: true,
    showLogoOnInvoice: true,
    invoiceNotes: 'شكراً لتعاملكم معنا',
    
    // POS
    defaultPaymentMethod: 'cash',
    askForCustomer: false,
    printAfterSale: true,
    soundEnabled: true,
    
    // Notifications
    lowStockAlert: true,
    lowStockThreshold: 5,
    dailyReportEmail: true,
    reportEmail: '',
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">الإعدادات</h1>
          <p className="text-muted-foreground">إعدادات النظام العامة</p>
        </div>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          حفظ الإعدادات
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto">
          <TabsTrigger value="general" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            عام
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <Store className="h-4 w-4" />
            الشركة
          </TabsTrigger>
          <TabsTrigger value="currency" className="gap-2">
            <DollarSign className="h-4 w-4" />
            العملة
          </TabsTrigger>
          <TabsTrigger value="invoice" className="gap-2">
            <Printer className="h-4 w-4" />
            الفواتير
          </TabsTrigger>
          <TabsTrigger value="pos" className="gap-2">
            <Globe className="h-4 w-4" />
            نقطة البيع
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            التنبيهات
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-20rem)]">
          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>الإعدادات العامة</CardTitle>
                <CardDescription>إعدادات النظام الأساسية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>اللغة الافتراضية</Label>
                    <Select defaultValue="ar">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>المنطقة الزمنية</Label>
                    <Select defaultValue="asia-riyadh">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asia-riyadh">الرياض (GMT+3)</SelectItem>
                        <SelectItem value="asia-dubai">دبي (GMT+4)</SelectItem>
                        <SelectItem value="africa-cairo">القاهرة (GMT+2)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>تاريخ البدء</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label>سمة الواجهة</Label>
                    <Select value={theme} onValueChange={(v) => setTheme(v as 'light' | 'dark' | 'system')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">فاتح</SelectItem>
                        <SelectItem value="dark">داكن</SelectItem>
                        <SelectItem value="system">تلقائي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Settings */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>معلومات الشركة</CardTitle>
                <CardDescription>البيانات الأساسية للشركة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>اسم الشركة (عربي)</Label>
                    <Input 
                      value={settings.companyNameAr}
                      onChange={(e) => setSettings({...settings, companyNameAr: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>اسم الشركة (إنجليزي)</Label>
                    <Input 
                      value={settings.companyName}
                      onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>رقم الهاتف</Label>
                    <Input 
                      value={settings.companyPhone}
                      onChange={(e) => setSettings({...settings, companyPhone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>البريد الإلكتروني</Label>
                    <Input 
                      type="email"
                      value={settings.companyEmail}
                      onChange={(e) => setSettings({...settings, companyEmail: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>الرقم الضريبي</Label>
                    <Input 
                      value={settings.taxNumber}
                      onChange={(e) => setSettings({...settings, taxNumber: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>العنوان</Label>
                    <Textarea 
                      value={settings.companyAddress}
                      onChange={(e) => setSettings({...settings, companyAddress: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Currency Settings */}
          <TabsContent value="currency">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات العملة</CardTitle>
                <CardDescription>تحديد العملة وطريقة عرض الأرقام</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>العملة الافتراضية</Label>
                    <Select 
                      value={settings.defaultCurrency}
                      onValueChange={(v) => setSettings({...settings, defaultCurrency: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                        <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                        <SelectItem value="EGP">جنيه مصري (EGP)</SelectItem>
                        <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>عدد الخانات العشرية</Label>
                    <Select 
                      value={settings.decimalPlaces.toString()}
                      onValueChange={(v) => setSettings({...settings, decimalPlaces: parseInt(v)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">طرق الدفع المتاحة</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">النقد</p>
                        <p className="text-sm text-muted-foreground">الدفع النقدي</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">بطاقة ائتمان</p>
                        <p className="text-sm text-muted-foreground">بطاقات فيزا/ماستركارد</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">كي نت</p>
                        <p className="text-sm text-muted-foreground">الدفع عبر كي نت</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">الدفع المتعدد</p>
                        <p className="text-sm text-muted-foreground">أكثر من طريقة دفع</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoice Settings */}
          <TabsContent value="invoice">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الفواتير</CardTitle>
                <CardDescription>تخصيص شكل ومحتوى الفواتير</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>بادئة رقم الفاتورة</Label>
                    <Input 
                      value={settings.invoicePrefix}
                      onChange={(e) => setSettings({...settings, invoicePrefix: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>رقم البداية</Label>
                    <Input 
                      type="number"
                      value={settings.invoiceStartNumber}
                      onChange={(e) => setSettings({...settings, invoiceStartNumber: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">إظهار الضريبة</p>
                      <p className="text-sm text-muted-foreground">عرض قيمة الضريبة على الفاتورة</p>
                    </div>
                    <Switch 
                      checked={settings.showTaxOnInvoice}
                      onCheckedChange={(v) => setSettings({...settings, showTaxOnInvoice: v})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">إظهار الشعار</p>
                      <p className="text-sm text-muted-foreground">عرض شعار الشركة على الفاتورة</p>
                    </div>
                    <Switch 
                      checked={settings.showLogoOnInvoice}
                      onCheckedChange={(v) => setSettings({...settings, showLogoOnInvoice: v})}
                    />
                  </div>
                </div>

                <div>
                  <Label>ملاحظات الفاتورة</Label>
                  <Textarea 
                    value={settings.invoiceNotes}
                    onChange={(e) => setSettings({...settings, invoiceNotes: e.target.value})}
                    placeholder="ملاحظات تظهر في نهاية الفاتورة"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* POS Settings */}
          <TabsContent value="pos">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات نقطة البيع</CardTitle>
                <CardDescription>تخصيص تجربة نقطة البيع</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">طلب العميل</p>
                      <p className="text-sm text-muted-foreground">طلب اختيار العميل قبل كل عملية</p>
                    </div>
                    <Switch 
                      checked={settings.askForCustomer}
                      onCheckedChange={(v) => setSettings({...settings, askForCustomer: v})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">طباعة تلقائية</p>
                      <p className="text-sm text-muted-foreground">طباعة الفاتورة تلقائياً بعد البيع</p>
                    </div>
                    <Switch 
                      checked={settings.printAfterSale}
                      onCheckedChange={(v) => setSettings({...settings, printAfterSale: v})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">تفعيل الصوت</p>
                      <p className="text-sm text-muted-foreground">تشغيل أصوات التنبيه</p>
                    </div>
                    <Switch 
                      checked={settings.soundEnabled}
                      onCheckedChange={(v) => setSettings({...settings, soundEnabled: v})}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>طريقة الدفع الافتراضية</Label>
                  <Select 
                    value={settings.defaultPaymentMethod}
                    onValueChange={(v) => setSettings({...settings, defaultPaymentMethod: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">نقداً</SelectItem>
                      <SelectItem value="card">بطاقة</SelectItem>
                      <SelectItem value="mobile">كي نت</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات التنبيهات</CardTitle>
                <CardDescription>إدارة التنبيهات والإشعارات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">تنبيه المخزون المنخفض</p>
                      <p className="text-sm text-muted-foreground">إرسال تنبيه عند انخفاض المخزون</p>
                    </div>
                    <Switch 
                      checked={settings.lowStockAlert}
                      onCheckedChange={(v) => setSettings({...settings, lowStockAlert: v})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">التقرير اليومي</p>
                      <p className="text-sm text-muted-foreground">إرسال تقرير يومي عبر البريد</p>
                    </div>
                    <Switch 
                      checked={settings.dailyReportEmail}
                      onCheckedChange={(v) => setSettings({...settings, dailyReportEmail: v})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>حد التنبيه للمخزون المنخفض</Label>
                    <Input 
                      type="number"
                      value={settings.lowStockThreshold}
                      onChange={(e) => setSettings({...settings, lowStockThreshold: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>بريد استلام التقارير</Label>
                    <Input 
                      type="email"
                      value={settings.reportEmail}
                      onChange={(e) => setSettings({...settings, reportEmail: e.target.value})}
                      placeholder="reports@company.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
