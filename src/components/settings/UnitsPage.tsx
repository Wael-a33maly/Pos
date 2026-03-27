'use client';

import { useState } from 'react';
import {
  Plus, Search, Edit, Trash2, MoreHorizontal, Ruler, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Unit {
  id: string;
  name: string;
  nameAr: string;
  abbreviation: string;
  isActive: boolean;
  isDefault: boolean;
}

const mockUnits: Unit[] = [
  { id: '1', name: 'Piece', nameAr: 'قطعة', abbreviation: 'pc', isActive: true, isDefault: true },
  { id: '2', name: 'Box', nameAr: 'علبة', abbreviation: 'bx', isActive: true, isDefault: false },
  { id: '3', name: 'Kilogram', nameAr: 'كيلو', abbreviation: 'kg', isActive: true, isDefault: false },
  { id: '4', name: 'Meter', nameAr: 'متر', abbreviation: 'm', isActive: true, isDefault: false },
  { id: '5', name: 'Liter', nameAr: 'لتر', abbreviation: 'L', isActive: true, isDefault: false },
  { id: '6', name: 'Pack', nameAr: 'باكيج', abbreviation: 'pk', isActive: true, isDefault: false },
  { id: '7', name: 'Dozen', nameAr: 'دستة', abbreviation: 'dz', isActive: false, isDefault: false },
];

export function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>(mockUnits);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    abbreviation: '',
    isActive: true,
    isDefault: false,
  });

  const filteredUnits = units.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.nameAr.includes(searchQuery) ||
    u.abbreviation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    if (!formData.name || !formData.nameAr) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (selectedUnit) {
      setUnits(prev => prev.map(u =>
        u.id === selectedUnit.id ? { ...u, ...formData } : u
      ));
      
      // If setting as default, remove default from others
      if (formData.isDefault) {
        setUnits(prev => prev.map(u =>
          u.id !== selectedUnit.id ? { ...u, isDefault: false } : u
        ));
      }
      
      toast.success('تم تحديث الوحدة بنجاح');
    } else {
      const newUnit: Unit = {
        id: Date.now().toString(),
        name: formData.name,
        nameAr: formData.nameAr,
        abbreviation: formData.abbreviation,
        isActive: formData.isActive,
        isDefault: formData.isDefault,
      };
      
      let updatedUnits = [...units, newUnit];
      
      // If setting as default, remove default from others
      if (formData.isDefault) {
        updatedUnits = updatedUnits.map(u =>
          u.id !== newUnit.id ? { ...u, isDefault: false } : u
        );
      }
      
      setUnits(updatedUnits);
      toast.success('تم إنشاء الوحدة بنجاح');
    }
    setShowAddDialog(false);
    resetForm();
  };

  const handleDelete = (unit: Unit) => {
    if (unit.isDefault) {
      toast.error('لا يمكن حذف الوحدة الافتراضية');
      return;
    }
    setUnits(prev => prev.filter(u => u.id !== unit.id));
    toast.success('تم حذف الوحدة بنجاح');
  };

  const handleSetDefault = (unit: Unit) => {
    setUnits(prev => prev.map(u => ({
      ...u,
      isDefault: u.id === unit.id
    })));
    toast.success('تم تعيين الوحدة كافتراضية');
  };

  const resetForm = () => {
    setFormData({ name: '', nameAr: '', abbreviation: '', isActive: true, isDefault: false });
    setSelectedUnit(null);
  };

  const openEditDialog = (unit: Unit) => {
    setSelectedUnit(unit);
    setFormData({
      name: unit.name,
      nameAr: unit.nameAr,
      abbreviation: unit.abbreviation,
      isActive: unit.isActive,
      isDefault: unit.isDefault,
    });
    setShowAddDialog(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">الوحدات</h1>
          <p className="text-muted-foreground">إدارة وحدات قياس المنتجات</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
          <Plus className="h-4 w-4 ml-2" /> إضافة وحدة
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Ruler className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الوحدات</p>
                <p className="text-2xl font-bold">{units.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الوحدات النشطة</p>
                <p className="text-2xl font-bold">{units.filter(u => u.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Ruler className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الوحدة الافتراضية</p>
                <p className="text-2xl font-bold">{units.find(u => u.isDefault)?.nameAr || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="بحث..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الوحدة</TableHead>
                <TableHead>الاسم بالعربية</TableHead>
                <TableHead>الرمز</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>افتراضية</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUnits.map(unit => (
                <TableRow key={unit.id} className={cn(!unit.isActive && "opacity-50")}>
                  <TableCell className="font-medium">{unit.name}</TableCell>
                  <TableCell>{unit.nameAr}</TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{unit.abbreviation}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={unit.isActive ? 'default' : 'secondary'}>
                      {unit.isActive ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {unit.isDefault ? (
                      <Badge variant="default">افتراضية</Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(unit)}
                      >
                        تعيين كافتراضية
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(unit)}>
                          <Edit className="ml-2 h-4 w-4" /> تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(unit)}
                          disabled={unit.isDefault}
                        >
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

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUnit ? 'تعديل الوحدة' : 'إضافة وحدة جديدة'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الاسم (إنجليزي) *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Piece"
                />
              </div>
              <div>
                <Label>الاسم (عربي) *</Label>
                <Input
                  value={formData.nameAr}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                  placeholder="قطعة"
                />
              </div>
            </div>
            <div>
              <Label>الرمز المختصر</Label>
              <Input
                value={formData.abbreviation}
                onChange={(e) => setFormData(prev => ({ ...prev, abbreviation: e.target.value }))}
                placeholder="pc"
                className="max-w-32"
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(v) => setFormData(prev => ({ ...prev, isActive: v }))}
                />
                <Label>نشط</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isDefault}
                  onCheckedChange={(v) => setFormData(prev => ({ ...prev, isDefault: v }))}
                />
                <Label>افتراضية</Label>
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
