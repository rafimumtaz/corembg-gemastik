import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_KITCHENS = [
  {
    name: 'Dapur MBG Sidoarjo',
    address: 'Jl. Pahlawan No. 1, Sidoarjo',
    latitude: -7.45,
    longitude: 112.71,
  },
  {
    name: 'Dapur MBG Surabaya',
    address: 'Jl. Basuki Rahmat No. 2, Surabaya',
    latitude: -7.25,
    longitude: 112.75,
  },
];

export async function GET() {
  try {
    let kitchens = await prisma.kitchen.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (kitchens.length === 0) {
      // Auto-seed default kitchens if database table is empty
      await prisma.kitchen.createMany({ data: DEFAULT_KITCHENS });
      kitchens = await prisma.kitchen.findMany({ orderBy: { createdAt: 'desc' } });
    }

    return NextResponse.json({ success: true, data: kitchens });
  } catch (error: any) {
    console.error('Error fetching kitchens:', error);
    return NextResponse.json({ success: true, data: DEFAULT_KITCHENS.map((k, i) => ({ ...k, id: `kitchen-${i + 1}` })) });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const kitchen = await prisma.kitchen.create({
      data: {
        name: body.name,
        address: body.address,
        latitude: parseFloat(body.latitude),
        longitude: parseFloat(body.longitude),
      },
    });
    return NextResponse.json({ success: true, data: kitchen }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating kitchen:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Failed to create kitchen' } },
      { status: 500 }
    );
  }
}
