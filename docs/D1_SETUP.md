# Configuración de Drizzle ORM con Cloudflare D1

Este proyecto usa Drizzle ORM con Cloudflare D1 via REST API para funcionar desde Vercel.

## Configuración Inicial

### 1. Variables de Entorno

Copia `.example.env` a `.env.local` y completa las siguientes variables:

```bash
# Cloudflare D1 Configuration
CLOUDFLARE_ACCOUNT_ID=tu_account_id_de_cloudflare
CLOUDFLARE_DATABASE_ID=tu_database_id_de_d1
CLOUDFLARE_API_TOKEN=tu_api_token_de_cloudflare
```

### 2. Crear Base de Datos D1

1. Ve a Cloudflare Dashboard > D1
2. Crea una nueva base de datos
3. Copia el Database ID desde la configuración

### 3. Crear API Token

1. Ve a Cloudflare Dashboard > My Profile > API Tokens
2. Crea un token personalizado con permisos:
   - Zone: Zone Settings:Read
   - Account: Cloudflare D1:Edit

### 4. Comandos Disponibles

```bash
# Aplicar schema a D1 (crear/actualizar tablas)
pnpm db:push

# Generar archivos de migración (opcional)
pnpm db:generate

# Abrir Drizzle Studio
pnpm db:studio

# Probar conexión (en código)
import { testD1Connection, checkD1Tables } from '@/lib/db/test-connection';
await testD1Connection();
await checkD1Tables();
```

## Estructura de Archivos

```
src/lib/db/
├── schema.ts          # Definición de tablas
├── index.ts           # Configuración principal
├── d1-client.ts       # Cliente REST para D1
└── queries.ts         # Funciones de consulta
```

## Schema de Base de Datos

### Tablas Principales:

1. **users** - Usuarios del sistema con soporte para WhatsApp
2. **courses** - Cursos con colores personalizados
3. **cells** - Celdas de estudio por curso
4. **cell_members** - Miembros de cada celda (estudiantes y profesores)

## Uso en la Aplicación

```typescript
import { getDb } from '@/lib/db';
import { createCell, getCellMembers, createCellMember } from '@/lib/db/queries';

// Obtener conexión
const db = getDb();

// Crear una nueva celda
const newCell = await createCell({
  id: 'cell-1',
  name: 'Celda de Matemáticas',
  courseId: 'course-1'
});

// Obtener miembros de una celda
const members = await getCellMembers('cell-1');

// Agregar un miembro a la celda
await createCellMember({
  id: 'member-1',
  cellId: 'cell-1',
  userId: 'user-1',
  role: 'student'
});
```

## Consideraciones de Desarrollo

- **Desarrollo Local**: Usa D1 REST API de Cloudflare (misma BD que producción)
- **Producción**: Usa D1 REST API desde Vercel
- **Migraciones**: Usa `pnpm db:push` para aplicar cambios a la BD real
- **Índices**: Se crean automáticamente para optimizar consultas
- **Datos**: Desarrollo y producción comparten la misma base de datos

## Troubleshooting

### Error: "Missing Cloudflare D1 credentials"
- Verifica que todas las variables de entorno estén configuradas
- Confirma que el API token tenga los permisos correctos

### Error: "D1 API Error: 403"
- Verifica que el Account ID sea correcto
- Confirma que el API token tenga acceso al account

### Error: "D1 Query Error"
- Revisa la sintaxis SQL en el esquema
- Confirma que las migraciones se hayan aplicado
