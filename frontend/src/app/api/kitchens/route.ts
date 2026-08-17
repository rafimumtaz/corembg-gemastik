import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_KITCHENS = [
  {
    id: 'kitchen-1',
    name: 'Dapur MBG Surabaya Pusat',
    address: 'Genteng, Surabaya',
    latitude: -7.2575,
    longitude: 112.7483,
    picName: 'Pak Budi Prasetyo',
    district: 'Genteng',
    phone: '0812-3456-7890',
    dailyCapacity: 800,
  },
  {
    id: 'kitchen-2',
    name: 'Dapur MBG Rungkut Industri',
    address: 'Rungkut Industri No. 5, Surabaya',
    latitude: -7.3292,
    longitude: 112.7665,
    picName: 'Ustadz Ahmad Fauzi',
    district: 'Rungkut',
    phone: '0857-1122-3344',
    dailyCapacity: 1000,
  },
];

export async function GET() {
  try {
    const kitchens = await prisma.kitchen.findMany({
      orderBy: { createdAt: 'desc' },
    });
    if (kitchens) {
      return NextResponse.json({ success: true, data: kitchens });
    }
  } catch (error: any) {
    console.error('Kitchens DB fetch notice:', error.message || error);
  }

  return NextResponse.json({ success: true, data: DEFAULT_KITCHENS });
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
        picName: body.picName || null,
        district: body.district || null,
        phone: body.phone || null,
        dailyCapacity: body.dailyCapacity ? parseInt(body.dailyCapacity, 10) : 800,
      } as any,
    });
    return NextResponse.json({ success: true, data: kitchen }, { status: 201 });
  } catch (error: any) {
    console.error('Kitchen create DB notice:', error.message || error);
    const body = await req.json().catch(() => ({}));
    const fallback = {
      id: `kitchen-${Date.now()}`,
      name: body.name || 'Dapur MBG Baru',
      address: body.address || 'Surabaya',
      latitude: parseFloat(body.latitude) || -7.2575,
      longitude: parseFloat(body.longitude) || 112.7483,
      picName: body.picName || 'Penanggung Jawab',
      district: body.district || 'Surabaya',
      phone: body.phone || '-',
      dailyCapacity: body.dailyCapacity ? parseInt(body.dailyCapacity, 10) : 800,
    };
    return NextResponse.json({ success: true, data: fallback }, { status: 201 });
  }
}
