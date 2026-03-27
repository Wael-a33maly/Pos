// ============================================
// Printing API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/printing - List templates
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const branchId = searchParams.get('branchId');
    
    const where: any = { isActive: true };
    if (type) where.type = type;
    if (branchId) where.OR = [{ branchId }, { branchId: null }];
    
    const templates = await db.receiptTemplate.findMany({
      where,
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
    
    // Get default template for each type
    const defaults = await db.receiptTemplate.findMany({
      where: { isDefault: true, isActive: true },
    });
    
    return NextResponse.json({
      templates,
      defaults,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'خطأ في جلب القوالب' }, { status: 500 });
  }
}

// POST /api/printing - Create template
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // If setting as default, unset other defaults of same type
    if (data.isDefault) {
      await db.receiptTemplate.updateMany({
        where: { 
          type: data.type,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }
    
    const template = await db.receiptTemplate.create({
      data: {
        name: data.name,
        nameAr: data.nameAr,
        type: data.type,
        branchId: data.branchId,
        paperWidth: data.paperWidth ?? 80,
        paperType: data.paperType ?? 'thermal',
        fontFamily: data.fontFamily ?? 'monospace',
        fontSizeSmall: data.fontSizeSmall ?? 10,
        fontSizeNormal: data.fontSizeNormal ?? 12,
        fontSizeLarge: data.fontSizeLarge ?? 14,
        fontSizeTitle: data.fontSizeTitle ?? 18,
        fontSizeTotal: data.fontSizeTotal ?? 16,
        fontBold: data.fontBold ?? true,
        showLogo: data.showLogo ?? true,
        logoAlignment: data.logoAlignment ?? 'center',
        showCompanyName: data.showCompanyName ?? true,
        companyNameStyle: data.companyNameStyle ?? 'bold_large',
        showBranchName: data.showBranchName ?? true,
        showBranchAddress: data.showBranchAddress ?? true,
        showBranchPhone: data.showBranchPhone ?? true,
        showTaxNumber: data.showTaxNumber ?? true,
        headerAlignment: data.headerAlignment ?? 'center',
        showSku: data.showSku ?? false,
        showProductName: data.showProductName ?? true,
        showVariant: data.showVariant ?? true,
        showQuantity: data.showQuantity ?? true,
        showUnitPrice: data.showUnitPrice ?? true,
        showDiscount: data.showDiscount ?? true,
        showTax: data.showTax ?? true,
        showLineTotal: data.showLineTotal ?? true,
        showBarcode: data.showBarcode ?? false,
        showSubtotal: data.showSubtotal ?? true,
        showDiscountTotal: data.showDiscountTotal ?? true,
        showTaxTotal: data.showTaxTotal ?? true,
        showTotal: data.showTotal ?? true,
        showPaid: data.showPaid ?? true,
        showChange: data.showChange ?? true,
        totalsAlignment: data.totalsAlignment ?? 'right',
        showThankYou: data.showThankYou ?? true,
        thankYouMessage: data.thankYouMessage ?? 'شكراً لزيارتكم',
        showReturnPolicy: data.showReturnPolicy ?? false,
        returnPolicyText: data.returnPolicyText,
        showQRCode: data.showQRCode ?? false,
        showInvoiceBarcode: data.showInvoiceBarcode ?? true,
        showDateTime: data.showDateTime ?? true,
        showCashier: data.showCashier ?? true,
        showInvoiceNumber: data.showInvoiceNumber ?? true,
        showSeparator: data.showSeparator ?? true,
        separatorChar: data.separatorChar ?? '-',
        marginTop: data.marginTop ?? 0,
        marginBottom: data.marginBottom ?? 0,
        lineSpacing: data.lineSpacing ?? 1,
        isDefault: data.isDefault ?? false,
        isActive: data.isActive ?? true,
      },
    });
    
    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'خطأ في إنشاء القالب' }, { status: 500 });
  }
}
