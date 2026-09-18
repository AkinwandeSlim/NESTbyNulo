import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // MERGE NOTE: `log: ['query']` made the merged demo unusably noisy (every
    // single SQL statement, including the seed's bulk inserts). Warnings and
    // errors are still surfaced; set NODE_ENV=development and re-add 'query'
    // when a specific query needs debugging.
    log: ['warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db