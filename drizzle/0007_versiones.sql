CREATE TABLE "presupuesto_versiones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"presupuesto_id" uuid NOT NULL,
	"version" text,
	"fecha_envio" date,
	"monto" numeric(14, 2),
	"moneda" text NOT NULL,
	"tipologia" text NOT NULL,
	"cantidad_equipos" integer NOT NULL,
	"carga_kg" integer,
	"paradas" integer,
	"velocidad" text,
	"cambios" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "presupuestos" ADD COLUMN "version" text;--> statement-breakpoint
ALTER TABLE "presupuesto_versiones" ADD CONSTRAINT "presupuesto_versiones_presupuesto_id_presupuestos_id_fk" FOREIGN KEY ("presupuesto_id") REFERENCES "public"."presupuestos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "presupuesto_versiones_presupuesto_idx" ON "presupuesto_versiones" USING btree ("presupuesto_id");