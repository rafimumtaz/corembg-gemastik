import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const food = await prisma.foodStock.update({
      where: { id },
      data: { status: body.status },
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
