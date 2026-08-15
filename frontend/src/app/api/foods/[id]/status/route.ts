import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existingFood = await prisma.foodStock.findUnique({ where: { id } });
    if (!existingFood) {
      return NextResponse.json({ success: false, error: { message: 'Food not found' } }, { status: 404 });
    }

    if (body.status === 'MATCHED' || body.recipientId) {
      if (existingFood.safeUntil && new Date(existingFood.safeUntil).getTime() <= Date.now()) {
        return NextResponse.json(
          { success: false, message: 'Gagal mengklaim makanan: Makanan sudah kedaluwarsa' },
          { status: 400 }
        );
      }
    }

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
