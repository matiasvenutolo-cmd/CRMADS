CREATE TABLE "pagos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"obra_id" uuid NOT NULL,
	"concepto" text NOT NULL,
	"medio" text,
	"monto" numeric(14, 2),
	"moneda" text DEFAULT 'ARS' NOT NULL,
	"fecha_prevista" date,
	"etapa_orden" integer,
	"fecha_cobro" date,
	"notas" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_obra_id_obras_id_fk" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pagos_obra_idx" ON "pagos" USING btree ("obra_id");