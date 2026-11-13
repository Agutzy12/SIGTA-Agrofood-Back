# SIGTA · Back (API REST)

> **Sistema Integral de Gestión y Trazabilidad Alimentaria** para **Agrifood Argentina S.A.**
> Proyecto final de Analista de Sistemas · Benítez Agustín · basado en el *Informe Técnico V5*.

Este repositorio tiene la **API y la base de datos** de SIGTA. Las pantallas están en
[SIGTA-Agrofood-Front](https://github.com/Agutzy12/SIGTA-Agrofood-Front).

Módulo actual: **Gestión de Producción y Trazabilidad Industrial** (CU-P01 a CU-P04, panel, trazabilidad de lote y etiquetas GS1-128).

## Tecnologías

| Capa | Tecnología | Para qué |
|---|---|---|
| Base de datos | **PostgreSQL 16** | Datos relacionales, transacciones y *triggers* para las reglas críticas |
| Acceso a datos | **Prisma** (ORM + migraciones) | Modelo en `prisma/schema.prisma`, cambios versionados |
| Servidor | **Node.js 22 + Express 5 + TypeScript** | Casos de uso, permisos y validaciones |
| Validación | **Zod** | Revisa la forma de cada pedido antes de procesarlo |
| Seguridad | **bcrypt + JWT** | Contraseñas cifradas y sesión firmada |
| Pruebas | **Vitest + Supertest** | 33 pruebas contra PostgreSQL real |

La explicación de cada decisión está en [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md).

## Cómo correrla en tu computadora

Necesitás **Node.js 22** y **PostgreSQL 16** (lo más simple es con **Docker Desktop**).

```bash
git clone https://github.com/Agutzy12/SIGTA-Agrofood-Back.git
cd SIGTA-Agrofood-Back
npm install
npm run db:up                 # levanta PostgreSQL en Docker (puerto 5432)
cp .env.example .env          # en Windows: copy .env.example .env
npm run setup                 # crea las tablas y carga los datos iniciales
npm run dev                   # API en http://localhost:3000/api
```

Después levantá las pantallas desde el repositorio del Front (`npm run dev` ahí, en http://localhost:5173).

¿Sin Docker? Instalá PostgreSQL 16, creá el usuario `sigta` (contraseña `sigta`) y las bases `sigta` y `sigta_test`
(ver `scripts/crear-base-test.sql`) y seguí desde `cp .env.example .env`.

### Usuarios

Todos tienen la contraseña inicial **`sigta2026`**. En la pantalla de ingreso hay **accesos rápidos** para entrar con cualquiera
sin escribirla (se desactivan con `ACCESOS_RAPIDOS=false`).

| Usuario | Rol | Qué puede hacer |
|---|---|---|
| produccion@sigta.demo · Martín Pérez | Supervisor de producción | Planificar órdenes y registrar la elaboración |
| calidad@sigta.demo · Lucía Benítez | Técnico de calidad | Analizar lotes y firmar el dictamen |
| deposito@sigta.demo · Diego Acosta | Operario de depósito | Recibir producto liberado y despachar |
| gerencia@sigta.demo · Valeria Ruiz | Gerencia | Sólo consulta |

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | API en el puerto 3000 con recarga automática |
| `npm run setup` | Aplica las migraciones y carga los datos iniciales |
| `npm run db:seed` | **Borra** la base y vuelve a cargar los datos iniciales (sólo desarrollo) |
| `npm run db:studio` | Abre Prisma Studio para mirar las tablas |
| `npm test` | Pruebas de la API (contra la base `sigta_test`) |
| `npm run build` y luego `npm start` | Versión de producción |

## Variables de entorno

| Variable | Para qué |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL |
| `DATABASE_URL_UNPOOLED` | Conexión directa para las migraciones (en Neon, la que no dice `-pooler`) |
| `DATABASE_URL_TEST` | Base de las pruebas automáticas |
| `JWT_SECRET` | Clave para firmar las sesiones (obligatoria en producción, 16 caracteres o más) |
| `CORS_ORIGENES` | Dominios del Front que pueden llamar a la API, separados por coma (por ejemplo `https://sigta-front.vercel.app`) |
| `ACCESOS_RAPIDOS` | `true` (por defecto) muestra en el ingreso los botones para entrar con cualquier usuario |
| `TZ` | `America/Argentina/Cordoba` |

## Publicarla en internet (Vercel + Neon)

1. En Vercel, **Add New → Project** e importá este repositorio. `vercel.json` ya tiene la configuración.
2. Pestaña **Storage → Create Database → Neon**, conectada a *Production* y *Preview* (agrega `DATABASE_URL` y `DATABASE_URL_UNPOOLED`).
3. En **Settings → Environment Variables** agregá `JWT_SECRET` y `CORS_ORIGENES` (la dirección del Front).
4. **Redeploy**. En cada despliegue de producción se aplican las migraciones y, si la base está vacía, se cargan los datos iniciales.

La API queda en `https://<proyecto>.vercel.app/api` (prueba: `/api/salud`). Esa dirección va en `VITE_API_URL` del Front.

## Reglas que el sistema hace cumplir

- Un lote recién elaborado queda en **cuarentena**: no se puede recibir en depósito ni despachar.
- Sólo **Calidad** puede liberarlo. Un lote **rechazado** queda bloqueado y su OP pasa a *Rechazada (Scrap)*.
- El **bloqueo lógico** se verifica en dos niveles: en la aplicación (error 423) y en PostgreSQL (*triggers*).
- El protocolo de calidad firmado y el registro de auditoría son **inalterables** (también lo controla la base).
- Planificar una orden **no descuenta stock**: lo reserva. El stock se descuenta al finalizar la elaboración.
- Las partidas se sugieren por **FEFO** (primero vence, primero sale).
- Cada usuario sólo puede ejecutar los casos de uso de su **rol**.

## Estructura

```
prisma/schema.prisma   Modelo de datos
prisma/migrations/     Tablas y reglas de la base (triggers)
src/rutas.ts           Rutas de la API y matriz de permisos por rol
src/services/          Un servicio por tema: órdenes, calidad, depósito, trazabilidad, GS1...
src/seed/              Datos iniciales (catalogo.ts: el catálogo de agrifood-argentina.com)
test/                  Pruebas de la API
api/index.js           Función de Vercel: atiende /api con la aplicación Express
docs/                  Arquitectura, correcciones del informe y tareas
```
