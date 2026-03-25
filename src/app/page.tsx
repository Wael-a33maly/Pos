'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { POSPage } from '@/components/pos/POSPage';
import { ProductsPage } from '@/components/products/ProductsPage';
import { CategoriesPage } from '@/components/products/CategoriesPage';
import { BrandsPage } from '@/components/products/BrandsPage';
import { BarcodePrintPage } from '@/components/products/BarcodePrintPage';
import { ImportProductsPage } from '@/components/products/ImportProductsPage';
import { UsersPage } from '@/components/users/UsersPage';
import { UnifiedSettingsPage } from '@/components/settings/UnifiedSettingsPage';
import { CustomersPage } from '@/components/customers/CustomersPage';
import { SuppliersPage } from '@/components/suppliers/SuppliersPage';
import { InvoicesPage } from '@/components/invoices/InvoicesPage';
import { ExpensesPage } from '@/components/expenses/ExpensesPage';
import { ReportsPage } from '@/components/reports/ReportsPage';
import { AccountsPage } from '@/components/accounts/AccountsPage';
import { ShiftManagementPage } from '@/components/shifts/ShiftManagementPage';
import { AuditLogsPage } from '@/components/shifts/AuditLogsPage';
import { LoginPage } from '@/components/auth/LoginPage';
import { useAppStore } from '@/store';

function PageContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const page = searchParams.get('page');
  const { setPosMode, isAuthenticated } = useAppStore();

  useEffect(() => {
    setPosMode(mode === 'pos');
  }, [mode, setPosMode]);

  // Show login page if not authenticated (unless it's login page)
  if (!isAuthenticated && page !== 'login') {
    return <LoginPage />;
  }

  // Login page
  if (page === 'login') {
    return <LoginPage />;
  }

  // POS Mode
  if (mode === 'pos') {
    return <POSPage />;
  }

  // Admin Pages
  const renderPage = () => {
    switch (page) {
      case 'users':
      case 'roles':
        return <UsersPage />;
      case 'shifts':
      case 'shift-close':
      case 'shift-closures':
        return <ShiftManagementPage />;
      case 'audit-logs':
        return <AuditLogsPage />;
      case 'products':
        return <ProductsPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'brands':
        return <BrandsPage />;
      case 'customers':
        return <CustomersPage />;
      case 'suppliers':
      case 'supplier-companies':
        return <SuppliersPage />;
      case 'invoices':
      case 'returns':
        return <InvoicesPage />;
      case 'expenses':
      case 'expense-categories':
        return <ExpensesPage />;
      case 'accounts':
        return <AccountsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <UnifiedSettingsPage />;
      case 'barcode':
        return <BarcodePrintPage />;
      case 'import':
        return <ImportProductsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
}

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

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>}>
      <PageContent />
    </Suspense>
  );
}
