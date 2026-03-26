'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Plus, Edit, Trash2, Users, Check, X, Search, ChevronDown, ChevronLeft,
  Save, RefreshCw, AlertCircle, Lock, Unlock, Settings, UserCog
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRoles, usePermissions, type Role, type Permission, type GroupedPermissions } from '../hooks/usePermissions';

// المجموعات والترجمة
const GROUP_NAMES: Record<string, string> = {
  'dashboard': 'لوحة التحكم',
  'products': 'المنتجات',
  'pos': 'نقطة البيع',
  'invoices': 'الفواتير',
  'customers': 'العملاء',
  'suppliers': 'الموردين',
  'shifts': 'الورديات',
  'expenses': 'المصروفات',
  'reports': 'التقارير',
  'users': 'المستخدمين',
  'settings': 'الإعدادات',
  'accounts': 'الحسابات',
};

// ألوان المجموعات
const GROUP_COLORS: Record<string, string> = {
  'dashboard': 'bg-blue-500',
  'products': 'bg-purple-500',
  'pos': 'bg-emerald-500',
  'invoices': 'bg-amber-500',
  'customers': 'bg-cyan-500',
  'suppliers': 'bg-orange-500',
  'shifts': 'bg-rose-500',
  'expenses': 'bg-red-500',
  'reports': 'bg-indigo-500',
  'users': 'bg-violet-500',
  'settings': 'bg-gray-500',
  'accounts': 'bg-teal-500',
};

// مكون بطاقة الدور
function RoleCard({ role, onEdit, onDelete }: {
  role: Role;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const userCount = role._count?.users || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group"
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: role.color }}
              >
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{role.nameAr}</CardTitle>
                <CardDescription className="text-xs">{role.name}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {role.isSystem && (
                <Badge variant="secondary" className="text-xs">نظام</Badge>
              )}
              <Badge variant="outline" className="gap-1">
                <Users className="h-3 w-3" />
                {userCount}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {role.description && (
            <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
          )}
          <div className="flex items-center justify-between">
            <Badge variant={role.isActive ? 'default' : 'secondary'}>
              {role.isActive ? 'نشط' : 'معطل'}
            </Badge>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                disabled={role.isSystem}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                disabled={role.isSystem || userCount > 0}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// مكون جدول الصلاحيات
function PermissionsTable({
  groupedPermissions,
  selectedPermissions,
  onToggle
}: {
  groupedPermissions: GroupedPermissions;
  selectedPermissions: Set<string>;
  onToggle: (permissionId: string) => void;
}) {
  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 pr-4">
        {Object.entries(groupedPermissions).map(([group, permissions]) => (
          <div key={group} className="space-y-2">
            <div className="flex items-center gap-2 sticky top-0 bg-background py-1 z-10">
              <div className={cn("w-3 h-3 rounded-full", GROUP_COLORS[group] || 'bg-gray-400')} />
              <h4 className="font-semibold text-sm">{GROUP_NAMES[group] || group}</h4>
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">
                {(permissions as Permission[]).filter(p => selectedPermissions.has(p.id)).length} / {(permissions as Permission[]).length}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {(permissions as Permission[]).map((perm) => (
                <div
                  key={perm.id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer",
                    selectedPermissions.has(perm.id)
                      ? "bg-primary/10 border-primary/30"
                      : "bg-muted/30 border-transparent hover:bg-muted/50"
                  )}
                  onClick={() => onToggle(perm.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{perm.nameAr}</p>
                    <p className="text-xs text-muted-foreground truncate">{perm.action}</p>
                  </div>
                  {selectedPermissions.has(perm.id) ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

export function RolesPage() {
  const { toast } = useToast();
  const { roles, loading: rolesLoading, createRole, updateRole, deleteRole, refetch: refetchRoles } = useRoles();
  const { groupedPermissions, loading: permsLoading, initPermissions } = usePermissions();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    color: '#3b82f6',
    priority: 0,
  });
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  // تهيئة الصلاحيات
  const handleInitializePermissions = async () => {
    setIsInitializing(true);
    try {
      const result = await initPermissions();
      toast({
        title: 'تمت التهيئة',
        description: `تم إنشاء ${result.created} صلاحية جديدة`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'فشل في تهيئة الصلاحيات',
      });
    } finally {
      setIsInitializing(false);
    }
  };

  // تبديل صلاحية
  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  };

  // حفظ الدور
  const handleSave = async () => {
    if (!formData.name || !formData.nameAr) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'يرجى ملء جميع الحقول المطلوبة' });
      return;
    }

    try {
      const permissions = Array.from(selectedPermissions).map(id => ({
        permissionId: id,
        allowed: true
      }));

      if (selectedRole) {
        await updateRole(selectedRole.id, { ...formData, permissions });
        toast({ title: 'تم التحديث', description: 'تم تحديث الدور بنجاح' });
      } else {
        await createRole({ ...formData, permissions });
        toast({ title: 'تم الإنشاء', description: 'تم إنشاء الدور بنجاح' });
      }

      setShowAddDialog(false);
      setShowEditDialog(false);
      resetForm();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'فشل في حفظ الدور',
      });
    }
  };

  // حذف الدور
  const handleDelete = async () => {
    if (!selectedRole) return;
    try {
      await deleteRole(selectedRole.id);
      toast({ title: 'تم الحذف', description: 'تم حذف الدور بنجاح' });
      setShowDeleteDialog(false);
      setSelectedRole(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'فشل في حذف الدور',
      });
    }
  };

  // إعادة تعيين النموذج
  const resetForm = () => {
    setFormData({
      name: '',
      nameAr: '',
      description: '',
      color: '#3b82f6',
      priority: 0,
    });
    setSelectedPermissions(new Set());
    setSelectedRole(null);
  };

  // فتح نافذة التعديل
  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      nameAr: role.nameAr,
      description: role.description || '',
      color: role.color,
      priority: role.priority,
    });
    // تعيين الصلاحيات المحددة
    const permIds = role.permissions?.filter(p => p.allowed).map(p => p.permissionId) || [];
    setSelectedPermissions(new Set(permIds));
    setShowEditDialog(true);
  };

  // تصفية الأدوار
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.nameAr.includes(searchQuery)
  );

  const isLoading = rolesLoading || permsLoading;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">إدارة الأدوار والصلاحيات</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Shield className="h-4 w-4" />
            تخصيص صلاحيات المستخدمين والأدوار
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleInitializePermissions}
            disabled={isInitializing}
          >
            {isInitializing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            تهيئة الصلاحيات
          </Button>
          <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة دور
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="بحث في الأدوار..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Roles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-muted" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRoles.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">لا توجد أدوار</p>
            <p className="text-muted-foreground">ابدأ بإنشاء دور جديد</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredRoles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                onEdit={() => openEditDialog(role)}
                onDelete={() => { setSelectedRole(role); setShowDeleteDialog(true); }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) { setShowAddDialog(false); setShowEditDialog(false); resetForm(); }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {selectedRole ? 'تعديل الدور' : 'إضافة دور جديد'}
            </DialogTitle>
            <DialogDescription>
              قم بتعيين الاسم والصلاحيات لهذا الدور
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <Label>اسم الدور (إنجليزي) *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="مثال: sales_manager"
              />
            </div>
            <div>
              <Label>اسم الدور (عربي) *</Label>
              <Input
                value={formData.nameAr}
                onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                placeholder="مثال: مدير المبيعات"
              />
            </div>
            <div className="md:col-span-2">
              <Label>الوصف</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="وصف مختصر للدور..."
              />
            </div>
            <div>
              <Label>اللون</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-10 h-10 rounded-lg cursor-pointer"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label>الأولوية</Label>
              <Input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>الصلاحيات</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // تحديد الكل
                    const allIds = Object.values(groupedPermissions).flatMap(perms => 
                      (perms as Permission[]).map(p => p.id)
                    );
                    setSelectedPermissions(new Set(allIds));
                  }}
                >
                  تحديد الكل
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPermissions(new Set())}
                >
                  إلغاء الكل
                </Button>
              </div>
            </div>
            <PermissionsTable
              groupedPermissions={groupedPermissions}
              selectedPermissions={selectedPermissions}
              onToggle={handleTogglePermission}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); setShowEditDialog(false); resetForm(); }}>
              إلغاء
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 ml-2" />
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف دور "{selectedRole?.nameAr}"؟
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
