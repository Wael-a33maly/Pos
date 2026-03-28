// ============================================
// PurchasesPage - صفحة المشتريات
// ============================================

'use client';

import { useState, Fragment, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, ShoppingCart, Filter, Package, Truck, CheckCircle, XCircle,
  Clock, MoreHorizontal, Eye, Edit, Trash2, ChevronDown, AlertCircle, Building,
  Calendar, FileText
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore, formatCurrency } from '@/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { usePurchases } from '../hooks/usePurchases';
import { 
  PURCHASE_STATUS_LABELS, 
  RECEIPT_STATUS_LABELS,
  type PurchaseOrder, 
  type PurchaseOrderFormData,
  type PurchaseOrderItemFormData,
  type PurchaseStatus 
} from '../types';

interface Supplier {
  id: string;
  name: string;
  nameAr?: string;
  phone?: string;
}

interface Product {
  id: string;
  name: string;
  nameAr?: string;
  barcode: string;
  costPrice: number;
  unit: string;
  variations?: { id: string; name?: string; barcode: string }[];
}

export function PurchasesPage() {
  const { currency } = useAppStore();
  const {
    orders, loading, searchQuery, statusFilter, supplierFilter,
    setSearchQuery, setStatusFilter, setSupplierFilter,
    createOrder, updateOrderStatus, updateOrder, deleteOrder,
    filteredOrders, stats
  } = usePurchases();

  const [activeTab, setActiveTab] = useState('orders');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState<PurchaseOrderFormData>({
    supplierId: 'none',
    notes: '',
    items: []
  });

  // Suppliers and products
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('none');
  const [selectedQty, setSelectedQty] = useState(1);
  const [selectedCost, setSelectedCost] = useState(0);

  // Fetch suppliers and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersRes, productsRes] = await Promise.all([
          fetch('/api/suppliers'),
          fetch('/api/products?limit=100')
        ]);
        const suppliersData = await suppliersRes.json();
        const productsData = await productsRes.json();
        setSuppliers(suppliersData.suppliers || []);
        setProducts((productsData.products || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          nameAr: p.nameAr,
          barcode: p.barcode,
          costPrice: p.costPrice,
          unit: p.unit,
          variations: p.variations
        })));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const toggleExpand = (orderId: string) => {
    setExpandedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleCreate = async () => {
    if (!formData.supplierId || formData.supplierId === 'none') {
      toast.error('اختر المورد');
      return;
    }
    if (formData.items.length === 0) {
      toast.error('أضف منتجات لأمر الشراء');
      return;
    }

    const success = await createOrder(formData);
    
    if (success) {
      setShowCreateDialog(false);
      setFormData({ supplierId: 'none', notes: '', items: [] });
    }
  };

  const handleAddItem = () => {
    if (!selectedProduct || selectedProduct === 'none') return;
    
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const existingIndex = formData.items.findIndex(i => i.productId === selectedProduct);
    if (existingIndex >= 0) {
      const updated = [...formData.items];
      updated[existingIndex].orderedQty += selectedQty;
      setFormData(prev => ({ ...prev, items: updated }));
    } else {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, {
          productId: selectedProduct,
          productName: product.name,
          productBarcode: product.barcode,
          orderedQty: selectedQty,
          unitCost: selectedCost || product.costPrice
        }]
      }));
    }
    
    setSelectedProduct('none');
    setSelectedQty(1);
    setSelectedCost(0);
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleProcessOrder = async (status: PurchaseStatus, reason?: string) => {
    if (!selectedOrder) return;
    
    const success = await updateOrderStatus(selectedOrder.id, status, {
      cancellationReason: reason,
      userId: 'current-user'
    });
    
    if (success) {
      setShowProcessDialog(false);
      setSelectedOrder(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;
    const success = await deleteOrder(selectedOrder.id);
    if (success) {
      setShowDeleteDialog(false);
      setSelectedOrder(null);
    }
  };

  const getStatusBadge = (status: PurchaseStatus) => {
    const info = PURCHASE_STATUS_LABELS[status];
    return (
      <Badge className={cn("text-white", info.color)}>
        {info.labelAr}
      </Badge>
    );
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
          <h1 className="text-3xl font-bold">المشتريات</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <ShoppingCart className="h-4 w-4" />
            إدارة أوامر الشراء والاستلام
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4" /> أمر شراء جديد
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 opacity-80" />
              <div>
                <p className="text-xs opacity-80">إجمالي الأوامر</p>
                <p className="text-xl font-bold">{stats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 opacity-80" />
              <div>
                <p className="text-xs opacity-80">قيد الانتظار</p>
                <p className="text-xl font-bold">{stats.pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 opacity-80" />
              <div>
                <p className="text-xs opacity-80">تم الاستلام</p>
                <p className="text-xl font-bold">{stats.completedOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 opacity-80" />
              <div>
                <p className="text-xs opacity-80">متأخرة</p>
                <p className="text-xl font-bold">{stats.overdueOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 opacity-80" />
              <div>
                <p className="text-xs opacity-80">إجمالي القيمة</p>
                <p className="text-lg font-bold">{formatCurrency(stats.totalAmount, currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 opacity-80" />
              <div>
                <p className="text-xs opacity-80">المدفوع</p>
                <p className="text-lg font-bold">{formatCurrency(stats.totalPaid, currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-600 to-gray-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 opacity-80" />
              <div>
                <p className="text-xs opacity-80">المتبقي</p>
                <p className="text-lg font-bold">{formatCurrency(stats.totalPending, currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="orders">أوامر الشراء</TabsTrigger>
          <TabsTrigger value="receipts">إيصالات الاستلام</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {/* Filters */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="بحث برقم الأمر أو المورد..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pr-10 bg-background/50" 
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-48 bg-background/50">
                <Filter className="h-4 w-4 ml-2 text-muted-foreground" />
                <SelectValue placeholder="فلترة بالحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                {Object.entries(PURCHASE_STATUS_LABELS).map(([key, { labelAr }]) => (
                  <SelectItem key={key} value={key}>{labelAr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-48 bg-background/50">
                <Building className="h-4 w-4 ml-2 text-muted-foreground" />
                <SelectValue placeholder="جميع الموردين" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الموردين</SelectItem>
                {suppliers.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Orders Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-0">
                {filteredOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <ShoppingCart className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium">لا توجد أوامر شراء</p>
                    <p className="text-sm">ابدأ بإنشاء أمر شراء جديد</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>رقم الأمر</TableHead>
                        <TableHead>المورد</TableHead>
                        <TableHead>المنتجات</TableHead>
                        <TableHead>القيمة</TableHead>
                        <TableHead>المدفوع</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence mode="popLayout">
                        {filteredOrders.map((order) => {
                          const isExpanded = expandedOrders.includes(order.id);
                          const isOverdue = order.expectedDate && 
                            new Date(order.expectedDate) < new Date() && 
                            order.status !== 'RECEIVED' && 
                            order.status !== 'CANCELLED';
                          
                          return (
                            <Fragment key={order.id}>
                              <TableRow 
                                className={cn("cursor-pointer hover:bg-muted/30", isOverdue && "bg-red-50")}
                                onClick={() => toggleExpand(order.id)}
                              >
                                <TableCell>
                                  <code className="text-sm bg-muted px-2 py-1 rounded">
                                    {order.orderNumber}
                                  </code>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="text-sm">{order.supplier?.name || '-'}</span>
                                    {order.supplier?.phone && (
                                      <span className="text-xs text-muted-foreground">
                                        {order.supplier.phone}
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Badge variant="outline">{order.items?.length || 0} صنف</Badge>
                                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                                      <ChevronDown className="h-4 w-4" />
                                    </motion.div>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {formatCurrency(order.totalAmount, currency)}
                                </TableCell>
                                <TableCell>
                                  <span className={cn(
                                    order.paidAmount >= order.totalAmount ? "text-green-600" : 
                                    order.paidAmount > 0 ? "text-amber-600" : "text-muted-foreground"
                                  )}>
                                    {formatCurrency(order.paidAmount, currency)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(order.status)}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => { setSelectedOrder(order); setShowViewDialog(true); }}>
                                        <Eye className="ml-2 h-4 w-4" /> عرض التفاصيل
                                      </DropdownMenuItem>
                                      {order.status === 'DRAFT' && (
                                        <>
                                          <DropdownMenuItem onClick={() => handleProcessOrder('PENDING')}>
                                            <Truck className="ml-2 h-4 w-4" /> إرسال للمراجعة
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedOrder(order); setShowDeleteDialog(true); }}>
                                            <Trash2 className="ml-2 h-4 w-4" /> حذف
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                      {order.status === 'PENDING' && (
                                        <>
                                          <DropdownMenuItem onClick={() => handleProcessOrder('APPROVED')}>
                                            <CheckCircle className="ml-2 h-4 w-4" /> اعتماد
                                          </DropdownMenuItem>
                                          <DropdownMenuItem className="text-destructive" onClick={() => handleProcessOrder('CANCELLED')}>
                                            <XCircle className="ml-2 h-4 w-4" /> إلغاء
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                      {order.status === 'APPROVED' && (
                                        <DropdownMenuItem onClick={() => handleProcessOrder('ORDERED')}>
                                          <Truck className="ml-2 h-4 w-4" /> تأكيد الطلب
                                        </DropdownMenuItem>
                                      )}
                                      {order.status === 'ORDERED' && (
                                        <DropdownMenuItem onClick={() => { setSelectedOrder(order); setShowProcessDialog(true); }}>
                                          <Package className="ml-2 h-4 w-4" /> تسجيل استلام
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                              
                              {/* Expanded Items */}
                              <AnimatePresence>
                                {isExpanded && order.items && (
                                  <motion.tr
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-muted/20"
                                  >
                                    <td colSpan={8} className="p-0">
                                      <div className="pr-8 py-2">
                                        {order.items.map(item => (
                                          <div 
                                            key={item.id}
                                            className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 mb-2"
                                          >
                                            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                                              <Package className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1">
                                              <p className="text-sm font-medium">{item.productName}</p>
                                              <p className="text-xs text-muted-foreground">{item.productBarcode}</p>
                                            </div>
                                            <Badge variant="outline">الكمية: {item.orderedQty}</Badge>
                                            <Badge variant="outline" className="text-green-600">مستلم: {item.receivedQty}</Badge>
                                            <span className="text-sm">{formatCurrency(item.totalAmount, currency)}</span>
                                          </div>
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
        </TabsContent>

        <TabsContent value="receipts">
          <Card>
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <Package className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">إيصالات الاستلام</p>
                <p className="text-sm">سيتم عرض إيصالات الاستلام هنا</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Order Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              أمر شراء جديد
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh]">
            <div className="space-y-4 p-4">
              {/* Supplier Selection */}
              <div>
                <Label>المورد *</Label>
                <Select value={formData.supplierId} onValueChange={(v) => setFormData(prev => ({ ...prev, supplierId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المورد" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">اختر المورد</SelectItem>
                    {suppliers.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              {/* Add Products */}
              <div>
                <Label className="text-base font-semibold">إضافة منتجات</Label>
                <div className="grid grid-cols-12 gap-2 mt-2">
                  <div className="col-span-5">
                    <Select value={selectedProduct} onValueChange={(v) => {
                      setSelectedProduct(v);
                      if (v === 'none') {
                        setSelectedCost(0);
                        return;
                      }
                      const product = products.find(p => p.id === v);
                      if (product) setSelectedCost(product.costPrice);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المنتج" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">اختر المنتج</SelectItem>
                        {products.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name} ({p.barcode})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input 
                    type="number" 
                    className="col-span-2" 
                    placeholder="الكمية"
                    value={selectedQty}
                    onChange={(e) => setSelectedQty(parseInt(e.target.value) || 1)}
                    min={1}
                  />
                  <Input 
                    type="number" 
                    className="col-span-3" 
                    placeholder="سعر الوحدة"
                    value={selectedCost}
                    onChange={(e) => setSelectedCost(parseFloat(e.target.value) || 0)}
                  />
                  <Button className="col-span-2" onClick={handleAddItem}>إضافة</Button>
                </div>
              </div>
              
              {/* Items List */}
              {formData.items.length > 0 && (
                <div className="space-y-2">
                  <Label>المنتجات المحددة</Label>
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.orderedQty} × {formatCurrency(item.unitCost, currency)}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {formatCurrency(item.orderedQty * item.unitCost, currency)}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveItem(index)}>
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-medium p-2 bg-muted/50 rounded">
                    <span>الإجمالي</span>
                    <span>{formatCurrency(
                      formData.items.reduce((sum, item) => sum + item.orderedQty * item.unitCost, 0),
                      currency
                    )}</span>
                  </div>
                </div>
              )}
              
              <Separator />
              
              {/* Notes */}
              <div>
                <Label>ملاحظات</Label>
                <Textarea 
                  placeholder="ملاحظات إضافية..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>إلغاء</Button>
            <Button onClick={handleCreate}>إنشاء أمر الشراء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل أمر الشراء</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <code className="text-lg bg-muted px-3 py-1 rounded">
                  {selectedOrder.orderNumber}
                </code>
                {getStatusBadge(selectedOrder.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">المورد</p>
                  <p className="font-medium">{selectedOrder.supplier?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">تاريخ الأمر</p>
                  <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString('ar-EG')}</p>
                </div>
                {selectedOrder.expectedDate && (
                  <div>
                    <p className="text-muted-foreground">تاريخ التسليم المتوقع</p>
                    <p className="font-medium">{new Date(selectedOrder.expectedDate).toLocaleDateString('ar-EG')}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">القيمة الإجمالية</p>
                  <p className="font-medium">{formatCurrency(selectedOrder.totalAmount, currency)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">المدفوع</p>
                  <p className="font-medium text-green-600">{formatCurrency(selectedOrder.paidAmount, currency)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">المتبقي</p>
                  <p className="font-medium text-amber-600">{formatCurrency(selectedOrder.totalAmount - selectedOrder.paidAmount, currency)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="font-medium mb-2">المنتجات ({selectedOrder.items?.length || 0})</p>
                <ScrollArea className="h-[200px]">
                  {selectedOrder.items?.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-2 border-b">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.productBarcode}</p>
                      </div>
                      <Badge variant="outline">مطلوب: {item.orderedQty}</Badge>
                      <Badge variant="outline" className="text-green-600">مستلم: {item.receivedQty}</Badge>
                      <span>{formatCurrency(item.totalAmount, currency)}</span>
                    </div>
                  ))}
                </ScrollArea>
              </div>
              
              {selectedOrder.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground text-sm">ملاحظات</p>
                    <p>{selectedOrder.notes}</p>
                  </div>
                </>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Order Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>معالجة أمر الشراء</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <p>رقم الأمر: <code className="bg-muted px-2 py-1 rounded">{selectedOrder.orderNumber}</code></p>
              
              <div className="grid grid-cols-2 gap-2">
                {selectedOrder.status === 'ORDERED' && (
                  <>
                    <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={() => handleProcessOrder('RECEIVED')}>
                      <CheckCircle className="h-4 w-4 ml-2" /> تأكيد الاستلام
                    </Button>
                    <Button variant="outline" onClick={() => handleProcessOrder('PARTIAL')}>
                      <Package className="h-4 w-4 ml-2" /> استلام جزئي
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p>هل أنت متأكد من حذف أمر الشراء هذا؟</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDelete}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
