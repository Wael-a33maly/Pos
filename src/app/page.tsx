'use client';

import { useEffect, Suspense, lazy, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { useAppStore } from '@/store';
import { Skeleton } from '@/components/ui/skeleton';

// Loading Skeleton Component
function PageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

// Lazy loaded pages - تحميل عند الطلب
const DashboardPage = lazy(() => import('@/components/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
// POS Module - استخدام الوحدة الجديدة
const POSPage = lazy(() => import('@/modules/pos/components/POSPage').then(m => ({ default: m.POSPage })));
const ProductsPage = lazy(() => import('@/components/products/ProductsPage').then(m => ({ default: m.ProductsPage })));
const CategoriesPage = lazy(() => import('@/components/products/CategoriesPage').then(m => ({ default: m.CategoriesPage })));
const BrandsPage = lazy(() => import('@/components/products/BrandsPage').then(m => ({ default: m.BrandsPage })));
const BarcodePrintPage = lazy(() => import('@/components/products/BarcodePrintPage').then(m => ({ default: m.BarcodePrintPage })));
const ImportProductsPage = lazy(() => import('@/components/products/ImportProductsPage').then(m => ({ default: m.ImportProductsPage })));
const UsersPage = lazy(() => import('@/components/users/UsersPage').then(m => ({ default: m.UsersPage })));
const UnifiedSettingsPage = lazy(() => import('@/components/settings/UnifiedSettingsPage').then(m => ({ default: m.UnifiedSettingsPage })));
const CustomersPage = lazy(() => import('@/components/customers/CustomersPage').then(m => ({ default: m.CustomersPage })));
const SuppliersPage = lazy(() => import('@/components/suppliers/SuppliersPage').then(m => ({ default: m.SuppliersPage })));
const InvoicesPage = lazy(() => import('@/components/invoices/InvoicesPage').then(m => ({ default: m.InvoicesPage })));
const ExpensesPage = lazy(() => import('@/components/expenses/ExpensesPage').then(m => ({ default: m.ExpensesPage })));
const ReportsPage = lazy(() => import('@/components/reports/ReportsPage').then(m => ({ default: m.ReportsPage })));
const AccountsPage = lazy(() => import('@/components/accounts/AccountsPage').then(m => ({ default: m.AccountsPage })));
const ShiftManagementPage = lazy(() => import('@/components/shifts/ShiftManagementPage').then(m => ({ default: m.ShiftManagementPage })));
const AuditLogsPage = lazy(() => import('@/components/shifts/AuditLogsPage').then(m => ({ default: m.AuditLogsPage })));
const LoginPage = lazy(() => import('@/components/auth/LoginPage').then(m => ({ default: m.LoginPage })));

// Profile Page - صفحة خفيفة لا تحتاج lazy loading
function ProfilePage() {
  const { user } = useAppStore();
  
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">الملف الشخصي</h1>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-2xl font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.name || 'المستخدم'}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">الدور</p>
            <p className="font-medium">{user?.role === 'SUPER_ADMIN' ? 'سوبر مدير' : user?.role === 'BRANCH_ADMIN' ? 'مدير فرع' : 'مستخدم'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Page mapping with lazy loading
const PAGE_COMPONENTS: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'users': UsersPage,
  'roles': UsersPage,
  'shifts': ShiftManagementPage,
  'shift-close': ShiftManagementPage,
  'shift-closures': ShiftManagementPage,
  'audit-logs': AuditLogsPage,
  'products': ProductsPage,
  'categories': CategoriesPage,
  'brands': BrandsPage,
  'customers': CustomersPage,
  'suppliers': SuppliersPage,
  'supplier-companies': SuppliersPage,
  'invoices': InvoicesPage,
  'returns': InvoicesPage,
  'expenses': ExpensesPage,
  'expense-categories': ExpensesPage,
  'accounts': AccountsPage,
  'reports': ReportsPage,
  'settings': UnifiedSettingsPage,
  'barcode': BarcodePrintPage,
  'import': ImportProductsPage,
};

function PageContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const page = searchParams.get('page');
  const { setPosMode, isAuthenticated } = useAppStore();

  useEffect(() => {
    setPosMode(mode === 'pos');
  }, [mode, setPosMode]);

  // تحديد الصفحة المطلوبة - useMemo لمنع إعادة الحساب
  const PageComponent = useMemo(() => {
    // صفحة تسجيل الدخول
    if (!isAuthenticated && page !== 'login') {
      return LoginPage;
    }
    
    if (page === 'login') {
      return LoginPage;
    }
    
    // وضع نقطة البيع
    if (mode === 'pos') {
      return POSPage;
    }
    
    // صفحة الملف الشخصي
    if (page === 'profile') {
      return null; // سيتم التعامل معها بشكل خاص
    }
    
    // الصفحات الأخرى
    return PAGE_COMPONENTS[page || ''] || DashboardPage;
  }, [isAuthenticated, page, mode]);

  // في حالة صفحة الملف الشخصي
  if (page === 'profile' && isAuthenticated) {
    return (
      <Layout>
        <ProfilePage />
      </Layout>
    );
  }

  return (
    <Layout>
      <Suspense fallback={<PageSkeleton />}>
        {PageComponent && <PageComponent />}
      </Suspense>
    </Layout>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>}>
      <PageContent />
    </Suspense>
  );
}
