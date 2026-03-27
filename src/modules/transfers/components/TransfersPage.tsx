// ============================================
// TransfersPage - صفحة تحويلات المخزون
// ============================================

'use client';

import { useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, ArrowRightLeft, Filter, Package, Truck, CheckCircle, XCircle,
  Clock, MoreHorizontal, Eye, Edit, Trash2, ChevronDown, AlertCircle
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
import { useAppStore, formatCurrency } from '@/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { useTransfers } from '../hooks/useTransfers';
import { STATUS_LABELS, type StockTransfer, type StockTransferItem, type TransferFormData, type TransferItemFormData } from '../types';

interface Product {
  id: string;
  name: string;
  barcode: string;
  costPrice: number;
  unit: string;
  variations?: { id: string; name?: string; barcode: string; price: number }[];
}

export function TransfersPage() {
  const { currency } = useAppStore();
  const {
    transfers, loading, searchQuery, statusFilter,
    setSearchQuery, setStatusFilter,
    createTransfer, updateTransferStatus, deleteTransfer,
    filteredTransfers, stats
  } = useTransfers();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<StockTransfer | null>(null);
  const [expandedTransfers, setExpandedTransfers] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState<TransferFormData>({
    toBranchId: '',
    notes: '',
    items: []
  });

  // Branches (will be fetched)
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);

  // Fetch branches and products on mount
  useState(() => {
    const fetchData = async () => {
      try {
        const [branchesRes, productsRes] = await Promise.all([
          fetch('/api/branches'),
          fetch('/api/products?limit=100')
        ]);
        const branchesData = await branchesRes.json();
        const productsData = await productsRes.json();
        setBranches(branchesData.branches || []);
        setProducts((productsData.products || []).map((p: any) => ({
          id: p.id,
          name: p.name,
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
  });

  const toggleExpand = (transferId: string) => {
    setExpandedTransfers(prev =>
      prev.includes(transferId)
        ? prev.filter(id => id !== transferId)
        : [...prev, transferId]
    );
  };

  const handleCreate = async () => {
    if (!formData.toBranchId) {
      toast.error('اختر الفرع المستلم');
      return;
    }
    if (formData.items.length === 0) {
      toast.error('أضف منتجات للتحويل');
      return;
    }

    // Get current branch from store or use first branch
    const fromBranchId = branches[0]?.id;
    
    const success = await createTransfer({
      ...formData,
      fromBranchId
    });
    
    if (success) {
      setShowCreateDialog(false);
      setFormData({ toBranchId: '', notes: '', items: [] });
    }
  };

  const handleAddItem = () => {
    if (!selectedProduct) return;
    
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const existingIndex = formData.items.findIndex(i => i.productId === selectedProduct);
    if (existingIndex >= 0) {
      const updated = [...formData.items];
      updated[existingIndex].requestedQty += selectedQty;
      setFormData(prev => ({ ...prev, items: updated }));
    } else {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, {
          productId: selectedProduct,
          requestedQty: selectedQty,
          unitCost: product.costPrice
        }]
      }));
    }
    
    setSelectedProduct('');
    setSelectedQty(1);
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleProcessTransfer = async (status: 'APPROVED' | 'REJECTED' | 'IN_TRANSIT' | 'RECEIVED', reason?: string) => {
    if (!selectedTransfer) return;
    
    const success = await updateTransferStatus(selectedTransfer.id, status, {
      rejectionReason: reason,
      userId: 'current-user' // Should be from auth
    });
    
    if (success) {
      setShowProcessDialog(false);
      setSelectedTransfer(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedTransfer) return;
    const success = await deleteTransfer(selectedTransfer.id);
    if (success) {
      setShowDeleteDialog(false);
      setSelectedTransfer(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
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
          <h1 className="text-3xl font-bold">تحويلات المخزون</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <ArrowRightLeft className="h-4 w-4" />
            إدارة التحويلات بين الفروع
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4" /> تحويل جديد
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">إجمالي التحويلات</p>
                <p className="text-2xl font-bold">{stats.totalTransfers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">قيد الانتظار</p>
                <p className="text-2xl font-bold">{stats.pendingTransfers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Truck className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">قيد النقل</p>
                <p className="text-2xl font-bold">{stats.inTransitTransfers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">مكتملة</p>
                <p className="text-2xl font-bold">{stats.completedTransfers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-600 to-gray-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">إجمالي القيمة</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalValue, currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
            placeholder="بحث برقم التحويل أو الفرع..." 
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
            {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Transfers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardContent className="p-0">
            {filteredTransfers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <ArrowRightLeft className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">لا توجد تحويلات</p>
                <p className="text-sm">ابدأ بإنشاء تحويل جديد</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>رقم التحويل</TableHead>
                    <TableHead>من / إلى</TableHead>
                    <TableHead>المنتجات</TableHead>
                    <TableHead>القيمة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredTransfers.map((transfer) => {
                      const isExpanded = expandedTransfers.includes(transfer.id);
                      const statusInfo = STATUS_LABELS[transfer.status];
                      
                      return (
                        <Fragment key={transfer.id}>
                          <TableRow 
                            className="cursor-pointer hover:bg-muted/30"
                            onClick={() => toggleExpand(transfer.id)}
                          >
                            <TableCell>
                              <code className="text-sm bg-muted px-2 py-1 rounded">
                                {transfer.transferNumber}
                              </code>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm">{transfer.fromBranch?.name || '-'}</span>
                                <span className="text-xs text-muted-foreground">
                                  إلى: {transfer.toBranch?.name || '-'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline">{transfer.totalItems} صنف</Badge>
                                <Badge variant="secondary">{transfer.totalQuantity} قطعة</Badge>
                                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                                  <ChevronDown className="h-4 w-4" />
                                </motion.div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(transfer.totalValue, currency)}
                            </TableCell>
                            <TableCell>
                              <Badge className={cn("text-white", statusInfo.color)}>
                                {statusInfo.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(transfer.createdAt).toLocaleDateString('ar-EG')}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => { setSelectedTransfer(transfer); setShowViewDialog(true); }}>
                                    <Eye className="ml-2 h-4 w-4" /> عرض التفاصيل
                                  </DropdownMenuItem>
                                  {transfer.status === 'PENDING' && (
                                    <>
                                      <DropdownMenuItem onClick={() => { setSelectedTransfer(transfer); setShowProcessDialog(true); }}>
                                        <CheckCircle className="ml-2 h-4 w-4" /> معالجة
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedTransfer(transfer); setShowDeleteDialog(true); }}>
                                        <Trash2 className="ml-2 h-4 w-4" /> حذف
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {transfer.status === 'APPROVED' && (
                                    <DropdownMenuItem onClick={() => handleProcessTransfer('IN_TRANSIT')}>
                                      <Truck className="ml-2 h-4 w-4" /> بدء الشحن
                                    </DropdownMenuItem>
                                  )}
                                  {transfer.status === 'IN_TRANSIT' && (
                                    <DropdownMenuItem onClick={() => { setSelectedTransfer(transfer); setShowProcessDialog(true); }}>
                                      <CheckCircle className="ml-2 h-4 w-4" /> تأكيد الاستلام
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                          
                          {/* Expanded Items */}
                          <AnimatePresence>
                            {isExpanded && transfer.items && (
                              <motion.tr
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-muted/20"
                              >
                                <td colSpan={7} className="p-0">
                                  <div className="pr-8 py-2">
                                    {transfer.items.map(item => (
                                      <div 
                                        key={item.id}
                                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 mb-2"
                                      >
                                        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                                          <Package className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">{item.product?.name}</p>
                                          <p className="text-xs text-muted-foreground">{item.product?.barcode}</p>
                                        </div>
                                        <Badge variant="outline">الكمية: {item.requestedQty}</Badge>
                                        <span className="text-sm">{formatCurrency(item.totalCost, currency)}</span>
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

      {/* Create Transfer Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
              تحويل مخزون جديد
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh]">
            <div className="space-y-4 p-4">
              {/* Branch Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الفرع المرسل</Label>
                  <Select value={branches[0]?.id} disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="الفرع الحالي" />
                    </SelectTrigger>
                  </Select>
                </div>
                <div>
                  <Label>الفرع المستلم *</Label>
                  <Select value={formData.toBranchId} onValueChange={(v) => setFormData(prev => ({ ...prev, toBranchId: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفرع" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.filter(b => b.id !== branches[0]?.id).map(branch => (
                        <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              {/* Add Products */}
              <div>
                <Label className="text-base font-semibold">إضافة منتجات</Label>
                <div className="flex gap-2 mt-2">
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="اختر المنتج" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name} ({p.barcode})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input 
                    type="number" 
                    className="w-24" 
                    placeholder="الكمية"
                    value={selectedQty}
                    onChange={(e) => setSelectedQty(parseInt(e.target.value) || 1)}
                    min={1}
                  />
                  <Button onClick={handleAddItem}>إضافة</Button>
                </div>
              </div>
              
              {/* Items List */}
              {formData.items.length > 0 && (
                <div className="space-y-2">
                  <Label>المنتجات المحددة</Label>
                  {formData.items.map((item, index) => {
                    const product = products.find(p => p.id === item.productId);
                    return (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{product?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.requestedQty} × {formatCurrency(item.unitCost, currency)}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {formatCurrency(item.requestedQty * item.unitCost, currency)}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveItem(index)}>
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
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
            <Button onClick={handleCreate}>إنشاء التحويل</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Transfer Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل التحويل</DialogTitle>
          </DialogHeader>
          
          {selectedTransfer && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <code className="text-lg bg-muted px-3 py-1 rounded">
                  {selectedTransfer.transferNumber}
                </code>
                <Badge className={cn("text-white", STATUS_LABELS[selectedTransfer.status].color)}>
                  {STATUS_LABELS[selectedTransfer.status].label}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">من فرع</p>
                  <p className="font-medium">{selectedTransfer.fromBranch?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">إلى فرع</p>
                  <p className="font-medium">{selectedTransfer.toBranch?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">التاريخ</p>
                  <p className="font-medium">{new Date(selectedTransfer.createdAt).toLocaleString('ar-EG')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">القيمة الإجمالية</p>
                  <p className="font-medium">{formatCurrency(selectedTransfer.totalValue, currency)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="font-medium mb-2">المنتجات ({selectedTransfer.items?.length || 0})</p>
                <ScrollArea className="h-[200px]">
                  {selectedTransfer.items?.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-2 border-b">
                      <div className="flex-1">
                        <p className="font-medium">{item.product?.name}</p>
                        <p className="text-xs text-muted-foreground">{item.product?.barcode}</p>
                      </div>
                      <Badge variant="outline">{item.requestedQty} قطعة</Badge>
                      <span>{formatCurrency(item.totalCost, currency)}</span>
                    </div>
                  ))}
                </ScrollArea>
              </div>
              
              {selectedTransfer.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground text-sm">ملاحظات</p>
                    <p>{selectedTransfer.notes}</p>
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

      {/* Process Transfer Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>معالجة التحويل</DialogTitle>
          </DialogHeader>
          
          {selectedTransfer && (
            <div className="space-y-4">
              <p>رقم التحويل: <code className="bg-muted px-2 py-1 rounded">{selectedTransfer.transferNumber}</code></p>
              
              <div className="grid grid-cols-2 gap-2">
                {selectedTransfer.status === 'PENDING' && (
                  <>
                    <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={() => handleProcessTransfer('APPROVED')}>
                      <CheckCircle className="h-4 w-4 ml-2" /> اعتماد
                    </Button>
                    <Button variant="destructive" onClick={() => handleProcessTransfer('REJECTED', 'مرفوض')}>
                      <XCircle className="h-4 w-4 ml-2" /> رفض
                    </Button>
                  </>
                )}
                {selectedTransfer.status === 'IN_TRANSIT' && (
                  <Button className="bg-emerald-500 hover:bg-emerald-600 col-span-2" onClick={() => handleProcessTransfer('RECEIVED')}>
                    <CheckCircle className="h-4 w-4 ml-2" /> تأكيد الاستلام
                  </Button>
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
          <p>هل أنت متأكد من حذف هذا التحويل؟</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDelete}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
