# CRM de Obras — ADS

Mock-up navegable del sistema de gestión de obras para **Ascensores del Sur (ADS) — unidad Obras**. Es un prototipo de cliente: no tiene backend ni login real, los datos son de ejemplo y todo el estado vive en memoria mientras la pestaña está abierta.

## Cómo correrlo localmente

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) (o el puerto que indique la terminal).

## Cómo deployarlo en Vercel

1. Subí este repo a GitHub (ya está conectado a `matiasvenutolo-cmd/CRMADS`).
2. Entrá a [vercel.com/new](https://vercel.com/new), importá el repo.
3. Framework preset: **Next.js** (se detecta solo). No hace falta configurar variables de entorno ni base de datos.
4. Deploy. Cada push a `main` genera un nuevo deploy automáticamente.

## Qué hay implementado

- **Inicio**: tablero con KPIs, "necesita atención", gráficos simples y asistente con resumen de la semana.
- **Presupuestos**: kanban con drag & drop + vista tabla con filtros, ficha con versiones, historial, PDF de vista previa y el flujo de aprobación que convierte un presupuesto en obra.
- **Obras**: lista con progreso y ficha completa (resumen, etapas, historial, facturación y cobros, adicionales, documentos, fotos, obra civil, expediente técnico).
- **Clientes**: lista y ficha con contactos, tasa de aprobación y saldo pendiente.
- **Facturación**: vista consolidada de todos los hitos de pago de todas las obras.
- **Cotizador**: estima un precio a partir de la ficha técnica y genera el presupuesto en el CRM con un clic.
- **Parte de obra**: pensado para celular, para el responsable parado en la obra.
- **Portal del cliente** (`/portal/[obra]`): vista de solo lectura para compartir con la constructora.
- **Buscador global** (`Cmd/Ctrl+K`) y **recorrido guiado** (botón "Ver recorrido") para mostrarlo en una reunión.

## Restablecer los datos

El botón "Restablecer" en la barra superior vuelve todos los datos a su estado inicial de ejemplo (también alcanza con recargar la página).

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Zustand. Sin backend: los datos de ejemplo están en `src/data/` y el estado en memoria vive en `src/store/useStore.ts`.
