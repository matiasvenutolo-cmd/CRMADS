CREATE TABLE "ingresos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "ultimo_ingreso" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ingresos" ADD CONSTRAINT "ingresos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ingresos_usuario_idx" ON "ingresos" USING btree ("usuario_id","created_at");