'use client';

import { useState } from 'react';
import {
  Printer,
  Receipt,
  FileText,
  Save,
  Plus,
  Trash2,
  Edit,
  Monitor,
  Wifi,
  Usb,
  Bluetooth,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PrinterConfig {
  id: string;
  name: string;
  type: 'usb' | 'network' | 'bluetooth';
  address: string;
  isDefault: boolean;
  paperWidth: '58' | '80';
}

interface ReceiptTemplate {
  id: string;
  name: string;
  isDefault: boolean;
}

export function PrintSettingsPage() {
  const [printers, setPrinters] = useState<PrinterConfig[]>([
    { id: '1', name: 'طابعة الكاشير', type: 'usb', address: 'USB001', isDefault: true, paperWidth: '80' },
    { id: '2', name: 'طابعة المطبخ', type: 'network', address: '192.168.1.100:9100', isDefault: false, paperWidth: '80' },
  ]);

  const [templates, setTemplates] = useState<ReceiptTemplate[]>([
    { id: '1', name: 'قالب الفاتورة الافتراضي', isDefault: true },
    { id: '2', name: 'قالب مختصر', isDefault: false },
  ]);

  const [settings, setSettings] = useState({
    autoPrint: true,
    printCopies: 1,
    showLogo: true,
    showTaxNumber: true,
    showQRCode: true,
    footerText: 'شكراً لزيارتكم',
    paperWidth: '80',
    fontSize: 'normal',
    margin: '2',
  });

  const [addPrinterOpen, setAddPrinterOpen] = useState(false);
  const [newPrinter, setNewPrinter] = useState<Partial<PrinterConfig>>({
    name: '',
    type: 'usb',
    address: '',
    paperWidth: '80',
  });

  const getPrinterIcon = (type: string) => {
    switch (type) {
      case 'network':
        return <Wifi className="h-4 w-4" />;
      case 'bluetooth':
        return <Bluetooth className="h-4 w-4" />;
      default:
        return <Usb className="h-4 w-4" />;
    }
  };

  const handleAddPrinter = () => {
    if (newPrinter.name && newPrinter.address) {
      setPrinters([
        ...printers,
        {
          id: Date.now().toString(),
          name: newPrinter.name,
          type: newPrinter.type as 'usb' | 'network' | 'bluetooth',
          address: newPrinter.address,
          isDefault: false,
          paperWidth: newPrinter.paperWidth as '58' | '80',
        },
      ]);
      setNewPrinter({ name: '', type: 'usb', address: '', paperWidth: '80' });
      setAddPrinterOpen(false);
    }
  };

  const handleSetDefaultPrinter = (id: string) => {
    setPrinters(printers.map(p => ({ ...p, isDefault: p.id === id })));
  };

  const handleDeletePrinter = (id: string) => {
    setPrinters(printers.filter(p => p.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">إعدادات الطباعة</h1>
          <p className="text-muted-foreground">إدارة الطابعات وقوالب الفواتير</p>
        </div>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          حفظ الإعدادات
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="printers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="printers" className="gap-2">
            <Printer className="h-4 w-4" />
            الطابعات
          </TabsTrigger>
          <TabsTrigger value="receipt" className="gap-2">
            <Receipt className="h-4 w-4" />
            الفاتورة الحرارية
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            القوالب
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-20rem)]">
          {/* Printers Tab */}
          <TabsContent value="printers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>الطابعات المتصلة</CardTitle>
                    <CardDescription>إدارة الطابعات المتاحة للطباعة</CardDescription>
                  </div>
                  <Dialog open={addPrinterOpen} onOpenChange={setAddPrinterOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        إضافة طابعة
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>إضافة طابعة جديدة</DialogTitle>
                        <DialogDescription>أدخل بيانات الطابعة الجديدة</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label>اسم الطابعة</Label>
                          <Input
                            value={newPrinter.name}
                            onChange={(e) => setNewPrinter({ ...newPrinter, name: e.target.value })}
                            placeholder="مثال: طابعة الكاشير"
                          />
                        </div>
                        <div>
                          <Label>نوع الاتصال</Label>
                          <Select
                            value={newPrinter.type}
                            onValueChange={(v) => setNewPrinter({ ...newPrinter, type: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="usb">USB</SelectItem>
                              <SelectItem value="network">شبكة (Network)</SelectItem>
                              <SelectItem value="bluetooth">بلوتوث</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>العنوان</Label>
                          <Input
                            value={newPrinter.address}
                            onChange={(e) => setNewPrinter({ ...newPrinter, address: e.target.value })}
                            placeholder={newPrinter.type === 'network' ? '192.168.1.100:9100' : 'USB001'}
                          />
                        </div>
                        <div>
                          <Label>عرض الورق</Label>
                          <Select
                            value={newPrinter.paperWidth}
                            onValueChange={(v) => setNewPrinter({ ...newPrinter, paperWidth: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="58">58mm</SelectItem>
                              <SelectItem value="80">80mm</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button className="w-full" onClick={handleAddPrinter}>
                          إضافة
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>نوع الاتصال</TableHead>
                      <TableHead>العنوان</TableHead>
                      <TableHead>عرض الورق</TableHead>
                      <TableHead>افتراضية</TableHead>
                      <TableHead>إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {printers.map((printer) => (
                      <TableRow key={printer.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Printer className="h-4 w-4" />
                            {printer.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPrinterIcon(printer.type)}
                            {printer.type === 'usb' ? 'USB' : printer.type === 'network' ? 'شبكة' : 'بلوتوث'}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{printer.address}</TableCell>
                        <TableCell>{printer.paperWidth}mm</TableCell>
                        <TableCell>
                          <Switch
                            checked={printer.isDefault}
                            onCheckedChange={() => handleSetDefaultPrinter(printer.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDeletePrinter(printer.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Receipt Settings Tab */}
          <TabsContent value="receipt">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات الفاتورة</CardTitle>
                  <CardDescription>تخصيص شكل الفاتورة الحرارية</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>عرض الورق</Label>
                      <Select
                        value={settings.paperWidth}
                        onValueChange={(v) => setSettings({ ...settings, paperWidth: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="58">58mm</SelectItem>
                          <SelectItem value="80">80mm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>حجم الخط</Label>
                      <Select
                        value={settings.fontSize}
                        onValueChange={(v) => setSettings({ ...settings, fontSize: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">صغير</SelectItem>
                          <SelectItem value="normal">عادي</SelectItem>
                          <SelectItem value="large">كبير</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>الهوامش (mm)</Label>
                    <Input
                      type="number"
                      value={settings.margin}
                      onChange={(e) => setSettings({ ...settings, margin: e.target.value })}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">طباعة تلقائية</p>
                        <p className="text-sm text-muted-foreground">طباعة الفاتورة تلقائياً بعد كل عملية</p>
                      </div>
                      <Switch
                        checked={settings.autoPrint}
                        onCheckedChange={(v) => setSettings({ ...settings, autoPrint: v })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">إظهار الشعار</p>
                        <p className="text-sm text-muted-foreground">عرض شعار الشركة على الفاتورة</p>
                      </div>
                      <Switch
                        checked={settings.showLogo}
                        onCheckedChange={(v) => setSettings({ ...settings, showLogo: v })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">إظهار الرقم الضريبي</p>
                        <p className="text-sm text-muted-foreground">عرض الرقم الضريبي على الفاتورة</p>
                      </div>
                      <Switch
                        checked={settings.showTaxNumber}
                        onCheckedChange={(v) => setSettings({ ...settings, showTaxNumber: v })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">إظهار رمز QR</p>
                        <p className="text-sm text-muted-foreground">عرض رمز QR للفاتورة الإلكترونية</p>
                      </div>
                      <Switch
                        checked={settings.showQRCode}
                        onCheckedChange={(v) => setSettings({ ...settings, showQRCode: v })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>عدد النسخ</Label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={settings.printCopies}
                      onChange={(e) => setSettings({ ...settings, printCopies: parseInt(e.target.value) || 1 })}
                    />
                  </div>

                  <div>
                    <Label>نص التذييل</Label>
                    <Textarea
                      value={settings.footerText}
                      onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                      placeholder="نص يظهر في نهاية الفاتورة"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Preview Card */}
              <Card>
                <CardHeader>
                  <CardTitle>معاينة الفاتورة</CardTitle>
                  <CardDescription>عرض مسبق لشكل الفاتورة</CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    className="bg-white text-black p-4 rounded-lg mx-auto shadow-lg"
                    style={{ 
                      width: settings.paperWidth === '80' ? '320px' : '240px',
                      fontFamily: 'monospace',
                      fontSize: settings.fontSize === 'small' ? '10px' : settings.fontSize === 'large' ? '14px' : '12px'
                    }}
                    dir="rtl"
                  >
                    {settings.showLogo && (
                      <div className="text-center mb-2">
                        <div className="w-12 h-12 bg-gray-200 rounded mx-auto mb-1 flex items-center justify-center text-xs">
                          شعار
                        </div>
                      </div>
                    )}
                    <div className="text-center font-bold text-sm mb-2">
                      اسم الشركة
                    </div>
                    <div className="text-center text-xs mb-2">
                      العنوان - الهاتف
                    </div>
                    {settings.showTaxNumber && (
                      <div className="text-center text-xs mb-2">
                        الرقم الضريبي: 300000000000003
                      </div>
                    )}
                    <div className="border-t border-b border-dashed border-gray-400 py-2 my-2">
                      <div className="flex justify-between text-xs">
                        <span>فاتورة رقم:</span>
                        <span>INV-001</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>التاريخ:</span>
                        <span>{new Date().toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>
                    <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
                      <div className="flex justify-between text-xs py-1">
                        <span>منتج 1 × 2</span>
                        <span>50.00</span>
                      </div>
                      <div className="flex justify-between text-xs py-1">
                        <span>منتج 2 × 1</span>
                        <span>25.00</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span>المجموع:</span>
                      <span>75.00 ر.س</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>الضريبة (15%):</span>
                      <span>11.25 ر.س</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t border-dashed border-gray-400 mt-2 pt-2">
                      <span>الإجمالي:</span>
                      <span>86.25 ر.س</span>
                    </div>
                    {settings.showQRCode && (
                      <div className="flex justify-center mt-3">
                        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-xs">
                          QR
                        </div>
                      </div>
                    )}
                    <div className="text-center text-xs mt-3">
                      {settings.footerText}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>قوالب الفواتير</CardTitle>
                    <CardDescription>إدارة قوالب الفواتير المحفوظة</CardDescription>
                  </div>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    قالب جديد
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم القالب</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>
                          {template.isDefault ? (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              افتراضي
                            </span>
                          ) : (
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                              متاح
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
