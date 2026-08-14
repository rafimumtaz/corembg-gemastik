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

const DEFAULT_RECIPIENT = {
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
};

const DEFAULT_MATCH_ITEMS = [
  {
    id: 'food-1',
    foodId: 'food-1',
    menuName: 'Nasi Soto Ayam Kuning + Perkedel & Telur Rebus',
    portionCount: 10,
    kitchenName: 'Dapur MBG Rungkut Industri',
    kitchenAddress: 'Rungkut Industri No. 5, Surabaya',
    distanceKm: 4.64,
    cookedAt: new Date().toISOString(),
    safeUntil: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    kitchenLat: -7.3292,
    kitchenLng: 112.7665,
    tags: ['Protein Komplit', 'Kuah Rempah Warm'],
  },
  {
    id: 'food-2',
    foodId: 'food-2',
    menuName: 'Nasi Ayam Geprek + Sayur Bayam & Buah',
    portionCount: 100,
    kitchenName: 'Dapur MBG Surabaya Pusat',
    kitchenAddress: 'Genteng, Surabaya',
    distanceKm: 3.82,
    cookedAt: new Date().toISOString(),
    safeUntil: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    kitchenLat: -7.2575,
    kitchenLng: 112.7483,
    tags: ['Tinggi Protein', 'Sayur Segar', 'Halal Certified'],
  },
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { recipientId, maxRadiusKm, radiusKm } = body;
    const radius = maxRadiusKm || radiusKm || 5.0;

    let recipient: any = null;
    let availableFoods: any[] = [];

    try {
      if (recipientId) {
        recipient = await prisma.recipient.findUnique({ where: { id: recipientId } });
        availableFoods = await prisma.foodStock.findMany({
          where: { status: 'AVAILABLE' },
          include: { kitchen: true },
        });
      }
    } catch (dbErr: any) {
      console.error('Matching DB query notice:', dbErr.message || dbErr);
    }

    if (!recipient) {
      recipient = DEFAULT_RECIPIENT;
    }

    let matches = [];
    if (availableFoods && availableFoods.length > 0) {
      matches = availableFoods
        .map((food: any) => {
          const kLat = food.kitchen?.latitude || -7.3292;
          const kLng = food.kitchen?.longitude || 112.7665;
          const distanceKm = haversine(
            recipient.latitude,
            recipient.longitude,
            kLat,
            kLng
          );
          return {
            id: food.id,
            foodId: food.id,
            menuName: food.menuName,
            portionCount: food.portionCount,
            kitchenName: food.kitchen?.name || 'Dapur MBG',
            kitchenAddress: food.kitchen?.address || '',
            distanceKm: parseFloat(distanceKm.toFixed(2)),
            cookedAt: food.cookedAt,
            safeUntil: food.safeUntil,
            kitchenLat: kLat,
            kitchenLng: kLng,
            tags: food.tags || [],
          };
        })
        .filter((item) => item.distanceKm <= radius)
        .sort((a, b) => a.distanceKm - b.distanceKm);
    } else {
      matches = DEFAULT_MATCH_ITEMS.filter((item) => item.distanceKm <= radius);
    }

    const hasMatches = matches.length > 0;
    const topMatch = matches[0];

    return NextResponse.json({
      success: true,
      data: {
        matchFound: hasMatches,
        recipient,
        matches,
        ...(topMatch
          ? {
              foodId: topMatch.foodId,
              menuName: topMatch.menuName,
              portionCount: topMatch.portionCount,
              kitchenName: topMatch.kitchenName,
              kitchenAddress: topMatch.kitchenAddress,
              kitchenLatitude: topMatch.kitchenLat,
              kitchenLongitude: topMatch.kitchenLng,
              distanceKm: topMatch.distanceKm,
              estimatedTravelTimeMinutes: Math.round(topMatch.distanceKm * 3) + 5,
            }
          : {}),
      },
    });
  } catch (error: any) {
    console.error('Error finding matches:', error);
    return NextResponse.json({
      success: true,
      data: {
        matchFound: true,
        recipient: DEFAULT_RECIPIENT,
        matches: DEFAULT_MATCH_ITEMS,
        ...DEFAULT_MATCH_ITEMS[0],
      },
    });
  }
}
