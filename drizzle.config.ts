import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Verificar que las variables existan
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const databaseId = process.env.CLOUDFLARE_DATABASE_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;

if (!accountId || !databaseId || !token) {
  console.error('❌ Missing Cloudflare D1 credentials in .env.local:');
  console.error('   - CLOUDFLARE_ACCOUNT_ID:', accountId ? '✅' : '❌');
  console.error('   - CLOUDFLARE_DATABASE_ID:', databaseId ? '✅' : '❌');
  console.error('   - CLOUDFLARE_API_TOKEN:', token ? '✅' : '❌');
  process.exit(1);
}

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId,
    databaseId,
    token,
  },
});
