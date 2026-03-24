'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  UserPlus,
  CreditCard,
  Banknote,
  Smartphone,
  MoreHorizontal,
  X,
  Maximize2,
  Minimize2,
  Clock,
  Receipt,
  RotateCcw,
  Wallet,
  AlertCircle,
  Check,
  Printer,
  Package,
  ChevronLeft,
  Grid3X3,
  List,
  Settings,
  Palette,
  Type,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAppStore, formatCurrency } from '@/store';
import { cn } from '@/lib/utils';
import type { Product, Category, CartItem, Customer } from '@/types';

// واجهة إعدادات POS
interface POSSettings {
  showProductName: boolean;
  showProductBarcode: boolean;
  showProductPrice: boolean;
  showProductImage: boolean;
  showProductStock: boolean;
  productNameFontSize: number;
  productNameColor: string;
  productPriceFontSize: number;
  productPriceColor: string;
  productBarcodeFontSize: number;
  productBarcodeColor: string;
  cardBorderWidth: number;
  cardBorderColor: string;
  cardBorderRadius: number;
  cardPadding: number;
  gridViewColumns: number;
  // POS Behavior Settings
  showDiscount: boolean;
  allowMultiPayment: boolean;
}

// الإعدادات الافتراضية
const defaultSettings: POSSettings = {
  showProductName: true,
  showProductBarcode: true,
  showProductPrice: true,
  showProductImage: true,
  showProductStock: false,
  productNameFontSize: 14,
  productNameColor: '#000000',
  productPriceFontSize: 16,
  productPriceColor: '#16a34a',
  productBarcodeFontSize: 10,
  productBarcodeColor: '#6b7280',
  cardBorderWidth: 2,
  cardBorderColor: '#e5e7eb',
  cardBorderRadius: 8,
  cardPadding: 12,
  gridViewColumns: 6,
  showDiscount: true,
  allowMultiPayment: true,
};

// Mock data
const mockCategories: Category[] = [
  { id: '1', name: 'إلكترونيات', color: '#3b82f6', isActive: true, sortOrder: 0 },
  { id: '2', name: 'ملابس', color: '#10b981', isActive: true, sortOrder: 1 },
  { id: '3', name: 'أغذية', color: '#f59e0b', isActive: true, sortOrder: 2 },
  { id: '4', name: 'مشروبات', color: '#ef4444', isActive: true, sortOrder: 3 },
  { id: '5', name: 'أجهزة', color: '#8b5cf6', isActive: true, sortOrder: 4, parentId: '1' },
  { id: '6', name: 'اكسسوارات', color: '#ec4899', isActive: true, sortOrder: 5, parentId: '1' },
];

const mockProducts: Product[] = [
  { id: '1', barcode: '001', name: 'آيفون 15 برو ماكس', sellingPrice: 4999, costPrice: 4000, categoryId: '1', unit: 'piece', hasVariants: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', barcode: '002', name: 'سامسونج جالكسي S24', sellingPrice: 3999, costPrice: 3200, categoryId: '1', unit: 'piece', hasVariants: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '3', barcode: '003', name: 'سماعات آبل برو', sellingPrice: 999, costPrice: 800, categoryId: '1', unit: 'piece', hasVariants: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '4', barcode: '004', name: 'شاحن سريع 65W', sellingPrice: 149, costPrice: 100, categoryId: '1', unit: 'piece', hasVariants: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '5', barcode: '005', name: 'غطاء حماية آيفون', sellingPrice: 79, costPrice: 30, categoryId: '1', unit: 'piece', hasVariants: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '6', barcode: '006', name: 'تيشيرت قطني', sellingPrice: 99, costPrice: 50, categoryId: '2', unit: 'piece', hasVariants: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '7', barcode: '007', name: 'بنطلون جينز', sellingPrice: 199, costPrice: 100, categoryId: '2', unit: 'piece', hasVariants: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '8', barcode: '008', name: 'شوكولاتة', sellingPrice: 15, costPrice: 8, categoryId: '3', unit: 'piece', hasVariants: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '9', barcode: '009', name: 'عصير برتقال', sellingPrice: 10, costPrice: 5, categoryId: '4', unit: 'piece', hasVariants: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '10', barcode: '010', name: 'ماء معدني', sellingPrice: 5, costPrice: 2, categoryId: '4', unit: 'piece', hasVariants: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

const mockCustomers: Customer[] = [
  { id: '1', name: 'عميل نقدي', phone: '', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'أحمد محمد', phone: '0501234567', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '3', name: 'سارة علي', phone: '0509876543', isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

// واجهة طريقة الدفع للدفع المتعدد
interface PaymentEntry {
  id: string;
  methodId: string;
  amount: number;
}

const paymentMethods = [
  { id: 'cash', name: 'نقداً', icon: Banknote, color: 'text-green-600' },
  { id: 'card', name: 'بطاقة', icon: CreditCard, color: 'text-blue-600' },
  { id: 'knet', name: 'كي نت', icon: Smartphone, color: 'text-purple-600' },
];

export function POSPage() {
  const {
    cart,
    currentShift,
    currency,
    instantMode,
    setInstantMode,
    fullscreen,
    setFullscreen,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    updateCartItemPrice,
    updateCartItemDiscount,
    clearCart,
    setCartCustomer,
    setCartDiscount,
    setCartNotes,
    pendingInvoices,
    addPendingInvoice,
    removePendingInvoice,
    getCartTotal,
    getCartSubtotal,
    getCartItemCount,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showShiftDialog, setShowShiftDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [returnInvoiceNumber, setReturnInvoiceNumber] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseCategoryId, setExpenseCategoryId] = useState<string>('');
  const [expenseCategories, setExpenseCategories] = useState<{id: string; name: string; nameAr?: string}[]>([
    { id: '1', name: 'رواتب', nameAr: 'رواتب' },
    { id: '2', name: 'إيجار', nameAr: 'إيجار' },
    { id: '3', name: 'كهرباء', nameAr: 'كهرباء' },
    { id: '4', name: 'ماء', nameAr: 'ماء' },
    { id: '5', name: 'غاز', nameAr: 'غاز' },
    { id: '6', name: 'إنترنت', nameAr: 'إنترنت' },
    { id: '7', name: 'صيانة', nameAr: 'صيانة' },
    { id: '8', name: 'نقل', nameAr: 'نقل' },
    { id: '9', name: 'تسويق', nameAr: 'تسويق' },
    { id: '10', name: 'مستلزمات', nameAr: 'مستلزمات' },
    { id: '11', name: 'أخرى', nameAr: 'أخرى' },
  ]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // حالة البحث عن العملاء وإضافة عميل جديد
  const [customerSearch, setCustomerSearch] = useState('');
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  
  // حالة الدفع المتعدد
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [isMultiPayment, setIsMultiPayment] = useState(false);
  
  // إعدادات العرض
  const [settings, setSettings] = useState<POSSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pos-settings');
      if (saved) {
        try {
          return { ...defaultSettings, ...JSON.parse(saved) };
        } catch {
          return defaultSettings;
        }
      }
    }
    return defaultSettings;
  });

  // حفظ الإعدادات عند التغيير
  useEffect(() => {
    localStorage.setItem('pos-settings', JSON.stringify(settings));
  }, [settings]);

  const mainCategories = categories.filter(c => !c.parentId);
  const subCategories = selectedCategory ? categories.filter(c => c.parentId === selectedCategory) : [];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.barcode.includes(searchQuery);
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory ||
                           categories.find(c => c.id === p.categoryId)?.parentId === selectedCategory;
    return matchesSearch && matchesCategory && p.isActive;
  });

  const handleAddToCart = (product: Product) => {
    const item: CartItem = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      barcode: product.barcode,
      quantity: 1,
      unitPrice: product.sellingPrice,
      costPrice: product.costPrice,
      discountAmount: 0,
      totalAmount: product.sellingPrice,
      product,
    };
    addToCart(item);
  };

  const handleCategoryClick = (categoryId: string) => {
    const hasSubcategories = categories.some(c => c.parentId === categoryId);
    if (hasSubcategories) {
      setSelectedCategory(categoryId);
      setShowSubcategories(true);
    } else {
      setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
      setShowSubcategories(false);
    }
  };

  const handlePayment = () => {
    // Process payment logic here
    setShowPaymentDialog(false);
    clearCart();
    // Show success message
  };

  const handleHoldInvoice = () => {
    if (cart.items.length > 0) {
      addPendingInvoice({
        id: Date.now().toString(),
        invoiceNumber: `PENDING-${Date.now()}`,
        items: cart.items,
        createdAt: new Date(),
      });
      clearCart();
    }
  };

  const handleRestoreInvoice = (invoice: typeof pendingInvoices[0]) => {
    invoice.items.forEach(item => addToCart(item));
    removePendingInvoice(invoice.id);
    setShowPendingDialog(false);
  };

  // فلترة العملاء بالبحث
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone?.includes(customerSearch)
  );

  // إضافة عميل جديد
  const handleAddCustomer = () => {
    if (!newCustomerName.trim()) return;
    
    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: newCustomerName,
      phone: newCustomerPhone,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setCustomers([...customers, newCustomer]);
    setCartCustomer(newCustomer);
    setNewCustomerName('');
    setNewCustomerPhone('');
    setShowAddCustomerDialog(false);
    setShowCustomerDialog(false);
  };

  // حساب إجمالي المدفوع في الدفع المتعدد
  const getTotalPaid = () => payments.reduce((sum, p) => sum + p.amount, 0);
  
  // إضافة طريقة دفع جديدة
  const addPaymentMethod = (methodId: string) => {
    const remaining = total - getTotalPaid();
    if (remaining <= 0) return;
    
    setPayments([
      ...payments,
      { id: Date.now().toString(), methodId, amount: remaining }
    ]);
  };
  
  // تحديث مبلغ طريقة دفع
  const updatePaymentAmount = (id: string, amount: number) => {
    setPayments(payments.map(p => 
      p.id === id ? { ...p, amount: Math.max(0, amount) } : p
    ));
  };
  
  // حذف طريقة دفع
  const removePayment = (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  const subtotal = getCartSubtotal();
  const total = getCartTotal();
  const itemCount = getCartItemCount();

  // مكون بطاقة المنتج المحسنة
  const ProductCard = ({ product }: { product: Product }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className="cursor-pointer transition-all hover:shadow-lg"
        style={{
          borderWidth: settings.cardBorderWidth,
          borderColor: settings.cardBorderColor,
          borderRadius: settings.cardBorderRadius,
        }}
        onClick={() => handleAddToCart(product)}
      >
        <CardContent 
          className="flex flex-col h-full"
          style={{ padding: settings.cardPadding }}
        >
          {/* صورة المنتج */}
          {settings.showProductImage && (
            <>
              <div 
                className="aspect-square bg-muted rounded-md mb-2 flex items-center justify-center overflow-hidden"
                style={{ borderRadius: settings.cardBorderRadius - 2 }}
              >
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <Separator className="mb-2" />
            </>
          )}
          
          {/* اسم المنتج */}
          {settings.showProductName && (
            <p 
              className="font-bold truncate mb-1"
              style={{ 
                fontSize: settings.productNameFontSize,
                color: settings.productNameColor,
              }}
            >
              {product.name}
            </p>
          )}
          
          {/* الباركود */}
          {settings.showProductBarcode && (
            <p 
              className="truncate mb-2"
              style={{ 
                fontSize: settings.productBarcodeFontSize,
                color: settings.productBarcodeColor,
              }}
            >
              {product.barcode}
            </p>
          )}
          
          {/* الخط الفاصل */}
          <Separator className="my-2" />
          
          {/* السعر */}
          {settings.showProductPrice && (
            <p 
              className="font-bold mt-auto"
              style={{ 
                fontSize: settings.productPriceFontSize,
                color: settings.productPriceColor,
              }}
            >
              {formatCurrency(product.sellingPrice, currency)}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  // مكون بطاقة القائمة
  const ProductListItem = ({ product }: { product: Product }) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileTap={{ scale: 0.99 }}
    >
      <Card
        className="cursor-pointer transition-all hover:shadow-lg"
        style={{
          borderWidth: settings.cardBorderWidth,
          borderColor: settings.cardBorderColor,
          borderRadius: settings.cardBorderRadius,
        }}
        onClick={() => handleAddToCart(product)}
      >
        <CardContent 
          className="p-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            {settings.showProductImage && (
              <div 
                className="w-12 h-12 bg-muted rounded-md flex items-center justify-center"
                style={{ borderRadius: settings.cardBorderRadius - 2 }}
              >
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div>
              {settings.showProductName && (
                <p 
                  className="font-bold"
                  style={{ 
                    fontSize: settings.productNameFontSize,
                    color: settings.productNameColor,
                  }}
                >
                  {product.name}
                </p>
              )}
              {settings.showProductBarcode && (
                <p 
                  className="text-sm"
                  style={{ 
                    fontSize: settings.productBarcodeFontSize,
                    color: settings.productBarcodeColor,
                  }}
                >
                  {product.barcode}
                </p>
              )}
            </div>
          </div>
          {settings.showProductPrice && (
            <p 
              className="font-bold"
              style={{ 
                fontSize: settings.productPriceFontSize,
                color: settings.productPriceColor,
              }}
            >
              {formatCurrency(product.sellingPrice, currency)}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className={cn(
      "h-screen flex flex-col bg-background",
      fullscreen && "fixed inset-0 z-50"
    )}>
      {/* POS Header */}
      <div className="h-14 border-b bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {/* Instant Mode Toggle */}
          <Button
            variant={instantMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInstantMode(!instantMode)}
            className="gap-1"
          >
            <ZapIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Instant</span>
          </Button>

          {/* Previous Operations */}
          <Button variant="outline" size="sm" className="gap-1">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">العمليات السابقة</span>
          </Button>

          {/* Pending Invoices */}
          <Button
            variant="outline"
            size="sm"
            className="gap-1 relative"
            onClick={() => setShowPendingDialog(true)}
          >
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">المعلقة</span>
            {pendingInvoices.length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {pendingInvoices.length}
              </Badge>
            )}
          </Button>

          {/* Shift Details */}
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setShowShiftDialog(true)}
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">تفاصيل الوردية</span>
          </Button>

          {/* Return Invoice */}
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setShowReturnDialog(true)}
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">مرتجع</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* POS Settings */}
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setShowSettingsDialog(true)}
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">إعدادات</span>
          </Button>

          {/* Add Expense */}
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setShowExpenseDialog(true)}
          >
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">مصروف</span>
          </Button>

          {/* Fullscreen Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setFullscreen(!fullscreen)}
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          {/* Close Shift */}
          <Button variant="destructive" size="sm" className="gap-1">
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">إغلاق الوردية</span>
          </Button>

          {/* Exit POS */}
          <Button variant="outline" size="sm" asChild>
            <a href="/">خروج</a>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search and Filters */}
          <div className="p-4 border-b bg-card">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم أو الباركود..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="p-2 border-b bg-card">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {showSubcategories && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowSubcategories(false);
                    setSelectedCategory(null);
                  }}
                  className="shrink-0"
                >
                  <ChevronLeft className="h-4 w-4 ml-1" />
                  رجوع
                </Button>
              )}
              {(showSubcategories ? subCategories : mainCategories).map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryClick(category.id)}
                  className="shrink-0"
                  style={{
                    borderColor: category.color,
                    ...(selectedCategory === category.id && { backgroundColor: category.color }),
                  }}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid/List */}
          <ScrollArea className="flex-1">
            <div className={cn(
              "p-4",
              viewMode === 'grid' 
                ? `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-${Math.min(settings.gridViewColumns, 6)} xl:grid-cols-${settings.gridViewColumns} gap-3`
                : "space-y-2"
            )}
            style={viewMode === 'grid' ? {
              gridTemplateColumns: `repeat(${settings.gridViewColumns}, minmax(0, 1fr))`
            } : {}}
            >
              {filteredProducts.map((product) => (
                viewMode === 'grid' ? (
                  <ProductCard key={product.id} product={product} />
                ) : (
                  <ProductListItem key={product.id} product={product} />
                )
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Cart Section */}
        <div className="w-80 md:w-96 border-r bg-card flex flex-col">
          {/* Cart Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">سلة المشتريات</h2>
              <Badge variant="secondary">{itemCount} صنف</Badge>
            </div>
            
            {/* Customer Search with Dropdown */}
            <div className="mt-3 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  placeholder="بحث عميل بالاسم أو التليفون..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                  }}
                  onFocus={() => setCustomerSearch(customerSearch)}
                  className="pr-10"
                />
                
                {/* Dropdown Results */}
                {customerSearch && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                    {filteredCustomers.length > 0 ? (
                      <>
                        {filteredCustomers.map((customer) => (
                          <button
                            key={customer.id}
                            className={cn(
                              "w-full px-3 py-2 flex items-center gap-2 hover:bg-muted transition-colors text-right",
                              cart.customerId === customer.id && "bg-muted"
                            )}
                            onClick={() => {
                              setCartCustomer(customer);
                              setCustomerSearch('');
                            }}
                          >
                            <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{customer.name}</p>
                              {customer.phone && (
                                <p className="text-xs text-muted-foreground">{customer.phone}</p>
                              )}
                            </div>
                            {cart.customerId === customer.id && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </button>
                        ))}
                        <div className="border-t">
                          <button
                            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-muted transition-colors text-primary text-sm"
                            onClick={() => {
                              setShowAddCustomerDialog(true);
                              setCustomerSearch('');
                            }}
                          >
                            <UserPlus className="h-4 w-4" />
                            إضافة عميل جديد
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-3">
                        <p className="text-sm text-muted-foreground text-center mb-2">لا يوجد عملاء مطابقين</p>
                        <button
                          className="w-full px-3 py-2 flex items-center justify-center gap-2 hover:bg-muted transition-colors text-primary text-sm rounded-lg border"
                          onClick={() => {
                            setShowAddCustomerDialog(true);
                            setCustomerSearch('');
                          }}
                        >
                          <UserPlus className="h-4 w-4" />
                          إضافة عميل جديد
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowAddCustomerDialog(true)}
                title="إضافة عميل جديد"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Selected Customer */}
            {cart.customer && (
              <div className="mt-2 p-2 bg-muted rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{cart.customer.name}</p>
                    {cart.customer.phone && (
                      <p className="text-xs text-muted-foreground">{cart.customer.phone}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setCartCustomer(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Cart Items */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              <AnimatePresence>
                {cart.items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="border-b last:border-b-0 py-2"
                  >
                    {/* صف المنتج */}
                    <div className="flex items-center gap-2">
                      {/* الاسم والسعر */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(item.unitPrice, currency)} × {item.quantity}</p>
                      </div>
                      
                      {/* التحكم في الكمية */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateCartItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateCartItemQuantity(item.id, parseFloat(e.target.value) || 1)}
                          className="w-12 h-6 text-center text-xs p-0"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* الإجمالي */}
                      <p className="font-bold text-sm w-20 text-left">{formatCurrency(item.totalAmount, currency)}</p>
                      
                      {/* حذف */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {cart.items.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>السلة فارغة</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Cart Footer */}
          <div className="p-4 border-t space-y-3">
            {/* Discount */}
            {settings.showDiscount && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">الخصم</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={cart.discountAmount}
                    onChange={(e) => setCartDiscount(parseFloat(e.target.value) || 0)}
                    className="w-20 h-8 text-left"
                  />
                  <span>{currency?.symbol}</span>
                </div>
              </div>
            )}

            {settings.showDiscount && <Separator />}

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              {settings.showDiscount && cart.discountAmount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">الخصم</span>
                  <span className="text-red-500">-{formatCurrency(cart.discountAmount, currency)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xl font-bold">
                <span>الإجمالي</span>
                <span className="text-primary">{formatCurrency(total, currency)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={handleHoldInvoice}
                disabled={cart.items.length === 0}
              >
                تعليق
              </Button>
              <Button
                variant="outline"
                onClick={clearCart}
                disabled={cart.items.length === 0}
              >
                إلغاء
              </Button>
            </div>

            <Button
              className="w-full h-12 text-lg"
              size="lg"
              onClick={() => setShowPaymentDialog(true)}
              disabled={cart.items.length === 0}
            >
              <CreditCard className="h-5 w-5 ml-2" />
              الدفع - {formatCurrency(total, currency)}
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              إعدادات نقطة البيع
            </DialogTitle>
            <DialogDescription>
              تخصيص عرض بطاقات المنتجات والخطوط
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="display" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="display" className="gap-2">
                <Eye className="h-4 w-4" />
                العرض
              </TabsTrigger>
              <TabsTrigger value="fonts" className="gap-2">
                <Type className="h-4 w-4" />
                الخطوط
              </TabsTrigger>
              <TabsTrigger value="style" className="gap-2">
                <Palette className="h-4 w-4" />
                التصميم
              </TabsTrigger>
            </TabsList>

            <TabsContent value="display" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">عناصر بطاقة المنتج</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-name" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      عرض اسم المنتج
                    </Label>
                    <Switch
                      id="show-name"
                      checked={settings.showProductName}
                      onCheckedChange={(checked) => setSettings({ ...settings, showProductName: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-barcode" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      عرض الباركود
                    </Label>
                    <Switch
                      id="show-barcode"
                      checked={settings.showProductBarcode}
                      onCheckedChange={(checked) => setSettings({ ...settings, showProductBarcode: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-price" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      عرض السعر
                    </Label>
                    <Switch
                      id="show-price"
                      checked={settings.showProductPrice}
                      onCheckedChange={(checked) => setSettings({ ...settings, showProductPrice: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-image" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      عرض الصورة
                    </Label>
                    <Switch
                      id="show-image"
                      checked={settings.showProductImage}
                      onCheckedChange={(checked) => setSettings({ ...settings, showProductImage: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-stock" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      عرض المخزون
                    </Label>
                    <Switch
                      id="show-stock"
                      checked={settings.showProductStock}
                      onCheckedChange={(checked) => setSettings({ ...settings, showProductStock: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">عرض الشبكة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>عدد الأعمدة: {settings.gridViewColumns}</Label>
                    </div>
                    <Slider
                      value={[settings.gridViewColumns]}
                      onValueChange={([value]) => setSettings({ ...settings, gridViewColumns: value })}
                      min={2}
                      max={8}
                      step={1}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fonts" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">حجم الخطوط</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>حجم خط الاسم: {settings.productNameFontSize}px</Label>
                    </div>
                    <Slider
                      value={[settings.productNameFontSize]}
                      onValueChange={([value]) => setSettings({ ...settings, productNameFontSize: value })}
                      min={10}
                      max={24}
                      step={1}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>حجم خط السعر: {settings.productPriceFontSize}px</Label>
                    </div>
                    <Slider
                      value={[settings.productPriceFontSize]}
                      onValueChange={([value]) => setSettings({ ...settings, productPriceFontSize: value })}
                      min={12}
                      max={28}
                      step={1}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>حجم خط الباركود: {settings.productBarcodeFontSize}px</Label>
                    </div>
                    <Slider
                      value={[settings.productBarcodeFontSize]}
                      onValueChange={([value]) => setSettings({ ...settings, productBarcodeFontSize: value })}
                      min={8}
                      max={16}
                      step={1}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">ألوان الخطوط</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="name-color">لون اسم المنتج</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        id="name-color"
                        value={settings.productNameColor}
                        onChange={(e) => setSettings({ ...settings, productNameColor: e.target.value })}
                        className="w-12 h-8 p-1 cursor-pointer"
                      />
                      <Input
                        value={settings.productNameColor}
                        onChange={(e) => setSettings({ ...settings, productNameColor: e.target.value })}
                        className="w-24 h-8"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="price-color">لون السعر</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        id="price-color"
                        value={settings.productPriceColor}
                        onChange={(e) => setSettings({ ...settings, productPriceColor: e.target.value })}
                        className="w-12 h-8 p-1 cursor-pointer"
                      />
                      <Input
                        value={settings.productPriceColor}
                        onChange={(e) => setSettings({ ...settings, productPriceColor: e.target.value })}
                        className="w-24 h-8"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="barcode-color">لون الباركود</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        id="barcode-color"
                        value={settings.productBarcodeColor}
                        onChange={(e) => setSettings({ ...settings, productBarcodeColor: e.target.value })}
                        className="w-12 h-8 p-1 cursor-pointer"
                      />
                      <Input
                        value={settings.productBarcodeColor}
                        onChange={(e) => setSettings({ ...settings, productBarcodeColor: e.target.value })}
                        className="w-24 h-8"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="style" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">حدود البطاقة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>سمك الحدود: {settings.cardBorderWidth}px</Label>
                    </div>
                    <Slider
                      value={[settings.cardBorderWidth]}
                      onValueChange={([value]) => setSettings({ ...settings, cardBorderWidth: value })}
                      min={0}
                      max={4}
                      step={1}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="border-color">لون الحدود</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        id="border-color"
                        value={settings.cardBorderColor}
                        onChange={(e) => setSettings({ ...settings, cardBorderColor: e.target.value })}
                        className="w-12 h-8 p-1 cursor-pointer"
                      />
                      <Input
                        value={settings.cardBorderColor}
                        onChange={(e) => setSettings({ ...settings, cardBorderColor: e.target.value })}
                        className="w-24 h-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>استدارة الزوايا: {settings.cardBorderRadius}px</Label>
                    </div>
                    <Slider
                      value={[settings.cardBorderRadius]}
                      onValueChange={([value]) => setSettings({ ...settings, cardBorderRadius: value })}
                      min={0}
                      max={24}
                      step={2}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>المسافة الداخلية: {settings.cardPadding}px</Label>
                    </div>
                    <Slider
                      value={[settings.cardPadding]}
                      onValueChange={([value]) => setSettings({ ...settings, cardPadding: value })}
                      min={4}
                      max={20}
                      step={2}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">ألوان جاهزة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { name: 'افتراضي', border: '#e5e7eb', price: '#16a34a' },
                      { name: 'داكن', border: '#374151', price: '#10b981' },
                      { name: 'أزرق', border: '#3b82f6', price: '#2563eb' },
                      { name: 'أحمر', border: '#ef4444', price: '#dc2626' },
                      { name: 'أخضر', border: '#22c55e', price: '#15803d' },
                      { name: 'بنفسجي', border: '#8b5cf6', price: '#7c3aed' },
                      { name: 'برتقالي', border: '#f97316', price: '#ea580c' },
                      { name: 'وردي', border: '#ec4899', price: '#db2777' },
                    ].map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        className="h-auto py-2 flex-col gap-1"
                        onClick={() => setSettings({
                          ...settings,
                          cardBorderColor: preset.border,
                          productPriceColor: preset.price,
                        })}
                      >
                        <div className="flex gap-1">
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: preset.border }}
                          />
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: preset.price }}
                          />
                        </div>
                        <span className="text-xs">{preset.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => setSettings(defaultSettings)}
            >
              استعادة الافتراضي
            </Button>
            <Button onClick={() => setShowSettingsDialog(false)}>
              حفظ الإعدادات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={(open) => {
        setShowPaymentDialog(open);
        if (!open) {
          setPayments([]);
          setIsMultiPayment(false);
          setPaidAmount(0);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>طريقة الدفع</span>
              {settings.allowMultiPayment && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMultiPayment(!isMultiPayment)}
                >
                  <MoreHorizontal className="h-4 w-4 ml-1" />
                  {isMultiPayment ? 'دفع واحد' : 'دفع متعدد'}
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>
              المبلغ المطلوب: <span className="font-bold text-foreground">{formatCurrency(total, currency)}</span>
            </DialogDescription>
          </DialogHeader>

          {!isMultiPayment ? (
            /* الدفع بطريقة واحدة */
            <>
              <div className="grid grid-cols-3 gap-3 py-4">
                {paymentMethods.map((method) => (
                  <Button
                    key={method.id}
                    variant={selectedPaymentMethod === method.id ? 'default' : 'outline'}
                    className="h-16 flex-col gap-1"
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <method.icon className={cn('h-5 w-5', method.color)} />
                    <span className="text-xs">{method.name}</span>
                  </Button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">المبلغ المدفوع</label>
                  <Input
                    type="number"
                    value={paidAmount || total}
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                    placeholder="أدخل المبلغ"
                  />
                </div>
                {paidAmount >= total && (
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">الباقي</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(paidAmount - total, currency)}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* الدفع المتعدد */
            <div className="space-y-4 py-4">
              {/* طرق الدفع المضافة */}
              {payments.length > 0 && (
                <div className="space-y-2">
                  {payments.map((payment) => {
                    const method = paymentMethods.find(m => m.id === payment.methodId);
                    return (
                      <div key={payment.id} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        {method && <method.icon className={cn('h-4 w-4', method.color)} />}
                        <span className="text-sm flex-1">{method?.name}</span>
                        <Input
                          type="number"
                          value={payment.amount}
                          onChange={(e) => updatePaymentAmount(payment.id, parseFloat(e.target.value) || 0)}
                          className="w-24 h-8 text-left"
                        />
                        <span className="text-xs">{currency?.symbol}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removePayment(payment.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* إضافة طريقة دفع */}
              {getTotalPaid() < total && (
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods
                    .filter(m => !payments.some(p => p.methodId === m.id) || payments.length < 3)
                    .map((method) => (
                      <Button
                        key={method.id}
                        variant="outline"
                        size="sm"
                        className="h-10 flex-col gap-0"
                        onClick={() => addPaymentMethod(method.id)}
                      >
                        <method.icon className={cn('h-4 w-4', method.color)} />
                        <span className="text-xs">{method.name}</span>
                      </Button>
                    ))}
                </div>
              )}
              
              {/* المتبقي */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">المدفوع</span>
                <span className="font-bold">{formatCurrency(getTotalPaid(), currency)}</span>
              </div>
              
              {getTotalPaid() < total && (
                <div className="flex items-center justify-between p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">المتبقي</span>
                  <span className="font-bold text-orange-600">{formatCurrency(total - getTotalPaid(), currency)}</span>
                </div>
              )}
              
              {getTotalPaid() >= total && (
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">الباقي</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(getTotalPaid() - total, currency)}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={isMultiPayment ? getTotalPaid() < total : paidAmount < total}
            >
              <Printer className="h-4 w-4 ml-2" />
              طباعة الفاتورة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pending Invoices Dialog */}
      <Dialog open={showPendingDialog} onOpenChange={setShowPendingDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>الفواتير المعلقة</DialogTitle>
            <DialogDescription>
              اختر فاتورة لاستعادتها أو حذفها
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-96">
            {pendingInvoices.length > 0 ? (
              <div className="space-y-2">
                {pendingInvoices.map((invoice) => (
                  <Card key={invoice.id}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.items.length} صنف - {new Date(invoice.createdAt).toLocaleTimeString('ar-SA')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreInvoice(invoice)}
                        >
                          استعادة
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removePendingInvoice(invoice.id)}
                        >
                          حذف
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد فواتير معلقة</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Return Dialog */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>مرتجع فاتورة</DialogTitle>
            <DialogDescription>
              أدخل رقم الفاتورة للمرتجع
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              placeholder="رقم الفاتورة"
              value={returnInvoiceNumber}
              onChange={(e) => setReturnInvoiceNumber(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={() => setShowReturnDialog(false)}>
              بحث
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog open={showExpenseDialog} onOpenChange={(open) => {
        setShowExpenseDialog(open);
        if (!open) {
          setExpenseAmount(0);
          setExpenseDescription('');
          setExpenseCategoryId('');
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-amber-500" />
              إضافة مصروف
            </DialogTitle>
            <DialogDescription>
              أدخل تفاصيل المصروف الجديد
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* فئة المصروف */}
            <div className="space-y-2">
              <Label>فئة المصروف</Label>
              <Select value={expenseCategoryId} onValueChange={setExpenseCategoryId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.nameAr || category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* المبلغ */}
            <div className="space-y-2">
              <Label>المبلغ</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={expenseAmount || ''}
                  onChange={(e) => setExpenseAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="pr-16"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Badge variant="secondary">{currency?.symbol || 'ر.س'}</Badge>
                </div>
              </div>
            </div>
            
            {/* الوصف */}
            <div className="space-y-2">
              <Label>الوصف (اختياري)</Label>
              <Input
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                placeholder="وصف المصروف..."
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowExpenseDialog(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={() => {
                // TODO: Save expense to database
                console.log('Expense:', { expenseCategoryId, expenseAmount, expenseDescription });
                setShowExpenseDialog(false);
              }}
              disabled={!expenseCategoryId || expenseAmount <= 0}
            >
              <Check className="h-4 w-4 ml-1" />
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shift Dialog */}
      <Dialog open={showShiftDialog} onOpenChange={setShowShiftDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تفاصيل الوردية</DialogTitle>
            <DialogDescription>
              ملخص مبيعات الوردية الحالية
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">مبيعات اليوم</p>
                <p className="text-2xl font-bold">{formatCurrency(12500, currency)}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">عدد الفواتير</p>
                <p className="text-2xl font-bold">45</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">النقد</p>
                <p className="text-2xl font-bold">{formatCurrency(8500, currency)}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">البطاقات</p>
                <p className="text-2xl font-bold">{formatCurrency(4000, currency)}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowShiftDialog(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog open={showAddCustomerDialog} onOpenChange={(open) => {
        setShowAddCustomerDialog(open);
        if (!open) {
          setNewCustomerName('');
          setNewCustomerPhone('');
        }
      }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              إضافة عميل جديد
            </DialogTitle>
            <DialogDescription>
              أدخل بيانات العميل الجديد
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="customerName">الاسم</Label>
              <Input
                id="customerName"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder="اسم العميل"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">رقم التليفون</Label>
              <Input
                id="customerPhone"
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
                placeholder="05xxxxxxxx"
                className="mt-1"
                dir="ltr"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCustomerDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddCustomer} disabled={!newCustomerName.trim()}>
              <Check className="h-4 w-4 ml-1" />
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Zap Icon component for Instant mode
function ZapIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
