// Compilación en Vercel (vercel.json → buildCommand):
// 1) compila la API, 2) aplica las migraciones y 3) carga los datos iniciales si la base está vacía.
// Sin base configurada, publica igual y avisa (la API responde "falta configurar la base").
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const correr = (comando, env = {}) => execSync(comando, { stdio: 'inherit', env: { ...process.env, ...env } });

correr('npm run build');

// Vercel pide una carpeta de salida: una página mínima que indica dónde está la API
mkdirSync('public', { recursive: true });
writeFileSync('public/index.html', '<!doctype html><meta charset="utf-8"><title>SIGTA · API</title><p>SIGTA · API REST. Estado: <a href="/api/salud">/api/salud</a></p>\n');

if (!process.env.DATABASE_URL) {
  console.warn('\n⚠ Falta DATABASE_URL: la API no va a funcionar hasta conectar la base (ver README).\n');
} else if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
  // Las vistas previas (otras ramas) comparten la base con producción: no la tocan.
  // Así dos compilaciones al mismo tiempo nunca compiten por aplicar las mismas migraciones.
  console.log(`\nVista previa (${process.env.VERCEL_ENV}): no se aplican migraciones ni datos; se usa la base tal como está.\n`);
} else {
  // Migraciones y datos van siempre a la misma base (migrar.mjs usa la conexión directa de esa base)
  correr('npm run db:migrate');
  correr('node dist/seed/cli.js --si-vacia', { TZ: 'America/Argentina/Cordoba' });
}
