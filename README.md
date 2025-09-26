# Semilla Dashboard

Un dashboard para gestionar estudiantes y células de estudio integrado con Google Classroom API.

## Descripción del Proyecto

Esta aplicación Next.js permite:
- ✅ Visualizar estudiantes de Google Classroom con estadísticas de tareas
- ✅ Gestionar células de estudio por curso
- ✅ Filtrar estudiantes por profesores y células
- ✅ Dashboard interactivo con gráficos y métricas
- ✅ Autenticación con Google (NextAuth)
- ✅ Base de datos Cloudflare D1 con Prisma ORM

## Requisitos Previos

Antes de deployar la aplicación, asegúrate de tener:

1. **Node.js 18+** instalado
2. **pnpm** como gestor de paquetes
3. **Cuenta de Google Cloud Platform** (para Google Classroom API)
4. **Cuenta de Cloudflare** (para D1 Database)
5. **Cuenta de Vercel** (para deployment)

## Configuración Local

### 1. Clonar el Repositorio

```bash
git clone <your-repo-url>
cd semilla-dash
```

### 2. Instalar Dependencias

```bash
pnpm install
```

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura las variables:

```bash
cp .example.env .env.local
```

Edita `.env.local` con tus valores:

```env
# NextAuth Configuration
AUTH_GOOGLE_ID=your_google_oauth_client_id
AUTH_GOOGLE_SECRET=your_google_oauth_client_secret
AUTH_SECRET=your_generated_auth_secret # Genera usando: npx auth secret

# Cloudflare D1 Configuration
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_DATABASE_ID=your_d1_database_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token

# Database URL (para desarrollo local)
DATABASE_URL="file:./dev.db"
```

### 4. Configurar Google Classroom API

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google Classroom API**
4. Ve a "Credenciales" → "Crear credenciales" → "ID de cliente OAuth 2.0"
5. Configura el tipo de aplicación como "Aplicación web"
6. Agregar URLs autorizadas:
   - **Desarrollo**: `http://localhost:3000/api/auth/callback/google`
   - **Producción**: `https://tu-dominio.vercel.app/api/auth/callback/google`
7. Copia el **Client ID** y **Client Secret** a tu `.env.local`

### 5. Configurar Cloudflare D1

1. Instalar Wrangler CLI:
```bash
pnpm add -g wrangler
```

2. Autenticarse con Cloudflare:
```bash
wrangler login
```

3. Crear una base de datos D1:
```bash
wrangler d1 create semilla-dashboard
```

4. Copiar el **Database ID** del output a tu `.env.local`

5. Obtener tu **Account ID** desde el dashboard de Cloudflare

6. Crear un **API Token**:
   - Ve a "My Profile" → "API Tokens"
   - "Create Token" → "D1:Edit" template
   - Copia el token a tu `.env.local`

### 6. Configurar Base de Datos

```bash
# Generar cliente Prisma
pnpm db:generate

# Para desarrollo local (SQLite)
pnpm db:push

# Para D1 en producción, usar Wrangler:
# wrangler d1 execute semilla-dashboard --file=./prisma/schema.sql
```

### 7. Ejecutar en Desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## Deployment en Vercel

### 1. Preparar el Repositorio

Asegúrate de que todos los cambios estén commitados y pusheados a tu repositorio de Git.

### 2. Importar en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Importa tu repositorio de GitHub/GitLab/Bitbucket
4. Selecciona "Next.js" como framework

### 3. Configurar Variables de Entorno en Vercel

En la configuración del proyecto de Vercel, agrega todas las variables de entorno:

```env
AUTH_GOOGLE_ID=your_google_oauth_client_id
AUTH_GOOGLE_SECRET=your_google_oauth_client_secret
AUTH_SECRET=your_generated_auth_secret
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_DATABASE_ID=your_d1_database_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
```

### 4. Configurar Dominio de Callback

Actualiza las URLs autorizadas en Google Cloud Console:
- Agrega `https://tu-dominio.vercel.app/api/auth/callback/google`

### 5. Deploy

```bash
# Vercel se deployará automáticamente en cada push a main
# O puedes hacer deploy manual:
vercel --prod
```

## Configuración Post-Deployment

### 1. Poblar la Base de Datos

Después del primer deployment, necesitas poblar la base de datos con datos iniciales:

1. **Usuarios**: Los usuarios se crearán automáticamente cuando se autentiquen con Google
2. **Cursos**: Se sincronizarán automáticamente desde Google Classroom
3. **Células**: Puedes crearlas desde la interfaz de administración

### 2. Configurar Permisos de Google Classroom

Asegúrate de que los usuarios tengan los permisos necesarios:
- **Profesores**: Deben tener acceso a los cursos en Google Classroom
- **Estudiantes**: Deben estar inscritos en los cursos correspondientes

### 3. Verificar Conexiones

1. **Autenticación**: Prueba el login con Google
2. **API de Classroom**: Verifica que se cargan los cursos y estudiantes
3. **Base de Datos**: Confirma que se guardan los datos correctamente

## Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Servidor de desarrollo con Turbopack
pnpm build            # Build de producción
pnpm start            # Servidor de producción
pnpm lint             # Linter

# Base de Datos
pnpm db:generate      # Generar cliente Prisma
pnpm db:migrate       # Ejecutar migraciones
pnpm db:push          # Push schema a DB
pnpm db:studio        # Prisma Studio
pnpm db:reset         # Reset de base de datos
```

## Estructura del Proyecto

```
src/
├── app/
│   ├── api/           # API Routes
│   │   ├── students/  # Endpoint de estudiantes
│   │   └── teachers/  # Endpoint de profesores
│   └── dashboard/     # Dashboard principal
├── components/        # Componentes React
│   ├── ui/           # Componentes base (shadcn/ui)
│   ├── data-table.tsx    # Tabla de datos
│   ├── course-selector.tsx # Selector de cursos
│   └── list-teachers.tsx   # Lista de profesores
├── hooks/            # Custom hooks
│   └── use-students.ts    # Hook para estudiantes
└── lib/              # Utilidades
    ├── db.ts         # Cliente de base de datos
    └── utils.ts      # Funciones auxiliares
```

## Tecnologías Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Authentication**: NextAuth v5
- **Database**: Cloudflare D1, Prisma ORM
- **APIs**: Google Classroom API (googleapis)
- **Deployment**: Vercel
- **Package Manager**: pnpm

## Solución de Problemas

### Error de Autenticación
- Verifica que las URLs de callback estén correctamente configuradas
- Confirma que el `AUTH_SECRET` esté configurado

### Error de Base de Datos
- Verifica las credenciales de Cloudflare D1
- Asegúrate de que el schema esté aplicado correctamente

### Error de Google Classroom API
- Confirma que la API esté habilitada en Google Cloud Console
- Verifica los permisos de los usuarios

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).
