// ============================================
// Products Page - صفحة المنتجات
// ============================================

'use client';

import { useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit, Trash2, MoreHorizontal, Package, Filter, Download, Upload, QrCode, Eye, Copy, ChevronDown, X, Sparkles, TrendingUp, AlertCircle, Barcode, Tag, Warehouse
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAppStore, formatCurrency } from '@/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { useProducts } from '../hooks';
import { StatsCard } from './StatsCard';
import { ProductSkeleton } from './ProductSkeleton';
import type { Product, ProductFormData, VariationFormData } from '../types';

// Default form data
const defaultFormData: ProductFormData = {
  barcode: '', sku: '', name: '', nameAr: '', description: '',
  categoryId: '', brandId: '', supplierId: '', costPrice: 0, sellingPrice: 0,
  wholesalePrice: 0, minStock: 0, maxStock: 0, unit: 'piece', hasVariants: false, 
  isStockTracked: true, isActive: true
};

const defaultVariation: VariationFormData = {
  price: 0, name: '', barcode: '', stock: 0, isStockTracked: true
};

export function ProductsPage() {
  const { currency } = useAppStore();
  const {
    categories, brands, suppliers, loading, searchQuery, selectedCategory,
    setSearchQuery, setSelectedCategory, saveProduct, deleteProduct, filteredProducts, stats
  } = useProducts();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [expandedVariations, setExpandedVariations] = useState<string[]>([]);
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [variations, setVariations] = useState<VariationFormData[]>([]);

  // Handlers
  const handleSave = async () => {
    const success = await saveProduct(formData, variations, selectedProduct);
    if (success) {
      setShowAddDialog(false);
      resetForm();
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    const success = await deleteProduct(selectedProduct.id);
    if (success) {
      setShowDeleteDialog(false);
      setSelectedProduct(null);
    }
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setVariations([]);
    setSelectedProduct(null);
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      barcode: product.barcode, sku: product.sku || '', name: product.name, nameAr: product.nameAr || '',
      description: product.description || '', categoryId: product.categoryId || '', brandId: product.brandId || '',
      supplierId: product.supplierId || '', costPrice: product.costPrice, sellingPrice: product.sellingPrice,
      wholesalePrice: product.wholesalePrice || 0, minStock: product.minStock, maxStock: product.maxStock || 0,
      unit: product.unit, hasVariants: product.hasVariants, isStockTracked: product.isStockTracked ?? true,
      isActive: product.isActive
    });
    // تحميل المتغيرات الجديدة
    if (product.variations && product.variations.length > 0) {
      setVariations(product.variations.map(v => ({
        id: v.id,
        price: v.price,
        name: v.name || '',
        barcode: v.barcode,
        stock: v.stock,
        isStockTracked: v.isStockTracked
      })));
    } else {
      setVariations([]);
    }
    setShowAddDialog(true);
  };

  const addVariation = () => {
    const newIndex = variations.length + 1;
    const newBarcode = `${formData.barcode}-${newIndex}`;
    setVariations(prev => [...prev, { 
      ...defaultVariation, 
      price: formData.sellingPrice,
      barcode: newBarcode
    }]);
  };

  const removeVariation = (index: number) => {
    setVariations(prev => prev.filter((_, i) => i !== index));
  };

  const updateVariation = (index: number, field: string, value: string | number | boolean) => {
    setVariations(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const toggleVariations = (productId: string) => {
    setExpandedVariations(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  // توليد باركود عشوائي
  const generateBarcode = () => {
    const barcode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    setFormData(prev => ({ ...prev, barcode }));
  };

  if (loading) {
    return <div className="p-6"><ProductSkeleton /></div>;
  }

  return (
    <div className="p-6 space-y-6 pb-10">
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold">المنتجات</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Package className="h-4 w-4" />
            إدارة المنتجات والمخزون
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" /> استيراد
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> تصدير
          </Button>
          <Button className="gap-2" onClick={() => { resetForm(); setShowAddDialog(true); }}>
            <Plus className="h-4 w-4" /> إضافة منتج
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatsCard title="إجمالي المنتجات" value={stats.totalProducts} icon={Package} gradient="bg-gradient-to-br from-emerald-500 to-emerald-600" delay={0} />
        <StatsCard title="المنتجات النشطة" value={stats.activeProducts} icon={TrendingUp} gradient="bg-gradient-to-br from-blue-500 to-blue-600" delay={0.1} />
        <StatsCard title="منتجات بمتغيرات" value={stats.productsWithVariants} icon={Sparkles} gradient="bg-gradient-to-br from-purple-500 to-purple-600" delay={0.2} />
        <StatsCard title="مخزون منخفض" value={stats.lowStockProducts} icon={AlertCircle} gradient="bg-gradient-to-br from-amber-500 to-amber-600" delay={0.3} />
      </div>

      {/* Search and Filters */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="بحث بالاسم أو الباركود..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="pr-10 bg-background/50" 
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48 bg-background/50">
            <Filter className="h-4 w-4 ml-2 text-muted-foreground" />
            <SelectValue placeholder="اختر الفئة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الفئات</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {filteredProducts.length === 0 ? (
              <motion.div 
                className="flex flex-col items-center justify-center py-16 text-muted-foreground"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Package className="h-16 w-16 mb-4 opacity-50" />
                </motion.div>
                <p className="text-lg font-medium">لا توجد منتجات</p>
                <p className="text-sm">جرب تغيير البحث أو الفلتر</p>
              </motion.div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>المنتج</TableHead>
                    <TableHead>الباركود</TableHead>
                    <TableHead>الفئة</TableHead>
                    <TableHead>سعر التكلفة</TableHead>
                    <TableHead>سعر البيع</TableHead>
                    <TableHead>المتغيرات</TableHead>
                    <TableHead>المخزون</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.map((product) => {
                      const hasVariations = product.variations && product.variations.length > 0;
                      const isExpanded = expandedVariations.includes(product.id);
                      const totalVariationStock = hasVariations 
                        ? product.variations!.filter(v => v.isStockTracked).reduce((sum, v) => sum + v.stock, 0)
                        : 0;
                      
                      return (
                        <Fragment key={product.id}>
                          <TableRow 
                            className="cursor-pointer hover:bg-muted/30 transition-colors"
                            onClick={() => hasVariations && toggleVariations(product.id)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center">
                                  <Package className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="font-medium">{product.name}</p>
                                  {product.nameAr && <p className="text-xs text-muted-foreground">{product.nameAr}</p>}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <code className="text-sm bg-muted px-2 py-1 rounded flex items-center gap-1">
                                  <Barcode className="h-3 w-3" />
                                  {product.barcode}
                                </code>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6" 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    navigator.clipboard.writeText(product.barcode); 
                                    toast.success('تم نسخ الباركود'); 
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>{categories.find(c => c.id === product.categoryId)?.name || '-'}</TableCell>
                            <TableCell>{formatCurrency(product.costPrice, currency)}</TableCell>
                            <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(product.sellingPrice, currency)}</TableCell>
                            <TableCell>
                              {hasVariations ? (
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20">{product.variations?.length} سعر</Badge>
                                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                    <ChevronDown className="h-4 w-4" />
                                  </motion.div>
                                </div>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {!product.isStockTracked ? (
                                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                                    <Warehouse className="h-3 w-3 ml-1" />
                                    مفتوح
                                  </Badge>
                                ) : hasVariations ? (
                                  <span className="text-sm">{totalVariationStock}</span>
                                ) : '-'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={product.isActive ? 'default' : 'secondary'} className={cn(product.isActive && "bg-emerald-500 hover:bg-emerald-600")}>
                                {product.isActive ? 'نشط' : 'غير نشط'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEditDialog(product)}>
                                    <Edit className="ml-2 h-4 w-4" /> تعديل
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Eye className="ml-2 h-4 w-4" /> عرض التفاصيل
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <QrCode className="ml-2 h-4 w-4" /> طباعة باركود
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedProduct(product); setShowDeleteDialog(true); }}>
                                    <Trash2 className="ml-2 h-4 w-4" /> حذف
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                          
                          {/* Variations Row */}
                          <AnimatePresence>
                            {hasVariations && isExpanded && (
                              <motion.tr
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-muted/20"
                              >
                                <td colSpan={9} className="p-0">
                                  <div className="pr-8 py-2">
                                    {product.variations?.map(variation => (
                                      <motion.div 
                                        key={variation.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 mb-2"
                                      >
                                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded flex items-center justify-center">
                                          <Tag className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">
                                            {variation.name || 'سعر إضافي'}
                                          </p>
                                        </div>
                                        <code className="text-xs bg-muted px-2 py-1 rounded">{variation.barcode}</code>
                                        <span className="text-sm font-medium text-emerald-600">{formatCurrency(variation.price, currency)}</span>
                                        {variation.isStockTracked ? (
                                          <Badge variant="outline">مخزون: {variation.stock}</Badge>
                                        ) : (
                                          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600">مفتوح</Badge>
                                        )}
                                      </motion.div>
                                    ))}
                                  </div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </Fragment>
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              {selectedProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">معلومات أساسية</TabsTrigger>
              <TabsTrigger value="pricing">التسعير والمخزون</TabsTrigger>
              <TabsTrigger value="variations">متغيرات الأسعار</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[55vh]">
              <TabsContent value="basic" className="space-y-4 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>اسم المنتج (عربي) *</Label>
                    <Input placeholder="اسم المنتج بالعربية" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
                  </div>
                  <div>
                    <Label>اسم المنتج (إنجليزي)</Label>
                    <Input placeholder="Product Name" value={formData.nameAr} onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))} />
                  </div>
                  <div>
                    <Label>الباركود *</Label>
                    <div className="flex gap-2">
                      <Input placeholder="أدخل الباركود" value={formData.barcode} onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))} />
                      <Button variant="outline" onClick={generateBarcode}>توليد</Button>
                    </div>
                  </div>
                  <div>
                    <Label>رمز المنتج (SKU)</Label>
                    <Input placeholder="SKU-001" value={formData.sku} onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))} />
                  </div>
                  <div>
                    <Label>الفئة</Label>
                    <Select value={formData.categoryId} onValueChange={(v) => setFormData(prev => ({ ...prev, categoryId: v }))}>
                      <SelectTrigger><SelectValue placeholder="اختر الفئة" /></SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>البراند</Label>
                    <Select value={formData.brandId} onValueChange={(v) => setFormData(prev => ({ ...prev, brandId: v }))}>
                      <SelectTrigger><SelectValue placeholder="اختر البراند" /></SelectTrigger>
                      <SelectContent>
                        {brands.map(brand => <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>المورد</Label>
                    <Select value={formData.supplierId} onValueChange={(v) => setFormData(prev => ({ ...prev, supplierId: v }))}>
                      <SelectTrigger><SelectValue placeholder="اختر المورد" /></SelectTrigger>
                      <SelectContent>
                        {suppliers.map(sup => <SelectItem key={sup.id} value={sup.id}>{sup.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>الوحدة</Label>
                    <Select value={formData.unit} onValueChange={(v) => setFormData(prev => ({ ...prev, unit: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="piece">قطعة</SelectItem>
                        <SelectItem value="kg">كيلوغرام</SelectItem>
                        <SelectItem value="meter">متر</SelectItem>
                        <SelectItem value="liter">لتر</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>الوصف</Label>
                  <Textarea placeholder="وصف المنتج..." value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} />
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>سعر التكلفة *</Label>
                    <Input type="number" value={formData.costPrice} onChange={(e) => setFormData(prev => ({ ...prev, costPrice: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <div>
                    <Label>سعر البيع *</Label>
                    <Input type="number" value={formData.sellingPrice} onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <div>
                    <Label>سعر الجملة</Label>
                    <Input type="number" value={formData.wholesalePrice} onChange={(e) => setFormData(prev => ({ ...prev, wholesalePrice: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <div>
                    <Label>الحد الأدنى للمخزون</Label>
                    <Input type="number" value={formData.minStock} onChange={(e) => setFormData(prev => ({ ...prev, minStock: parseInt(e.target.value) || 0 }))} />
                  </div>
                  <div>
                    <Label>الحد الأقصى للمخزون</Label>
                    <Input type="number" value={formData.maxStock} onChange={(e) => setFormData(prev => ({ ...prev, maxStock: parseInt(e.target.value) || 0 }))} />
                  </div>
                </div>

                <Separator />

                {/* التحكم في المخزون */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">التحكم في المخزون</Label>
                  <RadioGroup 
                    value={formData.isStockTracked ? 'tracked' : 'open'} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, isStockTracked: v === 'tracked' }))}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className={cn(
                      "flex items-start space-x-3 space-y-0 space-reverse p-4 border rounded-lg cursor-pointer transition-all",
                      formData.isStockTracked ? "border-primary bg-primary/5" : "hover:border-muted-foreground/50"
                    )}>
                      <RadioGroupItem value="tracked" id="tracked" className="mt-1" />
                      <div className="space-y-1 leading-none">
                        <Label htmlFor="tracked" className="font-medium cursor-pointer">منتج مخزني</Label>
                        <p className="text-sm text-muted-foreground">يتقيد برصيد المخزن - لا يمكن بيع أكثر من المتوفر</p>
                      </div>
                    </div>
                    <div className={cn(
                      "flex items-start space-x-3 space-y-0 space-reverse p-4 border rounded-lg cursor-pointer transition-all",
                      !formData.isStockTracked ? "border-primary bg-primary/5" : "hover:border-muted-foreground/50"
                    )}>
                      <RadioGroupItem value="open" id="open" className="mt-1" />
                      <div className="space-y-1 leading-none">
                        <Label htmlFor="open" className="font-medium cursor-pointer">منتج غير مخزني</Label>
                        <p className="text-sm text-muted-foreground">بيع مفتوح - لا يتقيد بالمخزون (خدمات، منتجات رقمية)</p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </TabsContent>

              <TabsContent value="variations" className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold">متغيرات الأسعار</Label>
                    <p className="text-sm text-muted-foreground">أضف أسعاراً متعددة للمنتج - كل سعر له باركود مستقل</p>
                  </div>
                  <Button variant="outline" onClick={addVariation} className="gap-2">
                    <Plus className="h-4 w-4" /> إضافة سعر
                  </Button>
                </div>
                <Separator />
                
                {variations.length > 0 ? (
                  <div className="space-y-3">
                    {variations.map((variation, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-sm flex items-center gap-2">
                              <Tag className="h-4 w-4 text-emerald-600" />
                              السعر {index + 1}
                            </span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => removeVariation(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <Label className="text-xs">السعر (جنيه) *</Label>
                              <Input 
                                type="number" 
                                placeholder="السعر" 
                                value={variation.price} 
                                onChange={(e) => updateVariation(index, 'price', parseFloat(e.target.value) || 0)} 
                              />
                            </div>
                            <div>
                              <Label className="text-xs">اسم تقريبي (اختياري)</Label>
                              <Input 
                                placeholder="مثال: سعر الجملة" 
                                value={variation.name || ''} 
                                onChange={(e) => updateVariation(index, 'name', e.target.value)} 
                              />
                            </div>
                            <div>
                              <Label className="text-xs">الباركود</Label>
                              <Input 
                                placeholder="BAR-001-1" 
                                value={variation.barcode} 
                                onChange={(e) => updateVariation(index, 'barcode', e.target.value)} 
                              />
                            </div>
                            <div>
                              <Label className="text-xs">المخزون</Label>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                value={variation.stock} 
                                onChange={(e) => updateVariation(index, 'stock', parseInt(e.target.value) || 0)}
                                disabled={!variation.isStockTracked}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                            <Switch 
                              checked={variation.isStockTracked} 
                              onCheckedChange={(checked) => updateVariation(index, 'isStockTracked', checked)} 
                            />
                            <Label className="text-sm cursor-pointer">
                              {variation.isStockTracked ? 'تتبع المخزون' : 'بيع مفتوح (بدون تتبع)'}
                            </Label>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Tag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>لم يتم إضافة متغيرات أسعار</p>
                    <p className="text-sm mt-1">أضف أسعاراً متعددة للمنتج (سعر الجملة، عرض خاص، إلخ)</p>
                    <Button variant="outline" className="mt-4 gap-2" onClick={addVariation}>
                      <Plus className="h-4 w-4" /> إضافة سعر
                    </Button>
                  </div>
                )}

                {variations.length > 0 && (
                  <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
                    <strong>ملاحظة:</strong> عند إضافة متغيرات أسعار، سيُطلب من الكاتب في نقطة البيع اختيار السعر المناسب عند بيع المنتج.
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>إلغاء</Button>
            <Button onClick={handleSave} className="gap-2" disabled={!formData.name || !formData.barcode}>
              <Sparkles className="h-4 w-4" />
              حفظ المنتج
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p>هل أنت متأكد من حذف المنتج "{selectedProduct?.name}"؟</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDelete}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
