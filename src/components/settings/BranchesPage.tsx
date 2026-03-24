'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2, MoreHorizontal, Store, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { Branch } from '@/types';

const mockBranches: Branch[] = [
  { id: '1', name: 'الفرع الرئيسي - الرياض', nameAr: 'الفرع الرئيسي', address: 'الرياض، حي العليا', phone: '0112345678', email: 'main@pos.com', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'فرع جدة', nameAr: 'فرع جدة', address: 'جدة، حي الحمراء', phone: '0123456789', email: 'jeddah@pos.com', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '3', name: 'فرع الدمام', nameAr: 'فرع الدمام', address: 'الدمام، حي الفيصلية', phone: '0134567890', email: 'dammam@pos.com', isActive: false, createdAt: new Date(), updatedAt: new Date() },
];

export function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>(mockBranches);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: '', nameAr: '', address: '', phone: '', email: '', isActive: true
  });

  const filteredBranches = branches.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    if (selectedBranch) {
      setBranches(prev => prev.map(b => b.id === selectedBranch.id ? { ...b, ...formData } : b));
    } else {
      setBranches(prev => [...prev, { id: Date.now().toString(), ...formData, createdAt: new Date(), updatedAt: new Date() }]);
    }
    setShowAddDialog(false);
    resetForm();
  };

  const handleDelete = () => {
    if (selectedBranch) {
      setBranches(prev => prev.filter(b => b.id !== selectedBranch.id));
      setShowDeleteDialog(false);
      setSelectedBranch(null);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', nameAr: '', address: '', phone: '', email: '', isActive: true });
    setSelectedBranch(null);
  };

  const openEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      name: branch.name, nameAr: branch.nameAr || '', address: branch.address || '',
      phone: branch.phone || '', email: branch.email || '', isActive: branch.isActive
    });
    setShowAddDialog(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">الفروع</h1>
          <p className="text-muted-foreground">إدارة فروع الشركة</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
          <Plus className="h-4 w-4 ml-2" /> إضافة فرع
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">إجمالي الفروع</p><p className="text-3xl font-bold">{branches.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">الفروع النشطة</p><p className="text-3xl font-bold text-green-600">{branches.filter(b => b.isActive).length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">الفروع غير النشطة</p><p className="text-3xl font-bold text-red-600">{branches.filter(b => !b.isActive).length}</p></CardContent></Card>
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
                <TableHead>الفرع</TableHead>
                <TableHead>العنوان</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>البريد</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBranches.map(branch => (
                <TableRow key={branch.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                        <Store className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{branch.name}</p>
                        {branch.nameAr && <p className="text-xs text-muted-foreground">{branch.nameAr}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{branch.address ? <div className="flex items-center gap-1"><MapPin className="h-4 w-4" />{branch.address}</div> : '-'}</TableCell>
                  <TableCell>{branch.phone ? <div className="flex items-center gap-1"><Phone className="h-4 w-4" />{branch.phone}</div> : '-'}</TableCell>
                  <TableCell>{branch.email ? <div className="flex items-center gap-1"><Mail className="h-4 w-4" />{branch.email}</div> : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={branch.isActive ? 'default' : 'secondary'}>{branch.isActive ? 'نشط' : 'غير نشط'}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(branch)}><Edit className="ml-2 h-4 w-4" /> تعديل</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedBranch(branch); setShowDeleteDialog(true); }}>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedBranch ? 'تعديل الفرع' : 'إضافة فرع جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>اسم الفرع *</Label><Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} /></div>
              <div><Label>الاسم بالعربي</Label><Input value={formData.nameAr} onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))} /></div>
            </div>
            <div><Label>العنوان</Label><Input value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>رقم الهاتف</Label><Input value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} /></div>
              <div><Label>البريد الإلكتروني</Label><Input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.isActive} onCheckedChange={(v) => setFormData(prev => ({ ...prev, isActive: v }))} />
              <Label>فرع نشط</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>إلغاء</Button>
            <Button onClick={handleSave}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>هل أنت متأكد من حذف "{selectedBranch?.name}"؟</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDelete}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
