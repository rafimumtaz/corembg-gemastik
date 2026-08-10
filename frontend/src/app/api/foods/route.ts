import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const expired = searchParams.get('expired');

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (expired === 'false') {
      where.safeUntil = {
        gt: new Date(),
      };
    }

    const foods = await prisma.foodStock.findMany({
      where,
      include: { kitchen: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: foods });
  } catch (error: any) {
    console.error('Error fetching foods:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Failed to fetch foods' } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookedAtDate = new Date(body.cookedAt);
    
    // Default safe duration is 3 hours
    const safeUntil = new Date(cookedAtDate);
    safeUntil.setHours(safeUntil.getHours() + 3);

    const food = await prisma.foodStock.create({
      data: {
        kitchenId: body.kitchenId,
        menuName: body.menuName,
        portionCount: parseInt(body.portionCount, 10),
        cookedAt: cookedAtDate,
        safeUntil,
      },
    });

    return NextResponse.json({ success: true, data: food }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating food:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Failed to create food' } },
      { status: 500 }
    );
  }
}
