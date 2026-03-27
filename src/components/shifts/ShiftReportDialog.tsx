'use client';

import { useState, useRef } from 'react';
import { Printer, X, FileText, User, Clock, Building2, Calendar, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/store';
import type { Shift, Branch, User as UserType, PaymentMethod, Category } from '@/types';

interface ShiftReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift & { branch?: Branch; user?: UserType };
  companyInfo?: {
    name: string;
    nameAr?: string;
    address?: string;
    phone?: string;
    taxNumber?: string;
  };
  paymentMethods?: { method: PaymentMethod; amount: number }[];
  categorySales?: { category: Category; amount: number; count: number }[];
}

export function ShiftReportDialog({
  open,
  onOpenChange,
  shift,
  companyInfo,
  paymentMethods = [],
  categorySales = [],
}: ShiftReportDialogProps) {
  const [printMode, setPrintMode] = useState<'full' | 'summary'>('full');
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير Z - ${shift.zReportNumber || ''}</title>
        <style>
          @page { size: A4; margin: 10mm; }
          body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; font-size: 12px; direction: rtl; }
          .report { max-width: 80mm; margin: 0 auto; padding: 5mm; }
          .header { text-align: center; margin-bottom: 5mm; border-bottom: 1px dashed #000; padding-bottom: 3mm; }
          .company-name { font-size: 14px; font-weight: bold; }
          .branch-name { font-size: 12px; margin-top: 1mm; }
          .z-number { font-size: 16px; font-weight: bold; text-align: center; margin: 3mm 0; border: 1px solid #000; padding: 2mm; }
          .section { margin: 3mm 0; }
          .section-title { font-weight: bold; border-bottom: 1px dashed #000; padding-bottom: 1mm; margin-bottom: 2mm; }
          .row { display: flex; justify-content: space-between; padding: 1mm 0; }
          .total-row { font-weight: bold; border-top: 1px solid #000; padding-top: 2mm; margin-top: 2mm; }
          .footer { text-align: center; margin-top: 5mm; border-top: 1px dashed #000; padding-top: 3mm; font-size: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 2mm 0; }
          th, td { padding: 1mm 2mm; text-align: right; border-bottom: 1px dotted #ccc; }
          th { font-weight: bold; background: #f5f5f5; }
          .separator { border-top: 1px dashed #000; margin: 3mm 0; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (date: Date) => {
    return `${formatDate(date)} - ${formatTime(date)}`;
  };

  // Calculate expected cash
  const cashPayments = paymentMethods.find(p => p.method.code === 'CASH')?.amount || 0;
  const expectedCash = shift.openingCash + cashPayments - shift.totalExpenses - shift.totalReturns;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            تقرير إغلاق الوردية - Z Report
          </DialogTitle>
        </DialogHeader>

        {/* Print Options */}
        <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
          <Label>خيارات الطباعة:</Label>
          <RadioGroup
            value={printMode}
            onValueChange={(v) => setPrintMode(v as 'full' | 'summary')}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="full" id="full" />
              <Label htmlFor="full">تفاصيل كاملة</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="summary" id="summary" />
              <Label htmlFor="summary">ملخص فقط</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Printable Content */}
        <div ref={printRef} className="bg-white p-4 rounded-lg border">
          {/* Header */}
          <div className="text-center mb-4 pb-4 border-b-2 border-dashed">
            <div className="text-lg font-bold">{companyInfo?.nameAr || companyInfo?.name || 'نقاط البيع'}</div>
            {companyInfo?.address && <div className="text-sm text-gray-600">{companyInfo.address}</div>}
            {companyInfo?.phone && <div className="text-sm text-gray-600">هاتف: {companyInfo.phone}</div>}
            {companyInfo?.taxNumber && <div className="text-sm text-gray-600">الرقم الضريبي: {companyInfo.taxNumber}</div>}
            <Separator className="my-2" />
            <div className="font-medium">{shift.branch?.name || 'الفرع الرئيسي'}</div>
          </div>

          {/* Z Report Number */}
          <div className="text-center border-2 border-black p-2 mb-4">
            <div className="text-sm">تقرير Z رقم</div>
            <div className="text-2xl font-bold font-mono">{String(shift.zReportNumber || 1).padStart(6, '0')}</div>
          </div>

          {/* User & Time Info */}
          <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <div>
                <div className="text-xs text-gray-500">المستخدم</div>
                <div className="font-medium">{shift.user?.name || 'المستخدم'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <div>
                <div className="text-xs text-gray-500">فترة الوردية</div>
                <div className="font-medium text-sm">{formatTime(shift.startTime)} - {shift.endTime ? formatTime(shift.endTime) : 'الآن'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <div>
                <div className="text-xs text-gray-500">التاريخ</div>
                <div className="font-medium text-sm">{formatDate(shift.startTime)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <div>
                <div className="text-xs text-gray-500">الفرع</div>
                <div className="font-medium text-sm">{shift.branch?.name || 'الفرع الرئيسي'}</div>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Sales Summary */}
          <div className="mb-4">
            <h3 className="font-bold mb-2 border-b pb-1">ملخص المبيعات</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>إجمالي المبيعات</span>
                <span className="font-bold">{formatCurrency(shift.totalSales, null)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>المرتجعات</span>
                <span>- {formatCurrency(shift.totalReturns, null)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>المصروفات</span>
                <span>- {formatCurrency(shift.totalExpenses, null)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>صافي المبيعات</span>
                <span>{formatCurrency(shift.totalSales - shift.totalReturns - shift.totalExpenses, null)}</span>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Payment Methods */}
          <div className="mb-4">
            <h3 className="font-bold mb-2 border-b pb-1">طرق الدفع</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-1">طريقة الدفع</th>
                  <th className="text-left py-1">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {paymentMethods.map((pm, index) => (
                  <tr key={index} className="border-b border-dotted">
                    <td className="py-1">{pm.method.name}</td>
                    <td className="text-left py-1">{formatCurrency(pm.amount, null)}</td>
                  </tr>
                ))}
                <tr className="font-bold border-t">
                  <td className="py-1">الإجمالي</td>
                  <td className="text-left py-1">{formatCurrency(shift.totalPayments, null)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Cash Summary */}
          <div className="mb-4 p-3 bg-green-50 rounded">
            <h3 className="font-bold mb-2">النقدية</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>رصيد الافتتاح</span>
                <span>{formatCurrency(shift.openingCash, null)}</span>
              </div>
              <div className="flex justify-between">
                <span>+ النقد</span>
                <span>{formatCurrency(cashPayments, null)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>- المصروفات</span>
                <span>- {formatCurrency(shift.totalExpenses, null)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>- المرتجعات النقدية</span>
                <span>- {formatCurrency(shift.totalReturns * 0.5, null)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>المتوقع في الصندوق</span>
                <span className="text-green-700">{formatCurrency(expectedCash, null)}</span>
              </div>
              {shift.closingCash !== undefined && (
                <>
                  <div className="flex justify-between font-bold">
                    <span>الفعلي في الصندوق</span>
                    <span>{formatCurrency(shift.closingCash, null)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>الفرق</span>
                    <span className={shift.closingCash - expectedCash >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(shift.closingCash - expectedCash, null)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Category Sales (Full mode only) */}
          {printMode === 'full' && categorySales.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="mb-4">
                <h3 className="font-bold mb-2 border-b pb-1">المبيعات حسب الفئة</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-1">الفئة</th>
                      <th className="text-center py-1">العدد</th>
                      <th className="text-left py-1">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorySales.map((cs, index) => (
                      <tr key={index} className="border-b border-dotted">
                        <td className="py-1">{cs.category.name}</td>
                        <td className="text-center py-1">{cs.count}</td>
                        <td className="text-left py-1">{formatCurrency(cs.amount, null)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t-2 border-dashed text-center text-xs text-gray-500">
            <div className="flex justify-center gap-4 mb-1">
              <span>المستخدم: {shift.user?.name}</span>
              <span>|</span>
              <span>تاريخ الطباعة: {formatDateTime(new Date())}</span>
            </div>
            <div className="mt-2">
              <Check className="inline h-3 w-3 mr-1" />
              تم إغلاق الوردية بنجاح
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 ml-2" />
            إغلاق
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 ml-2" />
            طباعة التقرير
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
