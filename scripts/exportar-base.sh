#!/usr/bin/env bash
# Exporta la base completa de SIGTA (tablas, reglas, triggers y datos) a base-de-datos/sigta.sql
#   npm run db:exportar                      -> exporta la base de DATABASE_URL (o la local)
#   npm run db:exportar -- "postgresql://..." -> exporta otra base
# El archivo usa INSERT (no COPY) para que también se pueda pegar en el editor SQL de Supabase.
set -euo pipefail
cd "$(dirname "$0")/.."
URL="${1:-${DATABASE_URL:-postgresql://sigta:sigta@localhost:5432/sigta}}"
URL="${URL%%\?*}"   # pg_dump no entiende "?schema=public" de Prisma
SALIDA="base-de-datos/sigta.sql"
{
  echo "-- SIGTA · Sistema Integral de Gestión y Trazabilidad Alimentaria"
  echo "-- Base completa: tablas, claves, reglas (triggers) y datos. Generada con: npm run db:exportar"
  echo "-- Para importarla, ver base-de-datos/LEEME.md"
  echo
  pg_dump "$URL" --no-owner --no-privileges --no-comments --column-inserts --rows-per-insert=100 \
    | grep -v -E '^(SET transaction_timeout|\\restrict|\\unrestrict)'
} > "$SALIDA"
echo "Listo: $SALIDA ($(du -h "$SALIDA" | cut -f1))"
