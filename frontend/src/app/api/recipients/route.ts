import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_RECIPIENTS = [
  {
    name: 'Panti Asuhan A',
    type: 'PANTI' as const,
    address: 'Jl. Merdeka No. 10',
    latitude: -7.44,
    longitude: 112.72,
    capacity: 100,
  },
  {
    name: 'Panti Asuhan B',
    type: 'PANTI' as const,
    address: 'Jl. Kemerdekaan No. 5',
    latitude: -7.46,
    longitude: 112.70,
    capacity: 50,
  },
  {
    name: 'Penerima C',
    type: 'PENERIMA' as const,
    address: 'Jl. C No. 5',
    latitude: -7.26,
    longitude: 112.76,
    capacity: 20,
  },
];

export async function GET() {
  try {
    let recipients = await prisma.recipient.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (recipients.length === 0) {
      // Auto-seed default recipients if database table is empty
      await prisma.recipient.createMany({ data: DEFAULT_RECIPIENTS });
      recipients = await prisma.recipient.findMany({ orderBy: { createdAt: 'desc' } });
    }

    return NextResponse.json({ success: true, data: recipients });
  } catch (error: any) {
    console.error('Error fetching recipients:', error);
    return NextResponse.json({ success: true, data: DEFAULT_RECIPIENTS.map((r, i) => ({ ...r, id: `recipient-${i + 1}` })) });
  }
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
      },
    });
    return NextResponse.json({ success: true, data: recipient }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating recipient:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Failed to create recipient' } },
      { status: 500 }
    );
  }
}
