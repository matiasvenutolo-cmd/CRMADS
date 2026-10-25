ALTER TABLE "presupuestos" ADD COLUMN "numero_ads" text;--> statement-breakpoint
CREATE INDEX "presupuestos_numero_ads_idx" ON "presupuestos" USING btree ("numero_ads");