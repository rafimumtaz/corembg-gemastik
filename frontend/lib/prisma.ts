import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  var prismaClientSingleton: PrismaClient | undefined;
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({
    connectionString: connectionString || 'postgresql://postgres:postgres@localhost:5432/postgres',
    ssl: connectionString && (connectionString.includes('supabase') || connectionString.includes('sslmode='))
      ? { rejectUnauthorized: false }
      : undefined,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalThis.prismaClientSingleton || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaClientSingleton = prisma;
}
