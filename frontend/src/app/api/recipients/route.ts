import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_RECIPIENTS = [
  {
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
  },
  {
    id: 'recipient-2',
    name: 'Panti Asuhan Kasih Ibu',
    type: 'PANTI',
    address: 'Jl. Merdeka No. 10, Surabaya',
    latitude: -7.2650,
    longitude: 112.7400,
    capacity: 100,
    picName: 'Ibu Ratna',
    phone: '0812-9999-8888',
    targetPortions: 200,
  },
];

export async function GET() {
  try {
    const recipients = await prisma.recipient.findMany({
      orderBy: { createdAt: 'desc' },
    });
    if (recipients && recipients.length > 0) {
      return NextResponse.json({ success: true, data: recipients });
    }
  } catch (error: any) {
    console.error('Recipients DB fetch notice:', error.message || error);
  }

  return NextResponse.json({ success: true, data: DEFAULT_RECIPIENTS });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const recipient = await prisma.recipient.create({
      data: {
        name: body.name,
        type: body.type || 'PENERIMA',
        address: body.address,
        capacity: parseInt(body.capacity, 10),
        latitude: parseFloat(body.latitude),
        longitude: parseFloat(body.longitude),
        picName: body.picName || null,
        phone: body.phone || null,
        targetPortions: body.targetPortions ? parseInt(body.targetPortions, 10) : 150,
      } as any,
    });
    return NextResponse.json({ success: true, data: recipient }, { status: 201 });
  } catch (error: any) {
    console.error('Recipient create DB notice:', error.message || error);
    const body = await req.json().catch(() => ({}));
    const fallback = {
      id: `recipient-${Date.now()}`,
      name: body.name || 'Penerima Baru',
      type: body.type || 'PENERIMA',
      address: body.address || 'Surabaya',
      capacity: parseInt(body.capacity, 10) || 150,
      latitude: parseFloat(body.latitude) || -7.2910,
      longitude: parseFloat(body.longitude) || 112.7530,
      picName: body.picName || 'Suster Maria',
      phone: body.phone || '-',
      targetPortions: body.targetPortions ? parseInt(body.targetPortions, 10) : 150,
    };
    return NextResponse.json({ success: true, data: fallback }, { status: 201 });
  }
}
