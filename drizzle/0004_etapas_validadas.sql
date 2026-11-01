ALTER TABLE "archivos" ADD COLUMN "categoria" text;--> statement-breakpoint
ALTER TABLE "obras" ADD COLUMN "planos_enviados" date;--> statement-breakpoint
ALTER TABLE "obras" ADD COLUMN "montador" text;--> statement-breakpoint
ALTER TABLE "obras" ADD COLUMN "municipal" text;--> statement-breakpoint
ALTER TABLE "obras" ADD COLUMN "fecha_municipal" date;--> statement-breakpoint
-- Etapas validadas con Gerardo. Al migrar, todas las obras estaban en la etapa 1 y sin fechas.
UPDATE "etapas" SET "nombre" = CASE "orden"
  WHEN 1 THEN 'Forma de pago'
  WHEN 2 THEN 'Replanteo'
  WHEN 3 THEN 'Planos de proyecto'
  WHEN 4 THEN 'Compras y fabricación'
  WHEN 5 THEN 'Obra civil'
  WHEN 6 THEN 'Entrega de materiales en obra'
  WHEN 7 THEN 'Montaje'
  WHEN 8 THEN 'Pruebas y puesta en marcha'
  WHEN 9 THEN 'Entrega final'
  ELSE "nombre" END;
