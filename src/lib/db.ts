import { PrismaClient } from '@prisma/client'

// Force rebuild after Prisma client regeneration - v4

// إنشاء عميل Prisma جديد في كل مرة في بيئة التطوير
const createPrismaClient = () => {
  return new PrismaClient({
    log: ['query'],
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db