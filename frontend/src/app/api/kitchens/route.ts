import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const kitchens = await prisma.kitchen.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: kitchens });
  } catch (error: any) {
    console.error('Error fetching kitchens:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Failed to fetch kitchens' } },
      { status: 500 }
    );
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
