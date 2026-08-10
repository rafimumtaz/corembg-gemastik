import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { foodStockId, radiusKm } = body;

    const food = await prisma.foodStock.findUnique({
      where: { id: foodStockId },
      include: { kitchen: true },
    });

    if (!food) {
      return NextResponse.json(
        { success: false, error: { message: 'Food stock not found' } },
        { status: 404 }
      );
    }

    const recipients = await prisma.recipient.findMany();

    const matches = recipients
      .map((recipient) => {
        const distanceKm = haversine(
          food.kitchen.latitude,
          food.kitchen.longitude,
          recipient.latitude,
          recipient.longitude
        );
        return {
          recipientId: recipient.id,
          name: recipient.name,
          distanceKm: parseFloat(distanceKm.toFixed(2)),
          capacity: recipient.capacity,
        };
      })
      .filter((match) => match.distanceKm <= (radiusKm || 5.0))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return NextResponse.json({
      success: true,
      data: {
        food: {
          id: food.id,
          menuName: food.menuName,
          portionCount: food.portionCount,
          cookedAt: food.cookedAt,
          safeUntil: food.safeUntil,
        },
        matches,
      },
    });
  } catch (error: any) {
    console.error('Error finding matches:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Failed to find matches' } },
      { status: 500 }
    );
  }
}
