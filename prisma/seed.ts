import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create Kitchens
  const kitchen1 = await prisma.kitchen.create({
    data: {
      name: 'Dapur MBG Sidoarjo',
      address: 'Jl. Pahlawan No. 1, Sidoarjo',
      latitude: -7.45,
      longitude: 112.71,
    },
  });

  const kitchen2 = await prisma.kitchen.create({
    data: {
      name: 'Dapur MBG Surabaya',
      address: 'Jl. Basuki Rahmat No. 2, Surabaya',
      latitude: -7.25,
      longitude: 112.75,
    },
  });

  // Create Recipients
  const pantiA = await prisma.recipient.create({
    data: {
      name: 'Panti Asuhan A',
      type: 'PANTI',
      address: 'Jl. Merdeka No. 10',
      latitude: -7.44,
      longitude: 112.72,
      capacity: 100,
    },
  });

  const pantiB = await prisma.recipient.create({
    data: {
      name: 'Panti Asuhan B',
      type: 'PANTI',
      address: 'Jl. Kemerdekaan No. 5',
      latitude: -7.46,
      longitude: 112.70,
      capacity: 50,
    },
  });

  const pantiC = await prisma.recipient.create({
    data: {
      name: 'Penerima C',
      type: 'PENERIMA',
      address: 'Jl. C No. 5',
      latitude: -7.26,
      longitude: 112.76,
      capacity: 20,
    },
  });

  const pantiD = await prisma.recipient.create({
    data: {
      name: 'Penerima D',
      type: 'PENERIMA',
      address: 'Jl. D No. 5',
      latitude: -7.24,
      longitude: 112.74,
      capacity: 30,
    },
  });

  const pantiE = await prisma.recipient.create({
    data: {
      name: 'Penerima E',
      type: 'PENERIMA',
      address: 'Jl. E No. 5',
      latitude: -7.27,
      longitude: 112.73,
      capacity: 10,
    },
  });

  // Create Food Stocks
  const now = new Date();
  const safeUntil = new Date(now.getTime() + 3 * 60 * 60 * 1000); // +3 hours
  const expiredSafeUntil = new Date(now.getTime() - 1 * 60 * 60 * 1000); // -1 hour (expired)

  await prisma.foodStock.createMany({
    data: [
      {
        kitchenId: kitchen1.id,
        menuName: 'Nasi Ayam Geprek',
        portionCount: 150,
        cookedAt: now,
        safeUntil: safeUntil,
        status: 'AVAILABLE',
      },
      {
        kitchenId: kitchen1.id,
        menuName: 'Nasi Pecel',
        portionCount: 100,
        cookedAt: now,
        safeUntil: safeUntil,
        status: 'AVAILABLE',
      },
      {
        kitchenId: kitchen2.id,
        menuName: 'Nasi Rawon',
        portionCount: 200,
        cookedAt: now,
        safeUntil: safeUntil,
        status: 'AVAILABLE',
      },
      {
        kitchenId: kitchen2.id,
        menuName: 'Nasi Goreng',
        portionCount: 50,
        cookedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // Cooked 4 hrs ago
        safeUntil: expiredSafeUntil, // Expired
        status: 'AVAILABLE', // Should be considered EXPIRED dynamically
      },
      {
        kitchenId: kitchen1.id,
        menuName: 'Nasi Campur',
        portionCount: 80,
        cookedAt: now,
        safeUntil: safeUntil,
        status: 'MATCHED',
      },
    ],
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
