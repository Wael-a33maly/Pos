'use client';

import { useState, useRef } from 'react';
import { X, Printer, Check, User, Building2, Clock, Calendar, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatCurrency } from '@/store';
import type { Shift, Branch, User as UserType, PaymentMethod, Category } from '@/types';

interface UserWithShift {
  user: UserType;
  shift: Shift;
}

interface MultiShiftCloseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'branch' | 'company';
  branch?: Branch;
  users?: UserWithShift[];
  branches?: {
    branch: Branch;
    users: UserWithShift[];
  }[];
  companyInfo?: {
    name: string;
    nameAr?: string;
    address?: string;
    phone?: string;
    taxNumber?: string;
  };
  onCloseShifts: (userIds: string[], closingCash: Record<string, number>) => Promise<void>;
}

export function MultiShiftCloseDialog({
  open,
  onOpenChange,
  mode,
  branch,
  users = [],
  branches = [],
  companyInfo,
  onCloseShifts,
}: MultiShiftCloseDialogProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [closingCash, setClosingCash] = useState<Record<string, number>>({});
  const [printMode, setPrintMode] = useState<'full' | 'summary'>('full');
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [closedShifts, setClosedShifts] = useState<UserWithShift[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

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

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAll = () => {
    if (mode === 'branch') {
      setSelectedUsers(users.map(u => u.user.id));
    } else {
      const allUserIds = branches.flatMap(b => b.users.map(u => u.user.id));
      setSelectedUsers(allUserIds);
    }
  };

  const deselectAll = () => {
    setSelectedUsers([]);
  };

  const handleCloseShifts = async () => {
    setLoading(true);
    try {
      await onCloseShifts(selectedUsers, closingCash);
      // Get closed shifts for report
      if (mode === 'branch') {
        setClosedShifts(users.filter(u => selectedUsers.includes(u.user.id)));
      } else {
        setClosedShifts(branches.flatMap(b => b.users.filter(u => selectedUsers.includes(u.user.id))));
      }
      setShowReport(true);
    } catch (error) {
      console.error('Failed to close shifts:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <title>تقرير إغلاق الورديات</title>
        <style>
          @page { size: A4; margin: 10mm; }
          body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; font-size: 12px; direction: rtl; }
          .header { text-align: center; margin-bottom: 5mm; border-bottom: 1px dashed #000; padding-bottom: 3mm; }
          .section { margin: 3mm 0; }
          .row { display: flex; justify-content: space-between; padding: 1mm 0; }
          .footer { text-align: center; margin-top: 5mm; border-top: 1px dashed #000; padding-top: 3mm; font-size: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 2mm 0; }
          th, td { padding: 2mm; text-align: right; border-bottom: 1px dotted #ccc; }
          th { font-weight: bold; background: #f5f5f5; }
          .branch-header { font-weight: bold; background: #e5e5e5; padding: 2mm; margin-top: 4mm; }
          .user-section { margin: 2mm 0; padding: 2mm; border: 1px solid #ddd; }
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

  // Calculate totals
  const calculateTotals = () => {
    let totalSales = 0;
    let totalReturns = 0;
    let totalExpenses = 0;

    if (mode === 'branch') {
      users.filter(u => selectedUsers.includes(u.user.id)).forEach(u => {
        totalSales += u.shift.totalSales;
        totalReturns += u.shift.totalReturns;
        totalExpenses += u.shift.totalExpenses;
      });
    } else {
      branches.forEach(b => {
        b.users.filter(u => selectedUsers.includes(u.user.id)).forEach(u => {
          totalSales += u.shift.totalSales;
          totalReturns += u.shift.totalReturns;
          totalExpenses += u.shift.totalExpenses;
        });
      });
    }

    return { totalSales, totalReturns, totalExpenses };
  };

  const totals = calculateTotals();

  // Selection UI
  if (!showReport) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {mode === 'branch' ? 'إغلاق ورديات الفرع' : 'إغلاق ورديات الشركة'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-between py-2">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                تحديد الكل
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                إلغاء التحديد
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedUsers.length} مستخدم محدد
            </div>
          </div>

          <ScrollArea className="flex-1">
            {mode === 'branch' ? (
              // Branch mode - show users
              <div className="space-y-2 p-2">
                {users.map(({ user, shift }) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => toggleUser(user.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        مبيعات: {formatCurrency(shift.totalSales, null)} |
                        من: {formatTime(shift.startTime)}
                      </div>
                    </div>
                    {selectedUsers.includes(user.id) && (
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">الصندوق:</Label>
                        <input
                          type="number"
                          className="w-24 border rounded p-1 text-sm"
                          placeholder="المبلغ"
                          value={closingCash[user.id] || ''}
                          onChange={(e) => setClosingCash(prev => ({
                            ...prev,
                            [user.id]: parseFloat(e.target.value) || 0
                          }))}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Company mode - show branches with users
              <div className="space-y-4 p-2">
                {branches.map(({ branch, users: branchUsers }) => (
                  <div key={branch.id} className="border rounded-lg">
                    <div className="flex items-center gap-2 p-3 bg-muted font-medium">
                      <Building2 className="h-4 w-4" />
                      {branch.name}
                      <span className="text-sm text-muted-foreground">
                        ({branchUsers.filter(u => selectedUsers.includes(u.user.id)).length}/{branchUsers.length})
                      </span>
                    </div>
                    <div className="space-y-1 p-2">
                      {branchUsers.map(({ user, shift }) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded"
                        >
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => toggleUser(user.id)}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">
                              مبيعات: {formatCurrency(shift.totalSales, null)}
                            </div>
                          </div>
                          {selectedUsers.includes(user.id) && (
                            <input
                              type="number"
                              className="w-20 border rounded p-1 text-sm"
                              placeholder="الصندوق"
                              value={closingCash[user.id] || ''}
                              onChange={(e) => setClosingCash(prev => ({
                                ...prev,
                                [user.id]: parseFloat(e.target.value) || 0
                              }))}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Totals */}
          <div className="border-t p-3 bg-muted/50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-muted-foreground">إجمالي المبيعات</div>
                <div className="font-bold">{formatCurrency(totals.totalSales, null)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">المرتجعات</div>
                <div className="font-bold text-red-600">{formatCurrency(totals.totalReturns, null)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">المصروفات</div>
                <div className="font-bold text-red-600">{formatCurrency(totals.totalExpenses, null)}</div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleCloseShifts}
              disabled={selectedUsers.length === 0 || loading}
            >
              {loading ? 'جاري الإغلاق...' : `إغلاق ${selectedUsers.length} وردية`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Report UI
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            تقرير إغلاق الورديات
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
              <RadioGroupItem value="full" id="full-r" />
              <Label htmlFor="full-r">تفاصيل كاملة</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="summary" id="summary-r" />
              <Label htmlFor="summary-r">ملخص فقط</Label>
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
            <Separator className="my-2" />
            <div className="font-medium">
              {mode === 'branch' ? branch?.name : 'جميع الفروع'}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              تقرير إغلاق متعدد - {formatDateTime(new Date())}
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">إجمالي المبيعات</div>
              <div className="text-xl font-bold">{formatCurrency(totals.totalSales, null)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">المرتجعات</div>
              <div className="text-xl font-bold text-red-600">{formatCurrency(totals.totalReturns, null)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">المصروفات</div>
              <div className="text-xl font-bold text-red-600">{formatCurrency(totals.totalExpenses, null)}</div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Details per branch/user */}
          {mode === 'branch' ? (
            <div className="space-y-3">
              {closedShifts.map(({ user, shift }) => (
                <div key={user.id} className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Z-{String(shift.zReportNumber || 0).padStart(6, '0')}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">المبيعات:</span>
                      <span className="mr-1">{formatCurrency(shift.totalSales, null)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">المرتجعات:</span>
                      <span className="mr-1 text-red-600">{formatCurrency(shift.totalReturns, null)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">المصروفات:</span>
                      <span className="mr-1 text-red-600">{formatCurrency(shift.totalExpenses, null)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">الصندوق:</span>
                      <span className="mr-1 font-medium">{formatCurrency(shift.closingCash || 0, null)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {branches.map(({ branch, users: branchUsers }) => {
                const closedBranchUsers = branchUsers.filter(u => closedShifts.some(cs => cs.user.id === u.user.id));
                if (closedBranchUsers.length === 0) return null;

                const branchTotals = closedBranchUsers.reduce(
                  (acc, u) => ({
                    sales: acc.sales + u.shift.totalSales,
                    returns: acc.returns + u.shift.totalReturns,
                    expenses: acc.expenses + u.shift.totalExpenses,
                  }),
                  { sales: 0, returns: 0, expenses: 0 }
                );

                return (
                  <div key={branch.id} className="border rounded">
                    <div className="flex items-center justify-between p-3 bg-muted">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span className="font-medium">{branch.name}</span>
                      </div>
                      <div className="text-sm">
                        {formatCurrency(branchTotals.sales, null)}
                      </div>
                    </div>
                    <div className="p-2 space-y-2">
                      {printMode === 'full' && closedBranchUsers.map(({ user, shift }) => (
                        <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            {user.name}
                          </div>
                          <div className="flex gap-4">
                            <span>{formatCurrency(shift.totalSales, null)}</span>
                            <span className="text-muted-foreground">Z-{String(shift.zReportNumber || 0).padStart(6, '0')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Company Totals */}
              <div className="border-2 rounded p-3 bg-gray-100">
                <div className="text-center font-bold mb-2">إجماليات الشركة</div>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-xs text-muted-foreground">المبيعات</div>
                    <div className="font-bold">{formatCurrency(totals.totalSales, null)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">المرتجعات</div>
                    <div className="font-bold text-red-600">{formatCurrency(totals.totalReturns, null)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">المصروفات</div>
                    <div className="font-bold text-red-600">{formatCurrency(totals.totalExpenses, null)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">الصافي</div>
                    <div className="font-bold text-green-600">
                      {formatCurrency(totals.totalSales - totals.totalReturns - totals.totalExpenses, null)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t-2 border-dashed text-center text-xs text-gray-500">
            <div className="flex justify-center gap-4 mb-1">
              <span>المشرف: _____________</span>
              <span>|</span>
              <span>تاريخ الطباعة: {formatDateTime(new Date())}</span>
            </div>
            <div className="mt-2">
              <Check className="inline h-3 w-3 mr-1" />
              تم إغلاق {closedShifts.length} وردية بنجاح
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
