'use client';

import { useState } from 'react';
import {
  Plus, Search, Edit, Trash2, MoreHorizontal, Palette, GripVertical, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type FieldType = 'text' | 'number' | 'select' | 'date' | 'checkbox';

interface CustomField {
  id: string;
  name: string;
  nameAr: string;
  type: FieldType;
  module: string;
  options?: string[];
  defaultValue?: string;
  isRequired: boolean;
  isVisible: boolean;
  showInList: boolean;
  showInFilter: boolean;
  showInReport: boolean;
  sortOrder: number;
}

const modules = [
  { id: 'products', name: 'المنتجات' },
  { id: 'customers', name: 'العملاء' },
  { id: 'suppliers', name: 'الموردين' },
  { id: 'invoices', name: 'الفواتير' },
];

const fieldTypes: { id: FieldType; name: string }[] = [
  { id: 'text', name: 'نص' },
  { id: 'number', name: 'رقم' },
  { id: 'select', name: 'قائمة اختيار' },
  { id: 'date', name: 'تاريخ' },
  { id: 'checkbox', name: 'نعم/لا' },
];

const mockCustomFields: CustomField[] = [
  { id: '1', name: 'Manufacturer', nameAr: 'الشركة المصنعة', type: 'text', module: 'products', isRequired: false, isVisible: true, showInList: true, showInFilter: true, showInReport: true, sortOrder: 0 },
  { id: '2', name: 'Origin Country', nameAr: 'بلد المنشأ', type: 'select', module: 'products', options: ['الصين', 'اليابان', 'كوريا', 'أمريكا', 'أوروبا'], isRequired: false, isVisible: true, showInList: false, showInFilter: true, showInReport: true, sortOrder: 1 },
  { id: '3', name: 'Expiry Date', nameAr: 'تاريخ الانتهاء', type: 'date', module: 'products', isRequired: false, isVisible: true, showInList: true, showInFilter: true, showInReport: true, sortOrder: 2 },
  { id: '4', name: 'Customer Type', nameAr: 'نوع العميل', type: 'select', module: 'customers', options: ['فرد', 'شركة', 'حكومي'], isRequired: false, isVisible: true, showInList: true, showInFilter: true, showInReport: true, sortOrder: 0 },
  { id: '5', name: 'Credit Limit', nameAr: 'الحد الائتماني', type: 'number', module: 'customers', isRequired: false, isVisible: true, showInList: false, showInFilter: false, showInReport: true, sortOrder: 1 },
];

export function CustomFieldsPage() {
  const [fields, setFields] = useState<CustomField[]>(mockCustomFields);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedField, setSelectedField] = useState<CustomField | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    type: 'text' as FieldType,
    module: 'products',
    options: '',
    defaultValue: '',
    isRequired: false,
    isVisible: true,
    showInList: false,
    showInFilter: true,
    showInReport: true,
  });

  const filteredFields = fields.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         f.nameAr.includes(searchQuery);
    const matchesModule = selectedModule === 'all' || f.module === selectedModule;
    return matchesSearch && matchesModule;
  });

  const groupedFields = modules.map(m => ({
    ...m,
    fields: filteredFields.filter(f => f.module === m.id)
  })).filter(m => selectedModule === 'all' || m.id === selectedModule);

  const handleSave = () => {
    if (!formData.name || !formData.nameAr) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (formData.type === 'select' && !formData.options) {
      toast.error('يرجى إدخال خيارات القائمة');
      return;
    }

    const fieldData: Partial<CustomField> = {
      name: formData.name,
      nameAr: formData.nameAr,
      type: formData.type,
      module: formData.module,
      options: formData.type === 'select' ? formData.options.split(',').map(o => o.trim()) : undefined,
      defaultValue: formData.defaultValue || undefined,
      isRequired: formData.isRequired,
      isVisible: formData.isVisible,
      showInList: formData.showInList,
      showInFilter: formData.showInFilter,
      showInReport: formData.showInReport,
      sortOrder: fields.filter(f => f.module === formData.module).length,
    };

    if (selectedField) {
      setFields(prev => prev.map(f =>
        f.id === selectedField.id ? { ...f, ...fieldData } : f
      ));
      toast.success('تم تحديث الحقل بنجاح');
    } else {
      const newField: CustomField = {
        id: Date.now().toString(),
        ...fieldData as CustomField,
      };
      setFields(prev => [...prev, newField]);
      toast.success('تم إنشاء الحقل بنجاح');
    }
    setShowAddDialog(false);
    resetForm();
  };

  const handleDelete = (field: CustomField) => {
    setFields(prev => prev.filter(f => f.id !== field.id));
    toast.success('تم حذف الحقل بنجاح');
  };

  const handleToggleVisibility = (field: CustomField) => {
    setFields(prev => prev.map(f =>
      f.id === field.id ? { ...f, isVisible: !f.isVisible } : f
    ));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameAr: '',
      type: 'text',
      module: 'products',
      options: '',
      defaultValue: '',
      isRequired: false,
      isVisible: true,
      showInList: false,
      showInFilter: true,
      showInReport: true,
    });
    setSelectedField(null);
  };

  const openEditDialog = (field: CustomField) => {
    setSelectedField(field);
    setFormData({
      name: field.name,
      nameAr: field.nameAr,
      type: field.type,
      module: field.module,
      options: field.options?.join(', ') || '',
      defaultValue: field.defaultValue || '',
      isRequired: field.isRequired,
      isVisible: field.isVisible,
      showInList: field.showInList,
      showInFilter: field.showInFilter,
      showInReport: field.showInReport,
    });
    setShowAddDialog(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">الحقول المخصصة</h1>
          <p className="text-muted-foreground">إدارة الحقول المخصصة وإعدادات العرض</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
          <Plus className="h-4 w-4 ml-2" /> إضافة حقل
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={selectedModule} onValueChange={setSelectedModule}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="الوحدة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الوحدات</SelectItem>
            {modules.map(m => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {modules.map(m => (
          <Card key={m.id}>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground">{m.name}</p>
              <p className="text-2xl font-bold">
                {fields.filter(f => f.module === m.id).length}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fields by Module */}
      <Tabs defaultValue="products">
        <TabsList>
          {modules.map(m => (
            <TabsTrigger key={m.id} value={m.id}>
              {m.name} ({fields.filter(f => f.module === m.id).length})
            </TabsTrigger>
          ))}
        </TabsList>

        {modules.map(m => (
          <TabsContent key={m.id} value={m.id}>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الحقل</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>مطلوب</TableHead>
                      <TableHead>في القائمة</TableHead>
                      <TableHead>في الفلتر</TableHead>
                      <TableHead>في التقرير</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.filter(f => f.module === m.id).map(field => (
                      <TableRow key={field.id} className={cn(!field.isVisible && "opacity-50")}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                            <div>
                              <p className="font-medium">{field.nameAr}</p>
                              <p className="text-xs text-muted-foreground">{field.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {fieldTypes.find(t => t.id === field.type)?.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {field.isRequired ? <Badge variant="default">نعم</Badge> : <Badge variant="secondary">لا</Badge>}
                        </TableCell>
                        <TableCell>
                          {field.showInList ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                        </TableCell>
                        <TableCell>
                          {field.showInFilter ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                        </TableCell>
                        <TableCell>
                          {field.showInReport ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(field)}>
                                <Edit className="ml-2 h-4 w-4" /> تعديل
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleVisibility(field)}>
                                {field.isVisible ? <EyeOff className="ml-2 h-4 w-4" /> : <Eye className="ml-2 h-4 w-4" />}
                                {field.isVisible ? 'إخفاء' : 'إظهار'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(field)}
                              >
                                <Trash2 className="ml-2 h-4 w-4" /> حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedField ? 'تعديل الحقل' : 'إضافة حقل مخصص'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الاسم (إنجليزي) *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="FieldName"
                />
              </div>
              <div>
                <Label>الاسم (عربي) *</Label>
                <Input
                  value={formData.nameAr}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                  placeholder="اسم الحقل"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الوحدة</Label>
                <Select value={formData.module} onValueChange={(v) => setFormData(prev => ({ ...prev, module: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {modules.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>النوع</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as FieldType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.type === 'select' && (
              <div>
                <Label>الخيارات (مفصولة بفاصلة)</Label>
                <Textarea
                  value={formData.options}
                  onChange={(e) => setFormData(prev => ({ ...prev, options: e.target.value }))}
                  placeholder="خيار1, خيار2, خيار3"
                  rows={2}
                />
              </div>
            )}

            <div>
              <Label>القيمة الافتراضية</Label>
              <Input
                value={formData.defaultValue}
                onChange={(e) => setFormData(prev => ({ ...prev, defaultValue: e.target.value }))}
                placeholder="القيمة الافتراضية"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isRequired}
                  onCheckedChange={(v) => setFormData(prev => ({ ...prev, isRequired: v }))}
                />
                <Label>حقل مطلوب</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isVisible}
                  onCheckedChange={(v) => setFormData(prev => ({ ...prev, isVisible: v }))}
                />
                <Label>ظاهر</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.showInList}
                  onCheckedChange={(v) => setFormData(prev => ({ ...prev, showInList: v }))}
                />
                <Label>في القائمة</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.showInFilter}
                  onCheckedChange={(v) => setFormData(prev => ({ ...prev, showInFilter: v }))}
                />
                <Label>في الفلتر</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.showInReport}
                  onCheckedChange={(v) => setFormData(prev => ({ ...prev, showInReport: v }))}
                />
                <Label>في التقارير</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>إلغاء</Button>
            <Button onClick={handleSave}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
