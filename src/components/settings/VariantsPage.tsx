'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, MoreHorizontal, Tags, ChevronDown, ChevronUp, Loader2, X, DollarSign, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface VariantPrice {
  id: string;
  name: string;
  nameAr: string | null;
  costPrice: number;
  sellingPrice: number;
  barcode: string | null;
}

interface VariantOption {
  id: string;
  name: string;
  nameAr: string | null;
  prices: VariantPrice[];
}

interface VariantType {
  id: string;
  name: string;
  nameAr: string | null;
  options: VariantOption[];
  isActive: boolean;
}

export function VariantsPage() {
  const [variantTypes, setVariantTypes] = useState<VariantType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showOptionDialog, setShowOptionDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<VariantType | null>(null);
  const [selectedOption, setSelectedOption] = useState<VariantOption | null>(null);
  const [expandedTypes, setExpandedTypes] = useState<string[]>([]);
  const [formData, setFormData] = useState({ name: '', nameAr: '', isActive: true });
  const [optionFormData, setOptionFormData] = useState({ name: '', nameAr: '' });
  const [prices, setPrices] = useState<{ name: string; nameAr: string; costPrice: number; sellingPrice: number; barcode: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchVariants = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/variants');
      if (!response.ok) throw new Error('Failed to fetch variants');
      const data = await response.json();
      setVariantTypes(data);
    } catch (error) {
      console.error('Error fetching variants:', error);
      toast.error('فشل في تحميل المتغيرات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const filteredTypes = variantTypes.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.nameAr?.includes(searchQuery) ?? false)
  );

  const toggleExpanded = (id: string) => {
    setExpandedTypes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  // === Variant Type Management ===
  const handleSaveType = async () => {
    if (!formData.nameAr) {
      toast.error('الاسم العربي مطلوب');
      return;
    }

    try {
      setSaving(true);
      const url = selectedType ? `/api/variants/${selectedType.id}` : '/api/variants';
      const method = selectedType ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name || formData.nameAr,
          nameAr: formData.nameAr,
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save variant type');
      }

      toast.success(selectedType ? 'تم تحديث المتغير بنجاح' : 'تم إضافة المتغير بنجاح');
      setShowAddDialog(false);
      resetForm();
      fetchVariants();
    } catch (error) {
      console.error('Error saving variant type:', error);
      toast.error(error instanceof Error ? error.message : 'فشل في حفظ المتغير');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteType = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا النوع؟ سيتم حذف جميع الخيارات والأسعار المرتبطة.')) return;

    try {
      const response = await fetch(`/api/variants/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete variant type');
      }
      toast.success('تم حذف المتغير بنجاح');
      fetchVariants();
    } catch (error) {
      console.error('Error deleting variant type:', error);
      toast.error(error instanceof Error ? error.message : 'فشل في حذف المتغير');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', nameAr: '', isActive: true });
    setSelectedType(null);
  };

  const openEditType = (type: VariantType) => {
    setSelectedType(type);
    setFormData({
      name: type.name,
      nameAr: type.nameAr || type.name,
      isActive: type.isActive,
    });
    setShowAddDialog(true);
  };

  // === Option Management ===
  const openAddOptionDialog = (type: VariantType) => {
    setSelectedType(type);
    setSelectedOption(null);
    setOptionFormData({ name: '', nameAr: '' });
    setPrices([{ name: 'سعر قطاعي', nameAr: 'سعر قطاعي', costPrice: 0, sellingPrice: 0, barcode: '' }]);
    setShowOptionDialog(true);
  };

  const openEditOptionDialog = (type: VariantType, option: VariantOption) => {
    setSelectedType(type);
    setSelectedOption(option);
    setOptionFormData({
      name: option.name,
      nameAr: option.nameAr || option.name,
    });
    setPrices(option.prices.length > 0 
      ? option.prices.map(p => ({
          name: p.name,
          nameAr: p.nameAr || p.name,
          costPrice: p.costPrice,
          sellingPrice: p.sellingPrice,
          barcode: p.barcode || '',
        }))
      : [{ name: 'سعر قطاعي', nameAr: 'سعر قطاعي', costPrice: 0, sellingPrice: 0, barcode: '' }]
    );
    setShowOptionDialog(true);
  };

  const addPriceRow = () => {
    setPrices(prev => [...prev, { 
      name: `سعر ${prev.length + 1}`, 
      nameAr: `سعر ${prev.length + 1}`, 
      costPrice: 0, 
      sellingPrice: 0, 
      barcode: '' 
    }]);
  };

  const removePriceRow = (index: number) => {
    if (prices.length > 1) {
      setPrices(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updatePriceRow = (index: number, field: string, value: string | number) => {
    setPrices(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const generateBarcode = () => {
    return Date.now().toString().slice(-12);
  };

  const handleSaveOption = async () => {
    if (!selectedType) return;
    if (!optionFormData.nameAr) {
      toast.error('اسم الخيار مطلوب');
      return;
    }
    if (prices.some(p => !p.nameAr)) {
      toast.error('جميع الأسعار يجب أن يكون لها اسم');
      return;
    }

    try {
      setSaving(true);

      const pricesWithBarcodes = prices.map(p => ({
        ...p,
        barcode: p.barcode || generateBarcode(),
      }));

      if (selectedOption) {
        const response = await fetch(`/api/variants/options/${selectedOption.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: optionFormData.name || optionFormData.nameAr,
            nameAr: optionFormData.nameAr,
            prices: pricesWithBarcodes,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update option');
        }
        toast.success('تم تحديث الخيار بنجاح');
      } else {
        const response = await fetch('/api/variants/options', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            variantTypeId: selectedType.id,
            name: optionFormData.name || optionFormData.nameAr,
            nameAr: optionFormData.nameAr,
            prices: pricesWithBarcodes,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create option');
        }
        toast.success('تم إضافة الخيار بنجاح');
      }

      setShowOptionDialog(false);
      fetchVariants();
    } catch (error) {
      console.error('Error saving option:', error);
      toast.error(error instanceof Error ? error.message : 'فشل في حفظ الخيار');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الخيار؟')) return;

    try {
      const response = await fetch(`/api/variants/options/${optionId}`, { method: 'DELETE' });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete option');
      }
      toast.success('تم حذف الخيار بنجاح');
      fetchVariants();
    } catch (error) {
      console.error('Error deleting option:', error);
      toast.error(error instanceof Error ? error.message : 'فشل في حذف الخيار');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">المتغيرات</h1>
          <p className="text-muted-foreground">إدارة أنواع المتغيرات والخيارات والأسعار المتعددة</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
          <Plus className="h-4 w-4 ml-2" /> إضافة نوع متغير
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredTypes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            لا توجد أنواع متغيرات
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTypes.map(type => (
            <Card key={type.id}>
              <Collapsible open={expandedTypes.includes(type.id)} onOpenChange={() => toggleExpanded(type.id)}>
                <div className="flex items-center justify-between p-4">
                  <CollapsibleTrigger asChild>
                    <button className="flex items-center gap-3 flex-1 text-right">
                      <Tags className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{type.nameAr || type.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {type.name} • {type.options.length} خيار
                        </p>
                      </div>
                      {expandedTypes.includes(type.id) ?
                        <ChevronUp className="h-4 w-4 mr-auto" /> :
                        <ChevronDown className="h-4 w-4 mr-auto" />
                      }
                    </button>
                  </CollapsibleTrigger>
                  <Badge variant={type.isActive ? 'default' : 'secondary'} className="ml-2">
                    {type.isActive ? 'نشط' : 'غير نشط'}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditType(type)}>
                        <Edit className="ml-2 h-4 w-4" /> تعديل النوع
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openAddOptionDialog(type)}>
                        <Plus className="ml-2 h-4 w-4" /> إضافة خيار
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteType(type.id)}
                      >
                        <Trash2 className="ml-2 h-4 w-4" /> حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    {type.options.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground mb-3">لا توجد خيارات لهذا النوع</p>
                        <Button variant="outline" size="sm" onClick={() => openAddOptionDialog(type)}>
                          <Plus className="h-4 w-4 ml-2" /> إضافة خيار
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {type.options.map(opt => (
                          <div key={opt.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="font-medium">
                                  {opt.nameAr || opt.name}
                                  <span className="text-xs text-muted-foreground mr-2">({opt.name})</span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {opt.prices.length} سعر
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditOptionDialog(type, opt)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteOption(opt.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {opt.prices.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {opt.prices.map(p => (
                                  <div key={p.id} className="bg-muted/50 rounded p-3 text-sm">
                                    <div className="flex items-center justify-between">
                                      <p className="font-medium">{p.nameAr || p.name}</p>
                                      {p.barcode && (
                                        <code className="text-[10px] bg-background px-1 rounded">{p.barcode.slice(-6)}</code>
                                      )}
                                    </div>
                                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                                      <span>تكلفة: {p.costPrice}</span>
                                      <span>بيع: {p.sellingPrice}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Variant Type Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedType ? 'تعديل نوع المتغير' : 'إضافة نوع متغير جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الاسم (عربي) *</Label>
                <Input
                  value={formData.nameAr}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                />
              </div>
              <div>
                <Label>الاسم (إنجليزي)</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(v) => setFormData(prev => ({ ...prev, isActive: v }))}
              />
              <Label>نشط</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>إلغاء</Button>
            <Button onClick={handleSaveType} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Option Dialog with Multiple Prices */}
      <Dialog open={showOptionDialog} onOpenChange={setShowOptionDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedOption ? 'تعديل خيار' : 'إضافة خيار جديد'}
              {selectedType && <span className="text-muted-foreground mr-2">- {selectedType.nameAr || selectedType.name}</span>}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[65vh]">
            <div className="space-y-4 px-1 pb-2">
              {/* Option Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">اسم الخيار (عربي) *</Label>
                  <Input
                    value={optionFormData.nameAr}
                    onChange={(e) => setOptionFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                    placeholder="مثال: أحمر، كبير"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm">اسم الخيار (إنجليزي)</Label>
                  <Input
                    value={optionFormData.name}
                    onChange={(e) => setOptionFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Red, Large"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <Separator />

              {/* Prices Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">الأسعار</span>
                    <Badge variant="secondary" className="text-xs">{prices.length}</Badge>
                  </div>
                  <Button variant="outline" size="sm" onClick={addPriceRow}>
                    <Plus className="h-4 w-4 ml-1" /> إضافة سعر
                  </Button>
                </div>

                {/* Responsive Prices List */}
                <div className="space-y-2">
                  {prices.map((price, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {index + 1}
                          </span>
                          <Input
                            value={price.nameAr}
                            onChange={(e) => {
                              updatePriceRow(index, 'nameAr', e.target.value);
                              updatePriceRow(index, 'name', e.target.value);
                            }}
                            placeholder="اسم السعر"
                            className="h-8 w-32 sm:w-40"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => removePriceRow(index)}
                          disabled={prices.length <= 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">سعر التكلفة</Label>
                          <Input
                            type="number"
                            value={price.costPrice}
                            onChange={(e) => updatePriceRow(index, 'costPrice', parseFloat(e.target.value) || 0)}
                            className="h-8 mt-1"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">سعر البيع</Label>
                          <Input
                            type="number"
                            value={price.sellingPrice}
                            onChange={(e) => updatePriceRow(index, 'sellingPrice', parseFloat(e.target.value) || 0)}
                            className="h-8 mt-1"
                            placeholder="0"
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <Label className="text-xs text-muted-foreground">الباركود</Label>
                          <div className="flex gap-1 mt-1">
                            <Input
                              value={price.barcode}
                              onChange={(e) => updatePriceRow(index, 'barcode', e.target.value)}
                              placeholder="تلقائي"
                              className="h-8 flex-1"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={() => updatePriceRow(index, 'barcode', generateBarcode())}
                              title="توليد باركود"
                            >
                              <Hash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  * إذا تركت حقل الباركود فارغاً، سيتم توليده تلقائياً
                </p>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowOptionDialog(false)}>إلغاء</Button>
            <Button onClick={handleSaveOption} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              حفظ الخيار
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
