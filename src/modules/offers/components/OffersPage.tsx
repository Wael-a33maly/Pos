// ============================================
// OffersPage - صفحة إدارة العروض
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Percent, Tag, Clock, CheckCircle, XCircle, Plus, Edit, Trash2, Search,
  Gift, Zap, Calendar, Users, Package, Filter, MoreVertical, Copy
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAppStore, formatCurrency } from '@/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { useOffers } from '../hooks';
import {
  OFFER_TYPE_LABELS,
  DISCOUNT_TYPE_LABELS,
  APPLY_TYPE_LABELS,
  CUSTOMER_TARGET_LABELS,
  type Offer,
  type OfferFormData,
  type OfferType,
  type DiscountType,
  type ApplyType,
  type CustomerTarget,
} from '../types';

// أيام الأسبوع
const DAYS_OF_WEEK = [
  { value: 0, label: 'الأحد', labelEn: 'Sunday' },
  { value: 1, label: 'الإثنين', labelEn: 'Monday' },
  { value: 2, label: 'الثلاثاء', labelEn: 'Tuesday' },
  { value: 3, label: 'الأربعاء', labelEn: 'Wednesday' },
  { value: 4, label: 'الخميس', labelEn: 'Thursday' },
  { value: 5, label: 'الجمعة', labelEn: 'Friday' },
  { value: 6, label: 'السبت', labelEn: 'Saturday' },
];

// نموذج عرض جديد فارغ
const DEFAULT_FORM: OfferFormData = {
  name: '',
  nameAr: '',
  description: '',
  descriptionAr: '',
  type: 'PRODUCT_DISCOUNT',
  discountType: 'PERCENTAGE',
  discountValue: 0,
  maxDiscount: undefined,
  startDate: '',
  endDate: '',
  minPurchase: undefined,
  minQuantity: undefined,
  maxUses: undefined,
  maxUsesPerUser: undefined,
  appliesTo: 'ALL',
  productIds: [],
  categoryIds: [],
  brandIds: [],
  branchIds: [],
  priority: 0,
  isCombinable: false,
  targetCustomers: 'ALL',
  tierIds: [],
  activeDays: [],
  startTime: undefined,
  endTime: undefined,
  isActive: true,
  isAutoApplied: true,
  code: '',
  items: [],
};

export function OffersPage() {
  const { currency } = useAppStore();
  const {
    offers,
    loading,
    searchQuery,
    statusFilter,
    typeFilter,
    setSearchQuery,
    setStatusFilter,
    setTypeFilter,
    fetchData,
    createOffer,
    updateOffer,
    deleteOffer,
    toggleOfferStatus,
    filteredOffers,
    stats,
  } = useOffers();

  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [form, setForm] = useState<OfferFormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  // فتح نافذة الإنشاء
  const openCreateDialog = () => {
    setSelectedOffer(null);
    setForm({
      ...DEFAULT_FORM,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setShowDialog(true);
  };

  // فتح نافذة التعديل
  const openEditDialog = (offer: Offer) => {
    setSelectedOffer(offer);
    setForm({
      name: offer.name,
      nameAr: offer.nameAr || '',
      description: offer.description || '',
      descriptionAr: offer.descriptionAr || '',
      type: offer.type,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      maxDiscount: offer.maxDiscount || undefined,
      startDate: new Date(offer.startDate).toISOString().split('T')[0],
      endDate: new Date(offer.endDate).toISOString().split('T')[0],
      minPurchase: offer.minPurchase || undefined,
      minQuantity: offer.minQuantity || undefined,
      maxUses: offer.maxUses || undefined,
      maxUsesPerUser: offer.maxUsesPerUser || undefined,
      appliesTo: offer.appliesTo,
      productIds: offer.productIds || [],
      categoryIds: offer.categoryIds || [],
      brandIds: offer.brandIds || [],
      branchIds: offer.branchIds || [],
      priority: offer.priority,
      isCombinable: offer.isCombinable,
      targetCustomers: offer.targetCustomers,
      tierIds: offer.tierIds || [],
      activeDays: offer.activeDays || [],
      startTime: offer.startTime || undefined,
      endTime: offer.endTime || undefined,
      isActive: offer.isActive,
      isAutoApplied: offer.isAutoApplied,
      code: offer.code || '',
      items: offer.items?.map(item => ({
        productId: item.productId,
        variationId: item.variationId,
        discountValue: item.discountValue,
        discountType: item.discountType,
        requiredQty: item.requiredQty,
        freeQty: item.freeQty,
        freeProductId: item.freeProductId,
        freeVariationId: item.freeVariationId,
      })) || [],
    });
    setShowDialog(true);
  };

  // حفظ العرض
  const handleSave = async () => {
    if (!form.name || form.discountValue <= 0) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setSaving(true);
    let success = false;
    
    if (selectedOffer) {
      success = await updateOffer(selectedOffer.id, form);
    } else {
      success = await createOffer(form);
    }
    
    setSaving(false);
    if (success) {
      setShowDialog(false);
    }
  };

  // حذف العرض
  const handleDelete = async () => {
    if (!selectedOffer) return;
    
    const success = await deleteOffer(selectedOffer.id);
    if (success) {
      setShowDeleteDialog(false);
      setSelectedOffer(null);
    }
  };

  // تحديد حالة العرض
  const getOfferStatus = (offer: Offer) => {
    const now = new Date();
    if (!offer.isActive) return 'inactive';
    if (new Date(offer.startDate) > now) return 'scheduled';
    if (new Date(offer.endDate) < now) return 'expired';
    return 'active';
  };

  // لون حالة العرض
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500';
      case 'scheduled': return 'bg-blue-500';
      case 'expired': return 'bg-gray-500';
      case 'inactive': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // نص حالة العرض
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'scheduled': return 'مجدول';
      case 'expired': return 'منتهي';
      case 'inactive': return 'معطل';
      default: return status;
    }
  };

  // نسخ كود الخصم
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('تم نسخ الكود');
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 pb-10" dir="rtl">
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold">إدارة العروض</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Gift className="h-4 w-4" />
            إنشاء وإدارة العروض والخصومات
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          عرض جديد
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Tag className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">إجمالي العروض</p>
                <p className="text-2xl font-bold">{stats.totalOffers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">عروض نشطة</p>
                <p className="text-2xl font-bold">{stats.activeOffers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">عروض مجدولة</p>
                <p className="text-2xl font-bold">{stats.scheduledOffers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">عروض منتهية</p>
                <p className="text-2xl font-bold">{stats.expiredOffers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="بحث بالاسم أو الكود..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 ml-2" />
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="active">نشط</SelectItem>
            <SelectItem value="scheduled">مجدول</SelectItem>
            <SelectItem value="expired">منتهي</SelectItem>
            <SelectItem value="inactive">معطل</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="نوع العرض" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأنواع</SelectItem>
            {Object.entries(OFFER_TYPE_LABELS).map(([key, value]) => (
              <SelectItem key={key} value={key}>{value.labelAr}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Offers Table */}
      <Card>
        <CardContent className="p-0">
          {filteredOffers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Gift className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">لا توجد عروض</p>
              <p className="text-sm">ابدأ بإنشاء عرض جديد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>العرض</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الخصم</TableHead>
                    <TableHead>الفترة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الاستخدامات</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredOffers.map((offer, index) => {
                      const status = getOfferStatus(offer);
                      return (
                        <motion.tr
                          key={offer.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b"
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{offer.nameAr || offer.name}</p>
                              {offer.code && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <span dir="ltr" className="font-mono bg-muted px-1 rounded">{offer.code}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() => copyCode(offer.code!)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn('text-white', OFFER_TYPE_LABELS[offer.type].color)}>
                              {OFFER_TYPE_LABELS[offer.type].labelAr}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-emerald-600">
                              {offer.discountType === 'PERCENTAGE' 
                                ? `${offer.discountValue}%` 
                                : formatCurrency(offer.discountValue, currency)}
                            </span>
                            {offer.maxDiscount && (
                              <span className="text-xs text-muted-foreground block">
                                حد أقصى {formatCurrency(offer.maxDiscount, currency)}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(offer.startDate).toLocaleDateString('ar-EG')}</span>
                              </div>
                              <div className="text-muted-foreground">
                                إلى {new Date(offer.endDate).toLocaleDateString('ar-EG')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={cn('w-2 h-2 rounded-full', getStatusColor(status))} />
                              <span>{getStatusText(status)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{offer.currentUses || 0}</span>
                            {offer.maxUses && <span className="text-muted-foreground"> / {offer.maxUses}</span>}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={offer.isActive}
                                onCheckedChange={(checked) => toggleOfferStatus(offer.id, checked)}
                              />
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEditDialog(offer)}>
                                    <Edit className="h-4 w-4 ml-2" />
                                    تعديل
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedOffer(offer);
                                      setShowDeleteDialog(true);
                                    }}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 ml-2" />
                                    حذف
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedOffer ? 'تعديل العرض' : 'إنشاء عرض جديد'}</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6">
              {/* معلومات أساسية */}
              <div className="space-y-4">
                <h4 className="font-semibold">معلومات أساسية</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>الاسم (عربي) *</Label>
                    <Input 
                      value={form.nameAr}
                      onChange={(e) => setForm(prev => ({ ...prev, nameAr: e.target.value }))}
                      placeholder="اسم العرض بالعربية"
                    />
                  </div>
                  <div>
                    <Label>الاسم (إنجليزي)</Label>
                    <Input 
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Offer Name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>الوصف (عربي)</Label>
                    <Textarea 
                      value={form.descriptionAr}
                      onChange={(e) => setForm(prev => ({ ...prev, descriptionAr: e.target.value }))}
                      placeholder="وصف العرض"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>الوصف (إنجليزي)</Label>
                    <Textarea 
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* نوع العرض والخصم */}
              <div className="space-y-4">
                <h4 className="font-semibold">نوع العرض والخصم</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>نوع العرض</Label>
                    <Select 
                      value={form.type} 
                      onValueChange={(value: OfferType) => setForm(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(OFFER_TYPE_LABELS).map(([key, value]) => (
                          <SelectItem key={key} value={key}>{value.labelAr}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>نوع الخصم</Label>
                    <Select 
                      value={form.discountType} 
                      onValueChange={(value: DiscountType) => setForm(prev => ({ ...prev, discountType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DISCOUNT_TYPE_LABELS).map(([key, value]) => (
                          <SelectItem key={key} value={key}>{value.labelAr}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>قيمة الخصم *</Label>
                    <Input 
                      type="number"
                      value={form.discountValue}
                      onChange={(e) => setForm(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label>أقصى قيمة للخصم</Label>
                    <Input 
                      type="number"
                      value={form.maxDiscount || ''}
                      onChange={(e) => setForm(prev => ({ ...prev, maxDiscount: e.target.value ? parseFloat(e.target.value) : undefined }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* الفترة الزمنية */}
              <div className="space-y-4">
                <h4 className="font-semibold">الفترة الزمنية</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>تاريخ البدء</Label>
                    <Input 
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>تاريخ الانتهاء</Label>
                    <Input 
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>وقت البدء (اختياري)</Label>
                    <Input 
                      type="time"
                      value={form.startTime || ''}
                      onChange={(e) => setForm(prev => ({ ...prev, startTime: e.target.value || undefined }))}
                    />
                  </div>
                  <div>
                    <Label>وقت الانتهاء (اختياري)</Label>
                    <Input 
                      type="time"
                      value={form.endTime || ''}
                      onChange={(e) => setForm(prev => ({ ...prev, endTime: e.target.value || undefined }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* شروط العرض */}
              <div className="space-y-4">
                <h4 className="font-semibold">شروط العرض</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>الحد الأدنى للمشتريات</Label>
                    <Input 
                      type="number"
                      value={form.minPurchase || ''}
                      onChange={(e) => setForm(prev => ({ ...prev, minPurchase: e.target.value ? parseFloat(e.target.value) : undefined }))}
                    />
                  </div>
                  <div>
                    <Label>الحد الأدنى للكمية</Label>
                    <Input 
                      type="number"
                      value={form.minQuantity || ''}
                      onChange={(e) => setForm(prev => ({ ...prev, minQuantity: e.target.value ? parseInt(e.target.value) : undefined }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>أقصى عدد استخدامات</Label>
                    <Input 
                      type="number"
                      value={form.maxUses || ''}
                      onChange={(e) => setForm(prev => ({ ...prev, maxUses: e.target.value ? parseInt(e.target.value) : undefined }))}
                    />
                  </div>
                  <div>
                    <Label>أقصى استخدامات لكل عميل</Label>
                    <Input 
                      type="number"
                      value={form.maxUsesPerUser || ''}
                      onChange={(e) => setForm(prev => ({ ...prev, maxUsesPerUser: e.target.value ? parseInt(e.target.value) : undefined }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* تطبيق على */}
              <div className="space-y-4">
                <h4 className="font-semibold">نطاق التطبيق</h4>
                <div>
                  <Label>يطبق على</Label>
                  <Select 
                    value={form.appliesTo} 
                    onValueChange={(value: ApplyType) => setForm(prev => ({ ...prev, appliesTo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(APPLY_TYPE_LABELS).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value.labelAr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>العملاء المستهدفون</Label>
                  <Select 
                    value={form.targetCustomers} 
                    onValueChange={(value: CustomerTarget) => setForm(prev => ({ ...prev, targetCustomers: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CUSTOMER_TARGET_LABELS).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value.labelAr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* إعدادات إضافية */}
              <div className="space-y-4">
                <h4 className="font-semibold">إعدادات إضافية</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>كود الخصم (اختياري)</Label>
                    <Input 
                      value={form.code}
                      onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="مثال: SUMMER2024"
                    />
                  </div>
                  <div>
                    <Label>الأولوية</Label>
                    <Input 
                      type="number"
                      value={form.priority}
                      onChange={(e) => setForm(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.isActive}
                      onCheckedChange={(checked) => setForm(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label>تفعيل العرض</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.isAutoApplied}
                      onCheckedChange={(checked) => setForm(prev => ({ ...prev, isAutoApplied: checked }))}
                    />
                    <Label>تطبيق تلقائي</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.isCombinable}
                      onCheckedChange={(checked) => setForm(prev => ({ ...prev, isCombinable: checked }))}
                    />
                    <Label>قابل للدمج</Label>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p>هل أنت متأكد من حذف هذا العرض؟</p>
          {selectedOffer && (
            <p className="font-medium">{selectedOffer.nameAr || selectedOffer.name}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDelete}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
