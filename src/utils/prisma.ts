import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

declare global {
  var prismaInstance: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl: connectionString && (connectionString.includes('supabase') || connectionString.includes('sslmode='))
    ? { rejectUnauthorized: false }
    : undefined,
});
const adapter = new PrismaPg(pool);

export const prisma = globalThis.prismaInstance || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaInstance = prisma;
}
