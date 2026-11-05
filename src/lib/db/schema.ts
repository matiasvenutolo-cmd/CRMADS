import { pgTable, uuid, text, integer, boolean, timestamp, date, numeric, index, uniqueIndex, jsonb } from 'drizzle-orm/pg-core'

export const usuarios = pgTable('usuarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  usuario: text('usuario').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  activo: boolean('activo').notNull().default(true),
  // 'gestion': carga y sigue el día a día. 'direccion': ve el tablero del negocio.
  rol: text('rol').notNull().default('gestion'),
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
    // Versión vigente: null = la original; 'B', 'C'… cuando se modifica (ADS 8608-B).
    version: text('version'),
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
    fechaAprobacion: date('fecha_aprobacion'),
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
    // Plazo de entrega pedido por el cliente (se compara con fechaFin, la entrega real).
    fechaFinEstimada: date('fecha_fin_estimada'),
    fechaFin: date('fecha_fin'),
    planosEnviados: date('planos_enviados'),
    montador: text('montador'),
    // Aprobación municipal: null = sin definir, 'no' = no corresponde, 'si' = a cargo de ADS.
    municipal: text('municipal'),
    fechaMunicipal: date('fecha_municipal'),
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

// Versiones anteriores de un presupuesto. El presupuesto guarda siempre la vigente;
// al crear una nueva, la anterior queda acá tal como estaba.
export const presupuestoVersiones = pgTable(
  'presupuesto_versiones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    presupuestoId: uuid('presupuesto_id')
      .notNull()
      .references(() => presupuestos.id, { onDelete: 'cascade' }),
    version: text('version'),
    fechaEnvio: date('fecha_envio'),
    monto: numeric('monto', { precision: 14, scale: 2, mode: 'number' }),
    moneda: text('moneda').notNull(),
    tipologia: text('tipologia').notNull(),
    cantidadEquipos: integer('cantidad_equipos').notNull(),
    cargaKg: integer('carga_kg'),
    paradas: integer('paradas'),
    velocidad: text('velocidad'),
    // Qué cambió en la versión que la reemplazó.
    cambios: text('cambios'),
    // La cotización tal como estaba en esta versión (si se armó con el cotizador).
    cotizacion: jsonb('cotizacion'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('presupuesto_versiones_presupuesto_idx').on(t.presupuestoId)]
)

// Compras de materiales de cada obra: qué se le compra a cada proveedor y cuándo.
export const compras = pgTable(
  'compras',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    obraId: uuid('obra_id')
      .notNull()
      .references(() => obras.id, { onDelete: 'cascade' }),
    proveedor: text('proveedor').notNull(),
    detalle: text('detalle'),
    compraPrevista: date('compra_prevista'),
    fechaCompra: date('fecha_compra'),
    // Previsión de fin de producción que da el proveedor.
    finProduccion: date('fin_produccion'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('compras_obra_idx').on(t.obraId)]
)

// Forma de pago de cada obra: lista libre (anticipo, cuotas, canje…), editable siempre.
// Un pago vence en una fecha o al completarse una etapa (etapaOrden).
export const pagos = pgTable(
  'pagos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    obraId: uuid('obra_id')
      .notNull()
      .references(() => obras.id, { onDelete: 'cascade' }),
    concepto: text('concepto').notNull(),
    medio: text('medio'),
    monto: numeric('monto', { precision: 14, scale: 2, mode: 'number' }),
    moneda: text('moneda').notNull().default('ARS'),
    fechaPrevista: date('fecha_prevista'),
    etapaOrden: integer('etapa_orden'),
    fechaCobro: date('fecha_cobro'),
    notas: text('notas'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('pagos_obra_idx').on(t.obraId)]
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
    // 'planos' | 'acta' | null (fotos y archivos sueltos)
    categoria: text('categoria'),
    pathname: text('pathname').notNull(),
    thumbPathname: text('thumb_pathname'),
    contentType: text('content_type').notNull(),
    tamano: integer('tamano').notNull(),
    usuarioId: uuid('usuario_id').references(() => usuarios.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('archivos_presupuesto_idx').on(t.presupuestoId), index('archivos_obra_idx').on(t.obraId)]
)

// ── Cotizador online ─────────────────────────────────────────────
// El «crudo» con el que se arman los presupuestos: lo que antes vivía en los Excel y Word.

/** Catálogo de costos: máquinas, puertas, adicionales, fletes, habilitación, mano de obra. */
export const cotizadorItems = pgTable('cotizador_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoria: text('categoria').notNull(),
  nombre: text('nombre').notNull(),
  costo: numeric('costo', { precision: 14, scale: 2, mode: 'number' }).notNull().default(0),
  notas: text('notas'),
  orden: integer('orden').notNull().default(0),
  activo: boolean('activo').notNull().default(true),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

/** Precio base de lista del proveedor según tipo de equipo y paradas. */
export const cotizadorBases = pgTable(
  'cotizador_bases',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tipo: text('tipo').notNull(),
    paradas: integer('paradas').notNull(),
    precio: numeric('precio', { precision: 14, scale: 2, mode: 'number' }).notNull(),
    detalle: text('detalle'),
    fuente: text('fuente'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('cotizador_bases_tipo_paradas_uq').on(t.tipo, t.paradas)]
)

/** Textos del documento: secciones técnicas por tipo de equipo y condiciones generales, con variantes. */
export const cotizadorTextos = pgTable('cotizador_textos', {
  id: uuid('id').primaryKey().defaultRandom(),
  grupo: text('grupo').notNull(), // 'tecnica' | 'condiciones'
  seccion: text('seccion').notNull(),
  tipos: text('tipos').array(), // null = todos los tipos
  variante: text('variante').notNull(),
  texto: text('texto').notNull(),
  orden: integer('orden').notNull().default(0),
  porDefecto: boolean('por_defecto').notNull().default(false),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

/** Parámetros generales: coeficiente, descuentos, IVA, validez… */
export const cotizadorConfig = pgTable('cotizador_config', {
  clave: text('clave').primaryKey(),
  valor: jsonb('valor').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

/** La cotización de un presupuesto (la versión vigente). */
export const cotizaciones = pgTable('cotizaciones', {
  presupuestoId: uuid('presupuesto_id')
    .primaryKey()
    .references(() => presupuestos.id, { onDelete: 'cascade' }),
  datos: jsonb('datos').notNull(),
  usuarioId: uuid('usuario_id').references(() => usuarios.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Usuario = typeof usuarios.$inferSelect
export type Cliente = typeof clientes.$inferSelect
export type Presupuesto = typeof presupuestos.$inferSelect
export type Obra = typeof obras.$inferSelect
export type Etapa = typeof etapas.$inferSelect
export type Evento = typeof eventos.$inferSelect
export type Archivo = typeof archivos.$inferSelect
export type Compra = typeof compras.$inferSelect
export type Pago = typeof pagos.$inferSelect
export type PresupuestoVersion = typeof presupuestoVersiones.$inferSelect
export type CotizadorItem = typeof cotizadorItems.$inferSelect
export type CotizadorBase = typeof cotizadorBases.$inferSelect
export type CotizadorTexto = typeof cotizadorTextos.$inferSelect
