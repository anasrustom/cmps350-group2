import { PrismaClient } from '@prisma/client';

// Singleton pattern: reuse the same PrismaClient instance in development
// to avoid exhausting database connections during hot reloads.
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
