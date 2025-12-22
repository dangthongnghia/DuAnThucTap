import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton
 * Tránh tạo nhiều instances trong development (do hot-reload)
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Export type helpers
export type { 
  User, 
  Account, 
  Transaction, 
  Transfer,
  Budget, 
  Category, 
  Notification, 
  RecurringTransaction,
  AccountType,
  TransactionType,
  BudgetPeriod,
  RecurringFrequency,
  NotificationType,
  NotificationCategory,
} from '@prisma/client';

export default prisma;
