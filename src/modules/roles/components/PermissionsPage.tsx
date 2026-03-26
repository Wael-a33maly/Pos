// ============================================
// Permissions Page - صفحة الصلاحيات
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, RefreshCw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePermissions, type Permission, type GroupedPermissions } from '../hooks/usePermissions';

interface PermissionsPageProps {
  userId: string;
}

export function PermissionsPage({ userId }: PermissionsPageProps) {
  const { toast } = useToast();
  const { groupedPermissions, loading: permissionsLoading } = usePermissions();
  
  const [localPermissions, setLocalPermissions] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const groupNames: Record<string, string> = {
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

  // تحميل صلاحيات المستخدم
  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const res = await fetch(`/api/users/${userId}/permissions`);
        if (res.ok) {
          const data = await res.json();
          const perms: Record<string, boolean> = {};
          
          Object.entries(data.permissions || {}).forEach(([key, value]: [string, any]) => {
            perms[key] = value.allowed;
          });
          
          setLocalPermissions(perms);
        }
      } catch (error) {
        console.error('Error fetching user permissions:', error);
      }
    };

    if (userId) {
      fetchUserPermissions();
    }
  }, [userId]);

  // تبديل صلاحية
  const handleToggle = (module: string, action: string) => {
    const key = `${module}:${action}`;
    setLocalPermissions(prev => {
      const newValue = !prev[key];
      return { ...prev, [key]: newValue };
    });
    setHasChanges(true);
  };

  // حفظ التغييرات
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permissions: Object.entries(localPermissions).map(([key, allowed]) => ({
            permissionId: key,
            allowed
          }))
        })
      });

      if (res.ok) {
        toast({
          title: 'تم الحفظ',
          description: 'تم حفظ صلاحيات المستخدم بنجاح'
        });
        setHasChanges(false);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ الصلاحيات',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // تحديد الكل
  const handleSelectAll = () => {
    const allPerms: Record<string, boolean> = {};
    Object.values(groupedPermissions).forEach((perms) => {
      (perms as Permission[]).forEach((perm) => {
        allPerms[`${perm.module}:${perm.action}`] = true;
      });
    });
    setLocalPermissions(allPerms);
    setHasChanges(true);
  };

  // إلغاء الكل
  const handleDeselectAll = () => {
    const nonePerms: Record<string, boolean> = {};
    Object.values(groupedPermissions).forEach((perms) => {
      (perms as Permission[]).forEach((perm) => {
        nonePerms[`${perm.module}:${perm.action}`] = false;
      });
    });
    setLocalPermissions(nonePerms);
    setHasChanges(true);
  };

  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="h-8 w-8 text-muted-foreground" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <Label className="text-lg font-semibold">صلاحيات المستخدم</Label>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            تحديد الكل
          </Button>
          <Button variant="outline" size="sm" onClick={handleDeselectAll}>
            إلغاء الكل
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={!hasChanges || isSaving}
          >
            <Save className="h-4 w-4 ml-2" />
            {isSaving ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[400px] border rounded-lg p-4">
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([group, perms]) => (
            <div key={group} className="space-y-2">
              <div className="flex items-center gap-2 sticky top-0 bg-background py-1 z-10">
                <h4 className="font-semibold text-sm">{groupNames[group] || group}</h4>
                <Badge variant="outline" className="text-xs">
                  {(perms as Permission[]).filter(p => localPermissions[`${p.module}:${p.action}`]).length} / {(perms as Permission[]).length}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(perms as Permission[]).map((perm) => {
                  const key = `${perm.module}:${perm.action}`;
                  const isAllowed = localPermissions[key] ?? false;

                  return (
                    <div
                      key={perm.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="text-sm font-medium truncate">{perm.nameAr}</p>
                        <p className="text-xs text-muted-foreground">{perm.action}</p>
                      </div>
                      <Switch
                        checked={isAllowed}
                        onCheckedChange={() => handleToggle(perm.module, perm.action)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
