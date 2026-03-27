'use client';

import { useState, useRef } from 'react';
import {
  Download, Upload, FileSpreadsheet, Check, X, AlertCircle, Table, Users,
  Package, Tags, Layers, Truck, Building2, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Table as ShadcnTable, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const importTypes = [
  { id: 'products', name: 'المنتجات', icon: Package, color: 'text-blue-600' },
  { id: 'customers', name: 'العملاء', icon: Users, color: 'text-green-600' },
  { id: 'suppliers', name: 'الموردين', icon: Truck, color: 'text-purple-600' },
  { id: 'categories', name: 'الفئات', icon: Tags, color: 'text-orange-600' },
  { id: 'brands', name: 'البراندات', icon: Layers, color: 'text-pink-600' },
  { id: 'supplier-companies', name: 'الشركات الموردة', icon: Building2, color: 'text-cyan-600' },
  { id: 'variants', name: 'قوالب المتغيرات', icon: FileSpreadsheet, color: 'text-amber-600' },
];

const templateFields: Record<string, { field: string; name: string; required: boolean; description: string }[]> = {
  products: [
    { field: 'barcode', name: 'الباركود', required: true, description: 'رمز الباركود للمنتج' },
    { field: 'name', name: 'اسم المنتج', required: true, description: 'اسم المنتج بالعربية' },
    { field: 'nameEn', name: 'الاسم بالإنجليزي', required: false, description: 'اسم المنتج بالإنجليزية' },
    { field: 'sku', name: 'رمز SKU', required: false, description: 'رمز التخزين' },
    { field: 'categoryName', name: 'الفئة', required: false, description: 'اسم الفئة' },
    { field: 'brandName', name: 'البراند', required: false, description: 'اسم البراند' },
    { field: 'costPrice', name: 'سعر التكلفة', required: true, description: 'سعر شراء المنتج' },
    { field: 'sellingPrice', name: 'سعر البيع', required: true, description: 'سعر بيع المنتج' },
    { field: 'unit', name: 'الوحدة', required: false, description: 'وحدة القياس (قطعة، كيلو، إلخ)' },
    { field: 'minStock', name: 'الحد الأدنى', required: false, description: 'الحد الأدنى للمخزون' },
    { field: 'description', name: 'الوصف', required: false, description: 'وصف المنتج' },
  ],
  customers: [
    { field: 'name', name: 'اسم العميل', required: true, description: 'اسم العميل الكامل' },
    { field: 'phone', name: 'رقم الهاتف', required: false, description: 'رقم الهاتف' },
    { field: 'email', name: 'البريد الإلكتروني', required: false, description: 'البريد الإلكتروني' },
    { field: 'address', name: 'العنوان', required: false, description: 'العنوان' },
    { field: 'taxNumber', name: 'الرقم الضريبي', required: false, description: 'الرقم الضريبي' },
    { field: 'notes', name: 'ملاحظات', required: false, description: 'ملاحظات إضافية' },
  ],
  suppliers: [
    { field: 'name', name: 'اسم المورد', required: true, description: 'اسم المورد' },
    { field: 'phone', name: 'رقم الهاتف', required: false, description: 'رقم الهاتف' },
    { field: 'email', name: 'البريد الإلكتروني', required: false, description: 'البريد الإلكتروني' },
    { field: 'address', name: 'العنوان', required: false, description: 'العنوان' },
    { field: 'taxNumber', name: 'الرقم الضريبي', required: false, description: 'الرقم الضريبي' },
    { field: 'categoryNames', name: 'فئات التوريد', required: false, description: 'أسماء الفئات مفصولة بفاصلة' },
  ],
  categories: [
    { field: 'name', name: 'اسم الفئة', required: true, description: 'اسم الفئة' },
    { field: 'parentName', name: 'الفئة الأب', required: false, description: 'اسم الفئة الرئيسية' },
    { field: 'color', name: 'اللون', required: false, description: 'كود اللون (مثل #3b82f6)' },
  ],
  brands: [
    { field: 'name', name: 'اسم البراند', required: true, description: 'اسم البراند' },
    { field: 'description', name: 'الوصف', required: false, description: 'وصف البراند' },
  ],
  'supplier-companies': [
    { field: 'name', name: 'اسم الشركة', required: true, description: 'اسم الشركة الموردة' },
    { field: 'phone', name: 'رقم الهاتف', required: false, description: 'رقم الهاتف' },
    { field: 'email', name: 'البريد الإلكتروني', required: false, description: 'البريد الإلكتروني' },
    { field: 'address', name: 'العنوان', required: false, description: 'العنوان' },
    { field: 'taxNumber', name: 'الرقم الضريبي', required: false, description: 'الرقم الضريبي' },
    { field: 'categoryNames', name: 'فئات التوريد', required: false, description: 'أسماء الفئات مفصولة بفاصلة' },
  ],
  variants: [
    { field: 'templateName', name: 'اسم القالب', required: true, description: 'اسم قالب المتغير (اللون، المقاس، إلخ)' },
    { field: 'value', name: 'القيمة', required: true, description: 'القيمة (أحمر، XL، إلخ)' },
    { field: 'valueAr', name: 'القيمة بالعربية', required: false, description: 'القيمة بالعربية' },
    { field: 'code', name: 'الرمز', required: false, description: 'رمز مختصر (RED, XL, إلخ)' },
  ],
};

export function ImportPage() {
  const [selectedType, setSelectedType] = useState('products');
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, string>[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTemplate = templateFields[selectedType] || [];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.csv')) {
        toast.error('يرجى اختيار ملف Excel أو CSV');
        return;
      }
      setFile(selectedFile);
      setImportResult(null);
      
      // Simulate file parsing
      const mockPreview = currentTemplate.map((field, i) => ({
        ...currentTemplate.reduce((acc, f) => ({ ...acc, [f.field]: i === 0 ? f.name : `مثال ${i}` }), {}),
      }));
      setPreviewData(mockPreview.slice(0, 5));
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV content
    const headers = currentTemplate.map(f => f.field).join(',');
    const content = `${headers}\n${currentTemplate.map(f => f.required ? `[${f.name}]` : '').join(',')}`;
    
    const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${selectedType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('تم تحميل القالب');
  };

  const handleImport = async () => {
    if (!file) return;
    
    setImporting(true);
    // Simulate import
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setImportResult({
      success: previewData.length,
      failed: 0,
      errors: [],
    });
    setImporting(false);
    toast.success('تم الاستيراد بنجاح');
  };

  const handleReset = () => {
    setFile(null);
    setPreviewData([]);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">استيراد البيانات</h1>
          <p className="text-muted-foreground">استيراد البيانات من ملفات Excel أو CSV</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Import Type Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>نوع البيانات</CardTitle>
            <CardDescription>اختر نوع البيانات للاستيراد</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {importTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => { setSelectedType(type.id); handleReset(); }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-right transition-colors",
                  selectedType === type.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <type.icon className={cn("h-5 w-5", selectedType === type.id ? "" : type.color)} />
                <span className="font-medium">{type.name}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Import Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>قالب الاستيراد</CardTitle>
            <CardDescription>قم بتحميل القالب ثم رفع الملف المملوء</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Template Download */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">قالب {importTypes.find(t => t.id === selectedType)?.name}</p>
                  <p className="text-sm text-muted-foreground">ملف CSV قابل للتعديل</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleDownloadTemplate}>
                <Download className="h-4 w-4 ml-2" /> تحميل القالب
              </Button>
            </div>

            {/* File Upload */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              >
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium">اضغط لرفع الملف</p>
                <p className="text-sm text-muted-foreground">أو اسحب الملف وأفلته هنا</p>
                <p className="text-xs text-muted-foreground mt-2">xlsx, csv (حد أقصى 5MB)</p>
              </div>
            </div>

            {/* Selected File */}
            {file && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-medium">{file.name}</span>
                  <Badge variant="secondary">{(file.size / 1024).toFixed(1)} KB</Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={handleReset}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Import Result */}
            {importResult && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-600">تم الاستيراد بنجاح</span>
                </div>
                <p className="text-sm">تم استيراد {importResult.success} سجل بنجاح</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!file || importing}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleImport}
                disabled={!file || importing}
              >
                {importing ? 'جاري الاستيراد...' : 'استيراد'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Fields */}
      <Card>
        <CardHeader>
          <CardTitle>الحقول المطلوبة</CardTitle>
          <CardDescription>تفاصيل الحقول في قالب الاستيراد</CardDescription>
        </CardHeader>
        <CardContent>
          <ShadcnTable>
            <TableHeader>
              <TableRow>
                <TableHead>الحقل</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>مطلوب</TableHead>
                <TableHead>الوصف</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTemplate.map((field) => (
                <TableRow key={field.field}>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{field.field}</code>
                  </TableCell>
                  <TableCell>{field.name}</TableCell>
                  <TableCell>
                    {field.required ? (
                      <Badge variant="default">مطلوب</Badge>
                    ) : (
                      <Badge variant="secondary">اختياري</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{field.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </ShadcnTable>
        </CardContent>
      </Card>

      {/* Preview */}
      {previewData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>معاينة البيانات</CardTitle>
            <CardDescription>أول 5 صفوف من الملف</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-64">
              <ShadcnTable>
                <TableHeader>
                  <TableRow>
                    {currentTemplate.map((field) => (
                      <TableHead key={field.field}>{field.name}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, i) => (
                    <TableRow key={i}>
                      {currentTemplate.map((field) => (
                        <TableCell key={field.field}>{row[field.field] || '-'}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </ShadcnTable>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
