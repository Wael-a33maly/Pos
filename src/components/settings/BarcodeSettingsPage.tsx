'use client';

import { useState } from 'react';
import {
  QrCode,
  Barcode,
  Save,
  Eye,
  RotateCcw,
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
import {
  Slider
} from '@/components/ui/slider';

export function BarcodeSettingsPage() {
  const [settings, setSettings] = useState({
    // Barcode Type
    barcodeType: 'CODE128',
    displayFormat: 'barcode',
    
    // Dimensions
    width: 2,
    height: 100,
    margin: 10,
    
    // Label Settings
    showLabel: true,
    labelPosition: 'bottom',
    fontSize: 14,
    labelMargin: 5,
    
    // Print Settings
    labelsPerRow: 3,
    labelWidth: 50,
    labelHeight: 25,
    paperSize: 'A4',
    
    // Advanced
    includeProductName: true,
    includePrice: true,
    includeExpiry: false,
    customPrefix: '',
    customSuffix: '',
  });

  const [previewCode, setPreviewCode] = useState('123456789012');

  const barcodeTypes = [
    { value: 'CODE128', label: 'CODE 128' },
    { value: 'CODE39', label: 'CODE 39' },
    { value: 'EAN13', label: 'EAN-13' },
    { value: 'EAN8', label: 'EAN-8' },
    { value: 'UPC', label: 'UPC-A' },
    { value: 'ITF14', label: 'ITF-14' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">إعدادات الباركود</h1>
          <p className="text-muted-foreground">تخصيص شكل وطباعة الباركود</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            استعادة الافتراضي
          </Button>
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            حفظ الإعدادات
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="general" className="gap-2">
            <Barcode className="h-4 w-4" />
            عام
          </TabsTrigger>
          <TabsTrigger value="dimensions" className="gap-2">
            <QrCode className="h-4 w-4" />
            الأبعاد
          </TabsTrigger>
          <TabsTrigger value="print" className="gap-2">
            <Eye className="h-4 w-4" />
            الطباعة
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-20rem)]">
          {/* General Settings */}
          <TabsContent value="general">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>نوع الباركود</CardTitle>
                  <CardDescription>اختر نوع الباركود المستخدم</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>نوع الباركود</Label>
                    <Select
                      value={settings.barcodeType}
                      onValueChange={(v) => setSettings({ ...settings, barcodeType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {barcodeTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>طريقة العرض</Label>
                    <Select
                      value={settings.displayFormat}
                      onValueChange={(v) => setSettings({ ...settings, displayFormat: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="barcode">باركود فقط</SelectItem>
                        <SelectItem value="qrcode">رمز QR فقط</SelectItem>
                        <SelectItem value="both">باركود + رمز QR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">إظهار التسمية</p>
                        <p className="text-sm text-muted-foreground">عرض رقم الباركود أسفله</p>
                      </div>
                      <Switch
                        checked={settings.showLabel}
                        onCheckedChange={(v) => setSettings({ ...settings, showLabel: v })}
                      />
                    </div>

                    {settings.showLabel && (
                      <>
                        <div>
                          <Label>موضع التسمية</Label>
                          <Select
                            value={settings.labelPosition}
                            onValueChange={(v) => setSettings({ ...settings, labelPosition: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bottom">أسفل</SelectItem>
                              <SelectItem value="top">أعلى</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>حجم خط التسمية: {settings.fontSize}px</Label>
                          <Slider
                            value={[settings.fontSize]}
                            onValueChange={([v]) => setSettings({ ...settings, fontSize: v })}
                            min={8}
                            max={24}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>المحتوى الإضافي</CardTitle>
                  <CardDescription>معلومات إضافية على ملصق الباركود</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">اسم المنتج</p>
                        <p className="text-sm text-muted-foreground">عرض اسم المنتج على الملصق</p>
                      </div>
                      <Switch
                        checked={settings.includeProductName}
                        onCheckedChange={(v) => setSettings({ ...settings, includeProductName: v })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">السعر</p>
                        <p className="text-sm text-muted-foreground">عرض سعر المنتج على الملصق</p>
                      </div>
                      <Switch
                        checked={settings.includePrice}
                        onCheckedChange={(v) => setSettings({ ...settings, includePrice: v })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">تاريخ الانتهاء</p>
                        <p className="text-sm text-muted-foreground">عرض تاريخ انتهاء الصلاحية</p>
                      </div>
                      <Switch
                        checked={settings.includeExpiry}
                        onCheckedChange={(v) => setSettings({ ...settings, includeExpiry: v })}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label>بادئة مخصصة</Label>
                    <Input
                      value={settings.customPrefix}
                      onChange={(e) => setSettings({ ...settings, customPrefix: e.target.value })}
                      placeholder="مثال: PRD-"
                    />
                  </div>

                  <div>
                    <Label>لاحقة مخصصة</Label>
                    <Input
                      value={settings.customSuffix}
                      onChange={(e) => setSettings({ ...settings, customSuffix: e.target.value })}
                      placeholder="مثال: -001"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Dimensions Settings */}
          <TabsContent value="dimensions">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>أبعاد الباركود</CardTitle>
                  <CardDescription>تحديد أبعاد الباركود</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>عرض الخط: {settings.width}px</Label>
                    <Slider
                      value={[settings.width]}
                      onValueChange={([v]) => setSettings({ ...settings, width: v })}
                      min={1}
                      max={5}
                      step={0.5}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>الارتفاع: {settings.height}px</Label>
                    <Slider
                      value={[settings.height]}
                      onValueChange={([v]) => setSettings({ ...settings, height: v })}
                      min={50}
                      max={200}
                      step={5}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>الهامش: {settings.margin}px</Label>
                    <Slider
                      value={[settings.margin]}
                      onValueChange={([v]) => setSettings({ ...settings, margin: v })}
                      min={0}
                      max={30}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  {settings.showLabel && (
                    <div>
                      <Label>هامش التسمية: {settings.labelMargin}px</Label>
                      <Slider
                        value={[settings.labelMargin]}
                        onValueChange={([v]) => setSettings({ ...settings, labelMargin: v })}
                        min={0}
                        max={20}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>معاينة الباركود</CardTitle>
                  <CardDescription>عرض مسبق للباركود</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>كود للمعاينة</Label>
                    <Input
                      value={previewCode}
                      onChange={(e) => setPreviewCode(e.target.value)}
                      placeholder="أدخل كود للمعاينة"
                    />
                  </div>

                  <div className="border rounded-lg p-6 bg-white flex items-center justify-center min-h-[200px]">
                    <div className="text-center">
                      {/* Simulated Barcode Preview */}
                      <div 
                        className="inline-block bg-black"
                        style={{
                          height: `${settings.height}px`,
                          padding: `${settings.margin}px`,
                        }}
                      >
                        <div className="flex gap-px h-full">
                          {previewCode.split('').map((_, i) => (
                            <div 
                              key={i}
                              className="bg-white h-full"
                              style={{ 
                                width: `${settings.width * (Math.random() > 0.5 ? 1 : 2)}px` 
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      {settings.showLabel && (
                        <div 
                          className="mt-2 font-mono"
                          style={{ fontSize: `${settings.fontSize}px` }}
                        >
                          {settings.customPrefix}{previewCode}{settings.customSuffix}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Print Settings */}
          <TabsContent value="print">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات الطباعة</CardTitle>
                  <CardDescription>تحديد أبعاد الورق والملصقات</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>حجم الورق</Label>
                    <Select
                      value={settings.paperSize}
                      onValueChange={(v) => setSettings({ ...settings, paperSize: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">A4</SelectItem>
                        <SelectItem value="A5">A5</SelectItem>
                        <SelectItem value="Letter">Letter</SelectItem>
                        <SelectItem value="Label">ورق ملصقات</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>عرض الملصق (mm)</Label>
                      <Input
                        type="number"
                        value={settings.labelWidth}
                        onChange={(e) => setSettings({ ...settings, labelWidth: parseInt(e.target.value) || 50 })}
                      />
                    </div>
                    <div>
                      <Label>ارتفاع الملصق (mm)</Label>
                      <Input
                        type="number"
                        value={settings.labelHeight}
                        onChange={(e) => setSettings({ ...settings, labelHeight: parseInt(e.target.value) || 25 })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>عدد الملصقات في الصف: {settings.labelsPerRow}</Label>
                    <Slider
                      value={[settings.labelsPerRow]}
                      onValueChange={([v]) => setSettings({ ...settings, labelsPerRow: v })}
                      min={1}
                      max={6}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>معاينة صفحة الطباعة</CardTitle>
                  <CardDescription>تخطيط الملصقات على الورقة</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-white aspect-[1/1.4] mx-auto max-w-[300px]">
                    <div className="grid gap-2 h-full" style={{ gridTemplateColumns: `repeat(${settings.labelsPerRow}, 1fr)` }}>
                      {Array.from({ length: settings.labelsPerRow * 4 }).map((_, i) => (
                        <div 
                          key={i}
                          className="border border-dashed border-gray-300 rounded p-1 flex flex-col items-center justify-center text-xs"
                        >
                          <div className="w-full h-2 bg-gray-300 mb-1" />
                          <div className="text-[6px] text-gray-500">123456</div>
                          {settings.includeProductName && (
                            <div className="w-full h-1 bg-gray-200 mt-1" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    {settings.labelsPerRow * 4} ملصق لكل صفحة
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
