import type { Cliente } from '@/types'

export const CLIENTES: Cliente[] = [
  {
    id: 'cli-01',
    nombre: 'Constructora Del Plata',
    tipo: 'Constructora',
    cuit: '30-70812345-6',
    condicionIVA: 'Responsable Inscripto',
    localidad: 'Lanús Oeste',
    contactos: [
      { id: 'cto-01', nombre: 'Horacio Mansilla', cargo: 'Jefe de obra', telefono: '11 4223-5678', email: 'hmansilla@delplataconstructora.com.ar' },
      { id: 'cto-02', nombre: 'Julieta Peralta', cargo: 'Compras', telefono: '11 4223-5680', email: 'compras@delplataconstructora.com.ar' },
    ],
  },
  {
    id: 'cli-02',
    nombre: 'Estudio Arq. Ferreyra & Asoc.',
    tipo: 'Estudio de arquitectura',
    cuit: '30-68221190-3',
    condicionIVA: 'Responsable Inscripto',
    localidad: 'CABA',
    contactos: [
      { id: 'cto-03', nombre: 'Pablo Ferreyra', cargo: 'Socio', telefono: '11 4801-2290', email: 'pferreyra@ferreyraestudio.com' },
    ],
  },
  {
    id: 'cli-03',
    nombre: 'Desarrollos Banfield',
    tipo: 'Desarrolladora',
    cuit: '30-71455820-1',
    condicionIVA: 'Responsable Inscripto',
    localidad: 'Banfield',
    contactos: [
      { id: 'cto-04', nombre: 'Sergio Achával', cargo: 'Director de proyectos', telefono: '11 5522-3341', email: 'sachaval@desarrollosbanfield.com.ar' },
      { id: 'cto-05', nombre: 'Melina Ibáñez', cargo: 'Administración', telefono: '11 5522-3345', email: 'mibanez@desarrollosbanfield.com.ar' },
    ],
  },
  {
    id: 'cli-04',
    nombre: 'Consorcio Av. Mitre 2140',
    tipo: 'Administración de consorcio',
    cuit: '30-65540112-8',
    condicionIVA: 'Exento',
    localidad: 'Avellaneda',
    contactos: [{ id: 'cto-06', nombre: 'Norma Castiglione', cargo: 'Administradora', telefono: '11 4222-0091', email: 'administracion@castiglionepropiedades.com.ar' }],
  },
  {
    id: 'cli-05',
    nombre: 'Grupo Costero Gesell',
    tipo: 'Desarrolladora',
    cuit: '30-71980034-5',
    condicionIVA: 'Responsable Inscripto',
    localidad: 'Villa Gesell',
    contactos: [
      { id: 'cto-07', nombre: 'Ezequiel Bramanti', cargo: 'Gerente de obra', telefono: '2255 41-8820', email: 'ebramanti@grupocostero.com.ar' },
    ],
  },
  {
    id: 'cli-06',
    nombre: 'Estudio Cabrera Arquitectos',
    tipo: 'Estudio de arquitectura',
    cuit: '30-69874120-9',
    condicionIVA: 'Responsable Inscripto',
    localidad: 'CABA',
    contactos: [
      { id: 'cto-08', nombre: 'Florencia Cabrera', cargo: 'Directora', telefono: '11 4773-9910', email: 'fcabrera@cabreraarq.com' },
      { id: 'cto-09', nombre: 'Ignacio Wierna', cargo: 'Coordinador técnico', telefono: '11 4773-9912', email: 'iwierna@cabreraarq.com' },
    ],
  },
  {
    id: 'cli-07',
    nombre: 'Constructora Sudeste SRL',
    tipo: 'Constructora',
    cuit: '30-70344211-7',
    condicionIVA: 'Responsable Inscripto',
    localidad: 'Mar del Plata',
    contactos: [{ id: 'cto-10', nombre: 'Rodrigo Yannello', cargo: 'Jefe de obra', telefono: '223 495-2231', email: 'ryannello@sudesteconstructora.com.ar' }],
  },
  {
    id: 'cli-08',
    nombre: 'Desarrollos Tortuguitas Norte',
    tipo: 'Desarrolladora',
    cuit: '30-71662209-4',
    condicionIVA: 'Responsable Inscripto',
    localidad: 'Tortuguitas',
    contactos: [
      { id: 'cto-11', nombre: 'Andrea Solsona', cargo: 'Directora comercial', telefono: '11 6633-0071', email: 'asolsona@tortuguitasnorte.com.ar' },
    ],
  },
  {
    id: 'cli-09',
    nombre: 'Consorcio Lanús Este 458',
    tipo: 'Administración de consorcio',
    cuit: '30-64213398-2',
    condicionIVA: 'Exento',
    localidad: 'Lanús Este',
    contactos: [{ id: 'cto-12', nombre: 'Gustavo Peirano', cargo: 'Administrador', telefono: '11 4241-6650', email: 'gestion@peiranoadministraciones.com.ar' }],
  },
  {
    id: 'cli-10',
    nombre: 'Estudio Beltrán & Medina',
    tipo: 'Estudio de arquitectura',
    cuit: '30-70119823-5',
    condicionIVA: 'Responsable Inscripto',
    localidad: 'CABA',
    contactos: [
      { id: 'cto-13', nombre: 'Nicolás Beltrán', cargo: 'Socio', telefono: '11 4952-7710', email: 'nbeltran@beltranmedina.com' },
      { id: 'cto-14', nombre: 'Carolina Medina', cargo: 'Socia', telefono: '11 4952-7711', email: 'cmedina@beltranmedina.com' },
    ],
  },
  {
    id: 'cli-11',
    nombre: 'Constructora Riberas del Plata',
    tipo: 'Constructora',
    cuit: '30-71203456-0',
    condicionIVA: 'Responsable Inscripto',
    localidad: 'Avellaneda',
    contactos: [{ id: 'cto-15', nombre: 'Diego Otamendi', cargo: 'Jefe de obra', telefono: '11 4222-8834', email: 'dotamendi@riberasdelplata.com.ar' }],
  },
  {
    id: 'cli-12',
    nombre: 'Desarrollos Banfield Sur',
    tipo: 'Desarrolladora',
    cuit: '30-71889921-6',
    condicionIVA: 'Responsable Inscripto',
    localidad: 'Banfield',
    contactos: [
      { id: 'cto-16', nombre: 'Paula Riquelme', cargo: 'Gerente de proyectos', telefono: '11 5544-2290', email: 'priquelme@banfieldsur.com.ar' },
    ],
  },
]

export function clientePorId(id: string): Cliente | undefined {
  return CLIENTES.find((c) => c.id === id)
}
