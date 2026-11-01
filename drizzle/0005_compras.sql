CREATE TABLE "compras" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"obra_id" uuid NOT NULL,
	"proveedor" text NOT NULL,
	"detalle" text,
	"compra_prevista" date,
	"fecha_compra" date,
	"fin_produccion" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "compras" ADD CONSTRAINT "compras_obra_id_obras_id_fk" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "compras_obra_idx" ON "compras" USING btree ("obra_id");