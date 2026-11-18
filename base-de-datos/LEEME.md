# Base de datos de SIGTA (PostgreSQL)

`sigta.sql` es la base completa, lista para importar en cualquier PostgreSQL (Supabase, Neon, local):

- **18 tablas** con sus claves primarias, foráneas, índices y restricciones (`CHECK`).
- **4 funciones y 5 triggers** con las reglas críticas: bloqueo lógico de lotes no liberados,
  protocolo de calidad inalterable, auditoría que sólo agrega y dictamen final.
- **Datos iniciales:** el catálogo de agrifood-argentina.com (5 líneas, 31 productos, 42 insumos y sus recetas),
  4 usuarios, stock de insumos y un historial de 25 órdenes y 20 lotes.
- La tabla `_prisma_migrations`, para que la API sepa que la base ya está al día y no intente crearla de nuevo.

Usuarios: `produccion@sigta.demo`, `calidad@sigta.demo`, `deposito@sigta.demo` y `gerencia@sigta.demo`,
todos con la contraseña inicial **`sigta2026`** (guardada cifrada con bcrypt).

## Importarla en Supabase

1. Creá el proyecto en https://supabase.com (región **São Paulo** si está disponible) y anotá la contraseña de la base.
2. Elegí una de estas dos formas:
   - **Desde la página:** menú **SQL Editor** → **New query** → pegá todo el contenido de `sigta.sql` → **Run**.
   - **Desde tu computadora** (necesita `psql` instalado): en Supabase, botón **Connect** → copiá la conexión
     **Session pooler** y corré:
     ```bash
     psql "postgresql://postgres.XXXX:TU_CONTRASEÑA@aws-0-XXXX.pooler.supabase.com:5432/postgres" -f base-de-datos/sigta.sql
     ```
3. Revisá en **Table Editor** que estén las tablas (por ejemplo, `producto` con 31 filas).

Importala en un proyecto vacío: si las tablas ya existen, el archivo da error.

## Conectar la API (este repositorio) a Supabase

En las variables del Back (Vercel → Settings → Environment Variables), con los datos del botón **Connect** de Supabase:

| Variable | Qué conexión de Supabase |
|---|---|
| `DATABASE_URL` | **Transaction pooler** (puerto 6543), agregando `?pgbouncer=true` al final |
| `DATABASE_URL_UNPOOLED` | **Session pooler** (puerto 5432); se usa para las migraciones |

Como la base ya trae las migraciones registradas, al desplegar la API dice "No pending migrations" y no toca los datos.

## Volver a generarla

```bash
npm run db:exportar                              # exporta la base de DATABASE_URL (o la local)
npm run db:exportar -- "postgresql://usuario:clave@host:5432/base"   # exporta otra base
```

Necesita `pg_dump` (viene con PostgreSQL). Sirve también para sacar una copia de una base ya en uso,
por ejemplo la de Neon, con los datos que se fueron cargando.
