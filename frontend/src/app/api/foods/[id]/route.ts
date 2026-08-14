import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.foodStock.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting food:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Failed to delete food' } },
      { status: 500 }
    );
  }
}
