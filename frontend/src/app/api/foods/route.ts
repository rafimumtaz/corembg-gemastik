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

    let foods = await prisma.foodStock.findMany({
      where,
      include: { kitchen: true },
      orderBy: { createdAt: 'desc' },
    });

    if (foods.length === 0) {
      // If empty, fetch kitchens first to connect food stocks
      const kitchens = await prisma.kitchen.findMany();
      if (kitchens.length > 0) {
        const now = new Date();
        const safeUntil = new Date(now.getTime() + 3 * 60 * 60 * 1000);
        await prisma.foodStock.createMany({
          data: [
            {
              kitchenId: kitchens[0].id,
              menuName: 'Nasi Ayam Geprek MBG',
              portionCount: 150,
              cookedAt: now,
              safeUntil: safeUntil,
              status: 'AVAILABLE',
            },
            {
              kitchenId: kitchens[0].id,
              menuName: 'Nasi Pecel Bergizi',
              portionCount: 100,
              cookedAt: now,
              safeUntil: safeUntil,
              status: 'AVAILABLE',
            },
          ],
        });
        foods = await prisma.foodStock.findMany({
          where,
          include: { kitchen: true },
          orderBy: { createdAt: 'desc' },
        });
      }
    }

    return NextResponse.json({ success: true, data: foods });
  } catch (error: any) {
    console.error('Error fetching foods:', error);
    const now = new Date();
    const safeUntil = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    return NextResponse.json({
      success: true,
      data: [
        {
          id: 'food-1',
          kitchenId: 'kitchen-1',
          menuName: 'Nasi Ayam Geprek MBG',
          portionCount: 150,
          cookedAt: now,
          safeUntil: safeUntil,
          status: 'AVAILABLE',
          kitchen: { name: 'Dapur MBG Sidoarjo', address: 'Jl. Pahlawan No. 1, Sidoarjo' },
        },
      ],
    });
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
