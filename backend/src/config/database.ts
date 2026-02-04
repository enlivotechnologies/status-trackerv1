import { PrismaClient } from '@prisma/client';

// Singleton pattern to prevent multiple PrismaClient instances
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Handle connection errors and reconnect
const connectWithRetry = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log('Database connected successfully');
      return;
    } catch (error: any) {
      console.error(`Database connection attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) {
        console.error('Failed to connect to database after all retries');
        throw error;
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// Initial connection
connectWithRetry().catch((error) => {
  console.error('Failed to establish initial database connection:', error);
});

// Handle disconnection gracefully
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Add connection error handling
prisma.$on('error' as never, (e: any) => {
  console.error('Prisma error:', e);
  // Attempt to reconnect on error
  if (e.message?.includes('terminating connection') || e.message?.includes('connection')) {
    console.log('Attempting to reconnect to database...');
    connectWithRetry();
  }
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
