'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, MoreHorizontal, DollarSign } from 'lucide-react';
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { Currency } from '@/types';

export function CurrenciesPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [formData, setFormData] = useState({
    name: '', nameAr: '', code: '', symbol: '', decimalPlaces: 2, isDefault: false, isActive: true
  });

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const response = await fetch('/api/currencies');
      const data = await response.json();
      setCurrencies(data.currencies || []);
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (selectedCurrency) {
        await fetch(`/api/currencies/${selectedCurrency.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/currencies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      fetchCurrencies();
      setShowAddDialog(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save currency:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/currencies/${id}`, { method: 'DELETE' });
      fetchCurrencies();
    } catch (error) {
      console.error('Failed to delete currency:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', nameAr: '', code: '', symbol: '', decimalPlaces: 2, isDefault: false, isActive: true });
    setSelectedCurrency(null);
  };

  const filteredCurrencies = currencies.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="p-6">جاري التحميل...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">العملات</h1>
          <p className="text-muted-foreground">إدارة العملات المستخدمة في النظام</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
          <Plus className="h-4 w-4 ml-2" /> إضافة عملة
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="بحث..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-10" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العملة</TableHead>
                <TableHead>الرمز</TableHead>
                <TableHead>الكود</TableHead>
                <TableHead>الخانات العشرية</TableHead>
                <TableHead>الافتراضية</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCurrencies.map(currency => (
                <TableRow key={currency.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{currency.name}</p>
                        <p className="text-xs text-muted-foreground">{currency.nameAr}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-lg font-bold">{currency.symbol}</TableCell>
                  <TableCell><code className="bg-muted px-2 py-1 rounded">{currency.code}</code></TableCell>
                  <TableCell>{currency.decimalPlaces}</TableCell>
                  <TableCell>
                    {currency.isDefault && <Badge>افتراضية</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={currency.isActive ? 'default' : 'secondary'}>
                      {currency.isActive ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedCurrency(currency);
                          setFormData({
                            name: currency.name, nameAr: currency.nameAr, code: currency.code,
                            symbol: currency.symbol, decimalPlaces: currency.decimalPlaces,
                            isDefault: currency.isDefault, isActive: currency.isActive
                          });
                          setShowAddDialog(true);
                        }}>
                          <Edit className="ml-2 h-4 w-4" /> تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(currency.id)}>
                          <Trash2 className="ml-2 h-4 w-4" /> حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedCurrency ? 'تعديل العملة' : 'إضافة عملة جديدة'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div><Label>الاسم (إنجليزي)</Label><Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} /></div>
            <div><Label>الاسم (عربي)</Label><Input value={formData.nameAr} onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))} /></div>
            <div><Label>الكود *</Label><Input value={formData.code} onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))} placeholder="SAR" /></div>
            <div><Label>الرمز *</Label><Input value={formData.symbol} onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))} placeholder="ر.س" /></div>
            <div><Label>الخانات العشرية</Label>
              <select className="w-full border rounded-md p-2" value={formData.decimalPlaces} onChange={(e) => setFormData(prev => ({ ...prev, decimalPlaces: parseInt(e.target.value) }))}>
                <option value="0">0</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
            <div className="flex items-center gap-4 pt-6">
              <div className="flex items-center gap-2">
                <Switch checked={formData.isDefault} onCheckedChange={(v) => setFormData(prev => ({ ...prev, isDefault: v }))} />
                <Label>افتراضية</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.isActive} onCheckedChange={(v) => setFormData(prev => ({ ...prev, isActive: v }))} />
                <Label>نشط</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>إلغاء</Button>
            <Button onClick={handleSave}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
