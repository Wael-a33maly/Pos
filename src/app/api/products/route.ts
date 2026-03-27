import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Force rebuild v3

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');
    const branchId = searchParams.get('branchId');
    const barcode = searchParams.get('barcode');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { barcode: { contains: search } },
        { sku: { contains: search } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (branchId) where.branchId = branchId;
    if (barcode) where.barcode = barcode;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
          supplier: true,
          variants: { where: { isActive: true } },
          variations: { 
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
          },
          inventory: branchId ? { where: { branchId } } : true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({ products, total, page, limit });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب المنتجات' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { variations, ...productData } = body;
    
    const product = await db.product.create({
      data: {
        barcode: productData.barcode,
        sku: productData.sku,
        name: productData.name,
        nameAr: productData.nameAr,
        description: productData.description,
        categoryId: productData.categoryId,
        brandId: productData.brandId,
        supplierId: productData.supplierId,
        branchId: productData.branchId,
        costPrice: productData.costPrice || 0,
        sellingPrice: productData.sellingPrice || 0,
        wholesalePrice: productData.wholesalePrice,
        minStock: productData.minStock || 0,
        maxStock: productData.maxStock,
        unit: productData.unit || 'piece',
        image: productData.image,
        hasVariants: productData.hasVariants || false,
        isStockTracked: productData.isStockTracked ?? true,
        isActive: productData.isActive ?? true,
      },
      include: { 
        category: true, 
        brand: true, 
        variants: true,
      },
    });
    
    // Create variations separately if provided
    if (variations && variations.length > 0) {
      try {
        for (let i = 0; i < variations.length; i++) {
          const v = variations[i];
          await db.productVariation.create({
            data: {
              productId: product.id,
              price: v.price,
              name: v.name,
              barcode: v.barcode,
              stock: v.stock || 0,
              isStockTracked: v.isStockTracked ?? true,
              sortOrder: i,
            },
          });
        }
      } catch (varError) {
        console.error('Error creating variations:', varError);
        // Continue even if variations fail
      }
    }
    
    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error('Create product error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'الباركود مستخدم بالفعل' }, { status: 400 });
    }
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء المنتج' }, { status: 500 });
  }
}
