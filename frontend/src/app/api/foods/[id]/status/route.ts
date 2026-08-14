import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: any = { status: body.status };
    if (body.recipientId) {
      updateData.recipientId = body.recipientId;
      updateData.claimedAt = new Date();
    }

    const food = await prisma.foodStock.update({
      where: { id },
      data: updateData,
      include: { kitchen: true, recipient: true } as any,
    });

    return NextResponse.json({ success: true, data: food });
  } catch (error: any) {
    console.error('Error updating food status:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Failed to update food status' } },
      { status: 500 }
    );
  }
}
