import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all variant types with options and prices
export async function GET() {
  try {
    const variantTypes = await db.variantType.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
          include: {
            prices: true,
          },
        },
      },
    });
    return NextResponse.json(variantTypes);
  } catch (error) {
    console.error('Error fetching variants:', error);
    return NextResponse.json({ error: 'Failed to fetch variants' }, { status: 500 });
  }
}

// POST - Create a new variant type
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, nameAr, isActive, options } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const variantType = await db.variantType.create({
      data: {
        name,
        nameAr: nameAr || name,
        isActive: isActive ?? true,
        options: options
          ? {
              create: options.map((opt: { name: string; nameAr?: string }, index: number) => ({
                name: opt.name,
                nameAr: opt.nameAr || opt.name,
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: {
        options: true,
      },
    });

    return NextResponse.json(variantType, { status: 201 });
  } catch (error) {
    console.error('Error creating variant type:', error);
    return NextResponse.json({ error: 'Failed to create variant type' }, { status: 500 });
  }
}
