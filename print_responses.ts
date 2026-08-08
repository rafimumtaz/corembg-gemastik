import app from './src/app.js';
import request from 'supertest';
import { prisma } from './src/utils/prisma.js';

async function run() {
  console.log("--- HEALTH CHECK ---");
  const h = await request(app).get('/api/health');
  console.log(JSON.stringify(h.body, null, 2));

  console.log("\n--- KITCHENS ---");
  const k = await request(app).get('/api/kitchens');
  console.log(JSON.stringify(k.body, null, 2));

  console.log("\n--- FOODS (AVAILABLE) ---");
  const f = await request(app).get('/api/foods?status=AVAILABLE');
  console.log(JSON.stringify(f.body, null, 2));
  
  await prisma.$disconnect();
}
run();
