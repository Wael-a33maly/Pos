// ============================================
// InventoryPage - صفحة الجرد الدوري
// ============================================

'use client';

import { useState, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, ClipboardList, Clock, CheckCircle, AlertTriangle,
  FileText, MoreHorizontal, Eye, Edit, Trash2, ChevronDown, Filter,
  Package, ArrowRightLeft, XCircle, Calendar, Play
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

import { useInventoryCount } from '../hooks/useInventoryCount';
import { 
  COUNT_TYPE_LABELS, 
  COUNT_STATUS_LABELS,
  ADJUSTMENT_REASON_LABELS,
  type InventoryCount, 
  type InventoryCountItem,
  type InventoryCountFormData,
  type CountStatus,
  type CountType
} from '../types';

interface Branch {
  id: string;
  name: string;
  nameAr?: string;
}

interface Product {
  id: string;
  name: string;
  nameAr?: string;
  barcode: string;
  costPrice: number;
  unit: string;
}

export function InventoryPage() {
  const { currency } = useAppStore();
  const {
    counts, adjustments, loading, searchQuery, statusFilter, typeFilter, activeTab,
    setSearchQuery, setStatusFilter, setTypeFilter, setActiveTab,
    createCount, updateCountStatus, updateCountItems, deleteCount,
    filteredCounts, stats
  } = useInventoryCount();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showCountDialog, setShowCountDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCount, setSelectedCount] = useState<InventoryCount | null>(null);
  const [expandedCounts, setExpandedCounts] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState<InventoryCountFormData>({
    branchId: '',
    countType: 'FULL',
    scheduledDate: '',
    notes: '',
    productIds: []
  });

  // Count items state
  const [countItems, setCountItems] = useState<InventoryCountItem[]>([]);

  // Branches and products
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch branches and products on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesRes, productsRes] = await Promise.all([
          fetch('/api/branches'),
          fetch('/api/products?limit=500')
        ]);
        const branchesData = await branchesRes.json();
        const productsData = await productsRes.json();
        setBranches(branchesData.branches || []);
        setProducts((productsData.products || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          nameAr: p.nameAr,
          barcode: p.barcode,
          costPrice: p.costPrice,
          unit: p.unit
        })));
        
        // Set default branch
        if (branchesData.branches?.length > 0) {
          setFormData(prev => ({ ...prev, branchId: branchesData.branches[0].id }));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const toggleExpand = (countId: string) => {
    setExpandedCounts(prev =>
      prev.includes(countId)
        ? prev.filter(id => id !== countId)
        : [...prev, countId]
    );
  };

  const handleCreate = async () => {
    if (!formData.branchId) {
      toast.error('اختر الفرع');
      return;
    }

    const success = await createCount(formData);
    if (success) {
      setShowCreateDialog(false);
      setFormData({
        branchId: branches[0]?.id || '',
        countType: 'FULL',
        scheduledDate: '',
        notes: '',
        productIds: []
      });
    }
  };

  const handleOpenCountDialog = (count: InventoryCount) => {
    setSelectedCount(count);
    setCountItems(count.items || []);
    setShowCountDialog(true);
  };

  const handleSaveCountItems = async () => {
    if (!selectedCount) return;
    
    const itemsToUpdate = countItems.map(item => ({
      id: item.id,
      countedQty: item.countedQty,
      notes: item.notes
    }));
    
    const success = await updateCountItems(selectedCount.id, itemsToUpdate);
    if (success) {
      // Refresh selected count data
      const response = await fetch(`/api/inventory-count/${selectedCount.id}`);
      const data = await response.json();
      setSelectedCount(data.count);
      setCountItems(data.count.items || []);
    }
  };

  const handleDelete = async () => {
    if (!selectedCount) return;
    const success = await deleteCount(selectedCount.id);
    if (success) {
      setShowDeleteDialog(false);
      setSelectedCount(null);
    }
  };

  const updateCountItemQty = (itemId: string, qty: number) => {
    setCountItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const discrepancyQty = qty - item.systemQty;
        return {
          ...item,
          countedQty: qty,
          discrepancyQty,
          discrepancyValue: discrepancyQty * item.unitCost
        };
      }
      return item;
    }));
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
          <h1 className="text-3xl font-bold">الجرد الدوري</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <ClipboardList className="h-4 w-4" />
            إدارة عمليات جرد المخزون
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4" /> جرد جديد
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">إجمالي العمليات</p>
                <p className="text-2xl font-bold">{stats.totalCounts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Play className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">جارية</p>
                <p className="text-2xl font-bold">{stats.inProgressCounts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">في انتظار المراجعة</p>
                <p className="text-2xl font-bold">{stats.pendingReviewCounts}</p>
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
                <p className="text-2xl font-bold">{stats.completedCounts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="counts">عمليات الجرد</TabsTrigger>
          <TabsTrigger value="adjustments">التسويات</TabsTrigger>
        </TabsList>

        {/* Counts Tab */}
        <TabsContent value="counts" className="space-y-4">
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
                placeholder="بحث برقم الجرد أو الفرع..." 
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
                {Object.entries(COUNT_STATUS_LABELS).map(([key, { labelAr }]) => (
                  <SelectItem key={key} value={key}>{labelAr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
              <SelectTrigger className="w-48 bg-background/50">
                <SelectValue placeholder="نوع الجرد" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {Object.entries(COUNT_TYPE_LABELS).map(([key, { labelAr }]) => (
                  <SelectItem key={key} value={key}>{labelAr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Counts Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-0">
                {filteredCounts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <ClipboardList className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium">لا توجد عمليات جرد</p>
                    <p className="text-sm">ابدأ بإنشاء عملية جرد جديدة</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>رقم الجرد</TableHead>
                        <TableHead>الفرع</TableHead>
                        <TableHead>النوع</TableHead>
                        <TableHead>المنتجات</TableHead>
                        <TableHead>الفرق</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence mode="popLayout">
                        {filteredCounts.map((count) => {
                          const isExpanded = expandedCounts.includes(count.id);
                          const typeInfo = COUNT_TYPE_LABELS[count.countType];
                          const statusInfo = COUNT_STATUS_LABELS[count.status];
                          
                          return (
                            <Fragment key={count.id}>
                              <TableRow 
                                className="cursor-pointer hover:bg-muted/30"
                                onClick={() => toggleExpand(count.id)}
                              >
                                <TableCell>
                                  <code className="text-sm bg-muted px-2 py-1 rounded">
                                    {count.countNumber}
                                  </code>
                                </TableCell>
                                <TableCell>{count.branch?.name || '-'}</TableCell>
                                <TableCell>
                                  <Badge className={cn("text-white", typeInfo.color)}>
                                    {typeInfo.labelAr}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Badge variant="outline">{count.totalItems} صنف</Badge>
                                    <Badge variant="secondary">{count.countedItems} تم عده</Badge>
                                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                                      <ChevronDown className="h-4 w-4" />
                                    </motion.div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {count.discrepancyValue !== 0 ? (
                                    <span className={cn(
                                      "font-medium",
                                      count.discrepancyValue < 0 ? "text-red-500" : "text-green-500"
                                    )}>
                                      {formatCurrency(count.discrepancyValue, currency)}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge className={cn("text-white", statusInfo.color)}>
                                    {statusInfo.labelAr}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {new Date(count.createdAt).toLocaleDateString('ar-EG')}
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => { setSelectedCount(count); setShowViewDialog(true); }}>
                                        <Eye className="ml-2 h-4 w-4" /> عرض التفاصيل
                                      </DropdownMenuItem>
                                      {(count.status === 'DRAFT' || count.status === 'IN_PROGRESS' || count.status === 'PENDING_REVIEW') && (
                                        <DropdownMenuItem onClick={() => handleOpenCountDialog(count)}>
                                          <Edit className="ml-2 h-4 w-4" /> إدخال الكميات
                                        </DropdownMenuItem>
                                      )}
                                      {count.status === 'DRAFT' && (
                                        <DropdownMenuItem onClick={() => updateCountStatus(count.id, 'IN_PROGRESS')}>
                                          <Play className="ml-2 h-4 w-4" /> بدء الجرد
                                        </DropdownMenuItem>
                                      )}
                                      {count.status === 'IN_PROGRESS' && (
                                        <DropdownMenuItem onClick={() => updateCountStatus(count.id, 'PENDING_REVIEW')}>
                                          <Clock className="ml-2 h-4 w-4" /> إرسال للمراجعة
                                        </DropdownMenuItem>
                                      )}
                                      {count.status === 'PENDING_REVIEW' && (
                                        <DropdownMenuItem onClick={() => updateCountStatus(count.id, 'APPROVED')}>
                                          <CheckCircle className="ml-2 h-4 w-4" /> اعتماد
                                        </DropdownMenuItem>
                                      )}
                                      {count.status === 'APPROVED' && (
                                        <DropdownMenuItem onClick={() => updateCountStatus(count.id, 'COMPLETED')}>
                                          <CheckCircle className="ml-2 h-4 w-4" /> إكمال
                                        </DropdownMenuItem>
                                      )}
                                      {count.status === 'DRAFT' && (
                                        <>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedCount(count); setShowDeleteDialog(true); }}>
                                            <Trash2 className="ml-2 h-4 w-4" /> حذف
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                              
                              {/* Expanded Items */}
                              <AnimatePresence>
                                {isExpanded && count.items && (
                                  <motion.tr
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-muted/20"
                                  >
                                    <td colSpan={8} className="p-0">
                                      <div className="pr-8 py-2">
                                        {count.items.slice(0, 5).map(item => (
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
                                            <div className="text-sm">
                                              <span className="text-muted-foreground">النظام: </span>
                                              <span className="font-medium">{item.systemQty}</span>
                                              {item.countedQty !== null && item.countedQty !== undefined && (
                                                <>
                                                  <span className="text-muted-foreground mx-2">| العداد: </span>
                                                  <span className={cn(
                                                    "font-medium",
                                                    item.discrepancyQty !== 0 ? (item.discrepancyQty! > 0 ? "text-green-500" : "text-red-500") : ""
                                                  )}>
                                                    {item.countedQty}
                                                  </span>
                                                </>
                                              )}
                                            </div>
                                            {item.discrepancyQty !== 0 && item.discrepancyQty !== null && (
                                              <Badge variant={item.discrepancyQty > 0 ? "default" : "destructive"}>
                                                {item.discrepancyQty > 0 ? '+' : ''}{item.discrepancyQty}
                                              </Badge>
                                            )}
                                          </div>
                                        ))}
                                        {count.items.length > 5 && (
                                          <p className="text-xs text-muted-foreground text-center">
                                            و {count.items.length - 5} منتجات أخرى...
                                          </p>
                                        )}
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

        {/* Adjustments Tab */}
        <TabsContent value="adjustments" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {adjustments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <ArrowRightLeft className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">لا توجد تسويات</p>
                  <p className="text-sm">التسويات تُنشأ تلقائياً عند اعتماد الجرد</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>رقم التسوية</TableHead>
                      <TableHead>السبب</TableHead>
                      <TableHead>الأصناف</TableHead>
                      <TableHead>القيمة</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>التاريخ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adjustments.map((adj: any) => (
                      <TableRow key={adj.id}>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {adj.adjustmentNumber}
                          </code>
                        </TableCell>
                        <TableCell>{ADJUSTMENT_REASON_LABELS[adj.reason]?.labelAr || adj.reason}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{adj.totalItems} صنف</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(adj.totalValue, currency)}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-white",
                            adj.status === 'PENDING' ? 'bg-amber-500' :
                            adj.status === 'APPROVED' ? 'bg-green-500' :
                            'bg-red-500'
                          )}>
                            {adj.status === 'PENDING' ? 'معلقة' :
                             adj.status === 'APPROVED' ? 'معتمدة' : 'مرفوضة'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(adj.createdAt).toLocaleDateString('ar-EG')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Count Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              إنشاء عملية جرد جديدة
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>الفرع *</Label>
              <Select value={formData.branchId} onValueChange={(v) => setFormData(prev => ({ ...prev, branchId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفرع" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>نوع الجرد *</Label>
              <Select value={formData.countType} onValueChange={(v) => setFormData(prev => ({ ...prev, countType: v as CountType }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COUNT_TYPE_LABELS).map(([key, { labelAr }]) => (
                    <SelectItem key={key} value={key}>{labelAr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>تاريخ الجدولة (اختياري)</Label>
              <Input 
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
              />
            </div>
            
            <div>
              <Label>ملاحظات</Label>
              <Textarea 
                placeholder="ملاحظات إضافية..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>إلغاء</Button>
            <Button onClick={handleCreate}>إنشاء الجرد</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Count Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل عملية الجرد</DialogTitle>
          </DialogHeader>
          
          {selectedCount && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <code className="text-lg bg-muted px-3 py-1 rounded">
                  {selectedCount.countNumber}
                </code>
                <Badge className={cn("text-white", COUNT_STATUS_LABELS[selectedCount.status].color)}>
                  {COUNT_STATUS_LABELS[selectedCount.status].labelAr}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">الفرع</p>
                  <p className="font-medium">{selectedCount.branch?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">النوع</p>
                  <p className="font-medium">{COUNT_TYPE_LABELS[selectedCount.countType].labelAr}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">إجمالي الأصناف</p>
                  <p className="font-medium">{selectedCount.totalItems}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">تم عدها</p>
                  <p className="font-medium">{selectedCount.countedItems}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">قيمة الفروقات</p>
                  <p className={cn(
                    "font-medium",
                    selectedCount.discrepancyValue < 0 ? "text-red-500" : selectedCount.discrepancyValue > 0 ? "text-green-500" : ""
                  )}>
                    {formatCurrency(selectedCount.discrepancyValue, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">تاريخ الإنشاء</p>
                  <p className="font-medium">{new Date(selectedCount.createdAt).toLocaleString('ar-EG')}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="font-medium mb-2">المنتجات ({selectedCount.items?.length || 0})</p>
                <ScrollArea className="h-[250px]">
                  {selectedCount.items?.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-2 border-b">
                      <div className="flex-1">
                        <p className="font-medium">{item.product?.name}</p>
                        <p className="text-xs text-muted-foreground">{item.product?.barcode}</p>
                      </div>
                      <div className="text-sm text-center">
                        <p className="text-muted-foreground text-xs">النظام</p>
                        <p className="font-medium">{item.systemQty}</p>
                      </div>
                      {item.countedQty !== null && item.countedQty !== undefined && (
                        <div className="text-sm text-center">
                          <p className="text-muted-foreground text-xs">العداد</p>
                          <p className="font-medium">{item.countedQty}</p>
                        </div>
                      )}
                      {item.discrepancyQty !== null && item.discrepancyQty !== undefined && item.discrepancyQty !== 0 && (
                        <Badge variant={item.discrepancyQty > 0 ? "default" : "destructive"}>
                          {item.discrepancyQty > 0 ? '+' : ''}{item.discrepancyQty}
                        </Badge>
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </div>
              
              {selectedCount.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground text-sm">ملاحظات</p>
                    <p>{selectedCount.notes}</p>
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

      {/* Count Items Dialog */}
      <Dialog open={showCountDialog} onOpenChange={setShowCountDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              إدخال الكميات الفعلية
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh]">
            <div className="space-y-2 p-2">
              {countItems.map(item => (
                <div 
                  key={item.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border"
                >
                  <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product?.name}</p>
                    <p className="text-xs text-muted-foreground">{item.product?.barcode}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">في النظام</p>
                    <p className="font-medium">{item.systemQty}</p>
                  </div>
                  <div className="w-32">
                    <p className="text-xs text-muted-foreground mb-1">العدد الفعلي</p>
                    <Input 
                      type="number"
                      value={item.countedQty ?? ''}
                      onChange={(e) => updateCountItemQty(item.id, parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="text-center"
                    />
                  </div>
                  <div className="w-24 text-center">
                    <p className="text-xs text-muted-foreground">الفرق</p>
                    <p className={cn(
                      "font-medium",
                      item.discrepancyQty !== null && item.discrepancyQty !== undefined && item.discrepancyQty !== 0
                        ? item.discrepancyQty > 0 ? "text-green-500" : "text-red-500"
                        : ""
                    )}>
                      {item.discrepancyQty !== null && item.discrepancyQty !== undefined
                        ? (item.discrepancyQty > 0 ? '+' : '') + item.discrepancyQty
                        : '-'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCountDialog(false)}>إلغاء</Button>
            <Button onClick={handleSaveCountItems}>حفظ الكميات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p>هل أنت متأكد من حذف هذه العملية؟ يمكن حذف الجرد في حالة المسودة فقط.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDelete}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
