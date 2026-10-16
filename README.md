# ADS Obras

Sistema de seguimiento de presupuestos y obras de Ascensores del Sur (unidad Obras). Piloto en https://crmads.vercel.app

## Stack

Next.js 16 · Postgres en Neon (Drizzle) · Vercel Blob privado para archivos · sesión propia con cookie firmada (jose).

## Desarrollo

```bash
npx vercel env pull .env.local --environment=development
npm install
npm run dev
```

La base de desarrollo es la misma que la de producción: cuidado con los datos de prueba.

## Base de datos

- Cambios de esquema: editar `src/lib/db/schema.ts`, luego `npm run db:generate` y `npm run db:migrate`.
- Usuarios: `npm run usuario -- <usuario> "<Nombre>"` crea el usuario (o le resetea la contraseña) y guarda la clave en `.credenciales/` (ignorado por git).

## Pendiente de validar con ADS

Las 9 etapas de obra (`ETAPAS_OBRA` en `src/lib/dominio.ts`). Cada obra guarda su copia, así que cambiarlas solo afecta a las obras nuevas.
