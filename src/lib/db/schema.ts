import { pgTable, uuid, text, integer, boolean, timestamp, date, numeric, index, uniqueIndex } from 'drizzle-orm/pg-core'

export const usuarios = pgTable('usuarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  usuario: text('usuario').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  activo: boolean('activo').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const clientes = pgTable('clientes', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  contacto: text('contacto'),
  telefono: text('telefono'),
  email: text('email'),
  cuit: text('cuit'),
  notas: text('notas'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const presupuestos = pgTable(
  'presupuestos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    numero: integer('numero').generatedAlwaysAsIdentity().notNull(),
    numeroAds: text('numero_ads'),
    clienteId: uuid('cliente_id').notNull().references(() => clientes.id),
    direccion: text('direccion').notNull(),
    localidad: text('localidad'),
    tipologia: text('tipologia').notNull(),
    cantidadEquipos: integer('cantidad_equipos').notNull().default(1),
    cargaKg: integer('carga_kg'),
    paradas: integer('paradas'),
    velocidad: text('velocidad'),
    monto: numeric('monto', { precision: 14, scale: 2, mode: 'number' }),
    moneda: text('moneda').notNull().default('ARS'),
    estado: text('estado').notNull().default('borrador'),
    fechaEnvio: date('fecha_envio'),
    proximoSeguimiento: date('proximo_seguimiento'),
    motivoPerdida: text('motivo_perdida'),
    notas: text('notas'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('presupuestos_cliente_idx').on(t.clienteId), index('presupuestos_estado_idx').on(t.estado), index('presupuestos_numero_ads_idx').on(t.numeroAds)]
)

export const obras = pgTable(
  'obras',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    numero: integer('numero').generatedAlwaysAsIdentity().notNull(),
    presupuestoId: uuid('presupuesto_id').references(() => presupuestos.id),
    clienteId: uuid('cliente_id').notNull().references(() => clientes.id),
    direccion: text('direccion').notNull(),
    localidad: text('localidad'),
    tipologia: text('tipologia').notNull(),
    cantidadEquipos: integer('cantidad_equipos').notNull().default(1),
    cargaKg: integer('carga_kg'),
    paradas: integer('paradas'),
    velocidad: text('velocidad'),
    estado: text('estado').notNull().default('en_curso'),
    fechaInicio: date('fecha_inicio').notNull(),
    fechaFinEstimada: date('fecha_fin_estimada'),
    fechaFin: date('fecha_fin'),
    notas: text('notas'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('obras_presupuesto_uq').on(t.presupuestoId), index('obras_cliente_idx').on(t.clienteId)]
)

export const etapas = pgTable(
  'etapas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    obraId: uuid('obra_id')
      .notNull()
      .references(() => obras.id, { onDelete: 'cascade' }),
    orden: integer('orden').notNull(),
    nombre: text('nombre').notNull(),
    estado: text('estado').notNull().default('pendiente'),
    fechaPrevista: date('fecha_prevista'),
    fechaInicio: date('fecha_inicio'),
    fechaFin: date('fecha_fin'),
  },
  (t) => [uniqueIndex('etapas_obra_orden_uq').on(t.obraId, t.orden)]
)

export const eventos = pgTable(
  'eventos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    presupuestoId: uuid('presupuesto_id').references(() => presupuestos.id, { onDelete: 'cascade' }),
    obraId: uuid('obra_id').references(() => obras.id, { onDelete: 'cascade' }),
    tipo: text('tipo').notNull(),
    texto: text('texto').notNull(),
    usuarioId: uuid('usuario_id').references(() => usuarios.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('eventos_presupuesto_idx').on(t.presupuestoId), index('eventos_obra_idx').on(t.obraId)]
)

export const archivos = pgTable(
  'archivos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    presupuestoId: uuid('presupuesto_id').references(() => presupuestos.id, { onDelete: 'cascade' }),
    obraId: uuid('obra_id').references(() => obras.id, { onDelete: 'cascade' }),
    nombre: text('nombre').notNull(),
    pathname: text('pathname').notNull(),
    thumbPathname: text('thumb_pathname'),
    contentType: text('content_type').notNull(),
    tamano: integer('tamano').notNull(),
    usuarioId: uuid('usuario_id').references(() => usuarios.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('archivos_presupuesto_idx').on(t.presupuestoId), index('archivos_obra_idx').on(t.obraId)]
)

export type Usuario = typeof usuarios.$inferSelect
export type Cliente = typeof clientes.$inferSelect
export type Presupuesto = typeof presupuestos.$inferSelect
export type Obra = typeof obras.$inferSelect
export type Etapa = typeof etapas.$inferSelect
export type Evento = typeof eventos.$inferSelect
export type Archivo = typeof archivos.$inferSelect
