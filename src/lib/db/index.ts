import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { getD1Client } from './d1-client';

// Crear instancia de Drizzle
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function initializeDatabase() {
  if (!db) {
    const d1Client = getD1Client();
    db = drizzle(d1Client as any, { schema });
  }
  return db;
}

export function getDb() {
  return initializeDatabase();
}

// Exportar el schema para uso directo
export { schema };
