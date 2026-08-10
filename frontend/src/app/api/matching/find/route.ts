import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const { recipientId, maxRadiusKm, foodStockId, radiusKm } = body;

    const radius = maxRadiusKm || radiusKm || 5.0;

    // Case 1: Search by recipientId (Penerima searching for available food stock)
    if (recipientId) {
      const recipient = await prisma.recipient.findUnique({
        where: { id: recipientId },
      });

      if (!recipient) {
        return NextResponse.json(
          { success: false, error: { message: 'Recipient not found' } },
          { status: 404 }
        );
      }

      const availableFoods = await prisma.foodStock.findMany({
        where: {
          status: 'AVAILABLE',
          safeUntil: { gt: new Date() },
        },
        include: { kitchen: true },
      });

      const matches = availableFoods
        .map((food) => {
          const distanceKm = haversine(
            recipient.latitude,
            recipient.longitude,
            food.kitchen.latitude,
            food.kitchen.longitude
          );
          return {
            id: food.id,
            foodId: food.id,
            menuName: food.menuName,
            portionCount: food.portionCount,
            kitchenName: food.kitchen.name,
            kitchenAddress: food.kitchen.address,
            distanceKm: parseFloat(distanceKm.toFixed(2)),
            cookedAt: food.cookedAt,
            safeUntil: food.safeUntil,
            kitchenLat: food.kitchen.latitude,
            kitchenLng: food.kitchen.longitude,
          };
        })
        .filter((item) => item.distanceKm <= radius)
        .sort((a, b) => a.distanceKm - b.distanceKm);

      return NextResponse.json({
        success: true,
        data: {
          recipient,
          matches,
        },
      });
    }

    // Case 2: Search by foodStockId (Dapur searching for nearby recipients)
    if (foodStockId) {
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
            address: recipient.address,
            capacity: recipient.capacity,
            distanceKm: parseFloat(distanceKm.toFixed(2)),
            lat: recipient.latitude,
            lng: recipient.longitude,
          };
        })
        .filter((match) => match.distanceKm <= radius)
        .sort((a, b) => a.distanceKm - b.distanceKm);

      return NextResponse.json({
        success: true,
        data: {
          food,
          matches,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: { message: 'recipientId or foodStockId is required' } },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error finding matches:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Failed to find matches' } },
      { status: 500 }
    );
  }
}
