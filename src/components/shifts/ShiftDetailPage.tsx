'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  DollarSign,
  ShoppingCart,
  RotateCcw,
  Wallet,
  Clock,
  User,
  Building2,
  ArrowRight,
  Printer,
  Download,
  CheckCircle2,
  XCircle,
  TrendingUp,
  CreditCard,
  Banknote,
  Receipt,
  Package,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, useAppStore } from '@/store';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ShiftDetail {
  closeDetail: {
    id: string;
    closingNumber: number;
    openingCash: number;
    cashSales: number;
    cardSales: number;
    otherSales: number;
    totalSales: number;
    totalReturns: number;
    totalExpenses: number;
    totalDiscounts: number;
    totalTax: number;
    expectedCash: number;
    actualCash: number;
    cashDifference: number;
    invoiceCount: number;
    returnCount: number;
    customerCount: number;
    profitAmount: number;
    notes: string | null;
    closedAt: string;
  };
  shift: {
    id: string;
    startTime: string;
    endTime: string | null;
    status: string;
    user: { name: string };
    branch: { name: string };
  };
  transactions: Array<{
    id: string;
    type: string;
    referenceId: string | null;
    amount: number;
    description: string | null;
    createdAt: string;
  }>;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    isReturn: boolean;
    createdAt: string;
    customer: { name: string } | null;
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      totalAmount: number;
    }>;
    payments: Array<{
      amount: number;
      paymentMethod: { name: string };
    }>;
  }>;
  expenses: Array<{
    id: string;
    amount: number;
    description: string | null;
    category: { name: string } | null;
    createdAt: string;
  }>;
}

export function ShiftDetailPage() {
  const searchParams = useSearchParams();
  const shiftId = searchParams.get('shiftId');
  const closingNumber = searchParams.get('closingNumber');
  const userId = searchParams.get('userId');
  
  const { currency } = useAppStore();
  const [data, setData] = useState<ShiftDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShiftDetail = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (shiftId) params.append('shiftId', shiftId);
        if (closingNumber) params.append('closingNumber', closingNumber);
        if (userId) params.append('userId', userId);

        const response = await fetch(`/api/shifts/close?${params.toString()}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching shift detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShiftDetail();
  }, [shiftId, closingNumber, userId]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحميل التفاصيل...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-lg font-medium">لم يتم العثور على الوردية</p>
            <p className="text-muted-foreground mt-2">قد تكون الوردية غير موجودة أو لم يتم إغلاقها بعد</p>
            <Button className="mt-4" onClick={() => window.history.back()}>
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { closeDetail, shift, transactions, invoices, expenses } = data;
  const duration = shift.endTime 
    ? Math.round((new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60))
    : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6 print:p-0" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">تقرير إغلاق الوردية</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            رقم الإغلاق: {closeDetail.closingNumber} | {shift.branch?.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 ml-2" />
            طباعة
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير PDF
          </Button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-center">تقرير إغلاق الوردية</h1>
        <p className="text-center text-muted-foreground">
          رقم الإغلاق: {closeDetail.closingNumber}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">إجمالي المبيعات</p>
                <p className="text-lg font-bold">{formatCurrency(closeDetail.totalSales, currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">عدد الفواتير</p>
                <p className="text-lg font-bold">{closeDetail.invoiceCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">صافي الربح</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(closeDetail.profitAmount, currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-full">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">مدة الوردية</p>
                <p className="text-lg font-bold">{duration} ساعة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shift Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">معلومات الوردية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">الكاشير</p>
              <p className="font-medium">{shift.user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الفرع</p>
              <p className="font-medium">{shift.branch?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">وقت البدء</p>
              <p className="font-medium">
                {format(new Date(shift.startTime), 'dd/MM/yyyy HH:mm', { locale: ar })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">وقت الإغلاق</p>
              <p className="font-medium">
                {shift.endTime 
                  ? format(new Date(shift.endTime), 'dd/MM/yyyy HH:mm', { locale: ar })
                  : '-'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              ملخص المبيعات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">رصيد الافتتاح</span>
              <span className="font-medium">{formatCurrency(closeDetail.openingCash, currency)}</span>
            </div>
            <Separator />
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                مبيعات نقدية
              </span>
              <span className="font-medium">{formatCurrency(closeDetail.cashSales, currency)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                مبيعات بطاقة
              </span>
              <span className="font-medium">{formatCurrency(closeDetail.cardSales, currency)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">مبيعات أخرى</span>
              <span className="font-medium">{formatCurrency(closeDetail.otherSales, currency)}</span>
            </div>
            <Separator />
            
            <div className="flex justify-between items-center font-medium">
              <span>إجمالي المبيعات</span>
              <span className="text-green-600">{formatCurrency(closeDetail.totalSales, currency)}</span>
            </div>
            
            <div className="flex justify-between items-center text-red-600">
              <span>المرتجعات</span>
              <span>- {formatCurrency(closeDetail.totalReturns, currency)}</span>
            </div>
            
            <div className="flex justify-between items-center text-red-600">
              <span>الخصومات</span>
              <span>- {formatCurrency(closeDetail.totalDiscounts, currency)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>الضريبة</span>
              <span>{formatCurrency(closeDetail.totalTax, currency)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Cash Reconciliation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              تسوية النقدية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">رصيد الافتتاح</span>
              <span className="font-medium">{formatCurrency(closeDetail.openingCash, currency)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">+ مبيعات نقدية</span>
              <span className="font-medium">{formatCurrency(closeDetail.cashSales, currency)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">- مصروفات</span>
              <span className="font-medium text-red-600">- {formatCurrency(closeDetail.totalExpenses, currency)}</span>
            </div>
            <Separator />
            
            <div className="flex justify-between items-center font-medium">
              <span>النقدية المتوقعة</span>
              <span>{formatCurrency(closeDetail.expectedCash, currency)}</span>
            </div>
            
            <div className="flex justify-between items-center font-medium">
              <span>النقدية الفعلية</span>
              <span>{formatCurrency(closeDetail.actualCash, currency)}</span>
            </div>
            
            <Separator />
            
            <div className={`flex justify-between items-center font-bold text-lg ${
              closeDetail.cashDifference === 0 
                ? 'text-green-600' 
                : closeDetail.cashDifference > 0 
                  ? 'text-blue-600' 
                  : 'text-red-600'
            }`}>
              <span className="flex items-center gap-2">
                {closeDetail.cashDifference === 0 ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : closeDetail.cashDifference > 0 ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingUp className="h-5 w-5 rotate-180" />
                )}
                الفرق
              </span>
              <span>
                {closeDetail.cashDifference > 0 ? '+' : ''}
                {formatCurrency(closeDetail.cashDifference, currency)}
              </span>
            </div>
            
            {closeDetail.cashDifference !== 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {closeDetail.cashDifference > 0 
                  ? 'يوجد زيادة في الصندوق' 
                  : 'يوجد عجز في الصندوق'
                }
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">إحصائيات الوردية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-3xl font-bold">{closeDetail.invoiceCount}</p>
              <p className="text-sm text-muted-foreground">فاتورة</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-3xl font-bold">{closeDetail.returnCount}</p>
              <p className="text-sm text-muted-foreground">مرتجع</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-3xl font-bold">{closeDetail.customerCount}</p>
              <p className="text-sm text-muted-foreground">عميل</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-3xl font-bold">
                {closeDetail.invoiceCount > 0 
                  ? formatCurrency(closeDetail.totalSales / closeDetail.invoiceCount, currency)
                  : 0
                }
              </p>
              <p className="text-sm text-muted-foreground">متوسط الفاتورة</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">حركات الوردية</CardTitle>
          <CardDescription>جميع الحركات المالية خلال الوردية</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>النوع</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الوقت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <Badge variant={
                        tx.type === 'sale' ? 'default' :
                        tx.type === 'return' ? 'destructive' :
                        tx.type === 'expense' ? 'secondary' :
                        'outline'
                      }>
                        {tx.type === 'sale' ? 'بيع' :
                         tx.type === 'return' ? 'مرتجع' :
                         tx.type === 'expense' ? 'مصروف' :
                         tx.type === 'payment_in' ? 'إيداع' :
                         'سحب'}
                      </Badge>
                    </TableCell>
                    <TableCell>{tx.description || '-'}</TableCell>
                    <TableCell className={tx.type === 'sale' || tx.type === 'payment_in' ? 'text-green-600' : 'text-red-600'}>
                      {tx.type === 'sale' || tx.type === 'payment_in' ? '+' : '-'}
                      {formatCurrency(tx.amount, currency)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(tx.createdAt), 'HH:mm', { locale: ar })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            الفواتير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الفاتورة</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>طريقة الدفع</TableHead>
                  <TableHead>الوقت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.filter(i => !i.isReturn).map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.customer?.name || 'عميل نقدي'}</TableCell>
                    <TableCell>{formatCurrency(invoice.totalAmount, currency)}</TableCell>
                    <TableCell>
                      {invoice.payments?.map(p => p.paymentMethod?.name).join(', ') || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(invoice.createdAt), 'HH:mm', { locale: ar })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Returns */}
      {invoices.filter(i => i.isReturn).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-red-600">
              <RotateCcw className="h-5 w-5" />
              المرتجعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-64">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم المرتجع</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الوقت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.filter(i => i.isReturn).map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.customer?.name || 'عميل نقدي'}</TableCell>
                      <TableCell className="text-red-600">- {formatCurrency(invoice.totalAmount, currency)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(invoice.createdAt), 'HH:mm', { locale: ar })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Expenses */}
      {expenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              المصروفات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-64">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الفئة</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الوقت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.category?.name || 'غير مصنف'}</TableCell>
                      <TableCell>{expense.description || '-'}</TableCell>
                      <TableCell className="text-red-600">- {formatCurrency(expense.amount, currency)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(expense.createdAt), 'HH:mm', { locale: ar })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {closeDetail.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ملاحظات</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{closeDetail.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground py-4 print:mt-6">
        <p>تم إغلاق الوردية في: {format(new Date(closeDetail.closedAt), 'dd/MM/yyyy HH:mm', { locale: ar })}</p>
        <p className="mt-1">رقم الإغلاق: {closeDetail.closingNumber}</p>
      </div>
    </div>
  );
}
