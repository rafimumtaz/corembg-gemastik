import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database with updated schema...');

  // Clean existing data
  await prisma.foodStock.deleteMany({});
  await prisma.kitchen.deleteMany({});
  await prisma.recipient.deleteMany({});

  // Create Kitchens
  const kitchen1 = await prisma.kitchen.create({
    data: {
      name: 'Dapur MBG Surabaya Pusat',
      address: 'Genteng, Surabaya',
      latitude: -7.2575,
      longitude: 112.7483,
      picName: 'Pak Budi Prasetyo',
      district: 'Genteng',
      phone: '0812-3456-7890',
      dailyCapacity: 800,
    },
  });

  const kitchen2 = await prisma.kitchen.create({
    data: {
      name: 'Dapur MBG Rungkut Industri',
      address: 'Rungkut Industri No. 5, Surabaya',
      latitude: -7.3292,
      longitude: 112.7665,
      picName: 'Ustadz Ahmad Fauzi',
      district: 'Rungkut',
      phone: '0857-1122-3344',
      dailyCapacity: 1000,
    },
  });

  // Create Recipients
  const recipient1 = await prisma.recipient.create({
    data: {
      name: 'Panti Werda & Balita harapan',
      type: 'PENERIMA',
      address: 'Jl. Raya Ngagel No. 102, Wonokromo',
      latitude: -7.2910,
      longitude: 112.7530,
      capacity: 150,
      picName: 'Suster Maria',
      phone: '0813-9988-7766',
      targetPortions: 150,
    },
  });

  const recipient2 = await prisma.recipient.create({
    data: {
      name: 'Panti Asuhan Kasih Ibu',
      type: 'PANTI',
      address: 'Jl. Merdeka No. 10, Surabaya',
      latitude: -7.2650,
      longitude: 112.7400,
      capacity: 100,
      picName: 'Ibu Ratna',
      phone: '0812-9999-8888',
      targetPortions: 200,
    },
  });

  // Create Food Stocks
  const now = new Date();
  const safeUntil = new Date(now.getTime() + 3 * 60 * 60 * 1000); // +3 hours

  // 1. Available Food Stock at Rungkut
  await prisma.foodStock.create({
    data: {
      kitchenId: kitchen2.id,
      menuName: 'Nasi Soto Ayam Kuning + Perkedel & Telur Rebus',
      portionCount: 10,
      tags: ['Protein Komplit', 'Kuah Rempah Warm'],
      cookedAt: now,
      safeUntil: safeUntil,
      status: 'AVAILABLE',
    },
  });

  // 2. Available Food Stock at Surabaya Pusat
  await prisma.foodStock.create({
    data: {
      kitchenId: kitchen1.id,
      menuName: 'Nasi Ayam Geprek + Sayur Bayam & Buah',
      portionCount: 100,
      tags: ['Tinggi Protein', 'Sayur Segar', 'Halal Certified'],
      cookedAt: now,
      safeUntil: safeUntil,
      status: 'AVAILABLE',
    },
  });

  // 3, 4, 5. Claimed Foods History for Recipient 1 (Panti Werda & Balita harapan)
  await prisma.foodStock.create({
    data: {
      kitchenId: kitchen2.id,
      menuName: 'Nasi Soto Ayam Kuning + Perkedel & Telur Rebus',
      portionCount: 10,
      tags: ['Protein Komplit'],
      cookedAt: new Date(now.getTime() - 40 * 60 * 1000),
      safeUntil: safeUntil,
      status: 'MATCHED',
      recipientId: recipient1.id,
      claimedAt: new Date(now.getTime() - 20 * 60 * 1000),
    },
  });

  await prisma.foodStock.create({
    data: {
      kitchenId: kitchen2.id,
      menuName: 'Nasi Soto Ayam Kuning + Perkedel & Telur Rebus',
      portionCount: 50,
      tags: ['Protein Komplit'],
      cookedAt: new Date(now.getTime() - 60 * 60 * 1000),
      safeUntil: safeUntil,
      status: 'MATCHED',
      recipientId: recipient1.id,
      claimedAt: new Date(now.getTime() - 35 * 60 * 1000),
    },
  });

  await prisma.foodStock.create({
    data: {
      kitchenId: kitchen2.id,
      menuName: 'Nasi Soto Ayam Kuning + Perkedel & Telur Rebus',
      portionCount: 50,
      tags: ['Protein Komplit'],
      cookedAt: new Date(now.getTime() - 90 * 60 * 1000),
      safeUntil: safeUntil,
      status: 'MATCHED',
      recipientId: recipient1.id,
      claimedAt: new Date(now.getTime() - 50 * 60 * 1000),
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
