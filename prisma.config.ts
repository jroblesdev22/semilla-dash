import type { PrismaConfig } from 'prisma';
import { PrismaD1 } from '@prisma/adapter-d1';
import { config } from 'dotenv';

// Cargar variables de entorno
config({ path: '.env.local' });
config({ path: '.env' });

export default {
  experimental: {
    adapter: true,
  },
  schema: 'prisma/schema.prisma',
  async adapter() {
    return new PrismaD1({
      CLOUDFLARE_D1_TOKEN: process.env.CLOUDFLARE_D1_TOKEN!,
      CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID!,
      CLOUDFLARE_DATABASE_ID: process.env.CLOUDFLARE_DATABASE_ID!,
    });
  },
} satisfies PrismaConfig;