import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

declare global {
  var prisma: PrismaClient | undefined;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    adapter,
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}