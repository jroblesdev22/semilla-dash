import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import { config } from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde la raíz del proyecto
config({ path: path.resolve(process.cwd(), '.env.local') });
config({ path: path.resolve(process.cwd(), '.env') });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Función para crear el cliente con adaptador D1 (mismo DB para local y producción)
const createD1Client = () => {
  const adapter = new PrismaD1({
    CLOUDFLARE_D1_TOKEN: process.env.CLOUDFLARE_D1_TOKEN!,
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID!,
    CLOUDFLARE_DATABASE_ID: process.env.CLOUDFLARE_DATABASE_ID!,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  });
};

export const prisma = globalForPrisma.prisma ?? createD1Client();

// Evitar múltiples instancias en desarrollo
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Función para limpiar conexiones al cerrar la aplicación
export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};

// Mantener compatibilidad con el export anterior
export const db = prisma;
