'use client';

import { useState, useEffect } from 'react';
import {
  Plus, Search, Edit, Trash2, MoreHorizontal, Palette, Ruler, Package, X, GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VariantTemplateValue {
  id: string;
  value: string;
  valueAr?: string;
  code?: string;
  sortOrder: number;
  isActive: boolean;
}

interface VariantTemplate {
  id: string;
  name: string;
  nameAr?: string;
  isActive: boolean;
  values?: VariantTemplateValue[];
}

const templateIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Color': Palette,
  'Size': Ruler,
  'Material': Package,
  'default': Package,
};

// Mock data for initial display
const mockTemplates: VariantTemplate[] = [
  {
    id: '1',
    name: 'Color',
    nameAr: 'اللون',
    isActive: true,
    values: [
      { id: '1', value: 'Red', valueAr: 'أحمر', code: 'RED', sortOrder: 0, isActive: true },
      { id: '2', value: 'Blue', valueAr: 'أزرق', code: 'BLU', sortOrder: 1, isActive: true },
      { id: '3', value: 'Green', valueAr: 'أخضر', code: 'GRN', sortOrder: 2, isActive: true },
      { id: '4', value: 'Black', valueAr: 'أسود', code: 'BLK', sortOrder: 3, isActive: true },
      { id: '5', value: 'White', valueAr: 'أبيض', code: 'WHT', sortOrder: 4, isActive: true },
    ]
  },
  {
    id: '2',
    name: 'Size',
    nameAr: 'المقاس',
    isActive: true,
    values: [
      { id: '6', value: 'XS', valueAr: 'XS', code: 'XS', sortOrder: 0, isActive: true },
      { id: '7', value: 'S', valueAr: 'S', code: 'S', sortOrder: 1, isActive: true },
      { id: '8', value: 'M', valueAr: 'M', code: 'M', sortOrder: 2, isActive: true },
      { id: '9', value: 'L', valueAr: 'L', code: 'L', sortOrder: 3, isActive: true },
      { id: '10', value: 'XL', valueAr: 'XL', code: 'XL', sortOrder: 4, isActive: true },
      { id: '11', value: 'XXL', valueAr: 'XXL', code: 'XXL', sortOrder: 5, isActive: true },
    ]
  },
  {
    id: '3',
    name: 'Material',
    nameAr: 'المادة',
    isActive: true,
    values: [
      { id: '12', value: 'Cotton', valueAr: 'قطن', code: 'COT', sortOrder: 0, isActive: true },
      { id: '13', value: 'Polyester', valueAr: 'بوليستر', code: 'POL', sortOrder: 1, isActive: true },
      { id: '14', value: 'Leather', valueAr: 'جلد', code: 'LTH', sortOrder: 2, isActive: true },
    ]
  },
];

export function VariantTemplatesPage() {
  const [templates, setTemplates] = useState<VariantTemplate[]>(mockTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<VariantTemplate | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    isActive: true,
  });
  const [values, setValues] = useState<{ value: string; valueAr: string; code: string }[]>([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/variant-templates?withValues=true');
      if (response.ok) {
        const data = await response.json();
        if (data.templates && data.templates.length > 0) {
          setTemplates(data.templates);
        }
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.nameAr && t.nameAr.includes(searchQuery))
  );

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('يرجى إدخال اسم القالب');
      return;
    }

    try {
      if (selectedTemplate) {
        // Update existing template
        const response = await fetch(`/api/variant-templates/${selectedTemplate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, values }),
        });
        
        if (!response.ok) throw new Error('فشل في التحديث');
        
        toast.success('تم تحديث القالب بنجاح');
      } else {
        // Create new template
        const response = await fetch('/api/variant-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, values }),
        });
        
        if (!response.ok) throw new Error('فشل في الإنشاء');
        
        toast.success('تم إنشاء القالب بنجاح');
      }
      
      fetchTemplates();
      setShowAddDialog(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ');
    }
  };

  const handleDelete = async (template: VariantTemplate) => {
    try {
      await fetch(`/api/variant-templates/${template.id}`, { method: 'DELETE' });
      setTemplates(prev => prev.filter(t => t.id !== template.id));
      toast.success('تم حذف القالب بنجاح');
    } catch {
      toast.error('فشل في حذف القالب');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', nameAr: '', isActive: true });
    setValues([]);
    setSelectedTemplate(null);
  };

  const openEditDialog = (template: VariantTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      nameAr: template.nameAr || '',
      isActive: template.isActive,
    });
    setValues(template.values?.map(v => ({
      value: v.value,
      valueAr: v.valueAr || '',
      code: v.code || '',
    })) || []);
    setShowAddDialog(true);
  };

  const addValue = () => {
    setValues(prev => [...prev, { value: '', valueAr: '', code: '' }]);
  };

  const removeValue = (index: number) => {
    setValues(prev => prev.filter((_, i) => i !== index));
  };

  const updateValue = (index: number, field: string, value: string) => {
    setValues(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const getTemplateIcon = (name: string) => {
    return templateIcons[name] || templateIcons['default'];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">قوالب المتغيرات</h1>
          <p className="text-muted-foreground">إنشاء وإدارة قوالب المتغيرات للاستخدام في المنتجات</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
          <Plus className="h-4 w-4 ml-2" /> إضافة قالب
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="بحث..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          className="pr-10" 
        />
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => {
          const TemplateIcon = getTemplateIcon(template.name);
          return (
            <Card key={template.id} className={cn(!template.isActive && "opacity-50")}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TemplateIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.nameAr && (
                        <p className="text-sm text-muted-foreground">{template.nameAr}</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(template)}>
                        <Edit className="ml-2 h-4 w-4" /> تعديل
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDelete(template)}
                      >
                        <Trash2 className="ml-2 h-4 w-4" /> حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {template.values?.slice(0, 6).map(value => (
                    <Badge key={value.id} variant="secondary" className="text-xs">
                      {value.value}
                    </Badge>
                  ))}
                  {(template.values?.length || 0) > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{(template.values?.length || 0) - 6} أخرى
                    </Badge>
                  )}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  {template.values?.length || 0} قيمة
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedTemplate ? 'تعديل القالب' : 'إضافة قالب جديد'}</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh]">
            <div className="space-y-6 p-4">
              {/* Template Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>اسم القالب (إنجليزي) *</Label>
                  <Input 
                    placeholder="مثال: Color, Size, Material"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>اسم القالب (عربي)</Label>
                  <Input 
                    placeholder="مثال: اللون، المقاس، المادة"
                    value={formData.nameAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch 
                  checked={formData.isActive}
                  onCheckedChange={(v) => setFormData(prev => ({ ...prev, isActive: v }))}
                />
                <Label>قالب نشط</Label>
              </div>

              {/* Values Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">القيم</h4>
                    <p className="text-sm text-muted-foreground">أضف القيم المتاحة لهذا القالب</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={addValue}>
                    <Plus className="h-4 w-4 ml-1" /> إضافة قيمة
                  </Button>
                </div>

                {values.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground px-2">
                      <div className="col-span-1"></div>
                      <div className="col-span-3">القيمة (إنجليزي)</div>
                      <div className="col-span-3">القيمة (عربي)</div>
                      <div className="col-span-3">الرمز</div>
                      <div className="col-span-2"></div>
                    </div>
                    {values.map((value, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center bg-muted/30 rounded-lg p-2">
                        <div className="col-span-1 flex justify-center">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        </div>
                        <Input 
                          className="col-span-3 h-8"
                          placeholder="Red"
                          value={value.value}
                          onChange={(e) => updateValue(index, 'value', e.target.value)}
                        />
                        <Input 
                          className="col-span-3 h-8"
                          placeholder="أحمر"
                          value={value.valueAr}
                          onChange={(e) => updateValue(index, 'valueAr', e.target.value)}
                        />
                        <Input 
                          className="col-span-3 h-8"
                          placeholder="RED"
                          value={value.code}
                          onChange={(e) => updateValue(index, 'code', e.target.value)}
                        />
                        <div className="col-span-2 flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => removeValue(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>لم يتم إضافة قيم بعد</p>
                    <Button variant="outline" className="mt-4" onClick={addValue}>
                      إضافة قيمة
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>إلغاء</Button>
            <Button onClick={handleSave}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
