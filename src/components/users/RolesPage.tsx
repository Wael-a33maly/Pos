'use client';

import { useState } from 'react';
import {
  Plus, Search, Edit, Trash2, MoreHorizontal, Shield, UserCheck, Users,
  LayoutDashboard, Package, FileText, Wallet, BarChart3, Settings,
  Building2, CreditCard, Calculator, Tags, Layers, Truck, QrCode, Import,
  RotateCcw, DollarSign, Printer, Palette, Ruler, Warehouse, ReceiptText, Landmark
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppStore } from '@/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// All permissions in the system
const allPermissions = [
  {
    module: 'dashboard',
    name: 'لوحة التحكم',
    icon: LayoutDashboard,
    actions: ['view'],
  },
  {
    module: 'users',
    name: 'المستخدمين',
    icon: Users,
    actions: ['view', 'create', 'edit', 'delete'],
  },
  {
    module: 'roles',
    name: 'الأدوار والصلاحيات',
    icon: Shield,
    actions: ['view', 'create', 'edit', 'delete'],
  },
  {
    module: 'customers',
    name: 'العملاء',
    icon: UserCheck,
    actions: ['view', 'create', 'edit', 'delete', 'export', 'import'],
  },
  {
    module: 'suppliers',
    name: 'الموردين',
    icon: Truck,
    actions: ['view', 'create', 'edit', 'delete', 'export', 'import'],
  },
  {
    module: 'products',
    name: 'المنتجات',
    icon: Package,
    actions: ['view', 'create', 'edit', 'delete', 'export', 'import'],
  },
  {
    module: 'categories',
    name: 'الفئات',
    icon: Tags,
    actions: ['view', 'create', 'edit', 'delete', 'export', 'import'],
  },
  {
    module: 'brands',
    name: 'البراندات',
    icon: Layers,
    actions: ['view', 'create', 'edit', 'delete', 'export', 'import'],
  },
  {
    module: 'supplier-companies',
    name: 'الشركات الموردة',
    icon: Building2,
    actions: ['view', 'create', 'edit', 'delete', 'export', 'import'],
  },
  {
    module: 'variants',
    name: 'قوالب المتغيرات',
    icon: Palette,
    actions: ['view', 'create', 'edit', 'delete'],
  },
  {
    module: 'barcode',
    name: 'طباعة الباركود',
    icon: QrCode,
    actions: ['view', 'print'],
  },
  {
    module: 'invoices',
    name: 'الفواتير',
    icon: FileText,
    actions: ['view', 'create', 'edit', 'delete', 'print'],
  },
  {
    module: 'returns',
    name: 'المرتجعات',
    icon: RotateCcw,
    actions: ['view', 'create', 'edit', 'delete'],
  },
  {
    module: 'expenses',
    name: 'المصروفات',
    icon: Wallet,
    actions: ['view', 'create', 'edit', 'delete'],
  },
  {
    module: 'accounts',
    name: 'الحسابات',
    icon: Calculator,
    actions: ['view', 'create', 'edit', 'delete'],
  },
  {
    module: 'journal-entries',
    name: 'القيود المحاسبية',
    icon: ReceiptText,
    actions: ['view', 'create', 'edit', 'delete'],
  },
  {
    module: 'reports',
    name: 'التقارير',
    icon: BarChart3,
    actions: ['view', 'export', 'print'],
  },
  {
    module: 'payment-methods',
    name: 'طرق الدفع',
    icon: CreditCard,
    actions: ['view', 'create', 'edit', 'delete'],
  },
  {
    module: 'settings',
    name: 'الإعدادات',
    icon: Settings,
    actions: ['view', 'edit'],
  },
  {
    module: 'branches',
    name: 'الفروع',
    icon: Building2,
    actions: ['view', 'create', 'edit', 'delete'],
  },
  {
    module: 'currencies',
    name: 'العملات',
    icon: DollarSign,
    actions: ['view', 'create', 'edit', 'delete'],
  },
  {
    module: 'units',
    name: 'الوحدات',
    icon: Ruler,
    actions: ['view', 'create', 'edit', 'delete'],
  },
  {
    module: 'print-settings',
    name: 'إعدادات الطباعة',
    icon: Printer,
    actions: ['view', 'edit'],
  },
  {
    module: 'barcode-settings',
    name: 'إعدادات الباركود',
    icon: QrCode,
    actions: ['view', 'edit'],
  },
  {
    module: 'custom-fields',
    name: 'الحقول المخصصة',
    icon: Palette,
    actions: ['view', 'create', 'edit', 'delete'],
  },
  {
    module: 'pos',
    name: 'نقطة البيع',
    icon: LayoutDashboard,
    actions: ['view', 'create_invoice', 'returns', 'expenses', 'shifts'],
  },
];

const actionLabels: Record<string, string> = {
  'view': 'عرض',
  'create': 'إضافة',
  'edit': 'تعديل',
  'delete': 'حذف',
  'export': 'تصدير',
  'import': 'استيراد',
  'print': 'طباعة',
  'create_invoice': 'إنشاء فاتورة',
  'returns': 'المرتجعات',
  'expenses': 'المصروفات',
  'shifts': 'الورديات',
};

interface Role {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  isSystem: boolean;
  permissions: { module: string; actions: string[] }[];
  usersCount: number;
  createdAt: Date;
}

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'SUPER_ADMIN',
    nameAr: 'سوبر مدير',
    description: 'صلاحيات كاملة على جميع أجزاء النظام',
    isSystem: true,
    permissions: allPermissions.map(p => ({ module: p.module, actions: p.actions })),
    usersCount: 1,
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'BRANCH_ADMIN',
    nameAr: 'مدير فرع',
    description: 'صلاحيات إدارة فرع واحد',
    isSystem: true,
    permissions: [
      { module: 'dashboard', actions: ['view'] },
      { module: 'products', actions: ['view', 'create', 'edit'] },
      { module: 'invoices', actions: ['view', 'create', 'edit', 'print'] },
      { module: 'customers', actions: ['view', 'create', 'edit'] },
      { module: 'reports', actions: ['view'] },
      { module: 'pos', actions: ['view', 'create_invoice', 'returns', 'expenses', 'shifts'] },
    ],
    usersCount: 3,
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'CASHIER',
    nameAr: 'كاشير',
    description: 'صلاحيات نقطة البيع فقط',
    isSystem: false,
    permissions: [
      { module: 'pos', actions: ['view', 'create_invoice', 'shifts'] },
      { module: 'customers', actions: ['view', 'create'] },
    ],
    usersCount: 5,
    createdAt: new Date(),
  },
  {
    id: '4',
    name: 'INVENTORY_MANAGER',
    nameAr: 'مسؤول المخزون',
    description: 'إدارة المنتجات والمخزون',
    isSystem: false,
    permissions: [
      { module: 'products', actions: ['view', 'create', 'edit', 'delete', 'import'] },
      { module: 'categories', actions: ['view', 'create', 'edit'] },
      { module: 'brands', actions: ['view', 'create', 'edit'] },
      { module: 'barcode', actions: ['view', 'print'] },
    ],
    usersCount: 2,
    createdAt: new Date(),
  },
];

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState('roles');
  
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    permissions: {} as Record<string, string[]>,
  });

  const filteredRoles = roles.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.nameAr.includes(searchQuery)
  );

  const handleSave = () => {
    if (!formData.name || !formData.nameAr) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const permissions = Object.entries(formData.permissions).map(([module, actions]) => ({
      module,
      actions,
    }));

    if (selectedRole) {
      setRoles(prev => prev.map(r =>
        r.id === selectedRole.id ? { ...r, ...formData, permissions } : r
      ));
      toast.success('تم تحديث الدور بنجاح');
    } else {
      const newRole: Role = {
        id: Date.now().toString(),
        name: formData.name,
        nameAr: formData.nameAr,
        description: formData.description,
        isSystem: false,
        permissions,
        usersCount: 0,
        createdAt: new Date(),
      };
      setRoles(prev => [...prev, newRole]);
      toast.success('تم إنشاء الدور بنجاح');
    }
    setShowAddDialog(false);
    resetForm();
  };

  const handleDelete = (role: Role) => {
    if (role.isSystem) {
      toast.error('لا يمكن حذف أدوار النظام');
      return;
    }
    if (role.usersCount > 0) {
      toast.error('لا يمكن حذف دور مرتبط بمستخدمين');
      return;
    }
    setRoles(prev => prev.filter(r => r.id !== role.id));
    toast.success('تم حذف الدور بنجاح');
  };

  const resetForm = () => {
    setFormData({ name: '', nameAr: '', description: '', permissions: {} });
    setSelectedRole(null);
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    const permMap: Record<string, string[]> = {};
    role.permissions.forEach(p => {
      permMap[p.module] = p.actions;
    });
    setFormData({
      name: role.name,
      nameAr: role.nameAr,
      description: role.description,
      permissions: permMap,
    });
    setShowAddDialog(true);
  };

  const togglePermission = (module: string, action: string) => {
    setFormData(prev => {
      const currentActions = prev.permissions[module] || [];
      const newActions = currentActions.includes(action)
        ? currentActions.filter(a => a !== action)
        : [...currentActions, action];
      
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [module]: newActions,
        },
      };
    });
  };

  const toggleAllModuleActions = (module: string, actions: string[]) => {
    setFormData(prev => {
      const currentActions = prev.permissions[module] || [];
      const hasAll = actions.every(a => currentActions.includes(a));
      
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [module]: hasAll ? [] : actions,
        },
      };
    });
  };

  const isPermissionChecked = (module: string, action: string) => {
    return formData.permissions[module]?.includes(action) || false;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">الأدوار والصلاحيات</h1>
          <p className="text-muted-foreground">إدارة أدوار المستخدمين وصلاحياتهم</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
          <Plus className="h-4 w-4 ml-2" /> إضافة دور جديد
        </Button>
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="roles">الأدوار</TabsTrigger>
          <TabsTrigger value="permissions">جميع الصلاحيات</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.map(role => (
              <Card key={role.id} className={cn(role.isSystem && "border-primary/50")}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{role.nameAr}</CardTitle>
                        <p className="text-sm text-muted-foreground">{role.name}</p>
                      </div>
                    </div>
                    {role.isSystem && (
                      <Badge variant="secondary">نظام</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">عدد المستخدمين:</span>
                    <span className="font-medium">{role.usersCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">عدد الصلاحيات:</span>
                    <span className="font-medium">
                      {role.permissions.reduce((sum, p) => sum + p.actions.length, 0)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(role)}
                    >
                      <Edit className="h-4 w-4 ml-1" /> تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(role)}
                    >
                      <Shield className="h-4 w-4 ml-1" /> الصلاحيات
                    </Button>
                    {!role.isSystem && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(role)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>جميع صلاحيات النظام</CardTitle>
              <CardDescription>قائمة بجميع الصلاحيات المتاحة في النظام</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الوحدة</TableHead>
                    <TableHead>الصلاحيات المتاحة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPermissions.map(perm => (
                    <TableRow key={perm.module}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <perm.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{perm.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {perm.actions.map(action => (
                            <Badge key={action} variant="outline" className="text-xs">
                              {actionLabels[action] || action}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Role Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedRole ? 'تعديل الدور' : 'إضافة دور جديد'}</DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[70vh]">
            <div className="space-y-6 p-4">
              {/* Role Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>اسم الدور (إنجليزي) *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ADMIN"
                    disabled={selectedRole?.isSystem}
                  />
                </div>
                <div>
                  <Label>اسم الدور (عربي) *</Label>
                  <Input
                    value={formData.nameAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                    placeholder="مدير"
                  />
                </div>
                <div>
                  <Label>الوصف</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="وصف الدور"
                  />
                </div>
              </div>

              <Separator />

              {/* Permissions */}
              <div>
                <h3 className="text-lg font-semibold mb-4">الصلاحيات</h3>
                <div className="space-y-4">
                  {allPermissions.map(perm => (
                    <Card key={perm.module}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <perm.icon className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">{perm.name}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAllModuleActions(perm.module, perm.actions)}
                          >
                            تحديد الكل
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-3 pr-7">
                          {perm.actions.map(action => (
                            <label
                              key={action}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Checkbox
                                checked={isPermissionChecked(perm.module, action)}
                                onCheckedChange={() => togglePermission(perm.module, action)}
                              />
                              <span className="text-sm">{actionLabels[action] || action}</span>
                            </label>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>إلغاء</Button>
            <Button onClick={handleSave}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
