import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// جلب جميع الصلاحيات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grouped = searchParams.get('grouped') === 'true';

    const permissions = await db.systemPermission.findMany({
      where: { isActive: true },
      orderBy: [
        { group: 'asc' },
        { module: 'asc' },
        { action: 'asc' }
      ]
    });

    if (grouped) {
      // تجميع الصلاحيات حسب المجموعة
      const groupedPermissions = permissions.reduce((acc, permission) => {
        const groupName = permission.groupAr || permission.group;
        if (!acc[groupName]) {
          acc[groupName] = [];
        }
        acc[groupName].push(permission);
        return acc;
      }, {} as Record<string, typeof permissions>);

      return NextResponse.json({ permissions: groupedPermissions });
    }

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الصلاحيات' },
      { status: 500 }
    );
  }
}

// إنشاء صلاحية جديدة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { module, action, name, nameAr, description, group, groupAr } = body;

    // التحقق من عدم وجود الصلاحية
    const existing = await db.systemPermission.findUnique({
      where: { module_action: { module, action } }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'الصلاحية موجودة مسبقاً' },
        { status: 400 }
      );
    }

    const permission = await db.systemPermission.create({
      data: {
        module,
        action,
        name,
        nameAr,
        description,
        group,
        groupAr
      }
    });

    return NextResponse.json({ permission }, { status: 201 });
  } catch (error) {
    console.error('Error creating permission:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء الصلاحية' },
      { status: 500 }
    );
  }
}

// تهيئة الصلاحيات الافتراضية
export async function PUT(request: NextRequest) {
  try {
    const defaultPermissions = [
      // لوحة التحكم
      { module: 'dashboard', action: 'view', name: 'View Dashboard', nameAr: 'عرض لوحة التحكم', group: 'dashboard', groupAr: 'لوحة التحكم' },
      
      // المنتجات
      { module: 'products', action: 'view', name: 'View Products', nameAr: 'عرض المنتجات', group: 'products', groupAr: 'المنتجات' },
      { module: 'products', action: 'create', name: 'Create Products', nameAr: 'إنشاء منتجات', group: 'products', groupAr: 'المنتجات' },
      { module: 'products', action: 'edit', name: 'Edit Products', nameAr: 'تعديل المنتجات', group: 'products', groupAr: 'المنتجات' },
      { module: 'products', action: 'delete', name: 'Delete Products', nameAr: 'حذف المنتجات', group: 'products', groupAr: 'المنتجات' },
      { module: 'products', action: 'import', name: 'Import Products', nameAr: 'استيراد منتجات', group: 'products', groupAr: 'المنتجات' },
      { module: 'products', action: 'export', name: 'Export Products', nameAr: 'تصدير منتجات', group: 'products', groupAr: 'المنتجات' },
      
      // الفئات
      { module: 'categories', action: 'view', name: 'View Categories', nameAr: 'عرض الفئات', group: 'products', groupAr: 'المنتجات' },
      { module: 'categories', action: 'manage', name: 'Manage Categories', nameAr: 'إدارة الفئات', group: 'products', groupAr: 'المنتجات' },
      
      // الماركات
      { module: 'brands', action: 'view', name: 'View Brands', nameAr: 'عرض الماركات', group: 'products', groupAr: 'المنتجات' },
      { module: 'brands', action: 'manage', name: 'Manage Brands', nameAr: 'إدارة الماركات', group: 'products', groupAr: 'المنتجات' },
      
      // نقطة البيع
      { module: 'pos', action: 'view', name: 'Access POS', nameAr: 'الوصول لنقطة البيع', group: 'pos', groupAr: 'نقطة البيع' },
      { module: 'pos', action: 'discount', name: 'Apply Discounts', nameAr: 'تطبيق الخصومات', group: 'pos', groupAr: 'نقطة البيع' },
      { module: 'pos', action: 'return', name: 'Process Returns', nameAr: 'معالجة المرتجعات', group: 'pos', groupAr: 'نقطة البيع' },
      
      // الفواتير
      { module: 'invoices', action: 'view', name: 'View Invoices', nameAr: 'عرض الفواتير', group: 'invoices', groupAr: 'الفواتير' },
      { module: 'invoices', action: 'create', name: 'Create Invoices', nameAr: 'إنشاء فواتير', group: 'invoices', groupAr: 'الفواتير' },
      { module: 'invoices', action: 'edit', name: 'Edit Invoices', nameAr: 'تعديل الفواتير', group: 'invoices', groupAr: 'الفواتير' },
      { module: 'invoices', action: 'delete', name: 'Delete Invoices', nameAr: 'حذف الفواتير', group: 'invoices', groupAr: 'الفواتير' },
      { module: 'invoices', action: 'export', name: 'Export Invoices', nameAr: 'تصدير الفواتير', group: 'invoices', groupAr: 'الفواتير' },
      
      // العملاء
      { module: 'customers', action: 'view', name: 'View Customers', nameAr: 'عرض العملاء', group: 'customers', groupAr: 'العملاء' },
      { module: 'customers', action: 'create', name: 'Create Customers', nameAr: 'إنشاء عملاء', group: 'customers', groupAr: 'العملاء' },
      { module: 'customers', action: 'edit', name: 'Edit Customers', nameAr: 'تعديل العملاء', group: 'customers', groupAr: 'العملاء' },
      { module: 'customers', action: 'delete', name: 'Delete Customers', nameAr: 'حذف العملاء', group: 'customers', groupAr: 'العملاء' },
      
      // الموردين
      { module: 'suppliers', action: 'view', name: 'View Suppliers', nameAr: 'عرض الموردين', group: 'suppliers', groupAr: 'الموردين' },
      { module: 'suppliers', action: 'manage', name: 'Manage Suppliers', nameAr: 'إدارة الموردين', group: 'suppliers', groupAr: 'الموردين' },
      
      // الورديات
      { module: 'shifts', action: 'view', name: 'View Shifts', nameAr: 'عرض الورديات', group: 'shifts', groupAr: 'الورديات' },
      { module: 'shifts', action: 'open', name: 'Open Shift', nameAr: 'فتح وردية', group: 'shifts', groupAr: 'الورديات' },
      { module: 'shifts', action: 'close', name: 'Close Shift', nameAr: 'إغلاق وردية', group: 'shifts', groupAr: 'الورديات' },
      { module: 'shifts', action: 'force_close', name: 'Force Close Shifts', nameAr: 'إغلاق وردية إجباري', group: 'shifts', groupAr: 'الورديات' },
      { module: 'shifts', action: 'view_all', name: 'View All Shifts', nameAr: 'عرض كل الورديات', group: 'shifts', groupAr: 'الورديات' },
      
      // المصروفات
      { module: 'expenses', action: 'view', name: 'View Expenses', nameAr: 'عرض المصروفات', group: 'expenses', groupAr: 'المصروفات' },
      { module: 'expenses', action: 'create', name: 'Create Expenses', nameAr: 'إنشاء مصروفات', group: 'expenses', groupAr: 'المصروفات' },
      { module: 'expenses', action: 'approve', name: 'Approve Expenses', nameAr: 'اعتماد المصروفات', group: 'expenses', groupAr: 'المصروفات' },
      
      // التقارير
      { module: 'reports', action: 'view', name: 'View Reports', nameAr: 'عرض التقارير', group: 'reports', groupAr: 'التقارير' },
      { module: 'reports', action: 'export', name: 'Export Reports', nameAr: 'تصدير التقارير', group: 'reports', groupAr: 'التقارير' },
      { module: 'reports', action: 'sales', name: 'Sales Reports', nameAr: 'تقارير المبيعات', group: 'reports', groupAr: 'التقارير' },
      { module: 'reports', action: 'products', name: 'Products Reports', nameAr: 'تقارير المنتجات', group: 'reports', groupAr: 'التقارير' },
      { module: 'reports', action: 'profits', name: 'Profits Reports', nameAr: 'تقارير الأرباح', group: 'reports', groupAr: 'التقارير' },
      
      // المستخدمين
      { module: 'users', action: 'view', name: 'View Users', nameAr: 'عرض المستخدمين', group: 'users', groupAr: 'المستخدمين' },
      { module: 'users', action: 'create', name: 'Create Users', nameAr: 'إنشاء مستخدمين', group: 'users', groupAr: 'المستخدمين' },
      { module: 'users', action: 'edit', name: 'Edit Users', nameAr: 'تعديل المستخدمين', group: 'users', groupAr: 'المستخدمين' },
      { module: 'users', action: 'delete', name: 'Delete Users', nameAr: 'حذف المستخدمين', group: 'users', groupAr: 'المستخدمين' },
      { module: 'users', action: 'manage_permissions', name: 'Manage Permissions', nameAr: 'إدارة الصلاحيات', group: 'users', groupAr: 'المستخدمين' },
      
      // الأدوار
      { module: 'roles', action: 'view', name: 'View Roles', nameAr: 'عرض الأدوار', group: 'users', groupAr: 'المستخدمين' },
      { module: 'roles', action: 'manage', name: 'Manage Roles', nameAr: 'إدارة الأدوار', group: 'users', groupAr: 'المستخدمين' },
      
      // الإعدادات
      { module: 'settings', action: 'view', name: 'View Settings', nameAr: 'عرض الإعدادات', group: 'settings', groupAr: 'الإعدادات' },
      { module: 'settings', action: 'edit', name: 'Edit Settings', nameAr: 'تعديل الإعدادات', group: 'settings', groupAr: 'الإعدادات' },
      { module: 'settings', action: 'branches', name: 'Manage Branches', nameAr: 'إدارة الفروع', group: 'settings', groupAr: 'الإعدادات' },
      { module: 'settings', action: 'payment_methods', name: 'Manage Payment Methods', nameAr: 'إدارة طرق الدفع', group: 'settings', groupAr: 'الإعدادات' },
      { module: 'settings', action: 'currencies', name: 'Manage Currencies', nameAr: 'إدارة العملات', group: 'settings', groupAr: 'الإعدادات' },
      { module: 'settings', action: 'print', name: 'Manage Print Settings', nameAr: 'إعدادات الطباعة', group: 'settings', groupAr: 'الإعدادات' },
      
      // الحسابات
      { module: 'accounts', action: 'view', name: 'View Accounts', nameAr: 'عرض الحسابات', group: 'accounts', groupAr: 'الحسابات' },
      { module: 'accounts', action: 'manage', name: 'Manage Accounts', nameAr: 'إدارة الحسابات', group: 'accounts', groupAr: 'الحسابات' },
      
      // سجل التدقيق
      { module: 'audit', action: 'view', name: 'View Audit Logs', nameAr: 'عرض سجل التدقيق', group: 'settings', groupAr: 'الإعدادات' },
    ];

    let created = 0;
    let skipped = 0;

    for (const perm of defaultPermissions) {
      const existing = await db.systemPermission.findUnique({
        where: { module_action: { module: perm.module, action: perm.action } }
      });

      if (!existing) {
        await db.systemPermission.create({ data: perm });
        created++;
      } else {
        skipped++;
      }
    }

    return NextResponse.json({ 
      message: 'تم تهيئة الصلاحيات بنجاح',
      created,
      skipped,
      total: defaultPermissions.length 
    });
  } catch (error) {
    console.error('Error initializing permissions:', error);
    return NextResponse.json(
      { error: 'فشل في تهيئة الصلاحيات' },
      { status: 500 }
    );
  }
}
