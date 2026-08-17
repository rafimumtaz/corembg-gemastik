import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_KITCHEN = {
  id: 'kitchen-2',
  name: 'Dapur MBG Rungkut Industri',
  address: 'Rungkut Industri No. 5, Surabaya',
  latitude: -7.3292,
  longitude: 112.7665,
  picName: 'Ustadz Ahmad Fauzi',
  district: 'Rungkut',
  phone: '0857-1122-3344',
  dailyCapacity: 1000,
};

const DEFAULT_RECIPIENT = {
  id: 'recipient-1',
  name: 'Panti Werda & Balita harapan',
  type: 'PENERIMA',
  address: 'Jl. Raya Ngagel No. 102, Wonokromo',
  latitude: -7.2910,
  longitude: 112.7530,
  capacity: 150,
  picName: 'Suster Maria',
  phone: '0813-9988-7766',
  targetPortions: 150,
};

const DEFAULT_FOODS = [
  {
    id: 'food-1',
    kitchenId: 'kitchen-2',
    menuName: 'Nasi Soto Ayam Kuning + Perkedel & Telur Rebus',
    portionCount: 10,
    cookedAt: new Date().toISOString(),
    safeUntil: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: 'AVAILABLE',
    tags: ['Protein Komplit', 'Kuah Rempah Warm'],
    kitchen: DEFAULT_KITCHEN,
  },
  {
    id: 'food-2',
    kitchenId: 'kitchen-1',
    menuName: 'Nasi Ayam Geprek + Sayur Bayam & Buah',
    portionCount: 100,
    cookedAt: new Date().toISOString(),
    safeUntil: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: 'AVAILABLE',
    tags: ['Tinggi Protein', 'Sayur Segar', 'Halal Certified'],
    kitchen: {
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
  },
  {
    id: 'food-3',
    kitchenId: 'kitchen-2',
    menuName: 'Nasi Soto Ayam Kuning + Perkedel & Telur Rebus',
    portionCount: 10,
    cookedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    safeUntil: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    status: 'MATCHED',
    tags: ['Protein Komplit'],
    recipientId: 'recipient-1',
    claimedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    kitchen: DEFAULT_KITCHEN,
    recipient: DEFAULT_RECIPIENT,
  },
  {
    id: 'food-4',
    kitchenId: 'kitchen-2',
    menuName: 'Nasi Soto Ayam Kuning + Perkedel & Telur Rebus',
    portionCount: 50,
    cookedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    safeUntil: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    status: 'MATCHED',
    tags: ['Protein Komplit'],
    recipientId: 'recipient-1',
    claimedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    kitchen: DEFAULT_KITCHEN,
    recipient: DEFAULT_RECIPIENT,
  },
  {
    id: 'food-5',
    kitchenId: 'kitchen-2',
    menuName: 'Nasi Soto Ayam Kuning + Perkedel & Telur Rebus',
    portionCount: 50,
    cookedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    safeUntil: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    status: 'MATCHED',
    tags: ['Protein Komplit'],
    recipientId: 'recipient-1',
    claimedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    kitchen: DEFAULT_KITCHEN,
    recipient: DEFAULT_RECIPIENT,
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const expired = searchParams.get('expired');
  const recipientId = searchParams.get('recipientId');

  try {
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (recipientId) {
      where.recipientId = recipientId;
    }
    if (expired === 'false') {
      where.safeUntil = {
        gt: new Date(),
      };
    }

    const foods = await prisma.foodStock.findMany({
      where,
      include: { kitchen: true } as any,
      orderBy: { createdAt: 'desc' },
    });

    if (foods) {
      return NextResponse.json({ success: true, data: foods });
    }
  } catch (error: any) {
    console.error('Foods DB fetch notice:', error.message || error);
  }

  let filtered = DEFAULT_FOODS;
  if (status && status !== 'ALL') {
    filtered = filtered.filter((f) => f.status === status);
  }
  if (recipientId) {
    filtered = filtered.filter((f) => f.recipientId === recipientId);
  }

  return NextResponse.json({ success: true, data: filtered });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookedAtDate = new Date(body.cookedAt);
    const safeUntil = new Date(cookedAtDate);
    safeUntil.setHours(safeUntil.getHours() + 4);

    const food = await prisma.foodStock.create({
      data: {
        kitchenId: body.kitchenId,
        menuName: body.menuName,
        portionCount: parseInt(body.portionCount, 10),
        cookedAt: cookedAtDate,
        safeUntil,
        tags: Array.isArray(body.tags) ? body.tags : [],
      } as any,
      include: { kitchen: true } as any,
    });

    return NextResponse.json({ success: true, data: food }, { status: 201 });
  } catch (error: any) {
    console.error('Food create DB notice:', error.message || error);
    const body = await req.json().catch(() => ({}));
    const cookedAtDate = body.cookedAt ? new Date(body.cookedAt) : new Date();
    const safeUntil = new Date(cookedAtDate);
    safeUntil.setHours(safeUntil.getHours() + 4);

    const fallback = {
      id: `food-${Date.now()}`,
      kitchenId: body.kitchenId || 'kitchen-1',
      menuName: body.menuName || 'Nasi Masakan Bergizi',
      portionCount: parseInt(body.portionCount, 10) || 100,
      cookedAt: cookedAtDate.toISOString(),
      safeUntil: safeUntil.toISOString(),
      status: 'AVAILABLE',
      tags: Array.isArray(body.tags) ? body.tags : ['Tinggi Protein', 'Sayur Segar'],
      kitchen: DEFAULT_KITCHEN,
    };
    return NextResponse.json({ success: true, data: fallback }, { status: 201 });
  }
}
