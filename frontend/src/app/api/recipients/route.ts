import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const recipients = await prisma.recipient.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: recipients });
  } catch (error: any) {
    console.error('Error fetching recipients:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Failed to fetch recipients' } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const recipient = await prisma.recipient.create({
      data: {
        name: body.name,
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
