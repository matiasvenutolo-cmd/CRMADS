CREATE TABLE "archivos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"presupuesto_id" uuid,
	"obra_id" uuid,
	"nombre" text NOT NULL,
	"pathname" text NOT NULL,
	"thumb_pathname" text,
	"content_type" text NOT NULL,
	"tamano" integer NOT NULL,
	"usuario_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clientes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"contacto" text,
	"telefono" text,
	"email" text,
	"cuit" text,
	"notas" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "etapas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"obra_id" uuid NOT NULL,
	"orden" integer NOT NULL,
	"nombre" text NOT NULL,
	"estado" text DEFAULT 'pendiente' NOT NULL,
	"fecha_prevista" date,
	"fecha_inicio" date,
	"fecha_fin" date
);
--> statement-breakpoint
CREATE TABLE "eventos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"presupuesto_id" uuid,
	"obra_id" uuid,
	"tipo" text NOT NULL,
	"texto" text NOT NULL,
	"usuario_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "obras" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero" integer GENERATED ALWAYS AS IDENTITY (sequence name "obras_numero_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"presupuesto_id" uuid,
	"cliente_id" uuid NOT NULL,
	"direccion" text NOT NULL,
	"localidad" text,
	"tipologia" text NOT NULL,
	"cantidad_equipos" integer DEFAULT 1 NOT NULL,
	"carga_kg" integer,
	"paradas" integer,
	"velocidad" text,
	"estado" text DEFAULT 'en_curso' NOT NULL,
	"fecha_inicio" date NOT NULL,
	"fecha_fin_estimada" date,
	"fecha_fin" date,
	"notas" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "presupuestos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero" integer GENERATED ALWAYS AS IDENTITY (sequence name "presupuestos_numero_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"cliente_id" uuid NOT NULL,
	"direccion" text NOT NULL,
	"localidad" text,
	"tipologia" text NOT NULL,
	"cantidad_equipos" integer DEFAULT 1 NOT NULL,
	"carga_kg" integer,
	"paradas" integer,
	"velocidad" text,
	"monto" numeric(14, 2),
	"moneda" text DEFAULT 'ARS' NOT NULL,
	"estado" text DEFAULT 'borrador' NOT NULL,
	"fecha_envio" date,
	"proximo_seguimiento" date,
	"motivo_perdida" text,
	"notas" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"usuario" text NOT NULL,
	"password_hash" text NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_usuario_unique" UNIQUE("usuario")
);
--> statement-breakpoint
ALTER TABLE "archivos" ADD CONSTRAINT "archivos_presupuesto_id_presupuestos_id_fk" FOREIGN KEY ("presupuesto_id") REFERENCES "public"."presupuestos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archivos" ADD CONSTRAINT "archivos_obra_id_obras_id_fk" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archivos" ADD CONSTRAINT "archivos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "etapas" ADD CONSTRAINT "etapas_obra_id_obras_id_fk" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_presupuesto_id_presupuestos_id_fk" FOREIGN KEY ("presupuesto_id") REFERENCES "public"."presupuestos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_obra_id_obras_id_fk" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "obras" ADD CONSTRAINT "obras_presupuesto_id_presupuestos_id_fk" FOREIGN KEY ("presupuesto_id") REFERENCES "public"."presupuestos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "obras" ADD CONSTRAINT "obras_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presupuestos" ADD CONSTRAINT "presupuestos_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "archivos_presupuesto_idx" ON "archivos" USING btree ("presupuesto_id");--> statement-breakpoint
CREATE INDEX "archivos_obra_idx" ON "archivos" USING btree ("obra_id");--> statement-breakpoint
CREATE UNIQUE INDEX "etapas_obra_orden_uq" ON "etapas" USING btree ("obra_id","orden");--> statement-breakpoint
CREATE INDEX "eventos_presupuesto_idx" ON "eventos" USING btree ("presupuesto_id");--> statement-breakpoint
CREATE INDEX "eventos_obra_idx" ON "eventos" USING btree ("obra_id");--> statement-breakpoint
CREATE UNIQUE INDEX "obras_presupuesto_uq" ON "obras" USING btree ("presupuesto_id");--> statement-breakpoint
CREATE INDEX "obras_cliente_idx" ON "obras" USING btree ("cliente_id");--> statement-breakpoint
CREATE INDEX "presupuestos_cliente_idx" ON "presupuestos" USING btree ("cliente_id");--> statement-breakpoint
CREATE INDEX "presupuestos_estado_idx" ON "presupuestos" USING btree ("estado");