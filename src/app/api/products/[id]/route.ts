import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true, brand: true, supplier: true,
        variants: { where: { isActive: true } },
        variations: { 
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        },
        inventory: true,
      },
    });
    if (!product) return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { variations, ...productData } = body;
    
    // حذف المتغيرات القديمة وإنشاء الجديدة
    if (variations !== undefined) {
      await db.productVariation.deleteMany({
        where: { productId: id }
      });
    }
    
    const product = await db.product.update({
      where: { id },
      data: {
        barcode: productData.barcode, 
        sku: productData.sku, 
        name: productData.name, 
        nameAr: productData.nameAr,
        description: productData.description, 
        categoryId: productData.categoryId, 
        brandId: productData.brandId,
        supplierId: productData.supplierId, 
        costPrice: productData.costPrice, 
        sellingPrice: productData.sellingPrice,
        wholesalePrice: productData.wholesalePrice, 
        minStock: productData.minStock, 
        maxStock: productData.maxStock,
        unit: productData.unit, 
        image: productData.image, 
        hasVariants: productData.hasVariants, 
        isStockTracked: productData.isStockTracked ?? true,
        isActive: productData.isActive,
        // تحديث المتغيرات
        variations: variations ? {
          create: variations.map((v: any, index: number) => ({
            price: v.price,
            name: v.name,
            barcode: v.barcode,
            stock: v.stock || 0,
            isStockTracked: v.isStockTracked ?? true,
            sortOrder: index,
          }))
        } : undefined,
      },
      include: { 
        category: true, 
        brand: true, 
        variants: true,
        variations: true 
      },
    });
    return NextResponse.json({ product });
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'الباركود مستخدم بالفعل' }, { status: 400 });
    return NextResponse.json({ error: 'حدث خطأ أثناء التحديث' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.product.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
